# @udecode/plate-serializer-html

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
