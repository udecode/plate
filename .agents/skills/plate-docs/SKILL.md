---
description: Write, revise or audit Plate public documentation, including page design, feature examples, installation, API teaching, MDX and navigation. Use for Plate docs work; general prose stays with Technical Writing.
name: plate-docs
metadata:
  skiller:
    source: .agents/rules/plate-docs.mdc
---

# Plate Docs

Own Plate's public documentation experience: house style, page composition,
example coverage, setup, API teaching, MDX and navigation. Use
[Technical Writing](../technical-writing/SKILL.md) for prose, voice, document
modes and preservation. Its general rules serve this project's house style.

Handle the requested page, feature or documentation audit. An audit reports
source-backed gaps; edits stay within the requested scope. General prose in
plans, reports, READMEs and PR descriptions goes directly to Technical Writing.
For a tiny copy edit, read the text and resolve changed links without loading
unrelated docs mechanics.

Read the target page, its nearest useful sibling, and the source that owns each
changed claim. Start from the current source and public exports. Docs describe
the current API; unresolved API design belongs to Best API before teaching it.
Plate application examples import from `platejs`, `platejs/react` or the actual
feature subpath. Raw Plite documentation is the explicit exception.

## House style: shadcn

This house style takes precedence over Technical Writing's generic presentation
defaults. Use shadcn for density and page composition; Plate source owns API
behavior, imports, requirements and examples.

- Start fast. Frontmatter supplies the title and description. Add a short lead
  only when it clarifies the task, owner or an easily confused sibling.
- Put the first useful preview or working path before deeper explanation.
  Recommend the kit/CLI path first when it is the actual supported default;
  put manual or headless alternatives after it.
- Keep component pages together: installation, usage, visible examples and
  compact API reference can serve one reader goal. Each section does one job.
- Show imports and the smallest real working example. Add context when the
  code needs it; obvious usage does not need a ceremonial lead-in sentence.
- Prefer a real preview and one useful line to paragraphs describing a visual
  variant. Use MDX components for real structure or choices, not decoration.
- Keep reference compact: exact names, types, options and short caveats.
  Preserve established headings and anchors across comparable pages.
- Explain a non-obvious choice briefly. Runtime concepts can need more context
  than a UI component; density must not hide ownership or lifecycle behavior.
- Use direct verbs and short paragraphs. Omit sales copy, repeated summaries
  and compulsory "Done" or "That's it" endings. Let the last useful fact end
  the section.

For a substantial style or page-shape decision, compare the nearest Plate
sibling with a relevant page in `../shadcn/apps/v4/content/docs/`. Component
examples include `components/base/button.mdx`, `chart.mdx` and `sidebar.mdx`;
installation and registry pages cover their own shapes. Read the applicable
page, not the whole corpus. This comparison does not require an upstream sync.

## Cover the feature's actual use

Apply Technical Writing's example-selection method to the selected page and
reader goal. For feature and component pages:

- Lead with a focused example of the named feature. Use its kit and required
  dependencies in setup; a full application `EditorKit` belongs in an example
  whose purpose is that composition. Preserve explicit feature configuration
  under Plate UI's teaching/install rules.
- Give important tasks and materially different states a clear home in an
  example, snippet, reference section or linked guide. Consider creation and
  editing, boundaries and history, persistence and recovery, and rendering or
  access modes only where they affect this feature. Do not require every
  category, a demo per API method or a fixed number of previews.
- Let each additional example teach a distinct task, behavior or useful visual
  variant. Reuse registered demos and link composition to its owning page
  instead of reproducing the same mixed-feature preview across sibling pages.
- Keep integration requirements next to the example that needs them. Show
  minimum prerequisites in setup; put detailed ownership and lifecycle
  explanations after working examples or in a linked concept guide.
- Keep example claims within their proof. An in-memory save/reload demonstrates
  a local round trip; label simulated failures. A read-only editor setting
  does not establish application authorization. Preserve established fixtures
  and meaningful interactions when revising examples.

For a coverage audit, account for the important in-scope tasks and states and
their homes or gaps. Use the existing report or plan when one is needed; do
not create a second inventory or expand a wording-only edit into an audit.
Verify changed examples through the existing proof owners below.

## Select the needed mechanics

| Changed contract | Read |
| --- | --- |
| New page, substantial rewrite or a docs gap/topology decision | [Page shapes](./references/lanes.md); select only the matching lane |
| MDX components, navigation, installation requirements or release routes | [MDX and routes](./references/mdx.md) |
| Public schema, identity, migration, decoration or renderer examples | [Public API examples](./references/api-examples.md) |
| Plugin setup, kit/manual paths, codecs, events or API examples | [Plugin documentation](./references/plugin.md) |

For a gap review, compare the nearest concept guide, public reference and
feature page before adding a page. Put exact signatures in their reference,
setup in the feature page, and cross-package explanations in a concept guide.
Merge duplicated concepts and link to one owner. Read `content/docs/meta.json`
only when adding, moving, merging or deleting routes or changing navigation.

Follow [Task's workflow](../task/references/workflow.md) for scope, authority and
completion. Keep one Task plan when the job needs durable state. The optional `docs`
template or `docs` pack records the selected claims and proof. It is not a
second lifecycle and a page edit does not create a native goal.

## Verify the changed claims

| Change | Required evidence |
| --- | --- |
| Prose or link only | Read the edited text and resolve changed links; preserve code and metadata |
| MDX structure or examples | `pnpm --filter www build:source`; verify symbols, imports and fence content against source |
| Docs source parity or generated docs | `pnpm --filter www check:docs` |
| New/moved route or navigation | Parse changed metadata and request the exact route; inspect pager/sidebar when they changed |
| Preview or visible component behavior | Resolve the real demo and use [Verify Plate](../verify-plate/SKILL.md) on that exact route/state |
| Registry source | [Plate UI](../plate-ui/SKILL.md) and the branch's registry-generation rule |

Run applicable checks once after the final prose pass. New source changes or a
failure can require another pass. An MDX parse does not prove a route, runtime
API behavior or browser input. Report the exact proof limit.

Public reference teaches the latest state without changelog or migration
narration. Release data and an explicitly requested migration guide retain
their own jobs. General writing and preservation rules stay in Technical Writing.
