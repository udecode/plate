---
name: shadcn-parity
description: >-
  Maintains source-level parity with upstream shadcn/ui for Plate's registry,
  templates, and component patterns. Covers ownership boundaries (shadcn owns
  schema/resolver/CLI; Plate owns registry content/build/delivery), registry
  item rules, template alignment, namespace semantics, and known divergences.
  Use when the user says "shadcn parity", asks to mirror shadcn behavior, copy
  shadcn UX/architecture, or when modifying registry items, template
  components.json, or build scripts. Not for general component styling or
  features unrelated to shadcn compatibility.
---

## Overview

Defines the contract between Plate and upstream shadcn/ui: shadcn owns the
registry item schema, namespace semantics, resolver behavior, and CLI; Plate
owns the registry content, build pipeline, and template sync tooling. Registry
items must match upstream `RegistryItem` shape, prefer `@shadcn/*` dependencies
when available, and follow upstream file/layout patterns. Includes rules for
template alignment, local sync behavior, current known divergences, and red
flags that signal incorrect approaches.

@.claude/skills/shadcn-parity/shadcn-parity.mdc
