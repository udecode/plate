import { Component } from '../../../classes/src/Component.ts';
import { registerComponent } from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';
import { evaluateXPathToMap } from '../../../utilities/src/xquery.ts';

/**
 * A type describing the props accepted by {@link FootnoteReference}.
 */
export type FootnoteAnchorProps = {
	style?: string;
};

/**
 * A component that represents a footnote anchor.
 */
export class FootnoteAnchor extends Component<FootnoteAnchorProps> {
	public override toNode(): Node {
		return create(
			`
            element ${QNS.w}r {
				if ($style) then (
					element ${QNS.w}rPr {
						element ${QNS.w}rStyle { 
							attribute ${QNS.w}val { $style }
						}
					} 
				) else (),
                element ${QNS.w}footnoteRef {}
            }
        `,
			{
				style: this.props.style,
			}
		);
	}

	static override fromNode(node: Node): FootnoteAnchor {
		return new FootnoteAnchor(
			evaluateXPathToMap<FootnoteAnchorProps>(
				`map { 
					"style": ./descendant::${QNS.w}rStyle/@${QNS.w}val/string()
				}`,
				node
			)
		);
	}
}

registerComponent(FootnoteAnchor);
