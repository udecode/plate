# execute plugin capability review

Objective:
Execute all 43 accepted plugin capability recommendations; done when every row
is implemented and adopted with zero stale API matches and all owning proof
passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-26-execute-plugin-capability-review.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- package-api
- docs

Mode:
- accepted-plan execution using the standard Plate Plan proof model

Completion threshold:
- All 43 non-keep rows from
  `docs/plans/artifacts/2026-07-26-plate-next-all-package-plugin-api-review/plugin-api-review.json`
  are implemented or explicitly blocked by a repeated owner-level failure.
- Every affected package source caller, test, export, doc, example, registry
  caller, and release artifact uses only the final capability surface.
- Zero stale rejected API/helper matches after exact source audits.
- Every touched package passes source-first typecheck, focused tests, publishable
  declaration build, Biome/lint, and applicable barrel checks.
- Core capability inference and affected app/docs/browser surfaces pass their
  owning gates.
- Autoreview has zero accepted actionable findings and `check-complete` passes.

Verification surface:
- Live 43-row review ledger remapped against the current source snapshot.
- Focused package typecheck, tests, and package builds for every touched package.
- Core compile-only capability inference and relevant Core behavior tests.
- Exact old API/helper/export source audits across packages, apps, content,
  tests, and examples.
- `pnpm brl` for moved/deleted public files, current-state docs validation,
  affected registry/browser routes, changeset validation, and final autoreview.

Constraints:
- User explicitly authorized execution of all 43 accepted rows.
- No public compatibility aliases or runtime shims.
- Preserve current shared WIP and re-read live owners before each slice.
- Keep inline inference; no callback annotations, plugin export casts, `any`,
  ferry types, or wrapper helpers used to hide type loss.
- Constructor first; `.extend()` survives only for imported/prebuilt
  declarations or real earlier-capability dependencies.
- Do not send coordination messages to other Codex tasks.
- Do not git add, commit, push, or open a PR.

Boundaries:
- In scope: the 43 accepted descriptor rows, their Base/React owners, direct
  callers, tests, exports, docs, examples, registry adoption, and release prose.
- Source owners: `packages/ai`, `basic-nodes`, `code-block`, `comment`, `core`,
  `docx-io`, `emoji`, `footnote`, `indent`, `layout`, `link`, `list-classic`,
  `markdown`, `media`, `mention`, `selection`, `suggestion`, `tabbable`,
  `table`, `tag`, `toc`, and `toggle`, plus direct adopters.
- Non-goals: the 140 keep rows, unrelated package cleanup, unrelated shared WIP,
  new API taste beyond fixing stale accepted-plan claims, commits, pushes, PRs,
  and skill/doctrine edits unless implementation proves a reusable rule is
  missing or contradictory.
- Direct Plite boundary owners: Core plugin capability publication and any
  composite transaction/history substrate required by the accepted AI P0.

Output budget strategy:
- Work slice-by-slice from the 43-row ledger. Use exact `rg`/AST counts and
  capped owner reads; save broad caller/manifests under the existing review
  artifact directory instead of streaming them.

Blocked condition:
- Stop only when the same owner-level blocker recurs for the goal-tool threshold
  and no smaller source, type, test, or adoption repair remains. Record the
  exact command, error, owner, and required external decision.

