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

