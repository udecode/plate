# Plans and hand-backs

This file says how plans and topic files stay structured in git, how hand-back replies read, and how PR bodies render from plans. The pstack block in `AGENTS.md` points here. Edit its shared source in `udecode/ustack`.

- **Plans and topics.** Committed Markdown plan files (`docs/plans/<YYYY-MM-DD>-<slug>.md`) and topic files (`docs/plans/topics/<slug>.md`) are the record. Every revisited scope keeps one topic file holding current state; each subsequent plan carries only its delta (`Topic: <slug>` and `Playbook: <name>` under `Status:`).
  - **PR bodies.** `node .agents/pstack/plan-page.mjs <plan> --pr [--public] [--into <body.md>]` renders GitHub PR Markdown from a plan (requiring `## Brief` with `### What will change?` and `### What could go wrong?`), and `--comment <author sha> [--against <description.md>]` renders a follow-up comment on someone else's PR. `--check` validates fences, `## Defaults` tables, and playbook headers; `--rail` prints stage JSON.
  - **Defaults vs Open questions.** For noticeable calls outside the Autopilot stop list, pick the recommended option, add a `## Defaults` row (`Decision | Pick | Alternative | Word | Impact`), and keep going. Never default an option that leaves the user's goal unmet. Check prior art and shipped product docs before asking or running `architect` on an integration. Only Autopilot stops and held external drafts go under `## Open questions` (and to `AskUserQuestion` where supported, recommended option first). "go" accepts recommended options except production deploys or releases, which always need an explicit answer.
  - **Close.** The plan's `## Close` records what landed, proof and limits, reversals first, and open work with `owner:` and `stop:`.
- **Hand-back reply.** Hand back directly in the chat reply in plain `pstack:bro` prose (never render or publish an HTML plan page; use T3's `html_render` only when a chart, diagram, or side-by-side comparison genuinely benefits from HTML):
  - What changed and why, with clickable plan/topic file paths.
  - Each public API change (before and after).
  - Any comparison made (such as a verdict against other editors).
  - Any demo clip or before-and-after image recorded during the run (such as via `clip` or a plan's `Demo:` step), embedded directly in the final chat reply (`![caption](/abs/path/to/clip.mp4)` or `.png` in T3 Code) in addition to any team `shots.md` handoff.
  - Noticeable picks with the word that reverses each.
  - What waits on the owner and proof limits.
  - The link list.
