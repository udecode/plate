---
review_scopes: []
review_basis: []
work_kind: workflow
review_commit: bc28cccad4775bd5972c19b35c089c48377bf81a
---

# Research loop: one lookup, one repo list, write back to the area

Status: building: phase 2, with the compile readers running on Codex in the background
Topic: knowledge
Playbook: build

## Brief

### What will change?

Each research run checks what we know, reads only the repos that changed, searches once for new repos and writes findings to one page per area. The old plan's compile finishes in the background, and its phase 3 is cut.

### What could go wrong?

Fast mode skips the trial, so the playbook changes land unmeasured, though our last test scored lookup-first agents lowest. Compiled facts land with no second reader checking them.

## Teach

Research is how Plate learns from other projects before it designs or fixes something. Each run starts from nothing. It searches the whole repo, clones what it needs and commits seven log files, but rarely updates the page the next run reads. The lookup tool from the last knowledge plan works, yet research never calls it, and it only knows editor names.

Nothing records which repos we read, or at which commit. So a run rereads Tiptap from scratch, and nobody notices a new collaboration or virtualization library.

This plan makes research a loop. Each run starts with one lookup by area, scope or repo. It returns the area's pages, open sweep finds and each saved repo with the commit we last read. The run reads only what changed, plus new repos one short search finds. It writes findings to the area page and notes the commit it read. Plan, verdict, bug fix, perf and sweep use the same lookup.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| The old knowledge plan | Close it as replaced by this one; each leftover item is cut, handed to its owner or taken here | Keep it open beside this plan | keep the knowledge plan open | big |
| The old plan compile | Finish it: Codex reads the 142 unread batches in the background during the build, and the lead lands every batch without a second reader | Stop at the 4 batches already landed | stop the compile | big |
| Page layout | Pages stay in their per-project folders, and the lookup groups them by area | Move every page into one folder per area | move pages by area | big |
| Research beyond editors | Library families get folders like editors do, such as Yjs, Word file libraries, React runtime libraries and drawing tools | Keep research to editors | editors only | big |
| The old phase 3 trial | Cut it | Finish its 28 missing sessions and grade the old wiring | resume the old trial | small |
| The new loop's trial | Fast mode drops the fresh sessions it needs, so the playbook lines land now and the trial waits in Open work (look) | Run the trial before the playbook lines land | run the trial first | small |
| Area names | The 19 page names that three or more folders already share, plus drawing | A new list of areas | new area names | small |
| Saved repos | One list of saved repos; each kind of read keeps its own last-read commit where it is today | One file that holds every mark | one mark file | small |
| New repo search | Each new task or verdict that researches runs one search for repos the list lacks; no scheduled task | A monthly scheduled scan | monthly scan | small |
| Run notes | Each run keeps its notes in the ignored run folder; only the area page, the subject and the repo list are committed | Keep committing seven notes files per run | keep the run notes | small |
| Old runs and captures | They freeze in place, and the lookup still reads them | Remove them and point links at git history | remove the old runs | small |
| Knowledge check | Fix its 86 dead links and run it whenever knowledge files change | Leave it in the full check only | full check only | small |
| When the trial fails | The playbook lines revert, and the repo list and lookup stay | Keep the playbook lines anyway | keep the wiring | small |
| Old findings | Hand each group of the 102 old findings to the subject that owns it | Keep them all under knowledge | keep the findings here | small |
| Clone folder | New clones go next to the plate repo, as the repo rules already say; old clones stay put and the list records where | Move every clone into one folder | move the clones | detail |
| Compile tools | Delete the five compile commands once the last batch lands | Keep them for a later compile | keep the compile tools | detail |
| Search time | 10 minutes for the new repo search in each task or verdict | 20 minutes | longer search | detail |
| Skipped repos | The repo list also records repos a search showed and research skipped, so the next search hides them | Show every unsaved repo each time | show skipped repos | detail |
| Shared source | The loop stays in this repo's research rule until the trial passes | Send a generic loop to the shared pstack source now | share the loop now | detail |
| Lookup speed | Two seconds for area, scope and repo lookups; broad word searches may take up to 3.3 seconds | Two seconds for every lookup | two seconds everywhere | detail |

