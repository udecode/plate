---
review_scopes:
  - proof
review_basis:
  - 2026-10-02-proof-agentic-e2e-review
work_kind: implementation
---

# Local proof lanes: real IME, honest stand-ins and an Android device lane

Status: blocked on owner steps. #5137 runs wait for Pinyin - Simplified and iOS waits for the iOS 26.5 platform. Open, owner: zbeyens: a Plate production import still carries the handle, the production-handle check is not wired into check:plite, the DOM-only production control has not run, two benchmark drivers are blocked by another session's landing.ts cycle, and physical phones and other keyboards are unproven

Plate's unit and DOM tests keep passing while real browsers show caret, IME
and Android bugs. This plan builds three local proof lanes that catch them,
with no new GitHub Actions minutes:

- a macOS lane that drives the real Pinyin input method for #5137;
- a harness change that stops tests from passing silently through stand-ins;
- a private Android lane that types on the real soft keyboard and reads the
  editor model through the existing harness.

The execution playbook is Build (`.agents/playbooks/build.md`). Review
`2026-10-02-proof-agentic-e2e-review` governs it. Its evidence is the research
run `docs/plite/research/2026-10-02-agentic-e2e-testing/`, including both
interrogate passes under `review/`.

## Defaults

- **Lanes run locally only.** No workflow runs them, and no CI job is added.
  The Plite CI planner also learns to ignore the device lane's files, because
  today any change under `packages/test/src` starts the full browser matrix.
  The alternative is a nightly Linux runner with KVM. Reverse with "ci lane".
- **Android driver: stock Chrome over `adb` and CDP.** Playwright attaches
  with `adb forward localabstract:chrome_devtools_remote` and
  `connectOverCDP(url, { noDefaults: true })`, and every input is an
  `adb shell input` touch or gesture. The alternatives were Appium
  UiAutomator2 and agent-device, whose test keyboard bypasses Gboard. Reverse
  with "appium lane".
- **The witness is structural.** A run counts when three things hold. The
  selected keyboard is Gboard at the version recorded in setup. The lane's
  Android module can only tap and move, and a guard on the whole CDP connection
  refuses every `Input.*` call, including Playwright's internal sessions.
  Every editor input event is trusted and falls inside a lane
  gesture window, with at most one `keydown` per tap. Per-key event shapes are
  recorded as evidence, not used as pass rules, because Korean composition and
  autocorrect make them depend on the editor's state. Event attribution alone
  cannot distinguish a trusted CDP insertion inside a real tap window. The
  input claim therefore requires the command guard and exclusive device
  ownership as well as the event judge. The alternative is a
  calibrated signature per key or per input class. Reverse with "signature
  witness".
- **Key map from the accessibility tree, at setup only.** Setup reads
  `uiautomator dump --windows` for each layout the cases use. The cache key
  includes keyboard version, language, screen, orientation, panel and shift
  state. Calibrate English letters, the symbols used by `@bi`, Korean jamo,
  space, Enter and Backspace. A worker checks the active layout before using
  coordinates and fails closed on a cache miss. Reverse with "screenshot keys".
- **First Android cases come from Slate's issue history** (shard 005), not
  from the 16-row raw-mobile matrix. Reverse with "matrix first".
- **Composition cases use Gboard Korean.** English Gboard committed one letter
  at a time even in a plain `<textarea>` (shard 009). Reverse with "english
  composition".
- **Case 5 runs on www's `/blocks/mention-demo`.** The gate it closes belongs
  to Plate's combobox and `settleInput()`, which the Plite mentions example
  does not use. Reverse with "plite mentions".
- **The release gate keeps its current trust model.** Device lane results are
  `verify` evidence, kept as Playwright reports with per-run attachments.
  `check-plite-release-proof.mjs` trusts only a `workflow_dispatch` artifact,
  so receipt schema 2 and the gate wait for Phase 3's decision. Reverse with
  "gate now".
- **The page handle is installed by test apps.** `installBrowserHandle()`
  comes from `plitejs/react`, which has `sideEffects: false`, so an app that
  never calls it drops the code. Plate apps import its `platejs/react` facade.
  apps/plite, the www dev and test builds, the Plite contract tests and the
  benchmark page entries call it before their
  first editor mounts. A `NODE_ENV` gate breaks the Plite suite, which runs
  against a production static export. Reverse with "always attach".
- **platejs.org production builds drop the handle.** No recorded probe ever
  read it there (shard 007). A www test build that a benchmark reads sets
  `NEXT_PUBLIC_PLATE_BROWSER_HANDLE=1`. Reverse with "keep on platejs.org".
- **Installing the handle turns kernel trace retention on.** Paste detection
  and kernel-transition checks read that trace. One production-config
  benchmark reads only DOM state, so performance still has a production
  baseline. Reverse with "retention off".
- **Clipboard transport is a per-project setting.** `pasteText` and
  `pasteHtml` use the project's `clipboardTransport` (`'native'`, `'event'` or
  `'handle'`). They fail when the chosen transport did not apply the paste,
  or the page threw during it, and record which transport ran. Desktop
  Chromium and Firefox use `'native'`, because both deliver a trusted paste
  after a clipboard write. WebKit, Pixel 5 and mobile WebKit use `'event'`;
  WebKit's clipboard write rewrites HTML with inline computed styles. The
  event transport dispatches `paste` and, when nothing cancels it,
  `beforeinput` `insertFromPaste`, which is where Chromium and Firefox
  editors apply rich content. A single setting changes text paste on WebKit
  and mobile from a native attempt to an explicit stand-in; it preserves
  their current first HTML path. The alternative was a per-call option,
  which would spread engine branches across 77 call sites. Reverse with
  "per-call transport", or "firefox handle" for Firefox alone.
