---
review_scopes: [proof]
review_basis: []
work_kind: implementation
review_commit: 28295bc8404cf075d9dc388570c9fa2f832a62da
review_inputs: [apps/www/playwright.config.ts, apps/plite/playwright.config.ts, packages/test/src/playwright/artifacts.ts, packages/test/src/playwright/harness.ts, packages/test/src/device/lane.ts, .agents/rules/verify.mdc, oxlint.config.ts, tooling/scripts/check.mjs]
---

# Failing browser specs save each editor's state

Status: executed: landed on next; the demo of solving a failure from the file alone stays open
Playbook: plan

Pursue. When a www or Plite browser spec fails today, its output folder holds a screenshot and an accessibility tree, and neither says what the editor held. The model value, the selections and focus reach that folder only when a spec saves them itself, and two of 142 spec files do. `@platejs/test/playwright` will export `test` and `expect`. Its `test` adds an automatic fixture that depends on the test's browser context and has its own time slot. When a test fails, that fixture reads every editor on every open page, frame and context of the test's browser before the context closes, and saves `editor-state.json` beside the screenshot. The 137 spec files in the two browser folders import from the package, and a check step keeps them there, including the 49 Plite donor specs that oxlint skips. A harness-only hook would miss plain `expect` failures, timeouts and the 31 spec files that never build a harness, and a rerun with a trace still shows no model.

## Brief

### What will change?

When a browser test fails, its results folder now also holds each editor's document, selections, focus and input state, and agents read it before they fix anything. Browser traces stay off in www, because they cost about 30%.

### What could go wrong?

Four probes, and failures that start during cleanup, still save nothing. The trial of solving one failure from the file alone never ran, because each case we tried was solvable from the code. An unrelated autoformat test already fails.

## Teach

A browser test drives a real editor page through Playwright. When one fails, Playwright saves a screenshot and a text outline of the page, but nothing from inside the editor: not its document, not where Plate thinks the cursor is, not where the browser draws it.

Each Plate editor on a test page carries a small handle that tests can read. Today a test must call a save helper itself to keep what that handle says, and almost none do.

After this change, the test function every browser spec imports adds one step after each test, before Playwright closes the browser context. When the test failed, that step reads each editor on every page and frame through its handle and saves one file next to the screenshot. A part it could not read says why, so a selection never read cannot pass for an empty one. The verify instructions tell agents to read that file before they patch.

## Public API

A spec imports `test` and `expect` from the package instead of from Playwright, and that `test` adds one internal fixture, `_editorState`, hidden from reports, which specs never set or read.

```ts before
// apps/plite/tests/plite-browser/focus-blur.test.ts
import { expect, test } from '@playwright/test';
```

```ts after
// apps/plite/tests/plite-browser/focus-blur.test.ts
import { expect, test } from '@platejs/test/playwright';
```

## Main changes

- Every spec file in `apps/www/tests/browser` and `apps/plite/tests/plite-browser`, 137 files, imports `test` and `expect` from `@platejs/test/playwright`. A new `pnpm check` step, `browser-test-imports`, refuses a runtime load of Playwright's own `test` in those folders, through an import, a re-export, `require` or `import()` under any name, or any other call that passes Playwright's module name except a call named `resolve`, because oxlint ignores the Plite donor folder. At runtime a spec takes from Playwright only the browser types, `devices`, `request`, `selectors`, `errors`, `defineConfig`, `mergeTests` and `mergeExpects`. `mergeTests()` with no tests still returns Playwright's bare test, which has no browser, context or page, so only a refused opener below could give it an editor. It also refuses a call that opens a context or browser apart from the test's: `newContext`, including `request.newContext()`, which the check cannot tell from a browser's by name, `newPage` on the worker's `browser`, `launch`, `launchPersistentContext`, `connect` on a browser type or the `browserType` fixture, and `connectOverCDP`. An editor in a context the spec opens and closes itself is gone before the capture runs. A measurement call that needs its own browser carries a marker comment with its reason above the statement that holds it, and the check refuses a marker that excuses nothing. A marker never excuses an import. The check's fix mode moves the imports.
- Specs that open their own context only to set options move onto the test's: richtext's seven Mac user-agent tests and the IME cost probe through `test.use` in their own describe blocks, and the four markdown streaming correctness tests through pages they open in the test's context. The S5 bench keeps its own browser behind markers, and on a bench run the capture adds the worker's browser, which sits idle. The authored mounted performance probe closes each arm's context before its verdict, and the kit lifetime probe unmounts its editors as part of what it measures, so both keep their code, carry markers and get no editor state.
- Four page closes go: two in `yjs-hocuspocus.test.ts`, one in `huge-document.test.ts` and one in `suggestion-page.spec.ts`, where the closed page held the editor the failing comparison reads.
- verify's Drive section says to read a failed spec's saved files before patching or driving again, unread fields first, names what gets no editor state, and says reading never replaces the hand drive.

