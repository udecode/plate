---
name: technical-writing
description: "Write, edit, and audit clear prose while preserving facts and house style. Use for docs, RFCs, READMEs, PR descriptions, commit messages, prose cleanup, and writing reviews. Includes document structure, anti-slop editing, and preservation checks."
---

# Technical writing

Write prose the reader understands on the first read, in the author's voice.
This skill owns drafting, editing, document structure, anti-slop review and
preservation. Use one integrated pass; do not invoke a second writing skill.

## Pick the job

| Request | Work |
| --- | --- |
| Draft | Write from the brief, source material, audience and intended medium. |
| Edit | Make the smallest changes that improve clarity and remove clear slop. |
| Audit | Report exact spans, named patterns, reasons and the smallest plausible fixes; do not rewrite. |
| File edit | Change only the named prose; preserve code, data, metadata and links. |
| Repo audit | Rank candidate files with the scanner, then inspect them. Rewrite only when requested. |
| Embedded | Shape another task's final prose and return only the usable text. |

Follow the current user and repository authority. A writing request does not
authorize posting, publishing or changing the product described. Tiny edits
need no plan, tool call or rereading of unrelated workflow methods.

## Preserve the substance and house style

- **House style first.** Explicit user direction, supplied writing samples and
  the repository's documented house style outrank generic stylistic defaults.
  Preserve deliberate cadence, bluntness, warmth, humor and rough edges.
- **Lock the claims.** Preserve facts, names, numbers, dates, causal claims,
  comparisons, obligations, uncertainty and meaningful scope limits. Never
  turn a possibility into a guarantee to make a sentence sound stronger.
- **Protect literals.** Keep code, commands, identifiers, quotations, data,
  frontmatter, citation text and link targets unchanged unless the requested
  change covers them. Validate changed technical examples against source.
- **Do not invent evidence.** Specificity must come from the source. Do not add
  a feature, anecdote, metric, owner, deadline or outcome to enliven vague copy.
- **Edit surgically.** Leave already-good prose alone. A false positive that
  flattens the author's voice is worse than one surviving stylistic tell.
- **Separate instructions from the artifact.** Do not leak the brief, planning
  notes, placeholders or chatbot chatter into finished writing.

For preservation-sensitive claims or author samples, read
[voice and preservation](references/voice-and-preservation.md).

## Write directly

Four layers help with technical documents: their purpose, how sentences address
the reader, how much each sentence carries and whether a sentence is ambiguous.
Use the layers that apply to the medium; house style governs presentation.

Three rules sit above the layers:

- **Cut every word that does no work.** If the sentence survives without a word, the word goes. "In order to" is "to". "It is important to note that" is nothing.
- **Use the short, everyday word.** "Use", not "utilize". "Help", not "facilitate". "Do", not "perform". A long word has to buy its length with precision.
- **When a rule makes a sentence worse, fix the sentence another way or leave it alone.** The rules serve the reader. A sentence that follows every rule and sounds like a machine wrote it has failed.

The codebase is the word list. Write the real symbol, file, flag, or command name, not a synonym or a description of it.

Don't invent jargon. Use the words a developer would say out loud: "move", "delete", "a budget that only decreases", not "evacuate", "ratchet", or "endgame". A named pattern is fine when the doc says what it means the first time. Judge vague metaphors through the [pattern catalog](references/patterns.md); do not expand a banned-word list automatically.

## Vary the rhythm

The layers decide what a document says and how much each sentence carries. A doc can obey all of them and still read machine-written: every sentence clipped short, no view anywhere, nothing specific.

- Mix sentence lengths on purpose. Short sentences land a point. Longer ones that take their time carry a fact with its condition or consequence.
- One thought per sentence does not mean one length per sentence. Split the sentence that carries two thoughts. Keep the long sentence that carries one.
- Have a view where the mode allows it. Explanation weighs trade-offs, so say what you make of them instead of listing pros and cons. Reference stays dry.
- Be specific over sterile. Not "schema changes can cause issues" but "a column rename fails the build".

