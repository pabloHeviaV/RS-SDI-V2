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
                    res.redirect("/registrarse?mensaje=Error al registrar usuario");
                } else {
                    res.redirect("/identificarse?mensaje=Nuevo usuario registrado");
                }
            });
        }
    })
};