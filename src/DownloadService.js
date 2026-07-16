'use strict';

(function () {

    angular
        .module('AnrModule')
        .factory('DownloadService', [ 'gettextCatalog', DownloadService ]);

    function DownloadService(gettextCatalog) {
        var self = this;

        var portugueseFilenames = {
            'ExampleFile.csv': 'ficheiro_exemplo.csv',
            'ExampleFile.json': 'ficheiro_exemplo.json',
            'allAssets.csv': 'todos_ativos.csv',
            'allInfoRisk.csv': 'todos_riscos_informacao.csv',
            'allOpRisks.csv': 'todos_riscos_operacionais.csv',
            'allTags.csv': 'todas_etiquetas.csv',
            'allThreats.csv': 'todas_ameacas.csv',
            'allVulnerabilities.csv': 'todas_vulnerabilidades.csv',
            'implementationhistory.csv': 'historico_implementacao.csv',
            'matchReferentials.csv': 'correspondencia_referenciais.csv',
            'recommendationrisks.csv': 'riscos_recomendacoes.csv',
            'recommendationslist.csv': 'lista_recomendacoes.csv',
            'records_list.csv': 'lista_registos.csv',
            'records_list.json': 'lista_registos.json',
            'records_list.bin': 'lista_registos.bin',
            'risks.csv': 'riscos.csv',
            'risks_inst.csv': 'riscos_inst.csv',
            'risks_op.csv': 'riscos_operacionais.csv',
            'risks_op_inst.csv': 'riscos_operacionais_inst.csv',
            'risktreatmantplan.csv': 'plano_tratamento_risco.csv',
            'soa.csv': 'declaracao_aplicabilidade.csv',
            'soaInformationRisks.csv': 'declaracao_aplicabilidade_riscos_informacao.csv',
            'soaOperationalRisks.csv': 'declaracao_aplicabilidade_riscos_operacionais.csv',
            'Untitled-Deliverable.docx': 'entregavel_sem_titulo.docx',
            'deliverable.docx': 'entregavel.docx'
        };

        var portugueseFilenamePrefixes = {
            'allControls_': 'todos_controlos_',
            'allRecommendations_': 'todas_recomendacoes_'
        };

        var localizeFilename = function(fileName) {
            var currentLanguage = gettextCatalog.currentLanguage || '';

            if (currentLanguage.indexOf('pt') !== 0 || !fileName) {
                return fileName;
            }

            if (portugueseFilenames[fileName]) {
                return portugueseFilenames[fileName];
            }

            for (var prefix in portugueseFilenamePrefixes) {
                if (fileName.indexOf(prefix) === 0) {
                    return portugueseFilenamePrefixes[prefix] + fileName.substring(prefix.length);
                }
            }

            return fileName;
        };

        var downloadBlob = function (data, name, typeF) {
            if(typeF == undefined){
                typeF = 'octet/stream';
            }
            name = localizeFilename(name);
            var saveData = (function () {
                var a = document.createElement('a');
                document.body.appendChild(a);
                a.style.display = 'none';

                return function (blobData, fileName, typeF) {
                    if (typeF == undefined) {
                        typeF = 'application/octet-stream';
                    }
                    var blob = new Blob([blobData], {type: typeF}),
                        url = window.URL.createObjectURL(blob);

                    a.href = url;
                    a.download = fileName;
                    a.click();

                    setTimeout(function() {
                        window.URL.revokeObjectURL(url);
                    }, 800);
                };
            }());

            saveData(data, name, typeF);
        };


        var downloadJSON = function (data, fileName) {
          fileName = localizeFilename(fileName);
          var saveData = (function () {
              var a = document.createElement('a');
              document.body.appendChild(a);
              a.style.display = 'none';

              return function (jsonData, fileName) {
                var blob = new Blob([angular.toJson(jsonData)], {type: 'application/json'}),
                    url = window.URL.createObjectURL(blob);

                a.href = url;
                a.download = fileName;
                a.click();

                setTimeout(function() {
                    window.URL.revokeObjectURL(url);
                }, 800);
              };
          }());
          saveData(data, fileName);
        };

        var downloadCSV = function (data, name, typeF) {
            if(typeF == undefined){
                typeF = 'octet/stream';
            }
            name = localizeFilename(name);
            var saveData = (function () {
                var a = document.createElement('a');
                document.body.appendChild(a);
                a.style.display = 'none';

                return function (blobData, fileName, typeF) {
                    if (typeF == undefined) {
                        typeF = 'application/octet-stream';
                    }
                    var blob = new Blob(['\ufeff' + blobData], {type: typeF}),
                        url = window.URL.createObjectURL(blob);

                    a.href = url;
                    a.download = fileName;
                    a.click();

                    setTimeout(function() {
                        window.URL.revokeObjectURL(url);
                    }, 800);
                };
            }());

            saveData(data, name, typeF);
        };

        return {
            downloadBlob: downloadBlob,
            downloadJSON: downloadJSON,
            downloadCSV: downloadCSV,
            localizeFilename: localizeFilename
        };
    }

})();
