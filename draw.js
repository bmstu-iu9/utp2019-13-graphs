'use strict';

//глобальные переменные
let canvas;
let ctx;

let clientHeight; //высота холста
let clientWidth; //ширина холста
const indent = 50; //отступ от границ

let expr; //функция, полученная от пользователя

//наибольшие и наименьшие значения х и у в координатах функции
let minX;
let maxX;
let minY;
let maxY;

let deltaX; //разница между двумя соседними точками в координатах функции

//коэффициенты перехода от СК функции к СК экрана, по умолчанию 1
let scaleX = 1; 
let scaleY = 1; 

//функция для очистки переменных 
const clearVariables = () => {
	result.innerText = "";
	minX=maxX=minY=maxY=undefined;
	deltaX = 0;
	scaleX = scaleY = 1;
} 

//базовая функция
const Draw = () => {
	//подготовка
	init();
	
	//отрисовка системы координат
	drawAxesSystem();
	
	//отрисовка графика
	drawGraph();
};

//заполнение входных данных и подготовка области для рисования
const init = () => {
	canvas=document.getElementById('graph');
	ctx=canvas.getContext('2d');
	clientHeight = canvas.clientHeight;
	clientWidth = canvas.clientWidth;
	ctx.clearRect(0, 0, clientWidth, clientHeight);
	ctx.fillStyle = '#000000';
	ctx.strokeRect(0, 0, clientWidth, clientHeight);
	ctx.strokeStyle = '#AAAAAA';
	ctx.strokeRect(indent, indent, clientWidth-2*indent, clientHeight-2*indent);
	
	//получение наибольших и наименьших х и у (в координатах функции)
	minX = Number(document.getElementById('minX').value);
	maxX = Number(document.getElementById('maxX').value);
	if (isNaN(minX) || isNaN(maxX) || minX>=maxX) {
		throw new Error('Uncorrect X value');
	};
	expr = new Function('x', 'return ' + func.value);
	deltaX = (maxX - minX)/(clientWidth - 2*indent);
	if(document.getElementById('check').checked){
		let realCurX = minX;
		while(realCurX<=maxX){
			const realCurY = expr(realCurX);
			if(!isNaN(realCurY) && realCurY!=-Infinity && realCurY!=Infinity){
				if(realCurY < minY || minY == undefined) {
					minY = realCurY;
				};
				if(realCurY > maxY || maxY == undefined){
					maxY = realCurY;
				};
			}
			realCurX = realCurX + deltaX;
		};
		if(minY == undefined || maxY == undefined) {
			throw new Error('Error auto calc Y value');
		}
		minY = Math.floor(minY);
		maxY = Math.ceil(maxY);
	} else{
		minY = Number(document.getElementById('minY').value);
		maxY = Number(document.getElementById('maxY').value);
		if (isNaN(minY) || isNaN(maxY) || minY>=maxY) {
			throw new Error('Uncorrect Y value');
		};
	}

	//подсчет коэффициентов для масштабирования графика
	scaleX = (clientWidth-2*indent)/(maxX-minX);    
	scaleY = (clientHeight-2*indent)/(maxY - minY); 
};

//отрисовка системы координат
const drawAxesSystem = () =>{
		ctx.strokeStyle = '#000000';
		ctx.font = "italic 14pt Arial";
		ctx.fillText(maxY, indent/4,indent);
		ctx.fillText(minY,indent/4,clientHeight - indent);
		ctx.fillText(minX,indent*3/4, clientHeight - indent/2);
		ctx.fillText(maxX,clientWidth - indent*5/4, clientHeight - indent/2);
		const prop = 5;
		const zeroX = xChangeToScreen(0);
		const zeroY = yChangeToScreen(0);
		if (zeroX >= indent && zeroX<=(clientWidth-indent)) {
			ctx.beginPath();
			ctx.moveTo(zeroX, clientHeight-indent);
			ctx.lineTo(zeroX, indent/2);
			ctx.stroke();
			ctx.beginPath();
			ctx.lineTo(zeroX - indent/prop, indent*(prop-1)/prop);
			ctx.lineTo(zeroX + indent/prop, indent*(prop-1)/prop);
			ctx.lineTo(zeroX, indent/2);
			ctx.fill();
			ctx.fillText("Y", zeroX, indent/2);
			if(minX!=0 && maxX!=0){
				ctx.fillText("0", zeroX, clientHeight-indent/2);
			}
		}
		if (zeroY >= indent && zeroY <= (clientHeight - indent)) {
			ctx.beginPath();
			ctx.moveTo(indent,zeroY);
			ctx.lineTo(clientWidth-indent/2,zeroY);
			ctx.stroke();
			ctx.beginPath();
			ctx.lineTo(clientWidth-indent*(prop-1)/prop,zeroY - indent/prop);
			ctx.lineTo(clientWidth-indent*(prop-1)/prop,zeroY + indent/prop)
			ctx.lineTo(clientWidth-indent/2,zeroY);
			ctx.fill();
			ctx.fillText("X", clientWidth-indent/2,zeroY);
			if(minY!=0 && maxY!=0){
				ctx.fillText("0", indent/2,zeroY);
			}
		}	
};

