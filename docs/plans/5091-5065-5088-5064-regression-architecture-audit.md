# Felix regression architecture audit

Objective:
Audit Felix false-fix causes and durable Regression/Plite/Plate prevention; done
when all four cases and enforcement gaps have source-backed verdicts.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5091-5065-5088-5064-regression-architecture-audit.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:
- none

Regression source:
- target bug / surface / corpus: Plate issues #5091, #5065, #5088, and #5064,
  including the first false-fix attempts and the later local closure proof
- lane and current source owner: Plite React DOM identity/selection substrate;
  Plate Core wrappers, Selection, Table, DnD package/registry, and Regression
  workflow enforcement
- selected executable test cases: the four issue-owned browser cases plus the
  Regression doctrine/template/checker contract tests; exact paths are recorded
  during source discovery
- tested ref or dirty-state boundary: current checkout HEAD plus content
  fingerprints for every inspected issue-owned source/test/workflow file
- route / proof host and freshness method: inspect the existing final fresh-host
  Chromium receipts and current executable tests; do not upgrade Chromium proof
  to exact Chrome proof
- invocation mode / timebox: one-shot, read-only full audit; no timebox

First checkpoint:
- Copy every explicit requirement, scope boundary, non-goal, timing rule, stop
  condition, deliverable, verification surface, and final handoff requirement
  into the Work Checklist before mutable work.
- Load `.agents/skills/regression/references/methodology.md`.
- Do not create a TSV, JSON, database, manifest, or manual case registry.

Completion threshold:
- Each of the four issues has a source-backed first-trial failure explanation,
  the exact missing oracle, current executable coverage, and residual gap.
- Regression doctrine, methodology, template, checker, and focused workflow
  contract tests are mapped against every historical miss; prose coverage and
  mechanical enforcement are judged separately.
- Plite/Plate responsibility rows have one owner, a keep/cut/rearchitect/gate
  verdict, adoption pressure, failure modes, and focused proof.
- The audit proposes ordered durable execution slices without changing product
  code or claiming implementation.
- All canonical Work Checklist and Completion Gates rows resolve and
  `check-complete.mjs` passes.

Verification surface:
- source audit of the four current executable browser tests and owning runtime
  code
- source audit of Regression doctrine, methodology, template, checker, and
  focused workflow contract tests
- existing exact final-case replay, retry-free stability, benchmark, and
  fresh-host receipts in the issue closure plans
