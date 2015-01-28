'use strict';

describe('service sdco-notes', function(){
    //common data
    var content= 'content';
    // common vars for tests
    var directiveElement, scope, mockNotesService, mockModal;

    beforeEach(angular.mock.module('sdco-tools.directives'));

    //Mocks
    beforeEach(function(){

        var MockNotesService= function(){
            this.currentIndice= 0;
            this.exportNotes=jasmine.createSpy('exportNotes');
            this.importNotes=jasmine.createSpy('importNotes');
            this.loadViewNotes=jasmine.createSpy('loadViewNotes');
            this.getNote=jasmine.createSpy('getNote')
            .and.callFake(function(){
                var res= {id: this.currentIndice, note: 'note' + this.currentIndice};
                this.currentIndice++;
                return res;
            });
            this.saveNote=jasmine.createSpy('saveNote');
            this.init=jasmine.createSpy('init');
        }

        var MockModalService= function(){
            this.open= jasmine.createSpy('open');
        }

        mockNotesService= new MockNotesService();
        mockModal= new MockModalService();

        module(function($provide){
            $provide.value('sdcoNotesService', mockNotesService);
            $provide.value('$modal', mockModal);
        });
    });

    //Get service ref
    beforeEach(inject(function($rootScope, $compile){
        scope= $rootScope.$new();
        //declare the controller and inject our empty scope
        directiveElement= angular.element('<sdco-notes-export></sdco-notes-export>');
        $compile(directiveElement)(scope);
        scope.$digest();
    }));


    it('Check click call modal', function(){

        directiveElement.find('button').click();
        var arg= mockModal.open.calls.mostRecent().args[0];
        expect(mockModal.open).toHaveBeenCalled();
    });
});