- **The `'browser-handle'` selection preference changes only after a probe.**
  Today that reason keeps typing after a handle selection on the native fast
  path, and a contract test pins that behavior. Phase 1 measures it first.
  Reverse with "skip the probe". The probe refuted the fast-path premise:
  typing after a click and after a handle selection is model-owned on both
  paths (decision log, 21:50:14Z).
- **The Pixel 5 project's scenarios and labels are unchanged.** It is the only
  routine browser coverage of Plite's Android code path. Its labels already say
  `playwright-mobile`, and no relabel step could fail for a named defect.
  The explicit clipboard setting above still applies to this project.
  Reverse with "relabel emulation".
- **The #5137 lane comes first.** It is the cheapest open gate and needs no
  device. Reverse with "android first".
- **Bugs the lanes find become local drafts.** A red case records its trace
  and gets an issue draft through Maintainer's issue-draft mode, with an
  `owner:` row in the decision log. Nothing is filed without the owner.
- **tester-army `e2e` is not adopted,** for the reasons in the governing
  review. Reverse with "adopt e2e".
- **iOS Safari stays a probe in this plan.** Reverse with "ios lane".

## Execution deviations

Each approved item execution changed, with its approved wording, the change
and its decision-log row.

| Approved | Changed to | Why | Row |
| --- | --- | --- | --- |
| "Desktop Chromium uses `'native'`, Firefox uses `'handle'`" | Firefox uses `'native'` too | Playwright Firefox delivers a trusted paste after a clipboard write, so the stand-in hid a real path | 17:06:53Z |
| "Remove ... the `handle.insertData` retry in `pastePayloadThroughEvent`" | Removed, and the event transport also sends `beforeinput` `insertFromPaste` after an uncanceled `paste` | Chromium and Firefox apply rich paste in `beforeinput`; without it, event pastes never reached the editor | 17:06:53Z |
| "They fail when the chosen transport did not apply the paste" | A paste applies only when a newer commit carries the `paste` tag | A traced `insert-data` command only shows that the kernel planned the insert | 21:48:59Z |
| "platejs.org production builds drop the handle" | Holds for `plitejs/react`; a `platejs/react` production import still carries it | Plate's unbundled barrel wraps every export in a namespace object; owner: zbeyens | 17:35:56Z |
| (not in the plan) | `NEXT_PUBLIC_PLATE_BROWSER_HANDLE=1` marks a www test build that installs the handle | The code-block product benchmark reads the handle on a production host | 17:35:56Z |
| "Bugs the lanes find become local drafts" | The paste-html example's own throw on a bare `<a>` is fixed in the example | The throw sat inside the proof path, not in a product package | 21:50:14Z |
| "Every input event must be trusted ... with at most one `keydown` per tap"; "Per-key event shapes are recorded as evidence, not used as pass rules" | Each `beforeinput` follows its own `keydown` and each `input` its own `beforeinput`; each step names the key class its tap produces; a script `compositionend` must repeat the last trusted update | Real Gboard traces send two keydowns for one strip replacement, autocorrect space or Korean commit; adb Enter and `execCommand` passed the looser rule | 18:24:18Z, 21:50:14Z |
| "The cache key includes ... orientation, panel and shift state"; "confirm the calibrated language, panel and shift state" | The key holds Gboard version, language, panel, subtype and screen size | Shift changes labels, not positions, and the lane runs in portrait | 21:50:14Z |
| "`doctor` refuses to start on a stale restore file" | `doctor` refuses a stale lock and an unfinished setup | The restore file is the setup journal and exists through every warm run | 21:50:14Z |
| "`globalTeardown` runs restore and releases the lock" | Teardown releases the run's tab, ports and lock; `setup` and `restore` stay explicit commands | Restoring after every run would make every run cold | 21:50:14Z |
| "Add the gated spec `apps/www/tests/browser/homepage-ime-native.spec.ts`" | `apps/www/tests/native/homepage-ime.native.ts` | `tests/browser` belongs to the www suite, and any `.spec.ts` under `apps` joins the bun suite | 21:50:14Z |
| Case 2: "a replacement event must appear" after a partial word | A misspelled prefix (`helo`) and a `deleteContentBackward` then `insertText` pair | A strip tap that extends a prefix sends only the suffix | 18:24:18Z |
| Case 3: autocorrect on space | Uses `becuase`; the oracle is the text and caret, not the event shape | Plite receives autocorrect as a composition, unlike the neutral page | 18:24:18Z |
| Case 5: "plus a Korean query tapped mid-composition" | Cut | No mention-demo option matches a Korean query; gap owner: zbeyens | 20:07:11Z |
| (not in the plan) | Native traces gain an opt-in `pointerdown` type and `clientX`, `clientY` | The witness checks that each content touch landed on its target | 20:29:38Z |
| `review_scopes`: proof, autocomplete, native | proof only | Only the proof review governs this plan | 21:03:17Z |

## Public API

These pairs are proposed in this iteration. The subject file records current
behavior until execution proves the changes.

Each project names its paste transport. Paste call sites stay unchanged.

```ts before
// apps/www/playwright.config.ts
{ name: 'webkit', use: { ...devices['Desktop Safari'] } }
```

