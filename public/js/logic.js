
(function($){
	
	//get the current person details if logged in
	
	//or ask for the two players
	
	var player1 = new Player("Justin", "o", 0, 0, 0), player2 = new Player("Brian", "x", 0, 0, 0);
	var game = new TicTacToeGame(player1, player2, 0);
	var currentMarker;

	$.post('/game/init', {player1: player1, player2: player2, game: game}, function(data, textStatus, xhr) {
		//set the game to be seen
		var currentGame = data.game;
		//tell the players to start
		
		//
	});

	$(".inside-grid").click(function(e){

		e.preventDefault();
	
		var clickBlockMain = $(this).parent().parent(".main-grid");
		
		if(!clickBlockMain.hasClass('disabled') && !clickBlockMain.hasClass('x') && !clickBlockMain.hasClass('o') && !clickBlockMain.hasClass('tied') && !game.won){
			currentMarker = game.currentMarker;
			currentPlayer = game.turn;
			
			$.post('/game/logic', {currentPlayer: player1, game: game}, function(data, textStatus, xhr) {
		
			});

			if(currentPlayer == game.player1){
				nextPlayer = game.player2;
			}else{
				nextPlayer = game.player1;
			}
			
					
			if(game.isLegalMove(this)){
				
				$(this).html(currentMarker);
			
				game.switchTurns(nextPlayer);

			}
	
		}
		game.CheckAllBoardPieces(game.player1);
		game.CheckAllBoardPieces(game.player2);
	});

	$("#reset").click(function(e){
		game.refreshGame();
	});

	$(".inside-grid").mouseenter(function(event) {
		$(".main-grid").removeClass('selected');
		event.preventDefault();
		var currElem = $(this).parent().parent(".main-grid");
		var currClass = $(this).attr("class");
		if(!currElem.hasClass('disabled')){
			var innerBoardNumber = $(this).data('coordinates');
			$(".main-grid."+innerBoardNumber).addClass('selected');	
		}
		
	});

	$("#board").mouseleave(function(event) {
		event.preventDefault();
		$(".main-grid").removeClass('selected');
	});
})(jQuery);