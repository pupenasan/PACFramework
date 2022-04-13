[PACFramework](../README_EN.md) > [1. Main ideas](README_EN.md)

This text was translated using Google Translate. You can comment on the translation in [this topic](https://github.com/pupenasan/PACFramework/issues/52)

## 1.4 General requirements for the implementation of the PACFramework software interface

### Structure interface of functions/procedures and function blocks

Each function/procedure/FB that implements a CM or other object includes internal status data and interface data for other subsystems (eg SCADA/HMI).

Interface data is divided into 2 types:

- real-time data (RT HMI)

- configuration data (CFG)

Real-time data contains all the necessary information for continuous monitoring of CM status and control, including:

- to display on the HMI

- for Alarm subsystems

- for Trend and Log

- for CM state management (including configuration management)

The configuration data contains (CFG) all the information needed to configure the CM or other object. Exchange of configuration data with SCADA/HMI occurs at:

- setting/checking CM parameters

- in-depth diagnostics of CM

- use of CM service modes (forcing, simulation, out of service)

### HMI Variables (HMI), Configuration (CFG) Variables, and Buffer Management

Due to the large amount of configuration data, it is desirable to minimize their traffic with other subsystems. This reduces the load on communications and reduces the cost of SCADA systems that use tag-based licensing. To do this, data exchange between SCADA/HMI and PLC configuration data can be implemented via an intermediate buffer common to all CM types of the same type (see 1.2.5).

Division of data into real-time data (**HMI**) and configuration data (**CFG**) is optional and requires duplication of certain data on the controller. Division may also be accompanied by the need for a rigid distribution of access by SCADA/HMI.

The type of configuration variables to be stored in the PLC may differ from the type of buffer variable used for transport. The buffer variable usually contains more fields in advance to be used to transport different types of data at the same level.

### Status Variables (STA) and Commands (CMD)

HMI CM data may include the words:

- **STA** - status word (16-bit), which includes bit sets for all state machines (STATUS) and modes (MODES) CM

- **CMD** - control word (16-bit), which is intended to control the state and modes of CM, as well as its configuration; each command is encoded by a separate numeric value unique within all CM types

The 16-bit word format is chosen to be compatible with most modern IEC 61131-3 platforms. The command word (CMD) must be reset directly at the destination. In this way, the command resets the CM to which it is assigned. An exception may be when the command is broadcast, then it is necessary to provide a mechanism for resetting the command after receiving them by all recipients.

To ensure hierarchical control, all internal CM-responsible variables used in other CM/EM/UNIT are passed there as INOUT, or by reference. This saves a lot of memory for the controller.

For convenience, configuration data may also include STA and CMD (hereinafter STA_CFG and CMD_CFG), which are used only in the PLC program. Thus, the STA transmitted to the HMI (hereinafter STA_HMI) copies the configuration STA and cannot be changed (read only), and the CMD transmitted from the HMI (hereinafter CMD_HMI) is the operator's command and is processed accordingly. The variables CMD_CFG and STA_CFG can be bit structures.

Given that for CM channels (LVL0) and process variables (LVL1) can be used only one command "read configuration" (READ\_CFG, it also connects CM to the buffer) to save SCADA/HMI tags can be combine the STA and CMD bits into one STA variable (STA\_HMI), one of the bits of which will change in the HMI for the read command. This configuration has been repeatedly tested and has shown its efficiency and feasibility.

CM configuration data belonging to a specific group must have **ID** (object ID in the group) and **CLSID** (object class identifier), which can be accessed via a shared buffer. **Buffer** provides access to the configuration data of the element (CM) by its number. A buffer is a public variable that is publicly available for all functions or instances of function blocks. The buffer is processed by the CM instance whose number matches the number in the buffer. Thus, at the read command (READ\_CFG) the buffer is updated with CM\_CFG data including ID and CLSID. Thus reading leads to binding of CM to the buffer.

The framework involves the use of broadcast commands. All broadcast commands are transmitted via the PLC of class CMD (see PLC class). These commands are accepted by all objects of the type, not just those that have a buffer. This may be required, for example, for functions:

- setting the default configuration;

- set/disable simulation mode;

- installation of all objects of a class in manual / automatic

- ...

Broadcast commands can be in 4XXX (HEX) format, ie with a single 14th bit. Given that the command must accept each element of type CM, it should be reset only after the complete completion of the PLC cycle (it is assumed that all CMs are processed within one cycle). Details of implementation see PLC class.

Commands (CMD) for CM levels LVL0 and LVL1 are used only for exchange between SCADA/HMI and controllers, or exchange between devices. LVL2 and higher level commands are also used in the user program. In this case, commands from different sources CMD\_HMI (SCADA/HMI), CMD\_BUF (buffer) and CMD\_CFG (software) must be considered. The priority of a command may depend on the mode of operation of the CM, the type of command (for example, reading to the buffer has priority over the control command or vice versa).

### Requirements for data types

It is recommended that you use the following data types to share with the HMI:

- INT/UINT (16)

- DINT/UDINT (32)

- REAL (32)

- ARRAY of INT/DINT/REAL

It is not recommended to use BOOL memory area and individual BOOL variables to exchange with HMI. It is recommended to use bit sets (but not structures), such as STA bits. Instead of the TIME type, you can use UDINT (ms) or convert it to REAL. It is recommended to use other types only as an exception, if conversion to the given types cannot be performed.

It is desirable to provide alignment at the level of 4 bytes.

Ensuring these requirements will make it possible to easily transfer the frame elements between different platforms.

<-- [1.3 Equipment Hierarchy in the PACFramework](1_3_equip_en.md)

--> [1.5.Recommendations for naming components and frame elements](1_5_naming_en.md)