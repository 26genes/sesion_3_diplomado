// Errores del dominio: uno por regla de negocio violada.
// Existen como tipos propios para que las pruebas (y quien llama) puedan
// distinguir «rango inválido» de «cruce de horario» sin leer mensajes.
export class RangoInvalidoError extends Error {
  constructor(mensaje = "El fin del rango debe ser posterior a su inicio") {
    super(mensaje);
  }
}

export class CruceDeHorarioError extends Error {
  constructor(mensaje = "La cita se cruza con otra cita activa") {
    super(mensaje);
  }
}

export class CitaYaCanceladaError extends Error {
  constructor(mensaje = "La cita ya estaba cancelada") {
    super(mensaje);
  }
}

export class CitaNoEncontradaError extends Error {
  constructor(mensaje = "No existe esa cita en la agenda") {
    super(mensaje);
  }
}