```ts after
// apps/www/playwright.config.ts
{ name: 'webkit', use: { ...devices['Desktop Safari'], clipboardTransport: 'event' } }
```

A Plate test app installs the handle before mounting its first editor.
The import below is copied from the basic editor. Put installation in the
dev/test entry that owns the mount, so a platejs.org production entry never
calls it.

```ts before
// apps/www/src/registry/blocks/editor-basic/components/editor/rich-text-editor.tsx
import { EditorRoot, useCreateEditor } from 'platejs/react';
```

```ts after
// a www dev or test entry; registry components never call it
import { EditorRoot, installBrowserHandle, useCreateEditor } from 'platejs/react';

installBrowserHandle();
```

Plite test apps use the same installer through `plitejs/react`.

## Main changes

- A macOS helper drives the real Pinyin input method into exact Google Chrome
  and captures caret pixels from the OS with controls, for desktop IME proof.
- The harness's paste fallbacks are replaced by one per-project transport
  that fails loudly, including when the page throws mid-paste. The event
  transport follows the browser's `paste` then `beforeinput` order instead
  of jumping to `insertData`. The shortcut and IME stand-ins are recorded as
  deferred.
- Plite's page handle moves from every mount to an explicit installer, so
  production bundles drop it.
- A private Android lane in `@platejs/test` types on the real soft keyboard
  over `adb` and CDP. It blocks prohibited commands and rejects events the
  judge can distinguish from its recorded gestures.

## Scope

In scope:

- `packages/test/src/playwright` and a new private `packages/test/src/device`;
- the handle wiring in `packages/plitejs/src/react/editable` and its
  `plitejs/react` export, with the corresponding `platejs/react` facade;
- a device config and cases in `apps/plite`, plus the www mention demo for
  case 5;
- the #5137 spec in `apps/www/tests/browser`;
- local scripts under `tooling/`;
- the Plite CI planner exclusion;
- the doctrine, docs and changesets each phase invalidates.

Out of scope:

- receipt schema 2 and `check-plite-release-proof.mjs`;
- a published device entry or bin;
- iOS beyond a probe;
- Samsung Keyboard, Firefox for Android and voice dictation, which need
  physical devices;
- a local pre-PR check, which is a separate plan;
- any workflow change other than the planner exclusion.

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Real desktop IME proof | CDP composition only | macOS Pinyin through Text Input Sources and posted keys into exact Chrome, OS screenshots | proof tooling | #5137 needs native preedit paint | one script and one gated spec | five warm runs on #5137's two points | keys to another app; input source left on Pinyin | rearchitect |
| Paste stand-ins | four silent fallbacks to the handle or a synthetic event | per-project `clipboardTransport` that fails loudly and records its transport | `@platejs/test` | a broken native paste can pass | project `use` settings, no call-site edits | harness tests plus the paste specs on all five Plite projects | a slow paste now fails | cut |
| Shortcut and IME stand-ins | constructed chords; synthetic composition off Chromium | unchanged, recorded as deferred | `@platejs/test` | no named defect yet | none | none | drift stays possible | defer |
| Handle-set selection preference | reason `'browser-handle'` differs from a click's, but input ownership matches | unchanged | Plite | the probe found no divergence | none | probe on all five projects | none | keep |
| Page handle | attached on every mount | `installBrowserHandle()` from `plitejs/react`, retention on when installed | Plite | proof tooling should not ship to apps | test apps and benchmark pages | bundle measurement, ready-gate error | an install after mount never attaches | move |
| Android raw input | none | private lane over `adb` and CDP with a structural witness | `@platejs/test` | Android gates have no producer | six cases | witness unit test, bypass test, five warm runs | Gboard updates; emulator versus phone | rearchitect |
| Raw-mobile receipts and release gate | schema 1, no producer | unchanged here | release lanes | local evidence has no trust path | Phase 3 decision | none | none | defer |

## Steps

### Phase 1. Real IME for #5137, honest paste and the explicit handle

Exit: the #5137 five-run result, the paste specs on all five Plite projects,
the probe decision and the bundle measurement. Each part is kept, reverted
or quarantined on its own.

- [ ] Add `tooling/ime/macos-ime.swift` with `status`, `select`, `post`,
      `restore` and a host lock file:
      - `post` uses `CGEventPostToPid` when Chrome accepts it, and falls back
        to the HID tap only right after a frontmost check;
      - `select` writes a restore file only when none exists, and `restore`
        deletes it only after a successful restore;
      - `status` refuses to start while a stale restore file or another
        session's lock exists;
      - preflight Accessibility and Input Monitoring for the process that
        actually launches the helper. The prototype's iTerm2 grants do not
        establish permission for a Codex launch.

      Proof: a kill-then-rerun case where `restore` returns the original
      source, and one `post` that types into a neutral test page.
- [ ] Run the helper's `status`. If Pinyin is missing, ask the owner to re-add
      "Pinyin - Simplified" in System Settings. Check that
      `com.apple.inputmethod.SCIM.ITABC` is enabled and selectable, with its
      parent input method enabled. A missing grant or source blocks native
      runs while the other Phase 1 steps continue. Proof: the `status` output.
