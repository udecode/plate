// Import without assignment ensures Deno does not tree-shake this component. To avoid circular
// definitions, components register themselves in a side-effect of their module.

import {
	Component,
	type ComponentAncestor,
	type ComponentContext,
} from '../../../classes/src/Component.ts';
import type { ChangeInformation } from '../../../utilities/src/changes.ts';
import {
	createChildComponentsFromNodes,
	registerComponent,
} from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';
import { evaluateXPathToMap } from '../../../utilities/src/xquery.ts';
import type { MoveToChild } from './MoveTo.ts';

/**
 * A type specifying the children of {@link MoveFrom}.
 */
export type MoveFromChild = MoveToChild;
/**
 * A type describing the props accepted by {@link MoveFrom}.
 */
export type MoveFromProps = ChangeInformation;

/**
 * A component that represents a change-tracked text or paragraph that was moved from one location to another.
 *
 * If a `MoveFrom` is present outside the text-properties, then paragraphs appear as a deletion in Word.
 *
 * Additional documentation is here:
 * 	- https://c-rex.net/samples/ooxml/e1/Part4/OOXML_P4_DOCX_moveTo_topic_ID0EE3IW.html#topic_ID0EE3IW
 * 	- https://c-rex.net/samples/ooxml/e1/Part4/OOXML_P4_DOCX_moveTo_topic_ID0EXMJW.html
 */
export class MoveFrom extends Component<MoveFromProps, MoveFromChild> {
	public static override readonly children: string[] = [
		'BookmarkRangeEnd',
		'BookmarkRangeStart',
		'CommentRangeStart',
		'CommentRangeEnd',
		'Text',
		'MoveToRangeStart',
		'MoveToRangeEnd',
		'MoveFromRangeStart',
		'MoveFromRangeEnd',
		'MoveTo',
		'MoveFrom',
		'Insertion',
		'Deletion',
		'FootnoteReference',
		this.name,
	];

	public static override readonly mixed: boolean = false;

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	public override async toNode(ancestry: ComponentAncestor[]): Promise<Node> {
		return create(
			`
				element ${QNS.w}moveFrom { 
					attribute ${QNS.w}id { $id }, 
					if ($date) then attribute ${QNS.w}date { $date } else (),
					if ($author) then attribute ${QNS.w}author { $author } else (), 
					$children
				}
			`,
			{
				...this.props,
				date: this.props.date ? this.props.date.toISOString() : null,
				author: this.props.author ? this.props.author : null,
				children: await this.childrenToNode(ancestry),
			}
		);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static override matchesNode(node: Node): boolean {
		return node.nodeName === 'w:moveFrom';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static override fromNode(node: Node, context: ComponentContext): MoveFrom {
		const { children, changeProps } = evaluateXPathToMap<{
			children: Node[];
			changeProps: MoveFromProps;
		}>(
			`
			map { 
				"children": array{./(
					${QNS.w}r |
					${QNS.w}ins |
					${QNS.w}del |
					${QNS.w}commentRangeStart |
					${QNS.w}commentRangeEnd |
					${QNS.w}bookmarkStart |
					${QNS.w}bookmarkEnd | 
					${QNS.w}moveTo | 
					${QNS.w}moveFrom | 
					${QNS.w}moveToRangeStart | 
					${QNS.w}moveToRangeEnd | 
					${QNS.w}moveFromRangeStart | 
					${QNS.w}moveFromRangeEnd
				)}, 
				"changeProps": map { 
					"id": @${QNS.w}id/number(),
					"date": if (@${QNS.w}date) then @${QNS.w}date/string() else (),
					"author": if (@${QNS.w}author) then @${QNS.w}author/string() else ()
				}

			}`,
			node,
			null,
			{ nodeName: (node as Element).localName }
		);
		return new MoveFrom(
			{
				...changeProps,
				date: changeProps.date ? new Date(changeProps.date) : undefined,
				author: changeProps.author ? changeProps.author : undefined,
			},
			...createChildComponentsFromNodes<MoveFromChild>(
				this.children,
				children,
				context
			)
		);
	}
}

registerComponent(MoveFrom);
