---
review_scopes: [code]
review_basis: [2026-09-22-code-last-pass-ownership-gates]
work_kind: implementation
---

# Code commands and highlighter ownership

Status: Complete

Objective:
Implement the accepted code-block insertion, formatting, indentation and syntax
resource repairs, then prove changed package, copied UI and browser behavior.

Completion threshold:
Every accepted repair and caller is adopted with no old public alias; focused
package, registry, docs and browser proof passes; the immutable implementation
outcome is bound to the governing review and the decision is reconciled.

Verification surface:
The live code plugin, generated insertion owner, Plite text/replacement
transforms, copied UI, docs and relevant package/browser tests. Planning proof
is source inspection plus two narrow live-source command probes below. The
previous audit's observations are reused only while source matching.

Constraints:
Keep one newline-bearing Text, native/static rendering, optional CodeMirror,
and the narrow external-text slot. Plite owns canonical text, selection,
history and annotations. The user's September 22 "go" authorizes local
execution, not publication. No public
compatibility aliases, second formatter framework, shared code-command DSL or
new syntax cache.

Boundaries:
Plate owns code schema and commands; copied registry source owns the JSON
button, shared native/static Lowlight setup and UI presentation. Plite owns
canonical text edits, selection, anchors and history. Execution exposed one
Plite anchor-mapping defect for disjoint edits in one transaction; its source
owner was repaired and given a direct regression test. `replaceChildren`
still intentionally drops selection when replaced Text identity disappears.
Backend import restructuring is outside this plan pending measured value.
There is no persisted schema migration.

Blocked condition:
None. Execution is authorized by the user's latest "go".
If a focused execution test contradicts a chosen owner, update this same plan
before editing around the failed law.

## Decision and evidence

The governing [last-pass review](../plans/artifacts/2026-09-22-code-api-audit/last-pass.md)
retains one Text and the native/external split. Live
[`BaseCodeBlockPlugin.ts`](../../packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts)
has four repairable failures: `defaultType` creates a non-code block and then
retypes it; `format` is a package-owned JSON-only action that replaces its
Text; selected-line enumeration includes an unselected next line; and the
syntax reader mutates its supplied Lowlight registry. The prior observational
[probe](artifacts/2026-09-22-code-api-audit/probe.test.ts) demonstrates the
first, second and fourth failures plus the line-boundary defect. It is not a
passing-fix receipt.

The insertion hard cut is **not** deleting the code feature's insert/upsert
policy. [`applyBlockInsertion`](../../packages/platejs/src/internal/plugin/blockInsertion.ts)
is shared, but the code command defaults new-block selection to true and
matches an unlisted code block for upsert. Generated insertion in
[`resolvePlugins.ts`](../../packages/platejs/src/internal/plugin/resolvePlugins.ts)
uses `schema.create` and the same helper, yet its defaults and matching are
different. Keep the code-specific policy; delete its intermediate paragraph
construction and `defaultType` input. A direct live-source probe returned
`{language:'typescript', children:[{text:''}], type:'codeBlock'}` from
`editor.read.schema.create(BaseCodeBlockPlugin,{language:'typescript'})`.
That is the final node shape, with no retype phase.

The [formatter tests](../../packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.spec.tsx)
cover JSON output/invalid input but not selection or undo. A second live-source
probe replaced a whole JSON Text through `editor.update(tx =>
tx.text.insert(next,{at:range}))`: it kept one code Text and recorded one undo,
but moved the caret from offset 4 to the end. Therefore moving JSON policy to
the copied button is insufficient without explicit selection mapping. The
[`replaceChildren`](../../packages/plitejs/src/transforms-node/replace-children.ts)
source supports the prior owner diagnosis; do not redesign that primitive.

The current copied [code UI](../../apps/www/src/registry/components/editor/code-block.tsx)
is the sole production `format` caller, and the CodeMirror component uses its
container. The [English code docs](../../content/docs/(plugins)/(elements)/code-block.mdx)
teach `createLowlight(all)`; a [historical browser incident](../solutions/logic-errors/2026-04-17-code-block-browser-highlight-must-match-server-output.md)
shows Python hydration failure without the safe grammar. That receipt is dated,
but it establishes a real compatibility job. The package currently patches
Python during decoration reads, even when a caller supplied a custom grammar;
an alias already cached under that same object then becomes stale. Keep the
browser-safe grammar for the shipped native kit, but make registration explicit
at kit resource construction before any syntax read. The package reader must
only use the supplied highlighter. A custom Lowlight remains caller-owned and
must be configured before publication; replacing its instance, rather than
mutating it in place, is the supported reconfiguration path.

The historical Python grammar is adapted from Highlight.js 10.7.3, whose
local license is BSD-3-Clause. Moving or shipping that code in copied registry
source requires its source and binary notices; verify the applicable notice is
preserved before execution publishes generated registry output.

