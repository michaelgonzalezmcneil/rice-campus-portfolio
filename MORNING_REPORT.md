# Morning report — Rice campus portfolio

## Status

The playable campus is implemented and the final production export passed release checks. Nothing has been deployed or purchased.

Private repository (initial release pushed to `main`): https://github.com/michaelgonzalezmcneil/rice-campus-portfolio

## Completed

- Next.js/React integration at `/campus`; prominent “Explore Rice” links on the existing home page.
- Original RiceWalk at `/`; conventional, server-rendered portfolio at `/portfolio`.
- Opening screen, angled orthographic camera, screen-relative WASD/arrows, touch joystick, interaction button, collisions, camera tracking, reset, live minimap, accessible native dialogs, Escape dismissal, movement pause while reading, reduced-motion support.
- Lovett Hall/Sallyport, Academic Quadrangle, Fondren, Brochstein Pavilion, Duncan Hall, O’Connor engineering silhouette, and a compressed north-college walk to Duncan College. Architectural vocabulary includes arches, campanile, library arcade, pavilion trellis, engineering columns, and college courtyard.
- Five portfolio stops and three optional owl collectibles, completion panel, replay, and guarded local progress storage.
- Clearly fictional YardOS drone exhibit. It is the only drone content; no separate drone mini-game is included.
- Rendering failure/context-loss fallback and a direct portfolio alternative available during loading.
- Static boxes and trees use instanced meshes. 3D code loads separately from the plain portfolio. Pixel ratio is capped at 1.5; a single 1024px shadow map is used.

## Verified results

- Final clean production build/static export passed: 103 static pages, including Next.js TypeScript validation. It ran in `/tmp/rice-campus-release-check` to avoid iCloud read stalls; the verified export was copied back to this workspace’s `out/`.
- Standalone `npm run typecheck` passed after scoping the project to actual Next.js entry points and imported dependencies.
- `npm test`: 5 tests passed. Checks spawn/exhibit/owl walkability, flood-fill reachability for every exhibit and owl, wall sliding, anti-tunnelling, Sallyport passage, world bounds, and interaction proximity.
- Production browser walking harness: all five exhibits reached using keyboard events (no teleporting), each opened with E, each paused movement, each closed.
- Final production browser journey: all three owls collected, completion appeared, reload restored 3/3, reset returned to `(20,10)`. A second full hunt completed; Restart cleared all owls and saved progress and restored spawn. The harness accounts for the automatic completion dialog pausing movement.
- Direct portfolio menu: every exhibit opened without starting the game; Escape closed all five.
- Sustained WASD and arrow input passed; minimap location changed with movement.
- Native browser drag exercised joystick movement; mobile Interact opened the welcome panel.
- Desktop 1280×720 and 1280×900, mobile 390×844, and narrow 320×740 layouts inspected. Final mobile icon controls have explicit accessible names. The plain portfolio had no horizontal overflow at 320px. Touch movement stopped on release; Interact opened its panel.
- Denied localStorage: start, walk, collect, and read/write error recovery passed; correct session-only notice appeared.
- No WebGL: fallback shown. Forced renderer-construction error: fallback shown. Actual context loss using `WEBGL_lose_context`: fallback shown.
- Forced 3D chunk download failure reached the fallback. A fresh normal session had no console errors (one upstream deprecation warning).
- The plain portfolio opened from the fallback and contained all five exhibit sections and source links.
- Contact links inspected: `mailto:mg188@rice.edu`. No email was sent and mail-client handoff is not claimed as tested.
- Existing home page loaded and its prominent campus links point to `/campus`.

Evidence: `release/final-journey-results.txt`, `release/journey-results.txt`, `release/menu-results.json`, `release/storage-results.txt`, `release/touch-results.txt`, `release/normal-console.json`, and `release/screenshots/`.

## Performance observations

These are rolling 120-frame observations from the in-app Chromium browser, not controlled cross-device benchmarks:

- Before static-box batching: 60 fps, 389 draw calls, 10,098 triangles at the starting scene with owls present (1280×720).
- After batching: 74 calls, 10,662 triangles with owls present; one sample was 49 fps while builds were running.
- Production export, all owls already collected: 60 fps, 53 calls, 9,658 triangles (1280×900).

