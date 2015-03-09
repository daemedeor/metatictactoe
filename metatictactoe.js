var io;
var gameSocket;
var tictactoegame;
var meta = {};
var firstMarker;
var SessionSockets;

meta.initGame = function(err, session, socket, sessionIo, SessionSocketsInit){
  io = sessionIo;
  this.session = session;
  this.socket = socket;
  this.err = err;
  SessionSockets = SessionSocketsInit;

  gameSocket = socket;
  gameSocket.emit('connected', {message: "You are Connected!"});

  gameSocket.on('newGameCreated', createNewGame);
  gameSocket.on('startGame', startGame);
  

  gameSocket.on('playerJoin', playerJoin);
  gameSocket.on('move', move);
  gameSocket.on('restart', restartGame);
}

function createNewGame(){
  var thisGameId = (Math.random() * 100000) | 0;
  var name, marker;
  var $this = this;
  
    SessionSockets.getSession(gameSocket, function (err, session) {
     
      if(!session){
        currentMarker = "o"
      }else{
        currentMarker = session.data.marker;
      }

      $this.emit('newGameCreated', {gameId: thisGameId, name: "", mySocketId: $this.id, marker: currentMarker, message: "game created, waiting for another"});

      $this.join(thisGameId.toString());  
    });

};


function startGame(data){
  //console.log("start game");
  tictactoegame = new TicTacToeGame(data.gameId, data.currentMarker, data.hostMarker, data.playerMarker);
}

function playerJoin(data){
  var $this = this;
  var currentData = data;
  SessionSockets.getSession(gameSocket, function (err, session) {
    var room = gameSocket.adapter.rooms[currentData.gameId];
   console.log(session);
    if(!session){
      currentMarker = "o"
    }else{
      currentMarker = session.data.marker;
    }

    if(room != undefined){
  
      var data = {
        mySocketId: $this.id,
        gameId: data.gameId,
        marker: currentMarker,
        initialStart: firstMarker,
        playerName: data.name
      };
      $this.join(data.gameId);
      io.sockets.in(data.gameId).emit('playerJoined', data);
    }else{
      $this.emit('joinError', {message: "The game does not exist!"});
    }
  });

}

function move(data){

  
  var isLegal = tictactoegame.isLegalMove(data);
  var somethingWon = false;
  
  //console.log("legal state " + isLegal);

  if(isLegal){
    tictactoegame.numOfMoves++;

    somethingWon = tictactoegame.determineStateOfBlock(data.currentMove, tictactoegame["GameBoard-" + data.nextMove], data);
    
    if(somethingWon){
      somethingWon = tictactoegame.CheckAllBoardPieces(data.currentMarker, data);
    }
    data = tictactoegame.switchRole(data);
    
    if(tictactoegame["GameBoard-" + data.currentMove].won || tictactoegame["GameBoard-" + data.currentMove].filled){
      data.openGrid = true;
    }
    
    io.sockets.in(data.gameId).emit('playerMoved', data);

  }else{
    somethingWon = tictactoegame.CheckAllBoardPieces(data.currentMarker, data);
    io.sockets.in(data.gameId).emit('failMove', data);

  }

}

function restartGame(data){
  data.playerId = this.id;
  io.sockets.in(data.gameId).emit('playerJoinedRoom', data);
}


function Player(name, marker, wins, losses, ties){
  this.name = name;
  this.marker = marker;
  this.wins = wins;
  this.losses = losses;
  this.ties = ties;
  this.boardFull = false;
};

function TicTacToeGame(gameId, marker, hostMarker, playerMarker){
  this.gameId = gameId;
  this.numOfMoves = 0;
  this.boardSize = 3;
  this.mainBlock = true;
  this.currentMarker = marker;
  this.hostMarker = hostMarker;
  this.playerMarker = playerMarker;
  this.board = [[0,0,0], [0,0,0], [0,0,0]];
  this.won = false;
  this.previousGameMove = "start";
  this.SetUpGame();
};

function SmallerGameBoard(){
  this.board = [[0,0,0], [0,0,0], [0,0,0]];
  this.won = false;
  this.filled = false;
  this.mainBlock = false;
  this.x;
  this.numOfMoves = 0;
  this.y;
};

