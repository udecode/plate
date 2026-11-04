# Writing

This file says how an agent's writing reads, what each reader and kind of text adds to it, and how to check text before it goes out. The pstack block in `AGENTS.md` points here. The `sync-pstack` skill renders this file from its shared source in `udecode/dotai`, so change it there.

- **Writing.** Every reply, message, comment, commit and document has one voice. Say it plainly, like one human talking to another, as `pstack:bro` asks, and draft with none of `pstack:unslop`'s patterns.
  - Lead with the answer, result or decision, then the reason. A final reply opens that way too, without the goal restatement poteto-mode asks of a final report.
  - Use the fewest words that keep every fact the reader needs, and give each sentence one idea with its subject, verb and articles.
  - Give each thing one name, and explain an unfamiliar term once.
  - Make each pronoun point to one obvious noun, and repeat the noun when it could point to several.
  - Say who does what, and keep proposed, running, done and verified apart.
  - Put a condition before the action it governs and a limit beside the claim it qualifies.
  - Write steps a reader follows as numbered commands, one action each.
  - Keep names, commands, numbers and scope exact when you simplify.
  - Keep humor and swearing for the owner's own chats.
- **Readers.** The voice stays the same for every reader, and the shape follows the reader.
  - The owner, in a reply, gets the Links in replies and Closing summary rules below.
  - A teammate, in a chat message, a team notification or a bot answer, gets one post when it fits, with no summary block and no link list.
  - Anyone, on a public issue, PR, review or comment, gets text that names no internal skill, playbook, plan, card or private path, sent only as the Messages rule allows.
  - A future reader, in a doc, plan, commit or PR, gets the block's Writing passes.
- **Links in replies.** A reply or report names each file, commit, PR, issue and page in its text without a link, and ends with one list of those links, local ones such as files and sessions first, then external ones (owner's word, 2026-10-21). A reply sent after its session removed its worktree links no file in that worktree. A page is `📄 <url>`, a commit `📦 [<subject>](https://diffshub.com/<owner>/<repo>/commit/<sha>)`, or `📦 [<repo>: <subject>](...)` outside the current repository, and a PR or issue `[owner/repo#123](<url>)`, so the owner tells them apart at a glance (owner's word, 2026-10-20). A commit that no remote holds yet keeps its short sha in the text and gets no link. A reply with no links has no list.
- **Closing summary.** When the request does not set the reply's shape, such as with a line cap, a reply that ends a turn and runs past about 150 words gives its detail after the result it opens with. It ends, just above its link list, with a summary that opens with a bold **Summary.** and follows the shape of the `pstack:ketchup` skill's Write the reply section. Its first sentence names what waits on the owner or says nothing does. Then it gives one line per thing the owner asked for, with its state, such as done, running, failed or not checked, and each call the owner must make, with the lead's pick and its risk (owner's word, 2026-10-27). A line another rule puts just above the links, such as the `chips` skill's Close line, goes last in that summary. A reply whose shape the request sets still ends with its link list, as the Links in replies rule says.
- **Routing.** The kind of text picks the skill it adds on top of the voice, and a skill the user names wins.
  - A reply or chat message adds nothing, and the lead writes it clean as drafted with no separate unslop pass, a planless run's closing reply included.
  - A catch-up takes the shape of `pstack:ketchup`'s Write the reply section, and a hand-back long enough for the Closing summary rule ends with a summary in that shape.
  - "bro", or a request to say something plainly, runs `pstack:bro` on the last message.
  - A doc, readme, plan, RFC or PRD drafts with `pstack:technical-writing` as its reference, and with the project's docs skill when one owns that path.
  - Steps a reader follows use technical-writing's STE rules.
  - A skill, a rule file or `AGENTS.md` drafts with `plugin-dev:skill-development`.
  - The path settles the kind when it can, such as `SKILL.md` or a file under `.agents/` for agent text.
- **Check.** `node .agents/pstack/writing-check.mjs [file...]` reads the files, or standard input without one. It prints one row for each of these that a line holds, with the text that matched: a long dash, a hyphen used as a dash, a curly quote, the word `seam`, a chatbot opener or sign-off, a filler phrase, or a word from the part of unslop's AI-vocabulary and "is" lists that has no common literal use in code, such as `pivotal` or `serves as`. It exits 1 when it prints any and 2 when it cannot read a file. It skips code spans and closed fenced blocks, so a literal character or a command goes in backticks. Run it on text another person reads before you send it, other than a reply to the owner, and fix each line it prints. It catches only those words and characters, so the voice and the shapes above stay the writer's job. land.mjs runs it on the commit message and refuses a message that fails.
