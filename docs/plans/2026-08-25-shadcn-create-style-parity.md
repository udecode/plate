# Shadcn create style parity

Objective:
Ship Base-first shadcn-style Plate create flow; done when 16 registry
combinations and direct install/browser gates pass with legacy `/init` removed.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-25-shadcn-create-style-parity.md

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
- `deep`: this changes public registry URLs, copied source, docs, skills, and a
  browser create flow.

Completion threshold:
- All current public registry items materialize and validate for the 16
  supported Base/Radix x Nova/Vega/Maia/Lyra/Mira/Luma/Sera/Rhea combinations.
- Base and Nova are the defaults; Aria fails closed; legacy `new-york` and
  `new-york-v4` resolve only to `radix-nova`.
- Base/Nova remains the one complete canonical registry. The other 15
  combinations are sparse overlays; only genuinely provider-dependent files
  have Base/Radix physical variants.
- The toolbar canary proves raw marker source, Nova output, and at least one
  visibly different non-default style before the wider marker audit proceeds.
- `/create` renders the Plate-only editor picker, provider/style selection,
  isolated preview, preset code, upstream create link, and exact install
  command with no full shadcn designer clone.
- The real shadcn CLI installs one Base/Nova and one Radix/Luma editor in fresh
  Next projects against the local Plate registry and freshly built local v54
  artifacts before Plate `/init`, `/init/md`, and their owner are deleted.
- The copied editor dependency closure resolves from one coherent local v54
  artifact graph. npm and the deployed central directory are post-release smoke
  surfaces, not implementation gates.
- Focused tests, registry generation, task-owned type/build proof, docs parser,
  Browser proof, skill sync/parity, registry changelog, and final
  `check-complete` pass. Broad checks may close with an exact unrelated blocker.

Verification surface:
- Source audits for provider owners, style markers, unsupported styles, stale
  init teaching, website-only aliases, registry-output helper leakage, and
  untouched `templates/**`.
- Focused registry build-target, response, install, dependency, provider, style
  transform, and route tests.
- `pnpm --filter www build:registry`, `pnpm --filter www typecheck`, the owning
  www build/docs checks, and root `pnpm check`, with task-owned proof separated
  from concurrent package or existing docs failures.
- Browser proof on `/create` plus standalone `/blocks/[id]-demo` or `/view/[id]`
  preview routes with console/network inspection.
- One repo-owned shadcn CLI E2E creates and production-builds fresh Base/Nova
  and Radix/Luma Next projects through the official `REGISTRY_URL` override,
  local Plate responses, and freshly built workspace artifacts.
- Live npm and central-directory checks remain post-release smoke only.

Constraints:
- The user accepted this plan and authorized execution with `go`.
- No public runtime provider/style switcher, consumer helper, compatibility
  proxy, redirect, or duplicated common component tree.
- Keep provider and style as independent compile-time/materialization axes.
- Use installed public `shadcn/utils` marker transforms; do not fork the
  transformer. Add a Plate fail-closed wrapper for unknown or unreachable
  markers.
- Keep flat `components/editor`; do not add `/primitives` or `radix-only`.
- Do not commit, push, open a PR, publish, or contact another task/chat.
- Do not inspect, edit, regenerate, restore, or gate `templates/**`; it is
  post-release CI output.
- Do not add style work to maintenance-only `*-classic` items.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.

Boundaries:
- In scope: `apps/www` registry source/build/response/create/preview owners,
  generated registry output on `next`, Plate installation/MCP docs, registry
  changelog, and shadcn sync/parity source rules and ledgers.
- Source owners: upstream `../shadcn` create/directory/style sources; Plate
  `registry-variants.ts`, `registry.ts`, build scripts, registry response,
  style config, preview routes, docs, and `.agents/rules/**`.
- Non-goals: shadcn theme/font/color/template/v0 designer parity, Aria support,
  full physical 16-tree output, runtime switching in consumer code, package API
  changes, ad hoc beta dependency pins, and `templates/**`.
- Package source is unchanged by this packet. Fresh local v54 build artifacts
  simulate the coherent release graph for implementation proof. CI owns later
  publication and deployment smoke.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Stop if the local upstream directory contract cannot preserve `{style}`, the
  copied editor closure cannot build from one coherent local artifact graph, or
  the toolbar canary cannot preserve Base/Nova while producing a real
  non-default style difference. Do not delete `/init` without the repo-owned
  direct-install proof.

