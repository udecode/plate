# cut playwright docs route

Objective:
Cut `/docs/playwright`; done when Plite Browser owns useful Playwright proof
content and no active docs nav route points at the deleted page.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-06-24-cut-playwright-doc-route.md

Primary template:
micro docs hard-cut

Applied packs:
- docs

Completion threshold:
- Delete `content/docs/(guides)/playwright.mdx` and `.cn.mdx`.
- Remove `/docs/playwright` from active docs navigation metadata.
- Keep useful content in `content/docs/plite/libraries/plite-browser.mdx`.
- Verify MDX/docs metadata and stale route references.

Verification surface:
- `pnpm --filter www build:source`
- `pnpm --filter www check:docs`
- focused `rg` audit for `/docs/playwright` and deleted docs filenames
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-24-cut-playwright-doc-route.md`

Constraints:
- No redirect or compat route for `/docs/playwright`.
- Do not hand-edit generated registry/template output.
- Preserve Playwright test support through `@platejs/browser/playwright`.
- Keep docs current-state; no changelog/deletion prose.

Boundaries:
- Allowed: `content/docs/(guides)/playwright*.mdx`,
  `content/docs/meta.json`, `content/docs/plite/libraries/plite-browser.mdx`,
  this plan.
- Not owned: package runtime, generated registry/release snapshots, broad Plate
  docs cleanup.

Blocked condition:
Block only if the docs generator requires the old guide route for category
shape and there is no clean nav-only removal path.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt captured | yes | User approved cutting `/docs/playwright` in favor of Plite Browser. |
| Skills loaded | yes | `autogoal`, `hard-cut`, and `docs-creator` read. |
| Source owner read | yes | Read old Playwright guide, Plite Browser doc, and nav metadata. |

Work Checklist:
- [x] Capture explicit requirements before edits.
- [x] Read source docs and nav metadata.
- [x] Merge useful low-level helper guidance into Plite Browser.
- [x] Delete old Playwright guide pages.
- [x] Remove old route from docs metadata.
- [x] Run docs verification.
- [x] Run stale route audit.
- [x] Close plan with final evidence.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Docs route deleted | yes | Remove source pages and metadata entries | Deleted `content/docs/(guides)/playwright.mdx` and `.cn.mdx`; removed `/docs/playwright` metadata. |
| Useful content preserved | yes | Move low-level helper and contenteditable warning into Plite Browser | Added low-level helpers and `locator.fill()` warning to `content/docs/plite/libraries/plite-browser.mdx`. |
| Docs parse | yes | Run docs source commands | `pnpm --filter www build:source` and `pnpm --filter www check:docs` passed. |
| Stale route audit | yes | Search active source/docs for `/docs/playwright` | Active source audit returned no matches; deleted-file audit returned no docs files. |
| Browser proof | no | Source-only docs topology cut; rendered route proof blocked by unrelated `apps/www` compile debt from current tree | N/A: source build/check plus route audit own this cut. |
| Goal plan complete | yes | Run `check-complete.mjs` | This row will close after final command. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | done | Source owner and nav read. | patch |
| Patch | done | Deleted old guide pages, removed nav entries, moved useful helper guidance. | verification |
| Verification | done | Docs build/check and active stale-route audits passed. | closeout |
| Browser route proof | blocked_external | Dev route compile fails on unrelated stale `dist` imports expecting removed Plate/Plite exports. | closeout |
| Closeout | done | Plan evidence updated. | final response |

Findings:
- `/docs/playwright` duplicates `content/docs/plite/libraries/plite-browser.mdx`.
- The useful old-page content is the low-level helper table and `locator.fill()`
  warning.

Timeline:
- 2026-06-24: Goal created and plan opened.
- 2026-06-24: Patched docs route topology and Plite Browser page.
- 2026-06-24: Verified docs source, docs parity, metadata JSON, and active stale-route audit.

Decisions and tradeoffs:
- No redirect: the route should die because it teaches transport as a top-level
  docs concept.

Review fixes:
- None.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

Verification evidence:
- `pnpm --filter www build:source` passed.
- `pnpm --filter www check:docs` passed.
- `node -e "JSON.parse(require('fs').readFileSync('content/docs/meta.json','utf8')); console.log('meta ok')"` passed.
- `rg -n "/docs/playwright|Playwright Testing|content/docs/\(guides\)/playwright|playwright\.cn\.mdx|playwright\.mdx" content apps packages --glob '!**/node_modules/**' --glob '!**/dist/**' --glob '!apps/www/public/r/**' --glob '!apps/www/src/generated/**'` returned no active matches.
- `rg --files content/docs | rg '^content/docs/\(guides\)/playwright(\.cn)?\.mdx$'` returned no deleted docs files.
- Browser route attempt against `http://localhost:3005/docs/plite/libraries/plite-browser` was blocked by unrelated `apps/www` compile errors from stale built `dist` files importing removed exports such as `createPliteEditor`, `createPlitePlugin`, and `createTSlatePlugin`.

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| Closeout | Final response | `/docs/playwright` gone, Plite Browser canonical | Active source/nav clean; rendered proof blocked externally | Patch and verification done |

Open risks:
- Current `apps/www` rendered route proof is known blocked by unrelated stale
  dist/runtime migration debt from the previous task.
