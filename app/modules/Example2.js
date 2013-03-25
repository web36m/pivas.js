PV.declare('Example2', 'Module', function(config){
	var self = this;

	this.view.events.on('send', function(text){
		self.emit('Example1message', text);
	});

	this.Example2message = function(text){
		self.view.events.trigger('message', text);
	};

	this.init = function(){
		
	};

	this.destroy = function(){
		
	};
});