'use strict'

const defaultOperators = {
  $or: true,
  $and: true,
  $ne: true,
  $regex: true,
  $in: true,
  $nin: true,
  $gt: true,
  $lt: true,
  $gte: true,
  $lte: true,
  $exists: true
}

/**
 * @property {String} parameterName The name of the GET parameter to use as complex filter
 * @property {Object} operators A map<String,Boolean> to define which operators should be allowed
 */
const defaultOptions = {
  parameterName: 'filter',
  operators: defaultOperators,
  customErrorClass: Error
}

/**
 * Merge default options with overwrites
 * @param {Object} defaults Default values
 * @param {Object} overwrites Values that overwrite default values
 */
function merge (defaults, overwrites) {
  return Object.assign({}, defaults, overwrites)
}

// Shameless shortcut
function objectHas (_this, propertyName) {
  return Object.prototype.hasOwnProperty.call(_this, propertyName)
}

/**
 * Recuresively look for MongoDB query operators. Returns a list of operators found
 * @param {Object} obj Object which might contain MongoDB query operators
 * @returns {Array<String>} Returns an array of operator names
 */
function findOperatorsInObject (obj) {
  const operators = []
  for (const k in obj) {
    if (k[0] === '$') {
      operators.push(k)
    }
    if (typeof obj[k] === 'object') {
      operators.push(...findOperatorsInObject(obj[k]))
    }
  }
  return [...new Set(operators)]
}

function processFilter (query, options = defaultOptions) {
  const CustomErrorClass = options.customErrorClass
  options = merge(defaultOptions, options)
  // Merge selected operators with default
  if (options.operators) {
    options.operators = Object.assign({}, defaultOperators, options.operators)
  }
  let filter = query[options.parameterName]
  if (typeof filter !== 'string' && typeof filter !== 'object') {
    throw new CustomErrorClass('Filter must be a string or an object, got ' + typeof filter)
  }
  if (typeof filter === 'string') {
    try {
      filter = JSON.parse(filter)
    } catch (e) {
      throw new CustomErrorClass(`Invalid JSON found in ${options.parameterName} parameter: ${e.message}`)
    }
  }

  const foundOperators = findOperatorsInObject(filter)

  const unwantedOperators = foundOperators.filter(keyName => !options.operators[keyName])

  if (unwantedOperators.length > 0) {
    throw new CustomErrorClass(`Unkown operators found in ${options.parameterName} parameter: ` + unwantedOperators)
  }

  delete query[options.parameterName]
  return Object.assign({}, filter, query)
}

/**
 *
 * @param {Object} options A configuration object
 * @param {String} options.parameterName The name of the GET parameter to use as MongoDB query. Defaults to "filter".
 * @param {Object} operators A map<String,Boolean> to define which operators should be allowed.
 * @param {Object} customErrorClass A custom Error to throw instead of default Error.
 */
function middleware (options = defaultOptions) {
  options = merge(defaultOptions, options)
  return (req, res, next) => {
    try {
      if (objectHas(req, 'query') && objectHas(req.query, options.parameterName)) {
        req.query = processFilter(req.query, options)
      }
    } catch (err) {
      return next(err)
    }

    return next()
  }
}

module.exports = { processFilter, middleware }
