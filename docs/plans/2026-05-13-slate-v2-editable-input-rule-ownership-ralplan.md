# Slate v2 Editable Input Rule Ownership Ralplan

Date: 2026-05-13

Status: `done`

Owner: `slate-ralplan`

Completion:
`active goal state`

## Current Verdict

`EditableInputRule` is the wrong public Slate v2 abstraction.

The old example-level `editor.deleteBackward = (...args) => { ... }` was ugly,
but it was at least a model command override. The current
`EditableInputRule` shape moved checklist behavior into the editor construction
path, which was the right instinct, but it overshot into a React/beforeinput
rule abstraction that belongs in Plate.

Accepted target:

- Slate core owns transform middleware as the public Slate-close extension DX,
  with low-level command middleware as the semantic runtime substrate.
- Slate React owns DOM `beforeinput` routing and app escape hatches such as
  `onDOMBeforeInput`.
- Plate owns semantic input-rule families, triggers, priorities, and feature
  rule factories.
- Checklist Backspace should use `transforms.deleteBackward(...)` over the core
  `delete` command substrate, not an `EditableInputRule`.

## Intent Boundary

| Field                | Decision                                                                                                                                                                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent               | Decide whether public `EditableInputRule` belongs in raw Slate v2 or should be cut in favor of a cleaner Slate/Plate ownership split.                                                                                                          |
| Desired outcome      | A Ralph pass can remove `EditableInputRule` as a public Slate React API, migrate examples to Slate-close transform middleware or DOM handlers, keep command middleware as the runtime substrate, and leave Plate as the rich input-rule owner. |
| In scope             | `EditableInputRule`, `editableInputRules`, extension capability wiring, checklist Backspace, markdown/inline typed shortcuts, docs/PR narrative, proof gates.                                                                                  |
| Non-goals            | Implementing the cut in this Slate Ralplan pass; designing Plate's full input-rule API; changing browser beforeinput internals; claiming new issue fixes.                                                                                      |
| Decision boundary    | Slate may expose transform middleware as the normal extension-author DX and keep low-level command middleware / typed command tokens as the runtime substrate; Slate should not expose Plate-style semantic input-rule registries.             |
| User decision needed | None. The current API is worse than the command substrate already available in live Slate v2.                                                                                                                                                  |

## Live Source Evidence

| Surface                  | Current owner                                                                                                     | Current shape                                                                                                    | Verdict                                                                                                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public export            | `.tmp/slate-v2/packages/slate-react/src/index.ts:12-21`, `:70-74`                                                 | Exports `EditableInputRule*` types and `editableInputRules` / capability key from `slate-react`.                 | Too public and too React/beforeinput-shaped for raw Slate model behavior.                                                                                           |
| Rule type                | `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx:186-199`                                          | Context is `{ data, editor, event?, inputType: string, selection }`.                                             | Browser event vocabulary leaks into model-command customization.                                                                                                    |
| Capability helper        | `.tmp/slate-v2/packages/slate-react/src/editable/editable-input-rules.ts:1-33`                                    | Stores functions under a `slate-react.editable.inputRule` capability and merges prop rules plus extension rules. | Plate-style plugin rule registry hiding inside Slate React.                                                                                                         |
| Runtime invocation       | `.tmp/slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts:250-292`                                  | Runs rules during editable runtime input handling, prevents default, then requests DOM repair.                   | Good low-level pipeline, bad public customization surface for delete semantics.                                                                                     |
| Checklist example        | `.tmp/slate-v2/site/examples/ts/check-lists.tsx:96-145`                                                           | Checks `inputType === 'deleteContentBackward'`, passes `selection`, then mutates checklist nodes.                | Wrong layer. Backspace behavior is a `delete` command policy, not a DOM input rule.                                                                                 |
| Markdown/inline examples | `.tmp/slate-v2/site/examples/ts/markdown-shortcuts.tsx:52-61`, `.tmp/slate-v2/site/examples/ts/inlines.tsx:82-96` | Use `EditableInputRule[]` for typed text shortcuts.                                                              | Better as `transforms.insertText(...)` over the insert-text command substrate, or plain `onDOMBeforeInput` only when the behavior is truly browser-format specific. |
| Core command registry    | `.tmp/slate-v2/packages/slate/src/core/command-registry.ts:36-92`                                                 | `registerCommand` installs priority-ordered middleware with `next`.                                              | This is the right Slate substrate.                                                                                                                                  |
| Delete command path      | `.tmp/slate-v2/packages/slate/src/editor/delete-backward.ts:9-34`                                                 | `deleteBackward` dispatches a `delete` command before default deletion.                                          | Checklist Backspace can hook this once and cover DOM, keydown fallback, Android route, browser handles, and programmatic calls.                                     |
| Public static API        | `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:1559-1567`                                                 | `Editor.registerCommand` is already public.                                                                      | Missing pieces are transform middleware as the normal authoring DX plus exported built-in command definitions/types for the low-level substrate.                    |
| Plate input rules        | `../plate/packages/core/src/lib/plugins/input-rules/internal/InputRulesPlugin.ts:1-169`                           | Plate has typed rule contexts, cached selection helpers, triggers, `enabled`, `resolve`, `apply`, priorities.    | This is the rich input-rule layer; raw Slate should not duplicate it.                                                                                               |
| Plate rule resolution    | `../plate/packages/core/src/internal/plugin/resolvePlugins.ts:351-433`                                            | Resolves plugin-owned input rules by target/trigger/plugin/priority.                                             | Confirms input-rule families are Plate product/plugin DX.                                                                                                           |

## Decision Brief

Principles:

- Model behavior belongs to model commands, not DOM event strings.
- Slate remains low-level and unopinionated.
- Plate owns semantic plugin rule families.
- Examples should teach the durable substrate, not a temporary convenience.
- Browser-specific escape hatches stay available without becoming the primary plugin API.

Top drivers:

- Checklist Backspace must work through every deletion path, not only native
  `beforeinput deleteContentBackward`.
- The current public type forces users to think in `inputType: string` and
  `InputEvent` even when they are authoring model behavior.
- Slate v2 already has a command registry; failing to use it is architectural
  waste.

Options:

| Option                                                                                        | Pros                                                                                                                                                             | Cons                                                                                                                        | Verdict                                                               |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Keep `EditableInputRule` public                                                               | Already implemented; examples migrated away from `onKeyDown`.                                                                                                    | Browser event vocabulary becomes Slate plugin API; does not naturally cover programmatic commands; duplicates Plate's lane. | Reject.                                                               |
| Move all input behavior to Plate                                                              | Clean Slate surface.                                                                                                                                             | Raw Slate still needs a safe way to customize custom node commands without monkeypatching.                                  | Reject as too hard a cut.                                             |
| Keep only direct `Editor.registerCommand` public examples, move semantic input rules to Plate | Uses live command substrate; keeps raw Slate low-level; Plate keeps product-grade rule families.                                                                 | Too framework-y for normal Slate examples; feels farther from old `withX(editor)` override ergonomics than needed.          | Reject as the teaching DX.                                            |
| Add transform middleware as Slate-close public DX over command middleware                     | Preserves old `editor.deleteBackward` override mental model; keeps one semantic command path underneath; avoids DOM `inputType` leaks; lets examples stay small. | Requires one thin transform-middleware layer and careful naming so it does not become Plate rules.                          | Choose.                                                               |
| Add a narrow `Editable.beforeInputHandlers` API only                                          | Useful for browser-only cases.                                                                                                                                   | Does not solve checklist/model command behavior.                                                                            | Keep only as existing DOM handler escape hatch, not as rule registry. |

## Public API Target

Cut from `slate-react` public exports:

```ts
EditableInputRule
EditableInputRuleContext
EditableInputRuleResult
editableInputRules(...)
EDITABLE_INPUT_RULE_CAPABILITY
```

Keep `Editable` DOM escape hatches:

```tsx
<Editable onDOMBeforeInput={...} onKeyDown={...} />
```

Expose Slate-close transform middleware as the normal public extension DX.
It should feel like the old `withX(editor)` override shape, but structured,
typed, ordered, and cleanup-aware:

```ts
const withChecklists = <T extends ReactEditor<CustomValue>>(editor: T): T => {
  editor.extend({
    name: "checklists",
    transforms: {
      deleteBackward({ editor, next, unit }) {
        if (applyChecklistBackspaceStart(editor)) return;

        next();
        // or next({ unit: 'word' })
      },
    },
  });

  return editor;
};
```

Text shortcuts use the same public shape:

```ts
const withMarkdownShortcuts = <T extends ReactEditor<CustomValue>>(
  editor: T,
): T => {
  editor.extend({
    name: "markdown-shortcuts",
    transforms: {
      insertText({ editor, next, options, text }) {
        if (applyMarkdownTextShortcut(editor, text)) return;

        next();
        // or next({ options, text: normalizedText })
      },
    },
  });

  return editor;
};
```

`applyChecklistBackspaceStart` should read current selection from
`editor.read(...)`; it should not accept a DOM-derived `selection` parameter.

Transform middleware `next` contract:

- `next()` forwards the current transform arguments unchanged.
- `next(overrides)` forwards the current transform arguments shallow-merged with
  explicit overrides.
- Handling is expressed by not calling `next()`, matching the old Slate
  override mental model.
- A middleware handler must not call `next()` more than once.

Keep low-level command middleware and typed built-in command definitions
available underneath for advanced users, tests, and runtime implementation.
Transform middleware should compile to that substrate:

```txt
transforms.deleteBackward -> EditorCommands.delete({ direction: 'backward' })
transforms.insertText -> EditorCommands.insertText({ text, options })
```

## Internal Runtime Target

- Keep the runtime beforeinput pipeline and DOM repair queue.
- Remove extension capability collection for editable input rules.
- Route native/model input through transform middleware that dispatches to core
  commands where possible:
  - delete paths -> `EditorCommands.delete`
  - text insertion -> `EditorCommands.insertText`
  - break insertion -> `EditorCommands.insertBreak`
  - fragment/data insertion -> command route where already represented
- Keep direct `Editor.registerCommand(...)` as the low-level substrate, not the
  default example API for ordinary Slate users.
- Keep browser-only formatting events in `onDOMBeforeInput` examples when they
  are truly browser `formatBold` / `formatItalic` intents.

## Plate Ownership Target

Plate keeps:

- semantic `inputRules` on plugins;
- `enabled`, `resolve`, `apply`, priority, plugin key, triggers;
- markdown rule families such as `HeadingRules.markdown()`,
  `TaskListRules.markdown(...)`, `LinkRules.autolink(...)`;
- delete/reset/lift behavior families where Plate has product node semantics.

Slate provides the substrate Plate can build on:

- command middleware;
- state/tx extension namespaces;
- DOM/input runtime correctness;
- operation and commit determinism.

## Ecosystem Strategy Synthesis

| System      | Source                                                                                  | Mechanism                                                                 | Avoids                                                     | Steal                                                                   | Reject                                                     | Slate target                                                                                       | Verdict |
| ----------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------- |
| Lexical     | `docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md`    | Commands are prioritized listeners inside update/read lifecycle.          | Event-specific app code that misses non-DOM command paths. | Prioritized command middleware with cleanup and extension registration. | Lexical class nodes and `$` helper style.                  | Teach transform middleware; keep typed built-in commands underneath.                               | agree   |
| ProseMirror | `docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md` | Commands receive state/dispatch while view owns DOM input details.        | Mixing DOM event handling with semantic model mutation.    | Keep DOM bridge in Slate React; model command behavior in Slate core.   | ProseMirror plugin complexity and integer positions.       | DOM `beforeinput` remains runtime-owned; app behavior uses transform middleware over commands.     | agree   |
| Tiptap      | `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md`        | Extensions package commands, input rules, paste rules, editor props.      | Scattered feature setup.                                   | Extension packaging and command discoverability.                        | Making product input-rule families raw Slate's public API. | Slate: transform middleware over low-level commands; Plate: Tiptap-like input-rule DX.             | partial |
| Plate       | `../plate/packages/core/src/lib/plugins/input-rules/internal/InputRulesPlugin.ts`       | Plugin-owned input rules with targets, triggers, resolve/apply, priority. | Boolean-key config and ad hoc example glue.                | Product-grade rule family pattern for Plate.                            | Duplicating this in Slate React.                           | Plate owns semantic input rules; Slate owns transform middleware over primitive command substrate. | agree   |

## Issue Ledger Accounting

ClawSweeper pass: skipped with reason `already covered by completed input-runtime/checklist ledger surfaces; this pass changes API ownership narrative and adds no fixed issue claim`.

Related rows read from durable ledgers:

| Issue         | Cluster                     | Claim   | Why                                                                                                                                      | Proof route                                                                     | V2 sync ledger | PR line             |
| ------------- | --------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------------- | ------------------- |
| #3384         | checklist/example           | Related | Checklist example behavior is directly affected, but this plan changes API ownership and does not claim the original repro fixed.        | `.tmp/slate-v2/playwright/integration/examples/check-lists.test.ts` after Ralph | unchanged      | related matrix only |
| #4528         | checklist/browser-selection | Related | Checklist DOM structure/browser selection remains adjacent; command API ownership does not prove triple-click behavior.                  | browser selection row required if touched                                       | unchanged      | related matrix only |
| #3408         | delete-backward             | Related | Transform middleware over the delete-command substrate may improve delete customization, but no exact empty-list/table repro is claimed. | package delete tests plus issue repro if claimed                                | unchanged      | related matrix only |
| #3568 / #3586 | beforeinput-formatting      | Related | Formatting via `onDOMBeforeInput` remains browser-specific; this plan does not claim those crash rows fixed.                             | exact browser proof if later claimed                                            | unchanged      | related matrix only |

No new `Fixes #...` line.

PR reference sync: updated in
`docs/slate-v2/references/pr-description.md#62-react-editable-input-rule-ownership`
so Section 6.2 no longer presents `editableInputRules(...)` as the accepted
target. Ralph must still refresh the proof rows after implementation.

## Regression Proof Matrix

| Contract                 | Must prove                                                                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Checklist Backspace      | Backspace at start of checklist resets only the current checklist item to paragraph.                                                                         |
| Command coverage         | Same checklist behavior works through native beforeinput, keyboard fallback/browser handle, and `Editor.deleteBackward(editor)` or `tx.text.deleteBackward`. |
| Markdown shortcut        | Space-triggered markdown shortcut still works after migration from `EditableInputRule`.                                                                      |
| Inline URL shortcut      | Typed URL wrapping still works, or is explicitly moved to a transform/input example with no regression.                                                      |
| Browser format shortcuts | Hovering toolbar `formatBold` / `formatItalic` / `formatUnderline` remains a DOM beforeinput example.                                                        |
| Public surface           | `slate-react` no longer exports `EditableInputRule*` or `editableInputRules`; generated surface tests prove no stale public export.                          |
| Plate boundary           | Plate input-rule tests remain Plate-owned; Slate does not import Plate rule concepts.                                                                        |

## Applicable Implementation-Skill Review Matrix

| Lens                          | Applicability | Finding                                                                                                                                                                                              | Plan delta                                                                                |
| ----------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `vercel-react-best-practices` | applied       | Moving semantic behavior out of React beforeinput callbacks reduces event-surface coupling and keeps React as projection/runtime bridge.                                                             | Use transform middleware for public DX and core command middleware for runtime substrate. |
| `performance-oracle`          | applied       | Transform middleware can compile to command middleware, which is O(number of handlers for that transform/command), while Plate input rules can keep trigger-indexed dispatch for rich text triggers. | Do not install broad per-beforeinput rule scans in raw Slate.                             |
| `tdd`                         | applied       | Public behavior must be tested through editor commands and browser rows, not by asserting a rule helper was called.                                                                                  | Add command-level and browser-level acceptance rows.                                      |
| `build-web-apps:shadcn`       | skipped       | No UI chrome/component design.                                                                                                                                                                       | None.                                                                                     |
| `react-useeffect`             | skipped       | No effect lifecycle.                                                                                                                                                                                 | None.                                                                                     |

