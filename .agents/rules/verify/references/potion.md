# Potion proof lane

Potion, the `potion` checkout beside Plate's main checkout, runs Plate's
packages and registry UI inside a real app with a server, a database and Yjs.
This lane reproduces a bug reported in Potion and proves a Plate fix there. It
runs locally. A detached Potion worktree takes the Plate checkout under test
through `sync-potion`'s command, and [the Potion stack recipe](./potion/stack.md)
starts the app, signs in a test user and drives it. No deploy is involved.

## When

- A bug report names Potion, or its repro needs Potion's data, server or
  restyled UI.
- A Plate fix for such a report. Its red and its green both run here, on the
  same steps.

This lane proves the Potion symptom only. Once it is red here, the Bug fix
playbook's loop runs on the smallest Plate page or test that shows the bug, such as
a www route, a Plite example or a unit test, because each Potion round costs a
package build, an install and a `next dev` compile. When no Plate page or test
shows the bug, check first whether Potion changed the file. The sync keeps Potion's
version of a file it changed and saves Plate's as
`.plate-ui-sync/base/<path>.base`. A bug in Potion's own code is fixed in
Potion as the `potion` skill says, not through this lane.

## Steps

Run from the Plate worktree under test. `$POTION` is Potion's main checkout,
`$PW` a proof worktree in a temp folder and `$RUN` the run directory.

1. Read [the Potion stack recipe](./potion/stack.md) in full, and the
   [feature recipe](./potion/features/README.md) for the path under test.
2. Cut the proof worktree, detached at Potion's current commit:
   `git -C $POTION worktree add --detach $PW HEAD`.
3. Copy `tmp/plate-local/*.tgz` and `.env.local` from `$POTION` into `$PW`.
4. When the change touches `apps/www/src/registry`, run
   `pnpm --filter www build:registry` in the Plate worktree. The sync reads the
   built `apps/www/public/r`, not the registry source.
5. Sync in the background:
   `node .agents/pstack/proof.mjs --dir $RUN --name potion-sync-<red|green> -- bash -c "cd $PW && bun run sync:plate-local <plate worktree> --no-pull"`.
   It builds and packs `platejs` and `plitejs`, runs `bun install` and writes
   the registry UI into `$PW/src/registry`.
6. Read the sync report. A file it lists as changed by Potion kept Potion's
   version and did not take the Plate change. For a fix in such a file, apply
   its `tmp/plate-sync/review/<plate commit>/<path>.diff` to `$PW` by hand,
   leave it uncommitted and say so in the evidence.
7. Run `export VERIFY_POTION=$PW`, set `STACK=.agents/skills/verify/scripts/potion-stack.sh`,
   then run `"$STACK" up`, `doctor` and `login`, with the port and container
   overrides the stack recipe's Launch section gives when a port is taken.
8. Drive the report's steps as the stack recipe says.
9. Copy `$PW/tmp/verify/evidence/<run>/` into `$RUN/potion/`. Record the Plate
   commit from `$PW/.plate-ui-sync/last-sync.json` and the tarball names from
   `$PW/package.json` beside it.
10. Run `"$STACK" down` with the same variables before the next sync.

The red runs on code without the fix. That is the session's worktree before
its first edit, or a [base worktree](./commands.md#base-worktree-for-a-head-comparison)
once it has edits. The green repeats steps 4 to 10 from the fixed worktree with
the same drive. The stack recipe's proof standards ask for five warm runs of
timing-prone behavior.

## Cleanup and limits

- Nothing commits or pushes in `$PW`. After the last `"$STACK" down`, remove it
  with `git -C $POTION worktree remove --force $PW`. Bringing a landed fix into
  Potion is `sync-potion`'s job.
- The proof covers the synced Plate checkout on this Potion commit, on a local
  dev server. It says nothing about Potion's production deploy.
