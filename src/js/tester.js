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
}