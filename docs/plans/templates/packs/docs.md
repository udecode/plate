# docs pack

Use this pack when docs are a touched surface but not the dominant risk. If docs
are the dominant deliverable, use `--template docs` as the primary template.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Docs pack selected | pending | pending |
| `docs-creator` loaded | pending | pending |
| Docs lane selected | pending | pending |
| Target docs and nearest sibling docs read | pending | pending |
| Docs style doctrine read | pending | pending |
| Documented source owner identified | pending | pending |

Work Checklist:
- [ ] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [ ] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [ ] Docs pack: docs use current-state reference voice, not changelog voice.
- [ ] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Docs source-backed claim audit | pending | Verify docs claims against current source or record N/A | pending |
| Docs links / routes / previews | pending | Verify leaf links, routes, anchors, and preview names or record N/A | pending |
| Docs MDX/content parser | pending | Run `pnpm --filter www build:contentlayer` for MDX/content changes, or record N/A | pending |
| Plugin page specifics | pending | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | pending |
