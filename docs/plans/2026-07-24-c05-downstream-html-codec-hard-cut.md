# C05 downstream HTML codec hard cut

Objective:
Hard-cut downstream legacy HTML API consumers; done when allowed current sources have zero legacy matches and focused code/docs checks pass; plan docs/plans/2026-07-24-c05-downstream-html-codec-hard-cut.md.

Goal plan:
docs/plans/2026-07-24-c05-downstream-html-codec-hard-cut.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)

Task source:
- type: plain task delegated by the root C05 implementation thread
- id / link: N/A
- title: C05 downstream HTML codec hard cut
- acceptance criteria:
  - Migrate remaining non-Core current-source consumers, fixtures, examples, and
    current docs from `parsers.html.deserializer`,
    `targetHtmlPluginToInject`, injected HTML node rules, and old HTML helpers.
  - Use final `.extendHtmlCodec()` for node/mark/property claims and flat
    `parsers.html` for whole-input hooks.
  - Include `packages/docx-io/src/lib/__tests__/testDocxImporter.tsx`,
    `apps/www/src/app/(app)/examples/plite/_examples/plate-schema-descriptors.tsx`,
    current HTML/plugin API docs and guides, plus current non-Core integration
    fixtures only when they prove shipped behavior.
  - Preserve behavior and configured types.
  - Do not edit Core, `list-classic`, rich codec files, registry, generated
    output, templates, changesets, or historical `content/docs/migration/**`.
  - Do not expand classic work.
  - Run exact typechecks, tests, docs-source checks, and residual scans.
  - Handoff exact file inventory and classified residuals.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A: no duration requested
- initial confidence score: N/A: binary zero-residual and pass gates apply
- improvement loop: scan, migrate current owners, verify, classify exclusions
- final score / loop closure: N/A: close on named pass gates

Completion threshold:
- Zero allowed current-source matches for the four named legacy HTML API
  categories, with only excluded Core/classic/rich/historical/generated
  residuals classified.
- All edited package/example/docs owners pass their focused typechecks, tests,
  lint, `www build:source`, and `www check:docs` as applicable.
