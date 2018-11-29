const express = require('express');
const router = express.Router();
const request = require('request');

const AWS = require("aws-sdk");


/* WARNING: DynamoDB Config */
AWS.config.update({
  region: "ap-south-1",
  endpoint: "https://dynamodb.ap-south-1.amazonaws.com"
});
const docClient = new AWS.DynamoDB.DocumentClient();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/user/signin/callback', function(req, res, next){
  const code = req.query.code // GitHub Response Client code;

  var getAccessToken = new Promise((resolve, reject) => {
    request.post(
      "https://github.com/login/oauth/access_token",
      {
        json: {
          client_id: "14adcfea97df1c43f605",
          client_secret: process.env.CLIENT_SECRET,
          code: code
        }
      },
      function(err, res, body){
        if(!err && res.statusCode == 200){
          resolve(body.access_token);
        } else {
          reject(err);
        }
      }
    );
  }); // Promise(getAccessToken)

  var getUserData = new Promise((resolve, reject) => {
    getAccessToken.then((access_token) => {
      request.get(
        "https://api.github.com/user?access_token=" + access_token,
        {
          headers: {
            "User-Agent": "Sanket Chaudhari"
          }
        },
        function(err, res, body){
          if(!err && res.statusCode == 200){
            resolve(body);
          } else {
            reject(err);
          }
        }
      )
    }).catch((err) => {
      console.log("Error in getting Access Token:", err)
    });
  }); // Promise(getUserData)

  getUserData.then((userData) => {
    console.log(userData);
  }).catch((err) => {
    console.log("Error getting user Data:", err);
  });

  res.redirect("/");
})

router.post("/", (req, res) => {
  console.log(req.body);
  res.redirect("/");
});
module.exports = router;
