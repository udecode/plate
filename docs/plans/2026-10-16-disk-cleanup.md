# Clean up worktrees and Next folders without asking

Status: building: dotai, then plate-2 and ellie
Topic: pstack
Playbook: build

The owner's words, after measuring 294 GB of Next folders and 240 GB of worktrees: "ok looks like we dont have any cleanup step in our skills / potato. especially worktreees. what do you recommend?", then "why the fuck do our workflow build everytime ? isnt dev / typecheck / test enough ?!", then "and maybe a new "cleanup" skill to scan and suggest to delete all unused ones , taking into account wip sessions", then "ok go all".

## Brief

### What will change?

A card session deletes its own worktree once its patch lands. Each dev server port gets one reused Next folder. The local check skips the production build. A new cleanup skill deletes what nothing uses.

### What could go wrong?

A wrong safe verdict could delete a worktree someone still needs. The skill rechecks each item right before deleting and keeps anything an open session or running server holds. CI, not your machine, now catches production-only build breaks.

## Teach

A card session works in its own copy of the repository, called a worktree. When it finishes, it applies its change to your checkout. Its worktree then sits unused, and archiving the session keeps it when it still holds uncommitted files. Dev servers each write a cache folder of several gigabytes, and each session picked a new folder name, so nothing was ever reused or deleted.

After this change the card session confirms your checkout holds its change, then deletes its own worktree. The dev server names its cache after its port, so a rerun on the same port reuses it. The local check stops building the production site, which CI still builds.

The cleanup skill lists every worktree and cache folder, matches each worktree to its session, and deletes what is provably unused: caches no server holds, and worktrees of archived sessions whose changes are all in your checkout. Anything else it lists for you.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Who deletes a card's worktree | The card session, right after its change lands | The lead deletes it when you archive the session | parent cleans | big |
| What the cleanup skill deletes without asking | Caches no server holds, and worktrees of archived sessions whose changes are all in your checkout (look) | It asks before every delete | ask first | big |
| The production build | CI builds every change; the local check builds only when asked (look) | The local check keeps building every time | build locally | big |
| Dev cache folder names | One per port, picked by the dev server itself | One per session, as today | folder per session | small |
| Your own dev server's cache | Moves to a folder named after its port, so its first start compiles cold once | Keep the plain folder name | keep plain folder | detail |
| Where the cleanup method lives | A shared skill that builds on pstack's worktree cleanup playbook | A plate-2 playbook only | plate-2 only | detail |
| The session-start hint | Counts folders untouched for three days, without sizes, so it stays fast | Measure sizes at every start | measure at start | detail |
| Worktrees no session claims | Asked about, because the scan cannot tell whether a lead session still uses them (look) | Delete them once they sit a day without git activity | auto orphans | small |
| Proof of the card step | Two live fake-chip runs and a smoke of both runtimes, no paired trial, because the step only adds a last command to a list the session already follows (look) | Run a paired trial of the new landing text | run a trial | small |

## Main changes

- The card brief and the chips Landing rule end with a self-delete. The session stops its servers and copies its run directories into the checkout. Once the cleanup skill's `scan.mjs --landed <its worktree>` exits 0, its last command is `git -C <checkout> worktree remove --force <its worktree> && git -C <checkout> worktree list`.
- `apps/www/next.config.ts` gives a dev server with no `PLATE_WWW_DIST_DIR` the folder `.next-<port>` (or `.next-plite-<port>`); builds keep `.next`. The verify rule and `.claude/launch.json` stop setting the variable.
- `tooling/scripts/check.mjs` moves `build:www:ci` into its own opt-in `www-build` step that runs with `--build`, alone or beside named steps; CI runs `pnpm check --build`. The verify rule tells an agent to pass `--build` only for a change that can break the build itself.
- The new dotai `cleanup` skill and its `scan.mjs` classify worktrees and caches as safe, keep or ask. A worktree is safe only when an archived session owned it, an agent made it and no running process works in it. Each changed file must also be committed or the same in the checkout, and each ignored file must be one an install or build recreates, or the same in the checkout. `--delete` measures each safe item, judges it again against the processes running then, and removes it. The block's Autopilot and Git rules name that safe set as not data.
- The Stop and prompt hooks in plate-2 and ellie skip quietly once their project folder is gone, so a session that deleted its own worktree stops cleanly.

## Steps

- [x] Give the dev server a per-port cache folder and stop setting `PLATE_WWW_DIST_DIR` in the verify rule, `.claude/launch.json` and the native IME Playwright config. Proof: a dev start on a free port writes `.next-<port>`.
- [x] Make the production build an opt-in `www-build` step of `pnpm check`, run by CI with `--build`, and narrow the coding-standards row that equates a local and a CI green. Proof: `pnpm check --list`, `ci-workflow.test.mjs`.
- [x] Add the self-delete to the card brief, the chips Landing rule and the chips skill's Start step, with a test of the brief text. Proof: the dotai suite.
- [x] Build the `cleanup` skill and `scan.mjs` with tests over a scratch repository, and add the Autopilot and Git rule exceptions to the block. Proof: the scan tests.
- [ ] Wire the session-start hint into plate-2's and ellie's Claude Code hooks. Proof: a hook run prints the hint.
- [x] Run `deslop` and `no-comments` on the code and `unslop` on the prose. Proof: the writing rows.
- [x] Run dotai's suite, `validate-skills` and `corpus` on each managed project. Proof: the logs.
- [x] Run `interrogate` on the helper and tooling diff and apply what it accepts. Proof: the panel rows; rounds 1 and 2 ran, and round 3 stopped at the owner's "fast".
- [ ] Smoke plate-2 and ellie before and after from the uncommitted tree. Proof: the smoke answers.
- [ ] Commit and push dotai, sync plate-2 and ellie, install the `cleanup` skill in both, and run `verify` on each. Proof: the commits and verify logs.
- [x] Run `pnpm lint:task` on this run's plate-2 code files. Proof: its log.
- [ ] Run the first `/cleanup` on plate-2 and ellie, with free disk measured before and after. Proof: the scan and delete logs.
- [ ] Run the decision-trail review. Proof: its answer.
