import { Agenda } from "./agenda";

/**
 * Puerto del dominio: el núcleo declara QUE necesita guardar y recuperar
 * agendas, sin decidir CÓMO (memoria, archivo, base de datos...).
 * Vive en domain/ porque es el dominio quien define qué forma debe tener
 * el mecanismo para satisfacer sus reglas. Quien lo implementa es un
 * adaptador de infrastructure/.
 */
export interface AgendaRepositorio {
  porMedico(medicoId: string): Promise<Agenda>;
  guardar(agenda: Agenda): Promise<void>;
}