## Pick the mode first (Diátaxis)

Give each section one clear job. Two questions identify it: does the content
inform action (doing) or understanding (thinking), and does it serve learning
or work?

- Action + learning: **tutorial**.
- Action + work: **how-to**.
- Understanding + work: **reference**.
- Understanding + learning: **explanation**.

Use the compass to resolve competing reader goals. A focused guide usually
has one dominant mode. A component page can serve one practical goal through
installation, usage, examples and a compact API reference. Keep those sections
distinct; do not split a useful page merely to satisfy the taxonomy.

**Tutorial: learning by doing.** You are the teacher. The learner's success is your job, not theirs. Open by saying what the learner will build, not what they will "learn". Every step produces a visible result, early and often. Tell them what they should see: the expected output, the prompt change, the log line. Cut explanation to one clause and a link. Teaching pauses break the lesson. Stay concrete. Write as "we", in commands: "First, do x. Now, do y."

**How-to: steps to a goal.** Solve a problem a person has, not an operation the machine can perform. Assume competence. Skip teaching. Action only: no digressions, no background, no completeness for its own sake. Link those instead. Allow forks and judgment: "If you want x, do y." Name the guide by the task: "How to calibrate the radar array", not "Radar array calibration".

**Reference: facts for lookup.** State exact behavior, options, limits and errors. Include short usage instructions or examples when they clarify the contract; keep extended teaching and persuasion elsewhere. Preserve real uncertainty and limitations. Mirror the structure of the thing described, so code and docs can be navigated together. Put material where readers expect it. Generate from code where possible, so it stays true.

**Explanation: understanding and why.** One bounded topic, readable away from the product. Each title should tolerate an implicit "About..." in front. Anchor on a real why question. Give context: design decisions, history, constraints, alternatives. Distinguish judgments from facts. Other modes can recommend a path when the reader needs a choice; keep extended debate here.

Do not interrupt a tutorial with a reference catalog, restart a tutorial inside
reference, or bury a how-to in design debate. Split and link when the reader's
goal changes. A useful short table or caveat is not itself a reason to split.

Source: diataxis.fr, fetched 2026-07-18.

## Choose examples by reader need

When drafting, substantially revising, or auditing documentation, identify the
important reader tasks, claims and likely misunderstandings within its scope.
Give each a clear home in an example, precise reference section or linked
guide. Report missing coverage during an audit; implement it only within the
requested scope. A wording-only edit keeps its narrow scope.

- Choose each example for something distinct it helps the reader do or
  understand. Match its form and detail to the document's purpose and house
  style. Keep the natural number of useful examples.
- Keep examples small enough to understand and complete enough to use. Name
  their prerequisites. Reuse or link an existing example when it already
  serves the reader, and preserve meaningful details unless the requested
  change covers them.
- Distinguish implemented behavior from simulations and unverified claims.
  Label a mock service or local snapshot at the example; do not imply it
  proves a production integration. State unsupported or unverified behavior
  as a limitation rather than inventing it to complete the coverage.

Apply this coverage check within the existing writing pass. It does not require
a separate audit, plan or checklist artifact for every page. Project guidance
owns page presentation, domain-specific coverage and executable proof.

## Write sentences to the reader (Google developer style)

- Talk to the reader as "you", in the present tense. "Will" only for things that genuinely happen later.
- Say who does what: "the compiler checks", not "is checked". Passive is fine only when the actor is unknown or beside the point.
- Write instructions as commands: "Click Submit." State facts plainly. Never "should be done".
- Put the condition before the instruction: "To delete the document, click Delete." The reader skips what does not apply.
- Put the common case first. Exceptions after.
- Sound like a knowledgeable friend. Cut buzzwords and decorative metaphors. Prefer direct instructions without ceremonial "please" or claims that a procedure is "simple", "easy", or "quick". Preserve a deliberate voice when it helps the reader.
- Don't pre-announce ("we will soon support...") and don't start consecutive sentences with the same phrase.
- Read the awkward sentence aloud. If it stays awkward, rewrite it.
- Link with words that say where the link goes: the page title or a short description. Never "click here". Prefer a sentence of context on the page over a link off it.
- Headings identify the task or concept. Prefer a bare verb phrase for a task ("Create an instance"). Preserve established house headings such as "Installation", "Usage" and "API Reference" and stable API names. Use sentence case unless house style says otherwise. One h1 per page, no skipped levels.
- Numbered lists for sequences, bullets for everything else. Introduce a list with a complete sentence. Keep items parallel.
- Code goes in code font. UI elements go in bold. Use serial commas. Drop "etc." and say up front that a list is partial.

