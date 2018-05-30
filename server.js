var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var router = express.Router();

var PORT = process.env.PORT || 3000;

var app = express();

app.use(express.static(__dirname + '/'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

router.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + '/index.html'));
});

app.use('/', router);

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
});

// Listener - Start the server
app.listen(PORT, function() {
  console.log("App listening on PORT: " + PORT);
});