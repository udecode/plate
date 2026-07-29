# remove Plate extension identity helper

Objective:
Remove Plate's duplicate extension identity helper; done when direct factory
inference, callers, docs, doctrine, generated skills, checks, and review pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-29-remove-plate-extension-identity-helper.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- docs
- agent-native
- package-api

Mode:
- `standard` accepted-target execution.

Completion threshold:
- Direct Plate constructor and `.extend()` `extension` factories preserve
  nested extension inference without a helper, annotation, cast, or `any`.
- Extracted reusable behavior takes domain inputs and uses the standalone
  Plite extension boundary; it does not receive Plate plugin context merely to
  recover contextual typing.
- Plate's `DefineEditorExtension`, `createDefineEditorExtension`, and
  `BasePluginContext.defineEditorExtension` are deleted with zero callers or
  current docs.
- English/Chinese docs, API reference, best-api doctrine, Plate Vision, and
  contradictory worker rules teach the plain factory return.
- Core/Utils type and behavior checks, docs checks, generated-skill sync,
  source audits, agent-native review, autoreview, and `check-complete` pass.

Verification surface:
- Compile-only Core contracts for constructor and `.extend()` extension
  factories, including nested command/state/tx/dependency inference and
  negative invalid-access checks.
- Focused Core and Utils typechecks/tests; public export and stale-symbol
  audits; `pnpm brl` only if barrel output changes.
- `pnpm --filter www build:source` and `pnpm --filter www check:docs`.
- `pnpm install`, generated skill/source parity audit, agent-native review,
  scoped autoreview, and final autogoal checker.

Constraints:
- User explicitly accepted the hard cut and authorized complete execution,
  including skill repair.
- No public compatibility aliases or runtime shims.
- No explicit callback annotations, casts, `any`, or replacement identity
  helper to hide broken inference.
- Preserve standalone Plite `defineEditorExtension`; only the duplicate Plate
  context helper is removed.
- Preserve unrelated current-tree work and do not claim whole-checkout proof.

Boundaries:
- In scope: Plate plugin authoring types/runtime context, every helper caller,
  Core type contracts, Utils adopters, English/Chinese plugin docs/API
  reference, changeset classification, best-api repair, Plate Vision,
  contradictory worker rules, generated skills, and focused proof.
- Source owners: `packages/core`, `packages/utils`, `packages/combobox` and its
  trigger-extension consumers, `content/docs`,
  `.agents/rules/best-api.mdc`, `.agents/rules/docs-creator.mdc`,
  `.agents/rules/plate-plugin-creator.mdc`, and `docs/vision/plate.md`.
- Non-goals: changing standalone Plite extension authoring, editor runtime
  semantics, browser behavior, registry UI, release publication, or unrelated
  plugin API work.
- Direct Plite boundary owners: `packages/plite` canonicalization remains
  unchanged; Plate raw extension objects continue to be canonicalized at
  installation.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Stop only if three distinct owning-generic designs cannot preserve both
  contextual nested inference and exact accumulated extension output without
  annotations/casts/`any`, and no smaller public shape remains.

