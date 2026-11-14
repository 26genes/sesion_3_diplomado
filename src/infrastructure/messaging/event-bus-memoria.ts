import { EventBus } from "../../application/puertos";

/**
 * Adaptador del puerto EventBus: en vez de notificar a nadie de verdad,
 * registra los eventos en un array (el "buzón" en memoria del sistema).
 * La composición lo expone para poder inspeccionar qué se emitió.
 */
export class EventBusMemoria implements EventBus {
  readonly emitidos: Array<{ nombre: string; datos: Record<string, unknown> }> = [];

  async emit(nombre: string, datos: Record<string, unknown>): Promise<void> {
    this.emitidos.push({ nombre, datos });
  }
}
