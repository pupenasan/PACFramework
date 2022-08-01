

## Клас DIVAR: дискретна вхідна змінна процесу

**CLSID=16#1010**

## Загальний опис

Клас реалізовує функції оброблення сирих вхідних даних та діагностичної інформації з `DICH`. До цих функцій входить фільтрація сигналу, налаштування та обробка тривожних подій, керування форсуванням та імітацією.        

Якщо мають бути відмінності в реалізації, слід використовувати інші CLSID в форматі 16#101x

## Загальні вимоги до функцій DIVAR

### Функціональні вимоги 

#### Режими роботи

Клас DIVAR повинен підтримувати наступні режими (підрежими):

- обробка входу/імітація
- нефорсований/форсований

У будь якому режимі значення з прив'язаного каналу `DICH` записується в `STA.VRAW`.    

**Нормальний режим** роботи екземпляру класу є комбінацією підрежимів "обробка входу" та "нефорсований режим". У цьому режимі значення `STA.VAL` залежить від значення каналу `STA.VRAW`, проходячи через функції оброблення.

У режимі **імітація** `STA.SML=TRUE` значення `STA.VAL` залежить від зовнішнього алгоритму імітації і не проходить функцій обробки, змінюється CM-мами верхнього рівня (або незалежною програмою). Іншими словами `STA.VAL` не змінюється алгоритмами класу, окрім форсування. У режимі імітація також змінюється стан `STA.SML` каналу, що прив'язаний до змінної.

У режимі **форсування** (`STA.FRC=TRUE`) `STA.VAL` змінюється  тільки через налагоджувальні вікна HMI і має найвищий пріоритет. При активності біту форсування лічильник `PLC_CFG.CNTFRC` збільшується на 1.

#### Фільтрація сигналу

Фільтрація сигналу працює за наступним принципом: значення `VAL` змінюється на протилежне тільки при зміні сирого значення `VRAW` на час більше ніж  `T_FLTSP`.

#### Інвертування сигналу

При встановленні біту `PRM.INVERSE=TRUE` значення  `STA.VAL = NOT STA.VRAW ` .

#### Моніторинг прив'язки до каналу 

Значення `STA.DLNK=TRUE` вказує на факт прив'язки до каналу.

#### Активність змінної 

Параметр активності змінної визначається виразом `STA.ENBL = NOT PRM.DSBL AND DLNK`. Якщо змінна неактивна `STA.ENBL=FALSE` не працюють функції:

- перетворення сигналу з сирого значення: фільтрація, інвертування
- імітування 
- діагностування та обробка тривог

Верхні рівні ієрархії керування, зокрема CM LVL2, повинні сприймати цю змінну як тимчасово неіснуючу (виведену з експлуатації). Наприклад, якщо змінна відповідає за датчик кінцевого положення клапану, то CM клапану вважає, що змінної не існує і може працювати за алгоритмом "без зворотного положення".   

#### Оброблення тривог

Доступне генерування двох класів тривог:

- аварійна тривога: активується бітом `PRM.ISALM=TRUE`
- попереджувальна тривога: активується бітом `PRM.ISWRN=TRUE` 

За необхідності можна задіяти обидва класи. При активації однієї з функцій оброблення тривог відстежується умова спрацювання:

`умова_спрацювання = VAL <> NRMVAL` 

Тривога спрацьовує якщо умова спрацювання виконується протягом часу `T_DEASP`.  Аварійна тривога відображається станом `STA.ALM=TRUE`, попереджувальна - `STA.WRN=TRUE`. 

При спрацюванні тривоги (передній фронт) виставляється відповідний біт `PLC_CFG.NWALM` та/або `PLC_CFG.NWWRN`. Поки тривога активна:

- виставляється відповідний біт `PLC_CFG.ALM.ALM` та/або `PLC_CFG.ALM.WRN` відповідно
- збільшується на 1 лічильник `PLC_CFG.CNTALM` та/або `PLC_CFG.CNTWRN` відповідно

#### Діагностування каналу вимірювання

Класом передбачається перевірка достовірності каналу вимірювання. При `PRM.QALENBL=TRUE` значення `STA.BAD` прямо залежить від значення `STA.BAD` прив'язаного каналу. Інший спосіб діагностування вимірювального каналу не передбачений даним класом змінної.

`STA.BAD` - це тривога недостовірності. При виникненні тривоги (по передньому фронту) `PLC_CFG.NWBAD=TRUE`. Поки тривога  `STA.BAD` активна:

- виставляється відповідний біт `PLC_CFG.BAD` 
- збільшується на 1 лічильник `PLC_CFG.CNTBAD` 

Скидання біту `PRM.QALENBL=FALSE` відключає функцію перевірки тривоги недостовірності.  

## Рекомендації щодо використання в HMI

Приклад налаштування функцій дискретних вхідних змінних на HMI наведений на рис.

![](media\1_8.png)

Рис. Приклад налаштування функцій дискретних вхідних змінних на HMI.

## Загальні вимоги щодо структури змінних класів

#### DIVAR_HMI

| name | type | adr  | bit  | descr                                      |
| ---- | ---- | ---- | ---- | ------------------------------------------ |
| STA  | UINT | 0    |      | стани + біт команди завантаження DIVAR_STA |

#### DIVAR_CFG

Тут і далі `adr` задається як зміщення в структурі в 16-бітних словах

| name          | type  | adr  | bit  | Опис                                                         |
| ------------- | ----- | ---- | ---- | ------------------------------------------------------------ |
| ID            | UINT  | 0    |      | Унікальний ідентифікатор                                     |
| CLSID         | UINT  | 1    |      | 16#1010                                                      |
| STA           | UINT  | 2    |      | статус, призначення біт як `DIVAR_STA` може бути задіяна як аналогічна структура |
| STA_VRAW      | BOOL  | 2    | 0    | =1 – значення дискретного сигналу з DICH                     |
| STA_VALB      | BOOL  | 2    | 1    | =1 – значення дискретної вхідної змінної після всіх перетворень, в режимі FRC=1 може змінюватися із-зовні |
| STA_BAD       | BOOL  | 2    | 2    | =1 – Дані недостовірні                                       |
| STA_ALDIS     | BOOL  | 2    | 3    | =1 – Тривога виведена з експлуатації                         |
| STA_DLNK      | BOOL  | 2    | 4    | =1 – якщо прив’язаний до каналу                              |
| STA_ENBL      | BOOL  | 2    | 5    | =1 – змінна задіяна                                          |
| STA_ALM       | BOOL  | 2    | 6    | =1 – Тривога                                                 |
| STA_VALPRV    | BOOL  | 2    | 7    | значення на попередньому циклі                               |
| STA_ISALM     | BOOL  | 2    | 8    | =1 – задіяна як технологічна тривога                         |
| STA_SPDMONON  | BOOL  | 2    | 9    | =1 – включений контроль швидкості (SPDMON)                   |
| STA_ISWRN     | BOOL  | 2    | 10   | =1 – задіяна як технологічне попередження                    |
| STA_WRN       | BOOL  | 2    | 11   | =1 – Попередження                                            |
| STA_INBUF     | BOOL  | 2    | 12   | =1 – змінна в буфері                                         |
| STA_FRC       | BOOL  | 2    | 13   | =1 – Режим форсування                                        |
| STA_SML       | BOOL  | 2    | 14   | =1 – змінна в режимі симуляції                               |
| STA_CMDLOAD   | BOOL  | 2    | 15   | =1 – команда завантаження в буфер                            |
| VALI          | INT   | 3    |      | режим нефорсуання: відображення значення в форматі INT; режим форсування: збереження форсованого значення в пам'яті (щоб зміна VAL не впливала) |
| PRM           | UINT  | 4    |      | параметри конфігурації, повинні зберігатися при відключеному живленні |
| PRM_ISALM     | BOOL  | 4    | 0    | =1 – задіяти як аварійну тривогу                             |
| PRM_ISWRN     | BOOL  | 4    | 1    | =1 – задіяти як попереджувальну тривогу                      |
| PRM_INVERSE   | BOOL  | 4    | 2    | =1 – інвертувати сире значення                               |
| PRM_b3        | BOOL  | 4    | 3    | резерв                                                       |
| PRM_b4        | BOOL  | 4    | 4    | резерв                                                       |
| PRM_NRMVAL    | BOOL  | 4    | 5    | значення норми                                               |
| PRM_QALENBL   | BOOL  | 4    | 6    | =1 – задіяти тривогу недостовірності каналу                  |
| PRM_DSBL      | BOOL  | 4    | 7    | =1 – змінна не задіяна                                       |
| PRM_SPEEDENBL | BOOL  | 4    | 8    | =1 – активація блоку розрахунку швидкості                    |
| PRM_b9        | BOOL  | 4    | 9    | резерв                                                       |
| PRM_b10       | BOOL  | 4    | 10   | резерв                                                       |
| PRM_b11       | BOOL  | 4    | 11   | резерв                                                       |
| PRM_b12       | BOOL  | 4    | 12   | резерв                                                       |
| PRM_b13       | BOOL  | 4    | 13   | резерв                                                       |
| PRM_STATICMAP | BOOL  | 4    | 14   | =1 - статична прив'язка каналів                              |
| PRM_b15       | BOOL  | 4    | 15   | резерв                                                       |
| CHID          | UINT  | 5    |      | Логічний номер дискретного каналу, до якого прив'язана змінна, 0 - немає прив'язки |
| STEP1         | UINT  | 6    |      | номер кроку                                                  |
| T_DEASP       | UINT  | 7    |      | Час затримки тривоги в 0.1 секунди                           |
| T_FLTSP       | UINT  | 8    |      | Заданий час фільтрації в мілісекундах                        |
| CHIDDF        | UINT  | 9    |      | Логічний номер дискретного каналу за замовченням             |
| T_STEP1       | UDINT | 10   |      | Плинний час кроку в мс                                       |
| T_PREV        | UDINT | 12   |      | час в мс з попереднього виклику, береться зі структури PLC_CFG.TQMS |

