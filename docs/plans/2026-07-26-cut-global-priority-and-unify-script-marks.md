# Cut global priority and unify script marks

Objective:
Hard-cut global plugin priority and unify subscript/superscript as one script
property across Plite, Plate, docs, and registry.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-26-cut-global-priority-and-unify-script-marks.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- package-api
- docs
- browser

Mode:
- `standard` accepted-target execution.

Completion threshold:
- No public Plite/Plate global plugin or extension `priority` remains.
- Resource-local ordering survives only where multiple shortcuts, input rules,
  or codec rules genuinely compete.
- Subscript and superscript use one `script` property with `sub | sup` values;
  the separate plugins, boolean marks, keys, exports, and callers are deleted.
- Source, tests, types, barrels, changesets, docs, examples, and registry use
  only the final APIs.
- Focused package proof, Plite development/strict gates as applicable, registry
  browser proof, no-drift source audits, autoreview, and `check-complete` pass.

Verification surface:
- Focused Plite schema/extension tests, Plate core plugin resolution tests, and
  basic-nodes script behavior tests.
- Source-first typechecks for every affected package and `apps/www`.
- `pnpm check:plite:dev`, strict Plite proof when substrate behavior changes,
  `pnpm brl`, `pnpm lint:fix`, and docs source build when MDX/content changes.
- Browser interaction on the registry/demo surface containing the script mark
  controls, including visible sub/sup behavior and console/network inspection.
- `rg` audits for global `priority`, old sub/sup plugins, boolean mark payloads,
  old keys, stale docs, and stale registry calls.

Constraints:
- The user explicitly accepted both hard cuts; execute without another planning
  pause.
- No public compatibility aliases or runtime shims.
- Do not add generic exclusive-group, ordering-profile, or descriptor
  machinery.
- Preserve local priority on shortcut, input-rule, and codec resources.
- Preserve dependency ordering and stable application/source order.
- Do not broaden into unrelated editor-audit proposals or classic-registry work.

Boundaries:
- In scope: Plite schema/property and extension ordering substrate; Plate plugin
  types/compiler/resolution; basic-nodes script mark; affected consumers,
  tests, exports, changesets, docs, examples, and non-classic registry.
- Source owners: `packages/plite`, `packages/core`, `packages/basic-nodes`, and
  any directly affected published package or app owner found by exact search.
- Non-goals: other editor-audit proposals, dependency API redesign, generic mark
  exclusivity, unrelated ordering cleanup, and `*-classic` registry investment.
- Direct Plite boundary owners: property descriptor/compiler and extension
  resolution only.

Output budget strategy:
- Read named owners first. Use `rg --files-with-matches`, counts, and capped
  owner-specific matches before opening exact files. Exclude generated output,
  dependencies, caches, and build artifacts.

Blocked condition:
- Stop only if the accepted target cannot preserve a required public behavior
  without a contradictory user decision, or if the owning browser/test
  infrastructure fails repeatedly with the same external blocker after focused
  alternatives are exhausted.

