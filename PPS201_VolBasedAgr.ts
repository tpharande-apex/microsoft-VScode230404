/**
 * H & S Bakery : Volume Based Agreement
 * PPS200 - Copy operation check for balance quantity and copy if balance is available else warning pop-up.
 * PPS201 - Qty validation during Addition, updation and copy of line.
 * PPS250 - Check if balance qty is available during confirmation of PO in PPS250 Panel.
 * 
 * Panels where the script needs to be added :
 * PPS200/B, PPS200/C, PPS201/B1, PPS201/E, PPS250/E
 *
 */

 class PPS201_VolBasedAgr {
    private controller: IInstanceController;
    private isDialogShown: boolean;
    private currentPanel: string;
    private currency :string;
    private unsubscribeRequesting = null;
    private panelMode: string;
    private supplier: string;
    private agrnum: string;
    private item: string;
    private file: string;
    private warehouse: string;
    private buyer: string;
    private company: string;
    private PurchaseQty: string;
	private PurQtyUnits: string;
    private BalanceQty: string;
    private AgreedQty: string;
    private TotalPurchaseQty: string;
    private NewQty: string;
    private PONum: string;
    private POline: string;
	private Counter=0;
	private operation: string;
	private copycheck: string;
	private prevQty: string;
	private TotalQty: string;
	private POSubline: string; 
	private totalPUQT: string; 
	private ordertype: string; 
	private pricetext: string; 
	private warehouse: string; 
	private orderQty: string; 
	private count=0; 
	private DryWt: string; 
	

    constructor(scriptArgs: IScriptArgs) {
        this.controller = scriptArgs.controller;
        this.isDialogShown = false;
    }
	public static Init(args: IScriptArgs): void {
        new PPS201_VolBasedAgr(args).run();        
    }
    private  run(): void {
	
	// Get panel details
        this.currentPanel = this.controller.GetPanelName();
        this.panelMode = this.controller.GetMode();
        this.file = "MPAGRH";
		this.company = ScriptUtil.GetUserContext("CurrentCompany");
		this.totalPUQT = "0";
		if(this.currentPanel === "PPA201E0"){
			this.supplier = ScriptUtil.GetFieldValue("IASUNO");
			this.item = ScriptUtil.GetFieldValue("WBITNO");					
			this.warehouse = ScriptUtil.GetFieldValue("IBWHLO");		
			this.prevQty = ScriptUtil.GetFieldValue("WBORQA");
			this.prevQty = this.prevQty.toString().replace(',','.');
			this.PurQtyUnits = ScriptUtil.GetFieldValue("WEPUUN");
			this.pricetext = ScriptUtil.GetFieldValue("WBPTCD");
			this.PONum = ScriptUtil.GetFieldValue("IAPUNO");
			this.POline = ScriptUtil.GetFieldValue("WWPNLI");
			this.POSubline = ScriptUtil.GetFieldValue("WWPLNS");
			// Price Text values
			if(this.pricetext > 0 && this.panelMode == 1){
				this.controller.SetValue("WBOURR"," ");
				this.controller.SetValue("WBOURT"," ");
				this.controller.SetValue("WBPUPR"," ");
			}
			// Flag is to set the existing values after refreshing the panel
			if(InstanceCache.ContainsKey(this.controller, "Flag") && this.panelMode == 2){
				var Tempflag = InstanceCache.Get(this.controller, "Flag");
				var flag = this.PONum+"_"+this.POline+"_"+this.POSubline;			
				var tempQty = InstanceCache.Get(this.controller, "TempQty");
				if(!InstanceCache.ContainsKey(this.controller, "TempQty")){
					tempQty = "0";
				}
				// Check if flags are same and set the quantity before refresh into Quantity
				if(flag == Tempflag && tempQty!= "0"){
					this.controller.SetValue("WBORQA",tempQty);
				}				
			}
			this.attachEvents(this.controller);			    
		}      	
		
		// PPS201_B1 panel
		if(this.currentPanel === "PPA201BC" ){
			this.supplier = ScriptUtil.GetFieldValue("IASUNO");
			this.PONum = ScriptUtil.GetFieldValue("IAPUNO");
			var flag = 0;
			this.attachEvents(this.controller);
		}
		
		//PPS200_C panel
		if(this.currentPanel === "PPA200C0"){
			this.PONum = ScriptUtil.GetFieldValue("WWPUNO");			
			this.supplier = ScriptUtil.GetFieldValue("WWSUNO");					
			this.attachEvents(this.controller);
		}
		
		//PPS250_E panel
		if(this.currentPanel === "PPA250E0"){
			this.PONum = ScriptUtil.GetFieldValue("IBPUNO");			
			this.supplier = ScriptUtil.GetFieldValue("IBSUNO");	
			this.POline = ScriptUtil.GetFieldValue("WBPNLI");
			this.POSubline = ScriptUtil.GetFieldValue("WBPNLS");
			this.prevQty = ScriptUtil.GetFieldValue("WBCFQA");
			this.attachEvents(this.controller);
		}
		
		//PPS250_G1 panel
		if(this.currentPanel === "PPA220GC"){
			this.PONum = ScriptUtil.GetFieldValue("SGPUNO");			
			this.supplier = ScriptUtil.GetFieldValue("SGSUNO");	
			this.POline = ScriptUtil.GetFieldValue("SGPNLI");
			this.POSubline = ScriptUtil.GetFieldValue("SGPNLS");
			this.prevQty = ScriptUtil.GetFieldValue("WGCFQA");
			this.attachEvents(this.controller);
		}
    }
	private attachEvents(controller: IInstanceController) {
        this.unsubscribeRequesting = controller.Requesting.On((e: CancelRequestEventArgs) => {
			let detachEvents = true;
			console.log("Attach events "+this.panelMode);
			debugger;
			// PPS201_E PO line copy check	
			if (((e.commandType === "KEY" && e.commandValue === "ENTER") || (e.commandValue === "F3")) && (this.currentPanel === "PPA201E0") && this.Counter==0) {
				this.agrnum = this.controller.GetValue("WBOURR");
				this.NewQty = this.controller.GetValue("WBORQA");
				console.log("agrnum  "+this.agrnum);
				console.log("NewQty "+this.NewQty);
				// Add values to Cache for after refresh in case of values not validated
				if(this.panelMode == 2){
					var flag = this.PONum+"_"+this.POline+"_"+this.POSubline;
					InstanceCache.Add(this.controller, "TempQty",this.NewQty);
					InstanceCache.Add(this.controller, "Flag",flag);
				}
				// check whether quantity entered is 0 or not
				if(parseInt(this.NewQty) != 0){					
					this.Counter++;
					detachEvents = false;
					e.cancel = true;
					this.callmethod();
				}
			}
			if ((e.commandType === "LSTOPT" && e.commandValue === "2") && (this.currentPanel === "PPA201BC") && this.Counter==0) {
				this.Counter++;
				InstanceCache.Remove(this.controller,"Filter");			
				InstanceCache.Remove(this.controller,"Flag");								
				
            }
			
			//PPS200 - Planned PO line copy  
			if ((e.commandType === "LSTOPT" && e.commandValue === "3") && (this.currentPanel === "PPA201BC") && this.Counter==0) {
				this.operation = "Copy";
				this.NewQty = ListControl.ListView.GetValueByColumnName("WSORQA");
				this.POline = ListControl.ListView.GetValueByColumnName("WSPNLI");
				console.log("POline in list "+this.POline);
				
				this.Counter++;
                e.cancel = true; // same panel
                detachEvents = false;
				this.callmethod();
            }
			
			// Intercompany DO Check
			if((e.commandType === "KEY" && e.commandValue === "ENTER") && (this.currentPanel === "PPA201BC") && this.Counter==0){
				this.item = this.controller.GetValue("WBITNO");
				this.warehouse = this.controller.GetValue("WBWHLO");
				this.orderQty = this.controller.GetValue("WBORQA");
				if(this.item!= "" && this.warehouse!="" && this.orderQty!=""){
					this.Counter++;
					e.cancel = true; // same panel
					detachEvents = false;
					this.ItemCheck(this.item, this.warehouse, this.controller); 
				}			
			}
			
			
			// PPS200_C PO Head Copy check 
			if ((this.currentPanel === "PPA200C0") && (e.commandType === "KEY" && e.commandValue === "ENTER")  && this.Counter==0) {			
				this.copycheck = this.controller.GetValue("CPLINE");
				debugger;
				console.log("POline in list "+this.copycheck);
				this.Counter++;
				if(this.copycheck == true){	
					e.cancel = true;// same panel
					detachEvents = false;
					this.callmethod();
				}				
            }
			
			// PPS250_E Change validity check 
			if ((this.currentPanel === "PPA250E0") && this.Counter==0 && (e.commandType === "KEY" && e.commandValue === "ENTER") && this.panelMode == 2) {			
				this.Counter++;
				this.NewQty = this.controller.GetValue("WBCFQA");
				e.cancel = true;// same panel
				detachEvents = false;
				this.callmethod();	
            }
			
			//PPS220_G1 panel
			if ((this.currentPanel === "PPA220GC") && this.Counter==0 && (e.commandType === "KEY" && e.commandValue === "ENTER")) {			
				this.Counter++;
				this.NewQty = this.controller.GetValue("R1C6");
				e.cancel = true;// same panel
				detachEvents = false;
				this.callmethod();	
            }
			
			if (detachEvents) {
                this.detachEventsRequesting();
            }
        });
	}
	
	private async callmethod()	{
		if(this.currentPanel === "PPA201BC" && (this.operation == "Copy" || this.operation == "Delete")){
			this.POSubline = "0";
			await this.GetAgrNum(this.supplier,this.PONum,this.POline,this.POSubline,this.controller);
		}else if(this.currentPanel === "PPA200C0"){
			await this.LstAgrNum(this.PONum,this.controller);
		}else if(this.currentPanel === "PPA250E0" || this.currentPanel === "PPA220GC"){
			await this.GetAgrNum(this.supplier,this.PONum,this.POline,this.POSubline,this.controller);
		} else{
		   await this.callApi(this.supplier,this.agrnum,this.controller);
		}
	}
	
	private async LstAgrNum(this.PONum,this.controller){
		let responsevalue: any = await this.PPS200_LstLine(this.PONum);	
		console.log("response "+responsevalue);
		var tempQty =0;
		if (responsevalue !== 'undefined' && responsevalue !== null) {
		for(let i=0;i<responsevalue.length;i++){	
			tempQty = parseFloat(tempQty) + parseFloat(responsevalue[i].ORQA);
		}
			this.TotalQty = tempQty;
            this.agrnum = responsevalue[0].OURR;
			console.log("In lst agr num");
			await this.callApi(this.supplier,this.agrnum,this.controller);
		}		
	}
	
	private async GetAgrNum(this.supplier,this.PONum,this.POline,this.POSubline,this.controller){
		let responsevalue: any = await this.PPS200_GetLine(this.PONum,this.POline, this.POSubline);	
		console.log("response "+responsevalue);
		if (responsevalue !== 'undefined' && responsevalue !== null) {
            this.agrnum = responsevalue[0].OURR;
			this.item = responsevalue[0].ITNO;
			console.log("In Get agr num");
			await this.callApi(this.supplier,this.agrnum,this.controller);
		}		
	}
	
	private async callApi(SUNO,AGRNUM,this.controller) {	
		let responsevalue: any = await this.CUSEX_GetFieldValue(SUNO,AGRNUM);
		var drywt = 1;
		debugger;
        if (responsevalue !== 'undefined' && responsevalue !== null) {
            this.BalanceQty = responsevalue[0].A030;
			this.AgreedQty = responsevalue[0].N096;
			this.TotalPurchaseQty = responsevalue[0].N196;
			var AgrPriority = "50";
			var FVDT = "0";
			let responseAgr: any = await this.GetAgrDetails(SUNO,AGRNUM);
			for(let i=0;i<responseAgr.length;i++){
				GrpID = responseAgr[i].GRPI;
				FVDT = responseAgr[i].FVDT;
				key1 = responseAgr[i].OBV1;
				key2 = responseAgr[i].OBV2;
				
				var itemdrywt = 0;
				let responseDW: any = await this.GetDryWt(SUNO,AGRNUM,GrpID,key1,key2,FVDT,this.item);
				if (responseDW !== 'undefined' && responseDW !== null) {
					itemdrywt = responseDW[0].N096;
				}
				if(itemdrywt!=0){
				itemdrywt = itemdrywt/100;
				}else{		
					itemdrywt = 1;
				}
				this.totalPUQT = parseFloat(this.totalPUQT) + Math.round(parseFloat(responseAgr[i].PUQT)*itemdrywt);
				if(responseAgr[i].OBV1 == this.item){
					drywt = itemdrywt;
				}
				if(responseAgr[i].OBV1 == this.warehouse && responseAgr[i].OBV2 == this.item){
					drywt = itemdrywt;
				}				
				this.DryWt = drywt;
			}	
			if(this.AgreedQty != 0){  	
			
			var tempBalQty = Math.round(parseFloat(this.BalanceQty) / this.DryWt);              // convert balance qty into wet weight temporarily
				if(this.currentPanel === "PPA201E0"){
					// Adding line condition check 						
					var tempPurQty = Math.round(parseFloat(this.NewQty) * drywt);	 // converting purchase quantity into dry weight		 
					if(this.panelMode == 1){
						if(parseInt(tempBalQty) < parseFloat(this.NewQty)){
							var msg = "Agreed balance quantity not available – Balance quantity is "+tempBalQty;						
								ConfirmDialog.ShowMessageDialog({
								dialogType: "Error",
								header: "Insufficient Balance Quantity",
								message: msg
							});					
							this.controller.PressKey("F5");
						}else{
							InstanceCache.Remove(this.controller,"TempQty");
							var pQty = Math.round(parseFloat(this.TotalPurchaseQty) + tempPurQty);   
							var bQty = Math.round(parseFloat(this.BalanceQty) - tempPurQty);
							this.updateCUGEX1(this.supplier,this.agrnum,pQty,bQty,this.controller);		// update final quantities into CUGEX1 table							
						}
					}
						//Change mode
					if(this.panelMode == 2){
						// Check available balance quantity
						 if((parseFloat(this.prevQty) + parseInt(tempBalQty)) < parseFloat(this.NewQty)){
							tempBalQty = Math.round(tempBalQty + parseFloat(this.prevQty));
							var msg = "Agreed balance quantity not available – Balance quantity is "+tempBalQty;					
								ConfirmDialog.ShowMessageDialog({
								dialogType: "Error",
								header: "Insufficient Balance Quantity",
								message: msg
							});		
							this.controller.SetValue("WBORQA", this.NewQty);
							console.log("WBQRA" +this.controller.GetValue("WBORQA"));
							this.controller.PressKey("F5");
						}
						else{
							// Check if changed values are validated
							if(InstanceCache.ContainsKey(this.controller, "Filter") || this.DryWt == 1){
								console.log("Inside InstanceCache responsible "+this.responsible);			
								InstanceCache.Remove(this.controller,"Filter");
								InstanceCache.Remove(this.controller,"TempQty");							
								var pQty = Math.round(parseFloat(this.TotalPurchaseQty) + tempPurQty);
								var bQty = Math.round(parseFloat(this.BalanceQty) - tempPurQty);
								// Update CUGEX values
								this.updateCUGEX1(this.supplier,this.agrnum,pQty,bQty,this.controller);		
							}
							else{
								var tempQuantity = this.controller.GetValue("WBORQA");
								var msg = "Please validate the changed Quantity ";					
									ConfirmDialog.ShowMessageDialog({
										dialogType: "Error",
										header: "Validate Changed Quantity",
										message: msg
									});		
									this.controller.SetValue("WBORQA", tempQuantity);
									console.log("WBQRA" +this.controller.GetValue("WBORQA"));
									this.controller.PressKey("F5");	
									
							}													
						}
					}						
				}
				
				if(this.currentPanel === "PPA201BC"){
				var tempPurQty = Math.round(parseFloat(this.NewQty) * drywt);	
					if(this.operation == "Copy"){
						if(parseFloat(tempBalQty) < parseFloat(this.NewQty)){
							var msg = "Agreed balance quantity not available – Balance quantity is "+tempBalQty;						
								ConfirmDialog.ShowMessageDialog({
								dialogType: "Error",
								header: "Insufficient Balance Quantity",
								message: msg
							});					
							this.controller.PressKey("F5");
						}
						else{
								this.controller.ListOption("3");							
						}
					}
					
					if(this.operation == "Delete"){
						console.log("Delete line ");
						var pQty = parseFloat(this.TotalPurchaseQty) - parseFloat(tempPurQty);
						var bQty = parseFloat(tempBalQty) +  parseFloat(tempPurQty);
						this.updateCUGEX1(this.supplier,this.agrnum,pQty,bQty,this.controller);	
					}										
				}			
				
				if(this.currentPanel === "PPA200C0"){
					console.log("total qty "+this.TotalQty);
					 var tempBalQty = Math.round(parseFloat(this.BalanceQty /  this.DryWt)); 
					if(parseFloat(tempBalQty) < parseFloat(this.TotalQty)){
						var msg = "Agreed balance quantity not available – Balance quantity is "+tempBalQty;						
						ConfirmDialog.ShowMessageDialog({
						dialogType: "Error",
						header: "Insufficient Balance Quantity",
						message: msg
						});					
						this.controller.PressKey("F5");
					}else{
						this.controller.PressKey("ENTER");	
							
					}					
				}
				
				if(this.currentPanel === "PPA250E0" || this.currentPanel === "PPA220GC"){
				debugger;
					var tempPurQty = Math.round(parseFloat(this.NewQty) * drywt);						
					if((parseFloat(tempBalQty) + parseFloat(this.prevQty)) < parseFloat(this.NewQty)){
							var msg = "Agreed balance quantity not available – Balance quantity is "+tempBalQty;						
							ConfirmDialog.ShowMessageDialog({
							dialogType: "Error",
							header: "Insufficient Balance Quantity",
							message: msg
							});					
							this.controller.PressKey("F5");
					}else{
							var pQty = parseFloat(this.TotalPurchaseQty) + parseFloat(tempPurQty);
							var bQty = parseFloat(tempBalQty) +  parseFloat(tempPurQty);
							this.updateCUGEX1(this.supplier,this.agrnum,pQty,bQty,this.controller);	
					}				
				}
			}		          
		}
    }
	
	private async ItemCheck(this.item, this.warehouse, this.controller){
		var itemtype = "0";
		var acqcode = "0";
		// Get item type
		let responsevalue: any = await this.GetItemType(this.item); 
		if (responsevalue !== 'undefined' && responsevalue !== null) {
			itemtype = responsevalue[0].ITTY;
		}
		// Get item acquisition code
		let responsevalue1: any = await this.GetAcqCode(this.item, this.warehouse); 
		if (responsevalue1 !== 'undefined' && responsevalue1 !== null) {
			acqcode = responsevalue1[0].PUIT;
		}
		
		// check if item acquisition code is 3 and item type is ING/PKG/FLR
		if(acqcode == "3" && (itemtype == "ING" || itemtype == "PKG" || itemtype == "FLR")){
			var msg = "PO cannot be created; Place the Intercompany DO";						
			ConfirmDialog.ShowMessageDialog({
				dialogType: "Error",
				header: "PO cannot be created",
				message: msg
			});					
			this.controller.PressKey("F5");	
		}
		else{
			this.controller.PressKey("ENTER");
		}
	}
	private async updateCUGEX1(SUNO,AgrNo,PurQty,BalQty,this.controller)	{
			let responsevalue: any = await this.CUSEX_UpdFieldValue(SUNO,AgrNo,PurQty,BalQty);
			var price = this.controller.GetValue("WBPUPR");
			// let responsevalue1: any = await this.UpdUserDef(this.PONum,this.POline,this.POSubline, price, PurQty, this.DryWt);		
			if(this.currentPanel === "PPA201E0" || this.currentPanel === "PPA220GC" || this.currentPanel === "PPA250E0"){
					this.controller.PressKey("ENTER");	
			}
			if(this.currentPanel === "PPA201BC"){
				console.log("update for Delete");
				this.controller.ListOption("4");	
			}
		}
	
	private CUSEX_GetFieldValue(Supplier, AgrNumber) {
        return new Promise<any>((resolve) => {

            let record = {'CONO':this.company,'FILE': this.file,'PK01': Supplier,'PK02': AgrNumber };
            let outputFields = ["N096","N196","A030"];

            MIService.Current.execute("CUSEXTMI", "GetFieldValue", record, outputFields).then((response: IMIResponse) => {
                if (null != response && null != response.item) {
                    resolve(response.items);
                    console.log(response.items);
                }
                else {
                    resolve(null);
                }
            }).catch((response: IMIResponse) => {
                resolve(null);
            });
        });
    }
	
	private CUSEX_UpdFieldValue(Supplier, AgrNumber,PurQty,BalQty) {
        return new Promise<any>((resolve) => {
            let record = {'CONO':this.company,'FILE': this.file,'PK01': Supplier,'PK02': AgrNumber,'N196':PurQty, 'A030':BalQty};
            let outputFields = [];
            MIService.Current.execute("CUSEXTMI", "ChgFieldValue", record, outputFields).then((response: IMIResponse) => {
                if (null != response && null != response.item) {
                    resolve(response.items);
                    console.log(response.items);
                }
                else {
                    resolve(null);
                }
            }).catch((response: IMIResponse) => {
                resolve(null);
            });
        });
    }
		
	private PPS200_GetLine(PONumber, POLine, POSubline) {
        return new Promise<any>((resolve) => {
            let record = {'CONO':this.company,'PUNO': PONumber, 'PNLI': POLine, 'PNLS':POSubline };
            let outputFields = ["ITNO", "OURR"];
            MIService.Current.execute("PPS200MI", "GetLine", record, outputFields).then((response: IMIResponse) => {
                if (null != response && null != response.item) {
                    resolve(response.items);
                    console.log(response.items);
                }
                else {
                    resolve(null);
                }
            }).catch((response: IMIResponse) => {
                resolve(null);
            });
        });
    }
	
	private GetItemType(ItemNumber) {
        return new Promise<any>((resolve) => {
            let record = {'CONO':this.company,'ITNO': ItemNumber };
            let outputFields = ["ITTY"];
            MIService.Current.execute("MMS200MI", "Get", record, outputFields).then((response: IMIResponse) => {
                if (null != response && null != response.item) {
                    resolve(response.items);
                    console.log(response.items);
                }
                else {
                    resolve(null);
                }
            }).catch((response: IMIResponse) => {
                resolve(null);
            });
        });
    }
	
	private GetAcqCode(ItemNumber, warehouse) {
        return new Promise<any>((resolve) => {
            let record = {'CONO':this.company,'ITNO': ItemNumber, 'WHLO': warehouse };
            let outputFields = ["PUIT"];
            MIService.Current.execute("MMS200MI", "GetItmWhsBasic", record, outputFields).then((response: IMIResponse) => {
                if (null != response && null != response.item) {
                    resolve(response.items);
                    console.log(response.items);
                }
                else {
                    resolve(null);
                }
            }).catch((response: IMIResponse) => {
                resolve(null);
            });
        });
    }
	
	private PPS200_GetHead(PONumber) {
        return new Promise<any>((resolve) => {
            let record = {'CONO':this.company,'PUNO': PONumber};
            let outputFields = ["ORTY"];
            MIService.Current.execute("PPS200MI", "GetHead", record, outputFields).then((response: IMIResponse) => {
                if (null != response && null != response.item) {
                    resolve(response.items);
                    console.log(response.items);
                }
                else {
                    resolve(null);
                }
            }).catch((response: IMIResponse) => {
                resolve(null);
            });
        });
    }
	
	private PPS200_LstLine(PONumber) {
        return new Promise<any>((resolve) => {
            let record = {'CONO':this.company,'PUNO': PONumber};
            let outputFields = ["ORQA","OURR"];
			console.log("cono "+this.company+" puno "+PONumber);
            MIService.Current.execute("PPS200MI", "LstLine", record, outputFields).then((response: IMIResponse) => {
                if (null != response && null != response.item) {
                    resolve(response.items);
                    console.log(response.items);
                }
                else {
                    resolve(null);
                }
            }).catch((response: IMIResponse) => {
                resolve(null);
            });
        });
    }
	
	private GetAgrDetails(Supplier, AgrNumber) {
        return new Promise<any>((resolve) => {
            let record = {'CONO':this.company,'SUNO': Supplier,'AGNB': AgrNumber};
            let outputFields = ["GRPI","OBV1","OBV2","FVDT","PUQT"];
            MIService.Current.execute("PPS100MI", "LstAgrLine", record, outputFields).then((response: IMIResponse) => {
                if (null != response && null != response.item) {
                    resolve(response.items);
                    console.log(response.items);
                }
                else {
                    resolve(null);
                }
            }).catch((response: IMIResponse) => {
                resolve(null);
            });
        });
    }
	
	private GetDryWt(Supplier, AgrNumber, GrpID, key1, key2, Date, ItemNo) {
        return new Promise<any>((resolve) => {
		var Agrfile = "MPAGRL";
            let record = {'CONO':this.company,'FILE': Agrfile, 'PK01': Supplier,'PK02': AgrNumber, 'PK03': GrpID, 'PK04': key1, 'PK05':key2,'PK08': Date};
            let outputFields = ["N096"];
            MIService.Current.execute("CUSEXTMI", "GetFieldValue", record, outputFields).then((response: IMIResponse) => {
                if (null != response && null != response.item) {
                    resolve(response.items);
                    console.log(response.items);
                }
                else {
                    resolve(null);
                }
            }).catch((response: IMIResponse) => {
                resolve(null);
            });
        });
    }
	
	private UpdUserDef(PONum, POline, POSubline, Price, Qty, DryWt) {
        return new Promise<any>((resolve) => {
			if(POSubline == null){
				POSubline =0;
			}
		var WetPP =  parseFloat(Price) * parseFloat(DryWt);
		var UDN3 = "1";
		var sucrosetotal = parseFloat(Qty)* parseFloat(WetPP);
		WetPP = WetPP.toFixed(3);
		sucrosetotal = sucrosetotal.toFixed(3);	
            let record = {'PUNO':PONum,'PNLI': POline, 'PNLS': POSubline,'UDN1': WetPP, 'UDN2': sucrosetotal, 'UDN3': UDN3};
            let outputFields = [""];
            MIService.Current.execute("PPS200MI", "UpdUserDefLine", record, outputFields).then((response: IMIResponse) => {
                if (null != response && null != response.item) {
                    resolve(response.items);
                    console.log(response.items);
                }
                else {
                    resolve(null);
					console.log(response.items);
                }
            }).catch((response: IMIResponse) => {
                resolve(null);
            });
        });
    }
	private detachEventsRequesting() {
        this.unsubscribeRequesting();
    }
 }

 
