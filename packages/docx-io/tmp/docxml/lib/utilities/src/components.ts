import type {
	AnyComponent,
	ComponentContext,
	ComponentDefinition,
} from '../../classes/src/Component.ts';

const componentByName = new Map<string, ComponentDefinition>();

/**
 * Register a component in such a way that it can be found by its name later. Uses the class
 * name as unique key.
 *
 * @TODO test that this works well in minified JS
 *
 * This helps avoid circular dependencies in components that can be a descendant of themselves.
 * For example, Table --> Row --> Cell --> Table
 */
export function registerComponent<C extends AnyComponent>(
	component: ComponentDefinition<C>
) {
	componentByName.set(component.name, component);
	return component;
}

/**
 * Transforms a list of (OOXML) XML nodes to component instances based on a list of possible component
 * names. The component names must have been registered before using {@link registerComponent}.
 *
 * This is useful for instantiating the children of a component based on an existing DOCX file.
 */
export function createChildComponentsFromNodes<T extends AnyComponent | string>(
	names: string[],
	nodes: Node[],
	context: ComponentContext
): T[] {
	const children = names.map((name) => {
		const component = componentByName.get(name);
		if (!component) {
			throw new Error(`Unknown component "${name}"`);
		}
		return component;
	});
	return nodes
		.map(
			(node) =>
				(node.nodeType === 3
					? node.nodeValue
					: children
							.find((Child) => Child.matchesNode(node))
							?.fromNode(node, context)) as T | undefined
		)
		.filter((child): child is T => !!child);
}
