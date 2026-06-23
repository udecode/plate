# CE skill boundary audit

Objective:
Audit CE skills; done when every current CE skill and agent file has keep/fork/remove/defer classification; plan docs/plans/2026-06-18-ce-skill-boundary-audit.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-06-18-ce-skill-boundary-audit.md

Primary template:
docs/plans/templates/docs.md

Applied packs:
- agent-native

Completion threshold:
- All 82 current files under ../compound-engineering-plugin/plugins/compound-engineering/skills and agents are checked with one decision: keep-local, fork, or remove.
- Recommended flow names the local owner for future cleanup without conflicting with auto, task, autogoal, or autoreview.
- Mechanical goal-plan check passes.

Verification surface:
- source-audit: read installed local owner skills auto, autogoal, task, and autoreview.
- source-audit: indexed every current CE plugin skill and agent file from ../compound-engineering-plugin/plugins/compound-engineering.
- artifact: .tmp/ce-skill-boundary-audit/current-plugin-index.jsonl.
- artifact: .tmp/ce-skill-boundary-audit/decision-matrix.md.
- command: node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-18-ce-skill-boundary-audit.md.

Constraints:
- Do not patch skill topology yet; this checkpoint is analysis and flow design only.
- Do not let CE command skills replace auto, task, autogoal, autoreview, maintainer, or autoclosure.
- Prefer local forks only when CE content is useful but generic behavior conflicts with Plate/Plite rules.
- Keep generated mirrors untouched.

