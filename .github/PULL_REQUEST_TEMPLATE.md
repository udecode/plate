## Summary

What problem does this PR solve?

Why does it matter?

What is the intended outcome?

What is intentionally out of scope?

What should reviewers focus on?

<details>
<summary>Summary guidance</summary>

Write this for human maintainers first. Maintainers may use local Codex to
review, reproduce, or continue the PR, but no hosted bot has your private
context. The PR body is the durable handoff.

Describe intent and outcome. Do not restate the diff.

</details>

## Linked context

Fixes #

Related #

Was this requested by a maintainer or package owner?

<details>
<summary>Linked context guidance</summary>

Link the issue, discussion, maintainer request, package owner request, or docs
page that explains why this PR should exist.

</details>

## Real behavior proof

- Behavior or issue addressed:
- Real environment tested:
- Exact steps or command run after this patch:
- Evidence after fix:
- Observed result after fix:
- What was not tested:
- Proof limitations or environment constraints:
- Before evidence, if available:

<details>
<summary>Real behavior proof guidance</summary>

External PRs that change user-visible behavior need proof from a real Plate
setup, docs route, package consumer, or minimal repro. Screenshots, recordings,
terminal output, console output, copied live output, linked artifacts, and
redacted logs all count.

Unit tests, mocks, snapshots, lint, typechecks, and CI are useful support, but
they do not prove visible editor behavior by themselves.

Redact private data, secrets, account details, and non-public endpoints.

</details>

## Tests and validation

Which focused commands did you run?

What regression coverage was added or updated?

What failed before this fix, if known?

If no test was added, why not?

<details>
<summary>Validation guidance</summary>

Run the smallest relevant lane first.

- Package work: `pnpm install`, `pnpm turbo typecheck --filter=./packages/<package>`, `pnpm lint:fix`
- Public exports or file layout: `pnpm brl`
- Published package changes: `pnpm changeset`
- Registry-only changes: update `docs/components/changelog.mdx`
- Broad confidence: `pnpm check`

List focused commands, not every incidental command.

</details>

## Plate / Plite ownership

- Surface: Plite substrate / Plate framework / docs / examples / registry / packages:
- Public API, docs, or examples changed:
- Changeset needed:
- Barrel update needed:
- Registry changelog needed:
- Browser or visual proof needed:

## Risk checklist

Did user-visible editor behavior change? (`Yes/No`)

Did public API, config, setup, migration, or docs behavior change? (`Yes/No`)

Did security, auth, untrusted content, network, file, or tool-execution behavior change? (`Yes/No`)

What is the highest-risk area?

How is that risk mitigated?

<details>
<summary>Risk guidance</summary>

Use this for author judgment that is not obvious from the diff. Reviewers can
see touched files; they cannot know which behavior you think is risky, why the
risk is acceptable, or which proof should matter most.

</details>

## Current review state

What is the next action?

What is waiting on author, maintainer, CI, external proof, or user decision?

Which bot or reviewer comments were addressed?

Was AI used? (`Yes/No`; if yes, summarize the tool/session and include prompts
or logs when useful.)

Codex takeover state:

- Exact next command or owner skill:
- Proof artifact or blocker:
- Unresolved reviewer/bot comments:
- Missing maintainer decision:

<details>
<summary>Review state guidance</summary>

Keep this current. If important state appears in comments, fold the current
next action or blocker back into the PR body so maintainers do not need to
reconstruct the thread.

</details>
