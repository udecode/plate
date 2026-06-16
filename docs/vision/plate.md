# Plate Vision

Plate is the editor framework that ships in apps. It owns plugins, wrappers,
components, kits, app-facing docs, product ergonomics, and opinionated UX built
on top of Slate-first primitives.

Root `VISION.md` is the mandatory first read. This file carries the fuller
Plate doctrine after the lane is selected.

## Direction

Plate started as a way to make Slate-based editors practical to build and
maintain in real products.

The goal: a rich-text editor framework that is composable, production-ready,
and easy to adapt without giving up ownership of your editor, schema, or UI.

Current priorities:

- bug fixes and stability;
- docs, setup reliability, and first-run UX;
- performance on real editor workloads;
- better plugin and component ergonomics;
- better migration from Slate and a clearer Slate boundary;
- serialization, import, and export reliability;
- stronger registry, templates, and docs coverage;
- collaboration, AI, and advanced workflows where they fit cleanly;
- better testing infrastructure and confidence around edge-case editor
  behavior.

## Plate Rules

- Keep Plate core unopinionated enough for framework use. Opinionated product
  behavior belongs in packages, kits, examples, or docs.
- A behavior, API, or gate change needs an adoption story. "Cleaner" alone is
  not enough.
- For current Plate features, parity and protocol matter. For deferred
  features, record the owner instead of pretending coverage exists.
- Public docs must be source-backed, current-state only, and readable by humans
  and agents.
- Plugin and feature pages are headless first. UI components are render
  examples unless source proves they own the behavior.
- Never document plugin APIs or transforms the source does not actually ship.

## Plugin And Component Doctrine

- Core stays lean; optional capability should usually ship as packages,
  plugins, or app-owned components.
- Preferred extension path is npm package distribution plus local app
  composition and registry usage for development.
- If you build a plugin or component pack, host and maintain it in your own
  repository.
- The bar for adding optional capability to core is intentionally high.
- New app-specific components should usually live in your own app or registry,
  not in core by default.
- Core UI additions should be rare and require broad demand, clear reuse, or a
  real API reason.

## Public API And Plugin Doctrine

- If work touches a reusable public/editor-platform API, use root `VISION.md`
  and this file first.
- If work touches runtime/service-boundary architecture, use root `VISION.md`
  and this file first.
- If work is ambiguous between reusable API design and implementation, route
  upward to vision first.
- If the public pattern is settled and the task is plugin execution, hand off
  to `plate-plugin-creator`.
- App-local convenience, one-off demos, and package-local mechanics do not need
  doctrine unless they create a reusable public pattern.
- Every lane that introduces or materially changes a reusable public API,
  runtime boundary, builder/factory pattern, or extension contract must include
  root/detail vision updated or reaffirmed evidence.

Owner map:

| Concern | Owner |
| --- | --- |
| public GitHub issue/PR/security queue control plane | `maintainer` |
| reusable architecture doctrine | root `VISION.md` and `docs/vision/*.md` |
| public API shape decisions | root `VISION.md` and `docs/vision/*.md` |
| runtime/service-boundary patterns | root `VISION.md` and `docs/vision/*.md` |
| layering / ownership law | root `VISION.md` and `docs/vision/*.md` |
| performance/scalability law | root `VISION.md` and `docs/vision/*.md` |
| anti-pattern catalog | root `VISION.md` and `docs/vision/*.md` |
| plugin file placement / wrappers / typing mechanics | `plate-plugin-creator` |
| plugin authoring execution flow | `plate-plugin-creator` |
| app-local sugar | local app/kits |
| public docs shape | `docs-creator` |
| UI/component registry shape | `plate-ui` |

## Matcher Extraction Heuristic

When scanning a reusable API family, aggressively inspect repeated `resolve()`
and `apply()` bodies before inventing more package-level wrappers.

Pull into core when repeated logic is mostly trigger gating, collapsed-selection
gating, block-start / text-before lookup, delimiter / prefix / regex matching,
range or payload construction, or other feature-agnostic editor-state
inspection.

Keep local when repeated logic is mostly node creation, mark toggling, list
transforms, link validation or insertion, equation insertion, code-block
insertion, or any semantic transform owned by a feature package.

Core owns matcher primitives and shared input-state access. Feature packages
own semantic apply behavior.

## Slate Boundary

Plate is built on top of Slate.

Migration from Slate to Plate should be straightforward, and Plate can
re-export Slate surface where it improves DX. But Plate is not a dumping ground
for bugs that reproduce in plain Slate. If the same issue happens in plain
Slate without Plate-specific code, it belongs there.

## Security

Security in Plate is about explicit trust boundaries and sane defaults. Plate
is a framework, not a hosted service.

Keep risky paths obvious and operator-controlled:

- HTML and markdown parsing;
- import/export boundaries;
- uploads and embedded content;
- server/client boundaries;
- untrusted content and app-specific integrations.

Use safe defaults where possible. Do not add convenience abstractions that hide
where trust decisions are actually made.

## AI

AI support stays optional, composable, and plugin-first. Core editor APIs
should not contort around provider churn or hype-cycle abstractions.

## Setup

Plate is code-first by design. Users should see plugin config, editor schema,
serialization boundaries, and component ownership up front.

Improve onboarding through templates, docs, CLI, and registry flows. Do not add
convenience wrappers that hide critical editor decisions from users.

## What We Will Not Merge For Now

- Refactor-only PRs with no concrete user, API, or docs value.
- Fixes for bugs that reproduce in plain Slate without Plate-specific code.
- Public PRs that change user-visible behavior without real behavior proof.
- Issues or PRs that are too incomplete for a local maintainer Codex run to
  reproduce, route, or review from public context.
- Core UI/components that are app-specific, one-off, or design-opinionated
  without broad reuse.
- Optional plugins/features that can live as separate packages or app-local
  code.
- Convenience abstractions that hide editor ownership, schema design, or trust
  boundaries.
- Large framework detours that dilute the Plate-on-Slate model.
- Heavy AI-specific orchestration in core when the existing plugin/package
  surface is enough.
- Full-doc translation sets beyond English and Chinese for now.

Strong user demand and strong technical rationale can change this list.
