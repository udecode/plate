# Replace Toggle with semantic Details

Objective:
Lock an execution-ready hard-cut plan that replaces the flat, indentation-based
Toggle feature with semantic Details and Summary nodes across `platejs`, the
registry, serialization, migration, docs, tests, and entrypoint proof.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-08-29-replace-toggle-with-semantic-details.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- none

Mode:
- `standard`

Completion threshold:
- Binary readiness: live claims are sourced, one owner exists per
  responsibility, every decision is resolved, every public break has adoption
  and proof, execution slices are concrete, conditional gates are resolved,
  and `check-complete` passes.

Verification surface:
- Live source audits cover Toggle runtime, tests, exports, entrypoint metadata,
  codecs, registry items, examples, current docs, testing JSX, static rendering,
  and versioned migrations.
- The `best-api` verdict fixes imports, plugin identities, persisted JSON,
  operations, view state, live rendering, static rendering, and deletion scope.
- Accepted execution has exact package, Turbo, Oxlint, Node, headless, SSR,
  browser, registry, docs, stale-name, bundle-size, changeset, and repository
  proof gates.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-08-29-replace-toggle-with-semantic-details.md` returns zero.

Constraints:
- Planning only until the user explicitly accepts this exact plan and invokes
  `plate-plan` against it.
- No public compatibility aliases, deprecated exports, dual schemas, runtime
  shims, or forwarding `platejs/toggle` entrypoint.
- Preserve document content, order, IDs, marks, supported properties,
  selection, model-backed copy, undo/redo, SSR, and browser editing behavior.
- Summary is one rich inline text block. A multi-block header is a different
  future Disclosure or Accordion feature.
- `open` is view state. It never enters JSON, history, Yjs, autosave, HTML
  decode state, or Markdown state.
- Details remains an independent feature entrypoint. `platejs` does not
  re-export its implementation.
- Package entrypoints export individual descriptors. Registry/application code
  alone owns `DetailsKit` and `BaseDetailsKit`.
- Keep one planning artifact; the audit is small enough that a second generated
  ledger adds no value.

Boundaries:
- In scope: replace Toggle source, entrypoints, capability names, AST,
  operations, React behavior, static rendering, registry UI and transforms,
  codecs, docs/examples, tests, testing JSX, generated contracts, migration,
  changeset, registry changelog, DAG, Turbo partitions, Oxlint boundaries,
  runtime lanes, and bundle-size baselines.
- Source owners: `packages/platejs`, `packages/plitejs/src/testing`,
  `packages/test`, `tooling/entrypoints`, entrypoint/release proof scripts,
  `apps/www/src/registry`, the server-side example, current plugin docs, and
  applicable source rules or Vision files only if doctrine changes.
- Non-goals: generic Accordion/Disclosure primitives, multi-block summaries,
  exclusive `name` groups, tabs, menus, footnotes, a persisted/public
  `DetailsContent`, a package kit, root re-exports, or implementation during
  this planning goal.
- Direct Plite boundary owners: schema fitting, structural transactions,
  `NodeKey`, DOM coverage, selection, clipboard, history, and browser proof.
  The target reuses them. No Plite runtime change is planned; only the public
  testing shorthand participates in the hard cut. A proven substrate failure
  stops execution and routes to `plite-plan`.

Output budget strategy:
- Read named owners first and expand only from import, export, codec, migration,
  or registry evidence. Count broad stale audits instead of streaming matches.

Blocked condition:
- Block only if execution proves that Plite cannot enforce the ordered Details
  structure without loss, cannot represent a hidden direct-child range, or
  cannot restore selection before a body closes. Do not invent a Plate
  workaround for one of those substrate failures.

Plate Plan state:
- status: ready-for-review
- phase: prove-and-hand-off
- next: user acceptance
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Full plan only; `best-api` precedes `plate-plan`; semantic `details` plus `summary`; unlimited direct body blocks; no implementation before acceptance. |
| Active goal and plan verified | yes | Active goal names this file and its binary checker threshold. |
| Current owners read | yes | Toggle source/tests, exports, DAG/Turbo, Plite DOM coverage, registry/static/server consumers, docs, JSX fixtures, and v54/v55 migrations were read live. |
| Best API target resolved | yes | The verdict below fixes public nouns, persisted model, operations, state, renderers, and rejected alternatives. |
| Mode and execution boundary resolved | yes | Standard planning mode; product changes require explicit acceptance of this file. |

Work Checklist:
- [x] Explicit requirements captured: full plan only; use `best-api` then
  `plate-plan`; hard-cut Toggle; semantic Details and Summary; unlimited direct
  body blocks; one inline-rich Summary; no implementation before acceptance.
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and the private migration bridge have complete adoption and deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | API, ownership, adoption, slices, proofs, budgets, and stop conditions are fixed below. |
| Fresh source evidence | yes | Recheck decision-changing claims | Live checkout evidence was refreshed on 2026-08-29 and recorded below. |
| Best API review | yes | Resolve every P0/P1 finding | The hard-cut review deletes each P0/P1 compatibility or duplicate-owner candidate. |
| Conditional risk and adoption | yes | Cover migration, docs, browser, SSR, and release | Every triggered owner has an execution slice and falsifiable proof. |
| Verification recorded | yes | Record planning proof and execution gates | Source searches, external standard evidence, self-review, and checker output are recorded below. |
| Handoff prepared | yes | Prepare ownership, breaks, proof, risks, and order | The final handoff names all five. |
| P1 autoreview | no | Planning-only artifact | No implementation diff exists; execution ends with P1 `autoreview --max-priority P1`. |
| Goal plan complete | yes | Run the goal checker | `check-complete` returned zero for this exact file on 2026-08-29. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Current owners, consumers, migration chain, Plite primitives, Tiptap, ProseKit, and HTML were audited. | Decide |
| Decide | complete | Public target, hard cuts, migration, runtime lanes, registry ownership, and budgets are fixed. | Prove and hand off |
| Prove and hand off | complete | Binary ledger, slices, commands, risk stops, and user handoff are prepared. | User review |

Decision brief:
- outcome: Replace the fake flat Toggle list with a real nested Details model.
- chosen shape: `platejs/details` owns headless Details/Summary descriptors and
  structural behavior; `platejs/details/react` owns client behavior; registry
  kits own live/static components; `platejs/static` remains the SSR renderer.
- strongest rejected alternative: copy Tiptap's three-node
  Details/Summary/DetailsContent model and make `open` optionally persistent.
- consequence: consumers get semantic JSON and HTML with fewer concepts, but
  every Toggle import, type, kit, transform, fixture, and current doc changes in
  one hard cut.

Best API target:

```ts
import {
  BaseDetailsPlugin,
  BaseDetailsSummaryPlugin,
  type BaseDetailsPluginState,
  type DetailsElement,
  type DetailsSummaryElement,
} from 'platejs/details';

