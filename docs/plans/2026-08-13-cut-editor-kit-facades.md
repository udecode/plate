# cut editor kit facades

Objective:
Remove both handwritten editor-kit facades and all consumers; done when generated imports, registry/docs/browser checks, and zero-reference audit pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-13-cut-editor-kit-facades.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct user request
- id / link: N/A: no external tracker
- title: Cut the redundant editor-kit facades
- acceptance criteria: delete both registry `editor-kit.tsx` wrappers; migrate all live consumers to `editor.generated`; remove wrapper registry metadata/tests/docs; preserve the `editor-kit` registry item name and the three-file generated-editor contract; add the registry changelog; prove zero live wrapper references, type safety, generated contract freshness, and the editor-ai browser route.

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
- initial confidence score: N/A: binary hard-cut threshold
- improvement loop: continue until every live wrapper reference is removed and all proof gates pass
- final score / loop closure: N/A: close on the binary threshold

Completion threshold:
- Both `apps/www/src/registry/**/editor-kit.tsx` wrapper files are deleted.
- Zero live source/docs/registry-manifest imports or paths target those wrappers; historical changelog entries and CI-generated `__registry__` output are excluded from the deletion audit.
- Consumers import `EditorKit`/`Editor` directly from `editor.generated` and call typed hooks with `EditorKit` where needed.
- Registry manifests, focused registry tests, generated-editor check, lint, and registry changelog generation/check pass. The www typecheck and standalone Browser route must pass or name an unrelated current-tree/CI-output blocker without weakening the source cut.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-13-cut-editor-kit-facades.md` passes.

Verification surface:
- Source audit: bounded `rg` over `apps/www/src` and `content` excluding historical changelog and CI-generated registry output.
- `pnpm --dir apps/www editor:check`.
- Focused registry tests plus www typecheck.
- Registry changelog generator `--write` and `--check`.
- `pnpm lint:fix`.
- Browser standalone `/blocks/editor-ai-demo`: renders with no new console/network failure.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Preserve `editor-definition.tsx`, `editor.generated.ts`, `editor.schema.json`, generated contract behavior, the `editor-kit` registry item id, and static/RSC compatibility.
- Do not edit CI-controlled templates or `apps/www/src/__registry__` generated output.

Boundaries:
- Source of truth: generated-editor plans, CLI generator, registry manifests/consumers, and current public editor docs.
- Allowed edit scope: wrapper files and their live consumers/tests/manifests/docs, one registry changelog source plus generated JSON, and this plan.
- Browser surface: standalone editor-ai registry block.
- Browser strategy: use Browser on `/blocks/editor-ai-demo`. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker or PR requested.
- Non-goals: renaming editor-definition/generated/schema files; changing CLI/runtime/schema behavior; changing plugin composition; editing templates; commits/pushes/PRs.

Output budget strategy:
- Use path-scoped `rg`, counts/file lists before matching lines, short `sed` ranges, and capped command output. Exclude generated `__registry__`, historical changelog, templates, build output, and dependencies unless they are the named proof owner.

Blocked condition:
- Stop only if current source proves a wrapper owns distinct runtime behavior that cannot move to an existing owner, or required Browser tooling/server cannot run after focused recovery.

Task state:
- task_type: registry hard cut
- task_complexity: normal
- current_phase: intake
- current_phase_status: in_progress
- next_phase: implementation
- goal_status: active

Current verdict:
- verdict: delete both facades and route consumers directly to generated contracts
- confidence: high
- next owner: task
- reason: the facades only re-export generated owners, invent `MyEditor`, wrap a typed hook, and impose an unnecessary client boundary

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-13-cut-editor-kit-facades.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User requires a hard cut of redundant `editor-kit.tsx`; scope and preserved three-file contract recorded above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Loaded `autogoal`, `hard-cut`, `registry-changelog`, and `docs-creator`; `best-api` target was accepted in the preceding review. |
| Active goal checked or created | yes | Goal created for this exact hard cut and plan path. |
| Source of truth read before edits | yes | Read both facades, generated modules, definitions, CLI output owner, registry manifests/tests, live consumers, docs, and accepted plans. |
| Tracker comments and attachments read | no | N/A: direct request without tracker or attachment. |
| Video transcript evidence required | no | N/A: no video evidence. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Read the Turbopack client-boundary solution and retained client boundaries at real hook/component owners. |
| TDD decision before behavior change or bug fix | no | N/A: behavior-neutral deletion; focused current-contract tests and browser proof cover adoption. |
| Branch decision for code-changing task | no | N/A: no branch/commit/PR requested; use current shared checkout. |
| Release artifact decision | yes | Registry-only user-visible install-shape change: registry changelog required; package changeset N/A. |
| Browser tool decision for browser surface | yes | Use Browser on the standalone editor-ai block and registry response. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Path-scoped/count-first searches and capped reads; generated/history exclusions recorded above. |
| Docs pack selected | yes | Incidental docs pack composed with task template. |
| `docs-creator` loaded | yes | Read skill and source doctrine before docs edits. |
| Docs lane selected | yes | Existing API reference and plugin usage snippets only; no page topology change. |
| Target docs and nearest sibling docs read | yes | Read utils, Single Block EN/CN snippets and generated editor guide. |
| Docs style doctrine read | yes | Read `.agents/rules/docs-creator.mdc`. |
| Documented source owner identified | yes | `editor.generated.ts` is the public runtime/type owner; definition and JSON retain build/tool ownership. |
| Browser pack selected | yes | Browser pack materialized in this plan. |
| Browser route / app surface identified | yes | `/blocks/editor-ai-demo` plus registry editor-kit response. |
| Browser tool decision recorded | yes | Browser first; no native Chrome surface applies. |
| Console/network caveat policy recorded | yes | New console/network errors block proof; known unrelated warnings must be named. |

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
      `<video-transcripts>` XML, or marked N/A with reason. N/A: no video.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason: consumers use the generated owner directly.
- [x] Release artifact requirement recorded: registry changelog; package changeset N/A.
- [x] Final handoff shape decided: implementation handoff with focused proof, explicit shared-tree typecheck failures, Browser CI-output blocker, no PR/tracker mutation.
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded: N/A; failures are deterministic live source/schema errors and stale CI-generated registry output, not install-corruption signals.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason: risk is client/server graph poisoning; source/build/browser proof owns it.
- [x] Review/P2 autoreview target selected: dirty local bundle with the accepted editor-kit invariant and unrelated WIP explicitly excluded.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
      N/A: no agent/tooling files changed.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every changed import is source-backed by the generated module export.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews are unchanged; N/A to this import-only edit.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser was used for the normal app surface; Chrome/Computer do not apply.
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console errors checked; route compilation is blocked by CI-generated `apps/www/src/__registry__/index.tsx` references to deleted `editor-kit.tsx` and independently missing `plate-types.ts`.
- [x] Browser pack: visual proof waived because repo policy forbids locally rebuilding `__registry__`; Browser captured the exact compilation blocker.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Two files absent; zero live wrapper references; focused registry 4/4, source check, editor 3/3, changelog 58/58, MDX, lint, and P2 review pass. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: architecture hard cut, not behavior bug. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Registry test 4/4; source checker passes; editor generated contracts 3/3 fresh. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `tsc -p tsconfig.package-integration.json` and Turbo www typecheck attempted; blocked only by existing List/Suggestion/Table/media-static errors outside changed files. Generated editor compilation/check passes. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: registry source files, not package exports/barrels. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: unchanged. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: unchanged. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in `/Users/zbeyens/git/plate-2`; www checks ran against `apps/www`; Browser targeted localhost www. |
| Browser surface changed | yes | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | Browser attempted `/blocks/editor-ai-demo`; compile blocked by stale CI-controlled `__registry__` imports. |
| Browser final proof | yes | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | Caveat: no runtime rendering claim; local build cannot proceed until CI regenerates `__registry__`, which repo policy forbids agents to generate locally. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: templates untouched. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: registry-only copied-source topology, no published package delta. |
| Registry-only component work changed | yes | Update `docs/components/changelog.mdx` or record N/A | Used canonical registry changelog source/generator instead: `2026-08-13-import-generated-editor-kit`, `--write` and `--check` pass. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Incidental docs pack; imports verified against generated exports; docs parity and `build:source` pass. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk: broken copied install/client boundary. Direct generated owner plus registry/source/editor checks is correct; Browser blocker recorded. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent tooling changed. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: deterministic source and generated-index failures. |
| P2 autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P2` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings; use P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | Final three-chunk local review clean; zero findings. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: not requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Pass; 15 existing oversized artifact warnings only. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Searches were scoped/capped; one broad typecheck produced bounded output and was not repeated. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: none requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-13-cut-editor-kit-facades.md` | Final checker passes after all evidence is recorded. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | Direct `EditorKit` and `Editor` exports verified in generated modules. |
| Docs links / routes / previews | no | Verify leaf links, routes, anchors, and preview names or record N/A | N/A: no links/routes/previews changed. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | `pnpm --filter www build:source` passes. |
| Plugin page specifics | no | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | N/A: only existing snippet imports changed. |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Browser attempted editor-ai; exact CI-generated-index blocker captured. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Console reports missing stale generated imports; page never reached runtime/network interaction. |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | Exact Browser DOM/log output recorded; screenshot not meaningful for empty compile-error page. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Bounded 20-reference manifest plus accepted CLI plans and owners read | implementation |
| Implementation | completed | Two facades deleted; 18 source/docs consumers, manifests, checker, type contract, and changelog migrated | verification |
| Verification | completed | Focused gates green; shared type/browser blockers recorded; P2 review clean | closeout |
| PR / tracker sync | completed | N/A: no public mutation requested | final response |
| Closeout | completed | Plan and exact handoff updated | final response |

Findings:
- Both facades were identical 11-line client wrappers with no caller of their custom hook.
- The bounded live graph had 20 wrapper references: 15 runtime consumers, one type contract, two manifests, one registry test, and three docs snippets with overlap in the manifest count; all are migrated or deleted.
- CI-controlled `apps/www/src/__registry__/index.tsx` still references the deleted facade and an independently deleted `plate-types.ts`; repo policy forbids local registry generation, so Browser cannot compile until CI refreshes this output.
- Shared current-tree TypeScript failures are in List, Suggestion, Table, list registry plugins, and media static types; none cite the changed facade consumers or generated-editor type contract.

Decisions and tradeoffs:
- Keep `editor-kit` as the registry item/product name, but remove the source facade; installable item identity does not require a same-named file.
- Import the generated contract directly; do not recreate `MyEditor`, a zero-argument hook, or a client-only alias elsewhere.
- Preserve `editor-definition.tsx`, `editor.generated.ts`, and `editor.schema.json` exactly; this cut does not reopen CLI filenames or contract design.

Implementation notes:
- Registry manifests now ship only the three generated-editor contract files for the `editor-kit` owner and the block's actual page/component plus those three contracts for `editor-ai`.
- API docs use generated `Editor` directly for `ValueOf<Editor>`.

Review fixes:
- Final P2 structured review: three chunks, zero accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial final registry-test rerun used a root-relative path from `apps/www` | 1 | Use `./src/registry/registry.test.ts` from the actual cwd | Rerun passed 4/4. |
| `check-registry-source` still asserted the deleted facade path | 1 | Point the current-contract assertion at `editor.generated.ts` | Checker passes. |
| www typechecks hit unrelated current-tree schema/type failures | 2 | Keep the exact errors, verify generated contracts and focused owners, do not patch other packages | Recorded as shared-tree blocker. |
| Browser route imports stale CI-generated registry index | 1 | Do not run forbidden local registry generation; capture exact blocker | Browser caveat recorded. |
| First P2 review snapshot changed during review | 1 | Rerun once against current tree | Final three-chunk review clean. |

Verification evidence:
- Source audit in `/Users/zbeyens/git/plate-2`: both facade files absent; zero live wrapper path/import matches excluding historical changelog and CI-generated `__registry__`.
- `bun test ./src/registry/registry.test.ts` in `apps/www`: 4/4 pass, 156 expectations.
- `scripts/check-registry-source.mts`: pass.
- `pnpm --dir apps/www editor:check`: 3/3 editors, all six artifacts current.
- `pnpm --filter www build:source` and docs source parity: pass.
- Registry changelog `--write` / `--check`: 58/58 events.
- `pnpm lint:fix`: pass with 15 existing oversized artifact warnings.
- P2 autoreview local: final three-chunk pass clean, zero findings.
- Browser `/blocks/editor-ai-demo`: blocked before rendering by stale CI-generated `__registry__` imports; no browser-success claim.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: direct local request
- Confidence line: high on source/registry contract; browser runtime intentionally unclaimed until CI regenerates registry output
- Flow table:
  - Reproduced: redundant 11-line facades and 20-reference live graph; stale generated-index Browser blocker
  - Verified: zero live facade references, registry 4/4, source checker, editor 3/3, changelog 58/58, MDX, lint, P2 review
- Browser check: attempted `/blocks/editor-ai-demo`; blocked by CI-generated `__registry__` references to deleted source and unrelated `plate-types.ts`
- Outcome: both handwritten facades deleted and every authoritative live consumer points directly to `editor.generated`
- Caveat: full www typecheck and Browser rendering remain blocked by unrelated shared source errors and stale CI-only registry output
- Design:
  - Chosen boundary: generated editor module owns runtime kit and exact types; registry item owns installation metadata
  - Why not quick patch: preserving a facade would keep a false client boundary and duplicate API
  - Why not broader change: CLI filenames, schema JSON/runtime use, and generated registry policy are separate decisions
- Verified: exact commands listed above
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
- Browser proof: attempted and explicitly CI-output-blocked
- Caveats: shared type errors and CI-generated index require their existing owners; no source workaround added

Timeline:
- 2026-08-13T19:29:12.402Z Task goal plan created.
- 2026-08-13 Read accepted CLI decisions and bounded every live facade consumer.
- 2026-08-13 Deleted both facades, migrated direct generated imports, updated manifests/checker/docs/type contract, and generated registry changelog.
- 2026-08-13 Focused registry/editor/docs/lint gates passed; shared type and CI-generated Browser blockers recorded; final P2 review clean.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final mechanical plan check |
| Where am I going? | Close with exact proof and caveats |
| What is the goal? | Remove both redundant editor-kit facades and route all live consumers to generated contracts |
| What have I learned? | See Findings |
| What have I done? | Completed source cut, adoption, release artifact, focused proof, Browser attempt, and P2 review |

Open risks:
- CI must regenerate `apps/www/src/__registry__/index.tsx` before www routes can compile against the deleted facade; local regeneration is explicitly forbidden.
- Existing shared List/Suggestion/Table/media type errors prevent a clean whole-www typecheck; this cut adds no cited type error.
