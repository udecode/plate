# Finalize v54 Plate AST profile

Objective:
Finalize Plate v54 AST profile; done when Heading, Code, Table, List, and Media
hard cuts plus migration, generated types, docs/doctrine, browser proof, and P2
review pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-17-finalize-v54-plate-ast-profile.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- docs
- package-api
- browser
- agent-native

Mode:
- `standard` accepted-plan execution. The user explicitly accepted every
  recommendation in the completed node-model research artifact and said `go`.

Completion threshold:
- The five accepted schema packets are implemented with no public aliases or
  old persisted spelling in canonical v54 output.
- `migratePlateV54` upgrades the frozen v53 profile directly to the final
  Heading, Code, Table, List, and Media shapes while preserving custom schema
  ownership and named roots.
- Package types, exports, tests, docs, registry kits/examples, generated app
  contracts, changesets/changelog, and agent doctrine teach only the final API.
- Focused package proof, root gates proportional to the changed surface,
  Browser migration/edit proof, agent-native review, P2 autoreview, stale-symbol
  audits, and `check-complete` pass.

Verification surface:
- Basic Nodes, Code Block, Table, List, Media, Plate migrations, Core codec
  consumers, Utils identity catalog, CLI generated contracts, and www
  registry/docs typechecks/tests.
- Direct type/inference proofs for `BaseHeadingPlugin`, `HeadingPlugin`,
  `ElementOf`, generated `Value`, and authored `toggle({ level })`.
- Central v54 migration fixtures for initial/deferred loads, custom schema
  claims, collisions, roots, selection preservation, and canonical no-ops.
- `/dev/document-migration` and the default editor route in Browser with fresh
  console/network checks and an edit after migration.
- Source/mirror parity, changeset status, registry changelog generation,
  barrels, lint, P2 autoreview, and goal checker.

Constraints:
- The completed research artifact is accepted execution authority; no second
  user approval is required.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Keep the Plite base node model unchanged: `{ text }` leaves, typed elements,
  normal `children`, app schema lineage, and MDAST at the Markdown boundary.
- Rewrite v54 in place because this beta profile is not a supported historical
  target. The supported automatic source remains frozen first-party v53.3.6.
- Normalizers/corrections accept only final v54 shapes. Release migration stays
  at the complete-document input boundary and in the shared CLI runner.
- Do not edit CI-controlled `templates/**` or run `build:registry`.

Boundaries:
- In scope: Heading identity/plugin collapse; Code property rename; Table field
  ownership/names; List canonical properties and derived-state removal; Media
  upload/source and intrinsic-dimension cleanup; v54 migration; package exports,
  callers, docs, registry, generated contracts, release metadata, doctrine,
  Browser proof.
- Source owners: `@platejs/basic-nodes`, `@platejs/code-block`,
  `@platejs/table`, `@platejs/list`, `@platejs/media`, `@platejs/utils`,
  `platejs/migrations`, Core codec/plugin consumers, app-owned registry kits,
  docs, and `.agents/rules`/Vision doctrine.
- Non-goals: UNIST-native text leaves, changing Plite transactions/selections,
  new format adapters, list-classic parity, migration plugins, aliases, v54-to-
  final compatibility, template output, or release/push/PR work.
- Direct Plite boundary owners: no Plite runtime/API change. Existing validated
  `property.json`, content grammar, schema fitting, and document envelope are
  consumed unchanged.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Block only if a selected final shape cannot preserve existing first-party v53
  semantics without a new Plite primitive, or if the Browser cannot run after
  all repo-local server/install recovery paths are exhausted.

