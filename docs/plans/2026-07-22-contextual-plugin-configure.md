# contextual plugin configure

Current contract correction (2026-07-23):
Contextual `.configure()` remains supported, but a descriptor accepts one
terminal consumer configuration only. Package definitions use `create*Plugin()`
and `.extend*()`; app and registry consumers may finish the descriptor with one
object or contextual `.configure()` call. The correction and fresh proof are
owned by `docs/plans/2026-07-23-single-consumer-plugin-configure.md`.

Objective:
Restore contextual Plate plugin configuration without reopening mutable model
configuration: one terminal
`.configure(({ editor }) => runtimeOverrides)` may override only the plugin's
existing runtime surface, while `.extend*()` remains the package authoring and
type-widening API.

Flow mode:
accepted implementation

Goal plan:
docs/plans/2026-07-22-contextual-plugin-configure.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- package-api
- browser

Mode:
- `standard`; the user accepted the API shape and explicitly said `go`.

Completion threshold:
- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.

Verification surface:
- Focused source audit of `BasePlugin`, `PlatePlugin`, `createBasePlugin`,
  `resolvePlugin`, callback-configure tests, and editor-bound registry callers.
- Core focused tests and type contracts, `@platejs/core` typecheck,
  `check:core`, `www` typecheck, `lint:fix`, Browser proof on the registry
  playground/demo surface, and final `autoreview`.

Constraints:
- The user accepted this exact target API in the preceding design review and
  invoked implementation with `go`.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Contextual configuration cannot define `config`, `schema`, `type`,
  `targetPluginKeys`, parsers, host semantics, nested plugins, or decoration
  classification.
- Do not edit generated registry output, templates, or unrelated migration
  surfaces.

Boundaries:
- In scope: Core descriptor typing/runtime/resolution, focused contract tests,
  and contextual registry/package callers that only override existing runtime
  behavior.
- Source owners: `packages/core/src/lib/plugin`,
  `packages/core/src/react/plugin`, `packages/core/src/internal/plugin`, and
  targeted `apps/www/src/registry/components/editor/plugins` callers.
- Non-goals: contextual `configurePlugin`, schema/config factories, command
  dispatch, plugin ordering, or a general plugin API redesign.
- Direct Plite boundary owners: N/A; this is Plate descriptor DX and must not
  change Plite schema, transaction, or publication semantics.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Block only if editor-bound callbacks cannot be resolved before publication
  without admitting model fields or changing immutable configuration/fingerprint
  semantics. Do not block while a focused type/runtime repair remains.

