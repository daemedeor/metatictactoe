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
	this.won = false;
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
	}
}

TicTacToeGame.prototype.isLegalMove = function(clickedBlock){
	var clickBlockElem = $(clickedBlock);
	var clickBlockMain = $(clickedBlock).parent().parent(".main-grid").attr("class");
	var anyText = clickBlockElem.html();
	var classBlock = clickBlockElem.attr("class");
	var pattern = /(\d{1}-\d{1})/g;
	var pattern1 = /(\d{1}-\d{1})/g;
	var currentBoardNumber = pattern.exec(clickBlockMain)[0];
	var innerBoardNumber = pattern1.exec(classBlock)[0];

	if((anyText == "" || anyText == null || anyText == " ") && !this["GameBoard-"+currentBoardNumber].won && !this["GameBoard-"+currentBoardNumber].filled && !this.won ){
		this.noOfTurns++;
		this.determineStateOfBlock(innerBoardNumber, this["GameBoard-"+currentBoardNumber]);
		$(".main-grid").addClass('disabled');
		$(".main-grid."+innerBoardNumber).removeClass('disabled');
		return true;
	}else{
		
		this.CheckAllBoardPieces(this.player1);
		this.CheckAllBoardPieces(this.player2);
		return false;
	}

};

TicTacToeGame.prototype.isRightBox
 = function(first_argument) {
	// body...
};