---
description: Create or update source-backed Plate plugin, guide, install, serialization, API, and spec docs with clear ownership and agent-readable structure.
name: docs-creator
metadata:
  skiller:
    source: .agents/rules/docs-creator.mdc
---

# Docs Creator

This skill is the source of truth for Plate docs style and workflow. Every rule
below collapses to "docs that teach humans AND parse cleanly for agents."

Most bad Plate docs fail the same way: reference dump instead of a working path, blurred ownership, missing "why", vibes instead of code. This skill kills that drift.

## Who owns what

`docs-creator` owns shared docs law:

- voice and tone
- information order
- lane selection
- ownership clarity
- anti-slop rules
- agent affordances
- plugin-page section order, kit/manual structure, component/API checks, and
  plugin-specific examples

Plugin pages are a lane inside `docs-creator`, not a separate skill.

## Goal Template

Use the docs goal template for non-trivial docs work:

```bash
node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs \
  --template docs \
  --title "<short docs title>"
```

Use it when the task creates or rewrites a page, changes public behavior docs,
touches plugin/API/spec/serialization docs, moves routes, changes examples, or
could leave stale imports, links, previews, ownership claims, or API claims.

When docs are only a supporting surface under another dominant task, do not
switch the primary template to `docs`. Add the docs pack to the owning plan:

```bash
node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs \
  --template task \
  --with docs \
  --title "<short task title>"
```

For heavyweight architecture or proposal work that also changes docs, use the
major primary template plus packs, for example:

```bash
node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs \
  --template major-task \
  --with docs \
  --title "<short major task title>"
```

Do not use it for tiny copy edits, typo fixes, or one-line link repairs unless
the caller explicitly asks for a goal-backed docs task.

`docs-creator` owns docs doctrine and routing. The docs goal template owns the
closeout contract: lane classification, source-backed claims, ownership map,
link/demo checks, content build, and anti-slop audit.

When a docs goal uses `--template docs`, the instantiated plan must resolve the
selected lane's `Lane-Specific Shape Proof` row before writing or closeout. Do
not let a broad "docs lane shape satisfied" line stand in for the real lane
contract.

For install/get-started pages, the plan must explicitly prove:

- only the short lead sits above the first `##`;
- the page has `## Installation`, `## Usage` or an equivalent first working
  path, and exact next-step links;
- real procedures use `<Steps>` when they are more than one step;
- installed packages have an ownership table when more than one package/layer is
  involved;
- app-file snippets use titled code fences when file context matters.

If any selected lane row does not fit the page, record why in the plan and name
the stronger page shape. Do not mark the lane row complete by vibe.

## Source Of Truth

This file is the source. Generated skill copies are output.

- Edit `.agents/rules/docs-creator.mdc`, not `.agents/skills/docs-creator/SKILL.md`.
- After changing this rule, run `pnpm install` to regenerate the skill copy.
- Verify the generated skill contains the intended rule text before handoff.
- If generated output drifts, fix this source file and regenerate. Do not patch
  generated skill text by hand.

## Read First

Before writing, read only what actually grounds the page:

- the target doc
- nearest sibling docs in the same lane
- the source code for the behavior or API being documented
- strongest baselines:
  - `content/docs/index.mdx`
  - `content/docs/installation.mdx`
  - `content/docs/installation/plate-ui.mdx`
  - `content/docs/(guides)/plugin-rules.mdx`
  - `content/docs/(guides)/plugin-input-rules.mdx`
  - `content/docs/(plugins)/(serializing)/html.mdx`
  - `content/docs/(plugins)/(serializing)/markdown.mdx`
  - `content/docs/(plugins)/(ai)/ai.mdx`
- relevant `docs/solutions/*` learnings when the lane touches ownership, spec
  truth, docs drift, or authoring doctrine

Start from code plus the best baseline doc. Not from old prose alone.

Docs teach the verified shipped API; they do not choose it. When source exposes
a materially bad, contradictory, or missing public shape, route the decision to
`best-api` and keep docs work on the settled surface.

When the task is a docs gap review, read sideways before writing:

- the likely target lane
- the nearest reference page
- the nearest concept guide
- the feature/plugin page, if one owns the behavior
- the docs nav surface (`content/docs/meta.json`) when adding, moving, merging,
  or deleting pages

The question is not "can this become a page?" The question is "which page shape
will keep the concept findable without duplicating the reference?"

When the work touches docs style, shadcn parity, registry components, install
pages, or MDX component usage, also read the local shadcn reference corpus:

