---
'@platejs/link': minor
---

Allow custom `isUrl` function to override internal link validation

The link plugin now respects custom `isUrl` functions when validating internal links (starting with `/`) and anchor links (starting with `#`). This allows users to prevent internal links from being automatically converted to link elements.

Example usage:
```typescript
const linkPlugin = createLinkPlugin({
  options: {
    isUrl: (url) => {
      // Prevent internal links from being linkified
      if (url.startsWith('/')) return false;
      // Default validation for other URLs
      return defaultIsUrl(url);
    },
  },
});
```