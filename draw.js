'use strict';

//глобальные переменные
var canvas;
var ctx;

var clientHeight; //высота холста
var clientWidth; //ширина холста
const indent = 50; //отступ от границ

var expr; //функция, полученная от пользователя

//наибольшие и наименьшие значения х и у в координатах функции
var minX;
var maxX;
var minY;
var maxY;

var deltaX; //разница между двумя соседними точками в координатах функции

//коэффициенты перехода от СК функции к СК экрана, по умолчанию 1
var scaleX = 1; 
var scaleY = 1; 

//выполняется при запуске страницы
checker();

//запуск при нажатии кнопки
bttn.onclick = (event) => {
		//действия, которые необходимо выполнить при нажатии кнопки
		try{
			Draw();
		} catch(err) {
			result.innerText = err.message;
		}
};  

//базовая функция
function Draw() {
	//подготовка
	init();
	
	//отрисовка системы координат
	drawAxesSystem();
	
	//отрисовка графика
	drawGraph();
};

//заполнение входных данных и подготовка области для рисования
function init(){
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
	if (minX==NaN || maxX==NaN || minX>=maxX) {
		throw new Error('Uncorrect X value');
	};
	expr = new Function('x', 'return ' + func.value);
	deltaX = (maxX - minX)/(clientWidth - 2*indent);
	if(document.getElementById('check').checked){
		let realCurX = minX;
		while(realCurX<=maxX){
			const realCurY = expr(realCurX);
			if((realCurY < minY || minY == undefined) && realCurY!=-Infinity) {
				minY = realCurY;
			};
			if((realCurY > maxY || maxY == undefined)&& realCurY!=Infinity ){
				maxY = realCurY;
			};
			realCurX = realCurX + deltaX;
		};
		minY = Math.floor(minY);
		maxY = Math.ceil(maxY);
	} else{
		minY = Number(document.getElementById('minY').value);
		maxY = Number(document.getElementById('maxY').value);
		if (minY==NaN || maxY==NaN || minY>=maxY) {
			throw new Error('Uncorrect Y value');
		};
	}

	//подсчет коэффициентов для масштабирования графика
	scaleX = (clientWidth-2*indent)/(maxX-minX);    
	scaleY = (clientHeight-2*indent)/(maxY - minY); 
};

//отрисовка системы координат
//отрисовка системы координат
const drawAxesSystem = () =>{ //функция в правильном виде
		ctx.strokeStyle = '#000000';
		ctx.font = "italic 14pt Arial";
		ctx.fillText(maxY, indent/4,indent);
		ctx.fillText(minY,indent/4,clientHeight - indent);
		ctx.fillText(minX,indent*3/4, clientHeight - indent/2);
		ctx.fillText(maxX,clientWidth - indent*5/4, clientHeight - indent/2);
		const prop = 5;
		const zeroX = xChangeToScreen(0);
		const zeroY = yChangeToScreen(0);
		if(zeroX >= indent && zeroX<=(clientWidth-indent)){
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
		if(zeroY >= indent && zeroY <= (clientHeight - indent)){
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
function drawGraph(){
			ctx.fillStyle = '#000000';
			ctx.beginPath();

			let realCurX = minX;
			while( realCurX <= maxX) {
				const scrCurX = xChangeToScreen(realCurX);
				const realCurY = expr(realCurX);
				if(realCurY!= Infinity && realCurY != -Infinity){
					const scrCurY = yChangeToScreen(realCurY);
					ctx.fillRect(scrCurX, scrCurY, 1, 1);
				}
				realCurX = realCurX + deltaX;
			}
			ctx.stroke();
};

//переводит координату х функции в координату х экрана
function xChangeToScreen(x){
	return (x-minX)*scaleX + indent;
}

//переводит координату y функции в координату y экрана
function yChangeToScreen(y){
	return (maxY - y)*scaleY + indent;
}

//проверка галочки auto
function checker(){
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
