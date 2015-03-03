
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
      IO.socket.on('playerMoved', IO.moved);
      IO.socket.on('gameOver', IO.gameOver);
      IO.socket.on('error', IO.error);
      IO.socket.on('joinError', IO.joinError);
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
    playerJoinedRoom: function(data){

      $("#currentMarker").html(data.initialStart);
      App.player.joined(data);
      App[App.myRole].gameStarted(data);
    },

    beginNewGame: function(){

    },

    moved: function(data){
      console.log(data);
      App.currentMarker = data.currentMarker;
      $(".main-grid."+data.nextMove+" .inside-grid."+data.currentMove).html(data.previousMarker);
      $("#currentMarker").html(data.currentMarker);
      if(App.myRole != data.nextRole){
       App.stopMovement();
      }else{
       App.startMovement(data);
      }
    },

    gameOver: function(){

    },

    error: function(data){
      alert(data.message);
    },

    joinError: function(data){
      $("#modalContent .errorMessage").html(data.message);
      $("#submitButton").addClass('button-error');
      $("#submitButton").html('Retry connection');
    }


  };

  var App = {
    
    gameId: 0,
    mySocketId: '',
    currentMarker: '',
    myRole: '',

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
      App.$insideCell.on('click', App.move);
      
      // App.$doc.on('click', "#resetGame", App.resetGame);
      // App.$doc.on('click', "#localGame", App.localGame);
    },
    
    startMovement: function(data){
      console.log(data);
      App.$mainCell.addClass('disabled');

      $(".main-grid."+ data.currentMove).removeClass('disabled');
    },

    stopMovement: function(data){
      App.$mainCell.addClass('disabled');
    },

    resetGame: function(){
      $(".main-grid").removeClass('x');
      $(".main-grid").removeClass('o');
      $(".main-grid").removeClass('tied');
      $(".main-grid").removeClass('disabled');
      $(".inside-grid").html("");
    },

    localGame: function(){

    },
    
    startGame: function(data){
      console.log("startGame");
      console.log(data);
      IO.socket.emit('startGame', data.gameId); 

    },

    move: function(e){

      e.preventDefault();
      var data = {gameId: App.gameId, mySocketId: App.mySocketId, currentMarker: App.currentMarker};

      //get the main body
      var clickBlockMain = $(this).parent().parent(".main-grid");
          
      //client side validation
      if(!clickBlockMain.hasClass('disabled') && !clickBlockMain.hasClass('x') && !clickBlockMain.hasClass('o') && !clickBlockMain.hasClass('tied')){
        
        //get the important Information
        
        data.currentMarker = App.currentMarker;
        var clickedElem = $(this);
        var clickBlockMain = clickedElem.parent().parent(".main-grid");
        data.ElemText = clickedElem.html();
        data.currentMove = clickedElem.data('coordinates');
        data.nextMove = clickBlockMain.data('coordinates');
        IO.socket.emit('move', data); 
    
      }
      
      //IO.socket.emit('checkCurrentStatus', data.gameId); 

    },

    updateFrontState: function(){

    },

    host:{
    
      name: "",
      marker: "",
      
      createRoom: function(){
        console.log("Create room");
        App.myRole = "host";
        IO.socket.emit('newGameCreated'); 
      },

      createGame: function(data){
        App.gameId = data.gameId,
        App.mySocketId = data.mySocketId;
        App.currentMarker = data.marker;
        App.host.name = data.name;
        App.host.marker = data.marker;
        App.currentMarker = data.marker;

        $("#currentMarker").html(data.marker);
        $("#roomNumber").html(data.gameId);
      },

      gameStarted: function(){
        var data = {}
        data.gameId = App.gameId;
        data.currentMarker = App.host.marker;
        data.hostMarker = App.host.marker;
        data.playerMarker = App.player.marker;
        IO.socket.emit('startGame', data);
        $(".alert").html("A player joined!");
        $(".alert").addClass('open success');
        setTimeout(function(){
          $(".alert").addClass('close');
          $(".alert").removeClass('open');
        }, 5000);
        App.$mainCell.removeClass('disabled');
      },

 
    },

    player: {
      name: "",
      marker: "",
      
      joinRooom: function(){
        if(App.myRole == "host"){
          var argue = confirm("Are you sure?");
          if(argue){
            App.myRole = "player";
            $("#showModal").addClass('display');
          }
        }else{
          App.myRole = "player";
          $("#showModal").addClass('display');          
        }

      },

      joined: function(data){
        App.player.name = data.name;
        App.player.marker = data.marker;
        App.mySocketId = data.mySocketId;
        App.gameId = data.gameId;

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
      },

      gameStarted: function(data){
        App.gameId = data.gameId;
        App.mySocketId = data.mySocketId;
        App.player.name = data.playerName;
        App.player.marker = data.currentMarker;
        App.myRole = "player";
        $("#roomNumber").html(data.gameId);
        $("#submitButton").addClass('button-success');
        $("#submitButton").html('Success');
        setTimeout(function(){
          $("#showModal").removeClass('display');
        }, 5000);
      },

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