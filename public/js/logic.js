
(function($){
  
  var IO = {
    init: function(){
      IO.socket = io.connect();
      IO.bindEvents();
    },

    bindEvents: function(){
      IO.socket.on('connected', IO.onConnected);
      IO.socket.on('newGameCreated', IO.onNewGameCreated);
      IO.socket.on('playerJoined', IO.playerJoinedRoom);
      IO.socket.on('beginNewGame', IO.beginNewGame);
      IO.socket.on('checkMove', IO.checkMove);
      IO.socket.on('gameOver', IO.gameOver);
      IO.socket.on('error', IO.error);
    },

    onConnected: function(){
      App.mySocketId = IO.socket.id;
    },

    /*
      data {{gameId: int, mySocketId: string}}
     */
    onNewGameCreated: function(data){
      App.host.createGame(data);
    },
    
    /*
      data {{player: player, gameId: int, mySocketId: int}}
     */
    playerJoined: function(data){
      App.startGame(data);
    },

    beginNewGame: function(){

    },

    checkMove: function(currentMove){
      
    },

    gameOver: function(){

    },

    error: function(data){
      alert(data.message);
    }


  };

  var App = {
    
    gameId: 0,
    mySocketId: '',
    currentMarker: '',
    
    player: {
      name: "",
      marker: ""
    },

    init: function(){
      App.cacheElements();
      App.bindEvents();
      App.$mainCell.addClass('disabled');
    },
    
    cacheElements: function(){
      App.$doc = $(document);
      App.$gameArea = $("#board");
      App.$mainCell = $(".main-grid");
      App.$insideCell = $(".inside-grid");
      App.$displayGrid = $(".displayState");
      App.$modal = $("#showModal");
      //App.$coordinates = App.$insideCell.data("coordinates");
    },
    
    bindEvents: function(){
      App.$doc.on('click', "#newGame", App.host.createRoom);
      App.$doc.on('click', "#joinGame", App.player.joinRooom);
      App.$modal.on('click', "#submitButton", App.player.connectToRoom);
      
      // App.$doc.on('click', "#joinGame", App.player.joinGame);
      // App.$doc.on('click', "#resetGame", App.resetGame);
      // App.$doc.on('click', "#localGame", App.localGame);
      // App.$insideCell.click(App.move(event));
    },

    resetGame: function(){

    },

    localGame: function(){

    },

    move: function(e){


      //get the main body
      var clickBlockMain = $(this).parent().parent(".main-grid");
          
      //client side validation
      if(!clickBlockMain.hasClass('disabled') && !clickBlockMain.hasClass('x') && !clickBlockMain.hasClass('o') && !clickBlockMain.hasClass('tied')){
        
        //get the important Information
        currentMarker = App.currentMarker;
        currentPlayer = App.player;
        
        /*abstract to the backend
        if(game.isLegalMove(this)){
          
          $(this).html(currentMarker);
        
          game.switchTurns(nextPlayer);

        }
        */
    
      }
      // game.CheckAllBoardPieces(game.player1);
      // game.CheckAllBoardPieces(game.player2);
    },

    host:{
    
      name: "",
      marker: "",
      
      createRoom: function(){
        console.log("Create room");
        IO.socket.emit('newGameCreated'); 
      },

      createGame: function(data){
        App.gameId = data.gameId,
        App.mySocketId = data.mySocketId;
        App.currentMarker = data.marker;
        App.host.name = data.name;
        App.host.marker = data.marker;
        App.player = data.player;
        console.log(data);
        $("#currentMarker").html(data.currentMarker);
        $("#roomNumber").html(data.gameId);
      },

    },

    player: {
      name: "",
      marker: "",
      
      joinRooom: function(){
        $("#showModal").addClass('display');
      },

      joined: function(data){
        App.player.name = data.name;
        App.player.marker = data.marker;
        App.host.doneWaiting();
        App.$mainCell.removeClass('disabled');

      },

      connectToRoom: function(){
        var roomNumber = $("#roomNumberInput").val();
        var userName = $("#userNameInput").val();

        if(!roomNumber){
          $("#modalContent .errorMessage").html("Please input a room number");
          $("#submitButton").addClass('button-error');
          $("#submitButton").html('Retry connection');
        }else{
          
          var data = {
            gameId: roomNumber,
            playerName: userName 
          };

          IO.socket.emit('playerJoin', data); 

        }
      }
    },


  }

  IO.init();
  App.init();

  //get the current person details if logged in
  
  //or ask for the two players
  $("#showModal").on('click', '.exit', function(event) {
    event.preventDefault();
    if($("#showModal").hasClass('display')){
      $("#showModal").removeClass('display');
    }
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