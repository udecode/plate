# plate-next react family colocation

Objective:
Encode React family colocation and consolidate Link React; done when sibling
component/hook files merge into family owners with exports/behavior preserved
and proof green.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-22-plate-next-react-family-colocation.md

Template:
docs/plans/templates/architecture-cleanup.md

Primary template:
docs/plans/templates/architecture-cleanup.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)
- package-api (docs/plans/templates/packs/package-api.md)
- browser (docs/plans/templates/packs/browser.md)

Cleanup source:
- type: explicit user correction to Plate Next doctrine and current code
- id / link: `packages/link/src/react` and the named Plate Next skill
- title: React component-family and hook-family colocation
- requested surface: Plate Next rule/template/generated skill plus the React
  surface of the current `find-replace`, `link`, and `suggestion` package batch
- cleanup intent: one file per durable React family, not one file per sibling
  component or hook; sibling reuse inside a family does not establish a new
  owner
- acceptance criteria: Link floating components live in `FloatingLink.tsx`,
  floating hooks live in `useFloatingLink.ts`, unrelated durable hook families
  remain separate, nested component/hook barrels disappear, and the 25 current
  public React declarations and behavior remain available

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A
- initial confidence / cleanliness score: 58/100: behavior is proved but the
  floating-link family requires eight behavior files plus two nested barrels
- improvement loop: merge by durable family, regenerate barrels, run exact
  export/topology audits, focused package proof, Browser proof, and autoreview
- final score / loop closure: target 100/100 with two family files, no nested
  React taxonomy folders, unchanged public declarations, and all gates green

Completion threshold:
- `.agents/rules/plate-next.mdc`, `docs/plans/templates/plate-next.md`, and the
  generated Plate Next skill state that component families and hook families
  are the file-level owners; sibling use inside one family is not independent
  reuse; file size does not justify another split.
- `packages/link/src/react` contains `FloatingLink.tsx`,
  `useFloatingLink.ts`, `useLink.ts`, and `useLinkToolbarButton.ts` beside
  `LinkPlugin.tsx`; the old `components/FloatingLink/**` and `components/**`
  file graph is deleted.
- The baseline 25 exported React declarations remain exported from
  `@platejs/link/react`; behavior and UI output stay unchanged.
- Source audit, `pnpm brl`, Link typecheck/test/build/lint, relevant app
  proof, agent-native review, autoreview, and final plan check pass. Broad app
  typecheck and Browser proof may close with an exact unrelated current-tree
  blocker when the Link package and direct consumers remain green.
