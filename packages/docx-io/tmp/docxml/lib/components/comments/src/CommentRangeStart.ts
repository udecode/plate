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
 * A type describing the components accepted as children of {@link CommentRangeStart}.
 */
export type CommentRangeStartChild = never;

/**
 * A type describing the props accepted by {@link CommentRangeStart}.
 */
export type CommentRangeStartProps = {
	id: Id;
};

/**
 * The start of a range associated with a comment.
 */
export class CommentRangeStart extends Component<
	CommentRangeStartProps,
	CommentRangeStartChild
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
				element ${QNS.w}commentRangeStart {
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
		return node.nodeName === 'w:commentRangeStart';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static override fromNode(node: Node): CommentRangeStart {
		const { id } = evaluateXPathToMap<{ id: number }>(
			`
				map {
					"id": ./@${QNS.w}id/number()
				}
			`,
			node
		);
		return new CommentRangeStart({ id: int(id) });
	}
}

registerComponent(CommentRangeStart);
