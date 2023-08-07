sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageBox"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, MessageBox) {
    "use strict";
    var that;
    var cObj;
    return Controller.extend("treetable.controller.View1", {
      onInit: function () {
        that = this;
        var oModel = that.getOwnerComponent().getModel();
        oModel.read("/Employee", {
          success: function (oData) {
            var treeModel = new sap.ui.model.json.JSONModel();
            var hr = oData.results.filter((e) => e.DEPT === "10");
            var fun = oData.results.filter((e) => e.DEPT === "20");
            var dev = oData.results.filter((e) => e.DEPT === "30");
            var test = oData.results.filter((e) => e.DEPT === "40");
            treeModel.setData({
              employee: [
                {
                  ID: "HR",
                  icon:"sap-icon://account",
                  nodes: hr.map((m) => {   
                    return {
                      ID: m.ID,
                      NAME: m.NAME,
                      NUMBER: m.NUMBER,
                      DEPT: m.DEPT,
                    };
                  }),
                },
                {
                  ID: "DEVELOPER",
                  icon:"sap-icon://source-code",
                  nodes: dev.map((m) => {
                    return {
                      ID: m.ID,
                      NAME: m.NAME,
                      NUMBER: m.NUMBER,
                      DEPT: m.DEPT,
                    };
                  }),
                },
                {
                  ID: "FUNCTION",
                  icon:"sap-icon://add-equipment",
                  nodes: fun.map((m) => {
                    return {
                      ID: m.ID, 
                      NAME: m.NAME,
                      NUMBER: m.NUMBER,
                      DEPT: m.DEPT,
                    };
                  }),
                },
                {
                  ID: "TESTER",
                  icon:"sap-icon://lab",
                  nodes: test.map((m) => {
                    return {
                      ID: m.ID,
                      NAME: m.NAME,
                      NUMBER: m.NUMBER,
                      DEPT: m.DEPT,
                    };
                  }),
                },
              ],
            });
            that.getView().byId("Tree").setModel(treeModel);
            cObj = hr.map((m) => {
              return { ID: m.ID, NAME: m.NAME, NUMBER: m.NUMBER, DEPT: m.DEPT };
            })[0];
            that.getView().getModel("TEMP").setProperty("/", {
              ID: cObj.ID,
              NAME: cObj.NAME,
              NUMBER: cObj.NUMBER,
              DEPT: cObj.DEPT,
            });
            that.idModel(cObj);
            that.getView().byId("Tree").expand(0);
          },
          error: function (error) {
            console.log(error);
          },
        });
      },
      onAfterRendering: function () {
        
      },
      idData: function (oEvent) {
        var data = oEvent
          .getParameter("listItem")
          .getBindingContext()
          .getObject();
        if (data.NAME) {
          cObj = data;
        }
        that.getView().getModel("TEMP").setProperty("/", {
          ID: cObj.ID,
          NAME: cObj.NAME,
          NUMBER: cObj.NUMBER,
          DEPT: cObj.DEPT,
        });
        this.idModel(cObj);
      },
      idModel: function (cObj) {
        var mainModel = new sap.ui.model.json.JSONModel();
        var mainTable = that.getView().byId("table");
        mainModel.setData({
          emp: [cObj],
        });
        mainTable.setModel(mainModel);
      },
      details: function (oEvent) {
        that.getOwnerComponent().getRouter().navTo("detailsView");
      },
      openCreate: function () {
        if (!that.cDialog) {
          that.cDialog = that.loadFragment({
            name: "treetable.view.create",
            Controller: this,
          });
        }
        that.cDialog.then((oDialog) => {
          oDialog.open();
        });
      },
      openEdit: function () {
        if (!that.eDialog) {
          that.eDialog = that.loadFragment({
            name: "treetable.view.edit",
            Controller: this,
          });
        }
        that.eDialog.then((oDialog) => {
          oDialog.open();
        });
      },
      onClose: function () {
        that.getView().byId("id").setValueState(null);
        that.getView().byId("name").setValueState(null);
        that.getView().byId("number").setValueState(null);
        that.getView().byId("id").setValue(undefined);
        that.getView().byId("name").setValue(undefined);
        that.getView().byId("number").setValue(undefined);
        //that.getView().byId("dept").setValue(undefined);
        that.getView().byId("createDialog").close();
      },
      onEditClose: function () {
        that.getView().byId("name1").setValueState(sap.ui.core.ValueState.none);
        that.getView().byId("number1").setValueState(sap.ui.core.ValueState.none);
        that.getView().byId("editDialog").close();
      },
      createEmp: function () {
        var id = Number(that.getView().byId("id").getValue());
        var name = that.getView().byId("name").getValue();
        var number = that.getView().byId("number").getValue();
        var dept = that.getView().byId("dept").getSelectedItem().getKey();
        if (!name || that.getView().byId("name").getValueState() === "Error") {
          sap.m.MessageToast.show(" INVALID NAME");
        } else if (
          number.length != 10 ||
          that.getView().byId("number").getValueState() === "Error"
        ) {
          sap.m.MessageToast.show("INVALID NUMBER");
        } else if (
          !id ||
          that.getView().byId("id").getValueState() === "Error"
        ) {
          sap.m.MessageToast.show("INVALID ID");
        } else {
          var oModel = that.getOwnerComponent().getModel();
          oModel.callFunction("/crud", {
            method: "GET",
            urlParameters: {
              FLAG: "C",
              ID: id,
              NAME: name,
              NUMBER: number,
              DEPT: dept,
            },
            success: function (oData) {
              that.onInit();
              that.onClose();
              //   cObj = { ID: id, NAME: name, NUMBER: number };
              //   that.idModel(cObj);
              sap.m.MessageToast.show("CREATE DONE");
            },
            error: function (error) {
              console.log(error);
              sap.m.MessageToast.show(
                error.responseText.split(",")[2].split('"')[3]
              );
            },
          });
        }
      },
      updateEmp: function () {
        var id = Number(that.getView().byId("id1").getValue());
        var name = that.getView().byId("name1").getValue();
        var number = that.getView().byId("number1").getValue();
        var dept = that.getView().byId("dept1").getSelectedItem().getKey();
        if (!name || that.getView().byId("name1").getValueState() === "Error") {
          sap.m.MessageToast.show(" INVALID NAME");
        } else if (
          number.length != 10 ||
          that.getView().byId("number1").getValueState() === "Error"
        ) {
          sap.m.MessageToast.show("INVALID NUMBER");
        } else if (
          !id ||
          that.getView().byId("id1").getValueState() === "Error"
        ) {
          sap.m.MessageToast.show("INVALID ID");
        } else {
          var oModel = that.getOwnerComponent().getModel();
          oModel.callFunction("/crud", {
            method: "GET",
            urlParameters: {
              FLAG: "E",
              ID: id,
              NAME: name,
              NUMBER: number,
              DEPT: dept,
            },
            success: function (data) {
              that.onAfterRendering();
              that.onEditClose();
              cObj = { ID: id, NAME: name, NUMBER: number };
              that.idModel(cObj);
              sap.m.MessageToast.show("UPDATED");
            },
            error: function (error) {
              console.log(error);
              sap.m.MessageToast.show("ERROR");
            },
          });
        }
      },
      deleteEmp: function () {
        if (!cObj) {
          sap.m.MessageToast.show("SELECT ID FOR DELETE");
        } else {
          var oModel = that.getOwnerComponent().getModel();
          oModel.callFunction("/crud", {
            method: "GET",
            urlParameters: {
              FLAG: "D",
              ID: cObj.ID,
              NAME: null,
              NUMBER: null,
              DEPT: null,
            },
            success: function () {
              that.onInit();
              sap.m.MessageToast.show("DELETE DONE");
            },
            error: function () {
              sap.m.MessageToast.show("ERROR");
            },
          });
          cObj = null;
        }
      },
      confirmDelete: function () {
        MessageBox.confirm(`${cObj.NAME}`, {
          title: "DELETE EMPLOYEE",
          actions: ["DELETE", MessageBox.Action.CLOSE],
          initialFocus: sap.m.MessageBox.Action.CANCEL,
          onClose: function (sButton) {
            if (sButton === "DELETE") {
              that.deleteEmp();
            }
          },
        });
      },
      onLiveChangeId: function (oEvent) {
        var input = oEvent.getSource();
        var val = input.getValue();
        val = val.replace(/[^\d]/g, "");
        input.setValue(val);
        let value = that.getView().byId("id").getValue();
        if (Number(value) < 0) {
          that.getView().byId("id").setValueState(sap.ui.core.ValueState.Error);
        } else {
          that
            .getView()
            .byId("id")
            .setValueState(sap.ui.core.ValueState.Success);
        }
      },
      onLiveChangeName: function (oEvent) {
        let value = that.getView().byId("name").getValue();
        var input = oEvent.getSource();
        var val = input.getValue();
        val = val.replace(/[^\w]/g, "");
        input.setValue(val);
        if (value.length < 1) {
          that
            .getView()
            .byId("name")
            .setValueState(sap.ui.core.ValueState.Error);
        } else {
          that
            .getView()
            .byId("name")
            .setValueState(sap.ui.core.ValueState.Success);
        }
      },
      onLiveChangeNumber: function (oEvent) {
        var input = oEvent.getSource();
        var val = input.getValue();
        val = val.replace(/[^\d]/g, "");
        input.setValue(val);
        let value = that.getView().byId("number").getValue();
        if (value.length !== 10) {
          that
            .getView()
            .byId("number")
            .setValueState(sap.ui.core.ValueState.Error);
        } else {
          that
            .getView()
            .byId("number")
            .setValueState(sap.ui.core.ValueState.Success);
        }
      },
      onLiveChangeName1: function (oEvent) {
        let value = that.getView().byId("name").getValue();
        var input = oEvent.getSource();
        var val = input.getValue();
        val = val.replace(/[^\D]/g, "");
        input.setValue(val);
        if (value.length < 1) {
          that
            .getView()
            .byId("name1")
            .setValueState(sap.ui.core.ValueState.Error);
        } else {
          that
            .getView()
            .byId("name1")
            .setValueState(sap.ui.core.ValueState.Success);
        }
      },
      onLiveChangeNumber1: function (oEvent) {
        var input = oEvent.getSource();
        var val = input.getValue();
        val = val.replace(/[^\d]/g, "");
        input.setValue(val);
        let value = that.getView().byId("number1").getValue();
        if (value.length !== 10) {
          that
            .getView()
            .byId("number1")
            .setValueState(sap.ui.core.ValueState.Error);
        } else {
          that
            .getView()
            .byId("number1")
            .setValueState(sap.ui.core.ValueState.Success);
        }
      },
    });
  }
);
