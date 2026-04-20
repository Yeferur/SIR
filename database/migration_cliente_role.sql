-- Migration: Add Cliente role support
-- This script adds support for the new "Cliente" role with limited access
-- NOTE: No database structure changes needed! We use the existing 'history' table
-- to track who created/edited each reservation.

-- The implementation uses the existing 'history' table which already tracks:
-- - Id_Reserva: The reservation ID
-- - id_user: The user who created/edited the reservation (stored as DNI)
-- - Accion: 'Nuevo' for created, 'Editar' for edited
-- - FechaRegistro: When the action occurred

-- Simply create a "Cliente" role user through the admin interface with rol = "Cliente"
-- The backend will handle filtering based on the history table
