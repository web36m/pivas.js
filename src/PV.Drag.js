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