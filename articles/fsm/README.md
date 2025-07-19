# Статті про FSM

## В ПЛК та пром автоматизації

- Pérez, Beatriz & Rubio, Angel & Zapata, María. (2012). [A systematic review of code generation proposals from state machine specifications. Information and Software Technology](Asystematicreviewofcodegenerationproposalsfromstatemachinespecifications2012.md). 54. 1045–1066. 10.1016/j.infsof.2012.04.008. 

> Ця стаття — систематичний огляд (systematic review) наукових публікацій, присвячених генерації коду на основі специфікацій автоматів станів (state machine specifications), включаючи UML state machines, finite state machines (FSM) та Harel statecharts.



- Pessemier, Wim & Deconinck, Geert & Raskin, Gert & Saey, Philippe & Winckel, Hans. (2014). [Developing a PLC-friendly state machine model: Lessons learned.](DevelopingaPLC-friendlystatemachinemodelLessonslearned2014.md) 9152. 10.1117/12.2054881. 

> Ця стаття — *"Developing a PLC-friendly state machine model: Lessons learned"* — присвячена створенню моделі станів, сумісної з ПЛК (PLC), на основі семантичного підходу і Semantic Web технологій. Вона описує досвід авторів з KU Leuven, отриманий у процесі розробки інфраструктури керування астрономічними телескопами (зокрема Mercator), орієнтованої на сучасні стандарти IEC 61131-3 та OPC UA.



- Zajac, Wojciech & Andrzejewski, Grzegorz & Krzywicki, Kazimierz & Królikowski, Tomasz. (2019). [Finite State Machine Based Modelling of Discrete Control Algorithm in LAD Diagram Language With Use of New Generation Engineering Software. Procedia Computer Science](FiniteStateMachinBasedModellingofDiscreteControlAlgorithminLAD2019.md). 159. 2560-2569. 10.1016/j.procs.2019.09.431. 

> У статті описано процес моделювання дискретної системи керування хімічним реактором. Для проєктування алгоритму керування було використано методологію скінченного автомата, яка вважається однією з найефективніших для моделювання складних задач керування. Було визначено вхідні та вихідні сигнали процесу, залежності та правила роботи, а також описано функціонування системи. Сформований алгоритм реалізовано мовою діаграм LAD із використанням сучасного програмного забезпечення для інженерії керування — TIA Portal від Siemens. Процес реалізації описано та проаналізовано, наведено результати реалізації й сформульовано висновки.



- Racchetti, Lorenzo & Fantuzzi, Cesare & Tacconi, Lorenzo & Bonfé, Marcello. (2014). [The PLC UML State-chart design pattern. 19th IEEE International Conference on Emerging Technologies and Factory Automation](), ETFA 2014. 10.1109/ETFA.2014.7005309. 

> У даній роботі ми розробили об’єктно-орієнтований патерн проєктування для UML-діаграм станів, призначений для ПЛК за стандартом IEC 61131-3. Цей патерн — PLC UML State-chart Design Pattern — покликаний дослідити переваги об’єктно-орієнтованого програмування, яке підтримується IEC 61131-3, а також забезпечити пряме відображення UML-діаграм станів у код ПЛК. Ми демонструємо цей патерн і його використання за допомогою UML-діаграм класів і прикладу застосування. Запропонований патерн може зменшити час розробки автоматів станів у програмному забезпеченні для автоматизації. Крім того, він може стати основою для подальших досліджень у галузі патернів проєктування для ПЛК, здатних покращити весь процес розроблення ПЗ для автоматизації.



- B. Vogel-Heuser, D. Witsch, and U. Katzke. Automatic code generation from a uml model to iec 61131-3 and system configuration tools. In Control and Automation, 2005. ICCA’05. International Conference on, volume 2, pages 1034–1039. IEEE, 2005.

> Адаптивний підхід до розробки програмного забезпечення для вбудованих систем було перенесено в галузі автоматизації та керування процесами. З використанням UML 1.4 було розроблено підхід, який дозволяє автоматично генерувати код IEC 61131-3 з UML-моделі та імпортувати його в soft-ПЛК. Згенерований код IEC 61131 складається з ST та SFC. Крім того, архітектура системи є частиною UML-моделі, що дозволяє поєднати апаратну та програмну інженерію. Цей підхід було оцінено на прикладі сортувальної машини та за участі експертів з автоматизації. Робота є частиною ширшого проєкту з розвитку UML для процесної автоматизації та оцінки зручності його використання фахівцями з автоматизації.