- Architecture-cleanup closure is legal only when source map, deslop inventory,
  candidate matrix, agent-navigation score, packet ledger, proof evidence,
  changed list, and final handoff are complete or explicitly N/A, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-plate-next-react-family-colocation.md`
  passes.

Verification surface:
- source audit: exact Link React file manifest, no nested
  `components|hooks|utils` taxonomy directories, and a 25-declaration export
  comparison before/after
- focused proof: `pnpm turbo typecheck --filter=./packages/link`,
  `pnpm --filter @platejs/link test`, focused Link rule tests,
  `pnpm --filter @platejs/link build`, package lint, `pnpm brl`, direct
  registry/docs checks, and `pnpm --filter www typecheck`
- Browser: `/blocks/link-demo`; render the editor, exercise the link toolbar
  flow, inspect console/network, and capture final visual proof
- workflow: `pnpm install` regenerates the skill; source audit proves the
  generated skill contains the family rule; agent-native review and autoreview

Constraints:
- Do not split files because they are large.
- Prefer delete, merge, inline, or simplify over extraction when that improves
  comprehension.
- Preserve product UX and behavior under each cleanup packet. The already
  scoped v54 hard cut may remove standalone helper exports only through its
  owning major changeset and migrated editor/plugin API consumers.
- Focused proof comes before broad proof.
- No dirty speculative work at handoff: keep, revert, or quarantine.
- Preserve all 25 current public `@platejs/link/react` declaration names and
  runtime behavior. Standalone transform/trigger helpers move to their plugin
  owners under the existing v54 major changeset.
- No component-per-file or hook-per-file rule. One file owns one durable
  component or hook family and may export the family's composable members.
- A sibling component/hook consumer inside the same family does not count as
  independent reuse. Extract only across families or for a standalone public
  owner.

Boundaries:
- Source of truth: `VISION.md`, `docs/vision/common.md`,
  `docs/vision/plate.md`, `.agents/rules/plate-next.mdc`, live Link React
  source/callers, and the user correction
- Allowed edit scope: `.agents/rules/plate-next.mdc`, generated
  `.agents/skills/plate-next/SKILL.md` via sync only,
  `docs/plans/templates/plate-next.md`, `docs/vision/plate.md`, this plan, and
  Link lib/React/tests plus direct registry/docs consumers. Core edits are
  limited to type-level plugin API and declared transaction-group inference;
  generated barrels only through `pnpm brl`.
- Plite / Plate boundary: React component/hook organization and Link behavior
  remain Plate-owned. Plite runtime is untouched; Core changes only contextual
  callback inference for declared Plate transaction groups.
- Public API boundary: retain all 25 React declaration names and the sole
  `./react` package subpath. Standalone helpers named in
  `.changeset/link-v54-runtime.md` are intentionally replaced by editor/plugin
  APIs; internal source paths are not exported subpaths.
- Browser surface: local www `/blocks/link-demo`
- Package/API surface: `@platejs/link/react`; internal ownership/layout only
- Non-goals: no fourth package review, no hook API redesign, no behavior/UX
  change, no unrelated package migration, and no generated registry edit

Output budget strategy:
- Use exact Link/Plate Next files, capped `sed` reads, filename/count-first
  searches, and package-scoped proof. Exclude generated registry JSON,
  `node_modules`, `.next`, `dist`, and unrelated package trees.

Blocked condition:
- Stop only if preserving the public React declarations requires an API fork,
  family consolidation creates an unavoidable module cycle, or the same
  behavior regression survives three owner-correct fixes.

Cleanup state:
- task_type: architecture-cleanup
- task_complexity: normal
- current_phase: closeout
- current_phase_status: completed
- next_phase: handoff
- goal_status: achieved after final completion check

Current verdict:
- verdict: merge sibling component files into `FloatingLink.tsx`, merge sibling
  hooks into `useFloatingLink.ts`, flatten durable independent hook families,
  keep public declaration names
- cleanliness confidence: 100/100 for the scoped owner graph; broad www and
  Browser proof are independently blocked by concurrent Core export migration
- next owner: package maintainer only if the unrelated www/Core blocker needs
  closure
- keep / revert / quarantine call: keep all five scoped packets; no quarantine
- reason: floating components and hooks have one owner each, Link behavior is
  plugin-owned, callbacks infer from the declared transaction contract, and
  focused proof plus final autoreview are clean

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and record the exact
  N/A reason.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-22-plate-next-react-family-colocation.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Skill update, family-level component/hook ownership, code fix, export/behavior preservation, proof, and handoff are explicit above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `architecture-cleanup` loaded | yes | Full skill read before mutable work |
| Active goal checked or created | yes | New matching goal created with this plan path |
| Source of truth read before analysis | yes | Root/common/Plate vision, supplied Plate Next skill, source rule/template, Link files/exports/callers read |
| VISION fit gate read | yes | Deep-module and Plate component ownership doctrine support family colocation; smallest durable Plate vision owner selected |
| Plite / Plate boundary selected | yes | Plate React product surface only; no substrate change |
| Cleanup surface selected | yes | Current batch React audit with Link as the only over-split implementation |
| Non-goals recorded | yes | No behavior/API redesign, no unrelated package/app edits |
| Output budget strategy recorded | yes | Exact/capped target reads and package proof only |
| Implementation authority decided | yes | User explicitly said update skill then fix; packet is behavior/API neutral |
| Proof strategy selected | yes | Export/topology audits, package checks, www typecheck, Browser, reviews |
| Agent-native pack selected | yes | Agent workflow doctrine and generated skill change |
| Agent-facing action surface identified | yes | Plate Next React cleanup routing and family-owner scoring |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/plate-next.mdc`; sync `.agents/skills/plate-next/SKILL.md` with `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Full reviewer skill read; final capability map required |
| Package/API pack selected | yes | `@platejs/link/react` exported source layout changes |
| Public surface or package boundary identified | yes | Keep all 25 declaration names through `@platejs/link/react` |
| Release artifact path selected | no | N/A: no published user-visible delta; public names, signatures, behavior, and package subpaths remain unchanged |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no release artifact or public delta in this cleanup |
| Barrel/export impact decision recorded | yes | Nested barrels deleted; root React barrel regenerated with `pnpm brl` |
| Browser pack selected | yes | Package rule requires UI-facing proof for touched package code |
| Browser route / app surface identified | yes | Local www `/blocks/link-demo`, link toolbar interaction |
| Browser tool decision recorded | yes | Use in-app Browser; no native Chrome/OS behavior involved |
| Console/network caveat policy recorded | yes | Inspect console and failed network entries; distinguish Browser-injected warnings explicitly |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Source map records largest files, owner files, package exports, public /
      private boundaries, tests, and proof owners for the surface.
- [x] Deslop inventory records wrappers, pass-through modules, duplicate
      helpers, vague names, stale compatibility, over-broad barrels, orphan
      tests, and stale source-owner oracles.
- [x] Candidate matrix ranks at least five candidates unless the prompt names a
      smaller surface.
- [x] Every candidate has a decision: delete, merge, inline, simplify, split,
      keep, defer, reject, or plan.
- [x] Every candidate records an agent-navigation score: files-to-read,
      owners-touched, proof clarity, public/private clarity, and net effect.
- [x] Anti-confetti rule applied: no split is accepted without durable owner,
      stable name, focused proof, and lower future navigation cost.
- [x] Merge/delete/inline are considered as seriously as extraction.
- [x] VISION fit is recorded; missing reusable taste routes to `vision` or
      `sync-vision`.
- [x] Implementation packets are narrow, reversible, and behavior-preserving;
      the intentional standalone-helper hard cut is owned by the existing major
      changeset and migrated consumers.
- [x] Each implementation packet ends keep, revert, or quarantine.
- [x] Source-owner oracles moved with ownership: LinkRules, BaseLinkPlugin,
      LinkPlugin, Core callback-inference, and registry tests cover their owners.
- [x] Focused proof ran before broad proof for changed code.
- [x] Broad proof ran after import churn; current unrelated www failures are
      recorded exactly below.
- [x] Workspace authority recorded: all shell proof ran in
      `/Users/zbeyens/git/plate-2`; Browser used the local www route.
- [x] Output budget discipline followed: exact paths, capped reads, manifest
      counts, and a 283K scoped review bundle replaced checkout-wide review.
- [x] Agent-native pack: `.agents/rules/plate-next.mdc` was edited as source.
- [x] Agent-native pack: component/hook-family ownership is directly
      discoverable in the rule and generated skill.
- [x] Agent-native pack: `pnpm install` synced the generated skill mirror.
- [x] Agent-native pack: final review returned no accepted/actionable findings.
- [x] Package/API pack: public API, package boundary, exports, and release
      artifact impact are recorded.
- [x] Package/API pack: existing Link major and Core major changesets own the
      published hard cut and callback inference.
- [x] Package/API pack: changeset prose is current-state migration guidance and
      no forbidden minor bump was introduced.
- [x] Package/API pack: registry-only workflow is N/A because registry edits
      only repair a test consumer for a package change.
- [x] Package/API pack: no-artifact path is N/A because existing package
      changesets apply.
- [x] Package/API pack: compatibility/hard-cut decision is explicit in
      `.changeset/link-v54-runtime.md`.
- [x] Package/API pack: Core and Link typecheck/test/build proof is recorded.
- [x] Package/API pack: `pnpm brl` regenerated/verified all package barrels.
- [x] Browser pack: route `/blocks/link-demo`, link toolbar interaction, and
      expected editor render were selected before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: the route returned 500 before Link loaded; missing unrelated
      Core React exports are recorded as the exact console/build blocker.
- [x] Browser pack: screenshot is waived because the app route cannot compile;
      Chrome/Computer cannot bypass a server-side module-export failure.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named focused and workflow proof | Green except exact unrelated www/Browser blockers below |
| Source map complete | yes | Record owners, sizes, exports, tests, proof owners | 9 flat React files; 177-line component owner, 355-line hook owner, 196-line React plugin, 857-line base plugin |
| Deslop inventory complete | yes | Record stale/duplicated/over-split surfaces | 21 obsolete files, nested barrels, standalone helpers, and duplicated generic annotations identified |
| Candidate matrix complete | yes | Rank facts/actions/owners/proof | Seven decisions recorded below |
| Agent-navigation score complete | yes | Record before/after navigation cost | Floating workflow 10 implementation/barrel files to 2 family owners; React tree flattened to 9 files |
| Anti-confetti gate | yes | Reject unjustified splits | No split accepted; no line ceiling |
| Delete / merge / inline gate | yes | Record simplification decisions | Counts and packet ledger below |
| VISION fit gate | yes | Confirm durable taste owner | Plate vision updated with family ownership |
| Implementation packet gate | yes | Record disposition/proof | Five packets kept; none reverted/quarantined |
| Source-owner oracle gate | yes | Repair owner tests | LinkRules, LinkPlugin, BaseLinkPlugin, Core, and registry tests green |
| Public API / behavior safety gate | yes | Prove intended surface and behavior | 25 React declarations preserved; hard cut owned by Link major changeset; regressions covered |
| Package/API proof | yes | Run package/export/type/build proof | Core/Link proof and 56/56 barrels green |
| Browser proof | yes | Exercise route or record exact blocker | `/blocks/link-demo` cannot compile because unrelated Core React exports are absent |
| Final lint/check | yes | Run focused lint/typecheck/test | Core/Link lint/type/test/build green |
| Output budget discipline | yes | Bound searches/review | Exact audits and scoped 283K autoreview bundle |
| Timed checkpoint | no | N/A: no duration requested | N/A |
| Final handoff contract | yes | Fill closeout sections | Complete below |
| Goal plan complete | yes | Run final checker | Final command runs after this ledger update |
| Agent source / generated sync | yes | Run `pnpm install` and audit | Synced rule to generated skill |
| Agent action discoverability | yes | Audit rule and skill | Family doctrine appears in both owners |
| Agent-native review | yes | Close findings | Capability map complete; final autoreview clean |
| Public API / package boundary proof | yes | Audit exports/imports | 25 declarations; no stale deep helper imports |
| Release artifact classification | yes | Classify package delta | Link major hard cut and Core major inference delta |
| Published package changeset | yes | Own package deltas | Existing Link/Core major changesets updated; no forbidden minor |
| Registry changelog | no | N/A: not registry-only | Registry change is test adaptation for package API |
| No release artifact | no | N/A: package artifacts apply | Existing changesets own release delta |
| Package typecheck/build/test | yes | Run owning checks | Green; exact commands below |
| Barrel/export generation | yes | Run `pnpm brl` | 56/56 tasks green |
| Browser interaction proof | yes | Exercise route or record blocker | Route attempted twice; server-side export failure precedes Link UI |
| Browser console/network check | yes | Record state | 500/module-export errors recorded; Link interaction unreachable |
| Browser final proof artifact | yes | Capture or waive exactly | Visual capture waived because route never compiled |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | User correction, three vision files, skills, live source/callers/exports read | source map |
| Source map | completed | 25 exports; final owners are LinkPlugin 196 lines, floating hooks 355 lines, floating components 177 lines; nested barrels removed | deslop inventory |
| Deslop inventory | completed | Eight family behavior files plus two taxonomy barrels; sibling use mistaken for separate ownership | candidate matrix |
| Candidate matrix | completed | Seven source-backed rows below | cleanup packets / owner routing |
| Cleanup packets / owner routing | completed | Five packets kept; 21 obsolete files removed; owner APIs and callers migrated | verification |
| Verification | completed | Core/Link/direct consumer proof green; www/Browser blockers classified; autoreview clean | closeout |
| Closeout | completed | Counts, evidence, risks, and next owner recorded | final response |

Candidate matrix:
| Rank | Strength | Candidate | Files | Facts | Navigation score | Recommendation | Owner | Proof | Decision |
|------|----------|-----------|-------|-------|------------------|----------------|-------|-------|----------|
| 1 | Strong | Floating-link hook family | five `useFloatingLink*.ts` files | Edit/insert/enter/escape/virtual are one workflow; sibling reuse is internal composition | 5 behavior files -> 1; one owner; clearer proof | merge all into `useFloatingLink.ts`; inline one-use Enter body | floating-link hook family | 25-export audit, package tests/typecheck/build | merge |
| 2 | Strong | Floating-link component family | three component files | URL/new-tab/open primitives are one exported component family | 3 behavior files -> 1; one owner | merge into `FloatingLink.tsx` | floating-link component family | package tests/typecheck/build and Browser | merge |
| 3 | Strong | Nested taxonomy barrels | two `components/**/index.ts` files | They only forward one family graph; package exports only `./react` | 2 barrel hops -> 0 | delete and regenerate root barrel | React package root | `pnpm brl`, build export audit | delete |
| 4 | Strong | `useLink` family | `components/useLink.ts` | Independent link-element hook public API | same one file, shorter path after flatten | move unchanged to React root | link-element hook family | export audit/typecheck | keep/move |
| 5 | Strong | toolbar-button hook family | `components/useLinkToolbarButton.ts` | Independent toolbar action hook public API | same one file, shorter path after flatten | move unchanged to React root | toolbar-button hook family | export audit/typecheck | keep/move |
| 6 | Strong | Plate Next doctrine | source rule, plan template, generated skill, Plate vision | Existing text says each hook gets a hook file and misses family-level reuse | recurring agent path becomes explicit | encode component/hook family ownership and sibling-reuse rejection | Plate Next + Plate vision | `pnpm install`, exact source audit, agent-native review | simplify |
| 7 | Strong | Other current-batch React roots | find-replace has none; suggestion has one plugin file | No sibling component/hook graph exists | already minimal | keep unchanged | package owners | file manifest audit | keep |

Packet ledger:
| Packet | Action | Owner | Files | Proof | Result | Next |
|--------|--------|-------|-------|-------|--------|------|
| Doctrine | simplify | Plate Next rule + Plate vision | rule, generated skill, plan template, Plate vision | `pnpm install`; exact doctrine audit | keep | apply family rule |
| React families | merge/delete | `FloatingLink.tsx`, `useFloatingLink.ts`, durable root hooks | Link React graph | 9-file flat manifest; 25 exports; Link proof | keep | plugin helpers |
| Link behavior | inline/delete | `BaseLinkPlugin`, `LinkPlugin` | rules, transforms, queries, floating actions, tests | Link tests; 11/11 LinkRules rows; build/typecheck | keep | inference |
| Callback inference | simplify | Core plugin generic owners | PluginConfig, BasePlugin, PlatePlugin, two specs | Core typecheck/contracts and focused tests | keep | consumer proof |
| Review fixes | repair | direct source consumers and behavior oracles | registry test, Link docs, LinkRules code/spec | 4/4 registry rows; docs checks; final clean autoreview | keep | closeout |

Cleanup counts:
- delete: 21 obsolete Link source files, including 20 React helper/barrel files
- merge: 3 owner families: floating components, floating hooks, and Link rules
- inline: 2 helper families: base Link behavior and floating Link actions
- simplify: 2 surfaces: React/root export topology and declared tx inference
- split: 0
- keep: 5 implementation packets; 3 durable independent React owners remain
- defer: 0 scoped candidates
- reject: 1 stale reviewer suggestion (`select` is not a current Plite
  fragment option; exact cursor proof is green)
- plan: 0 follow-up architecture packets

Changed list:
- code/runtime/API: Link React flattened to nine root files; Link helpers moved
  into BaseLinkPlugin/LinkPlugin; Core infers declared explicit tx groups and
  preserves extended plugin API types
- tests/oracles: split Link owner tests, expanded-code-block paste regression,
  exact markdown cursor regression, Core Base/React declared-group inference,
  registry LinkElement portal stub
- docs/plans: Plate vision, Plate Next template, Link input-rule import, this
  architecture-cleanup ledger, Link/Core changesets
- skills/workflow: Plate Next source rule plus generated skill mirror
- reverted/quarantined: required `AnyPluginConfig.pluginApi` experiment was
  reverted to optional after proving it broke heterogeneous configs; nothing
  quarantined

Needs review:
- none. Final scoped autoreview exited clean with no accepted/actionable
  findings.

Open risks:
- No scoped Link owner risk remains. Current-tree www typecheck and Browser
  proof stay unavailable until unrelated Core/Plite registry migration errors
  are repaired; generated public registry JSON remains CI-owned.

Verification evidence:
- `pnpm install`: synced `.agents/rules/plate-next.mdc` to the generated skill.
- Exact doctrine audit: source rule, generated skill, template, and Plate
  vision all state family ownership, sibling reuse rules, and no line ceiling.
- React manifest audit: 9 files, no nested directories; 25 public declaration
  names; no stale `@platejs/link/react/*`, transforms, queries, utils, or
  `api.floatingLink` imports.
- `pnpm brl`: 56/56 package barrel tasks passed.
- `pnpm turbo typecheck --filter=./packages/link`: 13/13 tasks passed.
- `pnpm --filter @platejs/link lint:fix`, `test`, and `build`: passed.
- `bun test ./packages/link/src/lib/LinkRules.spec.tsx`: 11 pass, 0 fail;
  covers code-block paste and post-markdown cursor placement.
- `pnpm --filter @platejs/core lint:fix`, `typecheck`, and focused
  `createBasePlugin`/`createPlatePlugin` tests: passed, including declaration
  contracts.
- `bun test ./apps/www/src/registry/ui/inline-void-suggestion.slow.tsx`: 4
  pass, 0 fail.
- www docs source parity and registry source checks: passed.
- `pnpm --filter www typecheck`: currently blocked outside Link by concurrent
  migration errors including removed Plite `onChange`, removed
  `BelowRootNodes`, discussion/list/media/toggle contract errors, and missing
  table/footnote APIs; the current diagnostic contains no Link error.
- Browser `/blocks/link-demo`: attempted twice; local www returns 500 before
  Link loads because registry packages still import removed
  `@platejs/core/react` exports (`atom`, `createAtomStore`,
  `createZustandStore`, `useElementContext`). No screenshot or Link interaction
  is possible until that unrelated current-tree blocker is repaired.
- Final 283K scoped autoreview: clean, no accepted/actionable findings.

Agent-native capability map:
- User correction -> `plate-next` -> `.agents/rules/plate-next.mdc` ->
  `pnpm install` -> generated `.agents/skills/plate-next/SKILL.md` -> future
  cleanup scores one component/hook family as one owner.
- Source owner is unambiguous: edit the rule, never the generated skill; the
  generated skill names component-family, hook-family, flat-root, plugin
  helper, and transaction-inference decisions in one discoverable section.
- Navigation effect: a future agent reads two floating family owners instead
  of eight behavior files plus two barrels; public proof stays at the single
  React root barrel and package tests.

Final handoff contract:
- Source roots inspected: Plate Next rule/generated skill/template, Plate
  vision, Link lib/React/tests/exports/callers, Core plugin generic owners,
  direct www/docs consumers.
- Candidate count and top recommendation: 7; merge by durable component/hook
  family and inline plugin-owned helpers.
- Cleanup counts: 21 deletes, 3 merges, 2 inline families, 2 simplifications,
  0 splits/deferred/plans, 1 rejected stale suggestion.
- Agent-navigation score changes: floating implementation/barrel graph 10
  files to 2 family owners; React package surface flat at 9 files.
- Packets applied with keep/revert/quarantine result: 5 keep, 0 revert, 0
  quarantine; one intermediate required-pluginApi experiment reverted before
  packet closure.
- Proof commands/source audits: recorded above; focused package/direct
  consumer gates green, final autoreview clean.
- Rejected/deferred candidates: rejected obsolete `select: true`; no deferred
  scoped cleanup.
- Needs-review list: none.
- Residual risks: www typecheck and Browser route remain blocked by unrelated
  concurrent Core/Plite migration errors; generated public registry JSON is
  CI-owned and was not edited.
- Next owner and exact first command/file: Core/registry maintainer, if desired;
  start with `pnpm --filter www typecheck` and the first missing-export owner in
  `packages/core/src/react/index.ts`.

Timeline:
- 2026-07-22T17:42:47.732Z Architecture-cleanup goal plan created.
- 2026-07-22 Plate Next doctrine synced; Link React/plugin ownership packets
  applied and package proof passed.
- 2026-07-22 Two accepted review cycles repaired direct consumer/docs and
  preserved LinkRules behavior; final autoreview exited clean.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete; final checker and handoff remain |
| Where am I going? | Run the autogoal completion checker, close goal, report |
| What is the goal? | Encode family-level React ownership and apply it to Link without losing public React declarations or behavior |
| What have I learned? | Family ownership cuts navigation sharply; inlined behavior needs direct regression proof, not typecheck alone |
