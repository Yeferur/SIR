const express = require("express");
const router = express.Router();
const connection = require("../database/db");
const Controller = require("../controllers/Controller");
const { compareSync } = require("bcryptjs");
const bcryptjs = require("bcryptjs");
const excel = require('exceljs');
const moment = require('moment');

//Login
router.get("/login", Controller.ensureNotAuthenticated, (req, res) => {
  res.render("login", { layout: false });
});

//------------------------------------------------------------------------------------------

//--------------------------------Rutas--------------------------------
const updateVersion = '1.6.2.0'; // Define la versión de la actualización

router.get("/", Controller.isAuthenticated, Controller.Cupos, Controller.CuposR, Controller.CuposH, (req, res) => {
  const userId = req.user.id_user; // Asegúrate de que esto es único para cada usuario
  const userUpdateCookie = `updateVersion_${userId}`;

  // Verifica si la cookie 'updateVersion_{userId}' es diferente a la versión actual
  if (req.cookies[userUpdateCookie] !== updateVersion) {
    // Establece la cookie 'updateVersion_{userId}' para que expire en 30 días
    res.cookie(userUpdateCookie, updateVersion, { maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 días
    res.locals.showUpdateMessage = true; // Variable local para mostrar el mensaje
  } else {
    res.locals.showUpdateMessage = false; // No mostrar el mensaje
  }

  // Define el mensaje de actualización basado en el rol
  const { rol } = req.user || {}; // Maneja el caso donde req.user podría ser undefined

  let updateMessage = 'Nuevas funciones y mejoras se han agregado a la aplicación:';
  
  // if (rol === "Administrador") {
  //   updateMessage += '\n- Corrección de error en el historial (Únicamente para las reservas).';
  // }
  
  updateMessage += '\n- Ahora se validarán los DNI/Pasaportes para evitar duplicados en la misma reserva.';
  updateMessage += '\n- Errores corregidos.';

  // Renderiza la vista con el mensaje adecuado
  res.render("index", {
    user: req.user,
    rol,
    resultsCupos: req.resultsCupos,
    resultsCuposR: req.resultsCuposR,
    resultsCuposH: req.resultsCuposH,
    showUpdateMessage: res.locals.showUpdateMessage, // Pasa la variable a la vista
    updateMessage // Pasa el mensaje a la vista
  });
});


router.get("/Aforos", Controller.isAuthenticated, Controller.ToursAforos, (req, res) => {
  res.render("Aforos", {
    user: req.user,
    resultsTours: req.resultsTours,
  });
}
);

router.get("/Informes", Controller.isAuthenticated, (req, res) => {
  if (rol == "Asesor") {
    return res.redirect("/");
  } else if (rol == "Administrador") {
    res.render("Informes", { user: req.user });
  }
}
);

router.get("/History", Controller.isAuthenticated, (req, res) => {
  if (rol == "Asesor") {
    return res.redirect("/");
  } else if (rol == "Administrador") {
    res.render("History", { user: req.user });
  }
}
);

router.get("/Reservas/NuevaReserva", Controller.isAuthenticated, Controller.Tours, Controller.Categoria, (req, res) => {
  res.render("Reservas/NuevaReserva", {
    user: req.user,
    resultsTours: req.resultsTours,
    resultsCategoria: req.resultsCategoria,
  });
}
);
router.get("/Reservas/EditarReserva/:Id_Reserva", Controller.isAuthenticated, Controller.Tours, Controller.Categoria, (req, res) => {
  const Id_Reserva = req.params.Id_Reserva;
  connection.query(
    "SELECT * FROM Reservas WHERE Id_Reserva = ?",
    [Id_Reserva],
    (error, result) => {
      if (error) {
        throw error;
      } else {
        res.render("Reservas/EditarReserva", {
          user: req.user,
          resultsTours: req.resultsTours,
          resultsCategoria: req.resultsCategoria,
          Reserva: result[0],
        });
      }
    }
  );
}
);

router.get("/Reservas/ReservaDuplicada/:Id_Reserva", Controller.isAuthenticated, Controller.Tours, Controller.Categoria, (req, res) => {
  const Id_Reserva = req.params.Id_Reserva;
  connection.query(
    "SELECT * FROM Reservas WHERE Id_Reserva = ?",
    [Id_Reserva],
    (error, result) => {
      if (error) {
        throw error;
      } else {
        res.render("Reservas/ReservaDuplicada", {
          user: req.user,
          resultsTours: req.resultsTours,
          resultsCategoria: req.resultsCategoria,
          Reserva: result[0],
        });
      }
    }
  );
}
);

router.get("/Reservas/VerReservas", Controller.isAuthenticated, Controller.VerReservas, Controller.Tours, Controller.Categoria, (req, res) => {
  res.render("Reservas/VerReservas", {
    user: req.user,
    resultsReservas: req.resultsReservas,
    resultsTours: req.resultsTours,
    resultsCategoria: req.resultsCategoria,
  });
}
);

router.get("/Transfer/NuevoTransfer", Controller.isAuthenticated, Controller.ServicioTransfer, (req, res) => {
  res.render("Transfer/NuevoTransfer", {
    user: req.user,
    resultsServicio: req.resultsServicio,
  });
}
);
router.get("/Transfer/EditarTransfer/:Id_Transfer", Controller.isAuthenticated, Controller.ServicioTransfer, (req, res) => {
  const Id_Transfer = req.params.Id_Transfer;
  connection.query(
    "SELECT * FROM Transfer WHERE Id_Transfer = ?",
    [Id_Transfer],
    (error, result) => {
      if (error) {
        throw error;
      } else {
        res.render("Transfer/EditarTransfer", {
          user: req.user,
          resultsServicio: req.resultsServicio,
          Transfer: result[0],
        });
      }
    }
  );
}
);

router.get("/Transfer/VerTransfer", Controller.isAuthenticated, Controller.VerTransfer, Controller.ServicioTransfer, (req, res) => {
  res.render("Transfer/VerTransfer", {
    user: req.user,
    resultsTransfer: req.resultsTransfer,
    resultsServicio: req.resultsServicio,
  });
}
);

router.get("/Tours/NuevoTour", Controller.isAuthenticated, (req, res) => {
  if (rol == "Asesor") {
    return res.redirect("/");
  } else if (rol == "Administrador") {
    res.render("Tours/NuevoTour", { user: req.user });
  }
});

router.get("/Tours/EditarTour/:Id_Tour", Controller.isAuthenticated, (req, res) => {
  if (rol == "Asesor") {
    return res.redirect("/");
  } else if (rol == "Administrador") {
    const Id_Tour = req.params.Id_Tour;
    connection.query(
      "SELECT * FROM Tours WHERE Id_Tour = ?",
      [Id_Tour],
      (error, result) => {
        if (error) {
          throw error;
        } else {
          res.render("Tours/EditarTour", { user: req.user, Tour: result[0] });
        }
      }
    );
  }
}
);

router.get("/Tours/VerTours", Controller.isAuthenticated, (req, res) => {
  if (rol == "Asesor") {
    connection.query("SELECT * FROM Tours", async (error, result) => {
      if (error) {
        throw error;
      } else {
        res.render("Tours/VerToursAsesor", {
          user: req.user,
          resultsTours: result,
        });
      }
    });
  } else if (rol == "Administrador") {
    connection.query("SELECT * FROM Tours", async (error, result) => {
      if (error) {
        throw error;
      } else {
        res.render("Tours/VerTours", { user: req.user, resultsTours: result });
      }
    });
  }
});

router.get("/Puntos/NuevoPunto", Controller.isAuthenticated, Controller.Tours, (req, res) => {
  res.render("Puntos/NuevoPunto", {
    user: req.user,
    resultsTours: req.resultsTours,
  });
}
);

router.get("/Puntos/VerPuntos", Controller.isAuthenticated, (req, res) => {
  connection.query(
    "SELECT * FROM Puntos AS P LEFT JOIN Horarios AS H ON P.Id_Punto = H.Id_Punto GROUP BY P.Id_Punto;",
    async (error, result) => {
      if (error) {
        throw error;
      } else {
        res.render("Puntos/VerPuntos", {
          user: req.user,
          resultsPuntos: result,
        });
      }
    }
  );
});

router.get("/Puntos/EditarPunto/:Id_Punto", Controller.isAuthenticated, Controller.Tours, (req, res) => {
  const Id_Punto = req.params.Id_Punto;
  connection.query(
    "SELECT * FROM Puntos AS P INNER JOIN Horarios AS H ON P.Id_Punto = H.Id_Punto WHERE P.Id_Punto = ?",
    [Id_Punto],
    (error, result) => {
      if (error) {
        throw error;
      } else {
        res.render("Puntos/EditarPunto", {
          user: req.user,
          Punto: result[0],
          resultsTours: req.resultsTours,
        });
      }
    }
  );
}
);

router.get("/Puntos/OrdenarPuntos", Controller.isAuthenticated, (req, res) => {
  if (rol == "Asesor") {
    return res.redirect("/");
  } else if (rol == "Administrador") {
    connection.query(
      "SELECT DISTINCT H.Ruta FROM Horarios AS H LEFT JOIN Puntos AS P ON H.Id_Punto = P.Id_Punto ORDER BY H.Ruta;",
      async (error, resultRutas) => {
        if (error) {
          throw error;
        } else {
          res.render("Puntos/OrdenarPuntos", {
            user: req.user,
            resultRutas: resultRutas,
          });
        }
      }
    );
  }
});

router.get("/Programacion/CrearListado", Controller.isAuthenticated, Controller.Tours, (req, res) => {
  if (rol == "Asesor") {
    return res.redirect("/");
  } else if (rol == "Administrador") {
    connection.query(
      "SELECT DISTINCT Ruta FROM Horarios",
      async (error, resultRutas) => {
        if (error) {
          throw error;
        } else {
          res.render("Programacion/CrearListado", {
            user: req.user,
            resultsTours: req.resultsTours,
            resultRutas: resultRutas,
          });
        }
      }
    );
  }
}
);

router.get("/Programacion/VerListados", Controller.isAuthenticated, Controller.Tours, (req, res) => {
  if (rol == "Asesor") {
    return res.redirect("/");
  } else if (rol == "Administrador") {
    connection.query(
      "SELECT DISTINCT Ruta FROM Horarios",
      async (error, resultRutas) => {
        if (error) {
          throw error;
        } else {
          res.render("Programacion/VerListados", {
            user: req.user,
            resultsTours: req.resultsTours,
            resultRutas: resultRutas,
          });
        }
      }
    );
  }
}
);

router.get("/Programacion/EditarListado/:placaBus/:fecha/:tour/:idBus", Controller.isAuthenticated, Controller.Tours, (req, res) => {
  const { placaBus, fecha, tour, idBus } = req.params;
  if (rol == "Asesor") {
    return res.redirect("/");
  } else if (rol == "Administrador") {
    connection.query(
      "SELECT DISTINCT Ruta FROM Horarios",
      async (error, resultRutas) => {
        if (error) {
          throw error;
        } else {
          res.render("Programacion/EditarListado", {
            user: req.user,
            resultsTours: req.resultsTours,
            resultRutas: resultRutas,
            placaBus: placaBus,
            fecha: fecha,
            tour: tour,
            idBus: idBus
          });
        }
      }
    );
  }
});


router.get("/Programacion/Confirmacion", Controller.isAuthenticated, Controller.Tours, (req, res) => {
  if (rol == "Asesor") {
    return res.redirect("/");
  } else if (rol == "Administrador") {
    res.render("Programacion/Confirmacion", {
      user: req.user,
      resultsTours: req.resultsTours,
    });
  }
}
);

router.get("/Comisiones/Comisiones", Controller.isAuthenticated, Controller.Tours, (req, res) => {
  if (rol == "Asesor") {
    return res.redirect("/");
  } else if (rol == "Administrador") {
    res.render("Comisiones/Comisiones", {
      user: req.user,
      resultsTours: req.resultsTours,
    });
  }
}
);

router.get("/Seguros/Seguros", Controller.isAuthenticated, Controller.Tours, (req, res) => {
  if (rol == "Asesor") {
    return res.redirect("/");
  } else if (rol == "Administrador") {
    res.render("Seguros/Seguros", {
      user: req.user,
      resultsTours: req.resultsTours,
    });
  }
}
);

router.get("/Settings/NewUser", Controller.isAuthenticated, (req, res) => {
  if (rol == "Asesor") {
    return res.redirect("/");
  } else if (rol == "Administrador") {
    res.render("Settings/NewUser", { user: req.user });
  }
});

router.get("/Settings/AdminUsers", Controller.isAuthenticated, (req, res) => {
  if (rol == "Asesor") {
    return res.redirect("/");
  } else if (rol == "Administrador") {
    connection.query("SELECT * FROM users", async (error, result) => {
      if (error) {
        throw error;
      } else {
        res.render("Settings/AdminUsers", {
          user: req.user,
          resultUsers: result,
        });
      }
    });
  }
});

router.get("/Settings/EditarUser/:id", Controller.isAuthenticated, Controller.Tours, Controller.Categoria, (req, res) => {
  if (rol == "Asesor") {
    return res.redirect("/");
  } else if (rol == "Administrador") {
    const Id = req.params.id;
    connection.query(
      "SELECT * FROM users WHERE id = ?",
      [Id],
      (error, result) => {
        if (error) {
          throw error;
        } else {
          res.render("Settings/EditarUser", {
            user: req.user,
            User: result[0],
          });
        }
      }
    );
  }
}
);

router.get("/Settings/Perfil/:id", Controller.isAuthenticated, Controller.Tours, Controller.Categoria, (req, res) => {
  const Id = req.params.id;
  connection.query(
    "SELECT * FROM users WHERE id = ?",
    [Id],
    (error, result) => {
      if (error) {
        throw error;
      } else {
        res.render("Settings/Perfil", { user: req.user, User: result[0] });
      }
    }
  );
}
);
//--------------------------------------------------------------------------

//--------------------------------Index json--------------------------------
router.get("/Index/Tours", (request, response, next) => {
  var Tours = "SELECT * FROM Tours WHERE Id_Tour != 1 AND Id_Tour != 5";
  connection.query(Tours, (error, data) => {
    response.json(data);
  });
});

router.get("/Index/ToursRH", (request, response, next) => {
  var Tours = "SELECT * FROM Tours WHERE Id_Tour = 5";
  connection.query(Tours, (error, data) => {
    response.json(data);
  });
});

router.get("/Index/Cupos", (request, response, next) => {
  var Id_Tour = request.query.Id_Tour;
  var Fecha = request.query.Fecha;
  var Cupos = "SELECT SUM(NumeroPasajeros) as Total FROM Reservas WHERE TourReserva = ? AND TipoReserva = 'Grupal' AND FechaReserva = ?";
  connection.query(Cupos, [Id_Tour, Fecha], (error, data) => {
    response.json(data);
  });
});


router.get("/Index/CuposRH", (request, response, next) => {
  var Fecha = request.query.Fecha;
  var CuposRH = `SELECT SUM(NumeroPasajeros) as Total FROM Reservas WHERE TourReserva IN (1,5) AND TipoReserva = 'Grupal' AND FechaReserva = '${Fecha}'`;
  connection.query(CuposRH, (error, data) => {
    response.json(data);
  });
});

router.get("/Index/PasajerosRio", (request, response, next) => {
  var Fecha = request.query.Fecha;
  var PasajerosRio = `SELECT SUM(NumeroPasajeros) as Pasajeros FROM Reservas WHERE TourReserva = 1 AND FechaReserva = '${Fecha}'`;
  connection.query(PasajerosRio, (error, data) => {
    response.json(data);
  });
});

router.get("/Index/PasajerosHacienda", (request, response, next) => {
  var Fecha = request.query.Fecha;
  var PasajerosHacienda = `SELECT SUM(NumeroPasajeros) as Pasajeros FROM Reservas WHERE TourReserva = 5 AND FechaReserva = '${Fecha}'`;
  connection.query(PasajerosHacienda, (error, data) => {
    response.json(data);
  });
});

router.get("/Index/Privados", (request, response, next) => {
  var Fecha = request.query.Fecha;
  var Transfer = `SELECT COUNT(Id_Reserva) as Privados FROM Reservas WHERE TipoReserva = 'Privada' AND FechaReserva = '${Fecha}'`;
  connection.query(Transfer, (error, data) => {
    response.json(data);
  });
});

router.get("/Index/Transfer", (request, response, next) => {
  var Fecha = request.query.Fecha;
  var Transfer = `SELECT COUNT(Id_Transfer) as Transfer FROM Transfer WHERE FechaTransfer = '${Fecha}'`;
  connection.query(Transfer, (error, data) => {
    response.json(data);
  });
});

router.get("/Index/TransferAeropuerto", (request, response, next) => {
  var Fecha = request.query.Fecha;
  var PasajerosAeropuerto = `SELECT COUNT(Id_Transfer) as Transfer FROM Transfer WHERE Servicio = 2 AND FechaTransfer = '${Fecha}'`;
  connection.query(PasajerosAeropuerto, (error, data) => {
    response.json(data);
  });
});

router.get("/Index/TransferHotel", (request, response, next) => {
  var Fecha = request.query.Fecha;
  var PasajerosHotel = `SELECT COUNT(Id_Transfer) as Transfer FROM Transfer WHERE Servicio = 1 AND FechaTransfer = '${Fecha}'`;
  connection.query(PasajerosHotel, (error, data) => {
    response.json(data);
  });
});

router.get("/Index/TransferOtro", (request, response, next) => {
  var Fecha = request.query.Fecha;
  var PasajerosOtro = `SELECT COUNT(Id_Transfer) as Transfer FROM Transfer WHERE Servicio = 5 AND FechaTransfer = '${Fecha}'`;
  connection.query(PasajerosOtro, (error, data) => {
    response.json(data);
  });
});
//----------------------------------------------------------------


//----------------------------------Informes json------------------------------

// Route to get the data
router.get('/informes/datos', (req, res) => {
  let filtro = req.query.filtro || 'dia'; // Obtener el tipo de filtro de la consulta
  let groupByClause = '';
  let Where = '';
  let query = '';
  // Agregar la lógica de filtrado según el tipo de filtro
  switch (filtro) {
    case 'dia':
      groupByClause = 'DATE_FORMAT(r.FechaReserva, "%d-%m-%Y")';
      break;
    case 'semana':
      groupByClause = 'YEARWEEK(r.FechaReserva)';
      break;
    case 'mes':
      groupByClause = 'DATE_FORMAT(r.FechaReserva, "%m-%Y")';
      break;
    case 'ano':
      groupByClause = 'YEAR(r.FechaReserva)';
      break;
    case 'rango':
      const fechaInicio = req.query.fechaInicio;
      const fechaFin = req.query.fechaFin;
      groupByClause = 'DATE_FORMAT(r.FechaReserva, "%Y-%m-%d")';
      Where = `AND r.FechaReserva BETWEEN '${fechaInicio}' AND '${fechaFin}'`;
      break;
    case 'fecha-especifica':
      const fechaEspecifica = req.query.fechaEspecifica;
      groupByClause = 'DATE_FORMAT(r.FechaReserva, "%Y-%m-%d")';
      Where = `AND r.FechaReserva = '${fechaEspecifica}'`;
      break;
    default:
      break;
  }

  query = `
  SELECT
  ${groupByClause} AS Fecha,
    COUNT(DISTINCT id) AS total_pasajeros,
    SUM(CASE WHEN p.confirmacion = 1 THEN 1 ELSE 0 END) AS pasajeros_viajaron
  FROM 
  Pasajeros p
  INNER JOIN Reservas r ON p.Id_Reserva = r.Id_Reserva
  WHERE p.TipoPasajero != 'Infante' ${Where} GROUP BY ${groupByClause} ORDER BY Fecha ASC;`;

  connection.query(query, (error, resultados) => {
    if (error) {
      console.error('Error al realizar la consulta de pasajeros: ' + error.message);
      return res.status(500).json({ error: 'Error al obtener los datos de pasajeros.' });
    }

    const data = resultados.map(row => ({
      Fecha: row.Fecha,
      total_pasajeros: row.total_pasajeros,
      pasajeros_viajaron: row.pasajeros_viajaron,
      porcentaje_negativo: ((row.total_pasajeros - row.pasajeros_viajaron) / row.total_pasajeros * 100).toFixed(2)
    }));

    res.json(data);
  });
});


router.get('/informes/exportarDatos', (req, res) => {
  let filtro = req.query.filtro || 'dia';
  let groupByClause = '';
  let Where = '';
  let fechaInicio = '';
  let fechaFin = '';

  switch (filtro) {
    case 'dia':
      groupByClause = 'DATE_FORMAT(r.FechaReserva, "%d-%m-%Y")';
      break;
    case 'semana':
      groupByClause = 'YEARWEEK(r.FechaReserva)';
      break;
    case 'mes':
      groupByClause = 'DATE_FORMAT(r.FechaReserva, "%m-%Y")';
      break;
    case 'ano':
      groupByClause = 'YEAR(r.FechaReserva)';
      break;
    case 'rango':
      fechaInicio = req.query.fechaInicio || moment().subtract(7, 'days').format('YYYY-MM-DD');
      fechaFin = req.query.fechaFin || moment().format('YYYY-MM-DD');
      groupByClause = 'DATE_FORMAT(r.FechaReserva, "%Y-%m-%d")';
      Where = `AND r.FechaReserva BETWEEN '${fechaInicio}' AND '${fechaFin}'`;
      break;
    case 'fecha-especifica':
      const fechaEspecifica = req.query.fechaEspecifica;
      groupByClause = 'DATE_FORMAT(r.FechaReserva, "%Y-%m-%d")';
      Where = `AND r.FechaReserva = '${fechaEspecifica}'`;
      break;
    default:
      break;
  }

  const query = `
    SELECT
      ${groupByClause} AS Fecha,
      COUNT(DISTINCT p.id) AS total_pasajeros,
      SUM(CASE WHEN p.confirmacion = 1 THEN 1 ELSE 0 END) AS pasajeros_viajaron
    FROM 
      Pasajeros p
      INNER JOIN Reservas r ON p.Id_Reserva = r.Id_Reserva
    WHERE 
      p.TipoPasajero != 'Infante' ${Where} 
    GROUP BY 
      ${groupByClause} 
    ORDER BY 
      Fecha ASC;
  `;

  connection.query(query, (error, resultados) => {
    if (error) {
      console.error('Error al realizar la consulta de pasajeros: ' + error.message);
      return res.status(500).json({ error: 'Error al obtener los datos de pasajeros.' });
    }

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Datos');

    worksheet.columns = [
      { header: 'Fecha', key: 'Fecha', width: 20 },
      { header: 'Total Pasajeros', key: 'total_pasajeros', width: 20 },
      { header: 'Pasajeros Viajaron', key: 'pasajeros_viajaron', width: 20 },
      { header: '% Negativo', key: 'porcentaje_negativo', width: 20 },
    ];

    resultados.forEach((row) => {
      const porcentajeNegativo = ((row.total_pasajeros - row.pasajeros_viajaron) / row.total_pasajeros * 100).toFixed(2);
      worksheet.addRow({
        Fecha: row.Fecha,
        total_pasajeros: row.total_pasajeros,
        pasajeros_viajaron: row.pasajeros_viajaron,
        porcentaje_negativo: porcentajeNegativo,
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Informe-Pasajeros_${filtro}_${fechaInicio}_${fechaFin}.xlsx`);

    workbook.xlsx.write(res).then(() => res.end());
  });
});

router.get('/informes/ingresos', (req, res) => {
  let filtro = req.query.filtro || 'dia'; // Obtener el tipo de filtro de la consulta
  let groupByClause = '';
  let Where = '';
  let query = '';
  switch (filtro) {
    case 'dia':
      groupByClause = 'DATE_FORMAT(r.FechaReserva, "%d-%m-%Y")';
      break;
    case 'semana':
      groupByClause = 'YEARWEEK(r.FechaReserva)';
      break;
    case 'mes':
      groupByClause = 'DATE_FORMAT(r.FechaReserva, "%m-%Y")';
      break;
    case 'ano':
      groupByClause = 'YEAR(r.FechaReserva)';
      break;
    case 'rango':
      const fechaInicio = req.query.fechaInicio;
      const fechaFin = req.query.fechaFin;
      groupByClause = 'DATE_FORMAT(r.FechaReserva, "%Y-%m-%d")';
      Where = `WHERE r.FechaReserva BETWEEN '${fechaInicio}' AND '${fechaFin}'`;
      break;
    case 'fecha-especifica':
      const fechaEspecifica = req.query.fechaEspecifica;
      groupByClause = 'DATE_FORMAT(r.FechaReserva, "%Y-%m-%d")';
      Where = `WHERE r.FechaReserva = '${fechaEspecifica}'`;
      break;
    default:
      break;
  }

  query = `
    SELECT
        ${groupByClause} AS FechaReserva,
        SUM(p.Precio - p.Comision) AS TotalIngresos
    FROM
        Pasajeros p
        INNER JOIN Reservas r ON p.Id_Reserva = r.Id_Reserva
        ${Where}
    GROUP BY
        ${groupByClause}
    ORDER BY
        FechaReserva ASC;
  `;


  console.log(query);
  connection.query(query, (error, resultados) => {
    if (error) {
      console.error('Error al realizar la consulta de ingresos por reserva: ' + error.message);
      return res.status(500).json({ error: 'Error al obtener los datos de ingresos por reserva.' });
    }

    const data = resultados.map(row => ({
      FechaReserva: row.FechaReserva,
      TotalIngresos: row.TotalIngresos
    }));

    res.json(data);
    console.log(data);
  });
});


router.get('/informes/exportarIngresos', (req, res) => {
  let filtro = req.query.filtro || 'dia';
  let groupByClause = '';
  let Where = '';
  let fechaInicio = '';
  let fechaFin = '';

  switch (filtro) {
    case 'dia':
      groupByClause = 'DATE_FORMAT(r.FechaReserva, "%d-%m-%Y")';
      break;
    case 'semana':
      groupByClause = 'YEARWEEK(r.FechaReserva)';
      break;
    case 'mes':
      groupByClause = 'DATE_FORMAT(r.FechaReserva, "%m-%Y")';
      break;
    case 'ano':
      groupByClause = 'YEAR(r.FechaReserva)';
      break;
    case 'rango':
      fechaInicio = req.query.fechaInicio || moment().subtract(7, 'days').format('YYYY-MM-DD');
      fechaFin = req.query.fechaFin || moment().format('YYYY-MM-DD');
      groupByClause = 'DATE_FORMAT(r.FechaReserva, "%Y-%m-%d")';
      Where = `WHERE r.FechaReserva BETWEEN '${fechaInicio}' AND '${fechaFin}'`;
      break;
    case 'fecha-especifica':
      const fechaEspecifica = req.query.fechaEspecifica;
      groupByClause = 'DATE_FORMAT(r.FechaReserva, "%Y-%m-%d")';
      Where = `WHERE r.FechaReserva = '${fechaEspecifica}'`;
      break;
    default:
      break;
  }

  const query = `
    SELECT
        ${groupByClause} AS FechaReserva,
        SUM(p.Precio - p.Comision) AS TotalIngresos
    FROM
        Pasajeros p
        INNER JOIN Reservas r ON p.Id_Reserva = r.Id_Reserva
        ${Where}
    GROUP BY
        ${groupByClause}
    ORDER BY
        FechaReserva ASC;
  `;

  connection.query(query, (error, resultados) => {
    if (error) {
      console.error('Error al realizar la consulta de ingresos por reserva: ' + error.message);
      return res.status(500).json({ error: 'Error al obtener los datos de ingresos por reserva.' });
    }

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Ingresos');

    worksheet.columns = [
      { header: 'Fecha de Reserva', key: 'FechaReserva', width: 20 },
      { header: 'Total Ingresos', key: 'TotalIngresos', width: 20 },
    ];

    resultados.forEach((row) => {
      worksheet.addRow({
        FechaReserva: row.FechaReserva,
        TotalIngresos: row.TotalIngresos,
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Informe-Ingresos_${filtro}_${fechaInicio}_${fechaFin}.xlsx`);

    workbook.xlsx.write(res).then(() => res.end());
  });
});



//--------------------------------------------------------------------------------

//----------------------------History json--------------------------------
router.get("/History/Filtro", (request, response, next) => {
  const {
    FechaReserva,
    FechaRegistro,
    Accion,
    Id_Reserva,
    HoraRegistro // Agregar el parámetro de hora
  } = request.query;

  // Check if Accion is defined and is an array
  const AccionArray = Array.isArray(Accion) ? Accion : [Accion];

  // Prepare the filters
  const filters = [
    FechaReserva && `FechaReserva = "${FechaReserva}"`,
    FechaRegistro && `H.FechaRegistro = "${FechaRegistro}"`,
    Accion && `Accion Like "%${Accion}%"`,
    Id_Reserva && `R.Id_Reserva = "${Id_Reserva}"`,
    HoraRegistro && `STR_TO_DATE(H.HoraRegistro, '%r') >= STR_TO_DATE("${HoraRegistro}", '%H:%i:%s')` // Filtro por hora
  ].filter(Boolean);

  // Build the WHERE clause
  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  // Define the SQL query
  const query = `
    SELECT R.*, H.*
    FROM Reservas AS R
    LEFT JOIN Pasajeros AS P ON R.Id_Reserva = P.Id_Reserva
    LEFT JOIN History AS H ON R.Id_Reserva = H.Id_Reserva
    ${whereClause}
    GROUP BY R.Id_Reserva;
  `;

  console.log(query);

  // Execute the query
  connection.query(query, (error, data) => {
    if (error) {
      response.status(500).json({ error: "Error interno del servidor" });
    } else {
      response.json(data);
    }
    console.log(data);
  });
});


//------------------------------------------------------------------------------------------------
//--------------------------------Nueva Reserva json--------------------------------
router.get("/autocompletar", (request, response, next) => {
  var search_query = request.query.search_query;

  var query = `SELECT * FROM Puntos WHERE NombrePunto LIKE ? LIMIT 10`;
  connection.query(query, [`%${search_query}%`], (error, data) => {
    if (error) {
      return response.status(500).send('Error en la consulta de autocompletar');
    }
    response.json(data);
  });
});

router.get("/HoraRuta", (request, response, next) => {
  const { Id_Tour, Punto } = request.query;

  var HoraRuta = `SELECT h.HoraSalida, h.Ruta, p.Id_Punto 
                  FROM Horarios as h 
                  LEFT JOIN Puntos as p ON h.Id_Punto = p.Id_Punto 
                  LEFT JOIN Tours as t ON h.Id_Tour = t.Id_Tour 
                  WHERE t.Id_Tour = ? AND p.NombrePunto = ?`;
  connection.query(HoraRuta, [Id_Tour, Punto], (error, data) => {
    if (error) {
      return response.status(500).send('Error en la consulta de HoraRuta');
    }
    response.json(data);
  });
});

router.get("/Precios", (request, response, next) => {
  var Id_Tour = request.query.Id_Tour;

  var Punto = `SELECT * FROM Tours WHERE Id_Tour = ?`;
  connection.query(Punto, [Id_Tour], (error, data) => {
    if (error) {
      return response.status(500).send('Error en la consulta de Precios');
    }
    response.json(data);
  });
});

router.get("/Comision", (request, response, next) => {
  var Id_Tour = request.query.Id_Tour;
  var Categoria = request.query.Categoria;
  var Comision = `SELECT Comision${Categoria} AS Comision FROM Tours WHERE Id_Tour = ?`;

  connection.query(Comision, [Id_Tour], (error, data) => {
    if (error) {
      return response.status(500).send('Error en la consulta de Comision');
    }
    response.json(data);
  });
});

router.get("/Id_Reserva", (request, response) => {
  const Id_Tour = request.query.Id_Tour;

  getAbreviacion(Id_Tour, (abreviacion) => {
    generateUniqueReservationId(abreviacion, (Id_Reserva) => {
      response.json(Id_Reserva);
    });
  });
});

function getAbreviacion(Id_Tour, callback) {
  const tourAbreviadoQuery = `SELECT Abreviacion FROM Tours WHERE Id_Tour = ?`;

  connection.query(tourAbreviadoQuery, [Id_Tour], (error, data) => {
    if (error) {
      return callback({ error: "Error interno del servidor" }); // Pass error to callback
    } 
    const abreviacion = data[0].Abreviacion;
    callback(abreviacion);
  });
}

function generateUniqueReservationId(abreviacion, callback) {
  const Id_Reserva = `${abreviacion}${Math.floor(Math.random() * (100000 - 9999) + 9999)}`;

  const idQuery = `SELECT Id_Reserva FROM Reservas WHERE Id_Reserva = ?`;

  checkReservationId(idQuery, Id_Reserva, (dataId) => {
    if (dataId.length > 0) {
      generateUniqueReservationId(abreviacion, callback); // Retry if Id_Reserva already exists
    } else {
      callback(Id_Reserva);
    }
  });
}

function checkReservationId(idQuery, Id_Reserva, callback) {
  connection.query(idQuery, [Id_Reserva], (error, dataId) => {
    if (error) {
      return callback({ error: "Error interno del servidor" }); // Pass error to callback
    }
    callback(dataId);
  });
}



router.get("/Cupos", (request, response, next) => {
  var Id_Tour = request.query.Id_Tour;
  var TotalCupos =
    `SELECT CupoBase as Cupos FROM Tours WHERE Id_Tour = '${Id_Tour}'`;
  connection.query(TotalCupos, (error, data) => {
    response.json(data);
  });
});

router.get("/Reservas/Aforos", (request, response, next) => {
  var Id_Tour = request.query.Id_Tour;
  var FechaReserva = request.query.FechaReserva;
  var Cupos = `SELECT NuevoCupo as Cupos FROM aforos WHERE Id_Tour = '${Id_Tour}' AND Fecha = '${FechaReserva}' ORDER BY id DESC LIMIT 1`;
  connection.query(Cupos, (error, data) => {
    if (error) {
      console.error('Error en la consulta SQL:', error);
      response.status(500).json({ error: 'Error en la consulta SQL' });
    } else {
      response.json(data);
    }
  });
});


router.get("/TotalPasajeros", (request, response, next) => {
  var Fecha = request.query.FechaReserva;
  var Id_Tour = request.query.Id_Tour;
  var TotalPasajeros = `SELECT SUM(NumeroPasajeros) as Total FROM Reservas WHERE TourReserva = '${Id_Tour}' AND FechaReserva = '${Fecha}' AND TipoReserva = 'Grupal'`;
  connection.query(TotalPasajeros, (error, data) => {
    response.json(data);
  });
});

router.get("/NuevaReserva/NuevoPunto", async (request, response, next) => {
  try {
    var data = `SELECT MAX(Id_Punto) AS Id_Punto FROM Puntos `;
    var Tours = `SELECT Id_Tour, (SELECT MAX(Id_Tour) FROM Tours) AS M_Id_Tour FROM Tours `;

    connection.query(data, (error, results) => {
      if (error) {
        console.log(error);
      } else {
        var Id_Punto = results[0].Id_Punto + 1;
        var NombrePunto = request.query.NombrePuntoNP;
        var Sector = "Pendiente";
        var Latitud = 0;
        var Longitud = 0;
        var HoraSalida = "Pendiente";
        var HoraLlegada = "Pendiente";
        var Nuevo = 1;

        connection.query('INSERT INTO Puntos SET ?', { Id_Punto: Id_Punto, NombrePunto: NombrePunto, Sector: Sector, Latitud: Latitud, Longitud: Longitud, Posicion: Id_Punto, Nuevo: Nuevo }, async (error, result) => {
          if (error) {
            console.log(error);
            response.json("error");
          } else {
            connection.query(Tours, async (error, results) => {
              if (error) {
                console.log(error);
                response.json("error");
              } else {
                const M_Id_Tour = results[0].M_Id_Tour;

                var insertedCount = 0; // Contador para realizar un seguimiento de las inserciones exitosas de pasajeros.
                for (var i = 1; i <= M_Id_Tour; i++) {
                  connection.query('INSERT INTO Horarios SET ?', { Id_Punto: Id_Punto, Id_Tour: i, HoraSalida: HoraSalida, HoraLlegada: HoraLlegada }, async (error, result) => {
                    if (error) {
                      console.log(error);
                    } else {
                      insertedCount++;
                    }
                    if (insertedCount == M_Id_Tour) {
                      response.json(null); // Enviar respuesta JSON una vez que todas las inserciones se hayan completado con éxito.
                    }
                  })
                }
              }
            });
          }
        })
      }
    })
  } catch (error) {
    console.log(error);
    response.status(500).json(error);
  }
});

router.get('/Reservas/CheckPasajeros', (req, res) => {
  const { idpas, FechaReserva, Id_Reserva } = req.query;
  const query = `SELECT * FROM Pasajeros AS P INNER JOIN Reservas AS R ON P.Id_Reserva = R.Id_Reserva WHERE IdPas = '${idpas}' AND IdPas != '' AND FechaReserva = '${FechaReserva}' AND P.Id_Reserva != '${Id_Reserva}'`;
  connection.query(query, (error, data) => {
    if (error) {
      throw error;
    } else {
      res.json(data);
    }
  });
})
//------------------------------------------------------------------------------------------

//--------------------------------Ver Reservas json--------------------------------
router.get("/VerRervas/Pasajeros", (request, response, next) => {
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

router.get("/VerReservas/FiltroVerReservas", (request, response, next) => {
  const {
    FechaReserva,
    FechaRegistro,
    selectionTour,
    CategoriaReserva,
    Id_Reserva,
    IdPas,
    Empty,
    NombreApellido,
    Punto,
    Estado
  } = request.query;

  // Check if selectionTour is defined and is an array
  const selectionTourArray = Array.isArray(selectionTour) ? selectionTour : [selectionTour];
  const selectionCategoriaArray = Array.isArray(CategoriaReserva) ? CategoriaReserva : [CategoriaReserva];
  const selectionEstadoArray = Array.isArray(Estado) ? Estado : [Estado];

  const filters = [
    FechaReserva && `FechaReserva = "${FechaReserva}"`,
    FechaRegistro && `FechaRegistro = "${FechaRegistro}"`,
    selectionTour && `TourReserva IN (${selectionTourArray.join("','")})`,
    CategoriaReserva && `CategoriaReserva IN (${selectionCategoriaArray.join("','")})`,
    Estado && `Estado IN ("${selectionEstadoArray.join("','")}")`,
    Id_Reserva && `R.Id_Reserva = "${Id_Reserva}"`,
    IdPas && `IdPas LIKE "%${IdPas}%"`,
    Empty === "Check" && `(NombrePasajero = "" OR P.NombrePasajero IS NULL OR P.IdPas = "" OR P.IdPas IS NULL OR P.PrecioTour IS NULL OR P.Comision IS NULL OR R.Ruta = "" OR R.Ruta IS NULL OR R.HoraSalida = "" OR R.HoraSalida IS NULL)`,
    NombreApellido && `NombrePasajero LIKE "%${NombreApellido}%"`,
    Punto && `PuntoEncuentro LIKE "%${Punto}%"`
  ].filter(Boolean);

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const query = `
  SELECT R.*, P.*, T.NombreTour AS NombreTour
  FROM Reservas AS R
  INNER JOIN Pasajeros AS P ON R.Id_Reserva = P.Id_Reserva
  INNER JOIN Tours AS T ON R.TourReserva = T.Id_Tour
  ${whereClause}
  GROUP BY R.Id_Reserva;  
  `;

  console.log(query)

  connection.query(query, (error, data) => {
    if (error) {
      response.status(500).json({ error: "Error interno del servidor" });
    } else {
      response.json(data);

    }
  });

});

// router.get("/Reservas/DeleteReserva", (req, res) => {
//   const { Id_Reserva, id_user } = req.query;
//   var DeleteReserva = `DELETE FROM Reservas WHERE Id_Reserva = '${Id_Reserva}'`;
//   var DeletePasajeros = `DELETE FROM Pasajeros WHERE Id_Reserva = '${Id_Reserva}'`;
//   var TipoHistory = 'Reserva';
//   var AccionHistory = 'Eliminar';
//   var Fecha = new Date();
//   var dia = String(Fecha.getDate()).padStart(2, '0');
//   var mes = String(Fecha.getMonth() + 1).padStart(2, '0');
//   var año = Fecha.getFullYear();
//   var horas24 = Fecha.getHours();
//   var horas = horas24 % 12 || 12; // Convierte la hora de 24 a 12 horas
//   var minutos = String(Fecha.getMinutes()).padStart(2, '0');
//   var segundos = String(Fecha.getSeconds()).padStart(2, '0');
//   var ampm = horas24 >= 12 ? 'PM' : 'AM';
//   var FechaRegistro = año + '-' + mes + '-' + dia;
//   var HoraRegistro = horas + ':' + minutos + ':' + segundos + ' ' + ampm;
//   connection.query('INSERT INTO History SET ?', {
//     Id_Reserva: Id_Reserva, Tipo: TipoHistory, Accion: AccionHistory, id_user: id_user, FechaRegistro: FechaRegistro, HoraRegistro: HoraRegistro
//   }, async (errorHistory, resultHistory) => {
//     if (errorHistory) {
//       console.log(errorHistory)
//       res.render("Reservas/NuevaReserva", {
//         alert: true,
//         alertTitle: "¡Ocurrió un error!",
//         alertMessage: "No fue posible crear la reserva. Si el error continúa, comuníquese con soporte técnico.",
//         alertIcon: "error",
//         showConfirmButton: false,
//         timer: 3500,
//         ruta: "Reservas/NuevaReserva",
//       });
//     } else {
//       connection.query(DeletePasajeros, (error, result) => {
//         if (error) {
//           var err = "error";
//           res.json(err);
//         } else {
//           connection.query(DeleteReserva, (error, result) => {
//             if (error) {
//               var err = "error";
//               res.json(err);
//             } else {
//               res.json(Id_Reserva);
//             }
//           });
//         }
//       });
//     }
//   });
// });


// Ruta para cancelar una reserva
router.get("/Reservas/CancelarReserva", (req, res) => {
  const { Id_Reserva, id_user } = req.query;

  // Consulta para actualizar el estado de la reserva a 'Cancelado'
  const updateReserva = `
    UPDATE Reservas
    SET Estado = 'Cancelado'
    WHERE Id_Reserva = ?
  `;

  // Datos para el historial
  const tipoHistory = 'Reserva';
  const accionHistory = 'Cancelado';
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

  // Inserta el registro en el historial
  const insertHistory = `
    INSERT INTO History (Id_, Tipo, Accion, id_user, FechaRegistro, HoraRegistro)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  // Inicia la transacción
  connection.beginTransaction((err) => {
    if (err) throw err;

    connection.query(updateReserva, [Id_Reserva], (error) => {
      if (error) {
        return connection.rollback(() => {
          res.status(500).json({ error: 'Error al cancelar la reserva' });
        });
      }

      connection.query(insertHistory, [Id_Reserva, tipoHistory, accionHistory, id_user, FechaRegistro, HoraRegistro], (errorHistory) => {
        if (errorHistory) {
          return connection.rollback(() => {
            res.status(500).json({ error: 'Error al registrar el historial' });
          });
        }

        connection.commit((err) => {
          if (err) {
            return connection.rollback(() => {
              res.status(500).json({ error: 'Error al confirmar la transacción' });
            });
          }
          res.json({ success: true, Id_Reserva });
        });
      });
    });
  });
});


//------------------------------------------------------------------------------------------

//--------------------------------Editar Reserva json--------------------------------
router.get("/Edit/Pasajeros", (request, response, next) => {
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

router.get("/DeletePasajero", (req, res) => {
  const id = req.query.id;
  var DeletePasajero = `DELETE FROM Pasajeros WHERE id = '${id}'`;
  connection.query(DeletePasajero, (error, result) => {
    if (error) {
      var err = "error";
      res.json(err);
    } else {
      res.json(id);
    }
  });
});


router.post("/Edit/DuplucarReserva", (req, res) => {
  try {
    const {
      Id_ReservaDuplicar,
      TipoReserva,
      input_numpas,
      total_pas,
      Id_Tour,
      PuntoEncuentro,
      Id_Punto,
      FechaReserva,
      TelefonoReserva,
      IdiomaReserva,
      Categoria,
      NombreReporta,
      Observaciones,
      Estado,
      NomPas,
      TipoPasajero,
      IdPas,
      Telefono,
      id_user
    } = req.body;


    var NomPasArray = JSON.parse(NomPas);
    var TipoPasajeroArray = JSON.parse(TipoPasajero);
    var IdPasArray = JSON.parse(IdPas);
    var TelefonoArray = JSON.parse(Telefono);

    var Confirmacion = 1;

    var TipoHistory = 'RESERVA';
    var AccionHistory = 'DUPLICAR';

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
      Id_: Id_ReservaDuplicar, Tipo: TipoHistory, Accion: AccionHistory, id_user: id_user, FechaRegistro: FechaRegistro, HoraRegistro: HoraRegistro
    }, async (errorHistory, resultHistory) => {
      if (errorHistory) {
        console.log(errorHistory);
        res.json("error"); // Enviar respuesta JSON en caso de error en la inserción de historial.
      } else {
        connection.query('INSERT INTO Reservas SET ?', { Id_Reserva: Id_ReservaDuplicar, TipoReserva: TipoReserva, NumeroPasajeros: input_numpas, TotalPasajeros: total_pas, TourReserva: Id_Tour, PuntoEncuentro: PuntoEncuentro, Id_Punto: Id_Punto, FechaReserva: FechaReserva, TelefonoReserva: TelefonoReserva, IdiomaReserva: IdiomaReserva, CategoriaReserva: Categoria, NombreReporta: NombreReporta, Observaciones: Observaciones, FechaRegistro: FechaRegistro, HoraRegistro: HoraRegistro, Estado: Estado }, async (errorReserva, resultReserva) => {
          if (errorReserva) {
            console.log(errorReserva);
            res.json("error"); // Enviar respuesta JSON en caso de error en la inserción de reserva.
          } else {
            var insertedCount = 0; // Contador para realizar un seguimiento de las inserciones exitosas de pasajeros.
            for (var i = 0; i < total_pas; i++) {
              connection.query('INSERT INTO Pasajeros SET ?', { Id_Reserva: Id_ReservaDuplicar, NombrePasajero: NomPasArray[i], TipoPasajero: TipoPasajeroArray[i], IdPas: IdPasArray[i], TelefonoPasajero: TelefonoArray[i], Fecha: FechaRegistro, Confirmacion: Confirmacion }, async (errorPasajeros, resultPasajeros) => {
                if (errorPasajeros) {
                  console.log(errorPasajeros);
                } else {
                  insertedCount++; // Incrementar el contador en caso de inserción exitosa.
                }
                // Verificar si todas las inserciones de pasajeros han sido exitosas.
                if (insertedCount == total_pas) {
                  res.json(null); // Enviar respuesta JSON una vez que todas las inserciones se hayan completado con éxito.
                }
              });
            }
          }
        });
      }
    });

    // Resto del código para manejar la reserva
  } catch (error) {
    console.error('Error:', error);
    res.json("error");
  }
});


// router.get("/Edit/DuplucarReserva", (req, res) => {
//   try {
//     var Id_Reserva = req.query.Id_ReservaDuplicar;
//     var TipoReserva = req.query.TipoReserva;
//     var NumeroPasajeros = req.query.input_numpas;
//     var TotalPasajeros = req.query.total_pas;
//     var TourReserva = req.query.Id_Tour;
//     var PuntoEncuentro = req.query.PuntoEncuentro;
//     var Id_Punto = req.query.Id_Punto;
//     var FechaReserva = req.query.FechaReserva;
//     var TelefonoReserva = req.query.TelefonoReserva;
//     var IdiomaReserva = req.query.IdiomaReserva;
//     var CategoriaReserva = req.query.Categoria;
//     var NombreReporta = req.query.NombreReporta;
//     var Observaciones = req.query.Observaciones;
//     var NomPas = JSON.parse(req.query.NomPas);
//     var TipoPasajero = JSON.parse(req.query.TipoPasajero);
//     var IdPas = JSON.parse(req.query.IdPas);
//     var Telefono = JSON.parse(req.query.Telefono);

//     console.log('Id_Reserva:', Id_Reserva);
//     console.log('TipoReserva:', TipoReserva);
//     console.log('NumeroPasajeros:', NumeroPasajeros);
//     console.log('TotalPasajeros:', TotalPasajeros);
//     console.log('TourReserva:', TourReserva);
//     console.log('PuntoEncuentro:', PuntoEncuentro);
//     console.log('Id_Punto:', Id_Punto);
//     console.log('FechaReserva:', FechaReserva);
//     console.log('TelefonoReserva:', TelefonoReserva);
//     console.log('IdiomaReserva:', IdiomaReserva);
//     console.log('Categoria:', Categoria);
//     console.log('NombreReporta:', NombreReporta);
//     console.log('Observaciones:', Observaciones);
//     console.log('NomPasJSON:', NomPasJSON);
//     console.log('TipoPasajeroJSON:', TipoPasajeroJSON);
//     console.log('IdPasJSON:', IdPasJSON);
//     console.log('TelefonoJSON:', TelefonoJSON);
//     console.log('id_user:', id_user);

//     var Culminada = 0;
//     var Confirmacion = 1;

//     var TipoHistory = 'RESERVA';
//     var AccionHistory = 'DUPLICAR';

//     var id_user = req.query.id_user;

//     var Fecha = new Date();
//     var dia = String(Fecha.getDate()).padStart(2, '0');
//     var mes = String(Fecha.getMonth() + 1).padStart(2, '0');
//     var año = Fecha.getFullYear();
//     var horas24 = Fecha.getHours();
//     var horas = horas24 % 12 || 12; // Convierte la hora de 24 a 12 horas
//     var minutos = String(Fecha.getMinutes()).padStart(2, '0');
//     var segundos = String(Fecha.getSeconds()).padStart(2, '0');
//     var ampm = horas24 >= 12 ? 'PM' : 'AM';
//     var FechaRegistro = año + '-' + mes + '-' + dia;
//     var HoraRegistro = horas + ':' + minutos + ':' + segundos + ' ' + ampm;

//     connection.query('INSERT INTO History SET ?', {
//       Id_Reserva: Id_Reserva, Tipo: TipoHistory, Accion: AccionHistory, id_user: id_user, FechaRegistro: FechaRegistro, HoraRegistro: HoraRegistro
//     }, async (errorHistory, resultHistory) => {
//       if (errorHistory) {
//         console.log(errorHistory);
//         res.json("error"); // Enviar respuesta JSON en caso de error en la inserción de historial.
//       } else {
//         connection.query('INSERT INTO Reservas SET ?', { Id_Reserva: Id_Reserva, TipoReserva: TipoReserva, NumeroPasajeros: NumeroPasajeros, TotalPasajeros: TotalPasajeros, TourReserva: TourReserva, PuntoEncuentro: PuntoEncuentro, Id_Punto: Id_Punto, FechaReserva: FechaReserva, TelefonoReserva: TelefonoReserva, IdiomaReserva: IdiomaReserva, CategoriaReserva: CategoriaReserva, NombreReporta: NombreReporta, Observaciones: Observaciones, FechaRegistro: FechaRegistro, HoraRegistro: HoraRegistro, Culminada: Culminada }, async (errorReserva, resultReserva) => {
//           if (errorReserva) {
//             console.log(errorReserva);
//             res.json("error"); // Enviar respuesta JSON en caso de error en la inserción de reserva.
//           } else {
//             var insertedCount = 0; // Contador para realizar un seguimiento de las inserciones exitosas de pasajeros.
//             for (var i = 0; i < TotalPasajeros; i++) {
//               connection.query('INSERT INTO Pasajeros SET ?', { Id_Reserva: Id_Reserva, NombrePasajero: NomPas[i], TipoPasajero: TipoPasajero[i], IdPas: IdPas[i], TelefonoPasajero: Telefono[i], Fecha: FechaRegistro, Confirmacion: Confirmacion }, async (errorPasajeros, resultPasajeros) => {
//                 if (errorPasajeros) {
//                   console.log(errorPasajeros);
//                 } else {
//                   insertedCount++; // Incrementar el contador en caso de inserción exitosa.
//                 }
//                 // Verificar si todas las inserciones de pasajeros han sido exitosas.
//                 if (insertedCount == TotalPasajeros) {
//                   res.json(null); // Enviar respuesta JSON una vez que todas las inserciones se hayan completado con éxito.
//                 }
//               });
//             }
//           }
//         });
//       }
//     });

//   } catch (error) {
//     console.log(error);
//     res.json("error"); // Enviar respuesta JSON en caso de error general.
//   }
// });
//------------------------------------------------------------------------------------------

//----------------------------------------Nuevo Transfer json-------------------------------
router.get("/Id_Transfer", (req, res, next) => {
  call_ID = () => {
    Id();
  };

  Id = () => {
    Id_Transfer = "RT" + Math.floor(Math.random() * (10000 - 999) + 999);

    var Id = `SELECT Id_Transfer FROM Transfer WHERE Id_Transfer = '${Id_Transfer}'`;
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
  };
  Id();
});
//------------------------------------------------------------------------------------------

//----------------------------------------Ver Transfer json---------------------------------
router.get("/VerTransfer/Pasajeros", (request, response, next) => {
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

router.get("/VerTransfer/FiltroVerTransfer", (request, response, next) => {
  const {
    FechaTransfer,
    FechaRegistro,
    Servicio,
    Id_Transfer,
    Empty,
    NombreApellido,
    Estado
  } = request.query;

  const ServicioArray = Array.isArray(Servicio) ? Servicio : [Servicio];
  const selectionEstadoArray = Array.isArray(Estado) ? Estado : [Estado];

  const filters = [
    FechaTransfer && `FechaTransfer = "${FechaTransfer}"`,
    FechaRegistro && `FechaRegistro = "${FechaRegistro}"`,
    Servicio && `T.Servicio IN (${ServicioArray.join("','")})`,
    Id_Transfer && `T.Id_Transfer = "${Id_Transfer}"`,
    Empty === "Check" && `(Titular = "" OR Tel_Contacto = "" OR Salida = "" OR Llegada = "" OR NombreReporta = "" OR HoraRecogida = "" OR Vuelo = "" OR ValorServicio = "")`,
    NombreApellido && `Titular LIKE "%${NombreApellido}%"`,
    Estado && `Estado IN ("${selectionEstadoArray.join("','")}")`,
  ].filter(Boolean);

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const query = `
    SELECT * 
    FROM Transfer AS T
    INNER JOIN ServicioTransfer AS S ON S.id = T.Servicio
    ${whereClause}
    GROUP BY Id_Transfer;
    `;

  connection.query(query, (error, data) => {
    if (error) {
      throw error;
    } else {
      response.json(data);
    }
  });
});

// Ruta para cancelar una reserva
router.get("/Transfer/CancelarTransfer", (req, res) => {
  const { Id_Transfer, id_user } = req.query;

  // Consulta para actualizar el estado del transfer a 'Cancelado'
  const updateTransfer = `
    UPDATE Transfer
    SET Estado = 'Cancelado'
    WHERE Id_Transfer = ?
  `;

  // Datos para el historial
  const tipoHistory = 'Transfer';
  const accionHistory = 'Cancelado';
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

  // Inserta el registro en el historial
  const insertHistory = `
    INSERT INTO History (Id_, Tipo, Accion, id_user, FechaRegistro, HoraRegistro)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  // Inicia la transacción
  connection.beginTransaction((err) => {
    if (err) throw err;

    connection.query(updateTransfer, [Id_Transfer], (error) => {
      if (error) {
        return connection.rollback(() => {
          res.status(500).json({ error: 'Error al cancelar el transfer' });
        });
      }

      connection.query(insertHistory, [Id_Transfer, tipoHistory, accionHistory, id_user, FechaRegistro, HoraRegistro], (errorHistory) => {
        if (errorHistory) {
          return connection.rollback(() => {
            res.status(500).json({ error: 'Error al registrar el historial' });
          });
        }

        connection.commit((err) => {
          if (err) {
            return connection.rollback(() => {
              res.status(500).json({ error: 'Error al confirmar la transacción' });
            });
          }
          res.json({ success: true, Id_Transfer });
        });
      });
    });
  });
});


//------------------------------------------------------------------------------------------

//--------------------------------Editar Transfer json--------------------------------
router.get("/EditarTransfer/Pasajeros", (request, response, next) => {
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

router.get("/EditarTransfer/DeletePasajero", (req, res) => {
  const id = req.query.id;
  var DeletePasajero = `DELETE FROM PasajerosTransfer WHERE id = '${id}'`;
  connection.query(DeletePasajero, (error, result) => {
    if (error) {
      var err = "error";
      res.json(err);
    } else {
      res.json(id);
    }
  });
});

//------------------------------------------------------------------------------------------

//--------------------------------------Nuevo Tour json------------------------------------------
router.get("/Tours/Id_Tour", (req, res, next) => {
  var data = `SELECT MAX(Id_Tour) AS Id_Tour FROM Tours `;
  connection.query(data, (error, results) => {
    if (error) {
      console.log(error);
    } else {
      Id_Tour = results[0].Id_Tour + 1;
      res.json(Id_Tour);
    }
  });
});
//------------------------------------------------------------------------------------------

//-------------------------------------Editar Tour json-------------------------------------
router.get("/Tours/DeleteTour", (req, res) => {
  const Id_Tour = req.query.Id_Tour;
  var DeleteTour = `DELETE FROM Tours WHERE Id_Tour = '${Id_Tour}'`;
  connection.query(DeleteTour, (error, result) => {
    if (error) {
      var err = "error";
      res.json(err);
    } else {
      res.json(Id_Tour);
    }
  });
});
//----------------------------------------------------------------------------------------

//--------------------------------------Nuevo Punto json------------------------------------------
// router.get("/Puntos/Id_Punto", (req, res, next) => {
//   var data = `SELECT MAX(Id_Punto) AS Id_Punto FROM Puntos `;
//   connection.query(data, (error, results) => {
//     if (error) {
//       console.log(error);
//     } else {
//       Id_Punto = results[0].Id_Punto + 1;
//       res.json(Id_Punto);
//     }
//   });
// });
//------------------------------------------------------------------------------------------

//--------------------------------------Ver Puntos json------------------------------------------
router.get("/Puntos/DeletePunto", (req, res) => {
  var Id_Punto = req.query.Id_Punto;
  var DeletePunto = `DELETE FROM Puntos WHERE Id_Punto = '${Id_Punto}'`;
  var DeleteHorarios = `DELETE FROM Horarios WHERE Id_Punto = '${Id_Punto}'`;
  connection.query(DeleteHorarios, (error, result) => {
    if (error) {
      var err = "error";
      res.json(err);
    } else {
      connection.query(DeletePunto, (error, result) => {
        if (error) {
          var err = "error";
          res.json(err);
        } else {
          res.json(Id_Punto);
        }
      });
    }
  });
});
//------------------------------------------------------------------------------------------

//-------------------------------------Editar Punto json-------------------------------------
router.get("/EditarPunto/Horarios", (req, res) => {
  var Id_Tour = req.query.Id_Tour;
  const Id_Punto = req.query.Id_Punto;
  var Horario = `SELECT * FROM Horarios WHERE Id_Punto = '${Id_Punto}' AND Id_Tour = '${Id_Tour}'`;
  connection.query(Horario, (error, result) => {
    if (error) {
      throw error;
    } else {
      res.json(result);
    }
  });
});
//----------------------------------------------------------------------------------------

//-------------------------------------Ordenar Puntos json-------------------------------------
router.get("/Ordenar/Table", (req, res) => {
  var Ruta = req.query.Ruta;
  var Puntos = `SELECT * FROM Puntos AS P LEFT JOIN Horarios AS H ON P.Id_Punto = H.Id_Punto WHERE H.Ruta = '${Ruta}' GROUP BY P.Id_Punto ORDER BY P.Posicion`;
  connection.query(Puntos, (error, result) => {
    if (error) {
      throw error;
    } else {
      res.json(result);
    }
  });
});
// router.get("/Ordenar/Nuevos", (req, res) => {
//   var Puntos = `SELECT DISTINCT Ruta FROM Puntos WHERE Nuevo = 1 ORDER BY Ruta`;
//   connection.query(Puntos, (error, result) => {
//     if (error) {
//       throw error;
//     } else {
//       res.json(result);
//     }
//   });
// });

router.get("/Ordenar/Nuevos", (req, res) => {
  var Puntos = `SELECT DISTINCT H.Ruta FROM Horarios AS H LEFT JOIN Puntos AS P ON H.Id_Punto = P.Id_Punto WHERE P.Nuevo = 1 ORDER BY H.Ruta`;
  connection.query(Puntos, (error, result) => {
    if (error) {
      throw error;
    } else {
      res.json(result);
    }
  });
});
//----------------------------------------------------------------------------------------

//-------------------------------------Programacion json-------------------------------------
router.get("/Listado/Listado", async (req, res) => {
  const { selectionTour, Fecha, Ruta } = req.query;

  const TourCondition = Array.isArray(selectionTour) ? `TourReserva IN ("${selectionTour.join('","')}")` : (selectionTour ? `TourReserva = "${selectionTour}"` : "");
  const FechaReservaCondition = Fecha ? `FechaReserva = "${Fecha}"` : "";
  const RutaReservaCondition = Ruta ? `Ruta = "${Ruta}"` : "";

  const BusAsignado = "BusAsignado IS NULL";
  const conditions = [FechaReservaCondition, TourCondition, RutaReservaCondition, BusAsignado].filter(Boolean);
  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const Listado = `
      SELECT 
          R.Id_Reserva, R.NumeroPasajeros, R.PuntoEncuentro, Pt.Posicion, R.IdiomaReserva, R.NombreReporta, R.FechaReserva,
          T.NombreTour, Pt.Ruta, GROUP_CONCAT(P.NombrePasajero SEPARATOR ', ') AS NombrePasajero,
          GROUP_CONCAT(P.IdPas SEPARATOR ', ') AS IdPas, GROUP_CONCAT(P.TelefonoPasajero SEPARATOR ', ') AS TelefonoPasajero,
          GROUP_CONCAT(P.PrecioTour SEPARATOR ', ') AS PrecioTour 
      FROM Reservas AS R 
      LEFT JOIN Pasajeros AS P ON R.Id_Reserva = P.Id_Reserva 
      LEFT JOIN Tours AS T ON R.TourReserva = T.Id_Tour
      LEFT JOIN Puntos AS Pt ON Pt.Id_Punto = R.Id_Punto
      ${whereClause}
      GROUP BY P.Id_Reserva ORDER BY Pt.Posicion;`;

  try {
    const result = await new Promise((resolve, reject) => {
      connection.query(Listado, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    // Aquí puedes hacer algo con el autobús y el resto de las reservas, como enviarlos como respuesta JSON
    res.json(result);
  } catch (error) {
    console.error('Error al obtener y organizar las reservas:', error);
    res.status(500).json({ error: 'Error al obtener y organizar las reservas' });
  }
});


// Ruta para actualizar las reservas con la placa del autobús asignado
router.post("/Listado/AsignarBus", async (req, res) => {
  try {
    const { Id_Reservas, placaBus, Guia, capacidadBus, asientosDisponibles, Tour, Fecha } = req.body;

    // Verificar que los datos necesarios estén presentes en la solicitud
    if (!Id_Reservas || !placaBus || !Guia || !capacidadBus || !asientosDisponibles || !Tour || !Fecha) {
      return res.status(400).json({ error: 'Faltan datos en la solicitud' });
    }

    // Actualizar las reservas en la base de datos
    const updateQuery = `UPDATE Reservas SET BusAsignado = ? WHERE Id_Reserva IN (?)`;
    await new Promise((resolve, reject) => {
      connection.query(updateQuery, [placaBus, Id_Reservas], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    // Insertar los datos en la tabla BusAsignado
    const insertQuery = `INSERT INTO BusAsignado (PlacaBus, Guia, CapacidadBus, AsientosDisponibles, Tour, Fecha) VALUES (?, ?, ?, ?, ?, ?)`;
    await new Promise((resolve, reject) => {
      connection.query(insertQuery, [placaBus, Guia, capacidadBus, asientosDisponibles, Tour, Fecha], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    // Si se realizó la actualización y la inserción correctamente, responder con éxito
    res.json({ success: true });
  } catch (error) {
    console.error('Error al asignar autobús a las reservas:', error);
    res.status(500).json({ error: 'Error al asignar autobús a las reservas' });
  }
});













router.get("/Programacion/Tabla", (req, res) => {
  var selectionTour = req.query.Tour;
  var Fecha = req.query.Fecha;
  var Confirmacion = `SELECT * FROM Reservas AS R INNER JOIN Pasajeros AS P ON R.Id_Reserva = P.Id_Reserva`;
  var Union = "";
  var Tour = "";
  if (selectionTour != "") {
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
    Tour = "TourReserva in (" + tseleccion + ")";
  }

  var FechaReserva = "";
  if (Fecha != "") {
    FechaReserva = 'FechaReserva ="' + Fecha + '"';
  }

  if (Fecha != "" && selectionTour != "") {
    Union = " AND";
  }

  Confirmacion += ` WHERE ${FechaReserva} ${Union} ${Tour}`;
  connection.query(Confirmacion, (error, result) => {
    if (error) {
      throw error;
    } else {
      res.json(result);
    }
  });
});

//----------------------------------------------------------------------------------------

//-------------------------------------VerListados json-------------------------------------
router.get("/VerListados/Tabla", async (req, res) => {
  const { fecha, tour, ruta } = req.query;

  try {
    // Construir la consulta SQL con los parámetros de filtro
    let sql = `SELECT * FROM BusAsignado`;

    // Construir la cláusula WHERE según los parámetros proporcionados
    const whereConditions = [];
    if (fecha) whereConditions.push(`Fecha = '${fecha}'`);
    if (tour) whereConditions.push(`Tour = '${tour}'`);
    if (ruta) whereConditions.push(`Ruta = '${ruta}'`);

    // Agregar la cláusula WHERE a la consulta SQL si hay condiciones
    if (whereConditions.length > 0) {
      sql += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    const result = await new Promise((resolve, reject) => {
      connection.query(sql, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
    res.json(result);
  } catch (error) {
    console.error('Error al obtener los listados:', error);
    res.status(500).json({ error: 'Error al obtener los listados' });
  }
});





//----------------------------------------------------------------------------------------

//-------------------------------------EditarListado json-------------------------------------


router.get("/Listado/EditarListado/TablaReservas", async (req, res) => {
  const { Fecha, BusAsignado } = req.query;

  const FechaReservaCondition = Fecha ? `FechaReserva = "${Fecha}"` : "";
  const BusAsignadoCondition = BusAsignado ? `BusAsignado = "${BusAsignado}"` : "";

  const conditions = [FechaReservaCondition, BusAsignadoCondition].filter(Boolean);
  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const Listado = `
      SELECT 
          R.Id_Reserva, R.NumeroPasajeros, R.PuntoEncuentro, Pt.Posicion, R.IdiomaReserva, R.NombreReporta, R.FechaReserva,
          T.NombreTour, BusAsignado, GROUP_CONCAT(P.NombrePasajero SEPARATOR ', ') AS NombrePasajero,
          GROUP_CONCAT(P.IdPas SEPARATOR ', ') AS IdPas, GROUP_CONCAT(P.TelefonoPasajero SEPARATOR ', ') AS TelefonoPasajero,
          GROUP_CONCAT(P.PrecioTour SEPARATOR ', ') AS PrecioTour 
      FROM Reservas AS R 
      LEFT JOIN Pasajeros AS P ON R.Id_Reserva = P.Id_Reserva 
      LEFT JOIN Tours AS T ON R.TourReserva = T.Id_Tour
      LEFT JOIN Puntos AS Pt ON Pt.Id_Punto = R.Id_Punto
      ${whereClause}
      GROUP BY P.Id_Reserva ORDER BY Pt.Posicion;`;

  try {
    const result = await new Promise((resolve, reject) => {
      connection.query(Listado, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    // Aquí puedes hacer algo con el autobús y el resto de las reservas, como enviarlos como respuesta JSON
    res.json(result);
  } catch (error) {
    console.error('Error al obtener y organizar las reservas:', error);
    res.status(500).json({ error: 'Error al obtener y organizar las reservas' });
  }
});

router.get("/Listado/EditarListado/ObtenerListadoOtrosBuses", async (req, res) => {
  const { Fecha, Tour, BusAsignado } = req.query;

  const FechaReservaCondition = Fecha ? `FechaReserva = "${Fecha}"` : "";
  const TourCondition = Tour ? `TourReserva = "${Tour}"` : "";
  const BusAsignadoCondition = BusAsignado ? `(BusAsignado != "${BusAsignado}" OR BusAsignado IS NULL)` : "";


  const conditions = [FechaReservaCondition, TourCondition, BusAsignadoCondition].filter(Boolean);
  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const Listado = `
      SELECT 
        R.Id_Reserva, R.NumeroPasajeros, R.PuntoEncuentro, Pt.Posicion, R.IdiomaReserva, R.NombreReporta, R.FechaReserva,
        T.NombreTour, B.id, R.BusAsignado, GROUP_CONCAT(P.NombrePasajero SEPARATOR ', ') AS NombrePasajero,
        GROUP_CONCAT(P.IdPas SEPARATOR ', ') AS IdPas, GROUP_CONCAT(P.TelefonoPasajero SEPARATOR ', ') AS TelefonoPasajero,
        GROUP_CONCAT(P.PrecioTour SEPARATOR ', ') AS PrecioTour 
      FROM Reservas AS R 
      LEFT JOIN Pasajeros AS P ON R.Id_Reserva = P.Id_Reserva 
      LEFT JOIN Tours AS T ON R.TourReserva = T.Id_Tour
      LEFT JOIN Puntos AS Pt ON Pt.Id_Punto = R.Id_Punto
      LEFT JOIN BusAsignado AS B ON R.BusAsignado = B.PlacaBus
      ${whereClause}
      GROUP BY P.Id_Reserva ORDER BY Pt.Posicion;`;

  try {
    const result = await new Promise((resolve, reject) => {
      connection.query(Listado, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    // Aquí puedes hacer algo con el autobús y el resto de las reservas, como enviarlos como respuesta JSON
    res.json(result);
  } catch (error) {
    console.error('Error al obtener y organizar las reservas:', error);
    res.status(500).json({ error: 'Error al obtener y organizar las reservas' });
  }
});


router.get('/Listado/EditarListado/obtenerBuses', (req, res) => {
  const { fecha, tour, placaBus } = req.query;

  // Consulta SQL para obtener los buses disponibles para la fecha y el tour específicos
  const sql = `SELECT * FROM BusAsignado WHERE Fecha = ? AND Tour = ? AND PlacaBus != ?`;

  connection.query(sql, [fecha, tour, placaBus], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ error: 'Error al obtener los buses disponibles' });
      return;
    }
    res.json(results); // Envia los resultados de la consulta como respuesta
  });
});

router.get('/Listado/EditarListado/agregarReserva', (req, res) => {
  const { Id_Reserva, placaBus, idBus1, idBus2, numeroPasajeros } = req.query; // Extraer el valor de Id_Reserva del objeto req.query

  // Consulta SQL para actualizar el campo BusAsignado a NULL para la reserva específica
  const sqlReservas = `UPDATE Reservas SET BusAsignado = ? WHERE Id_Reserva = ?`;
  const sqlBus1 = `UPDATE BusAsignado SET AsientosDisponibles = AsientosDisponibles - ? WHERE id = ?`;
  const sqlBus2 = `UPDATE BusAsignado SET AsientosDisponibles = AsientosDisponibles + ? WHERE id = ?`;

  connection.query(sqlBus1, [numeroPasajeros, idBus1], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ success: false, error: 'Error al restar los asientos disponibles del bus' });
      return;
    }
    if (results.affectedRows > 0) {
      // Si se actualizó al menos una fila, se considera éxito
      if (idBus2 === "") {
        connection.query(sqlBus2, [numeroPasajeros, idBus2], (err, results) => {
          if (err) {
            console.error('Error al ejecutar la consulta SQL:', err);
            res.status(500).json({ success: false, error: 'Error al sumar los asientos disponibles del bus' });
            return;
          }
          if (results.affectedRows > 0) {
            // Si se actualizó al menos una fila, se considera éxito
            connection.query(sqlReservas, [placaBus, Id_Reserva], (err, results) => {
              if (err) {
                console.error('Error al ejecutar la consulta SQL:', err);
                res.status(500).json({ success: false, error: 'Error al asignar la reserva al nuevo bus' });
                return;
              }
              if (results.affectedRows > 0) {
                // Si se actualizó al menos una fila, se considera éxito
                res.json({ success: true, message: 'La reserva fue asignada al nuevo bus correctamente' });

              } else {
                // Si no se actualizó ninguna fila, es posible que la reserva no exista o ya esté desasignada
                res.status(404).json({ success: false, error: 'La reserva no existe o ya está asignada al bus' });
              }
            });
          } else {
            // Si no se actualizó ninguna fila, es posible que la reserva no exista o ya esté desasignada
            res.status(404).json({ success: false, error: 'La reserva no existe o ya está desasignada del bus' });
          }
        });
      } else {
        connection.query(sqlReservas, [placaBus, Id_Reserva], (err, results) => {
          if (err) {
            console.error('Error al ejecutar la consulta SQL:', err);
            res.status(500).json({ success: false, error: 'Error al asignar la reserva al nuevo bus' });
            return;
          }
          if (results.affectedRows > 0) {
            // Si se actualizó al menos una fila, se considera éxito
            res.json({ success: true, message: 'La reserva fue asignada al nuevo bus correctamente' });

          } else {
            // Si no se actualizó ninguna fila, es posible que la reserva no exista o ya esté desasignada
            res.status(404).json({ success: false, error: 'La reserva no existe o ya está asignada al bus' });
          }
        });
      }
    } else {
      // Si no se actualizó ninguna fila, es posible que la reserva no exista o ya esté desasignada
      res.status(404).json({ success: false, error: 'La reserva no existe o ya está asignada al bus' });
    }
  });
});


router.get('/Listado/EditarListado/desasignarReserva', (req, res) => {
  const { Id_Reserva, idBus, numeroPasajeros } = req.query; // Extraer el valor de Id_Reserva del objeto req.query

  // Consulta SQL para actualizar el campo BusAsignado a NULL para la reserva específica
  const sqlReservas = `UPDATE Reservas SET BusAsignado = NULL WHERE Id_Reserva = ?`;
  const sqlBus = `UPDATE BusAsignado SET AsientosDisponibles = AsientosDisponibles + ? WHERE id = ?`;
  connection.query(sqlBus, [numeroPasajeros, idBus], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ success: false, error: 'Error al sumar los asientos disponibles del bus' });
      return;
    }
    if (results.affectedRows > 0) {
      // Si se actualizó al menos una fila, se considera éxito
      connection.query(sqlReservas, [Id_Reserva], (err, results) => {
        if (err) {
          console.error('Error al ejecutar la consulta SQL:', err);
          res.status(500).json({ success: false, error: 'Error al desasignar la reserva del bus' });
          return;
        }
        if (results.affectedRows > 0) {
          // Si se actualizó al menos una fila, se considera éxito
          res.json({ success: true, message: 'La reserva fue desasignada del bus correctamente' });

        } else {
          // Si no se actualizó ninguna fila, es posible que la reserva no exista o ya esté desasignada
          res.status(404).json({ success: false, error: 'La reserva no existe o ya está desasignada del bus' });
        }
      });
    } else {
      // Si no se actualizó ninguna fila, es posible que la reserva no exista o ya esté desasignada
      res.status(404).json({ success: false, error: 'La reserva no existe o ya está desasignada del bus' });

    }

  });
});

router.get('/Listado/EditarListado/eliminarListado', (req, res) => {
  const { fecha, placaBus, idBus } = req.query; // Extraer el valor de Id_Reserva del objeto req.query

  // Consulta SQL para actualizar el campo BusAsignado a NULL para la reserva específica
  const sqlReservas = `UPDATE Reservas SET BusAsignado = NULL WHERE BusAsignado = ? AND FechaReserva = ?`;
  const sqlBus = `DELETE FROM BusAsignado WHERE id = ?`;
  connection.query(sqlBus, [idBus], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ success: false, error: 'Error al eliminar el Listado' });
      return;
    }
    if (results.affectedRows > 0) {
      // Si se actualizó al menos una fila, se considera éxito
      connection.query(sqlReservas, [placaBus, fecha], (err, results) => {
        if (err) {
          console.error('Error al ejecutar la consulta SQL:', err);
          res.status(500).json({ success: false, error: 'Error al desasignar la reserva del bus' });
          return;
        }
        if (results.affectedRows > 0) {
          // Si se actualizó al menos una fila, se considera éxito
          res.json({ success: true, message: 'La reserva fue desasignada del bus correctamente' });

        } else {
          // Si no se actualizó ninguna fila, es posible que la reserva no exista o ya esté desasignada
          res.status(404).json({ success: false, error: 'La reserva no existe o ya está desasignada del bus' });
        }
      });
    } else {
      // Si no se actualizó ninguna fila, es posible que la reserva no exista o ya esté desasignada
      res.status(404).json({ success: false, error: 'La reserva no existe o ya está desasignada del bus' });

    }

  });
});


//----------------------------------------------------------------------------------------


//-------------------------------------Comisiones json-------------------------------------
router.get("/Comision/Tabla", (request, response, next) => {
  const { Id_Tour, Fecha } = request.query;

  // Convierte Id_Tour en un array si es necesario
  const selectionTourArray = Array.isArray(Id_Tour) ? Id_Tour : [Id_Tour];
  const filters = [
    Fecha && `FechaReserva = "${Fecha}"`,
    Id_Tour && `TourReserva IN (${selectionTourArray.map(t => `'${t}'`).join(",")})`,
    'Confirmacion = 1'  // Filtro fijo para Confirmacion
  ].filter(Boolean);

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const query = `
    SELECT *
    FROM Reservas AS R
    INNER JOIN Pasajeros AS P ON R.Id_Reserva = P.Id_Reserva
    ${whereClause}
  `;

  connection.query(query, (error, data) => {
    if (error) {
      response.status(500).json({ error: "Error interno del servidor" });
    } else {
      response.json(data);
    }
  });
});

//----------------------------------------------------------------------------------------

//-------------------------------------Seguros json-------------------------------------
router.get("/Seguros/Tabla", (request, response, next) => {
  const { Id_Tour, Fecha } = request.query;

  // Convierte Id_Tour en un array si es necesario
  const selectionTourArray = Array.isArray(Id_Tour) ? Id_Tour : [Id_Tour];
  const filters = [
    Fecha && `FechaReserva = "${Fecha}"`,
    Id_Tour && `TourReserva IN (${selectionTourArray.map(t => `'${t}'`).join(",")})`,
    'Confirmacion = 1'  // Filtro fijo para Confirmacion
  ].filter(Boolean);

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const query = `
    SELECT *
    FROM Reservas AS R
    INNER JOIN Pasajeros AS P ON R.Id_Reserva = P.Id_Reserva
    INNER JOIN Tours AS T ON T.Id_Tour = R.TourReserva
    ${whereClause}
  `;

  connection.query(query, (error, data) => {
    if (error) {
      response.status(500).json({ error: "Error interno del servidor" });
    } else {
      response.json(data);
    }
  });
});

//----------------------------------------------------------------------------------------

//-------------------------------------NewUser json-------------------------------------
router.get("/NewUser/dni", (req, res) => {
  const dni = req.query.dni;
  const user = `SELECT * FROM users WHERE id_user = '${dni}'`;
  connection.query(user, (error, result) => {
    if (error) {
      console.log(error);
    } else {
      res.json(result);
    }
  });
});

router.get("/NewUser/username", (req, res) => {
  const username = req.query.username;
  const user = `SELECT username FROM users WHERE username = '${username}'`;
  connection.query(user, (error, result) => {
    if (error) {
      console.log(error);
    } else {
      res.json(result);
    }
  });
});

router.get("/NewUser/email", (req, res) => {
  const email = req.query.email;
  const user = `SELECT email FROM users WHERE email = '${email}'`;
  connection.query(user, (error, result) => {
    if (error) {
      console.log(error);
    } else {
      res.json(result);
    }
  });
});
//----------------------------------------------------------------------------------------

//-------------------------------------AdminUsers json-------------------------------------
router.get("/Users/DeleteUser", (req, res) => {
  const id = req.query.id;
  var DeleteUser = `DELETE FROM users WHERE id = '${id}'`;
  connection.query(DeleteUser, (error, result) => {
    if (error) {
      var err = "error";
      res.json(err);
    } else {
      res.json(id);
    }
  });
});
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

router.get("/Perfil/Password", (req, res) => {
  const pass = req.query.Pass;
  const id = req.query.id;
  const user = `SELECT * FROM users WHERE id = '${id}'`;

  connection.query(user, async (error, result) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ message: "Error al buscar el usuario" });
    }

    if (!result.length) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    try {
      const contraseñaCoincide = await bcryptjs.compare(
        pass,
        result[0].password
      );

      if (contraseñaCoincide) {
        return res.status(200).json(result);
      } else {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Error al comparar contraseñas" });
    }
  });
});

//----------------------------------------------------------------------------------------

router.post("/Aforo", Controller.Aforo);
router.post("/ReiniciarAforo", Controller.ReiniciarAforo);
router.post("/NuevaReserva", Controller.saveNuevaReserva);
router.post("/EditReserva", Controller.saveEditReserva);
router.post("/NuevoTransfer", Controller.saveNuevoTransfer);
router.post("/EditarTransfer", Controller.saveEditarTransfer);
router.post("/NuevoTour", Controller.saveNuevoTour);
router.post("/EditarTour", Controller.saveEditarTour);
router.post("/NuevoPunto", Controller.saveNuevoPunto);
router.post("/EditarPunto", Controller.saveEditarPunto);
router.post("/OrdenarPuntos", Controller.saveOrdenarPuntos);
router.post("/saveConfirmacion", Controller.saveConfirmacion);

router.post("/Perfil", Controller.savePerfil);
router.post("/EditarUser", Controller.saveEditarUser);
router.post("/NewUser", Controller.saveNewUser);
router.post("/login", Controller.login);
router.get("/logout", Controller.logout);

module.exports = router;
