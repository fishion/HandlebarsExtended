const fs = require('fs')
  , path = require('path')
  , hbxmodule = require('./index')

test('expect HandleBars Extended to export a function', () => {
  expect(typeof hbxmodule).toBe('function')
})

const opts = {
    appRoot : path.resolve(__dirname, 'test-templates'),
    wrappersPath : 'components',
    includesPath : 'components',
    pagesPath : 'page',
    extension : 'txt',
    outputPath : 'output',
    controllerPath : 'controller'
  }
  , hbx = hbxmodule(opts)

test('test added wrapper helper', () => {
  const template = hbx.compile('{{#wrap "wrapper"}}WrappedContent{{/wrap}}')
  expect(template({ variable : 'Variable' })).toBe('Start-Variable-WrappedContent-Finish')
})
test('test added include helper', () => {
  const template = hbx.compile('Main Content - {{{include "include"}}}')
  expect(template({ variable : 'Variable' })).toBe('Main Content - Included Text With Variable')
})
test('test added math helper', () => {
  const template = hbx.compile('{{math num1 "+" num2}}')
  expect(template({ num1 : 10, num2 : 20 })).toBe('30')
})

test('Test rendering to file', () => {
  expect(typeof hbx.render).toBe('function')
  const templateName = 'main-content.txt'
    , outFile = path.join(opts.appRoot, opts.outputPath, templateName)

  // remove output from previous runs if there
  try { fs.unlinkSync(outFile) } catch (e) {}

  hbx.render('', `${templateName}.hbs`, { variable : 'Variable' })
  expect(fs.readFileSync(outFile, 'utf8').toString()).toBe('main-content - Variable - Controller Var')

  // remove output from this test
  fs.unlinkSync(outFile)
})

test('Test building a site to files with subdirs', () => {
  expect(typeof hbx.buildSite).toBe('function')
  const tests = [
      {
        template : 'main-content.txt',
        content : 'main-content - Variable - Controller Var'
      },
      {
        template : 'sub-path/sub-content.txt',
        content : 'sub-content - Variable - Sub page Controller Var'
      }
    ]
    , outFiles = tests.map(test => path.join(opts.appRoot, opts.outputPath, test.template))

  for (let i = 0; i < tests.length; i++) {
    // remove output from previous runs if there
    try { fs.unlinkSync(outFiles[i]) } catch (e) {}
  }

  // build the site
  hbx.buildSite({ variable : 'Variable' })

  for (let i = 0; i < tests.length; i++) {
    expect(fs.readFileSync(outFiles[i], 'utf8').toString()).toBe(tests[i].content)

    fs.unlinkSync(outFiles[i]) // remove output from this test
  }
})
