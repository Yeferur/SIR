const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const connection = require('../database/db');
const { promisify } = require('util');

exports.register = async (req, res) => {
    try {
        const rol = req.body.rol;
        const name = req.body.name;
        const id_user = req.body.id_user;
        const apellidos = req.body.apellidos;
        const phone = req.body.phone;
        const username = req.body.username;
        const email = req.body.email;
        const pswd2 = req.body.pswd2;
        let passwordHash = await bcryptjs.hash(pswd2, 8);
        connection.query('INSERT INTO users SET ?', { id_user: id_user, name: name, apellidos: apellidos, phone: phone, username: username, email: email, password: passwordHash, rol: rol }, async (error, results) => {
            if (error) {
                console.log(error)
            }
            res.redirect('/');
        })
    } catch (error) {
        console.log(error)
    }
}

exports.login = async (req, res) => {
    try {
        const user = req.body.user;
        const pass = req.body.pass;
        let passwordHash = await bcryptjs.hash(pass, 8);
        if (!user || !pass) {
            res.render('login', {
                layout: false,
                error: 'Ingrese los datos solicitados'
            })
        } else {
            connection.query('SELECT * FROM users WHERE email = ?', [user], async (error, results, fields) => {
                if (results.length == 0 || !(await bcryptjs.compare(pass, results[0].password))) {
                    res.render('login', {
                        layout: false,
                        error: 'E-mail y/o contraseña incorrecto'
                    });
                } else {
                    //creamos una var de session y le asignamos true si INICIO SESSION       
                    const id_user = results[0].id_user
                    const token = jwt.sign({ id_user: id_user }, process.env.JWT_SECRET, {
                        expiresIn: process.env.jwt_expires
                    })
                    const cookieOptions = {
                        expires: new Date(Date.now() + process.env.cookie_expires * 24 * 60 * 60 * 1000),
                        httpOnly: true
                    }
                    res.cookie('jwt', token, cookieOptions)
                    res.render('login', {
                        layout: false,
                        name: results[0].name

                    });
                }
                res.end();
            });
        }
    } catch (error) {
        console.log(error)
    }
}

exports.isAuthenticated = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)
            connection.query('SELECT * FROM users WHERE id_user = ?', [decodificada.id_user], (error, results) => {
                if (!results) { return next() }
                rol = results[0].rol
                req.user = results[0]
                return next()
            })
        } catch (error) {
            console.log(error)
            return next()
        }
    } else {
        res.redirect('/login')
    }
}

exports.logout = (req, res) => {
    res.clearCookie('jwt')
    return res.redirect('/')
}

