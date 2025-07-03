import { type SlateEditor, type TElement, KEYS } from 'platejs';

export type GetPropsIfTaskListLiNodeOptions = {
  liNode: TElement;
  inherit?: boolean;
};

export const getPropsIfTaskListLiNode = (
  editor: SlateEditor,
  { inherit = false, liNode: node }: GetPropsIfTaskListLiNodeOptions
) =>
  editor.getType(KEYS.li) === node.type && 'checked' in node
    ? { checked: inherit ? (node.checked as boolean) : false }
    : undefined;

export const getPropsIfTaskList = (
  editor: SlateEditor,
  type: string,
  partial: { checked?: boolean } = {}
) =>
  editor.getType(KEYS.taskList) === type
    ? { checked: false, ...partial }
    : undefined;