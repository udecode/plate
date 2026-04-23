# Research Schema

This is the minimal schema for the research layer.

Keep it small. The goal is consistency, not ceremony.

## Required By Page Type

### `sources/*`

Required frontmatter:

```yaml
title: ...
type: source
status: stub | partial | strong | stale
source_refs:
  - ../raw/...
updated: YYYY-MM-DD
```

### `entities/*`

Required frontmatter:

```yaml
title: ...
type: entity
status: stub | partial | strong | stale
updated: YYYY-MM-DD
related:
  - ...
```

### `concepts/*`

Required frontmatter:

```yaml
title: ...
type: concept
status: stub | partial | strong | stale
updated: YYYY-MM-DD
related:
  - ...
```

### `systems/*`

Required frontmatter:

```yaml
title: ...
type: system
status: stub | partial | strong | stale
updated: YYYY-MM-DD
related:
  - ...
```

### `decisions/*`

Required frontmatter:

```yaml
title: ...
type: decision
status: proposed | accepted | superseded
updated: YYYY-MM-DD
source_refs:
  - ...
related:
  - ...
```

### `open-questions/*`

Required frontmatter:

```yaml
title: ...
type: open-question
status: open | resolved
updated: YYYY-MM-DD
related:
  - ...
```

## Field Meanings

- `title`
  Human-readable page name.
- `type`
  The page class. Do not invent new values casually.
- `status`
  Lightweight coverage or lifecycle signal.
- `updated`
  Last meaningful content update.
- `source_refs`
  Pointers to raw evidence or primary repo docs.
- `related`
  Important neighboring pages in `docs/research` or source-of-truth docs.

## Rule

If a page type does not need more fields, do not add more fields.
