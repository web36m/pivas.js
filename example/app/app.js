PV.init({
	version : '1.0.1',
	languages : ['en'],
	descriptors : 'app/descriptors',
	locales : 'app/locales',
	modules : 'app/modules',
	templates : 'app/templates',
	views : 'app/views'
});
PV.ready(function(){
	PV.Language.identify();
	PV.factoryModule('Tree');
	PV.factoryModule('Example1');
	PV.factoryModule('Example2');
});