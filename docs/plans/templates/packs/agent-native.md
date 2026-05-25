# agent-native pack

Use this pack when work changes `.agents/**`, `.claude/**`, `.codex/**`, skills,
hooks, commands, prompts, or user actions an agent should perform.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Agent-native pack selected | pending | pending |
| Agent-facing action surface identified | pending | pending |
| Source rule versus generated mirror boundary identified | pending | pending |
| `agent-native-reviewer` loaded or waiver recorded | pending | pending |

Work Checklist:
- [ ] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [ ] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [ ] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [ ] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Agent source / generated sync | pending | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | pending |
| Agent action discoverability | pending | Source-audit the skill/rule path an agent will read | pending |
| Agent-native review | pending | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | pending |
