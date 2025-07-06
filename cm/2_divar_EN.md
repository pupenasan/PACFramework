## Class DIVAR: Discrete Input Process Variable

**CLSID=16#1010**

## General Description

This class implements the processing of raw input data and diagnostic information from `DICH`. Its functions include signal filtering, alarm setup and processing, and managing forcing and simulation modes.

If implementation differences are needed, other CLSIDs in the format 16#101x should be used.

## General Requirements for DIVAR Functions

### Functional Requirements

#### Operating Modes

The DIVAR class must support the following modes (sub-modes):

- Input processing / simulation
- Non-forced / forced

In **all modes**, the value from the linked `DICH` channel is written to `STA.VRAW`.

The **normal mode** is a combination of "input processing" and "non-forced" modes. In this mode, `STA.VAL` depends on `STA.VRAW` from the channel, passing through the processing functions.

In **simulation mode** (`STA.SML=TRUE`), `STA.VAL` depends on the external simulation algorithm and does not pass through the processing functions. It is modified by higher-level CMs (or an independent program). In other words, `STA.VAL` is not modified by the class algorithms except when forcing is applied. In simulation mode, the `STA.SML` state of the linked channel is also modified.

In **forced mode** (`STA.FRC=TRUE`), `STA.VAL` is changed only through the HMI debug windows and has the highest priority. When the force bit is active, the `PLC_CFG.CNTFRC` counter is incremented by 1.

#### Signal Filtering

Signal filtering operates as follows: the `VAL` value changes to its opposite only if the raw value `VRAW` changes for a period longer than `T_FLTSP`.

#### Signal Inversion

If the bit `PRM.INVERSE=TRUE` is set, then `STA.VAL = NOT STA.VRAW`.

#### Channel Binding Monitoring

The value `STA.DLNK=TRUE` indicates that the variable is linked to a channel.

#### Variable Activity

Variable activity is determined by:

```
STA.ENBL = NOT PRM.DSBL AND DLNK
```

If the variable is inactive (`STA.ENBL=FALSE`), the following functions do not operate:

- Signal processing from raw value: filtering, inversion
- Simulation
- Alarm detection and processing

Higher control levels, including CM LVL2, should treat this variable as temporarily non-existent (out of service). For example, if the variable corresponds to a valve position limit switch, the CM for the valve will treat the variable as non-existent and may operate using a "no feedback" algorithm.

#### Alarm Processing

Two alarm classes can be generated:

- Critical alarm: activated by `PRM.ISALM=TRUE`
- Warning alarm: activated by `PRM.ISWRN=TRUE`

Both classes can be used simultaneously if necessary. When an alarm function is activated, the triggering condition is monitored:

```
trigger_condition = VAL <> NRMVAL
```

The alarm is triggered if the condition persists for the time `T_DEASP`. The critical alarm is indicated by `STA.ALM=TRUE`, and the warning alarm by `STA.WRN=TRUE`.

When an alarm is triggered (rising edge), the corresponding bit `PLC_CFG.NWALM` and/or `PLC_CFG.NWWRN` is set. While the alarm is active:

- The corresponding bit `PLC_CFG.ALM.ALM` and/or `PLC_CFG.ALM.WRN` is set.
- The counter `PLC_CFG.CNTALM` and/or `PLC_CFG.CNTWRN` is incremented by 1.

#### Measurement Channel Diagnostics

This class includes checking the measurement channel validity. If `PRM.QALENBL=TRUE`, the `STA.BAD` value directly reflects the `STA.BAD` value of the linked channel. No other measurement channel diagnostics are implemented in this variable class.

`STA.BAD` represents a validity alarm. When the alarm is triggered (rising edge), `PLC_CFG.NWBAD=TRUE`. While `STA.BAD` is active:

- The corresponding bit `PLC_CFG.BAD` is set.
- The counter `PLC_CFG.CNTBAD` is incremented by 1.

Resetting the bit `PRM.QALENBL=FALSE` disables the validity alarm checking function.

## Recommendations for HMI Use

An example of discrete input process variable function configuration on the HMI is shown below:

![img](media%5C1_8.png)

Figure: Example of configuring discrete input process variable functions on the HMI.

## General Requirements for Class Variable Structures

#### DIVAR_HMI

| name | type | adr  | bit  | descr                               |
| ---- | ---- | ---- | ---- | ----------------------------------- |
| STA  | UINT | 0    |      | status + load command bit DIVAR_STA |

#### DIVAR_CFG

Below, `adr` is given as an offset in the structure in 16-bit words.

