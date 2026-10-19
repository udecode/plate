# Editor Issue Harvester

This directory is the durable workspace for external editor issue-harvest
closure ledgers.

Use one repo folder per source:

```txt
docs/editor-issue-harvester/<repo>/
docs/editor-issue-harvester/<repo>/full/
```

Keep these artifacts here:

- compact issue indexes
- cluster and matrix summaries
- issue closure ledgers
- issue closure overrides
- owner, proof, and verification-command decisions

Keep these artifacts out of docs:

- raw issue bodies
- raw comments
- hydrated GitHub JSON
- source-adjacent scratch cache

Raw cache belongs under:

```txt
.tmp/editor-issue-harvester/<repo>/raw/
```

Do not copy issue bodies or comments into this directory. Link issue URLs and
write fresh local invariant language instead.
