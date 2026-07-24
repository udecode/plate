# Schema API hard cuts

Objective:
Adopt direct Media caption children with distinct node/text selection; done
when direct inline children are the sole canonical persisted shape and Media,
Plite navigation, registry, docs, tests, Browser, and audit gates pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-23-schema-api-hard-cuts.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- docs
- package-api
- browser

Mode:
- `standard` one-shot execution.
- Corrected active-goal scope: the user replaced the temporary structural
  `caption` child with direct Media inline children plus distinct Plite
  `NodeSelection` and caption `TextSelection`. The broader schema hard-cut
  execution history remains below as context, but only the Media caption and
  generic keyboard-selection slice is required to close goal
  `019f9019-20fd-7b93-be27-95a5b5688eaa`.
- Every earlier completion claim for a persisted `{ type: 'caption' }` wrapper
  is superseded historical evidence, not proof for the active target.

Completion threshold:
- Every Media owner persists caption inline/text content directly in
  `children`; `[{ text: '' }]` is the canonical absent caption. No paragraph
  wrapper, `caption` element wrapper, caption property writer, caption root,
  alias, or second persisted shape survives.
- Published legacy `caption: Descendant[]` data—including its released
  single-block wrapper—normalizes once before schema fitting. The unreleased
  `childRoots.caption`, structural-caption child, and direct paragraph-child
  experiments are deleted from source rather than becoming permanent migration
  machinery. Mixed non-empty legacy/canonical data rejects deterministically.
- Plite keeps image focus as a serializable `NodeSelection` distinct from the
  caption `TextSelection`; keyboard-selectable non-void elements support
  ArrowDown into editable child content, ArrowUp back to the owner at the
  leading boundary, exact-node copy/cut, and node-selection deletion. Printable
  input and paste do not silently mutate hidden child text while node focus
  remains.
- Media, Plite/Plite React, Markdown, test-utils, www, registry UI/static,
  docs, changesets, barrels, changelog, lint, and focused integration checks
  pass.
- `/blocks/media-demo` proves separate image/caption focus, optional hidden
  empty-caption coverage, ArrowDown/ArrowUp transitions, deletion, direct
  `figcaption`, and zero new console errors; `/docs/media` proves the exact
  persisted shape and current package owner.
- Bounded deletion audits prove `@platejs/caption`, Media caption roots,
  structural caption wrappers, paragraph wrappers, and stale runtime imports
  are absent from source-owned surfaces. CI-generated template/output staleness
  is classified, not manually edited.
- `autoreview` has zero accepted actionable findings and
  `check-complete.mjs` passes.

Verification surface:
- Media schema/dependency/insertion/normalization tests and typecheck.
- Plite selection protocol, keyboard navigation, DOM selection projection,
  copy/cut/input ownership, deletion, React runtime, and focused browser proof.
- Markdown caption deserialize/serialize/host-codec tests and typecheck.
- Test-utils hyperscript/type checks plus registry Caption/media/static HTML
  tests and www source-first typecheck.
- Media docs EN/CN, registry changelog, package changesets, exports/barrels,
  MDX/source parity, and `/blocks/media-demo` plus `/docs/media`.
- Bounded `rg` deletion audits and final plan checker.

Constraints:
- The accepted `best-api` verdict is implementation authority for this
  one-shot execution plan.
- No public compatibility aliases or runtime shims.
- Keep direct element `align`; do not adopt `attributes.align` or Wordgard's
  mark representation.
- Keep explicit `persist: valueCodecs.*`; do not add `persist: true`.
- Preserve Plite's deterministic fingerprints, strict decode, atomic schema
  publication, canonical `DocumentChange`, multi-root model, history, and Yjs.
- Rich captions are the Media element's direct inline/text children. Detached
  content roots and structural caption wrappers remain reserved for genuinely
  independent semantics that Media captions do not have.
- Legacy `caption` data normalizes automatically into direct `children` and the
  old property is deleted in the same repair. Users run no migration script
  and no dual persisted representation survives.
- Conditional caption visibility and selection use Plite DOM coverage; hidden
  UI does not change the document model.
- Media elements are non-void, isolating, and keyboard-selectable. The visual
  asset alone is non-editable; node selection owns asset focus while text
  selection owns caption editing.
- Preserve shared work already present in the checkout; do not overwrite
  unrelated source/docs changes.
- Keep one plan artifact and current-state docs voice.

Boundaries:
- In scope: `packages/media`, caption types/keys/hyperscript support,
  `packages/plite`, `packages/plite-react`, `packages/markdown`, registry Media
  components/kits/values/static rendering, Media docs EN/CN, package
  changesets, registry changelog, and focused proof.
- Generated `templates/**` and `apps/www/public/r/**` stay CI-owned. Repair
  registry/package source only.
- Non-goals: the other schema hard-cut slices retained below as historical
  context; no generic content-root redesign, paragraph compatibility reader,
  second caption authoring model, or unrelated package cleanup.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Stop only if a required persisted-data law cannot be implemented without
  choosing a materially different public shape, or the same external
  tooling/browser blocker repeats through the goal-tool threshold. Failing
  tests, broad adoption, and migration work are not blockers while an owning
  source move remains.

