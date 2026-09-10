# Plate render contract hard cut

Objective:
Hard-cut Plate rendering to one component binding, one render-metadata grammar,
one structural-slot grammar, and one flat weak-peer override grammar. Migrate
all package, registry, docs, and tests without aliases; preserve scale; leave
Comments untouched.

Flow mode:
Completed one-shot execution after accepted architecture review.

Goal plan:
docs/plans/2026-09-01-plate-render-contract-hard-cut.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:

- performance-observability
- docs
- package-api
- browser
- agent-native

Mode:

- `deep`

Completion threshold:

- Binary readiness: the old public render/component/override grammar has zero
  live authoring consumers in the bounded repo, the final grammar has package
  and inference proof, registry/docs consumers are migrated, the final runtime
  meets the frozen scale budget, browser proof is green, release and doctrine
  artifacts are current, and `check-complete` passes.

Verification surface:

- Plate type/runtime tests, the render scale benchmark, the independent
  Decoration scale guard, `pnpm brl`, registry and API-reference generators,
  docs/source checks, focused Browser proof, `pnpm check:plite:dev`, full
  `pnpm check`, source/mirror parity, and exact stale-symbol scans.

Constraints:

- Execution was authorized by `go all`.
- No public compatibility aliases or runtime shims.
- Comments remain outside this packet.
- Weak overrides never install a target, no-op when it is absent, and yield to
  the target's terminal `.configure()` values.
- Raw Plite `Editable.render*` callbacks remain because they own the low-level
  host job. Plate does not expose them through `PlateContent`.
- No new provider, store, registry, or per-render resolver.

Boundaries:

- In scope: Plate plugin definitions, terminal configuration, weak peer
  overrides, rendering compilation, live/static renderers, editor construction,
  DOCX export adaptation, all repo consumers, docs, tests, exports, benchmark,
  release artifacts, and affected agent doctrine.
- Source owners: `packages/platejs/src/lib/plugin`,
  `packages/platejs/src/react/plugin`,
  `packages/platejs/src/internal/plugin/resolvePlugins.ts`, live/static render
  utilities, and Plate root/container/content components.
- Non-goals: Comments, Plite raw Editable render callbacks, Decoration or
  Annotation semantics, product UI redesign, and serialized document shape.
- Direct Plite boundary: Plite React retains raw renderer callbacks and compiled
  DOM rendering. Plate owns plugin publication and lowering into those
  primitives.

Output budget strategy:

- Named owners were inspected first. Large audits are recorded as counts and
  artifacts instead of pasted command output.

Blocked condition:

- No blocker remains. Package, browser, benchmark, docs, and toolchain failures
  found during execution were resolved locally without changing the target.

Plate Plan state:

- status: complete
- phase: prove-and-hand-off
- next: Comments may start only under its own accepted plan
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Objective, constraints, boundaries, scale budget, release work, browser proof, and Comments exclusion are explicit above. |
| Active goal and plan verified | yes | Goal `01a05353-779c-75e1-abeb-a8fd1a670b7f` used this plan. |
| Current owners read | yes | Base/Plate plugin contracts, resolver/publication, live/static renderers, structural components, consumers, docs, exports, and Vision were inspected. |
| Best API target resolved | yes | Accepted target is root `component`, render metadata, structural `slots`, and flat weak overrides. |
| Runtime scale applicability resolved | yes | Plugin compilation and node/mark rendering repeat by plugin and node count. |
| Pre-acceptance Benchmark probe selected | yes | Frozen 100/1k/5k/10k node cohorts with 4/8/16/32 plugins, exact counters, hashes, warm percentiles, cold time, and bytes. |
| Mode and execution boundary resolved | yes | Deep one-shot execution; Comments excluded. |
| Performance pack selected | yes | Baseline and final receipts use the same source-owned harness. |
| User-facing operation and runtime owner identified | yes | Editor creation plus static/live element, leaf, and text rendering; Plate resolver and render utilities own it. |
| Budget frozen before target measurement | yes | No asymptotic counter growth; warm p95 cap is baseline plus 10% when noise is below 5%, otherwise baseline plus twice packet noise. |
| Production detector decision recorded | N/A: library API | No production telemetry owner exists; synthetic artifacts contain no protected data. |
| Docs lane selected | yes | Current Plate plugin guides, API reference, registry docs, and EN/CN examples. |
| Target and sibling docs read | yes | Plugin components, editor, static rendering, feature/plugin guides, and registry examples were audited together. |
| Docs source owner identified | yes | Package source owns claims; content and registry source own teaching; generated outputs are rebuilt. |
| Public package boundary identified | yes | `platejs`, `platejs/react`, and `platejs/static`; compiler helpers are private. |
| Release artifacts selected | yes | Major `platejs` changeset plus one registry changelog event. |
| Browser route selected | yes | `/blocks/installation-next-02-marks-demo` and `/blocks/preview-markdown-demo`. |
| Browser tool decision recorded | yes | In-app Browser is the correct normal app surface; Chrome/Computer are not needed. |
| Agent-facing action surface identified | yes | Plate component, render, slot, and override authoring rules. |
| Agent source/mirror boundary identified | yes | `.agents/rules/**` is source; `.agents/skills/**` is generated by `pnpm install`. |
| Agent-native reviewer loaded | yes | Reviewer completed after implementation and found no open parity gap. |

