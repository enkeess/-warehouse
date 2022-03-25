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
}