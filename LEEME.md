<!-- multilang from README.md




NO MODIFIQUE ESTE ARCHIVO. FUE GENERADO AUTOMÁTICAMENTE POR multilang.js




-->
# auto-deploy
auto deploy github based project and others


![designing](https://img.shields.io/badge/stability-desgining-red.svg)
[![version](https://img.shields.io/npm/v/auto-deploy.svg)](https://npmjs.org/package/auto-deploy)
[![downloads](https://img.shields.io/npm/dm/auto-deploy.svg)](https://npmjs.org/package/auto-deploy)
[![linux](https://img.shields.io/travis/codenautas/auto-deploy/master.svg)](https://travis-ci.org/codenautas/auto-deploy)
[![coverage](https://img.shields.io/coveralls/codenautas/auto-deploy/master.svg)](https://coveralls.io/r/codenautas/auto-deploy)
[![climate](https://img.shields.io/codeclimate/github/codenautas/auto-deploy.svg)](https://codeclimate.com/github/codenautas/auto-deploy)
[![dependencies](https://img.shields.io/david/codenautas/auto-deploy.svg)](https://david-dm.org/codenautas/auto-deploy)

<!--multilang buttons-->

idioma: ![castellano](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-es.png)
también disponible en:
[![inglés](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-en.png)](README.md)

# Use

```js
var autoDeploy = require('auto-deploy');

app.use('/tools',autoDeploy.middleware({pid:12345}));
```


Luego en la URL del navegador


`http://theserver.zzz/tools/auto-deploy?pid=12345`

or

`http://theserver.zzz/tools/auto-deploy?pid=12345?force=4312`


# objetivo principal

Poder especificar en la barra de direcciones del navegador que se desea instalar una nueva versión:
* el servidor hace un `stop` (lo más ordenado posible, por ahora algo similar a [kill-9](//npmjs.com/packages/kill-9)
* el servidor corre un `git pull`
* el servidor corre un `npm start --production`

## mejoras

* el servidor revisa primero que no haya nada sucio (para que no haya peligro de que dé conflictos al bajar)
* poder registrar una función que indique si es seguro matar el servidor 
  * en caso de que no sea seguro el servidor devuelve un mensaje explicando y un código aleatorio de force. Ej: `force=4312`
  * volviendo a intentar el deploy con force se hace aunque no sea seguro. 


## Licencias


[MIT](LICENSE)

................