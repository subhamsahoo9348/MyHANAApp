sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";
        var that;
        return Controller.extend("treetable.controller.View", {
            onInit: function () {
                that=this
            },
            back:function(oEvent){
                that.getOwnerComponent().getRouter().navTo("RouteView1");
            }
        });
    });
