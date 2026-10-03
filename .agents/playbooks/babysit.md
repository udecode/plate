---
extends: babysit
when: Use it to finish, perfect or clean up an existing PR or the current tree.
---

# Babysit

It finishes started work and never starts the next feature.

- **Before** "Declare the mode and resolve the forge before any poll": resolve the candidate, either a PR's diff, body, checks and review threads through `gh`, or the current tree's intended change without other sessions' edits. Lead with a candid verdict on whether the change should exist and its strongest justified cut, running `best-api-review` when an API or architecture decision changes that verdict. Repair what the verdict keeps at its owner (the Bug fix playbook for a defect, the Refactoring playbook for code shape), so callers, docs, examples, generated registry output, changesets and barrels end coherent, and prove it with `verify`. For a PR, write its description and history with `make-pr-easy-to-review`. The current tree skips the Babysit steps. Commits, pushes, history rewrites, PR comments and thread replies, closing and merging each need the owner's word for that action, except a main-line PR's delivery, which the next bullet covers. Until then, the push wave and the thread replies the steps below prepare stay drafts.
- **Main-line PRs.** A PR whose base is `main` belongs to `../plate`. Run it with this repository's skills, playbooks and rules; the `.agents` rules and skills in `../plate` are older copies and do not govern. Take only repository facts from `../plate`: its package scripts (`pnpm --filter <package> test`, `pnpm check`, `pnpm brl`), its Biome lint and its changeset format. Repair in a detached worktree of `../plate` at the PR's live head, with dependencies installed there, and never run `gh pr checkout` or switch a branch in `../plate` itself. Re-read the PR's `headRefOid`, body and comments before each review round, each claim taken from the forge and the delivery; when the head moved, bring the repair onto the new head and rerun the proofs it touches. Delivery is one shot under the owner's standing authority in `AGENTS.md`. Push the repair commit to the PR's head branch when maintainer edits are allowed, otherwise open a PR stacked on that branch.
- When PR feedback states an objective, low-ambiguity rule, fix every clear instance in the current diff, decide the ambiguous ones once, and report those extra fixes apart from the comment you answered. A taste or architecture comment gets one decision or a pushback draft; one that changes a reusable public API goes to Best API.
- **Before** "Stop at the human's line": before calling a PR ready, run `pstack:thermo-nuclear-code-quality-review` on its diff, with the split law in `.agents/playbooks/refactoring.md` overriding its size-based split advice, and fix or answer every finding.
- **In** "Stop at the human's line": call a PR merge-ready only after reading back its published head, checks, reviews and mergeability.

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
