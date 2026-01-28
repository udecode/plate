import {
	Component,
	type ComponentAncestor,
	type ComponentContext,
} from '../../../classes/src/Component.ts';
import {
	type ChangeInformation,
	getChangeInformation,
} from '../../../utilities/src/changes.ts';
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
import type { MoveFrom } from './MoveFrom.ts';
import type { MoveFromRangeEnd } from './MoveFromRangeEnd.ts';
import type { MoveFromRangeStart } from './MoveFromRangeStart.ts';
import type { MoveToRangeEnd } from './MoveToRangeEnd.ts';
import type { MoveToRangeStart } from './MoveToRangeStart.ts';
import type { MoveTo } from './MoveTo.ts';

/**
 * A type specifying the children of {@link Insertion}.
 */
export type InsertionChild =
	| BookmarkRangeStart
	| BookmarkRangeEnd
	| CommentRangeStart
	| CommentRangeEnd
	| Text
	| MoveTo
	| MoveFrom
	| Insertion
	| MoveToRangeStart
	| MoveToRangeEnd
	| MoveFromRangeStart
	| MoveFromRangeEnd
	| Deletion
	| FootnoteReference;

/**
 * A type describing the props accepted by {@link Insertion}.
 */
export type InsertionProps = ChangeInformation;

/**
 * A component that represents a change-tracked for an inserted element.
 *
 * The documentation with each of the possible cases can be found here.
 * 	- https://c-rex.net/samples/ooxml/e1/Part4/OOXML_P4_DOCX_ins_topic_ID0EOW6V.html
 * 	- https://c-rex.net/samples/ooxml/e1/Part4/OOXML_P4_DOCX_ins_topic_ID0EVH6V.html
 *  - https://c-rex.net/samples/ooxml/e1/Part4/OOXML_P4_DOCX_ins_topic_ID0EZY5V.html
 *  - https://c-rex.net/samples/ooxml/e1/Part4/OOXML_P4_DOCX_ins_topic_ID0EA14V.html
 *  - https://c-rex.net/samples/ooxml/e1/Part4/OOXML_P4_DOCX_ins_topic_ID0EHJ5V.html
 */
export class Insertion extends Component<InsertionProps, InsertionChild> {
	public static override readonly children: string[] = [
		'BookmarkRangeEnd',
		'BookmarkRangeStart',
		'CommentRangeStart',
		'CommentRangeEnd',
		'Text',
		'MoveTo',
		'MoveFrom',
		'MoveToRangeStart',
		'MoveToRangeEnd',
		'MoveFromRangeStart',
		'MoveFromRangeEnd',
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
				let $attrs := [
					attribute ${QNS.w}id { $id }, 
					if ($author) then attribute ${QNS.w}author { $author } else (),
					if ($date) then attribute ${QNS.w}date { $date } else ()
				]

				return element ${QNS.w}ins { $attrs, $children }
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
		return node.nodeName === 'w:ins';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static override fromNode(node: Node, context: ComponentContext): Insertion {
		const props = getChangeInformation(node);
		const { children } = evaluateXPathToMap<{
			rpr: Node;
			children: Node[];
		}>(
			`
				map {
					"children": array{
						./${QNS.w}r,
						./${QNS.w}bookmarkStart,
						./${QNS.w}bookmarkEnd,
						./${QNS.w}commentRangeStart,
						./${QNS.w}commentRangeEnd,
						./${QNS.w}moveTo,
						./${QNS.w}moveToRangeStart,
						./${QNS.w}moveToRangeEnd,
						./${QNS.w}moveFrom,
						./${QNS.w}moveFromRangeStart,
						./${QNS.w}moveFromRangeEnd
					}
				}
			`,
			node
		);

		return new Insertion(
			props,
			...createChildComponentsFromNodes<InsertionChild>(
				this.children,
				children,
				context
			)
		);
	}
}

registerComponent(Insertion);
