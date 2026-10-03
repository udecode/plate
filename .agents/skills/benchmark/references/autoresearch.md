# Plite Autoresearch

Operate the Plite (Slate v2) Autoresearch loop through the installed `codex-autoresearch:codex-autoresearch` plugin. The loop's keep and discard packets are pstack's Hillclimb shape: one metric, a correctness guard and a decision per packet.

## Defaults

- The target cwd is the Plate repo root. `plate-2` is the control plane for shortcuts and commands; it does not prove Plite runtime behavior.
- Live loop state is `.tmp/slate-autoresearch/autoresearch.*` and `.tmp/slate-autoresearch/research/**`. When it is absent, no session exists; say so instead of inventing state.
- Correctness beats metric movement. A packet that breaks editor behavior is `checks_failed` or `discard`, never `keep`.
- If a mutating loop already runs in another thread, stay read-only unless the user says this thread owns writes.

## The CLI

The installed plugin is the executable truth; `../codex-autoresearch` is a legacy reference checkout, never a command source.

```bash
AR_CLI="$(find "${CODEX_HOME:-$HOME/.codex}/plugins/cache/thegreencedar-autoresearch/codex-autoresearch" -path '*/scripts/autoresearch.mjs' -print | sort -V | tail -1)"
test -n "$AR_CLI"
node "$AR_CLI" --help --all
```

When the plugin is absent, report the gap and continue any useful Bug fix or Benchmark work. Useful commands:

- read-only resume: `onboarding-packet`, `state --compact`, `state --report`, `recommend-next --compact --operator-checklist`, `doctor --explain`;
- setup: `prompt-plan`, `guide`, `setup-plan`, `setup --interactive`, `benchmark-lint`, `checks-inspect`;
- packets: `next`, `run`, `partial-results --from-last`, `log`;
- stuck loops: `config`, `new-segment`, `promote-gate`, `research-fanout`, `lane-runner`;
- evidence and readout: `session-forensics`, `finalize-preview`, `finalize-current-tree`, `serve`, `export`.

Run the cheapest current-state command that answers the question before spending a packet, and clear an operator-checklist blocker before `next`.

## Modes

| Input | Mode |
| --- | --- |
| `status`, `dashboard`, "where are we" | Status |
| `continue`, `resume`, `next`, "pick best" | Next |
| `gate <command or surface>` | Gate |
| `stabilize <surface>`, "regressions", "native behavior" | Stabilize |
| `quality <slug>`, "accepted checklist" | Quality |
| `recipe`, "what loop" | Recipe |
| `perfect <surface>` | Perfect |
| `finalize preview`, `current-tree preview` | Finalize |
| `ship`, "reviewable", "ready to commit" | Ship |

**Status.** Run `onboarding-packet`, `state --compact`, `state --report`, `recommend-next --compact --operator-checklist` and `doctor --explain`, all with `--cwd .`. Start `serve` only for a live dashboard URL; an exported HTML file is a snapshot, not live truth. Status runs no packet, setup, finalization or git action.

**Next.** Run status, pick the strongest blocker or opportunity, choose one owner and run one safe step. Owners: a known correctness failure goes to pstack's Bug fix playbook; a repeatability question to Gate; a missing oracle to the Bug fix playbook or `pstack:tdd`; a clear performance target to `benchmark`; cleanup discovery to the Refactoring playbook; an unknown gap to `research`; an accepted checklist to Quality.

**Gate.** Repeat an existing proof command and log its result: navigation, typing, selection, clipboard, IME, focus, undo and redo, browser routes, package tests and Playwright suites.

```bash
node "$AR_CLI" setup-plan --cwd . --name "<gate-name>" --metric-name "seconds" --benchmark-command "<gate command>" --benchmark-prints-metric false --checks-command "<gate command>"
node "$AR_CLI" checks-inspect --cwd . --command "<gate command>"
node "$AR_CLI" doctor --cwd . --explain
node "$AR_CLI" next --cwd .
node "$AR_CLI" log --cwd . --from-last --status measure --description "<gate result>"
```

Start with one focused command, then broaden: `pnpm check:plite:dev`, `pnpm check:plite`, then `PLAYWRIGHT_BASE_URL=http://localhost:3102 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 pnpm --filter plite test:plite-browser:chromium tests/plite-browser/donor/examples/<suite>.test.ts`. A valid gate that fails twice with the same signal goes to the Bug fix playbook.

**Stabilize.** Run status, then the narrowest existing behavior gate for the named or riskiest surface. The same gate failing twice goes to the Bug fix playbook; a missing oracle is written there first. Rerun the focused gate after each fix and broaden only once it is green. Performance work waits until stabilization is green.

**Quality.** Execute an accepted quality-gap checklist. Broad discovery goes to `research` first.

```bash
node "$AR_CLI" research-setup --cwd . --slug "<slug>" --goal "<goal>"
node "$AR_CLI" quality-gap --cwd . --research-slug "<slug>" --list
node "$AR_CLI" gap-candidates --cwd . --research-slug "<slug>"
```

Apply `gap-candidates --apply` only after inspecting the write scope. Split a checklist too broad for one path with `research-fanout --dry-run` and `lane-runner ... --mode read_only_scout`. `quality_gap=0` closes the accepted checklist, not discovery.

**Recipe.** Stay read-only: `recipes list`, `recipes recommend`, `recipes show <id>`, `setup-plan --recipe <id>` and `doctor --check-benchmark --explain`. Run `benchmark-lint` before any packet from a customized recipe.

**Perfect.** Make one surface genuinely good under a plan that names the surface, the completion threshold, the behavior gates, the Benchmark handoff and the stop condition. Order the owners: `research` for unknown gaps, Quality for accepted checklists, `best-api` or the Plan playbook for API and runtime questions, the Bug fix playbook for known bugs, Gate for existing proof, `benchmark` for performance, then Gate again for broad no-regression proof. A performance win with a behavior regression is not progress. Perfect completes only with accepted architecture, API and DX gaps implemented, routed or deferred with evidence; no known P0 or P1 behavior regression in scope; relevant behavior gates green or explicitly N/A; relevant Benchmark targets complete or N/A with correctness green; and final broad no-regression proof green when editor behavior is touched.

**Finalize.** Preview only: `state --report`, then `finalize-preview` or `finalize-current-tree`. Never run `finalize-autoresearch.mjs <plan>` or create `autoresearch-review/*` branches unless the user asks for review branches. "go", "ship" or "finalize" alone keeps work on the source branch.

**Ship.** Run the finalization preview, decide whether kept AR evidence or the current tree is the honest review unit, and hand a dirty current tree to the Babysit playbook. Run the proof gates, apply the Review rule in `AGENTS.md`, and report `READY TO COMMIT` only when the applicable proof is complete. Commits, branches, pushes, PRs and releases need their own authorization.

## Handoff

Report the cwd and session, mode and surface, target or quality-gap slug, baseline, latest and best values, kept, discarded, crashed and checks-failed packet counts, the correctness checks used, the dashboard URL when served, gate and fix status, and the next packet, route or blocker.
