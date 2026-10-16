# Agent skills

`AGENTS.md` is the repository instruction source. Claude reads it through
`CLAUDE.md`; Codex reads it directly. pstack is pinned to v0.9.82 and supplies
the engineering lifecycle. Install the plugin in each runtime and trust its
session hook. Project skills supplement it with Plate-specific methods.

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
`pnpm check:workflow` after generation. It checks the exact 24-name inventory,
mirrors, local links, locks and plugin pin. The root check and CI run it too.
Run the plugin's `skills/poteto-mode/scripts/check-playbooks.mjs` after a
playbook edit. pstack helpers under `.agents/pstack` are shared copies.

Plans live under `docs/plans`; decision logs sit beside them. `plan-page`
renders local HTML under ignored `docs/plans/artifacts`. Codex links the local
page. Native behavior needs matching browser proof; a workflow routing smoke
does not prove editor behavior.

No single command, proof, review seat or wait on the machine runs longer than
an hour. A measurement that needs longer, such as a soak or a multi-round
timing protocol, becomes a suggested task that you start when you want it, and
the run's close never waits on it.

Ordinary completed work uses a topic branch and PR into main. Beta-only work
targets next. Main and next are never direct push defaults. The lead edits and
verifies; subagents research and review. API plans get architect and plan
review, API builds get diff review, and every new PR gets a diff panel.
Public comments, reviews, merges and releases require explicit authority.

The template preset is a smaller consumer-app setup. CI regenerates template
output from its source. Root maintainer skill count does not include templates.

For migration details and retired command owners, see [pstack sync](pstack-sync.md).
