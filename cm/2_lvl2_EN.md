# LVL2 Classes

**CLSID=16#200x – 16#27FF**

## General description

LVL2 (**devices**) – the device and actuator layer, intended for convenient process debugging, simulation modeling functions, process alarm functions, and statistics tracking:

- actuators (shut-off valves, control valves, motors, pumps);
- control and regulation loops for feedback control functions;
- other devices that include several process variables and have dedicated states.

It is recommended to use consistent ID-based identification for device and actuator variables within the LVL2 layer to simplify symbolic referencing in HMI.

The device and actuator layer heavily depends on the specific implementation of actuator control schemes and may differ significantly across different integrators.

- [VLVD](2_vlvd_EN.md) (CLSID=16#201x) – valve with discrete control,
- [VLVA](2_vlva_EN.md) (CLSID=16#202x) – valve with analog control,
- VLVS (CLSID=16#203x) – SERVO-type valves,
- [DRV](2_drv_EN.md) (CLSID=16#204x) – motors.

A variable with ID 0 is reserved as an empty, inactive variable.

## Recommendations for HMI use

An example of device and actuator diagnostics and configuration in HMI is shown in the figures below.

![img](media%5C2_12.png)

Fig. Example of an actuator control window on HMI.

![img](media%5C2_13.png)

Fig. Example of an actuator control and configuration window on HMI.

Variable statuses (alarms, failures, forcing) accompany actuator display on all HMI mimic diagrams. The following figure shows an example of warning display for an actuator.

![img](media%5C2_14.png)

Fig. Example of displaying actuator statuses on HMI.

## General Requirements for the Structure of Actuator Class Variables

When implementing control functions, **universal actuator structures** are used: `ACTTR_CFG` (configuration variables), `ACTTR_STA` (status bits), `ACTTR_ALM` (alarm bits), `ACTTR_PRM` (parameter bits), with a unified buffer using an identical structure `ACT_CFG`.

#### ACTTR_STA

This structure is used to describe the statuses of a universal actuator and contains all status bits of defined actuators. It is also used as a universal internal structure within the actuator processing function.

| name        | type | Description                                                  |
| ----------- | ---- | ------------------------------------------------------------ |
| IMSTPD      | BOOL | =1 stopped in intermediate position                          |
| MANRUNING   | BOOL | =1 moving in undefined direction (manual from local panel)   |
| STOPING     | BOOL | =1 stopping                                                  |
| OPNING      | BOOL | =1 opening                                                   |
| CLSING      | BOOL | =1 closing                                                   |
| OPND        | BOOL | =1 open (16#0080)                                            |
| CLSD        | BOOL | =1 closed (16#0100)                                          |
| MANBXOUT    | BOOL | =1 manual mode active from local panel                       |
| WRKED       | BOOL | =1 in operation                                              |
| DISP        | BOOL | =1 remote mode (from PC/operator panel) (16#0200)            |
| MANBX       | BOOL | =1 manual mode from panel (via feedback)                     |
| INBUF       | BOOL | =1 variable in buffer                                        |
| FRC         | BOOL | =1 at least one variable in the object is forced (for commissioning visibility) |
| SML         | BOOL | =1 simulation mode                                           |
| BLCK        | BOOL | =1 blocked                                                   |
| STRTING     | BOOL | =1 starting                                                  |
| STOPED      | BOOL | =1 stopped (16#0100)                                         |
| SLNDBRK     | BOOL | =1 sensor fault                                              |
| CMDACK      | BOOL | =1 command acknowledged                                      |
| SPD1        | BOOL | =1 operating at speed level 1                                |
| SPD2        | BOOL | =1 operating at speed level 2                                |
| STA_b21     | BOOL | reserved                                                     |
| STRT_DELAY  | BOOL | =1 start delay active                                        |
| STOP_DELAY  | BOOL | =1 stop delay active                                         |
| DBLCKACT    | BOOL | =1 ignore CMDRESOLUTION mode                                 |
| ISREVERS    | BOOL | =1 start with reverse                                        |
| ISANALOG    | BOOL | =1 analog control (for display purposes)                     |
| INIOTBUF    | BOOL | =1 variable in IoT buffer                                    |
| SPDMONON    | BOOL | =1 speed monitoring enabled (SPDMON)                         |
| SPDCALIBRON | BOOL | =1 speed calibration enabled                                 |
| MAINT       | BOOL | =1 out of service                                            |
| STA_b31     | BOOL | reserved                                                     |

#### ACTTR_ALM

This structure is used to describe all available alarms of a universal actuator, containing all alarm bits of defined actuators. It is also used as a universal internal structure within the actuator processing function.

| name      | type | Description                                              |
| --------- | ---- | -------------------------------------------------------- |
| ALMSTRT   | BOOL | =1 failed to start (clears on command or state change)   |
| ALMSTP    | BOOL | =1 failed to stop (clears on command or state change)    |
| ALMOPN    | BOOL | =1 failed to open (clears on command or state change)    |
| ALMCLS    | BOOL | =1 failed to close (clears on command or state change)   |
| ALMOPN2   | BOOL | =1 failed to open (with 2 limit switch pairs)            |
| ALMCLS2   | BOOL | =1 failed to close (with 2 limit switch pairs)           |
| ALMSHFT   | BOOL | =1 incorrect state (clears on command or state change)   |
| ALM       | BOOL | =1 actuator error (logical OR of alarms)                 |
| ALMBELL   | BOOL | =1 bell activation command (one PLC cycle)               |
| WRN       | BOOL | =1 actuator warning (logical OR)                         |
| WRNSPD    | BOOL | =1 drive slip warning (%)                                |
| ALMSPD    | BOOL | =1 drive slip alarm (%)                                  |
| WRNSPD2   | BOOL | =1 drive slip warning 2 (%) (with dual speed monitoring) |
| ALMSPD2   | BOOL | =1 drive slip alarm 2 (%) (with dual speed monitoring)   |
| ALMPWR1   | BOOL | =1 no power supply                                       |
| ALMSTPBTN | BOOL | =1 stop button pressed                                   |
| ALMINVRTR | BOOL | =1 inverter fault                                        |
| ALM_b17   | BOOL | reserved                                                 |
| ALM_b18   | BOOL | reserved                                                 |
| ALM_b19   | BOOL | reserved                                                 |
| ALM_b20   | BOOL | reserved                                                 |
| ALM_b21   | BOOL | reserved                                                 |
| ALM_b22   | BOOL | reserved                                                 |
| ALM_b23   | BOOL | reserved                                                 |
| ALM_b24   | BOOL | reserved                                                 |
| ALM_b25   | BOOL | reserved                                                 |
| ALM_b26   | BOOL | reserved                                                 |
| ALM_b27   | BOOL | reserved                                                 |
| ALM_b28   | BOOL | reserved                                                 |
| ALM_b29   | BOOL | reserved                                                 |
| ALM_b30   | BOOL | reserved                                                 |
| ALM_b31   | BOOL | reserved                                                 |

#### ACTTR_PRM

This structure is used to describe all available parameters of a universal actuator, containing all parameter bits of defined actuators. It is also used as a universal internal structure within the actuator processing function.

| name             | type | Description                               |
| ---------------- | ---- | ----------------------------------------- |
| PRM_b0           | BOOL | reserved                                  |
| PRM_ZWRKENBL     | BOOL | =1 external input – feedback on operation |
| PRM_ZPOSENBL     | BOOL | =1 analog feedback on frequency/position  |
| PRM_PWRENBL      | BOOL | =1 external power status input            |
| PRM_MANCFG       | BOOL | =1 manual configuration control           |
| PRM_ZOPNENBL     | BOOL | =1 open sensor available                  |
| PRM_ZCLSENBL     | BOOL | =1 close sensor available                 |
| PRM_AUTOACK      | BOOL | =1 automatic alarm acknowledgment         |
| PRM_BTNSTPENBL   | BOOL | =1 external STOP button input             |
| PRM_ALMENBL      | BOOL | =1 external drive fault input             |
| PRM_SELLCLENBL   | BOOL | =1 external local control signal input    |
| PRM_PULSCTRLENBL | BOOL | =1 pulse control scheme (2s command)      |
| PRM_ZRUNENBL     | BOOL | =1 external drive running input           |
| PRM_ZSPDENBL     | BOOL | =1 external drive speed sensor input      |
| PRM_CRVRSENBL    | BOOL | =1 actuator with reverse control output   |
| PRM_BLCKOFSPD    | BOOL | =1 stop on speed drop                     |
| PRM_NOPRES       | BOOL | =1 allow movement without pump running    |
| PRM_b17–PRM_b31  | BOOL | reserved                                  |

#### ACTTR_CMD

For software control, simultaneous command execution is often required. Using numerical commands does not allow this since each command has a unique number, allowing only one active at a time. Bitwise commands remove this limitation, although they limit the total number to 32. If more commands are needed, an additional CMD variable can be introduced to hold extra bitwise commands.

This structure describes all available bitwise commands of a universal actuator and is used as a universal internal structure within the actuator processing function.

| name            | type | Description                             |
| --------------- | ---- | --------------------------------------- |
| OPN             | BOOL | Open 16#0001                            |
| CLS             | BOOL | Close 16#0002                           |
| TOGGLE          | BOOL | Toggle (open<->close, on<->off) 16#0003 |
| ALMACK          | BOOL | Acknowledge alarm 16#0004               |
| ALMRESET        | BOOL | Reset alarms 16#0005                    |
| BLCK            | BOOL | Block 16#0006                           |
| DBLCK           | BOOL | Unblock 16#0007                         |
| STOPTUN         | BOOL | Stop auto-tuning 16#0008                |
| TUNING          | BOOL | Start auto-tuning 16#0009               |
| MAN             | BOOL | Switch to manual (SCADA/HMI) 16#0301    |
| AUTO            | BOOL | Switch to auto (SCADA/HMI) 16#0302      |
| PROTECT         | BOOL | Enable protection algorithm 16#000A     |
| START           | BOOL | Start 16#0011                           |
| STOP            | BOOL | Stop 16#0012                            |
| UP              | BOOL | Increase 16#0021                        |
| DWN             | BOOL | Decrease 16#0022                        |
| CRMT            | BOOL | Disable local control 16#0314           |
| RESOLUTION      | BOOL | =1 enable control 16#000B               |
| REVERS          | BOOL | Enable reverse 16#0013                  |
| CLCL            | BOOL | Enable local control 16#0313            |
| DBLCKACTTOGGLE  | BOOL | Toggle ignore CMRESOLUTION 16#000C      |
| STARTDELAY      | BOOL | start with delay (auto only)            |
| STOPDELAY       | BOOL | stop with delay (auto only)             |
| P_RESOLUTION    | BOOL | enable by system pressure presence      |
| BUFLOAD         | BOOL | load into buffer                        |
| OUTSRVC         | BOOL | take out of service                     |
| INSRVC          | BOOL | return to service                       |
| CMD_b27–CMD_b31 | BOOL | reserved                                |

#### ACTTR_CFG

The `ACTTR_CFG` structure represents a universal actuator structure containing all parameters of defined actuators. It is used as a universal internal structure within the actuator processing function and as the actuator buffer `ACTBUF`.

| name         | type      | Description                                        |
| ------------ | --------- | -------------------------------------------------- |
| ID           | UINT      | actuator identifier                                |
| CLSID        | UINT      | actuator class identifier                          |
| STA          | ACTTR_STA | status bits                                        |
| ALM          | ACTTR_ALM | alarm bits                                         |
| CMD          | ACTTR_CMD | bitwise commands                                   |
| PRM          | ACTTR_PRM | parameter bits                                     |
| STAHMI1/2    | UINT      | status bits for HMI                                |
| ALMHMI1/2    | UINT      | alarm bits for HMI                                 |
| CMDHMI       | UINT      | HMI commands                                       |
| PRMHMI       | UINT      | HMI parameters                                     |
| T_DEASP      | UINT      | alarm delay time (0.1 s)                           |
| T_OPNSP      | UINT      | max open time (0.1 s)                              |
| POS          | REAL      | actuator position (0–100%), feedback               |
| rez          | INT       | reserved for type alignment                        |
| STEP1        | UINT      | step number                                        |
| CNTPER       | UINT      | changeover count                                   |
| CNTALM       | UINT      | alarm count                                        |
| T_STEP1      | UDINT     | step elapsed time (ms)                             |
| T_PREV       | UDINT     | previous call time (ms), taken from `PLC_CFG.TQMS` |
| VALPREV      | REAL      | previous cycle value                               |
| POWER_IN     | REAL      | power, kW                                          |
| CPOS         | REAL      | actuator setpoint position (0–100%)                |
| SPD/SPD2     | INT       | calculated rotation speed sensor 1/2 (%)           |
| SPDWRNSP     | UINT      | drive slip warning threshold (%)                   |
| SPDALMSP     | UINT      | drive slip alarm threshold (%)                     |
| STRT_DELAY   | UINT      | start delay (0.1 s)                                |
| STOP_DELAY   | UINT      | stop delay (0.1 s)                                 |
| TQ_TOTAL     | UDINT     | total operating time (min)                         |
| TQ_LAST      | UDINT     | last run time (s)                                  |
| FRQ_IN       | REAL      | current frequency                                  |
| FRQ_OUT      | REAL      | set frequency                                      |
| CURR_IN      | REAL      | current feedback                                   |
| SPDMON_DELAY | UINT      | speed monitoring start delay (0.1 s)               |
| MSG          | UINT      | message                                            |

## General Requirements for Actuator Functions

### Functional Requirements

Level 2 Control Modules (CMs) represent actuators, controllers, etc., and include **basic control functions** (according to ISA-88 terminology). Each CM provides **bidirectional interaction with “process variables”** for both writing and reading. This enables, in addition to implementing specific functionality for a given CM, the following capabilities at this level:

- considering the process variable status (normal/alarm/validity) and diagnostic information in CM control logic;
- simulating CM operation using an integrated simulation algorithm (if needed) for:
  - advanced model-based process diagnostics;
  - model-based control;
  - simulation mode operation for demonstration/training or system commissioning;
- enabling simulation mode for the CM and all related lower-level CMs;
- collecting statistical information (depending on CM type).

For each Equipment Entity, the **function block/algorithm** is defined along with **data structures (interfaces)** for interaction with other subsystems/entities.

The **data structure and function/FB behavior are ISA-88 compliant**, using state machines, modes, and interfaces defined in the standard.

Level 2 CMs, such as **devices and actuators**, may use process variables provided as inputs/outputs to the processing function. For optional inputs/outputs, **auto-configuration of the actuator is supported**, allowing the actuator to adjust input/output processing algorithms based on the available signals (e.g., a valve can operate without limit switches).

#### Buffer Handling

A **classical buffer handling function must be implemented**.

- A single buffer is recommended for all actuator types.
- Buffer occupation is verified by matching the class identifier `CLSID` and actuator identifier `ID`.
- When the buffer is captured:
  - `ACTBUF.STA = ACTTR_CFG.STA`
  - `ACTTR_CFG.CMD = ACTBUF.CMD` if it is not zero (enabling commands from other sources).
- The actuator configuration should be read into the buffer upon receiving commands:
  - update the process variable already loaded into the buffer by setting `ACTTR_HMI.CMD = 16#0100`.
- The actuator configuration should be written from the buffer upon receiving commands:
  - `ACTBUF.CMD = 16#0101`.

A **parameterized bidirectional buffer function (ACTBUFIN <-> ACTBUFOUT) must also be implemented**.

- Two buffers are used:
  - `ACTBUFIN` (input buffer) – for processing commands (when CLSID and ID match) and writing information to the actuator.
  - `ACTBUFOUT` (output buffer) – for reading information from the actuator when a read command is received via `ACTBUFIN`.
- One pair of buffers is recommended for all actuators.
- Buffer occupation is **not possible** since it is implemented with separate `ACTBUFIN` and `ACTBUFOUT` buffers, allowing seamless data transfer for further processing or transfer to the HMI internal buffer (similar to PKW parameter exchange in PROFIDRIVE).
- The actuator configuration should be read into the output buffer when:
  - `ACTTR_CFG.CLSID = ACTBUFIN.CLSID`, `ACTCFG.ID = ACTBUFIN.ID`, and `ACTBUFIN.CMD = 16#100`.
- The actuator configuration should be written from the input buffer when:
  - `ACTTR_CFG.CLSID = ACTBUFIN.CLSID`, `ACTTR_CFG.ID = ACTBUFIN.ID`, and `ACTBUFIN.CMD = 16#101`.

### Interface Implementation Requirements

The following parameters should be passed in the interface:

- `ACTCFG` - INOUT
- `ACTHMI` - INOUT
- Process variables of actuator sensors (limit switches, local buttons, etc.) - INOUT
- Process variables of actuator outputs (solenoids, starters, etc.) - INOUT

If **direct access to external variables from within functions is not possible**, pass `PLC_CFG`, `ACTBUF`, `ACTBUFIN`, `ACTBUFOUT`. Alternatively, other interfaces within `PLC_CFG` can be used.

### User Program Implementation Requirements

In the main program (outside the class function implementation):

- On first startup:
  - initialize variable identifiers (`ID`),
  - occupy the buffer with a selected variable.

In the class implementation program:

- On first startup:
  - initialize variable classes (`CLSID`),
  - initialize timing parameters (opening time, alarm delays, etc.),
  - disable alarms on subordinate process variables,
  - `T_PREV := PLC_CFG.TQMS`,
  - `T_STEP1 := 0`.

The **actuator processing function program** consists of the following stages:

- **Reading information** from the actuator-type variable into the universal actuator variable for unified processing using the `xx_to_ACT` function (`xx` corresponds to the actuator class).
- **Preprocessing:** initializing `STA`, `ALM`, `CMD`, handling `INBUF`, `SML`, calculating `dt`, using the `ACT_PRE` function.
- **Parameter handling:** supporting automatic and manual configuration. In automatic mode, parameters are verified based on sensor presence/status, adjusting input/output processing algorithms accordingly. In manual mode, operators manually configure actuator operations.
- **Simulation mode processing:** modifies actuator behavior for simulation (simulating limit switches and sensors, halting output writes) and propagates simulation states to subordinate process variables.
- **Command processing** using the standard `ACT_CMDCTRL` function for all actuators.
- **Sensor state handling** or logic replacement based on actuator parameters.
- **State machine and alarm processing** for actuator positions and alarms.
- **Actuator control command handling**.
- **Alarm display, status bit generation, and propagation** to the `PLCFN` function.
- **Final processing:** updating `PLC.CFG`, forming actuator `STA` and `ALM`, clearing `CMD`, calculating `dt`, etc.
- **Writing back information** from the universal actuator variable to the actuator-type variable using the `ACT_to_xx` function (`xx` corresponds to the actuator class).
- **Processing `ACTBUFIN` and `ACTBUFOUT` buffers**.

## Testing

### General Test List

| No.  | Name                                     | When to test                  | Notes |
| ---- | ---------------------------------------- | ----------------------------- | ----- |
| 1    | ID and CLSID assignment on startup       | after function implementation |       |
| 2    | Default parameter initialization         | after function implementation |       |
| 3    | Buffer write commands                    | after function implementation |       |
| 4    | Parameter modification and buffer write  | after function implementation |       |
| 5    | Built-in time counter operation          | after function implementation |       |
| 6    | PLC counter rollover effect on step time | after function implementation |       |
| 7    | Actuator mode control                    | after function implementation |       |
| 8    | Actuator control                         | after function implementation |       |
| 9    | Actuator alarm handling                  | after function implementation |       |
| 10   | Actuator auto-configuration algorithms   | after function implementation |       |

Test execution methods for general and special tests are described in each class’s testing methodology.
