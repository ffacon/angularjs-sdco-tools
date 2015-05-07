/* Author: Legrand Régis<regis.legrand@worldline.com> */
/* Version: 1.0.2-SNAPSHOT */


/**
 * @ngdoc overview
 * @name sdco-tools
 *
 * @description
 * <p>
 * Module containing multiple transverse components.
 * It can be seen as a component library which will evolve
 * over time.
 * </p>
 * <p>
 * This library is designed in a way which allows us to generate
 * several light sub libraries (TODO) for those which dont' want to import
 * the whole module.
 * </p>
 **/
angular.module('sdco-tools', [
	'sdco-tools.directives', 'sdco-tools.services',
	'ngSanitize', 'ui.bootstrap'
]);
angular.module('sdco-tools.directives', ['ui.bootstrap', 'sdco-tools.services']);
angular.module('sdco-tools.directives')

 /**
 * @ngdoc directive
 * @name sdco-tools.directive:sdcoCustomEventActions
 * @restrict A
 *
 * @description
 * TODO: This directive has to be move to another module.
 *
 * @scope
 **/
.directive('sdcoCustomEventActions',[ '$log',
	function($log){
		return{
			restrict: 'A',
			scope:{
				currentIndex:'='
			},
			link:function(scope, element, attrs){

				//Make the element selectable
				element.on('keydown',function(e){
					scope.$apply(function(){
						if (e.keyCode == 37){//left
							scope.currentIndex--;
						}
						else if (e.keyCode == 39){//right
							scope.currentIndex++;
						}
					});
				});
			}
		};
	}

]);
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
angular.module('sdco-tools.directives')
// First, declare the link function of the directive
// This will help to mock the directive for unit tests
.factory('sdcoEditorLinkFn', ['sdcoEditorService', function(sdcoEditorService){
 	return function($scope, $element, $attrs, $controller, $transclude){

 		var sdcoEditorServiceInstance= sdcoEditorService.getInstance();

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

		var sdcoEditorServiceInstance= sdcoEditorService.getInstance();

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
angular.module('sdco-tools.directives')
/**
 * @ngdoc directive
 * @name sdco-tools.directive:jsFiddle
 * @restrict E
 *
 * @description
 * Add an html link which allows to open a new jsFiddle
 *
 * @scope
 *
 * @param {String} fwk the name of the framework to use (
 * <a href="http://jsfiddle.net/" target="blank">go here</a>
 * to get available values)
 *
 * @param {String} version the version of the framework (
 * <a href="http://jsfiddle.net/" target="blank">go here</a>
 * to get available values)
 * 
 * @param {String} title for this jsFiddle
 * 
 * @param {string} description for this jsFiddle
 *
 * @param {array=} data an array containing 3 string fields to be used
 * for this jsFiddle: {html:'', css:'', js:'' }
 *
 **/
.directive('sdcoJsFiddle', ['$log', '$sce', function($log, $sce){

	return{
		restrict:'E',
		replace: true,
		scope:{
			fwk:'@',
			version:'@',
			title:'@',
			desc:'@',
			data:'='
		},
		template:'\
			<form \
				method="post" \
				action={{fiddleUrl}} \
				target="check" \
				class="jsfiddle" \
			> \
				<a href=""></a> \
				<div ng-show="false"> \
					<textarea type="text" name="html" ng-model="data.html" ng-trim="false" ></textarea> \
					<textarea type="text" name="js" ng-model="data.javascript" ng-trim="false" ></textarea> \
					<textarea type="text" name="css" ng-model="data.css" ng-trim="false" ></textarea> \
				</div> \
				<input type="text" name="title" ng-model="title" ng-show="false" ng-if="title"> \
				<input type="text" name="description" ng-model="desc" ng-show="false" ng-if="desc"> \
			</form>\
			',
		link:function($scope, $element, $attrs){

			//workarround for standard input[type=submit] doesnt work
			$element.find('a').on('click', function(){
				$element[0].submit();
			});

			$scope.fiddleUrl= $sce.trustAsResourceUrl('http://jsfiddle.net/api/post/' + $scope.fwk +'/' + $scope.version +'/');

		}
	};
}]);
angular.module('sdco-tools.directives')
/**
 * @ngdoc directive
 * @name sdco-tools.directive:sdcoNotesExport
 * @restrict E
 * @scope
 *
 * @description
 * Allow to:
 * <ul>
 * 	<li>Add an editable global note to your app (say global because it doesn't depend on the view and is unique)</li>
 * 	<li>Export all notes data (local and global)</li>
 * 	<li>Import all notes data (local and global)</li>
 *	<li> Usefull when user wants to keep its notes and changes of browser</li>
 * </ul>
 **/
.directive('sdcoNotesExport',[ '$log', '$modal', 'sdcoNotesService',
	function($log, $modal, sdcoNotesService){

		var exportController= function($scope, $modalInstance){

			//ALL VIEWS NOTES
			$scope.getAllNotes= function(){
				$scope.allNotes= JSON.stringify(sdcoNotesService.exportNotes());
			};

			$scope.saveNotes= function(){
				sdcoNotesService.importNotes(JSON.parse($scope.allNotes));
			};

			//GLOBAL NOTE
			$scope.globalNote= sdcoNotesService.getGlobalNote();
			$scope.saveGlobalNote= function(){
				sdcoNotesService.saveNote($scope.globalNote);
			};

			$scope.close= function(){
				$modalInstance.dismiss('cancel');
			};
		};

		return{
			restrict: 'E',
			scope:{},
			replace: true,
			template:'<button class="main-note" ng-click="open()" ></button>',
			link:function(scope, element, attrs){


				var getModalTemplate= function(){
					return '<div sdco-stop-keydown-propagation style="font-size: small;">' + 
							'	<tabset>' +
							'		<tab heading="Your notes">' +
							'			<div class=	"modal-header"> Your Notes </div>' +
							'			<div class="modal-body">' +
							'			<p> Copy this content in a file to save your comments or ' +
							'			replace the content with your one to update all the notes </p>' +
							'			<h2>Your notes</h2>' + 
							'			<textarea ng-model="globalNote.note" rows="10" style="width:100%;" >' +
							'			</textarea>' +
							'			<input type="submit" ng-click="saveGlobalNote()" value="save" />' +
							'			<button ng-click="close()">close</button> ' +
							'			</div> ' +
							'		</tab>' +
							'		<tab heading="all notes" select="getAllNotes()">' +
							'			<div class=	"modal-header"> All Notes </div>' +
							'			<div class="modal-body">' +
							'			<p> Set your global notes here </p>' +
							'			<h2>Your notes</h2>' + 
							'			<textarea ng-model="allNotes" rows="10" style="width:100%;" >' +
							'			</textarea>' +
							'			<input type="submit" ng-click="saveNotes()" value="save" />' +
							'			<button ng-click="close()">close</button> ' +
							'			</div> ' +
							'		</tab>' +
							'	</tabset>' +
							'</div>';
				};

				scope.open= function(){
					$modal.open({
						template:getModalTemplate(),
						controller: ['$scope', '$modalInstance', exportController]
					});
				};
			}
		};

	}

]);
angular.module('sdco-tools.directives')
/**
 * @ngdoc directive
 * @name sdco-tools.directive:sdcoNotes
 * @restrict E
 * @scope
 *
 * @description
 * Allow to add a note in your views. This note also contain an editable area to let users
 * to add comments and save them. You can add several note in a view, but remember that
 * the note is related to the view where you use it. 
 * For global note, have a look at {@link sdco-tools.directive:sdcoNotesExport sdcoNotesExport}.
 **/
.directive('sdcoNotes',[ '$log', '$modal', '$rootScope', 'sdcoNotesService',
	function($log, $modal, $rootScope, sdcoNotesService){

		var notesController= function($scope, $modalInstance){
			
			$scope.saveNote= function(){
				sdcoNotesService.saveNote($scope.noteData);
			};

			$scope.close= function(){
				$modalInstance.dismiss('cancel');
			};			
		};

		return{
			restrict: 'E',
			transclude: true,
			replace: true,
			scope:{},
			template:'<button class="local-note" ng-click="open()" ng-transclude></button>',
			link:function(scope, element, attrs){

				scope.noteData=sdcoNotesService.getNote();

				var transcludeElt= element;
				var modalContent= transcludeElt.html();
				//remove transcluded content
				transcludeElt.contents().remove();

				var getModalTemplate= function(){
					return '<div sdco-stop-keydown-propagation style="font-size: small;"> ' +
								'<div class="modal-header"> Notes </div> ' +
								'<div class="modal-body">' +
									'<p>' + modalContent + '</p>' +
								'<h2>Your notes</h2>' + 
								'<textarea ng-model="noteData.note" rows="10" style="width:100%;" ></textarea>' +
								'<button ng-click="saveNote()">save</button>' +
								'<button ng-click="close()">close</button>' +
								'</div> ' +
							'</div>';
				};

				scope.open= function(){
					$modal.open({
						template:getModalTemplate(),
						scope: function(){
							var newScope= $rootScope.$new();
							newScope.noteData= scope.noteData;
							return newScope;
						}(),

						controller: notesController,
					});
				};
			}
		};

	}

]);
angular.module('sdco-tools.directives')

/**
 * @ngdoc directive
 * @name sdco-tools.directive:menuSettings
 * @restrict E
 * @scope
 *
 * @description
 * Display a basic menu list, and allows to define an action when 
 * an option is selected/deselected
 *
 * @param {array=} settingsContent angular expression evaluating to an array defining the menu.
 * The array must contain well formed objects. Each object must contain the fields
 * <ul>
 *	<li>label: The label displayed in the menu</li>
 *	<li>selected: A boolean to specify that the element is selected</li>
 *	<li>select: A function to execute when the menu is selected</li>
 *	<li>deselect: A function to execute when the menu is deselected</li>
 * </ul>
 **/

.directive('sdcoOptionsMenu', ['$log', function($log){

	return {
		restrict:'E',
		replace:true,
		scope:{
			settingsContent:'='
		},
		template:'\
		<ul class="menu-settings"> \
			<li> \
				<a href="" class="main-menu" ng-click="expanded=!expanded"> \
				</a> \
			</li> \
			<li> \
				<ul class="menu-list" ng-show="expanded"> \
					<li \
						ng-repeat="currentOption in settingsContent" \
						ng-click="applyAction(currentOption)" \
					> \
						<a \
							href="" \
							title="{{currentOption.label}}" \
							ng-class="{\'menu-selected\':currentOption.selected}"> \
							{{currentOption.label}} \
						</a> \
					</li> \
				</ul> \
			</li> \
		</ul> \
		',
		link:  function($scope, $element, $attrs){

			$scope.expanded= false;

			$scope.applyAction= function(currentOption){
				if (currentOption.selected && currentOption.deselect){
					currentOption.deselect();
				}
				if (!currentOption.selected && currentOption.select){
					currentOption.select();
				}
				currentOption.selected= !currentOption.selected;
				$scope.expanded= false;
			};

		}
	};
}]);
angular.module('sdco-tools.directives')
/**
 * @ngdoc directive
 * @name sdco-tools.directive:sdcoStopKeydownPropagation
 *
 * @restrict A
 *
 * @description
 * 	Stop 'keydown' events from the element the directive is placed on
 **/
.directive('sdcoStopKeydownPropagation', function(){
	return {
		restrict:'A',
		link: function($scope, $element, $attrs){

			$element.on('keydown', function(e){
				e.stopPropagation();
			});
		}
	}
});

angular.module('sdco-tools.services', ['ngSanitize']);

/**
 * @ngdoc service
 * @name sdco-tools.service:sdcoEditorService
 *
 * @description
 * 
 * <p> 
 * 	This service is used internally to help
 *	{@link sdco-tools.directive:sdcoEditor sdo-editor} directive behavior
 * </p>
 *
 * <p> This service shouldn't be used out of {@link sdco-tools this module} </p>
 **/

 /**
 * @ngdoc service
 * @name sdco-tools.service:sdcoEditorServiceProvider
 *
 * @description
 * Provider of {@link sdco-tools.service:sdcoEditorService sdcoEditorService}
 * 
 **/
angular.module('sdco-tools.services')
.provider('sdcoEditorService', function(){

	/**
	* @ngdoc property
	* @name isStorageActive
	* @propertyOf sdco-tools.service:sdcoEditorServiceProvider
	* @description
	* <p>
	* Specify if the editors content should be stored or not.
	* If true, it will be stored in the data attribute of the body element.
	* This is usefull when you have different views and want to keep the
	* editor content when switching over views.
	* It is <b>false</b> by default.
	* </p>
	*
	* @example
	* <pre>
	* angular.module('yourMpdule', ['sdco-tools'])
	* .config(['sdcoEditorServiceProvider', 
	*   function(sdcoEditorServiceProvider){
	*  sdcoEditorServiceProvider.isStorageActive= true;
	*  ...
	* </pre>
	**/
	this.isStorageActive= false;
	var provider= this;

	var editorServiceImpl= function($log, $location, $rootScope, isStorageActive, instanceId){

			var installedEditors={};

			var getStoreKey= function(value){
				return 'sdcoEditor' + value + instanceId;
			};

			var getJsonDesc= function(){ 

				var res= [];

				angular.forEach(installedEditors, function(currentEditor, index){

					var currentMode= currentEditor.getOption('mode');
					var currentContent= currentEditor.getValue();

					res.push({id: index, content: currentContent});
				});

				return res;
			};


			this.store= function(current){
				var storeKey= getStoreKey(current);
				angular.element(document.querySelector('body')).data(storeKey, getJsonDesc());
				installedEditors= {};				
			};


			var getPreviousState= function(){
				var storeKey= getStoreKey($location.absUrl());
				return angular.element(document.querySelector('body')).data(storeKey);
			};

			/**
			* @ngdoc method
			* @name installEditor
			* @methodOf sdco-tools.service:sdcoEditorService
			* @description
			* Store an editor instance and to install it on the specified element
			* with the specified content.
			* 
			* @param {Element} theElement the element to install the editor to
			* @param {String} content the content to display in the editor
			* @param {String} type the content type, which has to be one of 
			* <b>javascript</b>, <b>html</b>, <b>css</b>
			*
			* @param {String} id the id of the editor. Typically, its indice in the page, which is 1
			* if it appears first in the page, 2 if its the second, ... Information needed to store
			* and retrieve its content based on the view when needed.
			*
			* @param {Boolean} readOnly specifies if the editor should be in read-only mode
			**/
			this.installEditor= function(theElement, content, type, id, readOnly)
			{
				//Check if an instance exists
				if (isStorageActive){
					var previousState= getPreviousState();
					var storedContent= previousState && previousState[id] && previousState[id].content;
					if (storedContent){ 
						content= storedContent;
					}
				}

				//Otherwise install new instance
				var options= {
					value: content,
					mode:{},
					lineNumbers:'true',
					theme:'eclipse',
					lineWrapping: true,
					readOnly: readOnly
				};

				switch(type){
					case 'javascript':
						options.mode.name='javascript';
					break;
					case 'html':
						options.mode.name='xml';
						options.htmlMode= true;
					break;
					case 'css':
						options.mode.name='css';
					break;
					default://TODO
					break;
				}

				editor= CodeMirror(theElement, options);

				//Stop keydown events propagation
				angular.element(editor.getWrapperElement()).on('keydown',function(e){
					e.stopPropagation();
				});

				installedEditors[id]= editor;

				return editor;
			};

			/**
			* @ngdoc method
			* @name getInstalledEditors
			* @methodOf sdco-tools.service:sdcoEditorService
			* @description
			* Get installed editors (in the current view)
			* 
			* @returns {Array} an array of editor instances installed in the current view
			**/
			this.getInstalledEditors= function(){
				return installedEditors;
			};

			this.setInstalledEditors= function(editors){
				installedEditors= editors;
			}

			/**
			* @ngdoc method
			* @name removeEditor
			* @methodOf sdco-tools.service:sdcoEditorService
			* @description
			* Remove an installed editor instance (both in the DOM and in the array referencing all instances)
			* 
			* @param {Object} editor the editor instance to remove
			**/
			this.removeEditor= function(editor){
				var that= this;
				angular.forEach(installedEditors, function(currentEditor, index){
					if (editor == currentEditor){
						angular.element(editor.getWrapperElement()).remove();
						delete installedEditors[index];
						return false;
					}
				});
			};

			/**
			* @ngdoc method
			* @name run
			* @methodOf sdco-tools.service:sdcoEditorService
			* @description
			* Get the content of installed editors aggregated by type
			* 
			* @returns {Object} an object containing one field by editor type, whose value
			* is the aggregation of editors contents of this type.
			* <pre>
			* {javascript:'all js content', css:'all css content', xml: 'all xml content'}
			* </pre>
			**/
			this.run= function(){

				var that= this;

				//Returns data by type
				var javascript='', html='', css='';
				angular.forEach(installedEditors, function(currentEditor, index){

					var currentMode= currentEditor.getOption('mode');
					var isHtml= currentEditor.getOption('htmlMode');


					if (currentMode.name == 'javascript'){
						javascript+= currentEditor.getValue();
					}
					else if (currentMode.name == 'css'){
						css+= currentEditor.getValue();
					}
					else if (currentMode.name == 'xml' && isHtml ){
						html+= currentEditor.getValue();
					}
				});

				return{
					javascript: javascript,
					html: html,
					css: css
				};
			};
	};



	//Get the service
	this.$get=['$log', '$location', '$rootScope', 
		function($log, $location, $rootScope){

			//The service instances for a view
			var viewInstances= [];

			var updateViewState= function(){
				$rootScope.$on('$locationChangeStart', function(event, next, current){

					//When the view changes, clear instances
					//And if storage mode is active, save data

					if (provider.isStorageActive){
						for (var i in viewInstances){
							var instance= viewInstances[i];
							instance.store(current);
						}
					}

					viewInstances= [];
				});
			};

			//Do we need to activate auto saving
			updateViewState();

			return {
				getInstance: function(){
					var newInstance= new editorServiceImpl($log, $location, $rootScope, provider.isStorageActive, viewInstances.length);
					if (provider.isStorageActive){
						viewInstances.push(newInstance);
					}
					return newInstance;
				}
			};



			
		}
	];


});
angular.module('sdco-tools.services')
.value('sdcoLocalStorageService', localStorage);
/**
 * @ngdoc service
 * @name sdco-tools.service:sdcoNotesService
 *
 * @description
 * 
 * <p> 
 * 	This service is used internally to help
 *	{@link sdco-tools.directive:sdcoNotes sdoNotes} and 
 * {@link sdco-tools.directive:sdcoNotesExport sdoNotesExport} 
 * directives behavior.
 * </p>
 *
 * <p> This service shouldn't be used out of {@link sdco-tools this module} </p>
 **/
angular.module('sdco-tools.services')
.service('sdcoNotesService', ['$rootScope', '$location', 'sdcoLocalStorageService',
 function($rootScope, $location, localStorage){

	this.commonPrefixKey= 'notes_export';
	this.unitPrefixKey= this.commonPrefixKey + '_unit';
	this.currentIndice= 0;
	this.unitMainKey= undefined;
	this.notes= [];
	this.globalPrefixKey= this.commonPrefixKey + '_globalNote';
	this.globalNote= '';

	/**
	* @ngdoc method
	* @name getViewKey
	* @methodOf sdco-tools.service:sdcoNotesService
	* @description
	* Store an editor instance and to install it on the specified element
	* with the specified content.
	* 
	*
	* @returns {String} the key which will be used to store/retrieve
	* a note in/from the localStorage.
	**/
	this.getViewKey= function(){
		return this.unitPrefixKey + this.unitMainKey;
	};

	/**
	* @ngdoc method
	* @name exportNotes
	* @methodOf sdco-tools.service:sdcoNotesService
	* @description
	* Get an array containing all the notes saved in the app.
	*
	* @returns {Array} all the notes saved in the app
	**/
	this.exportNotes= function(){
		var res= [];
		var regex= new RegExp(this.commonPrefixKey, 'i');
		for(var key in localStorage){
			var matches= key.match(regex);
			if (matches){
				res.push({key:key,note:localStorage[key]});
			}
		}

		return res;
	};

	/**
	* @ngdoc method
	* @name importNotes
	* @methodOf sdco-tools.service:sdcoNotesService
	* @description
	* Import (in the local storage) all notes in parameter
	*
	* @param {Array} notes the notes to import
	**/
	this.importNotes= function(notes){

		for (var id in notes){
			var entry= notes[id];
			localStorage.setItem(entry.key, entry.note);
			if (entry.key === this.globalPrefixKey){
				this.globalNote= entry.note;
			}
		}
	};

	/**
	* @ngdoc method
	* @name loadViewNotes
	* @methodOf sdco-tools.service:sdcoNotesService
	* @description
	* Locally loads notes used in the current view
	**/
	this.loadViewNotes= function(){
		var tmpbfr= [];
		var regex= new RegExp(this.getViewKey() + '_\\d', 'i');
		for(var key in localStorage){
			var matches= key.match(regex);
			if (matches){
				var indice= parseInt(matches[0].substring(matches[0].length - 1));
				tmpbfr.push({id: indice, note:localStorage[key]});
			}
		}

		this.notes.length= tmpbfr.length;
		for(var i in tmpbfr){
			this.notes[tmpbfr[i].id]= tmpbfr[i].note;
		}
	};

	/**
	* @ngdoc method
	* @name loadGlobalNote
	* @methodOf sdco-tools.service:sdcoNotesService
	* @description
	* Locally loads global notes (accessibles in any view)
	**/
	this.loadGlobalNote= function(){
		//Is it already loaded
		if (this.globalNote.trim() !== ''){
			return this.globalNote;
		}
		//Retrieve from localStorage
		else{
			var globalNote= localStorage[this.globalPrefixKey];
			if (globalNote){
				this.globalNote= globalNote;
			}
		}
	};	

	/**
	* @ngdoc method
	* @name getNote
	* @methodOf sdco-tools.service:sdcoNotesService
	* @description
	* Get information about a note. Will be the first note for this view
	* for the first call of the function, the second note for the second call, and so on.
	*
	* @returns {Object} An object containing the id (or position) of the note, 
	* and its content.
	**/
	this.getNote= function(){
		var res= {id: this.currentIndice, note: this.notes[this.currentIndice]};
		this.currentIndice++;
		return res;
	};

	/**
	* @ngdoc method
	* @name getGlobalNote
	* @methodOf sdco-tools.service:sdcoNotesService
	* @description
	* Get the global note content
	*
	* @returns {Object} An object with the global note content.
	**/
	this.getGlobalNote= function(){
		return {note: this.globalNote};
	};

	/**
	* @ngdoc method
	* @name saveNote
	* @methodOf sdco-tools.service:sdcoNotesService
	* @description
	* Save a new local or global note.
	*
	* @param {Object} the note to save
	**/
	this.saveNote= function(noteData){
		//Local note depending on the route
		if (noteData.id!==undefined){
			this.notes[noteData.id]= noteData.note;
			localStorage.setItem(this.getViewKey() + '_' + noteData.id, noteData.note);
		}
		//Global note for the app
		else{
			this.globalNote= noteData.note;
			localStorage.setItem(this.globalPrefixKey, noteData.note);
		}
	};

	/**
	* @ngdoc method
	* @name init
	* @methodOf sdco-tools.service:sdcoNotesService
	* @description
	* Listen view changes to update needed data
	**/
	this.init= function(){
		var that= this;
		$rootScope.$on('$locationChangeSuccess', function(event, next, current){
			var viewId= $location.url();
			that.unitMainKey= viewId;
			that.currentIndice= 0;
			that.loadViewNotes();
			that.loadGlobalNote();
		});
	};

	this.init();

}]);