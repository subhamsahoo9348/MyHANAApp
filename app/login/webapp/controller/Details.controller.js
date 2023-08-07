sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,MessageToast) {
        "use strict";
        var that;
        return Controller.extend("login.controller.Details", {
            onInit: function () {
                that = this;
            },
            back:function(oEvent){
                that.getView().getModel("GLOBAL").setProperty("/",null);
                that.getOwnerComponent().getRouter().navTo("RouteLogIn",null,true);
            },
        });
    });
