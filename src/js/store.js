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


// добавить сбор статистики о продажах/прибыли/максимально-возможной-прибыли