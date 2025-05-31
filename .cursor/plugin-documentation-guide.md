---
description:
globs:
alwaysApply: false
---

# Plugin Documentation Guide

This guide outlines the standards for writing plugin documentation for the Plate project, ensuring consistency, clarity, and adherence to the project's headless philosophy.

**Core Directive: Understand the Source First**

Before writing or updating any plugin documentation, the **first and most crucial step** is to thoroughly review the relevant source files. This includes:

- The plugin's own source code in `packages/<name>/src`
- Any associated Feature Kit(s) (e.g., `BasicBlocksKit` from `apps/www/src/registry/components/editor/plugins/editor-kit.tsx`).
- Related UI component files (e.g., `blockquote-node.tsx` from `apps/www/src/registry/ui/blockquote-node.tsx`).
- The plugin's registration and usage in example editors or demo components if available.
- If needed for deeper understanding of concepts or APIs the plugin utilizes, consult relevant guides such as [Plugin Components](/docs/plugin-components), [Plugin Methods](/docs/plugin-methods), [Editor Configuration](/docs/editor), or [Editor Methods](/docs/editor-methods).

This contextual understanding is paramount to accurately document plugin behavior, options, API, and transforms. **Never invent or assume functionality.**

## General Principles

1.  **Writing Style**:

    - Maintain a "better-auth/shadcn straightforward and simple English writing style."
    - Adhere to the conciseness, tone, and style of existing key documentation files like [`index.mdx`](<mdc:docs/(get-started)/index.mdx>), [`installation.mdx`](<mdc:docs/(get-started)/installation.mdx>), and especially [`plate-ui.mdx`](mdc:docs/installation/plate-ui.mdx). When mentioning [Plate UI](/docs/installation/plate-ui) for the first time in a document, ensure it is linked.

2.  **Headless Approach**:

    - Plugin documentation is **headless**. Do **not** assume users are using Plate UI files or components directly.
    - Focus on documenting core editor/plugin usage, APIs, and transforms based **only** on actual plugin capabilities confirmed from the source code.
    - When mentioning UI components, refer to them as examples of how a plugin's functionality can be rendered. Link to their Plate UI registry entries or component documentation pages if available (e.g., `/docs/components/component-name`).

3.  **Structure and Formatting**:
    - Use `<Steps>` for procedural instructions (e.g., installation, usage steps).
    - Use `###` for sub-headings within `<Steps>`.
    - Refer to [`dnd.mdx`](<mdc:docs/(plugins)/(functionality)/dnd.mdx>) as a primary example for structure and formatting.
    - Employ `<API name="ApiName">`, `<APIOptions>`, `<APIParameters>`, and `<APIReturns>` for documenting plugin options, API methods, and transforms. Ensure all documented options and behaviors are accurate and sourced from the code.

## Standard Section Order

Plugin documentation should generally follow this order:

1.  **<ComponentPreview name="relevant-demo" />** (Optional): If a relevant visual demo exists in the project.
2.  **<PackageInfo>**:
    - **Features**: Bullet points summarizing key capabilities (derived from understanding the plugin).
3.  **## Kit Usage** (If applicable and comes first since it's the fastest approach):

    - Enclose steps within `<Steps>`.
    - **### Installation**:

      - Explain that this is the fastest way to add the plugin(s) via a Feature Kit that includes pre-configured plugins along with other related elements and their [Plate UI](/docs/installation/plate-ui) components.
      - Include `<ComponentSource name="relevant-kit-name" />`.
      - Immediately follow with a bullet list of UI components from the kit relevant to the documented plugin, with links:
        - Example:
          - [`SpecificElement`](/docs/components/specific-node): Renders the main element.
          - [`SpecificToolbarButton`](/docs/components/specific-toolbar-button): Provides a toolbar button.

    - **### Add Kit**:

      - Show how to add the kit to plugins:

        ```tsx
        import { createPlateEditor } from '@udecode/plate/react';
        import { RelevantKit } from '@/components/editor/plugins/relevant-kit-name';

        const editor = createPlateEditor({
          plugins: [
            // ...otherPlugins,
            ...RelevantKit,
          ],
        });
        ```

4.  **## Manual Usage**:

    - Enclose steps within `<Steps>`.
    - **### Installation**:

      - The `npm install @udecode/plate-package-name` command for the core plugin package.

    - **### Add Plugin** (or **Add Plugins** if documenting multiple plugins in this step):

      - Show the import statement for the specific plugin(s) being documented.
      - Provide a basic code snippet demonstrating how to add the plugin to the `plugins` array within `createPlateEditor`.

        ```tsx
        import { SpecificPlugin } from '@udecode/plate-specific-package/react';
        import { createPlateEditor } from '@udecode/plate/react';

        const editor = createPlateEditor({
          plugins: [
            // ...otherPlugins,
            SpecificPlugin, // Or SpecificPlugin.configure({}) if options are common at this stage
          ],
        });
        ```

      - Note: `ParagraphPlugin` from `@udecode/plate/react` is included by default and usually doesn't need to be explicitly added unless overriding its component (e.g., `ParagraphPlugin.withComponent(CustomParagraph)`).

    - **### Configure Plugin** (or **Configure Plugins** if documenting multiple plugins in this step):

      - Detail essential configuration options for the specific plugin using code examples, based on what is available in the plugin's source.
      - **Prioritize `withComponent`** when only assigning a component without other options:

        ```tsx
        import { SpecificPlugin } from '@udecode/plate-specific-package/react';
        import { createPlateEditor } from '@udecode/plate/react';
        import { SpecificElement } from '@/components/ui/specific-node';

        const editor = createPlateEditor({
          plugins: [
            // ...otherPlugins,
            SpecificPlugin.withComponent(SpecificElement),
          ],
        });
        ```

        - `withComponent`: Assigns [`SpecificElement`](/docs/components/specific-node) to render the plugin's elements.

      - Use `.configure()` when there are additional options beyond the component:

        ```tsx
        import { SpecificPlugin } from '@udecode/plate-specific-package/react';
        import { createPlateEditor } from '@udecode/plate/react';
        import { SpecificElement } from '@/components/ui/specific-node';

        const editor = createPlateEditor({
          plugins: [
            // ...otherPlugins,
            SpecificPlugin.configure({
              node: { component: SpecificElement },
              shortcuts: { toggle: 'mod+alt+s' },
              // ...other actual options from the plugin source
            }),
          ],
        });
        ```

        - `node.component`: Assigns [`SpecificElement`](/docs/components/specific-node) to render the plugin's elements.
        - `shortcuts.toggle`: Defines a keyboard [shortcut](/docs/plugin-shortcuts) to toggle the feature.
        - (Explain other demonstrated options based on their actual function in the plugin)

