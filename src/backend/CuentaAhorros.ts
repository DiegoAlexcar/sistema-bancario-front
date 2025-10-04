import { Cuenta } from "./Cuenta";

export class CuentaAhorros extends Cuenta {
  constructor(numeroCuenta: string, saldoInicial: number = 0) {
    super(numeroCuenta, saldoInicial);
  }

  realizarRetiro(monto: number) {
    if (monto <= 0) return `El monto debe ser mayor a 0`;

    if (monto > this.saldo) {
      return `Fondos insuficientes. En una cuenta de ahorros no se permiten sobregiros.`;
    }

    this.saldo -= monto;
    this.movimientos.push(`Retiro: $${monto}`);
    return `Retiro de $${monto}, saldo actual: $${this.saldo}`;
  }
}
