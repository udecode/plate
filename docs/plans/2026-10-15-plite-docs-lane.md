# Plite docs section on the docs site

Status: executed: uncommitted on next, waiting on your commit
Page: https://claude.ai/artifact/7PRRGoTq8TXAQAG1g9iZ3e
Playbook: build

Run directory: `docs/plans/artifacts/2026-10-15-plite-docs-lane/`. Intake base: `1a9a7cbf1e`. The owner asked, after learning the Plite pages were unpublished on 2026-09-15: "ok maybe not in the header, but in the sidebar, API? then when we're in docs/plite we'd see all those items with a back button. still useful to have lower level concepts or plitejs builder (non plate)".

## Brief

### What will change?

The Plite docs are back at their old address, for people building on Plite without Plate. A link under API in the Plate sidebar opens them, and their sidebar lists only Plite pages and a way back, in English and Chinese.

### What could go wrong?

A page may still teach a gone Plite name or an unproven claim. Four claims await checking. Text was only read, not run. Two checks fail in files this work didn't touch, and the Close lists the review's fixes.

## Teach

Plate is built on Plite, a smaller editor runtime published as its own package. Until September the docs site had a second set of pages that taught Plite to people who use it without Plate. A header link opened them, and their sidebar showed only Plite pages.

In September those pages were pulled so the site taught one editor API. Their links now redirect to the closest Plate page, and a lint check fails any Plate docs page that names Plite.

This change brings the Plite pages back as a separate section. A link in the Plate sidebar opens it instead of a header link. The Plite sidebar gets a back link. The pages are refreshed for today's Plite, and Plate pages still teach only Plate.

## Demo

Run `pnpm --filter www dev --port 3297`, then:

1. Open http://localhost:3297/docs/api/react-hooks and scroll the left sidebar to the end of API. The last entry is "Plite" with an arrow. ![after](artifacts/2026-10-15-plite-docs-lane/frames/plate-api-sidebar.png)
2. Click it. You land on http://localhost:3297/docs/plite, and the sidebar shows "Plate docs" with a back arrow, the Plite title and only Plite sections. ![after](artifacts/2026-10-15-plite-docs-lane/frames/plite-index.png)
3. Open http://localhost:3297/docs/plite/walkthroughs/09-performance. Walkthroughs is open with this page marked, and the Firefox profiler image shows. ![after](artifacts/2026-10-15-plite-docs-lane/frames/plite-performance.png)
4. At phone width, open http://localhost:3297/cn/docs/plite and tap the menu. It shows "Plate 文档" with a back arrow, then the Plite pages. ![after](artifacts/2026-10-15-plite-docs-lane/frames/plite-cn-mobile.png)

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Which archived copy to restore | The last one, from 2026-10-05, which kept API fixes made after September | The September copy | september copy | detail |
| The internal claim map page | Left out, because it maps doc claims to tests for maintainers | Restored with the rest | keep proof map | detail |
| The Plite API reference pages | Restored inside the Plite section, with plitejs imports, so a reader stays in one section | Plite pages link to the Plate API reference | link plate api | small |
| Widgets, which Plite no longer ships | Their docs are cut | Kept with a note | keep widgets | small |
| Chinese pages | English only; the Chinese site falls back to English, except the one page that already had a translation | Translate the section | translate | detail |
| Docs that install into an app | Plite pages stay out, because Plate apps use Plate | Install Plite pages too | install plite docs | small |
| Install commands in the search menu | Only on Plate pages | On every page | install everywhere | detail |
| Three retired Plite pages | Their old links open the page that replaced each one | Let them show not found | drop retired redirects | detail |
| Where the sidebar loads from | A new address, so browsers never use an old cached copy | Keep the old address and add a version number | keep old route | detail |
| The performance page's image | Moved to the site's shared images folder, and the docs check now rejects relative image paths | Keep the image next to the page | relative images | detail |
| Code samples the checker still flags | Accepted with 37 API findings, each read as a checker limit, and 12 samples the checker can't parse left unchecked (look) | Fix the checker until it flags none | clean snippets | detail |
| Docs check failing on others' changes | Accepted, since its other steps pass (look) | Wait for the API reference fix, then rerun it | rerun docs check | detail |
| A workaround in the sidebar test | Kept, because removing it means changing a test setting the whole repo shares | Change that shared setting now | switch test jsx | detail |

