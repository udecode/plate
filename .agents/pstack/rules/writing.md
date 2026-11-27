# Writing

This file owns how every agent writes across all lanes: short messages, public comments, long-form docs, and automated checks. The pstack block in `AGENTS.md` points here. The `sync-pstack` skill renders this file from its shared source in `udecode/ustack`, so change it there.

- **Writing.** Plain, direct, no AI tells (`pstack:unslop` patterns) across every lane.
  - Lead with the answer, result or decision, then the reason. A final reply opens that way too, without the goal restatement poteto-mode asks of a final report.
  - Keep names, commands, numbers and scope exact. Say who does what, and keep proposed, running, done and verified apart.
  - Never estimate how long work will take, such as in hours, days or weeks, because agents do the work (owner's word, 2026-11-17). Size work by its steps, cost or risk, and give a date only when quoting someone who set it. This covers work, not a command's run time, which the Time budget rule bounds.
  - Keep humor and swearing for the owner's own chats.
- **Messages mode (chat replies, Slack, Discord, email, GitHub issues, discussions, PR comments and reviews).** Write like one human talking to another (`pstack:bro`): short, plain and casual. Lead with the point in one or two sentences, then only what the reader needs to act. No greetings, thanks, sign-offs, filler, headings, or canned sentence macros (never write robotic phrasing such as `"this asks about X, which Y replaced"`). Natural casual phrasing beats stiff textbook sentences.
  - **Public messages** (GitHub issues, discussions, PR comments and reviews): name no internal skill, playbook, plan, card or private path, and post only as the Messages rule allows. Never promise `"is planned"` unless the work is actually scheduled; say `"not in <release> yet, keeping this open to track interest"` when leaving a request open. Pass the project's truth gate before claiming a fix. Keep only machine-parsed tokens a playbook requires (such as `Fixed in <commit>.` or a triage marker), never rigid prose templates.
  - **Voice examples** (match this directness, not literal wording):
    - `widget-kit.tsx is missing 'use client'`
    - `Could you set the changeset to patch instead of major?`
    - `In the new beta, decorateDeps is replaced by read and observe on decorate. Docs: [Plugin properties](...)`
    - `Not supported on the beta yet, keeping this open to track interest.`
    - `Not sure what the standard is here. Notion keeps new lines in one paragraph, so let's add an option for now.`
- **Long-form mode (docs, plans, RFCs, PR descriptions, commit bodies).** Apply full `pstack:unslop` discipline:
  - Use the fewest words that keep every fact the reader needs, with one idea per sentence and full subjects, verbs and articles.
  - Give each thing one name, explain an unfamiliar term once, and repeat a noun when a pronoun could point to several.
  - Put a condition before the action it governs and a limit beside the claim it qualifies.
  - Draft docs, readmes, plans, RFCs and PRDs with `pstack:technical-writing` as reference (STE numbered commands for reader steps) and the project's docs skill when one owns that path. Draft skills, rules and `AGENTS.md` with `plugin-dev:skill-development`.
- **Readers.** Mode sets the voice; the reader sets the wrapper.
  - The owner, in a reply, gets the Opening bro summary and Links in replies rules below.
  - A teammate, in Slack, Discord or a bot answer, gets one short post with no summary block and no link list.
  - Public readers get Public messages rules above and no internal jargon.
  - Future readers of docs, plans, commits and PRs get Long-form mode and its writing pass below.
- **Links in replies.** Always link every GitHub issue, discussion, PR, commit, and web URL whenever a link exists or can be constructed (e.g. `[discussions#3714](https://github.com/udecode/plate/discussions/3714)`, `[plate-private#196](https://github.com/udecode/plate-private/issues/196)`, `[#5349](https://github.com/udecode/plate/pull/5349)`). Never print bare `#123` or `discussions#123` without a link. Link issues, discussions, PRs, and pages inline where mentioned (especially in lists/tables) instead of dumping orphan links at the bottom (owner's word, 2026-11-27). Keep a compact turn-scoped bottom list for files, commits, and sessions not linked inline (local first, then external; never dump earlier turns' commits or removed worktree files). Format pages `📄 <url>`, commits `📦 [<subject>](https://diffshub.com/<owner>/<repo>/commit/<sha>)` (`📦 [<repo>: <subject>](...)` outside the current repo; unpushed commits keep short sha only), and issues/PRs `[owner/repo#123](<url>)`. Omit the bottom list if empty.
- **Opening bro summary.** Applies automatically to every hand-back to the owner unless the request sets a tight reply shape, such as a one-line cap or a quick one- or two-sentence answer (owner's word, 2026-11-27). Open right at the top in plain `/bro` speech, like one person catching up another, so the owner can stop reading after the first few lines:
  - First sentence: whether anything waits on the owner (or `"Nothing waits on you."`) plus the headline outcome.
  - 1 to 4 short bullets saying what actually changed for users or the owner in plain everyday words: no file paths, no commit hashes, no function, prop or class names, no test counts, and no `X + Y: done` colon tags.
  - Any call waiting on the owner goes right after those bullets, with the options, the lead's pick and the risk.
  - Below the opening block, add a short `**Details.**` section only when technical context helps, with the exact code symbols, commits and checks that proved it. Keep exact names, commands and numbers in `Details`, never inside the opening `/bro` block.
  - Never append a bottom `**Summary.**` block. Even when the request sets a tight reply shape, still end with this turn's link list when the Links in replies rule applies.
- **Routing and passes.** A skill the user names wins (`"bro"` runs `pstack:bro` on the last message; catch-ups use `pstack:ketchup`). Run each writing pass once per batch of work, never once per edit, with the skill loaded:
  - **Messages** (chat replies, Slack, Discord, public comments): write clean in Messages mode with no separate `unslop` pass, then run `writing-check.mjs` on anything another person reads.
  - **Product code:** `deslop`, then `no-comments`, once over changes since the last pass before review or hand-back (on panel-round fixes, run `no-comments` only if the diff touches comments).
  - **Long-form** (docs, plans, agent files, commit bodies, PR text): one `unslop` pass after drafting (skip mechanical bookkeeping). Run writing passes and review fixes before expensive runtime proofs.
- **Check.** `node .agents/pstack/writing-check.mjs [file...]` reads the files, or standard input without one. It prints one row for each rule a line breaks: a long dash, a hyphen used as a dash, a curly quote, the word `seam`, a chatbot opener or sign-off, a filler phrase, or unslop's AI-vocabulary and "is" lists (such as `pivotal` or `serves as`). It exits 1 on findings and 2 on read errors, skipping code spans and closed fenced blocks. Run it on text another person reads before sending (other than a reply to the owner) and fix every line it prints. land.mjs runs it on the commit message and refuses a message that fails.
