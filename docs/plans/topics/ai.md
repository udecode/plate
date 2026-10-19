# AI preview and request lifetime

Generated drafts and requested edits have different owners. Generate, Continue writing and insert commands render one temporary purple draft outside the document and apply it with one normal transaction under the user's current intent. Selection edits, such as Improve writing, stream one request-owned native suggestion at the selection and leave the user's Editing or Suggesting intent alone. The 2026-10-04 audit kept that ownership and opened one Pursue: `BaseAIPlugin` still carries a persisted `ai` text mark and `insertNodes`, `removeMarks` and `removeNodes` operations that nothing calls, and `insertNodes` teaches the in-document streaming this law removed ([triage audit](../2026-10-04-ledger-triage-audit.md)). `node tooling/scripts/review-ledger.mjs show ai` prints the full history.

## Layer and owner

```text
generate/insert → AIChatPlugin's temporary draft + stable target
                → copied inline or popup rich preview + streaming indicator
Apply           → one normal editor update under the user's chosen intent
Discard         → release the draft

edit selection  → one request-owned native authored proposal at the stable selection
Accept          → accept that proposal
Discard         → reject it and restore the mapped invoking selection
```

| Responsibility | Decision |
| --- | --- |
| Editing intent | Opening, streaming, retrying, cancelling and applying never change the user's intent; there is no saved mode to restore. |
| Preview input | `api.setPreview(content, { requestId? })` takes the full accumulated Markdown; generate and insert update `previewValue` without touching the document or its history. `api.setTablePreview` takes request-local cell references. Canonical Markdown parsing builds rich nodes. |
| Paint | The static `AIChatEditor` paints the draft and its generation-end indicator; sparse keyed node attributes activate one private inline wrapper. No AI subscription runs on every block. |
| Targets | Native anchors track text targets and node keys track block and table-cell targets. A deleted target fails without applying elsewhere, and retry never adopts another target. |
| Request lifetime | Each request owns its mapped target, callbacks, response references and unresolved comment creation, with its own SDK chat instance. `hide` cancels and discards unaccepted output; `stop` flushes and keeps received output for review; outside-click dismissal keeps the clicked destination. |
| Partial apply | Multi-paragraph application reuses the canonical slice fitter. |
| AI comments | Completed feedback becomes ordinary published comment threads with their own controls. A private draft exists only while thread creation is unresolved. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| Switch the view to propose and markup, then restore it | Borrowed the user's input policy to show AI output; that switch was the reproduced defect. |
| Restore the AI mark or override suggestion colors | Repairs paint only; the mode switch and suggestion lifetime stay. |
| Permit `edit/markup` in Plite | Needs a mapping policy for editing pending text and still shows unrelated proposals. |
| An AI origin flag or a filtered transient authored branch | Keeps per-stream authored work and adds another projection lifetime without beating the draft. |
| Detached preview for selection edits too | Removes the established inline suggestion review. |
| An approval bar for AI comments | No job beyond ordinary comment controls. |
| A public per-chunk insertion helper or serializer feedback loop | Deleted; the accumulated preview replaces them. |

Package cost on the final path, three samples per cohort: the 100 KiB output over 1,000 paragraphs takes a 10.28 s median against the frozen baseline's 37.55 s, with a 39.14 ms maximum publish. These are local package costs, not browser latency.

## What other editors do

Not compared in this scope's reviews; they weighed Plate's own preview, suggestion and comment owners. The comparison for native proposals lives under the `suggestions` and `authored` subjects.

## Main changes

- The automatic Editing-to-Suggesting switch and its saved-view restore are gone; AI never borrows the input policy.
- AI comment approval, its request-owned completed-comment list and close rollback are cut.

## Open work

- Delete the unused `ai` text mark and the `insertNodes`, `removeMarks` and `removeNodes` operations from `BaseAIPlugin`. owner: the next AI plan. stop: those exports are gone.
- Provider, IME, deployment and repository-wide typecheck proof stay unclaimed. owner: the broader AI and Copilot audit. stop: that audit's verdict.