- [ ] Launch exact Google Chrome once per run set in `globalSetup`, with
      `--remote-debugging-port`, a persistent dedicated profile,
      `--no-first-run` and `--no-default-browser-check`. Attach with
      `connectOverCDP(url, { noDefaults: true })`. Record the browser pid per
      run, and read Chrome's arguments with `ps -o args`. Proof: the run log
      shows one pid across five runs and no Playwright launch switches. Use a
      local opt-in config with one worker, `repeatEach: 5` and no retries;
      reject CI before any OS mutation. Persist the endpoint and target for
      each worker to reattach, since `globalSetup` cannot share a `Page` object.
      Teardown restores the input source, releases the host lock and closes
      only the owned tab and Chrome process. Prove interruption recovery too.
- [ ] Serve www for the #5137 spec on a dedicated port with
      `reuseExistingServer: false`. Record the serving checkout's `HEAD` and a
      fingerprint of its dirty files. Proof: the run log names the server's
      checkout and fingerprint.
- [x] Add `keydown` to the native event trace. Give every traced event its Closed by `packages/test/test/browser/native-event-trace.browser.test.ts`.
      `isTrusted` flag and a monotonic `seq` assigned at push. Proof: a
      real-Chromium test that dispatches two CDP key events and asserts
      trusted entries with increasing `seq`. Closed by
      `packages/test/test/browser/native-event-trace.browser.test.ts`
      (Vitest browser mode, Playwright-driven trusted keys plus synthetic
      ones), red before the change and green after, via
      `pnpm exec vitest run --config ./vitest.config.ts --project browser`.
- [ ] Add the gated spec `apps/www/tests/browser/homepage-ime-native.spec.ts`.
      It types `ceshi` with real Pinyin at homepage host `1,0` offset 27 and
      after-link host `1,2`, commits `测试` with space, then types `2`.
      Keep the homepage links and annotations intact. Read the second host's
      starting text and offset from the real fixture. Reset between anchors
      through declared setup, before input begins.
      - Selecting Pinyin, activating Chrome, waiting 150 ms and seeing a
        trusted `compositionstart` on a probe key is a setup gate; a miss is a
        setup failure, never a product result.
      - Record each key's observed `keyCode`; a value of 229 is not an OS IME
        certificate because CDP can produce it too. Retain the helper's posted
        key log and the selected OS input source alongside the event trace.
      - Each key's trusted `keydown` must arrive before the next key posts.
      - After each preedit key, the original Text node stays connected and
        focused, holds the expected preedit, and remains the DOM selection's
        node. The model anchor stays at the pre-composition point.
      - Space commits `测试` exactly once. The following `2` leaves the expected
        paragraph text and collapsed model and DOM selections at starting
        offset plus 3. At `1,0`, commit and follow-up offsets are 29 and 30.
      - Paint comes from OS `screencapture` with `caret-animation: manual`. The
        positive, negative and duplicate controls run once per anchor before
        composition starts, from an overlay outside the editor. One extra run
        per anchor captures a burst without the stabilizer.
      - Pass: exactly one caret at the preedit end and none at the old point,
        plus the text, focus and selection assertions above. Save a visible
        positive control, an absent-caret control and a duplicate-caret control
        from the same capture path for each anchor. A capture that cannot
        distinguish all three is inconclusive. Record runtime errors and
        frontmost-app checks; a focus loss invalidates the run.

      Proof: five warm runs without retries, recorded in the #5137 plan's
      decision log.
- [x] Probe the `'browser-handle'` preference. After `selection.select` and
      after a real click on the same point, type one character with
      `page.keyboard.type` and press Backspace once. Read the selection
      preference reason and the kernel's input owner for each. Run on all
      five Plite projects. If the two paths match, record that and drop the
      change. If they differ, write the target state (the reason and
      `preferModelSelection` a handle selection leaves, and how the DOM export
      still runs), then update the pinned contract tests in
      `selection-controller-contract.ts` (`:1561`, `:1927`, `:1995`, `:2055`)
      in place. Proof: the probe log and a decision-log row. Closed by
      `docs/plite/research/2026-10-02-agentic-e2e-testing/sources/browser-handle-preference-probe.result.json`:
      the paths match on all five projects, so the change is dropped.
- [x] Replace the paste fallbacks with a per-project `clipboardTransport`. Closed by `packages/test/src/playwright/harness-input.ts`.
      - Remove the three fallbacks in `harness-input.ts` and the
        `handle.insertData` retry in `pastePayloadThroughEvent`
        (`clipboard.ts:372-391`).
      - Add a shared `BrowserTestOptions` type and parameterize the owning
        Plite and www configs. The plain harness functions validate and read
        `test.info().project.use.clipboardTransport` once when creating a
        harness, then pass it to `createEditorHarnessClipboard`. Missing or
        invalid settings fail before a paste; no fixture-import migration or
        paste-call-site engine branches are needed.
      - Use the explicit Defaults map in Plite and its corresponding three
        desktop entries in www. Grant www Chromium clipboard permissions.
        Record the deliberate text-transport change on WebKit and mobile.
      - Poll until the chosen paste applies or times out. Preserve the
        applied-command and selection-effect cases in `didPasteApplyText`,
        including replacing selected text with identical text. A changed text
        value alone is not the success oracle.
      - Add the private handle operation `clearKernelTrace`, backed by
        `clearEditableKernelTrace`, and call it through the page before every
        paste. Update the handle types and authority audit. A Node helper
        cannot call the editor-bound function directly.
      - Attach the chosen transport through that run's `TestInfo`, including
        failures. An explicit handle transport records that it is a stand-in.
      - Record the shortcut and IME stand-ins as deferred in the decision log.

      Proof: a native paste that does not apply fails without a retry, and a
      successful paste after a full trace still passes. Keep the existing
      identical-text replacement behavior. Before execution, use `--list` to
      show that the selected paste and selection-probe specs collect on all
      five projects. Override mobile WebKit's proxy-only matcher for this
      local proof run; preserve its routine proxy coverage. Run the selected
      specs on all five Plite projects and www's existing paste caller in
      `table-resize.spec.ts` on its three projects.

      Closed by `pnpm --filter plite test:plite-browser:project <project>`
      over the ten paste spec files (chromium 381 passed, firefox 340, mobile
      155, webkit 352), a widened-matcher run on mobile WebKit (349 passed, 9
      failed outside paste), `apps/www/tests/browser/table-resize.spec.ts`
      (15 passed) and the red-then-green cases in
      `apps/plite/tests/plite-browser/donor/examples/plaintext.test.ts`. Two
      tests that fail outside this change were excluded; the decision log
      names each exclusion and failure with its owner.
