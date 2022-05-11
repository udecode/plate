---
"@udecode/plate-core": major
---

Thanks @ianstormtaylor for the initial work on https://github.com/ianstormtaylor/slate/pull/4177. 

This release includes major changes to plate and slate types:
- Changing the `TEditor` type to be `TEditor<V>` where `V` represents the "value" being edited by Slate. In the most generic editor, `V` would be equivalent to `TElement[]` (since that is what is accepted as children of the editor). But in a custom editor, you might have `TEditor<Array<Paragraph | Quote>>`.
- Other `TEditor`-and-`TNode`-related methods have been also made generic, so for example if you use `getLeafNode(editor, path)` it knows that the return value is a `TText` node. But more specifically, it knows that it is the text node of the type you've defined in your custom elements (with any marks you've defined).
- This replaces the declaration merging approach, and provides some benefits. One of the drawbacks to declaration merging was that it was impossible to know whether you were dealing with an "unknown" or "known" element, since the underlying type was changed. Similarly, having two editors on the page with different schemas wasn't possible to represent. Hopefully this approach with generics will be able to smoothly replace the declaration merging approach. (While being easy to migrate to, since you can pass those same custom element definitions into `TEditor` still.)

Those Slate types should be replaced by the new types:
- `Editor` -> `TEditor<V extends Value>`
- `ReactEditor` -> `TReactEditor<V extends Value>`
- `HistoryEditor` -> `THistoryEditor<V extends Value>`
- `EditableProps` -> `TEditableProps<V extends Value>`
- `Node` -> `TNode`
- `Element` -> `TElement`
- `Text` -> `TText`

Those Slate functions should be replaced by the new typed ones:
- `createEditor` -> `createTEditor`
- `withReact` -> `withTReact`
- `withHistory` -> `withTHistory`
- As the new editor type is not matching the slate ones, all `Transforms`, `Editor`, `Node`, `Element`, `Text`, `HistoryEditor`, `ReactEditor` functions should be replaced.
  - The whole API has been typed into Plate core. See `https://github.com/udecode/plate/packages/core/src/slate` 

Generic types:
- `<T = {}>` could be used to extend the editor type. It is now replaced by `<E extends PlateEditor<V> = PlateEditor<V>>` to customize the whole editor type.
- When the plugin type is customizable, these generics are used: `<P = {}, V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>`, where `P` is the plugin options type.
- `Editor` functions are using `<V extends Value>` generic, where `V` can be a custom editor value type used in `PlateEditor<V>`.
- `Editor` functions returning a node are using `<N extends ENode<V>, V extends Value = Value>` generics, where `N` can be a custom returned node type.
- `Editor` callbacks (e.g. a plugin option) are using `<V extends Value, E extends PlateEditor<V> = PlateEditor<V>>` generics, where `E` can be a custom editor type.
- `Node` functions returning a node are using `<N extends Node, R extends TNode = TNode>` generics.
- These generics are used by `<V extends Value, K extends keyof EMarks<V>>`: `getMarks`, `isMarkActive`, `removeMark`, `setMarks`, `ToggleMarkPlugin`, `addMark`, `removeEditorMark`
- `WithOverride` is a special type case as it can return a new editor type:
```tsx
// before
export type WithOverride<T = {}, P = {}> = (
  editor: PlateEditor<T>,
  plugin: WithPlatePlugin<T, P>
) => PlateEditor<T>;

// after - where E is the Editor type (input), and EE is the Extended Editor type (output)
export type WithOverride<
  P = {},
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
  EE extends E = E
> = (editor: E, plugin: WithPlatePlugin<P, V, E>) => EE;
```



Renamed:
- `getAbove` -> `getAboveNode`
- `getParent` -> `getParentNode`
- `getText` -> `getEditorString`
- `getLastNode` -> `getLastNodeByLevel`
- `getPointBefore` -> `getPointBeforeLocation`
- `getNodes` -> `getNodeEntries`
- `getNodes` -> `getNodeEntries`
- `isStart` -> `isStartPoint`
- `isEnd` -> `isEndPoint`

Removing node props types in favor of element types (same props + extends `TElement`). You can use `TNodeProps` to get the node data (props).
- `LinkNodeData` -> `TLinkElement`
- `ImageNodeData` -> `TImageElement`
- `TableNodeData` -> `TTableElement`
- `MentionNodeData` -> `TMentionElement`
- `MentionNode` -> `TMentionElement`
- `MentionInputNodeData` -> `TMentionInputElement`
- `MentionInputNode` -> `TMentionInputElement`
- `CodeBlockNodeData` -> `TCodeBlockElement`
- `MediaEmbedNodeData` -> `TMediaEmbedElement`
- `TodoListItemNodeData` -> `TTodoListItemElement`
- `ExcalidrawNodeData` -> `TExcalidrawElement`

Utils:
- `match` signature change:
```
<T extends TNode>(
  obj: T,
  path: TPath,
  predicate?: Predicate<T>
)
```
