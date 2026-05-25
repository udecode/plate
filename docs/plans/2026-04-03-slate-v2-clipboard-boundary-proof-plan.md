---
date: 2026-04-03
topic: slate-v2-clipboard-boundary-proof-plan
status: approved
---

# Slate v2 Clipboard Boundary Proof Plan

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Revise the clipboard-boundary proof so it reflects the real missing seam:
this is not just a DOM boundary proof. `slate-v2` still needs minimal fragment
meaning and insertion-facing parse semantics before `slate-dom-v2` can prove the
clipboard boundary honestly.

## Grounded Scope

- Owner packages:
  - `slate-v2`: selected-fragment extraction plus one explicit fragment
    insertion primitive and replacement semantics
  - `slate-dom-v2`: custom MIME key, `DataTransfer`, HTML scraping, plain-text
    export, clipboard boundary helpers
- Explicitly out of scope:
  - true schema isolation
  - editor/schema identity systems
  - React ownership of clipboard semantics
  - silent inheritance of full legacy list/table/inline-edge parity
- Honest size:
  - small public surface
  - medium core-surgery risk
  - expect roughly 10-14 touched files across core code, DOM code, and tests
  - 6-8 files was fantasy

## RALPLAN-DR Summary

### Principles

1. Prove the real seam, not the flattering fake one.
2. Put only minimal fragment meaning in `slate-v2`; keep browser transport in
   `slate-dom-v2`.
3. Pin one concrete core API instead of inventing a parser-shaped abstraction.
4. Use payload provenance/version guards, not pretend schema isolation.
5. Keep MIME keys, HTML scraping, and plain-text export strictly DOM-owned.
6. Lock behavior with public contract tests before polishing helpers.
7. If the proof needs generic low-level structural ops as public surface, stop and re-plan.

### Top Drivers

1. `slate-v2` currently lacks fragment extraction, fragment insertion-facing
   semantics, delete-fragment semantics coverage, and any paste-target
   primitive.
2. The proof must preserve package ownership:
   `slate-v2` for fragment meaning, `slate-dom-v2` for clipboard transport.
3. The plan must stay minimal enough to ship, but honest enough not to smuggle
   core semantics into the DOM layer.
4. The proof must not disguise a general tree-edit rewrite behind one flattering fragment API.

### Options

#### Chosen: Minimal split seam

- `slate-v2` adds:
  - `Editor.getFragment(editor)`
  - `Transforms.insertFragment(editor, fragment, options?)`
  - semantics coverage for both collapsed insertion and expanded-range
    replacement/delete-fragment paths
- `slate-dom-v2` adds:
  - MIME-key handling
  - `DataTransfer` read/write
  - HTML fragment scraping
  - plain-text export / fallback hooks

Why chosen:

- this is the smallest cut that still admits an honest boundary proof
- but only if the implementation stays on private helpers and avoids exporting generic low-level node ops

#### Rejected: DOM owns fragment parsing and insertion semantics

Why rejected:

- recreates the exact blur the proof is supposed to remove

#### Deferred: True schema/editor isolation

Why deferred:

- `slate-v2` does not yet have explicit schema/editor identity, so claiming
  real isolation now would be bullshit with types on it

## ADR

### Decision

Adopt a two-package proof with a minimal core seam:

- `slate-v2` owns fragment extraction and one explicit fragment insertion
  primitive consumed by insertion/replacement flows.
- `slate-dom-v2` owns clipboard transport:
  MIME keys, `DataTransfer`, HTML scraping, and plain-text export/fallback.
- Payload provenance/version envelope checks stay in `slate-dom-v2`.
- True schema/editor isolation is deferred until `slate-v2` grows explicit
  identity.

### Why

The architect feedback is right: without core fragment extraction and
insertion semantics, a DOM-only proof is fake. This split keeps
core meaning in core and browser junk at the browser edge.

### Consequences

- More than one package changes; this is broader than the earlier estimate.
- Replacement semantics must be tested as first-class behavior, not implied.
- The core seam is intentionally narrow:
  one read primitive and one write primitive, not a generic parser layer.
- Any API naming should avoid promising durable schema identity it does not yet have.
- The proof is explicitly limited to fragment shapes already representable by current `Descendant[]` and ordinary text/block paste targets.

### Follow-ups

- Add true schema/editor isolation only after explicit identity exists in
  `slate-v2`.
- Keep future `slate-react-v2` work as thin delegation only.
- If the proof starts demanding generic low-level ops like `insert_node`,
  `remove_node`, or `split_node`, stop and re-plan.

## Kill-Test Checkpoint

Before execution approval, prove one narrow implementation claim:

