const express = require('express');
const router = express.Router();
const connection = require('../database/db');
const Controller = require('../controllers/Controller');
const { compareSync } = require('bcryptjs');
const bcryptjs = require('bcryptjs');

//Login
router.get('/login', Controller.ensureNotAuthenticated, (req, res) => {
    res.render('login', { layout: false });
})

//------------------------------------------------------------------------------------------

//--------------------------------Rutas--------------------------------
router.get('/', Controller.isAuthenticated, Controller.Cupos, Controller.CuposR, Controller.CuposH, (req, res) => {
    if (rol == "Asesor") {
        res.render('index_asesor', { user: req.user, rol: rol, resultsCupos: req.resultsCupos, resultsCuposR: req.resultsCuposR, resultsCuposH: req.resultsCuposH });
    } else if (rol == "Administrador") {
        res.render('index_admin', { user: req.user, rol: rol, resultsCupos: req.resultsCupos, resultsCuposR: req.resultsCuposR, resultsCuposH: req.resultsCuposH });
    }
})

router.get('/Reservas/NuevaReserva', Controller.isAuthenticated, Controller.Tours, Controller.Categoria, (req, res) => {

    res.render('Reservas/NuevaReserva', { user: req.user, resultsTours: req.resultsTours, resultsCategoria: req.resultsCategoria });

})
router.get('/Reservas/EditarReserva/:Id_Reserva', Controller.isAuthenticated, Controller.Tours, Controller.Categoria, (req, res) => {

    const Id_Reserva = req.params.Id_Reserva;
    connection.query('SELECT * FROM Reservas WHERE Id_Reserva = ?', [Id_Reserva], (error, result) => {
        if (error) {
            throw error;
        } else {
            res.render('Reservas/EditarReserva', { user: req.user, resultsTours: req.resultsTours, resultsCategoria: req.resultsCategoria, Reserva: result[0] });
        }
    })
})

router.get('/Reservas/VerReservas', Controller.isAuthenticated, Controller.VerReservas, Controller.Tours, Controller.Categoria, (req, res) => {
    res.render('Reservas/VerReservas', { user: req.user, resultsReservas: req.resultsReservas, resultsTours: req.resultsTours, resultsCategoria: req.resultsCategoria });
})

router.get('/Transfer/NuevoTransfer', Controller.isAuthenticated, Controller.ServicioTransfer, (req, res) => {

    res.render('Transfer/NuevoTransfer', { user: req.user, resultsServicio: req.resultsServicio });

})
router.get('/Transfer/EditarTransfer/:Id_Transfer', Controller.isAuthenticated, Controller.ServicioTransfer, (req, res) => {

    const Id_Transfer = req.params.Id_Transfer;
    connection.query('SELECT * FROM Transfer WHERE Id_Transfer = ?', [Id_Transfer], (error, result) => {
        if (error) {
            throw error;
        } else {
            res.render('Transfer/EditarTransfer', { user: req.user, resultsServicio: req.resultsServicio, Transfer: result[0] });
        }
    })
})

router.get('/Transfer/VerTransfer', Controller.isAuthenticated, Controller.VerTransfer, Controller.ServicioTransfer, (req, res) => {
    res.render('Transfer/VerTransfer', { user: req.user, resultsTransfer: req.resultsTransfer, resultsServicio: req.resultsServicio });
})

router.get('/Tours/NuevoTour', Controller.isAuthenticated, (req, res) => {
    if (rol == "Asesor") {
        return res.redirect('/');
    } else if (rol == "Administrador") {
        res.render('Tours/NuevoTour', { user: req.user });
    }
})

router.get('/Tours/EditarTour/:Id_Tour', Controller.isAuthenticated, (req, res) => {
    if (rol == "Asesor") {
        return res.redirect('/');
    } else if (rol == "Administrador") {
        const Id_Tour = req.params.Id_Tour;
        connection.query('SELECT * FROM Tours WHERE Id_Tour = ?', [Id_Tour], (error, result) => {
            if (error) {
                throw error;
            } else {
                res.render('Tours/EditarTour', { user: req.user, Tour: result[0] });
            }
        })
    }
})

router.get('/Tours/VerTours', Controller.isAuthenticated, (req, res) => {
    if (rol == "Asesor") {
        connection.query('SELECT * FROM Tours', async (error, result) => {
            if (error) {
                throw error
            } else {
                res.render('Tours/VerToursAsesor', { user: req.user, resultsTours: result });
            }
        })
    } else if (rol == "Administrador") {
        connection.query('SELECT * FROM Tours', async (error, result) => {
            if (error) {
                throw error
            } else {
                res.render('Tours/VerTours', { user: req.user, resultsTours: result });
            }
        })
    }
})

router.get('/Puntos/NuevoPunto', Controller.isAuthenticated, Controller.Tours, (req, res) => {

    res.render('Puntos/NuevoPunto', { user: req.user, resultsTours: req.resultsTours });

})

router.get('/Puntos/VerPuntos', Controller.isAuthenticated, (req, res) => {
    connection.query('SELECT * FROM Puntos as P INNER JOIN Horarios AS H ON P.Id_Punto = H.Id_Punto GROUP BY P.Id_Punto', async (error, result) => {
        if (error) {
            throw error
        } else {
            res.render('Puntos/VerPuntos', { user: req.user, resultsPuntos: result });
        }
    })

})

router.get('/Puntos/EditarPunto/:Id_Punto', Controller.isAuthenticated, Controller.Tours, (req, res) => {
    const Id_Punto = req.params.Id_Punto;
    connection.query('SELECT * FROM Puntos AS P INNER JOIN Horarios AS H ON P.Id_Punto = H.Id_Punto WHERE P.Id_Punto = ?', [Id_Punto], (error, result) => {
        if (error) {
            throw error;
        } else {
            res.render('Puntos/EditarPunto', { user: req.user, Punto: result[0], resultsTours: req.resultsTours });
        }
    })
})

