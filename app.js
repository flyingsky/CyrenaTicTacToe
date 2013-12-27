
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');

var app = express(),
  server = require('http').createServer(app)
  io = require('socket.io').listen(server);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/views/index.html');
});


////// Tic Tac Toe Logic

var board =
{
  columns: 3,
  rows: 3,
  state: {
    u: 0,
    o: 1,
    x: -1
  },
  cells: [],
  players: []
};

(function initBoard() {
  for (var i = 0; i < board.rows; i++)
  {
    board.cells[i] = [];
    for (var j = 0; j < board.columns; j++)
    {
      board.cells[i][j] = board.state.u;
    }
  }
})();

io.sockets.on('connection', function (socket) {
  socket.on('login', function (data) {
    console.log(data.player);
    board.players.push(data.player);
    socket.join('players').emit('login', {
      status: 'ok'
    }).emit('board', {board: board});
  });

  socket.on('cell', function(data){
    console.log("=====cell event=====");
    console.log(data);

    board.cells[data.row][data.column] = data.state;
    io.sockets.in('players').emit("cell", data);
  });
});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
