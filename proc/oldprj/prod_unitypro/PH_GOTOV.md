# PH_GOTOV

```pascal
(*
HMI.ALM.0 - 1-ВІДСУТНІЙ ПРОДУКТ ДЛЯ НАБОРУ АПАРАТУ
HMI.ALM.2 - 1- апарат не готовий до набору  
*)

CTRL.ENBL := true;(*завжди можна запускати*)
HMI.ALM.2 := NOT (P1.L2.VAL>=FORMULA.L2_SP AND ...
HMI.ALM.0:= (P1.L2.VAL < FORMULA.L2_SP); (*ВІДСУТНІЙ ПРОДУКТ ДЛЯ НАБОРУ АПАРАТУ*)
IF CTRL.STA_IDLE THEN
    CFG.STEP2:=0;
    HMI.ALM:=0;
END_IF;

(*13000 - Starting*)
IF CTRL.STA_STARTING THEN
    CASE CFG.STEP2 OF
        13000:CFG.STEP2:=13010;CFG.T_STEP2:=0;
        13010:(*відразу відбувається перехід на running*)
	    if CFG.T_STEP2>=2 then 
	    	CTRL.STARTING_CMPLT:=true;
	    end_if; 
	    	    VA.Z1.CMD := 2; (*закрити*)
	    (*команди на контури відправляємо тільки на початку, 
	    щоб можна було ними керувати при зупиненій програмі варки*)
	    LOOP_K1.CMD1.SEL:=1;
        ...
        ELSE
            CFG.STEP2:=13000;CFG.T_STEP2:=0;
    END_CASE;
END_IF;
(*2000 - RUNNING*)
IF CTRL.STA_RUNNING THEN
	    VA.Z1.CMD := 2; (*закрити*)
		...
    CASE CFG.STEP2 OF
        2000:CFG.STEP2:=2010;CFG.T_STEP2:=0; (*ініціалізація*)
        2010:	  
	  IF HMI.ALM.2 THEN
		CTRL.CMD_PAUSE := TRUE;
	  END_IF;
	ELSE
         CFG.STEP2:=2000;CFG.T_STEP2:=0; 
    END_CASE;
    (*умова нормального завершення етапу*)
    IF CTRL.HL_RUNNING_CMPLT (*команда зверху*) THEN (*відладочна команда "далі"*)
     	CTRL.RUNING_CMPLT := TRUE;
    END_IF;

END_IF;
(*14000 - Completing *)
IF CTRL.STA_COMPLETING THEN
    CASE CFG.STEP2 OF
        14000: CFG.STEP2 := 14010; CFG.T_STEP2 := 0;
	14010:
	    CFG.STA.8:=FALSE; (* СКИДАННЯ ПОВІДОМЛЕНЬ *)
	    HMI.ALM.0:=FALSE; (* СКИДАННЯ ПОВІДОМЛЕНЬ *)	
            CTRL.COMPLETING_CMPLT := true;
        ELSE
            CFG.STEP2 := 14000; CFG.T_STEP2 := 0;
    END_CASE;
    (*умова нормального завершення етапу*)
END_IF;
(*8000 - COMPLETE *)
IF CTRL.STA_COMPLETE THEN
	CFG.STEP2 := 8000;
	IF CFG.T_STEP2 >= 2 THEN CTRL.CMD_RESET:=TRUE;end_if;(*автоскидання етапу*)
END_IF;

(*3000 - PAUSING*)
IF CTRL.STA_PAUSING THEN
    CASE CFG.STEP2 OF
        3000: CFG.STEP2 := 3010; CFG.T_STEP2 := 0;
        3010: IF CFG.T_STEP2 >= 2 THEN CTRL.PAUSING_CMPLT := true;end_if;
        ELSE
            CFG.STEP2 := 3000; CFG.T_STEP2 := 0;
    END_CASE;
END_IF;
(*4000 - PAUSED*)
IF CTRL.STA_PAUSED THEN
	    VA.Z1.CMD := 2; (*закрити*)
		...		 
	 IF NOT HMI.ALM.2 THEN
		 CTRL.CMD_RESUME :=TRUE;
	 END_IF;
    CFG.STEP2 := 4000;
END_IF;
(*15000  ============================================================== RESUMING *)
IF CTRL.STA_RESUMING THEN 
    CASE CFG.STEP2 OF
      	15000: CFG.STEP2 := 15010; CFG.T_STEP2 := 0;    	 
    	15010:
		CTRL.RESUMING_CMPLT :=TRUE;
    ELSE
        CFG.STEP2 := 15000; CFG.T_STEP2 := 0;
    END_CASE;
END_IF;


(*7000  - RESTARTING *)
IF CTRL.STA_RESTARTING THEN 
    CASE CFG.STEP2 OF
      	7000: CFG.STEP2 := 7010; CFG.T_STEP2 := 0;    	 
    	7010: IF CFG.T_STEP2 >= 2 THEN CTRL.RESTARTING_CMPLT:=TRUE;end_if;
    ELSE
        CFG.STEP2 := 7000; CFG.T_STEP2 := 0;
    END_CASE;
END_IF;
(*9000  - STOPPING *)
IF CTRL.STA_STOPPING THEN
   CASE CFG.STEP2 OF
        9000: CFG.STEP2 := 9010; CFG.T_STEP2 := 0;
        9010: IF CFG.T_STEP2 >= 2 THEN CTRL.STOPPING_CMPLT:=TRUE;end_if;
   ELSE
       CFG.STEP2 := 9010; CFG.T_STEP2 := 0;
    END_CASE;
END_IF;
(*10000 - STOPPED*)
IF CTRL.STA_STOPPED THEN
    CFG.STEP2 := 10000;
    IF CFG.T_STEP2 >= 2 THEN CTRL.CMD_RESET:=TRUE;end_if;(*автоскидання етапу*)
END_IF;

(*обробка автомату станів*)
PROC_MACH(ID:=ID, CFG:=CFG, HMI:=HMI, CTRL:=CTRL, PROC_BUF:=BUF, PLC:=PLC);

IF PLC.PLS.3 THEN
    CFG.T_STEP2:=CFG.T_STEP2+1;
    IF CFG.T_STEP2>16#7fff_ffff THEN CFG.T_STEP2:=16#7fff_ffff;END_IF;     
END_IF;
```