router.get('/Puntos/OrdenarPuntos', Controller.isAuthenticated, (req, res) => {
    if (rol == "Asesor") {
        return res.redirect('/');
    } else if (rol == "Administrador") {
        connection.query('SELECT DISTINCT Ruta FROM Horarios', async (error, resultRutas) => {
            if (error) {
                throw error
            } else {
                res.render('Puntos/OrdenarPuntos', { user: req.user, resultRutas: resultRutas });
            }
        })
    }
})

router.get('/Programacion/Listado', Controller.isAuthenticated, Controller.Tours, (req, res) => {
    if (rol == "Asesor") {
        return res.redirect('/');
    } else if (rol == "Administrador") {
        connection.query('SELECT DISTINCT Ruta FROM Horarios', async (error, resultRutas) => {
            if (error) {
                throw error
            } else {
                res.render('Programacion/Listado', { user: req.user, resultsTours: req.resultsTours, resultRutas: resultRutas });
            }
        })

    }
})

router.get('/Programacion/Confirmacion', Controller.isAuthenticated, Controller.Tours, (req, res) => {
    if (rol == "Asesor") {
        return res.redirect('/');
    } else if (rol == "Administrador") {
        res.render('Programacion/Confirmacion', { user: req.user, resultsTours: req.resultsTours });
    }
})

router.get('/Comisiones/Comisiones', Controller.isAuthenticated, Controller.Tours, (req, res) => {
    if (rol == "Asesor") {
        return res.redirect('/');
    } else if (rol == "Administrador") {
        res.render('Comisiones/Comisiones', { user: req.user, resultsTours: req.resultsTours });
    }
})

router.get('/Seguros/Seguros', Controller.isAuthenticated, Controller.Tours, (req, res) => {
    if (rol == "Asesor") {
        return res.redirect('/');
    } else if (rol == "Administrador") {
        res.render('Seguros/Seguros', { user: req.user, resultsTours: req.resultsTours });
    }
})

router.get('/Settings/NewUser', Controller.isAuthenticated, (req, res) => {
    if (rol == "Asesor") {
        return res.redirect('/');
    } else if (rol == "Administrador") {
        res.render('Settings/NewUser', { user: req.user });
    }
})

router.get('/Settings/AdminUsers', Controller.isAuthenticated, (req, res) => {
    if (rol == "Asesor") {
        return res.redirect('/');
    } else if (rol == "Administrador") {
        connection.query('SELECT * FROM users', async (error, result) => {
            if (error) {
                throw error
            } else {
                res.render('Settings/AdminUsers', { user: req.user, resultUsers: result });
            }
        })

    }
})

router.get('/Settings/EditarUser/:id', Controller.isAuthenticated, Controller.Tours, Controller.Categoria, (req, res) => {
    if (rol == "Asesor") {
        return res.redirect('/');
    } else if (rol == "Administrador") {
        const Id = req.params.id;
        connection.query('SELECT * FROM users WHERE id = ?', [Id], (error, result) => {
            if (error) {
                throw error;
            } else {
                res.render('Settings/EditarUser', { user: req.user, User: result[0] });
            }
        })    }
})

router.get('/Settings/Perfil/:id', Controller.isAuthenticated, Controller.Tours, Controller.Categoria, (req, res) => {
    const Id = req.params.id;
    connection.query('SELECT * FROM users WHERE id = ?', [Id], (error, result) => {
        if (error) {
            throw error;
        } else {
            res.render('Settings/Perfil', { user: req.user, User: result[0] });
        }
    })
})
//--------------------------------------------------------------------------

//--------------------------------Index json--------------------------------
router.get('/Index/Tours', (request, response, next) => {
    var Tours = 'SELECT * FROM Tours WHERE Id_Tour != 1 AND Id_Tour != 5';
    connection.query(Tours, (error, data) => {
        response.json(data);
    });
})

router.get('/Index/ToursRH', (request, response, next) => {
    var Tours = 'SELECT * FROM Tours WHERE Id_Tour = 5';
    connection.query(Tours, (error, data) => {
        response.json(data);
    });
})

router.get('/Index/Cupos', (request, response, next) => {
    var Id_Tour = request.query.Id_Tour;
    var Fecha = request.query.Fecha;
    var Cupos = `SELECT SUM(NumeroPasajeros) as Total FROM Reservas WHERE TourReserva = '${Id_Tour}' AND TipoReserva = 'Grupal' AND FechaReserva = '${Fecha}'`;
    connection.query(Cupos, (error, data) => {
        response.json(data);
    })
})

router.get('/Index/CuposRH', (request, response, next) => {
    var Fecha = request.query.Fecha;
    var CuposRH = `SELECT SUM(NumeroPasajeros) as Total FROM Reservas WHERE TourReserva IN (1,5) AND TipoReserva = 'Grupal' AND FechaReserva = '${Fecha}'`;
    connection.query(CuposRH, (error, data) => {
        response.json(data);
    })
})

router.get('/Index/PasajerosRio', (request, response, next) => {
    var Fecha = request.query.Fecha;
    var PasajerosRio = `SELECT SUM(NumeroPasajeros) as Pasajeros FROM Reservas WHERE TourReserva = 1 AND FechaReserva = '${Fecha}'`;
    connection.query(PasajerosRio, (error, data) => {
        response.json(data);
    })
})

router.get('/Index/PasajerosHacienda', (request, response, next) => {
    var Fecha = request.query.Fecha;
    var PasajerosHacienda = `SELECT SUM(NumeroPasajeros) as Pasajeros FROM Reservas WHERE TourReserva = 5 AND FechaReserva = '${Fecha}'`;
    connection.query(PasajerosHacienda, (error, data) => {
        response.json(data);
    })
})

