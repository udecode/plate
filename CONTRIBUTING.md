# Contributing to Plate

## Quick Links

- **GitHub:** https://github.com/udecode/plate
- **Docs:** https://platejs.org/docs
- **Discussions:** https://github.com/udecode/plate/discussions
- **Discord:** https://discord.gg/mAZRuBzGM3

## Maintainers

- **Ziad Beyens** - Creator
  - GitHub: [@zbeyens](https://github.com/zbeyens)

- **Felix Feng** - Core maintainer
  - GitHub: [@felixfeng33](https://github.com/felixfeng33)

## How This Repository Works

- Plate's shipped code, Plite included, lives here under the MIT license.
- Tests, plans and research live in a private team repository. A clone of this repository has the code without its tests.
- You contribute by filing an issue with a reproduction. The team writes every fix and closes pull requests from outside the team.

## How to Contribute

1. **Bugs** -> Open a bug report with a real reproduction. The team fixes bugs with a public repro first.
2. **Features** -> Open a feature request, or start a [GitHub Discussion](https://github.com/udecode/plate/discussions) first for a larger idea.
3. **Questions** -> Use [Discussions](https://github.com/udecode/plate/discussions) or [Discord](https://discord.gg/mAZRuBzGM3).
4. **Security** -> Report vulnerabilities privately through [a security advisory](https://github.com/udecode/plate/security/advisories/new).

## Bug Reports Are Agent Intake

The bug form is written for execution, not storytelling.

Maintainers usually work bugs through a local coding agent (Claude Code or Codex) running the `maintainer` skill and pstack's Bug fix playbook in a maintainer checkout. There is no hosted bot or API worker that can recover missing context from your machine, private account, or unstated setup.

- Focused local regressions fit the Bug fix playbook
- Cross-package, public API, architecture, and performance work often fit `best-api`, the Plan playbook or `benchmark`

If a field cannot be answered from evidence, write exactly `NOT_ENOUGH_INFO`.

What we want:

- a one-line summary of what broke
- deterministic reproduction steps
- expected behavior grounded in docs, a known-good version, or prior observed behavior
- actual behavior grounded in logs, screenshots, or direct observation
- acceptance criteria for the fixed state
- last-known-good and first-known-bad versions when this is a regression
- whether the issue is Slate substrate, Plate framework, docs/examples, or unclear
- browser/editor proof when the bug is visible in the editor
- exact environment details
- a minimal code or config excerpt when the repro is small enough to paste
- one issue per submission

Public repros beat screenshots every time.

If the same issue reproduces in plain Slate without Plate-specific code, open it in [Slate](https://github.com/ianstormtaylor/slate/issues), not here.

Issues without enough grounded evidence may be marked `Needs reproduction` in the Triage field, deprioritized, or closed.

## Current Focus

We are currently prioritizing:

- **Stability**: fixing regressions in editor behavior, selection, tables, clipboard, and serialization
- **DX**: clearer APIs, better docs, better examples, fewer sharp edges
- **Performance**: large-document editing, render churn, and expensive normalization paths
- **Docs & examples**: keeping `platejs.org` and registry examples in sync with the actual latest state

Check the [GitHub Issues](https://github.com/udecode/plate/issues) for active bugs. If an open issue matches yours, add your reproduction there instead of opening a new one.
