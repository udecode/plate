# Plate page shapes

Select the shape by the reader's task and document mode. Use
[feature coverage](../SKILL.md#cover-the-features-actual-use) for example
selection; reference and explanation retain their own structure.

### Install / Get Started

Entry docs like `content/docs/index.mdx`, `content/docs/installation.mdx`.

Required shape:

1. Short opening: what Plate is or what the guide does.
2. If there are multiple starts, add a compact branch selector that links to
   exact sections.
3. Recommended path first.
4. Alternative paths after.
5. Next steps / where to go next.


### Component / Registry Item

Pages like Plate UI component docs or registry-item docs should follow the
shadcn component shape unless Plate source proves a different ownership model.

Required shape:

1. Frontmatter title and description.
2. Real `<ComponentPreview name="..." />` immediately after the frontmatter when
   the demo exists.
3. `## Installation` with `<CodeTabs>`:
   - `Command` tab for the CLI command
   - `Manual` tab with `<Steps>` only when manual install is realistic
   - `<ComponentSource>` for the source file being copied
4. `## Usage` with imports first, then the smallest working JSX.
5. `## Examples` with a distinct task, behavior or useful visible variant per
   `###` section. Omit this section when the primary example covers the item.
6. Optional `## RTL`, `## Composition`, or other behavior sections when the
   source/demo actually supports them.
7. `## API Reference` last with compact prop/option tables.


### Guide / System

Pages like `plugin-rules.mdx`, `plugin-input-rules.mdx`.

Required shape:

1. Short opening that identifies the documented behavior.
2. Immediate inline disambiguation if a sibling concept exists.
3. Quick start for a task-oriented guide, with prerequisites at the step that
   needs them. An explanation can establish the ownership model first.
4. Working recipes for the guide's important tasks, when applicable.
5. Ownership and deeper mechanics, linked out when the reader's goal changes.
6. API reference last.


### Behavior / Runtime Concept

Pages like `editing-behavior.mdx`.

Use this lane when behavior crosses multiple source files, plugins, or docs
lanes. The reader needs the lifecycle, not a dump of every option.

Required shape:

1. Opening with sibling disambiguation. Example: "Use Plugin Rules for
   declarative node policy; use Editor Methods for imperative transforms."
2. `## Choose the Right Surface` or equivalent decision table.
3. `## Runtime Pipeline` with owner map.
4. One section per pipeline stage.
5. `## Recipes` for common outcomes.
6. `## API Reference` linking to the canonical references.

Source audit:

- Read the public reference docs.
- Read the core dispatcher or override layer.
- Read the transform implementation that actually mutates the document.
- Read feature-package defaults for examples.
- Read UI/registry code only when the behavior is UI-owned.


### Plugin / Feature

Read [plugin documentation](./plugin.md).

### Serialization / Conversion

Pages like `html.mdx`, `markdown.mdx`.

Required shape:

1. Explain the two directions up front (A→B and B→A).
2. Split the page by direction.
3. State environment constraints (server vs client, static vs React) before the first example.
4. Show extension points only after the base path is clear.
5. Put the heavy API reference late.


### Workflow / AI

Pages like `ai.mdx`.

Required shape:

1. What the feature enables (one paragraph).
2. Fastest setup path.
3. Working examples of important tasks, lifecycle and recovery behavior.
4. Integration requirements, including the client/server split; put required
   environment constraints before the code that depends on them.
5. Runtime architecture or flow, and optional UI surfaces when useful.
6. Utilities and API reference.


### API Reference

When the page is mostly contract, not onboarding.

Required shape:

1. Short purpose paragraph.
2. Surface grouping.
3. Exact parameters, options, returns.
4. Caveats and constraints.


### Spec / Law / Behavior

Behavior-spec, law, protocol docs.

Required shape:

1. Goal or contract.
2. Explicit owner map.
3. Model before UX chrome.
4. Evidence or source backing.
5. Clear gap markers where evidence is missing.
6. Reference appendix only after the contract is clear.