router.get('/Index/Privados', (request, response, next) => {
    var Fecha = request.query.Fecha;
    var Transfer = `SELECT COUNT(Id_Reserva) as Privados FROM Reservas WHERE TipoReserva = 'Privada' AND FechaReserva = '${Fecha}'`;
    connection.query(Transfer, (error, data) => {
        response.json(data);
    })
})

router.get('/Index/Transfer', (request, response, next) => {
    var Fecha = request.query.Fecha;
    var Transfer = `SELECT COUNT(Id_Transfer) as Transfer FROM Transfer WHERE FechaTransfer = '${Fecha}'`;
    connection.query(Transfer, (error, data) => {
        response.json(data);
    })
})

router.get('/Index/TransferAeropuerto', (request, response, next) => {
    var Fecha = request.query.Fecha;
    var PasajerosAeropuerto = `SELECT COUNT(Id_Transfer) as Transfer FROM Transfer WHERE Servicio = 2 AND FechaTransfer = '${Fecha}'`;
    connection.query(PasajerosAeropuerto, (error, data) => {
        response.json(data);
    })
})

router.get('/Index/TransferHotel', (request, response, next) => {
    var Fecha = request.query.Fecha;
    var PasajerosHotel = `SELECT COUNT(Id_Transfer) as Transfer FROM Transfer WHERE Servicio = 1 AND FechaTransfer = '${Fecha}'`;
    connection.query(PasajerosHotel, (error, data) => {
        response.json(data);
    })
})

//----------------------------------------------------------------

//--------------------------------Nueva Reserva json--------------------------------
router.get('/autocompletar', (request, response, next) => {

    var search_query = request.query.search_query;
    var Id_Tour = request.query.Id_Tour;

    var query = `SELECT * FROM Horarios as h INNER JOIN Puntos as p ON h.Id_Punto = p.Id_Punto INNER JOIN Tours as t ON h.Id_Tour = t.Id_Tour WHERE t.Id_Tour = '${Id_Tour}' and p.NombrePunto LIKE '%${search_query}%' LIMIT 10`;

    connection.query(query, (error, data) => {

        response.json(data);

    });

});

router.get('/HoraRuta', (request, response, next) => {

    var Id_Tour = request.query.Id_Tour;
    var Punto = request.query.Punto;

    var Punto = `SELECT * FROM Horarios as h INNER JOIN Puntos as p ON h.Id_Punto = p.Id_Punto INNER JOIN Tours as t ON h.Id_Tour = t.Id_Tour WHERE t.Id_Tour = '${Id_Tour}' AND p.NombrePunto = '${Punto}'`;

    connection.query(Punto, (error, data) => {
        if (error) {
            throw error;
        } else {
            response.json(data);
        }
    });

});

router.get('/Id_Reserva', (req, res, next) => {

    var Id_Tour = req.query.Id_Tour;
    var TourAbreviado = `SELECT Abreviacion FROM Tours WHERE Id_Tour = '${Id_Tour}'`;
    connection.query(TourAbreviado, (error, data) => {
        if (error) {
            throw error;
        } else {

            call_ID = () => {
                Id();
            }

            Id = () => {

                Id_Reserva = data[0].Abreviacion + Math.floor(Math.random() * (10000 - 999) + 999);

                var Id = `SELECT Id_Reserva FROM Reservas WHERE Culminada = 0 AND Id_Reserva = '${Id_Reserva}'`;
                connection.query(Id, (error, dataId) => {
                    if (error) {
                        throw error;
                    } else {
                        if (dataId.length > 0) {
                            call_ID();

                        } else {
                            res.json(Id_Reserva);
                        }
                    }

                });

            }
            Id();

        }
    });
})

router.get('/Cupos', (request, response, next) => {
    var Id_Tour = request.query.Id_Tour;
    var TCupos = request.query.Cupos;
    var TotalCupos = `SELECT ` + TCupos + ` as Cupos FROM Tours WHERE Id_Tour = '${Id_Tour}'`;
    connection.query(TotalCupos, (error, data) => {
        response.json(data);
    });
})
router.get('/TotalPasajeros', (request, response, next) => {
    var Fecha = request.query.Fecha;
    var Id_Tour = request.query.Id_Tour;
    var TotalPasajeros = `SELECT SUM(NumeroPasajeros) as Total FROM Reservas WHERE TourReserva = '${Id_Tour}' AND FechaReserva = '${Fecha}' AND TipoReserva = 'Grupal'`;
    connection.query(TotalPasajeros, (error, data) => {
        response.json(data);
    });
})
//------------------------------------------------------------------------------------------

//--------------------------------Ver Reservas json--------------------------------
router.get('/VerRervas/Pasajeros', (request, response, next) => {

    var Id_Reserva = request.query.Id_Reserva;

    var Pasajeros = `SELECT * FROM Pasajeros WHERE Id_Reserva = '${Id_Reserva}'`;

    connection.query(Pasajeros, (error, data) => {
        if (error) {
            throw error;
        } else {
            response.json(data);
        }
    });

});

