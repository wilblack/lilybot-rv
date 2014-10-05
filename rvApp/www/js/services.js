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

.factory( 'mileage', ['$http', function($http) {

}]);
