LOCAL SKY STUDIO — WINDOWS DESKTOP APP

Created by Dean Freeman
Contact: deanfreeman9@gmail.com

RUN DURING DEVELOPMENT

1. Install Node.js 22 or newer.
2. Run: npm install
3. Run: npm start

The desktop window uses only bundled files. The older browser/server version is
still available with: npm run start:web

CREATE A WINDOWS INSTALLER

Run: npm run dist:win

The installer is written to dist/Local-Sky-Studio-Setup-<version>.exe. Users can
install it without installing Node.js.

ENABLE SAFE AUTOMATIC UPDATES

Updates are intentionally disabled for the private GitHub Releases repository.
This prevents users seeing update buttons that cannot authenticate successfully.

1. The private repository is DeanFreeman9/local-sky-studio.
2. Keep update-config.json disabled while releases are private. Do not embed a
   GitHub token in the app; users could extract it and access the repository.
3. Increase package.json "version" for every release (for example, 1.0.0 to
   1.0.1), then rebuild the installer.
4. Publish every file generated for that version in dist, especially the .exe,
   latest.yml and its .blockmap file, in one GitHub Release.

For automated publishing, create a GitHub personal access token with permission
to publish releases, set it as the GH_TOKEN environment variable, and run:
npm run release:win. Never put the token in .env or commit it to the project.

Installed builds check shortly after launch. If GitHub reports a newer version,
the app shows a Download update button. It downloads only after the user clicks,
then shows Restart and install. Development builds never check for updates.

For public distribution, sign the Windows installer and application with a
trusted code-signing certificate. Unsigned apps may trigger Microsoft
SmartScreen warnings, and signing is strongly recommended before relying on
automatic updates for end users.

WEB VERSION

Run npm run start:web, then open http://localhost:3000. The map and exports run
locally and do not use a Google API, API key, billing account, or external
location lookup.

Milky Way shading uses the bundled D3 library and D3-Celestial mw.json data.
