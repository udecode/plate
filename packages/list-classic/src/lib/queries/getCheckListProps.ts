import { type SlateEditor, type TElement, KEYS } from 'platejs';

export type GetPropsIfCheckListLiNodeOptions = {
  liNode: TElement;
  inherit?: boolean;
};

export const getPropsIfCheckListLiNode = (
  editor: SlateEditor,
  { inherit = false, liNode: node }: GetPropsIfCheckListLiNodeOptions
) =>
  editor.getType(KEYS.li) === node.type && 'checked' in node
    ? { checked: inherit ? (node.checked as boolean) : false }
    : undefined;

export const getPropsIfCheckList = (
  editor: SlateEditor,
  type: string,
  partial: { checked?: boolean } = {}
) =>
  editor.getType(KEYS.checklist) === type
    ? { checked: false, ...partial }
    : undefined;
