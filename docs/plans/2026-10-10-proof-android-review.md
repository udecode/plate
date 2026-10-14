---
review_scopes: [proof]
review_basis: [2026-10-04-proof-audit]
verdict: pursue
review_commit: 666f02406e936864cc61e5ccb6824321df4d9a42
review_inputs: [VISION.md, docs/vision/common.md, docs/plans/topics/proof.md, docs/plans/2026-10-02-proof-device-lane.md, docs/research/review-records/2026-10-02-proof-agentic-e2e-review.json, docs/plite/research/2026-10-02-agentic-e2e-testing/shards/005-android-scenarios-from-slate.md, docs/plite/research/2026-10-02-agentic-e2e-testing/shards/010-android-lane-probes.md, packages/test/src/device/android.ts, packages/test/src/device/lane.ts, packages/test/src/device/guard.ts, packages/test/src/device/witness.ts, apps/plite/playwright.device.config.ts, apps/plite/tests/device/global-setup.ts, apps/plite/tests/device/bypass.device.ts, apps/plite/tests/device/autocorrect-empty.device.ts, apps/plite/tests/device/korean-placeholder.device.ts, tooling/device/android.mjs]
review_upstreams: ['../slate-android-tests@66c8b12a94dcefcaea881d8d5ec197ea95a9f7d9', '../agent-device@8829a2ea71341b742b955f6c966e96f37017fdf5', '../sim-use@30274bae1ea5318b4045ad63859748cc433782ba', '../mobile-mcp@f2f30ec18803ba70bf46353e0ad13ee34975b2d9', '../maestro@c73b1202c7c83b9d2e8a60c39ea0ad53039ec507']
---

# Android proof: emulator plus one local phone

Status: planning: waiting on you to buy one Samsung phone for the agent-run lane
Topic: proof
Playbook: verdict

Pursue, retaining `2026-10-04-proof-audit`. The owner asked for proofs of concept, not theory. Can Plate test real Android typing without a real device? If not, is buying one phone the only way? No agent tool beats our own lane. Every tool checked types without the on-screen keyboard, and on the emulator those paths skip autocorrect and corrupt text in ways no user would see. Emulator drift is real, though. English Gboard letters never compose on the emulator, which is the bug class Slate reporters describe on phones. The owner then ruled out cloud runs. The lane stays local, and agents run it. That leaves no free path to a real phone. Samsung Remote Test Lab needs a person to click through its popup client every session, its phones keep the last user's state, and Firebase Test Lab is cloud only. So buying one phone is the answer. A mid-range Galaxy on USB covers Samsung Keyboard and Gboard both, and our lane already runs over any adb connection.

## Brief

### What will change?

Nothing in the packages yet. The pick is to buy one Samsung phone, plug it in by USB, and let agents run our keyboard-tapping lane on it next to the emulator.

### What could go wrong?

One phone covers one model. Samsung Keyboard has no key labels, so the lane needs a new way to find its keys. A phone collects learned words, so setup must clear them.

## Teach

Our Android lane opens the editor in Chrome on an Android emulator. It taps the real Gboard keys one by one, like a thumb would, then reads what the editor holds and which browser events fired.

Other tools drive phones too, but none of them types through the keyboard on screen. They send fake key presses, paste text, or swap in a fake keyboard. On the emulator those paths skipped autocorrect, dropped Korean letters, and scrambled English into two lines. Users never see those failures, and those paths miss the bugs users do hit.

The emulator still differs from a phone. Its Gboard sends English letters without composing them, while phone users report composition bugs all the time. Only a real phone settles that. Samsung's free remote phones need a person at every session, so they can't serve agents. A phone on the desk can, through the same debug connection the lane already passed over here.

## Public API

No public call changes. The lane's command stays the same, and only the device serial changes, from the emulator to the phone on USB.

```sh before
# .claude/skills/verify/references/commands.md
node tooling/device/android.mjs setup && node tooling/device/android.mjs calibrate
PLATE_DEVICE_WWW_PORT=3000 pnpm --filter plite exec playwright test --config playwright.device.config.ts
```

```sh after
# .claude/skills/verify/references/commands.md
node tooling/device/android.mjs setup <usb-serial> && node tooling/device/android.mjs calibrate <usb-serial>
PLATE_DEVICE_SERIALS=<usb-serial> PLATE_DEVICE_WWW_PORT=3000 pnpm --filter plite exec playwright test --config playwright.device.config.ts
```

