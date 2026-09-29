---
review_scopes:
  - conversion-boundary
  - format-mappings
review_basis:
  - 2026-09-28-conversion-boundary-value-review
  - 2026-09-28-format-mappings-value-review
work_kind: implementation
---

# Conversion boundary adoption

Status: Complete — parser and publication reuse is adopted and every end state is met; end-to-end streaming performance stays open on static preview rendering (see Open risks). The execution program closed on 2026-09-29 after a review pass; see Completion Gates and the Execution log

**Executed.** The design sections below are the settled contracts. Amendments
made during execution are recorded where they apply and in the
[Execution log](#execution-log). The streaming hint is adopted on the S5
verdict-2 matrix, and the other end states met their gates.

User authority:
- The 2026-09-28 “go” accepted the design.
- “Go fully execute all until nothing left” authorized the execution program,
  and “never ask for approval” covered the repairs made during it.
- No staging, commit or publication was authorized; the user owns commits on
  `next`.

Objective:

Put common conversion laws at their existing owners, delete false fidelity
inference, carry the accepted declarative mappings into adoption, and bound the
Markdown reuse experiment without promising general tail-only parsing.

Completion threshold:

The design is complete when each requirement has an owner, a target or an
explicit evidence gate, caller adoption and a falsifiable proof obligation;
the review history is reconciled and the planning checks pass. Full execution
readiness additionally requires the S0 receipts. A failed optimization experiment
does not close the user's streaming performance problem.

Verification surface:

Live format, schema, transfer and consumer sources; the source-bound
[boundary review](../analysis/2026-09-28-conversion-boundary-review.md);
the accepted [mapping design](2026-09-28-format-mapping-authoring.md);
plan completeness, local links, file-scoped lint and review-ledger checks.
Runtime commands below are future execution proof, not results of this task.

Constraints:

- Retain the dialect, micromark/MDAST, ordinary typed editor methods and broad
  standalone `Value` results. No universal AST, public conversion pipeline,
  safety plugin, cache service, compatibility alias or unchecked value generic.
- Preserve prior failed observations. A new experiment receives a new receipt;
  it cannot complete the abandoned five-pair run retroactively.
- One mutable resource has one writer. The three bounded worker notes supplied
  design input; this plan is the durable decision owner. Their ignored scratch
  files are not required evidence.
- No staging, commit, publication, new task or external message is
  authorized; the user owns commits on `next`.

Boundaries:

Plate owns semantic mappings, role-aware conversion safety, loss accounting and
format diagnostics. Plite retains schema/fitting and atomic insertion; its
DOM/React layer carries neutral paste outcomes to the initiating mount.
Consumers own preview cadence, cancellation, acceptance and undo.

In scope: HTML/Markdown ingress and egress, DOCX adapters/source eligibility,
native and registered transfer ingress, shared property accounting,
declarative Markdown mappings, the unused detached HTML slice API, streaming
correctness and its measured adoption gate.

Non-goals: a parser-engine replacement, dialect change, full HTML mapping
redesign, arbitrary React-renderer fidelity, AI product UI/prompts, Yjs,
application fetch authorization, URL policy on arbitrary strings, or comprehensive
security certification of browsers and Word.

Blocked condition:

No missing user decision prevents this design. Runtime optimization acceptance
is gated by S0/S5 evidence, not elapsed time or permission. Unknown syntax,
stateful extensions and unsafe/unverified DOCX source must take the specified
fallback/refusal; they are not reasons to weaken a law.

Mode:

Standard design using the completed review. Primary template: Plate Plan;
Plite ownership applies to neutral transfer/React delivery.
Applied pack: performance-observability, consolidated in the scale contract.

## Amendment: second pass

Evidence: [amendment probes](../research/probes/2026-09-28-conversion-boundary/amendment/REPORT.md).
These decisions supersede the matching rows and sections below; decisions
without an amendment stand.

**A1 Streaming (replaces the D9 candidate and D10; S5 adopts this candidate).**

- Reuse converted segments, not syntax. The Markdown runtime splits the
  accumulated source at blank lines whose container state is closed, converts
  each completed segment once and reparses only the open tail.
  - A split is refused inside an open fence, math block, raw HTML block or
    registered block tag, and after a list or indented line.
  - A source containing a reference or footnote definition takes the full
    parser.
  - An invalid prefix takes the full parser without disabling later reuse.
  - Diagnostics keep whole-source locations.
- Parser identity becomes a contract. With a valid `previous`, completed
  segments return the identical node objects, and consumers publish by splicing
  from the first non-identical top-level node instead of replacing the value.
  The AI preview and the non-AI demo are the current consumers. The probe's
  splice uses only `tx.nodes.remove` and `tx.nodes.insert`.
- Evidence:
  - 3,730/3,730 previews deep-equal a fresh partial parse, across 26 fixtures
    and 26 chunkings each.
  - Rich 10 KB: parse 990 → 100 ms, publish 3,550 → 1,010 ms.
  - Rich 50 KB: parse 24.6 → 0.72 s, publish 88.3 → 22.2 s.
  - CJK transcripts show the same shape.
  - Previews and published values are identical in every pair.
- Rejected: syntax-only reuse over a plain-ASCII paragraph and ATX-heading
  alphabet.
  - Tokenizing is about 20% of a parse (104 of 522 ms on the large cohort).
  - The alphabet excludes rich AI output and all non-ASCII text.
  - Fitting and publication would stay O(n) per chunk.
- Still owed before adoption (S5):
  - invalidation when compiled mappings or captured plugin state change
    between calls;
  - aggregate limits across segments;
  - the unchanged strict final parse;
  - the browser, consumer and memory matrix already specified.
- A separate owner: a tail-only splice still costs 48 ms at 1,179 top-level
  nodes, because Plite's per-transaction document change rebuilds
  document-index tokens and asserts the JSON value. That is O(document) per
  update and bounds every large-document edit, not only streaming. It needs
  its own Plite and Benchmark plan.

**A2 Loss severity (amends D5).**

- Property loss warns and content loss rejects. Under `reject`, conversion
  fails when nodes, text, media or captions would be dropped. An unrepresented
  property is a warning under every policy. This keeps the tested Markdown
  contract that warns about a property Markdown cannot carry instead of
  failing.
- Evidence: an aligned paragraph, line height, text indent and a link pasted
  from HTML each export today with one warning.
  - Under the original D5 each would fail.
  - `AIChatPlugin`'s `requireMarkdownData` and the registry AI prompt builders
    serialize with the default policy and throw on failure.
- Stop inventing the most common lost property: Link's HTML decoder writes
  `target: '_blank'` for every pasted link (`BaseLinkPlugin.ts:257`). Import
  keeps an absent target absent.
- DOCX export's new `lossPolicy` follows the same split.

**A3 Property accounting (amends D2).**

- Keep D2's `preserve(...)` claims for custom encoders and exact generated
  claims for declarative tags, guarded by a round-trip conformance harness in
  tests. Every first-party mapping's fixtures serialize, parse back and fail
  when a property is lost without a report or a claim is false.
- Runtime verification by decoding is rejected as a default. A text round trip
  costs 4.7× serialize, and conversion is about 80% of parsing.
- Fix runtime-owned list accounting. The probe found `indent` and `listStart`
  lost without a report in 6 of 44 fixtures, because the list serializer claims
  every list property.
- With A2, a forgotten claim produces a warning instead of a failed export,
  and the harness catches it in CI.

**A4 Legacy unsafe values (amends S2's migration obligation).**

- The v54 migration neutralizes an unsafe legacy active value with the same
  lossless cleanup import uses: a link unwraps to its label, and media keeps
  its alt text and caption. It does not reject the document.
- Migration steps have no diagnostic channel, and under this plan's safety law
  that cleanup is lossless, so none is needed. One stale destination never
  makes a stored document unloadable.

**A5 Navigation floor (amends D4's navigation row).**

- The navigation floor rejects script-capable and malformed destinations
  (`javascript:`, `vbscript:`, `data:`, controls, authority-relative forms)
  instead of admitting only HTTP(S), `mailto` and `tel`.
- `allowedSchemes` stays the documented way to widen or narrow navigation at
  admission and rendering, so app deep links such as `vscode:` remain possible.
  `dangerouslySkipSanitization` is still cut.
- Resource roles (image, audio/video, file, embed) keep their allowlists
  because they load automatically.

**A6 Scope (moves D6 and D7 to their own lanes).**

- Retained-DOCX-source eligibility (D6) and paste feedback delivery
  (`Editable.onPasteResult` in D7) run as lanes D1 and T1 of the
  [execution program](#execution-program-to-completion), apart from the
  formats lane. The formats slices keep only their safety and diagnostic
  obligations:
  - retained bytes never bypass the safety check, so exact-source reuse
    regenerates until lane D1 proves eligibility;
  - transfer decoders gain `report(diagnostic)`, so conversion diagnostics are
    no longer discarded.
- Lane D1 carries a deletion gate: if positively eligible files are a small
  share of the licensed corpus, delete exact-source retention instead of
  maintaining an inventory that rejects most files.

## Execution program to completion

This is one run from S0 to closure with no further handoffs. It absorbs the
[mapping plan](2026-09-28-format-mapping-authoring.md): that plan's S1–S3 run
inside S1 here, and its S4 inside S6. Detailed obligations stay in the slice
rows and sections below; this section owns the order, the lanes and the end
state.

| Phase | Lane (single writer) | Work | Starts after | Done when |
| --- | --- | --- | --- | --- |
| 1 Baseline | Benchmark | S0 | Execution authority | Frozen receipts recorded, and the A1 candidate passes the prefix and splice oracles with invalidation and aggregate limits |
| 2 Build | Formats: Plate Markdown and HTML mappings and plugins | S1 → S2 → S3's HTML cut | S0 | Their slice exits pass |
| 2 Build | Transfer: Plite DOM/React and Plate adapters | S3's decode `report()` → T1 | S0 (T1 also needs S2's diagnostic facts) | Their exits pass |
| 2 Build | Consumers: streaming demo and AI lifecycle | S4 | S0 | S4's exit passes |
| 2 Build | Plite runtime | P1 | S0's edit-latency receipt | P1's exit passes, or its law is recorded |
| 2 Build | DOCX | D1 | S2's safety function | D1's exit passes, or retention is deleted by its gate |
| 3 Adopt | Markdown and Benchmark | S5 | S1, S4 and P1 | S5's exit passes, or the candidate is rejected with its receipt |
| 4 Close | Docs, doctrine and verification | S6 | Every lane done or rejected by its gate | The end state below holds |

Lanes run in parallel only while they own disjoint files. The formats lane is
the only writer of Markdown/HTML mapping and feature-plugin files.

S0's frozen receipts:

- the tracked Markdown benchmark;
- current streaming on rich and CJK transcripts at 10 and 50 KB;
- a large-document edit-latency baseline;
- the accounting and safety traversal comparisons;
- an inventory of DOCX fixtures that have a valid license.

The three new lanes:

- **P1 Plite per-transaction cost** (Plite core and Benchmark; Plite Plan
  design first). An update that touches k nodes should cost roughly O(k)
  instead of rebuilding document-index tokens and asserting the whole JSON
  value.
  - Receipts: the tail splice at 1,179 top-level nodes (48 ms today), typing at
    the end of a 50 KB document, and the S5 streaming matrix.
  - Correctness: existing plitejs suites plus history and collaboration
    invariants.
  - If the whole-document work is a hard law, record it and keep streaming's
    publication cost as a named limitation.
- **D1 DOCX retained source**: the closed passive vocabulary and eligible-or-null
  source from "Retained DOCX source".
  - Measure the eligible share on the licensed fixture inventory.
  - If it is small, delete exact-source retention (`retainSource`, the source
    handle and the registry import option) instead of keeping an inventory that
    rejects most files.
- **T1 Paste feedback**: `Editable.onPasteResult`, `EditorContent` and the
  registry toast, as specified in "Paste result".

The run pauses only when:

- a gate's failure needs a product decision this plan doesn't settle;
- the same invariant fails again after a repair, which routes to Best API
  Review before another patch;
- a required capability is missing, such as a Chromium runner (record the gap
  and continue the other lanes);
- the user pauses it.

Repairs, reruns, doctrine and doc repair, registry regeneration and ledger
records all continue without asking.

Lane ownership during parallel execution (one writer per file set):

| Lane | Owns | Must not edit |
| --- | --- | --- |
| Formats (lead) | `packages/platejs/src/{markdown,lib/plugins/html,features,lib/plugin,migrations,core}`, the Plate HTML entrypoints, the conversion plans, doctrine, public docs and ledger | Files owned below |
| P1 | `packages/plitejs/src/core/**` transaction, change, snapshot and value-codec internals and `history/**` | Plite `dom/**` and `react/**`; all of `platejs` |
| T1 | `packages/plitejs/src/{dom,react}/**` transfer and paste delivery, Plate `EditorContent`, the registry editor toast | Plite `core/**`; Plate format decoders (the lead wires them in S3) |
| D1 | `packages/platejs/src/docx/**` (export `lossPolicy`, static-output checks after the shared URL decision lands, retained-source eligibility) | Everything outside `docx/**` |
| S4 | `packages/platejs/src/ai/react/**` lifecycle, the registry AI menu and streaming demo | The Markdown runtime (the lead adds `previous` in S5) |

Lanes run focused tests for their own files, write receipts under
`docs/research/probes/2026-09-28-conversion-boundary/lanes/<lane>/` and report
back. Only the lead regenerates the registry, runs `pnpm brl` and root gates,
and edits this plan, doctrine and the ledger.

End state:

1. **Mappings:** 11 element and 13 mark declarations; no `mark` flag and no
   read Proxy. `preserve` claims are covered by the round-trip conformance
   harness in CI, and list accounting is exact.
2. **Loss:** property loss warns and content loss rejects in Markdown, HTML and
   DOCX export. Link import keeps an absent `target` absent.
3. **Safety:** one role policy runs through feature validators at every
   admission. The navigation floor keeps `allowedSchemes` widening. Output and
   retained bytes are checked, and migration neutralizes legacy unsafe values.
4. **Transfer:** decoders report diagnostics; the initiating editor's
   `onPasteResult` and the registry toast show a lossy paste once.
5. **Streaming:** converted-segment reuse with invalidation and aggregate
   limits, and consumers splice. The joiner is deleted if its separate
   measurement allows. The Chromium streaming matrix meets its frozen budgets
   at 10 and 50 KB for rich and CJK text.
6. **Plite:** per-transaction cost is proportional to the change, or its law
   is recorded.
7. **DOCX:** exact-source reuse happens only for positively eligible packages,
   or retention is deleted by its gate.
8. **Surface:** detached `parseHtmlSlice` is cut.
9. **Closure:**
   - English and Chinese docs, doctrine versions, changesets, registry output
     and barrels are current.
   - Package, www and browser gates pass.
   - Both plans' ledger execution records are reconciled.

### Execution log

- 2026-09-28: execution authorized. Lanes P1, T1, D1 (phase one: export
  `lossPolicy` and eligibility) and S4 start in parallel with the formats
  lane's S1.
- 2026-09-29: lane S4 found that `value.replace` throws "Document replacement
  cannot mix with ordinary writes." on authored editors when a correction such
  as TrailingBlock's writes in the same transaction. The shipped
  `markdown-to-editor-demo` fails for Markdown ending in a table or columns.
  Decision: corrections fold into the loaded replacement, and ordinary writes
  mixed with a replacement still throw. New lane **authored** owns
  `packages/plitejs/src/authored/**` for the fix.
- 2026-09-29: S1 finding that amends D2. Owner-only tag attributes drop media
  alignment (`<audio textAlign="center">`), which AI output relies on and
  `streamHistory.slow.tsx` tests. The List counterexample behind owner scoping
  is solved by list containment instead: every block with `listType` is
  written as a list item, and the list claims its own keys. Amended law: tag
  attributes carry the element's non-metadata properties (owned ones under
  their `attributes` names, others under their keys), except those the
  enclosing list represents.
- 2026-09-29: S1 implemented.
  - Declarations: 11 element tags (toc, column, columnGroup, callout,
    summary, details, codeDrawing, audio, file, video, mediaEmbed) and 13 marks
    are callback-free. `mark` and the read Proxy are deleted. Mark roles come
    from the schema; writers are compiled per value, and the hard-coded
    bold/italic/strikethrough/code switch is gone.
  - Claims: custom encoders use `preserve(...)`. Custom tag encoders (Image)
    use `encodeNodeAttributes()`, the same codec derived tags use. Encoders
    return their claims, and containers report once after composing owners.
  - Lists: claims are exact per item (depth-based `indent`, first-item
    numbering, task checkbox only with paragraph content). Paragraph and image
    blocks with `listType` are written as list items. An ordered list's start
    decodes to `listStart`, or to `listRestart` when it directly follows
    another ordered list (new `previousSibling` on the decode context).
  - Loss: unmapped marks and refused mark wrappers warn as
    `markdown-property-omitted` under every policy (A2). Link HTML import keeps
    an absent `target` absent.
  - Details check: the grammar never produces a paragraph-wrapped `<summary>`
    (inline-position block tags stay literal HTML), so Details' unwrap is
    deleted.
  - Proof: Markdown partition 197/197, including the new round-trip
    conformance harness (`markdownConformance.spec.ts`, 34 fixtures). A
    mutation check shows the harness fails on a false claim. Feature, slow and
    www Markdown suites 947/947, type contracts and schema-adoption checker
    tests pass.
  - Pre-existing, not S1: `serialize-html.roundtrip.slow.ts` fails because the
    static paragraph renders as `div` while the paragraph HTML mapping matches
    only `p`. The schema-adoption checker also reports extend-chain allowlist
    drift in files S1 did not change. Both are reconciled at closure.
  - Benchmark (HEAD baseline worktree vs HEAD + S1 files, receipts in
    `lanes/formats/s1-benchmark-*`): adoption passes. Legacy parse is 0.94–1.03×
    and serialize 0.94× of baseline. The absolute B4 inline-tag doubling budget
    fails at 3.3×, the same as the dialect adoption receipt already recorded,
    so it predates S1.
- 2026-09-29: S2 core landed in the formats lane.
  - One private role policy (`internal/utils/urlPolicy.ts`, `decideUrl` and
    `isStoredUrl`) now backs versioned schema validators: Link `url` uses the
    navigation floor, Image `url` the image role, Audio and Video `url` the
    media role, File `url` the file role, and MediaEmbed `url` the embed role.
    Video and MediaEmbed `sourceUrl` use navigation.
  - Link admission, insertion and rendering take one decision with
    `allowedSchemes` above the floor. `dangerouslySkipSanitization`,
    `permitInvalid` and the public `sanitizeUrl` are deleted.
    `defineMediaPlugin(kind, …)` refuses unusable URLs.
  - Markdown: a source pass runs before mappings, so a script link unwraps to
    its label (lossless `markdown-unsafe-content`) and an unsafe image falls
    back to its alt text (lossy). Emitted MDAST gets the same check.
    Registered media tags with an unusable `src` keep their caption.
  - Lanes started: **html-safety** (HTML whole-tree pass for every HTML and
    DOCX entry, reported removals, no-throw output) and **v54-safety** (target
    fingerprints and A4 neutralization). D1 phase two starts on the shared
    policy.
- 2026-09-29: S3 in progress.
  - Markdown transfer decoders parse paste with `allow` and `report()` each
    diagnostic; lane html-safety wires the HTML ones. Detached
    `parseHtmlSlice` is cut from `platejs/html` and `platejs/html/server`, with
    type contracts asserting its absence.
  - Suspected a T1 dedup gap; it was a test-harness artifact instead. T1
    showed that happy-dom classifies the host as WebKit (direct paste) and
    that a copied class stub loses its payload. With a native `DataTransfer`,
    and `beforeinput` sent only after an uncanceled paste,
    `react/markdownPasteResult.spec.tsx` passes, with one lossless report.
- 2026-09-29: S5 runtime (A1) landed in the formats lane.
  - Installed `parse` and `parseSlice` accept `previous` for partial parses.
    Complete segments (blank-line boundaries with closed containers, per the
    probe) are converted once and kept as frozen node objects. A segment
    commits only when its output ends in a block, because normalization joins
    top-level inline runs.
  - Invalidation: the editor, method, compiled mappings, loss policy, limits,
    a source prefix and the store snapshots of MarkdownPlugin and of every
    plugin that owns a Markdown mapping must all match. A mapping callback
    reads only its owner's state, so AI and UI store writes keep the hint
    (S4 found the first, every-plugin key invalidated each streamed chunk).
    Definitions force a full parse, and so does any segment failure, so error
    diagnostics match a fresh parse exactly. Syntax-node limits are budgeted
    across segments. A strict parse ignores the hint.
  - Parsed slices are validated per new segment and marked canonical for the
    editor schema, so insertion trusts them.
  - Proof: `markdownContinuation.spec.ts` checks 7 fixtures × 4 chunkings in
    slice and document modes against a fresh parse at every prefix, plus
    identity, invalidation, foreign and wrong-mode hints, strict parses and
    aggregate limits.
  - Headless timing at 64-byte chunks: rich 10 KB 994 → 69 ms, CJK 10 KB
    1,437 → 76 ms, rich 50 KB 414 ms and CJK 50 KB 510 ms continued. Identity
    holds for slices only; document mode reuses conversion, but fitting
    returns new objects.
  - Consumer adoption (splice publication, hint lifetime, joiner measurement)
    was sent to lane S4.
- 2026-09-29: lane T1 closed ([receipt](../research/probes/2026-09-28-conversion-boundary/lanes/t1/REPORT.md)).
  Transfer decoders `report({ impact, message })` while they run; the
  inserted format keeps its reports and unused formats keep only lossy ones
  unless the inserted format read the same MIME type. `Editable.onPasteResult`
  delivers once per built-in paste to the view that received it, after commit
  or refusal, and `EditorContent` forwards it; the registry editor warns once
  for lossy results. Chromium clipboard and upload specs pass 9/9. Gap: the
  visible toast is not browser-proven because Plite mode mounts no
  `<Toaster />`.
- 2026-09-29: lane P1 closed ([receipt](../research/probes/2026-09-28-conversion-boundary/lanes/p1/REPORT.md)).
  - Per-update cost follows the change: the 50 KB tail splice drops from
    51 ms to 1.3 ms and grows ×1.4 from 5 to 50 KB instead of ×9.7; typing at
    the end drops from 1.12 to 0.81 ms; one saved keystroke after 60 skipped
    splices drops from 386 to 40 ms. Every pair asserted identical values,
    history depth and undo results.
  - Behavior fix: undo after a history-skipped re-insert no longer replaces
    unrelated content (`[two, one']` undid to `[one, one']`); the pinned
    history test now expects `[one, two, one']`.
  - Law recorded: the plain frozen document model allocates a fresh
    `children` array per changed ancestor level, O(siblings) at that level.
    Open: skip replay in `resolveHead` (history owner), the Yjs controller's
    per-commit `inverseChanges.apply` (Yjs owner) and the whole-document
    `RootChange.between` diff.
- 2026-09-29: lane D1 closed ([receipt](../research/probes/2026-09-28-conversion-boundary/lanes/d1/REPORT.md)).
  The deletion gate keeps retention: 20 of 23 repository fixtures (87%) are
  eligible and export byte-identical; nine sibling corpora give 68% (65% of
  Word-authored files). `exportDocx` gains `lossPolicy` (default `reject`),
  `retainSource` yields `source: DocxSource | null`, output passes the shared
  URL decision and the passive vocabulary, and two writer defects are fixed
  (links kept only their first child; GIF/BMP had no content type).
- 2026-09-29: lane authored closed ([receipt](../research/probes/2026-09-28-conversion-boundary/lanes/authored/REPORT.md)).
  Option A: core exposes its settlement boundary (`settle` on the internal
  authored transaction); corrections fold into a loaded replacement, and
  ordinary writes mixed with a replacement still throw. Authored suites
  421/421; the EditorKit repro passes 5/5 (4 failed before). Open: a
  correction that changes a loaded document with retained authored operations
  fails atomically, and a correction after a full replacement raises core
  representation finalization from 41 to 223 ms on a 33 KB, 300-table
  document (Plite core owner).
- 2026-09-29: lane v54-safety closed ([receipt](../research/probes/2026-09-28-conversion-boundary/lanes/v54-safety/REPORT.md)).
  `migrateV54` neutralizes a legacy URL the current schema rejects (A4): a link
  unwraps to its label, media becomes a paragraph of its caption, alt text or
  file name, and an unsafe `sourceUrl` is omitted. Migrations 79/79; the
  generated schema contract fingerprint is `fnv1a64:25a6c19579c99ec6`.
- 2026-09-29: lane html-safety closed. One role decision per HTML URL sink
  (`htmlSafety.ts`, shared `decideUrl`) runs before any mapping reads the tree
  at every HTML and DOCX entry; removals report `html-unsafe-content` with an
  impact, labels and alt text survive, and serialization reports instead of
  throwing. A quadratic eager path computation was removed (392 KB parse
  4.2 s → 0.54 s).
  - Formats-lane follow-ups: HTML now applies A2 (a lost property warns under
    every policy; lost elements follow `lossPolicy`); Link's HTML decoder
    reports a destination `allowedSchemes` refuses and MediaEmbed reports an
    unusable `data-editor-media-url`, both instead of dropping silently;
    `isScriptUrl` moved to the shared policy, and Markdown now reports a
    script image or registered media `src` as a lossless removal, as HTML does.
  - Kept: a resource-loading style removal stays lossy and follows
    `lossPolicy`, because such a style can carry visible media.
- 2026-09-29: lane S4 closed, including S5 consumer adoption
  ([receipt](../research/probes/2026-09-28-conversion-boundary/lanes/s4/REPORT.md)).
  - AI: `hide`, `reset`, `show` and `reload` cancel without publishing;
    `stop()` publishes one strict final; an edit response Markdown cannot
    represent clears the draft instead of throwing. `setPreview` continues the
    latest partial parse and hands the store's earlier copies back, so reused
    blocks keep their identity (55/55 in the real `useAIChat` flow).
  - Publication: the AI preview and the demo's static preview replace only the
    blocks after the first changed one, or the whole value when no leading
    block is shared (a full splice made the CJK 50 KB final 60% slower). The
    demo's editable preview loads with `value.replace`, because the authored
    kit records every node write as an authored change.
  - Measured in-process (AI flow, 64-character chunks every 10 ms, 32 ms
    cadence, previews identical to the pre-S5 plugin): cumulative work falls
    8–29× (rich 50 KB 37.5 s → 1.4 s, CJK 50 KB 70.8 s → 2.4 s); the strict
    final is unchanged within noise.
  - Joiner deleted after its measurement: every fixture improves in latency
    (arrival-to-publish p95 from 8–57 s to 36–41 ms), duration and work
    (24–39% less). Trade-off: rich text shows a literal trailing inline marker
    such as `**ord` in 7–32 previews, each for at most 32 ms.
  - Chromium: streaming lifetime 14/14 with the authored fix; ai-session 18/19
    (the "AI edit review" failure also fails at HEAD).
- 2026-09-29: decisions on lane handoffs.
  - Paste reports keep lossless removals, such as the `<meta charset>` most
    rich clipboards carry: `onPasteResult` stays truthful and the copied toast
    ignores lossless results.
  - Follow-ups outside this plan's end state: `partial` could hide a trailing
    unclosed inline delimiter (the joiner trade-off), and a full partial parse
    could record segments so identity starts at the second preview instead of
    the third.
- 2026-09-29: closure Best API review, first findings fixed.
  - P0: a continued partial parse could split a list item's continuation
    paragraph or a following list from its list (8–42 mismatched prefixes on
    three list sources). A segment now starts only at an unindented line
    without a list marker, and each segment's first node reads the previous
    segment's last root node as `previousSibling`, which mappings may use. The
    three sources and a `previousSibling` mapping are continuation fixtures;
    removing either half of the fix fails them.
  - `previous` is `parseSlice`-only: document parses return new node objects
    after fitting and had no caller, so `parse` and the document checkpoint
    lost it (D9's non-AI document preview uses `parseSlice`).
  - `markdown-unsupported-node` carries `impact`: raw HTML kept as text, an
    omitted comment and a dropped `<block>` identity are lossless (raw HTML
    now warns under every policy); unmapped, refused and dropped content is
    lossy. Plain text such as `Use <div> for layout.` no longer warns on paste.
  - An HTML paste that loses all of its content reports the loss before plain
    text handles it; only a parse failure or HTML that repeats the plain text
    delegates silently.
  - Image's `<figure>` with a script `src` is a lossless removal, like `<img>`,
    through one shared fallback.
- 2026-09-29: closure review, remaining findings.
  - One rule for a removed link destination in HTML, Markdown and DOCX (A2): the
    label stays, so it warns under every policy (`action: 'unwrapped'` in HTML,
    `kind: 'property'` on a Markdown mapping report); it is lossless only when
    the destination could run script (`isScriptCapableUrl`), so a lost
    protocol-relative link still toasts on paste. Link's refusal of an
    `allowedSchemes`-narrowed destination reports property loss.
  - HTML export writes the stored link destination; `allowedSchemes` narrows
    insertion, import and rendering only, as Markdown export already did.
  - `encodeAttributes` claims each property whose attribute the returned output
    keeps (the plan's rule); the plugin-creator typing rule and the Plate Next
    review law teach declarations first. v250 now covers both.
  - `upsert({ skipValidation: true })` still refuses a URL below the floor; an
    invalid required `src` reports once; an `onPaste` handler that inserts
    through `insertData` during the paste gets that insertion's result.
  - Amendment to D8: `decodeHtmlDataTransfer` is public from `platejs/html`. It
    takes over the job the detached slice parser had for transfer formats
    that prepare HTML first (Word paste), with a type contract.
  - Follow-up, not done: `defineMediaPlugin(kind)` repeats the role each media
    `url` validator declares. Deriving insertion from the schema needs a
    plugin-owned accessor for property validators, which is a separate API
    decision.
- 2026-09-29: lane S5-browser measured the S5 matrix in production Chromium
  ([receipt](../research/probes/2026-09-28-conversion-boundary/lanes/s5/REPORT.md)),
  on a 02:05 snapshot of the tree (before the closure-review runtime fixes).
  - AI, identical prefixes (the plan's parser comparison): passes all four
    cells, −31 to −41% cumulative main-thread work including React render.
    Wall-clock AI arrivals fail the cumulative bar because the faster arm
    publishes 11–38% more previews; per publication it is 24–33% cheaper and
    arrival-to-DOM p95 falls 26–38%.
  - Static demo: passes rich 10 KB, rich 50 KB and CJK 50 KB (−34 to −41%);
    CJK 10 KB misses only strict-final p95 (+10.1% against 10%).
  - Editable demo: fails at every size (−9 to −17%). The authored EditorKit
    preview loads the whole value with `value.replace` in both arms, so only
    the parse is saved; no parse reuse can make that publication
    proportional. Candidate strict finals are 1–10% slower overall, with an
    unexplained intermittent editable 50 KB spike (3 of 12).
  - Bottleneck outside the hint: static previews build a new read-only view
    per commit, so `ElementStatic` re-renders every block on every
    publication (857 of 1,404 ms busy time in the AI CJK 10 KB profile).
  - Heap after three finish/cancel cycles shows no candidate-specific
    retention (10 KB, one sample per arm).
  - Browser proofs: the registry toast shows once for a lossy paste and not
    for lossless cleanup (Chromium production, trusted paste); streaming
    lifetime 14/14; clipboard, upload and static clipboard pass on Chromium,
    Firefox and WebKit after the href assertion accepts a URL as written;
    ai-session 18/19 (the known failure).
  - Found, pre-existing: the DOCX demo's HTML export throws in a webpack
    production build (`react-dom/server.edge` under Next's client alias), so
    `docx.spec.ts` export fails there; Turbopack dev hides it.
  - Gate: not met. The plan's rule requires every composition at both sizes;
    the editable composition cannot pass while its preview is an authored
    whole-value load. Adoption is left to the user (see Final handoff); the
    hint stays implemented and is not marked adopted.
- 2026-09-29: closure gates on the final tree, each compared with the same
  command at HEAD (`a7750ad388`) in a scratch worktree.
  - `pnpm --filter platejs test` 141/141 and `pnpm --filter plitejs test`
    21/21 (turbo tasks); `pnpm typecheck` 101/101; `pnpm --filter www
    typecheck` passes (editor contracts, API reference, docs parity, registry
    freshness and source, both tsconfigs); `pnpm lint` passes;
    `pnpm lint:type-aware` reports nothing HEAD does not (145 unique findings
    against 148); the schema-adoption checker reports nothing beyond HEAD.
  - `pnpm test` fails 140 tests against 151 at HEAD. The set is HEAD's
    cross-file isolation breakage in www suites, minus 22 AI lifecycle specs
    S4's React shim fixed, plus the 11 cases of the new streaming demo spec,
    which pass alone (11/11) and fail in the shared process like HEAD's.
    `pnpm test:slow` fails 25 tests after the stale `target: '_blank'`
    expectation was corrected, all of which also fail at HEAD (HEAD fails 26;
    its extra is a TableGrid benchmark budget).
  - Fixed while gating: type-aware lint findings in the new Markdown files, a
    mark-writer switch without its `undefined` case, a www-only mdast
    parameter type in the safety pass, and an AI streaming spec that relied on
    raw HTML failing a strict parse (raw HTML is now a lossless warning).
- 2026-09-29: the safety probe's defect assertions now pin the closed state
  (56 observations, 27 assertions; `results-after.json`), and its baseline
  receipts stay unchanged.
- 2026-09-29: S5 verdict run on final code
  ([`lanes/s5/verdict/`](../research/probes/2026-09-28-conversion-boundary/lanes/s5/verdict/)).
  Production webpack builds of both arms, unmangled so CPU-profile samples
  attribute by function. The gate sums parse and store work (a) and the
  publication transaction (b); React render (c) is recorded separately.
  - Passes: static rich 10 and 50 KB and CJK 50 KB, and AI on identical
    prefixes at the same sizes (−77 to −96% per pair). Live AI arrivals pass
    at all four sizes (−50 to −75%).
  - Static and AI CJK 10 KB fail only on strict-final p95 (+11.0% and +24.7%).
    Both arms run the same strict parse and replacement. In the candidate that
    final is the first full-size parse and fit, and those take 40–50% and
    10–40% longer, with a smaller heap and no extra GC. The code is cold; no
    work was added.
  - Editable fails at every size (−10 to −22%). The parse falls 70–94%, but
    `value.replace` is unchanged, because the preview editor's AI and
    Suggestion kits install the authored runtime.
- 2026-09-29: repairs after that verdict.
  - The demo's editable preview installs content plugins only (the editable
    counterparts of the static preview's kit, plus `DndKit`, whose provider
    the column, media and table handles need) and splices like the static
    one. An authored editor still replaces its whole value, as the Markdown
    docs say. The first cut left out `DndKit` and crashed on columns; S5
    caught it before measuring, and the lifetime spec's editable columns case
    now passes again.
  - The strict final continues the latest preview. Without `partial`,
    `parseSlice(source, { previous })` keeps completed segments. Under another
    loss policy it keeps only the leading segments that reported nothing,
    because a diagnostic's severity follows the policy. The demo and
    `AIChatPlugin` pass the hint to their final parse, so a final replaces
    only the changed blocks instead of running a cold full parse and a
    whole-value replacement. This amends A1's "strict calls always fully
    parse". The continuation oracle now also checks, at every prefix, that a
    strict parse continuing the latest preview equals a fresh strict parse.
  - Bug found and fixed: completed segments were converted in partial mode, so
    an unclosed inline tag at a segment's end lost its `markdown-tag-repair`
    warning (10 and 4 mismatched prefixes on two sources). Segments now convert
    without `partial`, and only the tail is the end of a partial source.
    Reverting either rule fails its new fixture.
  - Doctrine v250, not yet in any commit, carries the amended `previous` rule;
    its fingerprint is `sha256:10edff18…`.
- 2026-09-29: a separate decision amends end state 4. The decision is
  `2026-09-29-imports-opt-in-paste-result`, executed by
  [its own plan](2026-09-29-registry-paste-feedback.md) in another session.
  - The registry editor renders no paste toast.
  - `Editable.onPasteResult` and `EditorContent` remain opt-in delivery for
    applications that present feedback.
  - The toast's browser proof (3/3 on the 09:04Z snapshot) is historical.
- 2026-09-29: the DOCX demo's HTML export threw in webpack builds, a defect
  found by S5 that exists only on `next`.
  - `renderStaticHtmlWithOverrides` now imports `renderToStaticMarkup` from
    `react-dom/server.browser`. Next's webpack client and edge layers alias
    `react-dom/server.edge` to a stub whose legacy renderers throw.
  - `main` imports `react-dom/server` dynamically, so no changeset applies.
- 2026-09-29: S5 accepted on final code
  ([`lanes/s5/verdict-2/`](../research/probes/2026-09-28-conversion-boundary/lanes/s5/verdict-2/),
  snapshot 11:59:28Z, load at or below 7.9). All 12 acceptance cells and all
  4 live-AI cells pass the gate:
  - Parse plus publication work falls 77–86% at 10 KB and 93–97% at 50 KB for
    the static demo, the editable demo and AI on identical prefixes. Live AI
    arrivals fall 66–84%.
  - Strict finals are faster than baseline in every cell: 32–41% for static
    and AI, 80–93% for editable. The final's parse takes 0–2 ms and its
    transaction 1–14 ms.
  - Arrival-to-DOM p95 falls in every cell.
  - Candidate reruns: correctness 6/6, lifetime 14/14, clipboard 6/6,
    clipboard-upload 3/3, docx 3/3, and ai-session 18/19 (the known
    narrow-view failure).
  - The hint is adopted. React render and commit of the static and AI
    previews is the largest remaining streaming cost (24–51 s at 50 KB, equal
    in both arms), which leads the follow-ups.
- 2026-09-29: the tracked Markdown benchmark, HEAD against the final tree
  ([`lanes/formats/closure-benchmark-*`](../research/probes/2026-09-28-conversion-boundary/lanes/formats/)).
  - The first run failed B1 legacy large (1.34×). A document parse
    deep-froze its converted blocks through the slice path's snapshot, and
    fitting then copied them. Document parses now normalize without a
    snapshot, as they did at HEAD.
  - Rerun: B1 1.036–1.039× (inside the noise band, under 1.10×); B2 prose and
    streaming 1.00× and 1.005×; serialize 0.88×. The adoption gate passes.
    The absolute B4 inline-tag doubling budget still fails (3.1–3.5×), as it
    did before this plan.
  - That fix touches only `parse`; the streaming consumers use `parseSlice`,
    so verdict-2 stands.
- 2026-09-29: read-only previews render a document instead of splicing
  ([static preview document](2026-09-29-static-preview-document.md)).
  - `<EditorStatic editor={editor} document={document} />` and `EditorPreview`
    render through the editor's plugins without editing it. The AI menu and
    the demo's static preview delete their identity splice; the editable
    preview keeps it.
  - Plite reuses validation of deep-frozen nodes per compiled schema, and the
    Markdown table decoder pads short rows as GFM specifies.
  - On S5 projection-2, projection beats the splice on every metric in every
    cell (publication −68 to −85%, React −10 to −17%).
- 2026-09-29: the AI docs' Streaming section embeds `markdown-streaming-demo`
  again, in English and Chinese. S4 had moved the embed to the Markdown docs
  when the demo stopped using `AIChatPlugin`, which left AI readers without a
  live example of streamed responses.
- 2026-09-29: closure review repairs.
  - **Static HTML renderer.** No single React server specifier works in every
    runtime:
    - `.browser` fixed the webpack DOCX export but keeps a Node process alive
      through its `MessagePort` (the 2026-09-24 export plan recorded the same
      failure);
    - `.edge` is stubbed in Next's webpack client bundle;
    - bare `react-dom/server` fails Next's server-component compile check.

    The renderer now loads its build when it runs: `.edge` in a Node-like
    runtime, `.browser` otherwise (Next's browser `process` polyfill has no
    `versions.node`). Both specifiers pass Next's check. The packed release
    proof passes: 4 packages, 93 subpaths, Node import of 88 runtime
    entrypoints and DOM-free SSR rendering. Its checker expected
    `parseDOMClipboardHtml`, which HEAD~4 removed, so that stale expectation
    is gone. The entrypoint size baseline is refreshed (−3.6 KB to +4.3 KB per
    entrypoint, under 0.5%).
  - **Shared-process test failures.** `pnpm test` runs most www specs in one
    process. `comment.spec` wrapped `history.undo()`, which returns a promise,
    in `void act(...)`. The unawaited act left React's act queue installed, so
    every later render in the process queued work React never flushed. That
    caused `comment.spec`'s own three failures and the cascade after it,
    including the new demo spec's 11. `math.lifecycle.spec` and
    `discussion.spec` had the same pattern. All three now await the act, and
    the shared Bun test setup fails any test that leaves an act scope open,
    so a future leak fails where it happens. `pnpm test` goes from 140
    failures to 27, against 151 at HEAD. The remaining 26 were already
    failing at HEAD; the 27th, a schema-construction timing budget, passes on
    rerun.
  - **Definitions.** The `previous` JSDoc, both Markdown docs and the
    changeset now say a source with a link reference or footnote definition
    parses whole. Measured on the current tree: no reuse, and no cost against
    parsing without the hint.
  - **Final-code identity.** Verdict-2's snapshot differs from the final tree
    in three product files. Reverting only the document-parse fix and the
    JSDoc reproduces their snapshot hashes exactly. The renderer import is
    static HTML export only. A current-tree continued-parse run confirms the
    headless numbers
    ([`SOURCE-DIFF.md`](../research/probes/2026-09-28-conversion-boundary/lanes/s5/verdict-2/SOURCE-DIFF.md)).
  - **Ledger.** The execution record binds the renderer, consumers and
    runtime files it claims. The `imports` scope's paste-feedback proof is
    rerun on the current tree (registry editor 3/3, Plite React 1,325/1,325).

## Evidence and reconciliation

The current boundary review fingerprint matched at intake. Its durable
[probes](../research/probes/2026-09-28-conversion-boundary/) establish defects
and limited experiments, not target adoption:

- Markdown stores and exports unsafe active destinations. HTML's two guards
  disagree on embedded controls; parent mappings can read unchecked descendants.
  DOCX file import calls a captured element decoder, not public HTML preparation.
  Static DOCX output and exact retained bytes can bypass semantic safety checks.
- Markdown property reads and HTML ownership can suppress real omission reports.
  Markdown's property-loss warnings bypass default reject. Matching defaults
  do not necessarily permit wire omission.
- Transfer decoders return slice/null and currently discard conversion diagnostics.
  The earlier accepted paste-feedback job survives the later D21 cut to encoding.
- The prose prototype passed 1,996 prefix comparisons and 309 prefix-identity
  checks. Broader parser identity failed 181/926 assertions. Plite already kept
  unchanged model objects in the measured cohort.
- Five 10 KB pairs: cumulative parse median 520.6 → 80.7 ms; fitting
  627.4 → 624.6 ms; publication 1,221.9 → 1,189.7 ms. Only one of five
  intended 50 KB pairs exists. Candidate 10/50 KB Chromium proof is absent.
  Those gains used converted-result reuse and do not prove the syntax-only
  candidate selected for the next experiment.
- The joiner's 2,500-character threshold selects conditional buffering, not
  universal 100 ms delay. Code/table paths can reach that delay earlier;
  plain prose can stay at 10 ms. AI already coalesces preview publication at 32 ms.

Keep mapping D1, D3–D6 and their 11-element/13-mark migration inventory.
Supersede D2's preservation inference: ownership permits exposure, actual
representation or an explicit custom claim establishes preservation.
Narrow D7: HTML retains its syntax/mapping model but shares corrected accounting
and safety. Plain text retains its intentional textual projection.

The six pinned repositories in the review remain sufficient prior art.
Tree-sitter/Lezer explain explicit reusable syntax and invalidation; Streamdown
does not establish Plate prefix equivalence. No new engine comparison or
third-party code adoption is justified.

## Target and public shape

Keep text operations named `parse`/`serialize` and artifact operations
`importDocx`/`exportDocx`. Installed editor methods own exact document types;
standalone document conversion stays broad `Value`.

The ordinary mapping path gets smaller:

```ts
formats: ({ defineFormats, schema: { type } }) =>
  defineFormats({ markdown: { tag: type } })

// Existing owner's properties; wire spelling, both directions:
markdown: { tag: 'video', attributes: { url: 'src' } }
// Mark role comes from the schema:
markdown: { tag: 'span', style: 'color' }
```

Custom encoders keep their existing output contract. One proposed callback
replaces read-based preservation inference:

```ts
encode: ({ encodePhrasing, node, preserve }) => {
  preserve('level');
  return {
    type: 'heading',
    depth: node.level,
    children: encodePhrasing(node.children),
  };
}
```

`preserve(...ownedKeys)` is invocation-local and typed to that binding's
content properties. It is a trusted semantic assertion, not proof of arbitrary
JavaScript. Commit claims only for selected, retained output; discard them on
null/refusal/throw, abandoned candidates or dropped subtrees. Known loss always
overrides a claim. Do not count `encodeAttributes` calls whose output is discarded.

Compiler-generated declarations claim actual represented values and proven
default elision. Final accounting composes all owners; a parent cannot claim
foreign List properties or its children's output. No public capability matrix,
static `preserves` list, result envelope or second codec.

### Exposure, defaults and loss

Severity is amended by A2 and accounting by A3.

Automatic tag properties are the binding owner's own schema contributions.
Exclude metadata and foreign-owned contributions in both directions. After all
applicable encoders run, report relevant unclaimed content; owner-scoped
exposure must not hide another owner's loss.

| Case | Law |
| --- | --- |
| Absent optional property without a default | No preservation obligation. |
| Present content property, including equal default with `omitDefault:false` | Requires representation; tag/depth/style can represent it without an attribute. |
| `omitDefault:true` | Elision is lossless only when the paired mapping/default semantics preserve its meaning. Schema default equality alone is insufficient. |
| Explicit accepted/proposed/plain-marks projection | Compare with that selected projection. Do not warn for its intended exclusions. |
| Established unintended loss | Rich conversion rejects by default; explicit allow returns safe usable output with a warning. |
| Lossless normalization or non-content cleanup | May report a repair; does not become an error under reject. |
| Limits, malformed internal return or thrown programmer bug | Preserve refusal/error ownership. Allow is not catch-and-succeed. |

Reuse schema equality/default codecs. Assert canonical export input; do not fit
or mutate it. Import documents reuse Plite's fitter and its repair report.
Slices use admission, then contextual insertion: full document grammar is not
an admission requirement. Placement is lossless or refused atomically.

Compare loss across matched capabilities, not identical warning arrays.
HTML can preserve alignment that Markdown cannot. Markdown link `target`
loss is separate from URL preservation. Plain text keeps `{ data, diagnostics }`,
with no new `ok` or policy: report lost textual/structural meaning, not every
omitted mark. Silent rich-paste fallback is not an explicit text projection.

DOCX export gains optional `lossPolicy: 'reject' | 'allow'`, default reject;
its existing success/failure result remains. This option does not exist today.
Apply it to established loss after projection, not every historical warning.
Static DOCX rendering does not inherit semantic HTML mapping preservation
claims, and this plan does not promise complete arbitrary-renderer loss detection.

### Safety at existing boundaries

Use one private role-aware URL decision function and common internal loss facts.
Keep syntax traversal, source coordinates, resource loading and diagnostics with
their existing format owners. A small function does not require a conversion
framework. Literal code/text containing a URL is not an active sink.

| Role | Baseline admitted destinations | Artifact restriction |
| --- | --- | --- |
| Navigation | HTTP(S), mailto, tel; ordinary relative paths/query/fragments | DOCX admits absolute supported links and bookmark fragments; no invented document base. |
| Image | HTTP(S), nonempty relative resource; bounded base64 raster data; valid transient blob | DOCX admits supported raster resources under its loader policy; relative/blob resources require diagnosed refusal/omission. |
| Audio/video | HTTP(S), nonempty relative resource, valid transient blob | Do not invent DOCX audio/video capability. |
| File download | HTTP(S), nonempty relative resource, valid transient blob | Represent a supported link or diagnose missing artifact capability; no mailto/tel/data payload fallback. |
| Embed | Absolute HTTP(S) | No data/blob/relative execution context. |

Decode syntax escapes/entities once. Reject controls U+0000–001F/007F–009F,
raw backslashes and unpaired surrogates before URL parsing; trim ordinary
surrounding spaces only. Reject authority-relative URLs and disallowed/malformed
schemes; a first-segment colon cannot fall through as a relative path.
Do not recursively decode percent escapes. Validate without an ambient page
base; preserve relative meaning. Normalization must be idempotent.

Raster data is restricted to base64 avif/bmp/gif/jpeg/png/webp, with valid bounded
payload syntax; no SVG/HTML/XML. This is not image-decoder certification.
Blob references retain their explicit transient lifetime; conversion never
dereferences them merely to classify them. Existing resource-loader permissions,
limits and supported codecs still apply.

The fixed role policy rejects other active schemes for resource roles. For
navigation, the floor rejects script-capable and malformed destinations, and
existing Link `allowedSchemes` widens or narrows it (A5). Cut
`dangerouslySkipSanitization` and permissive `permitInvalid` safety paths;
adopt Link/render/provider transformation callers through the same decision.
Custom transformations run before the final check. General application
fetch/redirect/host authorization remains separate.

Built-in syntax sinks carry fixed roles: link/definition href, image src,
video poster, audio/video/source src and iframe src. Remove unsupported
executable attributes/elements and resource-bearing CSS before conversion
processors consume them; preserve supported nonresource formatting.

Canonical active fields use the existing feature-owned
`property.string({ validate, validationVersion })` contract backed by the
private role policy. Link owns navigation; Image, Audio/Video and MediaEmbed
own their respective roles. Split the shared media URL descriptor where roles
differ, retaining genuinely shared width data. File download links use
HTTP(S)/relative/blob resources, not mailto/tel or arbitrary data payloads.
MediaEmbed's original `sourceUrl` and final provider URL each receive the
appropriate check after transformation.

This **cuts the proposed public `urls` and `urlAttributes` metadata**. Feature
ownership already identifies canonical meaning. Plite provides validation
mechanics without a built-in URL type, and no name-based scan or URL registry is
needed. Existing Markdown wire aliases stay purely representational.

Retain the existing empty URL as an inert unresolved value: the v54 migration
currently materializes it. It must never become an active destination; format
owners diagnose a missing resource when emission requires one. Nonempty active
values meet the role floor. Runtime Link configuration can narrow admission or
rendering, not change schema meaning. Validators remain deterministic and
versioned, with no store/network dependence.

Every canonical admission must actually invoke schema validation, including
custom decoder results, native transfer roots and selected DOCX native state.
Known source syntax is cleaned first so ordinary hostile input can become a
diagnosed safe fallback before schema assertion. Invalid callback-fabricated
nodes refuse through the existing input/programmer-error distinction; never
silently fit away their invalid property.

Validators cannot protect source descendant reads, emitted syntax or retained
ZIP bytes; those remain mandatory format/package gates below. Arbitrary custom
alias attributes are opaque until their trusted mapping interprets them.
An app-defined canonical active field uses its own schema validator; this plan
does not promise to infer arbitrary callback semantics or sanitize opaque
attributes before they become recognized active syntax. Trusted callbacks are
not sandboxed.

Adding validators changes schema identity. Set explicit validation versions,
update current first-party target fingerprints and fold adoption into the
approved unreleased v54 target; do not invent v55. Preserve frozen v53 source
identity. The existing migration neutralizes an unsafe legacy active value
with the lossless import cleanup (a link unwraps to its label; media keeps alt
and caption) instead of rejecting the document (A4). Safe and empty URL
fixtures migrate; stored-history/schema mismatches continue to fail closed. Generated schema contracts and source-preservation correspondence need
fresh proof. No compatibility validator or hidden migration is added.

Required order:

1. Sanitize the full operation source tree before a parent mapping can inspect
   descendants. HTML preparation callbacks are bracketed by sanitization.
   Decode callbacks are observational; mutation belongs to preparation.
2. Validate returned canonical nodes/slices by their actual schema type, including roots
   and nested content, before fitting/admission/publication. Plate native
   clipboard and trusted-native DOCX adoption cannot bypass this check.
3. Check final emitted syntax, including custom callback/static output. DOCX
   sanitizes static markup/styles before resource processing and checks written
   relationships/resources. Clipboard checks each emitted active MIME.

Do not scan the whole source tree for every decoded node. Operation passes and
returned-subtree checks retain bounded traversal; repeated preparation callbacks
are measured separately. Trusted callbacks can perform arbitrary I/O and are
outside the isolation claim.

Removing a script destination while retaining its complete label is lossless
safety cleanup. Losing supported content, a meaningful unsupported destination,
visible media, caption or label is lossy. Reject/allow governs that loss; neither
permits unsafe output. Built-in links unwrap to labels; media retains meaningful
alt/caption fallback. Custom elements get no invented fallback: use independently
decoded source text/children if valid under allow, otherwise diagnose/refuse.
Expected hostile input produces a result diagnostic, not an accidental throw.

### Retained DOCX source

Runs as lane D1 (A6). Until it proves eligibility, exact-source reuse
regenerates.

Exact-source reuse remains a real fidelity job, but matching document/schema
and ZIP limits do not establish safe active content. Extend the existing
package inventory; share current relationship/part helpers instead of another
archive parser.

Only positively checked immutable packages earn a retained source. Inspect all
parts, content types, relationships and supported inline/field references,
including unreferenced parts and headers/notes/comments. Admit a closed passive
vocabulary backed by current writer/preservation fixtures, safe hyperlink
relationships and admitted raster parts. Unknown vocabulary is ineligible.
Exclude macros, ActiveX/OLE/embeddings, external templates/resources, altChunk,
active XML/SVG and unrecognized field instructions; the current writer's exact
PAGE instruction is the initial recognized field.

With `retainSource:true`, proposed `source` becomes `DocxSource | null`.
Unsafe/unverified source returns null with a source-unavailable diagnostic;
otherwise valid sanitized body import can succeed. No unusable source handle,
unsafe-reuse flag or permanent public eligibility service. Existing no-retention
results and required `retainSource:true` conditional typing remain.

Safe unchanged source remains byte-exact under existing correspondence rules.
Overlay/native-envelope output is checked before return. Ineligible source
regenerates from the imported document; it cannot be resurrected by projection,
authored trust or native-state attachment. Record fidelity loss when established;
lack of eligibility alone is not proof that body content was lost.

The closed vocabulary and ordinary-third-party-DOCX impact require S0/S2 proof.
Until positive eligibility is demonstrated, reuse stays disabled for that class;
do not call an incomplete denylist safe.

### Paste result: the UI owns feedback

Delivery runs as lane T1 (A6); the decode context's `report()` lands in S3.

Proposed mounted API:

```tsx
<EditorContent
  onPasteResult={({ inserted, diagnostics }) => {
    if (diagnostics.some(({ impact }) => impact === 'lossy')) {
      toast.warning(
        inserted
          ? 'Some pasted content was left out.'
          : 'The pasted content could not be inserted.'
      );
    }
  }}
/>
```

Plite `Editable` owns the neutral prop; Plate inherits it. The readonly result
has `inserted: boolean` and diagnostics whose minimal public view is
`{ impact: 'lossless' | 'lossy'; message: string }`.
No redundant lossy boolean, outcome enum, attempt history, stored callback,
plugin event or separate feedback plugin.

Add `report(diagnostic)` to the existing transfer decode context; keep decode's
slice/null return and programmatic `insertData` boolean. Collect per-attempt
provenance privately. Ordinary accept-false/null delegation stays quiet;
unexpected callback throws retain the lifecycle error channel.

Select final diagnostics once. Retain diagnosed rich loss when the selected
fallback cannot establish recovery; equal text strings are not such evidence.
A later candidate demonstrably preserving the content need not inherit an
abandoned candidate's loss. Do not invent a general cross-format equivalence
engine: absent that evidence, keep the warning.

Deliver once after commit, or final expected refusal without insertion, through
the initiating mounted runtime. Use existing afterCommit ordering; never notify
a different view that subsequently gained focus. Unmounted initiators receive
no redirected callback. Prove direct paste/beforeinput deduplication, rollback,
two views and current callback props. App interception that completely bypasses
built-in insertion owns its own outcome. Transfer encoding remains string/null;
this paste job does not reopen a general copy-result API.

### Streaming: contract selected, optimization gated

The candidate and identity rules below are superseded by A1. The prefix
oracle, strict final, consumer cadence, lifetime and joiner rules stand.

Candidate syntax reuse uses the existing installed methods:

```ts
// Proposed hint; mode and editor value type must match.
const next = editor.api.markdown.parseSlice(source, {
  partial: true,
  previous,
});
const final = editor.api.markdown.parseSlice(source); // Strict full parse.
```

The same mode-correlated hint applies to `parse` for the non-AI document preview.
No detached hint, parseInline hint, new public checkpoint, stream handle,
parser scheduler or AI-owned parse cache. A handle adds lifecycle/API surface
without removing any correctness obligation.

Every preview must equal a fresh partial parse of that prefix, including
diagnostics/locations. A strict call continuing a valid hint must equal a fresh
strict parse (amended after S5: the final continues the latest preview; see the
Execution log). Failed, fabricated, deserialized, foreign-editor,
wrong-mode, invalidated or nonprefix hints fall back safely. Repeated identical
source still reevaluates current mapping state.

Cache **syntax only**. Private result-associated weak storage holds an immutable
syntax checkpoint, never converted/fitted nodes or diagnostics. Re-run transforms,
all mappings, quota checks, validation and document fitting where applicable.
Public result mutation cannot mutate retained syntax; mutable transforms get
isolated trees. No predecessor chain, global strong cache or editor retention
through a detached checkpoint.

Match runtime owner, mode, compiled grammar/schema/declarations and normalized
policy/limits. Unknown grammar/remark extension state forces full parsing; no
purity flag or dependency-registration API. Plain ASCII paragraphs and ATX
headings at proven complete blank-line boundaries are the initial experiment,
not a promise for tags, lists, references, footnotes, math, tables or containers.
Nonlocal dependency means invalidate affected earlier content or full fallback.

This still copies/visits a full tree and reruns conversion. It might lose the
performance comparison. Do not widen its corridor or change the engine merely
to rescue a failed budget.

Unchanged model objects, keys and DOM hosts must retain existing publication
identity. Do not promise identity of public parser-result nodes without a
separate current consumer that needs it. Source bytes and full assembled-tree
limits apply every time; Unicode offsets and whole-source diagnostics stay exact.
Only the latest hint is consumer-retained; finish/cancel/replace/unmount drops it.

Consumers retain first-immediate/latest-32-ms preview cadence. Finish and
deliberate stop perform one strict current-draft parse. Cancel, close,
replacement or unmount abort and fence stale work without a final flush.
Accept commits only the strict valid result in the consumer's ordinary history
transaction; a deleted target refuses. A parser never owns accept/undo.

The non-AI Markdown streaming demo must actually use ordinary Markdown APIs,
own its source/abort/hint, publish an ephemeral value with history skipped, and
show editable/static previews. Remove its AIChat dependency and fix strict
finish/stop semantics. Keep raw-source and chunk/pacing controls useful as a
real example, not a hidden benchmark hook. Actual AI adoption is verified
separately through useAIChat → preview store → mounted effect → replacement.

Delete joiner grammar buffering/delays only after raw-stream cadence and strict
finalization proof. First compare parsers with transport held constant; then
compare joiner present/absent independently. Removed artificial delay is not a
parser speedup.

## Decisions, cuts and adoption

| ID / surface | Target and strongest rejected alternative | Owner / adoption | Proof / risk | Verdict |
| --- | --- | --- | --- | --- |
| D1 Common boundary | Private policy/accounting at existing format owners; no universal pipeline/AST/plugin/package | Plate compiled formats; syntax remains format-owned | S0–S3; added passes have a real cost | Laws selected; runtime gate |
| D2 Property fidelity | Actual generated emission plus invocation-local custom preserve; delete read Proxy and blanket ownership claims | HTML/Markdown, custom feature callbacks, inherited mapping D2 | Discarded-output/default/foreign-owner probes; custom assertions can lie | Rearchitect; claims guarded by a conformance harness and list accounting fixed (A3) |
| D3 Mapping authoring | Keep tag/attribute/value/style/node declarations, derive marks; delete duplicated 11 element and 13 mark callbacks | Prior mapping D1–D6; custom Date/Image/native nodes remain | Existing corpus/type proof and benchmark rerun | Retain target |
| D4 Safety | One private role policy, existing feature-owned schema validators and mandatory syntax/package gates; cut proposed role metadata | Plate formats, Link/media, DOM integration, migrations and DOCX | Parent reads, fabricated nodes/output, v54 identity and retained bytes; custom opaque semantics remain trusted | Laws selected; traversal gate; navigation floor and migration amended (A5, A4) |
| D5 Rich loss | Shared severity after projection; add DOCX export policy; keep intentional plain text | Existing result unions and toolbar error handling | Matched capabilities, actual labels/structure; no full React fidelity claim | Amended: property loss warns, content loss rejects (A2) |
| D6 Source reuse | Eligible immutable source or null; no unsafe-reuse escape or always-regenerate target | DOCX package inventory/import/export, retainSource callers/types | Safe exact bytes, hostile/unverified corpus, overlay and disposal | Lane D1; reuse regenerates until then (A6) |
| D7 Paste diagnostics | One mounted outcome via neutral decode report; no initialState service or duplicate event | Plite DOM/React → Plate EditorContent → registry toast | Native/synthetic aftercommit, fallback, refusal, rollback/two views | Delivery in lane T1; decode `report()` in S3 (A6) |
| D8 Detached HTML slice | Cut browser/server parseHtmlSlice exports/wrappers/docs/contracts; retain installed parseSlice | HTML entrypoints and standalone type contracts | No production repo caller; migrate behavioral tests to installed method | Cut |
| D9 Streaming hint | Mode-correlated previous on existing parse/parseSlice; no handle/session/converted-node cache | Markdown only; AI and independent demo consumers | Prefix oracle + source/state mutation + retention + S5 budgets | Candidate replaced by converted-segment reuse (A1); gate remains |
| D10 Streaming identity | Superseded by A1: completed segments return identical nodes and consumers splice | Markdown runtime, AI preview and demo consumers; Plite per-transaction cost goes to its own plan | Prefix oracle, splice-equals-replace oracle, mounted evidence | Amended (A1) |
| D11 Transport | Consumer cadence replaces grammar-dependent joiner delays | Existing AI transport and preview owners | Same raw chunk schedule and final/cancel proof | Gate deletion |
| D12 Dialect and fitting | Retain micromark/MDAST and canonical Plite fitter/admission distinction | Existing syntax/schema owners | Rich corpus, refusal atomicity, aggregate limits | Keep |

All public additions above are proposed and need inferred type proof. No
callback annotations to conceal broken inference. DOCX nullable source and
removed safety bypasses are intentional beta breaks, with no aliases.

## Execution slices

| Slice | Owner / scope | Entry | Exit and proof |
| --- | --- | --- | --- |
| S0 Baseline and disposable owner probes | Benchmark + format owners: freeze live source identity; prototype common checks/accounting traversal and the A1 converted-segment reuse with spliced publication | Execution authorized; reuse current review only where fingerprints match | Correctness comparisons and frozen budgets below. Safety law stays mandatory; failed traversal budget returns to owner design. Reuse performance failure rejects D9 implementation without blocking unrelated mappings. No advertised production guarantee before proof. |
| S1 Accounting and declarative mappings | Plate HTML/Markdown compiler and feature owners; D2/D3, prior mapping S1–S3 including Details check | Shared laws settled; relevant S0 owner comparison passes | Claims/default semantics and strict/allow work; 11/13 inventory migrated, mark flag/read Proxy/blanket claims deleted; package/type/slow/kit corpus and mapping benchmark pass. |
| S2 Safety | Common function and feature validators; full source checks, returned values and active output; DOCX export policy; exact-source reuse regenerates (A6); Link callers, navigation floor (A5) and v54 identity/migration | S0 safety traversal obligations satisfied for admitted classes | Cross-format parity, intact labels, static/native/retained bypass closure; safe/empty legacy migration and unsafe values neutralized by lossless cleanup (A4); deep-link widening through `allowedSchemes`; no new network permission. |
| S3 Transfer diagnostics and public cuts | Plite transfer decode context, Plate adapters and HTML entrypoints | S1/S2 diagnostic facts and safe values available | Decoders `report()` their diagnostics instead of discarding them; mounted delivery is lane T1 (A6); detached HTML slice exports cut with installed behavior coverage and compiled type contracts. |
| S4 Consumer correctness | Markdown streaming demo, minimal AI lifecycle adoption | Existing parser remains baseline; independent of winning reuse | Non-AI document parse demo, matched editable/static semantics, strict finish/stop, no cancel flush/stale write, normal accept/undo. Browser/lifetime proof. |
| S5 Conditional reuse and joiner cut | Markdown + Benchmark, then existing transport owner | The A1 candidate passes S0 correctness (prefix and splice oracles, invalidation, aggregate limits) and complete-operation acceptance | Same production/browser matrix passes final code; adopt hint only on measured win. Evaluate joiner deletion separately under unchanged cadence. If reuse loses, delete experiment and preserve unresolved performance outcome. |
| S6 Teaching and closure | Best API repair, Plate Docs/UI/Next, Verify Plate and ledger | All adopted slices pass; rejected/gated rows explicitly recorded | JSDoc/types, bilingual docs, registry output, doctrine, changesets, barrels, source-bound final gates and reconciled execution record. Never mark gated reuse adopted. |

Slices are verification units, not a request to create parallel branches or
separate tasks. D2 must land before declarative exposure; a general incremental
engine is not a prerequisite for the mapping work.

## Scale contract

The user operation is streamed Markdown source → parse → fit where required →
publication → mounted editable/static content. Independent variables are
UTF-8 bytes, chunk size/count, syntax/container depth, mapping/preparation count,
extensions/state, and view composition. Source parsing alone is a component.

S0 uses original synthetic fixtures from the durable review: normal/large
10,000/50,000-byte prose and rich transcripts; 64-byte chunks (157/782),
plus arbitrary chunkings, nonlocal definitions, late table/setext boundaries,
unclosed nested tags, Unicode and limit crossings for correctness. Retain the
tracked dialect benchmark's legacy and B4 pathological cohorts for regressions.

Record both worktree identities, exact fixture hashes, commands, environment,
warmup/sample counts and raw observations. No private documents, credentials,
headers or external user data. Freeze before target measurements:

- First disposable feasibility pair may reject. For acceptance, use a new run
  with one warmup per arm and three alternating pairs at both sizes for actual
  AI, non-AI editable and non-AI static consumers. Production profiling is the
  final comparison; dev timings only establish feasibility.
- Eligible prose needs at least 20% and 100 ms lower cumulative nonoverlapping
  parse-plus-publish work per stream at both sizes in all three compositions.
  Require consistent pair direction outside observed run variation. Otherwise
  no public cache adoption. An inconclusive result is not a pass.
- Rich fallback, strict-final p95 and arrival-to-DOM p95 must not regress beyond
  max(10%, 5 ms). Report within-stream percentiles separately from between-run
  variation. Record cold initialization and failure paths too.
- Freeze 10 ms raw arrival schedule and 32 ms latest-value cadence. Compare
  identical parsed prefixes for parser cost, then separately record live
  queue/coalescing behavior. A smaller workload is not a cache win.
- Record parse/fit/publish times without adding nested inclusive timers, parsed
  and converted bytes/nodes, callback invocations, actual source prefixes,
  React Profiler actualDuration/commit timestamps and observed DOM latency.
  Profiler duration is not browser commit CPU; DOM observation is not paint.
- Assert unchanged model objects, keys and DOM hosts at the real publication
  boundary. Record source/checkpoint bytes and heap retention after three
  finish/cancel cycles under stated GC conditions; no retained predecessor,
  editor, timer or subscription chains.
- An exploratory packet exceeding 180 seconds per stream or 60 minutes total
  stops as inconclusive and records the bottleneck. These are experiment cost
  caps, not user goal budgets or permission to loosen acceptance.

S0 safety/accounting comparison uses the same 10/50 KB public conversion
fixtures plus wide/deep resource documents with zero, one and multiple
preparation callbacks. Compare complete operations, traversal counts and
package bytes. The provisional added-work budget is max(15%, 5 ms) at each
size, with linear pass counts; count repeated preparation separately. If it
fails, optimize the existing owner or record a justified measured safety cost
before selecting the runtime. Do not silently waive it for correctness.

The existing tracked mapping/dialect contract remains B1 ≤1.10×, B2 ≤1.25×,
B3 ≤1.5×, B4 ≤2.5× doubling, with its 10% inconclusive band. Preserve any existing
baseline failure as a named limitation; do not claim this plan repaired shared
micromark behavior.

No permanent production telemetry API is added. Existing profilers and a
deterministic regression harness own detection. There is no database transaction
or query layer in this operation; query/pagination checks do not apply.

## Proof and adoption owners

| Claim | Existing evidence / owner | Required execution proof |
| --- | --- | --- |
| URLs agree at active roles | Durable safety probe (56 observations); htmlAst/HtmlPlugin, Markdown mappings, Link/media | Same role inputs across HTML, Markdown, DOCX and native/registered paste; escaped controls, aliases, descendant reads, fabricated output, literal-text controls and exact preserved labels/captions |
| Exact source cannot bypass checks | DOCX package/import/export/sourcePreservation | Real ZIP fixtures: safe byte-exact, hostile external/active parts, unknown parts, native trust, comments/header references, overlay, disposal and nullable source inference |
| Loss is representation-based | Durable property probe; HTML reportUnsupportedProperties, Markdown reportOmittedProperties | Read-without-write, discarded attributes, branch claims, defaults/omitDefault, metadata, foreign owners, safety override, matched and differing format capabilities; reject/allow |
| No duplicate fitter | Plite schema, existing HTML slice admission and insertion | Repairable text→cell slice, invalid internal result distinction, atomic refusal and document fit-report severity |
| Paste reaches one actual consumer | Existing Editable.onHistoryReplay runtime precedent; current transfer formats | Chromium native and synthetic paste, direct/beforeinput, two views, rollback/refusal, stale/unmounted initiating view, one visible toast, no toast for harmless metadata |
| Type contracts are real | Existing package and real BaseEditorKit contracts | Proposed options/claims infer without annotations; wrong owned key/mode/alias fails; exact editor vs broad standalone values; required retainSource and nullable source handled; versioned schema fingerprints and v54 migration stay coherent |
| Prefix semantics and lifetime | Prior limited prototype; existing useAIChat/lifetime specs | Every incremental result equals fresh partial result, diagnostics included; mutated state/results/config, refs/footnotes/containers, random chunkings, quotas, strict final, cancel/stop/unmount and memory |
| Runtime benefit | Prior 10 KB component gain, incomplete 50 KB/browser evidence | New S0/S5 candidate and actual consumer matrix, original limits retained |

Current source anchors (repository-relative):

- `packages/platejs/src/lib/plugin/{BasePlugin,pluginAuthoringContext,PluginFormatContext}.ts`;
  `internal/plugin/{collectPlateNodeMappings,pluginFormatOperation}.ts`;
  `lib/editor/withPlite.ts`.
- `packages/platejs/src/lib/plugins/html/{HtmlPlugin,htmlAst,htmlConversion}.ts`;
  `markdown/lib/{MarkdownPlugin,types}.ts`;
  `markdown/lib/internal/{markdownMappings,markdownConversion}.ts`;
  `markdown/lib/serializer/reportOmittedProperties.ts`; `plain-text.ts`.
- `packages/platejs/src/docx/import/lib/importDocx.ts`;
  `packages/platejs/src/docx/export/lib/exportDocx.tsx`;
  `packages/platejs/src/docx/export/lib/sourcePreservation.ts`;
  `packages/platejs/src/docx/internal/docxPackage.ts`;
  `packages/platejs/src/migrations/migratePlateV54.ts`.
- `packages/plitejs/src/dom/plugin/{data-transfer-format,dom-clipboard-runtime}.ts`;
  `react/components/editable.tsx`; `react/editable/editable-dom-runtime.ts`;
  `core/public-state.ts`.
- `apps/www/src/registry/examples/markdown-streaming-demo.tsx`;
  `packages/platejs/src/ai/react/useAIChat.ts`;
  `apps/www/src/registry/components/editor/{editor,export-toolbar-button}.tsx`.

Use Verify Plate's source-first recipes. Focused existing package scripts:

```sh
pnpm --filter platejs test:partition:markdown
pnpm --filter platejs test:partition:html
pnpm --filter platejs test:partition:html-server
pnpm --filter platejs test:partition:docx-import
pnpm --filter platejs test:partition:docx-export
pnpm --filter platejs test:partition:docx-paste
pnpm --filter platejs typecheck
pnpm --filter plitejs typecheck
pnpm --filter plitejs test
pnpm --filter www build:registry
pnpm --filter www typecheck
pnpm --filter www check:docs
```

During iteration run affected existing spec files through their source-alias
runner. Markdown closure includes its slow and www kit suites, not only the
fast partition. Run real DOCX source-preservation tests separately from mocking
import suites. At settled package closure run all affected package gates.

Browser runner: `pnpm --filter www test:www-browser:chromium` with the existing
clipboard and streaming-lifetime specs and a proposed
`tests/browser/markdown-streaming-contract.spec.ts`. Add the cache oracle at
the Markdown owner's internal streaming spec; do not add a global test API.
The new spec supplies a correctness mode and benchmark mode with machine
receipts for the matrix above. Pin the command/fixture/profile parameters in
S0 before comparison. Run configured Firefox/WebKit clipboard correctness too;
if capability is unavailable, record the exact gap without claiming browser parity.
The existing dialect benchmark entrypoint is
`benchmarks/editor/benchmarks/plate-markdown-dialect-benchmark.ts`; retain its
runner's source identity and frozen budgets.

Adoption includes package type contracts and smoke exports, BaseEditorKit
integration, html browser/server barrels and installed slice behavior tests.
Run `pnpm brl` after export changes and regenerate registry from source only.

Public teaching: `content/docs/(plugins)/(serializing)/{html,markdown,docx}.mdx`
and their Chinese counterparts, export/streaming examples, callback JSDoc and
registry metadata/changelog. Teach current behavior, not migration prose.
Best API doctrine repair updates only affected source rules, the smallest
Vision owner and a new immutable Plate Next version; apply Skiller once and
verify mirrors/schema-adoption checks. Never edit generated skills.

Reconcile the clipboard laws in
`docs/editor-behavior/editor-protocol-matrix.md` and current evidence with the
actual browser results. Package/registry changesets describe intentional breaks.
No release or public tracker action is part of execution authority here.

Start Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Prior decisions and source owners | Yes | Boundary/mapping reviews reconciled above; current boundary fingerprint matching at intake. |
| Scope and authority | Yes | Design only, with explicit future execution slices. |
| First-principles target | Yes | D1–D12 compare deletion/reuse and name each public addition's current job. |
| Scale applicability | Yes | Syntax cache, conversion passes and mounted streaming costs are material; no runtime-ready claim. |
| Baseline/target and correctness | Yes | Existing receipts retained; S0 freezes exact new candidate and applicable cohorts before measurement. |

Work Checklist:

- [x] Reconcile all five review candidates and prior mapping D1–D7.
- [x] Settle feature-owned validation, descendant reads and retained-source requirements.
- [x] Specify exposure, actual claims, defaults, metadata, projections and loss severity.
- [x] Specify neutral paste transport and exact-mounted postcommit feedback.
- [x] Resolve public cuts, type/caller/doc adoption and package ownership.
- [x] Compare previous-result reuse with a handle and converted-result caching.
- [x] Preserve failed/incomplete performance evidence and leave runtime acceptance gated.
- [x] Freeze prefix, state, identity, lifetime, scale and non-AI proof obligations.
- [x] Prepare ordered execution, teaching/doctrine repair and source-linked final checks.

Completion Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| End state 1 Mappings | Yes | Met. 11 element and 13 mark declarations; the read Proxy and the `mark` flag are gone. The round-trip conformance harness has 34 fixtures and is mutation-checked; list accounting is exact (S1). `encodeAttributes` claims what its output keeps (closure review). |
| End state 2 Loss | Yes | Met. Property loss warns and content loss follows `lossPolicy` in Markdown, HTML and DOCX export (S1, html-safety, D1, closure review). Link import keeps an absent `target` absent. |
| End state 3 Safety | Yes | Met. One private role policy backs the feature validators and every format boundary, with the navigation floor and `allowedSchemes` above it (S2). HTML and DOCX run a whole-tree pass (html-safety). Output and retained bytes are checked (D1), and v54 neutralizes legacy values (v54-safety). The safety probe pins the closed state (27 assertions). |
| End state 4 Transfer | Yes | Met, amended. Decoders report diagnostics, and `Editable.onPasteResult` and `EditorContent` deliver them once to the initiating view (T1). The registry toast is removed by decision `2026-09-29-imports-opt-in-paste-result`, and delivery is opt-in. |
| End state 5 Streaming | Yes | Met for parsing and publication. Converted-segment reuse with invalidation and aggregate limits; a source with definitions parses whole. Consumers splice, and the strict final continues the latest preview. The joiner is deleted (S4 measurement). The Chromium matrix passes all 16 cells (S5 verdict-2, source identity proven against the final tree). End-to-end streaming stays open on static preview rendering. |
| End state 6 Plite | Yes | Met. Per-update cost follows the change; the law for changed ancestor `children` arrays is recorded (P1). |
| End state 7 DOCX | Yes | Met. 87% of repository fixtures are eligible, so the deletion gate keeps retention; ineligible source regenerates (D1). |
| End state 8 Surface | Yes | Met. Detached `parseHtmlSlice` is cut, and `decodeHtmlDataTransfer` is public for transfer formats that prepare HTML (D8 amendment). |
| End state 9 Closure | Yes | Met. See Verification evidence. English and Chinese docs, doctrine v250, changesets, registry output and changelog, barrels and both plans' ledger records are current. Gates pass, or fail only where HEAD fails, except one timing budget that passes on rerun. |
| Production scale rerun | Yes | S5 verdict-2 on final code; the tracked Markdown benchmark against HEAD. |
| Native/browser/artifact proof | Yes | Chromium: streaming lifetime, correctness, clipboard, upload and DOCX. Firefox and WebKit: clipboard and upload. Real DOCX package fixtures (D1). |
| Docs/doctrine/public API proof | Yes | Type contracts, doctrine validation, docs parity, registry freshness and changelog check. |
| Publication / P1 Autoreview | No | No publication was requested; Autoreview does not run on `next`. |

Phase / pass table:

| Phase | Status | Evidence |
| --- | --- | --- |
| S0 Baseline | Folded into the lanes | Each lane measured its own baseline against HEAD: the Markdown benchmark (S1 and closure), edit latency (P1), HTML traversal (html-safety), the DOCX inventory (D1) and the streaming baseline arm (S5). |
| S1 Mappings | Complete | Execution log, S1 entries |
| S2 Safety | Complete | Lanes html-safety and v54-safety; the safety probe's closed state |
| S3 Transfer and cuts | Complete | Lane T1; `parseHtmlSlice` cut with type contracts |
| S4 Consumers | Complete | [Lane S4](../research/probes/2026-09-28-conversion-boundary/lanes/s4/REPORT.md) |
| S5 Reuse and joiner | Adopted | [Lane S5](../research/probes/2026-09-28-conversion-boundary/lanes/s5/REPORT.md), verdict-2 |
| S6 Teaching and closure | Complete | This section and the ledger record |
| P1, D1, authored | Complete | Their lane receipts |

Verification evidence:

Final tree, 2026-09-29. Where a gate is red at HEAD as well, it is compared
with the same command at HEAD (`a7750ad388`) in a scratch worktree.

- Packages: `pnpm --filter platejs test` 141/141 and `pnpm --filter plitejs
  test` 21/21 (turbo tasks); the Markdown partition 223/223 with the
  continuation oracle; the HTML, DOCX and static partitions pass.
- Types and lint: `pnpm typecheck` 101/101; `pnpm --filter www typecheck`
  passes (editor contracts, API reference, docs parity, registry freshness and
  source, both tsconfigs); `pnpm lint` passes.
- Checks that also fail at HEAD:
  - `pnpm lint:type-aware` reports nothing HEAD does not (145 unique findings
    against 148).
  - The schema-adoption checker reports the same 37 findings as HEAD.
- Root suites:
  - `pnpm test` fails 27 tests, against 151 at HEAD. 26 of them also fail at
    HEAD: caption, code block, media and video element specs, DOCX and
    clipboard benchmark authorities, one ListKit case and one SuggestionKit
    case. The 27th, a schema-construction timing budget, passes on rerun.
  - The act-leak guard in the shared test setup fires in neither suite.
  - `pnpm test:slow` fails 25 tests, all of which also fail at HEAD (26 there;
    the extra is a TableGrid benchmark budget).
- Packed release proof (`pnpm plite:release:packages`; output in [`lanes/formats/packed-release-proof.log`](../research/probes/2026-09-28-conversion-boundary/lanes/formats/packed-release-proof.log)):
  4 packages, 93 public subpaths, NodeNext and Bundler declarations, Node
  import of 88 runtime entrypoints, React-free headless execution for 46,
  DOM-free SSR rendering, DCE, 45 optional-peer closures and the refreshed
  size baseline.
- Webpack DOCX export ([`lanes/s5/renderer-proof/`](../research/probes/2026-09-28-conversion-boundary/lanes/s5/renderer-proof/),
  run 2):
  - The production webpack build compiles, with the docs routes included.
  - Chromium `docx.spec` 3/3, `clipboard.spec` 6/6 and `static-clipboard.spec`
    1/1.
  - Export as HTML downloads and loads only the real `server.browser`
    renderer chunks; the legacy stub chunk is never requested.
  - Run 1, with the bare specifier, failed Next's compile check.
- Doctrine: Plate Next v250 validates (fingerprint `sha256:10edff18…`); the
  skill mirrors are regenerated.
- Registry: `build:registry` output is fresh, and the changelog `--check`
  passes.
- Browser (Chromium production builds, S5 verdict-2 snapshot):
  - streaming correctness 6/6 and lifetime 14/14;
  - clipboard 6/6, upload 3/3 and docx 3/3;
  - ai-session 18/19, with the known narrow-view failure.
  - Firefox and WebKit pass clipboard 6/6 and upload 3/3 (verdict run).
- Benchmarks:
  - S5 verdict-2: all 16 cells pass. The final tree's continued-parse path is
    byte-identical to its snapshot, and a current-tree headless run matches
    (verdict-2 `SOURCE-DIFF.md`).
  - Markdown dialect benchmark: adoption passes, and B4's absolute budget
    fails as it did before this plan.
  - P1 and html-safety receipts.

Open risks:

Outside this plan's end state, each with a named owner:

- **Static preview rendering (Plate static renderer).** Static and AI previews
  build a new read-only view on every commit, so `ElementStatic`'s memo misses
  and every block re-renders on every publication: 24–51 s of React work at
  50 KB. A fix needs dependency-aware static rendering, because TOC, list
  numbering and footnotes read the document.
- **Authored editors.** An editor with authored changes still loads its whole
  value per preview. Making that proportional needs an incremental authored
  load (authored owner). A correction after a full replacement costs 41 to
  223 ms on a 33 KB document with 300 tables (Plite core).
- **Plite (P1 open items).** Skip replay in `resolveHead` (history), the Yjs
  controller's per-commit inverse, and the whole-document
  `RootChange.between` diff.
- **Media validators.** `defineMediaPlugin(kind)` repeats the role that each
  media `url` validator declares. It needs a plugin-owned validator accessor,
  a Best API decision.
- **Streaming polish.** Identity starts at the third preview (a full partial
  parse could record segments). A trailing unclosed inline marker such as
  `**ord` shows for at most 32 ms (the joiner trade-off).
- **Pre-existing failures, unchanged.**
  - The schema-adoption checker's 37 findings.
  - 26 fast-suite failures in element, benchmark-authority and kit specs.
  - The static paragraph HTML round trip (`div` against `p`).
  - Three `AIChatPlugin.submit` backward-selection slow tests.
  - The ai-session narrow-view spec.
  - The B4 inline-tag doubling budget.

Final handoff prepared:

Everything in the execution program landed. Parser and publication reuse is
adopted on measured evidence. End-to-end streaming performance stays open on
static preview rendering, and the other gaps are named follow-ups with
owners.
The working tree is uncommitted; the user owns commits on `next`.
