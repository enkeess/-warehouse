class Store { // склад

//  ----- Private Var ----- //
	#productsBase;          // бд продуктов
	#config;                // конфигурация склада
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
		this.#config = db.config;
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
		this.#statisticList   = this.#productsBase.map(item => new StatisticItem({id:item.id}));

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
		this.#statisticList = this.#productsBase.map(item => new StatisticItem({id: item.id}));

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
			if(a.id < b.id) {
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
		this.#config.map(({id, min, limit}) => {
			const curAmount = this.#calcProductAmount(id);
			const dev = min - curAmount;
			const expectedAmount = this.#calcExpectedAmount(id);
			
			if(dev > 0) { // кол-во товара меньше установленного минимума
				const amount = Math.min(dev, limit - expectedAmount);
				if(amount > 0) {
					this.#providerOrders = [...this.#providerOrders, new Order({id, amount})];
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
		return list.filter((item,index) => i != index);
	}

	#tryStore = (retailerOrder) => {
		
		const {id, retailerId} = retailerOrder; 
		let {amount} = retailerOrder;

		let roundAmount = Math.max(Math.round(amount / this.#productsBase[id - 201].pack), 1); 
		this.#products = this.#products.map((item, index) => {
			if(item.id == id && roundAmount > 0 && item.amount > 0) {
				if(roundAmount >= item.amount) {
					this.#departures = [...this.#departures, {
						id,
						retailer: retailerId,
						amount: item.amount,
						price: item.price,
						from: index
					}]

					roundAmount = roundAmount - item.amount
					return( // полностью отправили какую-то партию товара покупателю
						new StoreProduct({...item, amount: 0})
					)
				} else {
					this.#departures = [...this.#departures, {
						id,
						retailer: retailerId,
						amount: roundAmount,
						price: item.price,
						from: index
					}]
					
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
		return this.#morningPropucts.map(({id,amount, pack, expiryDate, initialPrice, margin, price}) => (
				{id,amount, pack, expiryDate, initialPrice, margin, price}
			));
	} 

	getScrappedProducts = () => this.#scrappedProducts;      // получить списанные продукты
	
	getOrderList = () => {	                                 // получить список заказов от торговых точек
		return this.#morningOrders.map(({id, retailerId, amount}) => (
			{id, retailerId, amount}
		));
	}
	getDepartures = () => this.#departures.map(({id,retailer,amount, price}) => ({id,retailer,amount,price})); // получить список перевозок
	getProviderOrders = () => this.#providerOrders;          // получить список заказов фирме поставщику
	getExpectedDeliveries = () => this.#expectedDeliveries.sort((a,b) => (a.id - b.id)); // получить список ожидаемых поставок от фирмы поставщика
//  ----- Getters ----- //
}
