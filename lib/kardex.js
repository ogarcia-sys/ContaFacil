import { supabase } from "@/lib/supabaseClient";

export async function obtenerProductos(empresaId) {
  const { data, error } = await supabase
    .from("productos")
    .select(
      `id, codigo, nombre, unidad, cuenta_inventario_id, cuenta_costo_venta_id,
       cuenta_inventario:cuenta_inventario_id ( codigo, nombre ),
       cuenta_costo_venta:cuenta_costo_venta_id ( codigo, nombre )`
    )
    .eq("empresa_id", empresaId)
    .order("nombre");
  if (error) throw error;
  return data || [];
}

export async function obtenerKardex(productoId) {
  const { data, error } = await supabase
    .from("kardex_movimientos")
    .select("*")
    .eq("producto_id", productoId)
    .order("fecha")
    .order("created_at");
  if (error) throw error;
  return data || [];
}

// Último renglón del kardex = saldo actual (cantidad, costo unitario, costo total).
export function saldoActual(movimientos) {
  if (!movimientos || movimientos.length === 0) {
    return { cantidad: 0, costoUnitario: 0, costoTotal: 0 };
  }
  const u = movimientos[movimientos.length - 1];
  return {
    cantidad: Number(u.saldo_cantidad),
    costoUnitario: Number(u.saldo_costo_unitario),
    costoTotal: Number(u.saldo_costo_total),
  };
}

// Ordena movimientos cronológicamente (fecha y, en caso de empate, el
// momento en que se registraron) — así se determina en qué orden se
// van acumulando las entradas y salidas.
export function ordenarKardex(a, b) {
  if (a.fecha !== b.fecha) return a.fecha < b.fecha ? -1 : 1;
  return (a.created_at || "").localeCompare(b.created_at || "");
}

// Recalcula costo_unitario/costo_total/saldo_* para una secuencia de
// movimientos ya ordenados cronológicamente (costo promedio ponderado).
// Para "entrada" el costo unitario es el que se ingresó (costo de compra,
// no cambia); para "salida" se recalcula como el promedio justo antes de
// esa salida. Devuelve { error } si en algún punto el inventario quedaría
// negativo, o { resultado } con la lista recalculada si todo cuadra.
export function recalcularSecuencia(movimientosOrdenados) {
  let cantidad = 0;
  let costoTotal = 0;
  let costoUnitario = 0;
  const resultado = [];

  for (const m of movimientosOrdenados) {
    const cant = Number(m.cantidad);
    if (m.tipo === "entrada") {
      const cu = Number(m.costo_unitario);
      const ct = cant * cu;
      cantidad += cant;
      costoTotal += ct;
      costoUnitario = cantidad > 0 ? costoTotal / cantidad : 0;
      resultado.push({
        ...m,
        costo_unitario: cu,
        costo_total: ct,
        saldo_cantidad: cantidad,
        saldo_costo_unitario: costoUnitario,
        saldo_costo_total: costoTotal,
      });
    } else {
      if (cant > cantidad + 0.0001) {
        return {
          error: `La salida de ${cant} del ${m.fecha} dejaría el inventario en negativo (en ese momento solo habría ${cantidad.toFixed(
            2
          )} disponibles).`,
        };
      }
      const cu = costoUnitario;
      const ct = cant * cu;
      cantidad -= cant;
      costoTotal -= ct;
      costoUnitario = cantidad > 0 ? costoTotal / cantidad : costoUnitario;
      resultado.push({
        ...m,
        costo_unitario: cu,
        costo_total: ct,
        saldo_cantidad: cantidad,
        saldo_costo_unitario: costoUnitario,
        saldo_costo_total: costoTotal,
      });
    }
  }
  return { resultado };
}
