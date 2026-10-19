# audit shadcn protocol parity

Objective:
Audit Plate's current shadcn registry/install protocol against `../shadcn`;
done when every named contract owner is mapped and every divergence is
classified with source evidence.

Flow mode:
one-shot analytical audit. Product implementation is not authorized.

Goal plan:
docs/plans/2026-08-25-audit-shadcn-protocol-parity.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:

- none

Major source:

- type: local sibling upstream source plus current Plate checkout
- id / link: `../shadcn` and `/Users/zbeyens/git/plate-2`
- title: shadcn external registry/install protocol parity
- decision to make: which Plate divergences are valid constraints, proven
  defects, proof debt, or false alarms
- decision criteria: upstream owns schema, resolver, namespace, local-file,
  and `components.json` semantics; Plate may diverge only for a named content
  or delivery constraint

Major lane:

- lane: framework/protocol comparison
- output type: source-backed audit report and ranked findings
- implementation expected: no; read-only audit
- affected packages / surfaces: `apps/www` registry source/build/routes,
  template `components.json`, and local template sync tooling
- dominant risk: mistaking Plate delivery differences for protocol forks, or
  declaring parity from generated output without tracing the upstream owner

First checkpoint:

- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:

- requested duration: N/A; none requested
- semantics: evidence threshold, not elapsed time
- initial confidence score: N/A; the audit uses a complete contract matrix
- improvement loop: inspect every matrix owner, then pressure-test all gaps
- final score / loop closure: zero unclassified contract rows and all findings
  source-backed

Completion threshold:

- Record exact Plate and upstream SHAs. Map registry schema, resolver behavior
  for plain/namespaced/URL/local-file inputs, `components.json`, dependency
  rewriting, Base/Radix selection, generated public payloads, and local
  template sync. Every row must end as exact parity, intentional divergence,
  proven defect, or proof debt; zero rows may remain unclassified.