- [ ] Move the page handle to an explicit installer in one step:
      - `useRuntimeBrowserHandle` calls a registered attach function;
        `browser-handle.ts` stays at its path, and `plitejs/react` exports
        `installBrowserHandle()`, which also turns on kernel trace retention;
      - re-export the installer through Plate's `plite-react.ts` and `core.tsx`
        so Plate test apps import it from `platejs/react`;
      - apps/plite, the www dev and test builds, the Plite contract tests and
        the page entries of the benchmark drivers that read the handle install
        it at module scope before their first mount. Install in
        `packages/plitejs/test/react/vitest-setup.ts` too, because the trace
        contract creates an editor without mounting Editable;
      - make installation idempotent. Gate only trace buffer retention in
        `dom-input-runtime.ts`; preserve entry construction and epoch closing
        in `editing-kernel.ts` when no handle is installed;
      - `waitForReady` throws "browser handle not installed" when the root
        mounts without one, and handle readers in benchmarks fail the same
        way;
      - update `kernel-authority-audit-contract.ts` and the specs that import
        `PliteBrowserHandle` by path;
      - rebuild the benchmark pages per `methodology.md:126-129`, and keep one
        production-config benchmark that reads only DOM state. The producers
        include `packages/plitejs/benchmarks/react-text-flow-browser-matrix.mjs`,
        `packages/platejs/scripts/code-block-text-flow-browser.mjs`,
        `benchmarks/editor/benchmarks/plite-external-text-entry.mjs` and
        `benchmarks/slate-v2/donor/browser/react/cross-editor-adapters.mjs`.

      Proof: a committed `tooling/scripts/measure-browser-handle.mjs` shows the
      rebuilt Plite and Plate production imports without the handle's bytes;
      the existing kernel and authority contracts; one Plite and one www
      browser run; each page-building benchmark driver runs once. Record the
      trace-enabled benchmark separately from the DOM-only production control.

      Built: `installBrowserHandle()` in
      `packages/plitejs/src/react/editable/install-browser-handle.ts`, the
      registry in `runtime-browser-handle-events.ts`, the retention gate in
      `packages/plitejs/src/dom/plugin/dom-input-runtime.ts`, the Plate facade,
      `apps/plite/src/app/providers.tsx`, www's providers (development, or a
      test build made with `NEXT_PUBLIC_PLATE_BROWSER_HANDLE=1`), the vitest
      setup, the four benchmark entries and the authority inventories. Plite's
      production import drops the handle (0 references, 10,255 bytes).
      Still open: Plate's production import keeps it, because Plate's
      unbundled `react/index.js` wraps every export in a namespace object that
      defeats tree-shaking (owner: zbeyens; tracked in the decision log). The
      code-block text-flow driver is blocked by another session's in-flight
      `packages/plitejs/src/core/landing.ts`, and the external-text driver by
      its stale ignored baseline bundle.
- [x] Repair what Phase 1 makes false, run Best API's doctrine repair for Closed by `.agents/rules/verify.mdc`.
      `installBrowserHandle()` and `clipboardTransport`, and add changesets:
      - `verify.mdc:264-267`, which says paste can fall back;
      - the benchmark methodology's injected-handle rule;
      - the public docs that teach `openExample`,
        `docs/plite/reference/public-docs/concepts/15-editing-behavior.mdx`
        and `16-selection-and-dom.mdx` beside it. Document the Plite import and
        Plate facade, and the validated project option;
      - `packages/test/README.md`'s `openExample` guidance;
      - patch changesets for `plitejs`, `platejs` and `@platejs/test`.

      Proof: `pnpm install`, then
      `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`, then
      the changeset check.

      Closed by `.agents/rules/verify.mdc`,
      `.agents/rules/benchmark/references/methodology.md`,
      `.agents/rules/best-api.mdc` (opt-in instrumentation taste),
      `docs/vision/plite.md`, the two concept pages,
      `content/docs/(guides)/browser.mdx`, `packages/test/README.md`, and
      `.changeset/plitejs-browser-handle-installer.md`,
      `platejs-browser-handle-installer.md`, `test-clipboard-transport.md` and
      `test-native-trace-key-events.md`; `sync-resources.mjs --check` exact,
      `check-workspace-package-manifests.mjs` and `check-plite-docs.mjs` pass.

### Phase 2. The Android device lane

