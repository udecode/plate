# Slate v2 Editable Input Rule Ownership Ralplan

Date: 2026-05-13

Status: `done`

Owner: `slate-ralplan`

Completion:
`.tmp/019e1d28-b0cd-7482-9cf6-a76fa59cf620/completion-check.md`

## Current Verdict

`EditableInputRule` is the wrong public Slate v2 abstraction.

The old example-level `editor.deleteBackward = (...args) => { ... }` was ugly,
but it was at least a model command override. The current
`EditableInputRule` shape moved checklist behavior into the editor construction
path, which was the right instinct, but it overshot into a React/beforeinput
rule abstraction that belongs in Plate.

Accepted target:

- Slate core owns low-level command middleware for semantic editor commands.
- Slate React owns DOM `beforeinput` routing and app escape hatches such as
  `onDOMBeforeInput`.
- Plate owns semantic input-rule families, triggers, priorities, and feature
  rule factories.
- Checklist Backspace should be a core `delete` command middleware, not an
  `EditableInputRule`.

## Intent Boundary

| Field | Decision |
| --- | --- |
| Intent | Decide whether public `EditableInputRule` belongs in raw Slate v2 or should be cut in favor of a cleaner Slate/Plate ownership split. |
| Desired outcome | A Ralph pass can remove `EditableInputRule` as a public Slate React API, migrate examples to command middleware or DOM handlers, and leave Plate as the rich input-rule owner. |
| In scope | `EditableInputRule`, `editableInputRules`, extension capability wiring, checklist Backspace, markdown/inline typed shortcuts, docs/PR narrative, proof gates. |
| Non-goals | Implementing the cut in this Slate Ralplan pass; designing Plate's full input-rule API; changing browser beforeinput internals; claiming new issue fixes. |
| Decision boundary | Slate may expose low-level command middleware and typed built-in command tokens; Slate should not expose Plate-style semantic input-rule registries. |
| User decision needed | None. The current API is worse than the command substrate already available in live Slate v2. |

## Live Source Evidence

| Surface | Current owner | Current shape | Verdict |
| --- | --- | --- | --- |
| Public export | `../slate-v2/packages/slate-react/src/index.ts:12-21`, `:70-74` | Exports `EditableInputRule*` types and `editableInputRules` / capability key from `slate-react`. | Too public and too React/beforeinput-shaped for raw Slate model behavior. |
| Rule type | `../slate-v2/packages/slate-react/src/components/editable.tsx:186-199` | Context is `{ data, editor, event?, inputType: string, selection }`. | Browser event vocabulary leaks into model-command customization. |
| Capability helper | `../slate-v2/packages/slate-react/src/editable/editable-input-rules.ts:1-33` | Stores functions under a `slate-react.editable.inputRule` capability and merges prop rules plus extension rules. | Plate-style plugin rule registry hiding inside Slate React. |
| Runtime invocation | `../slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts:250-292` | Runs rules during editable runtime input handling, prevents default, then requests DOM repair. | Good low-level pipeline, bad public customization surface for delete semantics. |
| Checklist example | `../slate-v2/site/examples/ts/check-lists.tsx:96-145` | Checks `inputType === 'deleteContentBackward'`, passes `selection`, then mutates checklist nodes. | Wrong layer. Backspace behavior is a `delete` command policy, not a DOM input rule. |
| Markdown/inline examples | `../slate-v2/site/examples/ts/markdown-shortcuts.tsx:52-61`, `../slate-v2/site/examples/ts/inlines.tsx:82-96` | Use `EditableInputRule[]` for typed text shortcuts. | Better as `insert_text` command middleware or plain `onDOMBeforeInput` only when the behavior is truly browser-format specific. |
| Core command registry | `../slate-v2/packages/slate/src/core/command-registry.ts:36-92` | `registerCommand` installs priority-ordered middleware with `next`. | This is the right Slate substrate. |
| Delete command path | `../slate-v2/packages/slate/src/editor/delete-backward.ts:9-34` | `deleteBackward` dispatches a `delete` command before default deletion. | Checklist Backspace can hook this once and cover DOM, keydown fallback, Android route, browser handles, and programmatic calls. |
| Public static API | `../slate-v2/packages/slate/src/interfaces/editor.ts:1559-1567` | `Editor.registerCommand` is already public. | Missing piece is exported built-in command definitions/types, not `EditableInputRule`. |
| Plate input rules | `../plate/packages/core/src/lib/plugins/input-rules/internal/InputRulesPlugin.ts:1-169` | Plate has typed rule contexts, cached selection helpers, triggers, `enabled`, `resolve`, `apply`, priorities. | This is the rich input-rule layer; raw Slate should not duplicate it. |
| Plate rule resolution | `../plate/packages/core/src/internal/plugin/resolvePlugins.ts:351-433` | Resolves plugin-owned input rules by target/trigger/plugin/priority. | Confirms input-rule families are Plate product/plugin DX. |

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

