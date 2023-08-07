sap.ui.define(
    ["sap/ui/core/mvc/Controller"],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
      "use strict";
  
      var that, selectItems;
      return Controller.extend("staticicalforecast.controller.CreateProfile", {
        onInit: function () {
          that = this;
          this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          this._oRouter.attachRouteMatched(this.getDetail, this);
          that.byId("table2").setModel(new sap.ui.model.json.JSONModel({}));
          const oModel = that.getOwnerComponent().getModel();
          oModel.read("/CP_STAT_METHOD", {
            success: function (data) {
              const select = that.byId("algoSelect");
              const algo = data.results.map((obj) => {
                return { method: obj.METHOD };
              });
              algo.unshift({ method: null });
              const model = new sap.ui.model.json.JSONModel();
              model.setData({
                algo: algo,
              });
              select.setModel(model);
            },
            error: function (error) {
              console.log(error);
            },
          });
        },
        back: function () {
          that.getOwnerComponent().getModel("obj").setProperty("/", {});
          that.byId("saveButton").setVisible(true);
          that.byId("updateButton").setVisible(false);
          that.byId("profileName").setEnabled(true);
          that.getOwnerComponent().getRouter().navTo("RouteView1");
        },
        onChange: function () {
          const method = that.byId("algoSelect").getSelectedKey();
          const oModel = that.getOwnerComponent().getModel();
          oModel.read("/CP_STAT_METHOD_VAL", {
            success: function (data) {
              var items = data.results.filter((obj) => obj.METHOD === method);
              items = items.map((obj) => {
                return {
                  PARAM: obj.PARAM,
                  PARAM_DESC: obj.PARAM_DESC,
                  DATA_TYPE: obj.DATA_TYPE,
                  DEFAULT_VALUE: obj.DEFAULT_VALUE,
                  PARAM_VALUE: obj.DEFAULT_VALUE,
                };
              });
              const obj = that
                .getOwnerComponent()
                .getModel("obj")
                .getProperty("/");
              if (obj.METHOD && method === obj.METHOD) {
                items = items.map((obj, index) => {
                  return {
                    PARAM: obj.PARAM,
                    PARAM_DESC: obj.PARAM_DESC,
                    DATA_TYPE: obj.DATA_TYPE,
                    DEFAULT_VALUE: obj.DEFAULT_VALUE,
                    PARAM_VALUE: selectItems[index].PARAM_VALUE,
                  };
                });
              }
              const table = that.byId("table2");
              const model = new sap.ui.model.json.JSONModel();
              model.setData({
                items: items,
              });
              table.setModel(model);
            },
            error: function (error) {
              console.log(error);
            },
          });
        },
        selectItemMethod: function () {
          const table = that.byId("table2");
          const model = table.getModel().getData().items;
          selectItems.forEach((obj) => {
            model.forEach((item) => {
              if (item.PARAM === obj.PARAM) {
                item.PARAM_VALUE = obj.PARAM_VALUE;
              }
            });
          });
          const JSONmodel = new sap.ui.model.json.JSONModel();
          JSONmodel.setData({
            items: model,
          });
          table.setModel(JSONmodel);
          selectItems.forEach((obj) => {
            that
              .byId("table2")
              .getItems()
              .forEach((item) => {
                if (item.getBindingContext().getObject().PARAM === obj.PARAM) {
                  that.byId("table2").setSelectedItem(item);
                }
              });
          });
        },
        getDetail: function (oEvent) {
          const obj = that.getOwnerComponent().getModel("obj").getProperty("/");
          if (!obj.PROFILE) {
            that.byId("page").setTitle("Create Profile");
            that.byId("algoSelect").setSelectedKey(null);
            that.byId("profileName").setValue("");
            that.byId("profileDesc").setValue("");
            that.byId("table2").setModel(new sap.ui.model.json.JSONModel({}));
            return true;
          }
          const oModel = that.getOwnerComponent().getModel();
          oModel.read("/CP_STAT_PROFILE_VAL", {
            success: async function (data) {
              var items = data.results.filter(
                (item) => item.PROFILE === obj.PROFILE
              );
              selectItems = items;
            },
            error: function (error) {
              console.log(error);
            },
          });
          that.byId("page").setTitle("Copy Profile");
          that.byId("profileDesc").setValue(obj.PRF_DESC);
          that.byId("algoSelect").setSelectedKey(obj.METHOD);
          that.onChange();
          if (that.getOwnerComponent().getModel("obj").getProperty("/").isEdit) {
            that.byId("profileName").setValue(obj.PROFILE);
            that.byId("profileName").setEnabled(false);
            that.byId("profileDesc").setValue(obj.PRF_DESC);
            that.byId("page").setTitle("Edit Profile");
            that.byId("saveButton").setVisible(false);
            that.byId("updateButton").setVisible(true);
          }
        },
        onSave: async function () {
          const oModel = that.getOwnerComponent().getModel();
          const profileName = that.byId("profileName").getValue();
          if (!profileName) {
            return sap.m.MessageToast.show("Profile Name required");
          }
          const profileDesc = that.byId("profileDesc").getValue();
          if (!profileDesc) {
            return sap.m.MessageToast.show("ProfileDesc required");
          }
          const method = that.byId("algoSelect").getSelectedKey();
          if (!method) {
            return sap.m.MessageToast.show("Method required");
          }
          const CP_STAT_PROFILE_VAL = [];
          that
            .byId("table2")
            .getItems()
            .forEach((item) => {
              const obj = item.getBindingContext().getObject();
              CP_STAT_PROFILE_VAL.push({
                PROFILE: profileName,
                PARAM: obj.PARAM,
                PARAM_VALUE: obj.PARAM_VALUE,
              });
            });
          if (CP_STAT_PROFILE_VAL.length === 0) {
            return sap.m.MessageToast.show("SELECT SOME DATA");
          }
          const obj = {
            profileName: profileName,
            profileDesc: profileDesc,
            method: method,
            CP_STAT_PROFILE_VAL: CP_STAT_PROFILE_VAL,
          };
          oModel.callFunction("/save", {
            method: "GET",
            urlParameters: {
              FLAG: "C",
              OBJ: JSON.stringify(obj),
            },
            success: function (message) {
              console.log(message);
              that.back();
              sap.m.MessageToast.show("Create Done");
            },
            error: function (error) {
              if (
                error.responseText.split(":")[13].substring(8, 21) ===
                "already exist"
              ) {
                sap.m.MessageToast.show(
                  profileName +
                    " " +
                    error.responseText.split(":")[13].substring(8, 21)
                );
              } else {
                console.log(error);
                sap.m.MessageToast.show("Create Failed");
              }
            },
          });
        },
        onUpdate: function () {
          const oModel = that.getOwnerComponent().getModel();
          const profileName = that.byId("profileName").getValue();
          if (!profileName) {
            return sap.m.MessageToast.show("Profile Name required");
          }
          const profileDesc = that.byId("profileDesc").getValue();
          if (!profileDesc) {
            return sap.m.MessageToast.show("ProfileDesc required");
          }
          const method = that.byId("algoSelect").getSelectedKey();
          if (!method) {
            return sap.m.MessageToast.show("Method required");
          }
          const CP_STAT_PROFILE_VAL = [];
          that
            .byId("table2")
            .getItems()
            .forEach((item) => {
              const obj = item.getBindingContext().getObject();
              CP_STAT_PROFILE_VAL.push({
                PROFILE: profileName,
                PARAM: obj.PARAM,
                PARAM_VALUE: obj.PARAM_VALUE,
              });
            });
          if (CP_STAT_PROFILE_VAL.length === 0) {
            return sap.m.MessageToast.show("SELECT SOME DATA");
          }
          const obj = {
            profileName: profileName,
            profileDesc: profileDesc,
            method: method,
            CP_STAT_PROFILE_VAL: CP_STAT_PROFILE_VAL,
          };
          oModel.callFunction("/save", {
            method: "GET",
            urlParameters: {
              FLAG: "U",
              OBJ: JSON.stringify(obj),
            },
            success: function (message) {
              console.log(message);
              that.back();
              sap.m.MessageToast.show("Update Done");
            },
            error: function (error) {
              console.log(error);
              sap.m.MessageToast.show("Upadte Failed");
            },
          });
        },
      });
    }
  );