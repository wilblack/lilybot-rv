angular.module('app.services', [])


.service('$user', function($apigee, $localStorage){
    obj = this;

    this.object = {
        username:null,
        token:null,
        profile:null,
    };

    this.login = function(username, password, stayLoggedIn, callback){
        $apigee.login(username, password, function(error, resp){

            if (!error){
                obj.object.username = resp.user.username;
                obj.object.token = resp.access_token;
                if (stayLoggedIn){
                    $localStorage.setObject('user', obj.object);
                }
            }
            callback(error, resp);
        });
    }

    this.load = function(callback){
        obj.object = $localStorage.getObject('user');
        callback(obj.object);
    }
})


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
}]);
