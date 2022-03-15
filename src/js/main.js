"use strict";
// // Custom scripts

// // import dataBase from '../data/product-base.json' assert { type: "json" };;



// const tester = new Tester();
// const provider = new Provider();
// const store = new Store(db, provider);
// // provider.setConsumer(store);

// const retailer101 = new Retailer({provider: store, id:101});
// const retailer102 = new Retailer({provider: store, id:102});

// retailer101.makeOrder([
// 			new Order(201, 5),
// 			new Order(202, 10),
// 			new Order(204, 10),
// 			new Order(212, 10)
// 		]);

// retailer102.makeOrder([
// 			new Order(201, 25),
// 			new Order(202, 10),
// 			new Order(204, 10)
// 		]);

// const nextBtn = document.querySelector('#next');
// const counter = document.querySelector('.counter');

// const warehouseList = document.querySelector('#warehouse-list');
// const ordersList = document.querySelector('#orders-list');
// const departuresList = document.querySelector('#departures-list');
// const expectedList = document.querySelector('#expected-list');

// const drawTable = (parent, data) => {
// 	while (parent.firstChild) {
// 		parent.firstChild.remove();
// 	}

// 	let tableRows = data.map((node) => {
// 		let tableRow = document.createElement('li');
// 		tableRow.classList.add('table__line', 'table__item');
// 		for(let key in node) {
// 			let span = document.createElement('span');
// 			span.innerText = node[key];
// 			tableRow.append(span);
// 		}

// 		return(tableRow)
// 	})

// 	tableRows.forEach(item => parent.append(item));
// }

// const updateUI = (store) => {
// 	drawTable(ordersList, store.getOrderList());
// 	drawTable(warehouseList, store.getProducts());
// 	drawTable(departuresList, store.getDepartures());
// 	drawTable(expectedList, store.getExpectedDeliveries());
// }

const tester = new Tester1(db, 10, 5, 10);
tester.nextStep();

nextBtn.addEventListener('click', ()=>{

	tester.nextStep();
	
	counter.innerHTML = `${tester.getCurrentDay()} / 10`;
})


// updateUI();

// что блять мне еще надо сделать
// да дохуя чего еще
// надеюсь завтра это закончится


