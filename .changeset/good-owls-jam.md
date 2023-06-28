---
'@udecode/plate-serializer-html': patch
---

Fix html serializer: expected dnd context

When we want to serialize plate value in html with DnD support, it throws `Uncaught Invariant Violation: Expected drag drop context` error

We can now serialize plate value in html with DnD support with below code

```
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
