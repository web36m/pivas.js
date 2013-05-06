PV.define('PV.Template', function(html, context){
	context = context || this;
	if (context.getText instanceof Function){
		html = html.replace(/{{(.*)}}/ig, function(placeholder, key){
			return context.getText(key);
		});
	} else {
		html = html.replace(/{{(.*)}}/ig, '');
	}
	var Template = function(html){
		var i;
		var self = this;
		var parent = false;
		var collection = [];
		var element = document.createElement('element');
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
		element.innerHTML = html;
		getNodes(element);
		for (i = 0; i < element.children.length ; i++){
			collection.push(element.children[i]);
		}
		for (i = element.children.length - 1; i >= 0 ; i--){
			element.removeChild(element.children[i]);
		}
		this.clone = function(name){
			var element = document.createElement('element');
			if (self[name] && 'innerHTML' in self[name]){
				element.innerHTML = self[name].outerHTML;
				return element.children[0];
			}
			return null;
		};
		this.renderTo = function(node){
			if (!parent){
				parent = node;
				parent && PV.each(collection, function(i,item){
					parent.appendChild(item);
				});
			}
		};
		this.remove = function(){
			if (parent){
				PV.each(collection, function(i,item){
					parent.removeChild(item);
				});
				parent = false;
			}
		};
	};
	return new Template(html);
});
