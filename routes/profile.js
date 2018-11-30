var express = require('express');
var router = express.Router();

const AWS = require("aws-sdk");

// AWS Configuration
AWS.config.update({
  region: "ap-south-1",
  endpoint: "https://dynamodb.ap-south-1.amazonaws.com"
});
const docClient = new AWS.DynamoDB.DocumentClient();  

/* GET users listing. */
router.get('/', function(req, res, next) {
  let uid = !req.cookies["DAWOC_UID"] ? false : req.cookies["DAWOC_UID"];
  console.log(uid);

  if(uid){
    let params = {
      TableName: "Users",
      Key: {
        uid: uid
      }
    };

    docClient.get(params, function(err, result){
      if(err){
        console.log("Error:", err);
        res.send("Error");
      } else {
        console.log(result);
        res.render("profile", result);
      }
    });
  } else {
    res.redirect("/");
  }

});

router.get("/logout", function(req, res){
  res.clearCookie("DAWOC_UID");
  res.redirect("/");
})

module.exports = router;
