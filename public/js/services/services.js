'use strict';
var chatModule = angular.module('chatApp.services',[]);

var services = {};

services.user = function () {
  var name="";
  return {
    getName: function(){
      return name;
    },
    setName: function(value){
      name = value;
    }
  };
};


chatModule.service(services);