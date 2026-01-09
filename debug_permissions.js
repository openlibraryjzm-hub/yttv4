const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('src-tauri/gen/schemas/acl-manifests.json', 'utf8'));

const mpvPermissions = manifest['tauri-plugin-mpv']?.permissions;

if (mpvPermissions) {
    console.log('MPV Permissions:');
    for (const [key, value] of Object.entries(mpvPermissions)) {
        console.log(`Permission: mpv:${key}`);
        console.log('  Description:', value.description);
        if (value.commands && value.commands.allow) {
            console.log('  Allowed Commands:', value.commands.allow);
        }
        console.log('---');
    }
} else {
    console.log('No MPV permissions found in manifest.');
    // Check keys to see if plugin name is different
    console.log('Available plugins:', Object.keys(manifest));
}