Plate Plan state:
- status: complete
- phase: prove-and-handoff
- next: none
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Safe contextual configure, additive extend, caller sweep, tests, and browser closure captured. |
| Active goal and plan verified | yes | Active autogoal points to this plan. |
| Current owners read | yes | Core descriptor types, construction, resolution, tests, and target callers inspected. |
| Mode and execution boundary resolved | yes | Accepted implementation; focused Core plus caller adoption. |
| Package/API pack selected | yes | Public package callback API and type contract change. |
| Public surface or package boundary identified | yes | `BasePluginMethods.configure` and `PlatePluginMethods.configure` in `@platejs/core`. |
| Release artifact path selected | yes | Existing Core major changeset `.changeset/plugin-portal-scoped-api.md` updated; no duplicate changeset. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded; existing Core major release note owns the final configure/extend contract. |
| Barrel/export impact decision recorded | yes | Existing methods/types only; no file/export move, so no `pnpm brl`. |
| Browser pack selected | yes | Registry source caller is modified. |
| Browser route / app surface identified | yes | `/blocks/playground-demo`, which installs `BlockSelectionKit` through `EditorKit`. |
| Browser tool decision recorded | yes | Browser plugin for ordinary DOM/editor proof; no native Chrome behavior involved. |
| Console/network caveat policy recorded | yes | Check page errors and failed requests; report unrelated dev noise separately. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
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
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | All implementation, type, audit, package, browser, and review gates pass. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final callback and extension sweeps plus live owner reads completed. |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Ordering, multi-editor isolation, runtime bypass, type widening, audits, and registry adoption proven. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | See Verification evidence. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | See Final handoff prepared. |
| Autoreview | yes | Run for implementation changes or record planning-only N/A | Final scoped Codex autoreview clean; one prior audit-bypass finding accepted and fixed. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-contextual-plugin-configure.md` | Final checker command is the last plan gate. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Existing Core plugin methods changed; no exports/files moved. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Existing Core major changeset owns the narrowed contextual callback contract. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Updated existing `@platejs/core` major changeset; no forbidden minor or duplicate file. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: Core public API/runtime is the owner; registry files are adoption callers. |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: existing Core major changeset updated. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Selected eight-package/www typecheck and full `check:core` pass. |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no export or public file-layout change. |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | `/blocks/playground-demo`: 75 selectable blocks; heading context-click produced one menu, selected marker, and overlay. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Route returned 200; one unrelated table-cell random-ID hydration warning recorded. |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | Authoritative DOM interaction counts recorded; screenshot unnecessary. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Owners, constraints, accepted target, and proof surface recorded | Decide |
| Decide | completed | Object and contextual configuration share one terminal consumer step | Implement and prove |
| Prove and hand off | completed | Full Core gate, Browser interaction, and clean final autoreview | User review |

Decision brief:
- outcome: Contextual `.configure` is ergonomic again without weakening the
  immutable model boundary.
- chosen shape: overload `.configure` with an editor-context callback returning
  a non-additive runtime override type; accept one object or callback
  configuration per descriptor; resolve it before contextual extensions and
  reapply its captured result as the final override.
- strongest rejected alternative: allow repeated `.configure()` layers. That
  erases the ownership boundary between reusable plugin definition and consumer
  installation.
- consequence: package authors use `.extend*()`; consumers get one terminal
  `.configure()` that cannot add option/API/selector shape.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Contextual configure typing | Static object only | Callback overload returning existing runtime overrides | Core plugin types | Honest DX without type widening | Base and React descriptors | Type tests, typecheck | Excess-property inference loopholes | complete |
| Descriptor storage | Configuration stored on immutable descriptors | One terminal public configuration entry; internal nested-plugin overlays may share the private list | `createBasePlugin` | Preserve one consumer owner without rewriting nested configuration | Clone/recreate/type-erased boundaries | Runtime tests | lost callbacks or accidental second public layer | corrected |
| Resolution order | Configuration and extensions can overlap | Evaluate configuration once, let contextual extensions read it, then reapply the captured consumer result | `resolvePlugin` | Consumer intent must be visible to extensions and final in precedence | All editors and repeated resolution | Precedence/multi-editor tests | duplicate callback effects or input rules | corrected |
| Runtime guard | Callback field guard only | Callback field guard plus terminal descriptor guard | Core runtime | Runtime consumers can bypass TS | every plugin authoring method after configure | negative runtime tests | accidental post-config authoring | corrected |
| `.extend` callers | Package and consumer ownership mixed | Package definitions use `.extend*()`; app/registry installation may use one `.configure()` | Package/registry owners | API name reflects ownership, not merely whether fields exist | package sweep plus registry callers | source audit, typecheck, Browser | misclassifying package defaults as user config | corrected |
| Release artifact | Branch hard cut diverges from main | Final callback surface matches `origin/main` | release classification | No user-visible published delta from main | none | main comparison | unrelated WIP changesets | no artifact |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Type law | Core types/tests | Add non-additive callback overload and negative contracts | Current static-only configure | Valid editor inference; new keys/model fields rejected | typed specs and Core typecheck |
| 2. Runtime law | Core constructor/resolver | Store one terminal configuration, guard authoring, resolve once, and preserve final precedence | Immutable descriptor exists | Correct precedence and editor-specific values without duplicate effects | focused runtime specs |
| 3. Adoption | Package/registry callers | Keep package definitions on `.extend*()` and make consumer `.configure()` calls terminal | Callback configure works | Production packages contain no definition-time `.configure()` calls outside reviewed Core installation owners | source audit, package/www typechecks |
| 4. Closure | Core + www | Lint, package gate, Browser, review | Implementation complete | All applicable gates green, no accepted review finding | `check:core`, Browser, autoreview, checker |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Callback configure sees the correctly typed editor/plugin context | Existing `.extend` context types and resolver context | Base and Plate type contracts plus runtime editor-specific spec | passed |
| Callback configure cannot alter model semantics | Immutable config/schema snapshot owner and runtime guard audited | Type-negative, runtime-throw, and source/docs audit specs | passed |
| Configure does not add option/API/selector types | Configure return remains `Plugin<C>` | Excess-key type contracts | passed |
| Configure is visible to extensions and remains final | Resolver evaluates configuration, applies extensions, then reapplies the captured result | Precedence spec | corrected |
| Callback is isolated and evaluated once per editor | Resolver captures each callback result once per editor | Two-editor IDs/options/call-count spec | corrected |
| Registry behavior remains usable | `BlockSelectionKit` only needs options/render | Browser context-click produced menu/marker/overlay | passed |

Conditional evidence:
- High-risk scenarios: configuration ordering, cross-editor callback leakage,
  runtime JS callers returning forbidden model fields, and type widening.
- External research: N/A; repository current/main implementations fully own the
  API decision.
- Issue/PR provenance: N/A; direct user-requested branch repair.
- Docs/registry/browser/release/behavior-law owners: no public docs needed for
  restoring main-equivalent syntax; registry/browser and Core behavior-law
  owners apply.

Findings:
- The schema architecture plan required immutable model configuration but did
  not require deleting contextual runtime configuration.
- `__configuration` is deliberately consumed as a frozen object by live editor
  configuration; putting a callback back there would reintroduce split meaning.
- Current runtime extension guards already reject most model fields, but the
  callback type is broader than the runtime guard and needs a precise owner.
- `BlockSelectionKit` only overrides existing options and render behavior; its
  current `.extend` is semantic drift.

Decisions and tradeoffs:
- Keep one public configure step per descriptor. It accepts either an object or
  a contextual callback.
- Declare every `.extend*()`, `.withComponent()`, and nested-plugin authoring
  step before terminal `.configure()`.
- Do not restore contextual `configurePlugin` in this packet.
- Prefer an explicit runtime allow-list over a broad config type with omitted
  model keys if the type audit shows unrelated semantic fields remain exposed.

Review fixes:
- Accepted P2: source/docs audits missed callbacks returning identifier-bound
  objects. Contextual callbacks in audited repository sources/docs must return
  explicit objects; regression contracts cover identifier and block returns.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Broad Bun package sweep resolved stale `plite-react/dist` export | 1 | Run focused touched-owner tests and the source-first Core gate | Focused 83 tests and final `check:core` pass; no product code change. |
| `check:core` still enforced object-only configure doctrine | 1 | Repair the owning schema/docs audits and their contracts | Audit permits only explicit runtime fields and rejects model/nonliteral returns. |

Verification evidence:
- `pnpm turbo typecheck` for Core, tabbable, utils, selection, media, dnd,
  list, and www: 64/64 tasks passed.
- Focused touched-owner Bun tests: 83/83 passed; final focused Core rerun:
  49/49 passed.
- `pnpm lint:fix`: 4,848 files checked, no fixes required.
- `pnpm check:core`: source/docs audits, 45 package typechecks/lints, Core,
  Plite, and reviewed-package tests passed.
- Browser `/blocks/playground-demo`: one editor, 75 selectable blocks;
  context-click produced one menu, selected marker, and selection overlay.
- Final scoped Codex autoreview: clean, no accepted/actionable findings.

Final handoff prepared:
- Ownership and target API: Core owns contextual `.configure`; only existing
  options, handlers, renderers, and shortcuts are allowed in callback form.
- Public breaks and adoption: package definitions use `.extend*()`; app and
  registry consumers may apply one terminal object or contextual configure.
- Applicable runtime/package/docs/browser decisions: one public configuration
  entry; terminal types/runtime guards; source/docs audits and the existing
  Core major changeset updated.
- Proof and execution risks: all scoped gates pass; unrelated playground table
  IDs still emit an existing hydration mismatch.
- Execution order and user attention: complete; no remaining scoped action.

Timeline:
- 2026-07-22T11:58:41.254Z Plate Plan created.
- 2026-07-22 Core callback typing/storage/resolution implemented; runtime and
  type contracts pass; runtime-only caller sweep applied.
- 2026-07-22 Repaired the object-only schema/docs audit doctrine, accepted and
  fixed one review bypass, passed Core/package/browser proof, and closed review.
- 2026-07-23 Corrected the ownership/cardinality contract to one terminal
  consumer configure; fresh proof moved to the correction plan named above.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Complete |
| Where am I going? | Final handoff |
| What is the goal? | Restore safe contextual configure and migrate dishonest extend usage. |
| What have I learned? | Immutable model configuration and contextual runtime overrides need distinct storage and types. |
| What have I done? | Implemented, adopted, audited, browser-proved, and reviewed the final API. |

Open risks:
- Scoped implementation risks closed. Unrelated existing playground table-cell
  ID hydration mismatch remains outside this task.
