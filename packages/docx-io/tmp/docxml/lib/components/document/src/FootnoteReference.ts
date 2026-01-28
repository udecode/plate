import { Component } from '../../../classes/src/Component.ts';
import { registerComponent } from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';
import { evaluateXPathToMap } from '../../../utilities/src/xquery.ts';

/**
 * A type that models the properties that are applied to all of a document's footnotes.
 */
export type FootnoteProps = {
	numberingFormat?:
		| 'bullet'
		| 'chicago'
		| 'decimal'
		| 'lowerRoman'
		| 'upperRoman'
		| 'lowerLetter'
		| 'upperLetter';
	position?: 'beneathText' | 'documentEnd' | 'sectionEnd' | 'pageBottom';
	restart?: 'eachSect' | 'eachPage' | 'continuous';
};

/**
 * A type describing the props accepted by {@link FootnoteReference}.
 */
export type FootnoteReferenceProps = {
	id: number;
	style: string;
};

/**
 * A component that represents a footnote reference.
 */
export class FootnoteReference extends Component<FootnoteReferenceProps> {
	public override toNode(): Node {
		return create(
			`
            element ${QNS.w}r {
                element ${QNS.w}rPr {
                    element ${QNS.w}rStyle { 
                        attribute ${QNS.w}val { $style }
                    }
                }, 
                element ${QNS.w}footnoteReference { 
                    attribute ${QNS.w}id { $id }
                }
            }
        `,
			{
				id: this.props.id,
				style: this.props.style,
			}
		);
	}

	static override fromNode(node: Node): FootnoteReference {
		return new FootnoteReference(
			evaluateXPathToMap<FootnoteReferenceProps>(
				`map { 
					"id": ./@${QNS.w}id/number(),
					"style": ./descendant::${QNS.w}rStyle/@${QNS.w}val/string()
            }`,
				node
			)
		);
	}
}

registerComponent(FootnoteReference);
