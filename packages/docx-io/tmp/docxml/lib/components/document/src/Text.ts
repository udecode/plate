// Import without assignment ensures Deno does not tree-shake this component. To avoid circular
// definitions, components register themselves in a side-effect of their module.
import './Break.ts';
import './FieldRangeEnd.ts';
import './FieldRangeInstruction.ts';
import './FieldRangeSeparator.ts';
import './FieldRangeStart.ts';
import './Image.ts';
import './NonBreakingHyphen.ts';
import './Symbol.ts';
import './Tab.ts';

import {
	Component,
	type ComponentAncestor,
	type ComponentContext,
} from '../../../classes/src/Component.ts';
import {
	type TextProperties,
	textPropertiesFromNode,
	textPropertiesToNode,
} from '../../../properties/src/text-properties.ts';
import {
	createChildComponentsFromNodes,
	registerComponent,
} from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';
import { evaluateXPathToMap } from '../../../utilities/src/xquery.ts';
import type { Break } from './Break.ts';
import type { FieldRangeEnd } from './FieldRangeEnd.ts';
import type { FieldRangeInstruction } from './FieldRangeInstruction.ts';
import type { FieldRangeSeparator } from './FieldRangeSeparator.ts';
import type { FieldRangeStart } from './FieldRangeStart.ts';
import type { FootnoteContinuationSeparator } from './FootnoteContinuationSeparator.ts';
import type { FootnoteSeparator } from './FootnoteSeparator.ts';
import type { Image } from './Image.ts';
import type { NonBreakingHyphen } from './NonBreakingHyphen.ts';
import type { Symbol as CharSymbol } from './Symbol.ts';
import type { Tab } from './Tab.ts';

/**
 * A type describing the components accepted as children of {@link Text}.
 */
export type TextChild =
	| string
	| Break
	| FieldRangeEnd
	| FieldRangeInstruction
	| FieldRangeSeparator
	| FieldRangeStart
	| FootnoteSeparator
	| FootnoteContinuationSeparator
	| Image
	| NonBreakingHyphen
	// eslint-disable-next-line @typescript-eslint/ban-types
	| CharSymbol
	| Tab;

const __brand: unique symbol = Symbol();

/**
 * A type describing the props accepted by {@link Text}.
 */
export type TextProps = TextProperties;

/**
 * A component that represents text. All inline formatting options, such as bold/italic/underline,
 * are in fact different props or styles on the `<Text>` component.
 */
export class Text extends Component<TextProps, TextChild> {
	// Introduce a __brand property so that we cannot use Text and DeletedText interchangeably.
	// TypeScript's structural typing would allow us to do so otherwise.

	readonly [__brand] = 'regularText';

	public static override readonly children: string[] = [
		'Break',
		'FieldRangeEnd',
		'FieldRangeInstruction',
		'FieldRangeSeparator',
		'FieldRangeStart',
		'FootnoteSeparator',
		'FootnoteContinuationSeparator',
		'Image',
		'NonBreakingHyphen',
		'Symbol',
		'Tab',
	];
	public static override readonly mixed: boolean = true;

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	public override async toNode(ancestry: ComponentAncestor[]): Promise<Node> {
		return create(
			`
				element ${QNS.w}r {
					$rpr,
					$children
				}
			`,
			{
				rpr: await textPropertiesToNode(this.props),
				children: await Promise.all(
					this.children.map((child) => {
						if (typeof child === 'string') {
							return create(
								`element ${QNS.w}t {  
									attribute xml:space { "preserve" },
									$text
								}`,
								{
									text: child,
								}
							);
						}
						return child.toNode(ancestry);
					})
				),
			}
		);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static override matchesNode(node: Node): boolean {
		return node.nodeName === 'w:r';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static override fromNode(node: Node, context: ComponentContext): Text {
		const { children, rpr } = evaluateXPathToMap<{
			rpr: Node;
			children: Node[];
		}>(
			`
				map {
					"rpr": ./${QNS.w}rPr,
					"children": array{
						./(
							${QNS.w}br,
							${QNS.w}tab,
							${QNS.w}drawing,
							${QNS.w}t/text(),
							${QNS.w}fldChar,
							${QNS.w}instrText,
							${QNS.w}moveTo, 
							${QNS.w}moveFrom
						)
					}
				}
			`,
			node
		);
		return new Text(
			textPropertiesFromNode(rpr),
			...createChildComponentsFromNodes<TextChild>(
				this.children,
				children,
				context
			)
		);
	}
}

registerComponent(Text);
