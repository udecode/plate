import type { Element } from '@platejs/plite';
import type { BasePlateEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

export type GetPropsIfTaskListLiNodeOptions = {
  liNode: Element;
  inherit?: boolean;
};

export const getPropsIfTaskListLiNode = (
  editor: BasePlateEditor,
  { inherit = false, liNode: node }: GetPropsIfTaskListLiNodeOptions
) =>
  editor.getType(KEYS.li) === node.type && 'checked' in node
    ? { checked: inherit ? (node.checked as boolean) : false }
    : undefined;

export const getPropsIfTaskList = (
  editor: BasePlateEditor,
  type: string,
  partial: { checked?: boolean } = {}
) =>
  editor.getType(KEYS.taskList) === type
    ? { checked: false, ...partial }
    : undefined;
