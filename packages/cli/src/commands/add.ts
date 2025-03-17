import path from "path"
import { runInit } from "@/src/commands/init"
import { preFlightAdd } from "@/src/preflights/preflight-add"
import {
  getRegistryIndex,
  REGISTRY_MAP,
  REGISTRY_URL,
} from "@/src/registry/api"
import { addComponents } from "@/src/utils/add-components"
import { createProject } from "@/src/utils/create-project"
import * as ERRORS from "@/src/utils/errors"
import {
  getConfig,
  resolveConfigPaths,
  type Config,
} from "@/src/utils/get-config"
import { handleError } from "@/src/utils/handle-error"
import { highlighter } from "@/src/utils/highlighter"
import { logger } from "@/src/utils/logger"
import { updateAppIndex } from "@/src/utils/update-app-index"
import { Command } from "commander"
import prompts from "prompts"
import { z } from "zod"
import deepmerge from "deepmerge"

const DEPRECATED_COMPONENTS = [
  {
    name: "toast",
    deprecatedBy: "sonner",
    message:
      "The toast component is deprecated. Use the sonner component instead.",
  },
  {
    name: "toaster",
    deprecatedBy: "sonner",
    message:
      "The toaster component is deprecated. Use the sonner component instead.",
  },
]

export const addOptionsSchema = z.object({
  components: z.array(z.string()).optional(),
  yes: z.boolean(),
  overwrite: z.boolean(),
  cwd: z.string(),
  all: z.boolean(),
  path: z.string().optional(),
  silent: z.boolean(),
  srcDir: z.boolean().optional(),
  registry: z.string().optional(),
  list: z.boolean().optional(),
})

export const add = new Command()
  .name("add")
  .description("add a component to your project")
  .argument(
    "[components...]",
    "the components to add or a url to the component. Use prefix (eg. plate/editor) to specify registry"
  )
  .option("-y, --yes", "skip confirmation prompt.", false)
  .option("-o, --overwrite", "overwrite existing files.", false)
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("-a, --all", "add all available components", false)
  .option("-p, --path <path>", "the path to add the component to.")
  .option("-s, --silent", "mute output.", false)
  .option(
    "--src-dir",
    "use the src directory when creating a new project.",
    false
  )
  .option("-r, --registry <registry>", "registry name or url")
  .option("-l, --list", "list all available registries", false)
  .action(async (components, opts) => {
    try {
      // DIFF START
      let registry = opts.registry
      const prefixedComponents = components.map((component: any) => {
        const [prefix, name] = component.split("/")

        if (name && REGISTRY_MAP[prefix as keyof typeof REGISTRY_MAP]) {
          registry = prefix

          return name
        }

        return component
      })

      const options = addOptionsSchema.parse({
        components: prefixedComponents,
        cwd: path.resolve(opts.cwd),
        registry,
        ...opts,
      })
      // DIFF END

      // Confirm if user is installing themes.
      // For now, we assume a theme is prefixed with "theme-".
      const isTheme = options.components?.some((component) =>
        component.includes("theme-")
      )
      if (!options.yes && isTheme) {
        logger.break()
        const { confirm } = await prompts({
          type: "confirm",
          name: "confirm",
          message: highlighter.warn(
            "You are about to install a new theme. \nExisting CSS variables will be overwritten. Continue?"
          ),
        })
        if (!confirm) {
          logger.break()
          logger.log("Theme installation cancelled.")
          logger.break()
          process.exit(1)
        }
      }

      let { errors, config } = await preFlightAdd(options)

      // No components.json file. Prompt the user to run init.
      if (
        !config ||
        errors[ERRORS.MISSING_CONFIG] ||
        errors[ERRORS.MISSING_REGISTRY]
      ) {
        const { proceed } = await prompts({
          type: "confirm",
          name: "proceed",
          message: errors[ERRORS.MISSING_REGISTRY]
            ? `You need to add ${highlighter.info(
                `${options.registry}`
              )} registry to your config. Proceed?`
            : `You need to create a ${highlighter.info(
                "components.json"
              )} file to add components. Proceed?`,
          initial: true,
        })

        if (!proceed) {
          logger.break()
          process.exit(1)
        }

        // DIFF
        let url = options.registry

        if (url) {
          url = REGISTRY_MAP[url as keyof typeof REGISTRY_MAP] ?? url
        }

        config = await runInit({
          cwd: options.cwd,
          yes: true,
          force: true,
          defaults: false,
          skipPreflight: false,
          silent: true,
          isNewProject: false,
          srcDir: options.srcDir,
          name: options.registry,
          url,
        })

        options.cwd = config?.resolvedPaths.cwd ?? options.cwd
        const res = await preFlightAdd(options)
        // config = res.config!;
        errors = res.errors!
      }

      // DIFF
      const registryConfig = await getRegistryConfig(config!, options)

      if (!options.components?.length) {
        options.components = await promptForRegistryComponents(
          options,
          registryConfig.url ?? REGISTRY_URL
        )
      }

      const deprecatedComponents = DEPRECATED_COMPONENTS.filter((component) =>
        options.components?.includes(component.name)
      )

      if (deprecatedComponents?.length) {
        logger.break()
        deprecatedComponents.forEach((component) => {
          logger.warn(highlighter.warn(component.message))
        })
        logger.break()
        process.exit(1)
      }

      let shouldUpdateAppIndex = false
      if (errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT]) {
        const { projectPath, projectType } = await createProject({
          cwd: options.cwd,
          force: options.overwrite,
          srcDir: options.srcDir,
          components: options.components,
        })
        if (!projectPath) {
          logger.break()
          process.exit(1)
        }
        options.cwd = projectPath

        if (projectType === "monorepo") {
          options.cwd = path.resolve(options.cwd, "apps/web")
          config = await getConfig(options.cwd)
        } else {
          // DIFF
          let url = options.registry

          if (url) {
            url = REGISTRY_MAP[url as keyof typeof REGISTRY_MAP] ?? url
          }

          config = await runInit({
            cwd: options.cwd,
            yes: true,
            force: true,
            defaults: false,
            skipPreflight: true,
            silent: true,
            isNewProject: true,
            srcDir: options.srcDir,
            name: options.registry,
            url,
          })

          shouldUpdateAppIndex =
            options.components?.length === 1 &&
            !!options.components[0].match(/\/chat\/b\//)
        }
      }

      if (!config) {
        throw new Error(
          `Failed to read config at ${highlighter.info(options.cwd)}.`
        )
      }

      await addComponents(options.components, registryConfig, options)

      // If we're adding a single component and it's from the v0 registry,
      // let's update the app/page.tsx file to import the component.
      if (shouldUpdateAppIndex) {
        await updateAppIndex(options.components[0], config)
      }
    } catch (error) {
      logger.break()
      handleError(error)
    }
  })

