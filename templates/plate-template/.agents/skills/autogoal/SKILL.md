---
name: autogoal
description: "Manage native Codex goals under a direct or standing user request, with durable acceptance and completion evidence."
---

# Autogoal

Use native goal tools when the user explicitly requests a goal, directly or through a standing instruction that covers the current request. Apply that instruction without asking again or requiring a separate skill invocation. Without such a request, an ordinary task, plan, audit, or measurable outcome does not itself authorize create_goal.

## Standing requests

The project or current conversation may record the user's request to use Autogoal for long-running work by default. Honor its exact scope. Long-running work means a substantial objective with multiple execution, investigation or verification checkpoints and an acceptance ledger, such as a large audit, multi-gap implementation, migration, or sustained investigation. It does not mean every question, small edit, slow command, or task with a time limit. No invented minute or token threshold is needed.

When that standing request applies, start or reuse the goal before extended work. If initially small work grows into that scope, apply the request then. A direct opt-out such as “no goal” wins. Keep read-only, plan-only, human-assignment and publication boundaries unchanged; the goal's completion threshold ends at the actual requested outcome. Explaining or editing a skill is not invoking that skill, though the work may independently meet the standing request.

## Pause and resume

On a direct “pause”, “stop”, or “hold”, immediately mark the existing plan `Status: Paused`, record the user's instruction, preserve open obligations and the saved next step, and make the current next action wait for explicit user resumption. Do this before a requested detour such as skill or task-history repair. A spoken acknowledgment or private note does not pause the plan.

Use a supported native pause control only when its current contract allows it, and verify the result. If none is available, record that limitation in the same plan and tell the user once; do not claim the native goal is paused, fake completion/blockage, or alter internal goal storage. End the turn promptly. Never create sleep/poll loops, repeated reminders, or another goal to manage a pause.

On automatic continuation or recovery, check the plan's pause state before selecting work. Scheduler-generated continuation is not a direct user resume. Keep paused work stopped; an explicitly requested repair may proceed within its own scope. Resume only on a direct user instruction, then update the existing plan and revalidate its saved next step. See [pause handling](references/method.md#pause-handling).

## One goal and plan

Long-running work must preserve applicable requirements across execution, interruptions and compaction. Keep each obligation once, with its source, evidence and unresolved state, in the existing plan or linked canonical ledger. Reference detailed rows instead of copying them. For multiple outcomes, use [bounded batches and evidence reuse](references/method.md#bounded-batches-and-evidence-reuse): acceptance rows are not separate execution cycles. Load methods only when their decision applies; the presence of a reference does not create another obligation. Follow [checklist retention](references/method.md#checklist-retention) at intake, material checkpoints, resume and closure. Short work checks its requirements directly without a new goal or plan.

Read an existing goal before creating one. Reuse its current plan and objective; never create competing lifecycle state. Set a token budget only when explicitly requested. Record the actual outcome, scope, completion threshold, evidence, and real blockers in one plan.

The file helpers are also usable for ordinary plans; their historical names do not create native goals:
- `node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs --template task --title "<title>" [--with <pack>] [--ticket <id>]`
- `node .agents/skills/autogoal/scripts/create-goal-template.mjs --skill <name> --from <template>`
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/<plan>.md`
- `node .agents/skills/autogoal/scripts/init-templates.mjs` only when explicit template initialization is needed.

Project templates override shared builtins. Creation keeps flags, paths and no-overwrite behavior; it never seeds unrelated templates automatically. Select only useful packs. Compact plans keep objective, threshold, verification surface, constraints, boundaries, blocked condition, checklist, evidence, risks and next action. No compulsory gate/phase/reboot tables or confidence percentages.

For multi-owner work, follow the method's eligible-owner traversal and human-help queue. Defer evidenced manual prerequisites immediately; bound unclear tool/access diagnosis to two informed attempts or ten minutes, whichever comes first. Preserve deferrals across continuations and separate iteration accounting from full-goal completion.

Follow the repository's proof and publication owners. A passing file checker proves recorded obligations are resolved; it cannot manufacture runtime, deployed, or external proof. Finish every required acceptance item, including linked child plans and applicable release obligations, before marking a goal complete.

Follow the actual goal-tool status rules. Mark blocked only after the required repeated blocking threshold and inability to make useful progress; budget exhaustion or difficulty is not a blocker. If the user resumes a blocked goal, apply the tool's fresh blocked audit. Do not mark complete merely to stop. Report final token usage when a budgeted goal is completed.

Never write memories, publish, message others, or create recurring automation merely because a goal exists.

Read only the applicable method sections when their situation occurs:

- Existing goal differs from the requested objective: [active goal conflict](references/method.md#active-goal-conflict-protocol).
- Defining a new objective or uncertain proof: [goal anatomy](references/method.md#goal-anatomy), [measurable outcomes](references/method.md#measurable-outcome-gate) and [evidence types](references/method.md#evidence-type-contract).
- Repairing broken goal state or a plan/helper contract: [repair mode](references/method.md#repair-mode).
- Pause or recovery: [pause handling](references/method.md#pause-handling) and [resume protocol](references/method.md#resume-protocol).
- Multiple owners or manual prerequisites: [bounded batches](references/method.md#bounded-batches-and-evidence-reuse).
- Creating a plan, selecting packs or interpreting a requested planning mode/time limit: [plan selection](references/plans.md). For independent child plans, use [linked plan trees](references/method.md#linked-plan-trees).
- Closing acceptance or declaring a repeated blocker: [completion rules](references/method.md#completion-rules) and [blocked rules](references/method.md#blocked-rules).
- Research outcomes: [research goals](references/method.md#research-goals).

The examples and full procedures remain available there; a routine checkpoint does not require rereading the entire reference.
