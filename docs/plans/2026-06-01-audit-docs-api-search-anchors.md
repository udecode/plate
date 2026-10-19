# Audit docs API search anchors

Objective:
Audit docs API search anchors and make docs search group API-reference pages, docs API sections, and ordinary docs results through a consistent source-backed signal.

Completion threshold:
- Every docs source page is read by a static audit.
- `/docs/footnote#apifootnoteduplicatedefinitions` is tagged as a docs API section.
- Ordinary docs headings such as `/docs/installation/react#create-your-first-editor` are not tagged as docs API sections.
- Browser search for `duplicate definitions` shows `api.footnote.duplicateDefinitions` under Docs API Sections.

Verification surface:
- `apps/www/src/app/api/search/route.ts`
- `apps/www/src/lib/search-result-groups.ts`
- `apps/www/src/app/api/search/route.test.ts`
- `apps/www/src/lib/search-result-groups.test.ts`
- Browser proof on `http://localhost:3002/docs/footnote`

Constraints:
- Do not rename or rewrite docs headings for this bug fix.
- Preserve public docs anchors.
- Do not add client-side API-symbol guessing.
- Do not commit, push, or open a PR.

Boundaries:
- Source owner: the search API builds result metadata from Fumadocs source pages.
- UI owner: command-menu grouping consumes the `section: "docsApi"` result metadata.
- Non-goals: docs prose normalization, API reference page redesign, and unrelated search ranking changes.

Blocked condition:
No remaining blocker. Lint has a repo-level parser/config failure recorded under verification evidence.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Source read | yes | Read search route, grouping helper, focused tests, Fumadocs structure output, and footnote docs structure. |
| User scope | yes | User rejected regex/hash guessing and asked for a cleaner consistent approach. |
| Browser required | yes | App/docs search behavior changed, so localhost Browser proof was required. |
| Release artifact | no | App docs search behavior only; no package release artifact. |
| PR or tracker | no | User did not request commit, PR, or tracker sync. |

Work Checklist:
- [x] Objective, threshold, verification surface, constraints, boundaries, and blocked condition are recorded.
- [x] Root cause is recorded: search grouping could not infer plugin-doc API anchors from URL hashes reliably.
- [x] Implementation uses the right ownership boundary: the search API tags source-backed docs API section results.
- [x] Client grouping no longer guesses API symbols or hash names.
- [x] Public docs anchors are preserved.
- [x] Every docs source page was read by the static audit.
- [x] Focused tests cover API reference pages, docs API sections, ordinary docs headings, CN fallback search, and frontmatter exclusion.
- [x] Dev server was started on `http://localhost:3002`.
- [x] Browser proof used the approved in-app Browser.
- [x] Lint caveat is recorded.
- [x] No commit, push, PR, or tracker sync was performed.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Static docs audit | yes | Read 257 source pages, 2344944 bytes; tagged 714 docs API anchors; footnote API and transform anchors included; ordinary React installation heading excluded. |
| Focused tests | yes | `bun test src/lib/search-result-groups.test.ts src/app/api/search/route.test.ts` passed: 11 tests, 19 expects. |
| Typecheck | yes | `pnpm --filter www typecheck` passed, including source build, docs source parity, registry source check, and TS checks. |
| Whitespace diff check | yes | `git diff --check -- ...` passed for the touched files. |
| HTTP route proof | yes | `curl /api/search?query=duplicate%20definitions&locale=en` returned `/docs/footnote#apifootnoteduplicatedefinitions` with `section: "docsApi"`. |
| Browser proof | yes | In-app Browser search on `/docs/footnote` with `duplicate definitions` showed `api.footnote.duplicateDefinitions` under Docs API Sections and Footnote under Documentation. |
| Browser console/network | yes | Behavior proved; browser log buffer still had stale unrelated module-resolution errors from earlier failed page loads. |
| Lint | caveat | `pnpm --filter www lint:fix` fails repo-wide before this patch due ESLint parser/config errors on generated files and TS syntax, plus one pre-existing hooks warning. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | Search route, grouping helper, tests, Fumadocs structure, and docs headings inspected. | none |
| Implementation | done | Search API tags docs API sections with result metadata; client groups by metadata. | none |
| Verification | done | Focused tests, typecheck, static audit, HTTP proof, and Browser proof completed. | none |
| PR / tracker sync | done | N/A: no PR or tracker requested. | none |
| Closeout | done | Plan updated with evidence and caveats. | none |

Findings:
- Renaming docs headings would be the wrong fix for this bug: it would churn docs and risk breaking anchors. The cleaner boundary is metadata from the search API.

Decisions and tradeoffs:
- Chose source-backed tagging over heading rewrites.
- Preserved existing docs structure and public URLs.
- Kept the client grouping small and dumb.

Implementation notes:
- `/docs/api/**` remains API Reference.
- Search results tagged with `section: "docsApi"` group under Docs API Sections.
- Ordinary docs results remain Documentation.
- Raw frontmatter is stripped before indexing so route/title metadata is not searchable body text.

Review fixes:
- Removed client-side API symbol and hash regexes.
- Added route tests for footnote API anchors and normal-heading exclusion.
- Added grouping tests for metadata-backed docs API sections.

Error attempts:
| Error / failed attempt | Count | Resolution |
|------------------------|-------|------------|
| Earlier client-side hash and symbol regex classification was too messy | 1 | Replaced with search API metadata. |
| Browser selected tab was stuck on an old connection-refused data URL | 1 | Opened a fresh in-app Browser tab and verified localhost there. |
| Browser text fill failed because the virtual clipboard is unavailable | 1 | Used Browser keypress events to enter the search query. |
| Lint failed repo-wide | 1 | Recorded as repo-level ESLint parser/config caveat. |

Verification evidence:
- `bun test src/lib/search-result-groups.test.ts src/app/api/search/route.test.ts`: 11 pass, 0 fail, 19 expects.
- `pnpm --filter www typecheck`: passed.
- Static audit: `{ filesRead: 257, bytesRead: 2344944, pagesChecked: 257, docsApiAnchorCount: 714, includesFootnote: true, includesFootnoteTransform: true, excludesNormalHeading: true, searchIncludesFootnote: true, searchNormalHeadingUntagged: true }`.
- HTTP proof: `/api/search?query=duplicate%20definitions&locale=en` returned `/docs/footnote#apifootnoteduplicatedefinitions` with `section: "docsApi"`.
- Browser proof: `/docs/footnote` search input `duplicate definitions`; `api.footnote.duplicateDefinitions` appears under Docs API Sections; Footnote appears under Documentation.
- Lint caveat: `pnpm --filter www lint:fix` fails on existing repo-wide ESLint parser/config problems before this diff.

Reboot status:
Complete for the search grouping bug. Dev server remains running at `http://localhost:3002`.

Open risks:
- Existing top-level docs headings are still stylistically inconsistent. That is a docs-normalization task, not required for this search grouping fix.
- Browser log buffer contains stale unrelated module-resolution errors from earlier failed page loads; the target search behavior itself is verified.
