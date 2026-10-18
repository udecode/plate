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
| An incremental native parser | Needs a matched benchmark and full language and rendering oracles first. |
| Splitting a copied backend out | Only worth it with a whole CodeMirror composition change and measured value; moving controls alone keeps Lowlight imports. |

## Rules

These rules bind this feature alone, so they live here instead of in `docs/vision/`.

- Code-block commands construct schema-valid code nodes directly, preserving
  their distinct insert/upsert selection policy without exposing an intermediate
  default type. Optional JSON prettifying belongs to copied UI and edits the
  canonical text through Plite. Syntax readers do not mutate a caller's
  highlighter; copied native and static kits register their parser resources
  before use.

## What other editors do

Not compared in this scope's reviews; CodeMirror is the adopted optional editor, and its source pages live under `docs/research/sources/`.

## Main changes

- Code insertion constructs the final schema node, and the syntax reader no longer mutates the supplied highlighter.

## Open work

- No browser device, IME, assistive-technology, distribution or new performance comparison; backend separation stays deferred. owner: the next code review. stop: a measured backend split proposal.
