/**
 * 
 * @author Mohamad Abu Ali <arabian@brasnet.org>
 * @author Thiago R. M. Bitencourt <thiago.mbitencourt@gmail.com>
 * 
 * Métos e funções JavaScript, responsável pelo processamento da interface gráfica e pela comunicação com o serviço de transformação.
 */


/**
 * Módulo Angular, com dependência do ui.bootstrap
 */
var app = angular.module('mainModule',['ui.bootstrap'])
		.config( [
	    '$compileProvider',
	    function( $compileProvider ){   
	    	// configura o módulo para permitir o download das informações via data:application
	        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto):|data:application\/octet-stream/);
	    }
]);

/**
 * Controllers do módulo da aplicação.
 */
app.controller('mainController', function($scope, $http, $modal){
	
	$scope.pontosControleS1 = [];
	$scope.pontosControleS2 = [];
	$scope.pontosTransformar = [];
	$scope.pontosTransformados = [];
	$scope.sistemaCoordenadasS1 = new Object;
	$scope.sistemaCoordenadasS2 = new Object;
	$scope.textData = "";
	$scope.textFile = "PontosTransformados.txt";
	$scope.tblPontosControle = false;
	$scope.tblPontosTransformar = false;
	$scope.tblControleTransforma = false;
	
	/**
	 *  Carrega os pontos de controle a partir de um arquivo indicado pelo usuário.
	 */
	$scope.upload_pontosControle = function (element) {
		 var reader = new FileReader();
		 
		  reader.onload = function(e) {
		      $scope.$apply(function() {
		    	  // Chama o método que irá processar os pontos carregados
		          processaPontosControle($scope, $modal, reader.result);
		      });
		  };
		           
         var pontosControle = element.files[0];
         reader.readAsText(pontosControle);
	}
	
	/**
	 * Carrega os pontos a tranformar a partir de um arquivo indicado pelo usuário.
	 */
	$scope.upload_pontosTransformar = function (element) {
		 var reader = new FileReader();
		 
		  reader.onload = function(e) {
		      $scope.$apply(function() {
		    	// Chama o método que irá processar os pontos carregados
		          processaPontosTransformar($scope, $http, $modal, reader.result);
		      });
		  };
		           
         var pontosTransformar = element.files[0];
         reader.readAsText(pontosTransformar);
	}
	
	// Abre uma janela modal que apresenta uma breve descrição sobre o sistema
	$scope.sobre = function(){
		openModal('sobre','',$modal);
	}
	
	// Abre uma janela modal que apresenta a descrição e utilização do sistema, para o usuário final
	$scope.ajuda = function(){
		openModal('ajuda','',$modal);
	}
	
});

/**
 * Método que recebe os pontos de controle e verifica se estes estão de acordo com o padrão esperado.
 * Se o padrão do conteúdo do arquivo não estiver correto o usuário será informado através de uma mensagem de erro.
 * @param $scope
 * @param $modal
 * @param result
 */
function processaPontosControle($scope, $modal, result){
	
	var sistemaCoordenadasS1 = $scope.sistemaCoordenadasS1 = new Object;
	var sistemaCoordenadasS2 = $scope.sistemaCoordenadasS2 = new Object;
	var pontosControleS1 = $scope.pontosControleS1 = [];
	var pontosControleS2 = $scope.pontosControleS2 = [];
	$scope.pontosTransformar = [];
	$scope.pontosTransformados = [];
	
	try{
	
		// Faz a leitura da primeira linha do arquivo, para extrair o cabeçalho.
		var string_pontosControle = result.split(/[\t]*[\s]*[\r]*\n/);
		
		var linha0 = string_pontosControle[0].split(/[\t]+/);
		
		// Se houver problema no cabeçalho do arquivo, apresenta um erro para o usuário
		if(linha0.length != 5 || linha0[0] != "ID"){
			throw new Error("Verifique se o padrão do cabeçalho está no formato correto.");
		}
		
		sistemaCoordenadasS1.codigo = 0;
		sistemaCoordenadasS1.descricao = linha0[1].split("-")[1];
		sistemaCoordenadasS1.semiEixoMaior = 0;
		sistemaCoordenadasS1.semiEixoMenor = 0;	
		
		sistemaCoordenadasS2.codigo = 0;
		sistemaCoordenadasS2.descricao = linha0[4].split("-")[1];
		sistemaCoordenadasS2.semiEixoMaior = 0;
		sistemaCoordenadasS2.semiEixoMenor = 0;
	
		for (i = 1; i < string_pontosControle.length; i++) {
	
		   var linha = string_pontosControle[i].split(/[\t]+/);
	
		   if (linha[1] !== undefined){
			   var pCS1 = new Object;
			   pCS1.id = linha[0];
			   pCS1.sistemaCoordenadas = sistemaCoordenadasS1;
		
			   var pCS2 = new Object;
			   pCS2.id = linha[0];
			   pCS2.sistemaCoordenadas = sistemaCoordenadasS2;
		
			   if (linha.length < 9){
					pCS1.norte = pontoValido(linha[0], linha[1], i);
					pCS1.este = pontoValido(linha[0], linha[2], i);
					pCS1.h = 0;
					pCS1.h2 = 0;
											
					pCS2.norte = pontoValido(linha[0], linha[3], i);
					pCS2.este = pontoValido(linha[0], linha[4], i);
					pCS2.h = 0;
					pCS2.h2 = 0;
			   }else{
					pCS1.norte = pontoValido(linha[0], linha[1], i);
					pCS1.este = pontoValido(linha[0], linha[2], i);
					pCS1.h = pontoValido(linha[0], linha[3], i);
					pCS1.h2 = pontoValido(linha[0], linha[4], i);
											
					pCS2.norte = pontoValido(linha[0], linha[5], i);
					pCS2.este = pontoValido(linha[0], linha[6], i);
					pCS2.h = pontoValido(linha[0], linha[7], i);
					pCS2.h2 = pontoValido(linha[0], linha[8], i);
			   }
			   
			   if(pCS1.id != "" || pCS2.id != ""){
			    	pontosControleS1.push(pCS1);
					pontosControleS2.push(pCS2);
			    }
		   }
		}
		
		verificaPontosControle(pontosControleS1);
		verificaPontosControle(pontosControleS2);
		$scope.tblPontosControle = true;
        $scope.tblControleTransforma = true;
        
	}catch (e) {
		pontosControleS1 = [];
		pontosControleS2 = [];
		clearFileInputField('uploadFilePontosControle');
		openModal('error', e.message, $modal);
	}
}

