/**
 * User: ramon
 * Date: 12/27/13 8:51 AM
 */

$(function()
{
  $.isNumeric = function(str) {
    return str && !isNaN(parseFloat(str));
  }

  var isLogin = false;

  var board =
  {
    columns: 3,
    rows: 3,
    state: {
      u: 0,
      o: 1,
      x: -1
    },
    player: null,
  nextplayer: null,
    cells: [],
  gameOver:null
  };

  var socket = null;

  function init()
  {
    initListeners();
    initSocket();
  }

  /*****************************************************************
   ****************************** UI *******************************
   *****************************************************************/

  function initListeners()
  {
    $('.player').click(function(event){
      var srcId = event.srcElement.id;
      board.player = srcId.toLowerCase().replace('player', '');
      $('#playerName').text($(event.srcElement).text()).addClass('player' + board.player.toUpperCase());
      $('.players').hide();
      $('.play-area').show();
      sendLoginRequest(board.player);
    });
  }

  function initPlayBoard()
  {
    var $board = $("#playBoard");
    for (var i = 0; i < board.rows; i++)
    {
      for (var j = 0; j < board.columns; j++)
      {
        $board.append(createCell(i, j, board.cells[i][j]));
      }
    }

    $board.click(function(event){
      if ($(event.srcElement).hasClass('cell')) {
        var cellId = event.srcElement.id;
        var ps = getCellPositionFromId(cellId);
        clickCell(ps[0], ps[1]);
      }
    });
  }

  function createCell(row, column, state) {
    var stateClass = getStateClass(state);
    var clazz = stateClass + " cell row" + row + " column" + column;
    return $("<div class='" + clazz + "' id='" + getCellId(row, column) + "'></div>");
  }

  function getStateClass(state) {
    var stateName = state;
    if ($.isNumeric(stateName)) {
      var stateIndicies = ['x', 'u', 'o'];
      stateName = stateIndicies[stateName + 1];
    }

    return "play-state-" + stateName;
  }

  function getCellId(row, column) {
    return "cell" + row + "-" + column;
  }

  function getCellPositionFromId(cellId) {
    var ps = cellId.replace("cell", "").split("-");
    return ps.map(function(i){return parseInt(i)});
  }
  
  function clickCell(row, column) {
    console.log("click " + row + ", " + column);
    if ((board.cells[row][column] == board.state.u) && (board.nextplayer==board.player))
    {
      setCellState(row, column, board.player);
      sendCellState(row, column, board.player);
    }
  }

  function setCellState(row, column, state) {
    if (board.cells[row][column] == state) {
      return;
    }

    board.cells[row][column] = board.state[state];
    $('#' + getCellId(row, column)).addClass(getStateClass(state));
    console.log(board);
  }
  
  function displaygameOver(result) {
    var textResult = result;
  // TODO: get result to display, lose or win or tie
  if(textResult == "draw")
  {
  more = "";
  } else {
  more = " WINS!!!! ";
  }
  
  var oldText = $('#playerName').text();
    $('#playerName').text(oldText + ': ' + textResult + more);
  }


  /*****************************************************************
   ************************ Talk with Server ***********************
   *****************************************************************/
  function initSocket()
  {
    socket = io.connect();

    socket.on('board', function (data)
    {
      var serverBoard = data.board;
      console.log(serverBoard);
      $.extend(board, serverBoard);
      initPlayBoard();
    });

    socket.on('login', function(data){
      console.log("========login=====");
      console.log(data);
      isLogin = true;
    });

    socket.on('cell', function(cell){
      setCellState(cell.row, cell.column, cell.state);
              board.nextplayer = cell.nextplayer;
            
              // TODO: check game over
              board.gameOver = cell.gameOver;
              if((board.gameOver !== null)||(board.gameOver == "draw"))
              {
              displaygameOver(board.gameOver);
              }
    });
  }

  function sendLoginRequest(player) {
    socket.emit('login', {
      player: player
    });
  }

  function sendCellState(row, column, state) {
    socket.emit('cell', {
      row: row,
      column: column,
      state: state
        //state is the player
    });
  }

  // start init

  init();
});