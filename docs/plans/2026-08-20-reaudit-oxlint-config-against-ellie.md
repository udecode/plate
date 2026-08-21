# reaudit oxlint config against ellie

Objective:
Reaudit Plate's Oxlint policy against Ellie; done when every root off and
override has an evidence-backed keep, re-enable, narrow, or delete verdict.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-20-reaudit-oxlint-config-against-ellie.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: direct user request
- id / link: current `oxlint.config.ts` and sibling `../ellie/oxlint.config.ts`
- title: harsh full Oxlint config reaudit against Ellie
- acceptance criteria: audit the current effective config after the completed
  cleanup; say plainly what remains weird; classify every global off and local
  exception by semantic reason rather than diagnostic count; decide which
  rules should be re-enabled; give the cleanest durable target without editing
  the config

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
- initial confidence score: N/A: complete binary inventories are stronger
- improvement loop: compare source and effective configs, replay disputed
  rules, inspect representative diagnostics, and challenge each exception
- final score / loop closure: 100% of root offs and overrides classified

Completion threshold:
- The final report accounts for every root `off`, every override, every ignore,
  preset projection, checker invariant, and material Plate/Ellie difference.
- Every disputed rule gets a keep, re-enable, configure, narrow, or delete
  verdict backed by semantics and representative source, never error volume.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-20-reaudit-oxlint-config-against-ellie.md` passes.

Verification surface:
- Static imports and programmatic inventories of both configs; effective preset
  comparison; config-checker execution; targeted Oxlint JSON replays for
  disputed rules; representative source inspection; and consumer/ignore audit.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Read-only audit: do not edit lint config or product source. This required goal
  plan is the only repository write.
- Diagnostic count is evidence of prevalence only, never a disablement reason.

Boundaries:
- Source of truth: `oxlint.config.ts`, `tooling/scripts/check-oxlint-config.mjs`,
  installed Ultracite presets, migration rule policy, root command consumers,
  and corresponding owners in `../ellie`.
- Allowed edit scope: this audit plan only; final deliverable is analysis.
- Browser surface: N/A: lint policy has no browser-rendered surface.
- Browser strategy: N/A: no app/UI behavior is changed.
- Tracker sync: N/A: direct request, no tracker.
- Non-goals: no implementation, no commit/PR, no rule disablement based on
  counts, and no assumption that Ellie's smaller repository needs Plate's
  monorepo-specific ownership.

Output budget strategy:
- Parse configs and JSON diagnostics into bounded summaries; save large replay
  output under `/tmp`; inspect representative diagnostics by rule; exclude
  generated/build/cache trees except where an ignore or override owns them.

Blocked condition:
- Stop only if either config or installed preset cannot be loaded and no source
  equivalent exists. Local source and prior migration evidence are available.

Task state:
- task_type: review / investigation
- task_complexity: non-trivial auditable
- current_phase: closeout
- current_phase_status: complete
- next_phase: N/A
- goal_status: complete

Current verdict:
- verdict: keep one root owner, re-enable ten global rules, narrow five
  override areas, and simplify the checker
- confidence: high
- next owner: user-selected implementation pass
- reason: every current root off and override was classified against current
  diagnostics, source semantics, Ultracite policy, and Ellie

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-20-reaudit-oxlint-config-against-ellie.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | full audit, Ellie comparison, re-enable verdicts, semantic reasoning, read-only boundary, and handoff copied above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | `migrate-to-ultracite`, `task`, and `autogoal` read before audit actions |
| Active goal checked or created | yes | goal state checked; new matching goal created after this plan shell |
| Source of truth read before edits | yes | named current and prior audit plans plus governing skill sources read; config exploration follows goal setup |
| Tracker comments and attachments read | no | N/A: direct request |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: the named migration and prior audit plans are the owning decision history |
| TDD decision before behavior change or bug fix | no | N/A: read-only audit |
| Branch decision for code-changing task | no | N/A: no source change |
| Release artifact decision | no | N/A: no package or registry change |
| Browser tool decision for browser surface | no | N/A: no browser surface |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | bounded JSON summaries and representative source reads recorded above |

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
      is recorded with reason. N/A: read-only audit; the recommended owner is
      one root config plus local directives for one-off exceptions.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: findings-first audit with ranked verdicts;
      PR/tracker fields are N/A.
- [x] Branch handling recorded for code-changing work: N/A: read-only audit.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      N/A: config imports and repeated replays were stable.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. N/A: read-only audit.
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason. N/A: no implementation
      patch.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
      N/A: no agent source changed.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Classify every root off and override | 157 root offs and 12 override blocks accounted for below |
| Bug reproduced before fix | no | N/A: audit, no fix | N/A: no bug implementation |
| Targeted behavior verification | yes | Run focused config and rule probes | structural checker, exact audit, doctor, strict override replay, and candidate-rule replay completed |
| TypeScript or typed config changed | no | N/A | no config change |
| Package exports or file layout changed | no | N/A | no topology change |
| Package manifests, lockfile, or install graph changed | no | N/A | no dependency change |
| Agent rules or skills changed | no | N/A | no agent source change |
| Workspace authority proof | yes | Run from owning roots | Plate probes ran from `/Users/zbeyens/git/plate-2`; Ellie source was read from `/Users/zbeyens/git/ellie` |
| Browser surface changed | no | N/A | lint policy has no browser surface |
| Browser final proof | no | N/A | no browser surface |
| CI-controlled template output changed | no | N/A | no template output touched |
| Package behavior or public API changed | no | N/A | no source change or changeset |
| Registry-only component work changed | no | N/A | no registry change |
| Docs or content changed | no | N/A | only this required internal goal ledger changed; no public docs owner |
| High-risk mini gate | no | N/A | read-only audit |
| Agent-native review for agent/tooling changes | no | N/A | no tooling implementation changed |
| Local install corruption suspected | no | N/A | repeated config imports and rule replays were stable |
| P1 autoreview for non-trivial implementation changes | no | N/A | no implementation patch |
| PR create or update | no | N/A | no PR requested |
| Task-style PR body verified | no | N/A | no PR |
| PR proof image hosting | no | N/A | no PR/browser proof |
| Tracker sync-back | no | N/A | direct request, no tracker |
| Final handoff contract | yes | Fill the fields below | completed |
| Final lint | yes | Check audited config sources | `pnpm exec ultracite check oxlint.config.ts tooling/scripts/check-oxlint-config.mjs` passed |
| Output budget discipline | yes | Keep large diagnostics artifacted and summarized | strict replays were parsed into counts and bounded examples; one verbose replay was replaced by bounded output |
| Timed checkpoint | no | N/A | no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-20-reaudit-oxlint-config-against-ellie.md` | passed after final evidence update |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Plate, Ellie, installed presets, policy, checker, and prior audit read | inventory |
| Implementation | complete | N/A: read-only audit | verification |
| Verification | complete | exhaustive inventories plus strict rule/override replays | closeout |
| PR / tracker sync | complete | N/A: neither requested | final response |
| Closeout | complete | ranked verdict and exact rule ledger recorded | final response |

