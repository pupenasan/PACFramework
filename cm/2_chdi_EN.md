# CHDI Class (Digital Input Channel)

**CLSID = 16#001x**

## General Description

Implements handling of a **physical digital input** on a local PLC or distributed I/O device.

The `CH_CFG` and `CH_HMI` variable structures are provided in the Class Structures.

## Function `CHDIFN`

### Functional Requirements

General functional requirements are described in the LVL0 Classes Requirements.

### Interface Implementation Requirements

These are described in the LVL0 Classes Requirements.

### User Program Implementation Requirements

#### Example (TIA Portal):

```pascal
// IoT buffer handling
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
#BRK := #STA.BRK; // externally controlled
#SHRT := #STA.SHRT; // externally controlled
#NBD := #STA.NBD; // externally controlled
#INBUF := #STA.INBUF;
#FRC := #STA.FRC;
#SML := #STA.SML := "SYS".PLCCFG.STA.SMLALL;
#CMDLOAD := #STA.CMDLOAD; // controlled by bit
#INBUF := (#CHCFG.ID = "BUF".CHBUF.ID) AND (#CHCFG.CLSID = "BUF".CHBUF.CLSID);
#CMDLOAD := #CHHMI.STA.%X15;
#CMD := 0;

// Command handler
// Broadcast force/unforce
IF "SYS".PLCCFG.CMD = 16#4301 THEN
    #FRC := true;
END_IF;
IF "SYS".PLCCFG.CMD = 16#4302 THEN
    #FRC := false;
END_IF;

// Command source priority
IF #CMDLOAD THEN
    #CMD := 16#0100; // write to buffer
ELSIF #INBUF AND "BUF".CHBUF.CMD <> 0 THEN
    #CMD := "BUF".CHBUF.CMD;
ELSIF #CHCFG.CMD <> 0 THEN
    #CMD := #CHCFG.CMD;
END_IF;

// Command execution
CASE #CMD OF
    16#0001: // write 1
        IF #FRC AND #INBUF THEN
            "BUF".CHBUF.VAL := 1;
        END_IF;
    16#0002: // write 0
        IF #FRC AND #INBUF THEN
            "BUF".CHBUF.VAL := 0;
        END_IF;
    16#0003: // TOGGLE
        IF #FRC AND #INBUF THEN
            IF #VAL THEN
                "BUF".CHBUF.VAL := 0;
            ELSE
                "BUF".CHBUF.VAL := 1;
            END_IF;
        END_IF;
    16#0100: // read configuration to buffer
        "BUF".CHBUF.ID := #CHCFG.ID;
        "BUF".CHBUF.CLSID := #CHCFG.CLSID;
        "BUF".CHBUF.STA := #CHCFG.STA; // bit-wise assignment if needed
        "BUF".CHBUF.VAL := #CHCFG.VAL;
        "BUF".CHBUF.VARID := #CHCFG.VARID;
    16#0300: // toggle force
        #FRC := NOT #FRC;
    16#0301: // enable force
        #FRC := true;
    16#0302: // disable force
        #FRC := false;
END_CASE;

// Value handling
IF #FRC AND #INBUF THEN
    #CHCFG.VAL := BOOL_TO_INT("BUF".CHBUF.VAL > 0);
    #VAL := #CHCFG.VAL > 0.5;
ELSIF #FRC AND NOT #INBUF THEN
    // Do nothing, retain previous value
ELSIF #SML THEN
    // Simulation mode, external value change
ELSE
    // Normal mode
    #VAL := #RAW;
    IF #RAW THEN
        #CHCFG.VAL := 1;
    ELSE
        #CHCFG.VAL := 0;
    END_IF;
END_IF;

// Ping-Pong handling
#ULNK := #PNG;
#PNG := false;
IF NOT #ULNK THEN
    #CHCFG.VARID := 0;
END_IF;

// Reset processed commands
#CMDLOAD := 0;
#CMD := 0;

// System status and counters
IF #FRC THEN
    "SYS".PLCCFG.STA.FRC0 := true;
    "SYS".PLCCFG.CNTFRC := "SYS".PLCCFG.CNTFRC + 1;
END_IF;

// Pack into STA
#STA.VRAW := #RAW;
#STA.VALB := #VAL;
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

// Pack into INT for HMI
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

To be executed **before calling `VAR` functions**.

## Testing `CHDIFN`

This section describes the methodology for testing **specific `CHDIFN` functions**. Additional tests are provided in the LVL0 Class Description.

### Test List

The complete list is available in the LVL0 Class Description.

### 1. ID and CLSID Assignment at Startup

- Before testing, ensure the PLC is in STOP.
- After startup, all channels used in the program should have their `ID` and `CLSID` assigned.

### 2. Buffer Binding Commands

| Step | Action                                             | Expected Result                                              | Notes |
| ---- | -------------------------------------------------- | ------------------------------------------------------------ | ----- |
| 1    | Set `STA.X15 = 1` for a `CH_HMI` variable          | Entire `CH_CFG` content should load into `CHBUF`. `CH_HMI` should reset `STA.X15 = 0`.`STA.12 (INBUF) = 1` should be `TRUE` in `CH_HMI`, `CH_CFG`, and `CHBUF`. |       |
| 2    | Change a variable value (e.g., `DICH` input `RAW`) | The value should update in `CH_HMI`, `CH_CFG`, and `CHBUF`.  |       |
| 3    | Set `STA.X15 = 1` for another `CH_HMI` variable    | Entire `CH_CFG` content of the new variable should load into `CHBUF`. |       |
| 4    | Repeat step 1 using `CH_CFG.CMD = 16#100`          | Same as step 1; `CH_CFG.CMD` should reset to `0` afterward.  |       |