import {
  DetailsPlugin,
  DetailsSummaryPlugin,
} from 'platejs/details/react';
```

There is no feature implementation export from `platejs`, no
`platejs/details/static`, and no package-level kit.

Persisted model:

```ts
{
  type: 'details',
  children: [
    { type: 'summary', children: [{ text: 'Title' }] },
    { type: 'paragraph', children: [{ text: 'Body' }] },
    // zero or more additional body blocks; nested Details are valid
  ],
}
```

Construction supplies at least one body Paragraph for editability. Decode and
correction accept native Summary-only Details, so no fake required wrapper is
introduced.

Capability names and persisted identities differ deliberately:

```ts
PLUGINS.details = 'details';
PLUGINS.detailsSummary = 'detailsSummary';

BaseDetailsPlugin.schema.type === 'details';
BaseDetailsSummaryPlugin.schema.type === 'summary';
```

`detailsSummary` names the plugin capability. `summary` is the stable JSON and
HTML identity. A bare `summary` plugin name loses its owner; a persisted
`detailsSummary` leaks package vocabulary into a native format.

Public operations:

```ts
const details = editor.plugin(BaseDetailsPlugin);

details.update.insert({}, { select: true });
details.update.wrap();
details.update.unwrap();
details.api.setOpen(detailsKey, true);
```

The final selector uses the existing inferred plugin selector convention and
is named `isOpen(key)`. Do not add a feature-specific React hook. There is no
batch `toggleKeys`, nullable force flag, expand-all API, flat descendant index,
or structural method named `toggle`.

Structural contract:

- `BaseDetailsSummaryPlugin` is a non-root text block with rich inline children
  and fixed schema type `summary`.
- `BaseDetailsPlugin` is block content and depends on Summary plus Paragraph so
  it can construct valid editable content without an application kit.
- Details allows one first Summary followed by normal block content. Nested
  Details are valid body blocks.
- Schema cardinality narrows child kinds. A Details correction owns ordering
  and uniqueness because current schema rules are not positional.
- Correction moves the first Summary to index zero, converts extra Summaries to
  the default text block without dropping inline content, inserts an empty
  Summary when absent, and rejects unrepairable nodes. An orphan Summary becomes
  the default text block.
- `update.insert` overrides generic construction while retaining the inferred
  `insert(data, options)` shape. It creates Summary plus Paragraph, opens the
  new Details in view state, and selects Summary.
- `update.wrap` consumes selected top-level blocks. A first text block becomes
  Summary; remaining blocks become body. If the first block is structural, an
  empty Summary is inserted and every selected block remains body. Wrapping one
  text block adds an empty body Paragraph.
- `update.unwrap` emits Summary as the default text block, then lifts body
  blocks in order. It preserves IDs, marks, supported properties, and selection.
- Insert, wrap, unwrap, correction, and migration are undo/redo and
  collaboration-safe document transactions. Open/close never enters history.

View-state and interaction contract:

- `BaseDetailsPluginState` contains only `openKeys: Set<NodeKey>` and remains
  Node-safe; the React descriptors consume it without owning second state.
- Loaded Details start closed. Newly inserted or wrapped Details start open.
- Open state follows node keys across path moves and is pruned on deletion. A
  new node at the old path does not inherit state.
- Closing while selection is in body moves selection to the end of Summary
  before unmount. `setOpen` owns that action without document history.
- Programmatic materialization opens through `setOpen`.
- Enter in an open Summary moves into the first body block at the end, or moves
  trailing split text into a new first Paragraph from the middle.
- Enter in a closed Summary exits after the whole Details; body stays untouched.
- Enter in the final empty body exits after Details while retaining one empty
  editable body Paragraph.
- Backspace at Summary start unwraps. Backspace at first-body start moves to
  Summary without merging the two roles.
- Delete at a closed Summary end and arrow navigation skip hidden body. No key
  handler computes indentation or intercepts unrelated siblings.

Renderer contract:

- Live registry `DetailsElement` uses an editor-safe container and explicit
  button, not native interactive behavior inside contenteditable.
- It renders child zero with `slots.children({ from: 0, to: 0 })` and indices
  one through the end through `slots.contentBoundary`.
- Body boundary uses `mounted: isOpen`, `copyPolicy: 'model'`,
  `selectionPolicy: 'skip'`, `reason: 'app-collapse'`, no visible placeholder,
  and `onMaterialize` to open. Delete CSS-height hiding.
- Button is `contentEditable={false}`, has an accessible name,
  `aria-expanded`, and a stable body relationship when an ID exists.
- `DetailsSummaryElement` is the editable title row, not a block container.
- Static registry components render native `<details>` and `<summary>`. Static
  output is closed by default; all body content remains in HTML.
- Package code exports descriptors/state. Registry code exports kits,
  components, and static counterparts.

Codec contract:

- The feature owns native `text/html` codecs for fixed `<details>` and
  `<summary>` tags. Decode maps them to configured Plate types.
- `open` and `name` are not document properties. `name` grouping is Accordion
  behavior and remains out of scope.
- The feature owns `text/markdown` MDX codecs with fixed `details` and `summary`
  names, matching existing structural feature codecs. Plain CommonMark without
  MDX must fail explicitly or use the markdown owner's unsupported-node policy;
  it must not flatten body content silently.
- HTML, MDX, static render, copy, and migration preserve direct body children.
  None introduces `DetailsContent`.

Hard-cut counterfactual:

| Candidate | Verdict | Reason |
| --- | --- | --- |
| `platejs/toggle` and `/react` | delete | Name and flat AST describe the wrong feature. |
| Toggle plugins and `PLUGINS.toggle` | delete | No compatibility ontology survives. |
| Toggle index and indentation scan | delete | Nested JSON owns containment. |
| CSS visibility and `useToggle` | delete | Plite owns absent editable DOM. |
| `DetailsContent` model node/plugin | do not create | Direct body children are native and simpler. |
| Persisted or optional `open` | do not create | One feature must not have two document shapes. |
| Package `DetailsKit` | do not create | Apps compose kits. |
| `platejs/details/static` | do not create | `platejs/static` already owns SSR. |
| Generic `update.toggle` | do not create | Ambiguous between wrapping and opening. |
| Feature-specific React hook | do not create | Existing plugin-store primitives suffice. |
| Root feature re-export | do not create | Details is not universal editor foundation. |
| Public legacy converter | do not create | Versioned migration is the only justified private bridge. |

Best API finding ledger:

| Priority | Finding | Resolution |
| --- | --- | --- |
| P0 | Rebranding the flat text block preserves the wrong AST and navigation code. | Replace it with a nested container and delete the implementation. |
| P0 | Persisting `detailsSummary` confuses capability and document identity. | Plugin name `detailsSummary`; schema type `summary`. |
| P0 | Removing Toggle without document conversion strands v54 beta data. | Add one private v55 structural migration; no runtime alias. |
| P1 | `DetailsContent` would exist only to ease hiding. | Use Plite's direct-child range boundary. |
| P1 | Persisted `open` creates content/history/collaboration ambiguity. | Key-based transient state only. |
| P1 | Package kits/components create two composition owners. | Registry owns kits and UI. |
| P1 | Root re-export makes opt-in code reachable everywhere. | Details subpaths only. |
| P1 | Generic set-type transforms create invalid structural JSON. | Details owns inferred insert/wrap/unwrap. |

Live source evidence:

- `packages/platejs/src/features/toggle/lib/BaseTogglePlugin.ts:10-87`
  stores `openKeys` plus `toggleIndex`, scans root indentation, and exposes
  batch keys and enclosure selectors.
- `packages/platejs/src/react/features/toggle/TogglePlugin.tsx:14-120` wraps
  Enter/Delete around hidden flat siblings; `useToggle.internal.ts` rebuilds
  the index; `ToggleVisibility.internal.tsx` hides DOM with CSS.
- `packages/plitejs/src/react/components/editable-text-blocks.tsx:220-226`
  exposes a boundary for model-present content absent from DOM.
  `dom-coverage-boundary.tsx:47-57` defaults range boundaries to model copy,
  skipped selection, and app-collapse semantics.
- `packages/platejs/src/features/layout/lib/BaseColumnPlugin.ts:44-75` proves
  dependency-complete structural content and feature-owned MDX codecs; lines
  147-210 prove schema cardinality plus correction ownership.
- `tooling/entrypoints/entrypoint-dag.mjs:81-113` declares Toggle entries;
  lines 175-199 derive runtime/dependency proof; lines 408-417 classify
  `platejs/static` as SSR.
- `packages/platejs/package.json:317-325`, `tsdown.config.mts:21,36`,
  `tsconfig.json:66-67`, `packages/platejs/turbo.json`, and
  `tsconfig.entrypoints/toggle*.json` are the package partition surface.
- `tooling/entrypoints/platejs-entrypoint-sizes.json:18,31` records retired
  baselines of 831,606 bytes headless and 1,271,554 bytes client.
- Registry Toggle, static, toolbar, default kits, Indent, and List owners show
  the current UI is coupled to flat indentation.
- `content/docs/(plugins)/(elements)/toggle.mdx:27-168` and its Chinese peer
  teach the old entrypoint, Indent dependency, kit, plugin, and batch API.
- `packages/plitejs/src/testing/jsx.ts:102,148` and
  `packages/test/src/jsx.ts:102,148` separately publish `htoggle`; both change.
- `packages/platejs/src/migrations/v53-manifest.ts:65` freezes Toggle in v53.
  `migratePlateV55.ts:58` owns v54 beta to final v55, so the bridge belongs
  there, not in `migratePlateV54`.
- Local Tiptap `extension-details/src/details.ts:69-130` models native Details;
  its Summary is text-only and its DetailsContent owns body hiding/keyboard
  escape. Plate needs the semantics, not the wrapper.
- Local ProseKit has no semantic Details extension. Its `toggle` is a list kind
  in `packages/extensions/src/list/list-types.ts:8-18`; matching it preserves
  the list ontology this cut rejects.
- The HTML Living Standard defines one Summary followed by flow content, while
  Summary contains phrasing content optionally mixed with headings. Plate takes
  a narrower one-rich-inline Summary subset:
  <https://html.spec.whatwg.org/multipage/interactive-elements.html#the-details-element>.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Package | Toggle subpaths | Details subpaths | DAG + Plate package | Independent feature, one package. | Hard rename. | export/runtime proof | stale imports | accepted |
| Root reachability | subpath feature | subpath feature | root + DAG | Default registry is not package foundation. | names only at root | bundle graph | accidental export | accepted |
| AST | flat Toggle + indented siblings | nested Details/Summary/body | Base plugins + migration | Containment belongs in JSON. | v55 bridge | schema/migration tests | malformed legacy depth | accepted |
| Summary identity | Toggle text | capability `detailsSummary`, type `summary` | Summary plugin | Context plus native identity. | fixtures/codecs update | configured-type test | identity confusion | accepted |
| Body | external siblings | direct children | Details plugin | Native and wrapper-free. | transforms/values rewrite | nested tests | ordered repair | accepted |
| Schema | text block | structural rules + correction | Plate schema/correction | No positional rule grammar. | Summary/Paragraph deps | fitting tests | data loss | fail closed |
| Operations | generic text toggle | insert/wrap/unwrap | Details update API | Generic set-type is invalid. | registry routes here | selection/history tests | shortcut drift | accepted |
| Open state | Set + descendant index | one NodeKey Set | Details API | Paths move; state is not content. | setOpen/isOpen | identity tests | stale keys | accepted |
| Hidden DOM | CSS over flat siblings | child-range boundary | registry + Plite | Model copy/selection already work. | contentBoundary | browser/copy proof | focus edges | accepted |
| Live UI | Toggle row | container/button/Summary | registry live UI | Portable editor behavior. | new kit/components | three engines | accessibility | accepted |
| Static UI | Toggle div | native Details/Summary | registry + static | Standards-native output. | static kit | DOM-free SSR | client leak | accepted |
| Codecs | none | native HTML + MDX | headless feature | Feature owns semantics. | add codecs | roundtrip | accidental open | accepted |
| Registry transforms | set block type | Details operations | registry transforms | Structure needs an owner. | update all actions | transform tests | action mismatch | accepted |
| JSX testing | `htoggle` twice | `hdetails` + `hsummary` twice | Plite/test packages | Fixtures express real AST. | hard rename | types/tests | map drift | accepted |
| Legacy data | runtime Toggle | private v55 migration | migration owner | Serialized data is hard law. | app migration chain | fixture matrix | malformed depth or unsupported properties | fail closed |
| Docs | Toggle current state | Details current state | docs + registry | One public ontology. | rename/rewrite | docs/stale scan | history false positives | accepted |
| Block styling | Indent/List also define containment | Indent/List may target Details only as orthogonal properties | registry configs + migration | Preserve styling without reviving flat bodies. | retarget to Details; body always uses children | styling/migration tests | depth reused as containment | accepted |
| Dependencies | Toggle behavior relies on Indent | core; React peer on client | DAG + manifest | Styling plugins may target Details without a feature import. | remove dependency, keep target configs | DAG/Oxlint | cross-entry leak | accepted |
| Cache | Toggle partitions | Details partitions | generated Turbo | Preserve per-entrypoint scale. | regenerate | affected tests | broad invalidation | accepted |
| Bundle | Toggle snapshots | fixed Details budget | release proof | Subpaths still need budgets. | reviewed update | size checker | code growth | accepted |
| Vision/skills | no feature doctrine | retain existing law | Vision + source rules | Current laws already cover target. | stale audit | parity if edited | churn | accepted |

Public breaks and adoption:

| Break | Adoption | Deletion answer |
| --- | --- | --- |
| `platejs/toggle` | Import from `platejs/details`. | Delete export; no proxy. |
| `platejs/toggle/react` | Import from `platejs/details/react`. | Delete export; no proxy. |
| Toggle plugins | Use Details and Summary descriptors. | Delete symbols/barrels. |
| `PLUGINS.toggle` | Use Details or DetailsSummary by role. | Delete key; unrelated operation verbs stay. |
| `{ type: 'toggle' }` | Store nested JSON; migrate old values through v55. | No current schema alias. |
| Toggle APIs/index | Use structural methods and setOpen/isOpen. | Delete every old API. |
| Toggle kits/components | Use registry Details equivalents. | Delete files/names. |
| `htoggle` | Use nested `hdetails` and `hsummary`. | Delete both shorthands. |
| Toggle docs/demo | Use Details docs/demo/value. | Delete current route/metadata; preserve immutable history. |

Versioned migration contract:

- Leave the frozen v53 manifest and `migratePlateV54` unchanged. A v53
  document reaches the accepted v54 beta profile before v55 performs this cut.
- Extend `migratePlateV55` with a sibling-aware child-array pass for document
  children and named roots. Detect legacy `toggle` without a runtime alias.
- Reuse the old effective-depth law: list-bearing nodes count at `indent - 1`;
  others count at `indent`. Consume consecutive following siblings deeper than
  the legacy Toggle.
- Convert Toggle inline children to Summary and keep stable ID on Details.
  Preserve supported list/indent properties on Details as block styling, move
  title-only presentation properties when compiled Summary schema owns them,
  and consume only the depth that represented an old enclosure. Preserve
  relative list depth and order.
- Recursively convert nested legacy Toggles and stop at equal/shallower peers.
- Throw a location-rich error for a property the compiled Details/Summary
  schemas cannot own, a collision, non-finite indentation, invalid grouping
  node, or missing target type. Never guess or drop data.
- The old literal may remain only in frozen profile data, private migration and
  tests, release notes, and immutable changelog. It never reaches current
  runtime schema or current docs.

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Lock contract | `best-api` + feature owner | Capability names/types; headless source; delete public Toggle names. | Accepted plan. | Exact descriptors/AST/state/API. | API type tests + stale scan. |
| 2. Headless feature | `plate-plugin-creator` | Schema, correction, codecs, operations, state pruning. | Slice 1 identities. | Valid creation/nesting/repair. | Headless partition checks. |
| 3. Client behavior | `plate-plugin-creator` + `plate-ui` | React descriptors, keys, keyboard, collapse/materialize. | Headless invariants. | No flat index/CSS hiding. | React + DOM boundary tests. |
| 4. Migration/fixtures | migration + test owners | v55 conversion, schema fit, two JSX maps, markdown fixture. | Current migration chain. | Convert or fail closed. | Migration and testing-package suites. |
| 5. Entrypoint tooling | DAG owner | DAG, tsdown, generated exports/paths/tsconfigs/scripts/Turbo/runtime/Oxlint/sizes. | Details source exists. | Only correct subpaths publish/cache. | Generator, manifest, runtime, cache, size proof. |
| 6. Registry | `plate-ui` + registry | Components/kits, transforms, menus, default/static kits, style targets, values, metadata. | Source paths resolve. | All consumers use Details; Indent/List never defines its body. | Registry tests, www types, SSR. |
| 7. Current teaching | `docs-creator` + release owners | English/Chinese docs/demo, changelog, changeset, agent stale audit. | Final API/UI. | One current ontology. | docs/registry build, release validation. |
| 8. Runtime lanes | package/runtime owners | Node import, headless execution, SSR, browser client. | Prior slices green. | Every runtime class exercised. | Artifact proof, SSR, client smoke, three engines. |
| 9. Close | `plate-feature` | Barrels, format/lint fix, full checks, P1 review, size review. | Focused proof green. | Ready to commit; no commit without authority. | `pnpm check:plite`, `pnpm check`, autoreview, stale scan. |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Headless has no React/DOM | Generated headless runtime exists. | Node import and React-free execution for `platejs/details`. | specified |
| Client stays client-only | Generated client row owns React peer. | Browser runtime proof + manifest peer check. | specified |
| Static is DOM-free | `platejs/static` has SSR adapter. | Node SSR renders `<details><summary>`; RSC route loads. | specified |
| Body is direct/unbounded | Standard + Plite child range. | Zero/one/many/nested schema tests. | specified |
| Summary is first/unique | Positional correction required. | Missing/moved/duplicate/orphan repair tests. | specified |
| Open is transient | Target deletes persisted variants. | JSON/history/Yjs/HTML/MDX/reload tests. | specified |
| Closed content is safe | Boundary defaults model/skip. | Copy, selection, find/materialize, key browser cases. | specified |
| Registry creates valid JSON | Generic transform is insufficient. | Insert/slash/turn-into/toolbar exact JSON tests. | specified |
| Legacy data survives | v55 owns beta upgrade. | Simple/nested/boundary/list-style/indent/root/property/error/chain fixtures. | specified |
| Old public API is gone | Owners inventoried. | Scoped allowlisted `rg`, export/types proof. | specified |
| Cache scale holds | Toggle is partitioned today. | Details change selects only Details/dependents. | specified |
| Root excludes Details | It stays outside root features. | Packed graph and root size proof. | specified |
| Bundle does not bloat | Retired sizes known. | Each <= 102% old; combined <= 2,103,160 bytes. | specified |
| Browser behavior portable | Live native interaction rejected. | Chromium/Firefox/WebKit interaction matrix. | specified |
| Docs/agents current | Old docs exist; no doctrine hit. | Docs build, stale scan, mirror parity if rules edit. | specified |

Bundle gates:

- `platejs/details` maximum: 848,238 bytes, 102% of retired headless entry.
- `platejs/details/react` maximum: 1,296,985 bytes, 102% of retired client entry.
- Combined maximum: 2,103,160 bytes, exactly the retired combined total.
- Root `platejs` must not gain Details implementation reachability and stays
  within its existing snapshot tolerance.
- Do not update a failing snapshot. Simplify first; changing these limits needs
  explicit plan amendment and user acceptance.

Exact execution commands:

```bash
pnpm entrypoint:turbo:generate
pnpm entrypoint:turbo:check
pnpm test:manifests
node --test tooling/scripts/entrypoint-dag-plugin.test.mjs tooling/scripts/entrypoint-turbo.test.mjs tooling/scripts/entrypoint-turbo.slow.test.mjs

