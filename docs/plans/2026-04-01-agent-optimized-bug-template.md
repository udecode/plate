---
title: Agent Optimized Issue Intake And Contributing Guide
type: docs
date: 2026-04-01
status: completed
---

# Agent Optimized Bug Template

## Goal

Rewrite `.github/ISSUE_TEMPLATE/bug.yml` and add a repo-level `CONTRIBUTING.md` that fit Plate's agent-first maintainer workflow:

- a crisp failure statement
- a reproducible path
- expected fixed-state acceptance criteria
- scope hints that distinguish normal task work from heavier cross-package or performance work
- contributor guidance that matches how maintainers actually triage and execute work

## Scope

- `.github/ISSUE_TEMPLATE/bug.yml`
- `CONTRIBUTING.md`
- `tooling/CONTRIBUTING.md`
- `README.md`

## Findings

- The current form is thin on agent-useful structure: it asks for a description and steps, but not explicit expected behavior or acceptance criteria.
- The current form has no routing hint for issue shape, so performance, API, and architecture bugs look the same as small local regressions.
- A good next-agent issue in this repo already tends to have clear reproduction, clear acceptance criteria, current relevance, and low human-only setup.
- No repo-specific issue-template guidance turned up in `docs/solutions/`; this is new form design, not a sync against an existing pattern doc.
- The first YAML validation pass caught a real syntax bug: an unquoted placeholder starting with `@`. Fixed before handoff.
- Repo root did not have a canonical `CONTRIBUTING.md`; README still pointed to `tooling/CONTRIBUTING.md`.
- The old contributing guide was broad and human-oriented. It did not explain the agent-first bug intake model or the `task` / `major-task` routing maintainers actually use.
- User wanted a near-port of the OpenClaw contributing style, not a softened adaptation, so the final guide mirrors that structure much more closely: quick links, named maintainers, hard contribution rules, author-owned review threads, and explicit AI/Codex guidance.

## Progress

- [x] read current bug template and nearby issue-task context
- [x] design the new intake shape
- [x] patch the template
- [x] add and wire a root contributing guide
- [x] verify YAML, markdown, and lint

## Verification

- `ruby -e 'require "yaml"; YAML.load_file(ARGV[0]); puts "ok"' .github/ISSUE_TEMPLATE/bug.yml`
- `pnpm lint:fix`

## Outcome

- rewrote the bug form around evidence-grounded agent intake with `NOT_ENOUGH_INFO`, stronger actual-vs-expected separation, explicit acceptance criteria, and better environment/evidence capture
- replaced the root `CONTRIBUTING.md` with a Plate-flavored near-port of the OpenClaw structure and tone
- rewired README to the root guide and left `tooling/CONTRIBUTING.md` as a short pointer instead of a stale second source of truth