| name          | type  | adr  | bit  | Description                                                  |
| ------------- | ----- | ---- | ---- | ------------------------------------------------------------ |
| ID            | UINT  | 0    |      | Unique identifier                                            |
| CLSID         | UINT  | 1    |      | 16#1010                                                      |
| STA           | UINT  | 2    |      | status, bit assignments as in `DIVAR_STA`, may be used as an equivalent structure |
| STA_VRAW      | BOOL  | 2    | 0    | =1 – raw discrete signal value from `DICH`                   |
| STA_VALB      | BOOL  | 2    | 1    | =1 – discrete input variable value after all processing; in `FRC=1` mode, can be modified externally |
| STA_BAD       | BOOL  | 2    | 2    | =1 – Data invalid                                            |
| STA_ALDIS     | BOOL  | 2    | 3    | =1 – Alarm disabled                                          |
| STA_DLNK      | BOOL  | 2    | 4    | =1 – linked to a channel                                     |
| STA_ENBL      | BOOL  | 2    | 5    | =1 – variable is active                                      |
| STA_ALM       | BOOL  | 2    | 6    | =1 – Alarm active                                            |
| STA_VALPRV    | BOOL  | 2    | 7    | value from the previous cycle                                |
| STA_ISALM     | BOOL  | 2    | 8    | =1 – used as a process alarm                                 |
| STA_SPDMONON  | BOOL  | 2    | 9    | =1 – speed monitoring (SPDMON) enabled                       |
| STA_ISWRN     | BOOL  | 2    | 10   | =1 – used as a process warning                               |
| STA_WRN       | BOOL  | 2    | 11   | =1 – Warning active                                          |
| STA_INBUF     | BOOL  | 2    | 12   | =1 – variable is in buffer                                   |
| STA_FRC       | BOOL  | 2    | 13   | =1 – Forcing mode active                                     |
| STA_SML       | BOOL  | 2    | 14   | =1 – Variable in simulation mode                             |
| STA_CMDLOAD   | BOOL  | 2    | 15   | =1 – load command to buffer                                  |
| VALI          | INT   | 3    |      | non-forced mode: displays INT format value; forced mode: stores forced value in memory (so VAL changes do not affect it) |
| PRM           | UINT  | 4    |      | configuration parameters, must be retained without power     |
| PRM_ISALM     | BOOL  | 4    | 0    | =1 – enable as critical alarm                                |
| PRM_ISWRN     | BOOL  | 4    | 1    | =1 – enable as warning alarm                                 |
| PRM_INVERSE   | BOOL  | 4    | 2    | =1 – invert raw value                                        |
| PRM_b3        | BOOL  | 4    | 3    | reserved                                                     |
| PRM_b4        | BOOL  | 4    | 4    | reserved                                                     |
| PRM_NRMVAL    | BOOL  | 4    | 5    | normal value                                                 |
| PRM_QALENBL   | BOOL  | 4    | 6    | =1 – enable channel validity alarm                           |
| PRM_DSBL      | BOOL  | 4    | 7    | =1 – variable disabled                                       |
| PRM_SPEEDENBL | BOOL  | 4    | 8    | =1 – activate speed calculation block                        |
| PRM_b9        | BOOL  | 4    | 9    | reserved                                                     |
| PRM_b10       | BOOL  | 4    | 10   | reserved                                                     |
| PRM_b11       | BOOL  | 4    | 11   | reserved                                                     |
| PRM_b12       | BOOL  | 4    | 12   | reserved                                                     |
| PRM_b13       | BOOL  | 4    | 13   | reserved                                                     |
| PRM_STATICMAP | BOOL  | 4    | 14   | =1 – static channel mapping                                  |
| PRM_b15       | BOOL  | 4    | 15   | reserved                                                     |
| CHID          | UINT  | 5    |      | Logical number of the discrete channel linked to the variable, 0 = no link |
| STEP1         | UINT  | 6    |      | step number                                                  |
| T_DEASP       | UINT  | 7    |      | Alarm delay time in 0.1 seconds                              |
| T_FLTSP       | UINT  | 8    |      | Set filter time in milliseconds                              |
| CHIDDF        | UINT  | 9    |      | Default logical channel number                               |
| T_STEP1       | UDINT | 10   |      | Step runtime in ms                                           |
| T_PREV        | UDINT | 12   |      | time in ms since the last call, taken from `PLC_CFG.TQMS`    |

#### Buffer Commands (see buffer structure)

| Attribute | Type | Bit  | Description                                                  |
| --------- | ---- | ---- | ------------------------------------------------------------ |
| CMD       | UINT |      | Commands:16#0001: write 1 - only in forcing mode16#0002: write 0 - only in forcing mode16#0003: TOGGLE - only in forcing mode16#0100: read configuration16#0101: write configuration16#0102: write default value16#0300: toggle forcing16#0301: enable forcing16#0302: disable forcing16#0311: simulate16#0312: disable simulation |

#### Working with the Buffer

A function for working with a **classic buffer** must be implemented.

- A **single buffer** should be used for all process variables.
- Buffer occupancy is checked by matching `CLSID` and the process variable `ID`.
- On buffer acquisition:
  - `VARBUF.STA = DIVAR_CFG.STA`
  - `DIVAR_CFG.CMD = VARBUF.CMD` if not zero (to allow commands from another source)
  - read channel status bits from the linked physical channel: `VARBUF.CH_STA = CHCFG.STA`.
- The process variable configuration must be read into the buffer upon receiving:
  - `STA.CMDLOAD=TRUE` status bit
  - `VARBUF.CMD = 16#0100` command if the variable is already in the buffer
- The process variable configuration must be written from the buffer upon receiving:
  - `VARBUF.CMD = 16#0101`

A function for **parameterized bidirectional buffers VARBUFIN <-> VARBUFOUT** must be implemented.

- Two buffers are used:
  - Input buffer `VARBUFIN` – for processing commands (when `CLSID` and `ID` match) and writing to the process variable.
  - Output buffer `VARBUFOUT` – for reading from the process variable when a read command is received from `VARBUFIN`.
- A single pair of buffers is recommended for all process variables.
- Buffer occupancy is not possible since the buffer is implemented using `VARBUFIN` and `VARBUFOUT` for parameterized information transfer to the variable or HMI internal buffer (similar to PKW parameter exchange in PROFIDRIVE).
- The variable configuration must be read into the output buffer when:
  - `DIVARCFG.CLSID = VARBUFIN.CLSID`, `DIVARCFG.ID = VARBUFIN.ID`, and `VARBUFIN.CMD = 16#100`.
- The variable configuration must be written from the input buffer when:
  - `DIVARCFG.CLSID = VARBUFIN.CLSID`, `DIVARCFG.ID = VARBUFIN.ID`, and `VARBUFIN.CMD = 16#101`.

### Interface Implementation Requirements

INOUT:

- `CHCFG` – the physical channel linked to the process variable
- `DIVARCFG` – configuration part of the process variable
- `DIVARHMI` – HMI part of the process variable

If it is not possible to access external variables within functions, `PLC_CFG`, `VARBUF`, `VARBUFIN`, `VARBUFOUT` should be passed; alternatively, other interfaces can be used within `PLC_CFG`.

### Process Variable Initialization on First Cycle

ID, CHID, and CHIDFL default values are set in the `initvars` program section.

For each process variable in `initvars`, include:

