# AI continuation render recovery

Status: Complete — Generate Markdown docs-embed containment verified

Source: September 16 user screenshots and the latest reporter contradiction.
Local repair, existing checkout; no publication.

Objective:

Keep Generate Markdown sample scrolled to its committed preview tail with both
the final generated block and review controls inside the editor scrollport.

Completion threshold:

The exact docs-embed empty-list-item → Space → Generate Markdown sample
interaction passes two-sided scrollport oracles for the generated endpoint and
review menu plus native Chrome replay after registry generation, with the full
AI browser file and scoped closure checks green.

Verification surface:

`apps/www/tests/browser/ai-session.spec.ts`, native Chrome at
`/docs/components/ai-menu`, scoped Ultracite, `git diff --check`, www source
typecheck, registry generation and the task-owned port cleanup.

Constraints:

Preserve the authored document during preview, retain existing AI behavior, and
bind scrolling to rendered preview commits without timers or animation-frame
guessing.

Boundaries:

The correction is limited to the private AI preview renderer, its exact browser
regression and generated registry payloads. It adds no public API or package
contract.

Blocked condition:

Block only if the exact local route cannot run after repairing owned server and
source prerequisites; that condition did not occur.

Work Checklist:

- [x] Reproduce the final-scroll failure in native Chrome.
- [x] Add and prove an exact failing two-sided scrollport regression.
- [x] Bind scrolling to committed preview state and prove the regression green.
- [x] Reproduce the docs embed escaping its editor and require the review menu
  bounds to remain inside the same scrollport as the generated endpoint.
- [x] Run full AI browser, registry, lint, source and cleanup closure checks.

Verification evidence:

The final exact browser case passes after formatting and registry generation;
the full AI browser file passes 12/12 in 1.2 minutes. Native Chrome shows the
final table rows and complete review menu inside the docs editor scrollport.
Scoped Ultracite, `git diff --check` and registry generation pass, and port 3111
is stopped. The broad www typecheck reports only two pre-existing missing
comment-browser helper names recorded below.

Open risks:

No known risk remains in the final-scroll path. The unrelated www comment test
helper type errors still prevent a whole-www typecheck claim.

## Acceptance

- [x] Reproduce the reporter's finished stream showing only `AI can help` and a blank green proposed block.
- [x] Full streamed text renders in exactly the intended block, with original content preserved.
- [x] Continue writing from the heading and an empty paragraph works through Accept, Discard, retry, undo/redo and subsequent input.
- [x] The browser regression rejects the known bad rendered state, not only model content or a text locator elsewhere.
- [x] Final exact Chrome screenshot and affected checks pass on fingerprinted source.

### September 16 reporter delta: AI preview ownership

The previous completion does not cover this delta and is revoked for the full
interaction. Preserve the passing full-content, history, key and initial-mode
evidence above; it does not prove these additional requirements.

- [x] Ordinary AI generation preserves Editing throughout streaming and review,
  including follow-up native input. Only an explicit user choice enables Suggestion.
- [x] AI output has its own purple presentation and a visible streaming end
  indicator; completed review and accepted content have separately verified caret
  and focus behavior.
- [x] AI preview does not expose unrelated pending suggestions or silently restore
  an obsolete user mode on accept, discard, retry, cancellation or unmount.
- [x] Reassess temporary AI draft versus native tracked-change ownership before
  another product edit, with the strongest deletion alternative recorded in the
  existing AI review ledger.
- [x] Extend the existing native regression at its missing mode and paint boundary,
  then replay it against final fingerprinted source.

Exact red on `http://localhost:3000/docs/components/ai-menu`, Chrome profile Ziad:
the toolbar begins in Editing. Native Enter after the heading, Space, Continue
writing produces the full sentence in green and changes the toolbar to Suggestion.
The rendered spans have `data-editor-authored-status="pending"`, author `demo`,
and the suggestion palette; no purple AI leaf is rendered. After completion the
AI command input owns focus. A completed screenshot shows an end marker, so it
does not establish whether the streaming indicator was present during generation.

Escape: the existing browser test asserts full text, accept/discard/retry and
undo/redo, but never checks the editor mode or AI paint while streaming. The
default-mode correction explicitly retained the temporary proposal view; that
assumption contradicts the user's requirement and is reopened.

Review: [AI preview ownership](../research/decisions/ai-preview-ownership.md),
recorded as `2026-09-16-ai-preview-ownership`. The initial review selected one
temporary draft under the existing AI feature and normal commands at apply,
provisionally pending the probe below. A timed Chrome
MDX replay with Stop visible found no purple AI leaf or AI pseudo-element; a
native caret was visible in the screenshot. Do not conflate those signals.

### Design probe, frozen before candidate execution

