angular.module('AnrModule', ['angularResizable', 'angular-loading-bar', 'ngAnimate'])
        .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
        cfpLoadingBarProvider.latencyThreshold = 1000;
        cfpLoadingBarProvider.includeSpinner = false;
        }])

        // The ANR layout uses <md-tabs md-enable-disconnect="true">, which detaches the scope of every
        // inactive tab from the scope tree. A disconnected scope never receives $rootScope.$broadcast, so
        // the angular-gettext `translate` directive (which re-renders only on 'gettextLanguageChanged')
        // stays frozen in the previous language when the user switches the UI language from another tab.
        // The `translate` filter is $stateful and recovers on its own; the directive needs the event
        // replayed once the scope is attached again.
        .config(['$provide', function($provide) {
            $provide.decorator('$mdUtil', ['$delegate', '$rootScope', function($mdUtil, $rootScope) {
                var originalDisconnect = $mdUtil.disconnectScope;
                var originalReconnect = $mdUtil.reconnectScope;

                $mdUtil.disconnectScope = function(scope) {
                    if (scope) {
                        scope.__gettextRevision = $rootScope.__gettextRevision || 0;
                    }

                    return originalDisconnect.apply(this, arguments);
                };

                $mdUtil.reconnectScope = function(scope) {
                    var isStale = scope && scope.$$disconnected && !scope.$$destroyed
                        && scope.__gettextRevision !== ($rootScope.__gettextRevision || 0);

                    var result = originalReconnect.apply(this, arguments);

                    if (isStale) {
                        scope.__gettextRevision = $rootScope.__gettextRevision || 0;
                        scope.$broadcast('gettextLanguageChanged');
                    }

                    return result;
                };

                return $mdUtil;
            }]);
        }])

        .run(['$rootScope', function($rootScope) {
            $rootScope.__gettextRevision = 0;
            $rootScope.$on('gettextLanguageChanged', function() {
                $rootScope.__gettextRevision++;
            });
        }]);
