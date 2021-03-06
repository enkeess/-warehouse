"use strict";

let days = 0;
let productsAmount = 0;
let retailersAmount = 0;
let minOrder = 0;
let maxOrder = 0;
let minDispatchTime = 0;
let maxDispatchTime = 0;
let db = {};
let ex = null;
let slider = null;


class Product {
	id;
	title;
	constructor({id, title}) {
		this.id = id;
		this.title = title;
	}
}

class Order extends Product {
	amount;
	constructor({id, title, amount}) {
		super({id, title});
		this.amount = amount;
	}
}

class ProviderOrder extends Order {
	leadtime;
	constructor({id, title, amount, leadtime}) {
		super({id, title, amount});
		this.leadtime = leadtime;
	}
}

class DbProduct extends Product {
	initialPrice;
	pack;
	expiryDate;

	constructor({id, initialPrice, pack, expiryDate, title}) {
		super({id, title});
		this.initialPrice = initialPrice;
		this.pack = pack;
		this.expiryDate = expiryDate;
	}
}

class StoreProduct extends DbProduct {
	margin;
	amount;
	price;
	constructor({id, initialPrice, pack, expiryDate, margin, amount, title}) {
		super({id, initialPrice, pack, expiryDate, title});
		this.margin = margin;
		this.amount = amount;
		this.price = Math.round((1 + this.margin / 100) * initialPrice);
	}
}

class RetailerOrder extends Order {
	retailerId;
	constructor({id, amount, retailerId, title}) {
		super({id, amount, title});
		this.retailerId = retailerId;
	}
}

class Departure extends RetailerOrder {
	price;
	from;
	constructor({id, amount, retailerId, price, from, title}) {
		super({id, amount, retailerId, title});
		this.price = price;
		this.from = from;
	}
}


class StatisticItem {
	id;               // код товара
	title;            // наименование товара
	orderAmount;      // объем заявок на поставки
	departuresAmount; // объем отгруженных заявок
	lossesAmount;     // объем списанных товаров
	totalCost;        // общая стоимость проданных товаров
	profitCost;       // чистая прибыль от продажи товаров
	totalLosses;      // общая потеря от списывания
	
	constructor({
		id,
		title,
		orderAmount = 0, 
		departuresAmount = 0, 
		lossesAmount = 0, 
		totalCost = 0,
		profitCost = 0 
	}) {
		this.id = id;
		this.title = title;
		this.orderAmount = orderAmount;
		this.departuresAmount = departuresAmount;
		this.lossesAmount = lossesAmount;
		this.totalCost = totalCost;
		this.profitCost = profitCost;
		this.totalLosses = totalCost;
	}
}

class ShortStatisticItem {
	volume;
	profit;
	losses; 
	result;

	constructor({
		volume,
		profit = 0,
		losses = 0,
	}) {
		this.volume = volume ? volume : 0;
		this.profit = profit;
		this.losses = losses;
		this.result = this.profit - this.losses;
	}
}
;
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

const addOptions = (parent, min, max, value) => {
	for(let i = min; i <= max; i++) {
		parent.append(withOption(i));
	}

	if(value) {
		parent.value = value
	} else {
		parent.value = max;
	}
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
};
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


;
class Provider {
	#orderList;
	#minDispatchTime;
	#maxDispatchTime;

	constructor({minDispatchTime, maxDispatchTime}) {
		this.#orderList = []
		this.#minDispatchTime = minDispatchTime;
		this.#maxDispatchTime = maxDispatchTime
	}

	newOrder = (order) => {
		this.#orderList = [ 
			...this.#orderList,  
			{
				order: order, 
				leadTime: getRandomInt(this.#minDispatchTime, this.#maxDispatchTime)
			}
		];
	}

