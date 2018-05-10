module.exports = function (app, gestorBD) {

    app.post("/api/autenticar/", function (req, res) {
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        var criterio = {
            email: req.body.email,
            password: seguro
        }

        gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                res.status(401); // Unauthorized
                res.json({
                    autenticado: false
                })
            } else {
                var token = app.get('jwt').sign(
                    {usuario: criterio.email, tiempo: Date.now() / 1000},
                    "secreto");
                res.status(200);
                res.json({
                    autenticado: true,
                    token: token
                })
            }
        });
    });


    app.get("/api/usuarios/", function  (req, res){
        var criterio = {
            emailSender : res.usuario
        };
        gestorBD.obtenerAmistades(criterio, function (amistades){
                if (amistades == null) {
                    res.status(500);
                    res.json({
                        error: "Se ha producido un error"
                    })
                } else {
                    res.status(200);
                    res.send(JSON.stringify(amistades));
                    console.log("Listadas las amistades de " + res.usuario);
                }
        }
        );
    });

    app.post("/api/mensaje/", function (req, res){

        var criterio = {
            emailSender : res.usuario,
            emailReceiver : req.body.receptor
        }

        gestorBD.obtenerAmistades(criterio, function(amistades){
            if (amistades.length == 0) {
                res.status(500);
                res.json({
                    error: "Se ha producido un error, los usuarios no son amigos"
                })
                console.log("Envío de mensajes: error al enviar mensaje entre" +
                   criterio.emailSender + " y " + criterio.emailReceiver + " no son amigos");
            } else {
                var mensaje = {
                    emisor : res.usuario,
                    receptor : req.body.receptor,
                    texto : req.body.texto,
                    leido : false
                }

                gestorBD.crearMensaje(mensaje, function (result) {
                    if(result == null) {
                        res.status(500);
                        res.json({
                            error: "Se ha producido un error al crear el mensaje"
                        })
                        console.log("Envío de mensajes: error al enviar mensaje entre"
                            + mensaje.emisor + " y " + mensaje.receptor);
                    }
                    else {
                        res.status(200);
                        res.json({
                            mensaje : "mensaje creado",
                            _id :  result
                        })
                        console.log("Envío de mensajes: mensaje creado entre "
                            + mensaje.emisor + " y "
                            + mensaje.receptor + "con id: " + result);
                    }
                });

            }
        });


    });

    app.get("/api/mensaje/", function (req, res) {
        var criterio = {
            $or: [{
                    emisor : res.usuario,
                    receptor : req.query.receptor
                },
                {
                    emisor : req.query.receptor,
                    receptor : res.usuario
                }]
        }

        gestorBD.obtenerMensajes(criterio, function (mensajes) {
            if(mensajes == null) {
                res.status(500);
                res.json({
                    error: "Se ha producido un error al obtener"
                })
            }
            else {
                res.status(200);
                res.send(JSON.stringify(mensajes));
                console.log("Listados los mensajes entre "
                    + res.usuario + " y " + req.query.receptor);
            }

        })

    })
};