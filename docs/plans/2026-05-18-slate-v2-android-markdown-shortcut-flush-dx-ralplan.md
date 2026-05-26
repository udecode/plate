# Slate v2 Android markdown shortcut flush DX ralplan

Status: done
Runtime id: `019e38e2-368d-76d0-bccb-a77c561625be`
Previous runtime id: `019e3627-238b-7993-a8cf-26be45504c47`
Current pass: `verification-sweep-pass`
Current pass status: complete
Next pass: none

## Current verdict

No. `scheduleAndroidMarkdownShortcutFlush(editor)` is not the absolute-best
canonical DX.

It is a valid local workaround for Android's deferred text-diff path, but it is
the wrong thing to teach in the first-party markdown example. The example asks
app code to:

- subscribe to raw native `beforeinput`;
- wait for a microtask;
- read Android pending diffs;
- reconstruct would-be model text;
- know that a pending diff ending in a space should force an Android flush;
- call an Android-specific DOM capability.

That is runtime plumbing, not app authoring. Raw Slate users should express the
model behavior once through `extension.transforms.insertText(...)`; Slate React
should own Android native-input timing.

Accepted final target:

- Keep `markdownShortcuts()` as a Slate core extension using transform
  middleware.
- Remove Android-specific scheduling from the public example.
- Do not reintroduce public `Editable inputRules`, `EditableInputRule*`, or a
  raw Slate markdown-shortcut API.
- Add an internal React/DOM runtime bridge so Android pending text diffs use the
  existing flush path when `transform:insertText` middleware is registered.
- Do not duplicate markdown shortcut detection in the Android runtime. The
  runtime should not know about spaces, headings, lists, or block-start rules.
- Keep rich semantic input-rule families in Plate.

Current score: `0.92` as an implemented local-regression slice. Exact
`#4532` closure still needs raw Android browser/device proof.

## Intent boundary

| Field                | Decision                                                                                                                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent               | Decide whether Android markdown shortcut support should stay as userland `onDOMBeforeInput` plumbing or become a runtime-owned bridge behind the existing transform middleware API.             |
| Desired outcome      | The markdown example has no Android-specific helper, no microtask, and no pending-diff reads. App logic remains a normal Slate extension.                                                       |
| In scope             | `site/examples/ts/markdown-shortcuts.tsx`, Android pending diff flush timing, transform middleware dispatch, focused tests/proof plan, and issue `#4532` accounting.                            |
| Non-goals            | Building the fix in this Ralplan pass; adding product markdown APIs to raw Slate; adding Plate-style input rules to `slate-react`; claiming Android issue closure without device/browser proof. |
| Decision boundary    | This plan may choose an internal Slate React bridge and test route. It may not edit `.tmp/slate-v2` source during Ralplan.                                                                      |
| User decision needed | None for this pass. The current helper is too low-level for canonical DX.                                                                                                                       |

## Live source evidence

| Surface                    | Evidence                                                                                          | Current shape                                                                                                                | Verdict                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Markdown example call site | `.tmp/slate-v2/site/examples/ts/markdown-shortcuts.tsx:89`                                        | `<Editable onDOMBeforeInput={() => scheduleAndroidMarkdownShortcutFlush(editor)} ... />`                                     | Bad canonical DX.                                                                     |
| Markdown behavior          | `.tmp/slate-v2/site/examples/ts/markdown-shortcuts.tsx:100` and `:195`                            | `markdownShortcuts()` owns `insertText({ editor, next, text })` transform logic.                                             | Keep this as public authoring shape.                                                  |
| Android helper             | `.tmp/slate-v2/site/examples/ts/markdown-shortcuts.tsx:293`                                       | Reads `editor.api.dom.androidPendingDiffs()`, reconstructs `beforeText`, then calls `androidScheduleFlush()`.                | Move this timing concern into runtime.                                                |
| Raw Android APIs           | `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts:69` and `:185`                         | `androidPendingDiffs` and `androidScheduleFlush` are public DOM capability methods marked experimental and Android-specific. | Keep as low-level escape hatch only, not example DX.                                  |
| Runtime beforeinput        | `.tmp/slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts:231`              | Android manager handles beforeinput before generic `applyInputRules`.                                                        | Any future rule bridge must be Android-aware, not bolted on after this return.        |
| Internal input-rule hook   | `.tmp/slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts:256`                      | `applyInputRules` is currently hardcoded to `false`.                                                                         | Do not revive as public API without overturning prior plan.                           |
| Browser handle             | `.tmp/slate-v2/packages/slate-react/src/editable/browser-handle.ts:272`                           | Programmatic `insertText` can call `applyInputRules` before command dispatch.                                                | Historical pressure point, but current accepted public shape is transform middleware. |
| Android manager            | `.tmp/slate-v2/packages/slate-react/src/hooks/android-input-manager/android-input-manager.ts:825` | Storable Android text input becomes pending diffs, then later flush applies an `insert-text` command.                        | Correct owner for flush timing.                                                       |
| Transform middleware       | `.tmp/slate-v2/packages/slate/src/core/transform-middleware.ts:117`                               | Runtime can know when `transform:insertText` handlers exist.                                                                 | Good internal detection point for eager Android flush.                                |
| Prior hard cut             | `docs/slate-v2/references/pr-description.md:656`                                                  | Public `EditableInputRule*`, `editableInputRules(...)`, and `Editable inputRules` are absent by design.                      | Do not reopen this unless a later pass proves transform middleware cannot solve it.   |