| Option | Pros | Cons | Verdict |
| --- | --- | --- | --- |
| Keep `EditableInputRule` public | Already implemented; examples migrated away from `onKeyDown`. | Browser event vocabulary becomes Slate plugin API; does not naturally cover programmatic commands; duplicates Plate's lane. | Reject. |
| Move all input behavior to Plate | Clean Slate surface. | Raw Slate still needs a safe way to customize custom node commands without monkeypatching. | Reject as too hard a cut. |
| Keep Slate command middleware, move semantic input rules to Plate | Uses live command substrate; keeps raw Slate low-level; Plate keeps product-grade rule families. | Requires migrating examples and exporting built-in command tokens/types. | Choose. |
| Add a narrow `Editable.beforeInputHandlers` API only | Useful for browser-only cases. | Does not solve checklist/model command behavior. | Keep only as existing DOM handler escape hatch, not as rule registry. |

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

Expose built-in Slate command definitions and types so users do not hand-roll
string command names:

```ts
import { Editor, EditorCommands, defineEditorExtension } from 'slate'

const ChecklistsExtension = defineEditorExtension<ReactEditor<CustomValue>>({
  name: 'checklists',
  register({ editor }) {
    return {
      cleanup: Editor.registerCommand(
        editor,
        EditorCommands.delete,
        ({ command }, next) => {
          if (
            command.direction === 'backward' &&
            applyChecklistBackspaceStart(editor)
          ) {
            return { handled: true }
          }

          return next()
        }
      ),
    }
  },
})
```

`applyChecklistBackspaceStart` should read current selection from
`editor.read(...)`; it should not accept a DOM-derived `selection` parameter.

## Internal Runtime Target

- Keep the runtime beforeinput pipeline and DOM repair queue.
- Remove extension capability collection for editable input rules.
- Route native/model input to core commands where possible:
  - delete paths -> `EditorCommands.delete`
  - text insertion -> `EditorCommands.insertText`
  - break insertion -> `EditorCommands.insertBreak`
  - fragment/data insertion -> command route where already represented
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

| System | Source | Mechanism | Avoids | Steal | Reject | Slate target | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Lexical | `docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md` | Commands are prioritized listeners inside update/read lifecycle. | Event-specific app code that misses non-DOM command paths. | Prioritized command middleware with cleanup and extension registration. | Lexical class nodes and `$` helper style. | Export typed built-in command definitions and use `Editor.registerCommand`. | agree |
| ProseMirror | `docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md` | Commands receive state/dispatch while view owns DOM input details. | Mixing DOM event handling with semantic model mutation. | Keep DOM bridge in Slate React; model command behavior in Slate core. | ProseMirror plugin complexity and integer positions. | DOM `beforeinput` remains runtime-owned; app behavior hooks commands. | agree |
| Tiptap | `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md` | Extensions package commands, input rules, paste rules, editor props. | Scattered feature setup. | Extension packaging and command discoverability. | Making product input-rule families raw Slate's public API. | Slate: low-level commands; Plate: Tiptap-like input-rule DX. | partial |
| Plate | `../plate/packages/core/src/lib/plugins/input-rules/internal/InputRulesPlugin.ts` | Plugin-owned input rules with targets, triggers, resolve/apply, priority. | Boolean-key config and ad hoc example glue. | Product-grade rule family pattern for Plate. | Duplicating this in Slate React. | Plate owns semantic input rules; Slate owns primitive command substrate. | agree |