Exit: the witness unit test and the on-device bypass test pass, and the six
cases give reproducible results in five warm runs on the emulator. A case that
reproduces a product bug records its local issue draft. An expected failure
applies only to that named product assertion after setup and witness gates
pass; `test.fail()` must never make a setup, command-guard or witness error
count as the expected product failure.
A split result is a lane defect until someone attributes it.

- [x] Exclude `packages/test/src/device/**` and `apps/plite/tests/device/**`
      from the Plite CI planner in `tooling/scripts/check-plite.mjs`. Proof: a
      `check-plite.test.mjs` case where a device-only change plans no browser
      job. Closed by the "device lane edits plan package checks but no browser
      job" case in `tooling/scripts/check-plite.test.mjs`, red before the
      change and green after (`node --test tooling/scripts/check-plite.test.mjs`,
      32 passed).
- [x] Probe the open questions and record each in the decision log: Closed by `docs/plite/research/2026-10-02-agentic-e2e-testing/shards/010-android-lane-probes.md`.
      - **UiAutomation effect.** Type the same word with and without a prior
        `uiautomator dump --windows`, and again after force-stopping Chrome.
        Compare `dumpsys accessibility`, the event traces and a page timing
        probe, three runs each.
      - **Content taps.** Map CSS to screen pixels from `devicePixelRatio`, the
        visual viewport and the browser chrome height, and check one tap on a
        known model point.
      - **Suggestion strip.** Type `hel`, dump `--windows`, and record whether
        candidate nodes have bounds, plus the events one strip tap sends. Cut
        case 2 if the strip has no nodes.
      - **English census.** On the neutral `<textarea>` and bare
        `contenteditable` page from shard 009, record the events for letters,
        space with autocorrect, Enter and Backspace, and Korean jamo.

      Proof: the probe logs. Closed by
      `docs/plite/research/2026-10-02-agentic-e2e-testing/shards/010-android-lane-probes.md`
      and its scripts and results in `sources/android-probes/`.
- [x] Add one Android module in `packages/test/src/device` that owns `adb`,
      port forwarding, the key-map cache type and the restore file. It exposes
      only `tap`, `press` and `move`, so it cannot type text. Guard the entire
      CDP connection, including Playwright's internal sessions, to refuse every
      `Input.*` method. Workers attach only through that guarded endpoint;
      wrapping one public `CDPSession` does not enforce this. Add
      `tooling/device/android.mjs` as a thin CLI over it with `setup`,
      `calibrate`, `doctor` and `restore`:
      - setup sets Gboard's settings, adds Gboard Korean, records Gboard's
        version, reads the settings back, and turns on Do Not Disturb on a
        physical phone;
      - acquire the serial lock before any mutation and pass the serial to
        every `adb` command;
      - the restore file follows the macOS never-overwrite rule and records
        every changed setting, the original input method and languages, and
        the invocation's owned tab, forwards and reverse ports. Restore only
        owned resources and changed state, then delete the file on success;
      - `doctor` refuses to start on a stale restore file or a keyboard that
        differs from the recorded one.

      Proof: `doctor` output, wrong-layout and cache-miss failures, and a
      kill-then-`restore`-then-rerun case with settings and resources restored.
      Closed by `packages/test/src/device/android.ts` and
      `tooling/device/android.mjs` on the emulator: `doctor` ok after `setup`
      and `calibrate`; `currentKeyMap` refuses the English map while Korean is
      selected and refuses a missing map; a process killed after `setup`, a
      forward and a reverse left a stale lock that `doctor` refused, and
      `restore` removed only the owned forward and reverse, removed Korean,
      returned Word suggestions to off and deleted the restore file before a
      clean rerun. A Playwright smoke through `startGuardedEndpoint` read the
      page while `Input.insertText` and `page.keyboard.type` were refused.
      Do Not Disturb runs only on a physical phone and is unexercised.
- [x] Add the private lane: Closed by `packages/test/src/device/lane.ts`.
      - A case gets `device.openExample`, `device.open(url)`,
        `device.keyboard.type | tap | use | shown`, `device.tapStrip(slot)`,
        and an editor with the harness's `get`, `assert`, `snapshot` and
        `selection` reads plus `touch.tap | press`.
      - The built-in `page`, `context` and `browser` fixtures throw.
      - The cases live in `apps/plite/tests/device/` and import the lane
        through a tsconfig path alias.
      - Keyboard actions select and confirm the calibrated language, panel
        and shift state before using coordinates. Transitions for `@bi` and
        Korean composition are part of setup proof.

      Proof: a type test rejects `page` and `locator.fill` inside a device
      case. Closed by `apps/plite/tests/device/lane.types.ts` under
      `apps/plite/tests/device/tsconfig.json`, part of the `plite` typecheck:
      its `@ts-expect-error` lines reject `page`, a locator fill and the raw
      `deviceConnection`, and the directive for `page` turned unused (TS2578)
      when `page` was typed as a page. The lane is
      `packages/test/src/device/lane.ts`, reached through the
      `@platejs/test/device` alias in `apps/www/tsconfig.json`.