- Rank actionable findings P0-P3 and lead with the strongest justified cut.
  Zero findings is valid. Do not propose implementation unless the user later
  authorizes it.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-25-audit-shadcn-protocol-parity.md`
  passes.

Verification surface:

- Exact commit/ref and source-owner reads in `../shadcn` and Plate.
- Static comparisons of registry schemas, style/base resolution, dependency
  forms, namespace configuration, public JSON output, and template sync flows.
- Existing focused Plate tests and audit scripts, rerun only where they prove a
  current contract row.
- Durable report:
  `docs/plans/artifacts/shadcn-protocol-parity/audit.md`.

Constraints:

- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Do not execute implementation unless this major goal explicitly includes it.
- Do not edit product source, registry source, generated output, templates,
  package files, sync status, commits, branches, or remote state.
- Treat direct shadcn UI `asChild` to Base `render` transformation as supported
  behavior unless current upstream source disproves it.
- Keep local, generated, install-fixture, and release evidence distinct.

Boundaries:

- Source of truth: exact current `../shadcn` checkout for the external protocol;
  current Plate source for content and delivery.
- Allowed edit scope: this goal plan and
  `docs/plans/artifacts/shadcn-protocol-parity/**` only.
- External sources: local upstream clone first; network fetch only to establish
  ref freshness; no web documentation unless source cannot settle a claim.
- Browser surface: N/A; this audit concerns protocol and install topology, not
  visible UI behavior.
- Tracker sync: N/A; no issue or PR owns the request.
- Non-goals: syncing upstream commits, implementing findings, modernizing
  classic components, changing Plate public component APIs, or releasing work.

Output budget strategy:

- Start with owner/file counts and exact entrypoints. Exclude `node_modules`,
  build caches, broad generated JSON bodies, history, and unrelated docs.
- Save the contract matrix and detailed findings in the audit artifact; inspect
  generated payloads through counts and targeted JSON fields rather than
  streaming all 380 files.
- Cap source reads to named files/ranges and record any accidental broad output
  in Error attempts.

Blocked condition:

- Block only if `../shadcn` or a required exact ref cannot be read, or a named
  protocol row cannot be traced through either source tree after all local
  owner and test alternatives are exhausted.

Major state:

- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: completed
- next_phase: user decision on a narrow template/protocol repair
- goal_status: complete

Current verdict:

- verdict: Plate's registry protocol is sound, but Base-first is not end to
  end. Both templates retain `new-york` plus a style-less Plate URL, and the
  next template sync installs an invalid Base-Plate/Radix-shadcn graph.
- confidence: high for the current local generator defect; external consumer
  prevalence and deployed state were not assessed
- next owner: a user-authorized narrow template/protocol repair; no broad
  upstream sync is needed
- reason: the real shadcn 4.19.0 resolver and runtime fixture reproduced an
  empty trigger, while every other named protocol row was classified

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-25-audit-shadcn-protocol-parity.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Audit current Plate setup against shadcn source-by-source; report gaps; no implementation authority. |
| Timed checkpoint parsed | no | N/A: no duration was requested. |
| `major-task` loaded | yes | `.agents/skills/major-task/SKILL.md` read completely. |
| Active goal checked or created | yes | Active goal created with this file as its measurable plan and zero-unreviewed-row threshold. |
| Source of truth read before analysis | yes | `shadcn-parity` contract read completely and names `../shadcn` as external protocol authority; exact owner files are the first audit pass. |
| Major lane selected | yes | Analytical framework/protocol comparison. |
| Decision criteria stated | yes | Exact parity, intentional divergence, defect, or proof debt for every contract row. |
| Existing repo patterns / prior decisions checked | yes | Prior Base-first audit and provenance memory located; every drift-prone claim will be rechecked live. |
| Helper stack selected | yes | `shadcn-parity`, `major-task`, and `autogoal`; no Browser, external research, or implementation helper. |
| External research decision recorded | no | N/A: local upstream source is authoritative for this protocol audit. |
| Implementation expectation recorded | yes | Read-only; findings require later user authorization to implement. |
| Workspace authority selected | yes | Plate root owns local checks; `../shadcn` owns upstream protocol source. |
| Branch / PR expectation decided | no | N/A: analytical audit with no product code, commit, push, or PR. |
| Output budget strategy recorded | yes | Owner-first counts, capped reads, targeted generated JSON inspection, artifacted matrix. |

Work Checklist:

- [x] N/A: no duration was requested; completion is evidence-gated.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Major source records source type, id/link, title, decision type, expected
      outcome, decision criteria, likely files/packages/surfaces, browser
      surface, and highest-leverage owner.
- [x] Current state is mapped before proposing a new architecture, migration,
      benchmark, or plan.
- [x] Existing repo patterns, prior decisions, and nearby implementation
      constraints are recorded before external research.
- [x] External docs or source are used only where repo evidence does not settle
      the question, or N/A reason is recorded.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded.
- [x] Facts, inference, and recommendation are separated.
- [x] Review or pressure lenses are selected and completed, or marked N/A with
      reason.
- [x] N/A: no implementation happened; product touched-surface packs do not
      apply to the plan and audit artifact.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] N/A: read-only audit findings were not authorized for implementation;
      every finding and rejected counterexample has evidence and a next owner.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Complete the full protocol matrix with zero unreviewed rows | 22/22 rows classified in `docs/plans/artifacts/shadcn-protocol-parity/audit.md`. |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | Exact Plate/upstream refs, owners, generated counts, routes, templates, and workflows recorded. |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | Every row is exact parity, intentional divergence, proven defect, or proof debt. |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | Shared config plus convergent managed generation recommended; two-file patch and graph-wide variants rejected. |
| Review / pressure pass | yes | Run selected reviewer/lens or record N/A with reason | Four counterexamples pressure-tested; prior P1 scope already exhausted its three-review cap, so no redundant autoreview was run. |
| Review findings closure | no | Fix or explicitly reject accepted/actionable findings and record closure proof | N/A: implementation was not authorized; findings are ranked and routed. |
| External-source audit | yes | Cite official/local clone/external sources when used, or record N/A | Local immutable shadcn tag and `origin/main` source own all external claims; npm queried only for the current latest tag. |
| Implementation gates | no | If code changed, close primary-template and touched-surface gates; otherwise N/A | N/A: only this plan and its audit artifact changed. |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | Filled below and in the durable audit. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent when files changed | Markdown-only scoped Prettier check is the applicable gate; result recorded under Verification evidence. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Broad searches were capped; one truncated search and every corrected command attempt are recorded. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-25-audit-shadcn-protocol-parity.md` | Final mechanical result recorded after formatting. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Skills, prior proof, exact refs, and upstream owners read | none |
| Current-state map | completed | 22-row protocol matrix, generated counts, resolver and workflow traces | none |
| Options and recommendation | completed | Shared config/convergent template generator selected | none |
| Review / pressure pass | completed | Four material counterexamples accepted or rejected with evidence | none |
| Implementation or plan artifact | completed | Read-only audit artifact written; product implementation N/A | none |
| Verification | completed | Focused tests, source checker, 6,858 route responses, exact CLI/runtime fixture | none |
| Closeout | completed | Handoff, risks, errors, and mechanical checker recorded | user decision |

Findings:

- P1 proven defect: both template configs combine `new-york` with the
  style-less canonical Base URL. The real shadcn resolver installed a Base
  dropdown adapter over a Radix primitive, and server rendering dropped the
  trigger child.
- P2 deterministic residue: template refresh overwrites the reachable graph
  but has no managed-file or dependency pruning, so repeated generation cannot
  prove convergence across a provider change.
- P2 proof debt: provider ownership tests enumerate the four registered pairs
  but do not discover and reject a future unregistered direct provider import.
- P3 proof debt: committed template generation floats on `shadcn@latest`.
  Today latest equals the 4.19.0 pin, so no current defect is claimed.
- False alarms rejected: style presets do not need source variants; Aria may
  fail closed; the authoring app may remain `new-york`; extensionless `/rd`
  URLs redirect correctly; current upstream main adds no relevant protocol
  change after 4.19.0.

Decisions and tradeoffs:

- Recommend a narrow template/protocol repair: derive or verify both template
  configs from the shared Plate owner, generate the registry-managed boundary
  from an empty target, reconcile it deterministically, and add exact resolver
  proof.
- Reject a two-JSON-only patch as incomplete because the current false-green
  test and duplicate ownership would allow recurrence.
- Reject provider or preset copies for every item. Four physical interaction
  owners are sufficient; style names are visual presets.
- Do not run another broad `$sync-shadcn`: the upstream protocol is already
  current for this boundary.

Implementation notes:

- N/A: the user authorized an audit, not product implementation.
- Allowed writes were limited to this plan and
  `docs/plans/artifacts/shadcn-protocol-parity/audit.md`.

Review fixes:

- N/A: no product fixes were authorized.
- The pressure pass rejected intentional-legacy, transform-will-fix-it,
  all-dependencies-are-unused, and latest-is-currently-broken counterclaims at
  their exact proof boundaries.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Used `rg -E`, which treated the pattern as an encoding | 1 | Use normal ripgrep regex syntax | Reran successfully. |
| Broad Plate discovery streamed too many template/generated matches | 1 | Narrow globs and cap output | Relevant owner searches reran with exclusions; accidental output was truncated. |
| Probed a nonexistent `public/rd/editor-basic.json` before checking current generated targets | 1 | Resolve existing build targets first | Used current `public/r` for the fixture and traced CI-owned `rd` generation. |
| Ran `pnpm exec shadcn` from the root where the binary is not owned | 1 | Use the `www` filter | `pnpm --filter www exec shadcn` ran successfully. |
| Passed a relative template `--cwd` from `apps/www` | 1 | Pass an absolute consumer path | Dry run and real install succeeded. |
| Ran cwd-sensitive registry-response tests from the repository root | 1 | Run from `apps/www` | 32 passed, 0 failed, 829 assertions. |
| Used spaced `tsx --tsconfig` syntax that skipped evaluation | 1 | Use `--tsconfig=<path>` | Exhaustive response matrix ran. |
| A filtered config comparison duplicated the `apps/www` path | 1 | Invoke the absolute `www` tsx binary | Both template mismatches resolved exactly to `style` and `registries`. |
| Whole-template `tsc` exposed unrelated package drift | 1 | Narrow to the installed provider pair and runtime behavior | Exact runtime fixture reproduced the missing child. |
| Used an unmatched zsh `middleware*` glob | 1 | Search without shell glob expansion | Owner search completed. |

Verification evidence:

- Plate ref: current filesystem on
  `168a4490e2ccf90dd9b1bd3230fb2f528460caa2`.
- Upstream current ref:
  `b9938d94635fca7a4560449713b0b1ba87d77bc6`; shadcn 4.19.0 release commit:
  `1773ecfeeb4a04366978d353e69b5c7ded78dcb2`.
- The release-to-current protocol diff contains only
  `packages/shadcn/src/registry/github-auth.ts`.
- `pnpm view shadcn version --json`: `4.19.0`.
- Focused Bun suite from `apps/www`: 32 pass, 0 fail, 829 assertions.
- `pnpm --filter www exec tsx --tsconfig
./scripts/tsconfig.scripts.json scripts/check-registry-source.mts`: pass.
- Current output: 380 unique public items; 382 production JSON files including
  the item and docs indexes; four Radix overlay items.
- Exhaustive schema/route matrix: 6,858 successful responses across 18 styles
  and 381 item/index requests.
- Current canonical graph has zero Radix imports; the sparse overlay has zero
  Base imports; direct providers remain exactly the four registered owners.
- Both template configs differ from `plateComponentsJsonConfig` only at
  `style` and `registries`.
- Exact shadcn install/runtime fixture emits an empty Radix trigger with
  `render="[object Object]"`; the requested child is absent.
- `pnpm exec prettier --check` on this plan and the audit artifact: pass after
  scoped formatting.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
docs/plans/2026-08-25-audit-shadcn-protocol-parity.md`: complete.
- Durable detail:
  `docs/plans/artifacts/shadcn-protocol-parity/audit.md`.

Final handoff contract:

- Recommendation: repair template config ownership and sync convergence as one
  narrow packet; keep the four-provider-owner registry architecture.
- Confidence: high for the local P1 generator defect and current protocol
  classifications.
- Evidence: exact upstream source, complete matrix, current generated payloads,
  real CLI install, and runtime output.
- Tests / commands: focused suite, source checker, route matrix, config diff,
  provider scan, and runtime fixture recorded above.
- Browser proof: N/A. The failure is server-rendered protocol composition; no
  product UI was changed, and no visible production claim is made.
- PR / tracker: N/A. No commit, push, PR, tracker, template, generated output,
  or product source mutation was authorized.
- Caveats: external consumer prevalence, deployed state, and a final pushed ref
  were not assessed. The prior 380/380 install artifact was reused rather than
  regenerated in this read-only audit.
- Next owner: user-authorized template/protocol implementation, followed by
  template build and provider interaction proof.

Timeline:

- 2026-08-25T09:25:43.642Z Major-task goal plan created.
- 2026-08-25: resolved exact Plate, shadcn current, and shadcn 4.19.0 refs;
  current upstream protocol diff reduced to one unused GitHub-auth file.
- 2026-08-25: completed 22-row protocol matrix and current 6,858-response route
  proof.
- 2026-08-25: reproduced template provider mixing with the real shadcn CLI and
  an empty server-rendered dropdown trigger.
- 2026-08-25: wrote the durable audit, ranked findings, pressure pass, and
  read-only handoff.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete; awaiting the user's implementation decision. |
| Where am I going? | A narrow template/protocol repair if authorized. |
| What is the goal? | Classify every Plate/shadcn registry-install contract row and report current gaps without product edits. |
| What have I learned? | Registry parity is healthy; template configuration and convergence are not. |
| What have I done? | Completed the source matrix, focused proof, real runtime reproduction, ranked audit, and pressure pass. |

Open risks:

- The next template sync can generate broken mixed-provider source until both
  configs are aligned.
- An additive refresh can retain stale provider files and dependencies even
  after the config is corrected.
- A future direct provider import can escape the enumerated owner list until a
  negative discovery guard is promoted into the source checker.
- External legacy style-less registry configs may share the template failure,
  but their population is unknown.
