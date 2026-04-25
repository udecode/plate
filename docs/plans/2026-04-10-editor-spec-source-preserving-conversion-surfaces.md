# Editor Spec: Source-Preserving Conversion Surfaces

## Goal

Apply `editor-spec` to the broader source-preserving conversion family, not
just math delimiter triggers.

## Scope

- current editor-behavior standards/spec/protocol/parity/audit docs
- existing compiled research for:
  - source-entry surfaces
  - link automd
  - math delimiter triggers
- minimal honest doc updates only

## Decision

Treat these as one broader family:

- rendered source-entry surfaces
- typed syntax-trigger conversions

Subfamilies:

- source-entry surface:
  - links
  - images
  - HTML blocks
- syntax-trigger conversion:
  - link automd
  - math delimiter triggers

## Architecture Consequence

This broader family does **not** imply one monolithic implementation host.

- rendered source-entry surfaces stay in the owning feature package and
  render/edit-entry layer
- typed syntax-trigger conversions should live in shared input infrastructure
  near the owning feature package
- parser-only code is not the right host
- generic autoformat is not the right default host

## Why

The shared UX rule is not "autoformat."

It is:

- preserve source until conversion is explicit and safe
- once converted, keep a path back into source-oriented editing or an explicit
  editor

## Verification

- standards / spec / protocol / parity / audit readback
- terminology consistency for:
  - source-entry
  - conversion boundary
  - math delimiter trigger
  - link automd