#### Команди для буферу (див. структуру буферу)

| Атрибут | Тип  | Біт  | Опис                                                         |
| ------- | ---- | ---- | ------------------------------------------------------------ |
| CMD     | UINT |      | Команди:<br />16#0001: записати 1 - тільки при форсуванні<br />16#0002: записати 0 - тільки при форсуванні<br />16#0003: TOGGLE - тільки при форсуванні<br />16#0100: прочитати конфігурацію<br/>16#0101: записати конфігурацію<br/>16#0102: записати значення за замовченням<br/>16#0300: перемкнути форсування<br/>16#0301: ввімкнути форсування<br/>16#0302: вимкнути форсування<br/>16#0311: імітувати<br/>16#0312: зняти режим імітації<br/> |



#### Робота з буфером

Повинна бути реалізована функція роботи з класичним буфером.

- Буфер рекомендується використовувати один для всіх технологічних змінних.

- Факт зайнятості буфера перевіряється за рівністю ідентифікатора класу `CLSID` та ідентифікатора технологічної змінної `ID`

- при захопленні буферу:

  - `VARBUF.STA = DIVAR_CFG.STA`
  - `DIVAR_CFG.CMD = VARBUF.CMD`  якщо той не дорівнює нулю (для можливості команд з іншого джерела)
  - зчитування статусних бітів фізичного каналу технологічної змінної`VARBUF.CH_STA = CHCFG.STA`.

- конфігурація технологічної змінної повинна зчитуватися в буфер при отриманні команд:

  - біті статусу `STA.CMDLOAD=TRUE`
  - оновлення технологічної змінної, яка вже записана в буфер`VARBUF.CMD` = 16#0100; 

- конфігурація технологічної змінної повинна записуватись з буфера при отриманні команд:

  - `VARBUF.CMD` = 16#0101; 	

  

Повинна бути реалізована функція роботи з параметричними двунаправленим буферами VARBUFIN<->VARBUFOUT.

- Використовується 2 буфери: 
  - вхідний `VARBUFIN` - використовується для обробки команд (при рівності CLSID та ID) та запису інформації в технологічну змінну 
  - вихідний `VARBUFOUT` - використовується зчитування інформації з технологічної змінної при отриманні команди на читання з `VARBUFIN`
- Буфери рекомендується використовувати одну пару для всіх технологічних змінних.
- Факт зайнятості буфера не можливий, оскільки буфер реалізований через 2 буферні змінні VARBUFIN та VARBUFOUT через які інформація проходить для подальшої передачі її в технологічну змінну або внутрішній буфер засобу HMI (по аналогії з параметричним обміном PKW в профілі PROFIDRIVE)
- конфігурація технологічної змінної повинна зчитуватися в вихідний буфер при:
  - рівності класів `DIVARCFG.CLSID=VARBUFIN.CLSID` , ідентифікаторів `DIVARCFG.ID=VARBUFIN.ID` та отримання команди з вхідного буфера `VARBUFIN.CMD=16#100 `
- конфігурація технологічної змінної повинна записуватись з вхідного буфера при:
  - рівності класів `DIVARCFG.CLSID=VARBUFIN.CLSID` , ідентифікаторів `DIVARCFG.ID=VARBUFIN.ID` та отримання команди з вхідного буфера `VARBUFIN.CMD=16#101 `



### Вимоги щодо реалізації інтерфейсу

INOUT

- `CHCFG` - фізичний канал прив'язаний до технологічної змінної
- `DIVARCFG` - конфігураційна частина технологічної змінної
- `DIVARHMI` - HMI частина технологічної змінної
- за умови, що немає можливості доступатися до зовнішніх змінних з середини функцій, передається `PLC_CFG`, `VARBUF`,  `VARBUFIN`, `VARBUFOUT` ; альтернативно можна використовувати інші інтерфейси для використання в середині `PLC_CFG` 



### Ініціалізація технологічної змінної при першому циклі роботи

Запис ID, CHID, CHIDFL за замовченням виконується в результаті виконання програмної секції `initvars`. 

Для кожної технологічної змінної в `initvars` повиннен бути наступний фрагмент програми для запису ID, CHID, CHIDFL

```
"VAR".DIVAR1.ID := 1001;   "VAR".DIVAR1.CHID := 1;    "VAR".DIVAR1.CHIDDF := 1;
```

Також виконується ініціалізація всередині функції обробки технологічної змінної, в результаті

- присвоюється `DIVARCFG.CLSID:=16#1010;`
- виконується активація технологічної змінної `DIVARCFG.PRM.DSBL := FALSE; ` 
- якщо логічний номер каналу не заданий - записати значення по замовчування  `DIVARCFG.CHID := DIVARCFG.CHIDDF;`



### Вимоги щодо реалізації програми користувача

- Функції обробки технологічних змінних повинні викликатися з кожним викликом тієї задачі, до якого вони прив'язані.

