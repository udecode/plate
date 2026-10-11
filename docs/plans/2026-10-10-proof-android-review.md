---
review_scopes: [proof]
review_basis: [2026-10-04-proof-audit]
verdict: pursue
review_commit: 666f02406e936864cc61e5ccb6824321df4d9a42
review_inputs: [VISION.md, docs/vision/common.md, docs/plans/topics/proof.md, docs/plans/2026-10-02-proof-device-lane.md, docs/research/review-records/2026-10-02-proof-agentic-e2e-review.json, docs/plite/research/2026-10-02-agentic-e2e-testing/shards/005-android-scenarios-from-slate.md, docs/plite/research/2026-10-02-agentic-e2e-testing/shards/010-android-lane-probes.md, packages/test/src/device/android.ts, packages/test/src/device/lane.ts, packages/test/src/device/guard.ts, packages/test/src/device/witness.ts, apps/plite/playwright.device.config.ts, apps/plite/tests/device/global-setup.ts, apps/plite/tests/device/bypass.device.ts, apps/plite/tests/device/autocorrect-empty.device.ts, apps/plite/tests/device/korean-placeholder.device.ts, tooling/device/android.mjs]
review_upstreams: ['../slate-android-tests@66c8b12a94dcefcaea881d8d5ec197ea95a9f7d9', '../agent-device@8829a2ea71341b742b955f6c966e96f37017fdf5', '../sim-use@30274bae1ea5318b4045ad63859748cc433782ba', '../mobile-mcp@f2f30ec18803ba70bf46353e0ad13ee34975b2d9', '../maestro@c73b1202c7c83b9d2e8a60c39ea0ad53039ec507']
---

# Android proof without owning a phone

Status: planning: waiting on your sign-in to Samsung Remote Test Lab for one real-phone run
Topic: proof
Playbook: verdict

Pursue, retaining `2026-10-04-proof-audit`. The owner asked for proofs of concept, not theory. Can Plate test real Android typing without a real device? If not, is buying one phone the only way? No agent tool beats our own lane. Every tool checked types without the on-screen keyboard, and on the emulator those paths skip autocorrect and corrupt text in ways no user would see. Emulator drift is real, though. English Gboard letters never compose on the emulator, which is the bug class Slate reporters describe on phones. But a real device does not mean buying one. Samsung Remote Test Lab gives free daily time on real Galaxy phones over adb, and our lane already runs unchanged over network adb. The next step is one run of the lane on a remote Galaxy and a remote Pixel. Buying a phone is the fallback only if that run fails.

## Brief

### What will change?

Nothing in the packages yet. The pick is to keep our own keyboard-tapping lane and run it on free remote Samsung phones instead of paying for BrowserStack or buying a phone.

### What could go wrong?

The remote phones are unproven until you sign in once. If their bridge can't forward ports, we buy one phone. Free minutes are limited, so this stays a local check, not CI.

## Teach

Our Android lane opens the editor in Chrome on an Android emulator. It taps the real Gboard keys one by one, like a thumb would, then reads what the editor holds and which browser events fired.

Other tools drive phones too, but none of them types through the keyboard on screen. They send fake key presses, paste text, or swap in a fake keyboard. On the emulator those paths skipped autocorrect, dropped Korean letters, and scrambled English into two lines. Users never see those failures, and those paths miss the bugs users do hit.

The emulator still differs from a phone. Its Gboard sends English letters without composing them, while phone users report composition bugs all the time. Only a real phone settles that. Samsung lends real phones for free over the same debug connection our lane uses, and the lane already passed over that kind of connection here.

## Public API

No public call changes. The lane's command stays the same, and only the device serial changes, from the local emulator to the remote phone that Samsung's bridge connects.

```sh before
# .claude/skills/verify/references/commands.md
node tooling/device/android.mjs setup && node tooling/device/android.mjs calibrate
PLATE_DEVICE_WWW_PORT=3000 pnpm --filter plite exec playwright test --config playwright.device.config.ts
```

