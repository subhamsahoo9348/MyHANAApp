sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        var that;
        return Controller.extend("goibibbo.controller.goibibbo", {
            onInit: function () {
                that = this;
                setInterval(()=>{
                    this.next();
                },4000)
                setInterval(()=>{
                    that.byId('c_').next();
                },3000)
            },
            next:function(){
                that.byId('car').next();
            },
            pre:function(){
                that.byId('car').previous();
            }
        });
    });
