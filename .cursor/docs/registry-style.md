### Example 1: Custom Style Extending shadcn/ui

Adds dependencies, registry items, custom font, and a 'brand' color.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "example-style-extended",
  "type": "registry:style",
  "dependencies": ["@tabler/icons-react"],
  "registryDependencies": [
    "login-01", // From shadcn/ui registry
    "calendar", // From shadcn/ui registry
    "https://example.com/r/editor.json" // From remote registry
  ],
  "cssVars": {
    "theme": {
      "font-sans": "Inter, sans-serif"
    },
    "light": {
      "brand": "20 14.3% 4.1%"
    },
    "dark": {
      "brand": "20 14.3% 4.1%"
    }
  }
}
```

### Example 2: Custom Style From Scratch

Uses `extends: "none"`. Defines base dependencies, components from a remote registry, and core CSS variables.

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "extends": "none", // Doesn't inherit shadcn/ui defaults
  "name": "new-style-scratch",
  "type": "registry:style",
  "dependencies": ["tailwind-merge", "clsx"],
  "registryDependencies": [
    "utils", // From shadcn/ui registry
    "https://example.com/r/button.json",
    "https://example.com/r/input.json",
    "https://example.com/r/label.json",
    "https://example.com/r/select.json"
  ],
  "cssVars": {
    "theme": {
      "font-sans": "Inter, sans-serif"
    },
    "light": {
      "main": "#88aaee",
      "bg": "#dfe5f2",
      "border": "#000",
      "text": "#000",
      "ring": "#000"
    },
    "dark": {
      "main": "#88aaee",
      "bg": "#272933",
      "border": "#000",
      "text": "#e6e6e6",
      "ring": "#fff"
    }
  }
}
```

### Example 3: Adding Custom CSS Utilities and Animations

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "utility-animation-example",
  "type": "registry:component", // Or block, etc.
  "cssVars": {
    "theme": {
      "--animate-fade-in": "fade-in 0.5s ease-out forwards"
    }
  },
  "css": {
    "@utility text-balance": {
      "text-wrap": "balance"
    },
    "@keyframes fade-in": {
      "from": { "opacity": "0" },
      "to": { "opacity": "1" }
    }
  }
}
```
