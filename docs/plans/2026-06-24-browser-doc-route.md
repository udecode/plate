# browser docs route

Objective:
Move Browser docs to `/docs/browser`; done when the old Plite Browser route is
gone, active docs links point at `/docs/browser`, and docs checks pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-06-24-browser-doc-route.md

Primary template:
micro docs hard-cut

Applied packs:
- docs

Completion threshold:
- `content/docs/(guides)/browser.mdx` exists as the canonical Browser page.
- `content/docs/plite/libraries/plite-browser.mdx` is deleted.
- `content/docs/meta.json` links Browser under top-level Guides.
- `content/docs/plite/meta.json` no longer links a Plite Browser library page.
- Active docs links use `/docs/browser`.
- Docs source checks and stale-route audits pass.

Verification surface:
- `pnpm --filter www build:source`
- `pnpm --filter www check:docs`
- metadata JSON parse
- focused active-source `rg` audits for old route and old title
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-24-browser-doc-route.md`

Constraints:
- No redirect, alias page, or compatibility route for `/docs/plite/libraries/plite-browser`.
- Preserve `@platejs/browser/playwright` docs and package meaning.
- Do not edit generated registry/template output.
- Keep historical plans/ledgers untouched.

Boundaries:
- Allowed: `content/docs/(guides)/browser.mdx`,
  `content/docs/plite/libraries/plite-browser.mdx`, `content/docs/meta.json`,
  `content/docs/plite/meta.json`, active docs that link to the old route, this
  plan.
- Not owned: package code, generated output, historical `docs/plans/**` and
  `docs/plite/**` ledgers.

Output budget strategy:
- Search active `content/docs` first.
- Exclude generated/public output and avoid broad `docs/**` ledgers after one
  accidental large search.

Blocked condition:
Block only if the docs generator cannot route `/docs/browser` from the Guides
lane without a larger docs routing change.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt captured | yes | User requested cutting `/docs/plite/libraries/browser` style route and using `/docs/browser`. |
| Skills loaded | yes | `autogoal`, `hard-cut`, and `docs-creator` read. |
| Source owner read | yes | Read current Plite Browser page, root meta, Plite meta, and active link refs. |

Work Checklist:
- [x] Capture explicit requirement before edits.
- [x] Read current docs source and nav metadata.
- [x] Move canonical page to `/docs/browser`.
- [x] Remove old Plite library page and nav link.
- [x] Update active docs links to `/docs/browser`.
- [x] Run docs source verification.
- [x] Run stale-route audit.
- [x] Close plan with final evidence.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Canonical route | yes | Create `/docs/browser` source page and nav metadata | Moved page to `content/docs/(guides)/browser.mdx`; added `/docs/browser` to root Guides nav and item metadata. |
| Old route cut | yes | Delete Plite library page and remove active links | `content/docs/plite/libraries/plite-browser.mdx` no longer exists; removed from Plite meta and active links. |
| Docs parse | yes | Run docs source commands | `pnpm --filter www build:source` and `pnpm --filter www check:docs` passed. |
| Stale route audit | yes | Search active docs for old route/title | Active route/title audit returned no old route/title matches; file audit shows only `content/docs/(guides)/browser.mdx`. |
| Browser proof | no | Current `apps/www` rendered proof is blocked by unrelated stale `dist`/runtime migration debt | N/A: source build/check and route audit own this docs topology cut. |
| Goal plan complete | yes | Run `check-complete.mjs` | This row will close after final command. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | done | Source owner and nav read. | patch |
| Patch | done | Page moved, nav updated, old links removed. | verification |
| Verification | done | Docs build/check, metadata parse, and focused stale-route audits passed. | closeout |
| Browser route proof | blocked_external | `/docs/browser` route attempt hit unrelated stale `dist` package imports expecting removed exports. | closeout |
| Closeout | done | Plan evidence updated. | final response |

Findings:
- `@platejs/browser` is broader than Plite, so the canonical page belongs at
  `/docs/browser`.
- Plite pages should link to `/docs/browser` as the shared proof harness owner.

Timeline:
- 2026-06-24: Goal created and plan opened.
- 2026-06-24: Moved Browser doc to `/docs/browser` and removed Plite library route.
- 2026-06-24: Verified docs source, docs parity, metadata JSON, active stale-route audit, and attempted Browser proof.

Decisions and tradeoffs:
- No redirect: the old Plite-library route should die to avoid teaching Browser
  as Plite-only.

Review fixes:
- None.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad `rg` included historical ledgers and streamed too much output | 1 | Search active `content/docs` only | Recovered with focused active docs audit. |

Verification evidence:
- `pnpm --filter www build:source` passed.
- `pnpm --filter www check:docs` passed.
- `node -e "const fs=require('fs'); for (const p of ['content/docs/meta.json','content/docs/plite/meta.json']) JSON.parse(fs.readFileSync(p,'utf8')); console.log('meta ok')"` passed.
- `rg -n "Plite Browser|/docs/plite/libraries/plite-browser|libraries/plite-browser|content/docs/plite/libraries/plite-browser" content/docs --glob '!**/node_modules/**'` returned no active matches.
- `rg --files content/docs | rg '^content/docs/plite/libraries/plite-browser\.mdx$|^content/docs/\(guides\)/browser\.mdx$'` returned only `content/docs/(guides)/browser.mdx`.
- Browser proof attempted on `http://localhost:3006/docs/browser`, but the app rendered blank because unrelated current `apps/www` compile debt pulls stale built package `dist` files importing removed exports such as `createPliteEditor`, `createPlitePlugin`, and `createTSlatePlugin`.

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| Closeout | Final response | `/docs/browser` canonical; old Plite route gone | Source/docs graph is clean; rendered proof blocked externally | Patch and verification done |

Open risks:
- Rendered Browser proof may remain blocked by unrelated current `apps/www`
  compile debt; source/docs checks still prove this docs cut.
