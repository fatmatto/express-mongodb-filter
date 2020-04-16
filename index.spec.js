const test = require('ava')

const { middleware, processFilter } = require('./lib')

test('Should correctly convert a valid filter', t => {
  const query = {
    filter: JSON.stringify({ $or: [{ a: 1 }, { a: 1 }] })
  }
  const parsedQuery = processFilter(query)
  t.is(true, Array.isArray(parsedQuery.$or))
})

test('Should reject unwanted operators', t => {
  const query = {
    filter: JSON.stringify({ $or: [{ a: 1 }, { a: 1 }], $and: [] })
  }
  let err = null
  try {
    processFilter(query, { operators: { $and: false } })
  } catch (e) {
    err = e
  }
  t.is(true, err !== null)
})

test('Should reject non existing operators', t => {
  const query = {
    filter: JSON.stringify({ $or: [{ a: 1 }, { a: 1 }], $nonexisting: [] })
  }
  let err = null
  try {
    processFilter(query, { operators: { $and: false } })
  } catch (e) {
    err = e
  }
  t.is(true, err !== null)
})

test('Should reject wrong filters type', t => {
  const query = {
    filter: 2
  }
  let err = null
  try {
    processFilter(query, { operators: { $and: false } })
  } catch (e) {
    err = e
  }
  t.is(true, err !== null)
})

test('Should process the request object', t => {
  const options = {}
  const middlewareFn = middleware(options)
  const req = {
    query: {
      filter: JSON.stringify({ $or: [{ a: 1 }, { a: 1 }], $and: [] })
    }
  }
  middlewareFn(req, {}, () => {
    t.is(true, Array.isArray(req.query.$or))
  })
})

test('Should correctly pass exceptions', t => {
  const options = {}
  const middlewareFn = middleware(options)
  const req = {
    query: {
      filter: 1
    }
  }
  middlewareFn(req, {}, (err) => {
    t.is(true, err instanceof Error)
  })
})

test('Should correctly handle invalid JSON filters', t => {
  const options = {}
  const middlewareFn = middleware(options)
  const req = {
    query: {
      filter: '{a:1}'
    }
  }
  middlewareFn(req, {}, (err) => {
    t.is(true, err instanceof Error)
  })
})
test('Should skip filter processing when not provided', t => {
  const options = {}
  const middlewareFn = middleware(options)
  const req = {
    query: {
    }
  }
  middlewareFn(req, {}, (err) => {
    t.is(undefined, err)
  })
})