## What other editors do

The prior art for this plan is workflows, in pstack and in this repository, not editors.

| Source | What it does | What this plan takes |
| --- | --- | --- |
| pstack's Investigation playbook (`how`, `why`) | Answers each question fresh from code and history, with no memory across runs | Keeps `how` and `why` for our own code; the loop adds the cross-run memory pstack lacks |
| pstack's `show-me-your-work` | One decision log per run, kept local unless stakes need it | Run state stays per run, in the ignored run directory |
| `verify`'s inventory rule | Derives every feature inventory from its code owner and forbids a second feature map | `areas.tsv` holds names, aliases, scopes and search seeds, never coverage counts |
| The review ledger | Stores the commit a review read and derives freshness from it | The repo list stores no mark; `kb` derives each lane's last-read commit from the owner that already records it |
| `docs/editor-audits/index.json` | Keeps per-repo audit and harvest commits | Becomes one lane the repo card reads |
| `research harvest --since <commit>` | Reads only the commits after the last harvest | The model for every update-only read |

## Layer and owner

| Delta | Knowledge job | Owner | Read by | Written by |
| --- | --- | --- | --- | --- |
| changed | External-editor evidence | the same homes, joined across homes by area; `docs/research/areas.tsv` names each area with its aliases, review scopes and search seeds; a home is an editor or a library family, such as Yjs, Word file libraries, React runtime libraries or drawing tools; new clones go to `../<repo>` | `pnpm kb <area>`, `<scope>` or `<repo>` at the first step of research, Plan, Verdict, Bug fix, Perf issue, `best-api` and sweep's gap move | research's write-back step, and sweep's accepted gaps |
| added | Repo registry | `docs/research/repos.tsv`: one row per repo research saved or skipped, with its URL, clone path, kind, status and areas; each lane's last-read commit stays with its owner, and `kb` derives it | `pnpm kb`, research's registry step, `kb discover` | research's write-back step |
| added | Repo discovery | `pnpm kb discover <area>`, which searches GitHub by the area's seeds and prints the repos `repos.tsv` lacks; research's registry step runs it once per new task or verdict, within 10 minutes | research's registry step, at the first step of Plan and Verdict | research's write-back step, which records each repo it saved or skipped |
| changed | Source inventory | `docs/research/homes.tsv` maps each page a reader homed; `kb homes` derives the rest from the path | `kb homes` and its K14 no-home check | research's write-back step for each new page |
| changed | Run evidence | run state in the ignored `docs/plans/artifacts/<slug>/`; `docs/plite/research`, `docs/research/probes` and `docs/research/raw` frozen and read by path | records and plans by path, `pnpm kb` | research, benchmark |
| changed | Knowledge checks and tool | `pnpm kb` with the lookup, `check`, `gaps`, `homes` and `discover`; the compile verbs are gone once the last batch lands; K16 checks the repo list and the area list; a new file in a frozen folder fails `kb check` | `pnpm check --affected` whenever a knowledge path changes, and every lookup caller above | the knowledge module's owner |

## Main changes

- `pnpm kb` resolves an area id or alias from `areas.tsv`, a review scope through the areas that name it, and a repo name from `repos.tsv`. An area card lists that area's page in every home, the scope's subject, open sweep finds, upstream issues, harvested tests and each repo filed under the area. A repo card shows the clone path, its areas and each lane's last-read commit: the audit and harvest commits from `docs/editor-audits/index.json` and the harvest indexes, and the newest `<repo>@<sha>` an area page cites. It also counts the local commits since each mark. The write-back footer names the area page and `repos.tsv` instead of a dated run folder.
- `tooling/scripts/knowledge/compile.mjs`, its test and `kb`'s `fold`, `write`, `resolve`, `quote` and `pins` verbs are removed once the last compile batch lands, with K15 and `docs/research/folded.tsv`. The compile is their last user.
- The `knowledge` step of `pnpm check` runs under `--affected` when a path under `docs/research/`, `docs/editor-behavior/`, `docs/plans/topics/` or `tooling/scripts/knowledge/` changes, instead of only in a full check.
- `pnpm kb discover <area>` is new. It runs `gh search repos` with the area's seeds, drops every repo `repos.tsv` lists, saved or skipped, and prints the rest. It stops at its time limit and says so.

