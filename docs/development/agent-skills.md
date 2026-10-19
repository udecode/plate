# Agent skills

`AGENTS.md` is the repository instruction source. Claude reads it through
`CLAUDE.md`; Codex reads it directly. pstack is pinned to v0.9.88 and supplies
the engineering lifecycle. Install the plugin in each runtime and trust its
session hook. Project skills supplement it with Plate-specific methods.
`/cleanup` frees disk by removing the agent worktrees and Next.js caches that
no session or server uses.

`pstack:poteto-mode` selects the playbook for multi-file, design and unexplained
bug work. Questions and small local edits work directly. The seven project
playbooks in `.agents/playbooks` apply Plate routing and proof to those steps.

`plate-plugins` owns Slate-based plugin/package work; `plate-ui` owns React,
copied UI and kits; `plate-docs` owns public docs. `best-api` decides call shapes,
`verdict` judges whether work is worthwhile, and `research` supplies prior art.
`verify` chooses honest proof and `benchmark` owns performance decisions.
Maintainer and issue-harvester handle live public intake and corpus coverage.
Changeset and release-lanes own release notes and explicitly requested releases.

`pnpm run prepare` runs Skiller and copies local rule resources into their
generated skills. Claude links point to the same skill directories. Run
`pnpm check:workflow` after generation. It checks the exact 25-name inventory,
mirrors, local links, locks and plugin pin. The root check and CI run it too.
Run the plugin's `skills/poteto-mode/scripts/check-playbooks.mjs` after a
playbook edit. pstack helpers under `.agents/pstack` are shared copies.

Work that spans sessions or goes into a PR keeps its plan under `docs/plans`,
with its decision log beside it; other work keeps its log local and replies in
chat. `plan-page` renders local HTML under ignored `docs/plans/artifacts`. Codex links the local
page. Native behavior needs matching browser proof; a workflow routing smoke
does not prove editor behavior.

No single command, proof, review seat or wait on the machine runs longer than
an hour. A measurement that needs longer, such as a soak or a multi-round
timing protocol, becomes a suggested task that you start when you want it, and
the run's close never waits on it.

Ordinary completed work uses a topic branch and PR into main. Beta-only work
targets next. Main and next are never direct push defaults. The lead edits and
verifies; subagents research and review. API plans get architect and plan
review, API builds get diff review, and every new PR gets a diff panel. A
change to agent instructions gets one round, and its fixes land without another.
Public comments, reviews, merges and releases require explicit authority.

The template preset is a smaller consumer-app setup. CI regenerates template
output from its source. Root maintainer skill count does not include templates.

`node tooling/scripts/sync-workflow-source.mjs --check` confirms the owners
match the recorded plate-2 commit plus the adaptations. It reads the sibling
`../plate-2` checkout, so it runs by hand after a sync rather than in CI.
For the sync, its mapping rules and retired command owners, see
[pstack sync](pstack-sync.md).
