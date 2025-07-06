[PACFramework](../README_EN.md) > [1. Core Concepts](README_EN.md)

# 1.5 Recommendations for Naming PACFramework Components and Elements

## Naming Structure Elements

- Bit names within structures must be unique at the same nesting level. For example, if a structure has a field named `VAL`, the set of bit fields must not include the name `VAL`. This ensures consistent end-to-end naming.
- Prefixes:
  - Time-related variable attributes should begin with the prefix `T_`, for example, `T_STEP1`, `T_PREV`.

## Naming Process Variables (LVL1)

Process variables should preferably follow a three-level naming convention:

```
UNIT_INSTRUMENT_SIGNAL
```

- `UNIT`: the name of the plant, location, or equipment unit, needed for identifying automation means across different equipment groups.
- `INSTRUMENT`: identification of automation means according to the automation or P&ID diagrams. If the P&ID uses hierarchical naming, the first part (prefix) can occupy the `UNIT` position, and the second part (starting with the functional letter) can take the `INSTRUMENT` position. Instead of numeric P&ID loop identifiers, alternative loop symbols may be used. The framework does not regulate diagram identification rules, but it is recommended to use identifiers consistent with P&ID diagrams.
- `SIGNAL`: clarifying information about the signal, as the same automation means in a P&ID may have multiple inputs/outputs. It may be omitted if the device has only one signal connected to the PLC.

Examples:

```
T101_TT1          - temperature TT1 in tank T101
T101_TT1_PV       - temperature TT1 in tank T101 (alternative)
T101_LS1          - level switch
T101_LSH          - level switch (alternative)
T101_TV1_CPOS     - control output for valve TV1
T101_TV1_POS      - valve TV1 current position
```

If a process variable is reserved for future use, it is recommended to use the following naming templates:

```
REZDI1   - reserved DIVAR
REZDI22  - reserved DIVAR
REZAI1   - reserved AIVAR
REZDO1   - reserved DOVAR
REZAO1   - reserved AOVAR
```

### Suffix Recommendations

All suffixes for **output signals** should begin with the letter `C`, while **input signals** should not begin with `C`.

**DI (Digital Inputs)**

- ALM: alarm status, e.g., `T101_TY1_ALM` - frequency converter alarm signal
- LSTP: “Local Stop” button pressed
- PWR: control circuit power available
- RDY: device ready
- RMT: local/remote switch status
- RUN: device operating
- SCLS: closed position
- SOPN: open position
- SPDC: discrete speed sensor contact (e.g., inductive)
- WRN: warning status
- WRK: device operating

**AI (Analog Inputs)**

- ECUR: motor current
- POS: actuator position
- PV: process variable (current value)
- SPD: actual speed/frequency

**DO (Digital Outputs)**

- CBWR: move backward (motion control)
- CCLS: command close
- CFRW: move forward (motion control)
- COPN: command open (or open/close)
- CRMT: enable/disable remote control
- CRVRS: reverse control or reverse/stop
- CSTRT: start control or start/stop
- CSTP: stop control
- CUP: increase command (can use COPN)
- CDN: decrease command (can use CCLS)
- CBLK: remote block command
- CCLR: alarm reset command

**AO (Analog Outputs)**

- CSPD: set speed/frequency
- CPOS: set actuator position



<-- [1.4 General requirements for the implementation of the PACFramework interface](1_4_if_en.md)

--> [1.6. The concept of classification and customization of objects](classes_en.md)
