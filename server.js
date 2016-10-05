var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var classNameSpace = io.of('/class-namespace');

var adminNameSpace = io.of('/admin-namespace');

var quizStarted = false;

var users = {};

app.get('/', function(req, res){
  res.sendFile('index.html', {root: __dirname});
});

app.get('/admin', function(req, res){
  res.sendFile('admin.html', {root: __dirname});
});

classNameSpace.on('connection', function(socket){
  var user = {
  	id: socket.id
  };
  
  socket.on('response', function(response){
    adminNameSpace.emit('response', {
      response: response,
      email: user.email
    });
  });
  socket.on('email', function(email){
  	user.email = email;
  	users[email] = user;
  	adminNameSpace.emit('email', user);
  	if (quizStarted) {
	  socket.emit('new question');
  	}
  });
  socket.on('disconnect', function(){
    adminNameSpace.emit('disconnected', user);
  })
});

adminNameSpace.on('connection', function(socket){

  socket.emit('users', users);
  
  socket.on('new question', function(response){
    classNameSpace.emit('new question');
    quizStarted = true;
  });
});

http.listen(8008, function(){
  console.log('listening on *:8008');
});
