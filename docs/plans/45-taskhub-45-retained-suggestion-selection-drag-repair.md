---
review_scopes: [selection, suggestions]
review_basis: [2026-09-12-selection-distinct-lifetimes]
work_kind: implementation
---

# TaskHub 45 retained suggestion selection drag repair

Status: Completed

Fill the review metadata with affected scope IDs and governing review IDs, or
leave empty when none applies. Choose work_kind for the actual outcome. Keep
this Status line as the sole plan lifecycle; phase and evidence rows are narrower.

Use this file only when the task benefits from durable state. Task owns the
lifecycle under `.agents/rules/task/references/workflow.md`; apply the user's
standing Autogoal request for long-running work unless they opt out. Publication
retains its separate authority. Add only relevant domain
packs. A template is not a list of actions every task must perform.

Objective:
Repair native pointer selection across retained deletion suggestions so a held
drag on the homepage preserves its original anchor, continues tracking through
vertical scrolling and reverse movement, renders exactly one visible selection,
and leaves a correct usable selection after mouseup.

Goal plan:
docs/plans/45-taskhub-45-retained-suggestion-selection-drag-repair.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- User request on 2026-09-24: use Patch to fix TaskHub #45.
- TaskHub #45 full body, including the prior current-source diagnosis and AC1-AC8;
  claimed atomically from `pending` to `in_progress` and read back before source
  work.
- Exact reported surface: homepage `/`, starting in the Welcome heading and
  dragging downward across the Collaborative Editing retained deletion into AI
  Powered Editing and later content while the primary button remains held.

Completion threshold:
- The exact current-source homepage gesture is captured RED before the fix and
  GREEN on the final local candidate, with native/model/view selection, anchor,
  focus, pointer buttons, scroll state and visible paint sampled before mouseup.
- TaskHub AC1-AC8 all pass: ordinary endpoints crossing retained content,
  retained-start reverse drag, bidirectional shrink/expand, long-distance edge
  scroll and leave/re-enter, one-layer paint, unaffected ordinary/comment/insert
  and retained-endpoint cases, correct post-release copy/edit behavior, and no
  temporary probes.
- The smallest owning regression test is RED before and GREEN after, affected
  existing selection/suggestion tests and source typecheck pass, retry-free
  native browser stability is 5/5, and final implementation review is accepted.
- The durable owner is fixed without a comments UI workaround, timer, focus
  compensation, second drag controller, public API, commit, push, PR, release,
  deployment or external publication.

Verification surface:
- Source owners: `packages/plitejs/src/react/editable/selection-controller.ts`,
  `selection-projected-dom.ts`, `root-interaction-controller.ts`, and the
  existing runtime selection bridge when current evidence keeps it in scope.
- Package proof: nearest existing Plite React selection/root-interaction tests
  plus `pnpm --filter plitejs typecheck`; exact commands selected from Verify
  Plate's current recipes after runner discovery.
- Browser proof: existing source-built www Playwright/Chromium runner on `/`,
  extending the existing selection/suggestion drag coverage only where the
  package boundary cannot express held native input, scroll, or paint.
- Visual proof: phase screenshots immediately before/after retained crossing,
  during scrolling/reverse drag, and after release, opened and inspected at a
  legible scale with single/absent/duplicate selection controls.

Constraints:
- Preserve the full homepage fixture and every TaskHub acceptance item.
- Prefer uninterrupted browser-native selection for one continuous DOM text
  flow; retain the existing projected owner for retained endpoints or topology
  that requires it. One lifecycle owns transition, autoscroll and mouseup.
- Retained deletion remains read-only; suggestion identities and comment
  anchors cannot change from selection alone.
- The implementation phase covered local product/test/plan changes and TaskHub
  status transitions. On 2026-09-24 the user separately authorized committing
  this verified packet and pushing it directly to `origin/next`; that authority
  does not include a PR, release or deployment.

Boundaries:
- Allowed product owner: Plite React editable selection/root-interaction bridge.
- Allowed proof owners: nearest Plite React tests and existing
  `apps/www/tests/browser/suggestion.spec.ts` /
  `selection-drag-scroll.spec.ts` coverage.
- Explicit non-goals: comments business logic, accept/reject semantics, global
  popover redesign, unrelated selection cleanup, public API redesign, generated
  registry/template edits, and TaskHub #21.

Timing:
- N/A; no user deadline or minimum duration.

Blocked condition:
- Block only when the exact current-source held-button interaction cannot be
  observed after bounded runner repair, the required browser/device capability
  is unavailable, an unsafe scope expansion needs user authority, or the same
  blocker has repeated enough to satisfy native goal rules with no useful local
  work remaining.

Task state:
- current_phase: local implementation and proof complete
- next: direct Git delivery under the user's later explicit push authority;
  remote SHA and clean-tree readback remain delivery-time evidence

