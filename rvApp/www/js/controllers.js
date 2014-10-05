angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, profile) {
  // Form data for the login modal
  $scope.loginData = {};

  // Load date from local storage
  profile.load();

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
  $scope.current.pressure = 101;
})

.controller('MileageCtrl', function($scope, mileage) {
  // Load mileageLogs 
  mileage.load(function(logs){
    $scope.mileage = logs;
  });

  
})

.controller('MileageFormCtrl', function($scope, $stateParams, $filter, profile, mileage) {
  $scope.entry = {};

  $scope.profile = profile.profile;
  // $scope.vehicles = profile.vehicles;
  
  // Load default values
  $scope.entry.date = $filter("date")(Date.now(), 'yyyy-MM-dd');// Date.today().toString("MM/dd/yyyy");
  $scope.entry.time = $filter("date")(Date.now(), 'hh:mm:ss');
  $scope.entry.vehicle = $scope.profile.defaults.vehicle;
  

  // Watch ofr any changes and update computed values.
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


  $scope.saveMileageForm = function(){
    mileage.save($scope.entry);
  };


})

.controller('GraphsCtrl', function($scope, $stateParams) {
})

.controller('SettingsCtrl', function($scope, $stateParams) {
});