```
"VAR".DIVAR1.ID := 1001;   "VAR".DIVAR1.CHID := 1;    "VAR".DIVAR1.CHIDDF := 1;
```

Additionally, initialization inside the process variable handling function will:

- Assign `DIVARCFG.CLSID := 16#1010;`
- Activate the process variable `DIVARCFG.PRM.DSBL := FALSE;`
- If the logical channel number is not set, assign the default value:
   `DIVARCFG.CHID := DIVARCFG.CHIDDF;`

### User Program Implementation Requirements

- Process variable handling functions **must be called within each execution of the task to which they are linked.**
- On first start (`PLC_CFG.SCN1`), the process variable identifier `DIVAR_CFG.ID` and the logical channel number `DIVAR_CFG.CHID` **must be initialized**.

```pascal
    (*DIVARCFG.CLSID 
    16#1010 - classic
    16#1011 - with a counter in the VALI field, does not change in this function in normal mode*)
    
    (*initialization of the variable on the first processing cycle*)
    IF "SYS".PLCCFG.STA.SCN1 THEN
        #DIVARCFG.CLSID := 16#1010; (*assign class identifier*)
        #DIVARCFG.PRM.DSBL := FALSE; (*activate variable*)
        #DIVARCFG.T_PREV := "SYS".PLCCFG.TQMS; (*store call time*)
        IF #DIVARCFG.CHID = 0 THEN (*if logical channel number is not set - assign default value*)
            #DIVARCFG.CHID := #DIVARCFG.CHIDDF;
        END_IF;
    
        (*read raw value from the channel for further processing*)
        IF #CHCFG.ID > 0 THEN
            #VRAW := #CHCFG.STA.VALB;
        ELSE
            #VRAW := 0;
        END_IF;
        #DIVARCFG.STA.VALPRV := #VRAW;
        #DIVARCFG.STA.VRAW := #DIVARCFG.STA.VALPRV;
        #DIVARCFG.STA.VALB := #DIVARCFG.STA.VRAW;
        
        #DIVARCFG.T_STEP1 := 0; (*reset step timer*)
        #DIVARCFG.STEP1 := 400; (*set state to DI=0 step*)
        
        (*define variable identifier range*)
        IF #DIVARCFG.ID>0 THEN
            IF #DIVARCFG.ID<"SYS".VARIDMIN THEN "SYS".VARIDMIN:=#DIVARCFG.ID; END_IF;
            IF #DIVARCFG.ID>"SYS".VARIDMAX THEN "SYS".VARIDMAX:=#DIVARCFG.ID; END_IF;
        END_IF;
        
        RETURN;
    END_IF;
    
    (*read status bits from the technology variable into internal variables*)
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
    
    (*read parameter bits from the technology variable into internal variables*)
    #PRM_ISALM := #DIVARCFG.PRM.ISALM;
    #PRM_ISWRN := #DIVARCFG.PRM.ISWRN;
    #PRM_INVERSE := #DIVARCFG.PRM.INVERSE;
    #PRM_NRMVAL := #DIVARCFG.PRM.NRMVAL;
    #PRM_QALENBL := #DIVARCFG.PRM.QALENBL;
    #PRM_DSBL := #DIVARCFG.PRM.DSBL;
    #PRM_STATICMAP := #DIVARCFG.PRM.STATICMAP;
    
    #INBUF := (#DIVARCFG.ID = "BUF".VARBUF.ID) AND (#DIVARCFG.CLSID = "BUF".VARBUF.CLSID); (*variable is in buffer if variable ID and class ID match*)
    #CMDLOAD := #DIVARHMI.STA.%X15; (*write-to-buffer command from the variable HMI*)
    #CMD := 0; (*reset internal command*)
    #DLNK := (#CHCFG.ID > 0); (*variable is linked to a channel if the channel has a real ID (not 0)*)
    #VARENBL := NOT #PRM_DSBL AND #DLNK; (*variable is active if linked to a channel and the disable parameter is inactive*)
    #VRAW := #CHCFG.STA.VALB; (*read raw value from channel*)
    #T_STEPMS := #DIVARCFG.T_STEP1; (*store cycle time in ms*)
    
    (*ping-pong algorithm implementation*)
    IF #DLNK THEN
        #CHCFG.STA.PNG := true;
        #CHCFG.VARID := #DIVARCFG.ID;
    END_IF;
    
    (*if the variable is inactive, do not count time, reset state, and only record the raw value*)
    IF NOT #VARENBL THEN
        #VAL := #VRAW;
        #DIVARCFG.T_STEP1 := 0;
        #DIVARCFG.STEP1 := 400;
    END_IF;
    
    (*calculate time since the last function call using the millisecond counter*)
    #dT := "SYS".PLCCFG.TQMS - #DIVARCFG.T_PREV;
    
    (*broadcast deforce command*) 
    IF "SYS".PLCCFG.CMD = 16#4302 THEN
        #FRC := false; (*deforce this type of object*)
    END_IF;
    
    (*select the configuration/control command source by priority if commands arrive simultaneously*)
    IF #CMDLOAD THEN (*write-to-buffer command from HMI*)
        #CMD := 16#0100;
    ELSIF #INBUF AND "BUF".VARBUF.CMD <> 0 THEN (*command from buffer*)
        #CMD := "BUF".VARBUF.CMD;
    END_IF;

```

