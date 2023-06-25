# Usage

```
const path = require('path');
const appRoot = path.resolve(__dirname, '..');
const HBE = require('HandlebarsExtended')({
  appRoot : appRoot
});

const config = require(path.resolve(appRoot, 'config.json'));
HBE.buildSite(config)
```

# templates
You can then use added helpers in templates, e.g.
{{#wrap "html"}}
Content {{math 10 "+" 10}}
{{include footer}}
{{/wrap}}