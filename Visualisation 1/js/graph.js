var dataAverage = [];
var dataRows = [];
var currentCountry;

function createGraph(country){
    currentCountry = country;
    createDataForGraph(country);
    var chart = new CanvasJS.Chart("svgMap-tooltip-graph", 
        {
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
                lineThickness: 3,
                dataPoints: dataAverage
            }]
        });

    chart.render();
}

function createDataForGraph(country){
    dataAverage = [];
    dataRows = [];
    var average = [];

    var currentDate = new Date("Jan 03 2020");
    var dateString = createDateString(currentDate);

    while(dateString != date){
        average.push(globalData[country][dateString][0]);
        if(average.length > 7) average.shift();

        if(currentScale == "Normal" || currentScale == "Per 100,000"){
            var temp = 0;
            for(var i = 0; i < average.length; i++) temp+=average[i];
            temp /= average.length;
        }
        else if(currentScale == "Log"){
            var temp = 0;
            for(var i = 0; i < average.length; i++){
                if(parseInt(average[i]) == 0) temp += 0;
                else temp += Math.log(average[i]);
            } 
            temp /= average.length;
        }

        var tempDate = new Date(dateString);

        if(currentScale == "Normal"){
            dataRows.push({y: globalData[country][dateString][0], label: tempDate.getDate() + "/" + (tempDate.getMonth() + 1)});
            dataAverage.push({y: temp, label: tempDate.getDate() + "/" + (tempDate.getMonth() + 1)});
        }
        else if(currentScale == "Log"){
            var value = 0;
            if(globalData[country][dateString][0] == 0) value = 0;
            else value = Math.log(globalData[country][dateString][0]);

            dataRows.push({y: value, label: tempDate.getDate() + "/" + (tempDate.getMonth() + 1)});
            dataAverage.push({y: temp, label: tempDate.getDate() + "/" + (tempDate.getMonth() + 1)});
        }
        else{
            var popscale = (populations[country] + 0.0001)/100000;
            dataRows.push({y: globalData[country][dateString][0]/popscale, label: tempDate.getDate() + "/" + (tempDate.getMonth() + 1)});
            dataAverage.push({y: temp/popscale, label: tempDate.getDate() + "/" + (tempDate.getMonth() + 1)});  
        }

        currentDate.setDate(currentDate.getDate() + 1);
        dateString = createDateString(currentDate);
    }
}

function createDateString(d){
    var day;
    if(d.getDate() < 10) day = "0" + d.getDate();
    else day = d.getDate();

    var month = "0" + (d.getMonth() + 1); 
    return "2020-" + month + "-" + day;
}