## Layer and owner

| Delta | Current capability | Layer | Package | Why |
| --- | --- | --- | --- | --- |
| added | Editor state at a failed test | proof tooling | `@platejs/test/playwright` | Its `test` reads every editor handle in the test's browser when a test fails, so no spec has to. |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where the capture runs | An automatic step in the package's test function, with its own time slot, after any failed browser test, on every editor in every page, frame and context of the test's browser (look) | Only when one of the harness's own checks fails | harness only | big |
| Lanes that start their own browser | The markdown streaming bench, the kit probe's extra browsers and the native IME lane get no editor state, and verify names them (look) | Playwright's private hook that runs before each context closes, which would also read contexts a spec closes itself, at the cost of private Playwright API in a published package | own browsers | small |
| Probes that clean up before the test ends | The authored performance probe and the kit probe keep their cleanup and get no editor state, and verify names them (look) | A page-side call that saves state before a probe unmounts, added to both probes, at the cost of one more public call and edits to two measurement probes | snapshot probes | small |
| Failures after the capture | A failure that starts in an afterAll hook or in a fixture torn down after the capture gets no file. The guide says to extend the package's test or list it first in mergeTests, which covers a consumer fixture the context does not depend on (answer) | Capture every test and keep the file only when the final result fails, which costs every passing test a capture and needs a reporter to write the file | capture always | small |
| What keeps specs on the package | A check step over the two browser spec folders, because oxlint's ignore list drops the donor folder, which holds 49 of Plite's 62 spec files | An oxlint ban that reaches only the other folders | oxlint ban | small |
| The assertion import moves too | Specs import both the test function and its assertions from the package, in one line | Only the test function moves | test only | small |
| What the file holds | Per editor: the value, the model selection, the handle's range, the mapped browser selection when both of its ends belong to that editor, the raw browser selection with each end's node and owning editor, focus, the text each top-level block shows, without Plite's placeholder character and the newline a line-end span adds, input state, the last commit and the last 20 kernel trace entries; each marked read, cut or why it was not read. Each context says whether it is the test's own. The file keeps every error Playwright recorded before the capture, in order, so a cleanup error never replaces the test's own. It says the state was read after the afterEach hooks and earlier cleanup, and whether a timeout was recorded | Also page errors and a derived list of disagreements between fields | page errors | small |
| Large documents | Each field has a byte limit, each frame 1 MiB and the written file 4 MiB. A field over its limit has its long strings and lists shortened, and a value or block text over its limit keeps only the blocks within 10 of the top-level index of each end of the model selection, whatever root holds that end, and of each end of the browser selection, or the first 21. When a value has several roots and its other keys still do not fit, each of those keys becomes its size. Over the frame limit, the capture drops fields one at a time, the value first and the model selection last, starting with editors that lack focus. Over the file limit, the capture drops the value, block text, commit and trace of other contexts, then those contexts. Only then does it drop the same fields from the test's own context, then shrink its frames to their address, and past that it only counts them. Each cut says so | The whole value, however large | whole value | detail |
| Trace recording in www | Off. Keeping traces made four www specs about 30% slower in step 7, so recording stays off and an agent reruns one failing test with a trace | Record a trace for every www test and keep it on failure | trace www | small |
| Expected failures | A test marked as expected to fail gets no file when it fails, as Playwright's own screenshot rule does | Capture them too | capture expected | detail |
| The real-failure demo | plate#5280's whole-line copy in the Yjs collaboration example with its fix reverted, unless a first agent finds the cause from the source alone. Two agents get the new file and two get a listed packet without it, and a separate reader scores them against an answer key written first. It passes only when the file's values lead the agents with it to the cause, and a tie is a gap | The focus-settle drag fix, which failed only 3 times in 25 runs | focus demo | detail |
| How this plan sits in the review ledger | A plan of the proof subject that adopts no earlier review | A new review of the whole proof question | review it | detail |
| Page link | A new proof page, 67Qh93t2kE15qfLRWrRHJ7, because the old one, XqsY1CcceaevUNqabTFPbw, was deleted | Go back to the old page | old page | detail |

