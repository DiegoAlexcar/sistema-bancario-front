export interface ICuenta {
  numeroCuenta: string;
  saldo: number;
  historial: string[];
}

export class Cuenta implements ICuenta {
  numeroCuenta: string;
  saldo: number;
  historial: string[];

  constructor(numeroCuenta: string, saldoInicial: number = 0) {
    this.numeroCuenta = numeroCuenta;
    this.saldo = saldoInicial;
    this.historial = [];
  }

  consultarSaldo() {
    return `Saldo de ${this.numeroCuenta}: $${this.saldo}`;
  }

  realizarDeposito(monto: number) {
    if (monto <= 0) return `El monto debe ser mayor a 0`;
    this.saldo += monto;
    this.historial.push(`Depósito: $${monto}`);
    return `Consignación exitosa de: $${monto}. Nuevo saldo: $${this.saldo}`;
  }

  realizarRetiro(monto: number) {
    if (monto <= 0) return `El monto debe ser mayor a 0`;
    if (monto > this.saldo) return `Saldo insuficiente`;

    this.saldo -= monto;
    this.historial.push(`Retiro: $${monto}`);
    return `Retiro de $${monto}. Saldo actual: $${this.saldo}`;
  }
}