Plate Plan state:
- status: done
- phase: complete
- next: none
- handoff: implementation and proof complete

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | `ok to all. go` accepts every hard cut and the formal Plate-native model/spec recommendation. |
| Active goal and plan verified | yes | New one-shot execution goal names this exact plan and binary threshold. |
| Current owners read | yes | Research artifact plus live Heading, Code, Table, List, Media, migration, generated contract, Vision, and doctrine owners were read. |
| Best API target resolved | yes | Keep Plite base; rearchitect Heading/List/Table; rename Code; clean Media; publish final Plate model; no aliases. |
| Mode and execution boundary resolved | yes | Accepted research artifact authorizes standard one-shot execution. |
| Docs pack selected | yes | Public plugin/reference/migration/model docs and EN/CN teaching change. |
| `docs-creator` loaded | yes | Loaded before any docs edits. |
| Docs lane selected | yes | Existing plugin pages plus one cross-package document-model concept owner. |
| Target docs and nearest sibling docs read | yes | Current Markdown, migration, Heading, Code Block, Table, List, Media, and schema teaching are source targets; exact reads happen before each docs edit. |
| Docs style doctrine read | yes | Current-state reference voice, source ownership, real imports, nav/routes, and parser proof were applied and verified. |
| Documented source owner identified | yes | Feature schemas and `platejs/migrations` own claims; docs never choose shape. |
| Package/API pack selected | yes | Seven published package surfaces and generated exports/types change. |
| Public surface or package boundary identified | yes | Basic Nodes, Code Block, Table, List, Media, Utils, Plate migration, and umbrella reexports. |
| Release artifact path selected | yes | Main-relative package changesets plus one registry changelog source event. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded; one package per file, main-relative user impact, majors for breaking packages. |
| Barrel/export impact decision recorded | yes | Heading exports/files and Utils identities change; run `pnpm brl`. |
| Browser pack selected | yes | Registry components, kits, persisted fixtures, rendering, shortcuts, editing, and migration route change. |
| Browser route / app surface identified | yes | `/dev/document-migration` plus `/blocks/editor-default-demo` when available. |
| Browser tool decision recorded | yes | In-app Browser; native Chrome/Computer proof is N/A. |
| Console/network caveat policy recorded | yes | New schema/migration/render errors block completion; unrelated warnings remain exact caveats. |
| Observable browser case captured | no | N/A: architecture migration, not report-backed behavior; route/setup/outcome are named above. |
| Agent-native pack selected | yes | Best API and worker doctrine currently teaches rejected distinct headings and stale fields. |
| Agent-facing action surface identified | yes | Plugin authoring, AST design, migration selection, docs, generation, and verification routes. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**` and Vision source; regenerate with `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded before final doctrine review. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source and the completed research artifact.
- [x] Reusable public call shape has one accepted `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers; no bridge exists.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Heading slice: one descriptor/type/level, authored toggle, codecs, shortcuts, components, callers, migration, and zero h1-h6 capability identities.
- [x] Code slice: `language` canonical everywhere, MDAST-only `lang`, migration/collision proof, and zero persisted `lang` teaching.
- [x] Table slice: semantic fields, single column-width owner, import/migration normalization, full behavior proof, and zero old property names.
- [x] List slice: semantic type/style/start/check fields, no persisted restart policy or derived ordinals, codec/behavior/migration proof, and zero old property names.
- [x] Media slice: semantic upload source, intrinsic dimensions, direct captions, migration/registry/docs proof, and zero `isUpload`/`initial*` canonical fields.
- [x] Migration/generated/docs slice: final v54 profile, generated Editor contract, public model spec, docs/registry adoption, and Browser proof.
- [x] Doctrine/release/review slice: best-api repair, worker/Vision sync, changesets/changelog, mirror generation, agent-native review, P2 autoreview, and final gates.
- [x] Docs pack: affected lanes, sibling pages, source owners, links/routes, and current-state examples are verified.
- [x] Package/API pack: changesets, package proof, artifacts, and barrels are complete.
- [x] Browser pack: fresh final routes, visible outcome, edit, console/network, and local-candidate caveat are recorded.
- [x] Agent-native pack: source rules, generated mirrors, discoverability, and review findings are closed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | All seven slices and every selected pack are complete. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final schema, generator, docs, migration, package, Browser, and stale-name evidence recorded below. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Accepted hard cuts implemented; final focused P2 passes report no actionable P0-P2 finding. |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Table/List/DOCX/migration edge cases, docs, registry, Browser, changesets, and doctrine closed. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Exact commands, counts, Browser observations, and caveat are recorded below. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff names the model, migration, proof, and one pre-existing docs-route caveat. |
| P2 autoreview | yes | Run with `--max-priority P2` for implementation changes; P3 is opt-in only, or record planning-only N/A | Full owner bundle clean; post-regression DOCX-only bundle clean at P2. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-finalize-v54-plate-ast-profile.md` | Run after this update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Owners, accepted research, constraints, and seven slices captured. | Decide |
| Decide | completed | Final Plate-native profile and migration contract locked without aliases. | Prove and hand off |
| Prove and hand off | completed | Package/app/full suites, Browser, generator, stale scans, doctrine, and P2 review passed. | User review |

