// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'app.services', 'ardyh.service', 'nvd3ChartDirectives'])

.constant('ardyhConf', {
  'domain': '162.243.146.219:9093',
  'maxHistory': 500,
  'updateDt':10
})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})



.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl'
    })

    .state('app.graphs', {
      url: "/graphs",
      views: {
        'menuContent' :{
          templateUrl: "templates/graphs.html"
        }
      }
    })

    .state('app.mileage', {
      url: "/mileage",
      views: {
        'menuContent' :{
          templateUrl: "templates/mileage.html",
          controller: 'MileageCtrl'
        }
      }
    })

    .state('app.mileage-form', {
      url: "/mileage/form",
      views: {
        'menuContent' :{
          templateUrl: "templates/mileage-form.html",
          controller: 'MileageFormCtrl'
        }
      }
    })

    .state('app.mileage-form-edit', {
      url: "/mileage/form/:cid/",
      views: {
        'menuContent' :{
          templateUrl: "templates/mileage-form.html",
          controller: 'MileageFormCtrl'
        }
      }
    })

    .state('app.settings', {
      url: "/settings",
      views: {
        'menuContent' :{
          templateUrl: "templates/settings.html",
          controller: 'SettingsCtrl'
        }
      }
    })

    .state('app.home', {
      url: "/home",
      views: {
        'menuContent' :{
          templateUrl: "templates/home.html",
          controller: 'HomeCtrl'
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});

