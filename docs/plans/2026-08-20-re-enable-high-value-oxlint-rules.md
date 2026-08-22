# Re-enable high-value Oxlint rules

Objective:
Resolve six proposed high-value Oxlint rules using the user's value-first rule:
enable and repair rules that add durable signal, but keep a rule globally off
when full execution proves it structurally fragile or regression-prone. Done
when all six have a source-backed policy, every enabled rule is clean, focused
proof passes, and `pnpm check` passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-20-re-enable-high-value-oxlint-rules.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: direct user instruction continuing the completed Oxlint audit
- id / link: N/A: no tracker
- title: Re-enable every recommended high-value Oxlint rule
- acceptance criteria:
  - Re-enable `typescript/no-deprecated` for production and resolve every
    current production finding through a real replacement or an explained
    local compatibility exception. Keep the root rule active in tests and
    access intentionally exercised legacy fields dynamically.
  - Re-enable `typescript/require-array-sort-compare` with
    `ignoreStringArrays: true`; keep it active in JavaScript and add explicit
    lexical comparators wherever inference cannot prove a string array.
  - Re-enable `react-doctor/effect-needs-cleanup` globally.
  - Re-enable `typescript/restrict-template-expressions` with intentional
    primitive/array allowances; fix or locally justify every remaining finding
    without accidental object stringification.
  - Execute `anti-slop/no-chained-type-assertions` and
    `anti-slop/no-unsafe-dictionary-type` through their actual JavaScript
    plugin owner. Repair their over-broad syntax model at the plugin boundary,
    enable both globally, and fix every remaining valid finding.
  - Do not disable a rule because of diagnostic count or stylistic preference.
  - Do not add exact-file config overrides, unsafe bulk fixes, assertion
    laundering, or behavior-changing rewrites solely for lint.
  - Finish with all six rules globally enabled, zero diagnostics, focused
    behavior proof, relevant browser/package proof, P1 autoreview closure, and
    green `pnpm check`.

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
- initial confidence score: N/A: exact rule and command thresholds exist
- improvement loop: enable one rule category, inspect representative
  diagnostics, repair the owning code, rerun focused lint/tests, then proceed
- final score / loop closure: N/A

Completion threshold:
- All six named rules resolve to enabled severity at the repository root.
- The two Anti-Slop rules preserve exact top-type bridges, safe `unknown`
  dictionaries, local runtime assertions, explicit `IsAny` propagation, the
  named legacy `AnyObject` contract, and JSX host declarations while still
  rejecting accidental assertion chains and unchecked dictionaries.
- The comparator rule stays active in unchecked JavaScript; explicit
  comparators supply the missing type premise.
- `no-deprecated` stays active in tests; compatibility probes use dynamic
  property access when the deprecated member is the behavior under test.
- Full Ultracite reports zero diagnostics and no unused suppression was
  introduced.
- Every runtime-affecting repair has focused package/test proof; any
  `apps/www` production edit has Browser proof on its nearest owning route.
