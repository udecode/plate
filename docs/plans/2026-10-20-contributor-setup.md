# Contributor setup instead of per-PR body patches

Status: executed: landed on next, nothing waits on you
Page: https://claude.ai/artifact/113ovFt1qgMyipxxZAu4dZ
Playbook: build

The owner read the PR body check's comment on PR 5221 and asked for two changes: "instead of that long github comment, can it just ask to invoke a skill (with a link to it). and instead of patching that way, it should be a one time fix for each contributor having stale agents". After the first build landed, the owner asked whether the skill was generic and free of steps a structural fix could remove: "ideally the user's agent get synced and don't have such issue when checking out the repo". They approved the session-start check with "ok go fast".

## Brief

### What will change?

Every Claude Code and Codex session now starts by checking the agent's plugins against the checkout's pins, in about 60 ms, and prints each fix. The contributor-setup skill shrinks to merging next and fixing failed PR bodies.

### What could go wrong?

Codex runs the new hook only after a human trusts it in /hooks. A branch older than this change runs no check until it merges next, which the failure comment and the skill ask for.

## Teach

Each agent session reads the repository's rules and runs the pstack plugin the checkout pins. When a machine's plugin or Codex settings fall behind that pin, the agent works from old rules and may, for example, write a PR body by hand.

Until now, a contributor found that out only when the PR body check failed, and a skill walked them through the fixes.

Now a doctor runs at every session start in Claude Code and Codex. It reads the plugins the checkout pins, compares them with what the machine installed, and prints each fix for the agent to apply, with no network calls. The skill keeps only what no hook can reach: a branch older than the next branch's rules, and PR bodies that already failed.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where the check lives | Plate's own hook and script for now (look) | Shared through dotai with every pstack project | share setup check | small |
| What the session-start check skips | Network calls, so it costs about 60 ms | Fetch the next branch first, about 0.7 s more | fetch at start | small |
| Who applies a fix | The agent runs it, then asks for a new session | The hook runs each fix itself | auto-fix drift | small |
| Open PR bodies | The skill fixes them last, after the setup, with the current rules | The skill fixes the setup only | setup only | small |
| The PR template | Drops the old plan line and ends with the "Beyond the ask" line | Leave the template alone | keep template | small |
| Proof of the doctor | Runs on this machine and on scratch setups that are out of date | Unit tests on saved config files | doctor tests | detail |

## Steps

- [x] Write the `contributor-setup` rule with its doctor script, and generate the skill. Proof: the generated skill and `pnpm run prepare` with the resource check passing.
- [x] Cut the check's failure comment to a link to the skill, and update the PR template, the enforcement row and the skill index. Proof: the workflow script run against stub pull requests for the failing and passing bodies.
- [x] Run the doctor on this machine and on scratch setups that are out of date. Proof: one log per setup, each naming every stale item it planted.
- [x] Smoke a plain request in both runtimes from this checkout. Proof: the smoke log names the skill.
- [x] Turn the doctor into a local check of the plugins the checkout pins, and run it at Claude Code's and Codex's session start. Proof: both configs' hook command lines run on scratch setups and on this machine, timed.
- [x] Shrink the skill to merging the next branch and fixing failed PR bodies. Proof: its commands run on this checkout and as Dylan.
- [x] Start a real Claude Code and Codex session in this checkout. Proof: each session quotes the hook's stale line, or its log shows why not.

## Close

Every Claude Code session in a checkout of next now starts with the doctor. It compares the plugins `.claude/settings.json` pins with what the machine installed and with Codex's settings, and prints each fix for the agent to apply. A clean setup prints nothing. Codex gets the same hook. The skill keeps two jobs no hook can do: updating a branch older than next's rules, and fixing PR bodies that already failed. One deviation: the check stays in Plate rather than dotai, as the first Defaults row says.

Proof, each from its decision-log row:

- Hook: both configs' command lines ran on five scratch setups and on this machine. Current and empty setups print nothing. Old pins print 4 fixes, a machine without pstack 3, an untrusted Codex plugin hook 1, and this machine 1, its plate-2 project-scope pstack at 0.9.67. The median run on a current setup took 63 ms.
- Skill: its PR command, run as Dylan, lists PR 5221. Its behind count reads 1 on this worktree.
- Live: a real Claude Code session in this checkout quoted the hook's stale line word for word.

Limits: Codex keys hook trust by file path, so a checkout's new hook runs only after a human trusts it in /hooks, and the live Codex session ran without it. That Codex shows the hook's plain output to the model is inferred from pstack's own session hook, which works the same way. No review ran, because the owner asked for fast.

## Open work

- PR 5221 still shows the old long comment. The check replaces it on the PR's next push or body edit. Owner: the PR's author. Stop: none.
- Your plate-2 checkout's project-scope pstack is 0.9.67, not 0.9.88. Your next Claude Code session there now prints the fix. Owner: you. Stop: none.
- The check could move to dotai so every pstack project gets it. Owner: you, with "share setup check". Stop: none.
- These commits shipped fast and owe a review, which "full" runs. Owner: you. Stop: none.