```sh after
# .claude/skills/verify/references/commands.md
adb connect localhost:<rdb-port>
node tooling/device/android.mjs setup localhost:<rdb-port> && node tooling/device/android.mjs calibrate localhost:<rdb-port>
PLATE_DEVICE_SERIALS=localhost:<rdb-port> PLATE_DEVICE_WWW_PORT=3000 pnpm --filter plite exec playwright test --config playwright.device.config.ts
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
| Where real-phone checks run | Free Samsung remote phones, plus a remote Pixel (look) | Buy one phone now | buy phone | big |
| Paid cloud | No BrowserStack | Pay for App Automate | pay cloud | big |
| CI on real phones | Not yet; local runs only | Port the lane to Firebase's free daily phone runs | port firebase | small |
| Keyboard learned words | Clear them before each run, in the next plan | Leave them | keep learned | small |
| Settings navigation | Borrow Joe's state-machine idea for other phones' menus | Keep fixed menu labels | fixed labels | small |
| Package work | None until the real-phone run reports | Build now | build now | detail |
| Page link | New page, because the old one no longer opens (old 1C5Axx5Aqg68Ly6zr2JkQo, new B9fHQVVondfw4aQTs1x5QY) | Restore the old link | old page | detail |

## Evidence

Model: claude-opus-5-5 at high effort lead; source readers ran on Codex `gpt-6.1-sol` at medium effort.

### Requirements

- Prove Android editor behavior as users produce it, with soft-keyboard taps, composition, autocorrect and suggestion taps in Chrome (`docs/vision/common.md` row "Android Chrome soft-keyboard behavior").
- The owner wants proofs of concept over theory, no paid cloud, no package changes yet, and buying one phone only if nothing else works.
- Dig into existing tools' source before building anything.

### Lanes

- **Adopt an agent driver (agent-device, sim-use, mobile-mcp, maestro).** Loses. Source shows none of them types through the on-screen keyboard. On the emulator, key codes and `adb input text` produced `b go` / `ecuase` with no autocorrect, and `adb input text` cannot send Korean at all (`poc-drivers-a3.jsonl`, run directory below). They remain useful for exploring screens, never for input proof.
- **Joe's Appium design (slate-android-tests).** Loses as an input driver: `pressKeyCode` puts Gboard in hardware-keyboard mode, and Korean key codes produced `ㅇ아` instead of the tapped `ㅇㅏㄴㄴㅕ` / `ㅇ`. Its open PR #33, a state machine for settings menus, wins as the shape our setup should take on other phones.
- **Emulator only (status quo).** Loses as the only lane. English Gboard letters arrive as plain `insertText` with no composition on the emulator, while Slate reporters describe English composition on phones (shard 010; the tap trace in `poc-drivers-a3.jsonl`). The emulator can't settle that.
- **Free remote real phones over adb (Samsung Remote Test Lab, Android Device Streaming).** Wins, pending one run. Samsung grants 20 credits a day, each 15 minutes, with adb through its Remote Debug Bridge ([Remote Test Lab](https://developer.samsung.com/remotetestlab/doc/about-remote-test-lab)). Device Streaming gives 30 free minutes a month on Pixels and partner phones over adb ([Firebase pricing](https://firebase.google.com/pricing)). The lane passed six of seven cases over network adb (`poc-netadb-a2.log`; the mention case skips without www).
- **Firebase Test Lab free tier.** Deferred. Five real-phone runs a day are free ([Test Lab quotas](https://firebase.google.com/docs/test-lab/usage-quotas-pricing)), but it runs only an on-device test app, with no adb or DevTools from our machine, so the lane would need a port.
- **Buy one phone.** The fallback, not the only answer. It covers one model and keyboard; the remote labs cover Samsung Keyboard and several models for free.
- **BrowserStack App Automate (Joe's plan, 2,400 USD a year).** Loses to the free labs for local proof; nothing measured shows it adds a capability they lack.
- **Strongest deletion.** Retire the Android lane and rely on Playwright mobile emulation. Loses, because emulation sends no soft-keyboard events, so it reproduces none of the measured bugs.

### Findings

- The lane leaks keyboard state between runs. After the key-code proofs taught Gboard the word `becuase`, the autocorrect case read `Becuase go` on both transports (`poc-learned-word-a1.log`). Deleting Gboard's learned words brought the known failure back, `BecuasegoBecause ` (`poc-learned-word-a3.log`). Setup never clears learned words, and a real phone has years of them.
- The full lane ([android.ts](../../packages/test/src/device/android.ts), [device config](../../apps/plite/playwright.device.config.ts)) passed 35 of 35 on current code earlier today (`docs/plans/artifacts/device-lane-rerun-2026-10-10/`), with Korean added through settings and removed on restore.

### Reconciled reviews

- This review retains `2026-10-04-proof-audit`, because its cut of the self-declared raw-mobile receipt stands and this review keeps the device lane as the only raw Android evidence, as that review chose.
- This review retains `2026-10-02-proof-agentic-e2e-review` ([record](../research/review-records/2026-10-02-proof-agentic-e2e-review.json)), because its Stop on agent tools for input proof now has emulator measurements behind it.
- Plan `docs/plans/2026-10-02-proof-device-lane.md` stays open on its own owner steps; this review adds the remote-phone run as the next proof, without changing that plan.

### Proof limits

Everything ran on one emulator image with Gboard 17.0.14, one run per POC case, no retries. No remote or physical phone ran. The Samsung, Device Streaming and Test Lab terms come from their pages on 2026-10-10, not from a session. `adb reverse` through Samsung's bridge is unverified; the local network-adb run proves only our side. The commitText path of the agent tools' own keyboards was read in source, not run; that it skips Gboard is inferred from Gboard not being the active keyboard. Run directory: `docs/plans/artifacts/android-proof-verdict/` (POC spec, logs, reader answers).
