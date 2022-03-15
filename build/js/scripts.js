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
};

class Product { // оптовая упаковка единицы товара

	#title;
	#initialPrice;
	#expiryDate;

	constructor(title) {
		const product = dataBase.products.find(item => item.title == title);

		this.#title = product.title; //название
		this.#expiryDate = product.expiryDate; //срок годности с даты получения
		this.#initialPrice = product.initialPrice; //исходная цена
		
	}

	#discountFactor = () => 1; // функция уценки от дня 
	#withDiscountPrice() { // функция подсчитывает цену продукта едниницы продукта
		return(this.#initialPrice * this.#discountFactor());
	}

	getTitle = () => this.#title;
	getPrice = (date) => this.#withDiscountPrice(); // возвращает цену с учетом уценки
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

class Store { // склад
	#products;
	#productsBase;
	#profitFactor = 1.2; // наценка 
	#provider;

	#volume = 0;
	#profitDay = 0;
	#losses;
	#profitAll = 0;

	#morningPropucts;

	constructor(db, provider) {
		this.#productsBase = new ProductsBase(db.products);
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
			console.log(item);
			return item.id == id ? {...item, amount: item.amount - order.amount} : item;
		}).filter(item => item.amount > 0);
	}

	newOrder = (retailer, order) => { // принять заявку на заказ потребителя
		console.log(`new order from ID:${retailer.getId()}`);

		this.#orderList = [...this.#orderList, {retailer: retailer, order: order}];
	} 
	
	newDay = () => {
		this.#morningPropucts = this.#products;		
		this.#departures = [];
		this.#volume = 0;
		this.#profitDay = 0;

		this.#orderList.map(orderListItem => { // проходимся по списку заказов и отправляем все что можем
			orderListItem.order.map(order => {
				this.#tryStore(order, orderListItem.retailer.getId());
			})
		})

		// this.#orderList = []; // отправили все что смогли

		this.#updateExpiryDate();
		this.#writeOf();
		this.#sale();

		this.#complianceMin();

		this.#profitAll = this.#profitAll + this.#profitDay - this.#losses;
		// тут надо дозаказать до установленного лимита
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
		this.#losses = this.#products.filter(product => product.expiryDate == 0).reduce((res, {initialPrice, amount}) => res + initialPrice * amount, 0);
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

	sendOrder = (retailer, order) => console.log('send order in store'); // отправить заказ потребителю

	getProducts = () => this.#morningPropucts.sort((a, b) => { // получить список продуктов на складе
		if(a.id < b.id) {
			return(-1);
		} 
		if(a.id == b.id) {
			return(a.expiryDate - b.expiryDate);
		}
		return(1);
	});

	getOrderList = () => 
		{
			const orderList = this.#getList(this.#orderList)
			this.#orderList = [];
			return(orderList);
		};

	#getList = (parent) => {
		console.log(parent);
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
		db.config.map(({id, min, limit}) => {
			
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

	getLosses = () => this.#losses;
	getVolume = () => this.#volume;
	getProfitDay = () => this.#profitDay;
	getProfitAll = () => this.#profitAll;
}


// добавить сбор статистики о продажах/прибыли/максимально-возможной-прибыли;

class Tester {
	#store = new Store(db);
	#currentDay = 1;
	#days = 30;

	#hystory; // объект который хранит состояние стейта стора по дням

	#relailers = [
		new Retailer({provider: this.#store, id: 100}),
		new Retailer({provider: this.#store, id: 101}),
		new Retailer({provider: this.#store, id: 102}),
		new Retailer({provider: this.#store, id: 103}),
	]

	getStore = () => this.#store;
	getCurrentDay = () => this.#currentDay;
	
	prevStep = () => {
		if(this.#currentDay > 1) {
			this.#currentDay = this.#currentDay - 1;
			this.#updateData();
		}
	}

	nextStep = () => {
		if(this.#currentDay < this.#days) {
			this.#currentDay = this.#currentDay + 1;
			this.#updateData();
		}
	}

	#updateData = () => console.log('update data');
}

// переписать класс на основе main.js 

// добавить генерацию ордеров для ритейлеров

class Tester1 {

	#store; // экземпляр класса склада
	#provider = new Provider(); // фирма поставщик
	#retailers; // торговые точки
	
	#currentDay;

	#db; // данные о товарах

	#days; // кол-во дней моделирования
	#retailersAmount; // кол-во торговых точек
	#productsAmount;  // кол-во видов продуктов

	constructor(db, days, retailersAmount, productsAmount) {
		this.#db = db;
		this.#store = new Store(this.#db, this.#provider);
		this.#days = days;
		this.#retailersAmount = retailersAmount; 
		this.#productsAmount = productsAmount;
		this.#currentDay = 0;
		this.#retailers = new Array(retailersAmount).fill(0).map((item, i) => new Retailer({provider:this.#store, id: 101 + i}));
		updateUI(this.#store);
	}

	getRetailers = () => this.#retailers;

	nextStep = () => {
		this.#generateOrders();
		this.#provider.sendOrder(this.#store);
		this.#store.newDay();
		this.#currentDay = this.#currentDay + 1;
		updateUI(this.#store);
	}

	#generateOrders = () => {
		const retailersIndex = getRandomArray(0, this.#retailersAmount - 1, getRandomInt(1, this.#retailersAmount));   // генерируем точки которые будут совершать заказ
		retailersIndex.forEach(index => {
			const orderList = getRandomArray(201, 200 + this.#productsAmount, getRandomInt(1, 5)).map(
				id => new Order(id, getRandomInt(10, 30))
			);
			console.log('order-list: ')
			console.log(orderList);
			this.#retailers[index].makeOrder(orderList);
		})
	}
	
	// getCurrentDay = () => this.#currentDay;
	getCurrentDay = () => this.#currentDay;
}


// console.log(pop.getRetailers());

// pop.generateOrders();

;
"use strict";
// // Custom scripts

// // import dataBase from '../data/product-base.json' assert { type: "json" };;



// const tester = new Tester();
// const provider = new Provider();
// const store = new Store(db, provider);
// // provider.setConsumer(store);

// const retailer101 = new Retailer({provider: store, id:101});
// const retailer102 = new Retailer({provider: store, id:102});

// retailer101.makeOrder([
// 			new Order(201, 5),
// 			new Order(202, 10),
// 			new Order(204, 10),
// 			new Order(212, 10)
// 		]);

// retailer102.makeOrder([
// 			new Order(201, 25),
// 			new Order(202, 10),
// 			new Order(204, 10)
// 		]);

// const nextBtn = document.querySelector('#next');
// const counter = document.querySelector('.counter');

// const warehouseList = document.querySelector('#warehouse-list');
// const ordersList = document.querySelector('#orders-list');
// const departuresList = document.querySelector('#departures-list');
// const expectedList = document.querySelector('#expected-list');

// const drawTable = (parent, data) => {
// 	while (parent.firstChild) {
// 		parent.firstChild.remove();
// 	}

// 	let tableRows = data.map((node) => {
// 		let tableRow = document.createElement('li');
// 		tableRow.classList.add('table__line', 'table__item');
// 		for(let key in node) {
// 			let span = document.createElement('span');
// 			span.innerText = node[key];
// 			tableRow.append(span);
// 		}

// 		return(tableRow)
// 	})

// 	tableRows.forEach(item => parent.append(item));
// }

// const updateUI = (store) => {
// 	drawTable(ordersList, store.getOrderList());
// 	drawTable(warehouseList, store.getProducts());
// 	drawTable(departuresList, store.getDepartures());
// 	drawTable(expectedList, store.getExpectedDeliveries());
// }

const tester = new Tester1(db, 10, 5, 10);
tester.nextStep();

nextBtn.addEventListener('click', ()=>{

	tester.nextStep();
	
	counter.innerHTML = `${tester.getCurrentDay()} / 10`;
})


// updateUI();

// что блять мне еще надо сделать
// да дохуя чего еще
// надеюсь завтра это закончится


;
