# Клас PLC: програмований контролер в Codesys 3.5 (Machine Expert Shneider Electric)

**CLSID=16#21xx**

## Загальний опис

Описані в [загальному описі функціональних вимог](../../cm/2_plcfn.md). 

Версія Codesys - 3.5.

Версія Machine Expert - 1.2.

## Рекомендації щодо використання в HMI

Немає особливих рекомендацій. Описані в [загальних рекомендаціях](../../cm/2_plcfn.md). 

## Функція PLCFN

Реалізований як функціональний блок. Посилання на файл експорту [тут](PLCFN.scl) 

### Реалізація інтерфейсу

- Реалізований стандартний інтерфейс означений в  [загальних вимогах до інтерфейсу](../../cm/2_plcfn.md)
- для збереження попередніх часових бітів використовується змінні `Static` екземпляру функціонального блоку, де зберігається:
  - `TMBITS_PREV`
  - `MEM_RT`

### Реалізація біту FirstScan

В Codesys біту відслідковування першого скану немає, а використання біту в Machine Expert залежить від типу контролера і не працює в симуляції.  

- для реалізації даної функції додатково використовується змінні `Static` екземпляру функціонального блоку, де зберігається:
  - `FirstScan`
  - `NextScan`

### Реалізація бітових міандрів

В Codesys бітових міандрів немає, а використання бітів в Machine Expert залежить від типу контролера і не працює в симуляції. Для їх реалізації використовується функціональний блок  `BLINK` , який генерує імпульси вказаної тривалості, та викликається всередині функції `PLCFN`. 

Для коректрої роботи бітових міандрів необхідно виставити тип задачі, де буде опитуватись дана функція  `Freewheeling`

- для реалізації даної функції додатково використовується змінні `Static` екземпляру функціонального блоку, які формують відповідні бітові міандри:
  - `Clock_10Hz`
  - `Clock_5Hz`
  - `Clock_2Hz`
  - `Clock_1Hz`

### Реалізація зчитування системного часу

Для зчитування системного часу необідно додатково підключити бібліотуку `SysTimeRTC`. 

Для відображення локального часу додано зміщення `LocalTime_ofset`. по замовченню налаштовано на +2 години.

### Реалізація зчитування часу циклу

Для зчитування часу циклу необідно підключити бібліотуку `CmpIecTask`. 



### Інтерфейс блоку 

```pascal
FUNCTION_BLOCK PLCFN
   VAR_IN_OUT 
      PLC : PLC_CFG;
   END_VAR
VAR_STAT
      TMBITS_PREV : Int;   // попереднє значення таймерних меандрів
      MEM_RT : LREAL;   // память для вимірювання часу циклу
	  FirstScan : BOOL ;
	  NextScan : BOOL;
	  Clock_10Hz: BOOL;
      Clock_5Hz: BOOL;
      Clock_2Hz: BOOL;
      Clock_1Hz: BOOL;
	  Clock_0_5Hz: BOOL;
	  BLINK_10Hz: BLINK;
	  BLINK_5Hz: BLINK;
	  BLINK_2Hz: BLINK;
	  BLINK_1Hz: BLINK;
	  BLINK_0_5Hz: BLINK;
	  iecResult  :    RTS_IEC_RESULT;
	  pIecInfo   :    POINTER TO CmpIecTask.Task_Info2;
	  LocalTime_ofset:INT:=2;
	  nowDT:dword;
END_VAR

VAR_TEMP 
      TMBITS_CUR : Int;
      i : INT;
	  NOW: SYSTIMEDATE;
END_VAR
```



### Реалізація програми блоку 

Посилання щодо особливості реалізації деяких частин під блоком коду:

