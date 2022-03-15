
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

