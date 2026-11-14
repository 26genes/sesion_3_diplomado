import { Agenda } from "../../domain/agenda";
import { AgendaRepositorio } from "../../domain/agenda-repositorio";
import { Cita } from "../../domain/cita";

/** Copia profunda de una agenda: las lecturas no exponen el estado almacenado. */
function copiar(agenda: Agenda): Agenda {
  return new Agenda(
    agenda.medicoId,
    agenda.citas().map((c) => Cita.reconstruir(c.id, c.pacienteId, c.rango, c.estado)),
  );
}

/**
 * Adaptador del puerto AgendaRepositorio: guarda agendas en un Map en memoria.
 * Cumple el mismo contrato que el adaptador JSON, así que es intercambiable.
 * RangoHorario es inmutable, por eso las citas pueden compartir su referencia.
 */
export class AgendaRepositorioMemoria implements AgendaRepositorio {
  private readonly datos = new Map<string, Agenda>();

  async porMedico(medicoId: string): Promise<Agenda> {
    const guardada = this.datos.get(medicoId);
    return guardada ? copiar(guardada) : new Agenda(medicoId);
  }

  async guardar(agenda: Agenda): Promise<void> {
    this.datos.set(agenda.medicoId, copiar(agenda));
  }
}