## Evidence

### Requirements

- [ask] A failing spec saves the model value, the model selection, the DOM selection with a collapsed caret, and focus.
- [ask] verify tells agents to read a failed run's artifacts before patching, and that reading never replaces the hand drive.
- [ask] www gets a trace mode pick.
- [intake] One real failure is worked out from the saved file alone (docs/plans/2026-10-27-e2e-latest-intake.md, Brief).
- [lead input] The file marks every field the capture could not read, so it cannot pass for an observed null, and keeps the test's own error apart from any capture or cleanup error (e2e 82039ad6 and 11c09514).
- [lead] Every spec that runs on the browser Playwright gives the worker gets the file with no per-spec capture code, holding every editor still mounted when the test ends. Four probes get no editor state: the S5 bench and the native IME lane run their own browser, the kit probe unmounts its editors as part of what it measures, and the authored performance probe closes each arm's context before its verdict. A failure that starts after the capture, in an `afterAll` hook or a fixture torn down after it, gets no file. These gaps stay open for the owner, zbeyens, until a public way to save such state exists.
- [lead] The capture never changes a test's result or adds an error to it, and it ends within a fixed time when the page hangs or has closed.
- [law] `@platejs/test` is published, so the new export is a public API change: one way to do it, documented, with a changeset and the import smoke list updated.

### Design arena

Three runners designed it from one brief, and a fourth model judged copies with the names removed. All three put the capture in a package `test` that reads every editor root through the page, stops at five seconds and never throws. They differed on specs that open their own contexts. The judge and the lead both picked the smallest candidate as the base, which adds nothing public beyond `test` and `expect`, and grafted per-field read outcomes, the test's status and errors, a check that reaches the donor folder, and moving richtext's seven tests onto the test's context. The plan panel then moved the capture from an override of `context` to an automatic fixture that depends on it, because a consumer fixture that replaces `context` skipped the override, and its second round named that fixture `_editorState` and boxed it, as Playwright does with its own internal fixtures.

| Lane | What it does | Coverage of the requirements | Verdict |
| --- | --- | --- | --- |
| Control: change nothing but verify | verify tells agents to rerun the failing spec with a trace and attach state themselves | No state saved by default; a trace shows DOM snapshots but no model value or selection | rejected |
| Trace on failure everywhere | `trace: 'retain-on-failure'` in both configs | With `retries: 0` it records every test to keep a few; still no model value, model selection or focus owner | rejected |
| Harness hook | The harness saves its state when one of its own checks throws | Misses `expect` on a getter, `expect.poll`, timeouts and the 31 spec files with no harness | rejected |
| Automatic fixture on `page` | On failure, read the test's page | Creates a page in tests that take none | rejected |
| Package `test` that overrides `context` | On failure, read every editor root before the context closes | A consumer fixture that replaces `context` drops it, and it shares Playwright's teardown time | replaced in panel |
| Package `test` with an automatic fixture on `context` | On failure, read every editor root on every page and frame of every context, save one file | Meets every requirement but the four probes and the failures that start after it; costs two exports and the import move | picked |
| Plus a public helper or browser list for extra contexts | Specs that open their own context or browser hand it to the package | Covers the own-browser lanes at the cost of public surface | rejected |
| Playwright's internal hook before each context closes | Read each context a spec opens just before it closes, as Playwright's own failure screenshot does | Covers the S5 cells, the authored probe's arms and the own-context specs with no moves, but puts private Playwright API in a published package that nothing guards | rejected |

A Playwright 1.61 probe on stand-in pages showed the teardown runs with the failed or timed-out status set and every page and iframe still open, a throwing getter stays isolated, a busy page stops at the budget, and passing and expected-failure tests are skipped. A second probe replaced `context` through a consumer's `extend` and through `mergeTests` in both orders. The automatic fixture captured in all three; the override, tried with `extend`, captured nothing. When an `afterEach` had nearly spent the teardown time, the override added a teardown timeout to the test's errors and the automatic fixture added none.

### Dependents

The consumers this change touches are the www and Plite browser specs, the browser guide at content/docs/(guides)/browser.mdx, packages/test/README.md, the import smoke list in packages/platejs/test/public-package-import-smoke.spec.ts and verify's Drive section.