Plate Plan state:
- status: complete
- phase: execute
- next: final handoff
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Two hard cuts only; docs and registry explicitly included; no compatibility path |
| Active goal and plan verified | yes | Active goal points to this exact plan |
| Current owners read | yes | Plite schema/extension owners, Plate plugin resolver/compiler, basic-nodes, direct adopters, docs, and registry inspected |
| Best API target resolved | yes | Accepted target: no root priority; one enum-valued `script` mark |
| Mode and execution boundary resolved | yes | One-shot accepted-target execution; no approval pause |
| Package/API pack selected | yes | Public Plite/Plate types, plugin exports, and published basic-nodes behavior change |
| Public surface or package boundary identified | yes | Plite property/extension APIs, Plate plugin APIs, and basic-nodes mark API |
| Release artifact path selected | yes | Existing package-major changesets updated; registry changelog source entry generated |
| `changeset` skill loaded when `.changeset` is required | yes | Changeset skill and rule read before release-note edits |
| Barrel/export impact decision recorded | yes | Plugin files/exports are removed and replaced; `pnpm brl` required |
| Docs pack selected | yes | User explicitly requires all docs adoption |
| `docs-creator` loaded | yes | Full skill read before docs adoption |
| Docs lane selected | yes | Current public plugin/mark/serialization reference pages |
| Target docs and nearest sibling docs read | yes | Basic marks, subscript, superscript, plugin ordering, shortcuts, input rules, and HTML pages |
| Docs style doctrine read | yes | Current-state reference voice applied |
| Documented source owner identified | yes | Live Plite/Plate/basic-nodes APIs are authoritative |
| Browser pack selected | yes | Registry controls and rendered script behavior require Browser proof |
| Browser route / app surface identified | yes | `/blocks/basic-marks-demo`, `/docs/basic-marks`, and clean fallback `/examples/plite/paste-html` |
| Browser tool decision recorded | yes | Browser for routes, Chrome for clipboard, focused Chromium runner for deterministic HTML-paste proof |
| Console/network caveat policy recorded | yes | Registry/docs routes are blocked by unrelated missing AI exports; clean Plite route loads, Chrome extension injects Dark Reader hydration noise, focused Chromium proof is clean |

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
- [x] Package/API pack: no-artifact path is N/A because both published packages and registry users see a delta.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.
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

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | complete | Resolve every readiness condition | Scope-owned source, tests, docs, registry, exports, and browser behavior are green; unrelated shared-tree failures are isolated below |
| Fresh source evidence | complete | Recheck decision-changing current claims | Final `rg` audits find no deleted sub/sup API or root priority |
| Best API review | complete | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | One enum-valued `script` mark and dependency/application plugin ordering retained |
| Conditional risk and adoption | complete | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Package, docs, registry, HTML, Markdown, DOCX, static rendering, toolbar, and browser adoption covered |
| Verification recorded | complete | Record fresh planning proof and exact execution gates | See verification evidence |
| Handoff prepared | complete | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff section complete |
| Autoreview | complete | Run for implementation changes or record planning-only N/A | Scoped Codex autoreview clean; two findings rejected by repo policy/unstaged-work semantics |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-26-cut-global-priority-and-unify-script-marks.md` | Ready for final checker |
| Public API / package boundary proof | complete | Source-audit public API, exports, and package boundary impact | Focused source audit and package typechecks pass |
| Release artifact classification | complete | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published package API plus registry behavior |
| Published package changeset | complete | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Existing major changesets updated for plite/core/basic-nodes/utils/markdown |
| Registry changelog | complete | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | Source entry and generated registry changelog indexes pass `--check` |
| No release artifact | complete | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: package and registry artifacts both apply |
| Package typecheck/build/test | complete | Run owning package checks or record N/A with reason | Plite/core/basic-nodes/utils/markdown/docx-io focused typechecks and 212 fast tests pass |
| Barrel/export generation | complete | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | `pnpm brl`: 55/55 |
| Docs source-backed claim audit | complete | Verify docs claims against current source or record N/A | Final source/doc stale-symbol audit clean |
| Docs links / routes / previews | complete | Verify leaf links, routes, anchors, and preview names or record N/A | Docs source parity and route inspection pass |
| Docs MDX/content parser | complete | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | `pnpm --filter www check:docs` passes |
| Plugin page specifics | complete | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | Current API, kit, toolbar, and manual sections use final API |
| Browser interaction proof | complete | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Browser loads `/examples/plite/paste-html`; focused Chromium HTML-paste proof passes 1/1 |
| Browser console/network check | complete | Record console/network state or why it is not applicable | Registry routes expose unrelated missing AI exports; Chrome extension adds Dark Reader hydration noise; clean runner proof has neither |
| Browser final proof artifact | complete | Record screenshot/trace/route/native proof or exact caveat | Route DOM snapshots plus focused Chromium test receipt |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Owners and public breaks inventoried | Decide |
| Decide | complete | Final root-order and script-property shapes locked | Prove and hand off |
| Prove and hand off | complete | Focused proof and blocker isolation recorded | User review |

Decision brief:
- outcome: two smaller, domain-owned APIs with no global ordering escape hatch
  and no impossible simultaneous sub/sup boolean state.
- chosen shape: dependency plus stable application order for plugins; local
  priority only on competing resources; one `script: 'sub' | 'sup'` mark.
- strongest rejected alternative: keep root priority or add generic exclusive
  mark groups.
- consequence: public breaks across plugin declarations and basic-nodes
  persisted/editor-facing data, requiring a complete caller/docs/registry cut.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Global plugin/extension priority | Root priority participates in extension ordering and leaks into Plate fallback precedence | Delete root priority; dependencies and stable application/source order own plugin order; local competing resources retain their own priority | Plite extension resolver and Plate plugin compiler | One number conflates lifecycle, overrides, rendering, and rule precedence | Remove types/defaults/sorts/fallbacks/callers/tests/docs | Ordering unit tests plus no-drift `rg` | Hidden reliance on priority fallback | cut |
| Script marks | Separate sub/sup plugins store independent booleans and manually clear each other | One script plugin stores `script: 'sub' | 'sup'` and toggles the requested value | Plite property schema plus Plate basic-nodes | The domain is one mutually exclusive property, not two independent flags | Replace keys/plugins/codecs/commands/toolbars/fixtures/docs/registry | Schema, HTML, editor, type, and browser proof plus stale-symbol audit | Codec or toolbar value handling may expose a missing owning primitive | rearchitect |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1 | Plite/Plate core | Remove root priority types/defaults/order/fallbacks; preserve local resource priority | Live owner inventory complete | Focused ordering tests pass and global symbol audit is clean | Plite/core tests and source audit |
| 2 | Plite/basic-nodes | Add literal enum property support if live schema lacks it; replace two boolean plugins with one script plugin | Slice 1 stable and current mark/codec owners read | Script model, codec, commands, exports, and tests use one property | Plite/basic-nodes tests and typechecks |
| 3 | Plate consumers | Adopt every package caller and test | Script public API compiles | No old key/plugin/boolean payload remains in packages | Package tests/typechecks and source audit |
| 4 | Docs/registry | Adopt docs, examples, kits, controls, fixtures, and routes | Package API settled | User-facing teaching and registry use only `script` | Docs source build, app typecheck, Browser proof |
| 5 | Closure | Generate barrels/changesets, lint, strict proof, autoreview, and no-drift audit | All adoption complete | Every completion gate and checker pass | Required root commands, review, and `check-complete` |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Root priority is absent without losing local resource ordering | Live compiler/resolver/type sources | Focused ordering tests and source audit | complete |
| Script is one literal-valued property across model, HTML, commands, and rendering | Live schema/basic-nodes/codec sources | Focused tests, typechecks, and source audit | complete |
| Docs and registry expose only the final script API | Live docs/registry callers | Docs source build, registry source check, toolbar tests, and Browser/Chromium proof | complete |

Conditional evidence:
- High-risk scenarios: plugin order silently changes; HTML sub/sup round-trip
  loses its value; toolbar toggling cannot switch/clear enum values. Each gets
  focused tests before broad proof.
- External research: N/A; target already accepted from the completed editor
  audit and current checkout is implementation authority.
- Issue/PR provenance: N/A; direct user-authorized architecture cut.
- Docs/registry/browser/release/behavior-law owners: all apply; exact files,
  commands, and route are filled from live source during execution.

Findings:
- Target scope is intentionally narrower than the surrounding editor-audit
  backlog.

Decisions and tradeoffs:
- Global resource priority remains valid only at the resource declaration that
  actually arbitrates competitors.
- Script value modeling replaces generic exclusivity machinery.

Review fixes:
- Removed the registry toolbar's non-null assertion and retained a runtime
  guard behind the discriminated public props.
- Repaired the DOCX integration's incomplete `DataTransfer` mock after stable
  application ordering caused the table clipboard handler to inspect it.
- Rejected autoreview's request to edit `apps/www/public/r/**`: those files are
  CI-controlled output and repo policy forbids local generation/editing.
- Rejected autoreview's “track new files” finding as a staging concern: the
  replacement files exist and typecheck; the user did not authorize git add.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Scoped autoreview local bundle exceeded 1 MiB | 1 | Review the plan as a narrow dataset and inspect live owners | Scoped review completed clean |
| Registry/demo and docs routes fail before product code on missing AI exports | 2 routes | Use the independent Plite example and focused Chromium proof | Plite route loads; HTML-paste script test passes 1/1 |
| Root lint fails on unrelated audit artifacts | 1 | Record owner-external diagnostics; retain formatting already applied | 174 unrelated diagnostics, none in this scope |
| `check:plite:dev` stops in combobox generic inference | 1 | Keep focused Plite/core/package gates as authority | All scope-owned checks pass |

Verification evidence:
- `pnpm brl`: 55/55 tasks.
- Plite, core source/tests/contracts, utils, basic-nodes, Markdown, and DOCX IO
  focused typechecks pass.
- Focused fast tests: 212/212 across 13 files.
- Slow adoption: playground 25/25, DOCX 2/2, script static HTML 2/2.
- `pnpm --filter www check:docs`: pass.
- Registry source and registry changelog generation checks: pass.
- `pnpm --filter plite test:plite-browser:chromium ... --grep
  'preserves superscript and subscript formatting from HTML paste'`: 1/1.
- Final source scans find no old sub/sup plugin, rule, key, or boolean-property
  API. Every remaining `priority` is shortcut, input-rule, codec, or unrelated
  internal algorithm state.
- Full `apps/www` typechecks remain blocked by 750 shared-WIP diagnostics with
  no match in the changed script/priority/docs/registry files.
- `pnpm check:plite:dev` reaches Plite/core clean and stops in unrelated
  `packages/combobox` generic-inference errors.
- `pnpm lint:fix` formats the tree and stops on 174 unrelated audit-artifact
  diagnostics.

Final handoff prepared:
- Ownership and target API: Plite owns enum properties and stable extension
  order; Plate basic-nodes owns `script: 'sub' | 'sup'`.
- Public breaks and adoption: root plugin `priority`, `KEYS.sub/sup`, two
  boolean properties, two plugins, and two rule families are hard-cut.
- Applicable runtime/package/docs/browser decisions: source packages,
  Markdown, DOCX, examples, docs, registry kits, toolbar UI, changesets, and
  registry changelog use the final APIs.
- Proof and execution risks: scope proof is green; broad gates remain blocked
  only by named shared-tree failures.
- Execution order and user attention: no user decision remains for these two
  cuts.

Timeline:
- 2026-07-26T11:35:27.509Z Plate Plan created.
- 2026-07-26T12:37:00Z Two cuts implemented, adopted, reviewed, and focused-proof
  complete.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Final verified handoff |
| Where am I going? | User review |
| What is the goal? | Delete global priority and unify script marks everywhere |
| What have I learned? | Root ordering stays dependency/application based; only competing resources retain local priority |
| What have I done? | Implemented both hard cuts and adopted packages, docs, registry, tests, exports, and release artifacts |

Open risks:
- No in-scope functional risk remains. Broad shared-checkout `apps/www`,
  combobox, lint-artifact, and registry-route AI export failures remain outside
  this two-cut authorization.
