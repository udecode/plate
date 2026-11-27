# Linked sessions

This file says how a session that another session started stays out of that session's way. The pstack block in `AGENTS.md` points here. The `sync-pstack` skill renders this file from its shared source in `udecode/ustack`, so change it there.

- **Briefs.** A session that another session started follows `AGENTS.md` in full, even when its brief starts with pstack's `worker.md` line. That file's bar is a subagent's, so a session's brief never lifts a gate the project's rules set, such as its proof, writing passes, panels or landing.
- **Cross-session messaging.** In T3 Code, top-level threads launched with `t3_thread_launch` do not auto-wake their parent, so no detach step is needed (cross-session messages use `t3_thread_search` + `t3_thread_send`). Message the starting session only when its brief says its run waits on your result, and then once, when you land or stop; a follow-up, such as the next item of a queue, sends nothing back (owner's word, 2026-10-21). A lead that starts a session its run waits on says so in its brief.
