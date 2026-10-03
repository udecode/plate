# Cut drift from pstack, and an audit that keeps it cut

Status: executed
Topic: pstack

## Public API

A drift audit you can run.

```text before
(no skill-drift audit; sync-pstack status reports only block drift)
```

```text after
/sync-pstack audit <project>    (node scripts/audit.mjs lists facts and candidates; /pstack:interrogate judges cut, fold or keep)
```

Cut skills, one pair each, with what replaces it.

```text before
$autogoal <goal>
```

```text after
the goal in plain words    (pstack's Autonomous run; Codex /goal; three goal sentences in Long runs)
```

```text before
$gpt-pro <question>
```

```text after
/pstack:interrogate    (Codex seats give the other-model review)
```

```text before
/show-me <topic>
```

```text after
pstack:teach, or an Artifact
```

```text before
/improve <budget>
```

```text after
/ui-audit, or a plain "improve this for an hour"    (Autonomous run)
```

```text before
/prototype <idea>    (Ellie's rule)
```

```text after
"prototype <idea>"    (pstack's Prototype playbook; Ellie's bullets in AGENTS.md)
```

```text before
/next-dev-loop
```

```text after
verify's runtime reference    (now holds the Next MCP tool list)
```

```text before
/sync-vision
```

```text after
(retired)
```

```text before
$plate-architecture <question>
```

```text after
the Plan playbook    (its layer gates move to a reference plan.md loads)
```

```text before
$autoreview
```

```text after
/pstack:interrogate
```

```text before
$typescript-advanced-types, $vercel-composition-patterns
```

```text after
pstack:typescript-best-practices, plate-ui's own rules
```

```text before
$cross-review <plan>    (its own checklist, scale and rounds)
```

```text after
$cross-review <plan>    (session discovery feeding /pstack:interrogate)
```

## Main changes

- **The verdict: cut copied law, keep the skills.** Three read-only lanes compared every skill in Ellie, plate-2 and dotai with pstack 0.9.54, and two panel rounds checked the result. Almost every project skill holds domain knowledge pstack cannot have and stays. The drift is process law that pstack or the block already owns, copied into skill files and sometimes contradicting it. plate-2's rules hold 19,626 lines (`git ls-files` of `.agents/rules` `.md` and `.mdc`, piped to `wc -l`) against 6,785 in pstack's skills (`find skills -name '*.md' | xargs cat | wc -l`).
- **An audit you can run.** `scripts/audit.mjs` is its own entry point, and SKILL.md's Audit mode runs it.
  - For each skill it lists the source, the typed count and the inbound routes.
  - User-scope skills are counted across every project's transcripts. A `[$name](path)` hit counts for the skill at that path, and a hit inside a long pasted message does not count.
  - It reports installed copies that differ from their source.
  - It lists overlap candidates: text repeated from pstack, the block, the project's other skills, or AGENTS.md outside the block.
  - The mode then hands that report to `/pstack:interrogate`, with a cut, fold or keep rubric.
  - `typedInvocations` is fixed once, for `discover`, `verify` and `audit` alike.
- **Block rules must say how they relate to pstack.** Each block bullet carries an `overrides` note or an adds-only marker. `verify` flags a bullet with neither, so no new contradiction ships without a note.
- **dotai.**
  - `autogoal` and `gpt-pro` are cut. autogoal's three goal-tool sentences move into the block's Long runs rule: reuse an existing goal, the blocked threshold, and never complete just to stop.
  - `upstream-skills.json` drops `prototype`, `find-skills` and `show-me`.
  - `cross-review` keeps its session discovery and feeds the author's asks, plan and commits to `/pstack:interrogate`. Its own checklist, P0 to P3 scale and round rules go.
  - The block gets the six notes below, the Long runs sentences, an adds-only marker on every other bullet, and a Review rule without autoreview or the sentences Panel review already says.
  - `video-transcripts` drops `disable-model-invocation`, which blocks the agent routes that load it.
- **Ellie.**
  - `improve` is cut, and `ui-audit` stops fanning out edits. The approved wording was "its lane table moves into `ui-audit`"; the build drops the table instead, because seven of its eight lanes are not UI and `ui-audit` already owns the UI lane and its whole-class sweep. Say "move the lane table" to reverse it.
  - The `prototype` rule is cut; its three Ellie bullets become one AGENTS.md line beside pstack's Prototype playbook.
  - `next-dev-loop` is cut at your word, overriding f39a33c51. Its Next MCP tool list moves into `verify/references/runtime.md`, and AGENTS.md:73,85,95 change with it.
  - `done-claims.md` and `reference-comparison.md` are cut. The miss list moves into `product-fidelity.md`, which also loses its self-contradiction and its copied proof text. Two provider-preflight sentences move into `environment.md`.
  - Shared resources says "facility migration".
  - The six `inngest-*`, `next-cache-components-adoption`, `autoreview` and the project `find-skills` are uninstalled.
