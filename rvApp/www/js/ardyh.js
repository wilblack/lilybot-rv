'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.

var service = angular.module('ardyh.service', []).
  value('version', '0.1');

// This example is taken from https://github.com/totaljs/examples/tree/master/angularjs-websocket
service.
    service('$ardyh', ['$rootScope', '$timeout', '$http', 'ardyhConf', 
        function($rootScope, $timeout, $http, ardyhConf) {
    
        
    var obj = this;
    var messages = [];
    var users = [];


    this.host =  'ws://'+ ardyhConf.domain +'/ws';

    this.sendHandshake = function(botName) {
        var message = {'handshake':true,
                       'bot_name':obj.botName,
                       'subscriptions':['rpi3.solalla.ardyh'],
                       'bot_roles': []
        }
        obj.socket.send(JSON.stringify(message));
    };

    this.init = function(botName){
        obj.botName = botName; 
        obj.host = obj.host + '?' + botName;
        
        obj.socket = new WebSocket(obj.host);

        obj.socket.onopen = function(){
            console.log("connection opened to " + obj.host);
                    
            obj.sendHandshake();
        }

        obj.socket.onmessage = function(msg) {
            /*
            Listens for
            
            Messages should be of the form 
            data : {
                timestamp : "",
                bot_name : "",
                message : {
                    command
                    kwargs
                }
            }
                

            */
            console.log(msg);
            try {
              var data = JSON.parse(msg.data);
              var message = data.message;
              var bot_name = data.bot_name;
              var command = message.command; 

            } catch (e) {
                console.log("Could not parse message")
                console.log(typeof(data))
                return
            }
            if (command === 'sensor_values') {
               $rootScope.$broadcast('new-sensor-values', data);
            }
        }


        obj.socket.onclose = function(){
            //alert("connection closed....");
            console.log("The connection has been closed.");
            obj.showReadyState("closed");
            obj.socket = new WebSocket(obj.host);
        }

        obj.socket.onerror = function(){
            //alert("connection closed....");
            this._log("The was an error.");
            this.showReadyState("error");
        }

    }

    this.send = function(messageObj) {
        if (obj.socket.readyState === 1){
            obj.socket.send(JSON.stringify( messageObj));
        } else {
            console.log("Could not send message, ready state = "+obj.socket.readyState);
            if (obj.socket.readyState === 3){
                // Web socket is closed so try to re-establish connection
                console.log("I should reconnect here.")
            }
        }
    };

    this.init('rv-app.ardyh.solalla')

}]);