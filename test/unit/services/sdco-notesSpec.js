'use strict';

describe('service sdco-notes', function(){
    //Common data
    var lsKey1= 'slide1_0',
        lsVal1= 'first note';

    // common vars for tests
    var service, rootScope, mockInstance;

    beforeEach(angular.mock.module('sdco-tools.services'));

    //Mocks
    beforeEach(function(){

        var MockLocalStorage= function(){
            this[lsKey1]= lsVal1;
            var that= this;

            this.setItem= 
                jasmine.createSpy('setItem')
                .and.callFake(function(key, value){
                    that[key]= value;
            });

            this.getItem= jasmine.createSpy('getItem').and.callFake(function(key){
                    return that[key];
            });


        }

        mockInstance= new MockLocalStorage();

        module(function($provide){
            $provide.value('sdcoLocalStorageService', mockInstance);
        });
    });

    //Get service ref
    beforeEach(inject(function($rootScope, sdcoNotesService){
        rootScope= $rootScope;
        service= sdcoNotesService;
    }));


    it('Check init function when location changes', function(){
        service.loadViewNotes= function(){};
        service.init();

        rootScope.$broadcast(
            '$locationChangeSuccess', 
            'http://server:port/#/slide1',
            undefined
        );

        expect(service.mainKey).toBe('slide1');
        expect(service.currentIndice).toBe(0);
    });

    it('Check exportNotes', function(){

        service.init();
        var res= service.exportNotes();
        expect(res.length).toBe(1);

        var content= res[0];
        expect(content.key).toBe(lsKey1);
        expect(content.note).toBe(lsVal1);
    });


    it('Check exportNotes', function(){

        var importData= [{key:'slide1_1', note:'note2'}];

        service.init();
        var res= service.importNotes(importData);
        expect(mockInstance.setItem).toHaveBeenCalledWith(importData[0].key, importData[0].note);
    });

    it('Check loadViewNotes', function(){
        var lsKey2= 'slide1_1', lsVal2= 'second note';
        mockInstance[lsKey2]= lsVal2;

        service.init();

        rootScope.$broadcast(
            '$locationChangeSuccess', 
            'http://server:port/#/slide1',
            undefined
        );

        expect(service.notes.length).toBe(2);
        expect(service.notes[0]).toBe(lsVal1);
        expect(service.notes[1]).toBe(lsVal2);
    });

    it('Check getNote', function(){

        service.init();

        rootScope.$broadcast(
            '$locationChangeSuccess', 
            'http://server:port/#/slide1',
            undefined
        );

        var note= service.getNote();

        expect(note.id).toBe(0);
        expect(note.note).toBe(lsVal1);        
    });

    it('Check saveNote', function(){

        service.init();

        rootScope.$broadcast(
            '$locationChangeSuccess', 
            'http://server:port/#/slide1',
            undefined
        );

        var noteToSave= {id:1, note:'note to save'};

        var note= service.saveNote(noteToSave);

        expect(service.notes[1]).toBe(noteToSave.note);
        expect(mockInstance.setItem)
        .toHaveBeenCalledWith('slide1_' + noteToSave.id, noteToSave.note);
    });    

    
});