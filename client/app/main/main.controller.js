'use strict';

angular.module('yHackathonApp')
  .controller('MainCtrl', function ($scope, $http /*, socket*/) {
    $scope.awesomeThings = [];

    $http.get('/api/uga').success(function(data) {
      $scope.results = data.results;
//      socket.syncUpdates('thing', $scope.awesomeThings);
    });


    // $scope.$on('$destroy', function () {
    //   socket.unsyncUpdates('thing');
    // });
  });
