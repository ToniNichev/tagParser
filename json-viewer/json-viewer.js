var JsonView = {


	showJSON: (obj, container) => {
		let closeNodeSize = 14;

		let returnMarkupFor = {
			key: (keyStr) => {
				return `<b>${keyStr}:</b>`;
			},
		}

		function nodeContainer(key, paramsStr, nodeType) {
			var htmlText = ``;
				htmlText += `<div class='node-container' data-height='' data-open='true'>`;
				htmlText += 	`<h1 class='triangle-down'></h1>`
			if(key != null)
				htmlText += 	returnMarkupFor.key(key);
			else
				htmlText += 	'<b> </b>';
				htmlText += 	`<h2 class='systemText'>(${nodeType})</h2>`;
				htmlText += 	'<br>';
				htmlText += 	'<span class="open-wrap-tag systemText">' + (nodeType == 'array' ? '[' : '{') + '</span>';
				htmlText += 	`<div class='object-container'>${paramsStr}</div>`
				htmlText += 	'<span class="close-wrap-tag systemText">' + (nodeType == 'array' ? ']' : '}') + '</span>';
				htmlText += `</div>`
			return htmlText;
		}

		function keyValueContainer(key, valueStr) {
			var htmlText = '';
			if(key != null)
				htmlText = 	'<span>' + returnMarkupFor.key(key) + '</span>';
			else
				htmlText = 	'<span></span>';
			htmlText += `${valueStr}<br>`;
			return htmlText;
		}

		function arrayContainer(key, valuesArray) {
			var paramsStr = '';
			for(var c in valuesArray) {
				let str = iterator(null, valuesArray[c]);
				paramsStr += `${str}`;
			}
			let htmlText = nodeContainer(key, paramsStr, 'array');
			return htmlText;
		}


		function iterator(key, param) {
			var htmlText = '';
			if(param.constructor ==  String || param.constructor == Number) {
				// String
				param = $("#JSONviewer_EscapeHTMLContainer").text(param).html();
				htmlText +=  keyValueContainer(key, param);
			}
			else if(param.constructor ==  Array) {
				// Array
				htmlText += arrayContainer(key, param);
			}
			else {
				// Object
				var _paramData='';
				Object.keys(param).forEach(function(_key,index) {
					var _param = param[_key];
					_paramData += iterator(_key, _param);
				});
				htmlText += nodeContainer(key, _paramData, 'object');
			}

			//htmlText += `</div>`;
			 return htmlText;
		}

		function createEscapeHTMLContainer() {
			if ($('#JSONviewer_EscapeHTMLContainer').length == 0) {
				var div = document.createElement("div");
				div.innerHTML = "";
				div.id = "JSONviewer_EscapeHTMLContainer"
				$('body')[0].appendChild(div);
			}
		}
		createEscapeHTMLContainer();


		let result = iterator('root', obj);
		container.html(result);


		// set up nodes height
		$('h1').each(function(){
 			let divWrapper = $(this).parent();
			let height = divWrapper.height();
			divWrapper.attr('data-height', height);
		});

		// attach the events
		$('h1').click(function() {
		 let divWrapper = $(this).parent();

		 if(divWrapper.attr('data-open') != 'true') {
		 	// Open node
			$(this).addClass('triangle-down')
			$(this).removeClass('triangle-left')

			let height = divWrapper.attr('data-height');
			divWrapper.css('max-height', height + 'px');
			divWrapper.attr('data-open', 'true');
			divWrapper.find('span').removeClass('divWrapper');

			var h2 = divWrapper.find('h2')[0]
			$(h2).removeClass('collapsedCloseTag');

		 }
		 else {
		 	// Close node
			$(this).removeClass('triangle-down')
			$(this).addClass('triangle-left')

			setTimeout(function() {
				var h2 = divWrapper.find('h2')[0]
				$(h2).addClass('collapsedCloseTag');
			}, 700);

			let height = divWrapper.height();
			divWrapper.css('max-height', height + 'px');
			divWrapper.attr('data-open', 'false');

			setTimeout(function(t) {
			 divWrapper.css('transition', 'max-height 0.45s ease-out;');
			 divWrapper.css('max-height', closeNodeSize + 'px');
			}, 5);
		 }
		})
	}
}
