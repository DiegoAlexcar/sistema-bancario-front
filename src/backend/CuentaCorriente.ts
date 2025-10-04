import { Cuenta } from "./Cuenta";

export class CuentaCorriente extends Cuenta {
  private limiteSobregiro: number = 500000;

  constructor(numeroCuenta: string, saldoInicial: number = 0) {
    super(numeroCuenta, saldoInicial);
  }

  realizarRetiro(monto: number) {
    if (monto <= 0) return `El monto debe ser mayor a 0`;

    if (monto > this.saldo + this.limiteSobregiro) {
      return `Fondos insuficientes. El sobregiro máximo permitido es $${this.limiteSobregiro}`;
    }

    this.saldo -= monto;
    this.movimientos.push(`Retiro (con sobregiro): $${monto}`);
    return `Retiro de $${monto}, saldo actual: $${this.saldo}`;
  }
}
