# HTTP API V1

Префікс усіх запитів повинен починатися з `/apiv1/`. Обмін даними відбувається в форматі JSON.

## Читання об'єкту (GET) 

Усі дані цифрового двійника можна зчитати звернувшись за його розміщенням в Global Context через метод `GET`. Наприклад:

url : `http://26.141.11.145:1880/apiv1/RT/PLC1/AIH`

body: ``

звертається до `RT/PLC1/AIH` , приклад резульату:   

```json
{ r: "get",
twn: "enicon_tokmak_tec",
p: "RT.PLC1.AIH",
v: {…},
ts: 1633765645492}
```

`r` - запит

`twn` - ім'я двійника 

`p` - запитуваний об'єкт 

`v` - значення запитуваного об'єкту 

`ts` - відмітка часу

## Читання вказаних об'єктів (POST) 

Можна вказати перелік даних, які необхідно прочитати. У URL вказується `COMB`  а у body вказується перелік потрібних об'єктів. 

Приклад запиту:

 url : `http://26.141.11.145:1880/apiv1/COMB`

body: 

```json
[
    "RT.PLC1.AIH.HBK10_CP001",
    "RT.PLC1.AIH.HHL03_CF001",
    "RT.PLC1.DIH.CJF01_GW001_DCOK",
    "masterdata.iostatistic"
]
```

приклад відповіді:   

```json
{
	"r": "get",
	"twn": "enicon_tokmak_tec",
	"p": [
		"RT.PLC1.AIH.HBK10_CP001",
		"RT.PLC1.AIH.HHL03_CF001",
		"RT.PLC1.DIH.CJF01_GW001_DCOK",
		"masterdata.iostatistic"
	],
	"v": {
		"RT.PLC1.AIH.HBK10_CP001": {...}
        ...
	},
	"ts": 1634130165006
}
```

`r` - запит

`twn` - ім'я двійника 

`p` - запитувані об'єкти 

`v` - значення запитуваних об'єктів 

`ts` - відмітка часу

## Запис значення даних (PUT)

Запис значень відбувається через метод `PUT`. 

Запис можна проводити для тих об'єктів, які надаються SCADA/HMI. Для запису в буферні об'єкти використовуються IoT буфери.

У якості `url` використовується відповідна адреса об'єкта, у якості `body`  команди та значення для запису. Наприклад, відправка команди переведення клапану `HLB10_AN001` в ручний режим:  

url: `http://26.141.11.145:1880/apiv1/RT/PLC1/ACTH/HLB10_AN001`

body: `{"CMD": "CMDMAN"}`

У відповідь при наявності даного об'єкта приходить 200. (доробити, тому що зараз приходить завжди ОК)

Правила формування тіла описано для кожного типу об'єктів нижче.



## ACTH

### Запис

При необхідності відправлення команди в тілі передається об'єкт у форматі JSON:

 `{"CMD": "CMDxxxxxx"}`

  Перелік команд:

```
CMDOPN - відкрити
CMDCLS - закрити
CMDMAN - перевести в ручний
CMDAUTO - перевести в автомат
CMDTOGGLE - переключити в зворотнє положення
```

Наприклад, відправка команди переведення клапану `HLB10_AN001` в ручний режим:  

url: `http://26.141.11.145:1880/apiv1/RT/PLC1/ACTH/HLB10_AN001`

body: `{"CMD": "CMDMAN"}`

## MODULE

### Читання

Приклад читання модулю 1:

url запиту: `http://26.141.11.145:1880/apiv1/RT/PLC1/MODULES[1]`

body відповіді:

```json
{"r":"get","twn":"enicon_tokmak_tec","p":"RT.PLC1.MODULES[1]","v":{"adr":{"byte":16,"bit":0},"val":0,"STA":{"type":"int","adr":{"byte":16,"bit":0},"val":0},"TYPE":{"type":"uint","adr":{"byte":18,"bit":0},"val":12288},"CHCNTS":{"type":"uint","adr":{"byte":20,"bit":0},"val":28672},"REZ":{"type":"int","adr":{"byte":22,"bit":0},"val":0},"STRTNMB":{"type":"array[0..3] of uint","adr":{"byte":24,"bit":0},"val":0,"data":{"0":{"adr":{"byte":24,"bit":0},"val":9},"1":{"adr":{"byte":26,"bit":0},"val":0},"2":{"adr":{"byte":28,"bit":0},"val":0},"3":{"adr":{"byte":30,"bit":0},"val":0}}},"MODID":"CJF01_A4AI","submodules":[{"type":"AI","chcnts":8,"strtnmb":9,"bad":false,"isbuf":false,"cmdbuf":false,"isiotbuf":false},{"type":"none","chcnts":0,"strtnmb":0,"bad":false,"isbuf":false,"cmdbuf":false,"isiotbuf":false},{"type":"none","chcnts":0,"strtnmb":0,"bad":false,"isbuf":false,"cmdbuf":false,"isiotbuf":false},{"type":"none","chcnts":0,"strtnmb":0,"bad":false,"isbuf":false,"cmdbuf":false,"isiotbuf":false}]},"ts":1633767729624}
```

### Запис

При необхідності відправлення команди в тілі передається об'єкт у форматі JSON:

 `{"CMD": "CMDxxxxxx"}`

Перелік команд:

```
CMDLOAD0 - завантажити в IoT буфер підмодуль 0
CMDLOAD1 - завантажити в IoT буфер підмодуль 1
CMDLOAD2 - завантажити в IoT буфер підмодуль 2
CMDLOAD3 - завантажити в IoT буфер підмодуль 3
```



## CH  

 