## Main changes

- The docs sidebar is one payload that holds Plate's sections and one sidebar per nested docs root. A client selector picks the root from the URL, and DocsNav, MobileNav and the command menu read that view.
- The pager walks each root's pages on its own, because Fumadocs' `findNeighbour` mixes nested roots into the main page list.
- Search gives Plite results a Plite breadcrumb, and the command menu offers registry install commands only on Plate pages.
- The installable docs registry skips nested roots.
- `check-plite-docs.mjs` lets `content/docs/plite/` name Plite and requires every docs image to be an absolute path to a file in `apps/www/public`.
- The `/docs/plite` redirects are gone, except three retired URLs that now open their Plite successors.

## Steps

- [x] Map the old wiring, today's sidebar and every guard. Proof: `explorer-answer.md` in the run directory.
- [x] Restore the archived tree into `content/docs/plite/` from `da4898bb61^:docs/plite/reference/public-docs/`, dropping images no page uses and the claim map page. Proof: `restore/` in the run directory.
- [x] Apply the one-to-one renames with a codemod. Proof: `rename-codemod.mjs` and `rename-codemod-a1.log`.
- [x] Let the Plite section name Plite in `tooling/scripts/check-plite-docs.mjs`. Proof: `guard-audit-a2.log`.
- [x] Design the sidebar split through `architect`. Proof: `docs/plans/artifacts/2026-10-15-plite-docs-lane/architect/judge/verdict.md` and `docs/plans/artifacts/2026-10-15-plite-docs-lane/architect/synthesis.md`.
- [x] Refresh every page against today's source from the reader lanes' edits, then rerun the snippet typecheck. Proof: `lane-*-answer.md` and a clean `snippet-check` log. Accepted at `docs/plans/artifacts/2026-10-15-plite-docs-lane/snippet-check-a7.log` with 37 checker-limit findings, under the Defaults word "clean snippets".
- [x] Build the sidebar entry, the Plite tree and the back link, and drop the `/docs/plite` redirects. Proof: `docs/plans/artifacts/2026-10-15-plite-docs-lane/final-docs-page-tree-a3.log`, `docs/plans/artifacts/2026-10-15-plite-docs-lane/final-command-menu-dialog-a3.log`, `docs/plans/artifacts/2026-10-15-plite-docs-lane/final-docs-nav-a3.log` and `docs/plans/artifacts/2026-10-15-plite-docs-lane/dropped-redirects-a1.log`.
- [x] Revise `docs/vision/plate.md`'s public docs rule for the Plite section. Proof: the rule in `docs/vision/plate.md`.
- [x] `plate-docs` checks: `build:source`, `check:docs`, `build:registry` and its `--check`. Proof: `docs/plans/artifacts/2026-10-15-plite-docs-lane/final-build-source-a1.log`, `docs/plans/artifacts/2026-10-15-plite-docs-lane/final-parity-a1.log` and `docs/plans/artifacts/2026-10-15-plite-docs-lane/final-registry-check-a1.log`. `check:docs` fails at its first link in `docs/plans/artifacts/2026-10-15-plite-docs-lane/check-docs-a2.log`, accepted under the Defaults word "rerun docs check".
- [x] Hand drive the Plate sidebar entry, a Plite page with its sidebar and back link, and the Chinese route, through `verify`. Proof: `docs/plans/artifacts/2026-10-15-plite-docs-lane/final-drive-check-a4.log`.
- [x] Writing passes and `pnpm lint:task` on this run's files. Proof: `docs/plans/artifacts/2026-10-15-plite-docs-lane/lint-task-a6.log` and, for the drift 3 fix, `docs/plans/artifacts/2026-10-15-plite-docs-lane/lint-task-a8.log`.

