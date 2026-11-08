---
'plitejs': major
---

Compare schema-valid document revisions with `compare`, then resolve three-way conflicts with `resolveComparison`. Results keep exact canonical changes, content correspondence, grouped effects, and explicit diagnostics. Use `proposeAuthoredComparison` to publish a validated result as one native pending proposal.

Pass `groupIds` to import some groups. The import also takes each group the selected groups require. It writes each run of changed content whose groups are all selected, between the same two blocks that both documents keep in place. Groups with edits in one run require each other, the pieces of a move, split or join are one group or require each other, and groups that move a word found once in each document from one run to another are one group. The import returns `applied` only when accepting its proposal alone gives the document with only the selected groups applied, and rejecting it alone gives the document it started from. Otherwise it returns `blocked` and writes nothing, with reason `ambiguous-selection` when the selection would leave out a text or mark difference that no group covers, and `dependency` otherwise. A conflict choice drops the losing branch's groups in that conflict and every group of that branch that requires them. `resolveComparison` returns `invalid` when a remote-only edit changes the same part of the document as an edit both branches made.

Install `diff-match-patch-ts` when importing `plitejs/diff`.