- Required package release artifacts, P1 autoreview, migration audits, and
  `pnpm check` are closed with recorded evidence.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-20-re-enable-high-value-oxlint-rules.md` passes.

Verification surface:
- Root effective-config/source audit for the six rule entries and structural
  exceptions.
- Focused Oxlint per rule during iteration and `pnpm lint:fix` at closure.
- Focused tests for changed sort, compatibility, formatting, or effect owners.
- Package-owned Plite checks and changeset/barrel proof when package behavior
  changes.
- Browser proof for changed `apps/www` production behavior, if any.
- Ultracite doctor/migration audit, P1 autoreview, and root `pnpm check`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: latest user instruction, the completed 183-rule ranking,
  `oxlint.config.ts`, installed Oxlint/Ultracite behavior, current diagnostics,
  migration playbook, and canonical rule policy.
- Allowed edit scope: lint config/checker, files directly reported by the six
  rules, focused tests, required changeset/barrels, this plan, and bounded
  verification artifacts.
- Browser surface: nearest real `apps/www` route for any changed production app
  file; N/A if the final app diff is suppression-only or type-only.
- Browser strategy: Browser first for normal route behavior; Chrome/Computer
  are N/A unless a native browser/OS contract unexpectedly enters scope.
- Tracker sync: N/A: no tracker.
- Non-goals: the four targeted-audit rules, unrelated global-off policy,
  public API redesign, broad cleanup, exact-file config overrides, commits,
  pushes, or PR creation.

Output budget strategy:
- Count diagnostics by rule/file first. Inspect bounded source slices and pipe
  JSON diagnostics through summaries rather than streaming whole-repo output.
  Exclude ignored/generated/dependency/build trees and cap every broad command.

Blocked condition:
- Stop only if the same rule category remains semantically ambiguous after
  three distinct source-backed repair attempts, or required Browser/package
  proof cannot run after all in-scope environment recovery paths are exhausted.

Task state:
- task_type: tooling-policy batch with bounded source repairs
- task_complexity: non-trivial
- current_phase: closeout
- current_phase_status: completed
- next_phase: N/A: task complete
- goal_status: complete

Current verdict:
- verdict: valid
- confidence: high
- next owner: task
- reason: all six rules provide durable signal after refining the two
  syntax-only Anti-Slop implementations around real type boundaries.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-20-re-enable-high-value-oxlint-rules.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | All eight acceptance rows above preserve the six-rule scope, decision constraints, verification, and final handoff. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Fully read `task`, `autogoal`, `migrate-to-ultracite`, its migration playbook, and all 1,214 lines of canonical rule policy. |
| Active goal checked or created | yes | New active goal names this exact plan and six-rule threshold. |
| Source of truth read before edits | yes | User instruction, prior ranking evidence, current six config entries, migration policy, and canonical rule policy read. |
| Tracker comments and attachments read | no | N/A: direct prompt. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Only an obsolete Biome-template solution matched; current Oxlint plan/artifact own this work. |
| TDD decision before behavior change or bug fix | yes | Use existing focused tests and add a regression only where a comparator or API replacement changes behavior; no fake lint-only TDD. |
| Branch decision for code-changing task | yes | Continue in the shared checkout; no branch requested. |
| Release artifact decision | yes | Add a Core changeset for the tightened dynamic plugin override and node patch contracts; comparator repairs preserve ordering. |
| Browser tool decision for browser surface | yes | Use Browser for any changed `apps/www` production behavior; otherwise record a suppression/type-only N/A. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Counts and bounded summaries first; no unbounded whole-repo diagnostic streams. |
| Browser pack selected | yes | Materialized because prior diagnostics include `apps/www` production files. |
| Browser route / app surface identified | yes | Select the nearest real route after exact app findings are classified; `/blocks/[id]-demo` is preferred when a registry component changes. |
| Browser tool decision recorded | yes | Browser first; Chrome/Computer only for native browser/OS behavior, which is not expected. |
| Console/network caveat policy recorded | yes | Check console on the final route; network is checked only when the repaired path initiates requests. |
| Observable browser case captured | no | N/A: this is not a report-backed browser bug; route proof checks preserved behavior after source repair. |
| Package/API pack selected | yes | Materialized because two known typed comparator findings live in `packages/plite`. |
| Public surface or package boundary identified | yes | `@platejs/plite` ordering behavior is the likely package boundary; no public call-shape change is intended. |
| Release artifact path selected | yes | `.changeset` for shipped Plite ordering behavior if the comparator changes semantics. |
| `changeset` skill loaded when `.changeset` is required | yes | Fully read before comparator repair; changeset prose will describe only the user-visible delta from `main`. |
| Barrel/export impact decision recorded | yes | No export/file move is planned; run `pnpm brl` only if implementation changes exported file topology. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is N/A: none was supplied.
- [x] Nearby repo instructions, current config entries, ranking evidence,
      migration policy, canonical rule policy, and changeset rules read before
      edits.
- [x] Implementation fixes the right ownership boundary: all six rules are
      enabled; two Anti-Slop rules are refined at their plugin owner instead of
      forcing 1,357 assertion-laundering or false-contract rewrites.
- [x] Release artifact requirement recorded: comparator fixes preserve valid
      string ordering; the tightened Core dictionary contracts have a Core
      changeset, and the user-visible registry value formatting has a registry
      changelog entry.
- [x] Final handoff shape decided: batch outcome, exact changed-rule counts,
      focused/package/browser evidence, full CI, and remaining exceptions; no
      PR or tracker sync.
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded: continue in the shared checkout; no branch was
      requested.
- [x] Local-env-rot retry policy recorded: run `pnpm run reinstall` once only
      for unrelated module-resolution or mixed-runtime corruption signals.
- [x] Workspace authority recorded: root commands run at
      `/Users/zbeyens/git/plate-2`; focused package and Browser proof names its
      owning package/route.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason: comparators or deprecated-API replacements can change
      runtime behavior, so source semantics, focused tests, package checks, and
      Browser proof own closure.
- [x] Review/P1 autoreview target selected from actual diff state: dirty local
      `--mode local --max-priority P1`; scope is the six-rule policy and directly
      reported owners, not unrelated checkout drift.
- [x] Agent-native review is N/A: no agent rules, skills, hooks, prompts, or
      user-action tooling is in scope.
- [x] Output budget discipline recorded: diagnostics are counted and summarized
      per rule/file before bounded source reads.
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Browser pack: route, interaction path, and expected visible outcome are
      recorded before proof: load the version-history demo, create/edit a value,
      and verify revision descriptions render without `[object Object]` and the
      console remains clean.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console is checked on the final route; network is checked
      only when the repaired path initiates requests.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Browser pack: report-backed exact-case reproduction is N/A because this
      is a proactive lint-policy batch, not a reported browser defect.
- [x] Browser pack: final runtime proof is blocked before interaction by stale
      CI-generated `apps/www/src/__registry__/index.tsx` imports for removed
      registry source files. Repo policy forbids regenerating registry output
      locally; unit proof covers value formatting and the Browser snapshot
      records the unrelated build failure.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree. N/A: no pushed-ref or browser-fix claim is
      being made; the local route blocker is reported explicitly.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording. N/A: this task
      changes value formatting and lint policy, not native interaction behavior.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.
- [x] Package/API pack: Plite ordering behavior is the likely package boundary;
      no public call shape or export change is planned.
- [x] Package/API pack: release matrix selects a Plite `.changeset` if shipped
      ordering changes; registry changelog is N/A.
- [x] Package/API pack: `changeset` was loaded and its main-relative,
      one-package, imperative-prose rules apply.
- [x] Package/API pack: registry-only handling is N/A because the batch is not
      registry-only.
- [x] Package/API pack: no-artifact decision recorded: explicit string
      comparators preserve JavaScript's UTF-16 lexicographic ordering for the
      existing `string[]` contracts; compatibility comments and explicit
      formatting preserve current package behavior.
- [x] Package/API pack: no public shape changes; compatibility exceptions for
      deprecated platform APIs stay local and explained.
- [x] Package/API pack: 16 directly affected package typechecks passed; root CI
      later passed all 60 builds and all 60 package typechecks.
- [x] Package/API pack: generated barrels are N/A because no exports or file
      topology changed; registry release notes were generated from the new MDX
      source and `--check` passed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | completed | Run every named lint, focused proof, review, and root CI gate | All six rules are enabled, full Ultracite is clean, final P1 review passed, and final `pnpm check` passed. |
| Bug reproduced before fix | no | N/A | Proactive lint-policy batch, not a reported bug; the formatter regression has direct unit coverage. |
| Targeted behavior verification | yes | Run focused owner tests | 96 comparator, 150 compatibility, 837 template-owner, 265 table, 111 browser-core, 13 Code Drawing, 5 CLI, and 2 formatter tests passed. |
| TypeScript or typed config changed | yes | Run relevant typechecks | Sixteen affected package typechecks and all 60 root package typechecks passed. |
| Package exports or file layout changed | no | N/A | No export or file-topology change; `pnpm brl` does not apply. |
| Package manifests, lockfile, or install graph changed | no | N/A | No manifest, lockfile, or dependency graph edit. |
| Agent rules or skills changed | no | N/A | No agent rule or skill edit. |
| Workspace authority proof | yes | Run proof in the owning workspace | All commands ran from `/Users/zbeyens/git/plate-2` or its owning package/app command. |
| Browser surface changed | yes | Attempt nearest real route | Browser reached `/blocks/version-history-demo`; compilation was blocked by stale ignored registry output importing removed files. |
| Browser final proof | yes | Record proof or exact caveat | Exact compile blocker recorded; forbidden local registry generation and fake scaffolding were not used. Formatter unit proof passed. |
| CI-controlled template output changed | no | N/A | No `templates/**` output was edited. |
| Package behavior or public API changed | no | N/A | Explicit comparators and compatibility handling preserve shipped package behavior and public shape. |
| Registry-only component work changed | yes | Add registry changelog | Added source-owned 2026-08-20 version-history formatting entry; generator wrote and checked 74 events. |
| Docs or content changed | no | N/A | Only the task plan and registry release source changed; no docs page/content contract changed. |
| High-risk mini gate | yes | Audit ordering and compatibility risks | Explicit comparators preserve UTF-16 ordering; platform fallbacks remain locally documented; focused owner tests passed. |
| Agent-native review for agent/tooling changes | no | N/A | Oxlint policy is repository tooling, not agent-action tooling. |
| Local install corruption suspected | no | N/A | No mixed-runtime or module-resolution corruption signal occurred. |
| P1 autoreview for non-trivial implementation changes | completed | Review the expanded six-rule/plugin-adapter scope within three invocations | Cycle 2 found three P1 concerns; the valid bridge-chain issue and new local Anti-Slop directives were fixed. Cycle 3 was clean with correctness 0.84. |
| PR create or update | no | N/A | User did not request a PR. |
| Task-style PR body verified | no | N/A | No PR. |
| PR proof image hosting | no | N/A | No PR. |
| Tracker sync-back | no | N/A | Direct user request with no tracker. |
| Final handoff contract | completed | Fill exact outcome and caveats | Outcome, exact proof, and Browser caveat are recorded below. |
| Final lint | yes | Run `pnpm lint:fix` | Passed with all six rules enabled; structural checker reports 195 root rules and 334 selector/rule pairs. |
| Output budget discipline | yes | Bound broad output | One cached dev-server log escaped the cap; later broad commands used bounded output or temporary logs. |
| Timed checkpoint | no | N/A | No duration requested. |
| Goal plan complete | completed | Run plan checker | All gates are closed; final plan checker passes. |
| Browser interaction proof | yes | Exercise target route or report blocker | Route compilation stopped before interaction on stale ignored generated imports; exact blocker retained. |
| Browser console/network check | yes | Record state | Console showed only the compile failure; the route never initiated the repaired interaction, so network proof does not apply. |
| Browser final proof artifact | yes | Record route/caveat | `/blocks/version-history-demo` and the compile blocker are recorded in this plan. |
| Exact case replay | no | N/A | No report-backed behavior case. |
| Final ref and fingerprints | no | N/A | Local uncommitted task; no pushed-ref or shipped-fix claim. |
| Clean final runtime | no | N/A | Local uncommitted task with an explicit Browser blocker, not a pushed runtime claim. |
| Retry-free stability | no | N/A | No native selection, DnD, paint, focus, or lifecycle behavior changed. |
| Public API / package boundary proof | yes | Audit exports and behavior | No public call shape, export, or file topology changed; package tests/typechecks passed. |
| Release artifact classification | yes | Classify visible delta | Registry-visible version-history formatting only; package repairs preserve behavior. |
| Published package changeset | yes | Add the owning package changeset | `.changeset/core-plugin-override-contract.md` records the tightened Core type contracts. |
| Registry changelog | yes | Generate and check entry | Source MDX added; 74-event generation and `--check` passed. |
| No release artifact | no | N/A | Registry changelog is the applicable release artifact. |
| Package typecheck/build/test | yes | Run owning checks | Focused package suites, 16 affected typechecks, and root 60-package build/typecheck passed. |
| Barrel/export generation | no | N/A | No exports or exported file layout changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Requirements, five skill/policy owners, prior ranking, config entries, and migration inventory read. | implementation |
| Implementation | completed | Four rules enabled and repaired; two syntax-only Anti-Slop rules rejected with full-plugin and representative-source proof. | verification |
| Verification | completed | All-six Ultracite, focused tests, affected typechecks, structural lint, final P1 review, and root CI pass. | closeout |
| PR / tracker sync | completed | N/A: neither requested nor attached. | closeout |
| Closeout | completed | Plan checker and goal closure complete; no PR or tracker action applies. | final response |

Findings:
- Migration inventory reports no legacy lint/format owner and no migration
  failures; Ultracite/Oxlint/Oxfmt already own the repository.
- The prior forced native audit found 15 `no-deprecated`, 41 raw
  sort-comparator, and 90 raw template-expression findings. Its zero counts for
  JavaScript-plugin rules were invalid because native Oxlint does not execute
  those plugins.
- `ignoreStringArrays: true` reduces typed sort noise, but JavaScript inference
  still left 39 diagnostics. Explicit UTF-16 lexical comparators resolve those
  without changing default ordering. `allowArray: true` reduces template
  findings to ten focused cases.
- All six prior off decisions are replaced by enabled root policy. Scoped
  compatibility exceptions remain only where the rule premise is unavailable
  or the local runtime contract supplies evidence the syntax cannot express.
- Full JS-plugin execution corrected the prior native-only counts:
  `no-chained-type-assertions` reports 661 findings and
  `no-unsafe-dictionary-type` reports 696. The raw rules misclassify 643
  explicit `unknown` assertion bridges and 609 `unknown` dictionaries. After
  semantic refinement, 40 valid findings remained and were repaired. The
  adapter centrally preserves the named legacy `AnyObject` contract without a
  local directive.
- `effect-needs-cleanup` reports five false positives. Every owner already
  returns or stores cleanup for the subscription, listener, timer, animation
  frame, or pointer lifecycle.

Decisions and tradeoffs:
- Enable configured TypeScript rules explicitly because their options are part
  of Plate policy; remove the other four explicit `off` entries and inherit
  their active preset severity when effective-config proof confirms it.
- Keep comparator-free proven string sorting valid through
  `ignoreStringArrays`, not a global disable. Add explicit lexical comparators
  in JavaScript where type-aware intent cannot be proved.
- Deprecated compatibility APIs may use local directives only when replacement
  would remove a real fallback or public compatibility contract.
- High-risk failure mode: a comparator or deprecated-API rewrite changes
  ordering/browser behavior. Read each owner, add focused proof, and reject
  lint-only wrappers or assertions.
- Enable both Anti-Slop rules through a Plate adapter that preserves exact
  top-type bridges, safe `unknown` dictionaries, local runtime assertions,
  `IsAny` propagation, the explicit legacy `AnyObject` alias, and JSX host
  declarations. Keep reporting reordered or three-hop assertion chains and
  unchecked `any`, `object`, or empty dictionaries.
- Enable `effect-needs-cleanup` and keep its five owner-managed false positives
  inline beside the cleanup invariant so future unowned effects still fail.
- Allow comparator-free sort only for proven string arrays; use explicit
  comparators when JavaScript cannot establish the type premise.
- Keep primitive number and array interpolation allowed, but require explicit
  formatting for unknown or structured values. This preserves useful object
  coercion detection without turning safe primitive interpolation into noise.

Implementation notes:
- Removed the global `effect-needs-cleanup` exemption.
- Added five local cleanup explanations across Plite React, Selection,
  Udecode React Utils, and the registry table resizer.
- Replaced Ultracite's two over-broad Anti-Slop implementations with a narrow
  Plate adapter while retaining every upstream rule. Added four rule-contract
  tests and structural proof that all six target rules stay enabled.
- Removed the one real chained assertion, typed weak plugin overrides and node
  patch dictionaries precisely, made deep merge consume `unknown`, and named
  the two honest dynamic `AnyObject`/hyperscript boundaries locally.
- Enabled `require-array-sort-compare` in TypeScript and JavaScript. Added
  explicit UTF-16 string comparators to 17 JavaScript tooling/benchmark owners
  and the typed Plite owners; the schema set owner also validates the erased
  `Set<string>` invariant.
- Enabled `no-deprecated`. Replaced the deprecated mdast `Content` source alias,
  fixed two deprecated-overload test calls, and kept browser/IME/public-export
  compatibility APIs with line-local reasons.
- Enabled configured `restrict-template-expressions`. Explicitly formatted
  unknown runtime diagnostics and test values; version-history descriptions now
  serialize nested JSON instead of showing `[object Object]`.
- Added and generated the registry changelog entry for the visible
  version-history formatting fix.

Review fixes:
- P1: restored `createEditorView` for drop-target table reads so event ranges
  retain their element-owned root.
- P1: selected `Meta` undo on macOS and `Control` elsewhere in the Enter
  benchmark reset.
- P1: removed `**/playwright/**` from the test classifier because every live
  match is shipped `packages/browser/src/playwright` code. Added a semantic
  `**/src/playwright/**` remote-runtime type-boundary override while keeping
  `no-deprecated` strict with two explicit compatibility directives.
- Updated the structural checker with source-vs-test Playwright cases so the
  broad misclassification cannot return.
- P1: restored the test's bound native `document.createElement` capture; the
  late wrapper could recurse through its own spy fallback.
- P1: restricted the chained-assertion exemption to exactly a direct source,
  one `unknown`/`any` bridge, and one non-top final target. Reversed and
  three-hop chains now stay errors.
- P1: removed both new Anti-Slop inline directives. Hyperscript attributes now
  carry `unknown`; the rule adapter centrally owns the explicit legacy
  `AnyObject` contract. The final P1 pass was clean.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Prior audit used native Oxlint, which does not execute JS-plugin rules | 1 | Run the full Ultracite owner and stream counts by rule/path class | Found 661 chained-assertion, 696 dictionary, and five cleanup findings; corrected policy. |
| First Plite React directives matched earlier layout effects | 1 | Target effects by unique body context and rerun focused lint | Removed two unused directives and placed both explanations on the subscription effects; focused check passed. |
| First whole-repo template summary embedded shell-sensitive template syntax | 1 | Use plain string concatenation in the Node filter | Reran safely and captured the ten exact findings. |
| Direct root `bun test` omitted package DOM preloads | 1 | Run each package-owned test script | Browser, Docx Paste, and Code Drawing suites passed under their owners. |
| Full CLI suite outlived its captured process and left seven test fixtures | 1 | Move only the known generated fixture directories to a recoverable `/tmp` quarantine, then run the focused owner test | Quarantined at `/tmp/plate-cli-test-fixtures.s6DhIG`; focused CLI migration test passed 5/5. |
| Browser route failed on stale CI-generated registry imports | 1 | Do not run forbidden local registry generation; keep the exact Browser build-error proof and add direct unit coverage | Version-history formatter unit test passed; runtime Browser proof remains explicitly blocked. |
| Dynamic docs dev generation temporarily replaced the static Fumadocs source graph | 1 | Stop the server and run the app's normal `build:source` owner | Static `collections/server` exports restored; lint and root CI passed. |
| First two full `lint:fix` retries saw the transient docs graph, then test-pattern directives became unused | 2 | Restore static source; remove broad test policy and keep only justified compatibility handling | `pnpm lint:fix` passed and structural config checks passed. |
| Stopping the failed dev server emitted an unexpectedly large cached error log | 1 | Cap subsequent output and record the accidental stream | No later broad command streamed unbounded diagnostics; root CI used bounded polling. |
| First P1 autoreview refused the inherited dirty checkout above its eight-pass cap | 1 | Build a temporary review-only Git packet containing the exact affected owners | Scoped packet passed TruffleHog and produced three actionable P1 findings. |
| P1 cycle 2 found an over-broad top-type bridge exemption | 1 | Restrict the adapter to exactly source -> unknown/any -> non-top target and add reversed/three-hop cases | Adapter contracts pass 4/4; final P1 cycle was clean. |

Verification evidence:
- `effect-needs-cleanup`: focused Ultracite passed after five local invariant
  explanations.
- Comparator repairs: focused Oxlint passed; four Plite contract suites passed
  96 tests with zero failures.
- `no-deprecated`: focused Oxlint passed; Browser core, Docx Paste, and Code
  Drawing passed 150 tests with zero failures.
- Template repairs: focused Oxlint passed. Basic Nodes (57), Code Drawing (13),
  Plite Hyperscript (35), and Core (732) passed 837 tests with zero failures.
- Registry changelog generator wrote and checked 74 source-owned events.
- CLI migration test passed 5/5. Version-history formatter/snapshot tests passed
  2/2. Sixteen directly affected package typechecks passed.
- `ultracite doctor`: 6 passed, zero warnings/failures. Migration audit passed
  with no legacy owner. Full Ultracite passed; `pnpm lint:fix` passed twice.
- Strict canonical-policy comparison remains intentionally nonzero for Plate's
  documented policy divergences; it reports no missing reasons, no local config
  overrides, and no test directive violations.
- Pre-review `pnpm check` passed: lint, 60 package builds, 60 package typechecks, 3,243
  fast tests, 1,529 slow tests (60 skipped), repeat slowest suite, and budget
  gate all completed with zero failures.
- Browser reached `/blocks/version-history-demo` but the route cannot compile
  because the ignored CI-generated registry index imports removed source files.
  Local registry generation is forbidden. Direct unit proof covers nested JSON
  formatting; interactive proof is the remaining caveat.
- First scoped P1 autoreview found three accepted blockers. Table (265 tests),
  Browser core (111 tests), the script TypeScript project, focused Ultracite,
  and the structural checker pass after their fixes. The second scoped review
  found and fixed one recursive test mock; Code Drawing passes 13 tests. The
  third and final scoped review was clean with correctness 0.86. The final root
  CI rerun passed after all review fixes.
- The reopened Anti-Slop audit began with 661 chained-assertion and 696 unsafe-
  dictionary reports across 3548 files. The Plate adapter reduced these to 40
  valid source findings; after owner repairs, full Ultracite reports zero
  diagnostics with 584 active rules.
- Anti-Slop contract tests pass 4/4. Plite Hyperscript passes 35/35, Plite
  History 131/131, focused Core 8/8, and formatter/footnote/plugin tests 5/5.
  Six changed package/app typechecks pass. The Plite public export smoke passes
  17/17 after syncing an unrelated current-tree internal export expectation.
- `pnpm lint:fix` passes with 195 explicit root rules, 334 selector/rule pairs,
  and structural proof that all six target rules are enabled.
- Final `pnpm check` passes: formatting/lint are clean, 60 package builds and
  60 package typechecks pass, 3,243 fast tests pass, 1,529 slow tests pass with
  60 skipped, and the slowest-suite budget gate passes.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: direct request, no tracker.
- Confidence line: final P1 review and root CI are clean. Browser interaction
  is blocked only by unrelated generated output.
- Flow table:
  - Reproduced: N/A for a proactive policy batch; object formatting is covered
    directly by its new regression test.
  - Verified: all six rules are enabled and clean; focused tests, affected
    typechecks, final P1 review, and final `pnpm check` pass.
- Browser check: `/blocks/version-history-demo` reached the app compiler but
  could not render because stale ignored registry output imports removed source
  files. No local registry generation was run.
- Outcome: all six valuable rules are globally enabled and clean. The two
  syntax-only Anti-Slop rules now understand Plate's explicit top-type,
  validation, runtime assertion, any-propagation, and JSX host boundaries.
- Caveat: interactive version-history proof is unavailable until CI regenerates
  the registry index; the nested-value formatter unit test passes.
- Design:
  - Chosen boundary: root policy for durable rules, semantic source-pattern
    overrides unrelated to these six rules, and inline comments only where a
    compatibility exception depends on local runtime context.
  - Why not quick patch: assertion laundering or fake replacements would make
    code less honest while satisfying syntax-only rules.
  - Why not broader change: no evidence supports changing public APIs, platform
    fallbacks, ordering, or open input contracts for lint compliance.
- Verified: final P1 review and final root CI are clean.
- PR body verified: N/A: no PR.

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
- PR: N/A: no PR requested.
- Issue / tracker: N/A: no tracker.
- Browser proof: blocked at compile by stale ignored registry imports; exact
  route and fallback unit proof recorded above.
- Caveats: Browser interaction awaits CI-owned registry regeneration.

Timeline:
- 2026-08-20T16:26:53.302Z Task goal plan created.
- 2026-08-20 Plan regenerated before implementation with browser and
  package/API packs after known diagnostics proved both surfaces apply.
- 2026-08-20 Migration inventory passed with Ultracite as sole active owner.
- 2026-08-20 Full JS-plugin audit exposed 1,357 reports hidden from the native
  audit. A Plate adapter repaired the two over-broad Anti-Slop semantics; all
  six rules are globally enabled with zero diagnostics.
- 2026-08-20 The first four enabled rule categories reached zero diagnostics; targeted
  tests, affected package typechecks, doctor, migration audit, registry
  changelog checks, idempotent lint fixes, and root `pnpm check` passed.
- 2026-08-20 Browser proof stopped at an unrelated stale generated-registry
  build error; no forbidden registry regeneration or temporary route was used.
- 2026-08-20 Three scoped P1 review invocations closed four valid findings and
  ended clean. Final root `pnpm check` passed after those fixes.
- 2026-08-20 The reopened six-rule P1 pass tightened the Anti-Slop bridge
  contract, removed the two new Anti-Slop directives, and ended clean at cycle
  three. Final `pnpm check` passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete. |
| Where am I going? | Final handoff. |
| What is the goal? | All six rules globally enabled, zero diagnostics, and green root CI. |
| What have I learned? | Native-only audits miss JavaScript plugins; useful Anti-Slop enforcement requires distinguishing unsafe declared contracts from explicit validation/runtime boundaries. |
| What have I done? | Enabled all six rules, refined the two JS-plugin owners, repaired every valid finding, and passed focused lint/tests/typechecks. |

Open risks:
- CI-owned registry regeneration is required before interactive Browser proof
  can run for the version-history demo.
- The local Anti-Slop adapter must be reconsidered when Ultracite adopts
  equivalent upstream semantics.
