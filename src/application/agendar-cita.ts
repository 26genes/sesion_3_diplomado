import { AgendaRepositorio } from "../domain/agenda-repositorio";
import { Cita } from "../domain/cita";
import { RangoHorario } from "../domain/rango-horario";
import { EventBus, GeneradorId } from "./puertos";

export interface PedidoAgendar {
  medicoId: string;
  pacienteId: string;
  inicio: Date;
  fin: Date;
}

/**
 * Caso de uso: orquesta agendar una cita SIN saber dónde se guarda ni cómo
 * se notifica — solo conoce puertos (interfaces). El orden importa:
 * 1) validar el rango, 2) cargar, 3) generar id, 4) aplicar la regla del
 * dominio, 5) guardar, 6) emitir el evento. Si algo falla antes del paso 6,
 * no se guarda ni se emite nada.
 */
export class AgendarCita {
  constructor(
    private readonly repositorio: AgendaRepositorio,
    private readonly eventBus: EventBus,
    private readonly generador: GeneradorId,
  ) {}

  async ejecutar(pedido: PedidoAgendar): Promise<string> {
    const rango = RangoHorario.crear(pedido.inicio, pedido.fin); // valida primero
    const agenda = await this.repositorio.porMedico(pedido.medicoId);
    const citaId = this.generador.nuevo();
    agenda.agendar(Cita.nueva(citaId, pedido.pacienteId, rango)); // puede lanzar CruceDeHorarioError
    await this.repositorio.guardar(agenda);
    await this.eventBus.emit("cita.confirmada", { citaId, medicoId: pedido.medicoId });
    return citaId;
  }
}
