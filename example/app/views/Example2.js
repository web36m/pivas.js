PV.declare('Example2', 'View', function(config){

	var self = this;
	var css = PV.Dom.css('app/templates/example2/style.css');
	var wrapper = document.getElementById('view1');

	var block = PV.Dom.block({
		container : {
			tag : 'div',
			attributes : {
				'class' : 'example2'
			}
		},
		title : {
			tag : 'h2',
			properties : {
				innerHTML : self.getText('title')
			},
			parent : 'container'
		},
		messages : {
			tag : 'ul',
			parent : 'container'
		},
		text : {
			tag : 'textarea',
			parent : 'container'
		},
		send : {
			tag : 'input',
			attributes : {
				type : 'button'
			},
			properties : {
				value : self.getText('send'),
				onclick: function(){
					self.events.trigger('send', block.text.value, self);
					block.text.value = '';
				}
			},
			parent : 'container'
		}
	});

	var onRender = function(){
		block.renderTo(wrapper);
	};

	this.events.on('message', function(text){
		block.messages.appendChild(PV.Dom.element('li', {}, {
			innerHTML : text
		}));
	});

	css.render(onRender, this);

	this.destroy = function(){
		onRender = null;
		css.remove();
		block.remove();
	};

});
