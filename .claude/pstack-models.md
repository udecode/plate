# pstack model configuration

This project's sheet. In this repository it replaces the user's pstack-models.md; ignore that sheet's lines. In a trunk project, a person's own `.claude/pstack-models.local.md` changes these lines for that person, as AGENTS.md says.

sync-pstack renders this file into every pstack project as `.claude/pstack-models.md`, so every teammate's Claude Code session runs the same models. In a trunk project, a teammate whose account lacks one of these models puts the replacement line in that local file. A change for every teammate goes in the shared copy in the ustack checkout, not this file, because the next sync overwrites it. A Codex lead still reads `~/.codex/pstack-models.md`.

Owner choice (2026-11-27): the roles follow upstream pstack's defaults (cursor/plugins v0.15.46), with Codex and Gemini 4 Neon seats for multi-family diversity. Antigravity (`gemini-4-neon @high`) is the default lead across all projects; native Antigravity `invoke_subagent` calls always use `inherit` (never `pro`, `flash`, or `flash_lite`). When leading in Claude Code, roles run on Opus at the session's effort unless a lower-effort lane applies.

Effort tiers:
- `medium`: `operator` and routine Local CI fixers (lint, typecheck, stale tests, simple flakes), docs/registry/changelog/sync work, read-only evidence/research subagents, `clip`, and `video transcripts` (lead still checks frames, stills, or extracted spans).
- `high`: `feature`, `refactoring`, `bug-fix`, `perf-issue`, `hillclimb`, plans, verdicts, UI/visual (`opus @high`), `arena cross-judge pool`, and `interrogate reviewers` panels.
- `xhigh`: `arena runners` (Sol and Neon), `strongest judgment` (`agy:gemini-4-neon @xhigh`, only when named or after two `high` attempts fail), and stuck debugging after `high` fails to crack root cause (or deep architectural pivots).

Swarm workers inherit parent at `high`. A panel seats three distinct families at `high`: `fable @high`, `codex:gpt-6.2-sol @high or opus @high`, and `agy:gemini-4-neon @high`. Arena runners seat `fable @high`, `codex:gpt-6.2-sol @xhigh or opus @high`, and `agy:gemini-4-neon @xhigh` because arenas run only for large or contested designs. Each Codex seat names an `or` fallback so a teammate without Codex or out of Codex quota still gets a full panel or arena (owner's word, 2026-11-20). `seats.mjs` skips a seat whose provider refuses the prompt, a Codex seat out of quota without a fallback, and a Gemini 4 Neon seat that fails, and the round passes when another seat answers. `codex:<model> @<effort>` runs read-only and `agy:<model> @<effort>` writes only its scratch folder via `node .agents/pstack/cross.mjs`. The arena cross-judge pool is Opus at `high` and Gemini 4 Neon at `high`. There is no `architect runners` or `how explorer` line: `architect` is pstack's own sketch, with an arena for a large or contested design. Never dispatch sonnet, haiku, pro, flash or flash_lite.

feature, refactoring: inherit-parent
bug-fix: inherit-parent
perf-issue: inherit-parent
hillclimb: inherit-parent
judgment and prose: inherit-parent
strongest judgment: agy:gemini-4-neon @xhigh
ui, visual: opus @high
arena runners: fable @high, codex:gpt-6.2-sol @xhigh or opus @high, agy:gemini-4-neon @xhigh
arena cross-judge pool: opus @high, agy:gemini-4-neon @high
swarm workers: inherit-parent @high
interrogate reviewers: fable @high, codex:gpt-6.2-sol @high or opus @high, agy:gemini-4-neon @high
operator, routine local ci: inherit-parent @medium
docs, registry, sync: inherit-parent @medium
evidence, research: inherit-parent @medium
video transcripts: opus @medium
clip: agy:gemini-4-neon @medium
default effort: high
session hook: on
