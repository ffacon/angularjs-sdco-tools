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

	this.getViewKey= function(){
		return this.unitPrefixKey + this.unitMainKey;
	};


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

	this.importNotes= function(notes){

		for (var id in notes){
			var entry= notes[id];
			localStorage.setItem(entry.key, entry.note);
			if (entry.key === this.globalPrefixKey){
				this.globalNote= entry.note;
			}
		}
	};

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
	* Return the indice for the note and the note content
	*/
	this.getNote= function(){
		var res= {id: this.currentIndice, note: this.notes[this.currentIndice]};
		this.currentIndice++;
		return res;
	};

	this.getGlobalNote= function(){
		return {note: this.globalNote};
	};

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