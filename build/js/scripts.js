// Custom Scripts
import db from '../data/product-base.json' assert { type: "json" };;
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
;
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
};

function Order(id, amount) {
	this.id = id;
	this.amount = amount;
}

// просто функция конструктор;
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
		readyOrders.map(item => consumer.getOrder(item.order));                 // отправка заказов потребителю
	}
}

;
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

let products = db.products;

const getProductbyId = (id) => {
	return(products.find(product => product.id == id));
}

class ProductsBase { // база имеющихся у поставщиков продуктов и закупочных цен на них
	#products;
	
	constructor(products) {
		this.#products = products
	}

	getProductbyId = (id) => {
		return(this.#products.find(product => product.id == id));
	}
}


class Statistic {
	list;           // [StatisticDay]
}

class StatisticDay {
	day;            // number
	statisticsList; // [StatisticItem]
}

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
	#products;
	#scrappedProducts;
	#productsBase;
	#config;
	#profitFactor = 1.2; // наценка 
	#provider;

	#volume = 0;
	#profitDay = 0;
	#losses;
	#profitAll = 0;
	#statisticList = [];
	#result = [];

	#morningPropucts;
	#morningOrders;
	#morningStatisticList = [];

	
	constructor(db, provider) {
		this.#productsBase = new ProductsBase(db.products);
		this.#config = db.config;
		this.#products = db.initialStore.map(product => {
			let {initialPrice} = this.#productsBase.getProductbyId(product.id);
			return({
				...product,
				initialPrice:initialPrice,
				profit: Math.round((this.#profitFactor - 1) * 100),
				sale: '-',
				price: Math.round(initialPrice * this.#profitFactor)
			})

		}); 
		this.#provider = provider;
		this.#morningPropucts = this.#products;
		this.#morningOrders = this.#orderList;
		this.#statisticList = db.products.map(item => new StatisticItem(item.id));
		this.#result = db.products.map(item => new StatisticItem(item.id));
		this.#scrappedProducts = [];
	}

	#orderList = []; // список заказов от точек
	#departures = []; // список отправлений точкам

	getOrder = (order) => { // принять заказ от поставщика
		const {id, initialPrice, expiryDate} = this.#productsBase.getProductbyId(order.id);

		this.#products = [
			...this.#products,
			{
				id: id,
				amount: order.amount,
				expiryDate: expiryDate,
				initialPrice: initialPrice,
				profit: Math.round((this.#profitFactor - 1) * 100),
				sale: '-',
				price: Math.round(initialPrice * this.#profitFactor)
			}
		]

		this.#expectedDeliveries = this.#expectedDeliveries.map(item => {
			return item.id == id ? {...item, amount: item.amount - order.amount} : item;
		}).filter(item => item.amount > 0);
	}

	newOrder = (retailer, order) => { // принять заявку на заказ потребителя
		this.#orderList = [...this.#orderList, {retailer: retailer, order: order}];
	} 
	
	newDay = () => {
		this.#morningPropucts = this.#products;
		this.#morningOrders = this.#orderList;		
		this.#departures = [];
		this.#volume = 0;
		this.#profitDay = 0;

		this.#statisticList = db.products.map(item => new StatisticItem(item.id));
		
		this.#orderList.map(orderListItem => { // проходимся по списку заказов и отправляем все что можем
			orderListItem.order.map(order => {
				this.#tryStore(order, orderListItem.retailer.getId());
			});
		});

		this.#updateExpiryDate(); // обновление срока годности
		
		this.#collectStatistic(); // сбор статистики
		
		this.#morningStatisticList = this.#statisticList.filter(({orderAmount}) => orderAmount > 0);

		this.#writeOf(); // списание продуктов
		this.#sale();

		this.#complianceMin();


