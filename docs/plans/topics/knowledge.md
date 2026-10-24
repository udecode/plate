# Plate knowledge layer

Page: https://claude.ai/artifact/Cp3hdNMXy9EvTQR7MQaNu3

Where Plate keeps what it learns about editors (behavior law and its proof, external-editor research, upstream issues and harvested tests, measurements, lessons, decisions and plans) and which workflow step reads and writes each piece. Every plan below is one iteration of this subject.

## Layer and owner

The state on 2026-10-24, after the landed phases of the [2026-10-06 knowledge plan](../2026-10-06-knowledge-reorg.md), which closed superseded by the [research loop plan](../2026-10-24-research-loop.md). The [docs one-home plan](../2026-10-17-docs-one-home.md) retired the decision pages on 2026-10-17.

| Knowledge job | Owner | Read by | Written by |
| --- | --- | --- | --- |
| Behavior law | `docs/editor-behavior/markdown-editing-spec.md`, with the protocol matrix, parity matrix and roadmap folded in | AGENTS.md's Source authority | Bug fix, Build, research |
| Behavior proof index | `[EDIT-…]` and `[<repo>#<n>]` tags at the end of test titles; `docs/editor-behavior/current-evidence.md` keeps rule families, surface limits and partial proofs | `pnpm kb gaps`, AGENTS.md's Source authority | whoever writes the test |
| External-editor evidence | one home per editor under `docs/research/sources/<home>/`, each with a README and area pages, plus the `yjs-collaboration` home; dated runs in `docs/plite/research`, audits in `docs/editor-audits`, clones in `..` and `../raw` | the research rule's What is known, Plan's What other editors do | the research rule's modes |
| Plite history | `docs/research/sources/plite/`, Plate's own Slate rewrite | the research rule | the research rule's modes |
| Upstream issues | `docs/editor-issue-harvester/<repo>`, `c70bacbd4a:docs/plite-issues`, the maintainer queue | typed `issue-harvester` and maintainer, `pnpm kb` | issue-harvester, maintainer |
| Harvested tests | `docs/editor-test-harvester/<repo>` | typed `research harvest`, `pnpm kb <editor>` | research harvest |
| Measurements | `benchmarks/targets`, `benchmarks/editor`, plans with Cause History, git-ignored `tmp/` | the benchmark rule and the Perf issue playbook | benchmark runners |
| Lessons | `docs/research/sources/plate-notes/*.md`, with the old `3b6e49c964:docs/solutions` notes compiled in | Bug fix and Perf issue playbooks | research's maintain mode |
| Verdicts and adoption | `docs/research/review-scopes`, `review-records`, review pages in plan front matter | the review ledger in API review, Plan and Build | Verdict playbook |
| Current conclusions | the scope's subject file, `docs/plans/topics/<scope>.md`, which the ledger lookup names; one-feature rules sit under its `## Rules` | lookup, plan pages | API review, plan fold |
| Plans and trails | active plans and subjects in `docs/plans`, beside 923 settled legacy plans the review ledger indexes; 1,107 more sit in `../plate-archive/` outside git and open at `c70bacbd4a:<path>` | plan-page, review ledger | Plan, Build and other playbooks |
| Source inventory | `docs/research/homes.tsv` maps each run or page a reader homed; `kb homes` derives the rest from the path; `docs/research/folded.tsv` is empty | `kb check` (K15), `kb homes` and its K14 no-home check | the 2026-10-06 compile runs; no research mode writes rows |
| Run evidence | `docs/plite/research/<run>` (21 runs), `docs/research/probes` (13 committed captures, still growing), `docs/plans/artifacts` (ignored) | records and plans by path | research, benchmark, ad hoc |
| Knowledge checks and tool | `tooling/scripts/knowledge/` behind `pnpm kb`: a lookup by rule, issue, scope, path, editor or words, plus `check`, `gaps`, `homes` and the compile verbs `fold`, `write`, `resolve`, `quote` and `pins` | a full `pnpm check` only, since its step never runs under `--affected`; sweep rechecks and Bug fix for sweep finds | the knowledge module's owner |
