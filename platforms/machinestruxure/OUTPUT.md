# OUTPUT: в Codesys 3.5 (Machine Expert Shneider Electric

### Інтерфейс блоку 

```pascal
FUNCTION OUTPUT : BOOL
VAR_INPUT
END_VAR
VAR
	temp_bool: BOOL;
	temp_int: int;
	i: int;
END_VAR

```



### Реалізація програми блоку 

```pascal
CHDOFN(RAW=>temp_bool, CHCFG:=SYS.CHDO[0], CHHMI:=CH.CHDO[0]);
CHAOFN(RAWINT=>temp_int, CHCFG:=SYS.CHAO[0], CHHMI:=CH.CHAO[0]);

FOR i := 1 TO SYS.PLCCFG.DOCNT DO
    CHDOFN(RAW=>IO.DQ[i], CHCFG:=SYS.CHDO[i], CHHMI:=CH.CHDO[i]);
END_FOR;

FOR i := 1 TO SYS.PLCCFG.AOCNT DO
    CHAOFN(RAWINT=>IO.AQ[i], CHCFG:=SYS.CHAO[i], CHHMI:=CH.CHAO[i]);
END_FOR;

```



