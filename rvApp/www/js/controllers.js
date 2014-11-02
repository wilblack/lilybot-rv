angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $apigee, profile, mileage) {
  // Form data for the login modal
  $scope.loginData = {};

  // Load date from local storage
  profile.load();
  mileage.load(function(logs){
    console.log("Initial mileage loading");
    console.table(logs);
    console.log(JSON.stringify(logs));
  });
    
  // API Authenticate
  $apigee.authenticate();


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

.controller('HomeCtrl', function($scope, $ardyh) {
  $scope.current = {};
  $scope.current.temp = 26.1;
  $scope.current.humidity = 85.3;
  $scope.current.pressure = 101;


})

.controller('MileageCtrl', function($scope, mileage) {
  // Load mileageLogs 
  //$scope.mileage = [];
  mileage.load(function(logs){
    $scope.mileage = logs;
  });

  
})

.controller('MileageFormCtrl', function($scope, $stateParams, $state, $filter, $ionicModal, $location, profile, mileage) {
  $scope.entry = {};
  $scope.cid = $stateParams.cid;

  $scope.profile = profile.profile;
  
  // Load default values
  if ($scope.cid) {
    // Get the mielage log from memory (i.e. not localStorage)
    
    // Load mileageLogs from localStorage. This needs to be fixed.
    mileage.load(function(logs){
      $scope.mileage = logs;
      $scope.entry = mileage.getByCid($scope.cid);
    });
  } else {
    $scope.entry.date = $filter("date")(Date.now(), 'yyyy-MM-dd');// Date.today().toString("MM/dd/yyyy");
    $scope.entry.time = $filter("date")(Date.now(), 'hh:mm:ss');
    $scope.entry.vehicle = $scope.profile.defaults.vehicle;  
  }
  
  // Watch for any changes and update computed values.
  $scope.$watch('entry', function(newVal, oldVal){
    if (oldVal !== newVal){ // This keeps it from evaluting on the inital load.
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
  }
  
  // Delete modal stuff
  $ionicModal.fromTemplateUrl('delete-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $scope.openModal = function() {
      $scope.modal.show();
    };
    $scope.closeModal = function(action) {
      if (action === 'delete') {
        console.log('make it go away');
        mileage.deleteByCid($scope.entry.cid);
        $state.go("app.mileage");

      }
      $scope.modal.hide();

    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
      // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
      // Execute action
    });

    }, 'true');


    $scope.saveMileageForm = function(){
      mileage.save($scope.entry);
      $state.go("app.mileage");
    };

    $scope.deleteCallback = function(cid){
      $scope.openModal();
    }
})

.controller('GraphsCtrl', function($scope, $stateParams) {
})

.controller('SettingsCtrl', function($scope, $stateParams, $apigee, mileage) {
  $scope.clearLocalStorage = function(){
    localStorage.clear();
    mileage.load(function(){
      $scope.message = "Local Storage Cleared";
    });
    
  };

  $scope.updateApigee = function(){
    $scope.message = '';
    $apigee.update();
    $scope.message = 'WTF?'
  };

});
