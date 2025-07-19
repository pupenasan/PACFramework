# Design and Implementation of a Statechart Based Reconfigurable Elevator Controller

A. Vidanapathirana, S. Dewasurendra, and S. Abeyratne. Statechart based modeling and controller implementation of complex reactive systems. In Industrial and Information Systems (ICIIS), 2011 6th IEEE International Conference on, pages 493–498. IEEE, 2011.

https://www.researchgate.net/publication/224909540_Statechart_Based_Modeling_and_Controller_Implementation_of_Complex_Reactive_Systems

У цій роботі представлено простий і зрозумілий метод проєктування та реалізації реконфігурованого контролера ліфта з використанням ПЛІС, який можна реалізувати для ліфта з будь-якою кількістю поверхів (N), за наявності заданих входів і виходів. Було застосовано підхід, заснований на моделюванні. Початково було розроблено модель на основі діаграми станів для прототипу ліфта з трьома поверхами. Розглянуто розширення цієї моделі для змінної кількості поверхів. Контролер для прототипу було реалізовано мовою Ladder у середовищі ПЛК, при цьому було виявлено обмеження такого підходу з точки зору реконфігурованості, зокрема при розширенні контролера ліфта на 'N' поверхів. Далі було розроблено код VHDL для реконфігурованого контролера ліфта, в якому зміна змінної, що відповідає потрібній кількості поверхів, дозволяє згенерувати відповідний код. Цей контролер може бути реалізований на ПЛІС. Метод було успішно протестовано на ПЛІС Xilinx Spartan 3AN.

**Ключові слова:** ліфт, ПЛІС, ПЛК, реконфігурований, діаграма станів, VHDL