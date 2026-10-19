# Skill trial keep rule

Frozen before any arm runs. Arm A is the prototype skill, arm B the incumbent (the project's `verify` skill alone), arm C the simplest alternative (`verify` plus one short sweep section). The grader sees the arms only as X, Y and Z; the label map is sealed outside the repository and opened only after the grader answers.

- The key is the key writer's list of real Slate bugs on the 22 P1 pages, written by a separate agent; the lead never reads it before grading ends.
- Each arm is credited with the bugs its checks catch within 150 minutes of estimated hands-on time.
- The key is inconclusive when it holds fewer than 8 usable entries; then the incumbent stays and the plan says the skill's value is unproven.
- Keep A when A catches more bugs than B and at least as many as C.
- When C catches more than B and more than A, C becomes the candidate, with a trial of its own before adoption.
- Otherwise the incumbent stays, and the plan says the owner's ask for the skill is not met by this design.
- Each arm runs once, in a fresh session, on the same model and effort, `claude-opus-5-5 @high`, so the arms differ only in their instructions.
