# Linked sessions

This file says how a session that another session started stays out of that session's way. The pstack block in `AGENTS.md` points here. The `sync-pstack` skill renders this file from its shared source in `udecode/dotai`, so change it there.

- **Detach.** A session that another session started, which Claude Code desktop's `get_session` with `self` shows as a `parentSessionId` without `detached: true`, detaches itself from that session as its first step with `detach_session` with `self`, because while linked each of its turn ends wakes the other session, and each wake re-reads that session's whole context. It messages that session only when the brief that started it says that session's run waits on its result, and then once, when it lands or stops; a follow-up, such as the next item of a queue, sends nothing back (owner's word, 2026-10-21). A lead that starts a session its run waits on says so in its brief.