```pascal
    (*commands*)
    CASE #CMD OF
        16#0001: (*write 1 - only in force mode*)
            IF #FRC AND #INBUF THEN
                #DIVARCFG.VALI := 1;
                #VAL := true;
                #DIVARCFG.STEP1 := 401;
                #DIVARCFG.T_STEP1 := 0;
            END_IF;
        16#0002: (*write 0 - only in force mode*)
            IF #FRC AND #INBUF THEN
                #DIVARCFG.VALI := 0;
                #VAL := false;
                #DIVARCFG.STEP1 := 400;
                #DIVARCFG.T_STEP1 := 0;
            END_IF;
        16#0003: (*TOGGLE - only in force mode*)
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
        16#0100: (*read configuration*)
            (* MSG 200-Ok 400-Error
            // 200 - Data written
            // 201 - Data read
            // 403 - channel already occupied
            // 404 - channel number out of range
            // 405 - static channel mapping active *)
            "BUF".VARBUF.MSG := 201;
            
            (*read variable ID and class ID*)
            "BUF".VARBUF.ID := #DIVARCFG.ID;
            "BUF".VARBUF.CLSID := #DIVARCFG.CLSID;
            
            (*read bit parameters*)
            "BUF".VARBUF.PRM.%X0 := #PRM_ISALM;
            "BUF".VARBUF.PRM.%X1 := #PRM_ISWRN;
            "BUF".VARBUF.PRM.%X2 := #PRM_INVERSE;
            "BUF".VARBUF.PRM.%X5 := #PRM_NRMVAL;
            "BUF".VARBUF.PRM.%X6 := #PRM_QALENBL;
            "BUF".VARBUF.PRM.%X7 := #PRM_DSBL;
            "BUF".VARBUF.PRM.%X14 := #PRM_STATICMAP;
            
            (*read parameters*)           
            "BUF".VARBUF.CHID := #DIVARCFG.CHID;
            "BUF".VARBUF.T_FLTSP := #DIVARCFG.T_FLTSP;
            "BUF".VARBUF.T_DEALL := #DIVARCFG.T_DEASP;
            
            (*read variable value for bumpless forcing*)
            "BUF".VARBUF.VALR := INT_TO_REAL(#DIVARCFG.VALI);
            
        16#0101: (*write configuration*)
            (* MSG 200-Ok 400-Error
            // 200 - Data written
            // 201 - Data read
            // 403 - channel already occupied
            // 404 - channel number out of range
            // 405 - static channel mapping active *)
            "BUF".VARBUF.MSG:=200;
            
            (*write bit parameters*)
            #PRM_ISALM := "BUF".VARBUF.PRM.%X0;
            #PRM_ISWRN := "BUF".VARBUF.PRM.%X1;
            #PRM_INVERSE := "BUF".VARBUF.PRM.%X2;
            #PRM_NRMVAL := "BUF".VARBUF.PRM.%X5;
            #PRM_QALENBL := "BUF".VARBUF.PRM.%X6;
            #PRM_DSBL := "BUF".VARBUF.PRM.%X7;
            #PRM_STATICMAP := "BUF".VARBUF.PRM.%X14;
            
            (*write parameters*)
            #DIVARCFG.T_FLTSP := "BUF".VARBUF.T_FLTSP;
            #DIVARCFG.T_DEASP := "BUF".VARBUF.T_DEALL;
            
            (*algorithm for changing logical channel number with validation*)
            IF NOT #PRM_STATICMAP THEN (* change logical channel number only if static mapping is inactive *)
                IF "BUF".VARBUF.CHID>=0 AND "BUF".VARBUF.CHID <= INT_TO_UINT("SYS".PLCCFG.DICNT) THEN (* if channel number within total channels *)
                    IF "SYS".CHDI["BUF".VARBUF.CHID].VARID = 0 THEN (* if channel is free *)
                        #DIVARCFG.CHID := "BUF".VARBUF.CHID; (* assign logical channel number *)
                    ELSIF "BUF".VARBUF.CHID <> #DIVARCFG.CHID THEN (* else raise occupied channel error *)
                        "BUF".VARBUF.MSG := 403;(* channel already occupied *)
                    END_IF;
                ELSE
                    "BUF".VARBUF.MSG := 404; (*channel number out of range*)
                END_IF;
            ELSIF "BUF".VARBUF.CHID <> #DIVARCFG.CHID THEN (* else raise error: static mapping active *)
                "BUF".VARBUF.MSG := 405;(* static channel mapping active *)
            END_IF;
            IF #INBUF THEN (*update channel number in buffer if variable still in buffer*)
                "BUF".VARBUF.CHID := #DIVARCFG.CHID;
            END_IF;
        16#0102: (*write default value*)
            #DIVARCFG.CHID := #DIVARCFG.CHIDDF;
        16#0300: (*toggle force mode*)
            #FRC := NOT #FRC;
        16#0301: (*enable force mode*)
            #FRC := true;
        16#0302: (*disable force mode*)
            #FRC := false;
        16#0311: (* enable simulation mode *)
            #SML := true;
        16#0312: (* disable simulation mode *)
            #SML := false;
    END_CASE;
    
    (*value processing*)
    IF NOT #FRC AND NOT #SML THEN (*process non-forced value - normal variable operation*)
        IF #PRM_INVERSE THEN (*apply inversion function*)
            #DI := NOT #VRAW;
        ELSE
            #DI := #VRAW;
        END_IF;
        (*state machine and filtering*)
        CASE #DIVARCFG.STEP1 OF
            400:(*DI = 0*)
                IF #DI THEN
                    #DIVARCFG.STEP1 := 401;
                    #DIVARCFG.T_STEP1 := 0;
                END_IF;
                IF #T_STEPMS >= UINT_TO_UDINT(#DIVARCFG.T_FLTSP) THEN
                    #VAL := FALSE;
                END_IF;
            401:(*DI = 1*)
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
        (*if not a counter DI*)
        IF #DIVARCFG.CLSID <> 16#1011 THEN
            #DIVARCFG.VALI := BOOL_TO_INT (#VAL);
        END_IF;
    ELSE (* processing without filtering and inversion *)
        IF #FRC THEN  (*in force mode value taken from VALI*)
            (*if not a counter DI*)
            IF #DIVARCFG.CLSID <> 16#1011 THEN
                #VAL := INT_TO_BOOL (#DIVARCFG.VALI);
            END_IF;
        ELSIF #SML THEN (*in simulation mode VAL changes externally, VALI is set from VAL*)
            (*if not a counter DI*)
            IF #DIVARCFG.CLSID <> 16#1011 THEN
                #DIVARCFG.VALI := BOOL_TO_INT (#VAL);
            END_IF;
        END_IF;
        (*state machine in force mode - no filtering*)
        CASE #DIVARCFG.STEP1 OF
            400:(*DI = 0*)
                IF #VAL THEN
                    #DIVARCFG.STEP1 := 401;
                    #DIVARCFG.T_STEP1 := 0;
                END_IF;
            401:(*DI = 1*)
                IF NOT #VAL THEN
                    #DIVARCFG.STEP1 := 400;
                    #DIVARCFG.T_STEP1 := 0;
                END_IF;
            ELSE
                #DIVARCFG.STEP1 := 400;
                #DIVARCFG.T_STEP1 := 0;
        END_CASE;
    END_IF;
    
    (*alarm processing - alarms active only when variable is enabled*)
    IF #VARENBL THEN
        IF #DIVARCFG.T_STEP1 >= (UINT_TO_UDINT(#DIVARCFG.T_DEASP) * 100 + #DIVARCFG.T_FLTSP) THEN (*alarm delay in 0.1s, filter in ms*)
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
    
    #BAD := #VARENBL AND #CHCFG.STA.BAD AND #PRM_QALENBL AND NOT #SML; (*validity alarm taken from the linked physical channel*)
    
    (*send alarms to PLCCFG variable to form overall status bit and detect new alarm*)
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
    
    (*send status bits for the PLCCFG variable to form overall status bit*)
    IF #FRC THEN
        "SYS".PLCCFG.STA.FRC1 := true;
        "SYS".PLCCFG.CNTFRC := "SYS".PLCCFG.CNTFRC + 1;
    END_IF;
    IF #SML THEN
        "SYS".PLCCFG.STA.SML := true;
    END_IF;
    
    (*if the variable is configured as a technological alarm or warning, send this information to variable status bits*)
    #ISALM := #PRM_ISALM;
    #ISWRN := #PRM_ISWRN;

```

