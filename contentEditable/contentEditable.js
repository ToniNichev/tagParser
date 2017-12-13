function contentEditable() {

	this.Object = null;
	this.ignoreNonAlpabeticKeys = true;

	/**
	 * @param jQuery object <Object>
	 * @param function <callFunction>
	 */
	this.init = function (Object, callFunction) {
		this.Object = Object;
		var self = this;

		this.Object.keydown(function(event) {
			if(event.keyCode == 9){

				event.preventDefault();
				var range = window.getSelection().getRangeAt(0);

				var tabNode = document.createTextNode("\u00a0\u00a0\u00a0\u00a0");
				range.insertNode(tabNode);

				range.setStartAfter(tabNode);
				range.setEndAfter(tabNode); 		        
				return;
			}else if(event.keyCode == 13){

				event.preventDefault();
				var range = window.getSelection().getRangeAt(0);

				var tabNode = document.createTextNode("\n");
				range.insertNode(tabNode);

				range.setStartAfter(tabNode);
				range.setEndAfter(tabNode); 		        
				return;
			}			
		});

		this.Object.keyup(function(event) {

			if(self.ignoreNonAlpabeticKeys) {
				if(event.keyCode == 9 || event.keyCode == 224 || event.keyCode == 13 || event.keyCode == 8 || event.keyCode==46 || (event.keyCode >= 37 && event.keyCode <= 40)) {
					// return if ctl, return, arrows, del, delete
					return;
				}
			}
		    var containerEl = self.Object[0];
		    var savedSel = self.saveSelection(containerEl);

		    callFunction();

		    self.restoreSelection(containerEl, savedSel);
		    return false;
		});
	}

	/**
	 * Helper function
	 * @param DOMObject containerEl
	 */

	this.saveSelection = function(containerEl) {
	    var charIndex = 0;
	    var start = 0;
	    var end = 0;
	    var foundStart = false
	    var stop = {};
	    var sel = window.getSelection();
	    var range;

	    function traverseTextNodes(node, range) {
	        if (node.nodeType == 3) {
	            if (!foundStart && node == range.startContainer) {
	                start = charIndex + range.startOffset;
	                foundStart = true;
	            }
	            if (foundStart && node == range.endContainer) {
	                end = charIndex + range.endOffset;
	                throw stop;
	            }
	            charIndex += node.length;
	        } else {
	            for (var i = 0, len = node.childNodes.length; i < len; ++i) {
	                traverseTextNodes(node.childNodes[i], range);
	            }
	        }
	    }

	    if (sel.rangeCount) {
	        try {
	            traverseTextNodes(containerEl, sel.getRangeAt(0));
	        } catch (ex) {
	            if (ex != stop) {
	                throw ex;
	            }
	        }
	    }

	    return {
	        start: start,
	        end: end
	    };
	}



	/**
	 *
	 */

	this.restoreSelection = function(containerEl, savedSel) {
	    var charIndex = 0, range = document.createRange(), foundStart = false, stop = {};
	    range.setStart(containerEl, 0);
	    range.collapse(true);

	    function traverseTextNodes(node) {
	        if (node.nodeType == 3) {
	            var nextCharIndex = charIndex + node.length;
	            if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
	                range.setStart(node, savedSel.start - charIndex);
	                foundStart = true;
	            }
	            if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
	                range.setEnd(node, savedSel.end - charIndex);
	                throw stop;
	            }
	            charIndex = nextCharIndex;
	        } else {
	            for (var i = 0, len = node.childNodes.length; i < len; ++i) {
	                traverseTextNodes(node.childNodes[i]);
	            }
	        }
	    }

	    try {
	        traverseTextNodes(containerEl);
	    } catch (ex) {
	        if (ex == stop) {
	            var sel = window.getSelection();
	            sel.removeAllRanges();
	            sel.addRange(range);
	        } else {
	            throw ex;
	        }
	    }
	}


}