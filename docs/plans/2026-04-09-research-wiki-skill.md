# Research Wiki Skill

## Goal

Turn the existing research command docs into a reusable `research-wiki` skill
and wire `editor-spec` to use it for research-layer work.

## Scope

- `.agents/rules/research-wiki.mdc`
- `.agents/rules/editor-spec.mdc`
- `docs/research/commands/full-pipeline.md`
- `docs/research/commands/maintain.md`
- `docs/research/commands/README.md`

## Requirements

- be lossless relative to the current command docs
- make `research-wiki` the reusable skill entrypoint
- keep `full-pipeline.md` and `maintain.md` as support docs or canonical
  sub-workflows
- teach `editor-spec` to prefer the new skill for research work
- make future broad/thin authority-sensitive passes do full corpus-level ingest
  instead of narrow spot checks