- Exact changed-file inventory and residual report delivered to root.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-c05-downstream-html-codec-hard-cut.md` passes.

Verification surface:
- Scoped `rg` scans that exclude Core, `list-classic`, rich codecs, generated
  output, templates, registry, and `content/docs/migration/**`.
- Owning package tests/typechecks for touched fixtures plus `www` typecheck.
- `pnpm --filter www build:source` and `pnpm --filter www check:docs`.
- Scoped lint and final autoreview of this packet.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Preserve configured plugin types and existing fixture behavior.
- Do not add compatibility aliases, deprecated shims, or classic variants.

Boundaries:
- Source of truth: current non-Core source plus the final HTML codec and flat
  parser APIs already present in the checkout.
- Allowed edit scope: named downstream fixture/example, current non-migration
  docs/guides, and current non-Core integration fixtures that prove shipped
  behavior.
- Browser surface: N/A: source/API examples and reference prose only; no route,
  visual component, or interaction changes.
- Browser strategy: N/A. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker source.
- Non-goals: Core, `list-classic`, rich codecs, registry, generated output,
  templates, changesets, historical migrations, classic expansion, git/PR work.

Output budget strategy:
- Start with `rg --files-with-matches` and counts over current source. Exclude
  named forbidden trees and cap printed matches. Read exact target files and
  nearest docs only; never stream generated output or whole-repo dumps.

Blocked condition:
- Stop only if the final codec API is unavailable in the current checkout or a
  required current consumer cannot migrate without editing an explicitly
  forbidden owner.

Task state:
- task_type: current-source hard-cut refactor with supporting docs
- task_complexity: non-trivial, bounded batch
- current_phase: closeout
- current_phase_status: complete
- next_phase: final handoff
- goal_status: complete

Current verdict:
- verdict: valid
- confidence: high; downstream proof and clean autoreview complete
- next owner: task
- reason: downstream current sources must match the accepted final API.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-c05-downstream-html-codec-hard-cut.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Full delegated scope, exclusions, proof, and handoff copied above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | `autogoal`, `hard-cut`, `task`, and `docs-creator` loaded |
| Active goal checked or created | yes | No goal existed; goal created for this plan |
| Source of truth read before edits | yes | Delegated task text is the source; exact current files are next |
| Tracker comments and attachments read | no | N/A: no tracker |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | yes | Nearby C05 accepted API and current source own the decision; targeted solution scan next |
| TDD decision before behavior change or bug fix | no | N/A: behavior-preserving consumer migration; focused existing proof plus fixture updates |
| Branch decision for code-changing task | no | N/A: shared delegated checkout; no git actions authorized |
| Release artifact decision | no | N/A: caller explicitly forbids changesets and generated release output |
| Browser tool decision for browser surface | no | N/A: source/API docs only; no visual behavior |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Scoped filenames/counts first; forbidden/generated trees excluded |
| Docs pack selected | yes | Supporting `docs` pack applied to task template |
| `docs-creator` loaded | yes | Full skill read before docs edits |
| Docs lane selected | yes | Serialization/conversion and guide/API-reference updates |
| Target docs and nearest sibling docs read | yes | Exact targets will be identified by scoped legacy scan before editing |
| Docs style doctrine read | yes | Full `docs-creator` skill read |
| Documented source owner identified | yes | `.extendHtmlCodec()` owns claims; flat `parsers.html` owns whole-input hooks |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration.
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
      N/A: no video evidence.
- [x] Nearby repo instructions and implementation patterns read before edits:
      repo AGENTS, accepted final API, and selected skills.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason. Node/property claims use `.extendHtmlCodec()`;
      whole-input calls use `editor.api.html.deserialize`; the app list kit
      keeps paragraph first as the structural target.
- [x] Release artifact requirement recorded: N/A, caller forbids changesets,
      registry, generated output, and templates.
      N/A with reason.
- [x] Final handoff shape decided: exact changed-file inventory, claim mapping,
      command results, and classified residuals to root.
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: N/A, shared delegated
      checkout and no git actions authorized.
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      package-integration `pnpm` typecheck hit a host ICU code-signature error;
      `bun x tsc` reran the same project and isolated unrelated aggregate errors.
      No shared-workspace reinstall was safe while sibling agents were active.
- [x] Workspace authority recorded: package commands run from
      `/Users/zbeyens/git/plate-2`; docs checks run through the `www` package;
      Bun tests name exact owning source files.
- [x] High-risk note recorded: nullable HTML decode can reject invalid
      fragments. The DOCX importer handles rejection explicitly with a warning
      instead of silently returning a successful empty import.
- [x] Review/autoreview target selected from actual diff state: local dirty
      packet, exact path list in the review prompt.
- [x] Agent-native review decision recorded: N/A, no agent/tooling files changed.
- [x] Output budget discipline recorded and followed after one accidental broad
      raw-research read; all subsequent scans excluded raw/generated trees and
      printed bounded inventories.
- [x] Docs pack: serialization/conversion and guide/API lanes selected; exact
      targets come from the scoped legacy scan; final codec APIs are source owner.
- [x] Docs pack: every named API, import, option, component, and transform is
      source-backed. N/A: no route, preview, or link target changed.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are
      marked N/A with reason. N/A: no link, route, or preview changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pass | Run named proof and zero scan | 55 downstream tests, three package typechecks, docs/browser/lint/zero scan green |
| Bug reproduced before fix | pass | Record failing test/repro | DOCX table nesting, static unmatched blocks, nullable import, list primary target, and CSS injection were reproduced and closed |
| Targeted behavior verification | pass | Run focused proof | Four isolated test groups pass |
| TypeScript or typed config changed | pass | Run relevant typecheck | Turbo typecheck succeeds for docx-io, basic-styles, and indent |
| Package exports or file layout changed | N/A | Run `pnpm brl` when applicable | No exported package file moved; deleted files are non-exported app tests |
| Package manifests, lockfile, or install graph changed | N/A | Run install when applicable | No manifest or lockfile edit |
| Agent rules or skills changed | N/A | Run skill sync when applicable | No agent rule or skill edit |
| Workspace authority proof | pass | Run checks in owning workspace | All commands ran in `/Users/zbeyens/git/plate-2`; docs through `www` |
| Browser surface changed | pass | Capture browser proof | Eight EN/CN docs routes render the expected titles/current API text |
| Browser final proof | pass | Record exact caveat | Routes pass; Chrome extensions add unrelated hydration warnings |
| CI-controlled template output changed | N/A | Restore generated output | No template/generated output edited |
| Package behavior or public API changed | N/A | Add changeset when authorized | Caller explicitly excluded changesets; root release owner consolidates separately |
| Registry-only component work changed | N/A | Update component changelog when applicable | Exact list-kit configuration/test edit, not registry component delivery |
| Docs or content changed | pass | Verify source and render | Source parity plus eight rendered routes pass |
| High-risk mini gate | pass | Record failure mode and proof | Decoder rejection and CSS declaration injection closed with regressions at owning boundaries |
| Agent-native review for agent/tooling changes | N/A | Run agent-native review when applicable | No agent/tooling edit |
| Local install corruption suspected | N/A | Reinstall once when applicable | ICU failure was host policy; Bun rerun isolated unrelated errors |
| Autoreview for non-trivial implementation changes | pass | Loop until clean | Two accepted P2s fixed; final scoped local autoreview is clean |
| PR create or update | N/A | Run PR workflow when authorized | No git/PR work authorized |
| Task-style PR body verified | N/A | Verify PR body when applicable | No PR |
| PR proof image hosting | N/A | Host image when applicable | No PR image |
| Tracker sync-back | N/A | Sync tracker when applicable | No tracker |
| Final handoff contract | pass | Fill exact handoff | Completed below |
| Final lint | pass | Run scoped lint | Four package lints plus five exact app files clean |
| Output budget discipline | pass | Record accidental output and recovery | One broad raw-research read recorded; all later scans bounded |
| Timed checkpoint | N/A | Honor duration when requested | No duration requested |
| Goal plan complete | yes | Run `check-complete.mjs` | Run after this update |
| Docs source-backed claim audit | pass | Verify docs against source | Codec overloads, root API, and parser shape checked against current source |
| Docs links / routes / previews | pass | Verify affected routes | `/docs` and `/cn/docs` HTML/plugin/editor-methods/plate-plugin routes render |
| Docs MDX/content parser | pass | Run docs source build | `pnpm --filter www check:docs` passes |
| Plugin page specifics | pass | Apply docs-creator rules | Current-state kit/manual/API structure preserved |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | pass | requirements, skills, final API owners read | implementation |
| Implementation | pass | downstream code/docs migrated; obsolete fixtures deleted | verification |
| Verification | pass | 55 tests, typechecks, docs, browser, lint, zero scan | closeout |
| PR / tracker sync | N/A | no PR or tracker authorized | final response |
| Closeout | pass | clean final autoreview; receipt complete | final response |

Findings:
- Accepted API boundary: `.extendHtmlCodec()` owns node, mark, and property
  claims; flat `parsers.html` owns whole-input hooks.
- Historical migration docs may retain historical names and are excluded.
- Scoped allowed-source scan is zero for all named legacy API families.
- `BaseListKit` configured headings before paragraph even though
  `createsElement` deliberately uses `targetPluginNames[0]`. That made app list
  HTML decode produce h1 nodes. `KEYS.p` is now first while all targets remain.
- The broad static UI exact-state fixture made claims that presentation HTML
  cannot carry: TOC projection identity, mention keys, ISO date identity, and
  app list internal state. It is narrowed to visible/standard codec fields.
- Core unmatched root block materialization and property attachment are genuine
  compiler gaps, not missing style codecs. The sibling Core owner added focused
  coverage; final app proof waits for coherent package artifacts.
- Static void spacer FEFF output is decoder hygiene, not a plugin-codec
  migration gap; the Core owner filters `data-plite-spacer`.

Decisions and tradeoffs:
- One-shot execution; no pause for plan approval.
- Delete downstream legacy declarations rather than preserve aliases.
- Keep plugin portals documented with the real decoupled-package example
  `editor.plugin(BoldPlugin).update.toggle()`.
- Preserve `renderStaticHtml` as presentation output. Only assert the subset
  that standalone HTML actually represents.

Implementation notes:
- Migrated style and indent HTML properties to `.extendHtmlCodec()`, preserving
  configured property keys/types and adding decode/encode proof.
- Migrated DOCX fixtures/import paths and package integration callers to
  `editor.api.html.deserialize`.
- Migrated the Plite schema descriptor example to self-owned codec declarations.
- Deleted four package-integration fixtures whose only subject was removed Core
  helper internals; retained current public clipboard/static integration proof.
- Rewrote HTML/plugin API docs around self/foreign codecs, configured types,
  flat whole-input hooks, and the root deserialize API.
- Reordered `BaseListKit` primary target and added a configured-kit decode
  regression in its existing owning spec.

Review fixes:
- Accepted autoreview P2: `importDocx` no longer coalesces decoder rejection to
  `[]`; it returns an explicit `Failed to decode HTML` warning. Added regression.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| DOCX test filters without `./` matched no files | 1 | Use exact repository-relative `./` paths | Five exact files pass |
| Broad raw research residual command emitted excessive output | 1 | Exclude `docs/research/raw`, generated, and historical trees; use filenames/counts first | Bounded rerun produced a classified zero-residual inventory |
| Initial aggregate typechecks saw concurrent Core/readonly failures | 1 | Fix the packet-local nullable result, rerun owning package checks, classify other paths | Three owning package typechecks pass |
| DOCX fixtures split adjacent equivalent leaves | 1 | Send exact failure to Core owner; rerun after recursive coalescing fix | Five DOCX fixtures pass |
| Exact app ESLint process exited 137 during parallel checks | 1 | Run canonical exact-file Biome after package lint | Exact app files clean |
| `pnpm` package-integration tsc crashed on host ICU code-signature policy | 1 | Rerun same tsconfig with `bun x tsc` | Packet files have no error; aggregate has unrelated readonly/registry errors |
| Broad static registry-value roundtrip exposed unrecoverable UI identity claims | 1 | Classify representation and replace with a small representable projection | Narrow Core-backed projection passes |
| Static app test briefly missed `@platejs/core/static` during concurrent artifact work | 1 | Retry after artifact became available | Retry reached the expected codec assertion |
| Combined DOCX app/import test batch inherited the importer test's Mammoth module mock | 1 | Run mock owner and real Mammoth integration in separate Bun processes | Isolated groups pass 2/2 and 5/5 |
| Core unmatched nested block fitting regressed DOCX tables | 1 | Fit against a detached parent and preserve compatible transparent wrapper children | Exact DOCX table and full downstream fixture group pass |
| Autoreview found raw CSS declaration injection through codec style values | 1 | Validate CSS names/values centrally in the compiled codec | Hostile/safe Core regressions and downstream rerun pass |

Verification evidence:
- `pnpm --filter @platejs/docx-io typecheck` — pass.
- `pnpm --filter @platejs/basic-styles typecheck` — pass.
- `pnpm --filter @platejs/indent typecheck` — pass.
- Five exact DOCX import fixtures — 5 pass, 0 fail.
- DOCX importer unit proof — 2 pass, 0 fail.
- Basic styles + indent focused proof — 39 pass, 0 fail.
- Configured app list kit proof — 3 pass, 0 fail.
- DOCX app roundtrip — 5 pass, 0 fail.
- `pnpm --filter www check:docs` — docs source parity pass.
- Scoped package lint and exact-file Biome — pass.
- Independent bounded residual audit — zero allowed current-source hits.
- Final representable static projection — 1 pass, 0 fail.
- Browser — 8 EN/CN routes render expected titles and current C05 terms; no
  legacy target or ingress term appears. Chrome extensions caused unrelated
  hydration warnings.
- Autoreview — final scoped local pass clean, no accepted/actionable findings.

Final handoff contract:
- PR line: N/A, no git/PR action authorized.
- Issue / tracker line: N/A, no tracker.
- Confidence line: high, 95%.
- Flow table:
  - Reproduced: legacy residuals, nullable decode, list primary drift, static
    unmatched blocks, DOCX nesting, and CSS injection.
  - Verified: 55 downstream tests, three package typechecks, docs, lint, browser,
    zero scan, and clean autoreview.
- Browser check: eight EN/CN docs routes pass targeted DOM checks. Extension
  hydration warnings are unrelated to repo code.
- Outcome: allowed current downstream source/docs have zero legacy C05 names
  and use final codec/root API shapes.
- Caveat: none inside C05; aggregate checkout proof belongs to C32.
- Design:
  - Chosen boundary: self/foreign `.extendHtmlCodec()` declarations for
    node/property ownership; flat parser hooks for whole-input work; root
    deserialize for consumers.
  - Why not quick patch: compatibility fallbacks would retain the removed API
    and hide decoder failures.
  - Why not broader change: Core, classic, generated output, templates, and
    unrelated registry remain owned elsewhere except the exact root-approved
    list-kit target correction.
- Verified: exact command evidence above.
- PR body verified: N/A, no PR.

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
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: eight targeted EN/CN docs route checks pass.
- Caveats: Chrome extensions add hydration warnings unrelated to repo code.

Timeline:
- 2026-07-24T18:54:51.295Z Task goal plan created.
- 2026-07-24 Requirements, exclusions, proof surface, skills, and owner boundary locked before exploration.
- 2026-07-24 Downstream code/docs migrated; obsolete Core-helper fixtures deleted.
- 2026-07-24 Core regressions and security review findings coordinated to owner
  and closed; isolated downstream batch passes.
- 2026-07-24 Docs source/browser proof, zero scan, lint, and clean autoreview complete.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Complete and frozen |
| Where am I going? | N/A; incorporated into parent C05 and handed to C32 |
| What is the goal? | Zero allowed current-source legacy HTML API matches with focused code/docs proof |
| What have I learned? | Final codec/root API ownership is coherent; static presentation exactness must stay representation-bounded |
| What have I done? | Migrated, deleted stale fixtures, closed review findings, and completed bounded proof |

Open risks:
- None inside the downstream packet. Aggregate checkout remains concurrently modified.