## Before and after target

Current example:

```tsx
<Editable
  autoFocus
  onDOMBeforeInput={() => scheduleAndroidMarkdownShortcutFlush(editor)}
  placeholder="Write some markdown..."
  renderElement={renderElement}
  spellCheck
/>
```

Target example:

```tsx
<Editable
  autoFocus
  placeholder="Write some markdown..."
  renderElement={renderElement}
  spellCheck
/>
```

The extension stays the visible customization point:

```ts
const markdownShortcuts = () =>
  defineEditorExtension<CustomEditor>()({
    name: "markdown-shortcuts",
    transforms: {
      insertText({ editor, next, text }) {
        if (applyMarkdownShortcut(editor, text)) return;

        next();
      },
    },
  });
```

Internal bridge target:

```ts
if (canStoreDiff) {
  storeDiff(start.path, diff);

  if (diff.text && hasTransformMiddleware(editor, "insertText")) {
    scheduleFlush();
  }

  schedulePendingSelectionAction();
  return;
}
```

The exact helper name is not final. The principle is final: apps should not read
Android pending diffs to make model shortcuts work, and the runtime should not
grow markdown-specific predicates.

## Decision brief

Principles:

- Model behavior belongs in Slate model transforms, not DOM event parsing.
- Slate React owns browser and Android timing.
- Raw Slate stays unopinionated; Plate owns rich input-rule families.
- First-party examples should show the durable public contract, not the mobile
  workaround.
- Browser/mobile fixes need executable proof before issue closure.

Top drivers:

- The markdown example already has the right public model hook:
  `transforms.insertText`.
- Android pending diffs are an implementation detail of the native-input
  manager.
- Reintroducing public input rules would conflict with the accepted Slate/Plate
  ownership split.

Options:

| Option                                                     | Pros                                                                                                                                               | Cons                                                                                           | Verdict                                                           |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Keep `scheduleAndroidMarkdownShortcutFlush` in the example | Smallest diff; preserves current behavior.                                                                                                         | Teaches app authors Android pending-diff internals.                                            | Reject.                                                           |
| Add raw Slate markdown-shortcut API                        | Very easy example.                                                                                                                                 | Product policy in raw Slate; Plate owns this category.                                         | Reject.                                                           |
| Reintroduce public `Editable inputRules`                   | Familiar from Tiptap/Plate; could share native and proof-handle text policy.                                                                       | Already cut for good reasons; React/beforeinput-shaped public API fights transform middleware. | Reject for this pass.                                             |
| Internal transform-aware Android flush                     | Keeps public DX as `extension.transforms.insertText`; hides Android plumbing; aligns browser handle, native input, and programmatic command paths. | Needs focused proof that the extra flush is scoped to editors with `insertText` middleware.    | Choose.                                                           |
| Public generic Android flush predicate                     | Lets apps control timing directly.                                                                                                                 | Still asks app authors to know Android timing.                                                 | Reject unless later proof shows internal detection is impossible. |

## Decision hardening pass

Pass result: complete.

The critical question was whether the runtime should flush only for whitespace
or markdown-looking pending diffs. It should not. That would move product policy
into `slate-react` and recreate the userland helper in a less visible place.

The better contract is lower-level and cleaner:

