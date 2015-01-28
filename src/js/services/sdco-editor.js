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