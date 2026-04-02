# Editor Performance Next Phase Consensus Plan

## Status

- Mode: `ralplan`
- Deliberation: `deliberate`
- Source context:
  [deep-interview-editor-performance-rest-plan.md](/Users/zbeyens/git/plate-2/.omx/specs/deep-interview-editor-performance-rest-plan.md)
- Primary evidence:
  [editor-perf-layer1-core-plugins-summary.json](/Users/zbeyens/git/plate-2/.claude/docs/plans/editor-perf-layer1-core-plugins-summary.json)

## RALPLAN-DR Summary

### Principles

1. Kill generic framework tax before blaming individual plugins.
2. Preserve public API and e2e behavior unless a large measured win proves the
   current architecture is the ceiling.
3. Widen when the current lane stops producing structural wins.
4. Benchmarks decide sequencing; aesthetics do not.

### Decision Drivers

1. Remaining red cheap/core plugins are marks, not blocks:
   `bold +13.67 ms`, `italic +15.71 ms`, `underline +19.44 ms`.
2. Underline dissection already proved the live seam is generic leaf/text pipe
   composition, not underline-specific behavior.
3. The main user constraint is avoiding breaking changes while still pushing
   for the best practical result versus Slate.

### Viable Options

#### Option A: Keep grinding cheap marks until they are basically green

Pros:

- Maximizes local parity before widening.
- Keeps the current hot seam isolated and measurable.

Cons:

- High risk of devolving into diminishing-return polishing.
- Delays evidence on whether the next plugin class is actually now worse.

#### Option B: Widen immediately to the next plugin class

Pros:

- Faster coverage of the full Layer 1 space.
- Avoids obsessing over a single family.

Cons:

- Leaves a proven generic seam partially unresolved.
- Pollutes wider results with known residual cheap-mark tax.

#### Option C: One more generic cheap-mark/core pass, prove on a harder sibling,
then widen

Pros:

- Finishes the highest-yield generic seam without demanding fake perfection.
- Produces a cleaner handoff into broader plugin census work.
- Best fit for the user’s “push hard, don’t break users” constraint.

Cons:

- Requires discipline on the stop condition.
- Could still drift if “one more pass” is interpreted loosely.

### Chosen Direction

Choose **Option C**.

Do one bounded final push on the generic cheap-mark core seam, prove the cut on
one harder sibling mark, then widen to the next plugin class instead of chasing
single-digit vanity wins on bold/italic/underline.

### Alternative Invalidation

- Option A is invalid as the default because it optimizes the chart longer than
  it optimizes the framework.
- Option B is invalid as the default because we already know the current red
  seam is generic and still worth fixing.

## Deliberate Pre-Mortem

1. We keep “one more pass”ing cheap marks for days and learn nothing new.
   - Guard: explicit widening gate after the next generic cut and sibling-mark
     proof.
2. We land an internal fast path that quietly breaks plugin composition edge
   cases.
   - Guard: no public API or e2e behavior changes without explicit escalation;
     verify on sibling marks and current Layer 1 presets.
3. We widen too early and misread the next plugin class because cheap-mark tax
   is still contaminating the baseline.
   - Guard: freeze Layer 1 again immediately after the final cheap-mark pass.

## Architect Review Pass

- Verdict: `ITERATE`
- Steelman antithesis:
  Widen now. Cheap marks are already in a manageable band, and continuing here
  risks optimizing a narrow family while heavier plugin classes become the real
  user-facing bottleneck.
- Real tradeoff tension:
  isolating the last generic cheap-mark seam versus avoiding a local maximum
  where we keep polishing marks after the structural win is mostly captured.
- Hidden risks:
  - "materially lower" was too vague to act on
  - "next plugin class" was underspecified and could let the plan drift
  - proving on one harder sibling mark could still stay too mark-local unless
    the widening path is named
- Required synthesis:
  keep the hybrid strategy, but add an explicit widening gate and a named next
  plugin-class sequence

## Architect Re-review Pass

- Verdict: `APPROVE`
- Remaining concern:
  the `+12 ms` threshold is still a policy breakpoint, not a naturally magical
  line from the current artifacts. Fine. It is concrete enough to execute.
- Synthesis:
  ship the plan, run one bounded cheap-mark/core pass, validate on a harder
  sibling plus one non-mark control, re-freeze Layer 1, then widen.

## Critic Review Pass

- Verdict: `APPROVE`
- Findings:
  - principles, drivers, and option choice are aligned
  - alternatives are fair enough and the chosen option is not a strawman win
  - deliberate pre-mortem is specific and tied to real failure modes
  - verification is concrete and uses the actual package/build/benchmark path
  - acceptance criteria are testable enough to start execution
- Residual caution:
  - the `+12 ms` / `<5 ms improvement` widening gates are policy thresholds, not
    natural constants
  - that is acceptable because the user explicitly delegated the practical bar
    and the stronger hard boundary is breakage risk
- Execution readiness:
  - yes; the next lane, widening rule, verification path, and no-breakage guard
    are all explicit enough to execute without another planning pass

## ADR

- Decision:
  Use a hybrid sequence: one bounded final generic cheap-mark/core pass, then
  widen.
- Drivers:
  Known generic seam, remaining mid-teens mark deltas, and a strong no-breakage
  bias.