Decision brief:
- outcome: one final Plate v54 application profile with semantic first-party
  nodes/properties, automatic v53 migration, exact generated types, and explicit
  format adapters.
- chosen shape: keep Plite `{ text }` leaves and `{ type, children }` elements;
  use `heading.level`, `codeBlock.language`, semantic Table fields, flat semantic
  List fields with only explicit start boundaries, Media `provider: "file"`
  plus intrinsic dimensions, document-level schema lineage, and MDAST codecs.
- strongest rejected alternative: preserve the current v54 names and merely
  document their MDAST mappings. That keeps six false Heading capabilities,
  ambiguous Table state, runtime policy in List JSON, and upload history in
  Media JSON after the beta hard-cut opportunity.
- consequence: broad public break across packages, registry, docs, generated
  types, fixtures, migration, and doctrine; no compatibility names survive.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Plite base node contract | Element `type/children`, Text `text`, schema compiler, document envelope | Keep unchanged | Plite | Live-editor DX and invariants beat UNIST-native leaf noise | No source change | Existing Plite/schema tests and zero-diff audit | Accidental substrate scope creep | keep |
| Heading | Six `h1`…`h6` persisted types, Base/React descriptors, codecs, components, shortcuts | One `heading` type/descriptor with required `level: 1..6`; authored `toggle({ level })`; dynamic render tag | Basic Nodes + registry | Rank is a parameter, not six capabilities; deletes duplicated public ontology | Utils identity, packages, Core consumers, registry/static/DOCX, docs/examples, migration | Inference/type tests, HTML/MDAST round trips, shortcuts/input rules, migration, Browser | Dynamic tag and toggle-off semantics | rearchitect |
| Code Block language | Persisted `lang` | Persisted `language`; external MDAST alone uses `lang` | Code Block | Human/agent domain spelling and existing implementation vocabulary converge on `language` | Package source/tests, registry/components/values, docs, migration | Type/schema, highlighting, HTML/MDAST, static/live, stale scan | Codec accidentally emits Plate `language` into MDAST | rename |
| Table dimensions/color | `colSizes`, `background`, row/cell/border `size`; duplicate cell and table width sources | `columnWidths`, `backgroundColor`, row `height`, border `width`; imported/migrated cell widths normalize into table column widths; no cell size | Table | Every field states one semantic meaning and table owns column widths once | Schema, codecs, runtime, hooks, tests/fixtures, registry, docs, migration | Schema/HTML/clipboard/mutation/merge/resize/generated types/Browser | Width loss for colSpan/HTML imports; massive behavior surface | rearchitect |
| Lists | `listStyleType`, derived `listStart` on items, `listRestart`, persisted `listRestartPolite`, `checked`, `indent` | Flat `listType`, optional `listStyle`, explicit-boundary `listStart`, `checked`, `indent`; no persisted policy/derived ordinals | List | Keeps flat editor model while separating kind/marker and removing runtime policy from JSON | Package APIs, codecs, input rules, docs, registry fixtures, migration | Toggle/indent/outdent/restart/HTML/MDAST/collab-oriented no-churn tests and Browser | Numbering/restart behavior regression | rearchitect |
| Media | `isUpload`, `initialWidth`, `initialHeight`; captions in children | Keep captions; video/file source uses semantic existing `provider: "file"`; image `intrinsicWidth`/`intrinsicHeight`; no upload-history field | Media + registry upload owner | Rendering semantics survive without persisting workflow history; intrinsic names state durable meaning | Package schema/codecs/tests, upload replacement, video renderer, Markdown/values/docs, migration | HTML round trip, upload flow, video render, generated types, migration, Browser | Uploaded video dispatch or dimension fidelity loss | rearchitect |
| v54 migration | Current profile migrates v53 identities, scripts, captions, table headers/align only | Frozen v53 directly upgrades every accepted final shape with collision/custom-schema/root/selection proof | Plate migrations | One target profile and one runtime/CLI runner remain authoritative | Manifest classifications, central tests, migration demo/generated fingerprints | 53->54 fixtures, custom claims, collisions, runtime/CLI parity, schema assertion | Lossy transform or same-version fingerprint drift | rearchitect |
| Generated/application contract | 37 element variants, 24 roots, six headings and old fields | Exact final union with one Heading and semantic properties; EditorSchema remains v54 | CLI generator + www app | Static boundary must reflect the actual compiled schema | Regenerate committed contract and every imported alias | `plate generate --check`, www typecheck, schema fingerprint, Browser | Generator/source mismatch | rearchitect |
| Public specification/docs | Docs teach current package-specific shapes; no concise Plate model spec | Public document-model concept page plus updated feature, Markdown, migration, API, EN/CN docs | Docs | State intentional Slate/ProseMirror/UNIST/MDAST relationships without false conformance | Nav/inbound links and all affected examples/imports | Docs source build/check, links/routes, source scan | Changelog voice or stale legacy examples | rearchitect |
| Doctrine and agent routes | Best API/plugin creator/Plate Next require distinct h1-h6 and omit final semantic field law | One parameter-vs-capability law, final Plate profile examples, migration/proof routes | best-api + Vision + workers | Accepted correction must outlive this task | Source rules, relevant Vision, workers, generated mirrors | `pnpm install`, stale teaching audit, agent-native review | Editing generated mirrors or overgeneralizing product fields | rearchitect |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Heading | Basic Nodes + Utils + Core consumers | One Base/React Heading, level schema, authored toggle, dynamic render, codecs/rules, export/caller hard cut | Plan locked | Zero h1-h6 capability/API identities outside v53 migration inputs | Package tests/typecheck/build, Core type consumers, codecs, stale audit |
| 2. Code | Code Block | Rename canonical property and all consumers; preserve external MDAST field | Heading green | Zero persisted `.lang` callers/docs outside migration/external node access | Package tests/typecheck, HTML/MDAST/static/live proofs |
| 3. Table | Table | Rename semantic fields, remove cell width state, normalize imports, update all runtime/tests | Code green | One column-width owner; zero old canonical Table fields | Full Table test/typecheck plus focused HTML/resize/merge/clipboard/mutation |
| 4. List | List | Introduce semantic list type/style/start, remove restart policy/derived persistence, update complete owner | Table green | Canonical list JSON contains only semantic flat fields | Full List tests/typecheck plus numbered/task/HTML/MDAST/input/browser proof |
| 5. Media | Media + registry upload/video | Replace upload history with provider semantics; rename intrinsic dimensions; update codecs/components/fixtures | List green | Zero canonical `isUpload` or `initial*` fields | Media tests/typecheck, registry tests, HTML/upload/video/browser proof |
| 6. Migration and app adoption | Plate migrations + CLI generator + www | Extend frozen manifest/transform/tests, update migration demo, registry kits/components/values, regenerate schema | All feature schemas green | v53 fixture migrates to final v54 and generated app contract matches | Plate/Core/CLI tests, migration counts, generator check, www typecheck, Browser |
| 7. Docs/release/doctrine/closure | Docs + changesets + registry changelog + agent owners | Public model/spec and feature docs, changesets, changelog, rule/Vision repair, mirrors, barrels/lint/review | Product source stable | Zero stale public/doctrine names and every closeout gate passes | Docs checks, changeset status, changelog check, pnpm install/brl/lint, agent-native, P2 autoreview, checker |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Heading is one exact inferred capability | External convergence and six duplicate local owners | Direct descriptor/type tests, generated union, toggle/codec tests, and Browser h2 render | passed |
| Code `language` is canonical without Markdown regression | External/source vocabulary audit | Code/Markdown/HTML tests, TypeScript label in Browser, and stale scan | passed |
| Table semantic names preserve all behavior and data | Codec/runtime source map shows old meanings | 239 Table tests, logical span/row-group imports, migration fixtures, and Browser dimensions | passed |
| Lists preserve numbering/tasks while removing derived/policy JSON | Complete List owner and external flat-list evidence | 32 fast List tests, 5 slow owner tests, DOCX/Markdown tests, migration, and Browser numbering | passed |
| Media keeps upload/render semantics without workflow fields | Usage audit identifies video dispatch and HTML roundtrip | 76 Media tests, migration, generated types, image/video Browser proof | passed |
| v53 migration is lossless inside frozen scope | Existing complete v53 manifest and central suite | 45 centralized tests cover profile, roots, custom claims, traversal, collisions, and canonical no-ops | passed |
| Generated/app/docs contract matches runtime | Current generator and registry source owners | Generator `--check`, www typecheck, docs/registry source checks, and zero generated legacy names | passed |
| Doctrine/release/proof are complete | Accepted research and automatic best-api repair law | Changesets/changelog, `pnpm install`, mirror scan, agent-native map, P2 clean, and checker | passed |

