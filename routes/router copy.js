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
const updateVersion = '1.9.8.1'; // Define la versión de la actualización

router.get("/", Controller.isAuthenticated, Controller.ToursIndex, Controller.Cupos, Controller.CuposR, Controller.CuposH, (req, res) => {
  const rol = req.user.rol;
  if (rol == "Consultor_TG_CTG") {
    const Ft = new Date();
    const FD = new Date(Ft.setDate(Ft.getDate() + 1));
    const dia = String(FD.getDate()).padStart(2, '0');
    const mes = String(Ft.getMonth() + 1).padStart(2, '0');
    const año = Ft.getFullYear();
    const Fecha_Mañana = año + '-' + mes + '-' + dia;
    res.render("indexTG_CTG", {
      user: req.user,
      rol,
      tours: req.resultsTours,
      resultsCupos: req.resultsCupos,
      resultsCuposR: req.resultsCuposR,
      resultsCuposH: req.resultsCuposH,
      fechaElegida: Fecha_Mañana
    });
  } else if (rol == "Consultor_TG_CTG_SF_CT") {
    const Ft = new Date();
    const FD = new Date(Ft.setDate(Ft.getDate() + 1));
    const dia = String(FD.getDate()).padStart(2, '0');
    const mes = String(Ft.getMonth() + 1).padStart(2, '0');
    const año = Ft.getFullYear();
    const Fecha_Mañana = año + '-' + mes + '-' + dia;
    res.render("indexTG_CTG_SF_CT", {
      user: req.user,
      rol,
      tours: req.resultsTours,
      resultsCupos: req.resultsCupos,
      resultsCuposR: req.resultsCuposR,
      resultsCuposH: req.resultsCuposH,
      fechaElegida: Fecha_Mañana
    });
  } else {
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
let updateMessage = "";
    if ( rol == "Cliente" ) {
      updateMessage = `- Bienvenid@ a la app SIR.\n\n`;
      updateMessage += `- Aqui podras crear, editar y gestionar tus reservas de manera sencilla.\n\n`;
      updateMessage += `- Si identificas algun error, por favor reportalo en la sección de ayuda.\n\n`;
    }

    // let updateMessage = `- Se ha actualizado la aplicación a la versión ${updateVersion} .\n`;
    // updateMessage += `\n`;


    // if (rol === "Administrador") {

    // }
    // if (rol === "SuperAdministrador" || rol === "Administrador") {
    //   updateMessage += `- Se ha incorporado una nueva sección para consultar los abonos de las reservas. Desde allí podrás descargar la información en Excel y actualizar el valor del abono, marcándolo como 0 cuando corresponda. Puedes acceder a esta funcionalidad en el apartado “Abonos”.\n`;
    // }
    // if (rol === "SuperAsesor") {
    //   updateMessage += `- Eres super asesor, ahora tienes acceso a los aforos, el historial de reservas, las comisiones y los seguros.\n`;
    // }

    // if (rol === "Asesor_History") {
    //   updateMessage += `- Ahora tienes acceso al historial de reservas.\n`;
    // }

    // if(rol !== "Asesor") {
    //   updateMessage += `- Al crear un nuevo aforo, se validarán los cupos para asegurar que la cantidad de pasajeros no exceda el límite disponible.\n`;
    // }

    // updateMessage += `- Ahora puedes descargar los puntos de encuentro en un archivo Excel directamente desde la vista "Ver Puntos".\n\n`;
    // updateMessage += `- Ahora, en la pantalla de visualización de cupos, se ha mejorado la forma en que se presentan los tours privados, facilitando su identificación y lectura.\n`;
    // updateMessage += `- Se han corregido errores identificados en versiones anteriores.\n`;
    // updateMessage += `- Si identificas algun error, por favor reportalo en la sección de ayuda.\n\n`;

    // updateMessage += `- Ahora en la vista ver puntos se muestra el horario de salida por cada tour.\n`;


    updateMessage += `:)\n`;

    // Renderiza la vista con el mensaje adecuado

    const Ft = new Date();
    const FD = new Date(Ft.setDate(Ft.getDate() + 1));
    const dia = String(FD.getDate()).padStart(2, '0');
    const mes = String(Ft.getMonth() + 1).padStart(2, '0');
    const año = Ft.getFullYear();
    const Fecha_Mañana = año + '-' + mes + '-' + dia;

    // Renderiza la vista con el mensaje adecuado
    res.render("index", {
      user: req.user,
      rol,
      tours: req.resultsTours,
      resultsCupos: req.resultsCupos,
      resultsCuposR: req.resultsCuposR,
      resultsCuposH: req.resultsCuposH,
      showUpdateMessage: res.locals.showUpdateMessage, // Pasa la variable a la vista
      updateMessage, // Pasa el mensaje a la vista
      fechaElegida: Fecha_Mañana
    });
  }
});

router.get("/Aforos", Controller.isAuthenticated, Controller.ToursAforos, (req, res) => {
  const rol = req.user.rol;
  if (rol == "Asesor" || rol == "Cliente") {
    return res.redirect("/");
  } else if (rol == "Administrador" || rol == "SuperAdministrador" || rol == "SuperAsesor" || rol == "Asesor_History") {
    res.render("Aforos", {
      user: req.user,
      resultsTours: req.resultsTours,
    });
  }
}
);

router.get("/Informes", Controller.isAuthenticated, Controller.Tours, (req, res) => {
  const rol = req.user.rol;
  if (rol == "Asesor" || rol == "Cliente" || rol == "SuperAsesor") {
    return res.redirect("/");
  } else if (rol == "Administrador" || rol == "SuperAdministrador") {
    res.render("Informes", {
      user: req.user,
      resultsTours: req.resultsTours,
    });
  }
}
);

router.get("/History", Controller.isAuthenticated, (req, res) => {
  const rol = req.user.rol;
  if (rol == "Asesor" || rol == "Cliente") {
    return res.redirect("/");
  } else if (rol == "Administrador" || rol == "SuperAdministrador" || rol == "SuperAsesor" || rol == "Asesor_History") {
    res.render("History", { user: req.user });
  }
}
);

router.get("/Reservas/NuevaReserva", Controller.isAuthenticated, Controller.Tours, Controller.Categoria, (req, res) => {
  // Verificar que el usuario tenga acceso a crear reservas
  const rol = req.user.rol;
  if (rol === "Cliente" || rol === "Asesor" || rol === "SuperAsesor" || rol === "Administrador" || rol === "SuperAdministrador") {
    res.render("Reservas/NuevaReserva", {
      user: req.user,
      resultsTours: req.resultsTours,
      resultsCategoria: req.resultsCategoria,
    });
  } else {
    return res.redirect("/");
  }
}
);
router.get("/Reservas/EditarReserva/:Id_Reserva", Controller.isAuthenticated, Controller.Tours, Controller.Categoria, (req, res) => {
  const Id_Reserva = req.params.Id_Reserva;
  const rol = req.user.rol;
  const userDNI = req.user.id_user;

  connection.query(
    "SELECT * FROM Reservas WHERE Id_Reserva = ?",
    [Id_Reserva],
    (error, result) => {
      if (error) {
        throw error;
      } else {
        // Si el usuario es Cliente, verificar que sea su propia reserva
        if (rol === "Cliente") {
          connection.query(
            "SELECT 1 FROM History WHERE Id_ = ? AND id_user = ? LIMIT 1",
            [Id_Reserva, userDNI],
            (errorHistory, historyResult) => {
              console.log(historyResult, userDNI);
              if (!historyResult || !historyResult[0]) {
                return res.redirect("/Reservas/VerReservas");
              }
              res.render("Reservas/EditarReserva", {
                user: req.user,
                resultsTours: req.resultsTours,
                resultsCategoria: req.resultsCategoria,
                Reserva: result[0],
              });
            }
          );
        } else {
          res.render("Reservas/EditarReserva", {
            user: req.user,
            resultsTours: req.resultsTours,
            resultsCategoria: req.resultsCategoria,
            Reserva: result[0],
          });
        }
        console.log(result[0])
      }
    }
  );
}
);

