# hard cut caller selected read update generics

Objective:
Hard-cut four caller-selected generic escape hatches so update capabilities,
Yjs cursor data, schema properties, and command dispatch infer from owned inputs
or return `unknown`; finish when all positive legacy call sites are gone and
Plite, Core, Yjs, Plite React, release, and agent-doctrine proof passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-15-hard-cut-caller-selected-read-update-generics.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- package-api
- agent-native

Mode:
- `standard`

Completion threshold:
- Zero positive call sites for `editor.update<TTx>`, method-level Yjs cursor
  result generics, raw-string `getProperty<T>`, or explicit
  `update.command<TCommand>`; exact descriptor/input inference and runtime
  behavior remain covered; owning typechecks/tests, changesets, doctrine sync,
  P2 review, and `check-complete` pass.

Verification surface:
- Focused `rg` audits for the four rejected generic forms; Plite/Core/Yjs/Plite
  React source-first typechecks and focused tests; package lint; changeset
  validation; Plate Next doctrine version/fingerprint validation; generated
  skill mirror parity; P2 autoreview.

Constraints:
- The user explicitly accepted execution with `go cut` after the four-surface
  audit; implementation is authorized in this plan.
- No public compatibility aliases or runtime shims.
- Preserve atomic update semantics, existing command runtime behavior, and Yjs
  collaboration behavior. Do not weaken untrusted cursor-data validation to a
  type assertion.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.

Boundaries:
- In scope: Plite/Core public types, Yjs descriptor/controller/React hooks,
  affected tests/docs, package changesets, and owning agent doctrine.
- Source owners: `packages/plite`, `packages/core`, `packages/yjs`,
  `packages/plite-react`, `.agents/rules`, and the smallest relevant Vision
  detail.
- Non-goals: node-selector generics already rejected by type tests, inferred
  callback-result generics, unrelated plugin/API cleanup, registry UI changes,
  and compatibility aliases.
- Direct Plite boundary owners: Plite owns update/schema/command contracts;
  Yjs owns cursor-data trust and descriptor inference; Core mirrors Plate
  update capabilities without a second policy.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Block only after three distinct owner-level attempts cannot preserve exact
  descriptor inference plus runtime cursor-data safety without a new public
  user decision.

