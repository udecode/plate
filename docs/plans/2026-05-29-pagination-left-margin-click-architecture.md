# pagination left margin click architecture

Objective:
Create a user-review-ready Slate Plan for the pagination left-margin click
bug: clicking beside a wrapped continuation line must place the caret at that
visual line start, not the previous line end, not block start, not restored
selection, and not table-tail content. The lane runs one pass per activation
and stays pending until issue/reference accounting, regression proof, and
closure gates are complete.

Goal plan:
docs/plans/2026-05-29-pagination-left-margin-click-architecture.md

Template:
docs/plans/templates/slate-plan.md

Primary template:
docs/plans/templates/slate-plan.md

Applied packs:
- none

Completion threshold:
- Score >= 0.92, no dimension below 0.85.
- Every pass row complete or intentionally skipped with evidence.
- The plan names the accepted shared hit-testing owner, regression tests,
  issue/reference accounting, `Plate repo root` verification gates, and final
  user-review handoff.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-29-pagination-left-margin-click-architecture.md`
  passes only during the closure pass.

Verification surface:
- Planning checks run in `plate-2`.
- Slate v2 behavior/source claims must cite `Plate repo root`.
- Execution proof must run from `Plate repo root`:
  - `bun --filter slate-react test -- slate-string-coordinate-placement root-interaction-resolver use-slate-root-chrome`
  - focused Chromium pagination rows covering staged and virtualized left
    wrapped-line margin clicks, right wrapped-line margin clicks, first-page
    margin/corner no-jump, and fresh single-layout corner no-jump
  - `bun --filter slate-react typecheck`
  - `bun lint:fix`
  - `bun --filter slate-react build`
  - dirty-local autoreview from `Plate repo root` if execution changes code

Constraints:
- Planning mode may edit only planning/research/issue/reference artifacts.
- No `Plate repo root` implementation patch in this activation.
- Best long-term owner wins over a pagination-only patch.
- Raw Slate stays unopinionated; pagination is an example/layout stress surface,
  not a core product API.

Boundaries:
- Allowed planning edit scope: `docs/plans/**`, `docs/research/**`,
  `docs/slate-issues/**`, `docs/slate-v2/ledgers/**`,
  `docs/slate-v2/references/**`.
- Execution scope, after user acceptance: `packages/slate-react/src/editable/root-interaction-controller.ts`,
  `packages/slate-react/src/editable/slate-string-coordinate-placement.ts`,
  focused `slate-react` tests, and
  `apps/www/tests/slate-browser/donor/examples/pagination.test.ts`.
- Do not change pagination content fixtures or mask the bug by moving margins.

Blocked condition:
- Block only if the browser bug cannot be reproduced and no source/test gap
  remains actionable. That is not the case now.

Slate Plan lane state:
- slate_plan_lane_status: complete
- current_pass: closure-score-final-gates
- current_pass_status: complete
- next_pass: none
- next_action: none
- final_handoff_status: complete

Current verdict:
- verdict: user-review-ready planning lane closed; execute only after explicit acceptance
- confidence: 0.925 after closure score and final gates
- keep / cut / revise call: revise the line-edge hit-testing contract
- reason: The fresh root-end jump is fixed, but the new video shows the shared
  coordinate placement still lacks a wrapped visual-line-start invariant.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked.
- Closure is legal only in the closure score/final gates pass.
- This activation completed pass 12 and closes the planning goal if
  `check-complete` passes.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `slate-plan` loaded; planning mode only. |
| Active goal checked or created | yes | Active goal created for this lane. |
| Source of truth read before edits | yes | User report/video plus live `Plate repo root` source and tests. |
| `docs/solutions` checked for non-trivial existing-code work | yes | `rg` found no exact left-margin solution; pagination/product-package solution is unrelated. |
| Live `Plate repo root` grounding needed for current-state claims | yes | Source/test rows below. |

Work Checklist:
- [x] Objective includes lane outcome, full pass schedule, one-pass-per-activation policy, completion threshold, verification surface, constraints, boundaries, and blocked condition.
- [x] One-pass-per-activation policy respected.
- [x] Live source grounding recorded for current implementation claims.
- [x] Issue ledger / ClawSweeper pass applied or skipped with concrete evidence.
- [x] Research and ecosystem synthesis complete for every external system used as evidence.
- [x] Intent/boundary record and decision brief complete.
- [x] Scorecard recorded with evidence; total score >= 0.92 and no dimension below 0.85 before closure.
- [x] Applicable implementation-skill review matrix applied or skipped with concrete reason.
- [x] Slate maintainer objection ledger complete for every breaking/paradigm change, or marked N/A with reason.
- [x] Verification workspace gate recorded for every Slate v2 planning/source claim; execution proof gates are queued for accepted-plan execution.
- [x] TDD proof plan recorded for behavior/proof changes; N/A for executing TDD in planning mode because no implementation code was patched.
- [x] Browser proof gaps, exact scenarios, and `Plate repo root` command routes recorded; N/A for captured Playwright proof until accepted-plan execution.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Close planning threshold; leave implementation proof queued for accepted-plan execution | Score 0.923, every planning pass row closed, issue/reference sync closed, and `Plate repo root` proof gates named for execution. |
| Slate v2 source/runtime/browser claim | yes | Record live `Plate repo root` source proof and separate browser-proof gaps from execution proof | Current source/test owners are cited; exact Playwright/unit/type/lint/build gates are queued for accepted-plan execution from `Plate repo root`. |
| Issue ledger or PR reference changed | yes | Issue-sync accounting checked live/manual ledgers and PR reference; no external ledger/reference mutation required because existing rows already carry the same no-claim/fixed-preserve posture | complete |
| Autoreview for uncommitted implementation changes | later | Record N/A for planning-only closure; require dirty-local autoreview from `Plate repo root` after any accepted implementation patch | N/A now because this planning lane made no `Plate repo root` implementation diff. |
| Final user-review handoff | yes | Record final handoff in this plan and emit it in final response | Final handoff recorded below; final chat response must include Done Handoff. |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-29-pagination-left-margin-click-architecture.md` | Passed: `[autogoal] complete: docs/plans/2026-05-29-pagination-left-margin-click-architecture.md`. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | complete | video frame, live root interaction source, current pagination tests, research/ledger entrypoints read | related issue discovery |
| Related issue discovery | complete | Read existing generated/manual ledgers, ran bounded gitcrawl archive search, hydrated candidate threads, and found no exact upstream issue to claim fixed. | issue-ledger pass |
| Issue-ledger pass | complete | Read live ledger rows, v2 sync notes, coverage matrix, fork dossier, PR reference, and test-candidate maps. Decision: no shared ledger/reference mutation yet; this plan adds no fixed/improved claim and existing rows already classify the touched issues. | intent/boundary pass |
| Intent/boundary and decision brief | complete | Re-read live `useSlateRootChrome`, root interaction resolver/controller, string coordinate placement, package tests, and pagination Playwright rows. Decision: public API unchanged, internal `slate-react` line-edge hit testing is the owner, pagination example stays a stress fixture. | research refresh |
| Research, ecosystem strategy, live-source refresh | complete | Re-read ProseMirror coordinate bridge source, React ProseMirror wrapped-line/RTL roundtrip tests, Tiptap Pages limitations, Pretext pagination research, live Slate v2 coordinate code, and Evidence Kit benchmark registry/health. Decision: steal central coordinate bridge and roundtrip test discipline, not ProseMirror's public model or Tiptap's CSS-float pagination. | pressure passes |
| Performance/DX/migration/regression/simplicity pressure passes | complete | Applied Vercel React, performance-oracle, performance, and TDD lenses against live Slate v2 hit-testing code. Decision: keep public API unchanged, require single-pass bounded coordinate scan, add vertical TDD browser/unit proof, and include drag anchoring guardrails if execution changes projected drag seeding. | objection ledger |
| Slate maintainer objection ledger | complete | Answered maintainability, browser fallback, public API, performance, nested root, RTL/grapheme, drag, collaboration, test brittleness, issue-claim, and simplicity objections with live Slate v2 and ProseMirror evidence. Decision: continue with internal bounded coordinate owner and no public API. | high-risk pass |
| High-risk deliberate mode | complete | Deliberately attacked geometry targeting, virtualization/remounting, drag anchoring, complexity, RTL/grapheme coverage, stale PR issue claims, and browser-test false positives. Decision: same-fragment left/right browser proof, bounded virtualized DOM precondition, source complexity guard, conditional drag proof, and no issue claim until execution sync. | ecosystem maintainer pass |
| Ecosystem maintainer pass | complete | Re-checked ProseMirror, React ProseMirror, Lexical, Tiptap Pages, Pretext, TanStack Virtual, and Plate/slate-yjs migration boundaries. Decision: steal coordinate ownership, native-event lifecycle discipline, test shapes, layout/virtualization boundaries, and failure taxonomy only; reject every external public model/API as a Slate architecture import. | revision pass |
| Revision pass | complete | Consolidated all review passes into a user-review-ready execution queue, proof matrix, no-API decision, issue/reference sync plan, and final handoff outline. Decision: plan is architecturally ready for issue-sync accounting and closure, not implementation under the planning goal. | issue sync accounting |
| Issue sync accounting | complete | Re-read generated live rows, manual sync ledger, issue coverage matrix, fork dossier, cluster maps, package-impact/requirements files, and PR reference. Decision: no external ledger/reference mutation; existing rows already keep `#5944` related/issue-reviewed, `#5924` not claimed, `#5524`/`#1498`/focus-scroll neighbors related only, and fixed floors preserve-only. | closure score and final gates |
| Closure score and final gates | complete | Audited every completion requirement: all scheduled planning passes complete, score threshold met, issue/reference sync closed, live source and browser-proof gaps recorded, final handoff written, and check-complete scheduled in this closure pass. | none |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| React 19.2 runtime performance | 0.20 | 0.92 | Final queue keeps the hot path event/ref-only, active-root scoped, single-pass over mounted string rects, and chosen-string-only for character geometry. No React state, effects, or scheduler dependency. |
| Slate-close unopinionated DX | 0.20 | 0.94 | Public API remains `useSlateRootChrome(root, { disabled, selection })`; no page-margin hook, no pagination adapter, no product policy in raw Slate. |
| Plate and slate-yjs migration backbone | 0.15 | 0.91 | Plate inherits shared Slate React behavior; slate-yjs receives normal model selection only. Layout metrics, page breaks, and coordinates stay out of collaboration ops. |
| Regression-proof testing strategy | 0.20 | 0.92 | Final queue requires vertical red-green proof: staged wrapped-left red row, package geometry/unit proof, virtualized bounded-DOM row, same-fragment right edge, no-jump corners, and conditional drag proof. |
| Research evidence completeness | 0.15 | 0.93 | Current plan cites live Slate v2, ProseMirror, React ProseMirror, Lexical, Tiptap Pages, Pretext, TanStack, issue ledgers, and Evidence Kit boundaries. |
| shadcn-style composability and minimalism | 0.10 | 0.91 | No UI surface changes; helper extraction is allowed only if reused by click/drag coordinate placement. Pagination remains a proof fixture, not a component API. |
| Weighted total | 1.00 | 0.923 | Meets the planning score threshold; planning lane is closed after closure gates. Accepted execution remains a separate lane. |

Source-backed architecture north star:
- target shape: Root/page chrome hit testing resolves to a deterministic visual
  line-edge point from DOM line rectangles before focus/restore fallback runs.
- source evidence:
  - `packages/slate-react/src/editable/root-interaction-controller.ts:894`
    currently detects coordinate-based root chrome placement on activate-root or
    editable-root ignore paths.
  - `packages/slate-react/src/editable/root-interaction-controller.ts:921`
    builds `startRange` from `rootChromeCoordinatePlacement`, falling back to
    browser `resolveEventRange`.
  - `packages/slate-react/src/editable/slate-string-coordinate-placement.ts:69`
    chooses nearest string rect by vertical distance and horizontal center.
  - `packages/slate-react/src/editable/slate-string-coordinate-placement.ts:103`
    maps left-of-rect clicks to logical `start`.
  - `apps/www/tests/slate-browser/donor/examples/pagination.test.ts:1962`
    covers virtualized line start only for the first visible leaf/block target,
    not a wrapped continuation line.
- rejected drift: Do not patch the pagination example with a special left
  gutter handler.
- migration posture: Shared slate-react behavior; no public API unless the
  follow-up pass proves an internal helper needs a public contract.

Public API target:
| Surface | Proposed shape | User-facing DX | Compatibility / migration | Evidence | Verdict |
|---------|----------------|----------------|---------------------------|----------|---------|
| `useSlateRootChrome` | keep current public shape | Apps keep binding root chrome props | no migration | current hook is enough; bug is internal hit testing | keep |
| Line-edge hit testing | internal package behavior, not public API | clicking near visual text lines behaves like native editors | no public migration | video + source rows | revise internal |

Internal runtime target:
| Layer | Current owner | Target mechanism | Avoids | Evidence | Verdict |
|-------|---------------|------------------|--------|----------|---------|
| Root interaction | `root-interaction-controller.ts` | Convert page/root chrome click into a line-edge range before focus restoration | restore fallback stealing click intent | lines 894-933 | keep owner |
| Line geometry | `slate-string-coordinate-placement.ts` | Resolve nearest visual line rect and left/right edge offset with continuation-line proof | previous-line-end on left margin | lines 69-119 and 165-260 | revise algorithm/proof |
| Browser proof | `pagination.test.ts` | Add staged + virtualized wrapped-continuation left-margin rows | false green from first-line/block-start proof | lines 1962-2027 | add |

Hook / component / render DX target:
| Surface | Call-site shape | Composition rule | Performance rule | Evidence | Verdict |
|---------|-----------------|------------------|------------------|----------|---------|
| Pagination example | no new app handler | example keeps using shared `PagedEditable`/root chrome behavior | no extra render state | current test gap is in Playwright, not example DX | keep |

Plate migration-backbone target:
| Pressure | Slate substrate target | Plate adaptation route | Non-goal | Evidence | Verdict |
|----------|------------------------|------------------------|----------|---------|---------|
| Document page margins and table-heavy docs need reliable clicks | shared visual-line hit testing in slate-react | Plate consumes raw Slate behavior without custom gutter glue | Plate-specific page tools | root interaction owner | keep |

slate-yjs migration-backbone target:
| Pressure | Slate substrate target | Collaboration route | Non-goal | Evidence | Verdict |
|----------|------------------------|---------------------|----------|---------|---------|
| Local click maps to deterministic selection | model selection update uses resolved point/range | remote peers see normal selection state; no layout data in ops | syncing layout measurements | selection update path in controller | keep, needs later pass |

Intent / boundary record:
- intent: stop whack-a-mole pagination click bugs by making visual line-edge
  hit testing a shared runtime invariant.
- outcome: left/right margin clicks beside any visible wrapped line produce the
  clicked line's logical start/end, across staged and virtualized pagination.
- in-scope: Chromium browser proof, staged and virtualized pagination, wrapped
  paragraphs, no-jump guardrails, package unit coverage for coordinate placement,
  and preserving existing root chrome focus/restore behavior.
- non-goals: table AST splitting, public pagination API, mobile raw-device
  proof, changing example content, moving page margins, broad structural-DOM
  exclusion, solving every native browser selection issue, or adding app-level
  click handlers to mask a package hit-testing bug.
- decision boundaries: choose internal slate-react/slate-dom owner and test
  matrix without another user question.
- public boundary: keep `useSlateRootChrome(root, { disabled, selection })`
  exactly as the app-facing API. It supplies root chrome event props and does
  not grow pagination/page-margin policy.
- internal boundary: `root-interaction-controller.ts` decides whether a chrome
  click becomes coordinate placement; `slate-string-coordinate-placement.ts`
  owns nearest visual line, physical/logical edge mapping, and model offset
  resolution. Pagination owns proof content only.
- unresolved user-decision points: none after pass 11.

Decision brief:
- principles:
  - click intent beats focus restoration
  - visual-line geometry beats block-index guessing
  - package runtime owns behavior; example owns only stress fixture
  - browser proof must exercise the exact line, not just the block
- top drivers:
  - user-visible caret correctness
  - avoiding pagination-only glue
  - keeping hot pointer path bounded
- viable options:
  - Option A: pagination example left-gutter handler. Fast, but wrong owner and
    repeats bugs in every layout shell.
  - Option B: extend shared string coordinate placement to resolve wrapped line
    edges deterministically. Best owner, keeps public API stable.
  - Option C: delegate fully to browser `caretRangeFromPoint`/`resolveEventRange`.
    Minimal code, but this is exactly where stale/fallback browser behavior has
    produced wrong caret placement.
- chosen option: Option B.
- rejected alternatives: A as product glue; C as insufficiently deterministic.
- consequences: More package-level geometry tests; Playwright target helpers
  must compute expected visual-line offsets, not assert vague path changes.
- follow-ups: issue-sync accounting, then closure score/final gates.

Intent/boundary validation evidence:
- `packages/slate-react/src/hooks/use-slate-root-chrome.ts:12-30`
  exposes only `disabled` and `selection`, and `:44-55` returns stable root
  chrome event props. This is sufficient; adding `onPageMarginClick`,
  `pageHitTesting`, or structural-DOM policy here would leak product layout into
  raw Slate.
- `packages/slate-react/src/index.ts:149-153` exports
  `useSlateRootChrome`, while the string-coordinate helpers are not exported
  from the public package barrel. Keep line-edge hit testing internal.
- `packages/slate-react/src/editable/root-interaction-resolver.ts:160-193`
  keeps root chrome, editable root, native editable, external, and interactive
  descendants as distinct intent classes. Do not collapse them into a generic
  pagination margin handler.
- `packages/slate-react/src/editable/root-interaction-controller.ts:553-595`
  finds the active editable root and asks string coordinate placement for a
  target. Rows `:897-925` then turn that placement into a range before browser
  fallback can steal the click.
- `packages/slate-react/src/editable/slate-string-coordinate-placement.ts:69-119`
  chooses the nearest string rect and maps left/right physical edges to logical
  edges; `:165-233` resolves a line-edge model offset from character rects and
  grapheme boundaries. This is the correct fix owner.
- `packages/slate-react/test/slate-string-coordinate-placement.test.ts:107-154`
  already covers RTL physical/logical edge mapping, and `:156-170` starts the
  grapheme-boundary proof family. The missing unit row is wrapped continuation
  line start/end offset selection.
- `apps/www/tests/slate-browser/donor/examples/pagination.test.ts:1345-1417`
  and `:1420-1482` cover no-jump page margins/corners; `:1543-1581` covers
  right margin line end; `:1962-2028` covers virtualized first-line margin start.
  The missing browser row is left margin beside a wrapped continuation line with
  exact expected offset in staged and virtualized modes.

Issue accounting:
| Issue / cluster | Claim category | Exact claim | Why | Proof route | V2 sync ledger | PR line |
|-----------------|----------------|-------------|-----|-------------|----------------|---------|
| `Selection, Focus, And DOM Bridge` | Related | Related, no fixed issue claim | page-margin click is DOM hit-testing/selection bridge | future Playwright + unit proof | cluster already covered by existing v2-dom-selection rows | related matrix only |
| `#5944` | Related | Related stable pagination pressure; no `Fixes` claim | issue asks stable per-line pagination/page-boundary behavior; this plan only targets caret mapping from visible page-margin clicks | future browser proof for caret mapping; no page-flicker closure | existing rows keep `issue-reviewed, unchanged` | related matrix only |
| `#5924` | Not claimed | No public ignore-cursor or structural-DOM API claim | structural DOM exclusion is broader than deterministic root/page chrome hit testing | none for this plan beyond no public API | existing rows keep not-claimed/triage-closed | related matrix only |
| `#5524` | Related, not claimed | Soft-break ArrowDown remains a different vertical-navigation issue | similar "same visual position, wrong model point" shape, but keyboard soft-break navigation is not a page-margin click | no claim without exact repro proof | existing rows keep related/no content-root claim | related matrix only |
| `#3789` | Not claimed | Existing likely-invalid double-click whitespace issue stays out | double-click cross-browser line selection is not the single-click page-margin caret bug | none | existing rows keep triage-closed | no PR line |
| `#5291` | Related, not claimed | Mobile tall-block first-line cursor jump is out of browser/device scope | related scroll/selection pressure, but needs Android proof | raw-device/browser proof only, not this plan | existing rows keep cluster-synced | related matrix only |
| `#1498` | Related, not claimed | RTL visual geometry is a guardrail, not an Enter/new-line closure | line-edge code maps physical to logical edges, but exact RTL Enter repro is different | unit guardrail; no issue closure | existing rows keep related/cluster-synced | related matrix only |
| `#3429` | Preserve fixed | Keep existing padded-inline edge proof green | same edge-hit-testing family; already fixed by inline boundary proof | existing inlines Playwright row plus no regression | existing fixed claim unchanged | no new PR line |
| `#4789`, `#4984` | Preserve fixed | Keep existing DOM-point crash floors green | root interaction changes must not reopen outside-selection or nested-editor DOM bridge failures | existing guardrails plus focused package/browser proof | existing fixed claims unchanged | no new PR line |
| `#5826`, `#5538`, `#5088`, `#5473` | Preserve/related | Do not broaden focus/scroll claims | no-jump and no-scroll proof must stay green, but this plan is not scrollSelectionIntoView or refocus closure | existing + future rows | existing related/fixed statuses unchanged | related matrix only |
| `#1769`, `#3893` | Related, not claimed | Focus/external-control rows stay related only | root chrome behavior touches focus ownership, but no exact non-editable block or HTML button focus closure | none beyond no-regression | existing related statuses unchanged | related matrix only |

Issue-ledger sync status:
- ClawSweeper related-issue pass: applied, cache/ledger first. Used existing
  generated/manual ledgers, `gitcrawl status --json`, `gitcrawl doctor --json`,
  bounded gitcrawl archive searches for wrapped-line/caret/margin wording, and
  exact thread hydration for `#5944`, `#5924`, `#5524`, `#3789`, `#5291`,
  `#1498`, and `#3429`.
- generated live gitcrawl rows read: `#5944`, `#5924`, `#5826`, `#5711`,
  `#5538`, `#5473`, `#5088`, `#4984`, `#4789`, `#3893`, `#2793`, `#1769`,
  `#1498`; plus exact hydrated rows listed above.
- manual v2 sync ledger update: unchanged by decision. Current rows already
  classify the touched issues as related, not-claimed, fixed-preserve, or
  issue-reviewed, and this plan has no proof-backed fixed/improved claim yet.
  Do not append another no-claim sync row during pass 3. The later issue-sync
  accounting pass should re-evaluate after execution proof exists.
- fork issue dossier update: unchanged by decision. Existing dossier sections
  already cover `#5524`, `#5924`, `#3429`, `#1498`, and pagination `#5944`
  related rows.
- issue coverage matrix update: unchanged; no new fixed/improved claim.
- PR description sync: unchanged so far; no exact issue claim, public API shape,
  or execution proof status changed in planning passes 2-11.

Issue sync accounting pass:
- result: closed for planning. No external ledger, dossier, coverage matrix, or
  PR-reference mutation is required before closure.
- reason: the plan produces no new fixed or improved issue claim, adds no public
  API, and has no execution proof yet. Existing rows already record the same
  classifications this plan needs.
- generated live rows re-read:
  `docs/slate-issues/gitcrawl-live-open-ledger.md:37` for `#5944`, `:41` for
  `#5924`, `:55`, `:110`, `:114`, `:131`, `:166`, `:206`, `:239`, `:273`,
  `:466`, `:497`, `:569`, `:640`, and `:643` for adjacent focus, scroll,
  vertical-navigation, DOM-point, inline-boundary, external-focus, double-click,
  non-editable, and RTL rows.
- manual sync ledger checked:
  - `docs/slate-issues/gitcrawl-v2-sync-ledger.md:123` keeps `#5944`
    issue-reviewed until page-boundary flicker, caret mapping, and stable edit
    proof exist.
  - `:131`, `:588`, `:614`, and `:717` keep structural-DOM / missing-DOM rows,
    including `#5924`, not claimed.
  - `:587` and `:612` keep pagination `#5944` related/issue-reviewed.
  - `:710-712` preserve `#5826` as fixed and focus/scroll/native-movement rows,
    including `#5524`, as unchanged proof pressure.
  - `:447-459` keep nested/focus fixed floors and related rows unchanged.
- issue coverage matrix checked:
  `docs/slate-v2/ledgers/issue-coverage-matrix.md:56-61` preserve fixed floors
  for `#3429`, `#4789`, `#5826`, and `#4984`; `:588-589` keep `#5524`
  related and `#5924` not claimed; `:630` keeps `#1769` related; `:675` keeps
  `#1498` related.
- fork dossier checked:
  `docs/slate-v2/ledgers/fork-issue-dossier.md:1727-1782` already records
  `#5524` as related/core-navigation and `#5924` as not claimed; `:7811-7819`
  and `:7847-7857` already record pagination/page-virtualization planning as
  no fixed/improved claim for `#5944` and `#5924`.
- PR reference checked:
  `docs/slate-v2/references/pr-description.md:151-181` fixed list remains
  unchanged, and `:295-315` keeps pagination/layout as a no fixed/improved claim
  target.
- cluster and requirements files checked:
  `docs/slate-issues/gitcrawl-clusters.md`, `docs/slate-issues/issue-clusters.md`,
  `docs/slate-issues/requirements-from-issues.md`, and
  `docs/slate-issues/package-impact-matrix.md` already route the touched surface
  through selection/focus/DOM bridge, layout, and scroll/focus pressure. No
  cluster-row mutation is needed for this planning-only page-margin click plan.

Issue-ledger pass evidence:
- `docs/slate-issues/gitcrawl-live-open-ledger.md:37` lists `#5944` as the
  stable per-line pagination issue and `:41` lists `#5924` as structural DOM
  exclusion. Rows `:55`, `:110`, `:114`, `:131`, `:206`, `:239`, `:273`,
  `:466`, `:497`, `:640`, and `:643` cover adjacent focus, scroll,
  navigation, DOM bridge, double-click, non-editable focus, and RTL issues.
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md:123-131` and `:587-589`
  already keep `#5944` issue-reviewed and `#5924` not claimed. Rows
  `:331-335` and `:360-364` keep `#5524` related and no-claim. Rows
  `:710-717` keep focus/scroll/gesture rows unchanged and explicitly avoid a
  public ignore-cursor claim.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md:56-61` preserve existing
  fixed floors for `#3429`, `#4789`, `#5826`, and `#4984`. Rows `:325-330`
  keep root-interaction work related/no-claim for DOM/focus/scroll neighbors.
  Rows `:402-403`, `:440-442`, and `:466-468` keep pagination `#5944`
  related and `#5924` not claimed until browser proof exists. Rows `:588-589`
  keep `#5524` related and `#5924` not claimed. Row `:675` keeps `#1498`
  related only.
- `docs/slate-v2/ledgers/fork-issue-dossier.md:1727-1782` records `#5524`
  and `#5924` as soft-break navigation pressure and structural-DOM no-claim.
  Rows `:3167-3198` preserve the existing padded-inline `#3429` fixed floor.
  Rows `:7361-7368` keep `#1498` related only. Rows `:7811-7819` and
  `:7847-7854` already record pagination/layout plans as no new claim.
- `docs/slate-v2/references/pr-description.md:151-180` contains the fixed
  issue list that must not be changed by this planning pass, and `:295-315`
  already describes pagination/page layout as a no fixed/improved claim target.
- Test-candidate maps confirm the claim boundary: `#5944` and `#5924` are
  `not-a-test-candidate` or advanced-layout notes, `#5524`, `#5291`, `#1498`,
  and `#3429` have distinct repro shapes, and `#3789` is browser-owned
  double-click behavior, not this single-click page-margin bug.

Ecosystem strategy synthesis:
| System | Source | Mechanism | Avoids | Steal | Reject | Slate target | Verdict |
|--------|--------|-----------|--------|-------|--------|--------------|---------|
| ProseMirror | `../prosemirror/view/src/index.ts:366-385`, `../prosemirror/view/src/domcoords.ts:142-410`, `../prosemirror/view/src/input.ts:278-301` | `posAtCoords`/`coordsAtPos` centralize coordinate mapping in the view layer; mousedown/drop use that bridge | app/product handlers guessing visual lines | one DOM bridge owner, row-aware rect scan, browser-caret distrust, position/coordinate roundtrip discipline | integer document positions, PM schema/runtime coupling, plugin-heavy public API | Slate internal visual-line edge browser proof | accepted |
| React ProseMirror | `../react-prosemirror/src/components/__tests__/ProseMirror.selection.test.tsx:240-344` | tests line-break monotonicity, RTL coordinate ordering, coordinate roundtrips, and wrapped-line hit targets | false green from only one edge or one line | portable wrapped-line/RTL/roundtrip test shapes | wrapper public API as Slate model | exact Slate wrapped-line start/end rows | accepted for tests |
| Lexical | `docs/research/sources/editor-architecture/scroll-selection-visibility-runtime.md:83-108`, `../lexical/packages/lexical/src/LexicalEvents.ts:654-805`, `../lexical/packages/lexical/src/LexicalSelection.ts:2628-2648`, `:3100-3177` | root/document events flow through one runtime; `beforeinput` can apply native target range; reconciliation may import DOM selection for native-origin events; focus uses `preventScroll` before measured caret scroll | stale model selection beating native event intent | native-event ordering, selection reconciliation boundaries, focus/scroll order | class node model, `$` API, custom reconciler, Lexical as line-geometry proof | click intent must beat restore fallback without importing Lexical architecture | accepted boundary |
| Tiptap Pages | `../tiptap-docs/src/content/pages/core-concepts/limitations.mdx:11-20`, `../tiptap-docs/src/content/pages/guides/table-with-pages.mdx:16-66` | CSS-float/page-gap pagination plus specialized table package | pretending CSS pagination can own semantic split/layout policy | failure taxonomy for BFC blocks, tables, media, and semantic split risks | CSS-float pagination and product TableKit as raw Slate design | keep page/table layout policy separate from click hit testing | negative evidence |
| Pretext | `docs/research/sources/editor-architecture/pretext-pagination-page-virtualization.md:30-80` | prepare-time text measurement and arithmetic layout; profile-sensitive canvas metrics | DOM reflow in layout hot path | layout engine and measurement-profile contract | treating Pretext as hit-testing owner or cross-client-stable by default | layout only; click geometry remains slate-react/root view behavior | accepted boundary |
| TanStack Virtual | `docs/research/sources/editor-architecture/tanstack-virtual-and-github-large-surface-virtualization.md:24-77`, `:96-120` | headless viewport range engine with stable keys, overscan, measurement, and range extraction | treating every huge document as fully mounted | internal range/mount discipline, not editor semantics | exposing virtualizer options as Slate API or using virtualization as selection/IME proof | paged mode owns mount plan; slate-react owns hit testing | accepted internal |
| Slate v2 current source | live source rows above | root interaction + string coordinate placement | restore fallback and browser fallback | shared runtime owner | pagination-only handler | deterministic line-edge range | accepted owner, execution proof queued |

Research / ecosystem refresh evidence:
- ProseMirror exposes `EditorView.posAtCoords` and `coordsAtPos` as view-owned
  coordinate bridge methods; `coordsAtPos` returns a flat cursor-like rectangle
  and `side` chooses nearby content when positions are not adjacent.
- ProseMirror's `findOffsetInNode` tracks a visual row with `rowTop`/`rowBot`,
  scans child rects, recurses into text nodes, and chooses closest horizontal
  distance on that row. Its `posFromCaret` explicitly distrusts browser caret
  normalization near block boundaries before falling back to DOM positions.
- ProseMirror mousedown and drop routes both enter through `view.posAtCoords`,
  so the lesson is a single coordinate owner for pointer-origin selection and
  drag/drop, not one-off page-margin handlers.
- React ProseMirror's selection tests add the useful proof shape: line-break
  monotonicity, RTL coordinate ordering, coordinate-to-position roundtrips, and
  a wrapped-line target where a click beyond the line end maps to the expected
  wrapped-line position.
- The compiled scroll/selection research reinforces the lifecycle: decide
  selection truth, apply the update, compute geometry from the effective
  caret/range, then scroll. That supports click intent beating stale focus or
  restore fallback.
- Tiptap Pages validates what not to do: CSS-float pagination has BFC/table/media
  limitations, and table pagination requires heavily modified product table
  behavior. Use this as failure taxonomy only.
- Pretext remains layout evidence, not hit-testing evidence. It improves layout
  architecture but `canvas.measureText()` and browser profile drift mean it
  cannot be the authority for exact caret coordinates in this bug.
- Lexical validates event ordering, not line-edge geometry. Its strongest lesson
  for this bug is that native-origin events get a clear import/reconciliation
  path before model-owned fallback or scroll repair can use stale selection.
- TanStack Virtual validates the mount/range owner only. It does not prove editor
  selection, IME, copy/paste, drag, or browser hit-testing behavior.

Ecosystem maintainer pass:
| System | Maintainer-grade take | What to steal | What to reject | Plan consequence |
|--------|-----------------------|---------------|----------------|------------------|
| ProseMirror | The view owns coordinate mapping because hit testing is view/runtime behavior. | central `posAtCoords`/`coordsAtPos` owner, row-aware rect scan, browser-caret distrust, roundtrip tests | integer positions, schema coupling, plugin model, DOM view clone | Keep the fix in internal Slate React root/string coordinate placement. |
| React ProseMirror | The useful artifact is the test shape, not the wrapper architecture. | wrapped-line, RTL, monotonic line break, and coordinate roundtrip tests | React wrapper API as Slate DX | Add same-fragment left/right browser proof and package unit rows. |
| Lexical | Native event lifecycle discipline is relevant; Lexical's reconciler is not. | import native target/DOM selection when the event owns truth, then focus/scroll from the effective selection | class node model, `$` helpers, custom DOM reconciler, Lexical as geometry authority | Root chrome coordinate placement must run before restore/browser fallback can win. |
| Tiptap Pages | It is a warning label for CSS pagination, not a design to copy. | table/media/BFC failure taxonomy and semantic split caveats | CSS floats, manual AST splitting as default, product TableKit in raw Slate | Keep pagination/page layout policy separate from page-margin click hit testing. |
| Pretext | It is the layout engine candidate, not the click-selection engine. | profile-aware measurement and derived page fragments | cross-client stable page breaks by default, hit-testing ownership | Do not route this bug through layout snapshots or page-break data. |
| TanStack Virtual | It is the internal range engine, not the editor contract. | stable keys, overscan/mount corridor, measured item discipline | public virtualizer options, hidden-DOM assumptions as native-behavior proof | Browser rows must assert bounded mounted pages before clicking. |
| Plate / slate-yjs | They are downstream pressure, not extra policy owners. | shared substrate behavior and normal model selection updates | Plate page handlers, layout coordinates in collaboration ops | No public API and no Yjs/layout protocol change for this fix. |

Revision pass:
- accepted owner: internal `slate-react` root interaction plus string coordinate
  placement. The pagination example is a browser stress fixture only.
- accepted public API: unchanged. `useSlateRootChrome` keeps `disabled` and
  `selection`; no `onPageMarginClick`, `pageHitTesting`, structural-DOM
  predicate, or pagination policy hook.
- accepted algorithm shape: root chrome/native-editable pointer handling asks
  the active editable root for a coordinate placement before focus restoration
  or browser fallback. String placement chooses the nearest visual line rect
  with a single-pass candidate scan, then resolves the logical line edge in the
  chosen string only.
- accepted test shape: red browser proof first, then package/unit geometry, then
  virtualized proof, then guardrails. Tests must target the same wrapped
  continuation fragment for left and right margins.
- accepted migration shape: Plate inherits the shared substrate; slate-yjs sees
  normal selection state; no layout measurements or page-break snapshots enter
  collaboration ops.
- accepted issue posture: no `Fixes` claim for `#5944`, `#5924`, `#5524`,
  `#1498`, `#5291`, `#3789`, or adjacent issues from planning alone. Existing
  fixed floors (`#3429`, `#4789`, `#4984`, `#5826` family) are preserve-only
  guardrails unless execution proof expands the claim.
- remaining plan work: issue-sync accounting pass, then closure score/final
  gates pass. No `Plate repo root` implementation under this planning goal.

Pressure pass findings:
- performance: `packages/slate-react/src/editable/slate-string-coordinate-placement.ts:47-67`
  currently scopes candidate strings to the active editable root and excludes
  nested editors. Keep that boundary. Do not widen to document-level or app-level
  scans.
- performance: `packages/slate-react/src/editable/slate-string-coordinate-placement.ts:76-97`
  builds all candidate string rects and sorts them just to select the nearest
  candidate. Execution should replace that with a single-pass best-candidate
  loop over mounted strings/rects. This is a real pressure finding: sorting is
  wasted work on every page-margin click.
- performance: `packages/slate-react/src/editable/slate-string-coordinate-placement.ts:165-233`
  does grapheme and `Range.getClientRects()` work only for the selected string.
  Keep it that way; do not inspect character rects for every mounted string.
- React/runtime: `packages/slate-react/src/editable/root-interaction-controller.ts:874-953`
  keeps the mousedown path in event callbacks and refs, not React state. Execution
  must preserve that shape: no component state, no effects, no subscriptions, no
  rerender-driven pointer state.
- drag/regression: `packages/slate-react/src/editable/root-interaction-controller.ts:929-943`
  seeds `pendingProjectedDrag` from the resolved coordinate range, and
  `:1000-1067` later applies projected drag. If execution changes this path, add
  a margin-drag guardrail; otherwise the click fix can still leave drag anchored
  to the raw browser point.
- browser proof: `apps/www/tests/slate-browser/donor/examples/pagination.test.ts:1543-1581`
  currently proves right-margin placement, but the helper can select the first
  visible rect rather than the same wrapped continuation fragment. Execution
  should target the same visual fragment on both left and right.
- browser proof: `apps/www/tests/slate-browser/donor/examples/pagination.test.ts:1962-2028`
  already proves virtualized bounded DOM with `< 1400` elements and `<= 8` page
  surfaces before a first-line margin click. The new wrapped-line virtualized row
  should keep the same bounded-DOM precondition.
- memory/review lesson: prior Slate v2 fix loops showed one-edge margin proof is
  false comfort. Tests must cover both margins and wrapped fragments, and any
  projected drag touch needs drag coverage.

Performance:
- applicability: applied.
- Vercel rules used: `js-min-max-loop` for nearest-candidate selection,
  `js-early-exit` for no candidate / too-far vertical threshold, and
  `rerender-move-effect-to-event` as a no-new-effect guard.
- extra rules used: `repeated-unit-budget`, `css-layout-hotpath`,
  `interaction-inp-matrix`, and `editor-native-behavior-proof`.
- repeated unit: mounted Slate strings/leaves in the active editable root.
- target complexity: O(mounted string rects + chosen string graphemes) per
  margin click; no O(candidate log candidate) sort; no character rect loop over
  all candidates; no typing-path work.
- cohorts:
  - normal: small paginated document, non-virtualized.
  - large: 5k block document / rich markdown fixture.
  - stress: virtualized pagination with bounded mounted pages and long table.
  - pathological: non-virtualized huge document; acceptable only as an explicit
    slower mode, not as the default virtualized target.
- budgets:
  - event handlers/effects/subscriptions: unchanged.
  - DOM scan: active editable root only; virtualized mode remains bounded by
    mounted pages.
  - layout reads: string rect reads during mousedown only; chosen-string
    character rect reads only after candidate selection.
  - React runtime: no state/effect/scheduler dependency added.
- React/runtime primitives: none. React 19.2 features do not solve DOM coordinate
  hit testing here.
- interaction metrics: local browser proof should cover line-margin click,
  margin drag when touched, click then type, and no-jump corner clicks. INP/RUM is
  not required for this tiny internal fix unless execution expands the scan.
- trace/CWV proof: page-load/Core Web Vitals are out of scope. If execution adds
  broad DOM scans, run the registered huge-document browser trace before closure.
- memory tags: preserve virtualized row's bounded page-surface and total-element
  assertions; do not add mounted UI, hidden boundaries, or caches.
- degradation contract: none. The fix should preserve native click/select/copy
  behavior and improve model selection; no opt-in degraded mode.
- dashboard/RUM gap: no production dashboard required for the fix. Useful future
  tags would be `interaction=line-margin-click`, `strategy`, `page_layout`,
  mounted page count, and total DOM element count.

DX / migration / simplicity pressure:
- DX: keep `useSlateRootChrome` unchanged. Adding `onPageMarginClick`,
  `pageHitTesting`, or structural-DOM predicates would leak product layout into
  raw Slate and make Plate/Yjs migration worse.
- DX: pagination remains a proof fixture. Do not add example-only handlers or
  fake content generators to make tests pass.
- migration: Plate should inherit the substrate fix with no adapter. slate-yjs
  should receive only normal model selection updates; layout coordinates and
  page-break snapshots stay out of collaboration ops.
- simplicity: no ProseMirror port, no new package, no public API, no root chrome
  option. The only justified abstraction is an internal helper if it removes real
  duplication between click and drag coordinate placement.
- regression: execution must start with one failing browser row, then fix the
  package owner, then add the next row. Do not bulk-write a horizontal test suite
  that only verifies the imagined implementation.

Legacy regression proof matrix:
| Regression class | Legacy behavior | Slate v2 target | Proof route | Owner | Status |
|------------------|-----------------|-----------------|-------------|-------|--------|
| Left margin beside wrapped continuation line | should place caret at clicked visual line start | exact wrapped-line start offset | new Chromium pagination row + unit geometry test | slate-react | queued for accepted execution |
| Right margin beside wrapped line | should place at clicked visual line end | preserve existing right-edge proof | existing + expanded row | slate-react | preserve and expand in accepted execution |
| Page chrome/corner | should not jump to unrelated table/tail | no selection drift or scroll jump | existing no-jump rows | slate-react | preserve and expand in accepted execution |

Browser stress / parity strategy:
| Surface | Scenario | Browser/device | Command or proof route | Expected signal | Status |
|---------|----------|----------------|------------------------|-----------------|--------|
| `/examples/pagination` staged | click left margin beside second visual line of wrapped paragraph | Chromium | focused Playwright row | selection path same block, offset equals visual line start | queued for accepted execution |
| `/examples/pagination` staged | click right margin beside the same wrapped fragment as the left-margin row | Chromium | focused Playwright row | selection path same block, offset equals visual line end | queued for accepted execution |
| `/examples/pagination?strategy=virtualized` | same wrapped-line left edge after prior selection elsewhere, with bounded mounted pages asserted before click | Chromium | focused Playwright row | active editor true, no scroll jump, exact offset, bounded DOM/page surfaces | queued for accepted execution |
| `/examples/pagination?page_layout=single` | first-page margins/corners remain no-op/no-jump when no line hit | Chromium | existing + focused row | preserve and expand in accepted execution |
| `/examples/pagination` staged and virtualized | drag seed from page margin near wrapped text | Chromium | required if execution changes projected drag seeding; otherwise source-review guardrail | projected drag anchor uses corrected range, not raw browser fallback | conditional accepted-execution guard |

Verification workspace gate:
| Claim | Workspace | Command | Result | Owner |
|-------|-----------|---------|--------|-------|
| current root interaction owner inspected | `Plate repo root` | `nl -ba packages/slate-react/src/editable/root-interaction-controller.ts` | read | pass 1 |
| current string coordinate owner inspected | `Plate repo root` | `nl -ba packages/slate-react/src/editable/slate-string-coordinate-placement.ts` | read | pass 1 |
| current pagination proof gap inspected | `Plate repo root` | `nl -ba playwright/integration/examples/pagination.test.ts` | read | pass 1 |
| ProseMirror coordinate owner refreshed | sibling `../prosemirror` | `nl -ba ../prosemirror/view/src/domcoords.ts`, `index.ts`, `input.ts` | read | pass 5 |
| React ProseMirror proof shape refreshed | sibling `../react-prosemirror` | `nl -ba ../react-prosemirror/src/components/__tests__/ProseMirror.selection.test.tsx` | read | pass 5 |
| Tiptap/Pretext pagination boundary refreshed | sibling/docs research | `nl -ba ../tiptap-docs/...`, `nl -ba docs/research/sources/editor-architecture/pretext-pagination-page-virtualization.md` | read | pass 5 |
| Evidence Kit control-plane refreshed | `plate-2` | `jq`/`rg` over benchmark registry and health latest | read | pass 5 |
| Pressure pass live source inspected | `Plate repo root` | `nl -ba packages/slate-react/src/editable/slate-string-coordinate-placement.ts`, `root-interaction-controller.ts`, and pagination Playwright rows | read | pass 6 |
| Performance/TDD skill lenses applied | `plate-2` | `sed -n` over `performance`, `performance-oracle`, `vercel-react-best-practices`, and `tdd` skills plus selected perf rules | read | pass 6 |
| Maintainer objection pass evidence refreshed | `Plate repo root`, siblings | Re-read `use-slate-root-chrome.ts`, `slate-string-coordinate-placement.ts`, `root-interaction-controller.ts`, current package/browser tests, and ProseMirror `posAtCoords` source | read | pass 7 |
| High-risk deliberate evidence refreshed | `Plate repo root`, `plate-2` | Re-read page mount plan, paged layout React filtering, pagination target helpers, virtualized browser rows, PR issue claim rules, and prior fix-loop memory | read | pass 8 |
| Ecosystem maintainer evidence refreshed | `plate-2`, `Plate repo root`, siblings | Re-read compiled research plus local ProseMirror, Lexical, Tiptap Pages, Pretext, TanStack, and current Slate v2 source rows | read | pass 9 |
| Revision pass evidence consolidated | `plate-2` | Re-read active plan against Slate Plan template and pass ledger; consolidated accepted execution queue, scorecard, and final handoff outline | read | pass 10 |
| Issue sync accounting closed | `plate-2` | Re-read generated live ledger, manual sync ledger, coverage matrix, fork dossier, cluster/requirements files, and PR reference; decided no external mutation required | read | pass 11 |
| execution behavior proof | `Plate repo root` | focused unit/browser/type/lint/build gates | queued for accepted execution | execution |

Evidence Kit / benchmark control-plane:
| Surface | Artifact / command | Finding | Plan decision |
|---------|--------------------|---------|---------------|
| health latest | `benchmarks/editor/benchmarks/results/benchmark-health-latest.json:2`, `:74-76` | Generated `2026-05-29T10:53:36.050Z`, 801 rows, 663 ok, 130 coverage gaps, 2 optional missing artifacts, 6 unsupported. | Control plane is current enough for planning; not Slate behavior proof. |
| next actions | `benchmark-health-latest.json:6-18` | Missing optional core transaction/history artifacts plus unregistered historical artifacts. | Unrelated to this page-margin click plan. Do not block on them. |
| React huge docs | `benchmark-registry.json:20-78`, `:320-345` | Registered huge-document compare, rerender breadth, active typing, and browser trace artifacts. | Use only if pressure pass finds broad DOM scans or render churn risk. |
| browser/editor coverage | `benchmark-registry.json:103-110`, `:351-354` | Browser rich-text replay coverage exists, but not exact line-edge margin click proof. | Execution proof must be focused Playwright/unit rows. |
| core selection/ops | `benchmark-registry.json:154-269`, `:365-386` | Core selection and huge/rich-text operation benchmarks exist. | Not the owner for DOM coordinate hit testing. |

Autoreview workspace gate:
| Reviewed patch owner | Cwd | Command | Result | Notes |
|----------------------|-----|---------|--------|-------|
| N/A for planning passes 1-10 | N/A | N/A | N/A | no implementation patch in this activation |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| vercel-react-best-practices | yes | applied | `js-min-max-loop` catches current sort-for-nearest shape; no React state/effect should be added. | require single-pass nearest rect selection and event-only runtime path |
| performance-oracle | yes | applied | Final shape should be O(mounted string rects + chosen string graphemes), not O(candidates log candidates), and must not allocate a full sorted candidate list. | update performance target and execution guard |
| performance | yes | applied | Repeated unit is mounted Slate strings/leaves; cohorts and interaction/native-behavior rows recorded. INP/RUM not required unless execution broadens scan. | add performance section and drag/click interaction proof rows |
| tdd | yes | applied | Execution should use vertical red-green rows: staged wrapped-left first, package unit/logic, virtualized row, then drag guard if touched. | update implementation phases and proof matrix |
| shadcn | no | skipped | no UI/component API change | no delta |
| react-useeffect | no | skipped | no effect/subscription change planned | no delta |

High-risk deliberate-mode pre-mortem:
| Risk | Trigger | Failure mode | Mitigation | Proof | Status |
|------|---------|--------------|------------|-------|--------|
| Wrong line chosen near line gap | browser behavior | click in margin between line rects selects adjacent line or previous visual line end | same-fragment helper must choose a wrapped continuation rect, compute expected start/end from that rect, and assert both left and right margins | browser + unit | plan mitigation recorded |
| Test hits first visible fragment only | browser helper | proof passes on the first rect while the user bug lives on a later wrapped fragment | left/right helpers must target the same chosen continuation fragment, not independent first-visible candidates | focused Chromium | plan mitigation recorded |
| Virtualized remount around click | page-level virtualization | target disappears or a stale page remains mounted, causing selection to restore or jump | virtualized row must first assert bounded DOM/page surfaces and then click a mounted continuation fragment with active editor/no-scroll-jump assertion | focused Chromium | plan mitigation recorded |
| RTL/bidi regression | line-edge logic | left physical edge maps wrong logical edge | preserve direction mapping tests; add wrapped-line RTL unit only if execution changes physical/logical edge mapping | unit | conditional |
| Hot path layout cost | pointer path | broad DOM scan or candidate sort on every click/drag over huge doc | mounted root strings only, single-pass nearest candidate, chosen-string character rects only | perf pressure + focused source review | plan mitigation recorded |
| Drag anchoring drift | projected drag | click selection fixed, but drag start still uses raw browser point | carry corrected range into projected drag seed and test if touched | browser drag guardrail | conditional |
| Nested root / wrong root | multi-root or editable voids | coordinate scan chooses a string from nested editor or another root | preserve closest editor filter and nested-root package test | package unit | plan mitigation recorded |
| Issue claim inflation | PR/reference sync | plan accidentally claims `#5944`/`#5924` fixed from related evidence | issue sync pass must keep no-claim unless execution proof exactly changes issue coverage; PR rules forbid related-sounding issue numbers | issue sync pass | plan mitigation recorded |

High-risk deliberate findings:
- geometry false positive: current right-margin helper at
  `apps/www/tests/slate-browser/donor/examples/pagination.test.ts:462-570`
  walks visible blocks and uses the first string rect. That is not strong enough
  for the reported bug. Execution must target a wrapped continuation rect and
  reuse that same fragment for left/right expected offsets.
- virtualization false positive: current virtualized row at
  `apps/www/tests/slate-browser/donor/examples/pagination.test.ts:1962-2028`
  proves bounded DOM and first-line margin start, not wrapped continuation
  placement. The new row must keep `boundedDOM`/`boundedPages` preconditions and
  assert exact offset after the click.
- remount risk: `packages/slate-layout/src/page-mount-plan.ts:193-205`
  disables filtering when `viewport` is null and otherwise filters by visible
  page ranges. This is the right fallback, but the browser proof must not assume
  a page is mounted without first checking the target exists and virtualized DOM
  is bounded.
- selected/promoted page retention risk:
  `packages/slate-layout/src/page-mount-plan.ts:128-175` keeps
  selected/promoted/composing top-level indexes mounted. Browser proof should
  click from a prior selection elsewhere to ensure selection restoration does not
  steal the target.
- source complexity risk: the target implementation cannot retain a candidate
  array plus sort just because the test is small. Source closeout must inspect
  the final helper for single-pass nearest candidate selection.
- projected drag risk: prior fix-loop memory and current
  `root-interaction-controller.ts` flow make drag anchoring a conditional
  release blocker if execution changes coordinate range seeding. A green click
  row alone is not enough if shared range flow changes.
- issue-claim risk: `docs/slate-v2/references/pr-description.md:217-225`
  explicitly forbids related-sounding issue numbers in the fixed list. The plan
  must not add `Fixes #5944`, `#5924`, or adjacent issues until execution proof
  and issue sync justify an exact claim.

Slate maintainer objection ledger:
| Change | Objection | Tradeoff | Evidence | Migration/docs/proof answer | Verdict |
|--------|-----------|----------|----------|-----------------------------|---------|
| Internal visual-line edge hit testing | "This is browser layout code inside slate-react." | More DOM geometry code to maintain | `Plate repo root/.../root-interaction-controller.ts:874-953` already owns root chrome pointer intent; ProseMirror keeps `posAtCoords`/`coordsAtPos` in the view layer. | Keep it internal, package-tested, and bounded. The alternative is app-level glue in every page/layout shell. | accepted |
| Deterministic coordinate placement before browser fallback | "Why not trust `resolveEventRange` / native caret APIs?" | More custom fallback logic | The user video and current bug prove browser fallback can choose the previous line end. ProseMirror `domcoords.ts:223-329` also distrusts native caret normalization around block/inline boundaries before falling back. | Use deterministic line-edge placement only when clicking outside/near a Slate string; keep browser fallback when deterministic placement returns null. | accepted |
| No public `useSlateRootChrome` expansion | "Apps may need policy hooks like `onPageMarginClick`." | Less app-level customization | `Plate repo root/.../use-slate-root-chrome.ts:12-30` exposes only `disabled` and `selection`; current bug is generic line-edge hit testing, not product page policy. | Preserve raw Slate DX. Plate can build product page policy on top after the substrate is correct. | accepted |
| Root-scoped candidate scan | "A coordinate scan over strings could be slow on huge docs." | Still requires DOM rect reads on click | `Plate repo root/.../slate-string-coordinate-placement.ts:47-67` already scopes to the active editable root and excludes nested editors; pressure pass rejects the current `flatMap().sort()[0]` as final shape. | Execution must use a single-pass nearest candidate loop and read character rects only for the chosen string. No typing-path work, no new React state/effects. | accepted with implementation guard |
| Pagination remains proof fixture | "This sounds like a pagination-specific workaround." | Browser proof lives in pagination example | Existing rows at `apps/www/tests/slate-browser/donor/examples/pagination.test.ts:1345-1581` already use pagination as stress proof for no-jump/right-edge behavior. The package owner is `slate-react`, not the example. | Add tests in pagination because the bug manifests there, but patch shared root/string coordinate placement only. | accepted |
| RTL, bidi, and grapheme boundaries | "Line-edge math is easy to get wrong across scripts." | More unit proof required | `packages/slate-react/test/slate-string-coordinate-placement.test.ts:107-184` already covers RTL physical/logical edges and grapheme boundaries. | Preserve current RTL/grapheme rows; add wrapped-line RTL unit only if execution changes physical/logical edge mapping. | accepted |
| Projected drag anchoring | "Click fix might leave drag selection anchored to the raw browser point." | Conditional extra browser row | `Plate repo root/.../root-interaction-controller.ts:382-430` resolves projected endpoints from the provided range, and `:929-943` seeds pending drag from coordinate placement when present. Prior fix-loop memory says this path regresses easily. | If execution changes projected drag seeding or shared range flow, add margin-drag proof. Otherwise keep a source-review guardrail. | accepted conditional |
| Nested/multiple editable roots | "Coordinate scans might cross into nested editors or wrong roots." | Requires careful root filtering | `Plate repo root/.../slate-string-coordinate-placement.ts:47-55` filters strings whose closest Slate editor is the active editable root, and package test rows `:76-105` prove nested roots are ignored. | Preserve root filtering; no document-global query and no cross-root selection inference. | accepted |
| Collaboration / slate-yjs | "Layout coordinates are local and non-deterministic; don't put them in ops." | Selection is local UI-derived before becoming model state | The controller turns placement into normal point/range selection; no page coordinates or measurements enter operations. | Remote peers see normal selection state only. Strict page-break snapshots remain a separate pagination/export concern, not this bug. | accepted |
| Browser proof brittleness | "Playwright geometry tests can be flaky." | Exact browser rows are still required | Current browser rows already assert no-jump/corner/right-edge behavior; the missing row is exact same-fragment left/right wrapped-line placement. | Use unit tests for helper math and Chromium rows for real geometry. Do not claim issue closure until focused browser proof is green. | accepted |
| Issue claim expansion | "Does this close `#5944` or structural DOM requests?" | Conservative issue accounting may undersell the fix | Existing issue pass found no exact upstream issue to close; `#5944` is pagination pressure, `#5924` is broader structural DOM policy. | Keep related/no-claim until execution proof exists and issue sync pass reruns. No `Fixes` line from this plan alone. | accepted |
| Simplicity | "This risks becoming a ProseMirror port." | A little internal geometry remains | ProseMirror evidence is used for ownership/test discipline only; pressure pass explicitly rejects PM positions/schema/plugin model. | Implement the smallest internal helper change that fixes line-edge selection. No new package, no public API, no page-specific handler. | accepted |

Hard cuts and rejected alternatives:
| Option / API | Keep / cut / reject | Why | Migration cost | Evidence | Follow-up |
|--------------|---------------------|-----|----------------|----------|-----------|
| pagination-only gutter handler | reject | wrong owner; hides generic root chrome bug | none | same bug class already hit corners/right margin | no |
| public `onPageMarginClick` API | reject for now | product/layout opinion; not needed | none | internal owner sufficient | revisit only if apps need policy hook |
| browser-only `resolveEventRange` fallback | reject as primary | returns stale/wrong visual line in this class | none | video symptom | keep fallback only when deterministic placement unavailable |
| candidate `flatMap().sort()[0]` | reject as final implementation shape | O(n log n) and allocates all candidates when only nearest is needed | none | current source pressure pass | replace with single-pass best-candidate scan |

Plan deltas from review:
- Created plan from Slate Plan template.
- Recorded video-derived symptom: clicking beside wrapped continuation line
  selects previous visual line end.
- Re-scoped target from "pagination margin bug" to shared visual-line edge
  hit-testing.
- Identified existing test gap: first-line/block-start proof does not cover
  wrapped continuation line start.
- Validated the pass-4 boundary: public root chrome API unchanged, internal
  `slate-react` coordinate placement owner, no pagination-only handler.
- Completed pass-5 research refresh: ProseMirror validates a centralized view
  coordinate bridge and roundtrip test family; React ProseMirror contributes
  portable wrapped-line/RTL proof shapes; Tiptap Pages is negative evidence;
  Pretext stays layout-only; Evidence Kit has no direct microbenchmark for this
  click edge.
- Completed pass-6 pressure review: require bounded single-pass coordinate
  candidate selection, no React state/effects, no public API, no pagination-only
  handler, vertical TDD browser/unit proof, and drag guardrail if projected drag
  seeding changes.
- Completed pass-7 maintainer objection ledger: accepted internal bounded
  line-edge coordinate placement after answering browser fallback, public API,
  performance, pagination-specificity, RTL/grapheme, drag, nested-root,
  collaboration, browser-proof, issue-claim, and simplicity objections.
- Completed pass-8 high-risk deliberate mode: tightened the plan against
  same-fragment proof gaps, virtualization/remount false positives, candidate
  sorting cost, conditional drag regression, nested-root leakage, and issue-claim
  inflation.
- Completed pass-9 ecosystem maintainer pass: added Lexical and TanStack to the
  ecosystem boundary, recorded explicit steal/reject calls for ProseMirror,
  React ProseMirror, Lexical, Tiptap Pages, Pretext, TanStack, Plate, and
  slate-yjs, and kept the accepted owner unchanged.
- Completed pass-10 revision pass: consolidated the accepted owner, public API
  decision, algorithm shape, proof queue, migration posture, issue posture, and
  user-review handoff outline. The plan score now meets the planning threshold;
  issue-sync accounting and closure gates remain.

Open questions and decision-changing evidence:
| Question | Why it matters | Evidence needed | Owner | Status |
|----------|----------------|-----------------|-------|--------|
| Does the bug reproduce in both staged and virtualized strategies? | determines browser test matrix | focused Playwright red rows | execution | queued for accepted execution |
| Does RTL need immediate coverage? | existing direction helpers may regress | preserve current RTL physical/logical unit; add a wrapped-line RTL unit only if execution changes edge mapping | execution | resolved for plan |

Implementation phases with owners:
| Phase | Owner | Scope | Entry criteria | Exit criteria | Verification |
|-------|-------|-------|----------------|---------------|--------------|
| Red browser proof | execution | add staged wrapped-left-margin failing row for a wrapped continuation fragment | accepted plan | test fails before fix for the exact offset | focused Chromium |
| Package geometry fix | execution | shared string coordinate placement / root interaction with single-pass candidate scan | red proof | exact offset green, no candidate sort, no public API | unit + browser |
| Virtualized proof | execution | add virtualized wrapped-left-margin row with bounded mounted DOM precondition | staged proof green | exact offset, active editor, no scroll jump | focused Chromium |
| Guardrail sweep | execution | same-fragment right-edge, no-jump/corner, and drag row if projected drag touched | fix green | no regressions | focused browser grep |
| Review closeout | execution | typecheck/lint/build/autoreview | all proof green | clean autoreview | gates above |

Accepted execution queue:
| Step | Owner | Exact work | Required proof | Do not do |
|------|-------|------------|----------------|-----------|
| 1 | execution | Add the staged red Playwright row for left margin beside a wrapped continuation fragment. | The row fails before the package fix and asserts exact same-block line-start offset. | Do not click the first visible line or assert only "selection changed". |
| 2 | execution | Add or adjust package tests for nearest visual-line rect and chosen-string edge offset. | Unit proof covers wrapped continuation start/end and preserves RTL/grapheme rows. | Do not test dead legacy APIs or invent a public helper. |
| 3 | execution | Replace nearest candidate sorting with bounded single-pass selection if still present. | Source review proves no `flatMap().sort()[0]`, no document-global scan, chosen-string-only character rect work. | Do not add React state/effects or a cache that survives layout changes without invalidation. |
| 4 | execution | Wire corrected placement through root chrome click before restore/browser fallback. | Staged left-margin row passes; same-fragment right-margin row passes. | Do not add a pagination-specific event handler. |
| 5 | execution | Add virtualized wrapped-left proof with mounted-page and total-DOM preconditions. | Row asserts bounded pages/DOM, exact offset, active editor, and no scroll jump. | Do not let virtualization proof depend on hidden full-document DOM. |
| 6 | execution | Preserve no-jump/corner and existing fixed floors. | Focused browser grep covers staged/single layout corners and existing no-jump rows. | Do not claim broader scroll/focus or structural-DOM issues. |
| 7 | execution | If projected drag seeding changed, add margin-drag proof. | Drag anchor uses corrected range, not raw browser fallback. | Do not ship a click-only fix if shared drag range flow changed. |
| 8 | execution | Run closeout gates from `Plate repo root`. | `bun --filter slate-react test -- slate-string-coordinate-placement root-interaction-resolver use-slate-root-chrome`, focused Chromium rows, `bun --filter slate-react typecheck`, `bun lint:fix`, `bun --filter slate-react build`, and dirty-local autoreview if implementation changed. | Do not run Slate v2 proof from `plate-2`. |

Fast driver gates:
| Gate | Cwd | Command / artifact | Proves | Status |
|------|-----|--------------------|--------|--------|
| planning artifact check | plate-2 | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-29-pagination-left-margin-click-architecture.md` | closure integrity | passed |
| Slate v2 behavior check | `Plate repo root` | focused Playwright wrapped-left-margin rows | exact bug proof | queued for accepted execution |
| Slate v2 package check | `Plate repo root` | `bun --filter slate-react test -- slate-string-coordinate-placement root-interaction-resolver use-slate-root-chrome` | shared owner contracts | queued for accepted execution |
| Slate v2 complexity check | `Plate repo root` | source review for no candidate sort/no broad document scan | hot path bounded | queued for accepted execution |

Final user-review handoff outline:
- accepted plan items: shared `slate-react` owner; public API unchanged; bounded
  single-pass visual-line placement; vertical browser/unit proof queue; no
  collaboration/layout protocol change.
- before / after API shape: before and after stay the same at the app boundary;
  internal line-edge hit testing becomes deterministic for wrapped visual lines.
- hard cuts: reject pagination-only handler, public page-margin API, structural
  DOM predicate, ProseMirror/Lexical API import, CSS-float pagination, Pretext
  hit-testing ownership, and public TanStack virtualizer knobs.
- issue claims and non-claims: related/no-claim accounting closed for planning.
  Execution proof may later justify separate ledger updates, but this plan adds
  no fixed/improved claim.
- proof gates: accepted execution queue names the exact `Plate repo root`
  browser/unit/type/lint/build/autoreview gates.
- accepted-plan execution handoff: use a new execution-shaped goal only after
  explicit user acceptance; do not run implementation under this planning goal.

Done Handoff:
- Plan path: `docs/plans/2026-05-29-pagination-left-margin-click-architecture.md`.
- Final decision: fix the bug in shared `slate-react` root interaction and
  string coordinate placement, not in the pagination example.
- Public API: unchanged. Keep `useSlateRootChrome(root, { disabled, selection })`
  and add no page-margin or structural-DOM policy hook.
- Internal target: root/page chrome clicks resolve a deterministic visual-line
  edge range before focus restoration or browser fallback can steal the click.
- Performance target: active editable root only, single-pass nearest visual-line
  candidate scan, character rects for the chosen string only, no React state or
  effects.
- Browser proof target: staged and virtualized pagination must click left margin
  beside a wrapped continuation line and assert exact same-block line-start
  offset; same-fragment right margin, no-jump/corner, and conditional drag rows
  stay required.
- Package proof target: `slate-string-coordinate-placement`,
  `root-interaction-resolver`, and `use-slate-root-chrome` package tests cover
  geometry, root filtering, RTL/grapheme preservation, and public hook stability.
- Issue posture: no new fixed/improved claim. `#5944` stays related/reviewed,
  `#5924` stays not claimed, `#5524`/`#1498`/focus-scroll neighbors stay
  related only, and existing fixed floors remain preserve-only.
- Execution handoff: start a new execution-shaped goal only after explicit user
  acceptance, then run the accepted execution queue from `Plate repo root`.

Final completion gates:
| Gate | Required evidence | Status |
|------|-------------------|--------|
| score >= 0.92 and no dimension below 0.85 | scorecard rows cite evidence; weighted total is 0.923 | complete |
| all pass rows complete or skipped with evidence | phase/pass table has every scheduled row complete, including closure | complete |
| issue/reference sync closed | issue-sync accounting pass found existing ledger/reference rows already current; no external mutation required | complete |
| live source grounding complete | source-backed rows cite current owners and accepted execution proof gates | complete for planning |
| workspace verification recorded | verification workspace gate covers planning/source claims and queues execution proof separately | complete for planning |
| autoreview clean or N/A | N/A for planning pass; required for accepted execution implementation changes | complete |
| final handoff emitted or lane remains pending | Done Handoff recorded in plan and final response must include it | complete |
| `check-complete` passes | command above | complete |

Findings:
- The attached video is a wrapped-line hit-testing bug: left margin beside the
  continuation line places the caret at the previous line end.
- The current shared coordinate helper can place line edges, but the proof does
  not force a wrapped continuation-line left edge.
- Existing no-jump tests are necessary but not sufficient.
- Related issue discovery found no exact upstream issue to close. `#5944` is
  the closest direct pagination issue, but its original request is page-boundary
  pagination stability and flicker, not a single page-margin caret placement
  repro.
- Several search hits are useful guardrails, not claims: `#5524` for visual
  line/model point drift, `#1498` for direction-aware geometry, `#3429` for
  edge-hit-testing preservation, and `#5291` for scroll/selection pressure.

Decisions and tradeoffs:
- Best owner is shared `slate-react` root interaction/string coordinate
  placement, not pagination example glue.
- Public API should remain unchanged unless later passes find a real extension
  boundary.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

External/browser findings:
- Video duration: 7.003333 seconds.
- Extracted frame evidence at `/tmp/slate-left-margin-video/frame-06.png`
  shows the caret after `content` while the click is in the left margin beside
  the following visual line.

Timeline:
- 2026-05-29 Slate Plan goal plan created.
- 2026-05-29 Pass 1 live source read completed.
- 2026-05-29 Pass 2 related issue discovery completed with no new fixed or
  improved issue claim.
- 2026-05-29 Pass 3 issue-ledger pass completed. Shared ledgers and PR
  references stay unchanged until execution proof creates a real claim delta.
- 2026-05-29 Pass 4 intent/boundary and decision brief validation completed.
  Public API stays unchanged; internal line-edge hit testing is the accepted
  target unless later research invalidates it.
- 2026-05-29 Pass 5 research/ecosystem live-source refresh completed.
  ProseMirror/React ProseMirror support central coordinate ownership and
  roundtrip tests; Tiptap Pages and Pretext stay bounded to pagination/layout
  lessons, not click hit testing.
- 2026-05-29 Pass 6 performance/DX/migration/regression/simplicity pressure
  passes completed. Final planned shape stays internal, bounded, test-first, and
  public-API-free.
- 2026-05-29 Pass 7 Slate maintainer objection ledger completed. Objections did
  not change the owner; they tightened proof and implementation constraints.
- 2026-05-29 Pass 8 high-risk deliberate mode completed. Deliberate failure
  analysis strengthened browser proof targets, source complexity guardrails, and
  conservative issue-claim accounting.
- 2026-05-29 Pass 9 ecosystem maintainer pass completed. External systems are
  evidence boundaries only: ProseMirror for view-owned coordinates, React
  ProseMirror for proof shape, Lexical for native-event ordering, Tiptap Pages for
  negative pagination evidence, Pretext for layout only, TanStack for internal
  range/mount discipline, and Plate/slate-yjs for migration pressure.
- 2026-05-29 Pass 10 revision pass completed. The plan now has a concrete
  execution queue, scorecard above threshold, final handoff outline, and explicit
  planning-vs-execution proof boundary.
- 2026-05-29 Pass 11 issue sync accounting completed. Current ledgers and PR
  reference already carry the needed no-claim/fixed-preserve posture; no external
  ledger mutation was made.
- 2026-05-29 Pass 12 closure score and final gates completed. Planning lane is
  ready to close if the mechanical completion check passes.

Verification evidence:
- `ffprobe` on attached video: 7.003333 seconds.
- `ffmpeg` extracted frames to `/tmp/slate-left-margin-video/`.
- `Plate repo root` source/test reads listed in verification gate.
- Research layer entrypoints read: `docs/research/README.md`,
  `docs/research/index.md`, `docs/research/log.md`.
- Issue ledger entrypoints read/searched:
  `docs/slate-issues/gitcrawl-live-open-ledger.md`,
  `docs/slate-issues/gitcrawl-v2-sync-ledger.md`,
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`,
  `docs/slate-v2/references/pr-description.md`,
  `docs/slate-issues/requirements-from-issues.md`,
  `docs/slate-issues/package-impact-matrix.md`,
  `docs/slate-issues/issue-clusters.md`,
  `docs/slate-issues/gitcrawl-clusters.md`,
  `docs/slate-issues/benchmark-candidate-map.md`.
- Evidence Kit entrypoints read:
  `benchmarks/editor/research/benchmark-registry.json`,
  `benchmarks/editor/benchmarks/results/benchmark-health-latest.json`.
- ClawSweeper/gitcrawl pass:
  - `gitcrawl status --json` -> current archive, 664 threads, last sync
    2026-05-23.
  - `gitcrawl doctor --json` -> version 0.4.3, DB health ok, GitHub token
    present.
  - `gitcrawl search ianstormtaylor/slate --query "wrapped line cursor caret margin pagination" --mode hybrid --limit 12 --json`
    -> closest direct hit `#5944`; adjacent hits `#1498`, `#5291`, `#5524`,
    `#3429`.
  - `gitcrawl search ianstormtaylor/slate --query "cursor wrong position line margin click selection" --mode hybrid --limit 12 --json`
    -> adjacent hits `#5524`, `#3789`, `#5291`, `#1498`; no exact margin-click
    pagination issue.
  - `gitcrawl threads ianstormtaylor/slate --numbers 5944,5524,1498,3789,5291,3429,5924 --include-closed --json`
    -> hydrated candidate rows used for no-claim classification.
- Issue-ledger pass:
  - read generated live rows for direct and adjacent issues.
  - read manual v2 sync rows for pagination, page layout, vertical navigation,
    root interaction, focus/scroll, and structural-DOM surfaces.
  - read fork dossier, coverage matrix, PR reference, and test-candidate map
    sections for `#5944`, `#5924`, `#5524`, `#3789`, `#5291`, `#1498`, and
    `#3429`.
  - decision: no shared ledger/reference mutation in pass 3.
- Intent/boundary pass:
  - read `packages/slate-react/src/hooks/use-slate-root-chrome.ts`,
    `packages/slate-react/src/index.ts`,
    `packages/slate-react/src/editable/root-interaction-resolver.ts`,
    `packages/slate-react/src/editable/root-interaction-controller.ts`,
    `packages/slate-react/src/editable/slate-string-coordinate-placement.ts`,
    focused `slate-react` package tests, and pagination Playwright rows.
  - decision: no public API change; execution should add wrapped-line coordinate
    proof and revise internal coordinate placement.
- Research/ecosystem pass:
  - read compiled ProseMirror transaction/view and scroll-selection research,
    plus direct `../prosemirror/view/src/domcoords.ts`, `index.ts`, and
    `input.ts`.
  - read `../react-prosemirror` selection tests for line-break monotonicity,
    RTL ordering, coordinate roundtrip, and wrapped-line coordinate behavior.
  - read Tiptap Pages limitations and Pages TableKit docs from `../tiptap-docs`;
    decision: negative evidence only.
  - read Pretext pagination/page virtualization research; decision: Pretext is
    layout evidence, not hit-testing owner.
  - read Evidence Kit benchmark registry and latest health; decision: focused
    unit/browser proof is the right execution evidence unless pressure pass
    finds render/DOM-scan risk.
- Pressure pass:
  - read performance, performance-oracle, Vercel React, and TDD skill guidance,
    plus `repeated-unit-budget`, `css-layout-hotpath`,
    `interaction-inp-matrix`, `editor-native-behavior-proof`, and
    `js-min-max-loop`.
  - re-read live Slate v2 string coordinate placement, root interaction click
    and projected drag paths, current string-coordinate package tests, and
    pagination Playwright helper/proof rows.
  - decision: final implementation must use bounded single-pass nearest
    candidate selection, keep character rect work to the chosen string, preserve
    event/ref-only runtime state, and prove both margins on the same wrapped
    fragment.
- Objection ledger pass:
  - re-read `useSlateRootChrome`, string coordinate placement, root interaction
    click/drag owner, package coordinate tests, pagination browser tests, and
    ProseMirror coordinate bridge source.
  - decision: objections strengthen but do not replace the selected owner.
    Public API stays unchanged; browser fallback stays fallback; execution must
    prove same-fragment left/right placement and keep the implementation bounded.
- High-risk deliberate pass:
  - re-read page mount plan, paged layout filtering, pagination target helpers,
    virtualized browser rows, PR issue claim rules, and prior fix-loop memory.
  - decision: the plan must defend against false-green geometry tests,
    virtualization remounts, source complexity drift, conditional drag anchoring,
    nested-root leakage, and premature issue claims before closure.
- Ecosystem maintainer pass:
  - re-read compiled ProseMirror, scroll/selection, Pretext pagination, and
    TanStack virtualization research.
  - re-read local ProseMirror coordinate bridge source, Lexical event/selection
    source, Tiptap Pages limitations/TableKit docs, and current Slate v2 public
    root chrome plus root/string coordinate owners.
  - decision: keep the fix in Slate React internals. Steal ownership/test/event
    lifecycle discipline only; reject external public models, product APIs,
    layout snapshots, and virtualizer options as raw Slate APIs.
- Revision pass:
  - re-read the full plan against the Slate Plan template and accumulated pass
    constraints.
  - consolidated the accepted owner, no-public-API decision, single-pass
    placement algorithm target, vertical TDD/browser queue, migration stance,
    issue non-claims, and final handoff outline.
  - decision: the plan is ready for issue-sync accounting before closure. Do not
    begin `Plate repo root` implementation under the planning goal.
- Issue sync accounting pass:
  - re-read generated live rows, manual v2 sync rows, issue coverage matrix,
    fork dossier, cluster/requirements/package-impact files, and PR reference.
  - decision: the planning-only page-margin click plan creates no new
    fixed/improved claim and no new public API surface. Existing rows already
    classify every touched issue correctly, so external ledgers stay unchanged.
- Closure score and final gates pass:
  - audited completion threshold, pass table, scorecard, issue/reference sync,
    live source grounding, proof queues, planning-only autoreview N/A, and Done
    Handoff.
  - ran `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-29-pagination-left-margin-click-architecture.md`
    from `plate-2`; result: `[autogoal] complete`.
  - decision: no planning pass remains runnable. Accepted implementation proof
    belongs to a later execution-shaped goal after explicit user acceptance.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Pass 12 complete: closure score and final gates |
| Where am I going? | None for this planning goal |
| What is the goal? | User-review-ready plan for robust wrapped-line page-margin hit testing |
| What have I learned? | The planning answer is stable: shared root/string hit testing is the owner, with no public API and exact browser proof deferred to accepted execution. |
| What have I done? | Created the plan and completed current-state read, related issue discovery, issue-ledger mutation decision, intent/boundary validation, research/source refresh, pressure passes, maintainer objection ledger, high-risk deliberate mode, ecosystem maintainer pass, revision pass, issue sync accounting, and closure gates. |

Open risks:
- None for this planning lane.
- Accepted-plan execution still needs the exact browser red row and package proof
  from `Plate repo root`; that is intentionally outside this planning goal.
