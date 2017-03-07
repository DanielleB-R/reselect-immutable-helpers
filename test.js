/* eslint-env jest */
import Immutable from 'immutable'
import {createSelector} from 'reselect'

import {selectorToJS, ensureJSSelector, createPropsSelector, createGetSelector, invertSelector, createHasSelector} from './index'

describe('selectorToJS', () => {
    test('creates selectors that return identical JS objects when the Immutable objects don\'t change', () => {
        const rootSelector = (state) => state
        const selector = selectorToJS(createSelector(
            rootSelector,
            ({contents}) => contents
        ))

        const referenceSelector = createSelector(
            rootSelector,
            ({contents}) => contents.toJS()
        )

        const state1 = {
            contents: Immutable.List([1, 2, 3])
        }

        const state2 = {
            contents: Immutable.List([1, 2]).push(3)
        }

        expect(state1.contents).not.toBe(state2.contents)
        expect(Immutable.is(state1.contents, state2.contents)).toBe(true)

        expect(referenceSelector(state1)).not.toBe(referenceSelector(state2))
        expect(selector(state1)).toBe(selector(state2))
    })

    test('creates selectors that return null if a falsy input is selected', () => {
        const rootSelector = (state) => state
        const selector = selectorToJS(createSelector(
            rootSelector,
            ({present}) => present
        ))

        const state1 = {
            present: Immutable.List()
        }

        const state2 = {
            absent: Immutable.List()
        }

        expect(selector(state1)).not.toBeNull()
        expect(selector(state2)).toBeNull()
    })
})

describe('ensureJSSelector', () => {
    test('creates a selector that does .toJS on Immutable objects', () => {
        const rootSelector = (state) => state
        const selector = ensureJSSelector(createSelector(
            rootSelector,
            ({contents}) => contents
        ))

        const testData = {
            test: true,
            numbers: [1, 1, 2, 3, 5],
            str: 'string!'
        }

        const state = {
            contents: Immutable.fromJS(testData)
        }

        expect(selector(state)).toEqual(testData)
    })

    test('creates selectors that return identical JS objects when the Immutable objects don\'t change', () => {
        const rootSelector = (state) => state
        const selector = ensureJSSelector(createSelector(
            rootSelector,
            ({contents}) => contents
        ))

        const referenceSelector = createSelector(
            rootSelector,
            ({contents}) => contents.toJS()
        )

        const state1 = {
            contents: Immutable.List([1, 2, 3])
        }

        const state2 = {
            contents: Immutable.List([1, 2]).push(3)
        }

        expect(state1.contents).not.toBe(state2.contents)
        expect(Immutable.is(state1.contents, state2.contents)).toBe(true)

        expect(referenceSelector(state1)).not.toBe(referenceSelector(state2))
        expect(selector(state1)).toBe(selector(state2))
    })

    test('creates selectors that return null if undefined is found', () => {
        const rootSelector = (state) => state
        const selector = ensureJSSelector(createSelector(
            rootSelector,
            ({present}) => present
        ))

        const state = {
            absent: Immutable.List()
        }

        expect(selector(state)).toBeNull()
    })

    test('creates selectors that just return the object if it is not an Immutable object', () => {
        const rootSelector = (state) => state
        const selector = ensureJSSelector(createSelector(
            rootSelector,
            ({contents}) => contents
        ))

        ;[5, 'text', true, null, [1, 2, 3], {object: 'yes'}, {toJS: false}].forEach((contents) => {
            expect(selector({contents})).toEqual(contents)
        })
    })
})

