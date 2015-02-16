
(function($){
	
	var player1 = new Player("Justin", "O", 0, 0, 0), player2 = new Player("Brian", "X", 0, 0, 0);
	var game = new TicTacToeGame(player1, player2, 0);
	var currentMarker;

	$(".inside-grid").click(function(e){
		e.preventDefault();
		
		currentMarker = game.currentMarker;
		currentPlayer = game.turn;
		
		if(currentPlayer == player1){
			nextPlayer = player2;
		}else{
			nextPlayer = player1;
		}
		
		//var clickBlockClass = $(clickedBlock).attr("class");
				
		if(game.isLegalMove(this)){
			
			$(this).html(currentMarker);
		
			game.switchTurns(nextPlayer);

		}

	});

})(jQuery);