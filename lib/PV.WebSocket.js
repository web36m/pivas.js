(function(PV){
	var global = this;
	var WS = function(server){
		var socket, events = new PV.Events;
		if ('WebSocket' in global){
			socket = new WebSocket(server);
			socket.onopen = function(){
				events.trigger('connect');
				socket.onmessage = function(data){
					events.trigger('message', data.data);
				};
			};
			socket.onclose = function(){
				events.trigger('disconnect');
			};
		}
		this.on = events.on;
		this.emit = function(data){
			socket.send(data);
		};
		this.close = function(){
			socket.close();
		};
	};
	PV.define('PV.WebSocket', function(server){
		return new WS(server);
	});
})(PV);