Source: developers.google.com/style, fetched 2026-07-18.

## Make statements load one at a time (STE rules)

- One instruction per sentence. One thought per sentence everywhere else.
- Inspect overloaded sentences. About 20 words for instructions and 25 for other sentences can flag complexity; they are not limits. Keep a longer sentence when splitting its condition or consequence makes it harder to read.
- Put the warning or condition before the step it guards: "If hot oil touches your skin, injuries can occur."
- Keep "the" and "a": "Remove backup file" reads two ways. "Remove the backup file" reads one.
- Give each word one meaning and one job, then keep it. If "check" means inspect, don't also use it for restrain.
- Pick one word per action and stick to it: "start", not "start" here and "initiate" there.
- Write procedures as direct commands, never as narration and never in the passive: "Install the component", not "the component must be installed".
- Reword an "-ing" construction when its actor, timing or causal meaning is unclear. Keep normal grammar and precise technical terms.

Source: asd-ste100.org (Issue 9, 2025), fetched 2026-07-18. The numbered rules and dictionary live in the spec PDF. The principles above are the transferable core.

## Leave no sentence open to two readings (Global English)

- Keep words like "only" and "not" next to the word they change: "only fails on growth" and "fails only on growth" say different things.
- Break up long noun strings: "the proto import budget check script" becomes "the script that checks the proto-import budget".
- Make every "it", "they", and "this" point at one obvious thing. Repeat the noun when in doubt. Never use "this" or "which" to point at a whole clause.
- Don't drop verbs: "Phase 1 moves the converters and Phase 2 the runtime" leaves Phase 2 without one. Give it one.
- Keep the small words that show structure. "Ensure that the switch is off" keeps "that" because it makes the sentence parse one way. Never trade clarity for word count.
- Repeat the article in a series when it prevents a misread: "the client and the host", not "the client and host", when they are two things.
- Say which parts "and" or "or" joins when a sentence can group two ways. "Both...and", "either...or", and "if...then" are free disambiguators.
- Prefer periods to crowded punctuation. Semicolons and em dashes are editorial choices governed by house style; replace them when doing so improves clarity.
- Make text in parentheses a full grammatical unit or its own sentence. Never form plurals with "(s)".
- Spell out alternatives when a slash hides their relationship: "a, b, or both" instead of an ambiguous "a/b". Preserve paths, commands and precise notation.
- Call each thing by one name, everywhere. A doc that says "the gate", "the ratchet", and "the budget check" for one thing teaches three things. Rewording an unchanged sentence between edits costs the same way: don't churn what didn't change.
- Prefer plain constructions for an international audience. Replace idioms, colloquialisms, Latin abbreviations and metaphors when they obscure meaning; preserve clear authorial voice and established technical terms.

Source: Kohl, The Global English Style Guide (SAS Press). Guideline text fetched from the Internet Archive and the SAS sample chapter, 2026-07-18.

## Voice and repo specifics

- Load the repository's writing and publishing reference when its named surface applies. Keep project paths, MDX components, source ownership and runtime proof in that owner; its house style governs the writing here.
- PR descriptions and commit messages are writing too. Every layer except Diátaxis applies to them.
- Product UI strings use the product's copy guidelines. Preserve their behavior, space constraints and accessibility meaning; do not impose documentation structure.
- Match the repository formatter when indenting code snippets. Write real paths and real symbols. Make every count or tree claim true at the commit that lands it, and include the command that regenerates it.

