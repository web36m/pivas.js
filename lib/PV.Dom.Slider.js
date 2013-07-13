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