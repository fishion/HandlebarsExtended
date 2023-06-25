module.exports = {
  plugins : ['jest'],
  env : {
    browser : true,
    es2021 : true,
    'jest/globals' : true
  },
  extends : [
    'standard'
  ],
  parserOptions : {
    ecmaVersion : 'latest',
    sourceType : 'module'
  },
  rules : {
    'no-multi-spaces' : 'off',
    'one-var' : ['error', 'consecutive'],
    'comma-style' : ['error', 'first', { exceptions : { ArrayExpression : true, ObjectExpression : true } }],
    'space-before-function-paren' : ['error', 'never'],
    'key-spacing' : ['error', { beforeColon : true }],
    'brace-style' : ['error', '1tbs', { allowSingleLine : true }]
  }
}
