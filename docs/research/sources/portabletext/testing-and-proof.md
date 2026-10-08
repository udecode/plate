# Portable Text: testing and proof

## Harvest source and license

- **Source and license.** The 2026-05-29 harvest read a local clone of the Portable Text editor monorepo, `portabletext/editor`. The report pins no commit, but the clone was made on 2026-05-28 at `portabletext/editor@ad2a52d13d9f` and its HEAD reflog holds only that clone entry, so the harvest read that revision (inferred from the reflog on 2026-10-08). The repository is MIT-licensed (`portabletext/editor@ad2a52d13d9f:LICENSE`); `portabletext/editor@ad2a52d13d9f:packages/editor/package.json` also says MIT, and the root `package.json` has no license field. The harvest recorded invariants with test-name and line provenance and copied no test bodies (report.md:55-63).

## What Portable Text's tests are good for

- **Behavior pressure, not schema.** Take behavior pressure from Portable Text's tests, not its schema or API: matrix-style object-boundary coverage, root and container selection projection, remote-patch selection rebasing with event dedup, composition around formatting boundaries, and full-path drop targets. Do not take its key-path format as a Plite API, schema-gated content as a core requirement, annotation, decorator or list policy in core, behavior-plugin names as Plite transaction API, or serializer output as editor law. Plite keeps root-aware operations, projection, object-boundary selection, native input transport, clipboard fragment mechanics and rebasing of collaboration and history. Plate keeps schema admissibility, annotations, decorators, comments, lists, serializers, toolbar and plugin behavior, renderers, and any Portable Text adapter (report.md:147-172).
