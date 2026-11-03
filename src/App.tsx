import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

const Simulador = lazy(() => import('./pages/Simulador'));
const ComparadorRendaFixa = lazy(() => import('./pages/ComparadorRendaFixa'));
const PlanejadorMetas = lazy(() => import('./pages/PlanejadorMetas'));
const IndependenciaFinanceira = lazy(() => import('./pages/IndependenciaFinanceira'));
const Financiamento = lazy(() => import('./pages/Financiamento'));
const ConversorTaxas = lazy(() => import('./pages/ConversorTaxas'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function Carregando() {
  return (
    <div className="h-64 flex items-center justify-center text-xs font-semibold text-slate-400">
      Carregando calculadora...
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Suspense fallback={<Carregando />}>
          <Routes>
            <Route path="/" element={<Navigate to="/simulador" replace />} />
            <Route path="/simulador" element={<Simulador />} />
            <Route path="/comparador" element={<ComparadorRendaFixa />} />
            <Route path="/metas" element={<PlanejadorMetas />} />
            <Route path="/independencia" element={<IndependenciaFinanceira />} />
            <Route path="/financiamento" element={<Financiamento />} />
            <Route path="/conversor" element={<ConversorTaxas />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/simulador" replace />} />
          </Routes>
        </Suspense>
      </MainLayout>
    </BrowserRouter>
  );
}
