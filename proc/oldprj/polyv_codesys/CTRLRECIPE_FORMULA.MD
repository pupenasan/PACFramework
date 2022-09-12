```pascal
TYPE CTRLRECIPE_FORMULA :
STRUCT
	GRN_NMB: INT; //номер поливочної машини 1-12
	GRN_PARA: PHASE_PARA_GRN; //параметри поливу
	FERT_NMB: INT;//0 (без фертигації),1 (DS3),2 (DS4)
	FERT_TYPE: FERT_TYPE;
	FERT_PARA: PHASEPARA_FERT;	
END_STRUCT
END_TYPE
```