// Puertos secundarios: interfaces que el caso de uso necesita del exterior
// (notificaciones e identificadores) y que la infraestructura implementará.
// El dominio NO los conoce; viven en application/ porque solo los casos de
// uso los usan para coordinar.
export interface EventBus {
  emit(nombre: string, datos: Record<string, unknown>): Promise<void>;
}

export interface GeneradorId {
  nuevo(): string;
}
