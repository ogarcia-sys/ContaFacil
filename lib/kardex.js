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
