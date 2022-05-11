---
"@udecode/plate-core": minor
---

Transforms:
- `insertElements`: `insertNodes` where node type is `TElement` 
- `setElements`: `setNodes` where node type is `TElement`

Types: 
- General type improvements to all plate packages.
- `Value = TElement[]`: Default value of an editor.
- `TNode = TEditor<Value> | TElement | TText`
- `TElement`: Note that `type: string` is included as it's the standard in Plate.
- `TText`: it now accepts unknown props.
- `TDescendant = TElement | TText`
- `TAncestor = TEditor<Value> | TElement`
- `ENode<V extends Value>`: Node of an editor value
- `EElement<V extends Value>`: Element of an editor value
- `EText<V extends Value>`: Text of an editor value
- `EDescendant<V extends Value>`: Descendant of an editor value
- `EAncestor<V extends Value>`: Ancestor of an editor value
- `NodeOf<N extends TNode>`: A utility type to get all the node types from a root node type.
- `ElementOf<N extends TNode>`: A utility type to get all the element nodes type from a root node.
- `TextOf<N extends TNode>`: A utility type to get all the text node types from a root node type.
- `DescendantOf<N extends TNode>`: A utility type to get all the descendant node types from a root node type.
- `ChildOf<N extends TNode, I extends number = number>`: A utility type to get the child node types from a root node type.
- `AncestorOf<N extends TNode>`: A utility type to get all the ancestor node types from a root node type.
- `ValueOf<E extends TEditor<Value>>`: A helper type for getting the value of an editor.
- `MarksOf<N extends TNode>`: A utility type to get all the mark types from a root node type.
- `EMarks<V extends Value>`
- `TNodeProps<N extends TNode>`: Convenience type for returning the props of a node.
- `TNodeEntry<N extends TNode = TNode>`
- `ENodeEntry<V extends Value>`: Node entry from an editor.
- `TElementEntry<N extends TNode = TNode>`: Element entry from a node.
- `TTextEntry<N extends TNode = TNode>`: Text node entry from a node.
- `ETextEntry<V extends Value>`: Text node entry of a value.
- `TAncestorEntry<N extends TNode = TNode>`: Ancestor entry from a node.
- `EAncestorEntry<V extends Value>`: Ancestor entry from an editor.
- `TDescendantEntry<N extends TNode = TNode>`: Descendant entry from a node.
- `TOperation`: operation types now accept unknown props.

Updated deps:
```bash
"@udecode/zustood": "^1.1.1",
"jotai": "^1.6.6",
"lodash": "^4.17.21",
"zustand": "^3.7.2"
```