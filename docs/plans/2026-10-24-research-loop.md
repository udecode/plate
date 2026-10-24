---
review_scopes: []
review_basis: []
work_kind: workflow
review_commit: bc28cccad4775bd5972c19b35c089c48377bf81a
---

# Research loop: one lookup, one repo list, write back to the area

Status: planning: plan only; "go research loop" builds it
Topic: knowledge
Playbook: plan

## Brief

### What will change?

Research becomes one loop that checks what we know, reads only repos that changed, writes findings to one page per area and looks for new repos monthly. The stale knowledge plan closes, with its phase 3 cut.

### What could go wrong?

In our last test, agents that used the lookup first did worst. This plan tests the new loop against today's rules and drops the playbook changes if it does worse. Stopping the old compile leaves 923 old plans unsummarized.

## Teach

Research is how Plate learns from other projects before it designs or fixes something. Each run starts from nothing. It searches the whole repo, clones what it needs and commits seven log files, but rarely updates the page the next run reads. The lookup tool from the last knowledge plan works, yet research never calls it, and it only knows editor names.

Nothing records which repos we read, or at which commit. So a run rereads Tiptap from scratch, and nobody notices a new collaboration or virtualization library.

This plan makes research a loop. Each run starts with one lookup by area, scope or repo. It returns the area's pages, open sweep finds and each saved repo with the commit we last read. The run reads only what changed, plus any repo the monthly scan found. It writes findings to the area page and notes the commit it read. Plan, verdict, bug fix, perf and sweep use the same lookup.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| The old knowledge plan | Close it as replaced by this one; each leftover item is cut, handed to its owner or taken here | Keep it open beside this plan | keep the knowledge plan open | big |
| The old plan compile | Stop at the 4 batches done; research reads an old plan only when its area comes up (look) | Compile the other 159 batches, about 70M tokens | finish the compile | big |
| Page layout | Pages stay in their per-project folders, and the lookup groups them by area | Move every page into one folder per area | move pages by area | big |
| Research beyond editors | Library families get folders like editors do, such as Yjs, Word file libraries, React runtime libraries and drawing tools | Keep research to editors | editors only | big |
| The old phase 3 trial | Cut it; this plan's smaller trial tests the new loop instead (look) | Finish its 28 missing sessions and grade the old wiring | resume the old trial | small |
| Area names | The 19 page names that three or more folders already share, plus drawing | A new list of areas | new area names | small |
| Saved repos | One list of saved repos; each kind of read keeps its own last-read commit where it is today | One file that holds every mark | one mark file | small |
| New repo scan | A monthly scheduled task runs the scan and suggests a research task when it finds something (look) | Run the scan by hand when research starts | scan by hand | small |
| Run notes | Each run keeps its notes in the ignored run folder; only the area page, the subject and the repo list are committed | Keep committing seven notes files per run | keep the run notes | small |
| Old runs and captures | They freeze in place, and the lookup still reads them | Remove them and point links at git history | remove the old runs | small |
| Knowledge check | Fix its 86 dead links and run it whenever knowledge files change | Leave it in the full check only | full check only | small |
| When the trial fails | The playbook lines revert, and the repo list and lookup stay | Keep the playbook lines anyway | keep the wiring | small |
| Old findings | Hand each group of the 102 old findings to the subject that owns it | Keep them all under knowledge | keep the findings here | small |
| Clone folder | New clones go next to the plate repo, as the repo rules already say; old clones stay put and the list records where | Move every clone into one folder | move the clones | detail |
| Compile tools | Delete the five compile commands only the old plan used | Keep them for a later compile | keep the compile tools | detail |
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
| added | Repo registry | `docs/research/repos.tsv`: one row per saved repo with its URL, clone path, kind and areas; each lane's last-read commit stays with its owner, and `kb` derives it | `pnpm kb`, research's registry step, the radar | research's write-back step, the radar |
| added | Discovery radar | `tooling/scripts/knowledge/radar.mjs`, run monthly by a scheduled task that suggests a research task when it finds new or moved repos | research's registry step | the radar, which also stamps each area's scan date |
| changed | Source inventory | `docs/research/homes.tsv` maps each page a reader homed; `kb homes` derives the rest from the path | `kb homes` and its K14 no-home check | research's write-back step for each new page |
| changed | Run evidence | run state in the ignored `docs/plans/artifacts/<slug>/`; `docs/plite/research` and `docs/research/probes` frozen and read by path | records and plans by path, `pnpm kb` | research, benchmark |
| changed | Knowledge checks and tool | `pnpm kb` with the lookup, `check`, `gaps` and `homes`; the compile verbs are gone; K16 checks the repo list and the area list; a new file in a frozen folder fails `kb check` | `pnpm check --affected` whenever a knowledge path changes, and every lookup caller above | the knowledge module's owner |

