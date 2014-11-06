angular.module('app.services', [])

.factory( 'profile', ['$http', function($http) {
    
    var profile = {vehicles:[], defaults: {}};
    var vehicles = [];

    load = function(){
        profile.vehicles = [
            {'value':1, 'verbose':'1994 Ford E-350 R/V', "odometer":53000},
            {'value':2, 'verbose':'2011 Toyota Prius', "odometer":25000},
            {'value':3, 'verbose':'1997 Hondea Civic', "odometer":200000}
          ];

        profile.defaults.vehicle = 1; 
    }
    
    return {
        load:load,
        profile:profile
    }
}])

.factory( 'mileage', ['$http', '$localStorage', '$filter', function($http, $localStorage, $filter) {
    var mileage = {};

    save = function(entry){
        if (!entry.cid || typeof(entry.cid) !=='string'){
            // This is an update so just save it.
            entry.cid = 'mileage_' + $filter("date")(Date.now(), 'yyyyMMddhhmmss');
            mileage.logs.push(entry);
        } else {
            // Update the correct milage record
            var old_log = getByCid(entry.cid); 
            var index = _.indexOf(old_log, mileage.logs);
            mileage.logs[index] = entry;
        }
        $localStorage.setObject('mileage', mileage);
    };

    getByCid = function(cid){
        log = _.find(mileage.logs, function(log){
            return (log.cid === cid);
        });
        return log;
    }

    load = function(callback) {
        mileage = $localStorage.getObject('mileage');
        if (typeof(mileage.logs) === 'undefined') {
            // Create it
            mileage.logs = [];
            $localStorage.setObject('mileage', mileage);
        }
        callback(mileage.logs);
    }

    getLogs = function(){
        logs = mileage.logs;
        return logs;
    }

    deleteByCid = function(cid){
        var log = getByCid(cid);
        var index = _.indexOf(log, mileage.logs);
        mileage.logs.splice(index, 1);
        $localStorage.setObject('mileage', mileage);
    }

    return {
        save:save,
        getByCid:getByCid,
        deleteByCid:deleteByCid,
        load:load,
        logs: getLogs()
    }

}])


.factory('$localStorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}])

.service('$apigee', ['$http', 'mileage', function($http, mileage) {
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
        
        url = url + "?acess_token=" + token + "&limit=400";
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


.service('$sensorValues', ['$apigee', 'ardyhConf', function($apigee, ardyhConf) {
    var obj = this;
    this.object = [];
    this.isLoaded = false;
    this.graphs = {
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


    this.load = function(onLoad){
        obj.isLoaded = false;
        $apigee.init();

        size = ardyhConf.maxHistory-2;

        $apigee.fetchSensorValues(function(data, status){
                
                obj.objects = data.entities.reverse();
                console.log(obj.objects[0], obj.objects[390])
                _.each(obj.objects, function(entity){
                    try {
                        var values = entity.message.kwargs
                    } catch(e) {
                        console.log("Could not find sensor values.")
                        console.log(e);
                        return;
                    }
                    
                    var timestamp = new Date(entity.timestamp);

                    obj.graphs.temp[0].values.push([timestamp.valueOf(), values.temp]);
                    obj.graphs.humidity[0].values.push([timestamp.valueOf(), values.humidity]);
                    obj.graphs.light[0].values.push([timestamp.valueOf(), values.light]);
                });
                onLoad();
        });

        // $apigee.sensorValues.fetch(
        //     function(err, data){
        //         if (err) {
        //             alert("read failed");
        //         } else {
        //             obj.objects = $apigee.sensorValues._list;
        //         }

        //         _.each(obj.objects, function(entity){
                    
        //             try {
        //                 var values = entity._data.message.kwargs
        //             } catch(e) {
        //                 console.log("Could not find sensor values.")
        //                 console.log(e);
        //                 return;
        //             }
                    
        //             var timestamp = new Date(entity._data.timestamp);

        //             obj.graphs.temp[0].values.push([timestamp.valueOf(), values.temp]);
        //             obj.graphs.humidity[0].values.push([timestamp.valueOf(), values.humidity]);
        //             obj.graphs.light[0].values.push([timestamp.valueOf(), values.light]);
        //         });
        //         onLoad();
                
        // })
    };




}])