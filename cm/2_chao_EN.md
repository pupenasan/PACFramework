

# CHAO Class (Analog Output Channel)

## Classes

A general template for all classes with **CLSID=16#004x**. Recommended class values:

- 16#0040 – general class without signal type specification
- 16#0041 – 4..20 mA
- 16#0042 – 0..20 mA
- 16#0043 – 0..10 V

Other classes can be defined as needed.

## General Description

Implements functionality for working with a **physical analog output** on a local PLC or distributed I/O device.

The structure of the `CH_CFG` and `CH_HMI` variables is provided in the Class Structure Description.

## CHAOFN Function

### Functional Requirements

- General functional requirements are described in the LVL0 Class Requirements.
- The function should support `MIN` and `MAX` values to enable straightforward forced value control. The separation between `MIN` and `MAX` may be defined by the CHAOFN subclass.

### Interface Implementation Requirements

Requirements are described in the LVL0 Class Requirements.

### User Program Implementation Requirements

TIA Portal example:

```pascal
// Work with IOT buffer
"CHIOTFN"(CHCFG:=#CHCFG, RAWINT:=#RAWINT);

#STA := #CHCFG.STA;
#CMD := #CHCFG.CMD;

// Unpack from STA
#VRAW := #STA.VRAW;
#VAL := #STA.VALB;
#BAD := #STA.BAD; (* externally controlled *)
#PNG := #STA.PNG;
#ULNK := #STA.ULNK;
#MERR := #STA.MERR; (* externally controlled *)
#BRK := #STA.BRK;   (* externally controlled *)
#SHRT := #STA.SHRT; (* externally controlled *)
#NBD := #STA.NBD;   (* externally controlled *)
#INBUF := #STA.INBUF;
#FRC := #STA.FRC;
#SML := #STA.SML;
#CMDLOAD := #STA.CMDLOAD; (* bit-controlled *)
#INBUF := (#CHCFG.ID = "BUF".CHBUF.ID) AND (#CHCFG.CLSID = "BUF".CHBUF.CLSID);
#CMDLOAD := #CHHMI.STA.%X15;
#CMD := 0;

// Command handler
// Broadcast force/unforce
IF "SYS".PLCCFG.CMD=16#4301 THEN
    #FRC := true; (* force one/all objects of this type *)
END_IF;
IF "SYS".PLCCFG.CMD=16#4302 THEN
    #FRC := false; (* unforce object of this type *)
END_IF;

// Select command source by priority
IF #CMDLOAD THEN
    #CMD := 16#0100;  // write to buffer
ELSIF #INBUF AND "BUF".CHBUF.CMD <> 0 THEN
    #CMD := "BUF".CHBUF.CMD;
ELSIF #CHCFG.CMD<>0 THEN
    #CMD := #CHCFG.CMD;
END_IF;

// Commands
CASE #CMD OF
    16#0001: (* write MAX *)
        IF #FRC AND #INBUF THEN
            #RAWINT := #MAX;
        END_IF;
    16#0002: (* write MIN *)
        IF #FRC AND #INBUF THEN
            #RAWINT := #MIN;
        END_IF;
    16#0003: (* set to mid-range *)
        IF #FRC AND #INBUF THEN
            #RAWINT := #MIDLE;
        END_IF;
    16#0100: (* read configuration into buffer *)
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
    16#0300: (* toggle force *)
        #FRC := NOT #FRC;
    16#0301: (* enable force *)
        #FRC := true;
    16#0302: (* disable force *)
        #FRC := false;
END_CASE;

// Variable value writing
IF #FRC AND #INBUF THEN
    #RAWINT := "BUF".CHBUF.VAL;
ELSIF #FRC AND NOT #INBUF THEN
    ; (* no change *)
ELSIF NOT #FRC THEN
    #RAWINT := #CHCFG.VAL;
END_IF;

// Ping-pong mechanism
#ULNK := #PNG; (* ping received - linked to upper level *)
#PNG := false; (* reset PNG bit as pong response *)
IF NOT #ULNK THEN
    #CHCFG.VARID := 0;
END_IF;

// Reset processed commands
#CMDLOAD := 0;
#CMD := 0;

// System bits and counters
IF #FRC THEN
    "SYS".PLCCFG.STA.FRC0 := true;
    "SYS".PLCCFG.CNTFRC := "SYS".PLCCFG.CNTFRC + 1;
END_IF;

#BAD := #BRK OR #SHRT;

// Pack into STA
#STA.VRAW := #RAWINT>0;
#STA.VALB := #CHCFG.VAL>0;
#STA.BAD := #BAD;
#STA.PNG := #PNG;
#STA.ULNK := #ULNK;
#STA.MERR := #MERR;
#STA.BRK := #BRK;
#STA.SHRT := #SHRT;
#STA.NBD := #NBD;
#STA.INBUF := #INBUF;
#STA.FRC := #FRC;
#STA.SML := #SML;
#STA.CMDLOAD := #CMDLOAD;

#CHCFG.STA := #STA;
#CHCFG.CMD := #CMD;

// Pack into INT
#STAINT.%X0 := #VRAW;
#STAINT.%X1 := #VAL;
#STAINT.%X2 := #BAD;
#STAINT.%X4 := #PNG;
#STAINT.%X5 := #ULNK;
#STAINT.%X6 := #MERR;
#STAINT.%X7 := #BRK;
#STAINT.%X8 := #SHRT;
#STAINT.%X9 := #NBD;
#STAINT.%X11 := #STA.INIOTBUF;
#STAINT.%X12 := #INBUF;
#STAINT.%X13 := #FRC;
#STAINT.%X14 := #SML;
#STAINT.%X15 := FALSE;

#CHHMI.STA := #STAINT;
#CHHMI.VAL := #RAWINT;

// Buffer update
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

Used after calling `VAR`.

## Testing CHAOFN

This section describes the **testing methodology for the specific functions of CHAOFN**. Other tests are described in the LVL0 Class Description.

### List of Tests

The list is provided in the LVL0 Class Description.

### 1. Assignment of ID and CLSID at Startup

- The PLC must be in STOP before starting the test.
- After startup, all channels used in the program must be assigned their `ID` and `CLSID`.

### 2. Buffer Linking Commands

| Step Number | Test Action                                            | Expected Result                                              | Notes |
| ----------- | ------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1           | Set `STA.X15=1` for one of the `CH_HMI` variables      | The entire `CH_CFG` content should be loaded into `CHBUF`.  `STA.X15` in `CH_HMI` should reset to 0.  `STA.12 (INBUF)` should be 1 in `CH_HMI`, `CH_CFG`, and `CHBUF`. |       |
| 2           | Change the variable value (e.g., `RAW` for DICH input) | The updated value should appear in `CH_HMI`, `CH_CFG`, and `CHBUF`. |       |
| 3           | Set `STA.X15=1` for another `CH_HMI` variable          | The entire `CH_CFG` content of the new variable should load into `CHBUF`. |       |
| 4           | Repeat step 1 using `CH_CFG.CMD=16#100`                | The entire `CH_CFG` content should load into `CHBUF`.  `STA.X15` in `CH_HMI` should reset to 0.  `STA.12 (INBUF)` should be 1 in `CH_HMI`, `CH_CFG`, and `CHBUF`.  `CH_CFG.CMD` should reset to 0. |       |