- [x] Write `judgeDeviceWitness` as one pure function over steps and traced Closed by `packages/test/test/node/device-witness.test.ts`.
      events:
      - Each step carries its `[seqStart, seqEnd)` range, and the trace drains
        after every step. Bound gesture windows, wait for input to settle and
        reject an ambiguous overlap with the next step.
      - `selectionchange` is excluded from delivery matching.
      - Every input event must be trusted and fall inside a lane gesture
        window. Every `beforeinput` and composition update follows its own
        `keydown` with key `Unidentified`, `Enter` or `Backspace`; a tap may
        produce several such pairs (shard 010).
        Built differently (see Execution deviations): each `beforeinput`
        follows its own `keydown`, each `input` its own `beforeinput`, and
        each step names the key class its tap produces. Composition updates
        are not paired, because autocorrect on space sends one before its
        `keydown`.
      - A touch step may carry a composition commit when a composition was
        open.
      - `pointerdown` with client coordinates must land within a few pixels of
        a content touch's target.

      Proof: a unit test over real traces rejects untrusted, out-of-window,
      unpaired-input, wrong-key and wrong-coordinate delivery. Include an insertion
      inside a real tap window that is observationally equivalent to allowed
      input. The judge cannot certify its origin; the command guard must block
      that insertion. Do not assert that an event-only judge rejects it.
      Closed by `packages/test/src/device/witness.ts` and
      `packages/test/test/node/device-witness.test.ts` over
      `test/node/fixtures/device-witness-traces.json`: 9 passed, and the
      trust, input-pairing, missing-key and per-step key rules each failed
      their case when removed. Inside a
      tap window, a CDP `Input.dispatchKeyEvent` with key Unidentified is an
      equivalent trace. adb `input text` and `input keyevent` arrived as an
      Unidentified keydown in one recording and with their real key name,
      which the witness rejects as wrong-key, in the committed one. Neither
      recording shows a composition, so the cause is unknown. A
      script-ended `compositionend` is exempt from the trust rule because it
      delivers no text.
- [x] Add the on-device bypass test behind the device config. Replay Closed by `apps/plite/tests/device/bypass.device.ts`.
      `adb shell input text`, `adb shell input keyevent`, CDP
      `Input.insertText`, CDP `Input.imeSetComposition` and a CDP
      `Input.dispatchKeyEvent` with key `Unidentified` twice each, once
      outside any lane gesture and once inside a real key tap's window. The
      guarded connection must refuse every CDP replay, including a command
      from Playwright's internal keyboard session. Capture unsafe replay
      traces through a separate probe connection, outside a qualifying proof
      run. The witness rejects distinguishable replays and records any
      equivalent traces as its limit. Commit the recorded traces as the unit
      test's fixtures. Proof: the test run on the emulator and guard log.
      Closed by `apps/plite/tests/device/bypass.device.ts` and
      `tooling/device/record-witness-fixtures.mjs`: the guard log lists six
      refused replays on the case's session and one `Input.dispatchKeyEvent`
      from Playwright's keyboard on another session; adb replays outside a
      gesture fail as outside-window, and inside a tap they either pass as
      the witness limit or fail as wrong-key, depending on Gboard's state;
      the case records which in its `witness-limit` annotation.
- [x] Add `apps/plite/playwright.device.config.ts`:
      - one project per device serial with `workers: 1`, `repeatEach: 5` and
        `retries: 0`;
      - the existing `assertRetryFreeBrowserArgs` and `assertBrowserWorkerArgs`
        guards;
      - a lock file per serial.

      `globalSetup` creates one owned tab per serial and persists the serial,
      guarded endpoint and exact DevTools target identity. Each worker
      reconnects with `noDefaults` and reuses that target; no JavaScript `Page`
      object crosses the setup/worker boundary. `globalTeardown` runs restore
      and releases the lock. An interrupted invocation requires explicit
      recovery before another run can start. Each run
      records Chrome's pid, its DevTools target and the served
      `.editor-proof-build.json` fingerprint fetched through the reversed
      port; case 5's run records the www server's identity instead. Proof: a
      run log with one pid and target across five runs and a fingerprint
      matching the local build manifest, plus a forced worker restart that
      reattaches to the same target and an interrupted-run cleanup record.
      Closed by the five-run re-proof after the lint and deslop fixes: Chrome
      pid 14103 and target `A96840B4BD7F881DBB11C86023FD65D1` on all 35 runs,
      build `a5c51ade…` matching `out/.editor-proof-build.json`, www served
      from this checkout at `cf15725603` with dirty fingerprint
      `8bcce9176d70…`. The forced worker restart and the interrupted run ran
      on the earlier bytes (pid 4577, target `4804D5B2…`): a deliberate
      failure moved the next test to worker 1, which reattached to target
      `C96B542284EAB0BEEEBABFAD8FF069C0`, and a SIGKILLed runner left a stale
      lock that `doctor` refused until `restore` cleared it. The lock,
      doctor and reattach code did not change since; global setup's path
      resolution did, and the re-proof covers it only on clean runs
      (decision log).
