const nextBtn = document.querySelector('#next');
const counter = document.querySelector('.counter');

const warehouseList = document.querySelector('#warehouse-list');
const ordersList = document.querySelector('#orders-list');
const departuresList = document.querySelector('#departures-list');
const expectedList = document.querySelector('#expected-list');

const volume = document.querySelector('#volume');
const profitDay = document.querySelector('#profitDay');
const losses = document.querySelector('#losses');
const profitAll = document.querySelector('#profitAll');

const drawTable = (parent, data) => {
	while (parent.firstChild) {
		parent.firstChild.remove();
	}

	let tableRows = data.map((node) => {
		let tableRow = document.createElement('li');
		tableRow.classList.add('table__line', 'table__item');
		for(let key in node) {
			let span = document.createElement('span');
			span.innerText = node[key];
			tableRow.append(span);
		}

		return(tableRow)
	})

	tableRows.forEach(item => parent.append(item));
}

const drawSpan = (parent, data) => {
	parent.innerText = data;
}

const updateUI = (store) => {
	drawTable(ordersList, store.getOrderList());
	drawTable(warehouseList, store.getProducts());
	drawTable(departuresList, store.getDepartures());
	drawTable(expectedList, store.getExpectedDeliveries());

	// statistic
	drawSpan(volume, store.getVolume());
	drawSpan(profitDay, store.getProfitDay());
	drawSpan(losses, store.getLosses());
	drawSpan(profitAll, store.getProfitAll());
}