router.get('/VerReservas/FiltroVerReservas', (request, response, next) => {

    var FechaRes = request.query.FechaReserva;
    var FechaReg = request.query.FechaRegistro;
    var selectionTour = request.query.selectionTour;
    var Categoria = request.query.CategoriaReserva;
    var Id_Res = request.query.Id_Reserva;
    var DNI = request.query.IdPas;
    var Empty = request.query.Empty;
    var NombreApellido = request.query.NombreApellido;

    var Reservas = `SELECT * FROM Reservas as R inner join Pasajeros as P on R.Id_Reserva = P.Id_Reserva`;
    var Union = '';
    var Union1 = '';
    var Union2 = '';
    var Union3 = '';
    var Union4 = '';
    var Union5 = '';
    var Union6 = '';

    var FechaReserva = '';
    if (FechaRes != '') {
        FechaReserva = 'FechaReserva ="' + FechaRes + '"';
    }

    var FechaRegistro = '';
    if (FechaReg != '') {
        FechaRegistro = 'FechaRegistro ="' + FechaReg + '"';
    }

    var CategoriaReserva = '';
    if (Categoria != '') {

        var CategoriaCount = Categoria.length;

        var i = 0;
        var Cseleccion = "";
        while (i < CategoriaCount) {
            Cseleccion = Cseleccion + "'" + Categoria[i] + "'";
            if (i < CategoriaCount - 1) {
                Cseleccion = Cseleccion + ", ";
            }
            i++;
        }
        CategoriaReserva = 'CategoriaReserva in (' + Cseleccion + ')';

    }

    var Id_Tour = '';
    if (selectionTour != '') {
        var selectionTourCount = selectionTour.length;

        var i = 0;
        var tseleccion = "";
        while (i < selectionTourCount) {
            tseleccion = tseleccion + "'" + selectionTour[i] + "'";
            if (i < selectionTourCount - 1) {
                tseleccion = tseleccion + ", ";
            }
            i++;
        }
        Id_Tour = 'TourReserva in (' + tseleccion + ')';
    }

    var Id_Reserva = '';
    if (Id_Res != '') {
        Id_Reserva = 'R.Id_Reserva ="' + Id_Res + '"';
    }

    var IdPas = '';
    if (DNI != '') {
        IdPas = 'IdPas ="' + DNI + '"';
    }
    NombrePasajero = '';
    if (Empty == 'Check') {
        NombrePasajero = 'NombrePasajero = ""';
    }
    Nombre = '';
    if (NombreApellido != '') {
        Nombre = 'NombrePasajero ="' + NombreApellido + '"';
    }

    if ((FechaRes != '') && (FechaReg != '')) {
        Union = ' AND';
    }
    if ((FechaRes != '') && (selectionTour != '')) {
        Union1 = ' AND';
    }
    if ((selectionTour != '') && (FechaReg != '')) {
        Union1 = ' AND';
    }
    if ((selectionTour != '') && (Categoria != '')) {
        Union2 = ' AND';
    }
    if ((selectionTour != '') && (Id_Res != '')) {
        Union3 = ' AND';
    }
    if ((selectionTour != '') && (DNI != '')) {
        Union4 = ' AND';
    }
    if ((FechaRes != '') && (Categoria != '')) {
        Union2 = ' AND';
    }
    if ((FechaRes != '') && (Id_Res != '')) {
        Union3 = ' AND';
    }
    if ((FechaRes != '') && (DNI != '')) {
        Union4 = ' AND';
    }
    if ((FechaReg != '') && (Categoria != '')) {
        Union2 = ' AND';
    }
    if ((FechaReg != '') && (Id_Res != '')) {
        Union4 = ' AND';
    }
    if ((FechaReg != '') && (DNI != '')) {
        Union4 = ' AND';
    }
    if ((Categoria != '') && (Id_Res != '')) {
        Union4 = ' AND';
    }
    if ((Id_Res != '') && (DNI != '')) {
        Union4 = ' AND';
    }
    if ((selectionTour != '') && (NombrePasajero != '')) {
        Union5 = ' AND';
    }
    if ((FechaRes != '') && (NombrePasajero != '')) {
        Union5 = ' AND';
    }
    if ((FechaReg != '') && (NombrePasajero != '')) {
        Union5 = ' AND';
    }
    if ((Categoria != '') && (NombrePasajero != '')) {
        Union5 = ' AND';
    }
    if ((IdPas != '') && (NombrePasajero != '')) {
        Union5 = ' AND';
    }
    if ((Id_Res != '') && (NombrePasajero != '')) {
        Union5 = ' AND';
    }
    if ((FechaRes != '') && (NombreApellido != '')) {
        Union6 = ' AND';
    }
    if ((FechaReg != '') && (NombreApellido != '')) {
        Union6 = ' AND';
    }
    if ((selectionTour != '') && (NombreApellido != '')) {
        Union6 = ' AND';
    }
    if ((Categoria != '') && (NombreApellido != '')) {
        Union6 = ' AND';
    }
    if ((Id_Res != '') && (NombreApellido != '')) {
        Union6 = ' AND';
    }
    if ((DNI != '') && (NombreApellido != '')) {
        Union6 = ' AND';
    }
    if ((Empty != '') && (NombreApellido != '')) {
        Union6 = ' AND';
    }


    if ((selectionTour != '') && (FechaRes != '') && (FechaReg != '') && (Categoria != '') && (IdPas != '') && (Id_Res != '') && (Empty != '') && (NombreApellido != '')) {
        Union = ' AND';
        Union1 = ' AND';
        Union2 = ' AND';
        Union3 = ' AND';
        Union4 = ' AND';
        Union5 = ' AND';
        Union6 = ' AND';
    }

    Reservas += ` WHERE ${FechaReserva} ${Union} ${FechaRegistro} ${Union1} ${Id_Tour} ${Union2} ${CategoriaReserva} ${Union3} ${Id_Reserva} ${Union4} ${IdPas} ${Union5} ${NombrePasajero} ${Union6} ${Nombre}`;
    console.log(Reservas)
    connection.query(Reservas, (error, data) => {
        if (error) {
            throw error;
        } else {
            response.json(data);
        }
    });

});

