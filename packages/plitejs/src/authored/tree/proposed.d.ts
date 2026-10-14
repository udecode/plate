import type { JsonNode } from '../../core/change/tokens';
type Node = JsonNode;
/** One child Editing holds once every pending change is accepted. */
export type ProposedChild = Readonly<{
    node: Node;
    /** Where the review tree holds it. */
    path: readonly number[];
}>;
/** @internal */
export declare const proposedSurvival: {
    liveContent: (node: JsonNode) => boolean;
    survives: (node: JsonNode) => boolean;
};
/**
 * The element whose children a review element's children become once every
 * pending change is accepted, as a path from the root's children (empty for
 * the root), or null when Editing has already removed the element.
 */
export declare const proposedHost: (children: readonly Node[], path: readonly number[]) => readonly number[] | null;
/**
 * The children of the host at `hostPath`, a path into `children`, once every
 * pending change is accepted, left to right, read from the host's own review
 * children: pending unwraps lift their children, struck nodes with no live
 * content go, and a block with a pending join folds into the text block
 * before it, or replaces it when that block keeps no content. A pending join
 * on the first surviving text block after the host also drops the last of
 * these children that is a text block when it keeps no content and no later
 * child holds a text block, unless a surviving element after the host that
 * does not unwrap encloses the joining block. Reading stops once the first
 * `limit` children are known, that is once no later join can replace one of
 * them.
 */
export declare const proposedChildren: (children: readonly Node[], hostPath: readonly number[], limit?: number) => ProposedChild[];
export {};