Compare current per-chunk authored insertion with reuse of detached preview
deserialization plus one normal apply. This first probe isolates package work;
it cannot establish browser layout/caret parity. Keep public draft/branch APIs
out unless reuse fails a supported job.

Fixture axes: 1 and 1,000 existing paragraphs; 1 KiB, 10 KiB and 100 KiB of
generated paragraphs; 128-character transport chunks. Use identical raw input
and parse configuration. Include final apply or discard in the complete
operation. Initial editor creation is outside the stream timing and recorded
separately. Three interleaved repetitions follow an untimed warmup. Compare
medians; a spread above 20% requires another isolated sample before a timing
verdict. Record total and slowest publish, original-document writes while
streaming, final content, original-prefix preservation and user view policy.

Candidate gate: zero source document writes before apply, unchanged mode,
correct full output, at most one apply transaction, and source identity intact.
For the 1/10 KiB cohorts, median package stream-plus-apply must be within 20%
of baseline and below 1.5 seconds, with maximum publish below 50 ms. The 100
KiB stress cohort must remain below 20 seconds total and 250 ms per publish;
failure rejects whole-response reparsing as the target even if the current
baseline also struggles. These are local diagnostic gates, not latency claims
for production. Final native proof still includes full MDX rendering,
heading/empty-paragraph entry, cursor, mode, apply/discard/retry and history.

The sequence frozen before the probe was comparison, target selection, scoped
adoption, then final native replay. Results and closure follow below.

### Probe result and implementation target

The package comparison passes its frozen correctness and timing gates.
Interleaved median complete-operation milliseconds (current → draft) are
30 → 4.8 and 126 → 5.6 for 1 KiB; 313 → 128 and 1,143 → 127 for 10 KiB;
25,920 → 13,756 and 37,549 → 11,646 for 100 KiB, respectively for 1 and
1,000 source paragraphs. The noisy stress candidate was repeated in three
fresh processes per document size: 9.45–9.61 seconds and 9.58–9.80 seconds,
with maximum publishes below 39 ms. Source content and Editing stay unchanged
before apply. These are package measurements, not browser latency guarantees.

The disposable React placement probe mounts zero preview wrappers initially,
exactly one at the selected key, and zero after reset. Existing sparse node
attributes invalidate wrapper eligibility; only the mounted draft subscribes
to output. Eighty growing publications take 2.27/2.52 seconds with 1/1,000
source paragraphs in the DOM test environment. This proves the existing API
can express the ownership, not native browser layout or performance parity.

Receipts: `artifacts/ai-preview-ownership/`. The frozen source-built baseline
is `node_modules/.cache/ai-preview-ownership/baseline/plate-ai-preview-probe.test.js`,
SHA-256 `fbbd6493826c8e56e1e7df9922f0a61de7538ab8dd5c9a39ac7e39cbbe3d0a9d`;
its small correctness replay passes. Keep this baseline immutable for the final
production-path comparison.

Chosen implementation: reuse `previewValue` and `AIChatEditor` for the complete
raw response. `api.setPreview(content, { requestId? })` owns full response
publication; structured table responses use `api.setTablePreview`. Remove the
per-chunk document-update APIs, AI proposal IDs, replacement-key bookkeeping,
mode snapshots and mode-switch/restore microtasks. One apply operation uses
normal commands, respects the actual user intent and owns one history batch.
Discard releases the draft and restores the mapped invoking selection. Reuse
native anchors for selection lifetime and node keys for block/cell targets.
Keep comment thread lifecycle independent.

Copied AI UI owns purple draft paint and the stream-end indicator. Reuse
`render.useViewElementAttributes` for the single target and `slots.wrapNode`
for passive inline placement. Selection output uses the same rich draft in the
menu. The ordinary editable remains the canonical document. Final production
proof must cover native entry/caret, typing, accept/discard/retry, full MDX,
explicit Suggestion mode, changed/deleted targets, structured table updates,
view retirement, source types, registry output and affected doctrine.

## Failed fix history

Attempt 1 is revoked: reporter-contradiction. Base acceptance includes complete streaming, no blank proposed block, original preservation and responsiveness. Latest reporter delta: deterministic sentence is also truncated to its first chunk (`AI can help`) while Accept is already visible; the blank green block remains. The earlier patch changed demo words and preset context but did not establish the cause of this rendering/insertion failure. The earlier test asserted model block text, not rendered block shape; the Chrome locator check did not inspect pixels and the popup could obscure the result. Repair-now: strengthen the same executable browser case at the rendered boundary. No instruction change is required because Patch and Verify Plate already reject model-only completion for the screenshot.