Work Checklist:

- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API, docs, tests, exports, and generated reference claims cite live source.
- [x] The reusable public call shape has one accepted `best-api` verdict.
- [x] The scale-sensitive target has matched baseline/final Benchmark receipts.
- [x] Every concept decision records owner, adoption, proof, risk, and verdict.
- [x] Plite owns neutral host rendering; Plate owns plugin publication; copied UI owns styling.
- [x] Public breaks have complete adoption and deletion answers; no bridge remains.
- [x] Execution slices and proof matrix are complete.
- [x] Performance cohorts cover normal, large, stress, and pathological sizes.
- [x] Warm percentiles, cold duration, sample counts, packet noise, bytes, hashes, and deterministic counters are recorded.
- [x] The final target uses the existing runtime topology with no new subscriptions or stores.
- [x] The independent Decoration manager scale guard passes all cohorts.
- [x] Docs claims are source-backed and use current-state reference voice.
- [x] Docs and registry source generation pass.
- [x] Edited prose completed the Unslop file-edit audit with technical literals preserved.
- [x] Package API, export, compatibility, and release impact are explicit.
- [x] A major `platejs` changeset exists.
- [x] A registry changelog source entry exists and generated JSON agrees.
- [x] Generated barrels and registry output are current.
- [x] Browser routes, interactions, DOM outcomes, and console/network caveats are recorded.
- [x] Agent rules were edited at source and generated mirrors are exact.
- [x] Plate Next scoped adoption and extracted-file recovery audits are recorded.
- [x] Comments were not implemented or redesigned by this packet.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | All rows in this table and the work checklist are closed. |
| Fresh source evidence | yes | Recheck final owners and generated output | Final AST scan covered 3,063 TS/TSX files with zero old authoring findings. |
| Best API review | yes | Close all P0/P1 call-shape findings | One grammar remains; no P0/P1 finding is open. |
| Pre-acceptance scale proof | yes | Compare matched baseline and target cohorts | Baseline and target JSON receipts use identical cohorts, sampling, counters, and correctness guards. |
| Production scale rerun | yes | Rerun the final runtime source | Final receipt captured at `2026-09-01T21:50:18.752Z`. |
| Warm latency budget | yes | Stay inside frozen maxima | Pathological compile p95 1483.7085 ms <= 1707.828238 ms; render p95 881.508208 ms <= 947.150738 ms. |
| Large/stress scaling | yes | Pass all four cohorts | Largest observed regression is stress render p95 +9.49%; all counters keep the same growth law. |
| Cold and failure paths | yes | Record cold behavior and ownership | Cold values are in the receipt; no new runtime layer or failure path was added. |
| Payload and fan-out | yes | Record bytes and deterministic work | Final path is 30 bytes smaller per node; 42 compiled plugins and one content/node wrapper in the pathological cohort. |
| Correctness guard | yes | Preserve exact semantic output | Final text, element attributes, wrapper attributes, hashes, live/static tests, and browser DOM checks pass. |
| Detector and privacy | N/A: library runtime | Record a scoped reason | No production detector owner; synthetic fixtures contain no user or tenant data. |
| Performance regression check | yes | Run both owning harnesses | Render contract and Decoration manager benchmarks pass. |
| Docs source-backed claim audit | yes | Verify named APIs and examples | API reference regeneration and full repo check pass; current docs have zero old authoring spellings outside historical migration/release records. |
| Required Unslop pass | yes | Audit edited docs after claims stabilize | File-edit audits found no material prose defect requiring another edit. |
| Requirements disclosure | yes | Separate package, copied-source, and runtime requirements | Docs and this plan name each owner directly. |
| Docs links, routes, and previews | yes | Verify source generation and real demos | `build:source`, registry build, and both standalone demo routes pass. |
| Docs MDX/content parser | yes | Run source build | `pnpm --filter www build:source` passes. |
| Plugin page specifics | yes | Keep plugin pages on final grammar | Package/manual examples use `component`, `render`, `slots`, and flat `override`. |
| Public package boundary proof | yes | Audit exports and package imports | `pnpm brl`, public package smoke, package types, and zero internal export keys pass. |
| Release artifact classification | yes | Record package plus registry deltas | This is a published package breaking API and a copied registry migration. |
| Published package changeset | yes | Add correct package release note | `.changeset/plate-plugin-render-contract.md` marks `platejs` major. |
| Registry changelog | yes | Add source and verify generated JSON | `2026-09-01-plugin-render-contract.mdx`; 106/106 entries pass `--check`. |
| No release artifact | N/A: artifacts required | Avoid a false no-artifact claim | Package changeset and registry changelog are present. |
| Package typecheck/build/test | yes | Run owner and broad checks | `pnpm check:plite:dev` and full `pnpm check` pass. |
| Barrel/export generation | yes | Regenerate barrels | Final `pnpm brl` passes. |
| Browser interaction proof | yes | Exercise rendered output and editing | Marks demo renders `strong/em/u`, accepts input, and preserves marks; preview renders `h2` and decoration attributes. |
| Browser console/network check | yes | Inspect final focused routes | Both focused fresh tabs report zero warnings and errors. |
| Browser final proof artifact | yes | Record route and DOM receipt | Browser receipt is summarized under Browser evidence. |
| Exact case replay | N/A: architecture cut | Record why reporter replay does not apply | No external report or case ID exists. |
| Final ref and fingerprints | yes | Fingerprint measured source | Target JSON records SHA-256 for eleven measured files and current HEAD identity. |
| Clean final runtime | N/A: local candidate | Avoid shipped/fixed wording | Checkout contains concurrent local work and no push was requested; proof is local, not a pushed-ref certificate. |
| Retry-free stability | N/A: no native lifecycle claim | Record the applicable browser scope | DOM rendering and ordinary input were tested once on fresh focused tabs; native selection/paint is not claimed. |
| Agent source/generated sync | yes | Regenerate and verify mirrors | `pnpm install` plus `sync-resources.mjs --check` report exact resources. |
| Agent action discoverability | yes | Audit the route an agent reads | `best-api`, `plate-plan`, `plate-plugin-creator`, `plate-next`, and docs rules teach the final grammar. |
| Agent-native review | yes | Close accepted findings | Verdict PASS; capability map has no gap. |
| P1 autoreview | N/A on `next` | Follow repository review law | AGENTS forbids `autoreview` while the current branch is `next`; full repo checks and scoped audits ran instead. |
| Goal plan complete | yes | Run mechanical plan checker | The final checker command is recorded below and passes. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Owners, constraints, and baseline frozen | Complete |
| Decide | completed | Best API target accepted and hard-cut counterfactual resolved | Complete |
| Implement | completed | Foundation, consumers, docs, registry, doctrine, and release artifacts migrated | Complete |
| Prove and hand off | completed | Benchmarks, browser, full checks, residue scans, and audits pass | Comments planning may begin separately |

