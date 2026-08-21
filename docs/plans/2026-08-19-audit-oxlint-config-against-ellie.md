# audit oxlint config against ellie

Objective:
Audit Plate's Oxlint ownership against Ellie; done when every config layer,
rule, override, helper, and consumer has a source-backed verdict and ranked
cleanup recommendation.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-19-audit-oxlint-config-against-ellie.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: direct user request
- id / link: `tooling/config/oxlint-base.mjs` (missing in the current tree),
  current owner `oxlint.config.ts`, and sibling reference `../ellie/oxlint.config.ts`
- title: harsh full audit of Plate Oxlint config against Ellie cleanliness
- acceptance criteria: explain what is weird; audit every config layer, global
  rule, override, ignore, helper, and consumer; compare the actual current owner
  with Ellie; give a decisive target shape without implementing it

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A
- initial confidence score: N/A: exhaustive binary inventory is stronger
- improvement loop: parse both configs, compare effective presets and policy,
  inspect consumers, then challenge every Plate-only construct
- final score / loop closure: 100% of discovered config surfaces classified

Completion threshold:
- The report accounts for the missing named file, current ownership, every
  preset/option/ignore/helper/override/global rule, every consumer, and every
  material difference from Ellie; each issue has keep/delete/move/simplify or
  investigate verdict with severity and evidence.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-audit-oxlint-config-against-ellie.md` passes.

Verification surface:
- Static imports of both configs, programmatic inventories/counts, effective
  preset comparison, repository consumer search, exact-rule policy comparison,
  and selective diagnostic probes for disputed constructs.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Read-only audit: do not edit config or source. The only local write is this
  required durable audit plan.
- Error count is never a reason to disable a rule.

Boundaries:
- Source of truth: current `oxlint.config.ts`, installed Ultracite presets,
  `tooling/scripts/check-oxlint-config.mjs`, package scripts/consumers,
  `../ellie/oxlint.config.ts`, and the migration rule policy.
- Allowed edit scope: this audit plan only; final output is analysis.
- Browser surface: N/A: lint configuration has no browser-rendered output.
- Browser strategy: N/A: no browser-rendered behavior changed or reviewed.
- Tracker sync: N/A: no tracker source.
- Non-goals: no implementation, no global policy mutation, no commit/PR, and no
  claim that Ellie is automatically correct for a monorepo.

Output budget strategy:
- Parse configs programmatically and print counts/diffs before source excerpts;
  cap searches to config consumers and relevant preset modules; exclude build,
  generated, dependency, and cache trees except installed Ultracite source.

Blocked condition:
- Stop only if neither the current owner nor any historical/source equivalent
  for the named file exists, and the user's intended target cannot be inferred.
  The current root owner already provides a safe fallback audit surface.

Task state:
- task_type: review / investigation
- task_complexity: non-trivial auditable
- current_phase: closeout
- current_phase_status: complete
- next_phase: N/A
- goal_status: complete

Current verdict:
- verdict: audit the real root config; the named base file is nonexistent
- confidence: high
- next owner: source inventory
- reason: root `oxlint.config.ts` is the only current config owner and Ellie
  keeps the same ownership in one root file

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-audit-oxlint-config-against-ellie.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | objective, full-audit scope, Ellie comparison, read-only boundary, and final deliverable copied above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | migration playbook and rule policy read before audit actions |
| Active goal checked or created | yes | active audit goal created for this plan |
| Source of truth read before edits | yes | Plate, Ellie, installed presets, checker, scripts, and prior migration evidence read |
| Tracker comments and attachments read | no | N/A: direct request, no tracker |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: migration plans are the owning local evidence and were read |
| TDD decision before behavior change or bug fix | no | N/A: read-only audit |
| Branch decision for code-changing task | no | N/A: no code change |
| Release artifact decision | no | N/A: no package or registry behavior change |
| Browser tool decision for browser surface | no | N/A: lint configuration has no browser surface |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | config inventories and diffs were parsed and summarized |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Complete source/config/consumer inventory | 100% of the 13 local overrides, 178 root rules, 20 project ignores, helper, checker, and consumers classified |
| Bug reproduced before fix | no | N/A: audit, no fix | effective config proves four root offs are overwritten by the app override |
| Targeted behavior verification | yes | Inspect effective configuration and disputed file types | `--print-config` and `--no-ignore` probes recorded below |
| TypeScript or typed config changed | no | N/A | no config change |
| Package exports or file layout changed | no | N/A | no topology change |
| Package manifests, lockfile, or install graph changed | no | N/A | no dependency change |
| Agent rules or skills changed | no | N/A | no agent change |
| Workspace authority proof | yes | Run from Plate root | all commands ran from `/Users/zbeyens/git/plate-2` |
| Browser surface changed | no | N/A | no browser surface |
| Browser final proof | no | N/A | no browser surface |
| CI-controlled template output changed | no | N/A | no template change |
| Package behavior or public API changed | no | N/A | no changeset |
| Registry-only component work changed | no | N/A | no registry change |
| Docs or content changed | yes | Verify audit plan content | plan records source-backed findings only |
| High-risk mini gate | no | N/A | read-only audit |
| Agent-native review for agent/tooling changes | no | N/A | no agent tooling changed |
| Local install corruption suspected | no | N/A | config imports and probes were stable |
| P1 autoreview for non-trivial implementation changes | no | N/A | no implementation diff |
| PR create or update | no | N/A | no PR requested |
| Task-style PR body verified | no | N/A | no PR |
| PR proof image hosting | no | N/A | no PR/browser proof |
| Tracker sync-back | no | N/A | no tracker |
| Final handoff contract | yes | Fill the fields below | completed |
| Final lint | no | N/A | only ignored audit-plan prose changed; config was not modified |
| Output budget discipline | yes | Summarize inventories | large config outputs were reduced to counts and ranked findings |
| Timed checkpoint | no | N/A | no duration requested |
| Goal plan complete | yes | Run plan checker | final command after this update |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Plate, Ellie, presets, scripts, and migration evidence read | inventory |
| Implementation | complete | N/A: read-only audit | verification |
| Verification | complete | effective config, ignore probes, and consumer search | closeout |
| PR / tracker sync | complete | N/A: neither requested | final response |
| Closeout | complete | ranked target shape and evidence recorded | final response |

Findings:
- `tooling/config/oxlint-base.mjs` does not exist in the current tree or history.
  The completed cleanup deliberately merged its former 1,512-line content into
  the root owner. Ellie also uses one root config. Recreating it would add a
  one-consumer forwarding layer and make navigation worse.
- Plate has 610 config lines versus Ellie's 349; 178 root rules versus 106; 13
  local override blocks versus 10. The extra size is partly legitimate: Plate
  is a mixed monorepo/library with scoped Next apps and editor/runtime policy.
- The four root `react-doctor/nextjs-*` offs are ineffective. Override #0
  spreads `nextJsPlugins.rules` after root rules and re-enables all four inside
  both apps. This is a real precedence bug, not cosmetic debt.
- Plate manually projects `next.rules`, `next.plugins`, and Next JS plugins but
  drops `next.overrides`. The one current dropped override only disables
  `import/no-unassigned-import` for `next-env.d.ts`, already ignored by core,
  so current behavior is safe but future preset upgrades can drift silently.
- The file-wide unsafe-assignment directive on line 1 uses generic generated
  boundary prose unrelated to config assembly. It is migration-generated
  boilerplate and should be narrowed to the actual imported preset assignment.
- `unsafeValueRules` is reused seven times, but those seven owners do not share
  one safety contract. It saves lines by making blanket five-rule disables easy.
  Tests, Playwright harnesses, benchmarks, and registry values should retain
  only individually proven rules; plain JS, type tests, and the two Fumadocs
  consumers have durable class-level reasons.
- The test override is still too broad: it disables all five unsafe-value rules
  plus unused expressions for essentially every test. Ellie disables only
  unsafe argument and assignment for its general test class. Plate should
  re-enable unsafe call/member/return and localize real runner/fixture defects.
- Playwright, benchmarks, and registry value fixtures are executable typed code.
  Dynamic inputs justify narrow boundary exceptions, not disabling every unsafe
  use in their entire directories.
- `tooling/scripts/**` is redundant under `**/scripts/**`. The two declaration
  overrides should be one block. The latter currently covers only `.d.ts` while
  the former also names `.d.mts` and `.d.cts`.
- Four project ignores are inert because Oxlint does not lint JSON or HTML:
  `**/*otf.json`, `**/*.html`, and both registry schema JSON patterns.
  `**/skills/**` is currently subsumed by `.agents`, `.claude`, and templates.
- `docs/**` hides 158 tracked JavaScript/TypeScript files. Either move executable
  audit tooling out of docs or narrow this ignore; ignoring maintained code
  because it lives under docs is not clean ownership.
- The root rule block has 163 offs: 105 root rules overlap Ellie's policy, while
  73 are Plate-only customizations. Most Plate-only React Doctor performance,
  DOM rewrite, anti-slop, and public-type rules have strong semantic reasons.
  The count is not itself a problem.
- The weak global offs are `no-empty-function`, `no-shadow`,
  `no-param-reassign`, `typescript/no-deprecated`, `typescript/no-array-delete`,
  `typescript/await-thenable`, `typescript/no-base-to-string`,
  `typescript/only-throw-error`, `typescript/prefer-promise-reject-errors`,
  `typescript/restrict-template-expressions`,
  `typescript/switch-exhaustiveness-check`,
  `typescript/no-unnecessary-type-assertion`, and
  `typescript/no-useless-default-assignment`. Each rationale proves a valid
  local case, not a repository-wide exemption. Re-enable/configure them and
  localize the exceptional contracts.
- `import/no-cycle` with `maxDepth: 4` is an arbitrary blind spot. Long cycles
  are still cycles; accepted barrel edges should be explicit rather than hiding
  every fifth edge and beyond.
- P0/P1/P2 tags are undefined in Plate's config and no P3 entries remain. They
  are dead migration metadata. One comment even embeds the stale count 1,323.
  Keep concise enduring reasons; delete priority theater and historical counts.
- The 206-line custom checker parses TypeScript source with indentation regexes,
  misses glob subsumption, ignores glob exception staleness, does not validate
  effective override precedence, and emits the Node module-type warning. It
  missed the four-rule bug above. Its exact-selector replay is useful; the rest
  creates more confidence than correctness.
- Plate's root package is CommonJS-ambiguous while Ellie declares
  `"type": "module"`, so every direct config import emits
  `MODULE_TYPELESS_PACKAGE_JSON`. Adding root ESM semantics is too broad, and
  Ultracite 7.10.5 recognizes only `.oxlintrc.json` or `oxlint.config.ts`.
  Accept the warning until Ultracite supports an ESM config name; a hidden base
  module does not solve it.

Decisions and tradeoffs:
- Keep one root config. Do not restore a base module or scatter app/package
  configs merely to shorten the file.
- Keep strict options, selected React Doctor settings, app-only Next scope,
  plain-JS/type-test/Fumadocs semantic overrides, and the majority of
  source-backed global offs.
- Fix precedence and policy breadth before cosmetic sorting. Then group root
  rules by plugin and alphabetize them so late migration additions stop forming
  a second hidden rule section.
- Prefer local directives for rare valid exceptions; keep central overrides only
  for stable file classes sharing the same reason.

Implementation notes:
- N/A: the user requested an audit, not changes.

Review fixes:
- N/A: no implementation diff.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Imported the wrong Next JS plugin subpath during one probe | 1 | use the exact import from Plate config | corrected to `ultracite/oxlint/next/js-plugins` |
| A long diagnostic replay outlived its initial tool yield and lost console summary | 1 | rely on the completed prior isolated replay plus direct effective-config probes | no source or config state was changed; temporary file self-deleted |

Verification evidence:
- All commands ran from `/Users/zbeyens/git/plate-2`.
- Current inventory: 5 extends, 72 total ignores, 13 local overrides, 23
  selectors, 125 selector/rule pairs, 178 root rules, 163 root offs, and 15
  configured/enabled root rules.
- Ellie inventory: 5 extends, 63 ignores, 10 overrides, 20 selectors, 31
  selector/rule pairs, 106 root rules, 100 root offs, and 6 configured/enabled
  root rules.
- Installed preset inspection proved Next owns one override and 21 native rules;
  Next React Doctor owns 23 rules. Plate's app override contains 44 rules and
  omits the preset override.
- `oxlint --print-config` shows 11 merged built-in plugins, 659 expanded root
  rules, and 15 effective overrides; the app override carries the four disputed
  React Doctor rules at `error` despite root `off` entries.
- `oxlint --no-ignore` on the schema JSON, OTF JSON, and HTML fixture selected
  zero files, proving those four ignore patterns inert.
- Tracked-file inventory found 158 executable JS/TS-family files under `docs/**`.
- Consumer search found root `lint`, `lint:config:exceptions`, `p:lint`, root
  check/check:push, template checks, and two CI path filters. Only root `lint`
  runs the structural checker; `lint:fix` and `p:lint` bypass it.
- Prior completed migration evidence supplied isolated replay for every former
  override and the current 13 semantic blocks; no recommendation here uses
  diagnostic count as the reason for disabling a rule.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: direct request
- Confidence line: high
- Flow table:
  - Reproduced: effective precedence bug proved; browser N/A
  - Verified: full static inventory and focused config probes; browser N/A
- Browser check: N/A: no browser surface
- Outcome: ranked full audit and clean target shape completed
- Caveat: recommendations that re-enable broad rules require phased source fixes
- Design:
  - Chosen boundary: one root config plus local exceptional directives
  - Why not quick patch: moving text into a base module only hides policy
  - Why not broader change: package-local configs would scatter precedence
- Verified: config/preset imports, effective config, path probes, consumers, and Ellie comparison
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
- PR: N/A
- Issue / tracker: N/A
- Browser proof: N/A
- Caveats: broad rule re-enablement is follow-up implementation, not part of this audit

Timeline:
- 2026-08-19T23:08:18.012Z Task goal plan created.
- 2026-08-20 Full Plate/Ellie config, preset, override, ignore, checker, and
  consumer audit completed; target shape ranked without implementation.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final audit handoff |
| What is the goal? | Make Plate's Oxlint ownership as direct and honest as Ellie without erasing monorepo/library differences |
| What have I learned? | One root owner is right; precedence, blanket exceptions, and a weak oracle are the real debt |
| What have I done? | Audited every current config layer and recorded a ranked cleanup target |

Open risks:
- The four Next React Doctor rules remain effectively enabled until the config is
  changed.
- Broad unsafe-value scopes can hide new typed-code regressions.
- The current checker will not catch either class reliably.
