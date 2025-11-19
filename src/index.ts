import fs from "fs"
import path from "path"
import { pathToFileURL } from "url"
import Handlebars from "handlebars"

interface HandlebarsExtendedOptions {
  appRoot: string
  outputPath?: string
  controllerPath?: string
  pagesPath?: string
  wrappersPath?: string
  includesPath?: string
  extension?: string
}

type HandlebarsExtended = typeof Handlebars & {
  render: (subdir: string, templateName: string, templateParams?: object) => Promise<void>
  buildSite: (templateParams?: object, subdir?: string) => Promise<void>
}

interface PagenameData {
  name: string
  is: Record<string, boolean>
}

interface TemplateData {
  pagename?: PagenameData
  [key: string]: unknown
}

export default function handlebarsExtended({
  appRoot,
  outputPath = "docs",
  controllerPath = "controllers",
  pagesPath = "templates/pages",
  wrappersPath = "templates/partials/wrappers",
  includesPath = "templates/partials/includes",
  extension = "html",
}: HandlebarsExtendedOptions): HandlebarsExtended {
  const hbx = Handlebars as HandlebarsExtended

  // Add wrap helper
  hbx.registerHelper(
    "wrap",
    function (this: object, wrapper: string, options: Handlebars.HelperOptions) {
      const wrapperPath = path.join(appRoot, wrappersPath, `${wrapper}.${extension}.hbs`)
      const wrapperContent = fs.readFileSync(wrapperPath, "utf8")
      const compiledWrapper = hbx.compile(wrapperContent)
      return compiledWrapper({ ...this, ...options.hash, content: options.fn(this) })
    },
  )

  // Add include helper
  hbx.registerHelper(
    "include",
    function (this: object, include: string, options: Handlebars.HelperOptions) {
      const includePath = path.join(appRoot, includesPath, `${include}.${extension}.hbs`)
      const includeContent = fs.readFileSync(includePath, "utf8")
      const compiledInclude = hbx.compile(includeContent)
      return compiledInclude({ ...this, ...options.hash })
    },
  )

  // Add math helper
  hbx.registerHelper(
    "math",
    (lvalue: number | string, operator: string, rvalue: number | string) => {
      const left = parseFloat(String(lvalue))
      const right = parseFloat(String(rvalue))
      const operations: Record<string, number> = {
        "+": left + right,
        "-": left - right,
        "*": left * right,
        "/": left / right,
        "%": left % right,
      }
      return operations[operator]
    },
  )

  // Add json helper
  hbx.registerHelper("json", (val: string) => {
    return JSON.parse(val)
  })

  // Render to a file
  hbx.render = async (subdir = "", templateName: string, templateParams: object = {}) => {
    const outFile = path.basename(templateName, ".hbs")
    const outPath = path.join(subdir, outFile)
    const fileObj = path.parse(outFile)
    console.log(`Rendering ${outPath}`)

    // Pull data for each page, if there is any needed
    let pageData: object = {}
    try {
      const controllerFilePath = path.resolve(appRoot, controllerPath, subdir, `${fileObj.name}.js`)
      const module = await import(pathToFileURL(controllerFilePath).href)
      pageData = module.default
      console.log(`  - found controller for ${outPath}`)
    } catch (_e) {
      console.log(`  - no controller for ${outPath}`)
    }

    // Render template
    const templatePath = path.join(appRoot, pagesPath, subdir, templateName)
    const templateContent = fs.readFileSync(templatePath, "utf8")
    const template = hbx.compile(templateContent)
    const outFilePath = path.join(appRoot, outputPath, subdir, outFile)
    const outDirName = path.dirname(outFilePath)

    if (!fs.existsSync(outDirName)) {
      fs.mkdirSync(outDirName, { recursive: true })
    }

    const data: TemplateData = {
      pagename: {
        name: fileObj.name,
        is: { [fileObj.name]: true },
      },
      ...templateParams,
      ...pageData,
    }

    fs.writeFileSync(outFilePath, template(data))
    console.log(`  - finished rendering ${outPath}`)
  }

  // Build entire site
  hbx.buildSite = async (templateParams: object = {}, subdir = "") => {
    const pagesDir = path.join(appRoot, pagesPath, subdir)
    const fileobs = fs.readdirSync(pagesDir, { withFileTypes: true })

    const files = fileobs.filter(item => !item.isDirectory())
    for (const file of files) {
      await hbx.render(subdir, file.name, templateParams)
    }

    const dirs = fileobs.filter(item => item.isDirectory())
    for (const dir of dirs) {
      await hbx.buildSite(templateParams, path.join(subdir, dir.name))
    }
  }

  return hbx
}
