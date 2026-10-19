---
review_scopes: [ai]
review_basis: [2026-09-16-ai-main-regression-closure]
work_kind: implementation
---

# AI separated suggestion diff repair

Status: Complete

Fill the review metadata with affected scope IDs and governing review IDs, or
leave empty when none applies. Choose work_kind for the actual outcome. Keep
this Status line as the sole plan lifecycle; phase and evidence rows are narrower.

Use this file only when the task benefits from durable state. Task owns the
lifecycle under `.agents/rules/task/references/workflow.md`; apply the user's
standing Autogoal request for long-running work unless they opt out. Publication
retains its separate authority. Add only relevant domain
packs. A template is not a list of actions every task must perform.

Objective:
Repair AI review markup so separated text insertions inside one selected
multi-block range remain separate authored insertions and unchanged content is
not rendered as deleted/reinserted.

Goal plan:
docs/plans/2026-09-25-ai-separated-suggestion-diff-repair.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- User screenshot and 2026-09-25 diagnosis in this task: heading-only insertion
  is correct; unchanged paragraph/list content between later emoji insertions is
  incorrectly rendered as replacement.
- Current correction: implement the repair; Git publication is not authorized.

Completion threshold:
- A normal AI text selection spanning the heading, paragraph and list produces
  only the three emoji insertions, with no retained deletion markup.
- Partial text selections preserve their prefix/suffix behavior, while exact
  whole-block text selections reuse the existing granular AI edit path.
- Focused Plite, Plate AI and exact Chromium reporter-path proof pass on the
  final local source.

Verification surface:
- Plate AI public plugin path:
  `packages/platejs/src/ai/react/AIChatPlugin.suggestions.spec.ts` via the AI
  React partition.
- Browser route `/` and `apps/www/tests/browser/ai-session.spec.ts`, case
  `AI edit preserves unchanged blocks and suggests only added emoji`, using the
  managed www Chromium runner with mocked provider transport.

Constraints:
- Preserve ordinary schema-valid document values, Authored as change authority,
  and exact final document application.
- Do not patch CSS/rendering or special-case emoji/content strings.
- No commit, push, PR, release or external tracker mutation.

Boundaries:
- Allowed: focused Plate AI implementation/tests, browser regression proof,
  this plan and ignored proof artifacts.
- Preserve Plite canonical change and collaboration semantics. Do not redesign
  semantic Diff or AI transport.

Timing:
- N/A.

Blocked condition:
- Repeated failure of the exact managed browser runner due to unavailable local
  dependencies or host capability after the repository's one recovery path.

Task state:
- current_phase: complete
- next: none unless Git delivery is separately authorized

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
| Repair owner | `AIChatPlugin.applySuggestion` / `createSuggestionDraft` | Resolve captured block paths for an exact whole-block text selection and reuse the existing granular leaf edit path; use an empty-path sentinel for partial selections | Broadening `RootChange.between` structural alignment broke incremental-validation scope and collaboration anchor mapping; the candidate was fully reverted | red AI contract, 26-test suggestion suite, 83-test AI React partition, Chromium replay |

Completion Gates:

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| AI separated inserts | pass | Plate AI spec + exact Chromium case | two and three separated inserts, zero retained deletes |
| Partial selection compatibility | pass | Existing suggestion suite | `suggests only the selected text inside a block` remains green |
| Canonical change laws | pass | Rejected candidate reverted; exact former failures rerun | incremental validation and remote reconcile contracts pass |

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
| Browser interaction proof | pass | Direct Playwright config against fresh source server on `/`; real selection/menu/Accept with mocked provider boundary | 1/1 Chromium, retry 0, 3.6s |
| Browser console/network check | pass | Strict runtime error capture; command endpoint intentionally mocked | no captured runtime errors |
| Browser final proof artifact | pass | Inspect attached screenshot | `docs/plans/artifacts/ai-separated-suggestion-diff-repair/ai-separated-emoji-suggestions.png`, SHA-256 `91b461fe...b09a57` |
| Exact case replay | pass | Full heading/link/kbd/two-list Markdown response with emoji additions at three separated leaves | only emoji highlighted; unchanged content unmarked; Accept produced exact final model |
| Final ref and fingerprints | pass | Local `next` candidate fingerprints | implementation `bec9bf1d...9e01f`; unit `4b65c4eb...6f29`; browser `b1bf4374...3fd6` |
| Clean final runtime | N/A | Local candidate on authorized shared `next`; managed runner freshness and fingerprints are required, publication is not | local candidate |
| Retry-free stability | N/A | Deterministic diff/rendering defect, not intermittent focus/pointer/compositor behavior | source-backed exclusion |