## Best API target

The public call remains on the code descriptor. The implemented signature and
example are typechecked:

```ts
import { CodeBlockPlugin } from 'platejs/react';

editor.plugin(CodeBlockPlugin).update.insert(
  { language: 'typescript' },
  { select: true }
);
```

`insert` and `upsert` accept only code construction input (currently optional
`language`) and existing location/selection options. The zero-input call and
`insert({}, {select:true})` remain meaningful; `defaultType` is deleted.
Implementation should derive the language field from the code schema where
inference permits, rather than introduce another public input type. Insert
constructs the final code element with `tx.schema.create(type, input)` and
passes it through the existing code-specific `applyBlockInsertion` policy.
Preserve `before`, `after`, exact `at`, expanded selection, empty replacement,
list exclusion and default selection. Upsert on an existing empty code block
must preserve its node identity and text; if `language` is supplied, apply that
property to the reused block in the same transaction. No generic insertion
rewrite or Plite API change is selected.

The JSON button remains an optional copied UI action. Delete package
`codeBlock.update.format` and its private `setContent`; add no formatter plugin
or public `setCode` command. On click, re-read the current block/path and
read-only state. Invalid JSON, missing block and identical output are no-ops.
For changed output, compute character-level edits with the existing
`diff-match-patch-ts` dependency. Apply those edits right to left through
Plite text operations, keeping equal spans and their annotations intact.
Apply all edits in one canonical editor update. The observed Plite anchor bug
was repaired at its source: exact canonical mapping takes precedence over
heuristic text-diff recovery when a retained point maps through unchanged
content. This is a local JSON-button policy, not a new public formatter
abstraction. Tests prove the annotated key's exact range, selection direction,
undo and redo.

For native indent/outdent, an expanded selection ending exactly at the next
line start excludes that untouched line. Collapsed selection and a selection
ending inside the next line keep their current meaning. The code feature owns
this range law; CodeMirror keeps its own local commands. No recipe DSL.

`CodeHighlightPlugin.initialState.lowlight` stays a read-only dependency from
the plugin's perspective. Delete `ensureStablePythonGrammar`, the package's
registry-method detection and its WeakSet. Put browser-safe Python registration
with `createLowlight(all)` in the copied native kit, before
`CodeHighlightPlugin.configure`. The package's exported highlighter contract
only needs highlight/query methods; remove the grammar type if no remaining
consumer imports it. The shipped kit must retain `python`, `py`, `gyp` and
`ipython` output with server/client parity. The standalone docs must show a
fully constructed resource, rather than implying a plugin silently repairs
arbitrary supplied grammars. Plain and CodeMirror-only installations still
omit native highlighting.

The maximum deletion cone is the intermediate-type insertion input and
retype, package JSON formatter, hidden grammar mutation plus its accidental
registry types, and any stale docs/tests for those surfaces. Retain
`CodeBlockPlugin`, `CodeHighlightPlugin`, Lowlight as a supplied resource, the
native decoration projection/cache and optional CodeMirror: each serves a
separate current job. A backend-free CodeMirror bundle is not asserted by
moving one control; its full composition still imports the native kit. Defer
that separate split until a production bundle/runtime comparison proves value.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Code insertion | `defaultType` paragraph then retype | Final schema-created code node, same feature policy, optional `language` input | Plate code plugin | Valid final shape without a public implementation type | Delete input; update tests/docs/slash if needed | Exact target, upsert identity, selection, history and list cases | Changed replace-empty behavior | rearchitect |
| JSON formatting | Package command replaces Text children | Copied JSON action, no-op guard and granular text edits in one transaction | Copied code UI, Plite text and anchor transforms | One app button does not earn package policy | Remove command and tests; repair exact Plite anchor mapping | No-op, changed, reverse selection, exact comment range, undo/redo, browser button | Annotation/selection drift | move |
| Native line selection | End at next line start indents extra line | Exclude untouched end line on expanded range | Plate code plugin | Native selected-line law | Keep public `tab`/`untab` | Forward/reverse, collapsed, blank last line, undo | Off-by-one at EOF | keep |
| Python grammar | Read mutates supplied Lowlight | Register safe grammar once before publishing copied-kit resource | Copied kit; package reads only | Caller owns parser customization; retain shipped SSR parity | Move grammar with BSD notice; remove package mutation/types; docs update | Alias/auto/custom resource, native/static hydration | SSR mismatch or stale alias cache | move |
| Backend import split | CodeMirror demo imports native kit | No change in this adoption | Later copied UI/Benchmark | One-control extraction cannot remove initialization | None now | Future production bundle and runtime comparison | Unproven value | defer |

## Execution slices and proof

