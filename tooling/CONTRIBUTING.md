# Contributing

Thank you for your interest in helping to improve **`plate`**! As a community-led project, we wholeheartedly welcome all kinds of contributions. This includes everything from participating in discussions and improving documentation, to fixing bugs and enhancing features.

This document will provide guidance to help streamline the process and make efficient use of everyone's valuable time.

## About this repository

This repository is a monorepo.

- We use [Bun](https://bun.sh) and [`workspaces`](https://bun.sh/docs/install/workspaces) for development.
- We use [tsup](https://tsup.egoist.dev/) as our build system.
- We use [changesets](https://github.com/changesets/changesets) for managing releases.

## Structure

This repository is structured as follows:

```
apps
└── www
    ├── content
    └── src
        └── app
            ├── components
            └── registry
                    ├── examples
                    └── ui
packages
└── core
```

| Path                      | Description                              |
| ------------------------- | ---------------------------------------- |
| `apps/www/content`        | The content for the website.             |
| `apps/www/src/app`        | The Next.js application for the website. |
| `apps/www/src/components` | The React components for the website.    |
| `apps/www/src/registry`   | The registry for the components.         |
| `packages/core`           | The `@platejs/core` package.             |

## Development

### Start by cloning the repository:

```bash
git clone git@github.com:udecode/plate.git
```

### Install

```bash
bun install
```

### Build

```bash
bun run build
```

### Run a workspace

You can use the `turbo --filter=[WORKSPACE]` command to start the development process for a workspace.

#### Examples

1. To run the `platejs.org` website:

```
turbo --filter=www dev
```

2. To build the `@platejs/core` package:

```
turbo --filter=@platejs/core build
```

## Documentation

The documentation for this project is located in the `www` workspace. After running `bun run build`, you can run the documentation locally by running the following command:

```bash
bun run dev
```

Documentation is written using [MDX](https://mdxjs.com). You can find the documentation files in the `docs` directory.

**Re-run the following commands on each package update:**

```bash
turbo --filter=[PACKAGE] build
bun run dev
```

## Components

We use a registry system for developing components. You can find the source code for the components under `apps/www/src/registry`. The components are organized by styles.

```bash
apps
└── www
    └── registry
        │   └── ui
```

When adding or modifying components, please ensure that you update the documentation.

### Run Linter

We use [Biome](https://biomejs.dev/) as our code linter. To run the linter, use the following command:

```bash
bun run lint
# autofix with:
bun run lint:fix
```

## Testing

### Run Unit Tests

Tests are written using [Jest](https://jestjs.io/). You can run all the tests from the root of the repository.

```bash
bun run test
```

There are various modes available for running tests, including **`--watch`**, **`--coverage`**, and **`--runInBand`**. These can be selected from the command line interface or passed to **`bun run test`** as specific parameters.

Please ensure that the tests are passing when submitting a pull request. If you're adding new features, please include tests.

### Run Playwright Tests

We use Playwright for our end-to-end (e2e) tests in headless browsers.

To install Playwright's browsers and dependencies, use:

```bash
bun playwright install # first time
```

To run all tests:

```bash
bun run e2e
```
