# Crunchyroll Data Scraper

Este é um script em JavaScript que obtém informações sobre os animes disponíveis no Crunchyroll, incluindo detalhes sobre temporadas e episódios.

Gera uma página .html com uma interface amigável para localizar animes e seus links rapidamente.

Para achar animes em sua linguagem preferida, use o código de linguagem, exemplo: CTRL+F >> `Audio pt-BR`.

Para achar temporadas 100% grátis, procure por `100%`

Caso não queira executar o script, o HTML em pt_BR atualizado em 12/02/2024 está disponível aqui:

https://github.com/gabrielmarins0/CR_Data_Scraper/releases/download/Update1.1/index_pt_br.html

## Funcionalidades

- Autentica-se com a API do Crunchyroll para obter um token de acesso.
- Recupera uma lista de animes disponíveis no Crunchyroll.
- Para cada anime, obtém informações sobre temporadas e episódios, separando por temporada e linguagem.
- Gera um arquivo HTML que organiza as informações em uma página web amigável.
- Gera um arquivo JSON com várias informações sobre os animes.
- Os episódios são classificados por idioma e porcentagem de episódios gratuitos.
- Permite ao usuário copiar facilmente os links dos episódios.

## Como usar

1. Não é necessário clonar este repositório.
2. Na variável `basicAuthToken` percebi que ela não se altera, independente do dispositivo que uso para acesso, caso ela se altere futuramente, atualizarei neste repositório.
3. Na variável `animesPerRequest` defina a quantidade de animes que serão extraídos, quanto mais animes, mais demorado.   
4. Na variável `preferLocale` defina sua preferência de idioma:
   - `pt-BR` (Português - Brasil)
   - `en-US` (Inglês - Estados Unidos)
   - `es-ES` (Espanhol - Espanha)
   - `fr-FR` (Francês - França)
   - `de-DE` (Alemão - Alemanha)
   - `it-IT` (Italiano - Itália)
   - `ja-JP` (Japonês - Japão)
   - `ko-KR` (Coreano - Coreia do Sul)
   - `zh-CN` (chinês Simplificado - China)
   - `ru-RU` (Russo - Rússia)
5. Acesse o site da Crunchyroll e abra o console do navegador. (Testado apenas no Chrome).
6. Abra o arquivo de script aqui no GitHub ou faça download dele, copie o código do script e cole no console do navegador.
7. Execute o script e aguarde. Ao finalizar, serão gerados dois arquivos, um HTML e um JSON. Você deve permitir o download de múltiplos arquivos quando o site da Crunchyroll solicitar.
