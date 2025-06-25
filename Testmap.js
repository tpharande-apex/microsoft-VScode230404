let lisitems = new Map() ;

var arr = [];
var blend = ["4203","4502"]
lisitems.set("1P07",arr);
console.log(lisitems, "list items!");
arr.push("D");
lisitems.set("1P08",blend);
console.log(lisitems, "list items2");

if(lisitems.has("1P07")){
    var arr1 = lisitems.get("1P07");
    console.log(arr1,"arr1");

    
    if(arr1.includes("D")){
        arr1.push("FG");
        lisitems.set("1P07",arr1);
        console.log( "DO NO include");

    }
}


console.log(lisitems, "list items3");