Verification evidence:

- Diagnosis red probe (outside repository): normal text selection produced one
  structural replacement covering unchanged paragraph/list content; the same
  content through block selection produced three inserts and zero deletes.
- Red repository test before the repair: `AIChatPlugin.suggestions.spec.ts`,
  expected `insert`, received `structure`.
- `bun test ./packages/platejs/src/ai/react/AIChatPlugin.suggestions.spec.ts`:
  26 pass, 0 fail, including partial-selection compatibility.
- `node tooling/scripts/run-entrypoint-task.mjs test platejs ai-react`:
  83 pass, 0 fail; the corresponding source-first typecheck passed.
- Fresh source server + direct repository Playwright config, exact browser case:
  1 Chromium test passed with retry 0; screenshot opened and inspected.
- `git diff --check`: pass.

Findings and remaining work:

- The browser test now changes the heading and both list leaves, asserts the
  exact three inserted spans, zero retained deletes, unchanged accepted model
  before acceptance, and exact final model after acceptance.
- A broad Plite candidate made the symptom green but failed two existing core
  laws; it was reverted. This confirms the product repair belongs in the AI
  selection adapter, which already owns granular leaf edits.
- No additional changeset applies: the affected `platejs` v2 AI implementation
  does not exist at the same package path on `main`, and the repair introduces
  no separate release delta beyond the already branch-local redesign.
- Structured Autoreview was not run because the checkout is `next`; final
  source inspection found no new API, lifecycle owner, timer or protocol.
- The execution-ledger draft is source-bound, but `record` is blocked by the
  existing `ai` scope inventory declaring the removed
  `apps/www/src/app/api/ai/copilot/route.ts`. No review record or decision-page
  reconciliation is claimed for this repair.

Final handoff:

- Outcome and owning fix: exact whole-block text selections now initialize the
  AI granular-path block coordinates; partial selections retain slice behavior.
- Proof and limits: package and fresh Chromium proof pass. The external model
  provider is mocked, so provider delivery is not claimed or needed for this
  deterministic client-side diff repair.
- Local / integrated / published state: complete local candidate on `next`;
  uncommitted and unpushed.
- Next action or completion: none within current authority.

Timeline:

- 2026-09-25T16:25:49.577Z Plan created.
- 2026-09-25: red AI regression captured; broad core alternative rejected by
  existing incremental-validation and collaboration-anchor contracts.
- 2026-09-25: AI-owned fix, package proof and fresh Chromium replay completed.

Open risks:

- The ordinary `pnpm` wrapper attempted dependency verification and was blocked
  by four pre-existing minimum-release-age lockfile entries. Direct repository
  entrypoint scripts and Playwright config ran against installed source instead.
- Focused Ultracite could not start because the installed tree lacks the
  `oxfmt` executable; source-first typecheck, tests and `git diff --check` pass.
- Review-ledger recording is blocked by the stale missing Copilot route above;
  fixing that workflow inventory is outside this product repair. The ledger
  check consequently also reports the expected stale `application/ai-command`
  fingerprint after this AI source change.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Browser pack selected | yes | Exact visible authored markup is part of the report |
| Browser route / app surface identified | yes | `/`, homepage AI section, select nodes `[4..7]`, Improve writing, mocked SSE response |
| Browser tool decision recorded | yes | Existing managed www Playwright Chromium spec owns the interaction and source lifecycle |
| Console/network caveat policy recorded | yes | `recordBrowserRuntimeErrors({ strict: true })`; provider boundary intentionally mocked |
| Observable browser case captured | yes | `ai-session.spec.ts` case above; expected three inserted emoji spans, zero retained deletes, unchanged accepted model until Accept, exact final value after Accept |

Browser classifications:
- positive-control: pass — exactly three emoji insertion highlights.
- negative-control: pass — unchanged paragraph/list text has no authored change
  wrapper and no retained deletion exists.
- duplicate-control: pass — the change-id query returns exactly the three
  expected text contents once each.
- clean-runtime rule: N/A for publication because this is an unpushed local
  candidate; a fresh final-source process and page were used.
- 5/5 stability rule: N/A because the failure is deterministic change
  construction, not native input timing, focus, pointer or compositor behavior.
