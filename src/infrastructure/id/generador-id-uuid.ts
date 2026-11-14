import { randomUUID } from "node:crypto";
import { GeneradorId } from "../../application/puertos";

/**
 * Adaptador del puerto GeneradorId: ids únicos aunque el proceso se reinicie
 * (importante con persistencia en archivo: un contador secuencial volvería a
 * empezar y podría duplicar ids ya guardados).
 */
export class GeneradorIdUuid implements GeneradorId {
  nuevo(): string {
    return randomUUID();
  }
}
