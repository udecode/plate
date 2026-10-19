# Editing rules and structural commands

Page: https://claude.ai/artifact/W6iiHdZ6LyjPxHQkPBUcMp

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
| Intra-word mark shorthand | The mark rule's resolver and apply move into a private factory, `markInputRule.internal.ts`, that takes an optional intra-word acceptor. `createMarkInputRule` passes none, so every public caller keeps the after-whitespace rule. `ScriptRules` passes the script acceptor, which owns the predecessor, token and inline-code checks. |

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

Pandoc, markdown-it-sub and markdown-it-sup, and Typora open `~x~` and `^x^` inside a word, as in `H~2~O`, and accept anything without spaces between. Plate opens them inside a word only after an ASCII letter, digit or `)`, around ASCII letters or digits with an optional sign, and never where the inline-code shortcut would wrap the match ([intra-word script shorthand](../2026-10-19-intraword-script-shorthand.md)).

## Main changes

- Rule attempts became atomic candidates with `decline()` and `next()`; forced layout moved from Normalize Types into the canonical schema prefix.
- Typed `H~2~O` and `X^2^` give subscript and superscript (udecode/plate#5204). The script rules ask a private intra-word acceptor, which follows the inline-code rule's own resolver. The mark rule's apply step no longer deletes the character after the caret when a shortcut completes mid-paragraph.

## Open work

- Proof is partial: package-wide core lint has unrelated failures, the normal-size timing cohort is noisy, quote and list lack matched timings, and the strict equivalent-reconfiguration ratio is red. owner: the next editing review. stop: a clean matched run.
- Adjacent-text rescans in unwrap and deletion cleanup may belong to canonical representation. owner: the next editing review. stop: matched complete-operation timings.
- A nested block-void break builds a root default beside a possibly nested void. owner: the next editing review. stop: a parent-grammar probe.
- `SingleBlock`, `SingleLine` and `TrailingBlock` treat an empty text projection as empty content and synthesize bare blocks. owner: the next editing review. stop: a non-text reproduction.
- AutoformatKit turns typed `a==word==` into `a≡word≡`, because its unpaired `==` substitution has no boundary check (`apps/www/src/registry/components/editor/autoformat.tsx:28`). owner: natamox, suggested task `t_a35e62ee`. stop: a boundary-checked `==` substitution with a kit test.
- Mark shortcuts after a space run inside inline code, because `inputRuleVeto` covers node types only (`packages/platejs/src/lib/plugins/input-rules/InputRulesPlugin.ts:192-202`). owner: zbeyens. stop: a mark-aware veto or an accepted limit.
- The character before a mark opener reads as empty at a leaf boundary (`packages/platejs/src/lib/plugins/input-rules/markInputRule.internal.ts`), so after bold text the after-whitespace rule applies and the script acceptor is never asked. owner: zbeyens. stop: a block-text read with a split-leaf test.
- An escaped closer after a space still marks, such as ` ~2\~` and ` *a\*`, for every mark rule. owner: zbeyens. stop: the factory refuses content that ends in a backslash, with a test.
- A mark rule's backward opener search costs about 40 µs per character scanned (`packages/plitejs/src/editor/before.ts`): a typed backtick costs 340 to 530 ms, and a closing `~` or `^` inside a word about 190 ms, in a 1,000-leaf paragraph that starts with a backtick. owner: natamox, suggested task `t_9281fdf0`. stop: a backward search linear in the scanned text, with the timing probe.
- The autoformat demo says nothing happens when a character comes before a shortcut, which is no longer true for `~` and `^` (`apps/www/src/registry/examples/values/autoformat-value.tsx:35`). owner: natamox. stop: one demo line with a registry changelog entry.
- `^o` becomes `°` before a closing `^` arrives, so `x^o^` cannot be typed (`apps/www/src/registry/components/editor/autoformat.tsx:97-99`). owner: natamox. stop: an ordering or boundary rule for the degree shortcut.
- The input-rules guide says `matchDelimitedInline` runs under `createMarkInputRule`, which is false (`content/docs/(guides)/plugin-input-rules.mdx:926`). owner: natamox. stop: one corrected sentence.
- zbeyens owns MARK-002 and MARK-004 (`docs/editor-behavior/current-evidence.md:158`). Following the inline-code rule means one stray backtick earlier in a paragraph keeps `H~2~O` plain after it, where CommonMark and Pandoc leave an unclosed backtick literal. owner: zbeyens. stop: his confirmation before push.
