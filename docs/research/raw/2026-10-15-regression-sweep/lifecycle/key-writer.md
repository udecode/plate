You are writing test material for an editor team's hands-on testing rounds. Read only. Never post, comment, push or change anything outside your own scratch folder.

The team tests beta pages of the Plate editor by hand in rounds. Each round runs checks, one page, one starting state and one sequence of actions each, in Chrome, Safari and Firefox on a Mac and Safari on an iPhone. When a check finds a bug, someone fixes it and adds a test. The owner's rules for the next round:

- A check leaves the hand list only when one test that CI runs on every pull request checks the whole check. For a check whose bug any engine shows, a gated unit or integration test is enough. For a check whose bug depends on the browser, the gated test must run in every browser the check names. Safari and the iPhone have no gate today, and Playwright's WebKit is not Safari.
- A check stays when its covering test was deleted, is skipped, runs only by hand, runs in fewer browsers than the check needs, or covers a different check.
- A check stays when its covering test's body changed since someone last read it against the check, until someone reads it again.
- A check stays when it was blocked, when only a person can see its bug (such as the native drag image), or when it passed and no test covers it.
- A page whose reference page is unsettled must be settled before the next round. A page added since the last round needs checks.

Write four files. Your answer holds all four, each starting with its own line `=== FILE: <name> ===` and nothing between files. The first three:

1. `round-1.md`: the record of a finished round 1 over 4 or 5 beta pages, mixing Plite examples such as `https://beta.platejs.org/examples/plite/<name>` and Plate docs pages such as `https://beta.platejs.org/docs/<name>`. Hold 12 to 16 checks, each with an id like `SWEEP-<PAGE>-<NNN>`, page, reference, the browsers and devices, starting state, steps, expected result, what must not happen, the lowest test layer that can see its bug (`unit`, `browser`, `device` or `human`) and minutes. Give each its round 1 result per browser: pass, find (with an issue number such as `plate#5201`) or blocked. For each check that was fixed, add `fixed-by:` with its issue and `covered-by:` naming one test by path and title with an 8-hex body hash.
2. `test-index.md`: every test the checks could refer to, one row each: path, title, tags in the title such as `[plate#5201]`, layer, gate (`pnpm check`, `plite CI` or `manual`), the engines the gate runs (`chromium`, `firefox`, `webkit` or none for unit tests), skipped or not, and its body hash now. Include tests no check names.
3. `pages.md`: the pages in scope for round 2, with each one's reference page, including one page added since round 1 and one page whose reference page is unsettled.

Plant at least one check for each rule above, and make the counts uneven: some rules twice, one rule three times. Include two checks that share one issue where the covering test checks only one of them, a unit-layer check whose bug shows in every browser and whose gated unit test retires it, and a browser-layer Safari check whose only gated test runs in Chromium. Make every page, step and test name plausible for a rich-text editor. The three files must not contain the words trial, key, planted, expected answer, grader or correct.

The fourth, `key.md`: one row per round 1 check with `stays` or `leaves` and the rule that decides it in one short sentence, then one row per page that needs attention before round 2 with its reason. Use only the owner's rules above.

Your answer is the four files in that format and nothing else: no preamble and no summary.
