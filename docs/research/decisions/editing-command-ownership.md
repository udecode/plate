---
title: Editing rules and structural commands
type: decision
status: accepted
updated: 2026-09-23
review_scope: editing
current_review: 2026-09-23-editing-structural-rule-admission
reconciled_executions:
  - 2026-09-21-editing-command-input-rule-convergence-execution
  - 2026-09-22-editing-document-structure-execution
  - 2026-09-22-editing-document-structure-repair-execution
  - 2026-09-23-editing-structural-rule-admission-design-execution
  - 2026-09-23-editing-structural-rule-admission-implementation-execution
review_history:
  - ../review-records/2026-09-21-editing-command-and-structural-ownership.json
  - ../review-records/2026-09-21-editing-command-final-pass.json
  - ../review-records/2026-09-22-editing-document-structure.json
  - ../review-records/2026-09-22-editing-document-structure-post-implementation.json
  - ../review-records/2026-09-23-editing-structural-rule-admission.json
source_refs:
  - ../../../packages/platejs/src/lib/plugins/input-rules/InputRulesPlugin.ts
  - ../../../packages/platejs/src/lib/plugins/input-rules/defineInputRule.ts
  - ../../../packages/platejs/src/internal/plugin/resolvePlugins.ts
  - ../../../packages/platejs/src/internal/plugin/OverridePlugin.ts
  - ../../../packages/plitejs/src/core/command-registry.ts
related:
  - ../features/editing.md
  - plite-core-ownership.md
  - ../systems/editor-behavior-architecture.md
---

# Editing rules and structural commands

## Structural input-rule implementation

The [implementation plan](../../plans/2026-09-23-structural-input-rule-admission-implementation.md) and [execution record](../review-records/2026-09-23-editing-structural-rule-admission-implementation-execution.json) bind the source and observed proof. Plite structural commands report whether they staged a change; Plate's `decline()` discards the matched rule's candidate spec and delegates the original input, while `next()` composes its prefix. Heading, quote, generic block, list, code-fence and horizontal-rule shorthand use those outcomes. The shadow-document validator is gone. Source-mode Chromium autoformat and focused package tests pass. Proof remains partial because package-wide core lint has unrelated failures, the normal-size timing cohort is noisy, and quote/list lack matched old/new timings. The [design outcome](../review-records/2026-09-23-editing-structural-rule-admission-design-execution.json) remains the target-selection history, not implementation proof.

## Structural input-rule admission

The [September 23 review](../review-records/2026-09-23-editing-structural-rule-admission.json)
identified `canApplyBlockChanges` as a duplicate admission owner: it copied
ancestor arrays, substituted a guessed block and validated the entire document
before the real command. The accepted [design](../../plans/2026-09-23-structural-input-rule-admission.md)
replaced that path with one atomic accept-or-decline result from the actual
structural operation. The declarative rule system and Plite schema remain the
authorities for syntax and document validity, respectively.

## Required-prefix repair execution

The [repair execution](../review-records/2026-09-22-editing-document-structure-repair-execution.json)
closes the post-implementation audit's reproduced editing failures. Plite
preserves complete closed tables across selected and nested required content,
reconstructs deleted required slots, and keeps selection, history and remote
document-change replay coherent. Plate heading and quote input rules preserve
typed markers when the required title rejects conversion. The playground and
raw Plite forced-layout browser interactions pass on the final source. The
matched strict construction benchmark passes all eight prefix/plain cohorts;
whole-editor latency still includes length-dependent immutable publication.
The older unrelated schema-architecture equivalent-reconfiguration strict
ratio remains an explicit separate limit. The canonical schema owner and
public API direction are unchanged.

## Post-implementation reassessment

The [September 22 post-implementation audit](../../plans/artifacts/document-structure/post-implementation-audit.md)
retains the canonical Plite `schema.content.prefix` owner but reopens operational
acceptance. A selected-title closed table paste reports success while losing
the table; full-range deletion across required slots throws; the installed
heading markdown rule consumes `## ` when the forbidden H2 toggle declines.
Blockquote wrapping at the required title throws, and nested-prefix closed
block fitting also fails. The prior toolbar and collapsed-caret paste checks
did not cover these cases. The production locality/p95 claim remains unproven
by the current construction receipt, and the strict architecture gate is red.
The [new review](../review-records/2026-09-22-editing-document-structure-post-implementation.json)
records the bounded verdict and source/proof reconciliation. Product repair is
outside this read-only reassessment.