	sendOrder = (consumer) => {
		this.#orderList = 
			this.#orderList.map(item => ({
					...item,
					leadTime: item.leadTime - 1
			}))

		const readyOrders = this.#orderList.filter(item => item.leadTime == 0); // готовые к отправке заказы
		this.#orderList = this.#orderList.filter(item => item.leadTime > 0);    // оставшиеся заказы
		readyOrders.map(item => consumer.acceptOrder(item.order));              // отправка заказов потребителю
	}
};
class Store { // склад

//  ----- Private Var ----- //
	#productsBase;          // бд продуктов
	#provider;              // поставщик
	#statisticList;         // статистика продаж по продуктам
	#products;              // текущий список продуктов после отправки заказчикам
	#morningPropucts;       // список продуктов на складе в начале дня
	#morningOrders;			// заказы от торговых точек в начале дня
	#retailerOrderList;             // список заказов от точек
	#departures;            // список отправлений точкам
	#expectedDeliveries;    // ожидаемые поставки
	#providerOrders;        // список заявок на поставки
	#scrappedProducts;      // списанные продукты
//  ----- Private Var ----- //

//  ----- Constructor ----- //
	constructor(db, provider) {
		this.#productsBase = db.products;
		this.#provider = provider;

		this.#products = db.initialStore.map(product => {
			return new StoreProduct({...this.#productsBase[product.id - 201], ...product})
		}); 

		this.#retailerOrderList = [];
		this.#departures = [];
		this.#scrappedProducts = [];
		this.#expectedDeliveries = [];
		this.#providerOrders = [];

		this.#morningPropucts = this.#products;
		this.#morningOrders   = this.#retailerOrderList;
		this.#statisticList   = this.#productsBase.map(({id, title}) => new StatisticItem({id, title}));

		console.log(this.#productsBase);
	}
//  ----- Constructor ----- //

//  ----- External Interactions ----- //
	acceptOrder = (order) => { // принять заказ от поставщика
		this.#products = [
			...this.#products,
			new StoreProduct({
				...this.#productsBase[order.id - 201],
				...order
			})
		]

		this.#expectedDeliveries = this.#expectedDeliveries.map(item => {
			return item.id == id ? {...item, amount: item.amount - order.amount} : item;
		}).filter(item => item.amount > 0);
	}

	newOrder = (retailer, order) => { // принять заявку на заказ потребителя
		this.#retailerOrderList = [...this.#retailerOrderList, {retailer: retailer, order: order}];
	} 

//  ----- External Interactions ----- //
	

//  ----- Private ----- //

	#collectStatistic = () => { // собрать статистику по дню
		this.#statisticList = this.#productsBase.map(({id, title}) => new StatisticItem({id, title}));

		this.#morningOrders.forEach(({id, amount}) => {
			let stat = this.#statisticList[id - 201];
			stat.orderAmount = stat.orderAmount + amount;
		})

		this.#departures.forEach(({id, amount, price}) => {
			let stat = this.#statisticList[id - 201];
			stat.departuresAmount = stat.departuresAmount + amount * this.#productsBase[id - 201].pack;
			stat.totalCost = stat.totalCost + price * amount * this.#productsBase[id - 201].pack;
			stat.profitCost = stat.profitCost + (price - this.#productsBase[id - 201].initialPrice) * amount * this.#productsBase[id - 201].pack;
			
		})

		this.#scrappedProducts.forEach(({id, amount, sum}) => {
			let stat = this.#statisticList[id - 201];
			stat.totalLosses = stat.totalLosses + sum;
			stat.lossesAmount = stat.lossesAmount + amount * this.#productsBase[id - 201].pack;
		})
	}

	#updateExpiryDate = () => { // обновить значение срока годности продукта 
		this.#products = this.#products.map(
			item => new StoreProduct({...item, expiryDate: item.expiryDate - 1})
		);
	};

	#writeOf = () => { // удаление просрочки
		this.#scrappedProducts = this.#products.filter(product => product.expiryDate == 0).map(({id, amount, initialPrice, pack}) => ({id, amount,initialPrice, sum: pack * amount * initialPrice}));
		this.#products = this.#products.filter(product => product.expiryDate > 0);
	}

	#margin = () => { // уценка, каждый день меньше 3 маржа уменьшается
		this.#products = this.#products.map(item => {
			if(item.expiryDate < 3) {
				let margin = Math.min(item.expiryDate * 10 - 10, item.margin);
				return(new StoreProduct({...item, margin}))
			} else {
				return(item);
			}
		});
	}

	#findProductbyId = (id) => {
		return(this.#products.map((item,index) => {
			if(item.id == id) {
				return({item, index})
			}
		})).filter(item => item != undefined);
	}

	#sortProducts = () => {
		this.#products.sort((a, b) => { 
			if(a.title < b.title) {
				return(-1);
			} 
			if(a.id == b.id) {
				return(a.expiryDate - b.expiryDate);
			}
			return(1);
		});
	}
	
	#calcProductAmount = (id) => this.#findProductbyId(id).reduce((res, {amount}) => res + amount, 0);

	#complianceMin = () => { // поддержание минимального кол-ва продукции
		this.#productsBase.map(({id, min, limit}) => {
			const curAmount = this.#calcProductAmount(id);
			const dev = min - curAmount;
			const expectedAmount = this.#calcExpectedAmount(id);
			
			if(dev > 0) { // кол-во товара меньше установленного минимума
				const {title} = this.#productsBase[id - 201];
				const amount = Math.min(dev, limit - expectedAmount);
				if(amount > 0) {
					this.#providerOrders = [...this.#providerOrders, new Order({id, amount, title})];
				}
			}
		})
	}

	#makeProviderOrder = () => {
		let expectedAmount;
		this.#providerOrders.forEach(order => {
			this.#provider.newOrder(order);
			expectedAmount = this.#calcExpectedAmount(order.id);
			this.#expectedDeliveries = [
				...this.#expectedDeliveries.filter(item => item.id != order.id),
				new Order({
					...order,
					amount: expectedAmount + order.amount
				})
			]
		});
	}

	#calcExpectedAmount = (id) => { 
		const expectedDelivery = this.#expectedDeliveries.find(item => item.id == id);
		return(expectedDelivery == undefined ? 0 : expectedDelivery.amount);
	};	

	#removeFromList = (list, i) => {
		return list.filter((item, index) => i != index);
	}

	#tryStore = (retailerOrder) => {
		
		const {id, retailerId, title} = retailerOrder; 
		let {amount} = retailerOrder;

		let roundAmount = Math.max(Math.round(amount / this.#productsBase[id - 201].pack), 1); 
		this.#products = this.#products.map((item, from) => {
			if(item.id == id && roundAmount > 0 && item.amount > 0) {
				if(roundAmount >= item.amount) {
					this.#departures = [
						...this.#departures,
						new Departure({
							id,
							retailerId,
							amount: roundAmount,
							price: item.price,
							from, 
							title
						})
					]

					roundAmount = roundAmount - item.amount
					return( // полностью отправили какую-то партию товара покупателю
						new StoreProduct({...item, amount: 0})
					)
				} else {
					this.#departures = [
						...this.#departures,
						new Departure({
							id,
							retailerId,
							amount: roundAmount,
							price: item.price,
							from,
							title
						})
					]
					
					let newAmount = item.amount - roundAmount;
					roundAmount = 0;

					return(
						new StoreProduct({...item, amount: newAmount})
					)
				}
			} else {
				return item;
			}
		})
	}

