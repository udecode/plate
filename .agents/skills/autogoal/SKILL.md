---
name: autogoal
description: Manage native Codex goals requested directly or through an explicit standing user instruction, with measurable completion evidence.
---

# Autogoal

Use native goal tools when the user explicitly requests a goal, directly or through a standing instruction that covers the current request. Apply that instruction without asking again or requiring a separate skill invocation. Without such a request, an ordinary task, plan, audit, or measurable outcome does not itself authorize create_goal.

## Standing requests

The project or current conversation may record the user's request to use Autogoal for long-running work by default. Honor its exact scope. Long-running work means a substantial objective with multiple execution, investigation or verification checkpoints and an acceptance ledger, such as a large audit, multi-gap implementation, migration, or sustained investigation. It does not mean every question, small edit, slow command, or task with a time limit. No invented minute or token threshold is needed.

When that standing request applies, start or reuse the goal before extended work. If initially small work grows into that scope, apply the request then. A direct opt-out such as “no goal” wins. Keep read-only, plan-only, human-assignment and publication boundaries unchanged; the goal's completion threshold ends at the actual requested outcome. Explaining or editing a skill is not invoking that skill, though the work may independently meet the standing request.

## One goal and plan

Long-running work must not rely on Codex remembering every strict checklist across execution, interruptions and compaction. Autogoal exists to preserve those obligations and prevent premature closure. Before extended work, materialize every applicable requirement from the user, loaded skills/references and selected templates into the existing plan, with its source, evidence and unresolved state. Follow [checklist retention](references/method.md#checklist-retention) at intake, checkpoint, resume and closure. Short work still checks every applicable requirement directly; it needs no goal merely to do so.

Read an existing goal before creating one. Reuse its current plan and objective; never create competing lifecycle state. Set a token budget only when explicitly requested. Record the actual outcome, scope, completion threshold, evidence, and real blockers in one plan.

The file helpers are also usable for ordinary plans; their historical names do not create native goals:
- `node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs --template task --title "<title>" [--with <pack>] [--ticket <id>]`
- `node .agents/skills/autogoal/scripts/create-goal-template.mjs --skill <name> --from <template>`
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/<plan>.md`
- `node .agents/skills/autogoal/scripts/init-templates.mjs` only when explicit template initialization is needed.

Project templates override shared builtins. Creation keeps flags, paths and no-overwrite behavior; it never seeds unrelated templates automatically. Select only useful packs. Compact plans keep objective, threshold, verification surface, constraints, boundaries, blocked condition, checklist, evidence, risks and next action. No compulsory gate/phase/reboot tables or confidence percentages.

Follow the repository's proof and publication owners. A passing file checker proves recorded obligations are resolved; it cannot manufacture runtime, deployed, or external proof. Finish every required acceptance item, including linked child plans and applicable release obligations, before marking a goal complete.

Follow the actual goal-tool status rules. Mark blocked only after the required repeated blocking threshold and inability to make useful progress; budget exhaustion or difficulty is not a blocker. If the user resumes a blocked goal, apply the tool's fresh blocked audit. Do not mark complete merely to stop. Report final token usage when a budgeted goal is completed.

Never write memories, publish, message others, or create recurring automation merely because a goal exists.

Read [the full autogoal method](references/method.md) for its decision procedures, examples, evidence categories, and result format.
