import {
	Component,
	type ComponentChild,
	type ComponentDefinition,
	type ComponentFunction,
	type ComponentProps,
	isComponentDefinition,
} from '../../classes/src/Component.ts';
import { Text } from '../../components/document/src/Text.ts';

type QueuedComponent<C extends Component> = {
	component: ComponentComponentFunction<C> | ComponentDefinition<C>;
	props: ComponentProps<C>;
	children: ComponentChild<C>[];
};

type ComponentComponentFunction<C extends Component> = ComponentFunction<
	ComponentProps<C>,
	ComponentChild<C>
>;

/**
 * The JSX pragma with which you can write `<Paragraph>` instead of `new Paragraph({})`.
 *
 * Also exposed as the `jsx` prop on the (static) class as well as instance of this library's top-
 * level API -- see also {@link Api}.
 */
export async function jsx<C extends Component>(
	component: ComponentComponentFunction<C> | ComponentDefinition<C>,
	props: ComponentProps<C>,
	...children: Array<ComponentChild<C> | Array<ComponentChild<C>>>
): Promise<
	Array<C | ComponentChild<C> | ReturnType<ComponentComponentFunction<C>>>
> {
	const flattenedChildren = await children
		// Flatten the children, which may themselves have been wrapped in an array because they
		// contained invalid children.
		// Moreover, any component might at this point still be only the promise thereof. Resolve all.
		.reduce<Promise<ComponentChild<C>[]>>(async function flatten(
			flatPromise,
			childPromise
		): Promise<ComponentChild<C>[]> {
			const child = await childPromise;
			const flat = await flatPromise;
			return Array.isArray(child)
				? [
						...flat,
						...(await child.reduce(flatten, Promise.resolve([]))),
				  ]
				: [...flat, child];
		},
		Promise.resolve([]));
	return (
		flattenedChildren
			// Add the node, if it is valid, or add the node split into pieces with the invalid children
			// vertically inserted between
			.reduce<Array<QueuedComponent<C> | ComponentChild<C>>>(
				(nodes, child) => {
					if (
						typeof child === 'string' &&
						isComponentDefinition(component) &&
						!component.mixed
					) {
						child = new Text(
							{},
							child
						) as unknown as ComponentChild<C>;
					}
					const isValid =
						!isComponentDefinition(component) ||
						(component.mixed && typeof child === 'string') ||
						component.children.includes(child.constructor.name);
					if (!isValid) {
						if (
							child.constructor === component &&
							child.constructor === Text
						) {
							Object.assign((child as Text).props, props);
						}
						nodes.push(child);
					} else {
						const lastQueuedItem = nodes[nodes.length - 1];
						if (
							typeof lastQueuedItem === 'string' ||
							lastQueuedItem instanceof Component
						) {
							// Queue this item as a simple object, so that its children can be changed
							// in the next iteration.
							nodes.push({
								component,
								props,
								children: [child],
							});
						} else {
							lastQueuedItem.children.push(child);
						}
					}
					return nodes;
				},
				[{ component, props, children: [] }]
			)
			// Instantiate the "queued" items (props/children that haven't been instantiated yet so that
			// their children could be shuffled around).
			.map((node) => {
				if (typeof node === 'string') {
					return node;
				}
				if (node instanceof Component) {
					return node as ComponentChild<C>;
				}
				if (isComponentDefinition(component)) {
					return new component(
						node.props || {},
						...(node.children || [])
					);
				} else {
					const x = component({
						...props,
						children: node.children || [],
					});
					return x;
				}
			})
			// Flatten again, no telling what came out of a ComponentFunction
			.reduce<
				Array<
					| ReturnType<ComponentComponentFunction<C>>
					| ComponentChild<C>
				>
			>(
				(flat, thing) =>
					Array.isArray(thing)
						? [...flat, ...thing]
						: [...flat, thing],
				[]
			)
			// Remove empty Text components, they don't do anything
			.filter(
				(node) =>
					!(
						node.constructor === Text &&
						!(node as Text).children.length
					)
			)
	);
}
