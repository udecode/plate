# Consolidate React UI skills

Objective:
- Make `plate-ui` the sole Plate-specific React/component doctrine owner, remove the redundant `react`, `react-useeffect`, and `components` skills, and regenerate agent mirrors without migrating production source.

Goal plan:
- `docs/plans/2026-08-16-consolidate-react-ui-skills.md`

Task source:
- Direct user request in the current task.
- Acceptance: all Plate-specific UI overrides live in `plate-ui`; new component-family, React 19, primitive, and factory laws are written directly there; redundant skills are removed; advisory Vercel rules are bounded; worker skills route to the owner; no `packages/**`, `apps/www/**`, `content/**`, or templates are migrated.

Timed checkpoint:
- N/A: no duration or retry-loop threshold was requested.

Completion threshold:
- Source rules encode one unambiguous ownership chain, versioned migration doctrine records the new contract, `pnpm install` removes/regenerates the expected skill mirrors, stale-reference audits find no deleted skill or vendored-reference dependency, and the autogoal completion checker passes.

Verification surface:
- `pnpm install`; Plate Next version validation and doctrine fingerprint; focused formatting; skill-cleaner inventory; source/generated mirror audit; stale-reference `rg` queries; agent-native review; autogoal completion checker.

Constraints:
- Use `.agents/AGENTS.md` and `.agents/rules/**` as source of truth; never hand-edit generated `SKILL.md` mirrors.
- Keep Vercel React skills as advisory pattern sources, not Plate public-API owners.
- Put Plate-specific override law directly in `plate-ui`; downstream skills may route and enforce but must not copy the doctrine.
- Do not migrate production React/package/registry source in this task.
- Do not create a changeset, registry changelog, commit, PR, or tracker mutation.

Boundaries:
- Source of truth: `.agents/rules/plate-ui.mdc` and its small owned rules, with durable taste in `docs/vision/plate.md` and migration enforcement in `plate-next`.
- Allowed edit scope: `.agents/**`, `docs/vision/plate.md`, `docs/plans/2026-08-16-consolidate-react-ui-skills.md`, `skills-lock.json`, and the skill-distribution manifest `tooling/preset/preset.toml`.
- Browser surface: none; this changes agent doctrine only.
- Tracker sync: N/A; the task is local and has no external tracker.
- Non-goals: production source migration, React peer dependency changes, component rewrites, package API changes, generated application contracts, template edits, or browser QA.

Output budget strategy:
- Read targeted ranges and cap command output; use exact `rg` patterns instead of broad repository dumps.

Blocked condition:
- Stop only if the repository generator cannot remove or regenerate the deleted skill mirrors without hand-editing generated output, or if current source ownership contradicts `.agents/AGENTS.md`.

Task state:
- task_type: agent doctrine consolidation
- task_complexity: medium
- current_phase: closeout
- current_phase_status: complete
- next_phase: final handoff
- goal_status: complete

