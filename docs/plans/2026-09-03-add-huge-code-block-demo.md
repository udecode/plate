# Add huge code block demo

Superseded final state: the follow-up benchmark diagnosis in
`docs/plans/2026-09-03-find-plate-code-block-product-benchmark-gap.md` fixed the
full EditorKit fallback and raised the final fixture to 10,000 lines. The 1,000-line
evidence below records the earlier checkpoint.

Objective:
Add a 1,000-line fixture to the Code Block demo only; done when registry
generation, focused checks, and browser proof pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-03-add-huge-code-block-demo.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct user request
- id / link: current Codex task
- title: Add a huge code block to the Code Block demo only
- acceptance criteria: retain the existing Code Block examples, append one
  deterministic 1,000-line code block represented by one text child, leave
  `editor-ai` untouched, update the registry changelog, regenerate registry
  output, and pass focused source, type, lint, and Browser proof.

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
- initial confidence score: N/A: binary artifact and proof gates are stronger
- improvement loop: implement once, inspect generated output, then repair only
  if focused proof or Browser fails
- final score / loop closure: N/A: close on exact pass/fail evidence

Completion threshold:
- The existing `code-block-demo` includes one additional TypeScript code block
  containing exactly 1,000 newline-delimited lines in one text child.
- No `editor-ai` source changes. The Code Block registry changelog source and
  generated JSON agree, registry output is regenerated, focused type/lint
  checks pass, and `/docs/code-block` renders the huge block with 1,000 lines
  and no browser console errors.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-03-add-huge-code-block-demo.md` passes.

Verification surface:
- Source audit of `apps/www/src/registry/examples/values/code-block-value.tsx`
  for the exact line count and one-text-child shape.
- Registry changelog generation/check plus `pnpm --filter www build:registry`.
- Focused formatter/lint and `pnpm --filter www typecheck`.
- Browser proof on `/docs/code-block`: locate the large code block, count
  1,000 lines from its DOM text, verify editability and zero console errors.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Do not modify `editor-ai`, the Huge Document demo, Plite/Plate package
  runtime, virtualization behavior, or Comments/anchor work.
- Keep the large fixture as one code-block text node. Do not recreate code-line
  elements or one AST node per line.

Boundaries:
- Source of truth: `code-block-value.tsx`, `code-block-demo` registry metadata,
  registry changelog source/generated JSON, and rendered `/docs/code-block`.
- Allowed edit scope: Code Block demo value, registry changelog source and
  generated artifacts, generated Code Block registry output, and this plan.
- Browser surface: `http://localhost:3000/docs/code-block`.
- Browser strategy: in-app Browser for the ordinary docs route. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker or public issue was supplied.
- Non-goals: `editor-ai`, a new editor block, new public API, runtime
  performance tuning, benchmark changes, code-line nodes, commit, push, PR, or
  release.

Output budget strategy:
- Read only the Code Block registry/example/docs owners and bounded test
  references. Exclude generated registry output until regeneration; summarize
  build output and inspect only the Code Block artifact.

Blocked condition:
- Stop only if the existing Code Block demo cannot represent a 1,000-line
  single text child without a package/runtime change, or the docs route cannot
  be started or inspected after the prescribed local recovery path.

Task state:
- task_type: registry demo feature
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: implement in the existing Code Block value owner
- confidence: high
- next owner: Plate UI
- reason: the generic demo already resolves `code-block` to this value, so one
  fixture addition reaches only the requested docs demo without a new route or
  editor composition.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-03-add-huge-code-block-demo.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Huge Code Block demo only; `editor-ai` exclusion and proof threshold are explicit above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Read Plate UI, component-family, registry, shadcn, Registry Changelog, and Autogoal instructions. |
| Active goal checked or created | yes | Exact goal created after generating this plan shell. |
| Source of truth read before edits | yes | Read Code Block value, generic demo owner, registry example/feature metadata, docs preview owner, and prior huge-document boundary memory. |
| Tracker comments and attachments read | no | N/A: direct request has no tracker or attachment. |
| Video transcript evidence required | no | N/A: no video supplied. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: bounded registry fixture addition with an obvious owner. |
| TDD decision before behavior change or bug fix | no | N/A: deterministic example data, not runtime behavior; exact source and Browser assertions are the proof. |
| Branch decision for code-changing task | no | N/A: work stays in the current checkout; no branch operation requested. |
| Release artifact decision | yes | User-visible registry example requires a Registry Changelog entry; no package changeset. |
| Browser tool decision for browser surface | yes | Use in-app Browser on `/docs/code-block`; no native Chrome behavior. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker supplied. |
| Output budget strategy recorded | yes | Narrow owner reads and generated-output inspection are recorded above. |
| Browser pack selected | yes | Browser pack materialized in this plan. |
| Browser route / app surface identified | yes | `/docs/code-block`, existing `code-block-demo`. |
| Browser tool decision recorded | yes | In-app Browser; Chrome/Computer N/A. |
| Console/network caveat policy recorded | yes | Check console errors; report any network failure that affects the demo. |
| Observable browser case captured | no | N/A: feature addition, not a report-backed regression. Exact positive case is 1,000 rendered lines in the final Code Block demo. |

