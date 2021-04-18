---
title: Contributing
---

Thanks for your interest in improving `slate-plugins`! We are a
community-driven project and welcome contributions of all kinds: from
discussion to documentation to bugfixes to feature improvements.

Please review this document to help to streamline the process and save
everyone's precious time.

This repo uses yarn workspaces, so you should install `yarn` as the
package manager. See
[installation guide](https://yarnpkg.com/en/docs/install).

## Issues

No software is bug-free. So, if you got an issue, follow these steps:

- Search the
  [issue list](https://github.com/udecode/slate-plugins/issues?utf8=%E2%9C%93&q=)
  for current and old issues.
  - If you find an existing issue, please UPVOTE the issue by adding a
    "thumbs-up reaction". We use this to help prioritize issues!
- If none of that is helping, create an issue with the following
  information:
  - Clear title (shorter is better).
  - Describe the issue in clear language.
  - Share error logs, screenshots and etc.
  - To speed up the issue fixing process, send us the steps to reproduce
    or a sample repo with the issue you faced:

### Testing against `next`

To test your project against the current latest version of
`slate-plugins`, you can clone the repository and link it with
`yarn`. Try following these steps:

#### 1. Download the latest version of this project, and build it:

```sh
git clone https://github.com/udecode/slate-plugins.git
cd slate-plugins
yarn
```

#### 2a. Run unit tests

<!--You can use one of the example projects in `examples/` to develop on.-->

This command will list all the suites and options for running tests.

```sh
yarn test
```

The options for running tests can be selected from the cli or be passed
to `yarn test` with specific parameters. Available modes include
`--watch`, `--coverage`, and `--runInBand`, which will respectively run
tests in watch mode, output code coverage, and run selected test suites
serially in the current process.

<!--You can use the `--update` flag to update snapshots or screenshots as-->
<!--needed.-->

<!--You can also pick suites from CLI. Suites available are listed below.-->

<!--##### Core & Examples Tests-->

<!--`yarn test --core`-->

<!--This option executes tests from `<rootdir>/app/react`,-->
<!--`<rootdir>/app/vue`, and `<rootdir>/lib`. Before the tests are run, the-->
<!--project must be bootstrapped with core. You can accomplish this with-->
<!--`yarn bootstrap --core`-->

#### 2b. Run Linter

We use eslint as a linter for all code (including typescript code).

All you have to run is:

```sh
yarn lint --fix
```

It can be immensely helpful to get feedback in your editor, if you're
using VSCode, you should install the `eslint` plugin and configure it
with these settings:

```json
// .vscode/settings.json
{
  "eslint.packageManager": "yarn",
  "eslint.options": {
    "cache": true,
    "cacheLocation": ".cache/eslint",
    "extensions": [".js", ".jsx", ".mjs", ".json", ".ts", ".tsx"]
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.alwaysShowStatus": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

This should enable auto-fix for all source files, and give linting
warnings and errors within your editor.

If you're using WebStorm, you should enable `Run eslint --fix on save`
in your settings.

### Reproductions

The best way to help figure out an issue you are having is to produce a
minimal reproduction using
[our CodeSandbox](https://codesandbox.io/s/slate-plugins-playground-v1-2mh1c)

### Updating Tests

Before any contributions are submitted in a PR, make sure to add or
update meaningful tests. A PR that has failing tests will be regarded as
a “Work in Progress” and will not be merged until all tests pass. When
creating new unit test files, the tests should adhere to a particular
folder structure and naming convention, as defined below.

```sh
# Proper naming convention and structure for test files
+-- filename_to_test.spec.ts
```

Write your tests using the following convention (if only one case):

```ts
const input = 1;

const output = 1;

it("should be", () => {
  expect(input).toEqual(output);
});
```

When using `slate-hyperscript`, include this at the top of the file:

```ts
/** @jsx jsx */

import { jsx } from "@udecode/slate-plugins-test-utils";

jsx;
```

Example of `input` and `output` being an editor containing one
paragraph:

```ts
const input = ((
  <editor>
    <hp>test</hp>
  </editor>
) as any) as Editor;

const output = ((
  <editor>
    <hp>test</hp>
  </editor>
) as any) as Editor;
```

## Pull Requests (PRs)

We welcome all contributions. There are many ways you can help us. This
is few of those ways:

Before you submit a new PR, make sure you run `yarn test`. Do not submit
a PR if tests are failing. If you need any help, the best way is to
[join slate's Slack and ask in the `slate-plugins` channel](https://app.slack.com/client/T1RFVK5FV/C013QHXSCG1).

### Reviewing PRs

**As a PR submitter**, you should reference the issue if there is one,
include a short description of what you contributed and, if it is a code
change, instructions for how to manually test out the change. This is
informally enforced by our
[PR template](https://github.com/udecode/slate-plugins/blob/master/.github/PULL_REQUEST_TEMPLATE.md).
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

[Q&A](https://github.com/udecode/slate-plugins/discussions/categories/q-a) is a
great place to help. If you can answer a question, it will help the
asker as well as anyone who has a similar question. Also in the future
if anyone has that same question they can easily find it by searching.
If an issue needs reproduction, you may be able to guide the reporter
toward one, or even reproduce it yourself using
[this technique](https://github.com/udecode/slate-plugins/blob/master/CONTRIBUTING.md#reproductions).

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
[open, untyped issues](https://github.com/udecode/slate-plugins/issues?utf8=%E2%9C%93&q=is%3Aissue%20is%3Aopen%20-label%3A%22bug%22%20-label%3A%22discussion%22%20-label%3A%22feature%22%20-label%3A%22maintenance%22%20-label%3A%22question%20%2F%20support%22%20-label%3A%22documentation%22%20-label%3A%22greenkeeper%22).
For more info see
[searching issues](https://help.github.com/articles/searching-issues/)
in the Github docs.

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

## Development Guide

### Prerequisites

Please have the **_latest_** stable versions of the following on your
machine

- node
- yarn

### Initial Setup

If you run into trouble here, make sure your node, npm, and **_yarn_**
are on the latest versions (yarn at least v1.3.2).

1. `cd ~` (optional)
2. `git clone https://github.com/udecode/slate-plugins.git` _bonus_: use your own fork for this step
3. `cd slate-plugins`
4. `yarn install`
5. `yarn build` once
6. Run storybook: a) if editing package source files, watch both these
   files and the stories: `yarn storybook:w` b) otherwise, just watch
   the stories by running: `yarn storybook`

### Working with Storybook

Within the `stories` folder, you will find examples of plugins
implementations.

These show many of the options and plugins available. We highly
encourage you to use these to develop/test contributions on.

## Release Guide

This section is for maintainers who will be creating releases. It
assumes:

- yarn >= 1.3.2

The current manual release sequence is as follows:

- If you want to synchronize the exports, run `yarn cti` to
  automatically update the index files.
- Lint, test, build locally.
- To create a release PR with GitHub Actions, comment a GitHub issue
  starting by:
  - `/create release patch` for patch version.
  - `/create release minor` for minor version.
- Once the release PR is created, set the changelog in the description
  content as it will be published on release page.
- If the checks pass, the owners of the repository can merge the release
  PR so it will automatically release the new version on npm and GitHub.

