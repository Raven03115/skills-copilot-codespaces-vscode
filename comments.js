// Create  web server

// 1. Import module
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var shortid = require('shortid');
var db = require('./db');

// 2. Create app
var app = express();

// 3. Set up app
app.set('view engine', 'pug');
app.set('views', './views');

// 4. Use middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// 5. Create router
app.get('/', function(req, res){
	res.render('index', {
		name: 'AAA'
	});
});

app.get('/users', function(req, res){
	res.render('users/index', {
		users: db.get('users').value()
	});
});

app.get('/users/search', function(req, res){
	var q = req.query.q;
	var matchedUsers = db.get('users').value().filter(function(user){
		return user.name.toLowerCase().indexOf(q.toLowerCase()) !== -1;
	});
	res.render('users/index', {
		users: matchedUsers,
		q: q
	});
});

app.get('/users/create', function(req, res){
	res.render('users/create');
});

app.get('/users/:id', function(req, res){
	var id = req.params.id;
	var user = db.get('users').find({ id: id }).value();
	res.render('users/view', {
		user: user
	});
});

app.post('/users/create', function(req, res){
	req.body.id = shortid.generate();
	db.get('users').push(req.body).write();
	res.redirect('/users');
});

// 6. Listen port
app.listen(3000, function(){
	console.log('Server listening on port ' + 3000);
});