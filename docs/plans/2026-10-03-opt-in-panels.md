# Panels only where they pay

Status: executed
Topic: pstack

Review panels stop running on every big task. A short `reviews` table in each project's `.agents/pstack.json` lists the work that always gets a panel or architect, the shared Panel rule renders that list, and everything else runs only when you ask. architect always seats Opus plus the two Codex models, and cross-review goes because in-session panels replaced its hand-off.

## Public API

A plan that is not in the table no longer gets a panel; its stop question adds Panel first.

```text before
(nothing to type: big work runs /pstack:interrogate, then asks Build now / Another round / Hold)
```

```text after
(nothing to type: work in the reviews table gets its panel; any other plan asks Build now / Panel first / Hold)
```

Three words opt in to the tools the table does not run.

```text before
```

```text after
panel | arena | full    (panel: /pstack:interrogate on the plan or diff; arena: a bakeoff; full: architect, then a panel on the plan and on the diff)
```

One sentence changes the table in every project.

```text before
```

```text after
"from now on <work> runs <architect | panel | arena>"    (sync-pstack edits the reviews table, re-renders AGENTS.md and verifies)
```

architect seats the same three models as the panel.

```text before
```

```text after
architect runners: opus, codex:gpt-6-astra @high, codex:gpt-6.1-sol @xhigh
```

Someone else's PR gets a review-only panel instead of a cross-review hand-off.

```text before
$cross-review <plan>    (session discovery feeding /pstack:interrogate)
```

```text after
review PR <number>    (plate-2: a review-only panel on someone else's PR, briefed with its body, linked issue and plan)
```

The typed hand-off goes.

```text before
$cross-review <plan>    (typed only)
```

```text after
```

cross-review leaves the global method skills.

```text before
pstack:thermo-nuclear-code-quality-review, pstack:unslop, pstack:deslop, $cross-review (global)
```

```text after
pstack:thermo-nuclear-code-quality-review, pstack:unslop, pstack:deslop
```

## Main changes

- **The shared Panel rule reads a table.** dotai's block renders its trigger list from `reviews` in each project's `.agents/pstack.json`, and the generic big-work definition and `bigWork` go. Each row names the work, the tool and the stage. The starting rows:

  | Project | Stage | Work | Tool |
  | --- | --- | --- | --- |
  | plate-2 | Plan | A plan with an API or architecture target | architect, then one panel on the finished plan |
  | plate-2 | Plan | A best-api-review Pursue record | Panel on the record |
  | plate-2 | Review | Someone else's PR | Review-only panel |
  | both | Build | Before opening a PR | Panel on the diff |
  | Ellie | Build | High-risk code (auth or access, patient data, the database or migrations, customer sends) before push | Panel on the diff, in a detached worktree |

- **One panel after architect.** plate-2's Plan playbook drops the interrogate on the winning sketch; the panel on the finished plan covers the grafted design and the execution steps architect never sees.
- **The decision-trail review narrows.** It runs only for an unattended run or work that went through a panel.
- **cross-review is cut** from dotai, the block, sync-pstack's references, the catalog and the user-scope install. Both projects list it under `dropped`, because it was typed 5 times.
- **verify guards the table.** `sync-pstack verify` flags a project playbook step that runs a panel no `reviews` row names, so the table stays the one place triggers live.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Ellie plan panels | None by default | Keep a panel on architecture-target plans | "panel architecture plans" |
| Decision-trail review | Unattended runs and panel-reviewed work only | Every decision log | "trail always" |
| External PR wording | "review PR <number>" | "check PR <number>" | "check PR" |
| Where the table lives | Per project in `.agents/pstack.json` | One shared default in dotai's block | "shared reviews" |
| A panel for this plan | None: it changes agent instructions, which no row panels | Panel the plan first | "panel" |

## Steps

