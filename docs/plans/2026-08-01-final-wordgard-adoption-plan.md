# Final Wordgard adoption plan

Objective:
Execute the accepted Wordgard adoption plan; done when all six slices and proof
gates pass with no compatibility APIs.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-01-final-wordgard-adoption-plan.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- none

Mode:
- standard

Completion threshold:
- All ten accepted packets are implemented through six dependency-ordered
  slices; the three rejected/replaced packets stay absent and the relationship
  rebinding packet stays deferred.
- Package, app, registry, documentation, packed-artifact, strict Plite,
  cross-browser, and autoreview gates pass with no compatibility APIs.
- `editor.plugin(plugin)` is the resolved plugin view itself: descriptor fields
  and scoped capabilities are flat; the public nested `.plugin` wrapper and all
  authored callers/docs are hard-cut.
- Raw-device tooling remains fail-closed, but physical Android/iOS receipts are
  explicitly deferred. This goal makes no raw-device or release-ready claim.

Verification surface:
- Current sources named in the 2026-08-01 Wordgard audit dossiers, rechecked at
  the decision-changing Plate/Plite owners.
- The 14-row ledger in this plan and its dependency-ordered execution slices.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-01-final-wordgard-adoption-plan.md`.

Constraints:
- The user accepted this exact plan with `go all`; implementation is authorized.
- Packet 1 keeps `name` only for capability identity. Element plugins own a
  persisted `type`; property plugins own a persisted `key`. Both default to the
  constructor name but may be independently declared there and nowhere else.
- Use one flat `PLUGINS` catalog; hard-cut `KEYS`, `NODES`, and `STYLE_KEYS`.
- Persisted identity migration is an explicit pure host function before editor
  construction, never an installed plugin and never generic snake-case logic.
- Reject packet 5's extension API in favor of `createEditor({ maxLength })`.
- Reject packet 6; retain `NodeApi`, `PathApi`, `PointApi`, `RangeApi`,
  `TextApi`, and `ElementApi`.
- Reject packet 9; use app/renderer CSS direction for now and add no persisted
  text-direction plugin/property/commands.
- No public compatibility aliases, dual schemas, runtime migration shims, or
  mixed-version Yjs clients.
- Do not preserve `portal.plugin` as an alias. Authoring callback context may
  retain its current-plugin value; consumer portals expose descriptor fields
  directly.

Boundaries:
- In scope: implementation and proof of the ten accepted packets across the 14
  material/deferred dossiers, including migration and adoption.
- Plate owners: `packages/core`, `packages/utils`, feature packages, registry,
  docs tooling, app examples, History/Yjs adoption.
- Plite owners: extension publication, schema defaults, History grouping, DOM
  visual movement, React adoption, and raw-device proof.
- Non-goals: the three rejected/replaced APIs, speculative relationship
  rebinding, compatibility aliases, mixed-version collaboration, release
  publication, or fabricated physical-device evidence.
- Direct Plite boundary owners: `packages/plite`, `packages/plite-history`,
  `packages/plite-dom`, `packages/plite-react`, `packages/browser`, and
  `apps/plite` proof infrastructure.

Output budget strategy:
- Consume the existing strict audit and exact dossier source lists; re-read only
  decision-changing live owners. Cap searches by package and avoid generated
  registry/templates, build output, logs, and broad repository dumps.

Blocked condition:
- Planning stops only if a packet lacks a source-backed owner or the user's
  correction cannot be represented without reopening public API design. Neither
  condition remains.

Plate Plan state:
- status: complete
- phase: execution-closure
- next: none
- handoff: physical-device proof is deferred; the flat portal hard cut is
  complete with no raw-device or release-ready claim

Execution checklist:
- [x] Slice 1: doctrine and identity kernel implemented and proved.
- [x] Slice 2: persisted identity adoption implemented and proved.
- [x] Slice 3: lifecycle, grammar defaults, History idle boundary, and constructor-only max length implemented and proved.
- [x] Slice 4: visual bidi caret and accessible media resize implemented and proved; direction remains CSS-only.
- [x] Slice 5: explicit math CSS and source-backed API facts implemented and proved; `*Api` remains.
- [x] Slice 6: async hover lifecycle and raw-device proof tooling implemented and proved.
- [x] Package/docs/registry adoption, barrels, changesets, lint, Browser, and strict Plite checks complete.
- [x] Final autoreview complete.
- [x] Final stale-API/source topology audit complete.
- [x] `check-complete.mjs` passes the plan-structure contract.
- [x] Direct-Appium Android Chrome and iOS Safari receipts deferred by explicit
  user decision; no raw-device/release-ready claim.
- [x] Core consumer portal directly exposes every compiled descriptor field and
  scoped capability with exact and erased typing.
- [x] Public `portal.plugin` is deleted with no alias; every source/test/current
  doc caller uses the flat portal.
- [x] `best-api`, `plate-next`, `plate-plugin-creator`, and `plite-plan` source
  rules encode the corrected portal/device-proof laws and generated skills sync.
- [x] Core type/runtime proof, affected package proof, stale-symbol audit,
  barrels/lint, and final autoreview pass.

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Constraints record packet 5 constructor API, packet 6 `*Api`, packet 9 CSS, and packet 1's capability/schema identity split. |
| Active goal and plan verified | yes | Active goal names this exact plan and the 14-row threshold. |
| Current owners read | yes | Live `BasePlugin.ts`, portal construction, `plate-keys.ts`, Plite max-length option, `NodeApi` exports, and absence of `textDirection` were rechecked; dossier source lists cover the remaining owners. |
| Best API target resolved | yes | Final target separates capability `name`, element `type`, and property `key`; `PLUGINS` contains capability names only; package calls remain descriptor-first. |
| Mode and execution boundary resolved | yes | The user accepted implementation with `go all`; all source work is authorized. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source or the current strict audit dossier.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and migration have complete adoption/deletion answers; no private compatibility bridge survives.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve all 14 packets and every execution dependency | Decision ledger: 10 accept, three reject/replace, one defer; six ordered slices. |
| Fresh source evidence | yes | Recheck decision-changing current claims | `BasePlugin.ts:180-224,1200-1261`; `createPluginContext.internal.ts:374`; `plate-keys.ts:1-145`; `editor.ts:1349-1362`; `node.ts:639-760`; package-wide `textDirection` search returned no owner. |
| Best API review | yes | Resolve every P0/P1 call-shape question | User-selected final shapes are recorded in packets 1, 5, 6, and 9; other accepted dossier shapes are unchanged. |
| Conditional risk and adoption | yes | Record public-break, persistence, browser, docs, collaboration, and device gates | Risk, proof, and execution sections name each applicable owner; raw-device proof remains an execution/device-lab gate, not planning evidence. |
| Flat plugin portal | yes | Remove the nested compiled-descriptor wrapper and adopt all callers | Core exact/erased portal types, runtime proxy, React hook, caller/docs sweep, type contracts, 3,031 tests, Browser, stale-symbol scan, and final autoreview pass. |
| Verification recorded | yes | Record planning proof and exact execution gates | Proof matrix and verification evidence below. |
| Handoff prepared | yes | Prepare ownership, breaks, proof, risks, and order | Final handoff section is complete. |
| Autoreview | yes | Run local autoreview until no accepted actionable finding remains | Clean after DNS-rebinding and validator findings were repaired; no accepted actionable findings. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-01-final-wordgard-adoption-plan.md` | Plan structure passes; this does not manufacture or replace the separately required Android and iOS receipts. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Attachment, audit dossiers, Vision, current identity/max-length/utility/direction owners read | Decide |
| Decide | complete | Four corrected decisions merged into the 14-row ledger | Prove and hand off |
| Prove and hand off | complete | Owners, slices, risks, proof matrix, and user handoff prepared | Accepted execution |
| Execute slice 1 | complete | Capability `name` split from element `.type` and property `.key`; flat capability-only `PLUGINS`; legacy catalogs removed | Slice 2 |
| Execute slice 2 | complete | Pure explicit AST migration, full package/registry/docs adoption, History/Yjs schema-version boundaries | Slice 3 |
| Execute slice 3 | complete | Atomic activation, schema-owned defaults, `newBatchDelay`, constructor-only max length | Slice 4 |
| Execute slice 4 | complete | Visual bidi affinity and plugin-owned accessible media width; CSS-only direction | Slice 5 |
| Execute slice 5 | complete | Explicit packaged KaTeX CSS and source-derived API facts; root `*Api` retained | Slice 6 |
| Execute slice 6 | complete | Family-owned abortable link hover and fail-closed raw-device proof tooling | Final closure |
| Portal correction | complete | Core and React consumer portals expose descriptor fields and scoped capabilities directly; authoring contexts alone retain `plugin` | Execution closure |
| Execution closure | complete | Root/package/www typechecks, 3,031 tests, lint, stale scans, table Browser proof, doctrine v44, and autoreview pass; raw receipts remain deferred without a raw-device claim | Handoff |