- collapsed insertion plus expanded replacement can be implemented in `slate-v2`
  behind `Transforms.insertFragment(...)`
  using private helpers only, without exporting generic low-level structural ops

If that checkpoint fails:

- stop
- do not keep pretending this is a minimal clipboard proof
- re-plan around a broader core replacement seam

## Concrete Phased Plan

### Phase 0: Contract reset

- Rewrite the proof statement around the real seam.
- Define the minimum public contracts:
  - `slate-v2`:
    - `Editor.getFragment(editor)`
    - `Transforms.insertFragment(editor, fragment, options?)`
  - `slate-dom-v2`:
    - write clipboard payloads
    - read clipboard payloads
    - fall back between fragment/html/plain text

Acceptance:

- No section still describes this as DOM-only.
- No section claims schema isolation.
- One read primitive and one write primitive are named explicitly.
- The kill-test checkpoint is part of the plan, not an implicit hope.

### Phase 0.5: Brownfield ownership extraction

Current clipboard ownership is smeared. Make the target disposition explicit before code moves:

| Current owner                           | Current role                                                  | Target disposition                                                                         |
| --------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| legacy `slate` editor transform surface | exposes DOM clipboard methods on editor                       | delete from the proof path; do not mirror into v2                                          |
| `ViewPlugin.setFragmentData`            | fragment MIME write plus HTML/plain-text export               | move conceptually to `slate-dom-v2`                                                        |
| `withSetFragmentDataTable`              | table-specific clipboard write override                       | audit as downstream compatibility pressure; no parity promise in this slice                |
| `AstPlugin`                             | fragment MIME decode/check                                    | wrap temporarily while v2 DOM helpers take over                                            |
| `ParserPlugin`                          | `DataTransfer -> deserialize -> insertFragment` orchestration | replace with v2 seam and keep out of `slate-react-v2`                                      |
| `HtmlPlugin`                            | current `text/html` parser owner                              | replace with DOM-owned HTML read/scrape seam in v2                                         |
| `pipeInsertDataQuery`                   | parser eligibility / can-handle checks before insert          | delete from proof path unless a specific v2 DOM helper proves it needs an eligibility hook |
| `pipeTransformData`                     | payload mutation before deserialize/insert                    | delete from proof path in this slice                                                       |
| `pipeTransformFragment`                 | transform stage before insertion                              | DOM-owned compatibility hook only if needed; no v2 parity promise in this slice            |
| `pipeInsertFragment`                    | final insert orchestration into `insertFragment`              | replace with v2 seam and keep ownership out of `slate-react-v2`                            |
| current React copy-event bridge         | copy event glue that calls fragment-data writer               | keep as thin delegation only in this slice; do not let it own semantics                    |

Also resolve one `getFragment` composition collision explicitly:

- core keeps `Editor.getFragment(editor)` as the model-fragment meaning
- DOM-side APIs must not reuse `getFragment` to mean selected DOM fragment
- existing downstream `getFragment` override consumers must be treated as composition pressure, not ignored:
  - table
  - diff

Acceptance:

- the implementer can point at each legacy owner and say `move`, `wrap temporarily`, or `delete`
- `getFragment` meaning and override/composition pressure are no longer ambiguous in the plan
- HTML/import ownership and current React copy glue are also named explicitly
- Phase 0.5 no longer leaves ownership choices to implementation improvisation

### Phase 1: Core tracer bullet

- Add a failing end-to-end contract test proving:
  selected fragment -> clipboard payload -> decoded fragment ->
  replacement insertion on paste target

Acceptance:

- One red test spans the whole seam.
- Test asserts user-visible document result, not helper internals.

### Phase 2: Kill-test gate

- Before any DOM transport work, prove one narrow implementation claim:
  - collapsed insertion plus expanded replacement can be implemented in
    `slate-v2` behind `Transforms.insertFragment(...)`
  - implementation stays on private helpers
  - no generic low-level structural ops become public

Decision:

- if this passes, continue to Phase 3
- if this fails, stop immediately and re-plan around a broader core replacement seam

Acceptance:

- this is a real stop/go phase gate
- DOM work does not start before this answer exists
- one small audit list of current `insertFragment` override consumers exists so the proof does not accidentally break hot downstream assumptions without noticing them

### Phase 3: `slate-v2` minimal seam

- Add `Editor.getFragment(editor)`.
- Add `Transforms.insertFragment(editor, fragment, options?)`.
- Add/cover both:
  - collapsed selection insertion
  - expanded selection replacement/delete-fragment semantics needed by paste
- Implement through private helpers only. Do not export generic low-level node ops in this slice.
- Audit known downstream `insertFragment` override consumers as compatibility pressure only:
  - table
  - list-classic
  - code-block
  - suggestion
    The proof does not need parity here, but it must not ignore them.