## Edit and check in one pass

1. Read the full input. Identify the audience, medium, purpose, requested job
   and house style. Record the central claim and voice signals internally.
2. Lock preservation-sensitive content. Draft the argument or make the requested
   edit before policing individual phrases.
3. Inspect candidate patterns with the [pattern catalog](references/patterns.md)
   for a thorough audit or stubborn rewrite. A watched word, fragment, contrast,
   metaphor or three-item list is a signal to inspect, not an automatic defect.
4. Remove leaked chatbot artifacts, unsupported claims, throat-clearing,
   repetition, inflated significance and generic endings. Replace abstractions
   with sourced mechanisms or consequences. Do not invent detail or personality.
5. Validate each change: does it lose meaning, flatten voice, or replace a
   deliberate choice with another formula? Keep the natural number of items
   and vary rhythm by meaning. Reference prose can remain neutral.
6. Compare the result with the source. Added or lost claims are defects. Read
   awkward passages aloud and fix choppiness, forced symmetry and new formulas.

For edits, return the revised text first; explain only material changes. For
audits, report exact spans, pattern names, reasons and smallest fixes. For
embedded writing, return only the finished artifact. Read
[modes and media](references/modes-and-media.md) for file/repo audits, personal
or non-English writing and detector-facing requests.

Do not infer AI authorship or optimize for detector scores. Never add fake
errors, invisible characters or fabricated anecdotes to evade a detector.

## Deterministic checks

For a file/repo audit or a preservation-sensitive rewrite, use the bundled
scanner when it adds useful evidence. It reports candidates and literal changes;
it cannot judge truth, voice or authorship. A tiny prose edit needs no scanner.
Resolve script paths relative to this skill and use absolute input paths when
working from another directory.

```bash
node scripts/audit-prose.mjs audit path/to/file-or-directory
node scripts/audit-prose.mjs compare original.txt rewrite.txt
```

Use `--json` for machine-readable output, `--include-quotes` to inspect quoted
text, or `--fail-on-invariant-change` when a comparison must fail on literal
changes. Inspect every finding; the scanner does not authorize automatic edits.
Source provenance is in [UPSTREAM.md](UPSTREAM.md) and
[the anti-slop source notes](references/anti-slop-sources.md).

## Worked example

Before:

> Configuration of the proto import ratchet budget script parameters is performed via budget.json. Note that it's important to remember that running with --write, which updates the committed budget to reflect the current count, should only be done when lowering it. If exceeded, CI fails.

After:

> `budget.mjs` reads the committed budget from `budget.json` and counts the files that import protos. If the count exceeds the budget, CI fails. Run `budget.mjs --write` only to lower the budget.

The fixes, by layer: "configuration is performed" becomes "`budget.mjs` reads", so someone does something (Google). "Ratchet" goes away. The script's real filename does the naming (jargon rule). The five-noun string breaks up into plain clauses (Global English). The hedge "note that it's important to remember" is deleted (cut every word that does no work). The failure condition moves ahead of the step it explains (STE). The buried "should only be done when lowering" becomes a command with "only" next to its verb (STE). "If exceeded" gets a subject: the count (Global English).

## Review checklist

Apply to any prose this skill covers. Item 1 applies to documentation work
beyond wording-only edits:

1. Does each section serve a clear reader goal, and does each important in-scope task or materially different behavior have a suitable example, reference or linked guide?
2. Is every instruction written as a command, with its condition in front?
3. Does any sentence carry too much? Split it when that improves clarity; retain the condition with the action it governs.
4. Can any word be cut without losing meaning? Cut it.
5. Is "only" next to the word it changes? Does every "it" point at one thing? Does every clause keep its verb?
6. Does each thing have exactly one name across the docs?
7. Would a developer say these words out loud? Replace invented metaphors and fancy synonyms with the plain word or the real symbol name.
8. Are all symbols, paths, and counts real at this commit, with the commands that regenerate the counts?
9. Did every claim, qualifier, obligation and literal survive the edit, and does the result still match the author and house style?
