# Rain in motion

The Rain breakdance project owned by **Sector Animation Studio**. The site presents the complete 34.5-second performance with “Hip Hop 1” by Jason Shaw / Audionautix, with Sector Orbit and Sector Prism playback and an editable project download.

Repository: https://github.com/Sector-Animation-Studio/rain-project

GitHub Pages publishes the site from this repository's `main` branch through the included deployment workflow. The source and hosting belong to the organisation.

## Open the editable project

Open `project/project.studio.json` in Sector, keeping the adjacent `project/assets/` folder. Both the original Rain GLB and the local music WAV are included. The project retains 1,035 frames at 1920 × 1080 and 30 fps. Its save/reopen and asset availability checks passed before this copy was made; verification checks the retained file hashes.

The published site offers `downloads/Rain-Sector-project-hiphop-v1.zip`, containing the same project and assets, source records and credits. Extract it before opening the JSON in Sector. A Sector installation is required to edit it.

## Build and check

```sh
npm ci
npm run build
npm run check
npm run preview
```

Preview: `http://127.0.0.1:4188/rain-project/`. For browser verification, run `npm run test:browser`; Windows uses Edge and CI uses Chromium. Build output is `dist/`. The build creates the portable ZIP and preserves the native film and project bytes. It has no dependency on the original desktop or studio website checkout.

GitHub Pages uses the Deploy Rain workflow with a `github-pages` environment. Pushes to `main` validate, build and deploy. No Cloudflare connection or custom domain is required.

## Credits and limits

**Rain Rig (CC) Blender Foundation | studio.blender.org** — CC BY 4.0. Sector GLB conversion and sequence-specific motion preparation are adaptations. **“Hip Hop 1” by Jason Shaw / Audionautix** — CC BY 4.0; source seconds 16–50.5 were trimmed, level adjusted and faded. **CMU 85_12** motion retains its recorded copy/modify/redistribute permission and restriction on direct resale of original or converted motion data. See [CREDITS.txt](CREDITS.txt), [asset licences](licences/README.md) and [source provenance](PROVENANCE.json).

Both native film streams were retained; the replacement soundtrack was mixed from the saved project through Sector. The final source films passed full decoding and measure −16.25 LUFS integrated and −2.64 dBTP. Shoulder/hip deformation and some weight transfer remain limited. The owner's acceptance and deployment request do not establish a general physical simulation or a completed character-quality qualification.

Website code and Sector branding remain copyright Sector Animation Studio. The third-party project and media retain their separate licences; this repository does not relicense them.
