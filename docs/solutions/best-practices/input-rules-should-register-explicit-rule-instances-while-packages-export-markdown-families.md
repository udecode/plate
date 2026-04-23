---
title: Input rules should register explicit rule instances while packages export markdown families
date: 2026-04-14
category: best-practices
module: core
problem_type: best_practice
component: tooling
symptoms:
  - Boolean-key `inputRules` config turned every public discussion into naming bikeshed about keys like `hash`, `fence`, or `strongAsterisk`.
  - Packages owned canonical markdown semantics, but kits only toggled them by string keys instead of registering concrete rule instances.
  - Runtime storage had to pretend that exact rule-name registries mattered even though dispatch only cared about concrete rules.
root_cause: inadequate_documentation
resolution_type: code_change
severity: medium
tags: [input-rules, api-design, markdown, kits, packages, plate]
---

# Input rules should register explicit rule instances while packages export markdown families

## Problem

The old `inputRules` shape mixed two separate ideas:

- package-owned canonical rule semantics
- kit-time activation via boolean key maps

That made the public API worse than the runtime actually needed. Users were not
really choosing "keys". They were choosing concrete markdown behaviors.

## What Didn't Work

- Boolean-key activation like `inputRules: { hash: true }`.
- Treating public keys as the real API unit instead of concrete rule instances.
- Leaking low-level mechanics like `trigger` into closed canonical package
  families when the package already knew the syntax shape.
- Keeping canonical rules on base plugins as dormant named registries instead of
  exporting reusable rule families.

## Solution

Use explicit rule-instance registration:

```ts
H1Plugin.configure({
  inputRules: [HeadingRules.markdown()],
});
```

Packages export semantic markdown families:

```ts
BoldRules.markdown({ variant: '*' })
HeadingRules.markdown()
HorizontalRuleRules.markdown({ variant: '-' })
TaskListRules.markdown({ checked: false })
LinkRules.markdown()
LinkRules.autolink({ variant: 'paste' })
MathRules.markdown({ variant: '$' })
```

The runtime stores only concrete rules. It does not need an "available rules"
registry or string-key activation layer.

## Why This Works

- Package ownership stays clear: the feature package owns the markdown
  semantics.
- Kit activation stays explicit: the kit registers the exact rule instances it
  wants.
- Public naming gets simpler because punctuation becomes a `variant` value, not
  a top-level config key.
- Closed canonical families stop leaking mechanical config like raw `trigger`
  unless the family is intentionally open-ended.
- Runtime dispatch becomes a concrete-rule problem again, which matches what the
  engine actually does.

## Prevention

- For package-owned markdown entry, export `FeatureRules.markdown(...)`.
- For split list families, use feature namespaces like
  `BulletedListRules.markdown(...)`, `OrderedListRules.markdown(...)`, and
  `TaskListRules.markdown(...)`.
- For non-markdown behavior, keep semantic families like `LinkRules.autolink`.
- Do not reintroduce boolean-key activation for canonical package rules.
- Do not make kits depend on dormant named registries when they can register the
  exact rule instances directly.