## Main changes

- `pnpm kb` resolves an area id or alias from `areas.tsv`, a review scope through the areas that name it, and a repo name from `repos.tsv`. An area card lists that area's page in every home, the scope's subject, open sweep finds, upstream issues, harvested tests and each repo filed under the area. A repo card shows the clone path, its areas and each lane's last-read commit: the audit and harvest commits from `docs/editor-audits/index.json` and the harvest indexes, and the newest `<repo>@<sha>` an area page cites. It also counts the local commits since each mark. The write-back footer names the area page and `repos.tsv` instead of a dated run folder.
- `tooling/scripts/knowledge/compile.mjs`, its test and `kb`'s `fold`, `write`, `resolve`, `quote` and `pins` verbs are removed, with K15 and `docs/research/folded.tsv`. Their last users were the superseded plan's compile phases.
- The `knowledge` step of `pnpm check` runs under `--affected` when a path under `docs/research/`, `docs/editor-behavior/`, `docs/plans/topics/` or `tooling/scripts/knowledge/` changes, instead of only in a full check.
- `tooling/scripts/knowledge/radar.mjs` is new. It searches GitHub by each area's seeds since the area's last scan date and reports the registry clones that moved.

## Outcome

An agent that researches a feature, a fix or a performance question starts from what Plate already knows and spends its reads on what changed. `pnpm kb <area>`, `<scope>` or `<repo>` answers in 2 seconds or less. Research's Pick step starts there, and each research run ends by writing to the area page and the repo list. Plan, Verdict, Bug fix, Perf issue, `best-api` and sweep's gap move call the same lookup. A monthly radar lists new and moved repos per area, editors or not. `pnpm kb check` passes and runs whenever knowledge files change.

## Scope

In scope: `.agents/rules/research.mdc` and its `editor-audit.md` and `test-harvest.md` references, `.agents/rules/issue-harvester.mdc`'s clone line, `docs/research/schema.md`, the new `docs/research/repos.tsv` and `docs/research/areas.tsv`, new library-family homes under `docs/research/sources/`, `tooling/scripts/knowledge/`, the `knowledge` step in `tooling/scripts/check.mjs`, one line each in the Plan, Verdict, Bug fix and Perf issue playbooks, `.agents/rules/best-api.mdc`, `verify`'s sweep reference, the writers into `docs/research/probes`, and one scheduled task.

Out of scope: moving existing pages, compiling legacy plans, the 102 old findings (handed to their owners in step 1.1), behavior law fields, and the Word test documents, which stay under the `documents` subject.

## Decisions

- Transpose at read time, not on disk. The 19 area names that three or more homes share already join pages across homes, so `kb` groups by area without moving 229 pages or repointing their citations.
- The repo list holds identity and pointers only. Three owners already record last-read commits (the audit index, the test harvests and the issue harvests). A fourth copy would drift, so `kb` derives each mark, and research's own mark is the newest `<repo>@<sha>` its area page cites.
- Run state is run evidence. The seven per-run TSVs become ignored run files. `review-ledger.mjs research` keeps reading the frozen ones.
- The superseded plan's phase 3 graded wiring lines for a card this plan changes, so its trial is cut. Step 3.4 runs a smaller paired trial on the new loop, because the last trial scored the lookup-first arm lowest and only a measured result can clear that.
- Each phase is worth keeping without the next. Phase 1 deletes dead code and turns a red check green. Phase 2 gives a human or agent the area and repo lookup even if no playbook calls it. Phase 3 wires it in only when its trial passes.

