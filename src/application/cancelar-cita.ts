import { AgendaRepositorio } from "../domain/agenda-repositorio";
import { EventBus } from "./puertos";

export interface PedidoCancelar {
  medicoId: string;
  citaId: string;
}

/**
 * Caso de uso: cancela una cita cargando su agenda, aplicando la regla del
 * dominio (falla si la cita no existe o ya estaba cancelada), guardando y
 * solo entonces emitiendo el evento.
 */
export class CancelarCita {
  constructor(
    private readonly repositorio: AgendaRepositorio,
    private readonly eventBus: EventBus,
  ) {}

  async ejecutar(pedido: PedidoCancelar): Promise<void> {
    const agenda = await this.repositorio.porMedico(pedido.medicoId);
    agenda.cancelar(pedido.citaId); // puede lanzar CitaNoEncontradaError / CitaYaCanceladaError
    await this.repositorio.guardar(agenda);
    await this.eventBus.emit("cita.cancelada", { citaId: pedido.citaId, medicoId: pedido.medicoId });
  }
}
