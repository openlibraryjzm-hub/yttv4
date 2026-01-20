using System;
using System.Collections.Generic;
using Microsoft.Data.Sqlite;
using Yttv2.Host.Models;

namespace Yttv2.Host.Services;

public class DatabaseService
{
     private readonly string _connectionString;

     public DatabaseService(string dbPath)
     {
         var connectionStringBuilder = new SqliteConnectionStringBuilder
         {
             DataSource = dbPath
         };
         _connectionString = connectionStringBuilder.ToString();
         
         // In a real app we would call EnsureSchema() here
     }

     private SqliteConnection GetConnection()
     {
         return new SqliteConnection(_connectionString);
     }

     public List<Playlist> GetAllPlaylists()
     {
         var playlists = new List<Playlist>();

         using (var connection = GetConnection())
         {
             connection.Open();
             
             // Simple check if table exists first, to avoid crashing on launch if schema not applied
             // But for now assuming table exists because we point to existing DB
             
             var command = connection.CreateCommand();
             command.CommandText = @"
                 SELECT id, name, description, created_at, updated_at, custom_ascii, custom_thumbnail_url 
                 FROM playlists 
                 ORDER BY created_at DESC";

             using (var reader = command.ExecuteReader())
             {
                 while (reader.Read())
                 {
                     playlists.Add(new Playlist
                     {
                         Id = reader.GetInt64(0),
                         Name = reader.GetString(1),
                         Description = reader.IsDBNull(2) ? null : reader.GetString(2),
                         CreatedAt = reader.IsDBNull(3) ? "" : reader.GetString(3),
                         UpdatedAt = reader.IsDBNull(4) ? "" : reader.GetString(4),
                         CustomAscii = reader.IsDBNull(5) ? null : reader.GetString(5),
                         CustomThumbnailUrl = reader.IsDBNull(6) ? null : reader.GetString(6)
                     });
                 }
             }
         }

         return playlists;
     }

     // TODO: Port the rest of the read methods...
}