| Slice | Owner and action | Entry | Exit and focused proof |
| --- | --- | --- | --- |
| 1. Code commands | Plate plugin: direct code construction and line boundary | Approved plan | Update existing `BaseCodeBlockPlugin.spec.tsx` with schema-valid insertion, empty reuse/identity, explicit locations, list case, selection/undo and endpoint examples; run `pnpm --filter platejs test:partition:standard-code-block` and source-first code partition typecheck. |
| 2. JSON button | Copied UI: remove package command, implement current-block JSON action | Slice 1 compiles | Focused copied-component test for no-op selection/key/history, changed one-undo mapping (including backward range), stale element/read-only, and comment/suggestion non-orphaning; run existing CodeMirror/native browser interaction rows on a source-matched server. |
| 3. Syntax ownership | Plate reader and copied native kit: move one-time Python setup, no mutation on read | Kit source identified | Package test with custom Lowlight spy proving zero registry writes; copied-resource tests for `python`, `py`, `gyp` and `ipython`; source-matched browser checks for initial Python hydration and mixed native/CodeMirror syntax. Preserve BSD notices. |
| 4. Adoption and closure | Docs, copied registry, packages and history | Earlier slices pass | Update English/Chinese docs and affected guide, build generated registry with `pnpm --filter www build:registry`, run source-first package/www typechecks, affected lint, focused package/browser checks and ledger `draft-execution`/`record`/`render`/`check`. Run `pnpm brl` if exported-folder membership or barrels change. Apply Best API doctrine repair and Plate Next version procedure for the public API break, then reconcile editor behavior law and decision progress. |

Execution must use the exact runner entrypoints before selecting a file. On
`next`, do not run Autoreview. A managed browser run must prove the served
source is current; the existing port-3000 server is not by itself evidence of
freshness. The app's Playwright config can reuse a server, so restart this
task's server or choose a fresh managed route before claiming browser parity.
Do not run managed Playwright commands in parallel.

The public break affects existing package consumers of `defaultType`,
`codeBlock.update.format`, and the exported grammar type, plus package tests,
copied registry source and docs. Search actual TypeScript/MDX sources for
these names, then delete old examples; do not preserve aliases. Generated
registry files come from `build:registry`, never hand edits. The code block's
persisted `{type:'codeBlock',children:[{text}],language?}` does not change, so
HTML/Markdown/clipboard codecs and saved documents need regression checks,
not a migration. The earlier CodeMirror adapter, external-text feedback,
native R4 and performance receipts remain historical context; this plan does
not reopen their architecture or claim fresh speed.

Three high-risk failure scenarios determine completion: (1) `upsert` or
explicit `at` inserts in a wrong place or loses selection; (2) JSON formatting
clears or reverses an unrelated selection, strands comment/suggestion anchors,
or produces two undo entries; (3) moving Python setup causes a browser/server
syntax difference, missing alias, or override of a caller's custom grammar.
Repair the owning slice and rerun its failed proof before proceeding.

## Scale and alternatives

No new repeated render-path cache, subscription, scheduler or parser is
introduced. JSON prettifying computes a character diff only on the explicit
button action and applies its edits in one transaction; no large-JSON timing
claim is made. Existing syntax decoration cache remains package-owned;
Python registration moves from a conditional read to one-time kit
construction. This plan makes no runtime or bundle-size claim. A future
backend split or parser replacement requires its own matched benchmark/bundle
receipt before adoption. This is a source-backed zero-new-runtime-owner
decision, not a claim that current syntax rendering is fast.

Rejected alternatives: generated insertion as a drop-in (different defaults
and reuse matching); a Plite `replaceChildren` change (its identity rule is
intentional); a generic formatter plugin/text-diff API (one JSON button does
not justify it); one code renderer or shared code-command recipes (native,
static and external jobs differ); silent highlighter patching at plugin init
(still overwrites caller grammar); moving only shared controls (the demo and
EditorKit still import the native module). These could be revisited only with
a new current user job or contradictory executable evidence.

## Planning acceptance

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt and authority | yes | User accepted the design plan and authorized local execution with “go”; no publication authority was requested. |
| Current owners and call sites | yes | Plugin, shared insertion, Plite replacement/text edit, copied UI, docs and tests cited above. |
| Best API target | yes | Keep feature policy; cut intermediate type, JSON package command and hidden grammar mutation. |
| Scale applicability | yes | No new repeated-unit owner; backend split deferred without a speed claim. |

Work Checklist:

- [x] Reconcile the last-pass review and relevant historical constraints.
- [x] Source and decide each touched public/API owner and the largest safe cut.
- [x] Resolve insertion, formatting, line-boundary and highlighter call shapes.
- [x] Name adoption, breaking changes, docs, copied registry and focused proof.
- [x] Distinguish design evidence from pending implementation/browser proof.
- [x] Record high-risk failures, scale applicability and one execution order.

