module.exports = function (app, swig, gestorBD) {

    app.get("/registrarse", function (req, res) {
        var respuesta = swig.renderFile('views/bregistro.html', {});
        res.send(respuesta);
    });

    app.post('/registrarse', function (req, res) {

        if (req.body.password.toString() != req.body.passwordConfirm.toString())
            res.redirect("/registrarse?mensaje=Las claves no coinciden");
        else {
            var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
                .update(req.body.password).digest('hex');
            var usuario = {
                name: req.body.name,
                lastName: req.body.lastName,
                email: req.body.email,
                password: seguro
            }

            gestorBD.insertarUsuario(usuario, function (id) {
                if (id == null) {
                    console.log("Registro: error al registrar usuario");
                    res.redirect("/registrarse?mensaje=Error al registrar usuario");
                } else {
                    console.log("Registro: usuario con id = "+ id.toString() + " registrado")
                    res.redirect("/identificarse?mensaje=Nuevo usuario registrado");

                }
            });
        }
    });

    app.get("/identificarse", function (req, res) {
        var respuesta = swig.renderFile('views/bidentificacion.html', {});
        res.send(respuesta);
    });

    app.post("/identificarse", function (req, res) {
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        var criterio = {
            email: req.body.email,
            password: seguro
        }
        gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                req.session.usuario = null;
                console.log("Login: identificación fallida");
                res.redirect("/identificarse" +
                    "?mensaje=Email o password incorrecto"+
                    "&tipoMensaje=alert-danger ");
            } else {
                req.session.usuario = usuarios[0].email;
                console.log("Login: usuario con email = "+ req.session.usuario + " identificado");
                res.redirect("/user/list");
            }
        });
    });

    app.get("/desconectarse", function (req, res) {

        if(req.session.usuario != null) {
            console.log("Logout: usuario con email = "+ req.session.usuario + " desconectado");
            req.session.usuario = null;
        }
        var respuesta = swig.renderFile('views/bidentificacion.html', {});
        res.send(respuesta);
    });

    app.get("/user/list", function(req, res) {
        var criterio = {};
        if (req.query.busqueda != null) {
            criterio = {"nombre": {$regex: ".*" + req.query.busqueda + ".*"}};
        }
        var pg = parseInt(req.query.pg); // Es String !!!
        if (req.query.pg == null) { // Puede no venir el param
            pg = 1;
        }

        gestorBD.obtenerUsuariosPg(criterio, pg, function (usuarios, total) {
            if (usuarios == null) {
                res.send("Error al listar ");
            } else {
                var pgUltima = total / 4;
                if (total % 4 > 0) { // Sobran decimales
                    pgUltima = pgUltima + 1;
                }
                var respuesta = swig.renderFile('views/buserslist.html',
                    {
                        usuarios: usuarios,
                        pgActual: pg,
                        pgUltima: pgUltima
                    });
                res.send(respuesta);
            }
        });
    });

};