Model: claude-opus-5-5 at xhigh. Design arena: claude-opus-5-5 @xhigh, gpt-6-astra @xhigh and gpt-6.1-sol @xhigh, judged by claude-opus-5-5 @xhigh. Plan panel: the same three seats. This plan adopts no earlier review of the proof scope: its head, 2026-10-10-proof-android-review, asks how to prove Android typing, which this plan does not touch, so that Pursue stays open.

## Steps

- [x] Add `test` and `expect` to `@platejs/test/playwright`, with the boxed `_editorState` fixture and the file write in one new module and the reader Playwright sends to each frame in another. Reads stop after four seconds and the write gets the last second: the capture creates the output folder and writes a partial file without blocking, renames it when done, and registers it through `testInfo.attachments`, so nothing synchronous runs inside its limit. Proof: a Playwright child run, logged in the run directory, drives the built module over stand-in editor pages, and a checker reads each saved file. No committed test drives it, because one needs a Playwright child run that cannot fit the 5,000 ms test deadline, and the Tests rule sends such a case to runtime proof. On a failed `expect` the run covers editors in the main document, an iframe, an open shadow root, a second page and a second context; a collapsed caret off the model point; two editors with the same path where only one holds the caret; a caret in an editor nested in another editor's void; a selection that spans two editors; a mapped selection the handle returns as null; a throwing getter; a long paragraph, a large commit and a long input-state string cut and marked; a browser caret far from the model selection, whose block the value keeps; frames and long addresses past the file limit, checked on the bytes written; a busy page, which must still save a file that parses with that frame marked; a write that stalls past the limit, which must attach no file and warn that it was not saved in time; a test timeout; a consumer `extend` and both `mergeTests` orders that replace `context`; a consumer automatic fixture that fails in teardown, through `extend`, both `mergeTests` orders and as a fixture the context depends on; and an `afterEach` that nearly spends the teardown time. It checks there is no file for a passing test, an expected failure or a failure in `afterAll`. The diff panel's first round added blocks behind wrappers like www's drag handles, rendered text past its declared length, a caret in a long text node, an error message past its limit, a value whose editor shows a named root, other contexts past the file limit, one frame past the frame limit and a `test.fail()` test that times out, each of which must save a file, and a `context` override whose setup fails, which saves none. The shadow-root case runs on Chromium, where the shadow root has its own selection, and on Firefox and WebKit, where it has none, so the capture reads the document's selection as `getDOMSelection` does and names that source; each engine's expected result comes from that run. The nested case also runs once on the real Editable Voids example with a planted failing assertion, where the outer editor's mapped selection must say another editor owns it. The demo in step 6 reads a real editor's handle too.
- [x] Move the imports of the 137 spec files to the package and add the `browser-test-imports` check step. Proof: the check exits 0 on the tree. Its tests refuse each runtime import form (named, renamed, default, namespace, re-export, `require` and dynamic import), Playwright's test reached through a module member such as `extend`, an internal export such as `_baseTest` or a renamed `require`, each own context or browser call (`newContext` on a browser or `request`, `newPage` on `browser`, `launch` including `playwright.chromium.launch` and a chain split over a conditional, `launchPersistentContext`, `connect` on a browser type or the `browserType` fixture, and `connectOverCDP`), an unmarked call in a file that holds marked ones, a marker above an import, and a marker that excuses nothing. They accept a marker above a statement that spans several lines, type imports, inline `import('@playwright/test').Page` types, the other Playwright exports, `newPage` on a context, `net.connect` and the runner script's `require`.
- [x] Move the own-context specs onto the test's context, drop the four page closes, and mark the measurement sites that keep their own browser or context. Proof: richtext on Plite Chromium and its mobile project, the markdown streaming contract and suggestion page specs on www Chromium, and the Yjs Hocuspocus and huge document specs on Plite Chromium pass.
- [ ] Update the browser guide, the package README, the import smoke list and a changeset, and run `best-api repair` on the new export. Proof: plate-docs on the guide and the smoke spec.
- [x] Add verify's paragraph on reading a failed run first. It names `editor-state.json`, `error-context.md` and the screenshot, says to check unread fields first and to fix what the file already shows, names `--trace retain-on-failure` for www and `PLITE_BROWSER_TRACE=1` for Plite, names the four probes with no editor state and the failures that start after the capture, says a page that stays busy past the capture's deadline and Playwright's own also loses the page outline, and says reading never replaces the hand drive. Proof: `pnpm run prepare` and the sync-resources check.
- [ ] Work out one real failure from the saved file. In a detached worktree, revert the example half of "let copy and paste work over a whole line in the Yjs examples" and run "copies a whole selected line and pastes over another in every peer" on Plite Chromium three times, red each time. Before any agent starts, write an answer key to the run directory: the cause, the code that owns it and the saved values that show it. Build two packets from a written file list with no history, docs or issue tags: the spec, the example source, Plite's clipboard and selection modules, `error-context.md` and the screenshot, and for the second packet also `editor-state.json`. List each packet's files and confirm the first holds no copy of the capture. A first fresh agent gets the first packet's source files without any failure output; if it names the key's cause, the demo moves to another reverted fix whose source shows no suspect, chosen the same way. Then two fresh agents get the first packet and two get the second, and none drives a browser. A separate fresh reader scores the four answers against the key. The pass rule is fixed before the run: each agent with the file names the cause and traces it from specific saved values to the defect and its repair, those values are ones the first packet lacks, and no agent without the file names the same cause. Any other result is logged as a gap and leaves the requirement open. Proof: the key, both file lists, the five answers and the reader's scoring.
- [x] Time a sample of www specs with trace off and with `--trace retain-on-failure`, and set the www trace row from the numbers. Proof: both timing logs.

