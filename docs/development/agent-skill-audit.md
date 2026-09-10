# Plate skill audit and final set

Implemented in `/Users/zbeyens/git/plate-2`, on `next`. The selected design scores **97/100** under the stated preservation, ownership, discovery, proof and maintenance rubric. That score is engineering judgment; it is not a performance benchmark.

The resulting set has **39 local skills and 57 shared/vendor skills**, including **40 full pstack ports**. Ten local entrypoints were absorbed or removed, Verify Plate was added, and Sync Shadcn was split by mode. Developers start ordinary work with Task.

## Architecture decision

| Proposal | Score / 100 | Decision |
| --- | ---: | --- |
| Install pstack alongside every current controller | 63 | Rejected |
| Collapse domain workers into a minimal general master | 55 | Rejected |
| Single Task lifecycle with full pstack and distinct domain workers | 97 | Selected |

The selected design preserves Best API, Plate Plan, Plite Plan, Plate Feature, Plugin Creator, Plate UI, Regression, Benchmark and the other domain methods. They own different technical decisions. Task owns their shared lifecycle and review budget. Auto supervises explicitly requested autonomous scope. Native goals and publication retain their actual authority boundaries.

## Complete original skill accounting

All 48 local entrypoints and their method references were read. The detailed audit retains every source, score, reason, correction and coverage limit. Scores below measure the value of preserving the method; a useful method can still belong under another owner.

| Original local skill | Value / 5 | Final disposition |
| --- | ---: | --- |
| `agent-browser-issue` | 2 | Merge full tool-report recipe into Verify Plate |
| `architecture-cleanup` | 5 | Keep full local method; apply common Task contract and audited source corrections |
| `auto` | 5 | Retain explicit supervision; move complete runtime recipes into Verify Plate |
| `autoclosure` | 4 | Merge full closure method into Task |
| `benchmark` | 5 | Keep full local method; apply common Task contract and audited source corrections |
| `best-api` | 5 | Keep full local method; apply common Task contract and audited source corrections |
| `changeset` | 5 | Keep full local method; apply common Task contract and audited source corrections |
| `clawpatch` | 3 | Merge full optional CLI method into Task |
| `clawsweeper` | 4 | Keep full local method; apply common Task contract and audited source corrections |
| `docs-creator` | 4 | Keep full local method; apply common Task contract and audited source corrections |
| `editor-audit` | 5 | Keep full local method; apply common Task contract and audited source corrections |
| `editor-test-harvester` | 5 | Keep full local method; apply common Task contract and audited source corrections |
| `github-issue-reporter` | 4 | Keep full local method; apply common Task contract and audited source corrections |
| `gpt-pro` | 4 | Keep full local method; apply common Task contract and audited source corrections |
| `grill-me` | 3 | Keep full local method; apply common Task contract and audited source corrections |
| `hard-cut` | 5 | Keep full local method; apply common Task contract and audited source corrections |
| `issue-harvester` | 4 | Keep full local method; apply common Task contract and audited source corrections |
| `maintainer` | 4 | Keep full local method; apply common Task contract and audited source corrections |
| `major-task` | 5 | Merge full complex-work method into Task |
| `patch` | 5 | Keep full local method; apply common Task contract and audited source corrections |
| `performance` | 5 | Keep full local method; apply common Task contract and audited source corrections |
| `plate-feature` | 5 | Keep full local method; apply common Task contract and audited source corrections |
| `plate-next` | 5 | Keep full local method; apply common Task contract and audited source corrections |
| `plate-plan` | 5 | Keep full local method; apply common Task contract and audited source corrections |
| `plate-plugin-creator` | 5 | Keep full local method; apply common Task contract and audited source corrections |
| `plate-review` | 5 | Keep full local method; apply common Task contract and audited source corrections |
| `plate-ui` | 5 | Keep full local method; apply common Task contract and audited source corrections |
| `plite-plan` | 5 | Keep full local method; apply common Task contract and audited source corrections |
| `plite-research` | 5 | Keep full local method; apply common Task contract and audited source corrections |
| `potion-yjs-browser-test` | 4 | Merge full reference profile into Verify Plate |
| `promote-beta` | 1 | Cut redundant compatibility wrapper; Release Lanes owns promotion |
| `registry-changelog` | 5 | Keep full local method; apply common Task contract and audited source corrections |
| `regression` | 5 | Keep full local method; apply common Task contract and audited source corrections |
| `release-lanes` | 4 | Keep full local method; apply common Task contract and audited source corrections |
| `research-wiki` | 4 | Keep full local method; apply common Task contract and audited source corrections |
| `resolve-slate-issue` | 3 | Merge full Slate issue mode into Maintainer |
| `review-sweep` | 4 | Merge full feedback-pattern method into Task |
| `shadcn-parity` | 5 | Keep full local method; apply common Task contract and audited source corrections |
| `slate-ar` | 4 | Keep full local method; apply common Task contract and audited source corrections |
| `slate-migration` | 4 | Keep full local method; apply common Task contract and audited source corrections |
| `sync-main-to-next` | 2 | Merge full fast sync mode into Release Lanes |
| `sync-plate-ui` | 4 | Keep full local method; apply common Task contract and audited source corrections |
| `sync-shadcn` | 4 | Split full method into six linked mode/policy references |
| `sync-vision` | 5 | Keep full local method; apply common Task contract and audited source corrections |
| `task` | 5 | Single lifecycle; full local recipes plus full Poteto methods |
| `testing` | 5 | Keep full local method; apply common Task contract and audited source corrections |
| `testing-review` | 4 | Keep full local method; apply common Task contract and audited source corrections |
| `vision` | 3 | Route through Task source authority and VISION.md |