router.get('/Reservas/DeleteReserva', (req, res) => {

    var Id_Reserva = req.query.Id_Reserva;
    var DeleteReserva = `DELETE FROM Reservas WHERE Id_Reserva = '${Id_Reserva}'`
    var DeletePasajeros = `DELETE FROM Pasajeros WHERE Id_Reserva = '${Id_Reserva}'`
    connection.query(DeletePasajeros, (error, result) => {
        if (error) {
            var err = 'error';
            res.json(err);
        } else {
            connection.query(DeleteReserva, (error, result) => {
                if (error) {
                    var err = 'error';
                    res.json(err);
                } else {
                    res.json(Id_Reserva);
                }
            })
        }
    })
})

//------------------------------------------------------------------------------------------

//--------------------------------Editar Reserva json--------------------------------
router.get('/Edit/Pasajeros', (request, response, next) => {

    var Id_Reserva = request.query.Id_Reserva;

    var Pasajeros = `SELECT * FROM Pasajeros WHERE Id_Reserva = '${Id_Reserva}'`;

    connection.query(Pasajeros, (error, data) => {
        if (error) {
            throw error;
        } else {
            response.json(data);
        }
    });

});

router.get('/DeletePasajero', (req, res) => {

    const id = req.query.id;
    var DeletePasajero = `DELETE FROM Pasajeros WHERE id = '${id}'`
    connection.query(DeletePasajero, (error, result) => {
        if (error) {
            var err = 'error';
            res.json(err);
        } else {
            res.json(id);
        }
    })
})

//------------------------------------------------------------------------------------------

//----------------------------------------Nuevo Transfer json-------------------------------
router.get('/Id_Transfer', (req, res, next) => {


    call_ID = () => {
        Id();
    }

    Id = () => {

        Id_Transfer = 'RT' + Math.floor(Math.random() * (10000 - 999) + 999);

        var Id = `SELECT Id_Transfer FROM Transfer WHERE Culminada = 0 AND Id_Transfer = '${Id_Transfer}'`;
        connection.query(Id, (error, dataId) => {
            if (error) {
                throw error;
            } else {
                if (dataId.length > 0) {
                    call_ID();

                } else {
                    res.json(Id_Transfer);
                }
            }

        });

    }
    Id();



})
//------------------------------------------------------------------------------------------

//----------------------------------------Ver Transfer json---------------------------------
router.get('/VerTransfer/Pasajeros', (request, response, next) => {

    var Id_Transfer = request.query.Id_Transfer;

    var Pasajeros = `SELECT * FROM PasajerosTransfer WHERE Id_Transfer = '${Id_Transfer}'`;

    connection.query(Pasajeros, (error, data) => {
        if (error) {
            throw error;
        } else {
            response.json(data);
        }
    });

});

router.get('/VerTransfer/FiltroVerTransfer', (request, response, next) => {

    var FechaTrans = request.query.FechaTransfer;
    var FechaReg = request.query.FechaRegistro;
    var selectionServicio = request.query.Servicio;
    var Id_Trans = request.query.Id_Transfer;
    var DNI = request.query.IdPas;
    var Empty = request.query.Empty;
    var NombreApellido = request.query.NombreApellido;

    var Transfer = `SELECT * FROM Transfer as T inner join PasajerosTransfer as P on T.Id_Transfer = P.Id_Transfer`;
    var Union = '';
    var Union1 = '';
    var Union2 = '';
    var Union3 = '';
    var Union4 = '';
    var Union5 = '';


    var FechaTransfer = '';
    if (FechaTrans != '') {
        FechaTransfer = 'FechaTransfer ="' + FechaTrans + '"';
    }

    var FechaRegistro = '';
    if (FechaReg != '') {
        FechaRegistro = 'FechaRegistro ="' + FechaReg + '"';
    }

    var Servicio = '';
    if (selectionServicio != '') {
        var selectionServicioCount = selectionServicio.length;

        var i = 0;
        var tseleccion = "";
        while (i < selectionServicioCount) {
            tseleccion = tseleccion + "'" + selectionServicio[i] + "'";
            if (i < selectionServicioCount - 1) {
                tseleccion = tseleccion + ", ";
            }
            i++;
        }
        Servicio = 'Servicio in (' + tseleccion + ')';
    }

    var Id_Transfer = '';
    if (Id_Trans != '') {
        Id_Transfer = 'T.Id_Transfer ="' + Id_Trans + '"';
    }

    var IdPas = '';
    if (DNI != '') {
        IdPas = 'IdPas ="' + DNI + '"';
    }
    NombrePasajeroEmpty = '';
    if (Empty == 'Check') {
        NombrePasajeroEmpty = 'NombrePasajero = ""';
    }
    Nombre = '';
    if (NombreApellido != '') {
        Nombre = 'NombrePasajero ="' + NombreApellido + '"';
    }

    if ((FechaTrans != '') && (FechaReg != '')) {
        Union = ' AND';
    }
    if ((FechaTrans != '') && (selectionServicio != '')) {
        Union1 = ' AND';
    }
    if ((selectionServicio != '') && (FechaReg != '')) {
        Union1 = ' AND';
    }
    if ((selectionServicio != '') && (Id_Trans != '')) {
        Union2 = ' AND';
    }
    if ((selectionServicio != '') && (DNI != '')) {
        Union3 = ' AND';
    }

    if ((FechaTrans != '') && (Id_Trans != '')) {
        Union2 = ' AND';
    }
    if ((FechaTrans != '') && (DNI != '')) {
        Union2 = ' AND';
    }
    if ((FechaReg != '') && (Id_Trans != '')) {
        Union2 = ' AND';
    }
    if ((FechaReg != '') && (DNI != '')) {
        Union2 = ' AND';
    }
    if ((Id_Trans != '') && (DNI != '')) {
        Union3 = ' AND';
    }
    if ((selectionServicio != '') && (NombrePasajeroEmpty != '')) {
        Union4 = ' AND';
    }
    if ((FechaTrans != '') && (NombrePasajeroEmpty != '')) {
        Union4 = ' AND';
    }
    if ((FechaReg != '') && (NombrePasajeroEmpty != '')) {
        Union4 = ' AND';
    }

    if ((FechaTrans != '') && (NombreApellido != '')) {
        Union5 = ' AND';
    }
    if ((FechaReg != '') && (NombreApellido != '')) {
        Union5 = ' AND';
    }
    if ((selectionServicio != '') && (NombreApellido != '')) {
        Union5 = ' AND';
    }

    if ((Id_Trans != '') && (NombreApellido != '')) {
        Union5 = ' AND';
    }

    if ((DNI != '') && (NombreApellido != '')) {
        Union5 = ' AND';
    }

    if ((Empty != '') && (NombreApellido != '')) {
        Union5 = ' AND';
    }


    if ((selectionServicio != '') && (FechaTrans != '') && (FechaReg != '') && (IdPas != '') && (Id_Trans != '') && (Empty != '') && (Nombre != '')) {
        Union = ' AND';
        Union1 = ' AND';
        Union2 = ' AND';
        Union3 = ' AND';
        Union4 = ' AND';
        Union5 = ' AND';
    }

    Transfer += ` WHERE ${FechaTransfer} ${Union} ${FechaRegistro} ${Union1} ${Servicio} ${Union2} ${Id_Transfer} ${Union3} ${IdPas} ${Union4} ${NombrePasajeroEmpty} ${Union5} ${Nombre}`;
    console.log(Transfer)
    connection.query(Transfer, (error, data) => {
        if (error) {
            throw error;
        } else {
            response.json(data);
        }
    });

});