Final public grammar:

```tsx
definePlatePlugin('feature', {
  component: 'section',
  render: {
    attributes: ({ node }) => ({ 'data-kind': node.type }),
    mark: {
      placement: 'leaf',
      leafAttributes: { className: 'feature-mark' },
    },
  },
  slots: {
    beforeEditable: FeatureToolbar,
    wrapNodeChildren: FeatureChildren,
  },
  override: {
    foreignPlugin: {
      component: ForeignComponent,
    },
  },
});
```

Decision brief:

- outcome: one public authoring path for each rendering job.
- chosen shape: root `component`; `render.attributes` and `render.mark`;
  structural `slots`; flat weak `override[target]` patches.
- strongest rejected alternative: delete weak overrides and make adapters own
  target membership. That destroys the valid optional-peer adaptation job.
- consequence: deliberate breaking migration with a smaller API and unchanged
  runtime topology.

Decision ledger:
| Surface | Final owner | Adoption | Proof | Risk closed | Verdict |
| --- | --- | --- | --- | --- | --- |
| Node component | Plugin root and terminal/weak configuration | Editor construction, plugins, registry, DOCX, docs | Type/runtime/static/live/browser | Intrinsic tag and static parity | `component` only |
| Node metadata | `render.attributes` | Link, table, registry and tests | Attribute tests and browser DOM | No `as` leakage | keep |
| Mark rendering | `render.mark` | All marks and decorations | Type tests, live/static tests, marks demo | Leaf/text placement ambiguity | discriminated contract |
| Structure | `slots` | Root/content/container/node placements | Component tests and browser | Placement and ref ownership | keep exact placement names |
| Peer adaptation | flat `override[target]` | Package and registry adapters | Absent/target/both/terminal tests | No topology mutation | keep flat weak override |
| Compiler helpers | private internal modules | Public exports and app imports removed | Barrels, package exports, import smoke | Compiler concepts no longer look public | hard-cut |
| Comments | separate owner | No adoption in this packet | Scope/diff audit | Accidental redesign | excluded |

