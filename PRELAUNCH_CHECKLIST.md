# Odyssey Pre-Launch Checklist

Use this on the Cloudflare Pages preview deployment before promoting to production.

## Test Matrix

- [ ] Windows laptop or desktop: Chrome
- [ ] Windows laptop or desktop: Edge
- [ ] iPhone: Safari
- [ ] Android phone: Chrome
- [ ] One lower-power device or older laptop if available

## Deploy Sanity

- [ ] Preview deployment opens without console-blocking errors.
- [ ] Hard refresh loads the latest version successfully.
- [ ] Direct visit to the preview URL loads without a blank screen.
- [ ] Refreshing the page mid-session does not break the app.
- [ ] A second deployment does not strand the old tab on a broken chunk load. The app should recover cleanly on reload.

## First-Load Experience

- [ ] Intro screen appears immediately.
- [ ] Fonts load correctly and layout does not jump badly after load.
- [ ] No obvious missing assets, broken icons, or unstyled content.
- [ ] Initial load on mobile does not freeze or trigger a browser crash.

## Core Journey

- [ ] Click or tap `Enter` from the intro screen.
- [ ] Move through the full journey from biome I to biome IV.
- [ ] Reach the end portal sequence.
- [ ] Trigger `Begin Again` and confirm the game resets correctly.
- [ ] Repeat the intro-to-end flow one more time to confirm state resets are reliable.

## Biome Checks

- [ ] Each biome title card appears at the right transition point.
- [ ] Music changes track or mood as biome changes.
- [ ] Grove visuals render correctly.
- [ ] Cave visuals render correctly.
- [ ] Ocean visuals render correctly.
- [ ] Ember visuals render correctly.
- [ ] Biome transitions do not pop in aggressively or leave empty space.

## Controls

- [ ] Keyboard movement works with `W A S D`.
- [ ] Keyboard movement works with arrow keys.
- [ ] Character movement direction feels correct relative to camera.
- [ ] Mobile joystick appears only when expected.
- [ ] Mobile joystick movement feels responsive and recenters correctly after release.
- [ ] Repeated touch interactions do not leave stuck movement.

## Audio

- [ ] Music toggle works from the intro screen.
- [ ] Music starts only after a valid user interaction on mobile Safari.
- [ ] Music can be turned off and back on without distortion or doubling.
- [ ] Music keeps playing correctly when changing biomes.
- [ ] Re-entering after `Begin Again` does not stack duplicate audio layers.

## Theme And UI

- [ ] Theme toggle works on intro.
- [ ] Selected theme persists after refresh.
- [ ] HUD renders correctly in both themes.
- [ ] Progress bar updates correctly through the run.
- [ ] Lore cards and end-journey card appear and disappear correctly.
- [ ] UI remains readable on small mobile screens.

## Performance

- [ ] Desktop frame rate feels smooth in every biome.
- [ ] Mobile frame rate stays playable in every biome.
- [ ] No single biome causes a dramatic frame drop.
- [ ] Camera motion remains smooth during continuous movement.
- [ ] Theme toggling does not cause a visible scene reset or severe hitch.
- [ ] The app does not overheat or throttle quickly on mobile during a 3-5 minute playthrough.

## Stability

- [ ] No browser crash during a full run.
- [ ] No WebGL context lost message during normal play.
- [ ] Locking and unlocking the phone does not leave the game unusable.
- [ ] Switching tabs away and back does not break rendering or controls.
- [ ] Rotating a phone does not leave the UI or canvas misaligned.

## Network And Reload

- [ ] Load the preview once on normal network.
- [ ] Load the preview once with throttled network in DevTools.
- [ ] Refresh while inside a later biome and confirm the app still boots cleanly.
- [ ] Open the preview in a fresh private/incognito window and confirm first-time behavior is correct.

## Visual Quality

- [ ] No severe z-fighting, flicker, or black materials appear.
- [ ] Lighting looks intentional in both light and dark themes.
- [ ] Particle effects are present but not overwhelming.
- [ ] End portal visuals look correct and readable.
- [ ] Text overlays stay legible against the scene.

## Launch Gate

- [ ] `npm run build` passes on the current commit.
- [ ] `npx eslint src` passes on the current commit.
- [ ] All checklist items above are either passed or consciously accepted as non-blockers.
- [ ] Any known issues are written down before launch.

## Recommended Release Notes To Record

- Tester name
- Test date
- Preview URL used
- Devices tested
- Browsers tested
- Blocking issues found
- Non-blocking issues accepted
- Final go/no-go decision
