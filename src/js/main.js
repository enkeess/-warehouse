nextBtn.classList.add('hide');
nextBtn.addEventListener('click', ()=>{
	tester.nextStep();
})

form.config.addEventListener('change', (e) => readFile(e.target));
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

getOrdersBtn.addEventListener('click', () => {
	tester.makeOrders();
})

resultsBtn.addEventListener('click', () => {
	experiment.classList.add('hide');
	results.classList.remove('hide');
	
	tester.updateHistory();
	tester.calcResult();
	
	drawHistory(historyResult, tester.getResult())
	drawHistory(historyByDay, tester.getHistory());
})
