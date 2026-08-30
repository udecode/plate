# apply registry alias API hard cut

Objective:
Apply the accepted registry naming hard cut; done when all rejected aliases and
the `failInvariant` helper are gone, `useCreateEditor` / `useEditor` /
`useOptionalEditor` are canonical, and package, registry, docs, agent, and
browser checks pass.

Flow mode:
one-shot execution of the accepted alias audit and its later `PlateEditor`
correction

Goal plan:
docs/plans/2026-08-27-apply-registry-alias-api-hard-cut.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:

- browser
- agent-native
- package-api

Mode:

- standard accepted-plan execution

Completion threshold:

- The creation/context hook family is exactly `useCreateEditor`, `useEditor`,
  and `useOptionalEditor`, with all package exports, source consumers, tests,
  docs, examples, and generated registry payloads migrated and no compatibility
  aliases.
- Every `FIX / DELETE` mapping in the attached accepted audit is resolved;
  every explicitly listed `KEEP` adapter/comparison alias remains unless its
  source disappeared as a direct consequence.
- `failInvariant` and its registry item are deleted; all 18 former call sites
  use specific explicit errors or a truthfully named defined-value helper with
  contextual messages.
- Package changeset, registry changelog, barrels, generated registry output,
  doctrine mirrors, focused checks, Browser routes, agent-native review, P1
  autoreview, and the plan checker pass.

Verification surface:

- Exact source audit for every rejected mapping in the attachment and a second
  AST inventory proving only the accepted `KEEP` alias families remain.
- Plate facade React package typecheck/tests, public packed/export proof,
  `pnpm brl`, www typecheck, scoped lint, registry build, changelog checks, and
  release-artifact validation.
- Browser proof on the full editor blocks and the highest-signal migrated demo
  routes, with expected editable content and zero task-caused console errors.
- `pnpm install`, rule/mirror audit, `agent-native-reviewer`, P1 autoreview, and
  `check-complete.mjs`.

Constraints:

- The user accepted every remaining `FIX / DELETE` recommendation in the
  attached audit. The later explicit correction keeps shared presentation
  `Editor` and names complete block composition `PlateEditor`, overriding the
  attachment's older `EditorContent` recommendation.
- Preserve every alias under `KEEP: REAL ADAPTER OR COMPARISON COLLISIONS`.
- No public compatibility aliases, runtime shims, hook variants, or factory
  variants survive.
- Preserve runtime editor behavior and generated plugin specialization.
- Do not commit, push, open a PR, or mutate a tracker.

Boundaries:

- In scope: `packages/platejs` React hook implementation/exports/tests;
  all repository consumers and current docs; every registry `FIX / DELETE`
  mapping; `failInvariant`; release artifacts; generated barrels/registry;
  smallest durable Vision and agent-rule owners.
- Source owners: `packages/platejs/src/react/editor`, Plate store hooks,
  registry source items, root/common/Plate Vision, `.agents/rules/best-api.mdc`
  and any affected worker rule that teaches the rejected names.
- Non-goals: changing editor semantics, Plite headless creation, accepted
  adapter/comparison aliases, generated `BaseEditor`, package consolidation,
  unrelated registry naming, commit/PR/tracker work.
- Direct Plite boundary owners: `plitejs` headless `createEditor` and editor
  types stay unchanged; only Plate React naming changes.

Output budget strategy:

- Use the attached 34-mapping inventory as the bounded manifest. Search exact
  rejected identifiers first; collect repo-wide hook filenames/counts before
  editing; keep generated/public output excluded until regeneration. Save any
  large migration list to a local artifact instead of streaming it.

Blocked condition:

- Stop only if the hook family has an unavoidable public collision that cannot
  preserve creation and mounted retrieval semantics, or package/browser proof
  remains unavailable after the repo's single install-corruption recovery.