Scale contract:

- Harness: `docs/plans/artifacts/plate-render-contract/benchmark-render-contract.mjs`.
- Baseline: `render-contract-baseline.json`, source identity
  `a6afd55c30e97c74fe895d1ad005ca75413110f3`.
- Final: `render-contract-target.json`, captured
  `2026-09-01T21:50:18.752Z` on Apple M5 Max, Bun 1.3.12.
- Sampling: three warmups, three packets, five samples per packet.
- Normal 100x4: compile +4.01%, render -13.62%.
- Large 1,000x8: compile -4.12%, render -7.75%.
- Stress 5,000x16: compile -2.02%, render +9.49%.
- Pathological 10,000x32: compile -4.44%, render +2.38%.
- Pathological counters: 42 compiled plugins, 31 leaf-attribute mark plugins,
  31 text-attribute mark plugins, one content wrapper, one node wrapper.
- Payload: 30 fewer rendered bytes per node in every cohort.
- Independent guard: Decoration manager reports
  `production-scales`, zero hard-guard failures, and all deterministic/timing
  gates pass in all four cohorts.

Plate Next scoped adoption review:

- verdict: PASS, 100/100 for the render contract scope.
- old API: AST audit of 3,063 TS/TSX files found zero `render.as`,
  `render.node`, nested override, flat legacy render field, or structural-under-
  render authoring.
- public exports: no package export key exposes `internal`; public barrels omit
  pipeline/compiler helpers.
- historical exception: immutable migration/release records may name old APIs;
  current authoring docs and generated API reference do not teach them.
- package attestation: `packages/platejs` remains honestly STALE at Plate Next
  v122. This packet is a cross-cut API adoption audit, not the exhaustive
  whole-package file review required to attest it at doctrine v136.

