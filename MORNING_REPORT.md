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
- Clearly fictional YardOS drone exhibit, now including an optional scan-comparison game. No drone flight-control mini-game is included.
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


## Architectural refinement — September 29, 2026

### Implemented

- Rebuilt Lovett’s silhouette around the raised central Sallyport facade, concentric stone arch, paired upper arcades, cream masonry bands, small parapet pinnacles, and terracotta wing roofs. Removed the earlier generic off-center tower.
- Reworked Fondren’s stepped brick mass, three tall central window bays, stone cornices, and recessed seven-bay arcade.
- Brochstein now has a two-direction white trellis, slender glazing mullions, roof lights, terrace tables/chairs, planting edges, and a narrow water surface in the existing fountain footprint.
- Duncan College has repeated paired window bays, exposed trim, a shaded courtyard edge, pitched roof details, and a clear central courtyard walk. It remains a compressed abstraction of the north-college architecture.
- Broad, clustered oak canopies replace pointed single crowns. Quad-edge tree rows, benches facing lawns, lamps beside paths, and facade name plaques give the campus more deliberate detail. No decoration is randomly placed.
- Relative positions were checked again against the Rice-hosted printable map: Lovett and Fondren face each other across the Academic Quad; Brochstein is beyond Fondren; Duncan College sits beyond Duncan Hall in the north-college area. Building footprints and exhibit coordinates are retained. Furniture footprints participate in collisions; roofs and masonry details stay above or within existing building footprints.

### Verification

- Production build passed with 103 static pages and TypeScript validation; standalone typecheck and all 5 collision/reachability tests passed.
- Browser views inspected at Lovett, Fondren, Brochstein, and Duncan; a 390×844 mobile view was also inspected. Before/after and landmark screenshots are saved under `release/screenshots/refinement-*.png`. No console errors were observed in the refined preview.
- Full input-driven journey passed: all five exhibit approaches, open/pause/close, all three owls, completion, reload persistence, reset, and replay (`release/refinement-journey-results.txt`). Visual inspection then found two oaks intersecting Duncan’s wings; these were moved and the rear courtyard facade completed. The final build and all 5 tests passed again; the Duncan walk, exhibit opening, and Escape closing were retested successfully.
- At the starting view in the in-app Chromium browser (1280×720, all owls present), one rolling 120-frame sample measured **60 fps, 61 draw calls, 56,650 triangles**. This is an observation, not a cross-device benchmark. More detailed arches use the existing shared box instance buffer; trunks, branches, and canopy clusters each use instanced geometry. The existing pixel-ratio cap and single 1024px shadow map remain.

### Additional reference inspection and credits

- Rice official map index: https://www.rice.edu/campus-maps and the previously listed Rice-hosted printable map (rendered and inspected again). The user’s attached campus illustrations were also used for spatial and art-direction context.
- Lovett’s central facade, Sallyport, masonry, and arcades: official Rice photograph, visually inspected: https://graduate.rice.edu/sites/g/files/bxs3106/files/2024-12/rice-university-210464_1280.jpg
- Fondren’s brick mass and stone arcade: the Rice News exterior photo listed above, visually inspected again. Official placement confirmation: https://www.library.rice.edu/content/getting-fondren-library
- Brochstein’s trellis and roof lights: architect’s photograph, visually inspected: https://www.thomasphifer.com/uploads/project-images/RB-SF-01.jpg . Official west-of-Fondren placement: https://news2.rice.edu/2007/09/05/new-pavilion-to-carry-brochstein-name/
- North-college materials, courtyard edge, and modular windows: https://www.hopkins.co.uk/projects/education/rice-university/ and its photograph https://www.hopkins.co.uk/assets/uploads/rice-n358.jpg (visually inspected).

All additions are original procedural geometry. Reference photographs are not bundled; their copyright remains with the respective owners. The models intentionally simplify exact bay counts, interior spaces, and landscape geometry; this is still a stylized campus rather than an architectural survey.


## Movement and camera polish — September 29, 2026

### Changes

