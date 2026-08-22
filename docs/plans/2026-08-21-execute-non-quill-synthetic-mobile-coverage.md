# execute non quill synthetic mobile coverage

Objective:
Add the best non-Quill synthetic mobile coverage; done when every remaining
donor is implemented or rejected with evidence and focused Plite/browser gates
pass; plan
docs/plans/2026-08-21-execute-non-quill-synthetic-mobile-coverage.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-21-execute-non-quill-synthetic-mobile-coverage.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- browser

Mode:
- `standard`

Completion threshold:
- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.
- Quill contributes no runtime code, test, fixture, documentation, or decision
  authority.
- Lexical, ProseMirror, CodeMirror, Tiptap, Monaco, and Portable Text each have
  a final `implement`, `keep-covered`, `defer-device`, `reject`, or `gate`
  verdict backed by current source and current Plite coverage.
- Every deterministic non-Quill case worth carrying is implemented with an
  exact red/green oracle. Focused runner and browser gates, P1 autoreview, and
  `check-complete` pass. Broad Plite checks are run and any external checkout
  failure is attributed to its exact owner instead of being hidden.

Verification surface:
- Current donor source and tests for the six non-Quill candidates, the prior
  donor plan, and the exact Plite DOM/React/browser owners they challenge.
- Focused unit tests for each changed package, focused Playwright projects for
  mounted behavior, source-first typecheck, lint, `pnpm check:plite:dev`, strict
  `pnpm check:plite`, P1 autoreview, Browser route inspection, and final plan
  checker.

Constraints:
- The user accepted execution and explicitly excluded Quill as legacy.
- Synthetic proof may verify deterministic event routing, model/DOM state,
  selection, focus, mutation count, and follow-up input. It may not claim
  physical iOS/iPadOS/Android behavior, software-keyboard behavior, native
  selection handles, native clipboard exposure, or Appium completeness.
- Do not add runtime browser heuristics merely to make a synthetic case green.
- Prefer test-only additions when current Plite behavior already satisfies the
  portable invariant.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.

Boundaries:
- In scope: Lexical, ProseMirror, CodeMirror, Tiptap, Monaco, and Portable Text
  donor evidence; current Plite input, composition, selection, focus, mutation,
  table, and browser proof owners; implementation of every worthwhile
  deterministic synthetic case found in that set.
- Source owners: `packages/plite-dom`, `packages/plite-react`, `packages/browser`,
  `apps/plite`, and the smallest Plate table owner only if the selected case is
  product-owned.
- Non-goals: Quill; ProseKit and Meowdown packets already handled; exhaustive
  editor architecture ports; donor-specific state machines; performance;
  physical-device execution while devices are unavailable.
- Direct Plate/collaboration adoption owners: N/A unless a selected invariant
  belongs to Plate table behavior or changes collaboration-visible editor
  transactions.

Output budget strategy:
- Reuse the completed donor ledger, then read only decision-critical source and
  focused tests for the six candidates. Exclude generated output, logs,
  `node_modules`, `.next`, `.turbo`, build artifacts, and donor-wide dumps.
  Count matches first and cap source reads to exact owner ranges.

Blocked condition:
- Block only after three distinct focused attempts prove that the selected
  deterministic case cannot be reproduced or verified in current Plite
  tooling. Offline physical devices do not block synthetic execution.

