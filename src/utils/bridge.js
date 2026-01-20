
/**
 * Hybrid Bridge Abstraction
 * 
 * This module handles communication with the backend.
 * It automatically switches between Tauri (Rust) and C# (WebView2) backends.
 */

// Helper to convert snake_case to PascalCase
// e.g., 'get_all_playlists' -> 'GetAllPlaylists'
function toPascalCase(str) {
    return str
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}

/**
 * Invokes a command on the backend (Tauri or C#)
 * @param {string} command - The command name (in snake_case, e.g., 'get_all_playlists')
 * @param {object} args - The arguments object
 * @returns {Promise<any>} - The result from the backend
 */
export async function invokeCommand(command, args = {}) {
    // Check if we are running in the C# WebView2 Host
    // The 'bridge' object is injected by the C# Host
    const isCSharp = window.chrome?.webview?.hostObjects?.bridge;

    if (isCSharp) {
        try {
            const csharpMethodName = toPascalCase(command);
            const bridge = window.chrome.webview.hostObjects.bridge;

            // C# methods should exist on the bridge object
            // We pass arguments as a single JSON string
            if (typeof bridge[csharpMethodName] !== 'function') {
                // Some methods might not be implemented yet on the C# side
                console.warn(`[Bridge] Method ${csharpMethodName} not found on C# bridge.`);
                // For now, we might want to fall back or throw, but let's try to call it and let it fail if missing
            }

            console.log(`[Bridge] Calling C#: ${csharpMethodName}`, args);

            // Ensure args is NOT null/undefined, pass empty object as string if so
            const jsonArgs = JSON.stringify(args || {});

            // Call the C# method. It is expected to return a JSON string
            const resultJson = await bridge[csharpMethodName](jsonArgs);

            // Parse the result
            if (!resultJson) return null;
            return JSON.parse(resultJson);

        } catch (error) {
            console.error(`[Bridge] C# Error for ${command}:`, error);
            throw error;
        }
    } else {
        // Fallback to Tauri
        // We dynamically import to avoid loading Tauri scripts in C# environment if possible
        // (though strictly speaking the package might be bundled, but 'invoke' checks for window.__TAURI__)
        try {
            const { invoke } = await import('@tauri-apps/api/core');
            // console.log(`[Bridge] Calling Tauri: ${command}`, args);
            return await invoke(command, args);
        } catch (error) {
            console.error(`[Bridge] Tauri Error for ${command}:`, error);
            throw error;
        }
    }
}
