

# Class CHDO (Discrete Output Channel)

**CLSID=16#002x**

## General Description

Implements the functionality for working with a **physical discrete output** on a **local PLC** or a **distributed I/O device**.

The structure of the `CH_CFG` and `CH_HMI` variables is provided in the Class Structure.

## Function `CHDOFN`

### Functional Requirements

General functional requirements are described in the LVL0 Class Requirements.

### Interface Implementation Requirements

Requirements for interface implementation are described in the LVL0 Class Requirements.

### User Program Implementation Requirements

Example for **TIA Portal**:

```pascal
// Working with IOT buffer
"CHIOTFN"(CHCFG := #CHCFG, RAWINT := #tmp);

#STA := #CHCFG.STA;
#CMD := #CHCFG.CMD;

// Unpacking from STA
#VRAW := #STA.VRAW;
#VAL := #STA.VALB;
#BAD := #STA.BAD; // externally controlled
#PNG := #STA.PNG;
#ULNK := #STA.ULNK;
#MERR := #STA.MERR; // externally controlled
#BRK := #STA.BRK;   // externally controlled
#SHRT := #STA.SHRT; // externally controlled
#NBD := #STA.NBD;   // externally controlled
#INBUF := #STA.INBUF;
#FRC := #STA.FRC;
#SML := #STA.SML;
#CMDLOAD := #STA.CMDLOAD; // bit controlled
#INBUF := (#CHCFG.ID = "BUF".CHBUF.ID) AND (#CHCFG.CLSID = "BUF".CHBUF.CLSID);
#CMDLOAD := #CHHMI.STA.%X15;

#CMD := 0;

// Command handler
// Broadcast force/unforce
IF "SYS".PLCCFG.CMD = 16#4301 THEN
    #FRC := true; // force one/all objects of this type
END_IF;
IF "SYS".PLCCFG.CMD = 16#4302 THEN
    #FRC := false; // unforce object of this type
END_IF;

// Command source selection by priority
IF #CMDLOAD THEN // from HMI CMDLOAD
    #CMD := 16#0100; // read into buffer
ELSIF #INBUF AND "BUF".CHBUF.CMD <> 0 THEN // from buffer
    #CMD := "BUF".CHBUF.CMD;
ELSIF #CHCFG.CMD <> 0 THEN
    #CMD := #CHCFG.CMD;
END_IF;

// Command execution
CASE #CMD OF
    16#0001: // Write 1
        IF #FRC AND #INBUF THEN
            "BUF".CHBUF.VAL := 1;
        END_IF;
    16#0002: // Write 0
        IF #FRC AND #INBUF THEN
            "BUF".CHBUF.VAL := 0;
        END_IF;
    16#0003: // TOGGLE
        IF #FRC AND #INBUF THEN
            IF #VRAW THEN
                "BUF".CHBUF.VAL := 0;
            ELSE
                "BUF".CHBUF.VAL := 1;
            END_IF;
        END_IF;
    16#0100: // Read configuration into buffer
        "BUF".CHBUF.ID := #CHCFG.ID;
        "BUF".CHBUF.CLSID := #CHCFG.CLSID;
        "BUF".CHBUF.STA := #CHCFG.STA;
        "BUF".CHBUF.VAL := #CHCFG.VAL;
        "BUF".CHBUF.VARID := #CHCFG.VARID;
    16#0300: // Toggle force
        #FRC := NOT #FRC;
    16#0301: // Force ON
        #FRC := true;
    16#0302: // Force OFF
        #FRC := false;
END_CASE;

// Writing variable values
IF #FRC AND #INBUF THEN // Forced mode with buffer occupied
    #CHCFG.VAL := BOOL_TO_INT("BUF".CHBUF.VAL > 0);
    #VRAW := #CHCFG.VAL > 0.5;
ELSIF #FRC AND NOT #INBUF THEN // Forced mode without buffer
    // no changes
ELSIF NOT #FRC THEN // Normal mode
    #VRAW := #VAL;
    IF #VAL THEN
        #CHCFG.VAL := 1;
    ELSE
        #CHCFG.VAL := 0;
    END_IF;
END_IF;

#RAW := #VRAW; // Output to the physical channel

// Ping-pong mechanism
#ULNK := #PNG;
#PNG := false;
IF NOT #ULNK THEN
    #CHCFG.VARID := 0;
END_IF;

// Reset processed commands
#CMDLOAD := 0;
#CMD := 0;

// System-wide flags and counters
IF #FRC THEN
    "SYS".PLCCFG.STA.FRC0 := true;
    "SYS".PLCCFG.CNTFRC := "SYS".PLCCFG.CNTFRC + 1;
END_IF;

// Pack into STA
#STA.VRAW := #VRAW;
#STA.VALB := #VAL;
#STA.BAD := #BAD;     // externally controlled
#STA.PNG := #PNG;
#STA.ULNK := #ULNK;
#STA.MERR := #MERR;   // externally controlled
#STA.BRK := #BRK;     // externally controlled
#STA.SHRT := #SHRT;   // externally controlled
#STA.NBD := #NBD;     // externally controlled
#STA.INBUF := #INBUF;
#STA.FRC := #FRC;
#STA.SML := #SML;
#STA.CMDLOAD := #CMDLOAD;

#CHCFG.STA := #STA;
#CHCFG.CMD := #CMD;

// Pack into INT
#STAINT := #STA AS INT;

#CHHMI.STA := #STAINT;
#CHHMI.VAL := #CHCFG.VAL;

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

Used **before calling VAR**.

## Testing `CHDOFN`

This section describes the **testing methodology for the specific functions of `CHDOFN`**. Other tests are described in the LVL0 Class Description.

### Test List

The test list is provided in the LVL0 Class Description.

### 1 Assignment of ID and CLSID on Startup

- Before testing, the PLC must be in STOP.
- After startup, all channels used in the program must have assigned IDs and CLSIDs.

### 2 Buffer Binding Commands

| Step | Action to Test                                           | Expected Result                                              | Notes |
| ---- | -------------------------------------------------------- | ------------------------------------------------------------ | ----- |
| 1    | Set `STA.X15=1` for one of the `CH_HMI` variables        | `CHBUF` should be loaded with the entire content of `CH_CFG`.`STA.X15` in `CH_HMI` should reset to 0.`STA.12 (INBUF)` should be 1 in `CH_HMI`, `CH_CFG`, and `CHBUF`. |       |
| 2    | Change the variable value (e.g., `RAW` for `DICH` input) | The corresponding value should update in `CH_HMI`, `CH_CFG`, and `CHBUF`. |       |
| 3    | Set `STA.X15=1` for another `CH_HMI` variable            | `CHBUF` should be loaded with the entire content of the new variable’s `CH_CFG`. |       |
| 4    | Repeat step 1 using `CH_CFG.CMD=16#100`                  | `CHBUF` should be loaded with the entire content of `CH_CFG`.`STA.X15` in `CH_HMI` should reset to 0.`STA.12 (INBUF)` should be 1 in `CH_HMI`, `CH_CFG`, and `CHBUF`.`CH_CFG.CMD` should reset to 0. |       |

