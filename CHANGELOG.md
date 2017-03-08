# 1.2.1 (March 8, 2017):
- Don't mention `index.js` in the package.json, for maximum safety.

# 1.2.0 (March 7, 2017):
- Transpile to dist.js and set that as the "main"

# 1.1.1 (March 7, 2017):
- Add the `module` and `jsnext:main` keys so this actually imports.

# 1.1.0 (March 7, 2017):
- Add `ensureJSSelector` which only calls `.toJS` if necessary
- Add `createPropsSelector` which wraps its arguments in `ensureJSSelector`
