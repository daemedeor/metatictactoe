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
	this.noOfTurns = noOfTurns;
	this.turn = player1;
	this.boardSize = 3;
	this.mainBlock = true;
	this.currentMarker = this.turn.marker;
	this.board = [[0,0,0], [0,0,0], [0,0,0]];
	this.SetUpGame();
}

function SmallerGameBoard(){
	this.board = [[0,0,0], [0,0,0], [0,0,0]];
	this.won = false;
	this.mainBlock = false;
	this.x;
	this.y;
}

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
	$(".main-grid").data("filled") = false;
	$(".inside-grid").html("");
	this.SetUpGame();
};

TicTacToeGame.prototype.determineWinner = function(stateOfGame, whoWon, whoLost){

	if(whoWon != null && whoLost != null){

		if(stateOfGame == "done"){
			whoWon.wins++;
			whoLost.losses++;	
		}
		if(stateOfGame == "tied"){
			whoWon.ties++;
			whoLost.ties++;
		}		
	}
};

TicTacToeGame.prototype.switchTurns = function(player){
	this.turn = player;
	this.currentMarker = player.marker;
};

TicTacToeGame.prototype.determineStateOfBlock = function(coordinates, who, whichBlock, mainBlock){
	var row = 0, column = 0, diagnal = 0, antiDiagnal = 0;
	var x = coordinates.charAt(0);
	var y = coordinates.charAt(2);

	whichBlock.board[x][y] = who.marker;

	for(var i = 0; i < this.boardSize; i++){
		if(whichBlock.board[x][i] == who.marker) column++;
		if(whichBlock.board[i][y] == who.marker) row++;
		if(whichBlock.board[i][i] == who.marker) diagnal++;
		if(whichBlock.board[i][length - i -1] == who.marker) antiDiagnal++; 
	}
	
	if(column >= this.boardSize || row >= this.boardSize || diagnal >= this.boardSize || antiDiagnal >= this.boardSize){
		if(!whichBlock.mainBlock){
			whichBlock.state == "won";
			whichBlock.won = true;
			mainBlock.board[x][y] = who.marker;
			$("."+coordinates+".main-grid").addClass(who.marker);
			console.log("you won");

		}else{
			console.log("you won");
		}
	}
};


TicTacToeGame.prototype.isLegalMove = function(clickedBlock){
	var clickBlockElem = $(clickedBlock);
	var clickBlockMain = $(clickedBlock).parent().parent(".main-grid").attr("class");
	console.log(clickBlockMain);
	var anyText = clickBlockElem.html();
	var classBlock = clickBlockElem.attr("class");
	var pattern = /(\d{1}-\d{1})/g;
	var pattern1 = /(\d{1}-\d{1})/g;
	var currentBoardNumber = pattern.exec(clickBlockMain)[0];
	var innerBoardNumber = pattern1.exec(classBlock)[0];

	if((anyText == "" || anyText == null || anyText == " ") && !this["GameBoard-"+currentBoardNumber].won){
		this.noOfTurns++;
		this.determineStateOfBlock(innerBoardNumber, this.turn, this["GameBoard-"+currentBoardNumber], this);
		return true;
	}else{
		return false;
	}

};
