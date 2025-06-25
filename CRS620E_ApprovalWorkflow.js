"use strict";
//Keep the Directive comments for vscode build
///<reference path="../typings/h5.script.d.ts"/>
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init = exports.CRS620E_ApprovalWorkflow = void 0;
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
var CRS620E_ApprovalWorkflow = /** @class */ (function () {
    function CRS620E_ApprovalWorkflow(args) {
        this.newButton = null;
        this.jsonBody = {};
        this.date = new Date();
        this.supplierGroup = '';
        this.controller = args.controller;
        this.log = args.log;
    }
    /**
    * Script initialization function.
    */
    CRS620E_ApprovalWorkflow.Init = function (args) {
        console.debug('CRS620E_ApprovalWorkflow Init');
        new CRS620E_ApprovalWorkflow(args).run();
    };
    CRS620E_ApprovalWorkflow.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var getbasicdata;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
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
                        if (!(this.currentPanel === "CRS620/E" && this.controller.GetMode() === "2" && this.controller["prevPanelHeader"] !== 'CRS620/C')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.CRS620_GetBasicData(this.currentCompany, this.supplierNumber)];
                    case 1:
                        getbasicdata = _a.sent();
                        if (getbasicdata != null) {
                            this.supplierGroup = getbasicdata[0].SUCL;
                        }
                        this.newButton = this.attachButton();
                        ScriptUtil.AddEventHandler(this.newButton, "click", function (event) {
                            console.debug("CRS620E_ApprovalWorkflow Click => Status: ".concat(_this.oldStatus));
                            if (_this.supplierGroup != '') {
                                if (_this.oldStatus !== '10') {
                                    _this.controller.ShowMessage('Supplier approval could not be submitted [status = ' + _this.oldStatus + ']');
                                }
                                else {
                                    if (ScriptUtil.GetFieldValue('WISTAT') !== '10') {
                                        _this.controller.ShowMessage('Supplier approval could not be submitted [status = ' + ScriptUtil.GetFieldValue('WISTAT') + ']');
                                    }
                                    else {
                                        _this.addEvent();
                                    }
                                }
                            }
                            else {
                                _this.controller.ShowMessage('Supplier approval could not be submitted, Supplier Group not connected.');
                            }
                        });
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    CRS620E_ApprovalWorkflow.prototype.addEvent = function () {
        var _this = this;
        console.debug('CRS620E_ApprovalWorkflow Add Event');
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
                }
            ],
            "inputStructures": []
        };
        //let headers:Object = {Accept: "application/json"};
        var request = {
            url: '/IONSERVICES/process/application/v1/workflow/start?logicalId=lid%3A%2F%2Finfor.m3.m3',
            method: "POST",
            record: this.jsonBody,
            headers: { "accept": 'application/json', "content-type": "application/json" }
        };
        var successful = false;
        IonApiService.Current.execute(request).then(function (response) {
            console.debug("Response", response);
            successful = true;
        }).catch(function (errResponse) {
            //Handle errors here
            successful = false;
            console.debug("CRS620E_ApprovalWorkflow req: " + _this.jsonBody);
            console.debug("CRS620E_ApprovalWorkflow err: " + JSON.stringify(errResponse));
        });
        if (successful) {
            this.controller.ShowMessage("Supplier approval workflow submitted by " + this.User);
        }
        else {
            this.controller.ShowMessage("Error submitting Workflow, see log for details.");
        }
    };
    CRS620E_ApprovalWorkflow.prototype.attachButton = function () {
        var button = new ButtonElement();
        button.Name = "Run";
        button.Value = "Send for approval";
        var positionElement = new PositionElement();
        positionElement.Left = 30;
        positionElement.Top = 3;
        button.Position = positionElement;
        var newButton = this.controller.GetContentElement().AddElement(button);
        return newButton;
    };
    CRS620E_ApprovalWorkflow.prototype.CRS620_GetBasicData = function (company, supplier) {
        return new Promise(function (resolve) {
            var request = {
                url: '/M3/m3api-rest/v2/execute/CRS620MI/GetBasicData/',
                method: 'GET',
                record: { CONO: company, SUNO: supplier }
            };
            IonApiService.Current.execute(request).then(function (response) {
                console.debug('CRS610/GetBasicData => ' + JSON.stringify(response));
                resolve(response.data.results[0].records);
            }).catch(function (errResponse) {
                //Handle errors here
                console.error("CRS610/GetBasicData => " + JSON.stringify(errResponse));
            });
        });
    };
    return CRS620E_ApprovalWorkflow;
}());
exports.CRS620E_ApprovalWorkflow = CRS620E_ApprovalWorkflow;
function Init(args) {
    CRS620E_ApprovalWorkflow.Init(args);
}
exports.Init = Init;
//# sourceMappingURL=CRS620E_ApprovalWorkflow.js.map