- [x] Add the six cases from shard 005 as named-defect tests: Closed by `apps/plite/tests/device/`.
      1. A Korean first syllable in an empty paragraph with the placeholder,
         then Enter (Slate #5493, #5883).
      2. A strip tap over a misspelled partial word (`helo`) after a bold
         leaf, where the committed word must differ from the typed prefix and
         a `deleteContentBackward` then `insertText` pair must appear (Slate
         #5643, #5130).
      3. Autocorrect on space after `becuase` in an empty editor (Slate
         #5891).
      4. A collapsed Bold toggle, then typing (Slate #6022).
      5. On www's `/blocks/mention-demo`: `@bi`, an option tap and a backspace
         across the mention, plus a Korean query tapped mid-composition (the
         autocomplete plan's Android gate).
      6. A pending Korean word, then a toolbar block-type tap (Slate #5019).

      Proof: five warm runs each, all five passing, or the same named product
      failure in all five with its local issue draft. Setup and witness gates
      must pass in either result. A disabled case remains open with its owner
      and probe evidence; it does not count as device coverage.
      Closed by `apps/plite/tests/device/*.device.ts` with
      `PLATE_DEVICE_WWW_PORT=3000`: the re-proof passed 30 of 30 case runs
      with clean witness gates, plus the bypass test five of five (Playwright
      JSON stats: 35 expected, 0 unexpected, 0 flaky). Cases 2, 4, 5 and 6
      pass outright. Cases 1 and 3 hit the same named product failures in
      five of five runs, drafted in
      `docs/plite/research/2026-10-02-agentic-e2e-testing/issue-drafts/`.
      Case 5's composing tap is cut: no mention-demo option matches a Korean
      query (owner: zbeyens, tracked in the decision log).
- [x] Repair what Phase 2 makes false or incomplete: Closed by `.agents/rules/verify/references/editor-proof.md`.
      - `.agents/rules/verify/references/editor-proof.md:91-96` names the
        device lane and its emulator scope;
      - `docs/vision/common.md` claim width gains an Android emulator row;
      - `.agents/rules/verify/references/commands.md` adds that device-lane
        evidence is `verify`-scoped and does not satisfy the raw gate;
      - the Appium gate text stays as it is.

      Proof: `pnpm install` and
      `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`.
      Closed by `.agents/rules/verify/references/editor-proof.md`,
      `commands.md` and `docs/vision/common.md`'s claim-width row; the check
      reports exact mirrors.

### Phase 3. iOS probe and the release trust decision

Exit: a keep or quarantine decision for iOS, and a recorded decision on how
releases trust local evidence.

- [ ] Probe iOS Safari on a simulator with the Appium XCUITest driver from
      `~/.appium`: one real-keyboard tap and one model read through
      `executeAsync`. Record whether WDA's attached client changes Safari's
      events, what physical-device signing needs, and whether Appium would
      become a repository dependency. Proof: the probe log and a keep or
      quarantine row in the decision log.
- [ ] Decide how a release trusts local device evidence, for example a
      signed local attestation the gate verifies, before any receipt schema
      change. Proof: a `best-api-review` record for the `proof` scope.

## Evidence

- Governing review: `docs/research/review-records/2026-10-02-proof-agentic-e2e-review.json`.
  It is historical evidence, not the execution scope. Its nightly lane,
  receipt replacement and Pixel 5 narrowing were superseded by this plan's
  Defaults and cuts. Its blanket `fill` and mobile page-read claims also need
  correction against shards 001 and 002. owner: proof tooling, tracked in that
  record and this plan's decision log; the current subject uses the narrower
  source-backed claims. This correction does not reopen the decision against
  adopting e2e.
- Research run: `docs/plite/research/2026-10-02-agentic-e2e-testing/`.
  - Shards 004 and 009 are the device prototypes.
  - Shard 005 ranks the Android cases from 50 Slate threads and 8 Plate
    threads.
  - Shard 006 is the #5137 IME path.
  - Shard 007 is the page-handle audit.
  - Shard 008 is the arena judge.
  - `review/` holds both interrogate passes.
- Prototype facts settled before this plan, each from one emulator run:
  - Playwright attaches to stock Chrome for Android over `adb` and CDP with no
    flags.
  - Real Gboard touches type correctly, and the model oracle reads every step.
  - `uiautomator dump --windows` lists every Gboard letter key with bounds.
  - English Gboard sends committed `insertText` per letter, even in a plain
    `<textarea>`.
  - A real touch, `adb shell input text` and CDP `Input.insertText` each leave
    a distinct `keydown` shape in those isolated probes. This does not prove
    event-only rejection of an insertion inside a real gesture window.

### Challenge delta

improved, over two `pstack:interrogate` passes of three Opus reviewers each.

`pstack:architect` compared three drivers: Playwright-native, Appium-unified
and agent-device. The cross-judge picked Playwright-native at 16 of 18, with
grafts from the other two.

The first pass raised 70 findings:
- **Deleted:** receipt schema 2, its reporter, the release-gate rewiring, the
  scenario matrix revision, a published device entry and bin, and a pre-PR
  www check.
- **Moved:** the #5137 lane to Phase 1.
- **Added:** `seq` correlation, `noDefaults`, per-serial projects, the
  UiAutomation probe, the handle inversion and the doctrine list.

The second pass raised 52 findings. It found that the first revision's
`'browser-handle'` deletion would have inverted its own goal.
- **Replaced:** that deletion with a probe across all five projects; the
  per-call paste option with a per-project transport; and per-key signatures
  with a structural witness and a CDP `Input.*` guard.
- **Deleted:** the Pixel 5 relabel step, whose proof could not fail.
- **Moved:** case 5 to www's mention demo, the installer to `plitejs/react`,
  and each doctrine repair into the phase that breaks it.
- **Added:** the CI planner exclusion, a single OS capture path, one Chrome
  launch per run set, host locks and never-overwrite restore files.

## Proof

Each step names its own proof. The plan closes when every box is checked with
its artifact and `node .agents/pstack/plan-open.mjs` passes. Native claims
count only after five warm runs without retries on the named surface. Emulator
runs prove Chrome for Android and Gboard on that image. Physical phones, other
keyboards and iOS stay open, each with an owner in the decision log.
