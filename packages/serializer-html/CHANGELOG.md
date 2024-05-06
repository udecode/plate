# @udecode/plate-serializer-html

## 33.0.0

## 32.0.0

### Patch Changes

- [#3155](https://github.com/udecode/plate/pull/3155) by [@felixfeng33](https://github.com/felixfeng33) – Missing export

## 31.4.4

### Patch Changes

- [#3149](https://github.com/udecode/plate/pull/3149) by [@dimaanj](https://github.com/dimaanj) – `serialzieHtml`: remove `renderToStaticMarkup` from client code

## 31.1.0

### Patch Changes

- [#2837](https://github.com/udecode/plate/pull/2837) by [@dimaanj](https://github.com/dimaanj) – Fixes "The `useSlateStatic` hook must be used inside the <Slate> component's context." error in `serializeHtml`

## 31.0.0

### Minor Changes

- [#3040](https://github.com/udecode/plate/pull/3040) by [@zbeyens](https://github.com/zbeyens) – Updated minor dependencies

## 30.5.3

### Patch Changes

- [`4cbed7159`](https://github.com/udecode/plate/commit/4cbed7159d51f7427051686e45bcf2a8899aeede) by [@zbeyens](https://github.com/zbeyens) – Move `@udecode/plate-common` to peerDeps to fix a bug when multiple instances were installed

## 30.4.5

## 30.4.4

### Patch Changes

- [#2943](https://github.com/udecode/plate/pull/2943) by [@shaungrady](https://github.com/shaungrady) –
  - Fix handling of empty `preserveClassNames` array
    - Previously, would output `<div class="                 ">`
    - Now, it outputs `<div>`
  - Reduce time complexity of `stripClassNames` function

## 30.1.2

## 30.0.0

## 29.1.0

## 29.0.1

## 29.0.0

## 28.0.0

## 27.0.3

## 27.0.0

## 26.0.6

### Patch Changes

- [#2797](https://github.com/udecode/plate/pull/2797) by [@12joan](https://github.com/12joan) – Fix: `serializeHtml` mutates the live `editor` instance

## 26.0.0

### Major Changes

- [#2733](https://github.com/udecode/plate/pull/2733) by [@dimaanj](https://github.com/dimaanj) –
  - [Breaking] `serializeHtml`: replaced option `slateProps` by `plateProps`.
  - Fix errors when the components were using Plate hooks.

## 25.0.1

## 25.0.0

## 24.5.2

## 24.4.0

### Minor Changes

- [#2675](https://github.com/udecode/plate/pull/2675) by [@zbeyens](https://github.com/zbeyens) – Support slate-react 0.99.0

## 24.3.6

## 24.3.5

## 24.3.2

## 24.3.1

## 24.3.0

## 24.2.0

## 24.0.2

## 24.0.1

## 24.0.0

## 23.7.4

## 23.7.0

## 23.6.0

## 23.3.1

## 23.3.0

## 22.0.2

## 22.0.1

## 22.0.0

### Patch Changes

- [#2471](https://github.com/udecode/plate/pull/2471) by [@zbeyens](https://github.com/zbeyens) – Fix `serializeHtml` to support `initialValue`

## 21.5.0

## 21.4.2

### Patch Changes

- [#2450](https://github.com/udecode/plate/pull/2450) by [@chandreshpatidar](https://github.com/chandreshpatidar) – Fix html serializer: expected dnd context

  When we want to serialize plate value in html with DnD support, it throws `Uncaught Invariant Violation: Expected drag drop context` error

  ```tsx
  const Serialized = () => {
    const editor = usePlateEditorState();
    const html = serializeHtml(editor, {
      nodes: editor.children,
      dndWrapper: (props) => <DndProvider backend={HTML5Backend} {...props} />,
    });

    return <HighlightHTML code={html} />;
  };

  export default () => (
    <DndProvider backend={HTML5Backend}>
      <Plate<MyValue>
        editableProps={editableProps}
        plugins={plugins}
        initialValue={deserializeHtmlValue}
      >
        <Serialized />
      </Plate>
    </DndProvider>
  );
  ```

  We can now serialize plate value in html with DnD support with above code

## 21.4.1

## 21.3.2

## 21.3.0

## 21.1.5

## 21.0.0

## 20.7.2

## 20.7.0

## 20.4.0

## 20.3.2

## 20.0.0

## 19.7.0

## 19.5.0

## 19.4.4

## 19.4.2

## 19.2.0

## 19.1.1

## 19.1.0

## 19.0.3

## 19.0.1

## 19.0.0

## 18.15.0

## 18.13.0

## 18.9.0

## 18.7.0

## 18.6.0

## 18.2.0

## 18.1.1

## 17.0.3

## 17.0.2

## 17.0.1

## 17.0.0

## 16.8.0

## 16.5.0

### Patch Changes

- [#1825](https://github.com/udecode/plate/pull/1825) by [@mskelton](https://github.com/mskelton) – Add missing `slate-history` peer dependency.

## 16.3.0

## 16.2.0

## 16.1.0

## 16.0.2

## 16.0.0

## 15.0.3

## 15.0.0

## 14.4.2

## 14.0.2

### Patch Changes

- [#1667](https://github.com/udecode/plate/pull/1667) by [@tjramage](https://github.com/tjramage) –
  - fix `serializeHtml`: `convertNewLinesToHtmlBr` option was not used

## 14.0.0