Conditional evidence:
- High-risk scenarios:
  1. Required Heading/List fields are missing between type change and commit,
     causing schema fitting to replace or reject nodes.
  2. Removing derived List ordinals changes ordered-list starts/restarts or
     creates collaboration churn through corrections.
  3. Table cell widths or merged-column widths are lost when normalized into
     one table-level array.
  4. Uploaded videos render as embeds after removing `isUpload`, or HTML image
     intrinsic dimensions stop round-tripping.
  5. Custom schemas that legitimately own legacy-looking keys/types are
     reinterpreted by the release migration.
  6. Current beta v54 envelopes fingerprint-drift and fail closed; this is an
     intentional unsupported beta hard cut, not a same-version migration path.
- External research: completed 17-family standards/proposal taxonomy and
  source-level node model comparison; accepted findings are materialized here.
- Issue/PR provenance: N/A: direct user architecture decision, no public issue.
- Docs/registry/browser/release/behavior-law owners: all apply and are assigned
  to slices 6-7; list-classic and native browser/device proof remain excluded.

Findings:
- The Plite base remains correct and requires no source change.
- Heading needs a validated numeric `level`; existing `property.json` with a
  type predicate provides exact schema inference without a new Plite API.
- `render.nodeProps` can derive the intrinsic/static tag from `element.level`,
  avoiding a React-only base component.
