import {createSelector, createSelectorCreator, createStructuredSelector, defaultMemoize} from 'reselect'
import Immutable from 'immutable'

export const createImmutableComparingSelector = createSelectorCreator(
    defaultMemoize,
    Immutable.is
)

/**
 * Creates a selector that handles the conversion from Immutable
 * objects to plain Javascript objects.
 *
 * If the result of the input selector is identical to its previous
 * result using Immutable.is, this will return the same JS object as
 * the previous call.
 *
 * This simplifies downstream update checks substantially, since a
 * shallow comparison of the resulting JS objects will only show
 * equality if they are deeply equal. This allows optimization of
 * updates using shallow comparisons in reselect, react-redux, and
 * various React utilities.
 *
 * @param {function} selector - A selector returning an Immutable object
 * @returns {function}
 */
export const selectorToJS = (selector) => createImmutableComparingSelector(
    selector,
    (raw) => { return raw ? raw.toJS() : null }
)

export const ensureJSSelector = (selector) => createImmutableComparingSelector(
    selector,
    (item = null) => {
        if (!item || typeof item !== 'object') {
            return item
        }

        if ('toJS' in item && typeof item.toJS === 'function') {
            return item.toJS()
        }
        return item
    }
)

export const createPropsSelector = (selectors) => {
    const wrappedSelectors = {}
    Object.keys(selectors).forEach((key) => {
        wrappedSelectors[key] = ensureJSSelector(selectors[key])
    })
    return createStructuredSelector(wrappedSelectors)
}

/**
 * Creates a selector that gets a value from a selected Immutable object.
 *
 * @param {function} selector - A selector returning an Immutable object
 * @param {string|number|function} key - The key to be looked up on
 *   the Immutable object. If a function is passed it is treated as a
 *   selector returning the desired key.
 * @param {*} [defaultValue] - An optional value to be returned if the
 *   key does not exist in the Immutable object.
 * @returns {function}
 */
export const createGetSelector = (selector, key, defaultValue) => {
    if (typeof key === 'function') {
        return createSelector(
            selector,
            key,
            (obj, keyValue) => obj.get(keyValue, defaultValue)
        )
    }
    return createSelector(
        selector,
        (obj) => obj.get(key, defaultValue)
    )
}

export const invertSelector = (selector) => createSelector(
    selector,
    (bool) => !bool
)

/**
 * Creates a selector that checks whether a key exists in a selected
 * Immutable object.
 *
 * @param {function} selector - A selector returning an Immutable object
 * @param {string|number|function} key - The key to be checked on
 *   the Immutable object. If a function is passed it is treated as a
 *   selector returning the desired key.
 * @returns {function}
 */
export const createHasSelector = (selector, key) => {
    if (typeof key === 'function') {
        return createSelector(
            selector,
            key,
            (obj, keyValue) => obj.has(keyValue)
        )
    }
    return createSelector(
        selector,
        (obj) => obj.has(key)
    )
}
