---
'@udecode/plate-ai': major
---

- Copilot API method changes:
  - `editor.api.copilot.accept` is now `editor.tf.copilot.accept`.
  - `editor.api.copilot.acceptNextWord` is now `editor.tf.copilot.acceptNextWord`.
  - `editor.api.copilot.reset` is now `editor.api.copilot.reject`.
- Removed Default Shortcuts for Copilot:
  - Only `accept` (Tab) and `reject` (Escape) shortcuts are included by default for `CopilotPlugin`.
  - `acceptNextWord` and `triggerSuggestion` shortcuts must now be configured manually using the `shortcuts` field when configuring the plugin.
  - Example:
    ```tsx
    CopilotPlugin.configure({
      // ... other options
      shortcuts: {
        acceptNextWord: {
          keys: 'mod+right',
        },
        triggerSuggestion: {
          keys: 'ctrl+space',
        },
      },
    });
    ```
