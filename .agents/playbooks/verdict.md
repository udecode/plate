---
extends: investigation
when: Use it for `verdict` on any input, "what would you do from <material>", "what should we build next for <feature>" or another plain ask for one scope's next step, "review <scope id>" when the scope is not a PR, `explore <scope or idea>` when the owner wants to steer the research in rounds before any verdict, `audit`, `audit restart`, `audit <scope or group id>`, a design-question chip in a `review-<id>` topic, or "again" after a verdict.
---

# Verdict

Owns Intake (input -> outcomes + chips), Deep path (scope judgment via `best-api` + `architecture.md` -> `Stop`, `Pursue` or `Defer`), Audit pass, Relapse pass, and Explore (owner-steered rounds before locking). [Review ledger schema](../../docs/research/schema.md#review-history) and `node tooling/scripts/review-ledger.mjs --help` own scope files, frontmatter and CLI checks; `chips` holds open questions.

## Paths

- **Explore:** starts only when `explore <scope or idea>` is the first word (or `/verdict explore <idea>`). Never for `pstack:how`, `/loop`, audits or non-Explore chips.
- **Deep path:** `verdict|review <scope id>` (exact file in `docs/research/review-scopes/`, not a PR); plain next-step asks for a feature (`pnpm kb` scope; bare "next" -> `chips`); `audit <scope|group>` / `verdict <group>`; `decide` chip in `review-<id>`; mid-run verdicts from Build, Bug fix, `best-api repair` or `research` (returns to caller).
- **Intake:** any other `verdict <material>` / "what would you do from <material>" (doc, path, issue, PR, draft, idea; `lookup` for context only).
- **Passes:** bare `audit` / `audit restart` -> Audit pass; bare `relapse [date]` -> Relapse pass. PR reviews -> Babysit; lone bugs -> Bug fix; issue triage -> Triage; other public GitHub work -> `maintainer`.

## Intake

Split input into items (one per claim, proposal, defect or question) and assign one outcome:

- **Bug:** breaks law/decision/job; read path:line within `docs/vision/common.md` Claim Width (P0/P1 needs repro per `chips.md`, else P2) -> `fix`/`decide` chip (or `folded`).
- **Settled:** law, `matching` head, topic decision or tested code answers it -> none (`open <n>` reverses).
- **Stop:** false premise, unargued law break or shipped incumbent covers it (missing evidence is never Stop) -> none (`open <n>` reverses).
- **Defer:** named observation/prerequisite can flip answer -> evidence chip (waits on task/plan/PR, else P3).
- **Open question:** real owner/shape/API/behavior choice, challenges law, or unasked removal (keep per Hard cut) -> `decide` chip per Topics.

**Depth & bounds:** read-this-session evidence only; no Pursue, architecture change, lanes, `architect`, panel, arena, research or code edits; max one 10-min repro per claimed P0/P1 bug; one input per session.

**Topics:** read `decisions-check.mjs chips all --session <id>` + relevant `chips brief <id>`. Reuse `review-<scope>` only when its question owns the item (else `review-<new id>`); list `docs/plans/topics/<scope>.md` + changed paths in `writes:` (never whole `docs/plans`). Precedence for scope X: (1) unserved ship item -> `ship: X` (`kind: decide` for pursue-not-adopted), (2) challenges open plan/task -> unblocked `decide` chip naming it, (3) else `decide` chip. Offer via `chips` Offer (`via: verdict`).

**Page:** `docs/plans/<date>-<slug>-intake.md` + decision log (no frontmatter/`Topic:`, `Status: done: <n> items, <k> chips offered, <f> folded`, `Playbook: verdict`; lead, Brief, Pushback, Items, Order, Defaults, Open work, Close). Paraphrase input, land via `land.mjs`, card own offers (and adopted folded tasks), reply per `pages.md`.

## Deep path

### Verdicts

- **Stop:** no material gain, unjustified machinery, violated hard law, or loses to incumbent -> keep current design, no plan/backlog (unless a task asks to plan a proved code defect).
- **Pursue:** material problem + better direction (defect user-reachable, else lead flags internal-only) -> name single owner; continue into Plan when Plan owns next step.
- **Defer:** named evidence gap or prerequisite can flip verdict -> offer evidence chip + successor `decide` chip waiting on it.

Challenge blocking rules as a "rule is wrong" lane (subject rules rewrite in plan; Vision rules ask owner in Open questions). Check tree before closing stale plans. Cited stops format `verdict: stop: <reason>`.

**Never leave a verdict unwritten.** Write `verdict` frontmatter before replying and pass `node tooling/scripts/review-ledger.mjs check <page>` in-run (name any unfixed refusal in reply and log).

### Next step

Runs on `verdict|review <scope>`, plain scope next-step asks, `/loop verdict <scope>`, audit/relapse tasks, and Explore lock (skipped for narrow `decide` chips, `audit <scope|group>` and mid-run verdicts):

1. Run `pnpm kb <scope>`; read listed `docs/research/sources/` pages, topic file and public docs (add missing scope to `docs/research/areas.tsv`).
2. Write `### Jobs` under Evidence (job, strongest external alternative, better/as-well/worse, grounded source; never model memory, checked by `review-ledger.mjs check`). Run a `research` discovery shard (`pnpm kb discover <area>` + live GitHub/web search, promoted to `docs/research/sources/` + `repos.tsv`) when a top job is ungraded, the area's research is stale against the question, or the verdict proposes a redesign or new subsystem (skip live discovery for pure Intake, narrow internal `decide` chips, or pure dead-code cuts). Max one outside-scope `decide` chip (`via: verdict`, `session: none`).
3. Collect candidates (worse jobs, open work, strongest cut/merge, Redesign from First Principles, rule-is-wrong, and for user-facing scopes with a page in `content/docs/`, any clear `plate-docs` gap such as a single kitchen-sink demo or missing focused examples for major shipped modes) into `### Lanes` ranked by user gain/cost (ties: cut/merge > redesign > addition).
4. Top lane = Pursue (else Stop); a disjoint worthy lane (such as a `plate-docs` polish alongside an engine Stop) may become a `via: verdict` chip.

### Audit pass

`review-ledger.mjs due` lists scopes lacking a current review with a markdown `### Jobs` table (`| ... |` above HTML) in Evidence, ordered by tier then recent commits. Bare `audit`: (1) `coverage` -> assign unowned files to `members` or new scope -> `land.mjs`; (2) `due` -> offer first 3 unblocked items (`ship` = P1 `ship: <id>`, else P2 `via: verdict`, own `session:`, no `run:` wait on idle plans in `writes`); (3) `chips` Close (report cards, remaining count, waiting scopes). Each audit verdict offers the next due item at last hand-back. `audit restart` sets UTC `audit.since` in `.agents/pstack.json` and runs steps 1 to 3. `audit <scope|group>` judges all scopes in one session without Next step (check page 1 before page 2; Pursue closes `Status: closed: Pursue verdict, built by its own task`).

### Relapse pass

`node tooling/scripts/relapse.mjs [--until <date>]` blames reworked product lines (ignoring tests, examples, blanks, imports/re-exports) since each scope's newest verdict (or last landed commit of its Pursue's plans). Bare `relapse`: run script -> for each `card` scope (3+ relapses reworking 2+ fixes, >=1 in last 14 days, no active plan) inspect diffs, summarize patched fact/files + idle plans, offer P2 `kind: decide` task (`via: verdict`, topic `review-<scope>`, own `session:`, title `Decide what change to <scope id> stops its fixes coming back (xhigh)`, finding running `verdict <scope>` with Next step ranking 4 lanes: single owner, unrepresentable type/invariant, formal check, redesign/cut; wait on `shares:` task) -> `chips` Close (report >=2-relapse rows, cards, `plan` scopes, blame's new-branch blind spot). Stop hook `tooling/scripts/relapse-due.mjs` runs `--fix` on session commits and triggers step 2 with `via: hook` + own `session:`.

## Explore

Run dir: main checkout `docs/plans/artifacts/<date>-<slug>-explore/` (`goal.md` verbatim, `round-<n>.md`). Title: `🥔 <scope> (round N)` working, `🟠 <scope> (round N)` waiting (round 0 = goal; normal title after `lock`).

- **Round 0 (Goal):** no search/lanes (may read `lookup`, `pnpm kb`, topic file); save ask in `goal.md`, restate goal, lead use case and out-of-scope, stop.
- **Round 1 (OSS + codebase):** append answer, load `research`, read `pnpm kb <scope>` + existing `docs/research/sources/` first, then fan out parallel evidence lanes (Extraction) pairing live codebase forensics with a mandatory OSS discovery lane (`pnpm kb discover <area>` + GitHub/web search beyond local clones). Grade `### Jobs` in `round-1.md`, re-rank per Next step, promote new findings to `docs/research/sources/` + `repos.tsv` via `research` + `land.mjs` (or log `0 new OSS findings` with queries run), send ~300-word reply (harsh pushback first, then **Learned**, **Ranking**, **Unsure**, **Your calls**, ending with `lock`/`drop`/continue), stop.
- **Rounds 2+:** append answer, fan out steered evidence lanes (running another `research` shard when the steer opens an unresearched angle), re-rank per Next step, promote any new research via `research` + `land.mjs`, send ~300-word reply, save `round-<n>.md`, stop. No-change round asks for `lock` (plain yes = `lock`).
- **Converge (`lock`):** deep path + Next step from round research (no new shard; quote `goal.md` in `### Requirements`; lanes name `owner:`/`stop:`; `lock` triggers panel with `goal.md` `[ask]` invariants). After panel fixes, rewrite topic file directly and close without building (`Status: closed: Pursue verdict, built by its own task` + `Built by: /loop verdict <scope id>`, or `closed: Defer verdict, waiting on <evidence>`).

## Sessions

One input, scope or audit set per session; title immediately. Offer `via: verdict` chips for additional inputs (exceptions: `again`, mid-run verdicts, Pursue plan+build, `/loop verdict`, Explore). Repair missing ledger metadata on landed builds without writing a new verdict.

## Steps

- **In** "Trace the code the question is about": Intake splits input, checks spans/laws/`lookup`/`pnpm kb`/chips, runs max 10-min P0/P1 repros, judges per Depth. Explore runs Goal/Rounds/Converge. Bare `audit`/`audit restart`/`relapse` run one step of their pass.
- **Before** "Trace the code the question is about": `review-<id>` `decide` chips log task rows and create missing scope or topic files (`## Main changes` + `## What other editors do`). Deep path runs `review-ledger.mjs lookup <scope>` (`--detail`/`show`) and searches `docs/plans` + `docs/plans/topics`; reconciles `fork`, routes `pursue-not-adopted` to Plan, skips scopes with active plans (except `decide` chips and Explore `lock`).
- **Replace** "Produce the output": Intake writes/lands Page and cards offers; Explore returns Round reply before `lock`; bare passes return pass reply. Deep path (and Explore after `lock`) inspects owners, types, consumers/UI/kits and `dependents` (add to `review_inputs`), judges via `best-api` + `architecture.md` + Redesign from First Principles (`pstack:why` before deleting workarounds; ingress census if owner input changes), writes `docs/plans/<date>-<scope>-<slug>.md` before any panel (lead verdict, `## Public API` pairs, Defaults `hold` with `again`/`interrogate`, `### Requirements`, `### Lanes` >=2 + strongest cut/merge + proof limits, `### Dependents`, `Model:`, history retention/supersession, external commits, frontmatter `review_scopes`/`verdict`/`review_basis`/`review_commit`/`review_inputs`/`review_upstreams`). Assign unowned `coverage` files to `members`, pass `review-ledger.mjs check <page>`, update topic file in place for Stop/Defer (Pursue folds at close), reply with editor comparison (`pages.md`). Land Stop/Defer/non-building Pursue via `land.mjs` (`executed: Stop verdict` if Stop built steps/unblocks task); building Pursue continues into Plan + Build.
- **Replace** "Apply the **unslop** skill to the reply": write replies clean; one `unslop` pass on pages, topic files and plans.
- **Last hand-back & follow-ups:** check `review-ledger.mjs ship` post-build, offer next due scope if Audit pass, adopt archived folded tasks via `chips all --session <id> --sessions <file>` + `chips` Close (Close line above links). Post-verdict words: `again`, `interrogate`/`panel`, `plan`, `open <n>`.