Decision brief:
- outcome: Keep the Plite/Plate stack and adopt ten bounded Wordgard pressure
  packets; reject three unnecessary abstractions; defer relationship rebinding.
- chosen shape: Plate plugins expose capability `name`; element plugins also own
  persisted `type`; property plugins own persisted `key`. `PLUGINS` contains
  capability names only. Schema identities default to the constructor name but
  can diverge only at definition time.
- strongest rejected alternative: universal `plugin.type`, separate global
  `KEYS`/`NODES` catalogs, and configurable identity overrides.
- consequence: ordinary callers use descriptors and portals. Persisted data and
  migrations use schema identities or explicit literals, never capability names.

Final API shapes:

```ts
export const PLUGINS = {
  paragraph: 'paragraph',
  bold: 'bold',
  fixedToolbar: 'fixedToolbar',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
} as const;

const BaseParagraphPlugin = defineBasePlugin(PLUGINS.paragraph, {
  type: 'paragraph',
  schema: { element: schema.element.textBlock() },
});

const BaseBoldPlugin = defineBasePlugin(PLUGINS.bold, {
  key: 'bold',
  schema: { mark: property.boolean({ default: false, omitDefault: true }) },
});

const FixedToolbarPlugin = definePlatePlugin(PLUGINS.fixedToolbar, {
  render: { beforeEditable: FixedToolbar },
});

BaseParagraphPlugin.name; // "paragraph"
BaseParagraphPlugin.type; // "paragraph"
BaseBoldPlugin.name; // "bold"
BaseBoldPlugin.key; // "bold"
FixedToolbarPlugin.name; // "fixedToolbar"
FixedToolbarPlugin.type; // undefined
FixedToolbarPlugin.key; // undefined
```

