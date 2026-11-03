import { useEffect } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';

export function useTema() {
  const tema = useFinanceStore((estado) => estado.tema);
  const alternarTema = useFinanceStore((estado) => estado.alternarTema);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'escuro');
  }, [tema]);

  return { tema, alternarTema };
}
