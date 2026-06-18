# Slate v2 ScrubberApi Hard-Cut Ralplan

## Current Verdict

Hard cut public `ScrubberApi`.

Keep the internal need: Slate still needs a single internal debug-value formatter
for error messages. The best target is not `ScrubberApi.stringify(...)` as
public API and not raw ad hoc `JSON.stringify(...)` at every throw site. The
best target is an internal formatter that is pure, deterministic, and cannot
throw while building another error.

Accepted target:

```ts
// internal only; not exported from the root `slate` package
formatDebugValue(value)
```

Rejected target:

```ts
import { ScrubberApi } from 'slate'

ScrubberApi.setScrubber((key, value) => ...)
ScrubberApi.stringify(value)
```

## Intent And Boundary

- intent: remove a global mutable diagnostics/privacy hook from the raw Slate
  public API while preserving useful internal error formatting.
- desired outcome: users no longer learn or depend on `ScrubberApi`; Slate
  internal invariant errors still include compact debug context through one
  internal helper.
- in scope: `packages/slate` public export, docs page, legacy interface fixture,
  public-surface contract, internal error formatter replacement, DOM error
  formatting call sites.
- non-goals: no new public diagnostics API, no app-level privacy redaction
  system, no product logging policy, no broad throw-policy rewrite.
- decision boundary: this plan may decide the public cut and internal target
  shape; implementation belongs to later Ralph execution.
- unresolved user-decision points: none for the architecture verdict.

## Live Current State

Current live source exposes a public API:

- `packages/slate/src/interfaces/scrubber.ts:1` defines
  `Scrubber`.
- `packages/slate/src/interfaces/scrubber.ts:3` defines
  `ScrubberInterface`.
- `packages/slate/src/interfaces/scrubber.ts:26` exports
  `ScrubberApi`.
- `packages/slate/src/index.ts:130` exports
  `./interfaces/scrubber` from the root `slate` package.
- `packages/slate/test/public-surface-contract.ts:238` requires
  `ScrubberApi` as a root export.
- `packages/slate/test/interfaces/Scrubber/scrubber.ts:1`
  preserves the legacy interface fixture.
- `content/docs/slate/api/scrubber.md:1` publishes a Scrubber API page.

Current docs are actively misleading:

- `content/docs/slate/api/scrubber.md:62` calls
  `ScrubberApi.textRandomizer(...)`, but live `ScrubberApi` only exposes
  `setScrubber` and `stringify`.

Current internal usage is real and broader than the first obvious call sites:

- `packages/slate/src/interfaces/transforms/general.ts:207` and
  `:516` format merge-node and set-selection invariant details.
- `packages/slate/src/interfaces/node.ts:528`, `:552`, `:564`,
  `:602`, `:760`, and `:876` format node/path lookup failures.
- `packages/slate/src/transforms-node/merge-nodes.ts:168` formats
  merge-node kind mismatch errors.
- `packages/slate/src/transforms-selection/select.ts:20` formats
  incomplete selection input.
- `packages/slate/src/utils/modify.ts:97` and `:119` format
  element/leaf lookup failures.
- `packages/slate-dom/src/plugin/dom-editor.ts:800`, `:1041`,
  `:1150`, `:1162`, and `:1229` format DOM bridge resolution failures.
- `packages/slate-dom/src/plugin/dom-editor.ts:155` defines
  `SlateDOMResolutionError` with raw `details`, which means `ScrubberApi` is not
  a complete privacy boundary anyway.

Current package-boundary fact:

- `packages/slate/package.json:11` exports `./internal`.
- `packages/slate/src/internal/index.ts:1` owns the internal
  cross-package bridge.
- `packages/slate-dom/src/plugin/dom-editor.ts:13` already imports
  `Editor` and `getEditorLiveSelection` from `slate/internal`.

That makes the best implementation target a shared internal helper exposed only
through `slate/internal` for first-party packages, not a root `slate` export and
not a documented user API.

## Decision Brief

Principles:

- raw Slate public API should expose editor primitives, not app logging policy.
- diagnostics must not use global mutable state.
- error formatting must not throw while constructing another error.
- privacy claims must be real; a string-message scrubber is fake privacy if raw
  error details still carry values.
- migration must be obvious: app logging redaction belongs in app logging.

Top drivers:

- global mutable API is bad SSR/test/multi-editor DX.
- current docs teach a method that does not exist.
- internal call sites need a central formatter, not a public hook.

Viable options:

| Option | Pros | Cons | Verdict |
| --- | --- | --- | --- |
| Keep `ScrubberApi` public | Backward-compatible with legacy Slate shape; app can redact stringified messages. | Global mutable state, weak privacy boundary, stale docs, not editor architecture. | reject |
| Rename to `DebugValueApi` public | More honest name. | Still exposes logging policy as raw Slate API and invites more surface area. | reject |
| Add `createEditor({ diagnostics })` | Per-editor, SSR-safe, more honest than global. | Overbuilt now; privacy still leaks through thrown objects and app logs unless the whole error pipeline is designed. | defer |
| Internal `formatDebugValue` only | Keeps useful errors, removes false public promise, simplest migration. | Users lose a legacy hook. | choose |

Chosen option: internal `formatDebugValue` only.

Consequences:

- public `ScrubberApi` and `Scrubber` disappear from root exports.
- docs delete the Scrubber API page and summary link.
- tests stop preserving legacy Scrubber fixture parity.
- internal error call sites keep readable debug snippets through one helper.
- app privacy guidance, if documented later, should say to redact at the app
  logger/error boundary, not through Slate.

## Public API Target

Cut:

```ts
ScrubberApi
Scrubber
ScrubberInterface
```

No public replacement in this slice.

Do not add:

```ts
createEditor({ diagnostics: { redact() {} } })
```

That may become valid only if Slate designs a full diagnostics pipeline,
including thrown error `details`, browser bridge details, dev/prod behavior, and
logging guidance. This slice should not invent that layer.

## Internal Runtime Target

Add or reuse an internal helper owned by `slate`:

```ts
const formatDebugValue = (value: unknown): string => {
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return Object.prototype.toString.call(value)
  }
}
```

Implementation may choose a stronger circular-safe implementation, but the
required contract is:

- no root package export, docs page, or app-facing replacement API
- no global mutable configuration
- deterministic output
- safe fallback when `JSON.stringify` cannot serialize the value
- used by all surviving Slate core error messages that currently call
  `ScrubberApi.stringify`

DOM package options:

- preferred: add the helper in `packages/slate/src/utils/format-debug-value.ts`
  and export it only from `packages/slate/src/internal/index.ts`, then import it
  from `slate/internal` in `slate-dom`;
- fallback only if build/package-boundary proof rejects the internal export:
  duplicate the same internal helper in `slate-dom`;
- do not expose formatter as `editor.api`, extension API, root package API, or
  documentation.

## Ecosystem Strategy Synthesis

| System | Source | Mechanism | Avoids | Steal | Reject | Slate target | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Legacy Slate | `../slate/packages/slate/src/interfaces/scrubber.ts:1` and `../slate/docs/api/scrubber.md:62` | global `Scrubber` replacer for internal error stringification | leaking clear text in some error messages | the desire for central formatting | global mutable public API and stale `textRandomizer` docs | internal formatter only | diverge |
| Slate v2 live | `packages/slate/src/interfaces/scrubber.ts:26`, `content/docs/slate/api/scrubber.md:62` | API-suffixed copy of legacy scrubber | legacy parity drift | source-backed call-site inventory | keeping parity for parity's sake | hard cut public, keep internal helper | diverge |
| ProseMirror | `../prosemirror-*` grep found JSON formatting but no global scrubber/redaction API | editor core does not expose logging policy as schema/editor API | public API bloat | keep diagnostics local to failures | app-wide global redaction hook | no public diagnostics API | agree |
| Lexical | `../lexical/scripts/error-codes/*` uses build-time/dev invariant message handling; grep found no editor-level scrubber API | diagnostics are build/tool/runtime concern, not editor document API | runtime public API pollution | keep error policy separate from editor model | public mutable formatter | internal debug formatter only | partial |
| Tiptap | `../tiptap` grep found JSON examples/tests, no global scrubber/redaction API | extension DX focuses on commands/extensions, not logging policy | product logging leaking into core editor API | do not teach editor users a logging API | adding diagnostics to extension API | no public replacement | agree |

## Issue Ledger Accounting

No fixed issue claim from this plan.

Related rows:

| Issue | Cluster | Claim | Why | Proof route | V2 sync ledger | PR line |
| --- | --- | --- | --- | --- | --- | --- |
| #3948 | singleton | Not claimed | The issue says Slate errors cannot be caught by error boundaries. Cutting `ScrubberApi` does not prove catchability or runtime recovery. | no claim; repro-first only | `docs/slate-issues/gitcrawl-v2-sync-ledger.md:204` already says current repro required | related matrix only |
| #3641 | singleton-dom-selection | Related | Public Scrubber cut is adjacent to error policy, but selection failure strictness belongs to DOM bridge policy. | `packages/slate-dom/test/bridge.ts`; existing ledger row | `docs/slate-issues/gitcrawl-v2-sync-ledger.md:260` keeps cluster-synced | preserve existing related row |
| #4643 | singleton-dom-selection | Related | DOM point throwing and uncatchable selection failures need bridge/runtime proof, not message redaction. | `packages/slate-dom/test/bridge.ts`; existing ledger row | `docs/slate-issues/gitcrawl-v2-sync-ledger.md:410` keeps cluster-synced | preserve existing related row |
| #2039 | singleton-normalization | Not claimed | Better internal debug formatting is not named infinite-loop diagnostics. | no claim | `docs/slate-issues/gitcrawl-v2-sync-ledger.md:683` already not-claimed | preserve existing not-claimed row |

ClawSweeper status: applied by ledger reuse for the related-issue discovery
pass. The generated live ledger rows were read for `#3948`, `#3641`, `#4643`,
and `#2039`; existing fork dossier / coverage matrix rows already cover
`#3641` and `#4643`; issue dossier and test-candidate rows cover `#3948` and
`#2039`. No ledger writes are needed in this pass because the classifications
do not change and no fixed/improved issue claim is added.

Related issue discovery result:

- `#3948`: live row read at
  `docs/slate-issues/gitcrawl-live-open-ledger.md:165`; dossier says weak repro
  and test candidate is `blocked-on-repro`, so Scrubber removal must not claim
  error-boundary catchability.
- `#3641`: live row read at
  `docs/slate-issues/gitcrawl-live-open-ledger.md:221`; fork dossier keeps it
  `cluster-synced` under DOM selection failure policy, so Scrubber removal stays
  related only.
- `#4643`: live row read at
  `docs/slate-issues/gitcrawl-live-open-ledger.md:371`; fork dossier keeps it
  `cluster-synced` under DOM point/selection bridge policy, so Scrubber removal
  stays related only.
- `#2039`: live row read at
  `docs/slate-issues/gitcrawl-live-open-ledger.md:644`; dossier says this is
  normalizer diagnostics debt and the test candidate is not a first red test, so
  Scrubber removal stays not claimed.

Re-run ClawSweeper only if implementation changes thrown error behavior,
catchability, normalizer diagnostics, or DOM bridge failure policy beyond
removing the public Scrubber surface.

PR reference status: unchanged in current pass. If Ralph implements the cut,
update `docs/slate-v2/references/pr-description.md` API-shape rows and remove
any stale Scrubber public-surface language if present.

## Issue-Ledger Pass Result

Broader keyword and cluster scan covered `scrub`, `redact`, `privacy`,
`exception`, `error boundary`, `diagnostic`, `stringify`, `uncatchable`, and
throw/error-policy wording across the generated live ledger, frozen ledger,
manual v2 sync ledger, issue dossiers, test-candidate map, benchmark map,
package-impact matrix, requirements file, coverage matrix, and PR reference.

Additional reviewed issues:

| Issue | Cluster | Claim | Why | Proof route | V2 sync ledger | PR line |
| --- | --- | --- | --- | --- | --- | --- |
| #5202 | singleton | Not claimed | Historical local install exception report. It is repo/tooling debt, not Scrubber/API architecture. | no claim | `docs/slate-issues/gitcrawl-v2-sync-ledger.md:271` already `triage-closed` | none |
| #4971 | singleton | Not claimed | Null text is invalid document shape. Removing Scrubber does not change the valid Slate value contract. | no claim | `docs/slate-issues/gitcrawl-v2-sync-ledger.md:362` already `triage-closed` | none |

No benchmark issue is touched. `docs/slate-issues/benchmark-candidate-map.md`
contains performance lanes, but this plan changes a cold-path diagnostics API
surface only.

Issue-ledger conclusion: no fixed issue claim and no improved issue claim.
Existing related rows stay as context; the hard-cut target is an API/DX cleanup
with explicit non-claim accounting for adjacent error-policy issues.

## Migration Backbone

Plate/plugin maintainer:

- no adapter should wrap `ScrubberApi`;
- product logging redaction belongs in the product logger/error boundary;
- Plate can add its own logging redaction without raw Slate core API.

slate-yjs/collab maintainer:

- no operation, snapshot, commit, history, or remote-apply semantics change;
- collab proof impact is limited to public export/test churn.