Plite Plan state:
- status: done
- phase: complete
- next: none
- handoff: ready

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Accepted review requirements are materialized below as individual checklist and decision rows. |
| Active goal and plan verified | yes | Goal `019f9019-20fd-7b93-be27-95a5b5688eaa` names this exact accepted-plan execution path and corrected direct-child caption target. |
| Current owners read | yes | Live schema, identity, policy, codec, caption, alignment, render, docs, tests, and Wordgard owners were audited before acceptance and rechecked before execution. |
| Best API target resolved | yes | `best-api review` produced one target; user replied `i agree all, go`. |
| Mode and execution boundary resolved | yes | One-shot accepted-plan execution; source edits authorized, no commit/PR authority. |
| Docs pack selected | yes | `docs` materialized because public guide, concept, API, plugin, and library docs change. |
| `docs-creator` loaded | yes | `.agents/skills/docs-creator/SKILL.md` read completely before source edits. |
| Docs lane selected | yes | Guide/system, API reference, plugin/feature, serialization/library, and spec/law lanes. |
| Target docs and nearest sibling docs read | yes | Editor guide, Plate plugin API, Plite schema concept/API, Plite DOM, roots, persistence, and style-plugin docs audited. |
| Docs style doctrine read | yes | `docs-creator` voice, topology, source-backed, current-state, and verification rules loaded. |
| Documented source owner identified | yes | Plite owns raw schema/codec/root laws; Plate owns plugin/render/caption product teaching. |
| Package/API pack selected | yes | Public package types, exports, persisted model, and runtime behavior change. |
| Public surface or package boundary identified | yes | `@platejs/plite`, `@platejs/plite-dom`, `@platejs/core`, and affected feature packages. |
| Release artifact path selected | yes | One `.changeset/*.md` per package with a user-visible delta from `main`; exact package matrix follows implementation census. |
| `changeset` skill loaded when `.changeset` is required | yes | `.agents/skills/changeset/SKILL.md` read completely; one package/file and no forbidden core minor. |
| Barrel/export impact decision recorded | yes | Property-policy exports/types are removed and public types change; run `pnpm brl`. |
| Browser pack selected | yes | Caption UI and public examples/routes change. |
| Browser route / app surface identified | yes | `/blocks/media-demo` and `/docs/media`. |
| Browser tool decision recorded | yes | Browser covers both ordinary web surfaces; Chrome and Computer Use are N/A because the caption packet has no native browser or OS interaction. |
| Console/network caveat policy recorded | yes | Treat new runtime/console errors as failures; record unrelated pre-existing warnings/network failures separately. |

Work Checklist:
- [x] Persist Media caption content directly in the Media element's inline/text
      `children`; canonical absence is one empty text leaf.
- [x] Remove `BaseCaptionPlugin`, `TCaptionElement`, structural `caption`
      dependencies, wrappers, exports, UI registrations, and source-owned
      fixtures.
- [x] Normalize the published legacy caption property into direct children
      without a user migration script; delete unreleased intermediate shapes
      instead of shipping readers for them.
- [x] Keep image focus and caption editing distinct through Plite
      `NodeSelection` and `TextSelection`.
- [x] Make generic `keyboardSelectable` navigation enter direct editable
      content with ArrowDown and return to the owner with ArrowUp at the leading
      boundary; prove exact-node copy/cut, input ownership, and deletion.
- [x] Hide an empty caption unless its Media owner is node-selected or its
      caption text is focused, without changing persisted data or copy policy.
- [x] Adopt direct children across Markdown, static rendering, registry values,
      docs, release artifacts, and generated source-owned metadata.
- [x] Pass focused package/type/browser proof, bounded deletion audits,
      autoreview, and the final plan checker.

Historical work checklist (superseded caption-wrapper rows remain execution
history only):
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports/behavior claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] N/A for corrected caption goal: complete-schema identity remains broader
      hard-cut history and is not a caption completion condition.
- [x] N/A for corrected caption goal: published schema identity remains broader
      hard-cut history and is not a caption completion condition.
- [x] N/A for corrected caption goal: state-field persistence is unchanged by
      structural captions.
- [x] N/A for corrected caption goal: property validation/policy removal is a
      separate schema hard-cut owner.
- [x] N/A for corrected caption goal: host-codec conflict ownership is a
      separate Plite DOM owner.
- [x] N/A for corrected caption goal: general one-use host codec teaching is
      outside the Media caption boundary.
- [x] N/A for corrected caption goal: deleting generic plugin `host` is a
      separate Core hard cut.
- [x] N/A for corrected caption goal: generic model-to-host projection is a
      separate Core hard cut.
- [x] N/A for corrected caption goal: schema-owned property storage keys are a
      separate plugin-family hard cut.
- [x] N/A for corrected caption goal: LineHeight/TextAlign/TextIndent/Indent
      storage-key adoption is a separate plugin-family hard cut.
- [x] Rich captions are the Media element's own direct inline/text `children`;
      no caption element, paragraph wrapper, caption root, or second persisted
      representation exists.
- [x] Delete `@platejs/caption` completely. Media owns caption model,
      insertion, normalization, and serialization; the registry Media caption
      component family owns styled rendering, visibility coverage, and focus
      controls. No package stub, dependency, export, standalone package docs,
      or runtime import survives.
- [x] Caption insertion accepts semantic caption input but persists only direct
      inline children; rendering uses the Media element's normal child slot.
- [x] Empty-caption visibility is renderer state keyed by exact Media
      `NodeSelection` or descendant `TextSelection`; the direct caption content
      remains mounted and serializable while the visual asset stays
      non-editable.