Acceptance:

- Core tests prove extraction and fragment insertion behavior.
- The proof does not add a generic parser/result abstraction to `slate-v2`.
- The proof does not export generic structural ops just to make `insertFragment` possible.
- The compatibility audit is written down even if no code is changed for those consumers in this slice.
- `getFragment` override/composition pressure is explicitly called out for:
  - table
  - diff

### Phase 4: `slate-dom-v2` clipboard boundary

- Add clipboard writer/reader helpers around opaque core fragment payloads.
- Keep custom MIME key config in DOM.
- Keep HTML scraping in DOM.
- Keep plain-text export/fallback in DOM.
- Keep payload provenance/version envelope checks in DOM.

Acceptance:

- DOM tests prove MIME, HTML, and plain-text paths without taking over core
  meaning.
- HTML false positives are rejected by the bounded contract.

### Phase 5: Hardening pass

- Add direct tests for:
  - collapsed selection fragment insertion
  - replacement of expanded selections
  - delete-fragment semantics during paste replacement
  - custom MIME key override
  - malformed / foreign / stale payload rejection
  - HTML false-positive resistance
  - plain-text fallback

Acceptance:

- Each pressure has one direct contract test.
- No test relies on private field names or helper call counts.
- The hardening pass does not silently widen into full legacy parity work.

## TDD Tracer-Bullet Order

1. Red: end-to-end round-trip paste replacement contract.
2. Red: `slate-v2` selected-fragment extraction contract.
3. Red: `slate-v2` collapsed-selection `insertFragment` contract.
4. Green: smallest core implementation to satisfy 2-3.
5. Gate: if this requires public low-level structural ops, stop and re-plan.
6. Red: `slate-dom-v2` MIME read/write contract.
7. Green: smallest DOM implementation for opaque payload transport.
8. Red: expanded-selection replacement and delete-fragment semantics contract.
9. Green: smallest insertion-path semantics to satisfy replacement behavior.
10. Red: malformed/foreign/stale provenance rejection contract.
11. Red: HTML false-positive contract.
12. Red: plain-text fallback contract.
13. Green: smallest DOM fallback behavior.
14. Refactor: names and helper boundaries only after all contracts hold.

## Acceptance Criteria

1. The plan no longer frames the work as DOM-only.
2. `slate-v2` owns `Editor.getFragment(editor)` and
   `Transforms.insertFragment(editor, fragment, options?)`.
3. `slate-dom-v2` owns MIME keys, `DataTransfer`, HTML scraping,
   provenance/version envelope checks, and plain-text
   export/fallback.
4. Validation language uses payload provenance/version guard, not schema
   isolation claims.
5. Both collapsed insertion and expanded replacement/delete-fragment semantics
   are covered explicitly.
6. Scope is documented as broader than the earlier 6-8 file estimate.
7. The plan includes a stop rule against ballooning into generic low-level node ops.
8. The semantic subset is explicitly narrow: current `Descendant[]` shapes and ordinary text/block paste targets only.
9. Brownfield ownership extraction is explicit enough that implementation should not need to invent package ownership mid-flight.

## Verification

- Review the revised plan against the architect synthesis line by line.
- Confirm every ownership statement maps cleanly to either `slate-v2` or
  `slate-dom-v2`, never both.
- Confirm no section promises true schema/editor isolation.
- Confirm the core seam is pinned to one read primitive and one write primitive.
- Confirm TDD order starts with end-to-end behavior, then drives core seam before DOM transport details.
- Confirm acceptance criteria cover collapsed insertion, replacement behavior,
  provenance/version rejection, MIME ownership, and DOM fallback ownership.
- Confirm the plan explicitly says “stop and re-plan” if private-helper implementation cannot contain the core surgery.
- Confirm the kill-test is a numbered phase gate before DOM work, not just prose.
- Confirm the legacy owner extraction table and `getFragment` naming note remove brownfield ambiguity.

## Short Summary For Architect

Revised plan now treats clipboard-boundary proof as a two-package seam, not a
DOM-only proof. `slate-v2` now gets one pinned narrow seam:
`Editor.getFragment(editor)` plus `Transforms.insertFragment(editor, fragment, options?)`,
with both collapsed insertion and expanded replacement/delete-fragment semantics
covered. `slate-dom-v2` keeps all transport concerns: MIME keys, `DataTransfer`,
HTML scraping, provenance/version envelope checks, and plain-text export/fallback.
Schema isolation is deferred; the plan now has a stop rule against drifting into
generic low-level node ops, plus a kill-test checkpoint to prove this can stay
a narrow seam instead of becoming a disguised general tree-edit rewrite.
