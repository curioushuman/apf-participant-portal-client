/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.form')
    .directive('gzSectionContact', gzSectionContact);

  gzSectionContact.$inject = [
    'layoutService'
  ];

  function gzSectionContact(layoutService) {
    return {
      require: '^^gzSection',
      controller: SectionContactController,
      controllerAs: 'vm',
      bindToController: true,
      templateUrl:
        'scripts/form/directives/sectionContact.template.html',
      restrict: 'E',
      scope: {
        page: '='
      },
      link: function(scope, elem, attrs, sectionCtrl) {
        sectionCtrl.section = sectionCtrl.page.sections.contact;
        sectionCtrl.section.sectionCtrl = sectionCtrl;
      }
    };
  }

  SectionContactController.$inject = [
    '$q',
    '$scope',
    '$timeout',
    'accountService',
    'affiliationService',
    'contactService',
    'gaService',
    'layoutService',
    'participantService',
    'questionService',
    'DEBUG'
  ];

  function SectionContactController(
    $q,
    $scope,
    $timeout,
    accountService,
    affiliationService,
    contactService,
    gaService,
    layoutService,
    participantService,
    questionService,
    DEBUG
  ) {
    var vm = this;
    vm.section = vm.page.sections.contact;
    vm.section.requestTime = {};
    vm.section.required = [
      'participantPriorExperienceTopic'
    ];

    vm.section.questionsAndResponsesLoaded = {
      questions: false,
      responses: false
    };

    vm.page.questions = [];
    vm.page.participant.responses = [];

    // do some things once we know this section is enabled
    $scope.$watch('vm.page.sectionsEnabled', function(value) {
      if (
        vm.page.sectionsEnabled === true &&
        vm.section.enabled !== undefined &&
        vm.section.enabled === true &&
        vm.page.questions.length === 0
      ) {
        // grab questions
        retrieveQuestions()
        .then(
          function(questions) {
            vm.page.questions = questions;
            vm.section.questionsAndResponsesLoaded.questions = true;
          },
          function(err) {
            vm.section.errorInitial = true;
          }
        );
      }
    });

    // when participant is found, obtain their responses
    $scope.$watch('vm.page.participant', function(value) {
      if (vm.page.participant.exists !== undefined) {
        if (vm.page.participant.exists === true) {
          // we want to grab responses
          retrieveResponses()
          .then(
            function(responses) {
              vm.page.participant.responses = responses;
              vm.section.questionsAndResponsesLoaded.responses = true;
            },
            function(err) {
              vm.section.errorInitial = true;
            }
          );
        } else {
          // no participant, we don't need responses so just set to true
          vm.section.questionsAndResponsesLoaded.responses = true;
        }
      }
    });

    // when questions and responses both exist, add response to question
    $scope.$watch(
      'vm.section.questionsAndResponsesLoaded',
      function(value) {
        if (
          vm.section.questionsAndResponsesLoaded.questions === true &&
          vm.section.questionsAndResponsesLoaded.responses === true &&
          vm.page.participant.responses !== undefined &&
          vm.page.participant.responses.length > 0
        ) {
          angular.forEach(vm.page.questions, function(question, index) {
            // do we have a response
            // need to FIX this
            // vm.participant.responses
            // instead of
            // participantResponses
            // for some reason it is being overriden
            var findQuestionResponse = $filter('filter')(
              vm.page.participant.responses,
              {
                Self_assessment_question__c: question.Id
              }
            );
            if (DEBUG) {
              console.log('Found response', findQuestionResponse);
              console.log('To question', question);
            }
            if (
              findQuestionResponse !== null &&
              findQuestionResponse.length > 0
            ) {
              question.response = findQuestionResponse[0];
            } else {
              question.response = new responseService.Response();
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
        angular.forEach(vm.page.questions, function(question, index) {
          if (
            question.response.Score__c === undefined ||
            (
              question.response.Score__c === 0 &&
              question.response.NoScore === undefined
            )
          ) {
            question.response.error = true;
            vm.section.invalid = true;
          }
        });

        if (vm.section.invalid === true) {
          reject({
            name: 'Invalid',
            message: 'Experience information was found to be invalid'
          });
        }

        // save the participant
        participantService.save(vm.page.participant)
        .then(
          function(participant) {
            if (DEBUG) {
              console.log('Section.Experience: participant saved');
            }
            var promises = prepareReponsesForSave();
            $q.all(promises).then(
              function(data) {
                if (vm.debug) {
                  console.log('Section.Experience: responses saved', data);
                }
                resolve(data);
              },
              function(err) {
                if (vm.debug) {
                  console.log(
                    'Section.Experience: error saving responses',
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
                'Section.Experience: Error saving participant',
                err
              );
            }
            reject(err);
          }
        );
      });
    };

    function retrieveQuestions() {
      vm.section.requestTime.retrieveQuestions =
        gaService.addSalesforceRequest('List', 'Questions');
      return questionService.list(
        {
          actionid: vm.action.Id
        }
      )
      .$promise
      .then(
        function(data) {
          gaService.addSalesforceResponse(
            'List',
            'Questions',
            vm.section.requestTime.retrieveQuestions
          );
          if (DEBUG) {
            console.log('Questions', data);
          }
          return data;
        },
        function(err) {
          gaService.addSalesforceError(
            'List',
            'Questions',
            vm.section.requestTime.retrieveQuestions,
            err.status
          );
          return err;
        }
      );
    }

    function retrieveResponses() {
      vm.section.requestTime.retrieveResponses =
        gaService.addSalesforceRequest('List', 'Responses');
      return responseService.list(
        {
          participantid: vm.page.participant.Id
        }
      )
      .$promise
      .then(
        function(data) {
          gaService.addSalesforceResponse(
            'List',
            'Responses',
            vm.section.requestTime.retrieveResponses
          );
          if (DEBUG) {
            console.log('Responses', data);
          }
          return data;
        },
        function(err) {
          gaService.addSalesforceError(
            'List',
            'Responses',
            vm.section.requestTime.retrieveResponses,
            err.status
          );
          return err;
        }
      );
    }

    function prepareReponsesForSave() {
      var promises = [];
      angular.forEach(vm.page.questions, function(question, index) {
        question.response.Participant__c = vm.participant.Id;
        question.response.Self_assessment_question__c = question.Id;
        promises.push(prepareReponseForSave(question.response));
      });

      return promises;
    }

    function prepareReponseForSave() {
      return $q(function(resolve, reject) {
        if (vm.debug) {
          console.log('Saving response', response);
        }
        if (
          (
            response.Score__c === null ||
            response.Score__c === undefined ||
            response.Score__c === 0
          ) &&
          (
            response.Comments__c === null ||
            response.Comments__c === undefined ||
            response.Comments__c === 0
          )
        ) {
          // don't save it, just send it back
          if (vm.debug) {
            console.log('Response skipped!', response);
          }
          vm.section.processing.processing++;
          resolve(response);
        } else {
          responseService.save(response)
          .then(
            function(response) {
              if (DEBUG) {
                console.log('Section.Experience: Response saved');
              }
              vm.section.processing.processing++;
              resolve(response);
            },
            function(err) {
              if (DEBUG) {
                console.log('Section.Experience: Error saving response', err);
              }
              reject(err);
            }
          );
        }
      });
    }
  }
})();