router.get('/Transfer/DeleteTransfer', (req, res) => {

    const Id_Transfer = req.query.Id_Transfer;
    var DeleteTransfer = `DELETE FROM Transfers WHERE Id_Transfer = '${Id_Transfer}'`
    connection.query(DeleteTransfer, (error, result) => {
        if (error) {
            var err = 'error';
            res.json(err);
        } else {
            res.json(Id_Transfer);
        }
    })
})

//------------------------------------------------------------------------------------------

//--------------------------------Editar Transfer json--------------------------------
router.get('/EditarTransfer/Pasajeros', (request, response, next) => {

    var Id_Transfer = request.query.Id_Transfer;

    var Pasajeros = `SELECT * FROM PasajerosTransfer WHERE Id_Transfer = '${Id_Transfer}'`;

    connection.query(Pasajeros, (error, data) => {
        if (error) {
            throw error;
        } else {
            response.json(data);
        }
    });

});

router.get('/EditarTransfer/DeletePasajero', (req, res) => {

    const id = req.query.id;
    var DeletePasajero = `DELETE FROM PasajerosTransfer WHERE id = '${id}'`
    connection.query(DeletePasajero, (error, result) => {
        if (error) {
            var err = 'error';
            res.json(err);
        } else {
            res.json(id);
        }
    })
})

router.get('/EditarTransfer/DeletePasajero', (req, res) => {

    const id = req.query.id;
    var DeletePasajero = `DELETE FROM PasajerosTransfer WHERE id = '${id}'`
    connection.query(DeletePasajero, (error, result) => {
        if (error) {
            var err = 'error';
            res.json(err);
        } else {
            res.json(id);
        }
    })
})

//------------------------------------------------------------------------------------------

//--------------------------------------Nuevo Tour json------------------------------------------
router.get('/Tours/Id_Tour', (req, res, next) => {
    var data = `SELECT MAX(Id_Tour) AS Id_Tour FROM Tours `
    connection.query(data, (error, results) => {
        if (error) {
            console.log(error);
        } else {
            Id_Tour = results[0].Id_Tour + 1;
            res.json(Id_Tour);
        }
    })
})
//------------------------------------------------------------------------------------------

//-------------------------------------Editar Tour json-------------------------------------
router.get('/Tours/DeleteTour', (req, res) => {

    const Id_Tour = req.query.Id_Tour;
    var DeleteTour = `DELETE FROM Tours WHERE Id_Tour = '${Id_Tour}'`
    connection.query(DeleteTour, (error, result) => {
        if (error) {
            var err = 'error';
            res.json(err);
        } else {
            res.json(Id_Tour);
        }
    })
})
//----------------------------------------------------------------------------------------

//--------------------------------------Nuevo Punto json------------------------------------------
router.get('/Puntos/Id_Punto', (req, res, next) => {
    var data = `SELECT MAX(Id_Punto) AS Id_Punto FROM Puntos `
    connection.query(data, (error, results) => {
        if (error) {
            console.log(error);
        } else {
            Id_Punto = results[0].Id_Punto + 1;
            res.json(Id_Punto);
        }
    })
})
//------------------------------------------------------------------------------------------

//--------------------------------------Ver Puntos json------------------------------------------
router.get('/Puntos/DeletePunto', (req, res) => {
    var Id_Punto = req.query.Id_Punto;
    var DeletePunto = `DELETE FROM Puntos WHERE Id_Punto = '${Id_Punto}'`
    var DeleteHorarios = `DELETE FROM Horarios WHERE Id_Punto = '${Id_Punto}'`
    connection.query(DeleteHorarios, (error, result) => {
        if (error) {
            var err = 'error';
            res.json(err);
        } else {
            connection.query(DeletePunto, (error, result) => {
                if (error) {
                    var err = 'error';
                    res.json(err);
                } else {
                    res.json(Id_Punto);
                }
            })
        }
    })
})
//------------------------------------------------------------------------------------------

