const nextBtn = document.querySelector('#next');
const resultsBtn = document.querySelector('#resultsBtn');
const counter = document.querySelector('.counter');
const rebootBtn = document.querySelector('#reboot');
const toEndBtn = document.querySelector('#to-end');

const getOrdersBtn = document.querySelector('#get-orders');
const details = document.querySelector('#details');

const experiment = document.querySelector('#experiment');
const results = document.querySelector('#results');

const setup = document.querySelector('#setup');


const warehouseList = document.querySelector('#warehouse-list');
const warehouseTopList = [
	'Название',
	'Кол-во упаковок',
	'Кол-во единиц в упаковке',
	'Срок годности (дней) ',
	'Закупочная цена за единицу (у.е)',
	'Наценка с учетом уценки (%)',
	'Цена за единицу (у.е)'
]

const scrappedList = document.querySelector('#scrapped-list')
const scrappedTopList = [
	'Название',
	'Кол-во единиц товара',
	'Закупочная цена за единицу (у.е)',
	'Общая стоимость'
]

const ordersList = document.querySelector('#orders-list');
const orderTopList = [
	'Название',
	'Торговая точка',
	'Кол-во единиц товара'
]

const departuresList = document.querySelector('#departures-list');
const departuresTopList = [
	'Название',
	'Торговая точка',
	'Кол-во упаковок',
	'Цена за единицу (у.е)'
]

const expectedList = document.querySelector('#expected-list');
const expectedTopList = [
	'Название',
	'Кол-во упаковок'
]

const providerOrders = document.querySelector('#provider-orders')

const statList = document.querySelector('#stat-list');
const statTopList = [
	'Объем продаж (у.е.): ',
	'Чистая прибыль (у.е.): ',
	'Потери при списании (у.е.): ',
	'Итог (у.е.): '
]

const historyByDay = document.querySelector('#historyByDay');
const historyResult = document.querySelector('#historyResult');
const historyBlock = document.querySelector('.history__block');
const historyTitle = document.querySelector('.history__title');
const historyItem = document.querySelector('.history__item');
const historyStat = document.querySelector('.history__stat');
const historyWrapper = document.querySelector('.history__wrapper');

const historyTopItem = [
	'Название',
	'Объем заявок единиц товара',
	'Объем отгруженных единиц товара',
	'Списано единиц товара',
	'Общая прибыль',
	'Чистая прибыль',
	'Потери от списания'
]

const currentDay = document.querySelector('#currentDay');
const allDays = document.querySelector('#allDays');

const form = document.querySelector('#form');
addOptions(form.days, 1, 30, 10);
addOptions(form.productsAmount, 12, 18, 12);
addOptions(form.retailersAmount, 1, 9, 9);
addOptions(form.minOrder, 10, 100, 10);
addOptions(form.maxOrder, 100, 300, 300);
addOptions(form.minDispatchTime, 1, 5, 1);
addOptions(form.maxDispatchTime, 1, 5, 5);

const drawTable = (parent, top, data, action) => {
	clearUI(parent);

	let tableTop = document.createElement('li');
	tableTop.classList.add('table__line', 'table__top');
	top.map(item => tableTop.append(withSpan(item)));

	if(action && action.del) {
		parent.classList.add('table_del');
		tableTop.append(withSpan(''));
	}

	parent.append(tableTop);

	let tableRows = data.map((node, i) => {
		let tableRow = document.createElement('li');
		tableRow.classList.add('table__line', 'table__item');
		for(let key in node) {
			if(key == 'margin' && action && action.modify) {
				tableRow.append(withSelector(node[key], action.modify, i));
			} else if(key != 'id') {
				tableRow.append(withSpan(node[key]));
			}
		}

		if(action && action.del) {
			const btn = document.createElement('button');
			btn.classList.add('btn', 'btn_del');
			btn.addEventListener('click', () => action.del(i));

			tableRow.append(btn);
		}
		
		return(tableRow)
	})

	tableRows.forEach(item => parent.append(item));
}

const updateShortUI = (store) => {
	drawTable(ordersList, orderTopList, store.getOrderList());
	drawTable(warehouseList, warehouseTopList, store.getProducts(), {modify: store.setMargin});
	drawTable(scrappedList, scrappedTopList, store.getScrappedProducts());
	drawTable(expectedList, expectedTopList, store.getExpectedDeliveries());
	getOrdersBtn.classList.remove('hide');
	nextBtn.classList.add('hide');
	resultsBtn.classList.add('hide');
	details.classList.add('hide');
}

const updateUI = (store) => {
	drawTable(ordersList, orderTopList, store.getOrderList());
	drawTable(warehouseList, warehouseTopList, store.getProducts());
	drawTable(scrappedList, scrappedTopList, store.getScrappedProducts());
	drawTable(departuresList, departuresTopList, store.getDepartures(), {del: store.removeDepartureOrder});
	drawTable(expectedList, expectedTopList, store.getExpectedDeliveries());
	drawTable(statList, statTopList, store.getShortStat());
	drawTable(providerOrders, expectedTopList, store.getProviderOrders(), {del: store.removeProviderOrder});
	getOrdersBtn.classList.add('hide');
	details.classList.remove('hide');
}

const updateCounter = (curDay, days) => {
	currentDay.innerText = curDay;
	allDays.innerText = days;
}

const drawHistory = (parent, data) => {
	clearUI(parent);

	data.forEach(item => {
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

const nextSlideBtn = document.querySelector('#next-slide');
const prevSlideBtn = document.querySelector('#prev-slide');

class Slider {
	constructor(container, wrapper, nextSlideBtn, prevSlideBtn) {
		console.log('new slider');


		this.wrapper = wrapper;
		this.container = container;

		wrapper.style.left = "";

		nextSlideBtn.classList.remove('hide');

		this.shift = 0;
		this.containerWidth = container.clientWidth;
		this.wrapperWidth = wrapper.scrollWidth;

		prevSlideBtn.classList.add('hide');

		if(-(this.shift - this.containerWidth) >= this.wrapperWidth) {
			nextSlideBtn.classList.add('hide');
		}

		nextSlideBtn.addEventListener('click', this.nextClideAction);
		prevSlideBtn.addEventListener('click', this.prevSlideAction);
	}

	nextClideAction = () => {
		prevSlideBtn.classList.remove('hide');
		this.shift = this.shift - this.containerWidth;
		this.wrapper.style.left = `${this.shift}px`;
		
		if(-(this.shift - this.containerWidth) >= this.wrapperWidth) {
			nextSlideBtn.classList.add('hide');
		}
	}

	prevSlideAction = () => {
		nextSlideBtn.classList.remove('hide');
		this.shift = this.shift + this.containerWidth;
		this.wrapper.style.left = `${this.shift}px`;

		if(this.shift == 0) {
			prevSlideBtn.classList.add('hide');
		}
	}

	removeActions = () => {
		nextSlideBtn.removeEventListener('click', this.nextClideAction);
		prevSlideBtn.removeEventListener('click', this.prevSlideAction);
	}
}