## Current document-structure decision

The [focused reassessment](../../plans/artifacts/editing-api-review/normalize-types-audit.md)
superseded only the recommendation to replace Normalize Types with app-owned
positional repair. The [implementation](../../plans/2026-09-22-document-structure-in-the-canonical-schema.md)
adopts `schema.content.prefix(required, rest)` in Plite's canonical schema.
The app declares its required title and body; the runtime owns validation,
construction, fitting and transactional enforcement. Both the Plate playground
and raw Plite demo use it. General corrections remain for custom semantic
behavior; all unrelated editing decisions below remain intact.

The [execution record](../review-records/2026-09-22-editing-document-structure-execution.json)
binds the source and observed proof. The new prefix compiler gate and strict
construction-locality gate pass. Proof remains **partial**: the older strict
equivalent-reconfiguration ratio is red, and one broad browser discussion-count
assertion fails even with the new playground schema disabled. The title H2
toolbar attempt and direct text paste pass in the live playground. No saved
document migration or publication is claimed.

## Execution reconciliation

The [local implementation](../../plans/2026-09-21-editing-command-and-input-rule-convergence.md)
adopts the September 21 review's narrower ownership direction. Input rules match
read-only against the command state and apply one accepted transaction. Ordinary
owner-bound `defineInputRule` functions preserve feature typing; exact
structural leaf policies, Plite insertion admission and mapped selection, and
complete-content utility policies own their respective decisions. Deleted
factory, family matcher and Normalize Types surfaces have no current callers.

The [execution record](../review-records/2026-09-21-editing-command-input-rule-convergence-execution.json)
binds the local source and proof. Its proof state is **partial** because full
shared-checkout CI has unrelated concurrent Plite React/lint failures and a
Turbo partition-cache assertion. Plate package tests, Plite core tests,
source-first types, website docs/registry types, the eight browser editing
cases and the production benchmark passed. No publication is claimed. The two
deferred representation and nested block-void questions remain separate.

## Historical review basis

The sections below preserve what the read-only review established before the
design and execution. Future-tense judgments there are historical, not a
description of the current implementation.

## Audit acceptance

- Account for all 33 source groups returned by `review-ledger lookup editing
  --detail`, including their distinct raw-editor, feature and copied-kit jobs.
- Trace public types, the canonical owners and actual consumers before judging
  deletion, consolidation, ownership or authoring changes.
- Reconcile the earlier command, input-rule and schema-default-reset decisions
  against current source; keep historical execution and current proof separate.
- Compare the strongest deletion/replacement alternative and give each semantic
  unit a verdict, including explicit exclusions and unresolved design/proof gates.
- Record one immutable review, reconcile this decision and validate the generated
  ledger. Product code, implementation planning and publication are outside scope.

## Verdict

**Pursue a narrower consolidation around canonical command and structural-change
owners.** Keep declarative input rules: they already compile into middleware
around Plite's `insertText`, `insertBreak` and `insertData` commands, and they
own real activation, ordering, trigger indexing and reusable feature-factory
jobs. Make each rule attempt atomic and align its consume, decline and continue
outcomes with the command contract. Cut the public executor identity and unused
helper-injection authoring form, but do not pre-delete the package-author factory
capability.

The strongest justified architecture cuts remain the global `rules.match`
dispatcher and the path/type-only `NormalizeTypesPlugin`. Preserve concise,
feature-owned declarations where they save real authoring work. Do not replace
them with a generic editing engine, profile registry or mandatory custom command
boilerplate.

Correctness gaps make this more than a naming exercise: focused probes reproduce
inconsistent input-rule fallback, ignored predicate customization, a command
replacement bypassing `maxLength`, and structural transforms reversing selection
direction. Those current observations justify further design; a replacement
runtime has not been implemented or benchmarked.

