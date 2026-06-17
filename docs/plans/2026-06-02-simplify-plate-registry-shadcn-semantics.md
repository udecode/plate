# Simplify Plate Registry Shadcn Semantics

Objective:
Normalize Plate registry delivery around shadcn namespace semantics: Plate self-dependencies resolve as `@plate/*`, install docs present `@plate` as the default path, `/init` stays a convenience preset, and local-file compatibility remains intact.

Goal plan:
docs/plans/2026-06-02-simplify-plate-registry-shadcn-semantics.md

Template:
docs/plans/templates/task.md with docs and browser packs.

Task source:
- type: user request
- id / link: current Codex thread
- title: Use latest shadcn registry semantics for Plate registry
- acceptance criteria: `@plate/*` source normalization, install/MCP docs updated, shadcn parity rule updated, no generated registry output committed, focused tests/source checks/typecheck/lint/browser proof pass.

Completion threshold:
- Registry source normalization maps bare Plate item dependencies to `@plate/<name>`.
- Local template sync still accepts `@plate/<name>` and legacy Plate URL dependencies.
- Install docs and `/init/md` present `@plate` as the default existing-project path.
- `/r/registries.json` advertises the Plate namespace with central-index-aligned metadata.
- Verification commands and Browser proof listed below pass.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-02-simplify-plate-registry-shadcn-semantics.md` passes.

Verification surface:
- `pnpm install`
- `pnpm --filter www exec bun test src/lib/registry-install.test.ts src/lib/plate-init.test.ts src/app/r/registries.json/route.test.ts scripts/registry-dependencies.test.mts`
- `pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-registry-source.mts`
- `pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-docs-source-parity.mts`
- `pnpm --filter www typecheck`
- `pnpm lint:fix`
- Browser proof on `http://localhost:3003/docs/installation/mcp`, `/docs/installation/docs`, `/init`, `/init/md`, and `/r/registries.json`.

Constraints:
- Do not run `build:registry` outside CI.
- Do not manually edit generated `apps/www/public/r`, `apps/www/public/rd`, or template output.
- Keep Plate source authoring custom where Plate content is genuinely custom.
- Keep shadcn CLI as the installer and use shadcn registry semantics at the public boundary.

Boundaries:
- Source of truth: `shadcn@4.10.0`, `../shadcn/apps/v4/content/docs/registry/*`, `apps/www/scripts/*registry*`, `apps/www/src/lib/plate-*.ts`, `content/docs/installation/*`, `.agents/rules/shadcn-parity.mdc`.
- Allowed edit scope: registry dependency normalization, registry source checks/tests, Plate init markdown, install/MCP docs, shadcn parity rule and generated skill mirror.
- Browser surface: local `www` dev server at `http://localhost:3003`.
- Tracker sync: N/A; no issue or PR was requested.
- Non-goals: no registry build output, no Rhea/style registry adoption, no shadcn CLI fork, no template hand edits.

Output budget strategy:
- Searches were scoped to registry/install surfaces and capped with `max_output_tokens`; broad `rg` output was followed by focused file reads and focused diffs.

Blocked condition:
- Blocked only if `shadcn@4.10.0` namespace APIs could not validate `@plate/*`, local-file sync broke, or Browser/dev server proof was unavailable.