Completion Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Binary design readiness | yes | Decision ledger and four vertical slices above. |
| Fresh source evidence | yes | Source reinspection and two narrow Bun probes reported above. |
| Public shape and adoption | yes | Proposed insert input and hard deletions; no aliases. |
| Scale gate | yes | No scale-sensitive target selected; backend split explicitly deferred. |
| Verification and handoff | yes | Source-grounded proof plan; no implementation result asserted. |
| Structured review | no | `next` forbids Autoreview, and this is planning, not a PR. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Review and live source | Decide |
| Decide | complete | API target and owner ledger | Handoff |
| Prove and hand off | complete | Two live probes and this proof contract | Execute after authorization; execution evidence follows |

Verification evidence:
`node tooling/scripts/review-ledger.mjs lookup code` identifies
`2026-09-22-code-last-pass-ownership-gates` as current and source matching.
The earlier audit ran 58 tests/142 assertions and two observational probes;
this plan did not rerun them. On current source, Bun evaluated
`schema.create(BaseCodeBlockPlugin,{language:'typescript'})` to one valid Text
and ran a range `tx.text.insert` formatting probe that produced one undo and
exposed the caret-at-end behavior. `check-complete.mjs` passed for the design
phase. It did not certify product behavior; the execution evidence below
supplies that proof.

Open risks:
No large-JSON, comparative performance or production-bundle claim is made.
The earlier default-demo Enter failure was traced to the demo's missing
`userId`; both full-EditorKit code demos now supply a demo identity. The
subsequent full six-row code browser run passes.

Execution state:
The user's September 22 "go" authorized implementation in the current `next`
checkout. Slices 1–4 are implemented and focused proof is recorded below. No
commit, push, PR, release or external message was requested.

Execution checklist:

- [x] Implement and verify code insertion/upsert and selected-line behavior.
- [x] Move JSON formatting to copied UI; prove selection, history and annotations.
- [x] Move Python grammar setup to copied kits; prove custom highlighter and initial Python browser hydration.
- [x] Update public teaching, generated registry, affected behavior law and package checks.
- [x] Record source-bound implementation outcome and reconcile the code decision.

Final outcome:
The accepted code-command and highlighter repairs are implemented in the
current checkout. The immutable execution record binds this plan and its
evidence to the governing review. A later source-bound follow-up record
supersedes the initial partial browser proof after the demo fixture repair.

Execution evidence (slice 1):
Direct schema construction replaced paragraph retyping; `defaultType` is gone
from the code command. `upsert({language})` updates a reused empty code block
in place. Expanded selections ending at a next-line start no longer indent or
outdent that line. `pnpm --filter platejs test:partition:standard-code-block`
passed 57 tests/157 assertions and
`pnpm --filter platejs typecheck:partition:standard-code-block` passed on this
checkout. The syntax test now asserts that the reader leaves the supplied
registry alone.

Execution evidence (slices 2–4):
The [implementation proof receipt](artifacts/2026-09-22-code-implementation-proof.md)
records the passing commands, selected browser rows and the initial adjacent
failure; the [final demo receipt](artifacts/2026-09-22-code-demo-final-proof.md)
records its repair and a full passing six-row code browser run.
The copied JSON action skips invalid, unchanged, stale and read-only targets;
character edits preserve one Text, backward selection, exact comment range,
and one-step undo/redo. The copied formatter and Python resource tests pass.
A direct Plite anchor regression in `authored-anchor-contract.test.ts` proves
disjoint edits in one update retain an unchanged range through undo/redo.
Plite core (1670 tests) and authored (413 tests) partitions and core typecheck
pass. The Plate code partition passes 57 tests/157 assertions and its
typecheck. The copied native and static kits share `createCodeBlockLowlight`;
Node alias checks pass for `python`, `py`, `gyp` and `ipython`. The package
reader makes no registry writes. The BSD notice is present in both generated
registry payloads. Browser checks pass for native/CodeMirror syntax and the
live JSON button (2 rows) plus initial Python hydration (1 row) on a restarted
source-matched port 3105 server. `pnpm --filter www typecheck` passes,
including API reference, registry, docs source parity and both TypeScript
projects. Plate Next v230 validates after source-rule and Vision repair and
skill regeneration. The normative code-block law and current evidence index
were reconciled.

Final browser and demo proof:
The small and huge code demos supply `userId: 'demo'` for the full `EditorKit`.
The huge interaction asserts the live `aria-readonly` state. All six rows in
`code-block-demos.spec.ts` and `code-block-views.spec.ts` pass together on the
source-matched server, including the 10,000-line typing, undo/redo, IME and
viewing-mode path. Registry generation, www typecheck, targeted lint and
`git diff --check` pass after these changes.
