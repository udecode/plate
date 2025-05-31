---
description:
globs:
alwaysApply: false
---

# Plugin Documentation Guide

This guide outlines the standards for writing plugin documentation for the Plate project, ensuring consistency, clarity, and adherence to the project's headless philosophy.

## General Principles

1.  **Writing Style**:

    - Maintain a "better-auth/shadcn straightforward and simple English writing style."
    - Adhere to the conciseness, tone, and style of existing key documentation files like [`index.mdx`](mdc:docs/index.mdx), [`installation.mdx`](mdc:docs/installation.mdx), and especially [`plate-ui.mdx`](mdc:docs/installation/plate-ui.mdx). When mentioning [Plate UI](/docs/installation/plate-ui) for the first time in a document, ensure it is linked.

2.  **Headless Approach**:

    - Plugin documentation is **headless**. Do **not** assume users are using Plate UI files or components directly.
    - Focus on documenting core editor/plugin usage, APIs, and transforms based on actual plugin capabilities. **Do not invent API options, shortcuts, or transform behaviors. Read the related files if needed.**
    - When mentioning UI components, refer to them as examples of how a plugin's functionality can be rendered. Link to their Plate UI registry entries or component documentation pages if available (e.g., `/docs/components/component-name`).

3.  **Structure and Formatting**:
    - Use `<Steps>` for procedural instructions (e.g., installation, usage steps).
    - Use `###` for sub-headings within `<Steps>`.
    - Refer to [`dnd.mdx`](mdc:docs/dnd.mdx) as a primary example for structure and formatting.
    - Employ `<API name="ApiName">`, `<APIOptions>`, `<APIParameters>`, and `<APIReturns>` for documenting plugin options, API methods, and transforms. Ensure all documented options and behaviors are accurate.

## Standard Section Order

Plugin documentation should generally follow this order:

1.  **`<ComponentPreview name="relevant-demo" />`** (Optional): If a relevant visual demo exists in the project.
2.  **`<PackageInfo>`**:
    - **Features**: Bullet points summarizing key capabilities.
    - **Installation**: The `npm install @udecode/plate-package-name` command.
3.  **`## Usage`**:

    - Enclose steps within `<Steps>`.
    - **`### Add Plugin`**:

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

    - **`### Configure `SpecificPlugin``**:

      - Detail essential configuration options for the specific plugin using code examples.
      - Below the code snippet, provide a concise bullet-point list explaining each configuration option demonstrated. For component assignments, you can mention that this allows customizing the look and feel, linking to [Plugin Components](/docs/plugin-components) for more details on creating them.

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
              customOption: true,
              // ...other options
            }),
          ],
        });
        ```

        - `node.component: SpecificElement`: Assigns `SpecificElement` to render this plugin's elements. This allows for custom styling and behavior (see [Plugin Components](/docs/plugin-components)).
        - `shortcuts.toggle: 'mod+alt+s'`: Defines a keyboard shortcut to toggle the feature associated with this plugin.
        - `customOption: true`: Enables a specific custom behavior for the plugin.

    - **`### Example: `RelevantKitName`Kit`** (If applicable):

      - If the documented plugin is part of a larger "Feature Kit" (e.g., `BasicElementsKit` includes `BlockquotePlugin`), explain this as an alternative or comprehensive setup.
      - Show how to use the kit:

        ```tsx
        import { createPlateEditor } from '@udecode/plate/react';
        import { RelevantKit } from '@/components/editor/plugins/relevant-kit-name';

        const editor = createPlateEditor({
          plugins: [
            // ...otherPlugins,
            ...RelevantKit, // This kit includes the SpecificPlugin, pre-configured.
          ],
        });
        ```

      - Include `<ComponentSource name="relevant-kit-name" />` to display the kit's source code and an installation button. Emphasize that kits are optional collections for quick starts or as reference.
      - After `<ComponentSource />`, if the kit includes specific UI components relevant to the documented plugin, list them briefly with links:
        - Example:
          The `RelevantKitNameKit` utilizes the following UI components for `SpecificPlugin`:
          - [`SpecificElement`](/docs/components/specific-node): Renders the main element for this plugin.
          - [`SpecificToolbarButton`](/docs/components/specific-toolbar-button): Provides a toolbar button to interact with this plugin.

4.  **`## Plugins`**:
    - **`### `PluginName``**: Document the main plugin object (e.g., `BlockquotePlugin`).
    - Use `<API name="PluginName">` and `<APIOptions>` to detail its **actual, existing** configurable options.
    - Do not extend this section with invented options if the user didn't ask for it.
5.  **`## API`** (If applicable):
    - Document **actual, existing** `editor.api.pluginName.*` functions.
    - Use `### `api.<name>`` for each function.
    - Do not extend this section if the user didn't ask for it.
6.  **`## Transforms`** (If applicable):
    - Document **actual, existing** `editor.tf.pluginName.*` functions, describing their precise behavior.
    - Use `### `tf.<name>`` for each function.
    - Do not extend this section if the user didn't ask for it.

## Linking and Redundancy

- Prioritize linking to individual, specific documentation pages (e.g., for a sub-plugin or a related concept) to avoid content duplication. Instead of a generic "See plugin guide", try to smartly link a relevant word or phrase within a sentence to the target page.
- The sidebar navigation is primarily defined by the routes in `apps/www/src/config/docs-plugins.ts`. Key documentation routes include:
  - [`/docs/components`](mdc:apps/www/src/config/docs-components.ts): UI Components (Toolbar, Nodes, etc.)
  - [`/docs/plugins`](mdc:apps/www/src/config/docs-plugins.ts): Plugin Documentation (AI, Elements, Marks, etc.)
  - [`/docs/editor`](mdc:apps/www/src/config/docs-core.ts): Core Editor Configuration
  - [`/docs/plugin-components`](mdc:docs/plugin-components.mdx): Guide to Creating Plugin Components
  - [`/docs/installation/plate-ui`](mdc:docs/installation/plate-ui.mdx): Plate UI Installation

## Analyzing Project Files for Context

- [`apps/www/src/config/docs-plugins.ts`](mdc:apps/www/src/config/docs-plugins.ts): Understands the intended navigation and grouping of plugins.
- [`docs/installation/plate-ui.mdx`](mdc:docs/installation/plate-ui.mdx): Provides context on how Plate UI components are installed and categorized (Feature Kits, Node Components, Toolbar Components, etc.).
- [`apps/www/src/registry/registry-kits.ts`](mdc:apps/www/src/registry/registry-kits.ts): Lists available kits. Crucial for the "Example: `RelevantKitName`Kit" section and for identifying which kit to use with `<ComponentSource />`. Reading the kit file (e.g., [`basic-elements-kit.tsx`](mdc:apps/www/src/registry/components/editor/plugins/basic-elements-kit.tsx)) is important to see how plugins and UI components are combined.
- [`apps/www/src/registry/registry-ui.ts`](mdc:apps/www/src/registry/registry-ui.ts): Lists UI components and their `meta.docs` which can indicate relationships with plugin documentation.
