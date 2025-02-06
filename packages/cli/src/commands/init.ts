import { promises as fs } from "fs"
import path from "path"
import { preFlightInit } from "@/src/preflights/preflight-init"
import {
  getDefaultConfig,
  getRegistryBaseColors,
  getRegistryStyles,
  REGISTRY_MAP,
  REGISTRY_URL,
} from "@/src/registry/api"
import { addComponents } from "@/src/utils/add-components"
import { createProject } from "@/src/utils/create-project"
import * as ERRORS from "@/src/utils/errors"
import {
  DEFAULT_COMPONENTS,
  DEFAULT_TAILWIND_CONFIG,
  DEFAULT_TAILWIND_CSS,
  DEFAULT_UTILS,
  getConfig,
  rawConfigSchema,
  resolveConfigPaths,
  type Config,
} from "@/src/utils/get-config"
import {
  getProjectConfig,
  getProjectInfo,
  getProjectTailwindVersionFromConfig,
} from "@/src/utils/get-project-info"
import { handleError } from "@/src/utils/handle-error"
import { highlighter } from "@/src/utils/highlighter"
import { logger } from "@/src/utils/logger"
import { spinner } from "@/src/utils/spinner"
import { updateTailwindContent } from "@/src/utils/updaters/update-tailwind-content"
import { Command } from "commander"
import prompts from "prompts"
import { z } from "zod"
import deepmerge from "deepmerge"
import { url } from "inspector"

export const initOptionsSchema = z.object({
  cwd: z.string(),
  components: z.array(z.string()).optional(),
  yes: z.boolean(),
  defaults: z.boolean(),
  force: z.boolean(),
  silent: z.boolean(),
  isNewProject: z.boolean(),
  srcDir: z.boolean().optional(),
  url: z.string().optional(),
  name: z.string().optional(),
  pm: z.enum(["npm", "pnpm", "yarn", "bun"]).optional(),
})

export const init = new Command()
  .name("init")
  .description("initialize your project and install dependencies")
  .argument(
    "[components...]",
    "the components to add or a url to the component."
  )
  .option("-y, --yes", "skip confirmation prompt.", true)
  .option("-d, --defaults,", "use default configuration.", false)
  .option("-f, --force", "force overwrite of existing configuration.", false)
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("-s, --silent", "mute output.", false)
  .option(
    "--src-dir",
    "use the src directory when creating a new project.",
    false
  )
  .option("-n, --name <name>", "registry name")
  .option("--pm <pm>", "package manager to use (npm, pnpm, yarn, bun)")
  .action(async (components, opts) => {
    try {
      // DIFF START
      let url = REGISTRY_URL
      let name = opts.name

      let actualComponents = [...components]

      if (components.length > 0) {
        const registry =
          REGISTRY_MAP[components[0] as keyof typeof REGISTRY_MAP]

        if (registry) {
          url = registry
          name = components[0]
          actualComponents = components.slice(1)
        } else if (components[0].startsWith("http")) {
          url = components[0]
          name = components[0]
          actualComponents = components.slice(1)
        }
      }

      const options = initOptionsSchema.parse({
        cwd: path.resolve(opts.cwd),
        isNewProject: false,
        ...opts,
        components: actualComponents,
        name,
        url,
      })
      // DIFF END

      await runInit(options)

      logger.log(
        `${highlighter.success(
          "Success!"
        )} Project initialization completed.\nYou may now add components.`
      )
      logger.break()
    } catch (error) {
      logger.break()
      handleError(error)
    }
  })

