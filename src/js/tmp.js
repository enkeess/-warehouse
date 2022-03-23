class Product {
	constructor({id}) {
		this.id = id;
	}
}

class Order extends Product {
	constructor({id, amount}) {
		super({id});
		this.amount = amount;
	}
}

class ProviderOrder extends Order {
	constructor({id, amount, leadtime}) {
		super({id, amount});
		this.leadtime = leadtime;
	}
}

class DbProduct extends Product {
	constructor({id, initialPrice, pack, expiryDate}) {
		super({id});
		this.initialPrice = initialPrice;
		this.pack = pack;
		this.expiryDate = expiryDate;
	}
}

class StoreProduct extends DbProduct {
	constructor({id, initialPrice, pack, expiryDate, margin, amount}) {
		super({id, initialPrice, pack, expiryDate});
		this.margin = margin;
		this.amount = amount;
		this.price = (1 + this.margin / 100) * initialPrice;
	}
}

class RetailerOrder {
	constructor(retailerId) {
		this.retailerId = retailerId;
		this.products = [];
	}
}

