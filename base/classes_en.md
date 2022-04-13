[PACFramework](../README_EN.md) > [1. Main ideas](README_EN.md)

This text was translated using Google Translate. You can comment on the translation in [this topic](https://github.com/pupenasan/PACFramework/issues/52)

# 1.6. The concept of classification and customization of objects

## Classes

The division into functions and related data as well as the features of their operation is based on the concept of classes. Classes make it possible to implement common functions within a single software element.

If the functions are related to hardware objects, the classes are divided into levels according to the described [Equipment Hierarchy in PAC Framework](1_3_equip_en.md). Each class has a unique CLSID throughout the system, so there is a need for their distribution.

As a distribution option, it is proposed to use the following class number model in hexadecimal format:

```
16#ABCD  
```

where 

- A is the level number in the Equipment Hierarchy model, for example 0xxx is the channel level, 1xxx is the variable level, 2xxx is the actuators/device level, 3xxx is the Equipment Module level, 4xxx is the Units level, 5xxx is the Work Center level.
- B is an arbitrary value

- C is the type number within the class level, for example CHDI (CLSID = 16 # 001x) - digital input channels, CHDO (CLSID = 16 # 002x) - discrete output channels,

- D - subclass, which allows you to select objects that have a unique feature that does not fundamentally change the algorithm to a set of data for objects, but has an additional function or, conversely, no function.     

## Parameters

Parameters are those setting variables that set the characteristics of an object that change little over time. They are set during system setup and change with changes in operating conditions (breakdowns, changes in the properties of the object, etc.).

The framework provides mechanisms for automatic adjustment of parameters. In particular, bit parameters (options) can change when linking multiple objects. For example, actuators that are associated with end position sensors can change the parameters of it. In particular, the `PRM_ISWRN` and ` PRM_ISALM` options are forcibly removed for sensors, as they do not make sense. On the other hand, if the sensor has failed, to temporarily convert the actuator to the ability to work without a sensor, the operator sets the option to disable the DSBL. In this case, the actuator is automatically switched to "sensorless" mode.  

## Status variables

Status variables are not used to adjust the behavior of an object.   

## Ways to adjust the algorithm to perform special actions for individual objects (customization)

In order not to multiply functions/function blocks that work almost the same except for certain special actions, they should be implemented in the same software element. There are several ways to adjust the algorithm to perform special actions:

1) **Via CLSID.** Assign another CLSID subclass to special objects, for example by changing the last hexadecimal digit. In this case, the function checks the CLSID and, depending on it, performs certain special (custom) actions. A special subclass is given to those objects, the algorithm of which always involves the implementation of these special actions. Thus, the same program element will be executed for different subclasses to execute common algorithms, and conditional branching by subclass will execute a special algorithm. For example, the following code is executed for all objects in the class except 16#1011:

```pascal
//if it is not a DI with a counter
IF #DIVARCFG.CLSID <> 16#1011 THEN
	#VAL := INT_TO_BOOL (#DIVARCFG.VALI);
END_IF;
```

2) Наприклад: **Through ID.** If there are few special objects in the class (units) for which it is not necessary to allocate separate subclasses, in the program element you can implement special algorithms to verify the ID. Example:

```pascal
//for an object with a specific ID
IF #DIVARCFG.ID = 10001 THEN
	#VAL := INT_TO_BOOL (#DIVARCFG.VALI);
END_IF;
```

3) **Via PRM_BIT**. If special actions need to be activated or deactivated during configuration, you should use bit parameters (options) in the object settings. In the following example, the inversion action is performed only if the corresponding activated option is available

```pascal
//if the invert option is enabled
IF #PRM_INVERSE THEN
	#DI := NOT #VRAW;
ELSE
	#DI := #VRAW;
END_IF;
```

4)  **Auto-tuning**. If special actions depend on the parameters of other objects (and only so), the parameters of 3th variant can be changed automatically (so-called "auto-tuning"). For example, in the following example, the parameter of the tracking activity of the closed position indicator for the actuator `PRM_ZCLSENBL` is automatically determined in the presence of the corresponding technological variable and its activity.

```pascal
#ACTCFGu.PRM.PRM_ZCLSENBL := NOT #SCLS.PRM.PRM_DSBL AND #SCLS.ID <> 0;
```



<-- [1.5.Recommendations for naming components and frame elements](1_5_naming_en.md)

<-- [Section 1: Main ideas](README_EN.md)
