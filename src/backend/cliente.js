class Cliente {
  constructor(
    nombre,
    apellido,
    documento,
    direccion,
    usuario,
    password,
    saldoInicial = 0
  ) {
    this.nombre = nombre;
    this.apellido = apellido;
    this.documento = documento;
    this.direccion = direccion;
    // this.usuario=usuario;
    this.password = password;
    this.saldo = saldoInicial;
    this.movimientos = [];
  }

  Movimiento(descripcion) {
    const fecha = new Date().toLocaleString();
    this.movimientos.push(`[${fecha}] ${descripcion}`);
  }

  consultarSaldo() {
    return `El saldo de ${this.nombre} es $${this.saldo}`;
  }

  consignaciones(monto) {
    if (monto > 0) {
      this.saldo += monto;
      this.Movimiento(`consignacion: + $${monto}`);
      this.guardar();
      return `Consignacion exitosa. Nuevo saldo $${this.saldo}`;
    } else {
      return `El monto debe ser mayor a 0`;
    }
  }

  retiros(retiro) {
    if (retiro > 0 && retiro <= this.saldo) {
      this.saldo -= retiro;
      this.Movimiento(`retiro: - $${retiro}`);
      this.guardar();
      return `Retiro exitoso. Saldo actual $${this.saldo}`;
    } else {
      return `Revise monto a retirar. Monto a retirar debe ser mayor a 0 y no puede ser mayor al saldo`;
    }
  }

  consultarMovimientos() {
    if (this.movimientos.length === 0) {
      return `${this.nombre} no tiene movimientos registrados`;
    }
    return `movimientos de movimientos ${this.nombre}: \n${this.movimientos.join(
      "\n"
    )}`;
  }

  transferencias(monto, cliente) {
    if (monto <= 0) {
      return `Debe ser mayor a 0`;
    }
    if (monto > this.saldo) {
      return `Fondos insuficientes`;
    }
    this.saldo -= monto;
    cliente.saldo += monto;
    this.Movimiento(`Transferencia enviada: - $${monto} a ${cliente.nombre}`);
    cliente.Movimiento(`Transferencia recibida: + $${monto} de ${this.nombre}`);
    this.guardar();
    cliente.guardar();
    return `Transferencia de $${monto} a ${cliente.nombre} exitosa. Nuevo saldo: $${this.saldo}`;
  }

  guardar() {
    localStorage.setItem(this.usuario, JSON.stringify(this));
  }

  static cargar(usuario) {
    const data = localStorage.getItem(usuario);
    if (data) {
      const obj = JSON.parse(data);
      const cliente = new Cliente(
        obj.nombre,
        obj.apellido,
        obj.documento,
        obj.direccion,
        obj.usuario,
        obj.password,
        obj.saldo
      );
      cliente.movimientos = obj.movimientos;
      return cliente;
    }
    return null;
  }
}