Work Checklist:
- [x] Every applicable user, method, reference and template obligation maps to a source-linked row here or an existing linked ledger; exclusions have reasons.
- [x] Final reconciliation against the original checklists found no omitted requirement; evidence and applicable semantic/completion checks cover the full scope.
- [x] Capture the full outcome, acceptance criteria, scope and actual authority.
- [x] Inspect the named source, current owners and relevant evidence.
- [x] Make the change at its durable owner and adopt every affected consumer.
- [x] Run applicable proof and resolve verified in-scope findings.
- [x] Record the final outcome, evidence, material limits and next action.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
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

Decisions and tradeoffs:

| Decision | Owner and source | Chosen fix | Material alternative rejected | Proof |
| --- | --- | --- | --- | --- |
| Native-to-projected drag lifecycle | `selection-controller.ts` and `root-interaction-controller.ts`; selection review `2026-09-12-selection-distinct-lifetimes` | Defer projected DOM import while a browser-native drag owns the held gesture; after a required handoff creates a view selection, retain that existing projected owner until mouseup | Always skipping projected import, comments UI compensation, timer/focus restoration, a second drag controller, or a public selection API | Current-source REDs plus package and 15-run browser GREEN ledger below |

Completion Gates:

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| AC1 exact homepage held drag | pass | Playwright/Chromium `/`; sample every phase before mouseup | `selection-drag-scroll.spec.ts` GREEN 5/5; held pointer trace and >300-character selection |
| AC2 ordinary endpoints cross retained deletion | pass | Native pointer regression asserts continued expansion after retained crossing | Held selection progresses 24 to 34 characters before mouseup |
| AC3 retained-start reverse and shrink | pass | Existing/new pointer paths in both directions | Held forward range shrinks 34 to 24 and expands to 34; four live/retained endpoint directions assert view ownership before and after release |
| AC4 long scroll and leave/re-enter | pass | Source-built homepage drag-scroll replay with scroll/buttons trace | Down/up internal edge autoscroll, viewport exit/re-entry and post-release stopped scroll GREEN 5/5 |
| AC5 exactly one visible selection layer | pass | Classified phase screenshots and native/view ownership assertions | `positive-control: pass`, `negative-control: pass`, `duplicate-control: pass`; actual matches single within <=2 pixels and `doubleHighlighted: false` |
| AC6 unaffected comparison paths | pass | Ordinary/comment/insert plus retained-endpoint affected corpus | Fresh-page ordinary and insert-only native selection GREEN 5/5; homepage model including comment/suggestion metadata unchanged; four retained endpoint paths GREEN |
| AC7 release, copy and follow-up edit | pass | Mouseup selection plus copy/edit and identity/anchor assertions | Clipboard is `this redundant phrase out of the f`; follow-up edit succeeds; authored IDs and homepage model remain unchanged from selection |
| AC8 clean final replay and checks | pass | No probes; focused tests, typecheck, final browser 5/5 and fingerprints | 48 React tests, affected source/test typechecks, focused lint, diff check, and 15/15 final Chromium ledger pass |
| Implementation review | pass | Verify Plate ownership/complexity source review; Autoreview N/A on `next` | Existing owners retained; no public API, new state, timer, compatibility path or second drag controller; no P1/P2 findings |

Select proof from the actual change. Verify Plate owns package, browser,
native-device, CLI and artifact claims; Testing owns test value. Generated
skills use the source generator. Public API adoption, registry/changelog,
security and release mechanics stay with their domain owners. Link their
existing receipts here instead of copying their full checklists.

Task's shared review budget applies only to an explicit review request or
actual PR closeout and never runs Autoreview on `next`. A budget cap does not
end useful authorized repairs. Record an actual review or its N/A reason.
For authorized PRs use the real repository template and Task's PR-body contract.
For authorized tracker messages read back the result. Neither follows merely
from creating this file.
| Browser interaction proof | pass | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Repo-owned Playwright Chromium used real mouse, scrolling, selection paint and clipboard APIs on `/` and `/blocks/suggestion-demo` |
| Browser console/network check | pass | Record console/network state or why it is not applicable | `recordBrowserRuntimeErrors` reports none in all three final target scenarios; no network failure affected the local routes |
| Browser final proof artifact | pass | Record screenshot/trace/route/native proof or exact caveat | `ordinary-endpoints-retained-crossing-held.png` opened at original scale; held-button state and pixel controls are asserted in the same phase |
| Exact case replay | pass | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | Current-source failures reproduced at 21 vs expected 24 and 219 vs expected >300; final candidate passes exact held gestures and end state |
| Final ref and fingerprints | pass | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | Base `c1c1da084563a11121a4f47bda9818b1dc45a59c`; fingerprints recorded below |
| Clean final runtime | implementation-closeout | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | At implementation closeout the five issue-owned files were local on the base ref; the later-authorized delivery must add clean-tree, exact-ref replay and remote SHA readback as its separate receipt |
| Retry-free stability | pass | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | 15/15 final Chromium runs: each of homepage scroll, ordinary/insert comparison and retained-deletion crossing passed 5/5 with one worker and configured retries 0 |

Verification evidence:

- Intake: TaskHub #45 was read in full, claimed with `--if-status pending`, and
  read back as `in_progress`. Base branch is `next`; initial HEAD before this
  plan was `c1c1da084563`.
- RED on the untouched source: the held ordinary-to-ordinary range stopped at
  21 characters instead of reaching 24 after crossing retained deletion, and
  the homepage long drag stopped at 219 characters instead of exceeding 300.
- Product GREEN: `plitejs` React controller tests pass 48/48; React source and
  package-test typechecks pass; focused Ultracite and `git diff --check` pass.
  The aggregate package typecheck entrypoint was not used as final evidence
  because its nested command selected Codex fallback pnpm 11 and attempted to
  reinstall a pnpm 9 workspace; the owning partitions were run directly with
  the repository Corepack pnpm 9.15.0.
- Browser GREEN: the final source-built Chromium command ran three selected
  scenarios with `--repeat-each=5`, one worker and retries 0: 15/15 passed in
  56.1 seconds. Strict runtime-error capture remained empty.
- Paint GREEN: actual, single, absent and duplicate controls use the identical
  screenshot clip. Positive and duplicate differences exceed 20 pixels,
  absent-to-absent is <=2, and actual-to-single is <=2. The final held-range
  screenshot was opened and visually confirms one blue selection across
  ordinary, retained-deletion and following ordinary text.
- Existing `.changeset/tidy-retained-caret.md` already covers pointer selection
  expansion across deleted-text boundaries; no duplicate changeset was added.
- Candidate fingerprints (SHA-256): selection controller
  `fd1c155641f49447ebaebe06423b8895525551a478ea2e33829ed67454675ade`;
  root interaction controller
  `d7073c42f02a548e3ed4b3033daf5381ebc5434bc4c693f4182cf8085b8ffb1d`;
  suggestion browser spec
  `be1773988c35537815c9a57cd6be17c511b463875734262f6238afd003900aee`;
  scroll browser spec
  `970969dba7a5c3af943e3480f18e30f2c3ff32bde3857c7da8e1ed7751c5aab1`;
  suggestion fixture
  `2c677d8926ba8eadb8e0f7c14d5737e5aef9752d4543cc852064d942bd4e4759`;
  homepage fixture
  `ac864c96cb624d5a82c735b3e34cdde0d607ff0412bb7cd3224d22885b3ff5e4`;
  Playwright config
  `a205a2ae686426226a8e49bf5f5a4bdb81accc8dc495ac38ca568f4ebaa252bf`;
  displayed-selection harness
  `661504f4a3c3952a4753b9271de35bb8803b3ef770152d6c4a96cf9fb1666f9c`.

Findings and remaining work:

- `importProjectedDOMSelection` was importing and clearing the DOM range while
  the primary button was still held. Once the drag crossed retained content,
  root interaction correctly created a projected view selection but stopped
  updating it after the focus returned to ordinary text.
- The owning repair defers DOM import only while browser-native drag is active
  and retains an already-created view selection as the current gesture owner.
  Mouseup still imports/finishes through the existing lifecycle.
- No local implementation or verification work remains. Direct Git delivery
  was authorized later and must preserve the distinct CI/deployment boundary.

Final handoff:

- Outcome and owning fix: local TaskHub #45 repair complete in the Plite React
  selection and root-interaction owners.
- Proof and limits: AC1-AC8 pass locally in Chromium; exact Chrome UI outside
  the repo runner, CI, another browser engine and remote integration were not
  claimed.
- Local / integrated / published state: the implementation closeout produced a
  local candidate on `next` base `c1c1da084563`; a later direct-push request
  authorizes Git delivery but still does not authorize PR, release or deploy.
- Next action or completion: TaskHub remains `review`; delivery completion is
  established only by the live remote SHA and clean-tree readback.

Timeline:

- 2026-09-24T03:45:38.305Z Plan created.
- 2026-09-24 Current-source ordinary-endpoint and homepage long-drag REDs
  captured before product changes.
- 2026-09-24 Owning selection lifecycle repaired and exact browser proof,
  package checks, pixel controls and 5/5 stability completed.

Open risks:

- No unresolved local acceptance risk. Direct Git delivery is separately
  authorized; CI, deployment and other browser engines remain outside the
  completion claim.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Browser pack selected | yes | `browser` pack materialized by the goal helper. |
| Browser route / app surface identified | yes | Homepage `/`, Welcome -> Collaborative Editing -> AI Powered Editing under one held primary drag. |
| Browser tool decision recorded | yes | Repo-owned Playwright/Chromium runner for native pointer, scroll, state and screenshot proof; local image inspection for paint. |
| Console/network caveat policy recorded | yes | Final exact replay records strict runtime errors; unrelated network noise must be classified rather than silently ignored. |
| Observable browser case captured | yes | Stable case `taskhub-45:ordinary-endpoints-cross-retained-held-drag`; TaskHub #45; current-source REDs were 21 vs 24 and 219 vs >300 before the repair. |