//-------------------------------------Editar Punto json-------------------------------------
router.get('/EditarPunto/Horarios', (req, res) => {
    var Id_Tour = req.query.Id_Tour;
    const Id_Punto = req.query.Id_Punto;
    var Horario = `SELECT * FROM Horarios WHERE Id_Punto = '${Id_Punto}' AND Id_Tour = '${Id_Tour}'`
    connection.query(Horario, (error, result) => {
        if (error) {
            throw error;
        } else {
            res.json(result);
        }
    })
})
//----------------------------------------------------------------------------------------

//-------------------------------------Ordenar Puntos json-------------------------------------
router.get('/Ordenar/Table', (req, res) => {
    var Ruta = req.query.Ruta;
    var Puntos = `SELECT * FROM Puntos AS P INNER JOIN Horarios AS H ON P.Id_Punto = H.Id_Punto WHERE Ruta = '${Ruta}' GROUP BY P.Id_Punto ORDER BY Posicion`
    connection.query(Puntos, (error, result) => {
        if (error) {
            throw error;
        } else {
            res.json(result);
        }
    })
})
router.get('/Ordenar/Nuevos', (req, res) => {
    var Puntos = `SELECT DISTINCT(Ruta) AS Ruta FROM Horarios AS H INNER JOIN Puntos AS P ON H.Id_Punto = P.Id_Punto WHERE P.Nuevo = 1`
    connection.query(Puntos, (error, result) => {
        if (error) {
            throw error;
        } else {
            res.json(result);
        }
    })
})
//----------------------------------------------------------------------------------------

//-------------------------------------Programacion json-------------------------------------
router.get('/Listado/Listado', (req, res) => {
    var selectionTour = req.query.Tour;
    var Fecha = req.query.Fecha;
    var Ruta = req.query.Ruta;
    var Listado = `SELECT R.Id_Reserva, R.NumeroPasajeros, R.PuntoEncuentro, R.IdiomaReserva, R.NombreReporta, R.FechaReserva,T.NombreTour, Ruta, GROUP_CONCAT(P.NombrePasajero SEPARATOR ', ') AS NombrePasajero,  GROUP_CONCAT(P.IdPas SEPARATOR ', ') AS IdPas,  GROUP_CONCAT(P.TelefonoPasajero SEPARATOR ', ') AS TelefonoPasajero, GROUP_CONCAT(P.PrecioTour SEPARATOR ', ') AS PrecioTour FROM Reservas AS R INNER JOIN Pasajeros AS P ON R.Id_Reserva = P.Id_Reserva INNER JOIN Tours AS T ON R.TourReserva = T.Id_Tour`
    var Union = '';
    var Union1 = '';

    var Tour = '';
    if (selectionTour != '') {
        Tour = 'TourReserva ="' + selectionTour + '"';
    }

    var FechaReserva = '';
    if (Fecha != '') {
        FechaReserva = 'FechaReserva ="' + Fecha + '"';
    }

    var RutaReserva = '';
    if (Ruta != '') {
        RutaReserva = 'Ruta ="' + Ruta + '"';
    }

    if ((Fecha != '') && (selectionTour != '')) {
        Union = ' AND';
    }
    if ((Fecha != '') && (Ruta != '')) {
        Union = ' AND';
    }
    if ((selectionTour != '') && (Ruta != '')) {
        Union1 = ' AND';
    }
    if ((Fecha != '') && (selectionTour != '') && (Ruta != '')) {
        Union = ' AND';
        Union1 = ' AND';
    }

    Listado += ` WHERE ${FechaReserva} ${Union} ${Tour} ${Union1} ${RutaReserva} GROUP BY P.Id_Reserva;`
    connection.query(Listado, (error, result) => {
        if (error) {
            throw error;
        } else {
            res.json(result);
        }
    })
})

router.get('/Programacion/Tabla', (req, res) => {
    var selectionTour = req.query.Tour;
    var Fecha = req.query.Fecha;
    var Confirmacion = `SELECT * FROM Reservas AS R INNER JOIN Pasajeros AS P ON R.Id_Reserva = P.Id_Reserva`
    var Union = '';
    var Tour = '';
    if (selectionTour != '') {
        var selectionTourCount = selectionTour.length;
        var i = 0;
        var tseleccion = "";
        while (i < selectionTourCount) {
            tseleccion = tseleccion + "'" + selectionTour[i] + "'";
            if (i < selectionTourCount - 1) {
                tseleccion = tseleccion + ", ";
            }
            i++;
        }
        Tour = 'TourReserva in (' + tseleccion + ')';
    }

    var FechaReserva = '';
    if (Fecha != '') {
        FechaReserva = 'FechaReserva ="' + Fecha + '"';
    }

    if ((Fecha != '') && (selectionTour != '')) {
        Union = ' AND';
    }

    Confirmacion += ` WHERE ${FechaReserva} ${Union} ${Tour}`
    connection.query(Confirmacion, (error, result) => {
        if (error) {
            throw error;
        } else {
            res.json(result);
        }
    })
})
//----------------------------------------------------------------------------------------

