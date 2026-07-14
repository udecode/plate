import type { BaseEditor } from '@platejs/core';
import { type Element, KEYS } from 'platejs';

export type GetPropsIfTaskListLiNodeOptions = {
  liNode: Element;
  inherit?: boolean;
};

export const getPropsIfTaskListLiNode = (
  editor: BaseEditor,
  { inherit = false, liNode: node }: GetPropsIfTaskListLiNodeOptions
) =>
  editor.getType(KEYS.li) === node.type && 'checked' in node
    ? { checked: inherit ? (node.checked as boolean) : false }
    : undefined;

export const getPropsIfTaskList = (
  editor: BaseEditor,
  type: string,
  partial: { checked?: boolean } = {}
) =>
  editor.getType(KEYS.taskList) === type
    ? { checked: false, ...partial }
    : undefined;