Findings:
- Plate is structurally right to keep one root config. Restoring a hidden base
  module would shorten the visible file by hiding policy, not by removing it.
- Current inventory: 622 lines, 5 extends, 68 effective ignores, 12 overrides,
  21 selectors, 135 selector/rule pairs, 172 root rules, and 157 root offs.
  Ellie has 349 lines, 10 overrides, 31 selector/rule pairs, 106 root rules,
  and 100 root offs. Ellie is smaller partly because it does not select the
  full 149-rule React Doctor preset; Plate disables 14 of those rules and keeps
  135 enabled. Copying Ellie literally would reduce coverage.
- The canonical 99-rule migration baseline is fully accounted for: 95 root
  offs plus four Next React Doctor offs scoped to the two Next apps. Keep all
  99; their reasons are semantic, not diagnostic-volume excuses.
- Re-enable these ten current root offs, fixing ordinary sites and localizing
  only the true exceptions:
  - `jsx-a11y/prefer-tag-over-role` (32): most hits are composite widgets, but
    a global off hides future genuine native-element fixes.
  - `typescript/await-thenable` (57): hits are definite synchronous values,
    including sync tests and Promise aggregators; an intentional microtask
    should be written explicitly.
  - `typescript/no-base-to-string` (22): several hits can emit
    `[object Object]`; explicit `String(value)` does not make that safe.
  - `typescript/no-deprecated` (46): compatibility fallbacks need exact allows,
    while `keyCode`, `which`, `MutableRefObject`, and stale framework APIs are
    useful maintenance findings.
  - `typescript/only-throw-error` (19): keep exact exceptions for React
    Suspense, structured upload objects, and stored error identity; the rule
    already allows direct `unknown`, `any`, and real catch rethrows.
  - `typescript/switch-exhaustiveness-check` (41): it caught concrete missing
    literals such as `json`, `default`, and `none`; intentional partial
    dispatch should use a documented default or local directive.
  - `typescript/no-unnecessary-type-parameters` (111): it caught dishonest
    caller-selected casts such as `extractAppiumJsonValue<T>` as well as
    removable one-use editor generics; preserve real public inference points
    locally.
  - `unicorn/no-document-cookie` (2): both current preference/theme owners are
    exact exceptions, not a repository-wide reason.
  - `unicorn/no-new-array` (34): current sparse allocation is intentional, but
    future single-argument arrays deserve review; mark the actual allocations.
  - `unicorn/prefer-string-slice` (3): all current uses have ordinary positive
    bounds and can use `slice`; retain a local exception only for a real
    reversed-bound algorithm.
