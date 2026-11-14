import { AgendarCita } from "../../application/agendar-cita";
import { CancelarCita } from "../../application/cancelar-cita";
import {
  CitaNoEncontradaError,
  CitaYaCanceladaError,
  CruceDeHorarioError,
  RangoInvalidoError,
} from "../../domain/errores";

export interface EntradaPost {
  medicoId?: unknown;
  pacienteId?: unknown;
  inicio?: unknown;
  fin?: unknown;
}

export interface Respuesta {
  status: number;
}

/**
 * Adaptador primario (driven): recibe peticiones tipo HTTP, traduce el texto
 * a los tipos del dominio (fechas) y devuelve códigos de estado:
 * 201 creada · 409 cruce de horario · 400 datos inválidos o incompletos.
 * Solo conoce casos de uso y errores del dominio, nunca adaptadores.
 */
export class ControllerCitas {
  constructor(
    private readonly agendarCita: AgendarCita,
    private readonly cancelarCita: CancelarCita,
  ) {}

  async post(entrada: EntradaPost): Promise<Respuesta> {
    const medicoId = typeof entrada.medicoId === "string" ? entrada.medicoId : undefined;
    const pacienteId = typeof entrada.pacienteId === "string" ? entrada.pacienteId : undefined;
    const inicio = typeof entrada.inicio === "string" ? new Date(entrada.inicio) : undefined;
    const fin = typeof entrada.fin === "string" ? new Date(entrada.fin) : undefined;

    const completo =
      medicoId !== undefined &&
      pacienteId !== undefined &&
      inicio !== undefined &&
      fin !== undefined &&
      !Number.isNaN(inicio.getTime()) &&
      !Number.isNaN(fin.getTime());
    if (!completo) return { status: 400 };

    try {
      await this.agendarCita.ejecutar({ medicoId, pacienteId, inicio, fin });
      return { status: 201 };
    } catch (error) {
      if (error instanceof CruceDeHorarioError) return { status: 409 };
      if (error instanceof RangoInvalidoError) return { status: 400 };
      throw error;
    }
  }

  /** Cancela una cita: 200 ok · 404 no existe · 409 ya cancelada · 400 incompleto. */
  async delete(entrada: { medicoId?: unknown; citaId?: unknown }): Promise<Respuesta> {
    const medicoId = typeof entrada.medicoId === "string" ? entrada.medicoId : undefined;
    const citaId = typeof entrada.citaId === "string" ? entrada.citaId : undefined;
    if (medicoId === undefined || citaId === undefined) return { status: 400 };

    try {
      await this.cancelarCita.ejecutar({ medicoId, citaId });
      return { status: 200 };
    } catch (error) {
      if (error instanceof CitaNoEncontradaError) return { status: 404 };
      if (error instanceof CitaYaCanceladaError) return { status: 409 };
      throw error;
    }
  }
}
