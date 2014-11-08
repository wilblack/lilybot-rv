'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.

var service = angular.module('ardyh.services', []).
  value('version', '0.1');

// This example is taken from https://github.com/totaljs/examples/tree/master/angularjs-websocket
service.
    service('$ardyh', ['$rootScope', '$timeout', '$http', '$localStorage', 'ardyhConf',
        function($rootScope, $timeout, $http, $localStorage, ardyhConf) {
    
        
    var obj = this;
    var messages = [];
    var users = [];

    var heartbeat = null; // A JavaScript setInterval that checks for the websocket connection.
    var missedHeartbeats = 0;
    var domain = $localStorage.getObject('settings').domain || ardyhConf.settings.domain;

    this.host =  'ws://'+ domain+'/ws';

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

            // Sends a heart beat message to keep the connection open
            if (heartbeat === null) {
                missedHeartbeats = 0;
                heartbeat = setInterval(function() {
                    try {
                        missedHeartbeats++;
                        if (missedHeartbeats >= 3)
                            throw new Error("Too many missed heartbeats.");
                        console.log('sending heartbeat, missedHeartbeats: '+missedHeartbeats)
                        var msg = {'heartbeat':'', 'bot_name':obj.botName}
                        obj.send(msg);
                    } catch(e) {
                        console.log(e);
                        clearInterval(heartbeat);
                        heartbeat = null;
                        console.warn("Closing connection. Reason: " + e.message);
                        obj.socket.close();
                    }
                }, 5000);
            } // end if heartbeat
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

            try {
                var data = JSON.parse(msg.data);
            } catch(e){
                console.log('[onmessage] Could not parse to JSON. Ignoring');
                console.log(data);
            }
            console.log("WTF")
            console.log(msg)
            if ('heartbeat' in data) {
                console.log("[onmessage] Reseting heartbeats")
                missedHeartbeats = 0;
                console.log(missedHeartbeats)
                return;
            }

            try {
              var message = data.message;
              var bot_name = data.bot_name;
              var command = message.command; 

            } catch (e) {
                console.log("[onmessage] Could not parse message")
                console.log(data)
                return
            }
            
            if (command === 'sensor_values') {
               $rootScope.$broadcast('new-sensor-values', data);
            }
        }


        obj.socket.onclose = function(){
            //alert("connection closed....");
            console.log("The connection has been closed. Attempting to reconnect.");
            //obj.init(obj.botName);
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
                console.log("I should reconnect here.");
                $timeout(function(){
                    obj.init(obj.botName);
                }, 5*1000);
            }
        }
    };

    this.sendCommand = function(command, kwargs){
        kwargs = kwargs || {};
        obj.send({'command':command, 'kwargs':kwargs});
    }

    this.init('rv-app.ardyh.solalla')

}]);