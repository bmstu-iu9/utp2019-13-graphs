'use strict';

//запуск при нажатии кнопки
bttn.onclick = (event) => {
		//действия, которые необходимо выполнить при нажатии кнопки
		Draw();
};  

//базовая функция
function Draw() {
	//подготовка
	
	//отрисовка системы координат
	drawAxesSystem();
	
	//отрисовка графика
	drawGraph();
};


//отрисовка системы координат
function drawAxesSystem(){};

//отрисовка графика
function drawGraph(){};