# Promote view scoped selection ownership

## Superseded target correction

This completed plan is a historical receipt for the rejected
`showInactiveSelection` proposal. A later `best-api` review proved that the exact
Editable can derive activation from its own focus transition, so the durable
contract is `data-plite-keep-selection-visible` plus neutral inactive-selection
output hooks. Plate inherits the mechanics; copied UI owns marker placement and
styles. Every boolean-prop reference below records the superseded review and is
not current doctrine. Implementation and proof belong to
`docs/plans/2026-08-31-native-inactive-selection-focus-marker.md`.

Objective:
Repair inactive-selection ownership doctrine; done when Vision, intersecting
rules, and both active cursor/find plans teach one exact-view API with zero
stale normative plugin ownership.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-31-promote-view-scoped-selection-ownership.md

Template:
docs/plans/templates/sync-vision.md

Primary template:
docs/plans/templates/sync-vision.md

Applied packs:

- agent-native (docs/plans/templates/packs/agent-native.md)

Vision sync source:

- type: direct human correction of a reusable API recommendation
- prompt / scope: promote inactive-selection presentation to its real Plite
  React owner and repair all related planning skills and Vision doctrine
- mode: targeted sync and `best-api repair`
- status source: `docs/sync/vision/status.json`
- base commit: `9e3683771331cd9edcc0dc6e74f3368257ee5bdc`
- target commit: `377a77a537971b793a4ddbb34cc13797fdfeee15`
- run directory: N/A; the full-range collector failed with
  `spawnSync git ENOBUFS`, so this run keeps the baseline unchanged and
  classifies the explicit correction from this bounded source manifest

First checkpoint:

- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:

- Root, Plite, and Plate Vision teach this ownership split: the model owns one
  canonical selection; the exact mounted Editable derives inactive presentation
  from focus; Plate inherits the behavior; copied UI owns marker placement and
  styling.
- `best-api`, `plite-plan`, `plate-plan`, `plate-feature`,
  `plate-plugin-creator`, `plate-ui`, `docs-creator`, and `plate-next` are
  audited, and every intersecting source rule enforces the same split without
  copying an obsolete plugin/kit model.
- Both active cursor/find plans select the literal focus marker and neutral
  inactive-selection output hooks, and delete the editor-global retention
  plugin/kit target.
- The marker identifies an owned focus target only. It never accepts a `Range`,
  owns selection state, changes input/history/clipboard, or exposes the private
  projected-view-selection runtime.
- Generated mirrors match source rules after `pnpm install`, scoped formatting
  and source audits pass, agent-native review is closed, and the final
  `check-complete.mjs` passes.
