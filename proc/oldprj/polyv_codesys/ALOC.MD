``` pascal
-------------------РЕЦЕПТ--------------------
1: //очікування обладнання 
		//якщо обладнання нами зайняте (окрім шарового) - переход на інший крок
		(*X1: подача води, X2: pH, X3: фертигація, X4: блок перемикання, X5: машини полив*)
		CTRLRECIPE.EQUIMENTS_ALLOC_REQ.1:=TRUE;
		CTRLRECIPE.EQUIMENTS_ALLOC_REQ.2:=TRUE;
		CTRLRECIPE.EQUIMENTS_ALLOC_REQ.3:= (MYFERTNMB > 0);
		CTRLRECIPE.EQUIMENTS_ALLOC_REQ.4:=TRUE;
		CTRLRECIPE.EQUIMENTS_ALLOC_REQ.5:=TRUE;

		//UN_GRN.RECIPEID = MYID
		IF UN_GRN.RECIPEID = MYID AND ////перевірка поливочних машин 
			(UN_DS.RECIPEID = MYID OR MYFERTNMB=0) AND //перевірка фертигації
			EM_500.RECIPEID = MYID THEN //перевірка блоку перемикачів
			CTRLRECIPE.STEP2:=2; CTRLRECIPE.TSTEP2:=0;

			RECORD := CONCAT(sBATCHID, '1.Nujnoe oborudovanije vzyato pod upravlenije. Inicializacija etapov...');			
			RECORD := CONCAT (RECORD, sSource);	
			GVL.BATCHLOGCTRL[MYID].wsRECORD:=STRING_TO_WSTRING(RECORD);
			GVL.BATCHLOGCTRL[MYID].xExecute:=TRUE;
------------------------------------------------------------------------

------------------------------ОБЛАДНАННЯ-------------------------------
//ящо крок рецепту займання обладнання
IF RECIPE.STEP2 = 1 THEN
	PHU_MIX1.STA.7 :=FALSE; //скинути підтвердження щапису параметрів
	MYUNIT.RECIPEID := MYRECIPENMB;
ELSIF RECIPE.STEP2 = 2 THEN //скинути обладнання
	PHU_MIX1_CTRL.CMD_RESET:=TRUE;
//ящо крок рецепту запис параметрів в рецепт
ELSIF RECIPE.STEP2 = 3 THEN
	GVLHG.FERTTYPE :=FORMULA.FERT_TYPE;
	GVLHG.PARA_DS3 := FORMULA.FERT_PARA;
	PHU_MIX1.STA.7:=TRUE; //параметри записані
//ящо крок запуску або роботи 
ELSIF RECIPE.STEP2 >= 4 THEN
	PHU_MIX1_CTRL.CMD_START := RECIPE.PHU_MIX.CMD_START;   
	PHU_MIX1_CTRL.CMD_ABORT:= RECIPE.PHU_MIX.CMD_ABORT;
	PHU_MIX1_CTRL.CMD_HOLD := RECIPE.PHU_MIX.CMD_HOLD;
	PHU_MIX1_CTRL.CMD_PAUSE := RECIPE.PHU_MIX.CMD_PAUSE;
 	PHU_MIX1_CTRL.CMD_RESET := RECIPE.PHU_MIX.CMD_RESET;
	PHU_MIX1_CTRL.CMD_RESTART := RECIPE.PHU_MIX.CMD_RESTART;
	PHU_MIX1_CTRL.CMD_RESUME := RECIPE.PHU_MIX.CMD_RESUME;
	PHU_MIX1_CTRL.HL_RUNNING_CMPLT := RECIPE.PHU_MIX.HL_RUNNING_CMPLT;
END_IF; 
-------------------------------------------------------------------------
```