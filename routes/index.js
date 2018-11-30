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

// Token Generator
function tokenGenerator(len) {
  charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var token = '';
  for (var i = 0; i < len; i++) {
    var randomPoz = Math.floor(Math.random() * charSet.length);
    token += charSet.substring(randomPoz,randomPoz+1);
  }
  return token;
}


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/user/signin/callback', function(req, res, next){
  const code = req.query.code // GitHub Response Client code;

  let uid = req.cookies["DAWOC_UID"];
  console.log(uid);
  
  if(!uid){

    /// GET ACCESS TOKEN [PROMISE]
    let getAccessToken = new Promise((resolve, reject) => {
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
    });

    /// GET USER DATA [PROMISE]
    let getUserData = new Promise((resolve, reject) => {
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
              resolve(JSON.parse(body));
            } else {
              reject(err);
            }
          }
        )
      }).catch((err) => {
        console.log("Error in getting Access Token:", err)
      });
    });

    /// GET PROFILE DATA [PROMISE]
    let getProfileData = new Promise((resolve, reject) => {
      getUserData.then((userData) => {
        console.log(userData.login);
        request.get(
          "https://api.github.com/users/" + userData.login,
          {
            headers: {
              "User-Agent": "Sanket Chaudhari"
            }
          },
          function(err, res, body){
            console.log(body);
            if(!err && res.statusCode == 200){
              resolve(JSON.parse(body));
            } else {
              reject(err);
            }
          }
        )
      }).catch((err) => {
        console.log("Failed to get User Data:", err);
      });
    });
    
    /// CREATE USER [PROMISE]
    let createUser = new Promise((resolve, reject) => {
      getProfileData.then((userProfile) => {
        console.log(userProfile);
        var data = {
          "uid": tokenGenerator(35) + userProfile.login,
          "username": userProfile.login,
          "name": userProfile.name,
          "avatar_url": userProfile.avatar_url,
          "github_profile": userProfile.html_url,
          "repos_url": userProfile.repos_url,
        };

        var params = {
          TableName: "Users",
          Item: data,
        };

        docClient.put(params, function(err, result){
          if(err){
            reject(err);
          } else {
            resolve(data);
          }
        });
      }).catch((err) => {
        console.log("Failed to get profile Data:", err);
      });
    })

    // CHECK WHETHER USER IS LOGGED IN
  
    createUser.then((data) => {
      console.log(data);
  
      res.cookie("DAWOC_UID", data.uid, { maxAge: 900000000, httpOnly: true });
      res.redirect("/profile");
  
    }).catch((err) => {
      console.log("Failed to create User:", err);
    });
  } else {
    res.redirect("/");
  }
})

router.post("/", (req, res) => {
  console.log(req.body);
  res.redirect("/");
});
module.exports = router;
