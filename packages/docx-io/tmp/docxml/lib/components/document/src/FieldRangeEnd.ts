import {
	type ComponentAncestor,
	Component,
} from '../../../classes/src/Component.ts';
import { registerComponent } from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';
import { evaluateXPathToBoolean } from '../../../utilities/src/xquery.ts';

/**
 * A type describing the components accepted as children of {@link FieldRangeEnd}.
 */
export type FieldRangeEndChild = never;

/**
 * A type describing the props accepted by {@link FieldRangeEnd}.
 */
export type FieldRangeEndProps = { [key: string]: never };

/**
 * The end of a range associated with a complex field.
 */
export class FieldRangeEnd extends Component<
	FieldRangeEndProps,
	FieldRangeEndChild
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
				element ${QNS.w}fldChar {
					attribute ${QNS.w}fldCharType { "end" }
				}
			`,
			{}
		);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static override matchesNode(node: Node): boolean {
		return evaluateXPathToBoolean(
			'self::w:fldChar and @w:fldCharType = "end"',
			node
		);
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static override fromNode(): FieldRangeEnd {
		return new FieldRangeEnd({});
	}
}

registerComponent(FieldRangeEnd);
