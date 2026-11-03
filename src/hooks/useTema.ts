import { useEffect } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';

export function useTema() {
  const tema = useFinanceStore((estado) => estado.tema);
  const alternarTema = useFinanceStore((estado) => estado.alternarTema);
  const definirTema = useFinanceStore((estado) => estado.definirTema);

  useEffect(() => {
    const raiz = document.documentElement;
    if (tema === 'escuro') {
      raiz.classList.add('dark');
    } else {
      raiz.classList.remove('dark');
    }
  }, [tema]);

  return { tema, alternarTema, definirTema };
}

