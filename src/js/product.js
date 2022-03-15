class Product { // оптовая упаковка единицы товара

	#title;
	#initialPrice;
	#expiryDate;

	constructor(title) {
		const product = dataBase.products.find(item => item.title == title);

		this.#title = product.title; //название
		this.#expiryDate = product.expiryDate; //срок годности с даты получения
		this.#initialPrice = product.initialPrice; //исходная цена
		
	}

	#discountFactor = () => 1; // функция уценки от дня 
	#withDiscountPrice() { // функция подсчитывает цену продукта едниницы продукта
		return(this.#initialPrice * this.#discountFactor());
	}

	getTitle = () => this.#title;
	getPrice = (date) => this.#withDiscountPrice(); // возвращает цену с учетом уценки
}