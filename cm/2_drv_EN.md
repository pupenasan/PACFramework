# Class DRV: Motors

CLSID=16#204x

## General Description

The class implements processing functions for actuators of the motor type with discrete and analog control. Start and stop are performed using discrete outputs, while speed or frequency control is performed using analog outputs. These functions include switching actuator operating modes, actuator control, configuration and alarm handling, simulation control, propagation of states to and from subordinate process variables, and more.

The class functions are designed for:

- motors with discrete control (CLSID=16#2040): one discrete output variable per motor “start”;
- motors with discrete and analog control (CLSID=16#2041): one discrete output variable per motor “start” and one analog output variable for the speed or frequency setpoint.

The mode is determined automatically by the presence of index 0 or a disable parameter in the analog output variable.

Regardless of the class, motors can operate with a discrete running signal sensor and an analog speed or frequency feedback sensor. The presence of specific sensors is determined automatically by the presence of index 0 or a disable parameter in the process variable.

## General Requirements for DRV Functions

### Functional Requirements

Sensors and actuator control signals are provided as DIVAR, AIVAR, DOVAR, and AOVAR variables; those not used are provided as empty (index 0). The presence/absence of specific sensors and control signals is indicated by parameters.

The class functions are designed for:

- motors with discrete control (CLSID=16#2040): one discrete output variable per motor “start”;
- motors with discrete and analog control (CLSID=16#2041): one discrete output variable per motor “start” and one analog output variable for the speed or frequency setpoint.

#### Operating Modes

The actuator control modes include:

- Manual – control is performed by the operator via SCADA/HMI;
- Automatic – control is performed according to the control system program algorithms;
- Local – control is performed by the operator using on-site buttons and switches.

In automatic and unblocked modes, the actuator output values are changed by the algorithm only when corresponding program commands are present. In manual or blocked modes, outputs are changed only by HMI commands (this may vary depending on process requirements). In automatic mode, the speed or frequency setpoint for the actuator changes according to the control program. In manual mode, the setpoint changes only according to the HMI value.

#### Actuator Configuration

Two configuration modes are provided (MANCFG):

- Manual
- Automatic

In manual mode, the motor type and sensor presence are defined by the following bit parameters:

- PRM_ALMENBL – external input, drive alarm signal;
- PRM_ZWRKENBL – external input, running feedback;
- PRM_ZPOSENBL – analog speed/position feedback;
- PRM_PWRENBL – external input, power status signal;
- PRM_BTNSTPENBL – external input, STOP button pressed;
- PRM_SELLCLENBL – external input, local control activation signal.

In automatic mode, these parameters change automatically when variables with ID=0 are linked or connected.

For example, if the feedback sensor fails, it can be temporarily disabled in the configuration (taken out of service to disable alarm generation), and the motor will automatically switch to operating without that sensor.

Manual motor type configuration has not found practical application yet.

#### Alarm Handling

For DRV-type actuators, the following alarm types are monitored:

- ALMSTRT – Failed to start (resets on command or state change);
- ALMSTP – Failed to stop (resets on command or state change);
- ALMSHFT – State violation;
- ALMINVRTR – Frequency converter fault;
- ALMPWR1 – Contactor power missing;
- ALM – Actuator fault, triggered by any actuator alarm;
- WRN – Actuator warning, triggered by any actuator warning (currently no warnings implemented).

#### Statistical Information Handling

For DRV-type actuators, the following statistics are monitored:

- number of switching operations;
- number of alarms;
- total operating time;
- operating time since last start.

Statistical information is reset upon receiving the corresponding commands.

## Recommendations for HMI Use

An example of motor function configuration on HMI is shown below.

![img](media%5C2_15.png)

Figure: Example of motor function configuration on HMI.

## General Requirements for Class Variable Structure

#### DRV_HMI

Here and below, `adr` indicates the offset in the structure in 16-bit words.

| name | type | adr  | bit  | descr                                         |
| ---- | ---- | ---- | ---- | --------------------------------------------- |
| STA  | UINT | 0    |      | state bits                                    |
| CMD  | UINT | 1    |      | control command                               |
| ALM  | Int  | 2    |      | alarm bits                                    |
| SPD  | Int  | 3    |      | actuator speed/frequency (0-10000) - feedback |
| CSPD | REAL | 4    |      | actuator speed/frequency (0-100%) - setpoint  |

#### DRV_CFG

| name         | type      | adr  | bit  | description                                                  |
| ------------ | --------- | ---- | ---- | ------------------------------------------------------------ |
| ID           | UINT      | 0    |      | unique actuator identifier                                   |
| CLSID        | UINT      | 1    |      | actuator class identifier                                    |
| STA          | UINT      | 2    |      | state bits, can be used as DRV_STA structure                 |
| STA_b0       | BOOL      | 2    | 0    | reverse                                                      |
| STA_b1       | BOOL      | 2    | 1    | reverse                                                      |
| STA_MAINT    | BOOL      | 2    | 2    | =1 taken out of service                                      |
| STA_STOPING  | BOOL      | 2    | 3    | =1 stopping                                                  |
| STA_STRTING  | BOOL      | 2    | 4    | =1 starting                                                  |
| STA_STOPED   | BOOL      | 2    | 5    | =1 stopped                                                   |
| STA_ISANALOG | BOOL      | 2    | 6    | =1 analog control present (for display convenience)          |
| STA_ISREVERS | BOOL      | 2    | 7    | =1 reverse start                                             |
| STA_WRKED    | BOOL      | 2    | 8    | =1 running                                                   |
| STA_DISP     | BOOL      | 2    | 9    | =1 remote mode (from PC/HMI) (16#0200)                       |
| STA_MANBX    | BOOL      | 2    | 10   | =1 manual from local panel (via feedback)                    |
| STA_INIOTBUF | BOOL      | 2    | 11   | =1 variable in IOT buffer                                    |
| STA_INBUF    | BOOL      | 2    | 12   | =1 variable in buffer                                        |
| STA_FRC      | BOOL      | 2    | 13   | =1 at least one variable in the object is forced (for testing convenience) |
| STA_SML      | BOOL      | 2    | 14   | =1 simulation mode                                           |
| STA_BLCK     | BOOL      | 2    | 15   | =1 blocked                                                   |
| ALM          | UINT      | 3    |      | alarm bits, can be used as DRV_ALM structure                 |
| ALMSTRT      | BOOL      | 3    | 0    | =1 failed to start (resets on command or sensor state change) |
| ALMSTP       | BOOL      | 3    | 1    | =1 failed to stop (resets on command or sensor state change) |
| ALMSHFT      | BOOL      | 3    | 2    | =1 state violation                                           |
| ALMINVRTR    | BOOL      | 3    | 3    | =1 frequency converter fault                                 |
| ALMPWR1      | BOOL      | 3    | 4    | =1 contactor power missing                                   |
| ALM_b5       | BOOL      | 3    | 5    | reserved                                                     |
| ALM          | BOOL      | 3    | 6    | =1 actuator fault (OR-based)                                 |
| WRN          | BOOL      | 3    | 7    | =1 actuator warning (OR-based)                               |
| ALMBELL      | BOOL      | 3    | 8    | =1 bell activation command (one PLC cycle)                   |
| ALM_b9       | BOOL      | 3    | 9    | reserved                                                     |
| ALM_b10      | BOOL      | 3    | 10   | reserved                                                     |
| ALM_b11      | BOOL      | 3    | 11   | reserved                                                     |
| ALM_b12      | BOOL      | 3    | 12   | reserved                                                     |
| ALM_b13      | BOOL      | 3    | 13   | reserved                                                     |
| ALM_b14      | BOOL      | 3    | 14   | reserved                                                     |
| ALM_b15      | BOOL      | 3    | 15   | reserved                                                     |
| CMD          | ACTTR_CMD | 4    |      | command bits                                                 |
| PRM          | ACTTR_PRM | 6    |      | parameter bits                                               |
| SPD          | REAL      | 8    |      | actuator speed/frequency (0-100%) - feedback                 |
| CSPD         | REAL      | 10   |      | actuator speed/frequency (0-100%) - setpoint                 |
| T_DEASP      | UINT      | 12   |      | alarm delay time in 0.1 seconds                              |
| STEP1        | UINT      | 13   |      | step number                                                  |
| CNTPER       | UINT      | 14   |      | position change count                                        |
| CNTALM       | UINT      | 15   |      | alarm count                                                  |
| T_STEP1      | UDINT     | 16   |      | elapsed step time in ms                                      |
| T_PREV       | UDINT     | 18   |      | time in ms since previous call, taken from PLC_CFG.TQMS      |
| TQ_TOTAL     | UDINT     | 20   |      | total operating time in minutes                              |
| TQ_LAST      | UDINT     | 22   |      | operating time since last start in seconds                   |

#### Commands

| Attribute | Type | Bit  | Description                                                  |
| --------- | ---- | ---- | ------------------------------------------------------------ |
| CMD       | UINT |      | Commands:16#0001: open16#0002: close16#0003: toggle16#0004: acknowledge alarm16#0005: reset alarms16#0006: block16#0007: unblock16#0008: stop autotuning16#0009: start autotuning16#000A: enable protection algorithm16#000B: control permission16#000C: control permission with system pressure present16#000D: start speed sensor calibration E..10 - free16#0011: start16#0012: stop16#0013: enable reverse14-20 - free16#0021: increase16#0022: decrease23-9F - free16#0100: read configuration16#0101: write configuration102-2FF - free16#0300: toggle manual/auto16#0301: enable manual mode16#0302: enable auto mode16#0313: enable local mode16#0314: disable local mode16#0315: take out of service16#0316: put into service316..400 - free16#0401: reset alarm counter 16#0402: reset operation/movement counter 16#0403: reset operation/movement counter 16#0404: reset operation/movement counter |

## Working with the Buffer

A classic buffer handling function must be implemented.

- It is recommended to use a single buffer for all actuator types.
- Buffer occupancy is checked by matching the class identifier `CLSID` and actuator identifier `ID`.
- When the buffer is captured:
  - `ACTBUF.STA = ACTTR_CFG.STA`
  - `ACTTR_CFG.CMD = ACTBUF.CMD` if it is not zero (to allow commands from another source)
- Actuator configuration should be read into the buffer upon receiving commands:
  - updating the process variable already recorded in the buffer with `ACTTR_HMI.CMD = 16#0100;`
- Actuator configuration should be written from the buffer upon receiving commands:
  - `ACTBUF.CMD = 16#0101;`

A function for working with parameter-based bidirectional buffers ACTBUFIN <-> ACTBUFOUT must also be implemented.

- Two buffers are used:
  - input buffer `ACTBUFIN` for processing commands (when `CLSID` and `ID` match) and writing data to the actuator
  - output buffer `ACTBUFOUT` for reading data from the actuator upon receiving a read command in `ACTBUFIN`
- It is recommended to use a single pair of buffers for all actuators.
- Buffer occupancy cannot occur since the buffer is implemented using two buffer variables, ACTBUFIN and ACTBUFOUT, through which information passes for further transmission to the actuator or to the internal buffer of the HMI (similar to parameter exchange PKW in the PROFIDRIVE profile).
- Actuator configuration should be read into the output buffer when:
  - class identifiers match `ACTTR_CFG.CLSID = ACTBUFIN.CLSID`, actuator identifiers match `ACTCFG.ID = ACTBUFIN.ID`, and a command is received in the input buffer `ACTBUFIN.CMD = 16#100`
- Actuator configuration should be written from the input buffer when:
  - class identifiers match `ACTTR_CFG.CLSID = ACTBUFIN.CLSID`, actuator identifiers match `ACTTR_CFG.ID = ACTBUFIN.ID`, and a command is received in the input buffer `ACTBUFIN.CMD = 16#101`

## Interface Implementation Requirements

The interface must include the following parameters:

- DRVCFG - INOUT
- DRVHMI - INOUT
- actuator sensor process variables (limit switches, local buttons, etc.) - INOUT
- actuator output process variables (solenoids, starters, etc.) - INOUT

If it is not possible to access external variables from within functions, pass `PLC_CFG`, `ACTBUF`, `ACTBUFIN`, `ACTBUFOUT`; alternatively, other interfaces within `PLC_CFG` may be used.

## Actuator Initialization on First Cycle

Default `ID` and `CLSID` writing is performed in the `initvars` program section.

For each process variable in `initvars`, include the following fragment to write the `ID` and `CLSID`:

```pascal
"ACT".DRV.ID := 30001;   
"ACT".DRV.CLSID := 16#2040;
```

Initialization is also performed within the actuator processing function, resulting in:

- if the alarm delay time is not set, it assigns `DRV.T_DEASP := 200;`
- process alarms for sensors are not used, for example: `RUN.PRM.ISALM := false; RUN.PRM.ISWRN := false;`

## User Program Implementation Requirements

- Actuator processing functions must be called with every invocation of the task to which they are linked.
- On the first startup (`PLC_CFG.SCN1`), actuator IDs and class IDs must be initialized.

The implementation of the actuator processing function program consists of the following stages:

#### `DRV_to_ACT`

Reading information from a variable corresponding to the actuator type into a variable of the universal actuator type – this is done for convenience and to unify further processing, performed by the `DRV_to_ACT` function.

The interface must include the following parameters:

- DRVCFG - INOUT - actuator configuration variable
- DRVHMI - INOUT - actuator HMI variable
- ACTCFG - INOUT - universal actuator type, used internally for unified processing

If it is not possible to access external variables from within the functions, pass `PLC_CFG`, `ACTBUF`, `ACTBUFIN`, `ACTBUFOUT`; alternatively, other interfaces within `PLC_CFG` may be used.

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

#### `ACT_PRE`

Preprocessing of the actuator: initialization of STA, ALM, CMD, handling INBUF, SML, and calculating dt – performed by the `ACT_PRE` function.

The interface must include the following parameters:

- ACTCFG - INOUT - universal actuator type, used internally for unified processing
- STA - INOUT - status set type of the universal actuator, used internally for unified processing
- ALMs - INOUT - alarm set type of the universal actuator, used internally for unified processing
- CMD - INOUT - command set type of the universal actuator, used internally for unified processing
- dt - INOUT - time difference between actuator function calls

If it is not possible to access external variables from within the functions, pass `PLC_CFG`, `ACTBUF`, `ACTBUFIN`, `ACTBUFOUT`; alternatively, other interfaces within `PLC_CFG` may be used.

```pascal
(*initial processing for all actuators: initialization, assignment to internal STA, ALM; determination of INBUF, SML, #dt *)
(*first scan*)
IF "SYS".PLCCFG.STA.SCN1 THEN
    (*reset bits in the STA structure*)
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
    (*reset bits in the ALM structure*)
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
#ALMs.ALMBELL := FALSE; (*the buzzer is turned off after one cycle*)
#STA.INBUF := (#ACTCFG.ID = "BUF".ACTBUF.ID AND "BUF".ACTBUF.ID <> 0 AND #ACTCFG.CLSID = "BUF".ACTBUF.CLSID); (*is in the configuration buffer*)
#STA.SML := "SYS".PLCCFG.STA.SMLALL; (*simulation mode*)
#dt := "SYS".PLCCFG.TQMS - #ACTCFG.T_PREV; (*time difference between calls in ms*)
IF #dt < 1 THEN #dt := 1; END_IF;
```

#### `ACT_CMDCTRL`

Command processing is executed by the standard command handler for all actuators, implemented as the `ACT_CMDCTRL` function.

The following parameters must be passed to the interface:

- ACTCFG - INOUT - the universal actuator type, used internally for unified processing
- STA - INOUT - the universal actuator status set type, used internally for unified processing
- CMD - INOUT - the universal actuator command set type, used internally for unified processing

If there is no possibility to access external variables from within the functions, `PLC_CFG`, `ACTBUF`, `ACTBUFIN`, `ACTBUFOUT` are passed; alternatively, other interfaces within `PLC_CFG` may be used internally.

```pascal
(* the block processes commands from HMI and IOT, generates CMD based on them, 
   updates status bits, and resets automatic control commands in manual mode *)

(* selection of HMI configuration/control command source according to priority if commands arrive simultaneously *)
IF #ACTCFG.CMDHMI > 16#80 THEN (* configuration command from HMI *)
    #CMDINT := #ACTCFG.CMDHMI;
ELSIF #STA.INBUF AND "BUF".ACTBUF.CMDHMI > 16#80 THEN (* configuration command from buffer *)
    #CMDINT := "BUF".ACTBUF.CMDHMI;
ELSIF #ACTCFG.CMDHMI < 16#80 AND #ACTCFG.CMDHMI > 0 AND #STA.DISP THEN (* manual mode control from HMI element *)
    #CMDINT := #ACTCFG.CMDHMI;
ELSIF #STA.INBUF AND "BUF".ACTBUF.CMDHMI < 16#80 AND "BUF".ACTBUF.CMDHMI > 0 AND #STA.DISP THEN (* manual mode control from buffer *)
    #CMDINT := "BUF".ACTBUF.CMDHMI; (* take command from here, otherwise ignore *)
ELSE
    #CMDINT := 0;
END_IF;

(* in manual mode all automatic control commands are reset *)
IF #STA.DISP THEN
    #CMD.OPN:=FALSE;
    #CMD.CLS:=FALSE;
    #CMD.TOGGLE:=false;
    #CMD.START:=false;
    #CMD.STOP:=false;
    #CMD.REVERS:=false;
    #CMD.TOGGLE:=FALSE;
END_IF;

(*operator control commands
16#0001 - CMD_OPN
16#0002 - CMD_CLS
16#0004 - CMD_ALMRST
16#0008 - CMD_DBLK
16#0010 - CMD_STOP
*)

(* HMI commands *)
CASE #CMDINT OF
    16#0001: (* Open *)
        #CMD.OPN := TRUE;
        #CMD.CLS := FALSE;
    16#0002: (* Close *)
        #CMD.CLS := TRUE;
        #CMD.OPN := FALSE;
    16#0003: (* Toggle *)
        #CMD.TOGGLE := TRUE;
    16#0004: (* Acknowledge alarm *)
        #CMD.ALMACK := TRUE;
    16#0005: (* Reset alarms *)
        #CMD.ALMRESET := TRUE;
    16#0006: (* Block *)
        #CMD.BLCK := TRUE;
    16#0007: (* Unblock *)
        #CMD.DBLCK := TRUE;
    16#0008: (* Stop tuning *)
        #CMD.STOPTUN := TRUE;
    16#0009: (* Start tuning *)
        #CMD.TUNING := TRUE;
    16#000A: (* Enable protection algorithm *)
        #CMD.PROTECT := TRUE;
    16#000B: (* Enable control for one cycle *)
        #CMD.RESOLUTION := TRUE;
    16#000C: (* Enable control based on system pressure *)
        #CMD.P_RESOLUTION := TRUE;
    16#000D: (* Toggle actuator lock/unlock *)
        #CMD.DBLCKACTTOGGLE := TRUE;
        #STA.DBLCKACT := NOT #STA.DBLCKACT;
    (* E..10 - reserved *)
    16#0011: (* Start *)
        #CMD.START := TRUE;
        #CMD.STOP := FALSE;
    16#0012: (* Stop *)
        #CMD.STOP := TRUE;
        #CMD.START := FALSE;
    16#0013: (* Enable reverse *)
        #CMD.REVERS := TRUE;
    (* 14-20 - reserved *)
    16#0021: (* Increase *)
        #CMD.UP := TRUE;
    16#0022: (* Decrease *)
        #CMD.DWN := TRUE;
    (* 23-9F - reserved *)
    (* starting from 16#0080 for buffer operations and mode control *)
    16#0100: (* Read configuration *)
        #CMD.BUFLOAD := TRUE;
        "BUF".ACTBUF := #ACTCFG;
    16#0101: (* Write configuration *)
        #ACTCFG.PRM := "BUF".ACTBUF.PRM;
        #ACTCFG.T_DEASP := "BUF".ACTBUF.T_DEASP;
        #ACTCFG.T_OPNSP := "BUF".ACTBUF.T_OPNSP;
        #ACTCFG.STOP_DELAY := "BUF".ACTBUF.STOP_DELAY;
    (* 102-2FF - reserved *)
    16#0300: (* Toggle manual/automatic mode *)
        #STA.DISP := NOT #STA.DISP;
    16#0301: (* Manual mode *)
        #STA.DISP := TRUE;
    16#0302: (* Automatic mode *)
        #STA.DISP := FALSE;
    16#0313: (* Enable local mode *)
        #STA.MANBXOUT := TRUE;
        #STA.MANBX := TRUE;
        #STA.DISP := TRUE;
    16#0314: (* Disable local mode *)
        #STA.MANBXOUT := FALSE;
        #STA.MANBX := FALSE;
    16#0315: (* Take out of service *)
        #CMD.OUTSRVC := TRUE;
    16#0316: (* Put into service *)
        #CMD.INSRVC := TRUE;
    (* Statistic control *)
    16#0401: (* Reset alarm counter *)
        #ACTCFG.CNTALM := 0;
    16#0402: (* Reset operation counter *)
        #ACTCFG.CNTPER := 0;
    16#0403: (* Reset total runtime *)
        #ACTCFG.TQ_TOTAL := 0;
    16#0404: (* Reset runtime since last start *)
        #ACTCFG.TQ_LAST := 0;
END_CASE;

(* Pass-through handling of block/unblock commands from buffer and HMI *)
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

#### `DRVFN`

direct actuator (VM) processing inside the `DRVFN` function

```pascal
"DRV_to_ACT"(DRVCFG:=#ACTCFG, DRVHMI:=#ACTHMI, ACTCFG:=#ACTCFGu);

(* pre-processing: init STA, ALM, CMD, INBUF, SML, dt *)
"ACT_PRE"(ACTCFG := #ACTCFGu, STA := #STA, ALMs := #ALMs, CMD := #CMD, dt := #dT);

(* default values *)
IF "SYS".PLCCFG.STA.SCN1 THEN (* first scan *)
    IF #ACTCFGu.T_OPNSP <= 0 THEN (* if the open time setpoint is not set *)
        #ACTCFGu.T_OPNSP := 500; (* 5 seconds *)
    END_IF;
    IF #ACTCFGu.T_DEASP <= 0 THEN (* if the alarm delay setpoint is not set *)
        #ACTCFGu.T_DEASP := 200; (* 2 seconds *)
    END_IF;
    (* technological alarms for sensors are not used *)
    IF #RUN.ID <> 0 THEN
        #RUN.PRM.ISALM := FALSE; (* ISALM *)
        #RUN.PRM.ISWRN := FALSE; (* ISWRN *)
    END_IF;
END_IF;

(* --------------------- parameter block *)
(* parameters: checking the presence/use of sensors on input *)
#ACTCFGu.PRM.PRM_MANCFG     := FALSE; (* manual IO parameter configuration is not used in this project *)
#ACTCFGu.PRM.PRM_ALMENBL    := NOT #ALM.PRM.DSBL AND #ALM.ID <> 0;
#ACTCFGu.PRM.PRM_ZWRKENBL   := NOT #RUN.PRM.DSBL AND #RUN.ID <> 0;
#ACTCFGu.PRM.PRM_ZPOSENBL   := NOT #SPD.PRM.DSBL AND #SPD.ID <> 0;
#ACTCFGu.PRM.PRM_PWRENBL    := NOT #RDY.PRM.DSBL AND #RDY.ID <> 0;
#ACTCFGu.PRM.PRM_BTNSTPENBL := NOT #LSTP.PRM.DSBL AND #LSTP.ID <> 0;
#ACTCFGu.PRM.PRM_SELLCLENBL := NOT #RMT.PRM.DSBL AND #RMT.ID <> 0;

(* ------------------- simulation mode block *)
(* simulation mode for subordinates from master *)
#LSTP.STA.SML := #STA.SML;
#RUN.STA.SML := #STA.SML;
#RDY.STA.SML := #STA.SML;
#ALM.STA.SML := #STA.SML;
#RMT.STA.SML := #STA.SML;
#CSTRT.STA.SML := #STA.SML;
#SPD.STA.SML := #STA.SML;
#CSPD.STA.SML := #STA.SML;

(* simulation mode logic *)
IF #STA.SML THEN
    (* sensor simulation *)
    IF NOT #SPD.STA.FRC THEN
        #SPD.VAL := #CSPD.VAL;
    END_IF;
    IF NOT #RUN.STA.FRC THEN
        #RUN.STA.VALB := #ACTCFGu.STEP1 = 2 OR #ACTCFGu.STEP1 = 4;
    END_IF;
    IF NOT #RDY.STA.FRC THEN
        #RDY.STA.VALB := TRUE; (* power is present *)
    END_IF;
    IF NOT #ALM.STA.FRC THEN
        #ALM.STA.VALB := FALSE; (* no alarm *)
    END_IF;
END_IF;


(* -------------------- command processing block
// standard command handler *)
"ACT_CMDCTRL"(ACTCFG := #ACTCFGu, STA := #STA, CMD := #CMD);

(* switch to manual mode when local manual is activated and block all commands *)
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

(* ------------------- block for processing RUN/READY/ALM/feedback signals, or replacing them with logic *)
IF NOT #ACTCFGu.PRM.PRM_ZWRKENBL THEN
    #SRUN1 := (#ACTCFGu.STEP1 = 2) OR (#ACTCFGu.STEP1 = 4);
ELSE
    #SRUN1 := #RUN.STA.VALB;
END_IF;
IF NOT #ACTCFGu.PRM.PRM_PWRENBL THEN
    #SPWR1 := TRUE;
ELSE
    #SPWR1 := #RDY.STA.VALB;
END_IF;
IF NOT #ACTCFGu.PRM.PRM_ALMENBL THEN
    #SALM1 := FALSE;
ELSE
    #SALM1 := #ALM.STA.VALB;
END_IF;
IF NOT #ACTCFGu.PRM.PRM_ZPOSENBL THEN       (* IF NO ANALOG FEEDBACK SIGNAL *)
    #SPOS1 := #CSPD.VAL;                    (* THEN POSITION IS SET TO COMMAND VALUE *)
ELSE
    #SPOS1 := #SPD.VAL;                     (* OTHERWISE TAKE VALUE FROM FEEDBACK SENSOR *)
END_IF;

(*----------------- position state and position alarm state machine  *)

CASE #ACTCFGu.STEP1 OF
    0: (*initialization*)
        #ACTCFGu.STEP1 := 1;
        #ACTCFGu.T_STEP1 := 0;

    1, 4, 5: (*final states, 1 - undefined, 4 - running, 5 - stopped*)
        IF ((#ACTCFGu.STEP1 = 4 AND NOT #SRUN1) OR (#ACTCFGu.STEP1 = 5 AND #SRUN1)) AND NOT #STA.MANBX THEN
            #ALMs.ALMSHFT := TRUE;
        ELSE
            #ALMs.ALMSHFT := FALSE;
        END_IF;

        IF #SRUN1 AND NOT #ALMs.ALMSHFT THEN
            #ACTCFGu.STEP1 := 4;
            #CSTRT.STA.VALB := TRUE;
        END_IF;

        IF NOT #SRUN1 AND NOT #ALMs.ALMSHFT THEN
            #ACTCFGu.STEP1 := 5;
            #CSTRT.STA.VALB := FALSE;
            #STA.ISREVERS := FALSE;
        END_IF;

    2: (*starting*)
        #CSTRT.STA.VALB := TRUE;
        IF #SRUN1 THEN
            #ACTCFGu.STEP1 := 4; (*transition to running state*)
            #ACTCFGu.T_STEP1 := 0;
        END_IF;

        #ALMs.ALMSTRT := FALSE;
        #ALMs.ALMSTP := FALSE;

        IF #ACTCFGu.T_STEP1 >= (UINT_TO_UDINT(#ACTCFGu.T_DEASP) * 100) THEN
            #ALMs.ALMSTRT := TRUE;
            #ALMs.ALMSTP := FALSE;
            #ACTCFGu.STEP1 := 6; (*transition to blocked state*)
            #ACTCFGu.T_STEP1 := 0;
        END_IF;

    3: (*stopping*)
        #CSTRT.STA.VALB := FALSE;
        IF NOT #SRUN1 THEN
            #STA.ISREVERS := FALSE;
            #ACTCFGu.STEP1 := 5;
            #ACTCFGu.T_STEP1 := 0;
        END_IF;

        #ALMs.ALMCLS := FALSE;
        #ALMs.ALMOPN := FALSE;

        IF #ACTCFGu.T_STEP1 >= (UINT_TO_UDINT(#ACTCFGu.T_DEASP) * 100) THEN
            #ALMs.ALMSTP := TRUE;
            #ALMs.ALMSTRT := FALSE;
            #ACTCFGu.STEP1 := 6; (*transition to blocked state*)
            #ACTCFGu.T_STEP1 := 0;
        END_IF;

    6: (*blocked*)
        #CSTRT.STA.VALB := FALSE;
        #STA.ISREVERS := FALSE;
        IF #CMD.DBLCK THEN
            #ACTCFGu.STEP1 := 5; (*transition to stopped state*)
            #ACTCFGu.T_STEP1 := 0;
            #ALMs.ALMSTRT := FALSE;
            #ALMs.ALMSTP := FALSE;
            #ALMs.ALMINVRTR := FALSE;
            #ALMs.ALMPWR1 := FALSE;
            #ALMs.ALMSHFT := FALSE;
        END_IF;

    ELSE (*undefined*)
        #ACTCFGu.STEP1 := 0;
END_CASE;


#STA.ISANALOG:=#CSPD.ID<>0;
#STA.STOPING :=#ACTCFGu.STEP1 = 3;
#STA.STRTING :=#ACTCFGu.STEP1 = 2;
#STA.STOPED  :=#ACTCFGu.STEP1 = 5 OR #ACTCFGu.STEP1 = 6;
#STA.WRKED   :=#ACTCFGu.STEP1 = 4;
#STA.BLCK    :=#ACTCFGu.STEP1 = 6 AND NOT #STA.MAINT;


(*----------------------------- actuator control *)
IF #CMD.STOP THEN
    #CSTRT.STA.VALB := FALSE;
END_IF;

IF #CMD.REVERS THEN
    #CMD.START := TRUE;
    #CMD.STOP := FALSE;
    #STA.ISREVERS := TRUE;
END_IF;

(* start/stop control only if control permission or temporary unlock is active *)
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
    #CSTRT.STA.VALB := FALSE;
END_IF;

IF #CMD.BLCK THEN (* on block command, set to the required blocked state *)
    #ACTCFGu.STEP1 := 6;
    #ACTCFGu.T_STEP1 := 0;
END_IF;

IF #CMD.OUTSRVC THEN (* on out of service command, move to blocked state and set maintenance bit *)
    #STA.MAINT := TRUE;
    #ACTCFGu.STEP1 := 6;
    #ACTCFGu.T_STEP1 := 0;
END_IF;

IF #CMD.INSRVC THEN (* on in service command, move to stopped state and clear maintenance bit *)
    #STA.MAINT := FALSE;
    #ACTCFGu.STEP1 := 5;
    #ACTCFGu.T_STEP1 := 0;
END_IF;


(*-------------------- modes *)

#STA.FRC := #LSTP.STA.FRC AND #LSTP.ID <> 0
OR #RUN.STA.FRC AND #RUN.ID <> 0
OR #RDY.STA.FRC AND #RDY.ID <> 0
OR #ALM.STA.FRC AND #ALM.ID <> 0
OR #RMT.STA.FRC AND #RMT.ID <> 0
OR #CSTRT.STA.FRC AND #CSTRT.ID <> 0
OR #SPD.STA.FRC AND #SPD.ID <> 0
OR #CSPD.STA.FRC AND #CSPD.ID <> 0;

IF #STA.MAINT THEN (* if out of service, alarms are not tracked *)
    #ALMs.ALMSTRT := FALSE;
    #ALMs.ALMSTP := FALSE;
    #ALMs.ALMINVRTR := FALSE;
    #ALMs.ALMPWR1 := FALSE;
    #ALMs.ALMSHFT := FALSE;
END_IF;

#ALMs.ALMPWR1 := NOT #SPWR1;
#ALMs.ALM := #ALMs.ALMSTRT OR #ALMs.ALMSTP OR #ALMs.ALMINVRTR OR #ALMs.ALMPWR1 OR #ALMs.ALMSHFT;

IF #ALMs.ALM THEN
    "SYS".PLCCFG.ALM1.ALM := TRUE;
    "SYS".PLCCFG.CNTALM := "SYS".PLCCFG.CNTALM + 1;
END_IF;

IF #ALMs.ALM AND NOT #STA.MANBX AND #ACTCFGu.STEP1 <> 6 THEN
    #ACTCFGu.STEP1 := 6;
    #ACTCFGu.T_STEP1 := 0;
END_IF;


(*------------------- summary of custom alarms, modes, and bits *)
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

(*final processing: aggregation into PLC.CFG, STA, ALM, CMD, INBUF, SML, dt *)
"ACT_POST" (ACTCFG := #ACTCFGu, STA := #STA, ALMs := #ALMs, CMD := #CMD, dt := #dT);

"ACT_to_DRV"(DRVCFG:=#ACTCFG, DRVHMI:=#ACTHMI, ACTCFG:=#ACTCFGu);

(*------------------- selecting the command source *)
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
#CSPD.VAL := #ACTCFGu.CPOS;

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

final actuator processing: aggregation into PLC.CFG, forming actuator STA and ALM, clearing CMD, calculating dt, etc., implemented via the `ACT_POST` function.

The following parameters must be passed into the interface:

- ACTCFG - INOUT - universal actuator type, used internally for unified processing
- STA - INOUT - universal actuator status set type, used internally for unified processing
- ALMs - INOUT - universal actuator alarm set type, used internally for unified processing
- CMD - INOUT - universal actuator command set type, used internally for unified processing
- dt - INOUT - time difference between actuator processing function calls

If it is not possible to access external variables from inside functions, `PLC_CFG`, `ACTBUF`, `ACTBUFIN`, and `ACTBUFOUT` are passed; alternatively, other interfaces can be used for operation within `PLC_CFG`.

```pascal
(* final actuator processing before the act_to_XXX function: updating general PLC status bits,
limiting alarm counters, writing to STA, ALM, updating the buffer *)

(* modes - in PLC *)
(* global bit indicating at least one in manual mode *)
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

(* clearing all HMI commands *)
#ACTCFG.CMDHMI := 0;

(* clearing all program commands *)

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


(* updating in the HMI buffer
// continuously pass to the buffer only those values that change constantly *)
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

#### `ACT_to_DRV`

transferring information from a universal actuator variable type to a variable corresponding to the actuator type – performed for convenience and unification of processing, executed by the `ACT_to_DRV` function;

The following parameters must be passed to the interface:

- DRVCFG - INOUT - actuator configuration variable
- DRVHMI - INOUT - actuator HMI variable
- ACTCFG - INOUT - universal actuator variable type, used internally for unification of processing

If it is not possible to access external variables from within functions, `PLC_CFG`, `ACTBUF`, `ACTBUFIN`, `ACTBUFOUT` are passed; alternatively, other interfaces within `PLC_CFG` can be used.

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

## Testing

Before starting the testing, you need to create 2-3 actuator variables, create calls to the actuator data processing functions with full wiring of inputs and outputs (feedback signals - discrete running signal and analog speed signal, as well as output signals - discrete start signal and analog set speed signal), and implement handling of process variables corresponding to the actuator's input and output signals.

### General Test List

| No.  | Test Name                                   | When to check               | Notes |
| ---- | ------------------------------------------- | --------------------------- | ----- |
| 1    | Assigning ID and CLSID on startup           | after implementing function |       |
| 2    | Default parameter initialization            | after implementing function |       |
| 3    | Reading to buffer and writing from buffer   | after implementing function |       |
| 4    | Operation of built-in time counters         | after implementing function |       |
| 5    | Effect of PLC timer overflow on step time   | after implementing function |       |
| 6    | Controlling actuator modes                  | after implementing function |       |
| 7    | Controlling the actuator                    | after implementing function |       |
| 8    | Actuator alarm processing                   | after implementing function |       |
| 9    | Automatic actuator configuration algorithms | after implementing function |       |
|      |                                             |                             |       |

### 1 Assigning ID and CLSID on startup

- Before starting the check, the PLC must be in STOP.
- After startup, all actuator variables used in the program should be assigned an ID and CLSID.

### 2 Default parameter initialization

- Before starting the check, the PLC must be in STOP.
- After startup, the alarm delay time DRV.T_DEASP for all actuators should be set to 200 (2 seconds).

### 3 Reading to Buffer and Writing from Buffer

| No.  | Action to Test                                               | Expected Result                                              | Notes |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1    | Send a write command to the buffer for any variable DRV_HMI.CMD:=16#0100 | ACTBUF.ID will take the value of DRV_CFG.ID, ACTBUF.CLSID will take the value of DRV_CFG.CLSID, status bits, alarm bits, and parameter bits of ACTBUF will match those of DRV_CFG, and other DRV_CFG parameters will be written to the corresponding ACTBUF parameters. |       |
| 2    | Send a command to switch the actuator to manual mode DRV_HMI.CMD:=16#0301 | Bit DRV_HMI.STA.X9, DRV_CFG.STA.DISP, and ACTBUF.STA.DISP will all be set to 1. |       |
| 3    | Change any parameter in the buffer, e.g., ACTBUF.T_DEASP to 1000, then send the command via the buffer ACTBUF.CMDHMI:=16#0100 to re-read the data into the buffer | The variable will be re-read into the buffer, and the changed parameter will revert to its previous value. |       |
| 4    | Send a write command to the buffer for another variable DRV_HMI.CMD:=16#0100 | ACTBUF.ID will take the value of DRV_CFG.ID, ACTBUF.CLSID will take the value of DRV_CFG.CLSID, status bits, alarm bits, and parameter bits of ACTBUF will match those of DRV_CFG, and other DRV_CFG parameters will be written to the corresponding ACTBUF parameters. |       |
| 5    | Send a write command to the buffer for another variable DRV_CFG.CMD.BUFLOAD | ACTBUF.ID will take the value of DRV_CFG.ID, ACTBUF.CLSID will take the value of DRV_CFG.CLSID, status bits, alarm bits, and parameter bits of ACTBUF will match those of DRV_CFG, and other DRV_CFG parameters will be written to the corresponding ACTBUF parameters. |       |
| 6    | Change any parameter in the buffer, e.g., ACTBUF.T_DEASP to 1000, then send the command via the buffer ACTBUF.CMDHMI:=16#0101 to write the data from the buffer to the actuator variable | The value from ACTBUF.T_DEASP will be written into DRV_CFG.T_DEASP. |       |
|      |                                                              |                                                              |       |

### 4 Operation of Built-In Time Counters

The elapsed step time for the actuator `DRV_CFG` is displayed in `DRV_CFG.T_STEP1`. The value is shown in milliseconds. The accuracy of `DRV_CFG.T_STEP1` is verified using an astronomical clock.

### 5 Effect of PLC Timer Overflow on Step Time

| No.  | Action to Test                                               | Expected Result                                              | Notes |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1    | Observe how the variables PLCCFG.TQMS and DRV_CFG.T_STEP1 change, and check the accuracy using an astronomical clock | PLCCFG.TQMS and DRV_CFG.T_STEP1 will count time in milliseconds. |       |
| 2    | Write the value 16#FFFF_FFFF - 5000 (5000 ms to the end of the range) into PLCCFG.TQMS and 16#7FFF_FFFF - 10000 (10000 ms to the end of the range) into DRV_CFG.T_STEP1 | For a certain time (5000 ms), the time will be counted normally, but when PLCCFG.TQMS reaches the upper limit (16#FFFF_FFFF), it will roll over and start from zero, while DRV_CFG.T_STEP1 will continue counting normally until it reaches the maximum value of its range (16#7FFFFFFF), after which counting will stop. |       |
| 3    | Send the command to start DRV_CFG.CMD.OPN                    | DRV_CFG.T_STEP1 will begin counting time from zero.          |       |

### 6 Actuator Mode Control

| No.  | Action to Test                                               | Expected Result                                              | Notes |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1    | Send a write command to the buffer for any variable DRV_HMI.CMD:=16#0100 | ACTBUF.ID will take the value of DRV_CFG.ID, ACTBUF.CLSID will take the value of DRV_CFG.CLSID, status bits, alarm bits, and parameter bits of ACTBUF will match those of DRV_CFG, and other DRV_CFG parameters will be written to the corresponding ACTBUF parameters. |       |
| 2    | Send a command to switch the actuator to manual mode DRV_HMI.CMD:=16#0301 | DRV_HMI.STA.X9 bit, DRV_CFG.STA.DISP, and ACTBUF.STA.DISP will all be set to 1. |       |
| 3    | Send a command to switch the actuator to automatic mode DRV_HMI.CMD:=16#0302 | DRV_HMI.STA.X9 bit, DRV_CFG.STA.DISP, and ACTBUF.STA.DISP will all be set to 0. |       |
| 4    | Send a toggle mode command to the actuator DRV_HMI.CMD:=16#0300 | DRV_HMI.STA.X9 bit, DRV_CFG.STA.DISP, and ACTBUF.STA.DISP will toggle to the opposite value. |       |
| 5    | Send a command to switch the actuator to manual mode DRV_CFG.CMD.MAN | DRV_HMI.STA.X9 bit, DRV_CFG.STA.DISP, and ACTBUF.STA.DISP will all be set to 1. |       |
| 6    | Send a command to switch the actuator to automatic mode DRV_CFG.CMD.AUTO | DRV_HMI.STA.X9 bit, DRV_CFG.STA.DISP, and ACTBUF.STA.DISP will all be set to 0. |       |
| 7    | Send a command to switch the actuator to manual mode ACTBUF.CMDHMI:=16#0301 | DRV_HMI.STA.X9 bit, DRV_CFG.STA.DISP, and ACTBUF.STA.DISP will all be set to 1. |       |
| 8    | Send a command to switch the actuator to automatic mode ACTBUF.CMDHMI:=16#0302 | DRV_HMI.STA.X9 bit, DRV_CFG.STA.DISP, and ACTBUF.STA.DISP will all be set to 0. |       |
| 9    | Send a toggle mode command to the actuator ACTBUF.CMDHMI:=16#0300 | DRV_HMI.STA.X9 bit, DRV_CFG.STA.DISP, and ACTBUF.STA.DISP will toggle to the opposite value. |       |
| 10   | Switch all actuators to automatic mode                       | The bit indicating the presence of any actuator in manual mode PLCCFG.STA_PERM.X9 should be 0, and the count of actuators in manual mode PLCCFG.CNTMAN_PERM should also be 0. |       |
| 11   | Switch several actuators to manual mode                      | The bit indicating the presence of any actuator in manual mode PLCCFG.STA_PERM.X9 should be 1, and the count of actuators in manual mode PLCCFG.CNTMAN_PERM should equal the number of actuators switched to manual mode. |       |

### 7 Actuator Operation Control

| No.  | Action to Test                                               | Expected Result                                              | Notes |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1    | Send a command to switch the actuator to automatic mode DRV_CFG.CMD.AUTO | DRV_HMI.STA.X9, DRV_CFG.STA.DISP, and ACTBUF.STA.DISP will be set to 0. |       |
| 2    | Send a start command to the actuator in automatic mode DRV_CFG.CMD.START | The process variable controlling the start output will be set to 1 CSTRT.STA.VALB = 1  The actuator will enter the starting state indicated by DRV_CFG.STA.STRTING = 1 and DRV_CFG.STEP1 = 2.  Upon receiving a signal from the run sensor, the actuator will enter the running state DRV_CFG.STA.WRKED = 1 and DRV_CFG.STEP1 = 4.  DRV_CFG.CNTPER will increment by 1. |       |
| 3    | Send a stop command to the actuator in automatic mode DRV_CFG.CMD.STOP | The process variable controlling the start output will be set to 0 CSTRT.STA.VALB = 0  The actuator will enter the stopping state indicated by DRV_CFG.STA.STOPING = 1 and DRV_CFG.STEP1 = 3.  Upon the loss of the run sensor signal, the actuator will enter the stopped state DRV_CFG.STA.STOPED = 1 and DRV_CFG.STEP1 = 5.  DRV_CFG.CNTPER will increment by 1. |       |
| 4    | Send a command to switch the actuator to manual mode DRV_HMI.CMD:=16#0301 | DRV_HMI.STA.X9, DRV_CFG.STA.DISP, and ACTBUF.STA.DISP will be set to 1. |       |
| 5    | Send a start command in manual mode DRV_HMI.CMD:=16#0011     | The process variable controlling the start output will be set to 1 CSTRT.STA.VALB = 1  The actuator will enter the starting state indicated by DRV_CFG.STA.STRTING = 1 and DRV_CFG.STEP1 = 2.  Upon receiving a signal from the run sensor, the actuator will enter the running state DRV_CFG.STA.WRKED = 1 and DRV_CFG.STEP1 = 4.  DRV_CFG.CNTPER will increment by 1. |       |
| 6    | Send a stop command in manual mode DRV_HMI.CMD:=16#0012      | The process variable controlling the start output will be set to 0 CSTRT.STA.VALB = 0  The actuator will enter the stopping state indicated by DRV_CFG.STA.STOPING = 1 and DRV_CFG.STEP1 = 3.  Upon the loss of the run sensor signal, the actuator will enter the stopped state DRV_CFG.STA.STOPED = 1 and DRV_CFG.STEP1 = 5.  DRV_CFG.CNTPER will increment by 1. |       |
| 7    | Send a write command to the buffer DRV_HMI.CMD:=16#0100      | ACTBUF.ID will take the value of DRV_CFG.ID, ACTBUF.CLSID will take the value of DRV_CFG.CLSID, status bits, alarm bits, and parameter bits of ACTBUF will match those of DRV_CFG, and other DRV_CFG parameters will be written to the corresponding ACTBUF parameters. |       |
| 8    | Send a start command in manual mode via the buffer ACTBUF.CMDHMI:=16#0011 | The process variable controlling the start output will be set to 1 CSTRT.STA.VALB = 1  The actuator will enter the starting state indicated by DRV_CFG.STA.STRTING = 1 and DRV_CFG.STEP1 = 2.  Upon receiving a signal from the run sensor, the actuator will enter the running state DRV_CFG.STA.WRKED = 1 and DRV_CFG.STEP1 = 4.  DRV_CFG.CNTPER will increment by 1. |       |
| 9    | Send a stop command in manual mode via the buffer ACTBUF.CMDHMI:=16#0012 | The process variable controlling the start output will be set to 0 CSTRT.STA.VALB = 0  The actuator will enter the stopping state indicated by DRV_CFG.STA.STOPING = 1 and DRV_CFG.STEP1 = 3.  Upon the loss of the run sensor signal, the actuator will enter the stopped state DRV_CFG.STA.STOPED = 1 and DRV_CFG.STEP1 = 5.  DRV_CFG.CNTPER will increment by 1. |       |
| 10   | Send a command to switch the actuator to automatic mode DRV_CFG.CMD.AUTO | DRV_HMI.STA.X9, DRV_CFG.STA.DISP will be set to 0.           |       |
| 11   | Change the actuator setpoint in automatic mode DRV_CFG.CSPD  | The process variable CSPD.VAL controlling the actuator output will take the value of DRV_CFG.CSPD.  DRV_HMI.CSPD will take the value of DRV_CFG.CSPD. |       |
| 12   | Send a command to switch the actuator to manual mode DRV_CFG.CMD.MAN | DRV_HMI.STA.X9, DRV_CFG.STA.DISP will be set to 1.           |       |
| 13   | Change the actuator setpoint in manual mode DRV_HMI.CSPD     | The process variable CSPD.VAL controlling the actuator output will take the value of DRV_HMI.CSPD.  DRV_CFG.CSPD will take the value of DRV_HMI.CSPD. |       |
| 14   | Send a write command to the buffer DRV_CFG.CMD.BUFLOAD       | ACTBUF.ID will take the value of DRV_CFG.ID, ACTBUF.CLSID will take the value of DRV_CFG.CLSID, status bits, alarm bits, and parameter bits of ACTBUF will match those of DRV_CFG, and other DRV_CFG parameters will be written to the corresponding ACTBUF parameters. |       |
| 15   | Change the actuator setpoint in manual mode via the buffer ACTBUF.CSPD | The process variable CSPD.VAL controlling the actuator output will take the value of ACTBUF.CSPD.  DRV_HMI.CSPD and DRV_CFG.CSPD will take the value of ACTBUF.CSPD. |       |

### 8 Alarm Handling for Actuators

| No.  | Action to Test                                               | Expected Result                                              | Notes |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1    | Send a command to switch the actuator to automatic mode DRV_CFG.CMD.AUTO | DRV_HMI.STA.X9, DRV_CFG.STA.DISP, and ACTBUF.STA.DISP will be set to 0. |       |
| 2    | Send a stop command to the actuator in automatic mode DRV_CFG.CMD.STOP | The output variable for start will be set to 0 CSTRT.STA.VALB = 0  The actuator will enter the stopping state indicated by DRV_CFG.STA.STOPING = 1 and DRV_CFG.STEP1 = 3.  When the run sensor signal disappears, it will enter the stopped state DRV_CFG.STA.STOPED = 1 and DRV_CFG.STEP1 = 5.  DRV_CFG.CNTPER will increment by 1. |       |
| 3    | Force the run signal sensor and set its value to 0           | The force bit of the run signal sensor DIVAR_CFG.STA.FRC will be set to 1, the value bit DIVAR_CFG.STA.VALB will be set to 0, and the forced bit for the actuator DRV_CFG.STA.FRC will be set to 1. |       |
| 4    | Send a start command to the actuator in automatic mode DRV_CFG.CMD.START | The output variable for start will be set to 1 CSTRT.STA.VALB = 1  The actuator will enter the starting state DRV_CFG.STA.STRTING = 1 and DRV_CFG.STEP1 = 2.  After the alarm delay DRV_CFG.T_DEASP expires, an alarm "actuator failed to start" will appear DRV_CFG.ALM.ALMSTRT=1 and the general alarm DRV_CFG.ALM.ALM=1 will be set.  Upon alarm, the start output will reset to 0 CSTRT.STA.VALB = 0, and the actuator will enter the blocked state DRV_CFG.STA.BLCK = 1.  The blocked actuators alarm PLCCFG.ALM1_PERM.X2 should be 1.  The system alarm bit PLCCFG.ALM1_PERM.X0 should be 1, and the alarm count PLCCFG.CNTALM_PERM should be 1.  DRV_CFG.CNTPER and DRV_CFG.CNTALM will increment by 1. |       |
| 5    | Remove forcing of the run signal sensor                      | The force bit DIVAR_CFG.STA.FRC will reset to 0.             |       |
| 6    | Send a command to unblock DRV_CFG.CMD.DBLCK                  | The actuator will exit the blocked state DRV_CFG.STA.BLCK = 0. |       |
| 7    | Send a start command to the actuator in automatic mode DRV_CFG.CMD.START | The output variable for start will be set to 1 CSTRT.STA.VALB = 1  The actuator will enter the starting state DRV_CFG.STA.STRTING = 1 and DRV_CFG.STEP1 = 2.  Upon run signal, it will enter the running state DRV_CFG.STA.WRKED = 1 and DRV_CFG.STEP1 = 4.  DRV_CFG.CNTPER will increment by 1. |       |
| 8    | Force the run signal sensor and set its value to 1           | The force bit DIVAR_CFG.STA.FRC will be set to 1, the value bit DIVAR_CFG.STA.VALB will be set to 1, and DRV_CFG.STA.FRC will be set to 1. |       |
| 9    | Send a stop command to the actuator in automatic mode DRV_CFG.CMD.STOP | The output variable for start will be set to 0 CSTRT.STA.VALB = 0  The actuator will enter the stopping state DRV_CFG.STA.STOPING = 1 and DRV_CFG.STEP1 = 3.  After DRV_CFG.T_DEASP expires, an alarm "actuator failed to stop" will appear DRV_CFG.ALM.ALMSTP=1 and DRV_CFG.ALM.ALM=1 will be set.  The actuator will enter the blocked state DRV_CFG.STA.BLCK = 1.  The blocked actuators alarm PLCCFG.ALM1_PERM.X2 should be 1.  The system alarm bit PLCCFG.ALM1_PERM.X0 should be 1, and PLCCFG.CNTALM_PERM should be 1.  DRV_CFG.CNTPER and DRV_CFG.CNTALM will increment by 1. |       |
| 10   | Send a command to unblock DRV_CFG.CMD.DBLCK                  | Since the run signal remains 1, the actuator will stay blocked DRV_CFG.STA.BLCK = 1, but a state violation alarm DRV_CFG.ALM.ALMSHFT=1 will appear.  PLCCFG.ALM1_PERM.X2 should be 1, PLCCFG.ALM1_PERM.X0 should be 1, and PLCCFG.CNTALM_PERM should increment to 1.  DRV_CFG.CNTALM will increment by 1. |       |
| 11   | Remove forcing of the run signal sensor                      | The force bit DIVAR_CFG.STA.FRC will reset to 0.             |       |
| 12   | Send a command to unblock DRV_CFG.CMD.DBLCK                  | Since the run signal is now 0, the actuator will exit the blocked state DRV_CFG.STA.BLCK = 0.  PLCCFG.ALM1_PERM.X2 should be 0, PLCCFG.ALM1_PERM.X0 should be 0, and PLCCFG.CNTALM_PERM should reset to 0. |       |

### 9 Actuator Auto-Configuration Algorithms

| No.  | Action to Test                                               | Expected Result                                              | Notes |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1    | Check the values of DRV_CFG.PRM.PRM_MANCFG, DRV_CFG.PRM.PRM_ZWRKENBL, DRV_CFG.PRM.PRM_ZPOSENBL | Manual config disabled DRV_CFG.PRM.PRM_MANCFG = 0  External run feedback present DRV_CFG.PRM.PRM_ZWRKENBL = 1  Analog speed/position feedback present DRV_CFG.PRM.PRM_ZPOSENBL = 1 |       |
| 2    | Attempt to enable manual config DRV_CFG.PRM.PRM_MANCFG:=1 and disable run feedback DRV_CFG.PRM.PRM_ZWRKENBL:=0 and disable analog feedback DRV_CFG.PRM.PRM_ZPOSENBL:=0 | Manual config remains disabled DRV_CFG.PRM.PRM_MANCFG = 0  Run feedback remains enabled DRV_CFG.PRM.PRM_ZWRKENBL = 1  Analog feedback remains enabled DRV_CFG.PRM.PRM_ZPOSENBL = 1  As only auto-config is used. |       |
| 3    | For the variable responsible for run feedback, activate the "disabled" parameter DIVAR_CFG.PRM.DSBL | The enabled bit will reset to 0 DIVAR_CFG.STA.ENBL = 0  Run feedback parameter will reset to 0 DRV_CFG.PRM.PRM_ZWRKENBL = 0 |       |
| 4    | Send a command to switch the actuator to automatic mode DRV_CFG.CMD.AUTO | Actuator will switch to automatic mode DRV_CFG.STA.DISP = 0  |       |
| 5    | Send a start command in automatic mode DRV_CFG.CMD.START     | Start output will go to 1 CSTRT.STA.VALB = 1  Actuator will enter starting DRV_CFG.STA.STRTING = 1 and DRV_CFG.STEP1 = 2.  Without a run sensor, it will go immediately to running DRV_CFG.STA.WRKED = 1 and DRV_CFG.STEP1 = 4.  DRV_CFG.CNTPER will increment by 1. |       |
| 6    | Send a stop command in automatic mode DRV_CFG.CMD.STOP       | Start output will go to 0 CSTRT.STA.VALB = 0  Actuator will enter stopping DRV_CFG.STA.STOPING = 1 and DRV_CFG.STEP1 = 3.  Without a run sensor, it will go immediately to stopped DRV_CFG.STA.STOPED = 1 and DRV_CFG.STEP1 = 5.  DRV_CFG.CNTPER will increment by 1. |       |
| 7    | Change the analog feedback variable for the actuator         | The value should appear in DRV_CFG.SPD and DRV_HMI.SPD (converted to 0-10000 range). |       |
| 8    | For the analog feedback variable, activate the "disabled" parameter AIVAR_CFG.PRM.DSBL | The enabled bit will reset to 0 AIVAR_CFG.STA.ENBL = 0  Analog feedback parameter will reset to 0 DRV_CFG.PRM.PRM_ZPOSENBL = 0  DRV_CFG.SPD and DRV_HMI.SPD will take the value of DRV_CFG.CSPD |       |
| 9    | Change the actuator setpoint in automatic mode DRV_CFG.CSPD  | DRV_CFG.SPD and DRV_HMI.SPD will take the value of DRV_CFG.CSPD (converted to 0-10000). |       |

