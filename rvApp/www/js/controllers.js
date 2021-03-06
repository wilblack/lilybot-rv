angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $state, $apigee, $user, profile, mileage) {
  // Form data for the login modal
  

  profile.load();
  mileage.load(function(logs){
    console.log("Initial mileage loading");
    console.table(logs);
    console.log(JSON.stringify(logs));
  });
    
  // API Authenticate
  //$apigee.authenticate();


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

.controller('SettingsCtrl', function($rootScope, $scope, $stateParams, $apigee, mileage, $ardyh, ardyhConf, $localStorage) {
    $scope.settingsForm = $localStorage.getObject('settings');
    // $scope.settingsForm.updateDt = ardyhConf.updateDt;
    // $scope.settingsForm.maxHistory = ardyhConf.maxHistory;

    $scope.settingsForm.submit = function(){
        var settings = $localStorage.getObject('settings');
        if (settings.maxHistory !== $scope.settingsForm.maxHistory) {
            settings.maxHistory = $scope.settingsForm.maxHistory;    
            $rootScope.$broadcast("max-history-update");
        }

        settings.updateDt = $scope.settingsForm.updateDt;
        
        $localStorage.setObject('settings', settings);

    }

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

    $scope.sendCommand = $ardyh.sendCommand
     

    // $scope.shutdownBot = function(){
        
    //         Shutdown a given lilybot
        
    //     console.log("[shutdownBot]")
    //     $ardyh.sendCommand('shutdown');
    // }




});