- D. Witsch, M. Ricken, B. Kormann, and B. Vogel-Heuser. Plc-statecharts: An approach to integrate umlstatecharts in open-loop control engineering. In Industrial Informatics (INDIN), 2010 8th IEEE International Conference on, pages 915–920. IEEE, 2010.

> У цій статті визначено адаптацію UML-діаграм станів, яку можна використовувати як візуальну мову програмування для ПЛК. Такі PLC-statecharts поєднують переваги UML-діаграм станів із суворою формальною основою та спеціалізованими функціями для програмування ПЛК. Наприкінці коротко представлено емпіричне дослідження щодо PLC-statecharts.



- S. Seidel, T. Klotz, U. Donath, and J. Haufe. Modelling the real-time behaviour of machine controls using uml statecharts. In Emerging Technologies and Factory Automation (ETFA), 2010 IEEE Conference on, pages 1–8. IEEE, 2010.



- A. Vidanapathirana, S. Dewasurendra, and S. Abeyratne. [Statechart based modeling and controller implementation of complex reactive systems. In Industrial and Information Systems (ICIIS)](StatechartBasedModelingandControllerImplementationofComplexReactive2011.md), 2011 6th IEEE International Conference on, pages 493–498. IEEE, 2011.

> У цій роботі представлено простий і зрозумілий метод проєктування та реалізації реконфігурованого контролера ліфта з використанням ПЛІС, який можна реалізувати для ліфта з будь-якою кількістю поверхів (N), за наявності заданих входів і виходів. Було застосовано підхід, заснований на моделюванні. Початково було розроблено модель на основі діаграми станів для прототипу ліфта з трьома поверхами. Розглянуто розширення цієї моделі для змінної кількості поверхів. Контролер для прототипу було реалізовано мовою Ladder у середовищі ПЛК, при цьому було виявлено обмеження такого підходу з точки зору реконфігурованості, зокрема при розширенні контролера ліфта на 'N' поверхів. Далі було розроблено код VHDL для реконфігурованого контролера ліфта, в якому зміна змінної, що відповідає потрібній кількості поверхів, дозволяє згенерувати відповідний код. Цей контролер може бути реалізований на ПЛІС. Метод було успішно протестовано на ПЛІС Xilinx Spartan 3AN.

## В ІТ

- Khurshid, S., PĂsĂreanu, C.S., Visser, W. (2003). [Generalized Symbolic  Execution for Model Checking and Testing](GeneralizedSymbolicExecutionforModelCheckingandTesting2003.md). In: Garavel, H., Hatcliff, J. (eds) Tools and  Algorithms for the Construction and Analysis of Systems. TACAS 2003.  Lecture Notes in Computer Science, vol 2619. Springer, Berlin,  Heidelberg. https://doi.org/10.1007/3-540-36577-X_40

> Сучасні програмні системи, які часто є багатопоточними та працюють зі складними структурами даних, повинні бути надзвичайно надійними. У цій роботі представлено нову платформу, засновану на символічному виконанні, для автоматизованої перевірки таких систем. Ми запропонували двоаспектне узагальнення традиційного підходу на основі символічного виконання. По-перше, ми визначаємо трансляцію з мови на мову з інструментуванням програми, що дає змогу стандартним засобам моделювання виконання здійснювати символічне виконання програми. По-друге, ми пропонуємо новий алгоритм символічного виконання, який підтримує динамічно виділені структури (наприклад, списки та дерева), передумови методів (наприклад, ациклічність), дані (наприклад, цілі числа та рядки) й багатопоточність.
>
> Інструментування програми дозволяє засобу моделювання автоматично досліджувати різні конфігурації купи програми та оперувати логічними формулами над даними програми (за допомогою процедури прийняття рішень). Ми демонструємо два прикладні застосування нашої платформи: перевірку правильності багатопоточних програм, які отримують вхідні дані з необмежених за розміром і складних за структурою доменів, а також генерацію неізоморфних тестових вхідних даних, що задовольняють певному критерію тестування. Наша реалізація для Java використовує засіб моделювання Java PathFinder.