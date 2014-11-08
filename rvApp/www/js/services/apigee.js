angular.module('apigee.services', [])
.service('$apigee', ['$http', '$localStorage', 'mileage', function($http, $localStorage, mileage) {
    var obj = this;
    var dataClient;

    this.apiLogs = new Apigee.Collection( { "client":dataClient, "type":"mileage" } );
    this.sensorValues = new Apigee.Collection( { "client":dataClient, "type":"sensor_values" } );

    this.init = function(){
        this.apiLogs = new Apigee.Collection( { "client":dataClient, "type":"mileage" } );
        this.sensorValues = new Apigee.Collection( { "client":dataClient, "type":"sensor_values" } );
    }

    this.authenticate = function(){
        var client_creds = {
            orgName:'wilblack',
            appName:'sandbox'
        }

        //Initializes the SDK. Also instantiates Apigee.MonitoringClient
        
        dataClient = new Apigee.Client(client_creds);
        //update();
    }

    this.update = function(){
        mileage.load(function(data){
            // Loop over logs to get server ids.
            

            apiLogs.addEntity(data[0], function (error, response) {
                    if (error) {
                        console.log('write failed');
                    } else {
                        console.log('write worked');
                        data[0].uuid = response.entities[0].uuid;
                        mileage.save(data[0]);

                    }
                    console.log(response)
                });
        })
    }


    this.fetchSensorValues =function(success, fail){
        var token = "YWMt8USt4mXZEeSqRMXRgyEyEQAAAUmqMIDPeLqe2CVrVacBzWm9yxhDF9fRBJ4"
        var url = "https://api.usergrid.com/wilblack/sandbox/sensor_values"
        var limit = $localStorage.getObject('settings').maxHistory;

        url = url + "?acess_token=" + token + "&limit="+limit;
        url += "&ql=order by timestamp desc";
        //var config = {headers: {'Authorization':'Token ' + user.token}};
        
        $http.get(url).success(function(data, status){
            success(data, status);
        })
        .error(function(data, status){
            fail(data, status);
        });
    }

}])


.service('$sensorValues', ['$rootScope', '$apigee', '$localStorage', function($rootScope, $apigee, $localStorage) {
    var obj = this;
    this.objects = [];
    this.initGraphs = {
        'temp':[{
            'key':'Temp (C)',
            'values': []
        }],
        'humidity':[{
            'key':'Humidity',
            'values': []
        }],
        'light':[{
            'key':'Light',
            'values': []
        }]
    };
    this.graphs = this.initGraphs;

    this.updateGraph = function(entity){
        try {
            var values = entity.message.kwargs
        } catch(e) {
            console.log("Could not find sensor values.")
            console.log(e);
            return;
        }
        var maxHistory = $localStorage.getObject('settings').maxHistory;
        var timestamp = new Date(entity.timestamp);

        obj.graphs.temp[0].values.push([timestamp.valueOf(), values.temp]);
        obj.graphs.humidity[0].values.push([timestamp.valueOf(), values.humidity]);
        obj.graphs.light[0].values.push([timestamp.valueOf(), values.light]);

        if (obj.graphs.temp[0].values.length > maxHistory){
             obj.graphs.temp[0].values.shift();
        }
        if (obj.graphs.humidity[0].values.length > maxHistory){
             obj.graphs.humidity[0].values.shift();
        }
        if (obj.graphs.light[0].values.length > maxHistory){
             obj.graphs.light[0].values.shift();
        }
        
    }

    this.load = function(onLoad){
        if (obj.objects.length > 0){
            onLoad();
            return;
        } 

        //$apigee.init();
        obj.graphs = obj.initGraphs;
        $apigee.fetchSensorValues(function(data, status){
                obj.objects = data.entities.reverse();
                _.each(obj.objects, function(entity){
                    obj.updateGraph(entity);
                });
                onLoad();
        });
    };


    $rootScope.$on('new-sensor-values', function(event, data){
        console.log("[$sensor-values] Received new sensor values.");
        $rootScope.$apply(function(){
            obj.updateGraph(data);
        });
    });

    $rootScope.$on('max-history-update', function(event, data){
        console.log("[max-history-update]");
        obj.objects = [];
    });
}]);