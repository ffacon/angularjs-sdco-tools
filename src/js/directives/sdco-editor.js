angular.module('sdco-tools.directives')
// First, declare the link function of the directive
// This will help to mock the directive for unit tests
.factory('sdcoEditorLinkFn', ['sdcoEditorService', function(sdcoEditorService){
 	return function($scope, $element, $attrs, $controller, $transclude){

		//Check transclude is done and then
		// process editor content if needed
		$scope.checkAndProcessContent= function(){

			$scope.contents= sdcoEditorService.run();				
			if (!$scope.compile || $scope.compileOnDemand){
				return;
			}

			$controller.processEditorsContent();
		};

		//process content if needed
		$scope.checkAndProcessContent();

		//EDITOR SIZE
		//update editor size
		angular.forEach($scope.tabScopes, function(value, index){
			value.editor.setSize('100%', $scope.height);
		});

		//Wrapper width also has to be set
		$scope.wrapperStyle= {
			width: $scope.width
		};

		//Set settings menu content
		$scope.settingsMenu=(
			function(){
				//jsFiddle is always available manually
				var settingsMenu=
				[
					{
						label: 'jsFiddle',
						selected: $scope.jsFiddle,
						select: function(){$scope.jsFiddle=true;},
						deselect: function(){$scope.jsFiddle= false;}
					}
				];
				//'compile on demand' is only available if compile
				// option is set
				if ($scope.compile){

					settingsMenu.push(
						{
							label: 'compile on demand',
							selected: $scope.compileOnDemand,
							select: function(){$scope.compileOnDemand=true;},
							deselect: function(){$scope.compileOnDemand=false;}
						}
					);
				}

				return settingsMenu;
			}
		)();
	};
 }])
// Then, declare the controller function of the directive
// This will help to mock the directive for unit tests
.factory('sdcoEditorControllerFn', ['$templateCache', 'sdcoEditorService', function($templateCache, sdcoEditorService){
	return function($scope, $element, $transclude){

		var tabScopes= $scope.tabScopes= [];

		//Make some scope attributes as boolean instead of strings
		$scope.compileOnDemand= ($scope.compileOnDemand == 'true');
		$scope.jsFiddle= ($scope.jsFiddle == 'true');
		$scope.readOnly= ($scope.readOnly == 'true');
		$scope.displayTitle= ($scope.displayTitle == 'true');

		var urlInd= 0;

		$scope.processHtml= function(){
			contents= $scope.contents= sdcoEditorService.run();
			if (contents.html !== undefined){
				urlInd= (urlInd+1)%2;
				//we need to change the template url for ng-include to reevaluate it
				var htmlTemplateUrl= 'contents' + urlInd + '.html';
				//we also need to update our template definition
				$templateCache.put(htmlTemplateUrl, contents.html);
				//then update scope to apply modifs
				$scope.htmlTemplateUrl= htmlTemplateUrl;
			}
		};

		$scope.processCss= function(){
			if (contents.css !== undefined){
				var styleTagId= 'dynamicEditorStyles';
				var styleTag= angular.element(document.querySelector('#' + styleTagId));
				if (styleTag.length === 0){
					styleTag= angular.element('<style />')
					.attr('type', 'text/css')
					.attr('id', styleTagId);
					angular.element(document.querySelector('head')).append(styleTag);
				}

				styleTag.text(contents.css);
			}
		};

		$scope.processJs= function(){

			if (contents.javascript){
				var jsTagId= 'dynamicEditorJs';
				var jsTag= angular.element(document.querySelector('#' + jsTagId));
				if (jsTag.length !== 0){
					jsTag.remove();
				}

				jsTag= angular.element('<script />')
				.attr('type', 'text/javascript')
				.attr('id', jsTagId);
				angular.element(document.querySelector('body')).append(jsTag);
				jsTag.text(contents.javascript);							
			}
		};


		this.processEditorsContent= $scope.processEditorsContent= function(){
			if ($scope.compile){
				$scope.htmlProcessed= false;
				// ProcessHtml will update the
				// scope used by ngInclude, 
				// which will update htmlProcessed
				$scope.processHtml();
				$scope.processCss();
				if (!$scope.htmlProcessed){
					var unregister= $scope.$watch('htmlProcessed', function(newVal, oldVal){
						if (newVal){
							unregister();
							$scope.processJs();
							$scope.htmlProcessed= false;
						}
					});
				}else{
					$scope.processJs();
				}
			}
		};

		this.getNbEditors= function(){
			return tabScopes.length;
		};

		this.addTabScope= function(tabScope){
			if (tabScopes.length === 0){
				tabScope.selected= true;
			}
			tabScopes.push(tabScope);
		};

		this.setPreview= function(){
			$scope.showPreview= true;
		};

		this.getScope= function(){
			return $scope;
		};

		$scope.selectTab= function(tabScope){
			angular.forEach(tabScopes, function(value, index){
				value.selected= false;
			});
			tabScope.selected=true;
		};
	};
}])
/**
 * @ngdoc directive
 * @name editor
 * @restrict E
 *
 * @description
 * Defines a new editor
 *
 * @scope
 *
 * @param {boolean=} compile: specify if the editor content can be processed.
 * In such a case, a preview zone will be displayed at top of the editor.
 * The compilation behavior also depends on the compileOnDemand value.
 *
 * @param {boolean@} compileOnDemand: if set to true, compilation will be done
 * only when asked (with the play button). Otherwise, it is done each time the
 * editor content changes
 *
 * @param {string@} width a css value to define the editor width
 *
 * @param {string@} height a css value to define the editor height
 * 
 * @param {boolean@} jsFiddle: is the jsFiddle option is available
 **/
.directive('sdcoEditor',['sdcoEditorLinkFn', 'sdcoEditorControllerFn', '$log',
	function(sdcoEditorLinkFn, sdcoEditorControllerFn,  $log){

		return{
			restrict: 'E',
			transclude:true,
			replace:true,
			scope:{
				compile: '=',
				compileOnDemand:'@',
				readOnly:'@',
				width: '@',
				height: '@',
				jsFiddle: '@',
				displayTitle:'@'
			},
			template: '\
				<section class="editor-wrapper" ng-style="wrapperStyle"> \
					<h1 ng-if="displayTitle">dynamic editor</h1> \
					<div class="editor-preview-wrapper" ng-show="showPreview"> \
						<h2><span>preview</span></h2> \
						<div ng-include src="htmlTemplateUrl" onload="htmlProcessed=true;" /> \
					</div> \
					<ul class="tabs-wrapper"> \
						<li \
							ng-repeat="tabScope in tabScopes" \
							ng-class={selected:tabScope.selected} \
							ng-click="selectTab(tabScope)" \
							title="{{tabScope.heading}}" \
						> \
							<a href="">{{tabScope.heading}}</a> \
						</li> \
					</ul> \
					<ul class="functions-wrapper"> \
						<li ng-if="jsFiddle"> \
							<sdco-js-fiddle fwk="AngularJS" version="1.2" title="test" desc="test" data="contents" /> \
						</li> \
						<li ng-if="compile && compileOnDemand"> \
							<a href="" class="compile-on-demand" ng-click="processEditorsContent()"></a> \
						</li> \
						<li> \
							<section class="menu-options"> \
								<sdco-options-menu settings-content="settingsMenu"></sdco-options-menu> \
							</section> \
						</li> \
					</ul> \
					<div ng-transclude /> \
				</section> \
			',
			link: sdcoEditorLinkFn,
			controller: [ '$scope', '$element', '$transclude', sdcoEditorControllerFn]
		};
	}
]);