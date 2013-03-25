PV.declare('Tree', 'View', function(){

	var wrapper = document.getElementById('tree');
	var block = PV.Template('tree.html');
	var css = PV.Dom.css('/app/templates/tree/style.css');
	var data;

	var makeTree = function(data, node){
		node.innerHTML = '';
		PV.each(data, function(i, item){
			var ul;
			var li = block.clone('item');
			var a = block.clone('name');
			a.innerHTML = item.name;
			li.appendChild(a);
			if ('nodes' in item){
				ul = block.clone('list');
				li.appendChild(ul);
				makeTree(item.nodes, ul);
			}
			node.appendChild(li);
		});
	};

	block.list.removeChild(block.item);
	block.item.removeChild(block.name);
	block.title.innerHTML = this.getText('title');

	try {
		data = JSON.parse(block.json.value);
	}catch(e){
		data = [];
	}
	makeTree(data, block.list);
	block.json.onchange = block.json.onkeyup = block.json.onmouseup = function(){
		try {
			data = JSON.parse(block.json.value);
		}catch(e){
			data = [];
		}
		makeTree(data, block.list);
	};
	
	css.render(function(){
		block.renderTo(wrapper);
	}, this);

	this.destroy = function(){
		block.remove();
	};

});