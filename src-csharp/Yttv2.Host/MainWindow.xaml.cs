using System.Windows;
using Microsoft.Web.WebView2.Core;
using Yttv2.Host.Services;
using Yttv2.Host.Bridge;
using System.IO;

namespace Yttv2.Host;

public partial class MainWindow : Window
{
    private DatabaseService _dbService;
    private AppBridge _bridge;

    public MainWindow()
    {
        InitializeComponent();

        // Point to the existing SQLite DB in the project root
        // In dev, it is at ../../../playlists.db relative to bin/Debug/net8.0-windows
        // Hardcoding absolute path for safety in this POC, or using relative
        string dbPath = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "../../../../../playlists.db"));
        
        _dbService = new DatabaseService(dbPath);
        _bridge = new AppBridge(_dbService);

        InitializeAsync();
    }

    private async void InitializeAsync()
    {
        try 
        {
            await MainWebView.EnsureCoreWebView2Async();
            
            // Bridge Injection
            MainWebView.CoreWebView2.AddHostObjectToScript("bridge", _bridge);

            MainWebView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = true;
            MainWebView.CoreWebView2.Settings.IsScriptEnabled = true;
            MainWebView.CoreWebView2.Settings.IsWebMessageEnabled = true;
        }
        catch (System.Exception ex)
        {
            MessageBox.Show($"Error initializing WebView2: {ex.Message}");
        }
    }
}
