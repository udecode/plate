---
"@udecode/plate-cloud": minor
"@udecode/plate-ui-cloud": minor
---

Add options to set `minResizeWidth` and `maxResizeWidth` to `CloudImagePlugin`.

```typescript
    createCloudImagePlugin({
      options: {
        maxInitialWidth: 320,
        maxInitialHeight: 320,
        minResizeWidth: 100,
        maxResizeWidth: 720,
      },
    }),
```