- Heading shortcuts require app-owned custom handlers because one semantic
  `toggle` accepts a level argument; input rules can resolve one `#{1,6}` match.
- Table cell `size` is codec-only while table `colSizes` is the active runtime
  width owner, so import normalization can delete duplicate cell width state.
- Media `isUpload` has one legitimate downstream meaning: force uploaded video
  file rendering. Existing `provider` can encode `"file"` semantically.
- List is the largest algorithmic risk and must be completed as one owner-wide
  slice rather than an alias-backed mechanical rename.

Decisions and tradeoffs:
- Required Heading level over omitted default: canonical identity is incomplete
  without rank; construction/toggle supplies it explicitly.
- `level` over MDAST `depth` and Lexical `tag`: editor/domain vocabulary wins;
  codecs own external tags/depth.
- Existing validated `property.json` over a speculative numeric-enum Plite API:
  one exact user job does not earn a new substrate builder.
- Flat List semantic fields over nested `list` object: independent property
  operations and collaboration diffs remain granular.
- Existing `provider: "file"` over a new media source property: the semantic
  owner already exists on provider-capable media and avoids another channel.
- Rewrite v54 in place over v55: frozen supported source is v53 main; current
  beta v54 is not a supported historical envelope.
- No aliases, deprecations, fallback readers, legacy normalizers, or duplicate
  documentation survive.

Review fixes:
- P2 review drove owner fixes for omitted root indents, default marker
  equivalence, multi-item HTML continuations, standalone list fragments,
  cross-container v53 traversal, schema-owned cell size, nested border width,
  row/column spans and row groups, Word list declarations/identities/compound
  markers/structural boundaries, and zero-valued v53 restart semantics.
- Final full owner bundle review reported no actionable P0-P2 finding.
- The post-suite DOCX correction received a separate focused P2 review and
  reported no actionable P0-P2 finding.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Generated editor artifacts stale after final List lifecycle change | 1 | Regenerate from app source, then rerun `--check` and www typecheck | Resolved; both generated files and app gates pass. |