Current verdict:
- verdict: accepted
- confidence: high
- next owner: `plate-ui`
- reason: one Plate-specific UI owner prevents contradictory React/component laws while retaining focused external performance/composition advice.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Scope, non-goals, deliverables, and proof are copied above |
| Timed checkpoint parsed | no | No duration requested |
| Skill analysis before edits | yes | Read `plate-ui`, `components`, `react`, `react-useeffect`, both Vercel skills, `plate-plugin-creator`, `plate-next`, `vision`, `docs-creator`, `skill-cleaner`, `agent-native-reviewer`, and `autogoal` |
| Active goal checked or created | yes | Active goal points to this plan |
| Source of truth read before edits | yes | `.agents/AGENTS.md` and relevant rule owners read |
| Tracker comments and attachments read | no | No tracker or attachment owns this request |
| Video transcript evidence required | no | No video supplied |
| `docs/solutions` checked | no | Agent doctrine task has no behavior bug to match |
| TDD decision | no | No runtime behavior changes |
| Branch decision | no | User did not request git mutation |
| Release artifact decision | no | Agent/docs-only change has no package release artifact |
| Browser tool decision | no | No browser surface changes |
| PR expectation decision | no | No PR requested |
| Tracker sync expectation decision | no | No tracker exists |
| Output budget strategy recorded | yes | Targeted and capped reads recorded above |
| Agent-native pack selected | yes | Agent rules, skills, routing, and generated mirrors change |
| Agent-facing action surface identified | yes | `plate-ui` is the master entrypoint |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`; regenerate `.agents/skills/**` with install |
| `agent-native-reviewer` loaded | yes | Review contract read before edits |
| Docs pack selected | yes | Durable Plate Vision wording changes |
| `docs-creator` loaded | yes | Current-state reference voice applies |
| Docs lane selected | yes | Internal architecture/vision lane |
| Target docs and nearest sibling docs read | yes | Relevant Plate Vision and adjacent UI ownership text read |
| Docs style doctrine read | yes | `.agents/AGENTS.md` technical prose and docs rules read |
| Documented source owner identified | yes | `docs/vision/plate.md` owns durable Plate taste |

Work Checklist:
- [x] Every explicit prompt requirement, scope boundary, deliverable, and success criterion is captured above.
- [x] The objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] The task source and root ownership layer are identified.
- [x] Video evidence is N/A because no video was supplied.
- [x] Nearby repo instructions and implementation patterns were read before edits.
- [x] `plate-ui` directly owns the final React 19, component-family, headless primitive, factory/HOC, and Vercel-advisory laws.
- [x] `react`, `react-useeffect`, and `components` source/install ownership is removed without hand-editing generated mirrors.
- [x] Downstream worker skills route to and enforce `plate-ui` without copying its doctrine.
- [x] Durable Vision and the Plate Next version ledger reflect the accepted contract.
- [x] `pnpm install` regenerates agent mirrors and removes obsolete generated skills.
- [x] Focused formatting, doctrine validation, source audits, skill inventory, and agent-native review pass.
- [x] Release artifacts, browser proof, package typecheck, TDD, PR, and tracker sync are N/A because no product/runtime/public package surface changes.
- [x] Workspace authority is `/Users/zbeyens/git/plate-2` for every proof command.
- [x] High-risk note: bad routing could silently resurrect contradictory UI doctrine; proof checks both source and generated discoverability.
- [x] P2 autoreview is N/A for a doctrine-only consolidation; agent-native review is the owning review gate.
- [x] Output is scoped and capped rather than streamed broadly.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run every command named in Verification surface | Doctrine checks, mirror checks, stale audits, inventory, and formatting passed |
| Bug reproduced before fix | no | No behavior bug | Doctrine consolidation only |
| Targeted behavior verification | no | No runtime behavior changed | Source and mirror audits own proof |
| TypeScript or typed config changed | no | No TypeScript config | Agent Markdown/JSON only |
| Package exports or file layout changed | no | No package file layout | `pnpm brl` is N/A |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` | Skills lock and generated mirrors are in scope |
| Agent rules or skills changed | yes | Run `pnpm install` and verify mirrors | Required after rule edits |
| Workspace authority proof | yes | Run proof from repo root | `/Users/zbeyens/git/plate-2` |
| Browser surface changed | no | No browser proof | Agent doctrine only |
| Browser final proof | no | No browser proof | Agent doctrine only |
| CI-controlled template output changed | no | Do not touch templates | Templates are out of scope |
| Package behavior or public API changed | no | No changeset | No package source changes |
| Registry-only component work changed | no | No registry changelog | Registry source is out of scope |
| Docs or content changed | yes | Verify current-state internal Vision claims | No MDX/content change |
| High-risk mini gate | yes | Audit owner routing and generated discoverability | Contradictory doctrine is the realistic failure mode |
| Agent-native review | yes | Close actionable findings | Owning review gate |
| Local install corruption suspected | no | Reinstall only if matching signals appear | No signal observed |
| P2 autoreview | no | Agent-native review substitutes for doctrine-only change | No production implementation |
| PR create or update | no | No PR | User did not request it |
| Tracker sync-back | no | No tracker | Local task only |
| Final lint | yes | Run focused formatter/lint | Biome checked four supported JSON/JS files with no fixes |
| Output budget discipline | yes | Keep commands targeted and capped | Followed throughout |
| Timed checkpoint | no | No timed loop | N/A |
| Goal plan complete | yes | Run autogoal checker | Final command follows this plan update |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Requirements and owners captured | implementation |
| Implementation | complete | One owner, three removals, routing and version updates applied | verification |
| Verification | complete | Install, mirrors, doctrine, inventory, stale audit, and lint passed | closeout |
| PR / tracker sync | complete | N/A by explicit boundary | closeout |
| Closeout | complete | Evidence recorded and checker is the final gate | final response |

Findings:
- Three separate skills currently teach overlapping React/component doctrine.
- `plate-ui` also vendors copies of the monolithic React and component references, creating four potential drift points.
- Performance rules can cite exact Vercel rules directly; Plate-specific API and ownership decisions belong only to `plate-ui`.

Decisions and tradeoffs:
- Keep Vercel skills installed as advisory sources; delete local/external skills that duplicate the owning Plate UI contract.
- Put exact public component laws in `plate-ui`; worker skills contain only routing and audit checks.
- Record the contract in Vision and Plate Next, but defer all production migration.

Implementation notes:
- Deleted `.agents/rules/react.mdc`, `.agents/rules/components.mdc`, both vendored `plate-ui` monolith references, and the unmanaged installed `react-useeffect` files.
- Removed `react-useeffect` from `skills-lock.json` and removed deleted rule inputs from `tooling/preset/preset.toml`.
- Added Plate Next doctrine v86 and expanded fingerprint/resource sync to every owned `plate-ui` rule plus the performance effect resource.
- Production source and CI-controlled templates were not edited.

Review fixes:
- Tightened one ambiguous phrase so direct component files may call React/Plate hooks but do not own named reusable custom hooks.
- Verified `best-api` contains no conflicting React/component topology doctrine, so no edit was required there.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

Verification evidence:
- `pnpm install` passed twice after the final source edits; Skiller regenerated Codex/Claude mirrors and resource sync passed.
- Doctrine-specific check: declared version `86`, registry latest `86`, entry version `86`, fingerprint match `true`, required resources `true`, required skills `true`.
- `node .agents/rules/plate-next/scripts/sync-resources.mjs --check` passed.
- `pnpm exec biome check` passed for the four supported changed JSON/JS files; focused `--write` produced no fixes.
- Skill cleaner reports 108 live skills, down from 111; `react`, `components`, and `react-useeffect` are absent.
- Deleted-owner, lock, routing, stale-source, and stale-generated audits all passed with zero rejected references.
- Full Plate Next registry validation reaches only unrelated checkout drift: missing tracked `docx-export`, `docx-import`, `docx-paste`; unenrolled/missing-path `docx-io`.

Reboot status:
- Active task state is stored in this plan and the autogoal; no reboot or continuation occurred.

Open risks:
- Production React/component migration is deliberately a later task. CI-controlled template mirrors still reflect the current generated snapshot and must be regenerated by CI from the repaired preset, never edited manually.
- The unrelated docx package-ledger mismatch prevents the all-package Plate Next validator from being globally green; doctrine-specific v86 validation is green.

Final handoff contract:
- PR line: N/A; no PR requested.
- Issue / tracker line: N/A; no tracker.
- Confidence line: high; exact source/mirror/version checks passed.
- Browser check: N/A; no browser-facing files changed.
- Outcome: `plate-ui` is the sole owner; `react`, `components`, and `react-useeffect` are removed.
- Caveat: production source migration is explicitly deferred.
- Design: Plate-specific React/component overrides belong to `plate-ui`; external Vercel skills remain narrow advice.
- Verified: install, mirror parity, v86 fingerprint, skill inventory, stale-reference audits, and focused lint passed.
