# Contributing to Plate

Welcome to the table.

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

## How to Contribute

1. **Bugs & small fixes** -> Open an issue with a real repro, or open a PR if you already have the fix.
2. **New features / architecture** -> Start a [GitHub Discussion](https://github.com/udecode/plate/discussions) or ask in Discord first.
3. **Refactor-only PRs** -> Don't open a PR. We are not accepting refactor-only changes unless a maintainer explicitly asks for them as part of a concrete fix or deliverable.
4. **Test/CI-only PRs for known `main` failures** -> Don't open a PR. If `main` is already red for that exact thing, maintainers are already looking at it. PRs that only chase known red `main` noise will be closed unless they are required to validate a new fix.
5. **Questions** -> Use [Discussions](https://github.com/udecode/plate/discussions) or [Discord](https://discord.gg/mAZRuBzGM3).

## Bug Reports Are Agent Intake

The bug form is written for execution, not storytelling.

Maintainers usually work bugs through Codex using [`task`](.agents/skills/task/SKILL.md) or [`major-task`](.agents/skills/major-task/SKILL.md).

- Focused local regressions fit `task`
- Cross-package, public API, architecture, and performance work often fit `major-task`

If a field cannot be answered from evidence, write exactly `NOT_ENOUGH_INFO`.

What we want:

- a one-line summary of what broke
- deterministic reproduction steps
- expected behavior grounded in docs, a known-good version, or prior observed behavior
- actual behavior grounded in logs, screenshots, or direct observation
- acceptance criteria for the fixed state
- exact environment details
- a minimal code or config excerpt when the repro is small enough to paste

Public repros beat screenshots every time.

If the same issue reproduces in plain Slate without Plate-specific code, open it in [Slate](https://github.com/ianstormtaylor/slate/issues), not here.

Issues without enough grounded evidence may be labeled `needs reproduction`, deprioritized, or closed.

## Before You PR

- Test locally against your actual Plate setup or against the minimal repro.
- Run the smallest relevant local lane first.
  - Package work:
    - `pnpm install`
    - `pnpm turbo build --filter=./packages/<package>`
    - `pnpm turbo typecheck --filter=./packages/<package>`
    - `pnpm lint:fix`
  - Broader confidence / PR gate:
    - `pnpm check`
- If you changed package exports or public file layout, run `pnpm brl`.
- If you changed published packages under `packages/`, add a changeset.
- If you changed only registry code under `apps/www/src/registry/**`, update `docs/components/changelog.mdx` instead of adding a package changeset.
- If you changed browser-facing UI, include screenshots or a short recording.
- If you have access to Codex, run `codex review --base origin/main` locally before opening or updating your PR. Treat that as the current highest standard of AI review, even if GitHub Codex review also runs.
- Do not submit refactor-only PRs unless a maintainer explicitly requested that refactor for an active fix or deliverable.
- Do not submit test-only or CI-only PRs that merely try to make known `main` failures pass.
- Ensure CI checks pass.
- Keep PRs focused. One thing per PR. Do not mix unrelated concerns.
- Describe what changed and why.
- Reply to or resolve bot review conversations you addressed before asking for review again.
- Use American English spelling and grammar in code, comments, docs, and UI strings.

## Review Conversations Are Author-Owned

If a review bot leaves review conversations on your PR, you are expected to handle the follow-through:

- Resolve the conversation yourself once the code or explanation fully addresses the concern.
- Reply and leave it open only when you need maintainer judgment.
- Do not leave "fixed" bot review conversations for maintainers to clean up for you.
- If Codex leaves comments, address every relevant one or resolve it with a short explanation when it is not applicable to your change.
- If GitHub Codex review does not trigger for some reason, run `codex review --base origin/main` locally anyway and treat that output as required review work.

This applies to both human-authored and AI-assisted PRs.

## AI/Vibe-Coded PRs Welcome! 🤖

Built with Codex, Claude, or other AI tools? Good. Just mark it.

Please include in your PR:

- [ ] Mark as AI-assisted in the PR title or description
- [ ] Note the degree of testing: untested / lightly tested / fully tested
- [ ] Include prompts or session logs if possible
- [ ] Confirm you understand what the code does
- [ ] If you have access to Codex, run `codex review --base origin/main` locally and address the findings before asking for review
- [ ] Resolve or reply to bot review conversations after you address them

AI PRs are first-class citizens here. We just want transparency so reviewers know what to look for.

## Current Focus

We are currently prioritizing:

- **Stability**: fixing regressions in editor behavior, selection, tables, clipboard, and serialization
- **DX**: clearer APIs, better docs, better examples, fewer sharp edges
- **Performance**: large-document editing, render churn, and expensive normalization paths
- **Docs & examples**: keeping `platejs.org` and registry examples in sync with the actual latest state

Check the [GitHub Issues](https://github.com/udecode/plate/issues) for active bugs and open work. If you want to grab something, leave a quick comment so effort does not collide.
