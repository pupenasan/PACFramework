# Клас PLC: програмований контролер в TIA для S7 1200/S7 1500

**CLSID=16#21xx**

## Загальний опис

Описані в [загальному описі функціональних вимог](../../cm/2_plcfn.md). 

## Рекомендації щодо використання в HMI

Немає особливих рекомендацій. Описані в [загальних рекомендаціях](../../cm/2_plcfn.md). 

## Функція PLCFN

Реалізований як функціональний блок. Посилання на файл експорту [тут]() 

### Реалізація інтерфейсу

- Реалізований стандартний інтерфейс означений в  [загальних вимогах до інтерфейсу](../../cm/2_plcfn.md)
- для збереження попередніх часових бітів використовується змінні Static екземпляру функціонального блоку, де зберігається:
  - `TMBITS_PREV`

### Реалізація програми блоку 

Посилання щодо особливості реалізації деяких частин під блоком коду:

```pascal
IF #PLC.STA.CMDACK THEN
   #PLC.CMD:=0;
END_IF;
#PLC.STA.CMDACK := (#PLC.CMD<>0 AND NOT #PLC.STA.CMDACK);
#PLC.STA.SCN1:="FirstScan";
IF #PLC.STA.SCN1 THEN (*при першому скані*)
    #PLC.ID:=1;             (*Ідентифікатор завжди 1*)
    #PLC.CLSID:=16#2100;    (*Клас завжди 16#2100*)
    #PLC.TQ:=0;
    #TMBITS_CUR:=0; "TMBITS_PREV":=0;
END_IF;

#PLC.STA_PERM.%X0 := #PLC.STA.CON2ERR;
#PLC.STA_PERM.%X1 := #PLC.STA.PLC2STOP;
#PLC.STA_PERM.%X2 := #PLC.STA.BLK;
#PLC.STA_PERM.%X3 := #PLC.STA.ALDIS;
#PLC.STA_PERM.%X4 := #PLC.STA.DIOON;
#PLC.STA_PERM.%X5 := #PLC.STA.DIOERR;
#PLC.STA_PERM.%X6 := #PLC.STA.b6;    
#PLC.STA_PERM.%X7 := #PLC.STA.FRC;
#PLC.STA_PERM.%X8 := #PLC.STA.SMLALL;
#PLC.STA_PERM.%X9 := #PLC.STA.DISP;
#PLC.STA_PERM.%X10 := #PLC.STA.FRC2;
#PLC.STA_PERM.%X11 := #PLC.STA.FRC1;
#PLC.STA_PERM.%X12 := #PLC.STA.SCN1;
#PLC.STA_PERM.%X13 := #PLC.STA.FRC0;
#PLC.STA_PERM.%X14 := #PLC.STA.SML;
#PLC.STA_PERM.%X15 := #PLC.STA.CMDACK;

#PLC.ALM1_PERM.%X0 := #PLC.ALM1.ALM;
#PLC.ALM1_PERM.%X1 := #PLC.ALM1.NWALM;
#PLC.ALM1_PERM.%X2 := #PLC.ALM1.ALMNACK;
#PLC.ALM1_PERM.%X3 := #PLC.ALM1.WRN;
#PLC.ALM1_PERM.%X4 := #PLC.ALM1.NWWRN;
#PLC.ALM1_PERM.%X5 := #PLC.ALM1.WRNNACK;
#PLC.ALM1_PERM.%X6 := #PLC.ALM1.BAD;
#PLC.ALM1_PERM.%X7 := #PLC.ALM1.NWBAD;
#PLC.ALM1_PERM.%X8 := #PLC.ALM1.BADNACK;
#PLC.ALM1_PERM.%X9 := #PLC.ALM1.EMCYSTP;
#PLC.ALM1_PERM.%X10 := #PLC.ALM1.STP2RUN;
#PLC.ALM1_PERM.%X11 := #PLC.ALM1.CON2ERR;
#PLC.ALM1_PERM.%X12 := #PLC.ALM1.PLC2STOP;
#PLC.ALM1_PERM.%X13 := #PLC.ALM1.DIOERR;
#PLC.ALM1_PERM.%X14 := #PLC.ALM1.PLCERR;
#PLC.ALM1_PERM.%X15 := #PLC.ALM1.CONHIERR;

(*--------------------------------- таймерні біти та лічильники*)
(*плинні значення*)
#TMBITS_CUR.%X0:="Clock_10Hz";         // 100MS 
#TMBITS_CUR.%X1:="Clock_5Hz";        // 200MS
#TMBITS_CUR.%X2:="Clock_2Hz";        // 500MS
#TMBITS_CUR.%X3:="Clock_1Hz";      // 1S
#TMBITS_CUR.%X7:=#PLC.NOW[0]>16#29; //min

(*відловлювання імпульсів необхідних часових періодів*)
#PLC.PLS.P100MS:=#TMBITS_CUR.%X0 AND NOT "TMBITS_PREV".%X0; (*100 мс *)   
#PLC.PLS.P200MS:=#TMBITS_CUR.%X1 AND NOT "TMBITS_PREV".%X1; (*200 мс*)
#PLC.PLS.P500MS:=#TMBITS_CUR.%X2 AND NOT "TMBITS_PREV".%X2; (*500 мс*)
#PLC.PLS.P1S :=#TMBITS_CUR.%X3 AND NOT "TMBITS_PREV".%X3; (*1 с*)
#PLC.PLS.P60S :=#TMBITS_CUR.%X7 AND NOT "TMBITS_PREV".%X7; (*1 хв*)
(*підрахунок кількості секунд і хвилин*)
IF #PLC.PLS.P1S THEN #PLC.TQ:=#PLC.TQ+1; END_IF;  (*загальний час з початку 1-го циклу контролера (в секундах)*)     
IF #PLC.TQ>16#7FFF_FFFF THEN #PLC.TQ:=16#7FFF_FFFF; END_IF;  
IF #PLC.PLS.P60S AND NOT #PLC.STA.SCN1 THEN #PLC.TQM:=#PLC.TQM+1; END_IF; (*загальний час роботи ПЛК з моменту пуску (в хвилинах)*)
IF #PLC.TQM>16#7FFF_FFFF THEN #PLC.TQM:=16#7FFF_FFFF; END_IF;  

(*розрахунок інших часових періодів*)
#PLC.PLS.P2S:=(#PLC.TQ MOD 2)=0 AND #PLC.PLS.P1S;(*2 с*)   
#PLC.PLS.P5S:=(#PLC.TQ MOD 5)=0 AND #PLC.PLS.P1S;(*5 с*)
#PLC.PLS.P10S:=(#PLC.TQ MOD 10)=0 AND #PLC.PLS.P1S;(*10 с*)

(* меандри *)
#PLC.PLS.M1S:= "Clock_1Hz";  (*меандр з періодом 1 с (0.5 с + 0.5 с)*)
#PLC.PLS.M2S:="Clock_0.5Hz";;(*меандр з періодом 2 с (1 с + 1 с) *)

(* астрономічний час *)
#RESULT  := RD_LOC_T(#NOW);
#PLC.NOW [0] :=INT_TO_BCD16 (#NOW.SECOND); //#NOW[0] seconds,-- (16#ss,--)
#PLC.NOW [1]:= SHL(IN:=INT_TO_BCD16(#NOW.HOUR), N:=8) OR INT_TO_BCD16(#NOW.MINUTE);//16#hhmm
#PLC.NOW [2]:= SHL(IN:=INT_TO_BCD16(#NOW.MONTH), N:=8) OR INT_TO_BCD16(#NOW.DAY);  //16#mmdd
#PLC.NOW [3]:= INT_TO_BCD16(#NOW.YEAR); //16#yyyy

(* початок години *)
#PLC.PLS.NEWHR:= (#PLC.NOW[1] AND 16#00FF)=0 (*хвилини*) AND #PLC.PLS.P60S (*один раз за хвилину*);

(* початок доби*)
#PLC.PLS.NEWDAY:= #PLC.NOW[1]=0 (*години_хвилини*) AND #PLC.PLS.P60S (*один раз за хвилину*);

(*початок зміни*)
IF #PLC.SHIFTPARA[0]<1 OR #PLC.SHIFTPARA[0]>3 THEN #PLC.SHIFTPARA[0]:=2;END_IF;(*коректність кількості змін*)
#PLC.PLS.NEWSHIFT:=FALSE; (*скидуємо біт початку зміни*)   
FOR #i:=1 TO #PLC.SHIFTPARA[0] DO
  (*хоча б одна з устоавок змін спрацювала*)
   #PLC.PLS.NEWSHIFT := #PLC.PLS.NEWSHIFT OR (#PLC.SHIFTPARA[#i]=#PLC.NOW[1] (*години хвилин*) AND #PLC.PLS.P60S (*один раз за хвилину*));  
END_FOR;

"TMBITS_PREV":=#TMBITS_CUR;(*збереження попередніх значень*)

(*----------- визначеня зміни*)
IF #PLC.SHIFTPARA[0]>3 OR #PLC.SHIFTPARA[0]<2 THEN #PLC.SHIFTPARA[0]:=3; END_IF;(*якщо кількість змін >3 або <1 - робимо 3*)
IF #PLC.NOW[1]>=#PLC.SHIFTPARA[1] AND (#PLC.NOW[1]<#PLC.SHIFTPARA[2]OR #PLC.SHIFTPARA[2]=16#0000) THEN (*1-ша зміна*)
    #PLC.SHIFTNMB:=1; 
ELSE (*2-га або 3-тя*)
    IF #PLC.SHIFTPARA[0]=2 THEN (*якщо в 2 зміни*)
        #PLC.SHIFTNMB:=2;    
    ELSE (*якщо 3 зміни*)
      IF #PLC.NOW[1]>=#PLC.SHIFTPARA[2] AND (#PLC.NOW[1]<#PLC.SHIFTPARA[3] OR #PLC.SHIFTPARA[3]=16#0000) THEN 
         #PLC.SHIFTNMB:=2;
      ELSE
         #PLC.SHIFTNMB:=3;
      END_IF;
    END_IF;
END_IF;
(*----------- *)

(*скидання статусів і тривог*)
#PLC.STA.BLK :=false; 
#PLC.STA.ALDIS :=false;
#PLC.STA.FRC :=false;
#PLC.STA.SMLALL :=false;
#PLC.STA.DISP :=false;
#PLC.STA.FRC2 :=false;
#PLC.STA.FRC1 :=false;
#PLC.STA.FRC0 :=false;
#PLC.STA.SML :=false;

#PLC.ALM1.ALM :=0;
#PLC.ALM1.NWALM :=0;
#PLC.ALM1.ALMNACK :=0;
#PLC.ALM1.WRN :=0;
#PLC.ALM1.NWWRN :=0;
#PLC.ALM1.WRNNACK :=0;
#PLC.ALM1.BAD :=0;
#PLC.ALM1.NWBAD :=0;
#PLC.ALM1.BADNACK :=0;
#PLC.ALM1.EMCYSTP :=0;
#PLC.ALM1.STP2RUN :=0;
#PLC.ALM1.CON2ERR :=0;
#PLC.ALM1.PLC2STOP :=0;
#PLC.ALM1.DIOERR :=0;
#PLC.ALM1.PLCERR :=0;
#PLC.ALM1.CONHIERR :=0;

(*скидання лічильників*)
#PLC.CNTALM :=0;
#PLC.CNTWRN :=0;
#PLC.CNTBAD :=0;
#PLC.CNTFRC :=0;
#PLC.CNTMAN :=0;
```

