"use client";

import { useEffect, useState } from "react";
import { useEmpresa } from "@/lib/EmpresaContext";
import { obtenerCuentasConMovimientos, formatoMoneda } from "@/lib/contabilidad";
import CuentaCombobox from "@/lib/CuentaCombobox";

export default function MayorPage() {
  const { cuentas, empresaId } = useEmpresa();
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cuentaId, setCuentaId] = useState("todas");

  useEffect(() => {
    let activo = true;
    setCargando(true);
    obtenerCuentasConMovimientos(empresaId).then((data) => {
      if (activo) {
        setDatos(data);
        setCargando(false);
      }
    });
    return () => {
      activo = false;
    };
  }, [empresaId]);

  if (cargando) {
    return <p className="text-inkSoft text-sm">Cargando mayor…</p>;
  }

  const cuentasAMostrar =
    cuentaId === "todas" ? datos : datos.filter((c) => c.id === cuentaId);

  const conMovimientos = cuentasAMostrar.filter((c) => (c.movimientos || []).length > 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 no-print">
        <h2 className="font-display text-lg font-semibold">Libro Mayor</h2>
        <div className="flex items-center gap-3">
          <div className="w-64">
            <CuentaCombobox
              cuentas={cuentas}
              value={cuentaId === "todas" ? "" : cuentaId}
              onChange={(id) => setCuentaId(id || "todas")}
              placeholder="Buscar cuenta… (vacío = todas)"
            />
          </div>
          {cuentaId !== "todas" && (
            <button
              onClick={() => setCuentaId("todas")}
              className="text-xs text-inkSoft hover:text-ink underline underline-offset-2"
            >
              Ver todas
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="text-xs text-inkSoft hover:text-ink underline underline-offset-2"
          >
            Imprimir
          </button>
        </div>
      </div>

      {conMovimientos.length === 0 ? (
        <p className="text-inkSoft text-sm">
          Esta cuenta todavía no tiene movimientos registrados.
        </p>
      ) : (
        <div className="space-y-6">
          {conMovimientos.map((cuenta) => {
            const movs = [...cuenta.movimientos].sort((a, b) => {
              const fa = a.transacciones?.numero_partida ?? 0;
              const fb = b.transacciones?.numero_partida ?? 0;
              return fa - fb;
            });

            let saldo = 0;
            const filas = movs.map((m) => {
              saldo += Number(m.debe) - Number(m.haber);
              return { ...m, saldoCorrido: saldo };
            });

            const totalDebe = movs.reduce((a, m) => a + Number(m.debe), 0);
            const totalHaber = movs.reduce((a, m) => a + Number(m.haber), 0);

            return (
              <div
                key={cuenta.id}
                className="bg-[#F7F4EA] border border-paperLine rounded-sm overflow-hidden"
              >
                <div className="px-4 py-2 bg-ink text-paper text-sm font-medium flex justify-between">
                  <span>
                    {cuenta.codigo} — {cuenta.nombre}
                  </span>
                  <span className="text-paper/70 text-xs uppercase tracking-wide">
                    {cuenta.clase}
                  </span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-inkSoft border-b border-paperLine">
                      <th className="px-3 py-2 font-medium">Partida</th>
                      <th className="px-3 py-2 font-medium">Fecha</th>
                      <th className="px-3 py-2 font-medium">Descripción</th>
                      <th className="px-3 py-2 font-medium w-24 text-right">Debe</th>
                      <th className="px-3 py-2 font-medium w-24 text-right">Haber</th>
                      <th className="px-3 py-2 font-medium w-28 text-right">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filas.map((m) => (
                      <tr key={m.id} className="border-t border-paperLine">
                        <td className="px-3 py-1.5 font-num">
                          N.° {m.transacciones?.numero_partida}
                        </td>
                        <td className="px-3 py-1.5">{m.transacciones?.fecha}</td>
                        <td className="px-3 py-1.5 text-inkSoft">
                          {m.transacciones?.descripcion}
                        </td>
                        <td className="px-3 py-1.5 font-num text-right tabular">
                          {m.debe > 0 ? formatoMoneda(m.debe) : ""}
                        </td>
                        <td className="px-3 py-1.5 font-num text-right tabular">
                          {m.haber > 0 ? formatoMoneda(m.haber) : ""}
                        </td>
                        <td className="px-3 py-1.5 font-num text-right tabular">
                          {formatoMoneda(Math.abs(m.saldoCorrido))}
                          {m.saldoCorrido < 0 ? " (H)" : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-paperLine font-medium">
                      <td colSpan={3} className="px-3 py-2 text-right text-xs text-inkSoft">
                        Totales
                      </td>
                      <td className="px-3 py-2 font-num text-right tabular">
                        {formatoMoneda(totalDebe)}
                      </td>
                      <td className="px-3 py-2 font-num text-right tabular">
                        {formatoMoneda(totalHaber)}
                      </td>
                      <td className="px-3 py-2 font-num text-right tabular">
                        {formatoMoneda(Math.abs(saldo))} {saldo < 0 ? "(H)" : "(D)"}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
