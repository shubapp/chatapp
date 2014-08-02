'use strict';
var chatModule = angular.module('chatApp.controllers',[]);
// controlers section
var controllers = {};
var serverAddress='chat.shubapp.com';
var NICK_MAX_LENGTH=15;
var ROOM_MAX_LENGTH=10;
var socket;
var nickname;
var serverDisplayName = 'Server';


controllers.chatCtrl = function ($scope, $location, $anchorScroll, $http, user, $sce) {
	var maxMessages = 10;
	$scope.messages = [];
	$scope.myMessages = {index:0,log:[""]};
	$scope.clients=[];
	$scope.currentRoom={name:"lobby",style:"active"};
	$scope.rooms= [];

	$scope.handleMessage = function(sender, message) {
		socket.emit('chatmessage', { message: message, room: $scope.currentRoom.name });
		$scope.addMessage(sender, message, true, true);
		$('#textMessage').focus();
	}

	$scope.addMessage = function(sender, originalMessage, showTime, isMe, isServer) {
		var message= originalMessage.replace(/:(\w+):/g, '<img src="http://a248.e.akamai.net/assets.github.com/images/icons/emoji/$1.png" title="$1" height="20" width="20" />');
		message= $sce.trustAsHtml(message);

		if(isMe){
			$scope.myMessages.log.push(originalMessage);
			$scope.myMessages.index = 0;
			$scope.messages.push({
			  from: sender,
			  text: message,
			  time: showTime ? $scope.getTime() : '',
			  me: isMe,
			  server: isServer
			});
			
			$scope.freshMessage.text="";
		}else{
			$scope.$apply(function(){
				$scope.messages.push({
				  from: sender,
				  text: message,
				  time: showTime ? $scope.getTime() : '',
				  me: isMe,
				  server: isServer
				});
			});
		}
		$("img").on("load",function(){
            $(".chatBody").scrollTop($(".chatBody").get(0).scrollHeight,100);
        });
		$(".chatBody").scrollTop($(".chatBody").get(0).scrollHeight,100);
		
	};

	$scope.scrollTo = function(id) {
		$location.hash(id);
	    $anchorScroll();
	};


	$scope.moveTo = function(roomId){
		if ($scope.currentRoom.name!=roomId){
			socket.emit('unsubscribe',{room:$scope.currentRoom.name});
    		socket.emit('subscribe', {room:roomId});
		};
	};	

	$scope.$on('name.update',function(event,data){
		$scope.username= data;
		$scope.connect();
	});

	$scope.bindSocketEvents= function(){
		// when the connection is made, the server emiting
		// the 'connect' event
		socket.on('connect', function(){
			// firing back the connect event to the server
			// and sending the nickname for the connected client
			socket.emit('connect', {nickname: nickname});
		});

		// after the server created a client for us, the ready event
		// is fired in the server with our clientId, now we can start 
  		socket.on('ready', function(data){
  			$scope.clientId = data.clientId;
  		});

		// after the initialize, the server sends a list of
		// all the active rooms
		socket.on('roomslist', function(data){
			for(var i = 0, len = data.rooms.length; i < len; i++){
				// in socket.io, their is always one default room
				// without a name (empty string), every socket is 
				// automaticaly joined to this room, however, we
				// don't want this room to be displayed in the
				// rooms list
				if(data.rooms[i] != ''){
					$scope.addRoom(data.rooms[i], false);
				}
			}
		});

		// when someone sends a message, the sever push it to
		// our client through this event with a relevant data
		socket.on('chatmessage', function(data){
			console.log('chatmessage recived');
			var nickname = data.client.nickname;
			var message = data.message;
			//display the message in the chat window
			$scope.addMessage(nickname, message, true, false, false);
		});


		// when we subscribes to a room, the server sends a list
  		// with the clients in this room
  		socket.on('roomclients', function(data){
			// add the room name to the rooms list
			$scope.addRoom(data.room, false);

			// set the current room
			$scope.setCurrentRoom(data.room);

  			console.log('roomclients');
			// announce a welcome message
			$scope.addMessage(serverDisplayName,
			                'Welcome to the room: `' + data.room +
			                '`... enjoy!', true, false, true);

			// add the clients to the clients list
			$scope.addClient({nickname: nickname, clientId: $scope.clientId},
			                           false, true);
			for(var i = 0, len = data.clients.length; i < len; i++){
				if(data.clients[i]){
					$scope.addClient(data.clients[i], false);
				}
			}
		});

		// if someone creates a room the server updates us
		// about it
		socket.on('addroom', function(data){
			$scope.addRoom(data.room, true);
		});

		// if one of the room is empty from clients, the server,
		// destroys it and updates us
		socket.on('removeroom', function(data){
			$scope.removeRoom(data.room, true);
		});

		// with this event the server tells us when a client
		// is connected or disconnected to the current room
		socket.on('presence', function(data){
			if(data.state == 'online'){
				$scope.addClient(data.client, true);
			} else if(data.state == 'offline'){
				$scope.removeClient(data.client, true);
			}
		});
	}

		// add a room to the rooms list, socket.io may add
		// a trailing '/' to the name so we are clearing it
	 	$scope.addRoom= function(name, announce){
	    	// clear the trailing '/'
	    	name = name.replace('/','');
	    	var newRoom=true;
	 		for (var i=0, len = $scope.rooms.length;newRoom && i<len; i++){
	 			newRoom= $scope.rooms[i].name!=name;
	 		}
	 		
	 		if (newRoom){
	 			$scope.rooms.push({style:"",usersCount:"0",name:name});
	 			// if announce is true, show a message about this room
				if(announce){
				    $scope.addMessage(serverDisplayName, 'The room `' + name + '`created...', true, false, true);
				}
	 		}
	 	}
	 
		// remove a room from the rooms list
		$scope.removeRoom= function(name, announce){
			for (var i=0, len = $scope.rooms.length;i<len; i++){
				if ($scope.rooms[i].name==name){
					$scope.rooms.splice(i,1);
					break;
				}
			}
			
			// if announce is true, show a message about this room
			if(announce){
			  $scope.addMessage(serverDisplayName, 'The room `' + name +
			                                    '` destroyed...', true, false, true);
			}
		}
	 
		// add a client to the clients list
		$scope.addClient= function(client, announce, isMe){
			var style="";
			// if this is our client, mark him with color
			if(isMe){
				style = 'me';
			}

			$scope.clients.push({id:$scope.clientId,style:style,name:client.nickname});
			for(var i=0,len=$scope.rooms.length; i<len; i++){
				if ($scope.rooms[i].name==$scope.currentRoom.name){
					$scope.rooms[i].usersCount=$scope.clients.length;
					break;
				}
			}
			

			// if announce is true, show a message about this client
			if(announce){
				$scope.addMessage(serverDisplayName, client.nickname +
			                          ' has joined the room...', true, false, true);
			}
		
		}

		// remove a client from the clients list
		$scope.removeClient= function(client, announce){
			for(var i=0,len=$scope.rooms.length; i<len; i++){
				if ($scope.rooms[i].name==$scope.currentRoom.name){
					$scope.rooms[i].usersCount--;
					break;
				}
			}

			for (var i=0, len = $scope.clients.length;i<len; i++){
				if (client.clientId==$scope.clients[i].clientId){
					$scope.clients.splice(i,1);
					break;
				}
			}
			
			// if announce is true, show a message about this room
			if(announce){
				$scope.addMessage(serverDisplayName, client.nickname +
			                            ' has left the room...', true, false, true);
			}
		}
	 
		// every client can create a new room, when creating one, the client
		// is unsubscribed from the current room and then subscribed to the
		// room he just created, if he trying to create a room with the same
		// name like another room, then the server will subscribe the user
		// to the existing room
		$scope.createRoom= function(){
			 if($scope.newRoom.name && $scope.newRoom.name.length <= ROOM_MAX_LENGTH &&
			                          $scope.newRoom.name != $scope.currentRoom.name){

				// unsubscribe from the current room
				socket.emit('unsubscribe', {room: $scope.currentRoom.name });

				// create and subscribe to the new room
				socket.emit('subscribe', { room: $scope.newRoom.name });
			} else {
				$scope.newRoom.name="";
			 }
		}
	 
		// sets the current room when the client
		// makes a subscription
		$scope.setCurrentRoom= function(room){
			$scope.currentRoom.style="";
			$scope.currentRoom.name = room;
			$scope.currentRoom.style="active";
		}

		 // return a short time format for the messages
		 $scope.getTime= function(){
		     var date = new Date();
		     return (date.getHours() < 10 ? '0' + date.getHours().toString() :
		                    date.getHours()) + ':' + (date.getMinutes() < 10 ? '0' +
		                    date.getMinutes().toString() : date.getMinutes());
		 }

	// after selecting a nickname we call this function
	// in order to init the connection with the server
	$scope.connect= function(){
		// show connecting message
		// $scope.userStatus='Connecting...';

		// creating the connection and saving the socket
		socket = io.connect(serverAddress);

		// now that we have the socket we can bind events to it
		$scope.bindSocketEvents();
	}
};

controllers.navbarCtrl= function ($scope) {
	$scope.links=[{title:"chat",style:"active"},{title:"about",style:"disabled"}];
};


controllers.loginCtrl= function ($scope,$rootScope, user) {

	$scope.$watch('username',function(newVal){
		user.setName(newVal);
	});

	// save the client nickname and start the chat by
	// calling the 'connect()' function
	$scope.handleNickname= function (){
			var nick = $scope.username;

			if(nick && nick.length <= NICK_MAX_LENGTH){
				nickname=nick;
				$rootScope.$broadcast('name.update',nick);
				$('#nicknameModal').modal("hide");
			}
		};
};


chatModule.controller(controllers);