## High-Risk Deliberate Mode

Trigger: public API cut plus example behavior migration.

Blast radius:

- `slate-react` public exports and docs;
- examples using `inputRules`;
- PR narrative;
- Plate migration story;
- browser input proof.

Pre-mortem:

1. Transform middleware misses native beforeinput deletion because one runtime path bypasses `Editor.deleteBackward`.
2. Markdown/inline examples lose Android or composition behavior during migration.
3. Cutting public exports breaks consumers who copied the temporary API from v2 docs.

Proof plan:

- package tests for transform middleware over the delete and insert-text command
  substrate;
- `editable-behavior` contract proving no stale `editableInputRules` capability;
- surface contract proving exports are removed and built-in command definitions are exported;
- browser smoke for `/examples/check-lists`, `/examples/markdown-shortcuts`, and `/examples/inlines`;
- site typecheck and `slate-react` typecheck;
- PR reference update after implementation.

Rollback answer:

- If transform middleware cannot cover all native paths, revise by routing those
  paths through commands first. Do not restore `EditableInputRule` as public API.

## Maintainer Objection Ledger

| Change                                                    | Likely objection                                                  | Steelman antithesis                                                               | Tradeoff tension                                                | Answer                                                                                                                                                                                                   | Verdict |
| --------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Cut `EditableInputRule` public API                        | "This just removed a convenient way to package input behavior."   | The current helper is already implemented and avoids example `onKeyDown` glue.    | Users who saw it must migrate.                                  | It is convenient in the wrong layer: browser inputType strings are not model command API. Command middleware covers more paths and Plate owns the rich rule layer.                                       | keep    |
| Add transform middleware public DX over command substrate | "This is just the old override system with a new object wrapper." | Direct `Editor.registerCommand` is more explicit and already exists.              | One more abstraction layer above commands.                      | This is exactly the point: public examples should feel Slate-close like `deleteBackward(next)`, while the runtime still keeps one semantic command path for native, keyboard, and programmatic deletion. | keep    |
| Export built-in command definitions                       | "Command registry revival smells like old plugin magic."          | Raw Slate can keep only `editor.update`, transform middleware, and app callbacks. | More public core surface.                                       | The registry already exists and delete/insert commands already dispatch through it; typed definitions are for the substrate and advanced users, not the normal example DX.                               | keep    |
| Move rich input rules to Plate                            | "Raw Slate examples still need shortcuts."                        | `EditableInputRule` is small enough for examples.                                 | Raw Slate examples need slightly more explicit transform setup. | Raw Slate should show transform middleware over primitive command customization; Plate can show semantic `TaskListRules.markdown()` and trigger families.                                                | keep    |

## Scorecard

| Dimension                                                | Score | Evidence                                                                                                                                                                            |
| -------------------------------------------------------- | ----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance                           |  0.93 | Transform middleware over the command substrate keeps semantic work out of React event projection; Plate keeps trigger-indexed rich rules.                                          |
| Slate-close unopinionated DX                             |  0.96 | Uses transform middleware for the public `withX(editor)` authoring shape while keeping command middleware underneath and cutting the Plate-shaped rule registry from `slate-react`. |
| Plate and slate-yjs migration-backbone shape             |  0.93 | Plate remains owner of rule families; Slate keeps deterministic command/tx substrate for collab and plugins.                                                                        |
| Regression-proof testing strategy                        |  0.92 | Transform middleware, command substrate, export, typecheck, and browser rows cover all touched examples.                                                                            |
| Research evidence completeness                           |  0.93 | Live Slate v2 source, legacy Slate example, Plate input-rule implementation, and compiled Lexical/ProseMirror/Tiptap evidence read.                                                 |
| shadcn-style composability and hook/component minimalism |  0.93 | Removes public input-rule helpers and replaces them with transform middleware plus existing DOM handlers and low-level commands.                                                    |

Weighted total: `0.93`.

Status: `done`.

## Implementation Phases For Ralph

1. Add transform middleware extension DX in `slate`, with context-object
   handlers such as `deleteBackward({ editor, next })` and
   `insertText({ editor, next, text })`.
2. Compile transform middleware to the existing command middleware substrate so
   native beforeinput, keyboard fallback, and programmatic editor transforms
   share one semantic path.
3. Export typed built-in command definitions from `slate`, at least delete and
   insert-text, for low-level command middleware users and tests.
4. Migrate checklist behavior from `EditableInputRule` capability to
   `transforms.deleteBackward(...)`.
5. Migrate markdown shortcut and inline URL typed insertion away from
   `EditableInputRule` to `transforms.insertText(...)`, or explicitly keep a DOM
   handler only where browser intent is the behavior.
6. Remove `EditableInputRule*`, `editableInputRules`, and
   `EDITABLE_INPUT_RULE_CAPABILITY` from public `slate-react`.
7. Remove runtime-root extension capability merging for editable input rules;
   keep DOM beforeinput routing and repair behavior.
8. Refresh docs and PR section `6.2` after implementation with final proof rows.
9. Add/adjust tests before implementation:
   - transform middleware handles checklist Backspace through core delete;
   - transform middleware handles typed shortcuts through insert text;
   - command middleware remains the internal substrate and low-level escape
     hatch;
   - public surface no longer exports editable input rule helpers;
   - examples typecheck without manual `EditableInputRule` / `Selection`
     annotations.

## Fast Driver Gates

From `cwd=/Users/zbeyens/git/slate-v2`:

```bash
bun --filter slate test
bun --filter slate-react test:vitest -- editable-behavior
bun --filter slate-react test:vitest -- surface-contract
bun --filter slate-react typecheck
cd site && bun x tsc --project tsconfig.json --noEmit
PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun x playwright test playwright/integration/examples/check-lists.test.ts playwright/integration/examples/markdown-shortcuts.test.ts playwright/integration/examples/inlines.test.ts --project=chromium
bun lint:fix
```

From `cwd=/Users/zbeyens/git/plate-2`:

```bash
bun run completion-check
```

## Plan Deltas From Review

- Revised the prior accepted `EditableInputRule` stance.
- Reclassified checklist Backspace as transform middleware public DX over
  command middleware runtime substrate, not input rule.
- Kept Slate React DOM beforeinput escape hatches for browser-specific intents.
- Moved rich semantic input-rule family ownership to Plate.
- Added requirement to expose transform middleware for normal examples and
  typed built-in command definitions for the low-level substrate.
- Added browser and command proof rows for checklist, markdown shortcuts, and inline URL examples.

## Final Completion Gates

- Plan score reaches `0.93`.
- No new fixed issue claim is made.
- PR reference records the transform-middleware public DX over command-substrate ownership target; final proof-row refresh is assigned to Ralph because live implementation still exposes the old public API.
- Implementation phases and driver gates are explicit.
- Slate Ralplan did not edit `.tmp/slate-v2` implementation.

## 2026-05-15 Revalidation Pass

Status: `done`

Trigger:

- User re-asked after example cleanup whether the current checklist
  `editableInputRules(({ inputType }) => ...)` shape is acceptable DX or whether
  Slate v2 should change the architecture before this becomes public teaching.

Harsh verdict:

- The current code is better than legacy monkeypatching but still the wrong
  final DX.
- `editableInputRules` makes Slate developers author model behavior through
  browser `inputType` strings. That is cleaner syntax around a leaky
  abstraction.
- Checklist Backspace is semantic delete behavior. It belongs on transform
  middleware over the delete-command substrate, not on a React beforeinput rule
  registry.
- Keeping this public would be exactly the kind of "temporary example helper"
  that becomes API gravity and makes v2 feel clever but awkward.

Live source re-read:

| Surface                 | Current owner                                                                      | Current shape                                                                                                                        | Revalidation verdict                                                                                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Checklist example       | `.tmp/slate-v2/site/examples/ts/check-lists.tsx:89-97`                             | Registers `editableInputRules(({ editor, inputType, selection }) => ...)` and checks `inputType !== 'deleteContentBackward'`.        | `revise`; this is DOM-input vocabulary for a model delete policy.                                                                                         |
| Input rule prop/type    | `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx:87-98`, `:192-204` | `Editable` exposes `inputRules`, and `EditableInputRuleContext` includes `event?: InputEvent`, `inputType: string`, and `selection`. | `cut public API`; too React/browser-shaped for raw Slate extension behavior.                                                                              |
| Input rule capability   | `.tmp/slate-v2/packages/slate-react/src/editable/editable-input-rules.ts:4-33`     | Stores rule callbacks under `slate-react.editable.inputRule` and merges prop rules with extension capabilities.                      | `cut`; Plate-style rule registry is hiding inside Slate React.                                                                                            |
| Core command middleware | `.tmp/slate-v2/packages/slate/src/core/command-registry.ts:36-120`                 | Priority-ordered command handlers with cleanup and `next`.                                                                           | `keep as substrate`; normal examples should go through transform middleware.                                                                              |
| Delete command route    | `.tmp/slate-v2/packages/slate/src/editor/delete-backward.ts:31-42`                 | `deleteBackward` dispatches `{ type: 'delete', direction: 'backward', unit }` before default mutation.                               | `use`; checklist behavior can hook the semantic command once.                                                                                             |
| Command tests           | `.tmp/slate-v2/packages/slate/test/transaction-contract.ts:720-790`, `:1023-1090`  | Tests prove delete and insert-text commands route through middleware and typed command definitions work.                             | `already enough substrate`; implementation needs transform middleware public DX, built-in command tokens, and example migration, not another rule family. |

Decision after revalidation:

- Keep the prior target unchanged: remove `EditableInputRule*`,
  `editableInputRules(...)`, and `EDITABLE_INPUT_RULE_CAPABILITY` from public
  Slate React.
- Add transform middleware as the normal public extension-author DX.
- Add or expose typed built-in command definitions for delete and insert-text so
  low-level substrate users do not register handlers against naked strings.
- Migrate `check-lists` to `transforms.deleteBackward(...)`.
- Migrate markdown and inline URL text shortcuts to `transforms.insertText(...)`,
  or leave only truly browser-specific cases on `onDOMBeforeInput`.
- Keep `onCommand` / `onDOMBeforeInput` on `<Editable>` as escape hatches; do
  not make them the primary extension story.

Pass-state ledger:

| Pass                 | Status   | Evidence added                                                                                                                            | Plan delta                                                                                                                                        | Open issues                                         | Next owner        |
| -------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------- |
| Goal setup           | complete | Current thread goal set to decide current `editableInputRules` DX vs transform-middleware public architecture over the command substrate. | None.                                                                                                                                             | None.                                               | none              |
| Current-state read   | complete | Re-read current checklist example, public input rule types, helper, command registry, delete route, and command tests.                    | Added this revalidation section.                                                                                                                  | None.                                               | none              |
| Issue/ledger refresh | complete | Re-read live ledger, frozen ledger rows for `#3384`, `#3408`, `#4528`, coverage matrix, fork dossier, and PR reference.                   | Updated PR reference Section 6.2; no new fixed/improved issue claim; current issue stance remains related/not claimed until implementation proof. | `#3384`, `#3408`, `#4528` remain related/not fixed. | Ralph if executed |
| Research refresh     | complete | Re-read research index/log and prior compiled editor architecture/input-rule references already cited in this plan.                       | No change; Lexical/ProseMirror/Tiptap/Plate strategy still supports command substrate plus Plate-owned rule families.                             | None.                                               | none              |
| Objection recheck    | complete | Rechecked maintainer objection rows against the latest cleaner inline example shape.                                                      | No change; cleaner inline callbacks do not rescue the public rule abstraction.                                                                    | None.                                               | none              |
| Closure              | complete | This section plus updated `active goal state`.                                                | Plan remains ready for user review and Ralph execution.                                                                                           | None.                                               | user / Ralph      |

Score after revalidation:

| Dimension                                                | Score | Evidence                                                                                                                       |
| -------------------------------------------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------ |
| React 19.2 runtime performance                           |  0.93 | Transform middleware over the command substrate keeps semantic model behavior out of React beforeinput customization.          |
| Slate-close unopinionated DX                             |  0.94 | Raw Slate exposes Slate-close transform middleware over primitive command middleware instead of a Plate-shaped rule registry.  |
| Plate and slate-yjs migration-backbone shape             |  0.93 | Plate keeps semantic rule families; Slate keeps deterministic command/tx substrate.                                            |
| Regression-proof testing strategy                        |  0.92 | Existing command tests prove the substrate; implementation phase names transform middleware, public surface, and browser rows. |
| Research evidence completeness                           |  0.93 | Prior cross-editor synthesis still applies; current live source confirms no contradiction.                                     |
| shadcn-style composability and hook/component minimalism |  0.92 | Public surface shrinks to transform middleware plus existing event escape hatches and low-level command registration.          |

Weighted total: `0.93`.

Completion decision:

- Slate Ralplan remains `done` for planning/review.
- Implementation is not done.
- Next executable owner: `ralph` implementation of the seven phases above.
- No Slate v2 implementation files were edited by this revalidation pass.

## Strict Slate Ralplan Pass Schedule Audit - 2026-05-15

Status: `done`

Purpose: make the closure contract explicit. The prior plan had the material
evidence, but the runtime completion file compressed it too much. This audit
maps every required Slate Ralplan pass to the evidence that closes it.

|   # | Required pass                                                         | Status   | Evidence / delta                                                                                                                                                                                              | Next owner                                  |
| --: | --------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
|   1 | Current-state read and initial score                                  | complete | Live source evidence table plus 2026-05-15 revalidation live source rows for checklist, `EditableInputRule`, input-rule capability, command registry, delete route, and command tests.                        | none                                        |
|   2 | Related issue discovery                                               | complete | ClawSweeper skipped with concrete reason: already covered by completed input-runtime/checklist ledger surfaces; no new fixed issue claim.                                                                     | none                                        |
|   3 | Issue-ledger pass                                                     | complete | Issue matrix keeps `#3384`, `#4528`, `#3408`, `#3568`, and `#3586` as Related, with no `Fixes #...` claim. Live/frozen ledgers were re-read during revalidation.                                              | Ralph only if implementation changes claims |
|   4 | Intent/boundary and decision brief                                    | complete | Intent Boundary and Decision Brief sections define intent, outcome, scope, non-goals, viable options, rejected alternatives, and chosen transform-middleware public target over the command substrate.        | none                                        |
|   5 | Research, ecosystem synthesis, live-source refresh                    | complete | Ecosystem Strategy Synthesis cites Lexical, ProseMirror, Tiptap, and Plate mechanisms, plus 2026-05-15 live-source refresh.                                                                                   | none                                        |
|   6 | Performance, DX, migration, regression, research, simplicity pressure | complete | Scorecard, Regression Proof Matrix, Plate Ownership Target, and Implementation-Skill Review Matrix close the pressure rows.                                                                                   | none                                        |
|   7 | Slate maintainer objection ledger / steelman                          | complete | Maintainer Objection Ledger records objections, antithesis, tradeoff, answer, and `keep` verdict for cutting `EditableInputRule`, exporting command definitions, and keeping rich input rules in Plate.       | none                                        |
|   8 | High-risk deliberate mode                                             | complete | High-Risk Deliberate Mode records blast radius, three pre-mortems, proof plan, and rollback answer.                                                                                                           | none                                        |
|   9 | Ecosystem maintainer pass                                             | complete | Plate/plugin answer: Plate owns semantic rule families; Slate exposes transform middleware over the command substrate. Collab answer: command/tx/commit substrate stays deterministic for slate-yjs backbone. | none                                        |
|  10 | Revision pass                                                         | complete | Plan Deltas From Review and 2026-05-15 Revalidation Pass record the revision from `EditableInputRule` to transform middleware over command middleware plus no-change defenses.                                | none                                        |
|  11 | Issue sync accounting pass                                            | complete | PR reference Section 6.2 updated; issue coverage/fork dossier/manual sync rows unchanged because there are no new fixed/improved claims before implementation proof.                                          | Ralph after implementation                  |
|  12 | Closure score and final gates                                         | complete | Score `0.93`, no dimension below `0.85`, completion file status `done`, final handoff emitted, completion-check green.                                                                                        | user / Ralph                                |

