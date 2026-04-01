# Merge `origin/main` Into `codex/markdown-stream-perf-baseline`

## Goal

Bring the latest `origin/main` into the current branch, resolve conflicts cleanly, and keep the markdown streaming work intact.

## Steps

- [in_progress] Create a durable merge note
- [pending] Fetch `origin/main` and attempt merge
- [pending] Resolve conflicts
- [pending] Run focused verification on the conflicted areas

## Notes

- Preserve current branch intent around markdown streaming, parser vendoring, and demo/perf cleanup.
- Prefer the branch's newer behavior when main reintroduces deleted or superseded surfaces unless main clearly contains a newer fix.
