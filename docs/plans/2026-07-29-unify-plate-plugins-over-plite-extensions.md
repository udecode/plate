# Unify Plate plugins over Plite extensions

Objective:
Choose one canonical Plate-on-Plite plugin architecture; done when the public
authoring shape, runtime ownership, hard-cut adoption, slices, and proof are
resolved from live source.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-07-29-unify-plate-plugins-over-plite-extensions.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- none

Mode:
- `standard`

Completion threshold:
- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.

Verification surface:
- Live Plate builder/types/resolution audit, live Plite extension/runtime audit,
  bounded `extension` usage classification, docs/type-test/export adoption
  audit, `best-api` verdict, and this plan's `check-complete`.

Constraints:
- Planning only until the user explicitly accepts this exact plan and invokes
  `plate-plan` against it.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.

Boundaries:
- In scope: Plate plugin authoring fields, the Plate-to-Plite compilation and
  installation boundary, genuine Plite-extension escape hatches, types, tests,
  exports, docs, and all repository consumers of the chosen public shape.
- Source owners: `packages/core` plugin builders/types/resolution and the
  package plugins that use their extension surface.
- Non-goals: implementation before explicit acceptance; compatibility aliases;
  unrelated plugin colocation or package behavior changes.
- Direct Plite boundary owners: Plite extension declaration, composition,
  runtime installation, activation, state, command, correction, and codec
  primitives used by Plate.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Block only if live source cannot establish the runtime/type ownership or two
  materially different public contracts remain tied after source, type, and
  adoption pressure review.

Plate Plan state:
- status: ready-for-review
- phase: prove-and-hand-off
- next: user review
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Decide whether Plate plugin `extension` should disappear from normal authoring, whether native Plate fields compile to Plite, and whether Plite or Plate must be rearchitected; suggest the winning plan only |
| Active goal and plan verified | yes | Active autogoal points to this plan |
| Current owners read | yes | Plate Base/React builders, resolution and installation; Plite descriptor/runtime; all production Plate `extension` declarations; tests, docs, changesets, exports, and tooling |
| Best API target resolved | yes | Flat native Plate behavior fields plus one branded `plite` descriptor lane; raw `extension` is deleted |
| Mode and execution boundary resolved | yes | Planning only; product source waits for explicit acceptance |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and the Plite bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Architecture, public contract, adoption, deletion, slices, and proof are resolved below |
| Fresh source evidence | yes | Recheck decision-changing current claims | Live Plate/Plite owners and bounded repository consumers audited on 2026-07-29 |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding | Winner and rejected alternatives recorded below |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Declaration, identity, ordering, docs, release, tooling, and browser work are assigned; external research and issue provenance are not relevant |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Proof matrix and commands below |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff section below |
| Autoreview | no | Planning-only N/A | Independent Core, Plite runtime, API, usage, adoption, and red-team source reviews were used instead; no product implementation exists to autoreview |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-29-unify-plate-plugins-over-plite-extensions.md` | Checker passes on the completed planning artifact |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Live Plate compiler, Plite runtime, 40 production declarations, tests, docs, exports, changesets, and tooling mapped | Decide |
| Decide | complete | Plite substrate wins; Plate is the authoring/compiler layer; exact public shape locked | Prove and hand off |
| Prove and hand off | complete | Adoption/deletion ledger, execution slices, proof ladder, and risks resolved | User review |

Decision brief:
- outcome: Re-architect Plate plugin authoring, not Plite's extension runtime.
- chosen shape: Plate keeps its semantic plugin fields and gains eight flat
  native behavior fields. Genuine canonical Plite descriptors use one branded
  `plite` tuple/factory field. Plate resolves all Base/React stages, then
  compiles each Plate plugin into a Plite-owned runtime descriptor.
- strongest rejected alternative: `BasePlugin extends EditorExtension`.
  Plate and Plite already assign different meanings to `api`, `read`, schema,
  dependencies, state, and transactions. Structural inheritance would make
  the type surface larger while preserving two conflicting models.
- consequence: Singular raw `extension`, structural raw objects, implicit
  names/keys, custom raw-extension merging, and their Base/React overload/type
  machinery are deleted without an alias.

## Target public contract

Normal Plate behavior is flat and context-inferred:

```ts
export const SingleLinePlugin = createBasePlugin({
  key: 'singleLine',

  commands: ({ editor, handle, store }) => [
    handle(editorCommands.insertBreak, () => {
      // Feature behavior stays with its Plate owner.
    }),
  ],

  corrections: ({ editor, store }) => [
    // ...
  ],
});
```

The native fields are exactly the behavior proven by current production use:

- `commands`
- `corrections`
- `on`
- `clipboard`
- `effectTypes`
- `stateFields`
- `selectionKinds`
- `readMiddleware` — deliberately distinct from Plate's plugin query `read`

Each field accepts its static Plite shape where useful or a context factory.
Factories infer the Plate plugin context plus only their field-specific Plite
registration helpers. Repeated `.extend()` stages accumulate contributions in
declaration order; authors do not pass `tx`, `read`, or `api` through new helper
parameters merely to recover plugin capabilities.

Existing Plate meanings stay authoritative:

- `api` and `pluginApi`
- `read` and `update`
- `schema` and codecs
- `dependencies`
- `initialState`

Raw extension `api` declarations move to existing Plate `api`. Raw Plite read
middleware moves to `readMiddleware`. Plite `config`, root `state`/`tx`,
conflicts, validation, activation, facets, and arbitrary contributions do not
become speculative Plate fields; independently owned substrate behavior stays
a Plite descriptor.

The exceptional lane is explicit and nominal:

```ts
export const HistoryPlugin = createBasePlugin({
  key: 'history',
  plite: [history()],
});

