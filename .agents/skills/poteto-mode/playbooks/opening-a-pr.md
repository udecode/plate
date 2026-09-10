Read [Codex playbook execution](../references/codex-playbooks.md) for the tool, lifecycle, and proof mapping before executing this recipe. Preserve the steps below; record any unavailable capability or inapplicable step explicitly.

### Opening a PR

Use when the active request authorizes PR delivery. A completed local change does not invoke this playbook by itself.

**Checkout.** Follow the user's current checkout and PR-scope instructions. Use another worktree only when authorized. Preserve existing work and resolve shared ownership before competing mutations; do not reset, stash, isolate files, or change branches merely to fit this recipe.

**Commits.** Follow the active publication, staging and history policy. Do not rebase or reshape the user's checkout merely to fit a preferred story. Each commit is a future PR: landable, ordered to tell the story. Amend when the fix belongs in a just-made commit; new commit when separable.

**PRs.** Use the project's implementation-quality owner and required checks before an authorized commit. Use **no-comments** for an explicit comment audit or evidence of structural debt hidden in comments. Apply the project's review owner and existing budget; this playbook adds no review round. Write PR titles, descriptions, and commit bodies through **technical-writing**, including its preservation and anti-slop checks and the current house style.

**Titles.** Follow the project's title convention. When it uses Conventional Commits, write `type(scope): subject` with a type such as `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, or `perf` and the changed area as scope. Keep the subject short and imperative. Apply the same **technical-writing** pass as the body. Name a real symbol when one carries the change. For example, `fix(pstack): retarget opening-a-pr babysit trigger`. Do not add a trailing period.

**Descriptions.** Follow the project template and scale detail to the change. The following sections are available when they help a reviewer; they are not mandatory headings for a small PR.

- `## Why`. State the intent and why this approach fits.
- `## Scope`. State facts from the diff. Name real symbols and paths. Name both sides of a rename or retarget. State what is in and out when the boundary matters.
- `## Tradeoffs`. State real choices only. Skip this section when there are none.
- `## Blast Radius`. State who and what the change touches. Explain why the change is safe or risky. If main is red without the fix, name the continuing cost.
- `## Verification`. State how you ran each check and its rigor. Name the real path, such as `control-cli`, `control-ui`, or the targeted tests. State the outcome of each check, not only the command name.

After these sections, attach videos or screenshots when they prove a claim. Do not use `## Summary` or `## Test plan` boilerplate. A commit body does not restate its subject.

**Forge.** Resolve the forge before the first PR operation and keep that choice for create, edit, view, watch, and merge. GitHub CLI (`gh`) is the default. If `command -v origin` succeeds and Origin can resolve the repository, prefer `origin pr ...`; if Origin is absent or cannot resolve the repository, stay on `gh` and record the fallback. Do not require Graphite (`gt`).

**Size and stacks.** Use the authorized PR scope. Split into a stack only when requested or allowed by that scope and when its units can be reviewed and verified independently. A stack is a base-branch chain: the root targets trunk, each child targets its parent, and the tested base must match the submitted base. For an authorized stack, create a child with `origin pr create --status open --base <parent-branch>` or `gh pr create --base <parent-branch>`, and retarget with `origin pr edit <pr> --base <parent-branch>` or `gh pr edit <pr> --base <parent-branch>`, according to the resolved forge. Rebase only under the active history policy, then reverify affected claims.

**Readiness.** Follow the requested ready/draft state and project gates. For a ready PR, Origin uses `--status open`, `gh` omits `--draft`, and a cloud PR tool may require `draft: false`; use the corresponding draft option for a requested draft. Change readiness only when that action is authorized. Run `origin pr view <number>` or `gh pr view <number>` before reporting PR status.

**Babysit.** Opening a PR does not start a babysit. Post the URL and keep building. Finish the phase or stack first. Run a separate babysit pass only when the user asks for one after the whole stack exists. A babysit for each new PR stalls the build and spends checks on commits that later waves restart. Push back when feedback drifts from intent.

A delegated PR unit uses the same authority, quality owner, and review budget as its parent. Use `interrogate` only for a contested design or an explicit request; use **no-comments** only under its trigger. Return the verified PR URL to the parent without starting an unrequested babysit.