- Closure is legal only when changed inputs are collected, candidate clusters
  are classified, root/detail vision docs are patched or reaffirmed when
  reusable doctrine exists, owner-routed items have concrete owners, baseline
  advancement semantics are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-promote-view-scoped-selection-ownership.md`
  passes.

Verification surface:

- `node .agents/rules/sync-vision/scripts/collect-vision-diff.mjs --status`
- `node .agents/rules/sync-vision/scripts/collect-vision-diff.mjs`
- source audit of root `VISION.md`, `docs/vision/*.md`, and owner files for
  captured/reaffirmed rules
- JSON parse of `docs/sync/vision/status.json`
- `pnpm install` and mirror audit when `.agents/rules/**` changed
- final `check-complete.mjs`
- bounded `rg` audit across Vision, source rules, generated mirrors, and the
  two active plans for stale normative plugin/kit ownership

Constraints:

- Latest-state doctrine only. No changelog prose in vision docs.
- Root `VISION.md` keeps mandatory essential doctrine. `docs/vision/*.md` gets
  owner detail that should not bloat the mandatory first read.
- Owner-specific execution details stay in owner skills/docs/templates.
- Generated `.agents/skills/**` mirrors are audit surfaces, not doctrine
  sources.

Boundaries:

- Allowed sync inputs: `VISION.md`, `docs/vision/**`, `.agents/AGENTS.md`,
  `.agents/rules/**`, `docs/plans/**`, `docs/sync/**`, `docs/research/**`,
  `docs/plite/**`, `docs/editor-behavior/**`, `docs/solutions/**`,
  `content/docs/**`, and other changed Markdown-like root docs.
- Working-tree overlay includes relevant untracked files, so new doctrine docs,
  plans, or rule files must be visible in artifacts before commit.
- Allowed edits: `VISION.md`, `docs/vision/{plite,plate}.md`, this plan, the two
  active cursor/find plans, intersecting owner `.agents/rules/**`, and generated
  `.agents/skills/**` mirrors produced by `pnpm install`.
- Browser surface: N/A unless a changed decision depends on browser-visible
  proof.
- Non-goals: no runtime product patches, no commits, no PRs, no release claims.

Output budget strategy:

- Use exact-file reads, count-first `rg`, and bounded line slices. Exclude
  generated/build trees except the named generated skill mirrors. The failed
  full-range collector is not retried unchanged; targeted audit evidence stays
  in this plan instead of streaming the historical diff.

Blocked condition:

- Block only if source and generated rule sync cannot be restored, the accepted
  exact-view API conflicts with a hard runtime law, or the bounded owner audit
  cannot distinguish current doctrine from historical evidence.

Sync state:

- current_phase: closeout
- current_phase_status: complete
- next_phase: final handoff
- baseline_advance_policy: keep unchanged; this targeted repair does not
  classify the full committed range since the June baseline
- working_tree_overlay_policy: visible but not baselined
- goal_status: active

Current verdict:

- verdict: promote the renderer law directly; delete the plugin/kit ontology
- confidence: high; bounded source audit and runtime-law review passed
- next owner: `plite-plan` implementation when runtime work is authorized
- reason: selection state is canonical and editor-owned, but whether an
  unfocused selection is painted is scoped to one mounted Editable

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add
  `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until the named verification
  evidence is recorded below and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-promote-view-scoped-selection-ownership.md`
  passes.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Objective, threshold, boundaries, non-goals, deliverables, verification, and handoff requirements are explicit above |
| `sync-vision` source rule read | yes | Read generated mirror sourced from `.agents/rules/sync-vision.mdc` in full before edits |
| `VISION.md` read | yes | Read mandatory root doctrine at target `377a77a5` |
| Active goal checked or created | yes | `get_goal` returned `null`; create the matching goal after this checkpoint |
| `docs/sync/vision/status.json` read | yes | JSON parsed; baseline `9e368377`, no active run |
| Base and target commits resolved | yes | `9e368377` -> `377a77a5` |
| Output budget strategy recorded | yes | Exact-file/count-first strategy recorded above |
| Agent-native pack selected | yes | Materialized `agent-native` pack in this plan |
| Agent-facing action surface identified | yes | Source rules for API judgment, layer planning, plugin/UI execution, docs, and adoption audit |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`; regenerate `.agents/skills/**` with `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Read the complete reviewer skill; source ownership, route, mirror, proof, and discoverability map is recorded below |

Work Checklist:

- [x] First checkpoint complete.
- [x] Short objective, threshold, verification surface, constraints,
      boundaries, and blocked condition are concrete.
- [x] Status JSON parsed and base/target recorded.
- [x] Full-range diff collection is N/A for baseline advancement: the helper
      failed with `spawnSync git ENOBUFS`; this explicit correction uses a
      bounded manifest and keeps `lastSyncedCommit` unchanged.
- [x] Candidate clusters are classified: one reusable cluster is captured and
      owner-routed; no rejected or deferred cluster remains.
- [x] Root `VISION.md` contains the cross-boundary canonical-state versus
      exact-view-presentation law.
- [x] `docs/vision/plite.md` and `docs/vision/plate.md` contain their exact
      runtime and facade/product responsibilities.
- [x] Owner-routed items name concrete API judgment, planning, feature,
      plugin, UI, docs, and adoption-audit owners.
- [x] Baseline advancement decision is recorded: unchanged because the full
      committed range was not classified.
- [x] Generated mirrors are synced after source-rule edits with `pnpm install`.
- [x] Output stayed bounded and artifact-backed by this plan; no broad diff was
      streamed after the collector failure.
- [x] Agent-native pack: source-of-truth rule files were edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors were synced and unique new doctrine phrases appear once in each source/mirror pair.
- [x] Agent-native pack: agent-native review passed with no accepted findings;
      the rejected scope expansions are recorded under Review fixes.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Diff collection | no | Use bounded explicit-correction manifest after full-range collector failure | N/A: `spawnSync git ENOBUFS`; no baseline advancement claim; source refs are in the cluster ledger |
| Candidate classification | yes | Classify every candidate cluster | One captured + owner-routed cluster; no rejected/deferred question |
| Vision doctrine update | yes | Patch or reaffirm root `VISION.md` and relevant `docs/vision/*.md` files | Root, Plite, and Plate Vision patched with latest-state doctrine |
| Owner routing | yes | Route non-vision items to owners or mark N/A | `best-api`, both layer planners/templates, `plate-feature`, plugin/UI/docs workers, Plate Next, and both active plans |
| Baseline advancement | no | Advance or explicitly keep `lastSyncedCommit` | Kept at `9e368377`; targeted overlay is uncommitted and full range was not classified |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed | `pnpm install` completed; Skiller applied rules and synced required resources |
| Status JSON parse | yes | Parse `docs/sync/vision/status.json` | Valid JSON; baseline `9e368377`, `pendingRunDir: null` |
| Final lint | yes | Run stable scoped formatting and whitespace gates | Markdown/JSON Prettier passes; `git diff --check` passes; Skiller canonical `.mdc` output is proved by source/mirror parity and v128 validation |
| Autoreview | no | Run P1 autoreview for implementation changes or record N/A | N/A: doctrine/planning-only repair; `agent-native-reviewer` is the specialized review owner |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-promote-view-scoped-selection-ownership.md` | `[autogoal] complete` |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | Source/mirror phrase audit is 1:1 for all eight changed skills; Plate Next v128 validation passes |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Vision mandatory read plus `best-api`, layer planners, feature/plugin/UI/docs/Plate Next routes all name the action |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | PASS: complete capability map below; no P0-P3 gap in the targeted action |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero | complete | requirements, scope, threshold, goal path, and baseline semantics recorded | collect |
| Collect changed inputs | complete | direct human correction; current source/types/runtime; Vision/rules/plans; prior decision memory | classify |
| Classify candidates | complete | one captured + owner-routed cluster; no deferred question | patch/reaffirm |
| Patch or reaffirm vision docs | complete | root, Plite, and Plate doctrine plus affected owner rules/templates and plans | verify |
| Verify and advance baseline | complete | mirrors synced; v128 valid; stable formatting, stale-name, call-shape, and source/mirror audits pass; baseline explicitly unchanged | closeout |
| Closeout | complete | agent-native review and Unslop audit closed; final handoff is complete below | final response |

Candidate cluster ledger:
| Cluster | Source refs | Classification | Decision | Owner | Vision doc section / reason |
|---------|-------------|----------------|----------|-------|-----------------------------|
| Inactive canonical selection presentation is view-scoped, not editor-global plugin state | user correction; `EditableProps`; `PlateContentProps`; current registry retention plugin; private projected-view-selection consumers; active plans | captured + owner-routed | keep canonical Range private; derive activation from the literal focus marker; expose neutral output hooks; delete plugin/kit/item target | root and Plite/Plate Vision; `best-api`; Plite/Plate planners/templates; `plate-feature`; plugin/UI/docs workers; Plate Next v133 | Root Boundary Law; Plite API Direction; Plate plugin/component doctrine; corrected sections in both active plans |

Findings:

- The earlier registry-only verdict collapsed two different jobs: reusable
  exact-view rendering law and product focus policy. That category error hid a
  missing official React API behind registry plugin state.
- The rejected boolean would have controlled presentation of the editor's live
  canonical selection rather than carrying a second `Range`; the final API
  deletes that redundant control entirely.
- `PlateContentProps` already inherits Plite Editable props and forwards
  non-handler inputs to its inner `Editable`, so Plate needs no second API.
- Private `PliteViewSelection` participates in keyboard, clipboard, history,
  navigation, and reconciliation; reusing it would turn paint into input state.

Decisions and tradeoffs:

- Native derivation beats both a registry plugin and a forwarded boolean:
  `plitejs/react` owns the mounted view law, while copied `Editor` owns marker
  placement, styling, and feature exclusions.
- The full sync baseline stays unchanged because this run does not classify the
  large committed range since June; that does not block the explicit doctrine
  correction.
- Plate Next doctrine v128 makes the new review law tamper-evident without
  mass-attesting either active package.

Agent-native capability map:

| User action                                                    | Agent route                        | Source owner                                          | Mirror / doc                                          | Proof                                                                    | Status |
| -------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------ | ------ |
| Decide whether view-local canonical-state paint earns a plugin | `best-api review/repair`           | `.agents/rules/best-api.mdc`, root/Plite/Plate Vision | `.agents/skills/best-api/SKILL.md`                    | source/mirror phrase audit                                               | pass   |
| Plan the Plite primitive and Plate adoption                    | `plite-plan`, then `plate-plan`    | both source rules and plan templates                  | both generated skills and corrected architecture plan | exact owner/proof rows plus mirror audit                                 | pass   |
| Deliver or audit the cross-layer feature                       | `plate-feature`, `plate-next`      | feature rule/manifest; Plate Next rule/v128 registry  | generated resources and active execution plan         | Plate Next validate plus manifest/routing audit                          | pass   |
| Implement package and copied UI slices                         | `plate-plugin-creator`, `plate-ui` | their source rules                                    | generated skills                                      | discoverability/source audit plus the native implementation plan's package and Browser proof | pass   |
| Teach the shipped API after implementation                     | `docs-creator`                     | `.agents/rules/docs-creator.mdc`                      | generated skill                                       | source/mirror phrase audit; current-state-only gate                      | pass   |

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `collect-vision-diff.mjs --status` failed with `spawnSync git ENOBUFS` | 1 | Use the prompt-scoped bounded manifest; do not retry the same full-range command unchanged | Baseline will remain unchanged and the limitation will be reported |
| Prettier could not infer a parser for `.mdc` files | 1 | Rerun the exact source-rule list with `--parser markdown` | The explicit parser ran and exposed the generator-format conflict below |
| Prettier rewrites Skiller-canonical `.mdc` output, which `pnpm install` restores | 2 | Stop forcing a non-owner formatter over generated canonical layout; use the repo's generation and parity gates | `pnpm install`, 1:1 phrase audits, `version.mjs validate`, standard Markdown/JSON Prettier, and `git diff --check` pass |
| Initial v128 fingerprint became stale after required resource sync | 1 | Recompute from final source/resources, patch only the latest fingerprint, and validate without another source sync | Final `version.mjs validate` passes |

Verification evidence:

- `pnpm install` -> Skiller applied source rules and synced required resources.
- Unique phrase audit -> all eight changed source/generated skill pairs report
  exactly one matching doctrine phrase.
- `node .agents/rules/plate-next/scripts/version.mjs validate` -> Plate Next
  v128 valid with 2 active and 44 retired packages.
- `pnpm exec prettier --check` over changed Markdown/JSON -> pass.
- `git diff --check` over every owned source, mirror, Vision, template, and plan
  path -> pass.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
docs/plans/2026-08-31-promote-view-scoped-selection-ownership.md` ->
  `[autogoal] complete`.
- Stale-name audit -> every surviving `SelectionRetentionPlugin` or
  `SelectionRetentionKit` mention is an explicit deletion target or historical
  receipt; neither active plan teaches it as the target.
- Call-shape audit -> both active plans teach direct marker placement and the
  neutral Plite output hooks; neither teaches a controlled prop or plugin.

Review fixes:

- Agent-native review: PASS. The mandatory Vision route, eight owner routes,
  source/generated boundary, discoverability, and proof commands are complete;
  no P0-P3 finding survived.
- Rejected adding another root routing rule: existing `best-api`, Plite/Plate
  planner, feature, UI, docs, and Plate Next routes already reach the exact
  action. Another route would duplicate ownership.
- Rejected product edits and browser proof in this pass: the user asked to
  promote and repair doctrine/planning owners; runtime implementation remains
  a separately authorized `plite-plan` execution.
- Unslop audit: the goal and both active plans had zero findings. Root/Plite
  Vision title-case headings and two existing em dashes were false positives,
  not prose introduced by this repair.

Final handoff:

- Base -> target: `9e3683771331cd9edcc0dc6e74f3368257ee5bdc` ->
  `377a77a537971b793a4ddbb34cc13797fdfeee15`
- Baseline advanced: no. `lastSyncedCommit` remains `9e368377`; this bounded
  correction does not pretend to classify the full intervening history.
- Run artifacts: no generated run directory. This plan is the bounded source
  manifest, classification ledger, review map, and proof receipt.
- Vision doc changes: root cross-boundary law; Plite exact-view renderer and
  side-effect law; Plate identity proxy plus copied product-policy owner.
- Reaffirmed: Plite owns one canonical selection; private projected view
  selection remains input-engine state and is not a presentation carrier.
- Rejected/noise: registry-only selection-retention ownership, a public copied
  Range, a plugin/store/kit, another Plate API name, and Unslop false positives.
- Owner-routed: `best-api`, `plite-plan`, `plate-plan`, `plate-feature`,
  `plate-plugin-creator`, `plate-ui`, `docs-creator`, Plate Next v128, and both
  active cursor/find plans.
- Deferred questions: none. Runtime implementation is not a doctrine question;
  it is the next authorized execution packet.
- Commands: `pnpm install`; scoped Prettier; scoped `git diff --check`; bounded
  stale-name/call-shape and eight-pair mirror audits;
  `node .agents/rules/plate-next/scripts/version.mjs doctrine-fingerprint`;
  `node .agents/rules/plate-next/scripts/version.mjs validate`; final autogoal
  checker below.

Timeline:

- 2026-08-31T07:46:40.675Z Sync-vision goal plan created.
- 2026-08-31 Checkpoint zero filled from the user correction; root Vision and
  status JSON read; full-range collector failure isolated from targeted repair.
- 2026-08-31 Promoted the exact-view law through Vision, eight source owners,
  two templates, both active plans, generated mirrors, and Plate Next v128.
- 2026-08-31 Closed stable formatting, stale-name, call-shape, mirror,
  agent-native, Unslop, and version-registry proof.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final mechanical goal check |
| Where am I going? | Goal completion and concise handoff |
| What is the goal? | Make exact-view inactive-selection presentation the one durable API law everywhere that plans or teaches it |
| What have I learned? | The plugin/kit shape confuses product activation with reusable view rendering |
| What have I done? | Patched Vision/rules/templates/plans, regenerated mirrors, versioned doctrine, and closed focused audits |

Open risks:

- The full sync-vision historical baseline remains stale because its collector
  exceeded the child-process buffer. This run must not claim baseline
  advancement.
