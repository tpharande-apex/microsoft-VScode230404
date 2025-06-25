var CMS010_MCPSPE = (function () {
  // Script to display cummulative totals in new column
 
  function CMS010_MCPSPE(args) {
    this.controller = args.controller;
    this.log = args.log;
    this.scriptName = "CMS010_MCPSPE.js";
  }
  /**
     * Script initialization function.
     */
  CMS010_MCPSPE.Init = function (args) {
    this.controller = args.controller;
    new CMS010_MCPSPE(args).run(args);
  };
 
  CMS010_MCPSPE.prototype.run =  async function (args) {
        debugger;
		var list = this.controller.GetGrid();
		var controller = this.controller;
        var table = this.controller.GetValue("WWIBCA");
        var customColumnNum;
		
		// Enable script only for MCPSPE Information Browse Category
        if(table == "MCPSPE"){
			customColumnNum = list.getColumns().length + 1;
			this.appendColumn(list, customColumnNum);
			this.populateData(list, customColumnNum);
			this.attachEvents(this.controller, list, customColumnNum);
		}
		
    };
	
	// Append new custom column to existing columns
    CMS010_MCPSPE.prototype.appendColumn = function (list, columnNum) {
		 debugger;
        var columnId = "C" + columnNum;
        var columns = list.getColumns();
        var newColumn = {
            id: columnId,
            field: columnId,
            name: "Cummulative Total",
            width: 100
        };
		
		if (columns.length < columnNum) {
			columns.push(newColumn);
		}		
		list.setColumns(columns);
    };
	
	// populate cummulative totals in the new column
    CMS010_MCPSPE.prototype.populateData = async function (list, columnNum) {
        var columnId = "C" + columnNum;
		var Total;
		var controller = this.controller;
        
		debugger;
		if (ScriptUtil.version >= 2.0) {
			var dataset = list.getData();
			var temp = 0;
			for (var i = 0; i < dataset.length; i++) {
				var data = dataset[i];
				if(data.HORS == null && i== 0){
					data[columnId] = data.HORS;
					
				}
				else if(data.HORS == null){
					data[columnId] = parseFloat(temp).toFixed(2);
					temp = parseFloat(temp);
				}
				else{
					data[columnId] = (parseFloat(temp) + parseFloat(data.HORS)).toFixed(2);
					temp = parseFloat(temp) + parseFloat(data.HORS);
				}
				
				
			}
			list.setData(dataset);
		}
		else {
            debugger;
            if(ChargeDistribution == "OBCUNO"){
                for (var i = 0; i < list.getData().getLength(); i++) {
                    var newData = {};
                    Customer = list.getData().getItem(i)["C1"];
                    newData[columnId] = CustomerName;
                    newData["id_" + columnId] = "R" + (i + 1) + columnId;
                    $.extend(list.getData().getItem(i), newData);
                }
        	var columns = list.getColumns();
			list.setColumns(columns);
			}
		}
    };
    CMS010_MCPSPE.prototype.attachEvents = function (controller, list, columnNum) {
        var _this = this;
        this.unsubscribeReqCompleted = controller.RequestCompleted.On(function (e) {
            //Populate additional data on scroll
            if (e.commandType === "PAGE" && e.commandValue === "DOWN") {
                _this.populateData(list, columnNum);
            }
            else {
                _this.detachEvents();
            }
        });
    };
    CMS010_MCPSPE.prototype.detachEvents = function () {
        this.unsubscribeReqCompleted();
    };
    return CMS010_MCPSPE;
})();