TicTacToeGame.prototype.switchRole = function(data) {
  if(data.currentMarker == this.hostMarker){
    data.nextRole = "player";
    data.currentMarker = this.playerMarker;
    data.previousMarker = this.hostMarker;
    this.currentMarker = this.playerMarker;
  }else{
    data.nextRole = "host";
    data.currentMarker = this.hostMarker;
    this.currentMarker = this.hostMarker;

    data.previousMarker = this.playerMarker;
  }

  return data;
};

TicTacToeGame.prototype.SetUpGame = function() {
  
  
  this.board = [[0,0,0], [0,0,0], [0,0,0]];
  
  for(var i = 0; i < 3; i++){
    for(var q = 0; q < 3; q++){
      newSmallGameBoard = new SmallerGameBoard();
      newSmallGameBoard.x = i;
      newSmallGameBoard.y = q;
      this.addBoard("GameBoard-" + i +"-"+q, newSmallGameBoard);
    }
  }

};

TicTacToeGame.prototype.addBoard = function(boardName, boardObject) {
  this[boardName] = boardObject;

};

TicTacToeGame.prototype.refreshGame = function() {

  this.SetUpGame();
};


TicTacToeGame.prototype.determineStateOfBlock = function(coordinates, whichBlock, data){
  var row = 0, column = 0, diagnal = 0, antiDiagnal = 0;
  var x = coordinates.charAt(0);
  var y = coordinates.charAt(2);
  var data = {};
  whichBlock.numOfMoves++;
  whichBlock.board[x][y] = this.currentMarker;

  for(var i = 0; i < this.boardSize; i++){
    if(whichBlock.board[x][i] == this.currentMarker) column++;
    if(whichBlock.board[i][y] == this.currentMarker) row++;
    if(whichBlock.board[i][i] == this.currentMarker) diagnal++;
    if(whichBlock.board[i][this.boardSize - i -1] == this.currentMarker) antiDiagnal++; 
  }
  
  if(column >= this.boardSize || row >= this.boardSize || diagnal >= this.boardSize || antiDiagnal >= this.boardSize){
    if(!whichBlock.mainBlock){
      whichBlock.won = true;
      whichBlock.filled = true;
      this.board[whichBlock.x][whichBlock.y] = this.currentMarker;
      data.currentMarker = this.currentMarker;
      data.x = whichBlock.x;
      data.y = whichBlock.y;
      io.sockets.emit("blockStateChanged", data);
      
      return true;
    }
  }

  if(whichBlock.numOfMoves == (this.boardSize * this.boardSize)){
    whichBlock.filled = true;
    this.board[whichBlock.x][whichBlock.y] = ".z;";
    data.currentMarker = "tied";
    data.x = whichBlock.x;
    data.y = whichBlock.y;

    io.sockets.emit("blockStateChanged", data);
    return true;
  }

  return false;
};

TicTacToeGame.prototype.CheckAllBoardPieces = function(marker, data){
  var row = 0, column = 0, diagnal = 0, antiDiagnal = 0;
  var data = {};
  var foundAMatch = true;

  for(var i = 0; i < this.boardSize; i++){
    
    if(this.board[i][i] == marker) diagnal++;
    if(this.board[i][this.boardSize - i -1] == marker) antiDiagnal++;     
    row = 0;
    column = 0;
    for(var q = 0; q< this.boardSize; q++){
      if(this.board[i][q] == marker) column++;
      if(this.board[q][i] == marker) row++;

      if(row >= 3 || column >= 3){
        foundAMatch = false;
        break;
      }
    }
    if(!foundAMatch){
      break;
    }
  }

  if(column >= this.boardSize || row >= this.boardSize || diagnal >= this.boardSize || antiDiagnal >= this.boardSize){
    data.currentMarker = marker;
    io.sockets.in(data.gameId).emit("winner", data);
    return true;
  }
  if(this.numOfMoves == (this.boardSize * this.boardSize)){
    
    data.message = "Game Tied";

    io.sockets.in(data.gameId).emit("gameOver", data);
    return true;
  }

  return false;
}

TicTacToeGame.prototype.isLegalMove = function(data){
 

  if((this.previousGameMove != "start" || this.previousGameMove != data.nextMove || this["GameBoard-" + data.nextMove].filled) && this.currentMarker != data.currentMarker){
    return false;
  }else{
    this.previousGameMove = data.currentMove;
  }
  
  if(!data.ElemText && !this["GameBoard-" + data.nextMove].won && !this["GameBoard-" + data.nextMove].filled && !this.won ){
    return true;
  }else{
    return false;
  }

};

module.exports = meta;