- **plate-2**, left uncommitted for you, through a per-rule disposition table:
  - `sync-vision` is retired, with its routes and `docs/vision/sync.md` updated;
  - `plate-architecture` folds into a reference that `plan.md` loads, and its about 15 callers are repointed;
  - `autoreview`, `typescript-advanced-types`, `vercel-composition-patterns` and `optimise-github-actions` are uninstalled, with plate-ui's Vercel section and `docs/development/agent-skills.md:131` updated;
  - maintainer drops its dormant heartbeat, standing orders and fallback ladder;
  - the feature pack's Plate-only rules move to `plate-plugins` before its process copies go;
  - sync-shadcn's "invoke again" and its plan location are fixed;
  - **best-api dedup moves to its own plan**, at your answer on 2026-10-03. The read-only map found 253 rules, 36 with conflicting copies (5 where best-api is out of date, 2 that need your ruling: AI previews and whether `api` may mutate) and seven files that require each law change in both Vision and best-api. This build only repoints best-api-review's plate-architecture link.
  - sync-vision's committed-range baseline accounting (`lastSyncedCommit` and its six-way classification) has no successor; panel round 1 flagged it and you retired the lane anyway. Its promotion rule moves to `VISION.md` and its taste-capture rule to `docs/vision/common.md`.
  - plate-architecture had about 45 caller lines, not 15. Another session had staged an edit to its Page sections intro (rendering through the Plan playbook's `page-lead` frontmatter); the new reference carries that wording.
- **User scope.** Every orphan dotai cut on 2026-09-30 is backed up and deleted, typed ones too, because each has a pstack replacement.

### The six overrides notes

| Block rule | pstack text it overrides |
| --- | --- |
| Tests: the failing test lands with the fix | `bug-fix.md` step 5: the failing repro lands before the fix |
| Panel review: the lead applies what the ask needs | `interrogate/SKILL.md`: do not auto-apply changes |
| Writing passes: `technical-writing` is a reference | poteto-mode: docs and commit messages go to `technical-writing` |
| Long runs: in push delivery, a pause checkpoint stays local | `pause-safely.md` step 3: commit a `wip:` commit |
| Plan pages: the plan shape | `multi-phase-plan.md` steps 4 and 6: pstack's skeleton and `check-plan.mjs` |
| The lead writes the code: verify replaces the swarm lanes | `multi-phase-plan.md`: swarm lanes |

The note that names "Reversible work and external actions" moves back above the Messages rule it was written for.

### What stays and why

| Skill | Evidence |
| --- | --- |
| verify `testing audit` | Plans coverage for uncovered files; test-audit prunes existing tests |
| ui-audit | Typed 9 times, 4 this week; owns the gallery and route denominators |
| cross-review | Rebuilt on interrogate; its session discovery recovers the author's asks |
| numbered-checkout, product-fidelity | Ellie's `task:checkout` helper and its document-sharing journey |
| docuseal, rate-limiter-flexible, sentry-sdk-setup | Ellie's DocuSeal data and IM parity; a kept skill's parent |
| sync-pstack, test-audit, walkthrough, video-transcripts | No pstack equivalent; used or routed |
| The domain skills | verify, design, atlas, react, trpc, prisma, pcc-api, to-prd, to-issues, best-api, best-api-review, plate-next, plate-ui, plate-docs, plate-plugins, changeset, benchmark, research, maintainer, release-lanes, issue-harvester, sync-shadcn, sync-plate-ui |

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Where the audit lives | `scripts/audit.mjs` run by a sync-pstack Audit mode, judged by interrogate | A separate skill | "separate skill" |
| Cut list | The cuts above, picked by you on 2026-10-03 | Keep any of them | "keep <skill>" |
| best-api dedup | Its own plan, [2026-10-03-best-api-dedup.md](2026-10-03-best-api-dedup.md), picked by you after the map | In this build | "dedup now" |
| User-scope orphans | Back up and delete all, picked by you | Untyped only | "untyped only" |
| Delivery | dotai and Ellie push after their trail review; plate-2 stays uncommitted for you | Hold everything | "hold commits" |

## Steps

Each project runs its edits, the writing passes, lint, `verify` and `audit`, then its trail review and push. Each changed dotai skill is reinstalled before any smoke that uses it.

1. - [x] **Audit.** `scripts/audit.mjs`, the `typedInvocations` fix, the block marker check in `verify`, the Audit mode in SKILL.md and an updated description. Proof: tests that fail first. They cover a pasted hit and a real typed hit, a skill typed only in a third project, and a block bullet whose note was removed. `audit` must list each skill in this plan's tables with its evidence. A plain "are my skills drifting from pstack?" must route to it in both runtimes. Closed by dotai `skills/sync-pstack/scripts/audit.mjs`, `node --test skills/sync-pstack/scripts/sync-pstack.test.mjs` (73 pass, each new test mutation-checked) and scratch `smoke-dotai-ellie.txt`.
2. - [x] **dotai.** The autogoal and gpt-pro cuts, `upstream-skills.json`, the cross-review rebuild, the six notes, the Long runs sentences, the moved note, the markers, the Review trim and the video-transcripts flag. Proof: `scripts/validate-skills`; `apply` then `verify` on both projects; a plain-request smoke for a long run in Codex and one for "cross-review this plan" in both runtimes. Closed by dotai a2d7e48, `scripts/validate-skills` (skills ok), two execution panel rounds (decision log, phase panel) and the plain-request smokes on the final bytes (scratch `smoke-final-ellie.txt`, `smoke-final-plate.txt`); Codex's audit routing is partial.
3. - [x] **Ellie.** The five cuts, ui-audit, product-fidelity, environment.md, Shared resources, AGENTS.md and the eight uninstalls. Proof: `sync-pstack verify`; a grep for every deleted path; `bun run check:review-atlas`; plain-request smokes for a UI audit and a prototype in both runtimes. Closed by Ellie 284897d1f, `sync-pstack verify` (verified), `bun run check:review-atlas` (55 routes, 567 scenes) and scratch `smoke-ellie-step3.txt` and `smoke-ellie-prototype2.txt`; Codex's prototype routing is partial.
4. - [x] **plate-2 cuts.** The disposition table, then the sync-vision retirement, the plate-architecture fold, the uninstalls, maintainer, the feature-pack move and sync-shadcn. Proof: `sync-pstack verify`; a grep for every deleted path; `sync-resources.mjs --check`; the `.agents/rules` suites and `check-plate-feature.test.mjs`; a plain-request smoke for a feature plan. Closed, uncommitted for the owner, by `sync-pstack verify` (verified), `sync-resources.mjs --check` (exact), `version.mjs validate` (registry valid), the `.agents/rules` suites and `check-plate-feature.test.mjs` (154 pass) and scratch `smoke-plate-feature.txt`; the edit list is scratch `map-plate-step4/step4-edits.tsv`.
5. - [x] **best-api dedup.** skip: moved to its own plan at the owner's answer on 2026-10-03, `docs/plans/2026-10-03-best-api-dedup.md`, with its rule map beside it.
6. - [x] **User scope.** Back up every orphan to scratch, delete it from `~/.agents/skills` and `~/.claude/skills`, check that no dangling link is left, and reinstall every changed dotai skill. Closed by the Step 6 build row (23 orphans backed up to scratch `user-scope-backup/` and deleted, no dangling link) and the global reinstall of sync-pstack, cross-review and video-transcripts at a2d7e48.
7. - [x] **Close.** `sync-pstack audit` on both projects after the last edit shows the dropped copies; the pstack page republished. Closed by scratch `audit-final-ellie.txt` and `audit-final-plate.txt` (no cut skill listed, no unmarked block rule; plate-2's stale video-transcripts reinstalled from dotai), the delta folded into `docs/plans/topics/pstack.md`, and `plan-page.mjs --folded`.

## Deferred

- owner: zbeyens, tracked here: typedMessages takes a path or a Symbol and counts through an out-parameter; a cwd predicate and an explicit list would read more plainly.
- owner: zbeyens, tracked here: audit.mjs and sync-pstack.mjs keep three directory walkers and two `readJson` helpers, and a malformed `<!-- # overrides` line is neither checked nor flagged.
- owner: zbeyens, tracked here: an audit run takes about four minutes because discover and the user-scope count each read every Codex session.
- owner: zbeyens, tracked here: Codex sessions with made-up `rollout-N` turn ids share a dedup key, a small undercount.
- owner: zbeyens, tracked in `docs/plans/2026-10-03-best-api-dedup.md`: the best-api dedup.
- owner: zbeyens, tracked here: `plan-open.mjs` accepts a closed box citing a file that does not exist; resolve cited paths and fail on a missing one.
- owner: zbeyens, tracked here: the apply refusal for uncommitted shared edits fires after those edits land and prints no diff; say so and print the in-block diff `--force` would discard.
- owner: zbeyens, tracked here: `dropped` also silences verify's retired-name scan, so plate-2 templates still carry "P1 autoreview gate"; `dropped` should silence only the typed check.
- owner: zbeyens, tracked here: sync-pstack's `typedMessages` and cross-review's `typedAsk` decide "what a person typed" differently; one corpus sampled from real Claude and Codex records should run in both suites, the external formats get a comment, and audit output prints each exclusion's drop count.
- owner: zbeyens, tracked here: better-convex, plate and informed-fe-v3 still source autogoal from dotai in `skills-lock.json`, and their sync driver sync-skills is deleted; decide what they lose and tell their owners.
- owner: zbeyens, tracked here: `smoke` judges prose; it should report which SKILL.md and playbook files each session read, diff `git status --porcelain` for index writes, and refuse a stale user-scope dotai install.
- owner: zbeyens, tracked here: retiring a plate-2 rule needs a hand-added `retiredGeneratedPaths` entry; `sync-resources.mjs --check` should flag a generated skill with no source rule.
- owner: zbeyens, tracked here: the sync-pstack test sandbox should real-path its HOME instead of tests doing it by hand.
