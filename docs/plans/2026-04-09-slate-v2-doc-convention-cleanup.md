# Slate V2 Doc Convention Cleanup

## Goal

Clean only the changed `slate-v2` markdown files that picked up internal
release-program language. Keep durable user-facing facts. Cut audit-style and
verdict-style noise.

## Scope

- root `Readme.md`
- changed walkthrough and concept docs where real guidance was added
- changed package/library readmes
- changed contributor docs only where internal test-program language leaked in

## Keep

- headless installation and composition guidance
- current operations/history collaboration boundary facts
- current normalization behavior, written as product docs instead of status
  bookkeeping
- package usage summaries when they help users

## Cut

- `POC RC`, `True Slate RC`, `Target A`, `Target B`
- proof-lane / verdict / roadmap accounting
- “replacement stack” framing in user-facing docs
- noisy internal performance or closure language
