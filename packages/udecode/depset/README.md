# depset

A command-line tool to synchronize package dependencies in your `package.json` to their latest versions, a specific target version, or versions matching a pattern.

## Invocation

Run `depset` using your preferred package manager:

- **npx:**
  ```bash
  npx depset@latest [args...]
  ```
- **pnpm:**
  ```bash
  pnpm dlx depset@latest [args...]
  ```
- **yarn:**
  ```bash
  yarn dlx depset@latest [args...]
  ```
- **bun:**
  ```bash
  pnpm dlx depset@latest [args...]
  ```

## Usage

```bash
depset [package-specifier] [target-version] [options]
```

## Arguments

- **`[package-specifier]`** (Optional)\
  The package name or pattern to target. If omitted (and `--yes` is not used), you will be prompted.

  - **Exact Name:** e.g., `lodash`, `@babel/core`
  - **Scope:** e.g., `@myorg` (targets packages like `@myorg/component-a`, `@myorg/utils`)
  - **Prefix:** e.g., `eslint-*` (targets packages like `eslint-plugin-react`, `eslint-config-next`)

- **`[target-version]`** (Optional)\
  The maximum version to synchronize to (e.g., "1", "1.2", "1.2.3"). If omitted (and neither `--latest` nor `--yes` are used), you will be prompted. If `--latest` is used, this is ignored.

## Options

```txt
Usage: depset [options] [package-specifier] [target-version]

Synchronize package dependencies to their latest or a specific version.

Arguments:
  package-specifier   Package name or pattern (e.g., "@scope/foo*", "my-package", "@myorg").
                      Prompts if not provided (unless -y is used).
  target-version      Target version (e.g., "1.2.3"). Prompts if not provided (unless -L or -y is used).
                      Defaults to latest if left blank in prompt or if -L is used.

Options:
  -L, --latest        Use the latest version, skip version prompt. (default: false)
  -i, --install       Automatically run install after updating package.json. (default: false)
  -y, --yes           Skip all confirmation prompts. (default: false)
  -c, --cwd <path>    Set the current working directory. (default: current directory)
  -s, --silent        Silence all output except for errors. (default: false)
  -v, --version       Display the version number.
  -h, --help          Display help for command.
```

## Examples

1.  **Sync `lodash` to its latest version (prompts for version if not specified with `--latest`):**

    ```bash
    npx depset@latest lodash
    ```

2.  **Sync all packages in the `@babel` scope to their absolute latest versions, and install, skipping all prompts:**

    ```bash
    npx depset@latest @babel --latest --install --yes
    ```

3.  **Sync packages starting with `eslint-` up to version `8.50.0`:**

    ```bash
    npx depset@latest "eslint-*" 8.50.0
    ```

    _(You will be prompted to confirm changes and installation unless `-y` is used)_

4.  **Run interactively, prompting for all inputs:**
    ```bash
    npx depset@latest
    ```
