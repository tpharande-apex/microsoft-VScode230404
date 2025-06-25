/**
 * H & S Bakery : Volume Based Agreement 
 * PPS201 - Display wet weight purchase price and wet weight line total
 * 
 * Panels where the script needs to be added :
 * PPS201_E
 *
 */

var PPS201WetWeight_V3 = /** @class */ (function () {
  // Declare the variables
 
  function PPS201WetWeight_V3(args) {
    this.controller = args.controller;
    this.log = args.log;
    this.scriptName = "PPS201WetWeight_V3.js";
  }
  /**
     * Script initialization function.
     */
  PPS201WetWeight_V3.Init = function (args) {
    this.controller = args.controller;
    new PPS201WetWeight_V3(args).run(args);
  };
  PPS201WetWeight_V3.prototype.run = async function (args) {
        debugger;
		var company = ScriptUtil.GetUserContext("CurrentCompany");		
		var supplier = ScriptUtil.GetFieldValue("IASUNO");
		var agrnum = ScriptUtil.GetFieldValue("WBOURR");
		var item = ScriptUtil.GetFieldValue("WBITNO");
		var PONum = ScriptUtil.GetFieldValue("IAPUNO");
		var POLine = ScriptUtil.GetFieldValue("WWPNLI");
		var POSubline = ScriptUtil.GetFieldValue("WWPNLS");
		var warehouse = ScriptUtil.GetFieldValue("IBWHLO");
		var AgrPriority = "";
		var panelMode = args.controller.GetMode();
		var file = "MPAGRL";
		var count = 0;
		var contentElement = this.controller.GetContentElement();
		var flag = "";
		var pnls = "";
		var setflag = 0;
		var currentPanel = this.controller.GetPanelName();
		var GetItem = new MIRequest();
		GetItem.program = "MMS200MI";
		GetItem.transaction = "Get";
		GetItem.outputFields = ["ACTI"];
		GetItem.record = {
			ITNO: item
		};
		await MIService.Current.executeRequest(GetItem).then(async function (response) {
			console.log("yay got qty");
			flag = response.items[0].ACTI;
		}).catch(function(response) {
			console.log("nah didn't get qty",response);
		});
		
		// Add textboxes only for catch weight items			
		if(flag == 2){
			if(currentPanel == "PPA201E0"){
				// Add Button
				if(panelMode == 2){
					var buttonElement = new ButtonElement();
					buttonElement.Name = "Vaidate Changed Values";
					buttonElement.Value = "Validate Changed Values";
					buttonElement.Position = new PositionElement();
					buttonElement.Position.Top = 9;
					buttonElement.Position.Left = 50;
					buttonElement.Position.Width = 10;
					var contentElement = args.controller.GetContentElement();
					var button = contentElement.AddElement(buttonElement);
					var Qty = args.controller.GetValue("WBORQA");
					var filter = PONum +"_"+POLine+"_"+Qty;	
					
					button.click({}, async function () {
						debugger;
						Qty = args.controller.GetValue("WBORQA");
						filter = PONum +"_"+POLine+"_"+Qty;
						if(!InstanceCache.ContainsKey(args.controller, "Filter")){
						InstanceCache.Add(args.controller, "Filter",filter);
						InstanceCache.Add(args.controller, "Quantity",Qty);						
						console.log("Inside button");				
						args.controller.PressKey("F5");
						}else{
							var fltr = InstanceCache.Get(args.controller, "Filter");
							if(fltr != filter){
								InstanceCache.Remove(args.controller, "Filter");
								InstanceCache.Add(args.controller, "Filter",filter);
								InstanceCache.Remove(args.controller, "Quantity");
								InstanceCache.Add(args.controller, "Quantity",Qty);								
							}
						}							
					});
					}
				//Add textboxes
				var labelWetwt = new LabelElement();
				labelWetwt.Name = "Wet Weight Purchase Price";
				labelWetwt.Value = "Wet Weight Purchase Price";
				labelWetwt.Position = new PositionElement();
				labelWetwt.Position.Top = 21;
				labelWetwt.Position.Left = 30;
				var label = contentElement.AddElement(labelWetwt);
				var Wetwt = new TextBoxElement();
				Wetwt.Name = "WetWeightPurchasePrice";
				Wetwt.TabIndex = 2;
				Wetwt.Constraint = {
					IsNumeric: true,
					IsUpper: false,
					MaxLength: 10,
					MaxDecimals: 2,
					MaxRow: 1,
					MaxColumn: 20
				};
				Wetwt.Value = "";
				Wetwt.Position = new PositionElement();
				Wetwt.Position.Top = 21;
				Wetwt.Position.Left = 50;
				Wetwt.Position.Width = 10;
				var Wetwt = contentElement.AddElement(Wetwt);
				
				var labelLineTotal = new LabelElement();
				labelLineTotal.Name = "Line Total Sucrose";
				labelLineTotal.Value = "Line Total Sucrose";
				labelLineTotal.Position = new PositionElement();
				labelLineTotal.Position.Top = 22;
				labelLineTotal.Position.Left = 30;
				var label = contentElement.AddElement(labelLineTotal);
				
				var LineTotal = new TextBoxElement();
				LineTotal.Name = "LineTotalSucrose";
				LineTotal.TabIndex = 2;
				LineTotal.Constraint = {
					IsNumeric: true,
					IsUpper: false,
					MaxLength: 10,
					MaxDecimals: 2,
					MaxRow: 1,
					MaxColumn: 20
				};
				LineTotal.Value = "";
				LineTotal.Position = new PositionElement();
				LineTotal.Position.Top = 22;
				LineTotal.Position.Left = 50;
				LineTotal.Position.Width = 10;
				var LineTotal = contentElement.AddElement(LineTotal);
			
				// Disable the fields - Read only
				$('#WetWeightPurchasePrice').disable().css({
					"background-color": "#E0E0E1",
					"color": "black"
				});
				$('#LineTotalSucrose').disable().css({
					"background-color": "#E0E0E1",
					"color": "black"
				});
				
				// Declare variables 
				var grpID = "";
				var key1 = "";
				var key2 = "";
				var fvdt = "";
				var WetPP = "";
				var sucrosetotal = "";
				var orderQty = args.controller.GetValue("WBORQA");
				
			// Calcualte the fields
			if(panelMode == 2 || (panelMode == 1 && (orderQty!= null || orderQty!= '')) || panelMode == 5){				
				// Get all agreement lines and get primary keys of CUGEX1 table			
				var GetLineQty = new MIRequest();
				GetLineQty.program = "PPS100MI";
				GetLineQty.transaction = "LstAgrLine";
				GetLineQty.outputFields = ["OBV1","OBV2","FVDT","GRPI"];
				GetLineQty.record = {
					CONO: company,
					SUNO: supplier,
					AGNB: agrnum			
				};						
				await MIService.Current.executeRequest(GetLineQty).then(async function (response) { 
				for(let i=0;i<response.items.length;i++){
					var Obv1 = response.items[i].OBV1;
					var Obv2 = response.items[i].OBV2;
					grpID = response.items[i].GRPI;
					if((Obv1 == warehouse && Obv2 == item && grpID == 15) || (Obv1 == item && grpID == 10)){
						key1 = Obv1;
						key2 = Obv2;		
						fvdt = response.items[i].FVDT;
					}
				}
				}).catch(function(response) {
					console.log("error",response);
				});
				
				// Get dry weight % of item
				var GetDryQty = new MIRequest();
				GetDryQty.program = "CUSEXTMI";
				GetDryQty.transaction = "GetFieldValue";
				GetDryQty.outputFields = ["N096"];
				GetDryQty.record = {
					FILE: file,
					PK01: supplier,
					PK02: agrnum,
					PK03: grpID,
					PK04: key1,
					PK05: key2,
					PK08: fvdt					
				};					
				await MIService.Current.executeRequest(GetDryQty).then(async function (response){
					drywt = parseFloat(response.items[0].N096);
				}).catch(function(response) {
					drywt = 0;
					console.log("error",response);
				});
				drywt = drywt/100;
				// Get purchase price
				var purprice = this.controller.GetValue("WBPUPR");
				var agrNumb = this.controller.GetValue("WBOURR");
				orderQty = this.controller.GetValue("WBORQA");
				var fltr = InstanceCache.Get(args.controller, "Filter");
				if(InstanceCache.ContainsKey(args.controller, "Filter") && panelMode == 2 && fltr != filter){
					orderQty = InstanceCache.Get(args.controller, "Quantity");
					this.controller.SetValue("WBORQA",orderQty);
					this.controller.SetValue("WBPUPR",purprice);
					this.controller.SetValue("WBOURR",agrNumb);
				}
				// Set wet purchase price
				WetPP =  parseFloat(purprice) * parseFloat(drywt);
				sucrosetotal = parseFloat(orderQty)* parseFloat(WetPP);
				WetPP = WetPP.toFixed(3);
				sucrosetotal = sucrosetotal.toFixed(3);	
			}		
			this.controller.SetValue("WetWeightPurchasePrice",WetPP);
			this.controller.SetValue("LineTotalSucrose",sucrosetotal);
			}
		}					
	};
  return PPS201WetWeight_V3;
}());