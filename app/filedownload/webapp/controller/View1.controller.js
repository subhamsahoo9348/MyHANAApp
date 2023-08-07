sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, Spreadsheet, exportLibrary) {
    "use strict";
    var that;
    var aData;
    return Controller.extend("filedownload.controller.View1", {
      onInit: function () {
        that = this;
        var oModel = that.getOwnerComponent().getModel();
        var model = new sap.ui.model.json.JSONModel();
        var oTable = that.byId("table");
        oModel.read("/Employee", {
          success: function (data) {
            aData = data.results;
            that.bindModel(data.results);
          },
          error: function (error) {
            console.log(error);
          },
        });
      },
      create: function () {
        var oTable = that.byId("table");
        var cName = that.byId("colName").getValue();
        var cType = that.byId("dataType").getValue();
        var oColumn = new sap.m.Column(cName + "1", {
          header: new sap.m.Label({
            text: cName,
          }),
        });
        oTable.addColumn(oColumn);
        aData.forEach((o) => {
          return (o[cName] = cType);
        });
        that.bindModel(aData);
        this.onClose();
      },
      openCreateColumn: function () {
        if (!this.dialog) {
          this.dialog = this.loadFragment({
            name: "filedownload.view.create",
          });
        }
        this.dialog.then((d) => {
          d.open();
        });
      },
      bindModel: function (array) {
        var oModel = that.getOwnerComponent().getModel("global");
        oModel.setProperty("/", array);
        oModel.refresh(true);
        var OTable = that.byId("table");
        OTable.getModel().refresh(true);
        if (OTable.getColumns()[0]) {
          OTable.removeAllColumns();
          OTable.removeAllCustomData();
        }
        var noOfColumn = Object.keys(array[0]).length;
        for (let i = 0; i < noOfColumn; i++) {
          if (!(Object.keys(array[0])[i] === "__metadata")) {
            var oColumn = new sap.m.Column(
              Object.keys(array[0])[i] + Math.random(),
              {
                header: new sap.m.Label({
                  text: Object.keys(array[0])[i],
                }),
              }
            );
            OTable.addColumn(oColumn);
          }
        }
        var oCell = [];
        for (let i = 0; i < noOfColumn; i++) {
          if (!(Object.keys(array[0])[i] === "__metadata")) {
            let char = "{" + Object.keys(array[0])[i] + "}";
            var cell1 = new sap.m.Text({
              text: char,
            });
            oCell.push(cell1);
          }
        }
        var aColList = new sap.m.ColumnListItem(
          Object.keys(array[0])[1] + Math.random(),
          {
            cells: oCell,
          }
        );
        OTable.setModel(oModel);
        OTable.bindItems("/", aColList);
      },
      onClose: function () {
        that.byId("createDialog").close();
      },
      createColumnConfig: function (list) {
        var aCols = [];
        var noOfColumn = Object.keys(list[0]).length;
        for (let i = 0; i < noOfColumn; i++) {
          if (!(Object.keys(list[0])[i] === "__metadata")) {
            aCols.push({
              property: Object.keys(list[0])[i],
            });
          }
        }
        return aCols;
      },
      onExport: function () {
        var aCols, oRowBinding, oSettings, oSheet, oTable, list;
        oTable = that.byId("table");
        oRowBinding = oTable.getBinding("items");
        list = oRowBinding.oList;
        aCols = this.createColumnConfig(list);
        oSettings = {
          workbook: {
            columns: aCols,
          },
          dataSource: oRowBinding,
          fileName: "Employee.xlsx",
          worker: true,
        };
        oSheet = new Spreadsheet(oSettings);
        oSheet.build().finally(function () {
          oSheet.destroy();
        });
      },
    });
  }
);
