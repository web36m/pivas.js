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