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
.directive('sdcoEditorTab',	['$log', 'sdcoEditorService', function($log, sdcoEditorService){

	return {
		require:'^sdcoEditor',
		restrict:'E',
		transclude: true,
		replace: true,
		scope:{
			type:'@',
			heading:'@'
		},
		template:'\
			<div>\
				<div ng-transclude /> \
				<div class="editorElement" ng-show="selected" /> \
			</div> \
		',
		link: function($scope, element, attrs, editorCtrl){
			var currentId= editorCtrl.getNbEditors();
			var transcludeElt= angular.element(element[0].querySelector('div[ng-transclude]'));
			var initialEditorContent= transcludeElt.text().trim();
			//remove transcluded content
			transcludeElt.contents().remove();
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
		}
	};
}]);