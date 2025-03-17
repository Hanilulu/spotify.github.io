const Koa = require('koa')   // for handling Web communication
const bodyParser = require('koa-bodyparser')   // for handling POST method, not needed for GET method
const cors = require('koa2-cors') // for specifying Cross-Origin Resource Sharing

// create app instance
const app = new Koa()

// middleware functions
app.use(bodyParser())     // for handling POST method

app.use(cors({   
  origin: function(ctx) {
    switch (ctx.request.path.substr(0,3)) {
	  case '/ZZ': return 'https://singpioneers.sg'; break;  // ZZ API will accept queries only from a webpage from singpioneers.sg domain
	  default: return '*';
	}
  },
  allowMethods: ['GET', 'POST'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}))


// Require the routers here
let singpioneers_get = require('./singpioneers.get.js')
let singpioneers_post = require('./singpioneers.post.js')


// use the routers here
app.use(singpioneers_get.routes())
app.use(singpioneers_post.routes())


app.on('error', function(err) {
    console.log('logging error ', err.message)
    console.log(err)
  })

app.listen(8080)