Final user-review handoff outline:

- Public API: cut public `EditableInputRule*` and `editableInputRules(...)`.
- Runtime: keep Slate React DOM input runtime; route semantic model behavior
  through transform middleware backed by core command middleware.
- DX: teach transform middleware examples; export typed built-in command
  definitions only for the low-level substrate.
- Examples: checklist Backspace, markdown shortcuts, and inline URL shortcuts
  become Ralph implementation targets.
- Issue accounting: no new fixed/improved issue claims until implementation
  proof exists.
- Gates: implementation must run the `.tmp/slate-v2` command/browser gates listed
  in Fast Driver Gates.

## Full 12-Pass Slate Ralplan Rerun - 2026-05-15

Status: `done`

Trigger:

- User explicitly asked to run the actual 12 Slate Ralplan passes, not merely
  fix the Stop-hook state.

Goal:

- Prove this editable input-rule ownership plan is ready for user review, with
  all required passes recorded before `status: done`.

Fresh current-state read:

| Surface                     | Current source                                                                                                                                                            | Fresh finding                                                                                                  | Decision                                                                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EditableInputRule` exports | `.tmp/slate-v2/packages/slate-react/src/index.ts:17-32`, `:75-78`                                                                                                         | `EditableInputRule*` and `editableInputRules` are still public from `slate-react`.                             | `cut` public API in Ralph.                                                                                                                               |
| `Editable.inputRules` prop  | `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx:87-106`                                                                                                   | Raw `Editable` accepts `inputRules?: readonly EditableInputRule[]`.                                            | `cut`; prop exposes Plate-like rule registry in Slate React.                                                                                             |
| Input-rule context          | `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx:192-204`                                                                                                  | Rule authors receive `event`, `inputType`, `selection`, and `data`.                                            | `cut`; DOM event vocabulary is wrong for model behavior.                                                                                                 |
| Input-rule capability       | `.tmp/slate-v2/packages/slate-react/src/editable/editable-input-rules.ts:4-34`                                                                                            | Extension capabilities merge input rules into Slate React runtime.                                             | `cut`; this is product/plugin rule ownership.                                                                                                            |
| Runtime invocation          | `.tmp/slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts:264-310`                                                                                          | Runtime loops over effective input rules, prevents default, and schedules repair.                              | `keep` runtime pipeline, remove public semantic rule surface.                                                                                            |
| Checklist example           | `.tmp/slate-v2/site/examples/ts/check-lists.tsx:89-139`                                                                                                                   | Checklist Backspace checks `inputType === 'deleteContentBackward'` and accepts DOM-derived `selection`.        | `revise`; move to `transforms.deleteBackward(...)` and read selection from editor state.                                                                 |
| Markdown example            | `.tmp/slate-v2/site/examples/ts/markdown-shortcuts.tsx:90-123`                                                                                                            | Some behavior already uses `onCommand`, but typed shortcuts still use `editableInputRules`.                    | `revise`; use `transforms.insertText(...)` or a browser-only DOM handler only where needed.                                                              |
| Inline URL example          | `.tmp/slate-v2/site/examples/ts/inlines.tsx:123-140`                                                                                                                      | URL wrapping still uses `editableInputRules` for `insertText`.                                                 | `revise`; use `transforms.insertText(...)` or keep URL paste in clipboard capability.                                                                    |
| Command substrate           | `.tmp/slate-v2/packages/slate/src/core/command-registry.ts:32-120`                                                                                                        | `defineCommand`, priority-ordered `registerCommand`, `executeCommand`, cleanup, and `next` exist.              | `keep`; this is the runtime primitive, not the normal teaching DX.                                                                                       |
| Delete command route        | `.tmp/slate-v2/packages/slate/src/editor/delete-backward.ts:31-42`                                                                                                        | `deleteBackward` dispatches `{ type: 'delete', direction: 'backward', unit }`.                                 | `use`; checklist Backspace belongs here.                                                                                                                 |
| Typed command API           | `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:1561-1575`                                                                                                         | `Editor.defineCommand` and `Editor.registerCommand` are public.                                                | `keep`; add exported built-in command definitions for substrate/advanced use, while examples use transform middleware.                                   |
| Command tests               | `.tmp/slate-v2/packages/slate/test/transaction-contract.ts:720-801`, `:1023-1105`                                                                                         | Delete, insert-text, and typed command definitions have package proof.                                         | `keep`; substrate is real, not aspirational.                                                                                                             |
| `editableKeyCommands`       | `.tmp/slate-v2/packages/slate-react/src/editable/editable-key-commands.ts:7-35`, `.tmp/slate-v2/packages/slate-react/src/editable/keyboard-input-strategy.ts:125-149`     | Extension-owned hotkeys route through Slate React keyboard handling and repair.                                | `keep in slate-react`, not core Slate and not Plate-only; use only for keyboard/native escape glue, not model commands already covered by core commands. |
| Key-command examples        | `.tmp/slate-v2/site/examples/ts/images.tsx:91-108`, `.tmp/slate-v2/site/examples/ts/richtext.tsx:391-410`, `.tmp/slate-v2/site/examples/ts/code-highlighting.tsx:142-160` | Examples use key commands to remove raw `Editable onKeyDown` glue.                                             | `keep`; this fits Slate React example extension glue.                                                                                                    |
| `editableRenderers`         | `.tmp/slate-v2/packages/slate-react/src/editable/editable-renderers.ts:14-89`, `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:1392-1408`     | Extension renderers merge element, leaf, segment, text, and void renderers; direct render props override them. | `keep in slate-react`; core Slate stays non-React, Plate can layer product registries above it.                                                          |
| Plate input rules           | `../plate/packages/core/src/lib/plugins/input-rules/internal/InputRulesPlugin.ts:94-190`, `../plate/packages/core/src/internal/plugin/resolvePlugins.ts:352-433`          | Plate resolves plugin input rules by target, trigger, priority, owner, `enabled`, `resolve`, and `apply`.      | `keep in Plate`; do not clone this into raw Slate React.                                                                                                 |

Fresh verification:

| Command                                                                                                                                                                      | Cwd             | Result                                  | What it proves                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `bun test packages/slate/test/transaction-contract.ts --test-name-pattern "routes delete commands\|stores command handlers\|registers typed internal command definitions"`   | `.tmp/slate-v2` | failed: Bun required `./` path syntax.  | Tooling syntax failure only; rerun below.                                                                                 |
| `bun test ./packages/slate/test/transaction-contract.ts --test-name-pattern "routes delete commands\|stores command handlers\|registers typed internal command definitions"` | `.tmp/slate-v2` | green: 3 passed, 25 filtered.           | Command middleware and typed command substrate are executable.                                                            |
| `bun --filter slate-react test:vitest -- editable-behavior surface-contract keyboard-input-strategy-contract`                                                                | `.tmp/slate-v2` | green: 3 files passed, 39 tests passed. | Slate React editable behavior, public surface, and key-command/keyboard strategy contracts are not imaginary plan claims. |

Key-command/renderers ownership answer:

- `editableKeyCommands` fits `slate-react`, not core `slate`, and not Plate-only.
  It is React/keyboard/native-event extension glue for examples and app escape
  hatches. Do not use it for semantic model behavior that already has a core
  command route.
- `editableRenderers` fits `slate-react`. Rendering is React-owned; core
  `slate` must stay renderer-agnostic. Plate can build richer product/component
  registries on top, but raw Slate React should keep the low-level renderer
  extension registry.
- `editableInputRules` is the odd one out. It looks like Plate product rule DX,
  but it lives in Slate React and speaks DOM `inputType`; cut it.
- Direct `Editor.registerCommand(...)` is also too ceremonial as the main
  example DX. Keep it underneath; expose transform middleware as the normal
  Slate-close authoring surface.

Issue/accounting rerun:

| Issue   | Fresh ledger source                                                                                             | Claim   | Decision                                                                                                     |
| ------- | --------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------ |
| `#3384` | `docs/slate-issues/gitcrawl-live-open-ledger.md:609`                                                            | Related | Checklist example pressure only; no fixed claim until checklist command/browser proof exists.                |
| `#4528` | `docs/slate-issues/gitcrawl-live-open-ledger.md:415`, `docs/slate-issues/test-candidate-map/4541-4392.md:67-81` | Related | Triple-click checklist selection is adjacent, not closed by API ownership.                                   |
| `#3408` | `docs/slate-issues/gitcrawl-live-open-ledger.md:167`                                                            | Related | Delete-backward customization pressure; no exact empty-list/table repro closure.                             |
| `#4532` | `docs/slate-issues/gitcrawl-live-open-ledger.md:420`, `docs/slate-issues/test-candidate-map/4541-4392.md:37-41` | Related | Android markdown shortcut remains a proof owner after implementation; no claim in planning.                  |
| `#3568` | `docs/slate-issues/gitcrawl-live-open-ledger.md:589`, `docs/slate-v2/ledgers/issue-coverage-matrix.md:249`      | Related | Native format input already has adjacent `onCommand` pressure; this plan does not replay the original crash. |
| `#3586` | `docs/slate-issues/gitcrawl-live-open-ledger.md:588`, `docs/slate-v2/ledgers/issue-coverage-matrix.md:250`      | Related | Hovering-toolbar formatting is adjacent; exact DOMPoint crash closure still needs original repro proof.      |

Issue sync accounting decision:

- `docs/slate-v2/references/pr-description.md:582-640` records transform
  middleware as the accepted Section 6.2 public DX and says implementation is
  not complete.
- `docs/slate-v2/references/pr-description.md:642-675` already records the
  native command boundary, including `editableKeyCommands`.
- `docs/slate-v2/references/pr-description.md:818-832` already records
  `editableRenderers` ownership.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md` unchanged: no new
  `Fixes #...` or `Improves #...` claim is legal before implementation proof.
- `docs/slate-v2/ledgers/fork-issue-dossier.md` unchanged: existing
  input-runtime/checklist/renderers/key-command surfaces cover the related
  issue context; this rerun adds no new issue classification.

Fresh 12-pass ledger:

|   # | Required pass                                                         | Status   | Evidence added                                                                                                                                                                                                              | Plan delta                                                                                                                                                               | Open issues                            | Next owner                                         |
| --: | --------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- | -------------------------------------------------- |
|   1 | Current-state read and initial score                                  | complete | Re-read live Slate React exports, `Editable` props/types, input-rule helper, runtime invocation, examples, core command registry, delete route, command API, command tests, key commands, renderers, and Plate input rules. | Added fresh current-state table.                                                                                                                                         | None.                                  | none                                               |
|   2 | Related issue discovery                                               | complete | Reused generated live ledger, manual sync ledger, coverage matrix, fork dossier, and existing PR-reference rows; no broad live GitHub search.                                                                               | Kept ClawSweeper skip: existing durable ledgers cover this touched surface.                                                                                              | None.                                  | none                                               |
|   3 | Issue-ledger pass                                                     | complete | Rechecked `#3384`, `#4528`, `#3408`, `#4532`, `#3568`, and `#3586` from live/candidate/coverage ledgers.                                                                                                                    | Added fresh issue/accounting rerun table.                                                                                                                                | Related only; no fixed/improved claim. | Ralph only if implementation proof changes claims. |
|   4 | Intent/boundary and decision brief                                    | complete | Existing Intent Boundary and Decision Brief remain current against live source.                                                                                                                                             | Added explicit transform-middleware public DX boundary plus key-command/renderers boundary answer.                                                                       | None.                                  | none                                               |
|   5 | Research, ecosystem synthesis, live-source refresh                    | complete | Re-read research index/log and compiled Lexical/ProseMirror/Tiptap/state-tx sources; live source still supports command substrate plus Plate-owned product rules.                                                           | No target change.                                                                                                                                                        | None.                                  | none                                               |
|   6 | Performance, DX, migration, regression, research, simplicity pressure | complete | Source/test proof confirms command middleware is bounded by handlers and `editableInputRules` is avoidable public surface.                                                                                                  | Strengthened DX: examples use transform middleware, not direct command registration; only input rules are cut; key commands/renderers stay.                              | None.                                  | none                                               |
|   7 | Slate maintainer objection ledger / steelman                          | complete | Rechecked strongest objections: convenience loss, command registry publicness, transform middleware being too close to old overrides, Plate boundary, key-command/renderers placement.                                      | Added answer: transform middleware is the Slate-close public layer; key commands/renderers are not the same mistake as input rules.                                      | None.                                  | none                                               |
|   8 | High-risk deliberate mode                                             | complete | Existing public API cut pre-mortem remains valid; fresh tests prove command/key-command substrate is live.                                                                                                                  | No new risk beyond implementation proof gates.                                                                                                                           | None.                                  | none                                               |
|   9 | Ecosystem maintainer pass                                             | complete | Plate/plugin answer: Plate keeps rule families; Slate exposes transform middleware over the command substrate plus React renderer/key glue. Collab answer: model commands stay core and deterministic.                      | Added render/key distinction so Plate does not absorb every React extension surface.                                                                                     | None.                                  | none                                               |
|  10 | Revision pass                                                         | complete | Revised plan language to include key-command/renderers ownership and current-source verification.                                                                                                                           | Added this full rerun section.                                                                                                                                           | None.                                  | none                                               |
|  11 | Issue sync accounting pass                                            | complete | PR reference updated for 6.2, with 6.2.1 and renderers still current; issue ledgers unchanged because no claims changed.                                                                                                    | Recorded `pr-description updated: Section 6.2 now teaches transform middleware over command substrate, key commands, renderers, and not-complete implementation status`. | None.                                  | Ralph after implementation.                        |
|  12 | Closure score and final gates                                         | complete | All pass rows complete; fresh `.tmp/slate-v2` targeted tests green; completion state can be `done` only with final Done Handoff.                                                                                            | Plan is ready for user review; implementation still belongs to Ralph.                                                                                                    | None.                                  | user / Ralph                                       |

Fresh score after full rerun:

| Dimension                                                | Score | Evidence                                                                                                                                                                                                   |
| -------------------------------------------------------- | ----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance                           |  0.93 | Semantic model behavior moves out of React `beforeinput` rule callbacks; key-command/renderers stay in Slate React where they are event/render glue.                                                       |
| Slate-close unopinionated DX                             |  0.96 | Raw Slate exposes transform middleware that feels like structured `withX(editor)` overrides, while command middleware stays the substrate and Slate React does not expose Plate-style input-rule families. |
| Plate and slate-yjs migration-backbone shape             |  0.93 | Plate keeps rich input rules; Slate keeps command/tx substrate; render/key React extension surfaces stay outside core and do not affect collab determinism.                                                |
| Regression-proof testing strategy                        |  0.92 | Fresh `.tmp/slate-v2` command and Slate React contract tests passed; browser rows remain Ralph implementation gates.                                                                                       |
| Research evidence completeness                           |  0.93 | Compiled Lexical/ProseMirror/Tiptap/state-tx research and live Slate/Plate source agree.                                                                                                                   |
| shadcn-style composability and hook/component minimalism |  0.93 | Public surface shrinks by cutting input rules while keeping focused transform, render, and key extension helpers.                                                                                          |

