const cds = require("@sap/cds");
module.exports = (srv) => {
  srv.on("crud1", async (req, res) => {
    if (req.data.FLAG === "C") {
      try {
        await cds.run(
          INSERT.into("APP_INTERACTIONS_EMPLOYEE").entries({
            ID: req.data.ID,
            NAME: req.data.NAME,
            NUMBER: req.data.NUMBER,
            DEPT: req.data.DEPT,
            PASSWORD: req.data.PASSWORD,
          })
        );
      } catch (e) {
        throw e;
      }
    } else if (req.data.FLAG === "D") {
      try {
        await cds.run(
          DELETE.from("APP_INTERACTIONS_EMPLOYEE").where({ ID: req.data.ID })
        );
      } catch (e) {
        throw e;
      }
    } else if (req.data.FLAG === "E") {
      try {
        await cds.run(
          UPDATE("APP_INTERACTIONS_EMPLOYEE", { ID: req.data.ID }).with({
            ID: req.data.ID,
            NAME: req.data.NAME,
            NUMBER: req.data.NUMBER,
            DEPT: req.data.DEPT,
          })
        );
      } catch (e) {
        throw e;
      }
    } else if (req.data.FLAG === "UP") {
      try {
        await cds.run(
          UPDATE("APP_INTERACTIONS_EMPLOYEE", { ID: req.data.ID }).set({
            PASSWORD: req.data.PASSWORD,
          })
        );
      } catch (e) {
        throw e;
      }
    }
  });
  srv.on("savepdf", async (req, res) => {
    if (req.data.FLAG === "save") {
      try {
        await cds.run(
          INSERT.into("APP_INTERACTIONS_PDFSTORE").entries({
            NAME: req.data.NAME,
            URL: req.data.URL,
          })
        );
      } catch (e) {
        throw e;
      }
    } else if (req.data.FLAG === "delete") {
      try {
        await cds.run(
          DELETE.from("APP_INTERACTIONS_PDFSTORE").where({
            NAME: req.data.NAME,
          })
        );
      } catch (e) {
        throw e;
      }
    } else if (req.data.FLAG === "select") {
      try {
        const res = await cds.run(
          SELECT.from("APP_INTERACTIONS_PDFSTORE").where({
            NAME: req.data.NAME,
          })
        );
        console.log(res[0].NAME);
        return res[0].NAME;
      } catch (e) {
        throw e;
      }
    }
  });
  srv.on("crud", async (req, res) => {
    if (req.data.FLAG === "C") {
      try {
        const value = JSON.parse(req.data.VALUE).value;
        const v = await cds.run(SELECT.from("APP_INTERACTIONS_UNIQUE_ID_HEADER"));
        const data = await cds.run(SELECT.from("APP_INTERACTIONS_CHARVAL_NUM"));
        const id = v.length + 1;
        value.forEach(async (obj) => {
          const item = await data.find((o) => {
            return (
              o.CHARVAL_NUM === obj.CHARVAL_NUM &&
              o.CHAR_VALNUMDESC === obj.CHAR_VALNUMDESC
            );
          });
          await cds.run(
            INSERT.into("APP_INTERACTIONS_UNIQUE_ID_ITEM").entries({
              UNIQUE_ID: id,
              PRODUCT: req.data.PRODUCT_ID,
              CHAR_NUM: item.CHAR_NUM,
              CHAR_NUM_VAL: null,
              CHAR_VALNUMDESC: item.CHAR_VALNUMDESC,
            })
          );
        });
        await cds.run(
          INSERT.into("APP_INTERACTIONS_UNIQUE_ID_HEADER").entries({
            UNIQUE_ID: id,
            PRODUCT_ID: req.data.PRODUCT_ID,
            UNIQUE_DESC: req.data.UNIQUE_DESC,
            UID_TYPE: req.data.UID_TYPE,
            ACTIVE: req.data.ACTIVE,
          })
        );
      } catch (e) {
        throw e;
      }
    } else if (req.data.FLAG === "SELECT") {
      try {
        let store = [];
        //await cds.run(DELETE.from("CP_SEED_ORDER"));
        const APP_INTERACTIONS_UNIQUE_ID_ITEM = await cds.run(
          SELECT.from("APP_INTERACTIONS_UNIQUE_ID_ITEM").where({
            UNIQUE_ID: req.data.UNIQUE_ID,
          })
        );
        const APP_INTERACTIONS_CHARVAL_NUM = await cds.run(SELECT.from("APP_INTERACTIONS_CHARVAL_NUM"));
        function randomIntFromInterval(min, max) {
          return Math.floor(Math.random() * (max - min + 1) + min);
        }
        const filter = APP_INTERACTIONS_UNIQUE_ID_ITEM.forEach((item) => {
          if (item.CHAR_VALNUMDESC === null) {
            let v = APP_INTERACTIONS_CHARVAL_NUM.filter((obj) => {
              return (
                obj.CHAR_NUM === item.CHAR_NUM &&
                obj.CHAR_NUM_VAL === item.CHAR_NUM_VAL
              );
            });
            v.forEach((obj) => {
              store.push(obj);
            });
            store = [store[randomIntFromInterval(0, 2)]];
          } else {
            let v = APP_INTERACTIONS_CHARVAL_NUM.filter((obj) => {
              return (
                obj.CHAR_NUM === item.CHAR_NUM &&
                obj.CHAR_VALNUMDESC === item.CHAR_VALNUMDESC
              );
            });
            v.forEach((obj) => {
              store.push(obj);
            });
          }
        });
        return JSON.stringify({ store });
      } catch (e) {
        throw e;
      }
    } else if (req.data.FLAG === "ACTIVE") {
      try {
        await cds.run(
          UPDATE("APP_INTERACTIONS_UNIQUE_ID_HEADER", { UNIQUE_ID: req.data.UNIQUE_ID }).set({
            ACTIVE: req.data.ACTIVE,
          })
        );
      } catch (e) {
        throw e;
      }
    }
  });
  srv.on("order", async (req, res) => {
    if (req.data.FLAG === "C") {
      try {
        const CP_SEED_ORDER = await cds.run(SELECT.from("APP_INTERACTIONS_SEED_ORDER"));
        const orderId = "SE000" + (CP_SEED_ORDER.length + 1);
        const mail = req.headers["x-username"];
        await cds.run(
          INSERT.into("APP_INTERACTIONS_SEED_ORDER").entries({
            SEEDORDER: orderId,
            PRODUCT: req.data.PRODUCT,
            UNIQUE_ID: req.data.UNIQUE_ID,
            ORDER_QUANTITY: req.data.ORDER_QUANTITY,
            MATERIAL_AVAIL_DATE: req.data.MATERIAL_AVAIL_DATE,
            CREADTED_DATE: req.data.CREADTED_DATE,
            CREATED_BY: mail,
          })
        );
        return orderId;
      } catch (e) {
        throw e;
      }
    }
  });
  srv.on("save", async (req, res) => {
    if (req.data.FLAG === "C") {
      try {
        const obj = JSON.parse(req.data.OBJ);
        const profileName = obj.profileName;
        const profileDesc = obj.profileDesc;
        const method = obj.method;
        const CP_STAT_PROFILE_VAL = obj.CP_STAT_PROFILE_VAL;
        await cds.run(
          INSERT.into("APP_INTERACTIONS_CP_STAT_PROFILE").entries({
            PROFILE: profileName,
            PRF_DESC: profileDesc,
            METHOD: method,
            CREATED_DATE: null,
            CREATED_BY: null,
          })
        );
        for (let i = 0; i < CP_STAT_PROFILE_VAL.length; i++) {
          await cds.run(
            INSERT.into("APP_INTERACTIONS_CP_STAT_PROFILE_VAL").entries({
              PROFILE: CP_STAT_PROFILE_VAL[i].PROFILE,
              PARAM: CP_STAT_PROFILE_VAL[i].PARAM,
              PARAM_VALUE: CP_STAT_PROFILE_VAL[i].PARAM_VALUE,
            })
          );
        }
      } catch (e) {
        throw e;
      }
    } else if (req.data.FLAG === "D") {
      try {
        const obj = JSON.parse(req.data.OBJ);
        const profileName = obj.profileName;
        await cds.run(
          DELETE.from("APP_INTERACTIONS_CP_STAT_PROFILE").where({ PROFILE: profileName })
        );
        await cds.run(
          DELETE.from("APP_INTERACTIONS_CP_STAT_PROFILE_VAL").where({ PROFILE: profileName })
        );
      } catch (e) {
        throw e;
      }
    } else if (req.data.FLAG === "U") {
      try {
        const obj = JSON.parse(req.data.OBJ);
        const profileName = obj.profileName;
        const profileDesc = obj.profileDesc;
        const method = obj.method;
        const CP_STAT_PROFILE_VAL = obj.CP_STAT_PROFILE_VAL;
        await cds.run(
          UPDATE("APP_INTERACTIONS_CP_STAT_PROFILE", { PROFILE: profileName }).set({
            PRF_DESC: profileDesc,
            METHOD: method,
            CREATED_DATE: null,
            CREATED_BY: null,
          })
        );
        await cds.run(
          DELETE.from("APP_INTERACTIONS_CP_STAT_PROFILE_VAL").where({ PROFILE: profileName })
        );
        for (let i = 0; i < CP_STAT_PROFILE_VAL.length; i++) {
          await cds.run(
            INSERT.into("APP_INTERACTIONS_CP_STAT_PROFILE_VAL").entries({
              PROFILE: CP_STAT_PROFILE_VAL[i].PROFILE,
              PARAM: CP_STAT_PROFILE_VAL[i].PARAM,
              PARAM_VALUE: CP_STAT_PROFILE_VAL[i].PARAM_VALUE,
            })
          );
        }
      } catch (e) {
        throw e;
      }
    }
  });
};
