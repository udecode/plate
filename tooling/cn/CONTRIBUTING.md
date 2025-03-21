# 贡献指南

感谢您有兴趣帮助改进 **`plate`**！作为一个社区主导的项目，我们热烈欢迎各种形式的贡献。这包括从参与讨论和改进文档，到修复错误和增强功能的一切。

本文档将提供指导，帮助简化流程并有效利用每个人宝贵的时间。

## 关于本仓库

本仓库是一个 monorepo。

- 我们使用 [yarn](https://yarnpkg.com/en/docs/install) 和 [`workspaces`](https://yarnpkg.com/features/workspaces) 进行开发。
- 我们使用 [tsup](https://tsup.egoist.dev/) 作为我们的构建系统。
- 我们使用 [changesets](https://github.com/changesets/changesets) 管理发布。

## 结构

本仓库的结构如下：

```
apps
└── www
    ├── content
    └── src
        └── app
            ├── components
            └── registry
                └── default
                    ├── example
                    └── plate-ui
packages
└── core
```

| 路径                      | 描述                                    |
| ------------------------- | --------------------------------------- |
| `apps/www/content`        | 网站的内容。                            |
| `apps/www/src/app`        | 网站的 Next.js 应用程序。               |
| `apps/www/src/components` | 网站的 React 组件。                     |
| `apps/www/src/registry`   | 组件的注册表。                          |
| `packages/core`           | `@udecode/plate-core` 包。              |
## 开发

### 首先克隆仓库：

```bash
git clone git@github.com:udecode/plate.git
```

### Install

```bash
yarn install
```

### Build

```bash
yarn build
```

### 运行工作区

您可以使用 `turbo --filter=[WORKSPACE]` 命令来启动工作区的开发过程。

#### Examples

1. 运行 `platejs.org` 网站：

```
turbo --filter=www dev
```

2. 构建 `@udecode/plate-core` 包：

```
turbo --filter=@udecode/plate-core build
```

## 文档

本项目的文档位于 `www` 工作区中。运行 `yarn build` 后，您可以通过运行以下命令在本地运行文档：

```bash
yarn dev
```

文档使用 [MDX](https://mdxjs.com) 编写。您可以在 `apps/www/content/docs` 目录中找到文档文件。

**在每次包更新后重新运行以下命令：**

```bash
turbo --filter=[PACKAGE] build
yarn dev
```
## 组件

我们使用注册表系统来开发组件。您可以在 `apps/www/src/registry` 下找到组件的源代码。这些组件按样式进行组织。

```bash
apps
└── www
    └── registry
        ├── default
        │   ├── example
        │   └── plate-ui
```

添加或修改组件时，请确保更新相应的文档。

## CLI

`shadcx` 包是一个用于向项目添加组件的命令行工具。您可以在[这里](https://platejs.org/docs/components/cli)找到 CLI 的文档。

对 CLI 的任何更改都应在 `packages/plate-ui` 目录中进行。如果可能的话，最好为您的更改添加测试。

### 运行代码检查器

我们使用 [ESLint](https://eslint.org/) 作为代码检查器。要运行代码检查器，请使用以下命令：

```bash
yarn lint
# autofix with:
yarn lint:fix
```

## 测试

### 运行单元测试

测试使用 [Jest](https://jestjs.io/) 编写。您可以从仓库的根目录运行所有测试。

```bash
yarn test
```
运行测试有多种模式可用，包括 **`--watch`**、**`--coverage`** 和 **`--runInBand`**。这些可以从命令行界面选择或作为特定参数传递给 **`yarn test`**。

请确保在提交拉取请求时测试通过。如果您添加新功能，请包含测试。

### 运行 Playwright 测试

我们使用 Playwright 在无头浏览器中进行端到端 (e2e) 测试。

要安装 Playwright 的浏览器和依赖项，请使用：

```bash
yarn playwright install # first time
```

To run all tests:

```bash
yarn e2e
```
## 发布指南

对于想要发布的人，请按照以下步骤操作：

- 提交您的更改：
  - 运行 **`yarn brl`** 同步导出并自动更新索引文件。
  - 确保代码检查、测试和构建都通过。
- 向 **`main`** 分支提交PR并**[添加一个changeset](https://github.com/atlassian/changesets/blob/main/docs/adding-a-changeset.md)**。
- 合并PR，这将触发机器人创建一个发布PR。
- 审查最终的changesets。
- 合并发布PR，机器人将在npm上发布更新的包。

## 新功能请求

如果您有新功能请求，请在GitHub上开启一个讨论。我们很乐意帮助您。

## 问题

没有软件是没有bug的。如果您遇到问题，请按照以下步骤操作：

- 查看我们的**[问题列表](https://github.com/udecode/plate/issues?utf8=%E2%9C%93&q=)**，看看该问题是否已经存在。
  - 如果您找到与您的问题匹配的现有问题，请给它一个"点赞"反应。这有助于我们确定优先处理哪些问题！
- 如果您找不到匹配的问题，请随时创建一个新问题。

### 复现问题

帮助我们理解和修复您的问题的最佳方式是提供问题的最小复现。您可以使用**[我们的CodeSandbox](https://codesandbox.io/p/github/udecode/plate-template/main)**来做到这一点。

### 回答问题

**[问答区](https://github.com/udecode/plate/discussions/categories/q-a)**是一个很好的帮助场所。如果您能回答一个问题，它将使提问者和有类似问题的其他人受益。如果一个问题需要复现，您可以指导报告者进行复现，或者使用**[这种技术](https://github.com/udecode/plate/blob/main/tooling/CONTRIBUTING.md#reproductions)**自己复现它。

### 分类问题

一旦您在几个问题上提供了帮助，您可以帮助标记问题并回应报告者。我们使用标签方案来分类问题：

- **类型** - **`bug`**、**`feature`**、**`dependencies`**、**`maintenance`**。
- **领域** - **`plugin:x`**、**`plugin:list`**、**`plugin:common`**、**`ui`**等。
- **状态** - **`needs reproduction`**等。

所有问题都应该有一个**`type`**标签。**`dependencies`**用于保持包依赖关系的更新，**`maintenance`**是对任何类型的清理或重构的总称。它们还应该有一个或多个**`area`**/**`status`**标签。我们使用这些标签来过滤问题，以便我们可以看到特定领域的所有问题，并控制未解决问题的总数。有关更多信息，请参阅GitHub文档中的**[搜索问题](https://help.github.com/articles/searching-issues/)**。

如果一个问题是**`bug`**，并且没有您亲自确认的清晰复现，请标记为**`needs reproduction`**并要求作者尝试创建复现，或者自己尝试。

### 关闭问题

- 重复的问题应该关闭并链接到原始问题。
- 如果无法复现，则无法复现的问题应该被关闭。如果报告者离线，等待2周后关闭是合理的。
- 当问题修复并发布时，**`bug`**应该被关闭。
- 当发布或者功能被认为不合适时，**`feature`**、**`maintenance`**应该被关闭。

## 拉取请求(PRs)

我们欢迎所有贡献，有很多方式可以提供帮助。在提交新的PR之前，请运行**build**、**lint**和**test**。如果测试失败，请不要提交PR。如果您需要帮助，最好的方式是**[加入Plate的Discord并在#contributing频道提问](https://discord.gg/mAZRuBzGM3)**。

您缺少时间/知识但仍想贡献？只需在Discord上打开一个PR或gist，我们会尝试帮助您。

### 审查PRs

**作为PR提交者**，如果有相关问题，您应该引用该问题，包括您贡献内容的简短描述，如果是代码更改，请提供手动测试的说明。如果您的PR被审查为只需要进行微小更改，并且您有提交权限，那么在进行这些更改后，您可以合并PR。

**作为PR审查者**，阅读更改并评论任何潜在问题。此外，按照测试说明手动测试更改。如果说明缺失、不清楚或过于复杂，请向提交者请求更好的说明。除非PR是草稿，如果您批准了审查，并且没有其他必要的讨论或更改，您也应该继续合并PR。

## 指南

### 如何：创建组件

- 在`apps/www/src/registry/default/plate-ui`中创建您的组件
- 将您的组件添加到`apps/www/src/registry/registry.ts`
- 运行`yarn build:registry`

要在本地尝试安装您的组件：

- `cd templates/plate-playground`
- `yarn g:plate-ui add <component-name>`

### **如何：文档**

添加新值？以下是流程：

- 在**`/apps/www/src/lib/plate/demo/values`**中创建值
- 将您的值添加到**`/apps/www/src/config/setting-values.ts`**
- 将您的值添加到**`/apps/www/src/lib/plate/demo/values/usePlaygroundValue.ts`**

创建新插件？

- 将您的插件添加到**`/apps/www/src/config/setting-plugins.ts`**
- 将您的插件添加到**`/apps/www/src/registry/default/example/playground-demo.tsx`**

创建新文档？

- 在**`/apps/www/content/docs`**中创建一个新的mdx文件
- 将新文档添加到**`/apps/www/src/config/docs.ts`**

### 如何：创建Plate包

使用以下命令并按照提示创建新包：

```bash
yarn gen:package
```

After creating your package, install and build it:

```bash
yarn install
yarn build
```

### 如何：服务器打包

主要打包是客户端的，并未在服务器环境中测试。通常，当包的使用依赖于`slate-react`或React时，需要服务器打包。在这种情况下，以下是创建服务器打包的方法：

- 将所有支持服务器的文件移至`/src/shared`
- 将所有不支持服务器的文件移至`/src/client`
- 在`/src/server.ts`中创建一个新的入口文件，使用以下内容导出：

```ts
export * from './shared/index';
export * from './server/index'; // If needed
```
- （可选）如果需要，在`/src/server/`中创建服务器端版本。例如，`/src/server/withReact`中的`withReact`是`/src/client/withReact`的服务器端版本
- 运行`yarn brl`来同步导出
- 更新`package.json > exports`

```json
"exports": {
  ".": {
    "types": "./dist/index.d.ts",
    "import": "./dist/index.mjs",
    "module": "./dist/index.mjs",
    "require": "./dist/index.js"
  },
  "./server": {
    "types": "./dist/server.d.ts",
    "import": "./dist/server.mjs",
    "module": "./dist/server.mjs",
    "require": "./dist/server.js"
  }
},
```