```ts
const value = [{
  type: BaseParagraphPlugin.type,
  children: [{ [BaseBoldPlugin.key]: true, text: 'Hello' }],
}];

const packageTargets = [BaseParagraphPlugin]; // package owner
const registryTargets = [PLUGINS.paragraph];  // copied registry owner
```

```ts
const initialValue = migratePlateAstIdentities(persisted.document, {
  types: {
    p: 'paragraph',
    a: 'link',
    img: 'image',
    hr: 'horizontalRule',
    tr: 'tableRow',
    td: 'tableCell',
    th: 'tableCellHeader',
    li: 'listItem',
    lic: 'listItemContent',
    code_block: 'codeBlock',
    code_drawing: 'codeDrawing',
    code_line: 'codeLine',
    code_syntax: 'codeSyntax',
    column_group: 'columnGroup',
    emoji_input: 'emojiInput',
    inline_equation: 'inlineEquation',
    media_embed: 'mediaEmbed',
    mention_input: 'mentionInput',
    search_highlight: 'searchHighlight',
    slash_input: 'slashInput',
    action_item: 'todoList',
    ol: 'numberedList',
    ul: 'bulletedList',
  },
  properties: { align: 'textAlign' },
});

const editor = createPlateEditor({
  initialValue,
  plugins: EditorKit,
  schemaIdentity: { id: 'acme-document', version: 2 },
});
```

The migration traverses primary and named roots, rewrites only element `type`
and declared top-level persisted property/mark keys, rejects old/new collisions
with root/path diagnostics, preserves unknown custom identities and nested JSON,
and never performs generic case conversion. Stale serialized History is
invalidated or explicitly version-migrated. Yjs moves offline to a new
schema-versioned room before any new client connects.

```ts
const editor = createEditor({ maxLength: 200 });
NodeApi.string(value);
PathApi.equals(left, right);

// Direction remains renderer policy for now.
<Editable className="[direction:rtl]" />;
```

