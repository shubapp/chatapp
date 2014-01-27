'use strict';
var chatModule = angular.module('chatApp',['chatApp.controllers','chatApp.directives','chatApp.services','ngRoute']);

//routes section
chatModule.config(function ($routeProvider) {
	$routeProvider
	.when('/',{
		templateUrl: 'views/chat.html'
	})
	.when('/about',{
		controller:'simpleCtrl',
		templateUrl: 'partials/about.html'
	})
	.when('/login',{
		controller:'simpleCtrl',
		templateUrl: 'partials/login.html'
	})
	.otherwise({redirectTo:'/'});
});