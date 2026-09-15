# Git and public claims

Read this for Git, PR, public issue or release work. Task owns scope and proof;
existing authority and the root whole-checkout rules remain in force.

- **PR:** Before creating or updating a PR, run `check`. If it fails, stop and fix it or report the blocker. Do not open a PR with failing `check` unless the user explicitly says to.
- **PR branch:** If the user explicitly says to open or create a PR, do not ask for confirmation. If the current branch is `main`, create a new `codex/` branch first, then commit/push/open the PR. If already on a non-`main` branch, proceed directly.
- **Merge override:** If the user explicitly says to merge it, do it. Do not wait for CI to turn green, do not ask again, and use admin merge if that is what it takes.
- **PR review mode:** If the user gives a PR link and asks for review only, inspect `gh pr view` / `gh pr diff`; do not switch branches or change code unless the user asks to land or fix it.
- **PR titles:** Do not prefix PR titles with agent markers such as `[codex]` or `[ai]`. If AI assistance matters, put it in the PR body.
- **Bug-fix PR evidence:** Before landing or claiming a bug-fix PR is fixed, require symptom evidence, root cause in code, fix path, and regression test or explicit manual proof with a reason no test fits.
- **GitHub multiline bodies:** For multiline `gh` comments, close messages, or PR bodies, use `--body-file`, stdin, or a heredoc with real newlines. Never pass literal `\n` in shell strings.
- **Public issue status:** After a user-selected non-security public behavior issue passes its reporter-valid proof gates, prepare one concise status comment. Send it only with explicit message authority. Local-only or unpushed work is a candidate, not fixed/completed. Fixed/completed wording and the `completed` label require exact-case replay on the final pushed ref, with matching proof-file fingerprints. A fresh reporter contradiction invalidates earlier green proof. State the exact local/commit/PR status, leave the issue open unless closure is separately authorized, and never imply the fix is shipped.
- **Failed-fix interrupt:** When a claimed candidate/kept/completed bug fix fails exact replay/final verification or receives a reporter contradiction, stop product edits and automatically run `regression repair <case-id>: <missed invariant or proof failure>` before retrying. Expected red-before-green is not a failed fix. A second failed fix, or a Regression architecture trigger, requires `best-api` and the owning Plite/Plate plan before another implementation attempt.