```pascal
    (*transfer status bits from internal variables to the technological variable*)
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
    #DIVARCFG.STA.CMDLOAD := FALSE; (*reset buffer write bit*)
    
    (*transfer parameter bits from internal variables to the technological variable*)
    #DIVARCFG.PRM.ISALM := #PRM_ISALM;
    #DIVARCFG.PRM.ISWRN := #PRM_ISWRN;
    #DIVARCFG.PRM.INVERSE := #PRM_INVERSE;
    #DIVARCFG.PRM.NRMVAL := #PRM_NRMVAL;
    #DIVARCFG.PRM.QALENBL := #PRM_QALENBL;
    #DIVARCFG.PRM.DSBL := #PRM_DSBL;
    #DIVARCFG.PRM.STATICMAP := #PRM_STATICMAP;
    
    (*transfer status bits from configuration part to HMI*)
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
    
    #DIVARCFG.T_PREV := "SYS".PLCCFG.TQMS; (*save last function call time*)
    
    (*calculate step time and limit to upper bound*)
    #DIVARCFG.T_STEP1 := #DIVARCFG.T_STEP1 + #dT;
    IF #DIVARCFG.T_STEP1 > 16#7FFF_FFFF THEN
        #DIVARCFG.T_STEP1 := 16#7FFF_FFFF;
    END_IF;
    
    (*automatic update if variable is written in the buffer*)
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
    
    (*read status bits of the physical channel linked to the technological variable*)
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
    
    (*implement reading configuration data into output buffer*)
    IF (UINT_TO_WORD(#DIVARCFG.CLSID) AND 16#FFF0) = (UINT_TO_WORD("BUF".VARBUFIN.CLSID) AND 16#FFF0) AND #DIVARCFG.ID = "BUF".VARBUFIN.ID AND "BUF".VARBUFIN.CMD = 16#100 THEN
        (* MSG 200-Ok 400-Error
        // 200 - Data written
        // 201 - Data read
        // 403 - channel already occupied
        // 404 - channel number out of range *)
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
        
        "BUF".VARBUFIN.CMD := 0;
    END_IF;
    
    (*implement writing configuration data from input buffer into the technological variable*)
    IF (UINT_TO_WORD(#DIVARCFG.CLSID) AND 16#FFF0) = (UINT_TO_WORD("BUF".VARBUFIN.CLSID) AND 16#FFF0) AND #DIVARCFG.ID = "BUF".VARBUFIN.ID AND "BUF".VARBUFIN.CMD = 16#101 THEN
        (* MSG 200-Ok 400-Error
        // 200 - Data written
        // 201 - Data read
        // 403 - channel already occupied
        // 404 - channel number out of range *)
        
        "BUF".VARBUFOUT := "BUF".VARBUFIN;
        
        #DIVARCFG.PRM.ISALM := "BUF".VARBUFIN.PRM.%X0;
        #DIVARCFG.PRM.ISWRN := "BUF".VARBUFIN.PRM.%X1;
        #DIVARCFG.PRM.INVERSE := "BUF".VARBUFIN.PRM.%X2;
        #DIVARCFG.PRM.NRMVAL := "BUF".VARBUFIN.PRM.%X5;
        #DIVARCFG.PRM.QALENBL := "BUF".VARBUFIN.PRM.%X6;
        #DIVARCFG.PRM.DSBL := "BUF".VARBUFIN.PRM.%X7;
        #DIVARCFG.PRM.STATICMAP := "BUF".VARBUFIN.PRM.%X14;
        
        #DIVARCFG.T_FLTSP := "BUF".VARBUF.T_FLTSP;
        #DIVARCFG.T_DEASP := "BUF".VARBUF.T_DEALL;
        
        "BUF".VARBUFOUT.MSG := 200;
        IF NOT #DIVARCFG.PRM.STATICMAP THEN
            IF "BUF".VARBUFIN.CHID >= 0 AND "BUF".VARBUFIN.CHID <= INT_TO_UINT("SYS".PLCCFG.DICNT) THEN
                IF "SYS".CHDI["BUF".VARBUFIN.CHID].VARID = 0 THEN
                    #DIVARCFG.CHID := "BUF".VARBUFIN.CHID;
                ELSIF "BUF".VARBUFIN.CHID <> #DIVARCFG.CHID THEN
                    "BUF".VARBUFOUT.MSG := 403; (*channel already occupied*)
                END_IF;
            ELSE
                "BUF".VARBUFOUT.MSG := 404; (*channel number out of range*)
            END_IF;
        ELSIF "BUF".VARBUFIN.CHID <> #DIVARCFG.CHID THEN (*otherwise raise static mapping error*)
            "BUF".VARBUFOUT.MSG := 405; (*static channel mapping active*)
        END_IF;
        
        "BUF".VARBUFIN.CMD := 0;
    END_IF;

```