Attempt 2 was reopened by a reporter contradiction: non-suggestion editors must not start in suggesting mode. The editor-ai block and homepage playground explicitly mounted `EditorRoot` with `intent: 'propose'`; their shared kit already defaults to editing. The authored model deliberately couples editing with the accepted projection, so `edit/markup` is invalid. Remove the broad overrides entirely. Seeded pending suggestions become visible after the user explicitly enters Suggestion mode. Suggestion-named demos retain explicit propose intent, and AI retains its temporary proposal view only while reviewing generated output. Chrome reproduced both broad surfaces with no “Editing” mode button before this correction.

## Investigation

Frozen source before this attempt: current `next` checkout. Inspect the existing Chrome tab before resetting it, then reproduce on the same docs route and modes. Existing tab currently contains full sentence in DOM but has a popup overlapping the result; this does not reproduce the new screenshot. Keep `needs-repro` until the exact failure is observed.

Exact red: native Enter after `AI Menu`, then Space → Continue writing. Chrome on port 3000 showed the supplied screenshot, including the retained empty paragraph and only `AI can help ` with Accept visible. The existing browser case, expanded to that native setup and rendered block assertions, failed with that exact text. Heading passed.

Cause: `nodes.replace` discards old node keys in the transaction, but authored publication resets that draft before inheriting the projection index. The discarded-key information was lost, and the path-stable projection shortcut revived the old key. The AI stream stored the transaction's replacement key; later chunks resolved no node. `node-key-view-contract.test.ts` reproduced this without AI. Pass a snapshot of discarded identities through the existing authored publication boundary and honor it when inheriting projected indexes.

Keep/cut review: keep native authored changes and node identity ownership in Plite. Reject an AI path fallback, a fresh stream namespace, and replacing native suggestions with UI-only preview state: each would hide the broken replacement contract or duplicate acceptance/history. Cut structural paragraph replacement when the first streamed block can fill the existing empty paragraph; preserve the ordinary replacement path for different block shapes. No public API expansion is needed.

Follow-up proof exposed additional existing errors: reload cleared the invoking view and initial selection; the Space trigger captured the runtime owner's selection instead of the command's selection; the menu moved the caret to the document end after the package had placed it at the accepted response. Repair the existing reset/trigger handoff and delete the menu's extra caret write.

Follow-up undo/redo found accepted dependant records that remained after their edits were fully compensated. Ignore fully compensated contributions when checking whether acceptance can be undone. Reuse the existing compensation visibility calculation. Redo may follow balanced undo/redo of the proposal contents; allow it only when its own later compensation heads preserve the target review's contribution and no later review intervenes. A compensation selects the review it reverses. A public history test covers proposal → accept → typing, three undos, three redos, and reopening the saved document. Existing active foreign-dependency conflicts remain blocked.

The broader AI browser suite found a separate Copilot failure: Ctrl+Space sent no request despite a correct native caret. The compiled API shortcut captured the original editor; the debounced callback then read a null selection. Bind compiled shortcuts to the event editor and pass that view through the delayed completion request. Capture the destination block key before the request completes. The focused shortcut test failed before this repair. Native acceptance also exposed missing `userId` in the Copilot demo; use its demo author, as in the other authored examples.

The 15 synchronous Markdown stream assertions needed an explicit proposal projection: they were reading the accepted document before the scheduled view switch. Their expected Markdown output is unchanged. The native regression also covers the asynchronous view switch. The existing submit fixture now opens the actual AI session instead of setting only `open: true` without its prompt snapshot. No previous regression expectation was deleted.

Proof so far: 373 authored tests, 71 AI React tests, and 80 shortcut tests pass. AI React and authored source typecheck scripts pass. Final browser proof uses a restarted source-first server on port 3107; the user's port 3000 server remains untouched. An earlier core partition run hit the five-second timer in the 4.9 MB splice test while registry generation and browser checks competed for CPU; rerun that case alone before closure. Intermediate HMR runs are diagnostic only.

## Earlier repair proof, before the preview ownership correction

September 16, 2026, 15:53:56 UTC: `ai-session.spec.ts` passes all seven scenarios in 47.29 seconds, with no retries or skipped tests, using `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`. The source-first server was restarted after registry generation: port 3107, PID 37765, cwd `/Users/zbeyens/git/plate-2/apps/www`, `PLATE_WWW_PLITE=1 PLATE_WWW_DEV_SOURCE=1`. The user's existing port 3000 process was not restarted.

