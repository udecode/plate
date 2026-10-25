# Plate knowledge layer

Page: https://claude.ai/artifact/2DJZ9eDVACXLPG6BJ29kXy

Where Plate keeps what it learns about editors (behavior law and its proof, external-editor research, upstream issues and harvested tests, measurements, lessons, decisions and plans) and which workflow step reads and writes each piece. Every plan below is one iteration of this subject.

## Main changes

- `pnpm kb` resolves an area id or alias from `docs/research/areas.tsv`, a review scope through the areas that name it, and a repo name from `docs/research/repos.tsv`. An area card lists that area's page in every home, the scope's subject, the sweep round rows whose domain is one of the area's scopes, upstream issues, harvested tests and each repo filed under the area. It does not search tests, and it prints how to search them. A repo card shows the clone path, its areas and each lane's last-read commit: the audit and harvest commits from `docs/editor-audits/index.json` and the harvest indexes, and the newest `<repo>@<sha>` an area page cites. For each mark it counts the clone's commits since, or says how many of the mark's commits the clone lacks. The write-back footer names the area page and `repos.tsv`.
- `pnpm kb discover <area>` runs `gh search repos` with the area's seeds and each `--seed` phrase, drops every repo `repos.tsv` lists, saved or skipped, and prints the rest. It stops at its time limit, 10 minutes unless `--minutes` says otherwise, and says so. `--record` adds each printed repo to `repos.tsv` as skipped, for the run to change the ones it reads to saved.
- The `knowledge` step of `pnpm check` runs under `--affected` when a path under `docs/research/`, `docs/editor-behavior/`, `docs/plans/topics/` or `tooling/scripts/knowledge/` changes, instead of only in a full check.
- The compile is over. Its script and test, `kb`'s `fold`, `write`, `resolve`, `quote` and `pins` verbs, K15 and the list of folded sources are gone, and the homes index and K14 live in `homes.mjs`.

## What other editors do

The prior art for this layer is workflows, in pstack and in this repository, not editors.

| Source | What it does | What the layer takes |
| --- | --- | --- |
| pstack's Investigation playbook (`how`, `why`) | Answers each question fresh from code and history, with no memory across runs | Keeps `how` and `why` for our own code; the area pages and the repo list add the cross-run memory pstack lacks |
| pstack's `show-me-your-work` | One decision log per run, kept local unless stakes need it | Run state stays per run, in the ignored run directory |
| `verify`'s inventory rule | Derives every feature inventory from its code owner and forbids a second feature map | `areas.tsv` holds names, aliases, scopes and search seeds, never coverage counts |
| The review ledger | Stores the commit a review read and derives freshness from it | The repo list stores no mark; `kb` derives each lane's last-read commit from the owner that already records it |
| `docs/editor-audits/index.json` | Keeps per-repo audit and harvest commits | One lane the repo card reads |
| `research harvest --since <commit>` | Reads only the commits after the last harvest | The model for every update-only read |

## Layer and owner

The state on 2026-10-25, after the [research loop plan](../2026-10-24-research-loop.md), which replaced the [2026-10-06 knowledge plan](../2026-10-06-knowledge-reorg.md). The [docs one-home plan](../2026-10-17-docs-one-home.md) retired the decision pages on 2026-10-17.

