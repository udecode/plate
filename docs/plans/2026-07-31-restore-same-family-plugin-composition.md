# restore same-family plugin composition

Objective:
Restore ordered same-family plugin composition; done when latest fields win,
foreign same-name plugins still fail, demo syntax is direct, and focused
Core/www/browser gates pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-31-restore-same-family-plugin-composition.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- docs
- agent-native
- browser
- package-api

Mode:
- `standard` accepted-target execution. The user confirmed this is a regression
  and explicitly authorized the fix.

Completion threshold:
- Two enabled user descriptors from one nominal plugin family compose in source
  order; earlier fields survive and later overlapping fields win.
- Repeated identical descriptors remain idempotent; unrelated descriptors that
  merely share a name still throw with exact origin diagnostics.
- The Table No Merge demo uses direct ordered plugin composition, renders a
  table, disables merge, and has no new console/network failures.
- Focused Core tests, Core/www typechecks, docs/checker gates, generated-skill
  validation, autoreview, and `check-complete` pass.

Verification surface:
- Public `createPlateEditor({ plugins })` behavior tests covering exact identity,
  same-family configuration composition, field precedence, and foreign-family
  name collision.
- Core source-first typecheck, focused plugin resolver suite, www typecheck,
  docs/checker validation, changeset validation, generated skill/version checks,
  Biome/diff checks, and autoreview.
- Browser proof at `/blocks/table-nomerge-demo`: rendered table, merge controls
  absent/disabled as the route exposes, zero new console/network failures.

Constraints:
- Preserve source-role precedence (`user > reactCore > baseCore`) and dependency
  topology; change only same-role, same-family duplicate composition.
- Preserve earlier non-overlapping configured fields such as Table component
  bindings while later overlapping fields win.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Preserve unrelated shared WIP and CI-owned registry/template output.

Boundaries:
- In scope: Core root-plugin resolution, focused public behavior tests, Table No
  Merge registry caller, current docs/release/checker/doctrine that teach
  duplicate descriptor semantics, and generated skill mirrors.
- Source owners: `packages/core`, `apps/www/src/registry/examples`, relevant
  `content/docs`, `.changeset`, `.agents/rules`, `VISION.md`, and
  `docs/vision/plate.md`.
- Non-goals: no raw Plite extension change, no plugin naming/config/state API
  redesign, no unrelated registry generation, no package-wide colocation work.
- Direct Plite boundary owners: N/A; duplicate Plate descriptor-family
  composition is Plate Core product compilation over unchanged Plite inputs.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Stop only if same-family composition cannot retain exact descriptor identity,
  configuration precedence, dependency topology, and finite inferred types
  without changing Plite or exposing compatibility machinery.

