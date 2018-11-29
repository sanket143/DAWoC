var express = require('express');
var router = express.Router();

var AWS = require("aws-sdk");

/* WARNING: DynamoDB Config */
AWS.config.update({
  region: "ap-south-1",
  endpoint: "https://dynamodb.ap-south-1.amazonaws.com"
});
var docClient = new AWS.DynamoDB.DocumentClient();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/user/signin/callback', function(req, res, next){
  console.log(req.query);
  res.redirect("/");
})

module.exports = router;
