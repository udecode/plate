---
date: 2026-04-02
topic: slate-v2-package-impact-matrix
pilot: false
pilot_scope: 682 open issues
repo: ianstormtaylor/slate
---

# Slate v2 Package Impact Matrix

## Scope

This is the full package-ownership pass over all `682` open Slate issues already triaged into the ledger.

The `682` count is the frozen `2026-04-02` research snapshot.

Post-snapshot maintainer triage update:

- Dylan executed Batch A
- `54/54` queued issues are now closed
- live repo open-issue count is `628`

The point is not to assign every bug to exactly one box and pretend boundaries do not exist. The point is to decide where each major pain class should be owned by default in a v2 architecture, so roadmap work stops smearing across packages.

## Inputs

- source of truth: [open-issues-ledger.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-issues/open-issues-ledger.md)
- theme map: [issue-clusters.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-issues/issue-clusters.md)
- package boundaries from the local `../slate/packages/*` repo layout

## Top-Line Package Pressure

Direct issue ownership across all `682` ledger rows:

| Package impact | Issues |
|---|---:|
| `cross-package` | 267 |
| `slate-react` | 136 |
| `slate` | 100 |
| `docs-only` | 69 |
| `ecosystem` | 49 |
| `site/examples` | 32 |
| `repo-only` | 12 |
| `slate-history` | 11 |
| `slate-dom` | 4 |
| `slate-hyperscript` | 2 |

Collapsed by ownership lane:

| Ownership lane | Issues |
|---|---:|
| runtime boundary (`cross-package` + `slate-react` + `slate-dom`) | 407 |
| core engine (`slate` + `slate-history` + `slate-hyperscript`) | 113 |
| maintainer noise (`docs-only` + `site/examples` + `repo-only` + `ecosystem`) | 162 |

Strong take:

- the runtime boundary is the real center of gravity
- raw direct counts still understate `slate-dom`, because many DOM bugs are correctly triaged as `cross-package`
- the main ownership problem is boundary smear, not lack of packages

## Current Package Roles

| Package | Current responsibility | What it should not absorb by default |
|---|---|---|
| `slate` | document model, operations, normalization, refs, core editor semantics | browser quirks, React lifecycle timing, example/docs drift |
| `slate-react` | React runtime, hooks, rendering, event/lifecycle integration | low-level DOM point translation that should be shared beyond React |
| `slate-dom` | DOM bridge, point/path translation, clipboard DOM formats, browser-facing editor glue | React subscription policy, hook ergonomics, general engine semantics |
| `slate-history` | undo/redo semantics over core operations | general selection repair, DOM ownership, render timing |
| `slate-hyperscript` | document construction helpers and test/document authoring ergonomics | runtime selection/input bugs, general API clutter |
| docs/examples | onboarding, examples, reference, support load reduction | architecture decisions that belong in packages |

## Theme Ownership Matrix

| Theme | Package pressure | Primary owner | Secondary owners | Default v2 target | Why |
|---|---|---|---|---|---|
| Mobile, IME, And Input Semantics | `124` runtime, `4` maintainer, `1` core | `slate-react-v2` + `slate-dom-v2` | `slate-v2` | shared input pipeline | composition, placeholder, Android/iOS quirks, and selection reconciliation live at the runtime boundary, not in the pure document model |
| Performance And Scalability | `7` runtime, `5` core, `1` maintainer | shared | `slate-v2`, `slate-react-v2`, `slate-dom-v2` | benchmark-driven cross-cut | perf issues map back to engine cost, subscription breadth, or browser-selection behavior, not to a standalone perf package |
| React Runtime, Identity, And Subscription Model | `105` runtime, `5` maintainer, `1` core | `slate-react-v2` | `slate-v2` | React runtime rewrite | subscriptions, focus lifecycle, editor instance replacement, and render breadth belong to the React package, backed by better core snapshots |
| Selection, Focus, And DOM Bridge | `118` runtime, `35` core, `19` maintainer | `slate-dom-v2` + `slate-react-v2` | `slate-v2` | shared runtime boundary | DOM translation and selection repair are browser/runtime work first, with core only providing stable identity and commit semantics |
| Clipboard, Serialization, And External Formats | `27` runtime, `4` core, `6` maintainer | `slate-dom-v2` + `slate-v2` | `slate-hyperscript-v2` | import/export seam cleanup | DOM clipboard handling and internal fragment semantics need a cleaner boundary than the current implicit coupling |
| Core Model, Operations, Normalization, And History | `54` core, `9` runtime, `6` maintainer | `slate-v2` | `slate-history-v2` | engine rewrite | this is where transactions, operation ownership, normalization debt, and stable identity earn their keep |
| API, Typing, And Extensibility | `12` core, `10` runtime, `11` maintainer | `slate-v2` | `slate-react-v2`, `slate-hyperscript-v2` | core contract cleanup | this is mostly about the public model, operation contracts, type guards, and extension seams |
| Docs, Examples, Support Noise, And Repo Churn | `110` maintainer, `7` runtime, `1` core | docs/examples/repo | none | non-v2 lane | this is maintainer-load and onboarding debt, not a reason to distort the architecture |