Boundaries:
- Source of truth: ../compound-engineering-plugin/plugins/compound-engineering/skills/**/SKILL.md, ../compound-engineering-plugin/plugins/compound-engineering/agents/*.md, skills-lock.json, and local .agents/skills/{auto,autogoal,task,autoreview}/SKILL.md.
- Allowed edit scope: docs/plans/2026-06-18-ce-skill-boundary-audit.md and .tmp/ce-skill-boundary-audit/** artifacts.
- Browser surface: N/A: no browser-visible change.
- Tracker sync: N/A: no tracker source.
- Non-goals: removing skills, changing skills-lock.json, running npx skills, patching .agents/rules, or committing.

Blocked condition:
- Block only if the CE plugin checkout is missing or the local owner skills cannot be read. Neither occurred.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User asked to read CE skills one by one, classify keep/fork against auto/task/autoreview, include autogoal checkmarks, and build the full flow. |
| Timed checkpoint parsed | N/A: no duration requested | No duration in prompt. |
| docs-creator loaded | N/A: analysis plan only | No public docs/content page was written. |
| Active goal checked or created | yes | get_goal returned none; create_goal created active goal for this plan. |
| Docs lane selected | yes | Lane is internal skill-boundary analysis, recorded in this plan. |
| Target docs read | yes | skills-lock.json and local owner skills read. |
| Nearest sibling docs read | N/A: no public docs page | This is a goal-plan artifact, not docs IA work. |
| Docs style doctrine read | N/A: no public docs page | No user-facing docs prose created. |
| Documented source code read | yes | All 82 CE plugin skill/agent files indexed by Node source audit. |
| Ownership map drafted | yes | Recommended flow and per-row local owner decisions recorded below. |
| Plugin-page rules decision | N/A: no plugin docs page | Not a plugin docs task. |
| Browser/render proof decision | N/A: no browser surface | Analysis only. |
| PR/tracker expectation decision | N/A: no PR/tracker action | No external tracker source. |
| Agent-native pack selected | yes | Agent-native pack applies because skill topology and agent action boundaries are analyzed. |
| Agent-facing action surface identified | yes | auto/task/autogoal/autoreview are protected front doors; CE skills are classified below. |
| Source rule versus generated mirror boundary identified | yes | No source rules or generated mirrors changed. |
| agent-native-reviewer loaded or waiver recorded | N/A: no skill source changed | Analysis only; no agent behavior file patched. |

Work Checklist:
- [x] First checkpoint complete: all explicit prompt requirements copied into this plan.
- [x] Objective, threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Current local owner skills read: auto, autogoal, task, autoreview.
- [x] skills-lock.json read and CE-source locked skills identified.
- [x] Current CE plugin manifest read: compound-engineering plugin version 3.13.1.
- [x] Every CE executable skill was read/indexed and checked.
- [x] Every CE agent/persona dependency was read/indexed and checked.
- [x] Each row has one decision: keep-local, fork, or remove.
- [x] Full flow is recorded: auto front door, task normal execution, autogoal lifecycle, autoreview closeout, maintainer queue, autoclosure post-merge.
- [x] Agent-native pack: no generated mirror edits made.
- [x] Agent-native pack: future agent action surface is discoverable from this plan.
- [x] Error attempt recorded.
- [x] Final goal-plan check run.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Check all current CE skill and agent files | 82/82 rows checked in decision matrix. |
| Docs lane shape satisfied | no | N/A: no public docs page edited. | N/A: no public docs page edited. |
| Source-backed claim audit | yes | Verify counts and sources from local files | current-plugin-index.jsonl records 39 skills and 43 agents. |
| Ownership map verified | yes | Map decisions against local owner skills | Flow below protects auto/task/autogoal/autoreview boundaries. |
| MDX/content parser | no | N/A: no content/** or apps docs changed. | N/A: no content/** or apps docs changed. |
| Links/routes/previews verified | no | N/A: no docs route edited. | N/A: no docs route edited. |
| Plugin page specifics | no | N/A: no plugin docs page. | N/A: no plugin docs page. |
| Browser/render surface changed | no | N/A: no UI change. | N/A: no UI change. |
| Package/API behavior changed | no | N/A: no package source changed. | N/A: no package source changed. |
| Agent rules or skills changed | no | N/A: no pnpm install needed. | N/A: no .agents/rules changed. |
| Autoreview for non-trivial docs changes | no | N/A: analysis only. | N/A: no implementation or public docs diff. |
| Final lint | no | N/A: no lintable source changed. | N/A: no code changed. |
| Timed checkpoint | no | N/A: no timed checkpoint. | N/A: no duration requested. |
| Agent source / generated sync | no | N/A: no .agents/rules changes. | N/A: no agent source changed. |
| Agent action discoverability | yes | Record future action map | See Recommended Flow below. |
| Agent-native review | no | N/A: analysis only. | N/A: no agent source changed. |
| Goal plan complete | yes | Run check-complete | To be recorded in Verification evidence. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Local owner skills, lockfile, CE manifest, and 82 CE files read/indexed. | Writing complete. |
| Writing | complete | Decision matrix written into plan and .tmp artifact. | Verification. |
| Verification | complete | Matrix row count and classification count recorded. | Closeout. |
| PR / tracker sync | N/A: no PR/tracker | No external sync requested. | Closeout. |
| Closeout | complete | Final handoff can summarize matrix. | Final response. |

Findings:
- Current checked-in skills-lock.json pinned five CE-source exact local skills:
  two stale entries were cut; git commit helpers remain.
- Current ../compound-engineering-plugin exposes 39 ce-* executable skills and 43 ce-* agent/persona files.
- The current CE plugin no longer has exact skill folders matching the stale
  bug-repro / PR-feedback local names; those were old installs relative to the
  current plugin tree.
- CE's intended front doors are ce-brainstorm, ce-plan, and ce-code-review. In this repo those conflict with major-task/autogoal/autoreview/auto and should not become user-facing commands.
- Harsh take: CE is valuable as a source of lenses, not as a command topology. Importing its orchestration would make our skill stack worse.

Decisions and tradeoffs:
- Decision: keep local leaf lenses only when they have a distinct proof/review/research owner. Reason: avoids command sprawl. Risk: fewer remembered command names, but auto/task routing stays clean.
- Decision: fork relevant CE command ideas into existing local owners. Reason: CE command assumptions conflict with Plate git, worktree, PR, Browser, and goal rules. Risk: requires a later cleanup pass to remove stale locked entries.
- Decision: remove/reject CE domain-specific skills for Rails, iOS, Slack, Figma, Proof, plugin setup/update, and product-pulse workflows. Reason: wrong repo shape unless explicitly requested. Risk: none for Plate/Plite.

# CE Skill Boundary Matrix

Source: ../compound-engineering-plugin/plugins/compound-engineering @ current checkout.
Checked rows: 82 (39 skills, 43 agents).
Decision counts: fork=29, remove=32, keep-local=21.

## Executable Skills
| Check | Skill | Decision | Local owner / reason |
|---|---|---|---|
| ✅ | `ce-agent-native-architecture` | fork | Fold agent-native app doctrine into agent-native-reviewer + architecture-cleanup; standalone CE skill is too broad. |
| ✅ | `ce-agent-native-audit` | fork | Useful score lens, but local agent-native-reviewer should own it, not a CE audit command. |
| ✅ | `ce-brainstorm` | remove | Conflicts with major-task/grill-with-docs; collaborative requirements docs are not an auto front door. |
| ✅ | `ce-clean-gone-branches` | remove | Violates repo taste: no proactive branch hygiene / git cleanup skill. |
| ✅ | `ce-code-review` | remove | Conflicts with autoreview, which already owns structured closeout review. |
| ✅ | `ce-commit` | fork | Relevant, but must obey Plate rule: stage current checkout when asked, no default-branch/worktree ceremony. |
| ✅ | `ce-commit-push-pr` | fork | Relevant, but PR body/stage/push rules must be Plate/task-specific. |
| ✅ | `ce-compound` | fork | Keep learning capture idea in research-wiki/sync-vision/learnings; no CE command wrapper. |
| ✅ | `ce-compound-refresh` | fork | Refresh stale learnings via sync-vision/research-wiki, not a parallel CE refresh lane. |
| ✅ | `ce-debug` | remove | Local debug/task already own repro/debug with repo Browser policy. |
| ✅ | `ce-demo-reel` | fork | Useful visual-proof/PR evidence idea; absorb into Browser proof/git-commit-push-pr, not standalone. |
| ✅ | `ce-dhh-rails-style` | remove | Rails-specific and explicitly excluded for Plate by AGENTS. |
| ✅ | `ce-doc-review` | fork | Useful reviewer lenses; route through grill-with-docs/major-task reviewers, not CE doc-review command. |
| ✅ | `ce-dogfood-beta` | remove | Too broad, worktree-heavy, overlaps auto/autoclosure/browser proof. |
| ✅ | CE frontend design skill | remove | The design bar belongs in AGENTS Browser proof and Plate UI owners, not a remembered skill. |
| ✅ | `ce-gemini-imagegen` | remove | System imagegen skill owns image generation; no Gemini API skill needed. |
| ✅ | `ce-ideate` | fork | Grounded idea scoring is useful inside major-task/auto research, but standalone ideation conflicts with VISION-led routing. |
| ✅ | `ce-optimize` | fork | Metric loop ideas belong in auto/slate-ar/benchmarks; standalone optimizer overlaps autogoal. |
| ✅ | `ce-plan` | remove | Conflicts with major-task, slate-plan, plate-plan, and autogoal templates. |
| ✅ | `ce-polish` | fork | Browser polish loop can feed autoclosure/Browser proof, but not a remembered command. |
| ✅ | `ce-product-pulse` | remove | Product analytics pulse is not current Plate/Plite repo work. |
| ✅ | `ce-promote` | remove | Marketing/promotion copy is out of scope for repo maintenance. |
| ✅ | `ce-proof` | remove | External Proof editor workflow is not part of our docs/review system. |
| ✅ | `ce-release-notes` | remove | Plugin-specific release-note query; not relevant to Plate release lanes. |
| ✅ | `ce-report-bug` | remove | Plugin-bug reporting belongs upstream, not repo skill topology. |
| ✅ | CE PR feedback skill | fork | Relevant, but local resolve-pr-feedback/maintainer must own PR feedback with Plate rules. |
| ✅ | `ce-riffrec-feedback-analysis` | remove | Product-specific bundle workflow; no current Plate need. |
| ✅ | `ce-sessions` | fork | Prior-session search idea belongs in memory/learnings, not a CE session command. |
| ✅ | `ce-setup` | remove | Compound plugin setup diagnostics are irrelevant inside Plate. |
| ✅ | `ce-simplify-code` | fork | Good deslop concept; architecture-cleanup owns this with Plate/Plite boundaries. |
| ✅ | `ce-slack-research` | remove | No Slack connector workflow in this repo; ask explicitly if needed. |
| ✅ | `ce-strategy` | fork | Strategy-doctrine idea maps to VISION.md/sync-vision, not STRATEGY.md. |
| ✅ | `ce-test-browser` | fork | Browser test ideas matter, but dev-browser/testing/@platejs/browser own proof. |
| ✅ | `ce-test-xcode` | remove | iOS/Xcode is not a Plate lane. |
| ✅ | `ce-update` | remove | Compound plugin update checker is not repo maintenance. |
| ✅ | `ce-work` | remove | Direct conflict with task/auto/maintainer/autoclosure. |
| ✅ | `ce-work-beta` | remove | Direct conflict plus delegation/worktree assumptions. |
| ✅ | `ce-worktree` | remove | User explicitly does not want worktrees. |
| ✅ | `lfg` | remove | Shorthand command adds no distinct Plate owner; reject. |

## Agent / Persona Dependencies
| Check | Agent | Decision | Local owner / reason |
|---|---|---|---|
| ✅ | `ce-adversarial-document-reviewer` | keep-local | Keep as a document-review lens under grill-with-docs/major-task. |
| ✅ | `ce-adversarial-reviewer` | fork | Useful skepticism, but autoreview owns code-review orchestration. |
| ✅ | `ce-agent-native-reviewer` | keep-local | Keep; required for agent/tooling changes. |
| ✅ | `ce-ankane-readme-writer` | remove | Ruby gem README style is irrelevant. |
| ✅ | `ce-api-contract-reviewer` | fork | Useful for package/API diffs; fold into package-api pack/autoreview. |
| ✅ | `ce-architecture-strategist` | keep-local | Keep as architecture pressure lens, subordinate to architecture-cleanup/major-task. |
| ✅ | `ce-best-practices-researcher` | keep-local | Keep as generic external research leaf when local clones/docs are insufficient. |
| ✅ | `ce-code-simplicity-reviewer` | keep-local | Keep as review lens; architecture-cleanup owns implementation. |
| ✅ | `ce-coherence-reviewer` | keep-local | Keep for plan/doc consistency review. |
| ✅ | `ce-correctness-reviewer` | keep-local | Keep as core code-review lens. |
| ✅ | `ce-data-integrity-guardian` | remove | Data app/migration guard is CE overkill for Plate. |
| ✅ | `ce-data-migration-reviewer` | remove | Data migration reviewer explicitly excluded by AGENTS. |
| ✅ | `ce-deployment-verification-agent` | remove | Deployment verification agent is wrong shape for library repo. |
| ✅ | `ce-design-implementation-reviewer` | fork | Only useful when Figma/design parity exists; route via plate-ui or explicit Browser proof. |
| ✅ | `ce-design-iterator` | fork | Screenshot-improve loop belongs in Browser proof/autoclosure, not an agent persona. |
| ✅ | `ce-design-lens-reviewer` | fork | Useful planning lens; fold into grill-with-docs/plate-ui. |
| ✅ | `ce-feasibility-reviewer` | keep-local | Keep for plan pressure. |
| ✅ | `ce-figma-design-sync` | remove | Figma sync is explicitly excluded unless requested. |
| ✅ | `ce-framework-docs-researcher` | keep-local | Keep for version-sensitive framework/library docs. |
| ✅ | `ce-git-history-analyzer` | keep-local | Keep for archaeology when source history matters. |
| ✅ | `ce-issue-intelligence-analyst` | keep-local | Keep for issue-pattern analysis under maintainer/research. |
| ✅ | `ce-julik-frontend-races-reviewer` | fork | Useful async UI race lens; fold into autoreview when UI async is touched. |
| ✅ | `ce-learnings-researcher` | keep-local | Keep for docs/solutions and memory-like local learnings. |
| ✅ | `ce-maintainability-reviewer` | keep-local | Keep as code-review lens. |
| ✅ | `ce-pattern-recognition-specialist` | keep-local | Keep for pattern consistency checks. |
| ✅ | `ce-performance-oracle` | keep-local | Keep as performance analysis leaf. |
| ✅ | `ce-performance-reviewer` | remove | Duplicate with performance-oracle; one performance lens is enough. |
| ✅ | `ce-pr-comment-resolver` | fork | Useful subagent shape, but local resolve-pr-feedback owns PR comments. |
| ✅ | `ce-previous-comments-reviewer` | remove | Merge into resolve-pr-feedback/autoreview; standalone reviewer is noisy. |
| ✅ | `ce-product-lens-reviewer` | keep-local | Keep for product/plan pressure where relevant. |
| ✅ | `ce-project-standards-reviewer` | keep-local | Keep as repo-standard review lens. |
| ✅ | `ce-reliability-reviewer` | fork | Reliability concerns are useful, but merge into correctness/autoreview instead of a separate Plate skill. |
| ✅ | `ce-repo-research-analyst` | keep-local | Keep for repo-structure research. |
| ✅ | `ce-scope-guardian-reviewer` | keep-local | Keep for scope control. |
| ✅ | `ce-security-lens-reviewer` | fork | Plan-level security lens belongs in security-triage/review packs. |
| ✅ | `ce-security-reviewer` | fork | Code security lens belongs in security-triage/autoreview. |
| ✅ | `ce-security-sentinel` | remove | Too broad; security-triage is the owner. |
| ✅ | `ce-session-historian` | fork | Session synthesis belongs in memory/learnings; no CE session skill. |
| ✅ | `ce-slack-researcher` | remove | No Slack workflow unless explicitly requested. |
| ✅ | `ce-spec-flow-analyzer` | keep-local | Keep for spec/flow completeness checks. |
| ✅ | `ce-swift-ios-reviewer` | remove | Swift/iOS not a Plate lane. |
| ✅ | `ce-testing-reviewer` | keep-local | Keep as testing-review lens. |
| ✅ | `ce-web-researcher` | fork | Structured web research belongs in slate-research/best-practices, not standalone CE. |

## Recommended Flow
- `auto` stays the only ergonomic Plate/Plite supervisor front door.
- `task` stays the normal one-shot execution skill.
- `autogoal` stays lifecycle only; no CE command should wrap or replace it.
- `autoreview` stays the only structured code-review closeout path.
- `maintainer` owns public issue/PR/security queue work.
- `autoclosure` owns post-merge/current-tree until-clean loops.
- CE command skills should not be installed as front doors. Useful CE ideas get forked into local owners above.


Implementation notes:
- No repo source files were changed beyond this goal plan and .tmp analysis artifacts.
- Future cleanup should use npx skills remove for lock-managed removals, then patch/fork local owners only where this matrix says fork.

Review fixes:
- N/A: no code review run; no implementation diff.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First Node index command placed shell redirection inside the heredoc body | 1 | Use Node fs.writeFileSync instead of shell redirection | Re-ran successfully and generated current-plugin-index.jsonl/tsv. |

Verification evidence:
- command: Node index read 82 files -> rows=82, skills=39, agents=43.
- command: Node decision matrix coverage -> rows=82, fork=29, keep-local=21, remove=32.
- source-audit: skills-lock.json read -> CE-source pinned exact local skills
  were reviewed; stale design and bug-repro entries were later cut.
- source-audit: ../compound-engineering-plugin/plugins/compound-engineering/.codex-plugin/plugin.json read -> plugin version 3.13.1 and default prompts /ce-brainstorm, /ce-plan, /ce-code-review.
- command: node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-18-ce-skill-boundary-audit.md -> pass.

Final handoff contract:
- PR line: N/A: no PR.
- Issue / tracker line: N/A: no tracker.
- Confidence line: High for classification from local source reads; medium for future cleanup effort until npx skills behavior is tested.
- Docs lane: internal skill-boundary audit.
- Source-backed claims: 82 current CE files, skills-lock, and local owner skills read.
- Content build / parser: N/A.
- Links / demos / previews: N/A.
- Browser check: N/A.
- Outcome: keep-local/fork/remove matrix and full flow recorded.
- Caveat: no skills were removed or forked in this checkpoint.
- Verified: source index + decision matrix + check-complete.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: skill cleanup not executed yet.

Timeline:
- 2026-06-18T10:13:54.452Z Goal plan filled with source-backed CE skill boundary matrix.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | CE skill boundary audit complete. |
| Where am I going? | Final response, then optional cleanup pass if user says go. |
| What is the goal? | Decide which CE skills/agents to keep-local, fork, or remove without conflicting with auto/task/autogoal/autoreview. |
| What have I learned? | CE command topology conflicts; CE leaf lenses are useful when subordinated to local owners. |
| What have I done? | Read/indexed 82 current CE plugin files and recorded decisions for every row. |

Open risks:
- Future removal/fork execution can reveal skills-lock or npx skills CLI quirks; handle in a separate cleanup goal.
