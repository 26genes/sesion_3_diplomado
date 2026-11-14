import { AgendarCita } from "./application/agendar-cita";
import { CancelarCita } from "./application/cancelar-cita";
import { AgendaRepositorio } from "./domain/agenda-repositorio";
import { ControllerCitas } from "./infrastructure/http/controller";
import { GeneradorIdUuid } from "./infrastructure/id/generador-id-uuid";
import { EventBusMemoria } from "./infrastructure/messaging/event-bus-memoria";
import { AgendaRepositorioJson } from "./infrastructure/persistence/agenda-repositorio-json";
import { AgendaRepositorioMemoria } from "./infrastructure/persistence/agenda-repositorio-memoria";

/**
 * Raíz de composición: ÚNICO lugar que conoce adaptadores concretos y decide
 * cuál se usa según la opción recibida. Todo lo demás (dominio, aplicación,
 * controlador) solo ve interfaces. Cambiar la persistencia es cambiar este
 * parámetro, no el negocio.
 */
export type Persistencia = { tipo: "memoria" } | { tipo: "json"; ruta: string };

export function crearApp(persistencia: Persistencia) {
  const agendas: AgendaRepositorio =
    persistencia.tipo === "memoria"
      ? new AgendaRepositorioMemoria()
      : new AgendaRepositorioJson(persistencia.ruta);

  const eventos = new EventBusMemoria();
  const agendar = new AgendarCita(agendas, eventos, new GeneradorIdUuid());
  const cancelar = new CancelarCita(agendas, eventos);
  const controller = new ControllerCitas(agendar, cancelar);

  return { controller, agendas, eventos, agendar, cancelar };
}