exports.saveNuevaReserva = async (req, res) => {
    try {
        var Id_Reserva = req.body.Id_Reserva;
        var NumeroPasajeros = req.body.input_numpas;
        var TotalPasajeros = req.body.total_pas;
        var TourReserva = req.body.SelectTour;
        var PuntoEncuentro = req.body.NombrePunto;
        var FechaReserva = req.body.FechaReserva;
        var TelefonoReserva = req.body.TelefonoReserva;
        var IdiomaReserva = req.body.IdiomaReserva;
        var CategoriaReserva = req.body.Categoria;
        var NombreReporta = req.body.NombreReporta;
        var HoraSalida = req.body.HoraSalida;
        var Ruta = req.body.Ruta;
        var Observaciones = req.body.Observaciones;
        var NomPas = req.body.NomPas;
        var TipoPasajero = req.body.TipoPasajero;
        var IdPas = req.body.IdPas;
        var Telefono = req.body.Telefono;
        var Precio = req.body.Precio;
        var Comision = req.body.Comision;
        var Culminada = 0;
        var Confirmacion = 1;

        var TipoHistory = 'Reserva';
        var AccionHistory = 'Nuevo';

        var id_user = req.body.id_user;

        var fecha = new Date();
        var dia = String(fecha.getDate()).padStart(2, '0');
        var mes = String(fecha.getMonth() + 1).padStart(2, '0');
        var año = fecha.getFullYear();
        var FechaRegistro = año + '-' + mes + '-' + dia

        connection.query('INSERT INTO History SET ?', {
            Id_Reserva: Id_Reserva, Tipo: TipoHistory, Accion: AccionHistory, id_user: id_user, FechaRegistro: FechaRegistro
        }, async (errorHistory, resultHistory) => {
            if (errorHistory) {
                console.log(errorHistory)
                res.render("Reservas/NuevaReserva", {
                    alert: true,
                    alertTitle: "¡Ocurrió un error!",
                    alertMessage: "No fue posible crear la reserva. Si el error continúa, comuníquese con soporte técnico.",
                    alertIcon: "error",
                    showConfirmButton: false,
                    timer: 3500,
                    ruta: "Reservas/NuevaReserva",
                });
            } else {
                connection.query('INSERT INTO Reservas SET ?', { Id_Reserva: Id_Reserva, NumeroPasajeros: NumeroPasajeros, TotalPasajeros: TotalPasajeros, TourReserva: TourReserva, PuntoEncuentro: PuntoEncuentro, FechaReserva: FechaReserva, TelefonoReserva: TelefonoReserva, IdiomaReserva: IdiomaReserva, CategoriaReserva: CategoriaReserva, NombreReporta: NombreReporta, HoraSalida: HoraSalida, Ruta: Ruta, Observaciones: Observaciones, FechaRegistro: FechaRegistro, Culminada: Culminada }, async (errorReserva, resultReserva) => {
                    if (errorReserva) {
                        console.log(errorReserva);

                        res.render("Reservas/NuevaReserva", {
                            alert: true,
                            alertTitle: "¡Ocurrió un error!",
                            alertMessage: "No fue posible crear la reserva. Si el error continúa, comuníquese con soporte técnico.",
                            alertIcon: "error",
                            showConfirmButton: false,
                            timer: 3500,
                            ruta: "Reservas/NuevaReserva",
                        });
                    } else {
                        for (i = 0; i < TotalPasajeros; i++) {
                            connection.query('INSERT INTO Pasajeros SET ?', {
                                Id_Reserva: Id_Reserva, NombrePasajero: NomPas[i], TipoPasajero: TipoPasajero[i], IdPas: IdPas[i], TelefonoPasajero: Telefono[i], PrecioTour: Precio[i], Comision: Comision[i], Fecha: FechaRegistro, Confirmacion: Confirmacion
                            }, async (errorPasajeros, resultPasajeros) => {
                                if (errorPasajeros) {
                                    console.log(errorPasajeros);
                                    res.render("Reservas/NuevaReserva", {
                                        alert: true,
                                        alertTitle: "¡Ocurrió un error!",
                                        alertMessage: "No fue posible crear la reserva. Si el error continúa, comuníquese con soporte técnico.",
                                        alertIcon: "error",
                                        showConfirmButton: false,
                                        timer: 3500,
                                        ruta: "Reservas/NuevaReserva",
                                    });
                                } else {
                                    res.render("Reservas/NuevaReserva", {
                                        alert: true,
                                        alertTitle: "Exito",
                                        alertMessage: "La reserva " + Id_Reserva + " se ha creado correctamente.",
                                        alertIcon: "success",
                                        showConfirmButton: false,
                                        timer: 2000,
                                        ruta: "Reservas/NuevaReserva",
                                    });
                                }

                            })
                        }
                    }
                })
            }
        })

    } catch (error) {
        console.log(error);
    }
}

