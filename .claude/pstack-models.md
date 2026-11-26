# pstack model configuration

This project's sheet. In this repository it replaces the user's pstack-models.md; ignore that sheet's lines. In a trunk project, a person's own `.claude/pstack-models.local.md` changes these lines for that person, as AGENTS.md says.

sync-pstack renders this file into every pstack project as `.claude/pstack-models.md`, so every teammate's Claude Code session runs the same models. In a trunk project, a teammate whose account lacks one of these models puts the replacement line in that local file. A change for every teammate goes in the shared copy in the dotai checkout, not this file, because the next sync overwrites it. A Codex lead still reads `~/.codex/pstack-models.md`.

Owner choice (2026-11-20): the roles follow upstream pstack's defaults (cursor/plugins v0.15.46), with Codex seats where upstream seats Fable. The code roles and judgment run on Opus at the session's effort, as pstack-claude runs them, and never below `default effort`, as the block's Helper effort rule says. Swarm workers run on Opus at high. The interrogate panel seats Opus and gpt-6.2-astra at high and Gemini 4 Neon at xhigh. The arena runners are Fable at high and gpt-6.2-sol and Gemini 4 Neon at xhigh, because an arena runs only for a large or contested design and Fable has its own weekly limit. Every Gemini 4 Neon seat runs at xhigh (owner's word, 2026-11-25). In a trunk project, the `co-lead` line is the one Gemini 4 Neon conversation that a playbook run keeps for its research, design sketches, code that is not UI and proof, and it falls back to Opus at high, as the Neon co-lead rule says (owner's word, 2026-11-25). A lead that resumes its own co-lead's conversation drives no other session. A panel seats three models and never both Sol and Astra. Each Codex seat names a fallback after `or`: Astra falls back to Fable and Sol to Opus, so a teammate without Codex still gets a full panel and arena, and a Codex seat whose usage limit ran out runs on its fallback instead of being skipped (owner's word, 2026-11-20). `seats.mjs` skips a seat whose provider refuses the prompt, a Codex seat whose usage limit ran out and that names no fallback, and a Gemini 4 Neon seat that fails for any reason, such as a usage limit, and the round passes when another seat answers. A `codex:<model> @<effort>` seat runs read-only and an `agy:<model> @<effort>` seat writes only its scratch folder, both through `node .agents/pstack/cross.mjs`, as the Panel review rule in AGENTS.md describes. The arena cross-judge pool is Opus at high and Gemini 4 Neon at xhigh, so a judge from a second family scores the candidates. Strongest judgment runs on Fable at high, only when the owner names it or after two Opus xhigh runs of one brief fail their check. There is no `architect runners` or `how explorer` line: `architect` is pstack's own sketch, with an arena for a large or contested design. The video-transcripts skill's Frames fallback subagent runs on Opus at `medium`, below `default effort`, because the lead checks its lines against the frames. The helper that records a landing's demo clip runs on Opus at `medium`, below `default effort` (owner's word, 2026-11-20). Recording a clip is mechanical, each call of a long lead session re-reads its whole context, and the lead reads the clip's stills before it posts. Never dispatch sonnet or haiku.

feature, refactoring: opus
bug-fix: opus
perf-issue: opus
hillclimb: opus
judgment and prose: opus
strongest judgment: fable @high
arena runners: fable @high, codex:gpt-6.2-sol @xhigh or opus @high, agy:gemini-4-neon @xhigh
arena cross-judge pool: opus @high, agy:gemini-4-neon @xhigh
swarm workers: opus @high
co-lead: agy:gemini-4-neon @xhigh or opus @high
interrogate reviewers: opus @high, codex:gpt-6.2-astra @high or fable @high, agy:gemini-4-neon @xhigh
video transcripts: opus @medium
clip: opus @medium
default effort: high
session hook: on