Decision ledger:
| # | Surface | Current | Final target | Owner | Adoption and deletion | Execution proof | Main risk | Verdict |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Plugin and persisted identity | Every descriptor/portal conflates `name` and universal `type`; `NODES`, `KEYS`, and `STYLE_KEYS` overlap | Capability `name`; element `type`; property `key`; capability-only `PLUGINS`; pure explicit migration | `best-api repair` then Plate Core/Utils; History/Yjs dependent owners | Cut universal/configurable type, the three catalogs, reverse lookup, aliases, and name-as-storage callers; migrate packages, registry, codecs, fixtures, docs, History, Yjs | Exact portal type/key inference; exhaustive name-as-type/key scan; distinct identity migration/collision/named-root/custom-key tests; packed declarations; History/Yjs version proof | Corrupting custom/nested JSON or admitting mixed schema versions | rearchitect / accept P0 |
| 2 | Activation lifecycle | Failed activation can be reported after partial publication | Candidate-scoped read-only activation; atomic publication; exact rollback; isolated post-commit cleanup/`afterPublish` | Plite extension publication | Replace catch-and-keep behavior and partial state tests across Plite, Plate, History, and Yjs | Dependency order, rollback identity, thenable rejection, cleanup ordering, and publication-error tests | A rollback that restores registry but not document/fields/anchors | rearchitect / accept P0 |
| 3 | Grammar defaults | `defaultBlockType` side channel and implicit paragraph fallback coexist with schema defaults | `SchemaContent.default` is the only authored default; compiled root/nested creation owns execution | Plite schema/compiler; Plate consumes | Cut option, WeakMap, Plate reconstruction, and manual fallback nodes; migrate initialization/reset/split/delete/import | Complete/named/nested default tests, invalid/cyclic diagnostics, schema-less contract, History/Yjs reconfiguration, empty-editor browser proof | Required content without a valid default | rearchitect / accept P1 |
| 4 | History idle boundary | Structurally adjacent native edits merge indefinitely | `newBatchDelay` gates only automatic compatible native groups; explicit merge/split remains authoritative | `packages/plite-history` | Add private monotonic timing, clear it at remote/navigation/restore/schema boundaries, persist no timestamps | Fake-clock exact boundary tests, explicit mode tests, composition/browser undo bursts, JSON round trip | Flaky wall-clock tests or cross-root merge | rearchitect / accept P1 |
| 5 | Maximum length | Constructor and mounted Editable can both mutate editor-global policy | `createEditor({ maxLength })` is the sole public path; keep constructor semantics and hidden implementation; remove view-level alternative | Plite editor construction; Plate forwarding; Plite React adoption | Reject `maxLength()` extension and public `authoring: "bypass"`; retain `*EditorOptions.maxLength`; cut `Editable maxLength` so views cannot override it | Compile-only sole path; two-view mount/unmount proof; current command clamping and Plate forwarding tests | Existing arbitrary replacements may not be globally constrained; this plan deliberately does not invent a validator API | keep/replace packet 5 |
| 6 | Utility namespaces | Root frozen `NodeApi`, `PathApi`, etc. | Keep all `*Api` objects and root exports; no namespace subpaths or migration | Plite package API | Reject `/node`, `/path`, etc. subpaths and tree-shaking hard cut; no source adoption | Existing typecheck/tests and packed root export parity | Some property-level tree-shaking cost is accepted for a clearer stable API | keep/reject packet 6 |
| 7 | Math CSS | Headless math import pulls KaTeX CSS implicitly | Explicit `@platejs/math/katex.css`; JS imports stay headless | `packages/math`; app/registry style owners | Remove hidden CSS side effect, export exact CSS subpath, correct side-effect metadata, adopt in registry/app/docs | Packed CSS resolution, Rolldown/esbuild retention, static/RSC and live math browser render, CSP/headless proof | Consumers can forget the stylesheet; docs and visible registry composition must show it | move / accept P1 |
| 8 | Mixed-bidi caret | Horizontal movement reduces a block to one first-strong direction | DOM visual-point resolver returns point plus affinity; React uses it for physical left/right and word movement | `plite-dom`, then `plite-react` | Remove first-strong horizontal routing; keep Core logical movement; no copied Wordgard bidi engine | Mixed-script/isolates/brackets/graphemes/voids across Chromium, Firefox, WebKit plus bounded-work benchmark | Geometry cache staleness or affinity loss | rearchitect / accept P1 |
| 9 | Persisted block direction | No first-party persisted direction plugin | Keep direction as app/renderer CSS policy; no persisted property, command, codec, control, or list projection | App/registry renderer only | Reject `BaseTextDirectionPlugin`, `editor.update.textDirection`, persisted `dir`/`textDirection`, and related docs | Existing CSS direction and packet 8 browser matrices; no persistence migration | Per-block semantic direction and HTML `dir` round-trip remain unsupported by design | keep/reject packet 9 |
| 10 | Keyboard media resize | Pointer UI writes generic width mutations; handles lack keyboard semantics | Media plugin owns `update.setWidth`; UI owns pointer/keyboard math and ARIA | `packages/media`, `packages/resizable`, registry UI | Route pointer and keyboard commits through one update; remove generic width mutation; add slider behavior | Type inference, pointer/keyboard parity, RTL/clamp/px/% proof, one undo batch, a11y Browser route | Preview writes leaking into document or double History batches | move / accept P2 |
| 11 | Async hover source | No bounded async request lifecycle; donor over-centralizes tooltip behavior | First real component family colocates abort/stale/loading/error state; HoverCard keeps geometry/focus | Consuming registry component family | No Core tooltip manager or plugin state; promote a hook only after a second maintained consumer | A→B→A, abort/unmount/editor-change, rejection, keyboard/pointer/touch and standalone route proof | Premature generic hook or stale response publication | move / accept P2 |
| 12 | Source-backed API facts | Curated MDX copies signatures and export facts manually | Packed declarations generate facts only; curated MDX owns narrative/examples/order | Docs tooling and curated pages | Add deterministic symbol manifest/renderer; delete copied facts only after parity; do not generate prose | Root/subpath include-exclude parity, declaration/runtime/links/anchors/search/localization checks, Browser navigation | Generator becoming a second docs system | rearchitect / accept P2 |
| 13 | Raw mobile proof | Pixel emulation and lab captures can be mistaken for device proof | Replayable direct-Appium Android Chrome and iOS Safari receipts | Plite raw-device proof lane | Add receipt schema, scenario matrix, validator/readback; emulation remains diagnostic only | Both platforms, exact event/model/DOM/native-selection/update-count artifacts; command fails on incomplete/proxy proof | Device-lab access and native flakiness; no release claim without artifacts | gate / accept P2 |
| 14 | Complete-schema relationship rebinding | Contributions are immutable and complete schema cannot replace one relation | No API until one maintained consumer proves the exact gap; then reconsider frozen complete-schema-only relationships | `best-api` then `plite-plan` after entry condition | Delete nothing; reject mutable override/deep merge/callback transformers | Future consumer plus compile/runtime/reconfiguration/History/Yjs/browser proof | Speculative machinery without a consumer | defer P2 |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Doctrine and identity kernel | `best-api repair` + Plate Core/Utils | Update source doctrine; implement capability/schema identity separation and flat capability-only `PLUGINS`; cut universal/configurable `.type` and old catalogs | User accepts this plan | Type/declaration tests prove exact element type/property key ownership; no compatibility surface; `pnpm install` regenerates skills | Core/Utils source-first typecheck, focused plugin/schema tests, name-as-storage audit, packed declarations |
| 2. Persisted identity adoption | Plate feature packages + registry/docs + History/Yjs | Explicit pre-editor migration, all package descriptors/codecs/fixtures/examples, schema-version History/Yjs boundaries | Slice 1 exact types compile | No legacy first-party identities or old catalogs remain; migrated data is canonical and collaboration fails closed | Package typechecks/tests, HTML/Markdown/static/live Browser proof, migration properties, History/Yjs offline/readback proof, barrels/changesets |
| 3. Plite semantic kernel | Plite schema/publication + Plite History | Packets 2, 3, and 4; packet 5 only removes view-level max-length alternative while retaining constructor option | Identity kernel stable enough for schema/plugin adoption | Lifecycle/default/history laws ship with no packet-5 extension API | Focused Plite and History suites, fake clocks, configuration rollback, schema contracts, `pnpm check:plite:dev`, then strict `pnpm check:plite` |
| 4. DOM/input and media behavior | `plite-dom`, `plite-react`, media/resizable/registry | Packets 8 and 10; packet 9 stays CSS-only | Semantic kernel green | Visual caret and accessible resize behavior pass cross-browser; no direction persistence added | Focused package tests, standalone registry demos, Chromium/Firefox/WebKit geometry and interaction proof, bounded-work benchmark |
| 5. Packaging and docs facts | Math package/app owners + docs tooling | Packets 7 and 12; packet 6 stays `*Api` | Package APIs stable | Explicit CSS and source-backed facts work from packed artifacts without generated prose or utility subpaths | Tarball/export checks, bundlers, static/RSC/live Browser, API route/link/search/localization proof |
| 6. Async UI and raw-device closure | Registry component owner + device-lab proof owner | Packets 11 and 13 | Reusable runtime owners stable | Async hover is family-owned; raw mobile claims have both immutable device receipts | Component/browser tests; Appium artifacts, replay parser, release validator/readback |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Split capability and schema identities are feasible | Plite requires descriptor `name`; Plate's schema compiler can lower independently declared element types and property keys | Compile-only builder/portal/schema tests, distinct runtime identities, and complete name-as-storage scan | passed |
| Migration is bounded and safe | Exact legacy mappings and schema-version boundary are enumerated; generic case conversion is rejected | Primary/named-root property tests, collision diagnostics, unknown/nested JSON preservation, History/Yjs version proof | passed |
| Constructor max length is the only API | Live `CreateEditorOptions.maxLength`, Plate forwarding, and view prop owners were located | Type-level view-prop rejection, two-view lifecycle, clamping/forwarding tests | passed |
| `*Api` remains supported | Root exports and frozen API owners remain present | Source-first root typecheck/tests and package export checks | passed |
| Direction remains CSS-only | No first-party `textDirection` owner exists; user rejected persisted policy | Stale-symbol audit rejects persisted direction APIs; bidi proof runs under CSS LTR/RTL | passed |
| Accepted runtime/browser packets have owners | Strict audit dossiers source every owner and behavior gap | Per-slice focused tests, strict Plite Chromium, and cross-browser matrix | passed |
| Raw mobile means physical devices | Audit separates viewport/lab captures from Appium transport | Receipt schema, scenario matrix, fail-closed validator/readback pass; immutable Android+iOS receipts still require device lab | tooling passed; receipts device-gated |

