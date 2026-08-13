# descriptor owned renderer props hard cut

Objective:
Hard-cut renderer component prop aliases to plugin descriptors while retaining
raw node generics only in lower-level renderer contracts.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-13-descriptor-owned-renderer-props-hard-cut.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- docs
- agent-native
- package-api
- browser

Mode:
- `standard`

Completion threshold:
- `PlateElementProps`, `PlateLeafProps`, `PlateTextProps`, and all static
  `Plite*` equivalents accept one required plugin descriptor and no raw
  `Element` / `Text` input.
- All production consumers use an owner descriptor, a descriptor union, an
  inferred wrapper callback, or the node-level `Render*Props` contract.
- Core build, focused renderer tests, doctrine sync, changeset classification,
  source audits, and `check-complete` pass. P2 autoreview must complete or have
  an exact external-tool blocker plus a clean scoped manual P2 review.

Verification surface:
- Source audits over all six public prop aliases and every production consumer.
- Focused Core type tests proving descriptor acceptance and raw-node rejection.
- Source-first Core plus affected package/app typechecks and lint.
- Generated skill sync after `.agents/rules/best-api.mdc` repair.
- Browser waiver or route proof based on whether the final diff changes runtime
  output; the target is a compile-time-only API hard cut.

Constraints:
- The user accepted the exact target in chat and instructed execution with
  `go`; execute continuously without another approval stop.
- No public compatibility aliases or runtime shims.
- Do not force fake node-plugin owners onto arbitrary renderer infrastructure.
- Preserve runtime rendering behavior and component output.
- Do not modify templates; fix registry/package owners when adoption reaches
  generated consumers.

Boundaries:
- In scope: Core public renderer prop aliases, Core internal renderer plumbing,
  all live package/app/docs consumers, type tests, release prose, API doctrine,
  and generated skill mirrors.
- Source owners: `packages/core`, consuming `packages/**` and `apps/www/**`,
  `.agents/rules/best-api.mdc`, and `docs/vision/plate.md`.
- Non-goals: runtime renderer redesign, plugin schema redesign, component UI
  changes, template edits, or compatibility overloads.
- Direct Plite boundary owners: raw `Element` / `Text` node contracts remain in
  existing `RenderElementProps`, `RenderLeafProps`, and `RenderTextProps`.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Stop only if the descriptor-only contract cannot type an existing real plugin
  renderer without erasing inference or if the same owning compiler blocker
  recurs three times with no narrower source fix.