export async function runInit(
  options: z.infer<typeof initOptionsSchema> & {
    skipPreflight?: boolean
  }
) {
  let projectInfo

  if (!options.skipPreflight) {
    const preflight = await preFlightInit(options)
    if (preflight.errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT]) {
      const { projectPath, projectType } = await createProject(options)
      if (!projectPath) {
        process.exit(1)
      }
      options.cwd = projectPath
      options.isNewProject = true
      if (projectType === "monorepo") {
        options.cwd = path.resolve(options.cwd, "apps/web")
        return await getConfig(options.cwd)
      }
    }
    projectInfo = preflight.projectInfo
  } else {
    projectInfo = await getProjectInfo(options.cwd)
  }

  const res = await getProjectConfig(options.cwd, projectInfo)
  let projectConfig: Config | undefined = res?.[0]
  const isNew = res?.[1]
  let config: Config
  let newConfig: Config | undefined
  let registryName: string | undefined

  if (projectConfig) {
    if (isNew || options.url === projectConfig.url) {
      if (options.url === projectConfig.url) {
        projectConfig = await getDefaultConfig(projectConfig, options.url!)
        // Updating top-level config
        config = (await promptForMinimalConfig(projectConfig, options)) as any
      } else {
        const { url, ...rest } = options
        newConfig = (await promptForMinimalConfig(
          await getDefaultConfig(projectConfig, options.url!),
          { ...rest }
        )) as any
        const res = await promptForNestedRegistryConfig(newConfig!, options)
        config = res.config
        registryName = res.name
      }
    } else {
      // Updating nested registry config
      const res = await promptForNestedRegistryConfig(projectConfig, options)
      config = res.config
      registryName = res.name
    }
  } else {
    // New configuration
    config = (await promptForConfig(
      await getConfig(options.cwd),
      options.url ?? REGISTRY_URL
    )) as any
  }

  if (!options.yes) {
    const { proceed } = await prompts({
      type: "confirm",
      name: "proceed",
      message: `Write configuration to ${highlighter.info(
        "components.json"
      )}. Proceed?`,
      initial: true,
    })

    if (!proceed) {
      process.exit(0)
    }
  }

  if (config.url === REGISTRY_URL) {
    delete config.url
  }

  // Write components.json.
  const componentSpinner = spinner(`Writing components.json.`).start()
  const targetPath = path.resolve(options.cwd, "components.json")
  await fs.writeFile(targetPath, JSON.stringify(config, null, 2), "utf8")
  componentSpinner.succeed()

  let registryConfig = config
  if (registryName) {
    const registry = config.registries?.[registryName]
    if (registry) {
      registryConfig = deepmerge(config, registry) as any
    }
  }

  // Add components.
  const fullConfig = await resolveConfigPaths(options.cwd, registryConfig)
  const components = ["index", ...(options.components || [])]

  if (newConfig) {
    await addComponents(
      components,
      await resolveConfigPaths(options.cwd, newConfig),
      {
        isNewProject:
          options.isNewProject || projectInfo?.framework.name === "next-app",
        // Init will always overwrite files.
        overwrite: true,
        silent: options.silent,
      }
    )
  }

  await addComponents(components, fullConfig, {
    isNewProject:
      options.isNewProject || projectInfo?.framework.name === "next-app",
    // Init will always overwrite files.
    overwrite: true,
    registryName,
    silent: options.silent,
  })

  // If a new project is using src dir, let's update the tailwind content config.
  // TODO: Handle this per framework.
  if (options.isNewProject && options.srcDir) {
    if (newConfig) {
      await updateTailwindContent(
        ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
        await resolveConfigPaths(options.cwd, newConfig),
        {
          silent: options.silent,
        }
      )
    }
    await updateTailwindContent(
      ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
      fullConfig,
      {
        silent: options.silent,
      }
    )
  }

  return fullConfig
}

async function promptForConfig(
  defaultConfig: Config | null = null,
  registryUrl: string
) {
  const [styles, baseColors] = await Promise.all([
    getRegistryStyles(registryUrl),
    getRegistryBaseColors(),
  ])

  logger.info("")
  const options = await prompts([
    {
      type: "toggle",
      name: "typescript",
      message: `Would you like to use ${highlighter.info(
        "TypeScript"
      )} (recommended)?`,
      initial: defaultConfig?.tsx ?? true,
      active: "yes",
      inactive: "no",
    },
    // DIFF
    ...(styles.length > 1
      ? [
          {
            type: "select",
            name: "style",
            message: `Which ${highlighter.info("style")} would you like to use?`,
            choices: styles.map((style) => ({
              title: style.label,
              value: style.name,
            })),
          },
        ]
      : ([] as any)),
    {
      type: "select",
      name: "tailwindBaseColor",
      message: `Which color would you like to use as the ${highlighter.info(
        "base color"
      )}?`,
      choices: baseColors.map((color) => ({
        title: color.label,
        value: color.name,
      })),
    },
    {
      type: "text",
      name: "tailwindCss",
      message: `Where is your ${highlighter.info("global CSS")} file?`,
      initial: defaultConfig?.tailwind.css ?? DEFAULT_TAILWIND_CSS,
    },
    {
      type: "toggle",
      name: "tailwindCssVariables",
      message: `Would you like to use ${highlighter.info(
        "CSS variables"
      )} for theming?`,
      initial: defaultConfig?.tailwind.cssVariables ?? true,
      active: "yes",
      inactive: "no",
    },
    {
      type: "text",
      name: "tailwindPrefix",
      message: `Are you using a custom ${highlighter.info(
        "tailwind prefix eg. tw-"
      )}? (Leave blank if not)`,
      initial: "",
    },
    {
      type: "text",
      name: "tailwindConfig",
      message: `Where is your ${highlighter.info(
        "tailwind.config.js"
      )} located?`,
      initial: defaultConfig?.tailwind.config ?? DEFAULT_TAILWIND_CONFIG,
    },
    {
      type: "text",
      name: "components",
      message: `Configure the import alias for ${highlighter.info(
        "components"
      )}:`,
      initial: defaultConfig?.aliases["components"] ?? DEFAULT_COMPONENTS,
    },
    {
      type: "text",
      name: "utils",
      message: `Configure the import alias for ${highlighter.info("utils")}:`,
      initial: defaultConfig?.aliases["utils"] ?? DEFAULT_UTILS,
    },
    {
      type: "toggle",
      name: "rsc",
      message: `Are you using ${highlighter.info("React Server Components")}?`,
      initial: defaultConfig?.rsc ?? true,
      active: "yes",
      inactive: "no",
    },
  ])

  return rawConfigSchema.parse({
    $schema: "https://ui.shadcn.com/schema.json",
    style: options.style ?? defaultConfig?.style ?? "default",
    tailwind: {
      config: options.tailwindConfig,
      css: options.tailwindCss,
      baseColor: options.tailwindBaseColor,
      cssVariables: options.tailwindCssVariables,
      prefix: options.tailwindPrefix,
    },
    rsc: options.rsc,
    tsx: options.typescript,
    aliases: {
      utils: options.utils,
      components: options.components,
      // TODO: fix this.
      lib: options.components.replace(/\/components$/, "lib"),
      hooks: options.components.replace(/\/components$/, "hooks"),
    },
    url: registryUrl,
  })
}

