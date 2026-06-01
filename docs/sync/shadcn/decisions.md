# Sync Shadcn Decisions

These are the default decisions for future upstream shadcn syncs. Change
them only with an explicit user decision and record the reason in the sync plan.

| Area | Default | Notes |
| --- | --- | --- |
| Fumadocs engine | adopt upstream | Keep `source.config.ts`, `createMDX`, Fumadocs page data, raw markdown, and page tree patterns aligned with upstream. |
| Plate docs content | keep Plate | `content/docs/**` is Plate product content. Do not replace it with upstream shadcn content. |
| Fumadocs metadata | keep Plate on upstream model | `content/docs/meta.json` is the committed page-tree authority with Plate overlays. |
| API MDX | keep Plate | Preserve API components, generated API docs, and Plate MDX vocabulary. |
| Registry contract | adopt upstream contract | Use shadcn v4 schema, namespace dependencies, resolver semantics, and `registry:base` init shape. |
| Registry content | keep Plate | `apps/www/src/registry/**` is Plate-owned content. |
| Registry build | smart merge | Use upstream v4 patterns, but keep Plate docs registry generation and delivery needs. |
| Generated registry output | regenerate only | Do not manually edit generated `public/r`, `public/rd`, or registry indexes. |
| Lazy code source | keep Plate fork | Keep `/api/registry-source/[name]` for code-view bandwidth. Do not revive public-shaped `/api/registry/[name]`. |
| Sidebar | keep Plate UX, upstream primitives | Keep accordion/filter behavior for the large Plate docs tree, but build on Fumadocs data and shadcn sidebar primitives. |
| Search | smart merge | Use Fumadocs/upstream search architecture with Plate docs/API/plugins/examples/editor/MCP groups. |
| Header/nav | smart merge | Use upstream Fumadocs-aware structure with Plate logo, product links, locale links, MCP, GitHub, and Discord. |
| Homepage | keep Plate | Keep a Plate-centered homepage without old themes/customizer/project state. |
| Editor demos | keep Plate | Preserve editor demos, block previews, and `/view/[name]` rendering. |
| `/blocks` gallery | fork selectively | Keep Plate demo routes where useful; do not import upstream block gallery product pages by default. |
| `/create` | exclude upstream | Do not support `ui.shadcn.com/create` as a Plate product surface unless the user explicitly asks for a Plate create flow. |
| `/charts` | exclude upstream | Do not add public charts pages by default. |
| `/colors` | exclude upstream | Do not add public colors pages by default. |
| v0 | exclude all | Do not import v0 routes, buttons, copy actions, project hooks, or init variants. |
| Init route | keep non-v0 Plate bootstrap | Keep `/init` and `/init.md` only for shadcn-compatible `@plate` bootstrap. |
| Theme/customizer | delete Plate residue | Keep upstream token/style system; discard Plate theme library, customizer drawer, project state, lift mode, and random theme UI. |
| CN docs | keep Plate | Preserve CN routes, labels, language dropdown, and Fumadocs i18n behavior. |
| MCP | keep Plate | Preserve MCP dialog/docs/header entry with the `@plate` namespace. |
| Plate Plus/Pro | keep Plate | Preserve Plus/Pro hooks and links where they support Plate docs. |
| GA | keep Plate minimal | Keep GA. Do not reintroduce per-click analytics for discarded surfaces. |
| LLM docs | smart merge | Use upstream `.md` route and copy-page model; keep Plate-specific context only where it adds real value. |
| RSS/OG/assets | smart merge | Use upstream structure when useful, with Plate branding and release content. |
| Dev/debug routes | exclude public | Do not ship public `/dev` or e2e/debug routes in the docs app. |
| Slate-to-HTML page | keep Plate | Keep the special page because the RSC example cannot be previewed through the generic block path. |
| Workspace aliases/typecheck | keep Plate | Preserve app source aliases and package integration typecheck model. |
| Package integration tests | keep Plate | Do not lose app-as-integration-harness coverage during shadcn syncs. |
