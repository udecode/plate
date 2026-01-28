import {
	type ComponentAncestor,
	Component,
} from '../../../classes/src/Component.ts';
import { registerComponent } from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';
import { evaluateXPathToBoolean } from '../../../utilities/src/xquery.ts';

/**
 * A type describing the components accepted as children of {@link FieldRangeSeparator}.
 */
export type FieldRangeSeparatorChild = never;

/**
 * A type describing the props accepted by {@link FieldRangeSeparator}.
 */
export type FieldRangeSeparatorProps = { [key: string]: never };

/**
 * The separator between the instruction of a compex field, and the last computed value.
 */
export class FieldRangeSeparator extends Component<
	FieldRangeSeparatorProps,
	FieldRangeSeparatorChild
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
					attribute ${QNS.w}fldCharType { "separate" }
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
			'self::w:fldChar and @w:fldCharType = "separate"',
			node
		);
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static override fromNode(): FieldRangeSeparator {
		return new FieldRangeSeparator({});
	}
}

registerComponent(FieldRangeSeparator);
