# Клас CHDO: в Codesys 3.5 (Machine Expert Shneider Electric)

**CLSID=16#002x**

## Загальний опис

Версія Codesys - 3.5.

Версія Machine Expert - 1.2.

### Інтерфейс блоку 

```pascal
FUNCTION CHDOFN : BOOL
VAR_OUTPUT
	RAW:	BOOL;
END_VAR
VAR_IN_OUT
	CHCFG:	CHCFG;
	CHHMI:	CHHMI;
END_VAR
VAR
STA:	CHSTA;
STAINT:	INT;
CMD:	INT;
INBUF:	BOOL;
ULNK:	BOOL;
MERR:	BOOL;
BRK:	BOOL;
SHRT:	BOOL;
SML:	BOOL;
FRC:	BOOL;
BAD:	BOOL;
VRAW:	BOOL;
VAL:	BOOL;
PNG:	BOOL;
NBD:	BOOL;
CMDLOAD:	BOOL;

END_VAR

```



### Реалізація програми блоку 

```pascal
		STA := CHCFG.STA;
CMD := CHCFG.CMD;
(*розпаковка з STA*)
VRAW := STA.VRAW;
VAL := STA.VAL;
BAD := STA.BAD;(*керується ззовні*)
PNG := STA.PNG;
ULNK := STA.ULNK;
MERR := STA.MERR;(*керується ззовні*)
BRK := STA.BRK;(*керується ззовні*)
SHRT := STA.SHRT;(*керується ззовні*)
NBD := STA.NBD;(*керується ззовні*)
INBUF := STA.INBUF;
FRC := STA.FRC;
SML := STA.SML;
CMDLOAD := STA.CMDLOAD; (*керується бітом*)

INBUF := (CHCFG.ID = BUF.CHBUF.ID) AND (CHCFG.CLSID = BUF.CHBUF.CLSID);
CMDLOAD := CHHMI.STA.15;
CMD := 0;

(* обробник команд*)
(* широкомовне форсування/дефорсування*) 
IF SYS.PLCCFG.CMD = 16#4301 THEN
    FRC := true; (*форсувати один/усі об'єкти типу*)
END_IF;
IF SYS.PLCCFG.CMD = 16#4302 THEN
    FRC := false; (*дефорсувати об'єкт типу*)
END_IF;
(*вибір джерела команди згідно пріоритету*)
IF CMDLOAD THEN (*з HMI CMDLOAD*)
    CMD := 16#0100;  // записати в буфер
ELSIF INBUF AND BUF.CHBUF.CMD <> 0 THEN (*з буферу*)
    CMD := BUF.CHBUF.CMD;
ELSIF CHCFG.CMD <> 0 THEN
    CMD := CHCFG.CMD;
END_IF;
(*commands*)
CASE CMD OF
    16#1: (*записати 1*)
        IF FRC AND INBUF THEN
            BUF.CHBUF.VAL := 1;
        END_IF;
    16#2: (*записати 0*)
        IF FRC AND INBUF THEN
            BUF.CHBUF.VAL := 0;
        END_IF;
    16#3: (*TOGGLE*)
        IF FRC AND INBUF THEN
            IF VRAW THEN
                BUF.CHBUF.VAL := 0;
            ELSE
                BUF.CHBUF.VAL := 1;
            END_IF;
        END_IF;
    16#0100: (*прочитати конфігурацію в буфер*)
        BUF.CHBUF.ID := CHCFG.ID;
        BUF.CHBUF.CLSID := CHCFG.CLSID;
        
        BUF.CHBUF.STA.0 := CHCFG.STA.VRAW;
        BUF.CHBUF.STA.1 := CHCFG.STA.VAL;
        BUF.CHBUF.STA.2 := CHCFG.STA.BAD;
        BUF.CHBUF.STA.3 := CHCFG.STA.b3;
        BUF.CHBUF.STA.4 := CHCFG.STA.PNG;
        BUF.CHBUF.STA.5 := CHCFG.STA.ULNK;
        BUF.CHBUF.STA.6 := CHCFG.STA.MERR;
        BUF.CHBUF.STA.7 := CHCFG.STA.BRK;
        BUF.CHBUF.STA.8 := CHCFG.STA.SHRT;
        BUF.CHBUF.STA.9 := CHCFG.STA.NBD;
        BUF.CHBUF.STA.10 := CHCFG.STA.b10;
        BUF.CHBUF.STA.11 := CHCFG.STA.b11;
        BUF.CHBUF.STA.12 := CHCFG.STA.INBUF;
        BUF.CHBUF.STA.13 := CHCFG.STA.FRC;
        BUF.CHBUF.STA.14 := CHCFG.STA.SML;
        BUF.CHBUF.STA.15 := CHCFG.STA.CMDLOAD;
        
        BUF.CHBUF.VAL := CHCFG.VAL;
        BUF.CHBUF.VARID := CHCFG.VARID;
    16#0300: (*перемкнути форсування*)
        FRC := NOT FRC;
    16#0301: (*форсувати один/усі об'єкти типу*)
        FRC := true;
    16#0302: (*дефорсувати один/усі об'єкти типу*)
        FRC := false;
END_CASE;

(*запис значення змінної*)
IF FRC AND INBUF THEN (*режим форсування з занятим буфером*)
    CHCFG.VAL := BOOL_TO_INT(BUF.CHBUF.VAL > 0);
    VRAW := CHCFG.VAL > 0.5;
ELSIF FRC AND NOT INBUF THEN (*режим форсування без занятого буферу*)
    ;(*без змін*)
ELSIF NOT FRC THEN (*не режим форсування*)
    VRAW := VAL;
    IF VAL THEN
        CHCFG.VAL := 1;
    ELSE
        CHCFG.VAL := 0;
    END_IF;
END_IF;
RAW := VRAW; (*відправляємо на вихід*)

(*ping-pong*)
ULNK := PNG; (*прийшов ping - є звязок з верхнім рівнем*)
PNG := false; (*скидання біту PNG звязку з врехнім рівнем PONG*)
IF NOT ULNK THEN
    CHCFG.VARID := 0;
END_IF;

(*скидання оброблених команд*)
CMDLOAD := 0;
CMD := 0;


(*загальносистемні біти та лічильники*)
IF FRC THEN
    SYS.PLCCFG.STA.FRC0 := true;
    SYS.PLCCFG.CNTFRC := SYS.PLCCFG.CNTFRC + 1;
END_IF;

(*упковка в STA*)
STA.VRAW := VRAW;
STA.VAL := VAL;
STA.BAD := BAD;(*керується ззовні*)
STA.PNG := PNG;
STA.ULNK := ULNK;
STA.MERR := MERR;(*керується ззовні*)
STA.BRK := BRK;(*керується ззовні*)
STA.SHRT := SHRT;(*керується ззовні*)
STA.NBD := NBD;(*керується ззовні*)
STA.INBUF := INBUF;
STA.FRC := FRC;
STA.SML := SML;
STA.CMDLOAD := CMDLOAD; (*керується бітом*)

CHCFG.STA := STA;
CHCFG.CMD := CMD;

(*упаковка в INT*)
STAINT.0 := VRAW;
STAINT.1 := VAL;
STAINT.2 := BAD;
//STAINT.3 := b3;
STAINT.4 := PNG;
STAINT.5 := ULNK;
STAINT.6 := MERR;
STAINT.7 := BRK;
STAINT.8 := SHRT;
STAINT.9 := NBD;
//STAINT.10 := STA.b10;
//STAINT.11 := STA.b11;
STAINT.12 := INBUF;
STAINT.13 := FRC;
STAINT.14 := SML;
STAINT.15 := FALSE;

CHHMI.STA := STAINT;
CHHMI.VAL := CHCFG.VAL;

(*оновлення буферу*)
IF INBUF THEN
    BUF.CHBUF.STA := STAINT;
    BUF.CHBUF.VARID := CHCFG.VARID;
    BUF.CHBUF.CMD := 0;
    IF NOT FRC THEN
        BUF.CHBUF.VAL := CHCFG.VAL;
    END_IF;
END_IF;
```



