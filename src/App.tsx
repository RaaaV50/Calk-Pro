import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Simulador = lazy(() => import('./pages/Simulador'));
const ComparadorRendaFixa = lazy(() => import('./pages/ComparadorRendaFixa'));
const IndependenciaFinanceira = lazy(() => import('./pages/IndependenciaFinanceira'));
const Financiamento = lazy(() => import('./pages/Financiamento'));
const CenariosSalvos = lazy(() => import('./pages/CenariosSalvos'));
const Configuracoes = lazy(() => import('./pages/Configuracoes'));

function CarregandoPagina() {
  return (
    <div className="h-64 flex items-center justify-center text-sm font-medium text-zinc-400">
      Carregando módulo...
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Suspense fallback={<CarregandoPagina />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cenarios" element={<CenariosSalvos />} />
            <Route path="/simulador" element={<Simulador />} />
            <Route path="/renda-fixa" element={<ComparadorRendaFixa />} />
            <Route path="/independencia" element={<IndependenciaFinanceira />} />
            <Route path="/financiamento" element={<Financiamento />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </MainLayout>
    </BrowserRouter>
  );
}
