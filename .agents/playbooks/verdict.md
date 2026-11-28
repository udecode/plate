---
extends: investigation
when: Use it for `verdict` on any input, "what would you do from <material>", "what should we build next for <feature>" or another plain ask for one scope's next step, "review <scope id>" when the scope is not a PR, `explore <scope or idea>` when the owner wants to steer the research in rounds before any verdict, `audit`, `audit restart`, `audit <scope or group id>`, or "again" after a verdict.
---

# Verdict

Owns Intake (input -> outcomes + Open work), Deep path (scope judgment via `best-api` + `architecture.md` -> `Stop`, `Pursue` or `Defer`), Audit pass, Relapse pass, and Explore (owner-steered rounds before locking). [Review ledger schema](../../docs/research/schema.md#review-history) and `node tooling/scripts/review-ledger.mjs --help` own scope files, frontmatter and CLI checks.

## Paths

- **Explore:** starts only when `explore <scope or idea>` is the first word (or `/verdict explore <idea>`). Never for `pstack:how`, `/loop` or audits.
- **Deep path:** `verdict|review <scope id>` (exact file in `docs/research/review-scopes/`, not a PR); plain next-step asks for a feature (`pnpm kb` scope); `audit <scope|group>` / `verdict <group>`; mid-run verdicts from Build, Bug fix, `best-api repair` or `research` (returns to caller).
- **Intake:** any other `verdict <material>` / "what would you do from <material>" (doc, path, issue, PR, draft, idea; `lookup` for context only).
- **Passes:** bare `audit` / `audit restart` -> Audit pass; bare `relapse [date]` -> Relapse pass. PR reviews -> Babysit; lone bugs -> Bug fix; issue triage -> Triage; other public GitHub work -> `maintainer`.

## Intake

Split input into items (one per claim, proposal, defect or question) and assign one outcome:

- **Bug:** breaks law/decision/job; read path:line within `docs/vision/common.md` Claim Width -> list in `## Open work` (or append a verified P0/P1 defect with repro to main checkout's `docs/plans/artifacts/queue.tsv`).
- **Settled:** law, `matching` head, topic decision or tested code answers it -> none (`open <n>` reverses).
- **Stop:** false premise, unargued law break or shipped incumbent covers it (missing evidence is never Stop) -> none (`open <n>` reverses).
- **Defer:** named observation/prerequisite can flip answer -> list in `## Open work` with `stop:`.
- **Open question:** real owner/shape/API/behavior choice, challenges law, or unasked removal (keep per Hard cut) -> list in `## Open questions` or `## Open work`.

**Depth & bounds:** read-this-session evidence only; no Pursue, architecture change, lanes, `architect`, panel, arena, research or code edits; max one 10-min repro per claimed P0/P1 bug; one input per session.

**Page:** `docs/plans/<date>-<slug>-intake.md` + decision log (no frontmatter/`Topic:`, `Status: done: <n> items`, `Playbook: verdict`; lead, Brief, Pushback, Items, Order, Defaults, Open work, Close). Paraphrase input, land via `land.mjs`, reply per `pages.md`.

## Deep path

### Verdicts

- **Stop:** no material gain, unjustified machinery, violated hard law, or loses to incumbent -> keep current design, no plan/backlog (unless a task asks to plan a proved code defect).
- **Pursue:** material problem + better direction (defect user-reachable, else lead flags internal-only) -> name single owner; continue into Plan when Plan owns next step.
- **Defer:** named evidence gap or prerequisite can flip verdict -> record the named evidence gap in `## Open work` with `stop:`.

Challenge blocking rules as a "rule is wrong" lane (subject rules rewrite in plan; Vision rules ask owner in Open questions). Check tree before closing stale plans. Cited stops format `verdict: stop: <reason>`.

**Never leave a verdict unwritten.** Write `verdict` frontmatter before replying.

### Next step

Runs on `verdict|review <scope>`, plain scope next-step asks, `/loop verdict <scope>`, closing feature-build verdicts, audit/relapse runs, and Explore lock (skipped for `audit <scope|group>` and mid-run verdicts):

1. Run `pnpm kb <scope>`; read listed `docs/research/sources/` pages, topic file and public docs (add missing scope to `docs/research/areas.tsv`).
2. Write `### Jobs` under Evidence (job, strongest external alternative, better/as-well/worse, grounded source; never model memory). For UI scopes under `apps/www/src/registry/`, include at least one UI ergonomics row against shipped visual products and OSS UIs (not only headless editors), drive the live demo in a browser like a real user before grading UI `As well` or `Stop`, and test `rule-is-wrong` on any awkward topic UX rule. Run a `research` discovery shard (`pnpm kb discover <area>` + GitHub/web search, promoted to `docs/research/sources/` + `repos.tsv`) when a top job is ungraded, research is stale, or the verdict proposes a redesign or new subsystem (skip for Intake or pure dead-code cuts).
3. Run a **First-principles HHF pass** first (`VISION.md`, `docs/vision/common.md`, `best-api` Hard-cut gate) over the model, public API, owners, stored shape, and deletion cone, even when tests pass and relapses are 0. Rank `### Lanes` (HHF cuts/redesigns, worse jobs, open work, rule-is-wrong, and `plate-docs` gaps such as kitchen-sink-only demos) by **lasting architectural and user value** (`cut/merge > redesign > bug fix > addition`). Compatibility, blast radius, `api-plan` cost, or single-session convenience never demote a stronger cut/redesign below a smaller patch (`VISION.md`). Never pick a zero-API-break UI, registry, or docs workaround when the defect traces to a broken package API, split owner, or stored shape.
4. Top lane = Pursue (else Stop); on a closing verdict right after a feature build, Pursue only when an external product is clearly `Better` on a core job or a live P0/P1 defect remains, and Stop once core jobs are `As well` or `Better`. List disjoint worthy lanes in `## Open work` with `owner:`, and mirror cross-scope items into `docs/plans/topics/<other>.md`.

### Audit pass

`review-ledger.mjs due` lists scopes lacking a current review with a markdown `### Jobs` table (`| ... |` above HTML) matching `.agents/pstack.json` `audit.since`, `audit.model` and `audit.reopen`, ordered by tier then recent commits. Bare `audit`: (1) `coverage` -> assign unowned files to `members` or new scope -> `land.mjs`; (2) `due` -> report the next unblocked scopes in order and remaining count. `audit restart` sets UTC `audit.since` in `.agents/pstack.json` and runs steps 1 to 2. `audit <scope|group>` judges all scopes in one session without Next step (check page 1 before page 2; Pursue closes `Status: closed: Pursue verdict, built by its own task`).

### Relapse pass

`node tooling/scripts/relapse.mjs [--until <date>]` blames reworked product lines (ignoring tests, examples, blanks, imports/re-exports) since each scope's newest verdict (or last landed commit of its Pursue's plans). Bare `relapse`: run script -> for each `card` scope (3+ relapses reworking 2+ fixes, >=1 in last 14 days, no active plan) inspect diffs, summarize patched fact/files + idle plans, and report the scopes due for `verdict <scope>` (ranking 4 lanes: single owner, unrepresentable type/invariant, formal check, redesign/cut), plus >=2-relapse rows, `plan` scopes, and blame's new-branch blind spot. Stop hook `tooling/scripts/relapse-due.mjs` runs `--fix` on session commits and reports any scope whose fixes keep coming back.

## Explore

Run dir: main checkout `docs/plans/artifacts/<date>-<slug>-explore/` (`goal.md` verbatim, `round-<n>.md`). Title: `🥔 <scope> (round N)` working, `🟠 <scope> (round N)` waiting (round 0 = goal; normal title after `lock`).

- **Round 0 (Goal):** no search/lanes (may read `lookup`, `pnpm kb`, topic file); save ask in `goal.md`, restate goal, lead use case and out-of-scope, stop.
- **Round 1 (OSS + codebase):** append answer, load `research`, read `pnpm kb <scope>` + existing `docs/research/sources/` first, then fan out parallel evidence lanes (Extraction) pairing live codebase forensics with a mandatory OSS discovery lane (`pnpm kb discover <area>` + GitHub/web search beyond local clones). Grade `### Jobs` in `round-1.md`, re-rank per Next step, promote new findings to `docs/research/sources/` + `repos.tsv` via `research` + `land.mjs` (or log `0 new OSS findings` with queries run), send ~300-word reply (harsh pushback first, then **Learned**, **Ranking**, **Unsure**, **Your calls**, ending with `lock`/`drop`/continue), stop.
- **Rounds 2+:** append answer, fan out steered evidence lanes (running another `research` shard when the steer opens an unresearched angle), re-rank per Next step, promote any new research via `research` + `land.mjs`, send ~300-word reply, save `round-<n>.md`, stop. No-change round asks for `lock` (plain yes = `lock`).
- **Converge (`lock`):** deep path + Next step from round research (no new shard; quote `goal.md` in `### Requirements`; lanes name `owner:`/`stop:`; `lock` triggers panel with `goal.md` `[ask]` invariants). After folding panel fixes, run the **Convergence audit loop** below until clean `stop` (0 new material gaps), then update the topic file and, on `Pursue`, continue straight into Plan and Build on autopilot unless the owner asked to stop at verdict/plan (then close `Status: closed: Pursue verdict, built by its own task` + `Built by: /loop verdict <scope id>` and hand back `🟠`, never `⚪`); `Stop` and `Defer` land and close directly.

### Convergence audit loop (until clean stop)

Before landing, updating topic files, or moving to Plan/Build on any Pursue verdict that changes public APIs, contracts, or cross-scope boundaries (including Explore `lock` after panel fixes, skipped for pure Intake or pure Stop), run bounded parallel forensic passes (`Extraction`, max 3 passes) over the revised verdict against live source until one pass returns **0 new material gaps** (clean `stop`):

1. **New-fix fallout:** trace every newly added or panel-rewritten API, type, invariant, and code snippet in live source (never assume a folded fix is bug-free without checking its real callers and signatures).
2. **Adjacent-feature interactions:** check `lock` (`BaseLockPlugin` / `authoredDirectProperties`), `migrations`, `static` (`PlateStatic` / SSR), `sync`/collaboration, `history`/undo, and preview/projection lenses for unguarded bypasses or stale contracts.
3. **Downstream and consumer fit:** verify every named consumer or handoff scope (such as `agent-bridge`, WebMCP `AbortSignal`/error wrapping, `ai`/`markdown.stream()`, and copied registry UI) against real code paths.
4. **Public API census:** grep every exported symbol and method on touched entrypoints for dead, single-caller, redundant, or test-only leaks.

Fold every source-verified gap into the verdict page and decision log, then run the next audit pass. Stop as soon as a pass finds 0 new material gaps; if pass 3 still finds critical defects, stop under `Open questions` / `Needs you` instead of shipping a leaky verdict or looping endlessly.

## Sessions

One input, scope or audit set per session; title immediately. List additional out-of-scope inputs in `## Open work` (exceptions: `again`, mid-run verdicts, Pursue plan+build, `/loop verdict`, Explore). Repair missing ledger metadata on landed builds without writing a new verdict.

## Steps

- **In** "Trace the code the question is about": Intake splits input, checks spans/laws/`lookup`/`pnpm kb`, runs max 10-min P0/P1 repros, judges per Depth. Explore runs Goal/Rounds/Converge. Bare `audit`/`audit restart`/`relapse` run one step of their pass.
- **Before** "Trace the code the question is about": create missing scope or topic files (`## Main changes` + `## What other editors do`). Deep path runs `review-ledger.mjs lookup <scope>` (`--detail`/`show`, including `incomingOpenWork` from other topic files) and searches `docs/plans` + `docs/plans/topics`; reconciles `fork`, routes `pursue-not-adopted` to Plan, skips scopes with active plans (except Explore `lock`).
- **Replace** "Produce the output": Intake writes/lands Page; Explore returns Round reply before `lock`; bare passes return pass reply. Deep path (and Explore after `lock`) inspects owners, types, consumers/UI/kits and importing dependents, judges via `best-api` + `architecture.md` + Redesign from First Principles (`pstack:why` before deleting workarounds; ingress census if owner input changes), writes `docs/plans/<date>-<scope>-<slug>.md` before any panel (opening HHF naming the strongest cut/redesign regardless of blast radius, lead verdict, `## Public API` pairs, Defaults `hold` with `again`/`interrogate`, `### Requirements`, `### Lanes` >=2 + strongest cut/merge + proof limits, `### Dependents`, `Model:`, history retention/supersession, external commits, frontmatter `review_scopes`/`verdict`/`review_basis`/`review_model`). Never shrink a Pursue to dodge `api-plan` or `🟠`: build the top target (`architect` + panel on public API changes) or stop at `🟠` for multi-phase roadmaps or owner calls. Assign unowned `coverage` files to `members`, pass `review-ledger.mjs check` when scope files change, update topic file in place for Stop/Defer (Pursue folds at close) and mirror cross-scope `## Open work` into each receiving topic file, reply with editor comparison (`pages.md`). Land Stop/Defer/non-building Pursue via `land.mjs` (`executed: Stop verdict` if Stop built steps).
- **Replace** "Apply the **unslop** skill to the reply": write replies clean; one `unslop` pass on pages, topic files and plans.
- **Last hand-back & follow-ups:** note any remaining due scope (`review-ledger.mjs due`). Post-verdict words: `again`, `interrogate`/`panel`, `plan`, `open <n>`.
