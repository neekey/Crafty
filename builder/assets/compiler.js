/**
* Block of Crafty code
*
* @param open String of code before children
* @param close String of code after children
* @param name Name of the block (instance name, scene name, asset name, component name)
* @param action Snippet of code related to the block. [this] is replaced with object in question
*/
function Block(open, close, name) {
	this.open = open || "";
	this.close = close || "";
	this.name = name || "";
	this.children = [];
}

Block.prototype = {
	parent: null,
	
	append: function(block) {
		block.parent = this;
		this.children.push(block);
		
		return block;
	},
	
	remove: function(block) {
		var i = 0, l = this.children.length;
		for(;i<l;++i) {
			if(this.children[i] === block) {
				this.children.splice(i,1);
				return;
			}
		}
	},
	
	move: function(block, to) {
		this.remove(block);
		to.append(block);
	},
	
	isRoot: function() {
		return this.parent === null;
	},
	
	hasChildren: function() {
		return this.children.length > 0;
	},
	
	toString: function() {
		var output = "", i = 0, l = this.children.length,
			current;
		
		output += this.open;
		for(;i<l;++i) {
			current = this.children[i];
			output += current.toString();
		}
		output += this.close;
		
		return output;
	}
};

function EntBlock(open, close, name) {
	this.open = open || "";
	this.close = close || "";
	this.name = name || "";
	this.children = [];
}

EntBlock.prototype = new Block;
EntBlock.prototype.actions = "";
EntBlock.prototype.comps = "";
EntBlock.prototype.props = "";
EntBlock.prototype.toString = function() {
	var output = "", i = 0, l = this.children.length,
		current;
	
	output += this.open;
	for(;i<l;++i) {
		current = this.children[i];
		output += current.toString();
	}
	output += this.close + "\n(function() { this.attr(" + this.props + ");\n" + this.actions + " }).call(" + this.name + ");\n";
	
	return output;
};

function LoaderBlock(open, close) {
	this.open = open || "";
	this.close = close || "";
}

LoaderBlock.prototype = new Block;
LoaderBlock.prototype.assets = [];
LoaderBlock.prototype.oncomplete = "";
LoaderBlock.prototype.onprogress = "";
LoaderBlock.prototype.onerror = "";
LoaderBlock.prototype.toString = function() {
	var output = "";
	
	output += this.open;
	
	if(this.assets.length) output += '["' + this.assets.join('","') + '"]';
	else output += '[]';
	
	if(this.oncomplete) output += ',' + this.oncomplete;
	if(this.onprogress) output += ',' + this.onprogress;
	if(this.onerror) output += ',' + this.onerror;
	output += this.close;
	
	return output;
};

var CODE = new Block("window.onload = function() {", "};"),
	HEAD = CODE.append(new Block("Crafty.init(550,440);")),
	MAIN = CODE.append(new Block("Crafty.scene(\"main\", function() {", "});", "main")),
	LOADER = CODE.append(new LoaderBlock("Crafty.load(", ");"));

CURRENT_SCENE = MAIN;

/**
* TODO
*
* //wysiwyg
* Add all entities on the stage as DOM elements
* Drag and drop updates its props
* Context menu to copy/cut/paste/delete and properties
* Snap to grid
* 
* //Saving
* Save all objects into JSON
* Load all JSON into object
*/

Crafty.c("_GUI", {
	_GUI: function() {
		this.requires("DOM");
		
		var self = this;
		function drag(e) {
			self.x = (e.clientX - Crafty.stage.x) - self._startX;
			self.y = (e.clientY - Crafty.stage.y) - self._startY;
			self.draw();
		}
				
		$(this._element).mousedown(function(e) {
			self._startX = (e.clientX - Crafty.stage.x) - self._x;
			self._startY = (e.clientY - Crafty.stage.y) - self._y;
			$workarea.mousemove(drag);
		});
		
		$workarea.mouseup(function() {
			$workarea.unbind("mousemove", drag);
		});
	},
	
	_startX: 0,
	_startY: 0,
	
	comps: function(complist) {
		var comps = complist.split(/\s*,\s*/),
			i = 0, l = comps.length;
		
		for(;i<l;++i) {
			if(comps[i] === "Canvas") continue;
			this.addComponent(comps[i]);
		}
		
		this._GUI();
		return this;
	}
});

