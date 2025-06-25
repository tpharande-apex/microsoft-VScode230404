var CMS100_MWOOPE_V2 = (function () {
  // Script to display cummulative totals in new column
 
  function CMS100_MWOOPE_V2(args) {
    this.controller = args.controller;
    this.log = args.log;
    this.scriptName = "CMS100_MWOOPE_V2.js";
  }
  /**
     * Script initialization function.
     */
  CMS100_MWOOPE_V2.Init = function (args) {
    this.controller = args.controller;
    new CMS100_MWOOPE_V2(args).run(args);
  };
 
  CMS100_MWOOPE_V2.prototype.run =  async function (args) {
        debugger;
		var list = this.controller.GetGrid();
		var controller = this.controller;
        var table = this.controller.GetValue("WWIBCA");
        var customColumnNum;
		
		// Enable script only for MWOOPE Information Browse Category
        if(table == "MWOOPE"){
			customColumnNum = list.getColumns().length + 1;
			this.appendColumn(list, customColumnNum);
			this.populateData(list, customColumnNum);
			this.attachEvents(this.controller, list, customColumnNum);
		}
		
    };
	
	// Append new custom column to existing columns
    CMS100_MWOOPE_V2.prototype.appendColumn = function (list, columnNum) {
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
    CMS100_MWOOPE_V2.prototype.populateData = async function (list, columnNum) {
        var columnId = "C" + columnNum;
		var Total;
		var controller = this.controller;
        
		debugger;
		if (ScriptUtil.version >= 2.0) {
			var dataset = list.getData();
			var temp = 0;
            var tempDate = "";
			for (var i = 0; i < dataset.length; i++) {
				var data = dataset[i];
                if(tempDate != data.VHSTDT){
					temp = 0;
					tempDate = data.VHSTDT;
				}
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
				list.setData(dataset);
				
			}
			
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
    CMS100_MWOOPE_V2.prototype.attachEvents = function (controller, list, columnNum) {
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
    CMS100_MWOOPE_V2.prototype.detachEvents = function () {
        this.unsubscribeReqCompleted();
    };
    return CMS100_MWOOPE_V2;
})();