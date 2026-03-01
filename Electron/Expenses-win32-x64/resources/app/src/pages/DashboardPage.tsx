import { useMemo } from 'react';
import { useGastos } from '../api/gastos.queries';
import { useIngresos } from '../api/ingresos.queries';
import { usePresupuestos } from '../api/presupuestos.queries';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-CO', { 
    style: 'currency', 
    currency: 'COP', 
    minimumFractionDigits: 0 
  }).format(n);
}

export default function DashboardPage() {
  const mesActual = new Date().getMonth() + 1;
  const anioActual = new Date().getFullYear();

  const { data: gastos = [] } = useGastos();
  const { data: ingresos = [] } = useIngresos();
  const { data: presupuestos = [] } = usePresupuestos(anioActual, mesActual);

  const stats = useMemo(() => {
    const gastosMes = gastos.filter(g => {
      const d = new Date(g.fecha);
      return d.getMonth() + 1 === mesActual && d.getFullYear() === anioActual;
    });

    const ingresosMes = ingresos.filter(i => {
      const d = new Date(i.fecha);
      return d.getMonth() + 1 === mesActual && d.getFullYear() === anioActual;
    }).reduce((sum, i) => sum + Number(i.monto), 0);

    const totalGastado = gastosMes.reduce((sum, g) => sum + Number(g.monto), 0);
    const totalPresupuestado = presupuestos.reduce((sum, p) => sum + Number(p.cantidad), 0);
    
    const balance = ingresosMes - totalGastado;
    const ahorro = ingresosMes > 0 ? ((ingresosMes - totalGastado) / ingresosMes) * 100 : 0;

    return {
      ingresosMes,
      totalGastado,
      totalPresupuestado,
      balance,
      ahorro: Math.max(0, ahorro),
      gastosRecientes: gastos.slice(0, 5)
    };
  }, [gastos, ingresos, presupuestos, mesActual, anioActual]);

  if (!stats) return <div className="flex items-center justify-center h-full">Cargando dashboard...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Resumen Financiero</h1>
        <p className="text-slate-500">Aquí tienes un vistazo de tus finanzas este mes.</p>
      </div>

      {/* Cards de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Ingresos del Mes</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(stats.ingresosMes)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Gastos del Mes</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{formatCurrency(stats.totalGastado)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Balance Actual</p>
          <p className={`text-2xl font-bold mt-1 ${stats.balance >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
            {formatCurrency(stats.balance)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Capacidad de Ahorro</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats.ahorro.toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Presupuesto vs Real */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Estado de Presupuestos</h2>
          <div className="space-y-4">
            {presupuestos.slice(0, 4).map(p => {
              const gastado = (gastos ?? [])
                .filter(g => {
                  const d = new Date(g.fecha);
                  return g.categoriaId === p.categoriaId && d.getMonth() + 1 === mesActual && d.getFullYear() === anioActual;
                })
                .reduce((sum, g) => sum + Number(g.monto), 0);
              const porcentaje = Math.min(100, (gastado / Number(p.cantidad)) * 100);
              
              return (
                <div key={p.id}>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="font-medium text-slate-700">{p.categoria?.nombre}</span>
                    <span className="text-slate-500">{formatCurrency(gastado)} / {formatCurrency(Number(p.cantidad))}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${porcentaje > 90 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {presupuestos.length === 0 && <p className="text-slate-500 text-center py-4 italic">No hay presupuestos configurados para este mes.</p>}
          </div>
        </div>

        {/* Últimos Movimientos */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Últimos Gastos</h2>
          <div className="space-y-4">
            {stats.gastosRecientes.map(g => (
              <div key={g.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">
                    💸
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{g.descripcion}</p>
                    <p className="text-xs text-slate-500">{new Date(g.fecha).toLocaleDateString('es-CO')}</p>
                  </div>
                </div>
                <p className="font-bold text-rose-600">-{formatCurrency(Number(g.monto))}</p>
              </div>
            ))}
            {stats.gastosRecientes.length === 0 && <p className="text-slate-500 text-center py-4 italic">Aún no hay gastos registrados.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