| Knowledge job | Owner | Read by | Written by |
| --- | --- | --- | --- |
| Behavior law | `docs/editor-behavior/markdown-editing-spec.md`, with the protocol matrix, parity matrix and roadmap folded in | AGENTS.md's Source authority | Bug fix, Build, research |
| Behavior proof index | `[EDIT-…]` and `[<repo>#<n>]` tags at the end of test titles; `docs/editor-behavior/current-evidence.md` keeps rule families, surface limits and partial proofs | `pnpm kb gaps`, AGENTS.md's Source authority | whoever writes the test |
| External-editor evidence | the same homes, joined across homes by area; `docs/research/areas.tsv` names each area with its aliases, review scopes and search seeds; a home is an editor or a library family, such as Yjs, Word file libraries, React runtime libraries or drawing tools; new clones go to `../<repo>` | the research rule's What is known, Plan's What other editors do, and `pnpm kb <area>`, `<scope>` or `<repo>` for whoever runs it | the research rule's modes; a discovery run writes its findings and rejected leads to the area page |
| Repo registry | `docs/research/repos.tsv`: one row per repo research saved or skipped, with its URL, clone path, kind, status and areas; each lane's last-read commit stays with its owner, and `kb` derives it | `pnpm kb`, `kb discover` and research's repo check | research, for each repo a run read or skipped; `kb discover --record`; `seed-repos.mjs`, which seeded it from the frozen runs |
| Repo discovery | `pnpm kb discover <area>`, which searches GitHub by the area's seeds and prints the repos `repos.tsv` lacks; research runs it once per new task or verdict that researches, within 10 minutes | research's Discovery run | its `--record` flag, which adds each printed repo as skipped |
| Plite history | `docs/research/sources/plite/`, Plate's own Slate rewrite | the research rule | the research rule's modes |
| Upstream issues | `docs/editor-issue-harvester/<repo>`, `c70bacbd4a:docs/plite-issues`, the maintainer queue | typed `issue-harvester` and maintainer, `pnpm kb` | issue-harvester, maintainer |
| Harvested tests | `docs/editor-test-harvester/<repo>` | typed `research harvest`, `pnpm kb <editor>` | research harvest |
| Measurements | `benchmarks/targets`, `benchmarks/editor`, plans with Cause History, git-ignored `tmp/` | the benchmark rule and the Perf issue playbook | benchmark runners |
| Lessons | `docs/research/sources/plate-notes/*.md`, with the old `3b6e49c964:docs/solutions` notes compiled in | Bug fix and Perf issue playbooks | research's maintain mode |
| Verdicts and adoption | `docs/research/review-scopes`, `review-records`, review pages in plan front matter | the review ledger in API review, Plan and Build | Verdict playbook |
| Current conclusions | the scope's subject file, `docs/plans/topics/<scope>.md`, which the ledger lookup names; one-feature rules sit under its `## Rules` | lookup, plan pages | API review, plan fold |
| Plans and trails | active plans and subjects in `docs/plans`, beside 923 settled legacy plans the review ledger indexes; 1,107 more sit in `../plate-archive/` outside git and open at `c70bacbd4a:<path>` | plan-page, review ledger | Plan, Build and other playbooks |
| Source inventory | `docs/research/homes.tsv` maps each page a reader homed; `kb homes` derives the rest from the path | `kb homes` and its K14 no-home check | nobody since the compile ended; `kb homes` derives a new page's home from its path |
| Run evidence | run state in the main checkout's ignored `docs/plans/artifacts/<slug>/`; `docs/plite/research`, `docs/research/probes` and `docs/research/raw` frozen and read by path | `review-ledger.mjs research` for the frozen runs, records and plans by path, `pnpm kb` | research, benchmark |
| Knowledge checks and tool | `pnpm kb` with the lookup, `check`, `gaps`, `homes` and `discover`; the compile verbs are gone; K16 checks the repo list and the area list; K17 fails a new file in a frozen folder | `pnpm check --affected` whenever a knowledge path changes; sweep rechecks, Bug fix for sweep finds, Triage, `review-comment` and research's search | the knowledge module's owner |

## Open work

