[PACFramework](../README_EN.md) > [1. Core Concepts](README_EN.md)

## 1.4 General Requirements for Implementing PACFramework Function Block Interfaces

### Structure of Function/Procedure and Function Block Interfaces

Each function/procedure/function block (FB) that implements a CM or other object contains internal state data and interface data for other subsystems (e.g., SCADA/HMI).

Interface data is divided into two types:

- real-time data (RT HMI)
- configuration data (CFG)

Real-time data contains all information needed for continuous CM status monitoring and control, including:

- display on HMI
- alarm subsystems
- trends and logs
- CM state control (including configuration control)

Configuration data (CFG) contains all information necessary to configure the CM or other object. Exchange of configuration data with SCADA/HMI occurs during:

- setup/parameter checking of the CM
- in-depth CM diagnostics
- use of CM service modes (forcing, simulation, maintenance bypass)

### HMI Variables (HMI), Configuration Variables (CFG), and Buffer Handling

Due to the large amount of configuration data, traffic with other subsystems should be minimized to reduce network load and SCADA system costs, especially for tag-based licensing. To achieve this, configuration data exchange between SCADA/HMI and PLC can be handled via an intermediate buffer shared by all CMs of the same type (see section 1.2.5).

Splitting data into real-time (**HMI**) and configuration (**CFG**) data is optional and requires duplicating certain data on the PLC. It may also necessitate strict access separation from SCADA/HMI.

The type of configuration variable stored in the PLC may differ from the type used for buffer transport. The buffer variable typically contains more fields to transport different data types of the same level.

### Status (STA) and Command (CMD) Variables

CM HMI data may include:

- **STA** – a 16-bit status word containing bit sets for all state machines (STATUS) and modes (MODES) of the CM.
- **CMD** – a 16-bit command word for controlling CM states, modes, and configuration; each command is encoded with a unique numeric value across all CM types.

The 16-bit word format is chosen for compatibility with most modern IEC 61131-3 platforms. **The command word (CMD) must be reset at the destination, meaning the CM for which it is intended should reset it. Exceptions include broadcast commands, where a reset mechanism is needed after all recipients process the command.**

To ensure hierarchical control, all internal variables representing CMs used in other CMs/EMs/UNITs are passed as `INOUT` or by reference, significantly saving PLC memory.

For convenience, configuration data may also include STA and CMD (referred to as STA_CFG and CMD_CFG) used only within the PLC program. The STA sent to the HMI (STA_HMI) copies the configuration STA and is read-only, while the CMD sent from the HMI (CMD_HMI) is treated as an operator command. CMD_CFG and STA_CFG variables can be bit arrays.

Since LVL0 (channels) and LVL1 (process variables) CMs may only require a single “read configuration” command (READ_CFG, which also links the CM to the buffer), **STA and CMD bits can be combined into a single STA_HMI variable** to save SCADA/HMI tags, with one bit toggled in the HMI to trigger a read command. This configuration has been tested repeatedly and proven effective.

Configuration data for CMs within a group must have:

- **ID** (object identifier within the group)
- **CLSID** (class identifier)

These identifiers allow access through a shared **buffer**, which provides access to an element's configuration data by its number. The buffer is a global variable accessible to all functions or FB instances. The CM instance with a matching number manages the buffer. Upon a READ_CFG command, the buffer is updated with CM_CFG data, including ID and CLSID, thereby linking the CM to the buffer.

The framework supports **broadcast commands**, which are sent via the CMD variable of the PLC class (see PLC class) and received by all object instances of that type, not just the one owning the buffer. Use cases include:

- restoring default configurations,
- enabling/disabling simulation mode,
- setting all objects of a class to manual/automatic,
- etc.

Broadcast commands may use a 4XXX(HEX) format (14th bit set). As every CM of the type must process the command, it should only be reset after a full PLC cycle (assuming all CMs are processed within one cycle). For implementation details, see the PLC class.

CMD variables for LVL0 and LVL1 CMs are used only for SCADA/HMI-to-controller or inter-device communication, while LVL2 and higher-level CMDs are also used in user programs, requiring consideration of command sources:

- CMD_HMI (SCADA/HMI),
- CMD_BUF (buffer),
- CMD_CFG (program).

Priority may depend on CM operating mode and command type (e.g., buffer read commands may have lower or higher priority than control commands).

### Data Type Requirements

For HMI exchange, the following data types are recommended:

- INT/UINT (16-bit)
- DINT/UDINT (32-bit)
- REAL (32-bit)
- ARRAY of INT/DINT/REAL

Using BOOL memory areas and standalone BOOL variables for HMI exchange is not recommended. Instead, use bit sets (but not structures), e.g., STA bits. Use UDINT (ms) or REAL as a substitute for TIME types. Other types should only be used if conversion to the recommended types is not feasible.

It is advisable to align variables to 4-byte boundaries.

Meeting these requirements will ensure easy portability of framework elements across different platforms

<-- [1.3 Equipment Hierarchy in the PACFramework](1_3_equip_en.md)

--> [1.5.Recommendations for naming components and frame elements](1_5_naming_en.md)