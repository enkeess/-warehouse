const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max + 1);
  return Math.floor(Math.random() * (max - min)) + min;
}

const getRandomArray = (min, max, n) => {
	let arr = [];
	let item;
	while(arr.length < n) {
		item = getRandomInt(min, max);
		if (arr.indexOf(item) == -1) { 
			arr.push(item); 
		}
	}

	return arr;
}

const readFile =  (input) => {
	let file = input.files[0];
	let reader = new FileReader();
	
	reader.readAsText(file);

	reader.onload = function () {
		db = JSON.parse(reader.result);
	};

	reader.onerror = function () {
		alert(console.log(reader.error));
	};
}

const clearUI = (parent) => {
	while (parent.firstChild) {
		parent.firstChild.remove();
	}
}

const withSpan = (text) => {
	const span = document.createElement('span');
	span.innerText = text;
	return span;
}

const addOptions = (parent, min, max) => {
	for(let i = min; i <= max; i++) {
		parent.append(withOption(i));
	}

	parent.value = max;
}

const withOption = (value) => {
	const option = document.createElement('option');
	option.value = value;
	option.text = value;
	return option;
}

const withSelector = (value, action, index, min = -20, max = 20) => {
	const selector = document.createElement('select');

	addOptions(selector, min, max);
	selector.value = value;
	selector.addEventListener('change', (e) => {
		action(index, +e.target.value);
	})

	return selector;
}