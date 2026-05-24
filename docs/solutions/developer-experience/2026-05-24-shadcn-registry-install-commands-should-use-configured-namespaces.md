---
title: Shadcn registry install commands should use configured namespaces
date: 2026-05-24
category: developer-experience
module: apps/www docs registry
problem_type: developer_experience
component: documentation
symptoms:
  - "Visible docs and block UI copied raw /r/ registry URLs even though templates configure @plate"
  - "MCP setup showed a raw registry URL command while also telling users to configure the @plate registry"
  - "Browser smoke surfaced a Radix dialog warning after opening the MCP setup dialog"
root_cause: config_error
resolution_type: migration
severity: medium
tags: [shadcn, registry, namespace, docs, mcp, browser-smoke]
---

# Shadcn registry install commands should use configured namespaces

## Problem

Plate templates already configure the `@plate` registry namespace, but several docs and block surfaces still displayed or copied raw registry URLs such as `http://localhost:3000/rd/table-kit`.

That mixed two different contracts: raw `/r/*` URLs are good for resolvable registry content, while user install commands should use the shadcn namespace syntax that `components.json` provides.

## Symptoms

- `ComponentInstallation`, `ComponentSource`, block preview toolbars, block metadata, and MCP setup each assembled their own `npx shadcn@latest add ...` command.
- The displayed button text said `npx shadcn@latest add {name}` while the copied value used a raw registry URL.
- The MCP dialog told users to add `@plate` to `components.json`, then initialized from a raw `siteConfig.registryUrl`.
- Opening the MCP dialog in browser smoke logged Radix's missing description warning.

## What Didn't Work

- Treating `siteConfig.registryUrl` as the general install-command source. That URL is still needed for LLM context, v0 URLs, and direct registry content links, but it is the wrong default for shadcn install UX once a namespace exists.
- Hand-editing templates. The template `components.json` files were already correct and `tooling/scripts/update-template.sh` already defaults to `@plate`.
- Ignoring browser smoke because the command text was easy to inspect statically. The smoke found the separate MCP dialog description warning that static grep would miss.

## Solution

Centralize the visible install command contract:

```ts
const absoluteUrlPattern = /^https?:\/\//;

export function getRegistryItemSpecifier(name: string) {
  const item = name.trim();

  if (
    item.startsWith('@') ||
    item.startsWith('/') ||
    item.startsWith('./') ||
    item.startsWith('../') ||
    absoluteUrlPattern.test(item)
  ) {
    return item;
  }

  return `@plate/${item}`;
}

export function getRegistryInstallCommand(name: string) {
  return `npx shadcn@latest add ${getRegistryItemSpecifier(name)}`;
}
```

Then use that helper in every user-facing install surface:

- registry docs installation blocks
- component source copy buttons
- block preview and block viewer toolbars
- MCP setup
- block metadata descriptions

Keep raw registry URLs where the user or tool needs a URL that resolves directly:

- LLM context links
- `/r/{name}` registry content links
- v0 URLs
- local registry debugging scripts

For the MCP dialog warning, add a real `DialogDescription` inside the dialog header instead of using an unassociated paragraph.

## Why This Works

Shadcn owns the installer behavior and namespace resolver. Plate owns the registry content and template config.

Once `components.json` contains:

```json
{
  "registries": {
    "@plate": "https://platejs.org/r/{name}.json"
  }
}
```

the installer command should be `npx shadcn@latest add @plate/table-kit`. The CLI resolves the namespace to the URL template, so docs do not need to expose raw registry URLs as the primary install path.

Keeping raw URLs only for direct content links avoids breaking tools that need actual fetchable registry JSON.

## Prevention

- Before changing registry install UX, check both template `components.json` and `tooling/scripts/update-template.sh`; if they already use `@plate`, update display/copy surfaces instead of template output.
- Search visible command text separately from raw registry content links:

```bash
rg -n 'siteConfig\.registryUrl|npx shadcn@latest add http|npx shadcn@latest add https|npx shadcn@latest add \{name\}' apps/www/src
```

- Browser-smoke at least one registry docs page, one plugin docs page with `ComponentSource`, the MCP dialog, and block metadata after changing install command text.
- If full `pnpm check` fails only on `test:slowest` fast-suite timing, rerun `pnpm test:slowest` once before moving tests. A clean isolated rerun points to machine load, not a real test classification fix.

## Related Issues

- [Shadcn docs restarts need a keep/throw comparison first](../best-practices/2026-05-23-shadcn-docs-restart-comparison.md)
- [Registry helper refactors must update template registry dependencies](./2026-04-06-registry-helper-refactors-must-update-template-registry-dependencies.md)
- [Fast-suite thresholds should be CI-aware](./2026-03-26-fast-suite-thresholds-should-be-ci-aware.md)
