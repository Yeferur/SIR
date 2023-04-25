const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const connection = require('../database/db');
const { promisify } = require('util');

exports.saveNewUser = async (req, res) => {
    try {
        const rol = req.body.rol;
        const name = req.body.name;
        const apellidos = req.body.surname;
        const id_user = req.body.dni;
        const phone = req.body.phone;
        const username = req.body.username;
        const email = req.body.email;
        const pswd = req.body.pswd;
        let passwordHash = await bcryptjs.hash(pswd, 8);
        connection.query('INSERT INTO users SET ?', { id_user: id_user, name: name, apellidos: apellidos, phone: phone, username: username, email: email, password: passwordHash, rol: rol }, async (error, results) => {
            if (error) {
                console.log(error);
                res.render("Settings/NewUser", {
                    alert: true,
                    alertTitle: "¡Ocurrió un error!",
                    alertMessage: "No fue posible crear el usuario. Si el error continúa, comuníquese con soporte técnico.",
                    alertIcon: "error",
                    showConfirmButton: false,
                    timer: 3500,
                    ruta: "Settings/NewUser",
                });
            } else {
                res.render("Settings/NewUser", {
                    alert: true,
                    alertTitle: "Exito",
                    alertMessage: "El usuario se ha creado correctamente.",
                    alertIcon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: "Settings/NewUser",
                });
            }
        })
    } catch (error) {
        console.log(error)
    }
}

exports.saveEditarUser = async (req, res) => {
    try {
        const id = req.body.id;
        const rol = req.body.rol;
        const name = req.body.name;
        const apellidos = req.body.surname;
        const id_user = req.body.dni;
        const phone = req.body.phone;
        const username = req.body.username;
        const email = req.body.email;
        const pswd = req.body.pswd;
        let passwordHash;
        if(pswd !== ''){
        passwordHash = await bcryptjs.hash(pswd, 8);
        }
        connection.query('UPDATE users SET ? WHERE id = ?', [{ id_user: id_user, name: name, apellidos: apellidos, phone: phone, username: username, email: email, rol: rol },id], async (error, results) => {
            if (error) {
                console.log(error);
                res.render("Settings/EditarUser", {
                    alert: true,
                    alertTitle: "¡Ocurrió un error!",
                    alertMessage: "No fue posible editar el usuario. Si el error continúa, comuníquese con soporte técnico.",
                    alertIcon: "error",
                    showConfirmButton: false,
                    timer: 3500,
                    ruta: "Settings/EditarUser/"+id+"",
                });
            } else {
                if(passwordHash !== undefined){
                    console.log(passwordHash)
                    connection.query('UPDATE users SET ? WHERE id = ?', [{password: passwordHash},id], async (error, results) => {
                        if (error) {
                            console.log(error);
                            res.render("Settings/EditarUser", {
                                alert: true,
                                alertTitle: "¡Ocurrió un error!",
                                alertMessage: "No fue posible editar el usuario. Si el error continúa, comuníquese con soporte técnico.",
                                alertIcon: "error",
                                showConfirmButton: false,
                                timer: 3500,
                                ruta: "Settings/EditarUser/"+id+"",
                            });
                        } else {
                            console.log('si')
                            res.render("Settings/EditarUser", {
                                alert: true,
                                alertTitle: "Exito",
                                alertMessage: "El usuario se ha editado correctamente.",
                                alertIcon: "success",
                                showConfirmButton: false,
                                timer: 1500,
                                ruta: "Settings/EditarUser/"+id+"",
                            });
                        }
                    })
                }else{
                    res.render("Settings/EditarUser", {
                        alert: true,
                        alertTitle: "Exito",
                        alertMessage: "El usuario se ha creado correctamente.",
                        alertIcon: "success",
                        showConfirmButton: false,
                        timer: 1500,
                        ruta: "Settings/EditarUser/"+id+"",
                    });
                }
            }
        })
    } catch (error) {
        console.log(error)
    }
}

