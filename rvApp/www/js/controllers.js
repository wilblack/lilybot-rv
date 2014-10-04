angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('HomeCtrl', function($scope) {
  $scope.current = {};
  $scope.current.temp = 26.1;
  $scope.current.humidity = 85.3;
})

.controller('MileageFormCtrl', function($scope, $stateParams) {
  $scope.vehicles = [
    {'value':1, 'verbose':'1994 Ford E-350 R/V'},
    {'value':1, 'verbose':'2011 Toyota Prius'},
    {'value':1, 'verbose':'1997 Hondea Civic'}
  ];

  $scope.entry = {};
  $scope.entry.date = "12/12/2014";
  $scope.entry.time = "12:12:12";

  $scope.$watch('entry', function(newVal){
    if (newVal.tripDist && newVal.fuelAmount) {
      var mpg = newVal.tripDist / newVal.fuelAmount;
      $scope.entry.mpg = mpg;
    }
    if (newVal.unitPrice && newVal.fuelAmount) {
      var totalPrice = newVal.unitPrice * newVal.fuelAmount;
      $scope.entry.totalPrice = totalPrice;
    }
    if (newVal.unitPrice && newVal.fuelAmount && newVal.tripDist) {
      $scope.entry.ppm = totalPrice/newVal.tripDist;
    }


  }, 'true');
})

.controller('GraphsCtrl', function($scope, $stateParams) {
})

.controller('SettingsCtrl', function($scope, $stateParams) {
});
