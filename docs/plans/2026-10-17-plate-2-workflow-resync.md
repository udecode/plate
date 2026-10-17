# Re-sync Plate's workflow owners from plate-2

Status: done, waiting on the PR review
Page: https://claude.ai/artifact/3KuMNhhf9miev1ZRpF5CNY
Playbook: authoring-a-skill

## Brief

### What will change?

Plate's agent playbooks, rules and their helper scripts now match plate-2's latest commit, minus its new-engine parts. One script reruns the sync and checks it, so the next sync is one command.

### What could go wrong?

A cut I missed could send an agent to a command or file Plate lacks. The report finds none left, but it checks paths, scripts and engine words, not meaning.

## Teach

Plate's agents work from playbooks and rules kept in the repo. They come from plate-2, the branch that rebuilds Plate on a new editor engine. Until now someone synced them by hand, so Plate drifted behind and missed a week of plate-2 changes.

Now one script copies every owner file from a single plate-2 commit, then replays a recorded list of cuts and line edits. The edits sit in one patch file, so a reviewer can read each cut. A check fails when an owner drifts from the source plus that patch. A report lists any line that still names the new engine, a missing path or an unknown script.

When plate-2 moves on, the next sync reruns the script. Edits that still apply land, and the script prints the ones that no longer fit for a hand fix.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Plite wording | Read as Slate where it means the editor base | Cut every line that names Plite | cut plite lines | small |
| New-engine lanes | Cut the review ledger, hand drive, playtest and tester pass | Port them with stand-ins | port the lanes | small |
| Plugin examples | Rewritten to Plate's plugin calls | Keep the new engine's calls | keep new calls | small |
| Slate issue recipe | Left out, since Plate keeps its own upstream Slate mode | Port plate-2's recipe | port slate recipe | detail |
| Registry rule text | Keep Plate's text in the three files plate-2 changed only for the engine | Take plate-2's text | take registry text | small |
| Sync target | plate-2's latest commit, which changes no owner since the first pass | The commit the first pass used | pin first commit | detail |
| Slow helper tests | You said "relax slow test threshold to avoid such sensitive", so the fast suite takes plate-2's budget. The proof-worktree helper's tests still pushed the suite from 13 s to 41 s on a busy machine, because each case creates a git worktree, so they run in the slow lane under their plate-2 file name (look) | Keep it in the fast suite | fast proof tests | small |
| Type probes | Probes live in the run folder inside the repo | Map package paths for temp folders | map paths | detail |
| Example links | The workflow check skips links inside code examples | Make every example link a real file | check examples | small |
| Paired trial | No baseline trial, because you asked for plate-2's owners whole (look) | Run a paired trial first | run the trial | small |

## Main changes

- `tooling/scripts/sync-workflow-source.mjs` rebuilds the owners from one plate-2 commit. `--write` lays down the source plus the adaptations, `--record` saves local edits as the patch, `--check` fails on drift and `--report` lists lines still to review.
- `docs/development/pstack-adaptations.json` and `pstack-adaptations.patch` replace `pstack-omissions.json`. The JSON lists the omitted files with reasons, the tooling copied with the owners and the report's accepted hits.
- `pstack-source.json` now records plate-2 `d0209b439a`, a hash of each of the 207 source files and the retired skill names.
- Sixteen owner files that the last sync left out now land, such as the plate-plugins, plate-docs, research and verify references, with plate-plugins' `typing.md` and `creation-flow.md` cut to Plate's plugin API.
- verify gains a Hand drive section and plate-plugins a Package Boundaries section, holding the engine-neutral parts of the source files this sync leaves out.
- `proof-worktree.mjs` refuses a log location inside the worktree, through `--name` or a symlink that does not resolve yet. A `biome.jsonc` override keeps the other ported helpers at their source bytes.
- `sync-workflow-source.mjs` copies nothing from a source whose lock lists no skills, instead of the whole source tree.
- `check-agent-workflow.mjs` skips links inside fenced code, so an example link no longer fails the check.
- The tooling the owners run is ported: `proof-worktree`, `trial-power`, `check-plate-feature`, `teaching-sweep` and `type-probe`, with their tests under the fast-suite budget plate-2 uses. `proof-worktree.test.mjs` runs in the slow lane.

## Steps

- [x] Copy each owner whole from plate-2 and cut only the new-engine lines. Proof: docs/plans/artifacts/2026-10-17-plate-2-workflow-resync/sync-check-a1.log
- [x] Report no line that names the new engine, a missing path, an unknown script or an unknown variable. Proof: docs/plans/artifacts/2026-10-17-plate-2-workflow-resync/sync-report-a1.log
- [x] A hunk that no longer applies prints, fails `--write`, and leaves the other hunks written. Proof: docs/plans/artifacts/2026-10-17-plate-2-workflow-resync/reject-proof-a2.log
- [x] The workflow check skips a fenced dead link and still refuses a prose one. Proof: docs/plans/artifacts/2026-10-17-plate-2-workflow-resync/fence-proof-a1.log
- [x] The project playbooks match pstack's. Proof: docs/plans/artifacts/2026-10-17-plate-2-workflow-resync/check-playbooks-a1.log
- [x] The owner tests and the maintainer self-test pass. Proof: docs/plans/artifacts/2026-10-17-plate-2-workflow-resync/owner-tests-a1.log, docs/plans/artifacts/2026-10-17-plate-2-workflow-resync/maintainer-self-test-a1.log
- [x] Panel round 1's findings are fixed: owner lines name only Plate commands and helpers, and the sync, proof and probe scripts refuse the cases the panel found. Proof: docs/plans/artifacts/2026-10-17-plate-2-workflow-resync/sync-report-a3.log, docs/plans/artifacts/2026-10-17-plate-2-workflow-resync/sync-proof-a1.log, docs/plans/artifacts/2026-10-17-plate-2-workflow-resync/nested-name-after-a1.log, docs/plans/artifacts/2026-10-17-plate-2-workflow-resync/probe-tree-after-a1.log
- [x] Writing passes on the scripts and docs.
- [x] Panel on the diff, two rounds. Each round-2 fix has its proof, but no third round reviewed them, because you switched the run to fast. Proof: docs/plans/artifacts/2026-10-17-plate-2-workflow-resync/empty-lock-before-a1.log, docs/plans/artifacts/2026-10-17-plate-2-workflow-resync/empty-lock-after-a1.log, docs/plans/artifacts/2026-10-17-plate-2-workflow-resync/dangling-before-a1.log, docs/plans/artifacts/2026-10-17-plate-2-workflow-resync/dangling-after-a2.log, docs/plans/artifacts/2026-10-17-plate-2-workflow-resync/sync-report-a4.log
- [x] `pnpm check` passes. Proof: docs/plans/artifacts/2026-10-17-plate-2-workflow-resync/pnpm-check-a6-a1.log
- [x] `pnpm lint:fix` on the task's files, run as `biome check --fix` on them because other work shares this checkout.
- [x] Decision-trail review. skip: fast
- [x] Commit and open the PR. Proof: https://github.com/udecode/plate/pull/5186