## Outcome

An agent that researches a feature, a fix or a performance question starts from what Plate already knows and spends its reads on what changed. `pnpm kb <area>`, `<scope>` or `<repo>` answers in 2 seconds or less. Research's Pick step starts there, and each research run ends by writing to the area page and the repo list. Plan, Verdict, Bug fix, Perf issue, `best-api` and sweep's gap move call the same lookup. Each new task or verdict that researches runs one search, of at most 10 minutes, for repos the list lacks, editors or not. The 159 remaining compile batches land in their homes. `pnpm kb check` passes and runs whenever knowledge files change.

## Scope

In scope: `.agents/rules/research.mdc` and its `editor-audit.md` and `test-harvest.md` references, `.agents/rules/issue-harvester.mdc`'s clone line, `docs/research/schema.md`, the new `docs/research/repos.tsv` and `docs/research/areas.tsv`, new library-family homes under `docs/research/sources/`, `tooling/scripts/knowledge/`, the `knowledge` step in `tooling/scripts/check.mjs`, one line each in the Plan, Verdict, Bug fix and Perf issue playbooks, `.agents/rules/best-api.mdc`, `verify`'s sweep reference, the writers into `docs/research/probes`, and the superseded plan's 159 uncompiled batches with the homes they write.

Out of scope: moving existing pages, plans newer than the compile's snapshot, the 102 old findings (handed to their owners in step 1.1), behavior law fields, and the Word test documents, which stay under the `documents` subject.

## Decisions

- Transpose at read time, not on disk. The 19 area names that three or more homes share already join pages across homes, so `kb` groups by area without moving 229 pages or repointing their citations.
- The repo list holds identity and pointers only. Three owners already record last-read commits (the audit index, the test harvests and the issue harvests). A fourth copy would drift, so `kb` derives each mark, and research's own mark is the newest `<repo>@<sha>` its area page cites.
- Run state is run evidence. The seven per-run TSVs become ignored run files. `review-ledger.mjs research` keeps reading the frozen ones.
- The superseded plan's phase 3 graded wiring lines for a card this plan changes, so its trial is cut. Step 3.4's smaller paired trial on the new loop needs fresh sessions, which fast mode drops, so it waits in Open work and the playbook lines land unmeasured.
- Search for new repos when a task starts, not on a schedule. A monthly report sits unread until some task asks about its area, while a search at the task's start answers the question being asked. `repos.tsv` records the repos a search showed and research skipped, so the next search shows only new ones.
- Each phase is worth keeping without the next. Phase 1 turns a red check green. Phase 2 gives a human or agent the area and repo lookup even if no playbook calls it. Phase 3 wires it in. Phase 4 lands the compile, whose Codex readers run in the background from the start, and then deletes the compile tools.

## Steps

The execution playbook is Build, run fast: no subagents, panels or review seats, except the compile's Codex readers. Execution authority is your "build the rest after finishing the compile (FAST mode)" and "1), but dont wait for all of it, do it as background job while doing all the rest" (2026-10-25). Load `verify` before any proof below. The base controls run in this worktree before its first build edit, because no other session writes here.

### Phase 1: go green

Exit: every leftover of the superseded plan has one owner, and the knowledge check passes and runs on affected paths. Keep the phase. Revert only the check wiring if it fails a change that touches no knowledge path.