- `transforms.insertText` middleware means the editor has model policy that
  needs to observe inserted text through the normal transform path.
- Android pending text diffs are a DOM synchronization optimization, not a
  license to bypass registered model policy until a later native flush.
- Therefore the internal trigger is any non-empty stored Android text diff when
  `transform:insertText` middleware exists.
- Editors without `insertText` middleware keep the existing Android deferred
  diff behavior.
- No public option is added. If a public option becomes necessary later, that is
  proof the transform middleware contract is underspecified, not proof that
  markdown shortcuts deserve an Android API.

Implementation-facing shape:

```ts
const shouldFlushStoredTextDiff =
  diff.text.length > 0 && hasTransformMiddleware(editor, "insertText");

storeDiff(start.path, diff);

if (shouldFlushStoredTextDiff) {
  scheduleFlush();
}
```

The `hasTransformMiddleware` helper belongs next to transform middleware or the
extension registry, not in the example. It can read the registered
`transform:insertText` command handler list once per event without exposing a
new public API.

## Ecosystem comparison

| System      | Evidence                                                                       | Mechanism                                                                         | What Slate should steal                                                              | What Slate should reject                            | Slate target                                               |
| ----------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------- | ---------------------------------------------------------- |
| Lexical     | `docs/plans/2026-05-13-slate-v2-editable-input-rule-ownership-ralplan.md:1089` | Prioritized command handlers run inside the editor update context.                | Runtime-owned command dispatch for model behavior.                                   | Public `dispatchCommand` as the normal app API.     | Transform middleware over the command substrate.           |
| ProseMirror | `docs/plans/2026-05-13-slate-v2-editable-input-rule-ownership-ralplan.md:1090` | View/input owns DOM events; commands/transactions own model changes.              | Keep Android DOM timing in Slate React and model shortcut policy in core transforms. | Making app examples parse DOM input events.         | React runtime bridge plus core transform middleware.       |
| Tiptap      | `docs/research/sources/tiptap/input-rules-and-extension-doc-patterns.md:22`    | Product extensions expose input rules as a named entrypoint.                      | Clear named behavior packaging at the product layer.                                 | Copying product input-rule families into raw Slate. | Plate owns rule families; Slate owns primitive transforms. |
| Plate       | `docs/plans/2026-05-13-slate-v2-editable-input-rule-ownership-ralplan.md:57`   | Plugins own typed rules, triggers, priorities, resolve/apply, and feature policy. | Let Plate build richer markdown families on top of Slate.                            | Duplicating Plate's rule registry in `slate-react`. | No public `Editable inputRules` in raw Slate.              |

Ecosystem decision: Slate should steal the ownership split, not the public API
shape. ProseMirror proves DOM input timing belongs in the view/runtime. Lexical
proves typed behavior should re-enter the model command/update path. Tiptap and
Plate prove markdown/input-rule ergonomics are product-extension territory. The
result is not another user-facing prop; it is a runtime guarantee that Android
text input reaches `insertText` middleware soon enough.

## Issue ledger accounting

No fixed issue claim is accepted by this pass.

| Issue                                          | Evidence                                                                                                                                                                                                              | Current classification             | First-pass result                                                                              |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------- |
| `#4532` Auto markdown does not work on Android | `docs/slate-issues/gitcrawl-live-open-ledger.md:420`; `docs/slate-issues/open-issues-dossiers/4541-4392.md:101`; `docs/slate-issues/gitcrawl-v2-sync-ledger.md:422`; `docs/slate-v2/ledgers/issue-coverage-matrix.md` | `implementation-reviewed`, related | Candidate `Improves #4532` after raw Android browser/device proof. No `Fixes #4532` claim yet. |

Issue sync performed in the related-issue pass:

- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`: `#4532` moved from
  `issue-reviewed` to `implementation-reviewed` with this plan and local proof
  as proof owners.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`: added one `Related` row for
  `#4532`.
- `docs/slate-v2/ledgers/fork-issue-dossier.md`: added a long-form Android
  markdown shortcut flush section.
- `docs/slate-v2/references/pr-description.md`: related matrix count updated
  and a zero fixed/improved claim bullet added.

## Related issue discovery pass

Pass result: complete.

Discovery source: durable ledgers only. No broad live GitHub discovery was
needed. The generated live ledger has the current `#4532` row; the manual sync
ledger had it as `issue-reviewed`; the issue dossier says the report is strong
enough but example-specific; the test-candidate map says the direct current
contract is not a good red-test target.

