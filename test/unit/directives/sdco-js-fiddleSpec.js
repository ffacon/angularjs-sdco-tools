'use strict';

describe('Directive sdcoJsFiddle', function(){

	var scope, element, mockSce;
	var directiveAttributes={
		fwk: 'fakeFwk', 
		version: '1.0.0', 
		title: 'sample',
		desc:'sample'
	};


	beforeEach(angular.mock.module('sdco-tools.directives'));

	beforeEach(function(){

		mockSce= {
			trustAsResourceUrl: jasmine.createSpy('trustAsResourceUrl')
			.and.callFake(function(uri){
				return uri;
			})
		}

		module(function($provide){
			$provide.value('$sce', mockSce);
		});

	})

	beforeEach(inject(function($rootScope, $compile){

			scope= $rootScope.$new();

			scope.fiddleData={
				html:'<div></div>',
				javascript:'console.log();',
				css:'.rule{color:white;}'
			}

			var directiveStr= '<sdco-js-fiddle' +
				' fwk="' + directiveAttributes.fwk + '" ' +
				' version="' + directiveAttributes.version + '" ' +
				' title="' + directiveAttributes.title + '" ' +
				' desc="'+ directiveAttributes.desc +'" ' +
				' data="fiddleData" ' +
				'></sdco-js-fiddle>';
			element= $(directiveStr);
			$compile(element)(scope);
			scope.$digest();
	}));


	it('Check data is set', function(){

		expect(element.find('textarea[name=html]').val()).toBe(scope.fiddleData.html);
		expect(element.find('textarea[name=js]').val()).toBe(scope.fiddleData.javascript);
		expect(element.find('textarea[name=css]').val()).toBe(scope.fiddleData.css);
		expect(element.find('input[name=title]').val()).toBe(directiveAttributes.title);
		expect(element.find('input[name=description]').val()).toBe(directiveAttributes.desc);

	});


	it('Check url used', function(){
		var uri= 'http://jsfiddle.net/api/post/' + 
		directiveAttributes.fwk +'/' + 
		directiveAttributes.version +'/';

		expect(mockSce.trustAsResourceUrl).toHaveBeenCalledWith(uri);
	});

	it('Check submit called when element is clicked', function(){

		element[0].submit= jasmine.createSpy('submit');
		element.find('a').click();

		expect(element[0].submit).toHaveBeenCalled();		
	});

})


	