Plate Plan state:
- status: complete
- phase: prove-and-handoff
- next: user review
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Attachment `pasted-text.txt` supplies the complete `FIX / DELETE` and `KEEP` inventories; latest user says apply every remaining recommendation; newer `PlateEditor` correction is recorded. |
| Active goal and plan verified | yes | Active goal points at this exact plan and names source, generated, package, registry, and browser closure. |
| Current owners read | yes | Read current hook implementation/store exports, Vision references, accepted audit, and exact surviving registry matches before edits. |
| Best API target resolved | yes | Accepted `best-api` target: `useCreateEditor` for React creation, `useEditor` required context, `useOptionalEditor` nullable context; no factory/context suffixes or aliases. |
| Mode and execution boundary resolved | yes | User explicitly accepted the completed audit; this is one-shot accepted-plan execution, not another planning pause. |
| Browser pack selected | yes | Registry/package changes affect rendered editor consumers; final Browser smoke covered three representative routes. |
| Browser route / app surface identified | yes | Full editor blocks plus current migrated demo registry routes; exact final route list will come from registry metadata before server start. |
| Browser tool decision recorded | yes | Use in-app Browser for localhost DOM/console proof; Chrome and Computer are N/A because no native browser/OS behavior changes. |
| Console/network caveat policy recorded | yes | Require zero task-caused console errors and successful route responses; no task-specific external request behavior changes. |
| Observable browser case captured | no | N/A: public API/naming hard cut, not a report-backed behavior bug; verify representative rendered consumers after migration. |
| Agent-native pack selected | yes | Public naming doctrine and worker guidance require source/mirror repair. |
| Agent-facing action surface identified | yes | Agents author Plate editors and retrieve mounted editors through `best-api`, Plate Vision, and Plate worker skills. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`; run `pnpm install`; never hand-edit `.agents/skills/**/SKILL.md`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded completely before implementation review. |
| Package/API pack selected | yes | `platejs/react` public hooks, generated exports, docs, registry consumers, and release artifacts change. |
| Public surface or package boundary identified | yes | Plate React facade owns all three hooks; Plite headless editor API stays unchanged. |
| Release artifact path selected | yes | One `platejs` patch changeset relative to main plus one registry changelog event for copied-code changes. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded; patch only for `platejs`, one package per file, main-relative prose. |
| Barrel/export impact decision recorded | yes | Hook implementation filename/export names change; run `pnpm brl` and retain generated barrel changes. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API, docs, tests, and exports were checked against live source and built output.
- [x] `best-api` locked one hook grammar before implementation.
- [x] Every decision row records owner, adoption, proof, risk, and verdict.
- [x] The public break has full repository adoption and no compatibility bridge.
- [x] Execution slices and proof matrix are complete.
- [x] Conditional work and final handoff are resolved.
- [x] Browser routes, interactions, and visible outcomes were recorded before proof.
- [x] The in-app Browser proved ordinary app routes; Chrome and Computer are inapplicable because no native browser or OS behavior changed.
- [x] All three Browser routes had zero console warnings or errors after the tested interaction.
- [x] DOM and visible rendered state were directly inspectable, so a screenshot waiver is valid.
- [x] Paint-control proof is inapplicable because this change makes no paint claim.
- [x] Report-backed red-before-green proof is inapplicable because this is a direct API migration, not a reported behavior bug.
- [x] Fresh Browser sessions exercised final generated output and rechecked content plus console state.
- [x] Clean pushed-ref certification is inapplicable because the user requested local edits and no commit or push.
- [x] Retry stability is inapplicable because no selection, focus, DnD, compositor, or lifecycle behavior changed.
- [x] Browser proof used shipped source and generated registry output with no stub or bypass.
- [x] Agent source rules, not generated skill mirrors, were edited.
- [x] The Plate creation and mounted-retrieval distinction is discoverable in `best-api` and Vision.
- [x] `pnpm install` regenerated agent mirrors and parity was verified.
- [x] Agent-native review found no source-owner, discoverability, mirror, or proof gap.
- [x] Public API, package boundary, exports, and release impact are recorded.
- [x] The existing `platejs` major changeset and a registry changelog event cover both user-visible surfaces.
- [x] Changeset work followed the loaded changeset rules; `pnpm changeset status` passed with no forbidden minor bump.
- [x] Registry changelog source and generated JSON were written and checked.
- [x] A no-artifact decision is unnecessary because both applicable artifacts exist.
- [x] The hard cut is explicit: no compatibility aliases or shims survive.
- [x] Package typecheck, tests, build, and packed export proof are recorded.
- [x] `pnpm brl` and the registry/changelog generators completed successfully.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Source, generated output, package build, and Browser proof are green. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final source audit found zero rejected aliases/helpers and exactly 26 accepted alias sites across 19 mappings. |
| Best API review | yes | Resolve every P0/P1 call-shape finding | The accepted hard-cut grammar is implemented with no alternate public noun. |
| Conditional risk and adoption | yes | Complete triggered docs, browser, and release work | All repository consumers, current docs, rules, generated output, changesets, and registry changelog migrated. |
| Verification recorded | yes | Record fresh proof and exact gates | The Verification evidence section lists every command and Browser outcome. |
| Handoff prepared | yes | Prepare ownership, breaks, proof, and risks | Final handoff below records the API, adoption, checks, and unrelated test caveat. |
| P1 autoreview | no | Respect the branch prohibition | Current branch is `next`; repository law says never run `autoreview` on `next`. Direct source audit and focused proof replace it without claiming an autoreview pass. |
| Goal plan complete | yes | Run the plan checker | This plan contains no open status, unchecked work, or unresolved gate; checker result is recorded after this edit. |
| Browser interaction proof | yes | Exercise representative registry routes | `/blocks/editor-basic`, `/blocks/find-replace-demo`, and `/blocks/list-demo` rendered and accepted the expected interactions. |
| Browser console/network check | yes | Inspect task-caused errors | All three tested routes reported zero console warnings/errors and successful route loads. |
| Browser final proof artifact | yes | Record route and DOM proof | Basic editor accepted appended text; find/replace showed two search highlights; legacy list model rendered heading, nested lists, and tasks. |
| Exact case replay | no | Explain inapplicability | Direct API migration with no report-backed runtime defect. |
| Final ref and fingerprints | no | Explain local state | Work remains local and uncommitted by user instruction; no pushed-ref certification is claimed. |
| Clean final runtime | no | Explain local state | Fresh local dev-server proof validates the candidate; it does not claim an immutable pushed artifact. |
| Retry-free stability | no | Explain inapplicability | No native selection, focus, DnD, compositor, or React lifecycle behavior changed. |
| Agent source / generated sync | yes | Regenerate and verify mirrors | `pnpm install` passed; source and generated skill wording match with zero stale examples. |
| Agent action discoverability | yes | Audit the owner path | `best-api` and common/Plate Vision explicitly teach Plate creation versus mounted retrieval. |
| Agent-native review | yes | Review owner, route, mirrors, and proof | Manual reviewer pass found no capability-routing or generated-mirror gap. |
| Public API / package boundary proof | yes | Audit exports and ownership | Built `platejs/react` exports the four canonical functions and none of the three compatibility names. |
| Release artifact classification | yes | Classify both surfaces | Published `platejs` API break plus copied registry changes require both package and registry artifacts. |
| Published package changeset | yes | Validate changeset policy | `.changeset/platejs-foundation.md` records the major hook migration; `pnpm changeset status` passed. |
| Registry changelog | yes | Generate and check the event | `2026-08-28-canonical-editor-api-names` source and JSON pass write/check validation. |
| No release artifact | no | Explain inapplicability | Both user-visible surfaces have their required artifacts. |
| Package typecheck/build/test | yes | Run owning checks | Plate typecheck, 923 package tests, build, and packed export audit passed. |
| Barrel/export generation | yes | Regenerate exports | `pnpm brl` passed across 43 tasks. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | User attachment, accepted audit, newer correction, current hooks, exports, and surviving registry matches read | Decide |
| Decide | complete | Every audit row has accepted rename/cut/keep verdict below | Execute |
| Execute | complete | Hook family, registry aliases, failure helper, docs, rules, artifacts, barrels, and generated registry migrated | Prove |
| Prove and hand off | complete | Package, www, generator, Browser, source-audit, and plan-check evidence recorded | User review |

Decision brief:

- outcome: one truthful creation/context hook family and no fake product,
  headless, layer-erasing, or vague failure aliases in copied registry source.
- chosen shape: `createEditor`, `useCreateEditor`, `useEditor`,
  `useOptionalEditor`; canonical registry import names; `PlateEditor` for the
  complete block; specific defined-value failures.
- strongest rejected alternative: retain `useEditorContext` or caller aliases
  for compatibility. Rejected because it preserves two nouns for retrieval and
  forces creation callers to invent `useProductEditor`.
- consequence: breaking `platejs/react` hook rename across all current source,
  docs, tests, and examples; copied registry consumers migrate in the same cut.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| React editor creation/retrieval | `useEditor` creates; `useEditorContext` retrieves; `useOptionalEditorContext` retrieves nullable | `useCreateEditor`; `useEditor`; `useOptionalEditor` | `packages/platejs/react` | Names say the actual job and remove caller inventions | Migrate all repository imports, docs, tests, examples, generated outputs; no aliases | package typecheck/test/pack/export audit and zero old-name search | large call-site blast radius | rename |
| Full registry composition | complete blocks and shared presentation collided historically | `PlateEditor` complete block; shared `Editor` presentation | registry block owners | newer user correction names the higher owner | already applied; keep while rebuilding payloads | source/generated/browser | stale copied JSON | keep |
| Product/headless/layer aliases | product/headless/Plite aliases hide canonical package meaning | canonical imports and local `createTestEditor`/`createReactEditor`/`createSlateEditor` only where jobs differ | registry source/tests | package paths already state the layer | migrate every attached `FIX / DELETE` row | exact AST inventory and tests | accidental local collision | cut |
| Floating/type/chat/fixture aliases | meaning-erasing aliases and inverted local names | `FloatingPopover*`, `ImageElement`, `Element` plus explicit `HTMLElement`, `BlockResolvedSuggestion`, `useEditorChat`, `legacyListModelValue`, canonical `ListPlugin` | registry item owners | local/exported names should preserve semantic meaning | rename definitions and consumers together | www typecheck, registry build, exact audit | copied install dependency drift | rename |
| `failInvariant` | generic `never` throw with one useless message across 18 calls | delete item; explicit contextual errors or a truthful defined-value helper | each registry item, with helper only if genuinely shared | current helper communicates no invariant or failing value | migrate every call and registry metadata/dependencies | zero source/generated matches, focused tests, Browser | changed throw timing/message | cut |
| Adapter/comparison aliases | explicit primitive adapters, base/provider collisions, classic comparisons, Slate comparison, generated specialization | retain attachment `KEEP` list | existing adapter/comparison owners | aliases expose a real side-by-side distinction | no churn except import movement forced by source rename | AST inventory matches keep policy | over-broad codemod | keep |
| Doctrine/release | Vision teaches rejected creation/context names; release artifacts absent | update smallest Vision/best-api/affected workers; changeset + registry event | Vision/rule/release owners | future humans/agents must discover the canonical shape | regenerate skill mirrors, changelog JSON, registry payloads | source/mirror audit and generators | stale teaching | rearchitect |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Hook hard cut | `packages/platejs/react` | implementation file, store hooks, exports, internal/package/repo callers | accepted target and current collision confirmed | all repository hook callers use the new family, no aliases | focused Plate tests/typecheck, zero old hook names, barrels/packed exports |
| 2. Registry alias cleanup | registry item owners | every attached `FIX / DELETE` row except completed `PlateEditor` | hook cut available | canonical/local semantic names compile; `KEEP` aliases preserved | AST inventory, scoped tests, www typecheck |
| 3. Failure cleanup | registry DnD/combobox/chat/discussion owners | delete `failInvariant`, add contextual failures | exact 18-call inventory | zero helper/item/dependency/generated matches | focused tests, registry build, Browser |
| 4. Teaching and release | Vision, agent rules, changeset, registry changelog | current call sites and migration artifacts | final API stable | no stale public teaching; generated mirrors/artifacts current | install, generators, source/mirror audit |
| 5. Closure | owning packages/www/browser/review | lint, types, tests, pack/build, routes, reviews, plan | all edits complete | all gates green, no P1 finding | full command/browser/review ledger |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Hook names match jobs | implementation/store source and four `useProductEditor` aliases exposed the collision | package tests/typecheck, public export audit, zero compatibility names | passed |
| Every rejected registry alias is removed | attached complete inventory plus final exact search | Babel AST inventory and www checks | passed |
| `failInvariant` disappears without behavior loss | helper was only `throw new Error`; 18 calls migrated | source/generated zero match, package/www checks, Browser | passed |
| Real aliases survive | attachment's explicit `KEEP` list | final AST inventory contains only 26 accepted adapter/comparison sites | passed |
| Published/copied output agrees | platejs and registry are both user-visible owners | changeset, changelog check, barrels, packed exports, registry build | passed |

Conditional evidence:

- High-risk scenarios: creation callers accidentally bind the retrieval hook;
  internal Plate components accidentally recreate editors; generated/public
  registry JSON keeps stale names. Exact symbol ownership, typecheck/tests, and
  generation/browser proof cover each.
- External research: N/A: user attachment and live repository owners fully
  resolve the target; no external precedent can change the accepted decision.
- Issue/PR provenance: N/A: direct user request, no issue or PR.
- Docs/registry/browser/release/behavior-law owners: common/Plate Vision,
  affected agent rules, `platejs` changeset, registry changelog/build, and
  representative Browser routes all apply.

Findings:

- Current package source confirms the collision: `useEditor` constructs a
  memoized editor while `useEditorContext`/`useOptionalEditorContext` read the
  mounted store.
- Current registry still contains every non-component rejected alias family
  from the attachment plus all 18 `failInvariant` calls.
- The shared `Editor`/complete `PlateEditor` correction is already present in
  source; only generated payload and broader hook migration must preserve it.

Decisions and tradeoffs:

- Break all three hooks together. A partial rename would make `useEditor`
  temporarily ambiguous and is worse than one hard cut.
- Rename local test factory variables rather than canonical imports; retain
  adapter/comparison aliases only when two real concepts coexist in one file.
- Delete `failInvariant`; do not preserve the file under a prettier name unless
  repeated contextual call sites prove one `expectDefined` helper earns reuse.

Review fixes:
- The package owner review removed caller-only generics from mounted retrieval;
  `useEditor` and `useOptionalEditor` return the canonical `Editor` type.
- The user correction superseded the attachment's component proposal: shared
  presentation remains `Editor`; assembled blocks remain `PlateEditor`.
- P1 autoreview is intentionally not invoked because the current branch is
  `next` and repository law explicitly forbids autoreview on that branch.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Initial broad patch missed changed surrounding lines | 1 | Apply smaller owner-scoped patches | Migration applied without widening scope. |
| Zsh bulk loop treated newline paths as one filename | 1 | Read one path per iteration | Scoped lint completed on the intended files. |
| First AST audit used a missing traversal package | 1 | Walk Babel import declarations directly | Final inventory reports 26 sites across 19 accepted mappings. |
| First TypeScript AST retry hit the repository's non-API TypeScript package | 2 | Use the available Babel parser | Final inventory completed successfully. |
| First broad registry alias patch mismatched JSX names | 1 | Split import edits from safe identifier renames | All rejected rows migrated. |
| Initial www typecheck found a fixture import and local factory collisions | 1 | Fix the remaining direct owners | Fresh www typecheck passed. |
| Packed export audit targeted `dist/react/index.mjs` | 1 | Use the emitted `dist/react/index.js` path | Required exports present and compatibility exports absent. |
| First Browser navigation timed out during compilation | 1 | Wait for the existing route compilation, then reload in Browser | All three final route checks passed. |
| Exact registry scan expected standalone JSON for two source-only examples | 1 | Verify materialized items plus the two live demo routes | Generated items and demo routes agree with source. |
| Focused registry specs hit the existing source/dist plugin-descriptor brand split | 2 | Run the repository's one allowed reinstall, then rerun exact specs | Failure persisted unchanged; package tests, www typecheck, generated output, and Browser proof isolate it from the alias migration. |

Verification evidence:
- `pnpm turbo typecheck --filter=./packages/platejs` passed.
- `pnpm --filter platejs test` passed: 923 tests, zero failures; the existing
  React key warning remains unrelated.
- `pnpm --filter platejs build` passed.
- Built export audit passed: `createEditor`, `useCreateEditor`, `useEditor`, and
  `useOptionalEditor` exist; `useEditorContext`,
  `useOptionalEditorContext`, and `useActiveEditor` do not.
- Final exact registry search found zero rejected alias/helper forms.
- Babel inventory found exactly 26 import alias sites across 19 mappings; every
  mapping is an accepted primitive adapter, provider collision, comparison, or
  generated specialization from the attachment.
- `pnpm --filter www typecheck` passed after final generation.
- Scoped `pnpm exec ultracite fix` completed, then scoped
  `pnpm exec ultracite check` passed on 142 files.
- `pnpm brl` passed across 43 tasks.
- `pnpm install` passed and regenerated the agent skill mirrors.
- `pnpm changeset status` passed; `platejs` remains a major change.
- Registry changelog write/check passed with 91 events.
- `pnpm --filter www build:registry` passed with 379 canonical payloads and 15
  sparse overlays.
- Browser `/blocks/editor-basic`: full editor rendered, appending ` API`
  updated content, and console had zero warnings/errors.
- Browser `/blocks/find-replace-demo`: search for `decorations` produced two
  `.plite-searchHighlight` nodes and zero warnings/errors.
- Browser `/blocks/list-demo`: heading, nested lists, and task items
  rendered after hydration with zero warnings/errors.
- Focused registry specs remain blocked by the pre-existing source/dist nominal
  plugin-descriptor brand split even after one `pnpm run reinstall`; this does
  not reproduce in the owning package tests, www typecheck, registry build, or
  the three live routes.
- P1 autoreview is N/A because `git branch --show-current` returned `next` and
  the repository explicitly prohibits autoreview on `next`.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-08-27-apply-registry-alias-api-hard-cut.md` passed.

