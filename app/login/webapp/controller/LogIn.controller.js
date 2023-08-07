sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,MessageToast) {
        "use strict";
        var that,
        pShow = false,
        cShow = false,
        fShow = false,
        isLogIn = false;
        return Controller.extend("login.controller.LogIn", {
            onInit: function () {
                that = this;
            },
            onLogIn:function(){
                var name = this.getView().byId("name").getValue(),
                pass = this.getView().byId("pass").getValue(),
                oModel = that.getOwnerComponent().getModel(),
                obj,
                gModel;
                oModel.read("/Employee",{
                    success:function(data){
                        obj = data.results.filter(o=> o.NAME === name)[0];
                        if(!obj){
                            MessageToast.show("USER NOT EXIT");
                            $( ".sapMMessageToast" ).addClass( "sapMMessageToastRed" )
                            return true;
                        }
                        if(! (obj.PASSWORD === pass)){
                            that.byId("pass").setValue(undefined);
                            MessageToast.show("WRONG PASSWORD");
                            $( ".sapMMessageToast" ).addClass( "sapMMessageToastRed" );
                            return true;
                        }
                        that.getView().byId("name").setValue(undefined);
                        that.getView().byId("pass").setValue(undefined);
                        obj.logIn = true;
                        gModel = th
                        at.getView().getModel("GLOBAL");
                        gModel.setProperty("/",obj);
                        that.getOwnerComponent().getRouter().navTo("details",{isLogIn:isLogIn});
                    },
                    error:function(error){
                        console.log(error)
                    }
                })
            },
            pressSignUp:function(){
                if(! that.dialog){
                    that.dialog = that.loadFragment({
                        name:"login.view.create"
                    })
                }
                that.dialog.then(
                    oDialog=>{
                        oDialog.open();
                    }
                )
            },
            onClose:function(){
                that.byId("id1").setValueState(sap.ui.core.ValueState.None);
                that.byId("name1").setValueState(sap.ui.core.ValueState.None);
                that.byId("number1").setValueState(sap.ui.core.ValueState.None);
                that.byId("pass1").setValueState(sap.ui.core.ValueState.None);
                that.byId("id1").setValue(undefined);
                that.byId("name1").setValue(undefined);
                that.byId("number1").setValue(undefined);
                that.byId("dept1").setSelectedKey("10");
                that.byId("pass1").setValue(undefined);
                that.byId("cPass").setValue(undefined);
                that.getView().byId("createDialog").close();
            },
            pressForgetPassword:function(){
                if(! that.fDialog){
                    that.fDialog = that.loadFragment({
                        name:"login.view.ForgetPassword"
                    })
                }
                that.fDialog.then(
                    oDialog=>{
                        oDialog.open();
                    }
                )
            },
            onCloseForgetPassword:function(){
                that.byId("user").setValue(undefined);
                that.byId("fPass").setValue(undefined);
                that.byId("fPass").setValueState(sap.ui.core.ValueState.None);
                that.byId("cFPass").setValue(undefined);
                that.getView().byId("forgetDialog").close();
            },
            onCreate:function(){
                var id = that.byId("id1").getValue(),
                name = that.byId("name1").getValue(),
                number = that.byId("number1").getValue(),
                dept = that.byId("dept1").getSelectedKey(),
                password = that.byId("pass1").getValue(),
                cPassword = that.byId("cPass").getValue(),
                validatePassword,
                oModel;
                if(!id || !name || !number || !password || !cPassword || that.byId("id1").getValueState() === "Error" || that.byId("name1").getValueState() === "Error" || that.byId("number1").getValueState() === "Error"|| that.byId("pass1").getValueState() === "Error"){
                    MessageToast.show("INAVLID ENTRY");
                    $( ".sapMMessageToast" ).addClass( "sapMMessageToastRed" )
                    return true;
                }
                validatePassword = this.passwordValidate(password);
                if( !(validatePassword === true)){
                    that.byId("pass1").setValueState(sap.ui.core.ValueState.Error);
                    MessageToast.show(validatePassword)
                    $( ".sapMMessageToast" ).addClass( "sapMMessageToastRed" )
                    return true;
                }
                that.byId("pass1").setValueState(sap.ui.core.ValueState.Success)
                if(password !== cPassword){
                    that.byId("pass1").setValue(undefined);
                    that.byId("cPass").setValue(undefined);
                    MessageToast.show("PASSWORD DID NOT MATCH");
                    $( ".sapMMessageToast" ).addClass( "sapMMessageToastRed" )
                    return true;
                }
                oModel = that.getOwnerComponent().getModel();
                oModel.callFunction("/crud",{
                    method:"GET",
                    urlParameters:{
                        FLAG:"C",
                        ID:id,
                        NAME:name,
                        NUMBER:number,
                        DEPT:dept,
                        PASSWORD:password
                    },
                    success:function(data){
                        MessageToast.show("CREATE DONE");
                        that.onClose();
                    },
                    error:function(error){
                        if(error.responseText.split(",")[2].substring(8,31) === '"Entity already exists"'){
                        MessageToast.show("ID ALREADY EXISTS");
                        $( ".sapMMessageToast" ).addClass( "sapMMessageToastRed" )
                    }else{
                        MessageToast.show("ERROR")
                        $( ".sapMMessageToast" ).addClass( "sapMMessageToastRed" )
                    }
                    }
                })
            },
            onUpdatePassword:function(){
                var id = Number(that.byId("user").getValue()),
                password = that.byId("fPass").getValue(),
                cPassword = that.byId("cFPass").getValue();
                validatePassword = this.passwordValidate(password),
                valid,
                oModel;
                if( !(validatePassword === true)){
                    that.byId("fPass").setValueState(sap.ui.core.ValueState.Error);
                    MessageToast.show(validatePassword);
                    $( ".sapMMessageToast" ).addClass( "sapMMessageToastRed" );
                    return true;
                }
                that.byId("fPass").setValueState(sap.ui.core.ValueState.Success)
                if(password !== cPassword){
                    that.getView().byId("fPass").setValue(undefined);
                    that.getView().byId("cFPass").setValue(undefined);
                    MessageToast.show("PASSWORD DID NOT MATCH");
                    $( ".sapMMessageToast" ).addClass( "sapMMessageToastRed")
                    return true;
                }
                valid = (!id || !cPassword || that.byId("user").getValueState() === "Error" || that.byId("fPass").getValueState() === "Error" || that.byId("cFPass").getValueState() === "Error");
                if(valid){
                    MessageToast.show("INAVLID ENTRY");
                    $( ".sapMMessageToast" ).addClass( "sapMMessageToastRed" )
                    return true;
                } 
                oModel = that.getOwnerComponent().getModel();
                oModel.callFunction("/crud",{
                    method:"GET",
                    urlParameters:{
                        FLAG:"UP",
                        ID:id,
                        NAME:null,
                        NUMBER:null,
                        DEPT:null,
                        PASSWORD:password
                    },
                    success:function(data){
                        MessageToast.show("PASSWORD UPDATE");
                        that.onCloseForgetPassword();
                    },
                    error:function(error){
                        if(error.statusCode === '500')
                        MessageToast.show("INVALID ID");
                        MessageToast.show("ERROR");
                    }
                })
            },
            onLiveChangeId: function (oEvent) {
                var input = oEvent.getSource(),
                val = input.getValue();
                val = val.replace(/[^\d]/g, ''),
                value;
                input.setValue(val);
                let value = that.getView().byId("id1").getValue();
                if (Number(value) < 0) {
                  that.getView().byId("id").setValueState(sap.ui.core.ValueState.Error);
                } else {
                  that
                    .getView()
                    .byId("id1")
                    .setValueState(sap.ui.core.ValueState.Success);
                }
              },
              onLiveChangeName: function (oEvent) {
                let value = that.getView().byId("name1").getValue();
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
              onLiveChangeNumber: function (oEvent) {
                var input = oEvent.getSource(),
                val = input.getValue();
                val = val.replace(/[^\d]/g, '');
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
              passwordValidate:function(password){
                if (password.length < 6) {
                    return "Your password needs a minimum of 6 characters"
                }
                if (!(/[a-z]/.test(password))) {
                    return "Your password needs a lower case letter"
                }
                if (!(/[A-Z]/.test(password))) {
                    return "Your password needs an uppser case letter"
                }
                if (!(/[0-9]/.test(password))) {
                    return "Your password needs a number"
                }
                if (!(/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password))) {
                    return "Your password needs a specialchar"
                }
                return true;
              },
              show:function(){
                if(! pShow){
                    this.getView().byId("pass").setValueHelpIconSrc("sap-icon://hide");
                    this.getView().byId("pass").setType("Text");
                    pShow = true;
                }else{
                    this.getView().byId("pass").setValueHelpIconSrc("sap-icon://show");
                    this.getView().byId("pass").setType("Password");
                    pShow = false;
                }
              },
              cShow:function(){
                if(! cShow){
                    this.getView().byId("pass1").setValueHelpIconSrc("sap-icon://hide");
                    this.getView().byId("pass1").setType("Text");
                    cShow = true;
                }else{
                    this.getView().byId("pass1").setValueHelpIconSrc("sap-icon://show");
                    this.getView().byId("pass1").setType("Password");
                    cShow = false;
                }
              },
              fShow:function(){
                if(! fShow){
                    this.getView().byId("fPass").setValueHelpIconSrc("sap-icon://hide");
                    this.getView().byId("fPass").setType("Text");
                    fShow = true;
                }else{
                    this.getView().byId("fPass").setValueHelpIconSrc("sap-icon://show");
                    this.getView().byId("fPass").setType("Password");
                    fShow = false;
                }
              }
        });
    });
