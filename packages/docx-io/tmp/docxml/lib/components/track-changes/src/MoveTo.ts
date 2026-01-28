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
import type { CommentRangeEnd } from '../../comments/src/CommentRangeEnd.ts';
import type { CommentRangeStart } from '../../comments/src/CommentRangeStart.ts';
import type { BookmarkRangeEnd } from '../../document/src/BookmarkRangeEnd.ts';
import type { BookmarkRangeStart } from '../../document/src/BookmarkRangeStart.ts';
import type { FootnoteReference } from '../../document/src/FootnoteReference.ts';
import type { Text } from '../../document/src/Text.ts';
import type { Deletion } from './Deletion.ts';
import type { Insertion } from './Insertion.ts';
import type { MoveFrom } from './MoveFrom.ts';
import type { MoveFromRangeEnd } from './MoveFromRangeEnd.ts';
import type { MoveFromRangeStart } from './MoveFromRangeStart.ts';
import type { MoveToRangeEnd } from './MoveToRangeEnd.ts';
import type { MoveToRangeStart } from './MoveToRangeStart.ts';

/**
 * A type specifying the children of {@link MoveTo}.
 */
export type MoveToChild =
	| BookmarkRangeStart
	| BookmarkRangeEnd
	| CommentRangeStart
	| CommentRangeEnd
	| Text
	| MoveTo
	| MoveFrom
	| MoveToRangeStart
	| MoveToRangeEnd
	| MoveFromRangeStart
	| MoveFromRangeEnd
	| Insertion
	| Deletion
	| FootnoteReference;

/**
 * A type describing the props accepted by {@link MoveTo}.
 */
export type MoveToProps = ChangeInformation;

/**
 * A component that represents a change-tracked text or paragraph that was moved to a new location.
 *
 * If a `MoveTo` is present outside the text-properties, then paragraphs appear as a insertion in Word.
 *
 * Additional documentation is here:
 * 	- https://c-rex.net/samples/ooxml/e1/Part4/OOXML_P4_DOCX_moveTo_topic_ID0EE3IW.html#topic_ID0EE3IW
 * 	- https://c-rex.net/samples/ooxml/e1/Part4/OOXML_P4_DOCX_moveTo_topic_ID0EXMJW.html
 */
export class MoveTo extends Component<MoveToProps, MoveToChild> {
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
				element ${QNS.w}moveTo { 
					attribute ${QNS.w}id { $id }, 
					if (exists($date)) then attribute ${QNS.w}date { $date } else (),
					if (exists($author)) then attribute ${QNS.w}author { $author } else (),
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
		return node.nodeName === 'w:moveTo';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static override fromNode(node: Node, context: ComponentContext): MoveTo {
		const { children, changeProps } = evaluateXPathToMap<{
			children: Node[];
			changeProps: MoveToProps;
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
		return new MoveTo(
			{
				...changeProps,
				author: changeProps.author ? changeProps.author : undefined,
				date: changeProps.date ? new Date(changeProps.date) : undefined,
			},
			...createChildComponentsFromNodes<MoveToChild>(
				this.children,
				children,
				context
			)
		);
	}
}

registerComponent(MoveTo);