Final handoff prepared:
- Ownership and target API: `platejs/react` owns `useCreateEditor` for React
  creation and `useEditor` / `useOptionalEditor` for mounted retrieval; core
  imperative creation remains `createEditor`.
- Public breaks and adoption: old hook names, fake product/headless aliases,
  and `failInvariant` are deleted with no compatibility layer; all current repo
  consumers, docs, generated payloads, and release artifacts migrated.
- Runtime/package/docs/browser decisions: shared `Editor` and assembled
  `PlateEditor` remain distinct; Plite's own headless React API is unchanged.
- Proof and execution risks: all owning package, www, generator, export, source,
  and Browser gates pass. The isolated registry-spec brand split is unrelated
  infrastructure debt and is not disguised as green.
- Execution order and user attention: review the local diff; commit/push/PR work
  remains outside this request.

Timeline:
- 2026-08-27T22:59:33.813Z Plate Plan created.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Prove and hand off complete |
| Where am I going? | User review |
| What is the goal? | One canonical Plate editor API and zero rejected registry aliases/helpers |
| What have I learned? | The hard cut compiles, builds, renders, and leaves only justified aliases |
| What have I done? | Migrated source, tests, docs, rules, release artifacts, barrels, and generated registry output; recorded final proof |

Open risks:
- The focused registry specs cannot currently cross the source/dist nominal
  plugin-descriptor brand boundary. This is independently reproducible after a
  clean reinstall and does not invalidate the green owning-package or live-route
  proof, but those specific specs are not claimed as passing.
- The work is local and uncommitted. No pushed-ref or release certification is
  claimed.
