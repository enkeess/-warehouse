// Custom Scripts

"use strict";

let days = 0;
let productsAmount = 0;
let retailersAmount = 0;
let db = {};
let tester = null;;

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
};
const nextBtn = document.querySelector('#next');
const resultsBtn = document.querySelector('#resultsBtn');
const counter = document.querySelector('.counter');

const getOrdersBtn = document.querySelector('#get-orders');
const details = document.querySelector('#details');

const experiment = document.querySelector('#experiment');
const results = document.querySelector('#results');

const warehouseList = document.querySelector('#warehouse-list');
const warehouseTopList = [
	'Код товара',
	'Кол-во упаковок',
	'Кол-во единиц в упаковке',
	'Срок годности (дней) ',
	'Закупочная цена за единицу (у.е)',
	'Наценка с учетом уценки (%)',
	'Цена за единицу (у.е)'
]

const scrappedList = document.querySelector('#scrapped-list')
const scrappedTopList = [
	'Код товара',
	'Кол-во единиц товара',
	'Закупочная цена за единицу (у.е)',
	'Общая стоимость'
]

const ordersList = document.querySelector('#orders-list');
const orderTopList = [
	'Код товара',
	'Торговая точка',
	'Кол-во единиц товара'
]

const departuresList = document.querySelector('#departures-list');
const departuresTopList = [
	'Код товара',
	'Торговая точка',
	'Кол-во упаковок',
	'Цена за единицу (у.е)'
]

const expectedList = document.querySelector('#expected-list');
const expectedTopList = [
	'Код товара',
	'Кол-во упаковок'
]

const providerOrders = document.querySelector('#provider-orders')