Extracted/untracked Plate files in scope:
| Path | Bucket | Evidence |
| --- | --- | --- |
| `packages/platejs/src/internal/plugin/getPlateDecorationSources.ts` | merge-existing-owner | Shared compiled-source input; old React-only helper deleted; package/browser proof passes. |
| `packages/platejs/src/internal/plugin/getPluginRenderAttributes.ts` | merge-existing-owner | Shared live/static metadata lowering; old public helper deleted. |
| `packages/platejs/src/lib/utils/pluginNodeClass.spec.ts` | justify-new-proof-tooling | Guards the empty `plite-` regression. |
| `packages/platejs/src/react/utils/getRenderNodeProps.internal.ts` | merge-existing-owner | Existing live compiler stage made private; old public file deleted. |
| `packages/platejs/src/react/utils/pipeRenderElement.internal.tsx` | merge-existing-owner | Existing live pipeline made private; public barrel export deleted. |
| `packages/platejs/src/react/utils/pipeRenderLeaf.internal.tsx` | merge-existing-owner | Existing live pipeline made private; public barrel export deleted. |
| `packages/platejs/src/react/utils/pipeRenderText.internal.tsx` | merge-existing-owner | Existing live pipeline made private; public barrel export deleted. |
| `packages/platejs/src/react/utils/pluginRenderElement.internal.tsx` | merge-existing-owner | Existing element compiler made private and remains directly tested. |
| `packages/platejs/src/react/utils/pluginRenderLeaf.internal.tsx` | merge-existing-owner | Existing leaf compiler made private and remains directly tested. |
| `packages/platejs/src/react/utils/pluginRenderText.internal.tsx` | merge-existing-owner | Existing text compiler made private and remains directly tested. |
| `packages/platejs/src/static/pipeRenderElementStatic.internal.tsx` | merge-existing-owner | Existing static pipeline made private and remains directly tested. |
| `packages/platejs/src/static/pluginRenderElementStatic.internal.tsx` | merge-existing-owner | Existing static element compiler made private. |
| `packages/platejs/src/static/pluginRenderLeafStatic.internal.tsx` | merge-existing-owner | Existing static leaf compiler made private. |
| `packages/platejs/src/static/pluginRenderTextStatic.internal.tsx` | merge-existing-owner | Existing static text compiler made private. |
| `packages/platejs/src/static/utils/getRenderNodeStaticProps.internal.ts` | merge-existing-owner | Existing static metadata compiler made private and remains directly tested. |

Agent-Native Review:

- verdict: PASS.

| User action | Agent route | Source owner | Mirror/doc | Proof | Status |
| --- | --- | --- | --- | --- | --- |
| Design a reusable render API | `best-api` then `plate-plan` | `.agents/rules/best-api*`, `.agents/rules/plate-plan.mdc` | generated skills and Vision | source/mirror check plus version validation | pass |
| Author a Plate plugin | `plate-plugin-creator` | `.agents/rules/plate-plugin-creator*` | generated skill and public docs | inference tests, package types, docs build | pass |
| Audit adoption | `plate-next` | `.agents/rules/plate-next*` | generated skill v136 | AST scan, stale scan, scoped receipt | pass |
| Verify visible behavior | Browser route in the plan | registry source | generated registry payloads | DOM/input/console checks | pass |

- accepted: source rules teach one grammar and name exact proof commands.
- rejected: a wrapper skill or compatibility route would create another choice.
- source/mirror verification: resources exact; doctrine v136 valid with
  fingerprint `sha256:acff90a1ef661721214da2c5e93fb534a18695d97e43b420a71961737bc4c109`.

Browser evidence:

- `/blocks/installation-next-02-marks-demo`: one `strong`, one `em`, and one
  `u`; zero editor `as` attributes; zero empty `plite-` class; typed
  ` render-proof` successfully; marks remained; zero warnings/errors.
- `/blocks/preview-markdown-demo`: heading is `H2`; two bold, one italic, and
  one code decoration attribute; zero editor `as` attributes; zero empty
  `plite-` class; zero warnings/errors.
- `/blocks/playground-demo` is not accepted proof: concurrent schema work leaves
  `codeDrawing` absent from that demo's installed schema. The render cut did
  not touch or mask that separate failure.

