# Vessel with One Inlet and One Outlet (smLevelCyl)

## Brief Description and Purpose

A function block that simulates the operation of level sensors for a vessel with one inlet and one outlet, used in the simulation model as dosing vessels D1 and D2 (Fig. 1).

![img](media/smlplant.png)

Fig. 1. Image of the simulated installation for testing PACFramework blocks.

The block receives inlet and outlet flow rates (in m³/s or L/s) as inputs, and outputs the level value `L` in meters or centimeters depending on the input units. It also simulates the `LSH` (high-level sensor) and `LSL` (low-level sensor) signals.

The parameters `V0`, `Vmax`, and `S` are set externally or by default. The parameter `d_t` defines the call period for correct dynamic calculation and can be used to adjust the simulation speed.

## Implementation in IEC-61131

### ST

```pascal
FUNCTION_BLOCK "smLevelCyl1"

   VAR_INPUT 
      INIT : Bool;   // initialization command (sets initial conditions)
      Fin : Real;    // inlet flow rate specified in m3/s or L/s
      Fout : Real;   // outlet flow rate specified in m3/s or L/s
   END_VAR

   VAR_OUTPUT 
      L : Real;      // level in meters or centimeters
      LSH : Bool;    // high-level sensor
      LSL : Bool;    // low-level sensor
   END_VAR

   VAR 
      d_t : Real := 0.1;   // call period in seconds
      V0 : Real;           // initial volume value during model initialization
      V : Real;            // liquid volume in the vessel
      Vmax : Real := 50.0; // vessel volume
      S : Real := 20.0;    // specified in m2 for m3/s or cm2 for L/s
   END_VAR
   
BEGIN
    IF INIT THEN
        V := V0; (* set to minimum volume on initialization *)
    ELSE
        V := V + d_t * (Fin - Fout); (* volume increment *)
        IF V < 0.0 THEN V := 0.0; END_IF; (* lower limit *)
        IF V > Vmax THEN V := Vmax; END_IF; (* upper limit *)
        L := V / S; 
        LSH := (V / Vmax) > 0.999; (* high-level sensor *)
        LSL := (V / Vmax) > 0.001; (* low-level sensor *)
    END_IF;
END_FUNCTION_BLOCK

```

