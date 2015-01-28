'use strict';

describe('directive sdcoCustomEventActions', function(){
    // common vars for tests
    var scope, directiveElement;
 
    //mock Application to allow us to inject our own dependencies
    beforeEach(angular.mock.module('sdco-tools.directives'));
    //we need to compile our directive
    beforeEach(angular.mock.inject(function($compile, $rootScope){
        //create an empty scope
        scope = $rootScope.$new();
        //declare the controller and inject our empty scope
        directiveElement= angular.element('<div sdco-custom-event-actions current-index="initialIndex"></div>');
        $compile(directiveElement)(scope);
    }));


    it('Decrement index, should be 0', function(){
        scope.$apply(function(){
            scope.initialIndex= 1;
        })
        tuUtils.triggerKeydown(directiveElement, 37);
        scope.$digest();
        expect(directiveElement.isolateScope().currentIndex).toBe(0);
        expect(scope.initialIndex).toBe(0);
    });

    it('Increment index, should be 2', function(){
        scope.$apply(function(){
            scope.initialIndex= 1;
        })        
        tuUtils.triggerKeydown(directiveElement, 39);
        scope.$digest();
        expect(directiveElement.isolateScope().currentIndex).toBe(2);
        expect(scope.initialIndex).toBe(2);
    });
});