## Issue Ledger Accounting

ClawSweeper pass: skipped with reason `already covered by completed input-runtime/checklist ledger surfaces; this pass changes API ownership narrative and adds no fixed issue claim`.

Related rows read from durable ledgers:

| Issue | Cluster | Claim | Why | Proof route | V2 sync ledger | PR line |
| --- | --- | --- | --- | --- | --- | --- |
| #3384 | checklist/example | Related | Checklist example behavior is directly affected, but this plan changes API ownership and does not claim the original repro fixed. | `../slate-v2/playwright/integration/examples/check-lists.test.ts` after Ralph | unchanged | related matrix only |
| #4528 | checklist/browser-selection | Related | Checklist DOM structure/browser selection remains adjacent; command API ownership does not prove triple-click behavior. | browser selection row required if touched | unchanged | related matrix only |
| #3408 | delete-backward | Related | Delete command middleware may improve delete customization, but no exact empty-list/table repro is claimed. | package delete tests plus issue repro if claimed | unchanged | related matrix only |
| #3568 / #3586 | beforeinput-formatting | Related | Formatting via `onDOMBeforeInput` remains browser-specific; this plan does not claim those crash rows fixed. | exact browser proof if later claimed | unchanged | related matrix only |

No new `Fixes #...` line.

PR reference sync: unchanged in this pass because live implementation still
exports `EditableInputRule`. Ralph must replace PR section `6.2 React Editable
Extension Input Rules` after implementation.

## Regression Proof Matrix

| Contract | Must prove |
| --- | --- |
| Checklist Backspace | Backspace at start of checklist resets only the current checklist item to paragraph. |
| Command coverage | Same checklist behavior works through native beforeinput, keyboard fallback/browser handle, and `Editor.deleteBackward(editor)` or `tx.text.deleteBackward`. |
| Markdown shortcut | Space-triggered markdown shortcut still works after migration from `EditableInputRule`. |
| Inline URL shortcut | Typed URL wrapping still works, or is explicitly moved to a command/input example with no regression. |
| Browser format shortcuts | Hovering toolbar `formatBold` / `formatItalic` / `formatUnderline` remains a DOM beforeinput example. |
| Public surface | `slate-react` no longer exports `EditableInputRule*` or `editableInputRules`; generated surface tests prove no stale public export. |
| Plate boundary | Plate input-rule tests remain Plate-owned; Slate does not import Plate rule concepts. |

## Applicable Implementation-Skill Review Matrix

| Lens | Applicability | Finding | Plan delta |
| --- | --- | --- | --- |
| `vercel-react-best-practices` | applied | Moving semantic behavior out of React beforeinput callbacks reduces event-surface coupling and keeps React as projection/runtime bridge. | Use core command middleware for model behavior. |
| `performance-oracle` | applied | Command middleware is O(number of handlers for command), while Plate input rules can keep trigger-indexed dispatch for rich text triggers. | Do not install broad per-beforeinput rule scans in raw Slate. |
| `tdd` | applied | Public behavior must be tested through editor commands and browser rows, not by asserting a rule helper was called. | Add command-level and browser-level acceptance rows. |
| `build-web-apps:shadcn` | skipped | No UI chrome/component design. | None. |
| `react-useeffect` | skipped | No effect lifecycle. | None. |

## High-Risk Deliberate Mode

Trigger: public API cut plus example behavior migration.

Blast radius:

- `slate-react` public exports and docs;
- examples using `inputRules`;
- PR narrative;
- Plate migration story;
- browser input proof.

Pre-mortem:

1. Command middleware misses native beforeinput deletion because one runtime path bypasses `Editor.deleteBackward`.
2. Markdown/inline examples lose Android or composition behavior during migration.
3. Cutting public exports breaks consumers who copied the temporary API from v2 docs.

Proof plan:

- package command tests for delete and insert-text command middleware;
- `editable-behavior` contract proving no stale `editableInputRules` capability;
- surface contract proving exports are removed and built-in command definitions are exported;
- browser smoke for `/examples/check-lists`, `/examples/markdown-shortcuts`, and `/examples/inlines`;
- site typecheck and `slate-react` typecheck;
- PR reference update after implementation.