const statList = document.querySelector('#stat-list');
const statTopList = [
	'Объем продаж: ',
	'Чистая прибыль: ',
	'Потери при списании: ',
	'Итог: '
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
addOptions(form.days, 1, 30);
addOptions(form.productsAmount, 12, 18);
addOptions(form.retailersAmount, 1, 9);

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
			} else {
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

;

function Order(id, amount) {
	this.id = id;
	this.amount = amount;
};

class Provider {
	#orderList = [];

	newOrder = (order) => {
		this.#orderList = [ 
			...this.#orderList,  
			{
				order: order, 
				leadTime: getRandomInt(1, 5)
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
class Retailer {
	#provider;
	#id;

	constructor({provider, id}) {
		this.#provider = provider; //поставщик
		this.#id = id
	}

	getId = () => this.#id; // получить id поставщика
	makeOrder = (order) => { // сделать заявку поставщику
		this.#provider.newOrder(this, order);} 
};


function StatisticItem(id) {
	// id;               // код товара
	// orderAmount;      // объем заявок на поставки
	// departuresAmount; // объем отгруженных заявок
	// lossesAmount;     // объем списанных товаров
	// totalCost;        // общая стоимость проданных товаров
	// profitCost;       // чистая прибыль от продажи товаров
	// totalLosses;      // общая потеря от списывания
	
	this.id = id;
	this.orderAmount = 0;
	this.departuresAmount = 0;
	this.lossesAmount = 0;
	this.totalCost = 0;
	this.profitCost = 0;
	this.totalLosses = 0;
}

class Store { // склад

//  ----- Private Var ----- //
	#productsBase;          // бд продуктов
	#config;                // конфигурация склада
	#provider;              // поставщик
	#statisticList;         // статистика продаж по продуктам
	#products;              // текущий список продуктов после отправки заказчикам
	#morningPropucts;       // список продуктов на складе в начале дня
	#morningOrders;			// заказы от торговых точек в начале дня
	#orderList;             // список заказов от точек
	#departures;            // список отправлений точкам
	#expectedDeliveries;    // ожидаемые поставки
	#providerOrders;        // список заявок на поставки
	#scrappedProducts;      // списанные продукты
//  ----- Private Var ----- //

//  ----- Constructor ----- //
	constructor(db, provider) {
		this.#productsBase = db.products;
		this.#config = db.config;
		this.#provider = provider;

		this.#products = db.initialStore.map(product => {
			let {initialPrice, pack} = this.#productsBase[product.id - 201];
			return({
				id: product.id,
				amount: product.amount,
				pack,
				expiryDate: product.expiryDate,
				initialPrice,
				margin: product.margin,
				price: Math.round(initialPrice * (1 + product.margin / 100))
			})
		}); 

		this.#orderList = [];
		this.#departures = [];
		this.#scrappedProducts = [];
		this.#expectedDeliveries = [];
		this.#providerOrders = [];

		this.#morningPropucts = this.#products;
		this.#morningOrders   = this.#orderList;
		this.#statisticList   = this.#productsBase.map(item => new StatisticItem(item.id));
	}
//  ----- Constructor ----- //

//  ----- External Interactions ----- //
	acceptOrder = (order) => { // принять заказ от поставщика
		const {id, initialPrice, expiryDate, margin, pack} = this.#productsBase[order.id - 201];

		this.#products = [
			...this.#products,
			{
				id,
				amount: order.amount,
				pack,
				expiryDate,
				initialPrice,
				margin,
				price: Math.round(initialPrice * (1 + margin / 100))
			}
		]

		this.#expectedDeliveries = this.#expectedDeliveries.map(item => {
			return item.id == id ? {...item, amount: item.amount - order.amount} : item;
		}).filter(item => item.amount > 0);
	}

	newOrder = (retailer, order) => { // принять заявку на заказ потребителя
		this.#orderList = [...this.#orderList, {retailer: retailer, order: order}];
	} 

//  ----- External Interactions ----- //
	

//  ----- Private ----- //

	#collectStatistic = () => { // собрать статистику по дню
		this.#statisticList = this.#productsBase.map(item => new StatisticItem(item.id));

		this.#morningOrders.map(item => 
			item.order.map(({id, amount}) => {
				let stat = this.#statisticList[id - 201];
				stat.orderAmount = stat.orderAmount + amount;
			})	
		);

		this.#departures.map(({id, amount, price}) => {
			let stat = this.#statisticList[id - 201];
			stat.departuresAmount = stat.departuresAmount + amount * this.#productsBase[id - 201].pack;
			stat.totalCost = stat.totalCost + price * amount * this.#productsBase[id - 201].pack;
			stat.profitCost = stat.profitCost + (price - this.#productsBase[id - 201].initialPrice) * amount * this.#productsBase[id - 201].pack;
			
		})

		this.#scrappedProducts.map(({id, amount, sum}) => {
			let stat = this.#statisticList[id - 201];
			stat.totalLosses = stat.totalLosses + sum;
			stat.lossesAmount = stat.lossesAmount + amount * this.#productsBase[id - 201].pack;
		})
	}

	#updateExpiryDate = () => { // обновить значение срока годности продукта 
		this.#products = this.#products.map(
			product => ({
				...product,
				expiryDate: product.expiryDate - 1
			})
		)
	}

	#writeOf = () => { // удаление просрочки
		this.#scrappedProducts = this.#products.filter(product => product.expiryDate == 0).map(({id, amount, initialPrice, pack}) => ({id, amount,initialPrice, sum: pack * amount * initialPrice}));

		this.#products = this.#products.filter(product => product.expiryDate > 0);
	}

	#margin = () => { // уценка, каждый день меньше 3 маржа уменьшается
		this.#products = this.#products.map(product => {
			if(product.expiryDate < 3) {
				let {initialPrice} = this.#productsBase[product.id - 201];
				let margin = product.expiryDate * 10 - 10;
				return(
					{
						...product,
						margin,
						price: Math.round(initialPrice * (1 + margin / 100))
					}
				)
			} else {
				return(product);
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
			if(a.id < b.id) {
				return(-1);
			} 
			if(a.id == b.id) {
				return(a.expiryDate - b.expiryDate);
			}
			return(1);
		});
	}

	#getList = (parent) => {
		return parent.reduce((res, item) => { // список заявок на поставки
			const newOrders = item.order.map(
				order => ({
					id: order.id,
					retailer: item.retailer.getId(),
					amount: order.amount,
				})
			)
			return([...res, ...newOrders])
		}, []) 
	}	

	#calcProductAmount = (id) => this.#findProductbyId(id).reduce((res, {amount}) => res + amount, 0);

	#complianceMin = () => { // поддержание минимального кол-ва продукции
		this.#config.map(({id, min, limit}) => {
			const curAmount = this.#calcProductAmount(id);
			const dev = min - curAmount;
			const expectedAmount = this.#calcExpectedAmount(id);
			
			if(dev > 0) { // кол-во товара меньше установленного минимума
				const orderAmount = Math.min(dev, limit - expectedAmount);
				if(orderAmount > 0) {
					this.#providerOrders = [...this.#providerOrders, new Order(id, orderAmount)];
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
				{
					id: order.id, 
					amount: expectedAmount + order.amount
				}
			]
		});
	}

	#calcExpectedAmount = (id) => { 
		const expectedDelivery = this.#expectedDeliveries.find(item => item.id == id);
		return(expectedDelivery == undefined ? 0 : expectedDelivery.amount);
	};	

	#removeFromList = (list, i) => {
		return list.filter((item,index) => i != index);
	}

	#tryStore = (order, retailer) => {
		const {id, amount} = order;   
		let roundAmount = Math.max(Math.round(amount / this.#productsBase[id - 201].pack), 1); 
		this.#products = this.#products.map((item, index) => {
			if(item.id == id && roundAmount > 0 && item.amount > 0) {
				if(roundAmount >= item.amount) {
					this.#departures = [...this.#departures, {
						id: order.id,
						retailer: retailer,
						amount: item.amount,
						price: item.price,
						from: index
					}]

					roundAmount = roundAmount - item.amount
					return({ // полностью отправили какую-то партию товара покупателю
						...item,
						amount: 0
					})
				} else {
					this.#departures = [...this.#departures, {
						id: order.id,
						retailer: retailer,
						amount: roundAmount,
						price: item.price,
						from: index
					}]
					
					let newAmount = item.amount - roundAmount;
					roundAmount = 0;

					return({
						...item,
						amount: newAmount
					})
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
		this.#orderList = [];                    // сбрасываем заказы от торговых точек
		updateShortUI(this);                     // обновляем упрощенный интерфейс
	}

	processOrders = () => {
		this.#morningOrders = this.#orderList;   // обновляем отображаемые заказы от торговых точек
		this.#departures = [];                   // сбрасываем отправления торговым точкам

		this.#statisticList = db.products.map(item => new StatisticItem(item.id)); // сбрасываем статистику
		
		this.#orderList.map(orderListItem => { // проходимся по списку заказов и отправляем все что можем
			orderListItem.order.map(order => {
				this.#tryStore(order, orderListItem.retailer.getId());
			});
		});

		this.#updateExpiryDate(); // обновление срока годности
		this.#collectStatistic(); // сбор статистики
		this.#margin(); 		  // автоматическая уценка
		this.#complianceMin();    // поддержание минимального кол-ва товара на складе
		this.#orderList = [];     // сброс списка заказов
		updateUI(this);           // обновление интерфейса
	}

	acceptOrder = (order) => { // принять заказ от поставщика
		const {id, initialPrice, expiryDate, margin, pack} = this.#productsBase[order.id - 201];

		this.#products = [
			...this.#products,
			{
				id,
				amount: order.amount,
				pack,
				expiryDate,
				initialPrice,
				margin,
				price: Math.round(initialPrice * (1 + margin / 100))
			}
		]

		this.#expectedDeliveries = this.#expectedDeliveries.map(item => {
			return item.id == id ? {...item, amount: item.amount - order.amount} : item;
		}).filter(item => item.amount > 0);
	}

	newOrder = (retailer, order) => { // принять заявку на заказ потребителя
		this.#orderList = [...this.#orderList, {retailer: retailer, order: order}];
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
		this.#morningPropucts[i] = {
			...this.#morningPropucts[i],
			margin: value,
			price: Math.round(this.#morningPropucts[i].initialPrice * (1 + value / 100))
		}

		this.#products[i] = {
			...this.#products[i],
			margin: value,
			price: Math.round(this.#products[i].initialPrice * (1 + value / 100))
		}

		updateShortUI(this);
	}	
