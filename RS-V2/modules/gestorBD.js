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

    insertarPeticion: function (peticion, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('peticiones');
                collection.insert(peticion, function (err, result) {
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

    obtenerPeticiones: function (criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('peticiones');
                collection.find(criterio).toArray(function (err, peticiones) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(peticiones);
                    }
                    db.close();
                });
            }

        });
    },

    obtenerPeticionesPg: function (criterio, pg, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('peticiones');
                collection.count(function (err, count) {
                    collection.find(criterio).skip((pg - 1) * 5).limit(5)
                        .toArray(function (err, peticiones) {
                            if (err) {
                                funcionCallback(null);
                            } else {
                                funcionCallback(peticiones, count);
                            }
                            db.close();
                        });
                });
            }

        });
    },

    eliminarPeticion: function (criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('peticiones');
                collection.remove(criterio, function (err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },

    insertarAmistad: function (amistad, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('amistades');
                collection.insert(amistad, function (err, result) {
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

    obtenerAmistades: function (criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('amistades');
                collection.find(criterio).toArray(function (err, amistades) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(amistades);
                    }
                    db.close();
                });
            }

        });
    },

    obtenerAmistadesPg: function (criterio, pg, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('amistades');
                collection.count(function (err, count) {
                    collection.find(criterio).skip((pg - 1) * 5).limit(5)
                        .toArray(function (err, amistades) {
                            if (err) {
                                funcionCallback(null);
                            } else {
                                funcionCallback(amistades, count);
                            }
                            db.close();
                        });
                });
            }

        });
    },

    crearMensaje: function (mensaje, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('mensajes');
                collection.insert(mensaje, function (err, result) {
                    if (err) {
                        funcionCallback(null);
                    }
                    else {
                        funcionCallback(result.ops[0]._id)
                    }
                });
            }

        });
    },

    obtenerMensajes: function (criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('mensajes');
                collection.find(criterio).toArray(function (err, mensajes) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(mensajes);
                    }
                    db.close();
                });
            }

        });
    },

    modificarMensaje: function (criterio, mensaje, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('mensajes');
                collection.update(criterio, {$set: mensaje}, function (err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },

    clearDB: function () {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (!err) {
                db.dropCollection("usuarios", function () {

                    console.log("Collection usuarios borrada");
                    db.close();
                });

                db.dropCollection("amistades", function () {

                    console.log("Collection amistades borrada");
                    db.close();
                });

                db.dropCollection("peticiones", function () {

                    console.log("Collection peticiones borrada");
                    db.close();
                });

                db.dropCollection("mensajes", function (err, delOK) {

                    console.log("Collection mensajes borrada");
                    db.close();
                });
            }
        });
    }
};