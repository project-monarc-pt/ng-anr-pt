(function () {

  angular
    .module('AnrModule')
    .factory('AnrThemeConfig', [function () {
      return {
        // Graph rendering and graph image export settings.
        charts: {
          textPrimary: 'rgba(35,31,32,0.87)',
          textSecondary: '#6D6F71',
          textOnDark: '#FFFFFF',

          surfacePrimary: '#FFFFFF',

          borderPrimary: '#231F20',
          gridStroke: '#939598',
          gridStrokeLight: '#BCBEC0',

          brandPrimary: '#308AA1',

          categoryScale: ['#308AA1', '#231F20', '#BCBEC0', '#78909C', '#6D6F71'],
          riskScale: ['#BCBEC0', '#78909C', '#231F20'],

          tooltip: {
            background: '#FFFFFF',
            text: 'rgba(35,31,32,0.87)',
            border: '#231F20'
          },

          export: {
            background: '#FFFFFF'
          }
        },

        // Export template styling outside the graph itself.
        exports: {
        },

        // Shared brand assets.
        branding: {
          progressFinishIcon: 'img/monarc_pictograma_branco.svg'
        },

        // Shared typography settings for JS consumers.
        typography: {
          fontFamily: 'Arial, "Open Sans", sans-serif'
        }
      };
    }]);

})();
