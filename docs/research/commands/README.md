# Research Commands

This directory contains command specs for operating the research layer.

Primary reusable entrypoint:

- [$research-wiki](.agents/skills/research-wiki/SKILL.md)

These pages are not knowledge pages like `sources/` or `concepts/`.
They are operational docs that describe repeatable agent workflows.

Use them to define:

- full ingest-and-compile passes
- maintenance passes
- per-corpus completion rules for `full` mode
- official-source discovery checks before declaring corpus gaps
- local-raw exhaustiveness rules before declaring `evidence gap`

Current commands:

- [full-pipeline.md](docs/research/commands/full-pipeline.md)
  The full-mode sub-workflow used by `research-wiki`.
- [maintain.md](docs/research/commands/maintain.md)
  The maintain-mode sub-workflow used by `research-wiki`.