- [x] 1.1 Hand off the superseded plan's 44 open items as the Old plan triage table below says. Write each "carry" line into the named subject's `## Open work` with its owner and stop, record each "cut" with its reason as a decision-log row, and leave each "take" to the step it names. Proof: the lead matches each of the 44 items to one table row and finds each carried line in its subject file with `git grep -F`.
- [x] 1.2 Stop new committed run captures. Point every writer into `docs/research/probes` at the ignored run directory, starting with the receipt path that `markdown-streaming-contract.spec.ts` names and the commits that swept captures in on 2026-10-11, 2026-10-16 and 2026-10-18, and change research's raw-notes line the same way. The existing captures stay. Proof: one run of each writer leaves `git status` clean under `docs/research/probes`.
- [x] 1.3 Freeze `docs/plite/research` and `docs/research/probes`. Research stops writing there, `kb` keeps reading them, and a new rule in `kb check` fails on a file added under either folder after the freeze commit. Proof: a seeded new file fails `kb check` with the rule's text, and removing it passes.
- [x] 1.4 Make the knowledge check green. Repoint each of the 86 K7 findings to `<commit>:<path>` at the last commit that held the file, or narrow its claim when no commit does, then run `kb check --lower` so the baseline keeps only entries the tree still holds. Then change the `knowledge` step from `affected: never` to the knowledge paths in Main changes. Proof: `pnpm kb check` exits 0, and two logs show `pnpm check --affected` running the step for a change under `docs/research/` and skipping it for a change under `packages/`.
- [x] 1.5 One clone rule. `research.mdc`, `test-harvest.md`, `editor-audit.md` and `issue-harvester.mdc` send new clones to `../<repo>`, as `AGENTS.md` says, and keep `../raw` for bulk corpora and its log. Proof: `git grep -n '\.\./raw' -- .agents` names only corpus lines, and `pnpm run prepare` with `sync-resources.mjs --check` passes.

### Phase 2: the repo list, the areas and the lookup

Exit: `pnpm kb` answers area, scope and repo keys in 2 seconds or less with derived marks, and K16 guards both lists. Keep the phase, or move the new keys behind their own verb if they slow the existing keys.

- [ ] 2.1 Seed `docs/research/repos.tsv` with a script in `tooling/scripts/knowledge/`. Columns: `repo` (owner/name), `url`, `clone` (relative to the plate root, such as `../tiptap`), `kind` (editor, library or app), `status` (saved or skipped), `areas` (area ids), `added` and `note`. Its inputs are the 18 per-run `repo-registry.tsv` files, `docs/editor-audits/index.json`, the harvester folders, the `../<name>` paths research pages cite, and the git clones in `..` and `../raw`. Proof: a second run writes no change, each editor home has its repo rows, and the lead checks 20 sampled rows against the clones on disk.
- [ ] 2.2 Write `docs/research/areas.tsv` with `area`, `title`, `scopes` (review-scope ids), `aliases` and `seeds` (search phrases for `kb discover`). Seed the 19 shared page names and `drawing`, and map each to its review scopes, such as `collaboration` to `collaboration`, `large-documents` to `large-documents` and `performance`, and `conversion-and-export` to `documents`, `imports` and `exports`. Add the first library-family homes with a README each: Word file libraries (absorbing `docs/research/sources/docx-interoperability-oss.md`), React runtime libraries and drawing tools; `yjs-collaboration` stays the Yjs family home. Proof: every `scopes` id resolves in `docs/research/review-scopes/`, and each new home passes K14.
- [ ] 2.3 Extend `kb` as Main changes says: area, scope and repo keys, derived marks with local commit counts, the new write-back footer, and the harvest revision that `kb tiptap` shows today as `tiptap@?`. Fix the two deferred findings in code this step rewrites: `kb check` printing new findings twice, and malformed research rows vanishing from the card. Proof: a `knowledge.test.mjs` case per key kind, with one must-pass and one must-refuse fixture each; a timing log of ten area, scope and repo keys, each 2 seconds or less; and `kb tiptap` naming a commit.
- [ ] 2.4 Add K16. It fails on a duplicate repo, an unknown kind or status, an area id that `areas.tsv` lacks, a `scopes` id with no scope file, and a home README that names a repo the list lacks. Proof: one seeded failing case per form fails with its text, and `pnpm kb check` passes on the tree.

### Phase 3: wire the loop in

Exit: research and each consumer call the lookup, and `kb discover` works. When the trial in Open work later fails, revert steps 3.1 and 3.2 to their text before this phase and keep the rest.

