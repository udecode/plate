# require unslop and disclose Plate requirements

Objective:
Require Unslop in docs workflow and verify Plate runtime/compiler requirements; done when source, generated skill, docs, and checks agree.

Goal plan:
docs/plans/2026-08-24-require-unslop-and-disclose-plate-requirements.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: direct user request
- id / link: current Codex task
- title: require Unslop and disclose Plate requirements
- acceptance criteria: `docs-creator` makes Unslop a required step for every docs artifact; Plate's React 19, React Compiler, and related runtime/setup requirements are checked against live source and stated accurately in the owning docs; source and generated skill stay synchronized; affected docs and agent rules pass their verification lanes.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: no timed checkpoint
- initial confidence score: N/A: binary artifact and command threshold applies
- improvement loop: source audit, smallest durable rule/docs edits, generated sync, Unslop pass, docs/parser/browser/review proof
- final score / loop closure: complete only when every named command and source audit passes

Completion threshold:
- `.agents/rules/docs-creator.mdc` requires an explicit Unslop pass for every
  created or edited docs artifact, preserves literal content and source-backed
  claims, and names the verification evidence expected at closeout.
- The generated `.agents/skills/docs-creator/SKILL.md` matches the source after
  `pnpm install`; no generated skill is hand-edited.
- Current Plate package/app/config owners determine whether React 19, React
  Compiler, Next, or other setup facts are requirements, recommendations, or
  internal implementation details. The owning install/get-started docs state
  only user-relevant requirements and explicit constraints.
- Every changed prose file receives a deliberate Unslop file-edit pass without
  changing code, commands, identifiers, links, package names, or technical facts.
