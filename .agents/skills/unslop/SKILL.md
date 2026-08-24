---
name: unslop
description: Draft, audit, or edit prose to remove AI-writing tells without changing facts or flattening voice; use for humanizing text, reviewing AI slop, or scanning prose files and docs.
---

# Unslop

Make prose sound like its author on a good day. Cut formulas, preserve substance.

## Pick the job

- **Draft:** Write from a brief, source material, and an intended audience.
- **Edit:** Make the smallest set of changes that removes clear slop.
- **Audit:** Report exact spans and named patterns without rewriting.
- **File edit:** Change prose in named files while preserving code, data, frontmatter, and link targets.
- **Repo audit:** Rank prose files for human review. Rewrite only when the user also asks for fixes.
- **Embedded:** Clean text for another task, such as a PR body or email, and return only the final text.

If the user asks whether AI wrote a passage, audit the writing. Do not infer authorship or cite an AI detector as proof.

## Core contract

1. **Separate the brief from the artifact.** Instructions about the text do not belong in the text.
2. **Lock the substance.** Preserve facts, numbers, names, dates, URLs, citations, quotations, technical claims, causal claims, obligations, and meaningful qualifiers.
3. **Match the author.** A supplied writing sample outranks generic style rules. Preserve vocabulary, cadence, bluntness, humor, uncertainty, and deliberate rough edges.
4. **Respect the evidence boundary.** Never invent a feature, anecdote, metric, source, quote, owner, deadline, or outcome to make vague prose sound concrete.
5. **Edit surgically.** A clear human sentence needs no polish. A false positive that flattens voice is worse than one surviving tell.
6. **Protect literal content.** Do not rewrite code, commands, identifiers, quoted text, citation text, data, or link targets unless the user asks.
7. **Optimize for writing, not detectors.** Do not add odd wording, fake errors, invisible characters, or fabricated detail to evade detection.

## Workflow

1. Read the full input. Identify the artifact, audience, medium, purpose, and requested mode.
2. Record the core claim and the voice signals worth keeping. Keep this note internal unless the user asks for analysis.
3. Lock preservation-sensitive content. For vague or high-stakes copy, read [voice and preservation](references/voice-and-preservation.md).
4. Draft freely or collect candidate tells. For a thorough audit, read [pattern catalog](references/patterns.md).
5. Validate each candidate before changing it:
   - Does removing it lose meaning?
   - Is it a repeated formula or a deliberate choice?
   - Does it announce a point instead of making one?
   - Does it add evidence, mechanism, or character?
   - Would the author defend it?
6. Rewrite in this order:
   - remove leaked chatbot artifacts, placeholders, and unsupported claims;
   - cut throat-clearing, repetition, inflated significance, and generic endings;
   - replace abstractions with sourced mechanisms, consequences, examples, or numbers;
   - prefer direct verbs and named actors where they improve clarity;
   - fix repeated structures, metronomic rhythm, and decorative formatting;
   - add personality only when the source or author supports it.
7. Compare the rewrite with the source. Any lost or added claim is a defect.
8. Read the result aloud. Fix robotic symmetry, choppiness, blandness, and new formulas introduced during editing.

## Defaults, not dogma

- Use no em dashes by default. If an author sample or house style uses them deliberately, match that rate instead.
- Treat watched vocabulary as review signals, not forbidden words. Keep precise technical, legal, scientific, and domain terms.
- Prefer active voice when the actor matters. Keep passive voice when the actor is unknown, irrelevant, or intentionally omitted by the register.
- Vary rhythm by meaning, not by forcing arbitrary sentence lengths.
- Use the natural number of list items. A real group of three is fine.
- Preserve a load-bearing contrast, fragment, metaphor, or closing line. Rewrite repeated rhetorical tics.
- Neutral prose is correct for reference, legal, scientific, and technical material. Do not inject jokes or first person into it.
- Leave already-good prose alone.

## Output

- **Edit:** Return the revised text first. Add a short change note only when it helps the user assess material edits.
- **Audit:** For each finding, give the exact span, pattern name, reason, and smallest plausible fix. Report clusters, not an authorship verdict.
- **File edit:** Modify only the requested prose and report a compact summary.
- **Repo audit:** Report the worst candidate files and dominant patterns. Do not mass-rewrite unless requested.
- **Embedded:** Return only the finished text.

Read [modes and media](references/modes-and-media.md) for file, repo, detector-facing, high-stakes, or non-English work.

## Deterministic checks

When local text files are available, use the bundled script to find review candidates and compare preservation-sensitive tokens. Resolve `scripts/audit-prose.mjs` relative to this `SKILL.md`; pass absolute target paths when the current directory differs.

```bash
node scripts/audit-prose.mjs audit path/to/file-or-directory
node scripts/audit-prose.mjs compare original.txt rewrite.txt
```

Add `--json` for machine-readable output, `--include-quotes` to scan blockquotes, or `--fail-on-invariant-change` when a comparison should fail CI. The script reports signals. It cannot judge voice, truth, or authorship.

For provenance or skill maintenance, read [sources](references/sources.md).
