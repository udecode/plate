# registry.json

This guide explains the structure and properties needed to define your component registry using the `registry.json` file and its contained `registry-item` definitions.

## `registry.json`: The Registry Definition

The `registry.json` file is the root definition for your entire component registry. It lists all the items available within it.

**Structure:**

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "plate",
  "homepage": "https://platejs.org",
  "items": [
    // ... array of registry item definitions ...
  ]
}
```

**Fields:**

- `$schema` (Required): Specifies the JSON schema for validation. Use `https://ui.shadcn.com/schema/registry.json`.
- `name` (Required): The identifier for your registry (e.g., "plate"). Used for metadata.
- `homepage` (Required): The URL of your registry's homepage. Used for metadata.
- `items` (Required): An array containing the definitions for each item in your registry. Each object in this array follows the `registry-item` schema described below.

---

## Defining Registry Items (Inside the `items` Array)

Each object within the `items` array of `registry.json` defines a single registry item (like a component, block, style, etc.). These objects adhere to the `registry-item` schema.

**Core Structure Example:**

```json
{
  "name": "unique-item-name", // e.g., "button", "editor-ai", "theme-midnight"
  "type": "registry:block", // Or other type like registry:component, registry:ui, etc.
  "title": "Human-Readable Title", // e.g., "Button", "AI Editor"
  "description": "A brief description of the item."
  // ... other properties like dependencies, files, cssVars, etc. ...
}
```

**Key Properties:**

- `name` (Required): The unique identifier for this item within your registry.
- `title` (Optional): A short, human-readable title for the item
- `description` (Optional): A more detailed description of the item
- `type` (Required): Specifies the type of the registry item. Valid types include:
  - `registry:block`: For complex components with multiple files
  - `registry:component`: For single-file components
  - `registry:lib`: For lib and utils
  - `registry:hook`: For React hooks
  - `registry:ui`: For UI components, often single-file primitives
  - `registry:page`: For page components or file-based routes (requires `target` in `files`)
  - `registry:file`: For miscellaneous files like configs (requires `target` in `files`)
  - `registry:theme`: Defines CSS variables for theming
  - `registry:example`: Example components
- `author` (Optional): The author of the item. Not used.
- `dependencies` (Optional): Array of npm package dependencies (e.g., `"react-day-picker@8.10.1"`)
- `registryDependencies` (Optional): Array of other registry items required by this item:
  - Reference items from the same registry by name (e.g., `"button"`)
  - Reference remote registry items by URL (e.g., `"https://platejs.org/r/button.json"`)
- `docs` (Optional): Use `docs` to show custom documentation or message when installing your registry item via the CLI.
- `categories` (Optional): Array of category names for grouping items (e.g., ["Editors"])
- `meta` (Optional): Additional metadata including:
  - `rsc` (boolean): Indicates if the component is a React Server Component
  - `docs` (array): Documentation links with `route` and `title`
  - `examples` (array): Example component names
  - `label` (string): e.g., "New" for new components
  - `links` (object): Related URLs
  - `usage` (array): Code usage examples
  - `keywords` (array): Search keywords
- `files`: The files property is used to specify the files of your registry item. Each file has a path, type and target (optional) property. See below.
- `cssVars`: Use to define CSS variables for your registry item.
- `css`: Use css to add new rules to the project's CSS file eg. @layer base, @layer components, @utility, @keyframes, etc.

**Files:**

- `files` (Required): An array defining the source files that make up this registry item. Each object needs:
  - `path` (Required): The relative path from your project root to the source file
  - `type` (Required): The type of this specific file (same `registry:*` types as above)
  - `target` (Optional, **Required** for `registry:page` and `registry:file`): Destination path within the user's project
  - `content` (Optional): The raw content of the file

**Target Path Conventions:**

- `registry:component` → Same as source path
- `registry:block` or `registry:example` → `components/${fileName}`
- `registry:ui` → `components/ui/${fileName}`
- `registry:hook` → `hooks/${fileName}`
- `registry:lib` → `lib/${fileName}`
- `registry:page` and `registry:file` require explicit target paths

---

## Guidelines & Best Practices

