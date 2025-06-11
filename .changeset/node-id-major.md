---
'@udecode/plate-node-id': major
---

- Package `@udecode/plate-node-id` has been deprecated.
- `NodeIdPlugin` functionality is now part of `@platejs/core` and is **enabled by default**.
- Migration:

  - Remove `NodeIdPlugin` from your explicit plugin list if it was added manually.
  - Remove `@udecode/plate-node-id` from your dependencies.
  - If you had `NodeIdPlugin` configured with options, move these options to the `nodeId` field in your main editor configuration (`createPlateEditor` or `usePlateEditor` options).
    Example:

    ```ts
    // Before
    // const editor = usePlateEditor({
    //   plugins: [
    //     NodeIdPlugin.configure({ /* ...your options... */ }),
    //   ],
    // });

    // After
    const editor = usePlateEditor({
      nodeId: {
        /* ...your options... */
      },
      // ...other editor options
    });
    ```

  - If you want to disable automatic node ID generation (to replicate behavior if you weren't using `NodeIdPlugin` before), set `nodeId: false` in your editor configuration.