- [x] Published legacy `caption: Descendant[]` data is consumed automatically
      before schema fitting, flattened from its released single-block form when
      needed, written into direct children, and deleted in the same repair.
- [x] Conflict behavior for non-empty legacy `caption` plus non-empty direct
      children is explicit, deterministic, and tested.
- [x] Generic Plite content roots remain available for genuinely detached or
      shared content, but no Caption/Media/Markdown/UI owner uses them.
- [x] N/A for corrected caption goal: general alignment migration is a
      separate data-model owner.
- [x] N/A for corrected caption goal: the rich-text schema inference example
      is a separate Plite AX owner.
- [x] N/A for corrected caption goal: schema-reconfiguration example ownership
      is a separate Plite lifecycle owner.
- [x] N/A for corrected caption goal: general Plite schema/API topology is a
      separate docs owner.
- [x] N/A for corrected caption goal: generic Plate host and Plite DOM codec
      teaching is a separate docs owner.
- [x] Caption decision rows record owner, adoption, proof, risk, and verdict;
      broader rows are retained as historical context.
- [x] Caption package and persisted-data breaks have complete
      adoption/deletion answers with no private bridge.
- [x] Caption execution Slice 10 and its proof-matrix row are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: package changesets plus the registry changelog cover every published surface.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only Caption UI behavior uses the registry changelog while published package deltas use package changesets.
- [x] Package/API pack: N/A for a no-artifact path because this packet has both published package and registry deltas, each with its required artifact.
- [x] Package/API pack: `@platejs/caption` deletion and one-way persisted-data normalization are explicit hard cuts with no compatibility package.
- [x] Package/API pack: Media, Markdown, Utils, Test Utils, and www owner checks are recorded.
- [x] Package/API pack: `pnpm brl`, changeset status, and registry changelog generation/check pass.
- [x] Browser pack: `/blocks/media-demo` Caption action and `/docs/media` exact-shape outcomes are recorded.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: both routes return successfully and report zero console errors.
- [x] Browser pack: screenshot N/A because DOM structure, selection placement,
      hidden coverage, docs text, and console state were directly inspectable;
      the Browser DOM/action receipt is the final artifact.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Source, package, Browser, review, release, barrel, lint, and deletion gates are green. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final bounded source audit finds only intentional release/changelog migration prose; `packages/caption` and package-manager references are absent. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Accepted target is direct Media inline children with distinct node/text selection; final autoreview is clean. |
