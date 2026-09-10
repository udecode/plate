# Reading research ledgers

Read the existing corpus ledger before interpreting backlog or closure.

- when closing a `docs/plite/research/**` lead, read that artifact's
  `lead-ledger.tsv`, `promoted-ledger.tsv`, and `read-log.tsv` first. Use exact
  source refs and owner files from those ledgers before any repo-wide `rg`.
  Broad current-tree or OSS scans are allowed only after the recorded anchors
  are missing, stale, or insufficient for the proof command;
- when parsing ledgers, match exact column names before fuzzy fallbacks. Prefer
  a literal `status` column over `decision`, `action`, or regex matches. Never
  infer backlog/open state from a `decision` column when a `status` column
  exists in the same TSV;
- when scanning research backlog/open status, parse work ledgers only:
  `lead-ledger.tsv`, `promoted-ledger.tsv`, issue closure ledgers, or an
  explicitly named action matrix. Do not count `repo-registry.tsv`,
  `read-log.tsv`, source registries, or other provenance metadata as open work
  just because they contain a `status`-like column;
- when classifying research status values, separate actionable backlog from
  accepted deferral. `promote-*`, `promoted-pending`, `queued-*`, `open`,
  `todo`, `candidate`, `needs-*`, and untriaged rows can be actionable. Statuses
  like `promoted-kept`, `promoted-existing`, `kept-*`, `covered`,
  `covered-existing`, `supporting`, `supporting-only`, `invalid-skip`,
  `rejected`, and `closed` are closed. Statuses starting with `deferred-*` or
  legacy `defer` are queued stopping checkpoints, not work to "fix" during a
  timed run unless the active packet deliberately takes that owner;
- do not broad-search `docs/editor-issue-harvester/**` or raw issue JSON just
  to learn ledger status. Parse `issue-closure-ledger.md` / `.tsv` directly
  for the `check` column, `unchecked relevant`, total rows, and next unchecked
  issue;
- before writing one-off reducers over generated benchmark, ledger, or proof
  artifacts, inspect the artifact schema first: print the TSV header or JSON
  top-level keys, then parse the real field names. Do not guess columns such as
  `checked` when the ledger uses `check`, and do not guess benchmark summary
  keys before reading the artifact shape;

