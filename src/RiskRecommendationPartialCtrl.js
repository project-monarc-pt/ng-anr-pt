(function () {

    angular
        .module('AnrModule')
        .controller('RiskRecommendationPartialCtrl', [
            '$scope', '$rootScope', 'toastr', '$mdMedia', '$mdDialog', '$stateParams', 'gettextCatalog', '$state', '$q', '$attrs',
            '$timeout', 'ClientRecommendationService',
            RiskRecommendationPartialCtrl
        ]);

    function RiskRecommendationPartialCtrl($scope, $rootScope, toastr, $mdMedia, $mdDialog, $stateParams, gettextCatalog,
                                            $state, $q, $attrs, $timeout, ClientRecommendationService) {
        var riskMode = $attrs.monarcMode; // information / operational
        var isOpRiskMode = (riskMode == 'operational');
        var riskId = (isOpRiskMode ? $stateParams.riskopId : $stateParams.riskId);
        var updateDebounce = false;

        $scope.createRecommendation = function (ev) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));

            $mdDialog.show({
                controller: ['$scope', '$mdDialog', 'ClientRecommendationService', 'gettextCatalog', 'toastr', '$q', 'rwd', CreateRecommendationDialog],
                templateUrl: 'views/anr/create.recommendation.html',
                targetEvent: ev,
                preserveScope: false,
                scope: $scope.$dialogScope.$new(),
                clickOutsideToClose: false,
                fullscreen: useFullScreen,
                locals: {
                    rwd: $scope.model.anr.rwd
                }
            }).then(function (rec) {
                ClientRecommendationService.createRecommendation(rec.recommendation, function (data) {
                    toastr.success(gettextCatalog.getString("The recommendation has been created successfully"));

                    ClientRecommendationService.attachToRisk(data.id, riskId, isOpRiskMode,
                        function () {
                            toastr.success(gettextCatalog.getString("The recommendation has been attached to this risk."));
                            $scope.updateRecommendations();
                        });
                })
            }, function (reject) {
              $scope.handleRejectionDialog(reject);
            });
        }

        $scope.editRecommendation = function (ev, rec) {
            ev.preventDefault();
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
            $mdDialog.show({
                controller: ['$scope', '$mdDialog', 'ClientRecommendationService', 'gettextCatalog', 'toastr', '$q',
                            'rwd', 'rec' , 'detachRecommendation', 'deleteRecommendation', CreateRecommendationDialog],
                templateUrl: 'views/anr/create.recommendation.html',
                targetEvent: ev,
                preserveScope: false,
                scope: $scope.$dialogScope.$new(),
                clickOutsideToClose: false,
                fullscreen: useFullScreen,
                locals: {
                    ClientRecommendationService: ClientRecommendationService,
                    rec: rec,
                    detachRecommendation: $scope.detachRecommendation,
                    deleteRecommendation: $scope.deleteRecommendation,
                    rwd: $scope.model.anr.rwd
                }
            }).then(function () {
                ClientRecommendationService.updateRecommendation(rec.recommendation, function () {
                    toastr.success(gettextCatalog.getString("The recommendation has been edited successfully"));
                    $scope.updateRecommendations();
                });
            }, function (reject) {
              $scope.handleRejectionDialog(reject);
            });
        }

        // The controls of this risk: the measures of its AMV, or of the RolfRisk for operational
        // ones. The same list the "Security referentials" panel of this sheet renders.
        // Returns null when they are unknown, so that nothing gets filtered out.
        function getRiskControlUuids() {
            var risk = isOpRiskMode ? $scope.opsheet_risk : $scope.sheet_risk;
            var measures = (risk && risk.measures) || null;
            // An empty list is treated as unknown too: a risk carrying no control at all tells us
            // nothing about which recommendations apply there, and hiding the whole linked library
            // would be a pure loss. Keeps operational risks inert until controls are linked to them.
            if (measures === null || measures.length === 0) {
                return null;
            }

            var uuids = {};
            angular.forEach(measures, function (measure) {
                if (measure.uuid) {
                    uuids[measure.uuid] = true;
                }
            });

            return uuids;
        }

        function getAttachedRecommendationUuids() {
            var uuids = {};
            angular.forEach($scope.recommendations || [], function (recommendationRisk) {
                if (recommendationRisk.recommendation) {
                    uuids[recommendationRisk.recommendation.uuid] = true;
                }
            });

            return uuids;
        }

        // A recommendation linked to controls (recommandations_measures, curated in the knowledge
        // base the way measures_amvs is) is offered only where one of those controls applies, in
        // bold and first until it gets attached. A recommendation linked to none is offered as
        // before, and nothing is filtered out while the risk's controls are unknown.
        function applyRiskControlsToRecommendations(recommendations) {
            var riskControlUuids = getRiskControlUuids();
            var attachedUuids = getAttachedRecommendationUuids();
            var matching = [];
            var others = [];

            angular.forEach(recommendations || [], function (recommendation) {
                recommendation.matchesRiskControl = false;

                var measures = recommendation.measures || [];
                if (riskControlUuids === null || measures.length === 0) {
                    others.push(recommendation);
                    return;
                }

                var appliesHere = false;
                angular.forEach(measures, function (measure) {
                    if (riskControlUuids[measure.uuid] === true) {
                        appliesHere = true;
                    }
                });
                if (!appliesHere) {
                    return;
                }
                if (attachedUuids[recommendation.uuid] === true) {
                    others.push(recommendation);
                    return;
                }

                recommendation.matchesRiskControl = true;
                matching.push(recommendation);
            });

            return matching.concat(others);
        }

        $scope.queryRecSearch = function (query) {
            var q = $q.defer();
            ClientRecommendationService.getRecommendations({order: 'code', filter: query}).then(function (data) {
                q.resolve(applyRiskControlsToRecommendations(data.recommendations));
            }, function () {
                q.reject();
            });

            return q.promise;
        };

        $scope.rec_edit = {
            rec: null
        };

        $scope.attachRecommendation = function () {
            ClientRecommendationService.attachToRisk($scope.rec_edit.rec.uuid, riskId, isOpRiskMode,
                function () {
                    toastr.success(gettextCatalog.getString("The recommendation has been attached to this risk."));
                    $scope.rec_edit.rec = null;
                    $scope.updateRecommendations();
                });
        };

        $scope.detachRecommendation = function (ev, recommendation) {
            $mdDialog.cancel();
            var confirm = $mdDialog.confirm()
                .title(gettextCatalog.getString('Are you sure you want to detach recommendation ?',
                    {code: recommendation.recommendation.code}))
                .textContent(gettextCatalog.getString('This operation is irreversible.'))
                .targetEvent(ev)
                .theme('light')
                .ok(gettextCatalog.getString('Detach'))
                .cancel(gettextCatalog.getString('Cancel'));
            $mdDialog.show(confirm)
            .then(function() {
                ClientRecommendationService.detachFromRisk(recommendation.id,
                    function () {
                        $scope.updateRecommendations();
                        toastr.success(gettextCatalog.getString('The recommendation has been detached.'),
                            gettextCatalog.getString('Operation successful'));
                    }
                );
            },function(reject){
                $scope.editRecommendation(ev,recommendation);
            });
        }

        $scope.deleteRecommendation = function(ev, recommendation){
            $mdDialog.cancel();
            var confirm = $mdDialog.confirm()
                .title(gettextCatalog.getString('Are you sure you want to delete recommendation?',
                    {code: recommendation.recommendation.code}))
                .textContent(gettextCatalog.getString('This operation is irreversible.'))
                .targetEvent(ev)
                .theme('light')
                .ok(gettextCatalog.getString('Delete'))
                .cancel(gettextCatalog.getString('Cancel'));
            $mdDialog.show(confirm).then(function() {
                ClientRecommendationService.deleteRecommendation({id: recommendation.recommendation.uuid},
                    function () {
                        $scope.updateRecommendations();
                        toastr.success(gettextCatalog.getString('The recommendation has been deleted successfully'),
                            gettextCatalog.getString('Operation successful'));
                    }
                );
            },function(){
                $scope.editRecommendation(ev,recommendation);
            });
        }

        $scope.updateRecommendations = function () {
            // We need to debounce the update here as the view uses twice the controller. The data is shared
            // through the broadcast event, but we have no way to know which controller will take care of the actual
            // API request. The first one will "lock" updateDebounce in the scope, and the other one will skip
            // the request.
            if (!$rootScope.updateDebounce && riskId) {
                $rootScope.updateDebounce = true;

                ClientRecommendationService.getRiskRecommendations(riskId, isOpRiskMode).then(function (data) {
                    $scope.recommendations = data['recommendations-risks'];
                    $rootScope.$broadcast('recommendations-loaded', $scope.recommendations);
                    $timeout(function () {
                        $rootScope.updateDebounce = false;
                    })
                })
            }
        };

        $rootScope.$on('recommendations-loaded', function (ev, recs) {
            $scope.recommendations = recs;
        })
    }

    function CreateRecommendationDialog($scope, $mdDialog, ClientRecommendationService, gettextCatalog, toastr, $q,
                                        rwd, rec, detachRecommendation, deleteRecommendation) {
        $scope.language = $scope.getAnrLanguage();
        $scope.recommendationSet = null;
        $scope.recommendation = rec;
        $scope.deleteConfirmation = false;
        $scope.detachRecommendation = detachRecommendation;
        $scope.deleteRecommendation = deleteRecommendation;
        $scope.isAnrReadOnly = !rwd;

        $scope.loadOptions = function(ev) {
            ClientRecommendationService.getRecommendations().then(function (data) {
                $scope.options = data.recommendations;
            });
            return $scope.options;
        };
        $scope.queryRecommendationSetSearch = function (query) {
            var promise = $q.defer();
              ClientRecommendationService.getRecommendationsSets({filter: query}).then(function (data) {
                promise.resolve(data['recommendations-sets']);
            }, function () {
                promise.reject();
            });
            return promise.promise;
        };

        $scope.selectedRecommendationSetItemChange = function (item) {
            $scope.recommendationSet = item;
        }

        $scope.createNewRecommendationSet = function (ev, recommendationSetlabel) {
          let recommendationSet = {label: recommendationSetlabel};

          ClientRecommendationService.createRecommendationSet(recommendationSet,
            function (status) {
              recommendationSet.uuid = status.id;
              $scope.selectedRecommendationSetItemChange(recommendationSet);
              toastr.success(gettextCatalog.getString('The recommendation set has been created successfully.'), gettextCatalog.getString('Creation successful'));
            }
          );
        };

        $scope.setSelectedRecommendation = function(ev, selectedRec) {
            if (selectedRec !== undefined) {
                $scope.recommendation = selectedRec;
                $scope.recommendation['recommendation'] = {};
                $scope.recommendation['recommendation']['code'] = selectedRec.code;
                $scope.recommendation['recommendation']['importance'] = selectedRec.importance;
                $scope.recommendation['recommendation']['description'] = selectedRec.description;
            }
        };

        $scope.delete = function () {
            $scope.deleteConfirmation = true;
        };

        $scope.deleteConfirm = function () {
            $mdDialog.hide(false);
        };

        $scope.create = function () {
            if ($scope.recommendationSet == null) {
                $scope.recommendationSet = $scope.recommendation.recommendation.recommendationSet;
            }
            $scope.recommendation.recommendation.recommendationSet = $scope.recommendationSet.uuid;
            $mdDialog.hide($scope.recommendation);
        };

        $scope.cancel = function() {
            $mdDialog.cancel();
        };
    }

    function MeasureRecommendationAttachDialog($scope, $mdDialog, $q, MeasureService) {
        $scope.rec = {
            measure: null
        };

        $scope.queryMeasureSearch = function (query) {
            var promise = $q.defer();
            MeasureService.getMeasures({filter: query}).then(function (e) {
                promise.resolve(e.measures);
            }, function (e) {
                promise.reject(e);
            });

            return promise.promise;
        };

        $scope.create = function () {
            if ($scope.rec.measure) {
                $mdDialog.hide($scope.rec.measure.id);
            }
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        }
    };

})();
