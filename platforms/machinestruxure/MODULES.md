# Клас MODULES: в Codesys 3.5 (Machine Expert Shneider Electric)

**CLSID=16#220x**

## Загальний опис

Версія Codesys - 3.5.

Версія Machine Expert - 1.2.

### Інтерфейс блоку 

```pascal
FUNCTION MODULES : BOOL
VAR_INPUT
END_VAR
VAR
i:	INT;
j:	INT;
sbmtype:	INT;
sbmchcnts:	INT;
sbmstrtnmb:	INT;
sbmCMD:	INT;
modtype:	INT;
modchcnts:	INT;
modSTA:	INT;
mask:	INT;
cmdLoadsbm:	BOOL;
cmdLoadch:	BOOL;
sbmbad:	BOOL;
inbuf:	BOOL;
zm:	INT;
k:	INT;

END_VAR

```



### Реалізація програми блоку 

```pascal
	//перебір усіх модулів
FOR i := 0 TO SYS.PLCCFG.MODULSCNT - 1 DO
    modtype := HMI.MODULES[i].TYPE1; //тип модуля
    modchcnts := HMI.MODULES[i].CHCNTS;//кількість каналів в кожному підмодулі
    modSTA := 0; //стан
    //проходження по підмодулям
    FOR j := 0 TO 3 DO
        zm := 12 - 4 * j; //зміщення для SHIFT
        //тип підмодуля
        sbmtype := SHR(modtype, zm) AND 16#000F;
        //кількість каналів у підмодулі
        sbmchcnts := (SHR(modchcnts, zm) AND 16#000F) + 1;
        //початковий індекс каналу 
        sbmstrtnmb := HMI.MODULES[i].STRTNMB[j];
        //перевірка бітових команд
        mask := 16#0800; //маска для зміщення біту команди
        cmdLoadsbm := (HMI.MODULES[i].STA AND SHR(mask, j)) <> 0;
        //завантаження в буфер підмодуля
        IF cmdLoadsbm THEN
            BUF.SUBMODULE.TYPE1 := sbmtype;
            BUF.SUBMODULE.CNT := sbmchcnts;
            BUF.SUBMODULE.STRTNMB := sbmstrtnmb;
        END_IF;
        //визначення помилки на модулі по біту MERR першого каналу в модулі
        CASE sbmtype OF
            1:  //DI
                sbmbad := CH.CHDI[sbmstrtnmb].STA.6; //MERR
            2:  //DQ
                sbmbad := CH.CHDO[sbmstrtnmb].STA.6; //MERR
            3:  //AI
                sbmbad := CH.CHAI[sbmstrtnmb].STA.6; //MERR
            4:  //AO
                sbmbad := CH.CHAO[sbmstrtnmb].STA.6; //MERR
        END_CASE;
        mask := 16#0008; //маска для зміщення біту помилки
        IF sbmbad THEN
            modSTA := modSTA OR SHR(mask, j);
        END_IF;
        //визначення того, що цей підмодуль в буфері  
        inbuf := sbmtype <> 0 AND (BUF.SUBMODULE.TYPE1 = sbmtype) AND (BUF.SUBMODULE.STRTNMB = sbmstrtnmb);
        mask := 16#0080;
        IF inbuf THEN
            modSTA := modSTA OR SHR(mask, j);        END_IF;
        //робота підмодулем в буфері
        IF inbuf THEN
            sbmCMD := BUF.SUBMODULE.CMD;//команда для підмодуля
            //перевірка команди і завантаження значення каналів в буфер 
            FOR k := 0 TO sbmchcnts DO
                cmdLoadch := sbmCMD = k + 1; //завантажити канал
                CASE sbmtype OF
                    16#1:  //DI
                        CH.CHDI[sbmstrtnmb + k].STA.15 := cmdLoadch;
                        BUF.SUBMODULE.CH[k] := CH.CHDI[sbmstrtnmb + k];
                    16#2:  //DQ
                        CH.CHDO[sbmstrtnmb + k].STA.15 := cmdLoadch;
                        BUF.SUBMODULE.CH[k] := CH.CHDO[sbmstrtnmb + k];
                    16#3:  //AI
                        CH.CHAI[sbmstrtnmb + k].STA.15 := cmdLoadch;
                        BUF.SUBMODULE.CH[k] := CH.CHAI[sbmstrtnmb + k];
                    16#4:  //AO
                        CH.CHAO[sbmstrtnmb + k].STA.15 := cmdLoadch;
                        BUF.SUBMODULE.CH[k] := CH.CHAO[sbmstrtnmb + k];
                END_CASE;
            END_FOR;
            BUF.SUBMODULE.CMD := 0;
        END_IF;
    END_FOR;
    
    //запис стану в модуль
    HMI.MODULES[i].STA := modSTA;
    
END_FOR;


```



