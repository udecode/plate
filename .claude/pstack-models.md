# pstack model configuration

This project's sheet. In this repository it replaces the user's pstack-models.md; ignore that sheet's lines.

sync-pstack renders this file into every pstack project as `.claude/pstack-models.md`, so every teammate's Claude Code session runs the same models. A teammate whose account lacks one of these models changes the shared copy in the dotai checkout, not this file, because the next sync overwrites it. A Codex lead still reads `~/.codex/pstack-models.md`.

Owner choice (2026-11-20): the roles follow upstream pstack's defaults (cursor/plugins v0.15.46), with Codex seats where upstream seats Fable. The code roles and judgment run on Opus at the session's effort, as pstack-claude runs them, and never below `default effort`, as the block's Helper effort rule says. Swarm workers run on Opus at high. The interrogate panel seats Opus, gpt-6.2-astra and Gemini 4 Neon, each at high. The arena runners are Fable and Gemini 4 Neon at high and gpt-6.2-sol at xhigh, because an arena runs only for a large or contested design and Fable has its own weekly limit. Neon stays at high, not upstream's xhigh, because a caching issue spends too much of its limit. A panel seats three models and never both Sol and Astra. Each Codex seat names a fallback after `or`: Astra falls back to Fable and Sol to Opus, so a teammate without Codex still gets a full panel and arena, and a Codex seat whose usage limit ran out runs on its fallback instead of being skipped (owner's word, 2026-11-20). `seats.mjs` skips a seat whose provider refuses the prompt, a Codex seat whose usage limit ran out and that names no fallback, and a Gemini 4 Neon seat that fails for any reason, such as a usage limit, and the round passes when another seat answers. A `codex:<model> @<effort>` or `agy:<model> @<effort>` seat runs read-only through `node .agents/pstack/cross.mjs`, as the Panel review rule in AGENTS.md describes. The arena cross-judge pool is Opus and Gemini 4 Neon at high, so a judge from a second family scores the candidates. Strongest judgment runs on Fable at high, only when the owner names it or after two Opus xhigh runs of one brief fail their check. There is no `architect runners` or `how explorer` line: `architect` is pstack's own sketch, with an arena for a large or contested design. The video-transcripts skill's Frames fallback subagent runs on Opus at `medium`, below `default effort`, because the lead checks its lines against the frames. Never dispatch sonnet or haiku.

feature, refactoring: opus
bug-fix: opus
perf-issue: opus
hillclimb: opus
judgment and prose: opus
strongest judgment: fable @high
arena runners: fable @high, codex:gpt-6.2-sol @xhigh or opus @high, agy:gemini-4-neon @high
arena cross-judge pool: opus @high, agy:gemini-4-neon @high
swarm workers: opus @high
interrogate reviewers: opus @high, codex:gpt-6.2-astra @high or fable @high, agy:gemini-4-neon @high
video transcripts: opus @medium
default effort: high
session hook: on
