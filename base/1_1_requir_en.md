This text was translated using Google Translate. You can comment on the translation in [this topic](https://github.com/pupenasan/PACFramework/issues/52)

## 1.1 Prerequisites and main ideas

Requirements for the functionality of the framework are formed as a result of the analysis of the requirements for the functioning of ICS for various purposes, the problems of their development, commissioning and operation. Among them are the following:

1. problems of integration with MES/MOM and other subsystems;
2. low observation of the object, even with a sufficient amount of measurement data;
3. "static" diagnostics of the process without reference to the type of product and the peculiarities of the conditions (typical of Batch-processes);
4. poor implementation of self-diagnosis and failure to take into account failures in the system itself ICS;
5. insufficiently thought-out mechanism of functioning of alarms and events;
6. complexity, significant time spent on debugging the system;
7. complexity, significant time to identify the fact of failure and eliminate the causes;
8. complexity, significant cost of resources for staff training;
9. complexity, significant time spent on software development

These problems and ideas for solving them are discussed in more detail below.

### Integration with MES/MOM and other subsystems

Problems of integration with MES/MOM level applications and other subsystems are primarily not in the plane of communication exchange (now these problems are solved, for example, by using standard protocols, OPC, EDDL, FDT/DTM, FDI, etc.) but in functional representation of lower level entities (objects) for upper and mutual coordination of means of one level. Many existing solutions transmit "raw" data to the top level of the SCADA/HMI, which must first be processed. Due to the lack of information (such as data not displayed) and the relatively low exchange rate between controllers and SCADA/HMI, some important KPIs (Key performance indicators) and statistics or aggregate data at level 2 required by the 3rd (MES/MOM) are difficult to calculate, or their value cannot be provided with a given accuracy.

An additional problem is the lack (usually) of information about the reliability of the data. For example, the failure of the PLC channel when displaying on SCADA/HMI and transmitting inaccurate data to the upper MES/MOM levels is ignored.

At the same time, the computing resources of controls, including industrial controllers, have grown significantly. Therefore, pre-processing of data should be done directly in the means of automating the level of control of the process or machine (and even the field level). The proposed concept proposes to use the ideas and model of the hierarchy of equipment from the standards ISA-88/95/106 and RAMI4.0 (German reference model Industry 4.0), according to which, information on each equipment is represented by its set of structures in the control device. this equipment. This makes it possible to make calculations based on the location of measurements and control of specific equipment and also makes the system more flexible in terms of functional distribution options. The principle of functional distribution (IEC TR 62390) is used, which provides for the division of the entire application (Application) into functional blocks and can be used in different management paradigms (centralized or decentralized IEC 61131 and distributed IEC 61499). An example of such an approach is the use of structures and functions responsible for motor control, directly in the control systems of electric drives (PDS, frequency converters) for profiles CiA402, ProfiDrive, etc.

To implement the ideas underlying the above integration standards, it is necessary to support them at the level of software and hardware at the level of controllers and below. As practice shows, the support of the functionality specified in the standards in specific SCADA/HMI means is very different. This leads to the fact that most of the functionality has to be implemented independently, which is easiest and most flexible to do in the programmable controller, if you use the paradigm of IEC 61131 or hybrid.

### Observation of the object (situational awareness)

Current research in the field of construction and operation of human-machine interfaces in ICS has shown the need to create a context for better situational awareness. In other words, the display of a numerical value is often not accompanied by its context (location within the norm, comparison with the average, etc.), which adversely affects the observation of the object.

Contextual monitoring requires the use of structured rather than "flat" variables that contain all the necessary information about the process variable anywhere. For example - this is the state of the process parameter (the presence of alarms of different levels, the reliability of the value, the state of service, etc.), the norm, minimum/maximum value, etc. The context can be used both on HMI means, and in functions of processing of programs of the controller.

At the same time, there are a large number of unused device resources throughout the system. The rapid introduction of frequency converters and other intelligent devices in ICS together with the total spread of industrial networks (field buses) makes it possible to obtain a large amount of additional data on the state of the process without additional costs. This makes it possible to analyze the process at a higher level.

For example, you can get real-time information from the frequency converter about current power, torque, voltage and current consumption, and calculate a KPI that can be used to judge its performance. Minor faults usually do not occur during operation, but increase energy consumption and, ultimately, still lead to abnormal stops. Calculation of KPI and its comparison with norm gives the chance to pay attention to malfunction even before an emergency stop.

It is possible to increase situational awareness of the use of comparison with the reference model. For example, the balance in the level of capacity and flow, or a comparison of pressure with the pressure characteristic of the pump at the specified speed. When integrating the control device with cloud services, the context can be formed on the basis of cloud computing, and those in turn can use the existing context of the variable.

The above possibilities can be relatively easily implemented using the principles of object-oriented programming and the development of a general flexible concept.

### Alarm Management for process and equipments, troubleshooting

#### Alarm subsystem

The problems of failure to develop an alarm subsystem and ways to deal with them are well described in ANSI/ISA-18.2. In particular, the most typical are alarm flooding caused by faulty equipment or incorrect settings of the alarm subsystem. The implementation of the functions of the alarm subsystem strongly depends on the capabilities of SCADA/HMI. Thus, a typical unused feature of the SCADA/HMI package (or no such feature at all) is the temporary removal of a service alarm. This often leads to the leveling of the functions of the alarm subsystem in general. The possibility of decommissioning the channel would greatly simplify system maintenance, as a faulty channel would not lead to alarm handling. In addition, the fact of withdrawal of the channel can be processed in other parts of the program, such as processing control valve with a limit switch, which is temporarily decommissioned.

An additional problem is the coordination of the SCADA/HMI alarm subsystem and the control of light and sound alarms. Given the high dependence of the implementation of the alarm subsystem on the capabilities of SCADA/HMI, it makes sense to bring most of the alarm processing functions to the controller level, which usually has more opportunities to implement algorithms. An additional argument to this is the need to use the locking functions at the PLC level and to define an additional state of control logic behavior.

For periodic multi-prescription production, the equipment is idle between production periods and the requirements for the process change depending on the recipe. That is, the classical approach to ICS of continuous processes, in which the formation of settings for process alarms is carried out during software development (and even in the process of configuration) is not suitable for this case. For example, the temperature of the heat exchanger outlet should be monitored only during the heating/cooling process of the product (not during standstill or washing), and the emergency and warning values depend on the type of product. To solve this problem, the alarm subsystem must adapt to the requirements depending on the type of product, equipment condition and process, which in most cases is easier to do at the controller level than SCADA/HMI. Given that the ISA-88 standard has been developed and repeatedly tested for the management of periodic production, it makes sense to be based on its bases.

#### Diagnosing equipment

"Flat \" (unstructured) space of variables, which were used in PLCs in the 20th century, is often the basis for software to this day, although modern tools allow the use of elements of object-oriented programming.  "Flat \" variables contain only the values of the process parameter, but for proper process control it is necessary to have its full context. As mentioned above, a very important property of the process variable is the reliability of the data, which is determined by a number of indicators, among which is the failure of the channel. Modern PLCs provide a lot of software diagnostics, however, significant costs (not provided at the beginning of the life cycle) to write a program of additional reliability processing in control functions in most cases lead to neglect of these capabilities and lack of software diagnostics at all. This does not apply to ICS for functionally hazardous processes.

Credibility can be displayed in the status of each channel and the variable associated with that channel. By passing the authenticity status together with the value to all parts of the ICS, in addition to the process states, you can enter the state of "inaccuracy \" (for example, channel failure), in which you can specify a separate processing logic. This is fully consistent with all modern implementations of the state machine in process automation devices. It should be noted that the processing of inaccuracies is carried out in the same software blocks where the process variable is processed. For example, if you use the function of stabilizing the temperature control at the outlet of the heat exchanger, then if the channel fails, its value may go to the extreme position, or (worse) remain unchanged. If the inaccuracy property is present, a separate alarm will be generated for this parameter (eg "Heat exchanger temperature measurement channel failure") and the stabilization function will move the valves to a safe state. It should be noted that such a program structure requires a state-oriented approach even for regulatory functions.

#### Troubleshooting

Lack of contextual diagnostics of the process, equipment and control system leads to a significant amount of time to identify the fact and cause of the fault. For example, an excessively low alarm may occur when the input analog channel is interrupted. In this case, basic software analysis could result in the channel being unreliable. It should be noted that this level is often present in modern ICS. However, a fault in the channel can be caused by a number of reasons: for example, a fault in the measuring channel to the PLC, or a fault in the electronics of the channel in the PLC itself. Modern PLCs provide the ability to deep software diagnostics of channels, identifying the causes of failure. This additional information allows you to troubleshoot much faster.

Another problem is the elimination of defective parts of the PLC and the replacement of technical means with some characteristics to others. The presence of spare modules of controllers in the enterprise, as a rule, is characteristic only for the most critical positions. In other words, it is sometimes necessary to wait for a new module for several months to troubleshoot, which is not acceptable for all processes. Given that often the channels (or groups of channels) fail and not the whole module, and the PLC has available free (unused) channels of the same type, it would be appropriate to provide the ability to "switch channels \". Changing the technical means often requires a change in the measuring range, which must also be provided in the ICS.

### Debugging the system

When setting up the system there are a number of difficulties associated with the implementation of ICS. Debugging the program and the system as a whole need to ensure compliance with the following requirements:

1) the need to change the state of the input variable, regardless of the value of the physical channel to test the algorithm;

