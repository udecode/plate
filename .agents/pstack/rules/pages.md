# Plans and hand-backs

This file says how plans and topic files stay structured in git, how hand-back replies read, and how PR bodies render from plans. The pstack block in `AGENTS.md` points here. Edit its shared source in `udecode/ustack`.

- **Plans and topics.** Committed Markdown plan files (`docs/plans/<YYYY-MM-DD>-<slug>.md`) and topic files (`docs/plans/topics/<slug>.md`) are the record. Every revisited scope keeps one topic file holding current state; each subsequent plan carries only its delta (`Topic: <slug>` and `Playbook: <name>` under `Status:`).
  - **PR bodies.** When opening a PR, `land.mjs` uses the changed dated plan's Markdown directly (stripping YAML frontmatter) if one dated plan changed, or the commit body (`## Why` and `## Verification`) otherwise. Keep follow-up comments on someone else's PR concise plain Markdown.
  - **Defaults vs Open questions.** For noticeable calls outside the Autopilot stop list, pick the recommended option, add a `## Defaults` row (`Decision | Pick | Alternative | Word | Impact`), and keep going. Never default an option that leaves the user's goal unmet. Check prior art and shipped product docs before asking or running `architect` on an integration. Only Autopilot stops and held external drafts go under `## Open questions` (and to `AskUserQuestion` where supported, recommended option first). "go" accepts recommended options except production deploys or releases, which always need an explicit answer.
  - **Close.** The plan's `## Close` records what landed, proof and limits, reversals first, and open work with `owner:` and `stop:`.
- **Hand-back reply.** Hand back directly in chat (never render or publish an HTML plan page; use T3's `html_render` only when a chart, diagram, or side-by-side comparison genuinely benefits from HTML). Keep hand-backs short, scannable, and mobile-friendly (under ~25-30 lines when possible; never dump long `Details.` essays of internal file lines, line numbers, or test counts into chat, because internal plumbing belongs in the committed plan `.md`, not chat) (owner's word, 2026-11-28). Follow this exact order:
  - **1. Plain opening summary.** 2 to 4 short plain-English bullets (per `writing.md`'s Opening bro summary) saying what is broken or what changes for users and apps: zero code symbols, file paths, commit hashes, or test counts.
  - **2. Public API (`diff` block).** Only real public packages, hooks, options, or UI components added, renamed, or deleted, shown in a fenced `diff` code block (`-` before / `+` after), never a Markdown table (so it reads cleanly on mobile). Omit completely when no public API changes.
  - **3. Media and compact links.** Any demo clip or before-and-after image recorded during the run (via `clip` or a plan's `Demo:` step), embedded directly (`![caption](/abs/path/to/clip.mp4)` or `.png` in T3 Code, in addition to any team `shots.md` handoff), plus compact links (plan/topic files, commits, and any brief verdict comparison or proof limit).
  - **4. Your decisions (always at the very end, right above the reply box).** Only genuine owner calls (`answer` / `look`); omit minor `safe` picks the owner trusts you on. Never cram a decision into one dense line. Format each call as a scannable 4-line bullet block, ending with `Reply "go" to accept all defaults.` (omit this section completely when nothing waits on the owner):

```markdown
1. **<Short decision title>**
   - **Before:** <what exists today>
   - **Pick (default):** <recommended change>
   - **Why you:** <exact reason it needs owner sign-off: e.g. repeals a Vision rule, breaks N callers, changes visible UX>
   - **Alt (`<word>`):** <alternative and what it trades off>
```