//  ----- Private ----- //

//  ----- Public ----- //

	newDay = () => {
		this.#products = this.#products.filter(item => item.amount > 0); //оставляем продукты кол-вом больше 0 упаковок
		this.#sortProducts();            		 // сортировка списка продуктов по id и сроку годности
		this.#writeOf();                 		 // списание продуктов
		this.#makeProviderOrder();       		 // дозаказываем продукты от фирм поставщика по вчерашней заявке
		this.#providerOrders = [];       		 // сбрасываем дозаказываем продуктов от фирм поставщиков
		this.#morningPropucts = this.#products;  // обновляем отображаемое состояние склада на начало дня
		this.#retailerOrderList = [];                    // сбрасываем заказы от торговых точек
		updateShortUI(this);                     // обновляем упрощенный интерфейс
	}

	processOrders = () => {
		this.#morningOrders = this.#retailerOrderList;   // обновляем отображаемые заказы от торговых точек
		this.#departures = [];                   // сбрасываем отправления торговым точкам
		this.#statisticList = db.products.map(item => new StatisticItem(item.id)); // сбрасываем статистику
		this.#retailerOrderList.forEach(retailerOrder => this.#tryStore(retailerOrder)); // проходимся по списку заказов и отправляем все что можем
		this.#updateExpiryDate();         // обновление срока годности
		this.#collectStatistic();         // сбор статистики
		this.#margin(); 		          // автоматическая уценка
		this.#complianceMin();            // поддержание минимального кол-ва товара на складе
		this.#retailerOrderList = [];     // сброс списка заказов
		updateUI(this);                   // обновление интерфейса
	}

	acceptOrder = (order) => { // принять заказ от поставщика
		this.#products = [
			...this.#products,
			new StoreProduct({
				...this.#productsBase[order.id - 201],
				...order
			})
		]

		this.#expectedDeliveries = this.#expectedDeliveries.map(item => {
			return item.id == order.id ?  new Order({...item, amount: item.amount - order.amount}) : item;
		}).filter(item => item.amount > 0);
	}

	newOrder = (retailerOrder) => { // принять заявку на заказ потребителя
		this.#retailerOrderList = [...this.#retailerOrderList, retailerOrder];
	} 

	removeProviderOrder = (i) => {
		this.#providerOrders = this.#removeFromList(this.#providerOrders, i);
		updateUI(this);
	}

	removeDepartureOrder = (i) => {	
		const {from, amount} = this.#departures[i]
		
		this.#products[from] = {...this.#products[from], amount: this.#products[from].amount + amount}

		this.#departures = this.#removeFromList(this.#departures, i);
		this.#collectStatistic();

		updateUI(this);
	}

	setMargin = (i, value) => {		
		this.#morningPropucts[i] = new StoreProduct({
			...this.#morningPropucts[i],
			margin: value,
		})

		this.#products[i] = new StoreProduct({
			...this.#products[i],
			margin: value,
		})

		updateShortUI(this);
	}	