## Steps

The execution playbook is Build. Load `verify` before any proof below and before the base controls, which run in a detached worktree of this plan's base when the build starts.

### Phase 1: subtract and go green

Exit: every leftover of the superseded plan has one owner, the compile tools are gone, and the knowledge check passes and runs on affected paths. Keep the phase. Revert only the check wiring if it fails a change that touches no knowledge path.

- [ ] 1.1 Hand off the superseded plan's 44 open items as the Old plan triage table below says. Write each "carry" line into the named subject's `## Open work` with its owner and stop, record each "cut" with its reason as a decision-log row, and leave each "take" to the step it names. Proof: a second reader matches each of the 44 items to one table row and finds each carried line in its subject file with `git grep -F`.
- [ ] 1.2 Delete `compile.mjs`, `compile.test.mjs`, `kb`'s `fold`, `write`, `resolve`, `quote` and `pins` verbs, K15 and `docs/research/folded.tsv`. Proof: `git grep -nE 'kb (fold|write|resolve|quote|pins)|compile\.mjs|folded\.tsv'` outside dated plans prints nothing, `knowledge.test.mjs` passes, and `kb check` prints the same findings before and after the delete.
- [ ] 1.3 Stop new committed run captures. Point every writer into `docs/research/probes` at the ignored run directory, starting with the receipt path that `markdown-streaming-contract.spec.ts` names and the commits that swept captures in on 2026-10-11, 2026-10-16 and 2026-10-18, and change research's raw-notes line the same way. The existing captures stay. Proof: one run of each writer leaves `git status` clean under `docs/research/probes`.
- [ ] 1.4 Freeze `docs/plite/research` and `docs/research/probes`. Research stops writing there, `kb` keeps reading them, and a new rule in `kb check` fails on a file added under either folder after the freeze commit. Proof: a seeded new file fails `kb check` with the rule's text, and removing it passes.
- [ ] 1.5 Make the knowledge check green. Repoint each of the 86 K7 findings to `<commit>:<path>` at the last commit that held the file, or narrow its claim when no commit does, then run `kb check --lower` so the baseline keeps only entries the tree still holds. Then change the `knowledge` step from `affected: never` to the knowledge paths in Main changes. Proof: `pnpm kb check` exits 0, and two logs show `pnpm check --affected` running the step for a change under `docs/research/` and skipping it for a change under `packages/`.
- [ ] 1.6 One clone rule. `research.mdc`, `test-harvest.md`, `editor-audit.md` and `issue-harvester.mdc` send new clones to `../<repo>`, as `AGENTS.md` says, and keep `../raw` for bulk corpora and its log. Proof: `git grep -n '\.\./raw' -- .agents` names only corpus lines, and `pnpm run prepare` with `sync-resources.mjs --check` passes.

### Phase 2: the repo list, the areas and the lookup

Exit: `pnpm kb` answers area, scope and repo keys in 2 seconds or less with derived marks, and K16 guards both lists. Keep the phase, or move the new keys behind their own verb if they slow the existing keys.