Weighted total: `0.93`.

Completion gates:

- Score is `0.93`, no dimension below `0.85`.
- Every scheduled pass row is `complete`.
- No issue row is `Fixes` or `Improves`; all touched issues remain related
  until implementation proof exists.
- `pr-description updated: Section 6.2 now records transform middleware as the
public Slate-close DX over command middleware substrate`.
- No `.tmp/slate-v2` implementation file was edited.
- Remaining work is implementation by `ralph`, not Slate Ralplan review.

Final user-review handoff outline for this rerun:

- Public API: cut `EditableInputRule*`, `editableInputRules(...)`, and
  `EDITABLE_INPUT_RULE_CAPABILITY` from Slate React.
- Runtime: keep Slate React DOM input routing and repair queue; remove public
  semantic input-rule collection.
- Model behavior: move checklist Backspace to transform middleware public DX
  over the core delete-command substrate.
- Typed commands: expose built-in delete and insert-text command definitions for
  low-level substrate users and tests, not as the normal example shape.
- Text shortcuts: migrate markdown and inline URL insertion to
  `transforms.insertText(...)`, or keep only truly browser-specific paths on
  `onDOMBeforeInput`.
- Plate boundary: keep rich semantic input-rule families in Plate.
- `editableKeyCommands`: keep in Slate React for extension-owned keyboard glue;
  do not use it for model commands that belong in core command middleware.
- `editableRenderers`: keep in Slate React for extension-owned renderer
  registration; core Slate stays renderer-agnostic and Plate can layer product
  registries above it.
- Issue accounting: `#3384`, `#4528`, `#3408`, `#4532`, `#3568`, and `#3586`
  stay related/not fixed.
- Proof gates: Ralph must run the `.tmp/slate-v2` command/browser gates before
  implementation can claim release-ready.

## Transform Middleware DX Revision - 2026-05-15

Status: `done`

User correction:

- Direct `Editor.registerCommand(..., EditorCommands.delete, ...)` is a good
  substrate but not the absolute-best Slate authoring DX.

Accepted final shape:

```ts
const withChecklists = <T extends ReactEditor<CustomValue>>(editor: T): T => {
  editor.extend({
    name: "checklists",
    transforms: {
      deleteBackward({ editor, next }) {
        if (applyChecklistBackspaceStart(editor)) return;

        next();
      },
    },
  });

  return editor;
};
```

Text shortcuts use the same shape:

```ts
editor.extend({
  name: "markdown-shortcuts",
  transforms: {
    insertText({ editor, next, options, text }) {
      if (applyMarkdownTextShortcut(editor, text)) return;

      next();
      // or next({ options, text: normalizedText })
    },
  },
});
```

Architecture decision:

- Public DX: transform middleware.
- `next()` DX: preserve current args by default; allow explicit partial
  overrides such as `next({ text: normalizedText })`.
- Runtime substrate: command middleware.
- Low-level escape hatch: direct `Editor.registerCommand(...)` with typed
  built-in command definitions.
- Rejected DX: public examples centered on direct `Editor.registerCommand(...)`;
  too far from Slate's `withX(editor)` override tradition.
- Still rejected: `editableInputRules(...)`; it is DOM `inputType` / Plate-rule
  vocabulary in the wrong package.

Plan delta:

- Updated Public API Target, Internal Runtime Target, implementation phases,
  scorecard wording, objection ledger, full rerun handoff, and PR reference
  sync status to reflect transform middleware public DX.
- Finalized the transform middleware `next()` contract: no-arg `next()`
  delegates unchanged, explicit overrides are shallow-merged, and handled
  behavior means not calling `next()`.

## Ralph Execution Start - 2026-05-15

Status: `done`

Goal:

- Land the editable input-rule ownership plan in `.tmp/slate-v2`: transform
  middleware public DX with `next()` forwarding/overrides, command middleware
  substrate, public `editableInputRules` cut, example migration, reference sync,
  issue accounting, and passing focused/closeout gates.

Continuation prompt:

- `active goal state`

Current pass:

- `tdd-pass`
- Owner: `.tmp/slate-v2/packages/slate` extension runtime
- Scope: add transform middleware public DX for `deleteBackward` and
  `insertText`, including `next()` default forwarding and partial overrides.
- Trigger: public API behavior requires red-green-refactor proof.

First runnable slice:

- Add a public behavior test in
  `.tmp/slate-v2/packages/slate/test/extension-methods-contract.ts` proving
  extension transform middleware can delegate unchanged and override
  `insertText` args through `next({ text })`.
- Confirm RED before implementation.
- Implement the smallest runtime seam needed for that test, then keep
  top-level completion `pending` for the remaining plan phases.

## Ralph Execution Done Handoff - 2026-05-15

Status: `done`

Implemented:

- Added `extension.transforms.deleteBackward` and `extension.transforms.insertText`
  to `.tmp/slate-v2/packages/slate`, backed by the existing command middleware
  substrate.
- Added `next()` forwarding and `next(overrides)` shallow override behavior,
  with a double-`next()` guard.
- Cut public `EditableInputRule*`, `editableInputRules`, the input-rule
  capability helper, and the `Editable inputRules` prop from Slate React.
- Migrated checklist Backspace, markdown typed shortcuts, and inline URL typed
  insertion to transform middleware in the public examples.
- Kept `onDOMBeforeInput`, `onCommand`, `editableKeyCommands`, and
  `editableRenderers` in Slate React; those are browser/render/key glue, not
  Plate semantic input-rule families.
- Added changesets for `slate` and `slate-react` in `.tmp/slate-v2/.changeset`.
- Updated this plan, the Ralph continuation prompt, completion state, and
  `docs/slate-v2/references/pr-description.md`.

Pass accounting:

| Pass                      | Status   | Evidence                                                                                                                                                                                                                                |
| ------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tdd-pass`                | complete | RED first: `bun test ./packages/slate/test/extension-methods-contract.ts --test-name-pattern "extension transform middleware"` failed because middleware was not invoked; GREEN after implementation: same command passed with 2 tests. |
| implementation slice      | complete | Slate runtime, Slate React public surface, example migrations, tests, and changesets landed.                                                                                                                                            |
| `diff-review-pass`        | complete | Reviewed touched Slate core, Slate React, examples, changesets, plan, PR reference, and completion files. No blocking issue found.                                                                                                      |
| `verification-sweep-pass` | complete | Focused package tests, typechecks, site typecheck, lint fix, browser example proof, full `bun check`, Plate-2 lint fix, and completion hook passed.                                                                                     |

Verification:

- `bun test ./packages/slate/test/extension-methods-contract.ts --test-name-pattern "extension transform middleware"`: pass.
- `bun test ./packages/slate/test/extension-methods-contract.ts`: pass.
- `bun test ./packages/slate/test/transaction-contract.ts --test-name-pattern "routes delete commands|stores command handlers|registers typed internal command definitions"`: pass.
- `bun --filter slate-react test:vitest -- editable-behavior surface-contract keyboard-input-strategy-contract`: pass.
- `bun --filter slate typecheck`: pass.
- `bun --filter slate-react typecheck`: pass.
- `bun x tsc --project site/tsconfig.json --noEmit`: pass.
- `bun test ./packages/slate/test`: pass.
- `bun lint:fix`: pass.
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun x playwright test playwright/integration/examples/check-lists.test.ts playwright/integration/examples/markdown-shortcuts.test.ts playwright/integration/examples/inlines.test.ts --project=chromium`: pass.
- `bun check`: pass.
- `rg -n "EditableInputRule|editableInputRules|EDITABLE_INPUT_RULE|inputRules" .tmp/slate-v2/packages/slate-react/src .tmp/slate-v2/packages/slate-react/test .tmp/slate-v2/site/examples/ts .tmp/slate-v2/packages/slate/src .tmp/slate-v2/packages/slate/test`: no matches.
- `pnpm lint:fix`: pass in `/Users/zbeyens/git/plate-2`.
- `node tooling/scripts/completion-check.mjs`: pass in
  `/Users/zbeyens/git/plate-2`.

Issue accounting:

- No new fixed or improved issue claim.
- The related issue rows from the Slate Ralplan pass stay related only:
  `#3384`, `#4528`, `#3408`, `#4532`, `#3568`, and `#3586`.
- ClawSweeper was not rerun because implementation did not change claim status,
  issue surface, or PR issue narrative.

## Done Handoff

The full plan is landed. Public Slate v2 example DX is now transform middleware:

```ts
const withChecklists = <T extends ReactEditor<CustomValue>>(editor: T): T => {
  editor.extend({
    name: "checklists",
    transforms: {
      deleteBackward({ editor, next }) {
        if (applyChecklistBackspaceStart(editor)) return;

        next();
      },
    },
  });

  return editor;
};
```

`editableInputRules` is gone from public Slate React, examples no longer teach
DOM `inputType` rules for model behavior, and the completion hook is cleared by
same-turn evidence.

## Full Transform Middleware Coverage Hard Cut - 2026-05-16

Status: `done`

### Current Verdict

The current `EditorTransformMiddlewareMap` is too narrow. It was a good first
slice for checklist and typed-text examples, but it is not the final Slate v2
extension authoring surface.

Hard cut target: transform middleware must cover every public mutating editor
transform except engine controls. No compatibility aliases, no restored
`editableInputRules`, no public `commands` extension slot, and no root export of
raw command registry helpers.

### Intent Boundary

| Field                | Decision                                                                                                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent               | Replace the incomplete two-key transform middleware surface with a full Slate-close override surface.                                                                       |
| Desired outcome      | A Ralph execution can make `extension.transforms` cover all public mutating transform families without regressing current command/runtime behavior.                         |
| In scope             | `EditorTransformMiddlewareMap`, transform context arg types, command substrate coverage, tests, examples/docs, PR reference, and issue accounting.                          |
| Non-goals            | Backward compatibility with `editableInputRules`, legacy `methods`, public extension `commands`, or root-level command registry exports.                                    |
| Decision boundary    | This plan may hard-cut public API shape and require command/transform refactors in `.tmp/slate-v2`; it may not change Slate v2 implementation from this Slate Ralplan lane. |
| User decision needed | None. The hard-cut direction is explicit: full coverage, no regression, no backward-compat shim.                                                                            |

### Live Source Evidence

| Surface                   | Source                                                                                                                                                                                                                                                                                                                                                                                                                            | Current shape                                                                                                                   | Verdict                                                                                          |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Transform registry        | `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:508-618`                                                                                                                                                                                                                                                                                                                                                                   | `EditorTransformApi` contains mark, text/delete, fragment, break, node, selection, normalization-control, and bookmark methods. | Full coverage must be measured against this list, not against example needs.                     |
| Current middleware map    | `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:620-656`                                                                                                                                                                                                                                                                                                                                                                   | Only `deleteBackward` and `insertText` are accepted.                                                                            | Under-scoped.                                                                                    |
| Runtime binding           | `.tmp/slate-v2/packages/slate/src/create-editor.ts:355-397`                                                                                                                                                                                                                                                                                                                                                                       | The transform registry binds all transform methods into the editor runtime.                                                     | Coverage can be driven from the registry surface.                                                |
| Current extension bridge  | `.tmp/slate-v2/packages/slate/src/core/editor-extension.ts:297-370`                                                                                                                                                                                                                                                                                                                                                               | Registration has bespoke branches for only `deleteBackward` and `insertText`.                                                   | Replace with a generic transform-middleware registration table.                                  |
| Command substrate         | `.tmp/slate-v2/packages/slate/src/core/command-registry.ts:69-120`                                                                                                                                                                                                                                                                                                                                                                | Command middleware is priority ordered, supports `next(overrideCommand)`, and runs in command context.                          | Keep as substrate.                                                                               |
| Existing command dispatch | `.tmp/slate-v2/packages/slate/src/editor/add-mark.ts:69-79`, `remove-mark.ts:62-72`, `toggle-mark.ts:46-60`, `delete-backward.ts:31-42`, `delete-forward.ts:31-42`, `delete-fragment.ts:33-45`, `insert-break.ts:13-18`, `insert-text.ts:45-93`, `.tmp/slate-v2/packages/slate/src/transforms-text/insert-fragment.ts:1565-1577`, `.tmp/slate-v2/packages/slate/src/transforms-selection/move.ts:57-69`, `set-selection.ts:18-25` | Several transform families already dispatch commands; node transforms and some selection/break aliases do not.                  | Ralph must complete the command substrate before exposing full middleware.                       |
| Public root guard         | `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts:381-398`                                                                                                                                                                                                                                                                                                                                                            | Root package does not export legacy transform namespaces or command registry helpers.                                           | Keep this. Full transform middleware makes root command exports unnecessary.                     |
| Legacy extension hard cut | `.tmp/slate-v2/packages/slate/test/extension-methods-contract.ts:15-71`                                                                                                                                                                                                                                                                                                                                                           | Legacy `methods` and public `commands` slots are rejected.                                                                      | Keep. Do not reopen old plugin slots.                                                            |
| Current proof             | `.tmp/slate-v2/packages/slate/test/extension-methods-contract.ts:227-282`                                                                                                                                                                                                                                                                                                                                                         | Tests prove only `insertText` and `deleteBackward`.                                                                             | Add coverage tests for every accepted transform key.                                             |
| Issue pressure            | `docs/slate-v2/ledgers/fork-issue-dossier.md:4029-4054`                                                                                                                                                                                                                                                                                                                                                                           | `#3557` asks for insert-node/insert-fragment override extension points and remains related.                                     | Full transform coverage directly addresses the pressure, but no claim changes until proof lands. |

### Decision Brief

Principles:

- Public extension DX should feel like structured Slate `withX(editor)` overrides.
- Command middleware remains substrate, not the normal example API.
- Full coverage means no silent transform family gaps.
- Engine-control APIs do not become plugin policy hooks.
- No backward-compat shim is allowed for wrong public API.

Options:

| Option                                                                                                        | Pros                                                                                     | Cons                                                                                                                        | Verdict                                        |
| ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Keep only `deleteBackward` and `insertText`                                                                   | Minimal and already green.                                                               | Leaves obvious gaps like `deleteForward`, `insertFragment`, `insertNode`, marks, node transforms, and selection transforms. | Reject. Too patchy.                            |
| Add a few more hand-picked keys                                                                               | Faster than full map.                                                                    | Same failure mode later; every new example reopens API law.                                                                 | Reject. This is how the API rots.              |
| Expose direct command registry helpers as public root DX                                                      | Complete substrate and already supports priority/next.                                   | Too far from Slate authoring style; teaches internal command strings instead of transform names.                            | Reject for public DX. Keep internal/substrate. |
| Wrap every transform registry method including engine controls                                                | Looks complete.                                                                          | Lets extensions intercept `normalize`, `setNormalizing`, and `withoutNormalizing`; this invites engine-state corruption.    | Reject.                                        |
| Type-driven transform middleware over all public mutating transforms, with explicit engine-control exclusions | Full Slate-close coverage, no manual drift, keeps commands internal, clear proof matrix. | Requires a broader command/default-handler refactor and many tests.                                                         | Choose.                                        |

### Public API Target