## Proof

Each step names its proof. After the import move, a sample of www and Plite specs runs on Chromium, and `pnpm check --affected` runs before landing.

## Completion Gates

Suggested task t_8ec3a26c authorizes this build and its landing. One delegate builds step 1's module, a second builds steps 2 and 3, and the lead writes steps 4 and 5 and runs every proof.

| Gate | Applies | Evidence |
| --- | --- | --- |
| Panel on this plan (api-plan) | yes | round 1: 9 critical; round 2: 11 critical on 5 issues, 2 left open with owners; round 3: 8 critical on 6 issues, all applied; round 3 is the last before the build |
| Blast radius before delegating | yes | the entry already imports Playwright's `test` at runtime (`harness-input.ts:1`), and `packages/test`, `apps/www` and `apps/plite` resolve one copy of `@playwright/test` 1.61.0; no file re-exports the entry |
| Typed lint on the task's lintable files before the diff panel | yes | 0 warnings and 0 errors on the 95 lintable paths; oxlint skips the 49 donor specs, which the new check covers |
| Writing passes: deslop and no-comments on code, unslop on prose | yes | after the build and after each of the diff panel's three rounds; round 3 added no comment, so no-comments skipped it |
| Panel on the diff (api-build) | yes | round 1: 8 critical on 7 issues; round 2: 5 critical on 4 issues; round 3: 7 critical on 3 issues, one fix reverted to its earlier shape and two dismissed with a run that shows the case; three rounds is the cap |
| best-api repair on the new export | yes | no live doc, rule or recipe teaches the old import; the subject file takes the call shape at the close |
| plate-docs on the browser guide | yes | build:source, check:docs, build:registry and its --check pass on the final guide (rows 87 and 90) |
| Changeset for `@platejs/test` | yes | `.changeset/test-failed-editor-state.md`, a patch |
| verify loaded before the first proof gate | yes | loaded before step 1's proof |
| `pnpm run prepare` and the sync-resources check after the verify edit | yes | prepare regenerated `.agents/skills/verify/SKILL.md`; sync-resources `--check` printed exact |
| Workflow smoke of the verify paragraph, Claude Code and Codex | yes | partial: Codex names the saved files, unread fields first and the Bug fix playbook in all three rounds; after the playbook pointer, Claude Code reads the saved files before it patches and takes the Bug fix playbook, but never says to check unread fields first (rows 85 and 86) |
| thermos per slice | skip: api-build owes a panel on the diff | skip |
| Hand drive and playtest | skip: no page a user sees changes | skip |
| Benchmark rerun | skip: the capture reads only after a failed test, but its fixture sets up the test's context for every test, so a test that took only `browser` now runs beside one idle context; the S5 bench, the authored mounted performance contract and the kit lifetime probe wait in Open work for their next run | skip |

## Close

Reversals and deviations come first.