### 3 Operation in Non-Forced Mode

Verification should be performed across `CH_HMI`, `CH_CFG`, and `CH_BUF`.

| Step | Action to Test                                           | Expected Result                                              | Notes                            |
| ---- | -------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------- |
| 1    | Bind a test variable to the buffer                       | `CHBUF` should be loaded with the full content of `CH_CFG`.  |                                  |
| 2    | Change the variable value (e.g., `RAW` for `DICH` input) | The live value and raw value should update in `CH_HMI`, `CH_CFG`, and `CHBUF` (`CHDI`, `CHDO`). | See specific class test details. |
| 3    | Repeat step 2 with a different value                     |                                                              |                                  |

### 4 Operation in Forced Mode

Verification should be performed across `CH_HMI`, `CH_CFG`, and `CH_BUF`.

| Step | Action to Test                                               | Expected Result                                              | Notes                                                       |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----------------------------------------------------------- |
| 1    | Bind a test variable to the buffer                           | `CHBUF` should be loaded with the full content of `CH_CFG`.  |                                                             |
| 2    | Set the input value to 0                                     | The value should update as in test 3.                        | Input for `DICH`, `AICH`: `RAW`; for `DOCH`, `AOCH`: `VAL`. |
| 3    | Send force command `CHBUF.CMD=16#0301`                       | `FRC` bit should be set to 1.                                |                                                             |
| 4    | Change the input value                                       | The output value should remain unchanged.                    | Input for `DICH`, `AICH`: `RAW`; for `DOCH`, `AOCH`: `VAL`. |
| 5    | Send command `16#0001` (write 1/MAX)                         | The value should change to 1/MAX.                            |                                                             |
| 6    | Send command `16#0002` (write 0/MIN)                         | The value should change to 0/MIN.                            |                                                             |
| 7    | Send command `16#0003` (TOGGLE/set midpoint of range)        | The value should toggle or set to the midpoint of the range. |                                                             |
| 8    | Change the value of `CHBUF.VAL`                              | The value should change to the specified value.              | For discrete: any value >0 equals 1.                        |
| 9    | Send unforce command `CHBUF.CMD=16#0302`                     | `FRC` bit should be reset to 0.                              |                                                             |
| 10   | Send toggle force command `16#0300` repeatedly, leave in forced mode | `FRC` bit should toggle accordingly.                         |                                                             |
| 11   | Enable forced mode for multiple variables                    | `FRC` bit should be set to 1 for the corresponding variables. |                                                             |
| 12   | Check `PLC.STA_PERM` and `PLC.CNTFRC_PERM` variables         | `PLC.STA_PERM.X13` should be 1; `PLC.CNTFRC_PERM` should equal the number of forced variables. |                                                             |
| 13   | Disable forced mode for all variables                        | `PLC.STA_PERM.X13` should be 0; `PLC.CNTFRC_PERM` should be 0. |                                                             |

