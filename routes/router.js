const express = require('express');
const router = express.Router();
const connection = require('../database/db');
const Controller = require('../controllers/Controller')

//Login
router.get('/login', (req, res) => {
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

router.get('/register', Controller.isAuthenticated, (req, res) => {
    res.render('register', { user: req.user });
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

router.get('/Transfer/NuevoTransfer', Controller.isAuthenticated, Controller.Tours, Controller.Categoria, (req, res) => {

    res.render('Transfer/NuevoTransfer', { user: req.user, resultsTours: req.resultsTours, resultsCategoria: req.resultsCategoria });

})
router.get('/Transfer/EditarTransfer/:Id_Transfer', Controller.isAuthenticated, Controller.Tours, Controller.Categoria, (req, res) => {

    const Id_Reserva = req.params.Id_Reserva;
    connection.query('SELECT * FROM Transfer WHERE Id_Transfer = ?', [Id_Reserva], (error, result) => {
        if (error) {
            throw error;
        } else {
            res.render('Transfer/EditarTransfer', { user: req.user, resultsTours: req.resultsTours, resultsCategoria: req.resultsCategoria, Reserva: result[0] });
        }
    })
})

router.get('/Transfer/VerTransfer', Controller.isAuthenticated, Controller.VerTransfer, Controller.Tours, Controller.Categoria, (req, res) => {
    res.render('Transfer/VerTransfer', { user: req.user, resultsTransfer: req.resultsTransfer, resultsTours: req.resultsTours, resultsCategoria: req.resultsCategoria });
})

//------------------------------------------------------------------------------------------

//--------------------------------Index json--------------------------------
router.get('/Tours', (request, response, next) => {
    var Tours = 'SELECT * FROM Tours WHERE Id_Tour != 1 AND Id_Tour != 5';
    connection.query(Tours, (error, data) => {
        response.json(data);
    });
})

router.get('/ToursRH', (request, response, next) => {
    var Tours = 'SELECT * FROM Tours WHERE Id_Tour = 5';
    connection.query(Tours, (error, data) => {
        response.json(data);
    });
})

router.get('/CuposIndex', (request, response, next) => {
    var Id_Tour = request.query.Id_Tour;
    var Fecha = request.query.Fecha;
    var Cupos = `SELECT SUM(NumeroPasajeros) as Total FROM Reservas WHERE TourReserva = '${Id_Tour}' AND FechaReserva = '${Fecha}'`;
    connection.query(Cupos, (error, data) => {
        response.json(data);
    })
})

router.get('/CuposRHIndex', (request, response, next) => {
    var Fecha = request.query.Fecha;
    var CuposRH = `SELECT SUM(NumeroPasajeros) as Total FROM Reservas WHERE TourReserva IN (1,5) AND FechaReserva = '${Fecha}'`;
    connection.query(CuposRH, (error, data) => {
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

router.get('/IdPas', (req, res, next) => {

    var Id = req.query.idPas;
    var data = `SELECT IdPas FROM Pasajeros `

    var IdPas = '';

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
    var TotalPasajeros = `SELECT SUM(NumeroPasajeros) as Total FROM Reservas WHERE TourReserva = '${Id_Tour}' AND FechaReserva = '${Fecha}'`;
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

router.get('/FiltroVerReservas', (request, response, next) => {

    var FechaRes = request.query.FechaReserva;
    var FechaReg = request.query.FechaRegistro;
    var selectionTour = request.query.selectionTour;
    var Categoria = request.query.CategoriaReserva;
    var Id_Res = request.query.Id_Reserva;
    var DNI = request.query.IdPas;
    var Empty = request.query.Empty;

    var Reservas = `SELECT * FROM Reservas as R inner join Pasajeros as P on R.Id_Reserva = P.Id_Reserva`;
    var Union = '';
    var Union1 = '';
    var Union2 = '';
    var Union3 = '';
    var Union4 = '';
    var Union5 = '';

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


    if ((selectionTour != '') && (FechaRes != '') && (FechaReg != '') && (Categoria != '') && (IdPas != '') && (Id_Res != '')) {
        Union = ' AND';
        Union1 = ' AND';
        Union2 = ' AND';
        Union3 = ' AND';
        Union4 = ' AND';
        Union5 = ' AND';
    }




    Reservas += ` WHERE ${FechaReserva} ${Union} ${FechaRegistro} ${Union1} ${Id_Tour} ${Union2} ${CategoriaReserva} ${Union3} ${Id_Reserva} ${Union4} ${IdPas} ${Union5} ${NombrePasajero}`;
    connection.query(Reservas, (error, data) => {
        if (error) {
            throw error;
        } else {
            response.json(data);
        }
    });

});

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

router.post('/NuevaReserva', Controller.saveNuevaReserva)
router.post('/EditReserva', Controller.saveEditReserva)
router.post('/NuevoTransfer', Controller.saveNuevoTransfer)

router.post('/register', Controller.register)
router.post('/login', Controller.login)
router.get('/logout', Controller.logout)

module.exports = router;