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
  - The owner, in a reply, gets the Links in replies and Closing summary rules below.
  - A teammate, in Slack, Discord or a bot answer, gets one short post with no summary block and no link list.
  - Public readers get Public messages rules above and no internal jargon.
  - Future readers of docs, plans, commits and PRs get Long-form mode and its writing pass below.
- **Links in replies.** A reply or report names each file, commit, PR, issue and page in its text without a link, and ends with one list of those links, local ones such as files and sessions first, then external ones (owner's word, 2026-10-21). A reply sent after its session removed its worktree links no file in that worktree. A page is `📄 <url>`, a commit `📦 [<subject>](https://diffshub.com/<owner>/<repo>/commit/<sha>)`, or `📦 [<repo>: <subject>](...)` outside the current repository, and a PR or issue `[owner/repo#123](<url>)`, so the owner tells them apart at a glance (owner's word, 2026-10-20). A commit that no remote holds yet keeps its short sha in the text and gets no link. A reply with no links has no list.
- **Closing summary.** When the request does not set the reply's shape, such as with a line cap, a reply that ends a turn and runs past about 150 words gives its detail after the result it opens with. It ends, just above its link list, with a summary that opens with a bold **Summary.** and follows the shape of `pstack:ketchup`'s Write the reply section. Its first sentence names what waits on the owner or says nothing does. Then it gives one line per thing the owner asked for, with its state, such as done, running, failed or not checked, and each call the owner must make, with the lead's pick and its risk (owner's word, 2026-10-27). A reply whose shape the request sets still ends with its link list, as the Links in replies rule says.
- **Routing and passes.** A skill the user names wins (`"bro"` runs `pstack:bro` on the last message; catch-ups use `pstack:ketchup`). Run each writing pass once per batch of work, never once per edit, with the skill loaded:
  - **Messages** (chat replies, Slack, Discord, public comments): write clean in Messages mode with no separate `unslop` pass, then run `writing-check.mjs` on anything another person reads.
  - **Product code:** `deslop`, then `no-comments`, once over changes since the last pass before review or hand-back (on panel-round fixes, run `no-comments` only if the diff touches comments).
  - **Long-form** (docs, plans, agent files, commit bodies, PR text): one `unslop` pass after drafting (skip mechanical bookkeeping). Run writing passes and review fixes before expensive runtime proofs.
- **Check.** `node .agents/pstack/writing-check.mjs [file...]` reads the files, or standard input without one. It prints one row for each rule a line breaks: a long dash, a hyphen used as a dash, a curly quote, the word `seam`, a chatbot opener or sign-off, a filler phrase, or unslop's AI-vocabulary and "is" lists (such as `pivotal` or `serves as`). It exits 1 on findings and 2 on read errors, skipping code spans and closed fenced blocks. Run it on text another person reads before sending (other than a reply to the owner) and fix every line it prints. land.mjs runs it on the commit message and refuses a message that fails.