//  ----- Public ----- //

//  ----- Getters ----- //
	getStatistic = () => this.#statisticList; // получить полную статистику 
 
	getShortStat = () => {  // получить краткую статистику по дню
		const profit = this.#statisticList.reduce((res, {profitCost}) => res + profitCost, 0);
		const losses = this.#statisticList.reduce((res, {totalLosses}) => res + totalLosses, 0);
		return(
			[{
				volume: this.#statisticList.reduce((res, {totalCost}) => res + totalCost, 0),
				profit,
				losses, 
				result: profit - losses 
			}]
		)
	}

	getProducts = () => this.#morningPropucts;               // получить продукты к началу дня
	getScrappedProducts = () => this.#scrappedProducts;      // получить списанные продукты
	getOrderList = () => this.#getList(this.#morningOrders); // получить список заказов от торговых точек
	getDepartures = () => this.#departures.map(({id,retailer,amount, price}) => ({id,retailer,amount,price})); // получить список перевозок
	getProviderOrders = () => this.#providerOrders;          // получить список заказов фирме поставщику
	getExpectedDeliveries = () => this.#expectedDeliveries.sort((a,b) => (a.id - b.id)); // получить список ожидаемых поставок от фирмы поставщика
//  ----- Getters ----- //
}
;
class Tester {
//  ----- Private Var ----- //
	#store;    				// экземпляр класса склада
	#provider; 				// фирма поставщик
	#retailers;             // торговые точки
	#currentDay;            // счетчик текущего дня эксперимента
	#db;                    // данные о товарах
	#days;                  // кол-во дней моделирования
	#retailersAmount;       // кол-во торговых точек
	#productsAmount;        // кол-во видов продуктов
	#history;               // история по дням
	#result;                // итоги эксперимента
//  ----- Private Var ----- //

//  ----- Constructor ----- //
	constructor(db, days, retailersAmount, productsAmount) {
		const newDb = {
			products: db.products.filter(item => item.id <= 200 + productsAmount).sort((a,b) => a.id - b.id),
			config: db.config.filter(item => item.id <= 200 + productsAmount),
			initialStore: db.initialStore.filter(item => item.id <= 200 + productsAmount)
		}

		this.#db = newDb;
		this.#provider = new Provider();
		this.#store = new Store(this.#db, this.#provider);
		this.#days = days;
		this.#retailersAmount = retailersAmount; 
		this.#productsAmount = productsAmount;
		this.#currentDay = 0;
		this.#history = [];
		
		this.#result = {
			stat: newDb.products.map((item) => new StatisticItem(item.id)), 
			short: [{
				volume: 0,
				profit : 0,
				losses: 0, 
				result: 0
			}]
		};
		