Coverage: **33 expected source groups, 33 reviewed, 0 excluded, 0 without a
disposition: 16 Pursue, 15 Stop, 2 Defer.** The [complete census](../../plans/artifacts/editing-api-review/coverage.json)
records every member, plus 35 Plite implementation files and two barrels. The
two Defer rows explicitly retain unresolved design/proof gates. This is not an
audit of every table, list, math, link, native-input or clipboard implementation;
their relevant consumers constrain this question without inheriting its verdict.

## User job and hard laws

Typing, Enter, deletion, paste and explicit structural commands must produce
predictable edits under installed feature policy. A command may interpret user
intent differently from a raw transaction primitive, but both must respect
insertion admission, complete content, valid schema, exact target/root identity,
selection direction, atomic history and deterministic correction. Imported
canonical changes retain their explicit insertion-limit exemption.

Feature policy remains optional where omission leaves a valid editor. Schema
validity and representation invariants do not become optional. Plaintext,
single-block with line breaks, and single-line content are different jobs.
Code, math, list and other feature semantics stay with their owners.

## Ranked decisions

| Unit | Decision and surviving owner | Evidence and limit |
| --- | --- | --- |
| Input-rule execution | Pursue an atomic rule-attempt contract inside the existing canonical command middleware. Preserve declarative activation, trigger discrimination, priority, portable context and native-equivalence behavior. A declined rule must not commit its draft; continuation must compose through the command's `next.after(prefix)` exactly once. Make the always-installed executor private unless design finds a real public configuration job. | [InputRulesPlugin](../../../packages/platejs/src/lib/plugins/input-rules/InputRulesPlugin.ts) already wraps the three canonical commands. Its three fallback branches disagree: the probe's mutate-then-`false` draft is discarded for text/Enter but committed before paste fallback. A prior rule's draft can also survive when a later rule consumes the same shared transaction. ProseMirror and Tiptap retain declarative input rules but dispatch only the accepted candidate transaction. |
| Global structural-rule matching | Pursue cutting `rules.match`, its string query union and global first-match scan. Blockquote ancestry and list-property conditions belong to those feature owners' commands/read behavior. Retain useful owner-local `break`, `delete`, `merge`, `normalize` and `selection` declarations. | [OverridePlugin](../../../packages/platejs/src/lib/plugins/override/OverridePlugin.ts) replaces a whole break/delete family from the first matching plugin; false matching still permits type-owner fallback. `selection.affinity` appears in [MatchRules](../../../packages/platejs/src/lib/plugin/PluginDefinition.ts) but affinity does not use this matcher. This is a source-backed semantic inconsistency, not a newly executed collision test. |
| Structural selection and admission | Pursue repairing Plite's existing owners. Use canonical mapped selections instead of depth-specific forward-range reconstruction, and enforce insertion limits before the full-block replacement branch. | [lift](../../../packages/plitejs/src/transforms-node/lift-nodes.ts), [unwrap](../../../packages/plitejs/src/transforms-node/unwrap-nodes.ts), [command replacement](../../../packages/plitejs/src/core/editor-commands.ts). Probe: both transforms turn a backward selection forward; replacing two selected paragraphs inserts nine characters with `maxLength: 5`, while the transaction insertion yields five. |
| Exit before/after a structure | Pursue one schema-aware structural mutation for shortcut and rule callers; keep app-selected shortcuts. Compare reuse/enhancement of existing block insertion operations before adding any public exit noun. | [ExitBreakPlugin](../../../packages/platejs/src/utils/plugins/ExitBreakPlugin.ts) builds a bare paragraph and checks parent acceptance; [rule exit](../../../packages/platejs/src/lib/plugins/override/OverridePlugin.ts) builds a root default and uses different ancestor logic. Neither implementation establishes the complete target law for nested/named roots. |
| NormalizeTypes | Pursue deleting this path/type-only public language. App-owned positional correction must express the complete schema-valid title value, reusing schema construction/validation. | [NormalizeTypesPlugin](../../../packages/platejs/src/utils/plugins/NormalizeTypesPlugin.ts) can only retag or insert an empty typed block. [The forced-layout playground](../../../apps/www/src/registry/examples/playground-demo.tsx) still asks for `h1`; [Heading](../../../packages/platejs/src/features/basic-nodes/lib/BaseHeadingPlugins.ts) requires `heading` plus `level`. Do not claim today's schema grammar alone expresses every positional invariant. |
| Input-rule authoring | Pursue cutting helper-injection `inputRules: ({ rule }) => ...`, `InputRuleBuilder` and `InputRulesFactoryContext`. Retain raw `defineInputRule`, specialized reusable algorithms and the package-author factory **job**. Redesign the exact bound factory shape only if a smaller API preserves inferred feature transactions, required/default options and narrow public rule families. | Zero production helper-injection declarations found in the bounded package/registry TS/TSX census. By contrast, [createRuleFactory](../../../packages/platejs/src/lib/plugins/input-rules/createRuleFactory.ts) has 18 production definitions across basic nodes, code block, list, link and math, including descriptor-bound `tx` inference. Its seven-family overload language and caller-override precedence are real debt: the probe shows factory `enabled: true` wins over caller `enabled: false`, contradicting the docs. That evidence justifies redesign, not deletion of the capability. |
| SingleBlock / SingleLine | Retain separate public policies; pursue complete-content and admission repair. Decide preservation or explicit rejection of non-text nodes instead of treating empty text projection as proof of empty content. | Both [SingleBlock](../../../packages/platejs/src/utils/plugins/SingleBlockPlugin.ts) and [SingleLine](../../../packages/platejs/src/utils/plugins/SingleLinePlugin.ts) remove a second root node when its text projection is empty. This is a source-level content-loss risk, not an executed non-text reproduction. Cardinality alone cannot express Enter conversion, separator handling and paste behavior. |
| TrailingBlock | Retain the optional typing-destination policy; pursue schema-valid construction and a truthful correction/callback lifetime. | [TrailingBlock](../../../packages/platejs/src/utils/plugins/TrailingBlockPlugin.ts) synthesizes `{ type, children: [{ text: '' }] }`, exposes a callback capturing the current transaction, and advertises nested levels from a root-children correction. Existing nested full-repair tests do not establish nested-only event delivery. |
| Neutral editing primitives | Stop wholesale redesign. Retain hard/soft breaks, text/mark operations, structural operations, insertion admission and convergent corrections at Plite. Cut the duplicate unused singular-insert implementation body. | [insert-node](../../../packages/plitejs/src/editor/insert-node.ts) duplicates the actual [static dispatcher](../../../packages/plitejs/src/interfaces/editor.ts). Command-versus-primitive void deletion already has intentionally different tested semantics. No universal identical-results rule is proposed. |
| Representation cleanup | Defer accepting the runtime cut. Compare deleting adjacent-text rescans in unwrap/deletion cleanup and letting canonical representation own equivalent coalescing. Preserve deletion-specific structure, spacers and caret decisions. | [unwrap scan](../../../packages/plitejs/src/transforms-node/unwrap-nodes.ts), [deletion cleanup](../../../packages/plitejs/src/transforms-text/delete-text-structural-cleanup.ts), [representation owner](../../../packages/plitejs/src/core/representation.ts). Intermediate mapping dependencies and matched complete-operation performance have not been proved. |
| Nested block-void break | Defer the exact repair until a parent-grammar probe resolves it. | [block-void-break](../../../packages/plitejs/src/editor/block-void-break.ts) constructs a root default beside a possibly nested void. A root-valid child is not evidence of parent compatibility. Preserve this gap in design. |
| Copied examples and teaching | Keep independently useful examples and app-owned substitution tables; delete the unconsumed English/Chinese soft-break values and repair stale instructions/proof claims. | Input-rule docs teach six persisted heading types; rule docs overstate reset property removal. Autoformat advertises `+ ` although the shipped list kit enables `-` and `*`. Single-content mode switching recreates its editor. These are adoption work, not reasons to create new package APIs. |