Issue matrix:

| Issue                                                | Cluster                                      | Claim                                                     | Why                                                                                                                                                          | Proof route                                                                                                                           | V2 sync ledger            | PR line                                                                                                                                                                                |
| ---------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#4532`                                              | singleton / Mobile, IME, And Input Semantics | Related now; candidate `Improves` after raw Android proof | The implementation targets the exact Android markdown-shortcuts surface and has local regression proof, but raw Android browser/device proof has not landed. | Unit test for transform-aware Android flush is present; raw Android browser/device proof is required before any fixed/improved claim. | `implementation-reviewed` | `Related #4532: Android markdown shortcut failure belongs to Android pending-diff flush timing plus insertText transform middleware ownership; exact closure needs raw Android proof.` |
| `#4531`                                              | singleton / Mobile, IME, And Input Semantics | Related, unchanged                                        | Android autocorrect flicker shares Android input ownership, but markdown shortcut flush does not prove suggestion stability.                                 | Keep existing Android/device proof route.                                                                                             | unchanged                 | related matrix unchanged                                                                                                                                                               |
| `#4543`                                              | singleton / Mobile, IME, And Input Semantics | Related, unchanged                                        | Safari autocorrect selection clearing is adjacent input-runtime pressure, not the same markdown shortcut repro.                                              | Keep existing browser proof route.                                                                                                    | unchanged                 | related matrix unchanged                                                                                                                                                               |
| `#4521`                                              | singleton / Mobile, IME, And Input Semantics | Related, unchanged                                        | Android heading Enter crash is markdown/example-adjacent, but this pass only covers typed-space shortcut flush.                                              | Keep exact Android Enter proof route.                                                                                                 | unchanged                 | related matrix unchanged                                                                                                                                                               |
| `#6022`, `#5983`, `#4400`, `#5883`, `#5130`, `#5050` | Android/input-runtime family                 | Related, unchanged                                        | These constrain the same runtime owner: mobile, IME, beforeinput, and input command policy. This plan does not prove their exact repros.                     | Keep existing device/browser or focused runtime proof routes.                                                                         | unchanged                 | related matrix unchanged                                                                                                                                                               |

Decision:

- `#4532` should not stay as generic docs/example noise. The current DX problem
  is exactly that the example is compensating for runtime timing.
- It still cannot be `Fixes` or `Improves` from local proof alone.
  `Improves #4532` becomes valid only after raw Android proof shows markdown
  shortcuts convert.
- The PR summary should mention zero new exact fixed/improved claims so
  maintainers do not read this as auto-close bait.

## Regression proof target

Implementation cannot be accepted from code review alone.

Required proof candidates:

- `.tmp/slate-v2/packages/slate-react/test/android-input-manager-contract.test.ts`
  or equivalent: Android manager schedules the existing flush when an
  `insertText` transform middleware is installed and a non-empty Android
  storable text diff lands.
- `.tmp/slate-v2/packages/slate-react/test/android-input-manager-contract.test.ts`
  or equivalent: plain editors without `insertText` transform middleware keep
  the existing deferred pending-diff path.
- `.tmp/slate-v2/packages/slate-react/test/android-input-manager-contract.test.ts`
  or equivalent: empty delete diffs do not take the text-middleware fast-flush
  path.
- `.tmp/slate-v2/packages/slate-react/test/android-input-manager-contract.test.ts`
  or equivalent: composition/SwiftKey insert-position hint handling still
  schedules its existing flush and is not replaced by the middleware trigger.
- `.tmp/slate-v2/packages/slate/test/extension-methods-contract.ts`: the internal
  middleware-presence helper returns true only for registered
  `transform:insertText` handlers and false for unrelated transform middleware.
- `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`: the markdown
  example still uses `deleteBackward`, `insertBreak`, and `insertText`
  transform middleware; it does not use `onKeyDown`; it also must not use
  `onDOMBeforeInput`, `androidPendingDiffs`, `androidScheduleFlush`, or
  `scheduleAndroidMarkdownShortcutFlush`.
- `.tmp/slate-v2/packages/slate-react/test/app-owned-customization.tsx`: app-owned
  markdown shortcuts remain expressible through editor-owned model behavior.
