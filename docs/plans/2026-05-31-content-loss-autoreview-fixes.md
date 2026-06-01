# content loss autoreview fixes

Objective:
Fix accepted P1/P2 content-loss findings in the current `content/**` docs diff and rerun focused autoreview until it reports no accepted/actionable critical or major docs-loss findings.

Goal plan:
docs/plans/2026-05-31-content-loss-autoreview-fixes.md

Completion threshold:
- Accepted content-loss findings are fixed or reverted to the previous detailed docs.
- Broken `ComponentSource`, anchors, snippets, and API references introduced by the docs diff are fixed.
- `pnpm --filter www build:source` passes.
- Focused `autoreview --mode local` for `content/**` reports clean.

Verification surface:
- `pnpm --filter www build:source`
- `.agents/skills/autoreview/scripts/autoreview --mode local --prompt "<focused content-loss review>"`
- Targeted `rg` checks for restored anchors, `ComponentSource src`, `shouldMergeNodes`, and fixed HTML/Markdown snippets.

Constraints:
- Keep the user's requested revert of the docs-check fallback parser.
- Do not stage, commit, push, or create a PR.
- Do not reintroduce deleted API/setup/reference docs as summaries when restore from `HEAD` is safer.
- Treat broken docs anchors and invalid registry source names as actionable content loss.

Boundaries:
- Source of truth: current worktree, current `content/**`, registry definitions in `apps/www/src/registry/**`, and render support in `apps/www/src/lib/rehype-component.ts`.
- Allowed edit scope: docs content and direct docs render support needed to make the docs valid.
- Browser surface: not required; this was a static content-loss/autoreview gate.
- Tracker sync: none.
- Non-goals: unrelated docs rewrite quality, unrelated script fixes, staging/commit/PR.

Blocked condition:
- The only non-content blocker is `pnpm --filter www check:docs` expecting `.source/index.ts` after the user-requested fallback-parser revert. That checker fix is owned by another thread, so this goal does not re-add the fallback.

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition.
- [x] Docs lane classified as broad docs-loss review across API reference, plugin/feature, serialization/conversion, install, and example docs.
- [x] Target docs and affected sibling docs were inspected before patching accepted findings.
- [x] Docs style doctrine was respected for current-state wording where new prose was added.
- [x] Documented behavior or API was verified against current source where snippets/options were changed.
- [x] Ownership map recorded through source paths and registry/render support files.
- [x] Fastest corrective path was used: restore high-risk reference docs from `HEAD`, patch narrow remaining defects.
- [x] Opening prose in touched docs avoids generic fluff where edited.
- [x] Named APIs, options, transforms, components, imports, routes, and package specifiers are exact and current where patched.
- [x] Plugin docs with major reference loss were restored instead of summarized.
- [x] Serialization docs restore detailed HTML/Markdown contracts and correct unsupported raw-HTML guidance.
- [x] API reference docs restore exact contracts such as Slate API details and core options.
- [x] Demos/previews use real registry entries or supported `ComponentSource src`.
- [x] Links target real pages and anchors.
- [x] Anti-slop audit passed through focused autoreview clean result.
- [x] Workspace authority recorded with cwd `/Users/zbeyens/git/plate`.
- [x] Autoreview target selected and run for non-trivial docs work.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `autoreview` loaded | yes | User explicitly requested `$autoreview`; script ran repeatedly. |
| Active goal checked or created | yes | Active goal continued with this plan. |
| Docs lane selected | yes | Broad content-loss review lane. |
| Target docs read | yes | Accepted finding locations were read before fixes. |
| Nearest sibling docs read | yes | Source/registry/render support inspected for examples and API snippets. |
| Docs style doctrine read | yes | Existing docs-creator constraints applied from repo rules and previous work. |
| Documented source code read | yes | Markdown, HTML, registry, and render support source inspected. |
| Ownership map drafted | yes | Content docs own prose; registry owns item names; rehype component owns source hydration. |
| Browser/render proof decision | yes | Static MDX/source generation and autoreview were sufficient; no browser-only UI behavior changed. |
| PR/tracker expectation decision | yes | No PR/tracker action requested. |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run source generation and focused autoreview | `pnpm --filter www build:source` passed; final autoreview clean. |
| Docs lane shape satisfied | yes | Restore reference docs or fix precise defects | High-risk net-deletion docs restored; remaining snippets/anchors/source blocks patched. |
| Source-backed claim audit | yes | Verify changed API/source claims | HTML deserialize shape, Markdown options, and `ComponentSource src` support checked against source. |
| Ownership map verified | yes | Confirm package/layer ownership | Registry entries and `rehype-component.ts` inspected. |
| MDX/content parser | yes | Run source generation | `pnpm --filter www build:source` passed. |
| Links/routes/previews verified | yes | Check accepted broken anchors/source names | Autoreview clean; targeted `rg` showed valid source blocks and anchor. |
| Plugin page specifics | yes | Restore plugin reference pages with major loss | Link, media, AI, Yjs, table, and other high-risk docs restored or corrected. |
| Browser/render surface changed | no | Static source generation covers this fix | Browser proof not required for content-loss objective. |
| Package/API behavior changed | no | Record N/A | Docs/render hydration only; no package API behavior changed. |
| Agent rules or skills changed | no | Record N/A | No agent rules or skills changed in this goal closeout. |
| Autoreview for non-trivial docs changes | yes | Run focused review until clean | Final autoreview: no accepted/actionable findings. |
| Final lint | no | Record N/A | User asked content-loss fix; no lint gate needed beyond source generation/autoreview. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-content-loss-autoreview-fixes.md` | To run after this update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | Accepted findings and source files inspected | writing |
| Writing | done | Restores and targeted fixes applied | verification |
| Verification | done | `build:source` passed; autoreview clean | closeout |
| PR / tracker sync | done | Not requested | final response |
| Closeout | done | Plan updated for completion check | final response |

Findings:
- Initial review found major content loss in Slate API reference, changelog, Next.js snippets, table docs, Markdown security guidance, core options, HTML customization docs, Markdown rules, link/media/AI/Yjs docs, and invalid example source blocks.
- Accepted findings were fixed by restoring risky reference-heavy docs from `HEAD` and patching precise defects that remained.

Decisions and tradeoffs:
- Restored high-deletion and net-deletion docs from `HEAD` instead of trying to preserve lossy summaries.
- Kept the user's requested revert of the docs-check fallback parser, even though `check:docs` still fails in this checkout without the other-thread fix.
- Added `ComponentSource src` hydration support because the docs component already exposed the prop and the examples needed secondary registry files.

Implementation notes:
- Restored detailed Slate, table, changelog, core, HTML, Markdown, link, media, AI, Yjs, and other high-risk docs where autoreview or deletion counts showed reference loss.
- Added `shouldMergeNodes` API reference and fixed editing-behavior/table anchors.
- Fixed Next.js client snippets, HTML deserialize call shape, Markdown raw-HTML guidance, Markdown API options, and example value source rendering.

Review fixes:
- Final accepted finding fixed by switching invalid `ComponentSource name` values to `ComponentSource src` and wiring `src` in `rehype-component.ts`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm --filter www check:docs` failed after fallback revert because `.source/index.ts` is absent | 1 | Do not re-add fallback; rely on other-thread checker fix and run `build:source` plus autoreview here | User requested fallback revert; `build:source` and final autoreview passed |

