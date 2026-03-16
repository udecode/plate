---
name: vercel-root-directory-cli
description: >-
  Diagnoses and fixes Vercel CLI deploy failures caused by Root Directory
  misconfiguration in monorepos. Use when "vercel deploy" fails with
  "vercel.json file should be inside of the provided root directory" or when
  vercel.json placement conflicts with the project Root Directory setting. Not
  for general Vercel build errors or application-level deployment issues.
---

## Overview

Explains why `vercel build` can succeed while `vercel deploy` fails in a
monorepo: the Vercel project Root Directory is a subdirectory (e.g. `apps/www`)
but `vercel.json` sits at the repo root. Provides a diagnostic checklist using
`vercel project inspect` and two resolution paths (move the config or change the
Root Directory setting).

@.claude/skills/vercel-root-directory-cli/vercel-root-directory-cli.mdc