### 3. Operation in Non-Forced Mode

Tests should verify values in `CH_HMI`, `CH_CFG`, and `CH_BUF`.

| Step | Action                                             | Expected Result                                              | Notes                           |
| ---- | -------------------------------------------------- | ------------------------------------------------------------ | ------------------------------- |
| 1    | Bind a test variable to the buffer                 | Entire `CH_CFG` content should load into `CHBUF`.            |                                 |
| 2    | Change a variable value (e.g., `DICH` input `RAW`) | The live and raw values should update in `CH_HMI`, `CH_CFG`, and `CH_BUF` (`CHDI`/`CHDO`). | See specific class test details |
| 3    | Repeat step 2 with a different value               |                                                              |                                 |

### 4. Operation in Forced Mode

Tests should verify values in `CH_HMI`, `CH_CFG`, and `CH_BUF`.

| Step | Action                                                       | Expected Result                                              | Notes                                                     |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | --------------------------------------------------------- |
| 1    | Bind a test variable to the buffer                           | Entire `CH_CFG` content should load into `CHBUF`.            |                                                           |
| 2    | Change input value to `0`                                    | Value should change as in Test 3.                            | Input for `DICH`/`AICH`: `RAW`; for `DOCH`/`AOCH`: `VAL`. |
| 3    | Send force command `CHBUF.CMD = 16#0301`                     | `FRC` bit should be `1`.                                     |                                                           |
| 4    | Change input value                                           | Output should remain unchanged.                              | Same as step 2.                                           |
| 5    | Send command `16#0001` (write `1/MAX`)                       | Value should change to `1/MAX`.                              |                                                           |
| 6    | Send command `16#0002` (write `0/MIN`)                       | Value should change to `0/MIN`.                              |                                                           |
| 7    | Send command `16#0003` (TOGGLE/set mid-range)                | Value should toggle or set to mid-range.                     |                                                           |
| 8    | Change `CHBUF.VAL` value                                     | Value should change to the specified value (`>0` becomes `1` for digital). |                                                           |
| 9    | Send unforce command `CHBUF.CMD = 16#0302`                   | `FRC` bit should reset to `0`.                               |                                                           |
| 10   | Send toggle force command `16#0300` multiple times, leaving in forced mode | `FRC` bit should toggle accordingly.                         |                                                           |
| 11   | Force multiple variables                                     | `FRC` bit for each variable should be `1`.                   |                                                           |
| 12   | Check `PLC.STA_PERM` and `PLC.CNTFRC_PERM` values            | `PLC.STA_PERM.X13 = 1`; `PLC.CNTFRC_PERM` should equal the count of forced variables. |                                                           |
| 13   | Unforce all variables                                        | `PLC.STA_PERM.X13 = 0`; `PLC.CNTFRC_PERM = 0`.               |                                                           |

### 5. Ping-Pong Verification

- Use a test variable, e.g., `TST_CHDIPNGON` for `CHDI`.
- Set the channel number using `TST_CHDIPNGID`.
- After calling channel handler functions, call the test function to modify `CH_CFG.PNG`:

```pascal
IF TST_CHDIPNGON THEN
    CHDI[TST_CHDIPNGID].STA.PNG := true;
    CHDI[TST_CHDIPNGID].VARID := TST_CHDIPNGID;
END_IF;
```

| Step | Action                                                       | Expected Result                                              | Notes |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ----- |
| 1    | Write a value to `CH_CFG.VARID`                              | Should reset to `0` since the variable is unlinked.          |       |
| 2    | Set `TST_CHDIPNGID` within existing channels, `TST_CHDIPNGON = TRUE` | For the specified variable, `CH_CFG.VARID` should match the value, `CH_CFG.ULNK` should be `TRUE`. |       |
| 3    | Change `TST_CHDIPNGID`, `TST_CHDIPNGON = TRUE`               | Previous channel should reset `CH_CFG.VARID` and `ULNK`, new channel should match step 2. |       |
| 4    | Set `TST_CHDIPNGON = FALSE`                                  | Previous channel should reset `CH_CFG.VARID` and `ULNK`.     |       |

### 6. Sending Broadcast Force/Unforce Commands

| Step | Action                                             | Expected Result                                              | Notes |
| ---- | -------------------------------------------------- | ------------------------------------------------------------ | ----- |
| 1    | Send broadcast force command `PLC.CMD = 16#4301`   | `FRC` bit of all variables should be `1`, `PLC.CNTFRC_PERM` should equal the variable count. |       |
| 2    | Send broadcast unforce command `PLC.CMD = 16#4302` | `FRC` bit of all variables should be `0`, `PLC.CNTFRC_PERM = 0`. |       |

