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