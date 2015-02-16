(function($){
	


	var player1, player2, currentTurn;


	$(".inside-grid").click(function(e){
		e.preventDefault();
		console.log($(this).attr("class"));
		console.log($(this).parent().parent(".main-grid").attr("id"));
	});

})(jQuery);