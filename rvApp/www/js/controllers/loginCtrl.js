angular.module('starter.controllers')

.controller('LoginCtrl', function($scope, $state, $apigee, $user) {
    $scope.loginData = {};
    // Perform the login action when the user submits the login form
    $scope.login = function() {
        console.log('Doing login', $scope.loginData);

        $user.login($scope.loginData.username, $scope.loginData.password, function(error, resp){
            if (error) {
                $scope.errorMsg = error.error_description;
            }
            console.log(resp);
            $state.go('app.home');
        });
    };


});