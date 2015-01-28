'use strict';

describe('Directive sdcoOptionsMenu', function(){

	var scope, element;

	beforeEach(angular.mock.module('sdco-tools.directives'));

	beforeEach(inject(function($rootScope, $compile){

			scope= $rootScope.$new();

			scope.settingsContent= [{
				label:'data1',
				selected:'true',
				select:jasmine.createSpy('select'),
				deselect:jasmine.createSpy('deselect')
			}];

			element= $('<sdco-options-menu settings-content="settingsContent"></sdco-options-menu>');
			$compile(element)(scope);
			scope.$digest();
		
	}));


	it('Check that element is available when needed', function(){
		var listElement= element.find('a[title="data1"]');
		expect(listElement.hasClass('menu-selected')).toBe(true);

		scope.settingsContent[0].selected=false;
		scope.$digest();

		expect(listElement.hasClass('menu-selected')).toBe(false);
	});

	it('Check select deselect method to be called', function(){
		var listElement= element.find('a[title="data1"]');
		listElement.click();
		expect(scope.settingsContent[0].deselect).toHaveBeenCalled();

		scope.settingsContent[0].selected=false;
		scope.$digest();

		listElement.click();
		expect(scope.settingsContent[0].select).toHaveBeenCalled();

	});

})


	