# Клас CHDO (дискретний вихідний канал)

**CLSID=16#002x**

## Загальний опис

Реалізує функцію роботи з фізичним дискретним входом на локальному ПЛК або розподіленому засобі вводу/виводу.

Структура змінних CH_CFG та CH_HMI наведена в [структурі класів ](2_lvl0.md)

## Функція CHDOFN

### Функціональні вимоги 

Загальні функціональні вимоги описані у вимогах до [класів LVL0 ](2_lvl0.md)

### Вимоги щодо реалізації інтерфейсу

Вимоги описані щодо реалізації інтерфейсу описані у вимогах до [класів LVL0 ](2_lvl0.md)

### Вимоги щодо реалізації програми користувача

Приклад TIA portal

```pascal
#STA := #CHCFG.STA;
#CMD := #CHCFG.CMD;
(*розпаковка з STA*)
#VRAW := #STA.VRAW;
#VAL := #STA.VAL;
#BAD := #STA.BAD;(*керується ззовні*)
#PNG := #STA.PNG;
#ULNK := #STA.ULNK;
#MERR := #STA.MERR;(*керується ззовні*)
#BRK := #STA.BRK;(*керується ззовні*)
#SHRT := #STA.SHRT;(*керується ззовні*)
#NBD := #STA.NBD;(*керується ззовні*)
#INBUF := #STA.INBUF;
#FRC := #STA.FRC;
#SML := #STA.SML;
#CMDLOAD := #STA.CMDLOAD; (*керується бітом*)

#INBUF := (#CHCFG.ID = "BUF".CHBUF.ID) AND (#CHCFG.CLSID = "BUF".CHBUF.CLSID);
#CMDLOAD := #CHHMI.STA.%X15;
#CMD := 0;

(* обробник команд*)
(* широкомовне форсування/дефорсування*) 
IF "SYS".PLCCFG.CMD=16#4301 THEN
    #FRC := true; (*форсувати один/усі об'єкти типу*)
END_IF;
IF "SYS".PLCCFG.CMD=16#4302 THEN
    #FRC := false; (*дефорсувати об'єкт типу*)
END_IF;
(*вибір джерела команди згідно пріоритету*)
IF #CMDLOAD THEN (*з HMI CMDLOAD*)
    #CMD := 16#0100;  // записати в буфер
ELSIF #INBUF AND "BUF".CHBUF.CMD <> 0 THEN (*з буферу*)
    #CMD := "BUF".CHBUF.CMD;
ELSIF #CHCFG.CMD<>0 THEN
    #CMD := #CHCFG.CMD;
END_IF;
(*commands*)
CASE #CMD OF
    16#1: (*записати 1*)
        IF #FRC AND #INBUF THEN
            "BUF".CHBUF.VAL := 1;
        END_IF;
    16#2: (*записати 0*)
        IF #FRC AND #INBUF THEN
            "BUF".CHBUF.VAL:=0;
        END_IF;
    16#3: (*TOGGLE*)
        IF #FRC AND #INBUF THEN
            IF #VRAW THEN
                "BUF".CHBUF.VAL:=0;
            ELSE
                "BUF".CHBUF.VAL:=1;
            END_IF;
        END_IF;
    16#0100: (*прочитати конфігурацію в буфер*)
        "BUF".CHBUF.ID:= #CHCFG.ID;
        "BUF".CHBUF.CLSID:=#CHCFG.CLSID;
        
        "BUF".CHBUF.STA.%X0 := #CHCFG.STA.VRAW;
        "BUF".CHBUF.STA.%X1 := #CHCFG.STA.VAL;
        "BUF".CHBUF.STA.%X2 := #CHCFG.STA.BAD;
        "BUF".CHBUF.STA.%X3 := #CHCFG.STA.b3;
        "BUF".CHBUF.STA.%X4 := #CHCFG.STA.PNG;
        "BUF".CHBUF.STA.%X5 := #CHCFG.STA.ULNK;
        "BUF".CHBUF.STA.%X6 := #CHCFG.STA.MERR;
        "BUF".CHBUF.STA.%X7 := #CHCFG.STA.BRK;
        "BUF".CHBUF.STA.%X8 := #CHCFG.STA.SHRT;
        "BUF".CHBUF.STA.%X9 := #CHCFG.STA.NBD;
        "BUF".CHBUF.STA.%X10 := #CHCFG.STA.b10;
        "BUF".CHBUF.STA.%X11 := #CHCFG.STA.b11;
        "BUF".CHBUF.STA.%X12 := #CHCFG.STA.INBUF;
        "BUF".CHBUF.STA.%X13 := #CHCFG.STA.FRC;
        "BUF".CHBUF.STA.%X14 := #CHCFG.STA.SML;
        "BUF".CHBUF.STA.%X15 := #CHCFG.STA.CMDLOAD;
        
        "BUF".CHBUF.VAL:=#CHCFG.VAL;
        "BUF".CHBUF.VARID:=#CHCFG.VARID;
    16#0300: (*перемкнути форсування*)
        #FRC := NOT #FRC;
    16#301: (*форсувати один/усі об'єкти типу*)
        #FRC := true;
    16#302: (*дефорсувати один/усі об'єкти типу*)
        #FRC := false;
END_CASE;

(*запис значення змінної*)
IF #FRC AND #INBUF THEN (*режим форсування з занятим буфером*)
    #CHCFG.VAL := BOOL_TO_INT ("BUF".CHBUF.VAL>0);
    #VRAW := #CHCFG.VAL > 0.5;
ELSIF #FRC AND NOT #INBUF THEN (*режим форсування без занятого буферу*)
    ;(*без змін*)
ELSIF NOT #FRC THEN (*не режим форсування*)
    #VRAW := #VAL;
    IF #VAL THEN
        #CHCFG.VAL := 1;
    ELSE
        #CHCFG.VAL := 0;
    END_IF;
END_IF;
#RAW := #VRAW; (*відправляємо на вихід*)

(*ping-pong*)
#ULNK := #PNG; (*прийшов ping - є звязок з верхнім рівнем*)
#PNG := false; (*скидання біту PNG звязку з врехнім рівнем PONG*)
IF NOT #ULNK THEN
    #CHCFG.VARID := 0;
END_IF;

(*скидання оброблених команд*)
#CMDLOAD := 0;
#CMD := 0;


(*загальносистемні біти та лічильники*)
IF #FRC THEN
    "SYS".PLCCFG.STA.FRC0 := true;
    "SYS".PLCCFG.CNTFRC := "SYS".PLCCFG.CNTFRC + 1;
END_IF; 

(*упковка в STA*)
#STA.VRAW := #VRAW;
#STA.VAL := #VAL;
#STA.BAD:=#BAD;(*керується ззовні*)
#STA.PNG:=#PNG;
#STA.ULNK:=#ULNK;
#STA.MERR:=#MERR;(*керується ззовні*)
#STA.BRK:=#BRK;(*керується ззовні*)
#STA.SHRT:=#SHRT;(*керується ззовні*)
#STA.NBD:=#NBD;(*керується ззовні*)
#STA.INBUF := #INBUF;
#STA.FRC := #FRC;
#STA.SML := #SML;
#STA.CMDLOAD := #CMDLOAD; (*керується бітом*)

#CHCFG.STA := #STA;
#CHCFG.CMD := #CMD;

(*упаковка в INT*)
#STAINT.%X0 := #VRAW;
#STAINT.%X1 := #VAL;
#STAINT.%X2 := #BAD;
//#STAINT.%X3 := #b3;
#STAINT.%X4 := #PNG;
#STAINT.%X5 := #ULNK;
#STAINT.%X6 := #MERR;
#STAINT.%X7 := #BRK;
#STAINT.%X8 := #SHRT;
#STAINT.%X9 := #NBD;
//#STAINT.%X10 := #STA.b10;
//#STAINT.%X11 := #STA.b11;
#STAINT.%X12 := #INBUF;
#STAINT.%X13 := #FRC;
#STAINT.%X14 := #SML;
#STAINT.%X15 := FALSE;

#CHHMI.STA := #STAINT;
#CHHMI.VAL := #CHCFG.VAL;

(*оновлення буферу*)
IF #INBUF THEN
    "BUF".CHBUF.STA:= #STAINT;
    "BUF".CHBUF.VARID := #CHCFG.VARID;
    "BUF".CHBUF.CMD := 0;
    IF NOT #FRC THEN
        "BUF".CHBUF.VAL := #CHCFG.VAL;
    END_IF;
END_IF;
```