## Cross-Cutting Runtime Seam: Decorations, Marks, And Annotations

At least `19` explicitly-tagged issues in the ledger land on this seam. The macro clusters spread them across React runtime, performance, selection, API shape, and collaboration, but ownership is still clear.

**Primary owner:** `slate-react-v2`  
**Secondary owner:** `slate-v2`  
**Tertiary owner:** `slate-dom-v2` when the failure crosses into DOM selection or range translation

Why:

- `slate-react-v2` should own decoration subscriptions, render-time mark projection, cross-node decoration behavior, and annotation rendering hooks.
- `slate-v2` should own stable range and mark semantics, overlapping metadata behavior, and anchor identity that survives selection movement and replacement.
- `slate-dom-v2` should only step in when decorated or annotated content interacts with browser range translation, inline boundaries, or selection repair.

Representative issues:

- `#5987`
- `#3354`
- `#3352`
- `#3383`
- `#2465`
- `#4483`
- `#4477`

## Ownership Rules

Use these before assigning a future issue to the wrong lane:

1. If the bug is reproducible in pure transform/history tests, start in `slate`.
2. If the bug needs DOM point translation, native selection state, clipboard DOM, shadow DOM, or browser hit-testing, start in `slate-dom`.
3. If the bug is about rerenders, hook values, focus timing, placeholder lifecycle, editor replacement, or React event timing, start in `slate-react`.
4. If the bug is really about undo grouping or transaction boundaries after core fixes, then and only then push it into `slate-history`.
5. If the issue is mostly about document construction helpers, testing JSX/hyperscript ergonomics, or adapter sugar, start in `slate-hyperscript`.
6. If the issue disappears once the example or docs are corrected, keep it out of the v2 package roadmap.

## What This Clarifies For v2

### `slate-v2`

Own:

- transaction-first execution
- op-first external model
- normalization ownership
- stable node identity that does not pollute the serialized JSON shape
- history-friendly commit boundaries

Do not own by default:

- mobile/browser quirks
- focus repair
- React hook shape

### `slate-react-v2`

Own:

- selector-based subscriptions
- snapshot consumption
- focus and lifecycle correctness
- placeholder/render timing
- editor instance replacement and controlled/external update ergonomics

Do not own by default:

- generic DOM point/path translation
- core transform semantics

### `slate-dom-v2`

Own:

- DOM point/path translation
- selection bridge
- clipboard DOM formats
- shadow DOM and nested-editor ownership rules
- browser-specific input and hit-testing seams that are not React-specific

Do not own by default:

- hook APIs
- history semantics

### `slate-history-v2`

Own:

- transaction-aware undo units
- operation grouping policy
- collaboration-friendly history boundaries

Do not own by default:

- general selection bugs
- browser-owned focus or composition failures

### `slate-hyperscript-v2`

Own:

- fixture/document authoring ergonomics
- test/document-construction helpers
- optional adapter-facing sugar

Do not own by default:

- core runtime pain
- general typing debt in `slate` or `slate-react`

## Sharp Conclusions

1. The runtime roadmap belongs mostly to `slate-react-v2` and `slate-dom-v2`, not to `slate-v2` pretending it can own every browser cut.
2. `slate-v2` still matters most architecturally, but for engine semantics, not for every cursor glitch or mobile composition wound.
3. The low direct `slate-dom` count is misleading. The DOM bridge is still one of the biggest actual ownership surfaces because `cross-package` is dominated by runtime-boundary failures.
4. Docs/examples need a real maintenance lane, or they will keep poisoning the roadmap signal.
5. `slate-history-v2` and `slate-hyperscript-v2` are supporting packages, not the center of gravity.

## What This Does Not Mean

- It does not mean `slate-v2` should become React-shaped.
- It does not mean every input-method bug is Slate-owned instead of browser-owned.
- It does not mean `slate-dom-v2` should become a dumping ground for every awkward runtime problem.

## Next Artifact

The next useful file is:

- [requirements-from-issues.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-issues/requirements-from-issues.md)

That should turn this ownership split into actual v2 requirements instead of leaving it as a taxonomy exercise.