## Current and proposed ownership

The normal activation shape already serves a real job and should survive unless
design finds a smaller equally expressive contract:

```tsx
import { HeadingRules } from 'platejs';
import { HeadingPlugin } from 'platejs/react';

HeadingPlugin.configure({
  inputRules: [HeadingRules.markdown()],
  rules: { break: { splitReset: true } },
});
```

**Proposed internal direction; not a shipped API:**

```text
app/registry: chosen shortcuts, input assists and punctuation policy
                         ↓
feature: compact declarations, matchers and semantic mutations
                         ↓
private trigger index + atomic rule attempt
                         ↓
canonical command outcome/continuation
                         ↓
Plite structural operations → canonical mapping/representation/correction
```

Advanced custom behavior already has `commands: ({ handle, around }) => ...`,
immutable state, transaction specs and `next.after(prefix)`. Input rules remain
a feature-authoring layer over that machinery, not a competing runtime. Keep the
compiled trigger index while it provides the current hot-path discrimination.
The public InputRules and Override executor identities need no independent
configuration role merely because private compilers use them. Test
hiding/deleting those public nouns; do not rename them to a new public
`EditingPlugin`.

The design must resolve priority, candidate isolation, cached reads after a
prefix, decline versus rejection, exactly-once continuation, resolved match
types, caller override precedence and default native-equivalence. It should
first test a candidate transaction per matched rule, or an equivalent mechanism
that makes decline unable to leak writes. Replacing the current loop with one
handler per rule is only one candidate: without matched measurement it could
trade an indexed trigger lookup for repeated unrelated work.

