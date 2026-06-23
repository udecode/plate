# Maintainer Security

Security-shaped maintainer work routes through `maintainer security`, then
`security-triage`.

This is local Codex guidance for Plate/Plite maintainers. Public policy lives
in `SECURITY.md`.

## Read First

1. `SECURITY.md`.
2. Root `VISION.md`.
3. `docs/vision/common.md`.
4. Live GitHub Security Advisory, public issue, PR, Dependabot alert, CodeQL
   alert, or report source.
5. Affected source, shipped package, tag, or artifact.
6. `security-triage` skill.

## Triage Ladder

| Severity | Meaning |
| --- | --- |
| Critical | Package/release/repository compromise, active exploitation, or unauthenticated high-impact trust-boundary bypass. |
| High | Verified trust-boundary bypass with limited preconditions, sensitive data exposure, or credential/tool execution impact. |
| Medium | Practical security weakness with constrained exploitability or substantial prerequisites. |
| Low | Defense-in-depth, hardening, narrow denial-of-service, or non-exploitable boundary clarity. |
| Invalid | No Plate/Plite-owned boundary, app misuse only, scanner-only without reachability, or plain Plite-only issue that belongs upstream. |

## Required Proof

- affected package, version, file, and function when known;
- trust boundary crossed;
- latest `main` state;
- released/shipped state when the claim targets a release;
- reproduction or concrete proof of concept;
- existing mitigation or safe default;
- regression test, source audit, or explicit reason no test fits.

Do not call a report fixed from code review alone. Security closure needs
shipped-state proof when the claim is about shipped packages.

## Agent Artifact Review

For skills, prompts, scripts, browser harnesses, or other agent-facing
artifacts, review authority against purpose:

- requested credentials, env vars, permissions, commands, and network access;
- files the artifact can read or write;
- external services it can contact;
- whether the name, docs, metadata, and behavior honestly disclose that power;
- whether the authority is proportionate to the stated job;
- whether the artifact can publish, mutate user data, run commands, or access
  production systems;
- whether install/update instructions ask for unexpected trust.

Powerful behavior is not automatically malicious. Hidden, disproportionate, or
misleading authority is the problem.

## Public Report Handling

If a public issue or PR appears to disclose an unpatched vulnerability:

1. Stop normal queue handling.
2. Avoid repeating exploit details in public text.
3. Route to private advisory handling.
4. Ask for explicit maintainer authority before any public comment, label,
   close, edit, or disclosure wording.

## Closure

Before handoff, record:

- classification and severity;
- owner package or docs boundary;
- proof command or blocker;
- public/private mutation boundary;
- reporter/maintainer action needed;
- follow-up hardening or docs tasks.
