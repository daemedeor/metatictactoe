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
	this.currentMarker = this.turn.marker;
	this.board = [[0,0,0], [0,0,0], [0,0,0]];
}

function SmallerGameBoard(){
	this.board = [[0,0,0], [0,0,0], [0,0,0]];
	this.won = null;
}

TicTacToeGame.prototype.refreshGame = function() {
	$(".main-grid").data("filled") = false;
	$(".inside-grid").html("");
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

TicTacToeGame.prototype.determineStateOfBlock = function(whichBlock){

};

TicTacToeGame.prototype.isLegalMove = function(clickedBlock){
	var clickBlockElem = $(clickedBlock);
	var clickBlockMain = $(clickedBlock).parent().parent(".main-grid");
	var anyText = $(clickedBlock).html();

	if((anyText == "" || anyText == null || anyText == " ") && clickBlockMain.data('filled') != "false"){
		return true;
	}else{
		return false;
	}

};