- [ ] 3.1 Rewrite `research.mdc`'s run method as the loop. Pick runs `pnpm kb <area>`, `<scope>` or `<repo>` first, then picks the gap. The registry step takes the area's rows in `repos.tsv`, one `pnpm kb discover <area>` search of at most 10 minutes and any library family the question needs. It adds each repo it reads as `saved` and each it skips as `skipped`, with the reason. Reads are update-only: a repo with a mark reads `git log <mark>..HEAD` over the area's paths first, and an unread repo gets one bounded first read. Queries, leads, reads and rejections go to the ignored run directory instead of seven committed TSVs. Write-back puts findings on the area page with `<repo>@<sha>` evidence, the conclusion in the scope's subject file, and new rows in `repos.tsv`. The editor-audit, harvest and maintain modes keep their method. Update `docs/research/schema.md`'s Reuse research section to match. Proof: `pnpm run prepare` and `sync-resources.mjs --check` pass, and the lead reads the rewritten method against this step.
- [ ] 3.2 Add one line at the first step of each consumer: Plan's What other editors do, Verdict's prior art, Bug fix's binary search (the area card already lists its `plate-notes` lessons), Perf issue's `how` step, `best-api`'s prior art, and sweep's gap move, which reads the area card and writes each accepted gap to the area page. Plan's and Verdict's lines also run one `kb discover` search, because those start new tasks. Proof: `check-playbooks.mjs` passes, and `pnpm run prepare` and `sync-resources.mjs --check` pass.
- [ ] 3.3 Build `kb discover`. For an area, it runs `gh search repos` with each seed, sorted by stars, drops every repo `repos.tsv` lists, and prints the rest with stars, last push and description. It stops at its time limit and says so. Proof: one run per seeded area prints at least one repo the list lacks or names the area that had none, a rerun after those repos are recorded as skipped prints none of them, and a run with a short limit stops and says so.
- [ ] 3.4 Waits in Open work, because fast mode drops the fresh sessions it needs. Run the trial and the smokes. A reader the lead never sees writes four questions, one each for collaboration, Word files, virtualization and tables, and the keys a complete answer cites from current pages and repos. Arm A runs today's rules at this plan's base, and arm B runs the built loop, two fresh read-only Claude sessions per question and arm, graded by a separate grader. B keeps phase 3 when its total is at least A's and no question drops more than one key. Then send one plain request per changed route (research, Plan, Verdict, Bug fix, Perf issue and sweep triage) and an adjacent one that should stay outside research, such as "how does our table plugin work", and read each transcript for the lookup call and the write-back. Proof: the grader's score table and the transcript notes in the decision log.

### Phase 4: finish the compile

The readers started on 2026-10-25 and run in chunks of under an hour in the background during phases 1 to 3. Exit: all 163 batches are resolved and landed, the quote check and `kb check` pass, and the compile tools are gone.

- [ ] 4.1 Read the 142 unread batches, p5-022 to p5-163, on Codex with the superseded plan's phase 5 brief, through `compile-first.mjs` in this plan's run directory, which resumes where it stopped. A failed batch reruns once. Proof: every batch folder holds an `answer.md` with a units block.
- [ ] 4.2 Land every answered batch from p5-005 on without a second reader. Merge its units, run `unslop` on the added ones, resolve it, write it with `kb write`, and pass the quote check and `kb check`. Batches land in groups, one commit per group. Proof: each batch's resolved file covers every source line, and `kb check` passes after each group.
- [ ] 4.3 Delete `compile.mjs`, `compile.test.mjs`, `kb`'s `fold`, `write`, `resolve`, `quote` and `pins` verbs, K15 and `docs/research/folded.tsv`. Proof: `git grep -nE 'kb (fold|write|resolve|quote|pins)|compile\.mjs|folded\.tsv'` outside dated plans prints nothing, `knowledge.test.mjs` passes, and `kb check` prints the same findings before and after the delete.

## Proof

Each step names its proof. Base controls ran on 2026-10-24, and the decision log cites their logs. `kb check` exits 1 with 86 K7 findings. `kb collaboration` reads the key as plain words and takes 2.4 seconds. `kb tiptap` resolves the editor but shows its harvest revision as unknown, and its write-back footer still names a dated run folder. Before the first build edit, step 1.4's affected-step log and step 2.3's must-refuse fixtures run once at base in this worktree; step 4.3's grep runs at base before its delete. Fast mode skips the diff panel the push row would owe, and each commit ends with "Shipped fast, no review."

## Completion Gates

