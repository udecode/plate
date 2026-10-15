# Method line per arm (the only difference between arms)

P: Prepare it the way the sweep workflow says: read `{{ROUNDS}}/sweep.mdc` and its playbook `{{ROUNDS}}/sweep.md`, and produce what its `round 2` mode would write, without writing any file. The script it names is not built yet, so apply its rules by hand from the test index.

V: Prepare it with the project's `verify` skill: read `{{REPO}}/.claude/skills/verify/SKILL.md` and the references it names that apply.

S: Prepare it with the project's `verify` skill, `{{REPO}}/.claude/skills/verify/SKILL.md` and the references it names that apply, plus this added section: `{{NOTES}}/next-round.md`.