exports.saveEditReserva = async (req, res, next) => {
    try {
        var Id_Reserva = req.body.Id_Reserva;
        var NumeroPasajeros = req.body.input_numpas;
        var TotalPasajeros = req.body.total_pas;
        var TotalPasajeros_Old = req.body.TotalPasajeros
        var NewPasajeros = req.body.NewPasajeros;
        var TourReserva = req.body.SelectTour;
        var PuntoEncuentro = req.body.NombrePunto;
        var FechaReserva = req.body.FechaReserva;
        var TelefonoReserva = req.body.TelefonoReserva;
        var IdiomaReserva = req.body.IdiomaReserva;
        var CategoriaReserva = req.body.Categoria;
        var NombreReporta = req.body.NombreReporta;
        var HoraSalida = req.body.HoraSalida;
        var Ruta = req.body.Ruta;
        var Observaciones = req.body.Observaciones;
        var NomPas = req.body.NomPas;
        var TipoPasajero = req.body.TipoPasajero;
        var IdPas = req.body.IdPas;
        var Telefono = req.body.Telefono;
        var Precio = req.body.Precio;
        var Comision = req.body.Comision;
        var id = req.body.id;

        var New_NomPas = req.body.New_NomPas;
        var New_TipoPasajero = req.body.New_TipoPasajero;
        var New_IdPas = req.body.New_IdPas;
        var New_Telefono = req.body.New_Telefono;
        var New_Precio = req.body.New_Precio;
        var New_Comision = req.body.New_Comision;

        var Confirmacion = 1;

        var id_user = req.body.id_user;

        var TipoHistory = 'Reserva';
        var AccionHistory = 'Editar';

        var fecha = new Date();
        var dia = String(fecha.getDate()).padStart(2, '0');
        var mes = String(fecha.getMonth() + 1).padStart(2, '0');
        var año = fecha.getFullYear();
        var FechaRegistro = año + '-' + mes + '-' + dia

        connection.query('INSERT INTO History SET ?', {
            Id_Reserva: Id_Reserva, Tipo: TipoHistory, Accion: AccionHistory, id_user: id_user, FechaRegistro: FechaRegistro
        }, async (errorHistory, resultHistory) => {
            if (errorHistory) {
                console.log(errorHistory)
                res.render("Reservas/EditarReserva", {
                    alert: true,
                    alertTitle: "¡Ocurrió un error!",
                    alertMessage: "No fue posible actualizar la reserva. Si el error continúa, comuníquese con soporte técnico.",
                    alertIcon: "error",
                    showConfirmButton: false,
                    timer: 3500,
                    ruta: "Reservas/EditarReserva/" + Id_Reserva + "",
                });
            } else {
                console.log("ok 1")
                connection.query('UPDATE Reservas SET ? WHERE Id_Reserva = ?', [{ NumeroPasajeros: NumeroPasajeros, TotalPasajeros: TotalPasajeros, TourReserva: TourReserva, PuntoEncuentro: PuntoEncuentro, FechaReserva: FechaReserva, TelefonoReserva: TelefonoReserva, IdiomaReserva: IdiomaReserva, CategoriaReserva: CategoriaReserva, NombreReporta: NombreReporta, HoraSalida: HoraSalida, Ruta: Ruta, Observaciones: Observaciones, FechaRegistro: FechaRegistro }, Id_Reserva], async (errorReserva, resultReserva) => {
                    if (errorReserva) {
                        console.log(errorReserva);
                        res.render("Reservas/EditarReserva", {
                            alert: true,
                            alertTitle: "¡Ocurrió un error!",
                            alertMessage: "No fue posible actualizar la reserva. Si el error continúa, comuníquese con soporte técnico.",
                            alertIcon: "error",
                            showConfirmButton: false,
                            timer: 3500,
                            ruta: "Reservas/EditarReserva/" + Id_Reserva + "",
                        });
                    } else {
                        console.log("ok 2")
                        for (i = 0; i < TotalPasajeros_Old; i++) {
                            connection.query('UPDATE Pasajeros SET ? where id = ?', [{
                                NombrePasajero: NomPas[i], IdPas: IdPas[i], TelefonoPasajero: Telefono[i], PrecioTour: Precio[i], Comision: Comision[i], Fecha: FechaRegistro
                            }, id[i]], async (errorPasajeros, resultPasajeros) => {

                                if (errorPasajeros) {
                                    console.log(errorPasajeros);
                                    res.render("Reservas/EditarReserva", {
                                        alert: true,
                                        alertTitle: "¡Ocurrió un error!",
                                        alertMessage: "No fue posible actualizar la reserva. Si el error continúa, comuníquese con soporte técnico.",
                                        alertIcon: "error",
                                        showConfirmButton: false,
                                        timer: 3500,
                                        ruta: "Reservas/EditarReserva/" + Id_Reserva + "",
                                    });
                                }

                            })
                        }
                        if (i == TotalPasajeros_Old) {
                            if (New_NomPas != undefined) {
                                for (i = 0; i < NewPasajeros; i++) {
                                    connection.query('INSERT INTO Pasajeros SET ?', {
                                        Id_Reserva: Id_Reserva, NombrePasajero: New_NomPas[i], TipoPasajero: New_TipoPasajero[i], IdPas: New_IdPas[i], TelefonoPasajero: New_Telefono[i], PrecioTour: New_Precio[i], Comision: New_Comision[i], Fecha: FechaRegistro, Confirmacion: Confirmacion
                                    }, async (errorPasajeros, resultPasajeros) => {
                                        if (errorPasajeros) {
                                            console.log(errorPasajeros);
                                            res.render("Reservas/EditarReserva", {
                                                alert: true,
                                                alertTitle: "¡Ocurrió un error!",
                                                alertMessage: "No fue posible agregar los nuevos pasajeros. Si el error continúa, comuníquese con soporte técnico.",
                                                alertIcon: "error",
                                                showConfirmButton: false,
                                                timer: 3500,
                                                ruta: "Reservas/EditarReserva/" + Id_Reserva + "",
                                            });
                                            
                                        } 
                                    })
                                }

                                if( i == NewPasajeros){
                                    res.render("Reservas/EditarReserva", {
                                        alert: true,
                                        alertTitle: "Exito",
                                        alertMessage: "La reserva " + Id_Reserva + " se ha actualizado correctamente.",
                                        alertIcon: "success",
                                        showConfirmButton: false,
                                        timer: 2000,
                                        ruta: "Reservas/EditarReserva/" + Id_Reserva + "",
                                    });
                                }
                            }else {
                                res.render("Reservas/EditarReserva", {
                                    alert: true,
                                    alertTitle: "Exito",
                                    alertMessage: "La reserva " + Id_Reserva + " se ha actualizado correctamente.",
                                    alertIcon: "success",
                                    showConfirmButton: false,
                                    timer: 2000,
                                    ruta: "Reservas/EditarReserva/" + Id_Reserva + "",
                                });
                            }
                        }
                    }
                })
            }
        })

    } catch (error) {
        console.log(error);
    }
}