- Native Enter → Space → Continue writing was also inspected interactively in Chrome on `/docs/components/ai-menu`. The complete highlighted sentence appears directly below the heading, with no retained blank block.
- The durable browser cases check the exact rendered block, preserved originals, retry, discard, regeneration, acceptance, subsequent native typing, three undos and three redos. Copilot checks its request, formatted acceptance, content restoration on undo, dismissal and typing. Its undo assertion compares full document children; retained authored-operation metadata intentionally survives undo.
- Full Generate MDX sample: 4,840 ms from clicking the preset through completed output; largest measured animation-frame gap 66.6 ms. This is one local development-server observation, not a production benchmark or a general latency guarantee.
- Plate core: 543 tests pass; AI React: 71 pass; authored: 373 pass; focused streaming/history/key integration: 22 pass. The isolated 4.9 MB splice file passes all 11 tests in 4.27 seconds with the original timeout. Earlier passing core tests remain valid; the timed-out file was rerun without competing heavy work.
- Plate core, Plate AI React and Plite authored source typecheck scripts pass. Formatting/lint passes for all 18 edited source/test files. `git diff --check` passes for that scope.
- `pnpm --filter www build:registry` succeeds and materializes 320 canonical payloads and 15 sparse overlays, including the AI menu and Copilot demo changes. No generated registry files were edited manually.

Evidence: [empty-paragraph screenshot](/tmp/plate-ai-continuation-proof/empty-paragraph.png), [heading screenshot](/tmp/plate-ai-continuation-proof/heading.png), [browser results](/tmp/plate-ai-continuation-proof/browser-results.json), [timing](/tmp/plate-ai-continuation-proof/stream-performance.json), and [source fingerprints](/tmp/plate-ai-continuation-proof/source.sha256). The source manifest SHA-256 is `4e660ff09b6b103c8a95e17a73fbde66db14ec06fd6fcb7401328d8ef7164a13`.

No public API shape changed. These defects arose in the branch's authored/view integration, so this repair adds no branch-relative release note. No commit or publication was requested or performed.

### Default-mode correction

September 16, 2026: a restarted source-first server on port 3108 and `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` prove that editor-ai and the homepage playground open in Editing while the suggestion demo opens in Suggestion. Five final browser cases pass, including the two default-mode checks, the suggestion-demo inverse check, and explicit review-mode access to both seeded documents. The broader focused run passed eight cases, including editing inside an existing suggestion and media proposal resolution after an explicit mode switch. The two affected component suites pass 15 tests, registry generation succeeds, and Ultracite passes the four edited source/test files.

The checkout-wide `www` typecheck remains blocked before TypeScript by the unrelated API-reference error `defineDocumentMigrations must be included or excluded exactly once`. Direct TypeScript runs also report existing errors in `comment.spec.ts`, the AI streaming package-integration fixtures, the core runtime inference contract, and editor-perf migration imports. The existing homepage contiguous-suggestion undo browser case remains red under both the former always-Suggestion mount and this correction; it is not a regression from the default-mode change.

## Final preview ownership receipt

September 16, 2026: the production implementation reuses one temporary draft
for inline insertion, selection generation/editing and structured table output.
Streaming performs no source-document writes and creates no history or tracked
suggestion records. Apply uses one ordinary update under the current user
intent. Discard releases the draft and restores the mapped invoking selection.
The source editor retains ownership of input; the copied static preview owns
purple paint, the 12 px generation-end indicator and scrolling to that end.
An empty source paragraph stays mounted but hidden while its inline preview is
visible, avoiding the duplicate blank highlighted line.

The package no longer depends on the authored plugin for AI preview, switches
or restores user modes, or round-trips partial Markdown through serialization.
`setPreview` accepts accumulated response text; `setTablePreview` owns the
request-local cell draft. Native anchors and node keys preserve targets through
unrelated edits. Request fencing, cancellation and view retirement release the
same state. Existing authored persistence and history remain canonical for the
final edit or an explicitly requested tracked suggestion.

React lifecycle verification exposed a separate core defect: development
inspection coerced a callable plugin facade to a string, which routed into a
nonexistent plugin query. Read and update proxies now handle normal function
coercion like the existing API proxy. A legitimate plugin `read.name()` still
works; the existing serialization-safety test covers both behaviors.

### Final runtime and test evidence

- A fresh source-first server on port 3109 served the final source after registry
  generation completed. Flags: `PLATE_WWW_PLITE=1`, `PLATE_WWW_DEV_SOURCE=1`,
  `PLATE_WWW_DIST_DIR=.next-ai-preview`; checkout `/Users/zbeyens/git/plate-2`.
  Browser executable: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.
  The user's port 3000 process was left untouched.
- All eight `ai-session.spec.ts` scenarios pass in 42.3 seconds, without retries
  or skips. The cases verify Generate and Edit selection previews on a narrow
  viewport, Continue writing from a heading and empty paragraph, full rich MDX,
  retained Editing, purple draft paint, no pending authored records, visible
  stream indicator, source preservation, Discard, retry, Accept, subsequent
  native typing, undo/redo and the existing Copilot flow.
- Native Chrome separately replayed Enter after `AI Menu` → Space → Continue
  writing → Discard → Space again without reselection → Continue writing →
  Accept → type `!`. The complete sentence rendered purple during review,
  Editing persisted, the blank source line was hidden, and the accepted text
  had the native caret at its end. The final MDX replay also displayed rich
  purple content in Editing; Discard returned focus to the editable with the
  empty-paragraph caret at offset zero and no draft or pending records.