## Alternatives challenged

- **Keep declarations and patch the three command wrappers independently:**
  would repair the observed paste branch but leave shared speculative writes,
  caller precedence and consume/continue semantics able to drift. Insufficient
  as the durable target.
- **Delete all rule declarations:** rejected. Heading split/reset, callout
  newline/exit, empty-link correction, merge retention and affinity are real
  compact policies. Moving each into copied command boilerplate adds caller work.
- **Delete `createRuleFactory`:** rejected as a preselected target. Eighteen
  production definitions use its package-author job, and descriptor binding
  infers feature transaction portals. The current seven-family overload surface
  still must earn its exact shape against direct feature factories and a smaller
  bound definition helper.
- **Move every policy into Plite/schema:** rejected. App punctuation, feature
  shorthand, select-first UX and optional trailing blocks are product policy.
  Grammar cannot decide how to convert a multi-block paste to one line.
- **One configurable single-content plugin:** rejected. The two existing jobs
  are clear; a mode switch adds no established value and does not fix content
  preservation.
- **A new behavior framework or context object:** rejected. The command,
  correction and schema owners already supply the necessary execution boundaries.
- **Canonical structural authority plus feature declarations:** strongest
  direction. It removes duplicated laws while preserving ordinary configuration.
  Its runtime lowering and cleanup candidates remain gated on proof.

## Consumers and dispatch census

The input-rule production activation census contains 16 arrays across seven
copied families: basic blocks, basic marks, code block, list, math, link and
autoformat. They require block-prefix conversion, delimiter matching, paired
substitutions, fence completion and autolink behavior at space/Enter/paste.
Neither a single arrow test nor one mark rule represents all of these jobs.

Current typed descriptor portals include heading/code-block schema and feature
reads. Bound factories give direct typed `tx.heading`, `tx.list` and `tx.link`
groups. Internal feature stages use `tx.plugin(plugin.name)`; optional code-block
checks in basic-block/list/link code resolve a compiled descriptor by name so
they need not create an otherwise wrong dependency. These dynamic boundaries
are intentionally erased: a presence guard is runtime safety, not capability
inference. No recommendation imports every peer or replaces descriptor access
with names. Existing shortcut-string dispatch has its own compiler validation
and does not establish static typing for arbitrary string calls.

The public guide currently teaches both an unused helper-injection form and
`editor.update(...)` from inside `apply`, even though `apply` already receives
the active `tx`. It also promises that caller `enabled` overrides a factory
default while the implementation gives the factory callback precedence. Those
are adoption defects and direct evidence that the authoring surface is wider
than its working contract.

