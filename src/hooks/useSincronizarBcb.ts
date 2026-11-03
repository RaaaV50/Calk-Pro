import { useEffect } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';

export function useSincronizarBcb() {
  const taxasMercado = useFinanceStore((estado) => estado.taxasMercado);
  const sincronizandoBcb = useFinanceStore((estado) => estado.sincronizandoBcb);
  const erroBcb = useFinanceStore((estado) => estado.erroBcb);
  const sincronizarComBancoCentral = useFinanceStore(
    (estado) => estado.sincronizarComBancoCentral
  );

  useEffect(() => {
    void sincronizarComBancoCentral(false);
  }, [sincronizarComBancoCentral]);

  return {
    taxasMercado,
    sincronizandoBcb,
    erroBcb,
    forcarSincronizacao: () => sincronizarComBancoCentral(true),
  };
}

