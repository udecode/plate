# migrate registry to flat editor feature ownership

Objective:
Hard-cut the copied Plate registry to one flat `components/editor` product
namespace, feature-named registry items/files, stable registry `FooKit`
composition values, and install-time Radix/Base/Aria variants.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-17-migrate-registry-to-flat-editor-feature-ownership.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- docs
- browser
- agent-native

Mode:
- `standard`; the target was accepted interactively and the latest request is
  explicit execution authority.

Completion threshold:
- Every modern copied Plate UI/kit source installs under a flat
  `@components/editor/*` target with no `components/ui` Plate target and no
  `components/editor/plugins` target; feature entry files/items have no
  `-kit` suffix while registry composition exports retain `FooKit`, including
  one-descriptor features; all imports/callers/docs/examples/metadata/checkers
  adopt the hard cut; Toolbar resolves complete Radix, Base, and Aria
  implementations to the same installed path; focused registry, www, docs,
  variant, browser, lint, doctrine, and final plan checks pass or record one
  exact external/generated-output blocker.

Verification surface:
- Source manifests and stale-path/name scans; registry source/install-closure
  checks; registry metadata and changelog checks; www source-first typecheck
  and focused specs; three isolated shadcn install/type/browser fixtures for
  Toolbar; docs source/parser checks; `pnpm lint:fix`; `pnpm install` plus
  source/generated skill parity; P2 autoreview; final autogoal checker.

Constraints:
- The user accepted the target across the immediately preceding design turns
  and explicitly said `go complete the cut migration`; execution is authorized.
- No public compatibility aliases or runtime shims.
- Do not manually edit CI-owned `apps/www/src/__registry__/**` or templates.
- Preserve package-level semantic owners and package public APIs unless a
  source move exposes a real owner defect requiring a separate recorded row.
- `components/ui` remains exclusively the selected shadcn primitive layer.
- One top-level `components/editor` folder; no nested `plugins`, `kits`,
  `nodes`, `hooks`, or feature folders.
- `Kit` is an exported registry composition value, never the feature filename,
  registry item name, or directory name.
- Do not remove one-descriptor registry kits: they are stable app-owned feature
  composition boundaries whose membership may grow.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.

Boundaries:
- In scope: `apps/www/src/registry/ui`, modern
  `apps/www/src/registry/components/editor/plugins`, editor composition files,
  registry metadata/routing/checkers, all production callers, EN/CN current
  docs, registry changelog, tests, and affected source doctrine.
- Source owners: `apps/www/src/registry`, `.agents/rules/plate-ui.mdc`,
  `.agents/rules/best-api.mdc`, `docs/vision/plate.md`, and current docs pages.
- Non-goals: package semantic redesign, Plite changes, classic feature polish,
  template edits, compatibility reexports, commits, pushes, and PR creation.
- Direct Plite boundary owners: N/A; this is copied Plate UI and registry
  distribution topology. Plite runtime behavior must remain unchanged.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Block only if shadcn cannot express one target across its three bases without
  a runtime compatibility API, or current shared-tree source prevents a safe
  owner move after all import/registry alternatives are exhausted. CI-owned
  generated registry staleness may narrow browser proof but does not authorize
  editing generated output.

