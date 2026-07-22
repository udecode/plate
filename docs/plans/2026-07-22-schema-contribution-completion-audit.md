# Schema contribution completion audit

Objective:
Confirm schema contribution architecture completion; done when plan gates,
deletion audits, tests, browser, benchmarks, review, and checker are
independently verified.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-22-schema-contribution-completion-audit.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Mode:
- `deep`: the completion claim spans public types, compiler/runtime behavior,
  Plate adoption, DOM/React, History/Yjs, browser proof, benchmarks, docs, and
  release artifacts. The audit is read-only unless the user later asks for
  repairs.

Completion threshold:
- Confirm complete only if every original slice/deletion/adoption gate is
  closed in live source, all named focused and broad proof is green, browser
  and benchmark gates are green, independent review has no accepted unresolved
  finding, both the implementation plan and this audit plan pass
  `check-complete`, and no old public compatibility shape remains.

Verification surface:
- Original execution plan state/evidence and every slice/deletion gate.
- Live-source audits for old/new schema contribution APIs, Plate model
  declarations, immutable config, explicit references, compiled host bindings,
  React schema deltas, content roots, clipboard, History/Yjs, docs, exports,
  fixtures, and packed consumers.
- Exact commands recorded by the implementation plan, fresh focused reruns,
  `check:plite`, browser Chromium/matrix proof, strict schema benchmarks,
  relevant Plate package/type checks, and `autoreview` evidence.

Constraints:
- Read-only confirmation. Do not implement or repair findings in this run.
- No public compatibility aliases or runtime shims.
- Current source and fresh command output outrank the execution plan's prose.
- Do not lower browser, benchmark, docs, release, or review proof requirements
  merely because implementation source looks complete.

Boundaries:
- In scope: the full accepted plan
  `docs/plans/2026-07-21-wordgard-plite-schema-contribution-architecture.md`
  and all implementation/proof owners it names.
- Source owners: `packages/plite*`, `packages/core`, production Plate packages,
  `packages/yjs`, `apps/plite`, `apps/www/src/registry`, docs, benchmarks,
  tooling contracts, exports, and release consumers.
- Non-goals: architecture redesign, implementation repairs, commits, pushes,
  PRs, or unrelated repository health.
- Direct Plate/collaboration adoption owners: all Plate semantic plugin
  declarations, History, Yjs, DOM/React host bindings, codecs, docs/examples,
  and packed release consumers named by the original plan.

Output budget strategy:
- Read the active implementation plan and named owners first. Use exact
  deletion patterns and file counts before printing matches. Exclude
  `node_modules`, `dist`, `.next`, `.turbo`, coverage, generated registry JSON,
  templates, lockfiles, and historical plans from broad scans. Cap command
  output; inspect failures by owner rather than streaming full logs.

Blocked condition:
- Block only if a required browser/runtime command cannot run after the owning
  local recovery path, or a required implementation owner is unreadable. A
  failed gate is a negative confirmation, not a blocker.

Plite Plan state:
- status: complete-negative
- phase: prove-and-handoff
- next: repair the two deterministic contract failures, then rerun closure
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Binary confirmation requires every original source, proof, browser, benchmark, review, and checker gate; no repairs are authorized. |
| Active goal and plan verified | yes | Goal `019f846a-83b0-7891-949b-7e77c5e0325f`; this exact audit plan is its artifact. |
| Current owners read | yes | Governing skills/doctrine and the original plan's current state, open errors, verification ledger, closure gates, and risks were read before audits. |
| Mode and execution boundary resolved | yes | Deep, read-only completion audit; no repairs authorized. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Audit every original slice, hard deletion, adoption owner, and open risk
  against current source rather than accepting plan prose.
- [x] Prove final public API/type shapes and zero old compatibility surfaces.
- [x] Re-run focused model/type/config/History/Yjs/DOM/React/codec proof.
- [x] Resolve strict schema benchmark applicability: not run because mandatory
  focused semantic and type prerequisites failed deterministically.
