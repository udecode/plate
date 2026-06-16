# Maintainer Runs

This directory stores compact maintainer heartbeat run notes when a run creates
state future Codex sessions should not rediscover.

Use one file per non-trivial heartbeat:

```txt
docs/maintainer/runs/YYYY-MM-DD-<mode-or-item>.md
```

Each note should record:

- queue snapshot path and freshness;
- selected item and why it won;
- rejected/skipped candidates;
- owner route;
- proof command or blocker;
- public mutation boundary;
- changed files;
- needs-attention rows;
- next heartbeat.

Do not dump raw issue threads here. Link the live issue, PR, advisory, or queue
artifact and keep the note short enough to read before the next run.
