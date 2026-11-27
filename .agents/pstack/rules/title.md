# Session title

How the lead titles a session by state. Edit in `udecode/ustack`.

- **Session title.** When the runtime can rename the thread (`t3_thread_update` with `action: "rename"`, omitting `threadId`), title it by state and update only on state change or step land. Skip if no rename tool exists.

| State | Title | Notes |
| --- | --- | --- |
| Casual / non-pstack | `<name>` | Plain name, no emoji; also read-only closes waiting on nobody. |
| Active pstack run | `🥔 <name>` or `🥔 <name> (ticked/total)` | Add count for plans with checkboxes; update on step land or state change. |
| Waiting on owner | `🟠 <name>` or `🟠 <name> (ticked/total)` | Use whenever anything waits on the owner: open questions, unacted proposals, optional next-step go/stop calls, partial or blocked scope, or an explicit stop. Never auto-archived. |
| Landed on `next`, awaiting Local CI | `⏳ <name>` | Use only when the run is 100% done and landed (every plan step landed, zero open questions, proposals, or optional-go calls waiting on the owner, and any follow-ups already carded or launched). Drops count; `operator` auto-archives non-pinned, non-running `⏳` threads once Local CI is green. |
| Local CI red / fix, or owner blocker | `🔴 <name>` | Red Local CI fix or failure only the owner can resolve. |
| Pinned (`📌` or pinned) | Unchanged | Never rename, never auto-archive. |

  - `<name>`: 1-2 telling words, or `<issue id> <1-2 words>` (`#1234 Media insert`, `DEV-2024 Login loop`). Keep the owner's custom name.
  - Put turn-end renames (`🟠`, `⏳`, `🔴`) last in the final tool message (never a standalone call). Compaction needs no rename.
  - **Settling.** Workers never self-settle `⏳` or `🟠` threads (`t3_thread_organize(action: "settle")` is not called on hand-back). `operator` is the sole closer that strips `⏳` and archives once Local CI is green (or wakes the thread and flips it to `🔴` on red).
