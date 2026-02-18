# Scratchpad: formatCommentDate Verification

## Objective
Verify that formatCommentDate tests pass and that the function is purely a UI display utility with no relation to docx-io import/export.

## Architecture Review

### Date Flow
1. **Import (DOCX → Plate)**: `parseDateToDate(c.date)` in importComments.ts
   - Takes Word date string, returns JS Date
   - Stored in `TComment.createdAt: Date`

2. **Storage**: `createdAt` is a JS Date object

3. **UI Display**: `formatCommentDate(new Date(comment.createdAt))` in comment.tsx
   - Pure UI utility using date-fns
   - Returns: "5m", "3h", "1d", or "MM/dd/yyyy"
   - **NO relation to docx-io**

4. **Export (Plate → DOCX)**: `normalizeDate(comment.createdAt)` in exportTrackChanges.ts
   - Converts Date to Word format (local time with Z suffix)

### Key Insight
The formatCommentDate function (lines 618-635) is ONLY for UI display. It has NOTHING to do with:
- Word date parsing (parseDateToDate)
- Word date formatting (normalizeDate)
- Round-trip fidelity

### Test Status
- formatCommentDate tests: 20/20 pass
- injectDocxTrackingTokens tests: 40/40 pass
- parseDocxTracking tests: 39/39 pass

## Conclusion
All tests pass. The architecture is correct:
- formatCommentDate = UI display only (date-fns)
- parseDateToDate = import from Word
- normalizeDate = export to Word

These are three separate concerns with no overlap.
