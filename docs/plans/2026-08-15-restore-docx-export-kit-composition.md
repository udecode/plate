# Restore DOCX export kit composition

Objective:
Make `DocxExportKit` the single registry-owned DOCX renderer preset: it directly
configures each target Base plugin, composes with `BaseEditorKit`, and needs no
separate component map or public `components` operation option.

Flow mode:
one-shot execution after explicit user acceptance

Goal plan:
`docs/plans/2026-08-15-restore-docx-export-kit-composition.md`

Mode:
- `standard`

Completion threshold:
- `DocxExportComponents` has zero source consumers and is deleted.
- `DocxExportOperationOptions` exposes no `components` escape hatch.
- `DocxExportKit` directly configures all 15 specialized DOCX renderers.
- Export callers pass `editorPlugins: [...BaseEditorKit, ...DocxExportKit]`.
- Registry metadata declares every direct runtime package dependency.
- Existing Code Highlight state survives the later DOCX renderer config.
- Focused tests, package/app typechecks, lint, and plan checker pass. Browser
  export proof either passes or records an exact unrelated pre-render blocker
  without making a runtime UI claim.

Verification surface:
- Core same-family source composition regression.
- DOCX IO roundtrip integration and package typecheck/tests.
- `apps/www` source-first typecheck and registry metadata audit.
- `/blocks/docx-export-demo` export interaction through Browser or Chrome when
  native download inspection is required.

Constraints:
- Hard cut only; no compatibility alias, profile factory, or second setup path.
- Preserve specialized DOCX rendering and Code Highlight's `lowlight` state.
- Preserve unrelated shared checkout work.
- Do not edit templates or run `build:registry`.
- Do not change unrelated DOCX conversion behavior or public docs already
  teaching the accepted composition.

Boundaries:
- In scope: DOCX registry kit, its toolbar/test consumers, registry metadata,
  the uncommitted DOCX operation type drift, focused proof, and registry release
  note if required.
- Source owners: `plate-ui` for registry composition; `plate-plugin-creator` for
  the DOCX package type boundary; `plate-plan` for adoption and proof.
- Non-goals: DOCX converter redesign, new component APIs, CLI/schema generation,
  templates, or other export kits.
- Direct Plite boundary owners: N/A; this is Plate plugin composition and copied
  registry UI.

Output budget strategy:
- Read exact owners and consumers with `rg`/bounded `sed`; avoid generated output,
  templates, build artifacts, and broad logs.

Blocked condition:
- Block only if direct same-family configs cannot preserve prior plugin state,
  or the native export path cannot be exercised after package and app proof.