## What other editors do

Each driver was read at the commit in the front matter. The emulator column was measured with our editor on `Pixel_9_API_36_Play` and Gboard 17.0.14 on 2026-10-10, typing `becuase go` then Enter, and Korean `안녕` then Enter.

| Delta | Tool | Typing reaches the editor as | Reads the editor model | Mobile web |
| --- | --- | --- | --- | --- |
| changed | agent-device 0.21.18 | its own test keyboard on emulators by default (`--no-test-ime` turns it off), else `adb input text`; taps are `adb input tap` | no | Android accessibility tree only |
| added | sim-use | node `ACTION_SET_TEXT` or clipboard paste; taps are accessibility `dispatchGesture` | no | accessibility tree only |
| added | mobile-mcp | `adb input text` or its `mobilecli` helper; taps are `adb input tap` | no | accessibility tree only |
| added | maestro | key codes for ASCII, its own keyboard's `commitText` for anything else | only inside a WebView, not Chrome | Chrome not supported |
| added | slate-android-tests | Appium key codes (`pressKeyCode`), so Gboard runs in hardware-keyboard mode | yes, from its own WebView app | its own WebView app, not Chrome |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Input driver | Keep our lane, which taps real keyboard keys | Adopt an agent tool | adopt tool | big |
| Where real-phone checks run | One Samsung phone on USB, run by agents (look) | Samsung's free remote phones, clicked by hand | remote lab | big |
| Cloud runs | None; everything runs locally, as the owner asked | Firebase Test Lab's free daily phone runs | cloud runs | big |
| Paid cloud | No BrowserStack | Pay for App Automate | pay cloud | big |
| Which phone | A mid-range Galaxy A with Gboard added | A Pixel, which has Gboard only | pixel | small |
| Samsung Keyboard keys | Find keys by their place in the layout, since they have no labels | Gboard only | gboard only | small |
| Keyboard learned words | Clear them before each run, in the next plan | Leave them | keep learned | small |
| Settings navigation | Borrow Joe's state-machine idea for other phones' menus | Keep fixed menu labels | fixed labels | small |
| iOS checks | The simulator, tapping keys through WebDriverAgent with learned words cleared before each run; your iPhone over Wi-Fi for real-device checks, which caught the toolbar mouse-down drift that the simulator misses (look) | Your iPhone as the daily lane | iphone daily | small |
| Package work | None until the real-phone run reports | Build now | build now | detail |
| Page link | New page, because the earlier ones no longer open from this account (1C5Axx5Aqg68Ly6zr2JkQo, B9fHQVVondfw4aQTs1x5QY, 163Hso3hiB7oLPkWaG2coy; new J4QwBnqER7kVikd3P8o3Mk) | Restore an old link | old page | detail |

## Evidence

Model: claude-opus-5-5 at high effort lead; source readers ran on Codex `gpt-6.1-sol` at medium effort.

### Requirements

- Prove Android editor behavior as users produce it, with soft-keyboard taps, composition, autocorrect and suggestion taps in Chrome (`docs/vision/common.md` row "Android Chrome soft-keyboard behavior").
- The owner wants proofs of concept over theory, no paid cloud, no package changes yet, and buying one phone only if nothing else works.
- Runs stay local and agents run them; no cloud runs (owner, 2026-10-12).
- Dig into existing tools' source before building anything.
- Try iOS both on the simulator and on a real iPhone through WebDriverAgent (owner, 2026-10-12).

### Lanes