### 3. Operation in Non-Forced Mode

Values should be checked in `CH_HMI`, `CH_CFG`, and `CH_BUF`.

| Step Number | Test Action                                            | Expected Result                                              | Notes                                     |
| ----------- | ------------------------------------------------------ | ------------------------------------------------------------ | ----------------------------------------- |
| 1           | Link a test variable to the buffer                     | The entire `CH_CFG` content should load into `CHBUF`.        |                                           |
| 2           | Change the variable value (e.g., `RAW` for DICH input) | The live and raw values should update in `CH_HMI`, `CH_CFG`, and `CHBUF` (for `CHDI` and `CHDO`). | See detailed tests for the specific class |
| 3           | Repeat step 2 with another value                       |                                                              |                                           |

### 4. Operation in Forced Mode

Values should be checked in `CH_HMI`, `CH_CFG`, and `CH_BUF`.

| Step Number | Test Action                                                  | Expected Result                                              | Notes                                                  |
| ----------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------ |
| 1           | Link a test variable to the buffer                           | The entire `CH_CFG` content should load into `CHBUF`.        |                                                        |
| 2           | Change the input value to 0                                  | The value should change as in test 3.                        | Input value: `RAW` for DICH/AICH, `VAL` for DOCH/AOCH. |
| 3           | Send the force command `CHBUF.CMD=16#0301`                   | The `FRC` bit should be 1.                                   |                                                        |
| 4           | Change the input value                                       | The output value should remain unchanged.                    | Input value: `RAW` for DICH/AICH, `VAL` for DOCH/AOCH. |
| 5           | Send command `16#0001` (write 1/MAX)                         | The value should change to 1/MAX.                            |                                                        |
| 6           | Send command `16#0002` (write 0/MIN)                         | The value should change to 0/MIN.                            |                                                        |
| 7           | Send command `16#0003` (TOGGLE/set to mid-range)             | The value should toggle or change to mid-range.              |                                                        |
| 8           | Change the `CHBUF.VAL` value                                 | The value should update to the specified value.              | For discrete, any value >0 equals 1.                   |
| 9           | Send the unforce command `CHBUF.CMD=16#0302`                 | The `FRC` bit should be 0.                                   |                                                        |
| 10          | Send the toggle force command `16#0300` repeatedly, leaving in forced mode | The `FRC` bit should toggle accordingly.                     |                                                        |
| 11          | Force multiple variables into forced mode                    | The `FRC` bits for these variables should be 1.              |                                                        |
| 12          | Check `PLC.STA_PERM` and `PLC.CNTFRC_PERM`                   | `PLC.STA_PERM.X13` should be 1, and `PLC.CNTFRC_PERM` should match the number of forced variables. |                                                        |
| 13          | Unforce all variables                                        | `PLC.STA_PERM.X13` should be 0, and `PLC.CNTFRC_PERM` should be 0. |                                                        |