Task state:
- task_type: implementation
- task_complexity: normal
- current_phase: closeout
- current_phase_status: completed
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: complete after final autogoal checker
- confidence: high
- next owner: none
- reason: source contract, docs, rule mirror, tests, typecheck, lint, and Browser proof are complete.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded `autogoal`, `sync-shadcn`, `docs-creator`, browser skill, and shadcn parity rule. |
| Active goal checked or created | yes | Created active goal for Plate registry shadcn semantics. |
| Source of truth read before edits | yes | Read shadcn registry docs, shadcn registry route/validation, Plate registry scripts, init routes, install docs, and tests. |
| Tracker comments and attachments read | N/A | Current task is a direct thread instruction with no tracker. |
| Video transcript evidence required | N/A | No video or recording supplied. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | Existing source and shadcn upstream docs directly owned the decision. |
| TDD decision before behavior change or bug fix | yes | Updated focused tests for registry dependency normalization and init docs. |
| Branch decision for code-changing task | N/A | User did not request branch, commit, push, or PR. |
| Release artifact decision | yes | No changeset: docs/app registry delivery behavior only, no package release surface. |
| Browser tool decision for browser surface | yes | Used in-app Browser through repo-approved browser skill. |
| PR expectation decision | N/A | No PR requested. |
| Tracker sync expectation decision | N/A | No tracker. |
| Output budget strategy recorded | yes | Scoped/capped command output recorded above. |
| Docs pack selected | yes | Install docs and MCP docs changed. |
| `docs-creator` loaded | yes | Loaded `.agents/skills/docs-creator/SKILL.md`. |
| Docs lane selected | yes | Installation/MCP docs lane. |
| Target docs and nearest sibling docs read | yes | Read `installation.mdx`, `installation/plate-ui.mdx`, `installation/docs.mdx`, `installation/mcp.mdx`, and React/Next install siblings. |
| Docs style doctrine read | yes | `docs-creator` current-state and shadcn-dense rules loaded. |
| Documented source owner identified | yes | Registry source owner is `apps/www/scripts/*registry*` plus `apps/www/src/lib/plate-*.ts`. |
| Browser pack selected | yes | Docs and app route browser proof required by repo rule. |
| Browser route / app surface identified | yes | `/docs/installation/mcp`, `/docs/installation/docs`, `/init`, `/init/md`, `/r/registries.json`. |
| Browser tool decision recorded | yes | Browser plugin used; no standalone Playwright substitute. |
| Console/network caveat policy recorded | yes | Browser runtime did not expose console/resource APIs; route status and dev-server 200 logs were recorded. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, title, task type, acceptance criteria, likely files/routes, browser surface, and root-cause layer.
- [x] Required video or screen-recording evidence is marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the ownership boundary: namespace semantics in registry source normalization instead of installer workarounds.
- [x] Release artifact requirement recorded as N/A with reason.
- [x] Final handoff shape decided: concise implementation summary plus verification.
- [x] Branch handling recorded as N/A with reason.
- [x] Local-env-rot retry policy recorded as N/A; failures matched assertions/tool limitations, not install corruption.
- [x] Workspace authority recorded: every proof command runs from `/Users/zbeyens/git/plate` against `apps/www`.
- [x] High-risk note recorded: public registry delivery contract changed; source checks, tests, typecheck, and Browser route proof cover it.
- [x] Review/autoreview target selected: direct source-backed review plus command gates; separate autoreview marked N/A because patch is narrow and command-verified.
- [x] Agent-native review decision recorded: shadcn parity rule changed; source file edited and `pnpm install` regenerated skill mirror.
- [x] Output budget discipline recorded and followed.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: named commands, routes, and registry config are source-backed.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links and routes target real pages or are marked N/A with reason.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: browser proof uses repo-approved Browser tool.
- [x] Browser pack: console/network caveat recorded.
- [x] Browser pack: exact browser verification route proof is ready for final handoff.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named commands and Browser proof | All listed command and Browser proofs completed. |
| Bug reproduced before fix | N/A | Record N/A | This is registry contract simplification, not a bug repro. |
| Targeted behavior verification | yes | Run focused tests/source assertions | Bun tests, registry source check, docs source parity check passed. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm --filter www typecheck` passed. |
| Package exports or file layout changed | N/A | Record N/A | No exports or file layout changed. |
| Package manifests, lockfile, or install graph changed | yes | Run install | `pnpm install` passed to regenerate skills; lockfile was already up to date. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed; `rg` confirmed generated `shadcn-parity/SKILL.md` includes `@plate/*` rule. |
| Workspace authority proof | yes | Verify in owning app | All commands ran in `/Users/zbeyens/git/plate` with `www` filters or `apps/www` script ownership. |
| Browser surface changed | yes | Capture Browser proof | Browser verified MCP docs, Local Docs, `/init`, `/init/md`, and `/r/registries.json`. |
| Browser final proof | yes | Record exact browser verification caveat | Browser proof recorded; console/resource API unavailable, dev-server 200 route logs recorded. |
| CI-controlled template output changed | N/A | Record N/A | No template output edited. |
| Package behavior or public API changed | N/A | Record N/A | No package release API changed. |
| Registry-only component work changed | N/A | Record N/A | Registry delivery scripts changed, not a component registry item. |
| Docs or content changed | yes | Verify source-backed claims, links, and rendered output | Docs source parity and Browser docs page proof passed. |
| High-risk mini gate | yes | Record failure mode and proof plan | Failure mode: self-deps resolve as stale URLs or local-file sync breaks; tests/checks cover both. |
| Agent-native review for agent/tooling changes | yes | Source/generation review | `.agents/rules/shadcn-parity.mdc` source edited, generated skill mirror verified. |
| Local install corruption suspected | N/A | Record N/A | No local install corruption signal. |
| Autoreview for non-trivial implementation changes | N/A | Record N/A | Narrow source-backed change with focused tests, typecheck, lint, browser proof. |
| PR create or update | N/A | Record N/A | User did not request PR. |
| Task-style PR body verified | N/A | Record N/A | No PR. |
| PR proof image hosting | N/A | Record N/A | No PR. |
| Tracker sync-back | N/A | Record N/A | No tracker. |
| Final handoff contract | yes | Fill final handoff fields | Completed below. |
| Final lint | yes | Run `pnpm lint:fix` | `pnpm lint:fix` passed; fixed two formatting/newline issues. |
| Output budget discipline | yes | Verify scoped/capped output | Broad output was capped; follow-up reads were focused. |
| Goal plan complete | yes | Run completion checker | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-02-simplify-plate-registry-shadcn-semantics.md` passed. |
| Docs source-backed claim audit | yes | Verify docs claims against source | Source-backed by shadcn registry docs and Plate registry config/tests. |
| Docs links / routes / previews | yes | Verify routes | Browser verified docs routes; no preview changed. |
| Docs MDX/content parser | yes | Run docs source parser | `pnpm --filter www typecheck` ran `build:source` and docs parity. |
| Plugin page specifics | N/A | Record N/A | No plugin page changed. |
| Browser interaction proof | yes | Exercise routes with Browser | Completed through in-app Browser. |
| Browser console/network check | partial | Record caveat | Runtime console/resource APIs unavailable; route status and dev-server 200 logs recorded. |
| Browser final proof artifact | yes | Record route proof | Exact Browser JSON/text checks recorded below. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Read upstream shadcn registry docs and Plate registry/install source. | implementation |
| Implementation | completed | Patched registry dependency normalization, init/docs copy, parity rule, and directory description. | verification |
| Verification | completed | Focused tests, source checks, typecheck, lint, Browser route proof. | closeout |
| PR / tracker sync | N/A | No PR or tracker requested. | final response |
| Closeout | completed | Goal ledger filled; completion checker next. | final response |

Findings:
- Plate source normalization used absolute Plate item URLs for internal registry dependencies. The public contract should use `@plate/*` and reserve absolute URLs for direct URL installs and compatibility input.
- MCP docs made manual `components.json` registry configuration look required. Existing shadcn projects can install from `@plate` directly.

Decisions and tradeoffs:
- Keep static registry output and CI-owned generation; do not switch Plate to dynamic `loadRegistryItem` route handlers because Plate’s registry is large and docs-heavy.
- Keep Plate’s TS-authored registry source; only normalize the shadcn-facing dependency semantics.
- Keep `/init` as a convenience preset, not the main install story.

Implementation notes:
- `toRegistryDependencySpecifier('toolbar')` now returns `@plate/toolbar`.
- `toLocalRegistryDependency('@plate/toolbar')` still returns `toolbar.json`, preserving local-file template sync.
- `plateInitRegistryItem` still writes `components.json` registry config for preset installs.
- `/r/registries.json` now matches the central shadcn directory description for `@plate`.

Review fixes:
- Aligned `PLATE_REGISTRY_DESCRIPTION` with shadcn central index wording.
- Ran `pnpm install` after editing `.agents/rules/shadcn-parity.mdc` and verified generated `SKILL.md`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Browser `networkidle` unsupported | 1 | Use supported `load` state | Browser proof continued. |
| Browser page `fetch` unavailable | 1 | Navigate to routes directly | Route JSON/markdown proof completed. |
| Browser resource API unavailable | 1 | Use route status and dev-server logs | Recorded caveat and 200 logs. |

Verification evidence:
- `pnpm install` passed; Skiller regenerated agent guidance.
- `rg -n 'prefer \`@plate|old generated registry output' .agents/skills/shadcn-parity/SKILL.md .agents/rules/shadcn-parity.mdc` confirmed source and generated skill mirror.
- `pnpm --filter www exec bun test src/lib/registry-install.test.ts src/lib/plate-init.test.ts src/app/r/registries.json/route.test.ts scripts/registry-dependencies.test.mts` passed: 11 tests, 32 assertions.
- After directory wording change, `pnpm --filter www exec bun test src/app/r/registries.json/route.test.ts src/lib/plate-init.test.ts scripts/registry-dependencies.test.mts` passed: 8 tests, 25 assertions.
- `pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-registry-source.mts` passed.
- `pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-docs-source-parity.mts` passed.
- `pnpm --filter www exec node` assertion showed `plate-ui -> @plate/plate-ui`, `editor-base-kit -> @plate/editor-base-kit`, `@shadcn/button` preserved, direct URL preserved.
- `pnpm --filter www typecheck` passed.
- `pnpm lint:fix` passed.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-02-simplify-plate-registry-shadcn-semantics.md` passed.
- Browser proof on `/docs/installation/mcp`: code blocks render `@plate/editor-basic`, preset command remains, manual registry config block absent.
- Browser proof on `/docs/installation/docs`: renders `@plate/fumadocs`, mentions `@plate` registry, stale `replace https://platejs.org/r/` instruction absent, raw file URL guidance present.
- Browser proof on `/init`: `name=plate`, `type=registry:base`, dependency `@plate/editor-basic`, registry URL `https://platejs.org/r/{name}.json`.
- Browser proof on `/init/md`: namespaced add command and preset command present; add command appears before config block.
- Browser proof on `/r/registries.json`: one `@plate` entry with homepage `https://platejs.org`, URL `https://platejs.org/r/{name}.json`, description `AI-powered rich text editor for React.`
- Dev server logged 200 responses for `/docs/installation/mcp`, `/docs/installation/docs`, `/init`, `/init/md`, and `/r/registries.json`.

Reboot status:
- Not needed. Work stayed in the active thread and the `www` dev server stayed running on `http://localhost:3003`.

Open risks:
- Generated registry output under `apps/www/public/r`, `apps/www/public/rd`, and `apps/www/src/__registry__/index.tsx` still contains old absolute Plate URLs until CI runs `build:registry`. This is intentional under repo policy; source checks prove the next generated output contract.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: high.
- Flow table:
  - Reproduced: source audit found absolute Plate self-dependencies.
  - Verified: tests, source checks, typecheck, lint, Browser route proof passed.
- Browser check: completed on `http://localhost:3003`.
- Outcome: Plate registry source now uses shadcn namespace semantics for self-dependencies and docs present `@plate` as the default install path.
- Caveat: generated registry JSON output is CI-owned and was not rebuilt locally.
- Design:
  - Chosen boundary: source registry normalization plus docs/init copy.
  - Why not quick patch: changing docs alone would leave generated output source contract wrong.
  - Why not broader change: dynamic shadcn loader routes and Rhea/style registry adoption are unnecessary and worse for Plate’s large docs-heavy registry.
- Verified: commands and Browser proof listed above.
- PR body verified: N/A.

Task-style PR body contract:
- N/A; no PR requested.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: completed.
- Caveats: generated registry output remains CI-owned.

Timeline:
- 2026-06-02: Goal created, source audited, implementation completed, verification completed.
