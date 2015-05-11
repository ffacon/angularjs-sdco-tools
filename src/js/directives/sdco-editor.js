angular.module('sdco-tools.directives')
// First, declare the link function of the directive
// This will help to mock the directive for unit tests
.factory('sdcoEditorLinkFn', ['sdcoEditorService', function(sdcoEditorService){
 	return function($scope, $element, $attrs, $controller, $transclude){

 		var sdcoEditorServiceInstance= $scope.sdcoEditorServiceInstance;

		//Check transclude is done and then
		// process editor content if needed
		$scope.checkAndProcessContent= function(){

			$scope.contents= sdcoEditorServiceInstance.run();				
			if (!$scope.compile || $scope.isCompileOnDemand()){
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
						selected: $scope.isFiddle(),
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
							selected: $scope.isCompileOnDemand(),
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
		//TODO: correct his because replaced by strings

		// $scope.compileOnDemand= ($scope.compileOnDemand == 'true');
		// $scope.jsFiddle= ($scope.jsFiddle == 'true');
		// $scope.readOnly= ($scope.readOnly == 'true');
		// $scope.displayTitle= ($scope.displayTitle == 'true');

		var urlInd= 0;

		//Create new service instance and make it available in the scope
		var sdcoEditorServiceInstance= $scope.sdcoEditorServiceInstance= sdcoEditorService.getInstance();

		$scope.preprocess= function(){
			$scope.contents= sdcoEditorServiceInstance.run();
		};

		$scope.processHtml= function(){
			
			if ($scope.contents.html !== undefined){
				urlInd= (urlInd+1)%2;
				//we need to change the template url for ng-include to reevaluate it
				var htmlTemplateUrl= 'contents' + urlInd + '.html';
				//we also need to update our template definition
				$templateCache.put(htmlTemplateUrl, $scope.contents.html);
				//then update scope to apply modifs
				$scope.htmlTemplateUrl= htmlTemplateUrl;
			}
		};

		$scope.processCss= function(){
			if ($scope.contents.css !== undefined){
				var styleTagId= 'dynamicEditorStyles';
				var styleTag= angular.element(document.querySelector('#' + styleTagId));
				if (styleTag.length === 0){
					styleTag= angular.element('<style />')
					.attr('type', 'text/css')
					.attr('id', styleTagId);
					angular.element(document.querySelector('head')).append(styleTag);
				}

				styleTag.text($scope.contents.css);
			}
		};

		$scope.processJs= function(){

			if ($scope.contents.javascript){
				var jsTagId= 'dynamicEditorJs';
				var jsTag= angular.element(document.querySelector('#' + jsTagId));
				if (jsTag.length !== 0){
					jsTag.remove();
				}

				jsTag= angular.element('<script />')
				.attr('type', 'text/javascript')
				.attr('id', jsTagId);
				angular.element(document.querySelector('body')).append(jsTag);
				jsTag.text($scope.contents.javascript);							
			}
		};


		this.processEditorsContent= $scope.processEditorsContent= function(){

			var processHtmlFirst= function(){
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

			};

			var processJsFirst= function(){
				$scope.processJs();
				$scope.processHtml();
				$scope.processCss();
			};

			if ($scope.compile){

				$scope.preprocess();
				if ($scope.compileJsFirst === 'true'){
					processJsFirst();
				}else{
					processHtmlFirst();
				}

			}
		};

		this.installEditor=sdcoEditorServiceInstance.installEditor;

		this.getNbEditors= function(){
			return tabScopes.length;
		};

		this.addTabScope= function(tabScope){
			if (tabScopes.length === 0){
				tabScope.selected= true;
			}
			tabScopes.push(tabScope);
		};

		this.getScope= function(){
			return $scope;
		};

		this.confirmPreview= function(){
			$scope.confirmPreview= true;
		};

		$scope.isFiddle= function(){
			return ($scope.jsFiddle==='true' || $scope.jsFiddle===true);
		};

		$scope.isCompileOnDemand= function(){
			return ($scope.compileOnDemand==='true' || $scope.compileOnDemand===true);
		};		

		$scope.selectTab= function(tabScope){
			angular.forEach(tabScopes, function(value, index){
				value.selected= false;
			});
			tabScope.selected=true;
		};

		$scope.needPreview= function(){
			return ( $scope.compile===true && $scope.confirmPreview );
		};
	};
}])
/**
 * @ngdoc directive
 * @name sdco-tools.directive:sdcoEditor
 * @restrict E
 *
 * @description
 * Defines a new editor container, used in conjunction with
 * {@link sdco-tools.directive:sdcoEditorTab sdcoEditorTab}
 *
 * @scope
 *
 * @param {Boolean} [compile=false]  specify if the editor content can be processed.
 * In such a case, a preview zone will be displayed at top of the editor. HTML tabs
 * will be concatenated and added to the previous zone, CSS tabs will also be applied,
 * and JS content will be executed.
 * The compilation behavior also depends on the compileOnDemand value.
 *
 * @param {Boolean} [compileJsFirst=false] By default, when compile is true, html is processed
 * first, then js is executed. In some specific cases, you can specify that js has to be 
 * executed first 
 *
 * @param {Boolean} [compileOnDemand=false] if set to true, compilation will be done
 * only when asked (with the play button). Otherwise, it is done each time the
 * editor content changes
 *
 * @param {Boolean} [readOnly=false] Set the editor tabs in readOnly mode (no modifications allowed)
 *
 * @param {String} width a css value to define the editor width
 *
 * @param {String} height a css value to define the editor height
 * 
 * @param {Boolean} [jsFiddle=false] is the jsFiddle option link is displayed 
 * (the user can add it through the editor menu if it is active).
 *
 * @param {Boolean} [hideMenu=false] Hide the top right menu: typically, if set to true, 
 * compile to false and jsFiddle to false, the editor is used for display only.
 **/
.directive('sdcoEditor',['sdcoEditorLinkFn', 'sdcoEditorControllerFn', '$log',
	function(sdcoEditorLinkFn, sdcoEditorControllerFn,  $log){

		return{
			restrict: 'E',
			transclude:true,
			replace:true,
			scope:{
				compile: '=',
				compileJsFirst: '@?',
				compileOnDemand:'@',
				readOnly:'@',
				width: '@',
				height: '@',
				jsFiddle: '@',
				hideMenu: '@',
				displayTitle:'@'
			},
			template: '\
				<section class="editor-wrapper" ng-style="wrapperStyle"> \
					<h1 ng-if="displayTitle">dynamic editor</h1> \
					<div class="editor-preview-wrapper" ng-show="needPreview()"> \
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
						<li ng-if="isFiddle()"> \
							<sdco-js-fiddle fwk="AngularJS" version="1.2" title="test" desc="test" data="contents" /> \
						</li> \
						<li ng-if="compile && isCompileOnDemand()"> \
							<a href="" class="compile-on-demand" ng-click="processEditorsContent()"></a> \
						</li> \
						<li ng-if="hideMenu != \'true\'"> \
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