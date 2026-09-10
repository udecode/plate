# Voice and preservation

Use this reference when editing an author's draft, working from vague source material, or handling technical, legal, medical, financial, policy, support, or incident claims.

## Preservation contract

Lock these before rewriting:

- people, organizations, products, places, and identifiers
- numbers, units, prices, percentages, dates, versions, and thresholds
- URLs, email addresses, citations, quotations, code, commands, and link targets
- causal claims, comparisons, scope limits, and sequence
- obligations and permission words such as `must`, `may`, `can`, `should`, and `will`
- uncertainty, probability, timing, and other meaningful qualifiers
- the author's first-person stance, humor, doubt, and deliberate roughness

A smoother sentence is worse if it broadens a narrow claim, turns uncertainty into certainty, changes an obligation, or drops the detail that made the claim checkable.

## Evidence boundary

Classify any proposed detail before adding it:

- `source`: stated in the draft or supplied material
- `inference`: follows narrowly from the source and is labeled when needed
- `placeholder`: a visible slot the author must fill
- `unsafe`: plausible but unsupported, so omit it

When the source only says a product is fast, useful, secure, or easy, do not invent a latency number, workflow, integration, certification, or customer result. Tighten the existing claim, flag the proof gap, or ask for the missing fact.

The same rule applies to anecdotes. Do not manufacture a late-night debugging story, a quirky colleague, sensory detail, or personal confession to simulate humanity.

## Find the voice

With an author sample, note:

- sentence and paragraph length
- plain or formal vocabulary
- preferred punctuation and transitions
- bluntness, warmth, skepticism, humor, and profanity
- first-person use and direct address
- tolerance for fragments, asides, repetition, and unfinished tension
- the kinds of specifics the author chooses

Match those traits. Do not clean a non-native writer into generic native prose when their choices are clear and intentional.

Without a sample, infer the register from the medium and source. Default to direct, specific prose with contractions where the medium allows them.

## Density without flattening

Use these tests after preserving meaning:

- **Sentence-load:** Each sentence should add a claim, fact, example, constraint, image, decision, mechanism, consequence, contradiction, or change in stance.
- **Portability:** If a sentence could move unchanged to another person, company, or product, it probably needs a subject-specific fact or should be cut.
- **Topic-swap:** Replace the main nouns with another domain. If the paragraph still works, it is too generic.
- **Summary-loss:** Compress the passage by half. Strong prose quickly loses specific ideas; padded prose barely changes.

Density does not mean maximum compression. Keep the words the reader needs to follow the argument on the first pass.

## Restraint

Collect candidates before editing. For each one, decide whether it is formula or voice. Keep deliberate parallelism, a useful fragment, a precise technical term, a real caveat, or an earned closing line.

If a passage is already strong, a light edit or no edit is the right answer.

## Mechanical comparison

Run this when both versions exist:

```bash
node scripts/audit-prose.mjs compare original.txt rewrite.txt
```

Review every missing or added invariant. The script catches literal changes, not semantic drift, so compare claims manually too.
