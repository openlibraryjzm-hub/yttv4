using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Yttv2.Host.Models;
using Yttv2.Host.Services;
using Newtonsoft.Json; // We need basic JSON serialization, can use System.Text.Json too

namespace Yttv2.Host.Bridge;

// This class is exposed to JavaScript
[ClassInterface(ClassInterfaceType.AutoDual)]
[ComVisible(true)]
public class AppBridge
{
    private readonly DatabaseService _dbService;

    public AppBridge(DatabaseService dbService)
    {
        _dbService = dbService;
    }

    // Example Method: Matches the React call name roughly
    // In React: window.chrome.webview.hostObjects.bridge.GetAllPlaylists()
    
    public string GetAllPlaylists()
    {
        try 
        {
            var playlists = _dbService.GetAllPlaylists();
            return JsonConvert.SerializeObject(playlists); // React expects JSON string if we do it this way, or we can return object[]
        }
        catch (Exception ex)
        {
            return $"Error: {ex.Message}";
        }
    }
}
