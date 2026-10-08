# Plate knowledge layer

Page: https://claude.ai/artifact/MNPJqJ9Rak3Da5efc1i9j1

Where Plate keeps what it learns about editors (behavior law and its proof, external-editor research, upstream issues and harvested tests, measurements, lessons, decisions and plans) and which workflow step reads and writes each piece. Every plan below is one iteration of this subject.

## Layer and owner

The state on 2026-10-06, from eight read-only audits (`docs/plans/2026-10-06-knowledge-reorg.decisions.tsv`).

| Knowledge job | Owner | Read by | Written by |
| --- | --- | --- | --- |
| Behavior law | `docs/editor-behavior/markdown-editing-spec.md`, beside a protocol matrix, a parity matrix and a roadmap that overlap it | AGENTS.md close-out paragraph only | AGENTS.md close-out paragraph |
| Behavior proof index | `docs/editor-behavior/current-evidence.md`, by hand | no playbook | AGENTS.md close-out paragraph |
| External-editor evidence | five roots: `docs/plite/research/<run>`, `docs/research/sources`, `docs/research/decisions`, `docs/editor-audits`, `docs/research/raw`, plus an untracked `../raw` | the research rule; `review-ledger.mjs research` reads only `docs/plite/research` | the research rule's modes |
| Upstream issues | `docs/editor-issue-harvester/<repo>`, `c70bacbd4a:docs/plite-issues`, the maintainer queue | typed `issue-harvester` and maintainer only | issue-harvester, maintainer |
| Harvested tests | `docs/editor-test-harvester/<repo>` | typed `research harvest` only | research harvest |
| Measurements | `benchmarks/targets`, `benchmarks/editor`, plans with Cause History, git-ignored `tmp/` | the benchmark rule and the Perf issue playbook | benchmark runners |
| Lessons | `docs/research/sources/plate-notes`, 60 waiting `c70bacbd4a:docs/solutions` notes | Bug fix and Perf issue playbooks | none after the 2026-10-06 compile |
| Verdicts and adoption | `docs/research/review-scopes`, `review-records`, review pages in plan front matter | the review ledger in API review, Plan and Build | API review playbook |
| Current conclusions | ledger head, `docs/research/decisions/<scope>.md` and `docs/plans/topics/<subject>.md` all claim it | lookup, plan pages | API review, plan fold |
| Plans and trails | 2,148 plans and 43 decision logs in `docs/plans` | plan-page, review ledger | Plan, Build and other playbooks |
| Run evidence | `docs/research/probes` (committed), `docs/plans/artifacts` (ignored), `docs/plite/research` runs | records and plans by path | ad hoc |
