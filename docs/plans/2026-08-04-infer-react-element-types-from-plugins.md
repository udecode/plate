# Infer React element types from plugins

Objective:
Infer React node hook types from descriptors; done when every first-party
`*Element` hook generic is migrated or justified and package/API/browser checks
pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-04-infer-react-element-types-from-plugins.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct user request
- id / link: current Codex task
- title: Infer React element types from plugin descriptors
- acceptance criteria: inventory every first-party React call whose generic is
  an exported `*Element` type; make descriptor inference the canonical path;
  migrate every sound call to its plugin descriptor; justify survivors; reduce
  type-only element imports; preserve behavior and exact inference.

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
- initial confidence score: N/A: exact source and typecheck thresholds exist
- improvement loop: continue until the source inventory has no unexplained row
- final score / loop closure: N/A

Completion threshold:
- Every first-party React call using an exported `*Element` type solely as a
  generic inference argument is either migrated to an exact plugin descriptor
  or recorded as an unsound/non-plugin exception.
- The owning React API accepts descriptors without losing direct node-type
  compatibility or inference.
- No migrated file retains an element-type import used only by the old generic.
- The final bounded source audit, relevant package/app typechecks, lint, focused
  tests, Browser proof or exact blocker, P2 autoreview, and mechanical goal
  checker pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-04-infer-react-element-types-from-plugins.md` passes.

Verification surface:
- Bounded `rg` inventory across `packages/**`, `apps/www/src/**`, and current
  `content/**`, excluding generated/template output.
- Compile-only inference tests at the React/Core owner.
- Source-first typechecks for every modified package plus `www` when registry
  consumers change.
- Focused affected tests, `pnpm lint:fix`, and Browser proof on one affected
  `/blocks/*-demo` route.
- `autoreview --max-priority P2` over the actual local diff.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Preserve direct node-type generics as a compatibility escape only if they
  remain materially useful and do not create ambiguous inference.
- Do not replace domain element types where callers genuinely manipulate a
  node shape rather than merely select the current rendered element.
- Do not edit CI-generated registry or template output.

Boundaries:
- Source of truth: public `useElement`/related React types, descriptor schema
  extractors, and all first-party production consumers.
- Allowed edit scope: owning React/Core type implementation, compile-only tests,
  first-party package/registry/docs call sites, imports, exports, release
  artifact, and this plan.
- Browser surface: one affected modern registry component's standalone
  `/blocks/[id]-demo` route selected from the final migration inventory.
- Browser strategy: Browser. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: direct local request, no issue or PR requested.
- Non-goals: rewriting domain algorithms, removing useful exported element
  aliases, generated template edits, or unrelated plugin/schema redesign.

Output budget strategy:
- Count/file-list searches first; cap source reads to owning definitions and
  representative consumers; exclude `node_modules`, generated registry,
  templates, build output, changelogs, and migration docs unless directly
  relevant.

Blocked condition:
- Stop only if exact descriptor-to-element inference cannot be expressed without
  breaking direct generic consumers or TypeScript declaration emit after three
  distinct owner-level designs and focused compile proofs.

Task state:
- task_type: public React type API hardening plus repo-wide adoption
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: final handoff
- goal_status: ready_to_complete

Current verdict:
- verdict: descriptor-first element inference is the sole first-party path
- confidence: 0.98 after type, package, app, audit, and P2 review proof
- next owner: none
- reason: the descriptor owns both provider scope and its exact local schema
  node; a separate `*Element` generic duplicates identity and can accidentally
  admit dependency nodes

Completion rule:
- Every applicable gate below is closed. The mechanical checker is the final
  prerequisite before `update_goal(status: complete)`.
- This file plus the active goal are the durable state; no hook state exists.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance rows above capture descriptor inference, exhaustive migration, and reduced element-type imports |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | `autogoal` and `best-api` loaded; public inference belongs to React/Core, adoption to first-party consumers |
| Active goal checked or created | yes | Active goal created for this exact plan |
| Source of truth read before edits | yes | Root `VISION.md`, `docs/vision/common.md`, and `docs/vision/plate.md` read; live API owner read is the first inventory action before source edits |
| Tracker comments and attachments read | no | N/A: direct request, no tracker or attachment |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | yes | Narrow source search scheduled before implementation; any matching solution will be read |
| TDD decision before behavior change or bug fix | yes | Compile-only inference proof first; runtime behavior must remain unchanged |
| Branch decision for code-changing task | no | N/A: user did not request branch/commit/PR work |
| Release artifact decision | yes | Published React type/API improvement requires a package changeset; exact package selected after owner inventory |
| Browser tool decision for browser surface | yes | Browser on a representative affected `/blocks/*-demo` route |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Count/file-list first; generated/build/template exclusions recorded above |
| Package/API pack selected | yes | Public React generic inference and package adoption |
| Public surface or package boundary identified | yes | `@platejs/react` hook typing plus first-party package/registry consumers |
| Release artifact path selected | yes | `.changeset` for the published owning package; load `changeset` before authoring it |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded before updating the existing Core and Media changesets |
| Barrel/export impact decision recorded | yes | Run `pnpm brl` only if exports or exported layout change; otherwise N/A at closeout |
| Browser pack selected | yes | Required because packages/apps source will change |
| Browser route / app surface identified | yes | One affected modern registry demo, exact id selected from inventory |
| Browser tool decision recorded | yes | In-app Browser; no native browser behavior involved |
| Console/network caveat policy recorded | yes | Check both; record exact pre-feature/generated blocker rather than claim success |

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
- [x] Required video or screen-recording evidence is N/A: no video supplied.
- [x] Nearby repo instructions and implementation patterns read before edits:
      root/Plate Vision and the governing skills.
- [x] Implementation fixes the right ownership boundary: exact local node
      witnesses live on Base/Plate descriptors and feed hooks plus component props.
- [x] Release artifact requirement recorded: published owner package changeset;
      exact package is fixed after the source owner is confirmed.
      N/A with reason.
- [x] Final handoff shape decided: outcome, migrated/kept counts, API owner,
      checks, browser caveat, release artifact, and residual risks; no PR/tracker.
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling N/A: no branch, commit, or PR requested.
- [x] Local-env-rot retry policy: N/A. Failures were deterministic source,
      generated-registry, lint-command, or reviewer-tooling failures, not React
      install corruption.
- [x] Workspace authority recorded: all source/package proof runs from
      `/Users/zbeyens/git/plate-2`; Browser proves the local www route.
      owns the changed behavior.
- [x] High-risk note: wrong witness ownership can widen exact nodes to dependency
      unions or broad `Element`; compile-only owner/dependency/schema-less/factory
      cases and www typecheck cover those failure modes.
- [x] P2 autoreview used a path-bounded actual-diff snapshot because unrelated
      shared changes made the full local credential scan fail closed.
- [x] Agent-native review passed after the `best-api` rule repair and generated
      skill sync.
- [x] Output budget discipline recorded: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Package/API pack: Core owns the public hook/props types; package callers
      adopt them; no exported file layout changed.
- [x] Package/API pack: existing Core/Media changesets plus a registry changelog
      entry record the published and copied-registry deltas.
- [x] Package/API pack: `changeset` and `registry-changelog` instructions were
      loaded and followed; no forbidden package version bump was added.
- [x] Package/API pack: hard cut is explicit: unchecked type-only hook generics
      are gone; bare erased hooks remain only for schema-agnostic access.
- [x] Package/API pack: Core, Callout, Math, Table, Media build/tests, and www
      proof are recorded below; Media's unrelated typecheck error is exact.
- [x] Package/API pack: barrels are N/A because no exports or exported files moved.
- [x] Browser pack: `/blocks/table-demo` was selected to render descriptor-typed
      table components.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it. Only Browser
      applied here.
- [x] Browser pack: console showed the exact generated missing-module blocker;
      the route returned 500 before task UI rendered.
- [x] Browser pack: visual artifact waived because the app failed before render
      in unrelated generated registry code.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named audits and checks | Source audits, package/app proof, Biome, diff-check, review complete |
| Bug reproduced before fix | yes | Record inference failure | Dependency-union and schema-less cases captured as compile-only regressions |
| Targeted behavior verification | yes | Run focused tests | Core 700, Callout 3, Math 16, Table 235, Media 84 all passed |
| TypeScript or typed config changed | yes | Run typechecks | Core, Callout, Math, Table, and www passed |
| Package exports or file layout changed | no | N/A | No exported files or barrels changed |
| Package manifests or install graph changed | no | N/A | No manifest/lockfile change; install only regenerated skills |
| Agent rules or skills changed | yes | Regenerate and review | `pnpm install`; both best-api mirrors synced; agent-native review passed |
| Workspace authority proof | yes | Run in owner repo | All commands ran in `/Users/zbeyens/git/plate-2` |
| Browser surface changed | yes | Use Browser | `/blocks/table-demo` attempted; unrelated generated import returned 500 |
| Browser final proof | yes | Record exact caveat | Console identified missing `registry/components/editor/plate-types.ts` import |
| CI-controlled template output changed | no | N/A | Templates untouched |
| Package behavior or public API changed | yes | Update changesets | Core and Media release prose updated |
| Registry component work changed | yes | Registry release artifact | Dated source entry generated and 45/45 check passed |
| Docs or content changed | yes | Verify source parity | Full www typecheck passed docs source/API checks |
| High-risk mini gate | yes | Prove exact ownership | Dependency, factory, and schema-less contracts pass declaration emit |
| Agent-native review | yes | Review rule repair | Clean; no P0-P2 findings |
| Local install corruption suspected | no | N/A | No install-corruption signature occurred |
| P2 autoreview | yes | Review refreshed task diff | Final path-bounded run clean at 0.92 confidence |
| PR create or update | no | N/A | User did not request PR/commit/push |
| Task-style PR body verified | no | N/A | No PR |
| PR proof image hosting | no | N/A | No PR and no rendered screenshot |
| Tracker sync-back | no | N/A | Direct local request |
| Final handoff contract | yes | Fill fields below | Complete |
| Final lint | yes | Run scoped equivalent | Biome clean on 60 task files; package lint fixes also ran |
| Output budget discipline | yes | Bound output | Searches excluded generated/template/build output; one broad scan was truncated then narrowed |
| Timed checkpoint | no | N/A | No duration requested |
| Goal plan complete | yes | Run mechanical checker | Final command after this plan update |
| Public API / package boundary proof | yes | Audit consumers and types | No old hook generic outside overload declarations |
| Release artifact classification | yes | Classify | Published Core/Media API plus registry adoption |
| Published package changeset | yes | Update release prose | Existing Core/Media changesets updated; no new minor bump |
| Registry changelog | yes | Generate and check | 2026-08-04 entry and generated JSON/index/components verified |
| No release artifact | no | N/A | Artifacts are required and present |
| Package typecheck/build/test | yes | Run owner checks | Evidence below |
| Barrel/export generation | no | N/A | No export/file-layout change |
| Browser interaction proof | yes | Exercise route | Blocked before render by unrelated generated import |
| Browser console/network check | yes | Inspect failure | Console/module 500 recorded; interaction could not begin |
| Browser final proof artifact | yes | Record exact blocker | No screenshot claimed; exact route and source error recorded |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | API owners, call sites, rules, and skills read | done |
| Implementation | complete | Core witnesses, hooks/props, package/registry/docs adoption | done |
| Verification | complete | Audits, types, tests, lint, release checks, browser attempt | done |
| PR / tracker sync | complete | N/A: no PR or tracker requested | done |
| Closeout | complete | P2 autoreview clean and final ledger filled | final response |

Findings:
- The first implementation reconstructed descriptor nodes from the installed
  schema tree, so dependency nodes leaked into owner-local inference.
- `PlatePlugin` lacked the exact local node witness already carried by
  `BasePlugin`.
- Passing `never` through `EditorSchemaSourceProvider` widened through
  `keyof never`; schema-less concrete descriptors need an explicit `never`
  node factory.
- Media placeholder lookup accessed missing plugin schema portals; the guarded
  installed check is required by the current runtime contract.
- Footnote definition props accidentally used the reference descriptor.

Decisions and tradeoffs:
- Canonical calls are `useElement(FooPlugin)`,
  `PlateElementProps<typeof FooPlugin>`, and
  `PliteElementProps<typeof BaseFooPlugin>`.
- Bare hooks and raw generic props remain only for genuinely erased,
  schema-agnostic code.
- Exact concrete descriptors expose only locally owned nodes. Dependencies do
  not widen them; concrete schema-less descriptors expose no node; erased
  descriptor types retain broad runtime shapes.
- Domain `*Element` aliases remain valid at AST, algorithm, and exported data
  boundaries. Only redundant generic-selector imports were removed.

Implementation notes:
- Shared exact local schema contribution and node provider live in
  `pluginSchemaModel.internal.ts` and are carried by Base and Plate descriptors.
- Hooks select the matching provider by runtime descriptor and infer the same
  descriptor's local element type.
- Interactive and static registry component families use descriptor props;
  media hooks require the relevant media descriptor.
- `best-api`, Plate Vision, Core/Media changesets, docs, and registry changelog
  describe the final law.

Review fixes:
- Accepted P1: guard optional media portals before reading `schema.type`.
- Accepted P2: bind `FootnoteDefinitionElement` to
  `FootnoteDefinitionPlugin`.
- Rejected P2: factory schema inputs are normalized to declaration-valued
  compiled descriptors. Added compile-only proof.
- Accepted P2 despite synthetic path filtering: concrete schema-less plugins
  must not inherit broad `Element`. Fixed the owner and added negative proof.
- Final P2 autoreview: clean, 0.92 confidence.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Combined DOM-heavy Bun test polluted globals across files | 1 | Run exact files and full package suites separately | Every focused file and full package suite passed |
| `pnpm turbo lint:fix` task missing | 1 | Use package scripts and scoped Biome | Scoped Biome clean |
| www ESLint parser reports broad untouched TS parse errors | 1 | Use source checks, www typecheck, and scoped Biome | Task files clean; repo ESLint config remains unrelated |
| Full-local autoreview credential scan hit unrelated shared secret-like content | 1 | Build path-bounded task snapshot | Snapshot credential scan clean |
| Default Codex CLI 0.139 rejected required Sol model | 1 | Use installed ChatGPT Codex CLI 0.146 with same model | Review ran successfully |
| Full-source review snapshot exceeded untracked-file size for editor-perf | 1 | Review the actual bounded task diff | Final one-pass review clean |
| Media typecheck fails in untouched contract spec lines 267/273 | 2 | Verify diff ownership and use build/tests | File has no task diff; Media build and 84 tests pass |
| Browser route returns 500 on missing generated plate-types import | 1 | Record console/source blocker | www typecheck passes; no false visual claim |

Verification evidence:
- Source audit: only Core overload declarations contain `useElement<` or
  `useOptionalElement<`; zero concrete plugin-owned `*Element` props generics
  remain in current first-party source/docs.
- Typechecks: Core, Callout, Math, Table, and www passed. Core declaration
  contracts cover owner/dependency, schema-less, and factory-schema inference.
- Media: build passed; typecheck is blocked only by unchanged
  `BaseMediaPluginContracts.spec.ts:267,273`. Full 84-test suite passed.
- Full tests: Core 700/700, Callout 3/3, Math 16/16, Table 235/235, Media 84/84.
- Focused tests: useElementStore 10/10, pluginRenderElement 4/4, media state
  3/3, callout/math 1/1, table hooks 9/9.
- `pnpm install` regenerated the best-api mirrors; agent-native review passed.
- Scoped Biome checked 60 files; tracked and untracked diff-checks passed.
- Registry changelog generator check passed 45/45 entries.
- Full www typecheck passed editor generation, API reference, MDX source,
  docs parity, registry source, app TS, and package integration TS.
- Browser: `/blocks/table-demo` reached a 500 before render because generated
  `apps/www/src/__registry__/index.tsx` imports missing
  `@/registry/components/editor/plate-types.ts`.
- Final P2 autoreview command used `--mode local --max-priority P2` with the
  installed 0.146 Codex binary over a path-bounded actual task diff; clean.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: direct local request
- Confidence line: 98%; types, packages, app, audits, and P2 review agree
- Flow table:
  - Reproduced: compile-only dependency-union/schema-less failure cases
  - Verified: exact descriptor inference and all first-party adoption checks
- Browser check: attempted `/blocks/table-demo`; unrelated generated import blocked render
- Outcome: plugin descriptors infer their exact local element across hooks and component props; redundant first-party `*Element` generic imports are gone
- Caveat: Media's untouched contract-spec type error and www's unrelated generated missing module remain
- Design:
  - Chosen boundary: descriptor-carried local schema node witnesses in Core
  - Why not quick patch: caller annotations would preserve duplicate identity and dependency unions
  - Why not broader change: domain element aliases still serve real AST boundaries and were not indiscriminately removed
- Verified: source audit, declarations, package/app types, full/focused tests, lint, release checks, and P2 review
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
- Browser proof: exact pre-render module blocker recorded; no screenshot claimed
- Caveats: unchanged Media contract-spec error; unrelated generated www import

Timeline:
- 2026-08-04T13:48:55.307Z Task goal plan created.
- 2026-08-04 Descriptor-local Core witness and first-party adoption completed.
- 2026-08-04 Package/app tests, docs/release checks, Browser attempt, and rule sync completed.
- 2026-08-04 P2 review fixes landed; final review clean.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Mechanical goal completion and final handoff |
| What is the goal? | Infer plugin-owned element types directly from descriptors across hooks and component props |
| What have I learned? | Local descriptor witnesses must exclude dependencies and schema fallbacks |
| What have I done? | Implemented, adopted, documented, released, and verified the hard cut |

Open risks:
- The unrelated Media contract-spec type error prevents a green package
  typecheck despite passing build/tests.
- The unrelated generated registry import prevents Browser rendering of the
  selected demo despite a green www typecheck.
