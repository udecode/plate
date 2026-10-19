# Round bookkeeping trial keep rule

Frozen before any arm runs. Arm P is the sweep prototype's `round 2` mode (`proto/sweep.mdc` and `proto/sweep.md`). Arm V is the incumbent, the project's `verify` skill alone. Arm S is the simplest alternative, `verify` plus the short section in `section.md`. The grader sees the arms only as labels; the label map is sealed outside the repository and opened only after the grader answers.

- A separate agent wrote the fixture (a round 1 record, a test index and the pages in scope) and the key from the owner's rules for when a check leaves the hand list, and replied with nothing the lead read. The lead never reads the fixture or the key before grading ends.
- Each arm's answer scores one point per round 1 check it decides the way the key does: kept for round 2 when the key says stays, left out with a reason when the key says leaves. A check the answer never mentions scores nothing. Each page the key says needs attention scores one point when the answer names it.
- The key is inconclusive when it holds fewer than 10 checks; then the incumbent stays.
- Adopt P when it scores at least 2 more than V and at least as many as S.
- When S scores at least 2 more than V and more than P, S becomes the candidate: the plan puts the section in `verify` instead of the playbook's `round` mode, with a trial of its own in round 2.
- Otherwise the incumbent stays, and the plan says the round bookkeeping did not beat `verify` alone.
- Each arm runs once, in a fresh session at the repository snapshot, on `claude-opus-5-5 @high`, so the arms differ only in their instructions. The sweep script P's playbook names is not built yet, so P applies its rules by hand from the test index.