- [ ] 2.1 Seed `docs/research/repos.tsv` with a script in `tooling/scripts/knowledge/`. Columns: `repo` (owner/name), `url`, `clone` (relative to the plate root, such as `../tiptap`), `kind` (editor, library or app), `areas` (area ids), `added` and `note`. Its inputs are the 18 per-run `repo-registry.tsv` files, `docs/editor-audits/index.json`, the harvester folders, the `../<name>` paths research pages cite, and the git clones in `..` and `../raw`. Proof: a second run writes no change, each editor home has its repo rows, and a second reader checks 20 sampled rows against the clones on disk.
- [ ] 2.2 Write `docs/research/areas.tsv` with `area`, `title`, `scopes` (review-scope ids), `aliases`, `seeds` (search phrases for the radar) and `scanned` (the last radar date). Seed the 19 shared page names and `drawing`, and map each to its review scopes, such as `collaboration` to `collaboration`, `large-documents` to `large-documents` and `performance`, and `conversion-and-export` to `documents`, `imports` and `exports`. Add the first library-family homes with a README each: Word file libraries (absorbing `docs/research/sources/docx-interoperability-oss.md`), React runtime libraries and drawing tools; `yjs-collaboration` stays the Yjs family home. Proof: every `scopes` id resolves in `docs/research/review-scopes/`, and each new home passes K14.
- [ ] 2.3 Extend `kb` as Main changes says: area, scope and repo keys, derived marks with local commit counts, the new write-back footer, and the harvest revision that `kb tiptap` shows today as `tiptap@?`. Fix the two deferred findings in code this step rewrites: `kb check` printing new findings twice, and malformed research rows vanishing from the card. Proof: a `knowledge.test.mjs` case per key kind, with one must-pass and one must-refuse fixture each; a timing log of ten area, scope and repo keys, each 2 seconds or less; and `kb tiptap` naming a commit.
- [ ] 2.4 Add K16. It fails on a duplicate repo, an unknown kind, an area id that `areas.tsv` lacks, a `scopes` id with no scope file, and a home README that names a repo the list lacks. Proof: one seeded failing case per form fails with its text, and `pnpm kb check` passes on the tree.

### Phase 3: wire the loop in

Exit: the trial in step 3.4 passes. Keep phase 3, or revert steps 3.1 and 3.2 to their text before this phase and keep phases 1 and 2.

- [ ] 3.1 Rewrite `research.mdc`'s run method as the loop. Pick runs `pnpm kb <area>`, `<scope>` or `<repo>` first, then picks the gap. The registry step takes the area's rows in `repos.tsv`, the radar's candidates since the area's `scanned` date and any library family the question needs, and adds each accepted repo. Reads are update-only: a repo with a mark reads `git log <mark>..HEAD` over the area's paths first, and an unread repo gets one bounded first read. Queries, leads, reads and rejections go to the ignored run directory instead of seven committed TSVs. Write-back puts findings on the area page with `<repo>@<sha>` evidence, the conclusion in the scope's subject file, and new rows in `repos.tsv`. The editor-audit, harvest and maintain modes keep their method. Update `docs/research/schema.md`'s Reuse research section to match. Proof: the workflow-change smokes in step 3.4.
- [ ] 3.2 Add one line at the first step of each consumer: Plan's What other editors do, Verdict's prior art, Bug fix's binary search (the area card already lists its `plate-notes` lessons), Perf issue's `how` step, `best-api`'s prior art, and sweep's gap move, which reads the area card and writes each accepted gap to the area page. Proof: `check-playbooks.mjs` passes, `pnpm run prepare` and `sync-resources.mjs --check` pass, and step 3.4's smokes.
- [ ] 3.3 Build the radar. For each area, it runs `gh search repos` with the area's seeds for repos created or pushed since its `scanned` date above a star floor, and fetches each registry clone to count its commits since research's mark. It writes its report to the run directory, prints only repos the list lacks or that moved, and stamps `scanned`. Then create a monthly scheduled task that runs it in a detached worktree of `origin/next` and suggests a "research radar" task when it prints anything. Proof: one run lists at least one recent repo per seeded area or names the area that had none, a second run the same day prints nothing new, and the task's first manual run writes the report.
- [ ] 3.4 Run the trial and the smokes. A reader the lead never sees writes four questions, one each for collaboration, Word files, virtualization and tables, and the keys a complete answer cites from current pages and repos. Arm A runs today's rules at this plan's base, and arm B runs the built loop, two fresh read-only Claude sessions per question and arm, graded by a separate grader. B keeps phase 3 when its total is at least A's and no question drops more than one key. Then send one plain request per changed route (research, Plan, Verdict, Bug fix, Perf issue and sweep triage) and an adjacent one that should stay outside research, such as "how does our table plugin work", and read each transcript for the lookup call and the write-back. Proof: the grader's score table and the transcript notes in the decision log.

