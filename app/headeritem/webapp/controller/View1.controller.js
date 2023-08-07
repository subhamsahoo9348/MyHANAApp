sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/f/library",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, fioriLibary) {
    "use strict";
    var that, value, tree, CHARVAL_NUM, filter_X;
    var select = [];
    return Controller.extend("headeritem.controller.View1", {
      onInit: function () {
        that = this;
        value = [];
        const oModel = that.getOwnerComponent().getModel();
        const oSelect = that.byId("select");
        oModel.read("/UNIQUE_ID_HEADER", {
          success: function (data) {
            let newData = data.results;
            let id = [];
            newData.forEach((obj) => {
              if (!id.includes(obj.UID_TYPE)) {
                id.push(obj.UID_TYPE);
              }
            });
            newData = id;
            const UNIQUE_ID = newData.map((item) => {
              return {
                UID_TYPE: item,
              };
            });
            UNIQUE_ID.unshift({ UID_TYPE: "ALL" });
            const model = new sap.ui.model.json.JSONModel();
            model.setData({
              UNIQUE_ID: UNIQUE_ID,
            });
            oSelect.setModel(model);
          },
          error: function (error) {
            console.log(error);
          },
        });
      },

      go: function () {
        that.byId("search").setValue("");
        const key = that.byId("select").getSelectedKey();
        let product = that.byId("input").getValue();
        if (!product) {
          return sap.m.MessageToast.show("Select a PRODUCT");
        }
        const oTable = that.byId("table");
        const oModel = that.getOwnerComponent().getModel();
        oModel.read("/UNIQUE_ID_HEADER", {
          success: function (data) {
            let items;
            if (key === "ALL") {
              items = data.results.filter((obj) => {
                return obj.PRODUCT_ID === product;
              });
            } else {
              items = data.results.filter((obj) => {
                return obj.PRODUCT_ID === product && obj.UID_TYPE === key;
              });
            }
            const model = new sap.ui.model.json.JSONModel();
            model.setData({
              HEADER_ITEM: items,
            });
            oTable.setModel(model);
            oModel.setProperty("/data", data.results);
            const array = data.results.map((o) => {
              return {
                UNIQUE_ID: o.UNIQUE_ID,
                UID_TYPE: o.UID_TYPE,
                ACTIVE: o.ACTIVE,
              };
            });
            var OTable = that.byId("table");
            that.bindModel(array, OTable);
            var oFirstItem = oTable.getItems()[0];
            if (oFirstItem) {
              OTable.setSelectedItem(oFirstItem);
              that.onPress();
            }
          },
          error: function (error) {
            console.log(error);
          },
        });
      },

      bindModel: function (array, OTable) {
        const oModel = that.getOwnerComponent().getModel();
        if (OTable.getColumns()[0]) {
          OTable.removeAllColumns();
          OTable.removeAllCustomData();
        }
        var noOfColumn = Object.keys(array[0]).length;
        for (let i = 0; i < noOfColumn; i++) {
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
        var oCell = [];
        for (let i = 0; i < noOfColumn - 1; i++) {
          let char = "{" + Object.keys(array[0])[i] + "}";
          var cell1;
          if (Object.keys(array[0])[i] === "UNIQUE_ID") {
            var box = new sap.m.VBox("v" + Math.random(), {});
            box.addItem(
              new sap.m.Text({
                text: char,
              })
            );
            box.addItem(
              new sap.m.Text({
                text: "{UNIQUE_DESC}",
              })
            );
            cell1 = box;
          } else {
            cell1 = new sap.m.Text({
              text: char,
            });
          }
          oCell.push(cell1);
        }
        var switc = new sap.m.Switch({
          state: "{ACTIVE}",
          type: "AcceptReject",
        });
        switc.attachChange(function (oEvent) {
          const selectObject = oEvent
            .getSource()
            .getBindingContext()
            .getObject();
          oModel.callFunction("/crud", {
            method: "GET",
            urlParameters: {
              FLAG: "ACTIVE",
              PRODUCT_ID: null,
              UNIQUE_DESC: null,
              UID_TYPE: null,
              ACTIVE: selectObject.ACTIVE,
              VALUE: null,
              UNIQUE_ID: selectObject.UNIQUE_ID,
            },
            success: function (message) {
              if (selectObject.ACTIVE) {
                sap.m.MessageToast.show("ACTIVE");
              } else {
                sap.m.MessageToast.show("INACTIVE");
              }
            },
            error: function () {
              console.log(error);
              sap.m.MessageToast.show("Failed");
            },
          });
        });
        oCell.push(switc);
        var aColList = new sap.m.ColumnListItem(
          Object.keys(array[0])[1] + Math.random(),
          {
            cells: oCell,
            type: "Active",
          }
        );
        OTable.bindItems("/HEADER_ITEM", aColList);
      },

      onPress: function (oEvent) {
        const oModel = that.getOwnerComponent().getModel(),
          objModel = that.getOwnerComponent().getModel("OBJ");
        var obj = that
          .byId("table")
          .getSelectedItem()
          .getBindingContext()
          .getObject();
        var index = Number(
          that
            .byId("table")
            .getSelectedItem()
            .getBindingContext()
            .sPath.split("/")[2]
        );
        var item = that.byId("table").getItems()[index];
        that.byId("table").setSelectedItem(item);
        oModel.callFunction("/crud", {
          method: "GET",
          urlParameters: {
            FLAG: "SELECT",
            PRODUCT_ID: null,
            UNIQUE_DESC: null,
            UID_TYPE: null,
            ACTIVE: null,
            VALUE: null,
            UNIQUE_ID: obj.UNIQUE_ID,
          },
          success: function (message) {
            const data = JSON.parse(message.crud).store;
            objModel.setProperty("/data", data);
            objModel.setProperty("/obj", obj);
            var oView = that.oView.getParent().getParent();
            oView.setLayout(fioriLibary.LayoutType.TwoColumnsMidExpanded);
            sap.ui.controller("headeritem.controller.View2").getDetail();
          },
          error: function () {
            console.log(error);
            sap.m.MessageToast.show("Create Failed");
          },
        });
      },

      onSearch: function (oEvent) {
        var sValue = that.getView().byId("search").getValue();
        var table = that.getView().byId("table");
        var oBinding = table.getBinding("items");
        if (sValue === "") {
          oBinding.filter([]);
          return;
        }
        var filter = new sap.ui.model.Filter(
          [
            new sap.ui.model.Filter(
              "UNIQUE_ID",
              sap.ui.model.FilterOperator.EQ,
              parseInt(sValue, 10)
            ),
            new sap.ui.model.Filter(
              "UNIQUE_DESC",
              sap.ui.model.FilterOperator.Contains,
              sValue
            ),
          ],
          false
        );
        oBinding.filter(filter);
      },

      onValueHelpRequest: function () {
        if (!that.suggestDialog) {
          that.suggestDialog = that.loadFragment({
            name: "headeritem.view.suggest",
          });
        }
        that.suggestDialog.then((dialog) => {
          dialog.open();
        });
        const oModel = that.getOwnerComponent().getModel();
        oModel.read("/UNIQUE_ID_HEADER", {
          success: async function (data) {
            const model = new sap.ui.model.json.JSONModel();
            let datas = [];
            data.results.forEach((obj) => {
              if (!datas.includes(obj.PRODUCT_ID)) {
                datas.push(obj.PRODUCT_ID);
              }
            });
            const PRODUCT_ID = datas.map((item) => {
              return {
                PRODUCT_ID: item,
              };
            });
            await model.setData({
              PRODUCT_ID: PRODUCT_ID,
            });
            that.byId("selectDialog").setModel(model);
          },
          error: function (error) {
            console.log(error);
          },
        });
      },

      onValueHelpDialogSearch: function (oEvent) {
        var sValue = oEvent.getParameter("value");
        var oFilter = new sap.ui.model.Filter(
          "PRODUCT_ID",
          sap.ui.model.FilterOperator.Contains,
          sValue
        );
        oEvent.getSource().getBinding("items").filter(oFilter);
      },

      onValueHelpDialogClose: function (oEvent) {
        var oSelectedItem = oEvent.getParameter("selectedItem");
        if (!oSelectedItem) {
          return;
        }
        const title = oSelectedItem.getTitle();
        that.byId("input").setValue(title);
      },

      filterTable: function (oEvent) {
        let key = that.byId("select").getSelectedKey();
        if (key === "ALL") {
          key = "";
        }
        var oBinding = that.getView().byId("table").getBinding("items");
        var filter = new sap.ui.model.Filter(
          "UID_TYPE",
          sap.ui.model.FilterOperator.Contains,
          key
        );
        oBinding.filter(filter);
      },

      create: async function (oEvent) {
        const button = oEvent.getParameters().id;
        if (button === "container-headeritem---View1--create") {
          const objModel = that.getOwnerComponent().getModel("OBJ");
          const obj = objModel.getProperty("/obj");
          if (!obj) {
            return sap.m.MessageToast.show("Select A PRODUCT TO CREATE");
          }
          var key = obj.UID_TYPE;
          var product = obj.PRODUCT_ID;
          if (product === "" || !product)
            return sap.m.MessageToast.show("Select a Product");
          if (key === "ALL" || !key) {
            sap.m.MessageToast.show("Select a valid UniqueType");
            return;
          }
        } else {
          var objModel = that.getOwnerComponent().getModel("OBJ");
          var data = objModel.getProperty("/data");
          if (!data) {
            return sap.m.MessageToast.show("Select A PRODUCT TO COPY");
          }
        }
        if (!that.createDialog) {
          that.createDialog = that.loadFragment({
            name: "headeritem.view.create",
          });
        }
        await that.createDialog.then((dialog) => {
          dialog.open();
        });
        const oModel = that.getOwnerComponent().getModel();
        const oSelect = that.byId("uniqueTypeInput");
        await oModel.read("/UNIQUE_ID_HEADER", {
          success: function (data) {
            let newData = data.results;
            let id = [];
            newData.forEach((obj) => {
              if (!id.includes(obj.UID_TYPE)) {
                id.push(obj.UID_TYPE);
              }
            });
            newData = id;
            const UNIQUE_ID = newData.map((item) => {
              return {
                UID_TYPE: item,
              };
            });
            const model = new sap.ui.model.json.JSONModel();
            model.setData({
              UNIQUE_ID: UNIQUE_ID,
            });
            oSelect.setModel(model);
            oSelect.setSelectedKey(obj.UID_TYPE);
          },
          error: function (error) {
            console.log(error);
          },
        });
        if (button === "container-headeritem---View1--copy") {
          that.byId("createPlus").setVisible(false);
          that.byId("copyPlus").setVisible(true);
          const objModel = that.getOwnerComponent().getModel("OBJ");
          value = objModel.getProperty("/data");
          const obj = objModel.getProperty("/obj");
          that.byId("productInput").setValue(obj.PRODUCT_ID);
          that.byId("uniqueTypeInput").setSelectedKey(obj.UID_TYPE);
          that.byId("activeStatusInput").setValue(obj.ACTIVE);
          const oTable3 = that.byId("table3");
          const model = new sap.ui.model.json.JSONModel();
          model.setData({
            CHARVAL: value,
          });
          oTable3.setModel(model);
        } else {
          that.byId("createPlus").setVisible(true);
          that.byId("copyPlus").setVisible(false);
          that.byId("productInput").setValue(product);
          that.byId("uniqueTypeInput").setSelectedKey(key);
          that.byId("activeStatusInput").setValue(true);
          const oTable3 = that.byId("table3");
          const model = new sap.ui.model.json.JSONModel();
          model.setData({
            CHARVAL: [],
          });
          oTable3.setModel(model);
          value = [];
        }
      },

      onCreate: function () {
        var oTable = that.getView().byId("table3");
        const PRODUCT_ID = that.byId("productInput").getValue(),
          UNIQUE_DESC = that.byId("uniqueDescriptionInput").getValue(),
          UID_TYPE = that.byId("uniqueTypeInput").getSelectedKey(),
          ACTIVE = that.byId("activeStatusInput").getValue(),
          oModel = that.getOwnerComponent().getModel();
        if (!UNIQUE_DESC) {
          that
            .byId("uniqueDescriptionInput")
            .setValueState(sap.ui.core.ValueState.Error);
          return sap.m.MessageToast.show("Enter UNIQUE_DESC");
        }
        that
          .byId("uniqueDescriptionInput")
          .setValueState(sap.ui.core.ValueState.Success);
        const value = oTable.getModel().getData().CHARVAL;
        if (value.length === 0) {
          return sap.m.MessageToast.show("Enter CHAR_VALUE");
        }
        oModel.callFunction("/crud", {
          method: "GET",
          urlParameters: {
            FLAG: "C",
            PRODUCT_ID: PRODUCT_ID,
            UNIQUE_DESC: UNIQUE_DESC,
            UID_TYPE: UID_TYPE,
            ACTIVE: ACTIVE,
            VALUE: JSON.stringify({ value }),
            UNIQUE_ID: null,
          },
          success: function (message) {
            that.onClose();
            that.go();
            sap.m.MessageToast.show("Create Done");
          },
          error: function () {
            console.log(error);
            sap.m.MessageToast.show("Create Failed");
          },
        });
      },

      onClose: function () {
        select = [];
        filter_X = undefined;
        that.byId("uniqueDescriptionInput").setValue("");
        that
          .byId("uniqueDescriptionInput")
          .setValueState(sap.ui.core.ValueState.None);
        that.byId("table3").getModel().setData();
        that.byId("createDialog").close();
      },

      onCloseOption: function () {
        that.byId("list").setModel(new sap.ui.model.json.JSONModel({}));
        that.byId("searchCHARVAL_NUM").setValue("");
        that.byId("optionDialog").close();
      },
      onCloseTree: function () {
        that
          .byId("treeTableDialog")
          .setModel(new sap.ui.model.json.JSONModel({}));
        that.byId("treeTableDialog").close();
      },

      listSelect: function (oEvent) {
        oEvent
          .getParameters()
          .listItem.getContent()[0]
          .getContent()[0]
          .setSelectedIndex(-1);
        const selectedItems = that.byId("list").getSelectedItems();
        selectedItems.forEach((item) => {
          item
            .getContent()[0]
            .getContent()[0]
            .getButtons()
            .forEach((button) => {
              const _obj = {
                CHARVAL_NUM: item.getBindingContext().getObject().names,
                CHAR_VALNUMDESC: button.getText(),
              };
              if (select.indexOf(_obj) === -1) {
                select.push(_obj);
              }
            });
        });
      },

      selectItem: function () {
        const count = function getOccurrence(array, value) {
          var count = 0;
          array.forEach((v) => v === value && count++);
          return count;
        };
        const tableData = that.byId("table3").getModel().getData().CHARVAL;
        const data1 = [];
        tableData.forEach((obj) => {
          data1.push(obj.CHARVAL_NUM);
        });
        tableData.forEach((obj) => {
          if (count(data1, obj.CHARVAL_NUM) > 1) {
            that
              .byId("list")
              .getItems()
              .forEach((item) => {
                if (item.getContent()[0].getHeaderText() === obj.CHARVAL_NUM) {
                  item.setSelected(true);
                }
              });
          } else {
            that
              .byId("list")
              .getItems()
              .forEach((item) => {
                if (item.getContent()[0].getHeaderText() === obj.CHARVAL_NUM) {
                  item.getContent()[0].setExpanded(true);
                  item
                    .getContent()[0]
                    .getContent()[0]
                    .getButtons()
                    .forEach((b) => {
                      if (b.getText() === obj.CHAR_VALNUMDESC)
                        b.getParent().setSelectedButton(b);
                    });
                }
              });
          }
        });
      },

      add: function () {
        if (!that.optionDialog) {
          that.optionDialog = that.loadFragment({
            name: "headeritem.view.option",
          });
        }
        that.optionDialog.then((dialog) => {
          dialog.open();
        });
        const oModel = that.getOwnerComponent().getModel();
        oModel.read("/CHARVAL_NUM", {
          success: async function (data) {
            CHARVAL_NUM = data.results;
            const option = [];
            let CHARNAME = [];
            data.results.forEach((obj) => {
              CHARNAME.push(obj.CHARVAL_NUM);
            });
            const uniqueName = [...new Set(CHARNAME)];
            uniqueName.forEach((c) => {
              const temp = data.results.filter((obj) => obj.CHARVAL_NUM === c);
              option.push({
                names: c,
                desc: temp.map((s) => s.CHAR_VALNUMDESC),
              });
            });
            const model = new sap.ui.model.json.JSONModel();
            model.setData({
              tree: option,
            });
            that.byId("list").setModel(model);
            tree = that.getView().byId("list").getModel().getData().tree;
            that
              .byId("list")
              .getItems()
              .forEach((item) => {
                const text = item.getContent()[0].getHeaderText();
                const temp = CHARVAL_NUM.filter(
                  (obj) => obj.CHARVAL_NUM === text
                );
                temp.forEach((obj) => {
                  item
                    .getContent()[0]
                    .getContent()[0]
                    .addButton(
                      new sap.m.RadioButton({ text: obj.CHAR_VALNUMDESC })
                    );
                });
              });
            that.selectItem();
          },
          error: function (error) {
            console.log(error);
          },
        });
      },

      buttonSelect: async function (oEvent) {
        let x = that.byId("table3").getModel().getData().CHARVAL;
        if (x) {
          x = x.map((obj) => {
            return {
              CHARVAL_NUM: obj.CHARVAL_NUM,
              CHAR_VALNUMDESC: obj.CHAR_VALNUMDESC,
            };
          });
        }
        oEvent
          .getSource()
          .getSelectedButton()
          .getParent()
          .getParent()
          .getParent()
          .setSelected(false);
        let items = that.byId("list").getItems();
        await items.forEach((item) => {
          if (
            item
              .getContent()[0]
              .getControlsByFieldGroupId("")[0]
              .getSelectedButton()
          ) {
            const _obj = {
              CHARVAL_NUM: item.getBindingContext().getObject().names,
              CHAR_VALNUMDESC: item
                .getContent()[0]
                .getControlsByFieldGroupId("")[0]
                .getSelectedButton()
                .getText(),
            };
            if (select.indexOf(_obj) === -1) {
              const find = select.find(
                (f) => f.CHARVAL_NUM === _obj.CHARVAL_NUM
              );
              const x_find = x.find?.(
                (f) => f.CHARVAL_NUM === _obj.CHARVAL_NUM
              );
              if (x_find) {
                x[x.indexOf(x_find)].CHAR_VALNUMDESC = _obj.CHAR_VALNUMDESC;
              }
              filter_X = x;
              if (find) {
                select[select.indexOf(find)].CHAR_VALNUMDESC =
                  _obj.CHAR_VALNUMDESC;
              } else {
                select.push(_obj);
              }
            }
          }
        });
      },

      confirm: async function (oEvent) {
        that.onCloseOption();
        let x = that.byId("table3").getModel().getData().CHARVAL;
        if (x) {
          x = x.map((obj) => {
            return {
              CHARVAL_NUM: obj.CHARVAL_NUM,
              CHAR_VALNUMDESC: obj.CHAR_VALNUMDESC,
            };
          });
          if (filter_X) {
            x = filter_X;
          }
          select.forEach((select_Obj) => {
            const temp = x.find(
              (x_obj) => x_obj.CHARVAL_NUM === select_Obj.CHARVAL_NUM
            );
            if (temp) {
              x[x.indexOf(temp)] = select_Obj;
            }
          });
          select = [...select, ...x];
        }
        select = select.filter((value, index) => {
          const _value = JSON.stringify(value);
          return (
            index ===
            select.findIndex((obj) => {
              return JSON.stringify(obj) === _value;
            })
          );
        });
        const oTable3 = that.byId("table3");
        const model = new sap.ui.model.json.JSONModel();
        model.setData({
          CHARVAL: select,
        });
        oTable3.setModel(model);
      },

      onsearchCHARVAL_NUM: function () {
        var sValue = that
          .getView()
          .byId("searchCHARVAL_NUM")
          .getValue()
          .toLowerCase();
        var list = tree;
        var modelData = [];
        list.forEach((obj) => {
          const f = obj.desc.map((a) => a.toLowerCase().startsWith(sValue));
          const v = obj.names.toLowerCase().includes(sValue);
          if (f.find((b) => b === true) || v) {
            modelData.push(obj);
          }
        });
        that
          .getView()
          .byId("list")
          .setModel(new sap.ui.model.json.JSONModel({ tree: modelData }));
        if (sValue) {
          that
            .byId("list")
            .getItems()
            .forEach((item) => {
              item.getContent()[0].setExpanded(true);
            });
        } else {
          that
            .byId("list")
            .getItems()
            .forEach((item) => {
              if (item.getContent()[0].getExpanded()) {
                item.getContent()[0].setExpanded(false);
              }
            });
        }
        that
          .byId("list")
          .getItems()
          .forEach((item) => {
            const text = item.getContent()[0].getHeaderText();
            const temp = CHARVAL_NUM.filter((obj) => obj.CHARVAL_NUM === text);
            item.getContent()[0].getContent()[0].removeAllButtons();
            temp.forEach((obj) => {
              item
                .getContent()[0]
                .getContent()[0]
                .addButton(
                  new sap.m.RadioButton({ text: obj.CHAR_VALNUMDESC })
                );
            });
          });
        that.selectItem();
      },

      deleteRow: function (oEvent) {
        const path = Number(
          oEvent
            .getParameter("listItem")
            .getBindingContext()
            .sPath.split("/")[2]
        );
        let CHARVAL = that.byId("table3").getModel().getData().CHARVAL;
        CHARVAL = CHARVAL.filter((v) => {
          return CHARVAL.indexOf(v) !== path;
        });
        //let CHARVAL = that.byId("table3").getModel().getData().CHARVAL;
        select = select.filter((v) => {
          return select.indexOf(v) !== path;
        });
        const model = new sap.ui.model.json.JSONModel();
        model.setData({
          CHARVAL: CHARVAL,
        });
        that.byId("table3").setModel(model);
      },

      openTreeTable: function () {
        const selectIndex = [];
        let jump = 0;
        if (!that.treeTable) {
          that.treeTable = that.loadFragment({
            name: "headeritem.view.treeTable",
          });
        }
        that.treeTable
          .then((dialog) => {
            dialog.open();
          })
          .then(() => {
            const oModel = that.getOwnerComponent().getModel();
            oModel.read("/CHARVAL_NUM", {
              success: async function (data) {
                const CHARVAL_NUM = [];
                data.results.forEach((obj) => {
                  CHARVAL_NUM.push(obj.CHARVAL_NUM);
                });
                const uniqueName = [...new Set(CHARVAL_NUM)];
                const CHARL = [];
                const modelData = that.byId("table3").getModel().getData();
                uniqueName.forEach((name) => {
                  CHARL.push({
                    name: name,
                    show: false,
                    types: data.results
                      .filter((obj) => obj.CHARVAL_NUM === name)
                      .map((obj) => {
                        const temp = {
                          show: true,
                          select: false,
                          gN: obj.CHARVAL_NUM,
                          type: obj.CHAR_VALNUMDESC,
                        };
                        if (modelData.CHARVAL.length > 0) {
                          temp.select = Boolean(
                            modelData.CHARVAL.find(
                              (o) =>
                                o.CHARVAL_NUM === temp.gN &&
                                o.CHAR_VALNUMDESC === temp.type
                            )
                          );
                        }
                        return temp;
                      }),
                  });
                });
                CHARL.forEach((items) => {
                  items.types.forEach((type) => {
                    if (type.select) {
                      selectIndex.push(uniqueName.indexOf(type.gN) + jump);
                      jump = jump + items.types.length;
                    }
                  });
                });
                that.byId("treeTableDialog").setModel(
                  new sap.ui.model.json.JSONModel({
                    CHARL: CHARL,
                  })
                );
                if (selectIndex.length > 0) {
                  selectIndex.forEach((index) => {
                    that.byId("TreeTable").expand(index);
                  });
                }
              },
              error: function (error) {
                console.log(error);
              },
            });
          });
      },

      searchName: function () {
        var sValue = that.getView().byId("search1").getValue();
        var table = that.getView().byId("TreeTable");
        const model = that.getView().byId("TreeTable").getModel().getData()
          .CHARL.length;
        if (sValue) {
          for (let i = 0; i < model; i++) {
            table.expandToLevel(i);
          }
        } else {
          table.collapseAll();
        }
        var oBinding = table.getBinding();
        var filter = new sap.ui.model.Filter(
          [
            new sap.ui.model.Filter(
              "gN",
              sap.ui.model.FilterOperator.Contains,
              sValue
            ),
            new sap.ui.model.Filter(
              "type",
              sap.ui.model.FilterOperator.Contains,
              sValue
            ),
          ],
          false
        );
        oBinding.filter(filter);
      },

      treeTableSelect: function () {
        const buttons = [];
        that
          .byId("treeTableDialog")
          .getModel()
          .getData()
          .CHARL.forEach((obj) => {
            obj.types.forEach((obj1) => {
              if (obj1.select) {
                buttons.push(obj1);
              }
            });
          });
        const select = buttons.map((obj) => {
          return { CHARVAL_NUM: obj.gN, CHAR_VALNUMDESC: obj.type };
        });
        const oTable3 = that.byId("table3");
        const model = new sap.ui.model.json.JSONModel();
        model.setData({
          CHARVAL: select,
        });
        oTable3.setModel(model);
        that.onCloseTree();
      },
    });
  }
);
