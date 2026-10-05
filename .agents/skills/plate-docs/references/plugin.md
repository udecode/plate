# Plugin documentation

Plugin and feature pages lead with the supported user-facing result and its
shortest working setup. State package/plugin and UI ownership accurately;
headless ownership does not require architecture-first page order. For a
headless feature, show its working code path without inventing a UI preview.

Required shape:

1. A focused `<ComponentPreview name="..." />` when the feature has a real
   registered demo; otherwise a short opening and working code path.
2. `<PackageInfo>` with features derived from source, not marketing bullets.
3. `## Kit Usage` when a kit exists:
   - wrap procedural setup in `<Steps>`
   - use `### Installation` and `### Add Kit`
   - include `<ComponentSource name="actual-kit-name" />`
   - list relevant kit components from the owning entries in `apps/www/src/registry/registry-features.ts`
     and `apps/www/src/registry/registry-editor.ts`
   - show `useCreateEditor({ plugins: [...RelevantKit] })` from `platejs/react`
4. `## Examples` for distinct tasks and meaningful states, selected through
   [feature coverage](../SKILL.md#cover-the-features-actual-use). Put one useful
   example under each named subsection; omit this section when the primary
   example covers the feature. Link mixed-feature composition to its owner.
5. Integration sections for requirements the reader actually needs, such as
   persistence and recovery. Keep required setup in Kit Usage; put extended
   ownership explanations here or in a linked guide.
6. `## Manual Usage` when it provides a supported alternative; use it as the
   primary setup when no kit exists. Apply only the source checks relevant to
   the documented feature:
   - show the package install command
   - import plugin APIs from `platejs`, `platejs/react`, or the actual
     `platejs/<feature>` entrypoint
   - add the plugin to `useCreateEditor` in React, or to `createEditor` in
     headless code; `docs/vision/plate.md` holds the node `component` and
     `.configure` rules a manual example follows
7. Style plugins without distinct components should document their schema
   placement truth. Cross-cut block styles configure
   root `targetPlugins`; render/parser injection is derived and must not
   be taught as a second target configuration. Text styles declare marks and
   do not invent block target lists. Document `inject.nodeProps` only for real
   rendering defaults and mappings.
8. Toolbar sections only when the toolbar affordance exists. Check kit
   dependencies before writing about `*ToolbarButton`, Turn Into, or Insert
   controls.
9. `## Plugins` for actual plugin objects.
10. `## API Reference` for shipped standalone functions or plugin APIs, and
    `## Transforms` only for real `editor.update.<group>.*` surfaces. Give
    standalone operations their exact import paths and arguments; do not invent
    an installed plugin for file conversion. Teach
    `editor.plugin(Plugin).api.*` only when the example is intentionally generic
    package code or needs exact descriptor ownership; `docs/vision/plate.md`
    holds the portal and optional-plugin rules.

Preserve existing `<APIOptions>`, `<APIParameters>`, and `<APIReturns>`
formatting when editing a working page. Use
`content/docs/(plugins)/(functionality)/dnd.mdx` as the plugin-page baseline
when no closer sibling fits.