- При першому старті (`PLC_CFG.SCN1`) повинні ініціалізуватися ідентифікатор змінної `DIVAR_CFG.ID` та номер логічного каналу `DIVAR_CFG.CHID`, 
```pascal
    (*DIVARCFG.CLSID 
    16#1010 - класичний
    16#1011 - з лічильником в полі VALI, не змінюється в цій функції в нормальному режимі*)
    
    (*ініціалізація змінної на першому циклі обробки*)
    IF "SYS".PLCCFG.STA.SCN1 THEN
        #DIVARCFG.CLSID := 16#1010; (*присвоєння ідентифікатора класу*)
        #DIVARCFG.PRM.DSBL := FALSE;(*активація змінної*)
        #DIVARCFG.T_PREV := "SYS".PLCCFG.TQMS;(*збереження часу виклику*)
        IF #DIVARCFG.CHID = 0 THEN (*якщо логіний номер каналу на заданий - записати значення по замовчування *)
            #DIVARCFG.CHID := #DIVARCFG.CHIDDF;
        END_IF;
        
    
        (*запис сирого значення з каналу для подальшої обробки*)
        IF #CHCFG.ID > 0 THEN
            #VRAW := #CHCFG.STA.VALB;
        ELSE
            #VRAW := 0;
        END_IF;
        #DIVARCFG.STA.VALPRV := #VRAW;
        #DIVARCFG.STA.VRAW := #DIVARCFG.STA.VALPRV;
        #DIVARCFG.STA.VALB := #DIVARCFG.STA.VRAW;
        
        #DIVARCFG.T_STEP1 := 0; (*онулення часу кроку*)
        #DIVARCFG.STEP1 := 400; (*переведення на крок DI=0*)
        
        (*визначення діапазонів ідентифікаторів змінної*)
        IF #DIVARCFG.ID>0 THEN
            IF #DIVARCFG.ID<"SYS".VARIDMIN THEN "SYS".VARIDMIN:=#DIVARCFG.ID; END_IF;
            IF #DIVARCFG.ID>"SYS".VARIDMAX THEN "SYS".VARIDMAX:=#DIVARCFG.ID; END_IF;
        END_IF;
        
        RETURN;
    END_IF;
    
    (*зчитування статусних бітів з технологічної змінної у внутрішні змінні*)
    #VRAW := #DIVARCFG.STA.VRAW;
    #VAL := #DIVARCFG.STA.VALB;
    #BAD := #DIVARCFG.STA.BAD;
    #ALDIS := #DIVARCFG.STA.ALDIS;
    #DLNK := #DIVARCFG.STA.DLNK;
    #ENBL := #DIVARCFG.STA.ENBL;
    #ALM := #DIVARCFG.STA.ALM;
    #SPDMONON := #DIVARCFG.STA.SPDMONON;
    #VALPRV := #DIVARCFG.STA.VALPRV;
    #WRN := #DIVARCFG.STA.WRN;
    #INBUF := #DIVARCFG.STA.INBUF;
    #FRC := #DIVARCFG.STA.FRC;
    #SML := #DIVARCFG.STA.SML;
    #CMDLOAD := #DIVARCFG.STA.CMDLOAD;
    
    (*зчитування параметричних бітів з технологічної змінної у внутрішні змінні*)
    #PRM_ISALM := #DIVARCFG.PRM.ISALM;
    #PRM_ISWRN := #DIVARCFG.PRM.ISWRN;
    #PRM_INVERSE := #DIVARCFG.PRM.INVERSE;
    #PRM_NRMVAL := #DIVARCFG.PRM.NRMVAL;
    #PRM_QALENBL := #DIVARCFG.PRM.QALENBL;
    #PRM_DSBL := #DIVARCFG.PRM.DSBL;
    #PRM_STATICMAP := #DIVARCFG.PRM.STATICMAP;
    
    #INBUF := (#DIVARCFG.ID = "BUF".VARBUF.ID) AND (#DIVARCFG.CLSID = "BUF".VARBUF.CLSID); (*змінна в буфері якщо співпадає ідентифікатор змінної та ідентифікатор класу*)
    #CMDLOAD := #DIVARHMI.STA.%X15; (*команда запису в буфер з НМІ змінної*)
    #CMD := 0; (*онулення внутрішньої команда*)
    #DLNK := (#CHCFG.ID > 0); (*змінна привязана до каналу якщо канал має реальний ідентифікатор (не 0 - не молоко)*)
    #VARENBL := NOT #PRM_DSBL AND #DLNK; (*змінна задіяна якщо привязана до каналу і не активний параметр змінна не задіяна*)
    #VRAW := #CHCFG.STA.VALB; (*зчитування сирого значення з каналу*)
    #T_STEPMS := #DIVARCFG.T_STEP1; (*запамятовування часу циклу в мс*)
    
    (*реалізація алгоритму ping-pong*)
    IF #DLNK THEN
        #CHCFG.STA.PNG := true;
        #CHCFG.VARID := #DIVARCFG.ID;
    END_IF;
    
    (*якщо змінна не задіяна не рахуємо час, скидаємо стан і записуємо лише сире значення для змінної*)
    IF NOT #VARENBL THEN
        #VAL := #VRAW;
        #DIVARCFG.T_STEP1 := 0;
        #DIVARCFG.STEP1 := 400;
    END_IF;
    
    (*визначення часу між викликами функції по різниці між мілісікундним лічильником та часом який пройшов з попереднього виклику *)
    #dT := "SYS".PLCCFG.TQMS - #DIVARCFG.T_PREV;
    
    (* широкомовне дефорсування*) 
    IF "SYS".PLCCFG.CMD = 16#4302 THEN
        #FRC := false; (*дефорсувати об'єкт типу*)
    END_IF;
    
    (*вибір джерела конфігураційної/керівної команди згідно пріоритету якщо команди надійшли одночасно*)
    IF #CMDLOAD THEN (*команда запису в буфер - команда з НМІ*)
        #CMD := 16#0100;
    ELSIF #INBUF AND "BUF".VARBUF.CMD <> 0 THEN (*команда з буферу*)
        #CMD := "BUF".VARBUF.CMD;
    END_IF;
    
    (*commands*)
    CASE #CMD OF
        16#0001: (*записати 1 - тільки при форсуванні*)
            IF #FRC AND #INBUF THEN
                #DIVARCFG.VALI := 1;
                #VAL := true;
                #DIVARCFG.STEP1 := 401;
                #DIVARCFG.T_STEP1 := 0;
            END_IF;
        16#0002: (*записати 0 - тільки при форсуванні*)
            IF #FRC AND #INBUF THEN
                #DIVARCFG.VALI := 0;
                #VAL := false;
                #DIVARCFG.STEP1 := 400;
                #DIVARCFG.T_STEP1 := 0;
            END_IF;
        16#0003: (*TOGGLE - тільки при форсуванні*)
            IF #FRC AND #INBUF THEN
                IF #DIVARCFG.VALI > 0 THEN
                    #DIVARCFG.VALI := 0;
                    #VAL := false;
                    #DIVARCFG.STEP1 := 400;
                    #DIVARCFG.T_STEP1 := 0;
                ELSE
                    #DIVARCFG.VALI := 1;
                    #VAL := true;
                    #DIVARCFG.STEP1 := 401;
                    #DIVARCFG.T_STEP1 := 0;
                END_IF;
            END_IF;
        16#0100: (*прочитати конфігурацію*)
            (* MSG 200-Ok 400-Error
            // 200 - Дані записані
            // 201 - Дані прочитані 
            // 403 - канал вже зайнятий 
            // 404 - номер каналу не відповідає діапазону   
            // 405 - активна статична адресація каналів *)
            "BUF".VARBUF.MSG := 201;
            
            (*зчитати ідентифікатор змінної та ідентифікатор класу*)
            "BUF".VARBUF.ID := #DIVARCFG.ID;
            "BUF".VARBUF.CLSID := #DIVARCFG.CLSID;
            
            (*зчитати бітові параметри*)
            "BUF".VARBUF.PRM.%X0 := #PRM_ISALM;
            "BUF".VARBUF.PRM.%X1 := #PRM_ISWRN;
            "BUF".VARBUF.PRM.%X2 := #PRM_INVERSE;
            "BUF".VARBUF.PRM.%X5 := #PRM_NRMVAL;
            "BUF".VARBUF.PRM.%X6 := #PRM_QALENBL;
            "BUF".VARBUF.PRM.%X7 := #PRM_DSBL;
            "BUF".VARBUF.PRM.%X14 := #PRM_STATICMAP;
            
            (*зчитати параметри*)           
            "BUF".VARBUF.CHID := #DIVARCFG.CHID;
            "BUF".VARBUF.T_FLTSP := #DIVARCFG.T_FLTSP;
            "BUF".VARBUF.T_DEALL := #DIVARCFG.T_DEASP;
            
            (*зчитати значення змінної для безударного форсування*)
            "BUF".VARBUF.VALR := INT_TO_REAL(#DIVARCFG.VALI);
            
        16#0101: (*записати конфігурацію*)
            (* MSG 200-Ok 400-Error
            // 200 - Дані записані
            // 201 - Дані прочитані 
            // 403 - канал вже зайнятий 
            // 404 - номер каналу не відповідає діапазону   
            // 405 - активна статична адресація каналів*)
            "BUF".VARBUF.MSG:=200;
            
            (*записати бітові параметри*)
            #PRM_ISALM := "BUF".VARBUF.PRM.%X0;
            #PRM_ISWRN := "BUF".VARBUF.PRM.%X1;
            #PRM_INVERSE := "BUF".VARBUF.PRM.%X2;
            #PRM_NRMVAL := "BUF".VARBUF.PRM.%X5;
            #PRM_QALENBL := "BUF".VARBUF.PRM.%X6;
            #PRM_DSBL := "BUF".VARBUF.PRM.%X7;
            #PRM_STATICMAP := "BUF".VARBUF.PRM.%X14;
            
            (*записати параметри*)
            #DIVARCFG.T_FLTSP := "BUF".VARBUF.T_FLTSP;
            #DIVARCFG.T_DEASP := "BUF".VARBUF.T_DEALL;
            
            (*алгоритм для зміни номера логічного каналу при перевірці його на коректність*)
            IF NOT #PRM_STATICMAP THEN (* зміна логічного номеру каналу тільки при неактивна статичн адресація*)
                IF "BUF".VARBUF.CHID>=0 AND "BUF".VARBUF.CHID <= INT_TO_UINT("SYS".PLCCFG.DICNT) THEN (* якщо логічний номер канал менший за кількість каналів*)
                    IF "SYS".CHDI["BUF".VARBUF.CHID].VARID = 0 THEN (* якщо логічний номер канал нульовий - вільний *)
                        #DIVARCFG.CHID := "BUF".VARBUF.CHID; (* змінити логічний номер каналу *)
                    ELSIF "BUF".VARBUF.CHID <> #DIVARCFG.CHID THEN (* інакше вивести помилку про зайнятість каналу *)
                        "BUF".VARBUF.MSG := 403;(* канал вже зайнятий*)
                    END_IF;
                ELSE
                    "BUF".VARBUF.MSG := 404; (*номер каналу не відповідає діапазону*)
                END_IF;
            ELSIF "BUF".VARBUF.CHID <> #DIVARCFG.CHID THEN (* інакше вивести помилку активна статична адресація каналів *)
                "BUF".VARBUF.MSG := 405;(* активна статична адресація каналів*)
            END_IF;
            IF #INBUF THEN (*оновити логічний номер каналу після запису якщо змінна ще в буфері*)
                "BUF".VARBUF.CHID := #DIVARCFG.CHID;
            END_IF;
        16#0102: (*записати значення за замовченням*)
            #DIVARCFG.CHID := #DIVARCFG.CHIDDF;
        16#0300: (*перемкнути форсування*)
            #FRC := NOT #FRC;
        16#0301: (*ввімкнути форсування*)
            #FRC := true;
        16#0302: (*вимкнути форсування*)
            #FRC := false;
        16#0311: (* імітувати*)
            #SML := true;
        16#0312: (* зняти режим імітації*)
            #SML := false;
    END_CASE;
    
    (*обробка значень*)
    IF NOT #FRC AND NOT #SML THEN (*обробка нефорсованого значення - нормальна обробка змінної*)
        IF #PRM_INVERSE THEN (*реалізація функції інверсії*)
            #DI := NOT #VRAW;
        ELSE
            #DI := #VRAW;
        END_IF;
        (*обробка автомату станів та фільтрації змінної*)
        CASE #DIVARCFG.STEP1 OF
            400:(*DI =0*)
                IF #DI THEN
                    #DIVARCFG.STEP1 := 401;
                    #DIVARCFG.T_STEP1 := 0;
                END_IF;
                IF #T_STEPMS >= UINT_TO_UDINT(#DIVARCFG.T_FLTSP) THEN
                    #VAL := FALSE;
                END_IF;
            401:(*DI =1*)
                IF NOT #DI THEN
                    #DIVARCFG.STEP1 := 400;
                    #DIVARCFG.T_STEP1 := 0;
                END_IF;
                IF #T_STEPMS >= UINT_TO_UDINT(#DIVARCFG.T_FLTSP) THEN
                    #VAL := true;
                END_IF;
            ELSE
                #DIVARCFG.STEP1 := 400;
                #DIVARCFG.T_STEP1 := 0;
        END_CASE;
        (*якщо це не DI з лічильником*)
        IF #DIVARCFG.CLSID <> 16#1011 THEN
            #DIVARCFG.VALI := BOOL_TO_INT (#VAL);
        END_IF;
    ELSE (* обробка без фільтрації та інверсії*)
        IF #FRC THEN  (*при форсування значення береться з VALI*)
            (*якщо це не DI з лічильником*)
            IF #DIVARCFG.CLSID <> 16#1011 THEN
                #VAL := INT_TO_BOOL (#DIVARCFG.VALI);
            END_IF;
        ELSIF #SML THEN (*в режимі імітації VAL змінюється ззовні а VALI береться з нього*)
            (*якщо це не DI з лічильником*)
            IF #DIVARCFG.CLSID <> 16#1011 THEN
                #DIVARCFG.VALI := BOOL_TO_INT (#VAL);
            END_IF;
        END_IF;
        (*обробка автомату станів при форсування - фільтрація відсутня*)
        CASE #DIVARCFG.STEP1 OF
            400:(*DI =0*)
                IF #VAL THEN
                    #DIVARCFG.STEP1 := 401;
                    #DIVARCFG.T_STEP1 := 0;
                END_IF;
            401:(*DI =1*)
                IF NOT #VAL THEN
                    #DIVARCFG.STEP1 := 400;
                    #DIVARCFG.T_STEP1 := 0;
                END_IF;
            ELSE
                #DIVARCFG.STEP1 := 400;
                #DIVARCFG.T_STEP1 := 0;
        END_CASE;
    END_IF;
    
    (*обробка тривог - тривоги активні лише при активації змінної*)
    IF #VARENBL THEN
        IF #DIVARCFG.T_STEP1 >= (UINT_TO_UDINT(#DIVARCFG.T_DEASP) * 100 + #DIVARCFG.T_FLTSP) THEN (*затримка тривоги задається в 0.1 с, фільтрація в мс*)
            #ALM := NOT (#PRM_NRMVAL = #VAL) AND #PRM_ISALM;
            #WRN := NOT (#PRM_NRMVAL = #VAL) AND #PRM_ISWRN;
        ELSIF #DIVARCFG.T_STEP1 >= #DIVARCFG.T_FLTSP THEN
            #ALM := false;
            #WRN := false;
        END_IF;
    ELSE
        #ALM := false;
        #WRN := false;
    END_IF;
    
    #BAD := #VARENBL AND #CHCFG.STA.BAD AND #PRM_QALENBL AND NOT #SML; (*тривога достовірності береться з привязаного фізичного каналу*)
    
    (*передача тривог для змінної PLCCFG для формування загального статусного біта і визначення нової тривоги*)
    IF #BAD THEN
        "SYS".PLCCFG.ALM1.BAD := true;
        "SYS".PLCCFG.CNTBAD := "SYS".PLCCFG.CNTBAD + 1;
        IF NOT #DIVARCFG.STA.BAD THEN
            "SYS".PLCCFG.ALM1.NWBAD := true;
        END_IF;
    END_IF;
    
    IF #ALM THEN
        "SYS".PLCCFG.ALM1.ALM := true;
        "SYS".PLCCFG.CNTALM := "SYS".PLCCFG.CNTALM + 1;
        IF NOT #DIVARCFG.STA.ALM THEN
            "SYS".PLCCFG.ALM1.NWALM := true;
        END_IF;
    END_IF;
    
    IF #WRN THEN
        "SYS".PLCCFG.ALM1.WRN := true;
        "SYS".PLCCFG.CNTWRN := "SYS".PLCCFG.CNTWRN + 1;
        IF NOT #DIVARCFG.STA.WRN THEN
            "SYS".PLCCFG.ALM1.NWWRN := true;
        END_IF;
    END_IF;
    
    (*передача статусних бітів для змінної PLCCFG для формування загального статусного біта*)
    IF #FRC THEN
        "SYS".PLCCFG.STA.FRC1 := true;
        "SYS".PLCCFG.CNTFRC := "SYS".PLCCFG.CNTFRC + 1;
    END_IF;
    IF #SML THEN
        "SYS".PLCCFG.STA.SML := true;
    END_IF;
    
    (*якщо змінна налаштована як технологічна тривога чи попередження передача цієї інформації в статусні біти технологічної змінної*)
    #ISALM := #PRM_ISALM;
    #ISWRN := #PRM_ISWRN;
    
    (*передача статусних бітів з внутрішніх змінних в технологічну змінну*)
    #DIVARCFG.STA.VRAW := #VRAW;
    #DIVARCFG.STA.VALB := #VAL;
    #DIVARCFG.STA.BAD := #BAD;
    #DIVARCFG.STA.ALDIS := #ALDIS;
    #DIVARCFG.STA.DLNK := #DLNK;
    #DIVARCFG.STA.ENBL := #VARENBL;
    #DIVARCFG.STA.ALM := #ALM;
    #DIVARCFG.STA.VALPRV := #VALPRV;
    #DIVARCFG.STA.ISALM := #ISALM;
    #DIVARCFG.STA.SPDMONON:= #SPDMONON;
    #DIVARCFG.STA.ISWRN := #ISWRN;
    #DIVARCFG.STA.WRN := #WRN;
    #DIVARCFG.STA.INBUF := #INBUF;
    #DIVARCFG.STA.FRC := #FRC;
    #DIVARCFG.STA.SML := #SML;
    #DIVARCFG.STA.CMDLOAD := FALSE;(*онулення біта запису в буфер*)
    
    (*передача параметричних бітів з внутрішніх змінних в технологічну змінну*)
    #DIVARCFG.PRM.ISALM := #PRM_ISALM;
    #DIVARCFG.PRM.ISWRN := #PRM_ISWRN;
    #DIVARCFG.PRM.INVERSE := #PRM_INVERSE;
    #DIVARCFG.PRM.NRMVAL := #PRM_NRMVAL;
    #DIVARCFG.PRM.QALENBL := #PRM_QALENBL;
    #DIVARCFG.PRM.DSBL := #PRM_DSBL;
    #DIVARCFG.PRM.STATICMAP := #PRM_STATICMAP;
    
    (*передача статусних бітів з конфігураційної частини в НМІ*)
    #DIVARHMI.STA.%X0 := #DIVARCFG.STA.VRAW;
    #DIVARHMI.STA.%X1 := #DIVARCFG.STA.VALB;
    #DIVARHMI.STA.%X2 := #DIVARCFG.STA.#BAD;
    #DIVARHMI.STA.%X3 := #DIVARCFG.STA.#ALDIS;
    #DIVARHMI.STA.%X4 := #DIVARCFG.STA.#DLNK;
    #DIVARHMI.STA.%X5 := #DIVARCFG.STA.#ENBL;
    #DIVARHMI.STA.%X6 := #DIVARCFG.STA.#ALM;
    #DIVARHMI.STA.%X7 := #DIVARCFG.STA.#VALPRV;
    #DIVARHMI.STA.%X8 := #DIVARCFG.STA.#ISALM;
    #DIVARHMI.STA.%X9 := #DIVARCFG.STA.SPDMONON;
    #DIVARHMI.STA.%X10 := #DIVARCFG.STA.#ISWRN;
    #DIVARHMI.STA.%X11 := #DIVARCFG.STA.#WRN;
    #DIVARHMI.STA.%X12 := #DIVARCFG.STA.#INBUF;
    #DIVARHMI.STA.%X13 := #DIVARCFG.STA.#FRC;
    #DIVARHMI.STA.%X14 := #DIVARCFG.STA.#SML;
    #DIVARHMI.STA.%X15 := #DIVARCFG.STA.#CMDLOAD;
    
    #DIVARCFG.T_PREV := "SYS".PLCCFG.TQMS;(*запамятовування часу останнього виклику екземпляра функції*)
    
    (*підрахунок часу стану та обмеження його по верхній межі діапазону*)
    #DIVARCFG.T_STEP1 := #DIVARCFG.T_STEP1 + #dT;
    IF #DIVARCFG.T_STEP1 > 16#7FFF_FFFF THEN
        #DIVARCFG.T_STEP1 := 16#7FFF_FFFF;
    END_IF;
    
    (*автоматичне оновлення якщо змінна записана в буфер*)
    IF #INBUF THEN
        "BUF".VARBUF.CMD := 0;
        "BUF".VARBUF.VALR := INT_TO_REAL(#DIVARCFG.VALI);
    
        "BUF".VARBUF.STA.%X0 := #DIVARCFG.STA.VRAW;
        "BUF".VARBUF.STA.%X1 := #DIVARCFG.STA.VALB;
        "BUF".VARBUF.STA.%X2 := #DIVARCFG.STA.#BAD;
        "BUF".VARBUF.STA.%X3 := #DIVARCFG.STA.#ALDIS;
        "BUF".VARBUF.STA.%X4 := #DIVARCFG.STA.#DLNK;
        "BUF".VARBUF.STA.%X5 := #DIVARCFG.STA.#ENBL;
        "BUF".VARBUF.STA.%X6 := #DIVARCFG.STA.#ALM;
        "BUF".VARBUF.STA.%X7 := #DIVARCFG.STA.#VALPRV;
        "BUF".VARBUF.STA.%X8 := #DIVARCFG.STA.#ISALM;
        "BUF".VARBUF.STA.%X9 := #DIVARCFG.STA.SPDMONON;
        "BUF".VARBUF.STA.%X10 := #DIVARCFG.STA.#ISWRN;
        "BUF".VARBUF.STA.%X11 := #DIVARCFG.STA.#WRN;
        "BUF".VARBUF.STA.%X12 := #DIVARCFG.STA.#INBUF;
        "BUF".VARBUF.STA.%X13 := #DIVARCFG.STA.#FRC;
        "BUF".VARBUF.STA.%X14 := #DIVARCFG.STA.#SML;
        "BUF".VARBUF.STA.%X15 := #DIVARCFG.STA.#CMDLOAD;
        
        "BUF".VARBUF.STEP1 := #DIVARCFG.STEP1;
        "BUF".VARBUF.T_STEP1 := #DIVARCFG.T_STEP1;
    
    (*зчитування статусних бітів фізичного каналу технологічної змінної*)
        "BUF".VARBUF.CH_CLSID := #CHCFG.CLSID;
        "BUF".VARBUF.CH_STA.%X0 := #CHCFG.STA.VRAW;
        "BUF".VARBUF.CH_STA.%X1 := #CHCFG.STA.VALB;
        "BUF".VARBUF.CH_STA.%X2 := #CHCFG.STA.BAD;
        "BUF".VARBUF.CH_STA.%X3 := #CHCFG.STA.b3;
        "BUF".VARBUF.CH_STA.%X4 := #CHCFG.STA.PNG;
        "BUF".VARBUF.CH_STA.%X5 := #CHCFG.STA.ULNK;
        "BUF".VARBUF.CH_STA.%X6 := #CHCFG.STA.MERR;
        "BUF".VARBUF.CH_STA.%X7 := #CHCFG.STA.BRK;
        "BUF".VARBUF.CH_STA.%X8 := #CHCFG.STA.SHRT;
        "BUF".VARBUF.CH_STA.%X9 := #CHCFG.STA.NBD;
        "BUF".VARBUF.CH_STA.%X10 := #CHCFG.STA.b10;
        "BUF".VARBUF.CH_STA.%X11 := #CHCFG.STA.INIOTBUF;
        "BUF".VARBUF.CH_STA.%X12 := #CHCFG.STA.INBUF;
        "BUF".VARBUF.CH_STA.%X13 := #CHCFG.STA.FRC;
        "BUF".VARBUF.CH_STA.%X14 := #CHCFG.STA.SML;
        "BUF".VARBUF.CH_STA.%X15 := #CHCFG.STA.CMDLOAD;
    END_IF;
    
    (*реалізація читання конфігураційних даних в буфер out*)
    IF (UINT_TO_WORD(#DIVARCFG.CLSID) AND 16#FFF0)=(UINT_TO_WORD("BUF".VARBUFIN.CLSID) AND 16#FFF0) AND #DIVARCFG.ID="BUF".VARBUFIN.ID AND "BUF".VARBUFIN.CMD = 16#100 THEN
        (* MSG 200-Ok 400-Error
        // 200 - Дані записані
        // 201 - Дані прочитані 
        // 403 - канал вже зайнятий 
        // 404 - номер каналу не відповідає діапазону   *)
        "BUF".VARBUFOUT.MSG := 201;
        
        "BUF".VARBUFOUT.PRM.%X0 := #DIVARCFG.PRM.ISALM;
        "BUF".VARBUFOUT.PRM.%X1 := #DIVARCFG.PRM.ISWRN;
        "BUF".VARBUFOUT.PRM.%X2 := #DIVARCFG.PRM.INVERSE;
        "BUF".VARBUFOUT.PRM.%X5 := #DIVARCFG.PRM.NRMVAL;
        "BUF".VARBUFOUT.PRM.%X6 := #DIVARCFG.PRM.QALENBL;
        "BUF".VARBUFOUT.PRM.%X7 := #DIVARCFG.PRM.DSBL;
        "BUF".VARBUFOUT.PRM.%X14 := #DIVARCFG.PRM.STATICMAP;
        
        "BUF".VARBUFOUT.ID := #DIVARCFG.ID;
        "BUF".VARBUFOUT.CLSID := #DIVARCFG.CLSID;
        "BUF".VARBUFOUT.CHID := #DIVARCFG.CHID;
        "BUF".VARBUFOUT.VALR := INT_TO_REAL(#DIVARCFG.VALI);
        "BUF".VARBUFOUT.T_FLTSP := #DIVARCFG.T_FLTSP;
        "BUF".VARBUFOUT.T_DEALL := #DIVARCFG.T_DEASP;
        
        "BUF".VARBUFIN.CMD :=0;
    END_IF;
    
    (*реалізація запису конфігураційних даних з буфер in в технологічну змінну*)
    IF (UINT_TO_WORD(#DIVARCFG.CLSID) AND 16#FFF0)=(UINT_TO_WORD("BUF".VARBUFIN.CLSID) AND 16#FFF0) AND #DIVARCFG.ID="BUF".VARBUFIN.ID AND "BUF".VARBUFIN.CMD = 16#101 THEN
        (* MSG 200-Ok 400-Error
        // 200 - Дані записані
        // 201 - Дані прочитані 
        // 403 - канал вже зайнятий 
        // 404 - номер каналу не відповідає діапазону   *)
        
        "BUF".VARBUFOUT:="BUF".VARBUFIN;
        
        #DIVARCFG.PRM.ISALM := "BUF".VARBUFIN.PRM.%X0;
        #DIVARCFG.PRM.ISWRN := "BUF".VARBUFIN.PRM.%X1;
        #DIVARCFG.PRM.INVERSE := "BUF".VARBUFIN.PRM.%X2;
        #DIVARCFG.PRM.NRMVAL := "BUF".VARBUFIN.PRM.%X5;
        #DIVARCFG.PRM.QALENBL := "BUF".VARBUFIN.PRM.%X6;
        #DIVARCFG.PRM.DSBL := "BUF".VARBUFIN.PRM.%X7;
        #DIVARCFG.PRM.STATICMAP := "BUF".VARBUFIN.PRM.%X14;
        
        #DIVARCFG.T_FLTSP := "BUF".VARBUF.T_FLTSP;
        #DIVARCFG.T_DEASP := "BUF".VARBUF.T_DEALL;
        
        "BUF".VARBUFOUT.MSG:=200;
        IF NOT #DIVARCFG.PRM.STATICMAP THEN
            IF "BUF".VARBUFIN.CHID>=0 AND "BUF".VARBUFIN.CHID <= INT_TO_UINT("SYS".PLCCFG.DICNT) THEN
                IF "SYS".CHDI["BUF".VARBUFIN.CHID].VARID = 0 THEN
                    #DIVARCFG.CHID := "BUF".VARBUFIN.CHID;
                ELSIF "BUF".VARBUFIN.CHID <> #DIVARCFG.CHID THEN
                    "BUF".VARBUFOUT.MSG := 403;(* канал вже зайнятий*)
                END_IF;
            ELSE
                "BUF".VARBUFOUT.MSG := 404; (*номер каналу не відповідає діапазону*)
            END_IF;
        ELSIF "BUF".VARBUFIN.CHID <> #DIVARCFG.CHID THEN (* інакше вивести помилку активна статична адресація каналів *)
            "BUF".VARBUFOUT.MSG := 405;(* активна статична адресація каналів*)
        END_IF;
        
        "BUF".VARBUFIN.CMD :=0;
    END_IF;
```