- Keep the other 52 non-baseline root offs. They reject syntax rather than
  unsafe use, conflict with public type/runtime contracts, or propose known
  semantic rewrites:
  - Anti-Slop: `no-chained-type-assertions`, `no-unknown-returns`,
    `no-unsafe-dictionary-type`, `no-reflect-get`, and `no-reflect-apply`.
  - React Doctor/React: `js-cache-property-access`, `js-combine-iterations`,
    `js-flatmap-filter`, `js-tosorted-immutable`, `no-barrel-import`,
    `no-json-parse-stringify-clone`, `only-export-components`,
    `prefer-module-scope-pure-function`, `no-many-boolean-props`,
    `prefer-useReducer`, `react-compiler-no-manual-memoization`,
    `rendering-svg-precision`, `async-await-in-loop`, `no-giant-component`,
    `react/react-compiler`, and `react/no-react-children`.
  - TypeScript: `array-type`, `ban-types`, `consistent-type-assertions`,
    `consistent-type-imports`, `method-signature-style`, `no-empty-interface`,
    `no-explicit-any`, `no-inferrable-types`, `no-invalid-void-type`,
    `no-meaningless-void-operator`, `no-redundant-type-constituents`,
    `no-unnecessary-template-expression`, `no-unnecessary-type-arguments`,
    `no-unnecessary-type-assertion`, `no-useless-default-assignment`,
    `require-array-sort-compare`, `restrict-template-expressions`, and
    `unified-signatures`.
  - Runtime/style owners: `no-empty-function`, `no-param-reassign`,
    `no-shadow`, `no-warning-comments`, `node/callback-return`,
    `oxc/no-barrel-file`, `unicorn/empty-brace-spaces`,
    `unicorn/numeric-separators-style`, `unicorn/prefer-code-point`,
    `unicorn/prefer-dom-node-dataset`, `unicorn/prefer-dom-node-remove`,
    `unicorn/prefer-dom-node-text-content`, and `unicorn/prefer-math-trunc`.
- `typescript/restrict-template-expressions` should stay off, but its current
  reason is wrong: the rule already allows primitive interpolation. Its 96
  hits are dominated by deliberate `Path`/tuple formatting; once
  `no-base-to-string` is enabled, the useful object-coercion signal has a
  better owner.
