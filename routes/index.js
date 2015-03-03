var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var app = express();
// var uploadManager = require('./uploadManager')(router);


/* GET home page. */
router.get('/', function(req, res) {
  res.render('./index');
});

router.get("/contact", function(req,res){
  res.render('./contact');
});

router.get("/admin", function(req,res){
  res.render('./admin');
});

router.get("/about", function(req,res){
  res.render('./about');
});

router.get("/register",function(req,res){
  res.render("./register");
});

module.exports = router;