Error attempts:
| Error / failed attempt | Count | Different move | Resolution |
| --- | ---: | --- | --- |
| Default www TypeScript heap exhausted | 1 | Run the owner check with the repo-approved 8 GB Node heap | www TypeScript passed. |
| Perf page retained `render.as` | 1 | Migrate the app call to root `component` | Full www typecheck passed. |
| Base heading imported React from the base owner | 1 | Keep base headless and publish dynamic heading rendering in `HeadingPlugin` | Package typecheck/test and lint passed. |
| Entrypoint Turbo derivation was stale | 1 | Regenerate from source | `check:plite:contracts` passed. |
| App imported a non-exported `platejs/react/internal` subpath | 1 | Use the repo-relative internal source only in the dev perf page | Package-integration TypeScript passed; package export stays private. |
| Type-aware lint found duplicate `render` intersection | 1 | Remove the redundant base constituent in `PlatePluginRuntimeShell` | `pnpm lint:type-aware` and full check passed. |
| API-reference config named deleted `NodeComponents` and `getPluginNodeProps` | 2 | Remove both dead decisions and regenerate from package source | API-reference generation and check passed. |
| Full playground demo lacks `codeDrawing` schema membership | 1 | Use focused changed demos and record the unrelated owner failure | Both render demos passed with clean console state. |

Verification evidence:

- `pnpm check` -> pass: lint, type-aware lint, all workspace typechecks, fast
  tests, and 187 slow tests.
- `pnpm check:plite:dev` -> pass: package/app typechecks, package tests, 232
  contracts, 25 benchmark contracts, 46 benchmark targets, public types, four
  package builds, and 3/3 Chromium smoke tests.
- `pnpm --filter platejs typecheck` and `pnpm --filter platejs test` -> pass;
  116 package tests.
- `pnpm brl` -> 4/4 package tasks pass.
- `pnpm --filter www build:registry` -> 366 canonical payloads and 15 sparse
  overlays generated.
- `pnpm --filter www build:source` and API-reference generation/check -> pass.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check` -> 106/106.
- `node .agents/rules/plate-next/scripts/sync-resources.mjs --check` -> exact.
- `node .agents/rules/plate-next/scripts/version.mjs validate --json` -> valid,
  latestVersion 136.
- AST residue audit -> 3,063 files, zero findings.
- Render benchmark and Decoration scale guard -> pass as recorded above.
- Browser DOM/input/console proof -> pass on both focused routes.
- `autoreview` -> intentionally not run because the branch is `next`.

Final handoff prepared:

- Ownership and target API: component/render/slots/flat override, with raw
  Plite rendering unchanged.
- Public breaks and adoption: complete, with no aliases or exported compiler
  helpers.
- Runtime/package/docs/browser decisions: proved by full checks, generation,
  and focused Browser routes.
- Scale: all cohorts pass the frozen budget and deterministic counters.
- Release: major `platejs` changeset plus registry changelog.
- User attention: Comments can start next; the separate playground schema
  failure and stale whole-package Plate Next attestation are not hidden.
- Delivery: local working tree only; no commit or push was requested.

Timeline:

- 2026-09-01T20:24:29.542Z: target, owners, risks, and scale contract locked.
- 2026-09-01T21:50:18.752Z: final performance receipt captured.
- 2026-09-01: full static, package, browser, agent-native, Plate Next, release,
  and plan gates completed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Complete local hard-cut candidate |
| Where am I going? | Separate Comments architecture/delivery plan |
| What is the goal? | One Plate render grammar without Plite or Comments churn |
| What have I learned? | Weak peer adaptation and exact structural placements are real jobs; component registries and public pipeline helpers are not. |
| What have I done? | Implemented, migrated, generated, benchmarked, browser-tested, audited, and documented the cut. |

Open risks:

- `packages/platejs` remains stale in the whole-package Plate Next ledger because
  concurrent local work changed many unrelated owners. Updating its attestation
  without an exhaustive package review would be dishonest.
- The broad playground demo has a separate `codeDrawing` schema-membership
  failure. Focused render demos and package/browser smoke are green.
- The result is local and unpushed. No shipped or fixed-on-remote claim is made.
