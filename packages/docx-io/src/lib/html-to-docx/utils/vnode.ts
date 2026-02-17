export interface VNode {
  children?: VNode[];
  [key: string]: unknown;
}

export const vNodeHasChildren = (vNode: VNode | null | undefined): boolean =>
  Boolean(
    vNode?.children && Array.isArray(vNode.children) && vNode.children.length
  );
