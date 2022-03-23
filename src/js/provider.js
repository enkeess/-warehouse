class Provider {
	#orderList;
	#minDispatchTime;
	#maxDispatchTime;

	constructor({minDispatchTime, maxDispatchTime}) {
		this.#orderList = []
		this.#minDispatchTime = minDispatchTime;
		this.#maxDispatchTime = maxDispatchTime
	}

	newOrder = (order) => {
		this.#orderList = [ 
			...this.#orderList,  
			{
				order: order, 
				leadTime: getRandomInt(this.#minDispatchTime, this.#maxDispatchTime)
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
		readyOrders.map(item => consumer.acceptOrder(item.order));              // отправка заказов потребителю
	}
}