		this.#profitAll = this.#profitAll + this.#profitDay - this.#losses;
		this.#orderList = []; // сброс списка заказов
	}

	getStatistic = () => this.#morningStatisticList;

	getResult = () => this.#result;

	getShortRes = () => {
		const profit = this.#result.reduce((res, {profitCost}) => res + profitCost, 0);
		const losses = this.#result.reduce((res, {totalLosses}) => res + totalLosses, 0);
		return(
			[{
				volume: this.#result.reduce((res, {totalCost}) => res + totalCost, 0),
				profit,
				losses,
				result: profit - losses
			}]
		)
	}

	getShortStat = () => {
		const profit = this.#morningStatisticList.reduce((res, {profitCost}) => res + profitCost, 0);
		const losses = this.#morningStatisticList.reduce((res, {totalLosses}) => res + totalLosses, 0);
		return(
			[{
				volume: this.#morningStatisticList.reduce((res, {totalCost}) => res + totalCost, 0),
				profit,
				losses, 
				result: profit - losses 
			}]
		)
	}

	#collectStatistic = () => {
		this.#orderList.map(item => 
			item.order.map(({id, amount}) => {
				let stat = this.#statisticList[id - 201];
				stat.orderAmount = stat.orderAmount + amount;

				let res = this.#result[id - 201];
				res.orderAmount = res.orderAmount + amount;
			})	
		);

		this.#departures.map(({id, amount, price}) => {
			let stat = this.#statisticList[id - 201];
			stat.departuresAmount = stat.departuresAmount + amount;
			stat.totalCost = stat.totalCost + price * amount;
			stat.profitCost = stat.profitCost + (price - this.#productsBase.getProductbyId(id).initialPrice) * amount;
			
			let res = this.#result[id - 201];
			res.departuresAmount = stat.departuresAmount + amount;
			res.totalCost = res.totalCost + price * amount;
			res.profitCost = res.profitCost + (price - this.#productsBase.getProductbyId(id).initialPrice) * amount;
			
		})

		this.#products.filter(item => item.expiryDate == 0).map(({id, amount, initialPrice}) => {
			let stat = this.#statisticList[id - 201];
			stat.totalLosses = stat.totalLosses + amount * initialPrice;
			stat.lossesAmount = stat.lossesAmount + amount;

			let res = this.#result[id - 201];
			res.totalLosses = res.totalLosses + amount * initialPrice;
			res.lossesAmount = res.lossesAmount + amount;
		})
	}

	#tryStore = (order, retailer) => {
		let {amount} = order; // кол-во товара в ордере
		const product = this.getProductbyId(order.id); // получили все партии данного продукта
		const exceptProducts = this.getProductExceptById(order.id);

		const newProduct = product.map(item => {
			if(amount >= item.amount) {
				this.#departures = [...this.#departures, {
					id: order.id,
					retailer: retailer,
					amount: item.amount,
					price: item.price,
				}]

				// сбор статистики
				this.#volume = this.#volume + item.amount * item.price;
				this.#profitDay = this.#profitDay + item.amount * (item.price - item.initialPrice);
				
				amount = amount - item.amount
				return({ // полностью отправили какую-то партию товара покупателю
					...item,
					amount: 0
				})
			} else {
				if(amount > 0) {
					this.#departures = [...this.#departures, {
						id: order.id,
						retailer: retailer,
						amount: amount,
						price: item.price
					}]

					// сбор статистики
					this.#volume = this.#volume + amount * item.price;
					this.#profitDay = this.#profitDay + amount * (item.price - item.initialPrice);
				}
				let newAmount = item.amount - amount;
				amount = 0;
				return({
					...item,
					amount: newAmount
				})
			}
		}).filter(item => item.amount > 0);

		this.#products = [...exceptProducts, ...newProduct];
	}

	#updateExpiryDate = () => { // обновить значение кол-ва продукта 
		this.#products = this.#products.map(
			product => (
				{
					...product,
					expiryDate: product.expiryDate - 1
				}
			)
		)
	}

	#writeOf = () => { // удаление просрочки
		this.#scrappedProducts = this.#products.filter(product => product.expiryDate == 0)
		this.#losses = this.#scrappedProducts.reduce((res, {initialPrice, amount}) => res + initialPrice * amount, 0);
		this.#products = this.#products.filter(product => product.expiryDate > 0);
	}

	#sale = () => { // уценка, каждый день меньше 3 маржа уменьшается
		this.#products = this.#products.map(product => {
			if(product.expiryDate < 3) {
				let {initialPrice} = this.#productsBase.getProductbyId(product.id);
				let sale = product.expiryDate * 10 - 10;
				return(
					{
						...product,
						sale: sale,
						price: Math.round(initialPrice * (1 + sale / 100))
					}
				)
			} else {
				return(product);
			}
		});
	}

	getProductbyId = (id) => {
		return(this.#products.filter(product => product.id == id));
	}

	getProductExceptById = (id) => {
		return(this.#products.filter(product => product.id != id));
	}

	getProducts = () => this.#morningPropucts.sort((a, b) => { // получить список продуктов на складе
		if(a.id < b.id) {
			return(-1);
		} 
		if(a.id == b.id) {
			return(a.expiryDate - b.expiryDate);
		}
		return(1);
	});

	getScrappedProducts = () => this.#scrappedProducts;

	getOrderList = () => this.#getList(this.#morningOrders);

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
	}, []) }

	getDepartures = () => this.#departures;

	getProductAmount = (id) => this.getProductbyId(id).reduce((res, {amount}) => res + amount, 0);

	#complianceMin = () => { // поддержание минимального кол-ва продукции
		this.#config.map(({id, min, limit}) => {
			
			const curAmount = this.getProductAmount(id);
			const dev = min - curAmount;
			const expectedAmount = this.getExpectedAmount(id);
			

			if(dev > 0) { // кол-во товара меньше установленного минимума
				const orderAmount = Math.min(dev, limit - expectedAmount);
				if(orderAmount > 0) {
					this.#provider.newOrder(new Order(id, orderAmount));
				}
				this.#expectedDeliveries = [
					...this.#expectedDeliveries.filter(item => item.id != id),
					{
						id: id, 
						amount: expectedAmount + orderAmount
					}
				]
			}
		})
	}

	#expectedDeliveries = []; // ожидаемые поставки
	getExpectedDeliveries = () => this.#expectedDeliveries.sort((a,b) => (a.id - b.id));	
	
	getExpectedAmount = (id) => {
		const expectedDelivery = this.#expectedDeliveries.find(item => item.id == id);
		return(expectedDelivery == undefined ? 0 : expectedDelivery.amount);
	};
}
;
// переписать класс на основе main.js 

