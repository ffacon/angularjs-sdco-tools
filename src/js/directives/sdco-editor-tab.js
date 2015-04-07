angular.module('sdco-tools.directives')
/**
 * @ngdoc directive
 * @name editorTab
 * @restrict E
 *
 * @description
 * Define the content of a tab for its parent editor
 *
 * @scope
 *
 * @param {string@} type type of the file: available values (for now)
 * are: html, javascript, css. HTML content has to be escaped
 * (TODO: add text type). 
 *
 * @param {string@} heading the title of the tab
 *
 **/
 .factory('editorTabLinkFn', ['sdcoEditorService', function(sdcoEditorService){

 	return function(initialEditorContent){

		return function($scope, element, attrs, editorCtrl){
			var currentId= editorCtrl.getNbEditors();
			var readOnly= editorCtrl.getScope().readOnly;
			$scope.editor= sdcoEditorService.installEditor(
				element[0].querySelector('.editorElement'),
				initialEditorContent,
				$scope.type,
				currentId,
				readOnly
			);

			if ($scope.type == 'html'){
				editorCtrl.confirmPreview();
			}

			if (!readOnly){
				$scope.editor.on('change', function(){
					$scope.$apply(function(){
						editorCtrl.getScope().checkAndProcessContent();
					});
				});
			}

			editorCtrl.addTabScope($scope);
		}; 			


 	};

 }])
.directive('sdcoEditorTab',	['$log', 'editorTabLinkFn', 
	function($log,  editorTabLinkFn){

	return {
		require:'^sdcoEditor',
		restrict:'E',
		priority: 1000,
		replace: true,
		scope:{
			type:'@',
			heading:'@'
		},
		template: function(element, attrs){
			return 	'<div>' +
						'<div class="initialContent">' + element.html() + '</div>' +
						'<div class="editorElement" ng-show="selected" />'  +
					'</div>';
		},
		compile: function(tElement, tAttrs, transclude){

			var initialDirectiveContent= tElement.text().trim();
			angular.element(tElement[0].querySelector('.initialContent')).contents().remove();

			return editorTabLinkFn(initialDirectiveContent);
		}
	};
}]);