Plate Plan state:
- status: done
- phase: prove-and-hand-off
- next: none
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Restore the previous idempotent/latest-wins plugin behavior; fix the regression, not the demo around it. |
| Active goal and plan verified | yes | New active goal names this plan and exact binary threshold. |
| Current owners read | yes | Read Table demo/kit, Core resolver/tests, current guide, Best API rule, and Plate Vision owner. |
| Best API target resolved | yes | Same family composes in source order; foreign same-name identity collision still fails. |
| Mode and execution boundary resolved | yes | One-shot execution explicitly authorized by “fix it.” |
| Docs pack selected | yes | Current editor/plugin-method guides teach the rejected collision rule in EN/CN. |
| `docs-creator` loaded | yes | Loaded before editing `content/**`; current-state guide voice applies. |
| Docs lane selected | yes | Existing guide/system references; repair in place, no new page. |
| Target docs and nearest sibling docs read | yes | Read EN/CN editor and plugin-method pages together with their Core source/tests. |
| Docs style doctrine read | yes | Docs Creator loaded; source-backed current-state wording only. |
| Documented source owner identified | yes | Core resolver/tests own runtime truth; editor/plugin-method guides teach it. |
| Agent-native pack selected | yes | Reusable duplicate-plugin doctrine is currently wrong. |
| Agent-facing action surface identified | yes | Agents choosing direct plugin-list configuration versus weak peer overrides. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`; regenerate `.agents/skills/**` with `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded before doctrine repair; final parity review required. |
| Browser pack selected | yes | Registry demo is the real user-facing regression path. |
| Browser route / app surface identified | yes | `/blocks/table-nomerge-demo`. |
| Browser tool decision recorded | yes | Use Browser for route/DOM/console/network proof. |
| Console/network caveat policy recorded | yes | New errors block closure; unrelated existing warnings are recorded exactly. |
| Package/API pack selected | yes | `@platejs/core` plugin resolution behavior changes. |
| Public surface or package boundary identified | yes | `createPlateEditor({ plugins })` duplicate-family semantics in Core. |
| Release artifact path selected | yes | Repair the existing Core-major v54 changeset relative to `origin/main`; do not duplicate it. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded; final prose will describe user-visible ordered composition only. |
| Barrel/export impact decision recorded | yes | No exported file/symbol topology change; `pnpm brl` is N/A unless implementation changes exports. |

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
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
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
| Binary readiness | complete | Resolve every readiness condition | Same-author-lineage configuration composition, exact identity, and collision paths all have focused proof. |
| Fresh source evidence | complete | Recheck decision-changing current claims | Re-read resolver, builder stage/configuration owners, TableKit, and final demo after implementation. |
| Best API review | complete | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Final contract is direct terminal configuration composition; divergent authoring branches fail rather than silently dropping capabilities. |
| Conditional risk and adoption | complete | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Core, registry caller, EN/CN docs, release prose, doctrine, generated mirrors, and Browser route covered. |
| Verification recorded | complete | Record fresh planning proof and exact execution gates | See Verification evidence. |
| Handoff prepared | complete | Prepare concise ownership, breaks, proof, risks, and execution order | See Final handoff prepared. |
| Autoreview | complete | Run for implementation changes or record planning-only N/A | Final structured rerun: zero findings; patch correct at 0.76 confidence. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-31-restore-same-family-plugin-composition.md` | Final checker passed. |
| Docs source-backed claim audit | complete | Verify docs claims against current source or record N/A | Claims match `resolvePlugins.ts`, `createBasePlugin.ts`, and focused runtime tests. |
| Docs links / routes / previews | complete | Verify leaf links, routes, anchors, and preview names or record N/A | Existing guide leaves `/docs/plugin-methods` and `/docs/editor` rendered; no new links or previews. |
| Docs MDX/content parser | complete | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | `pnpm --filter www check:docs` passed. |
| Plugin page specifics | complete | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | N/A: guide pages, not plugin manual/API pages. |
| Agent source / generated sync | complete | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install`; Plate Next v37 validation passed. |
| Agent action discoverability | complete | Source-audit the skill/rule path an agent will read | Best API, Plate Next, Plugin Creator, and Plate UI all name direct terminal configuration composition. |
| Agent-native review | complete | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Parity map is complete; no stale contradictory wording remains in rules, mirrors, docs, or release prose. |
| Browser interaction proof | complete | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | `/blocks/table-nomerge-demo` rendered one table with four rows and twenty cells. |
| Browser console/network check | complete | Record console/network state or why it is not applicable | Final rerun: zero warn/error console entries; 61 responses, zero failures, zero statuses >=400. |
| Browser final proof artifact | complete | Record screenshot/trace/route/native proof or exact caveat | Browser screenshot visually confirmed the editor toolbar and rendered table. |
| Public API / package boundary proof | complete | Source-audit public API, exports, and package boundary impact | Runtime behavior only in `@platejs/core`; no export or declaration topology changed. |
| Release artifact classification | complete | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published Core runtime behavior plus registry/docs adoption. |
| Published package changeset | complete | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Updated existing Core-major v54 changeset; status has no minor packages. |
| Registry changelog | complete | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: registry caller adopts a published Core runtime correction already owned by the changeset. |
| No release artifact | complete | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: existing published Core changeset updated. |
| Package typecheck/build/test | complete | Run owning package checks or record N/A with reason | Core 677/677; focused 65/65; Core+www source-first typecheck 58/58. |
| Barrel/export generation | complete | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no exported symbol or file-layout change. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Runtime owner, prior behavior, TableKit, docs, and release owner audited | Decide |
| Decide | complete | Terminal same-author-lineage configurations compose; foreign families and divergent branches fail | Prove and hand off |
| Prove and hand off | complete | Runtime/package/docs/browser proof and final autoreview green | Done |

Decision brief:
- outcome: plugin arrays remain idempotent and directly customizable without a
  second override channel for owned membership.
- chosen shape: collapse same-role roots from one nominal family in source
  order, preserving non-overlapping earlier configuration and letting later
  overlapping fields win; keep exact-identity dedupe and foreign-family errors.
- strongest rejected alternative: keep strict duplicate rejection and require
  `override.plugins[name]` whenever an app preset already contains the target.
- consequence: restore the Table demo’s direct `TablePlugin.configure(...)`
  call, repair Core tests/docs/release/doctrine, and remove the workaround.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Same-role duplicate descriptors | Any two enabled distinct same-name roots throw | Same nominal family composes in source order; different nominal families throw | Core resolver | Idempotence and terminal consumer configuration must work through the ordinary plugin list | Core resolver/tests and all same-name docs/callers | Public editor construction tests plus Table browser route | Incorrect merge could mix foreign schema families or lose earlier config | rearchitect |
| Table demo customization | Weak `override.plugins[TablePlugin.name]` patches an already-installed table | Append `TablePlugin.configure({ initialState: { disableMerge: true } })` after `EditorKit` | Registry example | Demo owns final membership, so direct typed configuration is the honest path | Revert workaround | www typecheck and standalone route | Earlier Table component config must survive | cut |
| Public/doctrine semantics | Docs/rules say two explicit same-name descriptors conflict | Teach exact identity dedupe, ordered same-family composition, and foreign-family rejection | Core docs + Best API/Plate Vision/workers | Current teaching caused the workaround | Repair current-state docs/rules/mirrors and existing release owner | docs checks, source audit, agent-native review | Over-broad “last wins” could imply foreign plugins merge | rearchitect |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1 | Core | Add public regression test, then repair same-family resolution | Accepted target and failing test | Exact identity, same-family precedence, foreign collision all pass | Focused resolver/runtime tests + Core typecheck |
| 2 | Adoption | Restore direct Table demo configuration and sweep equivalent workarounds caused by this regression | Core green | Scoped callers use ordinary plugin arrays when they own membership | source audit + www typecheck + Browser |
| 3 | Docs/release/doctrine | Repair current docs, existing changeset, Best API/Vision and contradictory workers | Runtime shape final | One current contract everywhere; generated mirrors synced | docs/checker/version/agent-native proof |
| 4 | Closure | Lint, diff, autoreview, plan checker | All edits final | Zero accepted actionable in-scope findings | focused gates + autoreview + check-complete |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Repeated exact identity is idempotent | Existing resolver test dedupes `[Shared, Shared]` | Focused 65/65 and Core 677/677 preserve it | complete |
| Same-family configuration composes | TableKit and later Table configuration share nominal family but strict resolver threw | Public test proves earlier component/stable state plus later overlapping state | complete |
| Foreign same-name descriptors fail | Existing resolver test creates two unrelated families | Diagnostic test preserved; divergent authoring branch test added | complete |
| Direct Table demo is valid and rendered | `EditorKit` contains configured `TablePlugin`; demo owns final list | www typecheck + Browser table/console/network proof | complete |

Conditional evidence:
- High-risk scenarios: same-family merge loses earlier component; later state
  fails to override earlier state; unrelated same-name families merge; source
  precedence/dependency topology changes accidentally.
- External research: N/A; current source, prior local call site, and user-stated
  regression contract are authoritative.
- Issue/PR provenance: N/A; user-directed current-tree regression repair.
- Docs/registry/browser/release/behavior-law owners: current editor guide, Table
  demo, existing Core-major changeset, Best API/Plate Vision, resolver tests.

Findings:
- `EditorKit` installs `TableKit`, whose first member is
  `TablePlugin.configure({ component: TableElement })`.
- The original demo appended another descriptor from the same `TablePlugin`
  family with `disableMerge`; current Core throws before ordered composition.
- Current Core dedupes only the exact same descriptor object and explicitly
  rejects any two distinct enabled same-name roots in one user source.
- Current docs and Best API/Plate Vision repeat that strict rule, so this is a
  Core plus doctrine regression rather than an isolated app diff.

Decisions and tradeoffs:
- Family identity, not string name alone, decides whether composition is safe.
- Ordered composition must preserve earlier non-overlapping fields and let the
  later descriptor win only where it contributes; whole-descriptor replacement
  would silently drop Table render components.
- Weak peer overrides remain correct only when a plugin does not own target
  membership; they are not the replacement for direct consumer composition.

Review fixes:
- Tightened the initial broad family merge to terminal configurations that share
  the exact authoring stage lineage. This prevents two divergent `.extend()`
  branches from silently losing the earlier branch's private capability metadata.
- Added the divergent-authoring regression test and taught the same constraint
  in docs, release prose, Vision, and agent rules.
- Fixed the first autoreview's P2: descriptors are merged before resolution, so
  API/read/update factories execute once against the final composed state rather
  than inheriting capabilities from only the last descriptor. Added a conditional
  API-factory regression test.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Changed the disabled-order test to expect a later implicit enabled value to erase an earlier explicit `enabled: false` | 1 | Re-read defined-value merge semantics instead of assuming whole-descriptor replacement | Restored the historical assertion: an absent later value does not erase an earlier explicit false. |
| `pnpm check:core` full adoption audit | 1 | Keep scoped proof separate from unrelated shared schema-lineage edits | Runner contracts passed; final audit alone fails six pre-existing allowlist rows changed by shared `schemaIdentity` WIP. |
| `pnpm lint:fix` whole-repo lint | 1 | Use focused Biome proof and report unrelated owner debt | Failed on 216 unrelated editor-audit/artifact diagnostics; scoped four code/JSON files pass Biome. |

Verification evidence:
- `bun test packages/core/src/internal/plugin/pluginSourceResolution.spec.ts packages/core/src/internal/plugin/resolvePlugins.spec.tsx`: 65 pass, 0 fail.
- `pnpm --filter @platejs/core test`: 677 pass, 0 fail across 91 files.
- `pnpm turbo typecheck --filter=./packages/core --filter=./apps/www`: 58/58 tasks passed.
- `pnpm --filter www check:docs`: MDX build and source parity passed.
- Browser `/blocks/table-nomerge-demo`: 1 table, 4 rows, 20 cells; zero console warn/error; final 61 responses, zero failures or HTTP errors; screenshot inspected.
- `pnpm changeset status --since=origin/main`: Core remains major; zero minor packages.
- `pnpm install` regenerated skills; Plate Next v37 registry validation passed.
- Scoped Biome and both staged/unstaged diff checks passed.
- `pnpm check:core` runner/declaration/adoption contracts pass until its final source audit, which is blocked only by six unrelated shared schema-lineage allowlist rows.
- `pnpm lint:fix` is blocked by 216 unrelated editor-audit/artifact diagnostics; scoped Biome is clean.
- Final `autoreview --mode local`: zero findings; patch correct at 0.76 confidence.
- `check-complete.mjs`: plan complete; final diff checks and Plate Next v37
  registry validation passed.

Final handoff prepared:
- Ownership and target API: Core owns ordered terminal configuration
  composition; consumers append `Plugin.configure(...)` directly after presets.
- Public breaks and adoption: strict duplicate rejection is removed only for the
  same authoring lineage; foreign plugins and divergent author branches still fail.
- Applicable runtime/package/docs/browser decisions: all current owners and the
  Table No Merge demo now teach/use the same contract.
- Proof and execution risks: focused/full Core, Core+www types, docs, release,
  generated rules, and Browser proof are green; two whole-repo gates expose only
  unrelated shared WIP listed above.
- Execution order and user attention: no follow-up required for this regression.

Timeline:
- 2026-07-31T16:06:28.378Z Plate Plan created.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Final autoreview |
| Where am I going? | Close plan and hand off |
| What is the goal? | Restore direct ordered terminal plugin configuration without merging unrelated plugin identities. |
| What have I learned? | See Findings |
| What have I done? | Implemented Core fix, restored demo, repaired docs/doctrine/release, and proved package/browser behavior. |

Open risks:
- None for this regression. Whole-repo audit/lint caveats above belong to
  unrelated shared WIP.
