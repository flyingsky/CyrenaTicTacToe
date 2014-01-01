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
  columns:3,
  rows:3,
  state:{
    u:0,
    o:1,
    x:-1
  },
  cells:[],
  players:[],
  nextplayer:null,
  gameOver:null
};

(function initBoard() {
  for (var i = 0; i < board.rows; i++) {
    board.cells[i] = [];
    for (var j = 0; j < board.columns; j++) {
      board.cells[i][j] = board.state.u;
    }
  }
})();

function getRowResult(cells, row) {
  var result = 0;
  for (var column = 0; column < cells[row].length; column++) {
    result += cells[row][column];
  }
  return result;
}

function getColumnResult(cells, column) {
  var result = 0;
  for (var row = 0; row < cells.length; row++) {
    result += cells[row][column];
  }
  return result;
}

function getWinner(result) {
  return result == 3 ? 'O' : (result == -3 ? 'X' : null);
}

function checkWinner() {
  var numboard = board.cells;
  var winner = null;

  //check if anyone has won on the x and y axis
  for (var r = 0; r < 3; r++) {
    winner = getWinner(getRowResult(numboard, r));
    if (!winner) {
      winner = getWinner(getColumnResult(numboard, r));
    }

    if (winner) {
      return winner;
    }
  }

  //check if anyone has won on the diagonals
  winner = getWinner(numboard[0][0] + numboard[1][1] + numboard[2][2]);
  if (!winner) {
    winner = getWinner(numboard[2][0] + numboard[1][1] + numboard[0][2]);
  }

  return winner;
}

function checkDraw() {
  var draw = 0;
  for (var r = 0; r < 3; r++) {
    for (var c = 0; c < 3; c++) {
      if (board.cells[r][c] != 0) {
        draw += 1
      }
    }
  }
  return draw == 9 ? "draw" : null;
}

io.sockets.on('connection', function (socket) {
  socket.on('login', function (data) {
    console.log(data.player);
    if (board.nextplayer === null) {
      board.nextplayer = data.player;
    }
    board.players.push(data.player);
    socket.join('players').emit('login', {
      status:'ok'
    }).emit('board', {board:board});
  });

  socket.on('cell', function (data) {
    console.log("=====cell event=====");
    console.log(data);
    if (data.state == "o") {
      board.nextplayer = "x";
    } else {
      board.nextplayer = "o";
    }

    board.cells[data.row][data.column] = board.state[data.state];

    // TODO: check game over or not
    // if game over, set flag in data, data.gameOver = x/o/xo
    console.log("CC Test");


    board.gameOver = checkWinner() || checkDraw();

    //test logs
    //console.log("draw is "+draw);
    //console.log("top left cell" + board.cells[0][0]);
    console.log("winner is " + board.gameOver);

    // send over status
    data.gameOver = board.gameOver;

    //
    data.nextplayer = board.nextplayer;
    io.sockets.in('players').emit("cell", data);
  });
});

server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
