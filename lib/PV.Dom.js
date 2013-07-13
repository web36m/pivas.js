(function(PV){
	var global = this;
	PV.namespace('PV.Dom');
	PV.extend(PV.Dom, {
		title : function(text){
			if (document.title) {
				document.title = text;
			} else {
				document.getElementsByTagName('title')[0].innerHTML = text;
			}
		},
		css : function(url){
			var link = PV.Dom.element('link',{
				href : url+(url.match(/\?/) ? '&' : '?')+'v='+PV.config.version,
				rel : 'stylesheet',
				media : 'all'
			});
			var head = document.head || document.getElementsByTagName('head')[0];
			return {
				link : link,
				render : function(callback, context){
					var success = false;
					var timeout = setTimeout(function(){
						clearTimeout(timeout);
						if (!success){
							success = true;
							callback instanceof Function && callback.call(context || global);
						}
					},1000);
					head.appendChild(link);
					link.onload = link.onreadystatechange = function(){
						link.onload = link.onreadystatechange = null;
						if (!success){
							success = true;
							callback instanceof Function && callback.call(context || global);
						}
					};
				},
				remove : function(){
					if (link.parentNode === head){
						head.removeChild(link);
					}
				}
			};
		},
		element : function(tagName, attributes, properties){
			var element = document.createElement(tagName);
			if (attributes instanceof Object) {
				PV.each(attributes, function(name, value){
					element.setAttribute(name, value);
				}, this);
			}
			if (properties instanceof Object) {
				PV.each(properties, function(name, value){
					element[name] = value;
				}, this);
			}
			return element;
		},
		block : function(elements){
			var items = {};
			var parent;
			var here = this;
			var main = {};
			var fragment = document.createDocumentFragment();
			PV.each(elements, function(name, options){
				items[name] = PV.Dom.element(options.tag, options.attributes, options.properties);
			}, this);
			PV.each(elements, function(name, options){
				var parent = fragment;
				if (typeof options.parent === 'string' && typeof items[options.parent] === 'object') {
					parent = items[options.parent];
				} else {
					main[name] = items[name];
				}
				parent.appendChild(items[name]);
			}, this);
			items.renderTo = function(node){
				node.appendChild(fragment);
				parent = node;
			};
			items.remove = function(){
				if (typeof parent === 'object'){
					PV.each(main, function(name, element){
						parent.removeChild(element);
					}, here);
				}
			};
			return items;
		}
	});
})(PV);