- The final MDX browser measurement is 3,996 ms from the preset click through
  completed output, with a 66.6 ms maximum animation-frame gap. This is one
  local development-server sample, not a production latency guarantee.
- Plate core passes 520 tests across its two runner groups. AI React passes
  68 tests. The combined action/submit, rich Markdown/history integration and
  React lifecycle check passes 82 tests. After the final proxy correction,
  the affected lifecycle/core facade group passes all 51 tests (321 assertions).
  These groups overlap and must not be added into a unique-test total.
- The existing 15 rich Markdown stream cases still compare their complete
  accepted fixtures. Obsolete `streamSerializeMd.slow.tsx` and
  `streamDeserializeMd.slow.tsx` tests were deleted because their partial-chunk
  feedback APIs were deleted. Current draft/apply behavior is covered in the
  retained stream fixture and history suites. Lifecycle assertions distinguish
  draft content from source content; changed/deleted targets, named roots,
  foreign edits and explicit Suggestion application retain behavioral coverage.
- Scoped formatting/lint and `git diff --check` pass. Registry generation
  produces 320 canonical payloads and 15 sparse overlays. Docs checks,
  frozen-lockfile install/mirror generation and Plate Next v203 validation pass.
  The generated registry payloads are included.

The earlier final-browser attempt was interrupted by registry generation
temporarily removing `registry.json`. It is retained as invalid evidence in
`browser-registry-interruption.log`. The successful eight-case run occurred
after generation and server restart, without concurrent heavy checks.

### Final scale comparison

Three fresh-process samples per cohort exercise the production `setPreview`
path with 128-character chunks and final application included. Source identity,
unchanged mode and complete output are correctness guards. All frozen gates
pass; no cohort requires another noise sample.

| Output | Source paragraphs | Baseline median | Final median | Final maximum publish |
| --- | ---: | ---: | ---: | ---: |
| 1 KiB | 1 | 30.09 ms | 22.92 ms | 2.34 ms |
| 1 KiB | 1,000 | 126.04 ms | 28.10 ms | 4.96 ms |
| 10 KiB | 1 | 313.13 ms | 161.98 ms | 3.85 ms |
| 10 KiB | 1,000 | 1,142.82 ms | 173.65 ms | 4.99 ms |
| 100 KiB | 1 | 25,919.93 ms | 10,063.94 ms | 29.36 ms |
| 100 KiB | 1,000 | 37,548.89 ms | 10,281.88 ms | 39.14 ms |

These are complete-operation package costs, separate from native browser
timings. Whole-response parsing remains measurable for very large output;
the result justifies reuse within the frozen budget, not an unbounded scaling
claim. The portable `candidate-probe.test.ts` and all raw samples are retained.

### Limits and accounting

Broad TypeScript gates are not green. AI entrypoint project references encounter
existing TS6307 errors in Plite authored checkpoint dependencies. Direct `www`
TypeScript has only the unrelated stale helper names at `comment.spec.ts:390`
and `:395`; the integration project has the unrelated `history` API enumeration
contract at `editor-api-inference.contract.ts:37`. The affected AI diagnostic
errors discovered during adoption were repaired. No full-repository typecheck,
full main-runtime comparison, or exhaustive AI/Copilot audit is claimed.

The native user-profile replay also logged a hydration mismatch identifying an
injected `darkreader--sync` style element. The controlled eight-case Chrome
suite did not report that error. The extension setting was left untouched;
native interaction results are not a claim that this profile has no console
errors. The owned port 3109 server was stopped after proof.

The decision and immutable follow-up review record are
`2026-09-16-ai-preview-adoption`. The global AI scope remains proof-partial.
Best API teaching, Plate Vision, English/Chinese AI reference docs and the
existing AI release note describe the adopted ownership. Doctrine version 203
preserves prior history and attestations; mirrors are regenerated.

Receipts are in [ai-preview-ownership](artifacts/ai-preview-ownership/), including
the final browser log, native-case screenshots, timing, package measurements,
typecheck limits and [source identity](artifacts/ai-preview-ownership/final-source.json).
The final source manifest SHA-256 is
`c5195ea3ec6425cf1786d0ef40ce2c895ba54600ffb7f64f12fb9a81156ee502`.
No commit or publication was requested or performed.

## Dismissal correction and complete AI behavior audit

Source: the user reports that leaving an unaccepted AI response retains its
highlight and requests an audit of all AI regressions versus `main`.
The previous complete-interaction claim is revoked for this delta. Earlier
content, mode, indicator, explicit Discard and application/history evidence
remains historical evidence, not proof of implicit dismissal.

