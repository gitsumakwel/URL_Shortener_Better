// server.js
// where your node app starts

// init project
var validator = require('validator');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
const dns = require('dns');

//log all request
//request object, response object, next function
const posthandler = (req,res,next) => {
    //log the request
    console.log(`${req.method} ${req.path} - ${req.ip}`);
    // you need to declare, coz your server will get stuck
    next();
}

//11-19/2021

const done = (error,result) => {  
    console.log(result);  
}
//set up database
const { connector } = require('./src/database');
const { ShortenURL,createAndSaveShortenURL,findShortenURL,getAll,deleteAll } = require('./src/model/shortenurl');
//createAndSaveShortenURL({originalurl:'https://www.google.com',shortenurl:'abc1'},done)


//choose your random key generator:)
const { shortid,translator } = require('./src/shortuuid');
const customId = require("custom-id");
const { randomkey } = require('./src/randomkey'); //randomkey(length);


//import Swagger API Documentation
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Extended: https://swagger.io/specification/#infoObject
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      version: "1.0.0",
      title: "URL Shortener",
      description: "FCC Backend Project - URL Shortener Microservice",
      contact: {
        name: "Brill Jasper Amisola Rayel"
      },
    }
  },
  // ['.routes/*.js']
  apis: ["server.js"]
};


const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//app.use - only for GET request
//use to include static assets needed by your application (stylesheets, scripts, images)
app.use('/public',express.static(__dirname + '/public'));
// will be called for any request
// use for loging request
app.use(posthandler); 
// use for 'POST' request
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

//see if shorturl exists
//recursion if exists
//save to database for non exists and respond with json
//ShortenURL.findOne({shorturl:'30DR11UC'}).exec().then((result)=>console.log(result)); 
const recursion = (req,res) => {
  //get url from post  
  const len = Math.floor(Math.random() * 8) + 3;
  let shorturl = randomkey(len).join('');   
  let x = findShortenURL(shorturl,done);
  
  x.then( (result) => {  
    if (result !== null) {
        console.log('exists, retry shorturl...');
        recursion(req,res);
        x = findShortenURL(shorturl,done);
    }
    else {      
      console.log('no duplicate, shorturl created!');
      //save to database here.
      createAndSaveShortenURL({originalurl:req.body.url,shorturl:shorturl},done)
      res.json({ original_url : req.body.url, short_url : shorturl });
    }
  });
}

class Future extends Object{
  constructor(){
    super();
    this.result = null;
  }
}

const checkConnection = async (host, future) => {  
  return await dns.lookup(host, function (err, address, family) {
				if (err) {
					future.result = {returnValue: false};
				} else {
					future.result = {returnValue: true, ip: address, family: family};
				}        
			})

}

//API - /api/shorturl
const postShortURL = (req,res,next) => {
    //process valid url
    let future = new Future();
    if (validator.isURL(req.body.url)) {
      //check if URL is working 
      //1.strip https to confirm dns
      //1.1 check if there is http or https
      let stripped = req.body.url;
      if (/https?/.test(req.body.url)){
        stripped = req.body.url.match(/((?<=http:\/\/)|(?<=https:\/\/)).*/g)[0];

      }
      //2.get info of the stripped url
      checkConnection(stripped,future).then(        
        (resolve)=>{          
          recursion(req,res);     
        }
      );
    } else {
      console.log("invalid url...", req.body.url);
      res.json({ error: 'invalid url' });
    }
    
}

//API - /api/shorturl/{short_url}
const getVisitURL = (req,res,next) => {
  const url = req.params.short_url;  
  if (validator.matches(url,/[\w\\+-\\*_\\.@$^=]{3,8}/)) {
    //check in database shorturl
    //extract original
    let x = findShortenURL(url,done);
    x.then((result)=>{      
      let complete = result.originalurl;
      console.log('-----------------------------------');
      if (!(/https?:\/\//.test(result.originalurl))){
        complete = 'https://'+complete;
      }
      console.log(complete);
      console.log('-----------------------------------');
      //2.get info of the stripped url      
      //301 permanent URL change
      //302 temporary change 
      //307 temporary change POST
      //res.set({Origin: '*'});
      res.redirect(301,complete);          
    });

  } else {
    console.log("invalid short url", url)
    re.json({ error: 'invalid url' });
  }
}



// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


/**
* @swagger
*  /api/shorturl:
*  post:
*      description: Shorten a url
*      consumes:
*          - application/json
*          - application/x-www-form-urlencoded
*      parameters:
*        - in: body
*          name: url
*          description: url to shorten
*          schema:
*              type: object
*              required:
*                 - url
*              properties:
*                 url:
*                   type: string
*      responses:
*          200:
*              description: URL
*/
app.route('/api/shorturl').post(postShortURL).get(function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});
/**
* @swagger
*  /api/shorturl/{short_url}:
*    get:
*      description: translate shortened URL into original URL
*      parameters:
*        - in: path
*          name: short_url
*          required: false
*          description: shortened url
*          produces: text/html; charset=utf-8
*          schema:
*            type: string
*      responses:
*        '301':
*          description: Auto generated using Swagger Inspector
*          content: 
*            text/html; charset=utf-8:
*            schema: 
*               type: string
*      servers:
*        - url: https://boilerplate-project-urlshortener.gitsumakwel.repl.co
*    servers:
*      - url: https://boilerplate-project-urlshortener.gitsumakwel.repl.co
*/
app.route('/api/shorturl/:short_url?').get(getVisitURL);

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

