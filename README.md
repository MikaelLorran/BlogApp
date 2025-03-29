BlogApp - Plataforma de Blog com Node.js, Express e MongoDB

O BlogApp é uma aplicação de blog desenvolvida com Node.js, Express, MongoDB e Mongoose. Ele permite a criação, edição e gerenciamento de postagens e categorias, além de contar com um sistema de usuários com autenticação segura usando Bcrypt. A interface é construída com Handlebars para renderização dinâmica.

Tecnologias Utilizadas
- Node.js - Ambiente de execução JavaScript no backend
- Express - Framework para criação de servidores web
- MongoDB - Banco de dados NoSQL para armazenamento de dados
- Mongoose - Modelagem de dados para MongoDB
- Handlebars - Template engine para renderização dinâmica
- Bcrypt - Biblioteca para criptografia de senhas


Estrutura do Banco de Dados

O BlogApp contém três coleções principais:
- Usuários (usuarios) - Cadastro de usuários, com controle de permissões administrativas.
- Postagens (postagens) - Armazena artigos, incluindo título, descrição, conteúdo e referência a uma categoria.
- Categorias (categorias) - Organização das postagens por temas específicos.

Como Configurar

Instale as dependências:
- npm install express express-handlebars mongoose express-session connect-flash date-fns passport bcryptjs path

*Inicie o MongoDB localmente ou conecte-se a um servidor MongoDB Atlas.


Execute o script principal:
- node app.js

O banco de dados será criado e um usuário administrador será cadastrado automaticamente.

Usuário Administrador Padrão
- Nome: admin
- Email: admin@admin.com
- Senha: admin1234 (criptografada com Bcrypt)
- eAdmin: 1

