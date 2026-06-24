# Security Policy

If you believe you found a security issue in Plate, report it privately first.

Use a private [GitHub Security Advisory](https://github.com/udecode/plate/security/advisories/new).
Do not open a public issue or PR that discloses an unpatched vulnerability,
exploit path, secret, or security-sensitive proof of concept.

Plate is an editor framework, not a hosted service. Apps own deployment, auth,
servers, storage, uploads, CSP, and tenant boundaries. Plate owns the packages,
examples, templates, docs, and editor behavior it ships.

## What We Need

Make the report easy to reproduce and easy to route:

- affected package, file, function, and line range when possible;
- tested Plate, Slate, React, browser, framework, and package versions;
- reproduction steps or proof of concept against latest `main` or the latest
  released package version;
- demonstrated impact through Plate or Slate code, not only an app-specific
  misuse;
- the trust boundary crossed;
- remediation advice or a focused patch when practical.

If the claim targets a released version, include evidence from the shipped tag
or published package for that exact version. A `main`-only finding is useful,
but it is not proof that a released artifact is vulnerable.

## Triage Ladder

- **Critical:** package, release, or repository compromise; active
  exploitation; or unauthenticated high-impact trust-boundary bypass.
- **High:** verified trust-boundary bypass with limited preconditions,
  sensitive data exposure, or credential/tool execution impact.
- **Medium:** practical security weakness with constrained exploitability or
  substantial prerequisites.
- **Low:** defense-in-depth, hardening, narrow denial-of-service, or
  non-exploitable boundary clarity.
- **Invalid:** no Plate/Slate-owned boundary, app misuse only, scanner-only
  without reachability, or plain Slate-only issue that belongs upstream.

## Security-Relevant Surfaces

Security reports are most likely relevant when they involve:

- HTML or markdown parsing and serialization;
- import/export boundaries;
- untrusted editor content;
- uploads, media, embeds, links, and rendered external content;
- server/client boundaries in shipped examples or templates;
- package supply chain, install scripts, or published artifacts;
- AI/tool integrations that execute, fetch, transform, or persist data.

For agent-facing artifacts such as skills, prompts, scripts, browser harnesses,
or automation helpers, security review focuses on whether requested authority
matches the stated purpose. Hidden or disproportionate access to files,
commands, credentials, network services, publishing, or production systems is
security-relevant even when the code path looks like developer tooling.

Use safe defaults where possible. Plate should keep trust decisions visible to
application owners instead of hiding them behind convenience APIs.

## Usually Not a Security Bug

These reports are usually closed as invalid, support, or hardening unless they
show a real Plate-owned boundary bypass:

- scanner-only or dependency-only reports without reachable Plate impact;
- app-specific configuration mistakes outside Plate's shipped defaults;
- trusted application plugin code doing what trusted application code can do;
- prompt-injection-only chains without auth, sandbox, tool, data, or execution
  boundary bypass;
- issues limited to tests, benchmarks, local debugging tools, or maintainer-only
  harnesses that are not shipped as supported user surfaces;
- reports that only reproduce in plain Slate without Plate-specific code;
- reports that require control of the host process, package manager, build
  environment, or deployment environment.

If you are unsure, report privately. A careful private report beats a public
guess.

## Public Disclosure

Maintainers may hide, edit, close, or redirect public issues and PRs that expose
security-sensitive details. We will route real reports through the private
advisory path so the fix can land without giving attackers a public playbook.

If a public issue or PR appears to disclose an unpatched vulnerability,
maintainers route it through private advisory handling before normal queue
triage. Do not repeat exploit details in public comments.

Plate does not currently run a paid bug bounty program.
