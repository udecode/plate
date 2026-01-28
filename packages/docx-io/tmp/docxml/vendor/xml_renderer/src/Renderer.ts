import fontoxpath from 'fontoxpath';

import { Registry } from './Registry.ts';
import type { Component, Factory, Options, Props } from './types.ts';

export class Renderer<
	/**
	 * The output of one render function, such as HTML or ReactElement.
	 */
	OutputGeneric,
	/**
	 * Additional arguments to the render function
	 */
	PropsGeneric extends { [key: string]: unknown } | undefined = undefined,
	MetadataGeneric = Component<OutputGeneric, PropsGeneric>
> extends Registry<MetadataGeneric> {
	private factory: Factory<OutputGeneric, PropsGeneric, MetadataGeneric>;

	constructor(
		factory: Factory<OutputGeneric, PropsGeneric, MetadataGeneric>,
		options: Partial<Options> = {}
	) {
		super(options);
		this.factory = factory;
	}

	render(node: Node, additionalProps: PropsGeneric): OutputGeneric | null {
		return (function recurse(
			registry: Renderer<OutputGeneric, PropsGeneric, MetadataGeneric>,
			factory: Factory<OutputGeneric, PropsGeneric, MetadataGeneric>,
			node: Node
		): OutputGeneric | null {
			const props = {
				node,
				traverse: (query = './node()') =>
					registry.xpath
						.evaluateXPathToNodes(
							query,
							node,
							null,
							additionalProps || {},
							{
								language:
									fontoxpath.evaluateXPath
										.XQUERY_3_1_LANGUAGE,
							}
						)
						.map((n) => recurse(registry, factory, n as Node))
						.filter((o): o is OutputGeneric => o !== null),
				...(additionalProps || {}),
			} as Props<OutputGeneric, PropsGeneric>;
			return factory(registry.find(node), props);
		})(this, this.factory, node);
	}
}
