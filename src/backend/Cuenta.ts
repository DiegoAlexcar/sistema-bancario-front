export interface ICuenta {
  numeroCuenta: string;
  saldo: number;
  movimientos: string[];
}

export class Cuenta implements ICuenta {
  numeroCuenta: string;
  saldo: number;
  movimientos: string[];

  constructor(numeroCuenta: string, saldoInicial: number = 0) {
    this.numeroCuenta = numeroCuenta;
    this.saldo = saldoInicial;
    this.movimientos = [];
  }

  consultarSaldo() {
    return `Saldo de ${this.numeroCuenta}: $${this.saldo}`;
  }

  realizarDeposito(monto: number) {
    if (monto <= 0) return `El monto debe ser mayor a 0`;
    this.saldo += monto;
    this.movimientos.push(`Depósito: $${monto}`);
    return `Consignación exitosa de: $${monto}. Nuevo saldo: $${this.saldo}`;
  }

  realizarRetiro(monto: number) {
    if (monto <= 0) return `El monto debe ser mayor a 0`;
    if (monto > this.saldo) return `Saldo insuficiente`;

    this.saldo -= monto;
    this.movimientos.push(`Retiro: $${monto}`);
    return `Retiro de $${monto}. Saldo actual: $${this.saldo}`;
  }
}