`EditorTransformMiddlewareMap` should be derived from an explicit key set, not
hand-written as two properties.

Accepted transform middleware keys:

| Family         | Keys                                                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Marks          | `addMark`, `removeMark`, `toggleMark`                                                                                                                  |
| Text/delete    | `delete`, `deleteBackward`, `deleteForward`, `deleteFragment`, `insertText`                                                                            |
| Break/fragment | `insertBreak`, `insertSoftBreak`, `insertFragment`                                                                                                     |
| Nodes          | `insertNode`, `insertNodes`, `liftNodes`, `mergeNodes`, `moveNodes`, `removeNodes`, `setNodes`, `splitNodes`, `unsetNodes`, `unwrapNodes`, `wrapNodes` |
| Selection      | `collapse`, `deselect`, `move`, `select`, `setPoint`, `setSelection`                                                                                   |

Explicit exclusions:

| Key                  | Reason                                                                            |
| -------------------- | --------------------------------------------------------------------------------- |
| `bookmark`           | Returns a bookmark; not an editing command.                                       |
| `normalize`          | Extension-owned normalization belongs in `normalizers`, not transform middleware. |
| `setNormalizing`     | Engine control switch, not content policy.                                        |
| `withoutNormalizing` | Engine batching control, not content policy.                                      |

Target type shape:

```ts
type EditorPublicTransformMiddlewareKey = Exclude<
  keyof EditorTransformApi,
  "bookmark" | "normalize" | "setNormalizing" | "withoutNormalizing"
>;

type EditorTransformMiddlewareMap<
  TEditor extends BaseEditor<any> = Editor,
  V extends Value = Value,
> = {
  [K in EditorPublicTransformMiddlewareKey]?: (
    context: EditorTransformMiddlewareContext<
      TEditor,
      EditorTransformMiddlewareArgs<V>[K]
    >,
  ) => EditorCommandResult | void;
};
```

`EditorTransformMiddlewareArgs` must use named object args, not tuple soup:

```ts
type EditorTransformMiddlewareArgs<V extends Value = Value> = {
  addMark: { key: string; value: unknown };
  collapse: { options?: SelectionCollapseOptions };
  delete: { options?: TextDeleteOptions };
  deleteBackward: { unit: TextUnit };
  deleteForward: { unit: TextUnit };
  deleteFragment: { options?: EditorFragmentDeletionOptions };
  deselect: {};
  insertBreak: {};
  insertFragment: {
    fragment: DescendantIn<V>[];
    options?: TextInsertFragmentOptions;
  };
  insertNode: {
    node: ElementOrTextIn<V>;
    options?: NodeInsertNodesOptions<ElementOrTextIn<V>>;
  };
  insertNodes: {
    nodes: ElementOrTextIn<V> | ElementOrTextIn<V>[];
    options?: NodeInsertNodesOptions<ElementOrTextIn<V>>;
  };
  insertSoftBreak: {};
  insertText: { options?: TextInsertTextOptions; text: string };
  liftNodes: {
    options?: EditorTransformApi<V>["liftNodes"] extends (
      options?: infer O,
    ) => void
      ? O
      : never;
  };
  mergeNodes: {
    options?: EditorTransformApi<V>["mergeNodes"] extends (
      options?: infer O,
    ) => void
      ? O
      : never;
  };
  move: { options?: SelectionMoveOptions };
  moveNodes: {
    options: EditorTransformApi<V>["moveNodes"] extends (
      options: infer O,
    ) => void
      ? O
      : never;
  };
  removeMark: { key: string };
  removeNodes: {
    options?: EditorTransformApi<V>["removeNodes"] extends (
      options?: infer O,
    ) => void
      ? O
      : never;
  };
  select: { target: Location };
  setNodes: {
    props: Partial<NodeProps<NodeIn<V>>>;
    options?: EditorTransformApi<V>["setNodes"] extends (
      props: any,
      options?: infer O,
    ) => void
      ? O
      : never;
  };
  setPoint: { options?: SelectionSetPointOptions; props: Partial<Point> };
  setSelection: { props: Partial<Range> };
  splitNodes: {
    options?: EditorTransformApi<V>["splitNodes"] extends (
      options?: infer O,
    ) => void
      ? O
      : never;
  };
  toggleMark: { key: string; value?: unknown };
  unsetNodes: {
    options?: EditorTransformApi<V>["unsetNodes"] extends (
      props: any,
      options?: infer O,
    ) => void
      ? O
      : never;
    props: string | string[];
  };
  unwrapNodes: {
    options?: EditorTransformApi<V>["unwrapNodes"] extends (
      options?: infer O,
    ) => void
      ? O
      : never;
  };
  wrapNodes: {
    element: ElementIn<V>;
    options?: EditorTransformApi<V>["wrapNodes"] extends (
      element: any,
      options?: infer O,
    ) => void
      ? O
      : never;
  };
};
```

Implementation can simplify the helper types, but it must keep the named context
DX:

```ts
editor.extend({
  name: "tables",
  transforms: {
    insertFragment({ editor, fragment, next, options }) {
      if (insertTableFragment(editor, fragment, options)) return;

      next();
    },
    wrapNodes({ element, next, options }) {
      next({ element, options: { ...options, split: true } });
    },
  },
});
```

### Internal Runtime Target

- Replace bespoke `deleteBackward` / `insertText` registration branches with a
  table-driven transform middleware bridge.
- Every accepted transform key gets a command/default-handler route before it is
  exposed.
- Extract private `applyX` helpers where needed so one public transform does not
  accidentally fire a second public transform middleware when defaulting through
  an implementation alias.
- Preserve current operation output for no-middleware defaults.
- Preserve `next()` semantics:
  - `next()` forwards current args unchanged.
  - `next(overrides)` shallow-merges explicit overrides.
  - not calling `next()` means handled.
  - calling `next()` twice throws.
- Preserve command ordering: extension install order plus command priority must
  stay deterministic.

### Hard Cuts

- Cut any idea of restoring `editableInputRules`.
- Cut old `methods` extension slots.
- Cut public extension `commands` slots.
- Cut root exports for `defineCommand`, `registerCommand`, `executeCommand`, or
  `EditorCommands`.
- Cut manual two-key middleware maps. The accepted key set must drift-fail when
  `EditorTransformApi` grows.

### Issue Ledger Accounting

| Issue   | Cluster                     | Claim                                         | Why                                                                                                                            | Proof route                                                                                                             | V2 sync ledger                                               | PR line                                                                            |
| ------- | --------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `#3557` | extension-method-overrides  | Related now; candidate `Improves` after proof | Full transform middleware is the real v2 answer to insert-node/insert-fragment override pressure.                              | Add package tests for `insertNode`, `insertNodes`, and `insertFragment` middleware plus no-middleware operation parity. | Existing row stays Related until Ralph implementation proof. | related matrix only before implementation; candidate `Improves #3557` after proof. |
| `#5050` | singleton-input-runtime     | Related                                       | `insertText` accept/reject remains covered by transform middleware, but exact issue closure needs matching repro.              | Existing `insertText` middleware tests plus focused beforeinput/browser proof if claiming.                              | unchanged                                                    | related matrix only.                                                               |
| `#4613` | clipboard-extension-surface | Existing Improves unchanged                   | Clipboard `insertData` remains Slate DOM capability; transform middleware covers model insert transforms, not DOM data intake. | Existing clipboard proof plus `insertFragment` middleware tests.                                                        | unchanged                                                    | unchanged.                                                                         |
| `#3568` | singleton-input-runtime     | Related                                       | Mark commands should get transform middleware, but native format crash closure remains runtime proof.                          | `addMark`/`removeMark`/`toggleMark` middleware tests plus existing `onCommand` browser/React proof if claiming.         | unchanged                                                    | related matrix only.                                                               |

ClawSweeper pass: reused existing dossier and matrix rows. No broad live GitHub
search. No fixed or improved claim changes in this planning pass.

### Regression Proof Matrix

| Surface                | Required proof                                                                                                                                                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Type coverage          | Type-level contract: `EditorPublicTransformMiddlewareKey` equals accepted keys and excludes only `bookmark`, `normalize`, `setNormalizing`, `withoutNormalizing`.                                                            |
| Runtime coverage       | Package test installs middleware for every accepted key and proves it is invoked by the matching `Editor.*` transform.                                                                                                       |
| `next()` contract      | Per-family tests for unchanged delegation, override delegation, handled-without-next, and double-next throw.                                                                                                                 |
| No-middleware parity   | Snapshot/operation tests prove no-middleware defaults produce the same operations before and after the refactor.                                                                                                             |
| Node override pressure | Tests for `insertNode`, `insertNodes`, `insertFragment`, `setNodes`, `wrapNodes`, and `unwrapNodes`.                                                                                                                         |
| Selection safety       | Tests for `select`, `setSelection`, `setPoint`, `collapse`, `deselect`, and `move` with null and non-null selection cases.                                                                                                   |
| Mark safety            | Tests for collapsed marks, expanded mark ranges, and markable void behavior for add/remove/toggle.                                                                                                                           |
| Browser examples       | Re-run checklist, markdown-shortcuts, inlines, richtext format command rows, paste-html/images if fragment or clipboard-adjacent behavior changes.                                                                           |
| Broad closeout         | `bun --filter slate typecheck`, focused package tests, `bun --filter slate-react test:vitest -- editable-behavior surface-contract keyboard-input-strategy-contract`, site typecheck, relevant Playwright rows, `bun check`. |

### Applicable Review Matrix

| Lens                          | Applies | Finding                                                                                                         | Plan delta                                                                 |
| ----------------------------- | ------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `vercel-react-best-practices` | applied | React stays projection/runtime bridge; model behavior leaves DOM callbacks.                                     | No React prop expansion.                                                   |
| `performance-oracle`          | applied | Full transform middleware must be O(number of handlers for that key), not a global before-every-transform scan. | Require keyed registration table and no-middleware parity tests.           |
| `performance`                 | skipped | No production perf claim or new benchmark target in planning pass.                                              | Use existing benchmarks only if implementation changes operation cost.     |
| `tdd`                         | applied | Broad public API change needs red-green tests before implementation.                                            | Ralph starts with type/key coverage tests and one runtime missing-key RED. |
| `build-web-apps:shadcn`       | skipped | No UI chrome change.                                                                                            | none                                                                       |
| `react-useeffect`             | skipped | No effect/subscription change.                                                                                  | none                                                                       |

### Ecosystem Strategy Synthesis

| System      | Source                                                                                                                                            | Mechanism                                                             | Avoids                                                       | Steal                                              | Reject                                            | Slate target                                                                       | Verdict |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------- | ------- |
| Lexical     | `docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md`                                                              | Prioritized command handlers run inside update context.               | Event-specific app code and nondeterministic listener order. | Keyed command substrate under extension lifecycle. | Public `dispatchCommand` as normal authoring DX.  | Public transform middleware over private command substrate.                        | agree   |
| ProseMirror | `docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md`                                                           | Commands receive state/dispatch while transaction owns model changes. | DOM event code mutating model ad hoc.                        | Keep model commands separate from DOM bridge.      | ProseMirror plugin complexity and position model. | Full transform middleware maps to model transforms; Slate React keeps DOM routing. | agree   |
| Tiptap      | `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md`                                                                  | Extensions package commands with discoverable names.                  | Scattered setup and method monkeypatches.                    | Discoverable extension-owned transform names.      | Product-style input rules in raw Slate.           | `extension.transforms` covers transform families; Plate owns rich rules.           | partial |
| Plate       | `../plate/packages/core/src/lib/plugins/input-rules/internal/InputRulesPlugin.ts`, `../plate/packages/core/src/internal/plugin/resolvePlugins.ts` | Product plugins own semantic input rules with triggers and priority.  | Raw editor package becoming product framework.               | Keep product rules in Plate.                       | Rebuilding Plate rules in Slate React.            | Slate exposes primitive transform middleware that Plate can build on.              | agree   |

### Slate Maintainer Objection Ledger

| Change                                 | Likely objection                                                  | Steelman antithesis                                       | Tradeoff                                                                        | Answer                                                                                                                                                    | Verdict |
| -------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Full transform middleware coverage     | "This recreates monkeypatchable editor methods."                  | Two-key coverage keeps the API small and examples simple. | More public surface to test and document.                                       | The public surface already has transform names; a partial map is worse because users discover random gaps. Type-driven coverage makes the surface honest. | keep    |
| Exclude engine controls                | "If you say full, why exclude normalize and batching?"            | True full coverage is simpler to explain.                 | Exclusions need docs.                                                           | `normalizers` and batching controls are engine APIs. Letting extensions intercept them is how subtle corruption ships.                                    | keep    |
| Cut root command helper exports        | "Advanced users need low-level commands."                         | Command registry is powerful and already implemented.     | Some advanced users must use `slate/internal` or transform middleware.          | Public root should not teach command strings. Full transform middleware removes the need for command helpers as normal DX.                                | keep    |
| Candidate `Improves #3557` after proof | "This does not reproduce the exact legacy method override issue." | Full insert transform hooks are the conceptual fix.       | Cannot claim until package proof covers insert-node/fragment override behavior. | Keep Related now; promote only after Ralph lands insert-node/fragment tests.                                                                              | keep    |

### Pass Ledger

|   # | Pass                                                    | Status   | Evidence added                                                                                                                                  | Plan delta                                               | Open issues | Next owner |
| --: | ------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ----------- | ---------- |
|   1 | Current-state read and initial score                    | complete | Read live `EditorTransformApi`, current two-key middleware map, runtime binding, command dispatch files, extension tests, public-surface guard. | Added hard-cut full coverage verdict.                    | none        | none       |
|   2 | Related issue discovery                                 | complete | Reused `#3557`, `#5050`, `#4613`, `#3568` dossier/matrix rows.                                                                                  | No broad GitHub search; no issue claim promoted.         | none        | none       |
|   3 | Issue-ledger pass                                       | complete | Read live ledger, fork dossier, issue coverage matrix, requirements/package impact.                                                             | Added issue accounting matrix.                           | none        | none       |
|   4 | Intent/boundary and decision brief                      | complete | Explicit no-backward-compat and no implementation-from-slate-ralplan boundaries.                                                                | Added intent table and options comparison.               | none        | none       |
|   5 | Research/ecosystem synthesis                            | complete | Reused compiled Lexical/ProseMirror/Tiptap/Plate evidence already matching this surface.                                                        | Added full coverage ecosystem table.                     | none        | none       |
|   6 | Performance/DX/migration/regression/simplicity pressure | complete | Keyed O(handler-count) design; no global scan; no engine-control hooks.                                                                         | Added regression proof matrix.                           | none        | none       |
|   7 | Slate maintainer objection ledger                       | complete | Added objections for full coverage, engine exclusions, command helper exports, and `#3557` claim discipline.                                    | Accepted all with `keep`.                                | none        | none       |
|   8 | High-risk deliberate mode                               | complete | Public API and extension substrate change marked high-risk.                                                                                     | Added proof matrix and no-middleware parity requirement. | none        | none       |
|   9 | Ecosystem maintainer pass                               | complete | Plate gets primitive transform substrate; slate-yjs keeps deterministic operation/commit proof through no-middleware parity.                    | No adapter compatibility promise.                        | none        | none       |
|  10 | Revision pass                                           | complete | Revised previous two-key target to full coverage with explicit exclusions.                                                                      | PR reference updated.                                    | none        | none       |
|  11 | Issue sync accounting pass                              | complete | Coverage matrix unchanged; PR reference Section 6.2 updated to current two-key implementation plus required full target.                        | No fixed/improved claim changed.                         | none        | none       |
|  12 | Closure score and final gates                           | complete | Planning artifacts updated; no Slate v2 implementation edited.                                                                                  | Ready for Ralph execution.                               | none        | Ralph      |