		this.#retailers = new Array(retailersAmount).fill(0).map((item, i) => new Retailer({provider:this.#store, id: 101 + i}));
		
		nextBtn.classList.remove('hide');
		this.nextStep();
	}
//  ----- Constructor ----- //

// Private
	#generateOrders = () => {
		const retailersIndex = getRandomArray(0, this.#retailersAmount - 1, getRandomInt(1, this.#retailersAmount));   // генерируем точки которые будут совершать заказ
		retailersIndex.forEach(index => {
			const orderList = getRandomArray(201, 200 + this.#productsAmount, getRandomInt(1, this.#productsAmount)).map(
				id => new Order(id, getRandomInt(10, 300))
			);

			this.#retailers[index].makeOrder(orderList);
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
					orderAmount,
					departuresAmount, 
					lossesAmount, 
					totalCost, 
					profitCost, 
					totalLosses 
				} = this.#result.stat[item.id - 201]

				this.#result.stat[item.id - 201] = {
					id,
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
	tester.nextStep();
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

	tester = new Tester(db, days, retailersAmount, productsAmount);
});

getOrdersBtn.addEventListener('click', () => {
	tester.makeOrders();
})

resultsBtn.addEventListener('click', () => {
	experiment.classList.add('hide');
	results.classList.remove('hide');
	
	tester.updateHistory();
	tester.calcResult();
	
	drawHistory(historyResult, tester.getResult())
	drawHistory(historyByDay, tester.getHistory());
})
;