import { readFile, writeFile } from "node:fs/promises";
import { Agenda } from "../../domain/agenda";
import { AgendaRepositorio } from "../../domain/agenda-repositorio";
import { Cita, EstadoCita } from "../../domain/cita";
import { RangoHorario } from "../../domain/rango-horario";

interface CitaEnArchivo {
  id: string;
  pacienteId: string;
  inicio: string; // ISO 8601
  fin: string; // ISO 8601
  estado: EstadoCita;
}

interface AgendaEnArchivo {
  medicoId: string;
  citas: CitaEnArchivo[];
}

type Archivo = Record<string, AgendaEnArchivo>;

/**
 * Adaptador del puerto AgendaRepositorio: persiste todas las agendas en un
 * archivo JSON (clave: medicoId). Si el archivo no existe aún, se comporta
 * como vacío. Cada lectura reconstruye agendas nuevas desde el disco.
 */
export class AgendaRepositorioJson implements AgendaRepositorio {
  constructor(private readonly ruta: string) {}

  private async leer(): Promise<Archivo> {
    try {
      return JSON.parse(await readFile(this.ruta, "utf-8")) as Archivo;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
      throw error;
    }
  }

  async porMedico(medicoId: string): Promise<Agenda> {
    const guardada = (await this.leer())[medicoId];
    if (!guardada) return new Agenda(medicoId);
    const citas = guardada.citas.map((c) =>
      Cita.reconstruir(
        c.id,
        c.pacienteId,
        RangoHorario.crear(new Date(c.inicio), new Date(c.fin)),
        c.estado,
      ),
    );
    return new Agenda(medicoId, citas);
  }

  async guardar(agenda: Agenda): Promise<void> {
    const archivo = await this.leer();
    archivo[agenda.medicoId] = {
      medicoId: agenda.medicoId,
      citas: agenda.citas().map((c) => ({
        id: c.id,
        pacienteId: c.pacienteId,
        inicio: c.rango.inicio.toISOString(),
        fin: c.rango.fin.toISOString(),
        estado: c.estado,
      })),
    };
    await writeFile(this.ruta, JSON.stringify(archivo, null, 2), "utf-8");
  }
}
