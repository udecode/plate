# Fix AI generated MDX blockquote schema

Objective:
Fix AI-generated MDX blockquote schema crash; done when exact RED turns green,
5/5 route replay passes, and P1 review is clean.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-31-fix-ai-generated-mdx-blockquote-schema.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Applied packs:

- browser

Regression source:

- target bug / surface / corpus: AI “Generate MDX sample” streams a blockquote
  with a direct text child and throws `EditorSchemaValidationError`.
- lane and current source owner: Plate AI streaming publication in
  `packages/platejs/src/ai/react/AIChatPlugin.ts`, plus the deterministic sample
  fixture in `apps/www/src/registry/components/editor/use-chat.ts`.
- selected executable test cases: `www-ai-mdx:blockquote-stream-schema`.
- tested ref or dirty-state boundary: base
  `377a77a537971b793a4ddbb34cc13797fdfeee15`, current local checkout; final
  issue-owned file fingerprints required.
- route / proof host and freshness method: `http://localhost:3000/docs/link`;
  restart `pnpm --filter www dev`, open a fresh Browser page, click AI then
  “Generate MDX sample.”
- invocation mode / timebox: one-shot, no timebox.

First checkpoint:

- Copy every explicit requirement, scope boundary, non-goal, timing rule, stop
  condition, deliverable, verification surface, and final handoff requirement
  into the Work Checklist before mutable work.
- Load `.agents/skills/regression/references/methodology.md`.
- Fill the selected-case, reporter-oracle, failed-fix, and architecture tables,
  then run `validate-regression-plan.mjs` before implementation.
- Do not create a TSV, JSON, database, manifest, or manual case registry.

Completion threshold:

- Every selected observed regression has an executable test that fails on the
  violated invariant and passes after the fix.
- Every selected case records `unit-red: <test>` or
  `e2e-required: <lower-layer limitation>`. Unit/package RED stops new E2E test
  creation; Browser may remain final verification without permanent E2E coverage.
- Every case has positive and forbidden-state assertions for model, DOM/native,
  pointer feedback, focus, popup, geometry/paint, runtime errors, and follow-up
  input, with an N/A reason for observations that do not apply.
- Current source and every proof host are ready before behavior claims.
- Every kept case has exact reproduction, one-case Patch evidence, focused
  green proof, required retry-free stability, final ref/dirty-boundary proof,
  and no accepted P1 finding.
- Every kept case and the run are marked `completed` when those local gates
  pass. Commit and push are not local completion gates.
- Every case records `repair-now`, evidence-backed `no-change`, or
  evidence-backed `defer`.
- Every failed claimed fix invalidates its prior proof and automatically repairs
  Regression with an executable workflow test before the next product attempt.
- A second failed fix or architecture trigger has an accepted Best API and
  Plite/Plate layer plan before implementation resumes.
- Final proof has a generated receipt and affected-corpus replay after the last
  shared-owner edit.
- All canonical Work Checklist and Completion Gates rows resolve and
  both semantic validation and `check-complete.mjs` pass.

Verification surface:

- selected executable package/DOM/Playwright/Browser/Chrome/device commands
- exact final-case replay and retry-free stability when required
- source/host freshness proof and exact final ref
- generated proof receipts and affected-corpus replay
- `node .agents/skills/regression/scripts/validate-regression-plan.mjs docs/plans/2026-08-31-fix-ai-generated-mdx-blockquote-schema.md --complete`
- P1 autoreview for non-trivial implementation packets
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-fix-ai-generated-mdx-blockquote-schema.md`

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
- A failed fix means a claimed candidate/kept/completed repair that fails exact
  replay/final verification or receives a reporter contradiction. Expected TDD
  red is not a failed fix.
- A failed fix always enters automatic Regression `repair-now`; prose-only
  repair, `no-change`, and `defer` cannot resume the product attempt.

Boundaries:

- allowed source owners: the exact AI stream publisher and, only if proven,
  the canonical Markdown/blockquote normalization owner.
- allowed proof/test owners: nearest existing `apps/www` AI/Markdown test; add
  E2E only if an owner-level exact RED is impossible.
- generated/source boundary: edit registry source only, then run
  `pnpm --filter www build:registry`; `apps/www/public/r/use-chat.json` is the
  required generated mirror. Templates remain untouched.
- browser/device claim width: in-app Chromium on `/docs/link`; runtime error,
  resulting editor model, rendered editor, and follow-up input.
- forbidden product/API/release/public mutations: no public API change, commit,
  push, PR, tracker, release, or unrelated duplicate-key work.
- orchestration mode and writer ownership: main agent only; no subagents or
  concurrent writers.

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

- current phase: completed local verification and closeout
- current executable case: `www-ai-mdx:blockquote-stream-schema`
- current case status: completed locally on the dirty, uncommitted checkout
- next owner: user, if commit/push/PR is desired
- goal status: completed locally; uncommitted and unpushed

Completion rule:

- Do not call `update_goal(status: complete)` with unchecked Work Checklist
  items, unresolved Completion Gates, open required cases, or missing
  executable proof.
- Supporting case tables never replace tests or canonical gates.
- Run `check-complete.mjs` only after fresh evidence and risks are recorded.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Exact action must produce the RED; use E2E only if owner-level RED is impossible; fix and verify the runtime schema error. |
| Regression methodology loaded | yes | Read Regression, methodology, Patch, TDD, and Autogoal completely. |
| Active goal checked or created | yes | No active goal existed; created this exact measurable goal. |
| Current source owner and tested ref recorded | yes | `ai.tsx:95`, base `377a77a537971b793a4ddbb34cc13797fdfeee15`, dirty local boundary. |
| Executable test cases discovered | yes | One case selected; exact owner-level test path is resolved before editing. |
| Cumulative reporter evidence resolved | yes | Original exact runtime stack plus correction that the RED must occur during MDX generation; earlier duplicate-key warning is not this case. |
| Reporter oracle matrix resolved | yes | Eight observations below include exact positive/forbidden states or N/A reasons. |
| Regression semantic validator ready | yes | Run after exact test path and RED result are filled, before implementation. |
| Route/proof-host readiness plan recorded | yes | Fresh `apps/www` process and fresh `/docs/link` Browser page. |
| Patch delegation boundary recorded | yes | One local normalization/schema case; no public API, generated output, or unrelated docs-key edits. |
| Orchestrator writer ownership recorded | no | N/A: main agent only; multi-agent delegation is disabled. |
| Output budget strategy recorded | yes | Exact files and capped `rg`; generated/build trees excluded. |
| Claim width and blocked rules recorded | yes | Runtime/model/DOM/follow-up only; E2E fallback requires a recorded unit limitation. |
| Browser pack selected | yes | Browser pack materialized and recorded. |
| Browser route / app surface identified | yes | `/docs/link` registry editor demo. |
| Browser tool decision recorded | yes | In-app Browser is the exact ordinary app surface. |
| Console/network caveat policy recorded | yes | Schema error is blocking; API/network errors are recorded separately and cannot substitute for it. |
| Observable browser case captured | yes | `www-ai-mdx:blockquote-stream-schema`; `/docs/link`, focus editor, AI, Generate MDX sample, no schema error, valid quote model/render, follow-up edit works. |

Work Checklist:

- [x] Skill analysis complete: Regression is the supervisor, Patch is the
      one-case worker, and executable tests are the behavior authority.
- [x] First checkpoint captures every explicit requirement before mutable work.
- [x] Objective, threshold, verification, constraints, boundaries, output
      budget, and blocked condition are concrete.
- [x] Current source, exact ref/dirty boundary, test runner, route/proof host,
      export/build path, and freshness method are recorded.
- [x] Generated/source drift and host readiness are repaired or block the claim.
- [x] Every selected case has a stable ID, source reference, owner, setup,
      action, expected outcome, expected-outcome authority, executable test
      path/command, tested ref, and required stability. A negative report does
      not authorize an invented positive behavior.
- [x] Every selected case records its `Red-test escalation`. Try the exact
      owner-level unit/package test first. `unit-red:` forbids a new E2E test;
      `e2e-required:` names why no exact unit/package RED is possible. Browser
      verification alone does not become permanent E2E coverage.
- [x] Every selected case inventories its base acceptance, recordings, and all
      later reporter confirmations/contradictions as cumulative deltas. Every
      still-applicable claim stays required; superseded claims cite the source
      and reason that removed them.
- [x] Every required evidence row maps to a phase-specific executable oracle.
      A final-state assertion never substitutes for a transient during-action
      caret, overlay, popup, selection, pointer affordance, or paint assertion.
- [x] Every selected case has one or more phase-specific reporter-oracle rows
      for model, DOM/native, pointer feedback, focus, popup, geometry/paint,
      runtime errors, and follow-up input.
- [x] Every pointer, mouse, cursor, hover, or resize/drag-handle case has an
      applicable `pointer-feedback` row for the named interaction phase. Cursor
      and hover/active/tooltip/drag affordances are proved independently from
      model state, DOM selection, preview state, and eventual action.
- [x] Every applicable `pointer-feedback` positive assertion records
      `reporter-noun: <plain noun>` and
      `affordance-inventory: <accessible labels, selectors, or owners>` after
      source and exact-route discovery. Any excluded matching affordance cites
      explicit reporter or accepted-product authority.
- [x] Every completed applicable `pointer-feedback` row records
      `interaction-trace: pass`, the actual pointer `target:`, delivered
      `event:`, and `buttons:` state from the same interaction path.
- [x] Every flash, flicker, or one-frame pointer-feedback claim uses a target-
      capture or equivalent pre-handler oracle and records
      `pre-handler-state: pass`; eventual post-handler style is insufficient.
- [x] Every applicable popup/toolbar oracle after an action or release has an
      applicable `follow-up-input@follow-up` oracle proving the next owning-
      surface interaction still works.
- [x] Every applicable popup close oracle at `after-action` or `after-release`
      accounts for `dom-native` and `focus` at the same phase; later follow-up
      input never substitutes for close-time selection/caret preservation.
- [x] Every required caret, insertion-point, caret-accessible line, editable
      blank line/row, or text-cursor claim maps to applicable same-phase
      `dom-native` and `focus` rows plus `follow-up-input@follow-up`. Native
      browser proof replays the real interaction and asserts caret paint
      independently from wrapper height, DOM markers, and block highlighting.
- [x] Every applicable oracle row has a positive assertion, a distinct forbidden
      state, an executable layer/anchor, and an exact result; every inapplicable
      row has N/A reasons.
- [x] The smallest falsifying executable probe ran before scaling.
- [x] Exact reproduction and durable owner classification are recorded; proxy
      evidence stays labeled proxy.
- [x] The executable test is red before the fix, or the exact safe-red
      limitation and proof-host repair are explicit.
- [x] Regression delegated only one normalized case at a time to Patch.
- [x] Patch returned root cause, durable owner, changed files, exact red/green
      commands, final ref/dirty fingerprints, stability, architecture verdict,
      P1 review, and caveat.
- [x] Focused green proof passed. Final Browser verification runs when repo or
      claim policy requires it; E2E replay is required only for
      `e2e-required:` or already-existing affected-corpus E2E coverage.
- [x] Final proof ran through `capture-proof-receipt.mjs`; its ref, input digest,
      host, timestamps, retry count, and receipt ID validate.
- [x] Required retry-free stability runs passed with no retry.
- [x] Responsive geometry proof waits through animation-frame, resize-observer,
      or renderer-commit settling with a bounded invariant poll; it records
      pre-convergence and converged geometry instead of treating one immediate
      post-resize bounding-box read as final.
- [x] Any stability-only failure after an exact green run froze product edits,
      gained a phase-specific executable diagnostic, and restarted baselines
      after product-versus-proof classification.
- [x] Any compositor phase claim records computed style, live range geometry,
      model/DOM endpoints, and callback identity at the mutation boundary. If
      those are final while pixels stay red, timing is rejected as the cause.
- [x] Every blocking pixel classifier passes known-correct single-layer,
      known-absent, and known-invalid duplicate-layer controls through the same
      capture path; width or outer geometry alone cannot certify layer count.
      A failed control invalidates prior results and freezes product edits until
      the proof helper is repaired.
- [x] Every completed applicable `geometry-paint` row names actual pixel capture
      and classification in its proof layer and records `positive-control: pass`
      plus `negative-control: pass` and `duplicate-control: pass`; computed style,
      DOM state, selection text, callback traces, and unclassified screenshots
      are diagnostics only.
- [x] Every shared owner was replayed against its affected exact corpus after
      the final owner edit.
- [x] Every shared CSS selector, marker, class map, or style expansion has a
      pre-edit consumer inventory. The affected corpus includes explicit
      transparent, borderless, shadowless, and ringless overrides, each with a
      forbidden duplicate/inherited-paint geometry oracle.
- [x] Every already-executable affected case has a `pass:` or `red:` pre-edit
      baseline recorded before its shared owner changes.
- [x] Every requested or started package, browser, root, or CI gate that failed
      is recorded and passes an exact final rerun on the final bytes.
- [x] Every selected case is kept, reverted, quarantined, deferred, or blocked
      honestly; only kept cases can satisfy goal success.
- [x] No sidecar case registry, TSV, JSON manifest, or duplicate behavior
      database was created.
- [x] Orchestrator ownership and overlapping writer/host serialization passed
      or are N/A with reason.
- [x] Workflow slowdowns and avoidable proof-host/command mistakes were
      repaired or deferred with owner.
- [x] Every case records one methodology delta.
- [x] Every failed claimed fix revoked prior completion, automatically repaired
      Regression with executable workflow proof, and restarted at attempt N+1.
- [x] Every second failed fix or architecture trigger passed Best API and the
      owning Plite/Plate plan before another Patch attempt.
- [x] Claim wording matches local, pushed, integration, and release evidence.
- [x] Every kept case and the run are marked `completed` once all required local
      proof and plan gates pass; commit/push state is recorded separately.
- [x] Final handoff records executable tests, decisions, refs, proof, sync,
      reviews, risks, and next owner.
- [x] Output budget discipline was followed.
- [x] Browser pack: `/docs/link` → focus editor → AI → Generate MDX sample; expect schema-valid generated content and no runtime overlay.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Browser pack: a reporter-visible paint claim is proved from classified
      pixels captured in the named interaction phase, with known-correct
      single-layer, known-absent, and known-invalid duplicate-layer controls
      through the identical capture path. The proof records
      `positive-control: pass`, `negative-control: pass`, and
      `duplicate-control: pass`. Computed style, DOM state, selection text, and
      an unclassified screenshot are diagnostics, not final paint proof.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: pushed-ref cleanliness is N/A because this is an explicitly
      uncommitted, unpushed local completion claim. A fresh final dev process
      loaded the current dirty inputs; no integration or shipped claim is made.
- [x] Browser pack: this is not a native selection/paint, DnD, compositor, or
      Chrome-specific case. The requested exact in-app Browser path still passed
      5/5 retry-free runs.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named completion threshold | yes | Close the selected case and methodology row | Exact package RED is green, Browser is 5/5, and P1 review is clean. |
| Current-source readiness | yes | Prove source owner and final tested boundary | Receipt ref `dirty:377a77a537971b793a4ddbb34cc13797fdfeee15`; input digest `sha256:b9db53b3a1b296f5e09f191cecac2030971a2d52b6fc95f156c68c5ff530d122`. |
| Route/proof-host readiness | yes | Prove the runner/host observes current source | Fresh `pnpm --filter www dev` process after registry generation served `/docs/link`; five fallback requests reached the final fixture chunk. |
| Executable regression coverage | yes | Record exact red and green | Exact blockquote RED threw at `[3]`; complete insert-preview fixture reproduced later link/callout/media boundaries; final corpus is 44/44. |
| E2E escalation closure | yes | Use `unit-red:` or justify E2E | Both exact failures reproduce in package integration tests, so no E2E was added. |
| Cumulative reporter evidence closure | yes | Map every reporter claim | Exact generation action, runtime error, final generated content, and follow-up edit are covered below. |
| Reporter oracle closure | yes | Resolve all observations | Model, DOM, popup, runtime error, and follow-up input are green; pointer/focus/paint/subscription claims are N/A. |
| Failed-fix interrupt closure | yes | Repair every claimed-fix miss | Attempts 1 and 2 were invalidated; Regression gained runtime-mode and fixture-scope enforcement with 44/44 workflow tests. |
| Architecture pressure closure | yes | Pass Best API and layer plan | Accepted no-new-API decision: Plate AI owns streaming publication, Markdown owns syntax, Plite schema remains fail-closed, registry owns sample validity. |
| Proof receipt closure | yes | Validate final receipt | Attempt 3 completed receipt `sha256:0b35bcb9fc7bda021fc0fd4f85d4d739f1eb5929ebbad6be0440bf7940e97419`, retries 0. |
| Affected-corpus replay closure | yes | Replay shared-owner cases | 44 tests across the four streaming files plus `AIChatPlugin.streaming.spec.ts` passed after the final edit. |
| Shared-style consumer closure | no | N/A: no shared style changed | No CSS, selector, class map, geometry, or paint owner changed. |
| Started-gate failure closure | yes | Rerun every failed gate | Initial Bun path, TypeScript callback, and two final-verification misses all have passing final reruns. |
| Smallest-probe closure | yes | Record first falsifier | One chunk-split blockquote row reproduced the exact schema exception before implementation. |
| Patch delegation closure | yes | Read back one-case evidence | Root cause, owners, changed files, red/green, receipt, 5/5 Browser, architecture decision, and P1 review are recorded. |
| Focused verification closure | yes | Run owning and exact replay | Exact tests, 44-test corpus, typechecks, registry build, and exact Browser action passed. |
| Stability closure | yes | Record retry-free runs | Exact route/action passed 5/5 without a product retry. |
| Packet decision closure | yes | Decide the selected case | Keep and mark completed locally. |
| Local completion status | yes | Record integration boundary | Completed only on the dirty local checkout; no commit, push, PR, release, or shipped claim. |
| No duplicate registry | yes | Avoid sidecar behavior data | No manifest/database/E2E registry was created; tests remain the authority. |
| Generated/source and host repair | yes | Rebuild required mirror and restart host | `pnpm --filter www build:registry` passed; final Browser used a fresh server. |
| Orchestrator writer closure | no | N/A: main agent only | No subagent or overlapping writer was used. |
| Workflow slowdown closure | yes | Repair avoidable proof gaps | Complete-fixture scope and runtime-mode parity are executable requirements; Browser polling waits for the final video chunk. |
| Methodology delta closure | yes | Resolve each case | `repair-now` completed for runtime modes and complete/minimal fixture scope. |
| Source/generated sync | yes | Regenerate agent mirrors and registry | `pnpm install` completed; source/generated Regression parity is exact; registry build passed. |
| Agent-native review | yes | Review changed agent workflow | PASS: source-owned, discoverable, mirrored, and executable. |
| Final handoff contract | yes | Record proof and remaining boundary | Handoff below records tests, decisions, hashes, reviews, risks, and unpushed state. |
| Autoreview | yes | Run P1 autoreview | Clean: no accepted/actionable P0/P1 findings; confidence 0.9. |
| Regression semantic plan | yes | Run complete semantic validator | Pass on this completed plan. |
| Goal plan complete | yes | Run Autogoal completion check | Pass on this completed plan. |
| Browser interaction proof | yes | Exercise exact route/action | `/docs/link` → editor → AI wand → Generate MDX sample passed 5/5. |
| Browser console/network check | yes | Inspect fresh runtime logs | Zero schema/runtime console errors; five expected API 404s activated the local fake-stream fallback. |
| Browser final proof artifact | yes | Record route/DOM/log evidence | DOM/log ledger records final video content, blockquote/callout/media presence, stable URL, zero overlay, and post-stream marker; no paint claim needs a screenshot. |
| Exact case replay | yes | Prove all end-state fields | Five runs reached video, rendered the generated nodes, and accepted `RUNn_OK` follow-up input. |
| Final ref and fingerprints | yes | Record final input hashes | Receipt digest plus per-file SHA-256 values are recorded under Verification evidence. |
| Clean final runtime | no | N/A for local candidate | Fresh process used current dirty, uncommitted inputs; no clean-ref/integration claim is made. |
| Retry-free stability | yes | Record requested stability | 5/5 exact in-app Chromium runs, retry count 0. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction and goal setup | completed | Exact correction, action, error, escalation, scope, and proof gates recorded | source/host readiness |
| Current source and proof-host readiness | completed | `ai.tsx:95`, base ref, `/docs/link`, and fresh-host method recorded | discover executable cases |
| Executable case discovery and selection | completed | Existing `streamInsertChunk.slow.tsx` directly owns streaming Markdown publication | smallest probe |
| Cumulative reporter evidence inventory | completed | Original stack plus latest unit-first/E2E-fallback correction retained | reporter oracle expansion |
| Reporter oracle expansion | completed | Eight observations resolved below | semantic validation |
| Pre-implementation semantic validation | completed | Validator: `Regression plan: structurally valid.` | smallest probe |
| Smallest high-value probe | completed | Existing file baseline 14/14, then one new MDX blockquote row | reproduce/classify |
| Reproduce, classify, and red test | completed | Same exception and exact `[3]` path reproduced | patch delegation |
| One-case Patch delegation | completed | Attempt 3 fixed nested trailing text and schema-gated preview metadata; registry sample syntax was corrected at its owner | focused verification |
| Failed-fix workflow repair | completed | Runtime-mode and fixture-scope requirements are source-owned, mirrored, and green in 44/44 validator tests | complete fixture replay |
| Focused verification and stability | completed | 44/44 corpus, Plate/www typechecks, registry build, exact Browser 5/5 | packet decision |
| Keep/revert/quarantine | completed | Keep: exact package and Browser evidence cover the reported invariant | methodology delta |
| Methodology repair/no-change/defer | completed | Repair-now completed for both missed proof dimensions | reviews |
| Reviews and final handoff | completed | P1 autoreview clean; agent-native workflow review PASS | goal-plan check |
| Final goal-plan check | completed | Semantic completion validator and Autogoal check pass | final response |

Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---------|------------------|----------------|------------------|----------------------------|---------------------|-------------------|---------------------|--------|------------|------------|
| www-ai-mdx:blockquote-stream-schema | User runtime stack and correction | `/docs/link`; focus editor; open AI; click Generate MDX sample | Generated MDX is published as schema-valid editor nodes without a runtime overlay; editor remains usable | reporter: current user message | unit-red: apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx#an MDX sample blockquote split across chunks and streamHistory.slow.tsx#streams the generated MDX sample through insert preview; no E2E added | Next.js 16.3.2 Turbopack, in-app Chromium; runtime-modes: insert preview active, AI text marking active, suggestion mode inactive; fixture-scope: complete all 222 generated MDX sample chunks | `bun test './apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx' --test-name-pattern 'MDX sample blockquote'; bun test './apps/www/src/__tests__/package-integration/ai-chat-streaming/streamHistory.slow.tsx' --test-name-pattern 'generated MDX sample'` | completed | dirty:377a77a537971b793a4ddbb34cc13797fdfeee15 | user |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---------|-------------|------------------|-------|-------|-------------|----------------|-------------------|--------|
| www-ai-mdx:blockquote-stream-schema | base-acceptance | User runtime stack | after-action | No `EditorSchemaValidationError`; blockquote cannot contain direct text | required | model@after-action, dom-native@after-action, popup@after-action, runtime-errors@during-action, follow-up-input@follow-up | test: apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx#an MDX sample blockquote split across chunks | pass: nested paragraph remains the text owner; 5/5 Browser has zero schema overlay/error |
| www-ai-mdx:blockquote-stream-schema | latest-reporter-delta | “reproduce the RED test… when generating the mdx; if not red, will need e2e” | during-action | Permanent test must exercise MDX generation publication, not unrelated page render | required | model@after-action, runtime-errors@during-action | test: apps/www/src/__tests__/package-integration/ai-chat-streaming/streamHistory.slow.tsx#streams the generated MDX sample through insert preview | pass: exact unit/package RED existed and is durable; no E2E added |

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---------|-------------|-------|---------|--------------------|-----------------|-------------|-------------------|--------|
| www-ai-mdx:blockquote-stream-schema | model | after-action | yes | Blockquote children satisfy the registered block schema, including paragraph wrapping where required | A blockquote directly contains a text node | package editor publication test | test: apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx#an MDX sample blockquote split across chunks | pass: blockquote has `aiPreview`, every direct child is an element, callout/media/link assertions pass |
| www-ai-mdx:blockquote-stream-schema | dom-native | after-action | yes | Mounted editor renders the generated blockquote content | Runtime overlay replaces the route or generated quote is absent | Browser DOM plus package contract | test: apps/www/src/__tests__/package-integration/ai-chat-streaming/streamHistory.slow.tsx#streams the generated MDX sample through insert preview | pass: 5/5 Browser runs have blockquote count 1 and final fixture text/media present |
| www-ai-mdx:blockquote-stream-schema | pointer-feedback | during-action | no | N/A: report does not concern pointer feedback | N/A: no pointer claim | N/A: no pointer proof | N/A: no pointer test | N/A: not applicable to generated content publication |
| www-ai-mdx:blockquote-stream-schema | focus | after-action | no | N/A: report does not name focus ownership | N/A: no focus claim | N/A: no focus proof | N/A: no focus test | N/A: not applicable to the reported crash |
| www-ai-mdx:blockquote-stream-schema | popup | after-action | yes | No Next.js runtime error dialog is open after generation | Runtime `EditorSchemaValidationError` dialog is open | Browser dialog plus package contract | test: apps/www/src/__tests__/package-integration/ai-chat-streaming/streamHistory.slow.tsx#streams the generated MDX sample through insert preview | pass: 5/5 Browser runs have overlay count 0 |
| www-ai-mdx:blockquote-stream-schema | geometry-paint | after-action | no | N/A: no layout or pixel claim | N/A: no paint claim | N/A: visual waiver | N/A: no paint test | N/A: not applicable to schema validity |
| www-ai-mdx:blockquote-stream-schema | subscription-lifecycle | after-action | no | N/A: no keyed subscription collection is involved | N/A: no add, update, remove, or teardown claim exists | N/A: streaming transaction has no subscription owner | N/A: no subscription test applies | N/A: not applicable to chunk publication |
| www-ai-mdx:blockquote-stream-schema | runtime-errors | during-action | yes | Streaming publication completes without `EditorSchemaValidationError` | `Editor element "blockquote" ... cannot contain "text"` is thrown | package test and Browser console | test: apps/www/src/__tests__/package-integration/ai-chat-streaming/streamHistory.slow.tsx#streams the generated MDX sample through insert preview | pass: 44/44 package corpus; zero client schema/runtime errors in 5/5 runs |
| www-ai-mdx:blockquote-stream-schema | follow-up-input | follow-up | yes | A normal edit after generation succeeds | Editor remains crashed or unusable | Browser follow-up plus package contract | test: apps/www/src/__tests__/package-integration/ai-chat-streaming/streamHistory.slow.tsx#streams the generated MDX sample through insert preview | pass: 5/5 Browser runs accepted every marker |

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---------|---------|-------|---------|--------|-----|--------------|-------------|--------|------|--------------------|---------------|-------------|---------|------------|
| www-ai-mdx:blockquote-stream-schema | 3 | completed | "bun" "test" "./apps/www/src/__tests__/package-integration/ai-chat-streaming/streamDeserializeMd.slow.tsx" "./apps/www/src/__tests__/package-integration/ai-chat-streaming/streamHistory.slow.tsx" "./apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx" "./apps/www/src/__tests__/package-integration/ai-chat-streaming/streamSerializeMd.slow.tsx" "./packages/platejs/src/ai/react/AIChatPlugin.streaming.spec.ts" | pass: exit 0 in 2984ms | dirty:377a77a537971b793a4ddbb34cc13797fdfeee15 | sha256:b9db53b3a1b296f5e09f191cecac2030971a2d52b6fc95f156c68c5ff530d122 | 10 | .changeset/fix-ai-blockquote-streaming.md,apps/www/public/r/use-chat.json,apps/www/src/__tests__/package-integration/ai-chat-streaming/__tests__/createTestEditor.tsx,apps/www/src/__tests__/package-integration/ai-chat-streaming/streamDeserializeMd.slow.tsx,apps/www/src/__tests__/package-integration/ai-chat-streaming/streamHistory.slow.tsx,apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx,apps/www/src/__tests__/package-integration/ai-chat-streaming/streamSerializeMd.slow.tsx,apps/www/src/registry/components/editor/use-chat.ts,packages/platejs/src/ai/react/AIChatPlugin.streaming.spec.ts,packages/platejs/src/ai/react/AIChatPlugin.ts | host:none - deterministic package corpus; exact Browser route replay recorded separately | 2026-08-31T08:34:15.098Z | 2026-08-31T08:59:06.479Z | 2026-08-31T08:59:09.464Z | 0 | sha256:0b35bcb9fc7bda021fc0fd4f85d4d739f1eb5929ebbad6be0440bf7940e97419 |

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|-------|----------------|-------------------|-----------------|------------------|----------------------|--------|
| `AIChatPlugin.update.insertChunk` plus registry MDX fixture | www-ai-mdx:blockquote-stream-schema | red: exact new blockquote case threw at `[3]` before the owner edit; existing `streamInsertChunk` baseline passed 14/14 | 2026-08-31T08:34:15.098Z | `bun test` four AI streaming files plus `AIChatPlugin.streaming.spec.ts` | sha256:b9db53b3a1b296f5e09f191cecac2030971a2d52b6fc95f156c68c5ff530d122 | pass: 44/44, 67 assertions, retries 0 |

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|------|----------------|----------------|------------|-------------|
| Focused test command initially omitted `./` | Bun path filter did not match | proof-command shape | reran with explicit relative path | pass: baseline 14/14; exact new case then red |
| First implementation probe | Exact RED remained `blockquote` direct text at `[3]` | root-cause branch miss before any green candidate claim | Frozen edits and traced each chunk; `deserializeChunk('> Generated ')` appended stripped whitespace directly to the blockquote instead of its nested paragraph | pass: exact case and 44/44 final corpus |
| Exact Browser verification after first package-green candidate | Generate MDX sample progressed past the blockquote, then threw `Schema element property "aiPreview" cannot target element "link"` | final-verification failure caused by a unit setup that omitted insert-preview runtime mode | Invalidated the package-only claim; repaired Regression source to require `runtime-modes:` parity before another product attempt | pass: final workflow suite 44/44 and source/generated parity exact |
| Exact Browser verification after second package-green candidate | Generate MDX sample progressed past the blockquote and link, then threw `Editor element "paragraph" at [13] cannot contain "callout"` | final-verification failure caused by a deterministic fixture test that stopped at the link | Invalidated the prefix-only claim; repaired Regression source so unit RED cases declare complete versus minimal fixture scope and minimal input cannot close a case | pass: complete 222-chunk fixture and Browser 5/5 |
| Complete fixture sample validation | Flow callout first rendered literally, then stale `align` failed the closed media schema | expected attempt-3 TDD diagnosis, not a claimed candidate | Put both callout tags on flow boundaries; remove unsupported file alignment and use canonical `textAlign` for audio/video | pass: test asserts real callout/file/audio/video nodes and schema-valid properties |
| www typecheck | `ElementApi.isElement` could not be passed directly to `Array.every` because its optional second parameter conflicts with the index callback | test TypeScript shape | Wrapped the predicate in `(child) => ElementApi.isElement(child)` | pass: `pnpm turbo typecheck --filter=./apps/www`, 5/5 tasks |

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---------|---------|----------------|--------------|-------------------------|-------------------|---------------|----------------------|-----------------------|--------------|
| www-ai-mdx:blockquote-stream-schema | 1 | Package-green candidate passed the exact blockquote test and 37 affected streaming tests, but fresh exact Browser replay threw because `aiPreview` targeted inline `link` | final-verification | yes: package-only fixed claim and its proof were invalidated | repair-now: `.agents/rules/regression.mdc`, methodology, template, and semantic validator require unit RED setup to record every route-owned `runtime-modes:` mutation mode | pass: 42/42 `.agents/rules/regression/scripts/validate-regression-plan.test.mjs` tests | no: first failed fix and no architecture trigger | N/A: first failed fix retains Patch ownership; no Best API or layer plan required | reproduced: unchanged product bytes progressed past the repaired blockquote and failed when insert-preview publication applied block-only `aiPreview` to an inline link; diagnostic: exact Browser action isolated the next schema boundary under preview-active runtime mode |
| www-ai-mdx:blockquote-stream-schema | 2 | Second package-green candidate passed both exact REDs and 38 affected streaming tests, but fresh exact Browser replay threw because an incomplete callout was published inside a paragraph | final-verification | yes: prefix-only generated-sample claim and its proof were invalidated | repair-now: `.agents/rules/regression.mdc`, methodology, template, and semantic validator require `fixture-scope:` and forbid minimal fixtures from closing the case | pass: 44/44 `.agents/rules/regression/scripts/validate-regression-plan.test.mjs` tests | yes: second-failed-fix | best-api: accepted existing `AIChatPlugin.update.insertChunk` as the sole public operation and rejected new streaming APIs; plate-plan: accepted Plate AI deserialization as owner, Markdown codec as adapter, and Plite schema as enforcement only | reproduced: unchanged second-candidate bytes progressed through blockquote and link, then failed on the real `<callout> ` chunk; diagnostic: exact Browser replay proved the minimal prefix omitted the next deterministic fixture phase |

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---------|------------------|----------|---------|----------|------------|-------|
| www-ai-mdx:blockquote-stream-schema | 2 | second-failed-fix | escalate | required: best-api accepted no new public noun; keep `AIChatPlugin.update.insertChunk` and delete ad hoc publication of structurally incomplete MDX | plate-plan: accepted Plate AI streaming deserialization as canonical owner; Markdown remains syntax adapter and Plite schema remains fail-closed enforcement | accepted: complete deterministic fixture replay gates the one-owner repair before Browser |

Proof-host readiness:
| Case ID | Source owner | Runner / route / host | Freshness evidence | Generated/export boundary | Result |
|---------|--------------|-----------------------|--------------------|---------------------------|--------|
| www-ai-mdx:blockquote-stream-schema | `AIChatPlugin.update.insertChunk`; registry MDX fixture; `/docs/link` | existing Bun package-integration runner; fresh `pnpm --filter www dev` Browser host | final receipt 44/44; fresh host served five complete fallback streams | `pnpm --filter www build:registry`; generated `use-chat.json` hash `f9dfe62e76a8b5dbfcd6225abb314608870a1a62840ea218e7d52ce308aeb267` | completed |

Patch delegation:
| Case ID | Red test | Allowed owner/files | Required proof/stability | Patch return evidence | Result |
|---------|----------|---------------------|--------------------------|-----------------------|--------|
| www-ai-mdx:blockquote-stream-schema | exact `unit-red` above | `packages/platejs/src/ai/react/AIChatPlugin.ts`, complete package fixture, registry MDX sample and generated mirror | focused red/green, full affected corpus, fresh `/docs/link`, 5/5 runtime stability | root cause, owners, red/green, receipt/fingerprints, architecture verdict, P1 review | completed |

Stability:
| Case ID | Executable proof / host | Required runs | Results | Retry count | Decision |
|---------|-------------------------|---------------|---------|-------------|----------|
| www-ai-mdx:blockquote-stream-schema | complete 222-chunk package fixture plus fresh `/docs/link` Browser | 5 exact runs | pass 5/5: stable URL, blockquote 1, generated link/media/callout through final video, overlay 0, console errors 0, post-stream marker accepted | 0 | keep; completed locally |

Packet decisions:
| Case | Executable evidence | Decision | Claim width | Residual risk | Next owner |
|------|---------------------|----------|-------------|---------------|------------|
| www-ai-mdx:blockquote-stream-schema | exact package RED/green, 44/44 affected corpus, fresh Browser 5/5, P1 clean | keep; completed locally | AI generated MDX publication on the tested dirty checkout | uncommitted and unpushed; the live AI endpoint was not exercised because the registry route deliberately used its deterministic fallback | user, only if commit/push/PR is desired |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|------|-----------------------|----------|----------------------|---------------|----------------|
| www-ai-mdx:blockquote-stream-schema | Package setup omitted insert-preview mode, then stopped before deterministic callout/media chunks | repair-now | `.agents/rules/regression.mdc`, `.agents/rules/regression/references/methodology.md`, `docs/plans/templates/regression.md`, and the semantic validator require `runtime-modes:` plus `fixture-scope: complete\|minimal`; minimal fixtures cannot close a case | pass: 88/88 source/generated semantic-validator tests and 38/38 test-first contract tests | attempts 1 and 2 invalidated; complete 222-chunk fixture and Browser 5/5 pass |

Workflow slowdowns:
| Step / command | Owner | Elapsed / expected | Cause | Evidence value | Repair/result |
|----------------|-------|--------------------|-------|----------------|---------------|
| Initial focused Bun invocation | test command | one failed invocation | path lacked the explicit `./` prefix Bun expected for file filtering | none | reran with an explicit relative path and reproduced the RED |
| First unit fixture | Regression setup | one candidate cycle | fixture did not activate insert preview, so it missed schema placement on links | exposed a real runtime-mode gap | added the real insert-preview test and executable `runtime-modes:` validation |
| Second unit fixture | Regression setup | one candidate cycle | fixture covered only the opening prefix, so it missed callout and media phases | exposed incomplete deterministic coverage | replayed all 222 chunks and added executable fixture-scope validation |
| Browser final-state read | Browser proof | 12–23 seconds per run | deterministic stream was still in flight at the first read | early reads were diagnostic only | bounded polling waited for the final video section before each assertion |
| Agentation overlay and run-5 follow-up focus | Browser interaction | one locator adjustment and one focus correction | overlay intercepted coordinates; the editor was not the active key target once | no product failure or retry | used the exact AI menu locator/keyboard path, then explicitly focused the editor before the marker |

Findings:

- Streaming Markdown can return trailing whitespace after constructing a nested
  block. Appending that whitespace to the outer blockquote violates its compiled
  schema; the publisher must descend to the nearest text-owning descendant.
- Insert preview metadata is an element property with a closed placement set.
  Applying it blindly to inline `link` nodes is invalid; the compiled schema is
  the authority for each target type.
- The deterministic MDX fixture itself used inline flow-callout syntax and the
  obsolete `align` media property. Complete fixture replay found and corrected
  both source-owned problems.

Timeline:

- Reproduced the user's exact blockquote exception in the existing package
  integration runner before changing production code.
- Invalidated two package-green candidates when fresh exact Browser replay found
  the link-property and callout/media boundaries; repaired Regression after each.
- Completed the one-owner fix, full 222-chunk fixture replay, 44-test affected
  corpus, typechecks, registry generation, 5/5 Browser stability, and reviews.

Decisions and tradeoffs:

- Keep `AIChatPlugin.update.insertChunk` as the sole public operation. No new
  streaming API, buffer abstraction, or parser layer is justified.
- Keep Plite schema validation strict. Plate AI must publish valid nodes rather
  than weakening schema enforcement.
- Keep Markdown syntax ownership in the codec and sample validity in the registry
  fixture. The generated JSON remains a mirror, not an edit owner.
- Do not add E2E coverage: the exact runtime violation is reproducibly RED in the
  package integration runner. Browser remains final route proof.

Review fixes:

- P1 autoreview returned no accepted or actionable P0/P1 findings; no product
  changes were required.
- Agent-native review passed source ownership, discoverability, generated mirror
  parity, and executable validator coverage; no workflow changes were required.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Bun did not match the focused test path without `./` | 1 | use the runner's explicit relative-path form | exact RED reproduced |
| First package-green candidate failed exact Browser replay on `aiPreview` targeting `link` | 1 | invalidate proof, add insert-preview runtime mode to the unit oracle, repair Regression | schema-gated preview metadata; final corpus and Browser green |
| Second package-green candidate failed exact Browser replay on callout nesting | 1 | invalidate proof, replay all 222 deterministic chunks, repair fixture-scope enforcement | flow callout and media fixture corrected; complete replay green |
| Complete fixture exposed literal callout and unsupported media alignment | 2 | compare with canonical MDX/media syntax and fix the source fixture | real callout plus schema-valid file/audio/video properties asserted |
| www typecheck rejected passing `ElementApi.isElement` directly to `Array.every` | 1 | wrap the type guard so the array index is not passed as its optional argument | www typecheck 5/5 |
| Run-5 follow-up marker initially targeted the wrong focused element | 1 | explicitly focus the editor, move to end, and type the marker | `RUN5_OK` accepted; product run remained retry-free |

Verification evidence:

- Red: the new blockquote split case threw
  `Editor element "blockquote" at [3] cannot contain "text"` before the fix.
- Green: exact blockquote case 1/1; complete generated fixture 1/1 with 9
  assertions; affected corpus 44/44 with 67 assertions and zero retries.
- Type safety: `pnpm turbo typecheck --filter=./packages/platejs` passed 76/76;
  `pnpm turbo typecheck --filter=./apps/www` passed 5/5.
- Static checks: Ultracite passed the four modified product/test source files.
- Generated boundary: `pnpm --filter www build:registry` completed with 367
  canonical payloads and 15 overlays.
- Browser: a fresh Next.js 16.3.2 Turbopack server replayed `/docs/link` → AI →
  Generate MDX sample 5/5. Every run reached the final video, rendered one
  blockquote plus link/callout/media nodes, had zero runtime overlay/schema
  console errors, and accepted `RUNn_OK` follow-up input.
- The five `/api/ai/command` 404 responses are expected by this registry demo and
  select its deterministic fake-stream fallback; they are not schema failures.
- Final receipt: attempt 3, input digest
  `sha256:b9db53b3a1b296f5e09f191cecac2030971a2d52b6fc95f156c68c5ff530d122`,
  receipt `sha256:0b35bcb9fc7bda021fc0fd4f85d4d739f1eb5929ebbad6be0440bf7940e97419`.
- Final product/test fingerprints: `AIChatPlugin.ts`
  `dc08fa0207dde000d45a05d3d52739859ef1e86c685149e902b328f38a9bc1d4`;
  `streamHistory.slow.tsx`
  `eb776d1fbbeee54daddb0867bac0152a0c8b905f93e227ebb91c12b5577c4697`;
  `streamInsertChunk.slow.tsx`
  `7896ccf68940620e0c8e09eab71ea1429641e41639ed398b7cf09bc9706efa6e`;
  registry source
  `c4bc77ed3a3642ba323a64a991e0a4de3b3ce44e814b07dea3ee967e55afc72e`;
  generated registry JSON
  `f9dfe62e76a8b5dbfcd6225abb314608870a1a62840ea218e7d52ce308aeb267`;
  changeset
  `7283b607fb56af2d84782eeed75628c67f04e5d2508f9d70b75fb252f1055bab`.

Final handoff:

- executable cases: `www-ai-mdx:blockquote-stream-schema` is completed locally;
  exact unit/package RED existed, so no E2E was added.
- cumulative reporter evidence, phase-specific oracles, and forbidden states:
  exact generation, model, DOM, popup, runtime-error, and follow-up-input claims
  are green; unrelated pointer/focus/paint/subscription observations are N/A.
- failed-fix invalidation and automatic repair: attempts 1 and 2 were revoked;
  runtime-mode and complete-fixture requirements are source-owned and executable.
- proof receipts and affected-corpus replay: attempt 3 receipt above validates;
  44/44 tests and 67 assertions passed after the final shared-owner edit.
- started-gate failure closure: focused Bun path, two Browser misses, complete
  fixture syntax, and TypeScript predicate failures all have exact green reruns.
- changed files: Plate AI publisher, two streaming integration tests, registry
  sample source and generated JSON, Plate patch changeset, Regression source
  rule/methodology/validator/tests/template, and their generated skill mirrors.
- design decisions: no new public API; Plate AI owns schema-safe publication,
  Markdown owns syntax, Plite schema stays fail-closed, and registry owns sample
  validity.
- tests and proof: exact red/green, 44/44 affected corpus, Plate/www typechecks,
  Ultracite, registry build, and fresh Browser 5/5 all pass.
- source/generated sync: `pnpm install` regenerated Regression mirrors with exact
  parity; `pnpm --filter www build:registry` regenerated `use-chat.json`.
- P1 and agent-native findings: P1 clean at confidence 0.9; agent-native PASS;
  no accepted findings remain.
- residual risks and next owner: no known product risk in the tested path; the
  deterministic fallback, not a live model endpoint, supplied the chunks. User
  owns any requested commit, push, or PR.
- local completion status and integration/public-status boundary: completed on
  the dirty local checkout only; uncommitted, unpushed, unreleased, and not a
  shipped/public completion claim.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | requirement extraction |
| Where am I going? | local handoff after validated closeout |
| What is the goal? | keep AI-generated MDX schema-valid through complete streaming publication |
| What have I learned? | trailing text, preview metadata placement, and fixture completeness are three independent schema boundaries |
| What have I done? | reproduced exact RED, fixed canonical owners, replayed full corpus and Browser 5/5, repaired Regression, and completed reviews |

Open risks:

- The work is uncommitted and unpushed; no integration, release, or shipped claim
  exists.
- The exact route uses its intentional deterministic fallback after a 404 from
  `/api/ai/command`; a live provider response was outside this regression case.
- No permanent E2E test was added because the exact package-level RED exists;
  the fresh Browser 5/5 run is the final route proof.