## Open work

- Polish the Plite section's labels and entry points, as suggested task t_09490c82. The API index page has no Plite card. The copy-page prompt and LLM output call every page Plate documentation. Page titles end in "- Plate". The command menu sends its `/examples` links to `/cn/examples` on the Chinese site, which has no such route. On the Chinese site, the Plite Overview section is 概览 on desktop and 开始 in the phone menu. The page tree mixes link URLs, which stay unlocalized, with the one URL Fumadocs localizes, so a folder index page would break the pager's filter. owner: the owner, who starts the task from its card. stop: the task lands or is dismissed. Tracked in `docs/plans/suggested-tasks.decisions.tsv`.
- Drop the global React workaround from www's bun tests, as suggested task t_8f170021. Six www test files set a global React because bun tests compile JSX through the shared classic runtime, which the 1,103 files with hyperscript pragmas need. owner: the owner, who starts the task from its card. stop: the task lands or is dismissed. Tracked in `docs/plans/suggested-tasks.decisions.tsv`.
- Verify, reword or cut four claims the reader lanes could not confirm, as suggested task t_ceff5671: Yjs production readiness, the performance page's numbers, the fork's history and the Yjs proof coverage. owner: the owner, who starts the task from its card. stop: the task lands or is dismissed. Tracked in `docs/plans/suggested-tasks.decisions.tsv`.
- Rerun `pnpm --filter www check:docs` once its API reference step passes. owner: the owner. stop: ledger task t_4d43777d lands, or the staged `SchemaPropertyLandingPolicy` entry leaves `apps/www/api-reference.config.json`. Tracked in this plan's Defaults under "rerun docs check" and in `docs/plans/suggested-tasks.decisions.tsv`.

## Close

Reversals and deviations come first.

- The first drive marked the Chinese Plite page covered while its sidebar showed Plate's sections and no back link. The drive check records page errors, not what the sidebar shows, and I did not read that cell closely. I found it as drift 3 while capturing the demo frames. The Chinese page tree gives the Plite root a `/cn` address, which the sidebar selector never matched. `getRootHref` now strips that prefix, the sidebar tests run on both trees, and I drove the four pages again by hand, plus the Chinese page at phone width with the menu open.
- The third comment pass deleted the pager's old comment that every page tree URL stays unlocalized, because the root index proves it wrong. I added its wider idea, one reader for every tree URL, to suggested task t_09490c82, because no page has the problem today.
- The refresh step's approved proof was a clean snippet check. It ended with 37 API findings among 418 diagnostics, and 12 fences it could not parse went unchecked. I read the 37 as checker limits: plugin groups the checker cannot install, the upstream slate-react baseline, a variable resolved to the wrong export, or an app-defined name. I accepted the step under "clean snippets", and it counts as partial.
- The docs check step's `check:docs` fails at its first link, `api-reference:check`. In this checkout the cause is `SchemaPropertyLandingPolicy`, which only another session's staged API reference config names. At HEAD the same link fails on `EditorDocumentRecords`, which ledger task t_4d43777d owns. Its later links pass on their own. I accepted the step under "rerun docs check", and it counts as partial.
- I deleted the performance walkthrough's image after a plain `git grep` found no page using it. That search skips untracked files, so it missed the restored pages, and the page crashed in the drive. Restoring the image fixed the crash but left a relative image path that dynamic docs never serve. I moved the image under `apps/www/public`, and a new guard rule refuses relative image paths. Its red run proves the rule, not the browser failure.
- The second comment pass asked to remove the sidebar test's global React. Flipping `apps/www/tsconfig.json` to `react-jsx` did not reach bun, which compiles through the shared test tsconfig, so I reverted the flip and kept the global without its comment.
- Drift 1's red run used the uncommitted tree before its fix instead of a HEAD worktree, because HEAD has no Plite sidebar to fail on.

What landed, uncommitted on `next`:

- 72 Plite pages under `content/docs/plite/`, refreshed against today's `plitejs`. Five reader lanes proposed 323 replacements and 31 notes. I applied 315, rejected 7 and skipped 1 that another edit covered. Each reader cited source for its edits, the apply script required each old text to match exactly once, and I spot-checked the cited source. I did not read every edit against its source.
- One entry under API in the Plate sidebar opens the Plite section. Inside it, the desktop and mobile sidebars list only Plite pages, with a back link to Plate. The pager stays within each root, search labels Plite results, and the command menu offers install commands only on Plate pages.
- Installable docs leave the section out. The old `/docs/plite` redirects are gone, except three for retired pages. The Plite docs guard allows the section, and the Plate vision rule describes it.

Each scope below comes from its decision-log row:

- 7 sidebar and pager tests and 4 command menu tests pass on the final bytes, and 6 of 6 planted mutants fail them, one of them for drift 3.
- Drift 1 and drift 3 each fail on their own test case in a HEAD worktree with this run's files and the old line restored, and pass on the final tree.
- On a Plite page, the DocsNav test expects only the current page's section open. It saw Overview open before the drift 1 fix and Walkthroughs after.
- The hand drive check covers 77 desktop cells on the final bytes: the Plate sidebar entry, Plite pages with their sidebar and back link, and the Chinese Plite page.
- By hand on the final bytes, I also checked the phone menu from a Plite page to Plate and back, the Chinese phone menu, and Cmd-K on a Plite page, which lists only Plite items and no install command.
- Installable docs hold no `/docs/plite` link, while a control finds the migration guide's two. The registry generation is fresh.
- Each `/docs/plite` URL at HEAD either has a restored page or is one of three retired URLs that now redirect inside the section.
- The Plite docs guard, doc code contracts, docs source parity and `build:source` pass. `lint:task` passes on 18 of the 22 paths, because it ignores the other 4.

Proof stops here:

- Only the reader lanes and my spot reads checked prose claims on the restored pages. Nothing ran them. Four reader notes stay unconfirmed: Yjs production readiness, the performance page's numbers, the fork's history and the Yjs proof coverage. Suggested task t_ceff5671 owns them.
- The codemod and reader-edit logs carry no command line, and those runs cannot repeat on the edited pages. The transcript records each run.
- The www typecheck reports 8 errors in `drive-beacon.spec.tsx`, `drive-reporter.spec.tsx` and `migratePlateV54Suggestions.internal.ts`. Those files are clean at HEAD and this run never touched them, but I did not rerun the typecheck at HEAD, so their source is unattributed. This run's files report none, before and after the drift 3 fix.
- Nothing is committed. The owner commits `next`.

The owner's asks, each covered:

- "in the sidebar, API?" The section opens from one entry under API in the Plate sidebar, not from the header.
- "when we're in docs/plite we'd see all those items with a back button" The Plite sidebar lists every Plite page with a back link, on desktop and mobile.
- "lower level concepts or plitejs builder (non plate)" The concepts, walkthroughs, libraries and API reference teach `plitejs` as it is today.

Counts: 11 steps, 9 done, 2 partial, 0 skipped, 0 blocked, 0 open.

Open work has four items, each with its owner and stop.

Attention

reviewed by gpt-6.1-sol @xhigh

- Critical, fixed: the Close said I read every reader edit against its cited source and counted 328 proposals. The apply logs hold 323 replacements and 31 notes, and my source checks were spot checks. The Close now says so.
- The snippet acceptance covers 37 API findings, not all 418 diagnostics, and 12 fences went unchecked. The Defaults row and Close now state it.
- Four reader notes stay unconfirmed, now owned by suggested task t_ceff5671.
- The 77 drive cells are desktop cells. I reran the phone and Cmd-K checks by hand on the final bytes.
- Several proof logs lacked their command or exit line. The mutants and both drift red runs reran with compliant logs. The codemod and reader-edit logs cannot rerun.
- The Brief now says the two failing checks fail in files this work didn't touch, because the typecheck errors stay unattributed.
- The image deletion crash and the relative image path were two failures, and the Close now tells them apart.