export const YjsPlugin = createBasePlugin({
  key: 'yjs',
  initialState,
  plite: ({ store }) => [createYjsExtension(store.get())],
});
```

`plite` accepts arrays only, either directly or from a Plate-context factory,
and only descriptors returned by `defineEditorExtension` or a typed Plite
factory. The compiler installs those exact descriptor objects: no spreading,
renaming, grouping, or deep merge.

`extensions` was rejected as the field name. It still advertises a general
second authoring bucket inside a Plate plugin. `plite` makes the layer crossing
obvious to humans and agents.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Architectural substrate | Plate native runtime plus an exposed structural copy of Plite `EditorExtension` | Plite owns descriptor identity, dependencies, lifecycle, publication, rollback, commands, corrections, and middleware; Plate compiles to it | `packages/plite`, `packages/core` | Plite already canonicalizes/freeze descriptors and atomically publishes them | No Plite runtime rewrite | Plite extension configuration, namespace, slot, DOM, History, React, and Yjs contracts | Accidentally duplicating lifecycle in Core | accept |
| Normal behavior authoring | `extension: object | callback | array` | Eight native flat Plate fields with inferred context | Core plugin builders | 36/40 production declarations are ordinary Plate behavior | Migrate all 36 declarations and four trigger-combobox consumers | Core inference/runtime tests plus affected package tests | Repeated stages can reorder handlers | accept |
| Genuine Plite descriptors | Same raw `extension` field as ordinary behavior; canonical descriptors are cloned | `plite: DefinedEditorExtension[] | (context) => DefinedEditorExtension[]` | Plite type boundary, Core installer | Four real production descriptors need exact identity | History, DOM, Yjs, version-history diff descriptor | Descriptor identity via `editor.getApi(descriptor)`; API/state/tx projection | Private nominal brand leaks into declarations | accept |
| Plate plugin identity | Native APIs collapse into `plate:runtime`; raw descriptors use a second grouping pipeline | Resolve the complete plugin, then emit one hidden `plate:<pluginName>` runtime descriptor; attached Plite descriptors remain separate exact dependencies | Core resolver/compiler | Runtime ownership and diagnostics should match plugin ownership | Replace global capability accumulation where possible; retain only editor-wide model/change-handler descriptors | Per-plugin ordering, dependencies, publication, rollback, Base→React stage tests | Namespace composition and order | accept |
| Plate `api/read/update` | Plate-owned scoped semantics | Keep semantics; lower them into generated descriptors | Core compiler | Their meanings are not Plite's structural fields | Existing packages remain source-compatible for these fields | Existing Core type/runtime contracts plus declaration builds | Accidental public type widening | accept |
| Raw Plite `read` | Hidden under `extension.read` | `readMiddleware` | Core builders/compiler | Plate `read` already means plugin query capabilities | Table, Toggle, Override | Middleware ordering and fallthrough tests | Naming confusion | accept |
| DOM/View root API | Raw `extension.api.dom` mixed with `pliteDom()` | Existing Plate `api` for Plate-owned additions; only `pliteDom()` uses `plite` | Core DOM/static owners | Plate already composes editor API namespaces | DOMPluginBase and ViewPlugin | `editor.api.dom`, descriptor API, auto-scroll, static fragment tests | Root API collision | accept |
| Trigger combobox | Plate-specific helper returns a nominally standalone Plite descriptor | Reusable command-contribution helper consumed by native `commands` | `packages/combobox` | It depends on Plate editor/store/key/type and has four consumers; reuse is valid, substrate ownership is false | Emoji, Footnote, Mention, Slash | Existing helper tests rewritten around commands; package typechecks | Public helper rename | accept |
| Builder/type machinery | Base and React duplicate extension inputs, contribution inference, contracts, and overloads | Shared native-field and branded-Plite types; delete extension-specific overloads and erased `__editorExtensions` path | Core Base/React builders | Current React runtime delegates to Base; duplicated grammar is drift | Core exports/barrels and type tests | `typecheck:contracts`, declaration build, no exported `any` | TS declaration recursion/private brands | accept |
| Tooling | Checker allowlists old staged raw extension grammar | Reject `extension`; accept native fields; require branded values under `plite` | Tooling scripts | Prevent relapse | Schema-adoption and docs-code checker tests | Checker fixtures pass and deliberate invalid fixture fails | AST false positives | accept |
| Docs/releases | Normal behavior and standalone substrate use the same documented field | Current-state docs teach native fields and mark `plite` advanced | Docs/release owners | The present docs institutionalize the wrong boundary | EN/CN guides/API/migration, three overlapping changesets, new breaking changeset | Docs code checker and Browser routes | Stale snippets in secondary docs | accept |
| Compatibility | Large public raw field and types | Hard cut, no alias or shim | Core/public packages | Alias preserves the second grammar and AX confusion | Whole-repo consumer migration in the same change | Zero Plate-facing `extension:` declarations; package exports inspected | Downstream break is intentional | accept |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Canonical descriptor boundary | Plite extension types | Export a declaration-safe nominal `DefinedEditorExtension`; make `defineEditorExtension` and official factories preserve it; keep plain Plite `createEditor` structural input compatibility unless a separate Plite decision changes it | Accepted plan | Plate can require defined descriptors without a private symbol or runtime clone | Plite type contracts, declaration build, extension identity/configuration tests |
| 2. Core authoring contract | Base/React plugin builders | Add the eight native fields and `plite`; centralize inference; preserve repeated `.extend`, Base→React, `.configure`; delete singular `extension` and public extension-only aliases/overloads | Slice 1 type exists | Desired examples infer with no callback annotations and raw objects fail | Core type contracts and emitted declarations |
| 3. Plate-to-Plite compiler | Core resolution/installation | Compile the final resolved plugin into one ordered hidden descriptor; attach exact branded dependencies; lower Plate API/read/update and native behavior; delete implicit-name marking, normalization, grouping, deep merge, and `__editorExtensions` | Slice 2 | One runtime path reaches Plite; descriptor identity and plugin ownership are truthful | Focused Core runtime/slow tests for ordering, API merge, rollback, lifecycle, commands, corrections, clipboard, effects, selection, identity |
| 4. Production adoption | Package plugin owners | Flatten 36 ordinary declarations; move two raw APIs to Plate `api`; rename three middleware reads; migrate four genuine descriptors to `plite`; replace trigger-combobox extension helper with shared command helper | Core contract stable | No production Plate `extension:` remains; every affected package typechecks/tests | Package-focused tests/typechecks and lexical/AST audit |
| 5. Tests, tooling, exports | Core/Plite/tooling owners | Replace 147 related test/type-contract usages across 25 files; update checker policy; delete old exported types; regenerate barrels | Slices 1–4 | Tests prove current behavior, not dead API absence; published declarations contain no `any` or private brands | Core contracts/tests, tooling tests, `pnpm brl`, Core/Plate builds and declaration inspection |
| 6. Docs and release adoption | Docs/registry/release owners | Rewrite Plate EN/CN guides/API/migration references; preserve direct Plite extension docs; migrate version-history example; update three overlapping changesets and add the required breaking changeset | Public source stable | One documented Plate grammar and one clearly advanced Plite lane | Docs checker, app typecheck, Browser proof |
| 7. Closure | Plan owner | Run affected/full proof, lint, review, and zero-drift audit | All slices complete | No accepted P0/P1 findings, no old Plate raw authoring, exact proof receipt | Commands and Browser matrix below |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Plite is the correct substrate | `EditorExtension` already owns canonical identity, dependency order, lifecycle, atomic publication/rollback, state, tx, commands, corrections, middleware, contributions, and validation in `packages/plite/src/interfaces/editor.ts:1985` and `packages/plite/src/core/editor-extension.ts:645` | Plite configuration, namespace, transaction-slot, generic install, DOM, History, React, and Yjs suites | planned |
| Plate already compiles onto Plite | Native `api/read/update` become `plate:runtime` in `packages/core/src/internal/plugin/resolvePlugins.ts:803`; installation enters Plite in `packages/core/src/lib/editor/withPlite.ts:372` | Core model publication and resolve/install suites | planned |
| Current raw field is the wrong default | Bounded scan found 40 production declarations: 36 ordinary behavior and four real Plite descriptors | AST checker reports zero old Plate `extension` and classifies every `plite` descriptor | planned |
| Exact descriptor identity is required | Current normalization spreads descriptors in `packages/core/src/lib/plugin/createBasePlugin.ts:615`; Plite resolves installed API by canonical object identity in `packages/plite/src/core/editor-extension.ts:739` | `editor.getApi(originalDescriptor)` before/after reconfiguration; no clone path | planned |
| Native fields preserve AX/type inference | Current raw field duplicates Base/React types and overloads in `BasePlugin.ts`, `PlatePlugin.ts`, `createBasePlugin.ts`, and `createPlatePlugin.ts` | Constructor, repeated-stage, dependency, Base→React, configure, emitted declaration, no-`any` contracts | planned |
| Runtime behavior is unchanged | Production inventory covers commands, corrections, listeners, clipboard, effects, state fields, read middleware, APIs, and selection kinds | Focused Core and package behavior suites plus representative Browser interactions | planned |
| Whole-repo adoption is bounded | 147 test/type occurrences in 25 files; 53 teaching/API references across 12 direct Plate docs; four release references across three changesets | Zero-drift scans, docs checker, changeset audit, exports/barrels inspection | planned |

Conditional evidence:
- High-risk scenarios: public type/declaration inference, descriptor identity,
  Base→React/repeated-stage ordering, API namespace composition, dependency
  ordering, lifecycle/rollback, and context-dependent Yjs descriptor creation
  all require explicit tests.
- External research: N/A. This is an internal architecture choice whose owning
  runtime, consumers, and contracts are all available in the live repository.
- Issue/PR provenance: N/A. No public issue or PR defines this request.
- Docs: applies. Rewrite current-state EN/CN Plate guides/API/migration pages;
  do not weaken direct Plite extension documentation.
- Registry/browser: applies because `apps/www/**`, `content/**`, and package
  behavior change. Verify `/blocks/version-history-demo`,
  `/blocks/list-classic-demo`, `/blocks/table-nomerge-demo`,
  `/blocks/editor-basic`, and `/blocks/editor-ai`, plus the affected plugin
  guide routes with Browser.
- Release: applies. Core and Plite public types plus affected feature packages
  need accurate changesets; no changelog-style prose in reference docs.
- Behavior law: applies. Commands, corrections, read middleware, clipboard,
  lifecycle, state fields, selection kinds, and rollback retain Plite's
  canonical semantics.

Findings:
- Plate is already implemented on Plite. `createPlatePlugin` delegates through
  Base, native runtime capabilities become a Plite extension, and final
  installation uses Plite. The defect is the second public grammar.
- `BasePlugin.ts:223` and `PlatePlugin.ts:102` expose nearly the full structural
  Plite descriptor, then duplicate its inference through both builders.
- Raw `extension` silently lets a normal Plate feature bypass Plate-owned API,
  read/update, schema, dependency, and lifecycle ownership.
- Core reimplements implicit names, raw descriptor grouping, recursive merge,
  and command-factory composition even though Plite already owns canonical
  descriptors and installation.
- The documented promise that a prebuilt descriptor can be passed through is
  false today: Core clones it, while Plite descriptor APIs depend on canonical
  identity.
- The production ratio is damning: 36 of 40 declarations use the advanced
  escape hatch for ordinary feature code.
- Exactly four current production values are genuine independent descriptors:
  History, Plite DOM, Yjs, and the version-history diff fragment extension.
- `createTriggerComboboxExtension` is not a substrate extension. It consumes
  Plate editor/store/key/type state and should remain a shared helper only
  because four features reuse its command behavior.
- Flattening Plite's entire descriptor grammar is not the fix. Only eight
  collision-free, production-proven behavior fields become native; unneeded
  Plite fields stay out.

Decisions and tradeoffs:
- **Winner:** Plate is a semantic DSL/compiler on top of Plite.
- **Not inheritance:** Plate plugins contain mutable feature configuration,
  stores, rendering, codecs, scoped APIs, and Base/React stages. Plite
  descriptors are immutable runtime substrate units. They should meet at a
  compiler boundary, not share one structural interface.
- **Field spelling:** `plite`, not `extension` or `extensions`. The slight
  explicitness cost is valuable boundary information and prevents agents from
  treating it as the normal plugin authoring bucket.
- **Nominal boundary:** requiring `DefinedEditorExtension` is the only reliable
  way to block structural inline objects while retaining exact descriptor
  identity and capability inference.
- **Per-plugin runtime identity:** one generated descriptor per resolved Plate
  plugin gives Plite truthful ownership, ordering, and diagnostics. It is a
  larger Core change than merely flattening fields into the global
  `plate:runtime`, but the latter would preserve the architecture debt.
- **Minimal native surface:** no speculative `activate`, `facetProviders`, or
  arbitrary `contributions` fields. Add one later only when multiple real
  Plate features prove Plate-context ownership; otherwise use `plite`.
- **No direct top-level Plate `extensions` option in this plan:** existing
  Plate wrappers need Plate configuration and typed plugin ownership. A
  pre-created Plite editor can still own editor-level extensions independently.
- **Hard cut:** no singular alias, no structural fallback, no migration-only
  overload, and no dead-code tests for the removed shape.

Review fixes:
- Rejected making `BasePlugin` structurally extend `EditorExtension`.
- Rejected flattening all Plite fields into Plate.
- Rejected preserving the generic field as plural `extensions`; chose `plite`
  to make the advanced layer crossing unmissable.
- Reclassified four trigger-combobox consumers from standalone substrate to
  shared Plate command behavior.
- Reclassified DOM/View raw APIs as existing Plate `api`; only `pliteDom()`
  remains in the advanced lane.
- Restricted the Plite change to a public nominal descriptor type. No Plite
  runtime rearchitecture is justified.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| None | 0 | N/A | N/A |

Verification evidence:
- Source audits completed read-only across Plate Core builders/resolution,
  Plite extension/runtime, all production authoring, tests, docs, changesets,
  exports, and tooling.
- Bounded inventory: 40 production declarations, 36 ordinary, four genuine;
  147 related tests/type-contract occurrences in 25 files; 53 references
  across 12 direct Plate teaching/API docs; four release references in three
  changesets.
- Independent Core, Plite runtime, API, adoption, usage, and red-team passes
  agreed on the compiler architecture and raw-field hard cut.
- Execution proof commands:

```bash
pnpm --filter @platejs/plite typecheck
pnpm --filter @platejs/plite test
pnpm --filter @platejs/core typecheck:contracts

pnpm --filter @platejs/core exec bun test \
  src/lib/plugin/createBasePlugin.spec.ts \
  src/lib/utils/pluginExtensionMerge.spec.ts \
  src/internal/plugin/resolvePlugins.spec.tsx \
  src/react/plugin/createPlatePlugin.spec.ts \
  src/react/plugin/toPlatePlugin.spec.ts \
  src/internal/plugin/plateModelPublication.spec.ts

pnpm test:types

node --test \
  tooling/scripts/check-plate-schema-adoption.test.mjs \
  tooling/scripts/check-plate-doc-code-contracts.test.mjs \
  tooling/scripts/check-package-declaration-brands.test.mjs \
  tooling/scripts/check-plite-release-artifacts.test.mjs

node tooling/scripts/check-plate-schema-adoption.mjs
node tooling/scripts/check-plate-doc-code-contracts.mjs

pnpm turbo typecheck \
  --filter=./packages/core \
  --filter=./packages/plate \
  --filter=./packages/ai \
  --filter=./packages/code-block \
  --filter=./packages/combobox \
  --filter=./packages/comment \
  --filter=./packages/diff \
  --filter=./packages/emoji \
  --filter=./packages/footnote \
  --filter=./packages/indent \
  --filter=./packages/layout \
  --filter=./packages/link \
  --filter=./packages/list \
  --filter=./packages/list-classic \
  --filter=./packages/media \
  --filter=./packages/mention \
  --filter=./packages/selection \
  --filter=./packages/slash-command \
  --filter=./packages/suggestion \
  --filter=./packages/table \
  --filter=./packages/tag \
  --filter=./packages/toggle \
  --filter=./packages/utils \
  --filter=./packages/yjs \
  --filter=./apps/www

pnpm turbo build --filter=./packages/core --filter=./packages/plate
pnpm plite:release:artifacts
pnpm brl
pnpm lint:fix
```

- Inspect built Core/Base/React and representative AI/Table/List declarations
  for exported `any`, private brand names, widened tuples, and lost dependency
  capabilities.
- Browser proof follows the concrete routes in Conditional evidence.

Final handoff prepared:
- Ownership and target API: `plate-plan` owns the cross-layer execution.
  `best-api` has resolved the public shape; `plate-next` audits the hard cut;
  `plate-plugin-creator` migrates package owners. A separate `plite-plan` is
  unnecessary unless the nominal boundary exposes a missing runtime primitive.
- Public breaks and adoption: delete raw `extension` and its exported types;
  add native fields and branded `plite`; migrate every production, test, docs,
  registry, tooling, changeset, export, and release-artifact consumer in the
  same change.
- Runtime/package/docs/browser decisions: one generated descriptor per final
  Plate plugin, exact standalone descriptors, no trigger-combobox substrate
  fiction, EN/CN current-state docs, representative standalone browser routes.
- Proof and execution risks: descriptor identity, declaration emit, repeated
  stage order, API composition, dependency ordering, lifecycle/rollback, and
  Yjs context factory are hard gates.
- Execution order and user attention: slices 1–7 are dependency ordered. The
  only user decision is acceptance or rejection of this exact public contract.

Timeline:
- 2026-07-29T13:23:34.014Z Plate Plan created.
- 2026-07-29 Plate/Plite ownership and bounded adoption inventory completed.
- 2026-07-29 Public API, rejected alternatives, execution slices, and proof
  gates locked.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Prove and hand off complete |
| Where am I going? | User review, then implementation only after acceptance |
| What is the goal? | Resolve the cleanest Plate-on-Plite plugin architecture and prepare an executable plan without product-source edits |
| What have I learned? | See Findings |
| What have I done? | Completed the planning artifact and handoff; see Timeline |

Open risks:
- Current shared checkout contains unrelated active work; this planning lane
  must remain read-only outside this plan artifact.
- The implementation must coordinate Core/Plite source ownership before writes
  because this shared checkout has other active architecture work.
