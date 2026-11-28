# Session title

How the lead titles a session by state. Edit in `udecode/ustack`.

- **Session title.** When the runtime can rename the thread (`t3_thread_update` with `action: "rename"`, omitting `threadId`), title it by state and update only on state change or step land. Skip if no rename tool exists.

| State | Title | Notes |
| --- | --- | --- |
| Casual / non-pstack | `<name>` | Plain name, no emoji; also read-only closes waiting on nobody, and Settled done & CI-verified threads (owner archives or deletes manually when ready). |
| Active pstack run | `🥔 <name>` or `🥔 <name> (ticked/total)` | Add count for plans with checkboxes; update on step land or state change. |
| Waiting on owner | `🟠 <name>` or `🟠 <name> (ticked/total)` | Use whenever anything waits on the owner: open questions, unacted proposals, optional next-step go/stop calls, partial or blocked scope, or an explicit stop. Never auto-settled or auto-archived. |
| Landed on `next`, awaiting Local CI | `⚪ <name>` | Use only when the run is 100% done and landed (every plan step landed, zero open questions, proposals, or optional-go calls waiting on the owner, and any follow-ups already launched or filed). Drops count; `operator` strips `⚪` and settles non-pinned, non-running threads once Local CI verifies their commits (never auto-archiving). |
| Local CI red / fix, or owner blocker | `🔴 <name>` | Red Local CI fix or failure only the owner can resolve. When a `🔴` thread lands its fix on `origin/next`, flip its title to `🥔 <name>` if continuing work or `⚪ <name>` on hand-back (never leave it `🔴` after the fix lands). |
| Pinned (`📌` or pinned) | Unchanged | Never rename, never auto-settle or auto-archive. |

  - `<name>`: 1-2 telling words, or `<issue id> <1-2 words>` (`#1234 Media insert`, `DEV-2024 Login loop`). Keep the owner's custom name.
  - Put turn-end renames (`🟠`, `⚪`, `🔴`) last in the final tool message (never a standalone call). Compaction needs no rename.
  - **Slot free ping.** When a non-pinned worker thread finishes a run (flips to `⚪` or stops at `🟠`) in a project with a pinned `operator` thread, send a 1-line `SLOT_FREE [<title>] <landed sha or 🟠>` ping to `operator` via `t3_thread_send` in its final tool turn so `operator` refills open `maxAutoStart` slots immediately without polling (owner's word, 2026-11-27).
  - **Settling.** Workers never self-settle `⚪` or `🟠` threads (`t3_thread_organize(action: "settle")` is not called on hand-back). `operator` is the sole closer that strips `⚪`/`🔴` and settles the thread (`t3_thread_organize(action: "settle")`, never auto-archiving) once Local CI verifies its commits, either on full `green` or on a run past its commit whose only remaining failures belong to unrelated commits/packages (or flips it to `🟠` and unsettles if an owner call remains, or flips it to `🔴` and wakes it on a blamed red). Plain `<name>` in Settled means "done & CI-verified"; the owner archives or deletes threads manually when ready.
