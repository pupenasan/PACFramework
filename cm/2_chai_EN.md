# Class `CHAI` (Analog Input Channel)

## Classes

General template for all **CLSID=16#003x** classes. Recommended class values:

- 16#0030 (48) – general class without specific signal type
- 16#0031 (49) – 4..20 mA
- 16#0032 (50) – 0..20 mA
- 16#0033 (51) – 0..10 V
- 16#0034 (52) – Resistance thermometer (type unspecified)
- 16#0035 (53) – Thermocouple (type unspecified)

Other classes can be defined as needed.

## General Description

Implements the function for working with a **physical analog input** on a local PLC or distributed I/O device.

The structure of the `CH_CFG` and `CH_HMI` variables is provided in the Class Structure Description.

## Function `CHAIFN`

### Functional Requirements

- General functional requirements are described in the LVL0 Class Requirements.
- The function must support `MIN` and `MAX` values to enable easy management under forced conditions. The `MIN` and `MAX` values can be determined by the `CHAIFN` subclass.

### Interface Implementation Requirements

Interface implementation requirements are described in the LVL0 Class Requirements.

### User Program Implementation Requirements

Example for **TIA Portal**:

```pascal
// Working with IOT buffer
"CHIOTFN"(CHCFG:=#CHCFG, RAWINT:=#tmp);

#STA := #CHCFG.STA;
#CMD := #CHCFG.CMD;
/* Unpacking from STA */
#VRAW := #STA.VRAW;
#VAL := #STA.VALB;
#BAD := #STA.BAD; (* externally managed *)
#PNG := #STA.PNG;
#ULNK := #STA.ULNK;
#MERR := #STA.MERR; (* externally managed *)
#BRK := #STA.BRK; (* externally managed *)
#SHRT := #STA.SHRT; (* externally managed *)
#NBD := #STA.NBD; (* externally managed *)
#INBUF := #STA.INBUF;
#FRC := #STA.FRC;
#SML := #STA.SML;
#CMDLOAD := #STA.CMDLOAD; (* bit-controlled *)
#INBUF := (#CHCFG.ID = "BUF".CHBUF.ID) AND (#CHCFG.CLSID = "BUF".CHBUF.CLSID);
#CMDLOAD := #CHHMI.STA.%X15;
#CMD := 0;

/* Command handler */
/* Broadcast force/unforce */
IF "SYS".PLCCFG.CMD=16#4301 THEN
    #FRC := true; (* force one/all objects of the type *)
END_IF;
IF "SYS".PLCCFG.CMD=16#4302 THEN
    #FRC := false; (* unforce the object type *)
END_IF;

/* Command source selection by priority */
IF #CMDLOAD THEN (* from HMI CMDLOAD *)
    #CMD := 16#0100;  // load to buffer
ELSIF #INBUF AND "BUF".CHBUF.CMD <> 0 THEN (* from buffer *)
    #CMD := "BUF".CHBUF.CMD;
ELSIF #CHCFG.CMD<>0 THEN
    #CMD := #CHCFG.CMD;
END_IF;

/* Commands */
CASE #CMD OF
    16#0001: (* Write MAX *)
        IF #FRC AND #INBUF THEN
            "BUF".CHBUF.VAL := #MAX;
        END_IF;
    16#0002: (* Write MIN *)
        IF #FRC AND #INBUF THEN
            "BUF".CHBUF.VAL:=#MIN;
        END_IF;
    16#0003: (* Set midpoint of range *)
        IF #FRC AND #INBUF THEN
            "BUF".CHBUF.VAL := #MIDLE;
        END_IF;
    16#0100: (* Read configuration to buffer *)
        "BUF".CHBUF.ID := #CHCFG.ID;
        "BUF".CHBUF.CLSID := #CHCFG.CLSID;
        
        "BUF".CHBUF.STA.%X0 := #CHCFG.STA.VRAW;
        "BUF".CHBUF.STA.%X1 := #CHCFG.STA.VALB;
        "BUF".CHBUF.STA.%X2 := #CHCFG.STA.BAD;
        "BUF".CHBUF.STA.%X3 := #CHCFG.STA.b3;
        "BUF".CHBUF.STA.%X4 := #CHCFG.STA.PNG;
        "BUF".CHBUF.STA.%X5 := #CHCFG.STA.ULNK;
        "BUF".CHBUF.STA.%X6 := #CHCFG.STA.MERR;
        "BUF".CHBUF.STA.%X7 := #CHCFG.STA.BRK;
        "BUF".CHBUF.STA.%X8 := #CHCFG.STA.SHRT;
        "BUF".CHBUF.STA.%X9 := #CHCFG.STA.NBD;
        "BUF".CHBUF.STA.%X10 := #CHCFG.STA.b10;
        "BUF".CHBUF.STA.%X11 := #CHCFG.STA.INIOTBUF;
        "BUF".CHBUF.STA.%X12 := #CHCFG.STA.INBUF;
        "BUF".CHBUF.STA.%X13 := #CHCFG.STA.FRC;
        "BUF".CHBUF.STA.%X14 := #CHCFG.STA.SML;
        "BUF".CHBUF.STA.%X15 := #CHCFG.STA.CMDLOAD;
        
        "BUF".CHBUF.VAL := #CHCFG.VAL;
        "BUF".CHBUF.VARID := #CHCFG.VARID;
    16#0300: (* Toggle force *)
        #FRC := NOT #FRC;
    16#0301: (* Enable force *)
        #FRC := true;
    16#0302: (* Disable force *)
        #FRC := false;
END_CASE;

/* Write variable value */
IF #FRC AND #INBUF THEN (* Forced mode with buffer occupied *)
    #CHCFG.VAL := "BUF".CHBUF.VAL;
ELSIF #FRC AND NOT #INBUF THEN (* Forced mode without buffer occupied *)
    ; (* no change *)
ELSIF NOT #FRC THEN (* Normal (non-forced) mode *)
    #CHCFG.VAL := #RAWINT;
END_IF;

/* Ping-pong */
#ULNK := #PNG; (* Ping received – connection with higher level present *)
#PNG := false; (* Reset PNG bit for PONG response *)
IF NOT #ULNK THEN
    #CHCFG.VARID := 0;
END_IF;

/* Reset processed commands */
#CMDLOAD := 0;
#CMD := 0;

/* Global system bits and counters */
IF #FRC THEN
    "SYS".PLCCFG.STA.FRC0 := true;
    "SYS".PLCCFG.CNTFRC := "SYS".PLCCFG.CNTFRC + 1;
END_IF;

#BAD := #BRK OR #SHRT;

/* Pack into STA */
#STA.VRAW := #RAWINT>0;
#STA.VALB := #CHCFG.VAL>0;
#STA.BAD := #BAD; (* externally managed *)
#STA.PNG := #PNG;
#STA.ULNK := #ULNK;
#STA.MERR := #MERR; (* externally managed *)
#STA.BRK := #BRK; (* externally managed *)
#STA.SHRT := #SHRT; (* externally managed *)
#STA.NBD := #NBD; (* externally managed *)
#STA.INBUF := #INBUF;
#STA.FRC := #FRC;
#STA.SML := #SML;
#STA.CMDLOAD := #CMDLOAD; (* bit-controlled *)

#CHCFG.STA := #STA;
#CHCFG.CMD := #CMD;

/* Pack into INT */
#STAINT.%X0 := #VRAW;
#STAINT.%X1 := #VAL;
#STAINT.%X2 := #BAD;
//#STAINT.%X3 := #b3;
#STAINT.%X4 := #PNG;
#STAINT.%X5 := #ULNK;
#STAINT.%X6 := #MERR;
#STAINT.%X7 := #BRK;
#STAINT.%X8 := #SHRT;
#STAINT.%X9 := #NBD;
//#STAINT.%X10 := #b10;
#STAINT.%X11 := #STA.INIOTBUF;
#STAINT.%X12 := #INBUF;
#STAINT.%X13 := #FRC;
#STAINT.%X14 := #SML;
#STAINT.%X15 := FALSE;

#CHHMI.STA := #STAINT;
#CHHMI.VAL := #CHCFG.VAL;

/* Update buffer */
IF #INBUF THEN
    "BUF".CHBUF.STA := #STAINT;
    "BUF".CHBUF.VARID := #CHCFG.VARID;
    "BUF".CHBUF.CMD := 0;
    IF NOT #FRC THEN
        "BUF".CHBUF.VAL := #CHCFG.VAL;
    END_IF;
END_IF;
```

