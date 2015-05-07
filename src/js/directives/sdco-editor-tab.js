angular.module('sdco-tools.directives')
 .factory('editorTabLinkFn', [function(){

 	return function(initialEditorContent){

		return function($scope, element, attrs, editorCtrl){
			var currentId= editorCtrl.getNbEditors();
			var readOnly= editorCtrl.getScope().readOnly;
			$scope.editor= editorCtrl.installEditor(
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
 /**
 * @ngdoc directive
 * @name sdco-tools.directive:sdcoEditorTab
 * @restrict E
 *
 * @description
 * Define the content of a tab for its
 * {@link sdco-tools.directive:sdcoEditor sdcoEditor} directive parent.
 *
 * @scope
 *
 * @param {String} type The type of the file: available values
 * are: html, javascript, css. HTML content has to be escaped
 *
 * @param {String} heading the title of the tab
 *
 * @example
 * <pre>
 * <sdco-editor compile="false" compile-on-demand="true" js-fiddle="true">
 *  <sdo-editor-tab type="html" heading="index.html">
 *   &lt;p&gt; id="elt" my escaped html content &lt/p&gt;
 *  </sdco-editor-tab>
 *  <sdo-editor-tab type="javascript" heading="main.js">
 *   document.getElementById('elt').innerText='changed';
 *  </sdco-editor-tab> 
 *  <sdo-editor-tab type="css" heading="main.css">
 *   p{
 *	  color: red;
 *   }
 *  </sdco-editor-tab>
 * </sdco-editor>
 * </pre>
 **/
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