Batching materially reduced draw submissions. These samples do not establish a measured fps improvement. No physical mobile GPU, battery, memory, or network benchmark was performed.

## Campus sources and asset credits

References accessed September 29, 2026:

1. Rice official campus-map landing page: https://www.rice.edu/campus-maps
2. Rice-hosted 2021 printable map, inspected as a rendered image: https://space.rice.edu/ReachForTheStars/pdf/RFTS_map.pdf
3. Rice Elimelech Research Group’s O’Connor-area map, visually inspected: https://elimelechlab.rice.edu/contact/ and https://elimelechlab.rice.edu/files/2025/02/image.jpg
4. Rice Engineering facilities list: https://engineering.rice.edu/about/facilities-buildings
5. Rice News Fondren exterior photograph, visually inspected: https://news.rice.edu/sites/g/files/bxs2656/files/2021-08/Fondren_Exterior2005_013.jpeg
6. Brochstein architectural imagery/reference: https://www.thomasphifer.com/projects/rice-university-brochstein-pavilion
7. Residential-college architecture and courtyard references: https://www.hopkins.co.uk/projects/education/rice-university/
8. Rice Facilities historical building descriptions: https://facilities.rice.edu/construction/the-first-100-years
9. Duncan Hall’s relation to the engineering quad and Lovett vista: https://www.cs.rice.edu/~keith/DuncanHall/plan.html

Campus-grid relationships: Lovett is at the Main Street end of the Academic Quad, Fondren is opposite it, and Brochstein is beyond Fondren toward the Central Quad. Engineering lies toward Rice Boulevard; Duncan College is beyond the engineering area near the north boundary. The game’s map aligns to the campus grid, with true north approximately upper-right. Duncan College and Duncan Hall are distinct locations. Distances and routes are compressed, omitted buildings are numerous, and recent construction/landscape changes are not fully represented.

All game geometry, character, owl, drone, and sign textures are original procedural work. No reference photos, map tiles, proprietary 3D models, or paid-service assets are shipped. Reference photos retain their owners’ copyright. Existing Google Fonts typography is reused (Newsreader, Manrope, DM Mono; open font licenses) with local fallback fonts. Lucide icons use the ISC license; Three.js and React Three Fiber use MIT licenses. Dependency licenses remain in installed packages.

## Limitations and environment issues

- No résumé or verified personal degree/employment/leadership details were supplied in this project. Their exhibit sections say so; no achievements, metrics, roles, or external project URLs were invented.
- The campus is a compressed stylization, not a survey or real-world wayfinding tool. Portfolio placements are fictional and do not imply employer offices or Rice endorsement.
- The original RiceWalk’s media/routes remain a concept, with placeholder walking times. Static route generation was corrected to include the listed colleges rather than only Duncan.
- Browser logs include an upstream Three.js Clock deprecation from React Three Fiber. Forced-failure tests intentionally generate renderer errors; early harness errors were corrected before successful reruns.
- The local Documents folder contains iCloud dataless placeholders. Dependency/source reads sometimes stalled for minutes. The machine also had about 1.4 GiB available. Dependencies were regenerated, files were hydrated, and a temporary clean-build copy was prepared outside Documents. No unrelated user files were removed.
- A preserved old lockfile (`package-lock.before-release.json`) remains local and is not part of the new repository. Unused original UI/Vite files and unrelated workspace folders are preserved locally, outside the new repo’s staged application files.
- Testing used desktop Chromium with viewport overrides and pointer input. No physical iOS/Android or Safari testing is claimed.

## Preview

The final production preview is running at http://127.0.0.1:3025/campus (`PORT=3025 npm run preview`).

From this project:

```sh
npm ci
npm run dev -- --hostname 127.0.0.1 --port 3020
```

Open http://127.0.0.1:3020/campus. Plain portfolio: http://127.0.0.1:3020/portfolio.

For the production export:

```sh
npm run build
npm run preview
```

Open http://127.0.0.1:3021/campus. To use another port: `PORT=3025 npm run preview`.

Node.js 24 recommended. No backend/login/API keys required. `npm run test:browser` exposes a localhost-only QA harness at `/__qa`; the QA harness is not shipped in `out/`.
