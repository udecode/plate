# 贡献指南

感谢您有兴趣帮助改进 **`plate`**！作为一个社区主导的项目，我们热烈欢迎各种形式的贡献。这包括从参与讨论和改进文档，到修复错误和增强功能的一切。

本文档将提供指导，帮助简化流程并有效利用每个人宝贵的时间。

## 关于本仓库

本仓库是一个 monorepo。

- 我们使用 [Bun](https://bun.sh) 和 [`workspaces`](https://bun.sh/docs/install/workspaces) 进行开发。
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
                    ├── example
                    └── ui
packages
└── core
```

| 路径                      | 描述                      |
| ------------------------- | ------------------------- |
| `apps/www/content`        | 网站的内容。              |
| `apps/www/src/app`        | 网站的 Next.js 应用程序。 |
| `apps/www/src/components` | 网站的 React 组件。       |
| `apps/www/src/registry`   | 组件的注册表。            |
| `packages/core`           | `@platejs/core` 包。      |

## 开发

### 首先克隆仓库：

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

### 运行工作区

您可以使用 `turbo --filter=[WORKSPACE]` 命令来启动工作区的开发过程。

#### Examples

1. 运行 `platejs.org` 网站：

```
turbo --filter=www dev
```

2. 构建 `@platejs/core` 包：

```
turbo --filter=@platejs/core build
```

## 文档

本项目的文档位于 `www` 工作区中。运行 `bun run build` 后，您可以通过运行以下命令在本地运行文档：

```bash
bun run dev
```

文档使用 [MDX](https://mdxjs.com) 编写。您可以在 `docs` 目录中找到文档文件。

**在每次包更新后重新运行以下命令：**

```bash
turbo --filter=[PACKAGE] build
bun run dev
```

## 组件

我们使用注册表系统来开发组件。您可以在 `apps/www/src/registry` 下找到组件的源代码。这些组件按样式进行组织。

```bash
apps
└── www
    └── registry
        │   ├── example
        │   └── ui
```

添加或修改组件时，请确保更新相应的文档。

### 运行代码检查器

我们使用 [Biome](https://biomejs.dev/) 作为代码检查器。要运行代码检查器，请使用以下命令：

```bash
bun run lint
# autofix with:
bun run lint:fix
```

## 测试

### 运行单元测试

测试使用 [Jest](https://jestjs.io/) 编写。您可以从仓库的根目录运行所有测试。

```bash
bun run test
```

运行测试有多种模式可用，包括 **`--watch`**、**`--coverage`** 和 **`--runInBand`**。这些可以从命令行界面选择或作为特定参数传递给 **`bun run test`**。

请确保在提交拉取请求时测试通过。如果您添加新功能，请包含测试。

### 运行 Playwright 测试

我们使用 Playwright 在无头浏览器中进行端到端 (e2e) 测试。

要安装 Playwright 的浏览器和依赖项，请使用：

```bash
bun playwright install # first time
```

To run all tests:

```bash
bun run e2e
```