Raw Slate app migration:

```ts
// before
ScrubberApi.setScrubber((key, value) => ...)

// after
logger.configureRedaction(...)
// or:
JSON.stringify(value, replacer)
```

There is intentionally no Slate replacement.

## High-Risk Pre-Mortem

1. A user depended on `ScrubberApi` for production privacy and loses it.
   - answer: the existing hook was not complete privacy because thrown DOM
     errors can carry raw `details`; app logging redaction is the honest owner.
2. Internal call sites get replaced with raw `JSON.stringify` and a circular
   value masks the original error.
   - answer: implementation must add a no-throw internal formatter.
3. Public-surface tests pass but docs still teach Scrubber.
   - answer: implementation must delete `docs/api/scrubber.md` and the
     `docs/Summary.md` entry.

## Slate Maintainer Objection Ledger

| Change | Who feels pain | Likely objection | Steelman antithesis | Tradeoff | Answer | Rejected alternative | Migration | Proof | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Cut public `ScrubberApi` | app authors using legacy privacy hook | "You removed my only redaction escape hatch." | Privacy-sensitive apps do need redaction. | Apps must move redaction outside Slate. | The current API is global mutable state and incomplete privacy; keeping it teaches a false guarantee. | `createEditor({ diagnostics.redact })` is more honest but overbuilt until error details/logging policy are designed. | use app logger redaction or local `JSON.stringify(value, replacer)`. | public surface contract removes export; docs page deleted; internal formatter tests survive. | keep |
| Replace internal `ScrubberApi.stringify` | Slate core/DOM maintainers | "This is churn for no runtime behavior." | Central formatting is still useful. | Implementation touches many throw messages. | The payoff is removing public API without losing central error formatting. | raw `JSON.stringify` everywhere would duplicate and can throw during error construction. | none for users; internal only. | package tests for formatter and representative existing error messages. | keep |

## Confidence Scorecard

Initial current-state score: `0.87`.

Related-issue pass score: `0.90`.

Final planning score: `0.93`.

| Dimension | Score | Evidence |
| --- | ---: | --- |
| React 19.2 runtime performance | 0.93 | No React render/subscription surface; `vercel-react-best-practices` skipped with reason; implementation target forbids editor diagnostics subscriptions. |
| Slate-close unopinionated DX | 0.95 | Public API becomes smaller; users keep normal JS/app logging instead of learning `ScrubberApi`; no replacement API is added. |
| Plate and slate-yjs migration backbone | 0.92 | No operation/snapshot/collab semantics touched; Plate owns product logging; slate-yjs impact is only export/test churn. |
| Regression-proof testing strategy | 0.90 | Plan names public-surface absence, docs deletion, legacy fixture removal, no-throw formatter safety, and representative node/DOM error tests for Ralph. |
| Research evidence completeness | 0.92 | Live Slate v2, legacy Slate, compiled research layer, local ProseMirror/Lexical/Tiptap grep, generated live ledger, dossiers, package matrix, requirements, and benchmark map were read. |
| shadcn-style composability/minimalism | 0.94 | No UI and no config object; one internal helper through existing `slate/internal` bridge is the smallest composable first-party shape. |

Threshold note: this closes the planning/handoff objective, not the later Ralph
implementation. `Plate repo root` implementation proof is intentionally a Ralph
gate and remains listed under Implementation Phases / Fast Driver Gates.

## Applicable Implementation-Skill Review Matrix

| Lens | Applicability | Finding | Plan delta |
| --- | --- | --- | --- |
| `vercel-react-best-practices` | skipped | No React render, subscription, effect, or browser event surface changes. | No React-specific target. |
| `performance-oracle` | skipped | Error formatting is cold-path diagnostics. The only perf rule is no editor/runtime subscription or per-render work. | Keep helper pure and allocation-limited to throw paths. |
| `performance` | skipped | No production latency, virtualization, or large repeated-surface claim. | No perf cohort gate. |
| `tdd` | applied | Public API cut and formatter safety need tests, but do not write dead-code legacy-removal tests. | Add public-surface absence, no-throw formatter, and representative error-message tests. |
| `build-web-apps:shadcn` | skipped | No UI/editor chrome surface. | No UI target. |
| `react-useeffect` | skipped | No effects or external-system synchronization. | No effect target. |

## Legacy Regression Proof Matrix

