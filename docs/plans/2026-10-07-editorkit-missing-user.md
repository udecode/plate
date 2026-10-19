# EditorKit setups that drop typing without a user

Status: executed: fixed and verified; waiting on your commit
Page: https://claude.ai/artifact/6ANUWa7dNzpk91Sj1khRxe
Playbook: bug-fix

Copied setups that install `EditorKit`, `SuggestionKit` or `AIKit` without `createEditor({ userId })` dropped every typed character. Those kits install `DefaultAuthoredPlugin`, which needs an author for every authored write, accepted edits included, and `userId` is typed optional. Found by the suggestions review, `docs/plans/2026-10-07-suggestions-review.md`, and this plan repaired the shipped setups. That review's solo-mode revision replaced both its planned read-only check and these demo user IDs. An editor with no `userId` now writes as the local user, and its build removed the demo IDs.

## Brief

### What will change?

Typing works again in every copied example and documentation setup that installs suggestions or AI. This fix passed a demo user; the suggestions plan then replaced it with a local user default and removed the demo IDs.

### What could go wrong?

Apps that copied these setups before the fix still drop typing until they add a user. Two examples were not checked in a browser, because their test pages show no editor the test can find.

## Demo

1. Run `pnpm --filter www dev` and open `http://localhost:3000/blocks/editor-default`. Click in the editor and type. The text stays and the browser console shows no "An author ID is required" error.
2. Open `http://localhost:3000/blocks/find-demo`, type a word in the first paragraph, then search for it with the find bar. The search finds the typed word.

## Reproduction

- Chromium, `apps/www/tests/browser/runtime-read-regressions.spec.ts` "find: decorated input keeps exact history and follow-up typing", against `next dev` in a fresh detached worktree at `dc927288b2`: fails at line 39, the model keeps "This is editable text" without the typed "qwertyuiop", and the server logs "An author ID is required for authored writes." Log `docs/plans/artifacts/2026-10-07-suggestions-review/proof/find-demo-typing-a1.log`, exit 1.
- Cause, by a one-variable control: the same recipe with only `userId: 'demo'` added to `apps/www/src/registry/examples/find-demo.tsx` passes. Log `docs/plans/artifacts/2026-10-07-suggestions-review/proof/find-demo-typing-control-a1.log`, exit 0.
- Model level: `docs/plans/artifacts/2026-10-07-suggestions-review/proof/no-user-write-a2.log` shows one insert on `createEditor` with `BaseSuggestionPlugin` throwing without `userId` and succeeding with it, from package source only.

## Why it escaped

`userId` is optional in `EditorOptions` (`packages/platejs/src/lib/editor/withPlite.ts` lines 756-760), its JSDoc names Yjs and combobox jobs instead of authored attribution, nothing checks for an author before a write, and `pnpm check` does not run the www browser specs (`tooling/scripts/check.mjs` line 137 lists them as manual), so the typing spec stayed red unnoticed. The suggestions plan's Phase 1 now gives an editor with no `userId` the local user instead of adding a check; this plan adds none.

## Steps

