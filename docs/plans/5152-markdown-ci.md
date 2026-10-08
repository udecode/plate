# PR 5152 Markdown fixes: CI repair

Status: building; the CI repair sits uncommitted in a worktree until you commit it
Playbook: babysit

Babysit of [PR 5152](https://github.com/udecode/plate/pull/5152) by natamox, head `e1fb01295e` on `next` at `c70bacbd4a`. The repair lives uncommitted in the detached worktree `/Users/zbeyens/git/plate-pr-5152`, because the owner commits and this run has no push authority.

## Brief

### What will change?

The PR's four Markdown fixes stay as written. Two old tests that expected the broken output go, and the Chinese docs page gets the table-cell change the English page already has.

### What could go wrong?

The PR's CI stays red after this, because next itself fails five check steps and six Plite browser tests. Only the two failing Markdown tests were this PR's.

## Teach

Plate can save a document as Markdown and read it back. A line break at the very end of a paragraph has no plain Markdown spelling, so Plate writes it as an HTML line-break tag on its own line.

Before this PR, that failed when a paragraph ended in two or more breaks. Plate wrote a backslash and a space right before the tag line. Markdown reads that as a literal backslash, so one break got lost each time. The PR now writes every break in that trailing run as the HTML tag, and the text survives the round trip.

Two tests in the website app still expected the old, lossy output, so CI failed on them. Package tests already check the same round trip, so the repair deletes the two stale tests.

## Main changes

| Change | Before | After |
| --- | --- | --- |
| Stale www tests | `serializeMarkdown.spec.tsx` pinned `> Block quote\ ` and `Para\\\n\ ` output, which reads back with a lost break | Deleted; `commonmarkSurface.slow.ts` and `paragraphBreaks.spec.ts` assert the round trip |
| Chinese Markdown docs | Said block tags in a table cell stay text | Matches the English page: childless registered block tags, such as a sized image, stay blocks in a cell |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Two stale website tests | Delete them, since package tests already check the round trip | Keep them, updated to the new output | keep www tests | small |
| Delivery | Leave the repair uncommitted in the worktree and draft the PR text | Commit it and push it to the PR branch | push it | big |
| Failures that are already on next | Leave them to their owners and list them here | Fix them inside this PR | fix next too | small |
| Shorter trailing-break output | Keep the PR's output | Write only the last break as HTML and change every single-break snapshot | shorter breaks | detail |