exports.savePerfil = async (req, res) => {
    try {
        const id = req.body.id;
        const name = req.body.name;
        const apellidos = req.body.surname;
        const phone = req.body.phone;
        const username = req.body.username;
        const email = req.body.email;
        const pswd = req.body.pswd;
        let passwordHash;
        if((pswd !== '') & (pswd !== undefined)){
        passwordHash = await bcryptjs.hash(pswd, 8);
        }
        connection.query('UPDATE users SET ? WHERE id = ?', [{name: name, apellidos: apellidos, phone: phone, username: username, email: email },id], async (error, results) => {
            if (error) {
                console.log(error);
                res.render("Settings/Perfil", {
                    alert: true,
                    alertTitle: "¡Ocurrió un error!",
                    alertMessage: "No fue posible editar el perfil. Si el error continúa, comuníquese con soporte técnico.",
                    alertIcon: "error",
                    showConfirmButton: false,
                    timer: 3500,
                    ruta: "Settings/Perfil/"+id+"",
                });
            } else {
                if(passwordHash !== undefined){
                    connection.query('UPDATE users SET ? WHERE id = ?', [{password: passwordHash},id], async (error, results) => {
                        if (error) {
                            console.log(error);
                            res.render("Settings/Perfil", {
                                alert: true,
                                alertTitle: "¡Ocurrió un error!",
                                alertMessage: "No fue posible editar el perfil. Si el error continúa, comuníquese con soporte técnico.",
                                alertIcon: "error",
                                showConfirmButton: false,
                                timer: 3500,
                                ruta: "Settings/Perfil/"+id+"",
                            });
                        } else {
                            res.render("Settings/Perfil", {
                                alert: true,
                                alertTitle: "Exito",
                                alertMessage: "El perfil se ha editado correctamente.",
                                alertIcon: "success",
                                showConfirmButton: false,
                                timer: 1500,
                                ruta: "Settings/Perfil/"+id+"",
                            });
                        }
                    })
                }else{
                    res.render("Settings/Perfil", {
                        alert: true,
                        alertTitle: "Exito",
                        alertMessage: "El perfil se ha creado correctamente.",
                        alertIcon: "success",
                        showConfirmButton: false,
                        timer: 1500,
                        ruta: "Settings/Perfil/"+id+"",
                    });
                }
            }
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
            connection.query('SELECT * FROM users WHERE id_user = ? OR username = ? OR email = ?', [user, user, user], async (error, results, fields) => {
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

exports.ensureNotAuthenticated = async (req, res, next) => {
    if (req.cookies.jwt) {
        return res.redirect('/');
    }
    next();
}

exports.logout = (req, res) => {
    res.clearCookie('jwt')
    return res.redirect('/')
}

exports.ActualizarAforo = (req, res) => {
    try {
        var Id_Tour = req.body.Id_Tour;
        var NombreTour = req.body.NombreTour;
        var CupoBase = req.body.CupoBase;
        var CupoDia = req.body.CupoDia;
        var rol = req.body.rol;
        var render;

        if (rol == "Administrador") {
            render = "index_admin";
        } else if (rol == "Asesor") {
            render = "index_asesor";
        }

        var Fecha = new Date();
        var dia = String(Fecha.getDate()).padStart(2, '0');
        var mes = String(Fecha.getMonth() + 1).padStart(2, '0');
        var año = Fecha.getFullYear();
        var FechaRegistro = año + '-' + mes + '-' + dia;

        for (var i = 0; i < Id_Tour.length; i++) {
            connection.query('INSERT INTO Aforos SET ?', {
                NombreTour: NombreTour[i], CupoBase: CupoBase[i], CupoDia: CupoDia[i], FechaRegistro: FechaRegistro
            }, async (error, result) => {
                if (error) {
                    console.log(error)
                    res.render(render, {
                        alert: true,
                        alertTitle: "¡Ocurrió un error!",
                        alertMessage: "No fue posible actualizar el aforo. Si el error continúa, comuníquese con soporte técnico.",
                        alertIcon: "error",
                        showConfirmButton: false,
                        timer: 3500,
                        ruta: "",
                    });
                }
            })
        }
        if (i == Id_Tour.length) {
            for (var t = 0; t < Id_Tour.length; t++) {
                connection.query('UPDATE Tours SET ? WHERE Id_Tour = ?', [{
                    CupoBase: CupoBase[t], CupoDia: CupoDia[t]
                }, Id_Tour[t]], async (error, result) => {
                    if (error) {
                        console.log(error)
                        res.render(render, {
                            alert: true,
                            alertTitle: "¡Ocurrió un error!",
                            alertMessage: "No fue posible actualizar el aforo. Si el error continúa, comuníquese con soporte técnico.",
                            alertIcon: "error",
                            showConfirmButton: false,
                            timer: 3500,
                            ruta: "",
                        });
                    } else {
                        res.render(render, {
                            alert: true,
                            alertTitle: "Exito",
                            alertMessage: "El aforo se ha actualizado correctamente.",
                            alertIcon: "success",
                            showConfirmButton: false,
                            timer: 1500,
                            ruta: "",
                        });
                    }
                })
            }
        }

    } catch (error) {
        console.log(error);
    }
}

exports.ReiniciarAforo = (req, res) => {
    try {
        var Id_Tour = req.body.Id_Tour;
        var CupoBase = req.body.CupoBase;
        var rol = req.body.rol;
        var render;

        if (rol == "Administrador") {
            render = "index_admin";
        } else if (rol == "Asesor") {
            render = "index_asesor";
        }

        for (var t = 0; t < Id_Tour.length; t++) {
            connection.query('UPDATE Tours SET ? WHERE Id_Tour = ?', [{
                CupoDia: CupoBase[t]
            }, Id_Tour[t]], async (error, result) => {
                if (error) {
                    console.log(error)
                    res.render(render, {
                        alert: true,
                        alertTitle: "¡Ocurrió un error!",
                        alertMessage: "No fue posible reiniciar el cupo diario. Si el error continúa, comuníquese con soporte técnico.",
                        alertIcon: "error",
                        showConfirmButton: false,
                        timer: 3500,
                        ruta: "",
                    });
                } else {
                    res.render(render, {
                        alert: true,
                        alertTitle: "Exito",
                        alertMessage: "El cupo diario se ha reiniciado correctamente.",
                        alertIcon: "success",
                        showConfirmButton: false,
                        timer: 1500,
                        ruta: "",
                    });
                }
            })
        }

    } catch (error) {

    }
}


exports.saveNuevaReserva = async (req, res) => {
    try {
        var Id_Reserva = req.body.Id_Reserva;
        var TipoReserva = req.body.TipoReserva;
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

        var Fecha = new Date();
        var dia = String(Fecha.getDate()).padStart(2, '0');
        var mes = String(Fecha.getMonth() + 1).padStart(2, '0');
        var año = Fecha.getFullYear();
        var FechaRegistro = año + '-' + mes + '-' + dia;

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
                connection.query('INSERT INTO Reservas SET ?', { Id_Reserva: Id_Reserva, TipoReserva: TipoReserva, NumeroPasajeros: NumeroPasajeros, TotalPasajeros: TotalPasajeros, TourReserva: TourReserva, PuntoEncuentro: PuntoEncuentro, FechaReserva: FechaReserva, TelefonoReserva: TelefonoReserva, IdiomaReserva: IdiomaReserva, CategoriaReserva: CategoriaReserva, NombreReporta: NombreReporta, HoraSalida: HoraSalida, Ruta: Ruta, Observaciones: Observaciones, FechaRegistro: FechaRegistro, Culminada: Culminada }, async (errorReserva, resultReserva) => {
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
                                        timer: 1500,
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
        var TipoReserva = req.body.TipoReserva;
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

        var Fecha = new Date();
        var dia = String(Fecha.getDate()).padStart(2, '0');
        var mes = String(Fecha.getMonth() + 1).padStart(2, '0');
        var año = Fecha.getFullYear();
        var FechaRegistro = año + '-' + mes + '-' + dia;

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
                connection.query('UPDATE Reservas SET ? WHERE Id_Reserva = ?', [{ TipoReserva: TipoReserva, NumeroPasajeros: NumeroPasajeros, TotalPasajeros: TotalPasajeros, TourReserva: TourReserva, PuntoEncuentro: PuntoEncuentro, FechaReserva: FechaReserva, TelefonoReserva: TelefonoReserva, IdiomaReserva: IdiomaReserva, CategoriaReserva: CategoriaReserva, NombreReporta: NombreReporta, HoraSalida: HoraSalida, Ruta: Ruta, Observaciones: Observaciones, FechaRegistro: FechaRegistro }, Id_Reserva], async (errorReserva, resultReserva) => {
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

                        for (i = 0; i < TotalPasajeros_Old; i++) {
                            connection.query('UPDATE Pasajeros SET ? WHERE id = ?', [{
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

                                if (i == NewPasajeros) {
                                    res.render("Reservas/EditarReserva", {
                                        alert: true,
                                        alertTitle: "Exito",
                                        alertMessage: "La reserva " + Id_Reserva + " se ha actualizado correctamente.",
                                        alertIcon: "success",
                                        showConfirmButton: false,
                                        timer: 1500,
                                        ruta: "Reservas/EditarReserva/" + Id_Reserva + "",
                                    });
                                }
                            } else {
                                res.render("Reservas/EditarReserva", {
                                    alert: true,
                                    alertTitle: "Exito",
                                    alertMessage: "La reserva " + Id_Reserva + " se ha actualizado correctamente.",
                                    alertIcon: "success",
                                    showConfirmButton: false,
                                    timer: 1500,
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
        var NumeroPasajeros = req.body.NumPas;
        var Servicio = req.body.Servicio;
        var Salida = req.body.Salida;
        var Llegada = req.body.Llegada;
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

        var Fecha = new Date();
        var dia = String(Fecha.getDate()).padStart(2, '0');
        var mes = String(Fecha.getMonth() + 1).padStart(2, '0');
        var año = Fecha.getFullYear();
        var FechaRegistro = año + '-' + mes + '-' + dia;

        connection.query('INSERT INTO History SET ?', {
            Id_Reserva: Id_Transfer, Tipo: TipoHistory, Accion: AccionHistory, id_user: id_user, FechaRegistro: FechaRegistro
        }, async (errorHistory, resultHistory) => {
            if (errorHistory) {
                console.log(errorHistory)
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
                        for (i = 0; i < NumeroPasajeros; i++) {
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
                                        alertMessage: "El transfer " + Id_Transfer + " se ha creado correctamente.",
                                        alertIcon: "success",
                                        showConfirmButton: false,
                                        timer: 1500,
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

exports.saveEditarTransfer = async (req, res) => {
    try {
        var Id_Transfer = req.body.Id_Transfer;
        var NumeroPasajeros = req.body.NumPas;
        var Old_Pasajeros = req.body.Old_Pasajeros;
        var New_Pasajeros = req.body.New_Pasajeros;
        var Servicio = req.body.Servicio;
        var Salida = req.body.Salida;
        var Llegada = req.body.Llegada;
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
        var id = req.body.id;

        var New_NomPas = req.body.New_NomPas;
        var New_IdPas = req.body.New_IdPas;
        var New_Telefono = req.body.New_Telefono;

        var Confirmacion = 1;

        var TipoHistory = 'Transfer';
        var AccionHistory = 'Editar';

        var id_user = req.body.id_user;

        var Fecha = new Date();
        var dia = String(Fecha.getDate()).padStart(2, '0');
        var mes = String(Fecha.getMonth() + 1).padStart(2, '0');
        var año = Fecha.getFullYear();
        var FechaRegistro = año + '-' + mes + '-' + dia;

        connection.query('INSERT INTO History SET ?', {
            Id_Reserva: Id_Transfer, Tipo: TipoHistory, Accion: AccionHistory, id_user: id_user, FechaRegistro: FechaRegistro
        }, async (errorHistory, resultHistory) => {
            if (errorHistory) {
                console.log(errorHistory)
                res.render("Transfer/EditarTransfer", {
                    alert: true,
                    alertTitle: "¡Ocurrió un error!",
                    alertMessage: "No fue posible actualizar el transfer. Si el error continúa, comuníquese con soporte técnico.",
                    alertIcon: "error",
                    showConfirmButton: false,
                    timer: 3500,
                    ruta: "Transfer/EditarTransfer/" + Id_Transfer + "",
                });
            } else {
                connection.query('UPDATE Transfer SET ? WHERE Id_Transfer = ?', [{ NumeroPasajeros: NumeroPasajeros, Servicio: Servicio, Salida: Salida, Llegada: Llegada, FechaTransfer: FechaTransfer, NombreReporta: NombreReporta, HoraRecogida: HoraRecogida, Vuelo: Vuelo, TelefonoTransfer: TelefonoTransfer, ValorServicio: ValorServicio, Observaciones: Observaciones }, Id_Transfer], async (errorReserva, resultReserva) => {
                    if (errorReserva) {
                        console.log(errorReserva);

                        res.render("Transfer/EditarTransfer", {
                            alert: true,
                            alertTitle: "¡Ocurrió un error!",
                            alertMessage: "No fue posible actualizar el transfer. Si el error continúa, comuníquese con soporte técnico.",
                            alertIcon: "error",
                            showConfirmButton: false,
                            timer: 3500,
                            ruta: "Transfer/EditarTransfer/" + Id_Transfer + "",
                        });
                    } else {
                        for (i = 0; i < Old_Pasajeros; i++) {
                            connection.query('UPDATE PasajerosTransfer SET ? WHERE id = ?', [{
                                NombrePasajero: NomPas[i], IdPas: IdPas[i], TelefonoPasajero: Telefono[i]
                            }, id[i]], async (errorPasajeros, resultPasajeros) => {
                                if (errorPasajeros) {
                                    console.log(errorPasajeros);
                                    res.render("Transfer/EditarTransfer", {
                                        alert: true,
                                        alertTitle: "¡Ocurrió un error!",
                                        alertMessage: "No fue posible actualizar el transfer. Si el error continúa, comuníquese con soporte técnico.",
                                        alertIcon: "error",
                                        showConfirmButton: false,
                                        timer: 3500,
                                        ruta: "Transfer/EditarTransfer/" + Id_Transfer + "",
                                    });
                                }

                            })
                        }
                        if (i == Old_Pasajeros) {
                            if (New_NomPas != undefined) {
                                for (i = 0; i < New_Pasajeros; i++) {
                                    connection.query('INSERT INTO PasajerosTransfer SET ?', {
                                        Id_Transfer: Id_Transfer, NombrePasajero: New_NomPas[i], IdPas: New_IdPas[i], TelefonoPasajero: New_Telefono[i], Fecha: FechaRegistro, Confirmacion: Confirmacion
                                    }, async (errorPasajeros, resultPasajeros) => {
                                        if (errorPasajeros) {
                                            console.log(errorPasajeros);
                                            res.render("Transfer/EditarTransfer", {
                                                alert: true,
                                                alertTitle: "¡Ocurrió un error!",
                                                alertMessage: "No fue posible actualizar el transfer. Si el error continúa, comuníquese con soporte técnico.",
                                                alertIcon: "error",
                                                showConfirmButton: false,
                                                timer: 3500,
                                                ruta: "Transfer/EditarTransfer/" + Id_Transfer + "",
                                            });

                                        }
                                    })
                                }

                                if (i == New_Pasajeros) {
                                    res.render("Transfer/EditarTransfer", {
                                        alert: true,
                                        alertTitle: "Exito",
                                        alertMessage: "El transfer " + Id_Transfer + " se ha actualizado correctamente.",
                                        alertIcon: "success",
                                        showConfirmButton: false,
                                        timer: 1500,
                                        ruta: "Transfer/EditarTransfer/" + Id_Transfer + "",
                                    });
                                }
                            } else {
                                res.render("Transfer/EditarTransfer", {
                                    alert: true,
                                    alertTitle: "Exito",
                                    alertMessage: "El transfer " + Id_Transfer + " se ha actualizado correctamente.",
                                    alertIcon: "success",
                                    showConfirmButton: false,
                                    timer: 1500,
                                    ruta: "Transfer/EditarTransfer/" + Id_Transfer + "",
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

exports.saveNuevoTour = async (req, res) => {
    var Id_Tour = req.body.Id_Tour;
    var NombreTour = req.body.NombreTour;
    var Abreviacion = req.body.Abreviacion;
    var PrecioAdulto = req.body.PrecioAdulto;
    var PrecioNiño = req.body.PrecioNiño;
    var PrecioInfante = req.body.PrecioInfante;
    var Comision = req.body.Comision;
    var Cupos = req.body.Cupos;

    connection.query('INSERT INTO Tours SET ?', { Id_Tour: Id_Tour, NombreTour: NombreTour, Abreviacion: Abreviacion, PrecioAdulto: PrecioAdulto, PrecioNiño: PrecioNiño, PrecioInfante: PrecioInfante, Comision: Comision, CupoBase: Cupos, CupoDia: Cupos }, async (error, result) => {
        if (error) {
            console.log(error);
            res.render("Tours/NuevoTour", {
                alert: true,
                alertTitle: "¡Ocurrió un error!",
                alertMessage: "No fue posible crear el tour. Si el error continúa, comuníquese con soporte técnico.",
                alertIcon: "error",
                showConfirmButton: false,
                timer: 3500,
                ruta: "Tours/NuevoTour",
            });
        } else {
            res.render("Tours/NuevoTour", {
                alert: true,
                alertTitle: "Exito",
                alertMessage: "El tour se ha creado correctamente.",
                alertIcon: "success",
                showConfirmButton: false,
                timer: 1500,
                ruta: "Tours/NuevoTour",
            });
        }
    })

}

exports.saveEditarTour = async (req, res) => {
    Id_Tour = req.body.Id_Tour;
    NombreTour = req.body.NombreTour;
    Abreviacion = req.body.Abreviacion;
    PrecioAdulto = req.body.PrecioAdulto;
    PrecioNiño = req.body.PrecioNiño;
    PrecioInfante = req.body.PrecioInfante;
    Comision = req.body.Comision;

    connection.query('UPDATE Tours SET ? WHERE Id_Tour = ?', [{ NombreTour: NombreTour, Abreviacion: Abreviacion, PrecioAdulto: PrecioAdulto, PrecioNiño: PrecioNiño, PrecioInfante: PrecioInfante, Comision: Comision }, Id_Tour], async (error, result) => {
        if (error) {
            console.log(error);
            res.render("Tours/EditarTour", {
                alert: true,
                alertTitle: "¡Ocurrió un error!",
                alertMessage: "No fue posible actualizar el tour. Si el error continúa, comuníquese con soporte técnico.",
                alertIcon: "error",
                showConfirmButton: false,
                timer: 3500,
                ruta: "Tours/EditarTour/" + Id_Tour + "",
            });
        } else {
            res.render("Tours/EditarTour", {
                alert: true,
                alertTitle: "Exito",
                alertMessage: "El tour se ha actualizando correctamente.",
                alertIcon: "success",
                showConfirmButton: false,
                timer: 1500,
                ruta: "Tours/EditarTour/" + Id_Tour + "",
            });
        }
    })

}

exports.saveNuevoPunto = async (req, res) => {
    var Id_Punto = req.body.Id_Punto;
    var Id_Tour = req.body.Id_Tour;
    var NombrePunto = req.body.NombrePunto;
    var Sector = req.body.Sector;
    var Latitud = req.body.Latitud;
    var Longitud = req.body.Longitud;
    var Nuevo = req.body.Nuevo;
    var HoraSalida = req.body.HoraSalida;
    var HoraLlegada = req.body.HoraLlegada;
    var Ruta = req.body.Ruta;
    var Nuevo = 1;

    connection.query('INSERT INTO Puntos SET ?', { Id_Punto: Id_Punto, NombrePunto: NombrePunto, Sector: Sector, Latitud: Latitud, Longitud: Longitud, Posicion: Id_Punto, Nuevo: Nuevo }, async (error, result) => {
        if (error) {
            console.log(error);
            res.render("Puntos/NuevoPunto", {
                alert: true,
                alertTitle: "¡Ocurrió un error!",
                alertMessage: "No fue posible crear el punto de encuentro. Si el error continúa, comuníquese con soporte técnico.",
                alertIcon: "error",
                showConfirmButton: false,
                timer: 3500,
                ruta: "Puntos/NuevoPunto",
            });
        } else {
            for (var i = 0; i < Id_Tour.length; i++) {
                connection.query('INSERT INTO Horarios SET ?', { Id_Punto: Id_Punto, Id_Tour: Id_Tour[i], HoraSalida: HoraSalida[i], HoraLlegada: HoraLlegada[i], Ruta: Ruta[i] }, async (error, result) => {
                    if (error) {
                        console.log(error);
                        res.render("Puntos/NuevoPunto", {
                            alert: true,
                            alertTitle: "¡Ocurrió un error!",
                            alertMessage: "No fue posible crear el punto de encuentro. Si el error continúa, comuníquese con soporte técnico.",
                            alertIcon: "error",
                            showConfirmButton: false,
                            timer: 3500,
                            ruta: "Puntos/NuevoPunto",
                        });
                    } else {
                        res.render("Puntos/NuevoPunto", {
                            alert: true,
                            alertTitle: "Exito",
                            alertMessage: "El nuevo punto de encuentro se ha creado correctamente.",
                            alertIcon: "success",
                            showConfirmButton: false,
                            timer: 1500,
                            ruta: "Puntos/NuevoPunto",
                        });
                    }
                })
            }
        }
    })

}

exports.saveEditarPunto = async (req, res) => {
    var Id_Punto = req.body.Id_Punto;
    var Id_Tour = req.body.Id_Tour;
    var NombrePunto = req.body.NombrePunto;
    var Sector = req.body.Sector;
    var Latitud = req.body.Latitud;
    var Longitud = req.body.Longitud;
    var HoraSalida = req.body.HoraSalida;
    var HoraLlegada = req.body.HoraLlegada;
    var Ruta = req.body.Ruta;


    connection.query('UPDATE Puntos SET ? WHERE Id_Punto = ?', [{ NombrePunto: NombrePunto, Sector: Sector, Latitud: Latitud, Longitud: Longitud }, Id_Punto], async (error, result) => {
        if (error) {
            console.log(error);
            res.render("Puntos/EditarPunto", {
                alert: true,
                alertTitle: "¡Ocurrió un error!",
                alertMessage: "No fue posible actualizar el punto de encuentro. Si el error continúa, comuníquese con soporte técnico.",
                alertIcon: "error",
                showConfirmButton: false,
                timer: 3500,
                ruta: "Puntos/EditarPunto/" + Id_Punto + "",
            });
        } else {
            for (var i = 0; i < Id_Tour.length; i++) {
                connection.query('UPDATE Horarios SET ? WHERE Id_Punto = ? AND Id_Tour = ?', [{ HoraSalida: HoraSalida[i], HoraLlegada: HoraLlegada[i], Ruta: Ruta }, Id_Punto, Id_Tour[i]], async (error, result) => {
                    if (error) {
                        console.log(error);
                        res.render("Puntos/EditarPunto", {
                            alert: true,
                            alertTitle: "¡Ocurrió un error!",
                            alertMessage: "No fue posible actualizar el punto de encuentro. Si el error continúa, comuníquese con soporte técnico.",
                            alertIcon: "error",
                            showConfirmButton: false,
                            timer: 3500,
                            ruta: "Puntos/EditarPunto/" + Id_Punto + "",
                        });
                    } else {
                        res.render("Puntos/EditarPunto", {
                            alert: true,
                            alertTitle: "Exito",
                            alertMessage: "El nuevo punto de encuentro se ha actalizado correctamente.",
                            alertIcon: "success",
                            showConfirmButton: false,
                            timer: 1500,
                            ruta: "Puntos/EditarPunto/" + Id_Punto + "",
                        });
                    }
                })
            }
        }
    })

}

exports.saveOrdenarPuntos = async (req, res) => {
    var Id_Punto = req.body.Id_Punto;
    var Posicion = req.body.Posicion;
    var Nuevo = 0;

    if (Id_Punto.length > 0) {
        for (var i = 0; i < Id_Punto.length; i++) {
            connection.query('UPDATE Puntos SET ? WHERE Id_Punto = ?', [{ Posicion: Posicion[i], Nuevo: Nuevo }, Id_Punto[i]], async (error, result) => {
                if (error) {
                    console.log(error);
                    res.render("Puntos/OrdenarPuntos", {
                        alert: true,
                        alertTitle: "¡Ocurrió un error!",
                        alertMessage: "No fue posible actualizar los puntos de encuentro. Si el error continúa, comuníquese con soporte técnico.",
                        alertIcon: "error",
                        showConfirmButton: false,
                        timer: 3500,
                        ruta: "Puntos/OrdenarPuntos",
                    });
                } else {
                    res.render("Puntos/OrdenarPuntos", {
                        alert: true,
                        alertTitle: "Exito",
                        alertMessage: "Los puntos de encuentro se ha ordenado correctamente.",
                        alertIcon: "success",
                        showConfirmButton: false,
                        timer: 1500,
                        ruta: "Puntos/OrdenarPuntos",
                    });
                }
            })
        }
    }
}

exports.saveConfirmacion = async (req, res) => {
    var id = req.body.id;
    var Confirmacion = req.body.con;
    if (id.length > 0) {
        for (var i = 0; i < Confirmacion.length; i++) {
            connection.query('UPDATE Pasajeros SET ? WHERE id = ?', [{ Confirmacion: Confirmacion[i] }, id[i]], async (error, result) => {
                if (error) {
                    console.log(error);
                    res.render("Programacion/Confirmacion", {
                        alert: true,
                        alertTitle: "¡Ocurrió un error!",
                        alertMessage: "No fue posible guardar la confirmación. Si el error continúa, comuníquese con soporte técnico.",
                        alertIcon: "error",
                        showConfirmButton: false,
                        timer: 3500,
                        ruta: "Programacion/Confirmacion",
                    });
                } else {
                    res.render("Programacion/Confirmacion", {
                        alert: true,
                        alertTitle: "Exito",
                        alertMessage: "Confimacion de viaje guardada correctamente.",
                        alertIcon: "success",
                        showConfirmButton: false,
                        timer: 1500,
                        ruta: "Programacion/Confirmacion",
                    });
                }
            })
        }
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

exports.ServicioTransfer = async (req, res, next) => {
    try {
        connection.query('SELECT * FROM ServicioTransfer', (error, resultsServicio) => {
            if (!resultsServicio) { return next() }
            req.resultsServicio = resultsServicio
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