pnpm --filter platejs lint:partition:details
pnpm --filter platejs lint:partition:details-react
pnpm --filter platejs typecheck:partition:details
pnpm --filter platejs typecheck:partition:details-react
pnpm --filter platejs test:partition:details
pnpm --filter platejs test:partition:details-react
pnpm --filter platejs lint:partition:migrations
pnpm --filter platejs typecheck:partition:migrations
pnpm --filter platejs test:partition:migrations
pnpm --filter plitejs lint:partition:testing
pnpm --filter plitejs typecheck:partition:testing
pnpm --filter plitejs test:partition:testing
pnpm --filter @platejs/test typecheck:partition:root
pnpm --filter @platejs/test test:partition:root

pnpm plite:entrypoint-sizes:update
pnpm plite:release:boundaries
pnpm check:plite

pnpm brl
pnpm --filter www build:registry
pnpm --filter www typecheck
bun test apps/www/src/registry/components/editor/transforms.spec.ts apps/www/src/registry/blocks/plate-to-html/plate-to-html-kit.test.ts

pnpm check
node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-29-replace-toggle-with-semantic-details.md
```

`build:registry` is mandatory locally on `next`; other branches follow the
repository generation rule. Generated files are never hand-edited.

Stale public-surface audit:

```bash
rg -n "platejs/toggle|BaseTogglePlugin|TogglePlugin|ToggleKit|BaseToggleKit|ToggleVisibility|useToggle|htoggle|PLUGINS\\.toggle|type: ['\"]toggle['\"]" packages apps content tooling \
  --glob '!packages/platejs/src/migrations/migratePlateV55*' \
  --glob '!packages/platejs/src/migrations/v53-manifest.ts' \
  --glob '!apps/www/src/registry/changelog/**' \
  --glob '!content/docs/migration/**'