### Scorecard

| Dimension                                                | Score | Evidence                                                                                                                 |
| -------------------------------------------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------ |
| React 19.2 runtime performance                           |  0.93 | Model behavior stays in Slate transforms/commands; React props are not expanded.                                         |
| Slate-close unopinionated DX                             |  0.97 | Full transform names match Slate's old override vocabulary without monkeypatching.                                       |
| Plate and slate-yjs migration-backbone shape             |  0.94 | Plate builds on primitive transform substrate; slate-yjs keeps operation/commit parity requirements.                     |
| Regression-proof testing strategy                        |  0.94 | Requires type coverage, runtime invocation, no-middleware parity, family tests, browser examples, and broad `bun check`. |
| Research evidence completeness                           |  0.93 | Lexical/ProseMirror/Tiptap/Plate evidence all maps to command substrate plus extension DX.                               |
| shadcn-style composability and hook/component minimalism |  0.94 | No aliases, no product input-rule family in raw Slate, no root command helper public DX.                                 |

Weighted total: `0.94`.

### Implementation Phases For Ralph

1. Type coverage RED:
   - Add a public type/source contract proving current map misses accepted
     transform keys.
   - Expected RED: keys beyond `deleteBackward` / `insertText` missing.
2. Runtime bridge refactor:
   - Add `EditorTransformMiddlewareArgs`.
   - Add `EditorPublicTransformMiddlewareKey`.
   - Replace bespoke branches in `core/editor-extension.ts` with keyed
     registration.
3. Command/default coverage:
   - Add command routes or private `applyX` helpers for every accepted key.
   - Preserve no-middleware operation output.
4. Family tests:
   - Marks, text/delete, break/fragment, nodes, selection.
   - Include `next()`, `next(overrides)`, handled-without-next, double-next.
5. Example/docs sync:
   - Keep examples on transform middleware where model-owned.
   - Do not add `editableInputRules` or extension `commands` docs.
6. Verification:
   - Run all gates in the regression matrix.
   - Promote issue claims only after exact proof.

### Fast Driver Gates

- cwd `.tmp/slate-v2`: `bun test ./packages/slate/test/extension-methods-contract.ts --test-name-pattern "transform middleware"`
- cwd `.tmp/slate-v2`: `bun test ./packages/slate/test/transaction-contract.ts --test-name-pattern "routes delete commands|stores command handlers|registers typed internal command definitions"`
- cwd `.tmp/slate-v2`: package tests covering the new transform middleware family matrix.
- cwd `.tmp/slate-v2`: `bun --filter slate typecheck`
- cwd `.tmp/slate-v2`: `bun --filter slate-react test:vitest -- editable-behavior surface-contract keyboard-input-strategy-contract`
- cwd `.tmp/slate-v2`: `bun x tsc --project site/tsconfig.json --noEmit`
- cwd `.tmp/slate-v2`: relevant Playwright example rows for checklist, markdown-shortcuts, inlines, richtext, paste-html/images if affected.
- cwd `.tmp/slate-v2`: `bun check`
- cwd `plate-2`: `pnpm lint:fix`
- cwd `plate-2`: `node tooling/scripts/completion-check.mjs`

### Full Coverage Done Handoff

- Public API: `EditorTransformMiddlewareMap` two-key shape -> type-driven full
  mutating transform coverage; status `revise`; before
  `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:641-656`.
- Exclusions: `bookmark`, `normalize`, `setNormalizing`,
  `withoutNormalizing`; status `cut` from middleware; proof
  `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:508-618`.
- Command substrate: keep internal command middleware; status `keep`; proof
  `.tmp/slate-v2/packages/slate/src/core/command-registry.ts:69-120`.
- Root command exports: keep absent; status `cut`; proof
  `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts:381-398`.
- Legacy extension `methods` and public `commands`: keep rejected; status
  `cut`; proof
  `.tmp/slate-v2/packages/slate/test/extension-methods-contract.ts:15-71`.
- Runtime bridge: bespoke two-key registration -> table-driven registration;
  status `revise`; before
  `.tmp/slate-v2/packages/slate/src/core/editor-extension.ts:297-370`.
- Drift guard: manual map -> key equality contract against accepted transform
  set; status `add`.
- Mark middleware: add `addMark`, `removeMark`, `toggleMark`; status `add`.
- Text/delete middleware: add/keep `delete`, `deleteBackward`,
  `deleteForward`, `deleteFragment`, `insertText`; status `add`.
- Break/fragment middleware: add `insertBreak`, `insertSoftBreak`,
  `insertFragment`; status `add`.
- Node middleware: add `insertNode`, `insertNodes`, `liftNodes`, `mergeNodes`,
  `moveNodes`, `removeNodes`, `setNodes`, `splitNodes`, `unsetNodes`,
  `unwrapNodes`, `wrapNodes`; status `add`.
- Selection middleware: add `collapse`, `deselect`, `move`, `select`,
  `setPoint`, `setSelection`; status `add`.
- Plate boundary: keep rich semantic input rules in Plate; status `keep`.
- `editableInputRules`: keep cut; status `cut`.
- Issue `#3557`: stay Related until insert-node/fragment proof lands; candidate
  `Improves` after Ralph proof; status `gate`.
- Issue `#5050`: stay Related; transform middleware is adjacent but not exact
  browser/input repro proof; status `gate`.
- Issue `#4613`: existing Improves unchanged; clipboard data intake stays
  `slate-dom` capability, not transform middleware; status `keep`.
- Issue `#3568`: stay Related; mark middleware is adjacent but native
  beforeinput crash closure needs focused runtime proof; status `gate`.
- Verification: require type coverage, runtime invocation, no-middleware parity,
  focused Slate tests, Slate React tests, site typecheck, browser examples, and
  `bun check`; status `gate`.

Final decision: the API must not stay as the two-key map. Full hard-cut
coverage is the right Slate v2 shape, with explicit engine-control exclusions
and no backward-compat shims.

## Ralph Full Coverage Execution Start - 2026-05-16

Status: `pending`

Goal:

- Implement full hard-cut transform middleware coverage in `.tmp/slate-v2`, with
  every public mutating transform except engine controls available through
  `extension.transforms`, no backward-compat shims, preserved no-middleware
  behavior, synced reference docs, and passing focused plus broad gates.

Continuation prompt:

- `active goal state`

Current pass:

- `tdd-pass`
- Owner: `.tmp/slate-v2/packages/slate` extension runtime and type surface.
- Scope: add failing type/runtime coverage for transform middleware keys beyond
  `deleteBackward` and `insertText`, then implement the full keyed bridge.

First runnable slice:

- Add a failing coverage test proving a non-current transform key, starting with
  `insertFragment` or `insertNode`, is missing from transform middleware.
- Add a type/key coverage contract for the accepted key set and engine-control
  exclusions.
- Confirm RED before implementation.

## Ralph Full Coverage Execution Progress - 2026-05-16

Status: `pending`

TDD pass:

- Public behavior: `extension.transforms` covers every public mutating transform
  except `bookmark`, `normalize`, `setNormalizing`, and `withoutNormalizing`.
- RED runtime command: cwd `.tmp/slate-v2`, `bun test ./packages/slate/test/extension-methods-contract.ts --test-name-pattern "transform middleware"`.
- RED runtime failure: `addMark` defaulted without calling transform middleware;
  spy saw `[]` instead of `["addMark"]`.
- RED type command: cwd `.tmp/slate-v2`, `bun --filter slate typecheck`.
- RED type failure: root `slate` export lacked
  `EditorPublicTransformMiddlewareKey`.
- GREEN implementation: added `EditorPublicTransformMiddlewareKey`,
  `EditorTransformMiddlewareArgs`, full `EditorTransformMiddlewareMap`,
  keyed internal transform middleware registration, transform default-depth
  guarding, and full key drift tests.
- Node override proof: `insertNode` middleware can `next({ node, options })`
  with overridden args.
- Double-next proof: transform middleware throws on a second `next()` call.
- No issue claim promoted. `#3557` stays related because the package proof
  covers the extension pressure, not the exact upstream repro closure.

Verification so far:

- cwd `.tmp/slate-v2`, `bun test ./packages/slate/test/extension-methods-contract.ts --test-name-pattern "transform middleware"`: pass, `5` tests.
- cwd `.tmp/slate-v2`, `bun test ./packages/slate/test/extension-methods-contract.ts`: pass, `12` tests.
- cwd `.tmp/slate-v2`, `bun test ./packages/slate/test/public-surface-contract.ts ./packages/slate/test/generic-extension-namespace-contract.ts`: pass, `361` tests.
- cwd `.tmp/slate-v2`, `bun test ./packages/slate/test/transforms-contract.ts`: pass, `15` tests.
- cwd `.tmp/slate-v2`, `bun test ./packages/slate/test/transaction-contract.ts --test-name-pattern "routes delete commands|stores command handlers|registers typed internal command definitions"`: pass, `3` tests.
- cwd `.tmp/slate-v2`, `bun --filter slate typecheck`: pass.
- cwd `.tmp/slate-v2`, `bun lint:fix`: pass; Biome fixed formatting in touched files.

Changed Slate v2 files:

- `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts`
- `.tmp/slate-v2/packages/slate/src/core/editor-extension.ts`
- `.tmp/slate-v2/packages/slate/src/core/transform-middleware.ts`
- `.tmp/slate-v2/packages/slate/src/create-editor.ts`
- `.tmp/slate-v2/packages/slate/src/index.ts`
- `.tmp/slate-v2/packages/slate/test/extension-methods-contract.ts`
- `.tmp/slate-v2/packages/slate/test/generic-extension-namespace-contract.ts`
- `.tmp/slate-v2/.changeset/full-transform-middleware.md`

Reference sync:

- Updated `docs/slate-v2/references/pr-description.md` Section `6.2` from the
  stale two-key implementation wording to the full transform middleware shape.

Next pass:

- Run focused gates after lint rewrite, then `diff-review-pass` and
  `verification-sweep-pass`.

Diff review:

- Status: `complete`.
- Finding fixed: initial implementation widened `setNodes` middleware props to
  plain `Node` to satisfy an internal default call. That weakened custom-value
  inference. Public args now use `NodeIn<V>` again; only the internal default
  call casts through erased runtime types.
- P0/P1 findings after fix: none.
- P2 findings after fix: none.
- Accepted risk: transform middleware commits with installed transform handlers
  use keyed `transform:<key>` command context; no-middleware command metadata is
  preserved by the no-handler fast path and existing command tests.

## Done Handoff

Status: `done`

Implemented in `.tmp/slate-v2`:

- Full `extension.transforms` coverage for every public mutating
  `EditorTransformApi` key except `bookmark`, `normalize`, `setNormalizing`,
  and `withoutNormalizing`.
- Public types: `EditorPublicTransformMiddlewareKey`,
  `EditorTransformMiddlewareArgs`, and full `EditorTransformMiddlewareMap`.
- Runtime bridge: keyed transform middleware registration through internal
  command storage plus transform-registry default forwarding.
- Default guard: internal transform aliases do not accidentally double-fire
  public transform middleware while defaulting.
- `insertNode` static API now forwards `options` to the transform registry.
- Changeset: `.tmp/slate-v2/.changeset/full-transform-middleware.md`.

Proof:

- cwd `.tmp/slate-v2`, `bun test ./packages/slate/test/extension-methods-contract.ts --test-name-pattern "transform middleware"`: pass, `5` tests.
- cwd `.tmp/slate-v2`, `bun test ./packages/slate/test/extension-methods-contract.ts`: pass, `12` tests.
- cwd `.tmp/slate-v2`, `bun test ./packages/slate/test/public-surface-contract.ts ./packages/slate/test/generic-extension-namespace-contract.ts`: pass, `361` tests.
- cwd `.tmp/slate-v2`, `bun test ./packages/slate/test/transforms-contract.ts`: pass, `15` tests.
- cwd `.tmp/slate-v2`, `bun test ./packages/slate/test/transaction-contract.ts --test-name-pattern "routes delete commands|stores command handlers|registers typed internal command definitions"`: pass, `3` tests.
- cwd `.tmp/slate-v2`, `bun --filter slate typecheck`: pass.
- cwd `.tmp/slate-v2`, `bun lint:fix`: pass.
- cwd `.tmp/slate-v2`, `bun check`: pass.
- cwd `plate-2`, `pnpm lint:fix`: pass.
- cwd `plate-2`, `node tooling/scripts/completion-check.mjs`: pass.
- Knowledge capture: added
  `docs/solutions/developer-experience/2026-05-16-slate-transform-middleware-defaults-need-alias-depth-guard.md`.

Reference and issue state:

- Updated `docs/slate-v2/references/pr-description.md` Section `6.2` to the full
  transform middleware shape.
- No fixed/improved issue claim promoted. `#3557` remains related: the package
  proof covers insert-node/fragment extension pressure, not the exact upstream
  repro closure.
- Browser/example verification skipped because this Ralph execution did not
  change browser, React, or example files.

## Full Editor Method Override Coverage Ralplan - 2026-05-16

Status: `done`

### Current Verdict

The user is right. Full transform middleware is necessary, but it is not full
legacy override coverage. Old Slate made core methods overrideable across
transforms, pure queries, refs, schema predicates, normalization, operation
application, and change notification. A transform-only answer covers writes and
misses a large part of the old `withX(editor)` power.

Hard target: every legacy-overridable editor method must have one of three
states:

- first-class v2 extension surface;
- intentionally replaced by a safer v2 surface;
- explicitly cut as engine/snapshot/lifecycle control with proof.

Anything else is a regression hiding behind nicer type names.

### Live Source Evidence

| Surface                      | Source                                                                                                                       | Current shape                                                                                                                                                                                                                                                                   | Verdict                                                                                |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Legacy overrideable methods  | `../slate/packages/slate/src/interfaces/editor.ts:49-179`                                                                    | Old `BaseEditor` grouped overrideable core methods, transforms, and queries, including `getDirtyPaths`, `getFragment`, schema predicates, `normalizeNode`, `shouldNormalize`, all transform families, `node`, `nodes`, `pathRef`, `pointRef`, `rangeRef`, `string`, and `void`. | Transform-only coverage is incomplete.                                                 |
| Legacy default editor object | `../slate/packages/slate/src/create-editor.ts:97-125`                                                                        | The default editor instance installed functions directly on the editor object.                                                                                                                                                                                                  | Plugin authors could monkeypatch method slots.                                         |
| V2 base editor               | `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:490-500`                                                              | Public editor object only has `read`, `subscribe`, `update`, and `extend`.                                                                                                                                                                                                      | V2 intentionally removed direct method monkeypatch slots.                              |
| V2 transform middleware      | `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:508-782`                                                              | `extension.transforms` now covers mutating transform keys and excludes `bookmark`, `normalize`, `setNormalizing`, and `withoutNormalizing`.                                                                                                                                     | Keep for writes only.                                                                  |
| V2 extension slots           | `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:1046-1081`                                                            | Extensions can register `editor`, `state`, `tx`, `elements`, `normalizers`, `operationMiddlewares`, `commitListeners`, and `transforms`.                                                                                                                                        | Missing slot: first-class pure query middleware.                                       |
| Static read/query API        | `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:1294-1885`                                                            | `EditorStaticApi` still exposes many public read/query methods.                                                                                                                                                                                                                 | These need classification, not accidental omission.                                    |
| Internal query runtime       | `.tmp/slate-v2/packages/slate/src/core/editor-runtime.ts:49-91`                                                              | Query runtime owns structural reads like `above`, `after`, `before`, `levels`, `positions`, `string`, `void`, and `shouldMergeNodesRemovePrevNode`.                                                                                                                             | This is the right substrate for query middleware.                                      |
| State read view              | `.tmp/slate-v2/packages/slate/src/core/public-state.ts:955-1105`                                                             | `editor.read` exposes grouped read APIs: `fragment`, `marks`, `nodes`, `points`, `ranges`, `runtime`, `schema`, `selection`, `text`, and `value`.                                                                                                                               | Full read coverage must account for grouped state methods, not only static `Editor.*`. |
| State-to-runtime bypasses    | `.tmp/slate-v2/packages/slate/src/core/public-state.ts:965-1041`                                                             | Some state reads call runtime, while `nodes.children`, `nodes.get`, `nodes.entries`, `nodes.find`, `nodes.some`, and `nodes.toArray` call direct helpers.                                                                                                                       | A query plan must route or explicitly exclude these.                                   |
| Schema predicates            | `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:348-438`, `.tmp/slate-v2/packages/slate/src/create-editor.ts:222-338` | Element specs own `inline`, `void`, `markableVoid`, `readOnly`, `selectable`, `keyboardSelectable`, and related behavior.                                                                                                                                                       | Old predicate overrides map to `elements` / `schema.define`, not query middleware.     |
| Transaction write view       | `.tmp/slate-v2/packages/slate/src/core/public-state.ts:1127-1219`                                                            | `tx` write APIs delegate to the transform registry.                                                                                                                                                                                                                             | Write overrides remain covered by `extension.transforms`.                              |

