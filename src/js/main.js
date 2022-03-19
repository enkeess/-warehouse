"use strict";

let days = +form.days.value;
let productsAmount = +form.productsAmount.value;
let retailersAmount = +form.retailersAmount.value;

let tester;

nextBtn.classList.add('hide');

nextBtn.addEventListener('click', ()=>{
	tester.nextStep();
})

form.addEventListener('submit', (e) => {
	e.preventDefault();

	results.classList.add('hide');
	resultsBtn.classList.add('hide');
	experiment.classList.remove('hide');

	days = +form.days.value;
	productsAmount = +form.productsAmount.value;
	retailersAmount = +form.retailersAmount.value;

	tester = new Tester(db, days, retailersAmount, productsAmount);
	
});


resultsBtn.addEventListener('click', () => {
	experiment.classList.add('hide');
	results.classList.remove('hide');
	console.log(tester.getHistory());
	drawHistory(historyResult, tester.getResult())
	drawHistory(historyByDay, tester.getHistory());
})


// что блять мне еще надо сделать
// да дохуя чего еще
// надеюсь завтра это закончится


