```pascal
FUNCTION RECIPE_REC_ARCHIVE : int
VAR_IN_OUT
	MYID: int;
END_VAR
VAR
	i: int;
END_VAR

GVL.CTRLRECIPE_REPORTS[MYID].STOPDATE := GVL.PLC.NOW;
FOR i:=99 TO 1 BY -1 DO
	GVL.CTRLRECIPE_REPORTS_ARCH[i] := GVL.CTRLRECIPE_REPORTS_ARCH[i-1];
END_FOR;
GVL.CTRLRECIPE_REPORTS_ARCH[0]:= GVL.CTRLRECIPE_REPORTS[MYID];
```