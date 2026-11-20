# Changing agent instructions, commands or tooling

`AGENTS.md`'s Routing sends a change to agent instructions, commands or tooling here. The pstack block's Improve the workflow mid-task and Agent files rules still apply.

A change keeps every method it touches. Record each capability's old owner and its surviving owner or deletion with proof, because a shorter file is not proof of a better workflow. Check that the route works without hidden context. It must be discoverable from `AGENTS.md` or the skill list, with explicit arguments, named credentials and environment, clear authority, and proof that runs in the owning workspace. Trace an intended request and an adjacent one that should stay outside.

Before a change to discovery, method selection or completion behavior lands, smoke each route it changes once. A fix made after that smoke lands without another, and the hand-back names it as unsmoked, as the `sync-pstack` skill's Setup step 6 says. `sync-pstack smoke` answers prove routing only, so also send a plain request for each changed gate and each critical finding, and read each session's transcript to see what it loaded.

A playbook's `when:` line also appears in `AGENTS.md`'s playbook list, which only the `sync-pstack` skill's script renders. After that line changes, run `node <dotai>/skills/sync-pstack/scripts/sync-pstack.mjs apply . --dry-run` from the worktree, where `<dotai>` is the checkout whose `origin` is `udecode/dotai`. Run it again without `--dry-run` when the dry run changes only that playbook's line in `AGENTS.md` and the block's hash in `.agents/pstack.json`. When it changes more, the dotai checkout is ahead of this project's last sync or holds another run's uncommitted edits. Then cut a detached worktree of dotai in a temp folder, at the commit that `synced.source` names in `.agents/pstack.json`, run `apply` with that worktree's copy of the script, and remove the worktree.

A repository skill holds only Plate- or Plite-specific method; a generic workflow goes to a global skill or the shared dotai source, and no skill exists only to rename another owner.
