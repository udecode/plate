# Hard cut sibling render props

Objective:
Hard-cut Plate sibling render slots to exact lifecycle refs so copied floating
UI registers complete components directly without wrapper callbacks or leaked
host props.

Goal plan:
docs/plans/2026-08-31-hard-cut-sibling-render-props.md

Primary template:
docs/plans/templates/plate-feature.md

Applied packs:

- `package-api`
- `docs`
- `browser`
- `registry-changelog`
- `agent-native`

Flow mode: existing package plus React/registry

Completion threshold:

- Exact sibling prop contracts and runtime calls are covered by type and
  runtime proof.
- Floating and link toolbars register directly and pass browser placement 5/5.
- Package, registry, docs, release, doctrine, mirror, review, feature-checker,
  and goal-checker evidence is resolved without mass-attesting `platejs`.

Verification surface:

- `platejs` focused and full tests, 76-entrypoint typecheck, declaration build,
  package fingerprint, and Plate Next status.
- Copied registry unit tests, registry build/source checks, docs parser, app and
  integration TypeScript, release generators, and two standalone Browser demos.
- Source/mirror and stale-call-shape audits across the affected API, docs,
  plans, rules, and generated skills.

Constraints:

- Work directly in the current `next` checkout; no worktree, commit, push, PR,
  compatibility wrapper, mass package attestation, or unrelated cleanup.
- Preserve unrelated dirty-tree work and distinguish focused proof from broad
  aggregate command failures.
- Edit agent source rules only and regenerate mirrors with `pnpm install`.

Blocked condition:

- No active blocker. Broad `www typecheck` and `check:core` have named unrelated
  failures, while every affected owner check has a direct passing replacement.

Boundaries:

- Source owners: `PlatePlugin.ts`, `PlateContent.tsx`, and
  `PlateContainer.tsx`; copied toolbar families own their default composition.
- No new plugin, hook, compatibility alias, slot abstraction, package export,
  file move, commit, push, or PR.
- `FloatingToolbar` keeps only optional custom children beside the exact slot
  ref. Floating and link toolbars expose no primitive prop passthrough or
  zero-caller option bag.
- `PlateStatic` remains document-node-only and does not render dynamic sibling
  slots.
- Published package and copied registry changes receive separate release
  artifacts.

