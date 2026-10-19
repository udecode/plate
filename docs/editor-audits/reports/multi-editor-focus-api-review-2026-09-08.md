---
summary_version: 1
preserved_at: 2026-09-18
audit_id: multi-editor-focus-api-review-2026-09-08
source_artifact: docs/plans/artifacts/multi-editor-architecture-review/report.md
source_sha256: 8420e7070a098d6c1306b505b257c1d72292bf5668f69de1fa2a966739fa1fd3
---

# Multi-editor focus review — preserved conclusion and reversal

Historical summary of the locally recovered report. The original artifact may
be absent from another checkout. Its SHA-256 binds this summary to the report
read during preservation, not to current product source or rerun proof.
The [audit registry](../index.json) retains the complete original provenance.

The September 8 review reproduced loss of a surviving view registration when a
sibling unmounted, and last-focus reads that lost exact view identity through
toolbar blur. It also found ambiguous contextual target lookup and unchecked
duplicate editor IDs. Those observations did not establish a need for a new
public View abstraction.

The second plan review superseded the initial public view-record proposal.
It retained ordinary contextual toolbars, private exact-mount registration,
and reuse of existing root/view command owners. It deferred useActiveEditorView,
nearest-only hook semantics, and removal of initial/default target behavior.
The original public proposal is historical input, not the final recommendation.

Rejected alternatives included the old ID-as-mount-identity registry, threading
an editor/root/ref bundle through every toolbar control, and restoring
EventEditorPlugin. A private registration must preserve the chosen mount's
current command, read-only, and focus facts; an interaction must not silently
retarget after its mount is removed.

Reported proof: 23 Plate focus/controller tests, 13 DOM runtime tests, and three
diagnostic probes with eight assertions. The probes reproduced defects in
React/JSDOM and retained act warnings; they were not acceptance tests or browser
certification. Reference suites, full external test/issue harvesting, and the
required proposed-target scale comparison were not run. The revised target
remained provisional pending an integration probe and benchmark.

The second review changed only the public-shape recommendation. It did not
invalidate F1/F2 or reclassify unrelated reference mechanisms. This preservation
does not resolve any later execution or certify present behavior.

## Recorded reference pins

The superseding second review was read at original path
`docs/plans/artifacts/multi-editor-architecture-review/plan-review.md`, SHA-256
`346ff08a1c1b49d31e52f00e0b10aea6a1d001e3f9d282280c23abbf4dfe3d46`.

| Reference | Audited revision | Observed at |
| --- | --- | --- |
| lexical | `a43e3b74caf59632352d28de28430bbf82e6d343` | 2026-09-08T18:41:11.394717+00:00 |
| tiptap | `7ab690e5056fe999988552822c4fc1b1064bf094` | 2026-09-08T18:41:11.394717+00:00 |
| prosemirror | `c7f2f1d7bde70728dfedaa68ca8f5fc3dffa17cc` | 2026-09-08T18:41:11.394717+00:00 |
| slate | `45a16ee53fa7c54a551c755cb96af5cb39eb868d` | 2026-09-08T18:41:11.394717+00:00 |
