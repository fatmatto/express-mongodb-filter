## express-mongodb-filter

ExpressJS middleware that allows expressjs apps to handle custom MongoDB queries sent from the client.

Please, remember that this middleware applies no security filtering to query parameters, you must sanitize input on your own.

### Usage

```bash
npm i express-mongodb-filters
```

Then in your code

```javascript
const express = require('express')
const filterMiddleware = require('express-mongodb-filters')
const app = express()
const port = 3000

app.use(filterMiddleware())

app.get('/', (req, res) => res.send(req.query))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
```

Let's make an HTTP request with [httpie](http://httpie.org/):
```bash
http GET 'http://localhost:3000?filter={"hello":1}'
```
Will output 

```http
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 11
Content-Type: application/json; charset=utf-8
Date: Thu, 16 Apr 2020 12:49:48 GMT
ETag: W/"b-r/pqON85j2anb93JwYwZU1C4GvM"
X-Powered-By: Express

{
    "hello": 1
}
```


### Configuration



The exported function taks an optional map of configuration values and returns the actual middleware function.

For an explanation of supported operators, please read MongoDB documentation.

```javascript
// Defaults. Defaults are merged with your object, so you don't
// need to provide these values in case they are ok for you
filterMiddleware({
  // By default, the function will look for a JSON string in the 
  // querystring parameter named "filter". You can change it to whatever suits you.
  parameterName: 'filter',
  // You can pass a custom Error class to be thrown in case of errors.
  // This is useful in case you are using HTTP related exception libraries and want to catch all those errors in an express error handler
  customErrorClass: Error,
  // Here you can disable MongoDB operators you don't want to support or add others. This example shows default ones.
  operators: {
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
  },
})
```