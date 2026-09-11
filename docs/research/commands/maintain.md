# Research Maintenance

For existing feature/architecture work, run these commands from the repository
root before another investigation:

```sh
node tooling/scripts/review-ledger.mjs lookup <scope-or-feature>
node tooling/scripts/review-ledger.mjs research <key-or-term>
```

Read the matched originals and reconcile the current conclusion through the
[review-history contract](../schema.md#review-history). Repeated reviews are
automatic; they do not require a mode flag or an external research refresh.
After an index or review-record change, run the helper's `render` and `check`.

Primary reusable entrypoint:

- [$research-wiki](../../../.agents/skills/research-wiki/SKILL.md)

Recommended command name:

- `research-maintain`

Suggested invocation shape:

```text
research-maintain <area?>
```

Examples:

```text
research-maintain
research-maintain editor behavior references
research-maintain plate v2 architecture
```

## Purpose

Run the upkeep pass for the research layer.

This command is lighter than
[full-pipeline.md](full-pipeline.md).

It is the maintain-mode sub-workflow for `research-wiki`.

It is for keeping existing research healthy, not for opening a whole new lane
from scratch.

## When To Use

Use `research-maintain` when:

- the research layer already has coverage in the area
- you want to detect stale or missing compiled pages
- you want to find contradictions, orphan pages, or weak sourcing
- a task feels bigger than the visible pages, but not big enough for a full new
  ingest push

Do not use it when:

- starting a brand-new domain from near zero
- the relevant raw corpus does not exist yet
- you already know you need a full research pass

## Outputs

Expected outputs:

- updated stale compiled pages when the evidence is already available
- missing `index.md` and backlink fixes
- explicit gap report for what is still missing
- appended [log.md](../log.md)

## Loop

### 1. Scope the area

If an area is provided, infer the likely:

- entities
- concepts
- systems
- decisions

If no area is provided, run a broad upkeep pass across the current research
layer.

### 2. Read compiled coverage first

Read:

1. [index.md](../index.md)
2. the relevant compiled pages

### 3. Check for upkeep gaps

Look for:

- stale pages
- contradictions
- orphan pages
- duplicated pages
- weakly sourced claims
- missing compiled summaries for raw evidence that already exists
- missing concept/system/decision pages where source summaries already imply
  them

### 4. Fill safe gaps

Safe actions:

- update stale summaries from already-known evidence
- add missing backlinks and index entries
- split mixed pages
- create missing stubs when source support is obvious
- open explicit `open-questions/...` pages instead of faking certainty

Unsafe actions:

- inventing new decisions without enough evidence
- pretending the area is complete because some pages exist
- silently flattening contradictions

### 5. Report what remains

Return:

- what was fixed
- what was still missing
- whether the area now needs
  [full-pipeline.md](full-pipeline.md)
  instead

## Rule Of Thumb

`research-full` is for building or rebuilding a lane.

`research-maintain` is for keeping a lane honest.