## Existing shared and vendor skills

All 17 installed entrypoints were read and scored. Five shared owners were refreshed. Orchestrator, TDD, Unslop and all nine protected vendor installations remain unchanged. Autogoal also received a tested source repair that preserves Plate’s project gate tables.

| Existing skill | Value / 5 | Decision |
| --- | ---: | --- |
| `agent-native-reviewer` | 5 | refresh-shared |
| `autogoal` | 5 | refresh-shared |
| `autoreview` | 4 | keep-protected |
| `diagnosing-bugs` | 4 | keep-protected |
| `grill-with-docs` | 3 | keep-protected-reference |
| `orchestrator` | 3 | keep-frozen-explicit |
| `prototype` | 4 | keep-protected |
| `resolve-pr-feedback` | 4 | refresh-shared |
| `shadcn` | 5 | keep-protected |
| `tanstack-virtual` | 3 | keep-protected-reference |
| `tdd` | 4 | keep-shared-current |
| `typescript-advanced-types` | 2 | keep-protected-reference |
| `unslop` | 5 | keep-shared-current |
| `vercel-composition-patterns` | 4 | keep-protected-reference |
| `vercel-react-best-practices` | 4 | keep-protected-reference |
| `video-transcripts` | 4 | refresh-shared |
| `walkthrough` | 4 | refresh-shared |

## Every upstream pstack skill

Pinned upstream: `cursor/plugins` at `93b00b89ef425a9c1bac0d0b317dfc49c930ac99`. All 45 entrypoints and all upstream method Markdown, references, examples and prompts were read. The ports preserve 99 upstream files, with recorded Codex adaptations and license/provenance files. Platform-specific Cursor helper implementations excluded from the ports were inventoried, not reimplemented. Vendor support files that were not needed are individually disclosed in the coverage ledger.

