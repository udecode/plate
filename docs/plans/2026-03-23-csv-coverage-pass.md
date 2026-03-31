# CSV Coverage Pass

## Goal

Add a tiny, high-value non-React pass for `@platejs/csv` around the only two worthwhile seams:

- `deserializeCsv.ts`
- `CsvPlugin.ts`

## Constraints

- Fast-lane only.
- No broad package sweep beyond these two files.
- Prefer real editor and plugin contracts over mocked implementation detail.

## Slice

1. Add direct `deserializeCsv` coverage for:
   - default header mode
   - explicit array mode
   - invalid tiny CSV rejection
   - error-tolerance handling
2. Add a thin `CsvPlugin` contract spec for default options, bound CSV API, and parser metadata.
3. Allow one runtime fix if the direct tests expose a real bug.

## Notes

- There were no existing `csv` package specs.
- Direct runtime probing already showed a real default-header bug: valid CSV with `header: true` returns `undefined`.
