
(function($){
	
	var player1 = new Player("Justin", "o", 0, 0, 0), player2 = new Player("Brian", "x", 0, 0, 0);
	var game = new TicTacToeGame(player1, player2, 0);
	var currentMarker;

	$(".inside-grid").click(function(e){
		e.preventDefault();
		var clickBlockMain = $(this).parent().parent(".main-grid");
		if(!clickBlockMain.hasClass('disabled') && !clickBlockMain.hasClass('x') && !clickBlockMain.hasClass('o') && !clickBlockMain.hasClass('tied')){
			currentMarker = game.currentMarker;
			currentPlayer = game.turn;
			
			if(currentPlayer == player1){
				nextPlayer = player2;
			}else{
				nextPlayer = player1;
			}
			
					
			if(game.isLegalMove(this)){
				
				$(this).html(currentMarker);
			
				game.switchTurns(nextPlayer);

			}
	
		}
		
	});

	$("#reset").click(function(e){
		game.refreshGame();
	});

})(jQuery);