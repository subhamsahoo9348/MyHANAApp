using app.interactions from '../db/interactions';

service CatalogService {

   entity Interactions_Header as projection on interactions.Interactions_Header;
   entity Interactions_Items  as projection on interactions.Interactions_Items;
   entity Employee            as projection on interactions.Employee;
   entity CP_STAT_METHOD      as projection on interactions.CP_STAT_METHOD;
   entity CP_STAT_METHOD_VAL  as projection on interactions.CP_STAT_METHOD_VAL;
   entity CP_STAT_PROFILE     as projection on interactions.CP_STAT_PROFILE;
   entity CP_STAT_PROFILE_VAL as projection on interactions.CP_STAT_PROFILE_VAL;
   entity UNIQUE_ID_HEADER    as projection on interactions.UNIQUE_ID_HEADER;
   entity UNIQUE_ID_ITEM      as projection on interactions.UNIQUE_ID_ITEM;
   entity CHARVAL_NUM         as projection on interactions.CHARVAL_NUM;
   entity SEED_ORDER          as projection on interactions.SEED_ORDER;
   entity PDFStore            as projection on interactions.PDFStore;
   function crud1(FLAG : String, ID : Integer, NAME : String, NUMBER : String, DEPT : String, PASSWORD : String)                                                            returns String;
   function savepdf(FLAG : String, NAME : String, URL : String)                                                                                                             returns String;
   function save(FLAG : String, OBJ : String)                                                                                                                               returns String;
   function crud(FLAG : String, PRODUCT_ID : String, UNIQUE_DESC : String, UID_TYPE : String, ACTIVE : Boolean, VALUE : String, UNIQUE_ID : String)                         returns String;
   function order(FLAG : String, PRODUCT : String, UNIQUE_ID : String, ORDER_QUANTITY : Integer, MATERIAL_AVAIL_DATE : String, CREADTED_DATE : String, CREATED_BY : String) returns String;
}
