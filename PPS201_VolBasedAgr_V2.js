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
var PPS201_VolBasedAgr_V2 = /** @class */ (function () {
    function PPS201_VolBasedAgr_V2(scriptArgs) {
        this.unsubscribeRequesting = null;
        this.Counter = 0;
        this.count = 0;
        this.controller = scriptArgs.controller;
        this.isDialogShown = false;
    }
    PPS201_VolBasedAgr_V2.Init = function (args) {
        new PPS201_VolBasedAgr_V2(args).run();
    };
    PPS201_VolBasedAgr_V2.prototype.run = function () {
        // Get panel details
        this.currentPanel = this.controller.GetPanelName();
        this.panelMode = this.controller.GetMode();
        this.file = "MPAGRH";
        this.company = ScriptUtil.GetUserContext("CurrentCompany");
        this.totalPUQT = "0";
        if (this.currentPanel === "PPA201E0") {
            this.supplier = ScriptUtil.GetFieldValue("IASUNO");
            this.item = ScriptUtil.GetFieldValue("WBITNO");
            this.warehouse = ScriptUtil.GetFieldValue("IBWHLO");
            this.prevQty = ScriptUtil.GetFieldValue("WBORQA");
            this.prevQty = this.prevQty.toString().replace(',', '.');
            this.PurQtyUnits = ScriptUtil.GetFieldValue("WEPUUN");
            this.pricetext = ScriptUtil.GetFieldValue("WBPTCD");
            this.PONum = ScriptUtil.GetFieldValue("IAPUNO");
            this.POline = ScriptUtil.GetFieldValue("WWPNLI");
            this.POSubline = ScriptUtil.GetFieldValue("WWPLNS");
            // Price Text values
            if (this.pricetext > 0 && this.panelMode == 1) {
                this.controller.SetValue("WBOURR", " ");
                this.controller.SetValue("WBOURT", " ");
                this.controller.SetValue("WBPUPR", " ");
            }
            // Flag is to set the existing values after refreshing the panel
            if (InstanceCache.ContainsKey(this.controller, "Flag") && this.panelMode == 2) {
                var Tempflag = InstanceCache.Get(this.controller, "Flag");
                var flag = this.PONum + "_" + this.POline + "_" + this.POSubline;
                var tempQty = InstanceCache.Get(this.controller, "TempQty");
                if (!InstanceCache.ContainsKey(this.controller, "TempQty")) {
                    tempQty = "0";
                }
                // Check if flags are same and set the quantity before refresh into Quantity
                if (flag == Tempflag && tempQty != "0") {
                    this.controller.SetValue("WBORQA", tempQty);
                }
            }
            this.attachEvents(this.controller);
        }
        // PPS201_B1 panel
        if (this.currentPanel === "PPA201BC") {
            this.supplier = ScriptUtil.GetFieldValue("IASUNO");
            this.PONum = ScriptUtil.GetFieldValue("IAPUNO");
            var flag = 0;
            this.attachEvents(this.controller);
        }
        //PPS200_C panel
        if (this.currentPanel === "PPA200C0") {
            this.PONum = ScriptUtil.GetFieldValue("WWPUNO");
            this.supplier = ScriptUtil.GetFieldValue("WWSUNO");
            this.attachEvents(this.controller);
        }
        //PPS250_E panel
        if (this.currentPanel === "PPA250E0") {
            this.PONum = ScriptUtil.GetFieldValue("IBPUNO");
            this.supplier = ScriptUtil.GetFieldValue("IBSUNO");
            this.POline = ScriptUtil.GetFieldValue("WBPNLI");
            this.POSubline = ScriptUtil.GetFieldValue("WBPNLS");
            this.prevQty = ScriptUtil.GetFieldValue("WBCFQA");
            this.attachEvents(this.controller);
        }
        //PPS250_G1 panel
        if (this.currentPanel === "PPA220GC") {
            this.PONum = ScriptUtil.GetFieldValue("SGPUNO");
            this.supplier = ScriptUtil.GetFieldValue("SGSUNO");
            this.POline = ScriptUtil.GetFieldValue("SGPNLI");
            this.POSubline = ScriptUtil.GetFieldValue("SGPNLS");
            this.prevQty = ScriptUtil.GetFieldValue("WGCFQA");
            this.attachEvents(this.controller);
        }
    };
    PPS201_VolBasedAgr_V2.prototype.attachEvents = function (controller) {
        var _this = this;
        this.unsubscribeRequesting = controller.Requesting.On(function (e) {
            var detachEvents = true;
            console.log("Attach events " + _this.panelMode);
            debugger;
            // PPS201_E PO line copy check	
            if (((e.commandType === "KEY" && e.commandValue === "ENTER") || (e.commandValue === "F3")) && (_this.currentPanel === "PPA201E0") && _this.Counter == 0) {
                _this.agrnum = _this.controller.GetValue("WBOURR");
                _this.NewQty = _this.controller.GetValue("WBORQA");
                console.log("agrnum  " + _this.agrnum);
                console.log("NewQty " + _this.NewQty);
                // Add values to Cache for after refresh in case of values not validated
                if (_this.panelMode == 2) {
                    var flag = _this.PONum + "_" + _this.POline + "_" + _this.POSubline;
                    InstanceCache.Add(_this.controller, "TempQty", _this.NewQty);
                    InstanceCache.Add(_this.controller, "Flag", flag);
                }
                // check whether quantity entered is 0 or not
                if (parseInt(_this.NewQty) != 0) {
                    _this.Counter++;
                    detachEvents = false;
                    e.cancel = true;
                    _this.callmethod();
                }
            }
            if ((e.commandType === "LSTOPT" && e.commandValue === "2") && (_this.currentPanel === "PPA201BC") && _this.Counter == 0) {
                _this.Counter++;
                InstanceCache.Remove(_this.controller, "Filter");
                InstanceCache.Remove(_this.controller, "Flag");
            }
            //PPS200 - Planned PO line copy  
            if ((e.commandType === "LSTOPT" && e.commandValue === "3") && (_this.currentPanel === "PPA201BC") && _this.Counter == 0) {
                _this.operation = "Copy";
                _this.NewQty = ListControl.ListView.GetValueByColumnName("WSORQA");
                _this.POline = ListControl.ListView.GetValueByColumnName("WSPNLI");
                console.log("POline in list " + _this.POline);
                _this.Counter++;
                e.cancel = true; // same panel
                detachEvents = false;
                _this.callmethod();
            }
            // Intercompany DO Check
            if ((e.commandType === "KEY" && e.commandValue === "ENTER") && (_this.currentPanel === "PPA201BC") && _this.Counter == 0) {
                _this.item = _this.controller.GetValue("WBITNO");
                _this.warehouse = _this.controller.GetValue("WBWHLO");
                _this.orderQty = _this.controller.GetValue("WBORQA");
                if (_this.item != "" && _this.warehouse != "" && _this.orderQty != "") {
                    _this.Counter++;
                    e.cancel = true; // same panel
                    detachEvents = false;
                    _this.ItemCheck(_this.item, _this.warehouse, _this.controller);
                }
            }
            // PPS200_C PO Head Copy check 
            if ((_this.currentPanel === "PPA200C0") && (e.commandType === "KEY" && e.commandValue === "ENTER") && _this.Counter == 0) {
                _this.copycheck = _this.controller.GetValue("CPLINE");
                debugger;
                console.log("POline in list " + _this.copycheck);
                _this.Counter++;
                if (_this.copycheck == true) {
                    e.cancel = true; // same panel
                    detachEvents = false;
                    _this.callmethod();
                }
            }
            // PPS250_E Change validity check 
            if ((_this.currentPanel === "PPA250E0") && _this.Counter == 0 && (e.commandType === "KEY" && e.commandValue === "ENTER") && _this.panelMode == 2) {
                _this.Counter++;
                _this.NewQty = _this.controller.GetValue("WBCFQA");
                e.cancel = true; // same panel
                detachEvents = false;
                _this.callmethod();
            }
            //PPS220_G1 panel
            if ((_this.currentPanel === "PPA220GC") && _this.Counter == 0 && (e.commandType === "KEY" && e.commandValue === "ENTER")) {
                _this.Counter++;
                _this.NewQty = _this.controller.GetValue("R1C6");
                e.cancel = true; // same panel
                detachEvents = false;
                _this.callmethod();
            }
            if (detachEvents) {
                _this.detachEventsRequesting();
            }
        });
    };
    PPS201_VolBasedAgr_V2.prototype.callmethod = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.currentPanel === "PPA201BC" && (this.operation == "Copy" || this.operation == "Delete"))) return [3 /*break*/, 2];
                        this.POSubline = "0";
                        return [4 /*yield*/, this.GetAgrNum(this.supplier, this.PONum, this.POline, this.POSubline, this.controller)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 2:
                        if (!(this.currentPanel === "PPA200C0")) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.LstAgrNum(this.PONum, this.controller)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 4:
                        if (!(this.currentPanel === "PPA250E0" || this.currentPanel === "PPA220GC")) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.GetAgrNum(this.supplier, this.PONum, this.POline, this.POSubline, this.controller)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, this.callApi(this.supplier, this.agrnum, this.controller)];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    PPS201_VolBasedAgr_V2.prototype.LstAgrNum = function (PONum, controller) {
        return __awaiter(this, void 0, void 0, function () {
            var responsevalue, tempQty, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.PPS200_LstLine(this.PONum)];
                    case 1:
                        responsevalue = _a.sent();
                        console.log("response " + responsevalue);
                        tempQty = 0;
                        if (!(responsevalue !== 'undefined' && responsevalue !== null)) return [3 /*break*/, 3];
                        for (i = 0; i < responsevalue.length; i++) {
                            tempQty = parseFloat(tempQty) + parseFloat(responsevalue[i].ORQA);
                        }
                        this.TotalQty = tempQty;
                        this.agrnum = responsevalue[0].OURR;
                        console.log("In lst agr num");
                        return [4 /*yield*/, this.callApi(this.supplier, this.agrnum, this.controller)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PPS201_VolBasedAgr_V2.prototype.GetAgrNum = function (supplier, PONum, POline, POSubline, controller) {
        return __awaiter(this, void 0, void 0, function () {
            var responsevalue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.PPS200_GetLine(this.PONum, this.POline, this.POSubline)];
                    case 1:
                        responsevalue = _a.sent();
                        console.log("response " + responsevalue);
                        if (!(responsevalue !== 'undefined' && responsevalue !== null)) return [3 /*break*/, 3];
                        this.agrnum = responsevalue[0].OURR;
                        this.item = responsevalue[0].ITNO;
                        console.log("In Get agr num");
                        return [4 /*yield*/, this.callApi(this.supplier, this.agrnum, this.controller)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PPS201_VolBasedAgr_V2.prototype.callApi = function (SUNO, AGRNUM, controller) {
        return __awaiter(this, void 0, void 0, function () {
            var responsevalue, drywt, AgrPriority, FVDT, responseAgr, i, itemdrywt, responseDW, tempBalQty, tempPurQty, msg, pQty, bQty, msg, pQty, bQty, tempQuantity, msg, tempPurQty, msg, pQty, bQty, tempBalQty, msg, tempPurQty, msg, pQty, bQty;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.CUSEX_GetFieldValue(SUNO, AGRNUM)];
                    case 1:
                        responsevalue = _a.sent();
                        drywt = 1;
                        debugger;
                        if (!(responsevalue !== 'undefined' && responsevalue !== null)) return [3 /*break*/, 7];
                        this.BalanceQty = responsevalue[0].A030;
                        this.AgreedQty = responsevalue[0].N096;
                        this.TotalPurchaseQty = responsevalue[0].N196;
                        AgrPriority = "50";
                        FVDT = "0";
                        return [4 /*yield*/, this.GetAgrDetails(SUNO, AGRNUM)];
                    case 2:
                        responseAgr = _a.sent();
                        i = 0;
                        _a.label = 3;
                    case 3:
                        if (!(i < responseAgr.length)) return [3 /*break*/, 6];
                        GrpID = responseAgr[i].GRPI;
                        FVDT = responseAgr[i].FVDT;
                        key1 = responseAgr[i].OBV1;
                        key2 = responseAgr[i].OBV2;
                        itemdrywt = 0;
                        return [4 /*yield*/, this.GetDryWt(SUNO, AGRNUM, GrpID, key1, key2, FVDT, this.item)];
                    case 4:
                        responseDW = _a.sent();
                        if (responseDW !== 'undefined' && responseDW !== null) {
                            itemdrywt = responseDW[0].N096;
                        }
                        if (itemdrywt != 0) {
                            itemdrywt = itemdrywt / 100;
                        }
                        else {
                            itemdrywt = 1;
                        }
                        this.totalPUQT = parseFloat(this.totalPUQT) + Math.round(parseFloat(responseAgr[i].PUQT) * itemdrywt);
                        if (responseAgr[i].OBV1 == this.item) {
                            drywt = itemdrywt;
                        }
                        if (responseAgr[i].OBV1 == this.warehouse && responseAgr[i].OBV2 == this.item) {
                            drywt = itemdrywt;
                        }
                        this.DryWt = drywt;
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 3];
                    case 6:
                        if (this.AgreedQty != 0) {
                            tempBalQty = Math.round(parseFloat(this.BalanceQty) / this.DryWt);
                            if (this.currentPanel === "PPA201E0") {
                                tempPurQty = Math.round(parseFloat(this.NewQty) * drywt);
                                if (this.panelMode == 1) {
                                    if (parseInt(tempBalQty) < parseFloat(this.NewQty)) {
                                        msg = "Agreed balance quantity not available – Balance quantity is " + tempBalQty;
                                        ConfirmDialog.ShowMessageDialog({
                                            dialogType: "Error",
                                            header: "Insufficient Balance Quantity",
                                            message: msg
                                        });
                                        this.controller.PressKey("F5");
                                    }
                                    else {
                                        InstanceCache.Remove(this.controller, "TempQty");
                                        pQty = Math.round(parseFloat(this.TotalPurchaseQty) + tempPurQty);
                                        bQty = Math.round(parseFloat(this.BalanceQty) - tempPurQty);
                                        this.updateCUGEX1(this.supplier, this.agrnum, pQty, bQty, this.controller); // update final quantities into CUGEX1 table							
                                    }
                                }
                                //Change mode
                                if (this.panelMode == 2) {
                                    // Check available balance quantity
                                    if ((parseFloat(this.prevQty) + parseInt(tempBalQty)) < parseFloat(this.NewQty)) {
                                        tempBalQty = Math.round(tempBalQty + parseFloat(this.prevQty));
                                        msg = "Agreed balance quantity not available – Balance quantity is " + tempBalQty;
                                        ConfirmDialog.ShowMessageDialog({
                                            dialogType: "Error",
                                            header: "Insufficient Balance Quantity",
                                            message: msg
                                        });
                                        this.controller.SetValue("WBORQA", this.NewQty);
                                        console.log("WBQRA" + this.controller.GetValue("WBORQA"));
                                        this.controller.PressKey("F5");
                                    }
                                    else {
                                        // Check if changed values are validated
                                        if (InstanceCache.ContainsKey(this.controller, "Filter") || this.DryWt == 1) {
                                            console.log("Inside InstanceCache responsible " + this.responsible);
                                            InstanceCache.Remove(this.controller, "Filter");
                                            InstanceCache.Remove(this.controller, "TempQty");
                                            pQty = Math.round(parseFloat(this.TotalPurchaseQty) + tempPurQty);
                                            bQty = Math.round(parseFloat(this.BalanceQty) - tempPurQty);
                                            // Update CUGEX values
                                            this.updateCUGEX1(this.supplier, this.agrnum, pQty, bQty, this.controller);
                                        }
                                        else {
                                            tempQuantity = this.controller.GetValue("WBORQA");
                                            msg = "Please validate the changed Quantity ";
                                            ConfirmDialog.ShowMessageDialog({
                                                dialogType: "Error",
                                                header: "Validate Changed Quantity",
                                                message: msg
                                            });
                                            this.controller.SetValue("WBORQA", tempQuantity);
                                            console.log("WBQRA" + this.controller.GetValue("WBORQA"));
                                            this.controller.PressKey("F5");
                                        }
                                    }
                                }
                            }
                            if (this.currentPanel === "PPA201BC") {
                                tempPurQty = Math.round(parseFloat(this.NewQty) * drywt);
                                if (this.operation == "Copy") {
                                    if (parseFloat(tempBalQty) < parseFloat(this.NewQty)) {
                                        msg = "Agreed balance quantity not available – Balance quantity is " + tempBalQty;
                                        ConfirmDialog.ShowMessageDialog({
                                            dialogType: "Error",
                                            header: "Insufficient Balance Quantity",
                                            message: msg
                                        });
                                        this.controller.PressKey("F5");
                                    }
                                    else {
                                        this.controller.ListOption("3");
                                    }
                                }
                                if (this.operation == "Delete") {
                                    console.log("Delete line ");
                                    pQty = parseFloat(this.TotalPurchaseQty) - parseFloat(tempPurQty);
                                    bQty = parseFloat(tempBalQty) + parseFloat(tempPurQty);
                                    this.updateCUGEX1(this.supplier, this.agrnum, pQty, bQty, this.controller);
                                }
                            }
                            if (this.currentPanel === "PPA200C0") {
                                console.log("total qty " + this.TotalQty);
                                tempBalQty = Math.round(parseFloat(this.BalanceQty / this.DryWt));
                                if (parseFloat(tempBalQty) < parseFloat(this.TotalQty)) {
                                    msg = "Agreed balance quantity not available – Balance quantity is " + tempBalQty;
                                    ConfirmDialog.ShowMessageDialog({
                                        dialogType: "Error",
                                        header: "Insufficient Balance Quantity",
                                        message: msg
                                    });
                                    this.controller.PressKey("F5");
                                }
                                else {
                                    this.controller.PressKey("ENTER");
                                }
                            }
                            if (this.currentPanel === "PPA250E0" || this.currentPanel === "PPA220GC") {
                                debugger;
                                tempPurQty = Math.round(parseFloat(this.NewQty) * drywt);
                                if ((parseFloat(tempBalQty) + parseFloat(this.prevQty)) < parseFloat(this.NewQty)) {
                                    msg = "Agreed balance quantity not available – Balance quantity is " + tempBalQty;
                                    ConfirmDialog.ShowMessageDialog({
                                        dialogType: "Error",
                                        header: "Insufficient Balance Quantity",
                                        message: msg
                                    });
                                    this.controller.PressKey("F5");
                                }
                                else {
                                    pQty = parseFloat(this.TotalPurchaseQty) + parseFloat(tempPurQty);
                                    bQty = parseFloat(tempBalQty) + parseFloat(tempPurQty);
                                    this.updateCUGEX1(this.supplier, this.agrnum, pQty, bQty, this.controller);
                                }
                            }
                        }
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    PPS201_VolBasedAgr_V2.prototype.ItemCheck = function (item, warehouse, controller) {
        return __awaiter(this, void 0, void 0, function () {
            var itemtype, acqcode, responsevalue, responsevalue1, msg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        itemtype = "0";
                        acqcode = "0";
                        return [4 /*yield*/, this.GetItemType(this.item)];
                    case 1:
                        responsevalue = _a.sent();
                        if (responsevalue !== 'undefined' && responsevalue !== null) {
                            itemtype = responsevalue[0].ITTY;
                        }
                        return [4 /*yield*/, this.GetAcqCode(this.item, this.warehouse)];
                    case 2:
                        responsevalue1 = _a.sent();
                        if (responsevalue1 !== 'undefined' && responsevalue1 !== null) {
                            acqcode = responsevalue1[0].PUIT;
                        }
                        // check if item acquisition code is 3 and item type is ING/PKG/FLR
                        if (acqcode == "3" && (itemtype == "ING" || itemtype == "PKG" || itemtype == "FLR")) {
                            msg = "PO cannot be created; Place the Intercompany DO";
                            ConfirmDialog.ShowMessageDialog({
                                dialogType: "Error",
                                header: "PO cannot be created",
                                message: msg
                            });
                            this.controller.PressKey("F5");
                        }
                        else {
                            this.controller.PressKey("ENTER");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    PPS201_VolBasedAgr_V2.prototype.updateCUGEX1 = function (SUNO, AgrNo, PurQty, BalQty, controller) {
        return __awaiter(this, void 0, void 0, function () {
            var responsevalue, price;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.CUSEX_UpdFieldValue(SUNO, AgrNo, PurQty, BalQty)];
                    case 1:
                        responsevalue = _a.sent();
                        price = this.controller.GetValue("WBPUPR");
                        // let responsevalue1: any = await this.UpdUserDef(this.PONum,this.POline,this.POSubline, price, PurQty, this.DryWt);		
                        if (this.currentPanel === "PPA201E0" || this.currentPanel === "PPA220GC" || this.currentPanel === "PPA250E0") {
                            this.controller.PressKey("ENTER");
                        }
                        if (this.currentPanel === "PPA201BC") {
                            console.log("update for Delete");
                            this.controller.ListOption("4");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    PPS201_VolBasedAgr_V2.prototype.CUSEX_GetFieldValue = function (Supplier, AgrNumber) {
        var _this = this;
        return new Promise(function (resolve) {
            var record = { 'CONO': _this.company, 'FILE': _this.file, 'PK01': Supplier, 'PK02': AgrNumber };
            var outputFields = ["N096", "N196", "A030"];
            MIService.Current.execute("CUSEXTMI", "GetFieldValue", record, outputFields).then(function (response) {
                if (null != response && null != response.item) {
                    resolve(response.items);
                    console.log(response.items);
                }
                else {
                    resolve(null);
                }
            }).catch(function (response) {
                resolve(null);
            });
        });
    };
    PPS201_VolBasedAgr_V2.prototype.CUSEX_UpdFieldValue = function (Supplier, AgrNumber, PurQty, BalQty) {
        var _this = this;
        return new Promise(function (resolve) {
            var record = { 'CONO': _this.company, 'FILE': _this.file, 'PK01': Supplier, 'PK02': AgrNumber, 'N196': PurQty, 'A030': BalQty };
            var outputFields = [];
            MIService.Current.execute("CUSEXTMI", "ChgFieldValue", record, outputFields).then(function (response) {
                if (null != response && null != response.item) {
                    resolve(response.items);
                    console.log(response.items);
                }
                else {
                    resolve(null);
                }
            }).catch(function (response) {
                resolve(null);
            });
        });
    };
    PPS201_VolBasedAgr_V2.prototype.PPS200_GetLine = function (PONumber, POLine, POSubline) {
        var _this = this;
        return new Promise(function (resolve) {
            var record = { 'CONO': _this.company, 'PUNO': PONumber, 'PNLI': POLine, 'PNLS': POSubline };
            var outputFields = ["ITNO", "OURR"];
            MIService.Current.execute("PPS200MI", "GetLine", record, outputFields).then(function (response) {
                if (null != response && null != response.item) {
                    resolve(response.items);
                    console.log(response.items);
                }
                else {
                    resolve(null);
                }
            }).catch(function (response) {
                resolve(null);
            });
        });
    };
    PPS201_VolBasedAgr_V2.prototype.GetItemType = function (ItemNumber) {
        var _this = this;
        return new Promise(function (resolve) {
            var record = { 'CONO': _this.company, 'ITNO': ItemNumber };
            var outputFields = ["ITTY"];
            MIService.Current.execute("MMS200MI", "Get", record, outputFields).then(function (response) {
                if (null != response && null != response.item) {
                    resolve(response.items);
                    console.log(response.items);
                }
                else {
                    resolve(null);
                }
            }).catch(function (response) {
                resolve(null);
            });
        });
    };
    PPS201_VolBasedAgr_V2.prototype.GetAcqCode = function (ItemNumber, warehouse) {
        var _this = this;
        return new Promise(function (resolve) {
            var record = { 'CONO': _this.company, 'ITNO': ItemNumber, 'WHLO': warehouse };
            var outputFields = ["PUIT"];
            MIService.Current.execute("MMS200MI", "GetItmWhsBasic", record, outputFields).then(function (response) {
                if (null != response && null != response.item) {
                    resolve(response.items);
                    console.log(response.items);
                }
                else {
                    resolve(null);
                }
            }).catch(function (response) {
                resolve(null);
            });
        });
    };
    PPS201_VolBasedAgr_V2.prototype.PPS200_GetHead = function (PONumber) {
        var _this = this;
        return new Promise(function (resolve) {
            var record = { 'CONO': _this.company, 'PUNO': PONumber };
            var outputFields = ["ORTY"];
            MIService.Current.execute("PPS200MI", "GetHead", record, outputFields).then(function (response) {
                if (null != response && null != response.item) {
                    resolve(response.items);
                    console.log(response.items);
                }
                else {
                    resolve(null);
                }
            }).catch(function (response) {
                resolve(null);
            });
        });
    };
    PPS201_VolBasedAgr_V2.prototype.PPS200_LstLine = function (PONumber) {
        var _this = this;
        return new Promise(function (resolve) {
            var record = { 'CONO': _this.company, 'PUNO': PONumber };
            var outputFields = ["ORQA", "OURR"];
            console.log("cono " + _this.company + " puno " + PONumber);
            MIService.Current.execute("PPS200MI", "LstLine", record, outputFields).then(function (response) {
                if (null != response && null != response.item) {
                    resolve(response.items);
                    console.log(response.items);
                }
                else {
                    resolve(null);
                }
            }).catch(function (response) {
                resolve(null);
            });
        });
    };
    PPS201_VolBasedAgr_V2.prototype.GetAgrDetails = function (Supplier, AgrNumber) {
        var _this = this;
        return new Promise(function (resolve) {
            var record = { 'CONO': _this.company, 'SUNO': Supplier, 'AGNB': AgrNumber };
            var outputFields = ["GRPI", "OBV1", "OBV2", "FVDT", "PUQT"];
            MIService.Current.execute("PPS100MI", "LstAgrLine", record, outputFields).then(function (response) {
                if (null != response && null != response.item) {
                    resolve(response.items);
                    console.log(response.items);
                }
                else {
                    resolve(null);
                }
            }).catch(function (response) {
                resolve(null);
            });
        });
    };
    PPS201_VolBasedAgr_V2.prototype.GetDryWt = function (Supplier, AgrNumber, GrpID, key1, key2, Date, ItemNo) {
        var _this = this;
        return new Promise(function (resolve) {
            var Agrfile = "MPAGRL";
            var record = { 'CONO': _this.company, 'FILE': Agrfile, 'PK01': Supplier, 'PK02': AgrNumber, 'PK03': GrpID, 'PK04': key1, 'PK05': key2, 'PK08': Date };
            var outputFields = ["N096"];
            MIService.Current.execute("CUSEXTMI", "GetFieldValue", record, outputFields).then(function (response) {
                if (null != response && null != response.item) {
                    resolve(response.items);
                    console.log(response.items);
                }
                else {
                    resolve(null);
                }
            }).catch(function (response) {
                resolve(null);
            });
        });
    };
    PPS201_VolBasedAgr_V2.prototype.UpdUserDef = function (PONum, POline, POSubline, Price, Qty, DryWt) {
        return new Promise(function (resolve) {
            if (POSubline == null) {
                POSubline = 0;
            }
            var WetPP = parseFloat(Price) * parseFloat(DryWt);
            var UDN3 = "1";
            var sucrosetotal = parseFloat(Qty) * parseFloat(WetPP);
            WetPP = WetPP.toFixed(3);
            sucrosetotal = sucrosetotal.toFixed(3);
            var record = { 'PUNO': PONum, 'PNLI': POline, 'PNLS': POSubline, 'UDN1': WetPP, 'UDN2': sucrosetotal, 'UDN3': UDN3 };
            var outputFields = [""];
            MIService.Current.execute("PPS200MI", "UpdUserDefLine", record, outputFields).then(function (response) {
                if (null != response && null != response.item) {
                    resolve(response.items);
                    console.log(response.items);
                }
                else {
                    resolve(null);
                    console.log(response.items);
                }
            }).catch(function (response) {
                resolve(null);
            });
        });
    };
    PPS201_VolBasedAgr_V2.prototype.detachEventsRequesting = function () {
        this.unsubscribeRequesting();
    };
    return PPS201_VolBasedAgr_V2;
}());