## Proof

Each step names its proof. Base controls ran on 2026-10-24, and the decision log cites their logs. `kb check` exits 1 with 86 K7 findings. `kb collaboration` reads the key as plain words and takes 2.4 seconds. `kb tiptap` resolves the editor but shows its harvest revision as unknown, and its write-back footer still names a dated run folder. Before the build starts, step 1.2's grep, step 1.5's affected-step log and step 2.3's must-refuse fixtures each run once at base in a detached worktree. The build's diff gets a panel before it lands, because it deletes behavior (reviews: push).

## Old plan triage

The superseded plan's 44 open items, each with one call. A "carry" moves to the named subject's Open work in step 1.1; a "take" names the step here that does it.

| Item | Call | Goes to | Why |
| --- | --- | --- | --- |
| Retirement check with A and B arms | cut | none | No store waits for retirement, and a retired file still opens from git at its commit. |
| Compile sweep of plans from 2026-09-23 on, and batches p5-005 to p5-163 | cut | none | Defaults row "The old plan compile". The review ledger indexes the 923 plans by scope, so research reads them when their area comes up. |
| Replace the 15 Word test documents copied from pandoc | carry | `documents` | You answered "Replace them" on 2026-10-09; it belongs with DOCX import. |
| Phase 3 trial (80 of 108 sessions) | cut | step 3.4 | It grades wiring for the card this plan changes. |
| Combined diff panel on `foldSource`, the writer fix, scope-file moves and fold rows | cut | steps 1.2 and 3.1 | Step 1.2 deletes that code and step 3.1 rewrites the writer line; the build's own diff panel reviews both. |
| Per-home navigation checks | cut | step 3.4 | The trial measures whether agents reach the pages. |
| Runs under `docs/plite/research` with no `homes.tsv` row | take | step 1.4 | The folder freezes, so no new run needs a row. |
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
| Probe captures landing through commits | take | step 1.3 | |
| Reflect patches and reflect Backlog | carry | `pstack` | Workflow lessons belong to the workflow subject; their 2026-11-06 drop date carries. |
| Two Android IME bugs as local drafts | carry | `native` | They file through `maintainer`'s issue-draft mode. |
| `pnpm check knowledge` failing | take | step 1.5 | It now fails on 86 lines. |
| Deferred review findings: double printing, vanishing malformed rows | take | step 2.3 | Step 2.3 rewrites that code. |
| Deferred review findings: K0 formats, K7 link forms, node:test skips, copied runner policy, `knowledge.mjs` size, `candidates.md:201` | carry | `knowledge` | No failing case today; each waits for the next change to its code. |
| Broad query time of 1.8 to 3.3 seconds | take | step 2.3 | Area, scope and repo keys get the 2-second limit; broad words keep the measured time. |
| Empty `PLATE_BASELINE_BASE` on dispatch runs | carry | `proof` | CI baseline wiring. |
| Ten tests missing a caret assertion | cut | none | `pnpm kb gaps` already lists them. |
| `kb gaps` treats any conditional skip as not running | carry | `knowledge` | A known limit of the scanner. |
| `finding-baseline.mjs` growth check | carry | `knowledge` | A shared check helper. |
| `kb fold` and `kb resolve` edge cases | cut | step 1.2 | The verbs are deleted. |
| 331 K7 baseline entries | take | step 1.5 | `kb check --lower` drops entries the tree no longer holds. |
| Phase 4 side findings | carry | owning subjects | Grouped with the 102 findings below. |
| Lesson index guard patch | cut | step 1.2 | It guards `kb write`, which is deleted. |
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
- Finish the legacy compile. It costs about 70M tokens for plans the ledger already finds by scope.

## Open work

- Send a generic version of the loop (a repo list with derived marks, an area join and write-back) to the shared pstack source. owner: Ziad. stop: step 3.4's trial passes, or this plan closes without it. Tracked here.
- Areas that only one or two homes use today join `areas.tsv` when a run writes them. owner: Ziad. stop: K16 reports none missing. Tracked here.