// добавить генерацию ордеров для ритейлеров

class Tester {

	#store; // экземпляр класса склада
	#provider = new Provider(); // фирма поставщик
	#retailers; // торговые точки
	
	#currentDay;

	#db; // данные о товарах

	#days; // кол-во дней моделирования
	#retailersAmount; // кол-во торговых точек
	#productsAmount;  // кол-во видов продуктов

	#history = []; // история по дням
	#result = [];  // итоги эксперимента

	constructor(db, days, retailersAmount, productsAmount) {
		const newDb = {
			products: db.products.filter(item => item.id <= 200 + productsAmount),
			config: db.config.filter(item => item.id <= 200 + productsAmount),
			initialStore: db.initialStore.filter(item => item.id <= 200 + productsAmount)
		}

		this.#db = newDb;
		this.#store = new Store(this.#db, this.#provider);
		this.#days = days;
		this.#retailersAmount = retailersAmount; 
		this.#productsAmount = productsAmount;
		this.#currentDay = 0;
		this.#history = [];
		this.#retailers = new Array(retailersAmount).fill(0).map((item, i) => new Retailer({provider:this.#store, id: 101 + i}));
		
		nextBtn.classList.remove('hide');
		updateUI(this.#store);
		this.nextStep();
	}

	getRetailers = () => this.#retailers;

	nextStep = () => {
		this.#generateOrders();
		this.#provider.sendOrder(this.#store);
		this.#store.newDay();
		this.#currentDay = this.#currentDay + 1;

		this.#history = [...this.#history, {
			day: this.#currentDay, 
			stat: this.#store.getStatistic(),
			short: this.#store.getShortStat()
		}]
			
		updateUI(this.#store);
		updateCounter(this.#currentDay, this.#days);
		if(this.#currentDay == this.#days) {
			this.#calcResult();
			nextBtn.classList.add('hide');
			resultsBtn.classList.remove('hide')
		}
	}

	#generateOrders = () => {
		const retailersIndex = getRandomArray(0, this.#retailersAmount - 1, getRandomInt(1, this.#retailersAmount));   // генерируем точки которые будут совершать заказ
		retailersIndex.forEach(index => {
			const orderList = getRandomArray(201, 200 + this.#productsAmount, getRandomInt(1, 5)).map(
				id => new Order(id, getRandomInt(10, 30))
			);

			this.#retailers[index].makeOrder(orderList);
		})
	}
	
	#calcResult = () => {
		this.#history.forEach(item => {
			console.log(item.stat)
		})
	}

	getCurrentDay = () => this.#currentDay;

	getHistory = () => this.#history;
	getResult = () => [{stat: this.#store.getResult(), short: this.#store.getShortRes()}];
}


;
"use strict";

let days = +form.days.value;
let productsAmount = +form.productsAmount.value;
let retailersAmount = +form.retailersAmount.value;

let tester;

nextBtn.classList.add('hide');

nextBtn.addEventListener('click', ()=>{
	tester.nextStep();
})

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


resultsBtn.addEventListener('click', () => {
	experiment.classList.add('hide');
	results.classList.remove('hide');
	console.log(tester.getHistory());
	drawHistory(historyResult, tester.getResult())
	drawHistory(historyByDay, tester.getHistory());
})


// что блять мне еще надо сделать
// да дохуя чего еще
// надеюсь завтра это закончится


;