5.  **## Plugins**:
    - **### `PluginName`**: Document each relevant plugin with a simple description (e.g., "Plugin for H1 heading elements").
    - For plugins with significant configuration options, optionally use `<API name="PluginName">` and `<APIOptions>` to detail **actual, existing** configurable options as found in the source code.
    - Do not extend this section with invented options if the user didn't ask for it.
6.  **## API** (If applicable):
    - Document **actual, existing** `editor.api.pluginName.*` functions as found in the source code.
    - Use `### api.<name>` for each function.
    - Do not extend this section if the user didn't ask for it.
7.  **## Transforms** (If applicable):
    - Document **actual, existing** `editor.tf.pluginName.*` functions, describing their precise behavior as observed in the source code.
    - Use `### tf.<name>` for each function.
    - Do not extend this section if the user didn't ask for it.

## Linking and Redundancy

- Prioritize linking to individual, specific documentation pages (e.g., for a sub-plugin or a related concept) to avoid content duplication. Instead of a generic "See plugin guide", try to smartly link a relevant word or phrase within a sentence to the target page.
- All docs:

  **Get Started:**

  - [`/docs`](<mdc:docs/(get-started)/index.mdx>): Introduction to Plate
  - [`/docs/installation`](<mdc:docs/(get-started)/installation.mdx>): Getting Started / Installation Overview

  **Installation Details:**

  - [`/docs/installation/plate-ui`](mdc:docs/installation/plate-ui.mdx): Plate UI Installation
  - [`/docs/installation/next`](mdc:docs/installation/next.mdx): Next.js Setup
  - `/docs/installation/rsc`: React Server Components (RSC)
  - `/docs/installation/node`: Node.js Usage
  - `/docs/installation/mcp`: MCP Server

  **Guides:**

  - [`/docs/plugin`](mdc:docs/plugin.mdx): Plugin System Overview
  - [`/docs/plugin-methods`](mdc:docs/plugin-methods.mdx): Plugin Methods
  - [`/docs/plugin-shortcuts`](mdc:docs/plugin-shortcuts.mdx): Plugin Shortcuts
  - [`/docs/plugin-context`](mdc:docs/plugin-context.mdx): Plugin Context
  - [`/docs/plugin-components`](mdc:docs/plugin-components.mdx): Plugin Components Guide
  - [`/docs/editor`](mdc:docs/editor.mdx): Editor Configuration
  - [`/docs/editor-methods`](mdc:docs/editor-methods.mdx): Editor Methods
  - `/docs/controlled`: Controlled Editor Value
  - [`/docs/static`](mdc:docs/static.mdx): Static Rendering
  - [`/docs/html`](<mdc:docs/(plugins)/(serializing)/html.mdx>): HTML Serialization (Guide)
  - [`/docs/markdown`](<mdc:docs/(plugins)/(serializing)/markdown.mdx>): Markdown Serialization (Guide)
  - `/docs/form`: Form Integration
  - `/docs/typescript`: TypeScript Usage
  - `/docs/debugging`: Debugging
  - `/docs/troubleshooting`: Troubleshooting

  **Plugins (Overview & Individual - see `apps/www/src/config/docs-plugins.ts` for full list):**

  - [`/docs/plugins`](mdc:apps/www/src/config/docs-plugins.ts): Plugins Overview (links to specific plugin docs)

  **Components:**

  - [`/docs/components`](mdc:apps/www/src/registry/registry-ui.ts): UI Components Overview (Toolbar, Nodes, etc.)
    - Links to individual component pages like `/docs/components/blockquote-node`, etc.

  **Kits:**

  - [Plugin Kits](mdc:apps/www/src/registry/registry-kits.ts): All plugin kits
    - Links to individual kit pages like `/docs/kits/basic-blocks-kit`, etc.

  **API Reference:**

  - `/docs/api`: API Overview
  - _Core:_ `/docs/api/core/plate-editor`, `/docs/api/core/plate-plugin`, `/docs/api/core/plate-components`, `/docs/api/core/plate-store`, `/docs/api/core/plate-controller`
  - _Slate Extensions:_ `/docs/api/slate` (and its sub-pages like `/docs/api/slate/editor-api`
  - _Utilities:_ `/docs/api/utils`, `/docs/api/cn`, `/docs/api/floating`, `/docs/api/react-utils`, `/docs/api/resizable`

By following this guide, plugin documentation will be consistent, informative, and align with the project's overall documentation strategy.
