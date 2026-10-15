| Round 1 check | Decision | Deciding rule |
|---|---|---|
| SWEEP-BASIC-001 | leaves | One unchanged, reviewed unit test covers the whole engine-independent check and runs on every pull request. |
| SWEEP-BASIC-002 | stays | Its named test covers selected-text replacement, not this paragraph-merge check, despite the shared issue. |
| SWEEP-BASIC-003 | stays | The covering test body changed since its last comparison with the check and has not been read again. |
| SWEEP-BASIC-004 | stays | The check passed, but no test covers it. |
| SWEEP-MARKDOWN-001 | stays | Its covering test was deleted. |
| SWEEP-MARKDOWN-002 | stays | Its covering test runs only by hand. |
| SWEEP-MARKDOWN-003 | leaves | One unchanged, reviewed unit test covers the whole engine-independent check and runs on every pull request. |
| SWEEP-TABLE-001 | stays | This browser-dependent check names Safari, but its only gated test runs in Chromium. |
| SWEEP-TABLE-002 | stays | Its browser test runs in fewer browsers and devices than the check names. |
| SWEEP-TABLE-003 | stays | The covering test body changed since its last comparison with the check and has not been read again. |
| SWEEP-TABLE-004 | stays | Its covering test is skipped. |
| SWEEP-DND-001 | stays | Only a person can inspect the native drag image for this bug. |
| SWEEP-DND-002 | stays | Only a person can inspect the native drag image for this bug. |
| SWEEP-DND-003 | stays | The check was blocked. |
| SWEEP-MENTION-001 | stays | Its gated engines omit Safari and iPhone Safari, and Playwright WebKit does not count as Safari. |
| SWEEP-MENTION-002 | stays | The check passed, but no test covers it. |

| Page needing attention | Reason |
|---|---|
| https://beta.platejs.org/docs/table | Settle its reference page before the next round. |
| https://beta.platejs.org/docs/emoji | Add checks because the page was added since round 1. |