## Testing

General testing requirements are provided in the LVL1 classes document. Only specific tests differing from the general ones are provided here.

### List of tests

| No.  | Name                                                      | When to check                 | Notes |
| ---- | --------------------------------------------------------- | ----------------------------- | ----- |
| 1    | Assignment of ID and CLSID at startup                     | after function implementation |       |
| 2    | Write commands to buffer                                  | after function implementation |       |
| 3    | Changing parameters and writing from buffer               | after function implementation |       |
| 4    | Changing the logical channel number                       | after function implementation |       |
| 5    | Writing CHID default value at startup with single command | after function implementation |       |
| 6    | Operation of built-in time counters                       | after function implementation |       |
| 7    | Effect of PLC time counter overflow on step time          | after function implementation |       |
| 8    | Ping-Pong algorithm                                       | after function implementation |       |
| 9    | Operation in non-forced mode                              | after function implementation |       |
| 10   | Operation in forced mode                                  | after function implementation |       |
| 11   | Sending broadcast unforce commands                        | after function implementation |       |
| 12   | Operation in simulation mode                              | after function implementation |       |
| 13   | Filter function                                           | after function implementation |       |
| 14   | Inversion function                                        | after function implementation |       |
| 15   | Alarm functions                                           | after function implementation |       |
| 16   | Deactivating the variable                                 | after function implementation |       |
|      |                                                           |                               |       |
|      |                                                           |                               |       |
|      |                                                           |                               |       |

### 1 Assignment of ID and CLSID at startup

- Before running the test, the PLC must be in STOP mode.
- After startup, all technological variables used in the program must have their ID and CLSID assigned.

### 2 Buffer binding commands

| No.  | Test action                                                  | Expected result                                              | Notes |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1    | Set STA.X15:=1 for one of the DIVAR_HMI variables            | The entire DIVAR_CFG should be loaded into VARBUF.STA.X15 in DIVAR_HMI should reset to 0.STA.12(INBUF) should be 1 in DIVAR_HMI, DIVAR_CFG, and VARBUF. |       |
| 2    | Change the value of the physical channel DICH linked to the variable (e.g., force) | The corresponding value should change in DIVAR_HMI, DIVAR_CFG, and VARBUF. |       |
| 3    | Set STA.X15:=1 for another DIVAR_HMI variable                | The entire DIVAR_CFG of the other variable should load into VARBUF. |       |
| 4    | Change one configuration field in VARBUF (e.g., VARBUF.CHID), and execute a write command VARBUF.CMD:=16#100 | The changed VARBUF.CHID should revert to the previous value. |       |

### 3 Changing parameters and writing from the buffer

| No.  | Test action                                                  | Expected result                                              | Notes |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1    | Set STA.X15:=1 for one of the DIVAR_HMI variables            | The entire DIVAR_CFG should be loaded into VARBUF.STA.X15 in DIVAR_HMI should reset to 0.STA.12(INBUF) should be 1 in DIVAR_HMI, DIVAR_CFG, and VARBUF. |       |
| 2    | Change one configuration field in VARBUF (e.g., VARBUF.T_FLTSP) and execute VARBUF.CMD:=16#101 | The new value should appear in DIVAR_CFG.T_FLTSP.            |       |
| 3    | Repeat step 2 with a different parameter                     |                                                              |       |

### 4 Changing the logical channel number

| No.  | Test action                                                  | Expected result                                              | Notes |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1    | Set STA.X15:=1 for one of the DIVAR_HMI variables            | The entire DIVAR_CFG should be loaded into VARBUF.STA.X15 in DIVAR_HMI should reset to 0.STA.12(INBUF) should be 1 in DIVAR_HMI, DIVAR_CFG, and VARBUF. |       |
| 2    | Change VARBUF.CHID to any free valid physical channel and execute VARBUF.CMD:=16#101 | DIVAR_CFG.CHID should reflect the new value, and VARBUF.MSG should show a successful write VARBUF.MSG = 200. |       |
| 3    | Change VARBUF.CHID to an occupied valid channel and execute VARBUF.CMD:=16#101 | DIVAR_CFG.CHID should remain unchanged, VARBUF.CHID should revert to the correct value, VARBUF.MSG should show channel occupied VARBUF.MSG = 403. |       |
| 4    | Change VARBUF.CHID to an out-of-range channel and execute VARBUF.CMD:=16#101 | DIVAR_CFG.CHID should remain unchanged, VARBUF.CHID should revert to the correct value, VARBUF.MSG should show invalid channel VARBUF.MSG = 404. |       |
| 5    | Enable static mapping DIVAR_CFG.PRM.STATICMAP:=1, preventing channel number changes. Change VARBUF.CHID to a valid free channel and execute VARBUF.CMD:=16#101 | DIVAR_CFG.CHID should remain unchanged, VARBUF.CHID should revert, VARBUF.MSG should show static mapping VARBUF.MSG = 405. |       |

### 5 Writing CHID default value at startup with single command

- On startup:
  - Before running the test, the PLC must be in STOP mode.
  - After startup, all technological variables should have CHID and CHIDDF recorded.
- With a single command:

| No.  | Test action                                                  | Expected result                                              | Notes |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1    | Set STA.X15:=1 for one of the DIVAR_HMI variables            | The entire DIVAR_CFG should be loaded into VARBUF.STA.X15 in DIVAR_HMI should reset to 0.STA.12(INBUF) should be 1 in DIVAR_HMI, DIVAR_CFG, and VARBUF. |       |
| 2    | Change VARBUF.CHID to a valid free channel and execute VARBUF.CMD:=16#101 | DIVAR_CFG.CHID should reflect the new value, and VARBUF.MSG should show a successful write VARBUF.MSG = 200. |       |
| 3    | Execute the command to write the default value VARBUF.CMD:=16#102 | DIVAR_CFG.CHID should reflect the value saved in DIVAR_CFG.CHIDDF. |       |

### 6 Operation of built-in time counters

The step time for the variable `DIVAR_CFG` is displayed in `DIVAR_CFG.T_STEP1`, in ms. The accuracy of `DIVAR_CFG.T_STEP1` is verified using an astronomical clock.

### 7 Effect of PLC time counter overflow on step time

| No.  | Test action                                                  | Expected result                                              | Notes |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1    | Observe how PLCCFG.TQMS and DIVAR1.T_STEP1 change, verify using an astronomical clock | PLCCFG.TQMS and DIVAR1.T_STEP1 should count time in ms.      |       |
| 2    | Set PLCCFG.TQMS to 16#FFFF_FFFF - 5000 (5000 ms to overflow) and DIVAR1.T_STEP1 to 16#7FFF_FFFF - 10000 (10000 ms to overflow) | Time will count normally for 5000 ms, then PLCCFG.TQMS will roll over while DIVAR1.T_STEP1 will continue until it reaches 16#7FFFFFFF and stop. |       |
| 3    | Change the value of the physical channel DICH linked to the technological variable (e.g., force) | DIVAR1.T_STEP1 will reset and start counting from zero.      |       |

### 8 Ping-Pong algorithm

| No.  | Test action                                                  | Expected result                                              | Notes |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1    | Check CHDI.VARID of the physical channel linked to the test variable DIVAR1 | CHDI.VARID should show DIVAR1.ID, CHDI.STA_ULNK=1, DIVAR1.STA.DLNK=1 |       |
| 2    | Set DIVAR1.CHID:=0                                           | DIVAR1.STA.DLNK=0, CHDI.VARID=0, CHDI.STA_ULNK=0             |       |
| 3    | Restore previous DIVAR1.CHID value                           | CHDI.VARID should show DIVAR1.ID, CHDI.STA_ULNK=1, DIVAR1.STA.DLNK=1 |       |
| 4    | Repeat for another technological variable                    |                                                              |       |

### 9 Operation in non-forced mode

| No.  | Test action                                                  | Expected result                                              | Notes |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1    | Set STA.X15:=1 for one of the DIVAR_HMI variables            | The entire DIVAR_CFG should be loaded into VARBUF.STA.X15 in DIVAR_HMI should reset to 0.STA.12(INBUF) should be 1 in DIVAR_HMI, DIVAR_CFG, and VARBUF. |       |
| 2    | Change the physical channel DICH value linked to the variable (e.g., force) | The value should change in DIVAR_HMI, DIVAR_CFG, and VARBUF. |       |
| 3    | Change the physical channel DICH value to the opposite       | The value should change in DIVAR_HMI, DIVAR_CFG, and VARBUF. |       |

### 10 Operation in Forced Mode

| No.  | Test action                                                  | Expected result                                              | Notes                                         |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | --------------------------------------------- |
| 1    | Set STA.X15:=1 for one of the DIVAR_HMI variables            | The entire DIVAR_CFG should be loaded into VARBUF.STA.X15 in DIVAR_HMI should reset to 0.STA.12(INBUF) should be 1 in DIVAR_HMI, DIVAR_CFG, and VARBUF. |                                               |
| 2    | Send force command VARBUF.CMD=16#0301                        | The STA.FRC bit should be set to 1                           |                                               |
| 3    | Change the value of the physical channel DICH linked to the variable (e.g., force) | The value in DIVAR_HMI, DIVAR_CFG, and VARBUF should not change |                                               |
| 4    | Send command 16#0001 (write 1)                               | STA.VALB should change to 1                                  |                                               |
| 5    | Send command 16#0002 (write 0)                               | STA.VALB should change to 0                                  |                                               |
| 6    | Send command 16#0003 (TOGGLE)                                | STA.VALB should toggle to the opposite value                 |                                               |
| 7    | Change the value of `DIVAR_CFG.VALI`                         | The value should change as specified                         | For discrete variables, any value >0 equals 1 |
| 8    | Send unforce command VARBUF.CMD=16#0302                      | STA.FRC should reset to 0, and STA.VALB should take the physical channel value |                                               |
| 9    | Send force toggle command 16#0300 multiple times, leaving in forced mode | STA.FRC should toggle accordingly                            |                                               |
| 10   | Enable force mode for multiple variables                     | STA.FRC for these variables should be set to 1               |                                               |
| 11   | Check PLC.STA_PERM and PLC.CNTFRC_PERM values                | PLC.STA_PERM.X11=1, PLC.CNTFRC_PERM equals number of forced variables |                                               |
| 12   | Disable force mode for all variables                         | PLC.STA_PERM.X11=0, PLC.CNTFRC_PERM=0                        |                                               |

### 11 Sending Broadcast Unforce Commands

| Step No. | Test action                                                  | Expected result                                              | Notes |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1        | Enable force mode for multiple variables                     | STA.FRC for these variables should be set to 1               |       |
| 2        | Check PLC.STA_PERM and PLC.CNTFRC_PERM values                | PLC.STA_PERM.X11=1, PLC.CNTFRC_PERM equals number of forced variables |       |
| 3        | Send broadcast unforce command to all variables PLC.CMD=16#4302 | STA.FRC for all variables should reset to 0, PLC.CNTFRC_PERM=0 |       |