## Тестування 

Загальні вимоги щодо тестування наведені в документі класи LVL1. Тут приводяться тільки особливі тести, що відрізняються від загальних.

### Перелік тестів

| Номер | Назва                                                        | Коли перевіряти          | Примітки |
| ----- | ------------------------------------------------------------ | ------------------------ | -------- |
| 1     | Присвоєння ID та CLSID при старті                            | після реалізації функції |          |
| 2     | Команди запису до буферу                                     | після реалізації функції |          |
| 3     | Зміна параметрів та запис з буфера                           | після реалізації функції |          |
| 4     | Зміни логічного номеру каналу                                | після реалізації функції |          |
| 5     | Запис значення CHID за замовченням при старті, при одинарній команді | після реалізації функції |          |
| 6     | Робота вбудованих лічильників часу                           | після реалізації функції |          |
| 7     | Вплив перекидування лічильника часу ПЛК на час кроку         | після реалізації функції |          |
| 8     | Алгоритм Ping-Pong                                           | після реалізації функції |          |
| 9     | Робота в нефорсованому режимі                                | після реалізації функції |          |
| 10    | Робота в форсованому режимі                                  | після реалізації функції |          |
| 11    | Відправка широкомовних команд на дефорсування                | після реалізації функції |          |
| 12    | Робота в режимі імітації                                     | після реалізації функції |          |
| 13    | Функція фільтрації                                           | після реалізації функції |          |
| 14    | Функція інвертування                                         | після реалізації функції |          |
| 15    | Функції тривог                                               | після реалізації функції |          |
| 16    | Виведення змінної з експлуатації                             | після реалізації функції |          |
|       |                                                              |                          |          |
|       |                                                              |                          |          |
|       |                                                              |                          |          |



