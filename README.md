# auto-deploy
auto deploy github based project and others

<!--multilang v0 en:README.md es:LEEME.md -->

![designing](https://img.shields.io/badge/stability-desgining-red.svg)
[![version](https://img.shields.io/npm/v/auto-deploy.svg)](https://npmjs.org/package/auto-deploy)
[![downloads](https://img.shields.io/npm/dm/auto-deploy.svg)](https://npmjs.org/package/auto-deploy)
[![linux](https://img.shields.io/travis/codenautas/auto-deploy/master.svg)](https://travis-ci.org/codenautas/auto-deploy)
[![coverage](https://img.shields.io/coveralls/codenautas/auto-deploy/master.svg)](https://coveralls.io/r/codenautas/auto-deploy)
[![climate](https://img.shields.io/codeclimate/github/codenautas/auto-deploy.svg)](https://codeclimate.com/github/codenautas/auto-deploy)
[![dependencies](https://img.shields.io/david/codenautas/auto-deploy.svg)](https://david-dm.org/codenautas/auto-deploy)

<!--multilang buttons-->

language: ![English](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-en.png)
also available in:
[![Spanish](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-es.png)](LEEME.md) - 

# Use

```js
var autoDeploy = require('auto-deploy');

app.use(autoDeploy({pid:12345, log:true, scriptName:'start' , logFile:'./server.log'}));
```

<!--lang:en-->

Then in the URL of the navigator:

<!--lang:es--]

Luego en la URL del navegador

[!--lang:*-->

`http://theserver.zzz/tools/auto-deploy?pid=12345`

or

`http://theserver.zzz/tools/auto-deploy?pid=12345&force=4312`

or

`http://theserver.zzz/tools/auto-deploy?pid=12345&restart=1`

<!--lang:en-->

# main goal

To have the possibility to specify in the address bar of the browser the need to install a new version:
* auto deploy by URL (GET request)
* the server executes a `stop` (as clean as possible, for now similar to [kill-9](//npmjs.com/packages/kill-9)
* the server runs `git pull`
* the server excutes `npm start --production`

# improvements

* the servers checks the local repository to ensure it's cleaness (to prevent conflicts with the `git pull`)
* the possibility to register a function that checks the integrity and status of the server. 
  * in the case where it's safe to shutdown the server, it returns an explanatory message and a random code to force. ie: `force=4312`
  * the `force` option executes the indicated action anyway.

<!--lang:es--]

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

[!--lang:en-->

## License

<!--lang:es--]

## Licencias

[!--lang:*-->

[MIT](LICENSE)

................