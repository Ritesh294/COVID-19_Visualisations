var map;
var startDate = new Date("2020-01-03");
var date = "2020-09-23";
var currentScale = 'Normal';

function load(){
    assign();
    assignPopulations();
    map = new svgMap({
        targetElementID: 'world-map',
        data: createData(currentScale),
        colorMax: '#CC0033',
        colorMin: '#fff1f0',
        colorNoData: '#E2E2E2',
    });

    // Set position of controls - allows for different aspect ratio screens
    var mapHeight = document.getElementById("mapContainer").clientHeight;
    var mapWidth = document.getElementById("mapContainer").clientWidth;
    var mapOffset = mapHeight * 0.7;
    document.getElementById("dataControls").style.top = (mapOffset) + "px";
    
    // Set position of slider and date
    document.getElementById("daySelect").style.top = (mapHeight + 20) + "px";
    document.getElementById("sliderdate").style.marginLeft = mapWidth - (document.getElementById("sliderdate").clientWidth/2) + "px";
}

var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September"];

function dateChanged(){
    var sliderValue = document.getElementById("slider").value;
    var tempDate = new Date("Jan 03 2020");
    tempDate.setDate(tempDate.getDate() + parseInt(sliderValue));

    var day;
    if(tempDate.getDate() < 10) day = "0" + tempDate.getDate();
    else day = tempDate.getDate();

    var month = "0" + (tempDate.getMonth() + 1); 
    date = "2020-" + month + "-" + day;

    var newData = createData();
    map.options.data = newData;
    map.applyData(newData);

    document.getElementById("sliderdate").innerHTML = tempDate.getDate() + " " + months[tempDate.getMonth()];


    // Move date text under slider
    var percentAcross = sliderValue/264;
    var sliderWidth = document.getElementById("slider").clientWidth;
    var offset = screen.width * 0.1 - 8;
    document.getElementById("sliderdate").style.marginLeft = (offset + sliderWidth * percentAcross - document.getElementById("sliderdate").clientWidth/2) + "px";
}

function scaleChange(scale){
    currentScale = scale;
    var newData = createData();
    map.options.data = newData;
    map.applyData(newData);
}


function createData(){
    var temp = {
        data: {
          totalCases: {
            name: 'Total Cases',
            format: '{0}',
            thousandSeparator: ','
          },
          totalDeaths: {
            name: 'Total Deaths',
            format: '{0}',
            thousandSeparator: ','
          }
        },
        applyData: 'totalCases',
        values: {}
    };

    // globalData format: [new cases, cumulative cases, new deaths, cumulative deaths]
    if(currentScale == 'Normal'){
        for(var k in globalData){
            try{
                temp.values[k] = {totalCases: globalData[k][date][1], totalDeaths: globalData[k][date][3]};
            }
            catch(err){
                console.log(k + ", " + date + ", " + globalData[k][date]);
            }
        }
    }
    else if(currentScale == 'Log'){
        for(var k in globalData){
            var cases = (Math.log(parseInt(globalData[k][date][1]) + 1)).toFixed(2);
            var deaths = (Math.log(parseInt(globalData[k][date][3]) + 1)).toFixed(2);
            temp.values[k] = {totalCases: cases, totalDeaths: deaths};
        }
    }
    // Per 100,000
    else{
        for(var k in globalData){
            var popScale = (populations[k] + 0.0001)/100000;
            var cases = (parseInt(globalData[k][date][1])/popScale).toFixed(2);
            var deaths = (parseInt(globalData[k][date][3])/popScale).toFixed(2);

            temp.values[k] = {totalCases: cases, totalDeaths: deaths};
        }
    }

    return temp;
}