# Rubric for the cross-judge (candidates never see this)

Score each candidate 0 to 3 on each criterion, with one line of evidence each.

1. Finds unknown bugs. The tester's time goes where unknown bugs are likely, and the design does not rest on checks written ahead catching them, which three trials measured at 1 in 60.
2. Shrinks. Hand time falls over rounds by a rule the next round applies without judgment calls.
3. Owner priority. P1 to P5 by hand in the owner's order, P6 fixes after, agent-run testing later, and every find ends as a fix plus a test at the lowest layer that sees it.
4. Measurable. Round 1 can tell whether the pass works, with a key or measure the lead cannot bias.
5. Small. It reuses `verify`, issue-draft, Bug fix and the knowledge tool, and adds the fewest new files and concepts.
6. Records. A find is captured once and reproducibly, and a known bug's check stays tracked until a test covers it.

Then recommend a base and name one or two grafts from the others, each with its candidate label.