Verification evidence:
- `pnpm --filter www build:source` passed after the `ComponentSource src` fix.
- Final focused `autoreview --mode local` exited 0 with: `autoreview clean: no accepted/actionable findings reported`.
- Targeted checks showed invalid value `ComponentSource name` usages removed and replaced with `src`.
- Targeted checks showed troubleshooting links `/docs/plugin#advanced-plugin-configuration` and `editor-api#shouldmergenodes`.
- `pnpm --filter www check:docs` remains outside this goal's green evidence after the user-requested fallback revert because the current checkout still lacks `.source/index.ts`.

Final handoff contract:
- PR line: no PR requested.
- Issue / tracker line: no tracker update requested.
- Confidence line: high for content-loss objective; final autoreview clean.
- Docs lane: broad content-loss repair.
- Source-backed claims: checked against source/registry/render support where modified.
- Content build / parser: `pnpm --filter www build:source` passed.
- Links / demos / previews: accepted broken cases fixed and reviewed clean.
- Browser check: N/A for static docs-loss gate.
- Outcome: accepted/actionable critical and major content-loss findings cleared.
- Caveat: full `check:docs` still needs the other-thread `.source/index.ts` fix in this checkout.
- Verified: final focused autoreview clean.

Final handoff / sync:
- PR: none.
- Issue / tracker: none.
- Browser proof: none required.
- Caveats: `check:docs` caveat above.

Timeline:
- 2026-05-31T20:01:26.168Z Docs goal plan created.
- 2026-06-01: Reverted checker fallback per user request, fixed invalid `ComponentSource` value sources, ran `build:source`, and got focused autoreview clean.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Run autogoal completion checker, then mark goal complete if it passes |
| What is the goal? | Clear accepted/actionable critical or major content-loss findings in `content/**` |
| What have I learned? | Lossy summaries were the core risk; restores plus targeted fixes were safer |
| What have I done? | Fixed accepted findings, reverted requested fallback parser, and got clean autoreview |

Open risks:
- Full `pnpm --filter www check:docs` is not green in this checkout until the separate `.source/index.ts` generator/checker fix is present.
