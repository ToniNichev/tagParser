var jsonToString = {

	variablePrefix: '$$',
	_config: {},

	toString: (obj, data, config) => {	
		jsonToString._config = config;
		function cleanUpVariable(variable) {
			variable = variable.split(jsonToString.variablePrefix).join('_data.');
			return variable;
		}

		function executeForeach(iterationData, dataName, children, _data) {
			var txt = '';
			var _iterationData = eval(iterationData)
			for(var c in _iterationData) {
				_data[dataName] = _iterationData[c];
				txt += iterator(children, _data );
			}
			return txt;
		}

		function executeIf(attributes, children, _data) {
			if(children.constructor != Array) {
				// we always expect this to be an array
				children = [children];
			}
			attributes = attributes.indexOf('$$') != -1 ? cleanUpVariable(attributes) : attributes;
			let evalString = attributes;
			var txt = '';
			var evalResult = false;
			// evaluate statement
		if(eval(evalString)) {
				evalResult = true;
			}
			for(var c in children) {
				let _obj = children[c];
				if(_obj.tagName == 'else') {
					if(evalResult) {
						break;
					}
					else {
						evalResult = true;
						continue;
					}
				}				
				if(evalResult == true) {
					// iterator expects an array of objects, but here is only one, so we are wrapping
					// it in an array
					txt += iterator([_obj], _data); 
				}
			}
			return txt;
		}

		
		function iterator(_obj, _data){
			var txt = '';
			for(var c in _obj) {
				let element = _obj[c];
				switch(element.tagName) {
					case 'text':
						txt += element.content;		
					break;
					case 'foreach':						
						let attrib = element.attributes.split(' as ');
						let iterationData = cleanUpVariable(attrib[0]);
						let dataName = attrib[1];
						let children = element.children;
						txt += executeForeach(iterationData, dataName, children, _data);
					break;
					case '$$':
						txt += parserPlugIns.$$(element.attributes, _data);
					break;
					case 'if':
						txt += executeIf(element.attributes, element.children, _data);
					break;
					default:
						var pluginName = element.tagName;
						if(typeof element.children != 'undefined') {
							let _firstObj = element.children[0]; // first object is the 'text' node 							
							txt += jsonToString._config.parserPlugIns[pluginName](_firstObj.attributes,_firstObj.content, _data);
						}
						else {						
							txt += jsonToString._config.parserPlugIns[pluginName](element.attributes, _data);
						}
					break;
				}
			}
			return txt;
		}	

		var txt = iterator(obj, data);		
		return txt;
	}

}