The two raw examples retain independent jobs: forced layout demonstrates
positional correction; plaintext demonstrates ordinary editing without rich
formatting. The single-content demo supplies separate multiline/single-line
policy examples. English exit-break content supplies nested table/code/columns
cases; Chinese content is stale. Plugin-rules content is a scenario gallery,
not executable proof. The two soft-break values have no production consumers.

## Prior decisions and execution reconciliation

| Prior evidence | Retained, reopened or limited conclusion |
| --- | --- |
| [Command core review](../review-records/2026-09-11-commands-remove-default-build.json) and [current decision](plite-core-ownership.md) | Retain installed dispatch, private builders and unpublished continuations. Current descriptors no longer publish the default-only builder. Historical broad handoff gaps do not prove current editing behavior or block this read-only assessment. |
| [Schema-default reset implementation](../../plans/2026-08-26-media-caption-block-reset-api.md) | Retain `tx.blocks.reset({ at? })`, immediate parent/root defaults, property lifecycle, identity and feature-owned guards. Current source and consumers preserve that owner; this audit does not replay the historical package/browser receipt or bind its unbound lifecycle retroactively. |
| [Input-rule before/toggle adoption](../../plans/2026-07-01-plate-next-input-rules-before-api.md) | Retain neutral point matching and structural toggle in Plite. Do not restore feature-local generic helpers. Historical old-package proof remains historical. |
| [API-shape audit](../../plans/2026-07-22-plite-plate-agent-native-api-shape-audit.md) | Reaffirm deletion of unused helper-injection authoring. Its proposed frozen `inputRule` namespace was not adopted and does not constrain this review. The fresh production census reopens deletion of the package-author factory capability; compare smaller typed implementations while preserving its proven jobs. |
| [Behavior architecture](../systems/editor-behavior-architecture.md) and [input-assist families](autoformat-families-are-input-assist-surfaces.md) | Retain one execution model, nearest structural ownership, feature invariants and app-selected assists. Do not infer a public plugin from every implementation contribution. |
| [Older autoformat normalization target](current-kit-autoformat-normalization-split.md) | Its Enter-owned code-fence/HR direction is not current adoption: the code-block kit explicitly selects match-triggered completion. Preserve both the historical policy question and current source truth; this audit does not silently choose a different product trigger. |

## Proof and unresolved gates

[Proof receipt](../../plans/artifacts/editing-api-review/proof.json),
[input-rule probe](../../plans/artifacts/editing-api-review/input-rule-probe.ts),
[structural probe](../../plans/artifacts/editing-api-review/structural-probe.ts),
and the [fresh final-pass challenge](../../plans/artifacts/editing-api-review/final-pass.md)
record the exact commands, observations, source hashes and external comparator
revisions.

- Existing input-rule baseline: **35 pass, 0 fail, three files, 85 assertions**.
- Executed current-source probes: mutation/fallthrough divergence; ignored
  enabled override; backward lift/unwrap becomes forward; two selected blocks
  bypass insertion admission. The single-block replacement control respects the
  limit in both command and transaction paths.
- The named browser autoformat spec contains one arrow replacement/follow-up
  case with model, DOM, caret, focus and error assertions. Raw plaintext and
  forced-layout browser suites and structural-policy package tests were read,
  not executed. Their existence does not certify the remaining scenarios.
- No product files, tests, public APIs, generated registry or doctrine were
  changed. No candidate runtime, native/device, collaboration or performance
  certification was attempted. Source-only structural-content and lifecycle
  concerns remain labeled as such.

Before accepting runtime changes, compare baseline and candidate on complete
typing/non-trigger/trigger, Enter, paste and structural operations across
document size, nesting and rule count. Freeze correctness, selection, commit,
native-equivalence and locality guards before reading results. The design must
also settle schema-default/required-property construction, named roots, exact
disjoint selections, undo and correction convergence. Neither source complexity
nor the passing baseline accepts a new hot-path runtime.

Next owner: **`$task design plan editing: make input-rule attempts atomic,
preserve structural selection and content, and remove false rule owners`**.
Task should resolve the coupled API, Plite/Plate ownership, adoption, doctrine
repair and proof questions in one lifecycle. This review does not start that plan.
