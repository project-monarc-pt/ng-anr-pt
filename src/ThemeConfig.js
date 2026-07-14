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

          categoryScale: ['#1f77b4', '#ff7f0e', '#2ca02c', '#9467bd', '#d62728', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'],
          riskScale: ['#2FA36B', '#F1B800', '#C0392B'],
          riskScaleReversed: ['#C0392B', '#F1B800', '#2FA36B'],

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
          progressFinishIcon: 'img/CNCS_pictograma_branco.svg'
        },

        // Shared typography settings for JS consumers.
        typography: {
          fontFamily: 'Arial, "Open Sans", sans-serif'
        }
      };
    }]);

})();