// DIFF NEW
async function getRegistryConfig(
  config: Config,
  opts: z.infer<typeof addOptionsSchema>
): Promise<Config> {
  const { registry } = opts

  if (
    opts.list &&
    config.registries &&
    Object.keys(config.registries).length > 0
  ) {
    const { selectedRegistry } = await prompts({
      choices: [
        { title: "default", value: "default" },
        ...Object.entries(config.registries).map(([name]) => ({
          title: name,
          value: name,
        })),
      ],
      message: "Select a registry:",
      name: "selectedRegistry",
      type: "select",
    })

    return selectedRegistry === "default"
      ? { ...config }
      : await resolveConfigPaths(
          opts.cwd,
          deepmerge(config, config.registries[selectedRegistry]) as Config
        )
  }
  // If a registry is specified
  if (registry) {
    // If it's a URL, use it directly

    if (registry.startsWith("http://") || registry.startsWith("https://")) {
      // Find registry by url

      if (config.registries) {
        const registryConfig = Object.values(config.registries)?.find(
          (reg) => reg.url === registry
        )

        if (registryConfig) {
          return await resolveConfigPaths(
            opts.cwd,
            deepmerge(config, registryConfig) as Config
          )
        }
      }

      return { ...config, url: registry }
    }
    // If it's a named registry in the config, use that
    if (config.registries?.[registry]) {
      return await resolveConfigPaths(
        opts.cwd,
        deepmerge(config, config.registries[registry]) as Config
      )
    }

    // If it's neither a URL nor a known registry name, warn the user and fallback to the default config
    logger.warn(
      `Registry "${registry}" not found in configuration. Using the default registry.`
    )

    return { ...config }
  }

  // If no registry is specified and no registries in config, use the default config
  return { ...config }
}

async function promptForRegistryComponents(
  options: z.infer<typeof addOptionsSchema>,
  registryUrl: string
) {
  const registryIndex = await getRegistryIndex(registryUrl)
  if (!registryIndex) {
    logger.break()
    handleError(new Error("Failed to fetch registry index."))
    return []
  }

  if (options.all) {
    return registryIndex
      .map((entry) => entry.name)
      .filter(
        (component) => !DEPRECATED_COMPONENTS.some((c) => c.name === component)
      )
  }

  if (options.components?.length) {
    return options.components
  }

  const { components } = await prompts({
    type: "multiselect",
    name: "components",
    message: "Which components would you like to add?",
    hint: "Space to select. A to toggle all. Enter to submit.",
    instructions: false,
    choices: registryIndex
      .filter(
        (entry) =>
          entry.type === "registry:ui" &&
          !DEPRECATED_COMPONENTS.some(
            (component) => component.name === entry.name
          )
      )
      .map((entry) => ({
        title: entry.name,
        value: entry.name,
        selected: options.all ? true : options.components?.includes(entry.name),
      })),
  })

  if (!components?.length) {
    logger.warn("No components selected. Exiting.")
    logger.info("")
    process.exit(1)
  }

  const result = z.array(z.string()).safeParse(components)
  if (!result.success) {
    logger.error("")
    handleError(new Error("Something went wrong. Please try again."))
    return []
  }
  return result.data
}