Conditional evidence:
- High-risk scenarios:
  1. Migration sees both old and new property keys or a custom nested JSON
     `type`; it must throw only for top-level AST collisions and preserve nested
     domain JSON byte-for-byte.
  2. Activation fails after provisional fields/APIs exist; every registry,
     document, selection, anchor, field, activation, and version fact must roll
     back exactly.
  3. Bidi geometry cache survives a layout/text/runtime revision or loses
     affinity; cross-engine rendered-order sequences and bounded invalidation
     must catch it.
  4. Yjs version-1 and version-2 clients overlap; the migration process must
     refuse mixed rooms rather than translating live traffic.
- External research: complete for planning via the strict Wordgard audit at
  `docs/plans/2026-08-01-wordgard-exhaustive-architecture-re-audit.md`; no
  donor source refresh can change the user-selected rejected packets.
- Issue/PR provenance: N/A; this is an internal architecture plan with no
  public issue or PR mutation.
- Docs/registry/browser/release/behavior-law owners: explicitly assigned in
  ledger rows and execution slices; package changes require changesets, barrel
  regeneration when exports move, focused Browser routes, and packed release
  proof during execution.

Findings:
- Universal Plate `.type` lies for behavior and property plugins; `NODES`,
  `KEYS`, and `STYLE_KEYS` are overlapping catalogs rather than schema owners.
