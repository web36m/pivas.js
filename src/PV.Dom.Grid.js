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