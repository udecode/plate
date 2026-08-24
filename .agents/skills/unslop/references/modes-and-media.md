# Modes and media

## Draft

Write for the named audience, medium, and purpose. Use source material as the factual boundary. If the brief lacks a fact needed for a concrete claim, leave a visible placeholder or ask for it instead of filling the gap.

Draft before policing every phrase. Run the anti-slop pass after the argument exists.

## Edit

Preserve the writer's structure unless it blocks clarity. Make the minimum effective changes, then compare every claim with the source.

For a standalone edit, return the final text first and summarize only material changes. Do not produce a forensic report unless asked.

## Audit

Read the whole piece before flagging anything. Report exact spans in context, group repeated instances, and distinguish strong findings from weak signals.

Use this shape:

```text
"exact span" | pattern | why it reads as formula | smallest fix
```

Do not guess who wrote the text. Do not call ordinary polish, correct grammar, a single em dash, one formal word, or one three-item list evidence of AI authorship.

## File edit

Edit only prose the user put in scope. Preserve frontmatter, code blocks, inline code, commands, data, tables that encode data, URLs, and Markdown link targets. Keep examples and quoted material literal unless the user asks to rewrite them.

Documentation should describe the current behavior. Mention an earlier implementation only in changelogs, release notes, migration guides, postmortems, or other change-focused documents.

## Repo audit

Run:

```bash
node scripts/audit-prose.mjs audit path/to/docs
```

Use the output to rank candidates. Read the highest-ranked files before judging them because code samples, templates, and quoted examples can produce false positives. An audit request does not authorize rewriting; a fix request does.

## Embedded copy

For commit messages, PR descriptions, comments, emails, support replies, captions, or another task's final prose, apply the checks internally and return only the usable text. Do not append an audit or announce the skill.

Match the destination:

- Email, DMs, and SMS should not contain Markdown unless the destination renders it.
- Social copy should not gain hashtag stacks, decorative emoji, or fake engagement hooks.
- Technical and scientific writing keeps exact terminology, citations, and necessary caveats.
- Policy, legal, medical, financial, support, and incident writing keeps obligations and evidence boundaries exact.
- Marketing copy needs sourced mechanisms and outcomes, not stronger adjectives.
- Personal writing may keep opinions, asides, mixed feelings, fragments, and profanity when they belong to the author.

## Detector-facing work

Public AI detectors are unstable classifiers, not authorship proof. If the user explicitly asks to run or discuss one, record:

- tool name and URL
- date and timezone
- exact input or its hash
- raw result or screenshot path
- result class and any access warning

Report: "Tool X returned Y for this text on this date." Never report that the text is proven human, undetectable, or safe against future detectors. Conflicting results stay conflicting.

Do not optimize prose for a detector score. Optimize fidelity, specificity, voice, directness, density, and rhythm.

## Non-English text

The bundled pattern catalog is English-first. Apply its underlying tests, such as empty framing, unsupported significance, repetition, evidence loss, and register mismatch, but do not transplant English word lists, punctuation bans, sentence-length thresholds, or detector claims into another language.

Use native punctuation and idiom. When native review is unavailable, say that the language-specific pass is unverified.
