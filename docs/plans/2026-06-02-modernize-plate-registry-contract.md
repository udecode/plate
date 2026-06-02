# Modernize Plate registry contract

Objective:
Keep Plate registry source aligned with shadcn registry conventions while making generated public item JSON safe for direct URL installs.

Task source:
- type: user request
- title: simplify Plate registry toward current shadcn registry behavior
- acceptance criteria: source registry uses `@plate/*` for Plate self-dependencies and bare names for upstream shadcn items; public generated item JSON rewrites Plate self-dependencies to same-base `.json` URLs; direct/local install adapters keep compatibility; docs do not recommend unsafe version-pinned raw aggregate installs.

Completion threshold:
- Registry dependency helpers enforce the source-vs-public split.
- Build/check scripts assert the public generated contract has no `@plate/*` dependencies.
- Docs registry output follows the same public URL behavior.
- Installation docs avoid raw aggregate JSON for version-pinned docs.
- Browser, typecheck, lint, focused tests, source checks, and autoreview are clean.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-02-modernize-plate-registry-contract.md` passes.

Verification surface:
- `pnpm --filter www exec bun test scripts/registry-dependencies.test.mts src/lib/plate-init.test.ts src/app/r/registries.json/route.test.ts`
- `pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-registry-source.mts`
- `pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-docs-source-parity.mts`
- `pnpm lint:fix`
- `pnpm --filter www typecheck`
- Browser proof on `http://localhost:3003/r/registries.json`, `http://localhost:3003/init/md`, `/docs/installation/docs`, and `/cn/docs/installation/docs`
- `.agents/skills/autoreview/scripts/autoreview --mode local`

Constraints:
- Do not run `build:registry` locally; generated registry output is CI-owned.
- Do not change package exports, manifests, or templates.
- Preserve public `@plate` registry install docs and init flow.
- Do not commit or push unless the user asks.

Boundaries:
- Source of truth: `apps/www/src/registry/**`, `apps/www/scripts/**`, install docs, and `.agents/rules/shadcn-parity.mdc`.
- Allowed edit scope: registry dependency helpers/checks/build scripts, local template adapter, install docs warning, agent rule, and this plan.
- Browser surface: exposed registry/init routes plus rendered install docs.
- Tracker sync: N/A, chat-only task.
- Non-goals: rebuilding `public/r`, redesigning registry item content, package release work, or replacing shadcn CLI behavior.

Output budget strategy:
- Searches were scoped to registry/docs keywords and capped with `max_output_tokens`; broad generated output was not streamed.

Blocked condition:
- None. Local dev server was already available on port 3003.

Task state:
- task_type: implementation
- task_complexity: medium
- current_phase: final response
- current_phase_status: complete
- next_phase: final response
- goal_status: plan-only because an unrelated paused active goal prevented creating a new autogoal state.

