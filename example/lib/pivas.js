/*!
* pivas v1.0.2
* http://pivas.net/
*
* JavaScript framework for scalable web applications. Focuses on a full asynchronous web applications: Social networks, Online games, Online services, Etc...
*
* Copyright 2012, 2013 Shilov Vasily (vasily@pivas.net)
* Released under the MIT license
* https://github.com/pivas/pivas.js/blob/master/LICENSE
*
* Date: Sun Jul 14 2013 02:19:10 GMT+0400 (MSK)
*/

var PV = PV || {};

(function(){
	var global = this;
	var defaults = {
		lang :			'en',
		descriptors	:	'/app/descriptors',
		locales :		'/app/locales',
		modules :		'/app/modules',
		templates :		'/app/templates',
		views :			'/app/views'
	};

	PV.namespace = function(){
		var i = 0,
		j, parts, chunk;
		for (; i < arguments.length; i++){
			parts = arguments[i].split('.');
			chunk = global;
			for (j in parts){
				chunk[parts[j]] = chunk[parts[j]] || {};
				chunk = chunk[parts[j]];
			}
		}
	};

	PV.extend = function(){
		var i = 1,
		key;
		if (typeof arguments[0] === 'object'){
			for (; i < arguments.length; i++){
				if (typeof arguments[i] === 'object'){
					for (key in arguments[i]){
						if (!arguments[0][key]){
							arguments[0][key] = arguments[i][key];
						}
					}
				}
			}
		}
		return arguments[0];
	};

	PV.define = function(name, value){
		var i,
		parts = name.split('.'),
		final_part = parts.pop(),
		chunk = global;
		for (i in parts){
			chunk[parts[i]] = chunk[parts[i]] || {};
			chunk = chunk[parts[i]];
		}
		chunk[final_part] = value;
	};

	PV.require = function(url, callback, context){
		var head, script;
		head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
		script = document.createElement('script');
		script.type = 'text/javascript';
		script.async = 'async';
		script.src = url;
		head.appendChild(script);
		script.onload = script.onreadystatechange = function(){
			script.onload = script.onreadystatechange = null;
			head.removeChild(script);
			script = undefined;
			if (!arguments[1]){
				callback.call(context || global);
			}
		};
	};

	PV.multiload = function(urls, callback, context){
		var i, redystate = 0,
		isReady = function(){
			redystate--;
			if (!redystate && callback instanceof Function){
				callback.call(context || global);
			}
		};
		for (i = 0; i < urls.length; i++){
			redystate++;			
			PV.require(urls[i]+(urls[i].match(/\?/) ? '&' : '?')+'v='+PV.config.version, function(){
				isReady();
			});
		}
	};

	PV.each = function(obj, callback, context){
		var i;
		if (typeof obj !== 'object'){
			return;
		}
		callback = callback instanceof Function ? callback : function(){};
		context = context || this;
		for (i in obj){
			callback.call(context, i, obj[i]);
		}
	};

	PV.Storage = function(){
		var list = {};
		this.append = function(name, value){
			list[name] = value;
			return true;
		};
		this.get = function(name){
			return list[name] || false;
		};
		this.remove = function(name){
			if (name in list){
				delete list[name];
			}
			return true;
		};
	};

	PV.Locale = function(locale){
		var lang = PV.config.lang;
		this.getText = function(text){
			return locale[lang] && locale[lang][text] ? locale[lang][text] : text;
		};
	};

	PV.Events = function(){
		var events = {};
		this.on = function(event, handler){
			var exists = false;
			if (!events[event]){
				events[event] = [];
			}
			PV.each(events[event], function(i, _handler){
				if (handler === _handler){
					exists = true;
				}
			}, this);
			if (!exists){
				events[event].push(handler);
			}
		};
		this.trigger = function(event, data, context){
			if (events[event] instanceof Array){
				context = context || this;
				PV.each(events[event], function(i, handler){
					handler.call(context, data);
				}, context);
			}
		};
		this.unscribe = function(event, handler){
			if (events[event] instanceof Array){
				PV.each(events[event], function(i, _handler){
					if (_handler===handler){
						events[event].splice(i, 1);
					}
				}, this);
			}
		};
	};

	PV.Provider = new function(){
		var handlers = {
			'import' : {},
			'export' : {}
		};
		this.register = function(args){
			var _import = args['import'] && args['import'] instanceof Array ? args['import'] : [];
			var _export = args['export'] && args['export'] instanceof Array ? args['export'] : [];
			PV.each(_import, function(i, item){
				if (!handlers['import'][item]){
					handlers['import'][item] = {};
				}
				if (!handlers['import'][item][args.name]){
					handlers['import'][item][args.name] = true;
				}
			}, this);
			PV.each(_export, function(i, item){
				if (!handlers['export'][item]){
					handlers['export'][item] = {};
				}
				if (!handlers['export'][item][args.name]){
					handlers['export'][item][args.name] = true;
				}
			}, this);
		};
		this.unregister = function(moduleName){
			PV.each(handlers['export'], function(method, modules){
				if (modules[moduleName]){
					delete modules[moduleName];
				}
			}, this);
			PV.each(handlers['import'], function(method, modules){
				if (modules[moduleName]){
					delete modules[moduleName];
				}
			}, this);
		};
		this.deliver = function(source, method, args, context){
			context = context || global;
			if (((handlers['import'][method] && handlers['import'][method][source])
			|| (handlers['import']['*'] && handlers['import']['*'][source]))
			&& handlers['export'][method]){
				PV.each(handlers['export'][method], function(moduleName){
					var module = PV.Modules.Running.get(moduleName);
					if (module){
						module.callMethod(method, args, source, context);
					}
				}, this);
			}
		};
	};

	PV.Sandbox = function(environment, args){
		var locale, module, view,
			here = this,
			config = environment.config || {};
		args = typeof args === 'object' ? args : {};
		if (!environment.module){
			throw new Error('Module not found');
		}
		if (environment.locale){
			locale = new PV.Locale(environment.locale);
		}
		if (environment.view){
			environment.view.prototype = {
				getText : function(text){
					return locale ? locale.getText(text) : '';
				},
				events : new PV.Events
			};
			view = new environment.view(config);
			if (typeof view.destroy !== 'function'){
				throw new Error('Not found method "destroy" in view');
			}
		}
		environment.module.prototype = {
			view : view,
			getText : function(text){
				return locale ? locale.getText(text) : '';
			},
			emit : function(event, data){
				PV.Provider.deliver(environment.name, event, data, this);
			},
			suicide : function(){
				here.destroy.call(here);
			},
			events : new PV.Events
		};
		module = new environment.module(config, args);
		if (typeof module.destroy !== 'function'){
			throw new Error('Not found method "destroy" in module');
		}
		if (typeof module.init !== 'function'){
			throw new Error('Not found method "init" in module');
		}
		this.callMethod = function(method, data, source, context){
			context = context || module;
			if (module[method] instanceof Function){
				module[method].apply(context, [data, source]);
			}
		};
		this.destroy = function(){
			module.destroy();
			if (view && view.destroy instanceof Function){
				view.destroy();
			}
			PV.Provider.unregister(environment.name);
			PV.Modules.Running.remove(environment.name);
		};
		module.init();
	};

	PV.each([
		'PV.Descriptors.Storage',
		'PV.Locales.Storage',
		'PV.Modules.Storage',
		'PV.Views.Storage',
		'PV.Modules.Running'
	], function(i, name){
		PV.define(name, new PV.Storage());
	}, global);

	PV.loaderFactory = function(name, storage, callback, cache){
		cache = cache!==false;
		if (cache && PV[storage].Storage.get(name)){
			callback.call(global);
		} else {
			PV.require(PV.config[storage.toLowerCase()]+'/'+name+'.js?'+(cache ? 'v='+PV.config.version : 'r='+Math.random()), function(){
				if (PV[storage].Storage.get(name)){
					callback.call(global);
				}
			});
		}
	};

	PV.factoryModule = function(name, args){
		if (PV.Modules.Running.get(name)){
			return false;
		}
		PV.loaderFactory(name, 'Descriptors', function(){
			var descriptor = PV.Descriptors.Storage.get(name);
			var environment = {
				name : name
			};
			var readyState = 0;
			var entity = {
				module :	'Modules',
				locale :	'Locales',
				view :		'Views'
			};
			var onReady = function(){
				PV.Provider.register({
					name : name,
					'import' : environment['import'] || [],
					'export' : environment['export'] || []
				});
				PV.Modules.Running.append(name, new PV.Sandbox(environment, args));
			};
			var checkReadyState = function(){
				readyState--;
				if (!readyState){
					onReady();
				}
			};
			if (descriptor){
				PV.each(['export', 'import', 'config'], function(i, attribute){
					if (typeof descriptor[attribute] !== 'undefined'){
						environment[attribute] = descriptor[attribute];
					}
				}, this);
				PV.each(entity, function(attribute, storage){
					if (typeof descriptor[attribute] === 'string'){
						readyState++;
					}
				}, this);
				PV.each(entity, function(attribute, storage){
					if (typeof descriptor[attribute] === 'string'){
						PV.loaderFactory(descriptor[attribute], storage, function(){
							var data = PV[storage].Storage.get(descriptor[attribute]);
							if (data){
								environment[attribute] = data;
								checkReadyState();
							}
						});
					}
				}, this);
			}
		}, false);
		return true;
	};

	PV.declare = function(name, entity, data){
		PV[entity+'s'].Storage.append(name, data);
	};

	PV.init = function(config){
		var onReady, preloadReady = true;
		PV.namespace('PV.config');
		PV.extend(PV.config, config, defaults);
		if (PV.config.preload instanceof Array){
			preloadReady = false;
			PV.multiload(PV.config.preload, function(){
				preloadReady = true;
				if (onReady instanceof Function){
					onReady.call(global);
				}
			});
		}
		PV.define('PV.ready', function(callback){
			if (preloadReady){
				callback.call(global);
			}else{
				onReady = callback;
			}
		});
	};

})();
PV.define('PV.Animate', function(settings){
	var self = this;
	var progress = 0;
	var FPS = 50;
	var interval = Math.ceil(1000/FPS);
	var steps = Math.floor(settings.time*FPS/1000);
	var delta = 1/steps;
	var setInt;
	if (settings.time && typeof settings.effect === 'function'){
		setInt = setInterval(function(){
			settings.effect.call(self, progress.toFixed(3));
			progress += delta;
			if (progress>=1){
				settings.effect.call(self, 1);
				typeof settings.callback === 'function' && settings.callback.call(self);
				clearInterval(setInt);
			}
			
		}, interval);
	}
});
PV.namespace('PV.Animate.effects');
PV.extend(PV.Animate.effects, {
	bounce : function(){
		var delta = function(progress) {
			for (var a = 0, b = 1, result; 1; a += b, b /= 2) {
				if (progress >= (7 - 4 * a) / 11) {
					return -Math.pow((11 - 6 * a - 11 * progress) / 4, 2) + Math.pow(b, 2);
				}
			}
		};
		var makeEaseOut = function(delta){
			return function(progress) {
				return 1 - delta(1 - progress);
			};
		};
		return makeEaseOut(delta);
	}
});

