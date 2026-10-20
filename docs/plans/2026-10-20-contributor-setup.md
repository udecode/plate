# Contributor setup instead of per-PR body patches

Status: executed: landed on next, nothing waits on you
Playbook: build

The owner read the PR body check's comment on PR 5221 and asked for two changes: "instead of that long github comment, can it just ask to invoke a skill (with a link to it). and instead of patching that way, it should be a one time fix for each contributor having stale agents".

## Brief

### What will change?

A failed body check now posts a short comment that links one skill. A contributor runs it once. It updates their agent's setup, then fixes their open PR bodies, so later PRs pass the check.

### What could go wrong?

The skill's install commands for each agent come from what this machine runs, not from a fresh contributor machine. A contributor whose agent can't run the skill still has to fix the body by hand.

## Teach

A PR into the next branch should get its body from the landing script, which writes the plan's page or a line saying what went beyond the ask. A contributor's agent that skips the script writes the body by hand, usually from the PR template, which still asked for the old shape.

Today the check's comment gives the contributor three commands to patch that one body. The next PR fails the same way, because nothing about the agent changed.

The new comment links a setup skill instead. The skill runs a doctor that only fetches and reads. It lists what is out of date, such as the branch's agent files, the pinned plugin in Claude Code or Codex and how much of the rules Codex reads. The agent fixes each item, reruns the doctor until it is clean, then rewrites each failing PR body the way the landing script would. The template stops asking for the old shape.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where the skill lives | Plate's own skill, next to the check that links it (look) | A shared dotai skill that every pstack project gets | share setup skill | small |
| Open PR bodies | The skill fixes them last, after the setup, with the current rules | The skill fixes the setup only | setup only | small |
| The PR template | Drops the old plan line and ends with the "Beyond the ask" line | Leave the template alone | keep template | small |
| Proof of the doctor | Runs on this machine and on scratch setups that are out of date | Unit tests on saved config files | doctor tests | detail |

## Steps

- [x] Write the `contributor-setup` rule with its doctor script, and generate the skill. Proof: the generated skill and `pnpm run prepare` with the resource check passing.
- [x] Cut the check's failure comment to a link to the skill, and update the PR template, the enforcement row and the skill index. Proof: the workflow script run against stub pull requests for the failing and passing bodies.
- [x] Run the doctor on this machine and on scratch setups that are out of date. Proof: one log per setup, each naming every stale item it planted.
- [x] Smoke a plain request in both runtimes from this checkout. Proof: the smoke log names the skill.

## Close

The body check's failure comment is now one paragraph that links the `contributor-setup` skill. The skill runs a doctor that lists each stale part of a contributor's agent setup with its fix, then has the agent rewrite each failing PR body the way `land.mjs` would. The PR template drops its old Plan line and ends with `Beyond the ask:`. Both asks are done: the comment asks for one skill and links it, and the fix happens once per contributor instead of once per PR. No reversals or deviations.

Proof, each from its decision-log row:

- Workflow: a scratch harness ran the check's script against four stub PRs. A hand-written body fails with the short comment, an old long comment is replaced by it, a `Beyond the ask:` body passes, and a plan-page body passes with no comment.
- Doctor: on the final bytes, four scratch homes and a clone three commits behind next each print every stale part planted, a current setup prints `ok:` and exits 0, and with `gh` run as Dylan it lists PR 5221.
- Smoke: Codex sent a plain "my body check failed" request to the skill. Claude, answering as the owner, whose PRs the check skips, named the skill as the contributor's fix.

Limits: the Claude Code install and update commands come from sync-pstack and this machine, not from a fresh contributor machine. The comment's link opens only once this commit is on next. No panel ran, because the change touches no public API or Plite core.

## Open work

- PR 5221 still shows the old long comment. The check replaces it on the PR's next push or body edit. Owner: the PR's author. Stop: none.
- Your plate-2 checkout's project-scope pstack is 0.9.67, not 0.9.88, as the doctor found. Running `claude plugin update pstack@pstack-claude --scope project` from that checkout updates it. Owner: you. Stop: none.