### Usage Requirements

Should be called **before invoking `VAR`**.

## Testing CHAIFN

This section describes the **methodology for testing specific CHAIFN functions**. Other tests are described in the LVL0 Class Description.

### List of Tests

The test list is provided in the LVL0 Class Description.

### 1. Assignment of ID and CLSID at Startup

- Before starting the test, the PLC should be in STOP mode.
- After startup, all channels used in the program should receive their ID and CLSID.

### 2. Buffer Binding Commands

| Step | Test Action                                            | Expected Result                                              | Notes |
| ---- | ------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1    | Set `STA.X15=1` for one of the `CH_HMI` variables      | `CHBUF` should load the entire `CH_CFG` content.`STA.X15` in `CH_HMI` should reset to 0.`STA.12 (INBUF)` should be 1 in `CH_HMI`, `CH_CFG`, and `CHBUF`. |       |
| 2    | Change the variable value (e.g., `RAW` for DICH input) | The corresponding value should update in `CH_HMI`, `CH_CFG`, and `CHBUF`. |       |
| 3    | Set `STA.X15=1` for another `CH_HMI` variable          | `CHBUF` should load the entire `CH_CFG` content of the other variable. |       |
| 4    | Repeat step 1 using the command `CH_CFG.CMD=16#100`    | `CHBUF` should load the entire `CH_CFG` content.`STA.X15` in `CH_HMI` should reset to 0.`STA.12 (INBUF)` should be 1 in `CH_HMI`, `CH_CFG`, and `CHBUF`.`CH_CFG.CMD` should reset to zero. |       |