Plate Plan state:
- status: active
- phase: execute
- next: delete legacy `/init` and its public teaching
- handoff: local implementation in progress; publication is outside this packet

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | This plan records the accepted provider/style/create contract, proof, hard cuts, non-goals, stop gates, and no-public-mutation boundary. |
| Active goal and plan verified | yes | `get_goal` returned none; goal created against this exact path on 2026-08-25. |
| Current owners read | yes | Upstream create/directory/style sources and Plate registry build/response/preview/init owners were read before target lock. |
| Best API target resolved | yes | `best-api` hard-cut verdict: one upstream `shadcn create` command survives; Plate `/init` is deleted after local end-to-end replacement proof. |
| Mode and execution boundary resolved | yes | Deep, one-shot execution after explicit user acceptance; no commit/push/PR/publish. |
| Docs pack selected | yes | Supporting install/MCP and sync-decision docs are in scope. |
| `docs-creator` loaded | yes | `.agents/skills/docs-creator/SKILL.md` read in full. |
| Docs lane selected | yes | Install/get-started for public docs; source-backed workflow/reference for sync ledgers. |
| Target docs and nearest sibling docs read | yes | `installation.mdx`, `installation/plate-ui.mdx`, and both MCP locale pages read. |
| Docs style doctrine read | yes | `docs-creator/rules/style-and-structure.md` read in full. |
| Documented source owner identified | yes | Live registry config/create command and registry materializer own every public docs claim. |
| Agent-native pack selected | yes | shadcn parity/sync skills and agent action teaching change. |
| Agent-facing action surface identified | yes | `$shadcn-parity`, `$sync-shadcn`, and public shadcn CLI command guidance. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/*.mdc`; regenerate `.agents/skills/**` with `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | `.agents/skills/agent-native-reviewer/SKILL.md` read in full; review required at closure. |
| Browser pack selected | yes | `/create` and isolated editor preview are browser surfaces. |
| Browser route / app surface identified | yes | `/create`, `/view/[name]`, and `/blocks/[id]-demo` where available. |
| Browser tool decision recorded | yes | Use Browser plugin; no native Chrome/OS behavior is involved. |
| Console/network caveat policy recorded | yes | Record both console and registry/iframe network failures; no silent waiver. |
| Observable browser case captured | no | N/A: this is a new product flow, not a report-backed behavior case. |
| Package/API pack selected | yes | Public copied-source/install contract changes; package source does not. Fresh local v54 artifacts own pre-release proof. |
| Public surface or package boundary identified | yes | Plate registry URL/style/provider/create contract plus a local release-artifact simulation; no npm export change in this packet. |
| Release artifact path selected | yes | Registry changelog entry; no package changeset unless implementation unexpectedly changes published package code. |
| `changeset` skill loaded when `.changeset` is required | no | N/A: accepted scope is registry/docs/site infrastructure, not a published package delta. |
| Barrel/export impact decision recorded | no | N/A: no package export or exported file-layout change is planned. |

Work Checklist:
- [x] Refresh `../shadcn` intentionally, record its exact 40-character SHA,
      and verify or repair the central `@plate` directory URL to preserve
      `{style}`.
- [x] Prove the toolbar canary before widening style markers: raw marker source,
      accepted Base/Nova output, and a visible Luma or Lyra difference.
- [x] Re-audit all active non-classic registry source and keep physical
      provider variants only for proven owners; expected count is four, not a
      quota.
- [x] Vendor the eight pinned upstream style CSS inputs with commit and hash
      provenance, isolated from global website CSS.
- [x] Add a fail-closed style-marker wrapper and audit that every marker is
      known, transformable, and placed in a supported static literal.
- [x] Build Base/Nova as the full canonical registry and materialize the other
      15 provider/style combinations as sparse logical overlays.
- [x] Validate every public item for all 16 combinations, provider dependency
      closure, normalized common-file equality, legacy aliases, Base defaults,
      and Aria/unknown-style rejection.
- [x] Remove the four hardcoded Radix website aliases and use a website-only
      preview resolver that is absent from all generated registry payloads.
- [x] Build `/create` last as a thin Plate flow: upstream create link, preset
      code, Base/Radix selector, eight-style selector, editor picker, isolated
      raw-source preview, and exact command.
- [x] Prove fresh Base/Nova and Radix/Luma Next projects through the real shadcn
      CLI, local Plate registry responses, and freshly built local v54 package
      artifacts. Both strict TypeScript and production builds pass.
- [x] Delete `/init`, `/init/md`, `plate-init.ts`, their tests, and all stale
      teaching now that the local replacement proof is green.
- [x] Keep `templates/**` entirely untouched and excluded from proof.
- [x] Add a registry changelog entry for changed copied-source/install behavior;
      do not add a package changeset unless package code enters scope.
- [x] Update shadcn parity/sync source rules and sync ledgers; repair any stale
      `plate-ui` teaching; regenerate mirrors with `pnpm install`.
- [x] Run focused tests, registry generation, docs/source checks, www
      typecheck/build, Browser proof, P1 autoreview, agent-native review, root
      check, source/mirror parity, and final goal-plan check.
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
- [x] Docs pack: every created or edited docs artifact completed the required `unslop` file-edit pass after claims stabilized, with protected literals and technical claims preserved.
- [x] Docs pack: requirement language, when present, separates hard compatibility, layer-specific setup, recommendations, and repo-only implementation details against live owners.
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
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.
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
| Binary readiness | yes | Resolve every readiness condition | All objective gates pass: 16 combinations, both local consumer builds, Browser interaction, and the `/init` hard cut. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Local upstream uses `{style}`; the repo-owned Base/Nova and Radix/Luma create/build gate passes against fresh v54 artifacts. Live npm/directory state is post-release smoke only. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Hard-cut verdict retained one upstream `shadcn create` command and made `/init` deletion conditional on local end-to-end proof. |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Style provenance, local package graph, docs, mirrors, Browser behavior, and hard-cut adoption are closed. Live deployment remains post-release work. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Focused registry, local consumer, Browser, docs, changelog, mirror, and review evidence is recorded below with broad-check caveats separated. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Local candidate, retained compatibility, external gate, proof limits, and next order are explicit below. |
| P1 autoreview | yes | Run with `--max-priority P1` for implementation changes; P2/P3 are opt-in only, or record planning-only N/A | First review found the ungated create defect; final invocation 3 ran two chunks and reported zero findings, `patch is correct` at 0.90 confidence. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-25-shadcn-create-style-parity.md` | Passed with no open checklist, gate, or phase state. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | Registry owners and generated mirrors are source-backed; public MCP teaching uses `shadcn create` and contains no live `/init` command. |
| Required Unslop pass | yes | Run `unslop` in file-edit mode on every created or edited docs artifact; name each file and confirm protected literal content and claims survived | Final audits of this plan and `docs/sync/shadcn/decisions.md` reported zero findings; literals and technical claims are unchanged. |
| Requirements disclosure | yes | Classify requirement claims against package, copied-source, runtime, or build owners, or record N/A | Provider/style output is copied-source/build-time; the website selector is site-only; local directory routing and fresh v54 artifacts own implementation proof. |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | Browser proved `/create`, `/create-preview`, all three editor choices, the upstream preset link, and Base/Nova plus Radix/Luma previews. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | Full www typecheck ran `build:source` and docs source parity successfully. |
| Plugin page specifics | N/A | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | No plugin page entered this packet. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` regenerated mirrors; exact create/style/template clauses match source. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `$shadcn-parity` owns protocol audit; `$sync-shadcn` owns exact upstream sync and the pinned style-refresh command; `plate-ui` owns registry generation/proof. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | PASS: no P0/P1 gap in action, source ownership, context, or proof routing. |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Browser proved default Base/Nova, Radix/Luma Basic selection, command copy, upstream link, preview content, toolbar Bold, and provider-specific link popover. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | `/create` ended with zero warnings or errors. The MCP docs page exposed one existing uncached-data error owned by the broad docs route. |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | Fresh final Browser session and screenshots captured Base/Nova and Radix/Luma; DOM attributes and clipboard matched the selected preset. |
| Exact case replay | N/A | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | This is product architecture, not a reporter-backed behavior fix. |
| Final ref and fingerprints | N/A | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | Local uncommitted candidate; no commit, push, or PR was authorized. |
| Clean final runtime | N/A | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | Local candidate only; no fixed/completed or shipped claim. |
| Retry-free stability | N/A | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | No native selection/paint, DnD, compositor, or React DOM lifecycle claim. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | No npm export or package code changed. Freshly built local v54 artifacts resolve the complete copied editor closure in two production builds. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Registry-only user-visible install output uses the registry changelog; no package changeset. |
| Published package changeset | N/A | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | No published package code or export changed. |
| Registry changelog | yes | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | Updated the 2026-08-25 Base-first source event; `--write` and `--check` agree on 81 events. |
| No release artifact | N/A | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | Registry changelog is the selected release artifact. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | `pnpm g:build` passed all 59 build tasks; both fresh create projects resolved workspace v54 artifacts and passed production builds. |
| Barrel/export generation | N/A | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | No package export or exported file layout changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground and target lock | complete | Accepted plan, live owner reads, `best-api` hard-cut verdict, active goal | Upstream gate and toolbar canary |
| Upstream gate and toolbar canary | complete | Upstream refreshed to `ee628d75dea87325735fafa7c54f5d7d7edb8774`; local directory repair test and 5-case Base/Radix toolbar transform canary are green; live deployment is post-release smoke | Full source/style audit |
| Full source/style audit | complete | 250 active source paths and 67 control/cva/UI candidates audited; four provider owners retained; six marked paths selected; three duplicate visual primitives replaced with shadcn Input/Button | Registry materializer |
| Registry materializer and 16-combination proof | complete | 381 canonical JSON files, 15 overlay directories, 380 items, 6,237 focused assertions, and all 16 x 381 response reads pass | Website preview resolver |
| Website preview resolver | complete | Four canonical editor aliases resolve through website-only adapters; provider-sensitive toolbar and popover select real Base/Radix owners; generated registry payloads exclude the adapters | `/create` and isolated preview |
| `/create` and isolated preview | complete | Thin `/create`, eight preset codes, 48 exact commands, and a CSS-isolated iframe preview passed Browser interaction and clipboard proof | Handoff |
| Local release-artifact simulation | complete | `pnpm g:build` passed 59 build tasks; the repo-owned shadcn 4.19 gate created and production-built Base/Nova and Radix/Luma Next projects with `workspace:54.0.0-beta.0` packages | `/init` hard cut |
| Direct install and `/init` hard cut | complete | Both local direct installs and builds pass; `/init`, `/init/md`, `/init.md`, their owner, tests, and feature flag are gone with no redirect | Handoff |
| Docs, skills, changelog | complete | Public MCP docs, parity/sync/Plate UI source rules, generated mirrors, sync decisions/dashboard, and the 81-event registry changelog agree | Handoff |
| Browser and full verification | complete | 42 focused tests, registry generation, task-file lint, package build, two fresh consumer builds, and Browser proof pass; unrelated broad-check failures are recorded | Handoff |
| Review and handoff | complete | Agent-native review passed; final P1 autoreview invocation ran two clean chunks. The three-invocation cap forbids a fourth run for the same scope. | Handoff ready |

Decision brief:
- outcome target: Plate participates in shadcn `create` with the same Base-first,
  style-aware registry protocol while keeping copied editor source lean.
- chosen shape: Base/Nova full canonical output plus 15 sparse overlays,
  compile-time style markers, four-or-fewer proven provider owners, and a thin
  Plate `/create` UI.
- strongest rejected alternative: 16 complete physical registries or a runtime
  provider/style abstraction shipped to every consumer.
- consequence: build and response infrastructure becomes more deliberate, but
  common copied source stays single-owned and consumers receive no variant
  machinery.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Public command | Plate `/init` preset proxy | `shadcn create @plate/editor-ai --preset <code> --base base` | upstream shadcn create + Plate registry | One public command; no Plate proxy | Delete init after local consumer proof, then update docs/create UI | Two fresh local artifact installs and builds | Post-release directory lag | accepted |
| Provider axis | Base canonical, Radix sparse; site hardwired Radix | Base default, Radix explicit, Aria rejected; site resolver only | registry variants/build/response | Matches shadcn and avoids universal variants | Remove tsconfig aliases; preserve only proven owners | 16-combination tests + output audit | Preview/import resolution | accepted |
| Style axis | URL style collapses to provider | Eight real compile-time styles, Nova default | style config + marker transform + response | URL contract must materially affect source | Mark only style-owned literals; vendor pinned CSS | toolbar canary + full transform tests | Visual regression or dead markers | accepted |
| Storage | Base full + Radix overlay | Base/Nova full + 15 sparse overlays | build targets + materializer | Avoid 16 full trees | Generalize overlay index/merge | item counts, normalized equality, install tests | Build complexity | accepted |
| Preview | Radix-only website imports | raw marked source + selected provider + vendored CSS in iframe | website-only preview resolver | Accurate style/provider preview without consumer helper | isolate CSS and source selection | Browser visual/interaction proof | CSS leakage | accepted |
| `/create` scope | absent | thin Plate picker/preview/command | `apps/www` route/components | Product parity without cloning shadcn designer | Link upstream for broader customization | Browser proof | scope creep | accepted |
| Compatibility | `new-york*` historical routes | aliases to `radix-nova` only | style normalizer | Persisted config compatibility | focused alias tests | response tests | alias lives too broadly | accepted exception |
| Templates | post-release CI output | untouched and ungated | CI | User explicitly excluded templates | none | path source audit | accidental generator writes | accepted |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Upstream gate | `../shadcn` directory/create/style sources | refresh SHA and `{style}` route | current sibling clone | exact source and local directory contract recorded | upstream tests/source audit |
| 2. Canary | Plate toolbar + style wrapper | first markers and transforms | target locked | Nova preserved; Luma/Lyra differs | focused snapshots/audit |
| 3. Materializer | registry build/response/tests | canonical + sparse overlays | canary green | all 16 combinations valid | focused tests + build:registry |
| 4. Website/create | preview resolver + iframe + `/create` | remove Radix aliases and add thin UI | registry outputs green | routes render/interact without leaked helpers | typecheck/build + Browser |
| 5. Hard cut | local registry/package artifacts + init owners | local installs then deletion | fresh v54 artifacts built | Base/Nova and Radix/Luma builds pass and stale init matches are zero | repo-owned E2E + source audit |
| 6. Teaching/release | docs, sync rules/ledgers, changelog | current-state docs and agent routes | implementation stable | mirrors/generated changelog agree | docs checks + `pnpm install` + audits |
| 7. Closure | full diff and proof owners | review, root check, handoff | all slices complete | zero accepted P1 findings and goal check green | autoreview + agent-native review + check-complete |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Provider physical variants stay sparse | Current registry variants name four owners | Full active-source audit and provider closure tests | passed |
| Styles materially change copied code | Upstream marker/CSS model and installed `shadcn/utils` exports | toolbar canary and all-style transform tests | passed |
| Every public item supports every allowed combination | Complete view materialization design | public item x 16 validation and install tests | passed locally |
| Site preview does not contaminate consumers | Website-only resolver boundary | generated payload search for helper/aliases | passed |
| A fresh project can resolve the copied editor package graph | Registry dependency closure plus local package artifacts | actual shadcn CLI create, workspace resolution, strict TypeScript, and production builds | passed for Base/Nova and Radix/Luma |
| `/init` is unnecessary | upstream `create` retains preset components and discovers registries | two local artifact-backed create/build runs plus 404 route proof | passed; deleted without redirect |
| `/create` is useful but narrow | accepted product scope | Browser route, selection, preview, command, clipboard, and console proof | passed |
| Skills/docs teach only the shipped path | source rule and docs owner map | source/mirror parity plus no live init command or Aria path | passed |
| Templates remain outside the task | explicit user boundary | path change/source audit without regeneration | passed |

Conditional evidence:
- High-risk scenarios: local directory drift, silent marker stripping,
  interpolated template literals, provider dependency mismatch, CSS leaking
  outside the iframe, website-only resolver leaking into copied output, and
  deletion of `/init` before coherent local artifact and direct-install proof.
- External research: local `../shadcn` at one exact refreshed SHA is the primary
  authority; live directory/npm checks are post-release smoke authority.
- Issue/PR provenance: N/A. No public issue/PR mutation is authorized.
- Docs/registry/browser/release owners: docs pack, `registry-changelog`, Browser,
  `plate-ui`, shadcn parity/sync, `best-api`, and `release-lanes`. This packet
  changes no Plite behavior law.

Findings:
- Installed shadcn 4.19 exposes `createStyleMap` and `transformStyle`; Plate can
  wrap the public transformer instead of copying it.
- Current Plate public style URLs normalize to Base/Radix only, so all eight
  style names are labels rather than material output.
- Current Plate provider source ownership is four physical component families;
  the website bypasses the Base default through four Radix tsconfig aliases.
- Upstream shadcn owns eight active style CSS sources: Nova, Vega, Maia, Lyra,
  Mira, Luma, Sera, and Rhea. Kibo/Reui are not current inputs.
- Upstream marker transforms silently strip unknown markers and do not support
  interpolated template expressions; Plate needs stricter preflight validation.
- The local upstream directory owner preserves `{style}`; deployment status is
  outside the implementation gate.
- `../shadcn` was intentionally fetched and fast-forwarded to
  `ee628d75dea87325735fafa7c54f5d7d7edb8774`. The refreshed source initially
  lacked `{style}` for `@plate`; the repaired local upstream owner uses
  `https://platejs.org/r/{style}/{name}.json` with a route regression test.
- Eight upstream style CSS files are vendored at the refreshed SHA with SHA-256
  provenance. The strict wrapper uses public `shadcn/utils`, intersects all
  eight marker maps, rejects unknown/unreachable markers, and repeats the
  upstream pass only to support legitimate duplicate static markers.
- The Base and Radix toolbar canary uses `cn-toggle`, size/variant, and
  tooltip markers. Nova materializes rounded output; Lyra materializes square
  output in both provider sources.
- Exhaustive active-source inventory found 250 unique installed source paths and
  67 files with cva, raw-control, role, or shadcn UI signals. The style owners
  are `toolbar`, `floating-popover`, `inline-combobox`, and `link`; six physical
  paths carry markers because two owners vary by provider. Editor document
  renderers, media-preview controls, resize handles, table grid cells, blocks,
  examples, and classic files stay style-neutral. Link, Media Toolbar, and Font
  Size reuse shadcn Input/Button instead of duplicating their visual contract.
- The generated shape is Base/Nova canonical with 380 items and 381 JSON files.
  Seven Base style overlays contain four item payloads each. `radix-nova`
  contains the four provider payloads plus a sparse four-item registry index;
  the other seven Radix overlays contain those plus the two shared style item
  payloads. No complete 16-tree output exists.
- The `editor-basic` closure contains 137 Plate registry items and resolves
  through freshly built local v54 artifacts. The durable gate copies package
  manifests, `dist`, and declared release files into a temporary pnpm workspace,
  then requires `@platejs/plite` to resolve with a `workspace:` specifier.
- The consumer proof exposed and repaired four copied-project defects:
  `@ai-sdk/gateway` needed a v3 pin, `@types/lodash` was missing,
  `lib/suggestion.ts` collided with the component of the same name, and the
  date/link sources had stale strict-TypeScript contracts.
- npm `latest` may remain v53 and omit new names before release. That is a
  deployment fact, not evidence against the locally proven implementation.

Decisions and tradeoffs:
- Keep provider/style axes independent -> matches shadcn and avoids names such
  as `radix-only` -> requires a combination normalizer and overlay key.
- Keep one full canonical output -> minimizes generated duplication -> response
  materialization and proof must be stronger.
- Use only upstream `cn-*` markers -> preserves transformer parity -> v1 cannot
  express arbitrary Plate-only style concepts without upstream support.
- Alias only persisted `new-york*` values -> protects real saved configs -> no
  general compatibility layer survives.
- Delete `/init` after local artifact-backed proof -> hard cut stays
  evidence-based without conflating implementation and deployment.
- Reject beta pins or dependency deletion -> they hide dependency drift or
  silently remove editor behavior -> simulate one coherent local release graph.

Review fixes:
- Added the exact pinned-style refresh command to the `sync-shadcn` source rule
  so an agent can repeat the accepted upstream maintenance action without
  hidden chat context.
- The earlier P1 gate prevented exposure before replacement proof. The
  repo-owned Base/Nova and Radix/Luma create/build runs now satisfy that gate,
  and the feature flag is absent.

Agent-native review:

| User action | Agent route | Source owner | Mirror / doc | Proof | Status |
| --- | --- | --- | --- | --- | --- |
| Audit Plate against shadcn | `$shadcn-parity` | `.agents/rules/shadcn-parity.mdc` | `.agents/skills/shadcn-parity/SKILL.md` | source/mirror search plus focused registry proof | pass |
| Sync a reviewed upstream range | `$sync-shadcn` | `.agents/rules/sync-shadcn.mdc` | `.agents/skills/sync-shadcn/SKILL.md` | exact SHA, style sync command, tests, branch-aware registry build | pass |
| Maintain provider/style output | `$plate-ui` via the accepted sync slice | Registry style config, transform, materializer, and response owners | Plate UI mirror and registry changelog | 16-combination tests plus `build:registry` | pass |
| Exclude post-release templates | `$shadcn-parity` and `$sync-shadcn` | Both source rules | Both generated mirrors | exact `templates/**` exclusion search | pass |
| Prove the package graph locally | `$shadcn-parity` implementation gate | `pnpm g:build` plus the repo-owned create E2E | temporary pnpm workspace | two strict consumer builds | pass |
| Publish and deploy later | `$release-lanes` plus shadcn-ui deployment owner | existing release workflow and local upstream patch | npm and live directory | post-release smoke | outside this local packet |

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| First duplicate-marker proof used unsupported free `cn()` calls; toolbar dropdown wrapped the cva base in `cn()` | 1 | Use static `cva()` string literals, the placement supported by upstream | Wrapper multi-pass plus static cva placement passes; interpolated/unreachable placements still fail closed |
| Two exploratory audit commands streamed more source/generated content than intended | 2 | Use active-path counts, filename inventories, and manifest summaries only | Subsequent audits were bounded to 250 paths, 67 candidates, overlay counts, and focused files |
| Tailwind scanned generated registry JSON and emitted escaped selectors | 1 | Exclude `public/r` and `src/__registry__` from automatic source discovery and prove the compiled CSS | PostCSS proof emits valid selectors only; focused regression test passes |
| Browser tab fell onto Chromium's local `data:` unreachable page during the dev-server restart | 1 | Do not bypass Browser policy or substitute another browser | Fresh Browser replay on `localhost` passed the complete interaction path |
| Broad typecheck rejected two test assertions because literal unions narrowed the expected value | 1 | Compare the computed string as the received value | Focused tests and the task-stable www typecheck passed |
| Production build prerendered existing docs and CN routes with uncached data above TooltipProvider | 1 | Preserve the successful compile result and keep this unrelated route failure outside the create/registry patch | `next build` compiles, then fails on `/docs` and `/cn/docs`; no touched owner appears in the stack |
| First P1 review found that the ungated `/create` commands could resolve through a stale deployed directory | 1 | Gate route exposure until local end-to-end replacement proof exists | The local create/build gate passes and the temporary feature flag is absent |
| Enabled `/create-preview` read `searchParams` outside a Cache Components boundary | 1 | Put the async parameter consumer inside React Suspense | Enabled Radix/Luma preview returns 200; Next MCP reports zero compilation issues and the server log has no prerender/runtime error |
| Fresh shadcn CLI create initially fell through to npm and returned 404 for `@platejs/plite` | 1 | Simulate the coherent release graph with freshly built local package artifacts | Both Base/Nova and Radix/Luma resolve `workspace:54.0.0-beta.0` and production-build successfully |
| Fresh consumer builds found gateway, lodash typing, import-collision, calendar, and DOM-event contract failures | 4 | Fix each copied-source dependency or type owner, regenerate, and rerun the same gate | The repo-owned two-case create/install/build script passes from scratch |
| Root lint tried to rewrite the eight hash-pinned upstream style inputs | 1 | Exclude the vendored style directory from formatting instead of mutating upstream bytes | All eight SHA-256 values still match provenance; task-owned registry components and changelog are formatted and lint-clean |
| Final www typecheck reached concurrent incomplete Plite API edits | 1 | Keep unrelated `isBlock`, `duplicate`, selection, and export repairs outside this packet | The task-stable www typecheck passed earlier; both fresh copied-project builds pass strict TypeScript on the final registry output |

Verification evidence:
- command (`/Users/zbeyens/git/shadcn`): `pnpm exec vitest run apps/v4/app/r/registries.json/route.test.ts` -> 12/12 passed after the Plate `{style}` directory repair.
- command (`/Users/zbeyens/git/plate-2/apps/www`): `bun test scripts/registry-style-transform.test.mts` -> 5/5 passed for provenance, marker intersection, Nova/Luma difference, fail-closed errors, duplicates, and Base/Radix toolbar canary.
- command (`/Users/zbeyens/git/plate-2`): `pnpm --filter www build:registry` -> passed; generated 381 Base/Nova payloads and 15 sparse overlays.
- command (`/Users/zbeyens/git/plate-2/apps/www`): focused build-target/materializer/transform/response/runtime suites -> 24 tests, 6,237 assertions passed, including every public JSON payload under all 16 combinations.
- command (`/Users/zbeyens/git/plate-2/apps/www`): eight focused suites -> 39 tests and 7,648 assertions passed, including every public payload under all 16 combinations and Tailwind generated-source exclusion.
- command (`/Users/zbeyens/git/plate-2/apps/www`): final eight-suite rerun -> 42 tests and 7,663 assertions passed, including all 16 combinations and 48 public commands.
- command (`/Users/zbeyens/git/plate-2`): task-stable `pnpm --filter www typecheck` -> passed editor generation, API/docs parity, registry source validation, Next route typing, app TypeScript, and package-integration TypeScript. Later retries exposed concurrent incomplete Plite API work: one reached shared-package TypeScript failures; the final retry stopped in API-reference extraction because `EditorBlockResetOptions` was neither included nor excluded. Task-owned strict TypeScript remains green in both fresh consumer builds.
- command (`/Users/zbeyens/git/plate-2`): task-scoped `pnpm exec ultracite check ...` -> all 36 matched files formatted and lint-clean.
- command (`/Users/zbeyens/git/plate-2`): final task-scoped `pnpm exec ultracite check ...` -> all 52 matched create, registry-style, rule, config, and changelog source files are formatted and lint-clean.
- command (`/Users/zbeyens/git/plate-2`): post-closure task-scoped Ultracite over
  `oxfmt.config.ts`, the 185 editor component files, the changelog source, and
  vendored styles -> clean; vendored CSS remains ignored and all eight hashes
  match the pinned upstream commit.
- command (`/Users/zbeyens/git/plate-2`): `node tooling/scripts/generate-ui-changelog-entries.mjs --write` and `--check` -> 81 source events and generated JSON agree.
- command (`/Users/zbeyens/git/plate-2`): `pnpm install` -> generated shadcn parity/sync/Plate UI skill mirrors refreshed from source rules.
- command (`/Users/zbeyens/git/plate-2`): `pnpm --filter www build` -> registry and production compilation passed; static generation stopped on existing `/docs` and `/cn/docs` uncached-prerender errors above `TooltipProvider`.
- command: `pnpm g:build` -> 59/59 package build tasks passed and produced fresh
  local release artifacts.
- command: `pnpm --filter www test:create-install` -> shadcn 4.19 created fresh
  Base/Nova and Radix/Luma Next projects through the local `{style}` directory
  and registry; both resolved `@platejs/plite` as `workspace:54.0.0-beta.0`,
  passed strict TypeScript, and completed production builds.
- command: final registry proof -> 42 tests, 7,663 assertions, zero failures;
  `build:registry` regenerated 381 canonical payloads and 15 overlays; the
  81-event changelog check passed.
- command: root `pnpm check` -> stopped in `pnpm lint` on 24 format failures and
  eight Oxlint errors in concurrent Plite/package work outside this packet. The
  task-owned registry/style/changelog scope is clean.
- runtime: `/create` returns 200; `/init`, `/init/md`, and `/init.md` return 404.
  Browser proved Base/Nova and Radix/Luma selection, preview rendering, Bold,
  the provider-specific link popover, upstream URL, and exact clipboard text.
  `/create` ended with zero warnings or errors.
- final Browser reload after the last `create-client.tsx` edit: Radix/Luma Basic
  rendered `Weekly notes`; preview attributes, command, and clipboard matched
  `b1VlIttI`; zero warning/error logs; final screenshot captured.
- source audit: legacy init route/helper/test/server owners, feature flags, and
  public `platejs.org/init` teaching are absent. Both MCP locales and the dialog
  resolve the direct Base/Nova `shadcn create` command.
- review: final task-scoped `.agents/skills/autoreview/scripts/autoreview --mode local --max-priority P1` invocation ran two chunks with zero findings and reported `patch is correct` at 0.90 confidence.
- command: `check-complete.mjs` passed after the evidence ledger reached zero
  open checklist items, completion gates, and phases.

Final handoff prepared:
- Ownership and target API: upstream shadcn owns `create` and preset encoding;
  Plate owns registry output and the thin `/create` surface.
- Public breaks and adoption: `/init` and `/init/md` are deleted with no alias;
  public teaching points to shadcn create and `/create`.
- Applicable runtime/package/docs/browser decisions: registry changelog added;
  no package source or barrel work in this packet; Browser proof is complete.
- Proof and execution risks: local registry/type/package/consumer proof is
  green; unrelated root lint, concurrent package type errors, and broad docs
  prerender remain outside this packet.
- Execution result: legacy init owners are deleted, public docs use shadcn
  create, the feature flag is gone, and scoped closure is green.

Timeline:
- 2026-08-25T13:31:30.249Z Plate Plan created.
- 2026-08-25 Upstream fetched and fast-forwarded from `d4fc45b1f` to
  `ee628d75d`; the 2-commit / 24-file `apps/v4` delta was recorded.
- 2026-08-25 Repaired upstream `@plate` directory URL and passed its 12-test
  route suite. No commit, push, PR, publish, or cross-task message occurred.
- 2026-08-25 Vendored eight pinned style CSS inputs, added the strict public-transform wrapper, marked both toolbar providers, and passed the focused canary.
- 2026-08-25 Completed the active-source/provider/style audit, reused canonical
  shadcn primitives where possible, generated Base/Nova plus 15 overlays, and
  passed the 16-combination response matrix.
- 2026-08-25 Added the thin create and isolated preview routes, repaired
  Tailwind generated-source discovery, refreshed agent doctrine and changelog
  artifacts, and passed focused lint, tests, registry generation, and www
  typecheck. Live directory deployment was classified as post-release work.
- 2026-08-25 Accepted P1 review findings by gating `/create`, repaired the
  Cache Components preview boundary, proved disabled/enabled HTTP behavior and
  zero Next MCP compilation issues, then completed final P1 review invocation 3
  with zero findings across two chunks.
- 2026-08-25 Corrected the proof boundary: npm is post-release smoke. Built the
  local v54 graph, added a repo-owned shadcn create gate, repaired five consumer
  defects, and production-built fresh Base/Nova and Radix/Luma Next projects.
- 2026-08-25 Ran root check, excluded byte-pinned upstream CSS from formatting,
  formatted the task-owned registry packet, regenerated output, and reran
  focused proof plus www typecheck. Root lint now fails only in concurrent
  Plite/package files outside this task.
- 2026-08-25 Deleted `/init` without a redirect, updated public MCP teaching,
  enabled `/create`, completed Browser interaction proof, and reran the final
  42-test, registry-generation, changelog, and two-consumer gates.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Local implementation is complete: 16 combinations, both release-simulation installs, Browser proof, and the `/init` hard cut pass |
| Where am I going? | Publication and deployed-directory smoke belong to the later release workflow |
| What is the goal? | Ship 16 provider/style combinations and direct shadcn create with legacy `/init` removed |
| What have I learned? | Consumer builds are the honest pre-release gate; npm availability only proves deployment |
| What have I done? | Refreshed upstream, materialized 16 views, shipped the local create flow, deleted init, and production-built fresh Base/Nova and Radix/Luma consumers |

Open risks:
- The deployed shadcn directory and npm graph may lag until release. Verify them
  after publication; do not use that lag to block local implementation.
- The broad production build reaches successful compilation but static
  generation is blocked by existing docs/CN uncached-prerender behavior.
- Root check is blocked by concurrent Plite/package lint work outside the
  create/style packet. The latest www typecheck retry is also blocked by the
  incomplete shared `EditorBlockResetOptions` API-reference edit; both final
  generated consumers pass strict TypeScript and production builds.
