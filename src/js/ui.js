const nextBtn = document.querySelector('#next');
const resultsBtn = document.querySelector('#resultsBtn');
const counter = document.querySelector('.counter');

const experiment = document.querySelector('#experiment');
const results = document.querySelector('#results');

const warehouseList = document.querySelector('#warehouse-list');
const ordersList = document.querySelector('#orders-list');
const departuresList = document.querySelector('#departures-list');
const expectedList = document.querySelector('#expected-list');

const volume = document.querySelector('#volume');
const profitDay = document.querySelector('#profitDay');
const losses = document.querySelector('#losses');
const profitAll = document.querySelector('#profitAll');

const history = document.querySelector('#history');
const historyBlock = document.querySelector('.history__block');
const historyTitle = document.querySelector('.history__title');
const historyItem = document.querySelector('.history__item');

const currentDay = document.querySelector('#currentDay');
const allDays = document.querySelector('#allDays');

history.append(historyItem.cloneNode(true));
const form = document.querySelector('#form');




const clearUI = (parent) => {
	while (parent.firstChild) {
		parent.firstChild.remove();
	}
}

clearUI(history);

const drawTable = (parent, data) => {
	clearUI(parent);

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

const updateCounter = (curDay, days) => {
	currentDay.innerText = curDay;
	allDays.innerText = days;
}


const drawHistory = (historyData) => {
	clearUI(history);
	const historyList = document.createElement('ul');
	historyList.classList.add('history__list', 'table__list');

	historyData.forEach(item => {
		console.log(item);
		let newHistoryBlock = historyBlock.cloneNode();
		let newHistoryItem = historyItem.cloneNode(true);
		let newHistoryList = historyList.cloneNode();
		const newHistoryTitle = historyTitle.cloneNode();
		newHistoryTitle.innerText = `День ${item.day}`;
		drawTable(newHistoryList, item.stat);
		newHistoryItem.append(newHistoryList);
		newHistoryBlock.append(newHistoryTitle);
		newHistoryBlock.append(newHistoryItem);
		history.append(newHistoryBlock);
	})
}