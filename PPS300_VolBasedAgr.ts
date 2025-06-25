/**
 * Volume Based Agreement
 * PPS300 - Check whether the received quantity is available in Agreement Balance Quantity is available or not.
 * If Balance Quantity is not available then check for new Agreement and close the Previous Agreement and Create a New Line with the New Quantity.
 * If no agreement available then mail it to client.
 *
 * Panels where the script needs to be added :
 * PPS300/E1, PPS300/A
 *
 */

 class PPS300_VolBasedAgr {
    private controller: IInstanceController;
    private currentPanel: string;
    private currency :string;
    private unsubscribeRequesting = null;
    private unsubscribeRequested = null;
    private unsubscribeRequestcompleted = null;
    private contentElement: IContentElement;
    private panelMode: string;
    private supplier: string;
    private agrnum: string;
    private item: string;
    private file: string;
    private warehouse: string;
    private buyer: string;
    private company: string;
    private OrderQty: string;
	private PurQtyUnits: string;
    private BalanceQty: string;
    private AgreedQty: string;
    private TotalPurchaseQty: string;
    private PONum: string;
    private POline: string;
	private Counter=0;
	private CountAgr=0;
	private LineQty: string;
	private transDt: string;
	private lot: string;
	private location: string;
	private POSubline: string; 
	private totalPUQT: string; 
	private newPOline: string;
	private newPOSubline: string;
	private receivedQty: string;
	private jsonBody: string;
	private latestAgr: string;
	private mfdate: string;
	private responsible: string;
	private catchwt: string;
	private lotRef: string;
	private finalCW: string;
	private OrderRecQty : string;
	private decimalflag: boolean;
	private button;
	
	
    constructor(scriptArgs: IScriptArgs) {
        this.controller = scriptArgs.controller;
    }
	public static Init(args: IScriptArgs): void {
        new PPS300_VolBasedAgr(args).run();        
    }
    private async run(): void {
	
		// Get panel details and fields 
        this.currentPanel = this.controller.GetPanelName();
        this.panelMode = this.controller.GetMode();
        this.file = "MPAGRH";
		this.company = ScriptUtil.GetUserContext("CurrentCompany");
		this.totalPUQT = "0";
		
		// PPS300/E panel
		if(this.currentPanel === "PPA300E1"){
			this.attachEvents(this.controller);			
		} 
		
		// PPS300/A panel
		if(this.currentPanel === "PPA300A0"){
			this.responsible = this.controller.GetValue("WWRESP");
			this.attachEvents(this.controller);	
		}
	}
	private async attachEvents(controller: IInstanceController) {
		this.unsubscribeRequesting = controller.Requesting.On((e: CancelRequestEventArgs) => {
			let detachEvents = true;
			console.log("Attach events "+this.panelMode);			
			// Get panel values  	
			// PPS300/E Panel 
			if (((e.commandType === "KEY" && e.commandValue === "ENTER")) && (this.currentPanel === "PPA300E1") && (this.Counter == 0)) {
				debugger;
				e.cancel = true;
				this.lot = this.controller.GetValue("WLBREF");
				this.receivedQty = this.controller.GetValue("WBRVQA");			
				this.PONum = ScriptUtil.GetFieldValue("IBPUNO");			
				this.supplier = ScriptUtil.GetFieldValue("IASUNO");	
				this.POline = ScriptUtil.GetFieldValue("IBPNLI");
				this.item = ScriptUtil.GetFieldValue("IBITNO");	
				this.OrderQty = ScriptUtil.GetFieldValue("WWCFQA");				
				this.transDt = ScriptUtil.GetFieldValue("WWTRDT");	
				this.POSubline = ScriptUtil.GetFieldValue("IBPNLS");
				this.buyer = ScriptUtil.GetFieldValue("IBPURC");
				this.warehouse = ScriptUtil.GetFieldValue("IBWHLO");
				console.log("Inside attach events ");
					this.location = this.controller.GetValue("WLWHSL");
					// Get catch weight
					this.catchwt = this.controller.GetValue("WWCAWE");
					//Get lot reference
					this.lotRef = this.controller.GetValue("WLBREF");
					//Get manufacturing date
					this.mfdate = this.controller.GetValue("WLPRDT");
					
					// decimal formatting
					this.decimalflag = false;
					// Set responsible value from InstanceCache
					if (InstanceCache.ContainsKey(this.controller, "Responsible")){
						this.responsible = InstanceCache.Get(this.controller, "Responsible");
						console.log("Inside InstanceCache responsible "+this.responsible);				
					}else{
						this.responsible = ScriptUtil.GetFieldValue("IBPURC");
					}
					
					//check for all mandatory input fields
					if(this.location!= "" && this.lotRef!= "" ){
						// Execute script only once if count is 0 
						console.log("calling call method");				
							this.Counter++;											
							this.callmethod(this.controller);
					}								
			}	
			
			// PPS300/A panel add responsible to InstanceCache
			if(((e.commandType === "KEY" && e.commandValue === "ENTER")) && (this.currentPanel === "PPA300A0")){
				var SessionRESP = this.responsible;
				InstanceCache.Add(this.controller, "Responsible",SessionRESP);
			}
			if (detachEvents) {
                this.detachEventsRequesting();
            }
        });		
    }
	
	private async callmethod(this.controller) {	
		debugger;
		// get Agreement number from PO  
		$('#WBRVQA').disable(); 
		let responseagr: any = await this.PPS200_GetLine(this.PONum,this.POline,this.POSubline);	
		if (responseagr !== 'undefined' && responseagr !== null) {
			this.agrnum = responseagr[0].OURR;
		}else{
			this.agrnum = "0";
		}
		
		let responseagr: any = await this.PPS200_GetLine(this.PONum,this.POline,this.POSubline);	
		console.log(" Responsible "+this.responsible);
		// check if there is Agreement number before executing script.
		if(this.agrnum!= null || this.agrnum!="0")	{ 				
			let responsevalue: any = await this.CUSEX_GetFieldValue(this.supplier,this.agrnum);
		    if (responsevalue !== 'undefined' && responsevalue !== null) {
				this.BalanceQty = responsevalue[0].A030;
				this.AgreedQty = responsevalue[0].N096;
				this.TotalPurchaseQty = responsevalue[0].N196;
				var GrpID = "";
				var key1 = "";
				var key2 = "";
				var FVDT = "0";
				
				// Get Received Quantity
				this.OrderRecQty = "0";
				let responseRec : any = await this.GetReceivedQty(this.agrnum);
				if (responseRec !== 'undefined' && responseRec !== null) {
					for(let i=0;i<responseRec.length;i++){
						if(i ==1){
							this.OrderRecQty = parseFloat(responseRec[i].V_RCV1);
						}						
					}					
				}
				
				// Get dynamic catch wt if applicable
				this.catchwt = this.controller.GetValue("WWCAWE");
				if(this.catchwt == ""){
					this.CWRatio = "1";
				}else{
					this.CWRatio = this.receivedQty / this.catchwt;
				}
				
				// Chck if Agreed Qty is present in Agreement
					if(this.AgreedQty != 0){
						// Calculate current balance qty
						this.BalanceQty = this.AgreedQty - parseFloat(this.OrderRecQty); 
						var finalRecQty = Math.round(parseFloat(this.BalanceQty) * parseFloat(this.CWRatio));
							if(this.BalanceQty <= 0){
							var msg = "Agreed Balance Quantity is not available ";						
								ConfirmDialog.ShowMessageDialog({
								dialogType: "Error",
								header: "Insufficient Balance Quantity",
								message: msg
							});
							finalRecQty = "NA";
							this.controller.SetValue("WBRVQA",finalRecQty);
								
						}
						else{
							// Check whether the receivedQty is less than equal to Balance qty
							var IntialRecQty =  ScriptUtil.GetFieldValue("WWRVQ1");	
							if(IntialRecQty == "" || IntialRecQty == null){
								IntialRecQty = "0";
							}
							
							// Calculate temporary available Balance Quantity
							var finalctwt = "";
							var NewlineQty = parseFloat(this.receivedQty) - parseFloat(finalRecQty);
								
							this.controller.SetValue("WBRVQA",finalRecQty);
								$('#WBRVQA').disable(); 
								if(this.catchwt == null || this.catchwt == ""){
									finalctwt = "0";
									this.finalCW = "0";
								}else{
									finalctwt = this.BalanceQty;
									this.finalCW = this.catchwt - finalctwt;
									if(this.decimalflag){
										finalctwt = finalctwt.toString().replace('.',',');
									}
									this.controller.SetValue("WWCAWE",finalctwt);	
								}
								
							// Execute Standard M3 logic if the received quantity is less than available Balance quantity
							if(this.receivedQty < (parseFloat(this.BalanceQty))){				
								$('#WBRVQA').disable(); 						
								this.controller.PressKey("ENTER");
							}	// Execute Standard M3 logic if the received quantity is equal to available Balance quantity and close the current Agreement
							else if(this.receivedQty == parseFloat(this.BalanceQty)){ 		
								$('#WBRVQA').disable();
								let responseCloseAgr: any = await this.CloseAgreement(this.agrnum,this.supplier);
								this.controller.PressKey("ENTER");
							}
							else{  // Execute script by new line Addition logic
								
								// Get latest Agreement 
								this.latestAgr = "0";	
								
								// Get current date
								var currentDate = new Date();
								var dd = String(currentDate.getDate()).padStart(2, '0');
								var mm = String(currentDate.getMonth() + 1).padStart(2, '0');
								var yyyy = currentDate.getFullYear();
								currentDate = yyyy + mm + dd ;
								
								// Get latest valid Agreement
								var tempAgr = 0;
								let responselatestAgr: any = await this.GetLatestAgr(this.supplier);
								if(responselatestAgr!= null){
									for(let i=0;i<responselatestAgr.length;i++){
										var validto = "";
										if(responselatestAgr[i].AIUVDT == null || responselatestAgr[i].AIUVDT == ""){
											validto = parseInt(currentDate) + 2;
										}else{
											validto = responselatestAgr[i].AIUVDT;
										}
						
										// Filter the valid Agreement
										if((parseInt(responselatestAgr[i].AIAGNB) > parseInt(this.agrnum)) && (parseInt(responselatestAgr[i].AIFVDT) <= parseInt(currentDate)) && parseInt(currentDate) <= parseInt(validto)){
											if((responselatestAgr[i].AIOBV1 == this.item || responselatestAgr[i].AIOBV2 == this.item) && (responselatestAgr[i].AHPAST == 40)){
												if(this.CountAgr == 0){
													tempAgr = responselatestAgr[i].AHAGNB;
													this.latestAgr = responselatestAgr[i].AIAGNB;
													this.CountAgr++;
												}else {
													if(parseInt(responselatestAgr[i].AIAGNB) < parseInt(tempAgr)){
													this.latestAgr = responselatestAgr[i].AIAGNB;
													}
												}	
											}																
										}							
									}
								}
								else{
									this.latestAgr = 0;
								}
								
								// Set new PO Line
								let responselastline: any = await this.PPS200_LstLine(this.PONum);		
								for(let i=0;i<responselastline.length;i++){
									if(i == parseInt(responselastline.length-1)){
										this.newPOline = parseInt(responselastline[i].PNLI)+1;
									}							
								} 
								
								// Set inputs for workflow
								
								if(this.BalanceQty <= 0){
									finalRecQty = "NA";
									NewlineQty = 0;
								}
								this.location = this.controller.GetValue("WLWHSL");
								
								//08/14/24 - mm/dd/yy to 2024 - format transaction date
								this.transDt = "20" + this.transDt.charAt(6)+ this.transDt.charAt(7) + this.transDt.charAt(0)+ this.transDt.charAt(1) + this.transDt.charAt(3)+ this.transDt.charAt(4);
								var latestAgrRecQty = "0";
								// Get latest Agreement receivedQty
								let responselatestRec : any = await this.GetReceivedQty(this.latestAgr);
								if (responselatestRec !== 'undefined' && responselatestRec !== null) {
									for(let i=0;i<responselatestRec.length;i++){
										if(i==1){
										latestAgrRecQty = parseFloat(responselatestRec[i].V_RCV1);
										}
									}					
								}
								else{
									latestAgrRecQty = "0";
								}
								// call the workflow
								if(NewlineQty != 0) {				
									this.jsonBody = {
											workflowName:"wf_VolumeBasedAgreement",
											instanceName:this.supplier,
											inputVariables:[
												{name:"Company", dataType:"STRING", value:this.company},
												{name:"Supplier", dataType:"STRING", value:this.supplier},
												{name:"PreAgreement", dataType:"STRING", value:this.agrnum},
												{name:"NewAgreement", dataType:"STRING", value:this.latestAgr},									
												{name:"PONumber", dataType:"STRING", value:this.PONum},
												{name:"POLine", dataType:"STRING", value:this.POline},
												{name:"NewLine", dataType:"STRING", value:this.newPOline},									
												{name:"Warehouse", dataType:"STRING", value:this.warehouse},
												{name:"ItemNumber", dataType:"STRING", value:this.item},
												{name:"Quantity", dataType:"STRING", value:NewlineQty},
												{name:"Responsible", dataType:"STRING", value:this.responsible},
												{name:"Location", dataType:"STRING", value:this.location},
												{name:"RecQty", dataType:"STRING", value:finalRecQty},
												{name:"LotReference", dataType:"STRING", value:this.lotRef},
												{name:"TransDate", dataType:"STRING", value:this.transDt},
												{name:"CatchWeight", dataType:"STRING", value:this.finalCW},
												{name:"NewAgrRecQty", dataType:"STRING", value:latestAgrRecQty}								
												
											],
											inputStructures:[]
										};
										var urlData="/IONSERVICES/process/application/v1/workflow/start?logicalId=lid%3A%2F%2Finfor.m3.m3";
								
										var request={
											url:urlData,
											method:"POST",
											record:this.jsonBody,
											headers:{accept:"application/json","content-type":"application/json"}
										};

										IonApiService.Current.execute(request).then(function (response) {
											console.log("Responseworkflow", response);
										});		
									ScriptUtil.SetFieldValue("WBRVQA",finalRecQty);		
									this.Counter = 0;
									this.attachEvents(this.controller);
								}
							}
						}
					}else{
						this.controller.PressKey("ENTER");
					}
			}
		}
		else{
			this.controller.PressKey("ENTER");
		}
    }
	
	private PPS200_LstLine(PONumber) {
        return new Promise<any>((resolve) => {
            let record = {'CONO':this.company,'PUNO': PONumber};
            let outputFields = ["PNLI"];
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
	
	private PPS200_GetLine(PONumber,POLineNo,POSubLine) {
        return new Promise<any>((resolve) => {
			let record = {'CONO':this.company,'PUNO': PONumber,'PNLI': POLineNo, 'PNLS': POSubLine};
			let outputFields = [];
			console.log("cono "+this.company+" puno "+PONumber+" line "+POLineNo);
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
	
	private CloseAgreement(Agreement,Supplier) {
	var stat = "90";
        return new Promise<any>((resolve) => {
			let record = {'CONO':this.company,'SUNO': Supplier,'AGNB': Agreement, 'PAST': stat};
			let outputFields = [];
			console.log("cono "+this.company+" suno "+Supplier+" AGNB "+Agreement+"past "+stat);
			MIService.Current.execute("PPS100MI", "UpdAgrHead", record, outputFields).then((response: IMIResponse) => {
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
	
	private GetReceivedQty(AgrNumber) {
        return new Promise<any>((resolve) => {
            let record = {'F1A030': AgrNumber};
            let outputFields = ["F2RPQA","F2CAWE","V_RCV1"];
            MIService.Current.execute("CMS100MI", "LstTotRcvdQty", record, outputFields).then((response: IMIResponse) => {
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
	private GetItem(this.item) {
        return new Promise<any>((resolve) => {
            let record = {'ITNO': this.item};
            let outputFields = ["EXPD"];
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
	
	private GetLatestAgr(Supplier) {
        return new Promise<any>((resolve) => {
			let record = {'AISUNO': Supplier};
			let outputFields = ["AIAGNB","AIOBV1","AIOBV2","AIFVDT", "AIUVDT","AHPAST"];
            MIService.Current.execute("CMS100MI", "LstAgrLine", record, outputFields).then((response: IMIResponse) => {
                if (null != response && null != response.item) {
                    resolve(response.items);
                    console.log(response.items);
                }
                else {
                    resolve(null);
					console.log("error "+response);
                }
            }).catch((response: IMIResponse) => {
			console.log("error API"+response);
                resolve(null);
            });
        });
    }
	
	private detachEventsRequesting() {
        this.unsubscribeRequesting();
    }
 }

 