Plite Plan state:
- status: complete
- phase: prove and hand off
- next: none
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Exclude Quill, execute the remaining candidates, add only honest synthetic coverage until direct device testing exists, and finish with implementation proof. |
| Active goal and plan verified | yes | Active one-shot goal names this plan, every remaining donor, focused Plite/browser proof, and final evidence-backed verdicts. |
| Current owners read | yes | Read current Lexical iOS Backspace tests, ProseMirror iOS Enter handling, CodeMirror iOS/Android pending-key handling, Tiptap mobile focus timing, Monaco wrapper import, Portable Text evidence, Plite DOM input runtime, React keyboard/input strategy, browser project config, runner, CI matrix, and plaintext browser proof. |
| Best API target resolved | yes | No reusable public call shape changed. The packet is private app test/config/runner and manual CI wiring, so `best-api` is N/A. |
| Mode and execution boundary resolved | yes | Standard one-shot execution is explicitly authorized. Quill is outside the boundary and real-device claims stay deferred. |
| Browser pack selected | yes | Browser proof applies because the target is mounted editor input behavior. |
| Browser route / app surface identified | yes | Existing `/examples/plite/plaintext`; new proof file `apps/plite/tests/plite-browser/donor/examples/mobile-input-proxy.test.ts`; new `mobile-webkit` Playwright project uses an iPhone device descriptor and runs only that file. |
| Browser tool decision recorded | yes | Use focused repository Playwright for synthetic dispatch and Browser for final route, DOM, focus, console, and visible-state inspection. Chrome/Computer are N/A because no native OS interaction is claimed. |
| Console/network caveat policy recorded | yes | Final mounted proof checks runtime and console errors. Network is checked only when the selected action could navigate or fetch. |
| Observable browser case captured | yes | Case `synthetic-mobile-beforeinput-proxy`: on `/examples/plite/plaintext`, touch-focus the editor in iPhone-profile WebKit, dispatch beforeinput-only `insertParagraph` and repeated target-range `deleteContentBackward`, then assert model/DOM blocks, collapsed model/native selection, focus, one command per event, follow-up text, and no runtime errors. Base ref `0231a088c40911aa9a3dc41978d00a6fd41ff76f` has no `mobile-webkit` project or mounted proxy case. Final local fingerprints are recorded below. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports/behavior claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Six donor verdicts are final; the two worthwhile new cases and the scoped runner/CI lane are implemented. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Donor heads and exact owner ranges were reread on 2026-08-21; cursors are recorded below. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | No public API or runtime contract changed; private test/config/runner wiring only. |
| Conditional risk and adoption | yes | Complete triggered risk/browser/Benchmark/provenance work or give one scoped N/A reason | Browser proof applies and passed. Benchmark, package adoption, docs, release, and public provenance do not apply. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Runner contracts 59/59, exact project listing 2/2, mobile-WebKit 5/5, mobile project 2 intentional skips, and Browser proof passed. Broad checks stop on unrelated lifecycle-error drift recorded below. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff below names the private owners, zero public breaks, proof, and raw-device residual risk. |
| P1 autoreview | yes | Run with `--max-priority P1` for implementation changes; P2/P3 are opt-in only, or record planning-only N/A | Scoped seven-file local bundle passed with no P0/P1 findings; confidence 0.93. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-21-execute-non-quill-synthetic-mobile-coverage.md` | Recorded after the final checker run. |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Fresh Browser page on final built `/examples/plite/plaintext`: heading and editor visible, editor focused after click/type, follow-up text applied. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Zero console warnings/errors. Network is out of scope because the local edit neither navigates nor fetches. |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | Fresh route/DOM/focus/console receipt recorded below. Screenshot waived because the claimed state was completely inspectable through DOM and focus state, not spatial rendering. |
| Exact case replay | yes | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | Both proxy cases passed in mobile-WebKit with exact blocks, model/DOM selection, focus, trace counts, follow-up input, and runtime errors checked. This is coverage addition, not a reporter bug; the missing-project runner contract supplied the red. |
| Final ref and fingerprints | yes | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | Local base ref and all packet fingerprints are recorded below. |
| Clean final runtime | yes | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | N/A: this is an uncommitted local candidate and makes no fixed, shipped, or physical-device claim. |
| Retry-free stability | yes | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | `mobile-webkit` passed 5/5 forced retry-free runs, two tests per run. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Current donor/runtime/runner/CI owners and claim boundary recorded. | Decide |
| Decide | complete | Two mounted cases and one scoped mobile-WebKit lane selected; remaining donor-specific machinery rejected or gated. | Prove and hand off |
| Prove and hand off | complete | Focused proof, Browser inspection, scoped P1 review, fingerprints, and external-check boundary recorded. | None |

Decision brief:
- outcome: Remove Quill from authority and implement every worthwhile,
  deterministic synthetic case from the six remaining candidates.
- chosen shape: Prefer focused tests against existing Plite behavior. Add
  runtime code only when a portable invariant fails and the current owning
  abstraction is clear.
- strongest rejected alternative: Do not port editor-specific mobile heuristics
  or call a desktop/mobile-viewport event physical-device proof.
- consequence: The fast lane gains useful regression pressure now while raw
  Appium receipts remain the only authority for device-specific behavior.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Lexical iOS Backspace transport | Plite package tests cover Korean iOS deferral and broad target ranges, but no mounted mobile-WebKit proxy proves repeated beforeinput-only deletion. | Add a fresh local mounted target-range Backspace case. Do not broaden keydown deferral beyond the current raw-device-backed locale rule. | `apps/plite` browser proof | Lexical's exact portable value is the fallback path and duplicate safety, not authority to change Plite's device routing. | none | iPhone-profile WebKit; model/DOM/selection/focus/trace/follow-up | A synthetic pass cannot prove the iOS suggestion bar or actual event order. | implement |
| ProseMirror iOS Enter transport | Plite handles `insertParagraph` in package tests, but mounted mobile proxy coverage still relies on physical-keyboard tests that skip mobile. | Add beforeinput-only paragraph split with one commit and follow-up insertion. | `apps/plite` browser proof | iOS may omit or delay useful keydown handling; the beforeinput path must stand alone. | none | Same mobile-WebKit proxy and assertions | Do not port ProseMirror's 200 ms fallback timer. | implement |
| CodeMirror mobile pending keys | Current source delays Android keys and lets iOS native DOM changes lead. Plite already owns its own Android manager and event epoch. | Reuse the Enter/Backspace mobile-WebKit proxy cases as coverage pressure; add no pending-key state. | Existing Plite input runtime | The portable invariant duplicates the first two rows; CodeMirror's timers and state are implementation-specific. | none | Same proxy cases plus current package contracts | Copying pending-key machinery would create unproved browser folklore. | keep-covered |
| Tiptap mobile focus timing | Tiptap focuses synchronously on iOS/Android. Plite already has a direct focus owner. | Touch-focus before dispatch and assert the editor retains focus after both edits and follow-up input. | Existing Plite focus runtime and new proxy case | This keeps the portable observable without importing Tiptap command or NodeView policy. | none | Focus-owner assertion in mobile-WebKit | Playwright touch does not prove the software keyboard appeared. | keep-covered |
| Monaco iPad keyboard wrapper | The local repo only imports `iPadShowKeyboard` from absent `monaco-editor-core`. | Add nothing until owning core source and tests exist. | Future Monaco-core harvest | An import name is not behavior evidence. | none | N/A | Guessing would create a meaningless test. | gate |
| Portable Text mobile input | Its Android input-manager and IME transport were already mapped to current Plite. | Keep current Android/composition contracts; add no duplicate proxy case. | `packages/plite-react` | No distinct remaining deterministic invariant survives deduplication. | none | Existing Android/composition package and browser rows | Synthetic IME still cannot certify raw keyboard behavior. | keep-covered |
| Synthetic mobile WebKit lane | Current `mobile` is Pixel-5 Chromium; current `webkit` is desktop Safari. | Add `mobile-webkit` on Darwin using Playwright's iPhone descriptor, restricted to the focused proxy file; include it in the runner and CI merge. | `apps/plite` Playwright config, runner, runner tests, CI | This is the cheapest honest approximation of WebKit plus iPhone UA, touch, viewport, and mobile flags while devices are offline. | CI browser matrix only | Runner contract, focused project runs, exact CI project merge | Project naming must never be mistaken for raw iOS proof. | implement |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Runner red | `apps/plite` runner/config tests | Add expectations for `mobile-webkit` project selection and WebKit executable ownership before config support. | Current project list has no mobile WebKit project. | Focused runner contract fails for the missing project. | `pnpm --filter plite test:runner` |
| 2. Proxy project | `apps/plite/playwright.config.ts`, runner, CI | Add Darwin-only `mobile-webkit` with an iPhone descriptor and exact proxy-file `testMatch`; route executable identity, local matrix, CI execution, and merged project accounting. | Slice 1 is red. | Runner contract and Playwright project listing include the exact scoped project. | Runner tests and `playwright test --list --project=mobile-webkit` through the repo runner |
| 3. Mounted donor cases | `mobile-input-proxy.test.ts` | Add beforeinput-only paragraph split and repeated target-range Backspace cases. Run only for `mobile-webkit`; the Pixel-mobile project discovers and intentionally skips them. Assert model, DOM, selection, focus, trace, follow-up input, and errors. | Project exists. | Mobile-WebKit passes once, then 5/5 retry-free. No runtime heuristic changes. | Focused per-project commands |
| 4. Closure | App/test/CI owners | Run source-first typecheck, lint, runner contracts, affected Plite check, strict Plite handoff, Browser inspection, and one P1 autoreview. No changeset because no published package changes. | Focused cases are stable. | All applicable gates pass and final fingerprints are recorded. | Commands in proof matrix and final evidence |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| `mobile-webkit` is an explicit scoped proxy | Current config has Pixel-5 Chromium and desktop WebKit only. | Project listing and runner contracts identify `mobile-webkit`; CI exact merge requires it. | complete |
| Beforeinput-only Enter commits once | ProseMirror and CodeMirror let native mobile changes lead; Plite package tests map `insertParagraph`. | Mounted block split, exact trace count, collapsed model/native selection, retained focus, and follow-up text passed in mobile-WebKit. | complete |
| Beforeinput-only Backspace commits once per event | Lexical has exact iOS fallback/repetition tests; Plite has package target-range coverage but no mounted mobile-WebKit row. | Mounted repeated target-range deletion, exact command count, model/DOM agreement, collapsed model/native selection, retained focus, and follow-up text passed in mobile-WebKit. | complete |
| No physical-device claim is made | Playwright emulates UA, viewport, touch, and engine only. Raw receipt remains absent. | Project/test names say proxy; completion evidence lists excluded claims and never calls it iOS Safari device proof. | complete |

Conditional evidence:
- High-risk scenarios: the new project accidentally runs the whole suite under
  wrong project-name branches; event dispatch double-commits; model and DOM
  selection diverge; focus drops; CI merge omits the new project; proxy wording
  becomes a raw-device claim. Exact testMatch, trace counts, selection/focus
  assertions, runner tests, CI merge accounting, and claim wording gate them.
- External research: N/A. Current local donor source/tests and current Plite
  owners are sufficient.
- Issue/PR provenance: N/A. No public issue or status claim changes.
- Browser/Benchmark/docs/release/behavior-law owners: browser and CI proof apply.
  Benchmark, public docs, behavior-law changes, package release, changeset, and
  collaboration adoption do not.

Findings:
- 2026-08-21 user correction: Quill is legacy and must be ignored completely.
- The earlier plan left Lexical covered, ProseMirror and CodeMirror
  device-deferred, Tiptap rejected, and Monaco gated. Those verdicts must be
  reopened against exact synthetic-test value before implementation.
- Lexical has exact synthetic iOS Backspace fallback and repetition tests.
  ProseMirror and CodeMirror both let mobile native input lead for Enter or
  Backspace. Their portable overlap is a mounted beforeinput-only path, not
  their editor-specific timers or pending-key state.
- Current Plite has Pixel-5 Chromium and desktop WebKit projects but no
  iPhone-profile WebKit project. A focused project avoids rewriting 392
  hard-coded `mobile` branches across 33 browser files.
- Tiptap contributes only a focus invariant here. Monaco remains gated because
  the local checkout lacks `monaco-editor-core`.
- Portable Text contributes no new case: its distinct Android/IME behaviors are
  already owned by current Plite contracts.
- A Pixel-mobile probe proved the synthetic event alone is the wrong Android
  oracle: Android lets native DOM mutation lead, so the event was not prevented.
  Simulating that mutation would encode a fake browser. The proxy therefore
  runs only in iPhone-profile WebKit.

Decisions and tradeoffs:
- Add one narrowly scoped `mobile-webkit` project instead of pretending the
  existing Pixel-5 Chromium project says anything about WebKit.
- Restrict the new project to the proxy file. Running the full suite would
  misroute hundreds of existing `project.name === 'mobile'` branches and turn
  this packet into unrelated browser-matrix surgery.
- Keep Plite runtime behavior unchanged. The proxy proves beforeinput fallback
  behavior; only a raw device can justify broader iOS keydown deferral.
- Use local fixtures and assertions. Donor tests provide invariants and source
  refs, not copied code.
- Add no public API, timer, pending-key state, package export, docs, or changeset.

Review fixes:
- None. Scoped P1 autoreview reported no P0/P1 findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Managed browser proof invalidated by concurrent edit to `packages/browser/src/playwright/native-event-trace.ts` | 1 | Wait for the source generation to settle and rerun from a fresh proof snapshot. | Later exact mobile-WebKit runs passed. |
| Managed browser proof invalidated by concurrent edit to `packages/core/src/lib/plugins/override/OverridePlugin.ts` | 1 | Rerun only after a fresh build/input fingerprint. | Later exact mobile-WebKit runs passed. |
| Pixel-mobile probe did not prevent synthetic `beforeinput`, and keyboard fixture insertion appended inside the Android native-edit path | 1 | Stop treating Pixel Chromium as an iOS/WebKit oracle; use semantic fixture setup and scope the case to mobile-WebKit. | Final mobile project intentionally skips both rows; mobile-WebKit passes. |
| First 5/5 ledger invalidated by concurrent edit to `packages/core/src/internal/plugin/resolvePlugins.ts` | 1 | Keep the integrity guard and restart the ledger on the next stable source snapshot. | Final forced ledger passed 5/5. |
| First P1 autoreview bundle exceeded eight passes because the checkout contains unrelated work | 1 | Build a temporary review clone containing only this packet's baseline/current files. | Seven-file isolated bundle passed clean. |
| First isolated review used an invalid sparse checkout that presented 9,670 fake deletions | 1 | Stop that run and use a normal temporary clone. | Normal-clone seven-file review passed clean. |

Verification evidence:
- Donor cursors rechecked on 2026-08-21: Lexical
  `dd5c41b13193efa9ab1574234d8593d2c9e4f988`, ProseMirror View
  `ca4c78e9b56f1b164c0b3758b59d8748f11b7534`, CodeMirror
  `c010426d06689a7115aa9df08425126b6d3ead2f`, Tiptap
  `91c51be53c4655ef07e29ec489471524debfa0ca`, Monaco wrapper
  `7374dcb41a787a63d5885a5be5e6bbc2e6bc338c`, and Portable Text
  `ad2a52d13d9ffb06b994e5866a37605c840eb72c`.
- Base/final local ref: `0231a088c40911aa9a3dc41978d00a6fd41ff76f`.
  The packet is uncommitted, so file fingerprints identify the replayed state.
- Red: `pnpm --filter plite test:runner` failed before implementation because
  `getPliteBrowserProjects` was missing.
- Green: `pnpm --filter plite test:runner` passed 59/59 after final formatting.
- Project discovery: `playwright test --list --project=mobile-webkit ...` listed
  exactly two tests in one file.
- Pixel-mobile boundary: focused project run exited zero with two intentional
  skips. It is not counted as mobile-WebKit proof.
- Exact browser proof: five consecutive forced, retry-free
  `mobile-webkit` runs passed, two tests per run. Each run used the managed
  runner and final built app snapshot.
- Browser proof on the final built output: `/examples/plite/plaintext` rendered
  the heading and one visible textbox; click, End, and `!` retained editor
  focus, updated visible text, and produced zero console warnings/errors.
- Scoped P1 autoreview command:
  `.agents/skills/autoreview/scripts/autoreview --mode local --max-priority P1`
  against a normal temporary clone containing this seven-file packet. Result:
  clean, no accepted/actionable findings, confidence 0.93.
- Focused formatting check passed for the runner/test files. Root
  `pnpm lint:fix` remains red on unrelated existing `no-nested-ternary` and
  `no-inline-comments` findings across the checkout; the only cited
  `playwright.config.ts` lines predate this packet.
- `pnpm --filter plite typecheck`, `pnpm check:plite:dev`, and
  `pnpm check:plite` all stop on unrelated concurrent lifecycle-error drift:
  callers still pass `error` while the shared contract requires `cause` in
  `compilePlateCodecs.ts`, `HtmlPlugin.ts`, `editor-schema.ts`, and
  `public-state.ts`. None cites the packet's config, runner, or test logic.
- Final fingerprints:
  - CI workflow: `1f6f1038dde777c297b80dc1de42080ee1a0ab66bfdd114e2fb9b1c38f6d0566`
  - Playwright config: `307830cbddc9fee70d43da2e54c03c18c9c66b0a5dd530acde51f2067f5a000d`
  - runner library: `360d6c272522cc60b448995f39c6c50db9e1ef8b7d316625ef1be68d6ab81e93`
  - runner contracts: `483bec56737321437fc666efbeb954a1257d8ddb68da3d6703a523639f4ab2a5`
  - managed runner: `9ca53b7b5d72073ddcb839f294f3fa8e167e8073d6699af20a6ffdc2fa5ddd8b`
  - proxy tests: `ce303568e075cae824dd9535151fa7449bcb851bb66f1fe2147d40b04ac5cc4f`

Final handoff prepared:
- Ownership and target API/runtime: private `apps/plite` Playwright config,
  runner, tests, and manual CI matrix; no editor runtime or API change.
- Public breaks and Plate/collaboration adoption: none.
- Applicable browser/Benchmark/docs/provenance decisions: browser proof and CI
  wiring complete; Benchmark, public docs, release, changeset, and provenance
  are out of scope.
- Proof and execution risks: synthetic mobile-WebKit covers deterministic
  event routing only. Physical keyboard, software keyboard, native selection
  handles, clipboard exposure, and actual iOS/iPadOS/Android event order remain
  raw-device work.
- Execution order and user attention: code is ready as a local candidate. Broad
  checks require the separate lifecycle-error `error`/`cause` work to settle;
  no change in this packet should paper over it.

Timeline:
- 2026-08-21T17:50:41.165Z Plite Plan created.
- 2026-08-21 Captured the Quill exclusion and one-shot execution boundary
  before donor or Plite source exploration.
- 2026-08-21 Added the Darwin-only `mobile-webkit` project, managed-runner and
  CI accounting, plus mounted Enter and repeated Backspace proxy cases.
- 2026-08-21 Rejected the Pixel-mobile synthetic event oracle, completed 5/5
  mobile-WebKit proof, inspected the final built route with Browser, and passed
  scoped P1 autoreview.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Complete |
| Where am I going? | None; raw-device testing remains a future lane. |
| What is the goal? | Implement the best honest non-Quill synthetic mobile coverage and close every remaining donor with evidence. |
| What have I learned? | See Findings |
| What have I done? | Implemented and proved the scoped proxy lane; see Timeline and Verification evidence. |

Open risks:
- Physical devices remain required for software-keyboard appearance, native
  selection handles, clipboard exposure, and exact iOS/iPadOS/Android event
  order. The proxy makes none of those claims.
- Broad checkout checks are currently red on unrelated lifecycle-error API
  drift. The packet-specific gates are green, but repo-wide green must wait for
  that owner to finish.
