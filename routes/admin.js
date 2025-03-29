const express = require('express')
const router = express.Router()
const Categoria = require("../models/Categorias")
const Postagem = require("../models/Postagens")
const {eAdmin} = require("../helpers/eAdmin")



router.get('/', eAdmin, (req, res) => {
    res.render("admin/index")
})

router.get('/posts', eAdmin, (req, res) => {
    res.send("Página de posts")
})

router.get('/categorias', eAdmin, (req, res) => {
    Categoria.find().lean().sort({date: 'desc'}).then((categorias) =>{
        res.render("admin/categorias", {categorias: categorias})
    }).catch((erro) =>{
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/admin")
    })
})

router.get('/categorias/add', eAdmin, (req, res) => {
    res.render("admin/addcategorias")
})

router.post("/categorias/nova", eAdmin, (req, res) => {
    
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({
            texto: "Nome inválido"
        })
    }
    
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({
            texto: "Slug inválido"
        })
    }

    if(req.body.nome.length < 2){
        erros.push({
            texto: "O nome da categoria é muito pequeno"
        })
    }

    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros})
    }
    
    else{
   
    const novaCategoria = {
        nome: req.body.nome,
        slug: req.body.slug
    }

    new Categoria(novaCategoria).save().then(() => {
        req.flash("success.msg", "Categoria criada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((erro)=> {
        req.flash("error_msg", "Houve um erro ao salvar a categoria. Por favor tente novamente!")
        res.redirect("/admin/categorias")
    })
    }   
})

router.get("/categorias/edit/:id", eAdmin, (req, res) =>{
    Categoria.findOne({_id:req.params.id}).lean().then((categoria) => {
        res.render("admin/editcategorias", {categoria:categoria})
    }).catch((erro) => {
        res.flash("error_msg", "Está categoria não existe")
        res.redirect("/admin/categorias")
    })
})

router.post("/categorias/edit", eAdmin, (req, res) => {
    Categoria.findOne({ _id: req.body.id }).then((categoria) => {
        var erros = []

        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
            erros.push({
                texto: "Nome inválido"
            })
        }
        
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            erros.push({
                texto: "Slug inválido"
            })
        }

        if(req.body.nome.length < 2){
            erros.push({
                texto: "O nome da categoria é muito pequeno"
            })
        }

        if(erros.length > 0){
            Categoria.findOne({ _id: req.body.id }).lean().then((categoria) => {
                res.render("admin/editcategorias", {erros: erros})
            }).catch((err) => {
                req.flash("error_msg", "Erro ao pegar os dados")
                res.redirect("admin/categorias")
            })
        }
        
        else{
            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            categoria.save().then(() => {
                req.flash("success_msg", "Categoria editada com successo!")
                res.redirect("/admin/categorias")
            }).catch((erro) =>{
                req.flash("error_msg", "Houve um erro interno ao salvar a edição! Por favor, tente novamente mais tarde.")
                res.redirect("/admin/categorias")
            })                
        }
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao editar a categoria")
        res.redirect("/admin/categorias")
    })     
})

