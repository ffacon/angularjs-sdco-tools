'use strict';

describe('Directive sdcoEditorTab', function(){

	var scope, topElement, element, htmlContent,
		mockSdcoEditorService, sdcoEditorDirectiveMocks, mockEditor;


	beforeEach(angular.mock.module('sdco-tools.directives'));

	beforeEach(function(){

		sdcoEditorDirectiveMocks={
			link: function(){},
			controller: function(){
				this.processEditorsContent= jasmine.createSpy('processEditorsContent');
				this.getNbEditors= jasmine.createSpy('getNbEditors')
				.and.callFake(function(){return 1;});
				this.addTabScope= jasmine.createSpy('addTabScope');
				this.setPreview= jasmine.createSpy('setPreview');
				this.getScope= jasmine.createSpy('getScope')
				.and.callFake(function(){return {readOnly: true};});
			}
		}

		var MockEditor= tuUtils.getMockedEditor();

		mockSdcoEditorService= new function(){
			this.installEditor= jasmine.createSpy('installEditor')
			.and.callFake(function(theElement, content, type, id, readOnly){
				mockEditor= new MockEditor(type, content);
				return mockEditor;
			});
			this.getInstalledEditors= jasmine.createSpy('getInstalledEditors');
			this.setInstalledEditors= jasmine.createSpy('setInstalledEditors');
			this.removeEditor= jasmine.createSpy('removeEditor');
			this.run= jasmine.createSpy('run');
		}


		module(function($provide){
			$provide.value('sdcoEditorService', mockSdcoEditorService);
			$provide.value('sdcoEditorLinkFn', sdcoEditorDirectiveMocks.link);
			$provide.value('sdcoEditorControllerFn', sdcoEditorDirectiveMocks.controller);
		});

	});

	beforeEach(inject(function($rootScope, $compile){

			scope= $rootScope.$new();
			htmlContent= '&lt;div&gt;Some html&lt;/div&gt;';

			var directiveStr= 
					'<sdco-editor>' +
					'	<sdco-editor-tab type="html" heading="test.html">' +
					htmlContent +
					'	</sdco-editor-tab>' +
					'</sdco-editor>';

			topElement= $compile(directiveStr)(scope);
			element= topElement.first('div');
			scope.$digest();
	}));


	it('Check installEditor is called with needed args', function(){

		expect(mockSdcoEditorService.installEditor).toHaveBeenCalled();

		var lastCall= mockSdcoEditorService.installEditor.calls.mostRecent(),
			args= lastCall.args,
			content= args[1], 
			type= args[2];

		expect(type).toBe('html');
		expect(content).toBe(htmlContent.replace(/&lt;/g, '<').replace(/&gt;/g,'>'));
	});

	it('Check editor events are not handled (readonly mode)', function(){
		expect(mockEditor.on).not.toHaveBeenCalled();
	});

	it('Check editor events are handled (readonly false)', function(){

		sdcoEditorDirectiveMocks.controller.getScope= jasmine.createSpy('getScope')
		.and.callFake(function(){
			return {
				readOnly: false, 
				checkAndProcessContent: function(){}
			};
		});

		expect(mockEditor.on).not.toHaveBeenCalled();
	});

});


	