- Plite descriptor `name` is capability identity. Plate's compiled schema must
  separately own persisted element `type` and property `key`.
- Current max length already exists on editor construction and is separately
  mutable from mounted Editable; the final plan keeps the constructor route and
  cuts only the public view alternative.
- Current Plite deliberately exposes root `*Api` objects. Their possible bundle
  cost does not justify the proposed naming/subpath churn.
- No current first-party persisted block-direction plugin exists. CSS direction
  is a truthful keep decision; semantic per-block direction remains an explicit
  unsupported case, not fake parity.

Decisions and tradeoffs:
- Capability `name` plus schema-owned `type`/`key` over universal `.type` ->
  honest AST identity without reviving global catalogs; cost is constructor and
  compiler generic work. `.configure()` cannot change identity.
- `PLUGINS` over `KEYS`, `NODES`, `STYLE_KEYS`, `REGISTRY_IDENTITIES`,
  `BUILT_INS`, or `IDS` -> one short noun for the actual catalog; additional
  non-primary schema properties remain feature-owned handles/constants.
- Constructor max length over an extension -> ordinary option remains obvious;
  cost is accepting hidden implementation state and no public ingestion-bypass
  policy.
- `*Api` over ESM namespaces -> stable discoverable root API; accepted cost is
  weaker property-level shaking.