- [x] Read every candidate setup in context and classify it broken, has a user, read-only, or a false match. Proof: the census TSV in `docs/plans/artifacts/2026-10-07-suggestions-review/census/`. Closed: `docs/plans/artifacts/2026-10-07-suggestions-review/census/reply.md`, 98 sites, 20 broken.
- [x] Add a user to every broken registry example and component. Proof: `pnpm --filter www build:registry` output, and the find-demo spec passing in Chromium on a fresh worktree of the fixed tree. Closed: `docs/plans/artifacts/2026-10-07-suggestions-review/proof/build-registry-check-a1.log` and `docs/plans/artifacts/2026-10-07-suggestions-review/proof/typing-sweep-fixed-a3.log`.
- [x] Add a user to every broken documentation setup, Chinese twins included, through `plate-docs`. Proof: the docs checks `plate-docs` names. Closed: `docs/plans/artifacts/2026-10-07-suggestions-review/proof/build-source-a1.log` and `docs/plans/artifacts/2026-10-07-suggestions-review/proof/build-registry-check-a1.log`; the find and comment pages were fixed by removing the kit that needed a user instead, per Close.
- [x] Record the registry change per `changeset`. Proof: the changelog entry or the skill's skip reason. Closed: `apps/www/src/registry/changelog/entries/2026-10-07-fix-editor-kit-typing.mdx`, checked by `node tooling/scripts/generate-ui-changelog-entries.mjs --check`.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| The user ID in demos | A fixed demo user, as the working demos already do | A different user per demo | per-demo users |
| The check for a missing user | None; the suggestions plan's local user default removes the failure | Add a check in this fix | check now |
| The find and comment docs | Remove the kit that needs a user, because neither page is about suggestions or AI | Add a user to them as well | add users to docs |

## Close

**Reversal.** Phase 1 of `docs/plans/2026-10-07-suggestions-review.md` reversed this fix's mechanism on 2026-10-07. An editor without `userId` writes as the local user `'local'`, so that build removed the ten demo user IDs, the AI page's `userId` lines and its sentence that the editor rejects every edit without one, with the Chinese twin, and this fix's registry changelog entry. The find and comment page corrections and the Chinese code block repair stay. That plan's Chromium typing sweep over the same routes is the reversal's proof.

**Deviation.** The plan said every broken docs setup would gain a user. Two did not. The English comment example said it uses comments without suggestions yet installed `SuggestionKit`, so the fix removed that kit and aligned the Chinese twin, which had used the whole `EditorKit`. The find setup now shows `FindKit` beside an `// ...otherPlugins` placeholder, because a feature page leads with its own kit. The three AI setups pass `userId`, with one sentence on why.

**What landed.** Ten `userId: 'demo'` lines in nine registry examples (`editor-default`, `editor-full-width`, `find-demo`, `code-drawing-demo`, `excalidraw-demo`, `tabbable-demo`, `table-nomerge-demo`, two editors in `editable-voids-demo`, `markdown-to-editor-demo`); `find.mdx`, `ai.mdx`, `comment.mdx` and their Chinese twins; a registry changelog entry; regenerated registry output.

**Proof.** In Chromium against `next dev`, the base tree fails the find spec and the six sweep routes that reach the editor because typed text never reaches the model, while `tabbable-demo` and `editable-voids-demo` fail earlier, before any typing (`typing-sweep-base-a3.log`). The fixed tree passes the find spec and six sweep routes (`typing-sweep-fixed-a3.log`). The sweep reads the model through the browser harness after a key-by-key `type`; an earlier sweep that read DOM text passed at base, because the browser shows native insertion that the model rejected, so it was discarded (`typing-sweep-base-a1.log`). Lint, format and type-aware oxlint pass on the nine files, the registry and changelog checks are fresh, and `pnpm --filter www build:source` parses the edited pages.

**Limits.** `tabbable-demo` and `editable-voids-demo` show no editable root that the sweep's selector finds on their block route, in the base and fixed runs alike, so their repair rests on the shared cause and the identical one-line change, not a browser run. The docs pages were parsed but not opened in a browser. Apps outside this repository that copied a broken setup keep dropping typing until they add a user.

**Counts.** Four steps, all done.

**Open work.** The local user default that removes this failure, and the removal of these demo user IDs, are Phase 1 of `docs/plans/2026-10-07-suggestions-review.md`. owner: the lead, in this run. stop: that phase lands. Tracked in that plan.

The escape path stays open: `pnpm check` runs no browser spec over the copied examples, so a new example that cannot type passes CI. owner: zbeyens, who decides whether CI runs a typing smoke over registered examples. stop: that decision is recorded in `docs/plans/topics/suggestions.md` Open work. Tracked in that subject file.