| First www package-integration typecheck observed an outdated Plite property name | 1 | Re-read current source and rerun instead of editing unrelated work | Transient current-tree mismatch; clean rerun passed. |
| First fast-suite run hit an unrelated in-progress PlateContent DOM-sync test | 1 | Rerun final current tree after the concurrent source settled | Final run passed 3,124 tests. |
| First slow-suite run exposed redundant DOCX `listStart: 1` fields | 1 | Model the runtime-expected ordinal and parse the actual Word marker span | Resolved; exact fixtures and final slow suite pass. |

Verification evidence:
- Package/type proof: final focused typechecks and suites pass for Basic Nodes,
  Code Block, Table (239 tests), List (32 fast plus 5 slow), Media, Markdown
  (193 tests), DOCX Paste (26 tests), and Plate migration (45 tests).
- Root/app proof: `pnpm typecheck` passed all 60 package tasks after 60 package
  builds; `pnpm --filter www typecheck` passed generator, API reference, docs
  source parity, registry source, app TypeScript, and package-integration
  TypeScript checks.
- Regression proof: `bun run test` passed 3,124 tests with 15 snapshots and
  zero failures. `pnpm test:slow` passed 1,519 tests with 60 intentional skips,
  4 snapshots, and zero failures. The final DOCX-only changes then passed all
  26 package tests and both affected slow fixtures.
- Generation/release proof: `pnpm brl`, generated editor `--check`, registry
  changelog generation `--check` across 65 entries, and final lint pass.
- Fresh Browser proof at `http://localhost:3000/dev/document-migration`: one semantic
  h2, TypeScript code label, ordered items 4 and 5, table widths 180/220, row
  height 48, header color `#fef3c7`, image/video sources, a live ` runtime`
  edit plus a final ` runtime-final` edit, and no browser errors. The docs runtime route is blocked by pre-existing
  missing copied-registry modules in generated `__registry__`; docs source,
  parity, and TypeScript checks pass independently.
- Stale-name proof: no Heading capability aliases or old persisted List/Table/
  Media names remain outside frozen migration/demo/history inputs. Remaining
  `style.listStyleType` hits are CSS DOM properties. Generated editor artifacts
  contain zero legacy names.
- Agent-native capability map: API choice routes through Best API and Plate
  Plan to package owners; document upgrades route through the shared
  `defineDocumentMigrations`/`migrateDocument` runtime and CLI; application
  contracts route through `plate generate`; docs and registry events retain
  source owners; `.agents/rules` regenerate to mirrors with `pnpm install`.
  No P1/P2 discoverability, parity, or cloud-only gap remains.

Final handoff prepared:
- Ownership and target API: Plite base stays; five Plate feature schemas and one
  v54 migration profile own the accepted semantic shapes.
- Public breaks and adoption: six Heading descriptors/types, old Code/Table/
  List/Media fields, all callers/exports/docs/generated types are hard-cut.
- Applicable runtime/package/docs/browser decisions: seven slices cover package
  behavior, migration, app generation, docs/spec, Browser, release, doctrine.
- Proof and execution risks: all six scenarios and eight proof claims closed;
  List, Table, Migration, and DOCX received owner and aggregate suites.
- Execution order and user attention: slices 1-7 are complete. No design or
  implementation choice remains for the user.

Timeline:
- 2026-08-17T15:18:50.238Z Plate Plan created.
- 2026-08-17T22:10:13+02:00 implementation, proof, and review completed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Complete; all seven slices and selected packs passed. |
| Where am I going? | Final user handoff; no implementation step remains. |
| What is the goal? | Finalize the complete Plate v54 AST profile with no stale API or compatibility path. |
| What have I learned? | Base stays; feature schemas own all accepted changes; List is the dominant runtime risk. |
| What have I done? | Hard-cut the five schemas, completed v53 migration/app/docs/doctrine adoption, and passed final proof. |

Open risks:
- The docs runtime route remains unavailable until unrelated generated
  `__registry__` imports for missing copied-registry legacy files are repaired;
  source/parity/type checks are green and the migration product route is proven.
- Existing unrelated checkout work remains preserved and outside this plan.