- CSS direction over persistence -> zero schema/codec/UI machinery now; accepted
  cost is no per-block semantic direction round trip.
- Explicit KaTeX CSS remains accepted; packet 9's CSS preference does not
  reverse packet 7.

Review fixes:
- Corrected packet 1 to separate capability `name`, element `type`, and property
  `key`, with `PLUGINS` limited to capability lookup.
- Rejected packet 5's extension/bypass API; retained the constructor option as
  the only public route.
- Rejected packet 6's namespace/subpath cut; retained every `*Api` object.
- Rejected packet 9's persisted direction feature; retained CSS renderer policy.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Packet-number ambiguity (`9` could have meant math CSS) | 1 | Read the complete attachment before merging | Confirmed packet 9 is persisted block direction; packet 7 explicit math CSS remains accepted. |

Verification evidence:
- Artifact read: `/Users/zbeyens/.codex/attachments/d663164e-7244-4c5b-8dc7-80e8ebf18209/pasted-text.txt` -> all 14 original packets and migration example accounted for.
- Source audit: `packages/core/src/lib/plugin/BasePlugin.ts:180-224,1200-1261`, `packages/core/src/lib/plugin/createPluginContext.internal.ts:360-382`, and `packages/utils/src/lib/plate-keys.ts:1-145` -> current dual identity and three catalogs confirmed.
- Source audit: `rg -n "maxLength" packages/plite/src packages/core packages/plite-react` -> constructor, Plate forwarding, internal enforcement, and view-level alternate owner located.
- Source audit: `packages/plite/src/interfaces/node.ts:639-760` and `packages/plite/src/index.ts:257-266` -> root `NodeApi` family ownership confirmed.
- Source audit: `rg -n "textDirection|BaseTextDirectionPlugin" packages apps content` -> no current persisted text-direction owner.
- Command: `pnpm typecheck` -> 57/57 packages, including Core declaration
  contracts.
- Command: `bun run test` -> 3,031 package tests plus every app-specific suite
  pass.
- Command: `pnpm check:plite` -> strict Chromium proof passes, 698 passed and 6
  skipped.
- Command: `pnpm check:plite:browser-matrix` -> Chromium 698/6,
  Firefox 591/113, WebKit 613/91, and mobile viewport 317/387 pass/skip with
  all 113 batches complete.
- Browser: `/blocks/equation-demo` renders five KaTeX nodes with the packaged
  stylesheet; `/blocks/media-demo` keyboard resize publishes
  `55% -> 56.4286%`; `/blocks/link-demo` and `/api/link-preview` hydrate and
  resolve the pinned Wikipedia preview without console errors.
- Browser-driven fixes: canonical persisted `textAlign`; node-width publication
  through `withResizableProvider`; Next-compatible route runtime export; and
  DNS-pinned Node lookup handling for both single-address and `{ all: true }`
  callbacks.
- Command: `pnpm test:mobile-device-proof:raw` -> correctly fails closed because
  `test-results/release-proof/mobile-device-proof.json` is absent; direct-Appium
  Android Chrome and iOS Safari receipts require the external device lane.
- 2026-08-02 device-lane audit: Appium, ADB, and Xcode tooling are installed;
  ADB reports no attached Android device; Xcode reports the two physical Apple
  devices offline; no Appium/device environment is configured; and the receipt
  artifact remains absent. Simulator and viewport rows cannot satisfy this gate.
- Command: `.agents/skills/autoreview/scripts/autoreview --mode local` -> clean,
  no accepted actionable findings.
- Flat portal proof: `editor.plugin(Plugin)` and `useEditorPlugin(Plugin)` expose
  `name`, descriptor fields, `api`, `read`, `update`, `store`, and `installed`
  directly. Runtime/type tests prove consumer portals omit `plugin`, `editor`,
  and `defineCodecs`; definition callbacks retain the authoring context.
