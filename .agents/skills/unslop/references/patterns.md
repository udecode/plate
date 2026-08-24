# Pattern catalog

Use this catalog for a thorough audit or a stubborn rewrite. Judge clusters and repetition. A single token or construction is rarely enough to justify an edit.

## Delivery artifacts

These are usually safe to remove because they belong to the tool interaction, not the artifact.

| Pattern | Signals | Fix |
| --- | --- | --- |
| Chatbot chatter | "Great question", "I hope this helps", "Would you like me to" | Delete it. |
| Prompt restatement | Repeating the user's request before answering | Start with the answer. |
| Reasoning leak | "Let me think", planning steps, hidden-work narration | Keep the conclusion and evidence. |
| Citation leak | `turn0search0`, `oaicite`, `contentReference`, orphan citation tokens | Replace with a real citation or remove the token. |
| Placeholder leak | `[Your Name]`, `TODO SOURCE`, `2026-XX-XX` | Fill it or keep it visibly marked for the author. |
| Tracking residue | AI-tool UTM or referrer parameters | Remove tracking parameters without changing the destination. |
| Markdown bleed | Markdown in an email, DM, SMS, or plain-text field | Use the destination's actual formatting. |
| Unicode tricks | Zero-width characters or look-alike letters used to fool a scanner | Normalize the text. Never evade detectors this way. |
| Diff narration | Docs that say a function "now" works or "was changed" | Describe current behavior unless the document is about the change. |

## Empty framing and inflated meaning

| Pattern | Signals | Fix |
| --- | --- | --- |
| Throat-clearing | "Here's the thing", "It's worth noting", "Let me be clear" | State the point. |
| Faux insight | "What everyone misses", "The uncomfortable truth", "The real question" | Make the claim earn its importance. |
| Announcement | "Let's explore", "This section covers", heading repeated by its first sentence | Start with content. |
| Significance inflation | pivotal moment, testament, broader trend, lasting legacy | State what happened and why it matters in concrete terms. |
| Symbolic gloss | Telling readers what an ordinary fact represents or embodies | Keep the fact and sourced interpretation. |
| Importance flag | "This matters", "The stakes are high" | Name the consequence. |
| Stock challenges | Vague problem list followed by automatic optimism | Give specific problems and actions or cut the section. |
| Generic ending | "The future looks bright", "Only time will tell" | End on the last useful fact, decision, question, or action. |
| Recap ending | "In conclusion" or a paragraph that repeats the piece | Cut it unless the medium requires a summary. |

## Unsupported or abstract claims

| Pattern | Signals | Fix |
| --- | --- | --- |
| Vague attribution | experts say, research suggests, widely regarded | Name the source or remove the claim. |
| Promotional inflation | world-class, revolutionary, effortless, praise without constraints | Replace applause with a sourced mechanism or result. |
| Abstract benefit | efficiency, alignment, confidence, momentum with no changed step | Name the owner, mechanism, before/after state, or proof gap. |
| Superficial analysis | trailing `-ing` clause that labels significance | Delete it or write a sourced causal sentence. |
| Fabricated specificity | New metrics, dates, names, examples, or anecdotes | Remove them or mark a placeholder. |
| False agency | Data "tells", a decision "emerges", a market "rewards" | Name the actor when the actor matters. |
| Missing stance | Perfectly balanced opinion with no defensible judgment | State the author's real view when the task is argumentative. |

## Wording tells

Treat these as prompts to inspect the sentence, not automatic bans.

### High-signal phrases

`delve into`, `a tapestry of`, `a testament to`, `in today's ... landscape`, `it's important to note`, `at its core`, `plays a crucial role`, `stands as`, `serves as`, `deep dive`, `unlock the power`, `move the needle`, `circle back`, `in the realm of`.

### Density signals

Clusters of these often indicate generic or promotional prose: `additionally`, `furthermore`, `moreover`, `crucial`, `pivotal`, `robust`, `seamless`, `transformative`, `multifaceted`, `nuanced`, `foster`, `leverage`, `utilize`, `facilitate`, `underscore`, `highlight`, `showcase`, `vibrant`, `innovative`, `comprehensive`.

Keep a watched word when it is the exact term or the author's deliberate choice. Replace it when a plain word or concrete mechanism says more.

Other wording patterns:

- Long phrases hiding short verbs: `has the ability to` instead of `can`, `made a decision` instead of `decided`.
- Copula avoidance: `serves as`, `stands as`, or `boasts` where `is` or `has` is clearer.
- Synonym cycling: renaming the same thing every sentence. Repeat the clearest term.
- False ranges: `from X to Y` where X and Y do not form a real scale.
- Adverb piles and hedge stacks: keep only the qualifier that carries meaning.
- Dead metaphors and business jargon: name the actual action, cost, or tradeoff.
- Invented concept labels: a fresh `paradox`, `trap`, or `framework` used as if already defined.
- Hyphenation by reflex: use the target style guide and normal grammar.

## Structure and rhythm

| Pattern | Signals | Fix |
| --- | --- | --- |
| Binary reframe | "not X, but Y" repeated as a reveal | State Y directly or keep the one contrast that carries the argument. |
| Negative countdown | "Not X. Not Y. Z." | State Z. |
| Self-answered question | "The result? Devastating." | Fold the answer into a sentence. |
| Staccato drama | Runs of fragments and one-line punch paragraphs | Connect related ideas and vary pace by meaning. |
| Rule-of-three reflex | Repeated tidy triads | Use the natural number of items. |
| Anaphora by template | Several sentences with the same opener and shape | Combine or vary them unless repetition is deliberate. |
| Listicle in prose | "The first... The second..." paragraphs | Use a real list or build an argument. |
| Reshufflable paragraphs | Blocks can change order without affecting logic | Make each paragraph advance the previous one. |
| Point dilution | One claim repeated through new metaphors and summaries | State it once, support it, move on. |
| Historical name stack | Rapid-fire companies, products, or eras as borrowed authority | Use one relevant example and analyze it. |
| Uniform shape | Similar sentence lengths and identical paragraph sizes throughout | Rebuild around the content, not a numerical target. |
| Punchline cadence | Every paragraph ends with a slogan or aphorism | Let some paragraphs end on evidence or transition. |

## Formatting

- Use sentence case for ordinary headings.
- Remove decorative emoji and random inline bold.
- Avoid lists whose bold labels repeat the text after them.
- Use headers, tables, and bullets only when they make the content easier to scan.
- Use no em dashes by default, but preserve an author's established punctuation style.
- Match straight or curly quotation marks to the destination instead of treating either as proof of AI writing.

## False positives

Do not flag these alone:

- correct grammar or polished prose
- one watched word, em dash, transition, fragment, or three-item list
- formal or technical vocabulary used precisely
- neutral reference writing
- deliberate rhetoric, parallelism, repetition, or metaphor
- source text inside quotations, examples, titles, code, or identifiers
- a real caveat, named objection, legal notice, or safety limit
- a real design alternative that the document analyzes

The best evidence is a cluster that adds no meaning and does not match the author.
