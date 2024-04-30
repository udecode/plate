---
"@udecode/plate-heading": minor
---

### Changes

- Modified `createHeadingPlugin` function to allow granular selection of heading levels.
- Added support for retaining the old behavior of generating plugins for all heading levels up to a maximum level.
- Type the heading levels props

### Details

- The `createHeadingPlugin` function has been updated to accept an array of specific heading levels to enable, allowing for granular selection of heading levels. This provides more flexibility in choosing which heading levels to support within the editor.
- The function now supports retaining the old behavior of generating plugins for all heading levels up to a maximum level if desired. This ensures backward compatibility with existing implementations that rely on the previous behavior.

### How to Use

- To use the granular selection feature, pass an array of heading levels to the `createHeadingPlugin` function when initializing it. For example:
  
```ts
const headingPlugin = createHeadingPlugin({
    levels: [1, 2, 3] // Enable heading levels 1, 2, and 3
});
```

And the previous behaviour is still working:

```ts
const headingPlugin = createHeadingPlugin({
    levels: 6 // Enable heading levels 1, 2, 3, 4, 5 and 6
});
```