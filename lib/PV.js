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