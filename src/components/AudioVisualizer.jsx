import React, { useEffect, useRef, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { mapFrequencyToBars, smoothBarValues } from '../utils/audioProcessor';
import { fft, util } from 'fft-js';

/**
 * AudioVisualizer - Circular audio visualizer matching Rainmeter VisBubble widget
 * 
 * Exact settings from Rainmeter:
 * - 113 bars in full circle (360°)
 * - Starts at 270° (bottom), rotates clockwise
 * - Bars extend outward
 * - White color, 4px width
 * - 76px base radius + 76px max extension
 * - FFT 2048, 60Hz-11kHz range
 * - 40 FPS (25ms updates)
 */
const AudioVisualizer = ({
  enabled = false,
  orbSize = 154,
  barCount = 113,
  barWidth = 4,
  radius = 76,
  radiusY = 76,
  maxBarLength = 76,
  minBarLength = 7,
  colors = [255, 255, 255, 255], // White RGBA
  smoothing = 0,
  angleTotal = Math.PI * 2, // 360°
  angleStart = -Math.PI / 2, // 270° (bottom)
  clockwise = true,
  inward = false,
  fftSize = 2048,
  freqMin = 60,
  freqMax = 11000,
  sensitivity = 64,
  updateRate = 25, // 25ms = 40 FPS
}) => {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const barValuesRef = useRef(null);
  const previousBarValuesRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const sampleRateRef = useRef(48000); // Default, will be updated from audio data
  const audioDataQueueRef = useRef([]); // Queue for audio samples
  const processingIntervalRef = useRef(null);
  const lastProcessTimeRef = useRef(0);
  const isCapturingRef = useRef(false); // Track capture state for cleanup

  // Initialize sample rate (will be updated from audio data)
  useEffect(() => {
    if (!enabled) return;
    // Sample rate will be updated when we receive audio data
    // Default to 48000 Hz (common for Windows audio)
    sampleRateRef.current = 48000;
  }, [enabled]);

  // Start/stop audio capture
  useEffect(() => {
    let mounted = true;

    const manageCapture = async () => {
      if (!enabled) {
        // Stop capture
        if (isCapturingRef.current) {
          console.log('[AudioVisualizer] Stopping audio capture...');
          try {
            await invoke('stop_audio_capture');
            if (mounted) {
              isCapturingRef.current = false;
              setIsCapturing(false);
            }
          } catch (error) {
            console.error('[AudioVisualizer] Error stopping capture:', error);
          }
        }
        return;
      }

      // Always try to stop first to ensure clean state
      if (isCapturingRef.current) {
        console.log('[AudioVisualizer] Stopping existing capture before restart...');
        try {
          await invoke('stop_audio_capture');
        } catch (error) {
          // Ignore errors if not running
          console.log('[AudioVisualizer] Stop error (may be expected):', error);
        }
        isCapturingRef.current = false;
        setIsCapturing(false);
        // Small delay to ensure cleanup
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Start capture
      if (!mounted) return;

      try {
        console.log('[AudioVisualizer] Starting audio capture...');

        // Test command invocation first
        try {
          const testResult = await invoke('test_audio_command');
          console.log('[AudioVisualizer] Test command result:', testResult);
        } catch (testError) {
          console.error('[AudioVisualizer] Test command failed:', testError);
        }

        await invoke('start_audio_capture');
        if (mounted) {
          isCapturingRef.current = true;
          setIsCapturing(true);
          console.log('[AudioVisualizer] Audio capture started successfully');
        }
      } catch (error) {
        console.error('[AudioVisualizer] Failed to start audio capture:', error);
        if (mounted) {
          isCapturingRef.current = false;
          setIsCapturing(false);
        }
      }
    };

    manageCapture();

    return () => {
      mounted = false;
      if (isCapturingRef.current) {
        console.log('[AudioVisualizer] Stopping audio capture (cleanup)...');
        invoke('stop_audio_capture').catch(console.error);
        isCapturingRef.current = false;
        setIsCapturing(false);
      }
    };
  }, [enabled]);

  // Listen to audio data events and process
  useEffect(() => {
    if (!enabled) return;

    let unlisten = null;
    let eventCount = 0;

    const setupListener = async () => {
      try {
        console.log('[AudioVisualizer] Setting up audio data listener...');
        unlisten = await listen('audio-data', (event) => {
          // Log first event to confirm listener is working
          if (eventCount === 0) {
            console.log('[AudioVisualizer] ✅ FIRST AUDIO EVENT RECEIVED!', {
              payloadType: typeof event.payload,
              isArray: Array.isArray(event.payload),
              length: event.payload?.length,
              payload: event.payload?.slice ? event.payload.slice(0, 5) : event.payload
            });
          }

          const samples = event.payload; // Array of f32 samples

          if (!samples || !Array.isArray(samples) || samples.length === 0) {
            console.warn('[AudioVisualizer] Invalid samples:', samples);
            return;
          }

          eventCount++;
          if (eventCount === 1 || eventCount % 100 === 0) {
            const maxSample = Math.max(...samples.map(s => Math.abs(s)));
            console.log('[AudioVisualizer] Received', eventCount, 'audio events,', samples.length, 'samples, max:', maxSample.toFixed(4), 'queue size:', audioDataQueueRef.current.length);
          }

          // Add samples to queue
          audioDataQueueRef.current.push(...samples);

          // Keep queue size reasonable (last 2 seconds of audio at 48kHz = 96000 samples)
          const maxQueueSize = 96000;
          if (audioDataQueueRef.current.length > maxQueueSize) {
            audioDataQueueRef.current = audioDataQueueRef.current.slice(-maxQueueSize);
          }
        });
        console.log('[AudioVisualizer] Audio listener set up successfully, waiting for events...');

        // Set a timeout to warn if no events are received
        setTimeout(() => {
          if (eventCount === 0) {
            console.warn('[AudioVisualizer] ⚠️ No audio events received after 2 seconds. Check Rust console for audio capture logs.');
          }
        }, 2000);
      } catch (error) {
        console.error('[AudioVisualizer] Failed to set up audio listener:', error);
      }
    };

    setupListener();

    // Process audio queue periodically using direct FFT computation
    const processAudio = () => {
      const now = Date.now();
      if (now - lastProcessTimeRef.current < updateRate) {
        return;
      }
      lastProcessTimeRef.current = now;

      // Need at least fftSize samples to process
      if (audioDataQueueRef.current.length < fftSize) {
        if (audioDataQueueRef.current.length > 0) {
          console.log('[AudioVisualizer] Queue has', audioDataQueueRef.current.length, 'samples, need', fftSize);
        }
        return;
      }

      try {
        // Take enough samples for FFT (fftSize samples)
        const samplesToProcess = audioDataQueueRef.current.splice(0, fftSize);

        // Log sample stats occasionally
        if (Math.random() < 0.05) { // ~5% chance per frame (every ~500ms at 40fps)
          const maxInput = Math.max(...samplesToProcess.map(Math.abs));
          console.log(`[AudioVisualizer] Processing frame. Max Input: ${maxInput.toFixed(4)}, Queue left: ${audioDataQueueRef.current.length}`);
        }

        // Apply window function (Hanning window) to reduce spectral leakage
        const windowed = new Float32Array(fftSize);
        for (let i = 0; i < fftSize; i++) {
          const window = 0.5 * (1 - Math.cos(2 * Math.PI * i / (fftSize - 1)));
          windowed[i] = samplesToProcess[i] * window;
        }

        // Compute FFT using fft-js
        const phasors = fft(Array.from(windowed));

        // Get magnitudes using utility function
        const magnitudes = util.fftMag(phasors);

        // Convert to frequency data (0-255 range)
        // Only use first half (Nyquist frequency)
        const frequencyBinCount = fftSize / 2;
        const frequencyData = new Uint8Array(frequencyBinCount);

        let maxFreqVal = 0;
        for (let i = 0; i < frequencyBinCount; i++) {
          // Scale magnitude to 0-255 range
          // Adjust scale factor based on typical audio levels (may need tuning)
          const normalized = Math.min(255, Math.round(magnitudes[i] * 100)); // Increased scaling factor from 0.01 to 100 to test sensitivity
          frequencyData[i] = normalized;
          if (normalized > maxFreqVal) maxFreqVal = normalized;
        }

        if (maxFreqVal > 0 && Math.random() < 0.1) {
          console.log(`[AudioVisualizer] Non-zero freq data! Max: ${maxFreqVal}`);
        }

        // Map to bars
        const barValues = mapFrequencyToBars(
          frequencyData,
          barCount,
          freqMin,
          freqMax,
          sampleRateRef.current
        );

        // Apply smoothing if enabled
        const smoothed = smoothBarValues(
          barValues,
          previousBarValuesRef.current,
          smoothing
        );

        // Apply sensitivity
        const adjusted = new Uint8Array(smoothed.length);
        let maxBarVal = 0;
        for (let i = 0; i < smoothed.length; i++) {
          const val = Math.min(255, Math.round(smoothed[i] * (sensitivity / 64)));
          adjusted[i] = val;
          if (val > maxBarVal) maxBarVal = val;
        }

        if (maxBarVal > 0 && Math.random() < 0.1) {
          console.log(`[AudioVisualizer] Bars updated! Max bar: ${maxBarVal}`);
        }

        barValuesRef.current = adjusted;
        previousBarValuesRef.current = smoothed;
      } catch (e) {
        console.error('[AudioVisualizer] Error processing audio:', e);
      }
    };

    // Process audio every updateRate ms
    processingIntervalRef.current = setInterval(processAudio, updateRate);

    return () => {
      if (unlisten) {
        unlisten();
      }
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current);
      }
    };
  }, [enabled, barCount, freqMin, freqMax, sensitivity, smoothing, fftSize, updateRate]);

  // Rendering loop
  useEffect(() => {
    if (!enabled || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size
    const totalRadius = radius + maxBarLength;
    const canvasSize = totalRadius * 2 + 20; // Extra padding
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;

    // Parse color
    const parseColor = (color) => {
      if (Array.isArray(color)) {
        const [r, g, b, a = 255] = color;
        return `rgba(${r},${g},${b},${a / 255})`;
      }
      return color;
    };

    const strokeColor = parseColor(colors);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!barValuesRef.current) {
        // Draw test pattern when no data (so visualizer is visible)
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = barWidth;
        for (let i = 0; i < barCount; i++) {
          const barIndex = clockwise ? i : (barCount - 1 - i);
          const angle = angleStart + (angleTotal / barCount) * barIndex;
          const normalizedAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

          // Draw minimum length bar so it's visible
          const baseX = centerX + radius * Math.cos(normalizedAngle);
          const baseY = centerY + radiusY * Math.sin(normalizedAngle);
          const endX = baseX + minBarLength * Math.cos(normalizedAngle);
          const endY = baseY + minBarLength * Math.sin(normalizedAngle);

          ctx.beginPath();
          ctx.moveTo(baseX, baseY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
        animationFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      const barValues = barValuesRef.current;

      // Draw each bar
      for (let i = 0; i < barCount; i++) {
        // Calculate angle
        const barIndex = clockwise ? i : (barCount - 1 - i);
        const angle = angleStart + (angleTotal / barCount) * barIndex;
        const normalizedAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

        // Get bar value (0-255)
        const value = barValues[i] || 0;
        const normalizedValue = value / 255; // 0-1

        // Calculate bar length
        const barLength = minBarLength + (normalizedValue * (maxBarLength - minBarLength));

        // Base position (at radius)
        const baseX = centerX + radius * Math.cos(normalizedAngle);
        const baseY = centerY + radiusY * Math.sin(normalizedAngle);

        // End position (extended)
        const endX = baseX + barLength * Math.cos(normalizedAngle);
        const endY = baseY + barLength * Math.sin(normalizedAngle);

        // Draw bar
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = barWidth;
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }

      // Schedule next frame
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, barCount, barWidth, radius, radiusY, maxBarLength, minBarLength, colors, angleTotal, angleStart, clockwise]);

  if (!enabled) {
    return null;
  }

  const totalRadius = radius + maxBarLength;
  const canvasSize = totalRadius * 2 + 20;

  return (
    <canvas
      ref={canvasRef}
      className="absolute pointer-events-none"
      style={{
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 5, // Below orb buttons (z-50) but above background
        width: `${canvasSize}px`,
        height: `${canvasSize}px`,
      }}
    />
  );
};

export default AudioVisualizer;