- Exponential acceleration and braking, normalized combined keyboard/analog input, shortest-angle character turning, and distance-driven arm/leg animation with subtle body bob. Walking is 8.5 world units/second; Shift or the touch Run toggle increases this to 14. The joystick has a small center dead zone.
- Circular player collision against rectangular obstacles replaces square corner checks. Substeps and normal projection allow sliding around corners while preserving building and furniture boundaries.
- The fixed elevated camera follows with frame-rate-aware smoothing, without bobbing, shaking, or zoom pulses. It stays above the highest geometry. A local dithered cutaway on the camera-to-player sightline reveals the character through buildings, roofs, trunks, and oak canopies while retaining instanced rendering.
- Quiet synthesized footfalls unlock after interaction. Sound toggles mute with a short gain ramp. Footsteps follow distance actually walked, so pushing into a wall does not keep producing steps. No external audio assets were added.
- Inputs and velocity clear on panels, blur, visibility changes, resize, pointer cancellation, and lost capture. Reset also clears run mode, stick state, heading, stride, and camera lag. Prompts update at roughly 20 Hz. Closing a dialog returns focus to the game.
- Reduced motion disables limb swing, body bob, decorative drone movement, CSS transitions, and camera easing. Fixed an existing stale reduced-motion prop on the drone.

### Verification

- Final production build: 103 static pages. Standalone TypeScript check and all **7 tests** passed, including acceleration/braking, diagonal normalization, walk/run speed, frame-rate comparison, rounded-corner sliding, reachability, and tunnelling checks.
- Browser input lifecycle passed: acceleration and deceleration, Shift running, blur/resize/visibility event recovery, panel pause and resumed movement, reset with zero velocity, and mute. Observed speed samples: walk 8.49, run 13.94 world units/second; these are game-state readings, not rendering benchmarks.
- Full input-driven journey passed for all exhibits, all owls, completion, reload persistence, reset, and replay. Evidence: `release/movement-journey.txt`, `release/movement-lifecycle.txt`, and the passing final rerun in `release/movement-lifecycle-final.txt`. One fixed-duration Shift sample fell below its test threshold while multiple preview tabs were active; the same final build passed an immediate rerun (13.95 versus 8.49 walk speed). The deterministic speed test passed throughout.
- Touch tests passed: release, Interact, pointercancel, lostpointercapture, Run, reset during an active drag, and panel/new-pointer recovery (`release/movement-touch.txt`). Native browser joystick drag after an actual viewport resize also moved the character; reset restored `(20,10)`.
- Sallyport center was reached by walking. Its occluding masonry cutaway was visually inspected and saved in `release/screenshots/movement-sallyport.png`. Final mobile controls were inspected at 390×844 (`movement-mobile.png`).
- Final desktop rendering observation: 60 fps, 65 draw calls, 56,698 triangles over 120 frames (1280×720, at spawn, reduced motion enabled). This is not a cross-device benchmark.
- On the final build, a real Start click put Web Audio into `running`; mute toggled correctly. Reduced-motion state was verified after toggling. A fresh normal game session logged no console errors. The upstream Three.js Clock warning remains.

### Limits

The fade is a small dithered cutaway, not whole-building transparency. Audio playback state and controls were tested; acoustic quality through physical speakers/headphones was not assessed. Touch testing used browser pointer input and viewport overrides, not physical mobile hardware. Blur and visibility recovery were exercised with lifecycle events; native mobile app-switching remains untested. Footsteps use original synthesized tones with no attribution requirement. Preview commands and campus source credits above remain applicable.


## Optional project activities — September 29, 2026

Implemented and browser-tested sequentially: YardOS first, then RiceWalk, then Campus memory lab.

### Content grounding

The existing portfolio contains YardOS (explicitly fictional), RiceWalk, and this campus implementation. No OwlRecruit or OwlDB implementation details, achievements, or verified URLs were found. A request for factual details was left open while YardOS was built; none arrived during implementation. The two supported alternatives below were used rather than representing unverified projects as completed personal work.

- **YardOS scan comparison — Brochstein:** compare illustrated before/after grids and mark the moved Cart and Cone. Feedback explains stable identity and location comparison. All imagery, locations, and detections are prominently labeled game demo data; no vision model or production drone system is claimed.
- **RiceWalk morning planner — engineering:** add/remove stops, order Coffee before Library, and fit a fictional 10-minute budget. Demonstrates ordered data and constraint validation. Existing route/day-preview content and its local `/` link are retained; no production optimizer or real travel times are claimed.
- **Campus memory lab — Fondren:** select a unique key, store a fictional owl, then retrieve the correct record when names repeat. Demonstrates identity and lookup using a local JavaScript object. The explanation is grounded in this campus game’s landmark and collectible IDs and guarded local progress storage; it does not claim a separate database product.