- Step 6's demo did not meet its pass rule, so the [intake] requirement stays open. A fresh agent given only the code named the cause of the Yjs whole-line copy fix, so the demo moved on, as the plan said. The preedit caret fix stayed green with its code reverted, 3 runs of 3. The composed-text fix failed 3 of 3 on its bold-link case, but a fresh agent named that cause from the code too. No case met the gate, so the agents with and without the file and the scorer never ran (row 77).
- The diff panel reverted two of its own fixes. Round 2 dropped round 1's raw copy of each block's text, because telling a browser's text from Plite's own markup would copy Plite's rendering rules into the reader (row 68). Round 3 put back round 1's selection centres, because round 2's root filter dropped the window around a node selection in a named root (row 72).
- The first workflow smoke showed that Claude Code, asked about a failed www spec, never reached verify's new paragraph. Beyond the plan, the Bug fix playbook's reproduce step now points to it. The paragraph now says "browser spec", drops the owner's name, and says to fix what the file shows instead of every defect it shows (row 85).
- Firefox's document selection reaches into an open shadow root, so on Firefox the capture maps a shadow-root caret, while WebKit's shows only the body. The proof's checker had guessed WebKit's result for Firefox before any Firefox run, and now takes Firefox's from its own run, as step 1 says (row 84).

What landed. `@platejs/test/playwright` exports `test` and `expect`. Its `test` adds the boxed `_editorState` fixture, which reads every editor through the in-page reader when a test fails or times out unexpectedly and saves `editor-state.json` beside Playwright's screenshot. The 137 spec files in the two browser folders import from the package, and the `browser-test-imports` step keeps them there. The own-context specs moved onto the test's context, four page closes went, and the measurement sites that keep their own browser carry markers. The browser guide, the package README, the import smoke list and a patch changeset teach the new import. verify's Drive section and the Bug fix playbook tell agents to read the saved files first, and www keeps trace recording off (row 81). The subject file takes the call shape, the new capability and this plan's open work.

Proof and its limits.

- The capture's 41 Playwright child-run cases on Chromium and WebKit and the late-rename case pass their checker on the final bytes (row 78), and the shadow-root case passes on Firefox (row 84). No committed test drives the capture, because a Playwright child run cannot fit the 5,000 ms test deadline.
- On the real Editable Voids example, the outer editor's mapped selection says another editor owns the caret, and the child maps it (row 82). The first real www failure the capture met, the autoformat case, saved a file that shows the missing `>` commit (row 80).
- Step 3's www specs pass in 7 runs on a warm server, and its Plite specs pass on Chromium and the mobile project (rows 79 and 83). Traced www runs took 13%, 55% and 24% longer than untraced ones (row 81).
- The docs checks pass on the final guide (rows 87 and 90). The workflow smoke is partial, as Completion Gates says (row 86). `pnpm check --affected` runs at landing.

Counts. Of 7 steps, 6 are done and step 6 ends in a gap. Of the 4 requirements from the asks and the intake, 3 are met and the intake demo stays open. The diff panel ran its 3 rounds, the cap, with 8, 5 and 7 critical findings, each applied, reverted to an earlier shape or dismissed with a run that shows the case. The subject fold is row 88.

## Open work

- The S5 bench, the kit probe's extra browsers and the authored performance probe's arms close their own contexts inside the test, so they get no editor state. owner: zbeyens, stop: Playwright offers a public hook that runs before each context closes.
- The native IME lane drives a Chrome it connects to over CDP, so it gets no editor state. owner: zbeyens, stop: a public way to hand that browser to the capture.
- The kit probe unmounts its editors as part of what it measures, so even a hook before its context closes would find none. owner: zbeyens, stop: a page-side call that saves state before the probe's own cleanup.
- On an S5 bench run the capture adds the worker's idle browser and one context per cell, and the authored mounted performance contract and the kit lifetime probe now run beside one idle context, which nobody has measured. owner: zbeyens, stop: the next S5 bench run, which compares one cell with and without the capture, and the next run of each probe.
- A failure in the setup of a `context` override gets no file, because the capture's fixture depends on that context. No spec in either folder overrides `context` today. owner: zbeyens, stop: the first spec that overrides `context`.
- A failure that starts after the capture, in an `afterAll` hook or a fixture torn down after it, gets no file. owner: zbeyens, stop: a Playwright hook that runs after every teardown while the browser is still open.
- Nothing committed fails when Playwright's fixture order or a handle getter's name changes. owner: zbeyens, stop: `platejs/testing` exports the handle's type, so the capture can type the getter names it reads.
- No real failure has yet been worked out from `editor-state.json` alone, so the [intake] requirement stays open. owner: zbeyens, stop: a reverted fix whose code shows no suspect, or the owner drops the demo.
- `autoformat:text-substitution-native-input` fails on www Chromium before and after this change. owner: zbeyens, stop: the next run of the autoformat kit work.
