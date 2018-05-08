module.exports = {
    mongo: null, app: null,
    init: function (app, mongo) {
        this.mongo = mongo;
        this.app = app;
    },

    insertarUsuario: function (usuario, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('usuarios');
                collection.insert(usuario, function (err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    }

                    db.close();
                });
            }
        });
    },

    obtenerUsuarios: function (criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('usuarios');
                collection.find(criterio).toArray(function (err, usuarios) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(usuarios);
                    }
                    db.close();
                });
            }
        });
    },

    obtenerUsuariosPg: function (criterio, pg, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('usuarios');
                collection.count(function (err, count) {
                    collection.find(criterio).skip((pg - 1) * 5).limit(5)
                        .toArray(function (err, usuarios) {
                            if (err) {
                                funcionCallback(null);
                            } else {
                                funcionCallback(usuarios, count);
                            }
                            db.close();
                        });
                });
            }
        });
    },
    //TODO: añadir el resto de colecciones que se vayan creando aquí
    clearDB: function () {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (!err) {
                db.dropCollection("usuarios", function (err, delOK) {
                    if (err) console.log("Se ha producido un error al borrar la collection usuarios");
                    if (delOK) console.log("Collection usuarios borrada");
                    db.close();
                });
            }
        });
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (!err) {

                db.createCollection("usuarios", function (err, delOK) {
                    if (err) console.log("Se ha producido un error al crear la collection usuarios");
                    if (delOK) console.log("Collection usuarios creada");
                    db.close();
                });
            }
        });
    }
};