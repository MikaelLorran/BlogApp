//Carregando módulos
const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
var handle = exphbs.create({
	defaultLayout: "main",
});
const admin = require("./routes/admin");
const usuarios = require("./routes/usuarios");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const Postagem = require("./models/Postagens");
const Categoria = require("./models/Categorias");
const { format } = require("date-fns");
const { ptBR } = require("date-fns/locale");
const passport = require("passport");
require("./config/auth")(passport);
const { eAdmin } = require("./helpers/eAdmin");
const Usuario = require("./models/Usuario");
const { isUser } = require("./helpers/isUser");

//Configs
//O código "app.use" serve para configuração de middlewares

//Sessão
app.use(
	session({
		secret: "cursodenode", //Chave para sessão, pode ser informado qualquer coisa, mas é bom que seja dificl pela segurança
		resave: true,
		saveUninitialized: true,
	})
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//Middleware
app.use((req, res, next) => {
	console.log(req.user);

	res.locals.success_msg = req.flash("success_msg"); //Variavél global
	res.locals.error_msg = req.flash("error_msg");
	res.locals.error = req.flash("error");

	next();
});
app.use(async (req, res, next) => {
	try {
		if (req.isAuthenticated()) {
			const user = await Usuario.findById(req.user.id).exec();
			res.locals.usuarios = user || null;
			res.locals.isAdmin = user ? user.eAdmin == 1 : true;
		} else {
			res.locals.usuarios = null;
			res.locals.isAdmin = false;
		}
		next();
	} catch (error) {
		console.error("Erro ao buscar usuário do banco de dados:", error);
		res.locals.usuarios = null;
		res.locals.isAdmin = false;
		next();
	}
});

//Handlebars
app.engine("handlebars", handle.engine);
app.set("view engine", "handlebars");

//Função do express que substitui o Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Mongoose
mongoose.Promise = global.Promise;
mongoose
	.connect("mongodb://localhost/blogapp", {})
	.then(() => {
		console.log("Conectado ao Mongo");
	})
	.catch((erro) => {
		console.log("Erro ao se conectar: " + erro);
	});

// Criando usuário administrador padrão
async function criarUsuarioAdmin() {
	try {
		const usuarioExistente = await Usuario.findOne({
			email: "admin@admin.com",
		});
		if (!usuarioExistente) {
			const admin = new Usuario({
				nome: "admin",
				email: "admin@admin.com",
				senha: "admin1234",
				eAdmin: 1,
			});
			await admin.save();
			console.log("Usuário administrador criado com sucesso!");
		} else {
			console.log("Usuário administrador já existe.");
		}
	} catch (error) {
		console.error("Erro ao criar usuário administrador:", error);
	}
}

// Executando a criação do usuário admin
criarUsuarioAdmin();

//Public
app.use(express.static(path.join(__dirname, "public")));

//Rotas
app.get("/", (req, res) => {
	Postagem.find()
		.populate("categoria")
		.sort({ data: "desc" })
		.lean()
		.then((postagens) => {
			postagens.forEach((postagem) => {
				postagem.dataFormatada = format(
					postagem.data,
					"dd 'de' MMMM 'de' yyyy",
					{ locale: ptBR }
				);
			});

			res.render("index", { postagens: postagens });
		})
		.catch((erro) => {
			req.flash("error_msg", "Houve um erro interno");
			res.redirect("/404");
		});
});

app.get("/postagem/:slug", isUser, (req, res) => {
	Postagem.findOne({ slug: req.params.slug })
		.lean()
		.then((postagem) => {
			if (postagem) {
				postagem.dataFormatada = format(
					postagem.data,
					"dd 'de' MMMM 'de' yyyy",
					{ locale: ptBR }
				);
				res.render("postagem/index", { postagem: postagem });
			} else {
				req.flash("error_msg", "Essa postagem não exite");
				res.redirect("/");
			}
		})
		.catch((erro) => {
			req.flash("error_msg", "Houve um erro interno");
		});
});

app.get("/404", (req, res) => {
	res.send("Erro 404");
});

app.get("/categorias", isUser, async (req, res) => {
	try {
		let categorias = await Categoria.find().lean();

		for (let i = 0; i < categorias.length; i++) {
			let numeroDePostagens = await Postagem.countDocuments({
				categoria: categorias[i]._id,
			});
			categorias[i].numeroDePostagens = numeroDePostagens;
		}
		res.render("categorias/index", { categorias: categorias });
	} catch (erro) {
		console.log(erro);
		req.flash("error_msg", "Houve um erro interno ao listar as categorias");
		res.redirect("/");
	}
});

app.get("/categorias/:slug", isUser, (req, res) => {
	Categoria.findOne({ slug: req.params.slug })
		.lean()
		.then((categoria) => {
			if (categoria) {
				Postagem.find({ categoria: categoria._id })
					.sort({ data: "desc" })
					.lean()
					.then((postagens) => {
						postagens.forEach((postagem) => {
							postagem.dataFormatada = format(
								postagem.data,
								"dd 'de' MMMM 'de' yyyy",
								{ locale: ptBR }
							);
						});
						res.render("categorias/postagens", {
							postagens: postagens,
							categoria: categoria,
						});
					});
			} else {
				req.flash("error_msg", "Essa categoria não existe");
				res.redirect("/");
			}
		})
		.catch((erro) => {
			req.flash(
				"error_msg",
				"Houve um errro interno ao carregar a página dessa catergoria"
			);
			res.redirect("/");
		});
});

app.use("/admin", admin);
app.use("/usuarios", usuarios);

//Outros
const PORT = 8081;
app.listen(PORT, () => {
	console.log("Servidor rodando!");
});
