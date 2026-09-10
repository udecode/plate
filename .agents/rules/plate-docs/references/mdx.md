# Plate MDX and routes

Frontmatter owns the title and description. Use the target page's nearest
sibling for composition and `apps/www/src/components/mdx-components.tsx`
for registered components. Follow the [shadcn house style](../SKILL.md#house-style-shadcn) and read
the relevant upstream page for substantial style or composition decisions.
Sync Shadcn owns actual upstream adoption; writing does not require a sync.

- Use `<Steps>` with `###` headings for real multi-step procedures.
- Use `<CodeTabs>` for CLI/manual choices. Keep package-manager variants in
  plain command fences so the command renderer can produce its tabs.
- Use `<ComponentPreview>` only for a real registered demo and
  `<ComponentSource>` for an actual copied registry file.
- Use `title="file.tsx"` when a fence represents an app file. Use line numbers
  and highlights when a long snippet needs focus.
- Use cards for real branch choices and callouts for environment constraints.
- Preserve frontmatter, MDX tags, fence attributes, anchors and link targets
  during prose edits.

### Navigation And Routing

Adding, moving, merging, or deleting a docs page is a routing change.

- Add the MDX page in the lane folder that matches its route.
- Update `content/docs/meta.json` root `pages` when the raw page tree order
  should change.
- Update `_plate.categoryGroups` in `content/docs/meta.json` when the sidebar
  overlay should show nested grouping, labels, descriptions, or CN titles.
- Update `_plate.items` when the route needs title, label, description,
  keywords, or CN title metadata.
- Add links from the nearest owning pages, not from every vaguely related page.
- If no `.cn.mdx` page is added, know that CN docs may fall back to English.
  Record that as a caveat rather than pretending the page is translated.
- Verify the route itself, not just the source file. Pager order and sidebar
  grouping are rendered contracts.

Do not leave orphan pages: every new page needs a route, a nav decision, and at
least one useful inbound link from the owning neighborhood.

### Release Docs

`/docs/releases` is docs topology, not changeset policy.

- `/docs/releases` renders generated package release data and generated Plate UI
  changelog JSON. Do not hand-author release-page Plate UI entries; use the
  `registry-changelog` skill for source entries, generation, and verification.
- Keep the latest two major release groups on `/docs/releases`.
- Move older v49+ major groups to dedicated `/docs/releases/<major>` pages
  instead of burying them in a catch-all archive.
- Link each older major page from `/docs/releases` under `Older releases`.
- Link `v48 and earlier` from `Older releases` to `/docs/migration/v48`.
- Changesets own package-release bullets. They do not own release-page
  retention, routing, or archive shape.


## Requirements And Disclosures

Installation and get-started docs must separate four different claims:

1. hard compatibility requirements enforced by package manifests or runtime;
2. layer-specific requirements for copied UI, app code, server code, or tooling;
3. recommended configuration that improves the supported path but is not a
   compatibility floor;
4. repository implementation details that consumers do not configure.

Read package peer dependencies, copied registry inputs, package build config,
and the target app config before writing a requirement. Put hard requirements
before the first install command. State what the CLI or package install does
not configure when the reader must still change their app.

For React setup, derive the React and React DOM floor from live peer
dependencies. Derive React Compiler guidance separately: published compiled
packages, copied app source, and the app's own build pipeline have different
owners. Do not tell consumers to compile dependency code that Plate already
ships compiled. Do not imply copied Plate UI source receives Compiler coverage
unless the consuming app enables it.
