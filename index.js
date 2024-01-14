'use strict'

const fs = require('fs')
  , path = require('path')
  , Handlebars = require('handlebars')
  , hbx = Handlebars

module.exports = ({
  appRoot,
  outputPath     = 'docs',
  controllerPath = 'controllers',
  pagesPath      = 'templates/pages',
  wrappersPath   = 'templates/partials/wrappers',
  includesPath   = 'templates/partials/includes',
  extension      = 'html'
}) => {
  // add helpers
  hbx.registerHelper('wrap', function(wrapper, options) {
    const compiledWrapper = hbx.compile(
      fs.readFileSync(`${path.join(appRoot, wrappersPath, wrapper)}.${extension}.hbs`, 'utf8').toString()
    )
    return compiledWrapper({ ...this, ...options.hash, content : options.fn(this) })
  })

  hbx.registerHelper('include', function(include, options) {
    const compiledInclude = hbx.compile(
      fs.readFileSync(`${path.join(appRoot, includesPath, include)}.${extension}.hbs`, 'utf8').toString()
    )
    return compiledInclude({ ...this, ...options.hash })
  })

  hbx.registerHelper('math', (lvalue, operator, rvalue) => {
    lvalue = parseFloat(lvalue)
    rvalue = parseFloat(rvalue)
    return {
      '+' : lvalue + rvalue,
      '-' : lvalue - rvalue,
      '*' : lvalue * rvalue,
      '/' : lvalue / rvalue,
      '%' : lvalue % rvalue
    }[operator]
  })

  hbx.registerHelper('json', val => {
    return JSON.parse(val)
  })

  // render to a file
  hbx.render = (subdir = undefined, templateName, templateParams) => {
    // pull apart template path e.g. myfile.html.hbs
    const outFile = path.basename(templateName, '.hbs') // myfile.html
      , outPath = path.join(subdir, outFile) // midir/myfile.html
      , fileObj = path.parse(outFile) // object with useful properties
    console.log(`Rendering ${outPath}`)

    // pull data for each page, if there is any needed
    let pageData = {}
    try {
      pageData = require(path.join(appRoot, controllerPath, subdir, fileObj.name))
      console.log(`  - found controller for ${outPath}`)
    } catch (e) {
      console.log(`  - no controller for ${outPath}`)
    }

    // render template
    const template = hbx.compile(fs.readFileSync(path.join(appRoot, pagesPath, subdir, templateName), 'utf8').toString())
      , outFilePath = path.join(appRoot, outputPath, subdir, outFile)
      , outDirName = path.dirname(outFilePath)
    if (!fs.existsSync(outDirName)) {
      fs.mkdirSync(outDirName, { recursive : true })
    }
    fs.writeFileSync(outFilePath, template({
      pagename : {
        name : fileObj.name,
        is : { [fileObj.name] : true }
      },
      ...templateParams,
      ...pageData
    }))
    console.log(`  - finished rendering ${outPath}`)
  }

  hbx.buildSite = (templateParams, subdir = '') => {
    // read file lists & render
    const fileobs = fs.readdirSync(path.join(appRoot, pagesPath, subdir), { withFileTypes : true })

    fileobs
      .filter(item => !item.isDirectory())
      .forEach(file => hbx.render(subdir, file.name, templateParams))

    // recurse into any dirs
    fileobs
      .filter(item => item.isDirectory())
      .forEach(dir => hbx.buildSite(templateParams, dir.name))
  }

  return hbx
}