- Override verdicts:

  | # | Owner | Verdict |
  |---|-------|---------|
  | 0 | Next apps | Keep; scoped preset projection and four policy offs are correct. |
  | 1 | unchecked JavaScript | Keep; files lack `checkJs` ownership. |
  | 2 | tests | Narrow: keep broad fixture rules only where structurally required; localize display-name, string-ref, Next-module, and sparse-delete exceptions; narrow unsafe call/member/return after repairing shared test typings. |
  | 3 | Plite JSX value tests | Keep; JSX constructs editor values, not React lists. |
  | 4 | console owners | Keep; terminal output is the product of these paths. |
  | 5 | declarations | Keep; strict replay proved all five declaration exceptions active. |
  | 6 | type tests | Keep; compile-only erased contracts triggered all five rules. |
  | 7 | Playwright bridge | Keep; all five cross-realm exceptions are active. |
  | 8 | Fumadocs clean-tree consumers | Keep, but replace the brace selector with two literal paths so existence auditing is real. |
  | 9 | benchmarks/editor perf | Narrow to cross-realm/runtime payload boundaries; typed benchmark internals should not inherit five blanket unsafe exemptions. |
  | 10 | registry values | Keep fixture-specific rules and four active unsafe rules; delete stale `typescript/no-unsafe-call` (zero hits). |
  | 11 | two CommonJS configs | Move to file-local disable headers and delete the exact-file config block. |

- The test replay found 22,409 unsafe diagnostics in 1,232 test files. That
  proves a real dynamic harness boundary, but it does not prove every test
  deserves every exemption. Ellie keeps only unsafe argument/assignment
  test-wide; Plate should converge toward that shape by fixing shared harness
  types and retaining fuller exemptions only for the dynamic editor harnesses.
- The config duplicates the React Doctor JS-plugin registration:
  `selectJsPlugins(['react-doctor'])` and `nextJsPlugins.jsPlugins` resolve to
  the same entry. Keep only the selected preset registration and the native
  Next plugin registration. Import Ultracite's exported `jsPluginSettings`
  instead of copying its literal value.
- Ignore cleanup is small: narrow `**/skills/**` to `skills/**` for the two root
  symlinks, and delete the currently empty `tests/**/donor/**` pattern. Keep
  docs, templates, public assets, temp/build outputs, and the three real donor
  owners ignored.
- The root rule block has a late catch-all section after the Unicorn group.
  Reorder once by plugin and rule name. Do not split it into another module.
- The comments are over-lawyered: 64 P-tier comments exceed 160 characters
  versus 14 in Ellie. Keep the tier and one durable counterexample; delete the
  defensive essay around it.
- Override comments do not follow the root policy: most grouped offs lack an
  immediately attached P-tier reason. Ellie documents each explicit off.
  Apply the same rule to overrides, using short owner-specific reasons.
- The 239-line checker is too confident for what it proves. It treats every
  root-off/local-on pair as invalid even though scoped stricter policy is valid,
  treats brace-expanded exact files as unaudited globs, checks only the native
  Next preset for future override drift, and its optional exact replay is not
  part of `check`. After moving one-off exceptions local, reduce it to literal
  path existence, duplicate selector/rule pairs, both Next preset projections,
  and adjacent off reasons. Delete the exact-replay mode and report only that
  structural checks passed.
- Exception hygiene is the larger follow-up: Plate has 458 directives in 371
  of 3,703 code files; Ellie has 72 in 43 of 1,633. Plate's dynamic editor
  boundaries explain part of that gap, but generic repeated unsafe-value prose
  is not source-specific proof. Do not move ten global rules into hundreds of
  boilerplate headers; fix ordinary hits first and suppress only the real
  boundary expression or owner.

Decisions and tradeoffs:
- Keep one visible root config. A helper/base module would conceal the rule
  ledger and recreate the navigation problem already removed.
- Optimize for effective signal, not file length or diagnostic count. Plate's
  extra React Doctor coverage is worth more than Ellie's smaller source file.
- Re-enable ten rules because their current global reasons are absent,
  overbroad, or factually wrong. Retain all other offs because the rule itself
  is negative-sum for Plate's recurring contract.
