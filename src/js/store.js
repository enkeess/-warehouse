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
	#productsBase;
	#config;
	#profitFactor = 1.2; // наценка 
	#provider;

	#volume = 0;
	#profitDay = 0;
	#losses;
	#profitAll = 0;
	#statisticList = [];

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

		console.log(this.#statisticList);
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

		console.log(this.#statisticList);

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

		console.log(this.#statisticList);

		this.#profitAll = this.#profitAll + this.#profitDay - this.#losses;
		this.#orderList = []; // сброс списка заказов
	}

	getStatistic = () => this.#morningStatisticList;

	getShortStat = () => {
		return(
			[{
				volume: this.#morningStatisticList.reduce((res, {totalCost}) => res + totalCost, 0),
				profit: this.#morningStatisticList.reduce((res, {profitCost}) => res + profitCost, 0),
				losses: this.#morningStatisticList.reduce((res, {totalLosses}) => res + totalLosses, 0),
			}]
		)
	}

	#collectStatistic = () => {
		this.#orderList.map(item => 
			item.order.map(({id, amount}) => {
				let stat = this.#statisticList[id - 201];
				stat.orderAmount = stat.orderAmount + amount;
			})	
		);

		this.#departures.map(({id, amount, price}) => {
			let stat = this.#statisticList[id - 201];
			stat.departuresAmount = stat.departuresAmount + amount;
			stat.totalCost = stat.totalCost + price * amount;
			stat.profitCost = stat.profitCost + (price - this.#productsBase.getProductbyId(id).initialPrice) * amount;
		})

		this.#products.filter(item => item.expiryDate == 0).map(({id, amount, initialPrice}) => {
			let stat = this.#statisticList[id - 201];
			stat.totalLosses = stat.totalLosses + amount * initialPrice;
			stat.lossesAmount = stat.lossesAmount + amount;
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

		

	getProducts = () => this.#morningPropucts.sort((a, b) => { // получить список продуктов на складе
		if(a.id < b.id) {
			return(-1);
		} 
		if(a.id == b.id) {
			return(a.expiryDate - b.expiryDate);
		}
		return(1);
	});

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

	getLosses = () => this.#losses;
	getVolume = () => this.#volume;
	getProfitDay = () => this.#profitDay;
	getProfitAll = () => this.#profitAll;
}


// нужно добавить сбор статистики по продажам/заявкам за день