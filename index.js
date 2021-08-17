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
  hbs.render = (templateName, templateParams) => {
    // pull apart template path e.g. myfile.html.hbs
    const outFile = path.basename(templateName, '.hbs');
    const fileObj = path.parse(outFile) 
    console.log(`Rendering ${fileObj.name}`)

    // pull data for each page, if there is any needed
    try {
      var pageData = require(path.join(appRoot, controllerPath, fileObj.name));
    } catch (e) {console.log(`  - no data for ${fileObj.name}`)}

    // render template
    const template = hbs.compile( fs.readFileSync(path.join(appRoot, pagesPath, templateName),'utf8').toString() );
    fs.writeFileSync(path.join(appRoot, outputPath, outFile), template({
      pagename : {
        name : fileObj.name,
        is : { [fileObj.name] : true },
      },
      ...templateParams,
      ...pageData
    }))
    console.log(`  - finished rendering ${fileObj.name}`)
  }

  hbs.buildSite = (templateParams) => {
    // read file lists & render
    fs.readdirSync(path.join(appRoot, pagesPath), {withFileTypes: true})
      .filter(item => !item.isDirectory())
      .forEach(file => hbs.render(file.name, templateParams))
  }

  return hbs;
}
