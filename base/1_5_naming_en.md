[PACFramework](../README_EN.md) > [1. Main ideas](README_EN.md)

This text was translated using Google Translate. You can comment on the translation in [this topic](https://github.com/pupenasan/PACFramework/issues/52)

# 1.5. Recommendations for naming the components and elements of the frame

## Names of structure elements

- the names of bits in the structures must be unique within one level of nesting. For example, if the structure has a VAL field, then the set of bit fields cannot include the VAL name. Made for end-to-end naming
- prefixes:
   - temporal attributes of variables must start with the prefix `T_`, for example ` T_STEP1`, `T_PREV`

## Name of process variables (LVL1)

- the name of process variables is recommended to give in a three-level version:

````
UNIT_INSTRUMENT_SIGNAL
````

`UNIT` - the name of the plant, location, unit of equipment, etc., required to identify automation instrument in different groups of equipment

`INSTRUMENT` - identification of automation instrument according to the P&ID. If the P&ID provides a hierarchical name, the first part (prefix) can be placed in the position `UNIT`, the second (starting with the function letter) becomes the position ` INSTRUMENT`. You can use alternate outline characters instead of P&ID outlines. The framework does not regulate the rules of identification of instruments on diagrams, but it is recommended to use exactly those identifiers which are used in P&ID digrams.

`SIGNAL` - clarifying signal information, as the same instrument in the P&ID loop may have multiple inputs/outputs. Can be omitted if the tool has only one communication signal with the PLC.     

Examples:

```
T101_TT1 - temperature TT1 in the tank T101
T101_TT1_PV - temperature TT1 in the tank T101 (alternative)
T101_LS1 - level indicator
T101_LSH - level indicator (alternative)
T101_TV1_CPOS - output to control the TV1 valve
T101_TV1_POS - current position of the TV1 valve
```

If a process variable is reserved for future use, it is recommended that it be named after the following templates:

```
REZDI1 - reserved type DIVAR
REZDI22 - reserved type DIVAR
REZAI1 - reserved type AIVAR
REZDO1 - reserved type DOVAR
REZAO1 - reserved type AOVAR
```

### Suffix Recommendation

All suffixes for output signals must begin with the letter `C`, input signals must not begin with the letter ` C`

**DI**

ALM state Alarm, eg `T101_TY1_ALM` - frequency converter alarm

LSTP Local Stop Button Pressed

PWR Presence of power control circuit

RDY readiness of the device to work

RMT switch status local/remote

RUN The device is in operation

SCLS position is closed

SOPN position is open

SPDC contact of the discrete speed control sensor (eg inductive sensor)

WRN warning status

**AI**

ECUR Motor current

POS position of the valve body 

PV current value

SPD Actual speed/frequency

**DO**

CBWR - Reverse (Motion Control)

CCLS - close control

CFRW - forward movement (movement control)

COPN - open or open/close control

CRMT - enable/disable remote control

CRVRS - Reverse Control, or Reverse/Stop

CSTRT - Control Start, or Start/Stop

CSTP - Stop control

CUP - Up command control

CDN - Down command control

**AO**

CSPD - setpoint speed/frequency

CPOS - setpoint position of the actuator



<-- [1.4 General requirements for the implementation of the PACFramework interface](1_4_if_en.md)

--> [1.6. The concept of classification and customization of objects](classes_en.md)