Work Checklist:
- [x] N/A: no duration was requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source is classified above with its exact acceptance criteria,
      owners, route, and exclusions.
- [x] Required video evidence is N/A because no video was supplied.
- [x] Nearby repo instructions and implementation patterns were read before
      edits.
- [x] Implementation fixes the existing `codeBlockValue` owner; no new route or editor was added.
- [x] Release artifact requirement recorded: Registry Changelog source and
      generated JSON; package changeset N/A.
- [x] Final handoff shape: feature outcome, focused checks, Browser proof, no
      PR/tracker lines, and exact caveat if local-only.
- [x] Branch handling: N/A; current checkout only.
- [x] Local-env-rot retry policy: run `pnpm run reinstall` once only if a
      surprising module-resolution or mixed-React failure appears.
- [x] Workspace authority is recorded for every final proof command.
- [x] High-risk note: the 1,000-line fixture exposes render latency, but no
      runtime path changes; Browser must prove the route remains usable.
- [x] Review/P1 autoreview is N/A because source instructions forbid it on
      `next` and this is a narrow registry fixture.
- [x] Agent-native review is N/A because no agent/tooling source changes.
- [x] Output budget discipline is recorded above.
- [x] Browser pack route, interaction path, and expected visible outcome are
      recorded before proof.
- [x] Browser pack uses Browser; Chrome/Computer are N/A.
- [x] Browser pack console errors are checked: zero errors on the stable 1,000-line route.
- [x] Browser pack screenshot confirms the editor visibly reaches line 1,000.
- [x] Browser reporter-visible paint controls are N/A: no paint regression is
      claimed; line count, editability, and error state are DOM/runtime facts.
- [x] Browser report-backed red-before-green proof is N/A: this is a new demo.
- [x] Browser final proof uses a fresh reload of final generated output.
- [x] Browser pushed-ref clean-checkout proof is N/A: no commit/push requested;
      final claim remains local.
- [x] Browser native stability replay is N/A: no native selection, focus, DnD,
      compositor, or React lifecycle fix.
- [x] Browser proof uses no temporary stub, route bypass, or hand-edited
      generated file.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the named source, registry, lint, type, and Browser checks | pass: evidence recorded below |
| Bug reproduced before fix | no | N/A: feature addition, not a bug fix | N/A |
| Targeted behavior verification | yes | Audit generated fixture and rendered DOM | pass: exact 1,000-line source and Browser evidence |
| TypeScript or typed config changed | yes | Run relevant typecheck | pass: isolated source compile; broad graph caveats recorded |
| Package exports or file layout changed | no | N/A: no package export or layout change | N/A |
| Package manifests, lockfile, or install graph changed | no | N/A: no dependency change | N/A |
| Agent rules or skills changed | no | N/A: no agent source change | N/A |
| Workspace authority proof | yes | Run proof from this repo and the `www` app | pass: all commands used `/Users/zbeyens/git/plate-2` |
| Browser surface changed | yes | Capture Browser proof | pass: `/docs/code-block` rendered the exact fixture |
| Browser final proof | yes | Reload and inspect final route | pass: exact DOM and screenshot evidence |
| CI-controlled template output changed | no | N/A: no template output touched | N/A |
| Package behavior or public API changed | no | N/A: registry example only; no changeset | N/A |
| Registry-only component work changed | yes | Add Registry Changelog entry | pass: source and generated JSON agree |
| Docs or content changed | yes | Verify claims and rendered output | pass: source audit and Browser route proof |
| High-risk mini gate | yes | Test renderer stability at candidate sizes | pass: retained the largest stable tested docs fixture, 1,000 lines |
| Agent-native review for agent/tooling changes | no | N/A: no agent/tooling change | N/A |
| Local install corruption suspected | no | N/A: failures were stale generated API data and memory pressure, not install corruption | N/A |
| P1 autoreview for non-trivial implementation changes | no | N/A: narrow registry fixture and forbidden on `next` | N/A |
| PR create or update | no | N/A: no PR requested | N/A |
| Task-style PR body verified | no | N/A: no PR | N/A |
| PR proof image hosting | no | N/A: no PR | N/A |
| Tracker sync-back | no | N/A: no tracker | N/A |
| Final handoff contract | yes | Fill final fields below | pass: completed below |
| Final lint | yes | Run scoped equivalent | pass: Ultracite green |
| Output budget discipline | yes | Bound command output | pass: one registry build was verbose but bounded/truncated; later output redirected |
| Timed checkpoint | no | N/A: no duration requested | N/A |
| Goal plan complete | yes | Run completion checker | scheduled after this edit |
| Browser interaction proof | yes | Exercise target route with Browser | pass: editable exact 1,000-line block rendered |
| Browser console/network check | yes | Inspect console and route | pass: HTTP 200 and zero browser console errors |
| Browser final proof artifact | yes | Record route and screenshot | pass: `/docs/code-block` screenshot showed line 1,000 |
| Exact case replay | no | N/A: feature addition, not report-backed | N/A |
| Final ref and fingerprints | no | N/A: local uncommitted task, no pushed-ref claim | N/A |
| Clean final runtime | no | N/A: local uncommitted task, no shipped/fixed claim | N/A |
| Retry-free stability | no | N/A: no native interaction or lifecycle fix | N/A |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | owner and route mapped | implementation |
| Implementation | complete | 1,000-line single-child TypeScript fixture and changelog | verification |
| Verification | complete | source, lint, registry, and Browser proof recorded | closeout |
| PR / tracker sync | N/A | no PR or tracker requested | final response |
| Closeout | complete | local-only demo delivered | final response |