//  ----- Public ----- //

//  ----- Getters ----- //
	getStatistic = () => this.#statisticList; // получить полную статистику 
 
	getShortStat = () => {  // получить краткую статистику по дню
		const profit = this.#statisticList.reduce((res, {profitCost}) => res + profitCost, 0);
		const losses = this.#statisticList.reduce((res, {totalLosses}) => res + totalLosses, 0);
		const volume = this.#statisticList.reduce((res, {totalCost}) => res + totalCost, 0);

		return [new ShortStatisticItem({volume, losses, profit})];
	}

	getProducts = () => {;               // получить продукты к началу дня
		return this.#morningPropucts.map(({id, title, amount, pack, expiryDate, initialPrice, margin, price}) => (
				{id, title, amount, pack, expiryDate, initialPrice, margin, price}
			));
	} 

	getScrappedProducts = () => this.#scrappedProducts;      // получить списанные продукты
	
	getOrderList = () => {	                                 // получить список заказов от торговых точек
		return this.#morningOrders.map(({id, title, retailerId, amount}) => (
			{id, title, retailerId, amount}
		));
	}
	getDepartures = () => this.#departures.map(({id, title, retailerId, amount, price}) => ({id,title, retailerId, amount, price})); // получить список перевозок
	getProviderOrders = () => this.#providerOrders;          // получить список заказов фирме поставщику
	getExpectedDeliveries = () => this.#expectedDeliveries.sort((a,b) => (a.id - b.id)); // получить список ожидаемых поставок от фирмы поставщика
//  ----- Getters ----- //
}
;
class Experiment {
//  ----- Private Var ----- //
	#store;    				// экземпляр класса склада
	#provider; 				// фирма поставщик
	#currentDay;            // счетчик текущего дня эксперимента
	#db;                    // данные о товарах
	#history;               // история по дням
	#result;                // итоги эксперимента

	#days;                  // кол-во дней моделирования
	#retailersAmount;       // кол-во торговых точек
	#minOrder;              // минимальный заказ торговой точки
	#maxOrder;              // максимальный заказ торговой точки

//  ----- Private Var ----- //

//  ----- Constructor ----- //
	constructor({db, days, retailersAmount, productsAmount, minOrder, maxOrder, minDispatchTime, maxDispatchTime}) {
		const newDb = {
			products: db.products.filter(item => item.id <= 200 + productsAmount).sort((a,b) => a.id - b.id),
			initialStore: db.initialStore.filter(item => item.id <= 200 + productsAmount)
		}

		this.#db = newDb;
		this.#provider = new Provider({minDispatchTime, maxDispatchTime});
		this.#store = new Store(this.#db, this.#provider);
		this.#days = days;
		this.#retailersAmount = retailersAmount; 
		this.#minOrder = minOrder;
		this.#maxOrder = maxOrder;
		this.#currentDay = 0;
		this.#history = [];
		
		this.#result = {
			stat: newDb.products.map(({id, title}) => new StatisticItem({id, title})), 
			short: [
				new ShortStatisticItem({volume: 0})
			]
		};

		nextBtn.classList.remove('hide');
		this.nextStep();
	}
//  ----- Constructor ----- //