| Gate | Evidence |
| --- | --- |
| `thermos` per slice | skip: fast mode drops subagents |
| Panel on the diff (reviews: push) | skip: fast mode |
| `blast-radius`, `best-api repair` | skip: no public API changes |
| `plate-docs` | skip: no public docs page changes |
| Hand drive and playtest | skip: nothing a browser shows changes |
| `changeset` | skip: no published package changes |
| `benchmark` rerun | skip: no product path changes; step 2.3 logs the lookup's own timing |
| `deslop` | pending |
| `no-comments` | skip: fast |
| `unslop` | pending |

## Old plan triage

The superseded plan's 44 open items, each with one call. A "carry" moves to the named subject's Open work in step 1.1; a "take" names the step here that does it.

| Item | Call | Goes to | Why |
| --- | --- | --- | --- |
| Retirement check with A and B arms | cut | none | No store waits for retirement, and a retired file still opens from git at its commit. |
| Batches p5-005 to p5-163 | take | phase 4 | You chose to finish the compile on 2026-10-25. |
| Compile sweep of plans from 2026-09-23 on | cut | none | The review ledger indexes those plans by scope, so research reads them when their area comes up. |
| Replace the 15 Word test documents copied from pandoc | carry | `documents` | You answered "Replace them" on 2026-10-09; it belongs with DOCX import. |
| Phase 3 trial (80 of 108 sessions) | cut | step 3.4 | It grades wiring for the card this plan changes. |
| Combined diff panel on `foldSource`, the writer fix, scope-file moves and fold rows | cut | steps 4.3 and 3.1 | Step 4.3 deletes that code and step 3.1 rewrites the writer line. |
| Per-home navigation checks | cut | step 3.4 | The trial measures whether agents reach the pages. |
| Runs under `docs/plite/research` with no `homes.tsv` row | take | step 1.3 | The folder freezes, so no new run needs a row. |
| Discovery trial harness at the commit before each key's plan | cut | none | Step 3.4's keys come from current pages, so finding them is the success it measures. |
| Slate ledger reads an ignored `.tmp` corpus | carry | `knowledge` | It is a knowledge store's input. |
| Rule field lines with K2 and K3 | cut | none | No plan picked them up in 17 days, and test-title tags already join rules to tests. |
| Spec drift in five families, ⌫ after media, the task-Enter rule and three law-versus-test disagreements | carry | `editing` | Each is a behavior-law call or a Bug fix. |
| Code defects: suggestion preview drops inline elements, mention deletion untested | carry | `suggestions` | Found 2026-10-08 and unverified since. |
| Code defects: two hotkey matchers, wildcard re-exports, templates importing `normalizeStaticValue` | carry | `distribution` | Public entrypoint and template hygiene. |
| Provenance script for 824 dead issue-to-test locations | cut | none | Issue rows still show in the lookup, and nothing reads the dead test paths. |
| Committed benchmark value history | carry | `performance` | It needs a plan under the `benchmark` skill. |
| Scope decision page status lines | cut | none | The docs one-home plan retired the decision pages on 2026-10-17. |
| K6, K9, K11 and K13 | cut | none | They came from phases the old plan rewrote, and none has a failing case today. |
| Probe captures landing through commits | take | step 1.2 | Step 1.2 points the only writer, research's raw-notes line, at the run directory. |
| Reflect patches and reflect Backlog | carry | `pstack` | Workflow lessons belong to the workflow subject; their 2026-11-06 drop date carries. |
| Two Android IME bugs as local drafts | carry | `native` | They file through `maintainer`'s issue-draft mode. |
| `pnpm check knowledge` failing | take | step 1.4 | It now fails on 86 lines. |
| Deferred review findings: double printing, vanishing malformed rows | take | step 2.3 | Step 2.3 rewrites that code. |
| Deferred review findings: K0 formats, K7 link forms, node:test skips, copied runner policy, `knowledge.mjs` size, `candidates.md:201` | carry | `knowledge` | No failing case today; each waits for the next change to its code. |
| Broad query time of 1.8 to 3.3 seconds | take | step 2.3 | Area, scope and repo keys get the 2-second limit; broad words keep the measured time. |
| Empty `PLATE_BASELINE_BASE` on dispatch runs | carry | `proof` | CI baseline wiring. |
| Ten tests missing a caret assertion | cut | none | `pnpm kb gaps` already lists them. |
| `kb gaps` treats any conditional skip as not running | carry | `knowledge` | A known limit of the scanner. |
| `finding-baseline.mjs` growth check | carry | `knowledge` | A shared check helper. |
| `kb fold` and `kb resolve` edge cases | cut | step 4.3 | The verbs are deleted after the compile. |
| 331 K7 baseline entries | take | step 1.4 | `kb check --lower` drops entries the tree no longer holds. |
| Phase 4 side findings | carry | owning subjects | Grouped with the 102 findings below. |
| Lesson index guard patch | cut | step 4.3 | It guards indented and fenced lessons, which the compile's appends never write, and step 4.3 deletes `kb write`. |
| 102 findings: Plate features and UI (23) | carry | `ui` | |
| 102 findings: plitejs runtime (15) | carry | `runtime` | |
| 102 findings: tests (11), and proof and release tooling (10) | carry | `proof` | |
| 102 findings: behavior law and Vision (11) | carry | `editing` | |
| 102 findings: public docs (9), issue harvests (9), research and subject pages (8) | carry | `knowledge` | Docs fixes run through `plate-docs`, page fixes through research's maintain mode. |
| 102 findings: benchmarks (5) | carry | `performance` | |
| 102 findings: refactoring (1) | carry | `editor-public-naming` | Stale Plite names in comments. |

