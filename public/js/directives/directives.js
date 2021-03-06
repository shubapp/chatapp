'use strict';
var chatModule = angular.module('chatApp.directives',[]);

var directives = {};

directives.username= function (user) {
	return {
        restrict: 'A',
        templateUrl: 'views/nickname.html',
        link:function(scope, element, attrs){
            //TODO: change this to use element insted of jquery
            $('#nicknameModal').modal({keyboard: false,backdrop:false});
            $('#nicknameModal').on('shown.bs.modal',function(e){
                $('#username').focus();
            });
            $('#nicknameModal').on('hidden.bs.modal',function(e){
                $('#textMessage').focus();
            });
        }
    };
};

directives.chat= function () {
    return {
        restrict: 'E',
        templateUrl: 'views/chat.html'
    };
};

directives.rooms= function () {
    return {
        restrict: 'E',
        templateUrl: 'views/rooms.html',
    };
};
        var emojis = [
            "smile", "iphone", "girl", "smiley", "heart", "kiss", "copyright", "coffee",
            "a", "ab", "airplane", "alien", "ambulance", "angel", "anger", "angry",
            "arrow_forward", "arrow_left", "arrow_lower_left", "arrow_lower_right",
            "arrow_right", "arrow_up", "arrow_upper_left", "arrow_upper_right",
            "art", "astonished", "atm", "b", "baby", "baby_chick", "baby_symbol",
            "balloon", "bamboo", "bank", "barber", "baseball", "basketball", "bath",
            "bear", "beer", "beers", "beginner", "bell", "bento", "bike", "bikini",
            "bird", "birthday", "black_square", "blue_car", "blue_heart", "blush",
            "boar", "boat", "bomb", "book", "boot", "bouquet", "bow", "bowtie",
            "boy", "bread", "briefcase", "broken_heart", "bug", "bulb",
            "person_with_blond_hair", "phone", "pig", "pill", "pisces", "plus1",
            "point_down", "point_left", "point_right", "point_up", "point_up_2",
            "police_car", "poop", "post_office", "postbox", "pray", "princess",
            "punch", "purple_heart", "question", "rabbit", "racehorse", "radio",
            "up", "us", "v", "vhs", "vibration_mode", "virgo", "vs", "walking",
            "warning", "watermelon", "wave", "wc", "wedding", "whale", "wheelchair",
            "white_square", "wind_chime", "wink", "wink2", "wolf", "woman",
            "womans_hat", "womens", "x", "yellow_heart", "zap", "zzz", "+1",
            "-1"
            ];

directives.atjs= function () {
    return {
        restrict: 'A',
        link:function(scope, element, attrs){
            $(element).atwho({
                at: ":",
                data: emojis,
                tpl:"<li data-value=':${name}:'>${name} <img src='http://a248.e.akamai.net/assets.github.com/images/icons/emoji/${name}.png'  height='20' width='20' /></li>"
            });
        }
    };
};

directives.chatinput= function () {
    return {
        restrict: 'E',
        require: '?ngModel',
        template: "<input type='text' id='textMessage' atjs tabindex='2' class='form-control' autocomplete='off' style='width:100%;' />",
        replace:true,
        link:function(scope, element, attrs, ngModel){
            element.bind('keydown',function(event) {
                // up key
                if(event.keyCode==38){
                    event.preventDefault();
                    if (scope.myMessages.index==0) {
                        scope.myMessages.index = scope.myMessages.log.length-1;
                    }else{
                        scope.myMessages.index--;
                    }
                    scope.$apply(function(){
                        scope.freshMessage.text=scope.myMessages.log[scope.myMessages.index];
                    });
                // down key
                } else if(event.keyCode==40){
                    event.preventDefault();
                    if (scope.myMessages.index==scope.myMessages.log.length-1) {
                        scope.myMessages.index = 0;
                    }else{
                        scope.myMessages.index++;
                    }
                    scope.$apply(function(){
                       scope.freshMessage.text=scope.myMessages.log[scope.myMessages.index];
                    });
                }
            });

            element.bind('keypress', function(event) {
                if(event.keyCode==13){
                    event.preventDefault();
                    scope.$apply(function(){
                        scope.handleMessage(scope.username, scope.freshMessage.text);
                    });
                }
            });            
        }
    };
};


chatModule.directive(directives);