Plate Plan state:
- status: complete
- phase: handoff
- next: none
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | All 43 accepted rows; implement source/adoption/proof; no compatibility, git publication, unrelated WIP edits, or cross-task messaging |
| Active goal and plan verified | yes | Active goal created with this exact plan and 43-row threshold |
| Current owners read | yes | All 181 live descriptor owners and the 2 absorbed review rows were re-read through the source scanner and per-package adoption |
| Best API target resolved | yes | Accepted 183-row review; 43 non-keep rows with exact current/final surfaces |
| Mode and execution boundary resolved | yes | User said “Ok go execute all”; accepted-plan execution authorized |
| Package/API pack selected | yes | Public package APIs, types, exports, and callers change |
| Public surface or package boundary identified | yes | 22 owning packages plus direct package/app/docs adopters |
| Release artifact path selected | yes | Package-facing hard cuts require `.changeset` coverage |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded before release prose repair; `pnpm changeset status` passes with one valid release entry per package |
| Barrel/export impact decision recorded | yes | Run `pnpm brl` after helper/export moves or deletions |
| Docs pack selected | yes | Current API docs/examples must adopt hard cuts |
| `docs-creator` loaded | yes | Loaded before current-state docs and example adoption |
| Docs lane selected | yes | Existing plugin/reference docs and examples; latest-state wording only |
| Target docs and nearest sibling docs read | yes | Markdown, CSV, plugin portal, initialization, and registry example families audited against live owners |
| Docs style doctrine read | yes | Current-state docs doctrine applied; migration prose kept only in changesets |
| Documented source owner identified | yes | Each accepted row’s package descriptor and exported portal surface |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | complete | Resolve every readiness condition | All 43 accepted rows implemented; no blocker remains |
| Fresh source evidence | complete | Recheck decision-changing current claims | Final validator: 181/181 live rows, 2 absorbed rows, zero missing/extra/duplicate/ambiguous/parse rows |
| Best API review | complete | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Final `api`/`read`/`selectors`/`update`/`extension` ownership matches the accepted review |
| Conditional risk and adoption | complete | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | AI history, table, Markdown, media upload, docs, registry, and browser lanes proved |
| Verification recorded | complete | Record fresh planning proof and exact execution gates | Exact commands and counts recorded below |
| Handoff prepared | complete | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff section complete |
| Autoreview | complete | Run for implementation changes or record planning-only N/A | Final live-checkout autoreview: zero findings |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-26-execute-plugin-capability-review.md` | checker passes |
| Public API / package boundary proof | complete | Source-audit public API, exports, and package boundary impact | Validator, stale-surface scan, package builds, and generated barrels pass |
| Release artifact classification | complete | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published major API/type/runtime hard cut with registry/docs adoption |
| Published package changeset | complete | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | `pnpm changeset status` passes; duplicate Core major entry consolidated |
| Registry changelog | complete | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | Registry adoption is part of package API releases; existing registry changelog entry preserved |
| No release artifact | complete | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: this is a published package hard cut, so changesets are present |
| Package typecheck/build/test | complete | Run owning package checks or record N/A with reason | 23 target packages: typecheck 49/49 tasks, build 41/41 tasks; full supported test runner green |
| Barrel/export generation | complete | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | `pnpm brl`: 55/55 tasks |
| Docs source-backed claim audit | complete | Verify docs claims against current source or record N/A | `www` source build, docs parity, registry source, app TS, and package-integration TS pass |
| Docs links / routes / previews | complete | Verify leaf links, routes, anchors, and preview names or record N/A | Markdown docs and four standalone demo routes render through Browser |
| Docs MDX/content parser | complete | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | Included in the passing `pnpm --filter www typecheck` gate |
| Plugin page specifics | complete | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | Plugin docs teach only the final scoped/root surfaces |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Fresh scanner validated all 183 rows and the 43-row denominator against the accepted source snapshot | Execute |
| Decide | complete | Accepted capability target retained, with the AI multi-commit controller correction below | Prove and hand off |
| Prove and hand off | complete | All package/app/docs/browser/release gates and final autoreview pass | Close goal |

Decision brief:
- outcome: every accepted capability has one truthful plugin/editor owner and
  every caller teaches the same final surface
- chosen shape: scoped plugin `api`, deterministic active-state `read`,
  option/store `selectors`, tx-bound `update`, and genuinely editor-wide
  `extension`; constructor-first authoring
- strongest rejected alternative: compatibility aliases or mechanical moves
  that retain duplicate root/plugin APIs, mutable reads, nested updates, or
  helper wrappers
- consequence: a broad breaking migration across package declarations,
  callers, tests, docs, exports, registry examples, and release notes

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AI preview/chat/copilot | mixed WeakMap/API mutation and controller writes | replayable preview state, deterministic reads, named updates, API controllers delegating mutations | AI + smallest Core composite-history owner | read/update truth and undo semantics | package, registry AI callers, docs | AI tests, history tests, type/build/browser | highest: multi-commit history | rearchitect |
| Navigation | duplicated root API/update and mutating query | `navigation` selectors/update; lifecycle only in extension | Core | one owner and pure query law | Core callers/tests | Core type/tests | timer/anchor behavior | rearchitect |
| Table | 30+ state queries in API/selectors | construction/host services in API, state queries in read, mutations in update | Table Base owner | active-snapshot truth | package/registry/docs callers | package tests/build/browser | selection/clipboard behavior | move |
| Feature root APIs | Debug, ElementState, Link, Markdown, Footnote, DOCX IO root publication | keyed plugin API/read/update | owning packages/Core | plugin identity already exists | all callers/docs/examples | source audit, package proof | public hard cuts | move |
| Missing scoped helpers | Code Block, Emoji, Mention, Selection, Suggestion, Tabbable, Tag, TOC, Toggle | owner-colocated reads/updates/APIs | owning packages | delete raw editor/tx helper paths | callers/tests/exports/docs | package proof and stale-name audit | transaction semantics | move |
| Option/store projections | document queries or option getters under wrong capability | option/store-only selectors; document state in read | owning plugin | truthful projection semantics | package/React callers | active-state and selector tests | subscription behavior | move |
| Constructor topology | independent `.extend()` stages | constructor fields | Basic nodes, Indent, Layout and any same-class match | `.extend()` only expresses a real dependency | source only | type/build and stage audit | inference regression | move |
| Base/React mirrors | repeated adapter rows | one Base implementation inherited unchanged by adapter | Base owner + thin adapter | no duplicate behavior | adapter callers/tests | declaration inference/build | emitted type loss | move |

Accepted row execution ledger:
| ID | Package | Descriptor | Target | Status | Evidence |
| ---: | --- | --- | --- | --- | --- |
| 1 | ai | `BaseAIPlugin` | replayable preview read/update split | complete | Local history-skipped preview state; focused preview/undo/batch tests and package proof pass |
| 2 | ai | `AIChatPlugin` | controller/api/read/update split | complete | Controllers delegate to cycle-free named updates; deterministic queries moved to read; package/app proof passes |
| 3 | ai | `AIPlugin` | inherit Base AI split | complete | React adapter inherits the Base contract without duplicate behavior |
| 4 | ai | `CopilotPlugin` | suggestion mutations in update | complete | Suggestion writes moved to update and all package/registry callers adopted |
| 5 | basic-nodes | `BaseBlockquotePlugin` | constructor-fold shortcut | complete audited dependency | Constructor owns independent fields; one dependent shortcut stage remains because it consumes inferred update |
| 56 | code-block | `BaseCodeBlockPlugin` | scoped reads and `update.format` | complete | Reads, insertion, and formatting are scoped; standalone transform callers/exports removed |
| 59 | code-block | `CodeBlockPlugin` | inherit Base capabilities | complete | React adapter inherits Base read/update with emitted declarations green |
| 63 | comment | `BaseCommentPlugin` | snapshot searches in read | complete | `api.nodeId`, snapshot reads, and dependent flat updates pass package proof |
| 64 | comment | `CommentPlugin` | inherit Base split | complete | React adapter inherits the Base split |
| 67 | core | `DebugPlugin` | keyed plugin API | complete | Constructor plugin API publishes the typed keyed portal |
| 70 | core | `ElementStatePlugin` | keyed `api.isEmpty` | complete | Scoped emptiness API and block-placeholder adoption pass |
| 80 | core | `NavigationFeedbackPlugin` | `navigation` selectors/update owner | complete | Pure selectors, named updates, and lifecycle-only extension pass Core proof |
| 82 | core | `ViewPlugin` | DOM-owned selected-fragment name | complete | `editor.api.dom.getSelectedFragment` and static/React callers pass |
| 88 | docx-io | `DocxExportPlugin` | `DocxIOPlugin` API services | complete | Renamed owner/key; explicit-input import/toBlob; standalone download only |
| 90 | emoji | `BaseEmojiPlugin` | `update.insert` ownership | complete | Insert behavior colocated under update and standalone transform removed |
| 92 | emoji | `EmojiPlugin` | inherit Base update | complete | React adapter inherits Base update |
| 98 | footnote | `BaseFootnoteReferencePlugin` | feature key, registry-free reads, flat updates | complete | Feature owner renamed; state-derived reads; registry/helper files deleted |
| 101 | footnote | `FootnoteReferencePlugin` | inherit Base footnote split | complete | React adapter inherits Base read/update |
| 102 | indent | `BaseIndentPlugin` | constructor-fold shortcut | complete audited dependency | Constructor owns independent fields; one dependent shortcut stage retained for update inference |
| 105 | layout | `BaseColumnItemPlugin` | constructor-fold shortcut | complete | Independent declaration fields folded into constructor; dependent typing preserved |
| 110 | link | `BaseLinkPlugin` | extension tx group to plugin update | complete | Flat update replaces editor-wide tx group; extension owns interception only |
| 111 | link | `LinkPlugin` | inherit Base update | complete | React adapter inherits Base update |
| 120 | list-classic | `BaseListPlugin` | snapshot-free read helpers to API | complete | Pure structural helpers moved to scoped API; document-state queries remain read |
| 126 | list-classic | `ListPlugin` | inherit Base split | complete | React adapter inherits Base API/read/update |
| 128 | markdown | `MarkdownPlugin` | keyed API plus current-state read serialization | complete | Sole root `editor.api.markdown.{serialize,deserialize,deserializeInline}` surface retained and adopted |
| 139 | media | `PlaceholderPlugin` | upload getter to selector | complete | Uploading-file projection is a selector; recovery and picker paths are single-upload safe |
| 146 | mention | `BaseMentionPlugin` | complete `update.insert` | complete | Cursor movement and trailing-space behavior are owned by update |
| 148 | mention | `MentionPlugin` | inherit Base update | complete | React adapter inherits Base update |
| 150 | selection | `BlockSelectionPlugin` | read/selectors/API/update ownership | complete | Copy controller, deterministic reads/selectors, and paste/removal updates are scoped |
| 156 | suggestion | `BaseSuggestionPluginDefinition` | deterministic identity read split | complete absorbed | Definition capability folded into the surviving Base owner; no duplicate descriptor remains |
| 157 | suggestion | `BaseSuggestionPlugin` | identity API/read split | complete | Pure identity/document reads and mutation ownership pass package proof |
| 158 | suggestion | `SuggestionPlugin` | inherit Base split | complete | React adapter inherits Base split |
| 159 | tabbable | `BaseTabbablePlugin` | `read.findDestination` | complete | Destination query moved to read |
| 160 | tabbable | `TabbablePlugin` | inherit Base read | complete | React adapter inherits Base read |
| 164 | table | `BaseTablePlugin` | state queries to read | complete | Construction/services remain API; document queries are read; mutations are flat update |
| 168 | table | `TablePlugin` | inherit Base split | complete | React adapter and registry callers inherit scoped API/read/update |
| 169 | tag | `BaseTagPlugin` | tag queries to read | complete | Tag document queries moved to read |
| 170 | tag | `TagPlugin` | inherit Base split | complete | React adapter inherits Base capabilities |
| 171 | tag | `MultiSelectPlugin` | inherit Tag capabilities | complete | Derived plugin inherits Tag read/update without duplicate behavior |
| 172 | toc | `BaseTocPlugin` | `read.headings` | complete | Heading derivation moved to read |
| 173 | toc | `TocPlugin` | inherit Base read/update | complete | React adapter inherits Base capabilities |
| 174 | toggle | `BaseTogglePlugin` | document queries to read | complete | Toggle document queries moved to read |
| 175 | toggle | `TogglePlugin` | inherit reads and adapter selectors | complete | React adapter inherits read and keeps store/option-only selectors |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 0. Refresh and Core typing | review scanner + Core | remap 43 rows; prove builder read/update/extension inference | accepted ledger | live row/caller manifest; Core substrate gaps isolated | scanner, Core type tests |
| 1. AI P0 | AI + Core history if required | rows 1-4 | Core typing green | replayable preview and controller/update split fully adopted | AI/Core tests, builds, browser |
| 2. Core P0/P1 | Core | Debug, ElementState, Navigation, View | slice 0 | keyed APIs and navigation semantics adopted | Core check/tests |
| 3. Table P0 | Table | Base/React query split and caller adoption | Core typing green | no document selectors/API queries; warning-free read | table tests/build/browser |
| 4. Feature ownership P1 | package owners | Code Block through Markdown | foundational slices green | root/helper APIs hard-cut and adopted | per-package proof |
| 5. Media/selection P1 | package owners | Placeholder through Suggestion | foundational slices green | final capability splits and callers adopted | per-package proof/browser |
| 6. Remaining P1 + topology | package owners | Tabbable, Tag, TOC, Toggle, constructor folds | foundational slices green | final rows and same-class `.extend()` sweep closed | per-package proof |
| 7. Global adoption/release | packages/apps/content | callers, exports, docs, examples, changesets, barrels | 43 source rows landed | zero stale names and current teaching surfaces | source audits, docs/app checks, `pnpm brl` |
| 8. Closure | all touched owners | declaration builds, tests, Browser, autoreview | adoption complete | zero accepted findings and goal checker pass | exact final gate matrix |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| 43-row denominator | accepted review manifest: 183 total, 43 non-keep | 181/181 live + 2 absorbed; 42 live changes + 1 absorbed = original 43 | complete |
| Capability placement | per-row current/final API/read/selectors/update/extension | compile-only inference, 23 package typechecks, and focused runtime tests | complete |
| No compatibility path | accepted hard-cut doctrine | exact stale helper, specialized `.extend*`, and old portal scans are clean | complete |
| Public adoption | review caller/doc gaps | package, registry, app, docs, examples, and package-integration typecheck pass | complete |
| Runtime behavior | current package test owners | 3,153 main tests + 40 isolated shards/113 tests, focused suites, and five Browser routes pass | complete |
| Publishable typing | prior emitted-declaration inference risk | 23 target package builds: 41/41 tasks | complete |
| Release completeness | package-facing hard cuts | changeset status, 55/55 barrel tasks, docs and app gates pass | complete |

Conditional evidence:
- High-risk scenarios: AI history/preview rollback, navigation timer/anchor
  cleanup, Table active-selection reads and clipboard behavior, adapter
  declaration inference, and stale root API consumers.
- External research: N/A; accepted target and current checkout own the decision.

Execution checkpoints:
- Comment: deterministic snapshot reads and dependent updates landed; package
  typecheck and tests pass.
- DOCX IO: export-only root API replaced by the scoped `DocxIOPlugin` service,
  old helper files removed, barrels regenerated, package typecheck and tests
  pass.
- Footnote: mutable registry and exported editor/tx helpers removed; the
  feature-keyed Base/React owners publish state-derived reads and flat updates;
  barrels, package typecheck, and tests pass.
- Combobox inference owner repaired by narrowing the trigger extension to its
  actual editor read capability. Consumer callback inference passes without
  annotations or casts.
- Indent and Blockquote shortcut constructor folds were tested against emitted
  capability inference. Their shortcuts consume update methods, so a single
  dependent `.extend({ shortcuts })` is the correct exception.
- Link: the old editor-wide transaction group is gone; plugin update owns the
  five link mutations and extension owns only command interception. Package
  typecheck and tests pass.
- The remaining package rows were migrated through their Base owners; React
  adapters inherit the same declarations without duplicate capability bodies.
- Core plugin authoring accepts constructor `api`, `read`, `selectors`,
  `update`, and `extension` with exact declaration inference. `.extend()` is
  retained only when a later contribution consumes an earlier inferred
  capability or when extending an imported declaration.
- Browser QA found a function-proxy introspection bug: transpiled `_typeof`
  reads `.constructor`, which dynamic read/update portals misclassified as an
  extension path. Core and Plite facades now preserve built-in function
  properties through `Reflect.get`; focused regressions and 766 Plite runtime
  contracts pass.
- Autoreview found and repaired a media placeholder timing bug. Paste/drop
  recovery waits for the stored file, while the explicit picker path marks
  recovery handled before starting its single upload.
- Registry block transforms use scoped Callout update and inline list mutation
  logic; no explicit transaction callback annotation or nested plugin update
  remains.
- Issue/PR provenance: N/A; user-directed local API migration.
- Docs/registry/browser/release/behavior-law owners: triggered for current API
  docs/examples, affected standalone demos, package changesets, and behavior
  tests.

Findings:
- The accepted review began with 183 descriptors and 43 non-keep rows. Final
  source has 181 live descriptors plus 2 absorbed review rows: 139 keep, 6 P0,
  33 P1, 2 P2, and 1 P3.
- Forty-three descriptor rows include Base/React mirrors; implementation must
  repair the Base owner once and prove adapter inheritance rather than duplicate
  logic.
- Historical memory contains stale `.extend*` and root Markdown direction; live
  doctrine v12 and the accepted review are authoritative.

Decisions and tradeoffs:
- Hard cuts over aliases: higher adoption cost now, one canonical typed path
  afterward.
- Package-by-package proof over one final root blast: isolates owner/type/runtime
  regressions before they compound.
- Constructor-first colocation over helper preservation: public exports and
  tests do not create a second production owner.
- `api` may orchestrate named updates; it may not contain direct transaction,
  selection, document, or history mutation.

Review fixes:
- `BaseAIPlugin.acceptPreview` cannot truthfully become one tx-bound update:
  accepting a preview intentionally performs two commits so the accepted batch
  remains undoable back to the pre-preview document. Keep multi-commit
  `acceptPreview`, `cancelPreview`, and `undo` as plugin API controllers that
  orchestrate named updates only; move the actual writes into `update`, the
  active-state query into `read`, and preview state from the editor-keyed
  `WeakMap` into a local, history-skipped state field.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Navigation constructor patch had one delimiter error | 1 | Repair the exact constructor boundary, then rerun Core typecheck | fixed |
| Navigation inject hook inferred the descriptor while it was still being defined | 1 | Use the typed key-only self-reference fallback allowed by plugin doctrine | fixed |
| Table first typecheck reported the expected stale package callers plus same-stage read visibility | 1 | Split the presentation read from its dependent update/extension stage and migrate callers mechanically | fixed |
| Debug keyed API was initially declared in the root API generic slot | 1 | Move the contract to `PluginConfig`'s plugin API slot instead of annotating callbacks | fixed |
| View extended the existing `dom` group but Core published the nested object as a union | 1 | Recursively merge nested root API objects and preserve readonly publication at the Core generic owner | fixed |
| AI package typecheck reached a shared Combobox declaration error at `withTriggerCombobox.ts:51` | 1 | Repair dependency witness inference at the builder owner, not consumer callbacks | fixed |
| Browser hit `Editor read group "list" property "constructor" is not installed` | 1 | Preserve built-in function properties in Core/Plite dynamic capability proxies | fixed with regressions |
| Media paste/drop recovery initially skipped a late `currentFile` | 1 | Depend on `currentFile` and keep a one-shot recovery ref | fixed |
| Autoreview then found picker uploads could enter the same recovery effect | 1 | Mark recovery handled before the explicit picker upload | fixed; final autoreview clean |
| Raw root `bun test` loaded Playwright/Vitest/package-cwd suites without their harness | 1 | Use the supported root `bun run test` orchestrator | raw command stopped after deterministic harness failures |
| First supported test run reused stale Bun paths for moved code-drawing files | 1 | Run the four live colocated specs directly, then rerun in a fresh Bun process | 24/24 focused and complete suite green |

Verification evidence:
- Accepted review:
  `docs/plans/artifacts/2026-07-26-plate-next-all-package-plugin-api-review/plugin-api-review.json`
  has 43 non-keep rows and zero missing/extra/duplicate/ambiguous/parse rows at
  source snapshot
  `sha256:a14885d61abb5666f97c331088a4729fbcaacbd76659fb279b3e02ba851157f5`.
- Final validator scanned 1,241 source files and 147 candidates: 185 AST calls,
  181 live rows, 2 absorbed rows, 42 live decision rows, and zero missing,
  extra, duplicate, ambiguous, or parse rows.
- Navigation source split:
  `pnpm turbo typecheck --filter=./packages/core` passed, including capability
  contracts; `pnpm --filter @platejs/core test
  NavigationFeedbackPlugin.spec.tsx` passed.
- Table source and package adoption:
  `pnpm turbo typecheck --filter=./packages/table` passed after all document
  queries moved to `read`, tx-time callers moved to `tx.table`, React
  subscriptions moved to editor selectors over plugin read, and query-backed
  selectors were deleted. `pnpm --filter @platejs/table test` passed.
- Base AI preview source:
  preview state is a local history-skipped state field; reads and writes use
  plugin `read`/`update`; multi-commit accept/cancel/undo remain API
  controllers over named updates. Seventeen focused preview/undo/batch tests
  pass; the shared dependency declaration inference owner is repaired and AI
  typecheck/build pass.
- Debug, Element State, and View:
  Debug and Element State now publish keyed constructor plugin APIs rather than
  manual unkeyed extension APIs; View extends the DOM API as
  `editor.api.dom.getSelectedFragment`. The nested API merge generic now
  recursively merges object groups while retaining readonly publication.
  Core source-first typecheck passes; 29 focused tests across the three owners
  and static editor integration pass.
- Final package proof:
  23 target packages pass source-first typecheck with 49/49 tasks and
  publishable builds with 41/41 tasks. `pnpm brl` passes 55/55 tasks.
- Final runtime proof:
  `bun run test` passes 3,153 tests across 463 shared files, then 40 isolated
  shards containing 113 tests. Plite runtime contracts pass 766/766; Core
  capability facade regressions pass 9/9; schema adoption contracts pass 25/25.
- App/docs proof:
  `pnpm --filter www typecheck` passes MDX generation, docs parity, registry
  source validation, app TypeScript, and package-integration TypeScript.
- Browser proof:
  `/blocks/table-demo`, `/blocks/ai-demo`, `/blocks/playground-demo`,
  `/docs/markdown`, and `/blocks/media-demo` render. Media has zero console
  errors. Playground retains the pre-existing random table-cell-ID hydration
  warning; no capability, accessor, or missing-editor error remains.
- Release and policy proof:
  `pnpm changeset status` passes; schema adoption audits 4,433 files; final
  live-checkout autoreview reports zero findings.
- Specialized plugin authoring scan:
  no `.extendApi`, `.extendEditorApi`, `.extendTx`, `.extendTxGroup`,
  `.extendExtension`, `.extendCodecs`, or `.extendHtmlCodec` remains in live
  package/app/content source. The two `.extendSelectors` matches are Zustand
  store composition, not plugin authoring.

Final handoff prepared:
- Ownership and target API: constructor-first Base owners publish scoped
  `api`, deterministic `read`, option/store `selectors`, tx-bound `update`, and
  lifecycle/editor-wide `extension`.
- Public breaks and adoption: hard cut completed across package exports,
  registry/app callers, docs, tests, and changesets; no compatibility aliases.
- Applicable runtime/package/docs/browser decisions: all triggered lanes pass.
- Proof and execution risks: no open task-owned risk; only the known unrelated
  playground hydration warning remains.
- Execution order and user attention: none; implementation is ready for the
  user’s normal commit/release workflow.

Timeline:
- 2026-07-26T15:26:55.722Z Plate Plan created.
- 2026-07-26: Active one-shot execution goal created after checkpoint-zero
  requirements and the 43-row ledger were materialized.
- 2026-07-26: Fresh review validator reproduced the accepted source snapshot.
- 2026-07-26: Navigation root API was removed; pure target resolution moved to
  selectors, mutations moved to plugin update, and lifecycle-only effects
  remained in the extension. Core typecheck and focused spec pass.
- 2026-07-26: Corrected the AI review target: multi-commit preview acceptance is
  an API controller over named updates, not one nested transaction.
- 2026-07-26: Table Base/React capability split and package callers completed;
  package typecheck and test command pass. Cross-package/docs/browser adoption
  remains in the global slice.
- 2026-07-26: Base AI preview state moved from a WeakMap to a local,
  history-skipped field; focused preview/undo/batch proof passes.
- 2026-07-26: Debug and Element State were hard-cut to keyed constructor plugin
  APIs, View became `editor.api.dom.getSelectedFragment`, and the Core nested
  API merge generic was repaired. Core typecheck and 29 focused tests pass.
- 2026-07-26: All remaining feature rows, callers, docs, exports, release
  artifacts, and Base/React inheritance paths completed.
- 2026-07-26: Browser QA repaired dynamic facade function introspection and
  media placeholder single-upload timing.
- 2026-07-26: Final validator, 23 package type/build gates, 55 barrel tasks,
  www typecheck, 766 Plite runtime contracts, supported full test runner,
  changeset status, schema audit, Browser routes, and autoreview passed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | All 43 accepted rows and their adoption/proof are complete |
| Where am I going? | Final checker and goal closure |
| What is the goal? | Implement and adopt all 43 accepted rows with owner proof |
| What have I learned? | Multi-commit controllers stay API orchestration; active-state queries belong to read/selectors and mutations to update |
| What have I done? | Implemented the full capability hard cut, adopted every caller/docs/export surface, and passed package/app/runtime/browser/review gates |

Open risks:
- No task-owned blocker remains.
- `/blocks/playground-demo` still logs the known pre-existing random table-cell
  ID hydration mismatch; it is unrelated to the capability migration.
- Whole-repo `pnpm lint:fix` reaches unrelated
  `docs/plans/artifacts/multi-editor-full-architecture-audit/**` findings.
  Biome passes over the 400-file changed task scope and the latest owner files.