### 1 Присвоєння ID та CLSID при старті

- перед запуском перевірки ПЛК повинен бути в СТОП
- після запуску усім технологічним змінним, використаним в програмі повинні бути присвоєні ID та CLSID



### 2 Команди прив'язування до буферу

| Номер | Дія для перевірки                                            | Очікуваний результат                                         | Примітки |
| ----- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| 1     | Змінити STA.X15:=1 для однієї зі змінних DIVAR_HMI           | у VARBUF повинно завантажитися весь зміст DIVAR_CFG<br />для DIVAR_HMI повинен STA.X15 = 0 <br />для DIVAR_HMI, DIVAR_CFG та VARBUF повинне STA.12(INBUF)=1 |          |
| 2     | Змінити значення фізичного каналу DICH до якого прив'язана технологічна змінна (наприклад форсувати) | відповідне значення зміниться у DIVAR_HMI, DIVAR_CFG та VARBUF |          |
| 3     | Змінити STA.X15:=1 для іншої змінної DIVAR_HMI               | у VARBUF повинно завантажитися весь зміст DIVAR_CFG іншої змінної |          |
| 4     | Змінити одне з конфігураційних полів в VARBUF, наприклад VARBUF.CHID, та виконайте команду запису в буфер (використовується для оновлення значень) VARBUF.CMD:=16#100 | змінена змінна VARBUF.CHID повинна змінитись на попереднє значення |          |