- [For S7-1200/S7-1500, how do you measure the runtime of the complete program, subprograms or specific organization blocks?](https://support.industry.siemens.com/cs/document/87668055/for-s7-1200-s7-1500-how-do-you-measure-the-runtime-of-the-complete-program-subprograms-or-specific-organization-blocks-?dti=0&lc=en-CH)

### Вимоги щодо використання

- `System and Clock Memory` в конфігурації CPU повинні бути активовані
- Функціональний блок має викликатися у першій секції, наприклад в Main: 

## Структура та змінна PLC_CFG

- структура співпадає з загальною, прописаною в [загальному описі](../../cm/2_plcfn.md)
- експортний варіант типу `PLC_CFG` [тут]()  
- біти в `PLC_STA`, `PLS` і `PLC_ALM1` представлені для зручності через структури з відплвідною назвою
- змінна типу `PLC_CFG` є частиною DB `SYS` (DB1)

## Тестування PLC_FN

Перелік тестів та загальний опис їх проведення наведений в [розділі тестування PLCFN](../../cm/2_plcfn.md). 

- створити DB `TESTDB`

### 1 Тест першого скану

[розділі тестування PLCFN](../../cm/2_plcfn.md#1_Тест_першого_скану)

```pascal
"TESTDB".TST_CCLS := "TESTDB".TST_CCLS + 1;
"PLCFN"("SYS".PLC);
IF "SYS".PLC.STA.SCN1 THEN
   "TESTDB".TST_SCN1CLC := "TESTDB".TST_SCN1CLC + 1;
   "TESTDB".TST_NBCLC := "TESTDB".TST_CCLS;
END_IF;
```



### 2 Тест астрономічного часу



### 3 Тест лічильників роботи ПЛК: загальний і зі старту



### 4 Тест бітових імпульсів



```pascal
PLCFN(PLC);
if TST_PLSON then
  if PLC.P100MS then TST_P100MS := TST_P100MS+1; end_if; 
  if PLC.P200MS then TST_P200MS := TST_P200MS +1; end_if;
  if PLC.P500MS then TST_P500MS := TST_P500MS +1; end_if;
  if PLC.P1S then TST_P1S := TST_P1S +1; end_if;
  if PLC.P2S then TST_P2S := TST_P2S +1; end_if;
  if PLC.P5S then TST_P5S := TST_P5S + 1; end_if;
  if PLC.P10S then TST_P10S := TST_P10S + 1; end_if;
  if PLC.P60S then TST_P60S := TST_P60S + 1; end_if;
  if PLC.TQ-TEST_TQPREV>=121 then 
     TST_PLSON:=false;
  end_if; 
else 
  TEST_TQPREV := PLC.TQ;
end_if;
```



### 5 Тест бітових меандрів

сс

### 6 Тест імпульсів початку години та доби



### 7 Тест скидування бітів статусів та лічильників тривог і статусів

