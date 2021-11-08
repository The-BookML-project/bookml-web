var BookML = function(){
	
	this.tableOfContent;
	this.outputDocument;

	this.currentBlock;
	this.currentLevel;

	this.run = function(){
		console.log("Running pre-processor...");
		this.currentLevel = 0;
		this.outputDocument = this.createBlock(this.currentLevel, "OUTPUT");
		this.currentBlock = this.outputDocument;
		
		this.tableOfContent = [];

		var elements = document.querySelectorAll("body > *");
		
		for (var i = 0; i < elements.length; i++) {
			this.processElement(elements[i]); 
		}
		
		document.body.appendChild(this.generateTableOfContent());
		document.body.appendChild(this.outputDocument);
	}

	this.generateTableOfContent = function() {
		var container = document.createElement("ul");
		container.setAttribute("class", "toc");

		for (var i = 0; i < this.tableOfContent.length; i++) {
			var entry = this.tableOfContent[i];

			var item = document.createElement("li");
			var itemA = document.createElement("a");

			itemA.innerText = entry.label;
			itemA.setAttribute('href', "#" + entry.target.id);
			itemA.setAttribute('class', "toc-item level-" + entry.level);

			item.appendChild(itemA);
			container.appendChild(item);
		}

		return container;
	}

	this.processElement = function(element) {
		var level = this.headingLevel(element);

		console.log("Title level " + level + " vs " + this.currentLevel, element);

		if (! level) {
			this.appendSibbling(element);
			return;
		}

		this.addToTableOfContent(element, level);

		if (level > this.currentLevel) {
			this.appendChildBlockTitle(element, level);
			return;
		}

		if (level <= this.currentLevel) {
			this.appendNextBlockTitle(element, level);
			return;
		}
	}

	this.headingLevel = function(element){
		var headingValue = element.tagName.match(/h(\d)/i);

		if (! headingValue) {
			return 0;
		}

		console.log(element.tagName +  " -> " + headingValue[1]);
		return headingValue[1];
	}

	this.createBlock = function(level, id){
		var block = document.createElement("div");
		if (id) block.id = id;

		block.setAttribute("class", "block level-" + level);
		block.setAttribute("data-bookml-level", level);
		return block;
	}

	this.appendSibbling = function(element) {
		console.log("Current element is not heading, appending.");
		this.currentBlock.appendChild(element);
	}

	this.appendChildBlockTitle = function(element, level) {
		console.log("Append as child block");
		
		var subElement = this.createBlock(level);
		this.currentBlock.appendChild(subElement);
		this.currentBlock = subElement;

		this.currentBlock.appendChild(element);
		this.currentLevel = level;

	}

	this.appendNextBlockTitle = function(element, level) {
		console.log("Append as next block of level " + level);

		
		var parent = this.findParentForLevel(level);

		var nextElement = this.createBlock(level);
		parent.appendChild(nextElement);
		this.currentBlock = nextElement;
		this.currentBlock.appendChild(element);
		this.currentLevel = level;
	}

	this.findParentForLevel = function(level) {
		var parent = this.currentBlock.parentNode ? this.currentBlock.parentNode : this.currentBlock;

		while(parent) {
			var parentLevel = parent.getAttribute("data-bookml-level");
			console.log("Parent for level " + parentLevel);
			if (parentLevel <= level -1) {
				return parent;
			}

			parent = parent.parentNode;
		}

		return null;

		

	}

	this.addToTableOfContent = function(element, level) {
		this.tableOfContent.push({
			'level': level,
			'target': element,
			'label': element.innerHTML
		});
	}
}

var bookml = new BookML();
bookml.run();