| Conditional risk and adoption | yes | Complete triggered risk/browser/benchmark/provenance work or give one scoped N/A reason | Published inline and single-block caption-property data normalizes before fitting; ambiguous dual sources reject without loss. Browser applies; benchmark and public provenance are N/A because no performance claim or public queue item exists. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Exact package totals, strict Chromium result, audits, and Browser receipts are recorded below. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Ownership, hard cuts, proof, and CI-owned generated residuals are recorded below. |
| Autoreview | yes | Run for implementation changes or record planning-only N/A | Final scoped Claude autoreview reports zero accepted/actionable findings; the valid MediaToolbar portal-focus finding was fixed and reproved first. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-23-schema-api-hard-cuts.md` | Final plan checker passes after all evidence rows close. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | EN/CN Media docs and Plite selection teaching match direct children, automatic supported-legacy normalization, and distinct node/text selection. |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | `/docs/media` renders the exact children shapes and current package owner; no stale Caption package link remains. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | Full `pnpm --filter www typecheck` runs `build:source`, docs parity, registry-source checks, and both TypeScript projects successfully. |
| Plugin page specifics | yes | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | Media docs show kit registration, insertion input, persisted shape, migration law, and exact public types. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Media owns direct caption semantics/construction, registry owns Caption UI, and Caption package/type/key/hyperscript surfaces are absent. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Media, Markdown, Utils, Test Utils, and `platejs` have published major deltas; registry Caption UI has a registry changelog. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Media, Markdown, Utils, Test Utils, Plite, Plite React, and Plate changesets describe direct children, automatic published-data normalization, and node-selection behavior; changeset status passes with no forbidden minor. |
| Registry changelog | yes | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | Caption registry behavior has source entry plus generated JSON; generator write/check passes. |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A because both package and registry deltas have their required release artifacts. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Seven source-first package typechecks pass; strict Plite, Media, Markdown, Utils, Test Utils, registry, and full www checks pass. |
| Barrel/export generation | yes | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | `pnpm brl` passes 55/55 generated barrel tasks. |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | `/blocks/media-demo` proves node/text focus, hidden optional caption, Arrow transitions, exact deletion, and stable portaled Media URL editing; `/docs/media` proves the exact public shape. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Final cold interaction receipt reports zero new console errors. |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | DOM/action receipts below prove exact model paths, native-selection ownership, figure/figcaption structure, toolbar focus, deletion, and docs text; screenshot N/A. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Accepted `best-api` review plus live owner audit; requirements copied into this plan. | Execute |
| Decide | complete | User accepted every before/after target and hard-cut policy. | Execute |
| Execute | complete | Media, Plite selection, registry, Markdown, docs, release, and doctrine owners are source-frozen. | Prove and hand off |
| Prove and hand off | complete | Strict package/browser proof, public route proof, audits, and final autoreview are green. | None |

Decision brief:
- outcome: one coherent schema/property/host/caption model across Plite and
  Plate, with smaller inferred authoring paths and truthful persistence laws.
- chosen shape: omission-derived schema identity; inline versioned validation;
  declaration-owned host codecs; explicit render projection; schema-owned
  storage keys; direct-child rich captions; direct `align`; explicit value
  codecs.
- strongest rejected alternative: keep accepted identity/policy machinery and
  patch docs/callers locally. Rejected because it preserves redundant public
  identity, a lying nullable contract, inaccessible codec IDs, and lossy rich
  caption storage.
- consequence: intentional breaking package/type/persisted-data changes with
  hard adoption, migrations, changesets, and no compatibility layer.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Complete schema identity input | Raw complete definitions require `identity: 'derived'`; Plate internally inserts it. | `root` makes a definition complete; omission of `id`/`version` means derived. | `packages/plite` | Marker adds no information and is inconsistent with raw-editor/Plate defaults. | Compiler/types/tests, Core adapter, raw examples, docs. | Schema definition/compiler/type contracts and deletion audit. | Misclassifying partial contributions. | cut |
| Published identity | Public API returns `EditorSchemaIdentity \| null`; runtime always seeds derived identity. | Non-null derived or named identity. | `packages/plite` | Current public type/docs lie. | History, Yjs, Core types/docs. | Raw editor, named/derived fingerprint, history/Yjs identity tests. | Decode or initialization assuming null. | cut |
| State-field persistence | Explicit `persist: valueCodecs.*`. | Keep unchanged. | `packages/plite` | Codec owns runtime decode/version law. | Docs reaffirm only. | State-field persistence tests. | Accidental inference shortcut. | keep |
| Custom property validation | Named `definePropertyPolicy({ id, version, validate })` passed to descriptors. | `property.*({ validate, validationVersion })`, inferred inline; compiled property owns identity. | `packages/plite` | Policy ID is redundant and every production caller pays ceremony. | Eleven production factories, tests, docs, exports. | Descriptor inference, fingerprint/version, hostile decode, conflict tests. | Fingerprint drift or missed validator version bump. | cut |
| Host-codec claims | Codec `schema` contains compiled property IDs; docs teach declarations. | Codec `owns` contains exact property declarations and element/schema claims. | `packages/plite-dom` | Raw callers cannot construct compiled IDs; `schema` is the wrong noun. | Core ParserPlugin, Markdown, tests/docs. | Ownership conflict, declaration canonicalization, lifecycle/type tests. | Object-identity coupling or overlapping claims. | rearchitect |
| Plate plugin host projection | `host` owns broad allowlists and unused `toDataAttributes`; `render.nodeProps` also projects props. | Delete `host`; explicitly project trusted props through `render.nodeProps`. | `packages/core` plus feature plugins | One render owner is smaller and safer. | Link, Table, Image, Video, type/tests/docs. | React/static rendering, attribute filtering, source audit. | Dropped necessary DOM attributes or leaked model data. | cut |
| Schema-owned property key | Schema uses plugin `type`; some updates use configurable `nodeKey`. | Storage/parser/update use resolved `type`; `styleKey` stays presentation-only. | Core injection contract plus feature packages | Split truth can write schema-invalid documents. | LineHeight, Align, TextIndent, Indent, docs/tests. | Custom-type configuration and schema validation tests. | Breaking custom node-key consumers. | cut |
| Rich caption model and UI ownership | Published `caption: Descendant[]` property plus unreleased root/wrapper experiments. | Media is a non-void, isolating, keyboard-selectable element whose direct inline/text children are the optional caption; `NodeSelection` focuses the asset and `TextSelection` edits the caption. | `@platejs/media` schema/construction/normalization + generic Plite selection runtime + registry Media UI | A one-child caption wrapper names no independent grammar, identity, command, or reuse boundary; direct children are the smallest truthful model. | Automatic published-property normalization, direct construction output, generic node navigation/copy/cut/input/deletion, UI/static render, Markdown, fixtures, docs; delete Caption package and transient shapes. | Schema and normalization contracts, selection and clipboard runtime/browser tests, static/Markdown round trips, route proof, and bounded deletion audits. | Native caret leaking during node focus, legacy data loss, ambiguous dual data, clipboard loss, hidden-text mutation, or UI conflating node and text selection. | rearchitect |
| Alignment | Direct `align`; some legacy/demo data used `attributes.align` or unsupported `file.align`. | Keep direct `align`; migrate/remove invalid legacy fields once. | Basic Styles + migration owners | Flat semantic property is Plate-native; attributes are host/table data. | Demos, saved data fixtures, docs. | Schema load/render plus migration tests. | Legacy rejection without migration. | keep |
| Raw schema example/type inference | Repeated local align descriptors and manually duplicated custom model types. | Semantic groups plus installed-schema inference; one coherent owner file. | Plite type system + apps/www example | Line count is fine; duplicate contracts and casts are not. | Rich-text example/custom types/tests. | Type contract and browser example. | Inference widening from mapped mark declarations. | rearchitect |
| Docs topology | Identity/schema/reconfiguration teaching duplicated and contradictory across guide/concept/API/library pages. | One canonical concept owner, terse API reference, local cross-links. | Docs owners | Agents cannot distinguish five uses of `schema`. | Named EN/CN pages where present. | MDX source/parity, link, route, source audit. | Stale generated docs or CN drift. | rearchitect |
| Reconfiguration example ownership | One route combines schema lifecycle with unrelated Plate descriptor/format probe. | Separate coherent examples/tests. | apps/www + apps/plite | One file should answer one primary behavior job. | Registry/loaders/tests. | Focused browser tests for both routes. | Route/test churn. | move |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 0. Baseline contracts | Root/plan | Recheck callers, exports, persistence owners, and focused baseline tests. | Accepted target. | Exact file/caller matrix and baseline failures recorded. | complete: bounded identity/policy/host/caption/alignment/storage-key censuses recorded below. |
| 1. Identity hard cut | Plite/Core | Derived omission, non-null identity, Core adapter/callers/docs. | Slice 0. | Old input marker and nullable contract absent. | Source frozen: Plite typecheck and focused 151/151; Plite History typecheck plus 22/22 persistence/branch and 3/3 guards; Yjs typecheck and 220/220. Docs closure remains in Slice 11. |
| 2. Inline validation | Plite + policy consumers | Descriptor API, compiler/fingerprint, migrate every policy, delete export/file. | Slice 1 stable. | No property-policy public owner/caller remains. | Source frozen: Plite/Core focused 142/142, 101/101, 84/84; feature packets green; Caption/Yjs/docs adoption remains. |
| 3. Codec ownership | Plite DOM/Core/Markdown | `schema`→`owns`, declaration claims, inline callers, docs. | Slice 2 descriptors stable. | No public compiled-ID claim or stale codec schema field. | Source frozen: Plite DOM 22/22; integrated consumers 50/50 and affected typechecks. |
| 4. Plate render projection | Core + feature plugins | Delete plugin host/allowlists; explicit node props and data-attribute audit. | Slice 3 model identity stable. | No plugin `host` public surface/callers. | Source frozen; integrated Core/feature/browser proof remains. |
| 5. Property storage keys | Core + style/indent owners | Resolved-type law, remove schema-owner nodeKey use/docs. | Slice 4. | All schema-owner reads/writes/parsers agree. | Source frozen for LineHeight/Align/TextIndent/Indent and five font owners; integrated proof remains. |
| 6. Raw schema AX | Plite type system + examples | Group/inference repair, rich-text example, reconfiguration split. | Identity/types stable. | No manual duplicate model contract for the example. | Source frozen: Plite React typecheck/compile-only inference contract and two focused Chromium rows; www adoption closure remains. |
| 7. Content-root schema | Plite/Core | Generic exclusive/shared ownership and typed child-root slots. | Prior schema cuts stable. | Generic detached/shared content roots remain coherent without using captions as justification. | Source frozen: Plite typecheck; Plite 50/50 focused schema/compiler/lifecycle; Core typecheck/contracts; compiler 13/13; Biome and diff checks. |
| 8. Content-root lifecycle | Plite/DOM/React/History | Root-bearing slices, clone/remap/cascade/cut/undo laws. | Slice 7. | No root aliasing, orphaning, or second cleanup transaction. | Source frozen: Plite lifecycle 11/11 plus slices 16/16 and 50k sparse guard 1/1; DOM clipboard 54/54; React projected clipboard 9/9; History 83/83; four package typechecks, Biome, and diff checks. |
| 9. Plate document boundary | Core React/static | Full-document initialization/change payload and typed interactive/static root slots. | Slice 7. | Plate cannot silently discard roots in persistence or rendering. | Source frozen: Core typecheck/contracts; focused 87/87; slow 46/46; Suggestion 33/33; Table 5/5; package typechecks, Biome, and diff checks. Full Core has two unrelated input-rule assertion failures. |
| 10. Media caption adoption and package cut | Media/Plite/Plite React/Markdown/apps | Direct inline children, automatic published-property normalization, generic node/text selection transitions, exact-node clipboard/input policy and deletion, UI/static rendering, Markdown, and deletion of `@platejs/caption` plus transient root/wrapper shapes. | Normal child/document model and serializable NodeSelection exist. | One persisted caption representation; asset focus and caption caret are distinct; node focus copies/cuts the exact owner and cannot mutate hidden caption text; no caption element/root/package surface or migration script. | Complete: owning tests/typechecks, strict Plite Chromium, registry tests, public Browser routes, deletion audits, and autoreview pass. |
| 11. Docs/releases/closure | Docs/package owners | Current-state docs, changesets, barrels, lint, deletion audits, Browser, autoreview. | All code slices green. | Every completion gate and checker passes. | Complete: www source/parity/type integration, changesets, changelog, barrels, lint, audits, Browser, review, and plan checker pass. |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Identity is always published | Seeded derived base schema and current compiler/runtime audit. | Plite typecheck and focused raw/derived/named/non-null contracts 151/151. | source_complete |
| Validation remains deterministic and versioned without policy IDs | Compiled property already owns stable identity; current fingerprint uses only policy ID/version. | Plite/Core focused 142/142, 101/101, 84/84 plus green feature migrations. | source_complete |
| Host codecs claim public declarations safely | Docs/source contradiction and production consumers audited. | Plite DOM 22/22; integrated Core/Markdown/code-block consumers 50/50 and affected typechecks. | source_complete |
| Explicit render projection preserves required DOM/static props | Historical broad-plan context outside the corrected caption goal. | N/A for caption closure. | context_only |
| Storage key cannot diverge from schema owner | Historical broad-plan context outside the corrected caption goal. | N/A for caption closure. | context_only |
| Rich captions are native editable child content | Published caption-property data, unreleased root/wrapper experiments, direct editing, and Plite selection ownership were audited. | Direct grammar and normalization contracts, exact NodeSelection/TextSelection runtime tests, Markdown/static round trips, strict Chromium, public Browser interaction, and deletion audits pass. | complete |
| Direct align and explicit state codecs remain canonical | Historical broad-plan context outside the corrected caption goal. | N/A for caption closure. | context_only |
| Media docs and examples teach only the shipped caption target | Named Media docs/routes/source owners audited. | `build:source`, docs parity, www typecheck, Browser routes, and bounded source audit pass. | complete |

Conditional evidence:
- High-risk scenarios:
  1. schema fitting rejects legacy `caption` before automatic normalization can
     consume it;
  2. a node with legacy `caption` and canonical children resolves the conflict
     nondeterministically or loses user content;
  3. hiding the caption DOM leaves selection inside unmounted content instead
     of applying the declared skip policy;
  4. copy, undo, Yjs, or Markdown loses or duplicates canonical child content;
  5. inline validator changes without `validationVersion` changing the
     fingerprint;
  6. declaration claims resolve by object identity and fail after normalized
     schema cloning;
  7. explicit render projection drops link/table/media attributes or leaks
     untrusted model fields;
  8. a configured schema property writes a different key than it declares.
- External research: N/A: Wordgard source was already audited as the named
  contemporary reference; local accepted target and live owners settle
  execution.
- Issue/PR provenance: N/A: user-directed internal architecture hard cut, not
  public queue work.
- Browser/benchmark/docs/release/behavior-law owners: Browser, docs,
  changesets, and behavior laws apply; performance benchmarks are N/A because
  no performance claim is made.

Findings:
- The pasted rich-text schema is in `richtext.tsx`, not the named
  reconfiguration file.
- Runtime always publishes a derived base schema although the public identity
  type and Plite concept docs allow `null`.
- Eleven production property policies all use explicit generics, unique IDs,
  version 1, and `property.json`; duplicated validators exist.
- Host-codec docs require exact declarations while source exposes compiled IDs
  unavailable to static raw callers.
- No production plugin uses `host.toDataAttributes`; five allowlist users can
  project explicit render props.
- Caption JSON accepts typed rich descendants but the published UI/Markdown
  path was lossy.
- A Media caption has no independent grammar, identity, command surface, or
  reuse boundary. It therefore stays in the Media element's direct inline
  children; a semantic wrapper would be type ceremony, not structure.
- Plite already serializes `NodeSelection`, but `keyboardSelectable` previously
  had no React navigation consumer and element-selected UI conflated owner node
  focus with descendant text selection.
- Generic shared/exclusive roots remain valid for independently addressable
  content. A Media caption is structurally owned and therefore stays in normal
  `children`.
- Direct `align` is canonical; `attributes.align` is rejected and file align
  was a no-op while audio/video remain targeted.
- Schema-owned `nodeKey` divergence exists beyond LineHeight/Align in
  TextIndent and Indent.

Decisions and tradeoffs:
- Reverse the accepted explicit-derived and named-policy plans because the
  accepted best API removes public information-free identity.
- Keep strict codecs/fingerprints; delete only redundant caller-facing
  identity.
- Use direct Media inline children. Rich editing does not justify a second root,
  a one-child semantic wrapper, or arbitrary block children; independent
  grammar or content ownership would.
- Treat legacy caption conversion as automatic normalization, not a public
  migration utility or persistent compatibility reader.
- Prefer explicit render projection over moving the dangerous allowlist into
  another namespace.
- Reject a property mini-schema DSL until repeated real jobs justify it.
- Reject dual declaration/handle codec claim paths and any persisted caption or
  alignment compatibility alias.

Review fixes:
- User correction accepted: replace caption roots and structural wrappers with
  direct Media inline children; keep automatic one-way normalization of the
  published caption property with no script.
- User correction accepted: image asset focus and optional caption editing are
  distinct states. Generic Plite `NodeSelection`/`TextSelection` behavior owns
  the distinction instead of another persisted node type.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Initial route audit missed the registry `media-demo` entry and temporarily named `/blocks/playground`. | 1 | Read the registry item owner instead of inferring from a partial file list. | `registry-examples.ts` proves `/blocks/media-demo`; plan and Browser target corrected. |
| Read-only audit classified the released single-block `caption` property form as transient machinery. | 1 | Compare against `HEAD` package types and persisted fixtures. | `TCaptionProps.caption?: Descendant[]` and the released fixture prove the form; automatic property normalization retains it while transient direct wrappers are deleted. |
| First selection-concept patch used a stale heading context. | 1 | Re-read the bounded source range and patch exact current headings. | Keyboard-selectable selection docs applied successfully. |
| One root-level Bun invocation mixed package-specific JSX preloads and module mocks across Plite React, Media, and www. | 1 | Run each package through its owning test script/config, and keep app integration in its own Bun process. | The mixed 70/83 result is invalid as product evidence; isolated owner reruns follow. |

Verification evidence:
- Media direct-child contracts pass 79/79 tests and 180 assertions; Media and
  Utils typechecks pass. Published inline and single-block property shapes
  normalize before schema fitting on initialization and deferred value replace.
- Plite source freezes with full package totals of Plite 1407/1407, Plite DOM
  195/195, and Plite React 1027/1027. The final
  `pnpm check:plite` strict lane passes all type/package/contract/public-type
  gates plus Chromium 689 passed, 6 skipped, across 78 bounded batches.
  The exact semantic node-delete regression also passes inside 766/766 runtime
  contracts.
- Markdown direct-child proof passes 20/20 focused Media tests, 15/15
  CommonMark slow tests, and 49/49 app integration tests. Registry Media UI
  passes 19/19 tests with 54 assertions; demo values pass 2/2.
- Seven source-first package typechecks pass for Plite, Plite DOM, Plite React,
  Media, Markdown, Utils, and Test Utils. Full www `typecheck` passes
  `build:source`, docs parity, registry-source checks, and both TypeScript
  projects.
- `pnpm brl` passes 55/55 tasks. Changeset status passes with no minor bumps;
  registry changelog generation checks 29/29 events. Biome checks 4545 files
  with no fixes; its sole warning is the unrelated pre-existing 1.2 MiB
  Wordgard audit manifest. `git diff --check` passes.
- `/blocks/media-demo` proves the populated image owner at `[2]` with direct
  caption `[2,0]`, optional empty captions hidden until focus, DOM-less
  NodeSelection, ArrowDown to caption TextSelection, ArrowUp to exact owner,
  and Delete restoring text selection outside the removed figure. The final
  MediaToolbar regression receipt proves `ring=true`, one Edit-link button,
  one Caption button, then one focused URL input in one open portal, with zero
  new console errors.
- `/docs/media` renders `children: [{ text: 'Plain caption' }]`,
  `children: [{ text: '' }]`, `NodeSelection`, and `TextSelection`; it contains
  no Caption package/plugin teaching.
- Final bounded deletion audit finds only intentional migration prose in
  changesets and the registry changelog. `packages/caption` is absent and no
  package manifest or lockfile references it.
- Final scoped Claude autoreview reports zero accepted/actionable findings.
  Earlier reviewer claims about compiler-owned `block`, semantic delete
  dispatch, and unsupported arbitrary legacy shapes were rejected with owner
  source and executable evidence; the valid portaled MediaToolbar focus
  regression was fixed and reproved before the clean pass.

Final handoff prepared:
- `@platejs/media` owns direct caption grammar, construction, and one-way
  normalization; Plite owns generic model-only node selection, navigation,
  clipboard/input, and deletion; registry Media components own visible caption
  and toolbar UI; Markdown owns CommonMark/figure serialization.
- Breaking cuts are explicit: direct Media children are the sole persisted
  caption, `@platejs/caption` and its types/keys/hyperscript surface are gone,
  and ambiguous dual non-empty caption sources reject instead of losing data.
- Source, package, release, docs, Browser, audit, and review proof is complete.
  No commit or PR was created.
- CI must regenerate its owned `templates/**`, `apps/www/public/r/**`, and
  generated registry mirrors; repo policy forbids editing those outputs here.

Timeline:
- 2026-07-23T15:08:29.000Z Plite Plan created.
- 2026-07-23 Accepted `best-api` target converted to one-shot execution; docs,
  package-API, and browser packs materialized; Vision, Plite Plan, Plate Plan,
  Docs Creator, and Changeset owners loaded.
- 2026-07-23 Baseline census completed. Plite DOM `owns` source and declaration
  tests froze with 22/22 focused tests. LineHeight, TextAlign, TextIndent, and
  Indent storage-key source/tests froze with both package suites green;
  integrated typechecks await the concurrent Plite validation hard cut.
- 2026-07-23 Identity froze with Plite typecheck and 151/151 focused contracts.
  Inline validation and its Core runtime froze with 142/142, 101/101, and
  84/84 focused proof; simple/heavy feature consumers passed package checks.
- 2026-07-23 Codec consumers, plugin-host deletion, explicit render projection,
  and remaining schema-owned storage-key packets froze. The schema lifecycle
  example split from the Plate descriptor proof and both focused Chromium rows
  passed.
- 2026-07-23 Caption substrate audit rejected an isolated UI migration as
  unsafe. Execution split into schema ownership, generic root lifecycle,
  full-document Plate persistence/rendering, Caption/Media adoption, Markdown,
  and document-level Yjs synchronization.
- 2026-07-23 Raw schema AX froze: complete installed schemas now drive React
  editor inference, `richtext.tsx` uses semantic groups without manual editor
  or value types, and Plite React typecheck plus its compile-only inference
  contract passed. The lifecycle and Plate descriptor examples are separate;
  both focused Chromium rows passed.
- 2026-07-23 Content-root schema contract froze. Raw shorthand compiles shared
  roots, explicit records compile exclusive roots, Plate
  `own.contentRoot(..., { ownership, target })` projects targeted declarations,
  and installed schemas infer exact required `childRoots` keys. Plite/Core
  typechecks, 50/50 Plite contracts, 13/13 Core compiler tests, Biome, and diff
  checks pass.
- 2026-07-23 The remaining raw-schema www adopters (`mentions.tsx` and
  `yjs-collaboration.tsx`) stopped importing the shared handwritten custom
  model and derive their editor/value/node types from installed schema
  extensions. A focused www TypeScript pass reports no errors in either file;
  remaining errors belong to active Caption/Media/Markdown document-root work.
- 2026-07-23 Plate's document boundary froze. Initialization and
  `transformInitialValue` accept the complete document; `onValueChange`
  publishes primary children, named roots, and persisted meta; inferred
  interactive/static `slots.contentRoot(...)` share one renderer contract; and
  `normalizeStaticValue` preserves and normalizes every root with one ID
  stream. Core focused 87/87 and slow 46/46, Suggestion 33/33, Table 5/5,
  source-first typechecks, Biome, and diff checks pass. Full Core's only two
  failures are unrelated current-tree input-rule assertions.
- 2026-07-23 Yjs multi-root synchronization froze. One controller publishes
  primary and named roots in one Yjs transaction, includes offscreen roots,
  qualifies awareness by root, rejects cross-root ranges, fits whole documents
  through ownership laws, and keeps claimed schema identities non-null. Yjs
  typecheck, package lint, diff check, and full 220/220 tests pass.
- 2026-07-23 Plite History completed the non-null identity adoption.
  `History.schema` and JSON format 4 require an identity, stores read the
  editor's published identity directly, and null envelopes reject before
  batch decode. Typecheck, focused persistence/branch 22/22, guards 3/3,
  Biome, and diff checks pass. Full History is 123/124 with one unrelated
  current-tree root-view merge failure preserved.
- 2026-07-23 generic content-root lifecycle and transport froze. Version 1
  `ContentSlice` carries reachable roots; owner-first and root-first
  publication is atomic; invalid payloads publish nothing; copy remaps roots
  deterministically; cut, removal, type changes, and retargeting clean only
  orphaned exclusive roots through the owner index; undo/redo restores roots
  and root-qualified selection. Plite lifecycle 11/11, slices 16/16, the 50k
  sparse guard 1/1, DOM clipboard 54/54, React projected clipboard 9/9,
  History 83/83, four package typechecks, Biome, and diff checks pass.
- 2026-07-23 Caption target corrected before product adoption. Media captions
  are structurally owned child content; DOM coverage handles hidden selection.
  Legacy `caption` normalizes automatically and is deleted. Generic content
  roots remain frozen for genuinely independent root semantics.
- 2026-07-23 Package ownership corrected after product adoption review.
  `@platejs/caption` is deleted rather than moved wholesale into Media:
  `@platejs/media` owns model semantics and the registry Media caption family
  owns UI behavior. Standalone Caption docs merge into Media docs.
- 2026-07-23 Caption package hard cut source-complete. `pnpm install`,
  Media typecheck, full www typecheck/docs parity/registry-source checks,
  registry caption 4/4, `pnpm brl`, Changesets status, registry changelog
  generation/check, Biome, diff-check, and bounded deletion audits pass.
  Browser `/blocks/media-demo` renders the caption, the Caption action places
  selection inside `figcaption`, and `/docs/media` renders the merged Captions
  section with no stale route link or console error. Focused autoreview reports
  no accepted finding; its generated `apps/www/public/r/**` finding is rejected
  because repo policy reserves that output for CI and forbids local registry
  builds. The combined Turbo lane remains blocked only by unrelated AI
  declaration portability errors; direct Media and www owner checks pass.
- 2026-07-23 A temporary `{ type: 'caption' }` wrapper target was implemented
  and proven, then explicitly rejected by the user. Its source and proof are
  superseded history and do not count toward the direct-child completion gate.
- 2026-07-23 Preliminary docs compilation passes with
  `pnpm --filter www build:source`. The stale Plite extension `config` example
  is repaired to `options`; the Plite DOM example keeps reusable schema
  declarations named but inlines its one-use host codec and states structural,
  not object-identity, ownership matching.
- 2026-07-24 Direct-child source lanes froze for Media, Markdown, test-utils,
  values, EN/CN Media docs, releases, and registry rendering.
- 2026-07-24 Generic Plite keyboard selection froze. Model-only NodeSelection
  survives stale native selection, ArrowDown/ArrowUp switches between owner and
  direct caption text, exact owner copy/cut/delete works, and printable
  input/paste remains inert until text entry.
- 2026-07-24 The strict Plite lane passed every package/type/contract gate and
  Chromium 689 passed with 6 intentional skips across 78 bounded
  batches. Its only discovered stale assertion was repaired to accept Plate's
  normal generated node id; the compiler-owned rich-text `block` membership
  repair passed the full matrix.
- 2026-07-24 Final review found and fixed MediaToolbar's portaled-focus
  regression by retaining last-focused-editor ownership. Browser proves the
  URL input remains focused and open with zero new errors; registry 19/19 and
  full www checks pass. Final autoreview is clean.
- 2026-07-24 Release, barrel, docs, lint, deletion, Browser, review, and plan
  closure gates passed; the direct-child packet is ready for handoff.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Direct-child Media captions and generic node selection are implemented, proven, and source-frozen. |
| Where am I going? | Handoff only; no source work remains in this goal. |
| What is the goal? | Keep direct Media inline children as the sole canonical caption shape with distinct asset NodeSelection and caption TextSelection. |
| What have I learned? | The published property can contain one block wrapper and must normalize automatically; unreleased root/wrapper experiments should not create migration machinery. |
| What have I done? | Completed Media, Plite, Markdown, registry, docs/release, Browser, audit, and review adoption with exact proof. |

Open risks:
- No accepted product risk remains.
- CI-owned `templates/**` still contain generated `@platejs/caption`
  references. Repo policy forbids manual edits; corrected registry/package
  source is ready for CI regeneration.
