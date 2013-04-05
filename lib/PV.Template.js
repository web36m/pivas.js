PV.define('PV.Template', function(id){
	var Template = function(id){
		var self = this;
		var element = document.createElement('element');
		var tpl, tpl_callback, tpl_ready = false;
		var getNodes = function(parent){
			var i, name;
			for (i = 0; i < parent.children.length; i++){
				if ('getAttribute' in parent.children[i]){
					name = parent.children[i].getAttribute('pv');
					if (name !== null){
						self[name] = parent.children[i];
						self[name].removeAttribute('pv');
					}
				}
				getNodes(parent.children[i]);
			}
		};
		var tpl = document.getElementById(id);
		if (tpl){
			element.innerHTML = tpl && tpl.innerHTML ? tpl.innerHTML : '';
			getNodes(element);
			tpl_ready = true;
		}else{
			'Http' in PV && PV.Http.get(PV.config.templates+'/'+id).success(function(responseText){
				element.innerHTML = responseText;
				getNodes(element);
				tpl_ready = true;
				tpl_callback instanceof Function && tpl_callback.call(self);
			});
		}
		this.onready = function(callback){
			if (tpl_ready){
				callback instanceof Function && callback.call(self);
			}else{
				tpl_callback = callback;
			}
		};
		this.clone = function(name){
			var element = document.createElement('element');
			if (self[name] && 'innerHTML' in self[name]){
				element.innerHTML = self[name].outerHTML;
				return element.children[0];
			}
			return null;
		};
		this.renderTo = function(node){
			var i, items = [];
			for (i = 0; i < element.children.length; i++){
				items.push(element.children[i]);
			}
			PV.each(items, function(i,item){
				element.removeChild(item);
				node.appendChild(item);
			});
		};
	};
	return new Template(id);
});