/**
 * Método que recebe os pontos a transformar e verifica se estes estão de acordo com o padrão esperado.
 * Se o padrão do conteúdo do arquivo não estiver correto o usuário será informado através de uma mensagem de erro.
 * @param $scope
 * @param $http
 * @param $modal
 * @param result
 */
function processaPontosTransformar($scope, $http, $modal, result){
	
	var pontosTransformar = $scope.pontosTransformar = [];
	
	try{
	
		var string_transformar = result.split(/[\t]*[\s]*[\r]*\n/);
		
		var linha0 = string_transformar[0].split(/[\t]+/);
		
		if(linha0.length != 3 || linha0[0] != "ID"){
			throw new Error("Verifique se o padrão do cabeçalho está no formato correto.");
		}
		
		for (i = 1; i < string_transformar.length; i++) {
	
		   var linha = string_transformar[i].split(/[\t]+/);

		   if (linha[1] !== undefined){
			   
			   var pTS1 = new Object;
			   pTS1.id = linha[0];
			   pTS1.sistemaCoordenadas = $scope.sistemaCoordenadasS1;
			   
			   if (linha.length < 5){
					pTS1.norte = pontoValido(linha[0], linha[1], i);
					pTS1.este = pontoValido(linha[0], linha[2], i);
					pTS1.h = 0;
					pTS1.h2 = 0;
			   }else{
					pTS1.norte = pontoValido(linha[0], linha[1], i);
					pTS1.este = pontoValido(linha[0], linha[2], i);
					pTS1.h = pontoValido(linha[0], linha[3], i);
					pTS1.h2 = pontoValido(linha[0], linha[4], i);
			   }
		
			   if(pTS1.id != ""){
					pontosTransformar.push(pTS1);
			   }
		   }
		}
		
        transforma($scope, $http, $modal); 
		$scope.tblPontosTransformar = true;
    	$scope.tblControleTransforma = false;
    	  
	}catch (e) {
		pontosTransformar = [];
		clearFileInputField('uploadFilePontosTransformar');
		openModal('error', e.message, $modal);
	}	
}

/**
 * Chama o serviço de transformação. Realiza o encapsulamento de todas as informações necessárias em um objeto JSON e envia para o servidor através do método POST.
 * @param $scope
 * @param $http
 * @param $modal
 */
function transforma($scope, $http, $modal){
	var transformacao = new Object;

	transformacao.pontosControleS1 = $scope.pontosControleS1;
	transformacao.pontosControleS2 = $scope.pontosControleS2;
	transformacao.pontosTransformar = $scope.pontosTransformar;
	transformacao.sistemaCoordenadasDe = $scope.sistemaCoordenadasS1;
	transformacao.sistemaCoordenadasPara = $scope.sistemaCoordenadasS2;
	
	// Se a tranformação retornar uma mensagem de sucesso (código 200), obtem o resultado da transformação
	$http.post('service/transformacao', angular.toJson(transformacao)).
	  success(function(data, status, headers, config) {
		  //Recebe os pontos, verifica os pontos recebido e chama a função de exportação.
		  $scope.pontosTransformados = data;
		  verificaPontosTransformados(data);
	      exportarTXT($scope);
	  }).
	  error(function(data, status, headers, config) {
		  //Se o serviço de transformação retornar erro, o usuário será informado através de uma mensagem de erro.
		  openModal('error', 'Problemas ao acessar o serviço de transformação.', $modal);
	  });
}

/**
 * Verifica se há pontos duplicados entre os pontos de controle carregados. Se houverem pontos de controle duplicados o usuário é informado através de uma mensagem de erro.
 * O processamento da transformação é encerrado.
 * @param pontos de controle a servem verificados 
 */
