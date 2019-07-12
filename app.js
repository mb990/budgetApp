// BUDGET CONTROLLER
var budgetController = (function(){  // ovo je modul - kao IIFE funkcija, da bismo sakrili podatke
	
	// var x = 23;
	// var add = function(a){
	// 	return x + a;
	// }

	// return {						// ova funkcija se vidi jer je return objekat, tj vracamo je kroz objekat
									// pa je public, ali ADD i X se ne vide, private su.
		// publicTest: function(b){	// Tipican primer closure-a, gde inner f-ja vidi outer's f-je varijable i metode.
			// return add(b);
	// 	}
	// }
	//--------------------------------------------------------------------

	var Expense = function(id, description, value){  // function controller
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calculatePercentage = function (totalIncome) {

		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
	};
	
	Expense.prototype.getPercentage = function () {
		return this.percentage;
	};

	var Income = function(id, description, value){ 
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var calculateTotal = function (type) {
		var sum = 0;
		data.allItems[type].forEach(function (current) {
			sum += current.value;
		});
		data.totals[type] = sum;
	};

	var data = {
		allItems: {
			inc: [],
			exp: []
		},
		totals: {
			inc: 0,
			exp: 0
		},
		budget: 0,
		percentage: -1
	};	

	return {
		addItem: function(type, description, value){

			var newItem, ID;

			// Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1; // dodeljujemo prvi slobodan ID novom itemu
            } else {
            	ID = 0;
            }

			// Create new item exp or inc
			if (type === 'exp'){
				newItem = new Expense (ID, description, value);
			} else {
				newItem = new Income (ID, description, value);
			}

			// Push the new item into allItems/data structure
			data.allItems[type].push(newItem);
			// Return the new element
			return newItem;
		},

		deleteItem: function(type, id) {

			var ids, index;

			ids = data.allItems[type].map(function (current) {  // MAP vraca potpuno novi niz, u tome se razlikuje od FOREACH
			return current.id;
			});

			index = ids.indexOf(id);

			if (index !== -1) {
				data.allItems[type].splice(index, 1);  // splice brise clanove niza, od tacke koju navedemo pa brise onoliko clanova koliko smo naveli, u ovom slucaju samo index clan, odnosno jedan clan.
			}

		},

		calculateBudget: function(){

			// 1. Calculate total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');

			// 2. Calculate the budget
			data.budget = data.totals.inc - data.totals.exp;

			// 3. Calculate the % of income that we spent
			if (data.totals.inc > 0) {

				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			}else {
				data.percentage = -1;
			}
		},

		calculatePercentages: function(){

			data.allItems.exp.forEach(function (current) {
				current.calculatePercentage(data.totals.inc);
			});

		},

		getPercentages: function() {
			var allPercentages;

			allPercentages = data.allItems.exp.map(function (current) {
				return current.getPercentage();
			});

			return allPercentages;
		},

		getBudget: function() {
			return {
				budget: data.budget,
				totalIncome: data.totals.inc,
				totalExpenses: data.totals.exp,
				percentage: data.percentage
			};
		},
		testing: function(){
			console.log(data);
		}
	};


})();



// UI CONTROLLER
var UIController = (function(){

	var DOMStrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputButton: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercentageLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};

	var	formatNumber = function(number, type) {

		var numberSplit, int, dec;

		/*
        + or - before number
        exactly 2 decimal points
        comma separating the thousands
        2310.4567 -> + 2310,46
        2000 -> 2000,00
        */

		number = Math.abs(number);
		number = number.toFixed(2);

		numberSplit = number.split('.');

		int = numberSplit[0];

		if (int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);// 2310 --> 2,310
		}

		dec = numberSplit[1];

		return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

	};

	var nodeListForEach = function(list, callback){
		for (var i = 0; i < list.length; i++){
			callback(list[i], i);
		}
	};

	return {
		getInput: function(){

			return {
				type: document.querySelector(DOMStrings.inputType).value, // will be either inc or exp
				description: document.querySelector(DOMStrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
			};
			
		},

		addListItem: function(obj, type){

			var html, newHtml, element;

			// Create HTML string with placeholder text

			if (type === 'inc') {
				element = DOMStrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if (type === 'exp') {
				element = DOMStrings.expensesContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			};
			
			// Replace the placeholder text with data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);	
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
			// Insert HTML into DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		deleteListItem: function(selectorID) {

			var element;

			element = document.getElementById(selectorID);

			element.parentNode.removeChild(element);
		},

		clearFields: function(){
			var fields, fieldsArray;

			fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

			fieldsArray = Array.prototype.slice.call(fields); // pretvaramo fields u array

			fieldsArray.forEach(function (current, index, array) {
				current.value = '';
			});

			fieldsArray[0].focus();
		},

		displayBudget: function(obj){
			var type;
			obj.budget > 0 ? type = 'inc' : type = 'exp';

			document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
			document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, 'exp');

			if (obj.percentage > 0) {
				document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMStrings.percentageLabel).textContent = '---';
			}
			
		},

		displayPercentages: function(percentages) {

			var fields, nodeListForEach;

			fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel);

			nodeListForEach(fields, function (current, index) {

				if (percentages[index] > 0){
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '---';
				}
			});

		},

		displayMonth: function(){

			var now, year, month, months;

			now = new Date();

			months=['January', 'February', 'March', 'April', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			month = now.getMonth();
			year = now.getFullYear();
			document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;

		},

		changedType: function(){

			var fields;

			fields = document.querySelectorAll(
				DOMStrings.inputType + ',' +
						DOMStrings.inputDescription + ',' +
						DOMStrings.inputValue
			);

			nodeListForEach(fields, function (current) {
				current.classList.toggle('red-focus');
			})

			document.querySelector(DOMStrings.inputButton).classList.toggle('red');
		},

		getDOMStrings: function(){
			return DOMStrings;			// sve sto je return kao objekat je public
		}
	};

})();



// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){ // ovo je app controller, jos jedan modul, koji spaja prethodna dva modula
												// koji se medjusobno ne vide

	var setupEventListeners = function (){

		var DOM = UICtrl.getDOMStrings();

		document.querySelector(DOM.inputButton).addEventListener('click', controllerAddItem);

		document.addEventListener('keypress', function(event){

			if (event.keyCode === 13 || event.which === 13){
				controllerAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener('click', controllerDeleteItem);

		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
	};

	var updateBudget = function () {

		// 1. calculate the budget
		budgetCtrl.calculateBudget();

		// 2. return the budget
		var budget = budgetCtrl.getBudget();

		// 3. display the budget
		UICtrl.displayBudget(budget);
	};

	var updatePercentages = function () {
		// 1. Calculate percentages
		budgetCtrl.calculatePercentages();
		// 2. Read them from the budget controller
		var percentages = budgetCtrl.getPercentages();
		// 3. Update the UI with the new percentages
		UICtrl.displayPercentages(percentages);
	};

	var controllerAddItem = function(){

		var input, newItem;

		// 1. get the field input data
			input = UICtrl.getInput();
			
		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 3. add the item to the ui
            UICtrl.addListItem(newItem, input.type);
            // 4. Clear the fields
            UICtrl.clearFields();
            // 5. Calculate and update budget
            updateBudget();
            // 6. Calculate and update percentages
			updatePercentages();
        }
	};

	var controllerDeleteItem = function (event) {

		var itemId, splitId, type, ID;

		itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if (itemId) {

			splitId = itemId.split('-');
			type = splitId[0];
			ID = parseInt(splitId[1]);

			// 1. Delete the item form the data structure
			budgetCtrl.deleteItem(type, ID);
			// 2. Delete the item from the UI
			UICtrl.deleteListItem(itemId);
			// 3. Update and show the new budget
			updateBudget();
			// 4. Calculate and update percentages
			updatePercentages();
		}

	};


	return {
		init: function(){
			console.log('App started');
			UICtrl.displayMonth();
			UICtrl.displayBudget({
				budget: 0,
				totalIncome: 0,
				totalExpenses: 0,
				percentage: -1
			});
			setupEventListeners();
		}
	};

})(budgetController, UIController);

controller.init();