Current verdict:
- verdict: complete
- confidence: high
- next owner: user
- reason: source, public output, docs, and agent rule contracts agree.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | autogoal/task/shadcn/browser/autoreview workflows used |
| Active goal checked or created | yes | existing unrelated paused goal blocked new goal; file plan used instead |
| Source of truth read before edits | yes | registry scripts, source registry files, install docs, and shadcn parity rule read |
| Tracker comments and attachments read | N/A | no tracker |
| Video transcript evidence required | N/A | no video |
| `docs/solutions` checked for non-trivial existing-code work | N/A | local source ownership was direct and sufficient |
| TDD decision before behavior change or bug fix | yes | focused helper/check tests added before closeout |
| Branch decision for code-changing task | N/A | no user request to branch |
| Release artifact decision | yes | no package release; no changeset |
| Browser tool decision for browser surface | yes | Browser used on local dev server |
| PR expectation decision | N/A | no PR requested |
| Tracker sync expectation decision | N/A | no tracker |
| Output budget strategy recorded | yes | scoped searches and capped output |
| Browser pack selected | yes | local docs/registry route proof |
| Browser route / app surface identified | yes | `/r/registries.json`, `/init/md`, install docs routes |
| Browser tool decision recorded | yes | in-app Browser with Node REPL bridge |
| Console/network caveat policy recorded | yes | route/text checks only; no interactive console state relevant |
| Docs pack selected | yes | installation docs warning changed |
| `docs-creator` loaded | N/A | warning is a narrow correctness fix |
| Docs lane selected | yes | installation docs |
| Target docs and nearest sibling docs read | yes | English and Chinese installation docs |
| Docs style doctrine read | yes | current-state warning, no changelog framing |
| Documented source owner identified | yes | registry generator/check scripts own install behavior |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, title, acceptance criteria, likely files/routes, browser surface, and root-cause layer.
- [x] Required video or screen-recording evidence is N/A: no video.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: source registry names stay authored; public generated output rewrites direct-install dependencies.
- [x] Release artifact requirement recorded: N/A, no package release or registry component changelog.
- [x] Final handoff shape decided: concise chat summary with commands/browser/review.
- [x] Branch handling recorded: N/A, no branch requested.
- [x] Local-env-rot retry policy recorded: N/A, no surprising install corruption.
- [x] Workspace authority recorded: all commands ran in `/Users/zbeyens/git/plate`.
- [x] High-risk note recorded: public registry contract can break direct installs; source checks and tests assert no `@plate/*` public deps.
- [x] Review/autoreview target selected: dirty local review.
- [x] Agent-native review decision recorded: N/A, rule wording only; autoreview covered the contradiction.
- [x] Output budget discipline recorded and followed.
- [x] Browser pack: route, interaction path, and expected visible outcome recorded.
- [x] Browser pack: browser proof uses repo-approved Browser tool.
- [x] Browser pack: console/network errors N/A for static JSON/markdown route proof; HTTP route health checked where Browser navigation timing was suspect.
- [x] Browser pack: exact route proof ready for final handoff.
- [x] Docs pack: docs lane, target docs, and source owner recorded.
- [x] Docs pack: named routes/components backed by registry source and checks.
- [x] Docs pack: docs use current-state reference voice.
- [x] Docs pack: links/routes verified by Browser or HTTP.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | run commands and browser proof | all verification commands listed below |
| Bug reproduced before fix | yes | shadcn build probe proved `@plate/*` is not rewritten by CLI | temp registry probe kept `@plate/child` unchanged |
| Targeted behavior verification | yes | focused tests and source checks | passed |
| TypeScript or typed config changed | yes | `pnpm --filter www typecheck` | passed |
| Package exports or file layout changed | N/A | no package exports/layout | N/A |
| Package manifests, lockfile, or install graph changed | N/A | no manifest edit | N/A |
| Agent rules or skills changed | yes | run `pnpm install` after rule edit | passed |
| Workspace authority proof | yes | owning app commands in `/Users/zbeyens/git/plate` | passed |
| Browser surface changed | yes | Browser route proof | passed |
| Browser final proof | yes | exact Browser route booleans recorded | passed |
| CI-controlled template output changed | N/A | no template output edited | N/A |
| Package behavior or public API changed | N/A | docs app registry behavior only | N/A |
| Registry-only component work changed | N/A | no registry component content change | N/A |
| Docs or content changed | yes | typecheck and Browser proof | passed |
| High-risk mini gate | yes | direct URL dependency failure mode checked | public output converts Plate deps to same-base URLs |
| Agent-native review for agent/tooling changes | N/A | no action tooling behavior changed | N/A |
| Local install corruption suspected | N/A | no corruption signal | N/A |
| Autoreview for non-trivial implementation changes | yes | local autoreview until clean | clean |
| PR create or update | N/A | no PR requested | N/A |
| Task-style PR body verified | N/A | no PR | N/A |
| PR proof image hosting | N/A | no PR | N/A |
| Tracker sync-back | N/A | no tracker | N/A |
| Final handoff contract | yes | concise final response | ready: final response will list changed contract and proof commands |
| Final lint | yes | `pnpm lint:fix` | passed |
| Output budget discipline | yes | no unbounded stream | passed |
| Goal plan complete | yes | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-02-modernize-plate-registry-contract.md` | passed |
| Browser interaction proof | yes | approved Browser route proof | passed |
| Browser console/network check | N/A | static route/text proof; HTTP 200 checked for localized route | N/A: no interactive browser flow or network mutation |
| Browser final proof artifact | yes | exact URL/text booleans recorded | passed |
| Docs source-backed claim audit | yes | install warning aligned with generated dependency contract | passed: warning matches public dependency rewrite behavior |
| Docs links / routes / previews | yes | install docs routes render | passed: English and Chinese routes rendered in Browser |
| Docs MDX/content parser | yes | `pnpm --filter www typecheck` runs Fumadocs source generation | passed |
| Plugin page specifics | N/A | no plugin page | N/A: install docs only |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | registry scripts, docs, shadcn rule read | implementation |
| Implementation | complete | helper/build/docs/rule patches | verification |
| Verification | complete | tests/source checks/lint/typecheck/browser | autoreview |
| Review fixes | complete | fixed raw docs URL warning, rule contradiction, unfinished plan stub; final autoreview clean | final response |
| Closeout | complete | final plan check ready and final response pending | final response |

Findings:
- The shadcn CLI does not rewrite custom `@plate/*` registryDependencies for direct item JSON installs.
- Public generated Plate registry dependencies must be same-base `.json` URLs.
- Raw GitHub aggregate docs item installs can mix versions through transitive live registry dependencies.

Decisions and tradeoffs:
- Keep `@plate/*` as the authored source contract because it is compact, shadcn-like, and checkable.
- Emit same-base URLs only at the public generated boundary because direct URL installs need resolvable transitive Plate items.
- Do not run `build:registry`; CI owns generated `public/r`.
- Keep bare shadcn item names, not `@shadcn/*`.

Implementation notes:
- `registry-dependencies.mts` owns source, public, and local-file dependency normalization.
- `build-registry.mts` and `build-docs-registry.mts` transform source dependencies before public output.
- `check-registry-source.mts` and `check-docs-source-parity.mts` assert both source and public contracts.
- `prepare-local-template-registry.mjs` keeps old URL/local sync compatibility.
- Install docs now reject raw aggregate JSON for version-pinned full docs.
- `shadcn-parity.mdc` now documents the source-vs-public split.

Review fixes:
- Fixed autoreview P3 by replacing unsafe versioned raw aggregate docs guidance in English and Chinese docs.
- Fixed autoreview P2 by aligning `shadcn-parity.mdc` with generated public same-base URL output.
- Removed unrelated unfinished `docs/plans/2026-06-02-fix-search-result-order.md` template stub.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Docs source parity failed when run without fresh Fumadocs source | 1 | ran `pnpm --filter www build:source` then parity check | passed |
| Browser CN route first timed out waiting on navigation | 1 | verified HTTP 200 and read body after normal Browser navigation | passed |

Verification evidence:
- `pnpm --filter www exec bun test scripts/registry-dependencies.test.mts src/lib/plate-init.test.ts src/app/r/registries.json/route.test.ts`: 11 passed, 37 expects.
- `pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-registry-source.mts`: passed.
- `pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-docs-source-parity.mts`: passed after source generation.
- `pnpm lint:fix`: passed, no fixes applied.
- `pnpm --filter www typecheck`: passed.
- Browser `/r/registries.json`: `@plate` registry entry is `https://platejs.org/r/{name}.json`.
- Browser `/init/md`: includes `npx shadcn@latest add @plate/editor-basic` and the Plate preset.
- Browser `/docs/installation/docs`: new raw aggregate warning present, old unsafe step absent.
- Browser `/cn/docs/installation/docs`: translated raw aggregate warning present, old unsafe step absent.
- `pnpm install`: passed and synced `.agents/skills/shadcn-parity/SKILL.md`.
- `.agents/skills/autoreview/scripts/autoreview --mode local`: clean, no accepted/actionable findings.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A.
- Confidence line: high.
- Flow table:
  - Reproduced: shadcn CLI probe proved custom `@plate/*` is not rewritten.
  - Verified: focused tests, source checks, lint, typecheck, Browser, and autoreview.
- Browser check: route/text proof on registry, init, English docs, and Chinese docs.
- Outcome: Plate registry source follows shadcn-style names while public generated output remains direct-install-safe.
- Caveat: `public/r` was not rebuilt locally by policy; CI will generate it.
- Design:
  - Chosen boundary: authored source stays namespaced; generated public output rewrites.
  - Why not quick patch: changing only one item would leave direct installs broken elsewhere.
  - Why not broader change: forking shadcn CLI or replacing registry source shape is unnecessary.
- Verified: focused tests, source checks, lint, typecheck, Browser, rule sync, autoreview, and plan checker.
- PR body verified: N/A.

Reboot status:
- current_phase: final response
- next_action: send concise final handoff
- blocker: none

Open risks:
- None.

Timeline:
- 2026-06-02T12:29:44.236Z Task goal plan created.
- 2026-06-02T12:55:00.000Z Registry contract implementation and review fixes recorded.
- 2026-06-02T13:10:00.000Z Final autoreview clean.
