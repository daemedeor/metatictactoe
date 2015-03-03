var io;
var gameSocket;
var tictactoegame;
var meta = {};
var firstMarker;

meta.initGame = function(err, session, socket, sessionIo){
  io = sessionIo;
  this.session = session;
  this.socket = socket;
  this.err = err;

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
  if(!meta.session){
    currentMarker = "o"
  }
  firstMarker = currentMarker;

  this.emit('newGameCreated', {gameId: thisGameId, name: "", mySocketId: this.id, marker: currentMarker, message: "game created, waiting for another"});

  this.join(thisGameId.toString());
};


function startGame(data){
  //console.log("start game");
  tictactoegame = new TicTacToeGame(data.gameId, data.currentMarker, data.hostMarker, data.playerMarker);
}

function playerJoin(data){
  var sock = this;

  var room = gameSocket.adapter.rooms[data.gameId];
  if(!meta.session){
    currentMarker = "x"
  }

  if(room != undefined){
    
    var data = {
      mySocketId: sock.id,
      gameId: data.gameId,
      marker: currentMarker,
      initialStart: firstMarker,
      playerName: data.name
    };
    sock.join(data.gameId);
    io.sockets.in(data.gameId).emit('playerJoined', data);
  }else{
    this.emit('joinError', {message: "The game does not exist!"});
  }

}

function move(data){
  //console.log("starting moving");
    console.log(data);
  
  var isLegal = tictactoegame.isLegalMove(data);
  var somethingWon = false;
  
  //console.log("legal state " + isLegal);

  if(isLegal){
    tictactoegame.numOfMoves++;
    console.log(tictactoegame["GameBoard-" + data.nextMove]);
    somethingWon = tictactoegame.determineStateOfBlock(data.currentMove, tictactoegame["GameBoard-" + data.nextMove], data);
    console.log(tictactoegame["GameBoard-" + data.nextMove]);
    
    if(somethingWon){
      somethingWon = tictactoegame.CheckAllBoardPieces(data.currentMarker, data);
    }
  
    data = tictactoegame.switchRole(data);
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
  
  console.log("reset");
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
      console.log("winnnnning");
      data.currentMarker = this.currentMarker;
      data.x = whichBlock.x;
      data.y = whichBlock.y;
      io.sockets.emit("blockwon", data);
      
      return true;
    }
  }

  if(whichBlock.numOfMoves == (this.boardSize * this.boardSize)){
    whichBlock.filled = true;
    this.board[whichBlock.x][whichBlock.y] = ".z;";
    data.currentMarker = this.currentMarker;
    data.x = whichBlock.x;
    data.y = whichBlock.y;

    io.sockets.in(data.gameId).emit("blocktied", data);
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

    io.sockets.in(data.gameId).emit("blocktied", data);
    return true;
  }

  return false;
}

TicTacToeGame.prototype.isLegalMove = function(data){
 

  if((this.previousGameMove != "start" || this.previousGameMove != data.nextMove) && this.currentMarker != data.currentMarker){
    return false;
  }else{
    this.previousGameMove = data.currentMove;
  }

  if(!data.ElemText && !this["GameBoard-" + data.currentMove].won && !this["GameBoard-" + data.currentMove].filled && !this.won ){
    return true;
  }else{
    return false;
  }

};

module.exports = meta;