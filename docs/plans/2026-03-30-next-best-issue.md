# Next Best Issue Triage

## Goal

Pick the next best issue to start in this repo, with a short rationale grounded in the live GitHub queue and current repo context.

## Source Of Truth

- User request: "pick the next best issue to start"
- Workflow: `task`
- Supporting skills: `planning-with-files`, `issue-intelligence-analyst`

## Task Shape

- Type: investigation / prioritization
- Complexity: non-trivial
- Heavyweight: no
- Code changes expected: no
- Browser surface: no

## Phases

1. Read workflow + repo instructions. Status: done
2. Inspect repo context and any relevant local docs. Status: done
3. Fetch live GitHub issue landscape. Status: done
4. Rank candidates and recommend one issue. Status: done

## Findings

- Repo requires concise handoff.
- For non-trivial work, planning state should live in `.claude/docs/plans/`.
- This task is tracker analysis, not code implementation, so no branch/setup noise.
- Repo: `udecode/plate`
- Open issue count analyzed: 14
- Recent closed issue count sampled: 14 within the last 30 days from the fetched set
- `#4798` is effectively done already: maintainer comment says fixed in `#4922`.
- `#4898` is not a clean next bug. Current evidence points to an unsupported nested blockquote+list markdown path, not a tight fix seam.
- `#4485` looked strong from the issue body, but current main already has explicit empty-list deserializer coverage in `packages/markdown/src/lib/deserializer/deserializeMdList.spec.tsx`, so it is likely stale or at least less trustworthy.
- `#4111` has the best mix of leverage and tractability:
  - clear repro and user-visible wrong behavior
  - no active PR covering it
  - current table neighbor lookup still uses naive path arithmetic and does not account for merged-cell spans
  - the relevant test seam already exists under `packages/table`
- Relevant local code seams:
  - `packages/table/src/lib/queries/getLeftTableCell.ts`
  - `packages/table/src/lib/queries/getTopTableCell.ts`
  - `packages/table/src/react/components/TableCellElement/setSelectedCellsBorder.integration.spec.tsx`

## Progress

- Loaded `task`, `planning-with-files`, and `issue-intelligence-analyst`.
- Read repo-local `AGENTS.md`.
- Fetched labels, open issues, recent closed issues, active PRs, and top-candidate issue threads.
- Final pick: `#4111` `Table: the table cell border is removed from the wrong cell`.
- First move if executing: add a merged-cell regression to the existing `setSelectedCellsBorder` integration coverage, then replace the naive adjacent-cell lookup with span-aware table-grid lookup.