PV.namespace('PV.Cookie');
PV.extend(PV.Cookie, {
	set : function(name, value, expdays, path, domain, secure){
		var cookie_string, expdate;
		cookie_string = name + '=' + escape(value);
		if (expdays){
			expdate = new Date();
			expdate.setTime(expdate.getTime() + expdays*24*60*60*1000);
			cookie_string += '; expires=' + expdate.toGMTString();
		}
		if (path){
			cookie_string += '; path=' + escape(path);
		}
		if (domain){
			cookie_string += '; domain=' + escape(domain);
		}
		if (secure){
			cookie_string += '; secure';
		}
		document.cookie = cookie_string;
	},
	get : function(name){
		var results = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
		if (results){
			return unescape(results[2]);
		}
		return null;
	},
	remove : function(name){
		var expdate = new Date();
		expdate.setTime(expdate.getTime() - 1);
		document.cookie = name + '=; expires=' + expdate.toGMTString();
	}
});
(function(PV){
	var global = this;
	PV.namespace('PV.Dom');
	PV.extend(PV.Dom, {
		Grid : function(settings){
			var self = this, callback, dom, rendered = false, cache = {}, allow = true, structure = {}, head = {};
			var create = function(data){
				var node, structure = {
					item : {
						tag : 'li',
						properties : {
							onclick : function(){
								self.update(cache, true);
								callback instanceof Function && callback.call(self, data[settings.index]);
							}
						}
					}
				};
				PV.each(settings.columns, function(name, options){
					structure[name+'_'] = {
						tag : 'span',
						attributes : {
							style : 'width: '+options.width+';'
						},
						properties : {
							innerHTML : data[name]
						},
						parent : 'item'
					};
				});
				node = PV.Dom.block(structure);
				return node.item;
			};
			PV.each(settings.columns, function(i, item){
				head[i] = {
					tag : 'span',
					attributes : {
						style : 'width: '+item.width+';'
					},
					properties : {
						innerHTML : item.title
					},
					parent : 'head'
				};
			});
			dom = PV.Dom.block(PV.extend({
				grid : {
					tag : 'ul',
					properties : {

					}
				},
				head : {
					tag : 'li',
					attributes : {
						'class' : 'grid-head'
					},
					parent : 'grid'
				}
			}, head));
			dom.grid.onmouseover = function(){
				var _onblur = global.onblur;
				allow = false;
				global.onblur = dom.grid.onmouseout = function(){
					allow = true;
					global.onblur = _onblur;
				};
			};
			this.update = function(data, flag){
				var new_structure = {};
				if (flag || allow === true){
					PV.each(data, function(i,item){
						if (structure[item[settings.index]]){
							new_structure[item[settings.index]] = structure[item[settings.index]];
						} else {
							new_structure[item[settings.index]] = create(item);
						}
					});
					PV.each(structure, function(i,v){
						dom.grid.removeChild(v);
					});
					structure = new_structure;
					PV.each(structure, function(i,v){
						dom.grid.appendChild(v);
					});
				}
				if (!flag){
					cache = data;
				}
				return self;
			};
			this.click = function(onclick){
				callback = onclick;
				return self;
			};
			this.allow = function(){
				allow = true;
			};
			this.renderTo = function(parent){
				if (!rendered){
					dom.renderTo(parent);
				}
				return self;
			};
			this.remove = function(parent){
				if (rendered){
					dom.remove();
				}
				return self;
			};
		}
	});
})(PV);
(function(PV){
	var global = this;
	PV.namespace('PV.Dom');
	PV.extend(PV.Dom, {
		Slider : function(options){
			var dom, callback, self = this, rendered = false, structure = {};
			var section = (100/(options.length-1)).toFixed(2);
			structure.area = {
				tag : 'div',
				attributes : {
					'class' : 'slider-area'
				}
			};
			structure.runner = {
				tag : 'div',
				attributes : {
					'class' : 'slider-runner'
				}
			};
			PV.each(options, function(i,item){
				structure['section'+item] = {
					tag : 'div',
					attributes : {
						'class' : 'slider-section',
						style : 'left: '+(i*section)+'%'
					},
					properties : {
						innerHTML : '<label>'+item+'</label>'
					},
					transform : i*section
				};
			}, this);
			var getPercent = function(em, left, width){
				var em_left = Math.round((em.clientX-left)/width*100);
				return em_left < 0 ? 0 : (em_left > 100 ? 100 : em_left);
			};
			var getNearest = function(percent){
				return options[Math.round(percent/section)];
			};
			dom = PV.Dom.block(structure);
			this.renderTo = function(parent){
				if (!rendered){
					dom.renderTo(parent);
					parent.onmousedown = parent.ontouchstart = function(e){
						var _onmousemove = global.onmousemove,
						_onblur = global.onblur,
						_onmouseup = global.onmouseup,
						_ontouchmove = global.ontouchmove,
						_ontouchend = global.ontouchend,
						_ontouchclose = global.ontouchclose;
						if (e.touches){
							e.clientX = e.touches[0].clientX;
						}
						var width = parent.offsetWidth;
						var target = parent;
						var left = 0;
						while(target){
							left = left + parseInt(target.offsetLeft);
							target = target.offsetParent;
						}
						dom.runner.style.left = ''+getPercent(e, left, width)+'%';
						global.onmousemove = global.ontouchmove = function(em){
							if (em.touches){
								em.clientX = em.touches[0].clientX;
							}
							dom.runner.style.left = ''+getPercent(em, left, width)+'%';
						};
						global.onblur = global.onmouseup = function(em){
							var percent = getPercent(em, left, width);
							var value = getNearest(percent);
							dom.runner.style.left = ''+getPercent(em, left, width)+'%';
							parent.onmousemove = function(){};
							self.set(value);
							callback instanceof Function && callback.call(self, value);
							global.onmousemove = _onmousemove;
							global.onblur = _onblur;
							global.onmouseup = _onmouseup;
							global.ontouchmove = _ontouchmove;
							global.ontouchend = _ontouchend;
							global.ontouchclose = _ontouchclose;
						}
						e.preventDefault();
						e.stopPropagation();
					};
					rendered = true;
				}
				return self;
			};
			this.remove = function(parent){
				if (rendered){
					dom.remove();
				}
				return self;
			};
			this.change = function(onchange){
				callback = onchange;
				return self;
			};
			this.set = function(value){
				structure['section'+value] && (dom.runner.style.left = ''+structure['section'+value].transform+'%');
				return self;
			};
		}
	});
})(PV);
PV.namespace('PV.Dom');
PV.extend(PV.Dom, {
	Switch : function(options){
		var dom, callback, self = this, rendered = false, structure = {};
		PV.each(options, function(i,item){
			structure['option'+i] = {
				tag : 'li',
				properties : {
					innerHTML : item,
					onclick : function(){
						self.select(i);
						callback instanceof Function && callback.call(self, i);
					},
					onmousedown : function(e){
						e.preventDefault();
						e.stopPropagation();
					}
				}
			};
		}, this);
		dom = PV.Dom.block(structure);
		this.renderTo = function(parent){
			if (!rendered){
				dom.renderTo(parent);
				rendered = true;
			}
		};
		this.remove = function(parent){
			if (rendered){
				dom.remove();
			}
		};
		this.reset = function(){
			PV.each(options, function(i){
				dom['option'+i].removeAttribute('class');
			}, self);
		};
		this.select = function(num){
			if (dom['option'+num]){
				self.reset();
				dom['option'+num].setAttribute('class','active');
			}
		};
		this.click = function(onclick){
			callback = onclick;
		};
	}
});
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
(function(PV){
	var global = this;
	PV.define('PV.Drag', function(block, drag, parent, step, opacity){
		var coords = {};
		var position = {};
		var opacityStart;
		var move = function(e){
			var deltaX = e.clientX - coords.x;
			var deltaY = e.clientY - coords.y;
			block.style.left = (position.x+deltaX)+'px';
			block.style.top = (position.y+deltaY)+'px';
		};
		parent = parent || document.body || document.getElementsByTagName('body')[0];
		step = step || 3;
		opacity = opacity ? parseFloat(opacity) : 1;
		drag.onmousedown = function(e){
			var count = 0;
			coords.x = e.clientX;
			coords.y = e.clientY;
			position.x = block.offsetLeft;
			position.y = block.offsetTop;
			opacityStart = block.style.opacity ? parseFloat(block.style.opacity) : 1;
			block.style.opacity = opacity;
			parent.style.cursor = 'move';
			global.onmousemove = function(e){
				count++;
				if (count>=step){
					count = 0;
					move(e);
				}
				e.preventDefault();
				e.stopPropagation();
			};
			global.onblur = global.onmouseup = function(){
				parent.style.cursor = 'auto';
				global.onmousemove = global.onblur = global.onmouseup = null;
				block.style.opacity = opacityStart;
				e.preventDefault();
				e.stopPropagation();
			};
			e.preventDefault();
			e.stopPropagation();
		};
	});
})(PV);
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
(function(PV){
	var global = this;
	PV.namespace('PV.Language');
	PV.extend(PV.Language, {
		identify : function(){
			var prelang, langHash = {};
			var cookieLanguage = PV.Cookie.get('language');
			if (cookieLanguage) {
				prelang = cookieLanguage.split('-')[0];
			} else {
				var browserLanguage = !!global.navigator && (global.navigator.language || global.navigator.browserLanguage);
				if (browserLanguage) {
					prelang = browserLanguage.split('-')[0];
				}
			}
			PV.each(PV.config.languages, function(i, lang){
				langHash[lang] = i;
			});
			if (prelang in langHash){
				PV.config.lang = prelang;
			}else if (PV.config.languages[0]){
				PV.config.lang = PV.config.languages[0];
			}
		},
		set : function(lang){
			PV.Cookie.set('language', lang, 30);
			window.location.reload();
		},
		get : function(){
			return PV.config.lang;
		}
	});
})(PV);
(function(PV){
	var global = this;
	PV.define('PV.Resize', function(block, resizer, resizeble, parent, step, opacity, callback){
		var coords = {};
		var size = {};
		var opacityStart;
		var resize = function(e){
			var deltaX = e.clientX - coords.x;
			var deltaY = e.clientY - coords.y;
			resizeble.style.width = (size.x+deltaX)+'px';
			resizeble.style.height = (size.y+deltaY)+'px';
			callback instanceof Function && callback.call(global, size.x+deltaX, size.y+deltaY);
		};
		parent = parent || document.body || document.getElementsByTagName('body')[0];
		step = step || 3;
		opacity = opacity ? parseFloat(opacity) : 1;
		resizer.onmousedown = function(e){
			var count = 0;
			coords.x = e.clientX;
			coords.y = e.clientY;
			size.x = resizeble.clientWidth;
			size.y = resizeble.clientHeight;
			opacityStart = block.style.opacity ? parseFloat(block.style.opacity) : 1;
			block.style.opacity = opacity;
			parent.style.cursor = 'se-resize';
			global.onmousemove = function(e){
				count++;
				if (count>=step){
					count = 0;
					resize(e);
				}
				e.preventDefault();
				e.stopPropagation();
			};
			global.onblur = global.onmouseup = function(){
				parent.style.cursor = 'auto';
				global.onmousemove = global.onblur = global.onmouseup = null;
				block.style.opacity = opacityStart;
				e.preventDefault();
				e.stopPropagation();
			};
			e.preventDefault();
			e.stopPropagation();
		};
	});
})(PV);
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