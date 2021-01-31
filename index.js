"use strict";

const Handlebars = require('handlebars');
const fs = require('fs');

const wrappersPath = "partials/wrappers";
const includesPath = "partials/includes";

module.exports = (templatesDir, renderedDir) => {
  const hbs = Handlebars

  // add helpers
  hbs.registerHelper("wrap", function(wrapper, options) {
    // if performance was a consideration, may be worth pre-compiling and caching wrappers
    const compiledWrapper = hbs.compile(
      fs.readFileSync(`${templatesDir}/${wrappersPath}/${wrapper}.html.hbs`,'utf8').toString()
    );
    return compiledWrapper({ ...this, ...options.hash, content : options.fn(this) })
  });

  hbs.registerHelper("include", function(include, options) {
    // if performance was a consideration, may be worth pre-compiling and caching includes
    const compiledInclude = hbs.compile(
      fs.readFileSync(`${templatesDir}/${includesPath}/${include}.html.hbs`,'utf8').toString()
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


  // main render method
  hbs.render = (templateName) => {
    // pull apart template path
    const [fileName, fileExt] = templateName.split('.'); // myfile.html.hbs
    console.log(`Rendering ${fileName}`)

    // pull data for each page, if there is any needed
    try {
      var pageData = require(`../controllers/${fileName}`);
    } catch (e) {console.log(`  - no data for ${fileName}`)}

    // render template
    const template = hbs.compile( fs.readFileSync(`${templatesDir}/${templateName}`,'utf8').toString() );
    fs.writeFileSync(`${renderedDir}/${fileName}.${fileExt}`, template({
      pagename : { [fileName] : true },
      ...pageData
    }))
    console.log(`  - finished rendering ${fileName}`)
  }

  return hbs;
}