import {
	Component,
	type ComponentAncestor,
} from '../../../classes/src/Component.ts';
import { registerComponent } from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { int, type Id } from '../../../utilities/src/id.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';
import { evaluateXPathToMap } from '../../../utilities/src/xquery.ts';

/**
 * A type describing the components accepted as children of {@link CommentRangeEnd}.
 */
export type CommentRangeEndChild = never;

/**
 * A type describing the props accepted by {@link CommentRangeEnd}.
 */
export type CommentRangeEndProps = {
	id: Id;
};

/**
 * The end of a range associated with a comment.
 */
export class CommentRangeEnd extends Component<
	CommentRangeEndProps,
	CommentRangeEndChild
> {
	public static override readonly children: string[] = [];

	public static override readonly mixed: boolean = false;

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public override toNode(_ancestry: ComponentAncestor[]): Node {
		return create(
			`
				element ${QNS.w}commentRangeEnd {
					attribute ${QNS.w}id { $id }
				}
			`,
			{
				id: this.props.id.int,
			}
		);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static override matchesNode(node: Node): boolean {
		return node.nodeName === 'w:commentRangeEnd';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static override fromNode(node: Node): CommentRangeEnd {
		const { id } = evaluateXPathToMap<{ id: number }>(
			`
				map {
					"id": ./@${QNS.w}id/number()
				}
			`,
			node
		);
		return new CommentRangeEnd({ id: int(id) });
	}
}

registerComponent(CommentRangeEnd);
