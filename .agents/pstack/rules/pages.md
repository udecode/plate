# Plans and hand-backs

This file says how plans and topic files stay structured in git, how hand-back replies read, and how PR bodies render from plans. The pstack block in `AGENTS.md` points here. Edit its shared source in `udecode/ustack`.

- **Plans and topics.** Committed Markdown plan files (`docs/plans/<YYYY-MM-DD>-<slug>.md`) and topic files (`docs/plans/topics/<slug>.md`) are the record. Every revisited scope keeps one topic file holding current state; each subsequent plan carries only its delta (`Topic: <slug>` and `Playbook: <name>` under `Status:`).
  - **PR bodies.** When opening a PR, `land.mjs` uses the changed dated plan's Markdown directly (stripping YAML frontmatter) if one dated plan changed, or the commit body (`## Why` and `## Verification`) otherwise. Keep follow-up comments on someone else's PR concise plain Markdown.
  - **Defaults vs Open questions.** For noticeable calls outside the Autopilot stop list, pick the recommended option, add a `## Defaults` row (`Decision | Pick | Alternative | Word | Impact`), and keep going. Never default an option that leaves the user's goal unmet. Check prior art and shipped product docs before asking or running `architect` on an integration. Only Autopilot stops and held external drafts go under `## Open questions` (and to `AskUserQuestion` where supported, recommended option first). "go" accepts recommended options except production deploys or releases, which always need an explicit answer.
  - **Close.** The plan's `## Close` records what landed, proof and limits, reversals first, and open work with `owner:` and `stop:`.
- **Hand-back reply.** Hand back directly in the chat reply (never render or publish an HTML plan page; use T3's `html_render` only when a chart, diagram, or side-by-side comparison genuinely benefits from HTML). Open with the Opening bro summary from `writing.md` (plain `pstack:bro` catch-up at the top, with no file paths or code symbols there), then put technical specifics in `**Details.**` below when needed:
  - What changed and why, with plan and topic file paths in Details or the link list.
  - Each public API change (before and after).
  - Any comparison made (such as a verdict against other editors).
  - Any demo clip or before-and-after image recorded during the run (such as via `clip` or a plan's `Demo:` step), embedded directly in the final chat reply (`![caption](/abs/path/to/clip.mp4)` or `.png` in T3 Code) in addition to any team `shots.md` handoff.
  - Noticeable picks with the word that reverses each.
  - What waits on the owner (right after the opening bullets) and proof limits.
  - This turn's link list.
