# @udecode/plate-ui

A CLI for adding components to your project.

## Usage

Use the `init` command to initialize dependencies for a new project.

The `init` command installs dependencies, adds the `cn` util, configures `tailwind.config.js`, and CSS variables for the project.

```bash
npx @udecode/plate-ui@latest init
```

## add

Use the `add` command to add components to your project.

The `add` command adds a component to your project and installs all required dependencies.

```bash
npx @udecode/plate-ui@latest add [component]
```

### Example

```bash
npx @udecode/plate-ui@latest add paragraph-element
```

You can also run the command without any arguments to view a list of all available components:

```bash
npx @udecode/plate-ui@latest add
```

## Documentation

Visit https://platejs.org/docs to view the documentation.

## License

[MIT](./LICENSE)
