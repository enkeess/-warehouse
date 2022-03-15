class Retailer {
	#provider;
	#id;

	constructor({provider, id}) {
		this.#provider = provider; //поставщик
		this.#id = id
	}

	getId = () => this.#id; // получить id поставщика
	makeOrder = (order) => { // сделать заявку поставщику
		this.#provider.newOrder(this, order);} 
}