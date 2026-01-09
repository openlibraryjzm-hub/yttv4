const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('src-tauri/gen/schemas/acl-manifests.json', 'utf8'));

const mpvPermissions = manifest['mpv']?.permissions;

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
    console.log('Available plugins:', Object.keys(manifest));
}
