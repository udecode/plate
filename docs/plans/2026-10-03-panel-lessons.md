# Lessons from opt-in panels

Status: executed
Topic: pstack

Reflect reviewed the opt-in panels build and accepted twelve lessons for sync-pstack, its block and plan-page, and the smokes showed that Ellie's `high-risk` row catches plain PHI reads. The owner answered "go": apply all twelve lessons and narrow the row.

## Main changes

The twelve lessons, each in the file it names:

1. Reviews mode lists every pstack step that calls a tool by default and gives each one a Defaults row with its reversal word before build, because the architect gate dropped Feature, Bug fix and Perf architect steps with no reversal word. (dotai `skills/sync-pstack/SKILL.md`, Reviews)
2. The Panel rule gets one `# overrides` note per pstack step it now suppresses, so a pin bump that rewords one of them is flagged. (dotai `assets/block.md`, Panel review notes)
3. plan-page carries the review-only exception in its intro, Render row and Render step 1, because it still says every review verdict writes a plan and a page. (dotai `skills/plan-page/SKILL.md`)
4. A change that retires, narrows or excepts a rule searches the concept's stem and every phrasing across dotai, both projects and both models sheets before the first smoke. (sync-pstack Lesson step 3, `references/adapt.md`)
5. Lesson's gates run apply, verify and the whole smoke set on the final block before the decision-trail review, a later block edit reruns the set, and the Close names the commits the review covered. (sync-pstack Lesson steps 1 and 6)
6. The smoke prompt asks each runtime for rule conflicts, and each one is sorted before logging: a clash among changed rules fails, a harness artifact is noted, an older conflict gets an owner. (sync-pstack Setup step 6)
7. A smoke answer that reports a denied read of the file under test is inconclusive for that file and is logged partial. (sync-pstack Setup step 6)
8. A dotai commit a project already synced from is fixed with a new commit, never an amend, and a forced apply first checks the whole in-block diff. (sync-pstack Lesson step 6, Sync step 4)
9. A plan that changes a gate follows the gate in force when it starts, and an option that skips a required gate says so. (sync-pstack Lesson step 1)
10. Every invariant a panel or trail brief names traces to a quoted user ask; the lead's own decisions enter the brief as decisions to attack. (dotai `assets/block.md`, Panel review intent sentence)
11. Reviews step 4 takes its uncovered smoke request from the project's most common work and reports when it lands in a covered row anyway. (sync-pstack Reviews step 4)
12. Each project lists its out-of-repo workflow guides outside the pstack block, and Lesson adds a gate to update them. (sync-pstack Lesson step 1, both AGENTS.md outside the block)

Ellie's `high-risk` row narrows to code that changes who can read PHI, or writes, exports or sends it, plus auth, the database or migrations, customer sends and shared product code.

Rejected: keeping a diff-only end-of-task question (you accepted the pushback); re-tuning sync-pstack's description (it already fires on panel-list changes); the user-scope skill removal steps (adapt.md has them); the Node test reporter filter (version-bound); Ellie's oxlint ignore (the Delivery rule covers it); treating a guard's clean first run as suspect (the block and Lesson step 4 already say so).

Backlog: moved to the subject file's Open work, owner: Ziad.

## Steps

1. - [x] **Lessons.** Apply the picked lessons through sync-pstack's Lesson mode in dotai. Proof: the sync-pstack tests, `apply` and `verify` in both projects, and a smoke in both runtimes for each changed gate. Done: dotai 1f2650c, 3cf7db6 and 8be3a9f on main; `node --test skills/sync-pstack/scripts/sync-pstack.test.mjs` 84 pass; `sync-pstack verify` exit 0 in both projects; smokes in scratch smoke3, smoke4 and smoke5.
2. - [x] **Ellie high-risk row.** On "narrow", reword the row in Ellie's `.agents/pstack.json`, then `apply` and `verify`. Proof: a smoke with the document-type filter request lands outside the row, and an access change still lands inside it. Done: Ellie 0a80d17e9 on `next`; scratch smoke5/ellie.txt, both runtimes.

## Close

Reversals and deviations first:

- Lesson 10 (trace each brief invariant to a user ask) went into the Decision-trail review rule instead of the Panel rule's intent sentence. Another session held uncommitted edits on the Panel rule's line, and the intent sentence already forbids the author's conclusions. Say "lesson 10 in the panel rule" to move it.

What landed: all twelve lessons and Ellie's narrowed `high-risk` row. dotai 1f2650c, 3cf7db6 and 8be3a9f are on main, rebased onto the other session's 4c065f8, and Ellie 0a80d17e9 is on `next`. plan-page is reinstalled from `udecode/dotai` in both projects, sync-pstack at user scope, and the Ellie guide's panel bullet carries the narrowed row (rev 12). plate-2's AGENTS.md, config, plan-page copy and lock stay uncommitted for the owner.

The smokes found two more gaps. Each got a fix, and the whole smoke set reran after each one. A review-only panel read as contradicting the round rules, fixed by 3cf7db6. Codex ran `architect` and a plan panel for work listed only for a diff panel, fixed by 8be3a9f.

Proof: the sync-pstack tests, and `check` and `verify` exit 0 in both projects. `verify` also confirms that each new overrides note quotes text pstack has at v0.9.54. The final smoke set ran in both runtimes on 8be3a9f (scratch smoke5). Its results:

- A plain Ellie filter plan stays outside `high-risk` and asks Build now, Panel first or Hold.
- An Ellie access change gets only the diff panel.
- "review PR 5139" answers in chat with no page or log.
- A table edit runs Reviews mode and updates the Plate v2 guide.

Limits: the Reviews step that lists a tool's default call sites showed up in smoke4, on the same SKILL.md bytes, but not unprompted in smoke5. Claude smokes still cannot read pstack's playbooks, so a denied read leaves those steps inconclusive. No trail review ran, because no script or check changed and no panel ran.

Counts: 25 items, the two answers, the twelve lessons and eleven gates. 23 done, 2 skipped (`lint:fix`, because Ellie's change has no lintable file, and the decision-trail review, because no script or check changed and no panel ran), 0 blocked, 0 open.

Open work, each moved to the subject file's Open work with owner Ziad:

- The close order runs `lint:fix` after a diff panel, but the Review rule cherry-picks the reviewed commit unchanged, so a formatter edit ships bytes no seat saw.
- Plans and trails keeps a plan only for work that spans sessions or goes into a PR, while Plan pages has every subject-less stop write a one-off plan. Neither says whether that plan is committed.
- The user CLAUDE.md puts the whole checkout in a PR, while AGENTS.md stages only the task's paths.
- `sync-pstack verify` checks `(reviews: <id>)` citations only in playbooks, so a citation in a rule goes unchecked.
- Codex in plate-2 reports a "Maintain Workflow" requirement that names a retired workflow.
- The reflect backlog: a dotai check for a stale `workflow-manifest.json`, `verify` scanning `dropped` names in playbooks, docs and both models sheets, and `cross.mjs` reading the pinned pstack plugin.