exports.saveNuevoTransfer = async (req, res) => {
    try {
        var Id_Transfer = req.body.Id_Transfer;
        var NumeroPasajeros = req.body.input_numpas;
        var Servicio = req.body.total_pas;
        var Salida = req.body.SelectTour;
        var Llegada = req.body.NombrePunto;
        var FechaTransfer = req.body.FechaTransfer;
        var NombreReporta = req.body.NombreReporta;
        var HoraRecogida = req.body.HoraRecogida;
        var Vuelo = req.body.Vuelo;
        var TelefonoTransfer = req.body.TelefonoTransfer;
        var ValorServicio = req.body.ValorServicio;
        var Observaciones = req.body.Observaciones;
        var NomPas = req.body.NomPas;
        var IdPas = req.body.IdPas;
        var Telefono = req.body.Telefono;
        var Culminada = 0;
        var Confirmacion = 1;

        var TipoHistory = 'Transfer';
        var AccionHistory = 'Nuevo';

        var id_user = req.body.id_user;

        var fecha = new Date();
        var dia = String(fecha.getDate()).padStart(2, '0');
        var mes = String(fecha.getMonth() + 1).padStart(2, '0');
        var año = fecha.getFullYear();
        var FechaRegistro = año + '-' + mes + '-' + dia

        connection.query('INSERT INTO History SET ?', {
            Id_Reserva: Id_Reserva, Tipo: TipoHistory, Accion: AccionHistory, id_user: id_user, FechaRegistro: FechaRegistro
        }, async (errorHistory, resultHistory) => {
            if (errorHistory) {
                console.log(errorHistory)
                res.render("Transfer/NuevoTransfer", {
                    alert: true,
                    alertTitle: "¡Ocurrió un error!",
                    alertMessage: "No fue posible crear la reserva. Si el error continúa, comuníquese con soporte técnico.",
                    alertIcon: "error",
                    showConfirmButton: false,
                    timer: 3500,
                    ruta: "Transfer/NuevoTransfer",
                });
            } else {
                connection.query('INSERT INTO Transfer SET ?', { Id_Transfer: Id_Transfer, NumeroPasajeros: NumeroPasajeros, Servicio: Servicio, Salida: Salida, Llegada: Llegada, FechaTransfer: FechaTransfer, NombreReporta: NombreReporta, HoraRecogida: HoraRecogida, Vuelo: Vuelo, TelefonoTransfer: TelefonoTransfer, ValorServicio: ValorServicio, Observaciones: Observaciones, FechaRegistro: FechaRegistro, Culminada: Culminada }, async (errorReserva, resultReserva) => {
                    if (errorReserva) {
                        console.log(errorReserva);

                        res.render("Transfer/NuevoTransfer", {
                            alert: true,
                            alertTitle: "¡Ocurrió un error!",
                            alertMessage: "No fue posible crear el transfer. Si el error continúa, comuníquese con soporte técnico.",
                            alertIcon: "error",
                            showConfirmButton: false,
                            timer: 3500,
                            ruta: "Transfer/NuevoTransfer",
                        });
                    } else {
                        for (i = 0; i < TotalPasajeros; i++) {
                            connection.query('INSERT INTO PasajerosTransfer SET ?', {
                                Id_Transfer: Id_Transfer, NombrePasajero: NomPas[i], IdPas: IdPas[i], TelefonoPasajero: Telefono[i], Fecha: FechaRegistro, Confirmacion: Confirmacion
                            }, async (errorPasajeros, resultPasajeros) => {
                                if (errorPasajeros) {
                                    console.log(errorPasajeros);
                                    res.render("Transfer/NuevoTransfer", {
                                        alert: true,
                                        alertTitle: "¡Ocurrió un error!",
                                        alertMessage: "No fue posible crear el transfer. Si el error continúa, comuníquese con soporte técnico.",
                                        alertIcon: "error",
                                        showConfirmButton: false,
                                        timer: 3500,
                                        ruta: "Transfer/NuevoTransfer",
                                    });
                                } else {
                                    res.render("Transfer/NuevoTransfer", {
                                        alert: true,
                                        alertTitle: "Exito",
                                        alertMessage: "El transfer " + Id_Reserva + " se ha creado correctamente.",
                                        alertIcon: "success",
                                        showConfirmButton: false,
                                        timer: 2000,
                                        ruta: "Transfer/NuevoTransfer",
                                    });
                                }

                            })
                        }
                    }
                })
            }
        })

    } catch (error) {
        console.log(error);
    }
}