- **Directory Structure:** Registry items should be organized under `registry/[TYPE]`, for example:

  ```
  registry/
  ├── app/               # App-specific files (routes, api, etc)
  │   └── api/
  │       ├── ai/
  │       │   ├── command/
  │       │   │   └── route.ts
  │       │   └── copilot/
  │       │       └── route.ts
  │       └── uploadthing/
  │           └── route.ts
  ├── blocks/           # Complex blocks with multiple files
  │   ├── editor-ai/
  │   │   ├── components/
  │   │   │   └── editor/
  │   │   │       ├── plate-editor.tsx
  │   │   │       └── use-create-editor.ts
  │   │   └── page.tsx
  │   └── editor-basic/
  │       └── ...
  ├── components/       # Single-file components and plugins
  │   └── editor/
  │       ├── plugins/
  │       │   ├── ai-plugins.tsx
  │       │   ├── align-plugin.ts
  │       │   └── ...
  │       ├── plate-types.ts
  │       └── ...
  ├── examples/        # Example components and demo values
  │   ├── values/
  │   │   ├── ai-value.tsx
  │   │   └── ...
  │   └── demo.tsx
  ├── hooks/          # React hooks
  │   ├── use-debounce.ts
  │   └── ...
  ├── lib/           # Utility functions
  │   ├── create-html-document.ts
  │   └── ...
  └── ui/      # UI components
      ├── button.tsx
      ├── editor.tsx
      └── ...
  ```

- **Imports:** Within your component source files, **always use aliased paths** that the consuming project will have (e.g., `@/components/ui/button`, `@/lib/utils`). Use registry-specific alias if configured (e.g., `@/registry/ui/button`) or relative paths that will resolve correctly post-build/install.
- **Dependencies:** Explicitly list all `dependencies` (npm packages) and `registryDependencies` (other components/items)
- **Clarity:** Use `title` and `description` effectively
- **Target Paths:** Double-check `target` paths for `registry:page` and `registry:file` types

---

## Examples

### Example 1: AI Editor Block

```json
{
  "name": "editor-ai",
  "type": "registry:block",
  "description": "An AI editor",
  "categories": ["Editors"],
  "dependencies": [
    "@udecode/plate-ai",
    "@udecode/plate-basic-marks",
    "@udecode/plate-block-quote",
    "@udecode/plate-code-block",
    "@udecode/plate-comments"
  ],
  "files": [
    {
      "path": "registry/blocks/editor-ai/page.tsx",
      "type": "registry:page",
      "target": "app/editor/page.tsx"
    },
    {
      "path": "registry/blocks/editor-ai/components/editor/plate-editor.tsx",
      "type": "registry:component",
      "target": "components/editor/plate-editor.tsx"
    }
  ],
  "registryDependencies": [
    "https://platejs.org/r/api-ai.json",
    "https://platejs.org/r/editor.json",
    "https://platejs.org/r/ghost-text.json"
  ]
}
```

### Example 2: UI Component

```json
{
  "name": "inline-combobox",
  "type": "registry:ui",
  "title": "Inline Combobox",
  "description": "A combobox for inline suggestions.",
  "dependencies": ["@udecode/plate-combobox", "@ariakit/react"],
  "files": [
    {
      "path": "ui/inline-combobox.tsx",
      "type": "registry:ui",
      "target": "components/ui/inline-combobox.tsx"
    }
  ],
  "meta": {
    "docs": [
      { "route": "/docs/combobox" },
      { "route": "/docs/api/inline-combobox" }
    ],
    "examples": ["mention-demo", "slash-command-demo", "emoji-demo"]
  }
}
```

### Example 3: Theme Definition

```json
{
  "name": "theme-midnight",
  "type": "registry:theme",
  "cssVars": {
    "dark": {
      "accent": "240 0% 13%",
      "brand": "213.3 93.9% 67.8%",
      "background": "240 5% 6%",
      "foreground": "60 5% 90%"
    },
    "light": {
      "accent": "240 0% 13%",
      "brand": "217.2 91.2% 59.8%",
      "background": "240 5% 6%",
      "foreground": "60 5% 90%"
    }
  }
}
```

## Adding Registry Items

### Adding a Block (`registry:block`)

Blocks are complex components that typically consist of multiple files and may include pages, components, and other resources. They are defined in `registry/registry-blocks.ts`.

Example of adding an AI Editor block:

```typescript
// registry/registry-blocks.ts
{
  name: "editor-ai",
  type: "registry:block",
  description: "An AI editor",
  categories: ["Editors"],
  dependencies: [
    "@udecode/cn",
    "@udecode/plate-ai",
    "@udecode/plate-basic-marks",
    // ... other dependencies
  ],
  files: [
    {
      path: "registry/blocks/editor-ai/page.tsx",
      type: "registry:page",
      target: "app/editor/page.tsx"
    },
    {
      path: "registry/blocks/editor-ai/components/editor/plate-editor.tsx",
      type: "registry:component",
      target: "components/editor/plate-editor.tsx"
    },
    {
      path: "registry/blocks/editor-ai/components/editor/use-create-editor.ts",
      type: "registry:component",
      target: "components/editor/use-create-editor.ts"
    }
  ],
  registryDependencies: [
    "https://platejs.org/r/api-ai.json",
    "https://platejs.org/r/editor.json",
    // ... other registry dependencies
  ]
}
```

Directory structure for this block:

```
registry/
└── blocks/
    └── editor-ai/
        ├── components/
        │   └── editor/
        │       ├── plate-editor.tsx
        │       └── use-create-editor.ts
        └── page.tsx
```

### Adding a Component (`registry:component`)

Components are typically shared files used across multiple blocks. They are defined in `registry/registry-components.ts`. Common use cases include plugins, hooks, and utility components.

Example of adding an AI plugin component:

```typescript
// registry/registry-components.ts
{
  name: "ai-plugins",
  type: "registry:component",
  dependencies: [
    "@udecode/plate-ai",
    "@udecode/plate-basic-marks",
    "@udecode/plate-block-quote",
    "@udecode/plate-code-block",
    "@udecode/plate-heading"
  ],
  files: [
    {
      path: "registry/components/editor/plugins/ai-plugins.tsx",
      type: "registry:component"
    }
  ],
  registryDependencies: [
    "https://platejs.org/r/basic-nodes-plugins.json",
    "https://platejs.org/r/block-selection-plugins.json",
    // ... other plugin dependencies
  ]
}
```

Directory structure for components:

```
registry/
└── components/
    └── editor/
        ├── plugins/
        │   ├── ai-plugins.tsx
        │   ├── align-plugin.ts
        │   └── ...
        ├── plate-types.ts
        └── ...
```

**Key Differences:**

- `registry:block`: Used for complete features that include multiple files and often have their own pages/routes
- `registry:component`: Used for shared functionality (plugins, hooks, utilities) that can be used across different blocks
- Blocks typically have explicit `target` paths, while components often inherit their target path from their type

**Best Practices:**

1. Keep shared functionality in components (`registry:component`) to promote reuse
2. Use blocks (`registry:block`) for complete features that need their own routes or pages
3. Always specify all dependencies and registry dependencies
4. Group related files together in the directory structure
5. Use clear, descriptive names for your registry items

### Adding a UI Component (`registry:ui`)

UI components are primitive, reusable components that make up the core UI library.

Example of adding a combobox UI component:

```typescript
// registry/registry-ui.ts
{
  name: "inline-combobox",
  type: "registry:ui",
  title: "Inline Combobox",
  description: "A combobox for inline suggestions.",
  dependencies: [
    "@udecode/plate-combobox",
    "@ariakit/react"
  ],
  files: [
    {
      path: "registry/ui/inline-combobox.tsx",
      type: "registry:ui",
      target: "components/ui/inline-combobox.tsx"
    }
  ],
  meta: {
    docs: [
      { "route": "/docs/combobox" },
      { "route": "/docs/api/inline-combobox" }
    ],
    examples: ["mention-demo", "slash-command-demo", "emoji-demo"]
  }
}
```

Directory structure for UI components:

```
registry/
└── ui/
    ├── button.tsx
    ├── inline-combobox.tsx
    ├── editor.tsx
    └── ...
```

### Adding Configuration Files (`registry:file`)

The `registry:file` type is used for configuration files, API routes, or files not ending with `.tsx` that need to be placed at specific locations in the project.

Example of adding API routes:

```typescript
// registry/registry-app.ts
{
  name: "api-ai",
  type: "registry:lib",
  dependencies: ["@ai-sdk/openai", "ai"],
  files: [
    {
      path: "registry/app/api/ai/command/route.ts",
      type: "registry:file",
      target: "app/api/ai/command/route.ts"
    },
    {
      path: "registry/app/api/ai/copilot/route.ts",
      type: "registry:file",
      target: "app/api/ai/copilot/route.ts"
    }
  ]
}
```

Directory structure for app files:

```
registry/
└── app/
    └── api/
        ├── ai/
        │   ├── command/
        │   │   └── route.ts
        │   └── copilot/
        │       └── route.ts
        └── uploadthing/
            └── route.ts
```

**When to Use Each Type:**

1. `registry:block`

   - For complete features with multiple files
   - When you need a dedicated page/route
   - When components are tightly coupled to a specific feature

2. `registry:component`

   - For shared functionality used across blocks
   - For plugins and hooks
   - When the component is part of the core application logic

3. `registry:ui`

   - For primitive UI components (buttons, inputs, etc.)
   - When the component is part of your design system
   - When the component needs to be highly reusable and customizable
   - When styling consistency is important

4. `registry:file`
   - For configuration files that need specific locations
   - For API routes and endpoints
   - For any file that doesn't fit the component/UI pattern
   - When exact file placement is critical

**Best Practices for File Types:**

1. Keep UI components simple and focused on presentation
2. Use `registry:file` when you need precise control over file location
3. Prefer `registry:component` for shared business logic
4. Use `registry:block` to group related functionality
5. Always specify `target` paths for `registry:file` and `registry:page` types
