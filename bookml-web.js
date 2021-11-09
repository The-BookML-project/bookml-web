var BookML_DocumentOutput = function(){

	this.container;

	this.output = function(document, tree){
		this.container = document.createElement("section");
		this.container.setAttribute("class", "BOOKML_DocumentContainer");

		this.processBlock(tree, this.container);

		document.body.appendChild(this.container);
	}

	this.processBlock = function(block, parentElement) {

		if (! block.isBlock){
			parentElement.appendChild(block);
			return;
		}

		var blockContainer = document.createElement("div");
		blockContainer.setAttribute("class", "block level-" + block.level);

		var childrenContainer = document.createElement("div");
		childrenContainer.setAttribute("class", "blockContent level-" + block.level);		

		if (block.titleElement) {
			block.titleElement.classList.add("heading");
			block.titleElement.classList.add("heading-" + block.level);
			blockContainer.appendChild(block.titleElement);	
		}
		
		blockContainer.appendChild(childrenContainer);

		for (var i = 0; i < block.children.length; i++) {
			this.processBlock(block.children[i], childrenContainer);
		}

		parentElement.appendChild(blockContainer);

	}
}



var BookML_TableOfContentOutput = function(){
	this.container;
	this.titleCounter = 0;
	this.maxLevel = 3;

	this.output = function(document, tree){
		this.container = document.createElement("ul");
		this.container.setAttribute("class", "BOOKML_TableOfContentContainer");

		this.processBlock(tree, this.container);

		document.body.appendChild(this.container);
	}

	

	this.generateId = function(block){
		return this.titleCounter ++;
	}

	this.processBlock = function(block, parentElement) {

		if (! block.isBlock){
			return;
		}

		if (block.level > this.maxLevel) {
			return;
		}

		if (! block.titleElement && block.children.length > 0){
			for (var i = 0; i < block.children.length; i++) {
				this.processBlock(block.children[i], parentElement);
			}
			return;
		}

		var entry = document.createElement("li");
		entry.setAttribute("class", "entry level-" + block.level);
		
		if (block.titleElement){
			var title = document.createElement("a");
			title.innerText = block.titleElement.innerText; //@todo clean label	
			
			if (! block.titleElement.id) {
				block.titleElement.id = this.generateId(block);
			}

			title.setAttribute("href", "#" + block.titleElement.id);
			entry.appendChild(title);
		}
		
		parentElement.appendChild(entry);

		if (block.children.length == 0){
			return;
		}

		var childrenContainer = document.createElement("ul");
		childrenContainer.setAttribute("class", " level-" + block.level);		
		entry.appendChild(childrenContainer);

		for (var i = 0; i < block.children.length; i++) {
			this.processBlock(block.children[i], childrenContainer);
		}

		

	}

	
}

var BookML = function(){
	
	this.tree = null;
	this.currentBlock = null;

	this.run = function(){
		console.log("Running pre-processor...");


		var elements = document.querySelectorAll("body > *");

		this.tree = this.makeBlock(null, 0);		
		this.currentBlock = this.tree;

		for (var i = 0; i < elements.length; i++) {
			this.processElement(elements[i]); 
		}

		this.output(new BookML_TableOfContentOutput());
		this.output(new BookML_DocumentOutput());
		

	}

	this.output = function(outputStrategy){
		outputStrategy.output(document, this.tree);
	}

	this.processElement = function(element) {
		var level = this.headingLevel(element);
		var currentLevel = this.currentBlock ? this.currentBlock.level : 0;

		if (! level) {
			this.appendContentElement(element);
			return;
		}

		if (level > currentLevel) {
			this.appendChildBlockTitle(element, level);
			return;
		}

		if (level <= currentLevel) {
			this.appendNextBlockTitle(element, level);
			return;
		}
	}

	this.makeBlock = function(element, level){
		return {
			'isBlock': true,
			'level': level,
			'titleElement': element,
			'parent': null,
			'children': [],
		};
	}

	this.headingLevel = function(element){
		var headingValue = element.tagName.match(/h(\d)/i);

		if (! headingValue) {
			return 0;
		}

		console.log(element.tagName +  " -> Heading level " + headingValue[1]);
		return headingValue[1];
	}



	
	this.appendContentElement = function(element) {
		console.log("Current element is not heading, appending " + element.tagName + " " + element.innerText);

		if (! this.currentBlock) {
			throw "No parent block defined. Start the document with a heading.";
		}

		this.currentBlock.children.push(element);
	}

	this.appendChildBlockTitle = function(element, level) {
		console.log("Append as child block");
		
		var block = this.makeBlock(element, level);
		
		this.addChildBlock(block, this.currentBlock);

		this.currentBlock = block;


	}

	this.addChildBlock = function(block, parent) {
		if (! parent) {
			return;
		}

		parent.children.push(block);
		block.parent = this.currentBlock;

		return block;
	}

	this.appendNextBlockTitle = function(element, level) {
		console.log("Append as next block of level " + level);

		var parent = this.findParentForLevel(level);
		var block = this.makeBlock(element, level);



		this.addChildBlock(block, parent);

		this.currentBlock = block;

	}

	this.findParentForLevel = function(level) {
		if (! this.currentBlock) {
			throw "Nope. WTF?";
		}

		var parent = this.currentBlock;

		while(parent) {
			var parentLevel = parent.level;

			if (parentLevel <= level -1) {
				return parent;
			}

			parent = parent.parent;
		}

		return null;

		

	}

}

document.addEventListener("DOMContentLoaded", function(){
	var bookml = new BookML();
	bookml.run();	
})

