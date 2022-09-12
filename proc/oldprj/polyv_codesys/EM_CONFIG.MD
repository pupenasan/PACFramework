``` pascal
TYPE EM_CONFIG :
STRUCT
	ID: UINT; //
	CLSID: UINT; //
	STA: INT; //
	CMD: INT; //
	PRM: UINT;
	PRM2: UINT; 
	STEP1: INT; //
	TSTEP1: INT; //
	BATCHID1: UDINT; //
	BATCHID2: UDINT; //
	RECIPEID: UINT; //номер рецептурного об'єкту (Recipy Entyty) що займає даний EM 
END_STRUCT
END_TYPE
```