Plate Plan state:
- status: done
- phase: prove-and-handoff
- next: none
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Four accepted hard cuts and no unrelated API work recorded above |
| Active goal and plan verified | yes | Active goal names this plan and the four exact zero-call-site outcomes |
| Current owners read | yes | Live Plite/Core/Yjs/React signatures from pre-execution audit |
| Best API target resolved | yes | `best-api`: generics must correlate with typed inputs or validating descriptors |
| Mode and execution boundary resolved | yes | Standard one-shot execution authorized by `go cut` |
| Package/API pack selected | yes | Public type/API hard cut across four packages |
| Public surface or package boundary identified | yes | Plite substrate, Core projection, Yjs collaboration, Plite React adapter |
| Release artifact path selected | yes | Package changesets required; no registry changelog |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded before updating the three owning major migration changesets |
| Barrel/export impact decision recorded | yes | Existing wildcard type export owns `YjsCursorDataSchema`; no export file or layout changed, so `pnpm brl` is N/A |
| Agent-native pack selected | yes | Reusable API doctrine changes require source-rule repair and mirror sync |
| Agent-facing action surface identified | yes | `best-api` plus intersecting Plate/Plite worker rules |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`; regenerate `.agents/skills/**` with `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded; source rules, generated mirrors, action discovery, version registry, and fingerprint were audited |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Four hard cuts implemented with zero positive legacy calls and exact negative type contracts |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final `rg`, owner source, diff, API reference, changeset, doctrine, and test audits are fresh |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Caller generic honesty law is recorded; P2 review holes were fixed at the callback and Yjs extraction owners |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Runtime validation, docs, changesets, API manifest, doctrine, mirrors, and browser-smoke proof complete; direct docs Browser block recorded |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Exact commands and results are listed below |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Final ownership, adoption, proof, and two unrelated checkout blockers are recorded below |
| P2 autoreview | yes | Run with `--max-priority P2` for implementation changes; P3 is opt-in only, or record planning-only N/A | Two in-scope P2 holes fixed; second cycle's sole selector finding rejected as unchanged, pre-existing, and explicitly out of scope |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-15-hard-cut-caller-selected-read-update-generics.md` | Run after this evidence update |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Plite owns update/schema/command contracts; Core projects update; Yjs owns validated cursor data; Plite React only forwards inferred commands |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published breaking type/API behavior in Plite/Core/Yjs/Plite React |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Updated the three owning major migration changesets; `changeset status` passes with no forbidden minor added |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | Not registry-only; package changesets own this published API cut |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | A release artifact is required and present |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Four-owner turbo typecheck 14/14; Yjs 220/220; Plite React 1040/1040; final broad affected gate passed |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | No exported path/file layout changed; public Yjs type lives under the existing wildcard export |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install`, Plate Next v80 validation, and doctrine fingerprint pass |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `best-api` teaches caller generic honesty; `plate-next` audits stale dishonest generics |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Source/mirror/action/version mapping audited with no accepted finding |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Current owners, accepted target, and boundaries recorded | Decide |
| Decide | completed | Four hard-cut outcomes fixed; Yjs validator descriptor selected as runtime/type owner | Execute and prove |
| Prove and hand off | completed | Broad affected gate, runtime tests, doctrine/release proof, and P2 review closed | User review |

Decision brief:
- outcome: caller code cannot forge capabilities or result types.
- chosen shape: installed descriptor/input inference; validated Yjs cursor-data
  ownership; raw dynamic property strings return `unknown`.
- strongest rejected alternative: keep method-level generics as convenient type
  assertions or add deprecated aliases.
- consequence: callers migrate once to exact descriptors/handles or accept
  `unknown`; package types become more truthful and simpler.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Root update | caller adds arbitrary `TTx` | installed extension/plugin tuple only | Plite + Core | prevents forged transaction methods | remove public generic and migrate tests | source/type tests | Core projection drift | accepted |
| Yjs cursors | caller selects `TCursorData` on each read/hook | one validating descriptor-owned cursor-data contract | Yjs | network data needs one runtime/type owner | migrate core, React hooks, tests, docs | Yjs typecheck/tests | validation and React inference | accepted |
| Schema property | raw string caller selects result `T` | typed handle infers; raw string returns `unknown` | Plite | dynamic strings cannot prove a value type | migrate positive type test/callers | Plite/Core type tests | handle discoverability | accepted |
| Command dispatch | caller repeats `TCommand` | infer from command argument | Plite React | command input already owns correlation | delete explicit type argument | Plite React typecheck/tests | overload inference | accepted |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1 | Plite/Core | remove forged update/schema/command generics and repair inference | accepted target | zero positive old calls; type tests prove rejection/inference | focused typechecks/tests |
| 2 | Yjs | bind remote cursor data to a validating extension/factory contract and migrate React | slice 1 contracts stable | no method-level generic calls; runtime/type proof | Yjs tests/typecheck |
| 3 | Release/doctrine | changesets, current-state docs, best-api/Vision/worker repair, version bump, mirrors | slices 1-2 green | zero stale teaching and valid doctrine fingerprint | changeset/rule audits + `pnpm install` |
| 4 | Closure | lint, package/root focused gates, P2 review, plan checker | all edits complete | no accepted P0-P2 finding and checker green | exact commands recorded below |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Update capabilities cannot be forged | signatures and positive calls audited | caller generic and explicitly narrowed callback both fail; Plite/Core and 51-package typechecks pass | passed |
| Cursor data is inferred and runtime-owned | Yjs core/React owners audited | exact transaction/hook type contracts, invalid payload runtime tests, Yjs 220/220 | passed |
| Raw strings cannot lie about property result | `getProperty` overload and caller audited | `unknown` negative and semantic-handle positive Core type contracts | passed |
| Command dispatch infers from input | explicit React forwarding call audited | descriptor/input inference typecheck plus Plite React 1040/1040 | passed |
| Migration is complete and taught once | callers/docs/rules audited | only deliberate negative/doctrine matches; changesets, v80 mirrors, fingerprint, API reference pass | passed |

Conditional evidence:
- High-risk scenarios: untrusted remote awareness payloads and descriptor type
  propagation are covered by Yjs runtime/type tests; update atomicity stays
  unchanged because this is a type-surface cut.
- External research: N/A; accepted design and live repository owners are
  authoritative.
- Issue/PR provenance: N/A; user-directed local API migration.
- Docs/registry/browser/release/behavior-law owners: current-state Yjs docs,
  package changesets, API reference, and doctrine are updated. Browser opening
  `/docs/plite/libraries/plite-yjs` was blocked before render because stale
  generated registry code imports the intentionally removed
  `editor-kit.tsx` and `plate-types.ts`; repo policy forbids local
  `build:registry`. The package-facing Chromium smoke passed 3/3.

Findings:
- Four remaining positive escape hatches were identified: duplicated root
  update generics in Plite/Core, method-level Yjs cursor generics, raw-string
  schema property result generics, and one explicit command generic forwarding
  call.
- Existing negative node-query/update generic tests are proof and remain.

Decisions and tradeoffs:
- A generic survives only when an input or exact descriptor determines it.
- Yjs cursor data crosses a trust boundary, so a bare `yjs<CursorData>()`
  assertion is rejected in favor of a validating descriptor-owned contract.
- No compatibility period: this is an intentional hard cut.

Review fixes:
- P2 review found callback bivariance still accepted an explicitly narrowed,
  fabricated transaction. Removed bivariance from Plite and Plate update
  callbacks and added a negative annotation contract.
- P2 review found `InstalledYjsTx` constrained exact cursor data against broad
  default `YjsTx`, allowing fallback widening. The constraint now uses
  `YjsTx<any>` only at the internal extraction boundary, with a compile contract
  proving invalid descriptor-owned cursor data is rejected.
- Second-cycle P2 review reported the unchanged `PlateNodeSelectorSet` excess
  property inference behavior. Rejected for this cut: it predates the four
  changed signatures, is outside every edited hunk, and the plan explicitly
  excludes node-selector API redesign. It remains a legitimate separate API
  follow-up.
- Initial broad review findings against aggregate generated API-reference drift
  were rejected as unrelated to these four owners; one Yjs note explicitly
  concluded there was no defect.
- Agent-native review mapped each changed action to source rule, generated
  mirror, version registry, and proof command; no finding was accepted.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Initial lint rejected two unused type expressions and the first Yjs overload shape | 1 | Convert assertions to used `unknown` bindings and express the intentional overload pair | Focused Biome and final `pnpm lint:fix` pass |
| Plite React architecture test rejected a direct `@platejs/plite/internal` import | 1 | Route command dispatch through the package-owned runtime-editor facade | Focused family and full 1040/1040 suite pass |
| First narrow P2 review found callback variance and Yjs transaction widening | 1 | Fix both type owners and add negative contracts | Four-owner typecheck, full runtime suites, and broad affected gate pass |
| Docs route Browser returned 500 from stale generated registry imports | 1 | Preserve generated-output policy; use package Chromium proof and report the separate registry block | No task-owned Browser defect; no `build:registry` run |
| `pnpm check:core` reported 25 shared policy/adoption violations | 1 | Classify against this plan rather than patch unrelated owners | None concern these four hard cuts; owner and broad Plite gates pass |

Verification evidence:
- `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/core
  --filter=./packages/yjs --filter=./packages/plite-react`: 14/14 tasks.
- `pnpm --filter @platejs/yjs test`: 220/220.
- `pnpm --filter @platejs/plite-react test`: 73 files, 1040/1040.
- `pnpm check:plite:dev`: passed in 117.264s; 51-package typecheck,
  www package-integration typecheck, 31-package tests, Chromium smoke 3/3.
- `pnpm exec biome check` on the five final-review repair files: pass.
  Earlier final `pnpm lint:fix` also exited zero; only existing plan-size
  warnings were reported.
- Focused stale scan found no positive caller-selected generic call. The only
  `editor.update<T>` source call is the deliberate negative compile contract;
  the other match is the doctrine warning against it.
- `pnpm --filter www typecheck` and `pnpm --filter www api-reference:check`:
  pass; generated API-reference manifest refreshed with the owning command.
- `pnpm exec changeset status --output
  /tmp/plate-generics-changeset-status-final.json`: pass.
- `node .agents/rules/plate-next/scripts/version.mjs validate`: Plate Next v80,
  42 active and 1 retired package rows; valid.
- Doctrine fingerprint:
  `sha256:b38c8796296fdc9b0f38e437ac658bea0a750d6692729e11ef1fcb819421ccf0`.
- Scoped `git diff --check`: pass.
- Narrow P2 autoreview: two in-scope findings fixed; rerun has no remaining
  accepted in-scope finding. Its only finding is the unchanged selector API
  issue explicitly excluded above.

Final handoff prepared:
- Ownership and target API: Plite owns truthful update/schema/command inference;
  Yjs owns validator-backed cursor metadata; Core and React only project it.
- Public breaks and adoption: no caller-selected update, raw-property result,
  command, or Yjs cursor-result generic remains. Callers use installed
  descriptors/semantic handles or receive `unknown`.
- Applicable runtime/package/docs/browser decisions: runtime validation,
  package docs, API reference, changesets, Vision, rules, v80, and generated
  mirrors are complete. No barrel or registry changelog applies.
- Proof and execution risks: all task-owned and broad Plite gates pass. Direct
  docs Browser proof is blocked by stale generated registry imports;
  `check:core` is red only on 25 separate shared migration-policy items.
- Execution order and user attention: no further task-owned work remains. The
  selector exact-patch hole deserves a separate accepted API task; regenerating
  registry output remains CI/registry-owner work.

Timeline:
- 2026-08-15T18:30:28.348Z Plate Plan created.
- 2026-08-15T21:08:00Z Four public generic cuts, Yjs validator ownership,
  adoption, release artifacts, and doctrine v80 completed.
- 2026-08-15T21:20:00Z P2 callback-variance and Yjs-widening findings fixed
  with compile contracts.
- 2026-08-15T21:31:00Z Final broad affected gate passed; handoff prepared.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Done |
| Where am I going? | User handoff |
| What is the goal? | Remove four caller-selected generic escape hatches without weakening inference or runtime safety |
| What have I learned? | Callback variance and generic extraction constraints can silently reopen a nominally removed assertion path |
| What have I done? | Hard-cut all four paths, adopted exact descriptor inference and runtime validation, repaired doctrine/release/docs, and proved the affected graph |

Open risks:
- Direct docs Browser proof remains blocked by stale generated registry imports
  outside this task; the package Chromium smoke is green.
- `pnpm check:core` remains red on 25 unrelated shared migration-policy rows.
- The unchanged `PlateNodeSelectorSet` excess-property inference hole is a real
  separate `best-api` follow-up, not part of these four caller-generic cuts.
