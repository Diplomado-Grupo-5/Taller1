import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  Receipt, 
  TrendingUp, 
  Wallet, 
  PieChart, 
  Tags, 
  CreditCard, 
  LogOut 
} from "lucide-react";
import { cn } from "../lib/utils";

type Props = {
    current: string;
    onChange: (page: string) => void;
};

export default function SidebarMenu({ current, onChange }: Props) {
    const { logout, user } = useAuth();

    const menuItems = [
        { id: "dashboard", label: "Resumen", icon: LayoutDashboard },
        { id: "expenses", label: "Gastos", icon: Receipt },
        { id: "incomes", label: "Ingresos", icon: TrendingUp },
        { id: "budgets", label: "Presupuestos", icon: Wallet },
        { id: "reports", label: "Reportes", icon: PieChart },
    ];

    const configItems = [
        { id: "categories", label: "Categorías", icon: Tags },
        { id: "accounts", label: "Cuentas", icon: CreditCard },
    ];

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center gap-2 px-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">G</div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Gastos</h2>
            </div>

            <nav className="flex flex-col gap-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                          key={item.id}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                            current === item.id 
                              ? "bg-indigo-50 text-indigo-600" 
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          )}
                          onClick={() => onChange(item.id)}
                      >
                          <Icon className="w-4 h-4" />
                          {item.label}
                      </button>
                    );
                })}

                <div className="mt-6 mb-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Configuración</div>
                
                {configItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                          key={item.id}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                            current === item.id 
                              ? "bg-indigo-50 text-indigo-600" 
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          )}
                          onClick={() => onChange(item.id)}
                      >
                          <Icon className="w-4 h-4" />
                          {item.label}
                      </button>
                    );
                })}
            </nav>

            <div className="mt-auto pt-4 border-t border-slate-100">
                <div className="px-3 mb-4">
                    <p className="text-sm font-bold text-slate-800">{user?.nombre}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.correo}</p>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}
