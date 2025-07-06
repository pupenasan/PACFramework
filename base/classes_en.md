[PACFramework](../README_EN.md) > [1. Core Concepts](README_EN.md)

# 1.6 Concept of Object Classification and Customization

## Classes

The division of functions and their associated data, as well as their operational specifics, is based on the concept of **classes**. Classes enable the implementation of general functions within a single software element.

If functions are related to equipment objects, the classes are distributed across levels according to the Equipment Hierarchy in PAC Framework. Each class has a unique **CLSID** within the entire system, necessitating organized distribution.

As one option, the following **hexadecimal class number model** can be used:

```
16#ABCD
```

where:

- **A** – hierarchy level in the control model (Equipment), e.g., 0xxx – channel level, 1xxx – variable level, 2xxx – actuator/controllers, 3xxx – Equipment Module level, 4xxx – Units level, 5xxx – Work Center level.
- **B** – arbitrary value.
- **C** – type number within the class level, e.g.,
   `CHDI (CLSID=16#001x)` – digital input channels,
   `CHDO (CLSID=16#002x)` – digital output channels.
- **D** – subclass, used to distinguish objects with unique features that do not fundamentally change the algorithm or data set but add or remove additional functionality.

## Parameters

**Parameters** are configuration variables defining object characteristics that change infrequently. They are set during system configuration and adjusted when operational conditions change (failures, changes in object properties, etc.).

The framework provides mechanisms for **automatic parameter adjustment**. For example, bit parameters may change when linking objects. Actuators linked to limit switches can automatically adjust the parameters of those switches. Specifically, `PRM_ISWRN` and `PRM_ISALM` options are forcibly disabled for switches since they are irrelevant. If a switch fails, the operator can enable a `DSBL` parameter to allow the actuator to operate without the sensor, automatically switching the actuator to "sensorless mode."

## State Variables

**State variables are not used for configuring object behavior.**

## Methods for Customizing Algorithms for Specific Object Actions

To avoid creating multiple functions/function blocks that operate almost identically except for specific actions, it is advisable to implement them within the same software element using several customization methods:

1. **Using CLSID:**
    Assign a different subclass CLSID (e.g., changing the last hexadecimal digit) to objects requiring specific actions. The function checks the CLSID and executes custom actions accordingly. This method is suitable when the object consistently requires these custom actions. Shared algorithms are executed across subclasses, while specific logic executes conditionally.

   Example, executing for all class objects except `16#1011`:

   ```pascal
   // If not a DI with counter
   IF #DIVARCFG.CLSID <> 16#1011 THEN
       #VAL := INT_TO_BOOL(#DIVARCFG.VALI);
   END_IF;
   ```

2. **Using ID:**
    If only a few objects in a class need special logic (and creating a subclass is unnecessary), customization can be handled by checking the **ID** within the software element.

   ```pascal
   // For a specific object ID
   IF #DIVARCFG.ID = 10001 THEN
       #VAL := INT_TO_BOOL(#DIVARCFG.VALI);
   END_IF;
   ```

3. **Using PRM_BIT:**
    If the special action needs to be enabled or disabled during configuration, bit parameters (options) in the object’s settings can be used.

   ```pascal
   // If the "invert" parameter is enabled
   IF #PRM_INVERSE THEN
       #DI := NOT #VRAW;
   ELSE
       #DI := #VRAW;
   END_IF;
   ```

4. **Auto-adjusted:**
    If special actions depend solely on parameters of other objects, these parameters (as in method 3) can be **automatically adjusted**. For example, the actuator parameter `PRM_ZCLSENBL` (track closed position sensor) is automatically set based on the presence and activity of a related process variable:

   ```pascal
   #ACTCFGu.PRM.PRM_ZCLSENBL := NOT #SCLS.PRM.PRM_DSBL AND #SCLS.ID <> 0;
   ```

   

<-- [1.5.Recommendations for naming components and frame elements](1_5_naming_en.md)

<-- [Section 1: Main ideas](README_EN.md)
