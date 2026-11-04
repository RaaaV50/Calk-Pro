const NOME_CACHE = 'calk-pro-shell-v1';
const ARQUIVOS_ESSENCIAIS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches
      .open(NOME_CACHE)
      .then((cache) => cache.addAll(ARQUIVOS_ESSENCIAIS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((chaves) =>
        Promise.all(
          chaves
            .filter((chave) => chave !== NOME_CACHE)
            .map((chave) => caches.delete(chave))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (evento) => {
  const requisicao = evento.request;
  if (requisicao.method !== 'GET') return;

  const url = new URL(requisicao.url);
  if (url.origin !== self.location.origin) return;

  evento.respondWith(
    fetch(requisicao)
      .then((respostaRede) => {
        if (respostaRede && respostaRede.status === 200) {
          const copia = respostaRede.clone();
          caches.open(NOME_CACHE).then((cache) => cache.put(requisicao, copia));
        }
        return respostaRede;
      })
      .catch(async () => {
        const emCache = await caches.match(requisicao);
        if (emCache) return emCache;
        if (requisicao.mode === 'navigate') {
          return caches.match('/index.html');
        }
        throw new Error('Sem conexão');
      })
  );
});