```pascal
	IF PLC.STA.CMDACK THEN
	    PLC.CMD := 0;
	END_IF;
	PLC.STA.CMDACK := (PLC.CMD <> 0 AND NOT PLC.STA.CMDACK);
	
	(*--------------------------------- Визначення біту першого скану*)
	
	IF NOT FirstScan AND NOT NextScan THEN
		FirstScan := TRUE;
		NextScan:=TRUE;
	ELSE
		FirstScan := FALSE;
	END_IF
	
	PLC.STA.SCN1 := FirstScan;
	IF PLC.STA.SCN1 THEN (*при першому скані*)
	    PLC.ID := 1;             (*Ідентифікатор завжди 1*)
	    PLC.CLSID := 16#2100;    (*Клас завжди 162100*)
	    PLC.TQ := 0;
	    TMBITS_CUR := 0;
	    TMBITS_PREV := 0;
	END_IF;
	
	PLC.STA_PERM.0 := PLC.STA.CON2ERR;
	PLC.STA_PERM.1 := PLC.STA.PLC2STOP;
	PLC.STA_PERM.2 := PLC.STA.BLK;
	PLC.STA_PERM.3 := PLC.STA.ALDIS;
	PLC.STA_PERM.4 := PLC.STA.DIOON;
	PLC.STA_PERM.5 := PLC.STA.DIOERR;
	PLC.STA_PERM.6 := PLC.STA.b6;
	PLC.STA_PERM.7 := PLC.STA.FRC;
	PLC.STA_PERM.8 := PLC.STA.SMLALL;
	PLC.STA_PERM.9 := PLC.STA.DISP;
	PLC.STA_PERM.10 := PLC.STA.FRC2;
	PLC.STA_PERM.11 := PLC.STA.FRC1;
	PLC.STA_PERM.12 := PLC.STA.SCN1;
	PLC.STA_PERM.13 := PLC.STA.FRC0;
	PLC.STA_PERM.14 := PLC.STA.SML;
	PLC.STA_PERM.15 := PLC.STA.CMDACK;
	
	PLC.ALM1_PERM.0 := PLC.ALM1.ALM;
	PLC.ALM1_PERM.1 := PLC.ALM1.NWALM;
	PLC.ALM1_PERM.2 := PLC.ALM1.ALMNACK;
	PLC.ALM1_PERM.3 := PLC.ALM1.WRN;
	PLC.ALM1_PERM.4 := PLC.ALM1.NWWRN;
	PLC.ALM1_PERM.5 := PLC.ALM1.WRNNACK;
	PLC.ALM1_PERM.6 := PLC.ALM1.BAD;
	PLC.ALM1_PERM.7 := PLC.ALM1.NWBAD;
	PLC.ALM1_PERM.8 := PLC.ALM1.BADNACK;
	PLC.ALM1_PERM.9 := PLC.ALM1.EMCYSTP;
	PLC.ALM1_PERM.10 := PLC.ALM1.STP2RUN;
	PLC.ALM1_PERM.11 := PLC.ALM1.CON2ERR;
	PLC.ALM1_PERM.12 := PLC.ALM1.PLC2STOP;
	PLC.ALM1_PERM.13 := PLC.ALM1.DIOERR;
	PLC.ALM1_PERM.14 := PLC.ALM1.PLCERR;
	PLC.ALM1_PERM.15 := PLC.ALM1.CONHIERR;
		
	(*--------------------------------- таймерні біти та лічильники*)
	BLINK_10Hz(enable:=TRUE, timelow:=T#50MS, timehigh:=T#50MS, out=>Clock_10Hz);
	BLINK_5Hz(enable:=TRUE, timelow:=T#100MS, timehigh:=T#100MS, out=>Clock_5Hz);
	BLINK_2Hz(enable:=TRUE, timelow:=T#250MS, timehigh:=T#250MS, out=>Clock_2Hz);
	BLINK_1Hz(enable:=TRUE, timelow:=T#500MS, timehigh:=T#500MS, out=>Clock_1Hz);
	BLINK_0_5Hz(enable:=TRUE, timelow:=T#1000MS, timehigh:=T#1000MS, out=>Clock_0_5Hz);
	
	(*плинні значення*)
	TMBITS_CUR.0 := Clock_10Hz;         // 100MS 
	TMBITS_CUR.1 := Clock_5Hz;        // 200MS
	TMBITS_CUR.2 := Clock_2Hz;        // 500MS
	TMBITS_CUR.3 := Clock_1Hz;      // 1S
	TMBITS_CUR.7 := PLC.NOW[0] > 16#29; //min
	
	(*відловлювання імпульсів необхідних часових періодів*)
	PLC.PLS.P100MS := TMBITS_CUR.0 AND NOT TMBITS_PREV.0; (*100 мс *)
	PLC.PLS.P200MS := TMBITS_CUR.1 AND NOT TMBITS_PREV.1; (*200 мс*)
	PLC.PLS.P500MS := TMBITS_CUR.2 AND NOT TMBITS_PREV.2; (*500 мс*)
	PLC.PLS.P1S := TMBITS_CUR.3 AND NOT TMBITS_PREV.3; (*1 с*)
	PLC.PLS.P60S := TMBITS_CUR.7 AND NOT TMBITS_PREV.7; (*1 хв*)
	(*підрахунок кількості секунд і хвилин*)
	IF PLC.PLS.P1S THEN
	    PLC.TQ := PLC.TQ + 1;
	END_IF;  (*загальний час з початку 1-го циклу контролера (в секундах)*)
	IF PLC.TQ > 16#7FFF_FFFF THEN
	    PLC.TQ := 16#7FFF_FFFF;
	END_IF;
	IF PLC.PLS.P60S AND NOT PLC.STA.SCN1 THEN
	    PLC.TQM := PLC.TQM + 1;
	END_IF; (*загальний час роботи ПЛК з моменту пуску (в хвилинах)*)
	IF PLC.TQM > 16#7FFF_FFFF THEN
	    PLC.TQM := 16#7FFF_FFFF;
	END_IF;
	
	(*розрахунок інших часових періодів*)
	PLC.PLS.P2S := (PLC.TQ MOD 2) = 0 AND PLC.PLS.P1S;(*2 с*)
	PLC.PLS.P5S := (PLC.TQ MOD 5) = 0 AND PLC.PLS.P1S;(*5 с*)
	PLC.PLS.P10S := (PLC.TQ MOD 10) = 0 AND PLC.PLS.P1S;(*10 с*)
	
	(* меандри *)
	PLC.PLS.M1S := Clock_1Hz;  (*меандр з періодом 1 с (0.5 с + 0.5 с)*)
	PLC.PLS.M2S := Clock_0_5Hz;(*меандр з періодом 2 с (1 с + 1 с) *)
	
	(* астрономічний час *)
	nowDT:=SysTimeRtcGet(pResult:=iecResult );
	SysTimeRtcConvertUtcToDate(dwTimestampUtc:= nowDT+LocalTime_ofset*3600, pDate:=NOW );
	PLC.NOW[0] := INT_TO_BCD(NOW.wSECOND); //NOW[0] seconds,-- (16ss,--)
	PLC.NOW[1] := SHL(INT_TO_BCD(NOW.wHOUR), 8) OR INT_TO_BCD(NOW.wMINUTE);//16hhmm
	PLC.NOW[2] := SHL(INT_TO_BCD(NOW.wMONTH), 8) OR INT_TO_BCD(NOW.wDAY);  //16mmdd
	PLC.NOW[3] := SHL(INT_TO_BCD(NOW.wYEAR / 100), 8) OR INT_TO_BCD(NOW.wYEAR MOD 100);; //16yyyy
	
	(* початок години *)
	PLC.PLS.NEWHR := (PLC.NOW[1] AND 16#00FF) = 0 (*хвилини*)AND PLC.PLS.P60S (*один раз за хвилину*);
	
	(* початок доби*)
	PLC.PLS.NEWDAY := PLC.NOW[1] = 0 (*години_хвилини*)AND PLC.PLS.P60S (*один раз за хвилину*);
	
	(*початок зміни*)
	IF PLC.SHIFTPARA[0] < 1 OR PLC.SHIFTPARA[0] > 3 THEN
	    PLC.SHIFTPARA[0] := 2;
	END_IF;(*коректність кількості змін*)
	PLC.PLS.NEWSHIFT := FALSE; (*скидуємо біт початку зміни*)
	FOR i := 1 TO PLC.SHIFTPARA[0] DO
	    (*хоча б одна з устоавок змін спрацювала*)
	    PLC.PLS.NEWSHIFT := PLC.PLS.NEWSHIFT OR (PLC.SHIFTPARA[i] = PLC.NOW[1] (*години хвилин*)AND PLC.PLS.P60S (*один раз за хвилину*));
	END_FOR;
	
	TMBITS_PREV := TMBITS_CUR;(*збереження попередніх значень*)
	
	(*----------- визначеня зміни*)
	IF PLC.SHIFTPARA[0] > 3 OR PLC.SHIFTPARA[0] < 2 THEN
	    PLC.SHIFTPARA[0] := 3;
	END_IF;(*якщо кількість змін >3 або <1 - робимо 3*)
	IF PLC.NOW[1] >= PLC.SHIFTPARA[1] AND (PLC.NOW[1] < PLC.SHIFTPARA[2] OR PLC.SHIFTPARA[2] = 160000) THEN (*1-ша зміна*)
	    PLC.SHIFTNMB := 1;
	ELSE (*2-га або 3-тя*)
	    IF PLC.SHIFTPARA[0] = 2 THEN (*якщо в 2 зміни*)
	        PLC.SHIFTNMB := 2;
	    ELSE (*якщо 3 зміни*)
	        IF PLC.NOW[1] >= PLC.SHIFTPARA[2] AND (PLC.NOW[1] < PLC.SHIFTPARA[3] OR PLC.SHIFTPARA[3] = 160000) THEN
	            PLC.SHIFTNMB := 2;
	        ELSE
	            PLC.SHIFTNMB := 3;
	        END_IF;
	    END_IF;
	END_IF;
	(*----------- *)
	
	(*цикли*)
	pIecInfo := IecTaskGetInfo3(hIecTask := IecTaskGetCurrent(pResult := ADR(iecResult)), pResult := ADR(iecResult));
	PLC.TSK_LTIME := DWORD_TO_UINT(pIecInfo^.dwCycleTime / 1000);
	
	IF NOT FirstScan THEN
	    //обмеження 
	    IF PLC.TSK_MAXTIME > 3000 THEN
	        PLC.TSK_MAXTIME := 0;
	    END_IF;
	    IF PLC.TSK_MAXTIME < PLC.TSK_LTIME THEN
	        PLC.TSK_MAXTIME := PLC.TSK_LTIME;
	    END_IF;
	ELSE
	    PLC.TSK_MAXTIME := 0;
	END_IF;
	(*скидання статусів і тривог*)
	PLC.STA.BLK := false;
	PLC.STA.ALDIS := false;
	PLC.STA.FRC := false;
	PLC.STA.SMLALL := false;
	PLC.STA.DISP := false;
	PLC.STA.FRC2 := false;
	PLC.STA.FRC1 := false;
	PLC.STA.FRC0 := false;
	PLC.STA.SML := false;
	
	PLC.ALM1.ALM := 0;
	PLC.ALM1.NWALM := 0;
	PLC.ALM1.ALMNACK := 0;
	PLC.ALM1.WRN := 0;
	PLC.ALM1.NWWRN := 0;
	PLC.ALM1.WRNNACK := 0;
	PLC.ALM1.BAD := 0;
	PLC.ALM1.NWBAD := 0;
	PLC.ALM1.BADNACK := 0;
	PLC.ALM1.EMCYSTP := 0;
	PLC.ALM1.STP2RUN := 0;
	PLC.ALM1.CON2ERR := 0;
	PLC.ALM1.PLC2STOP := 0;
	PLC.ALM1.DIOERR := 0;
	PLC.ALM1.PLCERR := 0;
	PLC.ALM1.CONHIERR := 0;
	
	(*запамятовування лічильників*)
	PLC.CNTALM_PERM := PLC.CNTALM;
	PLC.CNTWRN_PERM := PLC.CNTWRN;
	PLC.CNTBAD_PERM := PLC.CNTBAD;
	PLC.CNTFRC_PERM := PLC.CNTFRC;
	PLC.CNTMAN_PERM := PLC.CNTMAN;
	
	(*скидання лічильників*)
	PLC.CNTALM := 0;
	PLC.CNTWRN := 0;
	PLC.CNTBAD := 0;
	PLC.CNTFRC := 0;
	PLC.CNTMAN := 0;
```



