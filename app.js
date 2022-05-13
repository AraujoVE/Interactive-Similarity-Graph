var jsonData = {"main":[{"name":"a","tags":["a","d","b","c"],"orderedValues":[100,45.67,14.92,82.7],"values":[100,82.7,45.67,14.92],"value":268},{"name":"b","tags":["b","c","a","d"],"orderedValues":[45.67,100,75.29,33.31],"values":[100,75.29,45.67,33.31],"value":404},{"name":"c","tags":["c","b","d","a"],"orderedValues":[14.92,75.29,100,57.43],"values":[100,75.29,57.43,14.92],"value":121},{"name":"d","tags":["d","a","c","b"],"orderedValues":[82.7,33.31,57.43,100],"values":[100,82.7,57.43,33.31],"value":485}],"minValue":121,"maxValue":485,"valuesOrder":[3,1,0,2]}
$(document).on('ready',function(){
    var addGraphTitle = `The text input must be a .csv with the format:

    E0_name, E1_name, E2_name, ... En_name 
    E0_value, E1_value, E2_value, ... En_value 
    E0_E0_weight, E0_E1_weight, E0_E2_weight ... E0_En_weight  
    E1_E0_weight, E1_E1_weight, E1_E2_weight ... E1_En_weight  
    E2_E0_weight, E2_E1_weight, E2_E2_weight ... E2_En_weight  
    ...
    En_E0_weight, En_E1_weight, En_E2_weight ... En_En_weight  `;
    $("#add-graph-btn").attr("title",addGraphTitle);
    var minValue = 0;
    var maxValue = 1;
    var speciallyColoredId = [];
    // canvas variables
    var canvas = document.getElementById("graph");
    var maxCircleRadius = 30;
    var canvasSide = window.innerHeight * 0.975;
    var sideSize = (canvasSide/2 - maxCircleRadius)*0.975;
    canvas.width = canvasSide;
    canvas.height = canvasSide;
    var ctx=canvas.getContext("2d");
    var $canvas=$("#graph");
    var canvasOffset=$canvas.offset();
    var offsetY=canvasOffset.top;
    var offsetX=canvasOffset.left;
    var centerX = offsetX + canvas.width/2;
    var centerY = offsetY + canvas.height/2;

    // set styles

    // set the graph
    var graph;
    function defineLine(i,j){
        var lineName = i.toString()+","+j.toString();
        if(graph.lines[lineName].thickness > 0.75) ctx.strokeStyle="red"; 
        else if(graph.lines[lineName].thickness > 0.5) ctx.strokeStyle="yellow"; 
        else if(graph.lines[lineName].thickness > 0.25) ctx.strokeStyle="green"; 
        else ctx.strokeStyle="blue";

        ctx.beginPath();
        ctx.moveTo(graph.lines[lineName].start.x, graph.lines[lineName].start.y);
        ctx.lineTo(graph.lines[lineName].end.x, graph.lines[lineName].end.y);
        ctx.lineWidth = 2*graph.lines[lineName].thickness;
    }
    function defineCircle(i){
        var percentageValue = (graph.circles[i].value - jsonData.minValue)/(jsonData.maxValue - jsonData.minValue);

        if(percentageValue > 0.75) ctx.fillStyle="red"; 
        else if(percentageValue > 0.5) ctx.fillStyle="yellow"; 
        else if(percentageValue > 0.25) ctx.fillStyle="green"; 
        else ctx.fillStyle="blue"; 

        ctx.beginPath();    
        ctx.arc(graph.circles[i].center.x, graph.circles[i].center.y, graph.circles[i].radius, 0, 2 * Math.PI);
        ctx.lineWidth = graph.circles[i].tickness;
    }

    function drawLines(){
        var lineName;
        for(var i = 0; i < graph.sides; i++) {
            for(var j = i+1; j < graph.sides; j++) {
                if(!(graph.lines[`${i},${j}`].thickness >= minValue && graph.lines[`${i},${j}`].thickness <= maxValue)) continue;              
                if((speciallyColoredId.length == 0) || (speciallyColoredId.length !== 0 && (speciallyColoredId.includes(i) || speciallyColoredId.includes(j)))){
                    defineLine(i,j);
                    ctx.stroke();
                    ctx.strokeStyle="black";
                }
            }
        }
    }

    function drawTexts(){
        for(var i = 0; i < graph.sides; i++){
            ctx.font = "bold 1em Time New Roman";
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.fillText(graph.circles[i].name, graph.circles[i].center.x, graph.circles[i].center.y); 
        }
    }

    function drawCircles(){
        for(var i = 0; i < graph.sides; i++){
            defineCircle(i);
            ctx.stroke();
            ctx.fill();
            ctx.fillStyle="black";        
        }
    }

    function polygonPoints(){
        var points = [];
        for (var i = 0; i < graph.sides;i += 1) {
            //points.push([offsetX + sideSize + maxCircleRadius + sideSize * Math.cos(i * 2 * Math.PI / graph.sides), offsetY + sideSize + maxCircleRadius + sideSize * Math.sin(i * 2 * Math.PI / graph.sides)]);
            points.push([centerX + sideSize * Math.cos(i * 2 * Math.PI / graph.sides), centerY + sideSize * Math.sin(i * 2 * Math.PI / graph.sides)]);
        }
        return points;
    }

    function calcCircleRadius(value){
        var percentageVal = (value - jsonData.minValue)/(jsonData.maxValue - jsonData.minValue)
        return maxCircleRadius*0.5 + percentageVal*0.5*maxCircleRadius;
    }

    function setGraphValues(points){
        var sizeRatio = jsonData.maxValue - jsonData.minValue
        for(var i = 0; i < points.length; i++) {
            graph.circles[i] = {
                "name": jsonData["main"][i]["name"],
                "value": jsonData["main"][i]["value"],
                "values": jsonData["main"][i]["values"],
                "orderedValues": jsonData["main"][i]["orderedValues"],
                "tags": jsonData["main"][i]["tags"],
                "center": {
                    "x": points[i][0],
                    "y": points[i][1]
                },
                "radius": calcCircleRadius(jsonData["main"][i]["value"]),
                "tickness": 1
            }
        }
        for(var i = 0; i <points.length; i++){
            for(var j = i+1; j < points.length; j++) {
                graph.lines[i.toString()+","+j.toString()] = {
                    "start": {
                        "x": points[i][0],
                        "y": points[i][1]
                    }, 
                    "end": {
                        "x": points[j][0],
                        "y": points[j][1]
                    },
                    //random thickness
                    "thickness" : graph.circles[i].orderedValues[j] * 0.01
                }
            }
        }
    }
    
    function setInitialValues(){
        graph = {
            "sides" : jsonData.main.length,
            "circles": {},
            "lines": {}
        };
        const context = canvas.getContext('2d');
    
        context.clearRect(0, 0, canvas.width, canvas.height);

        canvas = document.getElementById("graph");
        canvasSide = (window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth) * 0.975;
        sideSize = (canvasSide/2 - maxCircleRadius)*0.975;
        canvas.width = canvasSide;
        canvas.height = canvasSide;
        canvasOffset=$canvas.offset();
        offsetY= canvasOffset.top;
        offsetX=canvasOffset.left;
        centerX = offsetX + canvas.width/2;
        centerY = offsetY + canvas.height/2;  

        ctx.fillStyle="green";
        ctx.strokeStyle="transparent";
        ctx.lineWidth=2;    
    }

    function generateGraph(){
        setInitialValues();
        var points = polygonPoints();
        setGraphValues(points);
        drawLines();
        drawCircles();
        drawTexts();
    }

    function getProgressBar(index){
        var curVal = graph.circles[jsonData.valuesOrder[index]].value;
        var width = 100*((curVal - jsonData.minValue)/jsonData.maxValue)
        var progressbarText= `
        <div class="p-1">
            <div class="progress p-0 position-relative border border-dark border-1">
                <div class="progress-bar border border-dark border-2" id="progressbar-${index}" role="progressbar" style="width: ${width}%" aria-valuenow="${curVal}" aria-valuemin="${jsonData.minValue}" aria-valuemax="${jsonData.maxValue}"></div>    
                <small id="progressbar-text-${index}" class="justify-content-center d-flex position-absolute w-100" style="font-weight: bold;">${curVal}</small>
            </div>
        </div>`
        return progressbarText;
    }


    function setProgressBar(i,value,minValue,maxValue,additional,emptyText=false){
        var width = 100*((value - minValue)/(maxValue-minValue))

        var dirProgressBarObj = $(`#progressbar-${i}`);
        var dirProgressBarText = $(`#progressbar-text-${i}`);

        dirProgressBarObj.attr("style",`width: ${width}%`);
        dirProgressBarObj.attr("aria-valuemin",`${minValue}`);
        dirProgressBarObj.attr("aria-valuemax",`${maxValue}`);
        dirProgressBarObj.attr("aria-valuenow",`${value}`);        
        dirProgressBarText.text((emptyText ? `` : `${value}${additional}`));
        if(width > 75.0){
            dirProgressBarObj.removeClass("bg-success");
            dirProgressBarObj.removeClass("bg-warning");
            dirProgressBarObj.addClass("bg-danger");
        }
        else if(width > 50.0){
            dirProgressBarObj.removeClass("bg-success");
            dirProgressBarObj.removeClass("bg-danger");
            dirProgressBarObj.addClass("bg-warning");
        }
        else if(width > 25.0){
            dirProgressBarObj.removeClass("bg-warning");
            dirProgressBarObj.removeClass("bg-danger");
            dirProgressBarObj.addClass("bg-success");
        }
        else{
            dirProgressBarObj.removeClass("bg-warning");
            dirProgressBarObj.removeClass("bg-danger");
            dirProgressBarObj.removeClass("bg-success");
        }

    }

    function setSideTable(){
        var table = $("#side-table");
        var col1Lines = Math.ceil(graph.sides/2);
        var col2Lines = Math.floor(graph.sides/2);
        var endHtml = `<div class="col-md-6 col-12" id="first-col">`;
        var iterPos = 0;

        for(var i = 0; i<col1Lines; i++){
            endHtml += `<div class="row m-2 border border-3 border-dark rounded" id="block-${iterPos}"><div class="col"><div id="text-${iterPos}" class="text-center" style="font-weight: bold;">${graph.circles[jsonData.valuesOrder[iterPos]].name}</div>${getProgressBar(iterPos)}</div></div>`;
            iterPos++;
        }
        endHtml += `</div><div class="col-md-6 col-12" id="first-col">`;
        for(var i = 0; i<col2Lines; i++){
            endHtml += `<div class="row m-2 border border-3 border-dark rounded" id="block-${iterPos}"><div class="col"><div id="text-${iterPos}" class="text-center" style="font-weight: bold;">${graph.circles[jsonData.valuesOrder[iterPos]].name}</div>${getProgressBar(iterPos)}</div></div>`;
            iterPos++;
        }
        endHtml += `</div>`
        table.html(endHtml);

        for(var i = 0;i < graph.sides; i++) setProgressBar(i,graph.circles[jsonData.valuesOrder[i]].value,jsonData.minValue,jsonData.maxValue,"");
    }


    generateGraph();
    setSideTable();

    // called when user clicks the mouse

    function setName(i,name){
        var dirName = "#text-"+i;
        var dirNameObj = $(dirName);
        dirNameObj.text(name);
    }

    function setMainSidebar(){
        for(var i = 0;i<graph.sides;i++){
            setName(i,graph.circles[jsonData.valuesOrder[i]].name);
            setProgressBar(i,graph.circles[jsonData.valuesOrder[i]].value,jsonData.minValue,jsonData.maxValue,"");
        }
    }

    function fullViewActivation(){

        var fullViewBtn = $("#full-view-btn");
        var title = $("#title-dir");
        title.text("Tabela Geral: Valores dos Elementos");
        fullViewBtn.addClass("disabled");
        speciallyColoredId = [];
        setMainSidebar();
        generateGraph();

    }

    function partialNameAndProgressbar(circleId){
        generateGraph();
        var value;
        var nameText;
        if(speciallyColoredId.length == 1){
            circleId = speciallyColoredId[0];
            for(var i = 0; i< graph.sides; i++){
                value = graph.circles[circleId].values[i];
                if((value/100)>=minValue && (value/100)<=maxValue){
                    nameText = graph.circles[circleId].tags[i];
                    setName(i,nameText);
                    setProgressBar(i,value,0,100,"%");
                }
                else{
                    setName(i,"");
                    setProgressBar(i,0,0,100,"",true);
                }
            }    
        }
        else setMainSidebar(); 
    }

    function execAction(circleId){
        var value;
        var nameText;
        var title = $("#title-dir")
        title.text(`Tabela de Pesos de: ${graph.circles[circleId].name}`);
        var befLen = speciallyColoredId.length;
        if(speciallyColoredId.includes(circleId)) speciallyColoredId.splice(speciallyColoredId.indexOf(circleId),1);
        else speciallyColoredId.push(circleId);
        if(speciallyColoredId.length == 0) fullViewActivation();
        else{
            generateGraph();
            if(speciallyColoredId.length == 1){
                if(befLen>1) circleId = speciallyColoredId[0];
                partialNameAndProgressbar(circleId);
            }
            else setMainSidebar(); 
        }  
    }    

    function graphMouseDown(e){
        e.preventDefault();
        var fullViewBtn = $("#full-view-btn");

        

        // get the mouse position
        var scrollX = $(window).scrollLeft()
        var scrollY = $(window).scrollTop()
        var mouseX=parseFloat(e.clientX-offsetX+scrollX);
        var mouseY=parseFloat(e.clientY-offsetY+scrollY);
        for(var i=0;i<graph.sides;i++){
            var circle=graph.circles[i];
            defineCircle(i);
            if(ctx.isPointInPath(mouseX,mouseY)){
                fullViewBtn.removeClass("disabled");
                execAction(i);
                break;
            }
        }
    }

    function updateGraph(newValue){
        jsonData = {"main":[],"minValue":-1,"maxValue":-1,"valuesOrder":[]}
        var fileLines = newValue.split("\n");
        var elemNames = fileLines[0].split(",");
        var weights = fileLines[1].split(",");
        for (var i = 0; i < weights.length; i++) weights[i] = parseFloat(weights[i]);
        var curLine;
        var curTags;
        var curIndexes;
        var curDict;
        var orderedCurLine;

        for (var i = 2; i < fileLines.length; i++){
            curDict = {};
            curLine = fileLines[i].split(",");
            for(var j = 0;j < elemNames.length; j++) curLine[j] = parseFloat(curLine[j]);
            curIndexes = Array.from(Array(curLine.length).keys()).sort((a, b) => curLine[a] > curLine[b] ? -1 : (curLine[b] > curLine[a]) | 0);

            curTags = [];
            for(var j = 0; j < elemNames.length; j++) curTags.push(elemNames[curIndexes[j]]);

            curDict["name"] = elemNames[i-2];
            curDict["tags"] = curTags;
            curDict["orderedValues"] = curLine;
            orderedCurLine = [];
            for(var j = 0; j < elemNames.length; j++) orderedCurLine.push(curLine[curIndexes[j]]);

            curDict["values"] = orderedCurLine;
            curDict["value"] = weights[i-2];
            jsonData.main.push(curDict);
        }
        
        var weightsOrder = Array.from(Array(weights.length).keys())
        .sort((a, b) => weights[a] > weights[b] ? -1 : (weights[b] > weights[a]) | 0)
        
        jsonData["valuesOrder"] = weightsOrder;
        jsonData["minValue"] = weights[weightsOrder[weightsOrder.length-1]]
        jsonData["maxValue"] = weights[weightsOrder[0]];

        generateGraph();
        setSideTable();    

    }

    function changeGraph(e){
        e.preventDefault();
        fullViewActivation();
        var myFile = $('#file-input').prop('files')[0];
        let reader = new FileReader();
        reader.readAsText(myFile);
        reader.onload = function() {
            updateGraph(reader.result);
        };
    }

    function checkValidity(e){
        e.preventDefault();

        var minValAux = $("#min-val-input").val();
        var maxValAux = $("#max-val-input").val();
        var applyBtn = $("#apply-range-btn");

        if(maxValAux<minValAux || minValAux < 0 || maxValAux > 1) applyBtn.addClass("disabled");
        else applyBtn.removeClass("disabled");
    }

    function changeMinMax(e){
        e.preventDefault();
        minValue = $("#min-val-input").val();
        maxValue = $("#max-val-input").val();
        var circleId;
        if(speciallyColoredId.length == 0) fullViewActivation();
        else{
            generateGraph();
            if(speciallyColoredId.length == 1) partialNameAndProgressbar(speciallyColoredId[0]);
            else setMainSidebar(); 
        }  

    }

    function resetRangeBtn(e){
        e.preventDefault(e);
        $("#min-val-input").val(0);
        $("#max-val-input").val(1);
        changeMinMax(e);
    }


    //On window resize
    $(window).on("resize",function(){generateGraph();});
    // listen for mousedown events
    $("#graph").on("mousedown",function(e){graphMouseDown(e);});
    //$("#graph").mousedown(function(e){graphMouseDown(e);});

    $("#full-view-btn").on("mousedown",function(){fullViewActivation();});

    $("#add-graph-btn").on("mousedown",function(e){$("#file-input").trigger("click");});

    $("#file-input").on("change",function(e){changeGraph(e);})

    $(".input-min-max").on("input",function(e){checkValidity(e);});

    $("#apply-range-btn").on("mousedown",function(e){changeMinMax(e);});

    $("#reset-range-btn").on("mousedown",function(e){resetRangeBtn(e);});

});