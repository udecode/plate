# remove plugin declaration stages

Objective:
Repair the owning inferred-declaration dependency and delete all six Code Block
declaration stages; done when direct inferred exports emit declarations and all
focused Core/Code Block/package gates pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-15-remove-plugin-declaration-stages.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- package-api

Mode:
- standard accepted-plan execution. The user explicitly authorized the
  announced Core owner fix and deletion of the six stages.

Completion threshold:
- A pre-fix direct-export fixture reproduces TS7056 or the exact current
  declaration failure is otherwise captured before repair.
- The smallest honest declaration boundary owns the fix; no new cast,
  annotation, carrier, alias, marker, public subset, or parallel API exists.
- Code Block exports the affected descriptors as direct inferred chains with
  zero `@plate-plugin-declaration-stage` markers and no stage-only private
  constants.
- Core and Code Block source-first typechecks, declaration/artifact proof,
  focused tests, stale-symbol audits, P2 autoreview, release artifacts, and
  `check-complete` pass.

Verification surface:
- Baseline direct-export declaration repro before the owner repair.
- Core compile-only plugin inference/declaration tests and focused runtime tests
  affected by the generic.
- `pnpm turbo typecheck --filter=./packages/core --filter=./packages/code-block`.
- Owning declaration/package build command needed to prove TS7056 is gone.
- Focused Code Block tests, checker tests, zero-marker/stage-symbol audits,
  Biome/diff checks, changeset validation, and P2 `autoreview`.

Constraints:
- The user's explicit `go with the long term fix` authorizes this one-shot
  execution after the exact Core/deletion scope was announced.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Preserve runtime behavior and the current public plugin call shape; this is a
  declaration-inference owner repair, not a Code Block redesign.

Boundaries:
- In scope: Core plugin builder/inference types and type tests, the two Code
  Block plugin owner files, the adoption checker/fixtures that currently track
  the debt, package release artifacts, and this plan.
- Source owners: `packages/core/src/lib/plugin/**`, Core type tests,
  `packages/code-block/src/lib/BaseCodeBlockPlugin.ts`, and
  `packages/code-block/src/react/CodeBlockPlugin.tsx`.
- Non-goals: no runtime feature redesign, no API rename, no package-wide
  colocation sweep, no docs or registry changes unless direct source evidence
  proves a stale public teaching surface.
- Direct Plite boundary owners: inspect only if Core's public normalization
  delegates the failing declaration graph to a Plite provider type; otherwise
  N/A.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Stop only after three distinct owner-level generic/declaration approaches
  reproduce the same irreducible compiler limit with minimized fixtures and no
  smaller source-compatible repair remains.

