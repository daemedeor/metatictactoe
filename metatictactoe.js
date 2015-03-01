var io;
var gameSocket;

exports.initGame = function(io, socket){
	this.io = io;
	gameSocket = socket;
	gameSocket.emit('connected', {message: "You are Connected!"});

	gameSocket.on('newGameCreated', createNewGame);
	gameSocket.on('fullRoom', fullRoom);
	gameSocket.on('startGame', startGame);
	

	gameSocket.on('playerJoin', playerJoin);
	gameSocket.on('playerMove', playerMove);
	//gameSocket.on('playerRestart', playerRestart);
}

function createNewGame(err, socket, session){
	var thisGameId = (Math.random() * 100000) | 0;
	var name, marker;
	console.log("new");	
	if(!session){
		currentMarker = "o"
	}

	this.emit('newGameCreated', {gameId: thisGameId, mySocketId: this.id, currentMarker: currentMarker, message: "game created, waiting for another"});

	this.join(thisGameId.toString());
};

function fullRoom(gameId, player1, player2, moves){
	var sock = this;
	var data = {
		mySocketId: sock.id,
		gameId: gameId
	};

	io.sockets.in(data.gameId).emit('beginNewGame', data);	
}

function startGame(gameId, player1, player2, moves){
	console.log('gameStarted');

	var tictactoegame = new TicTacToeGame(player1, player2, moves, gameId);

}

function playerJoin(data){
	var sock = this;

	var room = gameSocket.manager.rooms['/'+data.gameId];

	if(room != undefined){
		data.mySocketId = sock.id;
		sock.join(data.gameId);
		io.sockets.in(data.gameId).emit('playerJoinedRoom', data);
	}else{
		this.emit('error', {message: "The game does not exist!"});
	}

}

function playerMove(data){
	io.sockets.in(data.gameId).emit('')
}

function restart(data){
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

function TicTacToeGame(player1, player2, noOfTurns){
	this.player1 = player1;
	this.player2 = player2;
	this.numOfMoves = noOfTurns;
	this.turn = player1;
	this.boardSize = 3;
	this.mainBlock = true;
	this.currentMarker = this.turn.marker;
	this.board = [[0,0,0], [0,0,0], [0,0,0]];
	this.won = false;
	this.previousGameMove;
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

TicTacToeGame.prototype.SetUpGame = function() {
	
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
	$(".main-grid").removeClass('x');
	$(".main-grid").removeClass('o');
	$(".main-grid").removeClass('tied');
	$(".main-grid").removeClass('disabled');
	$(".inside-grid").html("");
	this.SetUpGame();
};

TicTacToeGame.prototype.determineWinner = function(stateOfGame, whoWon, whoLost){
	if(whoWon != null && whoLost != null){

		if(stateOfGame == "done"){
			this.won = true;
			whoWon.wins++;
			whoLost.losses++;	
		}
		
		$("#container > .displayState").html(whoWon.marker + " has won!");
		$("#container > .displayState").addClass('finished');

	}
	if(stateOfGame == "tied"){
		this.player1.ties++;
		this.player2.ties++;
	}
};

TicTacToeGame.prototype.switchTurns = function(player){
	this.turn = player;
	this.currentMarker = player.marker;
};

TicTacToeGame.prototype.determineStateOfBlock = function(coordinates, whichBlock){
	var row = 0, column = 0, diagnal = 0, antiDiagnal = 0;
	var x = coordinates.charAt(0);
	var y = coordinates.charAt(2);

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
			$("."+whichBlock.x+"-"+whichBlock.y+".main-grid").addClass(this.currentMarker);
			this.CheckAllBoardPieces(this.turn);
		}
	}
	if(whichBlock.numOfMoves == (this.boardSize * this.boardSize)){
		whichBlock.filled = true;
		this.board[whichBlock.x][whichBlock.y] = "p";
			$("."+whichBlock.x+"-"+whichBlock.y+".main-grid").addClass("tied");
	}
};

TicTacToeGame.prototype.CheckAllBoardPieces = function(who){
	var row = 0, column = 0, diagnal = 0, antiDiagnal = 0;

	var foundAMatch = true;

	for(var i = 0; i < this.boardSize; i++){
		
		if(this.board[i][i] == who.marker) diagnal++;
		if(this.board[i][this.boardSize - i -1] == who.marker) antiDiagnal++; 		
		row = 0;
		column = 0;
		for(var q = 0; q< this.boardSize; q++){
			if(this.board[i][q] == who.marker) column++;
			if(this.board[q][i] == who.marker) row++;

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
		console.log(who.name + " won the entire game");
		currentPlayer = who;
			
		if(currentPlayer == this.player1){
			loser = this.player2;
		}else{
			loser = this.player1;
		}
		this.determineWinner("won", who, loser);
	}
	if(this.numOfMoves == (this.boardSize * this.boardSize)){
		whichBlock.filled = true;
		this.board[whichBlock.x][whichBlock.y] = "p";
			$("."+whichBlock.x+"-"+whichBlock.y+".main-grid").addClass("tied");
	}
}

TicTacToeGame.prototype.isLegalMove = function(CurrentClickedObject){
	var $ClickedElem = $(CurrentClickedObject);
	var $ClickBlockMain = $ClickedElem.parent().parent(".main-grid");
	var ElemText = $ClickedElem.html();
	
	var pattern = /(\d{1}-\d{1})/g;

	var CurrCoords = pattern.exec($ClickedElem.attr("class"))[0];
	var NextCoords = pattern.exec($ClickBlockMain.attr("class"))[0];
	console.log(CurrCoords);
	console.log(NextCoords);

	if(ElemText && !this["GameBoard-"+currentBoardNumber].won && !this["GameBoard-"+currentBoardNumber].filled && !this.won ){
		this.noOfTurns++;
		
		if(this.previousGameMove != currentBoardNumber ){
			return false;
		}

		this.determineStateOfBlock(innerBoardNumber, this["GameBoard-"+currentBoardNumber]);
		
		if(!$(".main-grid."+innerBoardNumber).hasClass('x') && !$(".main-grid."+innerBoardNumber).hasClass('o') && !$(".main-grid."+innerBoardNumber).hasClass('tied') ){
			
			$(".main-grid").addClass('disabled');
			$(".main-grid."+innerBoardNumber).removeClass('disabled');
			$(".main-grid.x").removeClass('disabled');
			$(".main-grid.o").removeClass('disabled');
			$(".main-grid.tied").removeClass('disabled');

		}else{
			$(".main-grid").removeClass('disabled');

		}

		return true;
	}else{
		
		this.CheckAllBoardPieces(this.player1);
		this.CheckAllBoardPieces(this.player2);
		return false;
	}

};