async function promptForMinimalConfig(
  defaultConfig: Config,
  opts: z.infer<typeof initOptionsSchema>
) {
  let style = defaultConfig.style
  let baseColor = defaultConfig.tailwind.baseColor
  let cssVariables = defaultConfig.tailwind.cssVariables

  if (!opts.defaults) {
    const [styles, baseColors, tailwindVersion] = await Promise.all([
      getRegistryStyles(opts.url ?? REGISTRY_URL),
      getRegistryBaseColors(),
      getProjectTailwindVersionFromConfig(defaultConfig),
    ])

    const options = await prompts([
      ...(styles.length > 1
        ? [
            {
              type: tailwindVersion === "v4" ? null : "select",
              name: "style",
              message: `Which ${highlighter.info("style")} would you like to use?`,
              choices: styles.map((style) => ({
                title:
                  style.name === "new-york"
                    ? "New York (Recommended)"
                    : style.label,
                value: style.name,
              })),
              initial: 0,
            },
          ]
        : ([] as any)),
      {
        type: "select",
        name: "tailwindBaseColor",
        message: `Which color would you like to use as the ${highlighter.info(
          "base color"
        )}?`,
        choices: baseColors.map((color) => ({
          title: color.label,
          value: color.name,
        })),
      },
      {
        type: "toggle",
        name: "tailwindCssVariables",
        message: `Would you like to use ${highlighter.info(
          "CSS variables"
        )} for theming?`,
        initial: defaultConfig?.tailwind.cssVariables,
        active: "yes",
        inactive: "no",
      },
    ])

    style = options.style ?? style
    baseColor = options.tailwindBaseColor
    cssVariables = options.tailwindCssVariables
  }

  return rawConfigSchema.parse({
    $schema: defaultConfig?.$schema,
    style,
    tailwind: {
      ...defaultConfig?.tailwind,
      baseColor,
      cssVariables,
    },
    rsc: defaultConfig?.rsc,
    tsx: defaultConfig?.tsx,
    aliases: defaultConfig?.aliases,
    iconLibrary: defaultConfig?.iconLibrary,
    url: opts.url,
  })
}

async function promptForNestedRegistryConfig(
  defaultConfig: Config,
  opts: z.infer<typeof initOptionsSchema>
) {
  const nestedDefaultConfig = await getDefaultConfig(
    { ...defaultConfig },
    opts.url ?? REGISTRY_URL
  )

  const name = opts.name ?? nestedDefaultConfig.name ?? opts.url!

  logger.info("Initializing " + name + " registry...")

  const newConfig = await promptForMinimalConfig(nestedDefaultConfig, opts)

  const relevantFields = ["style", "tailwind", "rsc", "tsx", "aliases"]

  const defaultConfigSubset = Object.fromEntries(
    relevantFields.map((field) => [field, defaultConfig[field as keyof Config]])
  ) as any

  const newConfigSubset = Object.fromEntries(
    relevantFields.map((field) => [field, newConfig[field as keyof Config]])
  )

  const registryConfig: Config = getDifferences(
    newConfigSubset,
    defaultConfigSubset
  )

  registryConfig.url = opts.url

  const { resolvedPaths, ...topLevelConfig } = defaultConfig

  return {
    config: {
      ...topLevelConfig,
      registries: {
        ...defaultConfig.registries,
        [name]: registryConfig,
      },
    },
    name,
  } as { config: Config; name: string }
}

export function isDifferent(newValue: any, defaultValue: any): boolean {
  if (typeof newValue === "object" && newValue !== null) {
    if (typeof defaultValue !== "object" || defaultValue === null) {
      return true
    }
    for (const key in newValue) {
      if (isDifferent(newValue[key], defaultValue[key])) {
        return true
      }
    }
    for (const key in defaultValue) {
      if (!(key in newValue)) {
        return true
      }
    }
    return false
  }
  return newValue !== defaultValue
}

export function getDifferences(newConfig: any, defaultConfig: any): any {
  const differences: any = {}

  for (const key in newConfig) {
    if (isDifferent(newConfig[key], defaultConfig[key])) {
      if (typeof newConfig[key] === "object" && newConfig[key] !== null) {
        differences[key] = getDifferences(
          newConfig[key],
          defaultConfig[key] || {}
        )
        if (Object.keys(differences[key]).length === 0) {
          delete differences[key]
        }
      } else {
        differences[key] = newConfig[key]
      }
    }
  }

  return differences
}