//-------------------------------------Comisiones json-------------------------------------
router.get('/Comision/Tabla', (req, res) => {
    var selectionTour = req.query.Id_Tour;
    var Fecha = req.query.Fecha;
    var Comision = `SELECT * FROM Reservas AS R INNER JOIN Pasajeros AS P ON R.Id_Reserva = P.Id_Reserva`
    var Union = '';

    var Tour = '';
    if (selectionTour != '') {
        var selectionTourCount = selectionTour.length;
        var i = 0;
        var tseleccion = "";
        while (i < selectionTourCount) {
            tseleccion = tseleccion + "'" + selectionTour[i] + "'";
            if (i < selectionTourCount - 1) {
                tseleccion = tseleccion + ", ";
            }
            i++;
        }
        Tour = 'TourReserva in (' + tseleccion + ')';
    }

    var FechaReserva = '';
    if (Fecha != '') {
        FechaReserva = 'FechaReserva ="' + Fecha + '"';
    }

    if ((Fecha != '') && (selectionTour != '')) {
        Union = ' AND';
    }

    Comision += ` WHERE ${FechaReserva} ${Union} ${Tour} AND Confirmacion = 1`
    connection.query(Comision, (error, result) => {
        if (error) {
            throw error;
        } else {
            res.json(result);
        }
    })
})
//----------------------------------------------------------------------------------------

//-------------------------------------Seguros json-------------------------------------
router.get('/Seguros/Tabla', (req, res) => {
    var selectionTour = req.query.Id_Tour;
    var Fecha = req.query.Fecha;
    var Comision = `SELECT * FROM Reservas AS R INNER JOIN Pasajeros AS P INNER JOIN Tours AS T ON R.Id_Reserva = P.Id_Reserva AND T.Id_Tour = R.TourReserva`
    var Union = '';

    var Tour = '';
    if (selectionTour != '') {
        var selectionTourCount = selectionTour.length;
        var i = 0;
        var tseleccion = "";
        while (i < selectionTourCount) {
            tseleccion = tseleccion + "'" + selectionTour[i] + "'";
            if (i < selectionTourCount - 1) {
                tseleccion = tseleccion + ", ";
            }
            i++;
        }
        Tour = 'TourReserva in (' + tseleccion + ')';
    }

    var FechaReserva = '';
    if (Fecha != '') {
        FechaReserva = 'FechaReserva ="' + Fecha + '"';
    }

    if ((Fecha != '') && (selectionTour != '')) {
        Union = ' AND';
    }

    Comision += ` WHERE ${FechaReserva} ${Union} ${Tour} AND Confirmacion = 1`
    connection.query(Comision, (error, result) => {
        if (error) {
            throw error;
        } else {
            res.json(result);
        }
    })
})
//----------------------------------------------------------------------------------------

//-------------------------------------NewUser json-------------------------------------
router.get('/NewUser/dni', (req, res) => {
    const dni = req.query.dni;
    const user = `SELECT * FROM users WHERE id_user = '${dni}'`
    connection.query(user, (error, result) => {
        if (error) {
            console.log(error);
        } else {
            res.json(result);
        }
    })
})

router.get('/NewUser/username', (req, res) => {
    const username = req.query.username;
    const user = `SELECT username FROM users WHERE username = '${username}'`
    connection.query(user, (error, result) => {
        if (error) {
            console.log(error);
        } else {
            res.json(result);
        }
    })
})

router.get('/NewUser/email', (req, res) => {
    const email = req.query.email;
    const user = `SELECT email FROM users WHERE email = '${email}'`
    connection.query(user, (error, result) => {
        if (error) {
            console.log(error);
        } else {
            res.json(result);
        }
    })
})
//----------------------------------------------------------------------------------------

//-------------------------------------AdminUsers json-------------------------------------
router.get('/Users/DeleteUser', (req, res) => {
    const id = req.query.id;
    var DeleteUser = `DELETE FROM users WHERE id = '${id}'`
    connection.query(DeleteUser, (error, result) => {
        if (error) {
            var err = 'error';
            res.json(err);
        } else {
            res.json(id);
        }
    })
})
//----------------------------------------------------------------------------------------

//-------------------------------------Perfil json-------------------------------------
// router.get('/Perfil/Password', (req, res) => {
//     const Pass = req.query.Pass;
//     const id = req.query.id;
//     const user = `SELECT * FROM users WHERE id = '${id}'`
//     connection.query(user, (error, result) => {
//         if (error) {
//             console.log(error);
//         } else if((bcryptjs.compare(Pass, result[0].password))){
//             res.json(result);
//             console.log(result);
//         }
//     })
// })

router.get('/Perfil/Password', (req, res) => {
    const pass = req.query.Pass;
    const id = req.query.id;
    const user = `SELECT * FROM users WHERE id = '${id}'`;

    connection.query(user, async (error, result) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: 'Error al buscar el usuario' });
        }

        if (!result.length) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        try {
            const contraseñaCoincide = await bcryptjs.compare(pass, result[0].password);

            if (contraseñaCoincide) {
                return res.status(200).json(result);
            } else {
                return res.status(401).json({ message: 'Contraseña incorrecta' });
            }

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Error al comparar contraseñas' });
        }
    });
});


//----------------------------------------------------------------------------------------



router.post('/ActualizarAforo', Controller.ActualizarAforo)
router.post('/ReiniciarAforo', Controller.ReiniciarAforo)
router.post('/NuevaReserva', Controller.saveNuevaReserva)
router.post('/EditReserva', Controller.saveEditReserva)
router.post('/NuevoTransfer', Controller.saveNuevoTransfer)
router.post('/EditarTransfer', Controller.saveEditarTransfer)
router.post('/NuevoTour', Controller.saveNuevoTour)
router.post('/EditarTour', Controller.saveEditarTour)
router.post('/NuevoPunto', Controller.saveNuevoPunto)
router.post('/EditarPunto', Controller.saveEditarPunto)
router.post('/OrdenarPuntos', Controller.saveOrdenarPuntos)
router.post('/saveConfirmacion', Controller.saveConfirmacion)

router.post('/Perfil', Controller.savePerfil)
router.post('/EditarUser', Controller.saveEditarUser)
router.post('/NewUser', Controller.saveNewUser)
router.post('/login', Controller.login)
router.get('/logout', Controller.logout)

module.exports = router;