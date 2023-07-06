# Contributing

Thank you for your interest in helping to improve **`plate`**! As a community-led project, we wholeheartedly welcome all kinds of contributions. This includes everything from participating in discussions and improving documentation, to fixing bugs and enhancing features.

This document will provide guidance to help streamline the process and make efficient use of everyone's valuable time.

## **Issues**

No software is without bugs. If you encounter a problem, please follow these steps:

- Look through our **[issue list](https://github.com/udecode/plate/issues?utf8=%E2%9C%93&q=)** to see if the issue already exists.
  - If you find an existing issue that matches yours, please give it a "thumbs-up reaction". This helps us prioritize which issues to address first!
- If you can't find a match, feel free to create a new issue.

### **Reproductions**

The best way to help us understand and fix your issue is to provide a minimal reproduction of the problem. You can do this using **[our CodeSandbox](https://codesandbox.io/s/github/udecode/plate-playground)**.

### Development Guide

### **Initial Setup**

### Yarn

This repo uses yarn workspaces. You'll need to install **`yarn`** as your package manager. Check out the **[installation guide](https://yarnpkg.com/en/docs/install)** for help.

### Clone

Clone the repo by running the following command:

```bash
git clone https://github.com/udecode/plate.git
```

### Install & Build

Navigate to the project's root directory and run the following commands:

```bash
cd plate
yarn install
yarn build
```

### **Development**

To start the NextJS app on your local machine, use:

```bash
yarn dev
```

If you'd like to monitor a specific package for changes, run:

```bash
yarn workspace <package> build:watch
```

### How to: Create a Component

- Create your component in `apps/www/src/registry/default/plate-ui`
- Add your component to `apps/www/src/registry/registry.ts`
- Run `yarn build:registry`

To try installing your component locally:

- `cd templates/plate-playground`
- `yarn g:plate-ui add <component-name>`

### **How to: Docs**

Adding a new value? Here's the process:

- Create the value in **`/apps/www/src/lib/plate/demo/values`**
- Add your value to **`/apps/www/src/config/setting-values.ts`**
- Add your value to **`/apps/www/src/lib/plate/demo/values/usePlaygroundValue.ts`**

Creating a new plugin?

- Add your plugin to **`/apps/www/src/config/setting-plugins.ts`**
- Add your plugin to **`/apps/www/src/registry/default/example/playground-demo.tsx`**

Creating a new document?

- Create a new mdx file in **`/apps/www/content/docs`**
- Add the new document to **`/apps/www/src/config/docs.ts`**

### How to: Create a Plate Package

Use the command below and follow the prompts to create a new package:

```bash
yarn gen:package
```

After creating your package, install and build it:

```bash
yarn install
yarn build
```

### Run Linter

We use ESLint as our code linter (for all code, including TypeScript). To run the linter, use the following command:

```bash
yarn lint
# or
yarn lint:fix
```

### Run Unit Tests

To list all test suites and options for running tests, use:

```bash
yarn test
```

There are various modes available for running tests, including **`--watch`**, **`--coverage`**, and **`--runInBand`**. These can be selected from the command line interface or passed to **`yarn test`** as specific parameters.

### Run Playwright Tests

We use Playwright for our end-to-end (e2e) tests in headless browsers. The React app for these tests is located in **`/apps/e2e-examples`**.

To install Playwright's browsers and dependencies, use:

```bash
yarn install:playwright # first time
```

To run all tests:

```bash
yarn playwright
```

For further details, refer to the specific sections in the original document.

### Updating Tests

Before submitting any contributions in a PR, please add or update meaningful tests. If your PR has failing tests, it will be considered as “Work in Progress” and won't be merged until all tests pass.

For further details on how to add tests, refer to the specific sections in the original document.

## Rel**ease Guide**

For those wanting a release, follow this sequence:

- Commit your changes:
  - Run **`yarn brl`** to synchronize the exports and automatically update the index files.
  - Make sure lint, test, and build pass.
- Open a PR against **`main`** and **[add a changeset](https://github.com/atlassian/changesets/blob/main/docs/adding-a-changeset.md)**.
- To create a **[snapshot release](https://github.com/atlassian/changesets/blob/main/docs/snapshot-releases.md)**, maintainers can comment a GitHub issue starting with **`/release:next`**.
- Merge the PR, which will trigger the bot to create a PR release.
- Review the final changesets.
- Merge the PR release, and the bot will release the updated packages on npm.

## **Pull Requests (PRs)**

We welcome all contributions and there are many ways you can help. Before you submit a new PR, please run **`yarn prerelease`**. Do not submit a PR if tests are failing. If you need help, the best way is to **[join Plate's Discord and ask in the #contributing channel](https://discord.gg/mAZRuBzGM3)**.

You miss time/knowledge but still want to contribute? Just open a PR or a gist on Discord and we'll try to help.

### **Reviewing PRs**

**As a PR submitter**, you should reference the issue if there is one, include a short description of what you contributed, and provide instructions for manual testing if it is a code change. If your PR is reviewed as only needing trivial changes and you have commit access, then you can merge the PR after making those changes.

**As a PR reviewer**, read through the changes and comment on any potential problems. Also, follow the testing instructions and manually test the changes. If the instructions are missing, unclear, or overly complex, request better instructions from the submitter. Unless the PR is a draft, if you approve the review and there are no other required discussions or changes, you should also go ahead and merge the PR.

## **Issue Triage**

Helping with issue triaging is a great way to contribute:

### **Responding to questions**

The **[Q&A](https://github.com/udecode/plate/discussions/categories/q-a)** is a great place to help. If you can answer a question, it will benefit the asker and others who have a similar question. If an issue needs reproduction, you may be able to guide the reporter toward one, or even reproduce it yourself using **[this technique](https://github.com/udecode/plate/blob/main/CONTRIBUTING.md#reproductions)**.

### **Triaging issues**

Once you've helped out on a few issues, you can help label issues and respond to reporters. We use a label scheme to categorize issues:

- **type** - **`bug`**, **`feature`**, **`dependencies`**, **`maintenance`**.
- **area** - **`plugin:x`**, **`plugin:list`**, **`plugin:common`**, **`ui`**, etc.
- **status** - **`needs reproduction`**, etc.

All issues should have a **`type`** label. **`dependencies`** is for keeping package dependencies up to date and **`maintenance`** is a catch-all for any kind of cleanup or refactoring. They should also have one or more **`area`**/**`status`** labels. We use these labels to filter issues down so we can see all of the issues for a particular area and keep the total number of open issues under control. For more info see **[searching issues](https://help.github.com/articles/searching-issues/)** in the GitHub docs.

If an issue is a **`bug`**, and it doesn't have a clear reproduction that you have personally confirmed, label it **`needs reproduction`** and ask the author to try and create a reproduction, or have a go yourself.

### **Closing issues**

- Duplicate issues should be closed with a link to the original.
- Unreproducible issues should be closed if it's not possible to reproduce them. If the reporter drops offline, it is reasonable to wait 2 weeks before closing.
- **`bug`**s should be closed when the issue is fixed and released.
- **`feature`**s, **`maintenance`**s, should be closed when released or if the feature is deemed not appropriate.