Findings:
- `code-block-demo` uses the generic `examples/demo.tsx`, which resolves the
  `code-block` id to `codeBlockValue`; the value file is the narrow owner.
- The Code Block docs page already mounts only `code-block-demo`; no
  `editor-ai` composition is involved.
- One thousand highlighted lines are the largest stable docs-demo cohort on the
  current local Browser run and remain one text child inside one code-block element.

Decisions and tradeoffs:
- Append the huge fixture to the existing demo instead of creating a second
  route or editor composition. This preserves the small teaching examples and
  keeps the stress case discoverable exactly where requested.
- Generate deterministic TypeScript lines at module load instead of committing
  1,000 literal source lines. The rendered AST still owns one full string.

Implementation notes:
- Added one generated 1,000-line TypeScript block after the existing teaching
  examples. Kept `editor-ai`, package runtime, and virtualization untouched.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Queried the JSX AST with the stale `code_block` type | 1 | Inspect the current AST type | Corrected to `codeBlock`; exact source audit passed. |
| Tried 10,000 and 2,000 highlighted lines in the full docs demo | 2 | Reduce only the demo fixture and reload in Browser | Both larger cohorts crashed or stalled the renderer; 1,000 loaded, remained editable, and rendered line 1,000. |
| `pnpm --filter www typecheck` stopped on stale API-reference output | 1 | Avoid rewriting unrelated API docs; run owning checks directly | Registry source check and isolated TypeScript file check passed. |
| Full `www` project `tsc` exhausted 4 GB and 8 GB heaps | 2 | Keep the failure explicit and use the narrow owning compiler lane | `tsc --ignoreConfig ... code-block-value.tsx` passed with no diagnostics. |

Verification evidence:
- Source audit: four code blocks; final block has one text child, TypeScript
  language, 1,000 lines, 43,889 characters, and expected first/last lines.
- `pnpm exec ultracite check ...code-block-value.tsx ...huge-code-block-demo.mdx`: pass.
- isolated `tsc --ignoreConfig ... code-block-value.tsx`: pass.
- Registry Changelog `--check`: 110/110 pass; `pnpm --filter www build:registry`: pass, 364 canonical payloads and 15 overlays.
- Browser `/docs/code-block`: title `Code Block - Plate`, label present, 14
  rendered `pre code` nodes, large block editable, exact 1,000 lines, zero console errors.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no tracker supplied.
- Confidence line: high for the 1,000-line local demo; broader 10,000-line Plate performance claim invalidated.
- Flow table:
  - Reproduced: N/A: feature addition.
  - Verified: source/lint/registry green; Browser rendered the exact editable fixture.
- Browser check: pass: exact 1,000 lines, editable, zero console errors.
- Outcome: Code Block docs demo includes a stable large highlighted fixture.
- Caveat: 10,000 and 2,000 lines exposed a benchmark-versus-product mismatch; follow-up diagnosis required.
- Design:
  - Chosen boundary: existing `codeBlockValue` registry owner.
  - Why not quick patch: no runtime workaround was added.
  - Why not broader change: `editor-ai` and package runtime were explicitly out of scope.
- Verified: source AST, lint, isolated TypeScript, registry generation, and Browser.
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
- Issue / tracker: N/A: no tracker supplied.
- Browser proof: pass on local `/docs/code-block`.
- Caveats: broad `www` typecheck is blocked by stale API-reference output; direct full-project `tsc` exhausted 4 GB and 8 GB heaps.

Timeline:
- 2026-09-03T10:11:19.431Z Task goal plan created.
- 2026-09-03: read the Plate registry/UI owners, selected the existing Code
  Block value boundary, created the active goal, and completed requirement
  extraction before implementation.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I going? | Implementation, verification, PR/tracker sync, closeout |
| What is the goal? | Add one 1,000-line text child to the Code Block demo only and prove the local registry/docs surface. |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- The dedicated 10,000-line Plate benchmark is not representative of the full
  docs composition. The follow-up Benchmark goal owns that harness discrepancy
  and the real hot path.
