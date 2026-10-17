---
extends: babysit
when: Use it to finish, perfect or clean up an existing PR or the current tree, or for "review PR <number>" on someone else's PR.
---

# Babysit

It finishes started work and never starts the next feature.

- **Before** "Declare the mode and resolve the forge before any poll": "review PR <number or URL>" on someone else's PR is review-only (reviews: external-pr). Run the panel on its diff, briefed with the PR body, its linked issue and any plan it carries in `docs/plans`, and have it judge whether the change should exist, whether its design is right, and the code. Return the findings in the reply and stop. The run keeps no plan, page or decision log, so it has no decision-trail review, and it makes no edits, commits, pushes, replies or review submissions.
- **Before** "Declare the mode and resolve the forge before any poll": resolve the candidate, either a PR's diff, body, checks and review threads through `gh`, or the current tree's intended change without other sessions' edits. Lead with a candid verdict on whether the change should exist and its strongest justified cut, running `verdict` when an API or architecture decision changes that verdict. Repair what the verdict keeps at its owner (the Bug fix playbook for a defect, the Refactoring playbook for code shape), so callers, docs, examples, generated registry output, changesets and barrels end coherent, and prove it with `verify`. For a PR you opened, write its description and history with `make-pr-easy-to-review`. On another person's PR, leave their description and history alone and keep one comment about your commits, as the `plan-page` skill's PR section says. The current tree skips the Babysit steps. Commit the repair and push it to the PR's head branch without asking, under `AGENTS.md`'s Delivery rule, unless that branch is `main` or `next`. Any other PR comment, thread replies, closing, history rewrites and merging each need the owner's word for that action, because this repository is public and a PR's author may be outside the team. Until then, the thread replies the steps below prepare stay drafts.
- **Plan page.** A PR babysit that repairs the PR, unlike the review-only one above, keeps its plan and decision log in this repository's `docs/plans`. It publishes the plan page before the first review round.
- When PR feedback states an objective, low-ambiguity rule, treat it as a confirmed rule violation and run the Bug fix playbook's Pokayoke audit of its whole governed area, decide the ambiguous instances once, and report those extra fixes apart from the comment you answered. A taste or architecture comment gets one decision or a pushback draft; one that changes a reusable public API goes to Best API.
- **Before** "Stop at the human's line": before calling a PR ready, run `pstack:thermo-nuclear-code-quality-review` on its diff, with the split law in `.agents/playbooks/refactoring.md` overriding its size-based split advice, and fix or answer every finding.

## Current-tree closure

Clean means:

- no verified in-scope finding remains unresolved, and structured review passed or is recorded as not applicable;
- every accepted code-shape finding (shallow modules, over-splits, fake wrappers, ownership confusion, duplicated helpers, navigation friction) is fixed through the Refactoring playbook, rejected, or routed with owner and reason;
- the coherence audit found no stale dirty fix, fake alias, docs and API mismatch, orphan test, obsolete generated output, weak command, missing changeset where package policy requires one, or violated Slate and Plate boundary;
- when the diff materially changes public API, `best-api review` ran and every P0 and P1 finding is resolved or explicitly rejected;
- required focused proof after the last patch passes or is explicitly N/A;
- generated outputs affected by the diff are synced or intentionally absent;
- docs, API, examples and tests are coherent with current source;
- no dirty speculative half-patch remains;
- the files called clean are in the current checkout; a captured PR or range diff is not current-tree clean until applied and verified here.

Clean is a ledger state, not a vibe: one terse review is not clean.

Review comments become sweeps only where they generalize: prefer one coherent follow-up refactor over many tiny copy-paste fixes, keep the blast radius proportional to confidence, and call out a sweep that depends on another PR. Naming preferences, broad architecture changes without repo evidence, weakly general style choices, public API widened for local convenience, and anything that cannot be explained in one sentence are not sweep targets. An outdated review thread is not stale by default: `isOutdated` means the hunk moved, so relocate the concern by source text, path and surrounding code before deciding.
