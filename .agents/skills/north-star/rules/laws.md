# Laws

## 1. Ownership Law

Public APIs need explicit owners.

- Core owns shared primitives and orchestration
- Feature packages own feature semantics
- Local kits own local sugar and convenience

Do not blur these because the short-term code path is convenient.

## 2. Layering Law

Every reusable surface must say what layer it belongs to:

- constitutional doctrine
- shared runtime primitive
- feature semantic contract
- execution helper
- local convenience

If you cannot name the layer, the API is not ready.

## 3. Explicitness Law

The best DX is not hidden DX.

- activation should be explicit
- naming should be readable
- ownership should be visible
- the common path should be discoverable from the call site

## 4. Runtime Boundary Law

Runtime/service concerns should be explicit seams, not side effects leaking out
of plugin code.

- caches
- projections
- diagnostics
- protocol boundaries
- layout/measurement services

## 5. Performance Law

Performance and scalability are design constraints, not later cleanup tasks.

If the nicer-looking API adds hot-path work, dispatch cost, allocation churn,
merge ambiguity, or invalidation complexity, that cost is part of the API
decision.

## 6. Canonical Semantics Law

Canonical feature semantics belong with the owning feature package.

Preference-heavy sugar belongs local until it becomes genuinely canonical.

## 7. Public Contract Law

Keep authoring-time type richness where it helps the author. Widen at runtime
storage boundaries when exact generics no longer matter.

Do not force runtime containers to pretend they preserve more type precision
than they actually need.
