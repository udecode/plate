# Editing rules and structural commands

Typing, Enter, deletion, paste and explicit structural commands produce predictable edits under installed feature policy. A structural input rule opens one candidate transaction, the real Plite command reports whether it applied, and `decline()` discards the whole candidate and delegates the original input, while `next()` composes its prefix. Forced document structure is `schema.content.prefix(required, rest)` in Plite's canonical schema. The 2026-10-04 audit found this live and stopped: the shadow-document validator and its second admission path are gone ([triage audit](../2026-10-04-ledger-triage-audit.md), [admission implementation](../2026-09-23-structural-input-rule-admission-implementation.md), [prefix schema](../2026-09-22-document-structure-in-the-canonical-schema.md), [command convergence](../2026-09-21-editing-command-and-input-rule-convergence.md)). `node tooling/scripts/review-ledger.mjs show editing` prints the full history.

## Layer and owner

```text
app/registry: chosen shortcuts, input assists and punctuation policy
  → feature: compact declarations, matchers and semantic mutations
  → private trigger index + atomic rule attempt
  → canonical command outcome and continuation
  → Plite structural operations → mapping, representation, correction
```

| Responsibility | Decision |
| --- | --- |
| Input rules | Declarative rules compile into middleware around Plite's `insertText`, `insertBreak` and `insertData`. Matching is read-only against command state, and one accepted transaction applies. Owner-bound `defineInputRule` keeps feature typing. Heading, quote, generic block, list, code fence and horizontal rule shorthand use the command outcomes. |
| Structural commands | Plite commands report whether they staged a change. Insertion admission, complete content, schema validity, exact target and root identity, selection direction, atomic history and deterministic correction hold for both commands and raw transactions; imported canonical changes keep their insertion-limit exemption. |
| Required document structure | The app declares its required title and body with `schema.content.prefix`; the runtime owns validation, construction, fitting and transactional enforcement, including closed tables across required content and deleted required slots. Heading and quote rules keep typed markers when the title rejects conversion. |
| Schema-default reset | `tx.blocks.reset({ at? })` with immediate parent or root defaults, property lifecycle and feature-owned guards. |
| Owner-local rules | `break`, `delete`, `merge`, `normalize` and `selection` declarations stay with their feature. |
| Single-content policies | `SingleBlock` and `SingleLine` stay separate policies; cardinality alone cannot express Enter conversion, separators and paste. |
| Advanced behavior | `commands: ({ handle, around }) => ...`, immutable state, transaction specs and `next.after(prefix)`; input rules are an authoring layer over that, not a competing runtime. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| `canApplyBlockChanges` shadow validation | Copied ancestor arrays and validated a guessed whole document before the real command; deleted. |
| The global `rules.match` dispatcher and `NormalizeTypesPlugin` | First-match scans and path-or-type retagging duplicated feature and schema owners; deleted. |
| Helper-injection `inputRules: ({ rule }) => ...`, `InputRuleBuilder`, the bound factory overload family | No production caller for the injection form; the factory surface was wider than its working contract. |
| Patching the three command wrappers separately | Left speculative writes and continuation semantics able to drift. |
| Deleting all rule declarations | Heading split and reset, callout exit, empty-link correction and affinity are real compact policies. |
| Moving every policy into Plite or the schema | Punctuation, shorthand and trailing blocks are product policy. |
| One configurable single-content plugin, a new behavior framework or a public `EditingPlugin` | The command, correction and schema owners already give the boundaries. |

## What other editors do

ProseMirror and Tiptap keep declarative input rules but dispatch only the accepted candidate transaction; Plate's atomic attempt follows that.

## Main changes

- Rule attempts became atomic candidates with `decline()` and `next()`; forced layout moved from Normalize Types into the canonical schema prefix.

## Open work

- Proof is partial: package-wide core lint has unrelated failures, the normal-size timing cohort is noisy, quote and list lack matched timings, and the strict equivalent-reconfiguration ratio is red. owner: the next editing review. stop: a clean matched run.
- Adjacent-text rescans in unwrap and deletion cleanup may belong to canonical representation. owner: the next editing review. stop: matched complete-operation timings.
- A nested block-void break builds a root default beside a possibly nested void. owner: the next editing review. stop: a parent-grammar probe.
- `SingleBlock`, `SingleLine` and `TrailingBlock` treat an empty text projection as empty content and synthesize bare blocks. owner: the next editing review. stop: a non-text reproduction.
- The spec has drifted from the shipped code in five families: list items are flat paragraphs, comments are range anchors and suggestions are authored changes, autolink is opt-in through `LinkRules.autolink`, the autoformat plugin became per-plugin rule factories, and block math is a void atom while its rules put a caret inside it. The spec and `BaseMediaPluginContracts.spec.ts:732` disagree on ⌫ after media, and the task-Enter rule contradicts the code. owner: Ziad. stop: each is decided as a law correction or a Bug fix. Carried from the [2026-10-06 knowledge plan](../2026-10-06-knowledge-reorg.md).
- Three places where the law and the tests disagree: table ⇤ lands at the start of the previous cell while `EDIT-TABLE-STAB-001` says its end; the hard-affinity scenario puts `x` outside the code mark while both hard-edge tests assert it inside; and the spec stores a date's value in `node.date` while the code uses `node.value`. owner: Ziad. stop: each is settled as law or as a code fix through the Bug fix playbook. Carried from the [2026-10-06 knowledge plan](../2026-10-06-knowledge-reorg.md).
- The 2026-10-06 knowledge plan's compile readers found 11 problems in behavior law and Vision, such as nested tables, cell-range paste and triple-click with no rule. Each is an open `finding` row in that plan's decision log, and phase 4's side findings in the same area join them; a claim marked inferred or "not run" needs its probe before a fix. owner: Ziad. stop: each becomes a rule, a listed gap or a Vision edit, or 2026-12-07. Carried from the [2026-10-06 knowledge plan](../2026-10-06-knowledge-reorg.md).
