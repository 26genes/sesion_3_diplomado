import { CitaYaCanceladaError } from "./errores";
import { RangoHorario } from "./rango-horario";

export type EstadoCita = "confirmada" | "cancelada";

/**
 * Entidad: tiene identidad propia (el id no cambia aunque cambie su estado).
 * Invariantes: nace confirmada; solo se puede cancelar una vez; al cancelarse
 * conserva id, paciente y horario (para historial), pero deja de estar activa.
 */
export class Cita {
  readonly id: string;
  readonly pacienteId: string;
  readonly rango: RangoHorario;
  private estadoActual: EstadoCita;

  private constructor(id: string, pacienteId: string, rango: RangoHorario, estado: EstadoCita) {
    this.id = id;
    this.pacienteId = pacienteId;
    this.rango = rango;
    this.estadoActual = estado;
  }

  static nueva(id: string, pacienteId: string, rango: RangoHorario): Cita {
    return new Cita(id, pacienteId, rango, "confirmada");
  }

  /** Reconstruye una cita desde sus datos (la usa el repositorio al leerla). */
  static reconstruir(id: string, pacienteId: string, rango: RangoHorario, estado: EstadoCita): Cita {
    return new Cita(id, pacienteId, rango, estado);
  }

  get estado(): EstadoCita {
    return this.estadoActual;
  }

  activa(): boolean {
    return this.estadoActual === "confirmada";
  }

  cancelar(): void {
    if (!this.activa()) throw new CitaYaCanceladaError(`La cita ${this.id} ya estaba cancelada`);
    this.estadoActual = "cancelada";
  }
}
