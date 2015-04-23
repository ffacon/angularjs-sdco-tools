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
angular.module('sdco-tools.services', ['ngSanitize']);

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
