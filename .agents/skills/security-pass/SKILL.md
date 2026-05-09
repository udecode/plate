---
description: Conditional security review pass for auth, permissions, secrets, destructive actions, privacy, sandboxing, supply chain, and public security-sensitive surfaces.
argument-hint: '[scope]'
disable-model-invocation: true
name: security-pass
metadata:
  skiller:
    source: .agents/rules/security-pass.mdc
---

# Security Pass

Handle $ARGUMENTS.

Use this as a targeted security review, not a generic fear tax.

## Use When

- Auth, sessions, permissions, roles, access control, secrets, tokens, webhooks,
  payments, privacy, destructive actions, sandboxing, file/network access, or
  supply chain behavior is in scope.
- A public API can expose sensitive data or grant capability.
- A plan changes trust boundaries.

## Do Not Use When

- The change is purely visual or docs-only with no security claim.
- A security-sensitive area is not touched and no new trust boundary appears.

## Completion-State Pass Fields

```md
status: pending
current_pass: security-pass
current_pass_status: in_progress
current_pass_skill: .agents/skills/security-pass/SKILL.md
current_pass_scope: <security-sensitive surface>
current_pass_trigger: trust boundary touched
```

## Procedure

1. Name the protected assets and capabilities.
2. Name trust boundaries and actors.
3. Check:
   - authentication
   - authorization
   - secret handling
   - input validation
   - output/data exposure
   - destructive action guardrails
   - logging/telemetry leakage
   - dependency or sandbox risks
4. Tie each finding to a concrete file, API, command, or plan section.
5. Require a fix, explicit acceptance, or deferral for every real risk.
6. Do not block on theoretical risks without an attack path.

## Output

- assets/capabilities
- trust boundaries
- findings
- required fixes or accepted risks
- verification
- verdict: `pass`, `revise`, or `blocked`