## Alternatives rejected

- Move every page into one folder per area. It repoints hundreds of citations for a join that `kb` gives at read time.
- One file of every repo's marks. Three owners already store them, and a copy would drift.
- An area map with coverage counts. `verify` forbids a second feature map, and the lookup derives what exists.
- Resume the old phase 3 trial. It grades lines this plan rewrites.
- A monthly scheduled scan. Its report waits unread until some task asks about the area, and a search at the task's start answers the question being asked.

## Open work

- Step 3.4's paired trial and route smokes. Fast mode drops the fresh sessions they need, so the playbook lines land unmeasured. owner: Ziad. stop: you start the trial as its own task, or say the wiring stays. Tracked here.
- Send a generic version of the loop (a repo list with derived marks, an area join and write-back) to the shared pstack source. owner: Ziad. stop: step 3.4's trial passes, or this plan closes without it. Tracked here.
- Areas that only one or two homes use today join `areas.tsv` when a run writes them. owner: Ziad. stop: K16 reports none missing. Tracked here.
- Slate's ledger rebuild, `classify-delta.mjs`, reads an ignored corpus under `.tmp/editor-issue-harvester/slate/raw/`, so an assessment written into the script survives only while that corpus exists on the machine that rebuilds it. owner: Ziad. stop: the corpus or its decisions move into a tracked input, or the Slate ledger is retired. Carried from the superseded knowledge plan.
- Deferred review findings in the knowledge tool: K0 counts depend on recognizing a harvest's format; K7 skips reference-style links, untracked citing files and unstaged deletions; the scanner does not read node:test's `{ skip }` option or `t.skip()`; `kb` copies the runners' selection policy; `knowledge.mjs` mixes seven concerns; and `candidates.md:201` calls an existing file retired. owner: Ziad. stop: each is fixed or dropped at the next change to its code. Carried from the superseded knowledge plan.
- `kb gaps` counts a test with any conditional skip as not running, so a tag on a Plite browser test that skips only on the mobile project still leaves its rule a gap. owner: Ziad. stop: the first such tag lands, or the scanner evaluates project-name conditions. Carried from the superseded knowledge plan.
- `finding-baseline.mjs` skips the growth check for any rule its base copy lacks, for every baseline that uses it. owner: Ziad. stop: the shared helper bounds a new rule by the base's findings. Carried from the superseded knowledge plan.
- The superseded plan's compile readers found 26 problems in public docs (9), issue harvests (9) and research and subject pages (8), such as stale `Element`, `Path` and `Node` type listings and decision pages listing parser APIs that were cut. Each is an open `finding` row in that plan's decision log. owner: Ziad. stop: docs fixes run through `plate-docs`, page fixes through research's maintain mode, or each is dropped, or 2026-12-07. Carried from the superseded knowledge plan.
