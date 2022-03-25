nextBtn.classList.add('hide');
nextBtn.addEventListener('click', ()=>{
	ex.nextStep();
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
	minOrder = +form.minOrder.value;
	maxOrder = +form.maxOrder.value;

	
	minDispatchTime = +form.minDispatchTime.value;
	maxDispatchTime = +form.maxDispatchTime.value;

	if(minDispatchTime > maxDispatchTime) {
		maxDispatchTime = minDispatchTime;
		form.maxDispatchTime.value = minDispatchTime;
	}

	ex = new Experiment({	
		db, 
		days, 
		retailersAmount, 
		productsAmount, 
		minOrder,
		maxOrder,
		minDispatchTime,
		maxDispatchTime
	});

	setup.classList.add('hide');
});

getOrdersBtn.addEventListener('click', () => {
	ex.makeOrders();
})

const endOfExperement = () => {


	slider && slider.removeActions();

	experiment.classList.add('hide');
	results.classList.remove('hide');
	
	ex.updateHistory();
	ex.calcResult();
	
	drawHistory(historyResult, ex.getResult())
	drawHistory(historyByDay, ex.getHistory());

	setup.classList.remove('hide');

	slider = new Slider(
		document.querySelector('.slider__container'),
		document.querySelector('.slider__wrapper'),
		document.querySelector('.next-slide-btn'),
		document.querySelector('.prev-slide-btn'),
	);
}

resultsBtn.addEventListener('click', endOfExperement);


rebootBtn.addEventListener('click', () => {
	experiment.classList.add('hide');
	setup.classList.remove('hide');
})


toEndBtn.addEventListener('click', () => {
	if(nextBtn.classList.contains('hide')) {
		ex.makeOrders();
	}

	while(resultsBtn.classList.contains('hide')) {
		ex.nextStep();
		ex.makeOrders();
	}

	endOfExperement();
})