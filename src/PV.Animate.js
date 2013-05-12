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
