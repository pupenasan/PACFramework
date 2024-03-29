[PACFramework](../README.md) > [1. Основні ідеї ](README.md)

# 1.6. Концепція класифікації та кастомізація об'єктів

## Класи

Розподіл на функції та пов'язані з ними дані а також особливості їх функціонування базується на понятті класів. Класи дають можливість реалізувати загальні функції в межах одного програмного елементу. 

Якщо функції пов'язані з об'єктами обладнання, то класи розподіляються по рівням відповідно до описаного [Ієрархії устатковання в PAC Framework](1_3_equip.md). Кожен клас має унікальний CLSID в межах всієї системи, тому виникає необхідність в їх розподілі.

У якості варіанту розподілу пропонується використати наступну модель номеру класу в 16-ковому форматі:

```
16#ABCD  
```

де A - номер рівня в моделі ієрархії керування (Equipment), наприклад 0xxx - рівень каналів, 1xxx - рівень змінних, 2xxx - рівень ВМ, регуляторів та інших, 3xxx - рівень Equipment Module, 4xxx - рівень Units, 5xxx - рівень Work Center.    

B - довільна величина

C - номер типу в межах рівня класу, наприклад  CHDI(CLSID=16#001x) – дискретні вхідні канали,CHDO (CLSID=16#002x) – дискретні вихідні канали,

D - підклас, який дає можливість виділити об'єкти, які мають якусь унікальну особливість, яка принципово не змінює алгоритм на набір даних для об'єктів, але має додаткову функцію або навпаки, функція відсутня.    

## Параметри 

Параметри є тими змінними налаштування, які задають характеристики об'єкта, які мало змінюються з часом. Вони задаються при налаштуванні системи і змінюються за зміни умов експлуатації (поломки, зміни властивостей об'єкту, тощо). 

У каркасі передбачені механізми автоматичного налаштування параметрів. Зокрема бітові параметри можуть змінюватися при зв'язці кількох об'єктів. Так, наприклад, виконавчі механізми, які пов'язані з датчиками кінцевого положення, можуть змінювати параметри останніх. Зокрема, для датчиків примусово знімаються опції `PRM_ISWRN` та `PRM_ISALM`, так як в них немає сенсу. З іншого боку, якщо датчик вийшов з ладу, для тимчасового переведення ВМ в можливість роботи без датчика, для нього оператором виставляється параметр відключення DSBL. При цьому ВМ автоматично переводиться в режим роботи "без датчика".      

## Змінні стану

Змінні стану не використовуються для налаштування поведінки об'єкту.               

## Способи підстроювання алгоритму під виконання особливих дій для окремих об'єктів (кастомізація) 

Щоб не множити функції/функціональні блоки, які практично однаково працюють за винятком певних особливих дій, варто їх реалізовувати в одному і тому самому програмному елементі. При цьому є кілька способів підстроювання алгоритму під виконання особливих дій:

1) **Через CLSID.** Надати особливими об'єктам інший підклас CLSID, наприклад змінивши останню 16-кову цифру. У цьому випадку функція перевіряє CLSID і в залежності від нього виконує певні особливі (кастомні) дії. Особливий підклас надається тим об'єктам, алгоритм яких завжди передбачає виконання цих особливих дій. Таким чином один і той самий програмний елемент буде виконуватися для різних підкласів для виконання спільних алгоритмів, а умовне розгалуження за підкласом буде виконувати особливий алгоритм. Наприклад наступна частина коду виконується для всіх об'єктів класу за винятком 16#1011:

```pascal
//якщо це не DI з лічильником
IF #DIVARCFG.CLSID <> 16#1011 THEN
	#VAL := INT_TO_BOOL (#DIVARCFG.VALI);
END_IF;
```

2) **Через ID.** Якщо особливих об'єктів в класі мало (одиниці), для яких не варто виділяти окремі підкласи, у програмному елементі можна реалізовувати особливі алгоритми за перевіркою ідентифікатору ID. Наприклад:

```pascal
//для обєкту з конкретним ID
IF #DIVARCFG.ID = 10001 THEN
	#VAL := INT_TO_BOOL (#DIVARCFG.VALI);
END_IF;
```

3) **Через PRM_BIT**. Якщо особливі дії необхідно активувати або деактивувати при конфігуруванні, варто використати бітові параметри (опції) в налаштуваннях об'єкту. У наступному прикладі дія інверсії проводиться тільки за наявності відповідної активованої опції 

```pascal
//якщо параметр інвертувати стоїть
IF #PRM_INVERSE THEN
	#DI := NOT #VRAW;
ELSE
	#DI := #VRAW;
END_IF;
```

4) **Автоналаштування**. Якщо особливі дії залежать від параметрів інших об'єктів (і тільки так), параметри з варіанту 3 можна змінювати автоматично (так зване "автоналаштування"). Наприклад у наступному прикладі параметр активності відслідковування сигналізатора закритого положення для виконавчого механізму `PRM_ZCLSENBL` автоматично визначається за наявності відповідної технологічної змінної та її активності. 

```pascal
#ACTCFGu.PRM.PRM_ZCLSENBL := NOT #SCLS.PRM.PRM_DSBL AND #SCLS.ID <> 0;
```



<-- [1.5.Рекомендації щодо найменування компонентів та елементів каркасу](1_5_naming.md)

<-- [1. Основні ідеї ](README.md)
