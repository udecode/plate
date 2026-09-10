# Move DOCX export presentation to registry

Objective:
Make DOCX export presentation registry-owned; done when package API, registry
adoption, docs, browser proof, and required checks pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-04-move-docx-export-presentation-to-registry.md

Template:
docs/plans/templates/architecture-cleanup.md

Primary template:
docs/plans/templates/architecture-cleanup.md

Applied packs:

- docs (docs/plans/templates/packs/docs.md)
- package-api (docs/plans/templates/packs/package-api.md)
- browser (docs/plans/templates/packs/browser.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Cleanup source:

- type: user-requested source review followed by explicit execution
- id / link: `packages/platejs/src/docx/export/lib/DocxExportPlugin.tsx`
- title: Move DOCX export presentation to the registry
- requested surface: DOCX export package API, registry preset, tests, docs, and reusable ownership doctrine
- cleanup intent: delete the package-owned visual theme and make registry/app callers pass presentation explicitly
- acceptance criteria: no package `DOCX_EXPORT_STYLES`; exact optional caller stylesheet; registry owns and passes the preset; conversion mechanics remain package-owned; current docs and tests teach the final shape

First checkpoint:

- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:

- requested duration: N/A: none requested
- semantics: N/A: normal one-shot execution
- initial confidence / cleanliness score: N/A: binary architecture and proof gates apply
- improvement loop: N/A: no timed loop
- final score / loop closure: N/A: no timed loop

Completion threshold:

- Package exports no DOCX visual preset and injects no hidden stylesheet.
- `DocxExportOptions.stylesheet` is the sole exact caller-owned CSS input.
- Registry `DocxExportKit` owns the visual preset and the export toolbar passes it.
- Package proof covers explicit stylesheet conversion and whitespace fidelity;
  docs, generated registry output, agent doctrine, package checks, and the
  affected browser route are current and passing.
- Architecture-cleanup closure is legal only when source map, deslop inventory,
  candidate matrix, agent-navigation score, packet ledger, proof evidence,
  changed list, and final handoff are complete or explicitly N/A, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-move-docx-export-presentation-to-registry.md`
  passes.

Verification surface:

- Source audits for `DOCX_EXPORT_STYLES`, `customStyles`, and `stylesheet`.
- Focused DOCX export test plus `platejs` typecheck/test and mapped Plite checks.
- `pnpm --filter www build:source`, registry generation when required by the
  current branch, and browser proof of the DOCX demo/export surface.
- `pnpm install` plus source/generated rule parity after Best API doctrine repair.

Constraints:

- Do not split files because they are large.
- Prefer delete, merge, inline, or simplify over extraction when that improves
  comprehension.
- The user explicitly authorized the accepted public API hard cut; execute it
  through Plate Plan rather than misclassifying it as behavior-neutral cleanup.
- Preserve DOCX conversion semantics, document defaults, margins, metadata,
  remote-image policy, compact HTML wrapping, and marked-whitespace fidelity.
- Do not retain `customStyles`, a compatibility alias, or an implicit package theme.
- Focused proof comes before broad proof.
- No dirty speculative work at handoff: keep, revert, or quarantine.

Boundaries:

- Source of truth: live DOCX exporter, converter defaults, registry static renderers/export toolbar, public DOCX docs, and Plate ownership doctrine
- Allowed edit scope: `packages/platejs/src/docx/export/**`, DOCX registry/docs/generated output, one changeset, and the smallest required `.agents/rules/**` plus Vision repair
- Plite / Plate boundary: Plate-only; no Plite runtime or document-model changes
- Public API boundary: hard-cut `DOCX_EXPORT_STYLES` and `customStyles`; add exact optional `stylesheet`
- Browser surface: DOCX demo and export action in `apps/www`
- Package/API surface: `platejs/docx` export operation and options
- Non-goals: DOCX converter rewrite, new themes, CodeMirror/code-block work, performance claims, PR/commit/push/release

Output budget strategy:

- Use exact file reads and scoped `rg`; exclude generated output until the
  generation gate; cap command output and inspect failing slices only.

Blocked condition:

- Stop only if package correctness cannot be preserved without an implicit
  visual theme, required generation/browser tooling is unavailable after the
  documented fallback, or a failure proves the accepted owner split invalid.

Cleanup state:

- task_type: architecture-cleanup
- task_complexity: normal public API and ownership hard cut
- current_phase: closeout
- current_phase_status: complete
- next_phase: none
- goal_status: ready_for_completion

Current verdict:

- verdict: move visual DOCX presentation to the registry; keep conversion mechanics in `platejs/docx`
- cleanliness confidence: target locked by live source and hostile review
- next owner: Plate Plan execution under Auto
- keep / revert / quarantine call: keep
- reason: the package theme duplicates registry presentation, couples export to Highlight.js classes, and prevents caller-owned output

Source map:

- Package API/runtime owner: `packages/platejs/src/docx/export/lib/DocxExportPlugin.tsx` owns HTML serialization, CSS inlining, whitespace preservation, DOCX conversion, options, the standalone operation, and the plugin API.
- Converter-format owner: `packages/platejs/src/docx/export/lib/internal/constants.ts` and `internal/schemas/styles.ts` own DOCX defaults such as Times New Roman, paragraph spacing, heading styles, and document metadata.
- Public export owner: `packages/platejs/src/docx/export/lib/index.ts` wildcard-exports the plugin file, so `DOCX_EXPORT_STYLES` is currently public through `platejs/docx`.
- Registry presentation owner: `apps/www/src/registry/components/editor/docx-export.tsx` owns DOCX-specific render composition; `code-block-static.tsx` already owns DOCX code presentation and the whitespace marker.
- Product caller: `apps/www/src/registry/components/editor/export-toolbar-button.tsx` selects `BaseEditorKit` plus `DocxExportKit` and invokes `exportToDocx`.
- Teaching/proof owners: `DocxExportPlugin.spec.ts`, English/Chinese DOCX docs, generated registry artifacts, one package changeset, and Best API/Plate Vision ownership doctrine.

Deslop inventory:

- Package-level visual stylesheet duplicates registry presentation and converter document defaults.
- `customStyles` is a vague additive API whose behavior depends on a hidden preset.
- Package proof hardcodes a GitHub/Highlight.js theme color rather than proving caller-owned CSS.
- Registry code presentation and package `pre`/Highlight.js presentation are split across owners.
- Package docs promise a Times New Roman fallback while the hidden stylesheet declares Calibri.
- No wrapper or new module is justified; colocate the copied preset with `DocxExportKit`.

Architecture challenge:

- Alternative A: keep the package theme and allow additive overrides. Rejected because headless conversion would continue to own product typography and a specific syntax palette.
- Alternative B: move the theme to registry but retain a hidden minimal package stylesheet. Rejected unless a focused conversion test proves a declaration is required for fidelity; otherwise it preserves two styling owners.
- Selected target: package accepts one optional exact `stylesheet`; omission means no injected CSS. Registry owns and passes the complete visual preset. Conversion defaults and whitespace handling remain in the package.
- Hostile falsifier: if zero-styles focused proof loses semantic content or required whitespace, keep only the proven conversion rule as code or renderer-owned inline style; do not restore a visual preset.
- Challenge delta: improved. The initial “move default styling” direction became a full deletion of hidden package presentation plus exact caller ownership.

Plate Plan decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
|---------|---------|--------|-------|--------|----------|-------|------|---------|
| DOCX visual preset | Public package constant injected into every export | Copied registry constant beside `DocxExportKit` | Registry/app | Typography and theme are product policy | Import and pass from export toolbar/docs example | Registry source audit and browser route | Callers omitting CSS get converter defaults | move |
| CSS option | `customStyles` appends after hidden defaults | `stylesheet` is the exact optional stylesheet | `platejs/docx` | One truthful input; no override protocol | Hard-cut callers and docs | Package typecheck/test plus zero stale names | Breaking API before stability | rearchitect |
| Conversion mechanics | Shared with the current stylesheet wrapper | Compact HTML, Juice, NBSP preservation, margins, and Word defaults stay package-owned | `platejs/docx` | Required format behavior | Internal rename only | DOCX XML assertions | Accidental fidelity regression | keep |
| Syntax palette proof | Package test asserts package-selected red | Test supplies its own CSS; registry owns palette value | Package plus registry | Package proves transport, not taste | Rewrite focused test | Inspect generated `document.xml` | Missing registry integration coverage | move |
| Reusable doctrine | General copied-UI law lacks serializer-specific review question | Package serializers own format semantics; app/registry owns optional presentation presets | Best API and Plate Vision | Prevents recurrence | Source rule, generated mirror, affected-worker audit | `pnpm install` and scoped `rg` | Overgeneralizing format-required styles | rearchitect |

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-move-docx-export-presentation-to-registry.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Review verdict plus `ok go` captured above as package-theme cut, registry adoption, exact stylesheet, preserved conversion mechanics, proof, and no publication |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `architecture-cleanup` loaded | yes | `.agents/skills/architecture-cleanup/SKILL.md` read completely |
| Active goal checked or created | yes | Active goal created for this exact plan |
| Source of truth read before analysis | yes | Live exporter, converter defaults, test, registry export/static components, toolbar, and docs inspected |
| VISION fit gate read | yes | `VISION.md`, `docs/vision/common.md`, and `docs/vision/plate.md` read completely |
| Plite / Plate boundary selected | yes | Plate package/registry only; Plite is unaffected |
| Cleanup surface selected | yes | DOCX export presentation ownership and its public CSS option |
| Non-goals recorded | yes | Boundaries section records converter rewrite, new themes, code-block/performance work, and publication as out of scope |
| Output budget strategy recorded | yes | Exact-file reads and capped searches only |
| Implementation authority decided | yes | User said `ok go`; Auto execution is authorized in scope |
| Proof strategy selected | yes | Focused package test, source audits, package/docs/generated checks, and browser route proof |
| Runtime scale applicability resolved | no | N/A: source shows the same one-export serialization and Juice path; no hot owner, cache, index, subscription, or repeated-unit work is added |
| Docs pack selected | yes | Public DOCX option and ownership docs change |
| `docs-creator` loaded | yes | `.agents/skills/docs-creator/SKILL.md`, its style rules, and the serialization lane template read completely |
| Docs lane selected | yes | Serialization/plugin reference plus the export example |
| Target docs and nearest sibling docs read | yes | English and Chinese DOCX pages, export example, live exporter, registry kit, and toolbar read |
| Docs style doctrine read | yes | `docs-creator` style and structure rules read before final prose |
| Documented source owner identified | yes | `platejs/docx` owns conversion; copied `docx-export.tsx` owns presentation |
| Package/API pack selected | yes | `platejs/docx` public option and exported constant change |
| Public surface or package boundary identified | yes | `DocxExportOptions` and `platejs/docx` exports |
| Release artifact path selected | yes | `.changeset`: published `platejs` breaking API/presentation behavior |
| `changeset` skill loaded when `.changeset` is required | yes | Existing unreleased DOCX topology changeset updated; no second migration entry invented |
| Barrel/export impact decision recorded | yes | Run `pnpm brl` because a public export disappears and verify generated barrels |
| Runtime scale applicability resolved | no | N/A: no runtime layer or scaling strategy changes |
| Browser pack selected | yes | Registry export toolbar changes |
| Browser route / app surface identified | yes | `/docs/docx` or its standalone DOCX demo route, resolved from current registry metadata before launch |
| Browser tool decision recorded | yes | Browser for route/UI; Chrome only if native download state must be inspected |
| Console/network caveat policy recorded | yes | Check page console; native Word rendering remains package-test proof, not a browser claim |
| Observable browser case captured | no | N/A: architecture/API ownership change, not a reporter-backed bug or paint claim |
| Agent-native pack selected | yes | Best API source rule requires a reusable ownership repair |
| Agent-facing action surface identified | yes | Future reviews must distinguish package conversion mechanics from registry/app presentation presets |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/best-api.mdc`; regenerate `.agents/skills/**` with `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Skill read completely; capability map below passes with no accepted findings |

Work Checklist:

- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation. Evidence: Objective,
      Completion threshold, Constraints, Boundaries, and Verification surface.
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
- [x] Implementation packets are behavior-neutral, public-API-neutral, narrow,
      reversible, and have focused proof. N/A to neutrality: the user authorized
      the public API hard cut, which Plate Plan owns; packets remain narrow and reversible.
- [x] Every hot-owner packet has a frozen pre-packet scale receipt and exact
      post-packet production rerun plus correctness guard; paper complexity or
      "benchmark later" cannot justify keep. N/A: no hot runtime owner changes.
- [x] Each implementation packet ends keep, revert, or quarantine. Both packets
      are kept after focused and broad proof.
- [x] Source-owner oracle is repaired. `registry.test.ts` asserts that the copied
      DOCX source owns the preset and that the toolbar passes it; package XML
      tests prove transport and absence of a hidden Calibri theme.
- [x] Focused proof ran before broad proof: DOCX package tests/typecheck/lint and
      the registry oracle preceded package build, app typecheck, and Browser.
- [x] Broad proof ran after the public/package boundary change: `platejs` build,
      registry generation, docs/app typecheck, and Browser proof.
- [x] Workspace authority is recorded below. All command proof ran from
      `/Users/zbeyens/git/plate-2`; Browser used the same checkout's dev server.
- [x] Output budget discipline was followed: exact files, capped `rg`, focused
      package partitions, and generated checks; one registry build was verbose
      but bounded by its 366-item owner.
- [x] Docs pack: serialization lane, English/Chinese DOCX pages, export example,
      live exporter, copied registry kit, and toolbar owners are recorded.
- [x] Docs pack: every named API, import, option, route, component, and preview
      was checked against source, generated registry output, or the live route.
- [x] Docs pack: docs use current-state reference voice.
- [x] Docs pack: `/docs/docx`, `/docs/examples/export`, `docx-demo`, and
      `docx-export` resolve through source generation and the standalone route.
- [x] Docs pack: all three edited docs completed the `unslop` file-edit pass.
      The audit reported only literal title-case DOCX headings; protected code,
      identifiers, links, and technical claims remain unchanged.
- [x] Docs pack: package requirements, client-only browser work, copied-source
      setup, and optional presentation are attributed to their live owners.
- [x] Package/API pack: the public option, wildcard export impact, package
      boundary, copied registry adoption, and release artifacts are recorded.
- [x] Package/API pack: the existing unreleased `platejs` changeset and existing
      draft registry changelog row were updated; no duplicate artifacts added.
- [x] Package/API pack: `changeset` was loaded and the existing major entry was
      preserved because this DOCX surface is absent from `main`.
- [x] Package/API pack: N/A to registry-only policy because this packet also
      changes the unreleased `platejs/docx` public API.
- [x] Package/API pack: N/A to no-artifact classification; package and registry
      user-visible deltas both have existing release artifacts.
- [x] Package/API pack: hard cut is explicit: delete `DOCX_EXPORT_STYLES` and
      `customStyles`; accept only exact optional `stylesheet`, with no alias.
- [x] Package/API pack: N/A to performance composition. The same one-export
      serialization, Juice, and conversion path remains; no hot owner is added.
- [x] Package/API pack: DOCX partition test/typecheck/lint and full `platejs`
      build pass after the prescribed clean reinstall.
- [x] Package/API pack: `pnpm brl`, registry generation, changeset, and registry
      changelog generation/checks pass.
- [x] Browser pack: route `/blocks/docx-demo`; open the export dropdown; expect
      the editor and `Export as Word`; invoke it and check browser/server errors.
- [x] Browser pack: Browser handled the normal route and menu. N/A to Chrome or
      Computer because native download-manager or Word rendering is not claimed.
- [x] Browser pack: browser error/warning log was empty and the Next server
      recorded 200 responses with no application error.
- [x] Browser pack: visual waiver. This is an ownership/API change with no web
      paint claim; accessible DOM proved the editor and Word export menu.
- [x] Browser pack: N/A to classified pixel controls; no reporter-visible paint
      claim exists.
- [x] Browser pack: N/A to red report replay; this is a user-authorized
      architecture hard cut, not a report-backed bug.
- [x] Browser pack: a fresh local dev process loaded the final source and
      rechecked route, editor DOM, export popup, Word action, browser logs, and
      server output. N/A to issue fingerprints because no issue claim exists.
- [x] Browser pack: N/A to clean pushed-ref certification; work is local and no
      fixed/shipped/public status is claimed.
- [x] Browser pack: N/A to 5/5 native stability; no native selection, paint,
      focus, DnD, compositor, or React DOM lifecycle claim exists.
- [x] Browser pack: no stub, alias, generated-file edit, or route bypass was
      used as behavior proof; tracked `/r` output came from the generator.
- [x] Agent-native pack: `.agents/rules/best-api.mdc` was edited as source, not
      the generated skill.
- [x] Agent-native pack: serializer/exporter ownership is discoverable in the
      Best API package-ownership section and Plate Vision.
- [x] Agent-native pack: `pnpm install` regenerated mirrors and
      `sync-resources.mjs --check` reports exact.
- [x] Agent-native pack: review verdict PASS; no findings were accepted or
      rejected.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named proof | Package, registry, docs, generated, browser, and source-audit evidence below passes |
| Source map complete | yes | Record owners | Package, converter, registry, caller, docs, exports, and proof owners recorded |
| Deslop inventory complete | yes | Record debt | Six concrete ownership/API/proof problems recorded |
| Candidate matrix complete | yes | Rank candidates | Six candidates have facts, decision, owner, and proof |
| Agent-navigation score complete | yes | Record net effect | Hidden package-plus-registry styling becomes one registry preset plus one exact package input |
| Anti-confetti gate | yes | Reject unjustified splits | No file or abstraction split accepted |
| Delete / merge / inline gate | yes | Record simplifications | Package theme deleted; presentation merged into existing registry owner; hidden-minimal alternative rejected |
| VISION fit gate | yes | Confirm durable fit | Plate Vision updated with serializer/exporter ownership law |
| Implementation packet gate | yes | Record packet results | Packets 1 and 2 both kept after proof |
| Hot-owner scale preservation | no | Source-backed N/A | No hot runtime owner or repeated-work strategy changed; one-export pipeline remains |
| Source-owner oracle gate | yes | Repair proof | Package XML tests plus registry source/caller oracle pass |
| Public API / behavior safety gate | yes | Route intentional hard cut | Plate Plan records the authorized hard cut and unchanged conversion mechanics |
| Package/API proof | yes | Run owning proof | DOCX test/typecheck/lint, full `platejs` build, dist audit, and barrels pass |
| Browser proof | yes | Exercise route/action | Fresh `/blocks/docx-demo` rendered editor and Word action; no browser/server errors |
| Final lint/check | yes | Run focused and broad checks | All named checks pass; full app typecheck exits zero with an 8 GB Node heap |
| Output budget discipline | yes | Keep output bounded | Exact files and focused partitions used; verbose registry build remained bounded |
| Timed checkpoint | no | N/A | No duration requested |
| Final handoff contract | yes | Fill handoff | Changed list, counts, proof, review, risk, and next owner completed below |
| Goal plan complete | yes | Run goal checker | Run after this final plan update |
| Docs source-backed claim audit | yes | Verify claims | Claims match package types, registry sources, generated `/r`, and live route |
| Required Unslop pass | yes | Audit all edited docs | Three files audited; only intentional DOCX title-case headings flagged |
| Requirements disclosure | yes | Attribute requirements | Package, copied-source, client runtime, and optional stylesheet ownership stated |
| Docs links / routes / previews | yes | Verify targets | Docs source parity, registry generation, and `/blocks/docx-demo` pass |
| Docs MDX/content parser | yes | Build docs source | `www typecheck` completed the source build and docs parity stages |
| Plugin page specifics | yes | Apply docs rules | Kit, manual operation, ownership, and API option sections are current |
| Public API / package boundary proof | yes | Audit source and dist | No package preset or `customStyles`; exact `stylesheet` remains |
| Runtime scale contract | no | Source-backed N/A | Same serialization, Juice, and DOCX conversion cost model |
| Release artifact classification | yes | Classify delta | Unreleased `platejs/docx` API plus copied registry behavior |
| Published package changeset | yes | Update artifact | Existing unreleased major DOCX topology changeset updated; no duplicate entry |
| Registry changelog | yes | Update artifact | Existing draft DOCX fidelity row names the copied preset owners; generator passes |
| No release artifact | no | N/A | User-visible package and registry deltas have artifacts |
| Package typecheck/build/test | yes | Run package checks | All pass after one prescribed clean reinstall |
| Barrel/export generation | yes | Run generator | `pnpm brl`: 4/4 packages pass |
| Browser interaction proof | yes | Exercise normal surface | Browser loaded editor, opened export menu, and invoked Word action |
| Browser console/network check | yes | Inspect errors | Empty browser error/warning log; server returned 200 without application errors |
| Browser final proof artifact | yes | Record route evidence | Accessible DOM showed `Export as Word`; blob download event was unavailable and is not claimed |
| Exact case replay | no | N/A | No report-backed behavior case |
| Final ref and fingerprints | no | N/A | Local architecture change, not an issue replay or pushed-ref claim |
| Clean final runtime | no | N/A | Local uncommitted work; no fixed, shipped, or pushed claim |
| Retry-free stability | no | N/A | No native interaction or paint stability claim |
| Agent source / generated sync | yes | Regenerate and check | `pnpm install` plus `sync-resources.mjs --check`: exact |
| Agent action discoverability | yes | Audit route | Best API rule and Plate Vision name package-versus-app ownership directly |
| Agent-native review | yes | Review parity | PASS; map below has no gaps |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | requirements, skills, active goal, and live owners recorded | source map |
| Source map | complete | package, converter, registry, caller, docs, and proof owners recorded | deslop inventory |
| Deslop inventory | complete | six concrete ownership/API/proof problems recorded | candidate matrix |
| Candidate matrix | complete | six candidates resolved plus hostile challenge | cleanup packets / owner routing |
| Cleanup packets / owner routing | complete | both packets kept after package, registry, docs, and doctrine proof | verification |
| Verification | complete | focused, broad, generated, source-audit, and Browser proof passes | closeout |
| Closeout | complete | plan, review, risks, and handoff complete | final response |

Candidate matrix:
| Rank | Strength | Candidate | Files | Facts | Navigation score | Recommendation | Owner | Proof | Decision |
|------|----------|-----------|-------|-------|------------------|----------------|-------|-------|----------|
| 1 | Strong | Package visual preset | `DocxExportPlugin.tsx` | Fonts, spacing, tables, links, code, and Highlight.js palette are always injected | Current: 5 files/3 owners to understand output; target: package mechanics or registry presentation is obvious | Delete from package; move complete preset to registry | Registry/app | No package symbol plus registry caller proof | delete/move |
| 2 | Strong | Additive `customStyles` API | package API/docs/callers | Caller cannot request exact CSS or no theme | Current hidden merge rule; target one literal option | Replace with exact `stylesheet` and no alias | `platejs/docx` | Typecheck, docs, stale-name audit | rearchitect |
| 3 | Strong | Syntax color assertion | package spec | `d73a49` is treated as package behavior | Current proof mixes taste and transport; target package test is self-contained | Supply CSS in the test; keep NBSP assertion | package test | Focused test | simplify |
| 4 | Strong | Registry DOCX composition | `docx-export.tsx`, `export-toolbar-button.tsx`, `code-block-static.tsx` | Registry already owns export-specific renderers and visible code styling | Current split owner; target one copied presentation owner | Colocate stylesheet with kit and pass it explicitly | registry | Source audit and browser route | merge |
| 5 | Strong | Format defaults/mechanics | converter constants/styles, wrapper, whitespace transform | Word defaults and HTML normalization are required format behavior | Current partly obscured by theme; target package responsibility is narrow | Keep without visual fallback | `platejs/docx` | XML assertions and focused test | keep |
| 6 | Worth exploring | Reusable owner doctrine | Best API rule and Plate Vision | Existing copied-UI law is general but does not call out serializer themes | Target adds one durable review rule; no extra skill | Repair smallest source owners and regenerate | doctrine owners | Source/generated parity audit | simplify |

Packet ledger:
| Packet | Action | Owner | Files | Proof | Scale receipt / N/A | Result | Next |
|--------|--------|-------|-------|-------|---------------------|--------|------|
| 1 | Cut hidden package theme and additive API; preserve mechanics | Plate Plan / `platejs/docx` | exporter and focused spec | DOCX partition test: 111/111 plus focused 3/3; DOCX typecheck passed | N/A: same one-export conversion path | keep | registry/docs adoption |
| 2 | Adopt explicit registry preset; repair docs, release artifact, and doctrine | Plate Plan / registry/docs/rules | registry toolbar/kit, docs, changeset, Best API/Plate Vision | source audits, generated output, package/docs/browser checks | N/A: no hot runtime owner | keep | closeout |

Cleanup counts:

- delete: 1 package visual preset owner
- merge: 1 visual preset into the existing registry DOCX owner
- inline: 0
- simplify: 2 (`customStyles` merge protocol and package theme assertion)
- split: 0
- keep: 1 conversion-mechanics owner
- defer: 0
- reject: 1 hidden-minimal-stylesheet alternative
- plan: 1 two-packet Plate adoption

Changed list:

- code/runtime/API: package exact `stylesheet` input; copied registry
  `DOCX_EXPORT_STYLES`; explicit toolbar adoption; generated `/r` payloads
- tests/oracles: package DOCX XML assertions and registry presentation/caller
  source oracle
- docs/plans: English/Chinese DOCX reference, export example, this goal plan,
  existing package changeset, and existing registry changelog row
- skills/workflow: Best API source rule, generated skill mirror, and Plate Vision
- reverted/quarantined: none

Needs review:

- Native Microsoft Word rendering was not opened. Package XML proves CSS
  transport and whitespace; Browser proves the live action path.
- The in-app browser executed the Word action but did not expose the
  programmatic blob as a download event. No download-event claim is made.

Open risks:

- Native Microsoft Word visual rendering remains uninspected.
- Downstream users of the unreleased DOCX API must pass `stylesheet` when they
  want application presentation. This is the intended hard cut.

Verification evidence:

- `pnpm --filter platejs test:partition:docx`: 111/111 partition tests and 3/3
  focused exporter tests pass.
- `pnpm --filter platejs typecheck:partition:docx` and
  `lint:partition:docx`: pass.
- `pnpm --filter platejs build`: pass after one prescribed `pnpm run reinstall`.
- `bun test apps/www/src/registry/registry.test.ts`: 13/13 pass;
  `docx-demo.spec.tsx`: 1/1 pass.
- `pnpm --filter www build:registry`: 366 canonical payloads and 15 sparse
  overlays generated.
- `NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter www typecheck`: full
  editor, API reference, docs, registry, route type, app TypeScript, and package
  integration command passes. The first default-heap attempt exhausted 4 GB.
- `pnpm brl`: 4/4 package barrel jobs pass.
- `pnpm install` and `sync-resources.mjs --check`: generated resources exact.
- Registry changelog generator check: 110/110 source entries pass.
- Source audit: no package preset, no stale `customStyles`, exact `stylesheet`
  input present, copied preset and caller present in source and generated `/r`.
- Browser: fresh `/blocks/docx-demo` returned 200, rendered the DOCX editor,
  exposed `Export as Word`, accepted the action, and logged no browser/server
  application errors.

Agent-native review:

| User action                          | Agent route                       | Source owner                                   | Mirror / doc                 | Proof                                 | Status |
| ------------------------------------ | --------------------------------- | ---------------------------------------------- | ---------------------------- | ------------------------------------- | ------ |
| Configure DOCX presentation          | DOCX docs and `platejs/docx` API  | copied `docx-export.tsx` plus package exporter | generated `/r` and DOCX docs | package XML, registry oracle, Browser | pass   |
| Review serializer/exporter ownership | `best-api repair`                 | `.agents/rules/best-api.mdc` and Plate Vision  | generated Best API skill     | install plus exact resource check     | pass   |
| Verify the product action            | Browser route `/blocks/docx-demo` | export toolbar and DOCX example                | registry metadata            | editor/menu/action/error checks       | pass   |

- Verdict: PASS.
- Accepted findings: none.
- Rejected findings: none.
- Source ownership is correct: the rule source was edited and its generated
  skill was regenerated.

Final handoff contract:

- Source roots inspected: package DOCX exporter/converter, registry DOCX
  kit/static renderers/toolbar/example, docs, release artifacts, Best API, and
  Plate Vision.
- Candidate count and top recommendation: six; delete the package theme and
  make the registry pass one exact stylesheet.
- Cleanup counts: delete 1, merge 1, simplify 2, split 0, keep 1, defer 0,
  reject 1, plan 1.
- Agent-navigation score changes: understanding presentation drops from a
  hidden package-plus-registry merge rule to one copied preset and one literal
  package input.
- Packets applied with keep/revert/quarantine result: package hard cut keep;
  registry/docs/doctrine adoption keep.
- Proof commands/source audits: recorded in Verification evidence.
- Hot-owner pre/post scale receipts or source-backed zero-runtime N/A: N/A;
  the one-export runtime path and cost model are unchanged.
- Rejected/deferred candidates: rejected hidden minimal package stylesheet;
  deferred none.
- Needs-review list: native Word rendering and unavailable in-app download
  event are named above.
- Residual risks: a downstream caller that relied on the unreleased hidden
  theme must pass a stylesheet; this is the intended hard cut.
- Next owner and exact first command/file: none for implementation. A future
  release owner starts from `.changeset/docx-package-topology.md`.

Timeline:

- 2026-09-04T11:02:28.323Z Architecture-cleanup goal plan created.
- 2026-09-04 Focused DOCX proof passed; package packet kept.
- 2026-09-04 Registry, docs, release artifacts, and doctrine adopted; packet kept.
- 2026-09-04 Clean reinstall repaired stale mixed source/dist build artifacts.
- 2026-09-04 Broad package/app/generated and Browser proof passed.
- 2026-09-04 Full app typecheck exited zero with an 8 GB Node heap.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Make DOCX export presentation registry-owned with no hidden package theme |
| What have I learned? | Exact caller CSS plus copied registry presentation is the clean owner split; no runtime-scale change is needed |
