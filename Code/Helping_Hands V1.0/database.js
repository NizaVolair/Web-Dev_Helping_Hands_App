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


app.post('/login', function(req, res) {
  User.findOne({ Email: req.body.Email }, function(err, user) {
    if (!user) {
      res.render('login.jade', { error: 'Invalid email or password.' });
    } else {
      if (req.body.Password === user.Password) {
        // sets a cookie with the user's info
        req.session.UserId = user.UserId;
        res.redirect('/requests');
      } else {
        res.render('login.jade', { error: 'Invalid email or password.' });
      }
    }
  });
});

app.get('/registration',function(req,res,next){
  var context;
  if(req.query.name != ""){
    mysql.pool.query("INSERT INTO hh_User (`FirstName`, `LastName`, `Email`, `Phone`, `Address1`, `Address2`, `City`, `State`, `Zip`) VALUES (?,?,?,?)", [req.query.FirstName, req.query.LastName, req.query.Email, req.query.Phone, req.query.Address1, req.query.Address2, req.query.City, req.query.State, req.query.Zip], function(err, result){
    res.render('requests');
    });
  }
});

app.get('/requests',function(req,res,next){
  var context;
  var time = new Date();
  if(req.query.name != ""){
    mysql.pool.query("INSERT INTO hh_Request (`Description`, `RequestType`, `DateRequested`) VALUES (?,?,?)", [req.query.Description, req.query.RequestType, time], function(err, result){
    res.render('requests');
    });
  }
});

app.get('/list',function(req,res,next){
  var context;
  mysql.pool.query('SELECT * FROM hh_Request', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    var text = '{"dataList" :' + JSON.stringify(rows) + '}';
    context = JSON.parse(text);
    res.render('jobs', context);
  });
});

app.get('/pickJob',function(req,res,next){
  var context;
  var time = new Date();
  mysql.pool.query("UPDATE hh_Request SET VolunteerId=? WHERE id=?",
  [req.session.UserId, req.query.id], function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    res.render('requests');
  });
});

app.get('/',function(req,res,next){
  var context;
  mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    var text = '{"dataList" :' + JSON.stringify(rows) + '}';
    context = JSON.parse(text);
    res.render('login', context);
  });
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