router.get("/categorias/excluir/:id", eAdmin, (req, res) => {
    Categoria.findOneAndDelete({_id: req.params.id}).then(() =>{
        req.flash("success_msg", "Categoria excluida com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((erro) =>{
        req.flash("error_msg", "Houve um erro ao excluir a categoria")
        res.redirect("/admin/categorias")
    })
})

router.get("/postagens", eAdmin, (req,res) => {
    Postagem.find().lean().populate("categoria").sort({date: 'desc'}).then((postagens) =>{
        res.render("admin/postagens", {postagens: postagens})
    }).catch((erro) =>{
        req.flash("error_msg", "Houve um erro ao listar as postagens")
        res.redirect("/admin")
    })
})

router.get("/postagens/add", eAdmin, (req,res) => {
    Categoria.find().lean().then((categorias) =>{
        res.render("admin/addpostagens", {categorias: categorias})
    }).catch((erro) =>{
        req.flash("error_msg", "Houve um erro ao carregar o formulário")
        res.redirect("/admin/postagens")
    })
})

router.post("/postagens/nova", eAdmin, (req,res) => {
      
    var erros = []

    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({
            texto: "Título inválido"
        })
    }
    
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({
            texto: "Slug inválido"
        })
    }
    
    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({
            texto: "Descrição inválida"
        })
    }
    
    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({
            texto: "Conteúdo inválido"
        })
    }

    if(req.body.titulo.length < 2){
        erros.push({
            texto: "O título é muito pequeno"
        })
    }
    
    if(req.body.descricao.length < 5){
        erros.push({
            texto: "A descrição é muito pequena"
        })
    }
    
    if(req.body.conteudo.length < 15){
        erros.push({
            texto: "O conteúdo é muito pequeno"
        })
    }

    if(req.body.categoria == "0"){
        erros.push({
            texto:"Categoria inválida! Registre um categoria antes de prosseguir"
        })
    }

    if(erros.length > 0){
        Categoria.find().lean().then((categorias) =>{
            res.render("admin/addpostagens", {erros: erros, categorias: categorias})
        }).catch((erro) =>{
            req.flash("erro_msg", "Houve um erro ao carregar o formulário")
            res.redirect("/admin/postagens")
        })
    }
    else{
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }
    
        new Postagem(novaPostagem).save().then(() => {
            req.flash("success.msg", "Postagem criada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((erro)=> {
            req.flash("error_msg", "Houve um erro ao salvar a postagem. Por favor tente novamente!")
            res.redirect("/admin/postagens")
        })
    }   
})

router.get("/postagens/edit/:id", eAdmin, (req,res) => {

    Postagem.findOne({_id: req.params.id}).lean().then((postagem) =>{
        Categoria.find().lean().then((categorias) => {
            res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})
        }).catch((erro) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            res.redirect("admin/postagens")
        })
    }).catch((erro) =>{
        req.flash("error_msg", "Houve um erro carregar o formulário de edição")
        res.redirect("/admin/postagens")
    })
})

router.post("/postagem/edit", eAdmin, (req,res) => {
    Postagem.findOne({_id: req.body.id}).then((postagem) =>{
    
    var erros = []

    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({
            texto: "Título inválido"
        })
    }
    
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({
            texto: "Slug inválido"
        })
    }
    
    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({
            texto: "Descrição inválida"
        })
    }
    
    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({
            texto: "Conteúdo inválido"
        })
    }

    if(req.body.titulo.length < 2){
        erros.push({
            texto: "O título é muito pequeno"
        })
    }
    
    if(req.body.descricao.length < 5){
        erros.push({
            texto: "A descrição é muito pequena"
        })
    }
    
    if(req.body.conteudo.length < 15){
        erros.push({
            texto: "O conteúdo é muito pequeno"
        })
    }

    if(req.body.categoria == "0"){
        erros.push({
            texto:"Categoria inválida! Registre um categoria antes de prosseguir"
        })
    }

    if(erros.length > 0){
        Categoria.find().lean().then((categorias) =>{
            res.render("admin/editpostagens", {erros: erros, categorias: categorias})
        }).catch((erro) =>{
            req.flash("erro_msg", "Houve um erro ao carregar o formulário")
            res.redirect("/admin/postagens")
        })
    }
    else{
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria
        postagem.data = new Date

        postagem.save().then(() => {
            req.flash("success_msg", "Postagem editada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((erro) => {
            req.flash("error.msg", "Erro interno")
            res.redirect("/admin/postagens")
        })
    }
    }).catch((erro) => {
        console.log(erro)
        req.flash("error_msg", "Houve um erro ao salvar a edição")
        res.redirect("/admin/postagens")
    })
})

router.get("/postagem/deletar/:id", eAdmin, (req, res) =>{
    Postagem.findOneAndDelete({_id: req.params.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso!")
        res.redirect("/admin/postagens")
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao excluir a postagem")
        res.redirect("/admin/categorias")
    })
})

module.exports = router 