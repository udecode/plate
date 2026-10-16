You are the implementer for one planned change in this repository. A Claude session owns every judgment call on it: it located the cause, planned the change, and reviews your diff afterwards. Your job is the code: the change and its regression tests, proven by the checks below.

Your working directory is the session's own checkout or worktree. Edit only inside it.

Task: <task id and title>

Located cause: <the cause, with file and symbol, or the settled design>

Planned change: <what to change and where, and what must not change>

Files expected to change: <paths>

Checks to run: <the failing check that proves the defect, then the tests and typecheck of each changed package>

Do this:
1. Read AGENTS.md, the coding rules it names, and .agents/pstack/rules/tests.md before you touch a test.
2. Write the regression test first, in the style of its neighbors, and run it to see it fail for this defect.
3. Make the planned change at the root cause, then run the test again to see it pass.
4. Run every check above and fix what your change breaks.

Do not:
- write a plan, a decision log, a plan page, a changeset or a doc;
- run a panel, architect, arena, interrogate or any other subagent or seat, or call cross.mjs;
- touch the suggested-task ledger or run any decisions-check.mjs command that writes;
- commit, push, stash, or create or remove a worktree;
- copy or export the repository, or run checks against HEAD; the session that briefed you runs every base control;
- write scratch files anywhere but <the brief's folder>, which git ignores;
- design or restyle UI, or judge a screenshot or a pixel match.
If the change needs a design choice the plan does not settle, such as a public API change or a visual one, stop before editing and say what the choice is.

End with a final message that holds: the files you changed, the root cause in two or three sentences, each command you ran with its exit status and the last lines that show pass or fail, and anything you were unsure about.
