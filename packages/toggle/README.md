# Plate toggle plugin

This package implements the toggle plugin for Plate.
It's similar to the indent list plugin, in that it relies on the indent of siblings.

## Documentation

Check out [Toggle](https://platejs.org/docs/toggle).

## Ideas to improve this plugin

1. Adding an option `initialValue` of open `toggleIds` and a callback `onChange`, for instance to store the state of open toggles in local storage and remember the state upon browser refresh.
2. Adding an option `defaultOpen`. Currently, toggles are closed on initial rendering.
3. Adding an option to specify how to get the indent value of elements, right now we are relying on this being the default `KEY_ELEMENT` from the `indent` plugin
4. An option to specify how to get the id of elements, right now we are using the default id attribute from the `node-id` plugin.
5. Adding a placeholder below the toggle, like Notion does, when the toggle is expanded without any elements below.
6. Make toggle button more accessible
7. When indenting an element right of a closed toggle, it becomes hidden. This makes sense, but a nicer UI would be to open the toggle in that case, like Notion does.

## License

[MIT](../../LICENSE)