- Alternatives considered:
  cheap-mark perfection first, or immediate widening.
- Why chosen:
  It keeps the highest-yield generic work in scope without turning the phase
  into mark-specific bench theater.
- Consequences:
  Cheap marks are not required to be perfect before widening, but they do need
  to be materially better and no longer obviously structural.
- Follow-ups:
  re-freeze Layer 1, then pick the next plugin class by measured delta rather
  than hunch.

## Execution Plan

### Phase 1: Final Generic Cheap-Mark Pass

Goal:

- Remove the next generic leaf/text composition cost that still hits simple
  mark plugins.

Scope:

- `renderLeaf` / `renderText` coordination
- shared mark composition
- no plugin-specific one-offs unless the evidence flips

Deliverables:

- one targeted core cut
- focused benchmark artifacts for the changed seam
- updated cheap-mark dissection notes if the bottleneck moves

Exit gate:

- the cut is clearly generic
- one bounded pass only; do not reopen this phase indefinitely
- after the pass, widen if either:
  - all cheap-mark activated deltas are at or below `+12 ms`, or
  - the worst remaining cheap-mark activated delta improves by less than
    `5 ms` absolute versus the current baseline band
- no breakage to public API or e2e behavior
- no regression to plugin-composition semantics on the touched mark family
- no regression on one non-mark control lane

### Phase 2: Harder Sibling Validation

Goal:

- Prove the Phase 1 cut generalizes beyond bold/italic/underline.

Candidate sibling marks:

- `CodePlugin`
- `StrikethroughPlugin`

Deliverables:

- at least one harder sibling mark added to the census/dissection lane
- one non-mark control lane kept in the check set
- evidence that the new cut generalizes or a clear explanation why it does not

Exit gate:

- the sibling mark improves by at least `5 ms` absolute, or we stop calling the
  remaining cost a generic core seam
- the non-mark control does not regress by more than `3 ms`

### Phase 3: Re-freeze Layer 1

Goal:

- Lock the new baseline before widening.

Deliverables:

- fresh
  [editor-perf-layer1-core-plugins-summary.json](/Users/zbeyens/git/plate-2/.claude/docs/plans/editor-perf-layer1-core-plugins-summary.json)
- master-plan update with the current cheap/core state

Exit gate:

- summary artifacts are current
- cheap/core work no longer looks like the highest-yield generic seam

### Phase 4: Widen to the Next Plugin Class

Goal:

- Move into the next measured plugin class rather than endlessly polishing
  cheap marks.

Selection rule:

- choose the next class by benchmark delta and user-facing importance
- prefer generic/core classes before bundle theater

Candidate next classes to measure and rank after the freeze:

1. richer mark family:
   - `CodePlugin`
   - `StrikethroughPlugin`
2. one structural control lane:
   - `HrPlugin`
3. only after that, re-rank heavier plugin classes:
   - selection-heavy lanes
   - table/media/comments if their measured deltas dominate

## Acceptance Criteria

- Cheap/core mark deltas improve materially from the current band:
  `bold +13.67 ms`, `italic +15.71 ms`, `underline +19.44 ms`.
- The kept win is generic across sibling marks, not underline-specific surgery.
- No public API or e2e behavior break is introduced by default.
- Existing plugin-composition semantics hold on the touched mark family.
- One non-mark control lane stays within `3 ms` regression tolerance.
- Layer 1 is re-frozen before widening.
- The plan widens after at most one more bounded cheap-mark pass.
- The next plugin class is chosen by measured delta from the candidate set, not
  frustration.

## Verification Plan

### Unit

- targeted tests for touched leaf/text pipeline logic
- targeted tests for any new generic mark fast path guard

### Integration

- `pnpm install`
- `pnpm turbo build --filter=./packages/core --filter=./apps/www`
- `pnpm turbo typecheck --filter=./packages/core --filter=./apps/www`
- `pnpm lint:fix`
- rerun focused editor-perf lanes for the changed seam
- rerun the full Layer 1 preset once the bounded cheap-mark pass is done:
  `pnpm --filter ./apps/www perf:editor:layer1-core-plugins -- --url http://localhost:3011/dev/editor-perf`

### E2E / Browser

- browser gut-check on the live `/dev/editor-perf` surface after harness edits
- verify on the live Plate server actually serving the page, not blindly on
  `3000`; override the perf runner URL when needed

### Observability / Benchmark Artifacts

- preserve raw before/after artifacts for each claimed win
- update the master plan with the new measured state instead of freehand
  narration

## Available Agent Types

- `default`: best for planner / architect / critic reasoning
- `explorer`: best for bounded codebase fact gathering
- `worker`: best for isolated implementation slices when execution starts

## Staffing Guidance

### For `ralph`

- Lane 1: generic cheap-mark seam implementation
- Lane 2: benchmark verification and artifact freeze
- Lane 3: widen into the next plugin class only after Lane 2 is green

Suggested reasoning:

- high for Lane 1
- medium for Lane 2
- high for Lane 3 selection, medium for Lane 3 implementation

### For `team`

- Worker 1: core leaf/text seam
- Worker 2: benchmark harness / Layer 1 freeze
- Worker 3: next-plugin-class scouting after the freeze

Verification path:

- Worker 1 lands cut
- Worker 2 validates and freezes
- Worker 3 only starts widening work from the frozen baseline
