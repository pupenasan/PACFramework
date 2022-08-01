## Клас  DRV: двигуни

**CLSID=16#204x**

## Загальний опис

Клас реалізовує функції оброблення виконавчого механізму типу двигун з дискретним керуванням та з аналоговим керуванням. Запуск та зупин відбувається за допомогою дискретних виходів, а керування швидкістю чи частотою відбувається за допомогою аналогових виходів. До цих функцій входить переключення режимів роботи ВМ, керування виконавчим механізмом, налаштування та обробка тривожних подій, керування імітацією, поширення станів до та від підлеглих технологічних змінних та ін..        

Функція класів розрахована для:

- двигуни з дискретним керуванням (CLSID=16#2040): одна вихідна дискретна змінна на двигун "запустити";
- двигуни з дискретним та аналоговим керуванням (CLSID=16#2041) одна вихідна дискретна змінна на двигун "запустити" та одна аналогова вихідна змінна заданої швидкості чи частоти. 

Режим визначається автоматично при наявності 0-го індексу або параметра відключення у вихідній аналоговій змінній.

Не залежно від класу двигуни можуть функціонувати з дискретним датчиком сигналу роботи та аналоговим датчиком швидкості чи частоти. Наявність конкретних датчиків визначається автоматично при наявності 0-го індексу або параметра відключення технологічної змінної.

## Загальні вимоги до функцій DRV

### Функціональні вимоги 

Датчики та сигнали керування ВМ подаються як змінні DIVAR, AIVAR та DOVAR? AOVAR; ті які не використовуються – подаються як пусті (з індексом 0); наявність/відсутність певних датчиків сигналів керування означується параметрами.
Функція класів розрахована для:

- двигуни з дискретним керуванням (CLSID=16#2040): одна вихідна дискретна змінна на двигун "запустити";
- двигуни з дискретним та аналоговим керуванням (CLSID=16#2041) одна вихідна дискретна змінна на двигун "запустити" та одна аналогова вихідна змінна заданої швидкості чи частоти. 

#### Режими роботи

передбачено наступні режими керування ВМ:

- ручний - керування відбувається оператором за допомогою засобів SCADA/HMI;
- автоматичний - керування відбувається відповідно до алгоритмів запрограмованого в системі керування;
- місцевий - керування відбувається оператором за допомогою кнопок та перемикачів по місцю;

У автоматичному незаблокованому режимі, значення вихідних змінних на ВМ змінюється алгоритмом тільки при наявності відповідних команд з програм.  У ручному або заблокованому режимі, виходи міняються тільки командами з HMI (може змінитися в залежності від вимог процесу). У автоматичному режимі, завдання швидкості чи частоти для ВМ змінюється алгоритмом відповідно до програми керування. У ручному режимі, завдання змінюється тільки відповідно до значення з HMI. 

#### Конфігурування ВМ 

Передбачаються два режими конфігурування (MANCFG): 

- ручне
- автоматичне. 

У ручному режимі тип двигуна та наявність датчиків задається бітовими параметрами:

- PRM_ALMENBL - є зовнішній вхід - сигнал аварії від приводу;
- PRM_ZWRKENBL - є звонішній вхід - зворотній звязок про роботу;
- PRM_ZPOSENBL - є аналоговий зворотній звязок частоти/позиції;
- PRM_PWRENBL - є звонішній вхід по стану живлення;
- PRM_BTNSTPENBL - є зовнішній вхід - включена кнопка STOP;
- PRM_SELLCLENBL - є зовнішній вхід - сигнал включення місцевого керування;

У автоматичному режимі ці параметри змінюються автоматично при прив'язці до змінних з ID=0 або їх підключеності. 

Таким чином, наприклад, при виходу з ладу датчика про зворотній звязок, його можна тимчасово відключити в конфігурації (вивести з експлуатації для відключення генерування тривог), і двигун автоматично перейде в режим роботи без даного датчика. 

Ручне конфігурування типу двигуна поки не знайшло свого використання.

#### Оброблення тривог

Для ВМ типу DRV передбачено відслідковування наступних типів тривог

- ALMSTRT - Не включився (скидається при зміні команди або стану) датчика);
- ALMSTP - Не відключився (скидається при зміні команди або стану) датчика);
- ALMSHFT - Порушення стану;
- ALMINVRTR - помилка перетворювача частоти;
- ALMPWR1 - відсутнє живлення контактора;
- ALM - помилка ВМ, виникає при появі будь якої тривоги ВМ;
- WRN - попередження ВМ, виникає при появі будь якого попередження ВМ (на даний момент не реалізовано ніяких попереджень ВМ);

#### Оброблення статистичної інформації

Для ВМ типу DRV передбачено відслідковування наступного типу статистичної інформації 

- кількість перестановок;
- кількість тривог;
- загальний час напрацювання;
- час роботи з останнього пуску;

Статистична інформація скидається при проходженні відповідних команд.

## Рекомендації щодо використання в HMI

Приклад налаштування функцій двигуна на HMI наведений на рис.

![](media\2_15.png)

Рис. Приклад налаштування функцій двигуна на HMI.



## Загальні вимоги щодо структури змінних класів

#### DRV_HMI

Тут і далі `adr` задається як зміщення в структурі в 16-бітних словах

| name | type | adr  | bit  | descr                                              |
| ---- | ---- | ---- | ---- | -------------------------------------------------- |
| STA  | UINT | 0    |      | біти станів                                        |
| CMD  | UINT | 1    |      | команда керування                                  |
| ALM  | Int  | 2    |      | біти тривог                                        |
| SPD  | Int  | 3    |      | швидкість/частота ВМ (0-10000) - зворотній зв'язок |
| CSPD | REAL | 4    |      | швидкість/частота ВМ (0-100%) - задане значення    |

#### DRV_CFG

| name         | type      | adr  | bit  | Опис                                                         |
| ------------ | --------- | ---- | ---- | ------------------------------------------------------------ |
| ID           | UINT      | 0    |      | унікальний ідентифікатор ВМ                                  |
| CLSID        | UINT      | 1    |      | ідентифікатор класу ВМ                                       |
| STA          | UINT      | 2    |      | біти станів, може бути задіяна як структура DRV_STA          |
| STA_b0       | BOOL      | 2    | 0    | реверс                                                       |
| STA_b1       | BOOL      | 2    | 1    | реверс                                                       |
| STA_MAINT    | BOOL      | 2    | 2    | =1 виведений з обслуговування                                |
| STA_STOPING  | BOOL      | 2    | 3    | =1 Зупиняється                                               |
| STA_STRTING  | BOOL      | 2    | 4    | =1 Запускається                                              |
| STA_STOPED   | BOOL      | 2    | 5    | =1 Зупинений                                                 |
| STA_ISANALOG | BOOL      | 2    | 6    | =1 з аналоговим керуванням (для зручності відображення)      |
| STA_ISREVERS | BOOL      | 2    | 7    | =1 - пуск з реверсом                                         |
| STA_WRKED    | BOOL      | 2    | 8    | =1 В роботі                                                  |
| STA_DISP     | BOOL      | 2    | 9    | =1 дистанційний режим (з ПК/ОП) (16#0200)                    |
| STA_MANBX    | BOOL      | 2    | 10   | =1 Ручний зі щита (за зворотнім зв'язком)                    |
| STA_INIOTBUF | BOOL      | 2    | 11   | =1 - змінна в IOT буфері                                     |
| STA_INBUF    | BOOL      | 2    | 12   | =1 - змінна в буфері                                         |
| STA_FRC      | BOOL      | 2    | 13   | =1 хоча би одна зі змінних в об’єкті форсована (для зручності відображення при наладці) |
| STA_SML      | BOOL      | 2    | 14   | =1 режим симуляції                                           |
| STA_BLCK     | BOOL      | 2    | 15   | =1 Заблокований                                              |
| ALM          | UINT      | 3    |      | біти тривог, може бути задіяна як структура DRV_ALM          |
| ALMSTRT      | BOOL      | 3    | 0    | =1 Не включився (скидається при зміні команди або стану) датчика) |
| ALMSTP       | BOOL      | 3    | 1    | =1 Не відключився (скидається при зміні команди або стану) датчика) |
| ALMSHFT      | BOOL      | 3    | 2    | =1 Порушення стану                                           |
| ALMINVRTR    | BOOL      | 3    | 3    | =1 помилка перетворювача частоти                             |
| ALMPWR1      | BOOL      | 3    | 4    | =1 відсутнє живлення контактора                              |
| ALM_b5       | BOOL      | 3    | 5    | резерв                                                       |
| ALM          | BOOL      | 3    | 6    | =1 Помилка приводу (по OR)                                   |
| WRN          | BOOL      | 3    | 7    | =1 Попередження приводу (по OR)                              |
| ALMBELL      | BOOL      | 3    | 8    | =1 Команда включення дзвоника (на один цикл ПЛК)             |
| ALM_b9       | BOOL      | 3    | 9    | резерв                                                       |
| ALM_b10      | BOOL      | 3    | 10   | резерв                                                       |
| ALM_b11      | BOOL      | 3    | 11   | резерв                                                       |
| ALM_b12      | BOOL      | 3    | 12   | резерв                                                       |
| ALM_b13      | BOOL      | 3    | 13   | резерв                                                       |
| ALM_b14      | BOOL      | 3    | 14   | резерв                                                       |
| ALM_b15      | BOOL      | 3    | 15   | резерв                                                       |
| CMD          | ACTTR_CMD | 4    |      | бітові команди                                               |
| PRM          | ACTTR_PRM | 6    |      | біти параметрів                                              |
| SPD          | REAL      | 8    |      | швидкість/частота ВМ (0-100%) - зворотній зв'язок            |
| CSPD         | REAL      | 10   |      | швидкість/частота ВМ (0-100%) - задане значення              |
| T_DEASP      | UINT      | 12   |      | Час затримки тривоги в 0.1 секунди                           |
| STEP1        | UINT      | 13   |      | номер кроку                                                  |
| CNTPER       | UINT      | 14   |      | Кількість змін положення                                     |
| CNTALM       | UINT      | 15   |      | Кількість аварій                                             |
| T_STEP1      | UDINT     | 16   |      | Плинний час кроку в мс                                       |
| T_PREV       | UDINT     | 18   |      | час в мс з попереднього виклику, береться зі структури PLC_CFG.TQMS |
| TQ_TOTAL     | UDINT     | 20   |      | Загальний час напрацювання в хв                              |
| TQ_LAST      | UDINT     | 22   |      | Час роботи з останнього пуску в с                            |

#### Команди 

| Атрибут | Тип  | Біт  | Опис                                                         |
| ------- | ---- | ---- | ------------------------------------------------------------ |
| CMD     | UINT |      | Команди:<br />16#0001: відкрити<br/>16#0002: закрити<br/>16#0003: перемкнути<br/>16#0004: підтвердити тривогу<br/>16#0005: скинути тривоги<br/>16#0006: заблокувати<br/>16#0007: розблокувати<br/>16#0008: зупинити автоналаштування<br/>16#0009: запустити автоналаштування<br/>16#000A: включити алгоритм захисту<br/>16#000B: дозвіл на керування<br/>16#000C: дозвіл на керування по наявності тиску в системі<br/>16#000D: запуск калібрування датчика шивдкості<br/> E..10 - вільні<br/>16#0011: запустити<br/>16#0012: зупинити<br/>16#0013: включити реверс<br/>14-20 - вільні<br/>16#0021: більше<br/>16#0022: менше<br/>23-9F - вільні<br/>16#0100: прочитати конфігурацію<br/>16#0101: записати конфігурацію<br/>102-2FF вільні<br/>16#0300: перемкнути ручний/автомат<br/>16#0301: включити ручний режим<br/>16#0302: включити автоматичний режим<br/>16#0313: включити місцевий режим<br/>16#0314: відключити місцевий режим<br/>16#0315: вивести з експлуатації<br/>16#0316: ввести в експлуатацію<br/>316..400 - вільні<br/>16#0401: скинути лічильник тривог <br/>16#0402: скинути лічильник спрацювань/переміщень <br/>16#0403: скинути лічильник спрацювань/переміщень <br/>16#0404: скинути лічильник спрацювань/переміщень <br/> |



## Робота з буфером

Повинна бути реалізована функція роботи з класичним буфером.

- Буфер рекомендується використовувати один для всіх типів ВМ.

- Факт зайнятості буфера перевіряється за рівністю ідентифікатора класу `CLSID` та ідентифікатора ВМ `ID`

- при захопленні буферу:

  - `ACTBUF.STA = ACTTR_CFG.STA`
  - `ACTTR_CFG.CMD = ACTBUF.CMD`  якщо той не дорівнює нулю (для можливості команд з іншого джерела)

- конфігурація ВМ повинна зчитуватися в буфер при отриманні команд:

  - оновлення технологічної змінної, яка вже записана в буфер`ACTTR_HMI.CMD` = 16#0100; 

- конфігурація ВМ повинна записуватись з буфера при отриманні команд:

  - `ACTBUF.CMD` = 16#0101; 	

  

Повинна бути реалізована функція роботи з параметричними двунаправленими буферами ACTBUFIN<->ACTBUFOUT.

- Використовується 2 буфери: 
  - вхідний `ACTBUFIN` - використовується для обробки команд (при рівності CLSID та ID) та запису інформації в ВМ 
  - вихідний `ACTBUFOUT` - використовується для зчитування інформації з ВМ при отриманні команди на читання з `ACTBUFIN`
- Буфери рекомендується використовувати одну пару для всіх ВМ.
- Факт зайнятості буфера не можливий, оскільки буфер реалізований через 2 буферні змінні ACTBUFIN та ACTBUFOUT через які інформація проходить для подальшої передачі її в ВМ або внутрішній буфер засобу HMI (по аналогії з параметричним обміном PKW в профілі PROFIDRIVE)
- конфігурація ВМ повинна зчитуватися в вихідний буфер при:
  - рівності класів `ACTTR_CFG.CLSID=ACTBUFIN.CLSID` , ідентифікаторів `ACTCFG.ID=ACTBUFIN.ID` та отримання команди з вхідного буфера `ACTBUFIN.CMD=16#100 `
- конфігурація ВМ повинна записуватись з вхідного буфера при:
  - рівності класів `ACTTR_CFG.CLSID=ACTBUFIN.CLSID` , ідентифікаторів `ACTTR_CFG.ID=ACTBUFIN.ID` та отримання команди з вхідного буфера `ACTBUFIN.CMD=16#101 `



## Вимоги щодо реалізації інтерфейсу

У інтерфейс повинні передаватися наступні параметри:

- DRVCFG - INOUT
- DRVHMI - INOUT
- технологічні змінні датчиків ВМ (датчики кінцевих положень, кнопки по місцю і т.д.) - INOUT
- технологічні змінні виходів ВМ (соленоїд, пускачі і т.д.) - INOUT

За умови, що немає можливості доступатися до зовнішніх змінних з середини функцій, передається `PLC_CFG`, `ACTBUF`,  `ACTBUFIN`, `ACTBUFOUT` ; альтернативно можна використовувати інші інтерфейси для використання в середині `PLC_CFG` 



## Ініціалізація ВМ при першому циклі роботи

Запис ID, CLSID за замовченням виконується в результаті виконання програмної секції `initvars`. 

Для кожної технологічної змінної в `initvars` повиннен бути наступний фрагмент програми для запису ID, CLSID

```
"ACT".DRV.ID:=30001;   "ACT".DRV.CLSID:=16#2040;
```

Також виконується ініціалізація всередині функції обробки ВМ, в результаті

- якщо уставка затримки часу тривоги не виставлена присвоюється `DRV.T_DEASP := 200; ` 
- технологічні тривоги для датчиків не використовуються, наприклад  `RUN.PRM.ISALM := false; RUN.PRM.ISWRN := false;`



## Вимоги щодо реалізації програми користувача

- Функції обробки ВМ повинні викликатися з кожним викликом тієї задачі, до якої вони прив'язані.
- При першому старті (`PLC_CFG.SCN1`) повинні ініціалізуватися ідентифікатори ВМ та ідентифікатори класів, 

Реалізація програми функцій обробки ВМ складається з наступних етапів:

#### `DRV_to_ACT` 

зчитування інформації з змінної яка відповідає типу ВМ до змінної типу універсального ВМ - виконується для зручності і уніфікації подальшої обробки, виконується функцією `DRV_to_ACT` 

У інтерфейс повинні передаватися наступні параметри:

- DRVCFG - INOUT - конфігураційна змінна ВМ
- DRVHMI - INOUT - HMI змінна ВМ
- ACTCFG - INOUT - тип універсального ВМ, використовується для внутрішньої обробки для універсалізації

За умови, що немає можливості доступатися до зовнішніх змінних з середини функцій, передається `PLC_CFG`, `ACTBUF`,  `ACTBUFIN`, `ACTBUFOUT` ; альтернативно можна використовувати інші інтерфейси для використання в середині `PLC_CFG` 

```pascal
#ACTCFG.ID:=      #DRVCFG.ID;
#ACTCFG.CLSID:=   #DRVCFG.CLSID;
#ACTCFG.CMD:=     #DRVCFG.CMD;
#ACTCFG.PRM:=     #DRVCFG.PRM;
#ACTCFG.T_DEASP:= #DRVCFG.T_DEASP;
#ACTCFG.POS:=  #DRVCFG.SPD;
#ACTCFG.CPOS:=  #DRVCFG.CSPD;
#ACTCFG.STEP1:=   #DRVCFG.STEP1;
#ACTCFG.CNTPER:=  #DRVCFG.CNTPER;
#ACTCFG.CNTALM:=  #DRVCFG.CNTALM;
#ACTCFG.T_STEP1:= #DRVCFG.T_STEP1;
#ACTCFG.T_PREV:=  #DRVCFG.T_PREV;
#ACTCFG.TQ_TOTAL:=#DRVCFG.TQ_TOTAL;
#ACTCFG.TQ_LAST:= #DRVCFG.TQ_LAST;


#ACTCFG.STA.MAINT :=   #DRVCFG.STA.MAINT;
#ACTCFG.STA.STOPING:=  #DRVCFG.STA.STOPING;
#ACTCFG.STA.STRTING:=  #DRVCFG.STA.STRTING;
#ACTCFG.STA.STOPED:=   #DRVCFG.STA.STOPED;
#ACTCFG.STA.ISANALOG:= #DRVCFG.STA.ISANALOG;
#ACTCFG.STA.ISREVERS:= #DRVCFG.STA.ISREVERS;
#ACTCFG.STA.WRKED:=    #DRVCFG.STA.WRKED;
#ACTCFG.STA.DISP:=     #DRVCFG.STA.DISP;
#ACTCFG.STA.MANBX:=    #DRVCFG.STA.MANBX;
#ACTCFG.STA.INIOTBUF:= #DRVCFG.STA.INIOTBUF;
#ACTCFG.STA.INBUF:=    #DRVCFG.STA.INBUF;
#ACTCFG.STA.FRC:=      #DRVCFG.STA.FRC;
#ACTCFG.STA.SML:=      #DRVCFG.STA.SML;
#ACTCFG.STA.BLCK:=     #DRVCFG.STA.BLCK;

#ACTCFG.ALM.ALMSTRT:=  #DRVCFG.ALM.ALMSTRT;
#ACTCFG.ALM.ALMSTP :=  #DRVCFG.ALM.ALMSTP;
#ACTCFG.ALM.ALMSHFT:=  #DRVCFG.ALM.ALMSHFT;
#ACTCFG.ALM.ALMBELL:=  #DRVCFG.ALM.ALMINVRTR;
#ACTCFG.ALM.ALMPWR1:=  #DRVCFG.ALM.ALMPWR1;
#ACTCFG.ALM.ALM    :=  #DRVCFG.ALM.ALM;
#ACTCFG.ALM.WRN    :=  #DRVCFG.ALM.WRN;
#ACTCFG.ALM.ALMBELL:=  #DRVCFG.ALM.ALMBELL;

#ACTCFG.CMDHMI:=#DRVHMI.CMD;

```



####  `ACT_PRE`

попередня обробка ВМ: ініціалізація STA, ALM, CMD, обробка INBUF, SML, підрахунок dt - виконується функцією `ACT_PRE`;

У інтерфейс повинні передаватися наступні параметри:

- ACTCFG - INOUT - тип універсального ВМ, використовується для внутрішньої обробки для універсалізації
- STA - INOUT - тип набору статусів універсального ВМ, використовується для внутрішньої обробки для універсалізації
- ALMs - INOUT - тип набору тривог універсального ВМ, використовується для внутрішньої обробки для універсалізації
- CMD - INOUT - тип набору команд  універсального ВМ, використовується для внутрішньої обробки для універсалізації
- dt - INOUT - різниця між викликами функції обробки ВМ

За умови, що немає можливості доступатися до зовнішніх змінних з середини функцій, передається `PLC_CFG`, `ACTBUF`,  `ACTBUFIN`, `ACTBUFOUT` ; альтернативно можна використовувати інші інтерфейси для використання в середині `PLC_CFG` 

```pascal
(*початкова обробка для усіх ВМ: інціалізація, присвоєння у внутрішні STA, ALM; визначення INBUF, SML, #dt *)
(*first scan*)
IF "SYS".PLCCFG.STA.SCN1 THEN
    (*обнулення бітів структури STA*)
    #ACTCFG.STA.IMSTPD:=FALSE;
    #ACTCFG.STA.MANRUNING:=FALSE;
    #ACTCFG.STA.STOPING:=FALSE;
    #ACTCFG.STA.OPNING:=FALSE;
    #ACTCFG.STA.CLSING:=FALSE;
    #ACTCFG.STA.OPND:=FALSE;
    #ACTCFG.STA.CLSD:=FALSE;
    #ACTCFG.STA.MANBXOUT:=FALSE;
    #ACTCFG.STA.WRKED:=FALSE;
    #ACTCFG.STA.DISP:=FALSE;
    #ACTCFG.STA.MANBX:=FALSE;
    #ACTCFG.STA.INBUF:=FALSE;
    #ACTCFG.STA.FRC:=FALSE;
    #ACTCFG.STA.SML:=FALSE;
    #ACTCFG.STA.BLCK:=FALSE;
    #ACTCFG.STA.STRTING:=FALSE;
    #ACTCFG.STA.STOPED:=FALSE;
    #ACTCFG.STA.SLNDBRK:=FALSE;
    #ACTCFG.STA.CMDACK:=FALSE;
    #ACTCFG.STA.SPD1:=FALSE;
    #ACTCFG.STA.SPD2:=FALSE;
    #ACTCFG.STA.STA_b21:=FALSE;
    #ACTCFG.STA.STRT_DELAY:=FALSE;
    #ACTCFG.STA.STOP_DELAY:=FALSE;
    #ACTCFG.STA.DBLCKACT:=FALSE;
    #ACTCFG.STA.ISREVERS:=FALSE;
    #ACTCFG.STA.ISANALOG:=FALSE;
    #ACTCFG.STA.INIOTBUF:=FALSE;
    #ACTCFG.STA.SPDMONON:=FALSE;
    #ACTCFG.STA.SPDCALIBRON:=FALSE;
    #ACTCFG.STA.MAINT:=FALSE;
    #ACTCFG.STA.STA_b31:=FALSE;
    (*обнулення бітів структури ALM*)
    #ACTCFG.ALM.ALMSTRT:=FALSE;
    #ACTCFG.ALM.ALMSTP:=FALSE;
    #ACTCFG.ALM.ALMOPN:=FALSE;
    #ACTCFG.ALM.ALMCLS:=FALSE;
    #ACTCFG.ALM.ALMOPN2:=FALSE;
    #ACTCFG.ALM.ALMCLS2:=FALSE;
    #ACTCFG.ALM.ALMSHFT:=FALSE;
    #ACTCFG.ALM.ALM:=FALSE;
    #ACTCFG.ALM.ALMBELL:=FALSE;
    #ACTCFG.ALM.WRN:=FALSE;
    #ACTCFG.ALM.WRNSPD:=FALSE;
    #ACTCFG.ALM.ALMSPD:=FALSE;
    #ACTCFG.ALM.WRNSPD2:=FALSE;
    #ACTCFG.ALM.ALMSPD2:=FALSE;
    #ACTCFG.ALM.ALMPWR1:=FALSE;
    #ACTCFG.ALM.ALMSTPBTN:=FALSE;
    #ACTCFG.ALM.ALMINVRTR:=FALSE;
    #ACTCFG.ALM.ALM_b17:=FALSE;
    #ACTCFG.ALM.ALM_b18:=FALSE;
    #ACTCFG.ALM.ALM_b19:=FALSE;
    #ACTCFG.ALM.ALM_b20:=FALSE;
    #ACTCFG.ALM.ALM_b21:=FALSE;
    #ACTCFG.ALM.ALM_b22:=FALSE;
    #ACTCFG.ALM.ALM_b23:=FALSE;
    #ACTCFG.ALM.ALM_b24:=FALSE;
    #ACTCFG.ALM.ALM_b25:=FALSE;
    #ACTCFG.ALM.ALM_b26:=FALSE;
    #ACTCFG.ALM.ALM_b27:=FALSE;
    #ACTCFG.ALM.ALM_b28:=FALSE;
    #ACTCFG.ALM.ALM_b29:=FALSE;
    #ACTCFG.ALM.ALM_b30:=FALSE;
    #ACTCFG.ALM.ALM_b31:=FALSE;
    IF #ACTCFG.T_OPNSP = 0 THEN #ACTCFG.T_OPNSP:=50; END_IF;
END_IF;

#STA:=#ACTCFG.STA;
#ALMs := #ACTCFG.ALM;
#CMD := #ACTCFG.CMD;
#ALMs.ALMBELL:= false; (*дзвінок знімається через один цикл*)
#STA.INBUF := (#ACTCFG.ID = "BUF".ACTBUF.ID AND "BUF".ACTBUF.ID <> 0 AND #ACTCFG.CLSID = "BUF".ACTBUF.CLSID);(*знаходиться в буфері конфігурування*)
#STA.SML := "SYS".PLCCFG.STA.SMLALL;(*режим імітації*)
#dt := "SYS".PLCCFG.TQMS - #ACTCFG.T_PREV; (*різниця між викликами в мс*)
IF #dt<1 THEN #dt:=1; END_IF;


```



####  `ACT_CMDCTRL`

обробка команд - виконується стандартним для всіх ВМ обробчиком команд, який реалізовано у вигляді функції `ACT_CMDCTRL`.

У інтерфейс повинні передаватися наступні параметри:

- ACTCFG - INOUT - тип універсального ВМ, використовується для внутрішньої обробки для універсалізації
- STA - INOUT - тип набору статусів універсального ВМ, використовується для внутрішньої обробки для універсалізації
- CMD - INOUT - тип набору команд  універсального ВМ, використовується для внутрішньої обробки для універсалізації

За умови, що немає можливості доступатися до зовнішніх змінних з середини функцій, передається `PLC_CFG`, `ACTBUF`,  `ACTBUFIN`, `ACTBUFOUT` ; альтернативно можна використовувати інші інтерфейси для використання в середині `PLC_CFG` 

```pascal
(*блок обробляє команди з HMI та IOT, формує на основі них CMD, змінює статусні біти стану, обнуляє автоматичні команди в ручному режимі *)
(*вибір джерела конфігураційної/керівної команди HMI згідно пріоритету якщо команди надійшли одночасно*)
IF #ACTCFG.CMDHMI > 16#80 THEN (*конфіг кмд з HMI*)
    #CMDINT := #ACTCFG.CMDHMI;
ELSIF #STA.INBUF AND "BUF".ACTBUF.CMDHMI > 16#80 THEN (*конфіг кмд з буферу*)
    #CMDINT := "BUF".ACTBUF.CMDHMI;
ELSIF #ACTCFG.CMDHMI < 16#80 AND #ACTCFG.CMDHMI > 0 AND #STA.DISP THEN(*керування клапаном з елементу в ручному режимі*)
    #CMDINT := #ACTCFG.CMDHMI;
ELSIF #STA.INBUF AND "BUF".ACTBUF.CMDHMI < 16#80 AND "BUF".ACTBUF.CMDHMI > 0 AND #STA.DISP THEN (* керування клапаном з буферу в ручному режимі*)
    #CMDINT := "BUF".ACTBUF.CMDHMI; (* команда звідти інакше ігнорити*)
ELSE
    #CMDINT := 0;
END_IF;

(*у рчуному режимі усі автоматичні команди керування обнуляються*)
IF #STA.DISP THEN
    #CMD.OPN:=FALSE;
    #CMD.CLS:=FALSE;
    #CMD.TOGGLE:=false;
    #CMD.START:=false;
    #CMD.STOP:=false;
    #CMD.REVERS:=false;
    #CMD.TOGGLE:=FALSE;
END_IF;

(*команди операторського керування
16#0001 - CMD_OPN
16#0002 - CMD_CLS
16#0004 - CMD_ALMRST
16#0008 - CMD_DBLK
16#0010 - CMD_STOP
*)

(* команди HMI*)
CASE #CMDINT OF
    16#0001:(*відкрити *)
        #CMD.OPN := TRUE;
        #CMD.CLS := FALSE;
    16#0002:(*закрити *)
        #CMD.CLS := TRUE;
        #CMD.OPN := FALSE;
    16#0003:(*перемкнути*)
        #CMD.TOGGLE := TRUE;
    16#0004:(* Підтвердити тривогу*)
        #CMD.ALMACK:= TRUE;
    16#0005:(*Скинути тривоги *)
        #CMD.ALMRESET:= TRUE;
    16#0006:
        #CMD.BLCK:= TRUE; (*Заблокувати*)
    16#0007:
        #CMD.DBLCK:= TRUE; (*Розблокувати*)
    16#0008:
        #CMD.STOPTUN:= TRUE;(*Зупинити автоналаштування*)
    16#0009:
        #CMD.TUNING:= TRUE;(*Запустити автоналаштування *)
    16#000A:
        #CMD.PROTECT:= TRUE;(*Включити алгоритм захисту *)
    16#000B: (*=1 дозвіл на керування*)
        #CMD.RESOLUTION:= TRUE; (*//на один цикл*)
    16#000C: (*дозвіл на керування по наявності тиску в системі*)
        #CMD.P_RESOLUTION := TRUE; (*//на один цикл*)
    16#000D: (*=1 запуск калібрування датчика шивдкості*)
        #CMD.DBLCKACTTOGGLE := true;
        #STA.DBLCKACT := NOT #STA.DBLCKACT;
        
        (*E..10 - вільні*)
        
    16#0011:(*Запустити*)
        #CMD.START:= TRUE;
        #CMD.STOP:= false;
    16#0012: (*Зупинити*)
        #CMD.STOP:= TRUE;
        #CMD.START:= false;
    16#0013:(*19*)
        #CMD.REVERS:= TRUE;(*Включити реверс *)
        (*14-20 - вільні*)
    16#0021:
        #CMD.UP:= TRUE; (*Більше*)
    16#0022:
        #CMD.DWN:= TRUE; (*Менше*)
        (*23-9F - вільні*)
        (*починаючи з 16#0080 тільки для роботи з буфера і керування режимом*)
    16#0100: (*прочитати конфігурацію*)
        #CMD.BUFLOAD:=true;
        "BUF".ACTBUF := #ACTCFG;
    16#0101: (*записати конфігурацію*)
        #ACTCFG.PRM := "BUF".ACTBUF.PRM;
        #ACTCFG.T_DEASP := "BUF".ACTBUF.T_DEASP;
        #ACTCFG.T_OPNSP := "BUF".ACTBUF.T_OPNSP;
        #ACTCFG.STOP_DELAY := "BUF".ACTBUF.STOP_DELAY;
    (*102-2FF вільні*)
    16#0300: (*перемкнути ручний/автомат*)
        #STA.DISP := NOT #STA.DISP;
    16#0301: (*РУЧНИЙ РЕЖИМ*)
        #STA.DISP := TRUE;
    16#0302: (*АВТО РЕЖИМ*)
        #STA.DISP := FALSE;
    16#0313:(* включити місцевий режим*)
        #STA.MANBXOUT := true;
        #STA.MANBX := true;
        #STA.DISP := TRUE;
        (*#CMD.CRMT:= TRUE; //чи потрібен з програми?*)
    16#0314:(* відключити місцевий режим*)
        #STA.MANBXOUT := false;
        #STA.MANBX := false;
        (*#CMD.CLCL:= TRUE; //чи потрібен з програми?*)
    16#0315: (*=1 вивести з експлуатації*)
        #CMD.OUTSRVC := true;
    16#0316: (*=1 ввести в експлуатацію*)
        #CMD.INSRVC := true;
        (*керування статистикою*)
    16#0401:(* скинути лічильник тривог 1025*)
        #ACTCFG.CNTALM:=0;
    16#0402:(* скинути лічильник спрацювань/переміщень 1026*)
        #ACTCFG.CNTPER:=0;
    16#0403:(* скинути лічильник спрацювань/переміщень 1027*)
        #ACTCFG.TQ_TOTAL:=0;
    16#0404:(* скинути лічильник спрацювань/переміщень 1028*)
        #ACTCFG.TQ_LAST :=0;
END_CASE;

(*проходження команд розблокувати-заблокувати з буфера та НМІ*)
IF #ACTCFG.CMDHMI = 16#0006 OR ("BUF".ACTBUF.CMDHMI = 16#0006 AND #STA.INBUF) THEN #CMD.BLCK:= TRUE; END_IF;
IF #ACTCFG.CMDHMI = 16#0007 OR ("BUF".ACTBUF.CMDHMI = 16#0007 AND #STA.INBUF) THEN #CMD.DBLCK:= TRUE; END_IF;

#CMDINT:=0;
#ACTCFG.CMDHMI:=0;
IF #STA.INBUF THEN
    "BUF".ACTBUF.CMDHMI:=0;
END_IF;
```



#### `DRVFN`

безпосередня обробка ВМ в функції `DRVFN`

```pascal
"DRV_to_ACT"(DRVCFG:=#ACTCFG,  DRVHMI:=#ACTHMI, ACTCFG:=#ACTCFGu);
(*попередня обробка: ініт STA, ALM, CMD, INBUF, SML, dt *)
"ACT_PRE" (ACTCFG := #ACTCFGu, STA := #STA, ALMs := #ALMs, CMD := #CMD, dt := #dT);
(*значення за замовченням*)
IF "SYS".PLCCFG.STA.SCN1 THEN (*first scan*)
    IF #ACTCFGu.T_OPNSP <= 0 THEN (*якщо уставка часу выдкриття не виставлена*)
        #ACTCFGu.T_OPNSP := 500; (*5 секунд*)
    END_IF;
    IF #ACTCFGu.T_DEASP <= 0 THEN (*якщо уставка затримки часу тривоги не виставлена*)
        #ACTCFGu.T_DEASP := 200; (*2 секунди*)
    END_IF;
    (*технологічні тривоги для датчиків не використовуються*)
    IF #RUN.ID <> 0 THEN
        #RUN.PRM.ISALM := false; (*ISALM*)
        #RUN.PRM.ISWRN := false; (*ISWRN*)
    END_IF;
    
END_IF;

(* --------------------- блок параметрів*)
(*параметри перевірка наявності/використання датчиків на вході*)
#ACTCFGu.PRM.PRM_MANCFG     := false;(*у цьому проекті не буде ручного конфігурування параметрів IO*)
#ACTCFGu.PRM.PRM_ALMENBL    := NOT #ALM.PRM.DSBL AND #ALM.ID <> 0;
#ACTCFGu.PRM.PRM_ZWRKENBL   := NOT #RUN.PRM.DSBL AND #RUN.ID <> 0;
#ACTCFGu.PRM.PRM_ZPOSENBL   := NOT #SPD.PRM.DSBL AND #SPD.ID <> 0;
#ACTCFGu.PRM.PRM_PWRENBL    := NOT #RDY.PRM.DSBL AND #RDY.ID <> 0;
#ACTCFGu.PRM.PRM_BTNSTPENBL := NOT #LSTP.PRM.DSBL AND #LSTP.ID <> 0;
#ACTCFGu.PRM.PRM_SELLCLENBL := NOT #RMT.PRM.DSBL AND #RMT.ID <> 0;

(*------------------- блок для режиму імітації*)
(*режим імітації підлеглих від хозяїна*)
#LSTP.STA.SML := #STA.SML;
#RUN.STA.SML := #STA.SML;
#RDY.STA.SML := #STA.SML;
#ALM.STA.SML := #STA.SML;
#RMT.STA.SML := #STA.SML;
#CSTRT.STA.SML := #STA.SML;
#SPD.STA.SML := #STA.SML;
#CSPD.STA.SML := #STA.SML;

(*логіка для режиму імітації  *)
IF #STA.SML THEN
    (*імітація датчиків *)
    IF NOT #SPD.STA.FRC THEN #SPD.VAL := #CSPD.VAL; END_IF;
    IF NOT #RUN.STA.FRC THEN #RUN.STA.VALB:=#ACTCFGu.STEP1=2 OR #ACTCFGu.STEP1=4; END_IF;
    IF NOT #RDY.STA.FRC THEN #RDY.STA.VALB:=true; END_IF; (*живлення є*)
    IF NOT #ALM.STA.FRC THEN #ALM.STA.VALB := false; END_IF;(*тривоги немає*)
END_IF;

(*-------------------- блок обробки команд
//стандартний обробник команд*)
"ACT_CMDCTRL" (ACTCFG := #ACTCFGu, STA := #STA, CMD := #CMD);

(*переключення в ручний режим при включенні локального ручного і блокування усіх команд*)
IF (#RMT.STA.VALB AND NOT #RMT.PRM.DSBL AND #ACTCFGu.PRM.PRM_SELLCLENBL) OR #STA.MANBXOUT OR #STA.MANBX THEN
    (*CMD_RESET*)
    #CMD.OPN:=FALSE;
    #CMD.CLS:=FALSE;
    #CMD.TOGGLE:=FALSE;
    #CMD.ALMACK:=FALSE;
    #CMD.ALMRESET:=FALSE;
    #CMD.BLCK:=FALSE;
    #CMD.DBLCK:=FALSE;
    #CMD.STOPTUN:=FALSE;
    #CMD.TUNING:=FALSE;
    #CMD.MAN:=FALSE;
    #CMD.AUTO:=FALSE;
    #CMD.PROTECT:=FALSE;
    #CMD.START:=FALSE;
    #CMD.STOP:=FALSE;
    #CMD.UP:=FALSE;
    #CMD.DWN:=FALSE;
    #CMD.CRMT:=FALSE;
    (* CMD.RESOLUTION:=FALSE;*)
    #CMD.REVERS:=FALSE;
    #CMD.CLCL:=FALSE;
    #CMD.DBLCKACTTOGGLE:=FALSE;
    #CMD.STARTDELAY:=FALSE;
    #CMD.STOPDELAY:=FALSE;
    #CMD.P_RESOLUTION:=FALSE;
    #CMD.BUFLOAD:=FALSE;
    (* CMD.OUTSRVC:=FALSE;*)
    (* CMD.INSRVC:=FALSE;*)
    #CMD.CMD_b27:=FALSE;
    #CMD.CMD_b28:=FALSE;
    #CMD.CMD_b29:=FALSE;
    #CMD.CMD_b30:=FALSE;
    #CMD.CMD_b31:=FALSE;
END_IF;

(* -------------------  блок обробки станів датчиків відкриття/закриття, або їх заміна на логіку*)
IF NOT #ACTCFGu.PRM.PRM_ZWRKENBL THEN
    #SRUN1:=#ACTCFGu.STEP1=2 OR #ACTCFGu.STEP1=4;
ELSE
    #SRUN1:=#RUN.STA.VALB;
END_IF;
IF NOT #ACTCFGu.PRM.PRM_PWRENBL THEN
    #SPWR1:=true;
ELSE
    #SPWR1:=#RDY.STA.VALB;
END_IF;
IF NOT #ACTCFGu.PRM.PRM_ALMENBL THEN
    #SALM1:=FALSE;
ELSE
    #SALM1:=#ALM.STA.VALB;
END_IF;
IF NOT #ACTCFGu.PRM.PRM_ZPOSENBL THEN       (* ЯКЩО НЕМА СИГНАЛ ЗВОРОТНЬОГО ЗВЯЗКУ ПОЛОЖЕННЯ*)
    #SPOS1:=#CSPD.VAL;                     (* ТО ПОЛОЖЕННЯ ПРИРІВНЮЄМО ЗАДАНОМУ ЗНАЧЕННЮ*)
ELSE
    #SPOS1:=#SPD.VAL;                     (* ІНАКШЕ БЕРЕЗ ЗНАЧЕННЯ З ДАТЧИКА*)
END_IF;

(*----------------- автомат станів позиції та тривог позиції  *)

CASE #ACTCFGu.STEP1 OF
    0:(*ініціалізація*)
        #ACTCFGu.STEP1 := 1;
        #ACTCFGu.T_STEP1 := 0;
    1, 4, 5: (*кінцеві стани, 1 - невизначений 4 - запущений, 5 - зупинений*)
        IF ((#ACTCFGu.STEP1 = 4 AND NOT #SRUN1) OR (#ACTCFGu.STEP1 = 5 AND #SRUN1)) AND NOT #STA.MANBX THEN
            #ALMs.ALMSHFT:=true;
        ELSE
            #ALMs.ALMSHFT:=FALSE;
        END_IF;
        
        IF #SRUN1 AND NOT #ALMs.ALMSHFT THEN
            #ACTCFGu.STEP1 := 4;
            #CSTRT.STA.VALB:=true;
        END_IF;
        IF NOT #SRUN1 AND NOT #ALMs.ALMSHFT THEN
            #ACTCFGu.STEP1 := 5;
            #CSTRT.STA.VALB:=FALSE;
            #STA.ISREVERS:=FALSE;
        END_IF;
        
    2:  (*запускається*)
        #CSTRT.STA.VALB:=true;
        IF #SRUN1 THEN
            #ACTCFGu.STEP1 := 4; (*у стан запущено*)
            #ACTCFGu.T_STEP1 := 0;
        END_IF;
        
        #ALMs.ALMSTRT := FALSE;
        #ALMs.ALMSTP := FALSE;
        
        IF #ACTCFGu.T_STEP1 >= (UINT_TO_UDINT(#ACTCFGu.T_DEASP)*100) THEN
            #ALMs.ALMSTRT := TRUE;
            #ALMs.ALMSTP := FALSE;
            #ACTCFGu.STEP1 := 6; (*у стан заблоковано*)
            #ACTCFGu.T_STEP1 := 0;
        END_IF;
    3:  (*зупиняється*)
        #CSTRT.STA.VALB:=FALSE;
        IF NOT #SRUN1 THEN
            #STA.ISREVERS:=FALSE;
            #ACTCFGu.STEP1 := 5;
            #ACTCFGu.T_STEP1 := 0;
        END_IF;
        
        #ALMs.ALMCLS := false;
        #ALMs.ALMOPN := FALSE;
        
        IF #ACTCFGu.T_STEP1 >= (UINT_TO_UDINT(#ACTCFGu.T_DEASP)*100) THEN
            #ALMs.ALMSTP := TRUE;
            #ALMs.ALMSTRT := FALSE;
            #ACTCFGu.STEP1 := 6; (*у стан заблоковано*)
            #ACTCFGu.T_STEP1 := 0;
        END_IF;
    6: (*заблоковано*)
        #CSTRT.STA.VALB:=FALSE;
        #STA.ISREVERS:=FALSE;
        IF #CMD.DBLCK THEN
            #ACTCFGu.STEP1 := 5; (*у стан зупинено*)
            #ACTCFGu.T_STEP1 := 0;
            #ALMs.ALMSTRT:=FALSE;
            #ALMs.ALMSTP:=FALSE;
            #ALMs.ALMINVRTR:=FALSE;
            #ALMs.ALMPWR1:=FALSE;
            #ALMs.ALMSHFT:=FALSE;
        END_IF;
    ELSE  (*невизначеність*)
        #ACTCFGu.STEP1 := 0;
END_CASE;

#STA.ISANALOG:=#CSPD.ID<>0;
#STA.STOPING :=#ACTCFGu.STEP1 = 3;
#STA.STRTING :=#ACTCFGu.STEP1 = 2;
#STA.STOPED  :=#ACTCFGu.STEP1 = 5 OR #ACTCFGu.STEP1 = 6;
#STA.WRKED   :=#ACTCFGu.STEP1 = 4;
#STA.BLCK    :=#ACTCFGu.STEP1 = 6 AND NOT #STA.MAINT;


(*----------------------------- керування ВМ*)
IF #CMD.STOP THEN
    #CSTRT.STA.VALB:=FALSE;
END_IF;
IF #CMD.REVERS THEN
    #CMD.START:= TRUE;
    #CMD.STOP:= false;
    #STA.ISREVERS:=TRUE;
END_IF;
(*керування start/stop тільки при дозволі керування або тимчасовому розблокуванні*)
IF (#CMD.RESOLUTION OR "SYS".PLCCFG.STA_PERM.%X6) AND NOT #STA.BLCK THEN
    IF #CMD.START AND #ACTCFGu.STEP1 <> 4 THEN
        #ACTCFGu.STEP1 := 2;
        #ACTCFGu.T_STEP1 := 0;
        #ACTCFGu.CNTPER := #ACTCFGu.CNTPER + 1;
    END_IF;
    IF #CMD.STOP AND #ACTCFGu.STEP1 <> 5 THEN
        #ACTCFGu.STEP1 := 3;
        #ACTCFGu.T_STEP1 := 0;
    END_IF;
ELSE
    #CSTRT.STA.VALB:=FALSE;
END_IF;

IF #CMD.BLCK THEN    (*при команді блокувати перевести в потрібний стан*)
    #ACTCFGu.STEP1 := 6;
    #ACTCFGu.T_STEP1 := 0;
END_IF;

IF #CMD.OUTSRVC THEN (*при команді вивести з експлуатації перевести в потрібний стан заблоковано і виставляємо відповідний біт*)
    #STA.MAINT := true;
    #ACTCFGu.STEP1 := 6;
    #ACTCFGu.T_STEP1 := 0;
END_IF;

IF #CMD.INSRVC THEN (*при команді ввести з експлуатації перевести в стан зупинено і зкидаємо відповідний біт*)
    #STA.MAINT := false;
    #ACTCFGu.STEP1 := 5;
    #ACTCFGu.T_STEP1 := 0;
END_IF;


(*-------------------- режими*)

#STA.FRC :=#LSTP.STA.FRC AND #LSTP.ID<>0
OR #RUN.STA.FRC AND #RUN.ID<>0
OR #RDY.STA.FRC AND #RDY.ID<>0
OR #ALM.STA.FRC AND #ALM.ID<>0
OR #RMT.STA.FRC AND #RMT.ID<>0
OR #CSTRT.STA.FRC AND #CSTRT.ID<>0
OR #SPD.STA.FRC AND #SPD.ID<>0
OR #CSPD.STA.FRC AND #CSPD.ID<>0;

IF #STA.MAINT THEN (*якщо виведено з експлуатації тривоги не відслідковуємо*)
    #ALMs.ALMSTRT := FALSE;
    #ALMs.ALMSTP := FALSE;
    #ALMs.ALMINVRTR := FALSE;
    #ALMs.ALMPWR1 := FALSE;
    #ALMs.ALMSHFT := FALSE;
END_IF;

#ALMs.ALMPWR1:=NOT #SPWR1;
#ALMs.ALM := #ALMs.ALMSTRT OR #ALMs.ALMSTP OR #ALMs.ALMINVRTR OR #ALMs.ALMPWR1 OR #ALMs.ALMSHFT;
IF #ALMs.ALM THEN
    "SYS".PLCCFG.ALM1.ALM := true;
    "SYS".PLCCFG.CNTALM := "SYS".PLCCFG.CNTALM + 1;
END_IF;

IF #ALMs.ALM AND NOT #STA.MANBX AND #ACTCFGu.STEP1<>6 THEN
    #ACTCFGu.STEP1 := 6;
    #ACTCFGu.T_STEP1 := 0;
END_IF;

(*------------------- зведення ксатомних тривог, режимів, бітів*)
IF #ALMs.ALMSTRT THEN
    "SYS".PLCCFG.ALM1.ALM := TRUE;
    IF NOT #ACTCFGu.ALM.ALMSTRT THEN
        "SYS".PLCCFG.ALM1.NWALM := TRUE;
        #ACTCFGu.CNTALM := #ACTCFGu.CNTALM + 1;
    END_IF;
END_IF;

IF #ALMs.ALMSTP THEN
    "SYS".PLCCFG.ALM1.ALM := TRUE;
    IF NOT #ACTCFGu.ALM.ALMSTP THEN
        "SYS".PLCCFG.ALM1.NWALM := TRUE;
        #ACTCFGu.CNTALM := #ACTCFGu.CNTALM + 1;
    END_IF;
END_IF;

IF #ALMs.ALMSHFT THEN
    "SYS".PLCCFG.ALM1.ALM := TRUE;
    IF NOT #ACTCFGu.ALM.ALMSHFT THEN
        "SYS".PLCCFG.ALM1.NWALM := TRUE;
        #ACTCFGu.CNTALM := #ACTCFGu.CNTALM + 1;
    END_IF;
END_IF;

IF #ALMs.ALMINVRTR THEN
    "SYS".PLCCFG.ALM1.ALM := TRUE;
    IF NOT #ACTCFGu.ALM.ALMINVRTR THEN
        "SYS".PLCCFG.ALM1.NWALM := TRUE;
        #ACTCFGu.CNTALM := #ACTCFGu.CNTALM + 1;
    END_IF;
END_IF;

IF #ALMs.ALMPWR1 THEN
    "SYS".PLCCFG.ALM1.ALM := TRUE;
    IF NOT #ACTCFGu.ALM.ALMPWR1 THEN
        "SYS".PLCCFG.ALM1.NWALM := TRUE;
        #ACTCFGu.CNTALM := #ACTCFGu.CNTALM + 1;
    END_IF;
END_IF;

IF #STA.DISP THEN
    "SYS".PLCCFG.STA.DISP := TRUE;
    "SYS".PLCCFG.CNTMAN := "SYS".PLCCFG.CNTMAN + 1;
END_IF;

IF #STA.BLCK THEN
    "SYS".PLCCFG.STA.BLK := TRUE;
END_IF;

IF #ACTCFGu.STA.WRKED THEN
    #ACTCFGu.TQ_LAST:=#ACTCFGu.T_STEP1/60000;
END_IF;

IF #ACTCFGu.TQ_LAST>=16#7FFFFFFF THEN
    #ACTCFGu.TQ_LAST:=16#7FFFFFFF;
END_IF;

IF #ACTCFGu.STA.WRKED THEN
    IF "SYS".PLCCFG.PLS.P60S THEN
        #ACTCFGu.TQ_TOTAL:=#ACTCFGu.TQ_TOTAL+1;
    END_IF;
END_IF;

IF #ACTCFGu.TQ_TOTAL>=16#7FFFFFFF THEN
    #ACTCFGu.TQ_TOTAL:=16#7FFFFFFF;
END_IF;

#ACTCFGu.POS := #SPOS1;

(*заключна обробка: зведення в PLC.CFG, STA, ALM, CMD, INBUF, SML, dt *)
"ACT_POST" (ACTCFG := #ACTCFGu, STA := #STA, ALMs := #ALMs, CMD := #CMD, dt := #dT);

"ACT_to_DRV"(DRVCFG:=#ACTCFG, DRVHMI:=#ACTHMI, ACTCFG:=#ACTCFGu);

(*------------------- вибір джерела завдання*)
IF #ACTCFGu.STA.INBUF AND #ACTCFGu.STA.DISP THEN
    #ACTCFGu.CPOS := "BUF".ACTBUF.CPOS;
    #ACTHMI.CSPD := #ACTCFGu.CPOS;
    #ACTCFG.CSPD := #ACTCFGu.CPOS;
ELSIF NOT #ACTCFGu.STA.INBUF AND #ACTCFGu.STA.DISP THEN
    #ACTCFGu.CPOS := #ACTHMI.CSPD;
    #ACTHMI.CSPD := #ACTCFGu.CPOS;
    #ACTCFG.CSPD := #ACTCFGu.CPOS;
ELSE
    #ACTCFGu.CPOS := #ACTCFG.CSPD;
    #ACTHMI.CSPD := #ACTCFGu.CPOS;
    #ACTCFG.CSPD := #ACTCFGu.CPOS;
END_IF;
#CSPD.VAL:=#ACTCFGu.CPOS;

(*реалізація читання конфігураційних даних в буфер out*)
IF (UINT_TO_WORD(#ACTCFG.CLSID) AND 16#FFF0)=(UINT_TO_WORD("BUF".ACTBUFIN.CLSID) AND 16#FFF0) AND #ACTCFG.ID="BUF".ACTBUFIN.ID AND "BUF".ACTBUFIN.CMDHMI = 16#100 THEN
    (* MSG 200-Ok 400-Error
    // 200 - Дані записані
    // 201 - Дані прочитані   *)
    "BUF".ACTBUFOUT.MSG := 201;
    
    "BUF".ACTBUFOUT.T_DEASP := #ACTCFG.T_DEASP;
    
    "BUF".ACTBUFIN.CMDHMI :=0;
END_IF;

(*реалізація запису конфігураційних даних з буфер in в технологічну змінну*)
IF (UINT_TO_WORD(#ACTCFG.CLSID) AND 16#FFF0)=(UINT_TO_WORD("BUF".ACTBUFIN.CLSID) AND 16#FFF0) AND #ACTCFG.ID="BUF".ACTBUFIN.ID AND "BUF".ACTBUFIN.CMDHMI = 16#101 THEN
    (* MSG 200-Ok 400-Error
    // 200 - Дані записані
    // 201 - Дані прочитані *)
    
    "BUF".ACTBUFOUT:="BUF".ACTBUFIN;
    
    #ACTCFG.T_DEASP := "BUF".ACTBUFIN.T_DEASP;
    
    "BUF".ACTBUFOUT.MSG := 200;
    
    "BUF".ACTBUFIN.CMDHMI :=0;
END_IF;
```



####  `ACT_POST`.

заключна обробка ВМ: зведення в PLC.CFG, формування STA та ALM ВМ, онулення CMD, підрахунок dt і т.д який реалізовано у вигляді функції `ACT_POST`.

У інтерфейс повинні передаватися наступні параметри:

- ACTCFG - INOUT - тип універсального ВМ, використовується для внутрішньої обробки для універсалізації
- STA - INOUT - тип набору статусів універсального ВМ, використовується для внутрішньої обробки для універсалізації
- ALMs - INOUT - тип набору тривог універсального ВМ, використовується для внутрішньої обробки для універсалізації
- CMD - INOUT - тип набору команд  універсального ВМ, використовується для внутрішньої обробки для універсалізації
- dt - INOUT - різниця між викликами функції обробки ВМ

За умови, що немає можливості доступатися до зовнішніх змінних з середини функцій, передається `PLC_CFG`, `ACTBUF`,  `ACTBUFIN`, `ACTBUFOUT` ; альтернативно можна використовувати інші інтерфейси для використання в середині `PLC_CFG` 

```pascal
(*кінцева обробка ВМ перед фцією act_to_XXX: оновлення загальних статусних бітів PLC, 
обмеження лічильників тривог, запис в STA, ALM, оновлення буферу*)
(*режими - в PLC*)
(*загальний біт хоча б одного ручного*)
IF #STA.DISP THEN
    "SYS".PLCCFG.STA.DISP := true;
END_IF;
IF #STA.SML THEN
    "SYS".PLCCFG.STA.SML := true;
END_IF;
IF #ACTCFG.CNTALM > 30000 THEN
    #ACTCFG.CNTALM := 30000;
END_IF;
IF #ACTCFG.CNTPER > 30000 THEN
    #ACTCFG.CNTPER := 30000;
END_IF;
#ACTCFG.STA := #STA;
#ACTCFG.ALM := #ALMs;
(*обнулення усіх команд з HMI*)
#ACTCFG.CMDHMI := 0;
(*обнулення усіх команд з програми*)

#ACTCFG.CMD.OPN:=FALSE;
#ACTCFG.CMD.CLS:=FALSE;
#ACTCFG.CMD.TOGGLE:=FALSE;
#ACTCFG.CMD.ALMACK:=FALSE;
#ACTCFG.CMD.ALMRESET:=FALSE;
#ACTCFG.CMD.BLCK:=FALSE;
#ACTCFG.CMD.DBLCK:=FALSE;
#ACTCFG.CMD.STOPTUN:=FALSE;
#ACTCFG.CMD.TUNING:=FALSE;
#ACTCFG.CMD.MAN:=FALSE;
#ACTCFG.CMD.AUTO:=FALSE;
#ACTCFG.CMD.PROTECT:=FALSE;
#ACTCFG.CMD.START:=FALSE;
#ACTCFG.CMD.STOP:=FALSE;
#ACTCFG.CMD.UP:=FALSE;
#ACTCFG.CMD.DWN:=FALSE;
#ACTCFG.CMD.CRMT:=FALSE;
#ACTCFG.CMD.RESOLUTION:=FALSE;
#ACTCFG.CMD.REVERS:=FALSE;
#ACTCFG.CMD.CLCL:=FALSE;
#ACTCFG.CMD.DBLCKACTTOGGLE:=FALSE;
#ACTCFG.CMD.STARTDELAY:=FALSE;
#ACTCFG.CMD.STOPDELAY:=FALSE;
#ACTCFG.CMD.P_RESOLUTION:=FALSE;
#ACTCFG.CMD.BUFLOAD:=FALSE;
#ACTCFG.CMD.OUTSRVC:=FALSE;
#ACTCFG.CMD.INSRVC:=FALSE;
#ACTCFG.CMD.CMD_b27:=FALSE;
#ACTCFG.CMD.CMD_b28:=FALSE;
#ACTCFG.CMD.CMD_b29:=FALSE;
#ACTCFG.CMD.CMD_b30:=FALSE;
#ACTCFG.CMD.CMD_b31:=FALSE;

#CMD.OPN:=FALSE;
#CMD.CLS:=FALSE;
#CMD.TOGGLE:=FALSE;
#CMD.ALMACK:=FALSE;
#CMD.ALMRESET:=FALSE;
#CMD.BLCK:=FALSE;
#CMD.DBLCK:=FALSE;
#CMD.STOPTUN:=FALSE;
#CMD.TUNING:=FALSE;
#CMD.MAN:=FALSE;
#CMD.AUTO:=FALSE;
#CMD.PROTECT:=FALSE;
#CMD.START:=FALSE;
#CMD.STOP:=FALSE;
#CMD.UP:=FALSE;
#CMD.DWN:=FALSE;
#CMD.CRMT:=FALSE;
#CMD.RESOLUTION:=FALSE;
#CMD.REVERS:=FALSE;
#CMD.CLCL:=FALSE;
#CMD.DBLCKACTTOGGLE:=FALSE;
#CMD.STARTDELAY:=FALSE;
#CMD.STOPDELAY:=FALSE;
#CMD.P_RESOLUTION:=FALSE;
#CMD.BUFLOAD:=FALSE;
#CMD.OUTSRVC:=FALSE;
#CMD.INSRVC:=FALSE;
#CMD.CMD_b27:=FALSE;
#CMD.CMD_b28:=FALSE;
#CMD.CMD_b29:=FALSE;
#CMD.CMD_b30:=FALSE;
#CMD.CMD_b31:=FALSE;

(*sta bits pack*)
#ACTCFG.STAHMI1.%X0:= #ACTCFG.STA.IMSTPD;
#ACTCFG.STAHMI1.%X1:= #ACTCFG.STA.MANRUNING;
#ACTCFG.STAHMI1.%X2:= #ACTCFG.STA.STOPING;
#ACTCFG.STAHMI1.%X3:= #ACTCFG.STA.OPNING;
#ACTCFG.STAHMI1.%X4:= #ACTCFG.STA.CLSING;
#ACTCFG.STAHMI1.%X5:= #ACTCFG.STA.OPND;
#ACTCFG.STAHMI1.%X6:= #ACTCFG.STA.CLSD;
#ACTCFG.STAHMI1.%X7:= #ACTCFG.STA.MANBXOUT;
#ACTCFG.STAHMI1.%X8:= #ACTCFG.STA.WRKED;
#ACTCFG.STAHMI1.%X9:= #ACTCFG.STA.DISP;
#ACTCFG.STAHMI1.%X10:= #ACTCFG.STA.MANBX;
#ACTCFG.STAHMI1.%X11:= #ACTCFG.STA.INBUF;
#ACTCFG.STAHMI1.%X12:= #ACTCFG.STA.FRC;
#ACTCFG.STAHMI1.%X13:= #ACTCFG.STA.SML;
#ACTCFG.STAHMI1.%X14:= #ACTCFG.STA.BLCK;
#ACTCFG.STAHMI1.%X15:= #ACTCFG.STA.STRTING;
#ACTCFG.STAHMI2.%X0:= #ACTCFG.STA.STOPED;
#ACTCFG.STAHMI2.%X1:= #ACTCFG.STA.SLNDBRK;
#ACTCFG.STAHMI2.%X2:= #ACTCFG.STA.CMDACK;
#ACTCFG.STAHMI2.%X3:= #ACTCFG.STA.SPD1;
#ACTCFG.STAHMI2.%X4:= #ACTCFG.STA.SPD2;
#ACTCFG.STAHMI2.%X5:= #ACTCFG.STA.STA_b21;
#ACTCFG.STAHMI2.%X6:= #ACTCFG.STA.STRT_DELAY;
#ACTCFG.STAHMI2.%X7:= #ACTCFG.STA.STOP_DELAY;
#ACTCFG.STAHMI2.%X8:= #ACTCFG.STA.DBLCKACT;
#ACTCFG.STAHMI2.%X9:= #ACTCFG.STA.ISREVERS;
#ACTCFG.STAHMI2.%X10:= #ACTCFG.STA.ISANALOG;
#ACTCFG.STAHMI2.%X11:= #ACTCFG.STA.INIOTBUF;
#ACTCFG.STAHMI2.%X12:= #ACTCFG.STA.SPDMONON;
#ACTCFG.STAHMI2.%X13:= #ACTCFG.STA.SPDCALIBRON;
#ACTCFG.STAHMI2.%X14:= #ACTCFG.STA.MAINT;
#ACTCFG.STAHMI2.%X15:= #ACTCFG.STA.STA_b31;

(*alm bits pack*)
#ACTCFG.ALMHMI1.%X0:= #ACTCFG.ALM.ALMSTRT;
#ACTCFG.ALMHMI1.%X1:= #ACTCFG.ALM.ALMSTP;
#ACTCFG.ALMHMI1.%X2:= #ACTCFG.ALM.ALMOPN;
#ACTCFG.ALMHMI1.%X3:= #ACTCFG.ALM.ALMCLS;
#ACTCFG.ALMHMI1.%X4:= #ACTCFG.ALM.ALMOPN2;
#ACTCFG.ALMHMI1.%X5:= #ACTCFG.ALM.ALMCLS2;
#ACTCFG.ALMHMI1.%X6:= #ACTCFG.ALM.ALMSHFT;
#ACTCFG.ALMHMI1.%X7:= #ACTCFG.ALM.ALM;
#ACTCFG.ALMHMI1.%X8:= #ACTCFG.ALM.ALMBELL;
#ACTCFG.ALMHMI1.%X9:= #ACTCFG.ALM.WRN;
#ACTCFG.ALMHMI1.%X10:= #ACTCFG.ALM.WRNSPD;
#ACTCFG.ALMHMI1.%X11:= #ACTCFG.ALM.ALMSPD;
#ACTCFG.ALMHMI1.%X12:= #ACTCFG.ALM.WRNSPD2;
#ACTCFG.ALMHMI1.%X13:= #ACTCFG.ALM.ALMSPD2;
#ACTCFG.ALMHMI1.%X14:= #ACTCFG.ALM.ALMPWR1;
#ACTCFG.ALMHMI1.%X15:= #ACTCFG.ALM.ALMSTPBTN;
#ACTCFG.ALMHMI2.%X0:=#ACTCFG.ALM.ALMINVRTR;
#ACTCFG.ALMHMI2.%X1:=#ACTCFG.ALM.ALM_b17;
#ACTCFG.ALMHMI2.%X2:=#ACTCFG.ALM.ALM_b18;
#ACTCFG.ALMHMI2.%X3:=#ACTCFG.ALM.ALM_b19;
#ACTCFG.ALMHMI2.%X4:=#ACTCFG.ALM.ALM_b20;
#ACTCFG.ALMHMI2.%X5:=#ACTCFG.ALM.ALM_b21;
#ACTCFG.ALMHMI2.%X6:=#ACTCFG.ALM.ALM_b22;
#ACTCFG.ALMHMI2.%X7:=#ACTCFG.ALM.ALM_b23;
#ACTCFG.ALMHMI2.%X8:=#ACTCFG.ALM.ALM_b24;
#ACTCFG.ALMHMI2.%X9:=#ACTCFG.ALM.ALM_b25;
#ACTCFG.ALMHMI2.%X10:=#ACTCFG.ALM.ALM_b26;
#ACTCFG.ALMHMI2.%X11:=#ACTCFG.ALM.ALM_b27;
#ACTCFG.ALMHMI2.%X12:=#ACTCFG.ALM.ALM_b28;
#ACTCFG.ALMHMI2.%X13:=#ACTCFG.ALM.ALM_b29;
#ACTCFG.ALMHMI2.%X14:=#ACTCFG.ALM.ALM_b30;
#ACTCFG.ALMHMI2.%X15:=#ACTCFG.ALM.ALM_b31;


(*оновлення в буфері HMI
//передаємо постійно в буфер тільки ті значення які змінюються постійно*) 
IF #STA.INBUF THEN
    "BUF".ACTBUF.ID := #ACTCFG.ID ;
    "BUF".ACTBUF.CLSID := #ACTCFG.CLSID ;
    "BUF".ACTBUF.CMDHMI := #ACTCFG.CMDHMI ;
    "BUF".ACTBUF.STAHMI1:= #ACTCFG.STAHMI1;
    "BUF".ACTBUF.ALMHMI1:= #ACTCFG.ALMHMI1 ;
    "BUF".ACTBUF.STAHMI2:= #ACTCFG.STAHMI2;
    "BUF".ACTBUF.ALMHMI2:= #ACTCFG.ALMHMI2 ;
    "BUF".ACTBUF.STEP1:= #ACTCFG.STEP1 ;
    "BUF".ACTBUF.T_STEP1:= #ACTCFG.T_STEP1;
    "BUF".ACTBUF.POS := #ACTCFG.POS;
    IF NOT #STA.DISP THEN
        "BUF".ACTBUF.CPOS := #ACTCFG.CPOS;
    END_IF;
    "BUF".ACTBUF.STA:=#ACTCFG.STA;
    "BUF".ACTBUF.ALM:=#ACTCFG.ALM;
    "BUF".ACTBUF.CNTPER:=#ACTCFG.CNTPER;
    "BUF".ACTBUF.CNTALM:=#ACTCFG.CNTALM;
END_IF;

#ACTCFG.T_PREV := "SYS".PLCCFG.TQMS;
#ACTCFG.T_STEP1 := #ACTCFG.T_STEP1 + #dt;
IF #ACTCFG.T_STEP1 > 16#7FFF_FFFF THEN
    #ACTCFG.T_STEP1 := 16#7FFF_FFFF;
END_IF;


```



####  `ACT_to_DRV` 

передача інформації з змінної типу універсального ВМ до змінної яка відповідає типу ВМ  - виконується для зручності і уніфікації обробки, виконується функцією `ACT_to_DRV` ;

У інтерфейс повинні передаватися наступні параметри:

- DRVCFG - INOUT - конфігураційна змінна ВМ
- DRVHMI - INOUT - HMI змінна ВМ
- ACTCFG - INOUT - тип універсального ВМ, використовується для внутрішньої обробки для універсалізації

За умови, що немає можливості доступатися до зовнішніх змінних з середини функцій, передається `PLC_CFG`, `ACTBUF`,  `ACTBUFIN`, `ACTBUFOUT` ; альтернативно можна використовувати інші інтерфейси для використання в середині `PLC_CFG` 

```pascal
#DRVCFG.ID:= #ACTCFG.ID;
#DRVCFG.CLSID:= #ACTCFG.CLSID;
#DRVCFG.CMD:= #ACTCFG.CMD;
#DRVCFG.PRM:= #ACTCFG.PRM;
#DRVCFG.T_DEASP:= #ACTCFG.T_DEASP;
#DRVCFG.SPD:= #ACTCFG.POS;
#DRVCFG.CSPD:= #ACTCFG.CPOS;
#DRVCFG.STEP1:= #ACTCFG.STEP1;
#DRVCFG.CNTPER:= #ACTCFG.CNTPER;
#DRVCFG.CNTALM:= #ACTCFG.CNTALM;
#DRVCFG.T_STEP1:= #ACTCFG.T_STEP1;
#DRVCFG.T_PREV:= #ACTCFG.T_PREV;
#DRVCFG.TQ_TOTAL:= #ACTCFG.TQ_TOTAL;
#DRVCFG.TQ_LAST:= #ACTCFG.TQ_LAST;

#DRVCFG.STA.STA_b0 :=  false;
#DRVCFG.STA.STA_b1 :=  false;
#DRVCFG.STA.MAINT :=  #ACTCFG.STA.MAINT;
#DRVCFG.STA.STOPING := #ACTCFG.STA.STOPING;
#DRVCFG.STA.STRTING := #ACTCFG.STA.STRTING;
#DRVCFG.STA.STOPED:=   #ACTCFG.STA.STOPED;
#DRVCFG.STA.ISANALOG:= #ACTCFG.STA.ISANALOG;
#DRVCFG.STA.ISREVERS :=  #ACTCFG.STA.ISREVERS;
#DRVCFG.STA.WRKED:=    #ACTCFG.STA.WRKED;
#DRVCFG.STA.DISP:=     #ACTCFG.STA.DISP;
#DRVCFG.STA.MANBX:=    #ACTCFG.STA.MANBX;
#DRVCFG.STA.INIOTBUF:= #ACTCFG.STA.INIOTBUF;
#DRVCFG.STA.INBUF:=    #ACTCFG.STA.INBUF;
#DRVCFG.STA.FRC:=      #ACTCFG.STA.FRC;
#DRVCFG.STA.SML:=      #ACTCFG.STA.SML;
#DRVCFG.STA.BLCK:=     #ACTCFG.STA.BLCK;

#DRVCFG.ALM.ALMSTRT   := #ACTCFG.ALM.ALMSTRT;
#DRVCFG.ALM.ALMSTP    := #ACTCFG.ALM.ALMSTP ;
#DRVCFG.ALM.ALMSHFT   := #ACTCFG.ALM.ALMSHFT ;
#DRVCFG.ALM.ALMINVRTR := #ACTCFG.ALM.ALMBELL;
#DRVCFG.ALM.ALMPWR1   := #ACTCFG.ALM.ALMPWR1;
#DRVCFG.ALM.ALM       := #ACTCFG.ALM.ALM;
#DRVCFG.ALM.WRN       := #ACTCFG.ALM.WRN;
#DRVCFG.ALM.ALMBELL   := #ACTCFG.ALM.ALMBELL;

#DRVHMI.CMD:=#ACTCFG.CMDHMI;

#DRVHMI.STA.%X0  :=#DRVCFG.STA.STA_b0;
#DRVHMI.STA.%X1  :=#DRVCFG.STA.STA_b1;
#DRVHMI.STA.%X2  :=#DRVCFG.STA.MAINT;
#DRVHMI.STA.%X3  :=#DRVCFG.STA.STOPING;
#DRVHMI.STA.%X4  :=#DRVCFG.STA.STRTING;
#DRVHMI.STA.%X5  :=#DRVCFG.STA.STOPED;
#DRVHMI.STA.%X6  :=#DRVCFG.STA.ISANALOG;
#DRVHMI.STA.%X7  :=#DRVCFG.STA.ISREVERS;
#DRVHMI.STA.%X8  :=#DRVCFG.STA.WRKED;
#DRVHMI.STA.%X9  :=#DRVCFG.STA.DISP;
#DRVHMI.STA.%X10 :=#DRVCFG.STA.MANBX;
#DRVHMI.STA.%X11 :=#DRVCFG.STA.INIOTBUF;
#DRVHMI.STA.%X12 :=#DRVCFG.STA.INBUF;
#DRVHMI.STA.%X13 :=#DRVCFG.STA.FRC;
#DRVHMI.STA.%X14 :=#DRVCFG.STA.SML;
#DRVHMI.STA.%X15 :=#DRVCFG.STA.BLCK;

#DRVHMI.ALM.%X0  :=#DRVCFG.ALM.ALMSTRT;
#DRVHMI.ALM.%X1  :=#DRVCFG.ALM.ALMSTP;
#DRVHMI.ALM.%X2  :=#DRVCFG.ALM.ALMSHFT;
#DRVHMI.ALM.%X3  :=#DRVCFG.ALM.ALMINVRTR;
#DRVHMI.ALM.%X4  :=#DRVCFG.ALM.ALMPWR1;
#DRVHMI.ALM.%X5  :=#DRVCFG.ALM.ALM_b5;
#DRVHMI.ALM.%X6  :=#DRVCFG.ALM.ALM;
#DRVHMI.ALM.%X7  :=#DRVCFG.ALM.WRN;
#DRVHMI.ALM.%X8  :=#DRVCFG.ALM.ALMBELL;
#DRVHMI.ALM.%X9  :=#DRVCFG.ALM.ALM_b9;
#DRVHMI.ALM.%X10 :=#DRVCFG.ALM.ALM_b10;
#DRVHMI.ALM.%X11 :=#DRVCFG.ALM.ALM_b11;
#DRVHMI.ALM.%X12 :=#DRVCFG.ALM.ALM_b12;
#DRVHMI.ALM.%X13 :=#DRVCFG.ALM.ALM_b13;
#DRVHMI.ALM.%X14 :=#DRVCFG.ALM.ALM_b14;
#DRVHMI.ALM.%X15 :=#DRVCFG.ALM.ALM_b15;


#DRVHMI.SPD := REAL_TO_INT(#DRVCFG.SPD)*100;


```



## Тестування 

Перед початком тестування необхідно створити 2-3 змінні для ВМ, створити виклики функцій обробки даних ВМ з повною обв'язкою входами та виходами (сигнали зворотнього зв'язку - дискретний сигнал роботи та аналоговий сигнал швидкості, а також вихідні сигнали - дискретний сигнал запуску та аналоговий сигнал заданої швидкості), а також реалізувати обробку технологічних змінних які відповідають за вхідні та вихідні сигнали ВМ.

### Перелік загальних тестів

| Номер | Назва                                                | Коли перевіряти          | Примітки |
| ----- | ---------------------------------------------------- | ------------------------ | -------- |
| 1     | Присвоєння ID та CLSID при старті                    | після реалізації функції |          |
| 2     | Ініціалізація параметрів по замовчуванню             | після реалізації функції |          |
| 3     | Читання до буферу та запис з буферу                  | після реалізації функції |          |
| 4     | Робота вбудованих лічильників часу                   | після реалізації функції |          |
| 5     | Вплив перекидування лічильника часу ПЛК на час кроку | після реалізації функції |          |
| 6     | Керування режимами ВМ                                | після реалізації функції |          |
| 7     | Керування ВМ                                         | після реалізації функції |          |
| 8     | Обробка тривог ВМ                                    | після реалізації функції |          |
| 9     | Алгоритми автоматичного конфігурування ВМ            | після реалізації функції |          |
|       |                                                      |                          |          |



### 1 Присвоєння ID та CLSID при старті

- перед запуском перевірки ПЛК повинен бути в СТОП.
- після запуску усім ВМ змінним, використаним в програмі повинні бути присвоєні ID та CLSID.



### 2 Ініціалізація параметрів по замовчуванню

- перед запуском перевірки ПЛК повинен бути в СТОП.
- після запуску для всіх ВМ час затримки тривоги DRV.T_DEASP прийме значення 200 (2 секунд).



### 3 Читання до буферу та запис з буферу

| Номер | Дія для перевірки                                            | Очікуваний результат                                         | Примітки |
| ----- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| 1     | для довільної змінної подайте команду запису в буфер DRV_HMI.CMD:=16#0100 | ACTBUF.ID прийме значення DRV_CFG.ID,  ACTBUF.CLSID прийме значення DRV_CFG.CLSID, біти статусів, біти алармів та біти параметрів ACTBUF приймуть значення відповідних бітів DRV_CFG та інші параметри DRV_CFG запишуться у відповідні параметри ACTBUF. |          |
| 2     | відправити команду переведення ВМ в ручний режим DRV_HMI.CMD:=16#0301 | біт DRV_HMI.STA.X9, DRV_CFG.STA.DISP та ACTBUF.STA.DISP приймуть значення 1 |          |
| 3     | змінити значення довільного параметра в буфері, наприклад ACTBUF.T_DEASP на 1000, після цього відправте команду через буфер ACTBUF.CMDHMI:=16#0100 для повторного зчитування даних до буфера | змінна повторно зчитається в буфер і змінений параметр прийме попереднє значення. |          |
| 4     | для іншої змінної подайте команду запису в буфер DRV_HMI.CMD:=16#0100 | ACTBUF.ID прийме значення DRV_CFG.ID,  ACTBUF.CLSID прийме значення DRV_CFG.CLSID, біти статусів, біти алармів та біти параметрів ACTBUF приймуть значення відповідних бітів DRV_CFG та інші параметри DRV_CFG запишуться у відповідні параметри ACTBUF. |          |
| 5     | для іншої змінної подайте команду запису в буфер DRV_СFG.CMD.BUFLOAD | ACTBUF.ID прийме значення DRV_CFG.ID,  ACTBUF.CLSID прийме значення DRV_CFG.CLSID, біти статусів, біти алармів та біти параметрів ACTBUF приймуть значення відповідних бітів DRV_CFG та інші параметри DRV_CFG запишуться у відповідні параметри ACTBUF. |          |
| 6     | змінити значення довільного параметра в буфері, наприклад ACTBUF.T_DEASP на 1000, після цього відправте команду через буфер ACTBUF.CMDHMI:=16#0101 для запису даних з буфера до змінної ВМ | в змінну DRV_СFG.T_DEASP запишеться значення з ACTBUF.T_DEASP |          |
|       |                                                              |                                                              |          |



### 4 Робота вбудованих лічильників часу

Плинний час кроку для ВМ `DRV_CFG` відображається в `DRV_CFG.T_STEP1`. Значення відображається в мс. Точність `DRV_CFG.T_STEP1` перевіряється астрономічним годинником. 



### 5 Вплив перекидування лічильника часу ПЛК на час кроку

| Номер | Дія для перевірки                                            | Очікуваний результат                                         | Примітки |
| ----- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| 1     | переглянути як змінюється змінна PLCCFG.TQMS та DRV_CFG.T_STEP1 , точність оцінити за допомогою астрономічним годинником | PLCCFG.TQMS та DRV_CFG.T_STEP1 рахують час в мс              |          |
| 2     | в PLCCFG.TQMS записати значення   16#FFFF_FFFF - 5000 (5000 мс до кінця діапазону)  та в DRV_CFG.T_STEP1 записати значення 16#7FFF_FFFF - 10000 (10000 мс до кінця діапазону) | певний час (5000 мc) час буде рахуватись в звичайному вигляді, але коли PLCCFG.TQMS досягне верху діапазону (16#FFFF_FFFF), то PLCCFG.TQMS почне рахувати з початку, а DRV_CFG.T_STEP1 рахуватиме в нормальному режимі поки не прийме максимальне значення свого діапазону (16#7FFFFFFF) і відлік для нього зупиниться |          |
| 3     | Подати команду на відкриття DRV_CFG.CMD.OPN                  | DRV_CFG.T_STEP1 почне рахувати час з початку                 |          |



### 6 Керування режимами ВМ

| Номер | Дія для перевірки                                            | Очікуваний результат                                         | Примітки |
| ----- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| 1     | для довільної змінної подайте команду запису в буфер DRV_HMI.CMD:=16#0100 | ACTBUF.ID прийме значення DRV_CFG.ID,  ACTBUF.CLSID прийме значення DRV_CFG.CLSID, біти статусів, біти алармів та біти параметрів ACTBUF приймуть значення відповідних бітів DRV_CFG та інші параметри DRV_CFG запишуться у відповідні параметри ACTBUF. |          |
| 2     | відправити команду переведення ВМ в ручний режим DRV_HMI.CMD:=16#0301 | біт DRV_HMI.STA.X9, DRV_CFG.STA.DISP та ACTBUF.STA.DISP приймуть значення 1 |          |
| 3     | відправити команду переведення ВМ в автоматичний режим DRV_HMI.CMD:=16#0302 | біт DRV_HMI.STA.X9, DRV_CFG.STA.DISP та ACTBUF.STA.DISP приймуть значення 0 |          |
| 4     | відправити команду переключення режиму ВМ DRV_HMI.CMD:=16#0300 | біт DRV_HMI.STA.X9, DRV_CFG.STA.DISP та ACTBUF.STA.DISP приймуть протилежне значення |          |
| 5     | відправити команду переведення ВМ в ручний режим DRV_CFG.CMD.MAN | біт DRV_HMI.STA.X9, DRV_CFG.STA.DISP та ACTBUF.STA.DISP приймуть значення 1 |          |
| 6     | відправити команду переведення ВМ в автоматичний режим DRV_CFG.CMD.AUTO | біт DRV_HMI.STA.X9, DRV_CFG.STA.DISP та ACTBUF.STA.DISP приймуть значення 0 |          |
| 7     | відправити команду переведення ВМ в ручний режим ACTBUF.CMDHMI:=16#0301 | біт DRV_HMI.STA.X9, DRV_CFG.STA.DISP та ACTBUF.STA.DISP приймуть значення 1 |          |
| 8     | відправити команду переведення ВМ в автоматичний режим ACTBUF.CMDHMI:=16#0302 | біт DRV_HMI.STA.X9, DRV_CFG.STA.DISP та ACTBUF.STA.DISP приймуть значення 0 |          |
| 9     | відправити команду переключення режиму ВМ ACTBUF.CMDHMI:=16#0300 | біт DRV_HMI.STA.X9, DRV_CFG.STA.DISP та ACTBUF.STA.DISP приймуть протилежне значення |          |
| 10    | переведіть всі виконавчі механізми в автоматичний режим      | значення біта наявності ВМ в ручному режимі PLCCFG.STA_PERM.X9 - повинно бути рівне 0, і кількість ВМ в ручному режимі PLCCFG.CNTMAN_PERM теж повинно бути рівне 0 |          |
| 11    | переведіть декілька ВМ в ручний режим                        | значення біта наявності ВМ в ручному режимі PLCCFG.STA_PERM.X9 - повинно бути рівне 1, і кількість ВМ в ручному режимі PLCCFG.CNTMAN_PERM повинно бути рівне кількості ВМ переведених в ручний режим |          |
|       |                                                              |                                                              |          |



### 7 Керування ВМ

| Номер | Дія для перевірки                                            | Очікуваний результат                                         | Примітки |
| ----- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| 1     | відправити команду переведення ВМ в автоматичний режим DRV_CFG.CMD.AUTO | біт DRV_HMI.STA.X9, DRV_CFG.STA.DISP та ACTBUF.STA.DISP приймуть значення 0 |          |
| 2     | відправити команду запуску ВМ в автоматичному режимі DRV_CFG.CMD.START | технологічна змінна яка відповідає за вихід запустити прийме значення 1 CSTRT.STA.VALB = 1 <br />ВМ перейде в стан запускається, про що вкаже біт стану DRV_CFG.STA.STRTING = 1 та номер кроку DRV_CFG.STEP1 = 2.<br />при появі сигналу від датчика роботи ВМ перейде в стан запущено DRV_CFG.STA.WRKED = 1 та номер кроку DRV_CFG.STEP1 = 4<br />кількість запусків DRV_CFG.CNTPER збільшиться на 1 |          |
| 3     | відправити команду зупинки ВМ в автоматичному режимі DRV_CFG.CMD.STOP | технологічна змінна яка відповідає за вихід запустити прийме значення 0 CSTRT.STA.VALB = 0 <br />ВМ перейде в стан зупиняється, про що вкаже біт стану DRV_CFG.STA.STOPING = 1 та номер кроку DRV_CFG.STEP1 = 3.<br />при зникненні сигналу від датчика роботи ВМ перейде в стан зупинено DRV_CFG.STA.STOPED = 1 та номер кроку DRV_CFG.STEP1 = 5<br />кількість запусків DRV_CFG.CNTPER збільшиться на 1 |          |
| 4     | відправити команду переведення ВМ в ручний режим DRV_HMI.CMD:=16#0301 | біт DRV_HMI.STA.X9, DRV_CFG.STA.DISP та ACTBUF.STA.DISP приймуть значення 1 |          |
| 5     | відправити команду зупинки ВМ в ручному режимі DRV_HMI.CMD:=16#0011 | технологічна змінна яка відповідає за вихід запустити прийме значення 1 CSTRT.STA.VALB = 1 <br />ВМ перейде в стан запускається, про що вкаже біт стану DRV_CFG.STA.STRTING = 1 та номер кроку DRV_CFG.STEP1 = 2.<br />при появі сигналу від датчика роботи ВМ перейде в стан запущено DRV_CFG.STA.WRKED = 1 та номер кроку DRV_CFG.STEP1 = 4<br />кількість запусків DRV_CFG.CNTPER збільшиться на 1 |          |
| 6     | відправити команду зупинки ВМ в ручному режимі DRV_HMI.CMD:=16#0012 | технологічна змінна яка відповідає за вихід запустити прийме значення 0 CSTRT.STA.VALB = 0 <br />ВМ перейде в стан зупиняється, про що вкаже біт стану DRV_CFG.STA.STOPING = 1 та номер кроку DRV_CFG.STEP1 = 3.<br />при зникненні сигналу від датчика роботи ВМ перейде в стан зупинено DRV_CFG.STA.STOPED = 1 та номер кроку DRV_CFG.STEP1 = 5<br />кількість запусків DRV_CFG.CNTPER збільшиться на 1 |          |
| 7     | подайте команду запису в буфер DRV_HMI.CMD:=16#0100          | ACTBUF.ID прийме значення DRV_CFG.ID,  ACTBUF.CLSID прийме значення DRV_CFG.CLSID, біти статусів, біти алармів та біти параметрів ACTBUF приймуть значення відповідних бітів DRV_CFG та інші параметри DRV_CFG запишуться у відповідні параметри ACTBUF. |          |
| 8     | відправити команду зупинки ВМ в ручному режимі через буфер ACTBUF.CMDHMI:=16#0011 | технологічна змінна яка відповідає за вихід запустити прийме значення 1 CSTRT.STA.VALB = 1 <br />ВМ перейде в стан запускається, про що вкаже біт стану DRV_CFG.STA.STRTING = 1 та номер кроку DRV_CFG.STEP1 = 2.<br />при появі сигналу від датчика роботи ВМ перейде в стан запущено DRV_CFG.STA.WRKED = 1 та номер кроку DRV_CFG.STEP1 = 4<br />кількість запусків DRV_CFG.CNTPER збільшиться на 1 |          |
| 9     | відправити команду зупинки ВМ в ручному режимі через буфер ACTBUF.CMDHMI:=16#0012 | технологічна змінна яка відповідає за вихід запустити прийме значення 0 CSTRT.STA.VALB = 0 <br />ВМ перейде в стан зупиняється, про що вкаже біт стану DRV_CFG.STA.STOPING = 1 та номер кроку DRV_CFG.STEP1 = 3.<br />при зникненні сигналу від датчика роботи ВМ перейде в стан зупинено DRV_CFG.STA.STOPED = 1 та номер кроку DRV_CFG.STEP1 = 5<br />кількість запусків DRV_CFG.CNTPER збільшиться на 1 |          |
| 1     | відправити команду переведення ВМ в автоматичний режим DRV_CFG.CMD.AUTO | біт DRV_HMI.STA.X9, DRV_CFG.STA.DISP приймуть значення 0     |          |
| 2     | змінити задане значення ВМ в автоматичному режимі DRV_CFG.CSPD | технологічна змінна CSPD.VAL яка відповідає за вихід ВМ прийме значення задане в DRV_CFG.CSPD<br />DRV_HMI.CSPD прийме значення DRV_CFG.CSPD |          |
| 3     | відправити команду переведення ВМ в ручний режим DRV_CFG.CMD.MAN | біт DRV_HMI.STA.X9, DRV_CFG.STA.DISP приймуть значення 1     |          |
| 4     | змінити задане значення ВМ в ручному режимі DRV_HMI.CSPD     | технологічна змінна CSPD.VAL яка відповідає за вихід ВМ прийме значення задане в DRV_HMI.CSPD<br />DRV_CFG.CSPD прийме значення DRV_HMI.CSPD |          |
| 5     | відправити команду запису в буфер  DRV_CFG.CMD.BUFLOAD       | ACTBUF.ID прийме значення DRV_CFG.ID,  ACTBUF.CLSID прийме значення DRV_CFG.CLSID, біти статусів, біти алармів та біти параметрів ACTBUF приймуть значення відповідних бітів DRV_CFG та інші параметри DRV_CFG запишуться у відповідні параметри ACTBUF. |          |
| 6     | змінити задане значення ВМ в ручному режимі через буфер ACTBUF.CSPD | технологічна змінна CSPD.VAL яка відповідає за вихід ВМ прийме значення задане в ACTBUF.CSPD<br />DRV_HMI.CSPD та DRV_CFG.CSPD прийме значення ACTBUF.CSPD |          |
|       |                                                              |                                                              |          |
|       |                                                              |                                                              |          |



### 8 Обробка тривог ВМ

| Номер | Дія для перевірки                                            | Очікуваний результат                                         | Примітки |
| ----- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| 1     | відправити команду переведення ВМ в автоматичний режим DRV_CFG.CMD.AUTO | біт DRV_HMI.STA.X9, DRV_CFG.STA.DISP та ACTBUF.STA.DISP приймуть значення 0 |          |
| 2     | відправити команду зупинки ВМ в автоматичному режимі DRV_CFG.CMD.STOP | технологічна змінна яка відповідає за вихід запустити прийме значення 0 CSTRT.STA.VALB = 0 <br />ВМ перейде в стан зупиняється, про що вкаже біт стану DRV_CFG.STA.STOPING = 1 та номер кроку DRV_CFG.STEP1 = 3.<br />при зникненні сигналу від датчика роботи ВМ перейде в стан зупинено DRV_CFG.STA.STOPED = 1 та номер кроку DRV_CFG.STEP1 = 5<br />кількість запусків DRV_CFG.CNTPER збільшиться на 1 |          |
| 3     | зафорсувати датчик сигналу робота та переведіть його в значення 0 | біт форсування технологічної змінної датчика сигналу роботи DIVAR_CFG.STA.FRC прийме значення 1, біт значення технологічної змінної DIVAR_CFG.STA.VALB прийме значення 0, та біт про наявність форсованих технологічних змінних, які належать до ВМ DRV_CFG.STA.FRC прийме значення 1. |          |
| 4     | відправити команду запуску ВМ в автоматичному режимі DRV_CFG.CMD.START | технологічна змінна яка відповідає за вихід запустити прийме значення 1 CSTRT.STA.VALB = 1 <br />ВМ перейде в стан запускається, про що вкаже біт стану DRV_CFG.STA.STRTING = 1 та номер кроку DRV_CFG.STEP1 = 2.<br />після проходження часу затримки тривоги DRV_CFG.T_DEASP з'явиться тривога ВМ не запустився про що вкаже біт тривоги не запустився DRV_CFG.ALM.ALMSTRT=1 та загальний біт тривоги ВМ DRV_CFG.ALM.ALM=1<br />при появі тривоги ВМ технологічна змінна яка відповідає за вихід запустити прийме значення 0 CSTRT.STA.VALB = 0, а ВМ перейде в стан заблоковано на що вказує біт DRV_CFG.STA.BLCK = 1<br />значення біта тривог в системі керування про наявність заблокованих ВМ PLCCFG.ALM1_PERM.X2 - повинно бути рівне 1<br />значення біта тривог в системі керування PLCCFG.ALM1_PERM.X0 - повинно бути рівне 1, і кількість тривог PLCCFG.CNTALM_PERM теж повинно бути рівне 1<br />кількість перестановок DRV_CFG.CNTPER збільшиться на 1<br />кількість тривог DRV_CFG.CNTALM збільшиться на 1 |          |
| 5     | дефорсувати датчик сигналу робота                            | біт форсування технологічної змінної датчика сигналу роботи DIVAR_CFG.STA.FRC прийме значення 0 |          |
| 6     | відправити команду розблокування DRV_CFG.CMD.DBLCK           | ВМ вийде з стану заблоковано на що вказує біт DRV_CFG.STA.BLCK = 0 |          |
| 7     | відправити команду запуску ВМ в автоматичному режимі DRV_CFG.CMD.START | технологічна змінна яка відповідає за вихід запустити прийме значення 1 CSTRT.STA.VALB = 1 <br />ВМ перейде в стан запускається, про що вкаже біт стану DRV_CFG.STA.STRTING = 1 та номер кроку DRV_CFG.STEP1 = 2.<br />при появі сигналу від датчика роботи ВМ перейде в стан запущено DRV_CFG.STA.WRKED = 1 та номер кроку DRV_CFG.STEP1 = 4<br />кількість запусків DRV_CFG.CNTPER збільшиться на 1 |          |
| 8     | зафорсувати датчик сигналу робота та переведіть його в значення 1 | біт форсування технологічної змінної датчика сигналу роботи DIVAR_CFG.STA.FRC прийме значення 1, біт значення технологічної змінної DIVAR_CFG.STA.VALB прийме значення 1, та біт про наявність форсованих технологічних змінних, які належать до ВМ DRV_CFG.STA.FRC прийме значення 1. |          |
| 9     | відправити команду зупинки ВМ в автоматичному режимі DRV_CFG.CMD.STOP | технологічна змінна яка відповідає за вихід запустити прийме значення 0 CSTRT.STA.VALB = 0 <br />ВМ перейде в стан зупиняється, про що вкаже біт стану DRV_CFG.STA.STOPING = 1 та номер кроку DRV_CFG.STEP1 = 3.<br />після проходження часу затримки тривоги DRV_CFG.T_DEASP з'явиться тривога ВМ не зупинився про що вкаже біт тривоги не зупинився DRV_CFG.ALM.ALMSTР=1 та загальний біт тривоги ВМ DRV_CFG.ALM.ALM=1<br />ВМ перейде в стан заблоковано на що вказує біт DRV_CFG.STA.BLCK = 1<br />значення біта тривог в системі керування про наявність заблокованих ВМ PLCCFG.ALM1_PERM.X2 - повинно бути рівне 1<br />значення біта тривог в системі керування PLCCFG.ALM1_PERM.X0 - повинно бути рівне 1, і кількість тривог PLCCFG.CNTALM_PERM теж повинно бути рівне 1<br />кількість перестановок DRV_CFG.CNTPER збільшиться на 1<br />кількість тривог DRV_CFG.CNTALM збільшиться на 1 |          |
| 10    | відправити команду розблокування DRV_CFG.CMD.DBLCK           | оскільки значення зворотнього звязку про роботу ще в 1 DIVAR_CFG.STA.VALB = 1, ВМ залишиться в стані заблоковано на що вказує біт DRV_CFG.STA.BLCK = 1, але згенерується нова тривога порушення стану (присутній сигнал про роботу без команди запуску) DRV_CFG.ALM.ALMSHFT=1<br />значення біта тривог в системі керування про наявність заблокованих ВМ PLCCFG.ALM1_PERM.X2 - повинно бути рівне 1<br />значення біта тривог в системі керування PLCCFG.ALM1_PERM.X0 - повинно бути рівне 1, і кількість тривог PLCCFG.CNTALM_PERM теж повинно бути рівне 1<br />кількість тривог DRV_CFG.CNTALM збільшиться на 1 |          |
| 11    | дефорсувати датчик сигналу робота                            | біт форсування технологічної змінної датчика сигналу роботи DIVAR_CFG.STA.FRC прийме значення 0 |          |
| 12    | відправити команду розблокування DRV_CFG.CMD.DBLCK           | оскільки значення зворотнього звязку про роботу вже не приходить DIVAR_CFG.STA.VALB = 0, ВМ вийде з стану заблоковано на що вказує біт DRV_CFG.STA.BLCK = 0, <br />значення біта наявність заблокованих ВМ в системі керування PLCCFG.ALM1_PERM.X2 - повинно бути рівне 0<br />значення біта тривог в системі керування PLCCFG.ALM1_PERM.X0 - повинно бути рівне 0, і кількість тривог PLCCFG.CNTALM_PERM теж повинно бути рівне 0<br /> |          |
|       |                                                              |                                                              |          |



### 9 Алгоритми автоматичного конфігурування ВМ

| Номер | Дія для перевірки                                            | Очікуваний результат                                         | Примітки |
| ----- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| 1     | перевірити значення параметрів DRV_CFG.PRM.PRM_MANCFG, DRV_CFG.PRM.PRM_ZWRKENBL, DRV_CFG.PRM.PRM_ZPOSENBL | ручне конфігурування вимкнене DRV_CFG.PRM.PRM_MANCFG = 0, <br />є зовнішній вхід - зворотній зв'язок про роботу DRV_CFG.PRM.PRM_ZWRKENBL = 1, <br />є аналоговий зворотній зв'язок частоти/позиції DRV_CFG.PRM.PRM_ZPOSENBL = 1 |          |
| 2     | перевести біт ввімкнення ручного конфігурування в 1 DRV_CFG.PRM.PRM_MANCFG:=1<br />перевести біт є зовнішній вхід - зворотній зв'язок про роботу в 0 DRV_CFG.PRM.PRM_ZWRKENBL:=0,<br />перевести біт є аналоговий зворотній зв'язок частоти/позиції в 0 DRV_CFG.PRM.PRM_ZPOSENBL:=0, | параметр ручне конфігурування залишиться  вимкненим DRV_CFG.PRM.PRM_MANCFG = 0, <br />параметр є є зовнішній вхід - зворотній зв'язок про роботу DRV_CFG.PRM.PRM_ZWRKENBL = 1<br />параметр є аналоговий зворотній зв'язок частоти/позиції DRV_CFG.PRM.PRM_ZPOSENBL = 1<br />оскільки дана опція відключена і використовується лише автоматичне конфігурування. |          |
| 3     | для технологічно змінної яка відповідає за зворотній зв'язок про роботу активуйте параметр змінна не задіяна DIVAR_CFG.PRM.DSBL | біт який вказує на активність змінної перейде в значення 0 DIVAR_CFG.STA.ENBL = 0,<br />параметр є зовнішній вхід - зворотній зв'язок про роботу перейде в значення 0 DRV_CFG.PRM.PRM_ZWRKENBL = 0 |          |
| 4     | відправити команду переведення ВМ в автоматичний режим DRV_CFG.CMD.AUTO | ВМ перейде в автоматичний режим DRV_CFG.STA.DISP = 0         |          |
| 5     | відправити команду запуску ВМ в автоматичному режимі DRV_CFG.CMD.START | технологічна змінна яка відповідає за вихід запустити прийме значення 1 CSTRT.STA.VALB = 1 <br />ВМ перейде в стан запускається, про що вкаже біт стану DRV_CFG.STA.STRTING = 1 та номер кроку DRV_CFG.STEP1 = 2.<br />оскільки ВМ працює без датчика сигналу роботи ВМ відразу перейде в стан запущено DRV_CFG.STA.WRKED = 1 та номер кроку DRV_CFG.STEP1 = 4<br />кількість запусків DRV_CFG.CNTPER збільшиться на 1 |          |
| 6     | відправити команду зупинки ВМ в автоматичному режимі DRV_CFG.CMD.STOP | технологічна змінна яка відповідає за вихід запустити прийме значення 0 CSTRT.STA.VALB = 0 <br />ВМ перейде в стан зупиняється, про що вкаже біт стану DRV_CFG.STA.STOPING = 1 та номер кроку DRV_CFG.STEP1 = 3.<br />оскільки ВМ працює без датчика сигналу роботи ВМ відразу перейде в стан зупинено DRV_CFG.STA.STOPED = 1 та номер кроку DRV_CFG.STEP1 = 5<br />кількість запусків DRV_CFG.CNTPER збільшиться на 1 |          |
| 7     | змінити значення технологічної змінної яка відповідає за аналоговий зворотній зв'язок ВМ | відповідне значення повинно відобразитись в DRV_CFG.SPD та DRV_HMI.SPD (перетворене в діапазон 0-10000) |          |
| 8     | для технологічно змінної яка відповідає за аналоговий зворотній зв'язок активуйте параметр змінна не задіяна AIVAR_CFG.PRM.DSBL | біт який вказує на активність змінної перейде в значення 0 AIVAR_CFG.STA.ENBL = 0,<br />параметр є аналоговий зворотній зв'язок частоти/позиції перейде в значення 0 DRV_CFG.PRM.PRM_ZPOSENBL = 0<br />DRV_CFG.SPD та DRV_HMI.SPD (перетворене в діапазон 0-10000) прийме значення записане в DRV_CFG.CSPD |          |
| 9     | змінити задане значення ВМ в автоматичному режимі DRV_CFG.CSPD | DRV_CFG.SPD та DRV_HMI.SPD (перетворене в діапазон 0-10000) прийме значення записане в DRV_CFG.CSPD |          |
|       |                                                              |                                                              |          |
|       |                                                              |                                                              |          |
|       |                                                              |                                                              |          |
|       |                                                              |                                                              |          |
|       |                                                              |                                                              |          |
|       |                                                              |                                                              |          |