describe('createPropsSelector', () => {
    test('selects all of its keys, ensuring they\'re JS objects', () => {
        const state = {
            text: 'string',
            quantity: 7,
            counts: Immutable.List([1, 3, 5, 9]),
            item: Immutable.Map({
                a: 'b',
                six: 6
            })
        }

        const propSelector = createPropsSelector({
            text: ({text}) => text,
            quantity: ({quantity}) => quantity,
            counts: ({counts}) => counts,
            item: ({item}) => item
        })

        expect(propSelector(state)).toEqual({
            text: 'string',
            quantity: 7,
            counts: [1, 3, 5, 9],
            item: {
                a: 'b',
                six: 6
            }
        })
    })

    test('returns the same object if all of the inputs are the same', () => {
        const state = {
            one: 1,
            two: 2
        }

        const propSelector = createPropsSelector({
            one: ({one}) => one,
            two: ({two}) => two
        })

        const props1 = propSelector(state)
        const props2 = propSelector(state)

        expect(props1).toBe(props2)
    })
})

describe('createGetSelector', () => {
    test('creates selectors that get the string key from the input map', () => {
        const contentsSelector = ({contents}) => contents

        const getSelector = createGetSelector(contentsSelector, 'key')

        const state = {
            contents: Immutable.Map({
                key: 'value',
                bystander: 'intervention'
            })
        }

        expect(getSelector(state)).toBe('value')
    })

    test('creates selectors that get the integer key from the input list', () => {
        const contentsSelector = ({contents}) => contents

        const getSelector = createGetSelector(contentsSelector, 1)

        const state = {
            contents: Immutable.List(['zeroth', 'first'])
        }

        expect(getSelector(state)).toBe('first')
    })

    test('creates selectors that return a default value if a key is not found', () => {
        const contentsSelector = ({contents}) => contents

        const getSelector = createGetSelector(contentsSelector, 'key', 'key not found')

        const state = {
            contents: Immutable.Map({
                irrelevant: 'nonsense'
            })
        }

        expect(getSelector(state)).toBe('key not found')
    })

    test('creates selectors that use a selector for the key if one is passed', () => {
        const contentsSelector = ({contents}) => contents
        const keySelector = ({key}) => key

        const getSelector = createGetSelector(contentsSelector, keySelector, 'key not found')

        const contents = Immutable.Map({
            present: 'and accounted for'
        })

        const state1 = {
            contents,
            key: 'present'
        }

        const state2 = {
            contents,
            key: 'absent'
        }

        expect(getSelector(state1)).toBe('and accounted for')
        expect(getSelector(state2)).toBe('key not found')
    })
})

describe('invertSelector', () => {
    test('creates selectors that return the inverse of the input selector', () => {
        const originalSelector = ({isFirst}) => isFirst
        const inverseSelector = invertSelector(originalSelector)

        const state1 = {
            isFirst: true
        }

        const state2 = {
            isFirst: false
        }

        expect(inverseSelector(state1)).toBe(false)
        expect(inverseSelector(state2)).toBe(true)
    })
})

describe('createHasSelector', () => {
    test('creates selectors that check for a string key in the input map', () => {
        const contentsSelector = ({contents}) => contents

        const hasSelector = createHasSelector(contentsSelector, 'key')

        const state1 = {
            contents: Immutable.Map({
                key: 'value',
            })
        }

        const state2 = {
            contents: Immutable.Map({
                noKey: 'no value'
            })
        }

        expect(hasSelector(state1)).toBe(true)
        expect(hasSelector(state2)).toBe(false)
    })

    test('creates selectors that check for an integer key in the input list', () => {
        const contentsSelector = ({contents}) => contents

        const hasSelector = createHasSelector(contentsSelector, 1)

        const state1 = {
            contents: Immutable.List(['zeroth', 'first'])
        }

        const state2 = {
            contents: Immutable.List(['zeroth'])
        }
        expect(hasSelector(state1)).toBe(true)
        expect(hasSelector(state2)).toBe(false)
    })

    test('creates selectors that use a selector for the key if one is passed', () => {
        const contentsSelector = ({contents}) => contents
        const keySelector = ({key}) => key

        const hasSelector = createHasSelector(contentsSelector, keySelector)

        const contents = Immutable.Map({
            present: 'and accounted for'
        })

        const state1 = {
            contents,
            key: 'present'
        }

        const state2 = {
            contents,
            key: 'absent'
        }

        expect(hasSelector(state1)).toBe(true)
        expect(hasSelector(state2)).toBe(false)
    })
})