router.get("/Reservas/ReservaDuplicada/:Id_Reserva", Controller.isAuthenticated, Controller.Tours, Controller.Categoria, (req, res) => {
  const Id_Reserva = req.params.Id_Reserva;
  const rol = req.user.rol;
  const userDNI = req.user.id_user;

  connection.query(
    "SELECT * FROM Reservas WHERE Id_Reserva = ?",
    [Id_Reserva],
    (error, result) => {
      if (error) {
        throw error;
      } else {
        // Si el usuario es Cliente, verificar que sea su propia reserva
        if (rol === "Cliente") {
          connection.query(
            "SELECT 1 FROM History WHERE Id_ = ? AND id_user = ? LIMIT 1",
            [Id_Reserva, userDNI],
            (errorHistory, historyResult) => {
              if (!historyResult || !historyResult[0]) {
                return res.redirect("/Reservas/VerReservas");
              }
              res.render("Reservas/ReservaDuplicada", {
                user: req.user,
                resultsTours: req.resultsTours,
                resultsCategoria: req.resultsCategoria,
                Reserva: result[0],
              });
            }
          );
        } else {
          res.render("Reservas/ReservaDuplicada", {
            user: req.user,
            resultsTours: req.resultsTours,
            resultsCategoria: req.resultsCategoria,
            Reserva: result[0],
          });
        }
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
  const rol = req.user.rol;
  if (rol == "Cliente") {
    return res.redirect("/");
  } else {
    res.render("Transfer/NuevoTransfer", {
      user: req.user,
      resultsServicio: req.resultsServicio,
    });
  }
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
  if (rol == "Asesor" || rol == "Asesor_History" || rol == "SuperAsesor" || rol == "Cliente") {
    return res.redirect("/");
  } else if (rol == "Administrador" || rol == "SuperAdministrador") {
    res.render("Tours/NuevoTour", { user: req.user });
  }
});

router.get("/Tours/EditarTour/:Id_Tour", Controller.isAuthenticated, (req, res) => {
  if (rol == "Asesor" || rol == "SuperAsesor" || rol == "Asesor_History" || rol == "Cliente") {
    return res.redirect("/");
  } else if (rol == "Administrador" || rol == "SuperAdministrador") {
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
  if (rol == "Asesor" || rol == "SuperAsesor" || rol == "Asesor_History" || rol == "Cliente") {
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
  } else if (rol == "Administrador" || rol == "SuperAdministrador") {
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
  if (rol == "Asesor" || rol == "SuperAsesor" || rol == "Asesor_History" || rol == "Cliente") {
    return res.redirect("/");
  } else if (rol == "Administrador" || rol == "SuperAdministrador") {
    res.render("Puntos/NuevoPunto", {
      user: req.user,
      resultsTours: req.resultsTours,
    });
  }
});


router.get("/Puntos/VerPuntos", Controller.isAuthenticated, Controller.Tours, (req, res) => {
  connection.query(
    `SELECT P.*, H.HoraSalida, H.Id_Tour 
       FROM Puntos AS P 
       LEFT JOIN Horarios AS H ON P.Id_Punto = H.Id_Punto;`,
    async (error, resultsPuntos) => {
      if (error) {
        throw error;
      } else {
        const puntosMap = {};

        // Agrupar las horas por tour en el objeto 'puntosMap'
        resultsPuntos.forEach((row) => {
          if (!puntosMap[row.Id_Punto]) {
            puntosMap[row.Id_Punto] = {
              ...row,
              HorasPorTour: {},
            };
          }
          puntosMap[row.Id_Punto].HorasPorTour[row.Id_Tour] = row.HoraSalida;
        });
        if (rol == "Asesor" || rol == "SuperAsesor" || rol == "Asesor_History" || rol == "Cliente") {
          res.render("Puntos/VerPuntos", {
            user: req.user,
            resultsPuntos: Object.values(puntosMap),  // Convertir el map a un array
            resultsTours: req.resultsTours,  // Asegúrate de tener los tours en 'req'
          });
        } else if (rol == "Administrador" || rol == "SuperAdministrador") {
          res.render("Puntos/VerPuntosAdmin", {
            user: req.user,
            resultsPuntos: Object.values(puntosMap),  // Convertir el map a un array
            resultsTours: req.resultsTours,  // Asegúrate de tener los tours en 'req'
          });
        }
      }
    }
  );

});


router.get("/Puntos/EditarPunto/:Id_Punto", Controller.isAuthenticated, Controller.Tours, (req, res) => {
  if (rol == "Asesor" || rol == "SuperAsesor" || rol == "Asesor_History" || rol == "Cliente") {
    return res.redirect("/");
  } else if (rol == "Administrador" || rol == "SuperAdministrador") {
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
}
);

router.get("/Puntos/OrdenarPuntos", Controller.isAuthenticated, (req, res) => {
  if (rol == "Asesor" || rol == "SuperAsesor" || rol == "Asesor_History" || rol == "Cliente") {
    return res.redirect("/");
  } else if (rol == "Administrador" || rol == "SuperAdministrador") {
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

router.get("/Puntos/CopiarHorarios", Controller.isAuthenticated, Controller.Tours, (req, res) => {
  if (rol == "Asesor" || rol == "SuperAsesor" || rol == "Asesor_History" || rol == "Cliente") {
    return res.redirect("/");
  } else if (rol == "Administrador" || rol == "SuperAdministrador") {
    res.render("Puntos/CopiarHorarios", {
      user: req.user,
      resultsTours: req.resultsTours,
    });
  }
});

router.get("/Programacion/Listado", Controller.isAuthenticated, Controller.Tours, (req, res) => {
  if (rol == "Asesor" || rol == "SuperAsesor" || rol == "Asesor_History" || rol == "Cliente") {
    return res.redirect("/");
  } else if (rol == "Administrador" || rol == "SuperAdministrador") {
    connection.query(
      "SELECT DISTINCT Ruta FROM Horarios",
      async (error, resultRutas) => {
        if (error) {
          throw error;
        } else {
          res.render("Programacion/Listado", {
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

router.get("/Programacion/Confirmacion", Controller.isAuthenticated, Controller.Tours, (req, res) => {
  if (rol == "Asesor" || rol == "SuperAsesor" || rol == "Asesor_History" || rol == "Cliente") {
    return res.redirect("/");
  } else if (rol == "Administrador" || rol == "SuperAdministrador") {
    res.render("Programacion/Confirmacion", {
      user: req.user,
      resultsTours: req.resultsTours,
    });
  }
}
);

router.get("/Abonos", Controller.isAuthenticated, Controller.Tours, (req, res) => {
  if (rol == "Asesor" || rol == "SuperAsesor" || rol == "Asesor_History") {
    return res.redirect("/");
  } else if (rol == "Administrador" || rol == "SuperAdministrador") {
    res.render("Abonos", {
      user: req.user,
      resultsTours: req.resultsTours,
    });
  }
}
);

router.get("/Comisiones/Comisiones", Controller.isAuthenticated, Controller.Tours, (req, res) => {

  if (rol == "Asesor" || rol == "Asesor_History" || rol == "Cliente") {
    return res.redirect("/");
  } else if (rol == "Administrador" || rol == "SuperAdministrador" || rol == "SuperAsesor") {
    res.render("Comisiones/Comisiones", {
      user: req.user,
      resultsTours: req.resultsTours,
    });
  }
}
);

router.get("/Seguros/Seguros", Controller.isAuthenticated, Controller.Tours, (req, res) => {
  if (rol == "Asesor" || rol == "Asesor_History" || rol == "Cliente") {
    return res.redirect("/");
  } else if (rol == "Administrador" || rol == "SuperAdministrador" || rol == "SuperAsesor") {
    res.render("Seguros/Seguros", {
      user: req.user,
      resultsTours: req.resultsTours,
    });
  }
}
);

router.get("/Settings/NewUser", Controller.isAuthenticated, (req, res) => {
  if (rol == "Asesor" || rol == "SuperAsesor" || rol == "Asesor_History" || rol == "Cliente") {
    return res.redirect("/");
  } else if (rol == "Administrador" || rol == "SuperAdministrador") {
    res.render("Settings/NewUser", { user: req.user });
  }
});

router.get("/Settings/AdminUsers", Controller.isAuthenticated, (req, res) => {
  if (rol == "Asesor" || rol == "SuperAsesor" || rol == "Asesor_History" || rol == "Cliente") {
    return res.redirect("/");
  } else if (rol == "Administrador" || rol == "SuperAdministrador") {
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
  if (rol == "Asesor" || rol == "SuperAsesor" || rol == "Asesor_History" || rol == "Cliente") {
    return res.redirect("/");
  } else if (rol == "Administrador" || rol == "SuperAdministrador") {
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

// router.get('/tours-data', (req, res) => {
//   const fechaElegida = req.query.fecha;

//   // Consulta para obtener tours, cupos, número de pasajeros y tours privados
//   const toursQuery = `
//       SELECT t.Id_Tour, t.NombreTour,
//           COALESCE(
//               (SELECT af.NuevoCupo FROM aforos af 
//                 WHERE af.Id_Tour = t.Id_Tour AND af.Fecha = ? 
//                 ORDER BY af.id DESC LIMIT 1), 
//               t.CupoBase
//           ) AS cupos,
//           COALESCE(
//               (SELECT SUM(r.NumeroPasajeros) FROM Reservas r 
//                 WHERE r.TourReserva = t.Id_Tour AND r.FechaReserva = ? AND r.TipoReserva = 'Grupal' 
//                 AND r.Estado IN ('Pendiente', 'Activo', 'Completado')), 
//               0
//           ) AS NumeroPasajeros,
//           COALESCE(
//               (SELECT COUNT(*) FROM Reservas r 
//                 WHERE r.TourReserva = t.Id_Tour AND r.FechaReserva = ? 
//                 AND r.TipoReserva = 'Privada' 
//                 AND r.Estado IN ('Pendiente', 'Activo', 'Completado')), 
//               0
//           ) AS totalPrivados
//       FROM Tours t
//   `;



//   // Consulta para obtener la suma total de transfers por tipo de servicio
//   const transferQuery = `
//       SELECT st.id, st.Servicio, 
//           COALESCE(SUM(CASE WHEN t.Servicio = st.id THEN 1 ELSE 0 END), 0) AS totalTransfers
//             FROM ServicioTransfer st
//             LEFT JOIN Transfer t ON st.id = t.Servicio 
//               AND t.FechaTransfer = ? 
//               AND t.Estado IN ('Pendiente', 'Activo', 'Completado')
//       GROUP BY st.id;
//   `;

//   // Ejecuta las dos consultas en paralelo
//   connection.query(toursQuery, [fechaElegida, fechaElegida, fechaElegida], (error, toursResults) => {
//     if (error) return res.status(500).json({ error: error.message });

//     connection.query(transferQuery, [fechaElegida], (error, transferResults) => {
//       if (error) return res.status(500).json({ error: error.message });

//       // Combina los resultados de tours y transfer en un solo objeto
//       const data = {
//         tours: toursResults,
//         transfers: transferResults
//       };

//       console.log(toursResults);

//       res.json(data); // Devuelve los resultados como JSON
//     });
//   });
// });

router.get('/tours-data', (req, res) => {
  const fechaElegida = req.query.fecha;

  /* ── 1. consultas existentes ────────────────────────────────────────────── */
  const toursQuery = `
  SELECT 
    t.Id_Tour, 
    t.NombreTour,
    COALESCE((
      SELECT af.NuevoCupo
      FROM aforos af
      WHERE af.Id_Tour = t.Id_Tour 
        AND af.Fecha = ?
      ORDER BY af.id DESC 
      LIMIT 1
    ), t.CupoBase) AS cupos,

    COALESCE((
      SELECT SUM(r.NumeroPasajeros)
      FROM Reservas r
      WHERE r.TourReserva = t.Id_Tour
        AND r.FechaReserva = ?
        AND r.TipoReserva = 'Grupal'
        AND r.Estado IN ('Pendiente','Activo','Completado')
        AND EXISTS (
          SELECT 1 
          FROM Pasajeros p 
          WHERE p.Id_Reserva = r.Id_Reserva
        )
    ), 0) AS NumeroPasajeros,

    COALESCE((
      SELECT COUNT(*)
      FROM Reservas r
      WHERE r.TourReserva = t.Id_Tour
        AND r.FechaReserva = ?
        AND r.TipoReserva = 'Privada'
        AND r.Estado IN ('Pendiente','Activo','Completado')
    ), 0) AS totalPrivados

  FROM Tours t;
`;


  const transferQuery = `
      SELECT st.id, st.Servicio, 
          COALESCE(SUM(CASE WHEN t.Servicio = st.id THEN 1 ELSE 0 END), 0) AS totalTransfers
            FROM ServicioTransfer st
            LEFT JOIN Transfer t ON st.id = t.Servicio 
              AND t.FechaTransfer = ? 
              AND t.Estado IN ('Pendiente', 'Activo', 'Completado')
      GROUP BY st.id;
  `;
  /* ── 2. NUEVA consulta: detalle de reservas privadas ───────────────────── */
  const privadosQuery = `
    SELECT TourReserva    AS Id_Tour,
           Id_Reserva,
           NumeroPasajeros
    FROM   Reservas
    WHERE  FechaReserva = ?
      AND  TipoReserva   = 'Privada'
      AND  Estado IN ('Pendiente','Activo','Completado')
    ORDER BY Id_Reserva;
  `;

  /* ── 3. ejecutar en paralelo ────────────────────────────────────────────── */
  connection.query(toursQuery, [fechaElegida, fechaElegida, fechaElegida], (err, tours) => {
    if (err) return res.status(500).json({ error: err.message });

    connection.query(transferQuery, [fechaElegida], (err, transfers) => {
      if (err) return res.status(500).json({ error: err.message });

      connection.query(privadosQuery, [fechaElegida], (err, privadosRaw) => {
        if (err) return res.status(500).json({ error: err.message });

        /* ── 4. agrupar privados por tour ─────────────────────────────────── */
        const privadosMap = {};
        privadosRaw.forEach(p => {
          if (!privadosMap[p.Id_Tour]) privadosMap[p.Id_Tour] = [];
          privadosMap[p.Id_Tour].push({ Id_Reserva: p.Id_Reserva, NumeroPasajeros: p.NumeroPasajeros });
        });

        /* ── 5. anexar al objeto tour correspondiente ─────────────────────── */
        tours.forEach(t => { t.privados = privadosMap[t.Id_Tour] || []; });

        /* ── 6. respuesta final ───────────────────────────────────────────── */
        res.json({ tours, transfers })

      });
    });
  });
});

router.get('/tours-dataTG_CTG', (req, res) => {
  const fechaElegida = req.query.fecha;

  const toursQuery = `
    SELECT t.Id_Tour, t.NombreTour,
        COALESCE(
            (SELECT af.NuevoCupo FROM aforos af 
              WHERE af.Id_Tour = t.Id_Tour AND af.Fecha = ? 
              ORDER BY af.id DESC LIMIT 1), 
            t.CupoBase
        ) AS cupos,
        COALESCE(
            (SELECT SUM(r.NumeroPasajeros) FROM Reservas r 
              WHERE r.TourReserva = t.Id_Tour AND r.FechaReserva = ? AND r.TipoReserva = 'Grupal' 
              AND r.Estado IN ('Pendiente', 'Activo', 'Completado')), 
            0
        ) AS NumeroPasajeros,
        COALESCE(
            (SELECT COUNT(*) FROM Reservas r 
              WHERE r.TourReserva = t.Id_Tour AND r.FechaReserva = ? 
              AND r.TipoReserva = 'Privada' 
              AND r.Estado IN ('Pendiente', 'Activo', 'Completado')), 
            0
        ) AS totalPrivados
    FROM Tours t
    WHERE t.Id_Tour IN (2, 3, 4, 8, 10);
  `;

  const privadosQuery = `
    SELECT TourReserva AS Id_Tour,
           Id_Reserva,
           NumeroPasajeros
    FROM Reservas
    WHERE FechaReserva = ?
      AND TipoReserva = 'Privada'
      AND Estado IN ('Pendiente','Activo','Completado')
    ORDER BY Id_Reserva;
  `;

  connection.query(toursQuery, [fechaElegida, fechaElegida, fechaElegida], (error, toursResults) => {
    if (error) return res.status(500).json({ error: error.message });

    connection.query(privadosQuery, [fechaElegida], (error2, privadosRaw) => {
      if (error2) return res.status(500).json({ error: error2.message });

      // Agrupar privados por tour
      const privadosMap = {};
      privadosRaw.forEach(p => {
        if (!privadosMap[p.Id_Tour]) privadosMap[p.Id_Tour] = [];
        privadosMap[p.Id_Tour].push({ Id_Reserva: p.Id_Reserva, NumeroPasajeros: p.NumeroPasajeros });
      });

      // Añadir al objeto de cada tour
      toursResults.forEach(t => {
        t.privados = privadosMap[t.Id_Tour] || [];
      });

      res.json(toursResults);
    });
  });
});



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
  var Cupos = "SELECT SUM(NumeroPasajeros) as Total FROM Reservas WHERE TourReserva = ? AND TipoReserva = 'Grupal' AND FechaReserva = ? AND (Estado = 'Pendiente' OR Estado = 'Activo' OR Estado = 'Completado')";
  connection.query(Cupos, [Id_Tour, Fecha], (error, data) => {
    response.json(data);
  });
});


router.get("/Index/CuposRH", (request, response, next) => {
  var Fecha = request.query.Fecha;
  var CuposRH = `SELECT SUM(NumeroPasajeros) as Total FROM Reservas WHERE TourReserva IN (1,5) AND TipoReserva = 'Grupal' AND FechaReserva = '${Fecha}' AND (Estado = 'Pendiente' OR Estado = 'Activo' OR Estado = 'Completado')`;
  connection.query(CuposRH, (error, data) => {
    response.json(data);
  });
});

router.get("/Index/PasajerosRio", (request, response, next) => {
  var Fecha = request.query.Fecha;
  var PasajerosRio = `SELECT SUM(NumeroPasajeros) as Pasajeros FROM Reservas WHERE TourReserva = 1 AND FechaReserva = '${Fecha}' AND TipoReserva = 'Grupal' AND (Estado = 'Pendiente' OR Estado = 'Activo' OR Estado = 'Completado')`;
  connection.query(PasajerosRio, (error, data) => {
    response.json(data);
  });
});

router.get("/Index/PasajerosHacienda", (request, response, next) => {
  var Fecha = request.query.Fecha;
  var PasajerosHacienda = `SELECT SUM(NumeroPasajeros) as Pasajeros FROM Reservas WHERE TourReserva = 5 AND FechaReserva = '${Fecha}' AND TipoReserva = 'Grupal' AND (Estado = 'Pendiente' OR Estado = 'Activo' OR Estado = 'Completado')`;
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
  var Transfer = `SELECT COUNT(Id_Transfer) as Transfer FROM Transfer WHERE FechaTransfer = '${Fecha}' AND (Estado = 'Pendiente' OR Estado = 'Activo')`;
  connection.query(Transfer, (error, data) => {
    response.json(data);
  });
});

router.get("/Index/TransferAeropuerto", (request, response, next) => {
  var Fecha = request.query.Fecha;
  var PasajerosAeropuerto = `SELECT COUNT(Id_Transfer) as Transfer FROM Transfer WHERE Servicio = 2 AND FechaTransfer = '${Fecha}' AND (Estado = 'Pendiente' OR Estado = 'Activo' OR Estado = 'Completado')`;
  connection.query(PasajerosAeropuerto, (error, data) => {
    response.json(data);
  });
});

router.get("/Index/TransferHotel", (request, response, next) => {
  var Fecha = request.query.Fecha;
  var PasajerosHotel = `SELECT COUNT(Id_Transfer) as Transfer FROM Transfer WHERE Servicio = 1 AND FechaTransfer = '${Fecha}' AND (Estado = 'Pendiente' OR Estado = 'Activo' OR Estado = 'Completado')`;
  connection.query(PasajerosHotel, (error, data) => {
    response.json(data);
  });
});

router.get("/Index/TransferOtro", (request, response, next) => {
  var Fecha = request.query.Fecha;
  var PasajerosOtro = `SELECT COUNT(Id_Transfer) as Transfer FROM Transfer WHERE Servicio = 5 AND FechaTransfer = '${Fecha}' AND (Estado = 'Pendiente' OR Estado = 'Activo' OR Estado = 'Completado')`;
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

router.get('/informes/Categoria', (req, res) => {
  let filtro = req.query.filtro || 'rango-fechas'; // Filtro por defecto
  let groupByClause = '';
  let whereClause = 'WHERE r.Estado IN ("Activo", "Completado")';

  // Obtener ID del Tour si está presente en la consulta
  const idTour = req.query.idTour;
  if (idTour) {
    whereClause += ` AND r.TourReserva = '${idTour}'`;
  }

  if (filtro === 'rango-fechas') {
    const fechaInicio = req.query.fechaInicio;
    const fechaFin = req.query.fechaFin;
    if (fechaInicio && fechaFin) {
      whereClause += ` AND r.FechaReserva BETWEEN '${fechaInicio}' AND '${fechaFin}'`;
    }
    groupByClause = 'DATE_FORMAT(r.FechaReserva, "%Y-%m-%d")';
  } else if (filtro === 'rango-meses') {
    const mesInicio = req.query.mesInicio;
    const mesFin = req.query.mesFin;
    if (mesInicio && mesFin) {
      whereClause += ` AND DATE_FORMAT(r.FechaReserva, "%Y-%m") BETWEEN '${mesInicio}' AND '${mesFin}'`;
    }
    groupByClause = 'DATE_FORMAT(r.FechaReserva, "%m-%Y")';
  }

  const query = `
    SELECT
        ${groupByClause} AS FechaReserva,
        c.Categoria,
        SUM(r.TotalPasajeros) AS TotalPasajeros
    FROM
        Reservas r
    INNER JOIN CategoriaCliente c ON r.CategoriaReserva = c.Id_Categoria
    ${whereClause}
    GROUP BY ${groupByClause}, c.Categoria
    ORDER BY FechaReserva ASC, c.Categoria ASC;
  `;

  connection.query(query, (error, resultados) => {
    if (error) {
      console.error('Error al realizar la consulta de pasajeros por categoría: ' + error.message);
      return res.status(500).json({ error: 'Error al obtener los datos de pasajeros por categoría.' });
    }

    res.json(resultados);
  });
});




// router.get('/informes/exportarCategoria', (req, res) => {
//   let filtro = req.query.filtro || 'dia';
//   let groupByClause = '';
//   let Where = '';
//   let fechaInicio = '';
//   let fechaFin = '';

//   switch (filtro) {
//     case 'dia':
//       groupByClause = 'DATE_FORMAT(r.FechaReserva, "%d-%m-%Y")';
//       break;
//     case 'semana':
//       groupByClause = 'YEARWEEK(r.FechaReserva)';
//       break;
//     case 'mes':
//       groupByClause = 'DATE_FORMAT(r.FechaReserva, "%m-%Y")';
//       break;
//     case 'ano':
//       groupByClause = 'YEAR(r.FechaReserva)';
//       break;
//     case 'rango':
//       fechaInicio = req.query.fechaInicio || moment().subtract(7, 'days').format('YYYY-MM-DD');
//       fechaFin = req.query.fechaFin || moment().format('YYYY-MM-DD');
//       groupByClause = 'DATE_FORMAT(r.FechaReserva, "%Y-%m-%d")';
//       Where = `WHERE r.FechaReserva BETWEEN '${fechaInicio}' AND '${fechaFin}'`;
//       break;
//     case 'fecha-especifica':
//       const fechaEspecifica = req.query.fechaEspecifica;
//       groupByClause = 'DATE_FORMAT(r.FechaReserva, "%Y-%m-%d")';
//       Where = `WHERE r.FechaReserva = '${fechaEspecifica}'`;
//       break;
//     default:
//       break;
//   }

//   const query = `
//     SELECT
//         ${groupByClause} AS FechaReserva,
//         SUM(p.Precio - p.Comision) AS TotalIngresos
//     FROM
//         Pasajeros p
//         INNER JOIN Reservas r ON p.Id_Reserva = r.Id_Reserva
//         ${Where}
//     GROUP BY
//         ${groupByClause}
//     ORDER BY
//         FechaReserva ASC;
//   `;

//   connection.query(query, (error, resultados) => {
//     if (error) {
//       console.error('Error al realizar la consulta de ingresos por reserva: ' + error.message);
//       return res.status(500).json({ error: 'Error al obtener los datos de ingresos por reserva.' });
//     }

//     const workbook = new excel.Workbook();
//     const worksheet = workbook.addWorksheet('Ingresos');

//     worksheet.columns = [
//       { header: 'Fecha de Reserva', key: 'FechaReserva', width: 20 },
//       { header: 'Total Ingresos', key: 'TotalIngresos', width: 20 },
//     ];

//     resultados.forEach((row) => {
//       worksheet.addRow({
//         FechaReserva: row.FechaReserva,
//         TotalIngresos: row.TotalIngresos,
//       });
//     });

//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.setHeader('Content-Disposition', `attachment; filename=Informe-Ingresos_${filtro}_${fechaInicio}_${fechaFin}.xlsx`);

//     workbook.xlsx.write(res).then(() => res.end());
//   });
// });



//------------------------------------------------------------------------------------------------
//----------------------------History json--------------------------------
router.get("/History/Filtro", (request, response, next) => {
  const {
    Id_Reserva,
  } = request.query;



  // Build the WHERE clause
  const whereClause = Id_Reserva ? `WHERE Id_ = "${Id_Reserva}"` : '';

  // Define the SQL query
  const query = `
    SELECT History.*, users.name FROM History
    LEFT JOIN users ON History.id_user = users.id_user
    ${whereClause}`;

  // Execute the query
  connection.query(query, (error, data) => {
    if (error) {
      response.status(500).json({ error: "Error interno del servidor" });
    } else {
      response.json(data);
      console.log(data);
    }
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
  const Id_Reserva = `${abreviacion}${Math.floor(Math.random() * 900000) + 100000}`;

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
  var tour = `TourReserva = '${Id_Tour}'`;
  if (Id_Tour == 5) {
    tour = `TourReserva in (1,5)`;
  }
  var TotalPasajeros = `SELECT SUM(NumeroPasajeros) as Total FROM Reservas WHERE ${tour} AND FechaReserva = '${Fecha}' AND TipoReserva = 'Grupal' AND (Estado = 'Pendiente' OR Estado = 'Activo')`;
  console.log(TotalPasajeros);
  connection.query(TotalPasajeros, (error, data) => {
    response.json(data);
  });
});

// Endpoint para consultar cupos por nombre de tour (consumo n8n)
router.post("/api/cupos/por-nombre", (req, res) => {
  const nombre_tour = (req.body?.nombre_tour || req.body?.nombreTour || req.query?.nombre_tour || "").trim();
  const fecha = (req.body?.fecha || req.query?.fecha || "").trim();

  if (!nombre_tour) {
    return res.status(400).json({ error: "nombre_tour requerido" });
  }

  if (!fecha || !moment(fecha, "YYYY-MM-DD", true).isValid()) {
    return res.status(400).json({ error: "Fecha inválida. Formato esperado YYYY-MM-DD" });
  }

  const nombreNormalizado = nombre_tour.toLowerCase().replace(/\s+/g, " ").trim();
  const likePattern = `%${nombreNormalizado}%`;

  const tourSql = `
    SELECT Id_Tour, NombreTour
    FROM Tours
    WHERE LOWER(NombreTour) LIKE ?
    ORDER BY (LOWER(NombreTour) = ?) DESC, LENGTH(NombreTour) ASC
    LIMIT 1
  `;

  connection.query(tourSql, [likePattern, nombreNormalizado], (tourError, tourResults) => {
    if (tourError) {
      console.error(tourError);
      return res.status(500).json({ error: "Error interno del servidor" });
    }

    if (!tourResults || tourResults.length === 0) {
      return res.status(404).json({ error: "Tour no encontrado" });
    }

    const tour = tourResults[0];
    const tourIdOriginal = tour.Id_Tour;
    const tourIdDisponibilidad = tourIdOriginal == 1 ? 5 : tourIdOriginal;

    const aforoSql = `
      SELECT NuevoCupo as Cupos
      FROM aforos
      WHERE Id_Tour = ? AND Fecha = ?
      ORDER BY id DESC LIMIT 1
    `;

    connection.query(aforoSql, [tourIdDisponibilidad, fecha], (aforoError, aforoResults) => {
      if (aforoError) {
        console.error(aforoError);
        return res.status(500).json({ error: "Error interno del servidor" });
      }

      const usarAforo = aforoResults && aforoResults.length > 0;
      const cupoBaseSql = `SELECT CupoBase as Cupos FROM Tours WHERE Id_Tour = ?`;

      const onCupoTotal = (cupoTotal) => {
        let tourClause = `TourReserva = ?`;
        let params = [tourIdDisponibilidad, fecha];

        if (tourIdDisponibilidad == 5) {
          tourClause = `TourReserva in (1,5)`;
          params = [fecha];
        }

        const totalPasajerosSql = `
          SELECT IFNULL(SUM(NumeroPasajeros), 0) as Total
          FROM Reservas
          WHERE ${tourClause}
            AND FechaReserva = ?
            AND TipoReserva = 'Grupal'
            AND (Estado = 'Pendiente' OR Estado = 'Activo')
        `;

        connection.query(totalPasajerosSql, params, (pasajerosError, pasajerosResults) => {
          if (pasajerosError) {
            console.error(pasajerosError);
            return res.status(500).json({ error: "Error interno del servidor" });
          }

          const ocupados = Number(pasajerosResults?.[0]?.Total || 0);
          const cupoTotalNum = Number(cupoTotal || 0);
          const disponibles = cupoTotalNum - ocupados;

          return res.json({
            tour_id: tourIdOriginal,
            tour_nombre: tour.NombreTour,
            fecha,
            cupo_total: cupoTotalNum,
            ocupados,
            disponibles
          });
        });
      };

      if (usarAforo) {
        return onCupoTotal(aforoResults[0].Cupos);
      }

      connection.query(cupoBaseSql, [tourIdDisponibilidad], (cupoError, cupoResults) => {
        if (cupoError) {
          console.error(cupoError);
          return res.status(500).json({ error: "Error interno del servidor" });
        }

        const cupoBase = cupoResults?.[0]?.Cupos || 0;
        return onCupoTotal(cupoBase);
      });
    });
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
  const query = `SELECT * FROM Pasajeros AS P INNER JOIN Reservas AS R ON P.Id_Reserva = R.Id_Reserva WHERE IdPas = '${idpas}' AND IdPas != '' AND FechaReserva = '${FechaReserva}' AND P.Id_Reserva != '${Id_Reserva}' AND (R.Estado = 'Activo' OR R.Estado = 'Pendiente') AND TourReserva != 3 AND TourReserva != 7`;
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

router.get("/VerReservas/FiltroVerReservas", Controller.isAuthenticated, (request, response, next) => {
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
  console.log(request.user);
  // Si es Cliente, obtener su DNI de la tabla users
  if (request.user && request.user.rol === "Cliente") {
    const userDNI = request.user.id_user;

    // Primero obtener las reservas del cliente
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

    const whereClause = filters.length ? `AND ${filters.join(" AND ")}` : "";

    const query = `
  SELECT R.*, P.*, T.NombreTour AS NombreTour
  FROM Reservas AS R
  INNER JOIN Pasajeros AS P ON R.Id_Reserva = P.Id_Reserva
  INNER JOIN Tours AS T ON R.TourReserva = T.Id_Tour
  WHERE EXISTS (
    SELECT 1
    FROM History AS H
    WHERE H.Id_ = R.Id_Reserva
      AND H.id_user = '${userDNI}' AND H.Accion IN ('Nuevo', 'DUPLICAR', 'EDITAR')
  ) ${whereClause}
  GROUP BY R.Id_Reserva;
`;

    console.log(query);
    connection.query(query, (error, data) => {
      if (error) {
        response.status(500).json({ error: "Error interno del servidor" });
      } else {
        response.json(data);
      }
    });
  } else {
    // Para otros roles, mostrar todas
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

    connection.query(query, (error, data) => {
      if (error) {
        response.status(500).json({ error: "Error interno del servidor" });
      } else {
        response.json(data);
      }
    });
  }

});

router.get("/Reservas/CancelarReserva", (req, res) => {
  const { Id_Reserva, id_user } = req.query;

  // Consulta para actualizar el estado de la reserva a 'Cancelado'
  const updateReserva = `
    UPDATE Reservas
    SET Estado = 'Cancelado'
    WHERE Id_Reserva = ?
  `;

  // Datos para el historial
  const tipoHistory = 'RESERVA';
  const accionHistory = 'CANCELADO';
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

    const NumeroPasajeros = parseInt(input_numpas);

    const NomPasArray = JSON.parse(NomPas);
    const TipoPasajeroArray = JSON.parse(TipoPasajero);
    const IdPasArray = JSON.parse(IdPas);
    const TelefonoArray = JSON.parse(Telefono);

    const Confirmacion = 1;
    const TipoHistory = 'RESERVA';
    const AccionHistory = 'DUPLICAR';

    const FechaObj = new Date();
    const dia = String(FechaObj.getDate()).padStart(2, '0');
    const mes = String(FechaObj.getMonth() + 1).padStart(2, '0');
    const año = FechaObj.getFullYear();
    const horas24 = FechaObj.getHours();
    const horas = horas24 % 12 || 12;
    const minutos = String(FechaObj.getMinutes()).padStart(2, '0');
    const segundos = String(FechaObj.getSeconds()).padStart(2, '0');
    const ampm = horas24 >= 12 ? 'PM' : 'AM';
    const FechaRegistro = `${año}-${mes}-${dia}`;
    const HoraRegistro = `${horas}:${minutos}:${segundos} ${ampm}`;

    // ============================
    // Validación de cupo disponible
    // ============================

    let TourCupos = Id_Tour;
    let TourSql = `TourReserva = ?`;
    let cupoParams = [Id_Tour, FechaReserva, Id_Tour];
    let ocupadosParams = [Id_Tour, FechaReserva];

    if (Id_Tour == 1 || Id_Tour == 5) {
      TourCupos = 5;
      TourSql = `TourReserva IN (1,5)`;
      cupoParams = [5, FechaReserva, 5];
      ocupadosParams = [FechaReserva];
    }

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

    connection.query(sqlCupo, cupoParams, (errorCupo, resultCupo) => {
      if (errorCupo) {
        console.error(errorCupo);
        return res.json({ error: 'Error al consultar el cupo total.' });
      }

      const cupoTotal = resultCupo[0].CupoTotal;

      const sqlOcupados = `
        SELECT IFNULL(SUM(NumeroPasajeros),0) AS Ocupados
        FROM Reservas
        WHERE ${TourSql}
          AND FechaReserva = ?
          AND Estado != 'Cancelado'
          AND TipoReserva = 'Grupal'
      `;

      connection.query(sqlOcupados, ocupadosParams, (errorOcupados, resultOcupados) => {
        if (errorOcupados) {
          console.error(errorOcupados);
          return res.json({ error: 'Error al consultar el cupo ocupado.' });
        }

        const ocupados = resultOcupados[0].Ocupados;
        const disponibles = cupoTotal - ocupados;

        if (NumeroPasajeros > disponibles) {
          // Registrar intento sin cupo
          connection.query('INSERT INTO History SET ?', {
            Id_: Id_Reserva || Id_ReservaDuplicar, // usa el que corresponda según el caso
            Tipo: 'RESERVA SIN CUPO',
            Accion: 'EDITAR',
            id_user,
            FechaRegistro,
            HoraRegistro
          }, (errorHistory) => {
            if (errorHistory) {
              console.error('Error al guardar History de reserva sin cupo:', errorHistory);
            }

            return res.json({
              error: `No hay cupo suficiente. Disponibles: ${disponibles}, Solicitados: ${NumeroPasajeros}`
            });
          });
        }

        // ================================
        // Continuar con duplicación
        // ================================

        connection.query('INSERT INTO History SET ?', {
          Id_: Id_ReservaDuplicar,
          Tipo: TipoHistory,
          Accion: AccionHistory,
          id_user,
          FechaRegistro,
          HoraRegistro
        }, (errorHistory) => {
          if (errorHistory) {
            console.log(errorHistory);
            return res.json("error");
          }

          connection.query('INSERT INTO Reservas SET ?', {
            Id_Reserva: Id_ReservaDuplicar,
            TipoReserva,
            NumeroPasajeros,
            TotalPasajeros: total_pas,
            TourReserva: Id_Tour,
            PuntoEncuentro,
            Id_Punto,
            FechaReserva,
            TelefonoReserva,
            IdiomaReserva,
            CategoriaReserva: Categoria,
            NombreReporta,
            Observaciones,
            FechaRegistro,
            HoraRegistro,
            Estado
          }, (errorReserva) => {
            if (errorReserva) {
              console.log(errorReserva);
              return res.json("error");
            }

            let insertedCount = 0;
            for (let i = 0; i < total_pas; i++) {
              connection.query('INSERT INTO Pasajeros SET ?', {
                Id_Reserva: Id_ReservaDuplicar,
                NombrePasajero: NomPasArray[i],
                TipoPasajero: TipoPasajeroArray[i],
                IdPas: IdPasArray[i],
                TelefonoPasajero: TelefonoArray[i],
                Fecha: FechaRegistro,
                Confirmacion
              }, (errorPasajeros) => {
                if (errorPasajeros) {
                  console.log(errorPasajeros);
                } else {
                  insertedCount++;
                }
                if (insertedCount === total_pas) {
                  return res.json(null);
                }
              });
            }
          });
        });
      });
    });

  } catch (error) {
    console.error('Error:', error);
    res.json("error");
  }
});


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

router.get("/Transfer/CancelarTransfer", (req, res) => {
  const { Id_Transfer, id_user } = req.query;

  // Consulta para actualizar el estado del transfer a 'Cancelado'
  const updateTransfer = `
    UPDATE Transfer
    SET Estado = 'Cancelado'
    WHERE Id_Transfer = ?
  `;

  // Datos para el historial
  const tipoHistory = 'TRANSFER';
  const accionHistory = 'CANCELADO';
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


router.get('/Puntos/Exportar', async (req, res) => {
  const query = `
    SELECT p.Id_Punto, p.NombrePunto, p.Sector, p.Latitud, p.Longitud, h.Ruta
    FROM Puntos AS p
    INNER JOIN Horarios AS h ON p.Id_Punto = h.Id_Punto
    GROUP BY p.Id_Punto
    ORDER BY h.Ruta ASC;
  `;

  connection.query(query, async (error, results) => {
    if (error) {
      console.error('Error en la consulta:', error);
      return res.status(500).send('Error al generar el archivo.');
    }

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Puntos con Ruta');

    // Estilo de encabezados
    const headerStyle = {
      font: { bold: true },
      alignment: { vertical: 'middle', horizontal: 'center' },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B0F0' } },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };

    // Definir columnas
    worksheet.columns = [
      { header: 'ID PUNTO', key: 'Id_Punto', width: 12 },
      { header: 'NOMBRE PUNTO', key: 'NombrePunto', width: 30 },
      { header: 'SECTOR', key: 'Sector', width: 20 },
      { header: 'LATITUD', key: 'Latitud', width: 20 },
      { header: 'LONGITUD', key: 'Longitud', width: 20 },
      { header: 'RUTA', key: 'Ruta', width: 15 },
    ];

    // Aplicar estilo al encabezado
    worksheet.getRow(1).eachCell(cell => {
      Object.assign(cell, headerStyle);
    });

    // Agregar datos
    results.forEach(row => worksheet.addRow(row));

    // Preparar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const fecha = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Disposition', `attachment; filename="Puntos_${fecha}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  });
});

// router.get('/Puntos/Exportar', async (req, res) => {
//   const query = `
//     SELECT p.Id_Punto,
//            p.NombrePunto,
//            p.Sector,
//            t.Id_Tour,
//            t.NombreTour,
//            h.HoraSalida
//     FROM Puntos p
//     LEFT JOIN Horarios h ON p.Id_Punto = h.Id_Punto
//     LEFT JOIN Tours t ON h.Id_Tour = t.Id_Tour
//     ORDER BY p.Id_Punto, t.Id_Tour, h.HoraSalida;
//   `;

//   connection.query(query, async (error, results) => {
//     if (error) {
//       console.error('Error en la consulta:', error);
//       return res.status(500).send('Error al generar el archivo.');
//     }

//     // Recopilar lista de tours en orden de aparición
//     const toursMap = new Map();
//     // Map de puntos: Id_Punto -> { NombrePunto, Sector, horariosByTour: { NombreTour: [times] } }
//     const puntosMap = new Map();

//     results.forEach(row => {
//       const idP = row.Id_Punto;
//       const nombreP = row.NombrePunto || '';
//       const sector = row.Sector || '';
//       const tourId = row.Id_Tour;
//       const tourName = row.NombreTour || (tourId ? `Tour ${tourId}` : '');

//       if (tourId && !toursMap.has(tourId)) toursMap.set(tourId, tourName);

//       if (!puntosMap.has(idP)) {
//         puntosMap.set(idP, { NombrePunto: nombreP, Sector: sector, horariosByTour: {} });
//       }

//       const punto = puntosMap.get(idP);
//       if (tourId) {
//         if (!punto.horariosByTour[tourName]) punto.horariosByTour[tourName] = [];

//         // Formatear HoraSalida a HH:MM (si viene como Date) o usar la cadena completa
//         let timeStr = '';
//         if (row.HoraSalida) {
//           if (row.HoraSalida instanceof Date) {
//             const h = String(row.HoraSalida.getHours()).padStart(2, '0');
//             const m = String(row.HoraSalida.getMinutes()).padStart(2, '0');
//             timeStr = `${h}:${m}`;
//           } else {
//             timeStr = String(row.HoraSalida).trim();
//           }
//         }

//         if (timeStr) punto.horariosByTour[tourName].push(timeStr);
//       }
//     });

//     const tours = Array.from(toursMap.values());

//     const workbook = new excel.Workbook();
//     const worksheet = workbook.addWorksheet('Puntos por Tour');

//     // Definir columnas: Nombre Punto, Sector, luego una columna por tour
//     const columns = [
//       { header: 'NOMBRE PUNTO', key: 'NombrePunto', width: 40 },
//       { header: 'SECTOR', key: 'Sector', width: 20 },
//       ...tours.map((tName, idx) => ({ header: tName, key: `tour_${idx}`, width: 25 }))
//     ];

//     worksheet.columns = columns;

//     // Estilo encabezado
//     const headerStyle = {
//       font: { bold: true },
//       alignment: { vertical: 'middle', horizontal: 'center' },
//       fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B0F0' } },
//       border: {
//         top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
//       }
//     };
//     worksheet.getRow(1).eachCell(cell => Object.assign(cell, headerStyle));

//     // Agregar filas: por cada punto, rellenar columnas de tours con horarios concatenados
//     for (const [idP, data] of puntosMap.entries()) {
//       const rowObj = { NombrePunto: data.NombrePunto, Sector: data.Sector };
//       tours.forEach((tName, idx) => {
//         let times = data.horariosByTour[tName] || [];
//         // Eliminar duplicados
//         times = Array.from(new Set(times));
//         // Intentar ordenar horas en formato HH:MM primero, luego textos (Pendiente, ESTAC, etc.)
//         function toMinutes(s) {
//           const m = s.match(/^(\d{1,2}):(\d{2})$/);
//           if (!m) return null;
//           return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
//         }
//         times.sort((a, b) => {
//           const ma = toMinutes(a);
//           const mb = toMinutes(b);
//           if (ma !== null && mb !== null) return ma - mb;
//           if (ma !== null) return -1;
//           if (mb !== null) return 1;
//           return a.localeCompare(b);
//         });

//         // Unir con salto de línea para que Excel muestre cada horario en nueva línea
//         rowObj[`tour_${idx}`] = times.join('\n');
//       });
//       const added = worksheet.addRow(rowObj);
//       // Habilitar ajuste de texto para celdas de horarios
//       tours.forEach((_, idx) => {
//         const cell = added.getCell(3 + idx);
//         cell.alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
//       });
//     }

//     // Preparar y enviar archivo
//     const buffer = await workbook.xlsx.writeBuffer();
//     const fecha = new Date().toISOString().split('T')[0];
//     res.setHeader('Content-Disposition', `attachment; filename="Puntos_por_Tour_${fecha}.xlsx"`);
//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.send(buffer);
//   });
// });

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


//------------------------------------------Copiar Horarios----------------------------------------
router.post('/copiar-horarios', (req, res) => {
  const { sourceTour, targetTour, horaEspecifica } = req.body;

  const selectQuery = 'SELECT Id_Punto, HoraSalida, Ruta FROM Horarios WHERE Id_Tour = ?';

  connection.query(selectQuery, [sourceTour], (err, horarios) => {
    if (err) {
      console.error(err);
      return res.status(500).json('Error al seleccionar horarios.');
    }

    horarios.forEach((h) => {
      const hora = horaEspecifica || h.HoraSalida;
      const checkQuery = 'SELECT * FROM Horarios WHERE Id_Punto = ? AND Id_Tour = ?';

      connection.query(checkQuery, [h.Id_Punto, targetTour], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json('Error al verificar horarios.');
        }

        if (result.length > 0) {
          // Si ya existe, actualizar el horario
          const updateQuery = 'UPDATE Horarios SET HoraSalida = ? WHERE Id_Punto = ? AND Id_Tour = ?';
          connection.query(updateQuery, [hora, h.Id_Punto, targetTour], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json('Error al actualizar horario.');
            }
          });
        } else {
          // Si no existe, insertar un nuevo registro
          const insertQuery = 'INSERT INTO Horarios (Id_Punto, Id_Tour, HoraSalida, Ruta) VALUES (?, ?, ?)';
          connection.query(insertQuery, [h.Id_Punto, targetTour, hora, h.Ruta], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json('Error al insertar horario.');
            }
          });
        }
      });
    });

    res.status(200).json('Horarios copiados y/o actualizados exitosamente.');
  });
});


//------------------------------------------------------------------------------------------

//-------------------------------------Programacion json-------------------------------------
router.get("/Listado/Listado", (req, res) => {
  const { selectionTour, FechaReserva, FechaRegistro, Ruta, Estado, HoraRegistro, TipoAccion, TipoReserva } = req.query;

  const selectionTourArray = Array.isArray(selectionTour) ? selectionTour : [selectionTour];
  const selectionEstadoArray = Array.isArray(Estado) ? Estado : [Estado];
  const selectionRutaArray = Array.isArray(Ruta) ? Ruta : [Ruta];
  const selectionTipoAccionArray = Array.isArray(TipoAccion) ? TipoAccion : [TipoAccion];

  const filters = [

    FechaReserva && `FechaReserva = "${FechaReserva}"`,
    selectionTour && `TourReserva IN (${selectionTourArray.join("','")})`,
    Ruta && `H.Ruta = "${selectionRutaArray.join("','")}"`,
    Estado && `R.Estado = "${selectionEstadoArray.join("','")}"`,
    FechaRegistro && `History.FechaRegistro = "${FechaRegistro}"`,
    HoraRegistro && `STR_TO_DATE(History.HoraRegistro, '%r') >= STR_TO_DATE("${HoraRegistro}", '%H:%i:%s')`,
    TipoAccion && `History.Accion = "${selectionTipoAccionArray.join("','")}"`,
    TipoReserva && `R.TipoReserva = "${TipoReserva}"`
  ].filter(Boolean);
  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const Listado = `
  SELECT 
    R.*,
    Pt.Posicion, 
    T.NombreTour, 
    H.Ruta,
    Pasajeros.NombrePasajero,
    Pasajeros.IdPas,
    Pasajeros.TelefonoPasajero,
    Pasajeros.PrecioTour
    ${FechaRegistro || HoraRegistro || TipoAccion ? ', History.Accion, History.HoraRegistro, History.FechaRegistro' : ''}
  FROM Reservas AS R 
  LEFT JOIN (
    SELECT 
      Id_Reserva, 
      GROUP_CONCAT(NombrePasajero SEPARATOR ', ') AS NombrePasajero,
      GROUP_CONCAT(IdPas SEPARATOR ', ') AS IdPas,
      GROUP_CONCAT(TelefonoPasajero SEPARATOR ', ') AS TelefonoPasajero,
      GROUP_CONCAT(PrecioTour SEPARATOR ', ') AS PrecioTour
    FROM Pasajeros
    GROUP BY Id_Reserva
  ) AS Pasajeros ON R.Id_Reserva = Pasajeros.Id_Reserva
  LEFT JOIN Tours AS T ON R.TourReserva = T.Id_Tour
  LEFT JOIN Puntos AS Pt ON Pt.Id_Punto = R.Id_Punto
  LEFT JOIN Horarios AS H ON Pt.Id_Punto = H.Id_Punto
${FechaRegistro || HoraRegistro || TipoAccion ? 'LEFT JOIN History ON R.Id_Reserva = History.Id_' : ''}
${whereClause}
  GROUP BY Pasajeros.Id_Reserva ORDER BY Pt.Posicion;`;
  connection.query(Listado, (error, result) => {
    if (error) {
      throw error;
    } else {
      res.json(result);
    }
  });
});

// Función para obtener el nombre del archivo
function getFileName(selectionTour, Fecha, Ruta) {
  return new Promise((resolve, reject) => {
    let fileName = "LISTADO";

    if (selectionTour !== '') {
      const tourQuery = `SELECT NombreTour FROM Tours WHERE Id_Tour = "${selectionTour}"`;
      connection.query(tourQuery, (error, result) => {
        if (error) {
          console.error('Error al ejecutar la consulta:', error);
          return reject('Error al generar el listado. Por favor, inténtelo de nuevo más tarde.');
        }

        if (result.length > 0) {
          fileName += `_${result[0].NombreTour}`;
        }

        if (Fecha) {
          fileName += `_${Fecha}`;
        }
        if (Ruta) {
          fileName += `_${Ruta}`;
        }
        fileName += ".xlsx";

        resolve(fileName);
      });
    } else {
      if (Fecha) {
        fileName += `_${Fecha}`;
      }
      if (Ruta) {
        fileName += `_${Ruta}`;
      }
      fileName += ".xlsx";

      resolve(fileName);
    }
  });
}

// router.get('/Listado/Exportar', (req, res) => {
//   const { selectionTour, FechaReserva, FechaRegistro, Ruta, Estado, HoraRegistro, TipoAccion,TipoReserva } = req.query;
//   const selectionTourArray = Array.isArray(selectionTour) ? selectionTour : [selectionTour];
//   const selectionEstadoArray = Array.isArray(Estado) ? Estado : [Estado];
//   const selectionRutaArray = Array.isArray(Ruta) ? Ruta : [Ruta];
//   const selectionTipoAccionArray = Array.isArray(TipoAccion) ? TipoAccion : [TipoAccion];


//   const filters = [
//     FechaReserva && `FechaReserva = "${FechaReserva}"`,
//     selectionTour && `TourReserva IN (${selectionTourArray.join("','")})`,
//     Ruta && `H.Ruta = "${selectionRutaArray.join("','")}"`,
//     Estado && `R.Estado = "${selectionEstadoArray.join("','")}"`,
//     FechaRegistro && `History.FechaRegistro = "${FechaRegistro}"`,
//     HoraRegistro && `STR_TO_DATE(History.HoraRegistro, '%r') >= STR_TO_DATE("${HoraRegistro}", '%H:%i:%s')`,
//     TipoAccion && `History.Accion = "${selectionTipoAccionArray.join("','")}"`,
//     TipoReserva && `R.TipoReserva = "${TipoReserva}"`
//   ].filter(Boolean);
//   const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

//   getFileName(selectionTour, FechaReserva, Ruta)
//     .then(fileName => {
//       const Listado = `
//         SELECT 
//           R.*,
//           Pt.Posicion, 
//           T.NombreTour, 
//           H.Ruta,
//           Pasajeros.NombrePasajero,
//           Pasajeros.IdPas,
//           Pasajeros.TelefonoPasajero,
//           Pasajeros.PrecioTour
//           ${FechaRegistro || HoraRegistro || TipoAccion ? ', History.Accion, History.HoraRegistro, History.FechaRegistro' : ''}
//         FROM Reservas AS R 
//         INNER JOIN (
//           SELECT 
//             Id_Reserva, 
//             GROUP_CONCAT(NombrePasajero SEPARATOR ', ') AS NombrePasajero,
//             GROUP_CONCAT(IdPas SEPARATOR ', ') AS IdPas,
//             GROUP_CONCAT(TelefonoPasajero SEPARATOR ', ') AS TelefonoPasajero,
//             GROUP_CONCAT(PrecioTour SEPARATOR ', ') AS PrecioTour
//           FROM Pasajeros
//           GROUP BY Id_Reserva
//         ) AS Pasajeros ON R.Id_Reserva = Pasajeros.Id_Reserva
//         LEFT JOIN Tours AS T ON R.TourReserva = T.Id_Tour
//         LEFT JOIN Puntos AS Pt ON Pt.Id_Punto = R.Id_Punto
//         LEFT JOIN Horarios AS H ON Pt.Id_Punto = H.Id_Punto
//         ${FechaRegistro || HoraRegistro || TipoAccion ? 'LEFT JOIN History ON R.Id_Reserva = History.Id_' : ''}
//         ${whereClause}
//         GROUP BY Pasajeros.Id_Reserva ORDER BY Pt.Posicion;`;

//       connection.query(Listado, (error, result) => {
//         if (error) {
//           console.error('Error al ejecutar la consulta:', error);
//           return res.status(500).send('Error al generar el listado. Por favor, inténtelo de nuevo más tarde.');
//         }

//         const workbook = new excel.Workbook();
//         const worksheet = workbook.addWorksheet('Listado');

//         // Definir las columnas del archivo Excel
//         const columns = [
//           { header: 'TOUR', key: 'NombreTour', width: 30 },
//           { header: 'NOMBRE DEL PASAJERO', key: 'NombrePasajero', width: 40 },
//           { header: 'DNI/PASAPORTE', key: 'IdPas', width: 15 },
//           { header: 'TELEFONO', key: 'TelefonoPasajero', width: 20 },
//           { header: '# PAX', key: 'NumeroPasajeros', width: 10 },
//           { header: 'PUNTO DE ENCUENTRO', key: 'PuntoEncuentro', width: 20 },
//           { header: 'OBSERVACIONES', key: 'Observaciones', width: 30 },
//           { header: 'PRECIO', key: 'PrecioTour', width: 15 },
//           { header: 'DOLARES', key: 'Dolares', width: 20 },
//           { header: 'TRANSFER', key: 'Transfer', width: 20 },
//           { header: 'REPORTA', key: 'NombreReporta', width: 20 },
//           { header: 'IDIOMA', key: 'IdiomaReserva', width: 10 },
//           { header: 'TIPO DE RESERVA', key: 'TipoReserva', width: 20 },
//           { header: 'RUTA', key: 'Ruta', width: 10 },
//           { header: 'ESTADO DE RESERVA', key: 'Estado', width: 20 },
//         ];
//         if (FechaRegistro || HoraRegistro || TipoAccion) {
//           columns.push({ header: 'ACCIONES (HISTORIAL)', key: 'Accion', width: 20 });
//         }

//         worksheet.columns = columns;

//         // Definir los estilos de borde
//         const borderStyleThin = {
//           top: { style: 'thin' },
//           left: { style: 'thin' },
//           bottom: { style: 'thin' },
//           right: { style: 'thin' }
//         };

//         // Aplicar estilo a las celdas del encabezado
//         const headerRow = worksheet.getRow(1);
//         headerRow.font = { bold: true };
//         headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
//         headerRow.eachCell({ includeEmpty: true }, (cell) => {
//           cell.border = borderStyleThin;
//         });

//         // Mapa para realizar un seguimiento de las filas combinadas por Id_Reserva
//         const mergedRows = {};

//         // Llenar el archivo Excel con los datos
//         result.forEach(row => {
//           const idReserva = row.Id_Reserva;

//           // Obtener listas separadas por ', ' y dividirlas en arrays
//           const nombresPasajeros = row.NombrePasajero ? row.NombrePasajero.split(', ') : [];
//           const idsPasajeros = row.IdPas ? row.IdPas.split(', ') : [];
//           const telefonosPasajeros = row.TelefonoPasajero ? row.TelefonoPasajero.split(', ') : [];
//           const preciosTour = row.PrecioTour ? row.PrecioTour.split(', ') : [];

//           // Determinar la cantidad de filas que se necesitan
//           const rowCount = Math.max(nombresPasajeros.length, idsPasajeros.length, telefonosPasajeros.length, preciosTour.length);

//           // Añadir filas a la hoja de cálculo
//           for (let i = 0; i < rowCount; i++) {
//             const data = {
//               // Id_Reserva: i === 0 ? idReserva : '', // Mostrar Id_Reserva solo en la primera fila del grupo de pasajeros
//               NombrePasajero: nombresPasajeros[i] || '',
//               IdPas: idsPasajeros[i] || '',
//               TelefonoPasajero: telefonosPasajeros[i] || '',
//               PrecioTour: preciosTour[i] || '',
//               Ruta: row.Ruta
//             };

//             if (i === 0) {
//               // Mostrar los datos generales solo en la primera fila del grupo de pasajeros
//               data.NombreTour = row.NombreTour;
//               data.NumeroPasajeros = row.NumeroPasajeros;
//               data.PuntoEncuentro = row.PuntoEncuentro;
//               data.NombreReporta = row.NombreReporta;
//               data.IdiomaReserva = row.IdiomaReserva;
//               data.Observaciones = row.Observaciones;
//               data.TipoReserva = row.TipoReserva;
//               data.Estado = row.Estado;
//               if (FechaRegistro || HoraRegistro || TipoAccion) {
//                 data.Accion = row.Accion;
//               }
//             }

//             // Agregar la fila al worksheet
//             const newRow = worksheet.addRow(data);
//             // Aplicar borde fino a cada celda en la fila



//             // Si es la primera fila de la reserva, guardar la posición de la fila
//             if (i === 0) {
//               mergedRows[idReserva] = {
//                 start: worksheet.rowCount,
//                 end: worksheet.rowCount
//               };
//             } else {
//               // Si no es la primera fila, incrementar el final de la fusión de celdas
//               mergedRows[idReserva].end = worksheet.rowCount;
//             }
//           }
//         });

//         // Combinar celdas para Id_Reserva según el mapa de filas combinadas
//         Object.keys(mergedRows).forEach(idReserva => {
//           const { start, end } = mergedRows[idReserva];
//           if (start !== end) {
//             // Combinar celdas en las columnas específicas
//             worksheet.mergeCells(`A${start}:A${end}`); // ID RESERVA
//             worksheet.mergeCells(`E${start}:E${end}`); // NUMERO DE PASAJEROS
//             worksheet.mergeCells(`F${start}:F${end}`); // PUNTO DE ENCUENTRO
//             worksheet.mergeCells(`K${start}:K${end}`); // REPORTA
//             worksheet.mergeCells(`L${start}:L${end}`); // IDIOMA
//             worksheet.mergeCells(`G${start}:G${end}`); // OBSERVACIONES
//             worksheet.mergeCells(`M${start}:M${end}`); // TIPO DE RESERVA
//             worksheet.mergeCells(`O${start}:O${end}`); // Estado
//             worksheet.mergeCells(`P${start}:P${end}`); // ACCION

//           }
//         });

//         // Ajustar la alineación vertical y horizontal de las celdas combinadas
//         worksheet.eachRow(row => {
//           row.alignment = { vertical: 'middle', horizontal: 'center' };
//         });

//         // Configurar la respuesta para descargar el archivo Excel
//         res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//         res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
//         // Escribir el archivo Excel y enviarlo como respuesta
//         workbook.xlsx.write(res)
//           .then(() => {
//             res.end();
//           })
//           .catch(err => {
//             console.error('Error al escribir el archivo Excel:', err);
//             res.status(500).send('Error al generar el archivo Excel. Por favor, inténtelo de nuevo más tarde.');
//           });
//       });
//     })
//     .catch(errorMessage => {
//       res.status(500).send(errorMessage);
//     });
// });

router.get('/Listado/Exportar/ReservasNuevo', (req, res) => {
  const { selectionTour, FechaReserva, FechaRegistro, Ruta, Estado, HoraRegistro, TipoAccion } = req.query;
  const selectionTourArray = Array.isArray(selectionTour) ? selectionTour : [selectionTour];
  const selectionEstadoArray = Array.isArray(Estado) ? Estado : [Estado];
  const selectionRutaArray = Array.isArray(Ruta) ? Ruta : [Ruta];
  const selectionTipoAccionArray = Array.isArray(TipoAccion) ? TipoAccion : [TipoAccion];

  const filters = [
    FechaReserva && `FechaReserva = "${FechaReserva}"`,
    selectionTour && `TourReserva IN (${selectionTourArray.join("','")})`,
    Ruta && `H.Ruta = "${selectionRutaArray.join("','")}"`,
    Estado && `R.Estado = "${selectionEstadoArray.join("','")}"`,
    FechaRegistro && `History.FechaRegistro = "${FechaRegistro}"`,
    HoraRegistro && `STR_TO_DATE(History.HoraRegistro, '%r') >= STR_TO_DATE("${HoraRegistro}", '%H:%i:%s')`,
    TipoAccion && `History.Accion = "${selectionTipoAccionArray.join("','")}"`,
  ].filter(Boolean);
  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  getFileName(selectionTour, FechaReserva, Ruta)
    .then(fileName => {
      const ListadoQuery = `
    SELECT 
      R.*,
      Pt.Posicion, 
      T.NombreTour, 
      H.Ruta,
      Pasajeros.NombrePasajero,
      Pasajeros.IdPas,
      Pasajeros.TelefonoPasajero,
      Pasajeros.PrecioTour
      ${FechaRegistro || HoraRegistro || TipoAccion ? ', History.Accion, History.HoraRegistro, History.FechaRegistro' : ''}
    FROM Reservas AS R 
    INNER JOIN (
      SELECT 
        Id_Reserva, 
        GROUP_CONCAT(NombrePasajero SEPARATOR ', ') AS NombrePasajero,
        GROUP_CONCAT(IdPas SEPARATOR ', ') AS IdPas,
        GROUP_CONCAT(TelefonoPasajero SEPARATOR ', ') AS TelefonoPasajero,
        GROUP_CONCAT(PrecioTour SEPARATOR ', ') AS PrecioTour
      FROM Pasajeros
      GROUP BY Id_Reserva
    ) AS Pasajeros ON R.Id_Reserva = Pasajeros.Id_Reserva
    LEFT JOIN Tours AS T ON R.TourReserva = T.Id_Tour
    LEFT JOIN Puntos AS Pt ON Pt.Id_Punto = R.Id_Punto
    LEFT JOIN Horarios AS H ON Pt.Id_Punto = H.Id_Punto
    ${FechaRegistro || HoraRegistro || TipoAccion ? 'LEFT JOIN History ON R.Id_Reserva = History.Id_' : ''}
    ${whereClause}
    GROUP BY Pasajeros.Id_Reserva ORDER BY H.Ruta, Pt.Posicion ;
  `;

      connection.query(ListadoQuery, async (error, result) => {
        if (error) {
          console.error('Error al ejecutar la consulta:', error);
          return res.status(500).send('Error al generar el listado. Por favor, inténtelo de nuevo más tarde.');
        }
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('LISTADO');
        // Estilo común
        const borderStyleThin = { style: 'thin' };

        // Estilo para encabezados
        const headerStyle = {
          font: { bold: true },
          alignment: { vertical: 'middle', horizontal: 'center' },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B0F0' } }, // Fondo azul
        };

        // Fila 1: Fecha y Nombre del Tour
        const fechaTour = FechaReserva ? `Fecha: ${FechaReserva}` : 'Fecha: N/A';
        const nombreTour = result.length > 0 ? [...new Set(result.map(item => item.NombreTour))].join(' - ') : 'Tour: N/A';



        // Definir las columnas del archivo Excel
        const columns = [
          // { header: 'TOUR', key: 'NombreTour', width: 30 },
          { header: 'NOMBRE DEL PASAJERO', key: 'NombrePasajero', width: 40 },
          { header: 'DNI/PASAPORTE', key: 'IdPas', width: 15 },
          { header: 'TELEFONO', key: 'TelefonoPasajero', width: 20 },
          { header: '# PAX', key: 'NumeroPasajeros', width: 10 },
          { header: 'PUNTO DE ENCUENTRO', key: 'PuntoEncuentro', width: 20 },
          { header: 'OBSERVACIONES', key: 'Observaciones', width: 30 },
          { header: 'PRECIO', key: 'PrecioTour', width: 15 },
          { header: 'PAGO AGENCIA', key: 'PagoAgencia', width: 20 },
          { header: 'DOLARES', key: 'Dolares', width: 20 },
          { header: 'TRANSFER', key: 'Transfer', width: 20 },
          { header: 'REPORTA', key: 'NombreReporta', width: 20 },
          { header: 'IDIOMA', key: 'IdiomaReserva', width: 10 },
          { header: 'TIPO DE RESERVA', key: 'TipoReserva', width: 20 },
          { header: 'RUTA', key: 'Ruta', width: 10 },
          { header: 'ESTADO DE RESERVA', key: 'Estado', width: 20 },
        ];
        if (FechaRegistro || HoraRegistro || TipoAccion) {
          columns.push({ header: 'ACCIONES (HISTORIAL)', key: 'Accion', width: 20 });
        }

        worksheet.columns = columns;

        // Ajusta el ancho de las columnas según sea necesario
        worksheet.getColumn(1).width = 40; // Columna para la fecha
        worksheet.getColumn(2).width = 30; // Columna para el nombre del tour

        // Celda para la fecha (columna A)
        const headerRowDate = worksheet.getCell(1, 1); // Selecciona la celda para la fecha
        headerRowDate.value = fechaTour; // Asigna la fecha
        headerRowDate.alignment = { vertical: 'middle', horizontal: 'center' }; // Centrar el texto
        headerRowDate.font = { bold: true }; // Negrita para el texto
        headerRowDate.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF00B0F0' }, // Fondo azul
        };
        headerRowDate.border = {
          top: borderStyleThin,
          left: borderStyleThin,
          bottom: borderStyleThin,
          right: borderStyleThin,
        };


        // Inicializar el texto enriquecido con negrita siempre
        let richText = [{ text: nombreTour, font: { bold: true } }];

        // Si "RIO CLARO" está presente, aplicar formato especial solo a ese texto
        if (nombreTour.includes("RIO CLARO")) {
          const parts = nombreTour.split("RIO CLARO");
          richText = [];

          // Agregar la primera parte con negrita
          if (parts[0]) {
            richText.push({ text: parts[0], font: { bold: true } });
          }

          // Agregar "RIO CLARO" en verde y negrita
          richText.push({ text: "RIO CLARO", font: { bold: true, color: { argb: "FF00FF00" } } });

          // Agregar la parte restante con negrita
          if (parts[1]) {
            richText.push({ text: parts[1], font: { bold: true } });
          }
        }

        // Asignar el texto enriquecido a la celda
        const headerRowTour = worksheet.getCell(1, 2);
        headerRowTour.value = { richText };

        // Unificar celdas desde la columna B hasta la última columna
        worksheet.mergeCells(1, 2, 1, columns.length);

        // Aplicar alineación y bordes
        headerRowTour.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRowTour.border = {
          top: borderStyleThin,
          left: borderStyleThin,
          bottom: borderStyleThin,
          right: borderStyleThin,
        };

        // Configuración de la fila 2
        const headerRow2 = worksheet.getRow(2);
        headerRow2.values = columns.map(col => col.header);
        headerRow2.eachCell(cell => {
          cell.font = { bold: true };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B0F0' } }; // Fondo azul
          cell.border = {
            top: borderStyleThin,
            left: borderStyleThin,
            bottom: borderStyleThin,
            right: borderStyleThin,
          };
        });
        let rutaActual = null;
        let totalPasajerosRuta = 0;

        result.forEach((row, index) => {
          if (rutaActual !== row.Ruta && rutaActual !== null) {
            // Insertar fila con el total de pasajeros para la ruta anterior
            const totalRowIndex = worksheet.rowCount + 1;
            const totalRow = worksheet.getRow(totalRowIndex);

            totalRow.getCell(4).value = totalPasajerosRuta; // Columna de # PAX
            totalRow.getCell(4).font = { bold: true, color: { argb: 'FFFF0000' } };
            totalRow.getCell(4).alignment = { vertical: 'middle', horizontal: 'center' };
            totalRow.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDDDDD' } };

            totalRow.getCell(1).value = `Total Ruta ${rutaActual}`;
            totalRow.getCell(1).font = { bold: true };
            totalRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
            totalRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDDDDD' } };

            // 🔹 Aplicar bordes a toda la fila de total de la ruta
            for (let col = 1; col <= worksheet.columnCount; col++) {
              const cell = totalRow.getCell(col);
              cell.border = {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
              };
            }

            totalPasajerosRuta = 0; // Reset contador para la nueva ruta
          }


          // Actualizar la ruta actual
          rutaActual = row.Ruta;

          // Contar pasajeros para esta ruta
          const numPasajeros = row.NumeroPasajeros ? parseInt(row.NumeroPasajeros, 10) : 0;
          totalPasajerosRuta += numPasajeros;

          // Agregar filas de datos normales
          const nombresPasajeros = row.NombrePasajero ? row.NombrePasajero.split(', ') : [];
          const idsPasajeros = row.IdPas ? row.IdPas.split(', ') : [];
          const telefonosPasajeros = row.TelefonoPasajero ? row.TelefonoPasajero.split(', ') : [];
          const preciosTour = row.PrecioTour ? row.PrecioTour.split(', ') : [];

          const startRow = worksheet.rowCount + 1;

          nombresPasajeros.forEach((nombre, index) => {
            const data = {
              NombrePasajero: nombre,
              IdPas: idsPasajeros[index] || '',
              TelefonoPasajero: telefonosPasajeros[index] || '',
              PrecioTour: preciosTour[index] || '',
            };

            if (index === 0) {
              Object.assign(data, {
                PuntoEncuentro: row.PuntoEncuentro,
                NumeroPasajeros: row.NumeroPasajeros,
                NombreReporta: row.NombreReporta,
                IdiomaReserva: row.IdiomaReserva,
                Observaciones: row.Observaciones,
                PagoAgencia: row.PagoAgencia,
                TipoReserva: row.TipoReserva,
                Estado: row.Estado,
                Ruta: row.Ruta,
              });
              if (FechaRegistro || HoraRegistro || TipoAccion) {
                data.Accion = row.Accion;
              }
            }
            const newRow = worksheet.addRow(data);
            // Si el tour es "RIO CLARO", el nombre del pasajero se pone en rojo
            if (row.TourReserva === 1) {
              const nombrePasajeroCell = newRow.getCell(1); // Columna "NOMBRE DEL PASAJERO"
              nombrePasajeroCell.font = { bold: true, color: { argb: 'FF00FF00' } }; // Texto en rojo
            }

            // Aplicar color rojo si el idioma es "Inglés"
            if (row.IdiomaReserva && row.IdiomaReserva === "INGLÉS") {
              const idiomaCell = newRow.getCell(11); // Columna 12 corresponde a "IDIOMA"
              idiomaCell.font = { bold: true, color: { argb: 'FFFF0000' } };
            }
          });

          const endRow = worksheet.rowCount;

          // Combinar celdas para datos generales
          worksheet.mergeCells(`D${startRow}:D${endRow}`);
          worksheet.mergeCells(`E${startRow}:E${endRow}`);
          worksheet.mergeCells(`F${startRow}:F${endRow}`);
          worksheet.mergeCells(`K${startRow}:K${endRow}`);
          worksheet.mergeCells(`L${startRow}:L${endRow}`);
          worksheet.mergeCells(`M${startRow}:M${endRow}`);
          worksheet.mergeCells(`N${startRow}:N${endRow}`);
          worksheet.mergeCells(`O${startRow}:O${endRow}`);
          worksheet.mergeCells(`P${startRow}:P${endRow}`);

          aplicarBordesBloque(worksheet, startRow, endRow, 1, columns.length);
        });

        // Agregar la última fila de total de la última ruta
        if (rutaActual !== null) {
          const totalRowIndex = worksheet.rowCount + 1;
          const totalRow = worksheet.getRow(totalRowIndex);

          totalRow.getCell(4).value = totalPasajerosRuta; // Total de la última ruta
          totalRow.getCell(4).font = { bold: true, color: { argb: 'FFFF0000' } };
          totalRow.getCell(4).alignment = { vertical: 'middle', horizontal: 'center' };
          totalRow.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDDDDD' } };
          totalRow.getCell(4).border = { top: { style: 'thin' }, bottom: { style: 'thin' } };

          totalRow.getCell(1).value = `Total Ruta ${rutaActual}`;
          totalRow.getCell(1).font = { bold: true };
          totalRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
          totalRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDDDDD' } };
          totalRow.getCell(1).border = { top: { style: 'thin' }, bottom: { style: 'thin' } };

          worksheet.addRow({});
        }
        // Calcular el total de pasajeros
        const totalPasajeros = result.reduce((total, row) => {
          const pasajeros = row.NumeroPasajeros ? parseInt(row.NumeroPasajeros, 10) : 0;
          return total + pasajeros;
        }, 0);

        // Agregar una fila al final con el total de pasajeros
        const totalRowIndex = worksheet.rowCount + 1; // Índice de la nueva fila
        const totalRow = worksheet.getRow(totalRowIndex);

        totalRow.getCell(4).value = totalPasajeros; // Columna de # PAX
        totalRow.getCell(4).font = { bold: true }; // Texto en negrita
        totalRow.getCell(4).alignment = { vertical: 'middle', horizontal: 'center' }; // Centrar texto
        totalRow.getCell(4).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFF' }, // Fondo blanco
        };
        totalRow.getCell(4).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };

        // Agregar texto "Total de Pasajeros" en la primera celda de la fila
        totalRow.getCell(1).value = 'Total de Pasajeros';
        totalRow.getCell(1).font = { bold: true };
        totalRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
        totalRow.getCell(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFF' }, // Fondo blanco
        };
        totalRow.getCell(1).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };

        // Ajustar alturas de las filas si es necesario
        totalRow.height = 20; // Ajustar la altura de la fila

        // Ajustar la alineación vertical y horizontal de las celdas combinadas
        worksheet.eachRow(row => {
          row.alignment = { vertical: 'middle', horizontal: 'center' };
        });
        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(buffer);
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error al generar el archivo.');
    });
});

// Función para aplicar bordes solo a la primera y última fila de un bloque
function aplicarBordesBloque(worksheet, startRow, endRow, startColumn, endColumn) {
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startColumn; col <= endColumn; col++) {
      const cell = worksheet.getCell(row, col);
      cell.border = {
        left: { style: 'thin' },
        right: { style: 'thin' },
        ...(row === startRow ? { top: { style: 'thin' } } : {}), // Borde superior solo para la fila inicial
        ...(row === endRow ? { bottom: { style: 'thin' } } : {}), // Borde inferior solo para la fila final
      };
    }
  }
}

router.get('/abonos/abonos', (req, res) => {
  const { fecha } = req.query;
  var sql;
  console.log(fecha);
  if (!fecha) {
    sql = `SELECT FechaReserva, Id_Reserva, NombreReporta, TotalPasajeros, PagoAgencia FROM Reservas WHERE PagoAgencia > 0`;
  } else {
    sql = `SELECT FechaReserva, Id_Reserva, NombreReporta, TotalPasajeros, PagoAgencia FROM Reservas WHERE PagoAgencia > 0 AND FechaReserva = '${fecha}'`;
  }
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ error: 'Error al obtener los abonos' });
      return;
    }
    res.json(results); // Envia los resultados de la consulta como respuesta
    console.log(results);
  });

})

router.get('/abonos/pagoAgencia', (req, res) => {
  const Id_Reserva = req.query.Id_Reserva;

  const sql = `UPDATE Reservas SET PagoAgencia = 0 WHERE Id_Reserva = ?`;
  connection.query(sql, [Id_Reserva], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ success: false, error: 'Error al actualizar el pago de la agencia' });
      return;
    }

    // Si affectedRows > 0 significa que sí actualizó algo
    res.json({
      success: results.affectedRows > 0,
      affectedRows: results.affectedRows
    });
  });
});


router.get('/abonos/exportar', (req, res) => {
  const { fecha } = req.query;

  let sql = `SELECT FechaReserva, Id_Reserva, NombreReporta, TotalPasajeros, PagoAgencia FROM Reservas WHERE PagoAgencia > 0`;
  let params = [];

  if (fecha) {
    sql += ` AND FechaReserva = ?`;
    params.push(fecha);
  }

  connection.query(sql, params, async (err, result) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      return res.status(500).send('Error al generar el archivo.');
    }

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Abonos');

    worksheet.columns = [
      { header: 'FECHA DEL TOUR', key: 'FechaReserva', width: 15 },
      { header: 'ID RESERVA', key: 'Id_Reserva', width: 20 },
      { header: 'REPORTA', key: 'NombreReporta', width: 30 },
      { header: '#PAX', key: 'TotalPasajeros', width: 15 },
      { header: 'PAGO AGENCIA', key: 'PagoAgencia', width: 15 }
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center' };

    result.forEach(row => {
      worksheet.addRow({
        FechaReserva: row.FechaReserva,
        Id_Reserva: row.Id_Reserva,
        NombreReporta: row.NombreReporta,
        TotalPasajeros: row.TotalPasajeros,
        PagoAgencia: row.PagoAgencia
      });
    });

    worksheet.getColumn('PagoAgencia').numFmt = '#,##0';

    worksheet.eachRow({ includeEmpty: true }, row => {
      row.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    // Construir el nombre del archivo
    let fileName = 'Abonos.xlsx';
    if (fecha) {
      fileName = `Abonos_${fecha}.xlsx`;
    }

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(buffer);
  });
});




// router.get('/Listado/Exportar/Grupales_Privadas', (req, res) => {
//   const { selectionTour, FechaReserva, FechaRegistro, Ruta, Estado, HoraRegistro, TipoAccion } = req.query;
//   const selectionTourArray = Array.isArray(selectionTour) ? selectionTour : [selectionTour];
//   const selectionEstadoArray = Array.isArray(Estado) ? Estado : [Estado];
//   const selectionRutaArray = Array.isArray(Ruta) ? Ruta : [Ruta];
//   const selectionTipoAccionArray = Array.isArray(TipoAccion) ? TipoAccion : [TipoAccion];

//   const filters = [
//     FechaReserva && `FechaReserva = "${FechaReserva}"`,
//     selectionTour && `TourReserva IN (${selectionTourArray.join("','")})`,
//     Ruta && `H.Ruta = "${selectionRutaArray.join("','")}"`,
//     Estado && `R.Estado = "${selectionEstadoArray.join("','")}"`,
//     FechaRegistro && `History.FechaRegistro = "${FechaRegistro}"`,
//     HoraRegistro && `STR_TO_DATE(History.HoraRegistro, '%r') >= STR_TO_DATE("${HoraRegistro}", '%H:%i:%s')`,
//     TipoAccion && `History.Accion = "${selectionTipoAccionArray.join("','")}"`,
//   ].filter(Boolean);
//   const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

//   getFileName(selectionTour, FechaReserva, Ruta)
//     .then(fileName => {
//       const ListadoQuery = `
//     SELECT 
//       R.*,
//       Pt.Posicion, 
//       T.NombreTour, 
//       H.Ruta,
//       Pasajeros.NombrePasajero,
//       Pasajeros.IdPas,
//       Pasajeros.TelefonoPasajero,
//       Pasajeros.PrecioTour
//       ${FechaRegistro || HoraRegistro || TipoAccion ? ', History.Accion, History.HoraRegistro, History.FechaRegistro' : ''}
//     FROM Reservas AS R 
//     INNER JOIN (
//       SELECT 
//         Id_Reserva, 
//         GROUP_CONCAT(NombrePasajero SEPARATOR ', ') AS NombrePasajero,
//         GROUP_CONCAT(IdPas SEPARATOR ', ') AS IdPas,
//         GROUP_CONCAT(TelefonoPasajero SEPARATOR ', ') AS TelefonoPasajero,
//         GROUP_CONCAT(PrecioTour SEPARATOR ', ') AS PrecioTour
//       FROM Pasajeros
//       GROUP BY Id_Reserva
//     ) AS Pasajeros ON R.Id_Reserva = Pasajeros.Id_Reserva
//     LEFT JOIN Tours AS T ON R.TourReserva = T.Id_Tour
//     LEFT JOIN Puntos AS Pt ON Pt.Id_Punto = R.Id_Punto
//     LEFT JOIN Horarios AS H ON Pt.Id_Punto = H.Id_Punto
//     ${FechaRegistro || HoraRegistro || TipoAccion ? 'LEFT JOIN History ON R.Id_Reserva = History.Id_' : ''}
//     ${whereClause}
//     GROUP BY Pasajeros.Id_Reserva ORDER BY Pt.Posicion;
//   `;
//       console.log(ListadoQuery);
//       connection.query(ListadoQuery, async (error, result) => {
//         if (error) {
//           console.error('Error al ejecutar la consulta:', error);
//           return res.status(500).send('Error al generar el listado. Por favor, inténtelo de nuevo más tarde.');
//         }
//         console.log(result);
//         const workbook = new excel.Workbook();
//         const worksheet = workbook.addWorksheet('LISTADO');
//         // Definir las columnas del archivo Excel
//         const columns = [
//           { header: 'TOUR', key: 'NombreTour', width: 30 },
//           { header: 'NOMBRE DEL PASAJERO', key: 'NombrePasajero', width: 40 },
//           { header: 'DNI/PASAPORTE', key: 'IdPas', width: 15 },
//           { header: 'TELEFONO', key: 'TelefonoPasajero', width: 20 },
//           { header: '# PAX', key: 'NumeroPasajeros', width: 10 },
//           { header: 'PUNTO DE ENCUENTRO', key: 'PuntoEncuentro', width: 20 },
//           { header: 'OBSERVACIONES', key: 'Observaciones', width: 30 },
//           { header: 'PRECIO', key: 'PrecioTour', width: 15 },
//           { header: 'DOLARES', key: 'Dolares', width: 20 },
//           { header: 'TRANSFER', key: 'Transfer', width: 20 },
//           { header: 'REPORTA', key: 'NombreReporta', width: 20 },
//           { header: 'IDIOMA', key: 'IdiomaReserva', width: 10 },
//           { header: 'TIPO DE RESERVA', key: 'TipoReserva', width: 20 },
//           { header: 'RUTA', key: 'Ruta', width: 10 },
//           { header: 'ESTADO DE RESERVA', key: 'Estado', width: 20 },
//         ];
//         if (FechaRegistro || HoraRegistro || TipoAccion) {
//           columns.push({ header: 'ACCIONES (HISTORIAL)', key: 'Accion', width: 20 });
//         }

//         worksheet.columns = columns;

//         // Definir los estilos de borde
//         const borderStyleThin = {
//           top: { style: 'thin' },
//           left: { style: 'thin' },
//           bottom: { style: 'thin' },
//           right: { style: 'thin' }
//         };

//         // Aplicar estilo a las celdas del encabezado
//         const headerRow = worksheet.getRow(1);
//         headerRow.font = { bold: true };
//         headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
//         headerRow.eachCell({ includeEmpty: true }, (cell) => {
//           cell.border = borderStyleThin;
//         });

//         // Mapa para realizar un seguimiento de las filas combinadas por Id_Reserva
//         const mergedRows = {};

//         // Llenar el archivo Excel con los datos
//         result.forEach(row => {
//           const idReserva = row.Id_Reserva;

//           // Obtener listas separadas por ', ' y dividirlas en arrays
//           const nombresPasajeros = row.NombrePasajero ? row.NombrePasajero.split(', ') : [];
//           const idsPasajeros = row.IdPas ? row.IdPas.split(', ') : [];
//           const telefonosPasajeros = row.TelefonoPasajero ? row.TelefonoPasajero.split(', ') : [];
//           const preciosTour = row.PrecioTour ? row.PrecioTour.split(', ') : [];

//           // Determinar la cantidad de filas que se necesitan
//           const rowCount = Math.max(nombresPasajeros.length, idsPasajeros.length, telefonosPasajeros.length, preciosTour.length);

//           // Añadir filas a la hoja de cálculo
//           for (let i = 0; i < rowCount; i++) {
//             const data = {
//               // Id_Reserva: i === 0 ? idReserva : '', // Mostrar Id_Reserva solo en la primera fila del grupo de pasajeros
//               NombrePasajero: nombresPasajeros[i] || '',
//               IdPas: idsPasajeros[i] || '',
//               TelefonoPasajero: telefonosPasajeros[i] || '',
//               PrecioTour: preciosTour[i] || '',
//               Ruta: row.Ruta
//             };

//             if (i === 0) {
//               // Mostrar los datos generales solo en la primera fila del grupo de pasajeros
//               data.NombreTour = row.NombreTour;
//               data.NumeroPasajeros = row.NumeroPasajeros;
//               data.PuntoEncuentro = row.PuntoEncuentro;
//               data.NombreReporta = row.NombreReporta;
//               data.IdiomaReserva = row.IdiomaReserva;
//               data.Observaciones = row.Observaciones;
//               data.TipoReserva = row.TipoReserva;
//               data.Estado = row.Estado;
//               if (FechaRegistro || HoraRegistro || TipoAccion) {
//                 data.Accion = row.Accion;
//               }
//             }

//             // Agregar la fila al worksheet
//             const newRow = worksheet.addRow(data);
//             // Aplicar borde fino a cada celda en la fila



//             // Si es la primera fila de la reserva, guardar la posición de la fila
//             if (i === 0) {
//               mergedRows[idReserva] = {
//                 start: worksheet.rowCount,
//                 end: worksheet.rowCount
//               };
//             } else {
//               // Si no es la primera fila, incrementar el final de la fusión de celdas
//               mergedRows[idReserva].end = worksheet.rowCount;
//             }
//           }
//         });

//         // Combinar celdas para Id_Reserva según el mapa de filas combinadas
//         Object.keys(mergedRows).forEach(idReserva => {
//           const { start, end } = mergedRows[idReserva];
//           if (start !== end) {
//             // Combinar celdas en las columnas específicas
//             worksheet.mergeCells(`A${start}:A${end}`); // ID RESERVA
//             worksheet.mergeCells(`E${start}:E${end}`); // NUMERO DE PASAJEROS
//             worksheet.mergeCells(`F${start}:F${end}`); // PUNTO DE ENCUENTRO
//             worksheet.mergeCells(`K${start}:K${end}`); // REPORTA
//             worksheet.mergeCells(`L${start}:L${end}`); // IDIOMA
//             worksheet.mergeCells(`G${start}:G${end}`); // OBSERVACIONES
//             worksheet.mergeCells(`M${start}:M${end}`); // TIPO DE RESERVA
//             worksheet.mergeCells(`O${start}:O${end}`); // Estado
//             worksheet.mergeCells(`P${start}:P${end}`); // ACCION

//           }
//         });

//         // Ajustar la alineación vertical y horizontal de las celdas combinadas
//         worksheet.eachRow(row => {
//           row.alignment = { vertical: 'middle', horizontal: 'center' };
//         });

//         const buffer = await workbook.xlsx.writeBuffer();
//         res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
//         res.send(buffer);

//       });
//     }).catch(err => {
//       console.error(err);
//       res.status(500).send('Error al generar el archivo.');
//     });
// });

router.get('/Listado/Exportar/Reservas', (req, res) => {
  const { selectionTour, FechaReserva, FechaRegistro, Ruta, Estado, HoraRegistro, TipoAccion } = req.query;
  const selectionTourArray = Array.isArray(selectionTour) ? selectionTour : [selectionTour];
  const selectionEstadoArray = Array.isArray(Estado) ? Estado : [Estado];
  const selectionRutaArray = Array.isArray(Ruta) ? Ruta : [Ruta];
  const selectionTipoAccionArray = Array.isArray(TipoAccion) ? TipoAccion : [TipoAccion];

  const filters = [
    FechaReserva && `FechaReserva = "${FechaReserva}"`,
    selectionTour && `TourReserva IN (${selectionTourArray.join("','")})`,
    Ruta && `H.Ruta = "${selectionRutaArray.join("','")}"`,
    Estado && `R.Estado = "${selectionEstadoArray.join("','")}"`,
    FechaRegistro && `History.FechaRegistro = "${FechaRegistro}"`,
    HoraRegistro && `STR_TO_DATE(History.HoraRegistro, '%r') >= STR_TO_DATE("${HoraRegistro}", '%H:%i:%s')`,
    TipoAccion && `History.Accion = "${selectionTipoAccionArray.join("','")}"`,
  ].filter(Boolean);
  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  getFileName(selectionTour, FechaReserva, Ruta)
    .then(fileName => {
      const ListadoQuery = `
    SELECT 
      R.*,
      Pt.Posicion, 
      T.NombreTour, 
      H.Ruta,
      Pasajeros.NombrePasajero,
      Pasajeros.IdPas,
      Pasajeros.TelefonoPasajero,
      Pasajeros.PrecioTour
      ${FechaRegistro || HoraRegistro || TipoAccion ? ', History.Accion, History.HoraRegistro, History.FechaRegistro' : ''}
    FROM Reservas AS R 
    INNER JOIN (
      SELECT 
        Id_Reserva, 
        GROUP_CONCAT(NombrePasajero SEPARATOR ', ') AS NombrePasajero,
        GROUP_CONCAT(IdPas SEPARATOR ', ') AS IdPas,
        GROUP_CONCAT(TelefonoPasajero SEPARATOR ', ') AS TelefonoPasajero,
        GROUP_CONCAT(PrecioTour SEPARATOR ', ') AS PrecioTour
      FROM Pasajeros
      GROUP BY Id_Reserva
    ) AS Pasajeros ON R.Id_Reserva = Pasajeros.Id_Reserva
    LEFT JOIN Tours AS T ON R.TourReserva = T.Id_Tour
    LEFT JOIN Puntos AS Pt ON Pt.Id_Punto = R.Id_Punto
    LEFT JOIN Horarios AS H ON Pt.Id_Punto = H.Id_Punto
    ${FechaRegistro || HoraRegistro || TipoAccion ? 'LEFT JOIN History ON R.Id_Reserva = History.Id_' : ''}
    ${whereClause}

    GROUP BY Pasajeros.Id_Reserva ORDER BY H.Ruta, Pt.Posicion;
  `;

      connection.query(ListadoQuery, async (error, result) => {
        if (error) {
          console.error('Error al ejecutar la consulta:', error);
          return res.status(500).send('Error al generar el listado. Por favor, inténtelo de nuevo más tarde.');
        }
        console.log(result);
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('LISTADO');
        // Definir las columnas del archivo Excel
        const columns = [
          { header: 'TOUR', key: 'NombreTour', width: 30 },
          { header: 'NOMBRE DEL PASAJERO', key: 'NombrePasajero', width: 40 },
          { header: 'DNI/PASAPORTE', key: 'IdPas', width: 15 },
          { header: 'TELEFONO', key: 'TelefonoPasajero', width: 20 },
          { header: 'TELEFONO RESERVA', key: 'TelefonoReserva', width: 20 },
          { header: '# PAX', key: 'NumeroPasajeros', width: 10 },
          { header: 'PUNTO DE ENCUENTRO', key: 'PuntoEncuentro', width: 20 },
          { header: 'OBSERVACIONES', key: 'Observaciones', width: 30 },
          { header: 'PRECIO', key: 'PrecioTour', width: 15 },
          { header: 'DOLARES', key: 'Dolares', width: 20 },
          { header: 'TRANSFER', key: 'Transfer', width: 20 },
          { header: 'REPORTA', key: 'NombreReporta', width: 20 },
          { header: 'IDIOMA', key: 'IdiomaReserva', width: 10 },
          { header: 'TIPO DE RESERVA', key: 'TipoReserva', width: 20 },
          { header: 'RUTA', key: 'Ruta', width: 10 },
          { header: 'ESTADO DE RESERVA', key: 'Estado', width: 20 },
        ];
        if (FechaRegistro || HoraRegistro || TipoAccion) {
          columns.push({ header: 'ACCIONES (HISTORIAL)', key: 'Accion', width: 20 });
        }
        columns.push({ header: 'CATEGORIA', key: 'CategoriaReserva', width: 20 });

        worksheet.columns = columns;

        // Definir los estilos de borde
        const borderStyleThin = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };

        // Aplicar estilo a las celdas del encabezado
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = borderStyleThin;
        });

        // Mapa para realizar un seguimiento de las filas combinadas por Id_Reserva
        const mergedRows = {};

        // Llenar el archivo Excel con los datos
        result.forEach(row => {
          const idReserva = row.Id_Reserva;

          // Obtener listas separadas por ', ' y dividirlas en arrays
          const nombresPasajeros = row.NombrePasajero ? row.NombrePasajero.split(', ') : [];
          const idsPasajeros = row.IdPas ? row.IdPas.split(', ') : [];
          const telefonosPasajeros = row.TelefonoPasajero ? row.TelefonoPasajero.split(', ') : [];
          const preciosTour = row.PrecioTour ? row.PrecioTour.split(', ') : [];

          // Determinar la cantidad de filas que se necesitan
          const rowCount = Math.max(nombresPasajeros.length, idsPasajeros.length, telefonosPasajeros.length, preciosTour.length);
          const startRow = worksheet.rowCount + 1; // Primera fila del bloque
          // Añadir filas a la hoja de cálculo
          for (let i = 0; i < rowCount; i++) {
            const data = {
              // Id_Reserva: i === 0 ? idReserva : '', // Mostrar Id_Reserva solo en la primera fila del grupo de pasajeros
              NombrePasajero: nombresPasajeros[i] || '',
              IdPas: idsPasajeros[i] || '',
              TelefonoPasajero: telefonosPasajeros[i] || '',
              PrecioTour: preciosTour[i] || '',
              Ruta: row.Ruta
            };

            if (i === 0) {
              // Mostrar los datos generales solo en la primera fila del grupo de pasajeros
              data.NombreTour = row.NombreTour;
              data.TelefonoReserva = row.TelefonoReserva;
              data.NumeroPasajeros = row.NumeroPasajeros;
              data.PuntoEncuentro = row.PuntoEncuentro;
              data.NombreReporta = row.NombreReporta;
              data.IdiomaReserva = row.IdiomaReserva;
              data.Observaciones = row.Observaciones;
              data.TipoReserva = row.TipoReserva;
              data.Estado = row.Estado;
              if (FechaRegistro || HoraRegistro || TipoAccion) {
                data.Accion = row.Accion;
              }
              data.CategoriaReserva = row.CategoriaReserva;
            }

            // Agregar la fila al worksheet
            const newRow = worksheet.addRow(data);
            // Aplicar color rojo si el idioma es "Inglés"
            if (row.IdiomaReserva && row.IdiomaReserva === "INGLÉS") {
              const idiomaCell = newRow.getCell(13); // Columna 13 corresponde a "IDIOMA"
              idiomaCell.font = { bold: true, color: { argb: 'FFFF0000' } };
            }
            // Aplicar borde fino a cada celda en la fila
            const endRow = worksheet.rowCount; // Última fila del bloque


            // Si es la primera fila de la reserva, guardar la posición de la fila
            if (i === 0) {
              mergedRows[idReserva] = {
                start: worksheet.rowCount,
                end: worksheet.rowCount
              };
            } else {
              // Si no es la primera fila, incrementar el final de la fusión de celdas
              mergedRows[idReserva].end = worksheet.rowCount;
            }
            aplicarBordesBloque(worksheet, startRow, endRow, 1, columns.length);
          }
        });

        // Combinar celdas para Id_Reserva según el mapa de filas combinadas
        Object.keys(mergedRows).forEach(idReserva => {
          const { start, end } = mergedRows[idReserva];
          if (start !== end) {
            // Combinar celdas en las columnas específicas
            worksheet.mergeCells(`A${start}:A${end}`); // ID RESERVA
            worksheet.mergeCells(`E${start}:E${end}`); // TELEFONO RESERVA
            worksheet.mergeCells(`F${start}:F${end}`); // NUMERO DE PASAJEROS
            worksheet.mergeCells(`G${start}:G${end}`); // PUNTO DE ENCUENTRO
            worksheet.mergeCells(`L${start}:L${end}`); // REPORTA
            worksheet.mergeCells(`M${start}:M${end}`); // IDIOMA
            worksheet.mergeCells(`H${start}:H${end}`); // OBSERVACIONES
            worksheet.mergeCells(`N${start}:N${end}`); // TIPO DE RESERVA
            worksheet.mergeCells(`P${start}:P${end}`); // Estado
            if (FechaRegistro || HoraRegistro || TipoAccion) {
              worksheet.mergeCells(`Q${start}:Q${end}`); // ACCION
              worksheet.mergeCells(`R${start}:R${end}`); // CATEGORIA
            } else {
              worksheet.mergeCells(`Q${start}:Q${end}`); // CATEGORIA
            }

          }
        });

        // Ajustar la alineación vertical y horizontal de las celdas combinadas
        worksheet.eachRow(row => {
          row.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(buffer);

      });
    }).catch(err => {
      console.error(err);
      res.status(500).send('Error al generar el archivo.');
    });
});

// function aplicarBordesBloque(worksheet, startRow, endRow, startColumn, endColumn) {
//   // Borde superior (primera fila del bloque)
//   for (let col = startColumn; col <= endColumn; col++) {
//     worksheet.getCell(startRow, col).border = {
//       top: { style: 'thin' },
//       ...(col === startColumn ? { left: { style: 'thin' } } : {}),
//       ...(col === endColumn ? { right: { style: 'thin' } } : {}),
//     };
//   }

//   // Borde inferior (última fila del bloque)
//   for (let col = startColumn; col <= endColumn; col++) {
//     worksheet.getCell(endRow, col).border = {
//       bottom: { style: 'thin' },
//       ...(col === startColumn ? { left: { style: 'thin' } } : {}),
//       ...(col === endColumn ? { right: { style: 'thin' } } : {}),
//     };
//   }

//   // Borde izquierdo y derecho para las filas intermedias
//   for (let row = startRow + 1; row < endRow; row++) {
//     worksheet.getCell(row, startColumn).border = { left: { style: 'thin' } };
//     worksheet.getCell(row, endColumn).border = { right: { style: 'thin' } };
//   }
// }

router.get('/Listado/Exportar/Privadas', (req, res) => {
  const { selectionTour, FechaReserva, FechaRegistro, Ruta, Estado, HoraRegistro, TipoAccion } = req.query;
  const selectionTourArray = Array.isArray(selectionTour) ? selectionTour : [selectionTour];
  const selectionEstadoArray = Array.isArray(Estado) ? Estado : [Estado];
  const selectionRutaArray = Array.isArray(Ruta) ? Ruta : [Ruta];
  const selectionTipoAccionArray = Array.isArray(TipoAccion) ? TipoAccion : [TipoAccion];

  const filters = [
    FechaReserva && `FechaReserva = "${FechaReserva}"`,
    selectionTour && `TourReserva IN (${selectionTourArray.map(tour => `'${tour}'`).join(',')})`,
    Ruta && `H.Ruta IN (${selectionRutaArray.map(ruta => `'${ruta}'`).join(',')})`,
    Estado && `R.Estado IN (${selectionEstadoArray.map(estado => `'${estado}'`).join(',')})`,
    FechaRegistro && `History.FechaRegistro = "${FechaRegistro}"`,
    HoraRegistro && `STR_TO_DATE(History.HoraRegistro, '%r') >= STR_TO_DATE("${HoraRegistro}", '%H:%i:%s')`,
    TipoAccion && `History.Accion IN (${selectionTipoAccionArray.map(accion => `'${accion}'`).join(',')})`,
  ].filter(Boolean);
  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const ListadoQuery = `
      SELECT 
        R.*,
        Pt.Posicion, 
        T.NombreTour, 
        H.Ruta,
        Pasajeros.NombrePasajero,
        Pasajeros.IdPas,
        Pasajeros.TelefonoPasajero,
        Pasajeros.PrecioTour
        ${FechaRegistro || HoraRegistro || TipoAccion ? ', History.Accion, History.HoraRegistro, History.FechaRegistro' : ''}
      FROM Reservas AS R 
      INNER JOIN (
        SELECT 
          Id_Reserva, 
          GROUP_CONCAT(NombrePasajero SEPARATOR ', ') AS NombrePasajero,
          GROUP_CONCAT(IdPas SEPARATOR ', ') AS IdPas,
          GROUP_CONCAT(TelefonoPasajero SEPARATOR ', ') AS TelefonoPasajero,
          GROUP_CONCAT(PrecioTour SEPARATOR ', ') AS PrecioTour
        FROM Pasajeros
        GROUP BY Id_Reserva
      ) AS Pasajeros ON R.Id_Reserva = Pasajeros.Id_Reserva
      LEFT JOIN Tours AS T ON R.TourReserva = T.Id_Tour
      LEFT JOIN Puntos AS Pt ON Pt.Id_Punto = R.Id_Punto
      LEFT JOIN Horarios AS H ON Pt.Id_Punto = H.Id_Punto
      ${FechaRegistro || HoraRegistro || TipoAccion ? 'LEFT JOIN History ON R.Id_Reserva = History.Id_' : ''}
      ${whereClause}
      AND R.TipoReserva = "Privada"
      GROUP BY Pasajeros.Id_Reserva;
  `;

  connection.query(ListadoQuery, (error, result) => {
    if (error) {
      console.error('Error al ejecutar la consulta:', error);
      return res.status(500).json({ message: 'Error al generar el listado. Por favor, inténtelo de nuevo más tarde.' });
    }

    if (result.length === 0) {
      // Si no hay reservas privadas, devolver un código 204
      return res.status(204).json({ message: 'No hay reservas privadas disponibles.' });
    }

    // Si se encuentran reservas privadas, devolver el resultado
    return res.status(200).json({ message: 'Reservas privadas encontradas.' });
  });
});



router.get("/Programacion/Tabla", (request, response, next) => {
  const { Tour, Fecha } = request.query;

  // Convierte Tour en un array si es necesario
  const selectionTourArray = Array.isArray(Tour) ? Tour : [Tour];
  const filters = [
    Fecha && `FechaReserva = "${Fecha}"`,
    Tour && `TourReserva IN (${selectionTourArray.map(t => `'${t}'`).join(",")})`,
    `Estado = 'Completado'`
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


//-------------------------------------Comisiones json-------------------------------------
router.get("/Comision/Tabla", (request, response, next) => {
  const { Id_Tour, Fecha } = request.query;

  // Convierte Id_Tour en un array si es necesario
  const selectionTourArray = Array.isArray(Id_Tour) ? Id_Tour : [Id_Tour];
  const filters = [
    Fecha && `FechaReserva = "${Fecha}"`,
    Id_Tour && `TourReserva IN (${selectionTourArray.map(t => `'${t}'`).join(",")})`,
    'Confirmacion = 1', // Filtro fijo para Confirmacion
    '(Estado = "Completado" OR Estado = "Activo")'
  ].filter(Boolean);

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const query = `
    SELECT *
    FROM Reservas AS R
    INNER JOIN Pasajeros AS P ON R.Id_Reserva = P.Id_Reserva
    INNER JOIN Tours AS T ON R.TourReserva = T.Id_Tour
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

router.get('/Comision/Exportar', (req, res) => {
  const { Id_Tour, Fecha } = req.query;

  // Convierte Id_Tour en un array si es necesario
  const selectionTourArray = Array.isArray(Id_Tour) ? Id_Tour : [Id_Tour];
  const filters = [
    Fecha && `FechaReserva = "${Fecha}"`,
    Id_Tour && `TourReserva IN (${selectionTourArray.map(t => `'${t}'`).join(",")})`,
    'P.Confirmacion = 1',  // Filtro fijo para Confirmacion
    '(R.Estado = "Completado" OR R.Estado = "Activo")'
  ].filter(Boolean);

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const query = `
  SELECT 
      R.Id_Reserva,
      T.NombreTour,
      R.PuntoEncuentro,
      R.NombreReporta,
      P.NombrePasajero,
      P.IdPas,
      P.TelefonoPasajero,
      P.PrecioTour,
      P.Confirmacion
  FROM Reservas AS R
  INNER JOIN (
          SELECT 
            Id_Reserva, 
            GROUP_CONCAT(NombrePasajero SEPARATOR ', ') AS NombrePasajero,
            GROUP_CONCAT(IdPas SEPARATOR ', ') AS IdPas,
            GROUP_CONCAT(TelefonoPasajero SEPARATOR ', ') AS TelefonoPasajero,
            GROUP_CONCAT(PrecioTour SEPARATOR ', ') AS PrecioTour,
            Confirmacion
          FROM Pasajeros
          GROUP BY Id_Reserva
        ) AS P ON R.Id_Reserva = P.Id_Reserva
  INNER JOIN Tours AS T ON R.TourReserva = T.Id_Tour
  ${whereClause}

`;


  connection.query(query, (error, data) => {
    if (error) {
      console.error("Error en la consulta:", error);
      res.status(500).send('Error interno del servidor');
      return;
    }

    // Crear un nuevo workbook y worksheet
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Comisión');

    // Definir las columnas del archivo Excel
    const columns = [
      { header: 'ID RESERVA', key: 'Id_Reserva', width: 20 },
      { header: 'TOUR', key: 'NombreTour', width: 30 },
      { header: 'NOMBRE PASAJERO', key: 'NombrePasajero', width: 30 },
      { header: 'DNI/PASAPORTE', key: 'IdPas', width: 15 },
      { header: 'HOTEL', key: 'PuntoEncuentro', width: 20 },
      { header: 'PRECIO', key: 'PrecioTour', width: 15 },
      { header: 'REPORTA', key: 'NombreReporta', width: 25 },
    ];

    worksheet.columns = columns;

    // Definir los estilos de borde
    const borderStyleThin = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    // Aplicar estilo a las celdas del encabezado
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = borderStyleThin;
    });

    // Mapa para realizar un seguimiento de las filas combinadas por Id_Reserva
    const mergedRows = {};

    // Llenar el archivo Excel con los datos
    data.forEach(row => {
      const idReserva = row.Id_Reserva;

      // Obtener listas separadas por ', ' y dividirlas en arrays
      const nombresPasajeros = row.NombrePasajero ? row.NombrePasajero.split(', ') : [];
      const idsPasajeros = row.IdPas ? row.IdPas.split(', ') : [];
      const telefonosPasajeros = row.TelefonoPasajero ? row.TelefonoPasajero.split(', ') : [];
      const preciosTour = row.PrecioTour ? row.PrecioTour.split(', ') : [];

      // Determinar la cantidad de filas que se necesitan
      const rowCount = Math.max(nombresPasajeros.length, idsPasajeros.length, telefonosPasajeros.length, preciosTour.length);

      // Añadir filas a la hoja de cálculo
      for (let i = 0; i < rowCount; i++) {
        const data = {
          // Id_Reserva: i === 0 ? idReserva : '', // Mostrar Id_Reserva solo en la primera fila del grupo de pasajeros
          NombrePasajero: nombresPasajeros[i] || '',
          IdPas: idsPasajeros[i] || '',
          PrecioTour: preciosTour[i] || '',
        };

        if (i === 0) {
          // Mostrar los datos generales solo en la primera fila del grupo de pasajeros}
          data.Id_Reserva = idReserva;
          data.NombreTour = row.NombreTour;
          data.PuntoEncuentro = row.PuntoEncuentro;
          data.NombreReporta = row.NombreReporta;
        }

        // Agregar la fila al worksheet
        const newRow = worksheet.addRow(data);
        // Aplicar borde fino a cada celda en la fila
        newRow.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = borderStyleThin;
        });


        // Si es la primera fila de la reserva, guardar la posición de la fila
        if (i === 0) {
          mergedRows[idReserva] = {
            start: worksheet.rowCount,
            end: worksheet.rowCount
          };
        } else {
          // Si no es la primera fila, incrementar el final de la fusión de celdas
          mergedRows[idReserva].end = worksheet.rowCount;
        }
      }
    });


    Object.keys(mergedRows).forEach(idReserva => {
      const { start, end } = mergedRows[idReserva];
      if (start !== end) {
        // Combinar celdas en las columnas específicas
        worksheet.mergeCells(`A${start}:A${end}`); // ID RESERVA
        worksheet.mergeCells(`B${start}:B${end}`); // TOUR
        worksheet.mergeCells(`E${start}:E${end}`); // HOTEL
        worksheet.mergeCells(`G${start}:G${end}`); // REPORTA


      }
    });

    // Ajustar la alineación vertical y horizontal de las celdas combinadas
    worksheet.eachRow(row => {
      row.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Configurar la respuesta para descargar el archivo Excel
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Comision_Reporte.xlsx"');

    // Escribir el archivo Excel y enviarlo como respuesta
    workbook.xlsx.write(res)
      .then(() => {
        res.end();
      })
      .catch(err => {
        console.error('Error al escribir el archivo Excel:', err);
        res.status(500).send('Error al generar el archivo Excel. Por favor, inténtelo de nuevo más tarde.');
      });
  });
});


//----------------------------------------------------------------------------------------

//-------------------------------------Seguros json-------------------------------------
router.get("/Seguros/Tabla", (req, res, next) => {
  const { Id_Tour, Fecha } = req.query;

  // Convierte Id_Tour en un array si es necesario
  const selectionTourArray = Array.isArray(Id_Tour) ? Id_Tour : [Id_Tour];
  const filters = [
    Fecha && `FechaReserva = "${Fecha}"`,
    Id_Tour && `TourReserva IN (${selectionTourArray.map(t => `'${t}'`).join(",")})`,
    'P.Confirmacion = 1',  // Filtro fijo para Confirmacion
    '(R.Estado = "Completado" OR R.Estado = "Activo")'
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
      res.status(500).json({ error: "Error interno del servidor" });
    } else {
      res.json(data);
    }
  });
});

router.get('/Seguros/Exportar', (req, res) => {
  const { Id_Tour, Fecha } = req.query;

  // Convierte Id_Tour en un array si es necesario
  const selectionTourArray = Array.isArray(Id_Tour) ? Id_Tour : [Id_Tour];
  const filters = [
    Fecha && `FechaReserva = "${Fecha}"`,
    Id_Tour && `TourReserva IN (${selectionTourArray.map(t => `'${t}'`).join(",")})`,
    'P.Confirmacion = 1',  // Filtro fijo para Confirmacion
    '(R.Estado = "Completado" OR R.Estado = "Activo")'
  ].filter(Boolean);

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const query = `
  SELECT 
      R.Id_Reserva,
      T.NombreTour,
      P.NombrePasajero,
      P.IdPas,
      P.Confirmacion
  FROM Reservas AS R
  INNER JOIN (
          SELECT 
            Id_Reserva, 
            GROUP_CONCAT(NombrePasajero SEPARATOR ', ') AS NombrePasajero,
            GROUP_CONCAT(IdPas SEPARATOR ', ') AS IdPas,
            Confirmacion
          FROM Pasajeros
          GROUP BY Id_Reserva
        ) AS P ON R.Id_Reserva = P.Id_Reserva
  INNER JOIN Tours AS T ON R.TourReserva = T.Id_Tour
  ${whereClause}

`;


  connection.query(query, (error, data) => {
    if (error) {
      console.error("Error en la consulta:", error);
      res.status(500).send('Error interno del servidor');
      return;
    }

    // Crear un nuevo workbook y worksheet
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Comisión');

    // Definir las columnas del archivo Excel
    const columns = [
      { header: 'ID RESERVA', key: 'Id_Reserva', width: 20 },
      { header: 'TOUR', key: 'NombreTour', width: 30 },
      { header: 'NOMBRE PASAJERO', key: 'NombrePasajero', width: 30 },
      { header: 'DNI/PASAPORTE', key: 'IdPas', width: 15 },
    ];

    worksheet.columns = columns;

    // Definir los estilos de borde
    const borderStyleThin = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    // Aplicar estilo a las celdas del encabezado
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = borderStyleThin;
    });

    // Mapa para realizar un seguimiento de las filas combinadas por Id_Reserva
    const mergedRows = {};

    // Llenar el archivo Excel con los datos
    data.forEach(row => {
      const idReserva = row.Id_Reserva;

      // Obtener listas separadas por ', ' y dividirlas en arrays
      const nombresPasajeros = row.NombrePasajero ? row.NombrePasajero.split(', ') : [];
      const idsPasajeros = row.IdPas ? row.IdPas.split(', ') : [];

      // Determinar la cantidad de filas que se necesitan
      const rowCount = Math.max(nombresPasajeros.length, idsPasajeros.length);

      // Añadir filas a la hoja de cálculo
      for (let i = 0; i < rowCount; i++) {
        const data = {
          // Id_Reserva: i === 0 ? idReserva : '', // Mostrar Id_Reserva solo en la primera fila del grupo de pasajeros
          NombrePasajero: nombresPasajeros[i] || '',
          IdPas: idsPasajeros[i] || '',
        };

        if (i === 0) {
          // Mostrar los datos generales solo en la primera fila del grupo de pasajeros}
          data.Id_Reserva = idReserva;
          data.NombreTour = row.NombreTour;
        }

        // Agregar la fila al worksheet
        const newRow = worksheet.addRow(data);
        // Aplicar borde fino a cada celda en la fila
        newRow.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = borderStyleThin;
        });


        // Si es la primera fila de la reserva, guardar la posición de la fila
        if (i === 0) {
          mergedRows[idReserva] = {
            start: worksheet.rowCount,
            end: worksheet.rowCount
          };
        } else {
          // Si no es la primera fila, incrementar el final de la fusión de celdas
          mergedRows[idReserva].end = worksheet.rowCount;
        }
      }
    });


    Object.keys(mergedRows).forEach(idReserva => {
      const { start, end } = mergedRows[idReserva];
      if (start !== end) {
        // Combinar celdas en las columnas específicas
        worksheet.mergeCells(`A${start}:A${end}`); // ID RESERVA
        worksheet.mergeCells(`B${start}:B${end}`); // TOUR
      }
    });

    // Ajustar la alineación vertical y horizontal de las celdas combinadas
    worksheet.eachRow(row => {
      row.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Configurar la respuesta para descargar el archivo Excel
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Seguros_Reporte.xlsx"');

    // Escribir el archivo Excel y enviarlo como respuesta
    workbook.xlsx.write(res)
      .then(() => {
        res.end();
      })
      .catch(err => {
        console.error('Error al escribir el archivo Excel:', err);
        res.status(500).send('Error al generar el archivo Excel. Por favor, inténtelo de nuevo más tarde.');
      });
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
router.post("/NuevaReserva", Controller.isAuthenticated, Controller.saveNuevaReserva);
router.post("/EditReserva", Controller.isAuthenticated, Controller.saveEditReserva);
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
module.exports = router;