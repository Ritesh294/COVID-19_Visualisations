var nameCtx;
var nameCanvas;
var names = [];

class name{
    constructor(name, position){
        this.name = name;
        this.position = position;
    }
}

/*
Creates all the names and gives them a position on the canvas
*/
function addNames(){
    names = [];
    nameCanvas = document.getElementById("listOfNames");
    nameCanvas.height = nameCanvas.getBoundingClientRect().height;
    nameCanvas.width = nameCanvas.getBoundingClientRect().width;

    nameCtx = nameCanvas.getContext('2d');

    nameCtx.font = '1.2em poppins-light';
    nameCtx.textAlign = "center";
    for(var i = 0; i < 2000; i++){
        names.push(new name(getName(), nameCanvas.height + i * 35));
        nameCtx.fillText(names[i].name, nameCanvas.width/2, names[i].position);
    }

    setInterval(moveNames, 10);
    document.getElementById("titleContainer").style.opacity = "100%";
    document.getElementById("timeTaken").style.opacity = "100%";
}

var rate = .45;
function moveNames(){
    nameCtx.clearRect(0, 0, nameCanvas.width, nameCanvas.height);

    for(var i = 0; i < names.length; i++){
        names[i].position -= rate;
        nameCtx.fillText(names[i].name, nameCanvas.width/2, names[i].position);
    }
}