- current HEAD plus content fingerprints for inspected source/test/workflow
  owners
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5091-5065-5088-5064-regression-architecture-audit.md`

Constraints:
- Executable tests own durable regression behavior.
- GitHub owns issue provenance/status; exact refs and runtime/CI receipts own
  integration claims.
- Regression owns selection, proof width, stability, packet decision, claim
  width, and methodology delta.
- Patch owns one normalized local repair at a time.
- The goal plan is transient coordination, not a second behavior database.
- Baselines are evidence, not law. Proxy proof never upgrades the exact case.
- No parallel writers to shared source, tests, plans, generated output, builds,
  or route hosts.
- Generated output is not a source owner.
- Mark fully proved local work `completed` and record its local ref/dirty
  fingerprints plus uncommitted/unpushed state when true. Do not widen that
  status into integrated, shipped, released, or public issue completion without
  the owning evidence and authority.
- Do not lint in this session.
- Do not run Autoreview in this session.
- This turn is an audit. Do not implement product, package, API, skill, release,
  or public GitHub mutations; record proposed repairs and architecture work for
  explicit acceptance.

Boundaries:
- allowed source owners: read-only inspection of Plite React DOM/selection,
  Plate Core, Selection, Table, DnD, issue closure plans, and Regression sources
- allowed proof/test owners: read-only inspection and focused execution of
  existing Regression workflow tests/checkers; no product test mutation
- generated/source boundary: `.agents/rules/regression.mdc`, its reference,
  plan template, and scripts are source; generated `.agents/skills` mirrors are
  evidence only and are not edited
- browser/device claim width: existing Playwright Chromium evidence only; exact
  Chrome/native-compositor proof remains unclaimed unless an exact receipt exists
- forbidden product/API/release/public mutations: all product/skill source
  edits, git writes, builds, releases, issue comments, labels, or closure
- orchestration mode and writer ownership: single-agent read-only audit; no
  subagents or concurrent writers

Output budget strategy:
- Start from exact owner and test files. Use runner discovery/counts before
  printing broad corpora. Cap logs and exclude generated/build trees.

Blocked condition:
- Block only when exact current behavior cannot be observed, the authoritative
  host/device/credential is unavailable, unsafe scope needs user authority, or
  the same blocker leaves no safe alternate packet.
- Repair broken commands, stale servers, generated drift, and missing proof
  hosts before treating them as product blockers.

Regression state:
- current phase: audit closure
- current executable case: four-case corpus plus workflow enforcement
- current case status: completed as a read-only audit
- next owner: Regression repair, then accepted Plite/Plate architecture slices
- goal status: ready for final goal check

Completion rule:
- Do not call `update_goal(status: complete)` with unchecked Work Checklist
  items, unresolved Completion Gates, open required cases, or missing
  executable proof.
- Supporting case tables never replace tests or canonical gates.
- Run `check-complete.mjs` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Four issue audit; first-trial causes; Regression coverage; durable Plite/Plate rearchitecture; no lint; no Autoreview; read-only audit |
| Regression methodology loaded | yes | `.agents/skills/regression/references/methodology.md` read completely |
| Active goal checked or created | yes | Goal created with this exact plan path |
| Current source owner and tested ref recorded | yes | Owner set above; exact HEAD/fingerprints recorded at closure |
| Executable test cases discovered | yes | Four issue-owned tests and Regression workflow contracts selected; exact paths resolved in discovery |
| Route/proof-host readiness plan recorded | yes | Existing fresh-host receipts inspected; no new product behavior claim or exact-Chrome upgrade |
| Patch delegation boundary recorded | no | N/A: audit only; no implementation or Patch delegation |
| Orchestrator writer ownership recorded | no | N/A: single-agent read-only audit; no orchestrator or subagents |
| Output budget strategy recorded | yes | Exact files and bounded `rg`/`sed`; exclude generated/build trees and broad logs |
| Claim width and blocked rules recorded | yes | Source-backed audit only; prior Chromium proof remains Chromium-scoped |

Work Checklist:
- [x] Skill analysis complete: Regression is the supervisor, Patch is the
      one-case worker, and executable tests are the behavior authority.
- [x] First checkpoint captured all four issues, first-trial causes, Regression
      coverage, long-term architecture, no lint, no Autoreview, and audit-only
      scope before inspection changed any plan state.
- [x] Objective, threshold, verification, constraints, boundaries, output
      budget, and blocked condition are concrete.
- [x] Current source identity is HEAD
      `1fb72c581095f23ddba3f597f41e8b10608283ef` plus exact test/workflow hashes;
      existing route proof remains the fresh Chromium receipt in the closure
      plans rather than a fresh behavior claim from this audit.
- [x] Source/generated parity passed through the focused Regression contract;
      route freshness is scoped to the existing receipt because product replay
      is outside this read-only audit.
- [x] Every selected case has a stable ID, reporter contradiction, owner,
      missing first-trial oracle, current executable test, tested boundary, and
      stability evidence.
- [x] The smallest enforcement probe ran first: all ten Regression source and
      generated contract tests passed, then all four reporter-invalidated old
      plans also passed `check-complete.mjs`.
- [x] Exact historical red evidence and durable owner classification were read
      from the current issue comments and closure plans; Chromium evidence was
      not upgraded to exact Chrome evidence.
- [x] Historical red/green pairs were source-audited. A new product red run is
      N/A because this run audits workflow and architecture without changing
      product behavior.
- [x] Patch delegation is N/A: no implementation case was authorized in this
      audit.
- [x] Patch return review is N/A: existing closure receipts supplied the
      root-cause, proof, stability, and fingerprint evidence being audited.
- [x] Existing focused greens and the combined 20/20 fresh-host Chromium replay
      were inspected; this audit makes no new behavior-green claim.
- [x] Existing stability receipts record five retry-free runs per case and a
      combined 20/20 run with zero retries.
- [x] Current tests are kept; Regression enforcement and architecture proposals
      are deferred to named owners until the user accepts implementation.
- [x] No sidecar case registry, TSV, JSON manifest, or duplicate behavior
      database was created.
- [x] Orchestrator ownership is N/A: one read-only agent performed the audit.
- [x] False-green workflow costs are classified and routed to Regression repair.
- [x] Every case and cross-case enforcement failure records a methodology delta.
- [x] Claim wording distinguishes current source audit, historical local
      Chromium proof, exact Chrome proof, pushed integration, and public status.
- [x] The audit is completed locally; behavior cases retain only the claim width
      proved by their existing receipts.
- [x] Final handoff records cases, decisions, refs, proof, sync, review
      exclusions, risks, and next owners.
- [x] Output stayed on exact owner files and bounded command output.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named completion threshold | yes | Audit four cases and every enforcement/architecture row | Four case verdicts and seven architecture/enforcement decisions are recorded below. |
| Current-source readiness | yes | Record current source identity | HEAD and eight exact SHA-256 hashes are recorded in Verification evidence. |
| Route/proof-host readiness | no | Preserve honest claim width | Existing fresh Chromium receipts were inspected; this audit does not claim a new route replay. |
| Executable regression coverage | yes | Map each contradiction to its current executable oracle | Four exact E2E files and their reporter-state assertions are recorded below. |
| Smallest-probe closure | yes | Test workflow enforcement before broad architecture | Ten contract tests passed while all four false-fix plans also passed the completion checker. |
| Patch delegation closure | no | Keep audit read-only | No Patch packet or product edit belongs to this run. |
| Focused verification closure | no | Audit existing proof without widening it | Existing 5/5 per-case and 20/20 combined Chromium receipts were inspected. |
| Stability closure | yes | Record existing retry-free proof | Closure receipts show five passes per case, 20/20 combined, zero retries. |
| Packet decision closure | yes | Decide every audited surface | Current tests are kept; six durable repairs are deferred to explicit implementation owners. |
| Local completion status | yes | Complete only the audit | Audit completed on the recorded source identity; issue integration status is unchanged. |
| No duplicate registry | yes | Keep executable tests authoritative | Only this transient goal plan was added. |
| Generated/source and host repair | no | Avoid mutation in an audit | Source/generated parity passed; proposed workflow changes are named for a later repair run. |
| Orchestrator writer closure | no | Use one read-only owner | No subagents or shared-state writers were used. |
| Workflow slowdown closure | yes | Route false-green costs | Oracle, host-receipt, contradiction, corpus-replay, and architecture-trigger gaps have named owners. |
| Methodology delta closure | yes | Decide every case and cross-case miss | All rows below are `defer` to an explicit repair owner because this turn is read-only. |
| Source/generated sync | no | Sync only after agent-source changes | No agent source or generated skill mirror changed. |
| Agent-native review | no | Review only changed workflows | No workflow implementation changed; user also stopped agent-native/Autoreview work in this session. |
| Final handoff contract | yes | Record verdict, proof, decisions, risks, and next order | Final handoff section is complete. |
| Autoreview | no | Respect explicit exclusion | No Autoreview invocation occurred. |
| Goal plan complete | yes | Run the canonical checker | Canonical checker command is the final verification step for this audit. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | Explicit scope copied into the plan before audit work. | source audit |
| Current source and proof-host readiness | completed | HEAD, hashes, current issue readback, and historical host claim width recorded. | case audit |
| Executable case discovery and selection | completed | Four issue-owned E2E tests and Regression contracts selected. | enforcement probe |
| Smallest high-value probe | completed | 10/10 contract tests plus four false-fix checker passes. | classify misses |
| Reproduce, classify, and red test | completed | Historical exact reds and later reporter contradictions mapped; new red run N/A by scope. | architecture audit |
| One-case Patch delegation | N/A | Read-only audit contains no implementation packet. | proof audit |
| Focused verification and stability | completed | Existing 5/5 and combined 20/20 receipts source-audited. | decisions |
| Keep/revert/quarantine | completed | Current tests kept; architecture work deferred to named owners. | methodology deltas |
| Methodology repair/no-change/defer | completed | Every row has a durable owner and trigger. | handoff |
| Reviews and final handoff | completed | No lint or Autoreview; evidence and risks recorded. | goal check |
| Final goal-plan check | completed | Canonical check recorded in Verification evidence. | final response |

Selected executable cases:
| Case ID | Source reference | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|---------------------|--------|------------|------------|
| `issue-5091:font-size-selection-paint` | Felix 2026-08-17 contradiction: resized text kept old painted selection width | `tooling/e2e/font-size-selection.test.ts`; exact Chromium command from the issue plan | current executable test kept | historical fresh proof on base `1fb72c…`; current test hash `f55c6b3…` | Plite React/DOM selection projection; exact Chrome verifier |
| `issue-5065:table-tab-collapsed-caret` | Felix 2026-08-17 contradiction: movement/focus passed but destination text was fully selected | `tooling/e2e/table-tab-navigation.test.ts`; exact Chromium command from the closure plan | current executable test kept | historical fresh proof on base `1fb72c…`; current test hash `446e5c5…` | Plite selection API plus Table migration |
| `issue-5088:block-selection-exclusive-native-state` | Felix 2026-08-17 contradiction: block styling coexisted with native selection and floating toolbar | `tooling/e2e/block-selection.test.ts`; exact Chromium command from the closure plan | current executable test kept | historical fresh proof on base `1fb72c…`; current test hash `7ea682e…` | Plate Selection on generic Plite selection kinds |
| `issue-5064:homepage-heading-enter-latency` | Felix 2026-08-17 contradiction: crash gone but workflow still lagged | `tooling/e2e/homepage-dnd.test.ts` plus `pnpm --filter www perf:homepage-input -- --action enter` | current executable and benchmark proof kept | historical fresh proof on base `1fb72c…`; current test hash `5115920…` | Plate root DnD controller plus Benchmark |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| all four | Current Plate/Plite source | Playwright Chromium, source-built `www`, `/` and `/blocks/playground` | Closure plan records a fresh restart, one worker, repeat-each 5, 20/20, zero retries | Source registry and packages; no generated owner | valid historical Chromium receipt only |
| Regression workflow | `.agents/rules/regression*` and generated mirrors | Node test runner | 10/10 in this audit | Rule files are source; generated skills matched exactly | pass |
| exact Chrome paint/native state | Chrome profile/browser compositor | Chrome plugin or exact installed Chrome runner | No exact-browser receipt found in the audited plans | N/A | excluded from full Chrome closure claim |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| audit-only | N/A | No product or skill files | Source-backed verdict only | Existing closure receipts audited | N/A by scope |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| #5091 | exact Chromium pixel oracle | 5 | 5/5 | 0 | keep current test |
| #5065 | Tab and Shift+Tab native-caret oracle | 5 | 5/5 | 0 | keep current test |
| #5088 | gutter drag with native-selection exclusion | 5 | 5/5 | 0 | keep current test |
| #5064 | five 20-sample benchmark packets plus real DnD/edit | 5 packets and 5 browser runs | 100/100 measurements; 5/5 browser; combined corpus 20/20 | 0 | keep current proof, rearchitect activation cost |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| #5091 | Pixel comparison, DOM geometry, focus, native range, runtime errors | keep | exact historical Chromium candidate | broad post-commit refresh and no exact Chrome receipt | Plite selection scheduler |
| #5065 | destination anchor offset 0, collapsed native range, empty selected text, editor focus | keep | exact historical Chromium candidate | `tx.selection.set(Path)` remains a compile-time footgun | Best API then Plite Plan |
| #5088 | real gutter, marquee, every crossed block, shadow focus, empty native selection, no toolbar | keep | exact historical Chromium candidate | structural selection truth is split across Plate store, shadow input, native listener, and rAF repair | Best API, Plite Plan, Plate Plan |
| #5064 | trusted Enter timings, real DnD, moved paths, follow-up typing and selection | keep | exact historical Chromium and benchmark candidate | first DnD activation still mounts per-node hooks; final p95 stays about 18–22% slower than measured main | Best API, Plate Plan, Benchmark |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| #5091 | Geometry oracle checked logical range but initial fix relied on focus and visual inspection | defer | Regression reporter-oracle matrix must require the visible paint state and forbidden stale width; exact Chrome when compositor behavior is named | Synthetic workflow contract plus exact Chrome case | implement after audit acceptance |
| #5065 | Initial test asserted movement and focus but omitted collapsed/empty destination selection | defer | Require positive result plus forbidden end states for model, DOM/native, focus, popup, paint, errors, and follow-up fields | Plan-validator fixture that rejects the old case packet | implement after audit acceptance |
| #5088 | Initial proof omitted full structural-selection lifetime and toolbar exclusion | defer | Require exclusive authority assertions: structural state, native state, focus owner, popup state, and post-release state | Workflow fixture based on the current exact test | implement after audit acceptance |
| #5064 | Initial acceptance narrowed the issue to crash freedom although the reporter workflow included lag | defer | Map every reporter symptom to a case before closure and auto-route timing language to Benchmark | Workflow fixture that rejects crash-only closure | implement after audit acceptance |
| cross-case | Fresh reporter contradiction did not revoke earlier green/public completion language | defer | Contradiction invalidates the receipt and any completion/label authority until exact replay on final pushed bytes | Contract fixture with contradiction after green | implement after audit acceptance |
| cross-case | Fresh host and final bytes are prose, not a machine-verifiable receipt | defer | Emit a proof receipt with case, command, ref, production/test/fixture/config hashes, host PID/start time/base URL, retries, and last issue-owned edit time | Receipt schema and verifier | implement after audit acceptance |
| cross-case | Shared-owner fixes can invalidate separately green cases | defer | After the last overlapping owner edit, run the affected exact corpus together and bind one receipt to all cases | Current four-case 20/20 command becomes the fixture | implement after audit acceptance |
| cross-case | Architecture pressure is advisory | defer | Make escalation mandatory after a second failed fix, cross-layer compensation, duplicated live identity, per-node hot work, timer/focus correctness repair, or UI repair of a substrate invariant | Routing contract tests | implement after audit acceptance |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| Completion checker | Autogoal/Regression | instant / should reject false completion | structural Markdown validation only | decisive: all four reporter-invalidated plans pass | add semantic Regression receipt/case validation; keep Autogoal structural |
| Browser proof | Regression proof host | repeated manual restarts / one trusted receipt | host PID/config/source identity live only in prose | high | machine-generate freshness receipt |
| Separate case greens | Regression corpus closure | repeated / one affected batch | shared owner edits can stale earlier proof | high | require affected-corpus replay after last owner edit |
| HMR-era inspection | route host | fast / trustworthy | old process can hide cleanup and layout defects | low without identity | bind source hashes and host start time to proof |

Findings:
- The first trials failed because they proved adjacent states and called them
  the invariant. This was verification failure, not four unrelated accidents.
- #5091 proved mark application, focus restoration, DOM geometry, and a manual
  screenshot. It did not prove Blink's painted selection pixels. Focus was an
  incidental repaint trigger, not the selection-projection owner.
- #5065 proved Tab order and retained editor focus. It did not prove that the
  destination native/model selection was collapsed with empty selected text.
  Passing a `Path` to `tx.selection.set` silently meant selecting the node range.
- #5088 proved block styling, a marquee, some selected blocks, and an empty
  native range during the sampled drag. It did not prove exclusive ownership
  through release: native text selection, focus, and floating toolbar could
  coexist with structural selection.
- #5064 genuinely fixed the crash, but the issue's workflow also reported lag.
  The closure oracle was narrowed to crash freedom, so the performance symptom
  escaped until Felix contradicted it.
- Current Regression prose covers these requirements: current-source/fresh-host
  identity, exact cases, model/native/focus/popup/paint/error/follow-up fields,
  exact Chrome, same-case red/green, five retry-free runs, contradiction-aware
  honest claims, and final-source replay.
- Current Regression enforcement does not cover them. Its focused contract has
  five source tests duplicated against the generated mirror and checks sentence
  presence/parity. Autogoal checks nonempty tables, checked boxes, phase status,
  and placeholder text. It cannot judge whether the reporter oracle is complete.
- Machine proof: all ten workflow tests pass, and every one of the four old
  reporter-invalidated plans also passes the canonical completion checker.
  Therefore “the skill says it” is true; “the skill prevents it” is false.
- Current four E2E tests are materially better. They assert the exact states
  Felix said were still broken and were replayed together 20/20. They are worth
  keeping, but exact Chrome and final pushed-ref receipts still govern broader
  claims.
- Product APIs also make these bugs easy to write. Tests are necessary, but
  tests alone are not the best endpoint when an invalid state can be made
  unrepresentable or one runtime owner can replace compensating UI effects.

Timeline:
- 2026-08-04 through 2026-08-12: first local fixes and narrower proof posted.
- 2026-08-17: Felix contradicted all four completion claims with the omitted
  observable state.
- 2026-08-19 through 2026-08-20: exact reporter-state tests and durable-owner
  fixes produced 5/5 per case and 20/20 combined historical Chromium proof.
- 2026-08-20: this audit proved the current workflow doctrine/enforcement gap
  and ranked the long-term architecture slices.

Decisions and tradeoffs:
| Surface | Verdict | Durable target | Why this owner | Priority / proof |
|---------|---------|----------------|----------------|------------------|
| Regression enforcement | rearchitect | Reporter-oracle matrix, contradiction invalidation, generated proof receipts, affected-corpus replay, and hard architecture triggers | Regression owns claim width and method repair | P0; synthetic old-plan rejection plus current contract parity |
| Plite transaction selection API | hard cut | Remove `Path` from `tx.selection.set`; accept `Selection`, `Range`, `Point`, or `null`. Full-node selection must use an explicit range/node operation. | Invalid collapsed-caret intent should fail at compile time | P0/P1; migrate all Path callers and typecheck focused packages |
| Plate Table navigation | keep and migrate | Keep resolving `tx.points.start(targetEntry[1])` and setting the returned Point | Table owns navigation policy; Plite owns exact selection meaning | focused Table tests plus #5065 E2E |
| Plate block selection on Plite | rearchitect | Represent structural block selection as an installed custom Plite selection kind. Plate owns block semantics/UI; Plite's generic selection controller owns native projection and focus exclusion. | One selection authority replaces Plate store + shadow input + `selectionchange` + double-rAF correction | P0/P1; package state mapping, exact drag/release/toolbar E2E, exact Chrome |
| Plite live DOM identity | finish adopted architecture | Behavior-critical DOM events resolve `data-plite-node-key` to current Path at event time. Keep `data-plite-path` derived/diagnostic, then remove per-render path repair after consumers migrate. | NodeKey is stable identity; Path is a changing address | P1; moved-node input/selection/DnD corpus and DOM identity contracts |
| Plate DnD | rearchitect | One editor-root DnD controller, delegated handle/drop targeting, one floating handle/preview/drop line, NodeKey-to-current-Path resolution, cheap per-node metadata only | Current demand activation fixes idle Enter but first activation still mounts `useDrag`/`useDrop` per eligible block | P1; current/main idle and first-hover benchmarks plus DnD/edit E2E |
| Plite expanded-selection repaint | keep, then narrow | Keep the central Plite DOM/React fix. Evolve the broad “any document commit with expanded selection” trigger into selected-NodeKey/DOM-commit geometry invalidation; retain Blink nudge only while exact Chrome proves it necessary. | Plite owns model-to-native selection projection; toolbar focus never should | P1/P2; #5091 exact Chrome pixel oracle and unchanged-geometry control |
| Plate Core wrapper descriptor | conditional cut | Re-audit after root DnD. If `match`/`renderPath` has no second independent owner, delete the public dual grammar; otherwise make one canonical descriptor form. | Do not preserve one-consumer framework machinery after its consumer disappears | P2 after DnD proof |

The recommendation is concentrated rearchitecture, not a Plite rewrite. Plite
should make selection meaning and live identity robust. Plate should own table,
block-selection, and DnD product policy without repairing substrate state from
component effects.

Review fixes:
- N/A. This audit changed only its transient plan. Lint and Autoreview were
  explicitly excluded, and no product or skill implementation was reviewed.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First-trial proof asserted neighboring success instead of full reporter state | 4 | Build positive and forbidden-state oracle matrix | Current exact tests contain the missing assertions; workflow enforcement proposal recorded. |
| Autogoal checker accepted reporter-invalidated completion plans | 4 | Treat it as structural only and add Regression semantic receipts | All four passes captured as audit evidence. |

Verification evidence:
- Current HEAD: `1fb72c581095f23ddba3f597f41e8b10608283ef`.
- Current exact-test SHA-256:
  - `tooling/e2e/font-size-selection.test.ts`: `f55c6b3fb18e79a191130ebb05a8a14bd0161181038f60bab52b709bf9e1d459`
  - `tooling/e2e/table-tab-navigation.test.ts`: `446e5c5a1fcef21d74f9e5d2eaa6d2ef2fce9687852eaf9bb76e4182e5781e5e`
  - `tooling/e2e/block-selection.test.ts`: `7ea682e073d1d17f1ce36d195fb8afb37a0d4ca264c83a255870d631eaf1ccbc`
  - `tooling/e2e/homepage-dnd.test.ts`: `511592093003332e7f097c40587cb0657f1046b5891b08bf6a4d8dd78c716123`
- Current workflow SHA-256:
  - `.agents/rules/regression.mdc`: `0c5318f203106adc8450837ebf322c1147dfad44dce0b52a37599358824661af`
  - methodology: `0743607b04431366ae0e46a2df61d73768315bd6d81210761abddec5fd27fa5e`
  - template: `d452c3ead9eb9c7336d506351424c266f36ba908b6f497447afd437dbcf7199c`
  - contract test: `9c096ea256bb660655897ff920ad11f01bbe6ad76829b034fa2717575887ce21`
- `node --test .agents/rules/regression/scripts/test-first-contract.test.mjs .agents/skills/regression/scripts/test-first-contract.test.mjs`: 10 pass, 0 fail.
- The canonical checker returned `complete` for all four old false-fix plans:
  `5091-fix-stale-font-size-selection-highlight.md`,
  `5065-fix-table-tab-navigation.md`,
  `5064-fix-homepage-table-grid-enter-crash.md`, and
  `2026-08-06-complete-remaining-felix-issues.md`.
- Live GitHub readback confirms Felix's four contradictions, all four issues
  remain open, and none currently has the `completed` label.
- Existing closure proof records five retry-free Chromium passes per case and
  one combined 20/20 fresh-host batch. This audit did not rerun product tests.
- No lint and no Autoreview ran.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5091-5065-5088-5064-regression-architecture-audit.md`: pass.

