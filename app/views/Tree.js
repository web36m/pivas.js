PV.declare('Tree', 'View', function(){

	var wrapper = document.getElementById('tree');
	var css = PV.Dom.css('/app/templates/tree/style.css');
	var data, tpl;
	var self = this;

	var makeTree = function(data, node){
		node.innerHTML = '';
		PV.each(data, function(i, item){
			var ul;
			var li = tpl.clone('item');
			var a = tpl.clone('name');
			a.innerHTML = item.name;
			li.appendChild(a);
			if ('nodes' in item){
				ul = tpl.clone('list');
				li.appendChild(ul);
				makeTree(item.nodes, ul);
			}
			node.appendChild(li);
		});
	};

	var isReady = function(key){
		var i, j;
		if (key in isReady.queue){
			delete isReady.queue[key];
			for (i in isReady.queue){
				return;
			}
			isReady.onready instanceof Function && isReady.onready.call(self);
		}
	};

	isReady.queue = {
		css : true
	};

	isReady.onready = function(){
		tpl.renderTo(wrapper);
	};

	tpl = PV.Template(document.getElementById('tree.html').innerHTML);
	tpl.list.removeChild(tpl.item);
	tpl.item.removeChild(tpl.name);
	tpl.title.innerHTML = self.getText('title');
	try {
		data = JSON.parse(tpl.json.value);
	}catch(e){
		data = [];
	}
	makeTree(data, tpl.list);
	tpl.json.onchange = tpl.json.onkeyup = tpl.json.onmouseup = function(){
		try {
			data = JSON.parse(tpl.json.value);
		}catch(e){
			data = [];
		}
		makeTree(data, tpl.list);
	};

	css.render(function(){
		isReady('css');
	}, this);

	this.destroy = function(){
		this.remove();
	};

});