### Вимоги щодо використання

- Функціональний блок має викликатися у першій секції, наприклад в `Main`: 
- Підключені бібліотеки `CmpApp`, `CmpIecTask`,`Standart=Standart`,`SysTimeCore`,`SysTimeRtc`,`SysTypes2 Interfaces`,`Util`

## Структура та змінна PLC_CFG

- структура співпадає з загальною, прописаною в [загальному описі](../../cm/2_plcfn.md)
- біти в `PLC_STA`, `PLS` і `PLC_ALM1` представлені для зручності через структури з відплвідною назвою
- змінна типу `PLC_CFG` є частиною GVL `SYS` 

## Тестування PLC_FN

Перелік тестів та загальний опис їх проведення наведений в [розділі тестування PLCFN](../../cm/2_plcfn.md). 

- усі змінні, що використовуються в тесті записані в `TEST`

- усі тести реалізовані у фукції `TS_PLCFN`

| Номер | Назва                                                        | Коли перевірявся | Результати тестування                       |
| ----- | ------------------------------------------------------------ | ---------------- | ------------------------------------------- |
| 1     | перший скан                                                  | 11.02.2021       | працює при перезаливці, при втраті живлення |
| 2     | астрономічний час                                            | 11.02.2021       | працює                                      |
| 3     | лічильники роботи ПЛК: загальний і зі старту                 | 11.02.2021       | працює при перезаливці, при втраті живлення |
| 4     | бітові імпульси                                              | 11.02.2021       | працює                                      |
| 5     | бітові меандри                                               | 11.02.2021       | працює                                      |
| 6     | імпульси початку години, доби                                | 11.02.2021       | працює                                      |
| 7     | скидування бітів статусів та лічильників тривог, статусів та збереження їх в змінних `_PERM` |                  |                                             |
| 8     | зміни: номер активної зміни, початок зміни                   |                  |                                             |
| 9     | відображення мінімального та максимального часу циклу        | 11.02.2021       | працює                                      |
| 10    | Обнулення команд через один цикл                             | 11.02.2021       | працює                                      |

