# Vessel with One Inlet, One Outlet, and Heating (smTankT)

## Brief Description and Purpose

A function block that simulates the operation of level and temperature sensors for a vessel with one inlet, one outlet, and heating medium supply to the jacket, used in the simulation model as tanks T1 and T2 (Fig. 1).

![img](media/smlplant.png)

Fig. 1. Image of the simulated installation for testing PACFramework blocks.

The block receives inlet and outlet flow rates (in m³/s), heating medium flow rate and temperature, and inlet material temperature as inputs. It outputs the level `L` in meters, outlet temperature `T`, and additional parameters: volume `V` and the averaged jacket temperature `Ta`.

A detailed description of the simulation principles can be found at [this link](4_4_simul_EN.md).

## Implementation in IEC-61131

### ST

```pascal
FUNCTION_BLOCK "smTankT"

   VAR_INPUT 
      INIT : Bool;    // initialization command (sets initial conditions)
      Fin : Real;     // liquid inlet flow rate, m³/s
      Fout : Real;    // liquid outlet flow rate, m³/s
      Fa : Real;      // heating medium flow rate, m³/s
      Tin : Real;     // inlet temperature, °C
      Tain : Real;    // heating medium temperature, °C
   END_VAR

   VAR_OUTPUT 
      L : Real;       // liquid level in the vessel, m
      V : Real;       // liquid volume in the vessel, m³
      T : Real;       // liquid temperature in the vessel, °C
      Ta : Real;      // heating medium temperature in the jacket, °C
   END_VAR

   VAR 
      K1 : Real;      // coefficient
      K2 : Real;      // coefficient
      Vold : Real;    // previous step volume, m³
      S : Real;       // effective heat exchange surface area of the jacket with the vessel, m²/s
      d_t : Real := 0.1;     // call period, s
      Vmax : Real := 10.0;   // vessel volume, m³
      Sv : Real := 1.0;      // cross-sectional area of the vessel, m²
      V0 : Real := 0.0;      // initial liquid volume in the vessel, m³
      T0 : Real := 20.0;     // initial liquid temperature in the vessel, °C
      Ta0 : Real := 20.0;    // initial heating medium temperature in the jacket, °C
      Sa : Real := 10.0;     // total heat exchange surface area of the jacket, m²
      C : Real := 4.19;      // specific heat capacity of the liquid, kJ/(kg*K)
      Ca : Real;             // specific heat capacity of the heating medium, kJ/(kg*K)
      k : Real := 2.0;       // heat transfer coefficient, kW/(m²*°C)
      ro : Real := 1000.0;   // liquid density, kg/m³
      roa : Real := 1000.0;  // heating medium density, kg/m³
      Va : Real := 1.0;      // jacket volume, m³
      La : Real := 1.0;      // jacket height, m
   END_VAR

BEGIN
    IF INIT THEN
        V := V0; T := T0; Ta := Ta0;
    END_IF;
    (*------- volume calculation -------*)
    Vold := V;
    V := V + d_t * (Fin - Fout);
    IF V < 0.0 THEN V := 0.0; END_IF;
    IF V > Vmax THEN V := Vmax; END_IF;
    L := V / Sv;
    (*------- temperature calculation -------*)
    IF L > La THEN
        S := (L / La) * Sa;
    ELSE
        S := Sa;
    END_IF;
    K1 := k * S / (ro * C);
    K2 := k * S / (roa * Ca);
    IF V > Vmax / 1000.0 THEN (* non-zero volume *)
        IF V < Vmax THEN (* vessel not full *)
            T := T * (Vold / V) + (d_t / V) * (Fin * Tin + K1 * (Ta - T) - Fout * T);
        ELSE (* vessel full *)
            T := T + (d_t / Vmax) * K1 * (Ta - T);
        END_IF;
        Ta := Ta + (d_t / Va) * (Fa * (Tain - Ta) - K2 * (Ta - T));
    ELSE (* empty vessel *)
        T := Tin;
        Ta := Ta + (d_t / Va) * (Fa * (Tain - Ta));
    END_IF;
END_FUNCTION_BLOCK

```

