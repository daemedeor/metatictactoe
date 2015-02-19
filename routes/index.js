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
  res.render('./Contact/index');
});

router.get("/admin", function(req,res){
  res.render('./Admin/admin');
});

router.get("/about", function(req,res){
  res.render('./About/about');
});

router.get("/register",function(req,res){
  res.render("./Register/register");
});

router.get("/login", function(req,res){
  res.render("./Register/login");
});

module.exports = router;