### 1 Тест першого скану

Загальний опис тесту наведений [в розділі тестування PLCFN](../../cm/2_plcfn.md#1-тест-першого-скану)

```pascal
TEST.TST_CCLS := TEST.TST_CCLS + 1;
IF SYS.PLC.STA.SCN1 THEN
   TEST.TST_SCN1CLC := TEST.TST_SCN1CLC + 1;
   TEST.TST_NBCLC := TEST.TST_CCLS;
END_IF;
```

### 2 Тест астрономічного часу

Загальний опис тесту наведений [в розділі тестування PLCFN](../../cm/2_plcfn.md#2-тест-астрономічного-часу)

### 3 Тест лічильників роботи ПЛК

Загальний опис тесту наведений [в розділі тестування PLCFN](../../cm/2_plcfn.md#3-тест-лічильників-роботи-плк)

### 4 Тест бітових імпульсів

Загальний опис тесту наведений [в розділі тестування PLCFN](../../cm/2_plcfn.md#4-тест-бітових-імпульсів)

```pascal
IF TEST.TST_PLSON THEN
    IF SYS.PLC.PLS.P100MS THEN
        TEST.TST_P100MS := TEST.TST_P100MS + 1;
    END_IF;
    IF SYS.PLC.PLS.P200MS THEN
        TEST.TST_P200MS := TEST.TST_P200MS + 1;
    END_IF;
    IF SYS.PLC.PLS.P500MS THEN
        TEST.TST_P500MS := TEST.TST_P500MS + 1;
    END_IF;
    IF SYS.PLC.PLS.P1S THEN
        TEST.TST_P1S := TEST.TST_P1S + 1;
    END_IF;
    IF SYS.PLC.PLS.P2S THEN
        TEST.TST_P2S := TEST.TST_P2S + 1;
    END_IF;
    IF SYS.PLC.PLS.P5S THEN
        TEST.TST_P5S := TEST.TST_P5S + 1;
    END_IF;
    IF SYS.PLC.PLS.P10S THEN
        TEST.TST_P10S := TEST.TST_P10S + 1;
    END_IF;
    IF SYS.PLC.PLS.P60S THEN
        TEST.TST_P60S := TEST.TST_P60S + 1;
    END_IF;
    IF SYS.PLC.TQ - TEST.TEST_TQPREV >= 121 THEN
        TEST.TST_PLSON := false;
    END_IF;
ELSE
    TEST.TEST_TQPREV := SYS.PLC.TQ;
END_IF;
```

### 5 Тест бітових меандрів

Загальний опис тесту наведений [в розділі тестування PLCFN](../../cm/2_plcfn.md#5-тест-бітових-меандрів)

### 6 Тест імпульсів початку години та доби

Загальний опис тесту наведений [в розділі тестування PLCFN](../../cm/2_plcfn.md#6-тест-імпульсів-початку-години-та-доби)

```pascal
IF SYS.PLC.PLS.NEWHR THEN
    TEST.TST_CHHRCNT := TEST.TST_CHHRCNT + 1;
END_IF;
IF SYS.PLC.PLS.NEWDAY THEN
    TEST.TST_CHDAYCNT := TEST.TST_CHDAYCNT + 1;
END_IF;
```

### 7 Тест скидування бітів статусів та лічильників тривог і статусів

Загальний опис тесту наведений [в розділі тестування PLCFN](../../cm/2_plcfn.md#7-тест-скидування-бітів-статусів-та-лічильників-тривог-і-статусів)

### 8 Перевірка зміни: номер активної зміни, початок зміни

Загальний опис тесту наведений [в розділі тестування PLCFN](../../cm/2_plcfn.md#8-перевірка-зміни)

Тест наразі не проводився.

### 9 Тест відображення мінімального та максимального часу циклу

Загальний опис тесту наведений [в розділі тестування PLCFN](../../cm/2_plcfn.md#9-тест-відображення-мінімального-та-максимального-часу-циклу)

### 10 Обнулення команд через один цикл

 Перевірити проходження команд принаймні протягом одного циклу. Це потрібно для відловлення широкомовних команд.

```pascal
//Обнулення команд через один цикл
IF SYS.PLC.CMD <> 0 THEN
    TEST.TST_CMDCNT := TEST.TST_CMDCNT + 1;
END_IF;
```