Final handoff:
- executable cases: keep the four exact E2E tests; they cover Felix's omitted
  states and existing receipts show 5/5 each plus 20/20 combined Chromium.
- changed files: this transient audit plan only.
- design decisions: repair Regression enforcement first; then hard-cut Path
  selection, move block selection onto generic Plite selection kinds, finish
  NodeKey event-time identity, build root-owned Plate DnD, and narrow the
  expanded-selection repaint trigger.
- tests and proof: 10/10 workflow contracts, four false-fix checker passes,
  current source hashes, live issue readback, and historical closure receipts.
- source/generated sync: N/A because no agent source changed.
- P1 and agent-native findings: N/A by explicit audit scope and no workflow edit.
- residual risks and next owner: exact Chrome and exact pushed-ref replay govern
  broader completion; Regression repair is first, then Best API + Plite/Plate
  Plan for accepted architecture slices.
- local completion status and integration/public-status boundary: audit
  completed locally; no behavior integration, shipment, release, comment,
  label, or issue status claim was changed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Audit closure. |
| Where am I going? | Final checker, goal completion, and decision-ready handoff. |
| What is the goal? | Explain four false fixes, judge Regression coverage, and rank durable Plite/Plate prevention. |
| What have I learned? | Doctrine is strong; enforcement is structurally weak; concentrated product APIs preserve avoidable failure modes. |
| What have I done? | Audited issues, tests, workflow source/checkers, runtime owners, and architecture; recorded an ordered repair plan. |

Open risks:
- Exact Chrome compositor/native-selection proof was absent from the audited
  receipts. Chromium proof must stay Chromium-scoped.
- Current test bytes were fingerprinted but product behavior was not replayed
  in this read-only audit. Existing 20/20 evidence belongs to its recorded base
  and source fingerprints.
- The architecture decisions are proposals. The unsafe API and compensating
  component effects continue to exist until accepted implementation lands.
- GitHub comments describe the historical local boundary. This audit did not
  infer current shipment from later pushes or mutate public status.