### Intent Boundary

| Field                | Decision                                                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent               | Close the no-regression hole by classifying every editor method family, including read methods.                                                                                 |
| Desired outcome      | A Ralph pass can implement full method-family extension coverage without reviving monkeypatching or dumping reads into transforms.                                              |
| In scope             | Pure read/query middleware, schema predicate replacement, normalizer hardening, operation/change hooks, refs/snapshot/lifecycle exclusions, PR reference sync, and proof gates. |
| Non-goals            | Backward-compatible method monkeypatching, restored legacy `methods`, public command slots, or making engine internals overrideable because old Slate technically allowed it.   |
| Decision boundary    | Capability parity matters; exact method-slot parity does not. V2 may replace unsafe old override points with safer extension slots.                                             |
| User decision needed | None. The goal is explicit: absolute best no-regression architecture with full coverage.                                                                                        |

### Decision Brief

Principles:

- Do not overload `transforms`. Writes and reads need different contracts.
- Preserve Slate-close override ergonomics through extension slots, not method
  monkeypatching.
- Schema predicates are declarative policy, not ad hoc read hooks.
- Snapshot, ref, and lifecycle controls are engine-owned unless there is a real
  behavior-extension use case.
- No silent gaps. If a method is not overrideable, say why.

Options:

| Option                                                           | Pros                                              | Cons                                                                                                      | Verdict                             |
| ---------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Keep transform middleware only                                   | Already implemented and green for writes.         | Misses old overrideable queries, schema predicates, normalization, refs, and lifecycle hooks.             | Reject. Incomplete.                 |
| Put read methods under `transforms`                              | One extension slot.                               | Category error; read handlers return values, can be hot, and must be pure.                                | Reject. Dirty API.                  |
| Restore monkeypatchable editor methods                           | Maximum legacy familiarity.                       | Reopens stale reads, unstable mutation ordering, and hard-to-type editor objects.                         | Reject. This is what v2 is cutting. |
| Add grouped `extension.queries` plus classify every other family | Full coverage with separate read/write contracts. | Requires a new query registry and tests.                                                                  | Choose.                             |
| Add only schema declarations and no query middleware             | Covers common `isVoid` / `isInline` cases.        | Still leaves structural reads like `nodes`, `string`, `positions`, and `void` without an extension story. | Reject as incomplete.               |

### Method-Family Coverage Map

| Method family                | Legacy examples                                                                                     | V2 target                                                                                                   | Verdict          |
| ---------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------- |
| Mutating transforms          | `insertText`, `deleteBackward`, `insertNode`, `setNodes`, `select`                                  | `extension.transforms` with keyed `next()` and full accepted key set.                                       | keep implemented |
| Pure structural reads        | `above`, `node`, `nodes`, `path`, `point`, `positions`, `string`, `void`                            | Add grouped `extension.queries`; static and `editor.read` paths route through it.                           | add              |
| Schema predicates            | `isInline`, `isVoid`, `markableVoid`, `isSelectable`, `isElementReadOnly`                           | `elements` / `schema.define` with `EditorElementSpec.match` for dynamic cases.                              | keep replacement |
| Normalization                | `normalizeNode`, `shouldNormalize`                                                                  | Make `normalizers` typed, ordered, and `next()` based; keep engine `normalize` out of transform middleware. | harden           |
| Operation application        | `apply`                                                                                             | Existing `operationMiddlewares` with operation parity tests.                                                | keep             |
| Change notification          | `onChange`                                                                                          | Existing `commitListeners` / `subscribeSource`, with docs and tests proving extension cleanup.              | keep             |
| Extension-owned groups       | custom helper methods                                                                               | Existing `editor`, `state`, and `tx` groups.                                                                | keep             |
| Refs                         | `pathRef`, `pathRefs`, `pointRef`, `rangeRef`                                                       | Public APIs stay, but no extension override slot. Ref tracking is engine state.                             | cut override     |
| Snapshot/runtime observation | `getFragment`, `getDirtyPaths`, `getOperations`, `getSnapshot`, runtime ids                         | Split: behavior reads go through `queries`; raw snapshot/runtime access stays engine observation.           | classify         |
| Lifecycle controls           | `read`, `update`, `subscribe`, `extend`, `replace`, `reset`, `setNormalizing`, `withoutNormalizing` | No middleware. These are execution/lifecycle controls.                                                      | cut override     |
| Low-level registration       | `registerCommand`, `registerCapability`, `registerNormalizer`, `registerCommitListener`             | Internal or advanced static APIs, not extension-overridable methods.                                        | keep controlled  |

### Public Query API Target

Add `extension.queries` as a grouped middleware map that mirrors the public read
view instead of inventing flat names like `nodesEntries`.

Target authoring shape:

```ts
editor.extend({
  name: "tables",
  queries: {
    nodes: {
      entries({ next, options }) {
        return next({
          options: { ...options, voids: true },
        });
      },
    },
    text: {
      string({ at, next, options }) {
        if (isTableSelection(editor, at)) return "";

        return next({ at, options });
      },
    },
  },
});
```

Target type shape:

```ts
type EditorQueryNext<TArgs extends object, TResult> = (
  overrides?: Partial<TArgs>,
) => TResult;

type EditorQueryMiddlewareContext<
  TEditor extends BaseEditor<any>,
  TArgs extends object,
  TResult,
> = TArgs & {
  editor: TEditor;
  next: EditorQueryNext<TArgs, TResult>;
};

type EditorPublicQueryGroups<V extends Value = Value> = Pick<
  EditorCoreStateView<V>,
  "fragment" | "marks" | "nodes" | "points" | "ranges" | "text"
>;

type EditorQueryMiddlewareMap<TEditor extends BaseEditor<any> = Editor> = {
  [G in keyof EditorPublicQueryGroups<ValueOf<TEditor>>]?: {
    [K in keyof EditorPublicQueryGroups<ValueOf<TEditor>>[G]]?: (
      context: EditorQueryMiddlewareContext<
        TEditor,
        EditorQueryMiddlewareArgs<ValueOf<TEditor>>[G][K],
        EditorQueryMiddlewareResult<ValueOf<TEditor>>[G][K]
      >,
    ) => EditorQueryMiddlewareResult<ValueOf<TEditor>>[G][K];
  };
};
```

Implementation can simplify the helper types, but the public shape must stay
grouped and must infer callback parameter types in examples.

Accepted query groups:

| Group      | Accepted methods                                                                                                                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fragment` | `get`                                                                                                                                                                                                             |
| `marks`    | `get`                                                                                                                                                                                                             |
| `nodes`    | `above`, `children`, `first`, `get`, `hasBlocks`, `hasInlines`, `hasPath`, `hasTexts`, `isBlock`, `isEmpty`, `last`, `leaf`, `levels`, `entries`, `find`, `some`, `toArray`, `next`, `parent`, `previous`, `void` |
| `points`   | `after`, `before`, `end`, `get`, `isEdge`, `isEnd`, `isStart`, `start`                                                                                                                                            |
| `ranges`   | `edges`, `get`, `project`, `unhang`                                                                                                                                                                               |
| `text`     | `string`                                                                                                                                                                                                          |

Explicit query exclusions:

| Group/key         | Reason                                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `ranges.bookmark` | Hidden op-rebased bookmark creation; belongs with refs/engine controls, not pure query middleware.                                    |
| `runtime.*`       | Runtime ids and snapshots are engine observation APIs.                                                                                |
| `selection.get`   | Selection freshness is runtime-owned; extension behavior should use query methods or `state` groups, not replace core selection read. |
| `schema.*`        | Covered by `elements` / `schema.define`; duplicating with query hooks creates two policy systems.                                     |
| `value.*`         | Raw value, operation queue, and commit access are snapshot/transaction facts.                                                         |

Query middleware contract:

- `next()` forwards current args unchanged.
- `next(overrides)` shallow-merges explicit overrides.
- Not calling `next()` means the middleware owns the returned value.
- Calling `next()` twice throws, including generator-returning queries.
- Query handlers must not open `editor.update`; tests must prove no operations
  are produced by query-only calls.
- No-handler path must call the existing direct runtime/helper functions with no
  extra allocation.
- Handler lookup must be keyed by group and method, never a global every-read
  scan.

### Schema Predicate Replacement

Do not add `queries.schema.isVoid` or `queries.nodes.isInline`. That would be
two competing policy systems.

Target shape:

```ts
editor.extend({
  name: "images",
  elements: [
    { type: "image", void: "block" },
    {
      match: (element) => element.type === "mention",
      type: "mention",
      void: "markable-inline",
    },
  ],
});
```

Coverage:

| Legacy method       | V2 replacement                                    |
| ------------------- | ------------------------------------------------- | -------- | ----------------- | --------------------- |
| `isInline`          | `elements: [{ inline: true, type }]`              |
| `isVoid`            | `elements: [{ type, void: 'block'                 | 'inline' | 'editable-island' | 'markable-inline' }]` |
| `markableVoid`      | `void: 'markable-inline'` or `markableVoid: true` |
| `isSelectable`      | `selectable: false` for non-selectable elements   |
| `isElementReadOnly` | `readOnly: true` or `match` based element specs   |
| `isBlock`           | Derived from schema inline policy                 |

### Normalizer / Apply / Change Coverage

The transform plan excluded `normalize` for the right reason, but the no-regress
story is incomplete unless normalizers are typed and tested.

Target:

- `normalizers` becomes a first-class typed ordered map, not `Record<string,
unknown>`.
- A normalizer handler receives `{ editor, entry, operation, explicit, force,
fallbackElement, next }`.
- `next()` delegates to the next normalizer and eventually the built-in
  normalizer.
- `shouldNormalize` remains engine policy unless a concrete extension use case
  proves a safe typed hook.
- `operationMiddlewares` is the v2 replacement for old `apply` overrides.
- `commitListeners` / `subscribeSource` replace old `onChange`.

### Regression Proof Matrix

| Surface                      | Required proof                                                                                                                                      |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Query key coverage           | Type/source contract proves every accepted `fragment`, `marks`, `nodes`, `points`, `ranges`, and `text` method has an args/result row.              |
| Query runtime invocation     | Package tests install middleware for `nodes.entries`, `nodes.get`, `points.start`, `ranges.unhang`, `text.string`, `fragment.get`, and `marks.get`. |
| Static and read parity       | `Editor.string(editor, at)` and `editor.read((state) => state.text.string(at))` both hit the same query middleware path where applicable.           |
| Direct helper bypass cleanup | Tests prove `nodes.children`, `nodes.get`, `nodes.entries`, `nodes.find`, `nodes.some`, and `nodes.toArray` no longer bypass query middleware.      |
| Generator safety             | `nodes.entries`, `nodes.levels`, and `points.positions` preserve generator behavior and throw on double `next()`.                                   |
| Purity                       | Query middleware does not emit operations and cannot run `editor.update` during a query.                                                            |
| Schema replacement           | Existing `schema-contract.ts` rows stay green; add one extension test proving old `isVoid` / `markableVoid` use cases map to `elements`.            |
| Normalizer replacement       | Add normalizer contract tests for ordering, `next()`, cleanup, and built-in fallback.                                                               |
| Apply/change replacement     | Add or keep tests proving `operationMiddlewares` and `commitListeners` install, run, cleanup, and do not change no-handler behavior.                |
| Ref/snapshot cuts            | Public surface contract proves no `extension.refs`, `extension.snapshot`, or lifecycle middleware slots are exported.                               |
| No-handler parity            | Existing query, delete, transform, snapshot, and migration-backbone contracts remain unchanged when no query middleware is installed.               |
| Broad closeout               | `bun --filter slate typecheck`, focused package tests, relevant `slate-react` tests only if React paths change, and `bun check`.                    |

### Issue Ledger Accounting

| Issue                      | Cluster                    | Claim                | Why                                                                                                                  | Proof route                                                                                             | PR line                |
| -------------------------- | -------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------- |
| `#3557`                    | extension-method-overrides | Related only         | Query middleware improves old method override pressure, but exact insert-node/fragment proof remains transform-side. | Keep existing insert-node/fragment tests; add query middleware tests before any broader override claim. | no claim promotion     |
| read/query legacy pressure | extension-method-overrides | Not claimed as fixed | This is architectural coverage, not a specific upstream issue closure.                                               | Add package query contracts first.                                                                      | PR reference non-claim |

No fixed or improved issue claim changes in this planning pass.

### Applicable Review Matrix

| Lens                          | Applies | Finding                                                                            | Plan delta                                                                             |
| ----------------------------- | ------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `intent-boundary-pass`        | applied | The original plan only covered model writes.                                       | Added full method-family boundary.                                                     |
| `steelman-pass`               | applied | Strongest objection is API growth and perf risk.                                   | Grouped query middleware, keyed lookup, no-handler fast path, and explicit exclusions. |
| `high-risk-deliberate-pass`   | applied | Public extension surface and read-path behavior are high-risk.                     | Added no-handler parity, purity, generator, and broad-gate requirements.               |
| `performance-oracle`          | applied | Read paths are hot; global middleware scans would be bad.                          | Require keyed group/method tables and no extra allocation with no handlers.            |
| `vercel-react-best-practices` | skipped | No React rendering, subscription, or browser surface change in this planning pass. | React gates only if Ralph touches `slate-react`.                                       |
| `tdd`                         | applied | This must start with failing contracts, not implementation confidence.             | Ralph begins with query key coverage and bypass tests.                                 |

### Slate Maintainer Objection Ledger

