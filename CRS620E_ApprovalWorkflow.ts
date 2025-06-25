//Keep the Directive comments for vscode build
//<reference path="../typings/h5.script.d.ts"/>

/*
 * Name:    CRS620E_ApprovalWorkflow
 * Description:
 *          Add btn on CRS620_E panel to trigger ApprovalWorkflow in ION
 *
 * Usage:
 *  Notify new supplier created to purticulas IFS groups and update information of that supplier.
 *
 * By:     amit.powar@avaap.com  
 *
 * History:
 *  20210111   * base script created
 *  20221029   * updated to add error handling for API calls
 * */

export class CRS620E_ApprovalWorkflow {
    private controller: IInstanceController;
    private log: IScriptLog;
    private unsubscribeRequesting;
    private newButton = null;
    private jsonBody = {};
    private supplierNumber: string;
    private currentCompany: string;
    private User: string;
    private currentPanel: string;
    private date: Date = new Date();
    private supplierGroup: string = '';
    private oldStatus;

    constructor(args: IScriptArgs) {
        this.controller = args.controller;
        this.log = args.log;
    }

    /**
    * Script initialization function.
    */
    public static Init(args: IScriptArgs): void {
        console.debug ('CRS620E_ApprovalWorkflow Init');
        new CRS620E_ApprovalWorkflow(args).run();
    }

    private async run() {
        this.supplierNumber = ScriptUtil.GetFieldValue("WWSUNO");
        this.currentCompany = ScriptUtil.GetUserContext('CurrentCompany');
        this.User = ScriptUtil.GetUserContext('USID');
        this.currentPanel = this.controller["currPanelHeader"];
        this.oldStatus = ScriptUtil.GetFieldValue('WISTAT');
        //console.log('this.Controller : ', this.controller);


        if (this.currentPanel === "CRS620/E" && this.controller.GetMode() != "5") {
            if (this.controller.GetMode() === "1" || this.controller.GetMode() === "2" && this.controller["prevPanelHeader"] === 'CRS620/C') {
                ScriptUtil.SetFieldValue('WISTAT', '10');
                //$("#WISTAT").attr('disabled', 'disabled');
            }
        }

        if (this.currentPanel === "CRS620/E" && this.controller.GetMode() === "2" && this.controller["prevPanelHeader"] !== 'CRS620/C') {
            let getbasicdata = await this.CRS620_GetBasicData(this.currentCompany, this.supplierNumber);
            if (getbasicdata != null) {
                this.supplierGroup = getbasicdata[0].SUCL;
            }

            this.newButton = this.attachButton();
            ScriptUtil.AddEventHandler(this.newButton, "click", (event) => {
                console.debug (`CRS620E_ApprovalWorkflow Click => Status: ${this.oldStatus}`);
                if (this.supplierGroup != '') {
                    if (this.oldStatus !== '10') {
                        this.controller.ShowMessage('Supplier approval could not be submitted [status = ' + this.oldStatus + ']');
                    } else {
                        if (ScriptUtil.GetFieldValue('WISTAT') !== '10') {
                            this.controller.ShowMessage('Supplier approval could not be submitted [status = ' + ScriptUtil.GetFieldValue('WISTAT') + ']');
                        } else {
                            this.addEvent();
                        }
                    }
                } else {
                    this.controller.ShowMessage('Supplier approval could not be submitted, Supplier Group not connected.');
                }
            });
        }
    }

    private addEvent() {
        console.debug ('CRS620E_ApprovalWorkflow Add Event');
        this.jsonBody = {
            "workflowName": "SupplierApproval_WF",
            "instanceName": this.date,
            "inputVariables": [
                {
                    "name": "SUNO",
                    "dataType": "STRING",
                    "value": this.supplierNumber
                },
                {
                    "name": "User",
                    "dataType": "STRING",
                    "value": this.User
                },
                {
                    "name": "CONO",
                    "dataType": "STRING",
                    "value": this.currentCompany
                },
                {
                    "name": "SupplierGroup",
                    "dataType": "STRING",
                    "value": this.supplierGroup
                }],
                "inputStructures": []
            };
        //let headers:Object = {Accept: "application/json"};

        var request: IonApiRequest = {
            url: '/IONSERVICES/process/application/v1/workflow/start?logicalId=lid%3A%2F%2Finfor.m3.m3',
            method: "POST",
            record: this.jsonBody,
            headers: { "accept": 'application/json', "content-type": "application/json" }
        };
        let successful: Boolean = false;

        IonApiService.Current.execute(request).then(function (response) {
            console.debug("Response", response);
            successful = true;
        }).catch((errResponse) => {
            //Handle errors here
            successful = false;
            console.debug("CRS620E_ApprovalWorkflow req: " + this.jsonBody)
            console.debug("CRS620E_ApprovalWorkflow err: " + JSON.stringify(errResponse));
        });

        if (successful) {
            this.controller.ShowMessage("Supplier approval workflow submitted by " + this.User);
        } else {
            this.controller.ShowMessage("Error submitting Workflow, see log for details.");
        }
    }

    private attachButton() {
        let button: ButtonElement = new ButtonElement();
        button.Name = "Run";
        button.Value = "Send for approval";
        let positionElement: PositionElement = new PositionElement();
        positionElement.Left = 30;
        positionElement.Top = 3;
        button.Position = positionElement;
        const newButton = this.controller.GetContentElement().AddElement(button);
        return newButton;
    }

    private CRS620_GetBasicData(company, supplier) {
        return new Promise(function (resolve) {
            const request: IonApiRequest = {
                url: '/M3/m3api-rest/v2/execute/CRS620MI/GetBasicData/',
                method: 'GET',
                record: { CONO: company, SUNO: supplier }
            };
            IonApiService.Current.execute(request).then((response: IonApiResponse) => {
                console.debug('CRS610/GetBasicData => ' +  JSON.stringify(response));
                resolve(response.data.results[0].records);
            }).catch((errResponse) => {
                //Handle errors here
                console.error("CRS610/GetBasicData => " + JSON.stringify(errResponse));
            });
        });
    }
}
export function Init(args: IScriptArgs) {
    CRS620E_ApprovalWorkflow.Init(args);
}