| Surface | Legacy behavior | Target | Proof |
| --- | --- | --- | --- |
| Root `slate` export | legacy Slate exports `Scrubber`; Slate v2 exports `ScrubberApi` | root package exports neither `Scrubber` nor `ScrubberApi` | update `packages/slate/test/public-surface-contract.ts` |
| Docs | legacy docs teach Scrubber and stale `textRandomizer` | no Scrubber API page or summary entry | delete `docs/api/scrubber.md`; remove `docs/Summary.md` entry |
| Internal throw messages | legacy calls global scrubber from error strings | messages use internal no-throw formatter | unit test circular/unserializable formatting and representative existing throw sites |
| DOM bridge failures | Slate v2 formats DOM errors through root `ScrubberApi` | DOM bridge imports shared helper from `slate/internal` | focused DOM bridge error test plus `rg` gate |

## Browser Stress / Parity Strategy

No browser stress gate is required for the planning pass because this cut does
not change selection import/export, DOM repair, rendering, or input handling.
If Ralph implementation changes DOM bridge throw semantics, run the focused
`Plate repo root` DOM bridge tests named by the implementation and keep issue
claims conservative.

## Plan Deltas From Related-Issue Review

- strengthened internal usage inventory from three example call sites to the
  complete current `ScrubberApi.stringify` replacement set;
- chose the existing `slate/internal` package bridge as the first-party sharing
  mechanism for `formatDebugValue`;
- changed ClawSweeper status from skipped to ledger-reused applied, with current
  live rows and existing dossier/coverage evidence named;
- kept all issue claims conservative: no fixed issue, no improved issue, only
  related or not claimed rows;
- added `#5202` and `#4971` as reviewed/not-claimed throw/exception keyword
  false positives;
- kept `createEditor({ diagnostics })` rejected/deferred because no current
  issue row proves a full diagnostics pipeline is required.

## Implementation Phases

1. Cut public surface:
   - delete `packages/slate/src/interfaces/scrubber.ts`;
   - remove `packages/slate/src/index.ts:130`;
   - remove `ScrubberApi` and `Scrubber` from public-surface contracts.
2. Add internal formatter:
   - add internal `formatDebugValue`;
   - export it only through `slate/internal` for first-party package sharing;
   - replace every `ScrubberApi.stringify` import/call in `slate` and
     `slate-dom`;
   - formatter must not throw on circular/unserializable values.
3. Clean tests/docs:
   - delete legacy `packages/slate/test/interfaces/Scrubber/scrubber.ts`;
   - delete `docs/api/scrubber.md`;
   - remove `docs/Summary.md` Scrubber entry;
   - add/update tests for public absence and internal formatter.
4. Verify:
   - `Plate repo root`: focused `slate` public-surface contract;
   - `Plate repo root`: focused package tests covering representative error
     formatting;
   - `Plate repo root`: `bun --filter slate typecheck`;
   - `Plate repo root`: broader `bun check` if public export churn affects
     package graph.

## Fast Driver Gates

- cwd `Plate repo root`: `rg -n "ScrubberApi|Scrubber\\b|setScrubber|interfaces/scrubber" packages docs site --glob '!site/out/**'` returns only intentional changelog/archive references or zero current public references.
- cwd `Plate repo root`: public-surface contract proves `ScrubberApi` is absent.
- cwd `Plate repo root`: internal formatter test proves circular/unserializable
  value formatting cannot mask the original throw.
- cwd `Plate repo root`: focused representative node/DOM error tests still pass.
- cwd `plate-2`: `node tooling/scripts/completion-check.mjs --id 019e46be-4ec4-7d11-bc6e-9fcf033a8803` reflects this review state.

## Pass-State Ledger

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| current-state read and initial score | complete | live `ScrubberApi` source, docs, public-surface contract, DOM error details, legacy Slate, local ecosystem grep | accepted hard cut public API plus internal formatter target | no implementation proof yet | Slate Ralplan next pass |
| related issue discovery | complete | generated live rows for #3948/#3641/#4643/#2039; fork dossier rows for #3641/#4643; issue dossier/test-candidate rows for #3948/#2039 | changed ClawSweeper from skipped to ledger-reused applied; kept all claims conservative | no fixed/improved issue claim | Slate Ralplan next pass |
| issue-ledger pass | complete | keyword/cluster scan across live/frozen/manual ledgers, package matrix, requirements, test candidates, benchmark candidates, coverage matrix, and PR reference | added #5202/#4971 as reviewed/not-claimed false positives | no fixed/improved issue claim | Ralph implementation later |
| intent/boundary and decision brief | complete | explicit intent, desired outcome, in-scope, non-goals, decision boundary, viable options, rejected alternatives, consequences | no unresolved user decision | none | Ralph implementation later |
| research/ecosystem synthesis | complete | compiled research plus local legacy Slate, ProseMirror, Lexical, Tiptap, and live Slate v2 source | kept no public diagnostics API; chose `slate/internal` bridge | no contradiction | Ralph implementation later |
| pressure and objection passes | complete | high-risk pre-mortem, maintainer objection ledger, implementation lens matrix, migration backbone | rejected public `DebugValueApi` and deferred diagnostics pipeline | no unresolved P0/P1 | Ralph implementation later |
| closure gates | complete | final planning score `0.93`, pass ledger complete, continuation prompt present, completion state can close | planning/handoff objective complete; implementation remains future work | none | Ralph implementation later |