Plate Plan state:
- status: active
- phase: prove-and-hand-off
- next: implement inference owner
- handoff: not-prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Fix every caller and repair the skill/doctrine owner; docs are explicit scope |
| Active goal and plan verified | yes | Active goal names this exact plan and binary threshold |
| Current owners read | yes | Core context helper, plugin generics/runtime, Utils callers, docs, rules, and Vision read |
| Best API target resolved | yes | Hard cut accepted: plain `extension: (context) => ({ ... })`; no context helper |
| Mode and execution boundary resolved | yes | One-shot execution explicitly authorized |
| Docs pack selected | yes | Public guide, context, and API reference adoption required |
| `docs-creator` loaded | yes | Full skill read before editing |
| Docs lane selected | yes | Guide/system plus API-reference correction |
| Target docs and nearest sibling docs read | yes | Plugin Methods, Plugin Context, Core Plate Plugin API, and CN mirrors |
| Docs style doctrine read | yes | `.agents/skills/docs-creator/SKILL.md` read |
| Documented source owner identified | yes | Core plugin authoring types and runtime context |
| Agent-native pack selected | yes | Best-api and worker source rules plus generated skill mirrors change |
| Agent-facing action surface identified | yes | API review must reject public typing helpers compensating for owner-generic failure |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`; regenerate `.agents/skills/**` with `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Full skill read; parity map required at closeout |
| Package/API pack selected | yes | `@platejs/core` public context/type surface and `@platejs/utils` callers change |
| Public surface or package boundary identified | yes | Remove Plate-only context helper; standalone `@platejs/plite` helper remains |
| Release artifact path selected | yes | N/A: helper and docs do not exist on `main`, so removal has no upgrade-visible delta |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded; classification proves no new changeset is allowed |
| Barrel/export impact decision recorded | yes | Public type deletion is through existing exports; run barrel audit and `pnpm brl` if generated output changes |

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
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | All scoped checks, audits, Browser proof, and review pass |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final source/dist/docs/rule audit has zero Plate helper symbols |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Hard cut implemented; scoped autoreview reports zero actionable findings |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Type, behavior, docs, Browser, doctrine, and adoption gates pass; issue provenance N/A |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Exact commands and results recorded below |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff section complete |
| Autoreview | yes | Run for implementation changes or record planning-only N/A | Local scoped review clean, confidence 0.82 |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-29-remove-plate-extension-identity-helper.md` | Pass |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | EN/CN guide and API claims match current Core/Plite owners |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | Four exact docs routes rendered; relevant headings/text present |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | `build:source` and `check:docs` pass |
| Plugin page specifics | yes | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | Current-state guide/API prose and standalone Plite boundary applied |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` regenerated all named skills |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Best-api and three worker entrypoints explicitly reject the helper pattern |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Capability map below has no missing entry, support, or evidence path |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Core source/dist zero-symbol audit; Plite builder remains |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | No published delta from `main`; branch-only rejected API |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | N/A: no upgrade-visible delta from `main`; no changeset added |
| Registry changelog | yes | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: no registry source changed |
| No release artifact | yes | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | Helper, docs, and Combobox factory are absent from `main` |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Core, Utils, Combobox, Slash, Emoji, Footnote, Mention checks pass; 130 tests pass |
| Barrel/export generation | yes | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | `pnpm brl` passes |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Live type/runtime/docs/rule owners and all helper callers inventoried | Decide |
| Decide | complete | User accepted hard cut; target, release classification, adoption, and proof resolved | Prove and hand off |
| Prove and hand off | complete | Hard cut, adoption, docs, skill repair, package/docs/Browser proof, and clean review | Final checker |

Decision brief:
- outcome: One Plate extension authoring path whose callback return is fully
  inferred without a nested builder.
- chosen shape: `extension: ({ store }) => ({ corrections: [...] })`; standalone
  Plite descriptors may still use imported `defineEditorExtension`.
- strongest rejected alternative: Keep the same-named context identity helper
  for extracted factories and merely stop using it inline.
- consequence: The owning plugin generic must carry contextual nested
  extension types while retaining exact inferred extension contributions.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Plate extension factory | Callback destructures a same-named identity helper to type its return | Return a plain extension object directly | Core plugin authoring types | The field already establishes the extension job; another builder is leaked compiler machinery | Constructor, `.extend()`, Utils callers, type tests, docs | contextual inference and negative compile contracts | output accumulator widening may regress | rearchitect |
| Plate context API | `BasePluginContext.defineEditorExtension` plus `DefineEditorExtension<C>` and creator | Delete completely | Core context/runtime | No runtime behavior; Plite canonicalizes installed inputs | source/types/exports/docs sweep | zero stale symbols and Core public typecheck | hidden external consumer on branch | cut |
| Standalone Plite helper | Public canonicalizing `defineEditorExtension` | Keep | Plite | Distinct standalone descriptor authoring and canonicalization job | clarify docs only | Plite type/runtime checks unchanged | accidental deletion | keep |
| Review doctrine | Best-api and worker rules explicitly preserve helper workaround | Require owner-generic repair and reject same-field identity helpers | best-api, Plate Vision, docs creator, plugin creator | The prior rule caused the missed P1 | source rules and generated mirrors | source/generated audit plus agent-native review | overgeneralizing product-specific syntax | repair |
| Release artifact | Branch-only helper never exists on `main` | No changeset | changeset owner | Users upgrading from `main` cannot observe its removal | N/A | `git show main` zero-symbol audit | misleading release prose | keep |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Inference owner | Core | Prove the existing extension-field generic and strengthen its type contracts only where evidence requires | accepted target | constructor and `.extend()` factory inference passes without helper | Core type contracts |
| 2. Hard cut/adoption | Core, Utils, Combobox, and consumers | Delete helper type/runtime/context, migrate direct callers, and replace context-threaded extracted factories with domain inputs | inference owner passes | zero production/test/type callers | owning package typechecks and focused tests |
| 3. Public teaching | Docs and release owner | Rewrite EN/CN guide/API docs and classify changeset | source settled | no Plate context-helper teaching remains | docs build/check and main-baseline audit |
| 4. Skill repair | Rules and Vision | Patch best-api, smallest Vision owner, and contradictory workers; regenerate | correction named | source/generated mirrors aligned and discoverable | `pnpm install`, audits, agent-native review |
| 5. Closure | Repo proof/review | formatting, barrels, focused checks, autoreview, checker | all slices complete | zero accepted findings and complete ledger | recorded commands |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Plain factory returns preserve nested inference | Current helper is a no-op used only as a contextual type anchor | positive/negative Core type contracts | pass |
| Runtime behavior is unchanged | Helper returns its input and Plite canonicalizes every installed input | 130 focused Core/Utils/Combobox/consumer tests | pass |
| Duplicate public surface is fully deleted | Complete source/docs/rule inventory recorded | source and built Core zero-symbol audit | pass |
| Skill repair prevents recurrence | Best-api and workers currently teach the workaround | source/generated parity, Plate Next v23 validation, agent-native review | pass |
| Docs teach one owner per helper | Current docs distinguish two same-named helpers | docs build/check, four rendered routes, zero console errors | pass |

Conditional evidence:
- High-risk scenarios: nested callbacks lose contextual types; exact root API
  extension output stops accumulating; invalid nested keys silently widen.
- External research: N/A; current TypeScript contracts and repo API doctrine
  are authoritative.
- Issue/PR provenance: N/A; user-authorized local hard cut.
- Docs/registry/browser/release/behavior-law owners: docs, package types, and
  Browser rendering apply; registry and behavior law do not because no registry
  or editor behavior contract changes; release artifact is N/A from `main`.

Findings:
- The Plate context helper is an identity function, not the Plite
  canonicalizer.
- Plite already canonicalizes every extension input during installation.
- Four production Utils plugins and Core type contracts use the helper.
- The public Combobox trigger-extension factory threads the whole Plate context
  through six consumers solely to access the helper; it must become a
  standalone Plite descriptor factory with explicit domain inputs.
- The helper and its docs are branch-only and absent from `main`.
- Best-api, docs-creator, and plate-plugin-creator source rules explicitly
  preserve the workaround, explaining why the prior audit missed it.

Decisions and tradeoffs:
- Fix the owning generic rather than rename or hide the helper.
- Keep standalone Plite `defineEditorExtension`; its owner and runtime job are
  distinct.
- Add no changeset because the rejected helper never shipped on `main`.

Review fixes:
- Agent-native review: action `best API audit` is discoverable through
  `.agents/rules/best-api.mdc`; generated `best-api`, `docs-creator`,
  `plate-plugin-creator`, and `plate-next` skills expose the same correction;
  nested plugin-creator typing/audit resources are aligned; source audits and
  `pnpm install` are executable evidence. No missing capability or hidden-state
  finding.
- Scoped autoreview: zero accepted/actionable findings, patch correct,
  confidence `0.82`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Standalone Combobox descriptor lacked required `name` | 1 | Pass the plugin key as an explicit domain input | Fixed; five package typechecks and 47 consumer tests pass |
| Existing docs dev server owned port 3000 but returned no bytes | 1 | Terminate the stale same-repo process and start a fresh server | Fixed; four routes rendered with zero console errors |

Verification evidence:
- `pnpm --filter @platejs/core typecheck`: pass, including declaration contracts.
- `pnpm --filter @platejs/utils typecheck`: pass.
- `pnpm turbo typecheck --filter=./packages/combobox --filter=./packages/slash-command --filter=./packages/emoji --filter=./packages/footnote --filter=./packages/mention`: 18/18 tasks pass.
- Focused Core/Utils/Combobox tests: 83 pass; Slash/Emoji/Footnote/Mention tests:
  47 pass; total 130 pass, 0 fail.
- Scoped Biome check: 17 files pass with no fixes.
- `pnpm --filter www build:source` and `pnpm --filter www check:docs`: pass.
- Browser: `/docs/plugin-methods`, `/docs/plugin-context`, `/docs/plugin`, and
  `/docs/api/core/plate-plugin` render the direct-return teaching; stale Plate
  identity-helper text is absent; console errors: 0. Real-device testing is
  explicitly deferred and unrelated to this API/docs cut.
- `pnpm install`: generated skill sync passes.
- Plate Next doctrine v23 `validate --json`: valid, 42 active packages and one
  retired package tracked.
- `pnpm brl`: 55/55 barrel tasks pass.
- Source and built-output audits: zero `DefineEditorExtension`,
  `createDefineEditorExtension`, context property, or context-threaded
  Combobox factory outside standalone Plite's own builder.
- `git show main`: rejected Core helper and Combobox factory do not exist;
  no changeset or registry changelog applies.
- Scoped autoreview: clean, zero actionable findings.
- Final autogoal checker: complete.

Final handoff prepared:
- Ownership and target API: Plate constructors and `.extend()` callbacks return
  plain extension objects; Plite owns standalone descriptor construction.
- Public breaks and adoption: branch-only Plate context type/runtime helper is
  hard-cut; all Core, Utils, Combobox, Slash, Emoji, Footnote, Mention, docs,
  tests, rules, and generated skill consumers are migrated without a bridge.
- Applicable runtime/package/docs/browser decisions: runtime semantics stay
  unchanged; no changeset/registry note; EN/CN reference and rendered routes
  match current source.
- Proof and execution risks: nested inference, invalid dependency access,
  package output, behavior, docs, barrels, and skill parity pass.
- Execution order and user attention: complete; real-device testing remains
  deferred per user instruction and is not a blocker for this change.

Timeline:
- 2026-07-29T10:16:22.006Z Plate Plan created.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Final checker |
| Where am I going? | Goal completion |
| What is the goal? | Delete the duplicate Plate extension identity helper without losing inference |
| What have I learned? | The helper is branch-only no-op typing machinery; Plite owns canonicalization |
| What have I done? | Hard cut every helper path, rewrote the extracted factory boundary, repaired docs/doctrine/skills, and passed proof/review |

Open risks:
- None inside scope. Real-device testing remains intentionally deferred.