```

Expected result: zero. Generic UI Toggle components, verbs such as
`toggleBold`, and immutable history do not belong to this ontology.

Browser proof:

- Start `www` and open `/blocks/details-demo` through the in-app Browser. If
  registry generation chooses another standalone block route, use that route,
  not a docs wrapper.
- Exercise mouse/keyboard disclosure, Summary editing, many body blocks,
  nesting, wrap/unwrap, closed selection/copy, and focus return.
- Repeat the matrix in Chromium, Firefox, and WebKit. Generated client smoke
  proves import execution but does not replace behavior proof.
- Open the server-side example and Plate-to-HTML block. Confirm no
  `window`/`document` access on server, semantic HTML, and clean hydration.

Conditional evidence:
- High-risk scenarios: structural migration, selection into absent DOM,
  model-backed copy, multi-engine editing, client/static import direction,
  cache invalidation, and bundle reachability all have dedicated proof rows.
- External research: the WHATWG model was read on 2026-08-29; local Tiptap and
  ProseKit were audited. Tiptap validates semantics but its body wrapper is
  rejected because Plite owns range coverage. ProseKit's Toggle is a list and
  is deliberately not copied.
- Issue/PR provenance: no public issue or PR defines this request. The user owns
  the product decision; execution needs explicit acceptance of this file.
- Docs/registry/browser/release/behavior-law owners: all apply. Existing Vision
  and rules already state the governing laws, so doctrine files change only if
  implementation changes one of those laws.

Findings:

- Current Toggle is a text block whose descendants are inferred from later root
  siblings and Indent/List metadata. It is not a disclosure container.
- That forces root scans, path indexes, hidden-sibling workarounds, Delete
  interception, and misuse of Indent as a containment system.
- Plite already supplies direct-child DOM coverage with model copy, skipped
  selection, and materialization.
- Schema can restrict kinds/cardinality but not “one Summary first”; a feature
  correction is honest. General sequence grammar is speculative until proven.
- Tiptap's DetailsContent solves its node-view constraint. Copying it worsens
  Plate JSON without benefit.
- Package tooling already has headless/client/SSR classifications and
  per-entrypoint Turbo tasks. This cut retains that granularity.
- v55 is the correct migration owner. Editing the frozen v53 profile or v54
  migration would rewrite recorded history.
- `plate-to-html.tsx` is intentionally client code. Server-safe owners are its
  kit, static plugins, `platejs/static`, and the RSC route.

Decisions and tradeoffs:

- Keep Details outside root. Common is not universal. The default registry can
  include it without making every package consumer reach it.
- Keep Summary to one inline-rich block. Multiple blocks define a generic
  disclosure header, not Summary.
- Omit a body wrapper. Direct children simplify JSON, HTML, MDX, transforms,
  and nesting; Plite handles hidden DOM.
- Keep list and indent as optional block styling in the default registry. They
  may affect presentation, never which nodes belong to Details.
- Do not persist open state. Collaborative content and personal view state are
  different data.
- Use editor-safe live DOM and semantic static DOM. Native contenteditable
  disclosure behavior is not portable enough.
- Keep one private migration despite the hard cut because serialized documents
  are a correctness boundary; package compatibility is not.
- Fail closed on ambiguous metadata rather than delete or mis-group data.
- Hold replacement bundles to the retired combined budget. Tree shaking is not
  permission for unchecked growth.

Review fixes:

- Corrected migration ownership from v54 to v55 after reading the live package
  version and migration chain.
- Made Summary-only decoded Details valid while constructors still add a body
  Paragraph for editing.
- Added both testing JSX owners; neither shorthand map generates the other.
- Split live and static semantics and added all four runtime proof lanes.
- Added per-entrypoint and combined bundle limits.
- Separated list/indent styling from the deleted flat containment algorithm so
  supported legacy metadata can migrate without loss.
- Scoped stale-name proof away from unrelated UI Toggle controls and verbs.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Broad Tiptap scan exceeded useful output | 1 | Read only three Details source owners. | Exact files established the comparison. |
| Broad Lexical search crossed generated/binary assets | 1 | Limit any execution harvest to source/test paths. | No decision depends on the noisy scan. |
| Oxfmt excluded the plan path | 1 | Keep the hand-authored Markdown and run the plan checker directly. | `check-complete` returned zero; no formatter-owned output was required. |

Verification evidence:

- `best-api` hard-cut review completed against live Plate/Plite source and
  rejected every duplicate public noun and compatibility layer above.
- Current Toggle, registry, docs, test JSX, migration, entrypoint, runtime, and
  size owners were located with scoped searches and line reads on 2026-08-29.
- The current HTML standard and local Tiptap/ProseKit source corroborate the
  semantic model and rejected alternatives.
- Self-review resolved migration version, Summary-only decode, duplicated JSX
  ownership, runtime lanes, and size gates.
- `check-complete` returned zero for this exact file on 2026-08-29.
- Browser execution proof is an accepted-plan gate because planning changed no
  runtime code.

Final handoff prepared:

- Ownership and target API: headless descriptors/operations/codecs in
  `platejs/details`; client behavior in `platejs/details/react`; registry owns
  live/static UI and kits; `platejs/static` owns SSR; v55 owns conversion.
- Public breaks and adoption: all Toggle entrypoints, names, APIs, kits, JSX,
  AST, and current docs disappear in one cut; only private migration and
  immutable history retain the old identity.
- Runtime/package/docs/browser: no optional peers; React peer only on client;
  generated DAG/Turbo/Oxlint; current English/Chinese docs; all four runtime
  proofs; fixed bundle budget.
- Risks: migration grouping and close-selection behavior are highest. Both fail
  closed and need focused plus multi-engine proof before repository closure.
- Order and user attention: accept this file, then execute slices 1-9 through
  `plate-feature`; stop only if a Plite substrate failure or bundle miss changes
  the target.

Timeline:

- 2026-08-29T19:16:11.470Z Plate Plan created.
- 2026-08-29 Current owners and external standards grounded.
- 2026-08-29 Best API hard cut and migration target resolved.
- 2026-08-29 Execution, proof, size, and handoff ledgers completed.
- 2026-08-29 Binary plan checker passed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Planning is complete and ready for user review. |
| Where am I going? | Accepted execution slices 1-9 through `plate-feature`. |
| What is the goal? | Replace flat Toggle with semantic Details without compatibility sludge, data loss, runtime leakage, or cache regression. |
| What have I learned? | Plite owns hidden direct-child DOM; v55 owns the bridge; no DetailsContent or root export is justified. |
| What have I done? | Locked API, ownership, adoption, migration, proofs, budgets, risks, and execution order. |

Open risks:

- Malformed or non-finite legacy depth can make sibling ownership ambiguous;
  migration throws with a location instead of capturing a peer.
- Selection inside an unmounted body can differ by engine; selection must move
  before collapse and pass Chromium, Firefox, and WebKit.
- Structural code may move bytes from client to headless; combined zero growth
  prevents snapshot laundering.
- A failed Plite correction or DOM-coverage oracle routes the smallest proven
  substrate gap to `plite-plan`; Plate does not grow a second engine.
