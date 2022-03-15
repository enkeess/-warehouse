const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max + 1);
  return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
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