### 3 Зміна параметрів та запис з буфера

| Номер | Дія для перевірки                                            | Очікуваний результат                                         | Примітки |
| ----- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| 1     | Змінити STA.X15:=1 для однієї зі змінних DIVAR_HMI           | у VARBUF повинно завантажитися весь зміст DIVAR_CFG<br />для DIVAR_HMI повинен STA.X15 = 0 <br />для DIVAR_HMI, DIVAR_CFG та VARBUF повинне STA.12(INBUF)=1 |          |
| 2     | Змінити одне з конфігураційних полів в VARBUF, наприклад VARBUF.T_FLTSP, та виконайте команду запису з буфера VARBUF.CMD:=16#101 | в змінній DIVAR_CFG.T_FLTSP повинно відобразитись нове значення |          |
| 3     | Повторіть п.2 для іншого параметра                           |                                                              |          |
|       |                                                              |                                                              |          |

### 4 Зміни логічного номеру каналу

| Номер | Дія для перевірки                                            | Очікуваний результат                                         | Примітки |
| ----- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| 1     | Змінити STA.X15:=1 для однієї зі змінних DIVAR_HMI           | у VARBUF повинно завантажитися весь зміст DIVAR_CFG<br />для DIVAR_HMI повинен STA.X15 = 0 <br />для DIVAR_HMI, DIVAR_CFG та VARBUF повинне STA.12(INBUF)=1 |          |
| 2     | Змінити значення VARBUF.CHID на довільне значення  в межах існуючих фізичних каналів та на значення вільного каналу, <br />та виконайте команду запису з буфера VARBUF.CMD:=16#101 | в змінній DIVAR_CFG.CHID повинно відобразитись нове значення, а VARBUF.MSG повинна відобразити повідомлення про успішний запис параметра VARBUF.MSG = 200 |          |
| 3     | Змінити значення VARBUF.CHID на довільне значення  в межах існуючих фізичних каналів та на значення зайнятого каналу, <br />та виконайте команду запису з буфера VARBUF.CMD:=16#101 | в змінній DIVAR_CFG.CHID значення не повинно змінитись, VARBUF.CHID повинно повернутись до коректного значення, а VARBUF.MSG повинна відобразити повідомлення про помилку зайнятого каналу VARBUF.MSG = 403 |          |
| 4     | Змінити значення VARBUF.CHID на довільне значення  яке виходить за межі існуючих фізичних каналів, <br />та виконайте команду запису з буфера VARBUF.CMD:=16#101 | в змінній DIVAR_CFG.CHID значення не повинно змінитись, VARBUF.CHID повинно повернутись до коректного значення, а VARBUF.MSG повинна відобразити повідомлення про помилку неіснуючого каналу VARBUF.MSG = 404 |          |
| 5     | Активувати параметр статична адресація параметрів DIVAR_CFG.PRM.STATICMAP:=1, який унеможливлює зміну логічного номеру каналу. <br />Змінити значення VARBUF.CHID на довільне значення  в межах існуючих фізичних каналів та на значення вільного каналу, <br />та виконайте команду запису з буфера VARBUF.CMD:=16#101 | в змінній DIVAR_CFG.CHID значення не повинно змінитись, VARBUF.CHID повинно повернутись до попереднього значення, а VARBUF.MSG повинна відобразити повідомлення про статичну адресацію каналу VARBUF.MSG = 405 |          |
|       |                                                              |                                                              |          |
|       |                                                              |                                                              |          |



### 5 Запис значення CHID за замовченням при старті, при одинарній команді

- при старті
  - перед запуском перевірки ПЛК повинен бути в СТОП
  - після запуску для всіх технологічним змінним повинно записатись значення в CHID та CHIDDF
- при одинарній команді

| Номер | Дія для перевірки                                            | Очікуваний результат                                         | Примітки |
| ----- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| 1     | Змінити STA.X15:=1 для однієї зі змінних DIVAR_HMI           | у VARBUF повинно завантажитися весь зміст DIVAR_CFG<br />для DIVAR_HMI повинен STA.X15 = 0 <br />для DIVAR_HMI, DIVAR_CFG та VARBUF повинне STA.12(INBUF)=1 |          |
| 2     | Змінити значення VARBUF.CHID на довільне значення  в межах існуючих фізичних каналів та на значення вільного каналу, <br />та виконайте команду запису з буфера VARBUF.CMD:=16#101 | в змінній DIVAR_CFG.CHID повинно відобразитись нове значення, а VARBUF.MSG повинна відобразити повідомлення про успішний запис параметра VARBUF.MSG = 200 |          |
| 3.    | виконайте команду записати значення за замовченням VARBUF.CMD:=16#102 | в змінній DIVAR_CFG.CHID повинно відобразитись значення яке було збережено в DIVAR_CFG.CHIDDF |          |
|       |                                                              |                                                              |          |



