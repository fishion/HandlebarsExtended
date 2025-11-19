# HandlebarsExtended

A TypeScript-powered extension for Handlebars that adds useful helpers and site-building functionality. Perfect for static site generation with enhanced template capabilities.

## Features

- 🎯 **Custom Handlebars Helpers**: `wrap`, `include`, `math`, and `json` helpers
- 📦 **Site Builder**: Automatically process entire directories of templates
- 🎨 **Flexible Structure**: Supports wrappers, includes, and dynamic page controllers
- 💪 **TypeScript**: Full type definitions included
- 🔄 **ESM**: Modern ECMAScript module support

## Installation

Install directly from GitHub:

```bash
npm install github:user/HandlebarsExtended
```

Or add to your `package.json`:

```json
{
  "dependencies": {
    "handlebarsextended": "github:user/HandlebarsExtended"
  }
}
```

## Quick Start

```typescript
import path from "path"
import { fileURLToPath } from "url"
import handlebarsExtended from "handlebarsextended"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const hbx = handlebarsExtended({
  appRoot: path.resolve(__dirname, "."),
  outputPath: "docs",
  pagesPath: "templates/pages",
  wrappersPath: "templates/partials/wrappers",
  includesPath: "templates/partials/includes",
  extension: "html",
})

// Build entire site
await hbx.buildSite({ siteTitle: "My Site" })
```

## Configuration Options

```typescript
interface HandlebarsExtendedOptions {
  appRoot: string // Required: Root directory of your project
  outputPath?: string // Output directory (default: "docs")
  controllerPath?: string // Controllers directory (default: "controllers")
  pagesPath?: string // Page templates directory (default: "templates/pages")
  wrappersPath?: string // Wrapper partials directory (default: "templates/partials/wrappers")
  includesPath?: string // Include partials directory (default: "templates/partials/includes")
  extension?: string // File extension without .hbs (default: "html")
}
```

## Custom Helpers

### `wrap` Helper

Wraps content with a template wrapper. Wrappers receive the content as `{{{content}}}` plus all parent context and hash parameters.

**Template:**

```handlebars
{{#wrap "layout"}}
  <h1>Page Content</h1>
{{/wrap}}
```

**Wrapper (`layout.html.hbs`):**

```handlebars
<html>
  <body>
    {{{content}}}
  </body>
</html>
```

### `include` Helper

Includes a partial template with optional hash parameters.

**Template:**

```handlebars
{{{include "header" title="My Page"}}}
```

**Include (`header.html.hbs`):**

```handlebars
<header>
  <h1>{{title}}</h1>
</header>
```

### `math` Helper

Performs mathematical operations.

**Template:**

```handlebars
<p>Total: {{math price "+" tax}}</p>
<p>Half: {{math total "/" 2}}</p>
```

**Supported operators:** `+`, `-`, `*`, `/`, `%`

### `json` Helper

Parses JSON strings for use in templates.

**Template:**

```handlebars
{{#each (json '{"items":["a","b","c"]}').items}}
  <li>{{this}}</li>
{{/each}}
```

## Site Building

### Directory Structure

```
project/
├── templates/
│   ├── pages/           # Your page templates
│   │   ├── index.html.hbs
│   │   └── about.html.hbs
│   └── partials/
│       ├── wrappers/    # Layout wrappers
│       │   └── main.html.hbs
│       └── includes/    # Reusable components
│           └── nav.html.hbs
├── controllers/         # Optional page data
│   ├── index.js
│   └── about.js
└── docs/                # Generated output
```

### Controllers (Optional)

Controllers provide data to specific pages. Create a `.js` file matching your template name:

**`controllers/index.js`:**

```javascript
export default {
  title: "Home Page",
  description: "Welcome to my site",
}
```

The controller data will be merged into the template context.

### Rendering Individual Pages

```typescript
await hbx.render("", "index.html.hbs", {
  customData: "value",
})
```

### Building Entire Site

```typescript
// Builds all templates in pagesPath
await hbx.buildSite({
  siteTitle: "My Website",
  year: new Date().getFullYear(),
})
```

The `buildSite` method:

- Recursively processes all `.hbs` files in `pagesPath`
- Maintains directory structure in output
- Loads matching controllers if available
- Injects `pagename` data for each page

## Template Context

Every rendered page receives:

```typescript
{
  pagename: {
    name: "index",           // Filename without extension
    is: { index: true }      // Boolean flag for current page
  },
  ...customParams,           // Parameters from buildSite/render
  ...controllerData          // Data from matching controller
}
```

## Example Template

```handlebars
{{#wrap "main"}}
  <main>
    <h1>{{title}}</h1>
    <p>{{description}}</p>

    {{{include "navigation"}}}

    <p>Total items: {{math itemCount "+" 1}}</p>

    {{#if pagename.is.index}}
      <p>You're on the home page!</p>
    {{/if}}
  </main>
{{/wrap}}
```

## TypeScript Support

Full TypeScript definitions are included:

```typescript
import handlebarsExtended, { HandlebarsExtended } from "handlebarsextended"

const hbx: HandlebarsExtended = handlebarsExtended({
  appRoot: __dirname,
})
```

## Important: Async Methods

⚠️ The `render()` and `buildSite()` methods are asynchronous and return Promises. You must use `await` or `.then()`:

```typescript
// Correct usage
await hbx.render("", "template.hbs", data)
await hbx.buildSite(config)

// Or with promises
hbx.buildSite(config).then(() => console.log("Done"))
```

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

## License

ISC

## Author

Maytree House Studios