Rollback answer:

- If command middleware cannot cover all native paths, revise by routing those
  paths through commands. Do not restore `EditableInputRule` as public API.

## Maintainer Objection Ledger

| Change | Likely objection | Steelman antithesis | Tradeoff tension | Answer | Verdict |
| --- | --- | --- | --- | --- | --- |
| Cut `EditableInputRule` public API | "This just removed a convenient way to package input behavior." | The current helper is already implemented and avoids example `onKeyDown` glue. | Users who saw it must migrate. | It is convenient in the wrong layer: browser inputType strings are not model command API. Command middleware covers more paths and Plate owns the rich rule layer. | keep |
| Export built-in command definitions | "Command registry revival smells like old plugin magic." | Raw Slate can keep only `editor.update` and app callbacks. | More public core surface. | The registry already exists and delete/insert commands already dispatch through it; exporting typed definitions removes manual string/type hacks. | keep |
| Move rich input rules to Plate | "Raw Slate examples still need shortcuts." | `EditableInputRule` is small enough for examples. | Raw Slate examples need slightly more explicit command setup. | Raw Slate should show primitive command customization; Plate can show semantic `TaskListRules.markdown()` and trigger families. | keep |

## Scorecard

| Dimension | Score | Evidence |
| --- | ---: | --- |
| React 19.2 runtime performance | 0.93 | Command middleware keeps semantic work out of React event projection; Plate keeps trigger-indexed rich rules. |
| Slate-close unopinionated DX | 0.94 | Uses existing `Editor.registerCommand` substrate and cuts Plate-shaped rule registry from `slate-react`. |
| Plate and slate-yjs migration-backbone shape | 0.93 | Plate remains owner of rule families; Slate keeps deterministic command/tx substrate for collab and plugins. |
| Regression-proof testing strategy | 0.92 | Named command, export, typecheck, and browser rows for all touched examples. |
| Research evidence completeness | 0.93 | Live Slate v2 source, legacy Slate example, Plate input-rule implementation, and compiled Lexical/ProseMirror/Tiptap evidence read. |
| shadcn-style composability and hook/component minimalism | 0.92 | Removes public helper/types and replaces them with one command middleware lane plus existing DOM handlers. |

Weighted total: `0.93`.

Status: `done`.

## Implementation Phases For Ralph

1. Export typed built-in command definitions from `slate`, at least delete and insert-text.
2. Migrate checklist behavior from `EditableInputRule` capability to `Editor.registerCommand(..., EditorCommands.delete, ...)`.
3. Migrate markdown shortcut and inline URL typed insertion away from `EditableInputRule` to insert-text command middleware, or explicitly keep a DOM handler only where browser intent is the behavior.
4. Remove `EditableInputRule*`, `editableInputRules`, and `EDITABLE_INPUT_RULE_CAPABILITY` from public `slate-react`.
5. Remove runtime-root extension capability merging for editable input rules; keep DOM beforeinput routing and repair behavior.
6. Update docs and PR section `6.2` to the command-middleware ownership split.
7. Add/adjust tests before implementation:
   - command middleware handles checklist Backspace through core delete;
   - command middleware handles typed shortcuts through insert text;
   - public surface no longer exports editable input rule helpers;
   - examples typecheck without manual `EditableInputRule` / `Selection` annotations.

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
- Reclassified checklist Backspace as command middleware, not input rule.
- Kept Slate React DOM beforeinput escape hatches for browser-specific intents.
- Moved rich semantic input-rule family ownership to Plate.
- Added requirement to export typed built-in command definitions to avoid manual string/type hacks.
- Added browser and command proof rows for checklist, markdown shortcuts, and inline URL examples.

## Final Completion Gates

- Plan score reaches `0.93`.
- No new fixed issue claim is made.
- PR reference update is assigned to Ralph because live implementation still exposes the old public API.
- Implementation phases and driver gates are explicit.
- Slate Ralplan did not edit `../slate-v2` implementation.