Each starts only on request, has Replay and Stop controls, supports standard buttons with Enter/Space and pointer input, announces feedback, and works in the conventional portfolio as well as the campus dialog. No activity completion is required to navigate, read projects, or contact Michael. Replay and closing reset activity state; activity data is session-local React state, with no backend or applicant/personal data.

### Verified

- YardOS: empty/wrong-answer feedback, correct two-asset comparison, Enter/Space completion, replay clears selections/status, 390px layout, completion in the campus panel, Escape dismissal.
- RiceWalk: missing stops, wrong order, over-budget detour, remove/re-add corrections, correct completion, replay resets budget, keyboard choices, 390px campus-panel completion, Escape dismissal.
- Memory lab: duplicate display-name rejection, storing without overwriting the other Pip, missing-key lookup, wrong-record lookup, correct retrieval, keyboard choices, replay removes the new record, Stop collapses the activity, 390px campus-panel completion.
- Campus movement stayed at `(20,10)` when movement input was sent while an activity was open. The full portfolio still exposes the activities without entering the game.
- Screenshots saved as `release/screenshots/activity-*.png`; detailed browser results in `release/activity-results.md`.
- Final production build generated 103 static pages; standalone typecheck and all 7 existing game tests passed. No console errors were observed in the portfolio or campus activity browser sessions.
- The activities target roughly 20–40 seconds including reading; no countdown is imposed and no human timing study was performed.

### Assets and limitations

All new yard illustrations are original HTML/CSS grids with text symbols; no external images, applicant records, AI detections, or audio were added. Existing campus/reference credits remain applicable. Desktop keyboard and browser pointer input at narrow viewports were tested; no physical phone or screen-reader testing is claimed. OwlRecruit/OwlDB remain absent pending verified project content. No external project URL was invented.

## Discovery layer — September 29 update

Implemented an optional owl guide, five exhibit passport stamps, and three fictional discoveries: an owl under the western oaks, a brass-feather bench that reviews its visitor, and a crescent lantern in Duncan’s courtyard that changes the campus to blue hour. The owl remains visible after collection so its interaction remains discoverable. The night scene uses the existing lights with cooler colors and a procedural moon; no new shadow lights or downloaded assets. All new dialogue, geometry, and postcard artwork are original.

The passport records exhibits opened, including from its accessible menu; it does not claim a physical visit when someone uses that menu. Completion of five exhibits and three discoveries adds a quiet passport message and badge. The postcard can be downloaded at any point as a standalone SVG. Collecting all golden owls no longer forces a popup. Portfolio access remains unrestricted.

Progress uses `michael-campus-progress-v2`, with validated exhibit IDs, discovery IDs, owl indices, and sound/motion/night preferences only. The old owl key migrates once. Reset progress clears stamps, secrets, owls and night mode while retaining sound/motion preferences. Storage denial keeps the visit playable in memory. Multiple simultaneous tabs are not synchronized; the most recent save wins.

Verified this update:
- Production build: 103 static pages. Type check passed. All 10 unit tests passed, including malformed progress, unknown-field filtering, walkable interaction points, and SVG escaping.
- Browser gameplay walked to all three discoveries without teleporting; each interaction opened, paused movement, and closed. All five passport exhibits opened, completion appeared, and progress survived reload.
- Reset progress visibly returned stamps, discoveries and owl counts to zero. Denied-storage browser fault test started, walked, collected and showed its session-only notice without errors.
- Inspected 390×844 mobile controls and passport; guide and passport controls worked. This update did not repeat physical-device testing or every earlier mini-game test.
- Download button produced `michaels-rice-postcard.svg` in Downloads; the file parsed as valid SVG. The browser download-event waiter timed out despite the successful file download.
- No browser console errors in the discovery/denied-storage session. No new controlled performance benchmark. Existing instancing, pixel-ratio cap and one shadow map remain.
- Screenshots: `release/screenshots/discovery-mobile.png`, `discovery-passport.png`, and `discovery-final.png`. Gameplay log: `release/discovery-results.txt`. The log retains an initial harness click/loading failure; the subsequent discovery run passed. A too-conservative route target near the bench was corrected in the harness before the passing run.

Preview from the project directory: `npm run build`, then `PORT=3025 npm run preview`; open `http://127.0.0.1:3025/campus`. Existing campus references and asset credits above still apply; no new external source or asset was introduced. No deployment performed.