1. - [x] **dotai.** The block's Panel rule renders `reviews`; `bigWork` and the generic big-work list go; the trail-review rule narrows; cross-review leaves the skills, the block, `references/adapt.md`, the README and the catalog; sync-pstack learns "from now on <work> runs <tool>" and its verify check. Proof: tests that fail first for the rendered list and the playbook check, `scripts/validate-skills`. Done: dotai f47122c, 6b0a360, 3351651, 8fb6f60 and c7e67a0, pushed to main; `node --test skills/sync-pstack/scripts/sync-pstack.test.mjs` 84 pass, and the two new tests fail on f47122c~1.
2. - [x] **Models.** `architect runners: opus, codex:gpt-6-astra @high, codex:gpt-6.1-sol @xhigh` in `~/.claude/pstack-models.md` and `~/.codex/pstack-models.md`. Done: both sheets, line 24 and line 20.
3. - [x] **Projects.** The starting rows and `dropped: cross-review` in both configs, then `apply` and `verify`. plate-2's `plan.md` drops the interrogate on the winner, `api-review.md` leaves PR numbers to the new route, and `babysit.md` adds the review-only path; plate-2 stays uncommitted. Ellie commits and pushes `next`. Done: Ellie 19e023edd on `next`; `sync-pstack verify` exit 0 in both projects.
4. - [x] **User scope.** Back up and remove the global cross-review install; check for dangling links. Done: `npx skills@1.5.25 remove -g cross-review -y`; no cross-review entry or dangling link in the three user skill directories.
5. - [x] **Guides.** Update the Plate v2 and Ellie workflow guides. Done: https://claude.ai/code/artifact/2aff4561-601c-4cef-83c8-37c0c3a4a2d0 (rev 53) and https://claude.ai/code/artifact/ac1f36ff-4f72-4348-b452-a2ac9d4d29d6 (rev 11).
6. - [x] **Proof.** Plain-request smokes in both runtimes: an API plan in plate-2 runs cross-family architect and one plan panel; a feature plan in Ellie asks Build now / Panel first / Hold with no panel; "review PR 5139" runs a review-only panel; "from now on best-api design runs architect" edits the table; a high-risk Ellie change gets the diff panel before push. Then the decision-trail review before the dotai push, and `/pstack:reflect`. Done: scratch smoke/*.txt, logged in the decision log's proof rows; trail review in scratch trail-review/answer.md; `/pstack:reflect` runs after this close, and its lessons wait for the owner's approval.

## Close

Panels, `architect` and arena now run without asking only for the rows in each project's `reviews` table. Anything else waits for "panel", "arena" or "full". An unlisted plan asks Build now, Panel first or Hold. architect seats Opus plus the two Codex models, and cross-review is gone.

Reversals and deviations first:

- The decision-trail review also keeps its shared-script case. The approved wording, "only for an unattended run or work that went through a panel", stays in Main changes. The Shared checkout and Agent files rules already hold a new or changed shared script for that review before it is pushed. Say "trail only as planned" to drop it.
- The smokes found that the block gated only the panel. Codex still ran `architect` from pstack's Feature step on an unlisted plan, so dotai 6b0a360 holds `architect` and arena to the same list.
- The trail review and the smokes found that the rules still sent a review-only panel's result to a plan page and a decision log. dotai 3351651 and c7e67a0 let it answer in the reply, and plate-2's Babysit says the same.

What landed: dotai f47122c, 6b0a360, 3351651, 8fb6f60 and c7e67a0 on main; Ellie 19e023edd on `next`; both models sheets; the user-scope cross-review removal; both workflow guides. plate-2's config, AGENTS.md, playbooks, developer guide and templates stay uncommitted for the owner.

Proof: the sync-pstack tests, with the two new ones failing on the old script, and `sync-pstack check` and `verify` exit 0 in both projects. Plain-request smokes in Claude Code and Codex cover an API plan, an unlisted plan in each project, "review PR 5139", a table edit and an Ellie access change. The decision-trail review ran on a gpt-6.1-sol seat over f47122c and 6b0a360 and raised three warnings, all applied. dotai 3351651, 8fb6f60, c7e67a0 and 096db95 came after it, from its own warning, the smokes and a writing pass, and had no second review. Limits: the table-edit and access-change smokes ran on the block before 6b0a360. When asked about conflicts, Codex still names the general link-only reply rule before saying the review-only exception wins.

Counts: 23 items. 21 done, 1 skipped (`lint:fix`: ultracite ignores `.agents`, so the Ellie change has no lintable file), 0 blocked, 1 open (reflect's lessons wait for your answer in the next iteration, `docs/plans/2026-10-03-panel-lessons.md`).

Open work:

- plate-2's changes from this iteration wait for the owner's commit. owner: Ziad, tracked in the subject file's Open work.
- plate-2 Babysit's main-line bullet says delivery runs "under the owner's standing authority", but AGENTS.md asks for an explicit request before a push. A Codex smoke flagged it, and it predates this iteration. owner: Ziad, tracked in the subject file's Open work.
