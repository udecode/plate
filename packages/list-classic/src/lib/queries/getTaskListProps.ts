import type { Element } from '@platejs/slate';
import type { SlateEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

export type GetPropsIfTaskListLiNodeOptions = {
  liNode: Element;
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
