'use strict';

describe('service sdco-editor', function(){
    //Common data

    // common vars for tests
    var service, rootScope, mockInstance;

    beforeEach(angular.mock.module('sdco-tools.services'));

    //Mocks
    beforeEach(function(){

        var MockLocation= function(){
            this.absUrl= jasmine.createSpy('absUrl')
                .and.callFake(function(){
                    return "http://serveur:port/#/slide1";
            });
        }

        mockInstance= new MockLocation();

        module(function($provide, sdcoEditorServiceProvider){
            $provide.value('$location', mockInstance);
            sdcoEditorServiceProvider.isStorageActive= true;
        });
    });

    //Get service ref
    beforeEach(inject(function($rootScope, sdcoEditorService){
        rootScope= $rootScope;
        service= sdcoEditorService;

        rootScope.$digest();
    }));

    it('Check installEditor html', function(){

        var installToElement= $('<div id="editor1 />')[0],
            content='<div>content</div>',
            type= 'html',
            id= 0,
            readonly= true;

        var editor= service.installEditor(installToElement, content, type, id, readonly);

        expect(editor.getValue()).toBe(content);
        expect(editor.getOption('htmlMode')).toBe(true);
        expect(editor.getOption('mode').name).toBe('xml');

        var installedEditors= service.getInstalledEditors();
        expect(installedEditors[0]).toBe(editor);

        //Clean
        $(installToElement).remove();
    });

    it('Check installEditor css', function(){

        var installToElement= $('<div id="editor1 />')[0],
            content='.myrule{ background-color: blue; }',
            type= 'css',
            id= 0,
            readonly= true;

        var editor= service.installEditor(installToElement, content, type, id, readonly);

        expect(editor.getValue()).toBe(content);
        expect(editor.getOption('mode').name).toBe('css');

        var installedEditors= service.getInstalledEditors();
        expect(installedEditors[0]).toBe(editor);

        //Clean
        $(installToElement).remove();
    });

    it('Check installEditor javascript', function(){

        var installToElement= $('<div id="editor1 />')[0],
            content='conosle.log("toto");',
            type= 'javascript',
            id= 0,
            readonly= true;

        var editor= service.installEditor(installToElement, content, type, id, readonly);

        expect(editor.getValue()).toBe(content);
        expect(editor.getOption('mode').name).toBe('javascript');

        var installedEditors= service.getInstalledEditors();
        expect(installedEditors[0]).toBe(editor);

        //Clean
        $(installToElement).remove();
    });

    it('Check installEditor with previous state', function(){

        var installToElement= $('<div id="editor1 />')[0],
            content='<div>content</div>',
            type= 'html',
            id= 0,
            readonly= true,
            storeKey= 'sdcoEditor' + mockInstance.absUrl();

        //store content to be retrieved during install
        $('body').data(storeKey, [{id:0, content:content}]);

        var editor= service.installEditor(installToElement, undefined, type, id, readonly);

        expect(editor.getValue()).toBe(content);
        expect(editor.getOption('htmlMode')).toBe(true);
        expect(editor.getOption('mode').name).toBe('xml');

        var installedEditors= service.getInstalledEditors();
        expect(installedEditors[0]).toBe(editor);

        //Clean
        $(installToElement).remove();
    });


    it('Check removeEditor', function(){
        var element= $('<div id="editor1" />')[0];
        var editor= CodeMirror(element, {content:''});
        var editors={0:editor};
        service.setInstalledEditors(editors);

        service.removeEditor(editor);

        expect(service.getInstalledEditors()[0]).not.toBeDefined();
    });

    it('Check run', function(){

        var MockEditor= tuUtils.getMockedEditor();

        var htmlContent= '<div />',
            cssContent= '.rule{color:white;}',
            jsContent= 'console.log();',
            editors={
                0: new MockEditor('html', htmlContent),
                1: new MockEditor('css', cssContent),
                2: new MockEditor('javascript', jsContent),
                4: new MockEditor('html', htmlContent),
                5: new MockEditor('css', cssContent),
                6: new MockEditor('javascript', jsContent),
            }

            service.setInstalledEditors(editors);
            var res= service.run();

            expect(res.javascript).toBe(jsContent + jsContent);
            expect(res.html).toBe(htmlContent + htmlContent);
            expect(res.css).toBe(cssContent + cssContent);
    });

 
});