Feature Manifest:
| Surface | Applies | Owner | Artifacts | Consumer | Proof | Status |
| --- | --- | --- | --- | --- | --- | --- |
| API | yes | best-api + platejs React foundation | exact `EditableSiblingProps` and `ContainerSiblingProps` | plugin authors | public typecheck, runtime key assertions, stale-shape audit | complete |
| Package | yes | plate-plugin-creator | [focused package evidence](#package-file-evidence) | Plate plugin authors | platejs test, typecheck, build, manifest and fingerprint | complete |
| React adapter | yes | plate-ui | exact sibling component invocations | copied and package React UI | runtime ref/key assertions and consumer typecheck | complete |
| Registry UI | yes | plate-ui | `floating-toolbar`, `link`, `remote-cursor-overlay` | copied registry consumers | focused tests, registry build, Browser | complete |
| Composition | yes | plate-ui | direct `afterEditable` registrations and default toolbar children | editor kits and demos | zero forwarding wrappers; explicit children test | complete |
| Scale proof | no | benchmark | N/A: fixed-size ref props replace broader fixed-size host prop spreads with no new runtime owner | users and maintainers | N/A: live source is bounded O(1) and removes work; package/browser correctness covers behavior | N/A: no scale-dependent path changed |
| Registry metadata/examples | yes | plate-ui | generated registry payloads and existing demo metadata | registry installers | `build:registry` and registry source check | complete |
| Docs | yes | docs-creator | English and Chinese toolbar, link, and plugin API pages | public docs readers | source audit, unslop, MDX source build | complete |
| Release artifacts | yes | changeset + registry-changelog | split `plitejs`/`platejs` changesets and transient-geometry registry entry | package and copied-source consumers | manifest check and changelog write/check | complete |
| Proof | yes | plate-feature | command receipts, fingerprints, Browser ledger | maintainers | focused and widened verification below | complete |
| Plate Next attestation | no | plate-next | N/A: `platejs` was already stale at v122 across 970 files | maintainers | N/A: focused changed-file review is complete; full package attestation was not authorized or performed | N/A: package remains stale at doctrine v131 |
| Review/handoff | yes | manual P1 review + agent-native-reviewer | scoped review and capability map | user | next-branch autoreview waiver, source/mirror audit, final checks | complete |

Package file evidence:

- Package: platejs
- Manifest command / file count: `version.mjs fingerprint platejs` (970 files); focused changed-file review (4 files).
- Package fingerprint: sha256:5a68c767e929dc5a66eb06a11dd0eca96fbbb5ab713c8b1c04feb235552088c3
- File: `packages/platejs/src/react/plugin/PlatePlugin.ts`
- File: `packages/platejs/src/react/components/PlateContent.tsx`
- File: `packages/platejs/src/react/components/PlateContainer.tsx`
- File: `packages/platejs/src/react/components/PlateContent.spec.tsx`
- [x] `packages/platejs/src/react/plugin/PlatePlugin.ts` — score: 100 — verdict: hard-cut broad sibling prop bags — owner: platejs React plugin contract — evidence: public JSDoc, 76-entrypoint typecheck, declaration build, stale-type audit — next: none.
- [x] `packages/platejs/src/react/components/PlateContent.tsx` — score: 100 — verdict: pass only `editableRef` — owner: Plate Editable runtime — evidence: exact prop-key test and full platejs suite — next: none.
- [x] `packages/platejs/src/react/components/PlateContainer.tsx` — score: 100 — verdict: pass only `containerRef` — owner: Plate container runtime — evidence: exact prop-key test and full platejs suite — next: none.
- [x] `packages/platejs/src/react/components/PlateContent.spec.tsx` — score: 100 — verdict: own sibling-slot behavior proof — owner: PlateContent test family — evidence: 22 focused tests and 116 full package tasks — next: none.

The package stays stale. No registry version, package attestation, or
`check-core` enrollment is advanced from this focused review.

Package boundary contract:
| Contract | Decision | Evidence |
| --- | --- | --- |
| shared Plate host | keep in `platejs/react` | sibling slots are Plate plugin-to-React host contracts |
| Plite ownership | N/A: Plite does not own Plate plugin sibling slots | no Plite runtime job or dependency changes |
| external dependency ownership | N/A: no dependency delta | `pnpm test:manifests` passed |
| entrypoint direction | unchanged `platejs/react` export | no exported-file or barrel topology change |
| Oxlint coverage | existing Plate source globs cover all touched files | focused Ultracite check passed on eight files |

Phase state:

- current phase: complete
- status: complete
- next phase: user handoff

Phase / pass table:
| Phase | Status | Evidence |
| --- | --- | --- |
| API and package | complete | exact types/runtime plus package proof |
| Registry, docs, release | complete | generated output and current-state docs pass |
| Doctrine and review | complete | v131, exact mirrors, manual P1 and agent-native pass |
| Browser and closure | complete | both routes 5/5; feature and goal checkers pass |

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Feature Manifest complete before source writes | yes | all structural rows, owners, consumers, proofs, and release paths were selected in this plan |
| Flow mode selected | yes | existing package plus React/registry |
| Public API decision owner selected | yes | best-api hard cut: exact ref only; complete component direct |
| Runtime scale applicability resolved | yes | no new layer or scale-dependent work; fixed O(1) prop forwarding is reduced |
| Active goal created | yes | objective points to this plan |
| Docs and release owners loaded | yes | docs-creator, changeset, registry-changelog, unslop |
| Browser route selected | yes | `/blocks/floating-toolbar-demo` and `/blocks/link-demo` |
| Agent source/mirror boundary selected | yes | source `.agents/rules/**`; mirrors via `pnpm install` |
| Package attestation decision | yes | focused review only; existing stale 970-file package remains unattested |

Work Checklist:

- [x] Hard-cut both public sibling prop bags to their exact ref.
- [x] Pass only that ref from Editable and container runtimes.
- [x] Register complete floating and link toolbar components directly.
- [x] Keep explicit floating-toolbar children as the customization path.
- [x] Delete the unused floating/link options and arbitrary `Toolbar` prop
      passthrough instead of publishing a plugin-derived prop extractor.
- [x] Sweep indexed-ref/Pick types, ref-forwarding callbacks, broad
      intersections, runtime host spreads, docs, plans, and agent rules.
- [x] Update current-state English and Chinese docs.
- [x] Split package changesets and update the registry changelog.
- [x] Repair Vision, best-api, plate-plan, plate-plugin-creator, plate-ui,
      docs-creator, Plate Next, and Plate Feature planning/checker doctrine.
- [x] Regenerate and verify agent mirrors.
- [x] Run package, app, registry, docs, browser, review, and checker proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Manifest coverage | yes | run feature checker | `check-plate-feature.mjs` passes all 12 surfaces |
| Selected pack closure | yes | close selected packs | all selected rows and checklists resolved |
| Package proof | yes | run owner-selected package proof | focused 22/22, full 116/116, 76/76 typecheck, build pass |
| Package boundary proof | yes | manifests and scoped lint | manifests pass; eight-file Ultracite pass |
| Scale proof | no | source-backed N/A | fixed O(1) prop set shrinks; no scale-dependent work |
| Registry/browser proof | yes | build and exercise copied UI | registry build pass; both demos 5/5 |
| Docs/release proof | yes | parse docs and validate artifacts | MDX source pass; changeset/changelog checks pass |
| Plate Next attestation | no | record exact N/A | v131 valid; `platejs` remains stale v122 across 970 files |
| P1 autoreview | yes | run P1 or honor repo ban | waived by the root ban on `autoreview` while branch is `next`; focused manual P1 and agent-native reviews pass |
| Goal plan complete | yes | run autogoal checker | plan has no unresolved rows; completion checker passes |
| Barrel/export generation | no | N/A | no export or exported-file topology changed; `pnpm brl` is not applicable |
| Registry generator test | no | N/A | generator/schema/layout unchanged; write/check cover source data |
| Clean pushed-ref proof | no | N/A | local uncommitted candidate; no commit, push, PR, or shipped-state claim |

Agent-Native Review:

Verdict: PASS

| User action | Agent route | Source owner | Mirror/doc | Proof | Status |
| --- | --- | --- | --- | --- | --- |
| choose sibling slot API | best-api | `.agents/rules/best-api.mdc` | generated best-api skill | source/mirror search | pass |
| implement plugin slot | plate-plugin-creator | `.agents/rules/plate-plugin-creator.mdc` | generated plugin skill | source/mirror search | pass |
| compose copied toolbar | plate-ui | `.agents/rules/plate-ui.mdc` | generated UI skill | direct registry source and Browser | pass |
| plan adoption | plate-plan + plate-feature | source rules and feature checker | generated skills and plan template | 15 checker contract tests | pass |
| audit stale shape | plate-next | review law and v131 registry | exact mirrored review law | validate/status and stale-shape audit | pass |

Findings:

- No P0-P1 API, runtime, copied-UI, docs, or agent-native finding remains.
- Full `www typecheck` stops before TypeScript because existing
  `content/docs/meta.json` still lists the removed
  `/docs/components/selection-retention` route. Registry source, Next typegen,
  main app TypeScript, and package-integration TypeScript pass directly.
- `pnpm check:core` stops in the unrelated schema-adoption contract because its
  raw-query allowlist no longer contains the expected 89 calls. All preceding
  core runner, declaration-leak, and declaration-brand gates pass.

Review fixes:

- Replaced four residual indexed-ref/`Pick` spellings with direct
  `EditableSiblingProps` consumption.
- Replaced the floating-toolbar JSX default parameter with an in-body default
  to satisfy stable-default lint.
- Repaired Plate Feature's checker so focused work in an existing package can
  record honest attestation N/A instead of forging a 970-file review; added
  focused-N/A and template-whitespace tests.

Correction sweep:

- Host runtime spreads: 4 patched, 0 remaining in sibling invocation owners.
- Target forwarding callbacks: 2 patched, 0 remaining.
- Indexed-ref/`Pick` teaching: 4 patched across 3 copied component files, 0
  remaining in the affected package/registry/docs/plan/rule scope.
- Broad sibling prop intersections: 2 patched, 0 remaining.
- Toolbar option bags and primitive prop passthroughs: 2 deleted, 0 remaining.
- Deferred: 0 related matches outside the accepted scope.

Browser evidence:

- `floating-toolbar-demo`: 5/5 retry-free runs. Hidden before each selection;
  visible at `(117.8, 115.6)`, `577.5 × 38.2`, opacity 1 on every run.
- `link-demo`: 5/5 retry-free Command-K runs. Hidden before each shortcut;
  visible at `(393.3, 241.1)`, `330.0 × 64.9`, opacity 1 on every run.
- Follow-up prop-cut replay: the 12-button selection toolbar was visible at
  `(338.9, 396.7)`, `577.5 × 38.2`; native Command-K opened the two-input link
  toolbar at `(361.1, 128.9)`, `330.0 × 64.9`. Both had opacity 1 and nonzero
  geometry; the inactive link edit surface remained hidden at zero size.
- Both routes returned HTTP 200. Browser console warnings/errors and
  `Network.loadingFailed` events were empty.
- Final local ref: `next` at `377a77a537971b793a4ddbb34cc13797fdfeee15` with
  uncommitted task inputs.
- Production fingerprint:
  `sha256:e76842a61e1d16375f02bbae7dc5dbbe45ce03eb72e641796c6a4b19ade59649`.
- Test fingerprint:
  `sha256:67ffd8b201c0eec0543a8bf2667f92d8b6a688c6d95fea41626866364ecff2c7`.
- Browser harness fingerprint:
  `sha256:98d1f3e858c5da14fbaa02bde1d7d97750027f105b6daee95b53ae4edd526f17`.

Verification evidence:

- `pnpm --filter platejs test -- PlateContent.spec.tsx`: 22 pass.
- `pnpm --filter platejs test`: 116 tasks pass.
- `pnpm turbo typecheck --filter=./packages/platejs`: 76 tasks pass.
- `pnpm --filter platejs build`: pass.
- Focused registry tests: 9 pass across floating toolbar and collaboration.
- Follow-up floating-toolbar and composition tests: 11 pass, 81 assertions.
- `pnpm --filter www build:registry`: 366 payloads and 15 overlays built.
- `pnpm --filter www build:source`: pass.
- Registry source check, Next typegen, app TypeScript, and package-integration
  TypeScript: pass.
- `pnpm test:manifests`: pass.
- Registry changelog `--write` then `--check`: 96 entries pass.
- Plate Feature checker contracts: 15 pass.
- Plate Next v131 registry and generated resources: valid/exact.
- Package fingerprint: 970 files,
  `sha256:5a68c767e929dc5a66eb06a11dd0eca96fbbb5ab713c8b1c04feb235552088c3`.
- Doctrine fingerprint:
  `sha256:aca5c672ca0046a41b1b433bd55d06ab7a8f2b775346c6ee6eb812c7d4290931`.

Reboot status:

- Current goal, plan, changed owners, fingerprints, browser routes, package
  status, and remaining aggregate failures were reread after doctrine
  regeneration. No source or browser input changed after final proof.

Open risks:

- The candidate is local and uncommitted, so it is not shipped-state proof.
- Existing docs navigation and schema-adoption allowlist drift keep the two
  broad aggregate commands red; affected direct checks are green and the
  failures are outside this API packet.

Release artifacts:

- `.changeset/transient-editor-geometry.md`: `plitejs` major only.
- `.changeset/plate-transient-editor-ui.md`: `platejs` major, including exact
  sibling refs.
- Registry entry/output: `2026-08-31-transient-editor-geometry`, including
  direct complete toolbar registration.
- No `minor` core changeset, barrel update, or generator test applies.

Final handoff contract:

- Outcome: exact ref-only sibling API, direct complete toolbar composition,
  and no fake plugin-derived component prop surface.
- Evidence: package, copied UI, docs, registry, release, browser, doctrine, and
  agent-native checks above.
- Residual risk: unrelated docs-nav and schema-allowlist failures prevent the
  two broad aggregate commands from going green; direct affected checks pass.
- Next owner: none for this local candidate; commit/push/release remains user
  authority.

Timeline:

- 2026-08-31: API hard cut, adoption, doctrine repair, browser proof, and
  focused closure completed.
- 2026-08-31: Follow-up API review deleted unused floating/link option bags and
  broad primitive prop passthrough; the exact slot ref remains the Plate-owned
  contract and optional floating-toolbar children remain local composition.
