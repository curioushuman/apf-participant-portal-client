/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.form')
    .directive('gzSectionSessions', gzSectionSessions);

  gzSectionSessions.$inject = [

  ];

  function gzSectionSessions() {
    return {
      require: '^^gzSection',
      controller: SectionSessionsController,
      controllerAs: 'vm',
      bindToController: true,
      templateUrl:
        'scripts/form/directives/sectionSessions.template.html',
      restrict: 'E',
      scope: {
        page: '='
      },
      link: function(scope, elem, attrs, sectionCtrl) {
        sectionCtrl.section = sectionCtrl.page.sections.sessions;
        sectionCtrl.section.sectionCtrl = sectionCtrl;
      }
    };
  }

  SectionSessionsController.$inject = [
    '$filter',
    '$q',
    '$scope',
    'gaService',
    'participantService',
    'sessionService',
    'sessionParticipationService',
    'DEBUG'
  ];

  function SectionSessionsController(
    $filter,
    $q,
    $scope,
    gaService,
    participantService,
    sessionService,
    sessionParticipationService,
    DEBUG
  ) {
    var vm = this;
    vm.section = vm.page.sections.sessions;
    vm.section.requestTime = {};
    vm.section.required = [];

    vm.section.sessions = [];
    vm.section.sessionsDays = {
      sessionsDaysCount: 0,
      sessionsPeriodsCount: 0
    };
    vm.section.sessionsPeriodOptions = [
      '1',
      '2'
    ];
    vm.section.sessionDayCurrent = null;
    vm.section.sessionsAndParticipationLoaded = {
      sessions: false,
      participations: false
    };

    vm.page.sessions = [];
    vm.page.participant.sessionParticipations = [];

    // do some things once we know this section is enabled
    $scope.$watch('vm.page.sectionsEnabled', function(value) {
      if (
        vm.page.sectionsEnabled === true &&
        vm.section.enabled !== undefined &&
        vm.section.enabled === true &&
        vm.page.sessions.length === 0
      ) {
        // grab sessions
        retrieveSessions()
        .then(
          function(sessions) {
            vm.page.sessions = sessions;
            vm.section.sessionsAndParticipationLoaded.sessions = true;

            var sessionsDay = null;
            var sessionsDayPeriod = null;
            vm.section.sessionsDays.sessionsDaysCount = 0;
            vm.section.sessionsDays.sessionsPeriodsCount = 0;
            angular.forEach(vm.page.sessions, function(session, index) {
              vm.section.processing.processes++;
              if (
                sessionsDay === null ||
                sessionsDay.id !== session.Day__c
              ) {
                // it's a new day
                vm.section.sessionsDays.sessionsDaysCount++;
                sessionsDay = new SessionsDay(session.Day__c);
                vm.section.sessionsDays[sessionsDay.id] = sessionsDay;
                session.headingDay = session.Day__c;
              }
              session.day = sessionsDay;

              if (
                sessionsDayPeriod === null ||
                sessionsDay.periodsCount === 0 ||
                sessionsDayPeriod.id !== session.Period__c
              ) {
                // it's a new period
                if (DEBUG) {
                  console.log('New period');
                }
                sessionsDay.periodsCount++;
                vm.section.sessionsDays.sessionsPeriodsCount++;
                sessionsDayPeriod = new SessionsDayPeriod(session.Period__c);
                vm.section.sessionsDays[sessionsDay.id]
                  .periods[sessionsDayPeriod.id] = sessionsDayPeriod;
                session.headingPeriod = session.Period__c;
              }
              session.period = sessionsDayPeriod;
            });

            if (DEBUG) {
              console.log('vm.page.sessions', vm.page.sessions);
              console.log('vm.section.sessionsDays', vm.section.sessionsDays);
              console.log(
                'vm.section.sessionsDays.sessionsPeriodsCount',
                vm.section.sessionsDays.sessionsPeriodsCount
              );
              console.log(
                'vm.section.sessionsDays.sessionsDaysCount',
                vm.section.sessionsDays.sessionsDaysCount
              );
            }
          },
          function(err) {
            vm.section.errorInitial = true;
          }
        );
      }
    });

    // when participant is found, obtain their sessionParticipations
    $scope.$watch('vm.page.participant', function(value) {
      if (
        vm.page.participant.exists !== undefined &&
        vm.page.participant.exists === true
      ) {
        // we want to grab sessionParticipations
        retrieveSessionParticipations()
        .then(
          function(sessionParticipations) {
            vm.page.participant.sessionParticipations = sessionParticipations;
            vm.section.sessionsAndParticipationLoaded.participations = true;
          },
          function(err) {
            vm.section.errorInitial = true;
          }
        );
      } else if (
        vm.page.participant.exists !== undefined &&
        vm.page.participant.exists === false
      ) {
        // no participant, we don't need participation so just set to true
        vm.section.sessionsAndParticipationLoaded.participations = true;
      }
    });

    // when sessions and sessionParticipations both exist,
    // add sessionParticipation to session
    $scope.$watch(
      'vm.section.sessionsAndParticipationLoaded',
      function(value) {
        if (
          vm.section.sessionsAndParticipationLoaded.sessions === true &&
          vm.section.sessionsAndParticipationLoaded.participations === true
        ) {
          angular.forEach(vm.page.sessions, function(session, index) {

            var findSessionParticipation = $filter('filter')(
              vm.page.participant.sessionParticipations,
              {
                Session__c: session.Id
              }
            );
            if (DEBUG) {
              console.log(
                'Found sessionParticipation',
                findSessionParticipation
              );
              console.log('To session', session);
            }
            if (
              findSessionParticipation !== null &&
              findSessionParticipation.length > 0
            ) {
              session.sessionParticipation = findSessionParticipation[0];
            } else {
              session.sessionParticipation =
                new sessionParticipationService.SessionParticipation();
            }
            vm.section.processing.processes++;
          });
        }
      },
      true
    );

    vm.section.pre = function() {
      return $q(function(resolve, reject) {
        resolve(true);
      });
    };

    vm.section.process = function() {
      return $q(function(resolve, reject) {
        // special validation for experience
        angular.forEach(vm.section.sessionsDays, function(sessionsDay, index) {
          angular.forEach(sessionsDay.periods,
            function(sessionsDayPeriod, index) {
              sessionsDayPeriod.selectedPreferences = [];
            }
          );
        });
        if (DEBUG) {
          console.log('PROCESS vm.section.sessionsDays', vm.section.sessionsDays);
        }
        angular.forEach(vm.page.sessions, function(session, index) {
          if (DEBUG) {
            console.log('session', session);
            console.log('session.day.id', session.day.id);
            console.log('session.period.id', session.period.id);
          }
          vm.section.sessionsDays[session.day.id]
            .periods[session.period.id]
            .selectedPreferences.push(
              session.sessionParticipation.Registration_preference__c
            );
        });
        if (DEBUG) {
          console.log('PROCESS sessionsDays', vm.section.sessionsDays);
        }
        var periodsValid = 0;
        angular.forEach(vm.section.sessionsDays, function(sessionsDay, index) {
          angular.forEach(sessionsDay.periods,
            function(sessionsDayPeriod, index) {
              var periodOptionsSelected = 0;
              angular.forEach(
                vm.section.sessionsPeriodOptions,
                function(option, index) {
                  if (
                    $filter('filter')(
                      sessionsDayPeriod.selectedPreferences, option
                    ).length === 1
                  ) {
                    periodOptionsSelected++;
                  }
                }
              );
              if (periodOptionsSelected === vm.section.sessionsPeriodOptions.length) {
                sessionsDayPeriod.valid = true;
                periodsValid++;
              } else {
                sessionsDayPeriod.valid = false;
              }
            }
          );
        });
        if (DEBUG) {
          console.log('PROCESS periodsValid', periodsValid);
          console.log(
            'PROCESS sessionsPeriodsCount',
            vm.section.sessionsDays.sessionsPeriodsCount
          );
        }
        vm.section.invalid = false;
        if (periodsValid < vm.section.sessionsDays.sessionsPeriodsCount) {
          vm.section.invalid = true;
        }

        if (vm.section.invalid === true) {
          reject({
            name: 'Invalid',
            message: 'Sessions information was found to be invalid'
          });
          return;
        }

        // reset the processing count
        vm.section.processing.processing = 1;

        // save the participant
        participantService.save(vm.page.participant)
        .then(
          function(participant) {
            if (DEBUG) {
              console.log('Section.Sessions: participant saved');
            }
            var promises = prepareSessionParticipationsForSave();
            $q.all(promises).then(
              function(data) {
                if (DEBUG) {
                  console.log(
                    'Section.Sessions: sessionParticipations saved',
                    data
                  );
                }
                resolve(data);
              },
              function(err) {
                if (DEBUG) {
                  console.log(
                    'Section.Sessions: error saving sessionParticipations',
                    err
                  );
                }
                reject(err);
              }
            );
          },
          function(err) {
            if (DEBUG) {
              console.log(
                'Section.Sessions: Error saving participant',
                err
              );
            }
            reject(err);
          }
        );
      });
    };

    function retrieveSessions() {
      vm.section.requestTime.retrieveSessions =
        gaService.addSalesforceRequest('List', 'Sessions');
      return sessionService.list(
        {
          actionid: vm.page.action.Id
        }
      )
      .$promise
      .then(
        function(data) {
          gaService.addSalesforceResponse(
            'List',
            'Sessions',
            vm.section.requestTime.retrieveSessions
          );
          if (DEBUG) {
            console.log('Sessions', data);
          }

          return data;
        },
        function(err) {
          gaService.addSalesforceError(
            'List',
            'Sessions',
            vm.section.requestTime.retrieveSessions,
            err.status
          );
          return err;
        }
      );
    }

    function retrieveSessionParticipations() {
      vm.section.requestTime.retrieveSessionParticipations =
        gaService.addSalesforceRequest('List', 'SessionParticipations');
      return sessionParticipationService.list(
        {
          participantid: vm.page.participant.Id
        }
      )
      .$promise
      .then(
        function(data) {
          gaService.addSalesforceResponse(
            'List',
            'SessionParticipations',
            vm.section.requestTime.retrieveSessionParticipations
          );
          if (DEBUG) {
            console.log('SessionParticipations', data);
          }
          return data;
        },
        function(err) {
          gaService.addSalesforceError(
            'List',
            'SessionParticipations',
            vm.section.requestTime.retrieveSessionParticipations,
            err.status
          );
          return err;
        }
      );
    }

    function prepareSessionParticipationsForSave() {
      var promises = [];
      angular.forEach(vm.page.sessions, function(session, index) {
        session.sessionParticipation.Status__c = 'Registered';
        session.sessionParticipation.Participant__c = vm.page.participant.Id;
        session.sessionParticipation.Session__c = session.Id;
        if (vm.debug) {
          console.log('Session ' + index, session.sessionParticipation);
        }
        if (
          session.sessionParticipation.Registration_preference__c !==
            undefined &&
          session.sessionParticipation.Registration_preference__c !== null
        ) {
          promises.push(
            prepareSessionParticipationForSave(session.sessionParticipation)
          );
        }
      });

      return promises;
    }

    function prepareSessionParticipationForSave(sessionParticipation) {
      return $q(function(resolve, reject) {
        if (DEBUG) {
          console.log('Saving sessionParticipation', sessionParticipation);
        }
        if (
          sessionParticipation.Registration_preference__c === null ||
          sessionParticipation.Registration_preference__c === undefined ||
          sessionParticipation.Registration_preference__c === 0
        ) {
          // don't save it, just send it back
          if (DEBUG) {
            console.log('SessionParticipation skipped!', sessionParticipation);
          }
          vm.section.processing.processing++;
          resolve(sessionParticipation);
        } else {
          sessionParticipationService.save(sessionParticipation)
          .then(
            function(sessionParticipation) {
              if (DEBUG) {
                console.log('Section.Sessions: SessionParticipation saved');
              }
              vm.section.processing.processing++;
              resolve(sessionParticipation);
            },
            function(err) {
              if (DEBUG) {
                console.log(
                  'Section.Sessions: Error saving sessionParticipation',
                  err
                );
              }
              reject(err);
            }
          );
        }
      });
    }

    function SessionsDay(day) {
      this.id = day;
      this.periods = {};
      this.periodsCount = 0;
    }

    function SessionsDayPeriod(period) {
      this.id = period;
      this.options = vm.section.sessionsPeriodOptions;
      this.selectedPreferences = [];
      this.valid = true;
    }
  }
})();
