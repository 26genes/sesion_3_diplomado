import { Cita } from "./cita";
import { CitaNoEncontradaError, CruceDeHorarioError } from "./errores";

/**
 * Agregado: agrupa las citas de un médico y hace cumplir los invariantes
 * que dependen del conjunto (no del individuo):
 * - no conviven dos citas activas que se crucen;
 * - cancelar una cita libera su horario;
 * - la lista interna no se modifica desde afuera (citas() devuelve una copia).
 */
export class Agenda {
  readonly medicoId: string;
  private readonly lista: Cita[];

  constructor(medicoId: string, citas: Cita[] = []) {
    this.medicoId = medicoId;
    this.lista = [...citas];
  }

  agendar(cita: Cita): void {
    const hayCruce = this.lista.some((c) => c.activa() && c.rango.seCruzaCon(cita.rango));
    if (hayCruce) {
      throw new CruceDeHorarioError(`La cita ${cita.id} se cruza con una cita activa de ${this.medicoId}`);
    }
    this.lista.push(cita);
  }

  cancelar(citaId: string): void {
    const cita = this.lista.find((c) => c.id === citaId);
    if (!cita) throw new CitaNoEncontradaError(`La cita ${citaId} no está en la agenda de ${this.medicoId}`);
    cita.cancelar(); // si ya estaba cancelada, lanza CitaYaCanceladaError
  }

  citas(): Cita[] {
    return [...this.lista];
  }
}