Plate Plan state:
- status: complete
- phase: prove-and-hand-off
- next: user-review
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Plugin-only public props; node-only lower-level render contracts; required generic; no compatibility path; preserve runtime output |
| Active goal and plan verified | yes | Active goal points to this exact plan |
| Current owners read | yes | Core live/static prop aliases, plugin render-field types, type tests, Vision, source rule, and bounded consumer file list |
| Best API target resolved | yes | `best-api review`: one generic must mean one owner; plugin descriptor wins for plugin component props |
| Mode and execution boundary resolved | yes | Standard one-shot execution authorized by the user's `go` after target acceptance |
| Docs pack selected | yes | Internal doctrine and API reference examples are in scope |
| `docs-creator` loaded | no | N/A: public tutorial authoring is not the owner; this is current API adoption plus internal Vision doctrine |
| Docs lane selected | yes | Current-state API reference and internal Vision only; no changelog voice |
| Target docs and nearest sibling docs read | yes | `docs/vision/plate.md`, `docs/vision/common.md`, and live prop API references |
| Docs style doctrine read | yes | Root `AGENTS.md`, `VISION.md`, and current-state docs law |
| Documented source owner identified | yes | Core exported types are authoritative; docs follow those types |
| Agent-native pack selected | yes | `.agents/rules/best-api.mdc` reusable doctrine repair |
| Agent-facing action surface identified | yes | Future `best-api` renderer-prop reviews must reject raw node inputs |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/best-api.mdc`; sync `.agents/skills/**` through `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded `.agents/skills/agent-native-reviewer/SKILL.md`; final parity review required |
| Package/API pack selected | yes | `@platejs/core` public TypeScript surface changes |
| Public surface or package boundary identified | yes | Six exported Core renderer prop aliases plus their production consumers |
| Release artifact path selected | yes | `.changeset` required if the raw-node/default form exists on `main`; verify baseline before authoring |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded `.agents/skills/changeset/SKILL.md` |
| Barrel/export impact decision recorded | yes | No export name/file movement expected; rerun `pnpm brl` only if implementation changes exports |
| Browser pack selected | yes | Compile-time API adoption touches registry source but targets no runtime output change |
| Browser route / app surface identified | yes | Use one affected registry demo only if final diff changes runtime JSX; otherwise record a compile-time-only waiver |
| Browser tool decision recorded | yes | Browser is preferred if runtime output changes; source/type proof is stronger for type-only hard cut |
| Console/network caveat policy recorded | yes | N/A only when final source diff is type-only and rendered output is unchanged |

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
| Binary readiness | pass | Resolve every readiness condition | Required API, adoption, doctrine, release, and proof work is complete |
| Fresh source evidence | pass | Recheck decision-changing current claims | Final source audit and narrow diff review completed after the last fix |
| Best API review | pass | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Descriptor-only owner law accepted; no compatibility overload retained |
| Conditional risk and adoption | pass | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | All production call sites adopted; browser blocker recorded below |
| Verification recorded | pass | Record fresh planning proof and exact execution gates | Exact commands and results are in Verification evidence |
| Handoff prepared | pass | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff section is complete |
| P2 autoreview | blocked-external | Run with `--max-priority P2` for implementation changes; P3 is opt-in only, or record planning-only N/A | Two five-pass helper runs passed TruffleHog and advanced through multiple passes, then stalled on remote inference; scoped manual P2 found and fixed heading `className` precedence, then completed clean |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-13-descriptor-owned-renderer-props-hard-cut.md` | Run after this ledger update |
| Docs source-backed claim audit | pass | Verify docs claims against current source or record N/A | All examples use current descriptor or `Render*Props` contracts |
| Docs links / routes / previews | pass | Verify leaf links, routes, anchors, and preview names or record N/A | No links/routes/previews added; existing leaf links unchanged |
| Docs MDX/content parser | pass | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | Passed after final docs fix |
| Plugin page specifics | pass | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | Existing focused plugin examples were updated in current-state voice; no new plugin page structure |
| Agent source / generated sync | pass | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` passed; source rule and installed `best-api` mirror contain the same law |
| Agent action discoverability | pass | Source-audit the skill/rule path an agent will read | `rg` finds descriptor-only law in source rule and generated skill |
| Agent-native review | pass | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Capability route `best-api` -> source rule -> generated skill -> `pnpm install` is complete; no gaps |
| Public API / package boundary proof | pass | Source-audit public API, exports, and package boundary impact | Six existing exports retain names and move to required descriptor ownership; lower-level contracts remain exported |
| Release artifact classification | pass | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published `@platejs/core` type API hard cut |
| Published package changeset | pass | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Existing `.changeset/plugin-portal-scoped-api.md` owns `@platejs/core: major` and now states the renderer-prop migration |
| Registry changelog | N/A | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | Not registry-only; registry edits are adoption of the Core break |
| No release artifact | N/A | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | A published type break exists, so the Core major changeset applies |
| Package typecheck/build/test | pass-with-known-blocker | Run owning package checks or record N/A with reason | Core build and 23 focused tests pass; contract typecheck reaches only pre-existing `plite-react/src/plugin/with-react.ts:178` TS2352 |
| Barrel/export generation | N/A | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | Export names and exported file layout are unchanged |
| Browser interaction proof | blocked-unrelated | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | `/blocks/list-classic-demo` returned 500 because `apps/www/src/__registry__/index.tsx` imports missing `registry/components/editor/plate-types.ts` |
| Browser console/network check | pass-with-blocker | Record console/network state or why it is not applicable | Console exposed only the same module-not-found route blocker before UI render |
| Browser final proof artifact | N/A | Record screenshot/trace/route/native proof or exact caveat | No screenshot can prove a route that fails before render; compile/test and behavior-preserving diff proof cover this type-only API cut |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Live Core owners, doctrine, and consumer manifest read | Decide |
| Decide | completed | Accepted plugin-only public prop contract | Prove |
| Prove and hand off | completed | Core build/tests, docs checks, adoption audit, manual P2 review, and exact blockers recorded | User review |

Decision brief:
- outcome: one unambiguous plugin-owned component prop API.
- chosen shape: required descriptor generic on all six `Plate*Props` and
  `Plite*Props`; raw node types remain on lower-level `Render*Props` only.
- strongest rejected alternative: keep a descriptor-or-node union for generic
  wrappers; rejected because one type argument changes ownership and context
  semantics.
- consequence: generic wrappers migrate to inferred wrapper callbacks or
  node-level render contracts; plugin renderers pass their owner descriptor.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Plugin component props | Optional descriptor-or-node generic plus second context generic | One required descriptor, with node and context inferred from it | Core React/static components | One parameter has one meaning and preserves portal inference | Sweep packages, registry, docs, tests | Core typecheck plus negative type tests | Broad compile adoption | rearchitect |
| Generic renderer plumbing | Reuses plugin component aliases with raw `Element`/`Text` | Existing `RenderElementProps` / `RenderLeafProps` / `RenderTextProps` or inferred wrapper callbacks | Core renderer/plugin fields | Arbitrary nodes have no honest feature-plugin owner | Refactor Core private types and generic app wrappers | Core and www typechecks | Accidental context loss if composed incorrectly | move |
| Reusable doctrine | Allows raw node generics for erased code | Public plugin props are descriptor-only; raw node work uses `Render*Props` | `best-api` plus Plate Vision | Prevents the union from returning | Source rule and generated mirror sync | `pnpm install` plus source audit | Generated mirror drift | rearchitect |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| Core contract | `packages/core` | Public aliases, private primitive types, plugin render fields, compile-only tests | Accepted target and live source | No raw node/default public form compiles | Core typecheck and focused type tests |
| Consumer adoption | Packages, registry, content | Replace every bare/raw node prop alias with owner descriptor, descriptor union, inferred wrapper, or `Render*Props` | Core contract compiles | Zero stale forms outside intentional lower-level contracts | Consumer/app typechecks plus `rg` audit |
| Doctrine/release | Rule, Vision, docs, changeset | Repair durable rule and current API examples; classify release delta from `main` | Final source shape | Rule/docs/release prose teach only final API | `pnpm install`, docs/source audits |
| Closure | All touched owners | Lint, P2 autoreview, agent-native review, conditional browser proof/waiver, checker | Focused proof green | Zero accepted P0-P2 findings and plan checker green | Owning commands and `check-complete` |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Public aliases reject raw nodes and missing generics | Current definitions and type tests | Negative contracts exist for all six aliases; Core declaration build passes | pass |
| Plugin renderers retain exact node and context inference | Descriptor-derived `ElementOf`/`TextOf` and portal config | Existing descriptor inference contracts plus Core build pass | pass |
| Generic wrappers keep arbitrary-node support without fake owners | Existing `Render*Props` and wrapper callback contracts | Production AST audit reports zero missing/raw/multi-generic violations | pass |
| Runtime rendering output is unchanged | Private primitive contracts preserve runtime implementation | 23 renderer tests pass; manual diff review restored heading `className` precedence | pass |

Conditional evidence:
- High-risk scenarios: public type break covered by negative contracts, complete
  adoption audit, Core declaration build, and a major Core changeset.
- External research: N/A; the decision is internal API ownership and current
  repository types are authoritative.
- Issue/PR provenance: N/A; user-directed local architecture hard cut.
- Docs/registry/browser/release/behavior-law owners: current docs, registry
  consumers, Core changeset, Plate Vision, and `best-api` source rule updated.

Findings:
- Public plugin component prop aliases previously accepted either a raw node or
  a descriptor and exposed an optional second context generic. One type
  parameter therefore changed ownership meaning.
- Static and React wrapper callbacks are schema-agnostic infrastructure. Their
  honest owner is `Render*Props` plus plugin context, not a fake node plugin.
- The first refactor accidentally reversed heading `className` precedence.
  Scoped manual P2 review found it; final JSX preserves the original spread
  order.
- Static wrappers require `path`; the lower-level replacement initially made it
  optional. `RenderStaticNodeWrapperProps` now restores required `path`.

Decisions and tradeoffs:
- Public `Plate*Props` and `Plite*Props` accept exactly one required descriptor.
- Raw node ownership remains available only through lower-level `Render*Props`.
- Presentation-only families may use descriptor unions; forwarding a full
  plugin context keeps one exact owner.
- No compatibility aliases, defaults, or overloads remain.

Review fixes:
- Restored required static-wrapper `path` after narrow source review.
- Restored heading `className` spread precedence after scoped manual P2 review.
- Corrected the Chinese migration example's import and stray quote.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Core contract typecheck stops at unrelated `packages/plite-react/src/plugin/with-react.ts:178` TS2352 | 1 | Prove Core declarations with package build and confirm no renderer-prop diagnostic | Core build passes; blocker recorded |
| Browser route fails before render on missing `registry/components/editor/plate-types.ts` | 1 | Keep source scoped; use package/docs/renderer proof | Exact 500 blocker recorded; no unrelated repair |
| P2 autoreview remote inference stalls in a five-pass 1.8-1.9 MB shared-checkout bundle | 2 | Retry medium/no-web, then perform scoped manual P2 review | Both retries passed TruffleHog and advanced; manual P2 found/fixed one regression and completed clean |
| TypeScript 7 package exposes no compiler API for the first AST audit | 1 | Use Babel TypeScript parser and separately audit its seven unsupported Plite syntax files | Zero production violations; unsupported files contain none of the six aliases |

Verification evidence:
- `pnpm --filter @platejs/core build`: pass.
- `bun test` on live/static renderer files: 23 pass, 0 fail; one existing React
  key warning remains non-failing.
- `pnpm exec biome check` on 18 affected TypeScript files: pass.
- `pnpm --filter www build:source`: pass.
- `pnpm --filter www api-reference:check`: pass.
- Production AST audit: zero missing, raw-node, or multi-generic uses; seven
  parser-skipped Plite files contain no alias references.
- `git diff --check` on the complete task file set: pass.
- `pnpm install`: pass; generated `best-api` skill mirror synced.
- `pnpm --filter @platejs/core typecheck:contracts`: blocked only by the known
  unrelated `plite-react/src/plugin/with-react.ts:178` TS2352.
- Browser: target route blocked before render by missing unrelated registry
  source; console records the same module-not-found error.
- Agent-native capability map: `best-api` route -> `.agents/rules/best-api.mdc`
  -> `.agents/skills/best-api/SKILL.md` -> `pnpm install`; pass.

Final handoff prepared:
- Ownership and target API: Core owns six required descriptor-only aliases;
  generic renderer infrastructure owns raw node contracts.
- Public breaks and adoption: no default, raw node, or context generic remains;
  every production call site is migrated.
- Applicable runtime/package/docs/browser decisions: Core major changeset,
  current docs, Plate Vision, and `best-api` doctrine are aligned; browser route
  is blocked by unrelated missing source.
- Proof and execution risks: declarations, renderer tests, docs checks, lint,
  audits, and diff checks pass; full contract typecheck and external P2 review
  retain the exact unrelated/external blockers above.
- Execution order and user attention: implementation is complete; only the
  shared checkout's unrelated Plite type error and missing registry source need
  their owning tasks.

Timeline:
- 2026-08-13T09:17:40.087Z Plate Plan created.
- 2026-08-13 Core aliases hard-cut, production consumers and docs adopted,
  doctrine/release prose synced, focused proof passed, external-review and
  browser blockers recorded, and manual P2 findings repaired.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Complete |
| Where am I going? | User handoff |
| What is the goal? | Make public renderer component props descriptor-owned and unambiguous |
| What have I learned? | Wrapper infrastructure needs raw render contracts; plugin components need exact owners |
| What have I done? | Hard cut Core, migrated consumers/docs, repaired doctrine/release prose, and proved the final shape |

Open risks:
- External P2 autoreview never returned a full five-pass verdict because remote
  inference stalled twice. The scoped manual P2 pass is clean after fixing its
  two findings.
- Browser rendering remains unobserved until the unrelated missing registry
  `plate-types.ts` owner is repaired.
