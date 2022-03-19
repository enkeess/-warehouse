const nextBtn = document.querySelector('#next');
const resultsBtn = document.querySelector('#resultsBtn');
const counter = document.querySelector('.counter');

const experiment = document.querySelector('#experiment');
const results = document.querySelector('#results');

const warehouseList = document.querySelector('#warehouse-list');
const warehouseTopList = [
	'Код товара',
	'Кол-во единиц',
	'Срок годности (дней) ',
	'Закупочная цена за единицу (у.е)',
	'Базовая наценка (%)',
	'Наценка с учетом уценки (%)',
	'Цена за единицу (у.е)'
]

const scrappedList = document.querySelector('#scrapped-list')


const ordersList = document.querySelector('#orders-list');
const orderTopList = [
	'Код товара',
	'Торговая точка',
	'Кол-во единиц'
]

const departuresList = document.querySelector('#departures-list');
const departuresTopList = [
	'Код товара',
	'Торговая точка',
	'Кол-во единиц',
	'Цена за единицу (у.е)'
]

const expectedList = document.querySelector('#expected-list');
const expectedTopList = [
	'Код товара',
	'Кол-во единиц'
]

const statList = document.querySelector('#stat-list');
const statTopList = [
	'Объем продаж',
	'Чистая прибыль',
	'Потери при списании',
	'Итог'
]

const historyByDay = document.querySelector('#historyByDay');
const historyResult = document.querySelector('#historyResult');
const historyBlock = document.querySelector('.history__block');
const historyTitle = document.querySelector('.history__title');
const historyItem = document.querySelector('.history__item');
const historyStat = document.querySelector('.history__stat');
const historyWrapper = document.querySelector('.history__wrapper');

const historyTopItem = [
	'Код товара',
	'Объем заявок',
	'Объем отгруженных',
	'Списано',
	'Общая стоимость',
	'Чистая прибыль ',
	'Потери от списания'
]



const currentDay = document.querySelector('#currentDay');
const allDays = document.querySelector('#allDays');

const form = document.querySelector('#form');

const clearUI = (parent) => {
	while (parent.firstChild) {
		parent.firstChild.remove();
	}
}

clearUI(history);


const withSpan = (text) => {
	const span = document.createElement('span');
	span.innerText = text;
	return span;
}

const drawTable = (parent, top, data) => {
	clearUI(parent);

	let tableTop = document.createElement('li');
	tableTop.classList.add('table__line', 'table__top');
	top.map(item => tableTop.append(withSpan(item)));

	parent.append(tableTop);

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

const updateUI = (store) => {
	drawTable(ordersList, orderTopList, store.getOrderList());
	drawTable(warehouseList, warehouseTopList, store.getProducts());
	drawTable(scrappedList, warehouseTopList, store.getScrappedProducts());
	drawTable(departuresList, departuresTopList, store.getDepartures());
	drawTable(expectedList, expectedTopList, store.getExpectedDeliveries());
	drawTable(statList, statTopList, store.getShortStat());
}

const updateCounter = (curDay, days) => {
	currentDay.innerText = curDay;
	allDays.innerText = days;
}


const drawHistory = (parent, data) => {
	clearUI(parent);

	data.forEach(item => {
		console.log(item);
		let newHistoryBlock = historyBlock.cloneNode();
		const newHistoryTitle = historyTitle.cloneNode();
		let newHistoryItem = historyItem.cloneNode();
		let newHistoryStat = historyStat.cloneNode();

		let newHistoryWrapper = historyWrapper.cloneNode();
		
		if(item.day) newHistoryTitle.innerText = `День ${item.day}`;

		drawTable(newHistoryItem, historyTopItem, item.stat);
		drawTable(newHistoryStat, statTopList, item.short);
		
		newHistoryWrapper.append(newHistoryItem);
		newHistoryWrapper.append(newHistoryStat);
		
		newHistoryBlock.append(newHistoryTitle);
		newHistoryBlock.append(newHistoryWrapper);

		parent.append(newHistoryBlock);
	})
}