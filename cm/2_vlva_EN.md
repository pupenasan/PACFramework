# Class VLVA: valves with analog control

CLSID=16#202x

## General description

This class implements the functions for processing an actuator of the "valve with analog control" type. These functions include switching actuator operation modes, actuator control, alarm configuration and processing, simulation control, propagation of states to and from associated process variables, and more.

The class is designed for actuators with an analog control output signal and an analog feedback input signal from the positioner.

For this actuator type, the presence of an analog output variable is mandatory, while the presence of analog feedback and discrete open/closed sensor signals is optional and determined automatically based on a zero index or a disable parameter in the process variable.

## General requirements for VLVA functions

### Functional requirements

The actuator's sensors and control signals are provided as AIVAR, AOVAR, and DIVAR variables. Those not used should be provided as empty (with index 0). The presence or absence of specific sensors and control signals is indicated by parameters.

#### Operating modes

The following actuator control modes are provided:

- manual – control is performed by the operator via SCADA/HMI tools;
- automatic – control is performed according to the algorithms programmed in the control system;
- local – control is performed by the operator using local buttons and switches.

In automatic mode, the actuator's setpoint is changed by the algorithm according to the control program. In manual mode, the setpoint is changed only according to the value from the HMI (this may change depending on process requirements).

#### Actuator configuration

Two configuration modes are provided (MANCFG):

- manual
- automatic

In manual mode, the presence of limit switches and feedback signals is set by the bit parameters PRM.ZOPNENBL, PRM.ZCLSENBL, and PRM.ZPOSENBL.

In automatic mode, these parameters are automatically updated when linked to variables with ID=0 or when they are connected.

Thus, for example, if a limit switch fails, it can be temporarily disabled in the configuration (taken out of service to disable alarm generation), and the valve will automatically switch to operation without this limit switch.

Manual configuration for this valve type has not yet found practical use.

#### Alarm handling

No alarm tracking is provided for VLVA-type actuators.

#### Statistical data handling

VLVA-type actuators track the following statistics:

- number of actuations;
- number of alarms.

Statistical data is reset upon receiving the appropriate commands.

## HMI usage recommendations

An example of configuring analog control valve functions in the HMI is shown below.

![img](media/2_13.png)

Figure. Example of configuring discrete control valve functions in the HMI.

## General requirements for the structure of class variables

#### VLVA_HMI

Here and below, `adr` is specified as an offset in the structure in 16-bit words.

| name | type | adr  | bit  | description                            |
| ---- | ---- | ---- | ---- | -------------------------------------- |
| STA  | UINT | 0    |      | status bits                            |
| CMD  | UINT | 1    |      | control command                        |
| ALM  | Int  | 2    |      | alarm bits                             |
| POS  | Int  | 3    |      | actuator position (0-10000) - feedback |
| CPOS | REAL | 4    |      | actuator position (0-100%) - setpoint  |

#### VLVA_CFG