- [x] Re-run the formerly red focused Chromium row; resolve browser-matrix
  applicability as not run after the mandatory prerequisites failed.
- [x] Resolve broad package/release applicability: `check:plite:dev` failed at
  its first typecheck step, so stricter downstream closure was not executable.
- [x] Resolve independent current-tree autoreview applicability: no code was
  changed by this read-only audit and positive closure already failed before
  review.
- [x] Reconcile implementation plan status/checklist/gates/evidence with live
  results and run both plan checkers.
- [x] Produce a binary confirmed/not-confirmed handoff with exact blockers or
  residual risks; do not soften partial completion.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | no | Resolve every readiness condition | Not confirmed: two deterministic focused failures, Plite typecheck red, canonical dev gate red, and implementation-plan checker red. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Fresh owner tests, typecheck, adoption checker, source inspection, Chromium proof, and plan checker recorded below. |
| Conditional risk and adoption | yes | Complete triggered risk/browser/benchmark/provenance work or give one scoped N/A reason | Adoption audit passed; expensive matrix/benchmark/release closure was not run after mandatory focused prerequisites failed. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Exact commands and results recorded below. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Negative handoff names both owning failures and the green browser/adoption evidence. |
| Autoreview | N/A | Run for implementation changes or record planning-only N/A | Read-only audit changed no implementation; positive completion failed before review. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-schema-contribution-completion-audit.md` | Passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Original plan, source owners, skills, and doctrine read | Decide |
| Decide | completed | Positive confirmation requires every mandatory gate; deterministic red prerequisites reject it | Prove and hand off |
| Prove and hand off | completed | Fresh static, focused, browser, dev-gate, and dual-plan-checker evidence recorded | User repair decision |

Decision brief:
- outcome: independently confirm or reject the user's completion claim.
- chosen shape: source audit followed by focused proof, expensive closure gates,
  review, and dual-plan checker verification.
- strongest rejected alternative: trust the execution plan's claimed green
  rows or run only `check:plite`.
- consequence: one red required gate means not confirmed, even if most source
  migration is complete.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Original architecture slices | Implementation plan claims substantial completion but still records browser/broad gates open | Every slice exit and deletion gate independently true | Original plan owners | A prose-complete plan can still overclaim source/runtime closure | Full Plite/Plate/DOM/React/History/Yjs/docs/release surface | Source audits plus named commands | Very broad WIP; stale evidence | gate |
| Public hard cut | Old `schema.contribution`, Plate `node.*`, magic string resolution, split host truths must be absent | One final API only | Plite + Plate core | Compatibility residue defeats the architecture | All package/app/docs callers | Exact `rg`/AST audits and type contracts | Tests may preserve obsolete syntax | cut |
| Browser/runtime behavior | Original plan records a heading-start Chromium regression and open matrix | Required focused Chromium and matrix green | Plite React/browser + apps | Model/type proof cannot confirm DOM/input behavior | Browser fixtures and demos | Browser runner commands/artifacts | Known prior red row | gate |
| Performance | Strict schema/compiler/construction/locality targets must remain green | Registered thresholds pass fresh | Benchmark owners | Architecture completion includes locality/compile promises | Benchmark corpus/targets | Strict benchmark commands | Machine noise; use registered criteria | gate |
| Review/release | Packed consumer and current-tree review must be green | No accepted unresolved findings; release consumer passes | Tooling + package owners | Source migration can miss exports/generated barrels/downstream types | Barrels/docs/packed fixtures | Packed gate, autoreview, checkers | Existing WIP may include unrelated failures | gate |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Static closure audit | Original plan + all named owners | Read plan state, enumerate required commands and exact deletion patterns | Complete source/adoption/deletion matrix | Source citations and zero-old-symbol audits |
| 2. Focused semantic proof | Plite/Plate/History/Yjs/DOM/React/codecs | Static matrix resolved | All focused tests/typechecks green | Exact command results |
| 3. Expensive closure proof | Browser, benchmarks, broad checks, release | Focused proof green | Registered browser/benchmark/broad/release gates green | Exact durations/results/artifacts |
| 4. Independent review and dual checker | Current tree and both plan files | All executable proof complete | Zero accepted unresolved findings and both checkers green | Autoreview ledger + checker output |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| One final public architecture | Original hard-cut/deletion ledgers | Adoption owner checker audited 4,509 source files with no deleted authoring shape | passed-static |
| Semantic correctness | Original focused proof owners | 210 passed, 3 failed combined; two failures reproduce alone | failed |
| Browser behavior | Original known red/open browser rows | Formerly red Markdown heading-start Chromium row passed 1/1 under Node 22; matrix not run after prerequisite failures | focused-passed, closure-not-run |
| Performance/locality | Registered schema benchmark targets | Not run after mandatory semantic/type prerequisites failed | closure-not-run |
| Release/adoption | Original 4,509-file/packed claims | Static adoption passed; `check:plite:dev` failed at Plite typecheck before downstream proof | failed |
| Review closure | No implementation review accepted on prose alone | N/A for a read-only negative audit; positive closure failed before review | not-applicable |

Conditional evidence:
- High-risk scenarios: live validator cache rebinding, schema-only React
  invalidation, immutable config replacement, typed reference inference,
  projected clipboard/root ownership, History/Yjs identity, heading-start input.
- External research: N/A: confirmation is against accepted local architecture
  and live checkout.
- Issue/PR provenance: N/A: no issue/PR claim or mutation requested.
- Browser/benchmark/docs/release/behavior-law owners: all apply and remain
  mandatory because the accepted plan explicitly changed those surfaces.

Findings:
- The implementation plan currently says slices 1-9 complete but still records
  one heading-start Chromium failure and broader browser/repository closure as
  open. The user's completion claim therefore needs fresh evidence, not a
  checker-only confirmation.
- The formerly red heading-start Chromium row is repaired: it passes 1/1 with
  the repository-required Node 22 runtime.
- `PropertyPolicy` is structurally assignable in
  `packages/plite/src/interfaces/schema.ts`, so the intended nominal type
  contract in `schema-definition.test.ts` fails with an unused
  `@ts-expect-error`. Runtime construction also accepts the same forged policy
  because `defineTyped` does not assert the policy token when no default is
  present. This is one defect observed by both runtime and type proof.
- `compilePlateModel.spec.ts` deterministically fails its block-container
  classification fixture because the compiled schema rejects inline-only
  content without canonical text spacers. The fixture or the owning compiler
  rule is inconsistent; completion remains false either way.
- The combined focused run timed out once on the 50,000-owner incremental
  lookup, but the exact test passed 16/16 alone in 3.91 seconds. It is not a
  deterministic blocker.
- The canonical development gate fails in 17.64 seconds at Plite typecheck on
  the unused `@ts-expect-error`; it never reaches package tests, contracts, or
  browser smoke.
- The original implementation plan checker remains red because slice 10 and
  final proof/checklist work are open.

Decisions and tradeoffs:
- Use the original plan as requirement authority but never as behavioral proof.
- Run cheap deletion/type/focused gates before expensive browser/matrix gates.
- Do not repair failures; report them as negative confirmation with owner.
- Stop expensive closure work once deterministic required prerequisites fail;
  a browser matrix or benchmark cannot turn a red public contract green.

Review fixes:
- N/A: this confirmation run made no implementation changes.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Broad legacy-symbol `rg` included generated registry JSON and historical plan prose | 1 | Use the owner checker and exclude generated/historical outputs | Adoption checker passed across 4,509 JS/TS source files. |
| Browser command inherited Node 24 while the runner requires Node 22 | 1 | Use `fnm exec --using=v22` | Focused Chromium row passed 1/1. |
| 50,000-owner incremental test timed out in the combined run | 1 | Rerun the exact owner test alone | Passed 16/16 in 3.91 seconds. |

Verification evidence:
- `node --test tooling/scripts/check-plate-schema-adoption.test.mjs`: 4/4
  passed.
- `node tooling/scripts/check-plate-schema-adoption.mjs`: passed; audited 4,509
  JavaScript/TypeScript source files; no deleted authoring shape.
- Focused twelve-owner Bun suite: 210 passed, 3 failed. The incremental timeout
  passed alone; the forged-policy runtime contract and Plate model fixture fail
  alone.
- `bun test --preload ./config/plite-source-test-setup.ts
  ./packages/plite/test/schema-definition.test.ts`: 11 passed, 1 failed.
- `bun test --preload ./config/plite-source-test-setup.ts
  ./packages/core/src/internal/plugin/compilePlateModel.spec.ts`: 16 passed,
  1 failed.
- `bun test --preload ./config/plite-source-test-setup.ts
  ./packages/plite/test/incremental-schema-validation.test.ts`: 16/16 passed in
  3.91 seconds.
- Focused Plite/Core/DOM/React/History/Yjs Turbo typecheck: failed at
  `packages/plite/test/schema-definition.test.ts:544` with TS2578, unused
  `@ts-expect-error`.
- `fnm exec --using=v22 -- pnpm --filter plite
  test:plite-browser:chromium markdown-shortcuts.test.ts --grep "inserts a
  paragraph before a heading from the heading start"`: 1/1 passed; runner 3.8
  seconds, total 18.06 seconds.