- Source audits, docs generation/checks, Browser proof, lint, agent-native
  review, P1 autoreview when applicable, and the final goal checker pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-24-require-unslop-and-disclose-plate-requirements.md` passes.

Verification surface:
- Source audit of package peer dependencies, app/compiler configs, installation
  docs, rule source, generated skill, and any existing requirement language.
- `pnpm install`; source/mirror text comparison; Unslop deterministic audit on
  each changed prose file.
- `pnpm --filter www build:source`, `pnpm --filter www check:docs`, relevant
  docs source checks, `pnpm lint`, and Browser proof for changed content routes.
- Agent-native review and scoped P1 autoreview, followed by the goal-plan checker.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Preserve technical facts, commands, identifiers, code fences, package names,
  URLs, frontmatter, metadata, and link targets during Unslop edits.
- Do not claim React Compiler is a consumer prerequisite unless the literal
  package/runtime contract proves that; separate hard requirements, supported
  app configuration, recommendations, and implementation details.
- Edit `.agents/rules/docs-creator.mdc`, never the generated skill directly.

Boundaries:
- Source of truth: `.agents/rules/docs-creator.mdc`, live package manifests and
  compiler/app configs, and the owning installation/get-started docs.
- Allowed edit scope: docs-creator source rule and regenerated mirrors; the
  smallest owning Plate docs needed to correct requirement disclosure; this
  goal plan. No product runtime/API changes.
- Browser surface: changed www docs route when content changes.
- Browser strategy: Browser for normal docs QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no issue or external tracker requested.
- Non-goals: no package/runtime/compiler behavior changes, no mass docs rewrite,
  no generated registry/template edits, no commit, push, PR, release, or deploy.

Output budget strategy:
- Read exact rule, reference, manifest, config, and installation-doc owners.
  Search authored source with path exclusions; emit filenames/counts before
  matching lines; cap command output and never scan generated registry, build,
  dependency, or template trees unless they are the named sync artifact.

Blocked condition:
- Block only if current source proves materially conflicting React/runtime
  contracts with no canonical owner, or required Browser/docs tooling fails
  repeatedly after owner-specific recovery. Ordinary wording choices and lint
  fixes are not blockers.

Task state:
- task_type: agent-doctrine repair plus source-backed docs correction
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: inspect source before choosing exact disclosure wording
- confidence: medium before live contract audit
- next owner: task
- reason: React 19 is a hard package baseline, but React Compiler may be an app
  optimization/configuration rather than a library-consumer requirement; the
  docs must not blur those categories.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-24-require-unslop-and-disclose-plate-requirements.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Required Unslop step for all docs, live audit of Plate React 19/Compiler requirements, accurate disclosure, source/mirror sync, verification, and no external mutation are recorded above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | User explicitly invoked `docs-creator` and `unslop`; repo policy additionally requires `autogoal` and agent-native review for rule changes |
| Active goal checked or created | yes | No active goal existed; a new goal names this exact plan and binary threshold |
| Source of truth read before edits | yes | Read `.agents/rules/docs-creator.mdc`, linked style/lane doctrine, Unslop file-edit doctrine, agent-native reviewer, package peer manifests, package compiler config, app configs, registry init, React Compiler contract checker, and installation docs |
| Tracker comments and attachments read | no | N/A: direct request has no tracker or attachment |
| Video transcript evidence required | no | N/A: no video evidence |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: doctrine and reference-doc wording task; live rule/config/docs owners are authoritative |
| TDD decision before behavior change or bug fix | no | N/A: no product behavior changes; source/mirror and docs checks own proof |
| Branch decision for code-changing task | no | N/A: no branch, commit, push, or PR requested |
| Release artifact decision | no | N/A: agent doctrine and docs wording require no changeset or registry changelog |
| Browser tool decision for browser surface | yes | Use Browser on the exact changed docs route if authored content changes; agent-rule-only changes need no Browser |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker requested |
| Output budget strategy recorded | yes | Exact-owner reads and bounded authored-source searches are recorded above |
| Docs pack selected | yes | Task primary template materialized the docs pack because live docs may require correction |
| `docs-creator` loaded | yes | User supplied the complete current skill; source rule and linked style doctrine will be read before edits |
| Docs lane selected | yes | Install/get-started lane for the live disclosure; agent workflow doctrine for the skill/template repair |
| Target docs and nearest sibling docs read | yes | Read `content/docs/installation.mdx`, its CN counterpart, Plate UI, React, Next, manual, RSC and Node neighbors plus `content/docs/index.mdx` |
| Docs style doctrine read | yes | Read `style-and-structure.md`, the install lane template, Unslop file-edit doctrine and the local shadcn docs-style corpus |
| Documented source owner identified | yes | React/DOM floor comes from package peers; package compilation from `tsdown.config.ts`; copied-source compiler policy from registry/compiler contract; app configuration from both Next configs |
| Agent-native pack selected | yes | Task primary template materialized the agent-native pack for `.agents/rules/**` changes |
| Agent-facing action surface identified | yes | `docs-creator` workflow and verification checklist control future docs creation/editing |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/docs-creator.mdc`; regenerate `.agents/skills/docs-creator/SKILL.md` with `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded before edits; final parity map will prove user action, agent route, source owner, generated mirror and proof |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; N/A because no duration was requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is N/A: no video was supplied.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: N/A because only agent doctrine,
      goal templates, and installation reference prose changed.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded: N/A because no branch, commit, push, or PR was
      requested; another checkout writer swept the implementation into commit
      `6ae5c0390f8c0f20a24dceedb8b696fc1f922092` during verification.
- [x] Local-env-rot retry policy recorded: N/A because no install-corruption
      signal occurred.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. The agent-action risk was future docs bypassing Unslop or
      publishing false compatibility claims; source/mirror/template checks and
      contract/docs proof cover both.
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work: exact commit `6ae5c0390f8c0f20a24dceedb8b696fc1f922092`
      in an immutable temporary clone after shared-checkout races.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason. Only React, React DOM, React Compiler, shadcn, and existing installation routes are named; their owners were audited.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason. The only new link is the live official React Compiler installation guide; existing internal links were unchanged.
- [x] Docs pack: every created or edited docs artifact completed the required `unslop` file-edit pass after claims stabilized, with protected literals and technical claims preserved.
- [x] Docs pack: requirement language separates hard compatibility, layer-specific setup, recommendations, and repo-only implementation details against live owners.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors; implementation will touch only the rule source before regeneration.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text through the explicit required Unslop section and workflow/gate rows.
- [x] Agent-native pack: generated mirrors are synced after `pnpm install`; source and mirror bodies compare equal.
- [x] Agent-native pack: agent-native review passed with no findings.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the named proof | Compiler contract, six contract tests, docs checks, lint, Unslop audits, mirror parity, Browser attempt, agent-native review, and P1 autoreview completed |
| Bug reproduced before fix | no | N/A | N/A: doctrine/reference correction, not a runtime bug |
| Targeted behavior verification | yes | Verify changed workflow/docs | Source/mirror/template assertions and docs/Compiler checks passed |
| TypeScript or typed config changed | no | N/A | N/A: no TypeScript or typed config changed |
| Package exports or file layout changed | no | N/A | N/A: no exports or file layout changed; `pnpm brl` not required |
| Package manifests, lockfile, or install graph changed | no | N/A | N/A: `pnpm install` regenerated agent mirrors but did not change the package contract for this task |
| Agent rules or skills changed | yes | Regenerate and compare | `pnpm install` passed; docs-creator source/mirror bodies are equal |
| Workspace authority proof | yes | Run in owning workspace | Every command ran in `/Users/zbeyens/git/plate-2`; Browser targeted the www server at `127.0.0.1:3000` |
| Browser surface changed | yes | Test exact docs route | Browser reached `/docs/installation`; compilation stopped in pre-existing `apps/www/src/__registry__/index.tsx` missing generated registry imports |
| Browser final proof | yes | Record proof or exact caveat | Exact Browser caveat recorded; `build:source` and `check:docs` passed |
| CI-controlled template output changed | no | N/A | N/A: docs plan source templates changed intentionally; no CI-owned `templates/**` or registry output was edited |
| Package behavior or public API changed | no | N/A | N/A: no package behavior/API change; no changeset |
| Registry-only component work changed | no | N/A | N/A: no registry component work; no registry changelog |
| Docs or content changed | yes | Run docs proof | Source claims audited; `pnpm --filter www check:docs` passed; Browser caveat recorded |
| High-risk mini gate | yes | Prove agent-action boundary | Risk is bypassed prose cleanup or false requirements; mandatory gate, mirror parity, literal-preserving Unslop pass, and live contract audit cover it |
| Agent-native review for agent/tooling changes | yes | Run capability review | PASS: both meaningful actions have discoverable routes, literal source owners, mirrors/docs, and owning proof; no findings |
| Local install corruption suspected | no | N/A | N/A: no corruption signal; reinstall not used |
| P1 autoreview for non-trivial implementation changes | yes | Run final P1 review | Third and final allowed invocation on immutable clone of commit `6ae5c0390f8c0f20a24dceedb8b696fc1f922092` was clean; first local run was a false alarm after an external commit, second was invalidated by shared-checkout mutation |
| PR create or update | no | N/A | N/A: no PR requested |
| Task-style PR body verified | no | N/A | N/A: no PR exists for this task |
| PR proof image hosting | no | N/A | N/A: no PR or proof image |
| Tracker sync-back | no | N/A | N/A: no issue or tracker |
| Final handoff contract | yes | Fill fields below | Completed below with exact outcome, proof, caveat, and N/A external mutation lines |
| Final lint | yes | Run lint fix and check | `pnpm lint:fix` and `pnpm lint` passed |
| Output budget discipline | yes | Record accidental output and recovery | Two oversized generated-index outputs occurred; subsequent Browser/error reads were bounded and the server was stopped |
| Timed checkpoint | no | N/A | N/A: no duration requested |
| Goal plan complete | yes | Run final checker | `[autogoal] complete` |
| Docs source-backed claim audit | yes | Audit live owners | Peers, compiler target, app config, registry metadata, contract checker, and official React docs agree |
| Required Unslop pass | yes | Run file-edit pass and audit | Completed on the source rule, generated mirror, both docs templates, both installation pages, and this plan; literals and claims preserved; deterministic findings were deliberate heading style or quoted banned wording |
| Requirements disclosure | yes | Classify claims | React/DOM 19.2 is hard compatibility; app Compiler is copied-source setup; published package compilation is package-owned; shadcn does not configure the app build tool |
| Docs links / routes / previews | yes | Verify new link and routes | Official React Compiler link verified; internal routes unchanged; exact Browser compilation caveat recorded |
| Docs MDX/content parser | yes | Run parser/check | `pnpm --filter www build:source` and `pnpm --filter www check:docs` passed |
| Plugin page specifics | no | N/A | N/A: installation entry pages, not plugin pages |
| Agent source / generated sync | yes | Regenerate and compare | `pnpm install` passed; source/mirror body equality and required sections passed |
| Agent action discoverability | yes | Audit route | `docs-creator` now names the required Unslop step in its section, workflow, and closeout checklist; templates require evidence |
| Agent-native review | yes | Run capability review | PASS; no P0-P3 findings |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Exact owners and official React docs audited | implementation |
| Implementation | complete | Rule, mirror, templates, and EN/CN installation pages contain the durable contract | verification |
| Verification | complete | Compiler contract/tests, docs checks, lint, Unslop, mirror parity, Browser caveat, agent-native review, and P1 review closed | closeout |
| PR / tracker sync | complete | N/A: no PR or tracker requested | final response |
| Closeout | complete | Final plan checker passed | final response |

Findings:
- Thirty-eight React package manifests declare both React and React DOM peers at
  `>=19.2.0`; `packages/yjs` declares the React peer without React DOM.
- Package compilation targets React 19. React 19 supplies the Compiler runtime,
  so no compatibility shim is part of the package contract.
- Both app configs enable React Compiler. Copied Plate UI source therefore needs
  the consuming app's Compiler setup, while imported published package code does
  not need consumer recompilation.
- Registry metadata installs dependencies and source files but does not configure
  the consuming build tool.
- Browser rendering is blocked before page content by stale generated imports in
  `apps/www/src/__registry__/index.tsx`. Repo policy forbids local registry builds;
  parser/source parity is green and the blocker is outside this task's authored
  sources.

Decisions and tradeoffs:
- React and React DOM `>=19.2.0` are the hard consumer compatibility floor.
- React Compiler is a consuming-app requirement only for copied Plate UI source.
  Published Plate package code is compiled for React 19 before publication and
  does not require consumer recompilation.
- The shadcn registry command installs files and dependencies but does not own
  the consuming app's build-tool configuration, so the install page says so.
- The deterministic Unslop audit is evidence and a candidate finder, not a
  substitute for the required file-edit judgment pass.

Implementation notes:
- Added requirements/disclosure ownership and a mandatory Unslop file-edit pass
  to `.agents/rules/docs-creator.mdc`, then regenerated its installed mirror.
- Added the same completion evidence to both docs goal templates.
- Added English and Chinese installation requirement tables before the first
  install command.

Review scope baseline:
- Original request: require Unslop for every docs artifact and verify/disclose
  Plate React 19 and React Compiler requirements.
- Invariant: future docs work cannot close without a deliberate Unslop pass;
  install docs cannot blur package compatibility, copied-source app setup, and
  package-build implementation facts.
- Target branch: current dirty checkout; no commit, push, or PR authorized.
- Owner boundary: `.agents/rules/docs-creator.mdc`, its generated skill mirror,
  docs plan templates, and the installation entry pages.
- Relevant siblings: package peer manifests, compiler build config, app Next
  configs, registry metadata, and the React Compiler contract checker.
- Public/security/product contract: wording only; no runtime, API, package,
  security, release, or external-state change.
- Review target: only the Unslop/docs-creator/template/installation disclosure
  changes above; unrelated checkout drift is outside this request.

Review fixes:
- Rejected the first autoreview finding. It claimed implementation files were
  absent because another checkout writer committed those files while local-mode
  review was starting; exact commit inspection proved all six files present.
- The exact-commit retry was invalidated by another shared-checkout mutation.
- The third and final allowed invocation ran from an immutable temporary clone
  of `6ae5c0390f8c0f20a24dceedb8b696fc1f922092` and returned clean with no P0/P1
  findings.

Agent-native review:

### Verdict
PASS

### Capability Map
| User action | Agent route | Source owner | Mirror/lock/doc | Proof | Status |
|---|---|---|---|---|---|
| Create or edit Plate docs | `docs-creator` then `unslop` file-edit mode | `.agents/rules/docs-creator.mdc` | `.agents/skills/docs-creator/SKILL.md` plus both docs goal templates | `pnpm install`, body equality, section/gate assertions, Unslop audit | pass |
| Install Plate with the correct runtime/compiler setup | `docs-creator` install/get-started lane | package peers, `tooling/config/tsdown.config.ts`, app Next configs, registry metadata, Compiler contract | English and Chinese installation entry pages | Compiler contract and six tests, docs parser/parity, official React docs, Browser caveat | pass |

### Findings
- None.

### Accepted / Rejected
- Accepted: none.
- Rejected: none; Browser limitation is a repo-generated-input caveat, not an
  agent-route gap introduced by this task.

### Verification
- Source/mirror parity and template gate assertion: pass.
- `pnpm install`: pass.
- `pnpm --filter www check:docs`: pass.
- React Compiler contract and six unit tests: pass.

### Needs Attention
- None for this action surface.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Next MCP compile response streamed the full generated-registry failure set | 1 | Use bounded Browser locators/log summaries | Exact owner and representative missing import captured; no registry generation run |
| Stopping the dev server flushed its large buffered generated-index log | 1 | Keep final evidence to the bounded Browser summary | Server stopped; no further broad output |
| Local autoreview saw only the goal plan after another checkout writer committed implementation files | 1 | Inspect the exact commit and switch to commit review | Finding rejected with file-list proof |
| Exact-commit autoreview in the shared checkout detected concurrent source mutation | 1 | Run the last allowed invocation from an immutable temporary clone | Clean P1 result |
| Temporary-clone removal command was rejected by command safety policy | 1 | Leave the isolated `/tmp` clone for normal system cleanup | No workspace or product impact |

Verification evidence:
- `pnpm install` -> pass; generated docs-creator mirror refreshed.
- Source/mirror body comparison plus required-section/template-gate assertions ->
  all true.
- `node tooling/scripts/check-react-compiler-contract.mjs` -> pass across 434
  files.
- `node --test tooling/scripts/check-react-compiler-contract.test.mjs` -> six
  tests passed.
- `pnpm --filter www build:source` -> pass.
- `pnpm --filter www check:docs` -> API reference, MDX source, and docs parity
  passed.
- `pnpm lint:fix` and `pnpm lint` -> pass.
- Final Unslop audits completed for all seven changed prose artifacts, including
  the generated mirror and this plan. No actionable slop remained; reported
  title-case headings follow the destination style, and `now supports` appears
  only as quoted forbidden wording.
- Browser -> `/docs/installation` reached a Next build error in the pre-existing
  generated registry index; representative missing imports include
  `editor-base-kit.tsx`, `editor-kit.tsx`, and registry UI files. The changed MDX
  was not reached.
- Agent-native review -> PASS, no findings.
- P1 autoreview -> clean on immutable clone of commit
  `6ae5c0390f8c0f20a24dceedb8b696fc1f922092`.
- Goal-plan checker -> `[autogoal] complete`.

Final handoff contract:
- PR line: N/A: no PR requested or created
- Issue / tracker line: N/A: direct task with no tracker
- Confidence line: high; source, generated mirror, docs, contract, lint, and review proof agree
- Flow table:
  - Reproduced: N/A: no runtime bug; Browser reproduced the unrelated generated-index build blocker
  - Verified: Compiler contract/tests, docs checks, lint, Unslop, mirror parity, agent-native review, and P1 review passed
- Browser check: exact docs route attempted; blocked in CI-owned generated registry index before MDX render
- Outcome: every docs artifact now requires an Unslop file-edit pass; installation docs distinguish the React 19.2 peer floor, app-owned Compiler setup for copied UI, and precompiled package code
- Caveat: live rendered-page proof remains blocked by stale generated registry imports; local registry generation is prohibited
- Design:
  - Chosen boundary: source docs-creator doctrine, installed mirror, goal templates, and owning installation entry pages
  - Why not quick patch: prose cleanup advice alone would remain optional and unprovable
  - Why not broader change: package/runtime/compiler behavior already satisfies the contract; only disclosure and docs workflow were missing
- Verified: commands and reviews listed above
- PR body verified: N/A: no PR

Task-style PR body contract:
- Preserve any existing `<!-- auto-release:start -->` block. If a changeset is
  part of the diff and repo policy expects auto release, include that block.
- Use the accepted kitcn PR #270 visual format. The body starts with an emoji
  issue/tracker/fix line, for example `🐛 Fixes #123` or `🐛 Fixes ➖ N/A`, then
  an emoji confidence line like `🟢 95-100% confidence`.
- Use this exact table header: `| Phase | 🧪 Tests | 🌐 Browser |`.
- Use `Reproduced` and `Verified` rows. Mark passing proof with `🟢`, repro or
  failing proof with `🔴`, and non-applicable cells with `➖ N/A`.
- Use bold emoji section headings: `**✅ Outcome**`, `**⚠️ Caveat**`,
  `**🏗️ Design**`, and `**🧪 Verified**`.
- Never include a line that links to the current PR itself. The current PR URL
  belongs in the final response, not in its own description.
- Do not replace this with a generic `Summary` / `Verification` PR body, an
  adaptive prose body from a git helper skill, plain `## Outcome` sections, or
  an unrelated generated badge footer unless the caller or repo template
  explicitly asks for it.
- Proof is `gh pr view --json body` output or a concise source-backed summary
  of that output.

Final handoff / sync:
- PR: N/A: no PR requested
- Issue / tracker: N/A: none
- Browser proof: exact route attempted with Browser; pre-existing generated registry imports blocked compilation before content render
- Caveats: no runtime or API change; Chinese prose received the same literal-preserving pass, while the deterministic Unslop script is English-first and produced no Chinese-language findings

Timeline:
- 2026-08-24T09:09:46.609Z Task goal plan created.
- 2026-08-24 Source owners audited; doctrine, templates, and installation pages updated.
- 2026-08-24 `pnpm install`, compiler contract/tests, docs checks, lint, Unslop, mirror parity, and Browser attempt completed.
- 2026-08-24 Another checkout writer committed the six implementation files in `6ae5c0390f8c0f20a24dceedb8b696fc1f922092` during verification.
- 2026-08-24 Agent-native review passed; final P1 autoreview was clean from an immutable temporary clone.
- 2026-08-24 Final Unslop audit, lint, and goal-plan checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Complete |
| Where am I going? | Final response |
| What is the goal? | Require Unslop for all docs work and disclose Plate React/compiler requirements accurately |
| What have I learned? | React 19.2 is the peer floor; copied UI and published packages have different Compiler owners |
| What have I done? | Updated doctrine/templates/docs and closed source, parser, contract, lint, Browser-caveat, agent-native, and P1 proof |

Open risks:
- Rendered-page proof remains unavailable until CI refreshes the generated
  registry index. This task did not edit or regenerate that CI-owned artifact.