### 6 Робота вбудованих лічильників часу

Плинний час кроку для змінної `DIVAR_CFG` відображається в `DIVAR_CFG.T_STEP1`. Значення відображається в мс. Точність `DIVAR_CFG.T_STEP1` перевіряється астрономічним годинником. 



### 7 Вплив перекидування лічильника часу ПЛК на час кроку

| Номер | Дія для перевірки                                            | Очікуваний результат                                         | Примітки |
| ----- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| 1     | переглянути як змінюється змінна PLCCFG.TQMS та DIVAR1.T_STEP1 , точність оцінити за допомогою астрономічним годинником | PLCCFG.TQMS та DIVAR1.T_STEP1 рахують час в мс               |          |
| 2     | в PLCCFG.TQMS записати значення   16#FFFF_FFFF - 5000 (5000 мс до кінця діапазону)  та в DIVAR1.T_STEP1 записати значення 16#7FFF_FFFF - 10000 (10000 мс до кінця діапазону) | певний час (5000 мc) час буде рахуватись в звичайному вигляді, але коли PLCCFG.TQMS досягне верху діапазону(16#FFFF_FFFF), то PLCCFG.TQMS почне рахувати з початку, а DIVAR1.T_STEP1 рахуватиме в нормальному режимі поки не прийме максимальне значення свого діапазону (16#7FFFFFFF) і відлік для нього зупиниться |          |
| 3     | Змінити значення фізичного каналу DICH до якого прив'язана технологічна змінна (наприклад форсувати) | DIVAR1.T_STEP1 почне рахувати час з початку                  |          |
|       |                                                              |                                                              |          |



### 8 Алгоритм Ping-Pong

| Номер | Дія для перевірки                                            | Очікуваний результат                                         | Примітки |
| ----- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| 1     | Перевірити значення фізичного каналу CHDI.VARID до якого прив'язана тестова зміна DIVAR1 | в CHDI.VARID повинно відображатись DIVAR1.ID, CHDI.STA_ULNK=1 та DIVAR1.STA.DLNK=1 |          |
| 2     | Записати значення DIVAR1.CHID:=0                             | значення DIVAR1.STA.DLNK=0 - змінна не прив'язана до технологічного каналу, <br />CHDI.VARID = 0 та CHDI.STA_ULNK=0 до канала не прив'язано технологічну змінну |          |
| 3     | Записати попереднє значення в DIVAR1.CHID                    | в CHDI.VARID повинно відображатись DIVAR1.ID, CHDI.STA_ULNK=1 та DIVAR1.STA.DLNK=1 |          |
| 4     | повторити попередні пункти для іншої технологічної змінної   |                                                              |          |



### 9 Робота в нефорсованому режимі

| Номер | Дія для перевірки                                            | Очікуваний результат                                         | Примітки |
| ----- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| 1     | Змінити STA.X15:=1 для однієї зі змінних DIVAR_HMI           | у VARBUF повинно завантажитися весь зміст DIVAR_CFG<br />для DIVAR_HMI повинен STA.X15 = 0 <br />для DIVAR_HMI, DIVAR_CFG та VARBUF повинне STA.12(INBUF)=1 |          |
| 2     | Змінити значення фізичного каналу DICH до якого прив'язана технологічна змінна (наприклад форсувати) | відповідне значення зміниться у DIVAR_HMI, DIVAR_CFG та VARBUF |          |
| 3     | Змінити значення фізичного каналу DICH до якого прив'язана технологічна змінна на протилежне (наприклад форсувати) | відповідне значення зміниться у DIVAR_HMI, DIVAR_CFG та VARBUF |          |
|       |                                                              |                                                              |          |



### 10 Робота в форсованому режимі

| Номер | Дія для перевірки                                            | Очікуваний результат                                         | Примітки                                   |
| ----- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------ |
| 1     | Змінити STA.X15:=1 для однієї зі змінних DIVAR_HMI           | у VARBUF повинно завантажитися весь зміст DIVAR_CFG<br />для DIVAR_HMI повинен STA.X15 = 0 <br />для DIVAR_HMI, DIVAR_CFG та VARBUF повинне STA.12(INBUF)=1 |                                            |
| 2     | Відправити команду форсування VARBUF.CMD=16#0301             | біт STA.FRC повинен дорівнювати 1                            |                                            |
| 3     | Змінити значення фізичного каналу DICH до якого прив'язана технологічна змінна (наприклад форсувати) | відповідне значення у DIVAR_HMI, DIVAR_CFG та VARBUF не повинно змінюватись |                                            |
| 4     | Відправити команду 16#0001 (записати 1)                      | значення STA.VALB повинно змінитися на 1                     |                                            |
| 5     | Відправити команду 16#0002 (записати 0)                      | значення STA.VALB повинно змінитися на 0                     |                                            |
| 6     | Відправити команду 16#0003 (TOGGLE)                          | значення STA.VALB повинно змінитися на ПРОТИЛЕЖНЕ            |                                            |
| 7     | Змінити значення `DIVAR_CFG.VALI`                            | значення повинно змінитися на вказане                        | для дискретних, все що більше 0 дорвінює 1 |
| 8     | Відправити команду дефорсування VARBUF.CMD=16#0302           | біт STA.FRC повинен дорівнювати 0, STA.VALB повинен прийняти значення з фізичного каналу |                                            |
| 9     | Відправити команду перемикання форсування 16#0300, повторити кілька разів, залишити в режимі форсування | біт STA.FRC повинен перемкнутися на протилежне               |                                            |
| 10    | Перевести в режим форсування кілька змінних                  | біт STA.FRC відповідних змінних повинен дорівнювати 1        |                                            |
| 11    | Перевірити значення змінних PLC.STA_PERM і PLC.CNTFRC_PERM   | повинні PLC.STA_PERM.X11=1,  PLC.CNTFRC_PERM дорівнювати кількості зафорсованих змінних |                                            |
| 12    | Зняти з режиму форсування усі змінні                         | повинні PLC.STA_PERM.X11=0,  PLC.CNTFRC_PERM=0               |                                            |
|       |                                                              |                                                              |                                            |
|       |                                                              |                                                              |                                            |
|       |                                                              |                                                              |                                            |
|       |                                                              |                                                              |                                            |



### 11 Відправка широкомовних команд на дефорсування

| Номер кроку | Дія для перевірки                                            | Очікуваний результат                                         | Примітки |
| ----------- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| 1           | Перевести в режим форсування кілька змінних                  | біт STA.FRC відповідних змінних повинен дорівнювати 1        |          |
| 2           | Перевірити значення змінних PLC.STA_PERM і PLC.CNTFRC_PERM   | повинні PLC.STA_PERM.X11=1,  PLC.CNTFRC_PERM дорівнювати кількості зафорсованих змінних |          |
| 3           | відправити широкомовну команду на дефорсування усіх змінних PLC.CMD=16#4302 | біт STA.FRC усіх змінних повинен дорівнювати 0, PLC.CNTFRC_PERM=0 |          |



### 12 Робота в режимі імітації

| Номер | Дія для перевірки                                            | Очікуваний результат                                         | Примітки |
| ----- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| 1     | Змінити STA.X15:=1 для однієї зі змінних DIVAR_HMI           | у VARBUF повинно завантажитися весь зміст DIVAR_CFG<br />для DIVAR_HMI повинен STA.X15 = 0 <br />для DIVAR_HMI, DIVAR_CFG та VARBUF повинне STA.12(INBUF)=1 |          |
| 2     | Відправити команду ввімкнення імітації VARBUF.CMD=16#0311    | біт STA.SML повинен дорівнювати 1                            |          |
| 3     | Змінити значення фізичного каналу DICH до якого прив'язана технологічна змінна (наприклад форсувати) | відповідне значення у DIVAR_HMI, DIVAR_CFG та VARBUF не повинно змінюватись |          |
| 4     | Змінити значення DIVAR_CFG.STA.VALB на 1                     | відповідне значення зміниться у DIVAR_HMI та VARBUF, а значення з DICH буде ігноруватись |          |
| 5     | Перевірити значення змінних PLC.STA_PERM                     | біт про наявність імітованих об'єктів PLC.STA_PERM.X14=1     |          |
| 6     | Відправити команду вимкнення імітації VARBUF.CMD=16#0312     | біт STA.SML повинен дорівнювати 0<br />DIVAR_CFG.STA.VALB прийме значення таке ж як і DICH |          |
| 7     | Перевірити значення змінних PLC.STA_PERM                     | біт про наявність імітованих об'єктів PLC.STA_PERM.X14=0     |          |
|       |                                                              |                                                              |          |
|       |                                                              |                                                              |          |
|       |                                                              |                                                              |          |



