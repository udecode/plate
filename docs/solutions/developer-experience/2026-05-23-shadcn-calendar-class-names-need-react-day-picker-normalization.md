---
title: Shadcn calendar output needs React Day Picker API normalization
date: 2026-05-23
category: developer-experience
module: Registry Automation
problem_type: developer_experience
component: tooling
symptoms:
  - "Validate Registry failed while building templates/plate-playground-template"
  - "TypeScript rejected classNames.table in src/components/ui/calendar.tsx"
  - "TypeScript rejected initialFocus in src/components/ui/date-node.tsx"
root_cause: wrong_api
resolution_type: workflow_improvement
severity: medium
tags: [templates, shadcn, registry, react-day-picker, calendar, ci]
---

# Shadcn calendar output needs React Day Picker API normalization

## Problem

`Registry / Validate Registry` failed in the playground template after `pnpm templates:update --local` regenerated `components/ui/calendar.tsx`.

The generated calendar and registry-installed date node used React Day Picker props that do not match the latest template dependency graph.

## Symptoms

The failing CI job built `templates/plate-playground-template` and stopped on:

```text
Type error: Object literal may only specify known properties, and 'table' does not exist in type 'Partial<ClassNames>'.
```

The local template had:

```tsx
classNames={{
  table: 'w-full border-collapse',
}}
```

with `react-day-picker@9.14.0`.

After that was fixed, the same job updated the template dependency graph to `react-day-picker@10.0.1` and stopped on:

```text
Property 'initialFocus' does not exist on type ...
```

React Day Picker v10 uses `autoFocus`.

## What Didn't Work

- Treating it as a Fumadocs or app build failure. The app build was not the red check; template validation was.
- Hand-editing `templates/**`. Those files are generated output in this repo, so patching them directly just hides the bad generator step.
- Running a plain copied-template build without the CI local package override. That hit unrelated local package tarball noise and missing `@platejs/*` packages, not the calendar type error.

## Solution

Patch the template updater's generated-code normalization step:

```bash
normalize_react_day_picker_api() {
  local calendar_file="$1/src/components/ui/calendar.tsx"
  local date_node_file="$1/src/components/ui/date-node.tsx"

  if [[ -f "$calendar_file" ]] && grep -q "react-day-picker" "$calendar_file"; then
    perl -0pi -e 's/(\n\s*)table:/${1}month_grid:/g; s/defaultClassNames\.table/defaultClassNames.month_grid/g' "$calendar_file"
  fi

  if [[ -f "$date_node_file" ]] && grep -q "@/components/ui/calendar" "$date_node_file"; then
    perl -0pi -e 's/(\n\s*)initialFocus(\n)/${1}autoFocus$2/g' "$date_node_file"
  fi
}
```

Then call it after `shadcn add` and relative import normalization:

```bash
normalize_relative_ts_imports "$TEMPLATE_DIR/src"
normalize_react_day_picker_api "$TEMPLATE_DIR"
```

## Why This Works

React Day Picker v9.14 exposes `month_grid`, not `table`, in its default class names. React Day Picker v10 removes the deprecated `initialFocus` prop and keeps `autoFocus`. `shadcn@latest` and Plate registry source can straddle those versions, so the template updater has to normalize generated calendar output before template lint/build checks run.

Keeping the fix in `tooling/scripts/update-template.sh` preserves the repo boundary: source controls generation behavior, and `templates/**` remains generated output.

## Prevention

- When template CI fails in generated shadcn UI, patch the updater or registry source instead of the generated template.
- Check the installed third-party type surface before assuming shadcn output matches it. For this case, React Day Picker exposes `getDefaultClassNames().month_grid` and v10 uses `autoFocus`.
- Use a focused fixture when full template build is blocked by unrelated package override noise: transform a copied template and verify the original `calendar.tsx` and `date-node.tsx` errors disappear.

## Related Issues

- [Template updater should generate, not own CI verification](./2026-03-13-template-update-script-should-not-own-ci-verification.md)
- [Template update and check need an arg-safe wrapper, template-scoped lint, and a TS6 baseUrl opt-out](./2026-03-25-templates-update-check-need-arg-safe-wrapper-template-scoped-lint-and-ts6-baseurl-opt-out.md)