function verificaPontosControle(pontos){
	pontos.forEach(function(ponto, index){
		for (i=index+1; i < pontos.length; i++){
			if ((ponto.id == pontos[i].id) || (ponto.norte == pontos[i].norte && ponto.este == pontos[i].este)){
				throw new Error("O Ponto com ID ("+pontos[i].id+") Linha ("+(i+2)+") está duplicado.");
			}
		}
	});	
}

/**
 * Após a tranformação dos pontos, varifica os pontos duplicados. 
 * Se houverem pontos duplicados estes serão marcados como duplicados.
 * @param pontos já transformados
 */
function verificaPontosTransformados(pontos){
	pontos.forEach(function(ponto, index){
		for (i=index+1; i < pontos.length; i++){
			if ((ponto.origem.id == pontos[i].origem.id) || (ponto.origem.norte == pontos[i].origem.norte && ponto.origem.este == pontos[i].origem.este)){
				ponto.origem.duplicate = true;
				pontos[i].origem.duplicate = true;
			}
		}
	});	
}

/**
 * Método que abre uma janela modal, baseado nos parâmetros recebidos.
 * Abre as janelas de Error, Ajuda e Sobre.
 * 
 * @param type - Tipo da janela que deve ser aberta (error, ajuda, sobre)
 * @param message - Quando o tipo é erro, então deve ser apresentada esta mensagem na janela 
 * @param $modal - Instância do objeto a ser chamado
 */
function openModal(type, message, $modal){
	var template;
	var size;
	switch (type) {
	case "error":
		template = "error.html";
		break;
	case "ajuda":
		template = "ajuda.html";	
		size = 'lg';
		break;
	case "sobre":
		template = "sobre.html";
		size = 'lg';
		break;
	default:
		break;
	}

	// Abre a janela modal baseada nas informações definidas.
	$modal.open({
		animation: true, 
		templateUrl: template,
		size: size,
		controller: function($scope, $modalInstance){
			$scope.message = message;
			$scope.close = function() {
                $modalInstance.dismiss('cancel');
            };
		}
	});
}

/**
 * Reseta a informação de nome do arquivo carregado. Quando ocorre um erro no carregamento do arquivo o valor do nome deve ser atualizado.
 * @param tagId
 */
function clearFileInputField(tagId) {
    document.getElementById(tagId).innerHTML = document.getElementById(tagId).innerHTML;
}

/**
 * Método que cria um arquivo te texto com os valores dos pontos já transformados.
 * O formato padrão do nome do arquivo criado é com a informação da data e hora de sua criação: ResultadoS1S2_DDMMAAAA_HHMMSS.txt.
 *  
 * @param $scope 
 */
function exportarTXT($scope){

	// Pega os pontos transformados
    var pontosTransformados = $scope.pontosTransformados;
    // Pega o sistema de coordenadas de destino
    var sistemaCoordenadasS2 = pontosTransformados[0].sistemaCoordenadas.descricao;
    // Cabeçalho de arquivo
    var str = 'ID\tNorte-'+sistemaCoordenadasS2+'\tEste-'+sistemaCoordenadasS2+'\r\n';

    // Carrega todos os pontos transformados para dentro do arquivo
    for (var i = 0; i < pontosTransformados.length; i++) {
    	// Para pontos duplicados adiciona um caractere (*) antes do ID
        var dup = (pontosTransformados[i].origem.duplicate == true) ? "*":"";
        var line = dup+pontosTransformados[i].id+"\t"+pontosTransformados[i].norte.toFixed(3).replace(".",",")+"\t"+pontosTransformados[i].este.toFixed(3).replace(".",",");
        str += line + '\r\n';
    }

    //Cria o timestamp para ser utilizado na nomenclatura do arquivo gerado.
    var date = new Date();
    var dateString = date.getDate()+""+(date.getMonth() + 1)+""+date.getFullYear()+"_"+date.getHours()+""+date.getMinutes()+""+date.getSeconds();

    $scope.textData = "data:application/octet-stream;base64," + btoa(str);
    $scope.textFile = "Resultado"+sistemaCoordenadasS2+"_"+dateString+".txt";
   
}
/**
 * 
 * Método que valida todos os valores numéricos dos pontos carregados. Apresenta um erro para o usuário se algum ponto não puder ser convertido para um valor numérico.
 * 
 * @param id - identificar do ponto verificado
 * @param num - valor numérico do ponto verificado
 * @param i - linha em que o ponto esta, dentro da tabela
 * @returns retorna o valor numérico
 */
function pontoValido(id,num,i){
		
	// Se o número for indefinido(nulo) não é possível utilizá-lo e verifica se o conteúdo da variável é um numero, se for: Retorna o valor numérico.
	if (num !== undefined && Number(num.replace(",","."))){
		return num.replace(",",".");	
	}else{
		// Se o valor da variável não puder ser convertido para um valor numérico, então apresenta uma mensagem de erro de formatação para o usuário
		throw new Error("O Ponto com ID ("+id+") Linha ("+(i+1)+") não está no formato correto.");
	}
}