- `fnm exec --using=v22 -- pnpm check:plite:dev`: failed in 17.64 seconds at
  the Plite typecheck with the same TS2578 contract failure.
- Original implementation-plan `check-complete.mjs`: failed because slice 10,
  prove-and-handoff, and final checklist rows remain open.
- Audit-plan `check-complete.mjs`: passed.

Final handoff prepared:
- Ownership and target API/runtime: architecture is largely landed, but
  `PropertyPolicy` nominal construction is not enforced by type or runtime.
- Public breaks and Plate/collaboration adoption: static adoption/deletion audit
  is green across 4,509 source files.
- Applicable browser/benchmark/docs/release decisions: the known Chromium row
  is green; matrix, benchmark, packed release, and broader gates remain
  inapplicable until focused/type prerequisites pass.
- Proof and execution risks: two deterministic failures remain; the isolated
  50,000-owner row is green and is not counted as a blocker.
- Execution order and user attention: repair policy token enforcement and the
  inline-only model fixture/compiler contract, rerun focused/type/dev gates,
  then benchmarks, full Chromium/matrix, packed release, autoreview, and both
  plan checkers.

Timeline:
- 2026-07-22T08:12:51.598Z Plite Plan created.
- 2026-07-22T08:35:00Z Static adoption/deletion audit passed across 4,509 files.
- 2026-07-22T08:42:00Z Focused proof isolated two deterministic failures and
  cleared the combined-run incremental timeout.
- 2026-07-22T08:48:00Z Formerly red Chromium regression passed under Node 22.
- 2026-07-22T08:55:00Z Canonical dev gate failed at the same nominal policy
  type contract; binary completion rejected.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Negative handoff complete |
| Where am I going? | No further action without repair authorization |
| What is the goal? | Binary independent confirmation of the completed schema contribution architecture. |
| What have I learned? | The migration is largely landed and the known browser bug is fixed, but two deterministic contracts and canonical typecheck remain red. |
| What have I done? | Audited deletion/adoption, focused semantics/types, the known browser row, canonical dev proof, and both plan states. |

Open risks:
- Property policies can currently be forged structurally and accepted at
  runtime when no default triggers validation.
- Plate model compilation has an unresolved inline-only content contract.
- Browser matrix, strict benchmarks, packed release proof, broad repository
  closure, autoreview, and final plan checkers still need execution after the
  focused blockers are repaired.
