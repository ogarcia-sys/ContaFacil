"use client";

import { useEffect, useState } from "react";
import { useEmpresa } from "@/lib/EmpresaContext";
import {
  obtenerCuentasConMovimientos,
  calcularEstadoResultados,
  calcularBalanceGeneral,
  formatoMoneda,
} from "@/lib/contabilidad";

export default function BalanceGeneralPage() {
  const { empresa, empresaId } = useEmpresa();
  const [cargando, setCargando] = useState(true);
  const [datos, setDatos] = useState(null);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    obtenerCuentasConMovimientos(empresaId).then((cuentas) => {
      if (!activo) return;
      const resultados = calcularEstadoResultados(cuentas);
      setDatos(calcularBalanceGeneral(cuentas, resultados.utilidadNeta));
      setCargando(false);
    });
    return () => {
      activo = false;
    };
  }, [empresaId]);

  if (cargando || !datos) {
    return <p className="text-inkSoft text-sm">Calculando…</p>;
  }

  const sinDatos =
    datos.activos.length === 0 && datos.pasivos.length === 0 && datos.capital.length === 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-lg font-semibold">
            Balance General (Estado de Situación Financiera)
          </h2>
          <p className="text-xs text-inkSoft">{empresa?.nombre}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="text-xs text-inkSoft hover:text-ink underline underline-offset-2 no-print"
        >
          Imprimir
        </button>
      </div>

      {sinDatos ? (
        <p className="text-inkSoft text-sm">Todavía no hay movimientos registrados.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#F7F4EA] border border-paperLine rounded-sm p-6">
              <h3 className="font-display font-semibold mb-3">Activo</h3>
              <table className="w-full text-sm">
                <tbody>
                  {datos.activos.map((l) => (
                    <tr key={l.cuenta.id}>
                      <td className="py-0.5">{l.cuenta.nombre}</td>
                      <td className="py-0.5 font-num text-right tabular">
                        {formatoMoneda(l.monto)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-ink font-semibold">
                    <td className="pt-2">Total Activo</td>
                    <td className="pt-2 font-num text-right tabular">
                      {formatoMoneda(datos.totalActivo)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="space-y-6">
              <div className="bg-[#F7F4EA] border border-paperLine rounded-sm p-6">
                <h3 className="font-display font-semibold mb-3">Pasivo</h3>
                <table className="w-full text-sm">
                  <tbody>
                    {datos.pasivos.map((l) => (
                      <tr key={l.cuenta.id}>
                        <td className="py-0.5">{l.cuenta.nombre}</td>
                        <td className="py-0.5 font-num text-right tabular">
                          {formatoMoneda(l.monto)}
                        </td>
                      </tr>
                    ))}
                    {datos.pasivos.length === 0 && (
                      <tr>
                        <td className="py-0.5 text-inkSoft text-xs">Sin pasivos registrados</td>
                        <td></td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-paperLine font-medium">
                      <td className="pt-2">Total Pasivo</td>
                      <td className="pt-2 font-num text-right tabular">
                        {formatoMoneda(datos.totalPasivo)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="bg-[#F7F4EA] border border-paperLine rounded-sm p-6">
                <h3 className="font-display font-semibold mb-3">Capital</h3>
                <table className="w-full text-sm">
                  <tbody>
                    {datos.capital.map((l) => (
                      <tr key={l.cuenta.id}>
                        <td className="py-0.5">{l.cuenta.nombre}</td>
                        <td className="py-0.5 font-num text-right tabular">
                          {formatoMoneda(l.monto)}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className="py-0.5">
                        {datos.utilidadNeta >= 0 ? "Utilidad del periodo" : "Pérdida del periodo"}
                      </td>
                      <td
                        className={`py-0.5 font-num text-right tabular ${
                          datos.utilidadNeta >= 0 ? "text-ledger" : "text-rust"
                        }`}
                      >
                        {formatoMoneda(datos.utilidadNeta)}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-paperLine font-medium">
                      <td className="pt-2">Total Capital</td>
                      <td className="pt-2 font-num text-right tabular">
                        {formatoMoneda(datos.totalCapital)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="border-t-2 border-ink pt-2 flex justify-between text-sm font-semibold px-1">
                <span>Total Pasivo + Capital</span>
                <span className="font-num tabular">
                  {formatoMoneda(datos.totalPasivoCapital)}
                </span>
              </div>
            </div>
          </div>

          <p className={`text-sm mt-4 ${datos.cuadra ? "text-ledger" : "text-rust"}`}>
            {datos.cuadra
              ? "✓ El balance cuadra: Activo = Pasivo + Capital."
              : "⚠ El balance no cuadra — revisa las partidas registradas."}
          </p>
        </>
      )}
    </div>
  );
}
