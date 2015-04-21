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
			return new editorServiceImpl($log, $location, $rootScope, this.isStorageActive);
		}
	];


});