| Upstream skill | Value / 5 | Decision |
| --- | ---: | --- |
| `architect` | 5 | Install full port |
| `arena` | 4 | Install full port |
| `automate-me` | 2 | Do not install: Personal style mining and a generated personal mode are not needed for this project skill topology. |
| `blast-radius` | 5 | Install full port |
| `bro` | 2 | Do not install: A tiny plain-language restatement adds no distinct capability beside Unslop, Teach and Technical Writing. |
| `create-verification-skill` | 5 | Install full port |
| `figure-it-out` | 5 | Install full port |
| `how` | 5 | Install full port |
| `interrogate` | 4 | Install full port |
| `maintain-verification-skill` | 5 | Install full port |
| `make-bot-ui` | 1 | Do not install: The method targets Cursor agent webhook dashboards, not Plate development. |
| `no-comments` | 4 | Install full port |
| `poteto-mode` | 5 | Install full port |
| `principle-boundary-discipline` | 5 | Install full port |
| `principle-build-the-lever` | 5 | Install full port |
| `principle-encode-lessons-in-structure` | 5 | Install full port |
| `principle-exhaust-the-design-space` | 5 | Install full port |
| `principle-experience-first` | 5 | Install full port |
| `principle-fix-root-causes` | 5 | Install full port |
| `principle-foundational-thinking` | 5 | Install full port |
| `principle-guard-the-context-window` | 4 | Install full port |
| `principle-laziness-protocol` | 5 | Install full port |
| `principle-make-operations-idempotent` | 5 | Install full port |
| `principle-migrate-callers-then-delete-legacy-apis` | 5 | Install full port |
| `principle-minimize-reader-load` | 5 | Install full port |
| `principle-model-the-domain` | 5 | Install full port |
| `principle-never-block-on-the-human` | 5 | Install full port |
| `principle-outcome-oriented-execution` | 5 | Install full port |
| `principle-prove-it-works` | 5 | Install full port |
| `principle-redesign-from-first-principles` | 5 | Install full port |
| `principle-separate-before-serializing-shared-state` | 5 | Install full port |
| `principle-sequence-verifiable-units` | 5 | Install full port |
| `principle-subtract-before-you-add` | 5 | Install full port |
| `principle-type-system-discipline` | 5 | Install full port |
| `recall` | 3 | Install full port |
| `reflect` | 4 | Install full port |
| `setup-pstack` | 4 | Install full port |
| `show-me-your-work` | 5 | Install full port |
| `swarm` | 4 | Install full port |
| `tdd` | 4 | Reuse existing full owner: The focused upstream method is useful but the complete existing shared TDD skill already owns this job. |
| `teach` | 4 | Install full port |
| `technical-writing` | 5 | Install full port |
| `typescript-best-practices` | 5 | Install full port |
| `unslop` | 5 | Reuse existing full owner: The existing full shared synthesis already includes pstack Unslop and stronger preservation/media rules. |
| `why` | 5 | Install full port |

## Concrete repairs

- Regeneration now discovers every owned support resource and checks all local skill bodies for both agents. Installed vendors are protected from source collisions and retired-owner cleanup.
- Feature completion accepts a justified skipped structured review while retaining required applicable proof.
- Issue publication verifies the exact saved body. Publisher checks run without pretending an unavailable recording integration passed.
- Sync Vision rejects a missing or incomplete plan before advancing. Preview cannot advance the real checkpoint.
- Shared Autogoal preserves project gate tables and their Applies/Evidence fields instead of flattening them into checkboxes.
- Domain teaching uses current plugin, schema, state and context APIs, Plate facade imports, registry generation rules and real command paths. Existing package attestations and doctrine history remain intact.
- Full CLI consumer setup, cache ownership and current/stale check controls are documented from a real run. Ordinary evidence is distinguished from Regression closure receipts.

## Evidence and limits

The [verification index](../plans/artifacts/2026-09-05-plate-skills/verification/README.md) records final commands and results. The [CLI trial](../plans/artifacts/2026-09-05-plate-skills/trials/verify-cli/README.md) drove one real generated consumer through current, stale and restored checks, then removed its scratch state while preserving evidence. The [small documentation trial](../plans/artifacts/2026-09-05-plate-skills/trials/small-doc/receipt.md) made the requested edit without a plan, native goal, tests, app launch or Git operations.

These checks establish source preservation, discovery, helper behavior and the selected CLI flow. They do not certify all application routes, native devices, collaboration, npm distribution or task-speed improvements. Protected vendor implementations were not rewritten. No commit, push, PR or release was performed.

Read the [developer guide](agent-skills.md) for normal use. Full source accounting lives in [the decision ledger](../plans/artifacts/2026-09-05-plate-skills/all-skill-decisions.json); the [plan](../plans/2026-09-05-plate-skill-redesign.md) links the baseline and audit evidence.
