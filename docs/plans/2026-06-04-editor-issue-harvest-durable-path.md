# editor issue harvest durable path

Objective:
Refactor editor issue-harvest workflow paths so compact durable closure ledgers live under `docs/editor-issue-harvester/<repo>/` while raw external issue cache stays under `.tmp/editor-issue-harvester/<repo>/raw/`.

Completion threshold:
- Source rules and generated skill mirrors agree on the canonical docs path.
- Legacy `.tmp/editor-issue-harvester/<repo>/full/` ledgers are treated only as import sources.
- Raw issue bodies/comments and hydrated JSON are routed only to `.tmp/editor-issue-harvester/<repo>/raw/`.
- The docs path exists, explains the policy, and can track TSV ledgers.
- Verification audits prove no active issue artifact path still points at `.tmp`.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-04-editor-issue-harvest-durable-path.md` passes.

Verification surface:
- `pnpm install` to regenerate `SKILL.md` mirrors from `.agents/rules/*.mdc`.
- `rg` audits over `.agents/rules`, `.agents/skills`, `docs/plans/templates`, `docs/editor-issue-harvester`, and `.gitignore`.
- `git diff --check` over touched source rules, generated mirrors, `.gitignore`, and `docs/editor-issue-harvester/README.md`.
- Scoped Biome attempt recorded as N/A because these files are ignored by repo Biome config.

Constraints:
- No `docs/research` wrapper layer for editor issue closure ledgers.
- No raw external issue bodies/comments in versioned docs.
- Do not bulk-promote old Lexical/ProseMirror raw corpora in this refactor.
- Edit `.agents/rules/*.mdc` as source of truth; sync generated `SKILL.md` through `pnpm install`.
- No commit, push, PR, or GitHub mutation.

Boundaries:
- Source of truth: `.agents/rules/editor-test-harvester.mdc`, `.agents/rules/issue-harvester.mdc`, `.agents/rules/slate-automation.mdc`, `.agents/rules/clawsweeper.mdc`.
- Generated mirrors: `.agents/skills/editor-test-harvester/SKILL.md`, `.agents/skills/issue-harvester/SKILL.md`, `.agents/skills/slate-automation/SKILL.md`, `.agents/skills/clawsweeper/SKILL.md`.
- Durable docs path: `docs/editor-issue-harvester/`.
- Raw cache path: `.tmp/editor-issue-harvester/<repo>/raw/`.
- Non-goals: runtime Plite fixes, issue processing, bulk corpus migration, PR/release work.

Blocked condition:
- None. The path contract and skill sync were completed. Bulk migration remains a separate explicit action if desired.

Task state:
- task_type: agent workflow path refactor
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active until final tool close

Current verdict:
- verdict: complete
- confidence: high for skill path contract; medium for future harvester scripts because no issue-harvester run was executed
- next owner: issue-harvester when importing old Lexical/ProseMirror ledgers into docs
- reason: source rules, generated mirrors, docs path, ignore policy, and audits now align

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User wanted no extra compiled/derived layer and relevant skills updated to use the path. |
| Active goal checked or created | yes | `get_goal` returned no active goal; `create_goal` created the durable path refactor goal. |
| Source of truth read before edits | yes | Read relevant `SKILL.md` files, then patched `.agents/rules/*.mdc` source files. |
| Agent-native pack selected | yes | Changed skills/rules used by agents. |
| Docs pack selected | yes | Added `docs/editor-issue-harvester/README.md` and changed `.gitignore`. |
| Browser surface | no | N/A: no UI/runtime route changed. |
| Release, PR, tracker sync | no | N/A: no release, PR, or tracker action requested. |

Work Checklist:
- [x] First checkpoint captured the explicit requirement: no `docs/research` layer, use one canonical docs path, update relevant skills.
- [x] Patched `editor-test-harvester` so issue mode writes compact issue artifacts to `docs/editor-issue-harvester/<repo>/` and raw cache to `.tmp/editor-issue-harvester/<repo>/raw/`.
- [x] Patched `issue-harvester` so closure ledgers, overrides, run notes, and resume state live in `docs/editor-issue-harvester/<repo>/full/`.
- [x] Patched `issue-harvester` legacy handling so old `.tmp/editor-issue-harvester/<repo>/full/` ledgers are import sources, not the canonical path.
- [x] Patched `plite-automation` to delegate issue-harvest loops to the docs ledger path and raw-cache split.
- [x] Patched `clawsweeper` provenance wording so raw archive output is scratch and compact closure ledgers live in docs.
- [x] Added `docs/editor-issue-harvester/README.md` with the durable path and raw-cache policy.
- [x] Added `.tmp/` to repo `.gitignore` and unignored `docs/editor-issue-harvester/**/*.tsv` so durable TSV ledgers can be versioned.
- [x] Ran `pnpm install` to sync generated skills from source rules.
- [x] Verified generated mirrors contain the new path contract.
- [x] Verified stale active `.tmp` issue artifact path references are gone, except intentional legacy import mentions.
- [x] Verified no raw body/comment markers exist under `docs/editor-issue-harvester`.
- [x] Recorded that old Lexical/ProseMirror corpora were not bulk-promoted in this refactor.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` completed and `skiller apply` succeeded. |
| Agent action discoverability | yes | Source-audit generated skills an agent will read | `rg` showed new docs/raw path wording in all four generated `SKILL.md` mirrors. |
| Stale path audit | yes | Ensure active issue artifacts no longer route to `.tmp` | `rg` audit found no active `.tmp/editor-issue-harvester/.../issues|clusters|matrix|issues.json` paths. |
| Raw corpus hygiene | yes | Ensure docs path does not contain raw issue bodies/comments | `rg` over `docs/editor-issue-harvester` found no `bodyMarkdown`, `bodyText`, `comments`, body dumps, or `issue-bodies`. |
| Whitespace check | yes | Run diff whitespace check on touched files | `git diff --check -- <touched files>` passed. |
| Scoped lint | no | Try smallest sane formatter/lint check | `pnpm exec biome check --write <touched files>` processed zero files because Biome ignores these paths; recorded N/A. |
| Browser proof | no | Browser proof only applies to UI/runtime surfaces | N/A: no browser surface changed. |
| Autoreview | no | Optional for non-runtime skill/doc path refactor | N/A: small policy refactor verified by path audits and generated mirror sync. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-04-editor-issue-harvest-durable-path.md` | Pending final check. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read autogoal, slate-automation, editor-test-harvester, issue-harvester, clawsweeper, and agent-native reviewer instructions. | implementation |
| Implementation | complete | Patched source rules, generated mirrors, `.gitignore`, and README. | verification |
| Verification | complete | `pnpm install`, path audits, raw-doc hygiene audit, and whitespace check completed. | closeout |
| Closeout | complete | Plan updated with evidence. | final response |

Findings:
- `.tmp/editor-issue-harvester/<repo>/full/` was hardcoded as the canonical ledger path in `issue-harvester` and `plite-automation`.
- `editor-test-harvester` treated issue-mode outputs as scratch even when the output was compact local classification.
- `.tmp/` was only locally excluded in `.git/info/exclude`; the repo `.gitignore` did not protect raw cache on other machines.
- `*.tsv` was globally ignored, which would block versioned closure TSV ledgers without an exception.

Decisions and tradeoffs:
- Chosen path: `docs/editor-issue-harvester/<repo>/` for compact durable issue artifacts.
- Raw cache path: `.tmp/editor-issue-harvester/<repo>/raw/`.
- Rejected path: `docs/research/editor-issue-harvester/**`; that adds the extra layer the user called out.
- Rejected bulk migration in this pass: old Lexical/ProseMirror raw corpora include body dumps and generator scratch; import should happen through the harvester path contract.

Implementation notes:
- Relevant skills updated: `editor-test-harvester`, `issue-harvester`, `plite-automation`, `clawsweeper`.
- Generated mirrors synced by `pnpm install`.
- README added so the docs path is self-explanatory before the first imported ledger appears.

Review fixes:
- N/A: no accepted external review findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Scoped Biome processed zero files because the repo ignores these paths. | 1 | Use whitespace and path audits instead. | Recorded scoped lint as N/A and ran `git diff --check`. |

Verification evidence:
- `pnpm install` passed and ran `bun x skiller@latest apply`.
- `rg -n "docs/editor-issue-harvester|issue_raw_cache_dir|..." .agents/rules .agents/skills docs/editor-issue-harvester/README.md .gitignore` showed the new contract in source and generated mirrors.
- `rg -n "\.tmp/editor-issue-harvester/(<repo>|\$\{repo_key\}|<repo_key>)(/issues|/clusters|/matrix|/issues\.json)|issue_report_dir=\"\.tmp..." .agents/rules .agents/skills docs/plans/templates docs/editor-issue-harvester .gitignore` returned no stale active paths.
- `rg -n "bodyMarkdown|bodyText|comments\\s*:|issues-all-with-bodies|issue-bodies/" docs/editor-issue-harvester` returned no raw corpus markers.
- `git diff --check -- .gitignore .agents/rules/editor-test-harvester.mdc .agents/rules/issue-harvester.mdc .agents/rules/slate-automation.mdc .agents/rules/clawsweeper.mdc .agents/skills/editor-test-harvester/SKILL.md .agents/skills/issue-harvester/SKILL.md .agents/skills/slate-automation/SKILL.md .agents/skills/clawsweeper/SKILL.md docs/editor-issue-harvester/README.md` passed.

Reboot status:
- Current state is resumable from this plan. Next issue-harvester run should import legacy compact ledgers from `.tmp/editor-issue-harvester/<repo>/full/` into `docs/editor-issue-harvester/<repo>/full/` before processing more rows.

Open risks:
- Old Lexical/ProseMirror compact ledgers remain in `.tmp` until an explicit import/regeneration run. The skills now know how to handle that, but this turn did not move those artifacts.

Final handoff contract:
- Changed list: path policy in four skills, generated mirrors, `.gitignore`, and `docs/editor-issue-harvester/README.md`.
- Caveat: no full issue-harvester execution was run, and no old corpus was bulk-migrated.
- Verified: `pnpm install`, path audits, raw-doc hygiene audit, and whitespace check.
