module.exports = function (app, swig, gestorBD) {

    app.get("/borrarDB", function (req, res) {
        gestorBD.clearDB();
        res.redirect("/");
    });

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
                    console.log("Registro: usuario con id = " + id.toString() + " registrado")
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
                    "?mensaje=Email o password incorrecto" +
                    "&tipoMensaje=alert-danger ");
            } else {
                req.session.usuario = usuarios[0];
                console.log("Login: usuario con email = " + req.session.usuario.email + " identificado");
                res.redirect("/user/list");
            }
        });
    });

    app.get("/desconectarse", function (req, res) {

        if (req.session.usuario != null) {
            console.log("Logout: usuario con email = " + req.session.usuario.email + " desconectado");
            req.session.usuario = null;
        }
        var respuesta = swig.renderFile('views/bidentificacion.html', {});
        res.send(respuesta);
    });

    app.get("/user/list", function (req, res) {
        var criterio = {};
        if (req.query.busqueda != null) {
            criterio = {
                '$or': [{
                    "name": {$regex: ".*" + req.query.busqueda + ".*"}
                }, {"email": {$regex: ".*" + req.query.busqueda + ".*"}}]
            };
        }
        var pg = parseInt(req.query.pg);
        if (req.query.pg == null) {
            pg = 1;
        }

        gestorBD.obtenerUsuariosPg(criterio, pg, function (usuarios, total) {
            if (usuarios == null) {
                res.send("Error al listar ");
            } else {
                criterio = {
                    $or: [{
                        emailSender: req.session.usuario.email
                    },
                        {emailReceiver: req.session.usuario.email}
                    ]
                };
                gestorBD.obtenerPeticiones(criterio, function (peticiones) {
                    if (peticiones == null)
                        res.redirect("/user/list?mensaje=No existe la peticion;");
                    else {

                        criterio = {
                            $or: [{
                                emailSender: req.session.usuario.email
                            },
                                {emailReceiver: req.session.usuario.email}
                            ]
                        };


                        gestorBD.obtenerAmistades(criterio, function (amistades) {
                            if (amistades == null)
                                res.redirect("/user/list?mensaje=No existe la amistad;");
                            else {
                                var pgUltima = total / 5;
                                if (total % 5 > 0) { // Sobran decimales
                                    pgUltima = pgUltima + 1;
                                }

                                var respuesta = swig.renderFile('views/buserslist.html',
                                    {
                                        usuarios: usuarios,
                                        pgActual: pg,
                                        pgUltima: pgUltima,
                                        sesionUsuario: req.session.usuario,
                                        peticiones: peticiones,
                                        amistades: amistades
                                    });
                                res.send(respuesta);
                            }

                        });
                    }

                });
            }
        });
    });

    app.get('/user/sendFriendRequest/:id', function (req, res) {
        var emailReceiver = req.params.id;
        var peticion = {};
        var criterio = {"email": emailReceiver};
        gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if (usuarios == null)
                res.redirect("/user/list?mensaje=No existe el usuario;");
            else {
                peticion = {
                    emailSender: req.session.usuario.email,
                    nameSender: req.session.usuario.name,
                    emailReceiver: emailReceiver,
                    nameReceiver: usuarios[0].name
                };
            }
            gestorBD.insertarPeticion(peticion, function (peticion) {
                if (peticion == null) {
                    res.redirect("/user/list?mensaje=No existe el usuario;");
                } else {
                    console.log("Peticion enviada por " + req.session.usuario.email);
                    res.redirect("/user/list");
                }
            });
        });
    });

    app.get("/friendRequest/list", function (req, res) {
        var criterio = {
            emailReceiver: req.session.usuario.email
        };

        var pg = parseInt(req.query.pg);
        if (req.query.pg == null) {
            pg = 1;
        }

        gestorBD.obtenerPeticionesPg(criterio, pg, function (peticiones, total) {
            if (peticiones == null) {
                res.send("Error al listar ");
            } else {
                var pgUltima = total / 5;
                if (total % 5 > 0) { // Sobran decimales
                    pgUltima = pgUltima + 1;
                }
                var respuesta = swig.renderFile('views/bfriendRequestslist.html',
                    {
                        peticiones: peticiones,
                        pgActual: pg,
                        pgUltima: pgUltima,
                        sesionUsuario: req.session.usuario
                    });
                res.send(respuesta);
            }
        });
    });

    app.get('/user/acceptFriendRequest/:id', function (req, res) {
        var emailSender = req.params.id;
        var criterio = {"emailSender": emailSender, "emailReceiver": req.session.usuario.email};

        gestorBD.obtenerPeticiones(criterio, function (peticiones) {
            if (peticiones == null)
                res.redirect("/friendRequest/list?mensaje=No existe la peticion;");
            else {
                amistadSender = {
                    emailSender: emailSender,
                    nameSender: peticiones[0].nameSender,
                    emailReceiver: req.session.usuario.email,
                    nameReceiver: req.session.usuario.name
                };
                amistadReciever = {
                    emailSender: req.session.usuario.email,
                    nameSender: req.session.usuario.name,
                    emailReceiver: emailSender,
                    nameReceiver: peticiones[0].nameSender
                };

                gestorBD.insertarAmistad(amistadSender, function (amistad) {
                    if (amistad == null) {
                        res.redirect("/friendRequest/list?mensaje=No existe la amistad;");
                    } else {
                        console.log("Amistad entre " + emailSender + " y " + req.session.usuario.email);
                        gestorBD.insertarAmistad(amistadReciever, function (amistad) {
                            if (amistad == null) {
                                res.redirect("/friendRequest/list?mensaje=No existe la amistad;");
                            } else {
                                console.log("Amistad entre " + req.session.usuario.email + " y " + emailSender);
                                gestorBD.eliminarPeticion(criterio, function (peticiones) {
                                    if (peticiones == null) {
                                        res.redirect("/friendRequest/list?mensaje=No existe la peticion;");
                                    } else {
                                        console.log("Peticion eliminada");
                                        res.redirect("/friendRequest/list");
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    app.get("/friendship/list", function (req, res) {
        var criterio = {
            emailReceiver: req.session.usuario.email
        };

        var pg = parseInt(req.query.pg);
        if (req.query.pg == null) {
            pg = 1;
        }

        gestorBD.obtenerAmistadesPg(criterio, pg, function (amistades, total) {
            if (amistades == null) {
                res.send("Error al listar ");
            } else {
                var pgUltima = total / 5;
                if (total % 5 > 0) { // Sobran decimales
                    pgUltima = pgUltima + 1;
                }
                var respuesta = swig.renderFile('views/bfriendshipslist.html',
                    {
                        amistades: amistades,
                        pgActual: pg,
                        pgUltima: pgUltima,
                        sesionUsuario: req.session.usuario
                    });
                res.send(respuesta);
            }
        });
    });

};