### 5. Ping-Pong Check

- A test variable (e.g., `TST_CHDIPNGON` for `CHDI`) is used to run the test.
- Channel number is set via `TST_CHDIPNGID`.
- After the channel handler functions are called, a test function triggers a change in `CH_CFG.PNG`:

```pascal
IF TST_CHDIPNGON THEN
    CHDI[TST_CHDIPNGID].STA.PNG := true;
    CHDI[TST_CHDIPNGID].VARID := TST_CHDIPNGID;
END_IF;
```

| Step Number | Test Action                                                  | Expected Result                                              | Notes |
| ----------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1           | Write a value into `CH_CFG.VARID`                            | It should reset to 0 since the variable is not linked.       |       |
| 2           | Set `TST_CHDIPNGID` within valid channel range and `TST_CHDIPNGON=TRUE` | For the specified variable, `CH_CFG.VARID` should equal the set value, and `CH_CFG.ULNK` should be TRUE. |       |
| 3           | Change `TST_CHDIPNGID` to another valid channel and set `TST_CHDIPNGON=TRUE` | The previous channel should clear `CH_CFG.VARID` and `CH_CFG.ULNK`. The new channel should match the result in step 2. |       |
| 4           | Set `TST_CHDIPNGON=FALSE`                                    | The last channel should clear `CH_CFG.VARID` and `CH_CFG.ULNK`. |       |

### 6. Sending Broadcast Force and Unforce Commands

| Step Number | Test Action                                        | Expected Result                                              | Notes |
| ----------- | -------------------------------------------------- | ------------------------------------------------------------ | ----- |
| 1           | Send a broadcast force command `PLC.CMD=16#4301`   | The `FRC` bit for all variables should be 1; `PLC.CNTFRC_PERM` should match the number of variables. |       |
| 2           | Send a broadcast unforce command `PLC.CMD=16#4302` | The `FRC` bit for all variables should be 0; `PLC.CNTFRC_PERM` should be 0. |       |