Baseline: local `main` at `cce36d378b2f1e5c775dafe1a67c2215165c982c`.
Use the current `next` checkout. No publication or unrelated cleanup is
authorized. This is a complete behavior audit plus repair of reproduced regressions;
an unproved audit finding is not silently labeled fixed. Existing source-first
proof and the user's server remain distinct.

- [x] Reproduce leaving an unaccepted response through Escape and outside click
  on `/docs/ai`; assert draft/highlight removal, unchanged source/history,
  preserved destination focus/selection and subsequent input.
- [x] Repair the canonical dismissal lifetime, including in-flight cancellation
  and late-response fencing, while preserving Stop, retry and explicit Accept.
- [x] Compare all materially distinct AI jobs against main: entry/commands,
  selection/block/table application, streaming/rendering, dismissal, lifecycle,
  transport/errors/prompts, comments, Copilot and the Markdown streaming demo.
  Give every audited unit a source-backed disposition and proof limit.
- [x] Reassess ownership where the comparison exposes a recurring protocol
  failure; retain the temporary draft target only if the new evidence supports it.
- [x] Run affected executable checks, final native Chrome replay and registry
  generation; preserve every passing earlier requirement and report unresolved
  broader audit findings explicitly.
- [x] Reconcile the decision and immutable review history with final evidence.

Writer ownership: lead owns final integration and closure. Bohr completed the
package targets and canonical cross-leaf slice fitter; Galileo completed the
streaming fixture, demo composition and semantic browser assertions. Both
workers released ownership and were closed before final integration.

Failed-fix kind: `reporter-contradiction`. Escape: `hide` only sets `open: false`;
the hide test never creates a draft, and browser proof uses explicit Discard.
Main's `hide` calls reset with undo by default. Initial strongest cut: one
dismissal owner releases the temporary draft; no UI-only highlight suppression
or source-document undo is necessary. Native Chrome reproduced draft retention
after Escape. Package, React and both exact-route browser cases failed before
the fix; the first dismissal cases passed after it. The later target-capture change
invalidated that proof; the final repaired run below supersedes it.


### Main comparison inventory

This inventory covers the distinct current AI jobs, not every combination of
root, browser, provider and concurrent edit. Main is inspected at the frozen
local ref; no full main-runtime replay is claimed. “Retained” is a source
comparison, with executable proof listed separately at closeout.

| Job | Comparison and disposition | Proof / limit |
| --- | --- | --- |
| Mod+J, empty-block Space, slash, context, fixed/floating toolbar | Retained entrypoints; availability follows installed features | Space effect initially lost the mounted selection; repaired from its committed target. Native docs entry and exact browser proof; not every toolbar replayed |
| Continue writing from heading/empty paragraph | Temporary purple inline draft; preserves Editing | Both exact browser cases pass on settled source |
| Generate Markdown and rich MDX | Retained rich codec path; no stream serialization feedback | MDX integration and full sample browser case |
| Selection edit/translation/summary/tone presets | Retained command prompts; multi-paragraph draft/application regression found | Repaired; package and cross-paragraph browser acceptance/undo pass |
| Partial single-block replacement | Retained | Package probe passed |
| Exact/noncontiguous selected blocks | Retained initial application; retry target regression found | Repaired; focused package cases pass |
| Retry after Stop, including before first chunk | Retained explicit retry; node target lifetime repair required | React retry and exact target package cases pass |
| Deleted target followed by retry | Inherited unsafe fallback can overwrite another block | P1 repair; fail closed instead of retaining main's hazard |
| Moved block selection between show/submit | Regression: stale request paths throw | Repaired; focused package cases pass |
| Selection changed after show | Regression: prompt and target can disagree | Repaired; focused package cases pass |
| Insert below with block formatting | Regression: selected heading formatting lost | Repaired; focused package cases pass |
| Table-cell response refs | Regression: placeholder serialization erases captured refs | Repaired; focused package cases pass |
| Accept, insert below, replace selection and undo | Retained single ordinary history batch; explicit Suggesting respected | Package integration and browser acceptance/history |
| Escape and outside-click after response | Regression: hide kept draft; fixed canonical cancellation/discard | Two exact `/docs/ai` browser cases, source/history/caret/follow-up typing |
| Stop while text is buffered | Regression: streaming flag cleared before adapter flush | Repaired stop ordering and buffered flush; React regression passes |
| Network error details | Regression: adapter omitted error | Restored error publication and error callback subscription; React test |
| Replacement while old request streams | Inherited unsafe transport overlap | Per-request SDK instance, transport abort and late-data/text/finish test |
| Readonly, detach, remount, transport replacement, multiple views/editors | Retained writable-view ownership | Existing React lifecycle matrix |
| Purple preview and streaming end indicator | Earlier regressions repaired; temporary UI remains distinct from authored changes | Package/browser paint and indicator checks pass; native purple preview/dismissal replay passes |
| AI comment target mapping and asynchronous create | Retained mapped package draft ownership | Async success/null/rejection/readonly/unmount/replacement matrix |
| AI comment Accept/Reject/close/new request | Regression: UI selected every comment draft | Request-owned IDs; 4 tests preserve unrelated manual drafts |
| Comment command in standalone AI demo | Main availability lost through generic demo composition | Restore only AI demo's optional composition; shared EditorKit stays comments-free |
| Copilot automatic/manual triggers and eligibility | Retained configured transport and collapsed end-of-block guards | Existing package cases; actual provider untested |
| Copilot ghost, formatted Tab accept, Escape and undo | Retained | Existing browser case and package suite |
| Copilot partial word/CJK, prefix typing/IME, readonly/detach/error | Source comparison retained | Package cases; native IME and all partial-accept undo combinations remain unproved |
| Copilot installation outside its own demo | Intentional user-directed removal | `2026-08-14-scope-copilot-kit-to-demo.md`; do not restore |
| Markdown streaming modes/controls/scenarios | Regressions: obsolete columns tag and static output never rerendered | Correct tag plus canonical runtime subscription replacing manual forceUpdate; editable/static semantic browser proof |
| Demo/provider routes and copied registry endpoints | Tracked provider routes delivered by registry; site wrappers ignored on both refs | Local demo exercised; fresh-checkout wrapper delivery and live provider remain unproved |
| AI reference server example | SDK 6 adoption left obsolete message conversion/response APIs | Updated both locales against installed SDK source; docs checks; live provider untested |
| ReplaceSelection menu visibility | Unreachable in both main/current menu groups; package action exists | Inherited UI policy, no new regression established |

