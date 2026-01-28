// Import without assignment ensures Deno does not tree-shake this component. To avoid circular
// definitions, components register themselves in a side-effect of their module.
import '../../document/src/Text.ts';

import { Component } from '../../../classes/src/Component.ts';
import { registerComponent } from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';
import { evaluateXPathToMap } from '../../../utilities/src/xquery.ts';

export type MoveFromRangeEndChild = never;

export type MoveFromRangeEndProps = {
	id: number;
};

/**
 * A type for indicating the end of a range of content that was moved from one place to another .
 * In OOXML, these are self-closing tags.
 */
export class MoveFromRangeEnd extends Component<
	MoveFromRangeEndProps,
	MoveFromRangeEndChild
> {
	// public static override readonly children: string[] = [];
	public static override readonly mixed: boolean = false;

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	public override toNode(): Node {
		return create(
			`
				element ${QNS.w}moveFromRangeEnd { 
					attribute ${QNS.w}id { $id }
				}
			`,
			{
				id: this.props.id,
			}
		);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static override matchesNode(node: Node): boolean {
		return (
			`Q{${(node as Element).namespaceURI}}` === QNS.w &&
			(node as Element).localName === `moveFromRangeEnd`
		);
	}
	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static override fromNode(node: Node): MoveFromRangeEnd {
		const { id } = evaluateXPathToMap<{
			id: number;
		}>(
			`map { 
				"id": ./@${QNS.w}id/number()
			}`,
			node
		);
		return new MoveFromRangeEnd({
			id: id,
		});
	}
}

registerComponent(MoveFromRangeEnd);