### 12 Operation in Simulation Mode

| No.  | Test action                                                  | Expected result                                              | Notes |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1    | Set STA.X15:=1 for one of the DIVAR_HMI variables            | The entire DIVAR_CFG should be loaded into VARBUF.STA.X15 in DIVAR_HMI should reset to 0.STA.12(INBUF) should be 1 in DIVAR_HMI, DIVAR_CFG, and VARBUF. |       |
| 2    | Send simulation enable command VARBUF.CMD=16#0311            | STA.SML bit should be set to 1                               |       |
| 3    | Change the value of the physical channel DICH linked to the variable (e.g., force) | The value in DIVAR_HMI, DIVAR_CFG, and VARBUF should not change |       |
| 4    | Change DIVAR_CFG.STA.VALB to 1                               | The value should update in DIVAR_HMI and VARBUF, ignoring the DICH value |       |
| 5    | Check PLC.STA_PERM values                                    | Simulation object indicator PLC.STA_PERM.X14=1               |       |
| 6    | Send simulation disable command VARBUF.CMD=16#0312           | STA.SML should reset to 0.DIVAR_CFG.STA.VALB should match the DICH value |       |
| 7    | Check PLC.STA_PERM values                                    | Simulation object indicator PLC.STA_PERM.X14=0               |       |

### 13 Filter Function

| No.  | Test action                                                  | Expected result                                              | Notes |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1    | Change DIVAR_CFG.T_FLT for the test variable to 10000 ms     |                                                              |       |
| 2    | Change the physical channel DICH linked to the variable to 1 (e.g., force) | DIVAR_CFG.STA.VALR will become 1, VALB will remain 0, T_STEP1 will reset and start counting. Once T_STEP1 exceeds the filter time, VALB will become 1. |       |
| 3    | Change the physical channel DICH linked to the variable to 0 (e.g., force) | DIVAR_CFG.STA.VALR will become 0, VALB will remain 1, T_STEP1 will reset and start counting. Once T_STEP1 exceeds the filter time, VALB will become 0. |       |
| 4    | Change the filter time for the test variable to a different value and repeat steps 2-3 |                                                              |       |

### 14 Inversion Function

| No.  | Test action                                                  | Expected result                                              | Notes |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1    | Change the physical channel DICH linked to the test variable to 1 (e.g., force) | VALR will become 1, and after filter time, VALB will become 1 |       |
| 2    | Change the physical channel DICH linked to the test variable to 0 (e.g., force) | VALR will become 0, and after filter time, VALB will become 0 |       |
| 3    | Set DIVAR_CFG.PRM.INVERSE parameter to 1                     | VALR will remain 0, VALB will become 1                       |       |
| 4    | Change the physical channel DICH linked to the test variable to 1 (e.g., force) | VALR will become 1, and after filter time, VALB will become 0 |       |
| 5    | Change the physical channel DICH linked to the test variable to 0 (e.g., force) | VALR will become 0, and after filter time, VALB will become 1 |       |
| 6    | Reset DIVAR_CFG.PRM.INVERSE parameter to 0                   | VALR will remain 0, VALB will become 0                       |       |

### 15 Alarm Functions

| No.  | Test action                                                  | Expected result                                              | Notes |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1    | Set DIVAR_CFG.PRM.ISALM to 1 and DIVAR_CFG.T_DEASP to 100 (0.1s units, equal to 10s) | DIVAR_CFG.STA.ISALM should become 1                          |       |
| 2    | Change the physical channel DICH linked to the test variable to 1 (e.g., force) | VALR will become 1, VALB will become 1 after filter time, and ALM will become 1 after alarm delay |       |
| 3    | Change the physical channel DICH linked to the test variable to 0 (e.g., force) | VALR will become 0, VALB will become 0 after filter time, and ALM will immediately become 0 |       |
| 4    | Set DIVAR_CFG.PRM.ISALM to 0                                 | DIVAR_CFG.STA.ISALM will reset to 0                          |       |
| 5    | Change the physical channel DICH linked to the test variable to 1 (e.g., force) | VALR will become 1, VALB will become 1 after filter time, ALM will remain 0 |       |
| 6    | Set DIVAR_CFG.PRM.ISALM to 1 and DIVAR_CFG.PRM.NRMVAL to 1   | ISALM will be 1, ALM will remain 1                           |       |
| 7    | Change the physical channel DICH linked to the test variable to 0 (e.g., force) | VALR will become 0, VALB will become 0 after filter time, and ALM will become 1 after alarm delay |       |
| 8    | Set DIVAR_CFG.PRM.NRMVAL to 0                                | ALM will reset to 0                                          |       |
| 9    | Repeat steps 1-8 for the DIVAR_CFG.PRM.ISWRN parameter       |                                                              |       |

### 16 Deactivating the Variable

| No.  | Test action                                                  | Expected result                                              | Notes |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1    | Set DIVAR_CFG.PRM.ISALM to 1 and DIVAR_CFG.T_DEASP to 100 (0.1s units, equal to 10s) | ISALM will be 1                                              |       |
| 2    | Set DIVAR_CFG.PRM.DSBL to 1                                  | ENBL will reset to 0, STEP1 will become 400, T_STEP1 will reset and stop counting |       |
| 3    | Change the physical channel DICH linked to the test variable to 1 (e.g., force) | VALR will become 1, VALB will become 1 immediately without filter delay, ALM will remain 0 even after the alarm delay |       |
| 4    | Set the "invert raw value" parameter DIVAR_CFG.PRM.INVERSE to 1 | VALR will remain 1, VALB will remain 1                       |       |
| 5    | Reset DIVAR_CFG.PRM.DSBL to 0                                | ENBL will become 1, T_STEP1 will start counting.VALR will remain 1, and VALB will become 0 after filter time |       |
| 6    | Change the physical channel DICH linked to the test variable to 0 (e.g., force) | VALR will become 0, VALB will become 1 after filter time, and ALM will become 1 after alarm delay |       |

