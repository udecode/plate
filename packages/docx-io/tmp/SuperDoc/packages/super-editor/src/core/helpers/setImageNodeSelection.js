import { NodeSelection } from 'prosemirror-state';

export const setImageNodeSelection = (view, pos) => {
  const { doc } = view.state;
  const node = doc.nodeAt(pos);
  if (node && node.type.name === 'image') {
    const tr = view.state.tr.setSelection(NodeSelection.create(doc, pos));
    view.dispatch(tr);
    return true;
  }
  return false;
};
