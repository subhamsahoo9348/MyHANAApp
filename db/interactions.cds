namespace app.interactions;

using {Country} from '@sap/cds/common';

entity Interactions_Header {
  key ID        : Integer;
      ITEMS     : String;
      PARTNER   : String;
      LOG_DATE  : String;
      BPCOUNTRY : String(40);
}

entity Interactions_Items {
  key INTHeader : String;
  key TEXT_ID   : Integer;
      LANGU     : String(2);
      LOGTEXT   : String;
}

entity Employee {
  key ID       : Integer;
      NAME     : String(100) not null;
      NUMBER   : String(100);
      DEPT     : String(100);
      PASSWORD : String(100);
}

entity PDFStore {
  key NAME : String;
      URL  : LargeString;
}

entity CP_STAT_METHOD {

  key METHOD      : String(50);
      METHOD_DESC : String(200);

}


entity CP_STAT_METHOD_VAL {

  key METHOD        : String(50);
  key PARAM         : String(50);
      PARAM_DESC    : String(200);
      DATATYPE      : String;
      POSITION      : Integer;
      DEFAULT_VALUE : String;

}


entity CP_STAT_PROFILE {

  key PROFILE      : String(50);
      PRF_DESC     : String(200);
      METHOD       : String(50);
      CREATED_DATE : Date;
      CREATED_BY   : String(12);

}


entity CP_STAT_PROFILE_VAL {

  key PROFILE     : String(50);
  key PARAM       : String(50);
      PARAM_VALUE : String(1000);


}

entity UNIQUE_ID_HEADER {
  UNIQUE_ID   : Integer;
  PRODUCT_ID  : String;
  UNIQUE_DESC : String;
  UID_TYPE    : String;
  ACTIVE      : Boolean;

}

entity UNIQUE_ID_ITEM {
  UNIQUE_ID       : Integer;
  PRODUCT         : String;
  CHAR_NUM        : String;
  CHAR_NUM_VAL    : String;
  CHAR_VALNUMDESC : String;
}

entity CHARVAL_NUM {
  CHAR_NUM        : String;
  CHAR_NUM_VAL    : String;
  CHARVAL_NUM     : String;
  CHAR_VALNUMDESC : String;
}

entity SEED_ORDER {
  key SEEDORDER           : String;
      PRODUCT             : String;
      UNIQUE_ID           : String;
      ORDER_QUANTITY      : Integer;
      MATERIAL_AVAIL_DATE : String;
      CREADTED_DATE       : String;
      CREATED_BY          : String;
}

type BusinessKey : String(10);
type LText       : String(1024);
type SDate       : DateTime;

entity Entity1 {
  key ID : UUID
      @Core.Computed;
}
