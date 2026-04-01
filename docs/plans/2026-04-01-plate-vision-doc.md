---
title: Plate Vision Doc
type: docs
date: 2026-04-01
status: completed
---

# Plate Vision Doc

## Goal

Write a root `VISION.md` that stays close to the structure and directness of the provided OpenClaw vision doc, but reflects Plate's actual product shape and contribution boundaries.

## Scope

- `VISION.md`

## Findings

- Repo root did not have a `VISION.md`.
- Plate is positioned as a rich-text editor framework built on top of Slate.
- Plate already emphasizes four product layers in README context: core, plugins, primitives, and components.
- Current contributor guidance already enforces focused PRs, no refactor-only noise, and a strong Slate-vs-Plate issue boundary.
- There is no root `SECURITY.md`, so the vision doc should discuss security posture without inventing a canonical security-policy link.
- User wanted a near-port of the OpenClaw vision style, so the final doc mirrors its pacing: thesis, current focus, contribution rules, security stance, extension model, setup philosophy, TypeScript rationale, and explicit merge guardrails.

## Progress

- [x] read repo context relevant to product direction
- [x] draft `VISION.md`
- [x] verify formatting/lint

## Verification

- `pnpm lint:fix`

## Outcome

- added root `VISION.md`
- kept the structure close to the supplied OpenClaw doc
- adapted the content to Plate's actual product boundaries: Slate, plugins, registry, docs, AI as optional, and explicit non-goals
