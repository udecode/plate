## Next round of a hands-on pass

When you prepare the next round of a hands-on pass, drop a check only when one test that CI runs on every pull request checks the whole check: a gated unit test for a check whose bug any engine shows, or a gated browser test in every browser the check names for one that depends on the browser. Keep every other check, every blocked check, every check only a person can see, and every check whose covering test changed since someone last read it against the check. List new pages, and pages whose reference page is unsettled.
