// Prueba del adaptador primario (HTTP): el endpoint de cancelación.
// Es un archivo NUEVO (AGENTS.md regla 1); ninguna prueba existente se toca.
import { describe, expect, it } from "vitest";
import { crearApp } from "../../src/composicion";

const horario = {
  medicoId: "dra-martinez",
  pacienteId: "paciente-1",
  inicio: "2026-11-16T09:00:00Z",
  fin: "2026-11-16T09:30:00Z",
};

async function crearCita(app: ReturnType<typeof crearApp>): Promise<string> {
  const creada = await app.controller.post(horario);
  expect(creada.status).toBe(201);
  const agenda = await app.agendas.porMedico("dra-martinez");
  return agenda.citas()[0].id;
}

describe("Endpoint de cancelación (ControllerCitas.delete)", () => {
  it("cancela con 200, libera el horario y emite cita.cancelada", async () => {
    const app = crearApp({ tipo: "memoria" });
    const citaId = await crearCita(app);

    const ok = await app.controller.delete({ medicoId: "dra-martinez", citaId });
    expect(ok.status).toBe(200);

    // el horario quedó libre: la misma franja se puede volver a agendar
    const reagendada = await app.controller.post(horario);
    expect(reagendada.status).toBe(201);
    expect(app.eventos.emitidos.map((e) => e.nombre)).toEqual([
      "cita.confirmada",
      "cita.cancelada",
      "cita.confirmada",
    ]);
  });

  it("responde 404 si la cita no existe", async () => {
    const app = crearApp({ tipo: "memoria" });
    const respuesta = await app.controller.delete({ medicoId: "dra-martinez", citaId: "no-existe" });
    expect(respuesta.status).toBe(404);
    expect(app.eventos.emitidos).toHaveLength(0);
  });

  it("responde 409 si la cita ya estaba cancelada", async () => {
    const app = crearApp({ tipo: "memoria" });
    const citaId = await crearCita(app);
    expect((await app.controller.delete({ medicoId: "dra-martinez", citaId })).status).toBe(200);
    expect((await app.controller.delete({ medicoId: "dra-martinez", citaId })).status).toBe(409);
  });

  it("responde 400 si faltan datos", async () => {
    const app = crearApp({ tipo: "memoria" });
    expect((await app.controller.delete({ medicoId: "dra-martinez" })).status).toBe(400);
    expect((await app.controller.delete({})).status).toBe(400);
  });
});
