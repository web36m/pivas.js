(function(PV){
	var global = this;
	var xhr = function(){
		if ('XMLHttpRequest' in global){
			return function(){
				return new global.XMLHttpRequest();
			};
		}
		if ('ActiveXObject' in global){
			return function(){
				var request;
				try {
					request = new global.ActiveXObject("Microsoft.XMLHTTP");
				}catch(e){
					try {
						request = new global.ActiveXObject("Msxml2.XMLHTTP");
					}catch(ee){};
				};
				return request;
			};
		}
		return function(){};
	}();
	var Handlers = function(){
		self = this;
		this.success = function(callback){
			self.success_callback = callback;
			return self;
		};
		this.error = function(callback){
			self.error_callback = callback;
			return self;
		};
	};
	PV.namespace('PV.Http');
	PV.extend(PV.Http, {
		xhr : function(){
			return xhr();
		},
		get : function(url){
			var handler = new Handlers();
			var request = xhr();
			request.open('GET', url);
			request.send();
			request.onreadystatechange = function(){
			if (request.readyState===4){
					if (request.status===200){
						handler.success_callback instanceof Function && handler.success_callback.call(this, request.responseText, request.status);
					}else{
						handler.success_callback instanceof Function && handler.success_callback.call(this, request.responseText, request.status);
					}
				}
			};
			return handler;
		}
	});
})(PV);