exports.Tours = async (req, res, next) => {
    try {
        connection.query('SELECT * FROM Tours', (error, resultsTours) => {
            if (!resultsTours) { return next() }
            req.resultsTours = resultsTours
            return next()
        })
    } catch (error) {
        console.log(error)
        return next()
    }
}
exports.Categoria = async (req, res, next) => {
    try {
        connection.query('SELECT * FROM CategoriaCliente', (error, resultsCategoria) => {
            if (!resultsCategoria) { return next() }
            req.resultsCategoria = resultsCategoria
            return next()
        })
    } catch (error) {
        console.log(error)
        return next()
    }
}


exports.VerReservas = async (req, res, next) => {
    try {
        connection.query('SELECT * FROM Reservas as R inner join Tours as T on R.TourReserva = T.Id_Tour', (error, resultsReservas) => {
            if (!resultsReservas) { return next() }
            req.resultsReservas = resultsReservas
            return next()
        })
    } catch (error) {
        console.log(error)
        return next()
    }
}

exports.VerTransfer = async (req, res, next) => {
    try {
        connection.query('SELECT * FROM Transfer', (error, resultsTransfer) => {
            if (!resultsTransfer) { return next() }
            req.resultsTransfer = resultsTransfer
            return next()
        })
    } catch (error) {
        console.log(error)
        return next()
    }
}

// exports.VerReservasTours = async (req, res, next) => {
//     try {
//         connection.query('SELECT Id_Tour, NombreTour FROM Tours', (error, resultsTours) => {
//             if (!resultsTours) { return next() }
//             req.resultsTours = resultsTours
//             return next()
//         })
//     } catch (error) {
//         console.log(error)
//         return next()
//     }

// }

exports.Cupos = async (req, res, next) => {
    try {
        connection.query('SELECT * FROM Tours WHERE Id_Tour != 1 and Id_Tour != 5', (error, resultsCupos) => {
            if (!resultsCupos) { return next() }
            req.resultsCupos = resultsCupos

            return next()
        })
    } catch (error) {
        console.log(error)
        return next()
    }
}
exports.CuposR = async (req, res, next) => {
    try {
        connection.query('SELECT * FROM Tours WHERE Id_Tour in(1)', (error, resultsCuposR) => {
            if (!resultsCuposR) { return next() }
            req.resultsCuposR = resultsCuposR[0]

            return next()
        })
    } catch (error) {
        console.log(error)
        return next()
    }
}

exports.CuposH = async (req, res, next) => {
    try {
        connection.query('SELECT * FROM Tours WHERE Id_Tour in(5)', (error, resultsCuposH) => {
            if (!resultsCuposH) { return next() }
            req.resultsCuposH = resultsCuposH[0]
            return next()
        })
    } catch (error) {
        console.log(error)
        return next()
    }
}

