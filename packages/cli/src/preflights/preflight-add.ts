import path from "path"
import { addOptionsSchema } from "@/src/commands/add"
import * as ERRORS from "@/src/utils/errors"
import { getConfig } from "@/src/utils/get-config"
import { highlighter } from "@/src/utils/highlighter"
import { logger } from "@/src/utils/logger"
import fs from "fs-extra"
import { z } from "zod"
import { REGISTRY_MAP } from "@/src/registry/api"

export async function preFlightAdd(options: z.infer<typeof addOptionsSchema>) {
  const errors: Record<string, boolean> = {}

  // Ensure target directory exists.
  // Check for empty project. We assume if no package.json exists, the project is empty.
  if (
    !fs.existsSync(options.cwd) ||
    !fs.existsSync(path.resolve(options.cwd, "package.json"))
  ) {
    errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT] = true
    return {
      errors,
      config: null,
    }
  }

  // Check for existing components.json file.
  if (!fs.existsSync(path.resolve(options.cwd, "components.json"))) {
    errors[ERRORS.MISSING_CONFIG] = true
    return {
      errors,
      config: null,
    }
  }

  try {
    const config = await getConfig(options.cwd)

    if (!config) {
      errors[ERRORS.MISSING_CONFIG] = true

      return { config: null, errors }
    }
    // Check if the required registry exists in config
    if (options.registry) {
      const registryUrl =
        REGISTRY_MAP[options.registry as keyof typeof REGISTRY_MAP]
      const hasRegistry =
        config.registries?.[options.registry] ||
        Object.values(config.registries || {}).some(
          (reg) => reg.url === registryUrl
        )

      if (!hasRegistry) {
        errors[ERRORS.MISSING_REGISTRY] = true

        return { config, errors }
      }
    }

    return {
      errors,
      config: config!,
    }
  } catch (error) {
    logger.break()
    logger.error(
      `An invalid ${highlighter.info(
        "components.json"
      )} file was found at ${highlighter.info(
        options.cwd
      )}.\nBefore you can add components, you must create a valid ${highlighter.info(
        "components.json"
      )} file by running the ${highlighter.info("init")} command.`
    )
    logger.error(
      `Learn more at ${highlighter.info(
        "https://ui.shadcn.com/docs/components-json"
      )}.`
    )
    logger.break()
    process.exit(1)
  }
}
