import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import handlebarsExtended from "./index.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

test("expect HandleBars Extended to export a function", () => {
  expect(typeof handlebarsExtended).toBe("function")
})

const opts = {
  appRoot: path.resolve(__dirname, "../test-templates"),
  wrappersPath: "components",
  includesPath: "components",
  pagesPath: "page",
  extension: "txt",
  outputPath: "output",
  controllerPath: "controller",
}

const hbx = handlebarsExtended(opts)

test("added wrapper helper", () => {
  const template = hbx.compile('{{#wrap "wrapper"}}WrappedContent{{/wrap}}')
  expect(template({ variable: "Variable" })).toBe("Start-Variable-WrappedContent-Finish")
})

test("added include helper", () => {
  const template = hbx.compile('Main Content - {{{include "include"}}}')
  expect(template({ variable: "Variable" })).toBe("Main Content - Included Text With Variable")
})

test("added math helper", () => {
  const template = hbx.compile('{{math num1 "+" num2}}')
  expect(template({ num1: 10, num2: 20 })).toBe("30")
})

const jsonStr = { a: [1, 2, 3], b: ["foo", "bar"] }

test("added json helper", () => {
  const template = hbx.compile(
    `{{#each (json '${JSON.stringify(jsonStr)}') }}{{@key}}{{#each this}}{{this}}{{/each}}{{/each}}`,
  )
  expect(template({})).toBe("a123bfoobar")
})

test("rendering to file", async () => {
  expect(typeof hbx.render).toBe("function")
  const templateName = "main-content.txt"
  const outFile = path.join(opts.appRoot, opts.outputPath, templateName)

  // remove output from previous runs if there
  try {
    fs.unlinkSync(outFile)
  } catch (_e) {
    // ignore if file doesn't exist
  }

  await hbx.render("", `${templateName}.hbs`, { variable: "Variable" })
  expect(fs.readFileSync(outFile, "utf8")).toBe("main-content - Variable - Controller Var")

  // remove output from this test
  fs.unlinkSync(outFile)
})

test("building a site to files with subdirs", async () => {
  expect(typeof hbx.buildSite).toBe("function")
  const tests = [
    {
      template: "main-content.txt",
      content: "main-content - Variable - Controller Var",
    },
    {
      template: "sub-path/sub-content.txt",
      content: "sub-content - Variable - Sub page Controller Var",
    },
  ]
  const outFiles = tests.map(test => path.join(opts.appRoot, opts.outputPath, test.template))

  for (let i = 0; i < tests.length; i++) {
    // remove output from previous runs if there
    try {
      fs.unlinkSync(outFiles[i])
    } catch (_e) {
      // ignore if file doesn't exist
    }
  }

  // build the site
  await hbx.buildSite({ variable: "Variable" })

  for (let i = 0; i < tests.length; i++) {
    expect(fs.readFileSync(outFiles[i], "utf8")).toBe(tests[i].content)

    fs.unlinkSync(outFiles[i]) // remove output from this test
  }
})
