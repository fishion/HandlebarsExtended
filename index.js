"use strict";

const fs = require('fs');
const path = require('path')
const Handlebars = require('handlebars');

module.exports = ({
  appRoot,
  outputPath     = 'docs',
  controllerPath = 'controllers',
  pagesPath      = 'templates/pages',
  wrappersPath   = "templates/partials/wrappers",
  includesPath   = "templates/partials/includes",
}) => {
  const hbs = Handlebars

  // add helpers
  hbs.registerHelper("wrap", function(wrapper, options) {
    // if performance was a consideration, may be worth pre-compiling and caching wrappers
    const compiledWrapper = hbs.compile(
      fs.readFileSync(`${path.join(appRoot, wrappersPath, wrapper)}.html.hbs`,'utf8').toString()
    );
    return compiledWrapper({ ...this, ...options.hash, content : options.fn(this) })
  });

  hbs.registerHelper("include", function(include, options) {
    // if performance was a consideration, may be worth pre-compiling and caching includes
    const compiledInclude = hbs.compile(
      fs.readFileSync(`${path.join(appRoot, includesPath, include)}.html.hbs`,'utf8').toString()
    );
    return compiledInclude({ ...this, ...options.hash})
  });

  hbs.registerHelper("math", (lvalue, operator, rvalue) => {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);
    return {
        "+": lvalue + rvalue,
        "-": lvalue - rvalue,
        "*": lvalue * rvalue,
        "/": lvalue / rvalue,
        "%": lvalue % rvalue
    }[operator];
  });


  // render to a file
  hbs.render = (subdir=undef, templateName, templateParams) => {
    // pull apart template path e.g. myfile.html.hbs
    const outFile = path.basename(templateName, '.hbs');
    const outPath = path.join(subdir, outFile);
    const fileObj = path.parse(outFile);
    console.log(`Rendering ${outPath}`)

    // pull data for each page, if there is any needed
    try {
      var pageData = require(path.join(appRoot, controllerPath, subdir,fileObj.name));
      console.log(`  - found controller for ${outPath}`)
    } catch (e) {
      console.log(`  - no controller for ${outPath}`)
    }

    // render template
    const template = hbs.compile( fs.readFileSync(path.join(appRoot, pagesPath, subdir, templateName),'utf8').toString() );
    fs.writeFileSync(path.join(appRoot, outputPath, subdir, outFile), template({
      pagename : {
        name : fileObj.name,
        is : { [fileObj.name] : true },
      },
      ...templateParams,
      ...pageData
    }))
    console.log(`  - finished rendering ${outPath}`)
  }

  hbs.buildSite = (templateParams, subdir='') => {
    // read file lists & render
    const fileobs = fs.readdirSync(path.join(appRoot, pagesPath, subdir), {withFileTypes: true})

    fileobs
      .filter(item => !item.isDirectory())
      .forEach(file => hbs.render(subdir, file.name, templateParams))

    // recurse into any dirs
    fileobs
      .filter(item => item.isDirectory())
      .forEach(dir => hbs.buildSite(templateParams, dir.name))
  }

  return hbs;
}
