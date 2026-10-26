# Code text

A code block is one newline-bearing Text, rendered natively or statically with syntax highlighting, with CodeMirror as an optional editor. Code insertion builds the final schema node; JSON formatting is a copied-UI button with one canonical granular update; native indentation leaves an untouched endpoint line alone; the package syntax reader reads the supplied Lowlight without changing it. The 2026-10-04 audit found this in live source and stopped ([triage audit](../2026-10-04-ledger-triage-audit.md), [execution](../2026-09-22-code-commands-and-highlighter-ownership.md)). `node tooling/scripts/review-ledger.mjs show code` prints the full history.

## Layer and owner

| Responsibility | Decision |
| --- | --- |
| Model | One Text per code block, owned by `BaseCodeBlockPlugin`. |
| Highlighting | Reads each block once, the granularity the decoration contract re-reads on a text change; rendered documents reuse an unchanged block's highlighting by identity. Copied native and static kits register browser-safe languages, such as Python, at resource construction. |
| CodeMirror | The adapter in `platejs/code-block/codemirror` owns incremental parsing in external-only composition; mixed views keep native syntax; neutral annotations survive both. |
| External text | Synchronous dispatch-boundary feedback and monotonic recovery behind the narrow public slot; see the `external-text` subject. |
| JSON formatting | A copied-UI action, not a package command; no alias remains for the removed command or `defaultType`. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| A shared code-text recipe | Rejected during the 2026-09-04 execution. |
| Hidden grammar-registry mutation in syntax reads | Removed; the reader leaves the caller's highlighter unchanged. |
| An incremental native parser | Needs a matched benchmark and full language and rendering oracles first. On 2026-10-26 Lowlight took 9 to 13% of a key in the 10,000-line demo, so any engine faces the same ceiling ([review](../2026-10-26-code-highlights-techniques.md)). |
| Splitting a copied backend out | Only worth it with a whole CodeMirror composition change and measured value; moving controls alone keeps Lowlight imports. |
| Highlights behind the `lowlight` slot, with Lowlight as fallback | Lowlight is about a tenth of a key, so a free highlighter saves at most about 11%, under the 20% gate, and the kit would ship two engines. Reopen when Lowlight is over a fifth of a key on a quiet host. |
| Resuming Lowlight from a saved line state | highlight.js 11's public `highlight()` takes no continuation. Reopen if highlight.js exposes resumable state. |
| Merging equal adjacent styles | Saved 0% of ranges on the demo and 1.8% on platejs source, and Highlights merges colors, which needs the theme while tokenizing. Reopen if Plate themes with inline colors. |

## Rules

These rules bind this feature alone, so they live here instead of in `docs/vision/`.

- Code-block commands construct schema-valid code nodes directly, preserving
  their distinct insert/upsert selection policy without exposing an intermediate
  default type. Optional JSON prettifying belongs to copied UI and edits the
  canonical text through Plite. Syntax readers do not mutate a caller's
  highlighter; copied native and static kits register their parser resources
  before use.

## What other editors do

- **Highlights** (`pierrecomputer/pierre@f3afb935:packages/highlights`) uses hand-written WebAssembly lexers, and its live tokenizer keeps each line's end state so an edit re-reads lines only until a line ends the same way. It lacks 23 to 28 of the picker's languages and has no language detection. The [2026-10-26 review](../2026-10-26-code-highlights-techniques.md) kept Lowlight.
- **CodeMirror** is the adopted optional editor. It parses incrementally with Lezer and paints only the visible lines, which the native view's full-DOM rule does not allow.
- **Tiptap**'s code block also uses Lowlight and parsed once per key in the 2026-09-06 comparison on the Plite performance page.

## Public API

The copied native kit builds one Lowlight with every registered grammar and hands it to the syntax plugin.

```ts
// apps/www/src/registry/components/editor/code-block.tsx
const lowlight = createCodeBlockLowlight();

export const CodeBlockKit = [
  createCodeBlockPlugin(CodeBlockElement),
  CodeHighlightPlugin.configure({
    initialState: { lowlight },
  }),
];
```

## Main changes

- Code insertion constructs the final schema node, and the syntax reader no longer mutates the supplied highlighter.

## Open work

- No browser device, IME, assistive-technology, distribution or new performance comparison; backend separation stays deferred. owner: the next code review. stop: a measured backend split proposal.
- Since cf15725603 the syntax reader reads the block, so Plite re-projects every syntax range on each key, about 30% of a key in the 10,000-line demo. owner: task t_31c0b52b. stop: its fix lands with a contract test.
- Auto language detection runs all 192 registered grammars over the whole block on each read. owner: decide task t_b2f9d9c5. stop: the owner keeps or cuts it.