### Architecture reassessment

Keep the temporary draft and cut overlapping lifetimes. `hide` terminates the
session; `stop` retains received output. One request binds prompt, stable target,
transport callbacks and generated comment IDs. A new response cannot inherit an
old request's callbacks or select another location after deletion. The SDK's
callback contract has no request identity, so one SDK chat instance per request
is the smallest isolation boundary; conversation messages remain editor-owned.
No new public draft/branch/projection primitive or source-document rollback is
justified. The repeated miss was incomplete lifetime/application proof, not a
reason to put previews back into persistent authored changes.


Additional failure-loop evidence: the new columns browser test revealed a
separate static-render failure after the fixture spelling was fixed. Progress
reached 33/33 while Editor Output stayed empty. Existing stop tests passed with
an empty output because their oracle only compared two snapshots. Keep that
failed run and screenshot. The repair reuses `useEditorRuntimeState` with a
readonly view, as the canonical AI preview already does, and deletes manual
`forceUpdate`; the semantic output test remains in both rendering modes.


Core escalation: AI's explicit open slice exposed the canonical fitter refusing
cross-leaf text replacement. `["one", "two"]`, range `[0,0]:1 → [1,0]:2`,
replacement `NEW` must yield `oNEWo`; all valid slice edge combinations returned
false. A bounded probe identified same-text-path candidate guards in
`packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts`. Repair belongs
there, retaining schema/void/boundary checks, with direct slice and AI regression
proof. Do not hide this behind feature-local text concatenation.

The intermediate 12-case streaming browser run proved static output but one
mode case was invalidated by a development refresh during parallel core edits
(the selected lists scenario reset to the default columns before streaming).
Final browser closure must use a frozen source set and supersedes that run.


Final target-capture failure: the first combined browser run passed 20/24,
with all four failures using Space in an empty paragraph. Temporary diagnostics
showed `captureTarget` receiving null selection from the root owner even though
the mounted view had a caret. The command effect already carried its authoritative
selection; opening now passes that selection into the same private session owner.
It does not add a public API or reinstate the deleted-target fallback. The final
AI session replay passes all 11 cases, including both dismissal paths and rich
MDX. Earlier green dismissal evidence is not substituted for this repaired run.

Native Chrome replay on final source: heading-end Enter → Space → Continue
writing → complete purple draft → Escape yields zero preview elements and zero
authored-change records, a focused editable, and the caret at the empty paragraph.
Typing `!` without refocusing inserts there. The automated outside-click case
also checks the chosen destination and subsequent typing/undo. Native screenshots
are in the task transcript; the DOM observations are preserved in
`artifacts/ai-main-regression-audit/native-chrome-dismissal.json`.

Settled AI package/React/integration run: **154 passed, 0 failed, 20 files**.
The source-only AI entrypoint typecheck passes. Source-only Plite core typecheck
and protected-boundary checks passed in the independent worker receipt; final
core and remaining browser results are recorded at closure below. The final AI
browser run passes **11/11 in 58.4 s**. Full MDX completes in **3207 ms**, maximum
frame gap **58.4 ms**, on the local source-first dev server; these are local
measurements, not live-provider or production latency claims. Registry generation
passes (320 canonical items, 15 overlays), docs parity passes, and doctrine v204
validation plus regenerated mirrors pass.

