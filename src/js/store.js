
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
