# Cohort Segmentation

Use this when "large document" or "big surface" is treated as one bucket.

## Rule

Segment by size and complexity before choosing tactics.

Baseline Slate cohorts:

| Cohort | Examples | Default stance |
| --- | --- | --- |
| normal | 0-500 blocks, low decorations | optimize the repeated unit |
| medium | 500-2000 blocks | DOM-present, strict budgets |
| large | 2000-10000 blocks | DOM-present grouping, staged work, native behavior guarded |
| stress | 10000-50000 blocks | explicit degradation candidates |
| pathological | custom renderers, comments, annotations, nested hidden ranges | complexity-tagged, not hidden inside block count |

## Complexity Tags

- custom leaf/text/element renderer
- decorations per block
- annotations/comments per block
- hidden boundary count and depth
- inline voids, voids, tables
- collaboration activity
- selection span length
- shell/DOM-present/off/staged mode
- mobile/IME/browser

## Output

Every perf claim names the cohort it covers. No "fast for large docs" without a
size and complexity tag.
