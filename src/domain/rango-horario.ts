import { RangoInvalidoError } from "./errores";

/**
 * Objeto de valor: un tramo horario [inicio, fin).
 * Se define por sus datos (dos fechas iguales ⇒ dos rangos iguales) y es
 * inmutable: las fechas que entran se copian, así que cambiar la fecha
 * original después de crearlo no lo modifica.
 * Reglas: el fin siempre es posterior al inicio; dos rangos se cruzan si
 * comparten algún minuto (pegados de frente no se cruzan).
 */
export class RangoHorario {
  readonly inicio: Date;
  readonly fin: Date;

  private constructor(inicio: Date, fin: Date) {
    this.inicio = new Date(inicio.getTime());
    this.fin = new Date(fin.getTime());
  }

  static crear(inicio: Date, fin: Date): RangoHorario {
    if (fin.getTime() <= inicio.getTime()) throw new RangoInvalidoError();
    return new RangoHorario(inicio, fin);
  }

  duracionMinutos(): number {
    return (this.fin.getTime() - this.inicio.getTime()) / 60_000;
  }

  seCruzaCon(otro: RangoHorario): boolean {
    return this.inicio.getTime() < otro.fin.getTime() && otro.inicio.getTime() < this.fin.getTime();
  }

  igualA(otro: RangoHorario): boolean {
    return (
      this.inicio.getTime() === otro.inicio.getTime() && this.fin.getTime() === otro.fin.getTime()
    );
  }
}
