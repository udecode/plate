import { Component } from '../../../classes/src/Component.ts';
import { registerComponent } from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';

/**
 * A component that represents a footnote continuation separator.
 */
export class FootnoteContinuationSeparator extends Component<
	Record<string, never>
> {
	public override toNode(): Node {
		return create(`element ${QNS.w}continuationSeparator {}`, {});
	}

	static override fromNode(_: Node): FootnoteContinuationSeparator {
		return new FootnoteContinuationSeparator({});
	}
}

registerComponent(FootnoteContinuationSeparator);
