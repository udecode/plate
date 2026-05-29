# slate v2 inline classnames

Objective:
Inline static CSS class-name constants in
`/Users/zbeyens/git/plate-2/.tmp/slate-v2/site` example code. Completion
requires no static `const <name>Css = 'slate-...'` or equivalent static
class-name constants in `site/examples/ts` or `site/components`, affected call
sites using literal `className` strings or `cn()` for composition/conditionals,
the Emotion hard cut remaining intact, and focused verification passing.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-05-27-slate-v2-inline-classnames.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser

Task source:
- type: user prompt
- id / link: N/A: direct chat request
- title: inline example class-name constants
- acceptance criteria: remove `panelCss`-style constants, inline static class
  names, use `cn()` for dynamic/combined class names.

Completion threshold:
- `rg -n 'const\s+\w+(Css|ClassName)\s*=|className=\{`|toneBadgeClassName|className=\{\w+Css\}|className:\s*\w+Css\b' .tmp/slate-v2/site/examples/ts .tmp/slate-v2/site/components`
  returns no matches.
- `rg -n "@emotion|emotion|css\(|cx\(" .tmp/slate-v2 --glob '!site/.next/**' --glob '!site/out/**'`
  returns no matches.
- `bun typecheck:site` and `bun lint` pass from `.tmp/slate-v2`.
- Browser smoke passes on representative touched routes.

Verification surface:
- source-audit: static class constant grep
- source-audit: Emotion hard-cut grep
- command: `bun lint:fix`
- command: `bun typecheck:site`
- command: `bun lint`
- browser: local Chromium smoke against `http://localhost:3100`

Constraints:
- Preserve previous Emotion hard cut.
- No new styling runtime.
- No package runtime behavior changes.
- No PR/commit/push.

Boundaries:
- Source of truth: latest user prompt plus current `.tmp/slate-v2` files.
- Allowed edit scope: `.tmp/slate-v2/site/examples/ts/**` and
  `.tmp/slate-v2/site/components/**`.
- Browser surface: `.tmp/slate-v2/site` examples app.
- Tracker sync: N/A: no tracker item supplied.
- Non-goals: package runtime/API work.

Blocked condition:
Stop if the audit reveals a non-static constant whose inlining would make code
less clear or if local verification/browser proof cannot run.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Used autogoal/task workflow and Browser proof fallback from prior local setup |
| Active goal checked or created | yes | `get_goal` returned no active goal; `create_goal` created this objective |
| Source of truth read before edits | yes | User prompt and class-constant audit read |
| Tracker comments and attachments read | N/A | No tracker item |
| Video transcript evidence required | N/A | No video |
| `docs/solutions` checked for non-trivial existing-code work | N/A | Narrow continuation of current local migration |
| TDD decision before behavior change or bug fix | N/A | Structural style cleanup, no behavior contract |
| Branch decision for code-changing task | N/A | No PR/commit requested |
| Release artifact decision | N/A | Site example cleanup only |
| Browser tool decision for browser surface | yes | Browser proof required; local Chromium used because in-app Browser local URL was blocked earlier by client |
| PR expectation decision | N/A | No PR requested |
| Tracker sync expectation decision | N/A | No tracker item |
| Browser pack selected | yes | Touched rendered examples |
| Browser route / app surface identified | yes | `/examples/pagination`, `/examples/search-highlighting`, `/examples/comment-mode`, `/examples/inlines`, `/examples/images` |
| Browser tool decision recorded | yes | Local Chromium smoke against existing server on `localhost:3100` |
| Console/network caveat policy recorded | yes | Console errors checked in smoke |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: N/A with reason.
- [x] Final handoff shape decided.
- [x] Branch handling recorded for code-changing work: N/A with reason.
- [x] Local-env-rot retry policy recorded: N/A, no install-corruption signature.
- [x] Workspace authority recorded: proof commands ran in `.tmp/slate-v2`.
- [x] High-risk note recorded: rendered examples touched; browser smoke required.
- [x] Review/autoreview target selected or marked N/A: N/A, small mechanical
      cleanup with targeted source audit plus lint/typecheck/browser proof.
