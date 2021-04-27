# INPUT: в Codesys 3.5 (Machine Expert Shneider Electric)

### Інтерфейс блоку 

```pascal
FUNCTION INPUT : BOOL
VAR_INPUT
END_VAR
VAR
	I: INT;
END_VAR

```



### Реалізація програми блоку 



```pascal
CHDIFN (RAW:=0, CHCFG:=SYS.CHDI[0], CHHMI:=CH.CHDI[0]);
CHAIFN (RAWINT:=0, CHCFG:=SYS.CHAI[0], CHHMI:=CH.CHAI[0]);

FOR i := 1 TO SYS.PLCCFG.DICNT DO
    CHDIFN (RAW:=IO.DI[I], CHCFG:=SYS.CHDI[i], CHHMI:=CH.CHDI[i]);
END_FOR;

FOR i := 1 TO SYS.PLCCFG.AICNT DO
    CHAIFN(RAWINT:=IO.AI[I], CHCFG:=SYS.CHAI[i], CHHMI:=CH.CHAI[i]);
END_FOR;
```



