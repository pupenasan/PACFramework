# Журнал змін SEControlExpertLIB

## V1

### V1.0.3 FIX [4.09.22]

- змінено алгоритм розрахунку масштабного коефіцієнту та масштабування в `A_write_parahmi`
- змінено код обробки тривог в `AIVARFN`

### V1.0.2 FIX [30.08.22]

- SR A_write_parahmi:
  -  змінено


```
PARASTOHMI.INTS[4] := AIVARFN.VARBUFOUT.PRM;(*змінено*)
...
if int_to_uint(PARASTOHMI.I)>=AIVARFN.IDMAX then PARASTOHMI.I:=0; end_if;(*перенесено*)
```

### V1.0.1 FIX [29.08.22] 

- VLVDN, DRVFN: 
  - добавлено: збільшення загальних лічильників тривог `PLCCFG.CNTALM` при тривогах ВМ PLCCFG.CNTALM
  - змінено: розміщення

```pascal
IF ALMs.ALM_ALMSTRT THEN
    PLCCFG.ALM_ALM := TRUE;
    ACTCFGu.CNTALM := ACTCFGu.CNTALM + 1;
    PLCCFG.CNTALM:= PLCCFG.CNTALM + 1;
    IF NOT ACTCFGu.ALM.ALM_ALMSTRT THEN
        PLCCFG.ALM_NWALM := TRUE;
    END_IF;
END_IF;
```

### V1.0.0 Офіцінний реліз [26.07.22] 

Випуск першої узгодженої версії бібліотеки

