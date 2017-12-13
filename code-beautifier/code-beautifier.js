var codeBeautifier = {

	_container: null,

	init: (container) => {
		_container = container;

		
     
	},

	beautify: (container, config) => {
		//_container.html( _container.html().split('<br>').join('#br#'));
		var text = _container[0].textContent;


		text = text.split('<').join('&lt;');
		text = text.split('>').join('&gt;');

		//text = text.split('#br#').join("\n");

		var replacementText = text;


		// ========== html code colorization ===========	
		// colorize text inside < tag >
		replacementText = replacementText.replace(/&lt;([^\s&]*]*)([^&]*)/g, '&lt;<span class="function">$1</span><span class="quoted-text">$2</span>');
		
		// ========= template code colorization ===========	

		// colorize text inside quotes
		//replacementText = replacementText.replace(/(["'])(.*?)(["'])/g, '$1<span class="quoted-text">$2</span>$3');	

		// colorize text inside {{ ...  }}
		replacementText = replacementText.replace(/{{([^\s}]*)([^}}]*)/g, '{{<span class="function">$1</span><span class="function-param">$2</span>');
		replacementText = replacementText.replace(/[\$\$]/g, '<span style="color:red">$$</span>');


		_container.html(replacementText);
	}
}