## Ralph Implementation Pass

Status: complete.

Implemented:

- deleted the public Scrubber implementation, legacy fixture, docs page, and
  docs summary entry;
- removed root/interface exports for `ScrubberApi`, `Scrubber`, and
  `ScrubberInterface`;
- added internal `formatDebugValue` and exposed it only through
  `slate/internal`;
- replaced all `ScrubberApi.stringify` throw-message call sites in
  `packages/slate` and `packages/slate-dom`;
- updated the public-surface contract to require `ScrubberApi` absence and keep
  `Scrubber` banned as a bare root data-helper value;
- added the internal formatter contract for circular values and
  JSON-serialization failures.

Diff-review result:

- P0/P1/P2 findings: none.
- Accepted risk: the `Plate repo root` checkout already contains unrelated dirty
  changes in overlapping files such as `packages/slate/src/index.ts`,
  `packages/slate/src/internal/index.ts`, and
  `packages/slate/src/interfaces/node.ts`; this pass reviewed only the
  Scrubber hard-cut lines and left unrelated work intact.
- Reference sweep: current `ScrubberApi`, `setScrubber`, `textRandomizer`,
  `interfaces/Scrubber`, and `api/scrubber` references are gone except the
  intentional public-surface absence guard. Broader `Scrubber` matches remain
  only in historical changelogs plus that guard.

Verification:

- `Plate repo root`: `bun test ./packages/slate/test/public-surface-contract.ts ./packages/slate/test/format-debug-value-contract.ts`
  passed, `342 pass, 0 fail`.
- `Plate repo root`: `bun test ./packages/slate-dom/test/bridge.ts ./packages/slate-dom/test/public-surface-contract.ts`
  passed, `21 pass, 0 fail`.
- `Plate repo root`: `bun --filter slate typecheck` passed.
- `Plate repo root`: `bun --filter slate-dom typecheck` passed.
- `Plate repo root`: `bun lint:fix` ran and fixed formatting.
- `Plate repo root`: post-lint focused tests passed,
  `363 pass, 0 fail`.
- `Plate repo root`: post-lint `bun --filter slate typecheck` and
  `bun --filter slate-dom typecheck` passed.
- `Plate repo root`: `bun check` passed, including lint/typecheck and test suites.

## Open Questions

None blocking the public hard-cut verdict.

Question that would change the future design, not this cut: should Slate ever
own a full diagnostics pipeline with per-editor redaction, structured errors,
and logging guidance? Current answer: no, not until a real downstream use case
requires more than app-level logging redaction.

## Final Handoff Outline

- Public API: cut `ScrubberApi`, `Scrubber`, and `ScrubberInterface`.
- Internal runtime: add root-private, no-throw `formatDebugValue`.
- Docs: delete Scrubber API page; do not document a Slate replacement.
- Tests: public-surface absence, formatter safety, representative error
  behavior.
- Issues: no fixed claims; preserve related/not-claimed error-policy rows.
- Migration: app logging redaction or local JSON replacer, not Slate API.

## Final Completion Gates

Complete for the Slate Ralplan planning/handoff objective and the Ralph
implementation slice.

Accepted final state:

- hard cut public `ScrubberApi`, `Scrubber`, and `ScrubberInterface`;
- keep only an internal root-private `formatDebugValue` helper shared through
  `slate/internal` for first-party packages;
- do not add `createEditor({ diagnostics })`, `DebugValueApi`, editor APIs, or
  app-facing docs replacement;
- no fixed or improved issue claims;
- related/not-claimed issue accounting is recorded for `#3948`, `#3641`,
  `#4643`, `#2039`, `#5202`, and `#4971`;
- implementation gates passed in `Plate repo root`, including `bun check`.
