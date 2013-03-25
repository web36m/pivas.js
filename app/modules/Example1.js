PV.declare('Example1', 'Module', function(config){
	var self = this;

	this.view.events.on('send', function(text){
		self.emit('Example2message', text);
	});

	this.Example1message = function(text){
		self.view.events.trigger('message', text);
	};

	this.init = function(){
		
	};

	this.destroy = function(){
		
	};
});