- Put stable file classes in config; put rare exact-file or line exceptions in
  source where `reportUnusedDisableDirectives: 'deny'` can retire them.
- Keep repeated unsafe rule names visible per semantic owner. A shared
  `unsafeValueRules` helper would save lines by hiding why the owners differ.

Implementation notes:
- N/A: the user requested an audit, not config changes.

Review fixes:
- N/A: no implementation diff.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `/tmp` config could not resolve the workspace config loader | 1 | create an ephemeral config beside the root owner | strict replay completed; ephemeral configs removed |
| One focused diagnostic listing exceeded the output cap | 1 | rerun with rule/file aggregation | bounded counts and representative owners recorded |

Verification evidence:
- All Plate commands ran from `/Users/zbeyens/git/plate-2`; Ellie source reads
  used `/Users/zbeyens/git/ellie`.
- Programmatic config inventory and rule-policy comparison accounted for all
  157 root offs: 95 shared-baseline keep, 10 re-enable, and 52 Plate/conditional
  keep.
- Strict override replay accounted for every explicit override off. It exposed
  one stale pair: registry values + `typescript/no-unsafe-call`.
- Candidate replay counts: no-base-to-string 22, await-thenable 57,
  no-deprecated 46, only-throw-error 19, switch-exhaustiveness 41,
  no-unnecessary-type-parameters 111, prefer-tag-over-role 32,
  no-document-cookie 2, no-new-array 34, and prefer-string-slice 3.
- `node tooling/scripts/check-oxlint-config.mjs` passed: 172 root rules and 135
  selector/rule pairs.
- `node tooling/scripts/check-oxlint-config.mjs --audit-exact` passed in 1.5s
  and proved only the two CommonJS selector/rule pairs.
- `pnpm exec ultracite doctor` passed all six checks with zero warnings/fails.
- `pnpm exec ultracite check oxlint.config.ts tooling/scripts/check-oxlint-config.mjs`
  passed formatting and lint for both audited owners.
- Temporary replay configs were removed after the diagnostics were parsed.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-20-reaudit-oxlint-config-against-ellie.md`
  passed after final evidence closure.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: direct request
- Confidence line: high
- Flow table:
  - Reproduced: config/rule diagnostics complete; browser N/A
  - Verified: exhaustive source and strict replay audit; browser N/A
- Browser check: N/A: no browser surface
- Outcome: decisive clean target, ten re-enable rules, and override/checker
  cleanup order
- Caveat: implementing the ten-rule packet changes source and needs phased
  owner tests; this turn made no config/source change
- Design:
  - Chosen boundary: one root config plus source-local rare exceptions
  - Why not quick patch: minimizing lines would hide policy rather than improve it
  - Why not broader change: the retained 147 global offs have durable semantic reasons
- Verified: Plate/Ellie configs, presets, checker, ignores, overrides, root rules,
  source directives, and focused rule diagnostics
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
- Caveats: recommendations are audited but unimplemented

Timeline:
- 2026-08-20T08:37:28.453Z Task goal plan created.
- 2026-08-20 Plate/Ellie config, preset, checker, ignore, override, directive,
  and disputed-rule inventories completed.
- 2026-08-20 Strict replays classified every root off and override; temporary
  configs removed; targeted config checks passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Audit closeout complete |
| Where am I going? | Final findings handoff |
| What is the goal? | Make Plate's effective Oxlint policy as direct and honest as Ellie without deleting monorepo/library coverage |
| What have I learned? | One root owner is right; ten global exemptions and five override areas remain too broad |
| What have I done? | Accounted for all rules/overrides and produced a ranked clean target |

Open risks:
- Re-enabling the ten selected rules without owner-level review could change
  public type inference, runtime error identity, DOM semantics, or test intent.
- Broad test and benchmark unsafe overrides still hide some real diagnostics
  until their shared erased-value owners are repaired.
- The checker still overclaims effective consistency and cannot audit the
  brace-expanded Fumadocs exact paths.
