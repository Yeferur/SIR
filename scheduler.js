const cron = require('node-cron');

// Conexión a la base de datos
const connection = require('./database/db');

// Ejecuta todos los días a las 02:00 AM
cron.schedule('0 2 * * *', () => {
    console.log('⏰ Ejecutando tareas automáticas de reservas...');

    const FechaActual = new Date();
    const dia = String(FechaActual.getDate()).padStart(2, '0');
    const mes = String(FechaActual.getMonth() + 1).padStart(2, '0');
    const año = FechaActual.getFullYear();
    const Fecha = `${año}-${mes}-${dia}`;

    // 1. Reservas Activas → Completado
    const updateCompletado = `
        UPDATE Reservas
        SET Estado = 'Completado'
        WHERE Estado = 'Activo'
          AND STR_TO_DATE(FechaReserva, '%Y-%m-%d') < '${Fecha}'
    `;

    // 2. Reservas Pendientes → Cancelado
    const updateCancelado = `
        UPDATE Reservas
        SET Estado = 'Cancelado'
        WHERE Estado = 'Pendiente'
          AND STR_TO_DATE(FechaReserva, '%Y-%m-%d') < '${Fecha}'
    `;

    // 3. Eliminar reservas sin pasajeros (reservas huérfanas)
    const deleteReservasSinPasajeros = `
        DELETE r
        FROM Reservas r
        WHERE NOT EXISTS (
            SELECT 1
            FROM Pasajeros p
            WHERE p.Id_Reserva = r.Id_Reserva
        )
    `;

    // Ejecutar tareas
    connection.query(updateCompletado, (err, result) => {
        if (err) {
            console.error('❌ Error actualizando reservas a completado:', err);
            return;
        }
        console.log(`✔ Reservas activas → completado: ${result.affectedRows}`);
    });

    connection.query(updateCancelado, (err, result) => {
        if (err) {
            console.error('❌ Error actualizando reservas a cancelado:', err);
            return;
        }
        console.log(`✔ Reservas pendientes → cancelado: ${result.affectedRows}`);
    });

    connection.query(deleteReservasSinPasajeros, (err, result) => {
        if (err) {
            console.error('❌ Error eliminando reservas sin pasajeros:', err);
            return;
        }
        console.log(`🧹 Reservas sin pasajeros eliminadas: ${result.affectedRows}`);
    });
});