- 863 units from compile batches landed before this plan no longer match their pages: 425 differ only in commit pins or spacing, 243 were rewritten and 195 sit on pages that were removed. 862 of them were already lost when this plan started. The research loop plan's step 4.3 deleted the quote check, so the list in the research loop plan's run folder, `p4/old-lost-at-head.tsv`, is the only record. owner: Ziad. stop: research's maintain mode checks the 438 rewritten or removed ones, or they are dropped. Tracked here.
- The ellie and plate checkouts still run the old `cross.mjs`, which cuts a piped reply at 65,536 bytes. Both sit dozens of shared files behind dotai on pstack v0.9.88, so the research loop plan synced only this repository. owner: Ziad. stop: their next sync-pstack run, which carries the fix. Tracked here.
- `EDIT-STYLE-FONT-SIZE-SELECTION-001`'s Proof line says `tooling/e2e/font-size-selection.test.ts` looks for an input with `data-editor-focus="true"`, which the font-size toolbar button no longer renders, so that test is no proof until its locator is fixed and it is run again. owner: Ziad. stop: the test passes on the current button, or the rule names other proof. Tracked here.
- Trial answers named stale statements in four pages: `docs/research/sources/plite/conversion-and-export.md:45` still lists the empty previous properties gap, a collaboration page dated 2026-05-18 still targets `tx.yjs`, the documents subject's review part is out of date, and the tables subject still says no review compared other editors. One answer also misread `docs/research/sources/plite/collaboration.md` on the June soak seeds 96 and 115. Nobody checked which of these the compile wrote. owner: Ziad. stop: research's maintain mode fixes or drops each. Tracked here.
- An R5 sweep comparison writes the area page in Codex, which loads research for it, and not in Claude Code, which keeps the finds in the round's run folder and the subject file. `sweep.md` never says which. owner: Ziad. stop: `sweep.md` says where an R5 comparison's evidence goes. Tracked here.
- Two research-rule ambiguities predate this plan. Research and `AGENTS.md` put clones at `..`. From a worktree that is the main checkout's worktrees folder, not the folder beside the main checkout, though `kb` resolves clones from the main checkout. And `docs/research/schema.md` makes an open design question a chips `decide` task with no page, while research puts an unresolved ambiguity on the page it blocks. owner: Ziad. stop: the next change to the research rule words both. Tracked here.
- Areas that only one or two homes use today join `areas.tsv` when a run writes them. owner: Ziad. stop: K16 reports none missing. Tracked here.
- Slate's ledger rebuild, `classify-delta.mjs`, reads an ignored corpus under `.tmp/editor-issue-harvester/slate/raw/`, so an assessment written into the script survives only while that corpus exists on the machine that rebuilds it. owner: Ziad. stop: the corpus or its decisions move into a tracked input, or the Slate ledger is retired. Carried from the superseded knowledge plan.
- Deferred review findings in the knowledge tool: K0 counts depend on recognizing a harvest's format; K7 skips reference-style links, untracked citing files and unstaged deletions; the scanner does not read node:test's `{ skip }` option or `t.skip()`; `kb` copies the runners' selection policy; `knowledge.mjs` mixes seven concerns; and `candidates.md:201` calls an existing file retired. owner: Ziad. stop: each is fixed or dropped at the next change to its code. Carried from the superseded knowledge plan.
- `kb gaps` counts a test with any conditional skip as not running, so a tag on a Plite browser test that skips only on the mobile project still leaves its rule a gap. owner: Ziad. stop: the first such tag lands, or the scanner evaluates project-name conditions. Carried from the superseded knowledge plan.
- `finding-baseline.mjs` skips the growth check for any rule its base copy lacks, for every baseline that uses it. owner: Ziad. stop: the shared helper bounds a new rule by the base's findings. Carried from the superseded knowledge plan.
- The superseded plan's compile readers found 26 problems in public docs (9), issue harvests (9) and research and subject pages (8), such as stale `Element`, `Path` and `Node` type listings and decision pages listing parser APIs that were cut. Each is an open `finding` row in that plan's decision log. owner: Ziad. stop: docs fixes run through `plate-docs`, page fixes through research's maintain mode, or each is dropped, or 2026-12-07. Carried from the superseded knowledge plan.