- `.tmp/slate-v2/playwright/integration/examples/markdown-shortcuts.test.ts`:
  desktop and mobile projects still create blockquote, unordered list, ordered
  list, and heading shortcuts from the public example.
- `.tmp/slate-v2`: raw Android Chrome/device proof before claiming `#4532` fixed.

Planning-only verification for this Ralplan:

- `plate-2`: `node tooling/scripts/completion-check.mjs` passes after this
  planning lane is marked `done`.

## Regression-proof review pass

Pass result: complete.

Harsh answer: the plan is regression-conscious, not regression-proof by itself.
It becomes regression-safe only if the implementation lands with the targeted
tests below. Anything less is a guess dressed up as confidence.

Regression risks to lock:

| Risk                                                                  | Required lock                                                                         | Why it matters                                                                         |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Plain Android editors flush earlier than before.                      | Unit test: no fast flush without registered `transform:insertText`.                   | This is the main performance/regression boundary.                                      |
| Delete/backspace pending diffs start taking text fast-flush behavior. | Unit test: `diff.text === ''` does not trigger the middleware flush path.             | Delete behavior is already fragile on Android.                                         |
| SwiftKey/composition handling gets reordered.                         | Unit test: the existing insert-position hint path still schedules its own flush.      | This code already has Android keyboard-specific compat logic.                          |
| Middleware detection becomes too broad.                               | Core helper test: true only for `transform:insertText`, false for unrelated handlers. | `insertBreak`/`deleteBackward` middleware should not change Android text flush timing. |
| The example regresses back to browser plumbing.                       | Surface contract: no `onDOMBeforeInput`, no Android DOM APIs, no helper.              | Prevents the DX cleanup from silently rotting.                                         |
| Desktop/programmatic markdown shortcuts regress while fixing Android. | Existing app-owned customization test plus Playwright markdown-shortcuts examples.    | The public model behavior must stay `transforms.insertText`.                           |
| Claiming `#4532` without real Android proof.                          | Raw mobile/device proof gate.                                                         | Playwright mobile emulation is not the same as Android IME behavior.                   |

Minimum implementation gate:

```bash
cd .tmp/slate-v2
bun test packages/slate/test/extension-methods-contract.ts \
  packages/slate-react/test/surface-contract.tsx \
  packages/slate-react/test/app-owned-customization.tsx \
  packages/slate-react/test/with-react-contract.tsx
cd packages/slate-react && bun test:vitest -- \
  test/model-input-strategy-contract.test.ts \
  test/android-input-manager-contract.test.ts
cd ../..
playwright test playwright/integration/examples/markdown-shortcuts.test.ts \
  --project=chromium --project=mobile
bun --filter slate-react typecheck
bun typecheck:site
```

Issue-closure gate:

```bash
cd .tmp/slate-v2
SLATE_BROWSER_RAW_MOBILE_REQUIRED=1 bun test:mobile-device-proof:raw
```

Do not claim `Fixes #4532` from the minimum gate. The minimum gate is enough to
say the implementation is locally regression-locked. The raw mobile/device gate
is what can justify exact Android issue closure.

## Ralph execution result

Pass result: complete.

Implementation files:

- `.tmp/slate-v2/packages/slate/src/core/transform-middleware.ts`
- `.tmp/slate-v2/packages/slate/src/internal/index.ts`
- `.tmp/slate-v2/packages/slate/test/extension-methods-contract.ts`
- `.tmp/slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts`
- `.tmp/slate-v2/packages/slate-react/src/editable/runtime-editor-api.ts`
- `.tmp/slate-v2/packages/slate-react/src/hooks/android-input-manager/android-input-manager.ts`
- `.tmp/slate-v2/packages/slate-react/test/android-input-manager-contract.test.ts`
- `.tmp/slate-v2/packages/slate-react/test/model-input-strategy-contract.test.ts`
- `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`
- `.tmp/slate-v2/site/examples/ts/markdown-shortcuts.tsx`

Behavior landed:

- Core now exposes an internal `hasTransformMiddleware(editor, key)` helper.
- Slate React can treat registered `insertText` transform middleware as app
  input policy, so native chromium text input does not bypass model behavior.
- Android stored text diffs schedule the existing flush path when a non-empty
  diff lands on an editor with registered `insertText` transform middleware.
