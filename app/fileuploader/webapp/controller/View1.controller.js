sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/export/Spreadsheet'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,Spreadsheet) {
        "use strict";
        var that;
        return Controller.extend("fileuploader.controller.View1", {
            onInit: function () {
                that = this;
            },
            upload:function(oEvent){
                var excelData={};
                var file = this.byId("fileUpload").oFileUpload.files[0];
                var reader = new FileReader();
                reader.onload = function (e) {
                    var data = e.target.result;
                    var workbook = XLSX.read(data, {
                        type: "binary"
                    });
                    workbook.SheetNames.forEach(function (sheetName) {
						excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                        that.bindModel(excelData);
					});
            };
             reader.readAsBinaryString(file);
            },
            bindModel:function(array){
                var oModel = that.getOwnerComponent().getModel("global");
                oModel.setProperty("/",array);
                oModel.refresh(true);
                var OTable = that.byId("table");
                if(OTable.getColumns()[0]){
                    OTable.removeAllColumns();
                    OTable.removeAllCustomData();
                }
                var noOfColumn = Object.keys(array[0]).length;
                for(let i=0;i<noOfColumn;i++){
                    var oColumn = new sap.m.Column(Object.keys(array[0])[i] + Math.random(),{
                        header:new sap.m.Label({
                            text:Object.keys(array[0])[i]
                        })
                    })
                    OTable.addColumn(oColumn);
                }
                var oCell =[];
                for(let i=0;i<noOfColumn;i++){
                    let char = '{'+ Object.keys(array[0])[i] +'}'
                    var cell1 = new sap.m.Text({
                        text: char
                        });
                        oCell.push(cell1)
                }
                var aColList = new sap.m.ColumnListItem(Object.keys(array[0])[1] + Math.random(), {
                    cells: oCell
                 });
                 OTable.setModel(oModel);
                 OTable.bindItems("/",aColList);
            },
            createColumnConfig: function(list) {
                var aCols = [];
                var noOfColumn = Object.keys(list[0]).length;
                for(let i=0;i< noOfColumn-1;i++){
                    aCols.push({
                        property: Object.keys(list[0])[i]
                    });
                }
                return aCols;
            },
            onExport: function() {
                var aCols, oRowBinding, oSettings, oSheet, oTable,list;
                oTable = that.byId("table");
                oRowBinding = oTable.getBinding('items');
                list = oRowBinding.oList;
                aCols = this.createColumnConfig(list);
    
                oSettings = {
                    workbook: {
                        columns: aCols,
                        hierarchyLevel: 'Level'
                    },
                    dataSource: oRowBinding,
                    fileName: 'Employee.xlsx',
                    worker: true
                };
    
                oSheet = new Spreadsheet(oSettings);
                oSheet.build().finally(function() {
                    oSheet.destroy();
                });
            },
        });
    });
