class Circle{
    constructor(radius, canvasHeight, canvasWidth){
        this.radius = radius;
        this.x = Math.floor(Math.random() * (canvasWidth - this.radius)) + this.radius;
        this.y = Math.floor(Math.random() * (canvasHeight - this.radius)) + this.radius;
        this.infected = 0;
        this.directionAngle = Math.floor(Math.random() * 360);
    }
}

//var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September"];

var circles = []
var canvas;
var ctx;
var scale;
var tickCount = 0;
var dataCount = 0;
var data;
var date = new Date("Jan 20 2020");
var infected = 0;
var scale = 500000;
var heightOfNamesWindow;
var currentSpeed = 80;
var playing;
var ticker;

var population; 

function onLoad(){
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    canvas.height = canvas.getBoundingClientRect().height;
    canvas.width = canvas.getBoundingClientRect().width;

    data = getData();
    heightOfNamesWindow = document.getElementById("listOfNames").height;

    var canvasHeight = canvas.height;
    var canvasWidth = canvas.width;
    console.log(canvasWidth + "," + canvasHeight);
    population = 328200000;
    var num = population/scale;
    for(var i = 0; i < num; i++)
        circles.push(new Circle(5, canvasHeight, canvasWidth));
    
    declare();

    ticker = setInterval(tick, 20);
    playing = true;
}

/*
Stops or Starts the cycle of data (does not stop the scrolling names)
*/
function playPause(){
    var button = document.getElementById("playPause");
    if(playing){
        button.style.color = "#1C9E9E";
        button.style.fontWeight = "bold";
        playing = false;
        clearInterval(ticker);
    }
    else{
        button.style.color = "black";
        button.style.fontWeight = "normal";
        playing = true;
        ticker = setInterval(tick, 20);
    }
}

function tick(){
    updateEntities();
    draw();
    if(tickCount % currentSpeed == 0){ 
        updateData();
        updateGraph();
        if(currentSpeed > 12) currentSpeed--;
    }
    tickCount += 1;
}

var addedNames = false;

function updateData(){
    var listOfNames = document.getElementById("listOfNames");

    // Reset the animation
    if(dataCount == data.length){
        dataCount = 0;
        date = new Date("Jan 20 2020");
        for(var i = 0; i < circles.length; i++) circles[i].infected = 0;
        listOfNames.innerHTML = "";
        dataRows = [];
        dataAverage = [];
    }

    // data = list of [new cases, cumulative cases, new deaths, cumulative deaths]
    document.getElementById("date").innerHTML = "<b>Date:</b> " + date.getDate() + " " + months[date.getMonth()];
    document.getElementById("infected").innerHTML = "<b>Infected:</b> " + numberWithCommas(data[dataCount][1]);
    document.getElementById("dead").innerHTML = "<b>Dead:</b> " + numberWithCommas(data[dataCount][3]);
    document.getElementById("percent").innerHTML = "<b>Percent Infected:</b> " + parseFloat(parseInt(data[dataCount][1])/population * 100).toFixed(4) + "%";

    infected = data[dataCount][1];
    
    if(data[dataCount][3] > 0 && !addedNames){
        addNames();
        addedNames = true;
    }

    dataCount++;
    date.setDate(date.getDate() + 1);
}

var dataRows = [];
var dataAverage = [];
var chart;

/*
Update the covid cases graph
*/
function updateGraph(){
    if(dataCount == 1){
        dataRows.push({y: 5, label: date.getDate() + " " + months[date.getMonth()]});

        chart = new CanvasJS.Chart("graphContainer", {
            animationEnabled: false,
            theme: "light2", // "light1", "light2", "dark1", "dark2"
            title:{
                text: "Covid-19 Cases"
            },
            axisY: {
                title: "Daily Cases"
            },
            data: [{        
                type: "column",
                name: "Daily Cases",
                showInLegend: true,
                dataPoints: dataRows
            },
            {
                type: "line",
                name: "7 Day Average",
                showInLegend: true,
                lineThickness: 4,
                dataPoints: dataAverage
            }]
        });
    }
    else dataRows.push({y: data[dataCount][0], label: date.getDate() + " " + months[date.getMonth()]});
    
    var average = 0
    if(dataCount < 7){
        for(var i = 0; i <= dataCount; i++) average += data[i][0];
        average /= dataCount;
    } 
    else{
        for(var i = dataCount-6; i <= dataCount; i++) average += data[i][0];
        average /= 7;
    } 
    dataAverage.push({y: average, label: date.getDate() + " " + months[date.getMonth()]});

    chart.render();
}

/*
Update the circles in the big canvas
*/
function updateEntities(){
    var rate = 1.5;
    var currentInfected = infected;
    for(var i = 0; i < circles.length; i++){
        var angle = circles[i].directionAngle;
        moveEntity(circles[i], rate, angle);
        collideEntity(angle, circles[i]);
        if(currentInfected > 0) currentInfected = infectEntities(currentInfected, circles[i]);
    }
}

/*
Move the circles in the big canvas
*/
function moveEntity(entity, rate, angle){
    if(angle <= 90){
        entity.x += rate * angle/90;
        entity.y -= rate * (1 - angle/90);
    }
    else if(angle > 90 && angle <= 180){
        entity.x += rate * (1 - (angle-90)/90);
        entity.y += rate * (angle-90)/90;
    }
    else if(angle > 180 && angle <= 270){
        entity.x -= rate * (angle-180)/90;
        entity.y += rate * (1 - (angle-180)/90);
    }
    else{
        entity.x -= rate * (1 - (angle-270)/90);
        entity.y -= rate * (angle-270)/90;
    }
}

/*
Bounce the circles off the walls in the big canvas
*/
function collideEntity(angle, entity){
    var width = canvas.width;
    var height = canvas.height;
    var dif = angle % 90;
    if(entity.y - entity.radius <= 0){
        entity.directionAngle = addAngles(angle, dif, "top");
    }
    else if(entity.y + entity.radius >= height){
        entity.directionAngle = addAngles(angle, dif, "bottom");
    }
    else if(entity.x - entity.radius <= 0){
        entity.directionAngle = addAngles(angle, dif, "left");
    }
    else if(entity.x + entity.radius >= width){
        entity.directionAngle = addAngles(angle, dif, "right");
    }
}

/*
Show the percentage of infection for a given circle
*/
function infectEntities(currentInfected, entity){
    if(currentInfected >= scale){
        entity.infected = 1;
        currentInfected -= scale;
    }
    else{
        entity.infected = currentInfected/scale;
        currentInfected = 0;
    }
    return currentInfected;
}

/*
Draws all elements onto the canvas
*/
function draw(){
    ctx.clearRect(0, 0, canvas.getBoundingClientRect().width, canvas.getBoundingClientRect().height);
    for(var i = 0; i < circles.length; i++){
        var temp = Math.floor((1-circles[i].infected) * 255);
        ctx.fillStyle = rgbToHex(255, temp, temp);
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.arc(circles[i].x, circles[i].y, circles[i].radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
}

/*
Helper function for collisions with walls
*/
function addAngles(angle, dif, side){
    var change = 180 - dif * 2;
    if(side == "top"){
        if(dif == 0) return 180;
        if(angle > 180) return angle - change;
        else return angle + change;
    }
    else if(side == "bottom"){
        if(dif == 0) return 0;
        if(angle > 180) return angle + change;
        else return angle - change;
    }
    else if(side == "left"){
        if(dif == 0) return 90;
        if(angle > 270) return dif;
        else return 180 - dif;
    }
    else{
        if(dif == 0) return 270;
        if(angle > 90) return 180 + dif;
        else return 360 - dif;
    }
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}