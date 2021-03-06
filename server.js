// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/test", function (request, response) {
  response.sendFile(__dirname + '/views/test.html');
});

app.get("/demos/focus", function (request, response) {
  response.sendFile(__dirname + '/views/focus.html');
});
// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.get("/trump", function (request, response) {
    response.sendFile(__dirname + '/views/trump.blog.html');
});

// listen for requests :)
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
