using System;

namespace Yttv2.Host.Models;

public class Playlist
{
    public long Id { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public string CreatedAt { get; set; } = "";
    public string UpdatedAt { get; set; } = "";
    public string? CustomAscii { get; set; }
    public string? CustomThumbnailUrl { get; set; }
}

public class PlaylistItem
{
    public long Id { get; set; }
    public long PlaylistId { get; set; }
    public string VideoUrl { get; set; } = "";
    public string VideoId { get; set; } = "";
    public string? Title { get; set; }
    public string? ThumbnailUrl { get; set; }
    public int Position { get; set; }
    public string AddedAt { get; set; } = "";
    public bool IsLocal { get; set; }
    public string? Author { get; set; }
    public string? ViewCount { get; set; }
    public string? PublishedAt { get; set; }
}