| name         | type      | adr  | bit  | description                                                  |
| ------------ | --------- | ---- | ---- | ------------------------------------------------------------ |
| ID           | UINT      | 0    |      | unique actuator identifier                                   |
| CLSID        | UINT      | 1    |      | actuator class identifier                                    |
| STA          | UINT      | 2    |      | status bits, can be used as VLVA_STA structure               |
| STA_b0       | BOOL      | 2    | 0    | reserved                                                     |
| STA_b1       | BOOL      | 2    | 1    | reserved                                                     |
| STA_b2       | BOOL      | 2    | 2    | reserved                                                     |
| STA_b3       | BOOL      | 2    | 3    | reserved                                                     |
| STA_b4       | BOOL      | 2    | 4    | reserved                                                     |
| STA_OPND     | BOOL      | 2    | 5    | =1 Open (16#0080)                                            |
| STA_CLSD     | BOOL      | 2    | 6    | =1 Closed (16#0100)                                          |
| STA_b7       | BOOL      | 2    | 7    | reserved                                                     |
| STA_b8       | BOOL      | 2    | 8    | reserved                                                     |
| STA_DISP     | BOOL      | 2    | 9    | =1 remote mode (from PC/HMI) (16#0200)                       |
| STA_MANBX    | BOOL      | 2    | 10   | =1 local manual (feedback)                                   |
| STA_INIOTBUF | BOOL      | 2    | 11   | =1 variable in IoT buffer                                    |
| STA_INBUF    | BOOL      | 2    | 12   | =1 variable in buffer                                        |
| STA_FRC      | BOOL      | 2    | 13   | =1 at least one variable in the object is forced (for commissioning convenience) |
| STA_SML      | BOOL      | 2    | 14   | =1 simulation mode                                           |
| STA_BLCK     | BOOL      | 2    | 15   | =1 blocked                                                   |
| ALM          | UINT      | 3    |      | alarm bits, can be used as VLVA_ALM structure                |
| ALM_b0       | BOOL      | 3    | 0    | reserved                                                     |
| ALM_b1       | BOOL      | 3    | 1    | reserved                                                     |
| ALM_b2       | BOOL      | 3    | 2    | reserved                                                     |
| ALM_b3       | BOOL      | 3    | 3    | reserved                                                     |
| ALM_b4       | BOOL      | 3    | 4    | reserved                                                     |
| ALM_b5       | BOOL      | 3    | 5    | reserved                                                     |
| ALM_b6       | BOOL      | 3    | 6    | reserved                                                     |
| ALM_b7       | BOOL      | 3    | 7    | reserved                                                     |
| ALM_b8       | BOOL      | 3    | 8    | reserved                                                     |
| ALM_b9       | BOOL      | 3    | 9    | reserved                                                     |
| ALM_b10      | BOOL      | 3    | 10   | reserved                                                     |
| ALM_b11      | BOOL      | 3    | 11   | reserved                                                     |
| ALM_b12      | BOOL      | 3    | 12   | reserved                                                     |
| ALM_b13      | BOOL      | 3    | 13   | reserved                                                     |
| ALM_b14      | BOOL      | 3    | 14   | reserved                                                     |
| ALM_b15      | BOOL      | 3    | 15   | reserved                                                     |
| CMD          | ACTTR_CMD | 4    |      | bit commands                                                 |
| PRM          | ACTTR_PRM | 6    |      | parameter bits                                               |
| POS          | REAL      | 8    |      | actuator position (0-100%) - feedback                        |
| CPOS         | REAL      | 10   |      | actuator position (0-100%) - setpoint                        |
| T_DEASP      | UINT      | 12   |      | alarm delay time in 0.1 seconds                              |
| STEP1        | UINT      | 13   |      | step number                                                  |
| CNTPER       | UINT      | 14   |      | position change count                                        |
| CNTALM       | UINT      | 15   |      | alarm count                                                  |
| T_STEP1      | UDINT     | 16   |      | current step time in ms                                      |
| T_PREV       | UDINT     | 18   |      | time in ms since the previous call, taken from PLC_CFG.TQMS  |

#### Commands

| Attribute | Type | Bit  | Description                                                  |
| --------- | ---- | ---- | ------------------------------------------------------------ |
| CMD       | UINT |      | Commands:16#0001: open16#0002: close16#0003: toggle16#0004: acknowledge alarm16#0005: reset alarms16#0006: block16#0007: unblock16#0008: stop auto-tuning16#0009: start auto-tuning16#000A: enable protection algorithm16#000B: enable control16#000C: enable control with system pressure16#000D: start speed sensor calibrationE..10 - free16#0011: start16#0012: stop16#0013: enable reverse14-20 - free16#0021: increase16#0022: decrease23-9F - free16#0100: read configuration16#0101: write configuration102-2FF free16#0300: toggle manual/automatic16#0301: enable manual mode16#0302: enable automatic mode16#0313: enable local mode16#0314: disable local mode16#0315: take out of service16#0316: put into service316..400 - free16#0401: reset alarm counter16#0402: reset actuation/movement counter16#0403: reset actuation/movement counter16#0404: reset actuation/movement counter |

## Working with the buffer

A function for working with a classic buffer must be implemented.

- It is recommended to use one buffer for all actuator types.
- Buffer occupancy is checked by matching the class identifier `CLSID` and the actuator identifier `ID`.
- When the buffer is captured:
  - `ACTBUF.STA = ACTTR_CFG.STA`
  - `ACTTR_CFG.CMD = ACTBUF.CMD` if it is not zero (to allow commands from another source)
- The actuator configuration should be read into the buffer upon receiving commands:
  - update of the process variable already written into the buffer `ACTTR_HMI.CMD` = 16#0100
- The actuator configuration should be written from the buffer upon receiving commands:
  - `ACTBUF.CMD` = 16#0101

A function for working with parameterized bidirectional buffers ACTBUFIN<->ACTBUFOUT must also be implemented.

- Two buffers are used:
  - input `ACTBUFIN` - used for processing commands (when CLSID and ID match) and writing information into the actuator
  - output `ACTBUFOUT` - used for reading information from the actuator upon receiving a read command from `ACTBUFIN`
- It is recommended to use one pair of buffers for all actuators.
- Buffer occupancy is not possible since the buffer is implemented via two buffer variables ACTBUFIN and ACTBUFOUT through which the information passes for further transfer to the actuator or the internal buffer of the HMI tool (similar to parameter exchange PKW in the PROFIDRIVE profile).
- The actuator configuration should be read into the output buffer when:
  - classes match `ACTTR_CFG.CLSID=ACTBUFIN.CLSID`, identifiers match `ACTCFG.ID=ACTBUFIN.ID`, and a command is received from the input buffer `ACTBUFIN.CMD=16#100`
- The actuator configuration should be written from the input buffer when:
  - classes match `ACTTR_CFG.CLSID=ACTBUFIN.CLSID`, identifiers match `ACTTR_CFG.ID=ACTBUFIN.ID`, and a command is received from the input buffer `ACTBUFIN.CMD=16#101`

## Interface implementation requirements

The interface must pass the following parameters:

- VLVACFG - INOUT
- VLVAHMI - INOUT
- process variables of actuator sensors (limit switches, local buttons, etc.) - INOUT
- process variables of actuator outputs (solenoid, starters, etc.) - INOUT

If it is not possible to access external variables from within the functions, `PLC_CFG`, `ACTBUF`, `ACTBUFIN`, `ACTBUFOUT` should be passed; alternatively, other interfaces within `PLC_CFG` may be used.

## Actuator initialization during the first cycle

By default, writing the ID and CLSID is performed as part of the `initvars` program section.

For each process variable in `initvars`, the following program fragment should be used to write the ID and CLSID:

```
"ACT".VLVA.ID:=10001;   "ACT".VLVA.CLSID:=16#2020;
```

Initialization is also performed inside the actuator processing function, resulting in:

- if the alarm delay time is not set, it is assigned `VLVA.T_DEASP := 200;`
- process alarms for sensors are not used, for example: `SOPN.PRM.ISALM := false; SOPN.PRM.ISWRN := false;`

## User program implementation requirements

- Actuator processing functions must be called with each call of the task to which they are bound.
- On the first startup (`PLC_CFG.SCN1`), actuator identifiers and class identifiers must be initialized.

The implementation of the actuator processing function program consists of the following stages:

#### `VLVA_to_ACT`

Reading information from a variable corresponding to the actuator type into a variable of the universal actuator type – performed for convenience and unification of further processing, executed by the `VLVA_to_ACT` function.

The following parameters must be passed to the interface:

- VLVACFG - INOUT - actuator configuration variable
- VLVAHMI - INOUT - actuator HMI variable
- ACTCFG - INOUT - universal actuator type used internally for unification

If it is not possible to access external variables from within the functions, `PLC_CFG`, `ACTBUF`, `ACTBUFIN`, `ACTBUFOUT` are passed; alternatively, other interfaces within `PLC_CFG` can be used.

```pascal
#ACTCFG.ID:= #VLVACFG.ID;
#ACTCFG.CLSID:= #VLVACFG.CLSID;
#ACTCFG.CMD:= #VLVACFG.CMD;
#ACTCFG.PRM:= #VLVACFG.PRM;
#ACTCFG.T_DEASP:= #VLVACFG.T_DEASP;
#ACTCFG.POS:= #VLVACFG.POS;
#ACTCFG.CPOS:= #VLVACFG.CPOS;
#ACTCFG.STEP1:= #VLVACFG.STEP1;
#ACTCFG.CNTPER:= #VLVACFG.CNTPER;
#ACTCFG.CNTALM:= #VLVACFG.CNTALM;
#ACTCFG.T_STEP1:= #VLVACFG.T_STEP1;
#ACTCFG.T_PREV:= #VLVACFG.T_PREV;

#ACTCFG.STA.OPND:= #VLVACFG.STA.OPND;
#ACTCFG.STA.CLSD:= #VLVACFG.STA.CLSD;
#ACTCFG.STA.DISP:= #VLVACFG.STA.DISP;
#ACTCFG.STA.MANBX:= #VLVACFG.STA.MANBX;
#ACTCFG.STA.INBUF:= #VLVACFG.STA.INBUF;
#ACTCFG.STA.FRC:= #VLVACFG.STA.FRC;
#ACTCFG.STA.SML:= #VLVACFG.STA.SML;
#ACTCFG.STA.BLCK:= #VLVACFG.STA.BLCK;

#ACTCFG.CMDHMI:=#VLVAHMI.CMD;
```

#### `ACT_PRE`

preprocessing of the actuator: initialization of STA, ALM, CMD, processing INBUF, SML, calculation of dt - performed by the `ACT_PRE` function.

The interface must pass the following parameters:

- ACTCFG - INOUT - universal actuator type, used internally for unification
- STA - INOUT - status set type of the universal actuator, used internally for unification
- ALMs - INOUT - alarm set type of the universal actuator, used internally for unification
- CMD - INOUT - command set type of the universal actuator, used internally for unification
- dt - INOUT - time difference between actuator function calls

If it is not possible to access external variables from within the functions, `PLC_CFG`, `ACTBUF`, `ACTBUFIN`, `ACTBUFOUT` should be passed; alternatively, other interfaces within `PLC_CFG` may be used.

```pascal
(*initial processing for all actuators: initialization, assignment to internal STA, ALM; determination of INBUF, SML, #dt  *)
(*first scan*)
IF "SYS".PLCCFG.STA.SCN1 THEN
    (*resetting bits of the STA structure*)
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
    (*resetting bits of the ALM structure*)
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
#ALMs.ALMBELL := false; (*the bell resets after one cycle*)
#STA.INBUF := (#ACTCFG.ID = "BUF".ACTBUF.ID AND "BUF".ACTBUF.ID <> 0 AND #ACTCFG.CLSID = "BUF".ACTBUF.CLSID); (*located in the configuration buffer*)
#STA.SML := "SYS".PLCCFG.STA.SMLALL; (*simulation mode*)
#dt := "SYS".PLCCFG.TQMS - #ACTCFG.T\_PREV; (*time difference between calls in ms*)
IF #dt < 1 THEN #dt := 1; END\_IF;

```

#### `ACT_CMDCTRL`

command processing – executed by the standard command handler for all actuators, implemented as the `ACT_CMDCTRL` function.

The following parameters must be passed to the interface:

- ACTCFG - INOUT - universal actuator type, used internally for unification of processing
- STA - INOUT - status set type of the universal actuator, used internally for unification of processing
- CMD - INOUT - command set type of the universal actuator, used internally for unification of processing

If it is not possible to access external variables from inside the functions, `PLC_CFG`, `ACTBUF`, `ACTBUFIN`, `ACTBUFOUT` are passed; alternatively, other interfaces can be used within `PLC_CFG`.

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
END_IF;(* in manual mode, all automatic control commands are reset *)
IF #STA.DISP THEN
    #CMD.OPN := FALSE;
    #CMD.CLS := FALSE;
    #CMD.TOGGLE := FALSE;
    #CMD.START := FALSE;
    #CMD.STOP := FALSE;
    #CMD.REVERS := FALSE;
    #CMD.TOGGLE := FALSE;
END_IF;

(* operator control commands
16#0001 - CMD_OPN
16#0002 - CMD_CLS
16#0004 - CMD_ALMRST
16#0008 - CMD_DBLK
16#0010 - CMD_STOP
*)

(* HMI commands *)
CASE #CMDINT OF
    16#0001: (* open *)
        #CMD.OPN := TRUE;
        #CMD.CLS := FALSE;
    16#0002: (* close *)
        #CMD.CLS := TRUE;
        #CMD.OPN := FALSE;
    16#0003: (* toggle *)
        #CMD.TOGGLE := TRUE;
    16#0004: (* acknowledge alarm *)
        #CMD.ALMACK := TRUE;
    16#0005: (* reset alarms *)
        #CMD.ALMRESET := TRUE;
    16#0006:
        #CMD.BLCK := TRUE; (* block *)
    16#0007:
        #CMD.DBLCK := TRUE; (* unblock *)
    16#0008:
        #CMD.STOPTUN := TRUE; (* stop auto-tuning *)
    16#0009:
        #CMD.TUNING := TRUE; (* start auto-tuning *)
    16#000A:
        #CMD.PROTECT := TRUE; (* enable protection algorithm *)
    16#000B: (* enable control *)
        #CMD.RESOLUTION := TRUE; (* for one cycle *)
    16#000C: (* enable control if system pressure is present *)
        #CMD.P_RESOLUTION := TRUE; (* for one cycle *)
    16#000D: (* start speed sensor calibration *)
        #CMD.DBLCKACTTOGGLE := TRUE;
        #STA.DBLCKACT := NOT #STA.DBLCKACT;

        (* E..10 - free *)

    16#0011: (* start *)
        #CMD.START := TRUE;
        #CMD.STOP := FALSE;
    16#0012: (* stop *)
        #CMD.STOP := TRUE;
        #CMD.START := FALSE;
    16#0013: (* enable reverse *)
        #CMD.REVERS := TRUE;
        (* 14-20 - free *)
    16#0021:
        #CMD.UP := TRUE; (* increase *)
    16#0022:
        #CMD.DWN := TRUE; (* decrease *)
        (* 23-9F - free *)
        (* starting from 16#0080 only for buffer operations and mode control *)
    16#0100: (* read configuration *)
        #CMD.BUFLOAD := TRUE;
        "BUF".ACTBUF := #ACTCFG;
    16#0101: (* write configuration *)
        #ACTCFG.PRM := "BUF".ACTBUF.PRM;
        #ACTCFG.T_DEASP := "BUF".ACTBUF.T_DEASP;
        #ACTCFG.T_OPNSP := "BUF".ACTBUF.T_OPNSP;
        #ACTCFG.STOP_DELAY := "BUF".ACTBUF.STOP_DELAY;
    (* 102-2FF - free *)
    16#0300: (* toggle manual/auto mode *)
        #STA.DISP := NOT #STA.DISP;
    16#0301: (* manual mode *)
        #STA.DISP := TRUE;
    16#0302: (* auto mode *)
        #STA.DISP := FALSE;
    16#0313: (* enable local mode *)
        #STA.MANBXOUT := TRUE;
        #STA.MANBX := TRUE;
        #STA.DISP := TRUE;
    16#0314: (* disable local mode *)
        #STA.MANBXOUT := FALSE;
        #STA.MANBX := FALSE;
    16#0315: (* take out of service *)
        #CMD.OUTSRVC := TRUE;
    16#0316: (* put into service *)
        #CMD.INSRVC := TRUE;
    (* statistics control *)
    16#0401: (* reset alarm counter 1025 *)
        #ACTCFG.CNTALM := 0;
    16#0402: (* reset movement counter 1026 *)
        #ACTCFG.CNTPER := 0;
    16#0403: (* reset movement counter 1027 *)
        #ACTCFG.TQ_TOTAL := 0;
    16#0404: (* reset movement counter 1028 *)
        #ACTCFG.TQ_LAST := 0;
END_CASE;

(* pass unblock/block commands from buffer and HMI *)
IF #ACTCFG.CMDHMI = 16#0006 OR ("BUF".ACTBUF.CMDHMI = 16#0006 AND #STA.INBUF) THEN
    #CMD.BLCK := TRUE;
END_IF;
IF #ACTCFG.CMDHMI = 16#0007 OR ("BUF".ACTBUF.CMDHMI = 16#0007 AND #STA.INBUF) THEN
    #CMD.DBLCK := TRUE;
END_IF;

#CMDINT := 0;
#ACTCFG.CMDHMI := 0;
IF #STA.INBUF THEN
    "BUF".ACTBUF.CMDHMI := 0;
END_IF;
```

#### `VLVAFN`

Direct processing of the actuator in the `VLVAFN` function.

```pascal
"VLVA_to_ACT"(VLVACFG := #ACTCFG, VLVAHMI := #ACTHMI, ACTCFG := #ACTCFGu);

(* preliminary processing: init STA, ALM, CMD, INBUF, SML, dt *)
"ACT_PRE"(ACTCFG := #ACTCFGu, STA := #STA, ALMs := #ALMs, CMD := #CMD, dt := #dT);

(* default values *)
IF "SYS".PLCCFG.STA.SCN1 THEN (* first scan *)
    IF #ACTCFGu.T_OPNSP <= 0 THEN (* if opening time setpoint is not set *)
        #ACTCFGu.T_OPNSP := 500; (* 5 seconds *)
    END_IF;
    IF #ACTCFGu.T_DEASP <= 0 THEN (* if alarm delay time setpoint is not set *)
        #ACTCFGu.T_DEASP := 200; (* 2 seconds *)
    END_IF;
    (* technological alarms for sensors are not used *)
    IF #SOPN.ID <> 0 THEN
        #SOPN.PRM.ISALM := FALSE; (* ISALM *)
        #SOPN.PRM.ISWRN := FALSE; (* ISWRN *)
    END_IF;
    IF #SCLS.ID <> 0 THEN
        #SCLS.PRM.ISALM := FALSE; (* ISALM *)
        #SCLS.PRM.ISWRN := FALSE; (* ISWRN *)
    END_IF;
END_IF;

(* --------------------- parameters block
// parameter check for sensor presence/usage on input *)
#ACTCFGu.PRM.PRM_MANCFG := FALSE; (* no manual IO parameter configuration in this project *)
#ACTCFGu.PRM.PRM_ZCLSENBL := NOT #SCLS.PRM.DSBL AND #SCLS.ID <> 0;
#ACTCFGu.PRM.PRM_ZOPNENBL := NOT #SOPN.PRM.DSBL AND #SOPN.ID <> 0;
#ACTCFGu.PRM.PRM_ALMENBL := FALSE;
#ACTCFGu.PRM.PRM_ZWRKENBL := FALSE;
#ACTCFGu.PRM.PRM_ZPOSENBL := NOT #POS.PRM.DSBL AND #POS.ID <> 0;
#ACTCFGu.PRM.PRM_PWRENBL := FALSE;
#ACTCFGu.PRM.PRM_BTNSTPENBL := FALSE;
#ACTCFGu.PRM.PRM_ALMENBL := FALSE;
#ACTCFGu.PRM.PRM_SELLCLENBL := FALSE;
(* pulse control parameters *)
#ACTCFGu.PRM.PRM_PULSCTRLENBL := FALSE;

(* ------------------- simulation mode block
// subordinate simulation mode from master *)
#SOPN.STA.SML := #STA.SML;
#SCLS.STA.SML := #STA.SML;

(* simulation mode logic *)
IF #STA.SML THEN
    #ACTCFGu.POS := #ACTCFG.CPOS;
    IF #ACTCFGu.POS < 0.0 THEN #ACTCFGu.POS := 0.0; END_IF;
    IF #ACTCFGu.POS > 100.0 THEN #ACTCFGu.POS := 100.0; END_IF;

    (* sensor simulation *)
    IF NOT #SOPN.STA.FRC THEN
        #SOPN.STA.VALB := #ACTCFGu.POS > 99.0;
    END_IF;
    IF NOT #SCLS.STA.FRC THEN
        #SCLS.STA.VALB := #ACTCFGu.POS < 3.0;
    END_IF;
END_IF;


(*-------------------- command handling block
// standard command handler *)
"ACT_CMDCTRL"(ACTCFG := #ACTCFGu, CMD := #CMD, STA := #STA);

(* ------------------- block for handling open/close sensor states or their logical substitution *)
IF NOT #ACTCFGu.PRM.PRM_ZPOSENBL THEN      (* if there is no position feedback signal *)
    #SPOS1 := #CPOS.VAL;                   (* then set position equal to the setpoint value *)
ELSE
    #SPOS1 := #POS.VAL;                    (* otherwise take the value from the sensor *)
END_IF;

IF NOT #ACTCFGu.PRM.PRM_ZOPNENBL THEN      (* if there is no open limit switch *)
    #SOPN1 := #SPOS1 >= 3.0;               (* then consider open if position is greater than 3 *)
ELSE
    #SOPN1 := #SOPN.STA.VALB;              (* otherwise take the value from the sensor *)
END_IF;

IF NOT #ACTCFGu.PRM.PRM_ZCLSENBL THEN      (* if there is no close limit switch *)
    #SCLS1 := #SPOS1 < 3.0;                (* then consider closed if position is less than 3 *)
ELSE
    #SCLS1 := #SCLS.STA.VALB;              (* otherwise take the value from the sensor *)
END_IF;

(*----------------- position state and position alarm state machine *)
CASE #ACTCFGu.STEP1 OF
    0: (* initialization *)
        #ACTCFGu.STEP1 := 1;
        #ACTCFGu.T_STEP1 := 0;
    1, 4, 5: (* stopped: 1 - stopped in intermediate position, 4 - stopped in open position, 5 - stopped in closed position *)
        IF #ACTCFGu.POS > 3.0 AND #ACTCFGu.STEP1 <> 4 THEN
            #ACTCFGu.STEP1 := 4;
            #ACTCFGu.T_STEP1 := 0;
        END_IF;
        IF #ACTCFGu.POS < 3.0 AND #ACTCFGu.STEP1 <> 5 THEN
            #ACTCFGu.STEP1 := 5;
            #ACTCFGu.T_STEP1 := 0;
        END_IF;
    ELSE (* undefined *)
        #ACTCFGu.STEP1 := 0;
END_CASE;

(* bitwise state machine *)
#STA.IMSTPD := (#ACTCFGu.STEP1 = 0) OR (#ACTCFGu.STEP1 = 1);
#STA.OPND := #ACTCFGu.STEP1 = 4;
#STA.CLSD := #ACTCFGu.STEP1 = 5;

(*----------------------------- actuator control *)

(* control OPN/CLS only when control is allowed or temporarily unblocked *)
IF (#CMD.RESOLUTION OR "SYS".PLCCFG.STA_PERM.%X6) AND NOT #STA.BLCK THEN
    ;
ELSE
    #ACTCFG.CPOS := 0.0;
    #ACTHMI.CPOS := 0.0;
END_IF;

(*-------------------- modes *)

#STA.FRC := (#CPOS.STA.FRC AND #CPOS.ID <> 0)
OR (#POS.STA.FRC AND #POS.ID <> 0)
OR (#SOPN.STA.FRC AND #SOPN.ID <> 0)
OR (#SCLS.STA.FRC AND #SCLS.ID <> 0);

(*------------------- summary of custom alarms, modes, bits *)
IF #STA.DISP THEN
    "SYS".PLCCFG.STA.DISP := TRUE;
    "SYS".PLCCFG.CNTMAN := "SYS".PLCCFG.CNTMAN + 1;
END_IF;

IF #STA.BLCK THEN
    "SYS".PLCCFG.STA.BLK := TRUE;
END_IF;

#ALMs.ALM := FALSE;
IF #ALMs.ALM THEN
    "SYS".PLCCFG.ALM1.ALM := TRUE;
    "SYS".PLCCFG.CNTALM := "SYS".PLCCFG.CNTALM + 1;
END_IF;

#ACTCFG.POS := #SPOS1;

IF #STA.DISP THEN
    "SYS".PLCCFG.STA.DISP := TRUE;
    "SYS".PLCCFG.CNTMAN := "SYS".PLCCFG.CNTMAN + 1;
END_IF;

IF #STA.BLCK THEN
    "SYS".PLCCFG.STA.BLK := TRUE;
END_IF;

(* final processing: summary into PLC.CFG, STA, ALM, CMD, INBUF, SML, dt *)
"ACT_POST"(ACTCFG := #ACTCFGu, STA := #STA, ALMs := #ALMs, CMD := #CMD, dt := #dT);

"ACT_to_VLVA"(VLVACFG := #ACTCFG, VLVAHMI := #ACTHMI, ACTCFG := #ACTCFGu);


(*------------------- task source selection *)
IF #ACTCFGu.STA.INBUF AND #ACTCFGu.STA.DISP THEN
    #ACTCFGu.CPOS := "BUF".ACTBUF.CPOS;
    #ACTHMI.CPOS := #ACTCFGu.CPOS;
    #ACTCFG.CPOS := #ACTCFGu.CPOS;
ELSIF NOT #ACTCFGu.STA.INBUF AND #ACTCFGu.STA.DISP THEN
    #ACTCFGu.CPOS := #ACTHMI.CPOS;
    #ACTHMI.CPOS := #ACTCFGu.CPOS;
    #ACTCFG.CPOS := #ACTCFGu.CPOS;
ELSE
    #ACTCFGu.CPOS := #ACTCFG.CPOS;
    #ACTHMI.CPOS := #ACTCFGu.CPOS;
    #ACTCFG.CPOS := #ACTCFGu.CPOS;
END_IF;
#CPOS.VAL := #ACTCFGu.CPOS;

(* implementation of reading configuration data into the out buffer *)
IF (UINT_TO_WORD(#ACTCFG.CLSID) AND 16#FFF0) = (UINT_TO_WORD("BUF".ACTBUFIN.CLSID) AND 16#FFF0)
AND #ACTCFG.ID = "BUF".ACTBUFIN.ID
AND "BUF".ACTBUFIN.CMDHMI = 16#100 THEN
    (* MSG 200-Ok 400-Error
    // 200 - Data written
    // 201 - Data read *)
    "BUF".ACTBUFOUT.MSG := 201;

    "BUF".ACTBUFOUT.T_DEASP := #ACTCFG.T_DEASP;

    "BUF".ACTBUFIN.CMDHMI := 0;
END_IF;

(* implementation of writing configuration data from the in buffer to the process variable *)
IF (UINT_TO_WORD(#ACTCFG.CLSID) AND 16#FFF0) = (UINT_TO_WORD("BUF".ACTBUFIN.CLSID) AND 16#FFF0)
AND #ACTCFG.ID = "BUF".ACTBUFIN.ID
AND "BUF".ACTBUFIN.CMDHMI = 16#101 THEN
    (* MSG 200-Ok 400-Error
    // 200 - Data written
    // 201 - Data read *)
    "BUF".ACTBUFOUT := "BUF".ACTBUFIN;

    #ACTCFG.T_DEASP := "BUF".ACTBUFIN.T_DEASP;

    "BUF".ACTBUFOUT.MSG := 200;

    "BUF".ACTBUFIN.CMDHMI := 0;
END_IF;
```

#### `ACT_POST`

final processing of the actuator: aggregation into PLC.CFG, generation of STA and ALM for the actuator, clearing CMD, calculation of dt, etc., implemented as the `ACT_POST` function.

The interface should receive the following parameters:

- ACTCFG - INOUT - universal actuator type, used internally for standardization
- STA - INOUT - status set type for the universal actuator, used internally for standardization
- ALMs - INOUT - alarm set type for the universal actuator, used internally for standardization
- CMD - INOUT - command set type for the universal actuator, used internally for standardization
- dt - INOUT - time difference between actuator function calls

If it is not possible to access external variables from within the functions, `PLC_CFG`, `ACTBUF`, `ACTBUFIN`, `ACTBUFOUT` are passed; alternatively, other interfaces can be used for internal use within `PLC_CFG`.

```pascal
(* final processing of the actuator before the act_to_XXX function: updating general PLC status bits,
limiting alarm counters, writing to STA, ALM, updating the buffer *)

(* modes - in PLC *)

(* general bit if at least one actuator is in manual mode *)
IF #STA.DISP THEN
    "SYS".PLCCFG.STA.DISP := TRUE;
END_IF;
IF #STA.SML THEN
    "SYS".PLCCFG.STA.SML := TRUE;
END_IF;

IF #ACTCFG.CNTALM > 30000 THEN
    #ACTCFG.CNTALM := 30000;
END_IF;

IF #ACTCFG.CNTPER > 30000 THEN
    #ACTCFG.CNTPER := 30000;
END_IF;

#ACTCFG.STA := #STA;
#ACTCFG.ALM := #ALMs;

(* clear all HMI commands *)
#ACTCFG.CMDHMI := 0;

(* clear all program commands *)

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


(* updating the HMI buffer
// only continuously changing values are constantly transferred to the buffer *)
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

#### `ACT_to_VLVA`

transferring information from a universal actuator variable type to a variable matching the actuator type – performed for convenience and processing unification, executed by the `ACT_to_VLVA` function.

The following parameters must be passed to the interface:

- VLVACFG - INOUT - actuator configuration variable
- VLVAHMI - INOUT - actuator HMI variable
- ACTCFG - INOUT - universal actuator type, used internally for processing unification

If it is not possible to access external variables from within functions, `PLC_CFG`, `ACTBUF`, `ACTBUFIN`, `ACTBUFOUT` are passed; alternatively, other interfaces can be used within `PLC_CFG`.

```pascal
#VLVACFG.ID:= #ACTCFG.ID;
#VLVACFG.CLSID:= #ACTCFG.CLSID;
#VLVACFG.CMD:= #ACTCFG.CMD;
#VLVACFG.PRM:= #ACTCFG.PRM;
#VLVACFG.T_DEASP:= #ACTCFG.T_DEASP;

#VLVACFG.POS:= #ACTCFG.POS;
#VLVACFG.CPOS:= #ACTCFG.CPOS;
#VLVACFG.STEP1:= #ACTCFG.STEP1;
#VLVACFG.CNTPER:= #ACTCFG.CNTPER;
#VLVACFG.CNTALM:= #ACTCFG.CNTALM;
#VLVACFG.T_STEP1:= #ACTCFG.T_STEP1;
#VLVACFG.T_PREV:= #ACTCFG.T_PREV;

#VLVACFG.STA.STA_b0:= false;
#VLVACFG.STA.STA_b1:= false;
#VLVACFG.STA.STA_b2:= false;
#VLVACFG.STA.STA_b3:= false;
#VLVACFG.STA.STA_b4:= false;
#VLVACFG.STA.OPND:= #ACTCFG.STA.OPND;
#VLVACFG.STA.CLSD:= #ACTCFG.STA.CLSD;
#VLVACFG.STA.STA_b7:= false;
#VLVACFG.STA.STA_b8:= false;
#VLVACFG.STA.DISP:= #ACTCFG.STA.DISP;
#VLVACFG.STA.MANBX:= #ACTCFG.STA.MANBX;
#VLVACFG.STA.INBUF:= #ACTCFG.STA.INBUF;
#VLVACFG.STA.FRC:= #ACTCFG.STA.FRC;
#VLVACFG.STA.SML:= #ACTCFG.STA.SML;
#VLVACFG.STA.BLCK:= #ACTCFG.STA.BLCK;


#VLVACFG.ALM.ALM_b0:= false;
#VLVACFG.ALM.ALM_b1:= false;
#VLVACFG.ALM.ALM_b2:= false;
#VLVACFG.ALM.ALM_b3:= false;
#VLVACFG.ALM.ALM_b4:= false;
#VLVACFG.ALM.ALM_b5:= false;
#VLVACFG.ALM.ALM_b6:= false;
#VLVACFG.ALM.ALM_b7:= false;
#VLVACFG.ALM.ALM_b8:= false;
#VLVACFG.ALM.ALM_b9:= false;
#VLVACFG.ALM.ALM_b10:= false;
#VLVACFG.ALM.ALM_b11:= false;
#VLVACFG.ALM.ALM_b12:= false;
#VLVACFG.ALM.ALM_b13:= false;
#VLVACFG.ALM.ALM_b14:= false;
#VLVACFG.ALM.ALM_b15:= false;

#VLVAHMI.CMD:=#ACTCFG.CMDHMI;

#VLVAHMI.STA.%X0 :=#VLVACFG.STA.STA_b0;
#VLVAHMI.STA.%X1 :=#VLVACFG.STA.STA_b1;
#VLVAHMI.STA.%X2 :=#VLVACFG.STA.STA_b2;
#VLVAHMI.STA.%X3 :=#VLVACFG.STA.STA_b3;
#VLVAHMI.STA.%X4 :=#VLVACFG.STA.STA_b4;
#VLVAHMI.STA.%X5 :=#VLVACFG.STA.OPND;
#VLVAHMI.STA.%X6 :=#VLVACFG.STA.CLSD;
#VLVAHMI.STA.%X7 := #VLVACFG.STA.STA_b7;
#VLVAHMI.STA.%X8 := #VLVACFG.STA.STA_b8;
#VLVAHMI.STA.%X9 :=#VLVACFG.STA.DISP;
#VLVAHMI.STA.%X10 :=#VLVACFG.STA.MANBX;
#VLVAHMI.STA.%X11 := #VLVACFG.STA.INIOTBUF;
#VLVAHMI.STA.%X12 :=#VLVACFG.STA.INBUF;
#VLVAHMI.STA.%X13 := #VLVACFG.STA.FRC;
#VLVAHMI.STA.%X14 :=#VLVACFG.STA.SML;
#VLVAHMI.STA.%X15 :=#VLVACFG.STA.BLCK;

#VLVAHMI.ALM.%X0 :=#VLVACFG.ALM.ALM_b0;
#VLVAHMI.ALM.%X1 :=#VLVACFG.ALM.ALM_b1;
#VLVAHMI.ALM.%X2 :=#VLVACFG.ALM.ALM_b2;
#VLVAHMI.ALM.%X3 :=#VLVACFG.ALM.ALM_b3;
#VLVAHMI.ALM.%X4 :=#VLVACFG.ALM.ALM_b4;
#VLVAHMI.ALM.%X5 :=#VLVACFG.ALM.ALM_b5;
#VLVAHMI.ALM.%X6 :=#VLVACFG.ALM.ALM_b6;
#VLVAHMI.ALM.%X7 :=#VLVACFG.ALM.ALM_b7;
#VLVAHMI.ALM.%X8 :=#VLVACFG.ALM.ALM_b8;
#VLVAHMI.ALM.%X9 :=#VLVACFG.ALM.ALM_b9;
#VLVAHMI.ALM.%X10 :=#VLVACFG.ALM.ALM_b10;
#VLVAHMI.ALM.%X11 :=#VLVACFG.ALM.ALM_b11;
#VLVAHMI.ALM.%X12 :=#VLVACFG.ALM.ALM_b12;
#VLVAHMI.ALM.%X13 :=#VLVACFG.ALM.ALM_b13;
#VLVAHMI.ALM.%X14 :=#VLVACFG.ALM.ALM_b14;
#VLVAHMI.ALM.%X15 :=#VLVACFG.ALM.ALM_b15;

#VLVAHMI.POS := REAL_TO_INT(#VLVACFG.POS)*100;
```

## Testing

Before starting testing, it is necessary to create 2-3 actuator variables, create calls to actuator data processing functions with full connection of inputs and outputs (analog output control variable and analog input feedback variable), and implement processing of technological variables corresponding to the actuator’s inputs and outputs.

### List of general tests

| No.  | Name                                             | When to check                 | Notes |
| ---- | ------------------------------------------------ | ----------------------------- | ----- |
| 1    | Assignment of ID and CLSID at startup            | after function implementation |       |
| 2    | Initialization of default parameters             | after function implementation |       |
| 3    | Reading to buffer and writing from buffer        | after function implementation |       |
| 4    | Operation of built-in time counters              | after function implementation |       |
| 5    | Impact of PLC time counter overflow on step time | after function implementation |       |
| 6    | Actuator mode control                            | after function implementation |       |
| 7    | Actuator control                                 | after function implementation |       |
| 8    | Actuator auto-configuration algorithms           | after function implementation |       |
|      |                                                  |                               |       |

### 1 Assignment of ID and CLSID at startup

- Before starting the test, the PLC must be in STOP.
- After starting, all actuator variables used in the program must be assigned their ID and CLSID.

### 2 Initialization of default parameters

- Before starting the test, the PLC must be in STOP.
- After starting, for all actuators, the alarm delay time VLVA.T_DEASP will take the value 200 (2 seconds).

### 3 Reading to buffer and writing from buffer

| No.  | Action to check                                              | Expected result                                              | Notes |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1    | Send a write-to-buffer command for any variable VLVA_HMI.CMD := 16#0100 | ACTBUF.ID will take the value of VLVA_CFG.ID, ACTBUF.CLSID will take the value of VLVA_CFG.CLSID, status bits, alarm bits, and parameter bits of ACTBUF will take the values of the corresponding bits of VLVA_CFG, and other parameters of VLVA_CFG will be written into the corresponding parameters of ACTBUF. |       |
| 2    | Send a command to switch the actuator to manual mode VLVA_HMI.CMD := 16#0301 | The bit VLVA_HMI.STA.X9, VLVA_CFG.STA.DISP, and ACTBUF.STA.DISP will take the value 1. |       |
| 3    | Change any parameter value in the buffer, for example ACTBUF.T_DEASP to 1000, then send a command via the buffer ACTBUF.CMDHMI := 16#0100 to re-read the data into the buffer | The variable will be re-read into the buffer, and the changed parameter will revert to its previous value. |       |
| 4    | Send a write-to-buffer command for another variable VLVA_HMI.CMD := 16#0100 | ACTBUF.ID will take the value of VLVA_CFG.ID, ACTBUF.CLSID will take the value of VLVA_CFG.CLSID, status bits, alarm bits, and parameter bits of ACTBUF will take the values of the corresponding bits of VLVA_CFG, and other parameters of VLVA_CFG will be written into the corresponding parameters of ACTBUF. |       |
| 5    | Send a write-to-buffer command for another variable VLVA_CFG.CMD.BUFLOAD | ACTBUF.ID will take the value of VLVA_CFG.ID, ACTBUF.CLSID will take the value of VLVA_CFG.CLSID, status bits, alarm bits, and parameter bits of ACTBUF will take the values of the corresponding bits of VLVA_CFG, and other parameters of VLVA_CFG will be written into the corresponding parameters of ACTBUF. |       |
| 6    | Change any parameter value in the buffer, for example ACTBUF.T_DEASP to 1000, then send a command via the buffer ACTBUF.CMDHMI := 16#0101 to write the data from the buffer to the actuator variable | The value from ACTBUF.T_DEASP will be written into the variable VLVA_CFG.T_DEASP. |       |

### 4 Operation of built-in time counters

The elapsed step time for the actuator `VLVA_CFG` is displayed in `VLVA_CFG.T_STEP1`. The value is displayed in ms. The accuracy of `VLVA_CFG.T_STEP1` is checked using an astronomical clock.

### 5 Impact of PLC time counter overflow on step time

| No.  | Action to check                                              | Expected result                                              | Notes |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1    | Monitor changes in the PLCCFG.TQMS and VLVA_CFG.T_STEP1 variables, check accuracy using an astronomical clock | PLCCFG.TQMS and VLVA_CFG.T_STEP1 count time in milliseconds  |       |
| 2    | Write the value 16#FFFF_FFFF - 5000 (5000 ms before the end of the range) into PLCCFG.TQMS and 16#7FFF_FFFF - 10000 (10000 ms before the end of the range) into VLVA_CFG.T_STEP1 | For some time (5000 ms), the time will count normally, but when PLCCFG.TQMS reaches the maximum value (16#FFFF_FFFF), it will start counting from zero, while VLVA_CFG.T_STEP1 will continue to count normally until it reaches the maximum value of its range (16#7FFFFFFF) and will then stop counting |       |
| 3    | Send the open command VLVA_CFG.CMD.OPN                       | VLVA_CFG.T_STEP1 will start counting time from zero          |       |

### 6 Actuator mode control

| No.  | Action to check                                              | Expected result                                              | Notes |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1    | Send a write-to-buffer command for any variable VLVA_HMI.CMD := 16#0100 | ACTBUF.ID will take the value of VLVA_CFG.ID, ACTBUF.CLSID will take the value of VLVA_CFG.CLSID, status bits, alarm bits, and parameter bits of ACTBUF will take the values of the corresponding bits of VLVA_CFG, and other parameters of VLVA_CFG will be written into the corresponding parameters of ACTBUF |       |
| 2    | Send a command to switch the actuator to manual mode VLVA_HMI.CMD := 16#0301 | The bit VLVA_HMI.STA.X9, VLVA_CFG.STA.DISP, and ACTBUF.STA.DISP will take the value 1 |       |
| 3    | Send a command to switch the actuator to automatic mode VLVA_HMI.CMD := 16#0302 | The bit VLVA_HMI.STA.X9, VLVA_CFG.STA.DISP, and ACTBUF.STA.DISP will take the value 0 |       |
| 4    | Send a command to toggle the actuator mode VLVA_HMI.CMD := 16#0300 | The bit VLVA_HMI.STA.X9, VLVA_CFG.STA.DISP, and ACTBUF.STA.DISP will toggle their value |       |
| 5    | Send a command to switch the actuator to manual mode VLVA_CFG.CMD.MAN | The bit VLVA_HMI.STA.X9, VLVA_CFG.STA.DISP, and ACTBUF.STA.DISP will take the value 1 |       |
| 6    | Send a command to switch the actuator to automatic mode VLVA_CFG.CMD.AUTO | The bit VLVA_HMI.STA.X9, VLVA_CFG.STA.DISP, and ACTBUF.STA.DISP will take the value 0 |       |
| 7    | Send a command to switch the actuator to manual mode ACTBUF.CMDHMI := 16#0301 | The bit VLVA_HMI.STA.X9, VLVA_CFG.STA.DISP, and ACTBUF.STA.DISP will take the value 1 |       |
| 8    | Send a command to switch the actuator to automatic mode ACTBUF.CMDHMI := 16#0302 | The bit VLVA_HMI.STA.X9, VLVA_CFG.STA.DISP, and ACTBUF.STA.DISP will take the value 0 |       |
| 9    | Send a command to toggle the actuator mode ACTBUF.CMDHMI := 16#0300 | The bit VLVA_HMI.STA.X9, VLVA_CFG.STA.DISP, and ACTBUF.STA.DISP will toggle their value |       |
| 10   | Switch all actuators to automatic mode                       | The bit indicating that at least one actuator is in manual mode PLCCFG.STA_PERM.X9 should be 0, and the number of actuators in manual mode PLCCFG.CNTMAN_PERM should also be 0 |       |
| 11   | Switch several actuators to manual mode                      | The bit indicating that at least one actuator is in manual mode PLCCFG.STA_PERM.X9 should be 1, and the number of actuators in manual mode PLCCFG.CNTMAN_PERM should equal the number of actuators switched to manual mode |       |

### 7 Actuator control

| No.  | Action to check                                              | Expected result                                              | Notes |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1    | Send a command to switch the actuator to automatic mode VLVA_CFG.CMD.AUTO | The bits VLVA_HMI.STA.X9 and VLVA_CFG.STA.DISP will take the value 0 |       |
| 2    | Change the actuator setpoint in automatic mode VLVA_CFG.CPOS | The technology variable CPOS.VAL corresponding to the actuator output will take the value set in VLVA_CFG.CPOS, and VLVA_HMI.CPOS will take the value of VLVA_CFG.CPOS |       |
| 3    | Send a command to switch the actuator to manual mode VLVA_CFG.CMD.MAN | The bits VLVA_HMI.STA.X9 and VLVA_CFG.STA.DISP will take the value 1 |       |
| 4    | Change the actuator setpoint in manual mode VLVA_HMI.CPOS    | The technology variable CPOS.VAL corresponding to the actuator output will take the value set in VLVA_HMI.CPOS, and VLVA_CFG.CPOS will take the value of VLVA_HMI.CPOS |       |
| 5    | Send a write-to-buffer command VLVA_CFG.CMD.BUFLOAD          | ACTBUF.ID will take the value of VLVA_CFG.ID, ACTBUF.CLSID will take the value of VLVA_CFG.CLSID, status bits, alarm bits, and parameter bits of ACTBUF will take the values of the corresponding bits of VLVA_CFG, and other parameters of VLVA_CFG will be written into the corresponding parameters of ACTBUF |       |
| 6    | Change the actuator setpoint in manual mode via buffer ACTBUF.CPOS | The technology variable CPOS.VAL corresponding to the actuator output will take the value set in ACTBUF.CPOS, and VLVA_HMI.CPOS and VLVA_CFG.CPOS will take the value of ACTBUF.CPOS |       |

### 8 Automatic Actuator Configuration Algorithms

| No.  | Action to check                                              | Expected result                                              | Notes |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1    | Check the values of the parameters VLVA_CFG.PRM.PRM_MANCFG, VLVA_CFG.PRM.PRM_ZPOSENBL | Manual configuration parameter is disabled: VLVA_CFG.PRM.PRM_MANCFG = 0, analog feedback parameter for frequency/position is enabled: VLVA_CFG.PRM.PRM_ZPOSENBL = 1 |       |
| 2    | Set the manual configuration bit to 1 VLVA_CFG.PRM.PRM_MANCFG := 1  set the feedback disable bit to 0 VLVA_CFG.PRM.PRM_ZPOSENBL := 0 | The manual configuration parameter will remain disabled: VLVA_CFG.PRM.PRM_MANCFG = 0, the analog feedback parameter for frequency/position will remain enabled: VLVA_CFG.PRM.PRM_ZPOSENBL = 1 since this option is disabled and only automatic configuration is used. |       |
| 3    | Change the value of the process variable corresponding to the actuator’s analog feedback | The corresponding value should be reflected in VLVA_CFG.POS and VLVA_HMI.POS (converted to the 0-10000 range) |       |
| 4    | For the process variable corresponding to the analog feedback, activate the "variable disabled" parameter AIVAR_CFG.PRM.DSBL | The bit indicating the variable’s activity will change to 0: AIVAR_CFG.STA.ENBL = 0, the analog feedback parameter for frequency/position will change to 0: VLVA_CFG.PRM.PRM_ZPOSENBL = 0 VLVA_CFG.POS and VLVA_HMI.POS (converted to the 0-10000 range) will take the value stored in VLVA_CFG.CPOS |       |
| 5    | Change the actuator’s setpoint in automatic mode VLVA_CFG.CPOS | VLVA_CFG.POS and VLVA_HMI.POS (converted to the 0-10000 range) will take the value stored in VLVA_CFG.CPOS |       |