- The markdown-shortcuts example no longer wires `onDOMBeforeInput`, reads
  `androidPendingDiffs`, calls `androidScheduleFlush`, or defines
  `scheduleAndroidMarkdownShortcutFlush`.

Important regression found and fixed:

- First Playwright markdown-shortcuts run failed on chromium after removing the
  example `onDOMBeforeInput` helper. Root cause: that helper was accidentally
  acting as `hasAppInputPolicy`, which disabled native insertion and kept
  markdown shortcuts on the model-owned path. The fix is to count registered
  `insertText` transform middleware as input policy directly.

Verification:

```bash
bun test ./packages/slate/test/extension-methods-contract.ts
bun test ./packages/slate-react/test/surface-contract.tsx ./packages/slate-react/test/app-owned-customization.tsx ./packages/slate-react/test/with-react-contract.tsx ./packages/slate/test/extension-methods-contract.ts
bun test:vitest -- test/model-input-strategy-contract.test.ts test/android-input-manager-contract.test.ts
bun run playwright playwright/integration/examples/markdown-shortcuts.test.ts --project=chromium --project=mobile
bun --filter slate-react typecheck
bun --filter slate typecheck
bun typecheck:site
bun lint
```

Results:

- Focused Bun tests: passed.
- Focused Vitest tests: passed.
- Playwright markdown-shortcuts chromium/mobile: passed, `14` tests.
- `slate-react` typecheck: passed.
- `slate` typecheck: passed.
- site typecheck: passed.
- lint: passed with one existing warning in
  `packages/slate-react/src/components/slate.tsx` about `reactEditor`
  dependency; no lint errors.
- Raw Android device proof: not run; therefore `#4532` remains Related.

## Maintainer objection pass

Pass result: complete.

| Objection                                                       | Answer                                                                                                                                                         | Result                   |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| "This flushes too often on Android."                            | Only editors with `transform:insertText` middleware take the path. Plain editors keep deferred diffs. The proof matrix must lock that.                         | Accepted risk with test. |
| "Why not just keep the helper in the example?"                  | First-party examples teach the public contract. Reading Android pending diffs is browser-runtime plumbing, not markdown authoring.                             | Reject helper.           |
| "Why not add `Editable inputRules` back?"                       | That was already cut to keep raw Slate unopinionated. Plate owns rich input-rule families; Slate owns primitive transform interception.                        | Reject public prop.      |
| "Why not expose `androidFlushWhen`?"                            | A public predicate would still force app authors to reason about Android native timing. The existing transform middleware contract is enough.                  | Reject public API.       |
| "Could this change unrelated `insertText` middleware behavior?" | Yes, intentionally: registered `insertText` middleware should observe Android typed text through the same transform path. That is the contract being repaired. | Keep.                    |

## Issue sync accounting pass

Pass result: complete.

- Fixed issue claims: `0`.
- Improved issue claims: `0`.
- Related issue rows added: `1` for `#4532`.
- PR reference related count: `192`.
- `#4532` remains candidate `Improves` only after raw Android browser/device
  proof.

## Current scorecard

| Dimension                             | Score | Evidence                                                                                                                                                 |
| ------------------------------------- | ----: | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React/runtime performance             |  0.86 | Flush trigger is scoped to non-empty stored Android text diffs on editors with registered `insertText` middleware; plain editors keep deferred diffs.    |
| Slate-close unopinionated DX          |  0.91 | Public app shape stays `extension.transforms.insertText`; no Android hook, no raw markdown API, no `Editable inputRules`.                                |
| Plate/slate-yjs migration backbone    |  0.87 | Plate keeps semantic input-rule families; raw Slate keeps primitive transform middleware.                                                                |
| Regression-proof testing              |  0.93 | Exact unit files, surface contract, app-owned customization, Playwright examples, typecheck, and lint passed; raw Android closure gate remains separate. |
| Research evidence completeness        |  0.88 | Live source, prior input-rule/beforeinput plans, and durable issue ledgers are synced for `#4532`.                                                       |
| shadcn-style composability/minimalism |  0.91 | `<Editable>` call site becomes minimal; no new public prop or example-local Android helper.                                                              |

Weighted total: `0.92`.

## Pass-state ledger

