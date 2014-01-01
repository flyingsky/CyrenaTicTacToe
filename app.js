
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
  players: [],
  nextplayer:null,
gameOver:null
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
            if(board.nextplayer === null)
            {
            board.nextplayer=data.player;
            }
    board.players.push(data.player);
    socket.join('players').emit('login', {
      status: 'ok'
    }).emit('board', {board: board});
  });

  socket.on('cell', function(data){
    console.log("=====cell event=====");
    console.log(data);
            if(data.state == "o")
            {
            board.nextplayer="x";
            } else
            {
            board.nextplayer="o";
            }

    board.cells[data.row][data.column] = data.state;
            
            // TODO: check game over or not
            // if game over, set flag in data, data.gameOver = x/o/xo
            console.log("CC Test");
            
            var winner = null;
            var draw ,row0, row1, row2, c0, c1, c2, d1, d2;
            row0 = row1 = row2 = c0 = c1 = c2 = d1 = d2 = draw = 0;
            
            //count the number of spaces filled on the board
            for ( var r = 0; r < 3; r++)
            {
            for ( var c = 0; c < 3; c++)
            {
            if(board.cells[r][c] == "x"){draw = draw + 1} else if (board.cells[r][c] == "o") { draw = draw + 1} {draw = draw}
            
            }
            }
            
            //create a numberic board
            var numboard = [[0,0,0],[0,0,0],[0,0,0]];

            for ( var r = 0; r < 3; r++)
            {
            for ( var c = 0; c < 3; c++)
            {
            if(board.cells[r][c] == "x")
            {
            numboard[r][c] = -1;
            } else if (board.cells[r][c] == "o")
            {
            numboard[r][c] = 1;
            }
            }
            }
            
            //check if anyone has won on the x and y axis
            for ( var r = 0; r < 3; r++)
            {
            c0 = numboard[r][0] + c0;
            c1 = numboard[r][1] + c1;
            c2 = numboard[r][2] + c2;
            }
            
            for ( var c = 0; c < 3; c++)
            {
            row0 = numboard[0][c] + row0;
            row1 = numboard[1][c] + row1;
            row2 = numboard[2][c] + row2;
            }
            
            //check if anyone has won on the diagonals
            d1 = (numboard[0][0]+numboard[1][1]+numboard[2][2]);
            d2 = (numboard[2][0]+numboard[1][1]+numboard[0][2]);
            
            //see who has won finally
            if (draw >=5)
            {
            var cc = -3;
                if((row0 == cc)||(row1 == cc)||(row2 == cc)|| (c0 == cc) || (c1 == cc) || (c2 == cc) || (d1 == cc) || (d2 == cc))
            {
                winner = "X";
            }
            var cc = 3;
            if((row0 == cc)||(row1 == cc)||(row2 == cc)|| (c0 == cc) || (c1 == cc) || (c2 == cc) || (d1 == cc) || (d2 == cc))
            {
            winner = "O";
            }
            }
            
            // if board is full and winner is null then its a draw
            if((draw == 9) && (winner == null))
            {
            winner = "draw";
            }
            
            board.gameOver = winner;
            
            //test logs
            //console.log("draw is "+draw);
            //console.log("numboard is"+numboard[0][0]);
            //console.log("top left cell" + board.cells[0][0]);
            console.log("row0, row1, row2, c0, c1, c2, d1, d2");
            console.log(row0, row1, row2, c0, c1, c2, d1, d2);
            //console.log("row 0 is" + row0);
            console.log("winner is " + winner);
            
            // send over status
            data.gameOver = board.gameOver;
            
            //
            data.nextplayer = board.nextplayer;
    io.sockets.in('players').emit("cell", data);
  });
});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