### 3. Operation in Non-Forced Mode

Validation should be performed across `CH_HMI`, `CH_CFG`, and `CH_BUF`.

| Step | Test Action                                            | Expected Result                                              | Notes                            |
| ---- | ------------------------------------------------------ | ------------------------------------------------------------ | -------------------------------- |
| 1    | Bind a test variable to the buffer                     | `CHBUF` should load the entire `CH_CFG` content.             |                                  |
| 2    | Change the variable value (e.g., `RAW` for DICH input) | The runtime and raw variable values should update in `CH_HMI`, `CH_CFG`, and `CHBUF` (for `CHDI` and `CHDO`). | See specific class test details. |
| 3    | Repeat step 2 with a different value                   |                                                              |                                  |

### 4. Operation in Forced Mode

Validation should be performed across `CH_HMI`, `CH_CFG`, and `CH_BUF`.

| Step | Test Action                                                  | Expected Result                                              | Notes                                               |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | --------------------------------------------------- |
| 1    | Bind a test variable to the buffer                           | `CHBUF` should load the entire `CH_CFG` content.             |                                                     |
| 2    | Change the input value to 0                                  | The value should change as in test 3.                        | Input for DICH, AICH: `RAW`; for DOCH, AOCH: `VAL`. |
| 3    | Send the force command `CHBUF.CMD=16#0301`                   | The `FRC` bit should become 1.                               |                                                     |
| 4    | Change the input value                                       | The output value should remain unchanged.                    | Input for DICH, AICH: `RAW`; for DOCH, AOCH: `VAL`. |
| 5    | Send command `16#0001` (write 1/MAX)                         | The value should update to 1/MAX.                            |                                                     |
| 6    | Send command `16#0002` (write 0/MIN)                         | The value should update to 0/MIN.                            |                                                     |
| 7    | Send command `16#0003` (TOGGLE/set midpoint of range)        | The value should toggle or set to the midpoint of the range. |                                                     |
| 8    | Change `CHBUF.VAL`                                           | The value should update to the specified value.              | For digital, any value >0 equals 1.                 |
| 9    | Send unforce command `CHBUF.CMD=16#0302`                     | The `FRC` bit should reset to 0.                             |                                                     |
| 10   | Send toggle force command `16#0300` repeatedly, leave in force mode | The `FRC` bit should toggle with each command.               |                                                     |
| 11   | Enable force mode for multiple variables                     | The `FRC` bit for the relevant variables should be 1.        |                                                     |
| 12   | Check `PLC.STA_PERM` and `PLC.CNTFRC_PERM` values            | `PLC.STA_PERM.X13` should be 1; `PLC.CNTFRC_PERM` should equal the number of forced variables. |                                                     |
| 13   | Remove force mode from all variables                         | `PLC.STA_PERM.X13` should be 0; `PLC.CNTFRC_PERM` should be 0. |                                                     |

### 5. Ping-Pong Test

- Use a variable for testing, e.g., `TST_CHDIPNGON` for `CHDI`.
- Specify the channel number using `TST_CHDIPNGID`.
- After calling the channel handler functions, call a test function that modifies `CH_CFG.PNG`:

```pascal
IF TST_CHDIPNGON THEN
    CHDI[TST_CHDIPNGID].STA.PNG := true;
    CHDI[TST_CHDIPNGID].VARID := TST_CHDIPNGID;
END_IF;
```

| Step | Test Action                                                  | Expected Result                                              | Notes |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1    | Write any value to `CH_CFG.VARID`                            | It should reset to zero since the variable is not bound.     |       |
| 2    | Set `TST_CHDIPNGID` within existing channel range, `TST_CHDIPNGON=TRUE` | `CH_CFG.VARID` should match the specified value; `CH_CFG.ULNK` should be `TRUE`. |       |
| 3    | Change `TST_CHDIPNGID` within existing range, `TST_CHDIPNGON=TRUE` | The previous channel should reset `CH_CFG.VARID` and `CH_CFG.ULNK`; the new channel should behave as in step 2. |       |
| 4    | Set `TST_CHDIPNGON=FALSE`                                    | The previous channel should reset `CH_CFG.VARID` and `CH_CFG.ULNK`. |       |

### 6. Sending Broadcast Force and Unforce Commands

| Step | Test Action                                       | Expected Result                                              | Notes |
| ---- | ------------------------------------------------- | ------------------------------------------------------------ | ----- |
| 1    | Send broadcast force command: `PLC.CMD=16#4301`   | `FRC` bit of all variables should be `1`; `PLC.CNTFRC_PERM` should equal the number of variables. |       |
| 2    | Send broadcast unforce command: `PLC.CMD=16#4302` | `FRC` bit of all variables should be `0`; `PLC.CNTFRC_PERM` should be `0`. |       |

