var EXTRACTED_DATA = [];
var countrySlugList = [];
var countryNameList = [];
var countryList = [];
var selectedCountry;
var countryTitleName;
var prevHighlight;
var latestCaseData;
var requestOptions = {
    method: 'GET',
    redirect: 'follow'
};

main();

async function fetchCountryList() {
    try {
        const response = await fetch("https://api.covid19api.com/summary", requestOptions);
        const data = await response.json();
        latestCaseData = data;
        return data.Countries;
    } catch (error) {
        console.error(error);
    }
}

async function generateGraphData(countryName) {
    countryTitleName = countryName;
    if (countryName == undefined) {
        selectedCountry = countryNameList[1]; //default country
        countryTitleName = countryNameList[1];
    } else {
        selectedCountry = countryName;
    }

    for (i in this.countrySlugList) {
        if (countrySlugList[i].Country == selectedCountry) {
            selectedCountry = countrySlugList[i].Slug; //replace country name with slug
        }
    }

    var countryData; //api response is here
    EXTRACTED_DATA = []; //clear the data for the graph

    try {
        const response = await fetch('https://api.covid19api.com/total/country/' + selectedCountry + '/status/confirmed', requestOptions);
        const data = await response.json();
        countryData = data;
    } catch (error) {
        console.error(error);
    }
    var parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%SZ");
    countryData.forEach(function (d) {
        d.Date = parseTime(d.Date);
    });

    for (j = 0; j < countryData.length; j++) {
        var label = { Country: countryData[j].Country, confirmedCases: countryData[j].Cases, Date: countryData[j].Date }
        EXTRACTED_DATA.push(label); //adding our custom selected data to the list
    }
    console.log(EXTRACTED_DATA);

}

async function main() {
    this.countrySlugList = await fetchCountryList(); //get the list of all countries
    for (var item in this.countrySlugList) { //put country names and slugs into appropriate lists
        countryList.push(this.countrySlugList[item].Slug);
        countryNameList.push(this.countrySlugList[item].Country);
    }
    countryNameList.sort(); //sort country names by alphabetical order
    initialise();
    await generateGraphData();
    renderLineGraph(countryTitleName);
    generateDataTable();

    setTableHeight();
}

async function generateDataTable() {
    for (i in latestCaseData.Countries) {
        var table = document.getElementById("dataTable");
        var newRow = table.insertRow(-1);
        var newRowName = "newRow" + i;
        newRow.id = newRowName;
        var row = document.getElementById(newRowName);
        var country = row.insertCell(-1);
        country.id = 't' + latestCaseData.Countries[i].Country;
        row.id = 'tr' + latestCaseData.Countries[i].Country;
        var totalCases = row.insertCell(-1);
        var totalDeaths = row.insertCell(-1);
        var totalRecovered = row.insertCell(-1);

        
        country.innerHTML = latestCaseData.Countries[i].Country;
        totalCases.innerHTML = numberWithCommas(latestCaseData.Countries[i].TotalConfirmed);
        totalDeaths.innerHTML = numberWithCommas(latestCaseData.Countries[i].TotalDeaths);
        totalRecovered.innerHTML = numberWithCommas(latestCaseData.Countries[i].TotalRecovered);

        totalCases.style.textAlign = "center";
        totalDeaths.style.textAlign = "center";
        totalRecovered.style.textAlign = "center";
    }
}
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function scrollIntoView(element, container) {
    var containerTop = $(container).scrollTop();
    var containerBottom = containerTop + $(container).height() ;
    var elemTop = element.offsetTop - 30;
    var elemBottom = elemTop + $(element).height() + 30;
    if (elemTop < containerTop) {
        $(container).scrollTop(elemTop);
    } else if (elemBottom > containerBottom) {
        $(container).scrollTop(elemBottom - $(container).height());
    }

}

function generateCountryList() {
    var d = document.getElementById("main");
    var x = document.createElement("SELECT");
    x.setAttribute("size", "3");
    x.setAttribute("id", "countryListSelection");
    x.setAttribute("onchange", "updateGraph()")
    d.appendChild(x);

    //add the options here (country List)
    for (i in countryNameList) {
        var option = document.createElement("option");
        option.text = this.countryNameList[i];
        option.id = this.countryNameList[i];
        x.add(option);
    }
}

function setTableHeight(){
    var tableDiv = document.getElementById("tableContainer");
    var bodyBoundingBox = document.getElementsByTagName("body")[0].getBoundingClientRect()
    console.log(tableDiv.getBoundingClientRect().top, bodyBoundingBox.height);
    tableDiv.style.height = (bodyBoundingBox.height - tableDiv.getBoundingClientRect().top - 20) + "px";
    
}



/*
    Graph functions
*/

async function updateGraph() {
    if (prevHighlight != undefined) {
        prevHighlight.style.backgroundColor = "white";
    }
    var selectedValue = countryListSelection.options[countryListSelection.selectedIndex].value;
    //document.getElementById("main").innerHTML = '';

    await generateGraphData(selectedValue);
    renderLineGraph(countryTitleName);

    elmName = 'tr' + selectedValue;
    elm = document.getElementById(elmName);
    cont = document.getElementById("tableContainer");
    elm.style.backgroundColor = "#d4ff32";
    prevHighlight = elm;
    scrollIntoView(elm, cont);
}

var width;
var height;
var svg;
var generatedCountryList = false;
var xAxis;
var xAxisScale;
var yAxis;
var yAxisScale;


function renderLineGraph(countryName){
    console.log(countryName);
    document.getElementById("graphTitle").innerHTML = countryName;

    xAxis.domain(d3.extent(EXTRACTED_DATA, function (d) { return d.Date; }));
    svg.selectAll(".myXaxis").transition()
        .duration(750)
        .call(xAxisScale);

    yAxis.domain([0, d3.max(EXTRACTED_DATA, function(d) { return +d.confirmedCases  }) ]);
    svg.selectAll(".myYaxis")
        .transition()
        .duration(750)
        .call(yAxisScale);

    var temp = svg.selectAll(".lineTest")
        .data([EXTRACTED_DATA]/*, function(d){ return d.Date }*/);

        // Update the line
    temp
        .enter()
        .append("path")
        .attr("class","lineTest")
        .merge(temp)
        .transition()
        .duration(750)
        .attr("d", d3.line()
            .x(function(d) { return xAxis(d.Date); })
            .y(function(d) { return yAxis(d.confirmedCases); }))
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2.5);
}

function initialise(){
    var margin = { top: 10, right: 30, bottom: 30, left: 60 };
    width = screen.width * 0.7 - margin.left - margin.right;
    height = 350 - margin.top - margin.bottom;

    svg = d3.select("#main")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Initialise a X axis:
    xAxis = d3.scaleTime().range([0,width]);
    xAxisScale = d3.axisBottom().scale(xAxis);
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr("class","myXaxis")

    // Initialize an Y axis
    yAxis = d3.scaleLinear().range([height, 0]);
    yAxisScale = d3.axisLeft().scale(yAxis);
    svg.append("g")
    .attr("class","myYaxis")
    .attr("font-family", "Saira");

    generateCountryList();
}