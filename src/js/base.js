"use strict";

let days = 0;
let productsAmount = 0;
let retailersAmount = 0;
let minOrder = 0;
let maxOrder = 0;
let minDispatchTime = 0;
let maxDispatchTime = 0;
let db = {};
let ex = null;


class Product {
	id;
	constructor({id}) {
		this.id = id;
	}
}

class Order extends Product {
	amount;
	constructor({id, amount}) {
		super({id});
		this.amount = amount;
	}
}

class ProviderOrder extends Order {
	leadtime;
	constructor({id, amount, leadtime}) {
		super({id, amount});
		this.leadtime = leadtime;
	}
}

class DbProduct extends Product {
	initialPrice;
	pack;
	expiryDate;

	constructor({id, initialPrice, pack, expiryDate}) {
		super({id});
		this.initialPrice = initialPrice;
		this.pack = pack;
		this.expiryDate = expiryDate;
	}
}

class StoreProduct extends DbProduct {
	margin;
	amount;
	price;
	constructor({id, initialPrice, pack, expiryDate, margin, amount}) {
		super({id, initialPrice, pack, expiryDate});
		this.margin = margin;
		this.amount = amount;
		this.price = Math.round((1 + this.margin / 100) * initialPrice);
	}
}

class RetailerOrder extends Order {
	retailerId;
	constructor({id, amount, retailerId}) {
		super({id, amount});
		this.retailerId = retailerId;
	}
}

class Departure extends RetailerOrder {
	price;
	from;
	constructor({id, amount, retailerId, price, from}) {
		super({id, amount, retailerId});
		this.price = price;
		this.from = from;
	}
}


class StatisticItem {
	id;               // код товара
	orderAmount;      // объем заявок на поставки
	departuresAmount; // объем отгруженных заявок
	lossesAmount;     // объем списанных товаров
	totalCost;        // общая стоимость проданных товаров
	profitCost;       // чистая прибыль от продажи товаров
	totalLosses;      // общая потеря от списывания
	
	constructor({
		id, 
		orderAmount = 0, 
		departuresAmount = 0, 
		lossesAmount = 0, 
		totalCost = 0,
		profitCost = 0 
	}) {
		this.id = id;
		this.orderAmount = orderAmount;
		this.departuresAmount = departuresAmount;
		this.lossesAmount = lossesAmount;
		this.totalCost = totalCost;
		this.profitCost = profitCost;
		this.totalLosses = totalCost;
	}
}

class ShortStatisticItem {
	volume;
	profit;
	losses; 
	result;

	constructor({
		volume,
		profit = 0,
		losses = 0,
	}) {
		this.volume = volume ? volume : 0;
		this.profit = profit;
		this.losses = losses;
		this.result = this.profit - this.losses;
	}
}