Plate Plan state:
- status: done
- phase: prove and hand off
- next: user review
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Long-term owner fix only; delete all six stages; no compatibility path or unrelated package redesign. |
| Active goal and plan verified | yes | Prior doctrine goal is complete; this new plan is the one-shot implementation ledger. |
| Current owners read | yes | Read Plate/common Vision, plugin authoring/typing, Code Block owners, Core builder/compiler/adapter types, checker, and emitted declarations. |
| Best API target resolved | yes | Direct inferred public export; repair the honest owner boundary rather than stage package declarations. |
| Mode and execution boundary resolved | yes | One-shot execution explicitly authorized by the user's latest `go`. |
| Package/API pack selected | yes | `package-api` rows are materialized in this plan. |
| Public surface or package boundary identified | yes | Core declaration inference and Code Block emitted descriptor declarations. |
| Release artifact path selected | no | N/A: every removed stage/helper is branch-only and absent from `main`; no upgrading user sees this cleanup. |
| `changeset` skill loaded when `.changeset` is required | no | Read the skill to classify against `main`; it forbids a changeset for branch-only machinery. |
| Barrel/export impact decision recorded | yes | Removing the dead Core internal type changes a generated barrel; `pnpm --filter @platejs/core brl` passed. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: no artifact because the removed machinery is absent from `main`.
- [x] Package/API pack: `.changeset` was loaded for classification; its no-user-delta rule rejects a branch-history changeset.
- [x] Package/API pack: registry changelog is not applicable because no registry source changed.
- [x] Package/API pack: no-artifact decision records no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility is N/A because the public descriptor call shape and runtime behavior are unchanged.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded.
- [x] Package/API pack: Core and Code Block barrels were regenerated; no release notes are required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Direct declaration builds pass; no workaround remains. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final production symbol audit and emitted declaration audit are clean. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Existing direct-inference doctrine was applied; no public call shape changed. |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Browser attempt is recorded as blocked by unrelated stale registry generation; package behavior tests cover this non-rendering type repair. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Exact commands and counts are in the proof matrix and verification section. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff below is complete. |
| P2 autoreview | yes | Run with `--max-priority P2` for implementation changes | Final rerun clean: no accepted/actionable findings, correctness 0.93. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-15-remove-plugin-declaration-stages.md` | Run after this ledger update. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Four descriptors remain direct inferred exports; only a dead internal Core helper/export was deleted. |
| Release artifact classification | yes | Record published impact | No published user-visible delta from `main`; branch-only declaration machinery was removed. |
| Published package changeset | no | Add only for a published user delta | N/A: a changeset would narrate branch history, which the changeset skill forbids. |
| Registry changelog | no | Use only for registry-only changes | N/A: no registry source changed. |
| No release artifact | yes | Record exact reason | Internal/test-only cleanup with no published user-visible delta from `main`. |
| Package typecheck/build/test | yes | Run owning package checks | 13/13 typecheck tasks, both builds, Code Block 64/64, Core 695/695. |
| Barrel/export generation | yes | Regenerate affected barrels | Core and Code Block `brl` commands passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Owners, red declaration gate, and source boundary captured | Decide |
| Decide | completed | Whole-editor type capture identified as the actual owner defect | Prove and hand off |
| Prove and hand off | completed | Direct emit, package proof, audits, and P2 review pass | User review |

Decision brief:
- outcome: all four affected descriptors emit directly without declaration stages.
- chosen shape: keep `read.entry` honestly generic over `Element`; it performs
  runtime narrowing and must not encode the whole installed editor in its
  exported constraint.
- strongest rejected alternative: restore a private stage, return annotation,
  capability subset, or public Core compiler carrier.
- consequence: public API and runtime behavior stay unchanged while declaration
  size falls below TypeScript's emitter ceiling.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `read.entry` generic constraint | `ElementOf<typeof editor>` captured every installed element/schema capability | `N extends Element = Element` | Code Block | The function accepts an arbitrary element and narrows code-line/block identity internally | Direct source replacement | Four direct declaration exports build | A caller relying only on the old constraint still has the same `Element` domain | accept |
| Descriptor topology | Six private declaration stages/carriers | Four direct inferred exports | Code Block / React adapter | One owner, one chain, no declaration machinery | Delete stages, aliases, markers, forwarding exports | Source and emitted-declaration audits | TS7056 recurrence | accept; guarded by build and checker |
| Dependency adapter helper | Internal type used only by deleted React stage | Delete helper and generated internal export | Core React | Dead compiler machinery has no owner | Remove source type; regenerate barrel | Core build/typecheck/tests | Hidden consumer | accept; zero source consumer |
| Recurrence guard | Marker-only debt tracking | Reject declaration stages and whole-editor node type capture | Adoption checker | Prevent both workaround and root-cause pattern | Update allowlist and focused fixtures | 61/61 checker tests; production Code Block rows clean | Static rule could be too broad | limited to production package plugin authoring files |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| Reproduce | Code Block | Direct exports with all carriers removed | Existing staged source | Four TS7056 sites captured | Sequential package build fails at exact four exports |
| Repair | Code Block | Honest generic constraint plus direct chains | Red emit | Package declaration build passes | Typecheck/build and emitted `.d.ts` audit |
| Delete | Core React | Dead stage-only adapter type/export | Direct React exports | Zero consumer/export | Core `brl`, build, typecheck, tests |
| Guard | Adoption checker | Marker rejection, topology, whole-editor capture fixture | Repaired source | Focused tests pass and current Code Block rows are clean | 61/61 plus repo audit boundary |
| Close | Goal/review | Proof, browser boundary, release classification | Green focused gates | Clean P2 review and complete ledger | Autoreview + check-complete |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Direct inferred descriptors emit | Four TS7056 sites reproduced after deleting carriers | `pnpm --filter @platejs/code-block build` passes | pass |
| Public capability behavior is unchanged | Only generic constraint and topology changed | Code Block 64/64 | pass |
| Core adapter cleanup is safe | Helper had no consumer after stage deletion | Core build/typecheck and 695/695 tests | pass |
| Type inference remains sound | Whole-editor capture replaced by honest broad domain; runtime narrowing retained | Core contracts included in 13/13 typecheck tasks | pass |
| Workaround cannot return | Checker rejects marker and `ElementOf/TextOf<typeof editor>` in production package authoring | 61/61 checker tests | pass |
| Emitted package surface is clean | Direct exports and zero carrier symbols | Build plus `rg` over `dist/**/*.d.ts`; 37,034 bytes total | pass |

Conditional evidence:
- High-risk scenarios: declaration emit and dependency inference were the risk;
  covered by Core contracts, both builds, package tests, and emitted `.d.ts`
  inspection.
- External research: N/A; the failure and owner were fully reproducible in the
  current checkout.
- Issue/PR provenance: N/A; this is user-directed local architecture cleanup.
- Docs/registry/browser/release/behavior-law owners: no public docs or runtime
  call shape changed. Browser verification was attempted and blocked before
  Code Block loaded by unrelated stale generated registry imports. No registry
  source was changed and the forbidden generator was not run.

Findings:
- The six annotated stages were not merely stale syntax. Removing their marker,
  carrier aliases, and public forwarding constants while retaining private
  stage constants still let declaration build pass.
- Collapsing all four plugin chains to direct public exports and removing the
  one-use `CodeBlockRead` / `CodeBlockUpdateFor` aliases reproduces TS7056 at
  `BaseCodeBlockPlugin`, `BaseCodeHighlightPlugin`, `CodeBlockPlugin`, and
  `CodeHighlightPlugin`.
- Source-first typecheck remains green because TS7056 is declaration-emission
  only; `pnpm --filter @platejs/code-block build` is the owning red gate.
- Direct type inspection exposed one recursive dependency in the public read
  contract: `ElementOf<typeof editor>` encoded the complete installed editor in
  `entry`'s generic constraint. Replacing it with the function's honest
  `Element` domain removed all four TS7056 errors without changing Core's
  public compiler model.
- `InternalPlateDependencyAdapterDefinition` exists only to type the two React
  stages. It has no remaining source consumer after direct exports and must be
  deleted with the owner fix.
- Browser proof is currently blocked before Code Block loads by unrelated stale
  generated registry imports of deleted `editor-kit.tsx` and `plate-types.ts`.

Decisions and tradeoffs:
- Keep all four direct public chains in source while repairing Core; do not
  restore stage markers, private descriptor constants, explicit plugin
  annotations, or forwarding exports.
- Reject the first successful build with private read/update aliases as the
  final result. It still used one-use declaration carriers and hid the real
  TS7056 boundary.
- No changeset: the workaround and internal helper never existed on `main`, so
  release prose would describe branch history rather than user impact.

Review fixes:
- P1 React finding rejected as stale/non-matching: the live React owner already
  uses direct exports, has no carrier imports or markers, and typecheck passed.
- P2 private capability-carrier finding accepted: removed `CodeBlockRead` and
  `CodeBlockUpdateFor`; the resulting four-site TS7056 failure is the exact
  owner-level red proof.
- Final P2 review found no actionable issue and rated the scoped patch correct
  with 0.93 confidence.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Ran Code Block build concurrently with dependency builds | 1 | Rerun sequentially after dependency graph settles | Sequential build produced the real four-site TS7056 failure instead of transient missing-module noise. |
| Browser route failed before editor load | 1 | Preserve package proof and report the unrelated registry blocker | Dev server named missing generated imports; no registry source or forbidden generator was touched. |
| Removed eager schema carriers while testing the Core hypothesis | 1 | Restore the required schema carrier and inspect the emitted public method type | The experiment was fully reverted; codec inference returned, and the actual whole-editor constraint was found. |
| Removed extension provider intersections during a bounded experiment | 1 | Restore exact source before continuing | The experiment did not affect TS7056 and was fully reverted; final Core diffs contain only the dead adapter helper/export deletion. |
| Updated the production topology allowlist before its exact fixture | 1 | Rewrite the fixture as the same two direct chains | Checker suite returned to 61/61. |

Verification evidence:
- Red gate: sequential `pnpm --filter @platejs/code-block build` failed with
  TS7056 at lines 87 and 755 in Base, and lines 14 and 19 in React after all
  carriers were removed.
- Green declaration proof: `pnpm --filter @platejs/core build` and
  `pnpm --filter @platejs/code-block build` pass.
- Source-first proof: `pnpm turbo typecheck --filter=./packages/core
  --filter=./packages/code-block` passes 13/13 tasks, including Core contracts.
- Behavior proof: Code Block 64/64 and Core 695/695 pass. Core retains its
  existing non-blocking React list-key warning.
- Checker proof: focused suite passes 61/61. The full repo audit has no Code
  Block finding; it remains red on unrelated shared WIP in registry, docs,
  Element ID, list-classic, media, Plite, suggestion, and Yjs.
- Export proof: Core and Code Block barrel generation passes. Emitted Base and
  React declarations contain the four direct descriptors and no stage/carrier
  symbol; their combined declaration size is 37,034 bytes.
- Format proof: scoped Core and Code Block lint pass with no fixes; scoped
  Biome and diff checks pass.
- Review proof: final P2 autoreview is clean with no accepted/actionable
  findings and 0.93 correctness confidence.

Final handoff prepared:
- Ownership and target API: Code Block owns the false public generic
  dependency; direct inferred Base and React descriptors are the final API.
- Public breaks and adoption: none. No compatibility alias, migration, or
  consumer edit is required.
- Applicable runtime/package/docs/browser decisions: runtime behavior and docs
  are unchanged; browser proof is blocked by unrelated generated registry
  drift; package behavior and declaration proof pass.
- Proof and execution risks: declaration emit, contracts, tests, barrels,
  checker fixtures, format, and P2 review pass. The repo-wide checker remains
  red only outside this packet.
- Execution order and user attention: no follow-up is required for this packet;
  separate shared-WIP owners must close the unrelated repo checker rows.

Timeline:
- 2026-08-15T07:53:38.542Z Plate Plan created.
- 2026-08-15 Direct private-stage inference built successfully, proving the old
  explicit descriptor annotations and markers were removable.
- 2026-08-15 Collapsed all four public chains, deleted capability aliases, and
  reproduced TS7056 at the four direct exported descriptors.
- 2026-08-15 Core/Code Block typecheck, 64 Code Block tests, and 61 checker
  tests passed before the final root-cause constraint repair.
- 2026-08-15 Replaced the leaked whole-editor constraint with `Element`, rebuilt
  four direct declarations, removed the dead Core adapter carrier, updated the
  recurrence guard, and completed package/review proof.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Completed long-term declaration repair |
| Where am I going? | User handoff |
| What is the goal? | Direct inferred Code Block exports with no declaration staging or carriers |
| What have I learned? | One `ElementOf<typeof editor>` constraint was enough to serialize the complete installed editor through dependencies |
| What have I done? | Removed all six stages/carriers, fixed the honest generic boundary, added recurrence proof, and passed focused closure gates |

Open risks:
- The repo-wide adoption audit is not globally green because of unrelated
  shared-checkout work. This packet introduces no remaining scoped finding.
- Browser proof cannot run until the generated registry stops importing the
  deleted `editor-kit.tsx` and `plate-types.ts`; package runtime tests are green.