| Pass                                 | Status   | Evidence added                                                                                                                                                                                             | Plan delta                                                                                                                                                | Open issues                                                                        | Next owner                          |
| ------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------- |
| source-read-and-initial-verdict-pass | complete | Live markdown example, Android manager, DOM editor Android APIs, runtime beforeinput, transform middleware, prior hard-cut plans, issue `#4532` rows.                                                      | Verdict changed from userland helper to internal transform-aware Android flush.                                                                           | None.                                                                              | related-issue-discovery-pass        |
| related-issue-discovery-pass         | complete | Read `#4532` live row, dossier, test-candidate map, v2 sync row, issue-cluster ownership, requirements, package impact, coverage matrix, PR reference, and fork dossier.                                   | `#4532` is now planning-reviewed/Related; added coverage row, dossier section, v2 sync row update, and PR summary bullet with zero fixed/improved claims. | Exact proof and claim promotion remain pending.                                    | intent-boundary-decision-brief-pass |
| intent-boundary-decision-brief-pass  | complete | Decision brief plus hardening pass.                                                                                                                                                                        | Runtime flushes any non-empty stored Android text diff when `transform:insertText` middleware exists; no markdown-specific predicate.                     | None.                                                                              | ecosystem-strategy-pass             |
| ecosystem-strategy-pass              | complete | Local research rows for Lexical, ProseMirror, Tiptap, and Plate.                                                                                                                                           | Ownership split recorded: runtime owns DOM timing, transforms own model policy, Plate owns product rules.                                                 | None.                                                                              | performance-and-browser-proof-pass  |
| performance-and-browser-proof-pass   | complete | Exact proof matrix named.                                                                                                                                                                                  | Plain-editor no-flush and empty-delete-diff tests added to proof target.                                                                                  | Android device/browser proof required for issue closure, not for planning closure. | maintainer-objection-pass           |
| maintainer-objection-pass            | complete | Objection table added.                                                                                                                                                                                     | Public Android predicate rejected; no extra public API.                                                                                                   | None.                                                                              | issue-sync-accounting-pass          |
| issue-sync-accounting-pass           | complete | Ledger, coverage matrix, fork dossier, and PR reference already updated.                                                                                                                                   | Fixed/improved claims stay zero; related row count stays `192`.                                                                                           | None.                                                                              | closure-final-gates-pass            |
| closure-final-gates-pass             | complete | This plan plus scoped completion state.                                                                                                                                                                    | Plan ready for user review or later Ralph execution.                                                                                                      | None.                                                                              | none                                |
| regression-proof-review-pass         | complete | Existing test anchors inspected: `surface-contract.tsx`, `app-owned-customization.tsx`, `model-input-strategy-contract.test.ts`, core extension middleware tests, and Playwright markdown-shortcuts tests. | Regression matrix tightened with exact files, commands, no-regression locks, and raw mobile closure gate.                                                 | None.                                                                              | none                                |
| ralph-execution-activation           | complete | `active goal state`; `active goal state`.                                                                                  | Execution lane opened against `.tmp/slate-v2`; completion reset to `pending`; first owner is TDD for Android stored text diff middleware flush.           | None.                                                                              | tdd-pass                            |
| tdd-pass                             | complete | Added red tests for transform middleware detection, Android stored text diff flush policy, and markdown example surface cleanup.                                                                           | Used a small package-internal Android policy helper instead of brittle full DOM-event simulation.                                                         | None.                                                                              | implementation-green-pass           |
| implementation-green-pass            | complete | Runtime/helper/example changes landed in `.tmp/slate-v2`.                                                                                                                                                  | Discovered and fixed native chromium bypass by treating registered `insertText` middleware as app input policy.                                           | None.                                                                              | diff-review-pass                    |
| diff-review-pass                     | complete | Changed-files diff reviewed for correctness, public API overreach, and issue-claim scope.                                                                                                                  | No public API added; no markdown-specific runtime predicate; issue claims unchanged.                                                                      | None.                                                                              | verification-sweep-pass             |
| verification-sweep-pass              | complete | Focused tests, Playwright, typechecks, lint, completion-check.                                                                                                                                             | Local regression slice is complete; raw Android proof remains a separate issue-closure gate.                                                              | None.                                                                              | none                                |

## Closed decisions

- No app-side `onDOMBeforeInput` for markdown shortcuts.
- No public `Editable inputRules` revival.
- No public raw Slate markdown shortcut API.
- No public Android flush predicate.
- Internal trigger: non-empty stored Android text diff plus registered
  `transform:insertText` middleware.
- `#4532` remains Related until raw Android browser/device proof exists.