- Command: `pnpm typecheck` -> 57/57 package builds and typechecks pass after
  the flat portal hard cut.
- Command: `pnpm --filter www typecheck` -> API reference, docs parity,
  registry source, app, and package-integration checks pass.
- Command: `bun run test` -> 3,031/3,031 main tests plus every bounded follow-up
  suite pass after the React hook and caller migration.
- Browser: `/blocks/table-demo` renders one table, one editable, and 35 toolbar
  buttons with no error-level console entries after `useEditorPlugin` became a
  flat portal.
- Command: `node .agents/rules/plate-next/scripts/version.mjs validate` -> Plate
  Next v44 registry valid (42 active, one retired); doctrine fingerprint
  `sha256:7d913f89c713adaa1ddcd24935151f8c309e1fab608cdc4adac2a0ee0759f4ec`.
- Command: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-01-final-wordgard-adoption-plan.md` -> complete; physical-device
  receipts remain a separate external proof gate.

Final handoff prepared:
- Ownership and target API: Plate Core owns capability/schema identity
  separation; Utils owns capability-only `PLUGINS`; Plite owns
  lifecycle/schema/history/DOM substrate; feature and app owners adopt callers.
- Public breaks and adoption: universal/configurable plugin `.type`, `KEYS`,
  `NODES`, `STYLE_KEYS`, name-as-storage callers, old persisted identities, and
  `Editable maxLength` are hard-cut with no aliases. Exact element `.type`,
  property `.key`, and `*Api` stay.
- Applicable runtime/package/docs/browser decisions: ten accepted packets,
  three rejected/replaced packets, and one consumer-gated defer are explicit.
- Proof and execution risks: persisted migration/Yjs, rollback atomicity, bidi
  geometry, and raw-device access are the critical execution gates.
- Execution result and user attention: all six source slices are implemented;
  only physical Android/iOS receipt capture remains outside this checkout.

Timeline:
- 2026-08-01T18:47:56+02:00 Plate Plan created.
- 2026-08-01T19:05:00+02:00 Attachment numbering and all 14 original dossiers reconciled.
- 2026-08-01T19:15:00+02:00 User corrections merged: packet 1 flat `PLUGINS`; packet 5 constructor; packet 6 `*Api`; packet 9 CSS.
- 2026-08-01T19:25:00+02:00 Final owners, slices, risks, proof, and handoff recorded.
- 2026-08-01T19:33:00+02:00 User accepted all six execution slices with `go all`; one-shot execution goal started.
- 2026-08-01T23:40:00+02:00 All source slices, strict Plite, cross-browser,
  registry Browser, root typecheck, full tests, barrels, lint, and changesets
  closed; raw mobile validation failed closed on missing physical receipts.
- 2026-08-02T04:31:25+02:00 External gate re-audited: no Android device is
  attached and both visible physical Apple devices are offline; raw receipts
  cannot be produced from the current environment.
- 2026-08-02T04:32:16+02:00 Third consecutive blocker audit produced the same
  result: zero attached Android devices, both physical Apple devices offline,
  and no raw receipt artifact. Goal status moves to blocked until external
  device state changes.
- 2026-08-02T09:15:00+02:00 User explicitly deferred physical-device testing.
  Consumer portals were flattened across Core, React, packages, registry, docs,
  tests, and doctrine; all affected proof and final autoreview passed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Source implementation and final autoreview complete |
| Where am I going? | Handoff; physical-device receipt capture stays deferred |
| What is the goal? | Implement every accepted packet with no compatibility APIs and prove all six slices |
| What have I learned? | Capability `name` must not impersonate element `type` or property `key`; the user intentionally keeps constructor max length, `*Api`, and CSS direction |
| What have I done? | Implemented all six slices plus the flat consumer portal correction and proved root, package, www, tests, strict Plite, cross-browser, registry Browser, packaging, lint, stale-API, doctrine, and review gates |

Open risks:
- Raw Android/iOS closure depends on direct Appium device-lab artifacts; the
  validator correctly refuses a release-quality mobile claim without them.
- Per-block semantic direction remains unsupported until a future user need
  reopens packet 9.
- Schema relationship rebinding remains gated on a real maintained consumer.