2) the need for rapid response of simulated sensor signals when checking the operation of the algorithm without the existing process (for example, the sensors of the end position of the valves, when opening them);

3) the need to change the value of the output channel, regardless of the state of the program when checking the output channels.

To fulfill the first 2 requirements of the classical approach to debugging the program (step-by-step verification of the actions in the table, etc.) requires a large amount of routine work that is performed constantly. In the world of computer programming, software tests are used for this purpose, but in ICS these mechanisms are insufficiently developed. The third requirement requires the participation of the software developer for controllers to perform forcing operations, change the value of the unused channel, and so on. Software simulation and forcing, which should be available from the HMI, can help with this.

### Staff training

Often no attention is paid to staff training at all. The problem is related to the need to train staff directly on the real object. However, most situations cannot be simulated manually, as they depend entirely on the actual process. It is not allowed to simulate critical situations on a real object at all.

An option to overcome these limitations is to use simulation directly in the controller program, which will also make it easier to debug the software part of the system without an existing object. In addition, software packages for software development of controllers of high and medium complexity usually include PLC simulators, which allows you to "deploy" the control system anywhere.

### Creating large projects

Creating large projects requires a lot of routine work. It becomes even more complicated when the software development process is performed in parallel with the design processes, which leads to constant changes in the source data for the software. As a result, the program needs to be constantly changed in several places, which leads to errors related to the human factor.

The selection of duplicate parts and their rules for implementation in the application program significantly speeds up the development process and reduces the number of errors. Changing the algorithm of a typical object with such code construction leads to a change in one place.

In addition, given the iterative development process, the constant change of requirements and initial data, it is necessary to automate development processes. The first step is to standardize the representation of software objects, the second - to create software to automate the conversion of project data (list of process variables, actuators, etc.) into program code.

<-- [Section 1: Main ideas](README_EN.md)

--> [1.2 Basic technologies based on the framework](1_2_tech_en.md)
