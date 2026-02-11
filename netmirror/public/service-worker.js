const CACHE_NAME = 'netmirror-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
  // O Vite injeta o nome dos arquivos JS/CSS buildados dinamicamente,
  // mas como estamos manual, o cache dinâmico abaixo resolve.
];

// 1. Instalação: Cacheia o "App Shell" inicial
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Força o SW a ativar imediatamente
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Ativação: Limpa caches antigos se mudarmos a versão
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim(); // Controla a página imediatamente
});

// 3. Interceptação de Requisições (Fetch)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Estratégia para a API (/api/asn/): Network First (Tenta rede, falha pro cache)
  // Isso garante que o usuário sempre veja o dado mais novo do dia se tiver internet.
  if (url.pathname.includes('/api/asn/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Se deu certo, clona e atualiza o cache
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Se falhar (offline), tenta devolver o que tem no cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // Estratégia para Assets (JS, CSS, Imagens): Cache First (Tenta cache, falha pra rede)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        // Cacheia dinamicamente novos arquivos gerados pelo Vite
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});