| Change                      | Likely objection                               | Steelman antithesis                            | Tradeoff                              | Answer                                                                                                             | Verdict  |
| --------------------------- | ---------------------------------------------- | ---------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------- |
| Add `extension.queries`     | "This recreates monkeypatchable read methods." | Schema specs and state groups might be enough. | More public API and tests.            | Old read override capability was real. Grouped query middleware preserves capability without mutable method slots. | keep     |
| Exclude schema from queries | "Users expect `isVoid` to be overrideable."    | Query hooks are flexible.                      | Declarative specs are less arbitrary. | `elements` is strictly better for element behavior because it is typed, composable, and shared by reads/writes.    | keep     |
| Exclude refs and snapshots  | "Old Slate let me override them."              | Full parity means every method.                | Harder migration for obscure code.    | Ref tracking and snapshots are engine invariants. Exposing them as middleware is how corruption gets normalized.   | keep cut |
| Type normalizers            | "This is separate from read methods."          | Existing placeholder can wait.                 | More work in same architecture lane.  | Old `normalizeNode` was overrideable. Leaving `normalizers: unknown` is not no-regression quality.                 | harden   |
| Keyed query registry        | "Overkill for a few examples."                 | Simpler direct callbacks are easier.           | More internals.                       | Read paths are hot and broad. A global query hook would be amateur hour.                                           | keep     |

### Pass Ledger

|   # | Pass                                                    | Status   | Evidence added                                                                                                                                                   | Plan delta                                                                 | Open issues | Next owner |
| --: | ------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ----------- | ---------- |
|   1 | Current-state read                                      | complete | Re-read legacy Slate `BaseEditor`, current v2 `BaseEditor`, static API, state read view, extension slots, query runtime, schema specs, and transform middleware. | Added full method-family verdict.                                          | none        | none       |
|   2 | Related issue discovery                                 | complete | Reused existing extension-method pressure rows; no new live GitHub read needed.                                                                                  | No issue claim promoted.                                                   | none        | none       |
|   3 | Issue-ledger pass                                       | complete | Recorded query/read coverage as architectural non-claim.                                                                                                         | PR reference gets a non-implemented follow-up note.                        | none        | none       |
|   4 | Intent/boundary and decision brief                      | complete | Defined capability parity over method-slot parity.                                                                                                               | Added accepted surfaces and explicit cuts.                                 | none        | none       |
|   5 | Research/ecosystem synthesis                            | complete | Reused compiled read/update runtime research and live Slate v2 source.                                                                                           | Query middleware follows v2 read/update discipline.                        | none        | none       |
|   6 | Performance/DX/migration/regression/simplicity pressure | complete | Added keyed lookup, no-handler fast path, generator safety, and purity gates.                                                                                    | Query hooks cannot be global before-every-read hooks.                      | none        | none       |
|   7 | Slate maintainer objection ledger                       | complete | Added objections for query surface, schema exclusion, refs/snapshot cuts, normalizer hardening, and perf.                                                        | All resolved with keep/cut verdicts.                                       | none        | none       |
|   8 | High-risk deliberate mode                               | complete | Public read API behavior marked high risk.                                                                                                                       | Added no-handler parity and broad closeout gates.                          | none        | none       |
|   9 | Ecosystem maintainer pass                               | complete | State/tx/query split keeps Slate v2 unopinionated and Plate-ready.                                                                                               | No Plate adapter promise.                                                  | none        | none       |
|  10 | Revision pass                                           | complete | Revised transform-only plan into full editor method coverage.                                                                                                    | Added query, schema, normalizer, operation/change, ref/snapshot decisions. | none        | none       |
|  11 | Reference sync pass                                     | complete | PR reference Section 6.2 now records query/read coverage as accepted follow-up, not implemented claim.                                                           | No issue ledger claim changes.                                             | none        | none       |
|  12 | Closure score and final gates                           | complete | Planning artifacts updated; no Slate v2 source edited from this skill.                                                                                           | Ready for Ralph execution.                                                 | none        | Ralph      |

### Scorecard

| Dimension                                                | Score | Evidence                                                                                                                                                                        |
| -------------------------------------------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance                           |  0.93 | Read hooks are pure Slate-core query middleware; React gates only apply if React code changes.                                                                                  |
| Slate-close unopinionated DX                             |  0.97 | `extension.transforms`, grouped `extension.queries`, `elements`, typed `normalizers`, operation/change hooks, and explicit cuts preserve old capability without monkeypatching. |
| Plate and slate-yjs migration-backbone shape             |  0.94 | Plate can build richer behavior on primitive transform/query surfaces; slate-yjs keeps operation and snapshot invariants untouched.                                             |
| Regression-proof testing strategy                        |  0.95 | Requires key coverage, runtime invocation, static/read parity, bypass cleanup, generator safety, purity, normalizer, operation/change, cut, and broad gates.                    |
| Research evidence completeness                           |  0.93 | Uses live v2 source plus compiled read/update runtime research; no unresolved external-system contradiction.                                                                    |
| shadcn-style composability and hook/component minimalism |  0.94 | Adds grouped extension APIs, not React props, product rule registries, or command-string public DX.                                                                             |

Weighted total: `0.94`.

### Ralph Full Method Coverage Execution Plan

1. Query coverage RED:
   - Add type/source contract for `EditorQueryMiddlewareMap`.
   - Add failing runtime tests proving `nodes.entries`, `text.string`, and
     `fragment.get` cannot be intercepted yet.
2. Query registry implementation:
   - Add grouped query middleware registration under `extension.queries`.
   - Route `EditorStaticApi`, `InternalEditorQueryRuntime`, and public state
     read methods through one keyed query dispatcher.
   - Fix direct helper bypasses in `state.nodes.children/get/entries/find/some/toArray`.
3. Schema proof:
   - Add or strengthen tests proving old `isVoid`, `isInline`,
     `markableVoid`, `isSelectable`, and `isElementReadOnly` cases map to
     `elements` / `schema.define`.
4. Normalizer hardening:
   - Replace `normalizers?: Record<string, unknown>` with typed normalizer
     middleware and tests for ordering, cleanup, `next()`, and fallback.
5. Operation/change proof:
   - Ensure `operationMiddlewares` and `commitListeners` cover old `apply` and
     `onChange` use cases.
6. Cut proof:
   - Add public surface tests proving no `extension.refs`, `extension.snapshot`,
     or lifecycle middleware slots.
7. Verification:
   - Run focused query/schema/normalizer/operation contracts, `bun --filter slate
typecheck`, and `bun check` from `.tmp/slate-v2`.
   - Run `slate-react` and browser rows only if React or example files change.

### Fast Driver Gates

- cwd `.tmp/slate-v2`: `bun test ./packages/slate/test/query-extension-contract.ts`
- cwd `.tmp/slate-v2`: `bun test ./packages/slate/test/schema-contract.ts`
- cwd `.tmp/slate-v2`: `bun test ./packages/slate/test/extension-methods-contract.ts --test-name-pattern "query middleware|normalizer|operation middleware|commit listener"`
- cwd `.tmp/slate-v2`: `bun test ./packages/slate/test/query-contract.ts`
- cwd `.tmp/slate-v2`: `bun test ./packages/slate/test/snapshot-contract.ts`
- cwd `.tmp/slate-v2`: `bun --filter slate typecheck`
- cwd `.tmp/slate-v2`: `bun check`
- cwd `plate-2`: `pnpm lint:fix`
- cwd `plate-2`: `COMPLETION_CHECK_ID=019e1fc0-dba0-7de1-9236-b484a144cda6 node tooling/scripts/completion-check.mjs`

## Done Handoff - Full Editor Method Override Coverage

Status: `done`

Decision:

- The transform-only plan is not enough. It covers writes, not all
  old-overridable editor behavior.
- Add grouped `extension.queries` for pure read methods.
- Keep `extension.transforms` for writes.
- Keep `elements` / `schema.define` as the replacement for old schema predicate
  overrides.
- Harden `normalizers` into a typed ordered middleware surface.
- Keep `operationMiddlewares` and `commitListeners` as the replacement for old
  `apply` and `onChange`.
- Cut refs, snapshots, runtime ids, lifecycle controls, and engine controls from
  extension override middleware.

Before/after shape:

```ts
// Old Slate mental model
const withTables = (editor: Editor) => {
  const { nodes, string } = editor;

  editor.nodes = (options) => nodes({ ...options, voids: true });
  editor.string = (at, options) =>
    isTableSelection(editor, at) ? "" : string(at, options);

  return editor;
};

// Slate v2 target
const withTables = <T extends Editor>(editor: T): T => {
  editor.extend({
    name: "tables",
    queries: {
      nodes: {
        entries({ next, options }) {
          return next({ options: { ...options, voids: true } });
        },
      },
      text: {
        string({ at, next, options }) {
          if (isTableSelection(editor, at)) return "";

          return next({ at, options });
        },
      },
    },
  });

  return editor;
};
```

Ralph next owner:

- Implement `extension.queries` in `.tmp/slate-v2/packages/slate`.
- Start with RED tests for query key coverage and state-read bypasses.
- Do not touch React/browser examples unless the implementation changes those
  paths.
- Do not promote issue claims until exact proof lands.

Verification for this Slate Ralplan pass:

- Planning/source read only; no Slate v2 implementation edited from
  `slate-ralplan`.
- Plate-2 artifact gates are listed in the completion file.

## Ralph Full Method Coverage Execution Progress - 2026-05-16

Status: `pending`

Current pass:

- `verification-sweep-pass`
- Owner: complete.
- Scope: full no-regression editor-method extension coverage.

TDD pass:

- Public behavior: extensions can register grouped pure-read middleware under
  `extension.queries`, and the first read paths invoke it without method
  monkeypatching.
- RED command: cwd `.tmp/slate-v2`,
  `bun test ./packages/slate/test/query-extension-contract.ts`.
- RED failure: `state.text.string([0])` returned `one` instead of `one!`,
  proving `extension.queries.text.string` was not on the read path.
- GREEN implementation: added public query middleware types, a query middleware
  registry, grouped query registration during extension install, and a keyed
  query dispatcher.
- First routed keys: `fragment.get`, `nodes.entries`, and `text.string`.
- Static/read parity proof: `Editor.string(editor, [1])` and
  `editor.read((state) => state.text.string([0]))` both hit
  `queries.text.string`.
- Implementation extension: routed the full accepted query set:
  `fragment.get`, `marks.get`, accepted `nodes.*`, accepted `points.*`,
  accepted `ranges.*`, and `text.string`.
- Static/read parity: `Editor.*` pure reads and `editor.read` grouped reads hit
  the same query keys for accepted methods, including `nodes.path`,
  `nodes.elementReadOnly`, `nodes.shouldMergeNodesRemovePrevNode`, and
  `points.positions`.
- Generator safety: query default-depth covers lazy generator iteration, so
  `nodes.entries`, `nodes.levels`, and `points.positions` do not double-fire
  nested middleware after `next()`.
- Purity: query middleware rejects `editor.update` and query-only calls emit no
  operations.
- Normalizers: replaced `normalizers?: Record<string, unknown>` with a typed
  ordered normalizer middleware map with `next(overrides)`, fallback delegation,
  cleanup, and double-next proof.
- Operation/change proof: existing `operationMiddlewares` and
  `commitListeners` remain the v2 replacement for old `apply` and `onChange`;
  the commit-listener ordering test now matches runtime truth
  (`commitListeners` before public subscribers).
- Cut proof: public-surface tests keep refs, raw snapshots, runtime ids,
  lifecycle controls, legacy `methods`, and public extension `commands` out of
  extension override middleware.
- No issue claim promoted.
- Reference docs: Section `6.2` updated to record full accepted v2 capability
  parity, not legacy method-slot monkeypatch compatibility.

Changed Slate v2 files:

- `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts`
- `.tmp/slate-v2/packages/slate/src/index.ts`
- `.tmp/slate-v2/packages/slate/src/core/extension-registry.ts`
- `.tmp/slate-v2/packages/slate/src/core/editor-extension.ts`
- `.tmp/slate-v2/packages/slate/src/core/query-middleware.ts`
- `.tmp/slate-v2/packages/slate/src/core/normalize-node.ts`
- `.tmp/slate-v2/packages/slate/src/core/public-state.ts`
- `.tmp/slate-v2/packages/slate/src/create-editor.ts`
- `.tmp/slate-v2/packages/slate/test/query-extension-contract.ts`
- `.tmp/slate-v2/packages/slate/test/normalization-contract.ts`
- `.tmp/slate-v2/packages/slate/test/apply-onchange-hard-cut-contract.ts`
- `docs/slate-v2/references/pr-description.md`
- `active goal state`
- `active goal state`

Verification:

- cwd `.tmp/slate-v2`,
  `bun test ./packages/slate/test/query-extension-contract.ts`: pass, `5`
  tests.
- cwd `.tmp/slate-v2`,
  `bun test ./packages/slate/test/normalization-contract.ts`: pass, `11`
  tests.
- cwd `.tmp/slate-v2`, `bun test ./packages/slate/test/query-contract.ts`: pass,
  `80` tests.
- cwd `.tmp/slate-v2`, `bun test ./packages/slate/test/snapshot-contract.ts`:
  pass, `201` tests.
- cwd `.tmp/slate-v2`,
  `bun test ./packages/slate/test/extension-methods-contract.ts`: pass, `12`
  tests.
- cwd `.tmp/slate-v2`, `bun --filter slate typecheck`: pass.
- cwd `.tmp/slate-v2`,
  `bun test ./packages/slate/test/schema-contract.ts`: pass, `9` tests.
- cwd `.tmp/slate-v2`,
  `bun test ./packages/slate/test/transaction-contract.ts --test-name-pattern
"operation middleware|commit listeners|normalizer|extension registry"`: pass,
  `4` tests.
- cwd `.tmp/slate-v2`,
  `bun test ./packages/slate/test/apply-onchange-hard-cut-contract.ts`: pass,
  `4` tests.
- cwd `.tmp/slate-v2`,
  `bun test ./packages/slate/test/public-field-hard-cut-contract.ts
./packages/slate/test/public-surface-contract.ts`: pass, `364` tests.
- cwd `.tmp/slate-v2`, `bun lint:fix`: pass after formatting; Biome checked
  `1622` files.
- cwd `.tmp/slate-v2`, `bun check`: pass; package typechecks, site/root
  typechecks, `1008` Bun tests passed with `95` skipped, and Slate React Vitest
  passed `267` tests across `26` files.

## Done Handoff - Full Editor Method Override Coverage Execution

Status: `done`

Decision:

- Keep the Slate v2 architecture hard cut: no legacy method monkeypatching, no
  public extension `commands`, no restored `methods`.
- Use first-class extension slots for capability parity:
  `extension.transforms` for writes, grouped `extension.queries` for pure reads,
  typed `normalizers` for `normalizeNode`, `operationMiddlewares` for old
  `apply`, and `commitListeners` / `subscribe` for old `onChange`.
- Keep schema predicates declarative through `elements` / `schema.define`.
- Keep refs, raw snapshots, runtime ids, lifecycle controls, and engine controls
  out of override middleware.

Implemented:

- Grouped query middleware registry, dispatcher, public types, and extension
  registration.
- Query routing for accepted state and static pure read methods, including
  `fragment.get`, `marks.get`, accepted `nodes.*`, accepted `points.*`,
  accepted `ranges.*`, and `text.string`.
- Static/read parity for `Editor.string`, `Editor.path`, `Editor.positions`,
  `Editor.elementReadOnly`, and `Editor.shouldMergeNodesRemovePrevNode`.
- Generator-safe default delegation and double-next protection.
- Query purity guard blocking `editor.update` inside query middleware.
- Typed ordered normalizer middleware with fallback override and cleanup proof.
- PR reference sync with no issue claim promotion.

Verification:

- `.tmp/slate-v2`: focused query, normalization, schema, snapshot,
  operation/change, public-surface, typecheck, lint, and `bun check` all pass.
- `plate-2`: planning/reference artifacts updated; run `pnpm lint:fix` and the
  scoped completion check after the completion file is set to `done`.
