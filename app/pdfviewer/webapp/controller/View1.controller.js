sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/PDFViewer"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, PDFViewer) {
    "use strict";
    var that;
    return Controller.extend("pdfviewer.controller.View1", {
      onInit: function () {
        that = this;
        var oModel = that.getOwnerComponent().getModel();
        oModel.read("/PDFStore", {
          success: function (data) {
            var model = new sap.ui.model.json.JSONModel();
            model.setData({
              pdf: data.results,
            });
            that.byId("pdfTable").setModel(model);
          },
          error: function (error) {
            debugger;
          },
        });
        $("#save").hide(1000);
      },

      onAfterRendering: function () {},

      showSave: function () {
        $(that.byId("save")).show(2000);
      },

      onUpload: function () {
        debugger;
        var file = that.byId("pdfFile").oFileUpload.files[0];
        if (!file) {
          sap.m.MessageToast.show("CHOOSE A FILE");
          return;
        }
        var url = URL.createObjectURL(file);
        window.open(
          url,
          "_blank",
          "scrollbars=yes,resizable=yes,top=100,left=500,width=800,height=600"
        );
      },

      base64Toblob: async function (base) {
        const baseString = base.split(",")[1];
        const byte = atob(baseString);
        const mime = "application/pdf";
        const arrayBuffer = new ArrayBuffer(byte.length);
        const array = new Uint8Array(arrayBuffer);
        for (var i = 0; i < byte.length; i++) {
          array[i] = byte.charCodeAt(i);
        }
        const blob = new Blob([array], { type: mime });
        return URL.createObjectURL(blob);
      },

      showPDF: async function (oEvent) {
        var base64 = oEvent.getSource().getBindingContext().getObject().URL;
        var name = oEvent.getSource().getBindingContext().getObject().NAME;
        var url = await this.base64Toblob(base64);
        window.open(
          url,
          "_blank",
          "scrollbars=yes,resizable=yes,top=100,left=500,width=800,height=600"
        );
        //this.onSelect(name);
        // var opdfViewer = new PDFViewer();
        // that.getView().addDependent(opdfViewer);
        // var sServiceURL = this.getView().getModel().sServiceUrl;
        // var sSource = url.split('blob:')[1];
        // opdfViewer.setSource(sSource);
        // opdfViewer.setTitle( "My PDF");
        // opdfViewer.open();
      },

      onSelect: function (name) {
        var model = that.getOwnerComponent().getModel();
        model.callFunction("/savepdf", {
          method: "GET",
          urlParameters: {
            FLAG: "select",
            NAME: name,
            URL: null,
          },
          success: function (s) {
            console.log(s);
            sap.m.MessageToast.show("FILE RE$AD");
          },
          error: function (error) {
            sap.m.MessageToast.show("ERROR");
            console.log(error);
          },
        });
      },

      onSavePress: function () {
        if (!that.byId("pdfFile").getValue()) {
          sap.m.MessageToast.show("CHOOSE A FILE");
          return;
        }

        
        if (!that.dialog) {
          that.dialog = that.loadFragment({
            name: "pdfviewer.view.create",
          });
        }
        that.dialog.then((d) => {
          d.open();
        });
      },

      onSave: function () {
        var file = that.byId("pdfFile").oFileUpload.files[0];
        var model = that.getOwnerComponent().getModel();
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (e) {
          var data = e.target.result;
          var name = that.byId("pdfName").getValue();
          model.callFunction("/savepdf", {
            method: "GET",
            urlParameters: {
              FLAG: "save",
              NAME: name,
              URL: data,
            },
            success: function (s) {
              that.onClose();
              that.onInit();
              sap.m.MessageToast.show("FILE SAVED");
            },
            error: function (error) {
              sap.m.MessageToast.show("ERROR");
              console.log(error);
            },
          });
        };
      },

      onClose: function () {
        that.byId("nameDialog").close();
      },
    });
  }
);