### 13 Функція фільтрації

| Номер | Дія для перевірки                                            | Очікуваний результат                                         | Примітки |
| ----- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| 1     | Змінити значення часу фільтрації для тестової змінної DIVAR_CFG.T_FLT на 10000 мс |                                                              |          |
| 2     | Змінити значення фізичного каналу DICH до якого прив'язана технологічна змінна (наприклад форсувати) на 1 | біт DIVAR_CFG.STA.VALR прийме значення 1, біт DIVAR_CFG.STA.VALB залишиться рівним 0, час кроку DIVAR_CFG.T_STEP1 онулиться і почне відлік з початку. Коли час кроку стане більшим за час фільтрації біт DIVAR_CFG.STA.VALB прийме значення 1 |          |
| 3     | Змінити значення фізичного каналу DICH до якого прив'язана технологічна змінна (наприклад форсувати) на 0 | біт DIVAR_CFG.STA.VALR прийме значення 0, біт DIVAR_CFG.STA.VALB залишиться рівним 1, час кроку DIVAR_CFG.T_STEP1 онулиться і почне відлік з початку. Коли час кроку стане більшим за час фільтрації біт DIVAR_CFG.STA.VALB прийме значення 0 |          |
| 4     | Змінити значення часу фільтрації для тестової змінної DIVAR_CFG.T_FLT на інше і повторити п.2-п.3 |                                                              |          |
|       |                                                              |                                                              |          |
|       |                                                              |                                                              |          |
|       |                                                              |                                                              |          |



### 14 Функція інвертування

| Номер | Дія для перевірки                                            | Очікуваний результат                                         | Примітки |
| ----- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| 1     | Змінити значення фізичного каналу DICH до якого прив'язана тестова змінна (наприклад форсувати) на 1 | біт DIVAR_CFG.STA.VALR прийме значення 1, по проходженню часу фільтрації біт DIVAR_CFG.STA.VALB прийме значення 1 |          |
| 2     | Змінити значення фізичного каналу DICH до якого прив'язана тестова змінна (наприклад форсувати) на 0 | біт DIVAR_CFG.STA.VALR прийме значення 0, по проходженню часу фільтрації біт DIVAR_CFG.STA.VALB прийме значення 0 |          |
| 3     | Змінити параметр "інвертувати сире значення" DIVAR_CFG.PRM.INVERSE на 1 | біт DIVAR_CFG.STA.VALR залишиться в 0, а біт DIVAR_CFG.STA.VALB прийме значення 1 |          |
| 4     | Змінити значення фізичного каналу DICH до якого прив'язана тестова змінна (наприклад форсувати) на 1 | біт DIVAR_CFG.STA.VALR прийме значення 1, по проходженню часу фільтрації біт DIVAR_CFG.STA.VALB прийме значення 0 |          |
| 5     | Змінити значення фізичного каналу DICH до якого прив'язана тестова змінна (наприклад форсувати) на 0 | біт DIVAR_CFG.STA.VALR прийме значення 0, по проходженню часу фільтрації біт DIVAR_CFG.STA.VALB прийме значення 1 |          |
| 6     | Змінити параметр "інвертувати сире значення" DIVAR_CFG.PRM.INVERSE на 0 | біт DIVAR_CFG.STA.VALR залишиться в 0, а біт DIVAR_CFG.STA.VALB прийме значення 0 |          |
|       |                                                              |                                                              |          |



### 15 Функції тривог

| Номер | Дія для перевірки                                            | Очікуваний результат                                         | Примітки |
| ----- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| 1     | Змінити параметр DIVAR_CFG.PRM.ISALM на 1 та виставити параметр затримки тривоги DIVAR_CFG.T_DEASP на 100 (параметр задається в 0.1 с) який еквівалентний затримці 10 с | біт DIVAR_CFG.STA.ISALM прийме значення 1                    |          |
| 2     | Змінити значення фізичного каналу DICH до якого прив'язана тестова змінна (наприклад форсувати) на 1 | біт DIVAR_CFG.STA.VALR прийме значення 1, по проходженню часу фільтрації біт DIVAR_CFG.STA.VALB прийме значення 1 і при проходженню часу затримки тривоги біт DIVAR_CFG.STA.ALM прийме значення 1 |          |
| 3     | Змінити значення фізичного каналу DICH до якого прив'язана тестова змінна (наприклад форсувати) на 0 | біт DIVAR_CFG.STA.VALR прийме значення 0, по проходженню часу фільтрації біт DIVAR_CFG.STA.VALB прийме значення 0 і відразу біт DIVAR_CFG.STA.ALM прийме значення 0 |          |
| 4     | Змінити параметр DIVAR_CFG.PRM.ISALM на 0                    | біт DIVAR_CFG.STA.ISALM прийме значення 0                    |          |
| 5     | Змінити значення фізичного каналу DICH до якого прив'язана тестова змінна (наприклад форсувати) на 1 | біт DIVAR_CFG.STA.VALR прийме значення 1, по проходженню часу фільтрації біт DIVAR_CFG.STA.VALB прийме значення 1, біт DIVAR_CFG.STA.ALM залишиться рівним 0 |          |
| 6     | Змінити параметр DIVAR_CFG.PRM.ISALM на 1 та змінити параметр DIVAR_CFG.PRM.NRMVAL на 1 | біт DIVAR_CFG.STA.ISALM прийме значення 1, DIVAR_CFG.STA.ALM залишиться рівним 1 |          |
| 7     | Змінити значення фізичного каналу DICH до якого прив'язана тестова змінна (наприклад форсувати) на 0 | біт DIVAR_CFG.STA.VALR прийме значення 0, по проходженню часу фільтрації біт DIVAR_CFG.STA.VALB прийме значення 0 і при проходженню часу затримки тривоги біт DIVAR_CFG.STA.ALM прийме значення 1 |          |
| 8     | змінити параметр DIVAR_CFG.PRM.NRMVAL на 0                   | DIVAR_CFG.STA.ALM прийме значення 0                          |          |
| 9     | Повторити п1-п8 для параметра DIVAR_CFG.PRM.ISWRN            |                                                              |          |
|       |                                                              |                                                              |          |
|       |                                                              |                                                              |          |



### 16 Виведення змінної з експлуатації

| Номер | Дія для перевірки                                            | Очікуваний результат                                         | Примітки |
| ----- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| 1     | Змінити параметр DIVAR_CFG.PRM.ISALM на 1 та виставити параметр затримки тривоги DIVAR_CFG.T_DEASP на 100 (параметр задається в 0.1 с) який еквівалентний затримці 10 с | біт DIVAR_CFG.STA.ISALM прийме значення 1                    |          |
| 2     | Змінити параметр DIVAR_CFG.PRM.DSBL на 1                     | біт DIVAR_CFG.STA.ENBL прийме значення 0, змінна прийме крок DIVAR_CFG.STEP1 = 400 , а час кроку DIVAR_CFG.T_STEP1 онулиться і припинить відлік |          |
| 3     | Змінити значення фізичного каналу DICH до якого прив'язана тестова змінна (наприклад форсувати) на 1 | біт DIVAR_CFG.STA.VALR прийме значення 1, відразу (без затримки часу на фільтрацію) біт DIVAR_CFG.STA.VALB прийме значення 1, біт DIVAR_CFG.STA.ALM залишиться рівним 0  навіть по проходженню часу затримки тривоги. |          |
| 4     | Змінити параметр "інвертувати сире значення" DIVAR_CFG.PRM.INVERSE на 1 | біт DIVAR_CFG.STA.VALR залишиться в 1, біт DIVAR_CFG.STA.VALB також залишиться в значенні 1 |          |
| 5     | Змінити параметр DIVAR_CFG.PRM.DSBL на 0                     | біт DIVAR_CFG.STA.ENBL прийме значення 1, час кроку DIVAR_CFG.T_STEP1 почне відлік часу кроку.<br />біт DIVAR_CFG.STA.VALR залишиться в 1, після проходження часу фільтрації біт DIVAR_CFG.STA.VALB прийме значення 0 |          |
| 6     | Змінити значення фізичного каналу DICH до якого прив'язана тестова змінна (наприклад форсувати) на 0 | біт DIVAR_CFG.STA.VALR прийме значення 0, по проходженню часу фільтрації біт DIVAR_CFG.STA.VALB прийме значення 1 і при проходженню часу затримки тривоги біт DIVAR_CFG.STA.ALM прийме значення 1 |          |
|       |                                                              |                                                              |          |
|       |                                                              |                                                              |          |
|       |                                                              |                                                              |          |