// Private
	#generateOrders = () => {
		const retailersIndex = getRandomArray(101, 100 + this.#retailersAmount, getRandomInt(1, this.#retailersAmount)); // генерируем точки которые будут совершать заказ
		const products = this.#store.getProducts().map(({id, title, margin}) => ({id, title, margin}));
		const testProducts = this.#db.products.map(({id, title}) => ({id, title, chance: 0}));

		products.forEach(({id, margin}) => {
			const i = id - 201;
			const chanceCur = testProducts[i].chance;
			const chanceCalc = 0.5 + (20 - margin) * 0.0125;
			testProducts[i] = {
				...testProducts[i],
				chance: chanceCalc > chanceCur ? chanceCalc : chanceCur,
			}
		})
		
		retailersIndex.forEach(retailerId => {
			testProducts.forEach(({id, title, chance}) => {
				if(Math.random() <= chance) {
					let amount = getRandomInt(this.#minOrder, this.#maxOrder);
					this.#store.newOrder(new RetailerOrder({id, title, amount, retailerId}))
				}
			})
		})
	}

// Public 
	nextStep = () => {
		if(this.#currentDay > 0) {
			this.updateHistory();
		}

		this.#provider.sendOrder(this.#store);
		this.#store.newDay();
		this.#currentDay = this.#currentDay + 1;

		updateCounter(this.#currentDay, this.#days);
	}

	makeOrders = () => {
		this.#generateOrders();
		this.#store.processOrders();
		
		nextBtn.classList.remove('hide');
		
		if(this.#currentDay == this.#days) {
			nextBtn.classList.add('hide');
			resultsBtn.classList.remove('hide')
		}
	}

	updateHistory = () => {
		this.#history = [...this.#history, {
			day: this.#currentDay, 
			stat: this.#store.getStatistic(),
			short: this.#store.getShortStat()
		}]
	}

	calcResult = () => {
		this.#history.forEach(({stat, short}) => {
			stat.forEach(item => {
				const { 
					id,
					title,
					orderAmount,
					departuresAmount, 
					lossesAmount, 
					totalCost, 
					profitCost, 
					totalLosses 
				} = this.#result.stat[item.id - 201]

				this.#result.stat[item.id - 201] = {
					id,
					title,
					orderAmount : orderAmount + item.orderAmount,
					departuresAmount : departuresAmount + item.departuresAmount,
					lossesAmount : lossesAmount + item.lossesAmount,
					totalCost : totalCost + item.totalCost, 
					profitCost : profitCost + item.profitCost,
					totalLosses : totalLosses + item.totalLosses
				};
			});

			short.forEach(item => {
				const {
					volume, 
					profit,
					losses,
					result
				} = this.#result.short[0];
				
				this.#result.short = [{
					volume: volume + item.volume,
					profit: profit + item.profit,
					losses: losses + item.losses,
					result: result + item.result
				}]
			})
		})
	}

//  ----- Getters ----- //
	getCurrentDay = () => this.#currentDay;
	getHistory = () => this.#history;
	getResult = () => [this.#result]; 
//  ----- Getters ----- //
};
nextBtn.classList.add('hide');
nextBtn.addEventListener('click', ()=>{
	ex.nextStep();
})

form.config.addEventListener('change', (e) => readFile(e.target));
form.addEventListener('submit', (e) => {
	e.preventDefault();

	results.classList.add('hide');
	resultsBtn.classList.add('hide');
	experiment.classList.remove('hide');

	days = +form.days.value;
	productsAmount = +form.productsAmount.value;
	retailersAmount = +form.retailersAmount.value;
	minOrder = +form.minOrder.value;
	maxOrder = +form.maxOrder.value;

	
	minDispatchTime = +form.minDispatchTime.value;
	maxDispatchTime = +form.maxDispatchTime.value;

	if(minDispatchTime > maxDispatchTime) {
		maxDispatchTime = minDispatchTime;
		form.maxDispatchTime.value = minDispatchTime;
	}

	ex = new Experiment({	
		db, 
		days, 
		retailersAmount, 
		productsAmount, 
		minOrder,
		maxOrder,
		minDispatchTime,
		maxDispatchTime
	});

	setup.classList.add('hide');
});

getOrdersBtn.addEventListener('click', () => {
	ex.makeOrders();
})

const endOfExperement = () => {


	slider && slider.removeActions();

	experiment.classList.add('hide');
	results.classList.remove('hide');
	
	ex.updateHistory();
	ex.calcResult();
	
	drawHistory(historyResult, ex.getResult())
	drawHistory(historyByDay, ex.getHistory());

	setup.classList.remove('hide');

	slider = new Slider(
		document.querySelector('.slider__container'),
		document.querySelector('.slider__wrapper'),
		document.querySelector('.next-slide-btn'),
		document.querySelector('.prev-slide-btn'),
	);
}

resultsBtn.addEventListener('click', endOfExperement);


rebootBtn.addEventListener('click', () => {
	experiment.classList.add('hide');
	setup.classList.remove('hide');
})


toEndBtn.addEventListener('click', () => {
	if(nextBtn.classList.contains('hide')) {
		ex.makeOrders();
	}

	while(resultsBtn.classList.contains('hide')) {
		ex.nextStep();
		ex.makeOrders();
	}

	endOfExperement();
});