Broader gates remain visibly limited: the www typecheck reports two existing
comment-browser harness names, and the project-reference lane reports existing
Plite authored TS6307 diagnostics. No whole-repository typecheck pass is claimed.
Live provider/gateway execution, fresh-checkout site-wrapper delivery, native
IME/CJK and all concurrent/root combinations remain unproved. Main is a frozen
source comparison, not a complete runtime baseline.


Closure: final core checks pass **135/135 across 7 files**; remaining streaming
and layout browser checks pass **13/13 in 26.5 s** on the same settled source.
Together with the AI runs, this is **289 focused package/core/React tests and
24 browser cases**, plus the native Chrome reporter replay. Both source-only
entrypoint typechecks pass. No fixture-output or HMR-invalidated run is counted.
The decision, all-job inventory and immutable review record are reconciled;
review remains adopted with partial feature-wide proof, for the limits above.
No commit, push, PR or user-server change was performed.

## Generate Markdown final-scroll correction

Source: the user reports that Generate Markdown sample completes but leaves the
editor at the wrong scroll position and asks for direct interaction proof.

Outcome: the generated Markdown tail and its review controls finish inside the
editor scrollport without mutating the source document. Keep the earlier AI
dismissal, streaming, mode, cursor, history and performance acceptance intact.

- [x] Reproduce the exact `/blocks/ai-demo` empty-list-item → Space → Generate
  Markdown sample path in native Chrome. Before repair, completion stopped near
  Task list item 1 while later equation, code, rule and table content remained
  below the scrollport.
- [x] Add a two-sided browser oracle for the final generated endpoint relative
  to the actual nearest scrollport; preserve unchanged model content. The test
  fails before the repair with `{ top: true, bottom: false }`.
- [x] Repair the rendered-preview owner rather than the command menu or editor
  document. Scroll follows the committed preview view, including its completion
  commit, instead of the earlier transport document/status notification.
- [x] Re-run the exact browser case and native Chrome path on the candidate.
  Chrome finishes on the final table rows with Accept/Discard/Try again visible.
- [x] Run the settled AI browser suite, scoped lint/type checks and required
  registry generation; preserve source identity and stop the task-owned server.

Verification surface: `apps/www/tests/browser/ai-session.spec.ts`, native Chrome
at `http://localhost:3111/blocks/ai-demo`, source-only www typecheck, scoped
Ultracite, registry generation and `git diff --check`. Completion requires the
new exact case plus the full AI browser file green on final source, final native
tail visibility, generated registry output and cleanup. Block only if the exact
route cannot run after the owned server/source prerequisites are repaired.

Final evidence: the pre-fix exact test rejected `{ top: true, bottom: false }`.
The settled AI browser file passes **12/12 in 1.2 minutes**, and the exact case
passes again after formatting and registry generation. Scoped Ultracite and
`git diff --check` pass. Registry generation materialized 320 canonical payloads
and 15 sparse overlays. The broad www typecheck remains limited only by the two
pre-existing missing comment-browser helper names in `comment.spec.ts`; no whole
www typecheck pass is claimed. Native Chrome on the generated source finishes
with the final table rows and Accept/Discard/Try again inside the editor
scrollport. The task-owned port 3111 server is stopped.

Source receipt after registry generation:

- `ai-menu.tsx`: `e78178d387639b59b6fca3fce5402741d04da3646dce1c06efcd3b82b2085c2a`
- `ai-session.spec.ts`: `133394232d2558c7f9e91bfb01b159227c747b813246aa61b22ef57b59cbede8`
- `public/r/ai-menu.json`: `bc7767ab3e80b5f3eab425e6d10323a7a07c1aeddd1bbd774e7ae40700d83769`
- `public/r/registry.json`: `957237bab39679fc2ba3f2f658b492486d2acdafd4ee6808b3ae74ab8d3c27ca`

Next action: none; the final-scroll correction is closed.

### Docs-embed review-menu follow-up

The first fix and test covered the generated endpoint but not the portaled review
menu. Native Chrome reproduced the reporter's exact bounded docs embed: the
table ended inside the editor while Accept/Discard/Try again rendered below the
editor over page content. The expanded oracle failed only the menu's bottom
bound. Centering the committed endpoint leaves room for the complete review menu
inside the same scrollport. The exact case and final native replay pass after
registry generation; the source document remains unchanged.


Final formatting check found two brace-layout issues in the transport files.
Their repair changes whitespace only (verified exact equality after removing
whitespace); runtime proof is reused, with before/after fingerprints retained in
`artifacts/ai-main-regression-audit/formatting-receipt.json`. Registry output was
regenerated after stopping the task-owned port 3110 server. The immutable audit
record remains preserved; a closure record captures the formatted source.
