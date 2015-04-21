/**
 * @ngdoc overview
 * @name sdco-tools
 *
 * @description
 * <p>
 * Module containing multiple transverse components.
 * It can be seen as a component library which will evolve
 * over time.
 * </p>
 * <p>
 * This library is designed in a way which allows us to generate
 * several light sub libraries (TODO) for those which dont' want to import
 * the whole module.
 * </p>
 **/
angular.module('sdco-tools', [
	'sdco-tools.directives', 'sdco-tools.services',
	'ngSanitize', 'ui.bootstrap'
]);