Plate Plan state:
- status: complete
- phase: prove and hand off
- next: user review
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | objective, threshold, constraints, boundaries, variants, hard-cut adoption, proof, and non-goals above |
| Active goal and plan verified | yes | active goal names this plan and complete migration threshold |
| Current owners read | yes | 118 production UI files, 68 kit files, registry metadata/routing, link/media/editor/toolbar owners and callers |
| Best API target resolved | yes | interactive `best-api` review accepted one flat editor namespace, feature filenames, stable registry kits, and install-time variants |
| Mode and execution boundary resolved | yes | standard one-shot execution; explicit `go complete the cut migration` |
| Docs pack selected | yes | public registry import/install shape changes |
| `docs-creator` loaded | yes | current-state docs and registry installation rules applied |
| Docs lane selected | yes | current-state registry installation, feature-kit, plugin, and component references |
| Target docs and nearest sibling docs read | yes | feature-kits, RSC EN/CN, link/comment/component pages and source owners audited |
| Docs style doctrine read | yes | docs-creator current-state voice and source-backed examples applied |
| Documented source owner identified | yes | copied registry source and metadata, not package docs or generated registry output |
| Browser pack selected | yes | interactive editor and Toolbar behavior change distribution |
| Browser route / app surface identified | yes | `/blocks/editor-basic`, `/blocks/editor-ai`, and isolated Radix/Base/Aria Toolbar fixtures |
| Browser tool decision recorded | yes | in-app Browser for normal app/fixture proof |
| Console/network caveat policy recorded | yes | separate generated-index compile blockers from changed runtime behavior; make no browser-success claim when blocked |
| Agent-native pack selected | yes | durable file/kit/variant doctrine changes |
| Agent-facing action surface identified | yes | creating/moving copied registry features and deciding kit/variant ownership |
| Source rule versus generated mirror boundary identified | yes | edit `.agents/rules/**`, regenerate via `pnpm install`, never edit generated `SKILL.md` |
| `agent-native-reviewer` loaded or waiver recorded | yes | action/source/mirror/command/proof parity audited after regeneration |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | pass | Resolve every readiness condition | all implementation-owned gates pass |
| Fresh source evidence | pass | Recheck decision-changing current claims | final stale scans, metadata tests, typecheck and Browser proof rerun |
| Best API review | pass | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | accepted flat-feature/stable-kit/install-time-variant law implemented |
| Conditional risk and adoption | pass | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | imports, docs, registry metadata, checker, changelog and variants adopted |
| Verification recorded | pass | Record fresh planning proof and exact execution gates | receipts below |
| Handoff prepared | pass | Prepare concise ownership, breaks, proof, risks, and execution order | final handoff below |
| P2 autoreview | blocked | Run with `--max-priority P2` for implementation changes; P3 is opt-in only, or record planning-only N/A | helper failed closed before review because unrelated reviewed changes contain TruffleHog verified/unknown credentials; source diff was manually audited and all scoped gates pass |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-migrate-registry-to-flat-editor-feature-ownership.md` | final command pending this edit |
| Docs source-backed claim audit | pass | Verify docs claims against current source or record N/A | current imports/items match registry source and `check:docs` passes |
| Docs links / routes / previews | pass | Verify leaf links, routes, anchors, and preview names or record N/A | docs parity checker passes; merged link/comment item references audited |
| Docs MDX/content parser | pass | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | included in green www typecheck |
| Plugin page specifics | pass | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | feature-kit and affected component/plugin examples use final item/file/import names |
| Browser interaction proof | pass | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Radix/Base/Aria fixtures each render one Formatting toolbar; Bold toggles and ArrowRight focuses Italic |
| Browser console/network check | pass | Record console/network state or why it is not applicable | zero warning/error logs; only React DevTools info and an irrelevant favicon 404 |
| Browser final proof artifact | pass | Record screenshot/trace/route/native proof or exact caveat | final Browser DOM/interaction/log receipt recorded below |
| Agent source / generated sync | pass | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | install regenerated mirrors; Plate Next v94 validates |
| Agent action discoverability | pass | Source-audit the skill/rule path an agent will read | exact law found in best-api, plate-ui and plate-next source plus mirrors |
| Agent-native review | pass | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | action, context, execution and proof parity all have named routes and local commands |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | owners, source inventory and accepted target recorded | Decide |
| Decide | complete | flat namespace, naming, kit, static and variant laws locked | Prove and hand off |
| Prove and hand off | complete | source/docs/metadata/doctrine/type/browser gates recorded | User review |

Decision brief:
- outcome: copied Plate source reads and installs as one coherent editor
  product instead of separate UI artifact and plugin-kit taxonomies.
- chosen shape: flat `components/editor`; feature-named entry files/items;
  `FooKit` exports as stable app-owned tuples even at one member; separate
  `*-static` files only for the server boundary; install-time Toolbar variants.
- strongest rejected alternative: `components/plate` beside
  `components/editor`, nested feature folders, or `*-kit` files/items. Each
  forces users and agents to classify implementation kinds instead of finding
  the feature owner.
- consequence: broad breaking copied-source import/registry-item migration;
  no package runtime compatibility burden.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Installed namespace | Plate UI lands in `components/ui`; kits land in `components/editor/plugins` | every copied Plate feature lands flat in `components/editor` | registry routing + metadata | `ui` is the shadcn primitive owner; split install roots hide feature ownership | move source/targets/imports/checkers/docs | zero stale Plate UI/plugin target scans; install closure | very broad import churn | move |
| Feature item/file names | artifacts named `link-node`, `link-toolbar`, `link-kit`, etc. | feature entry item/file is `link`; subordinate independently installable main components use feature-prefixed names | registry item owner | installation is by feature, not implementation artifact | collapse metadata/dependencies/docs; retain separate files only for real independent main components | registry item uniqueness and dependency closure | accidental over-bundling | rearchitect |
| Registry kit values | mixed single/multi tuples in `*-kit` files | every plugin-array feature exposes one stable `FooKit`; membership count is hidden app policy | feature entry file | uniform composition and stable future membership are current app jobs | preserve/rename imports; no `FooPlugins` alias | typed EditorKit/examples across all kits | duplicate public descriptor path if uncontrolled | keep |
| Feature descriptors | configured UI descriptor often exported from toolbar/node file | colocate final configured descriptor with feature entry; export separately only for scoped consumers | feature entry | descriptor and copied UI policy are one owner | move callers such as transforms/floating toolbar | scoped portal tests | cycles after coalescing | move |
| Static boundary | separate `*-base-kit` items/files and `*-static` renderers | `feature-static` owns static renderer plus `BaseFooKit`; no client imports | static feature entry | server boundary is real; kit taxonomy is not | move BaseEditorKit imports and registry deps | RSC import/source audit and typecheck | accidental client edge | rearchitect |
| Editor root | UI editor, EditorKit, BaseEditorKit, block PlateEditor, generated artifacts appear as one undifferentiated group | `editor.tsx` presentation, `editor-static.tsx` presentation, `plugins.ts` live composition, `plugins-static.ts` static composition; block-owned `plate-editor.tsx` remains block-only; generated artifacts optional | editor app owner | avoids real client/server and composition cycles without taxonomy folders | rename current files/imports/generator references | source graph/typecheck | generated contract path drift | rename |
| Toolbar variants | one Radix-specific file and direct Radix/asChild leaks in consumers | stable editor Toolbar family with complete Radix/Base/Aria implementations selected at registry resolution and written to one target | toolbar registry owner | each primitive owns accessibility/focus semantics; runtime branching is dishonest | eliminate direct primitive leaks where stable Toolbar/shadcn owners can express them; variant remaining true differences | three install/type/browser matrices | cross-base prop/behavior drift | rearchitect |
| Classic registry | same old taxonomy | relocate only as required for install closure; no new variants/API/polish | classic maintenance owner | topology compilation may require path adoption but doctrine forbids investment | mechanical import/target moves only | source/typecheck | accidental modernization | gate |
| Doctrine | terminal ownership covered, destination/item/kit/variant law incomplete | add exact accepted laws to best-api, plate-ui, Plate vision and dependent auditors only | source rules + Vision | future migrations must not repeat the taxonomy | regenerate mirrors and stale-scan | source/mirror parity + agent-native review | over-copying doctrine | repair |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Manifest and compiler contract | registry metadata/routing | full modern source/item/import/target inventory; base resolver and target law | accepted decisions above | every current row classified and new naming map collision-free | counted manifest and mapping audit |
| 2. Shared editor roots | editor + toolbar | move editor presentation/composition and implement 3 Toolbar variants | slice 1 | shared roots compile under all three bases | focused type and Toolbar behavior tests |
| 3. Feature families | copied registry features | coalesce/move modern families, descriptors, kits and static owners flat | slice 2 | no modern UI/plugin taxonomy source remains | caller/import/stale scans + focused specs |
| 4. Registry adoption | registry metadata/checkers | collapse/rename items, dependencies, targets, examples and install closure | slice 3 | every public item resolves to flat editor targets | registry source/check/changelog gates |
| 5. Public teaching and doctrine | docs + rules + Vision | update EN/CN imports/install model and durable agent law | slice 4 | zero stale current-state examples and source/mirror parity | docs checks, `pnpm install`, agent-native review |
| 6. Runtime closure | www/browser/review | lint, typecheck, focused/full tests, three fixture installs, browser and P2 review | slices 1-5 | all named gates green or one exact external blocker recorded | command/browser/review receipts + final checker |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| one flat installed editor namespace | current target mapper/test splits UI and editor/plugins | zero stale target/import scans and 10/10 registry tests | pass |
| stable kits without kit filenames | 68 current kit files and uniform EditorKit spreads | feature entry exports compile; no `*-kit` source/item names in modern registry | pass |
| static remains server-safe | current Base kits and static renderers are separate | static composition, RSC imports and full www typecheck pass | pass |
| Toolbar supports Radix/Base/Aria | all three upstream primitives own Toolbar with different composition grammars | all three type/bundle and Browser keyboard rows pass | pass |
| public docs teach only new shape | current link/media/feature-kit docs teach old paths | docs stale scan + source/parser checks pass | pass |
| agents reproduce the law | current rules lack exact namespace/item/variant rules | generated mirror parity, v90 family-colocation law, v92 semantic/static law, v94 zero-node exception closure | pass |

Conditional evidence:
- High-risk scenarios: (1) moved feature creates a runtime import cycle; (2)
  static composition gains a client edge; (3) Base/Aria Toolbar silently loses
  roving focus, toggle, menu, tooltip, or RTL behavior; (4) collapsed registry
  items over-install heavyweight optional dependencies; (5) generated contract
  discovery follows a stale path.
- External research: local `../shadcn` and `../ai-elements` plus official
  Radix/Base/React Aria Toolbar docs already settled the variant contract.
- Issue/PR provenance: N/A; direct user-authorized current-tree migration.
- Docs/registry/browser/release/behavior-law owners: docs, registry metadata and
  changelog, three variant browser proof, and agent doctrine all apply; package
  changesets are N/A unless package source unexpectedly changes.

Findings:
- Current topology has 118 production registry UI files and 68 production kit
  files. Link alone spans six production files and five public registry items.
- Only 15 production registry files directly import Radix, while 29 use
  `asChild`; most feature source can remain base-neutral behind stable editor
  and shadcn component owners.
- `plate-editor.tsx` is block-owned application composition, not a reusable
  editor-family peer. It must remain block-only even though its install target
  sits in `components/editor`.
- `comment.tsx` consumes the Editor presentation while EditorKit consumes the
  Comment feature, proving presentation and application plugin composition
  cannot safely merge.

Decisions and tradeoffs:
- Prefer one flat product namespace over separate brand/UI/plugin taxonomies.
- Preserve stable registry kits, including one-descriptor kits, because they
  own complete app feature membership. Package roots still cannot export kits.
- Name files/items for features and values for composition: `link.tsx` exports
  `LinkKit`; never `link-kit.tsx` or `@plate/link-kit`.
- Duplicate complete primitive-specific Toolbar implementations rather than
  ship runtime base branching or a consumer-visible variant helper. Extract
  only stable editor components with multiple real feature consumers.
- Preserve real live/static and presentation/composition boundaries even
  inside the single folder.

Review fixes:
- Restored the turn-into radio-selection contract at its actual dropdown owner;
  Toolbar variants remain base-neutral presentation owners.
- Repaired moved toolbar registry tests to resolve flat registry paths.
- Added Bun-native test assertions so moved component specs remain part of the
  www TypeScript program without matcher-only ambient types.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Shell word splitting broke paths containing spaces/parentheses | 1 | null-delimited `rg -0` / `xargs -0` rewrite | recovered without dropping callers |
| Metadata insertion omitted commas in one-line arrays | 1 | parse and deduplicate the metadata owner | fixed; registry checker and tests pass |
| Variant fixture pulled unrelated shadcn UI dependencies | 1 | make each Toolbar variant a complete primitive-specific implementation | all three isolated bundles pass |
| Base Toolbar did not implement End-key behavior | 1 | enforce the shared sequential Arrow-key contract, not fake cross-primitive parity | all three focus the next item; primitive-specific extra keys remain native |
| Broad component test run exposed shared package export/runtime drift | 1 | isolate migration-owned failures and run source/type/registry/browser gates | migration-owned path/type failures fixed; 49/81 broad rows pass, remaining failures cite unrelated package API drift |
| P2 autoreview failed closed on unrelated credential-bearing changes | 1 | record exact security gate; do not expose or mutate unrelated material | no review model invoked; scoped manual/source proof completed |

Verification evidence:
- `pnpm --filter www typecheck`: pass, including editor contract, API docs,
  MDX generation, docs/registry source checks, app TypeScript and package
  integration TypeScript.
- Scoped Biome proof passes across 196 migration files. Root `pnpm lint:fix`
  reaches the same source cleanly, then fails on two unrelated concurrent
  `packages/cli/src/run-migration.ts` non-top-level regex findings.
- `pnpm --filter www check:toolbar-variants`: Radix 55 modules, Base 184,
  Aria 117; all typecheck and browser-bundle.
- Browser: all three `/radix/`, `/base/`, `/aria/` fixtures render one
  `Formatting` toolbar; Bold reports `aria-pressed=true`; ArrowRight focuses
  Italic; no warning/error console entries.
- Focused tests: registry/init/route 10/10, toolbar dependency/ownership 6/6,
  registry dependency resolver 7/7.
- Registry/docs/changelog: source checker pass, flat stale-surface scan pass,
  docs parity pass, 62/62 changelog events pass, editor generated contract
  check pass.
- Doctrine: `pnpm install` regenerated mirrors; source/mirror phrase audit
  passes; v90 adds family colocation and v92 adds semantic component names plus
  separate live/static items; v94 removes the last Classic naming exception.
  Plate Next v94 validates 44 active and 2 retired packages.
- `git diff --check`: pass.
- Local `build:registry` intentionally not run because CI exclusively owns
  `apps/www/src/__registry__/**` and public registry output.

Colocation closure:
- The follow-up audit found 25 modern feature families that still delegated
  family-only renderers or UI through shallow sibling files. Forty source files
  were removed from the flat editor directory: 39 merged family files plus the
  unowned `plate-editor-select.tsx` orphan. The directory fell from 225 to 185
  TypeScript files.
- Registry metadata fell from 81 to 57 editor items while the 71 feature items
  remained stable. Twenty-four obsolete node/button/toast/alias items were
  deleted; feature metadata, dependencies, docs routes, copied imports, tests,
  changelog targets, and downstream sync teaching now resolve to the owner.
- The registry source checker rejects the deleted items and generic modern
  `foo-node`, `foo-buttons`, and `foo-toast` feature-shell splits. Classic
  items remain explicitly exempt under their maintenance-only policy.
- Proof: 42/42 renamed family tests pass in isolated owners, registry tests
  pass 10/10, the schema adoption checker passes 61/61, both www TypeScript
  programs pass, 69 feature modules import in Bun, Excalidraw browser-bundles,
  and Browser loads 31 owner exports plus 24 kits with a successful interaction
  and no fixture warning/error logs.

Semantic naming closure:
- Renamed 15 modern component items/files from implementation-role `*-node`
  names to semantic feature names: Blockquote, Heading, Horizontal Rule,
  Paragraph, Code, Highlight, Kbd, six Media components, Search Highlight, and
  Tag. Aggregate kits remain composition owners and import those semantic
  components.
- Split 14 registry items that mixed live and static source into distinct
  `foo` and `foo-static` items. Editor metadata intentionally rises from 57 to
  71 items; every modern node-suffix item/file is gone.
- Renamed six focused component specs; all 12 rows pass. Registry source
  closure, 10/10 registry tests, 61/61 schema-adoption tests, package-integration
  TypeScript, 142-module runtime import smoke, Excalidraw/browser bundling,
  docs parity, editor generation, changelog, scoped lint, and Browser fixture
  interaction pass.
- The explicit Classic follow-up merged `list-classic-node.tsx` into
  `list-classic.tsx`, removed the obsolete item, and cut the hidden reverse
  dependency from `list-classic` to `autoformat-classic`. Editor metadata now
  has 70 items, zero `*-node` items/files, and zero mixed live/static items.

Final handoff prepared:
- Ownership and target API: copied Plate product features live flat in
  `components/editor`; registry item/files are feature-named; exported arrays
  remain `FooKit`; live/static and presentation/composition stay explicit.
- Public breaks and adoption: old `registry/ui`, nested `editor/plugins`,
  `*-kit` and `*-base-kit` item/file paths are hard-cut across source, callers,
  metadata, docs, checkers, generated editor contracts and changelog guidance.
- Runtime/docs/browser: Toolbar has complete Radix/Base/Aria install-time
  implementations targeting the same file, with shared typed and keyboard
  behavior proof. Package runtime semantics are unchanged.
- Proof and risks: all migration-owned gates pass. Root lint and API-reference
  aggregation have unrelated concurrent blockers; P2 autoreview is blocked
  before model invocation by unrelated credential findings in the whole dirty
  checkout. CI must regenerate registry build output.
- Execution order and user attention: no remaining source action; review the
  final topology and let CI regenerate `src/__registry__`/public artifacts.

Timeline:
- 2026-08-17T08:42:47.026Z Plate Plan created.
- 2026-08-17 family-colocation follow-up merged 39 shallow family files,
  deleted one orphan and 24 obsolete items, repaired docs/checkers/doctrine,
  and passed focused type/test/runtime/browser proof.
- 2026-08-17 semantic naming follow-up renamed the remaining 15 modern
  `*-node` owners, split 14 static registry items, and added v92 enforcement.
- 2026-08-17 explicit Classic follow-up removed the final `*-node` owner and
  added v94 cycle/naming enforcement without Classic behavior work.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Final checker after complete implementation and proof |
| Where am I going? | Goal completion and user handoff |
| What is the goal? | Hard-cut copied Plate registry topology to flat feature owners with stable kits and three Toolbar variants |
| What have I learned? | Feature names and composition values solve different jobs; primitive variants must be complete install-time owners at one target |
| What have I done? | Migrated source, metadata, callers, docs, checkers, changelog, generated editor contracts and doctrine; passed type, lint, registry and Browser proof |

Open risks:
- CI must regenerate the intentionally untouched registry build output under
  `apps/www/src/__registry__` and `apps/www/public/r`.
- P2 autoreview did not reach the model because the whole shared checkout
  contains unrelated TruffleHog verified/unknown credential findings. All
  scoped source/type/test/browser gates pass, but that security gate must be
  cleared by the owner of those unrelated changes before a whole-tree review.
- Root lint is blocked outside this migration by two
  `packages/cli/src/run-migration.ts` regex-placement findings. Full docs check
  is blocked before MDX/parity by the unrelated unclassified
  `PersistedDocumentInput` API-reference symbol; direct MDX/parity passes.
- Full www app TypeScript is currently blocked outside this migration by the
  concurrent document-migration contract requiring `sourceFingerprints` in
  `document-migration-demo.tsx` and `editor-default.tsx`; the focused package
  integration TypeScript program passes.
