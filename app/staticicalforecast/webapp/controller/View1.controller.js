sap.ui.define(
    ["sap/ui/core/mvc/Controller"],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
      "use strict";
  
      var that;
      return Controller.extend("staticicalforecast.controller.View1", {
        onInit: function () {
          that = this;
          this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          this._oRouter.attachRouteMatched(this.getDetail, this);
          const oModel = that.getOwnerComponent().getModel();
          oModel.read("/CP_STAT_PROFILE", {
            success: function (data) {
              const table = that.byId("table");
              const model = new sap.ui.model.json.JSONModel();
              model.setData({
                item: data.results,
              });
              table.setModel(model);
            },
            error: function (error) {
              console.log(error);
            },
          });
        },
        getDetail: function () {
          that.onInit();
        },
        onCreate: function () {
          that.getOwnerComponent().getRouter().navTo("CreateProfile");
        },
        search: function () {
          const sValue = that.byId("search").getValue();
          var table = that.getView().byId("table");
          var oBinding = table.getBinding("items");
          var filter = new sap.ui.model.Filter(
            [
              new sap.ui.model.Filter(
                "PROFILE",
                sap.ui.model.FilterOperator.Contains,
                sValue
              ),
              new sap.ui.model.Filter(
                "PRF_DESC",
                sap.ui.model.FilterOperator.Contains,
                sValue
              ),
            ],
            false
          );
          oBinding.filter(filter);
        },
        onCopy: async function () {
          const item = that.byId("table").getSelectedItem();
          if (!item) {
            return sap.m.MessageToast.show("SELECT A PRODUCT");
          }
          const obj = item.getBindingContext().getObject();
          obj.isEdit = false;
          that.getOwnerComponent().getModel("obj").setProperty("/", obj);
          that.getOwnerComponent().getRouter().navTo("CreateProfile");
        },
        onEdit() {
          const item = that.byId("table").getSelectedItem();
          if (!item) {
            return sap.m.MessageToast.show("SELECT A PRODUCT TO EDIT");
          }
          const obj = item.getBindingContext().getObject();
          obj.isEdit = true;
          that.getOwnerComponent().getModel("obj").setProperty("/", obj);
          that.getOwnerComponent().getRouter().navTo("CreateProfile");
        },
        onDelete: function () {
          const item = that.byId("table").getSelectedItem();
          if (!item) {
            return sap.m.MessageToast.show("SELECT A PRODUCT TO DELETE");
          }
          const obj1 = item.getBindingContext().getObject();
          const obj = {
            profileName: obj1.PROFILE,
            profileDesc: null,
            method: null,
            CP_STAT_PROFILE_VAL: null,
          };
          const oModel = that.getOwnerComponent().getModel();
          oModel.callFunction("/save", {
            method: "GET",
            urlParameters: {
              FLAG: "D",
              OBJ: JSON.stringify(obj),
            },
            success: function (message) {
              console.log(message);
              sap.m.MessageToast.show("Deleted");
              that.onInit();
            },
            error: function (error) {
              console.log(error);
              sap.m.MessageToast.show("Delete Failed");
            },
          });
        },
      });
    }
  );