- **Adopt an agent driver (agent-device, sim-use, mobile-mcp, maestro).** Loses. Source shows none of them types through the on-screen keyboard. On the emulator, key codes and `adb input text` produced `b go` / `ecuase` with no autocorrect, and `adb input text` cannot send Korean at all (`poc-drivers-a3.jsonl`, run directory below). They remain useful for exploring screens, never for input proof.
- **Joe's Appium design (slate-android-tests).** Loses as an input driver: `pressKeyCode` puts Gboard in hardware-keyboard mode, and Korean key codes produced `ㅇ아` instead of the tapped `ㅇㅏㄴㄴㅕ` / `ㅇ`. Its open PR #33, a state machine for settings menus, wins as the shape our setup should take on other phones.
- **Emulator only (status quo).** Loses as the only lane. English Gboard letters arrive as plain `insertText` with no composition on the emulator, while Slate reporters describe English composition on phones (shard 010; the tap trace in `poc-drivers-a3.jsonl`). The emulator can't settle that.
- **Samsung Remote Test Lab.** Loses for agent runs. It grants 20 credits a day, each 15 minutes, with adb through its Remote Debug Bridge ([Remote Test Lab](https://developer.samsung.com/remotetestlab/doc/about-remote-test-lab)), but the 2026-10-12 attempt never reached adb. The device client opens only as a popup window that the agent's browser tools cannot drive, Samsung allows one client per device, and closing the popup ended the session and left the reservation stuck at "Getting ready to restart". The bridge (`rdb.zip` from the client's assets) is an unsigned Intel-only binary that needed Rosetta. Joe Anderson reported on Slack that its phones keep the previous user's state, which this run did not check.
- **Android Device Streaming and Firebase Test Lab.** Lose, because the owner keeps every run local. Device Streaming resets phones after each session but gives 30 free minutes a month through Android Studio ([Firebase pricing](https://firebase.google.com/pricing)). Test Lab gives five wiped real-phone runs a day ([Test Lab quotas](https://firebase.google.com/docs/test-lab/usage-quotas-pricing)) but runs only an on-device test app.
- **Buy one phone.** Wins. A phone on USB is an adb device like the emulator, and the lane passed six of seven cases over a network adb serial (`poc-netadb-a2.log`; the mention case skips without www). A Galaxy covers Samsung Keyboard, which no emulator runs, and Gboard from the Play Store. It covers one model, so the lane still records the phone and keyboard versions it proved.
- **BrowserStack App Automate (Joe's plan, 2,400 USD a year).** Loses, because it is paid cloud.
- **Strongest deletion.** Retire the Android lane and rely on Playwright mobile emulation. Loses, because emulation sends no soft-keyboard events, so it reproduces none of the measured bugs.

### Findings

- The lane leaks keyboard state between runs. After the key-code proofs taught Gboard the word `becuase`, the autocorrect case read `Becuase go` on both transports (`poc-learned-word-a1.log`). Deleting Gboard's learned words brought the known failure back, `BecuasegoBecause ` (`poc-learned-word-a3.log`). Setup never clears learned words, and a real phone has years of them.
- The full lane ([android.ts](../../packages/test/src/device/android.ts), [device config](../../apps/plite/playwright.device.config.ts)) passed 35 of 35 on current code earlier today (`docs/plans/artifacts/device-lane-rerun-2026-10-10/`), with Korean added through settings and removed on restore.

### iOS proofs of concept

The owner asked on 2026-10-12 to try iOS both ways: the iOS Simulator with Mobile Safari, and a real iPhone driven through WebDriverAgent, the approach iPhone-use takes. Both tap the on-screen keyboard one key at a time through WebDriverAgent 16.14.0 at the coordinates its accessibility tree reports. A local proxy injects a recorder into the example page, which logs the editor's events and text back over the network. So the same probe works on any device on the network, with no Web Inspector.

- **Simulator, iOS 26.4 on an iPhone 17.** It wins as the daily iOS lane. English sends real key names in `keydown` and one `insertText` per key. Typing `becuase` then space sends `insertReplacementText`, and the editor ends at `Because go` (`sim-en-a6.jsonl`). Korean 2-Set sends no composition events at all. Each jamo arrives as `deleteContentBackward` followed by `insertText` of the recombined syllable, and the editor ends at `안녕` (`sim-ko-a1.jsonl`). Tapping the `Because` suggestion also arrives as `insertReplacementText` (`sim-en-suggest-a1.jsonl`).
- **The simulator leaks learned words, as Gboard does.** WebDriverAgent's runner turns autocorrect off at launch, so the first runs typed `becuase` uncorrected, and the keyboard learned it as a word. After that, autocorrect skipped `becuase` in the editor and in a plain textarea (`sim-textarea-a3.jsonl`). It still corrected `teh` to `The`, through WebDriverAgent's taps and through the simulator's own touch input alike (`sim-wda-teh-a1.jsonl`, `sim-hid-teh-a1.jsonl`). The simulator has no Reset Keyboard Dictionary menu. Moving its learned-word files out of `data/Library/Keyboard` while it was shut down brought the correction back (`sim-keyboard-backup/` holds them). So each run must turn autocorrect back on and start from an empty learned-word store.
- **Real iPhone, an iPhone 18 Pro Max on iOS 27 with Safari 27.0.1.** It matches the simulator, which leaves it as a check on a real device rather than a daily lane. The phone runs WebDriverAgent over Wi-Fi and loads the example through the Mac's proxy on the local network. Typing `becuase` then space sends `keydown " "`, then `insertReplacementText`, then `insertText " "`, and the editor ends at `Because go` (`dev-en-a1.jsonl`). Setup needed two one-time steps on the phone, turning on Developer Mode and trusting the developer certificate. Afterwards Settings showed Auto-Correction and Predictive Text on. For the dual run, the run added a Korean 2-Set keyboard to the phone, and the owner chose to keep it. Korean then matched the simulator event for event.
- **Dual run, simulator against iPhone.** `dual-runner.mjs` runs 11 scenarios on either device: the 6 Android device tests ported (`mention-taps` needs the www server and is skipped, as on Android), plus Enter split, Backspace merge, the double-space period, double-tap word replace, the numbers keyboard and delete across a bold boundary. It reads the editor's model and selection through `__pliteBrowserHandle` over the proxy and records `keydown`, `beforeinput` and composition events. The simulator passed all 11. The iPhone matched it on 10, with the same final blocks and the same event sequence (`dual-compare.mjs dual-sim-final.json dual-device-final.json`).
- **The one drift is the Bold toggle (Slate #6022).** On the iPhone, tapping Bold with a collapsed caret toggled the mark and then closed the keyboard, so `abc` was never typed. The simulator kept the keyboard and typed one bold `abc`. It failed in 4 of 4 iPhone runs and passed in 3 of 3 simulator runs. The event trace shows why. The toolbar button cancels `pointerdown`, and the simulator then fires no `mousedown`, but the iPhone still fires `mousedown` after `touchend`, which moves focus from the editor to `BODY` (`bold-trace.mjs` on `dual-device-bold-a4.json` and `dual-sim-bold-a3.json`). With a `mousedown` cancel injected into the page, the iPhone kept focus and typed one bold `abc` (`dual-device-bold-patched.json`). The Plite examples that cancel only `pointerdown` are richtext, hovering-toolbar, yjs-collaboration and yjs-hocuspocus. Plate's registry toolbar (`apps/www/src/registry/bases/base/toolbar.tsx`) already cancels `mousedown`. The simulator does not show this failure.
- **iOS behavior the runner works around.** A tap snaps the caret to a word edge, so after the real tap the runner moves the caret to the target through the editor handle and records it. The double-space period needs two quick taps. iOS offers `help` for `helo` where Gboard offers `hello`, and adds a space after a suggestion tap. The globe key's long-press menu names each keyboard, which separates English (US) from a bilingual English and French keyboard. Two runs at once on one proxy mix up their pages, so devices run one after the other.
- **Typing through `typeText`.** Loses for input proof. XCUITest's `typeText`, which WebDriverAgent and iPhone-use use to type, skips the keyboard keys the way Android's set-text does. Only the tap path counts.

Run directory: `docs/plans/artifacts/ios-proof-poc/` (proxy, probe and Settings scripts, logs, screenshots).

### Reconciled reviews

- This review retains `2026-10-04-proof-audit`, because its cut of the self-declared raw-mobile receipt stands and this review keeps the device lane as the only raw Android evidence, as that review chose.
- This review retains `2026-10-02-proof-agentic-e2e-review` ([record](../research/review-records/2026-10-02-proof-agentic-e2e-review.json)), because its Stop on agent tools for input proof now has emulator measurements behind it.
- Plan `docs/plans/2026-10-02-proof-device-lane.md` stays open on its own owner steps; this review adds the local-phone run as the next proof, without changing that plan.

### Proof limits

Everything ran on one emulator image with Gboard 17.0.14, one run per POC case, no retries. No remote or physical phone ran; the one Samsung session never reached adb. The Device Streaming and Test Lab terms come from their pages on 2026-10-10. A USB phone is inferred to behave like the network-adb serial the lane passed on, because the lane talks only to adb. The commitText path of the agent tools' own keyboards was read in source, not run; that it skips Gboard is inferred from Gboard not being the active keyboard. Run directory: `docs/plans/artifacts/android-proof-verdict/` (POC spec, logs, reader answers).
