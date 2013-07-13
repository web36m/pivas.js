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