//отрисовка графика
const drawGraph = () =>{
			ctx.fillStyle = '#000000';
			ctx.beginPath();

			let realPrevX = minX;
			let realCurX = realPrevX;
			while( realCurX <= maxX) {
				drawPointLimit(realPrevX, realCurX, 2*clientHeight);
				realPrevX = realCurX;
				realCurX = realPrevX+deltaX;
			}
			ctx.stroke();
};

const epsEqu = (x, y) => {
    return Math.abs(x - y) < Number.EPSILON * Math.max(Math.abs(x), Math.abs(y));
}

const drawPointLimit = (realPrevX, realCurX, maxDrawPoint) => {
	let countDrawPoiunt = 0;

	const drawPoint = (realPrevX, realCurX) => {
		if (countDrawPoiunt >= maxDrawPoint ) {
			return; // Если у нас колебaтельные движения, то надо ограничить количество рассчитываемых точек
		}
		const realPrevY = expr(realPrevX);
		const realCurY = expr(realCurX);
		if ((checkRealY(realPrevY) || checkRealY(realCurY))) {
			const scrPrevY = yChangeToScreen(realPrevY);
			const scrCurY = yChangeToScreen(realCurY);
			const scrMaxDeltaY = 1; // чтобы линия получилась сплошная
			if ( Math.abs(scrCurY - scrPrevY) <= scrMaxDeltaY) {
				const scrPrevX = xChangeToScreen(realPrevX);
				const scrCurX = xChangeToScreen(realCurX);

				// Выводит точки, если scrMaxDeltaY == 1, то получится сплошная линия
				ctx.fillRect(scrCurX, scrCurY, 1, 1);
				++countDrawPoiunt;
			} else {
				if (epsEqu(realCurX,realPrevX)) {
					// Мы достигли предела точности
					drawPoint(realCurX, realCurX);
				} else {			
					// Делим на 2 отрезка
					const realMidX = (realPrevX + realCurX)/2;
					drawPoint(realPrevX, realMidX);
					drawPoint(realMidX, realCurX);
				}
			}		
		}
	}
	drawPoint(realPrevX, realCurX);
}

const checkRealY = (realY) => {
	if( isNaN(realY) || realY == Infinity || realY == -Infinity) {
		return false;
	}
  	if ( (realY > maxY) || (realY < minY) ) {
		return false;
  	}
	return true;
}

//переводит координату х функции в координату х экрана
const xChangeToScreen = (x) =>{
	return Math.round((x-minX)*scaleX + indent);
}

//переводит координату y функции в координату y экрана
const yChangeToScreen = (y) =>{
	return Math.round((maxY - y)*scaleY + indent);
}

//проверка галочки auto
const checker = () => {
	let min = document.getElementById('minY');
	let max = document.getElementById('maxY');
	if(document.getElementById('check').checked){
		min.disabled = true;
		max.disabled = true;
	} else{
		min.disabled = false;
		max.disabled = false;
	}
	//min.value ="";
	//max.value ="";
}	


//выполняется при запуске страницы
checker();

//запуск при нажатии кнопки
bttn.onclick = (event) => {
		//подготовка
		clearVariables();
		//отрисовка
		try{
			Draw();
		} catch(err) {
			result.innerText = err.message;
		}
}; 
