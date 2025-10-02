import type { UserData, Usuario } from "@/lib/core";
import { readDb, writeDb } from "@/lib/database";
import { registrarUsuario } from "@/lib/core";
import type { Cuenta } from "./Cuenta";

interface ICliente {
  nombre: string;
  apellido: string;
  usuario: string;
  documento: string;
  direccion: string;
  contrasena: string;
  saldo: number;
  historial: string[];
}

export class Cliente {
  private nombre: string;
  private apellido: string;
  private usuario: string;
  private documento: string;
  private direccion: string;
  private contrasena: string;
  private saldo: number;
  private historial: string[];
  private bloqueado: boolean = false;
  private bloqueadoHasta: number | null = null;
  private intentosFallidos: number = 0;
  private cuentas:Cuenta[];

  constructor({
    nombre,
    apellido,
    usuario,
    documento,
    direccion,
    contrasena,
    saldo = 0,
  }: ICliente) {
    this.nombre = nombre;
    this.apellido = apellido;
    this.documento = documento;
    this.direccion = direccion;
    this.contrasena = contrasena;
    this.saldo = saldo;
    this.usuario = usuario;
    this.historial = [];
    this.cuentas = [];
  }

  /* movimiento(descripcion: string, monto: number, idUser: string) {
    const fecha = new Date().toLocaleString();
    this.historial.push(`[${fecha}] ${descripcion}`);
    agregarMovimiento(this as unknown as Usuario, "retiro", monto);
    const usuarios = readDb();
    const usuario = usuarios[idUser];
    if (usuario) {
      agregarMovimiento(usuario, "consignacion", monto);
    }
  } */

    registrarUsuario(datos: UserData): boolean {
    const usuarios = readDb();
    if (usuarios[datos.cedula]) {
      return false; // Usuario ya existe
    }
    const usuario = this.createUser(
      datos.nombre,
      datos.cedula,
      datos.celular,
      datos.email,
      datos.password
    );
    usuarios[datos.cedula] = usuario;
    writeDb(usuarios);
    return true;
  }

  createUser(
    nombre: string,
    cedula: string,
    celular: string,
    email: string,
    password: string
  ): Usuario {
    return {
      id: cedula,
      nombre,
      cedula,
      celular,
      email,
      password,
      saldo: 0,
      movimientos: [],
      intentosFallidos: 0,
      bloqueado: false,
    };
  }
 
   agregarCuenta(cuenta: Cuenta) {
    this.cuentas.push(cuenta);
  }

  iniciarSesion(pass: string): string {
    const ahora = Date.now();
    if (this.bloqueado && this.bloqueadoHasta && ahora < this.bloqueadoHasta) {
      return "Usuario bloqueado por intentos fallidos. Intenta más tarde.";
    }

    if (this.contrasena === pass) {
      this.intentosFallidos = 0;
      this.bloqueado = false;
      return "ok";
    } else {
      this.intentosFallidos++;
      if (this.intentosFallidos >= 3) {
        this.bloqueado = true;
        this.bloqueadoHasta = ahora + 15 * 60 * 1000;
        return "Cuenta bloqueada por exceso de intentos fallidos.";
      }
      return `Contraseña incorrecta. Intentos restantes: ${3 - this.intentosFallidos}`;
    }
  }

  modificarDatos(nuevoNombre: string, nuevoApellido: string, nuevaDireccion: string) {
    if (nuevoNombre) this.nombre = nuevoNombre;
    if (nuevoApellido) this.apellido = nuevoApellido;
    if (nuevaDireccion) this.direccion = nuevaDireccion;
    this.guardar();
    return "Datos modificados con éxito.";

  }

  consultarSaldo() {
    return `El saldo de ${this.nombre} es $${this.saldo}`;
  }

  consignaciones(monto: number, idUser: string) {
    if (monto > 0) {
      this.saldo += monto;
      this.movimientoV2("consignacion", monto, idUser);
      this.guardar();
      return `Consignacion exitosa. Nuevo saldo $${this.saldo}`;
    } else {
      return `El monto debe ser mayor a 0`;
    }
  }

  retiros(retiro: number) {
    if (retiro > 0 && retiro <= this.saldo) {
      this.saldo -= retiro;
      this.movimientoV2("retiro", retiro, this.documento);
      this.guardar();
      return `Retiro exitoso. Saldo actual $${this.saldo}`;
    } else {
      return `Revise monto a retirar. Monto a retirar debe ser mayor a 0 y no puede ser mayor al saldo`;
    }
  }

  consultarMovimientos() {
    if (this.historial.length === 0) {
      return `${this.nombre} no tiene movimientos registrados`;
    }
    return `historial de movimientos ${this.nombre}: \n${this.historial.join(
      "\n"
    )}`;
  }

  transferencias(monto: number, cliente: Cliente) {
    if (monto <= 0) {
      return `Debe ser mayor a 0`;
    }
    if (monto > this.saldo) {
      return `Fondos insuficientes`;
    }
    this.saldo -= monto;
    cliente.saldo += monto;
    this.movimientoV2("retiro", monto, this.documento);
    cliente.movimientoV2("consignacion", monto, this.documento);
    this.guardar();
    cliente.guardar();
    console.log(
      `Transferencia de $${monto} a ${cliente.nombre} exitosa. Nuevo saldo: $${this.saldo}`
    );
  }

  movimientoV2(tipo: "retiro" | "consignacion", monto: number, idUser: string) {
    const usuario = readDb()[idUser];
    if (!usuario) return;

    const movimiento = {
      id: Date.now(),
      tipo,
      monto,
      fecha: new Date().toLocaleString(),
    };

    const usuarioActualizado = {
      ...usuario,
      saldo:
        tipo === "retiro"
          ? usuario.saldo - movimiento.monto
          : usuario.saldo + movimiento.monto,
      movimientos: [...usuario.movimientos, movimiento],
    };
  }

  guardar() {
    const usuarios = readDb();
    usuarios[this.documento] = {
      ...(this as unknown as Usuario),
    };
    writeDb(usuarios);
    return true;
  }

  static cargar(usuario: string): Cliente | null {
    const data = localStorage.getItem(usuario);
    if (data) {
      const obj = JSON.parse(data);
      const cliente = new Cliente({
        nombre: obj.nombre,
        apellido: obj.apellido,
        documento: obj.documento,
        direccion: obj.direccion,
        usuario: obj.usuario,
        contrasena: obj.contrasena,
        saldo: obj.saldo,
      } as ICliente);
      cliente.historial = obj.historial;
      return cliente;
    }
    return null;
  }
}
