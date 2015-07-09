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

<!--lang:en-->
# Use

Add launch line to package.json

<!--lang:es--]
# Uso
Agregar la linea de inicio al package.json

[!--lang:*-->
```json
{
  "scripts": {
    "auto-deploy": "auto-deploy-run server/server.js"
  }
}

```
<!--lang:en-->

Use the module in your server

<!--lang:es--]

Usar el módulo en tu servidor

[!--lang:*-->
```js
var autoDeploy = require('auto-deploy');

app.use('/tools', autoDeploy.middleware({pid:12345}));

```

<!--lang:en-->

To log into a text file you can pass the filename as an argument
to auto-deploy-run, for example:

<!--lang:es--]

Para guardar mensajes en un archivo de texto puedes pasarle el
archivo como argumento a auto-deploy-run, por ejemplo:

[!--lang:*-->
```json
{
  "scripts": {
    "auto-deploy": "auto-deploy-run -l server.log server/server.js"
  }
}

```

<!--lang:en-->

Then start the server with

<!--lang:es--]

Arrancar el servidor con

[!--lang:*-->

npm run-script auto-deploy

<!--lang:en-->

Then run commands in the URL of the browser, for example:

<!--lang:es--]

Luego en la URL del navegador ejecutar comandos, por ejemplo:

[!--lang:*-->

`http://theserver.zzz/tools/auto-deploy?restart`

`http://theserver.zzz/tools/auto-deploy?stop&pid=3344`

<!--lang:en-->

# possible improvements

* the servers checks the local repository to ensure it's cleaness (to prevent conflicts with the `git pull`)
* the possibility to register a function that checks the integrity and status of the server. 
  * in the case where it's safe to shutdown the server, it returns an explanatory message and a random code to force. ie: `force=4312`
  * the `force` option executes the indicated action anyway.

<!--lang:es--]

## mejoras posibles

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
