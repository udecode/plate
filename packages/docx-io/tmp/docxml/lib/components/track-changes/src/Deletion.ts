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
import type { DeletedText } from "./DeletedText.ts";
import type { Insertion } from './Insertion.ts';
import type { MoveFrom } from './MoveFrom.ts';
import type { MoveFromRangeEnd } from './MoveFromRangeEnd.ts';
import type { MoveFromRangeStart } from './MoveFromRangeStart.ts';
import type { MoveTo } from './MoveTo.ts';
import type { MoveToRangeEnd } from './MoveToRangeEnd.ts';
import type { MoveToRangeStart } from './MoveToRangeStart.ts';
/**
 * A type specifying the children of {@link Deletion}.
 */
export type DeletionChild =
	| BookmarkRangeStart
	| BookmarkRangeEnd
	| CommentRangeStart
	| CommentRangeEnd
	| DeletedText
	| MoveTo
	| MoveFrom
	| MoveToRangeStart
	| MoveToRangeEnd
	| MoveFromRangeStart
	| MoveFromRangeEnd
	| Deletion
	| Insertion
	| FootnoteReference;

/**
 * A type describing the props accepted by {@link Deletion}.
 */
export type DeletionProps = ChangeInformation;

/**
 * A component that represents a change-tracked for an deleted element.
 *
 * Additional documentation is here:
 * 	- https://c-rex.net/samples/ooxml/e1/Part4/OOXML_P4_DOCX_del_topic_ID0ESZZV.html
 * 	- https://c-rex.net/samples/ooxml/e1/Part4/OOXML_P4_DOCX_del_topic_ID0EMM3V.html
 *  - https://c-rex.net/samples/ooxml/e1/Part4/OOXML_P4_DOCX_del_topic_ID0EH23V.html
 *  - https://c-rex.net/samples/ooxml/e1/Part4/OOXML_P4_DOCX_del_topic_ID0EOK4V.html
 */
export class Deletion extends Component<DeletionProps, DeletionChild> {
	public static override readonly children: string[] = [
		'BookmarkRangeEnd',
		'BookmarkRangeStart',
		'CommentRangeStart',
		'CommentRangeEnd',
		'DeletedText',
		'MoveFrom',
		'MoveTo',
		'MoveToRangeStart',
		'MoveToRangeEnd',
		'MoveFromRangeStart',
		'MoveFromRangeEnd',
		'Insertion',
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

				return element ${QNS.w}del { $attrs, $children }
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
		return node.nodeName === 'w:del';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static override fromNode(node: Node, context: ComponentContext): Deletion {
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

		return new Deletion(
			props,
			...createChildComponentsFromNodes<DeletionChild>(
				this.children,
				children,
				context
			)
		);
	}
}

registerComponent(Deletion);
