# Explore Rice with Michael

Michael Gonzalez McNeil’s personal portfolio, with a playable, stylized Rice University campus at `/campus` and an accessible HTML portfolio at `/portfolio`. The original RiceWalk site remains at `/`.

## Run locally

Node.js 24 is recommended (the tests use native TypeScript stripping).

```sh
npm ci
npm run dev -- --hostname 127.0.0.1 --port 3020
```

Open http://127.0.0.1:3020/campus.

Production preview:

```sh
npm run build
npm run preview
```

Open http://127.0.0.1:3021/campus. `PORT=3025 npm run preview` selects another port. This is a static export: no application backend, accounts, or paid APIs are needed. The preview server binds only to localhost.

## Verify

```sh
npm run typecheck
npm test
npm run build
npm run test:browser
```

The last command serves the production export with a local-only QA harness at http://127.0.0.1:3021/__qa. It drives real input events through the game and can inject storage/WebGL failures. The harness and fault injection are **not** in the exported site. Run after building; avoid rebuilding while a browser test is using `out/`.

## Controls

- WASD / arrows: screen-relative movement
- Shift / touch Run: faster movement
- Sound: mute or enable synthesized footsteps
- E / touch Interact: open nearby exhibit
- Escape: close dialog
- Drag the mobile joystick; release to stop
- Reset position: return to Lovett Hall, keeping owl progress
- Portfolio and Contact are always available

Three optional owls are the only mini-game. YardOS is a fictional drone concept exhibit, not a drone-control mini-game or a launched product.

## Content & geography

No résumé was included in the original project. Education, employment, skills, and leadership claims await verified details. Site technologies describe this implementation only. Shared exhibit copy lives in `components/campus/content.tsx`; map geometry and collision data live in `components/campus/world.ts`.

Campus relationships follow Rice’s public maps. Walking distances, landscaping, and silhouettes are simplified; this is not a navigation map or an official Rice product. Sources and asset credits are in `MORNING_REPORT.md` and `/portfolio#sources`.

The TypeScript project checks the Next.js entry points and their complete import graph. Unused UI/Vite scaffolding in the original workspace is outside this application and is not included in the new repository.
