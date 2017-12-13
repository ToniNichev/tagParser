function TagParser(cfg) {
	let _cfg = cfg;
	
	function findFirstTag(dataHTML) {
		i = dataHTML.indexOf(_cfg.openTag);
		if(i == -1) {
			// there is no tag here
			return -1;
		}
		i = i + _cfg.openTag.length;
		temp = dataHTML.slice(i, dataHTML.length);

		// find closing of the tagName
		i = temp.indexOf(_cfg.closeTag);
		temp = temp.slice(0, i);

		if(temp.indexOf('$$') == 0) {
			// this is $$
			tagName = '$$';
		}
		else {
			// or regular tag
			i = temp.indexOf(' ');
			if(i!=-1)
				tagName = temp.slice(0, i);
			else
				tagName = temp;
		}

		var result = parseTag(dataHTML, tagName);
		return {tagName:tagName, parts:result};
	}


	function parseTag(dataHTML, tagName) {

		var parts = {
			htmlBefore : "",
			htmlAfter : "",
			htmlBody: "",
			params : "",
		}
		var tags = {
			open: _cfg.openTag + tagName,
			close: _cfg.openTag + "/" + tagName + _cfg.closeTag
		}
		var openParts = dataHTML.split(tags.open);

		if(openParts.length == 1) {
			return false;
		}

		var _body = '';
		var _afterBody = '';
		var cursor = 0;

		// [1] gets htmlBefore
		if(openParts[0])
			parts.htmlBefore = openParts[0];

		// [2] get tag's params
		var _secondLine = openParts[1].split(_cfg.closeTag);
		parts.params = _secondLine[0].trimLeft();

		// prepare to get the rest from first {{foreach  ...}} to the end of the string
		var ii = dataHTML.indexOf(tags.open) + tags.open.length;
		var tmp = dataHTML.slice(ii, dataHTML.length);

		var i = tmp.indexOf(_cfg.closeTag) + _cfg.closeTag.length;
		var _second = tmp.slice(i, tmp.length);

		if(tagName=='$$') {
			// if tjhis is a single tag without body, just return the result.
			parts.htmlAfter = _second;
			return parts;
		}

		// if this is tag with body, continue to extract the rest
		var closeParts = _second.split(tags.close)
		if(closeParts.length == 1) {
			// this is single tag 
			parts.htmlAfter = _second;
			return parts;
		}

		// [3] gets body and htmlAfter
		var i = 0;
		for(var c in closeParts) {
			var line = closeParts[c];

			if(c==0) {
				// check if there is embedded tag inside the body (only in the first line)
				var openTags = line.split(tags.open);
				if(openTags.length > 1)
					i = i + (openTags.length - 1);
			}

			if(c < i) {
				parts.htmlBody += line;
				parts.htmlBody += tags.close;
			}
			else if(c == i) {
				// this is last body line, don't add tags.close since this is the curent tag which is processed
				parts.htmlBody += line;
			}
			else {
				parts.htmlAfter += line;
				if(c < closeParts.length - 1)
					parts.htmlAfter += tags.close
			}
		}
		return parts;
	}



	function isContentEmpty(contentText) {
		if(contentText == undefined)
			return false; // contentText doesn't exist cause the tag has children
		else
			return contentText.trim() != '' ? false: true;
	}

	function parseDocument(htmlResult) {
		var resultArray = [];
		if(htmlResult=='')
			return '';
		let tagInfo = findFirstTag(htmlResult);
		if(tagInfo == -1) {
			// there are no tags here
			return -1;	
		}
		var block;


		for(let c=0;c < 3;c++) {
			var block = {};
			switch(c) {
				case 0:
					if(!tagInfo.parts.htmlBefore) break;
					block.tagName = 'text';
					block.content 	  = tagInfo.parts.htmlBefore;
					break;
				case 1:
					block.tagName = tagInfo.tagName;
					block.attributes  = tagInfo.parts.params;
					if(tagInfo.parts.htmlBody) {						
						let result = parseDocument(tagInfo.parts.htmlBody);
						if(result != -1)
							block.children = result;
						else {
							//block.content = tagInfo.parts.htmlBody;
							block.children = [{'tagName': 'text', content: tagInfo.parts.htmlBody}];
						}
					}
					break;
				case 2:
					if(!tagInfo.parts.htmlAfter) break;
					result = parseDocument(tagInfo.parts.htmlAfter);

					if(result != -1) {
						for(var cc in result) {
							resultArray.push(result[cc]);
							block.tagName = null;
						}
					}
					else {
						block.tagName = 'text';
						block.content = tagInfo.parts.htmlAfter;
					}
			}

			if(block['tagName'] != undefined && block['tagName']!= null && !isContentEmpty(block['content'])) {
				resultArray.push(block);
			}
		}

		return resultArray;
	}

	return {
		parseDocument: parseDocument
	}

}
