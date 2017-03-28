# reselect-immutable-helpers
[![npm package][npm-badge]][npm]

A library of helper functions for using Reselect with a store built with Immutable objects.

This library is provided as a CommonJS module transpiled to ES5.

## Convenient Selectors For Immutable Objects

This package provides two helper functions that wrap the most common
Immutable methods needed in selectors: `.get()` and `.has()`.

### `createGetSelector`

The `createGetSelector` utility is a wrapper around the `.get()` method
of an Immutable object to reduce boilerplate. It takes three
parameters:

 - A selector returning an Immutable object
 - A key _or_ a selector returning a key
 - An optional default value

The simplest case is where we have a fixed key known when the selector is created. In this case we can do

```js
const getProductTitle = createGetSelector(getProduct, 'title', '')
```

which is equivalent to

```js
const getProductTitle = createSelector(
    getProduct,
    (product) => product.get('title', '')
)
```

If instead the key is in the store, we can use something like

```js
const getCurrentItem = createGetSelector(
    getItems,
    getCurrentItemIndex
)
```

which is equivalent to

```js
const getCurrentCategory = createSelector(
    getItems,
    getCurrentItemIndex
    (items, index) => items.get(index)
)
```

### `createHasSelector`

The `createHasSelector` utility is a wrapper around the `.has()` method
of an Immutable object to reduce boilerplate. It takes two
parameters:

 - A selector returning an Immutable object
 - A key _or_ a selector returning a key

So we can do something like:

```js
const isCurrentItemValid = createHasSelector(
    getItems,
    getCurrentItemIndex
)
```

which is equivalent to:

```js
const isCurrentItemValid = createSelector(
    getItems,
    getCurrentItemIndex,
    (items, index) => items.has(index)
)
```

## Converting Immutable Objects To Plain Javascript Objects

A major pitfall with using the `.toJS()` method of Immutable objects to
create props to be passed to a React component is that it will create
a new object every time it is called, even if the Immutable object
itself is the same. Reselect provides a useful facility to fix this
through its memoization of inputs; this library builds upon this to
make efficiently passing props from an Immutable store to React
components simple.

### `createPropsSelector`

The `createPropsSelector` function is a selector creator that is
optimized for writing `mapStateToProps` functions in react-redux. It
takes an object with selectors for values, in the same way as
`createStructuredSelector` in Reselect itself, but it wraps each
selector in a way that ensures that its output is a plain Javascript
object.

The wrapper functions use the custom equality test facility of
Reselect `createSelector` to make sure that the object has differing
contents before recalculating the selector result. With Immutable
objects and the `Immutable.is()` function, this is efficient. The
result is that if the contents of the Immutable object in the store
has not changed, the Javascript object passed as a prop does not
change either.

The use of the Reselect selector directly as the `mapStateToProps`
function unlocks a further opportunity for memoization to help with
performance optimization. If none of the constituent props have
changed, the `mapStateToProps` function returns the very same object
as in the previous call. If the result is the same (using the
Javascript `===` operator) from call to call, the react-redux
`connect` code knows not to update the React component it wraps. Thus,
using this function and an Immutable store, all connected components
have optimal update policies without explicit `shouldComponentUpdate`
methods.

A example usage of `createPropsSelector` is:

```js
const mapStateToProps = createPropsSelector({
    title: getProductTitle,
    price: getProductPrice,
    images: getProductImages,
    categoryLink: getCategoryLink
})
```

where the `images` prop is an array and the `categoryLink` prop is an
object. Only if the relevant portions of the Redux store change (or
the component's own props do) does the connected component re-render.

This function also allows the `mapStateToProps` definition to echo in
form the object form of the `mapDispatchToProps` parameter, which can
improve the cleanliness and symmetry of the connection code.

## Licensing

MIT

[npm-badge]: https://img.shields.io/npm/v/reselect-immutable-helpers.svg?style=flat-square
[npm]: https://www.npmjs.org/package/reselect-immutable-helpers
