var express = require('express');
var mysql = require('./dbcon.js');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var session = require('client-sessions');
var bodyParser = require('body-parser');
var request = require('request');


app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3000);
app.use(express.static('public'));
app.use(session({
  cookieName: 'mySession', // cookie name dictates the key name added to the request object
  secret: 'blargadeeblargblarg', // should be a large unguessable string
  duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
  activeDuration: 1000 * 60 * 5 // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
}));


app.get('/login', function(req, res) {
  mysql.pool.query("SELECT * FROM hh_User WHERE Email=?", req.query.Email, function(err, row, fields) {
    //If the query result is empty then no email exists.
    if (row == null) {
      console.log("User email not found");
      //Send back to login
      res.render('login');    //Render the login Handlebars page
    //Else a matching email was found and now we can test against password
    } else {
      //If the password is correct matches whats in the database 
      if (req.query.Password == row[0].Password) {
        
        // We need to sets a cookie or session with the user's info here
        //req.session.userid = row[0].UserId;
        
        res.redirect('/requests');
      } else {
        console.log("Wrong Password");
        res.render('login');
      }
    }
  });
});

app.get('/registration',function(req,res,next){
  var context;
  if(req.query.Email != ""){
    mysql.pool.query("INSERT INTO hh_User (`FirstName`, `LastName`, `Email`, `Password`, `Phone`, `AddressLine1`, `AddressLine2`, `City`, `State`, `Zip`) VALUES (?,?,?,?,?,?,?,?,?,?)", 
      [req.query.FirstName, req.query.LastName, req.query.Email, req.query.Password, req.query.Phone, req.query.Address1, req.query.Address2, req.query.City, req.query.State, req.query.Zip], 
      function(err, result){
        if(err){
          console.log(err);
        }
        res.render('requests');
    });
  }
});

app.get('/requests',function(req,res,next){
  var context;
  var time = new Date();
  if(req.query.Description != ""){
    //Need to replace 1 with actual requesterID when sessions is figured out
    mysql.pool.query("INSERT INTO hh_Request (`Description`, `RequestType`, `DateRequested`, `RequesterId`) VALUES (?,?,?,?)", 
      [req.query.Description, req.query.RequestType, time, 1], 
      function(err, result){
        if(err){
          console.log(err);
        }
        res.render('requests');
      });
  }
});

app.get('/list',function(req,res,next){
  var context;
  mysql.pool.query('SELECT * FROM hh_Request', function(err, rows, fields){
    if(err){
      console.log(err);
    }
    var text = '{"dataList" :' + JSON.stringify(rows) + '}';
    context = JSON.parse(text);
    res.render('jobs', context);
  });
});

app.get('/pickJob',function(req,res,next){
  var context;
  //Once we get the sessions working, we can run this code.
  mysql.pool.query("UPDATE hh_Request SET VolunteerId=?  WHERE id=? VALUES (?,?)",
  [req.session.UserId, req.query.id], function(err, rows, fields){
    if(err){
      console.log(err);
    }
    res.render('jobs');
  });
});

app.get('/',function(req,res,next){
  res.render('login');
});


app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});