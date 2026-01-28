import type { FieldDefinition } from '../../../../mod.ts';
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
import {
	evaluateXPathToBoolean,
	evaluateXPathToMap,
} from '../../../utilities/src/xquery.ts';

/**
 * A type describing the components accepted as children of {@link FieldRangeInstruction}.
 */
export type FieldRangeInstructionChild = string | FieldDefinition;

/**
 * A type describing the props accepted by {@link FieldRangeInstruction}.
 */
export type FieldRangeInstructionProps = { [key: string]: never };

/**
 * An instruction in a complex field.
 */
export class FieldRangeInstruction extends Component<
	FieldRangeInstructionProps,
	FieldRangeInstructionChild
> {
	public static override readonly children: string[] = ['FieldDefinition'];

	public static override readonly mixed: boolean = true;

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public override async toNode(ancestry: ComponentAncestor[]): Promise<Node> {
		return create(
			`
				element ${QNS.w}instrText {
					$children
				}
			`,
			{
				children: await this.childrenToNode(ancestry),
			}
		);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static override matchesNode(node: Node): boolean {
		return evaluateXPathToBoolean('self::w:instrText', node);
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static override fromNode(
		node: Node,
		context: ComponentContext
	): FieldRangeInstruction {
		const { children } = evaluateXPathToMap<{
			rpr: Node;
			children: Node[];
		}>(
			`
				map {
					"children": array{
						./text()
					}
				}
			`,
			node
		);
		return new FieldRangeInstruction(
			{},
			...createChildComponentsFromNodes<FieldRangeInstructionChild>(
				this.children,
				children,
				context
			)
		);
	}
}

registerComponent(FieldRangeInstruction);
