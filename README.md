# Crunchyroll Anime Information Scraper

Este é um script JavaScript que obtém informações sobre os animes disponíveis no Crunchyroll, incluindo detalhes sobre temporadas e episódios.

## Funcionalidades

- Autentica-se com a API do Crunchyroll para obter um token de acesso.
- Recupera uma lista de animes disponíveis no Crunchyroll.
- Para cada anime, obtém informações sobre temporadas e episódios.
- Gera um arquivo HTML que organiza as informações em uma página web amigável.
- Gera um arquivo json com varias informações sobre os animes.
- Os episódios são classificados por idioma e porcentagem de episódios gratuitos.
- Permite ao usuário copiar facilmente os links dos episódios.

## Como usar

1. Não é necessário clonar este repositório.
2. Na variavel `basicAuthToken` percebi que ela não se altera, independente do dispositivo que uso para acesso, caso ela se altere futuramente, atualizarei neste reposítorio.
3. Na variavel `animesPerRequest` defina a quantidade de animes que serão extraidos, quanto mais animes, mais demorado.
   Em minha maquina, com uma conexão de 1000MBps, SSD, Ryzen 5600X, leva cerca de XX minutos para extrair todo o catalogo. Um log com a hora de inicio e final de execução é exibida no console do navegador.
3. Na variavel `preferLocale` defina sua preferência de idioma:
   - `pt-BR` (Português - Brasil)
   - `en-US` (Inglês - Estados Unidos)
   - `es-ES` (Espanhol - Espanha)
   - `fr-FR` (Francês - França)
   - `de-DE` (Alemão - Alemanha)
   - `it-IT` (Italiano - Itália)
   - `ja-JP` (Japonês - Japão)
   - `ko-KR` (Coreano - Coreia do Sul)
   - `zh-CN` (Chinês Simplificado - China)
   - `ru-RU` (Russo - Rússia)
4. Acesse o site da Crunchyroll e abra o console do navegador. (Testado apenas no Chrome).
5. Abra o arquivo de script aqui no GitHub ou faça download dele, copie o código do script e cole no console do navegador.
6. Execute o script e aguarde. Ao finalizar, serão gerados 2 arquivos, um HTML e um JSON. Você deve permitir o download de múltiplos arquivos quando o site da Crunchyroll solicitar.