### Вимоги щодо використання

Вкористовуються перед викликом VAR. 

## Тестування CHDOFN

Цей пункт описує методику перевірки особливих функцій CHDOFN. Інші тести описані в  [описі класу LVL0 ](2_lvl0.md)

### Перелік тестів

Перелік наведений  [в описі класу LVL0 ](2_lvl0.md)

### 3 Робота в нефорсованому режимі

Перевірка значень повинно проходити як для CH_HMI, CH_CFG так і  CH_BUF

| Номер кроку | Дія для перевірки                   | Очікуваний результат                                         | Примітки |
| ----------- | ----------------------------------- | ------------------------------------------------------------ | -------- |
| 1           | прив'язати тестову змінну до буферу | у CHBUF повинно завантажитися весь зміст CH_CFG              |          |
| 2           | змінити значення змінної `STA.VAL`  | для CH_HMI, CH_CFG та CH_BUF повинне змінитися: плинне значення змінної `STA.VAL`,  значення сирої змінної `STA.VRAW`, значення `VAL`, значення виходу функції `RAW` |          |
| 3           | повторити п.2 з іншим значенням     |                                                              |          |

### 4 Робота в режимі форсування

Перевірка значень повинно проходити як для CH_HMI, CH_CFG так і  CH_BUF

| Номер кроку | Дія для перевірки                                            | Очікуваний результат                                         | Примітки |
| ----------- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| 1           | прив'язати тестову змінну до буферу                          | у CHBUF повинно завантажитися весь зміст CH_CFG              |          |
| 2           | змінити значення змінної `STA.VAL`=0                         | плинне значення змінної `STA.VAL`,  значення сирої змінної `STA.VRAW`, значення `VAL`, вихід `RAW` |          |
| 3           | відправити команду форсування CHBUF.CMD=16#301               | біт FRC повинен дорівнювати 1                                |          |
| 4           | змінити значення величини`STA.VAL` на 1                      | `STA.VRAW=0` (без змін)<br /> `VAL=0` (без змін)<br />`RAW=0` (без змін) |          |
| 5           | відправити команду 16#1 (записати 1)                         | `STA.VRAW=1` <br /> `VAL=1` <br />`RAW=1`                    |          |
| 6           | відправити команду 16#2 (записати 0)                         | `STA.VRAW=0` <br /> `VAL=0` <br />`RAW=0`                    |          |
| 7           | відправити команду 16#3 (TOGGLE)                             | `STA.VRAW=1` (протилежне)<br /> `VAL=1` (протилежне)<br />`RAW=1` (протилежне) |          |
| 8           | змінити значення CHBUF.VAL                                   | `STA.VRAW=CHBUF.VAL>0` <br /> `VAL=CHBUF.VAL>0` <br />`RAW=CHBUF.VAL>0` |          |
| 9           | відправити команду дефорсування CHBUF.CMD=16#302             | біт FRC повинен дорівнювати 0                                |          |
| 10          | відправити команду перемикання форсування 16#0300, повторити кілька разів, залишити в режимі форсування | біт FRC повинен перемкнутися на протилежне                   |          |
| 11          | перевести в режим форсування кілька змінних                  | біт FRC відповідних змінних повинен дорівнювати 1            |          |
| 12          | перевірити значення змінних PLC.STA_PERM і PLC.CNTFRC_PERM   | повинні PLC.STA_PERM.X13=1,  PLC.CNTFRC_PERM дорівнювати кількості зафорсованих змінних |          |
| 13          | зняти з режиму форсування усі змінні                         | повинні PLC.STA_PERM.X13=0,  PLC.CNTFRC_PERM=0               |          |

