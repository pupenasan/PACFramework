# General List of Possible Alarm Bits for Actuators (VM)

Alarm bits indicate the state of a specific actuator alarm.

Alarms determined solely by the state of the block’s input variable are not intended for use in the SCADA/HMI alarm subsystem, as they are tied to variable alarms.

| Bit Name | Alarm Name                                             | Alarm Description |
| -------- | ------------------------------------------------------ | ----------------- |
| ALMSTRT  | =1 Failed to start (resets on command or state change) |                   |
| ALMSTP   | =1 Failed to stop (resets on command or state change)  |                   |
| ALMOPN   | =1 Failed to open (Control circuit malfunction)        |                   |
| ALMCLS   | =1 Failed to close (Control circuit malfunction)       |                   |
| ALMOPN2  | =1 Failed to open                                      |                   |
| ALMCLS2  | =1 Failed to close (On-site equipment malfunction)     |                   |
| ALMSHFT  | =1 State mismatch                                      |                   |
| ALM      | =1 Drive fault (OR of alarms)                          |                   |
| ALMBELL  | =1 Bell activation command (one PLC cycle)             |                   |
| WRN      | =1 Drive warning (OR of warnings)                      |                   |
| WRNSPD1  | =1 Drive 1 slip warning, %                             |                   |
| ALMSPD1  | =1 Drive 1 slip alarm, %                               |                   |
| WRNSPD2  | =1 Drive 2 slip warning, %                             |                   |
| ALMSPD2  | =1 Drive 2 slip alarm, %                               |                   |
| ALMPWR1  | =1 Power supply missing                                |                   |
| almrez15 |                                                        |                   |
| almrez16 |                                                        |                   |
| almrez17 |                                                        |                   |
| almrez18 |                                                        |                   |
| almrez19 |                                                        |                   |
| almrez20 |                                                        |                   |
| almrez21 |                                                        |                   |
| almrez22 |                                                        |                   |
| almrez23 |                                                        |                   |
| almrez24 |                                                        |                   |
| almrez25 |                                                        |                   |
| almrez26 |                                                        |                   |
| almrez27 |                                                        |                   |
| almrez28 |                                                        |                   |
| almrez29 |                                                        |                   |
| almrez30 |                                                        |                   |
| almrez31 |                                                        |                   |