- `../shadcn/apps/v4/content/docs/components/base/button.mdx`
- `../shadcn/apps/v4/content/docs/components/base/chart.mdx`
- `../shadcn/apps/v4/content/docs/components/base/sidebar.mdx`
- `../shadcn/apps/v4/content/docs/installation/next.mdx`
- `../shadcn/apps/v4/content/docs/registry/getting-started.mdx`
- `../shadcn/apps/v4/mdx-components.tsx`
- `docs/sync/shadcn/docs-style-corpus-2026-05-31.md` when present

Use shadcn as the reference for density, MDX component grammar, and page
scaffolding. Use Plate source as the authority for behavior, ownership, package
names, and examples.

## Style And Structure → [style-and-structure.md](./rules/style-and-structure.md)

Read this reference before substantial prose or topology work. It owns voice, structure, examples, links, previews, agent affordances, and anti-slop law.

## Workflow

1. Classify the lane.
2. Lock the owner map.
3. Decide page topology: add, merge, delete, or cross-link.
4. Define the fastest success path.
5. Gather 1–3 real examples from code.
6. Write the quick path.
7. Add deeper explanation and boundaries.
8. Add API or reference material only where it earns its keep.
9. Wire navigation, neighbor links, and metadata.
10. Trim repetition, vague adjectives, and fake completeness.
11. Verify every claim against the current repo.

## Lane Map

Use the page shape that matches the job, not the one you wrote last time.

| Lane                       | Job                                          | What readers need first                   |
| -------------------------- | -------------------------------------------- | ----------------------------------------- |
| Install / get-started      | help someone adopt Plate                     | choose a path, install, next step         |
| Component / registry item  | teach a copied UI component or registry item | preview, install, usage                   |
| Guide / system             | teach a runtime or concept                   | mental model, ownership, quick start      |
| Plugin / feature           | teach one capability                         | what it does, quickest setup, manual path |
| Serialization / conversion | explain import/export or round-trip          | direction split, environment constraints  |
| Workflow / AI              | explain multi-surface flows                  | setup path, runtime flow, optional UI     |
| API reference              | explain an exact surface                     | short purpose, exact contract, caveats    |
| Spec / law / behavior      | lock a contract                              | model, ownership, evidence, explicit gaps |

## Lane Templates → [lane-templates.md](./rules/lane-templates.md)

Read only the section matching the selected docs lane, plus its writing examples when needed.

## Structure & Formatting

- `<Steps>` for real multi-step procedures.
- `###` inside `<Steps>` for sub-steps.
- `<CodeTabs>` for CLI/manual choices only.
- Plain install/run command fences for package-manager variants.
- `<ComponentPreview>` near the top of component pages when the preview exists.
- `<ComponentSource>` when the page asks the reader to copy a registry file.
- `<LinkedCard>` or compact cards for branch selection, not for decoration.
- Code blocks with `title="..."` when file context matters.
- `showLineNumbers` + `{n-m}` line highlights when a large snippet needs focus.
- Tables for option matrices, ownership boundaries, or variant comparisons.
- Callouts for:
  - environment constraints
  - security warnings
  - "this is explicit, not automatic" guidance

Do not force `<ComponentPreview>`, `<PackageInfo>`, or a giant feature list just because another page had one. Every section earns its place.

## Verification Checklist

Before finishing a docs change:

- `pnpm --filter www build:source` parses the MDX cleanly.
- `pnpm --filter www check:docs` passes when docs source parity or generated
  source can be affected.
- Every named API, option, transform, and component exists in the source.
- Every import path matches the current repo/package layout.
- Every ownership claim matches the code.
- Every link target or route is real and not about to be removed.
- Every `<ComponentPreview>` name points at a demo that exists.
- `content/docs/meta.json` parses when docs nav metadata changes.
- A local route check proves new or moved pages render. Curl is enough for
  text-only pages; use Browser proof for visual/component behavior.
- Opening lands in 3 sentences or fewer.
- A first-time reader could complete the happy path before reaching `## API Reference`.
- No placeholder comments, no `TODO`, no dead anchors.
- No changelog voice ("previously", "now supports", "has been removed").
- Neighboring lanes are split cleanly enough that a reader can answer "where does this behavior live?".
- If `.agents/rules/docs-creator.mdc` changed, `pnpm install` regenerated the
  skill copy and the generated `SKILL.md` reflects the source.

If the page still reads like stitched-together notes, it is not done.
