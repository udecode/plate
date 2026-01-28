import {
	Component,
	type ComponentAncestor,
	type ComponentContext,
} from '../../../classes/src/Component.ts';
import {
	createChildComponentsFromNodes,
	registerComponent,
} from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';
import { evaluateXPathToMap } from '../../../utilities/src/xquery.ts';
import type { CommentRangeEnd } from '../../comments/src/CommentRangeEnd.ts';
import type { CommentRangeStart } from '../../comments/src/CommentRangeStart.ts';
import type { Deletion } from '../../track-changes/src/Deletion.ts';
import type { Insertion } from '../../track-changes/src/Insertion.ts';
import type { BookmarkRangeEnd } from './BookmarkRangeEnd.ts';
import type { BookmarkRangeStart } from './BookmarkRangeStart.ts';
import type { Hyperlink } from './Hyperlink.ts';
import './Text.ts';
import type { Text } from './Text.ts';

/**
 * A type describing the components accepted as children of {@link Field}.
 */
export type FieldChild =
	| BookmarkRangeStart
	| BookmarkRangeEnd
	| CommentRangeStart
	| CommentRangeEnd
	| Text
	| Hyperlink
	| Insertion
	| Deletion;

/**
 * A type describing the props accepted by {@link Field}.
 */
export type FieldProps = {
	instruction: string;
	/**
	 * Indicates that its current results are invalid (stale) due to other modifications made to the
	 * document, and these contents should be updated before they are displayed if this functionality
	 * is supported by the next processing application.
	 *
	 * Defaults to `false`.
	 */
	isDirty?: boolean;
	/**
	 * Specifies that the parent field shall not have its field result recalculated, even if an
	 * application attempts to recalculate the results of all fields in the document or a recalculation
	 * is explicitly requested.
	 *
	 * Defaults to `false`.
	 */
	isLocked?: boolean;
};

/**
 * A component that represents a (simple) instruction field.
 */
export class Field extends Component<FieldProps, FieldChild> {
	public static override readonly children: string[] = [
		'BookmarkRangeStart',
		'BookmarkRangeEnd',
		'CommentRangeStart',
		'CommentRangeEnd',
		'Text',
		'Hyperlink',
		'Insertion',
		'Deletion',
	];

	public static override readonly mixed: boolean = false;

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public override async toNode(ancestry: ComponentAncestor[]): Promise<Node> {
		return create(
			`
				element ${QNS.w}fldSimple {
					attribute ${QNS.w}instr { $instruction },
					if ($isDirty) then attribute ${QNS.w}dirty { "1" } else (),
					if ($isLocked) then attribute ${QNS.w}fldLock { "1" } else (),
					$children
				}
			`,
			{
				instruction: this.props.instruction,
				isDirty: !!this.props.isDirty,
				isLocked: !!this.props.isLocked,
				children: await this.childrenToNode(ancestry),
			}
		);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static override matchesNode(node: Node): boolean {
		return node.nodeName === 'w:fldSimple';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static override fromNode(node: Node, context: ComponentContext): Field {
		const { children, ...props } = evaluateXPathToMap<
			FieldProps & { children: Node[] }
		>(
			`map {
				"instruction": ./@${QNS.w}instruction/string(),
				"isDirty": docxml:st-on-off(@${QNS.w}dirty),
				"isLocked": docxml:st-on-off(@${QNS.w}fldLock),
				"children": array{ ./(
					${QNS.w}r |
					${QNS.w}hyperlink |
					${QNS.w}del |
					${QNS.w}ins |
					${QNS.w}commentRangeStart |
					${QNS.w}commentRangeEnd |
					${QNS.w}bookmarkRangeStart |
					${QNS.w}bookmarkRangeEnd
				) }
			}`,
			node
		);
		return new Field(
			props,
			...createChildComponentsFromNodes<FieldChild>(
				this.children,
				children,
				context
			)
		);
	}
}

registerComponent(Field);
