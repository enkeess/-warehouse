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