Plate Plan state:
- status: complete
- phase: handoff
- next: none
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Completion threshold and constraints above |
| Active goal and plan verified | yes | This durable plan; no explicit token-budget goal requested |
| Current owners read | yes | Registry kit, toolbar, DOCX plugin/options, integration test, metadata |
| Best API target resolved | yes | Direct target plugin configs; one kit input; no parallel component channel |
| Mode and execution boundary resolved | yes | User explicitly accepted one-shot implementation |
| Package/API pack selected | yes | `plate-plugin-creator` for the package type hard cut |
| Public surface or package boundary identified | yes | `DocxExportOperationOptions.components` is uncommitted drift to remove |
| Release artifact path selected | yes | Registry changelog plus the existing DOCX v54 major changeset corrected to the final API |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded before correcting `.changeset/docx-io-v54-api.md` |
| Barrel/export impact decision recorded | yes | No export/file-layout change; `pnpm brl` N/A |
| Browser pack selected | yes | `plate-ui` Browser first, Chrome only for native download proof |
| Browser route / app surface identified | yes | `/blocks/docx-export-demo` |
| Browser tool decision recorded | yes | Browser route/action plus console; Chrome if download needs native proof |
| Console/network caveat policy recorded | yes | Report exact pre-existing noise separately; no silent waiver |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source in the decision ledger.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied.
- [x] Package/API pack: the existing DOCX v54 major changeset teaches the final plugins-only composition; no duplicate changeset was added.
- [x] Package/API pack: registry-only copied-source change uses a registry changelog.
- [x] Package/API pack: hard-cut decision is explicit.
- [x] Package/API pack: package-owned typecheck/test proof is recorded.
- [x] Package/API pack: generated barrels are N/A because no exports or file layout change.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded.
- [x] Browser pack: Browser is primary; Chrome is reserved for native download behavior.
- [x] Browser pack: console state records the pre-render stale generated-import failure; network did not reach the feature.
- [x] Browser pack: final visible/native proof is explicitly blocked before render, so no browser behavior claim is made.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Meet every completion threshold | Source/package complete; browser blocker recorded |
| Fresh source evidence | yes | Re-audit exact consumers after edits | Zero stale component-map references |
| Best API review | yes | Direct plugin config verdict accepted | Final P2 review clean |
| Conditional risk and adoption | yes | Prove merge and registry install boundary | 7/7 exact integration; metadata updated |
| Verification recorded | yes | Record exact commands/results | Recorded below |
| Handoff prepared | yes | Summarize ownership, hard cut, proof, risks | Prepared below |
| P2 autoreview | yes | Run `autoreview --max-priority P2` | Clean; no actionable P0-P2 findings |
| Goal plan complete | yes | Run `check-complete.mjs` | `[autogoal] complete` |
| Public API / package boundary proof | yes | Audit options and exports | `DocxExportOperationOptions` has no `components`; zero stale references |
| Release artifact classification | yes | Package changeset plus registry changelog | Existing major changeset corrected; registry entry generated |
| Published package changeset | yes | Keep the existing DOCX v54 major release note aligned | Plugins-only composition documented |
| Registry changelog | yes | Add and verify current-state registry note | Source and generated JSON check pass |
| No release artifact | no | Registry source install shape is user-visible | N/A |
| Package typecheck/build/test | yes | DOCX package + app/integration proof | 87/87 package, 7/7 integration, package/www typechecks pass |
| Barrel/export generation | no | No exports or exported files changed | N/A |
| Browser interaction proof | yes | Export from standalone demo route | Blocked before render by stale generated imports to deleted `editor-kit.tsx` and `plate-types.ts` |
| Browser console/network check | yes | Inspect after export interaction | Console records only the pre-render module-not-found blocker; feature request never ran |
| Browser final proof artifact | yes | Record route and download/visible outcome | `/blocks/docx-export-demo` returned the Next.js build-error overlay; no runtime claim |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Live owners, docs, merge law, and consumers audited | Execute |
| Decide | completed | User accepted direct plugin configuration | Execute |
| Execute | completed | Direct kit, hard cut, metadata, tests, release artifacts | Prove and hand off |
| Prove and hand off | completed | Typechecks/tests/lint/changelog/P2 review clean; browser blocker recorded | Final response |

Decision brief:
- outcome: one directly composable `DocxExportKit`.
- chosen shape: target Base plugin descriptors configured with DOCX components;
  caller concatenates `BaseEditorKit` and `DocxExportKit`.
- strongest rejected alternative: parallel `DocxExportComponents` plus public
  operation `components`; it duplicates plugin composition and makes callers
  synchronize two inputs.
- consequence: source-order plugin merge remains the sole override mechanism.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Registry renderer preset | Component map wrapped by `DocxIOPlugin.override.components` | 15 direct Base plugin configs | `plate-ui` | Render ownership belongs to target plugins | Replace kit source | Exact integration assertion + browser | Missing renderer | accepted |
| Export call | Plugins plus separate components | One `editorPlugins` array | `plate-ui` | One composition channel | Toolbar and test | Typecheck + integration | Later config may erase state | accepted; merge proof required |
| DOCX operation options | Public `components` drift | No public components field | DOCX package | Avoid parallel API | Remove field and consumers | Package typecheck/API audit | Private toBlob path must remain | accepted |
| Plugin merge | Earlier state plus later component | Preserve both | Core | Existing source-order law | No Core source change | `pluginSourceResolution.spec.ts` | Opaque field replacement is intended | accepted |
| Registry install metadata | Only DOCX IO dependency | Every directly imported plugin package | registry metadata | Copied source must install alone | Update item deps | Metadata/source import audit | Missing direct dep | accepted |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Direct kit | `plate-ui` | Rewrite kit and toolbar | Accepted target | One plugins-only setup | Typecheck + integration |
| 2. Package hard cut | `plate-plugin-creator` | Remove public components drift | No consumer remains | Options surface restored | Package typecheck/tests |
| 3. Install/release | `plate-ui` | Registry deps and changelog | Imports final | Copied item is self-contained | Registry audit |
| 4. Closure | `plate-plan` | Lint, tests, browser, P2 review, checker | Source frozen | All gates recorded | Exact command/browser receipts |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Same-family configs compose | Core merge source and 16-case focused test | 16/16 focused Core test | pass |
| DOCX renderers win without erasing lowlight | Base kit and target kit source | Final grammar + renderer assertion in 7/7 integration | pass |
| Public escape hatch is gone | Options owner and consumer audit | Zero-result `rg` + package/www typechecks | pass |
| Copied registry item installs correctly | Direct import inventory | Metadata/source check + www typecheck | pass |
| User export still works | Existing docs/demo route | 7/7 DOCX export roundtrip; browser route blocked before render | package pass, browser unclaimed |

