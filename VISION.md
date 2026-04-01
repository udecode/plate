## Plate Vision

Plate is the editor framework that actually ships.
It runs in your app, with your schema, with your components, with your rules.

This document explains the current state and direction of the project.
We are still early enough that iteration is fast.
Project overview and developer docs: [`README.md`](README.md)
Contribution guide: [`CONTRIBUTING.md`](CONTRIBUTING.md)

Plate started as a way to make Slate-based editors practical to build and maintain in real products.

The goal: a rich-text editor framework that is composable, production-ready, and easy to adapt without giving up ownership of your editor, your schema, or your UI.

The current focus is:

Priority:

- Bug fixes and stability
- Docs, setup reliability, and first-run UX
- Performance on real editor workloads

Next priorities:

- Better plugin and component ergonomics
- Better migration from Slate and a clearer Slate boundary
- Serialization, import, and export reliability
- Stronger registry, templates, and docs coverage
- Collaboration, AI, and advanced workflows where they fit cleanly
- Better testing infrastructure and confidence around edge-case editor behavior

Contribution rules:

- One PR = one issue/topic. Do not bundle multiple unrelated fixes/features.
- PRs over ~5,000 changed lines are reviewed only in exceptional circumstances.
- Do not open large batches of tiny PRs at once; each PR has review cost.
- For very small related fixes, grouping into one focused PR is encouraged.

## Security

Security in Plate is about explicit trust boundaries and sane defaults.
Plate is a framework, not a hosted service.

The goal is to stay flexible for real product work while making risky paths obvious and operator-controlled:

- HTML and markdown parsing
- import/export boundaries
- uploads and embedded content
- server/client boundaries
- untrusted content and app-specific integrations

We prioritize safe defaults where possible, but we do not want convenience abstractions that hide where trust decisions are actually made.

## Plugins & Components

Plate has an extensive plugin and package API.
Core stays lean; optional capability should usually ship as packages, plugins, or app-owned components.

Preferred extension path is npm package distribution plus local app composition and registry usage for development.
If you build a plugin or component pack, host and maintain it in your own repository.
The bar for adding optional capability to core is intentionally high.
Plugin docs: https://platejs.org/docs/plugin
Component docs: https://platejs.org/docs/plugin-components
Plate UI docs: https://platejs.org/docs/installation/plate-ui

### UI Registry

We still ship registry components and templates for baseline UX.
New app-specific components should usually live in your own app or registry, not in core by default.
Core UI additions should be rare and require broad demand, clear reuse, or a real API reason.

### Slate Boundary

Plate is built on top of Slate.
We want migration from Slate to Plate to be straightforward, and Plate re-exports much of the Slate surface where it improves DX.

But Plate should not become a dumping ground for bugs that reproduce in plain Slate.
If the same issue happens in plain Slate without Plate-specific code, it belongs there.

### AI

Plate already ships AI packages and examples.
We want AI support to stay optional, composable, and plugin-first.
Core editor APIs should not contort around provider churn or hype-cycle abstractions.

### Setup

Plate is currently code-first by design.
This keeps setup explicit: users see plugin config, editor schema, serialization boundaries, and component ownership up front.

Long term, we want easier onboarding through templates, docs, CLI, and registry flows.
We do not want convenience wrappers that hide critical editor decisions from users.

## What We Will Not Merge (For Now)

- Refactor-only PRs with no concrete user, API, or docs value
- Fixes for bugs that reproduce in plain Slate without Plate-specific code
- Core UI/components that are app-specific, one-off, or design-opinionated without broad reuse
- Optional plugins/features that can live as separate packages or app-local code
- Convenience abstractions that hide editor ownership, schema design, or trust boundaries
- Large framework detours that dilute the Plate-on-Slate model
- Heavy AI-specific orchestration in core when the existing plugin/package surface is enough
- Full-doc translation sets beyond English and Chinese for now

This list is a roadmap guardrail, not a law of physics.
Strong user demand and strong technical rationale can change it.