- [x] Agent-native review decision recorded: N/A.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: browser proof uses the repo-approved browser tool or records a blocker/waiver.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot, trace, or exact verification caveat is ready for final handoff.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run source audits, lint/typecheck, browser smoke | Passed |
| Bug reproduced before fix | N/A | Record reason | Cleanup, not bug repro |
| Targeted behavior verification | yes | Browser-smoke touched routes | Passed with expected selectors and no console errors |
| TypeScript or typed config changed | yes | Run relevant typecheck | `bun typecheck:site` passed |
| Package manifests, lockfile, or install graph changed | N/A | Record reason | No manifest/lockfile change in this pass |
| Workspace authority proof | yes | Run in owning checkout | Commands ran in `.tmp/slate-v2` |
| Browser surface changed | yes | Browser proof | Local Chromium smoke passed |
| Browser final proof | yes | Record artifact path | `/tmp/slate-v2-inline-classnames-search.png` |
| CI-controlled template output changed | N/A | Record reason | No template output touched |
| Package behavior or public API changed | N/A | Record reason | Site examples only |
| Registry-only component work changed | N/A | Record reason | No registry work |
| Docs or content changed | N/A | Record reason | No docs/content edit |
| High-risk mini gate | yes | Record realistic failure mode and proof | Risk: broken class composition; proof: source audit, lint/typecheck, browser smoke |
| Agent-native review for agent/tooling changes | N/A | Record reason | No agent/tooling files touched |
| Local install corruption suspected | N/A | Record reason | No env-rot signature |
| Autoreview for non-trivial implementation changes | N/A | Record reason | Narrow mechanical cleanup; deterministic audits and browser proof are stronger here |
| PR create or update | N/A | Record reason | No PR requested |
| PR proof image hosting | N/A | Record reason | No PR |
| Tracker sync-back | N/A | Record reason | No tracker |
| Final handoff contract | yes | Fill final evidence | Done below |
| Final lint | yes | Run lint | `bun lint:fix` and `bun lint` passed |
| Goal plan complete | yes | Run checker | Pending after this update |
| Browser interaction proof | yes | Exercise target routes | Passed |
| Browser console/network check | yes | Record console state | `errors: []` |
| Browser final proof artifact | yes | Record screenshot path | `/tmp/slate-v2-inline-classnames-search.png` |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Class-constant audit read | Done |
| Implementation | complete | Static constants removed and dynamic classes moved to `cn()` | Done |
| Verification | complete | Source audits, lint/typecheck, browser smoke passed | Done |
| Closeout | complete | Plan updated; checker pending | Done |

Findings:
- Static `*Css` constants were concentrated in migrated example files.
- `prismThemeCss` was an actual CSS stylesheet string, not a class-name
  constant; renamed to `prismThemeStyles` so the audit cleanly separates style
  content from class names.
- Dynamic class-name assembly remained in examples and `ExampleLayout`; those
  sites now use `cn()`.

Timeline:
- 2026-05-27T08:14Z Created active goal and plan.
- 2026-05-27T08:15Z Audited static class constants.
- 2026-05-27T08:16Z Mechanically inlined static class constants.
- 2026-05-27T08:18Z Replaced dynamic template-string class names with `cn()`.
- 2026-05-27T08:20Z Ran `bun lint:fix`, `bun typecheck:site`, `bun lint`, source audits, and browser smoke.

Decisions and tradeoffs:
- Inline static class strings directly at call sites.
- Use `cn()` only for conditional or composed class names.
- Keep global stylesheet rules unchanged; this task is call-site cleanup.

Review fixes:
- N/A: no review findings beyond direct audit cleanup.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial rg quoting typo | 2 | Split search commands and use single quotes for backtick patterns | Audits passed |

Verification evidence:
- `rg -n 'const\s+\w+(Css|ClassName)\s*=|className=\{`|toneBadgeClassName|className=\{\w+Css\}|className:\s*\w+Css\b' .tmp/slate-v2/site/examples/ts .tmp/slate-v2/site/components` -> no matches.
- `rg -n "@emotion|emotion|css\(|cx\(" .tmp/slate-v2 --glob '!site/.next/**' --glob '!site/out/**'` -> no matches.
- `bun lint:fix` from `.tmp/slate-v2` -> pass; fixed 8 files.
- `bun typecheck:site` from `.tmp/slate-v2` -> pass.
- `bun lint` from `.tmp/slate-v2` -> pass.
- Browser smoke from `.tmp/slate-v2` against `http://localhost:3100` -> pass:
  pagination, search-highlighting, comment-mode, inlines, and images mounted
  expected selectors; search interaction produced highlight selector;
  `emotionClassCount: 0` on all checked routes; console `errors: []`.

Final handoff contract:
- PR line: N/A.
- Issue / tracker line: N/A.
- Confidence line: high; static class audit, Emotion audit, typecheck, lint,
  and browser smoke passed.
- Browser check: local Chromium smoke passed on representative touched routes.
- Outcome: static class-name constants removed; call sites now inline strings
  or use `cn()`.
- Caveat: existing dev server on `localhost:3100` was used.
- Design:
  - Chosen boundary: example/component call sites only.
  - Why not quick patch: constants would keep the indirection the user asked to
    remove.
  - Why not broader change: stylesheet ownership did not need another rewrite.
- Verified: source audits, `bun typecheck:site`, `bun lint`, browser smoke.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Checker and final response |
| What is the goal? | Inline static example class-name constants and use `cn()` for dynamic composition |
| What have I learned? | Static constants were removable; real CSS content needed a non-`Css` name |
| What have I done? | Inlined constants, added `cn()` at dynamic call sites, verified |

Open risks:
- None.
