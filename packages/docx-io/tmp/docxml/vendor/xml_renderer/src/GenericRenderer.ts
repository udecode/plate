import { Renderer } from './Renderer.ts';
import type { Component, Options, Props } from './types.ts';

export class GenericRenderer<
	OutputGeneric,
	PropsGeneric extends { [key: string]: unknown } | undefined = undefined,
	MetadataGeneric extends (
		props: Props<OutputGeneric, PropsGeneric>
	) => OutputGeneric = Component<OutputGeneric, PropsGeneric>
> extends Renderer<OutputGeneric, PropsGeneric, MetadataGeneric> {
	constructor(options: Partial<Options> = {}) {
		super(
			(component, props) => (component ? component(props) : null),
			options
		);
	}
}

export class ReactRenderer<
	CreateElementGeneric extends (
		// deno-lint-ignore no-explicit-any
		Component: any,
		// deno-lint-ignore no-explicit-any
		props: any,
		// deno-lint-ignore no-explicit-any
		...children: any[]
	) => unknown,
	PropsGeneric extends { [key: string]: unknown } | undefined = undefined
> extends Renderer<ReturnType<CreateElementGeneric>, PropsGeneric> {
	constructor(
		createElement: CreateElementGeneric,
		options: Partial<Options> = {}
	) {
		super(
			(component, props) =>
				component
					? (createElement(
							component,
							props
					  ) as ReturnType<CreateElementGeneric>)
					: null,
			options
		);
	}
}