Conditional evidence:
- High-risk scenarios: later component config preserving earlier `initialState`;
  exact integration proof is mandatory.
- External research: N/A; repository merge law and public call shape are local.
- Issue/PR provenance: N/A; user-directed current-tree correction.
- Docs/registry/browser/release/behavior-law owners: public docs already teach
  the target call; registry changelog and browser proof apply; no behavior-law
  change.

Findings:
- Public EN/CN DOCX docs already use `BaseEditorKit + DocxExportKit`; source had
  drifted away from its own documented API.
- Core source-order merge shallow-merges `initialState`, so a later component-
  only config preserves Code Highlight's `lowlight` state.
- `DocxIOPlugin.api.toBlob` still needs its private resolved component map; only
  the operation-level public escape hatch is wrong.

Decisions and tradeoffs:
- Keep the generic Core merge law. Do not add a DOCX profile factory.
- Configure Base descriptors because export is static/base-editor composition.
- Remove the operation option rather than deprecate it; it is uncommitted drift.

Review fixes:
- P2: removed the rejected `DocxExportComponents`/`components` API from the
  owning DOCX changeset and documented plugins-only composition.
- P2: documented explicit live-editor `DocxIOPlugin` installation after the
  export kit stopped owning it accidentally.
- P2: strengthened the merge regression to prove the final Lowlight runtime
  still contains BaseEditorKit's registered TypeScript grammar after the DOCX
  renderer override.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Bun treated the path as a name filter without `./` | 1 | Re-run with an explicit relative path | Corrected |
| Roundtrip test got `DocxIOPlugin` implicitly from the old export kit | 1 | Install the import plugin explicitly in the test editor | Corrected ownership; 7/7 pass |
| Lowlight identity comparison failed because plugin resolution clones the runtime object | 1 | Assert preserved registered grammar instead of object identity | Corrected; 7/7 pass |

Verification evidence:
- `bun test ./packages/core/src/internal/plugin/pluginSourceResolution.spec.ts`: 16 pass, 0 fail.
- `bun test ./apps/www/src/__tests__/package-integration/docx-io.roundtrip.slow.tsx`: 7 pass, 0 fail.
- `pnpm --filter @platejs/docx-io test`: 87 pass, 0 fail.
- `pnpm turbo typecheck --filter=./packages/docx-io`: 14 tasks successful.
- `pnpm --filter www typecheck`: pass, including editor generator check,
  registry source check, app TypeScript, and package-integration TypeScript.
- `pnpm lint:fix`: pass; 4,106 files checked, 15 pre-existing max-size warnings.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check`: 60/60 events agree.
- Hard-cut `rg`: zero `DocxExportComponents` or component-map option references.
- `.agents/skills/autoreview/scripts/autoreview --mode local --max-priority P2 ...`:
  clean, no accepted/actionable findings.
- Browser `/blocks/docx-export-demo`: blocked before render by stale generated
  `apps/www/src/__registry__/index.tsx` imports for deleted `editor-kit.tsx` and
  `plate-types.ts`; the route returned 500 and the feature interaction never ran.

Final handoff prepared:
- Ownership and target API: `DocxExportKit` owns target renderer configs; callers
  pass one composed `editorPlugins` array.
- Public breaks and adoption: component-map escape hatch removed; explicit
  `DocxIOPlugin` live-editor wiring documented where its scoped API is used.
- Applicable runtime/package/docs/browser decisions: package and registry
  release artifacts aligned; browser caveat recorded without a false claim.
- Proof and execution risks: Lowlight preservation is proven semantically;
  native browser download remains unverified only because the route cannot build.
- Execution order and user attention: source is complete; stale generated
  registry imports are the only remaining external proof blocker.

Timeline:
- 2026-08-15T07:09:52.018Z plan created.
- 2026-08-15 accepted proposal converted into an execution plan with measurable gates.
- 2026-08-15 source, proof, P2 review, and plan checker completed; browser blocker recorded.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Execute |
| Where am I going? | Direct kit, hard cut, proof, handoff |
| What is the goal? | One directly composable DOCX export kit |
| What have I learned? | Existing merge law supports the target without new machinery |
| What have I done? | Audited owners, docs, merge law, and exact consumers |

Open risks:
- Native Word download is not browser-proven until the generated registry import
  map stops referencing deleted `editor-kit.tsx` and `plate-types.ts` files.
- No source, type, test, merge, install-metadata, changelog, or P0-P2 review risk remains.
