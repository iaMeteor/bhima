angular.module('bhima.controllers')
.controller('patientGroup', [
  '$scope',
  '$translate',
  '$window',
  '$location',
  'connect',
  'validate',
  'appstate',
  'messenger',
  'uuid',
  function ($scope, $translate, $window, $location, connect, validate, appstate, messenger, uuid) {
    var dependencies = {};
    var session = $scope.session = {
      selected : null
    };

    dependencies.group = {
      query : {
        identifier : 'uuid',
        tables: {
          'patient_group' : {
            columns: ['uuid', 'enterprise_id', 'price_list_uuid', 'name', 'note']
          }
        }
      }
    };

    dependencies.list = {
      query : {
        identifier : 'uuid',
        tables : {
          'price_list' : {
            columns : ['uuid', 'title']
          }
        }
      }
    };

    appstate.register('enterprise', loadEnterprise);

    function loadEnterprise(enterprise) {
      $scope.enterprise = enterprise;
      dependencies.group.query.where = ['patient_group.enterprise_id='+enterprise.id];
      validate.process(dependencies).then(initialisePatientGroup);
    }

    function initialisePatientGroup(model) {
      angular.extend($scope, model);
    }

    $scope.remove = function (grp) {
      if (!$window.confirm($translate.instant('PATIENT_GRP.CONFIRM_MESSAGE'))) {
        return;
      }

      connect.basicDelete('patient_group', grp.uuid, 'uuid')
      .then(function () {
        $scope.group.remove(grp.uuid);
      }, function (err) {
        messenger.danger('error:' + JSON.stringify(err));
      });
    };

    // register namespace

    $scope.newGroup = function () {
      $scope.register = {};
      $scope.action = 'register';

      session.selected = null;
    };

    $scope.saveRegistration = function () {
      var packaged = connect.clean($scope.register);
      packaged.uuid = uuid();
      packaged.enterprise_id = $scope.enterprise.id;

      // validate that register is complete.
      connect.basicPut('patient_group', packaged)
      .then(function () {
        $scope.group.post(packaged);
        $scope.edit(packaged);
      });
    };

    $scope.resetRegistration = function () {
      $scope.register = {};
    };

    // edit namespace

    $scope.edit = function (grp) {
      $scope.action = 'modify';
      $scope.modify = angular.copy(grp);
      $scope.modify_original = grp;

      session.selected = grp;
    };

    $scope.resetModification = function () {
      $scope.modify = angular.copy($scope.modify_original);
    };

    $scope.saveModification = function () {
      // validate that modification is complete
      connect.basicPost('patient_group', [connect.clean($scope.modify)], ['uuid'])
      .then(function () {
        messenger.success('Successfully modified the group.');
      });
    };

    $scope.showReport = function (grp) {
      $location.path('/reports/patient_group/' + grp.uuid);
    };

  }
]);
