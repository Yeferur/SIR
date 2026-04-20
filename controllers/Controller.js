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
        if (pswd !== '') {
            passwordHash = await bcryptjs.hash(pswd, 8);
        }
        connection.query('UPDATE users SET ? WHERE id = ?', [{ id_user: id_user, name: name, apellidos: apellidos, phone: phone, username: username, email: email, rol: rol }, id], async (error, results) => {
            if (error) {
                console.log(error);
                res.render("Settings/EditarUser", {
                    alert: true,
                    alertTitle: "¡Ocurrió un error!",
                    alertMessage: "No fue posible editar el usuario. Si el error continúa, comuníquese con soporte técnico.",
                    alertIcon: "error",
                    showConfirmButton: false,
                    timer: 3500,
                    ruta: "Settings/EditarUser/" + id + "",
                });
            } else {
                if (passwordHash !== undefined) {
                    console.log(passwordHash)
                    connection.query('UPDATE users SET ? WHERE id = ?', [{ password: passwordHash }, id], async (error, results) => {
                        if (error) {
                            console.log(error);
                            res.render("Settings/EditarUser", {
                                alert: true,
                                alertTitle: "¡Ocurrió un error!",
                                alertMessage: "No fue posible editar el usuario. Si el error continúa, comuníquese con soporte técnico.",
                                alertIcon: "error",
                                showConfirmButton: false,
                                timer: 3500,
                                ruta: "Settings/EditarUser/" + id + "",
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
                                ruta: "Settings/EditarUser/" + id + "",
                            });
                        }
                    })
                } else {
                    res.render("Settings/EditarUser", {
                        alert: true,
                        alertTitle: "Exito",
                        alertMessage: "El usuario se ha creado correctamente.",
                        alertIcon: "success",
                        showConfirmButton: false,
                        timer: 1500,
                        ruta: "Settings/EditarUser/" + id + "",
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
        if ((pswd !== '') & (pswd !== undefined)) {
            passwordHash = await bcryptjs.hash(pswd, 8);
        }
        connection.query('UPDATE users SET ? WHERE id = ?', [{ name: name, apellidos: apellidos, phone: phone, username: username, email: email }, id], async (error, results) => {
            if (error) {
                console.log(error);
                res.render("Settings/Perfil", {
                    alert: true,
                    alertTitle: "¡Ocurrió un error!",
                    alertMessage: "No fue posible editar el perfil. Si el error continúa, comuníquese con soporte técnico.",
                    alertIcon: "error",
                    showConfirmButton: false,
                    timer: 3500,
                    ruta: "Settings/Perfil/" + id + "",
                });
            } else {
                if (passwordHash !== undefined) {
                    connection.query('UPDATE users SET ? WHERE id = ?', [{ password: passwordHash }, id], async (error, results) => {
                        if (error) {
                            console.log(error);
                            res.render("Settings/Perfil", {
                                alert: true,
                                alertTitle: "¡Ocurrió un error!",
                                alertMessage: "No fue posible editar el perfil. Si el error continúa, comuníquese con soporte técnico.",
                                alertIcon: "error",
                                showConfirmButton: false,
                                timer: 3500,
                                ruta: "Settings/Perfil/" + id + "",
                            });
                        } else {
                            res.render("Settings/Perfil", {
                                alert: true,
                                alertTitle: "Exito",
                                alertMessage: "El perfil se ha editado correctamente.",
                                alertIcon: "success",
                                showConfirmButton: false,
                                timer: 1500,
                                ruta: "Settings/Perfil/" + id + "",
                            });
                        }
                    })
                } else {
                    res.render("Settings/Perfil", {
                        alert: true,
                        alertTitle: "Exito",
                        alertMessage: "El perfil se ha creado correctamente.",
                        alertIcon: "success",
                        showConfirmButton: false,
                        timer: 1500,
                        ruta: "Settings/Perfil/" + id + "",
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

        if (!user || !pass) {
            return res.render('login', {
                layout: false,
                error: 'Ingrese los datos solicitados'
            });
        }

        connection.query('SELECT * FROM users WHERE id_user = ? OR username = ? OR email = ?', [user, user, user], async (error, results, fields) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Error en la base de datos');
            }

            if (results.length === 0 || !(await bcryptjs.compare(pass, results[0].password))) {
                return res.render('login', {
                    layout: false,
                    error: 'E-mail y/o contraseña incorrecto'
                });
            }

            const id_user = results[0].id_user;
            const token = jwt.sign({ id_user: id_user }, process.env.JWT_SECRET, {
                expiresIn: process.env.jwt_expires
            });

            const cookieOptions = {
                expires: new Date(Date.now() + process.env.cookie_expires * 24 * 60 * 60 * 1000),
                httpOnly: true
            };

            res.cookie('jwt', token, cookieOptions);

            return res.render('login', {
                layout: false,
                name: results[0].name
            });

        });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error interno del servidor');
    }
};


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

exports.Aforo = (req, res) => {
    try {
        var Id_Tour = req.body.SelectTour;
        var NuevoCupo = parseInt(req.body.NuevoCupo);
        var Fecha = req.body.Fecha;
        var TipoHistory = 'AFORO';
        var AccionHistory = 'NUEVO';
        var id_user = req.body.id_user;

        var FechaActual = new Date();
        var dia = String(FechaActual.getDate()).padStart(2, '0');
        var mes = String(FechaActual.getMonth() + 1).padStart(2, '0');
        var año = FechaActual.getFullYear();
        var horas24 = FechaActual.getHours();
        var horas = horas24 % 12 || 12;
        var minutos = String(FechaActual.getMinutes()).padStart(2, '0');
        var segundos = String(FechaActual.getSeconds()).padStart(2, '0');
        var ampm = horas24 >= 12 ? 'PM' : 'AM';
        var FechaRegistro = `${año}-${mes}-${dia}`;
        var HoraRegistro = `${horas}:${minutos}:${segundos} ${ampm}`;

        // Determinar si es tour combinado
        var TourSql = `TourReserva = ?`;
        var tourParams = [Id_Tour, Fecha];

        if (Id_Tour == 1 || Id_Tour == 5) {
            TourSql = `TourReserva IN (1, 5)`;
            tourParams = [Fecha];
        }

        const sqlOcupados = `
      SELECT IFNULL(SUM(NumeroPasajeros), 0) AS Ocupados
      FROM Reservas
      WHERE ${TourSql}
        AND FechaReserva = ?
        AND Estado != 'Cancelado'
        AND TipoReserva = 'Grupal'
    `;

        connection.query(sqlOcupados, tourParams, (errorOcupados, resultOcupados) => {
            if (errorOcupados) {
                console.error(errorOcupados);
                return res.render("Aforos", {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "No se pudo validar el aforo actual.",
                    alertIcon: "error",
                    showConfirmButton: false,
                    timer: 3500,
                    ruta: "Aforos",
                });
            }

            const ocupados = resultOcupados[0].Ocupados;

            // ❌ Validar si el nuevo aforo es menor a la ocupación actual
            if (NuevoCupo < ocupados) {
                return res.render("Aforos", {
                    alert: true,
                    alertTitle: "Aforo insuficiente",
                    alertMessage: `No se puede establecer un aforo de ${NuevoCupo}, ya hay ${ocupados} pasajeros reservados.`,
                    alertIcon: "warning",
                    showConfirmButton: true,
                    timer: 5000,
                    ruta: "Aforos",
                });
            }

            // ✅ Registrar en History y guardar aforo
            connection.query('INSERT INTO History SET ?', {
                Id_: Id_Tour,
                Tipo: TipoHistory,
                Accion: AccionHistory,
                id_user,
                FechaRegistro,
                HoraRegistro
            }, (errorHistory) => {
                if (errorHistory) {
                    console.error(errorHistory);
                    return res.render("Aforos", {
                        alert: true,
                        alertTitle: "¡Ocurrió un error!",
                        alertMessage: "No fue posible registrar el cambio en el historial.",
                        alertIcon: "error",
                        showConfirmButton: false,
                        timer: 3500,
                        ruta: "Aforos",
                    });
                }

                connection.query('INSERT INTO aforos SET ?', {
                    Id_Tour,
                    NuevoCupo,
                    Fecha
                }, (error, result) => {
                    if (error) {
                        console.log(error);
                        return res.render("Aforos", {
                            alert: true,
                            alertTitle: "¡Ocurrió un error!",
                            alertMessage: "No fue posible actualizar el aforo.",
                            alertIcon: "error",
                            showConfirmButton: false,
                            timer: 3500,
                            ruta: "Aforos",
                        });
                    }

                    return res.render("Aforos", {
                        alert: true,
                        alertTitle: "Éxito",
                        alertMessage: "El aforo se ha actualizado correctamente.",
                        alertIcon: "success",
                        showConfirmButton: false,
                        timer: 1500,
                        ruta: "Aforos",
                    });
                });
            });
        });

    } catch (error) {
        console.log(error);
    }
};


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
        var Id_Punto = req.body.Id_Punto;
        var FechaReserva = req.body.FechaReserva;
        var TelefonoReserva = req.body.TelefonoReserva;
        var IdiomaReserva = req.body.IdiomaReserva;
        var CategoriaReserva = req.body.Categoria;
        var NombreReporta = req.body.NombreReporta;
        var HoraSalida = req.body.HoraSalida;
        var Ruta = req.body.Ruta;
        var PagoAgencia = req.body.PagoAgencia;
        var Observaciones = req.body.Observaciones;
        var NomPas = req.body.NomPas;
        var TipoPasajero = req.body.TipoPasajero;
        var IdPas = req.body.IdPas;
        var Telefono = req.body.Telefono;
        var PrecioTour = req.body.PrecioTour;
        var Precio = req.body.Precio;
        var Comision = req.body.Comision;
        var Estado = req.body.Estado;
        var Confirmacion = 1;

        var TipoHistory = 'RESERVA';
        var AccionHistory = 'NUEVO';
        var id_user = req.body.id_user;

        var Fecha = new Date();
        var dia = String(Fecha.getDate()).padStart(2, '0');
        var mes = String(Fecha.getMonth() + 1).padStart(2, '0');
        var año = Fecha.getFullYear();
        var horas24 = Fecha.getHours();
        var horas = horas24 % 12 || 12;
        var minutos = String(Fecha.getMinutes()).padStart(2, '0');
        var segundos = String(Fecha.getSeconds()).padStart(2, '0');
        var ampm = horas24 >= 12 ? 'PM' : 'AM';
        var FechaRegistro = `${año}-${mes}-${dia}`;
        var HoraRegistro = `${horas}:${minutos}:${segundos} ${ampm}`;

        // Determinar si es tour combinado
        var TourCupos = TourReserva;
        var TourSql = `TourReserva = ?`;
        let ocupadosParams = [];

        if (TourReserva == 1 || TourReserva == 5) {
            TourCupos = 5;
            TourSql = `TourReserva IN (1,5)`;
        }

        // Consulta cupo total
        const sqlCupo = `
      SELECT
        IFNULL(
          (
            SELECT a.NuevoCupo
            FROM aforos a
            WHERE a.Id_Tour = ? AND a.Fecha = ?
            ORDER BY a.id DESC LIMIT 1
          ),
          (
            SELECT t.CupoBase
            FROM Tours t
            WHERE t.Id_Tour = ?
          )
        ) AS CupoTotal
    `;

        connection.query(sqlCupo, [TourCupos, FechaReserva, TourCupos], (errorCupo, resultCupo) => {
            if (errorCupo) {
                console.error(errorCupo);
                return res.render("Reservas/NuevaReserva", {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "No se pudo consultar el cupo disponible.",
                    alertIcon: "error",
                    showConfirmButton: false,
                    timer: 3500,
                    ruta: "Reservas/NuevaReserva",
                });
            }

            const cupoTotal = resultCupo[0].CupoTotal;

            // Construir consulta de ocupados
            const sqlOcupados = `
        SELECT IFNULL(SUM(NumeroPasajeros),0) AS Ocupados
        FROM Reservas
        WHERE ${TourSql}
          AND FechaReserva = ?
          AND Estado != 'Cancelado'
          AND TipoReserva = 'Grupal'
      `;

            if (TourReserva == 1 || TourReserva == 5) {
                ocupadosParams = [FechaReserva];
            } else {
                ocupadosParams = [TourReserva, FechaReserva];
            }

            connection.query(sqlOcupados, ocupadosParams, (errorOcupados, resultOcupados) => {
                if (errorOcupados) {
                    console.error(errorOcupados);
                    return res.render("Reservas/NuevaReserva", {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "No se pudo consultar el cupo ocupado.",
                        alertIcon: "error",
                        showConfirmButton: false,
                        timer: 3500,
                        ruta: "Reservas/NuevaReserva",
                    });
                }

                const ocupados = resultOcupados[0].Ocupados;
                const disponibles = cupoTotal - ocupados;

                // Validar si hay cupo suficiente
                if ((NumeroPasajeros > disponibles) && (TipoReserva == "Grupal")) {
                    // Registrar intento sin cupo
                    connection.query('INSERT INTO History SET ?', {
                        Id_: Id_Reserva,
                        Tipo: 'RESERVA SIN CUPO',
                        Accion: 'NUEVO',
                        id_user,
                        FechaRegistro,
                        HoraRegistro
                    }, (errorHistory) => {
                        if (errorHistory) {
                            console.error('Error al guardar History de reserva sin cupo:', errorHistory);
                        }
                        return res.render("Reservas/NuevaReserva", {
                            alert: true,
                            alertTitle: "Sin cupo disponible",
                            alertMessage: `No hay suficientes cupos para ${NumeroPasajeros} pasajero(s). Cupos disponibles: ${disponibles}`,
                            alertIcon: "error",
                            showConfirmButton: true,
                            timer: 5000,
                            ruta: "Reservas/NuevaReserva",
                        });
                    });
                    return;
                }

                // Si hay cupo, continuar
                connection.query('INSERT INTO History SET ?', {
                    Id_: Id_Reserva,
                    Tipo: TipoHistory,
                    Accion: AccionHistory,
                    id_user,
                    FechaRegistro,
                    HoraRegistro
                }, (errorHistory) => {
                    if (errorHistory) {
                        console.log(errorHistory);
                        return res.render("Reservas/NuevaReserva", {
                            alert: true,
                            alertTitle: "Error",
                            alertMessage: "No fue posible crear la reserva.",
                            alertIcon: "error",
                            showConfirmButton: false,
                            timer: 3500,
                            ruta: "Reservas/NuevaReserva",
                        });
                    }

                    connection.query('INSERT INTO Reservas SET ?', {
                        Id_Reserva, TipoReserva, NumeroPasajeros, TotalPasajeros, TourReserva,
                        PuntoEncuentro, Id_Punto, FechaReserva, TelefonoReserva, IdiomaReserva,
                        CategoriaReserva, NombreReporta, HoraSalida, Ruta, PagoAgencia,
                        Observaciones, FechaRegistro, HoraRegistro, Estado
                    }, (errorReserva) => {
                        if (errorReserva) {
                            console.log(errorReserva);
                            return res.render("Reservas/NuevaReserva", {
                                alert: true,
                                alertTitle: "Error",
                                alertMessage: "No fue posible crear la reserva.",
                                alertIcon: "error",
                                showConfirmButton: false,
                                timer: 3500,
                                ruta: "Reservas/NuevaReserva",
                            });
                        }

                        // Insertar pasajeros
                        for (let i = 0; i < TotalPasajeros; i++) {
                            connection.query('INSERT INTO Pasajeros SET ?', {
                                Id_Reserva,
                                NombrePasajero: NomPas[i],
                                TipoPasajero: TipoPasajero[i],
                                IdPas: IdPas[i],
                                TelefonoPasajero: Telefono[i],
                                PrecioTour: PrecioTour[i],
                                Precio: Precio[i],
                                Comision: Comision[i],
                                Fecha: FechaRegistro,
                                Confirmacion
                            }, (errorPasajeros) => {
                                if (errorPasajeros) {
                                    console.log(errorPasajeros);
                                    return res.render("Reservas/NuevaReserva", {
                                        alert: true,
                                        alertTitle: "Error",
                                        alertMessage: "No se pudo registrar todos los pasajeros.",
                                        alertIcon: "error",
                                        showConfirmButton: false,
                                        timer: 3500,
                                        ruta: "Reservas/NuevaReserva",
                                    });
                                }
                            });
                        }

                        res.render("Reservas/NuevaReserva", {
                            alert: true,
                            alertTitle: "Éxito",
                            alertMessage: `La reserva ${Id_Reserva} se creó correctamente.`,
                            alertIcon: "success",
                            showConfirmButton: false,
                            timer: 1500,
                            ruta: "Reservas/NuevaReserva",
                        });
                    });
                });
            });
        });
    } catch (error) {
        console.log(error);
    }
};


exports.saveEditReserva = async (req, res, next) => {
    try {
        // Asegurarse de que el request tiene usuario autenticado
        if (!req.user) {
            return res.redirect('/login');
        }

        var Id_Reserva = req.body.Id_Reserva;

        // Si es Cliente, verificar que sea su propia reserva
        if (req.user && req.user.rol === "Cliente") {
            const userDNI = req.user.id_user;
            connection.query(
                'SELECT 1 FROM History WHERE Id_ = ? AND id_user = ? AND Accion IN ("Nuevo", "DUPLICAR", "EDITAR") LIMIT 1',
                [Id_Reserva, userDNI],
                (error, result) => {
                if (error) {
                    console.log(error);
                    return res.render("Reservas/EditarReserva", {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "Error al verificar la reserva.",
                        alertIcon: "error",
                        showConfirmButton: false,
                        timer: 3500,
                        ruta: "Reservas/VerReservas",
                    });
                }
                if (!result || !result[0]) {
                    return res.redirect("/Reservas/VerReservas");
                }
                // Continuar con la edición
                continuarEditarReserva(req, res, next);
            });
        } else {
            // Para otros roles, continuar directamente
            continuarEditarReserva(req, res, next);
        }
    } catch (error) {
        console.log(error);
    }
};

async function continuarEditarReserva(req, res, next) {
    try {
        var Id_Reserva = req.body.Id_Reserva;
        var TipoReserva = req.body.TipoReserva;
        var NumeroPasajeros = req.body.input_numpas;
        var TotalPasajeros = req.body.total_pas;
        var TotalPasajeros_Old = req.body.TotalPasajeros;
        var NewPasajeros = req.body.NewPasajeros;
        var TourReserva = req.body.SelectTour;
        var PuntoEncuentro = req.body.NombrePunto;
        var Id_Punto = req.body.Id_Punto;
        var FechaReserva = req.body.FechaReserva;
        var TelefonoReserva = req.body.TelefonoReserva;
        var IdiomaReserva = req.body.IdiomaReserva;
        var CategoriaReserva = req.body.Categoria;
        var NombreReporta = req.body.NombreReporta;
        var HoraSalida = req.body.HoraSalida;
        var Ruta = req.body.Ruta;
        var PagoAgencia = req.body.PagoAgencia;
        var Observaciones = req.body.Observaciones;
        var NomPas = req.body.NomPas;
        var TipoPasajero = req.body.TipoPasajero;
        var IdPas = req.body.IdPas;
        var Telefono = req.body.Telefono;
        var PrecioTour = req.body.PrecioTour;
        var Precio = req.body.Precio;
        var Comision = req.body.Comision;
        var id = req.body.id;
        var Estado = req.body.Estado;

        var New_NomPas = req.body.New_NomPas;
        var New_TipoPasajero = req.body.New_TipoPasajero;
        var New_IdPas = req.body.New_IdPas;
        var New_Telefono = req.body.New_Telefono;
        var New_PrecioTour = req.body.New_PrecioTour;
        var New_Precio = req.body.New_Precio;
        var New_Comision = req.body.New_Comision;

        var Confirmacion = 1;
        var id_user = req.body.id_user;

        var TipoHistory = 'RESERVA';
        var AccionHistory = 'EDITAR';

        var Fecha = new Date();
        var dia = String(Fecha.getDate()).padStart(2, '0');
        var mes = String(Fecha.getMonth() + 1).padStart(2, '0');
        var año = Fecha.getFullYear();
        var horas24 = Fecha.getHours();
        var horas = horas24 % 12 || 12;
        var minutos = String(Fecha.getMinutes()).padStart(2, '0');
        var segundos = String(Fecha.getSeconds()).padStart(2, '0');
        var ampm = horas24 >= 12 ? 'PM' : 'AM';
        var FechaRegistro = año + '-' + mes + '-' + dia;
        var HoraRegistro = horas + ':' + minutos + ':' + segundos + ' ' + ampm;


        // Determinar lógica combinada
        var TourCupos = TourReserva;
        var TourSql = `TourReserva = ?`;
        let ocupadosParams = [];

        if (TourReserva == 1 || TourReserva == 5) {
            TourCupos = 5;
            TourSql = `TourReserva IN (1,5)`;
        }

        // Consulta cupo total
        const sqlCupo = `
      SELECT
        IFNULL(
          (
            SELECT a.NuevoCupo
            FROM aforos a
            WHERE a.Id_Tour = ? AND a.Fecha = ?
            ORDER BY a.id DESC LIMIT 1
          ),
          (
            SELECT t.CupoBase
            FROM Tours t
            WHERE t.Id_Tour = ?
          )
        ) AS CupoTotal
    `;

        connection.query(sqlCupo, [TourCupos, FechaReserva, TourCupos], (errorCupo, resultCupo) => {
            if (errorCupo) {
                console.error(errorCupo);
                return res.render("Reservas/EditarReserva", {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "No se pudo consultar el cupo disponible.",
                    alertIcon: "error",
                    showConfirmButton: false,
                    timer: 3500,
                    ruta: "Reservas/EditarReserva/" + Id_Reserva,
                });
            }

            const cupoTotal = resultCupo[0].CupoTotal;

            // Construir consulta de ocupados
            const sqlOcupados = `
        SELECT IFNULL(SUM(NumeroPasajeros),0) AS Ocupados
        FROM Reservas
        WHERE ${TourSql}
          AND FechaReserva = ?
          AND Estado != 'Cancelado'
          AND Id_Reserva != ?
          AND TipoReserva = 'Grupal'
      `

            if (TourReserva == 1 || TourReserva == 5) {
                ocupadosParams = [FechaReserva, Id_Reserva];
            } else {
                ocupadosParams = [TourReserva, FechaReserva, Id_Reserva];
            }

            connection.query(sqlOcupados, ocupadosParams, (errorOcupados, resultOcupados) => {
                if (errorOcupados) {
                    console.error(errorOcupados);
                    return res.render("Reservas/EditarReserva", {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "No se pudo consultar el cupo ocupado.",
                        alertIcon: "error",
                        showConfirmButton: false,
                        timer: 3500,
                        ruta: "Reservas/EditarReserva/" + Id_Reserva,
                    });
                }

                const ocupados = resultOcupados[0].Ocupados;
                const disponibles = cupoTotal - ocupados;
                console.log(disponibles);
                console.log(TotalPasajeros);
                if ((NumeroPasajeros > disponibles) && (TipoReserva == "Grupal")) {
                // Registrar intento sin cupo
                connection.query('INSERT INTO History SET ?', {
                    Id_: Id_Reserva,
                    Tipo: 'RESERVA SIN CUPO',
                    Accion: 'EDITAR',
                    id_user: id_user,
                    FechaRegistro,
                    HoraRegistro
                }, (errorHistory) => {
                    if (errorHistory) {
                        console.error('Error al guardar History de reserva sin cupo:', errorHistory);
                    }
                    return res.render("Reservas/EditarReserva", {
                        alert: true,
                        alertTitle: "Sin cupo disponible",
                        alertMessage: `No hay suficientes cupos para ${TotalPasajeros} pasajero(s). Cupos disponibles: ${disponibles}`,
                        alertIcon: "error",
                        showConfirmButton: true,
                        timer: 5000,
                        ruta: "Reservas/EditarReserva/" + Id_Reserva,
                    });
                });
                return;
            }

            // Si hay cupo, continuar con el flujo normal
            connection.query('INSERT INTO History SET ?', {
                Id_: Id_Reserva, Tipo: TipoHistory, Accion: AccionHistory, id_user: id_user, FechaRegistro, HoraRegistro
            }, (errorHistory) => {
                if (errorHistory) {
                    console.log(errorHistory);
                    return res.render("Reservas/EditarReserva", {
                        alert: true,
                        alertTitle: "¡Ocurrió un error!",
                        alertMessage: "No fue posible actualizar la reserva.",
                        alertIcon: "error",
                        showConfirmButton: false,
                        timer: 3500,
                        ruta: "Reservas/EditarReserva/" + Id_Reserva,
                    });
                }

                connection.query('UPDATE Reservas SET ? WHERE Id_Reserva = ?', [{
                    TipoReserva, NumeroPasajeros, TotalPasajeros, TourReserva,
                    PuntoEncuentro, Id_Punto, FechaReserva, TelefonoReserva, IdiomaReserva,
                    CategoriaReserva, NombreReporta, HoraSalida, Ruta, PagoAgencia,
                    Observaciones, FechaRegistro, Estado
                }, Id_Reserva], (errorReserva) => {
                    if (errorReserva) {
                        console.log(errorReserva);
                        return res.render("Reservas/EditarReserva", {
                            alert: true,
                            alertTitle: "¡Ocurrió un error!",
                            alertMessage: "No fue posible actualizar la reserva.",
                            alertIcon: "error",
                            showConfirmButton: false,
                            timer: 3500,
                            ruta: "Reservas/EditarReserva/" + Id_Reserva,
                        });
                    }

                    // Actualizar pasajeros existentes
                    for (let i = 0; i < TotalPasajeros_Old; i++) {
                        connection.query('UPDATE Pasajeros SET ? WHERE id = ?', [{
                            NombrePasajero: NomPas[i],
                            IdPas: IdPas[i],
                            TelefonoPasajero: Telefono[i],
                            PrecioTour: PrecioTour[i],
                            Precio: Precio[i],
                            Comision: Comision[i],
                            Fecha: FechaRegistro
                        }, id[i]], (errorPasajeros) => {
                            if (errorPasajeros) {
                                console.log(errorPasajeros);
                                return res.render("Reservas/EditarReserva", {
                                    alert: true,
                                    alertTitle: "¡Ocurrió un error!",
                                    alertMessage: "No fue posible actualizar los pasajeros.",
                                    alertIcon: "error",
                                    showConfirmButton: false,
                                    timer: 3500,
                                    ruta: "Reservas/EditarReserva/" + Id_Reserva,
                                });
                            }
                        });
                    }

                    // Insertar nuevos pasajeros
                    if (New_NomPas != undefined) {
                        for (let i = 0; i < NewPasajeros; i++) {
                            connection.query('INSERT INTO Pasajeros SET ?', {
                                Id_Reserva: Id_Reserva,
                                NombrePasajero: New_NomPas[i],
                                TipoPasajero: New_TipoPasajero[i],
                                IdPas: New_IdPas[i],
                                TelefonoPasajero: New_Telefono[i],
                                PrecioTour: New_PrecioTour[i],
                                Precio: New_Precio[i],
                                Comision: New_Comision[i],
                                Fecha: FechaRegistro,
                                Confirmacion
                            }, (errorPasajeros) => {
                                if (errorPasajeros) {
                                    console.log(errorPasajeros);
                                    return res.render("Reservas/EditarReserva", {
                                        alert: true,
                                        alertTitle: "¡Ocurrió un error!",
                                        alertMessage: "No fue posible agregar los nuevos pasajeros.",
                                        alertIcon: "error",
                                        showConfirmButton: false,
                                        timer: 3500,
                                        ruta: "Reservas/EditarReserva/" + Id_Reserva,
                                    });
                                }
                            });
                        }
                    }

                    res.render("Reservas/EditarReserva", {
                        alert: true,
                        alertTitle: "Éxito",
                        alertMessage: `La reserva ${Id_Reserva} se actualizó correctamente.`,
                        alertIcon: "success",
                        showConfirmButton: false,
                        timer: 1500,
                        ruta: "Reservas/EditarReserva/" + Id_Reserva,
                    });
                });
            });
        });
    });

} catch (error) {
    console.log(error);
}
}


exports.saveNuevoTransfer = async (req, res) => {
    try {
        var Id_Transfer = req.body.Id_Transfer;
        var Titular = req.body.Titular;
        var Tel_Contacto = req.body.Tel_Contacto;
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
        var Estado = req.body.Estado;

        var TipoHistory = 'TRANSFER';
        var AccionHistory = 'NUEVO';

        var id_user = req.body.id_user;

        var Fecha = new Date();
        var dia = String(Fecha.getDate()).padStart(2, '0');
        var mes = String(Fecha.getMonth() + 1).padStart(2, '0');
        var año = Fecha.getFullYear();
        var horas24 = Fecha.getHours();
        var horas = horas24 % 12 || 12; // Convierte la hora de 24 a 12 horas
        var minutos = String(Fecha.getMinutes()).padStart(2, '0');
        var segundos = String(Fecha.getSeconds()).padStart(2, '0');
        var ampm = horas24 >= 12 ? 'PM' : 'AM';
        var FechaRegistro = año + '-' + mes + '-' + dia;
        var HoraRegistro = horas + ':' + minutos + ':' + segundos + ' ' + ampm;

        connection.query('INSERT INTO History SET ?', {
            Id_: Id_Transfer, Tipo: TipoHistory, Accion: AccionHistory, id_user: id_user, FechaRegistro: FechaRegistro, HoraRegistro: HoraRegistro
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
                connection.query('INSERT INTO Transfer SET ?', { Id_Transfer: Id_Transfer, Titular: Titular, Tel_Contacto: Tel_Contacto, NumeroPasajeros: NumeroPasajeros, Servicio: Servicio, Salida: Salida, Llegada: Llegada, FechaTransfer: FechaTransfer, NombreReporta: NombreReporta, HoraRecogida: HoraRecogida, Vuelo: Vuelo, TelefonoTransfer: TelefonoTransfer, ValorServicio: ValorServicio, Observaciones: Observaciones, FechaRegistro: FechaRegistro, HoraRegistro: HoraRegistro, Estado: Estado }, async (errorReserva, resultReserva) => {
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
        })

    } catch (error) {
        console.log(error);
    }
}

exports.saveEditarTransfer = async (req, res) => {
    try {
        var Id_Transfer = req.body.Id_Transfer;
        var NumeroPasajeros = req.body.NumPas;
        var Titular = req.body.Titular;
        var Tel_Contacto = req.body.Tel_Contacto;
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
        var Estado = req.body.Estado;

        var TipoHistory = 'TRANSFER';
        var AccionHistory = 'EDITAR';

        var id_user = req.body.id_user;

        var Fecha = new Date();
        var dia = String(Fecha.getDate()).padStart(2, '0');
        var mes = String(Fecha.getMonth() + 1).padStart(2, '0');
        var año = Fecha.getFullYear();
        var horas24 = Fecha.getHours();
        var horas = horas24 % 12 || 12; // Convierte la hora de 24 a 12 horas
        var minutos = String(Fecha.getMinutes()).padStart(2, '0');
        var segundos = String(Fecha.getSeconds()).padStart(2, '0');
        var ampm = horas24 >= 12 ? 'PM' : 'AM';
        var FechaRegistro = año + '-' + mes + '-' + dia;
        var HoraRegistro = horas + ':' + minutos + ':' + segundos + ' ' + ampm;

        connection.query('INSERT INTO History SET ?', {
            Id_: Id_Transfer, Tipo: TipoHistory, Accion: AccionHistory, id_user: id_user, FechaRegistro: FechaRegistro, HoraRegistro: HoraRegistro
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
                connection.query('UPDATE Transfer SET ? WHERE Id_Transfer = ?', [{ Titular: Titular, Tel_Contacto: Tel_Contacto, NumeroPasajeros: NumeroPasajeros, Servicio: Servicio, Salida: Salida, Llegada: Llegada, FechaTransfer: FechaTransfer, NombreReporta: NombreReporta, HoraRecogida: HoraRecogida, Vuelo: Vuelo, TelefonoTransfer: TelefonoTransfer, ValorServicio: ValorServicio, Observaciones: Observaciones, Estado: Estado }, Id_Transfer], async (errorReserva, resultReserva) => {
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
    var Comision1 = req.body.Comision1;
    var Comision2 = req.body.Comision2;
    var Comision3 = req.body.Comision3;
    var Cupos = req.body.Cupos;

    connection.query('INSERT INTO Tours SET ?', { Id_Tour: Id_Tour, NombreTour: NombreTour, Abreviacion: Abreviacion, PrecioAdulto: PrecioAdulto, PrecioNiño: PrecioNiño, PrecioInfante: PrecioInfante, Comision1: Comision1, Comision2: Comision2, Comision3: Comision3, CupoBase: Cupos }, async (error, result) => {
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
            connection.query('SELECT Id_Punto FROM Puntos', async (error, resultPuntos) => {
                var contador = 0;
                for (var i = 0; i < resultPuntos.length; i++) {
                    connection.query('INSERT INTO Horarios SET ?', { Id_Punto: resultPuntos[i].Id_Punto, Id_Tour: Id_Tour }, async (error, result) => {
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
                            contador++;
                            if (contador == resultPuntos.length) {
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
                        }

                    })
                }

            })


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
    var Comision1 = req.body.Comision1;
    var Comision2 = req.body.Comision2;
    var Comision3 = req.body.Comision3;

    connection.query('UPDATE Tours SET ? WHERE Id_Tour = ?', [{ NombreTour: NombreTour, Abreviacion: Abreviacion, PrecioAdulto: PrecioAdulto, PrecioNiño: PrecioNiño, PrecioInfante: PrecioInfante, Comision1: Comision1, Comision2: Comision2, Comision3: Comision3 }, Id_Tour], async (error, result) => {
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

    var data = `SELECT MAX(Id_Punto) AS Id_Punto FROM Puntos `;
    connection.query(data, (error, results) => {
        if (error) {
            console.log(error);
        } else {
            var Id_Punto = results[0].Id_Punto + 1;
            var Id_Tour = req.body.Id_Tour;
            var NombrePunto = req.body.NombrePunto;
            var Sector = req.body.Sector || "PENDIENTE";
            var Latitud = req.body.Latitud || 0;
            var Longitud = req.body.Longitud || 0;
            var HoraSalida = req.body.HoraSalida || "PENDIENTE";
            var HoraLlegada = req.body.HoraLlegada || "PENDIENTE";
            var Ruta = req.body.Ruta || "PENDIENTE";
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
                        if (HoraSalida[i] == "") {
                            HoraSalida[i] = "PENDIENTE";
                        }
                        connection.query('INSERT INTO Horarios SET ?', { Id_Punto: Id_Punto, Id_Tour: Id_Tour[i], HoraSalida: HoraSalida[i], HoraLlegada: HoraLlegada[i], Ruta: Ruta }, async (error, result) => {
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
    });


}

exports.saveEditarPunto = async (req, res) => {
    var Id_Punto = req.body.Id_Punto;
    var Id_Tour = req.body.Id_Tour;
    var NombrePunto = req.body.NombrePunto;
    var Sector = req.body.Sector || "PENDIENTE";
    var Latitud = req.body.Latitud || 0;
    var Longitud = req.body.Longitud || 0;
    var HoraSalida = req.body.HoraSalida || "PENDIENTE";
    var HoraLlegada = req.body.HoraLlegada || "PENDIENTE";
    var Ruta = req.body.Ruta || "PENDIENTE";

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
                if (HoraSalida[i] == "") {
                    HoraSalida[i] = "PENDIENTE";
                }
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
    const Id_Punto = req.body.Id_Punto;
    const Posicion = req.body.Posicion;
    const Nuevo = 0;

    if (Id_Punto.length > 0) {
        try {
            // Crear una lista de promesas para las consultas
            const updatePromises = Id_Punto.map((id, index) => {
                return new Promise((resolve, reject) => {
                    const query = 'UPDATE Puntos SET Posicion = ?, Nuevo = ? WHERE Id_Punto = ?';
                    const values = [Posicion[index], Nuevo, id];

                    connection.query(query, values, (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    });
                });
            });

            // Esperar a que todas las promesas se completen
            await Promise.all(updatePromises);

            // Enviar la respuesta exitosa
            res.render("Puntos/OrdenarPuntos", {
                alert: true,
                alertTitle: "Éxito",
                alertMessage: "Los puntos de encuentro se han ordenado correctamente.",
                alertIcon: "success",
                showConfirmButton: false,
                timer: 1500,
                ruta: "Puntos/OrdenarPuntos",
            });
        } catch (error) {
            console.error(error);

            // Enviar la respuesta de error
            res.render("Puntos/OrdenarPuntos", {
                alert: true,
                alertTitle: "¡Ocurrió un error!",
                alertMessage: "No fue posible actualizar los puntos de encuentro. Si el error continúa, comuníquese con soporte técnico.",
                alertIcon: "error",
                showConfirmButton: false,
                timer: 3500,
                ruta: "Puntos/OrdenarPuntos",
            });
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
            if (error) {
                console.log(error);
                return next();
            }

            req.resultsTours = resultsTours;
            return next();
        });
    } catch (error) {
        console.log(error);
        return next();
    }
}

exports.ToursIndex = async (req, res, next) => {
    try {
        connection.query('SELECT * FROM Tours', (error, resultsTours) => {
            if (error) {
                console.log(error);
                return next();
            }

            // Combina los tours 1 y 5
            const tour1 = resultsTours.find(tour => tour.Id_Tour === 1);
            const tour5 = resultsTours.find(tour => tour.Id_Tour === 5);

            // Datos combinados
            const combinedTour = {
                Id_Tour: '1-5',
                NombreTour: `${tour1 ? tour1.NombreTour : ''} Y ${tour5 ? tour5.NombreTour : ''}`,
            };

            // Elimina tours individuales y agrega el combinado
            const filteredTours = resultsTours.filter(tour => tour.Id_Tour !== 1 && tour.Id_Tour !== 5);
            filteredTours.push(combinedTour);

            req.resultsTours = filteredTours;
            return next();
        });
    } catch (error) {
        console.log(error);
        return next();
    }
}


exports.ToursAforos = async (req, res, next) => {
    try {
        connection.query('SELECT * FROM Tours WHERE Id_Tour != 1', (error, resultsTours) => {
            if (!resultsTours) { return next(); }
            req.resultsTours = resultsTours;
            return next();
        });
    } catch (error) {
        console.log(error);
        return next();
    }
};

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
        // Si el usuario es Cliente, mostrar solo sus reservas
        // Obtenemos el id_user (DNI) del usuario actual desde req.user.id_user
        if (req.user && req.user.rol === "Cliente") {
            const userDNI = req.user.id_user;
            connection.query(`
                SELECT DISTINCT R.* FROM Reservas as R 
                LEFT JOIN Tours as T ON R.TourReserva = T.Id_Tour
                WHERE R.Id_Reserva IN (
                    SELECT DISTINCT Id_Reserva FROM History 
                    WHERE id_user = ? AND Accion = 'Nuevo'
                )
            `, [userDNI], (error, resultsReservas) => {
                if (!resultsReservas) { return next() }
                req.resultsReservas = resultsReservas
                return next()
            })
        } else {
            // Para otros roles, mostrar todas las reservas
            connection.query('SELECT * FROM Reservas as R LEFT JOIN Tours as T ON R.TourReserva = T.Id_Tour', (error, resultsReservas) => {
                if (!resultsReservas) { return next() }
                req.resultsReservas = resultsReservas
                return next()
            })
        }
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