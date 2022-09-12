

```pascal
(*
	1000: ГОТОВНІСТЬ
	2050..2099: (НА НАБІР ВАКУУМУ
	2100..2149: НАБІР
	2150..2199: ПОПЕРДНЄ УВАРЮВАННЯ
	2200..2249:  УВАРЮВАННЯ
	2250..2299:  ВВЕДЕННЯ ЗАТРАВКИ
	2300..2349:  ВВЕДЕННЯ СТАБІЛІЗАЦІЯ
	2350..2399:  ВВЕДЕННЯ ПІДКАЧКА
	2400..2449:  ВВЕДЕННЯ ВАРІННЯ
	2450..2499:  ЗГУЩЕННЯ
	2500..2549:  ВИВАНТАЖЕННЯ
	2550..2599: ПРОПАРЮВАННЯ	        
	2600..2649: УТРИМУВАННЯ НА ВОДІ
біти алармів програми варки
PU.ALM.0 - 1-ВІДСУТНІЙ ПРОДУКТ ДЛЯ НАБОРУ АПАРАТУ
PU.ALM.1 - 1 - PAUSE ENABLE
...

ДОДАТКОВІ КОМАНДИ HMI
16#301 - вибрати варку на затравці 
16#302 - вибрати варку на маточному утфелі
16#303 - вибрати варку маточного утфелю
16#304 - підтвердження оператором введння суспензії у воронку
16#305 - підтвердження оператором ручного введння затравки

БІТОВІ ПАРАМЕТРИ ФОРМУЛИ
FORMULA.PRM1.0 - дозвіл на автоматичний набір апарату
...
*)

(*збір алармів та повідомлень з етапів*)
HMI.PU.ALM:=0;(**)
HMI.PU.ALM.0:=HMI.GOTOV.ALM.0 OR HMI.NABVAK.ALM.0;(*ВІДСУТНІЙ ПРОДУКТ ДЛЯ НАБОРУ АПАРАТУ*)
...
CTRL.VARKA.STA_HOLD OR CTRL.ZGUST.STA_HOLD OR 
   CTRL.VYVANT.STA_HOLD OR CTRL.PROPAR.STA_HOLD;(*апарат утримується на воді*)

(*діалогові команди*)
CASE HMI.PU.CMD OF
	16#0304: HMI.PREUVAR.ALM.6:=FALSE;	(*підтвердження оператором введння суспензії у воронку*)	
	.. 
END_CASE;

(*діапазон режимної карти*)
IF CTRLRCP.REG_KART<1 OR CTRLRCP.REG_KART>3 THEN
	CTRLRCP.REG_KART:=1;
	i:=FORMULA.ID;
	FORMULA:=MRFRML[1];
	FORMULA.ID:=i;(*ID повернути назад*)	
END_IF;  

(*при перщму циклі зчитати шаблонну режимну карту *)
IF PLC.STA.12 THEN
	i:=FORMULA.ID;
	FORMULA:=MRFRML[CTRLRCP.REG_KART];
	FORMULA.ID:=i;(*ID повернути назад*)
END_IF;

(*якщо хоча б один з ВМ в ручному режимі, то включається напівавтоматичний режим*)
(*при напівавтоматі перехід на інший крок тільки по командів*)
SEMIAUTO:=VA.Z1.STA.9 OR VA.Z2.STA.9 OR VA.Z3.STA.9 OR VA.Z4.STA.9 OR VA.Z5.STA.9 OR VA.Z6.STA.9 OR
	VA.Z7.STA.9 OR VA.Z8.STA.9 OR VA.Z9.STA.9 OR VA.Z10.STA.9 OR VA.Z11.STA.9 OR VA.Z12.STA.9 OR VA.Z13.STA.9 OR
	VA.K1.STA.9 OR VA.K2.STA.9 OR VA.K3.STA.9 OR VA.K4.STA.9;
(*усі етапи наслідують режим SEMIAUTO*)
CFG.PU.STA.11 := SEMIAUTO;
CFG.NABVAK.STA.11 := SEMIAUTO; 
...

(*дозволи на автоматичний перехід з попередніх кроків*)
AUTSTR_NABIR := FORMULA.PRM1.0;(*дозвіл на автоматичний набір апарату*)
AUTSTR_PREUVAR :=TRUE;
AUTSTR_UVAR := TRUE; 
AUTSTR_ZATRAV := FORMULA.PRM1.5;(*дозвіл на автоматичне введення затравки*)
...

(*дозволи на запуск етапів - за замовченням не даєм нікому, довзоли включаються за умови*)
CTRL.NABVAK.ENBL := false; CTRL.NABIR.ENBL  := false; CTRL.PREUVAR.ENBL  := false; 
CTRL.UVAR.ENBL  := false; CTRL.ZATRAV.ENBL  := false; CTRL.STABIL.ENBL  := false;
CTRL.PIDKACH.ENBL  := false; CTRL.VARKA.ENBL := false; CTRL.ZGUST.ENBL  := false;
CTRL.VYVANT.ENBL  := false; CTRL.PROPAR.ENBL  := false; CTRL.UTRYM.ENBL  := false;

(*індиктор зупинки/простою/завершення усіх етапів, окрім "готовності" та "утримання на воді"*)
PHALL_STA_ISSTOP:= (CTRL.NABVAK.STA_IDLE OR CTRL.NABVAK.STA_COMPLETE OR CTRL.NABVAK.STA_STOPPED) and    (CTRL.NABIR.STA_IDLE OR CTRL.NABIR.STA_COMPLETE OR CTRL.NABIR.STA_STOPPED) and ...;

PHALL_CMD_STOP:=false;(*всі етапи в стоп, переводяться тыльки активні*)
PHALL_CMD_RESET := false;(*всі етапи в reset, переводяться тільки в кінцевих станах*)
PAUSE_ENBL:=false; (*дозвіл на переход стоп-паузу*)

(*рівність кроків переходу та активних кроків - кратність 50*)
STEP_EQ_TOSTEP:=(CTRLRCP.STRT_STEP>CFG.PU.STEP2-50) AND (CTRLRCP.STRT_STEP <= CFG.PU.STEP2);
JUMP_ENBL:=false;(*для дозволів переходів*)
(*дозвіл на запуск програми варки*)
CTRL.PU.ENBL := (CTRLRCP.STRT_STEP=2050) AND(*тільки якщо вибраний етап набору вакууму*) 
		(P1.L2.VAL >= FORMULA.L2_SP);(*якщо рівень в збірнику утфелю быльше заданого*)


(*ПІДРАХУНОК ЧАСУ УТРИМУВАННЯ В СЕКУНДАХ - ручне утримання *)
IF PLC.PLS.3 AND (CTRL.UTRYM.STA_RUNNING OR
	CTRL.NABVAK.STA_HOLD OR CTRL.NABIR.STA_HOLD OR CTRL.PREUVAR.STA_HOLD ... THEN
  CTRLRCP.TIME_UTRYM:=CTRLRCP.TIME_UTRYM+1;
END_IF;

(*==========================================простоювання*)   
IF CTRL.PU.STA_IDLE THEN
    CFG.PU.STEP2:=1000;
    CTRL.GOTOV.CMD_START:=TRUE; (*ПРИ ЗАПУСКУ ЮНІТА ЗАПУСТИТИ ЕТАП ПЕРЕВІРКИ ГОТОВНОСТІ АПАРАТУ*)
    CTRLRCP.TIME_UTRYM:=0;

    (*зупинка і ніціалізація усіх інших етапів, якщо вони не зупинилися до цього*)	
    if CFG.GOTOV.T_STEP2<3 then 
        PHALL_CMD_STOP:=TRUE;
        CTRL.UTRYM.CMD_STOP:=TRUE;
        CTRLRCP.TIME_STOP:=PLC.NOW;
    else
    	PHALL_CMD_RESET:=true;
    END_IF;	
    if CFG.PU.T_STEP2=15 THEN  
    	CTRLRCP.BATCHID:='';
    END_IF;	
    (*скинути команду набору, якщо вибраний не крок набору вакуму або немає довзолу на набор вакуму*)	
    IF HMI.PU.CMD=1 AND (CTRLRCP.STRT_STEP<>2050 OR HMI.PU.ALM.2) THEN
    	HMI.PU.CMD:=0;	
    	CTRLRCP.STRT_STEP:=1000; 			
    END_IF;

    (*режимна карта змінюється тільки в простою*)
    i:= HMI.PU.CMD - 16#300; (*визначення номеру режимної карти з команди*)
    IF i>=1 AND I<=3 THEN
    	IF CTRLRCP.REG_KART<>i THEN (*якщо режимна карта відрізняється від командної*)
		CTRLRCP.REG_KART:=i;
		j:=FORMULA.ID;
		FORMULA:= MRFRML[i];(*прочитати формульні параметри з мастер-формули*)
		FORMULA.ID:=j;(*ID вернути назад*)
	END_IF;
    END_IF; 
	PAUSE_ENBL:=FALSE;
	CTRL.NABVAK.ENBL := NOT HMI.PU.ALM.2; 

	VA.P1.PRM.0:=false; VA.P1.PRM.1:=false; VA.P1.PRM.2:=false; VA.P1.PRM.3:=false;

(*0 LOENBL
1 HIENBL
2 LOLOENBL
3 HIHIENBL
4 BRKENBL
5 OVRLENBL
6 QALENBL
7 CHENBL
8 PWLENBL*)
	
		

END_IF;

(*13000 ================================================= Starting*)
IF CTRL.PU.STA_STARTING THEN
    CASE CFG.PU.STEP2 OF
        13000:CFG.PU.STEP2:=13010;CFG.PU.T_STEP2:=0;
		FORMULA.PRM3.14:=FORMULA.PRM1.3;(* - використання 3 корпусу пари збережено під час початку варки *)
        	FORMULA.PRM3.15:=FORMULA.PRM1.4;(* - використання 4 корпусу пари збережено під час початку варки *)
        13010:(**)
	      CTRL.GOTOV.HL_RUNNING_CMPLT:=TRUE;(*ЗАВЕРШИТИ ЕТАП ПЕРЕВІРКИ ГОТОВНОСТІ*)
	      (*формування ID варки час+номер апарату*)	
	      RRTC_DT (OUT=>NOW);(*дата час*)
	      STR2:=DT_TO_STRING (NOW);	       	
	      STR2:=CONCAT_STR (IN1:=STR2, IN2:= 'A');
	      STR1:=int_to_string(ID/100);(*номер апарату*)
	      STR1:= MID_INT(STR1, 1, 6);
	      STR2:= CONCAT_STR (IN1:=STR2, IN2:= STR1);	      
	      STR2:= CONCAT_STR (IN1:=STR2, IN2:='S');
	      STR1:=int_to_string(PLC.SHIFTNMB);(*номер зміни*)
	      STR1:= MID_INT(STR1, 1, 6);
	      STR2:= CONCAT_STR (IN1:=STR2, IN2:= STR1);
	      CTRLRCP.BATCHID:=STR2;

              CTRLRCP.TIME_START:=PLC.NOW; (*ЗАПИС ЧАСУ ПОЧАТКУ ВАРКИ*)	
		(*відразу відбувається перехід на running*)
	    if CFG.PU.T_STEP2>=2 then 
	    	CTRL.PU.STARTING_CMPLT:=true;
	    end_if; 
        ELSE
            CFG.PU.STEP2:=13000;CFG.PU.T_STEP2:=0;
    END_CASE;
	PAUSE_ENBL:=FALSE;
	CTRL.NABVAK.ENBL := true; 
	CTRL.NABIR.ENBL  := false; CTRL.PREUVAR.ENBL  := false; 
	CTRL.UVAR.ENBL  := false; CTRL.ZATRAV.ENBL  := false; CTRL.STABIL.ENBL  := false;
	CTRL.PIDKACH.ENBL  := false; CTRL.VARKA.ENBL := false; CTRL.ZGUST.ENBL  := false;
	CTRL.VYVANT.ENBL  := false; CTRL.PROPAR.ENBL  := false;
END_IF;

(*2000 ================================================= RUNNING   робота програми апарату*)
IF CTRL.PU.STA_RUNNING THEN
    (*запам'ятати крок повернення*)
    CTRLRCP.STEP_BACK :=CFG.PU.STEP2; 
    FORMULA.PRM3.10:=(CTRLRCP.REG_KART=1);(*варка на суспензії*)
    FORMULA.PRM3.11:= (CTRLRCP.REG_KART=3);(*варка маточного утфелю*)	       		
	(*записати запам'ятовані значення вибору K3/K4*)
	FORMULA.PRM1.3:=FORMULA.PRM3.14;
	FORMULA.PRM1.4:=FORMULA.PRM1.15;	
	(*аларми для ЛМІ*)
	IF CFG.PU.STEP2=2560 THEN
		VA.T1.PRM.1:=false; VA.T1.PRM.3:=false; (*не сигналізувати температуру*)
	ELSE
		VA.T1.PRM.1:=true; VA.T1.PRM.3:=true; (*сигналізувати температуру на всіх етапах, крім пропарювання*)
	END_IF; 
	IF CFG.PU.STEP2>=2500 AND CFG.PU.STEP2<2600 THEN
		VA.P1.PRM.0:=false; VA.P1.PRM.1:=false; VA.P1.PRM.2:=false; VA.P1.PRM.3:=false;    
	ELSE 
		VA.P1.PRM.0:=true; VA.P1.PRM.1:=true; VA.P1.PRM.2:=true; VA.P1.PRM.3:=true;    
	END_IF;
	(*-------------------------*)
	     	
	IF FORMULA.PRM1.3 THEN 
		FORMULA.PRM1.4:= false; 
		FORMULA.PRM1.15:=false;
	else
		FORMULA.PRM1.4:= true; 
		FORMULA.PRM1.15:=true;
	end_if;


    CASE CFG.PU.STEP2 OF
        2000:CFG.PU.STEP2:=2050;CFG.PU.T_STEP2:=0; (*ініціалізація*)
	2050:   (*----------  набір вакууму----------  *)
	     CTRLRCP.STRT_STEP:=CFG.PU.STEP2;
	     IF PHALL_STA_ISSTOP THEN CTRL.NABVAK.CMD_START:=TRUE; END_IF;
	     IF CTRL.NABVAK.STA_RUNNING THEN        (*КОЛИ ЕТАП ЗАПУСТИТЬСЯ ПЕРЕЙТИ НА НАСТУПНИЙ КРОК*)
	       CFG.PU.STEP2:=2060;
	       CFG.PU.T_STEP2:=0;
             END_IF;
	     CTRL.NABVAK.ENBL:=true; 
        2060:                            
	     JUMP_ENBL:= CTRLRCP.STRT_STEP=2100 AND (*на крок набору*)
	     		VA.P1.VAL<=FORMULA.P1_min ; (*при необхідному тиску *)
	     PAUSE_ENBL:=FALSE;
	     CTRL.NABVAK.ENBL:=true; 	
	     CTRL.NABIR.ENBL  := VA.P1.VAL<=FORMULA.P1_min ; (*при необхідному тиску та рівню*)
	     CTRL.NABVAK.DSBL_CMPLT:=NOT (AUTSTR_NABIR AND NOT HMI.PU.ALM.0) ;(*заборона автоматичного переходу на наступний етап*)
	     IF CTRL.NABVAK.STA_IDLE  THEN       (*КОЛИ ЕТАП ЗАВЕРШИТЬСЯ ПЕРЕЙТИ НА НАСТУПНИЙ КРОК*)
	       CFG.PU.STEP2:=2100;
	       CFG.PU.T_STEP2:=0;
             END_IF;

        2100:   (*----------  набір апарату ----------  *)
	     CTRLRCP.STRT_STEP:=CFG.PU.STEP2;
	     IF PHALL_STA_ISSTOP THEN CTRL.NABIR.CMD_START:=TRUE; END_IF;
             IF CTRL.NABIR.STA_RUNNING  THEN        (*КОЛИ ЕТАП ЗАПУСТИТЬСЯ ПЕРЕЙТИ НА НАСТУПНИЙ КРОК*)
	       FORMULA.PS_SYR:=100.0; (* Значение «ps» равняется 100% и записывается только для этого шага.*)
	       CFG.PU.STEP2:=2110;
	       CFG.PU.T_STEP2:=0;
             END_IF;
	     CTRL.NABIR.ENBL:=true;             
        2110:
	     JUMP_ENBL:= CTRLRCP.STRT_STEP>=2100 AND CTRLRCP.STRT_STEP<2500;   
	     PAUSE_ENBL:=TRUE;	
		CTRL.NABVAK.ENBL := false; 
		CTRL.NABIR.ENBL  := TRUE; 
		CTRL.PREUVAR.ENBL  := TRUE; 
		CTRL.UVAR.ENBL  := TRUE; 
		CTRL.ZATRAV.ENBL  := TRUE; 
		CTRL.STABIL.ENBL  := TRUE;
		CTRL.PIDKACH.ENBL  := TRUE; 
		CTRL.VARKA.ENBL := TRUE; 
		CTRL.ZGUST.ENBL  := TRUE;
		CTRL.VYVANT.ENBL  := false; 
		CTRL.PROPAR.ENBL  := false;
		CTRL.UTRYM.ENBL := false;
	     CTRL.NABIR.DSBL_CMPLT:=NOT (AUTSTR_PREUVAR AND CTRL.PREUVAR.ENBL);(*заборона автоматичного переходу на наступний етап*)
	     CTRLRCP.Q_NAB:=VA.Q1.VAL;      (*ЗАПИС КОНЦЕНТРАЦЫЪ ср ПРИ НАБОРЫ*)
	     IF CTRL.NABIR.STA_IDLE THEN       (*КОЛИ ЕТАП ЗАВЕРШИТЬСЯ ПЕРЕЙТИ НА НАСТУПНИЙ КРОК*)
	       CFG.PU.STEP2:=2150;
	       CFG.PU.T_STEP2:=0;
             END_IF;


        2150:     (*----------  попереднє уварювання----------  *)
	     CTRLRCP.STRT_STEP:=CFG.PU.STEP2;
	     IF PHALL_STA_ISSTOP THEN CTRL.PREUVAR.CMD_START:=TRUE; END_IF; 
             IF CTRL.PREUVAR.STA_RUNNING  THEN        (*КОЛИ ЕТАП ЗАПУСТИТЬСЯ ПЕРЕЙТИ НА НАСТУПНИЙ КРОК*)
	       CFG.PU.STEP2:=2160;
	       CFG.PU.T_STEP2:=0;
             END_IF;
	     CTRL.PREUVAR.ENBL:=true;
        2160:
	     CTRL.PREUVAR.DSBL_CMPLT:=NOT AUTSTR_UVAR;(*заборона автоматичного переходу на наступний етап*)
	     IF CTRL.PREUVAR.STA_IDLE THEN       (*КОЛИ ЕТАП ЗАВЕРШИТЬСЯ ПЕРЕЙТИ НА НАСТУПНИЙ КРОК*)
	       CFG.PU.STEP2:=2200;
	       CFG.PU.T_STEP2:=0;
             END_IF;
	     JUMP_ENBL:= CTRLRCP.STRT_STEP>=2100 AND CTRLRCP.STRT_STEP<2500 OR CTRLRCP.STRT_STEP=2600; 
	     PAUSE_ENBL:=TRUE;	
		CTRL.NABVAK.ENBL := false; 
		CTRL.NABIR.ENBL  := TRUE; 
		CTRL.PREUVAR.ENBL  := TRUE; 
		CTRL.UVAR.ENBL  := TRUE; 
		CTRL.ZATRAV.ENBL  := TRUE; 
		CTRL.STABIL.ENBL  := TRUE;
		CTRL.PIDKACH.ENBL  := TRUE; 
		CTRL.VARKA.ENBL := TRUE; 
		CTRL.ZGUST.ENBL  := TRUE;
		CTRL.VYVANT.ENBL  := false; 
		CTRL.PROPAR.ENBL  := false;
		CTRL.UTRYM.ENBL := TRUE;

        2200:     (*----------  уварювання----------  *)
	     CTRLRCP.STRT_STEP:=CFG.PU.STEP2;
	     IF PHALL_STA_ISSTOP THEN CTRL.UVAR.CMD_START:=TRUE; END_IF; 
             IF CTRL.UVAR.STA_RUNNING  THEN        (*КОЛИ ЕТАП ЗАПУСТИТЬСЯ ПЕРЕЙТИ НА НАСТУПНИЙ КРОК*)
	       CFG.PU.STEP2:=2210;
	       CFG.PU.T_STEP2:=0;
             END_IF;
	     CTRL.UVAR.ENBL:=true;
        2210:
	     CTRL.UVAR.DSBL_CMPLT:=NOT AUTSTR_ZATRAV;(*заборона автоматичного переходу на наступний етап*)
	     IF CTRL.UVAR.STA_IDLE THEN       (*КОЛИ ЕТАП ЗАВЕРШИТЬСЯ ПЕРЕЙТИ НА НАСТУПНИЙ КРОК*)
	       CFG.PU.STEP2:=2250;
	       CFG.PU.T_STEP2:=0;
             END_IF;
	     JUMP_ENBL:= CTRLRCP.STRT_STEP>=2100 AND CTRLRCP.STRT_STEP<2500  OR CTRLRCP.STRT_STEP=2600; 
	     PAUSE_ENBL:=TRUE;	
		CTRL.NABVAK.ENBL := false; 
		CTRL.NABIR.ENBL  := TRUE; 
		CTRL.PREUVAR.ENBL  := TRUE; 
		CTRL.UVAR.ENBL  := TRUE; 
		CTRL.ZATRAV.ENBL  := TRUE; 
		CTRL.STABIL.ENBL  := TRUE;
		CTRL.PIDKACH.ENBL  := TRUE; 
		CTRL.VARKA.ENBL := TRUE; 
		CTRL.ZGUST.ENBL  := TRUE;
		CTRL.VYVANT.ENBL  := false; 
		CTRL.PROPAR.ENBL  := false;
		CTRL.UTRYM.ENBL := TRUE;

        2250:     (*----------  введення затравки----------  *)
	     CTRLRCP.STRT_STEP:=CFG.PU.STEP2;
	     IF PHALL_STA_ISSTOP THEN CTRL.ZATRAV.CMD_START:=TRUE; END_IF; 
             IF CTRL.ZATRAV.STA_RUNNING  THEN        (*КОЛИ ЕТАП ЗАПУСТИТЬСЯ ПЕРЕЙТИ НА НАСТУПНИЙ КРОК*)
	       CFG.PU.STEP2:=2260;
	       CFG.PU.T_STEP2:=0;
             END_IF;
	     CTRL.ZATRAV.ENBL:=true;
        2260:
	     CTRL.ZATRAV.DSBL_CMPLT:=NOT AUTSTR_STABIL;(*заборона автоматичного переходу на наступний етап*)
	     IF CTRL.ZATRAV.STA_IDLE THEN       (*КОЛИ ЕТАП ЗАВЕРШИТЬСЯ ПЕРЕЙТИ НА НАСТУПНИЙ КРОК*)
	       CFG.PU.STEP2:=2300;
	       CFG.PU.T_STEP2:=0;
             END_IF;
	     JUMP_ENBL:= CTRLRCP.STRT_STEP>=2100 AND CTRLRCP.STRT_STEP<2500  OR CTRLRCP.STRT_STEP=2600; 
	     PAUSE_ENBL:=TRUE;	
		CTRL.NABVAK.ENBL := false; 
		CTRL.NABIR.ENBL  := TRUE; 
		CTRL.PREUVAR.ENBL  := TRUE; 
		CTRL.UVAR.ENBL  := TRUE; 
		CTRL.ZATRAV.ENBL  := TRUE; 
		CTRL.STABIL.ENBL  := TRUE;
		CTRL.PIDKACH.ENBL  := TRUE; 
		CTRL.VARKA.ENBL := TRUE; 
		CTRL.ZGUST.ENBL  := TRUE;
		CTRL.VYVANT.ENBL  := false; 
		CTRL.PROPAR.ENBL  := false;
		CTRL.UTRYM.ENBL := TRUE;

        2300:     (*----------  стабілізація----------  *)
	     CTRLRCP.STRT_STEP:=CFG.PU.STEP2;
	     IF PHALL_STA_ISSTOP THEN CTRL.STABIL.CMD_START:=TRUE; END_IF; 
             IF CTRL.STABIL.STA_RUNNING  THEN        (*КОЛИ ЕТАП ЗАПУСТИТЬСЯ ПЕРЕЙТИ НА НАСТУПНИЙ КРОК*)
	       CFG.PU.STEP2:=2310;
	       CFG.PU.T_STEP2:=0;
             END_IF;
	     CTRL.STABIL.ENBL:=true;
        2310:
	     CTRL.STABIL.DSBL_CMPLT:=(NOT AUTSTR_PIDKACH AND FORMULA.PRM1.8) OR (NOT AUTSTR_VARKA AND NOT FORMULA.PRM1.8);(*заборона автоматичного переходу на наступний етап*)
             IF CTRL.STABIL.STA_IDLE THEN       (*КОЛИ ЕТАП ЗАВЕРШИТЬСЯ ПЕРЕЙТИ НА НАСТУПНИЙ КРОК*)
	       IF FORMULA.PRM1.8 THEN  (*ЯКЩО СТОЇТЬ ДОЗВІЛ НА ВИКОНАННЯ ПІДКАЧКИ*)
	         CFG.PU.STEP2:=2350;
	         CFG.PU.T_STEP2:=0;
	       ELSE 
	         CFG.PU.STEP2:=2400;
	         CFG.PU.T_STEP2:=0;
	       END_IF;
             END_IF;
	     JUMP_ENBL:= CTRLRCP.STRT_STEP>=2100 AND CTRLRCP.STRT_STEP<2500 OR CTRLRCP.STRT_STEP=2600; 
	     PAUSE_ENBL:=TRUE;	
		CTRL.NABVAK.ENBL := false; 
		CTRL.NABIR.ENBL  := TRUE; 
		CTRL.PREUVAR.ENBL  := TRUE; 
		CTRL.UVAR.ENBL  := TRUE; 
		CTRL.ZATRAV.ENBL  := TRUE; 
		CTRL.STABIL.ENBL  := TRUE;
		CTRL.PIDKACH.ENBL  := TRUE; 
		CTRL.VARKA.ENBL := TRUE; 
		CTRL.ZGUST.ENBL  := TRUE;
		CTRL.VYVANT.ENBL  := false; 
		CTRL.PROPAR.ENBL  := false;
		CTRL.UTRYM.ENBL := TRUE;

        2350:     (*----------  підкачка----------  *)
	     CTRLRCP.STRT_STEP:=CFG.PU.STEP2;
	    IF PHALL_STA_ISSTOP THEN CTRL.PIDKACH.CMD_START:=TRUE; END_IF; 
             IF CTRL.PIDKACH.STA_RUNNING  THEN        (*КОЛИ ЕТАП ЗАПУСТИТЬСЯ ПЕРЕЙТИ НА НАСТУПНИЙ КРОК*)
	       CFG.PU.STEP2:=2360;
	       CFG.PU.T_STEP2:=0;
             END_IF;
	     CTRL.PIDKACH.ENBL:=true;
        2360:
	     CTRL.PIDKACH.DSBL_CMPLT:=NOT AUTSTR_VARKA;(*заборона автоматичного переходу на наступний етап*)
	     IF CTRL.PIDKACH.STA_IDLE THEN       (*КОЛИ ЕТАП ЗАВЕРШИТЬСЯ ПЕРЕЙТИ НА НАСТУПНИЙ КРОК*)
	       CFG.PU.STEP2:=2400;
	       CFG.PU.T_STEP2:=0;
             END_IF;
	     JUMP_ENBL:= CTRLRCP.STRT_STEP>=2100 AND CTRLRCP.STRT_STEP<2500 OR CTRLRCP.STRT_STEP=2600; 
	     PAUSE_ENBL:=TRUE;	
		CTRL.NABVAK.ENBL := false; 
		CTRL.NABIR.ENBL  := TRUE; 
		CTRL.PREUVAR.ENBL  := TRUE; 
		CTRL.UVAR.ENBL  := TRUE; 
		CTRL.ZATRAV.ENBL  := TRUE; 
		CTRL.STABIL.ENBL  := TRUE;
		CTRL.PIDKACH.ENBL  := TRUE; 
		CTRL.VARKA.ENBL := TRUE; 
		CTRL.ZGUST.ENBL  := TRUE;
		CTRL.VYVANT.ENBL  := false; 
		CTRL.PROPAR.ENBL  := false;
		CTRL.UTRYM.ENBL := TRUE;

        2400:     (*----------  варка -------------*)
	     CTRLRCP.STRT_STEP:=CFG.PU.STEP2;
	     IF PHALL_STA_ISSTOP THEN CTRL.VARKA.CMD_START:=TRUE; END_IF; 
             IF CTRL.VARKA.STA_RUNNING  THEN        (*КОЛИ ЕТАП ЗАПУСТИТЬСЯ ПЕРЕЙТИ НА НАСТУПНИЙ КРОК*)
	       CFG.PU.STEP2:=2410;
	       CFG.PU.T_STEP2:=0;
             END_IF;
             (*При переходе на данный шаг в режимную карту записываются значения L1v1, Q1v1.*)
             FORMULA.Q1_V1:=VA.Q1.VAL;
             FORMULA.L1_V1:=VA.L1.VAL;
	     CTRL.UVAR.ENBL:=true;
	     CTRL.VARKA.ENBL:=true;
	2410:
	     CTRL.VARKA.DSBL_CMPLT:=NOT AUTSTR_ZGUST;(*заборона автоматичного переходу на наступний етап*)
	     PAUSE_ENBL:=TRUE;	
	     JUMP_ENBL:= CTRLRCP.STRT_STEP>=2100 AND CTRLRCP.STRT_STEP<2500  OR CTRLRCP.STRT_STEP=2600; 	     	  
		CTRL.NABVAK.ENBL := false; 
		CTRL.NABIR.ENBL  := TRUE; 
		CTRL.PREUVAR.ENBL  := TRUE; 
		CTRL.UVAR.ENBL  := TRUE; 
		CTRL.ZATRAV.ENBL  := TRUE; 
		CTRL.STABIL.ENBL  := TRUE;
		CTRL.PIDKACH.ENBL  := TRUE; 
		CTRL.VARKA.ENBL := TRUE; 
		CTRL.ZGUST.ENBL  := TRUE;
		CTRL.VYVANT.ENBL  := false; 
		CTRL.PROPAR.ENBL  := false;
		CTRL.UTRYM.ENBL := TRUE;;

        2450:     (*----------  згущення----------  *)
	     CTRLRCP.STRT_STEP:=CFG.PU.STEP2;
	     IF PHALL_STA_ISSTOP THEN CTRL.ZGUST.CMD_START:=TRUE; END_IF;  
             IF CTRL.ZGUST.STA_RUNNING  THEN        (*КОЛИ ЕТАП ЗАПУСТИТЬСЯ ПЕРЕЙТИ НА НАСТУПНИЙ КРОК*)
	       CFG.PU.STEP2:=2460;
	       CFG.PU.T_STEP2:=0;
             END_IF;
	     CTRL.ZGUST.ENBL:=true;
        2460:
	     CTRL.ZGUST.DSBL_CMPLT:=NOT AUTSTR_VYVANT;(*заборона автоматичного переходу на наступний етап*)
	     IF CTRL.ZGUST.STA_IDLE THEN       (*КОЛИ ЕТАП ЗАВЕРШИТЬСЯ ПЕРЕЙТИ НА НАСТУПНИЙ КРОК*)
	       CFG.PU.STEP2:=2500;
	       CFG.PU.T_STEP2:=0;
             END_IF;
	     CTRLRCP.L_UTF:=VA.L1.VAL;      (*ЗАПИС РЫВНЯ ПРИГОТОВЛЕНОГО УТФІЛЮ*)
	     PAUSE_ENBL:=TRUE;	
	     CTRL.ZGUST.ENBL:=true;
	     JUMP_ENBL:= CTRLRCP.STRT_STEP>=2100 AND CTRLRCP.STRT_STEP<2550 OR CTRLRCP.STRT_STEP=2600; 
		CTRL.NABVAK.ENBL := false; 
		CTRL.NABIR.ENBL  := TRUE; 
		CTRL.PREUVAR.ENBL  := TRUE; 
		CTRL.UVAR.ENBL  := TRUE; 
		CTRL.ZATRAV.ENBL  := TRUE; 
		CTRL.STABIL.ENBL  := TRUE;
		CTRL.PIDKACH.ENBL  := TRUE; 
		CTRL.VARKA.ENBL := TRUE; 
		CTRL.ZGUST.ENBL  := TRUE;
		CTRL.VYVANT.ENBL  := TRUE; 
		CTRL.PROPAR.ENBL  := false;
		CTRL.UTRYM.ENBL := TRUE;;

        2500:     (*----------  вивантаження----------  *)
	     CTRLRCP.STRT_STEP:=CFG.PU.STEP2;
	     IF PHALL_STA_ISSTOP THEN CTRL.VYVANT.CMD_START:=TRUE; END_IF; 
             IF CTRL.VYVANT.STA_RUNNING  THEN        (*КОЛИ ЕТАП ЗАПУСТИТЬСЯ ПЕРЕЙТИ НА НАСТУПНИЙ КРОК*)
	       CFG.PU.STEP2:=2510;
	       CFG.PU.T_STEP2:=0;
             END_IF;
	     CTRL.VYVANT.ENBL:=true;
        2510:
	     CTRL.VYVANT.DSBL_CMPLT:=NOT AUTSTR_PROPAR;(*заборона автоматичного переходу на наступний етап*)
	     IF CTRL.VYVANT.STA_IDLE THEN       (*КОЛИ ЕТАП ЗАВЕРШИТЬСЯ ПЕРЕЙТИ НА НАСТУПНИЙ КРОК*)
	       CFG.PU.STEP2:=2550;
	       CFG.PU.T_STEP2:=0;
             END_IF;
	     PAUSE_ENBL:=false;	
	     JUMP_ENBL:= CTRLRCP.STRT_STEP = 2550; 
		CTRL.NABVAK.ENBL := false; 
		CTRL.NABIR.ENBL  := false; 
		CTRL.PREUVAR.ENBL  := false; 
		CTRL.UVAR.ENBL  := false; 
		CTRL.ZATRAV.ENBL  := false; 
		CTRL.STABIL.ENBL  := false;
		CTRL.PIDKACH.ENBL  := false; 
		CTRL.VARKA.ENBL := false; 
		CTRL.ZGUST.ENBL  := false;
		CTRL.VYVANT.ENBL  := TRUE; 
		CTRL.PROPAR.ENBL  := TRUE;
		CTRL.UTRYM.ENBL := FALSE;

        2550:     (*---------------- пропарка ----------------*)
	     CTRLRCP.STRT_STEP:=CFG.PU.STEP2;
	    IF PHALL_STA_ISSTOP THEN CTRL.PROPAR.CMD_START:=TRUE; END_IF; 
             IF CTRL.PROPAR.STA_RUNNING  THEN        (*КОЛИ ЕТАП ЗАПУСТИТЬСЯ ПЕРЕЙТИ НА НАСТУПНИЙ КРОК*)
	       CFG.PU.STEP2:=2560;
	       CFG.PU.T_STEP2:=0;
             END_IF;
	     CTRL.PROPAR.ENBL:=true;
        2560:
	     CTRL.PROPAR.DSBL_CMPLT:=false;(*заборона автоматичного переходу на наступний етап*)
	     IF CTRL.PROPAR.STA_IDLE THEN       (*КОЛИ ЕТАП ЗАВЕРШИТЬСЯ ПЕРЕЙТИ НА НАСТУПНИЙ КРОК*)
	       CFG.PU.STEP2:=2900;
	       CFG.PU.T_STEP2:=0;
             END_IF; 
	     JUMP_ENBL:= false;
	     PAUSE_ENBL:=false;	
		CTRL.NABVAK.ENBL := false; 
		CTRL.NABIR.ENBL  := false; 
		CTRL.PREUVAR.ENBL  := false; 
		CTRL.UVAR.ENBL  := false; 
		CTRL.ZATRAV.ENBL  := false; 
		CTRL.STABIL.ENBL  := false;
		CTRL.PIDKACH.ENBL  := false; 
		CTRL.VARKA.ENBL := false; 
		CTRL.ZGUST.ENBL  := false;
		CTRL.VYVANT.ENBL  := false; 
		CTRL.PROPAR.ENBL  := TRUE;
		CTRL.UTRYM.ENBL := FALSE;

        2600:     (*----------  утримування----------  *)                                       (*ЗАПУСК УТРИМУВАННЯ НА ВОДІ*)
	     CTRLRCP.STRT_STEP:=CFG.PU.STEP2;
	     IF PHALL_STA_ISSTOP THEN CTRL.UTRYM.CMD_START:=TRUE; END_IF;
	     IF CTRL.UTRYM.STA_RUNNING  THEN        (*КОЛИ ЕТАП ЗАПУСТИТЬСЯ ПЕРЕЙТИ НА НАСТУПНИЙ КРОК*)
	       CFG.PU.STEP2:=2610;
	       CFG.PU.T_STEP2:=0;
             END_IF;
	     CTRL.UTRYM.ENBL:=true; 
	2610:
	    (*вихід з утримування тільки оператором*)
	     PAUSE_ENBL:=TRUE;	
	     JUMP_ENBL:= CTRLRCP.STRT_STEP>=2100 AND CTRLRCP.STRT_STEP<2500;
		CTRL.NABVAK.ENBL := false; 
		CTRL.NABIR.ENBL  := TRUE; 
		CTRL.PREUVAR.ENBL  := TRUE; 
		CTRL.UVAR.ENBL  := TRUE; 
		CTRL.ZATRAV.ENBL  := TRUE; 
		CTRL.STABIL.ENBL  := TRUE;
		CTRL.PIDKACH.ENBL  := TRUE; 
		CTRL.VARKA.ENBL := TRUE; 
		CTRL.ZGUST.ENBL  := TRUE;
		CTRL.VYVANT.ENBL  := false; 
		CTRL.PROPAR.ENBL  := false;
		CTRL.UTRYM.ENBL := TRUE;
			     	      
	2900:     (*-------------------- закінчення варки утфелю*)
	     IF CFG.PU.T_STEP2>=3 THEN
	       CTRL.PU.RUNING_CMPLT:=TRUE;
	       CFG.PU.T_STEP2:=0;
             END_IF;
        
    ELSE
        CFG.PU.STEP2:=2000;CFG.PU.T_STEP2:=0; 
    END_CASE;
    (*умова нормального завершення етапу*)
    IF CTRL.PU.HL_RUNNING_CMPLT OR CTRL.PU.RUNING_CMPLT THEN
     	CTRL.PU.RUNING_CMPLT := TRUE;
    END_IF;

    (*команди переходів "на льоту"*)
    IF HMI.PU.CMD=1 AND (JUMP_ENBL OR CTRLRCP.STRT_STEP=1000) AND NOT STEP_EQ_TOSTEP THEN	
	CFG.PU.T_STEP2:=0;
	IF CTRLRCP.STRT_STEP=1000 then
		CTRL.PU.CMD_STOP:=TRUE;
	ELSE
	   PHALL_CMD_STOP:=TRUE;
	   CTRL.UTRYM.CMD_STOP:=TRUE;
	   CFG.PU.STEP2:=CTRLRCP.STRT_STEP;
	END_IF;
    ELSIF HMI.PU.CMD=1 THEN CTRLRCP.STRT_STEP:=CFG.PU.STEP2; 			
    END_IF;

    (*блокування на стоп*)
    IF CFG.PU.STEP2>=2100 (*з набору апарату*) AND 
    		CFG.PU.STEP2<2500 (*до згущення включно*) OR
		CFG.PU.STEP2>=2600 AND CFG.PU.STEP2<2900 THEN 
    	IF VA.P1.STA.10 and CFG.PU.T_STEP2>1 THEN 
		CTRL.PU.CMD_PAUSE:=true;
	END_IF;
    END_IF;	

END_IF;
(*14000 ============================================================== Completing *)
IF CTRL.PU.STA_COMPLETING THEN
    CASE CFG.PU.STEP2 OF
        14000: CFG.PU.STEP2 := 14010; CFG.PU.T_STEP2 := 0;
	       CTRLRCP.TIME_STOP:=PLC.NOW;                                  (*ЗАПИС ЧАСУ КІНЦЯ ВАРКИ*)
	14010:
	     VA.Z1.CMD:=2;    (*В режиме «Стоп» управляющие воздействия на исполнительные механизмы выдаются согласно таблице:*)
             VA.Z2.CMD:=2;
	     VA.Z3.CMD:=2;
	     VA.Z4.CMD:=2;
	     VA.Z5.CMD:=2;
	     VA.Z6.CMD:=2;
	     VA.Z7.CMD:=2;
	     VA.Z8.CMD:=2;
	     VA.Z9.CMD:=2;
	     VA.Z10.CMD:=2;
	     VA.Z11.CMD:=2;
	     VA.Z12.CMD:=2;
	     VA.Z13.CMD:=2;
	     LOOP_K1.CMD1.SEL:=1;
	     LOOP_K1.CMD2.SEL:=1;
	     LOOP_K1.CMD5.SEL:=1;
	     LOOP_K2.CMD12.SEL:=1;
	     LOOP_K2.CMD14.SEL:=1;
	     LOOP_K3.CMD22.SEL:=1;      (*Олег 17.09.2017*)

	     VA.T1.PRM.1:=false; VA.T1.PRM.3:=false;
             if CFG.PU.T_STEP2>=2 then 
	     	CTRL.PU.COMPLETING_CMPLT := true;
		CFG.PU.T_STEP2:=0;
	     END_IF;
        ELSE
            CFG.PU.STEP2 := 14000; CFG.PU.T_STEP2 := 0;
    END_CASE;
    (*умова нормального завершення етапу*)
END_IF;
(*8000 =============================================================== COMPLETE *)
IF CTRL.PU.STA_COMPLETE THEN
	CFG.PU.STEP2 := 8000;
	if CFG.PU.T_STEP2>=2 then 
	     	CTRL.PU.CMD_RESET := true;
		CFG.PU.T_STEP2:=0;
	END_IF;
END_IF;

(*3000 ==================================================================== PAUSING перехід на паузу*)
IF CTRL.PU.STA_PAUSING THEN
    CASE CFG.PU.STEP2 OF
        3000: CFG.PU.STEP2 := 3010; CFG.PU.T_STEP2 := 0;
        3010: 
	   (*переведення в стоп активних етапів*)
	   PHALL_CMD_STOP:=TRUE;
	   CTRL.UTRYM.CMD_STOP:=TRUE;	     	
	   IF CFG.PU.T_STEP2 >= 2 THEN 
	   	CTRL.PU.PAUSING_CMPLT := true;
	   END_IF;
           ELSE
           CFG.PU.STEP2 := 3000; CFG.PU.T_STEP2 := 0;
    END_CASE;
END_IF;
(*4000 ============================================================= PAUSED*)
IF CTRL.PU.STA_PAUSED THEN
    CFG.PU.STEP2 := 4000;
    (*переведення в паузу активних етапів*)
    PHALL_CMD_STOP :=TRUE;
    CTRL.UTRYM.CMD_STOP:=TRUE;	
   (*В режиме «Стоп» управляющие воздействия на исполнительные механизмы выдаются согласно таблице:*)
     VA.Z1.CMD:=1; (*відкрити*)   
     VA.Z2.CMD:=2; (*закрити*)  
     VA.Z3.CMD:=2; (*закрити*) 
     VA.Z4.CMD:=2; (*закрити*) 
     VA.Z5.CMD:=2; (*закрити*) 
     VA.Z6.CMD:=2; (*закрити*) 
     VA.Z7.CMD:=2; (*закрити*) 
     VA.Z8.CMD:=2; (*закрити*) 
     VA.Z9.CMD:=2; (*закрити*) 
     VA.Z10.CMD:=2; (*закрити*) 
     VA.Z11.CMD:=2; (*закрити*) 
     VA.Z12.CMD:=2; (*закрити*) 
     VA.Z13.CMD:=2; (*закрити*) 
     LOOP_K1.CMD1.SEL:=1;
     LOOP_K1.CMD2.SEL:=1;
     LOOP_K1.CMD5.SEL:=1;
     LOOP_K2.CMD12.SEL:=1;
     LOOP_K2.CMD14.SEL:=1;
     LOOP_K3.CMD22.SEL:=2; 	     	
     LOOP_K4.CMD12.SEL:=1;
     LOOP_K4.CMD14.SEL:=1;
	CTRL.NABVAK.ENBL := false; 
	CTRL.NABIR.ENBL  := TRUE; 
	CTRL.PREUVAR.ENBL  := TRUE; 
	CTRL.UVAR.ENBL  := TRUE; 
	CTRL.ZATRAV.ENBL  := TRUE; 
	CTRL.STABIL.ENBL  := TRUE;
	CTRL.PIDKACH.ENBL  := TRUE; 
	CTRL.VARKA.ENBL := TRUE; 
	CTRL.ZGUST.ENBL  := TRUE;
	CTRL.VYVANT.ENBL  := false; 
	CTRL.PROPAR.ENBL  := false;
	CTRL.UTRYM.ENBL := TRUE;

        CASE CTRLRCP.STRT_STEP OF (*стартовий крок на якому стоїть галочка*)
	1000: (*НА ГОТОВНІСТЬ *)
		JUMP_ENBL:=true;(*на зупинку*)
	2050..2099: (*НА НАБІР ВАКУУМУ*)
		JUMP_ENBL:=false;(*ні*)
		CTRLRCP.STRT_STEP:=2050;
	2100..2149: (*НА НАБІР*)
		JUMP_ENBL:= VA.P1.VAL<=FORMULA.P1_min; (*якщо тиск досягнув потрібного*)
		CTRLRCP.STRT_STEP:=2100;	   
	2150..2199: (*НА ПОПЕРДНЄ УВАРЮВАННЯ*)
		JUMP_ENBL:=TRUE;
		CTRLRCP.STRT_STEP:=2150;
	2200..2249: (*НА УВАРЮВАННЯ*)
		JUMP_ENBL:=TRUE;
		CTRLRCP.STRT_STEP:=2200;
	2250..2299: (*НА ВВЕДЕННЯ ЗАТРАВКИ*)
		JUMP_ENBL:=TRUE;
		CTRLRCP.STRT_STEP:=2250;
	2300..2349: (*НА ВВЕДЕННЯ СТАБІЛІЗАЦІЯ*)
		JUMP_ENBL:=TRUE;
		CTRLRCP.STRT_STEP:=2300;
	2350..2399: (*НА ВВЕДЕННЯ ПІДКАЧКА*)
		JUMP_ENBL:=TRUE;
		CTRLRCP.STRT_STEP:=2350;
	2400..2449: (*НА ВВЕДЕННЯ ВАРІННЯ*)
		JUMP_ENBL:=TRUE;
		CTRLRCP.STRT_STEP:=2400;
	2450..2499: (*НА ЗГУЩЕННЯ*)
		JUMP_ENBL:=TRUE;
		CTRLRCP.STRT_STEP:=2450;  
	2500..2549: (*НА ВИВАНТАЖЕННЯ*)
		JUMP_ENBL:=false;
		CTRLRCP.STRT_STEP:=2500;
	2550..2599: (*НА ПРОПАРЮВАННЯ*)
		JUMP_ENBL:=FALSE;
		CTRLRCP.STRT_STEP:=2550;			        
	2600..2649:(*на УТРИМУВАННЯ НА ВОДІ*)
		JUMP_ENBL:=true;
		CTRLRCP.STRT_STEP:=2600;
  	END_CASE;
    (*команди переходу в стоп-паузі *)    	
    IF HMI.PU.CMD=1 AND (JUMP_ENBL OR CTRLRCP.STRT_STEP=1000) THEN	
	CFG.PU.T_STEP2:=0; CTRL.PU.CMD_RESUME:=TRUE;
    ELSIF HMI.PU.CMD=1 THEN 
	HMI.PU.CMD:=0; 			
    END_IF;
END_IF;
(*15000  ============================================================== RESUMING *)
IF CTRL.PU.STA_RESUMING THEN 
    CASE CFG.PU.STEP2 OF
      	15000: CFG.PU.STEP2 := 15010; CFG.PU.T_STEP2 := 0;    	 
    	15010:		
		if CTRLRCP.STRT_STEP=1000 THEN
			CTRL.PU.CMD_STOP :=TRUE;
		ELSE
			CTRL.PU.RESUMING_CMPLT:=TRUE;
			CFG.PU.STEP2 := CTRLRCP.STRT_STEP;
		END_IF;	
    ELSE
        CFG.PU.STEP2 := 15000; CFG.PU.T_STEP2 := 0;
    END_CASE;
END_IF;

(*9000  ================================================================ STOPPING *)
IF CTRL.PU.STA_STOPPING THEN
   CASE CFG.PU.STEP2 OF
        9000: CFG.PU.STEP2 := 9010; CFG.PU.T_STEP2 := 0;
	CTRLRCP.TIME_STOP:=PLC.NOW;
        9010: 	    
	     VA.Z1.CMD:=2;    (*В режиме «Стоп» управляющие воздействия на исполнительные механизмы выдаются согласно таблице:*)
             VA.Z2.CMD:=2;
	     VA.Z3.CMD:=2;
	     VA.Z4.CMD:=2;
	     VA.Z5.CMD:=2;
	     VA.Z6.CMD:=2;
	     VA.Z7.CMD:=2;
	     VA.Z8.CMD:=2;
	     VA.Z9.CMD:=2;
	     VA.Z10.CMD:=2;
	     VA.Z11.CMD:=2;
	     VA.Z12.CMD:=2;
	     VA.Z13.CMD:=2;
	     LOOP_K1.CMD1.SEL:=1;
	     LOOP_K1.CMD2.SEL:=1;
	     LOOP_K1.CMD5.SEL:=1;
	     LOOP_K2.CMD12.SEL:=1;
	     LOOP_K2.CMD14.SEL:=1;
	     LOOP_K3.CMD22.SEL:=2;
	     LOOP_K4.CMD12.SEL:=1;
	     LOOP_K4.CMD14.SEL:=1;
	     VA.T1.PRM.1:=false; VA.T1.PRM.3:=false;
	     IF CFG.PU.T_STEP2 >= 2 THEN 
	     	CTRL.PU.STOPPING_CMPLT:=TRUE;
	     end_if;
   ELSE
       CFG.PU.STEP2 := 9010; CFG.PU.T_STEP2 := 0;
    END_CASE;
	CTRL.NABVAK.ENBL := false; CTRL.NABIR.ENBL  := false; CTRL.PREUVAR.ENBL  := false; 
	CTRL.UVAR.ENBL  := false; CTRL.ZATRAV.ENBL  := false; CTRL.STABIL.ENBL  := false;
	CTRL.PIDKACH.ENBL  := false; CTRL.VARKA.ENBL := false; CTRL.ZGUST.ENBL  := false;
	CTRL.VYVANT.ENBL  := false; CTRL.PROPAR.ENBL  := false;
END_IF;
(*10000 ===================================================== STOPPED*)
IF CTRL.PU.STA_STOPPED THEN
    CFG.PU.STEP2 := 1000;
    CTRLRCP.STRT_STEP :=1000;
    CTRL.PU.CMD_RESET:=TRUE;
	CTRL.NABVAK.ENBL := false; CTRL.NABIR.ENBL  := false; CTRL.PREUVAR.ENBL  := false; 
	CTRL.UVAR.ENBL  := false; CTRL.ZATRAV.ENBL  := false; CTRL.STABIL.ENBL  := false;
	CTRL.PIDKACH.ENBL  := false; CTRL.VARKA.ENBL := false; CTRL.ZGUST.ENBL  := false;
	CTRL.VYVANT.ENBL  := false; CTRL.PROPAR.ENBL  := false;
END_IF;


(*11000  ================================================================ ABORTING *)
IF CTRL.PU.STA_ABORTING THEN
   CASE CFG.PU.STEP2 OF
        11000: CFG.PU.STEP2 := 11010; CFG.PU.T_STEP2 := 0;
	CTRLRCP.TIME_STOP:=PLC.NOW;
        11010: 	    
	     	CTRL.NABVAK.CMD_ABORT:=TRUE; CTRL.NABIR.CMD_ABORT:=TRUE; CTRL.PREUVAR.CMD_ABORT:=TRUE; 
		CTRL.UVAR.CMD_ABORT:=TRUE; CTRL.ZATRAV.CMD_ABORT:=TRUE; CTRL.STABIL.CMD_ABORT:=TRUE;  
		CTRL.PIDKACH.CMD_ABORT:=TRUE; CTRL.VARKA.CMD_ABORT:=TRUE;  CTRL.ZGUST.CMD_ABORT:=TRUE;  
		CTRL.VYVANT.CMD_ABORT:=TRUE;  CTRL.PROPAR.CMD_ABORT:=TRUE; CTRL.UTRYM.CMD_ABORT:=TRUE; 
	     IF CFG.PU.T_STEP2 >= 2 THEN CTRL.PU.ABORTING_CMPLT:=TRUE;end_if;
   ELSE
       CFG.PU.STEP2 := 11000; CFG.PU.T_STEP2 := 0;
    END_CASE;
END_IF;
(*12000 ===================================================== ABORTED*)
IF CTRL.PU.STA_ABORTED THEN
    CFG.PU.STEP2 := 12000;
END_IF;

(*======================================== поширення станів вниз ======================== *)
(*команда на зупинку усіх етапів крім "готовності" та "утримання на воді"*)
(*якщо етап не виконується в автоматі станів, стоп нічого не робить*)
IF PHALL_CMD_STOP THEN
	(*команди на зупинку*)
	CTRL.NABVAK.CMD_STOP:=TRUE; CTRL.NABIR.CMD_STOP:=TRUE; CTRL.PREUVAR.CMD_STOP:=TRUE; 
	CTRL.UVAR.CMD_STOP:=TRUE; CTRL.ZATRAV.CMD_STOP:=TRUE; CTRL.STABIL.CMD_STOP:=TRUE;  
	CTRL.PIDKACH.CMD_STOP:=TRUE; CTRL.VARKA.CMD_STOP:=TRUE;  CTRL.ZGUST.CMD_STOP:=TRUE;  
	CTRL.VYVANT.CMD_STOP:=TRUE;  CTRL.PROPAR.CMD_STOP:=TRUE;	 
END_IF;
(*команда на скидування усіх етапів крім "готовності" *)
(*скидуваня відбувається тільки в кінцевих станах*)
IF PHALL_CMD_RESET THEN
	CTRL.NABVAK.CMD_RESET:=TRUE; CTRL.NABIR.CMD_RESET:=TRUE; CTRL.PREUVAR.CMD_RESET:=TRUE; 
	CTRL.UVAR.CMD_RESET:=TRUE; CTRL.ZATRAV.CMD_RESET:=TRUE; CTRL.STABIL.CMD_RESET:=TRUE;  
	CTRL.PIDKACH.CMD_RESET:=TRUE; CTRL.VARKA.CMD_RESET:=TRUE;  CTRL.ZGUST.CMD_RESET:=TRUE;  
	CTRL.VYVANT.CMD_RESET:=TRUE;  CTRL.PROPAR.CMD_RESET:=TRUE; CTRL.UTRYM.CMD_RESET:=TRUE;
END_IF;

(*заборона переходу на паузу*)
HMI.PU.ALM.1:= PAUSE_ENBL;(*для підсвітки кнопки СТОП*)
IF HMI.PU.CMD=3 AND NOT PAUSE_ENBL THEN
	HMI.PU.CMD:=0;	
END_IF;

(*ЯКЩО ВІДБУЛОСЬ ПЕРЕКЛЮЧЕННЯ МІТКИ ЗАПУСКУ ТО ПОЧАТИ ВІДРАХУНОК... 
ЯКЩО НЕ ПРИЙШЛА КОМАНДА СТАРТ ТО ПОВЕРНУТИ МІТКУ ЗАПУСКУ НАЗАД*)
   IF CTRLRCP.STRT_STEP<>CFG.PU.STEP2 AND NOT CTRL.PU.STA_PAUSED AND NOT CTRL.PU.STA_PAUSING AND NOT CTRL.PU.STA_RESUMING  THEN
      (*відлік часу виставлення нової мітки*)
      IF PLC.PLS.3 THEN (*кожну секунду*)
        CTRLRCP.T_STRT_STEP:=CTRLRCP.T_STRT_STEP+1; 
      END_IF; 
      (*чкщо старт не прийшов до початку відліку*)
      IF CTRLRCP.T_STRT_STEP>=10 THEN
        CTRLRCP.STRT_STEP:=CFG.PU.STEP2;
        CTRLRCP.T_STRT_STEP:=0;
      END_IF;
   ELSE
      CTRLRCP.T_STRT_STEP:=0;
   END_IF;

(*обробка автомату станів*)
PROC_MACH(ID:=ID, CFG:=CFG.PU, HMI:=HMI.PU, CTRL:=CTRL.PU, PROC_BUF:=BUF, PLC:=PLC);


IF PLC.PLS.3 THEN
    CFG.PU.T_STEP2:=CFG.PU.T_STEP2+1;
    IF CFG.PU.T_STEP2>16#7fff_ffff THEN CFG.PU.T_STEP2:=16#7fff_ffff;END_IF;     
END_IF;
(*CTRLRCP.TIME_START:=PLC.NOW;
CTRLRCP.TIME_STOP:=PLC.NOW;	  	
*)  	
```

