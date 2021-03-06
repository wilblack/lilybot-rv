angular.module('starter.controllers')
.controller('HomeCtrl', function($rootScope, $scope, $ardyh, $sensorValues, ardyhConf, $localStorage, $user, $ionicLoading) {
    $scope.current = {};
    $scope.units = {'temp':'f'};

    $scope.current.temp = "--";
    $scope.current.humidity = "--";
    $scope.current.pressure = "--";
    
    $scope.refreshSensorValues = function(){
        $ardyh.sendCommand('read_sensors')
    }

    $scope.graphs = {
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
    var settings = $localStorage.getObject('settings');
    
    if (typeof(settings.maxHistory) === 'undefined'){
        $localStorage.setObject('settings', ardyhConf.settings);
    };

    $sensorValues.load(function(){
        $scope.refreshSensorValues();
        $scope.graphs = $sensorValues.graphs;
        
    });

    $scope.xAxisTickFormatFunction = function(){
        return function(d){
            return new Date(d).toString("hh:mm tt")
        }
    }

    $scope.toggleUnits = function(sensor) {
        if (sensor === 'temp') {
            if ($scope.units.temp === 'c') {
                $scope.units.temp = 'f';
            } else {
                $scope.units.temp = 'c';
            }
        }
    };

    $scope.celsius2fahrenheit = function(t){
        return t*(9/5) + 32;
    };
    $rootScope.$on('new-sensor-values', function(event, data){
        $scope.$apply(function(){ // Needed this because the $braodcast is on he $rootScope
            $scope.current.temp = data.message.kwargs.temp;
            $scope.current.humidity = data.message.kwargs.humidity;
            $scope.current.timestamp = new Date(data.timestamp);
        })
        
    });

    $rootScope.$on('graphs-updated', function(event, data){
        $scope.graphs = $sensorValues.graphs;
    });

    
})
