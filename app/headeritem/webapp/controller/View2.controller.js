sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/f/library"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, fioriLibary) {
        "use strict";

        var that;
        return Controller.extend("headeritem.controller.View2", {
            onInit: function () {
                that = this;
            },
            getDetail: function () {
                const objModel = that.getOwnerComponent().getModel("OBJ");
                var OTable = that.byId("table2");
                const data = objModel.getProperty("/data");
                const model = new sap.ui.model.json.JSONModel();
                model.setData({
                    data: data
                })
                OTable.setModel(model);
            },
            back: function () {
                var oView = that.oView.getParent().getParent();
                oView.setLayout(fioriLibary.LayoutType.OneColumn);
            },
            pressOrderNow: async function () {
                if (!that.orderDialog) {
                    that.orderDialog = that.loadFragment({
                        name: "headeritem.view.order"
                    })
                }
                await that.orderDialog
                    .then((dialog) => {
                        dialog.open();
                    })
                const objModel = that.getOwnerComponent().getModel("OBJ");
                const obj = objModel.getProperty("/obj");
                that.byId("orderProduct").setValue(obj.PRODUCT_ID);
                that.byId("uniqueIDOrder").setValue(obj.UNIQUE_ID);
            },
            orderNow: function () {
                const oModel = that.getOwnerComponent().getModel();
                const PRODUCT = that.byId("orderProduct").getValue();
                const UNIQUE_ID = that.byId("uniqueIDOrder").getValue();
                const ORDER_QUANTITY = Number(that.byId("orderQuantity").getValue());
                const MATERIAL_AVAIL_DATE = that.byId("materialDate").getValue();
                if (!ORDER_QUANTITY || ORDER_QUANTITY === 0) {
                    that.byId("orderQuantity").setValueState(sap.ui.core.ValueState.Error);
                    return sap.m.MessageToast.show("GIVE A VALID ORDER_QUANTITY")
                }
                that.byId("orderQuantity").setValueState(sap.ui.core.ValueState.Success);
                if (!MATERIAL_AVAIL_DATE) {
                    that.byId("materialDate").setValueState(sap.ui.core.ValueState.Error);
                    return sap.m.MessageToast.show("GIVE A MATERIAL_AVAIL_DATE")
                }
                that.byId("materialDate").setValueState(sap.ui.core.ValueState.Success);
                oModel.callFunction("/order", {
                    method: "GET",
                    urlParameters: {
                        FLAG: "C",
                        PRODUCT: PRODUCT,
                        UNIQUE_ID: UNIQUE_ID,
                        ORDER_QUANTITY: ORDER_QUANTITY,
                        MATERIAL_AVAIL_DATE: MATERIAL_AVAIL_DATE,
                        CREADTED_DATE: new Date().toLocaleDateString(),
                        CREATED_BY: ""
                    },
                    success: function (message) {
                        that.onCloseOrder();
                        sap.m.MessageToast.show(`${message.order} HAS BEEN CREATED SUCCESSFULLY`);
                    },
                    error: function (error) {
                        console.log(error)
                        sap.m.MessageToast.show("Create Failed")
                    }
                })
            },
            checkOrderQuantity: function (oEvent) {
                var input = oEvent.getSource(),
                    val = input.getValue();
                val = val.replace(/[^\d]/g, '');
                input.setValue(val);
            },
            SearchOrder: function () {
                var sValue = that.getView().byId("orderSearch").getValue();
                var table = that.getView().byId("table2");
                var oBinding = table.getBinding("items");
                if (sValue === '') {
                    oBinding.filter([]);
                    return
                }
                var filter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("CHARVAL_NUM", sap.ui.model.FilterOperator.Contains, sValue),
                        new sap.ui.model.Filter("CHAR_VALNUMDESC", sap.ui.model.FilterOperator.Contains, sValue)
                    ],
                    and: false
                });
                oBinding.filter(filter);
            },
            onCloseOrder: function () {
                that.byId("orderQuantity").setValueState(sap.ui.core.ValueState.None);
                that.byId("materialDate").setValueState(sap.ui.core.ValueState.None);
                that.byId("orderQuantity").setValue("");
                that.byId("materialDate").setValue("");
                that.byId("orderDialog").close();
            },
        });
    });