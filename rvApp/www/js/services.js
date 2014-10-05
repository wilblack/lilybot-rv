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
        }

        // Load mileage logs and append entry then save the whole thing.

        mileage.logs.push(entry);
        $localStorage.setObject('mileage', mileage);
    };

    getByCid = function(cid){
        //$localStorage.getObject(cid);

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

    return {
        save:save,
        getByCid:getByCid,
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