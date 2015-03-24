angular.module('sdco-tools', [
	'sdco-tools.directives', 'sdco-tools.services',
	'ngSanitize', 'ui.bootstrap'
]);
angular.module('sdco-tools.directives', ['ui.bootstrap', 'sdco-tools.services']);
angular.module('sdco-tools.directives')
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
			return ( $scope.compile==true && $scope.confirmPreview );
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
angular.module('sdco-tools.directives')
/**
 * @ngdoc directive
 * @name jsFiddle
 * @restrict E
 *
 * @description
 * Add a link which allows to send a post request to jsFiddle
 * Stylesheet (and image) is defined through the jsfiddle class
 *
 * @scope
 *
 * @param {string@} fwk the name of the framework to use (
 * <a href="http://jsfiddle.net/" target="blank">go here</a>
 * to get available values)
 *
 * @param {string@} version the version of the framework (
 * <a href="http://jsfiddle.net/" target="blank">go here</a>
 * to get available values)
 * 
 * @param {string@} title for this jsFiddle
 * 
 * @param {string@} description for this jsFiddle
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
					<input type="text" name="html" ng-model="data.html" > \
					<input type="text" name="js" ng-model="data.javascript" > \
					<input type="text" name="css" ng-model="data.css" > \
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
.directive('sdcoNotesExport',[ '$log', '$modal', 'sdcoNotesService',
	function($log, $modal, sdcoNotesService){

		var exportController= function($scope, $modalInstance){

			$scope.notes= JSON.stringify(sdcoNotesService.exportNotes());

			$scope.saveNotes= function(){
				sdcoNotesService.importNotes(JSON.parse($scope.notes));
			};
		};

		return{
			restrict: 'E',
			scope:{},
			template:'\
				<button class="main-note" ng-click="open()" /> \
			',
			link:function(scope, element, attrs){


				var getModalTemplate= function(){
					return '<div style="font-size: small;">' + 
								'<div class="modal-header"> All Notes </div>' +
								'<div class="modal-body">' +
								'<p> Copy this content in a file to save your comments or ' +
								'replace the content with your one to update all the notes </p>' +
								'<h2>Your notes</h2>' + 
								'<textarea ng-model="notes" rows="10" style="width:100%;" >' +
								'</textarea>' +
								'<input type="submit" ng-click="saveNotes()" value="save" />' +
								'</div> \
							</div>';
				};

				scope.open= function(){
					$modal.open({
						template:getModalTemplate(),
						controller: exportController
					});
				};
			}
		};

	}

]);
angular.module('sdco-tools.directives')
.directive('sdcoNotes',[ '$log', '$modal', 'sdcoNotesService',
	function($log, $modal, sdcoNotesService){

		var notesController= function($scope, $modalInstance, noteData){

			$scope.noteData= noteData;
			
			$scope.saveNote= function(){
				sdcoNotesService.saveNote($scope.noteData);
			};
		};

		return{
			restrict: 'E',
			transclude: true,
			scope:{},
			template:'\
				<button class="local-note" ng-click="open()"> \
				<div ng-show="false" ng-transclude /> \
			',
			link:function(scope, element, attrs){

				scope.noteData=sdcoNotesService.getNote();

				var transcludeElt= angular.element(element[0].querySelector('div[ng-transclude]'));
				var modalContent= transcludeElt.html();
				//remove transcluded content
				transcludeElt.contents().remove();

				var getModalTemplate= function(){
					return '<div style="font-size: small;"> ' +
								'<div class="modal-header"> Notes </div> ' +
								'<div class="modal-body">' +
									'<p>' + modalContent + '</p>' +
								'<h2>Your notes</h2>' + 
								'<textarea ng-model="noteData.note" rows="10" style="width:100%;" />' +
								'<input type="submit" ng-click="saveNote()" value="save" />' +
								'</div> ' +
							'</div>';
				};

				scope.open= function(){
					$modal.open({
						template:getModalTemplate(),
						controller: notesController,
						resolve: {
							noteData: function(){
								return scope.noteData;
							}
          				}
					});
				};
			}
		};

	}

]);
angular.module('sdco-tools.directives')

/**
 * @ngdoc directive
 * @name menuSettings
 * @restrict E
 *
 * @description
 * Display a basic menu, and allows to define an action when 
 * an option is selected/deselected
 *
 * @scope
 *
 * @param {array=} settingsContent angular expression evaluating to array of objects containing the fields
 * label (String), selected (boolean), select (function) and deselect (function).
 * So the data should look like [{label:'option1', selected: true, select:action1, deselect:action2}, ...].
 *
 * 
 * @param {string=} onload Expression to evaluate when a new partial is loaded.
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
angular.module('sdco-tools.services', ['ngSanitize']);

/**
* @ngdoc service
* @name codeMirrorService
* 
* @description
* used by editors directives to get/sort data.
* Can also be used by your app to store data in
* the DOM or the localStorage
*/
angular.module('sdco-tools.services')
.provider('sdcoEditorService', function(){

	this.isStorageActive= false;

	var editorServiceImpl= function($log, $location, $rootScope, isStorageActive){

			var installedEditors={};

			var getStoreKey= function(value){
				return 'sdcoEditor' + value;
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


			/**
			* @ngdoc method
			* @name codeMirrorService#toDom
			* @param {element} element the element to use to store the editor contents
			* @param {boolean} [hide=true] should the element be hidden
			* 
			* @description
			* Store the editor tabs content in the DOM
			* This can be usefull when, for example, you go back to
			* a view which has already been cached
			*/
			var activateStateSaving= function(){
				$rootScope.$on('$locationChangeStart', function(event, next, current){
					var storeKey= getStoreKey(current);
					angular.element(document.querySelector('body')).data(storeKey, getJsonDesc());
					installedEditors= {};
				});
			};

			//Do we need to activate auto saving
			if (isStorageActive){
				activateStateSaving();
			}			


			var getPreviousState= function(){
				var storeKey= getStoreKey($location.absUrl());
				return angular.element(document.querySelector('body')).data(storeKey);
			};

			/**
			* @ngdoc method
			* @name codeMirrorService#fromDom
			* @param {element} element the element to use to retrieve the editor contents
			* @param {boolean} [removeContent=true] should the element content be removed
			* 
			* @description
			* Retrieve the editor tabs content from the DOM
			* This can be usefull when, for example, you go back to
			* a view which has already been cached
			*/
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

			this.getInstalledEditors= function(){
				return installedEditors;
			};

			this.setInstalledEditors= function(editors){
				installedEditors= editors;
			};

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


			this.run= function(isAngular){

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
					javascript: ( javascript.trim().length>0? javascript: undefined ),
					html: html.trim(),
					css: css.trim()
				};
			};
	};



	//Get the service
	this.$get=['$log', '$location', '$rootScope', 
		function($log, $location, $rootScope){
			return new editorServiceImpl($log, $location, $rootScope, this.isStorageActive);
		}
	];


});
angular.module('sdco-tools.services')
.value('sdcoLocalStorageService', localStorage);
angular.module('sdco-tools.services')
.service('sdcoNotesService', ['$rootScope', 'sdcoLocalStorageService',
 function($rootScope, localStorage){

	this.commonPrefixKey= 'slide';
	this.currentIndice= 0;
	this.mainKey= undefined;
	this.notes= [];


	this.exportNotes= function(){
		var res= [];
		var regex= new RegExp(this.commonPrefixKey + '\\d_\\d', 'i');
		for(var key in localStorage){
			var matches= key.match(regex);
			if (matches){
				res.push({key:key,note:localStorage[key]});
			}
		}

		return res;
	};

	this.importNotes= function(notes){

		for (var id in notes){
			var entry= notes[id];
			localStorage.setItem(entry.key, entry.note);
		}
	};

	this.loadViewNotes= function(){
		var tmpbfr= [];
		var regex= new RegExp(this.mainKey + '_\\d', 'i');
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
	* Return the indice for the note and the note content
	*/
	this.getNote= function(){
		var res= {id: this.currentIndice, note: this.notes[this.currentIndice]};
		this.currentIndice++;
		return res;
	};

	this.saveNote= function(noteData){
		this.notes[noteData.id]= noteData.note;
		localStorage.setItem(this.mainKey + '_' + noteData.id, noteData.note);
	};


	this.init= function(){
		var that= this;
		$rootScope.$on('$locationChangeSuccess', function(event, next, current){
			var matches= next.match(/slide\d/i);
			if (matches){
				that.mainKey= matches[matches.length-1];
				that.currentIndice= 0;
				that.loadViewNotes();
			}
		});
	};

}]);