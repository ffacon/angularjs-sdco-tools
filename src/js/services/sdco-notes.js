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