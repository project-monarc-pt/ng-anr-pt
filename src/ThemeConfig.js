(function () {

  angular
    .module('AnrModule')
    .factory('AnrThemeConfig', [function () {
      return {
        // Graph rendering and graph image export settings.
        charts: {
          textPrimary: 'rgba(0,0,0,0.87)',
          textSecondary: '#737373',
          textOnDark: '#FFFFFF',

          surfacePrimary: '#FFFFFF',

          borderPrimary: '#000000',
          gridStroke: 'grey',
          gridStrokeLight: 'lightgrey',

          brandPrimary: '#006FBA',

          riskScale: ['#D6F107', '#FFBC1C', '#FD661F'],
          riskScaleReversed: ['#FD661F', '#FFBC1C', '#D6F107'],

          tooltip: {
            background: '#FFFFFF',
            text: 'rgba(0,0,0,0.87)',
            border: '#000000'
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
          logo: 'img/logo-monarc.png',
          layoutLogo: 'img/monarc.png'
        },

        // Shared typography settings for JS consumers (charts, canvas, exports).
        typography: {
          fontFamily: 'Arial, "Open Sans", sans-serif'
        }
      };
    }]);

})();
