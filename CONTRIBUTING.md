# Contributing

Thanks for your interest in improving `plate`! We are a
community-driven project and welcome contributions of all kinds: from
discussion to documentation to bugfixes to feature improvements.

Please review this document to help to streamline the process and save
everyone's precious time.

## Issues

No software is bug-free. So, if you got an issue, follow these steps:

- Search the
  [issue list](https://github.com/udecode/plate/issues?utf8=%E2%9C%93&q=)
  for current and old issues.
  - If you find an existing issue, please UPVOTE the issue by adding a
    "thumbs-up reaction". We use this to help prioritize issues!
- If none of that is helping, please create an issue.

### Reproductions

The best way to help figure out an issue you are having is to produce a
minimal reproduction using
[our CodeSandbox](https://codesandbox.io/s/github/udecode/plate-playground)

## Development Guide

### Initial Setup

#### Yarn

This repo uses yarn workspaces, so you should install `yarn` as the
package manager. See
[installation guide](https://yarnpkg.com/en/docs/install).

#### Clone

```bash
git clone https://github.com/udecode/plate.git
```

#### Install & Build

```bash
cd plate
yarn install
yarn g:build
```

### Development

#### How to: Local dev watching file changes

To start the NextJS app locally, run:

```bash
yarn g:dev
```

#### How to: Local docs

To start the docusaurus app locally, run:

```bash
yarn docs:start 
```

To build the docusaurus app, run:

```bash
yarn docs:build 
```

#### How to: Create a plate package

Generate the package by answering the prompts:

```bash
yarn gen:package
```

- `/src`
    - plate plugin?
        - *How to: Create a plate plugin*
- `packages/plate`
    - edit `package.json`
        - add the package to dependencies
    - edit `src/index.tsx`
        - add `export * from '@udecode/plate-x';`

Once done with the package:

```bash
yarn install
yarn g:build
```

#### How to: Create an example

- Did you create a new package?
    - edit `/config/aliases-plate.js`
        - add `'@udecode/plate-x': <package path from /packages>'` to watch file changes
- Create an example app in `/examples/src`
- Once you've finished the example app:
  - go back to the root of the repository
  - run `yarn gen:code` to generate the sandpack files
- Create an example in the docs:
    - go to `/docs/docs`
        - create a new sandpack file for the demo using the generated files
        - create a new mdx file for the docs, importing the sandpack file
    - edit `/docs/docs/sidebars.js`
        - add the example doc so it appears in the sidebar

#### How to: Create a plate plugin

- create file `createXPlugin.ts`
  
    ```tsx
    import { createPluginFactory } from '@udecode/plate-core';
    
    export const createXPlugin = createPluginFactory({
    
    });
    ```
    
- is node?
  - create file `constants.ts`
```tsx
// for elements
export const ELEMENT_X = 'x';

// for marks
export const MARK_X = 'x';
```
  - has node data?
      - create file `types.ts`
```tsx
export interface TXElement extends TElement {

}
```
- is element?
    - add to plugin:
            
```tsx
isElement: true
```
- is inline?
  - add to plugin:
```tsx
isInline: true
```
- create the components in `/components`
  
- is void?
  - add to plugin: 
```tsx
isVoid: true
```
- go to `createPlateUI`
    - add the plugin component to `components` object
```tsx
[ELEMENT_X]: XElement,
```

#### Run Linter

We use eslint as a linter for all code (including typescript code).

All you have to run is:

```sh
yarn g:lint --fix
```

#### Run unit tests

This command will list all the suites and options for running tests.

```sh
yarn g:test
```

The options for running tests can be selected from the cli or be passed
to `yarn g:test` with specific parameters. Available modes include
`--watch`, `--coverage`, and `--runInBand`, which will respectively run
tests in watch mode, output code coverage, and run selected test suites
serially in the current process.

#### Run Playwright tests

We use Playwright for running end-to-end (e2e) tests in headless browsers.
The React app for these tests use can be found in `/examples/apps/e2e-examples`.

Install Playwright's browsers and dependencies:

```sh
yarn install:playwright # first time
```

To run all tests:

```sh
yarn g:playwright
```

To debug a specific test:

```sh
yarn g:playwright --debug playwright/table.spec.ts
```

You can use Playwright's [codegen](https://playwright.dev/docs/codegen)
feature by running:

```sh
yarn playwright codegen
```

#### Updating Tests

Before any contributions are submitted in a PR, make sure to add or
update meaningful tests. A PR that has failing tests will be regarded as
a “Work in Progress” and will not be merged until all tests pass. When
creating new unit test files, the tests should adhere to a particular
folder structure and naming convention, as defined below.

```sh
# Proper naming convention and structure for test files
+-- filename_to_test.spec.ts
```

When using `slate-hyperscript`, include this at the top of the file:

```ts
/** @jsx jsx */

import { jsx } from "@udecode/plate-test-utils";

jsx;
```

Example of `input` and `output` being an editor containing one
paragraph:

```ts
const input = ((
  <editor>
    <hp>test</hp>
  </editor>
) as any) as PlateEditor;

const output = ((
  <editor>
    <hp>test</hp>
  </editor>
) as any) as PlateEditor;

it("should be", () => {
  expect(input).toEqual(output);
});
```

## Release Guide

This section is for anyone wanting a release. The current release
sequence is as follows:

- Commit your changes:
  - If you want to synchronize the exports, run `yarn cti` to
    automatically update the index files.
  - Lint, test, build should pass.
- Open a PR against `main` and
  [add a changeset](https://github.com/atlassian/changesets/blob/main/docs/adding-a-changeset.md).
- To create a [snapshot release](https://github.com/atlassian/changesets/blob/main/docs/snapshot-releases.md), maintainers can comment a GitHub
  issue starting with `/release:next`.
- Merge the PR, triggering the bot to create a PR release.
- Review the final changesets.
- Merge the PR release, triggering the bot to release the updated
  packages on npm.

## Pull Requests (PRs)

We welcome all contributions. There are many ways you can help us. This
is few of those ways:

Before you submit a new PR, please run `yarn g:prerelease`. Do not submit
a PR if tests are failing. If you need any help, the best way is to
[join Plate's Discord and ask in the #contributing channel](https://discord.gg/mAZRuBzGM3).

You miss time/knowledge but still want to contribute? Just open a PR or
a gist on Discord and we'll try to help.

### Reviewing PRs

**As a PR submitter**, you should reference the issue if there is one,
include a short description of what you contributed and, if it is a code
change, instructions for how to manually test out the change. This is
informally enforced by our
[PR template](https://github.com/udecode/plate/blob/main/.github/PULL_REQUEST_TEMPLATE.md).
If your PR is reviewed as only needing trivial changes (e.g. small typos
etc), and you have commit access then you can merge the PR after making
those changes.

**As a PR reviewer**, you should read through the changes and comment on
any potential problems. If you see something cool, a kind word never
hurts either! Additionally, you should follow the testing instructions
and manually test the changes. If the instructions are missing, unclear,
or overly complex, feel free to request better instructions from the
submitter. Unless the PR is a draft, if you approve the review and there
is no other required discussion or changes, you should also go ahead and
merge the PR.

## Issue Triage

If you are looking for a way to help the project, triaging issues is a
great place to start. Here's how you can help:

### Responding to questions

[Q&A](https://github.com/udecode/plate/discussions/categories/q-a) is a
great place to help. If you can answer a question, it will help the
asker as well as anyone who has a similar question. Also in the future
if anyone has that same question they can easily find it by searching.
If an issue needs reproduction, you may be able to guide the reporter
toward one, or even reproduce it yourself using
[this technique](https://github.com/udecode/plate/blob/main/CONTRIBUTING.md#reproductions).

### Triaging issues

Once you've helped out on a few issues, if you'd like triage access you
can help label issues and respond to reporters.

We use the following label scheme to categorize issues:

- **type** - `bug`, `feature`, `dependencies`, `maintenance`.
- **area** - `plugin:x`, `plugin:list`, `plugin:common`, `ui`, etc.
- **status** - `needs reproduction`, etc.

All issues should have a `type` label.
`dependencies` is for keeping package dependencies up to date.
`maintenance` is a catch-all for any kind of cleanup or refactoring.

They should also have one or more `area`/`status` labels. We use these
labels to filter issues down so we can see all of the issues for a
particular area, and keep the total number of open issues under control.

For example, here is the list of
[open, untyped issues](https://github.com/udecode/plate/issues?utf8=%E2%9C%93&q=is%3Aissue%20is%3Aopen%20-label%3A%22bug%22%20-label%3A%22discussion%22%20-label%3A%22feature%22%20-label%3A%22maintenance%22%20-label%3A%22question%20%2F%20support%22%20-label%3A%22documentation%22%20-label%3A%22greenkeeper%22).
For more info see
[searching issues](https://help.github.com/articles/searching-issues/)
in the GitHub docs.

If an issue is a `bug`, and it doesn't have a clear reproduction that
you have personally confirmed, label it `needs reproduction` and ask the
author to try and create a reproduction, or have a go yourself.

### Closing issues

- Duplicate issues should be closed with a link to the original.
- Unreproducible issues should be closed if it's not possible to
  reproduce them (if the reporter drops offline, it is reasonable to
  wait 2 weeks before closing).
- `bug`s should be closed when the issue is fixed and released.
- `feature`s, `maintenance`s, should be closed when released or if the
  feature is deemed not appropriate.