### 5 Ping-Pong Verification

- For testing, use a test variable, e.g., `TST_CHDIPNGON` for `CHDI`.
- Specify the channel number using `TST_CHDIPNGID`.
- After calling the channel handler functions, call the test function to modify one of the `CH_CFG.PNG` values.

```pascal
IF TST_CHDIPNGON THEN
    CHDI[TST_CHDIPNGID].STA.PNG := true;
    CHDI[TST_CHDIPNGID].VARID := TST_CHDIPNGID;
END_IF;
```

| Step | Action to Test                                               | Expected Result                                              | Notes |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1    | Write any value into `CH_CFG.VARID`                          | It should reset since the variable is not linked.            |       |
| 2    | Set `TST_CHDIPNGID` within existing channel range, set `TST_CHDIPNGON=TRUE` | For the specified variable, `CH_CFG.VARID` should match the specified value, `CH_CFG.ULNK` should be TRUE. |       |
| 3    | Change `TST_CHDIPNGID` within channel range, set `TST_CHDIPNGON=TRUE` | The previous channel should clear `CH_CFG.VARID` and `CH_CFG.ULNK`; the new channel should reflect the step 2 result. |       |
| 4    | Set `TST_CHDIPNGON=false`                                    | The previous channel should clear `CH_CFG.VARID` and `CH_CFG.ULNK`. |       |

### 6 Sending Broadcast Force/Unforce Commands

| Step | Action to Test                                               | Expected Result                                              | Notes |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1    | Send broadcast force command `PLC.CMD=16#4301` to all variables | `FRC` bit of all variables should be 1; `PLC.CNTFRC_PERM` should equal the number of variables. |       |
| 2    | Send broadcast unforce command `PLC.CMD=16#4302` to all variables | `FRC` bit of all variables should be 0; `PLC.CNTFRC_PERM` should be 0. |       |

